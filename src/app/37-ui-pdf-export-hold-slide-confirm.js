import {C,S,clsLv} from "./04-logic-storage.js";
import {$,atkOn,eqOn,toast} from "./05-logic-helpers.js";
import {D,fill} from "./06-logic-derivation.js";
import {langText} from "./08-ui-render-sheet-and-actions.js";
import {activeConds} from "./10-ui-conditions.js";
import {buzz} from "./09-ui-hit-points-playbar-death-saves.js";
import {coinsNow,scOf,takeRest} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {cuNm} from "./26-ui-customize.js";
import {buildPrint} from "./36-ui-printable-sheet.js";
import {templatePdf} from "./lib/pdf-template.js";
/* ================= PDF EXPORT ================= */
// The original printable layout remains available only as a recovery path.
const downloadsP = (window.claude && typeof window.claude.use==="function") ? window.claude.use("downloads").catch(() => null) : Promise.resolve(null);
function pdfPlain(text){ return String(text||"").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,l) => l||k).replace(/\*\*/g,"").replace(/<[^>]*>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,"&"); }
function pdfProficiencies(c){return pdfPlain(["Armor: "+(c.profs||{}).armor,"Weapons: "+(c.profs||{}).weapons,"Tools: "+(c.profs||{}).tools,"Languages: "+langText()].join("\n"));}
function pdfAttacks(c,d){return (c.attacks||[]).map((a,i) => ({a,i})).filter(x => atkOn(x.a)).map(({a,i}) => ({name:cuNm("a:"+a.n,a.n),hit:d.atk[i].hit,damage:d.atk[i].dmg+" "+(a.type||""),range:a.range,note:pdfPlain(a.note)}));}
function pdfEquipment(c){return (c.inv||[]).map(it => (it.q||1)+" x "+it.n+(eqOn(it)?" [equipped]":"")+(it.att?" [attunement]":"")).concat(c.equipNote||[]).join("\n");}
function pdfFeatures(c){return (c.features||[]).map(g => (g.items||[]).map(f => f.n+(f.s?" ("+f.s+")":"")+": "+pdfPlain(fill(f.d))).concat(g.next||[]).join("\n")).join("\n\n");}
function pdfResources(s,d){return (d.res||[]).map(r => r.n+": "+Math.max(0,r.max-((s.used||{})[r.k]||0))+" / "+r.max+(r.tag?" ("+r.tag+")":"")).concat(activeConds().map(x => x.k+(x.extra||"")),s.exh?"Exhaustion: "+s.exh:[]).join("\n");}
function pdfDetails(c){return [c.sub?"Subclass: "+c.sub:"",c.size?"Size: "+c.size:"",c.darkvision?"Darkvision: "+c.darkvision+" ft":"",...(c.defenses||[]).map(x => x.t+": "+x.v),...(c.actions||[]).filter(x => x.hb).map(x => x.n+": "+pdfPlain(fill(x.d)))].filter(Boolean).join("\n");}
function pdfCasting(c,sc){return {label:c.spellcasting||(c.spells||[]).length?clsLv():"",ability:sc.ab||"",dc:sc.dc == null?"":sc.dc,attack:sc.atk == null?"":(sc.atk>=0?"+":"")+sc.atk};}
function pdfSpells(c){return (c.spells||[]).map(x => {const n=scOf(x);return {name:x.n,level:x.l||0,prepared:true,details:[x.n,"level "+(x.l||0),x.src,x.ab,x.use,x.sv==="ATK"?"attack "+(n.atk>=0?"+":"")+n.atk:x.sv?x.sv+" DC "+n.dc:"",x.time,x.range].filter(Boolean).join(" | ")};});}
async function portraitPng(src){
  if(!src) return null;
  try{ const image=new Image(); image.crossOrigin="anonymous";
    await new Promise((resolve,reject) => { const timer=setTimeout(() => reject(new Error("Portrait timeout")),8000); image.onload=() => {clearTimeout(timer);resolve();}; image.onerror=() => {clearTimeout(timer);reject(new Error("Portrait unavailable"));}; image.src=src; });
    const scale=Math.min(1,1000/Math.max(image.naturalWidth,image.naturalHeight)), canvas=document.createElement("canvas");
    canvas.width=Math.max(1,Math.round(image.naturalWidth*scale)); canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
    canvas.getContext("2d").drawImage(image,0,0,canvas.width,canvas.height); return canvas.toDataURL("image/png");
  }catch(error){ return null; }
}
async function makePdfBlob(){
  // Capture the open character before awaiting assets or image loading.
  const c=structuredClone(C), s=structuredClone(S), d=structuredClone(D), sc=scOf(null);
  const model={c,s,d,classLabel:clsLv(),coins:coinsNow(),
    proficiencies:pdfProficiencies(c),attacks:pdfAttacks(c,d),equipment:pdfEquipment(c),features:pdfFeatures(c),
    resources:pdfResources(s,d),details:pdfDetails(c),spellcasting:pdfCasting(c,sc),spells:pdfSpells(c)
  };
  if(sc.by&&sc.by.length>1) model.details+="\nSpellcasting sources:\n"+sc.by.map(x => (x.n||x.ab)+": "+x.ab+", DC "+x.dc+", attack "+(x.atk>=0?"+":"")+x.atk).join("\n");
  model.portrait=await portraitPng(s.portrait);
  if(s.portrait&&!model.portrait) model.details+="\nPortrait unavailable for PDF export.";
  return templatePdf(model);
}
function printFallback(){ buildPrint(); setTimeout(() =>{ window.print(); },60); }
$("#pdfBtn").addEventListener("click",() =>{
  const busy=$("#busy");
  if(busy.classList.contains("on")) return;
  busy.classList.add("on");
  const filename=(C.name||"character").replace(/[^A-Za-z0-9]+/g,"-")+"-"+C.cls+D.level+".pdf";
  downloadsP.then((dl) =>{
    busy.classList.add("on");
    /* T11 A3: outside the old artifact host there is no save API. The PDF is now built here too and downloaded as a file. Before, this case went straight to the print dialog */
    if(!dl) return makePdfBlob().then((blob) =>{ busy.classList.remove("on");
      const u=URL.createObjectURL(blob), a=document.createElement("a"); a.href=u; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); toast("PDF saved");
    }).catch(() =>{ busy.classList.remove("on"); toast("The PDF couldn't be built. Opening the print dialog"); printFallback(); });
    return makePdfBlob().then((blob) =>{
      busy.classList.remove("on");
      return dl.save({filename, data:blob}).then((r) =>{
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

