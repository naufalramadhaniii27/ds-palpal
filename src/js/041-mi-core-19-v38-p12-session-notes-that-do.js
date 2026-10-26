/* v38 p12: Session Notes that do not fit page 3 go on continuation pages; the footers get the right "Page n of N" */
function psSplit(){ var ps=document.getElementById("ps"); if(!ps) return; var last=ps.lastElementChild, LIM=1123;
  if(last&&last.scrollHeight>LIM+1){ var nt=last.querySelector('.ps-note[data-nk="session"]'); if(nt&&nt.textContent){ var ln=nt.textContent.split("\n"), keep=ln.slice(), rest=[];
    while(last.scrollHeight>LIM&&keep.length>1){ rest.unshift(keep.pop()); nt.textContent=keep.join("\n"); }
    var title=(last.querySelector(".ps-foot span")||{}).textContent||"", txt=rest.join("\n"), guard=0;
    while(txt&&guard++<10){ var pg=document.createElement("div"); pg.className="ps-page grow"; pg.innerHTML='<div class="ps-box"><div class="ps-h">SESSION NOTES (CONTINUED)</div><div class="ps-note"></div></div><div class="ps-foot"><span>'+esc(title)+'</span><span></span></div>'; ps.appendChild(pg);
      var n2=pg.querySelector(".ps-note"); n2.textContent=txt; var l2=txt.split("\n"), k2=l2.slice(), r2=[]; while(pg.scrollHeight>LIM&&k2.length>1){ r2.unshift(k2.pop()); n2.textContent=k2.join("\n"); } txt=r2.join("\n"); } } }
  var all=Array.prototype.slice.call(ps.querySelectorAll(".ps-page")); all.forEach(function(p,i){ var f=p.querySelectorAll(".ps-foot span"); if(f.length>1) f[f.length-1].textContent="Page "+(i+1)+" of "+all.length; }); }
/* v24 M3: a page whose content runs a little past the page gets tighter, so nothing is cut and no extra sheet comes out */
function psFit(){ Array.prototype.slice.call(document.querySelectorAll("#ps .ps-page")).forEach(function(p){ var lim=function(){ return p.classList.contains("grow")?1123:p.clientHeight; }; if(p.scrollHeight<=lim()) return;/* R2-3: a growing page must fit one A4 sheet too */
  p.style.paddingTop="20px"; p.style.paddingBottom="20px"; var n=+((/ps-t(\d)/.exec(p.className)||[0,0])[1]); while(p.scrollHeight>lim()&&n<6){ p.classList.remove("ps-t"+n); n++; p.classList.add("ps-t"+Math.min(n,4)); Array.prototype.slice.call(p.querySelectorAll(".ps-note")).forEach(function(x){ var h=parseFloat(x.style.minHeight)||0; if(h>28) x.style.minHeight=Math.round(h*.82)+"px"; }); }/* writing space shrinks a little too */ });
  if(!psFit.w&&document.fonts&&document.fonts.status!=="loaded"&&document.fonts.ready){ psFit.w=1; document.fonts.ready.then(function(){ psFit(); }); } }
window.addEventListener("beforeprint",function(){ try{ psFit(); }catch(e){} });/* fonts that load late make the text taller */
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

/* ================= INIT ================= */
/* v18 RU78: the character list must be readable too, or rEnsure() would start a new one over it */
(function(){ var r=lsGet(RKEY); if(r!=null){ try{ var p=JSON.parse(r); if(!p||typeof p!=="object"||!p.chars||typeof p.chars!=="object"||Array.isArray(p.chars)) throw new Error("the character list has a shape this version does not know"); }catch(e){ BAD.push("Character list: "+((e&&e.message)||e)); } } })();
/* v25 RU38 no. 3: Manage Spells button and the search box of the panel */
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-spman]"); if(b){ e.preventDefault(); openSpMan(); } });
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-spcards],[data-pin],[data-oldn],#srchBtn,#srchFab"); if(!t) return; e.preventDefault();/* v27 */
  if(t.id==="srchBtn"||t.id==="srchFab"){ openSearch(); return; } if(t.dataset.spcards){ printCards(); return; } if(t.dataset.pin){ e.stopPropagation(); pinToggle(t.dataset.pin); return; }
  if(t.dataset.oldn==="ok"){ S.updSeen=APP_VER; save(); var on=document.getElementById("oldNote"); if(on) on.innerHTML=""; return; } if(t.dataset.oldn==="bld"&&window.__bldOpen) window.__bldOpen(); },true);
var gsT=0; document.addEventListener("input",function(e){ if(e.target&&e.target.id==="gsQ"){ gsQ=e.target.value; clearTimeout(gsT); gsT=setTimeout(gsRefresh,120); } });/* v29 RU126 */
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-cust]"); if(b){ e.preventDefault(); showEntry({type:"cust",key:b.getAttribute("data-cust"),n:b.getAttribute("data-custn")}, true); } });/* v26 RU38 no. 2 */
document.addEventListener("input",function(e){ if(e.target&&e.target.id==="spmQ"){ spmQ=e.target.value; spmRefresh(); } });
/* v30 p07: Exhaustion to a level (stepper and palette). Level 6 is death, leaving 6 brings Hit Points back (v29 RU127) */
function exhTo(v,quiet){ var exh0=num(S.exh,0); S.exh=clamp(Math.round(num(v,0)),0,6);
  if(S.exh===6&&exh0<6){ S.exhPrev={hp:S.hp,tmp:S.tmp,ds:(S.ds||[0,0]).slice()}; S.hp=0; S.tmp=0; S.ds=[0,3]; }
  else if(exh0===6&&S.exh<6&&S.exhPrev){ S.hp=S.exhPrev.hp; S.tmp=S.exhPrev.tmp; S.ds=S.exhPrev.ds; delete S.exhPrev; }
  save(); renderAll(); renderConds(); syncHP(); if(S.exh===6&&!quiet) toast("Exhaustion 6: your character dies"); }
/* v30 p07 RU130: palette keys. Ctrl+K or Cmd+K opens Search from anywhere on the sheet, arrows choose, Enter runs, Tab fills a command that needs a number */
document.addEventListener("keydown",function(e){ if(!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey||String(e.key).toLowerCase()!=="k") return;
  if(document.querySelector(".ask, #recov, #homeV:not([hidden])")) return; var bl=$("#bld"); if(bl&&!bl.hidden) return; e.preventDefault();
  if(sheet.classList.contains("on")&&sheetMode==="search"){ var q=$("#gsQ"); if(q){ q.focus(); try{ q.select(); }catch(er){} } return; } openSearch(); },true);
document.addEventListener("keydown",function(e){ var q=e.target; if(!q||q.id!=="gsQ") return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); gsSync(); var L=gsRows(); if(!L.length) return; gsSel=(gsSel+(e.key==="ArrowDown"?1:-1)+L.length)%L.length; gsMark(true); return; }
  if(e.key==="Enter"){ e.preventDefault(); gsSync(); var r=gsRows()[gsSel]; if(r) r.click(); return; }
  if(e.key==="Tab"&&!e.shiftKey){ var c0=$("#sheetBody .gs-c.sel"), pc=c0&&PAL[+c0.getAttribute("data-cmd")]; if(pc&&pc.fill&&q.value.trim().toLowerCase()+" "!==pc.fill){ e.preventDefault(); palFill(pc.fill); } } });
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-cmd],[data-gsfill]"); if(!b||!b.closest("#sheetBody")) return; e.preventDefault();
  if(b.hasAttribute("data-gsfill")){ palFill(b.getAttribute("data-gsfill")); return; } var c=PAL[+b.getAttribute("data-cmd")]; if(!c) return; if(c.fill){ palFill(c.fill); return; } if(c.run) c.run(); });
window.__pal=function(q){ return palCmds(String(q||"").trim().toLowerCase()).map(function(c){ return c.t+" | "+(c.s||""); }); };
window.__fz=function(q,s){ return fzScore(String(q).toLowerCase(),s); };
/* v30 p09 RU130: drag the HP number up or down to set the amount (Heal or Damage still decides), hold it or right-click for a quick menu */
function hpAmtV(){ var v=parseInt(($("#hpAmt")||{}).value,10); return isNaN(v)?0:Math.max(0,v); }
function hpAmtSet(n){ var v=n?String(n):""; ["hpAmt","qmAmt","ohAmt"].forEach(function(id){ var i=document.getElementById(id); if(i&&i.value!==v) i.value=v; }); }
function qmClose(){ var w=document.getElementById("hpQm"); if(w){ w.remove(); document.removeEventListener("pointerdown",qmOut,true); document.removeEventListener("keydown",qmKey,true); } }
function qmOut(e){ var w=document.getElementById("hpQm"); if(w&&!w.contains(e.target)) qmClose(); }
function qmKey(e){ if(e.key==="Escape"){ e.stopPropagation(); qmClose(); } if(e.key==="Enter"&&e.target&&e.target.id==="qmAmt"){ e.preventDefault(); qmRun(e.shiftKey?"heal":"dmg"); } }
function qmRun(k){ var i=document.getElementById("qmAmt"), n=i?Math.max(0,parseInt(i.value,10)||0):0; if(!n){ toast("Type an amount first."); if(i) i.focus(); return; }
  qmClose(); var a=$("#hpAmt"); if(!a) return; a.value=String(n); var b=k==="heal"?$("#healBtn"):k==="dmg"?$("#dmgBtn"):$("[data-tmpset]"); if(b) b.click(); }
function qmOpen(el){ qmClose(); if(!D||!D.hpmax) return; var w=document.createElement("div"), a=hpAmtV(); w.id="hpQm"; w.className="hp-qm"; w.setAttribute("role","dialog"); w.setAttribute("aria-label","Hit Points quick menu"); w.tabIndex=-1;
  w.innerHTML='<div class="qm-h">'+ico("hp-heal","qm-hi")+'<b>'+num(S.hp,0)+'</b><span>/ '+D.hpmax+(S.tmp?' <i>+'+S.tmp+' temp</i>':'')+'</span><button type="button" class="qm-x press" data-qm="x" aria-label="Close">'+ico("ui-close")+'</button></div>'+
    '<div class="qm-a"><input id="qmAmt" type="number" inputmode="numeric" min="0" placeholder="Amount" aria-label="Amount" value="'+(a||"")+'"><button type="button" class="qm-p press" data-qmadd="1" aria-label="Add 1">'+ico("ui-plus")+'1</button><button type="button" class="qm-p press" data-qmadd="5" aria-label="Add 5">'+ico("ui-plus")+'5</button><button type="button" class="qm-p press" data-qmadd="10" aria-label="Add 10">'+ico("ui-plus")+'10</button></div>'+
    '<div class="qm-b"><button type="button" class="btn press qm-heal" data-qm="heal">'+ico("hp-heal")+'Heal</button><button type="button" class="btn press qm-dmg" data-qm="dmg">'+ico("hp-damage")+'Damage</button><button type="button" class="btn press qm-tmp" data-qm="temp">'+ico("hp-temp")+'Temp HP</button></div>';
  document.body.appendChild(w); var r=el.getBoundingClientRect(), W=w.offsetWidth, H=w.offsetHeight, vw=document.documentElement.clientWidth, vh=window.innerHeight, x=Math.max(12,Math.min(vw-W-12,r.left+r.width/2-W/2));
  w.style.left=x+"px"; if(r.top>H+20) w.style.top=Math.round(r.top-H-8)+"px"; else w.style.top=Math.round(Math.min(vh-H-12,r.bottom+8))+"px";
  w.addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b) return; if(b.hasAttribute("data-qmadd")){ var q=document.getElementById("qmAmt"); hpAmtSet((parseInt(q.value,10)||0)+(+b.getAttribute("data-qmadd"))); return; } var k=b.getAttribute("data-qm"); if(k==="x"){ qmClose(); return; } if(k) qmRun(k); });
  w.addEventListener("input",function(e){ if(e.target.id==="qmAmt"){ var v=parseInt(e.target.value,10); var h=$("#hpAmt"); if(h) h.value=isNaN(v)?"":String(Math.max(0,v)); } });
  setTimeout(function(){ document.addEventListener("pointerdown",qmOut,true); document.addEventListener("keydown",qmKey,true); },0); try{ w.focus({preventScroll:true}); }catch(er){} }
(function(){ var TH=8, STEP=12, HOLD=500, st=null, bub=null, supT=0;
  function bubble(el,n){ if(!bub){ bub=document.createElement("div"); bub.id="hpGest"; bub.className="hp-gest"; bub.setAttribute("aria-hidden","true"); document.body.appendChild(bub); }
    var r=el.getBoundingClientRect(); bub.innerHTML='<b>'+n+'</b><span>Amount. Now tap Heal or Damage</span>'; bub.style.left=Math.round(Math.max(110,Math.min(document.documentElement.clientWidth-110,r.left+r.width/2)))+"px"; bub.style.top=Math.round(Math.max(70,r.top-10))+"px"; bub.classList.add("on"); }
  function down(e){ if(e.button>0||!D||!D.hpmax) return; var el=e.currentTarget; if(st) clearTimeout(st.t); st={el:el,x:e.clientX,y:e.clientY,id:e.pointerId,a0:hpAmtV(),m:"",n:null};
    st.t=setTimeout(function(){ if(st&&!st.m){ st.m="hold"; qmOpen(st.el); buzz(10); } },HOLD); }
  function move(e){ if(!st||e.pointerId!==st.id) return; var dx=e.clientX-st.x, dy=e.clientY-st.y;
    if(!st.m){ if(Math.abs(dy)>TH&&Math.abs(dy)>Math.abs(dx)*1.4){ st.m="drag"; clearTimeout(st.t); st.y=e.clientY; try{ st.el.setPointerCapture(e.pointerId); }catch(er){} } else if(Math.abs(dx)>TH||Math.abs(dy)>TH){ clearTimeout(st.t); st=null; } return; }
    if(st.m==="drag"){ e.preventDefault(); var n=Math.max(0,Math.min(999,st.a0+Math.round((st.y-e.clientY)/STEP))); if(n!==st.n){ st.n=n; hpAmtSet(n); bubble(st.el,n); } } }
  function up(e){ if(!st||e.pointerId!==st.id) return; clearTimeout(st.t); var s0=st; st=null; if(!s0.m) return; supT=Date.now();
    if(s0.m==="drag"){ setTimeout(function(){ if(bub) bub.classList.remove("on"); },700); if(s0.n&&s0.el.id==="vbHp") hpOpen(); } }
  function cancel(e){ if(st&&(!e||e.pointerId===st.id)){ clearTimeout(st.t); st=null; } if(bub) bub.classList.remove("on"); }
  ["hpCur","vbHp"].forEach(function(id){ var el=document.getElementById(id); if(!el) return; el.classList.add("hp-g"); if(id==="hpCur") el.title="Drag up or down to set the amount. Hold for a quick menu.";
    el.addEventListener("pointerdown",down); el.addEventListener("pointermove",move); el.addEventListener("pointerup",up); el.addEventListener("pointercancel",cancel);
    el.addEventListener("contextmenu",function(e){ e.preventDefault(); supT=Date.now(); if(st){ clearTimeout(st.t); st.m="hold"; } if(!document.getElementById("hpQm")) qmOpen(el); }); });
  document.addEventListener("click",function(e){ if(Date.now()-supT<450&&e.target.closest&&e.target.closest("#hpCur,#vbHp")){ e.preventDefault(); e.stopPropagation(); } },true);
})();
/* v30 p10 RU130: a small Hit Points window that stays on top of other windows (Document Picture-in-Picture, Chrome and Edge on computers) */
var PIP=null;
var PIP_CSS='*{box-sizing:border-box}html,body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--f-sans);font-size:14px}body{padding:10px;display:flex;flex-direction:column;gap:8px;-webkit-font-smoothing:antialiased}'+
  'svg{width:16px;height:16px;flex:none}.pp-top{display:flex;align-items:center;gap:8px}.pp-hp{display:flex;align-items:baseline;gap:4px;min-width:0}.pp-hp svg{color:var(--bad);align-self:center}.pp-hp b{font:700 40px/1 var(--f-nar)}.pp-hp b.z{color:var(--bad)}.pp-hp>span{font:600 16px/1 var(--f-nar);color:var(--muted)}'+
  '.pp-tmp{font:700 16px/1 var(--f-nar);color:#7fb2ff}.pp-ac{margin-left:auto;display:flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--line-2);border-radius:var(--r2,8px);font:700 20px/1 var(--f-nar)}.pp-ac svg{color:var(--muted)}'+
  '.pp-bar{position:relative;height:6px;border-radius:4px;background:var(--line-2);overflow:hidden}.pp-bar i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:left center;background:var(--good);transition:transform .3s ease-out}'+
  '.pp-row{display:flex;gap:6px}input{flex:1;min-width:0;height:44px;text-align:center;font:700 20px/1 var(--f-nar);background:var(--panel);color:var(--ink);border:1px solid var(--line-2);border-radius:var(--r1,4px)}'+
  'button{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;font:700 16px/1 var(--f-nar);background:var(--panel-2);color:var(--ink);border:1px solid var(--line-2);border-radius:var(--r2,8px);cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid var(--acc);outline-offset:1px}'+
  '.pp-sq{width:44px;padding:0}.pp-heal,.pp-dmg,.pp-tb{flex:1}.pp-heal{background:var(--good);border-color:var(--good);color:#fff}.pp-dmg{background:var(--bad);border-color:var(--bad);color:#fff}'+
  '.pp-c{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.pp-k{font:700 12px/1 var(--f-nar);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-right:2px}.pp-c button{min-height:36px;font:600 14px/1 var(--f-sans);padding:0 10px}.pp-c .on{border-color:var(--warn,#e2aa4c);color:#fff;background:color-mix(in srgb,var(--warn,#e2aa4c) 18%,var(--panel-2))}.pp-none{color:var(--faint);font-size:14px}'+
  ':root[data-skin="ddb"] .pp-heal{background:#24804a;border-color:#24804a}:root[data-skin="ddb"] .pp-dmg{background:#b8362c;border-color:#b8362c}input::-webkit-inner-spin-button,input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input{appearance:textfield}'+
  '.pp-ct{min-height:32px!important;min-width:32px;padding:0 8px!important;font:700 13px/1 var(--f-nar)!important}.pp-ct.on{border-color:#ffb020;background:color-mix(in srgb,#ffb020 18%,var(--panel-2))}.pp-cl{flex-basis:100%;display:flex;flex-direction:column;gap:4px;margin-top:2px}.pp-cr{display:flex;align-items:center;gap:6px;padding:4px 6px;border:1px solid var(--line-2);border-left:3px solid #ffb020;border-radius:var(--r1,4px)}.pp-cr.emp{border-left-color:var(--line-2);opacity:.7}.pp-cr.dn{opacity:.5}.pp-cs{flex:none;width:44px;font:700 10px/1.1 var(--f-nar);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.pp-cn{flex:1;min-width:0;font:600 14px/1.2 var(--f-sans);display:flex;flex-direction:column}.pp-cn small{font:500 12px/1.2 var(--f-sans);color:var(--muted)}.pp-c .pp-cu,.pp-cl .pp-cu{min-height:32px;padding:0 10px;font:700 13px/1 var(--f-nar)}'+'@media (prefers-reduced-motion:reduce){.pp-bar i{transition:none}}';
function pipVars(){ var cs=getComputedStyle(document.documentElement); return ":root{"+["--paper","--panel","--panel-2","--line","--line-2","--ink","--muted","--faint","--acc","--bad","--good","--warn","--f-sans","--f-nar","--r1","--r2"].map(function(k){ return k+":"+(cs.getPropertyValue(k)||"initial"); }).join(";")+";color-scheme:dark light}"; }
function pipFonts(){ var cs=getComputedStyle(document.documentElement), fam=(cs.getPropertyValue("--f-sans")+","+cs.getPropertyValue("--f-nar")).toLowerCase(), out="";
  try{ Array.prototype.forEach.call(document.styleSheets,function(sh){ try{ Array.prototype.forEach.call(sh.cssRules,function(r){ if(r.type!==5) return; var f=String(r.style.getPropertyValue("font-family")||"").replace(/["']/g,"").trim().toLowerCase(); if(f&&fam.indexOf(f)>=0) out+=r.cssText+"\n"; }); }catch(er){} }); }catch(er){} return out; }
function pipHTML(){ return '<div class="pp-top"><div class="pp-hp">'+ico("hp-heal")+'<b id="ppHp">0</b><span>/ <span id="ppMax">0</span></span><span class="pp-tmp" id="ppTmp"></span></div><div class="pp-ac" title="Armor Class">'+ico("ui-shield")+'<span id="ppAc">0</span></div></div>'+
  '<div class="pp-bar" aria-hidden="true"><i id="ppBar"></i></div>'+
  '<div class="pp-row"><button type="button" class="pp-sq" data-pp="minus" aria-label="Lower the amount">'+ico("ui-minus")+'</button><input id="ppAmt" type="number" inputmode="numeric" min="0" placeholder="Amount" aria-label="Amount"><button type="button" class="pp-sq" data-pp="plus" aria-label="Raise the amount">'+ico("ui-plus")+'</button></div>'+
  '<div class="pp-row"><button type="button" class="pp-heal" data-pp="heal">'+ico("hp-heal")+'Heal</button><button type="button" class="pp-dmg" data-pp="dmg">'+ico("hp-damage")+'Damage</button><button type="button" class="pp-tb" data-pp="temp">'+ico("hp-temp")+'Temp</button></div>'+
  '<div class="pp-c" id="ppCond"></div><div class="pp-c" id="ppCmb"></div>'; }
function pipSync(){ var w=PIP; if(!w||!D||!D.hpmax) return; var d=w.document, g=function(i){ return d.getElementById(i); }; if(!g("ppHp")) return;
  var hp=clamp(num(S.hp,0),0,D.hpmax), tp=Math.max(0,num(S.tmp,0)), p=clamp(hp/D.hpmax,0,1);
  g("ppHp").textContent=hp; g("ppHp").classList.toggle("z",hp===0); g("ppMax").textContent=D.hpmax; g("ppTmp").textContent=tp?"+"+tp+" temp":""; g("ppAc").textContent=D.ac;
  var b=g("ppBar"); b.style.transform="scaleX("+p+")"; b.style.backgroundColor=barColor(p);
  var L=activeConds().map(function(c){ return c.k; }), h='<span class="pp-k">Conditions</span>';
  if(S.exh) h+='<button type="button" class="on" data-ppexh="1" title="Lower Exhaustion by 1">'+ico("cond-exhaustion")+'Exhaustion '+S.exh+'</button>';
  h+=L.map(function(k){ return '<button type="button" class="on" data-ppc="'+esc(k)+'" title="Remove '+esc(k)+'">'+(ico("cond-"+k.toLowerCase())||"")+esc(k)+ico("ui-close")+'</button>'; }).join("");
  if(!L.length&&!S.exh) h+='<span class="pp-none">None</span>'; h+='<button type="button" data-pp="cond">'+ico("ui-plus")+'Edit</button>';
  var c=g("ppCond"); if(c.innerHTML!==h) c.innerHTML=h; var cm=g("ppCmb"), ch=cmbPipH(); if(cm&&cm.innerHTML!==ch) cm.innerHTML=ch; d.title=(C.name||"Character")+": "+hp+" / "+D.hpmax+" HP"; }
function pipAmt(){ var i=PIP&&PIP.document.getElementById("ppAmt"); var n=i?parseInt(i.value,10):0; return isNaN(n)?0:Math.max(0,n); }
function pipAct(k){ var d=PIP&&PIP.document; if(!d) return; var i=d.getElementById("ppAmt"), n=pipAmt();
  if(k==="minus"||k==="plus"){ n=Math.max(0,n+(k==="plus"?1:-1)); i.value=n?String(n):""; return; }
  if(k==="cond"){ try{ window.focus(); }catch(er){} showEntry({type:"cond"},false); return; }
  if(!n){ i.focus(); return; } var a=$("#hpAmt"); if(!a) return; a.value=String(n); var b=k==="heal"?$("#healBtn"):k==="dmg"?$("#dmgBtn"):$("[data-tmpset]"); if(b) b.click(); i.value=""; i.focus(); }
function pipOpen(){ if(PIP){ try{ PIP.close(); }catch(er){} return; } if(!window.documentPictureInPicture) return;
  documentPictureInPicture.requestWindow({width:340,height:470}).then(function(w){ PIP=w; window.__pipWin=w; var d=w.document;
    var st=d.createElement("style"); st.textContent=pipFonts()+PIP_CSS; d.head.appendChild(st); var sv=d.createElement("style"); sv.id="ppVars"; sv.textContent=pipVars(); d.head.appendChild(sv);
    ["data-theme","data-skin"].forEach(function(a){ var v=document.documentElement.getAttribute(a); if(v) d.documentElement.setAttribute(a,v); });
    d.body.innerHTML=pipHTML(); if(window.__miPip) try{ window.__miPip(w); }catch(er){} d.addEventListener("click",cmbPipClick);
    d.addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b) return; if(b.hasAttribute("data-ppc")){ condSet(b.getAttribute("data-ppc"),false); return; } if(b.hasAttribute("data-ppexh")){ undoMark("Exhaustion"); exhTo(num(S.exh,0)-1,true); toastU("Exhaustion "+S.exh+"."); return; } var k=b.getAttribute("data-pp"); if(k) pipAct(k); });
    d.addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.id==="ppAmt"){ e.preventDefault(); pipAct(e.shiftKey?"heal":"dmg"); } });
    w.addEventListener("pagehide",function(){ PIP=null; window.__pipWin=null; var pb=$("#pipBtn"); if(pb) pb.setAttribute("aria-pressed","false"); });
    var pb=$("#pipBtn"); if(pb) pb.setAttribute("aria-pressed","true"); pipSync(); },function(){ toast("The mini window could not open. Try again from the Mini Window button."); }); }
(function(){ var pb=$("#pipBtn"); if(!pb) return; if(window.documentPictureInPicture&&typeof documentPictureInPicture.requestWindow==="function"){ pb.hidden=false; pb.title="Mini window"; pb.addEventListener("click",function(){ if(window.__moreSet) try{ window.__moreSet(false); }catch(er){} pipOpen(); }); } else pb.remove(); })();
