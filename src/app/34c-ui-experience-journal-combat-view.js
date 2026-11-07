/* Responsibility: experience and level up, the journal and the Combat View body. Split out of the former single file 34 in SOLID stage 9 (S); runs in the same order as before. */
import {fmtInt} from "./lib/fmt.js";import {C,S,save} from "./04-logic-storage.js";import {$,ask,atkOn,clamp,esc,num,sg,toast} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {boxes,used} from "./08-ui-render-sheet-and-actions.js";import {renderNotes} from "./08c-ui-render-inventory-features-notes.js";import {activeConds} from "./10-ui-conditions.js";import {__set_navStack,openSheet,sheetMode} from "./12-ui-bottom-sheet-modal.js";import {closeSheetIfOn} from "./13b-ui-detail-spell-targets-render.js";import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {pinnedH} from "./27c-ui-report-pins.js";import {concChip,concOf} from "./32b-logic-play-concentration-casting.js";import {toastU,undoMark} from "./32-logic-play-undo-actions.js";import {__R} from "./00-reg.js";import {env} from "./00-env.js";import {sitAtk,sitCombatH} from "./34-ui-situations.js";import {cfFlags,modeChips,noActH} from "./34b-ui-combat-effects-modes.js";
Object.defineProperty(__R,"combatHTML",{get:function(){return combatHTML;},set:function(v){combatHTML=v;},configurable:true});
Object.defineProperty(__R,"fmtN",{get:function(){return fmtN;},set:function(v){fmtN=v;},configurable:true});
Object.defineProperty(__R,"jrnH",{get:function(){return jrnH;},set:function(v){jrnH=v;},configurable:true});
Object.defineProperty(__R,"levelUp",{get:function(){return levelUp;},set:function(v){levelUp=v;},configurable:true});
Object.defineProperty(__R,"xpBox",{get:function(){return xpBox;},set:function(v){xpBox=v;},configurable:true});
const XPT=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
function fmtN(n){ return fmtInt(n); }
function xpH(){ const lv=D.level, ms=S.lvMode==="milestone", xp=Math.max(0,Math.floor(num(S.xp,0))), next=lv<20?XPT[lv]:null, prev=XPT[lv-1]||0, ready=!ms&&next!=null&&xp>=next, pct=next?clamp((xp-prev)/(next-prev)*100,0,100):100;
  return '<div class="xph"><b>Level '+lv+'</b>'+(ms?'<span>Milestones</span>':'<span>XP '+fmtN(xp)+(next!=null?' / '+fmtN(next):'')+'</span>')+'</div>'+
   (ms?'':'<div class="xpbar" role="progressbar" aria-label="Experience toward the next level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(pct)+'"><i style="transform:scaleX('+(pct/100)+')"></i></div>')+
   '<div class="xpbtns"><button type="button" class="btn press xpb" data-xpopen="1">'+(ms?'Leveling':'Add XP')+'</button>'+(lv<20&&!ready?'<button type="button" class="btn press xpb" data-lvup="1">Level Up</button>':'')+'</div>'+/* v30 C3 */
   (ready?'<button type="button" class="btn pri press lvup" data-lvup="1">Level Up: you reached level '+(lv+1)+'</button>':''); }
function xpDlg(){ const ms=S.lvMode==="milestone"; return '<div id="xpDlg"><p class="info-d">'+(ms?'Your group levels up at story milestones. Use Level Up when the DM says so.':'Experience points: <b>'+fmtN(Math.floor(num(S.xp,0)))+'</b>. Level '+D.level+(D.level<20?', next level at '+fmtN(XPT[D.level])+' XP':'')+'.')+'</p>'+
  (ms?'':'<div class="xpadd"><input type="number" min="0" inputmode="numeric" data-xpamt="1" placeholder="XP" aria-label="Experience points"><button type="button" class="btn pri press" data-xpadd="1">Add</button><button type="button" class="btn press" data-xpadd="-1">Remove</button></div>')+
  '<label class="ck"><input type="checkbox" data-xpmode="1"'+(ms?' checked':'')+'> Level by milestones instead of XP</label>'+(D.level<20?'<button type="button" class="btn press lvup" data-lvup="1">Level Up</button>':'')+'</div>'; }
function xpBox(){ const f=$("#idF"); if(!f) return; let b=$("#xpBox"); if(!b){ b=document.createElement("div"); b.id="xpBox"; b.className="xpl"; f.parentNode.insertBefore(b,f.nextSibling); } b.innerHTML=xpH(); }
export function levelUp(){ if(D.level>=20){ toast("Level 20 is the highest level."); return; } if(env.__bldLevelUp) env.__bldLevelUp(); else { const bb=$("#bldBtn"); if(bb) bb.click(); } }
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.matches||!t.matches("[data-xpmode]")) return; S.lvMode=t.checked?"milestone":"xp"; save(); xpBox(); const b=$("#sheetBody"); if(b&&sheetMode==="xp") b.innerHTML=xpDlg(); });
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-xpopen],[data-xpadd],[data-lvup]"); if(!t||t.closest("#bld")) return;/* v22 p14: the builder's own Level Up */ e.preventDefault();
  if(t.hasAttribute("data-lvup")){ closeSheetIfOn(); levelUp(); return; }
  if(t.hasAttribute("data-xpopen")){ __set_navStack([]); openSheet("Experience", xpDlg(), "xp"); return; }
  const inp=t.parentNode.querySelector("[data-xpamt]"), v=Math.floor(num(inp&&inp.value,0)); if(v<=0){ toast("Type an amount of XP first."); if(inp) inp.focus(); return; }
  undoMark(t.getAttribute("data-xpadd")==="1"?"Add XP":"Remove XP"); const before=Math.floor(num(S.xp,0)); S.xp=Math.max(0,before+(+t.getAttribute("data-xpadd"))*v); save(); xpBox(); const bd=$("#sheetBody"); if(bd&&sheetMode==="xp") bd.innerHTML=xpDlg();
  const nx=D.level<20?XPT[D.level]:null; toastU((S.xp>=before?"XP: "+fmtN(S.xp)+".":"XP: "+fmtN(S.xp)+".")+(nx!=null&&S.xp>=nx&&before<nx?" You reached level "+(D.level+1)+". Tap Level Up.":"")); });

/* ---------- RU70 session journal ---------- */
function today(){ const d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function jrnH(){ const L=Array.isArray(S.journal)?S.journal:[];
  return '<h3 class="noteh">'+ico("ui-book")+'Session Journal</h3><div class="jform"><div class="jrow"><label>Date<input type="date" id="j-date" value="'+today()+'"></label><label>Title<input id="j-title" placeholder="Session 12: The Sunken Gate"></label></div>'+
   '<label>What happened<textarea id="j-notes" rows="3"></textarea></label><div class="jrow"><label>Loot<input id="j-loot" placeholder="Items, coins"></label><label>XP<input type="number" min="0" inputmode="numeric" id="j-xp" placeholder="0"></label></div>'+
   '<label class="ck"><input type="checkbox" id="j-addxp" checked> Add this XP to your total</label><button type="button" class="btn pri press" data-jadd="1">Add Entry</button></div>'+
   (L.length?L.map((j) =>{ return '<div class="jent"><div class="jh"><b>'+esc(j.ti||"Session")+'</b><span>'+esc(j.d||"")+(num(j.xp,0)?' • '+fmtN(num(j.xp,0))+' XP':'')+'</span><button type="button" class="lk" data-jdel="'+esc(j.id)+'" aria-label="Delete entry '+esc(j.ti||j.d||"")+'">Delete</button></div>'+(j.n?'<p>'+esc(j.n).replace(/\n/g,"<br>")+'</p>':'')+(j.loot?'<p class="muted">Loot: '+esc(j.loot)+'</p>':'')+'</div>'; }).join(""):'<p class="muted">No entries yet.</p>'); }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-jadd],[data-jdel]"); if(!t) return; e.preventDefault();
  if(t.hasAttribute("data-jdel")){ const id=t.getAttribute("data-jdel"), j=(S.journal||[]).filter((x) =>{ return x.id===id; })[0]; if(!j) return;
    ask("Delete the journal entry \""+(j.ti||j.d||"Session")+"\"?","Delete",() =>{ undoMark("Delete journal entry"); S.journal=S.journal.filter((x) =>{ return x.id!==id; }); save(); renderNotes(); toastU("Journal entry deleted."); }); return; }
  const g=function(id){ const el=document.getElementById(id); return el?el.value.trim():""; }, xp=Math.max(0,Math.floor(num(g("j-xp"),0)));
  if(!g("j-title")&&!g("j-notes")&&!g("j-loot")&&!xp){ toast("Write a title, notes, loot, or XP first."); return; }
  undoMark("Add journal entry"); S.journal=Array.isArray(S.journal)?S.journal:[]; S.journal.unshift({id:"j"+Date.now().toString(36),d:g("j-date"),ti:g("j-title"),n:g("j-notes"),loot:g("j-loot"),xp:xp});
  const ax=document.getElementById("j-addxp"); if(xp&&ax&&ax.checked) S.xp=Math.max(0,Math.floor(num(S.xp,0)))+xp; save(); renderNotes(); xpBox(); toastU("Journal entry added"+(xp&&ax&&ax.checked?", "+fmtN(xp)+" XP added":"")+"."); });

/* ---------- RU62 combat view: one screen ---------- */
export function combatHTML(){ const h=combatHTML0().replace('</div>','</div>'+pinnedH()), c=__R.cmbHTML(), m='<div class="info-h">Attacks</div>', i=h.indexOf(m); return i>=0?h.slice(0,i)+c+h.slice(i):h.replace(/<\/div>$/,c+'</div>'); }/* v27 RU35 no. 9: pinned skills on top */
function combatHTML0(){ const o=concOf(), atk=(C.attacks||[]).map((a,i) =>{ if(!atkOn(a)) return ""; const d=D.atk[i]; return '<button type="button" class="cba" data-info="w:'+i+'"><b>'+esc(a.n)+'</b>'+cfFlags(sitAtk(a))+'<span>'+sg(d.hit)+'</span><span>'+esc(d.dmg)+' '+esc(a.type||"")+'</span></button>'; }).join("");
  const sl=(D.res||[]).filter((r) =>{ return /^s\d$/.test(r.k)||r.k==="pact"; }), lu=(D.res||[]).filter((r) =>{ return !/^s\d$|^pact$|^hd/.test(r.k); });
  return '<div id="cbv"><div class="cbh"><div><b>'+S.hp+'<small>/'+D.hpmax+'</small></b><span>HP'+(S.tmp?' +'+S.tmp+' temp':'')+'</span></div><div><b>'+D.ac+'</b><span>AC</span></div><div><b>'+sg(D.init)+'</b><span>Init</span></div><div><b>'+D.speed+'</b><span>Speed</span></div></div>'+
   '<div class="cbhp"><button type="button" class="btn heal press" data-cbhp="heal">Heal</button><input id="cbAmt" type="number" inputmode="numeric" min="0" placeholder="0" aria-label="Amount"><button type="button" class="btn dmg press" data-cbhp="dmg">Damage</button></div>'+
   (S.hp===0?'<p class="caution">0 Hit Points: make Death Saving Throws. Successes '+S.ds[0]+', failures '+S.ds[1]+'.</p>':'')+
   '<div class="conds cbc">'+modeChips()+(o?concChip():'')+activeConds().map((c) =>{ return '<button type="button" class="chip on press'+(c.hb?' hb':'')+'" data-info="g:'+c.k+'">'+c.k+(c.extra||"")+'</button>'; }).join("")+'<button type="button" class="chip add press" data-condopen="1">Conditions</button></div>'+noActH()+sitCombatH()+
   (atk?'<div class="info-h">Attacks</div><div class="cbas">'+atk+'</div>':'')+
   (sl.length?'<div class="info-h">Spell Slots</div>'+sl.map((r) =>{ return '<div class="cbr"><span>'+esc(r.k==="pact"?r.n:"Level "+r.k.slice(1))+'</span><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</div></div>'; }).join(""):'')+
   (lu.length?'<div class="info-h">Limited Use</div>'+lu.map((r) =>{ return '<div class="cbr"><span>'+esc(r.n)+'</span><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div></div>'; }).join(""):'')+'</div>'; }
