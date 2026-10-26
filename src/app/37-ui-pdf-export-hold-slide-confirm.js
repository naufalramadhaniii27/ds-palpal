/* ================= PDF EXPORT ================= */
var LIBS = [
  "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"
];
var libsP=null;
function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.async=true; s.onload=res; s.onerror=function(){rej(new Error("load "+src))}; document.head.appendChild(s); }); }
function loadLibs(){ if(!libsP){ libsP = loadScript(LIBS[0]).then(function(){return loadScript(LIBS[1])}); libsP.catch(function(){libsP=null}); } return libsP; }
var downloadsP = (window.claude && typeof window.claude.use==="function") ? window.claude.use("downloads").catch(function(){return null}) : Promise.resolve(null);
function makePdfBlob(){
  buildPrint();
  var wrap=$("#psWrap");
  return (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function(){
    var pages=$$(".ps-page",wrap), pdf=new window.jspdf.jsPDF({unit:"pt",format:"a4",orientation:"portrait",compress:true});
    var W=pdf.internal.pageSize.getWidth(), H=pdf.internal.pageSize.getHeight();
    var chain=Promise.resolve(), firstPage=true;
    pages.forEach(function(pg){
      chain=chain.then(function(){
        return window.html2canvas(pg,{scale:2,backgroundColor:"#ffffff",useCORS:true,logging:false,windowWidth:1200,
          onclone:function(doc){ var w=doc.getElementById("psWrap"); if(w){ w.style.cssText="position:static;width:auto;height:auto;overflow:visible"; } doc.documentElement.removeAttribute("data-skin"); doc.documentElement.style.background="#fff"; doc.body.style.cssText="background:#fff;background-image:none"; }/* v38 p12: white paper in the PDF */
        }).then(function(cv){
          var sliceH = Math.round(cv.width * H / W), y = 0;
          while(y < cv.height - 4){
            var h = Math.min(sliceH, cv.height - y);
            var part = document.createElement("canvas"); part.width = cv.width; part.height = sliceH;
            var ctx = part.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,part.width,part.height);
            ctx.drawImage(cv, 0, y, cv.width, h, 0, 0, cv.width, h);
            if(!firstPage) pdf.addPage();
            pdf.addImage(part.toDataURL("image/jpeg",.92),"JPEG",0,0,W,H);
            y += sliceH; firstPage = false;
          }
        });
      });
    });
    return chain.then(function(){ return pdf.output("blob"); });
  });
}
function printFallback(){ buildPrint(); setTimeout(function(){ window.print(); },60); }
$("#pdfBtn").addEventListener("click",function(){
  var busy=$("#busy");
  downloadsP.then(function(dl){
    if(!dl){ printFallback(); return; }
    busy.classList.add("on");
    return loadLibs().then(makePdfBlob).then(function(blob){
      busy.classList.remove("on");
      return dl.save({filename:(C.name||"character").replace(/[^A-Za-z0-9]+/g,"-")+"-"+C.cls+D.level+".pdf", data:blob}).then(function(r){
        if(r && r.status==="saved") toast("PDF saved");
      }).catch(function(err){
        var c=err&&err.code;
        if(c==="declined") return;
        if(c==="rate_limited"){ toast("A save prompt is already open"); return; }
        toast("Saving isn't available here. Opening the print dialog"); printFallback();
      });
    }).catch(function(){
      busy.classList.remove("on");
      toast("The PDF couldn't be built. Opening the print dialog"); printFallback();
    });
  });
});

/* === hold-to-confirm delete: press and hold ~620ms fills the button, then releasing deletes right away.
   A quick tap without holding falls back to the original two-tap confirm, so keyboard activation (Enter/Space) still works.
   v55b: a hold that ends off the button no longer leaves the button armed for the next tap. === */
(function(){ var HOLD_MS=620, active=null;
  function start(btn){ if(active===btn) return; cancel(); if(btn.disabled) return; active=btn; btn.classList.add("holding"); btn.classList.remove("held");
    btn.__holdT=setTimeout(function(){ if(active!==btn) return; btn.dataset.heldDone="1"; btn.classList.add("held"); if(typeof buzz==="function") buzz([14,30,14]); },HOLD_MS); }
  function cancel(){ if(!active) return; var b=active; active=null; clearTimeout(b.__holdT); b.classList.remove("holding","held"); delete b.dataset.heldDone; }
  document.addEventListener("pointerdown",function(e){ if(e.button>0) return; var b=e.target.closest&&e.target.closest(".holdc"); if(b) start(b); });
  /* on the button the click comes right after pointerup, so the reset waits one tick and the click still sees the finished hold */
  document.addEventListener("pointerup",function(e){ var b=e.target.closest&&e.target.closest(".holdc"); if(b&&b===active) setTimeout(cancel,0); else cancel(); });
  document.addEventListener("pointercancel",cancel); window.addEventListener("blur",cancel);
  document.addEventListener("scroll",cancel,true);
  document.addEventListener("contextmenu",function(e){ if(e.target.closest&&e.target.closest(".holdc")) e.preventDefault(); });
})();

/* === slide-to-confirm for Short Rest and Long Rest: drag the handle to the end. Dropped short, it springs back.
   Keyboard: Enter, Space, or the Right arrow on the handle confirm. If the rest is refused (for example a Hit Die without a roll), the slider resets. === */
(function(){ var el=null,handle=null,maxX=0,startX=0,curX=0,dragging=false;
  function label(w,t){ var lb=w.querySelector(".slidec-label"); if(lb) lb.textContent=t; }
  function reset(w){ var h=w.querySelector(".slidec-h"); w.classList.remove("dragging","committing","done"); w.style.setProperty("--sp","0"); if(h){ h.style.transform="translateX(0px)"; var sv=h.querySelector("svg path"); if(sv) sv.setAttribute("d","M5 12h14M13 6l6 6-6 6"); }
    label(w,w.getAttribute("data-label")||""); }
  function commit(w,h){ var kind=w.getAttribute("data-slide-go"), mx=w.clientWidth-h.offsetWidth-6;
    h.style.transform="translateX("+mx+"px)"; w.style.setProperty("--sp","1"); w.classList.add("committing"); label(w,"Resting…");
    setTimeout(function(){ w.classList.remove("committing"); w.classList.add("done"); label(w,"Rested"); var sv=h.querySelector("svg path"); if(sv) sv.setAttribute("d","M5 12.5l4.5 4.5L19 7.5"); if(typeof buzz==="function") buzz([10,40,18]);
      setTimeout(function(){ takeRest(kind); if(document.querySelector("#sheet.on #restDlg")&&w.isConnected){ reset(w); return; }/* refused: the dialog is still open */
        try{ document.dispatchEvent(new CustomEvent("mi:rest",{detail:kind})); }catch(er){} },120); },240); }
  function usable(w,h){ return w&&!w.classList.contains("off")&&!w.classList.contains("done")&&!w.classList.contains("committing")&&!h.disabled; }
  document.addEventListener("pointerdown",function(e){ if(e.button>0) return;
    var h=e.target.closest&&e.target.closest(".slidec-h"); if(!h) return; var w=h.closest(".slidec"); if(!usable(w,h)) return;
    el=w; handle=h; maxX=w.clientWidth-h.offsetWidth-6; startX=e.clientX; curX=0; dragging=true; w.classList.add("dragging");
    try{ h.setPointerCapture(e.pointerId); }catch(er){} });
  document.addEventListener("pointermove",function(e){ if(!dragging||!el) return; curX=Math.max(0,Math.min(maxX,e.clientX-startX));
    handle.style.transform="translateX("+curX+"px)"; el.style.setProperty("--sp",String(maxX?curX/maxX:0)); });
  function finish(){ if(!dragging||!el) return; dragging=false; var w=el,h=handle; el=null; handle=null; w.classList.remove("dragging");
    if(maxX>0&&curX>=maxX*0.88) commit(w,h); else { h.style.transform="translateX(0px)"; w.style.setProperty("--sp","0"); } }
  document.addEventListener("pointerup",finish); document.addEventListener("pointercancel",finish);
  document.addEventListener("keydown",function(e){ var h=e.target.closest&&e.target.closest(".slidec-h"); if(!h) return; if(e.key!=="Enter"&&e.key!==" "&&e.key!=="ArrowRight") return; e.preventDefault(); var w=h.closest(".slidec"); if(usable(w,h)) commit(w,h); });
})();

