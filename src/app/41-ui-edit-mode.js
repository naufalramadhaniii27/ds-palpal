import {bindLive} from "./00a-reg-late-ports.js";import {ABN} from "./02-data-default-character.js";
import {C,S,save} from "./04-logic-storage.js";
import {$,$$,ask,esc,num,sg,toast} from "./05-logic-helpers.js";
import {B,D,derive} from "./06-logic-derivation.js";
import {__set_renderAbilities,__set_renderSkillsPage,__set_renderTiles,renderAbilities,renderSkillsPage,renderTiles} from "./08-ui-render-sheet-and-actions.js";import {__set_renderActions,renderActions} from "./08b-ui-render-summaries-actions.js";
import {__set_syncHP,syncHP} from "./09-ui-hit-points-playbar-death-saves.js";
import {refreshEntry,sheet,sheetMode,showEntry} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13b-ui-detail-spell-targets-render.js";
import {openEditor} from "./14-ui-editor.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {__set_renderSpells,renderSpells} from "./23e-ui-spells-dc.js";
import {cuK} from "./26-ui-customize.js";
import {toastU,undoMark} from "./32-logic-play-undo-actions.js";
import {__set_renderAll,renderAll} from "./35-ui-combo.js";
import {env} from "./00-env.js";bindLive("__set_CU0",{get:function(){return __set_CU0;}});bindLive("cuNumList",{get:function(){return cuNumList;}});
bindLive("CU0",{get:function(){return CU0;},set:function(v){CU0=v;}});
bindLive("EDM",{get:function(){return EDM;},set:function(v){EDM=v;}});
bindLive("cuqBackH",{get:function(){return cuqBackH;}});
bindLive("cuqHTML",{get:function(){return cuqHTML;}});
bindLive("cuqOf",{get:function(){return cuqOf;}});
bindLive("edmSet",{get:function(){return edmSet;}});
/* ===== v34 p01 RU85: Edit mode. Tap a number to set your own value (S.cust), Use calculated, Reset all, ask() after Apply ===== */
export var CU0={}, EDM=false, cuMT=0;
/* the S.cust key and field behind a number on the sheet (data-bd key), with its label, kind, and limits */
function cuqOf(key){
 const _cuqOf2Step1=cuqOf2Step1(key);
 const {k}=_cuqOf2Step1;
 let {m}=_cuqOf2Step1;
  if((m=/^ab-([A-Z]{3})$/.exec(k))&&ABN[m[1]]) return {k:"n:"+k,f:"o",fb:"b",t:ABN[m[1]]+" score",kind:"int",min:1,max:30};
  if((m=/^save-([A-Z]{3})$/.exec(k))&&ABN[m[1]]) return {k:"n:"+k,f:"o",fb:"b",t:ABN[m[1]]+" save",kind:"sgn",min:-20,max:30};
  if((m=/^sk-(\d+)$/.exec(k))){ const s=(C.skills||[])[+m[1]]; return s?{k:"n:sk:"+s.n,f:"o",fb:"b",t:s.n,kind:"sgn",min:-20,max:30}:null; }
  if((m=/^pas-(per|ins|inv)$/.exec(k))) return {k:"n:"+k,f:"o",fb:"b",t:"Passive "+({per:"Perception",ins:"Insight",inv:"Investigation"})[m[1]],kind:"int",min:0,max:60};
  if(k==="ac") return {k:"n:ac",f:"o",fb:"b",t:"Armor Class",kind:"int",min:0,max:60};
  if(k==="init") return {k:"n:init",f:"o",fb:"b",t:"Initiative",kind:"sgn",min:-20,max:30};
  if(k==="speed") return {k:"n:speed",f:"o",fb:"b",t:"Speed",kind:"ft",min:0,max:999};
  if(k==="dc") return {k:"n:dc",f:"o",fb:"b",t:"Grapple DC",kind:"int",min:0,max:60};
  if(k==="hp") return {k:"hp",f:"hpOver",t:"Hit Point Maximum",kind:"int",min:1,max:9999};
  if((m=/^(ah|ad)-(\d+)$/.exec(k))){ const a=(C.attacks||[])[+m[2]]; if(!a) return null; return m[1]==="ah"?{k:"a:"+a.n,f:"ho",fb:"hb",t:a.n+" to hit",kind:"sgn",min:-20,max:40}:{k:"a:"+a.n,f:"do",fb:"db",t:a.n+" damage",kind:"dmg"}; }
  if((m=/^sp(atk|dc)(-[A-Z]{3})?$/.exec(k))&&C.spellcasting) return {k:"n:sp"+m[1]+(m[2]||""),f:"o",t:(m[1]==="atk"?"Spell Attack":"Spell Save DC")+(m[2]?" ("+m[2].slice(1)+")":""),kind:m[1]==="atk"?"sgn":"int",min:m[1]==="atk"?-20:0,max:m[1]==="atk"?40:60};
  return null; }
function cuqOf2Step1(key){
 const _cuqOfStep1=cuqOfStep1(key);
 const {k}=_cuqOfStep1;
 let {m}=_cuqOfStep1;
  return /** @type {any} */ ({k, m});
}
function cuqOfStep1(key){
let m, k=String(key||"");
  return /** @type {any} */ ({k, m});
}
function cuqSet(q){ if(!q) return false; if(q.k==="hp") return num(S.hpOver,0)>0; const c=cuK(q.k); if(!c) return false; const e=function(f){ return f&&c[f]!=null&&c[f]!==""; }; return e(q.f)||e(q.fb); }
function cuqCur(key){ const b=B[key]; if(!b) return ""; const t=String(b.total).replace(/−/g,"-"); return t; }
function cuqCalc(q,key){ let c=q.k==="hp"?CU0.hp:CU0[q.k+"|"+q.f]; if(c==null||!cuqSet(q)) c=cuqCur(key); return c; }
function cuqFmt(q,v){ if(v===""||v==null) return "--"; if(q.kind==="dmg") return String(v); const n=Number(String(v).replace(/−/g,"-").replace(/[^0-9+-]/g,"")); if(isNaN(n)) return String(v); return q.kind==="sgn"?sg(n):q.kind==="ft"?n+" ft":String(n); }
function cuqHTML(key){ const q=cuqOf(key); if(!q) return '<p class="info-d">This number cannot be set here.</p>'; const set=cuqSet(q), cur=cuqCur(key), calc=cuqCalc(q,key), dmg=q.kind==="dmg";
  const val=dmg?String(cur).replace(/-/g,"−"):String(parseInt(String(cur).replace(/[^0-9+-]/g,""),10));
  return '<div class="cuq">'+(set?'<p class="cuq-st cu-on-t">'+ico("ui-pen")+'<span>Set by you. Calculated value: <b>'+esc(cuqFmt(q,calc))+'</b></span></p>':'<p class="cuq-st">'+ico("ui-info")+'<span>Calculated value: <b>'+esc(cuqFmt(q,calc))+'</b></span></p>')+
    '<label class="cu-f"><span>'+(dmg?"Damage shown":"Number shown")+(q.kind==="ft"?" (feet)":"")+'</span><input id="cuqIn" data-cuqk="'+esc(key)+'" type="'+(dmg?"text":"number")+'"'+(dmg?' maxlength="40" autocomplete="off" spellcheck="false"':' inputmode="numeric" step="1" min="'+q.min+'" max="'+q.max+'"')+' value="'+esc(val==="NaN"?"":val)+'">'+
    '<small>'+(dmg?"Dice and numbers, like 1d8+3.":"A whole number from "+q.min+" to "+q.max+".")+(q.kind==="sgn"?" Type 5 for +5.":"")+'</small></label><p class="cuq-err" id="cuqErr" role="alert" hidden></p>'+
    '<div class="cu-btns"><button type="button" class="btn press pri" data-cuqsave="'+esc(key)+'">'+ico("ui-check")+'<span>Save</span></button>'+(set?'<button type="button" class="btn press" data-cuqback="'+esc(key)+'">'+ico("ui-undo")+'<span>Use calculated</span></button>':'')+'</div>'+
    '<p class="bk-f"><button type="button" class="lk" data-bd="'+esc(key)+'">'+ico("ui-info")+'How it is calculated</button></p></div>'; }
function cuqBackH(key){ const q=cuqOf(key); if(!q||!cuqSet(q)) return ""; return '<div class="info-act cu-act"><button type="button" class="btn press" data-cuqback="'+esc(key)+'">'+ico("ui-undo")+'<span>Use calculated ('+esc(cuqFmt(q,cuqCalc(q,key)))+')</span></button></div>'; }
function cuqErr(m){ const e=$("#cuqErr"), i=$("#cuqIn"); if(e){ e.innerHTML=ico("toast-warn")+'<span>'+esc(m)+'</span>'; e.hidden=false; } if(i){ i.setAttribute("aria-invalid","true"); try{ i.focus({preventScroll:true}); }catch(er){} } }
function cuqSave(key){ const q=cuqOf(key); if(!q) return; let i=$("#cuqIn"), raw=String(i&&i.value||"").trim(), v;
  if(raw===""){ cuqErr(cuqSet(q)?"Type a number, or tap Use calculated.":"Type a number first."); return; }
  if(q.kind==="dmg"){ if(!/^[0-9dD+\-−\s]+$/.test(raw)||!/\d/.test(raw)){ cuqErr("Use dice and numbers only, like 2d6+3."); return; } v=raw.replace(/\s+/g,"").replace(/D/g,"d").replace(/-/g,"−"); }
  else { const n=Number(raw.replace(/−/g,"-")); if(!isFinite(n)||Math.round(n)!==n){ cuqErr("Type a whole number."); return; } if(n<q.min||n>q.max){ cuqErr("Use a number from "+q.min+" to "+q.max+"."); return; } v=n; }
  undoMark("Edit "+q.t);
  if(q.k==="hp"){ const om=D.hpmax; S.hpOver=v; derive(); if(S.hp!=null&&D.hpmax>om) S.hp=Math.min(D.hpmax,S.hp+(D.hpmax-om)); }
  else { S.cust=S.cust&&typeof S.cust==="object"?S.cust:{}; const o=S.cust[q.k]&&typeof S.cust[q.k]==="object"?S.cust[q.k]:{}; o[q.f]=v; S.cust[q.k]=o; }
  save(); renderAll(); closeSheet(); toastU(q.t+": "+cuqFmt(q,v)+", set by you."); }
function cuqBack(key){ const q=cuqOf(key); if(!q||!cuqSet(q)) return; undoMark("Calculated "+q.t);
  if(q.k==="hp") delete S.hpOver;
  else { const o=S.cust[q.k]; delete o[q.f]; if(q.fb) delete o[q.fb]; if(!Object.keys(o).length) delete S.cust[q.k]; if(!Object.keys(S.cust).length) delete S.cust; }
  save(); renderAll(); if(sheetMode==="cuq") closeSheet(); else refreshEntry(); toastU(q.t+" uses the calculated value again."); }
/* numbers set by you: [cust key, field] (names, notes, and item weights are not numbers on the sheet) */
export function cuNumList(){ const L=[], F={n:["o","b"],a:["ho","hb","db","do"],s:["dc","atk"]}, c=S.cust&&typeof S.cust==="object"?S.cust:{};
  Object.keys(c).forEach((k) =>{ const f=F[k.charAt(0)]; if(!f||!c[k]||typeof c[k]!=="object") return; f.forEach((x) =>{ if(c[k][x]!=null&&c[k][x]!=="") L.push([k,x]); }); });
  if(num(S.hpOver,0)>0) L.push(["hp","hpOver"]); return L; }
function cuResetAll(){ const L=cuNumList(); if(!L.length){ toast("No numbers are set by you. Every number is calculated."); return; }
  ask("Set "+L.length+" number"+(L.length>1?"s":"")+" back to the calculated value"+(L.length>1?"s":"")+"? Names and notes you added stay.","Reset All",() =>{ undoMark("Reset all numbers");
    L.forEach((p) =>{ if(p[0]==="hp"){ delete S.hpOver; return; } const o=S.cust[p[0]]; if(!o) return; delete o[p[1]]; if(!Object.keys(o).length) delete S.cust[p[0]]; });
    if(S.cust&&!Object.keys(S.cust).length) delete S.cust; save(); renderAll(); toastU("Every number uses the calculated value again."); }); }
/* marks: cu-ed (can be set in Edit mode), cu-on (set by you), a small pen icon */
function cuMark(){ $$("[data-bd]").forEach((el) =>{ if(el.closest("#sheet,#edmBar,.ps")) return; const q=cuqOf(el.getAttribute("data-bd")), on=!!(q&&cuqSet(q));
    el.classList.toggle("cu-ed",!!q); el.classList.toggle("cu-on",on);
    const p=el.querySelector(":scope > .cu-pen"); if(q&&!p) el.insertAdjacentHTML("beforeend",'<i class="cu-pen" aria-hidden="true">'+ico("ui-pen")+'</i>'); else if(!q&&p) p.remove();
    if(on) el.setAttribute("aria-describedby","cuSrTxt"); else if(el.getAttribute("aria-describedby")==="cuSrTxt") el.removeAttribute("aria-describedby"); });
  if(!document.getElementById("cuSrTxt")){ const sp=document.createElement("span"); sp.id="cuSrTxt"; sp.hidden=true; sp.textContent="Set by you"; document.body.appendChild(sp); }
  edmCount(); }
function cuMarkSoon(){ if(cuMT) return; cuMT=setTimeout(() =>{ cuMT=0; try{ cuMark(); }catch(er){} },0); }
["renderAll","renderActions","renderSpells","renderSkillsPage","renderTiles","renderAbilities","syncHP"].forEach((n) =>{ const f={renderAll:renderAll,renderActions:renderActions,renderSpells:renderSpells,renderSkillsPage:renderSkillsPage,renderTiles:renderTiles,renderAbilities:renderAbilities,syncHP:syncHP}[n];
  const w=function(){ const r=f.apply(this,arguments); cuMarkSoon(); return r; };
  if(n==="renderAll") __set_renderAll(w); else if(n==="renderActions") __set_renderActions(w); else if(n==="renderSpells") __set_renderSpells(w); else if(n==="renderSkillsPage") __set_renderSkillsPage(w); else if(n==="renderTiles") __set_renderTiles(w); else if(n==="renderAbilities") __set_renderAbilities(w); else __set_syncHP(w); });
function edmBar(){ let w=document.getElementById("edmBar"); if(w) return w; w=document.createElement("div"); w.id="edmBar"; w.className="edm-bar"; w.setAttribute("role","region"); w.setAttribute("aria-label","Edit mode"); w.hidden=true;
  w.innerHTML='<div class="edm-t">'+ico("ui-pen","edm-i")+'<span><b>Edit mode</b><small id="edmN">Tap a number to change it.</small></span></div><div class="edm-b">'+
    '<button type="button" class="btn press" id="edFormBtn" aria-label="Edit details: names, lists, and text">'+ico("ui-file")+'<span>Details</span></button>'+
    '<button type="button" class="btn press" id="edmReset" aria-label="Reset all numbers to the calculated values">'+ico("ui-undo")+'<span>Reset all</span></button>'+
    '<button type="button" class="btn press pri" id="edmDone" aria-label="Done, leave Edit mode">'+ico("ui-check")+'<span>Done</span></button></div>';
  document.body.appendChild(w);
  w.addEventListener("click",(e) =>{ if(e.target.closest("#edFormBtn")){ edmSet(false,true); openEditor(); return; } if(e.target.closest("#edmReset")){ cuResetAll(); return; } if(e.target.closest("#edmDone")){ edmSet(false); } });
  return w; }
function edmCount(){ const n=document.getElementById("edmN"); if(!n) return; const c=cuNumList().length; n.textContent=c?c+" number"+(c>1?"s":"")+" set by you. Tap one to change it.":"Tap a number to change it."; }
function edmPos(){ const bar=document.getElementById("edmBar"); if(!bar||bar.hidden) return; let nb=document.getElementById("bnav"), off=12;
  if(nb&&nb.offsetParent){ const r=nb.getBoundingClientRect(); if(r.height&&r.top<env.innerHeight) off=Math.max(12,Math.round(env.innerHeight-r.top+8)); }
  bar.style.bottom="calc("+off+"px + env(safe-area-inset-bottom,0px)*"+(off>12?0:1)+")"; document.body.style.setProperty("--edmh",(bar.offsetHeight+off+12)+"px"); }
function edmSet(on,quiet){ EDM=!!on; document.body.classList.toggle("edm",EDM); const b=$("#editBtn"); if(b) b.setAttribute("aria-pressed",String(EDM));
  if(env.__moreSet) env.__moreSet(false);
  const bar=edmBar(); bar.hidden=!EDM; if(EDM){ cuMark(); edmPos(); } }
env.addEventListener("resize",() =>{ if(EDM) edmPos(); });
/* in Edit mode a tap on a number opens its editor instead of the breakdown */
document.addEventListener("click",(e) =>{ if(!EDM) return; const t=e.target.closest&&e.target.closest("[data-bd]"); if(!t||t.closest("#sheet,#edmBar")) return; const k=t.getAttribute("data-bd"); if(!cuqOf(k)) return;
  e.preventDefault(); e.stopPropagation(); showEntry({type:"cuq",key:k},false); setTimeout(() =>{ const i=$("#cuqIn"); if(i&&env.matchMedia&&env.matchMedia("(hover:hover)").matches) try{ i.focus({preventScroll:true}); i.select(); }catch(er){} },120); },true);
document.addEventListener("click",(e) =>{ const s=e.target.closest&&e.target.closest("[data-cuqsave]"); if(s){ cuqSave(s.getAttribute("data-cuqsave")); return; }
  const b=e.target.closest&&e.target.closest("[data-cuqback]"); if(b){ cuqBack(b.getAttribute("data-cuqback")); } });
document.addEventListener("keydown",(e) =>{ const t=e.target;
  if(e.key==="Enter"&&t&&t.id==="cuqIn"){ e.preventDefault(); cuqSave(t.getAttribute("data-cuqk")); return; }
  if((e.key==="Enter"||e.key===" ")&&t&&t.getAttribute&&t.getAttribute("role")==="button"&&t.hasAttribute("data-bd")&&t.tagName!=="BUTTON"){ e.preventDefault(); t.click(); return; }
  if(e.key==="Escape"&&EDM&&!sheet.classList.contains("on")&&!document.querySelector(".ask")) edmSet(false); });
document.addEventListener("input",(e) =>{ if(e.target&&e.target.id==="cuqIn"){ const er=$("#cuqErr"); if(er) er.hidden=true; e.target.removeAttribute("aria-invalid"); } });
/* Apply from the builder keeps S.cust. When the calculated value behind a number set by you changes, ask */
function cuSnap(){ const o={}; cuNumList().forEach((p) =>{ const f=p[1]; if(f==="b"||f==="hb"||f==="db") return; const k=p[0]==="hp"?"hp":p[0]+"|"+f, v=p[0]==="hp"?CU0.hp:CU0[k]; if(v!=null) o[k]=v; }); return o; }
function cuLbl(k){ if(k==="hp") return "Hit Point Maximum"; const m=/^([nas]):(.*)\|(\w+)$/.exec(k); if(!m) return k; if(m[1]==="a") return m[2]+(m[3]==="do"?" damage":" to hit");
  const x=m[2], t={ac:"Armor Class",init:"Initiative",speed:"Speed",dc:"Grapple DC","pas-per":"Passive Perception","pas-ins":"Passive Insight","pas-inv":"Passive Investigation",spatk:"Spell Attack",spdc:"Spell Save DC"}[x];
  if(t) return t; if(/^ab-/.test(x)) return (ABN[x.slice(3)]||x)+" score"; if(/^save-/.test(x)) return (ABN[x.slice(5)]||x)+" save"; if(/^sk:/.test(x)) return x.slice(3); if(/^sp(atk|dc)-/.test(x)) return (/atk/.test(x)?"Spell Attack":"Spell Save DC")+" ("+x.slice(-3)+")"; return x; }
function cuAfterApply(before){ const after=cuSnap(), ch=[]; Object.keys(after).forEach((k) =>{ if(k in before&&String(before[k])!==String(after[k])) ch.push(k); }); if(!ch.length) return;
  const fm=function(k,v){ return /init|save-|sk:|spatk|\|ho$/.test(k)&&typeof v==="number"?sg(v):String(v); };
  ask("Apply changed the calculated value behind "+(ch.length>1?ch.length+" numbers":"a number")+" you set:\n"+ch.map((k) =>{ return cuLbl(k)+": calculated "+fm(k,before[k])+" is now "+fm(k,after[k]); }).join("\n")+"\nCancel keeps your numbers.","Use New",() =>{
    undoMark("Use calculated values"); ch.forEach((k) =>{ if(k==="hp"){ delete S.hpOver; return; } const i=k.lastIndexOf("|"), ck=k.slice(0,i), f=k.slice(i+1), o=S.cust&&S.cust[ck]; if(!o) return; delete o[f]; if(f==="o") delete o.b; if(f==="ho") delete o.hb; if(f==="do") delete o.db; if(!Object.keys(o).length) delete S.cust[ck]; });
    if(S.cust&&!Object.keys(S.cust).length) delete S.cust; save(); renderAll(); toastU("Those numbers use the calculated values again."); }); }
(function(f){ if(typeof f!=="function") return; env.__sheetApply=function(){ let before={}; try{ derive(); before=cuSnap(); }catch(er){} const r=f.apply(this,arguments); try{ cuAfterApply(before); }catch(er){} return r; }; })(env.__sheetApply);
env.__edm=function(on){ if(on!=null) edmSet(!!on,true); return EDM; }; env.__cuNum=function(){ return cuNumList(); };

export function __set_CU0(v){ return CU0=v; }
