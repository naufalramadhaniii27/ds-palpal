import {C} from "./04-logic-storage.js";
import {$,$$,toast} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {buzz} from "./09-ui-hit-points-playbar-death-saves.js";
import {takeRest} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {buildPrint} from "./36-ui-printable-sheet.js";
/* ================= PDF EXPORT ================= */
/* T11 A3: the PDF libraries come from this site (vendor/pdf), not a CDN: jsPDF 4.2.1 (fixes the 2026 advisories of the 2.x line) and
   html2canvas-pro 2.5.2 (maintained fork, reads modern colors such as color-mix and oklch). The service worker keeps them after the first use */
const LIBS = [
  "vendor/pdf/html2canvas-pro-2.5.2.min.js",
  "vendor/pdf/jspdf-4.2.1.umd.min.js"
];
let libsP=null;
function loadScript(src){ return new Promise((res,rej) =>{ const s=document.createElement("script"); s.src=src; s.async=true; s.onload=res; s.onerror=function(){rej(new Error("load "+src))}; document.head.appendChild(s); }); }
function loadLibs(){ if(!libsP){ libsP = loadScript(LIBS[0]).then(() =>{return loadScript(LIBS[1])}); libsP.catch(() =>{libsP=null}); } return libsP; }
const downloadsP = (window.claude && typeof window.claude.use==="function") ? window.claude.use("downloads").catch(() =>{return null}) : Promise.resolve(null);
function makePdfBlob(){
  buildPrint();
  const wrap=$("#psWrap");
  return (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() =>{
    const pages=$$(".ps-page",wrap), pdf=new window.jspdf.jsPDF({unit:"pt",format:"a4",orientation:"portrait",compress:true});
    const W=pdf.internal.pageSize.getWidth(), H=pdf.internal.pageSize.getHeight();
    let chain=Promise.resolve(), firstPage=true;
    const bt=document.querySelector("#busy span:last-child"), np=pages.length;/* S17 spike: progress text and a frame between pages */
    pages.forEach((pg,pi) =>{
      chain=chain.then(() =>{ if(bt) bt.textContent=np>1?"Building PDF, page "+(pi+1)+" of "+np:"Building PDF"; return new Promise((r) =>{ requestAnimationFrame(() =>{ setTimeout(r,0); }); }); }).then(() =>{
        const h2c=(window.html2canvas&&window.html2canvas.default)||window.html2canvas;/* html2canvas-pro sets a module object */
        return h2c(pg,{scale:2,backgroundColor:"#ffffff",useCORS:true,logging:false,windowWidth:1200,
          onclone:function(doc){ const w=doc.getElementById("psWrap"); if(w){ w.style.cssText="position:static;width:auto;height:auto;overflow:visible"; } doc.documentElement.removeAttribute("data-skin"); doc.documentElement.style.background="#fff"; doc.body.style.cssText="background:#fff;background-image:none"; }/* v38 p12: white paper in the PDF */
        }).then((cv) =>{
          let sliceH = Math.round(cv.width * H / W), y = 0;
          while(y < cv.height - 4){
            const h = Math.min(sliceH, cv.height - y);
            const part = document.createElement("canvas"); part.width = cv.width; part.height = sliceH;
            const ctx = part.getContext("2d"); ctx.fillStyle = "#ffffff"; ctx.fillRect(0,0,part.width,part.height);
            ctx.drawImage(cv, 0, y, cv.width, h, 0, 0, cv.width, h);
            if(!firstPage) pdf.addPage();
            pdf.addImage(part.toDataURL("image/jpeg",.92),"JPEG",0,0,W,H);
            y += sliceH; firstPage = false;
          }
        });
      });
    });
    return chain.then(() =>{ if(bt) bt.textContent="Building PDF"; return pdf.output("blob"); });
  });
}
function printFallback(){ buildPrint(); setTimeout(() =>{ window.print(); },60); }
$("#pdfBtn").addEventListener("click",() =>{
  const busy=$("#busy");
  downloadsP.then((dl) =>{
    busy.classList.add("on");
    /* T11 A3: outside the old artifact host there is no save API. The PDF is now built here too and downloaded as a file. Before, this case went straight to the print dialog */
    if(!dl) return loadLibs().then(makePdfBlob).then((blob) =>{ busy.classList.remove("on");
      const u=URL.createObjectURL(blob), a=document.createElement("a"); a.href=u; a.download=(C.name||"character").replace(/[^A-Za-z0-9]+/g,"-")+"-"+C.cls+D.level+".pdf"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); toast("PDF saved");
    }).catch(() =>{ busy.classList.remove("on"); toast("The PDF couldn't be built. Opening the print dialog"); printFallback(); });
    return loadLibs().then(makePdfBlob).then((blob) =>{
      busy.classList.remove("on");
      return dl.save({filename:(C.name||"character").replace(/[^A-Za-z0-9]+/g,"-")+"-"+C.cls+D.level+".pdf", data:blob}).then((r) =>{
        if(r && r.status==="saved") toast("PDF saved");
      }).catch((err) =>{
        const c=err&&err.code;
        if(c==="declined") return;
        if(c==="rate_limited"){ toast("A save prompt is already open"); return; }
        toast("Saving isn't available here. Opening the print dialog"); printFallback();
      });
    }).catch(() =>{
      busy.classList.remove("on");
      toast("The PDF couldn't be built. Opening the print dialog"); printFallback();
    });
  });
});

/* === hold-to-confirm delete: press and hold ~620ms fills the button, then releasing deletes right away.
   A quick tap without holding falls back to the original two-tap confirm, so keyboard activation (Enter/Space) still works.
   v55b: a hold that ends off the button no longer leaves the button armed for the next tap. === */
(function(){ let HOLD_MS=620, active=null;
  function start(btn){ if(active===btn) return; cancel(); if(btn.disabled) return; active=btn; btn.classList.add("holding"); btn.classList.remove("held");
    btn.__holdT=setTimeout(() =>{ if(active!==btn) return; btn.dataset.heldDone="1"; btn.classList.add("held"); if(typeof buzz==="function") buzz([14,30,14]); },HOLD_MS); }
  function cancel(){ if(!active) return; const b=active; active=null; clearTimeout(b.__holdT); b.classList.remove("holding","held"); delete b.dataset.heldDone; }
  document.addEventListener("pointerdown",(e) =>{ if(e.button>0) return; const b=e.target.closest&&e.target.closest(".holdc"); if(b) start(b); });
  /* on the button the click comes right after pointerup, so the reset waits one tick and the click still sees the finished hold */
  document.addEventListener("pointerup",(e) =>{ const b=e.target.closest&&e.target.closest(".holdc"); if(b&&b===active) setTimeout(cancel,0); else cancel(); });
  document.addEventListener("pointercancel",cancel); window.addEventListener("blur",cancel);
  document.addEventListener("scroll",cancel,true);
  document.addEventListener("contextmenu",(e) =>{ if(e.target.closest&&e.target.closest(".holdc")) e.preventDefault(); });
})();

/* === slide-to-confirm for Short Rest and Long Rest: drag the handle to the end. Dropped short, it springs back.
   Keyboard: Enter, Space, or the Right arrow on the handle confirm. If the rest is refused (for example a Hit Die without a roll), the slider resets. === */
(function(){ let el=null,handle=null,maxX=0,startX=0,curX=0,dragging=false;
  function label(w,t){ const lb=w.querySelector(".slidec-label"); if(lb) lb.textContent=t; }
  function reset(w){ const h=w.querySelector(".slidec-h"); w.classList.remove("dragging","committing","done"); w.style.setProperty("--sp","0"); if(h){ h.style.transform="translateX(0px)"; const sv=h.querySelector("svg path"); if(sv) sv.setAttribute("d","M5 12h14M13 6l6 6-6 6"); }
    label(w,w.getAttribute("data-label")||""); }
  function commit(w,h){ const kind=w.getAttribute("data-slide-go"), mx=w.clientWidth-h.offsetWidth-6;
    h.style.transform="translateX("+mx+"px)"; w.style.setProperty("--sp","1"); w.classList.add("committing"); label(w,"Resting…");
    setTimeout(() =>{ w.classList.remove("committing"); w.classList.add("done"); label(w,"Rested"); const sv=h.querySelector("svg path"); if(sv) sv.setAttribute("d","M5 12.5l4.5 4.5L19 7.5"); if(typeof buzz==="function") buzz([10,40,18]);
      setTimeout(() =>{ takeRest(kind); if(document.querySelector("#sheet.on #restDlg")&&w.isConnected){ reset(w); return; }/* refused: the dialog is still open */
        try{ document.dispatchEvent(new CustomEvent("mi:rest",{detail:kind})); }catch(er){} },120); },240); }
  function usable(w,h){ return w&&!w.classList.contains("off")&&!w.classList.contains("done")&&!w.classList.contains("committing")&&!h.disabled; }
  document.addEventListener("pointerdown",(e) =>{ if(e.button>0) return;
    const h=e.target.closest&&e.target.closest(".slidec-h"); if(!h) return; const w=h.closest(".slidec"); if(!usable(w,h)) return;
    el=w; handle=h; maxX=w.clientWidth-h.offsetWidth-6; startX=e.clientX; curX=0; dragging=true; w.classList.add("dragging");
    try{ h.setPointerCapture(e.pointerId); }catch(er){} });
  document.addEventListener("pointermove",(e) =>{ if(!dragging||!el) return; curX=Math.max(0,Math.min(maxX,e.clientX-startX));
    handle.style.transform="translateX("+curX+"px)"; el.style.setProperty("--sp",String(maxX?curX/maxX:0)); });
  function finish(){ if(!dragging||!el) return; dragging=false; const w=el,h=handle; el=null; handle=null; w.classList.remove("dragging");
    if(maxX>0&&curX>=maxX*0.88) commit(w,h); else { h.style.transform="translateX(0px)"; w.style.setProperty("--sp","0"); } }
  document.addEventListener("pointerup",finish); document.addEventListener("pointercancel",finish);
  document.addEventListener("keydown",(e) =>{ const h=e.target.closest&&e.target.closest(".slidec-h"); if(!h) return; if(e.key!=="Enter"&&e.key!==" "&&e.key!=="ArrowRight") return; e.preventDefault(); const w=h.closest(".slidec"); if(usable(w,h)) commit(w,h); });
})();

