import {C,S,save} from "./04-logic-storage.js";
import {$,clamp,esc,num,toast} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {barColor,buzz,hpOpen,syncHP} from "./09-ui-hit-points-playbar-death-saves.js";
import {activeConds,renderConds} from "./10-ui-conditions.js";
import {sheet,sheetMode,showEntry} from "./12-ui-bottom-sheet-modal.js";
import {ico,openRest} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {setOf} from "./25-ui-settings-appearance.js";
import {PAL,__set_gsSel,condSet,fzScore,gsMark,gsRows,gsSel,gsSync,openSearch,palCmds,palFill} from "./27-ui-party-search-commands-library.js";
import {toastU,undoMark} from "./32-logic-play-undo-actions.js";
import {cmbPipClick,cmbPipH,renderAll} from "./35-ui-combo.js";
import {__R} from "./00-reg.js";
import { html, render as drawHtml, raw as rawHtml } from "./lib/html.js";
Object.defineProperty(__R,"PIP",{get:function(){return PIP;},set:function(v){PIP=v;},configurable:true});
Object.defineProperty(__R,"exhTo",{get:function(){return exhTo;},set:function(v){exhTo=v;},configurable:true});
Object.defineProperty(__R,"ohSync",{get:function(){return ohSync;},set:function(v){ohSync=v;},configurable:true});
Object.defineProperty(__R,"pipSync",{get:function(){return pipSync;},set:function(v){pipSync=v;},configurable:true});
Object.defineProperty(__R,"wakeApply",{get:function(){return wakeApply;},set:function(v){wakeApply=v;},configurable:true});
/* v30 p07: Exhaustion to a level (stepper and palette). Level 6 is death, leaving 6 brings Hit Points back (v29 RU127) */
function exhTo(v,quiet){ const exh0=num(S.exh,0); S.exh=clamp(Math.round(num(v,0)),0,6);
  if(S.exh===6&&exh0<6){ S.exhPrev={hp:S.hp,tmp:S.tmp,ds:(S.ds||[0,0]).slice()}; S.hp=0; S.tmp=0; S.ds=[0,3]; }
  else if(exh0===6&&S.exh<6&&S.exhPrev){ S.hp=S.exhPrev.hp; S.tmp=S.exhPrev.tmp; S.ds=S.exhPrev.ds; delete S.exhPrev; }
  save(); renderAll(); renderConds(); syncHP(); if(S.exh===6&&!quiet) toast("Exhaustion 6: your character dies"); }
/* v30 p07 RU130: palette keys. Ctrl+K or Cmd+K opens Search from anywhere on the sheet, arrows choose, Enter runs, Tab fills a command that needs a number */
document.addEventListener("keydown",(e) =>{ if(!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey||String(e.key).toLowerCase()!=="k") return;
  if(document.querySelector(".ask, #recov, #homeV:not([hidden])")) return; const bl=$("#bld"); if(bl&&!bl.hidden) return; e.preventDefault();
  if(sheet.classList.contains("on")&&sheetMode==="search"){ const q=$("#gsQ"); if(q){ q.focus(); try{ q.select(); }catch(er){} } return; } openSearch(); },true);
document.addEventListener("keydown",(e) =>{ if(!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey||String(e.key).toLowerCase()!=="k") return;
  const h=document.getElementById("homeV"); if(!h||h.hidden||document.querySelector(".ask, #recov, #bkp")) return; const q=document.getElementById("homeQ"); if(!q) return; e.preventDefault(); q.focus(); try{ q.select(); }catch(er){} },true);
/* T4 item 25: single-key shortcuts on Home. Skipped while typing, while a dialog is open, and with a modifier key */
document.addEventListener("keydown",(e) =>{ if(e.ctrlKey||e.metaKey||e.altKey||e.defaultPrevented) return; const h=document.getElementById("homeV"); if(!h||h.hidden) return;
  const t=e.target, tg=(t&&t.tagName)||""; if(/^(INPUT|TEXTAREA|SELECT)$/.test(tg)||(t&&t.isContentEditable)) return; if(document.querySelector(".ask, #recov, #bkp, #lib.on, #party, #rep, #chf, #bld:not([hidden]), #sheet.on")) return;
  const k=e.key.length===1?e.key.toUpperCase():e.key, sel=k==="N"?"[data-hnew]":k==="B"?"[data-hbk=out]":k==="S"?"[data-hbk=info]":""; if(k==="/"){ const q=document.getElementById("homeQ"); if(q){ e.preventDefault(); q.focus(); } return; }
  if(!sel) return; const b=h.querySelector(".hbtns "+sel); if(b){ e.preventDefault(); b.click(); } });
document.addEventListener("keydown",(e) =>{ const q=e.target; if(!q||q.id!=="gsQ") return;
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); gsSync(); const L=gsRows(); if(!L.length) return; __set_gsSel((gsSel+(e.key==="ArrowDown"?1:-1)+L.length)%L.length); gsMark(true); return; }
  if(e.key==="Enter"){ e.preventDefault(); gsSync(); const r=gsRows()[gsSel]; if(r) r.click(); return; }
  if(e.key==="Tab"&&!e.shiftKey){ const c0=$("#sheetBody .gs-c.sel"), pc=c0&&PAL[+c0.getAttribute("data-cmd")]; if(pc&&pc.fill&&q.value.trim().toLowerCase()+" "!==pc.fill){ e.preventDefault(); palFill(pc.fill); } } });
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-cmd],[data-gsfill]"); if(!b||!b.closest("#sheetBody")) return; e.preventDefault();
  if(b.hasAttribute("data-gsfill")){ palFill(b.getAttribute("data-gsfill")); return; } const c=PAL[+b.getAttribute("data-cmd")]; if(!c) return; if(c.fill){ palFill(c.fill); return; } if(c.run) c.run(); });
window.__pal=function(q){ return palCmds(String(q||"").trim().toLowerCase()).map((c) =>{ return c.t+" | "+(c.s||""); }); };
window.__fz=function(q,s){ return fzScore(String(q).toLowerCase(),s); };
/* v30 p09 RU130: drag the HP number up or down to set the amount (Heal or Damage still decides), hold it or right-click for a quick menu */
function hpAmtV(){ const v=parseInt(($("#hpAmt")||{}).value,10); return isNaN(v)?0:Math.max(0,v); }
function hpAmtSet(n){ const v=n?String(n):""; ["hpAmt","qmAmt","ohAmt"].forEach((id) =>{ const i=document.getElementById(id); if(i&&i.value!==v) i.value=v; }); }
export function qmClose(){ const w=document.getElementById("hpQm"); if(w){ w.remove(); document.removeEventListener("pointerdown",qmOut,true); document.removeEventListener("keydown",qmKey,true); } }
function qmOut(e){ const w=document.getElementById("hpQm"); if(w&&!w.contains(e.target)) qmClose(); }
function qmKey(e){ if(e.key==="Escape"){ e.stopPropagation(); qmClose(); } if(e.key==="Enter"&&e.target&&e.target.id==="qmAmt"){ e.preventDefault(); qmRun(e.shiftKey?"heal":"dmg"); } }
function qmRun(k){ const i=document.getElementById("qmAmt"), n=i?Math.max(0,parseInt(i.value,10)||0):0; if(!n){ toast("Type an amount first."); if(i) i.focus(); return; }
  qmClose(); const a=$("#hpAmt"); if(!a) return; a.value=String(n); const b=k==="heal"?$("#healBtn"):k==="dmg"?$("#dmgBtn"):$("[data-tmpset]"); if(b) b.click(); }
function qmOpen(el){ qmClose(); if(!D||!D.hpmax) return; const w=document.createElement("div"), a=hpAmtV(); w.id="hpQm"; w.className="hp-qm"; w.setAttribute("role","dialog"); w.setAttribute("aria-label","Hit Points quick menu"); w.tabIndex=-1;
  drawHtml(html`<div class="qm-h">${rawHtml(ico("hp-heal","qm-hi"))}<b>${rawHtml(num(S.hp,0))}</b><span>/ ${rawHtml(D.hpmax)}${rawHtml(S.tmp?' <i>+'+S.tmp+' temp</i>':'')}</span><button type="button" class="qm-x press" data-qm="x" aria-label="Close">${rawHtml(ico("ui-close"))}</button></div><div class="qm-a"><input id="qmAmt" type="number" inputmode="numeric" min="0" placeholder="Amount" aria-label="Amount" value="${rawHtml(a||"")}"><button type="button" class="qm-p press" data-qmadd="1" aria-label="Add 1">${rawHtml(ico("ui-plus"))}1</button><button type="button" class="qm-p press" data-qmadd="5" aria-label="Add 5">${rawHtml(ico("ui-plus"))}5</button><button type="button" class="qm-p press" data-qmadd="10" aria-label="Add 10">${rawHtml(ico("ui-plus"))}10</button></div><div class="qm-b"><button type="button" class="btn press qm-heal" data-qm="heal">${rawHtml(ico("hp-heal"))}Heal</button><button type="button" class="btn press qm-dmg" data-qm="dmg">${rawHtml(ico("hp-damage"))}Damage</button><button type="button" class="btn press qm-tmp" data-qm="temp">${rawHtml(ico("hp-temp"))}Temp HP</button></div>`, w);
  document.body.appendChild(w); const r=el.getBoundingClientRect(), W=w.offsetWidth, H=w.offsetHeight, vw=document.documentElement.clientWidth, vh=window.innerHeight, x=Math.max(12,Math.min(vw-W-12,r.left+r.width/2-W/2));
  w.style.left=x+"px"; if(r.top>H+20) w.style.top=Math.round(r.top-H-8)+"px"; else w.style.top=Math.round(Math.min(vh-H-12,r.bottom+8))+"px";
  w.addEventListener("click",(e) =>{ const b=e.target.closest("button"); if(!b) return; if(b.hasAttribute("data-qmadd")){ const q=document.getElementById("qmAmt"); hpAmtSet((parseInt(q.value,10)||0)+(+b.getAttribute("data-qmadd"))); return; } const k=b.getAttribute("data-qm"); if(k==="x"){ qmClose(); return; } if(k) qmRun(k); });
  w.addEventListener("input",(e) =>{ if(e.target.id==="qmAmt"){ const v=parseInt(e.target.value,10); const h=$("#hpAmt"); if(h) h.value=isNaN(v)?"":String(Math.max(0,v)); } });
  setTimeout(() =>{ document.addEventListener("pointerdown",qmOut,true); document.addEventListener("keydown",qmKey,true); },0); try{ w.focus({preventScroll:true}); }catch(er){} }
(function(){ let TH=8, STEP=12, HOLD=500, st=null, bub=null, supT=0;
  function bubble(el,n){ if(!bub){ bub=document.createElement("div"); bub.id="hpGest"; bub.className="hp-gest"; bub.setAttribute("aria-hidden","true"); document.body.appendChild(bub); }
    const r=el.getBoundingClientRect(); drawHtml(html`<b>${rawHtml(n)}</b><span>Amount. Now tap Heal or Damage</span>`, bub); bub.style.left=Math.round(Math.max(110,Math.min(document.documentElement.clientWidth-110,r.left+r.width/2)))+"px"; bub.style.top=Math.round(Math.max(70,r.top-10))+"px"; bub.classList.add("on"); }
  function down(e){ if(e.button>0||!D||!D.hpmax) return; const el=e.currentTarget; if(st) clearTimeout(st.t); st={el:el,x:e.clientX,y:e.clientY,id:e.pointerId,a0:hpAmtV(),m:"",n:null};
    st.t=setTimeout(() =>{ if(st&&!st.m){ st.m="hold"; qmOpen(st.el); buzz(10); } },HOLD); }
  function move(e){ if(!st||e.pointerId!==st.id) return; const dx=e.clientX-st.x, dy=e.clientY-st.y;
    if(!st.m){ if(Math.abs(dy)>TH&&Math.abs(dy)>Math.abs(dx)*1.4){ st.m="drag"; clearTimeout(st.t); st.y=e.clientY; try{ st.el.setPointerCapture(e.pointerId); }catch(er){} } else if(Math.abs(dx)>TH||Math.abs(dy)>TH){ clearTimeout(st.t); st=null; } return; }
    if(st.m==="drag"){ e.preventDefault(); const n=Math.max(0,Math.min(999,st.a0+Math.round((st.y-e.clientY)/STEP))); if(n!==st.n){ st.n=n; hpAmtSet(n); bubble(st.el,n); } } }
  function up(e){ if(!st||e.pointerId!==st.id) return; clearTimeout(st.t); const s0=st; st=null; if(!s0.m) return; supT=Date.now();
    if(s0.m==="drag"){ setTimeout(() =>{ if(bub) bub.classList.remove("on"); },700); if(s0.n&&s0.el.id==="vbHp") hpOpen(); } }
  function cancel(e){ if(st&&(!e||e.pointerId===st.id)){ clearTimeout(st.t); st=null; } if(bub) bub.classList.remove("on"); }
  ["hpCur","vbHp"].forEach((id) =>{ const el=document.getElementById(id); if(!el) return; el.classList.add("hp-g"); if(id==="hpCur") el.title="Drag up or down to set the amount. Hold for a quick menu.";
    el.addEventListener("pointerdown",down); el.addEventListener("pointermove",move); el.addEventListener("pointerup",up); el.addEventListener("pointercancel",cancel);
    el.addEventListener("contextmenu",(e) =>{ e.preventDefault(); supT=Date.now(); if(st){ clearTimeout(st.t); st.m="hold"; } if(!document.getElementById("hpQm")) qmOpen(el); }); });
  document.addEventListener("click",(e) =>{ if(Date.now()-supT<450&&e.target.closest&&e.target.closest("#hpCur,#vbHp")){ e.preventDefault(); e.stopPropagation(); } },true);
})();
/* v30 p10 RU130: a small Hit Points window that stays on top of other windows (Document Picture-in-Picture, Chrome and Edge on computers) */
var PIP=null;
const PIP_CSS='*{box-sizing:border-box}html,body{margin:0;background:var(--paper);color:var(--ink);font-family:var(--f-sans);font-size:14px}body{padding:10px;display:flex;flex-direction:column;gap:8px;-webkit-font-smoothing:antialiased}'+
  'svg{width:16px;height:16px;flex:none}.pp-top{display:flex;align-items:center;gap:8px}.pp-hp{display:flex;align-items:baseline;gap:4px;min-width:0}.pp-hp svg{color:var(--bad);align-self:center}.pp-hp b{font:700 40px/1 var(--f-nar)}.pp-hp b.z{color:var(--bad)}.pp-hp>span{font:600 16px/1 var(--f-nar);color:var(--muted)}'+
  '.pp-tmp{font:700 16px/1 var(--f-nar);color:#7fb2ff}.pp-ac{margin-left:auto;display:flex;align-items:center;gap:4px;padding:4px 10px;border:1px solid var(--line-2);border-radius:var(--r2,8px);font:700 20px/1 var(--f-nar)}.pp-ac svg{color:var(--muted)}'+
  '.pp-bar{position:relative;height:6px;border-radius:4px;background:var(--line-2);overflow:hidden}.pp-bar i{position:absolute;left:0;top:0;bottom:0;width:100%;transform-origin:left center;background:var(--good);transition:transform .3s ease-out}'+
  '.pp-row{display:flex;gap:6px}input{flex:1;min-width:0;height:44px;text-align:center;font:700 20px/1 var(--f-nar);background:var(--panel);color:var(--ink);border:1px solid var(--line-2);border-radius:var(--r1,4px)}'+
  'button{min-height:44px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:0 10px;font:700 16px/1 var(--f-nar);background:var(--panel-2);color:var(--ink);border:1px solid var(--line-2);border-radius:var(--r2,8px);cursor:pointer}button:focus-visible,input:focus-visible{outline:2px solid var(--acc);outline-offset:1px}'+
  '.pp-sq{width:44px;padding:0}.pp-heal,.pp-dmg,.pp-tb{flex:1}.pp-heal{background:var(--good);border-color:var(--good);color:#fff}.pp-dmg{background:var(--bad);border-color:var(--bad);color:#fff}'+
  '.pp-c{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.pp-k{font:700 12px/1 var(--f-nar);letter-spacing:.06em;text-transform:uppercase;color:var(--muted);margin-right:2px}.pp-c button{min-height:36px;font:600 14px/1 var(--f-sans);padding:0 10px}.pp-c .on{border-color:var(--warn,#e2aa4c);color:#fff;background:color-mix(in srgb,var(--warn,#e2aa4c) 18%,var(--panel-2))}.pp-none{color:var(--faint);font-size:14px}'+
  ':root[data-skin="ddb"] .pp-heal{background:#24804a;border-color:#24804a}:root[data-skin="ddb"] .pp-dmg{background:#b8362c;border-color:#b8362c}input::-webkit-inner-spin-button,input::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input{appearance:textfield}'+
  '.pp-ct{min-height:32px!important;min-width:32px;padding:0 8px!important;font:700 13px/1 var(--f-nar)!important}.pp-ct.on{border-color:#ffb020;background:color-mix(in srgb,#ffb020 18%,var(--panel-2))}.pp-cl{flex-basis:100%;display:flex;flex-direction:column;gap:4px;margin-top:2px}.pp-cr{display:flex;align-items:center;gap:6px;padding:4px 6px;border:1px solid var(--line-2);border-left:3px solid #ffb020;border-radius:var(--r1,4px)}.pp-cr.emp{border-left-color:var(--line-2);opacity:.7}.pp-cr.dn{opacity:.5}.pp-cs{flex:none;width:44px;font:700 10px/1.1 var(--f-nar);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}.pp-cn{flex:1;min-width:0;font:600 14px/1.2 var(--f-sans);display:flex;flex-direction:column}.pp-cn small{font:500 12px/1.2 var(--f-sans);color:var(--muted)}.pp-c .pp-cu,.pp-cl .pp-cu{min-height:32px;padding:0 10px;font:700 13px/1 var(--f-nar)}'+'@media (prefers-reduced-motion:reduce){.pp-bar i{transition:none}}';
function pipVars(){ const cs=getComputedStyle(document.documentElement); return ":root{"+["--paper","--panel","--panel-2","--line","--line-2","--ink","--muted","--faint","--acc","--bad","--good","--warn","--f-sans","--f-nar","--r1","--r2"].map((k) =>{ return k+":"+(cs.getPropertyValue(k)||"initial"); }).join(";")+";color-scheme:dark light}"; }
function pipFonts(){ let cs=getComputedStyle(document.documentElement), fam=(cs.getPropertyValue("--f-sans")+","+cs.getPropertyValue("--f-nar")).toLowerCase(), out="";
  try{ Array.prototype.forEach.call(document.styleSheets,(sh) =>{ try{ Array.prototype.forEach.call(sh.cssRules,(r) =>{ if(r.type!==5) return; const f=String(r.style.getPropertyValue("font-family")||"").replace(/["']/g,"").trim().toLowerCase(); if(f&&fam.indexOf(f)>=0) out+=r.cssText+"\n"; }); }catch(er){} }); }catch(er){} return out; }
function pipHTML(){ return '<div class="pp-top"><div class="pp-hp">'+ico("hp-heal")+'<b id="ppHp">0</b><span>/ <span id="ppMax">0</span></span><span class="pp-tmp" id="ppTmp"></span></div><div class="pp-ac" title="Armor Class">'+ico("ui-shield")+'<span id="ppAc">0</span></div></div>'+
  '<div class="pp-bar" aria-hidden="true"><i id="ppBar"></i></div>'+
  '<div class="pp-row"><button type="button" class="pp-sq" data-pp="minus" aria-label="Lower the amount">'+ico("ui-minus")+'</button><input id="ppAmt" type="number" inputmode="numeric" min="0" placeholder="Amount" aria-label="Amount"><button type="button" class="pp-sq" data-pp="plus" aria-label="Raise the amount">'+ico("ui-plus")+'</button></div>'+
  '<div class="pp-row"><button type="button" class="pp-heal" data-pp="heal">'+ico("hp-heal")+'Heal</button><button type="button" class="pp-dmg" data-pp="dmg">'+ico("hp-damage")+'Damage</button><button type="button" class="pp-tb" data-pp="temp">'+ico("hp-temp")+'Temp</button></div>'+
  '<div class="pp-c" id="ppCond"></div><div class="pp-c" id="ppCmb"></div>'; }
function pipSync(){ const w=PIP; if(!w||!D||!D.hpmax) return; const d=w.document, g=function(i){ return d.getElementById(i); }; if(!g("ppHp")) return;
  const hp=clamp(num(S.hp,0),0,D.hpmax), tp=Math.max(0,num(S.tmp,0)), p=clamp(hp/D.hpmax,0,1);
  g("ppHp").textContent=hp; g("ppHp").classList.toggle("z",hp===0); g("ppMax").textContent=D.hpmax; g("ppTmp").textContent=tp?"+"+tp+" temp":""; g("ppAc").textContent=D.ac;
  const b=g("ppBar"); b.style.transform="scaleX("+p+")"; b.style.backgroundColor=barColor(p);
  let L=activeConds().map((c) =>{ return c.k; }), h='<span class="pp-k">Conditions</span>';
  if(S.exh) h+='<button type="button" class="on" data-ppexh="1" title="Lower Exhaustion by 1">'+ico("cond-exhaustion")+'Exhaustion '+S.exh+'</button>';
  h+=L.map((k) =>{ return '<button type="button" class="on" data-ppc="'+esc(k)+'" title="Remove '+esc(k)+'">'+(ico("cond-"+k.toLowerCase())||"")+esc(k)+ico("ui-close")+'</button>'; }).join("");
  if(!L.length&&!S.exh) h+='<span class="pp-none">None</span>'; h+='<button type="button" data-pp="cond">'+ico("ui-plus")+'Edit</button>';
  const c=g("ppCond"); if(c.innerHTML!==h) c.innerHTML=h; const cm=g("ppCmb"), ch=cmbPipH(); if(cm&&cm.innerHTML!==ch) cm.innerHTML=ch; d.title=(C.name||"Character")+": "+hp+" / "+D.hpmax+" HP"; }
function pipAmt(){ const i=PIP&&PIP.document.getElementById("ppAmt"); const n=i?parseInt(i.value,10):0; return isNaN(n)?0:Math.max(0,n); }
function pipAct(k){ const d=PIP&&PIP.document; if(!d) return; let i=d.getElementById("ppAmt"), n=pipAmt();
  if(k==="minus"||k==="plus"){ n=Math.max(0,n+(k==="plus"?1:-1)); i.value=n?String(n):""; return; }
  if(k==="cond"){ try{ window.focus(); }catch(er){} showEntry({type:"cond"},false); return; }
  if(!n){ i.focus(); return; } const a=$("#hpAmt"); if(!a) return; a.value=String(n); const b=k==="heal"?$("#healBtn"):k==="dmg"?$("#dmgBtn"):$("[data-tmpset]"); if(b) b.click(); i.value=""; i.focus(); }
function pipOpen(){ if(PIP){ try{ PIP.close(); }catch(er){} return; } if(!window.documentPictureInPicture) return;
  documentPictureInPicture.requestWindow({width:340,height:470}).then((w) =>{ PIP=w; window.__pipWin=w; const d=w.document;
    const st=d.createElement("style"); st.textContent=pipFonts()+PIP_CSS; d.head.appendChild(st); const sv=d.createElement("style"); sv.id="ppVars"; sv.textContent=pipVars(); d.head.appendChild(sv);
    ["data-theme","data-skin"].forEach((a) =>{ const v=document.documentElement.getAttribute(a); if(v) d.documentElement.setAttribute(a,v); });
    d.body.innerHTML=pipHTML(); if(window.__miPip) try{ window.__miPip(w); }catch(er){} d.addEventListener("click",cmbPipClick);
    d.addEventListener("click",(e) =>{ const b=e.target.closest("button"); if(!b) return; if(b.hasAttribute("data-ppc")){ condSet(b.getAttribute("data-ppc"),false); return; } if(b.hasAttribute("data-ppexh")){ undoMark("Exhaustion"); exhTo(num(S.exh,0)-1,true); toastU("Exhaustion "+S.exh+"."); return; } const k=b.getAttribute("data-pp"); if(k) pipAct(k); });
    d.addEventListener("keydown",(e) =>{ if(e.key==="Enter"&&e.target.id==="ppAmt"){ e.preventDefault(); pipAct(e.shiftKey?"heal":"dmg"); } });
    w.addEventListener("pagehide",() =>{ PIP=null; window.__pipWin=null; const pb=$("#pipBtn"); if(pb) pb.setAttribute("aria-pressed","false"); });
    const pb=$("#pipBtn"); if(pb) pb.setAttribute("aria-pressed","true"); pipSync(); },() =>{ toast("The mini window could not open. Try again from the Mini Window button."); }); }
(function(){ const pb=$("#pipBtn"); if(!pb) return; if(window.documentPictureInPicture&&typeof documentPictureInPicture.requestWindow==="function"){ pb.hidden=false; pb.title="Mini window"; pb.addEventListener("click",() =>{ if(window.__moreSet) try{ window.__moreSet(false); }catch(er){} pipOpen(); }); } else pb.remove(); })();
/* v30 p11 RU131: Keep screen on (Screen Wake Lock). Asked again each time the page shows, let go when the setting is off */
let WL=null, WLp=false;
function wakeApply(){ const api=!!(navigator.wakeLock&&typeof navigator.wakeLock.request==="function"), want=api&&setOf("wake")==="1"&&document.visibilityState==="visible";
  if(want&&!WL&&!WLp){ WLp=true; try{ navigator.wakeLock.request("screen").then((l) =>{ WLp=false; WL=l; try{ l.addEventListener("release",() =>{ if(WL===l) WL=null; }); }catch(er){} if(setOf("wake")!=="1"){ WL=null; try{ l.release(); }catch(er){} } },() =>{ WLp=false; WL=null; }); }catch(er){ WLp=false; } }
  else if(!want&&WL){ const l=WL; WL=null; try{ l.release(); }catch(er){} } }
document.addEventListener("visibilitychange",() =>{ try{ wakeApply(); }catch(er){} });
window.__wake=function(){ return {on:setOf("wake")==="1",held:!!WL}; };
/* v30 p11 RU131: one-handed mode, a thumb bar on phones */
function ohSync(){ const o=document.getElementById("ohAmt"), a=document.getElementById("hpAmt"); if(o&&a&&o.value!==a.value&&document.activeElement!==o) o.value=a.value; }
(function(){ const d=document.getElementById("ohDock"); if(!d) return;
  drawHtml(html`<button type="button" class="oh-b oh-sq press" data-oh="minus" aria-label="Lower the amount">${rawHtml(ico("ui-minus"))}</button><input id="ohAmt" class="oh-amt" type="number" inputmode="numeric" min="0" placeholder="0" aria-label="Amount"><button type="button" class="oh-b oh-sq press" data-oh="plus" aria-label="Raise the amount">${rawHtml(ico("ui-plus"))}</button><button type="button" class="oh-b oh-heal press" data-oh="heal">${rawHtml(ico("hp-heal"))}<span>Heal</span></button><button type="button" class="oh-b oh-dmg press" data-oh="dmg">${rawHtml(ico("hp-damage"))}<span>Damage</span></button><button type="button" class="oh-b press" data-oh="rest" aria-label="Short Rest or Long Rest">${rawHtml(ico("rest-short"))}<span>Rest</span></button><button type="button" class="oh-b press" data-oh="search" aria-label="Search and commands">${rawHtml(ico("ui-search"))}<span>Search</span></button>`, d);
  d.addEventListener("click",(e) =>{ const b=e.target.closest("[data-oh]"); if(!b) return; const k=b.getAttribute("data-oh"), i=document.getElementById("ohAmt"), n=Math.max(0,parseInt(i.value,10)||0);
    if(k==="minus"||k==="plus"){ hpAmtSet(Math.max(0,n+(k==="plus"?1:-1))); return; }
    if(k==="rest"){ openRest("menu"); return; } if(k==="search"){ openSearch(); return; }
    if(!n){ toast("Type an amount first."); i.focus(); return; } const a=$("#hpAmt"); if(!a) return; a.value=String(n); (k==="heal"?$("#healBtn"):$("#dmgBtn")).click(); hpAmtSet(0); });
  d.addEventListener("keydown",(e) =>{ if(e.key==="Enter"&&e.target.id==="ohAmt"){ e.preventDefault(); const b=d.querySelector(e.shiftKey?'[data-oh="heal"]':'[data-oh="dmg"]'); if(b) b.click(); } });
  document.addEventListener("input",(e) =>{ const t=e.target; if(!t) return; if(t.id==="ohAmt"){ const v=parseInt(t.value,10), a=$("#hpAmt"); if(a) a.value=isNaN(v)?"":String(Math.max(0,v)); } else if(t.id==="hpAmt") ohSync(); });
  document.addEventListener("click",(e) =>{ if(e.target.closest&&e.target.closest("[data-hpadd]")) ohSync(); });
})();

/* T4 item 26: offline note. The app keeps working offline, the note says where the data is. It sits at the top of Home and on the Settings dialog, and a toast announces the change */
(function(){ function net(){ const on=navigator.onLine!==false; document.documentElement.classList.toggle("is-off",!on); let h=document.getElementById("homeV"), n=document.getElementById("offNote");
    if(h&&!on&&!n){ const w=h.querySelector(".hwrap"); if(w){ n=document.createElement("div"); n.id="offNote"; n.className="hbkl"; n.setAttribute("role","status"); drawHtml(html`${rawHtml(window.__artVig?window.__artVig("state","offline",44):"")}<span>You are offline. Your characters are saved on this device and everything keeps working.</span>`, n); w.insertBefore(n,w.firstChild); } }
    else if(n&&on) n.remove(); }
  window.addEventListener("online",() =>{ net(); try{ toast("Back online"); }catch(er){} }); window.addEventListener("offline",() =>{ net(); try{ toast("Offline: everything is saved on this device"); }catch(er){} });
  window.__net=net; setInterval(() =>{ const h=document.getElementById("homeV"); if(h&&!h.hidden&&document.documentElement.classList.contains("is-off")&&!document.getElementById("offNote")) net(); },1500); net(); })();
