import {ABN} from "./02-data-default-character.js";
import {x14} from "./03-data-glossary.js";
import {C,FROZEN,S,__set_C,__set_S,lsGet,lsSet,save,saveC} from "./04-logic-storage.js";
import {$,__set_toastT,ask,bldGuard,bldSync,clamp,eqOn,esc,invAt,num,sg,toast,toastT,viaBld} from "./05-logic-helpers.js";
import {D,derive} from "./06-logic-derivation.js";
import {featAll,renderActions,renderTiles,syncLU,used} from "./08-ui-render-sheet-and-actions.js";
import {flash,syncHP} from "./09-ui-hit-points-playbar-death-saves.js";
import {renderConds} from "./10-ui-conditions.js";
import {refreshEntry,sheet,showEntry} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {BKEY} from "./14-ui-editor.js";
import {spLvSel,spPactLv,spRowLv} from "./22-ui-spell-data-and-slots.js";
import {CONS1,ico,invKey,occOf,renderSpells,restRefresh,scOf} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {toastKind} from "./30-ui-icons.js";
import {__R} from "./00-reg.js";
import { html, render as drawHtml, raw as rawHtml } from "./lib/html.js";
Object.defineProperty(__R,"UNDO",{get:function(){return UNDO;},set:function(v){UNDO=v;},configurable:true});
Object.defineProperty(__R,"UST",{get:function(){return UST;},set:function(v){UST=v;},configurable:true});
Object.defineProperty(__R,"ammoBonus",{get:function(){return ammoBonus;},set:function(v){ammoBonus=v;},configurable:true});
Object.defineProperty(__R,"ammoFor",{get:function(){return ammoFor;},set:function(v){ammoFor=v;},configurable:true});
Object.defineProperty(__R,"ammoH",{get:function(){return ammoH;},set:function(v){ammoH=v;},configurable:true});
Object.defineProperty(__R,"ammoPickH",{get:function(){return ammoPickH;},set:function(v){ammoPickH=v;},configurable:true});
Object.defineProperty(__R,"chMaxH",{get:function(){return chMaxH;},set:function(v){chMaxH=v;},configurable:true});
Object.defineProperty(__R,"chgApply",{get:function(){return chgApply;},set:function(v){chgApply=v;},configurable:true});
Object.defineProperty(__R,"chgRows",{get:function(){return chgRows;},set:function(v){chgRows=v;},configurable:true});
Object.defineProperty(__R,"clsLvls",{get:function(){return clsLvls;},set:function(v){clsLvls=v;},configurable:true});
Object.defineProperty(__R,"concAuto",{get:function(){return concAuto;},set:function(v){concAuto=v;},configurable:true});
Object.defineProperty(__R,"concCheck",{get:function(){return concCheck;},set:function(v){concCheck=v;},configurable:true});
Object.defineProperty(__R,"concChip",{get:function(){return concChip;},set:function(v){concChip=v;},configurable:true});
Object.defineProperty(__R,"concEnd",{get:function(){return concEnd;},set:function(v){concEnd=v;},configurable:true});
Object.defineProperty(__R,"concHead",{get:function(){return concHead;},set:function(v){concHead=v;},configurable:true});
Object.defineProperty(__R,"concOf",{get:function(){return concOf;},set:function(v){concOf=v;},configurable:true});
Object.defineProperty(__R,"hasFeat",{get:function(){return hasFeat;},set:function(v){hasFeat=v;},configurable:true});
Object.defineProperty(__R,"hdHeal",{get:function(){return hdHeal;},set:function(v){hdHeal=v;},configurable:true});
Object.defineProperty(__R,"hpModH",{get:function(){return hpModH;},set:function(v){hpModH=v;},configurable:true});
Object.defineProperty(__R,"hpSpellNote",{get:function(){return hpSpellNote;},set:function(v){hpSpellNote=v;},configurable:true});
Object.defineProperty(__R,"hpWord",{get:function(){return hpWord;},set:function(v){hpWord=v;},configurable:true});
Object.defineProperty(__R,"longExtraH",{get:function(){return longExtraH;},set:function(v){longExtraH=v;},configurable:true});
Object.defineProperty(__R,"periOn",{get:function(){return periOn;},set:function(v){periOn=v;},configurable:true});
Object.defineProperty(__R,"qtyAdj",{get:function(){return qtyAdj;},set:function(v){qtyAdj=v;},configurable:true});
Object.defineProperty(__R,"recList",{get:function(){return recList;},set:function(v){recList=v;},configurable:true});
Object.defineProperty(__R,"recSum",{get:function(){return recSum;},set:function(v){recSum=v;},configurable:true});
Object.defineProperty(__R,"redoNow",{get:function(){return redoNow;},set:function(v){redoNow=v;},configurable:true});
Object.defineProperty(__R,"restX",{get:function(){return restX;},set:function(v){restX=v;},configurable:true});
Object.defineProperty(__R,"shortChg",{get:function(){return shortChg;},set:function(v){shortChg=v;},configurable:true});
Object.defineProperty(__R,"shortExtraH",{get:function(){return shortExtraH;},set:function(v){shortExtraH=v;},configurable:true});
Object.defineProperty(__R,"slotUsed",{get:function(){return slotUsed;},set:function(v){slotUsed=v;},configurable:true});
Object.defineProperty(__R,"spCastH",{get:function(){return spCastH;},set:function(v){spCastH=v;},configurable:true});
Object.defineProperty(__R,"spIx",{get:function(){return spIx;},set:function(v){spIx=v;},configurable:true});
Object.defineProperty(__R,"spxBody",{get:function(){return spxBody;},set:function(v){spxBody=v;},configurable:true});
Object.defineProperty(__R,"tmpFeatH",{get:function(){return tmpFeatH;},set:function(v){tmpFeatH=v;},configurable:true});
Object.defineProperty(__R,"tmpSpellH",{get:function(){return tmpSpellH;},set:function(v){tmpSpellH=v;},configurable:true});
Object.defineProperty(__R,"toastU",{get:function(){return toastU;},set:function(v){toastU=v;},configurable:true});
Object.defineProperty(__R,"undoFix",{get:function(){return undoFix;},set:function(v){undoFix=v;},configurable:true});
Object.defineProperty(__R,"undoLbl",{get:function(){return undoLbl;},set:function(v){undoLbl=v;},configurable:true});
Object.defineProperty(__R,"undoMark",{get:function(){return undoMark;},set:function(v){undoMark=v;},configurable:true});
Object.defineProperty(__R,"undoNow",{get:function(){return undoNow;},set:function(v){undoNow=v;},configurable:true});
Object.defineProperty(__R,"undoTidy",{get:function(){return undoTidy;},set:function(v){undoTidy=v;},configurable:true});
Object.defineProperty(__R,"useH",{get:function(){return useH;},set:function(v){useH=v;},configurable:true});
/* ================= v21: PLAYING THE CHARACTER ================= */
/* RU57: one step of undo. undoMark() keeps S, C, and the saved build as they were before an action; the toast of that action offers Undo */
var UNDO=null;
/* v30 p08: a history of 20 steps in memory (UST), and steps taken back that can be done again (RST). UNDO is the newest step */
var UST=[], RST=[], UMAX=20;
function undoTidy(){ if(UST.length&&UST[UST.length-1]!==UNDO) UST.pop(); }/* UNDO=null right after undoMark takes that step back out */
function undoFix(e){ if(!e||e.A!=null) return; e.A=JSON.stringify(S); e.CA=JSON.stringify(C); e.BA=lsGet(BKEY); if(e.CA===e.C) e.CA=e.C; }/* one copy of C when the step did not change it */
export function undoMark(lbl,join){ undoTidy(); const now=Date.now(), top=UST[UST.length-1];
  if(join&&top&&top.l===lbl&&top.j&&now-top.t<2000&&!RST.length){ top.t=now; top.A=null; UNDO=top; setTimeout(() =>{ undoFix(top); },0); return; }
  const e={l:lbl,t:now,j:!!join,S:JSON.stringify(S),C:JSON.stringify(C),B:lsGet(BKEY)}; UST.push(e); if(UST.length>UMAX) UST.shift(); RST.length=0; UNDO=e; setTimeout(() =>{ undoFix(e); },0); }
export function undoLbl(){ undoTidy(); const u=UST[UST.length-1]; return u?u.l:""; }
export function toastU(msg){ if(!UNDO){ toast(msg); return; } undoFix(UNDO);/* v21 M3: state right after the action */ const t=$("#toast"); const tk=toastKind(msg); drawHtml(html`${rawHtml(ico("toast-"+tk,"tico"))}<span>${msg}</span><button type="button" class="tundo" data-undo="1">${rawHtml(ico("ui-undo"))}Undo</button>`, t); t.setAttribute("data-kind",tk); t.classList.add("on","act"); clearTimeout(toastT); __set_toastT(setTimeout(() =>{ t.classList.remove("on","act"); },6000)); }
/* v21 M3, m1: only the fields the action changed go back. Changes made since (another tab, a condition) stay */
function undoBack(cur,b0,a0){ const J1=function(x){ return JSON.stringify(x===undefined?null:x); };
  Object.keys(b0).concat(Object.keys(a0)).forEach((k) =>{ if(k==="_app"||J1(b0[k])===J1(a0[k])) return; const b=b0[k], a=a0[k];
    if(b&&a&&typeof b==="object"&&typeof a==="object"&&!Array.isArray(b)&&!Array.isArray(a)&&cur[k]&&typeof cur[k]==="object"&&!Array.isArray(cur[k])){ Object.keys(b).concat(Object.keys(a)).forEach((j) =>{ if(J1(b[j])===J1(a[j])) return; if(b[j]===undefined) delete cur[k][j]; else cur[k][j]=structuredClone(b[j]); }); }
    else if(b===undefined) delete cur[k]; else cur[k]=structuredClone(b); }); return cur; }
/* re=false: back to before the step. re=true: Redo, forward to after it. Only the fields the step changed move */
function undoApply(u,re){ undoFix(u); let note="", s0=re?u.A:u.S, s1=re?u.S:u.A;
  __set_S(undoBack(S,JSON.parse(s0),JSON.parse(s1))); if(u.C!==u.CA) __set_C(undoBack(C,JSON.parse(re?u.CA:u.C),JSON.parse(re?u.C:u.CA)));
  const b0=re?u.BA:u.B, b1=re?u.B:u.BA;
  if(b0!=null&&b0!==b1){ if(lsGet(BKEY)===b1){ lsSet(BKEY,b0); try{ if(window.__bldReload) window.__bldReload(); }catch(er){} } else note=" The build changed since then, so it was left as it is."; }
  save(); if(u.C!==u.CA) saveC(); if(sheet.classList.contains("on")) closeSheet(); __R.renderAll(true); return note; }
function toastR(msg,btn){ const t=$("#toast"), tk=toastKind(msg); drawHtml(html`${rawHtml(ico("toast-"+tk,"tico"))}<span>${msg}</span>${rawHtml(btn==="redo"?'<button type="button" class="tredo" data-redo="1">'+ico("ui-redo")+'Redo</button>':btn==="undo"?'<button type="button" class="tundo" data-undo="1">'+ico("ui-undo")+'Undo</button>':'')}`, t); t.setAttribute("data-kind",tk); t.classList.add("on"); t.classList.toggle("act",!!btn); clearTimeout(toastT); __set_toastT(setTimeout(() =>{ t.classList.remove("on","act"); },btn?6000:2400)); }
export function undoNow(){ if(FROZEN) return; undoTidy(); const u=UST.pop(); if(!u){ toast("Nothing to undo."); return; } UNDO=UST[UST.length-1]||null; const note=undoApply(u,false); RST.push(u); toastR("Undone: "+u.l+"."+note,"redo"); }
function redoNow(){ if(FROZEN) return; undoTidy(); const u=RST.pop(); if(!u){ toast("Nothing to redo."); return; } const note=undoApply(u,true); UST.push(u); UNDO=u; toastR("Redone: "+u.l+"."+note,"undo"); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-undo],[data-redo]"); if(b){ e.preventDefault(); e.stopPropagation(); if(b.hasAttribute("data-redo")) redoNow(); else undoNow(); } },true);
document.addEventListener("keydown",(e) =>{ if(!(e.ctrlKey||e.metaKey)||e.altKey) return; const k=String(e.key).toLowerCase(); if(k!=="z"&&k!=="y") return;
  const t=e.target, tg=(t&&t.tagName)||"", ty=String(t&&t.type||"").toLowerCase(); if(tg==="TEXTAREA"||tg==="SELECT"||(t&&t.isContentEditable)||(tg==="INPUT"&&/^(text|search|email|url|tel|password|)$/.test(ty))) return;
  if(document.querySelector(".ask, #recov, #homeV:not([hidden])")) return; const bl=$("#bld"); if(bl&&!bl.hidden) return;
  e.preventDefault(); if(k==="y"||e.shiftKey) redoNow(); else undoNow(); });
window.__undoInfo=function(){ undoTidy(); return {u:UST.map((x) =>{ return x.l; }),r:RST.map((x) =>{ return x.l; })}; };

/* class levels from C.clsLabel ("Fighter 3 / Wizard 2") */
function clsLvls(){ let o={}, t=String(C.clsLabel||""), m, re=/([A-Z][A-Za-z']+) (\d+)/g; while((m=re.exec(t))) o[m[1]]=+m[2]; if(!Object.keys(o).length&&C.cls) o[C.cls]=D.level; return o; }
export function lvOf(c){ return clsLvls()[c]||0; }
export function hasFeat(n){ return featAll().some((x) =>{ return x.f.n===n; }); }
function hpWord(n){ return n===1?"Hit Point":"Hit Points"; }

/* ---------- RU50 Concentration ---------- */
export var INCAP=["Incapacitated","Paralyzed","Petrified","Stunned","Unconscious"];
export function concOf(){ return S.conc&&S.conc.n?S.conc:null; }
function concSet(x,lv){ const o=concOf(), m=(o&&o.n!==x.n)?"Concentration on "+o.n+" ended. ":""; S.conc={n:x.n,l:lv||x.l||0}; return m+"Concentrating on "+x.n+"."; }
export function concEnd(why){ const o=concOf(); if(!o) return ""; delete S.conc; return "Concentration on "+o.n+" ended"+(why?" ("+why+")":"")+"."; }
function concNotes(){ const n=[]; if(hasFeat("War Caster")) n.push("War Caster gives Advantage"); if(hasFeat("Eldritch Mind")) n.push("Eldritch Mind gives Advantage"); if(hasFeat("Bladesong")) n.push("while Bladesong is active, add your Intelligence modifier"); return n; }
function concDC(d){ return Math.min(30,Math.max(10,Math.floor(d/2))); }
function concCheck(d){ const o=concOf(); if(!o||!(d>0)) return; const dc=concDC(d), nt=concNotes();
  ask("Concentration on "+o.n+": make a Constitution saving throw, DC "+dc+" (10 or half the damage, whichever is higher, up to 30). Your bonus is "+sg(D.save.CON)+"."+(nt.length?" "+nt.join(". ")+".":""),"Kept It",() =>{ toastU("Still concentrating on "+o.n+"."); },
   ["Lost It",function(){ const m=concEnd(); save(); renderConds(); refreshEntry(); if(UNDO) UNDO.A=null; toastU(m); }]); }/* v21 N2: Undo stays, and also brings Concentration back */
/* a condition that includes Incapacitated, or 0 Hit Points, ends Concentration */
function concAuto(){ const o=concOf(); if(!o) return; const why=S.hp===0?"0 Hit Points":INCAP.filter((k) =>{ return S.cond[k]; })[0]; if(!why) return; const m=concEnd(why); save(); toast(m); }
function spIx(n){ return (C.spells||[]).findIndex((x) =>{ return x.n===n; }); }
export function concChip(){ const o=concOf(); if(!o) return ""; const i=spIx(o.n);
  return '<button type="button" class="chip on conc press"'+(i>=0?' data-info="sp:'+i+'"':'')+'>Concentrating: '+esc(o.n)+'</button><button type="button" class="chip conc-x press" data-concend="1" aria-label="End Concentration on '+esc(o.n)+'">✕</button>'; }
/* header: a line under the name (phone: .mini, computer: .office) */
function concHead(){ const o=concOf(); [".band .mini",".band .office > div"].forEach((sel,j) =>{ const m=document.querySelector(sel); if(!m) return; let b=m.querySelector(".conch");
  if(!o){ if(b) b.remove(); return; } if(!b){ b=document.createElement("button"); b.type="button"; b.className="conch press"; if(!j) b.id="concH"; m.appendChild(b); }
  const i=spIx(o.n); if(i>=0) b.setAttribute("data-info","sp:"+i); else b.removeAttribute("data-info"); drawHtml(html`<i aria-hidden="true">C</i>${o.n}`, b); b.setAttribute("aria-label","Concentrating on "+o.n+". Open the spell"); b.title="Concentrating on "+o.n; }); }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-concend],[data-concon]"); if(!t) return; e.preventDefault(); e.stopPropagation();
  if(t.hasAttribute("data-concend")){ const m=concEnd(); save(); renderConds(); refreshEntry(); if(m) toast(m); return; }
  const x=(C.spells||[])[+t.getAttribute("data-concon")]; if(!x) return; const m2=concSet(x,spLvSel[x.n]!=null?spLvSel[x.n]:spRowLv(x)); save(); renderConds(); refreshEntry(); toast(m2); },true);

/* ---------- RU49 Cast and Use ---------- */
function slotLeft(k){ const r=(D.res||[]).filter((q) =>{ return q.k===k; })[0]; return r?{r:r,left:r.max-used(r.k,r.max)}:null; }
function reWord(n){ return new RegExp("(^|[^A-Za-z])"+String(n).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"([^A-Za-z]|$)"); }
/* Limited Use rows that pay for a free cast of x (species, feat, or feature rows: same source, or the spell named in the row) */
function spUses(x){ if(!x.l) return []; const src=String(x.src||""), rw=reWord(x.n);
  let rows=(D.res||[]).filter((r) =>{ if(/^s\d$|^pact$|^hd/.test(r.k)||r.item) return false; const f=r.f||"", own=r.own||"";
    const same=!!src&&((f&&(f===src||src.indexOf(f)===0||f.indexOf(src)===0))||(own&&src.indexOf(own)===0));
    return rw.test(r.n)||(same&&(f===src||/\bspell\b|Arcanum/i.test(r.n))); });
  /* v21 M1: a row naming the spell wins. Otherwise a "level N spell" row: N is the character level the species spell came at, or the spell level for a feat */
  const ex=rows.filter((r) =>{ return rw.test(r.n); }); if(ex.length) return ex;
  rows=rows.filter((r) =>{ return !(C.spells||[]).some((s) =>{ return s.n!==x.n&&reWord(s.n).test(r.n); }); });/* v21 N1: a row named after another spell is not this one */
  const lr=rows.filter((r) =>{ return /level (\d+) spell/.test(r.n); }); if(!lr.length) return rows; const want=x.gain||x.l, m=lr.filter((r) =>{ return +(/level (\d+) spell/.exec(r.n)[1])===want; });
  return m.length?m.concat(rows.filter((r) =>{ return !/level (\d+) spell/.test(r.n); })):rows; }
export function spAtWill(x){ return !x.l||/At will/i.test(x.use||""); }
function spItemOpts(x){ const c=x.itc, r=(D.res||[]).filter((q) =>{ return q.item&&q.f===c.it; })[0], o=[]; if(!r) return o; const left=r.max-used(r.k,r.max), lv0=c.lv;
  if(Array.isArray(c.c)){ for(let n=c.c[0];n<=c.c[1];n++){ const L=lv0+n-c.c[0]; o.push({k:r.k,lv:L,lab:c.it+", "+n+" charge"+(n>1?"s":"")+" (level "+L+")",left:left,free:1,need:n}); } }
  else o.push({k:r.k,lv:lv0,lab:c.it+", "+c.c+" charge"+(c.c===1?"":"s"),left:left,free:1,need:c.c});
  return o; }
export function qOk(q){ return q.left>=(q.need||1); }
export function ckOf(q){ return q.k+(q.need>1?"|"+q.need:""); }
export function spCastOpts(x){ const o=[], sc=C.spellcasting||{}; if(spAtWill(x)) return o; if(x.itc) return spItemOpts(x);
  for(let L=x.l;L<=9;L++){ const s=slotLeft("s"+L); if(s) o.push({k:"s"+L,lv:L,lab:"level "+L+" slot",left:s.left}); }
  const p=slotLeft("pact"); if(p&&sc.pact&&spPactLv()>=x.l) o.push({k:"pact",lv:spPactLv(),lab:"Pact slot (level "+spPactLv()+")",left:p.left});
  spUses(x).forEach((r) =>{ o.push({k:r.k,lv:x.l,lab:r.n,left:r.max-used(r.k,r.max),free:1}); });
  return o; }
const spStepSel={};
function spStepIx(i,sl){ let v=spStepSel[i]; if(v==null||v<0||v>=sl.length){ v=0; for(let k=0;k<sl.length;k++){ if(sl[k].left>0){ v=k; break; } } spStepSel[i]=v; } return v; }
function spCastH(x,i){ let h='<div class="info-h">Cast</div><div class="spcast">', o=spCastOpts(x);
  if(spAtWill(x)) h+='<button type="button" class="btn pri press" data-cast="'+i+'" data-ck="">Cast <small>'+(x.l?'at will':'cantrip, no slot')+'</small></button>';
  else { const qb=function(q){ return '<button type="button" class="btn press'+(qOk(q)?'':' off')+'" data-cast="'+i+'" data-ck="'+esc(ckOf(q))+'" data-cl="'+q.lv+'"'+(qOk(q)?'':' disabled')+'>'+esc(q.free?"Use "+q.lab:"Cast with a "+q.lab)+' <small>'+q.left+' left</small></button>'; };
    /* v49: with two or more slot levels, one stepper picks the level and one Cast button casts */
    const sl=o.filter((q) =>{ return !q.free; }), fr=o.filter((q) =>{ return q.free; });
    if(sl.length>=2){ const si=spStepIx(i,sl), sq=sl[si];
      h+='<div class="spstep"><button type="button" class="spstep-b press" data-sstep="'+i+'|-1" aria-label="Lower slot level"'+(si<=0?' disabled':'')+'>\u2212</button><div class="spstep-v"><small>Slot</small><b>'+esc(sq.lab)+'</b><i>'+sq.left+' left</i></div><button type="button" class="spstep-b press" data-sstep="'+i+'|1" aria-label="Higher slot level"'+(si>=sl.length-1?' disabled':'')+'>+</button></div>'+qb(sq).replace('btn press','btn pri press'); fr.forEach((q) =>{ h+=qb(q); }); }
    else o.forEach((q) =>{ h+=qb(q); });
    if(!o.length) h+='<p class="muted">No spell slots or uses for this spell yet.</p>'; else if(!o.some(qOk)) h+='<p class="muted">Nothing left to cast it with. A rest restores slots and uses.</p>'; }
  if(x.rit&&x.l) h+='<button type="button" class="btn press" data-cast="'+i+'" data-ck="rit">Cast as a Ritual <small>no slot, 10 minutes longer</small></button>';
  if(x.conc){ const c=concOf(); h+=(c&&c.n===x.n)?'<button type="button" class="btn press" data-concend="1">End Concentration</button>':'<button type="button" class="btn press" data-concon="'+i+'">Concentrate on this spell</button>'; }
  return h+'</div>'+(x.conc?'<p class="muted spcn">Concentration spell. Casting it ends any other spell you concentrate on.</p>':''); }
export function castDo(i,k,lv,ok){ const x=(C.spells||[])[i]; if(!x) return; let s=null, nd=1; if(k&&k.indexOf("|")>0){ const kp=k.split("|"); k=kp[0]; nd=+kp[1]||1; }
  if(!ok&&__R.modeOn("rage")){ ask("You are raging, and Rage stops you from casting spells. Cast "+x.n+" anyway?","Cast",() =>{ castDo(i,k,lv,true); }); return; }/* v22 i4 */
  if(k&&k!=="rit"){ s=slotLeft(k); if(!s||s.left<nd){ toast("Nothing left to cast "+x.n+" with. A rest restores slots and uses."); return; } }
  undoMark("Cast "+x.n); let msg="Cast "+x.n;
  if(s){ S.used[k]=num(S.used[k],0)+nd; if(k==="pact"){ msg+=" with a Pact slot"; spLvSel[x.n]=+lv; } else if(/^s\d$/.test(k)){ msg+=" with a level "+k.slice(1)+" slot"; spLvSel[x.n]=+lv; } else { msg+=" ("+s.r.n+(nd>1?", "+nd+" charges":"")+")"; if(x.itc) spLvSel[x.n]=+lv; } }
  else if(k==="rit") msg+=" as a Ritual";
  msg+="."; if(x.conc) msg+=" "+concSet(x,+lv||x.l);
  save(); syncLU(); renderSpells(); renderConds(); refreshEntry(); toastU(msg); try{ __R.cmbCast(x.n); save(); __R.cmbRe(); }catch(er){} }
/* the CAST or USE badge in the Spells list: one way to cast it, cast now. Several (slot levels, Pact, free use): open the spell to choose */
export function quickCast(i){ const x=(C.spells||[])[i]; if(!x) return; if(spAtWill(x)){ castDo(i,"",0); return; }
  const o=spCastOpts(x), av=o.filter(qOk);
  if(av.length===1&&!x.rit){ castDo(i,ckOf(av[0]),av[0].lv); return; }
  if(!av.length&&!x.rit){ toast("Nothing left to cast "+x.n+" with. A rest restores slots and uses."); return; }
  showEntry({type:"info",spec:"sp:"+i},false); }
document.addEventListener("click",(e) =>{ const st=e.target.closest&&e.target.closest("[data-sstep]"); if(st&&!st.disabled){ e.preventDefault(); e.stopPropagation(); const pp=st.getAttribute("data-sstep").split("|"), ii=+pp[0]; spStepSel[ii]=(spStepSel[ii]||0)+(+pp[1]); showEntry({type:"info",spec:"sp:"+ii},false); return; }
  const q=e.target.closest&&e.target.closest("[data-qcast]"); if(q){ e.preventDefault(); e.stopPropagation(); quickCast(+q.getAttribute("data-qcast")); return; }
  const b=e.target.closest&&e.target.closest("[data-cast]"); if(!b||b.disabled) return; e.preventDefault(); e.stopPropagation(); castDo(+b.getAttribute("data-cast"),b.getAttribute("data-ck")||"",+b.getAttribute("data-cl")||0); },true);

/* ---------- RU55 Temporary Hit Points from features and spells ---------- */
export function tmpFeat(n,d){ const cl=clsLvls();
  if(n==="Dark One's Blessing") return {v:Math.max(1,D.mod.CHA+(cl.Warlock||0)),s:"Charisma modifier plus Warlock level, when you or someone within 10 feet drops an enemy to 0 Hit Points"};
  if(n==="Inspiring Leader"){ const ab=/\bWIS \+1/.test(d||"")?"WIS":/\bCHA \+1/.test(d||"")?"CHA":(D.mod.WIS>D.mod.CHA?"WIS":"CHA"); return {v:Math.max(0,D.level+D.mod[ab]),s:"character level plus "+ABN[ab]+" modifier, after a Short or Long Rest"}; }
  if(n==="Chef") return {v:D.pb,s:"Proficiency Bonus, when you eat a Bolstering Treat (Bonus Action)"};
  if(n==="Wild Shape"&&cl.Druid) return hasFeat("Circle Forms")?{v:3*cl.Druid,s:"three times your Druid level (Circle Forms), when you assume a Wild Shape form"}:{v:cl.Druid,s:"your Druid level, when you assume a Wild Shape form"};
  if(n==="Circle Forms"&&cl.Druid) return {v:3*cl.Druid,s:"three times your Druid level, when you assume a Wild Shape form"};
  if(n==="Fiendish Vigor") return {v:12,s:"False Life with the highest roll (2d4 + 4)"};
  return null; }
function tmpBtn(v,src){ return '<button type="button" class="btn pri press" data-tmpapply="'+v+'" data-tmpsrc="'+esc(src)+'">Apply '+v+' Temp HP</button>'; }
function tmpFeatH(f){ const t=tmpFeat(f.n,f.d); if(!t) return ""; return '<div class="info-h">Temporary Hit Points</div><p class="info-d"><b>'+t.v+'</b>: '+esc(t.s)+'. They do not add to Temporary Hit Points you already have. You keep the higher number.</p><div class="spcast">'+tmpBtn(t.v,f.n)+'</div>'; }
function tmpSpellH(x,lv){ const L=Math.max(x.l||1,lv||x.l||1);
  if(x.n==="Armor of Agathys"){ const v=5*L; return '<div class="info-h">Temporary Hit Points</div><p class="info-d"><b>'+v+'</b> at level '+L+' (5 per slot level).</p><div class="spcast">'+tmpBtn(v,x.n)+'</div>'; }
  if(x.n==="False Life"){ const add=4+5*(L-1); return '<div class="info-h">Temporary Hit Points</div><p class="info-d">2d4 + '+add+' at level '+L+'. Roll 2d4 and type the dice total.</p><div class="iuse"><input type="number" min="2" max="8" inputmode="numeric" data-tmpdice="'+add+'" placeholder="2d4" aria-label="2d4 total"><button type="button" class="btn pri press" data-tmproll="'+add+'" data-tmpsrc="'+esc(x.n)+'">Apply</button></div>'; }
  if(x.n==="Heroism"){ const m=Math.max(0,scOf(x).mod||0); return '<div class="info-h">Temporary Hit Points</div><p class="info-d">The target gains <b>'+m+'</b> (your spellcasting modifier) at the start of each of its turns.</p><div class="spcast">'+tmpBtn(m,x.n)+'</div>'; }
  return ""; }
export function tmpApply(v,src,join){ v=Math.max(0,Math.round(v)); if(!v){ toast("No Temporary Hit Points to apply."); return; }
  const go=function(){ if(join&&UNDO) UNDO.A=null; else undoMark("Temporary Hit Points"); S.tmp=v; save(); syncHP(); refreshEntry(); toastU("Temporary Hit Points: "+v+" ("+src+")."); };
  if(S.tmp>0){ ask("You have "+S.tmp+" Temporary Hit Points. They do not stack with the "+v+" from "+src+". Keep the ones you have, or take the new ones?","Take "+v,go,["Keep "+S.tmp,function(){}]); return; }/* v21 i1, i4 */
  go(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-tmpapply],[data-tmproll]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.hasAttribute("data-tmpapply")){ tmpApply(+b.getAttribute("data-tmpapply"),b.getAttribute("data-tmpsrc")); return; }
  const inp=b.parentNode.querySelector("[data-tmpdice]"), d=Math.floor(num(inp&&inp.value,0)); if(d<2||d>8){ toast("Type the 2d4 total, 2 to 8."); if(inp) inp.focus(); return; } tmpApply(d+(+b.getAttribute("data-tmproll")),b.getAttribute("data-tmpsrc")); },true);

/* ---------- RU51 consumables: potions, scrolls, ammunition ---------- */
const POT={"":"2d4 + 2",Greater:"4d4 + 4",Superior:"8d4 + 8",Supreme:"10d4 + 20"};
function useH(it,ix){ const n=it.n, pm=/^Potion of Healing(?: \((Greater|Superior|Supreme)\))?$/.exec(n), q=num(it.q,1);
  if(pm) return '<div class="info-h">Drink</div><p class="info-d">You regain '+POT[pm[1]||""]+' Hit Points. Roll the dice and type the total.</p>'+(q>0?'<div class="iuse"><input type="number" min="1" inputmode="numeric" data-potv="'+ix+'" placeholder="total" aria-label="Hit Points rolled"><button type="button" class="btn pri press" data-potgo="'+ix+'" data-potn="'+esc(it.key||it.n)+'">Drink</button></div>':'<p class="muted">None left.</p>');
  if(/^Spell Scroll\b/.test(n)) return '<div class="info-h">Use</div><p class="info-d">Reading the scroll casts its spell, and the scroll turns to dust.</p>'+(q>0?'<div class="spcast"><button type="button" class="btn pri press" data-scroll="'+ix+'" data-potn="'+esc(it.key||it.n)+'">Use Scroll</button></div>':'<p class="muted">None left.</p>');
  if(CONS1.test(n)) return '<div class="info-h">Use</div>'+(q>0?'<p class="info-d">'+q+' left. Use 1 takes one away, Undo puts it back.</p><div class="ipk"><button type="button" class="btn pri press" data-use1="'+ix+'" data-potn="'+esc(it.key||it.n)+'">'+ico("ui-check")+'Use 1</button></div>':'<p class="muted">None left. Raise the Qty below when you get more.</p>');/* v32 RU134 */
  const a=ammoInfo(it); return a?ammoH(a):""; }
function qtyAdj(nm,ix,d,lbl,after){ const it=invAt(nm,ix); if(!it) return; const q=Math.max(0,num(it.q,1)+d);
  const go=function(){ undoMark(lbl); if(viaBld(nm)&&window.__bldSetQty) window.__bldSetQty(nm,q,occOf(invAt(nm,ix))); else { const i2=invAt(nm,ix); if(i2){ i2.q=q; bldSync(nm,{q:q,occ:occOf(i2)}); saveC(); } } if(after) after(); __R.renderAll(); refreshEntry(); };
  if(viaBld(nm)&&window.__bldSetQty) bldGuard(go); else go(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-potgo],[data-scroll]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const nm=b.getAttribute("data-potn");
  if(b.hasAttribute("data-scroll")){ const ix=+b.getAttribute("data-scroll"); qtyAdj(nm,ix,-1,"Use "+nm,() =>{ toastU("Used "+nm+"."); }); return; }
  const ix2=+b.getAttribute("data-potgo"), inp=$("#sheetBody [data-potv]"), v=Math.floor(num(inp&&inp.value,0)); if(v<1){ toast("Type the total you rolled."); if(inp) inp.focus(); return; }
  qtyAdj(nm,ix2,-1,"Drink "+nm,() =>{ const was0=S.hp===0, bf=S.hp; S.hp=Math.min(D.hpmax,S.hp+v); if(was0) S.ds=[0,0]; if(S.hp>bf) flash("healed"); save(); syncHP(); toastU("Drank "+nm+": "+(S.hp-bf)+" "+hpWord(S.hp-bf)+" regained."); }); },true);
/* ammunition: the count is kept in S.ammo (used pieces per item). Total = quantity x the number in the name ("Arrows (20)") */
const AMMO=[[/Crossbow/i,"Bolt"],[/Longbow|Shortbow/i,"Arrow"],[/Sling/i,"Sling Bullet"],[/Blowgun/i,"Needle"],[/Laser|Antimatter/i,"Energy Cell"],[/Musket|Pistol|Revolver|Rifle|Shotgun/i,"Firearm Bullet"]];
function ammoKind(n){ const k=AMMO.filter((a) =>{ return a[0].test(n); })[0]; return k?k[1]:null; }
/* v48: the gear names "Bullets, Firearm (10)" and "Bullets, Sling (20)" count as Firearm Bullet and Sling Bullet */
function ammoNm(n){ return String(n||"").replace(/^Bullets, (Firearm|Sling)\b/,"$1 Bullet"); }
function ammoInfo(it){ if(!it) return null; const m=/^(Arrow|Bolt|Sling Bullet|Needle|Firearm Bullet|Energy Cell)s?\b/.exec(ammoNm(it.n)); if(!m) return null; const per=+((/\((\d+)\)/.exec(it.n)||[0,1])[1]), tot=Math.max(0,num(it.q,1))*per, k=invKey(it), u=clamp(num((S.ammo||{})[k],0),0,tot); return {it:it,k:k,tot:tot,used:u,left:tot-u}; }
/* v102: magic ammunition ("Arrow, +2"). Its bonus goes to the attack roll and the damage of a weapon that uses that kind of ammunition.
   One kind in the pack: used. More than one: the player picks (S.ammoAct[kind] = item key, or "none"). Used up pieces do not count */
function ammoMagic(kd){ const re=new RegExp("^"+kd+"s?, \\+(\\d)\\b"); return (C.inv||[]).map((i) =>{ const m=re.exec(ammoNm(i.n)), inf=m?ammoInfo(i):null; return inf&&inf.left>0?{it:i,n:+m[1],k:invKey(i),left:inf.left}:null; }).filter(Boolean); }
function ammoActive(kd){ const L=ammoMagic(kd); if(!L.length) return {L:L,on:null}; const ch=(S.ammoAct||{})[kd]; if(ch==="none") return {L:L,on:null}; let pick=L.filter((x) =>{ return x.k===ch; })[0]; if(!pick&&L.length===1) pick=L[0]; return {L:L,on:pick||null}; }
function ammoBonus(a){ if(!a||!/Ammunition/.test(String(a.sub||""))) return null; const kd=ammoKind(a.n); if(!kd) return null; const r=ammoActive(kd); return r.L.length?{kd:kd,L:r.L,on:r.on}:null; }
function ammoFor(a){ if(!/Ammunition/.test(String(a.sub||""))) return null; const kd=ammoKind(a.n); if(!kd) return null; const act=ammoActive(kd).on, re=new RegExp("^"+kd+"s?\\b"), all=(C.inv||[]).filter((i) =>{ return re.test(ammoNm(i.n)); }), it=act?act.it:(all.filter((i) =>{ return !/^[A-Za-z ]+s?, \+\d/.test(ammoNm(i.n)); })[0]||all[0]); return it?ammoInfo(it):{none:kd}; }
function ammoPickH(a){ const b=ammoBonus(a); if(!b) return ""; const on=b.on&&b.on.k;
  return '<div class="info-h">Magic ammunition</div><p class="info-d">'+(b.on?'Using <b>'+esc(b.on.it.n)+'</b>: '+sg(b.on.n)+' to the attack roll and the damage roll.':'No magic ammunition selected. Pick the one you are firing.')+'</p><div class="spcast">'+b.L.map((x) =>{ return '<button type="button" class="btn press'+(x.k===on?' pri':'')+'" data-ammoact="'+esc(b.kd)+'" data-ak="'+esc(x.k)+'">'+esc(x.it.n)+' ('+x.left+')</button>'; }).join("")+'<button type="button" class="btn press'+(!on?' pri':'')+'" data-ammoact="'+esc(b.kd)+'" data-ak="none">None</button></div>'; }
function ammoH(a){ if(!a) return ""; if(a.none) return '<div class="info-h">Ammunition</div><p class="muted">No '+esc(a.none)+'s in your inventory.</p>';
  return '<div class="info-h">Ammunition: '+esc(a.it.n)+'</div><p class="info-d"><b>'+a.left+'</b> of '+a.tot+' left. After a fight you can spend 1 minute to recover half of what you used (round down).</p><div class="spcast"><button type="button" class="btn pri press" data-ammo="'+esc(a.k)+'" data-ad="1"'+(a.left?'':' disabled')+'>Use 1</button><button type="button" class="btn press" data-ammo="'+esc(a.k)+'" data-ad="-1"'+(a.used?'':' disabled')+'>Get 1 Back</button><button type="button" class="btn press" data-ammo="'+esc(a.k)+'" data-ad="half"'+(a.used>1?'':' disabled')+'>Recover Half ('+Math.floor(a.used/2)+')</button></div>'; }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-ammo]"); if(!b||b.disabled) return; e.preventDefault(); e.stopPropagation(); const k=b.getAttribute("data-ammo"), it=(C.inv||[]).filter((i) =>{ return invKey(i)===k; })[0], a=ammoInfo(it); if(!a) return;
  const d=b.getAttribute("data-ad"), nu=d==="half"?a.used-Math.floor(a.used/2):clamp(a.used+(+d),0,a.tot); undoMark(d==="1"?"Use ammunition":"Recover ammunition"); S.ammo=S.ammo||{}; S.ammo[k]=nu; if(!nu) delete S.ammo[k]; save(); refreshEntry();
  toastU(d==="1"?"Used 1 from "+it.n+". "+(a.tot-nu)+" left.":"Recovered "+(a.used-nu)+". "+(a.tot-nu)+" left."); },true);

document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-ammoact]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const kd=b.getAttribute("data-ammoact"), k=b.getAttribute("data-ak"); undoMark("Choose ammunition"); S.ammoAct=S.ammoAct||{}; S.ammoAct[kd]=k; save(); __R.renderAll(); refreshEntry(); },true);/* v102 */
/* ---------- RU44 charges rolled on dice ---------- */
function chMaxH(r){ if(!r.dmax) return ""; const v=(S.chMax||{})[r.k]; return '<div class="chmax"><label>Starting '+(/Necklace of Fireballs/.test(r.n)?'beads':'charges')+' (roll '+esc(r.dmax)+')<input type="number" min="0" inputmode="numeric" data-chmax="'+esc(r.k)+'" value="'+(v!=null?v:"")+'" placeholder="up to '+r.max0+'"></label>'+(v==null?'<small class="muted">Roll '+esc(r.dmax)+' and type the result. Until then the sheet shows the highest possible number.</small>':'')+'</div>'; }
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.matches||!t.matches("[data-chmax]")) return; const k=t.getAttribute("data-chmax"); S.chMax=S.chMax||{}; if(t.value===""){ delete S.chMax[k]; } else S.chMax[k]=Math.max(0,Math.round(num(t.value,0))); save(); derive(); syncLU(); renderActions(); refreshEntry(); });

/* ---------- RU45 Hit Point maximum modifier and override ---------- */
function hpModH(){ return '<div class="info-h">Change the Maximum</div><div class="hpmods"><label>Max HP modifier<input type="number" inputmode="numeric" data-hpmod="1" value="'+(num(S.hpMod,0)||"")+'" placeholder="0"></label><label>Override Max HP<input type="number" min="1" inputmode="numeric" data-hpover="1" value="'+(num(S.hpOver,0)>0?S.hpOver:"")+'" placeholder="none"></label></div><p class="bk-f">A modifier adds to or takes from the maximum, for example a curse that lowers it. An override replaces the total. The Long Rest dialog can reset both.</p>'+hpQuickH(); }
/* v100: spells that others cast on you change your maximum. Aid adds 5 (5 more per slot level above 2), Heroes' Feast adds 2d10, Harm lowers it. One tap applies the number and moves the current Hit Points the way the rules say */
function hpQuickH(){ return '<div class="info-h">Spells cast on you</div><p class="bk-f">Aid, Heroes\' Feast and Harm change your maximum. <button type="button" class="lk" data-info="spx:1">Apply one of them</button></p>'; }
function spxBody(){ let d=num(S.hpMod,0), i, aid="";
  for(i=2;i<=9;i++) aid+='<button type="button" class="btn press spx-c" data-spxdo="aid:'+i+'">'+i+'<small>+'+5*(i-1)+'</small></button>';
  return '<div class="dc"><p class="info-d">Hit Point maximum <b>'+D.hpmax+'</b>'+(d?' (spells and other changes: '+(d>0?"+":"")+d+')':'')+'. Current Hit Points <b>'+num(S.hp,0)+'</b>.</p>'
   +'<div class="info-h">Aid</div><p class="info-d">Pick the slot level the caster used. Your maximum and current Hit Points rise by the amount shown. It lasts 8 hours.</p><div class="spx-r">'+aid+'</div>'
   +'<div class="info-h">Heroes\' Feast</div><p class="info-d">Adds 2d10 to your maximum and to your current Hit Points. It lasts 24 hours.</p><div class="spx-f"><button type="button" class="btn pri press" data-spxdo="feast:r">Roll 2d10 and apply</button><input type="number" min="2" max="20" inputmode="numeric" data-spx-feast="1" placeholder="or your roll" aria-label="Your 2d10 roll"><button type="button" class="btn press" data-spxdo="feast:m">Apply</button></div>'
   +'<div class="info-h">Harm</div><p class="info-d">Lowers your maximum by the Necrotic damage you took. It lasts until a Long Rest. Your current Hit Points drop to the new maximum if needed.</p><div class="spx-f"><input type="number" min="1" inputmode="numeric" data-spx-harm="1" placeholder="Necrotic damage" aria-label="Necrotic damage taken"><button type="button" class="btn press" data-spxdo="harm">Lower maximum</button></div>'
   +(d?'<div class="info-h">Effect ended</div><p class="info-d">Remove every Hit Point maximum change, including ones you typed in yourself.</p><button type="button" class="btn press" data-spxdo="end">Remove all changes</button>':'')+'</div>'; }
function hpFx(amt,why){ if(!amt) return; const om=D.hpmax; S.hpMod=num(S.hpMod,0)+amt; if(!S.hpMod) delete S.hpMod; derive();
  if(S.hp!=null){ if(D.hpmax>om) S.hp=Math.min(D.hpmax,S.hp+(D.hpmax-om)); else S.hp=Math.min(S.hp,D.hpmax); }
  save(); syncHP(true); renderTiles(); refreshEntry(); toast(why+": maximum "+D.hpmax+", current "+num(S.hp,0)+"."); }
document.addEventListener("click",(e) =>{ const t=e.target&&e.target.closest&&e.target.closest("[data-spxdo]"); if(!t) return; let k=t.getAttribute("data-spxdo").split(":"), q=function(a){ return document.querySelector("["+a+"]"); }, v;
  if(k[0]==="aid") hpFx(5*(+k[1]-1),"Aid");
  else if(k[0]==="feast"){ if(k[1]==="r") v=2+Math.floor(Math.random()*10)+Math.floor(Math.random()*10); else v=Math.round(num(q("data-spx-feast").value,0)); if(v<2||v>20){ toast("Enter your 2d10 roll, 2 to 20."); return; } hpFx(v,"Heroes' Feast +"+v); }
  else if(k[0]==="harm"){ v=Math.round(num(q("data-spx-harm").value,0)); if(v<1){ toast("Enter the Necrotic damage you took."); return; } hpFx(-v,"Harm -"+v); }
  else if(k[0]==="end"){ const d0=num(S.hpMod,0); if(d0) hpFx(-d0,"Changes removed"); } });
function hpSpellNote(x){ if(!x||["Aid","Heroes\' Feast","Harm"].indexOf(x.n)<0) return ""; return '<p class="info-d dc-mat">Cast on you? <button type="button" class="lk" data-info="spx:1">Apply it to your Hit Points</button></p>'; }
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.matches||!t.matches("[data-hpmod],[data-hpover]")) return; const v=Math.round(num(t.value,0)), k=t.hasAttribute("data-hpmod")?"hpMod":"hpOver";
  if(!v||(k==="hpOver"&&v<1)) delete S[k]; else S[k]=v; const om=D.hpmax; derive(); if(S.hp!=null&&D.hpmax>om) S.hp=Math.min(D.hpmax,S.hp+(D.hpmax-om)); save(); syncHP(true); renderTiles(); refreshEntry(); toast("Hit Point maximum is now "+D.hpmax+"."); });

/* ---------- RU54, RU72, RU44, RU45 rest additions ---------- */
var restX={};
function periOn(){ return (C.inv||[]).some((i) =>{ return (i.n==="Periapt of Wound Closure"||i.n==="Blessing of Wound Closure")&&eqOn(i); }); }/* v27 RD23 */
function hdHeal(v){ return Math.max(1,v+D.mod.CON)*(periOn()?2:1); }
function recList(){ const o=[]; [["Wizard","Arcane Recovery",/^Arcane Recovery$/],["Druid","Natural Recovery",/^Natural Recovery: recover slots$/]].forEach((q) =>{ const lv=lvOf(q[0]), r=(D.res||[]).filter((x) =>{ return q[2].test(x.n); })[0]; if(!lv||!r) return; o.push({n:q[1],r:r,cap:Math.ceil(lv/2),left:r.max-used(r.k,r.max)}); }); return o; }
function slotUsed(L){ const s=slotLeft("s"+L); return s?s.r.max-s.left:0; }
function recSum(i){ let t=0, m=restX.rec&&restX.rec[i]||{}; Object.keys(m).forEach((L) =>{ t+=(+L)*num(m[L],0); }); return t; }
function shortExtraH(){ let h=""; if(periOn()) h+='<p class="info-d">Periapt of Wound Closure: each Hit Point Die heals twice as much.</p>';
  if(hasFeat("Chef")) h+='<div class="rx"><label class="ck"><input type="checkbox" data-rchef="1"'+(restX.chef?' checked':'')+'> Replenishing Meal (Chef): an extra 1d8 Hit Points if you spend Hit Point Dice</label>'+(restX.chef?'<label class="hdv">1d8 roll<input type="number" min="1" max="8" data-rchefv="1" value="'+(restX.chefV||"")+'" placeholder="roll"></label>':'')+'</div>';
  recList().forEach((q,i) =>{ if(!q.left) return; let any=false, rows=""; for(let L=1;L<=5;L++){ const u=slotUsed(L); if(!u) continue; any=true; const cur=num((restX.rec&&restX.rec[i]||{})[L],0); rows+='<label class="hdv">Level '+L+' slots<select data-rrec="'+i+'" data-rl="'+L+'">'; for(let n=0;n<=u;n++) rows+='<option value="'+n+'"'+(n===cur?' selected':'')+'>'+n+'</option>'; rows+='</select></label>'; }
    h+='<div class="rx"><div class="info-h">'+esc(q.n)+'</div><p class="info-d">Recover spent spell slots with a combined level up to '+q.cap+' (half your '+(q.n==="Arcane Recovery"?"Wizard":"Druid")+' level, rounded up), none of level 6 or higher. Once per Long Rest.</p>'+(any?rows+'<p class="muted" id="rrecT'+i+'">Chosen: '+recSum(i)+' of '+q.cap+' levels</p>':'<p class="muted">No spent slots of level 1 to 5.</p>')+'</div>'; });
  shortChg().forEach((r) =>{ h+=chgRow(r); }); return h; }
function chgRows(kinds){ return (D.res||[]).filter((r) =>{ return r.rg&&kinds.indexOf(r.when)>=0&&used(r.k,r.max)>0; }); }
function shortChg(){ return chgRows(["short"]); }
function chgRow(r){ return '<label class="hdv">'+esc(r.n)+': charges regained ('+esc(r.rg)+')<input type="number" min="0" inputmode="numeric" data-rchg="'+esc(r.k)+'" value="'+(restX.chg&&restX.chg[r.k]!=null?restX.chg[r.k]:"")+'" placeholder="roll"></label>'; }
function lrNotes(){ const cl=clsLvls(), o=[], r14=x14(), all=(r14?["Artificer","Cleric","Druid","Paladin","Wizard"]:["Cleric","Druid","Wizard"]).filter((c) =>{ return cl[c]; }), one=(r14?[]:["Paladin","Ranger"]).filter((c) =>{ return cl[c]; });/* v94: in the 2014 rules the prepared casters are Artificer, Cleric, Druid, Paladin, and Wizard, and there is no Weapon Mastery */
  if(all.length) o.push("Change your list of prepared spells ("+all.join(", ")+").");
  if(one.length) o.push("Replace one prepared spell with another ("+one.join(", ")+").");
  if(cl.Wizard&&!r14) o.push("Replace one Wizard cantrip with another (Wizard).");
  const wm1=(r14?[]:["Barbarian","Fighter"]).filter((c) =>{ return cl[c]; }), wmA=(r14?[]:["Paladin","Ranger","Rogue"]).filter((c) =>{ return cl[c]; });
  if(wm1.length) o.push("Change one of your Weapon Mastery weapon kinds ("+wm1.join(", ")+").");
  if(wmA.length) o.push("Change any of your Weapon Mastery weapon kinds ("+wmA.join(", ")+").");
  if(!r14&&hasFeat("Weapon Master")) o.push("Swap the weapon kind of your Weapon Master feat.");/* v21 m2 */
  if(cl.Druid>=2&&!r14) o.push("Replace one of your known Wild Shape forms (Druid).");
  if(!r14&&/High Elf/.test(String(C.species||""))) o.push("Swap your High Elf cantrip for another Wizard cantrip.");
  if(!r14&&hasFeat("Aspect of the Wilds")) o.push("Change your Aspect of the Wilds option.");
  return o; }
function longExtraH(){ let h="", lc=chgRows(["dawn","dusk","long"]);
  if(lc.length) h+='<div class="rx"><div class="info-h">Charges</div><p class="info-d">These items regain a rolled number of charges at dawn or dusk. Type each roll. Leave a box empty to change it later.</p>'+lc.map(chgRow).join("")+'</div>';
  if(num(S.hpMod,0)||num(S.hpOver,0)>0) h+='<label class="ck rx"><input type="checkbox" data-rhpreset="1"'+(restX.hpReset?' checked':'')+'> Reset Maximum HP changes (modifier '+sg(num(S.hpMod,0))+(num(S.hpOver,0)>0?', override '+S.hpOver:'')+')</label>';
  const nt=lrNotes(); if(nt.length) h+='<div class="rx"><div class="info-h">After this rest you can also</div><ul class="rest-notes">'+nt.map((t) =>{ return '<li>'+esc(t)+'</li>'; }).join("")+'</ul><button type="button" class="btn press" data-restbld="1">Open the Builder</button></div>';
  return h; }
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.closest||!t.closest("#restDlg")) return; const kind=t.closest("#restDlg").getAttribute("data-kind");
  if(t.matches("[data-rchef]")){ restX.chef=t.checked; restRefresh(kind); return; }
  if(t.matches("[data-rhpreset]")){ restX.hpReset=t.checked; restRefresh(kind); return; }
  if(t.matches("[data-rrec]")){ const i=+t.getAttribute("data-rrec"); restX.rec=restX.rec||{}; restX.rec[i]=restX.rec[i]||{}; restX.rec[i][t.getAttribute("data-rl")]=+t.value; const q=recList()[i], el=document.getElementById("rrecT"+i); if(el&&q){ const s=recSum(i); el.textContent="Chosen: "+s+" of "+q.cap+" levels"+(s>q.cap?" (too many)":""); el.classList.toggle("caution",s>q.cap); } return; } });
document.addEventListener("input",(e) =>{ const t=e.target; if(!t.matches) return; if(t.matches("#restDlg [data-rchefv]")) restX.chefV=Math.floor(num(t.value,0)); if(t.matches("#restDlg [data-rchg]")){ restX.chg=restX.chg||{}; if(t.value==="") delete restX.chg[t.getAttribute("data-rchg")]; else restX.chg[t.getAttribute("data-rchg")]=Math.max(0,Math.floor(num(t.value,0))); } });
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-restbld]"); if(!b) return; e.preventDefault(); closeSheet(); const bb=document.getElementById("bldBtn"); if(bb) bb.click(); });
function chgApply(rows){ let n=0; rows.forEach((r) =>{ const v=restX.chg&&restX.chg[r.k]; if(v==null) return; S.used[r.k]=Math.max(0,used(r.k,r.max)-v); n++; }); return n; }


