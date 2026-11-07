import {NOTE_FIELDS} from "./03-data-glossary.js";
import {BAD,C,FROZEN,S,recover,save} from "./04-logic-storage.js";
import {$,$$,attMaxC,eqOn,esc,num,rich} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {REDUCE,SPR,applyLook,spring} from "./07-ui-theme-contrast-spring.js";
import {__set_renderActions,__set_renderFeat,__set_renderInv,__set_renderNotes,campName,featQ,invF,renderActions,renderFeat,renderInv,renderNotes} from "./08-ui-render-sheet-and-actions.js";
import {__set_openSheet,__set_refreshEntry,__set_showEntry,lastFocus,openSheet,refreshEntry,sheet,showEntry} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {showHome} from "./15-logic-roster-backup-files-snapshots.js";
import {syncPortrait} from "./20-ui-portrait.js";
import {BCSS,PAGES,__set_goPage,__set_setTab,activeTab,bInd,curPage,goPage,moveTabInd,mq,onPagerScroll,pager,pgShow,setTab} from "./21-ui-tabs-pager.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {CONS1,invKey} from "./23b-ui-items-containers.js";import {__set_renderSpells,renderSpells} from "./23e-ui-spells-dc.js";
import {cuNm} from "./26-ui-customize.js";
import {CHAR_FIELDS,ICO,__set_renderExtras,renderExtras} from "./29-ui-ddb-look.js";
import {ICO_FCAT,ICO_TXT} from "./30-ui-icons.js";
import {ckOf,qOk,spAtWill,spCastOpts} from "./32-logic-play-undo-actions.js";
import {renderAll} from "./35-ui-combo.js";
import {qmClose} from "./39-ui-exhaustion-keys-hp-drag-pip-wakelock-onehand.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";import {CTXSRC} from "./06a-logic-ui-registry.js";
Object.defineProperty(__R,"FOPEN",{get:function(){return FOPEN;},set:function(v){FOPEN=v;},configurable:true});
Object.defineProperty(__R,"bIndSet",{get:function(){return bIndSet;},set:function(v){bIndSet=v;},configurable:true});
Object.defineProperty(__R,"barTo",{get:function(){return barTo;},set:function(v){barTo=v;},configurable:true});
Object.defineProperty(__R,"dockApply",{get:function(){return dockApply;},set:function(v){dockApply=v;},configurable:true});
Object.defineProperty(__R,"dockOff",{get:function(){return dockOff;},set:function(v){dockOff=v;},configurable:true});
Object.defineProperty(__R,"foldP",{get:function(){return foldP;},set:function(v){foldP=v;},configurable:true});
Object.defineProperty(__R,"lintChip",{get:function(){return lintChip;},set:function(v){lintChip=v;},configurable:true});
Object.defineProperty(__R,"morphStop",{get:function(){return morphStop;},set:function(v){morphStop=v;},configurable:true});
Object.defineProperty(__R,"noteSec",{get:function(){return noteSec;},set:function(v){noteSec=v;},configurable:true});
Object.defineProperty(__R,"pCur",{get:function(){return pCur;},set:function(v){pCur=v;},configurable:true});
Object.defineProperty(__R,"renderDesc",{get:function(){return renderDesc;},set:function(v){renderDesc=v;},configurable:true});
Object.defineProperty(__R,"shClosed",{get:function(){return shClosed;},set:function(v){shClosed=v;},configurable:true});
Object.defineProperty(__R,"shDragEnd",{get:function(){return shDragEnd;},set:function(v){shDragEnd=v;},configurable:true});
Object.defineProperty(__R,"shOpened",{get:function(){return shOpened;},set:function(v){shOpened=v;},configurable:true});
/* moved here from a later file: used while this file loads (a function declaration used to be hoisted across the closure) */
function lintChip(){ const l=lintList(); if(!l.length) return ""; return '<button type="button" class="chip lint-c press" data-lint="1" aria-label="Rules check: '+l.length+(l.length===1?' thing':' things')+' to look at">'+(typeof ico==="function"?ico("ui-info"):"")+'Rules check '+l.length+'</button>'; }
export function lintList(){ const out=[]; if(!C||!D||!S) return out;
  (C.inv||[]).forEach((i,ix) =>{ if(!eqOn(i)) return; const m=/Requires Str (\d+)/i.exec(i.d||""); if(m&&D.score&&D.score.STR<+m[1]) out.push({k:"str-"+ix,t:"Heavy armor too heavy",x:i.n+" needs Strength "+m[1]+". Your Strength is "+D.score.STR+", so your Speed is 10 feet lower while you wear it.",fix:"inv",fl:"Open Inventory"}); });
  const att=(C.inv||[]).filter((i) =>{ return i.att&&eqOn(i); }).length, aM=attMaxC(); if(att>aM) out.push({k:"att",t:"Too many attuned items",x:"You can be attuned to "+aM+" magic items at a time. You have "+att+". Only the first "+aM+" work.",fix:"inv",fl:"Open Inventory"});
  if(num(S.hp,1)===0&&!(S.cond&&S.cond.Unconscious)&&!(S.ds&&S.ds[1]>=3)) out.push({k:"unc",t:"0 Hit Points",x:"At 0 Hit Points you have the Unconscious condition until you regain a Hit Point.",fix:"unc",fl:"Add Unconscious"});
  if(S.exh>=6) out.push({k:"exh",t:"Exhaustion 6",x:"At Exhaustion level 6 a creature dies. Lower it if this was a mistake.",fix:"exh",fl:"Lower to 5"});
  const dup=(C.inv||[]).filter((i) =>{ return eqOn(i)&&/^Shield\b/i.test(i.n); }).length; if(dup>1) out.push({k:"sh",t:"Two Shields",x:"Only one Shield gives its bonus to Armor Class.",fix:"inv",fl:"Open Inventory"});
  return out; }
/* ===== v31 p02 segments (B2) ===== */
const SEGX={};
function segKey(el){ const r=el.closest("[id]"); return (r?r.id:"")+"|"+Array.prototype.indexOf.call((r||document).querySelectorAll(".ifil"),el); }
function segEdge(el){ const m=el.scrollWidth-el.clientWidth; el.classList.toggle("fit",m<=2);/* v31 p11: a row that cannot scroll lets the swipe go nowhere */ el.classList.toggle("ovf-l",el.scrollLeft>2); el.classList.toggle("ovf-r",m>2&&el.scrollLeft<m-2); }
function segFix(root){ if(!root||!root.querySelectorAll) return; let els=root.querySelectorAll(".ifil"), n=els.length, i, el, k, m, sl, on, l, r, W, X=[], IDX=new Map();
  /* P4 frame rate: read everything first, then write, so the browser lays out once instead of once per row. The saved row index is found once per parent, not once per row */
  for(i=0;i<n;i++){ el=els[i]; let pr=el.closest("[id]"), key=pr||document, lst=IDX.get(key); if(!lst){ lst=(pr||document).querySelectorAll(".ifil"); IDX.set(key,lst); }
    k=(pr?pr.id:"")+"|"+Array.prototype.indexOf.call(lst,el);
    W=el.clientWidth; m=el.scrollWidth-W; sl=el.scrollLeft; if(SEGX[k]!=null) sl=Math.min(Math.max(SEGX[k],0),Math.max(m,0));
    on=el.querySelector(".ifb.on"); if(on&&W){ l=on.offsetLeft; r=l+on.offsetWidth; if(l<sl+8) sl=Math.max(0,l-28); else if(r>sl+W-8) sl=r-W+28; sl=Math.min(Math.max(sl,0),Math.max(m,0)); }
    X.push([el,k,sl,m]); }
  for(i=0;i<n;i++){ el=X[i][0]; k=X[i][1]; sl=X[i][2]; m=X[i][3]; if(el.getAttribute("data-hscroll")!=="1") el.setAttribute("data-hscroll","1"); if(el.scrollLeft!==sl) el.scrollLeft=sl; SEGX[k]=sl;
    el.classList.toggle("fit",m<=2); el.classList.toggle("ovf-l",sl>2); el.classList.toggle("ovf-r",m>2&&sl<m-2); } }
/* icons are added one frame after a render and make the segments wider: check again two frames later */
function segFixL(root){ segFix(root); requestAnimationFrame(() =>{ requestAnimationFrame(() =>{ segFix(root); }); }); }
document.addEventListener("scroll",(e) =>{ const el=e.target; if(el&&el.classList&&el.classList.contains("ifil")){ SEGX[segKey(el)]=el.scrollLeft; segEdge(el); } if(el&&el.classList&&(el.id==="tabs"||el.classList.contains("bnav")||el.classList.contains("fr-tabs"))) segEdge(el); },true);
/* T10: the tab row and the bottom bar get the same edge fade as the filter rows when they can scroll */
function edgeRows(){ let els=document.querySelectorAll("#tabs,.bnav,.fr-tabs"), X=[], i, el, m;/* P5 frame rate: all reads first, then all writes, so a click on a tab does not force layout once per row */
  for(i=0;i<els.length;i++){ el=els[i]; m=el.scrollWidth-el.clientWidth; X.push([el,m,el.scrollLeft]); }
  for(i=0;i<X.length;i++){ el=X[i][0]; m=X[i][1]; el.classList.toggle("fit",m<=2); el.classList.toggle("ovf-l",X[i][2]>2); el.classList.toggle("ovf-r",m>2&&X[i][2]<m-2); } }
setTimeout(edgeRows,600); setTimeout(edgeRows,2500); setTimeout(edgeRows,6000); document.addEventListener("click",() =>{ setTimeout(edgeRows,350); },true);
window.addEventListener("resize",() =>{ Array.prototype.forEach.call(document.querySelectorAll(".ifil"),segEdge); if(typeof edgeRows==="function") edgeRows(); });
__set_renderActions((function(f){ return function(){ const r=f.apply(this,arguments); segFixL(document.getElementById("actBody")); return r; }; })(renderActions));
__set_renderInv((function(f){ return function(){ const r=f.apply(this,arguments); segFixL(document.getElementById("invBody")); return r; }; })(renderInv));
__set_renderFeat((function(f){ return function(){ const r=f.apply(this,arguments); segFixL(document.getElementById("featBody")); return r; }; })(renderFeat));
__set_renderSpells((function(f){ return function(){ const r=f.apply(this,arguments); segFixL(document.getElementById("spBody")); return r; }; })(renderSpells));
__set_renderExtras((function(f){ return function(){ const r=f.apply(this,arguments); segFixL(document.getElementById("extBody")); return r; }; })(renderExtras));
/* a page that was hidden while it rendered has no width yet: fix its segments when it shows */
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#tabs .tab,#bnav button"); if(t) setTimeout(() =>{ segFix(document); },60); });
/* ===== v31 p04 folded rules text (C4, C7, F1) ===== */
/* FOPEN: what the player opened, kept for this visit only (no storage) */
var FOPEN={};
function foldLen(t){ return String(t||"").replace(/\[\[|\]\]|\*\*/g,"").replace(/<[^>]+>/g,"").length; }
function foldP(html,key,t,force){ if(force||foldLen(t)<=110||/class="fch"/.test(html)) return '<p>'+html+'</p>'; const op=!!FOPEN[key];
  return '<p class="fold'+(op?' open':'')+'" data-fold="'+esc(key)+'">'+html+'</p><button type="button" class="fmore press" data-fmore="'+esc(key)+'" aria-expanded="'+op+'">'+ico("ui-chev-d","fmi")+'<span>'+(op?'Show less':'Show more')+'</span></button>'; }
function foldSet(key,op){ FOPEN[key]=op?1:0; if(!op) delete FOPEN[key];
  Array.prototype.forEach.call(document.querySelectorAll('[data-fmore]'),(b) =>{ if(b.getAttribute("data-fmore")!==key) return; b.setAttribute("aria-expanded",op?"true":"false");
    const s=b.querySelector("span:not(.asub)"); if(s&&!b.classList.contains("acomb-t")) s.textContent=op?"Show less":"Show more";
    const p=b.previousElementSibling; if(p&&p.classList.contains("fold")) p.classList.toggle("open",op);
    const w=b.closest(".acomb"); if(w&&b.classList.contains("acomb-t")){ w.classList.toggle("open",op); const l=w.querySelector(".aline"); if(l) l.hidden=!op; } }); }
/* a short text that fits in two lines needs no Show more (measured when its page is visible) */
function foldFix(root){ Array.prototype.forEach.call((root||document).querySelectorAll("p.fold:not(.open)"),(p) =>{ if(!p.clientHeight) return; const b=p.nextElementSibling, fits=p.scrollHeight<=p.clientHeight+2;
  p.classList.toggle("fits",fits); if(b&&b.classList.contains("fmore")) b.hidden=fits; }); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-fmore]");
  if(b){ e.preventDefault(); foldSet(b.getAttribute("data-fmore"),b.getAttribute("aria-expanded")!=="true"); return; }
  const p=e.target.closest&&e.target.closest("p.fold:not(.open)"); if(p&&!e.target.closest("button,a,input")&&!p.classList.contains("fits")) foldSet(p.getAttribute("data-fold"),true); });
__set_renderActions((function(f){ return function(){ const r=f.apply(this,arguments); requestAnimationFrame(() =>{ foldFix(document.getElementById("actBody")); }); return r; }; })(renderActions));
__set_renderFeat((function(f){ return function(){ const r=f.apply(this,arguments); requestAnimationFrame(() =>{ foldFix(document.getElementById("featBody")); }); return r; }; })(renderFeat));
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#tabs .tab,#bnav button"); if(t) setTimeout(() =>{ foldFix(document); },80); });
window.addEventListener("resize",() =>{ Array.prototype.forEach.call(document.querySelectorAll("p.fold.fits"),(p) =>{ p.classList.remove("fits"); const b=p.nextElementSibling; if(b&&b.classList.contains("fmore")) b.hidden=false; }); foldFix(document); });
/* ===== v31 p06 notes (B9, C8) ===== */
const NOTE_ICO={org:"ui-flag",allies:"ui-users",enemies:"sk-intimidation",backstory:"ui-book",other:"ui-pen",session:"tab-notes"};
function noteSec(f){ return '<section class="nsec"><label class="nsec-h" for="n-'+f.k+'">'+ico(NOTE_ICO[f.k]||"tab-notes","nsec-i")+'<span><b>'+f.l+'</b><small>'+esc(f.h)+'</small></span></label><textarea id="n-'+f.k+'" class="nsec-t grow" data-note="'+f.k+'" rows="2" placeholder="Write here">'+esc(S.notes[f.k]||"")+'</textarea></section>'; }
/* boxes grow with their text; browsers without field-sizing get the height from JavaScript */
const GROW_CSS=!!(window.CSS&&CSS.supports&&CSS.supports("field-sizing","content"));
function growOne(t){ if(GROW_CSS||!t||!t.isConnected) return; t.style.height="auto"; t.style.height=(t.scrollHeight+2)+"px"; }
function growAll(root){ if(GROW_CSS) return; Array.prototype.forEach.call((root||document).querySelectorAll("textarea.grow"),growOne); }
document.addEventListener("input",(e) =>{ if(e.target&&e.target.classList&&e.target.classList.contains("grow")) growOne(e.target); });
__set_renderNotes((function(f){ return function(){ const r=f.apply(this,arguments); requestAnimationFrame(() =>{ growAll(document.getElementById("notesBody")); growAll(document.getElementById("descBody")); }); return r; }; })(renderNotes));
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#tabs .tab,#bnav button"); if(t) setTimeout(() =>{ growAll(document); },80); });
/* ===== v31 p07 description (B10, C8) ===== */
let DESC_MORE=false;
/* one field: the label above, the value as plain text until tapped. Same ids and data attributes as before (n-camp, n-align, n-ch_*, n-<note>, data-lang) */
function dField(id,lbl,val,attr,ta,ph){ const v=String(val||""); return '<div class="dfield'+(v.trim()?'':' empty')+(ta?' long':'')+'"><label for="'+id+'">'+lbl+'</label>'+
  (ta?'<textarea id="'+id+'" class="dval grow" '+attr+' rows="1" placeholder="'+esc(ph||"Tap to write")+'">'+esc(v)+'</textarea>':'<input id="'+id+'" class="dval field" '+attr+' value="'+esc(v)+'" placeholder="'+esc(ph||"Tap to write")+'" autocomplete="off">')+'</div>'; }
function renderDesc(){ const el=$("#descBody"); if(!el) return;
  const bgG=(C.features||[]).filter((g) =>{return /^Background/.test(g.g)})[0], miss=[], keep=function(v,name){ const e=!String(v||"").trim(); if(e) miss.push(name); return !e||DESC_MORE; };
  let h='<div class="dsec dcamp camp-f">'+dField("n-camp","Campaign",campName(),"",false,"Campaign name")+'<p class="dhint">Optional. Shown under your name, and My Characters can group by it.</p></div>';/* v30 RU133 */
  h+='<h3 class="noteh">'+ico("src-background")+'Background'+(C.bg?': '+esc(C.bg):'')+'</h3>'+(bgG?bgG.items.map((it) =>{return '<p class="bgl"><b>'+esc(it.n)+'.</b> '+rich(String(it.d).replace(/\*\*Your choice\.\*\*\s*/,""))+'</p>'}).join(''):'<p class="muted">No background chosen yet.</p>');
  const lg=[0,1,2].map((i) =>{ const v=S.lang[i]||""; if(i>0&&!keep(v,"Language "+(i+1))) return ""; return dField("n-lang"+i,i===0?"Language 1":"Language "+(i+1),v,'data-lang="'+i+'" aria-label="Language '+(i+1)+'"',false,i===0?"Common":"Language "+(i+1)); }).join("");
  h+='<h3 class="noteh">'+ico("ui-book")+'Languages</h3><p class="dhint">Common plus two of your choice. Rare or setting languages need DM approval.</p><div class="dgrid">'+lg+'</div>';
  const ch=(keep(S.align,"Alignment")?dField("n-align","Alignment",S.align||"","",false,"Optional in the 2024 rules"):"")+CHAR_FIELDS.map((f) =>{ const v=S.notes[f[0]]||""; return keep(v,f[1])?dField("n-"+f[0],f[1],v,'data-note="'+f[0]+'"',false):""; }).join("");
  h+='<h3 class="noteh">Characteristics</h3><div class="dgrid">'+ch+'<div class="dfield ro"><span class="dlbl">Size</span><p class="chsz">'+esc(C.size||"Medium")+'</p></div></div>';
  const pe=NOTE_FIELDS.filter((f) =>{ return /^(personality|ideal|bond|flaw|appearance)$/.test(f.k); }).map((f) =>{ const v=S.notes[f.k]||""; return keep(v,f.l)?dField("n-"+f.k,f.l,v,'data-note="'+f.k+'"',true,f.h):""; }).join("");
  if(pe) h+='<h3 class="noteh">'+ico("tab-description")+'Personality</h3><div class="dlist">'+pe+'</div>';
  if(miss.length) h+='<button type="button" class="dmore press" data-dmore="1" aria-expanded="'+DESC_MORE+'">'+ico(DESC_MORE?"ui-chev-d":"ui-plus","dmi")+'<span><b>'+(DESC_MORE?'Hide empty details':'Add details')+'</b><small>'+esc(miss.join(", "))+'</small></span></button>';
  h+='<div class="saved">Saved on this device as you type.</div>';
  el.innerHTML=h; requestAnimationFrame(() =>{ growAll(el); }); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-dmore]"); if(!b) return; e.preventDefault(); DESC_MORE=!DESC_MORE; renderDesc();
  if(DESC_MORE){ const f=document.querySelector("#descBody .dfield.empty .dval"); if(f) try{ f.focus({preventScroll:false}); }catch(er){} } });
/* ===== v31 p11 swipe + tab slide (RU112, D6, D2) ===== */
let BSPR=0;
function bIndSet(x){ if(BCSS||BSPR) return; const s=SPR.bInd||(SPR.bInd={x:x,v:0,t:x,raf:0}); if(s.raf){ cancelAnimationFrame(s.raf); s.raf=0; } s.x=s.t=x; s.v=0; bInd.style.transform="translateX("+x+"%)"; }
function bIndTo(i){ if(BCSS){ if(REDUCE) return; const d=(curPage-i)*100; if(!d) return; if(bInd.__a){ try{ bInd.__a.cancel(); }catch(er){} } const e=springEase(340,.82); try{ bInd.__a=bInd.animate([{translate:d+"%"},{translate:"0%"}],{duration:e.d,easing:e.e}); }catch(er){ bInd.__a=null; } return; } const t=i*100; BSPR=1; spring("bInd", t, (v) =>{ bInd.style.transform="translateX("+(Math.round(v*10)/10)+"%)"; if(Math.abs(v-t)<.05) BSPR=0; }, {k:340, zeta:.82}); if(REDUCE) BSPR=0; }
pager.addEventListener("touchstart",() =>{ if(bInd.__a){ try{ bInd.__a.cancel(); }catch(er){} bInd.__a=null; } if(BSPR){ BSPR=0; onPagerScroll(); } },{passive:true});/* a finger on the pages takes the bar line back */
function pageSlide(el,dir){ if(!el||REDUCE) return; const c=dir>0?"psl-r":"psl-l", busy=el.classList.contains("psl-l")||el.classList.contains("psl-r"); el.classList.remove("psl-l","psl-r"); clearTimeout(el.__psl);
  const go=function(){ el.classList.add(c); el.__psl=setTimeout(() =>{ el.classList.remove("psl-l","psl-r"); },260); }; if(busy) requestAnimationFrame(go); else go(); }/* no forced layout: a running slide restarts on the next frame */
__set_goPage((i,smooth) =>{ if(!mq.matches) return; pgShow(i); const from=curPage, w=pager.clientWidth; if(smooth&&i!==from&&Math.abs(pager.scrollLeft-from*w)<2){ pageSlide(document.getElementById(PAGES[i]), i>from?1:-1); bIndTo(i); }
  pager.scrollTo({left:i*w, behavior:"auto"}); });
__set_setTab((function(f){ return function(id,focus,instant){ const from=activeTab, ids=$$("#tabs .tab").map((t) =>{ return t.getAttribute("data-tab"); }), a=ids.indexOf(from), b=ids.indexOf(id);
  const r=f.apply(this,arguments); if(!instant&&!mq.matches&&id!==from&&a>=0&&b>=0){ const el=document.getElementById(id); if(el){ el.classList.remove("enter"); pageSlide(el,b>a?1:-1); } } return r; }; })(setTab));
/* ===== v31 p12 card to detail (RU131 shared element) ===== */
let MORPH=null, VTC=null;
function morphSrc(inf){ if(inf.matches(".sp-r,.islot")) return inf; if(inf.matches(".iname")) return inf.closest(".irow")||inf;
  const h=inf.closest(".fitem>h4,.aitem>h4"); if(h) return h.parentNode; if(inf.closest(".arow .an")) return inf.closest(".arow"); if(inf.closest(".rs-h")) return inf.closest(".rs"); return null; }
document.addEventListener("click",(e) =>{ MORPH=null; const t=e.target; if(!t||!t.closest||!document.startViewTransition||REDUCE) return; if(env.__MI&&!env.__MI.rm()) return;/* v55: the F1 morph engine takes over */ if(t.closest("#sheet")) return;
  const inf=t.closest("[data-info]"); if(!inf) return; const c=morphSrc(inf); if(c) MORPH={el:c,t:performance.now()}; },true);
function morphEnd(){ const root=document.documentElement; root.classList.remove("vt-card"); sheet.classList.remove("vt-hold","vt-on"); sheet.style.viewTransitionName=""; $$(".vt-src").forEach((x) =>{ x.classList.remove("vt-src"); x.style.viewTransitionName=""; }); VTC=null; }
function morphIn(card){ let root=document.documentElement, vt;
  card.classList.add("vt-src"); card.style.viewTransitionName="v31card"; root.classList.add("vt-card"); sheet.classList.add("vt-hold");
  try{ vt=document.startViewTransition(() =>{ card.style.viewTransitionName=""; sheet.classList.remove("vt-hold"); sheet.style.viewTransitionName="v31card"; }); }catch(er){ morphEnd(); return; }
  VTC=vt; vt.finished.then(() =>{ if(VTC===vt) morphEnd(); },() =>{ if(VTC===vt) morphEnd(); }); }
__set_openSheet((function(f){ return function(){ const m=MORPH; MORPH=null; morphStop();
  const ok=m&&m.el.isConnected&&performance.now()-m.t<400&&!sheet.classList.contains("on")&&document.startViewTransition&&!REDUCE;
  if(ok) sheet.classList.add("vt-on"); const r=f.apply(this,arguments); if(ok) morphIn(m.el); return r; }; })(openSheet));
function morphStop(){ if(VTC){ try{ VTC.skipTransition(); }catch(er){} morphEnd(); } }
/* ===== v31 p13 header shrinks on scroll (RU130) ===== */
function pCur(i){ PAGES.forEach((p,k) =>{ const el=document.getElementById(p); if(el) el.classList.toggle("pcur",k===i); }); }
pCur(curPage);
(function(){ const band=document.querySelector(".band"), app=document.getElementById("app"); if(!band||!app) return;
  function setH(){ const h=band.offsetHeight; if(h) app.style.setProperty("--bandh",h+"px"); }
  setH(); if(window.ResizeObserver) new ResizeObserver(setH).observe(band); else window.addEventListener("resize",setH); })();
/* ===== v31 p14 popup spring (RU130) ===== */
function shApply(p){ const s=SPR.sheet; if(s&&s.t===0&&p>0&&p<.012){ s.x=0; s.v=0; }
  let q=Math.max(-.2,Math.min(1.2,p)), t;
  if(sheet.classList.contains("dock")) t="translateX("+((1-q)*104).toFixed(2)+"%)";
  else if(mq.matches) t="translateY("+((1-q)*105).toFixed(2)+"%)";
  else t="translate(-50%,"+(-50+3*(1-q)).toFixed(2)+"%) scale("+(.97+.03*q).toFixed(4)+")";
  sheet.style.transform=t; sheet.style.opacity=(mq.matches&&!sheet.classList.contains("dock"))?"":String(Math.max(0,Math.min(1,q*1.6)).toFixed(3));
  if(s&&s.v===0&&s.x===s.t){ sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; } }
function shOpened(){ let s=SPR.sheet; if(REDUCE||sheet.classList.contains("vt-on")){ if(s){ if(s.raf) cancelAnimationFrame(s.raf); s.raf=0; s.x=s.t=1; s.v=0; } sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; return; }
  if(!s||(!s.raf&&!sheet.classList.contains("sp-out"))) s=SPR.sheet={x:0,v:0,t:0,raf:0};
  sheet.classList.add("spr"); sheet.classList.remove("sp-out"); spring("sheet",1,shApply,{k:300,zeta:.86}); shApply(s.x); }
function shClosed(){ const s=SPR.sheet; if(REDUCE||!s){ sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; return; }
  sheet.classList.add("spr","sp-out"); spring("sheet",0,shApply,{k:420,zeta:1}); }
function shDragEnd(dy,vel,close){ const h=(sheet.offsetHeight||1)*1.05, s=SPR.sheet||(SPR.sheet={x:1,v:0,t:1,raf:0}); if(s.raf){ cancelAnimationFrame(s.raf); s.raf=0; }
  s.x=1-dy/h; s.v=-vel*1000/h; sheet.style.transform=""; if(close) closeSheet(); else { sheet.classList.add("spr"); spring("sheet",1,shApply,{k:300,zeta:.86}); } }
$("#sheetHead").addEventListener("pointerdown",(e) =>{ const s=SPR.sheet; if(!mq.matches||e.target.closest("button")||!s||!s.raf) return; cancelAnimationFrame(s.raf); s.raf=0; sheet.classList.remove("spr"); sheet.style.opacity=""; });
/* ===== v32 p29 (B15, RU132): exit motion and the Back button for popups and dialogs ===== */
(function(){
  function strip(n){ if(n.nodeType!==1) return; n.removeAttribute("id"); Array.prototype.slice.call(n.attributes).forEach((a) =>{ if(/^data-|^aria-(?!hidden)|^role$|^for$|^name$/.test(a.name)) n.removeAttribute(a.name); }); }
  function ghost(n){ if(REDUCE||!n||n.nodeType!==1||!n.classList||!(n.classList.contains("ask")||n.classList.contains("bkp"))||n.id==="staleV") return;
    const g=n.cloneNode(true); strip(g); Array.prototype.slice.call(g.querySelectorAll("*")).forEach(strip); g.className="ovg"+(n.classList.contains("ask")?" ovg-a":""); g.setAttribute("aria-hidden","true"); g.inert=true;
    document.body.appendChild(g); setTimeout(() =>{ g.remove(); },220); }
  const sig=function(n){ return n.nodeType===1?(n.id||n.className||""):""; };
  const mo=new MutationObserver((recs) =>{ const add={}, rem=[]; recs.forEach((r) =>{ if(r.type==="childList"&&r.target===document.body){ Array.prototype.forEach.call(r.addedNodes,(n) =>{ add[sig(n)]=1; }); Array.prototype.forEach.call(r.removedNodes,(n) =>{ rem.push(n); }); } });
    rem.forEach((n) =>{ if(!add[sig(n)]) ghost(n); });/* a dialog redrawn in place (same id) does not fade */ ovQueue(); });
  mo.observe(document.body,{childList:true}); mo.observe(sheet,{attributes:true,attributeFilter:["class"]});
  new MutationObserver(() =>{ ovQueue(); }).observe(document.body,{attributes:true,attributeFilter:["hidden"],subtree:true});/* T11 A6: Home shown or hidden */
  const tieB=function(){ const b=document.getElementById("bld"); if(b&&!b.__ovo){ b.__ovo=1; mo.observe(b,{childList:true,attributes:true,attributeFilter:["hidden"]}); } }; tieB(); setTimeout(tieB,500);
})();
let OVG=false, OVSKIP=0, OVQ=0, OV_UNLOAD=0;
window.addEventListener("beforeunload",() =>{ OV_UNLOAD=1; });/* a reload or page change is under way: going back in history now would cancel it */
function ovTop(){ const c=document.getElementById("ctxm"); if(c) return function(){ c.remove(); };
  const a=document.querySelectorAll("body > .ask"); if(a.length){ const x=a[a.length-1]; return function(){ const b=x.querySelector("[data-no]"); if(b) b.click(); else x.remove(); }; }
  if(env.__tgBack){ const tb=env.__tgBack(); if(tb) return tb; }/* G7 Training Ground: field to setup, setup closes */
  if(env.__learnBack){ const lb=env.__learnBack(); if(lb) return lb; }/* T11 Learn: glossary card, sheet spotlight, then one step back */
  const bl=document.getElementById("bld"); if(bl&&!bl.hidden){ const e=Array.prototype.slice.call(bl.children).filter((d) =>{ return d.classList.contains("exp")&&d.id!=="exp"&&d.querySelector("[data-no]"); }); if(e.length){ const y=e[e.length-1]; return function(){ y.querySelector("[data-no]").click(); }; } if(env.__bldBack) return function(){ env.__bldBack(); }; }/* T11 G6 T5 */
  const q=document.getElementById("hpQm"); if(q) return function(){ qmClose(); };
  const k=Array.prototype.slice.call(document.querySelectorAll("body > .bkp")).filter((w) =>{ return !w.hidden&&w.querySelector(".bkpx"); }); if(k.length){ const z=k[k.length-1]; return function(){ z.querySelector(".bkpx").click(); }; }
  if(sheet.classList.contains("on")) return function(){ const bk=$("#sheetBack"); if(bk&&!bk.hidden) bk.click(); else closeSheet(); };
  /* T11 A6: on the character sheet itself (no popup, builder closed, not a friend's view), Back goes to Home instead of leaving the app */
  const hv=document.getElementById("homeV"); if(hv&&hv.hidden&&!(bl&&!bl.hidden)&&!FROZEN&&typeof showHome==="function") return function(){ showHome(); };
  return null; }
function ovSync(){ OVQ=0; if(FROZEN||OV_UNLOAD) return; const on=!!ovTop();
  if(on&&!OVG){ try{ history.pushState({csOv:1},""); OVG=true; }catch(e){} }
  else if(!on&&OVG){ OVG=false; if(history.state&&history.state.csOv){ OVSKIP++; try{ history.back(); }catch(e){ OVSKIP--; } } } }
export function ovQueue(){ if(!OVQ) OVQ=setTimeout(ovSync,0); }
window.addEventListener("popstate",() =>{ if(OVSKIP>0){ OVSKIP--; ovQueue(); return; } if(!OVG) return; OVG=false; const f=ovTop(); if(f){ try{ f(); }catch(e){} } ovQueue(); });
try{ if(history.state&&history.state.csOv) history.replaceState(null,""); }catch(e){}/* a reload while a popup was open: the held entry is plain again */
env.__ovState=function(){ return {held:OVG, top:!!ovTop()}; };
/* ===== v32 p34 RU132: right-click menu on a computer ===== */
function ctxFire(attrs){ const b=document.createElement("button"); b.type="button"; b.hidden=true; Object.keys(attrs).forEach((k) =>{ b.setAttribute(k,attrs[k]); }); document.body.appendChild(b); try{ b.click(); }finally{ b.remove(); } }
function ctxBoxes(scope){ const bx=Array.prototype.slice.call(scope.querySelectorAll(".bx[data-k]")); if(!bx.length) return []; const on=bx.filter((b) =>{ return b.getAttribute("aria-pressed")==="true"||b.classList.contains("on"); }), off=bx.filter((b) =>{ return on.indexOf(b)<0; }), L=[];
  if(off.length) L.push(["Use 1","ui-check",function(){ off[0].click(); }]); else L.push(["Use 1 (none left)","ui-check",null]);
  if(on.length) L.push(["Regain 1","ui-undo",function(){ on[on.length-1].click(); }]); return L; }
CTXSRC.add("inventory-row", {sel:"#invBody .irow", build:function(row){
  const nb=row.querySelector('[data-info^="it:"]'); if(!nb) return null; const ix=+nb.getAttribute("data-info").slice(3), it=(C.inv||[])[ix]; if(!it) return null;
    const L=[["Details","ui-info",function(){ nb.click(); }]], ck=row.querySelector("[data-ieqs]"); if(ck) L.push([eqOn(it)?"Unequip":"Equip",eqOn(it)?"ui-close":"ui-check",function(){ ck.click(); }]);
    if(CONS1.test(it.n)) L.push([num(it.q,1)>0?"Use 1":"Use 1 (none left)","ui-check",num(it.q,1)>0?function(){ ctxFire({"data-use1":ix,"data-potn":it.key||it.n}); }:null]);
    L.push(["Delete","ui-trash",function(){ ctxFire({"data-idel":it.key||it.n,"data-iix":ix,"data-sure":"1"}); },1]); return {t:cuNm("i:"+invKey(it),it.n),L:L,el:row};
}});
CTXSRC.add("spell-row", {sel:'#spBody .sp-r[data-info^="sp:"]', build:function(sp){
  const i=+sp.getAttribute("data-info").slice(3), x=(C.spells||[])[i]; if(!x) return null; const L2=[["Details","ui-info",function(){ sp.click(); }]];
    if(spAtWill(x)) L2.push(["Cast","tab-spells",function(){ ctxFire({"data-cast":i,"data-ck":""}); }]);
    else { const o=spCastOpts(x); if(!o.length) L2.push(["Cast (no slots left)","tab-spells",null]); o.forEach((q) =>{ L2.push([(q.free?"Use ":"Cast with ")+q.lab+" ("+q.left+" left)","tab-spells",qOk(q)?function(){ ctxFire({"data-cast":i,"data-ck":ckOf(q),"data-cl":q.lv}); }:null]); }); }
    return {t:x.n,L:L2,el:sp};
}});
CTXSRC.add("feature-item", {sel:"#featBody .fitem", build:function(fi){
  const tx=fi.querySelector('.tx[data-info^="f:"]'); if(!tx) return null; return {t:tx.textContent,L:[["Details","ui-info",function(){ tx.click(); }]].concat(ctxBoxes(fi)),el:fi};
}});
CTXSRC.add("action-row", {sel:"#actBody .arow, #actBody .rs", build:function(ar){
  const ax=ar.querySelector(".tx[data-info],[data-info]"); if(!ax) return null; return {t:ax.textContent,L:[["Details","ui-info",function(){ ax.click(); }]].concat(ctxBoxes(ar)),el:ar};
}});
/* solid:orchestrator ctxSpec */
function ctxSpec(t){ const L=CTXSRC.list(); for(let i=0;i<L.length;i++){ const el=t.closest&&t.closest(L[i].sel); if(el) return L[i].build(el); } return null; }
function ctxClose(){ const m=document.getElementById("ctxm"); if(m){ m.remove(); if(ctxClose.back&&ctxClose.back.focus) try{ ctxClose.back.focus({preventScroll:true}); }catch(e){} } ctxClose.back=null; }
function ctxOpen(spec,x,y){ ctxClose(); const m=document.createElement("div"); m.id="ctxm"; m.className="ctxm"; m.setAttribute("role","menu"); m.setAttribute("aria-label",spec.t);
  m.innerHTML='<div class="ctxh">'+esc(spec.t)+'</div>'+spec.L.map((a,i) =>{ return '<button type="button" role="menuitem" class="ctxi'+(a[3]?' del':'')+'" data-ctxi="'+i+'"'+(a[2]?'':' disabled')+'>'+ico(a[1])+'<span>'+esc(a[0])+'</span></button>'; }).join("");
  document.body.appendChild(m); const w=m.offsetWidth, h=m.offsetHeight; m.style.left=Math.max(8,Math.min(x,innerWidth-w-8))+"px"; m.style.top=Math.max(8,Math.min(y,innerHeight-h-8))+"px";
  ctxClose.back=document.activeElement; m.__L=spec.L; const f=m.querySelector(".ctxi:not([disabled])"); if(f) f.focus({preventScroll:true}); }
document.addEventListener("contextmenu",(e) =>{ if(mq.matches||e.shiftKey) return; const spec=ctxSpec(e.target); if(!spec) return; e.preventDefault(); ctxOpen(spec,e.clientX,e.clientY); });
document.addEventListener("keydown",(e) =>{ const m=document.getElementById("ctxm");
  if(!m){ if((e.key==="ContextMenu"||(e.shiftKey&&e.key==="F10"))&&!mq.matches){ const spec=ctxSpec(document.activeElement||document.body); if(spec){ e.preventDefault(); const r=spec.el.getBoundingClientRect(); ctxOpen(spec,r.left+16,r.top+r.height/2); } } return; }
  if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); ctxClose(); return; }
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); const b=Array.prototype.slice.call(m.querySelectorAll(".ctxi:not([disabled])")), i=b.indexOf(document.activeElement); if(b.length) b[(i+(e.key==="ArrowDown"?1:-1)+b.length)%b.length].focus(); } },true);
document.addEventListener("pointerdown",(e) =>{ const m=document.getElementById("ctxm"); if(m&&!m.contains(e.target)) ctxClose(); },true);
document.addEventListener("scroll",() =>{ if(document.getElementById("ctxm")) ctxClose(); },true);
window.addEventListener("resize",() =>{ ctxClose(); });
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#ctxm [data-ctxi]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const m=document.getElementById("ctxm"), a=m&&m.__L&&m.__L[+b.getAttribute("data-ctxi")]; ctxClose.back=null; ctxClose(); if(a&&a[2]) a[2](); },true);
/* ===== v31 p16 two panels on a computer (RU131) ===== */
const DOCKW=400;
function dockFits(){ const tz=(+document.documentElement.getAttribute("data-tsize")||100)/100; return !mq.matches&&window.innerWidth>=1100&&window.innerWidth-DOCKW>=Math.max(700,760*tz); }/* v35 p13: with Text Size 115 or 130 the side panel docks only when the sheet keeps room, else it floats over */
function dockable(mode){ return mode==="info"||mode==="bd"; }
function dockAnchor(){ let a=lastFocus&&lastFocus.isConnected&&lastFocus.closest&&lastFocus.closest("#pager")?lastFocus:null; if(!a){ const e=document.elementFromPoint(Math.max(10,(window.innerWidth-DOCKW)/3),window.innerHeight/2); a=e&&e.closest&&e.closest("#pager")?e:null; } return a; }
function dockLayout(on){ const root=document.documentElement; if(root.classList.contains("dk")===on) return; const a=dockAnchor(), y0=a?a.getBoundingClientRect().top:0;
  root.classList.toggle("dk",on); root.classList.toggle("dkn",on&&window.innerWidth-DOCKW<1000); if(on) root.style.setProperty("--dockw",DOCKW+"px");
  if(a&&a.isConnected){ const y1=a.getBoundingClientRect().top; if(Math.abs(y1-y0)>1) window.scrollBy(0,y1-y0); } moveTabInd(true); }
function dockApply(mode,wide){ const on=dockable(mode)&&!wide&&dockFits(); sheet.classList.toggle("dock",on); sheet.setAttribute("aria-modal",on?"false":"true"); if(on) $("#scrim").classList.remove("on"); dockLayout(on); }
function dockOff(){ dockLayout(false); }
window.addEventListener("resize",() =>{ if(!sheet.classList.contains("on")||!sheet.classList.contains("dock")) return; if(!dockFits()){ sheet.classList.remove("dock"); sheet.setAttribute("aria-modal","true"); $("#scrim").classList.add("on"); dockLayout(false); } else { document.documentElement.classList.toggle("dkn",window.innerWidth-DOCKW<1000); } });
/* ===== v31 p17 drag to reorder (RU131) ===== */
ICO_TXT.unshift([/^On Hit$/i,"ui-target"]);ICO_FCAT["On Hit"]="ui-target";ICO["ui-target"]="M12 3a9 9 0 1 0 0.01 0M12 8.5a3.5 3.5 0 1 0 0.01 0M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4";ICO["ui-range"]="M3 12h18M6.5 8.5 3 12l3.5 3.5M17.5 8.5 21 12l-3.5 3.5";ICO["ui-area"]="M12 3a9 9 0 1 0 0.01 0M12 7.5a4.5 4.5 0 1 0 0.01 0M12 11.2a.8.8 0 1 0 0.01 0";/* v35 p17 */ICO["ui-contrast"]="M12 3a9 9 0 1 0 0.01 0M12 3v18M12 7h5.5M12 11h8.5M12 15h8M12 19h4.5";/* v35 p01 */ICO["ui-eye"]="M2 12c2.5-4.2 6-6.5 10-6.5s7.5 2.3 10 6.5c-2.5 4.2-6 6.5-10 6.5S4.5 16.2 2 12zM12 9.2a2.8 2.8 0 1 0 0 5.6a2.8 2.8 0 1 0 0-5.6";ICO["ui-keys"]="M3 7h18v10H3zM6.5 10h1M10 10h1M13.5 10h1M17 10h.5M7 14h10";/* v32 p27 */
ICO["ui-grip"]="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01";
/* v33 p03: builder icons */
ICO["step-home"]="M3 11.5L12 4l9 7.5M5.5 9.5V20h4.5v-5.5h4V20h4.5V9.5";
ICO["ui-box"]="M5 3.5h14a1.5 1.5 0 0 1 1.5 1.5v14a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19V5A1.5 1.5 0 0 1 5 3.5z";
ICO["ui-radio-on"]="M12 3a9 9 0 1 0 0.01 0M12 8.5a3.5 3.5 0 1 0 0.01 0";
ICO["item-pack"]="M8 6V4.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 16 4.5V6M5 9a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v10.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5zM8.5 13.5h7v4h-7zM5 11h14";
let ORD_ON={inv:0,feat:0}, DRG=null;
function ordLive(t){ let l=document.getElementById("v31live"); if(!l){ l=document.createElement("div"); l.id="v31live"; l.className="sr"; l.setAttribute("aria-live","polite"); document.body.appendChild(l); } l.textContent=""; setTimeout(() =>{ l.textContent=t; },30); }
function ordKeyInv(row){ const b=row.querySelector(".iname[data-info]"), ix=b?+b.getAttribute("data-info").slice(3):-1, L=C.inv||[], it=L[ix]; if(!it) return null; let k=invKey(it), n=0; for(let j=0;j<ix;j++){ if(invKey(L[j])===k) n++; } return "i:"+k+"#"+n; }
function ordKeyFeat(card){ const b=card.querySelector("h4 .tx[data-info^='f:']"); if(!b) return null; const p=b.getAttribute("data-info").slice(2).split("."), g=(C.features||[])[+p[0]], f=g&&(g.items||[])[+p[1]]; return f?"f:"+g.g+"|"+f.n:null; }
const ORDL={inv:{body:"invBody",sel:".irow",key:ordKeyInv,name:function(r){ const b=r.querySelector(".iname b"); return b?b.textContent:"Item"; }},
          feat:{body:"featBody",sel:".fitem",key:ordKeyFeat,name:function(r){ const b=r.querySelector("h4 .tx"); return b?b.textContent:"Feature"; }}};
function ordRuns(list){ const o=ORDL[list], root=document.getElementById(o.body), out=[]; if(!root) return out;
  [root].concat([].slice.call(root.querySelectorAll(".fnest"))).forEach((par) =>{ let cur=null; [].forEach.call(par.children,(el) =>{ if(el.matches(o.sel)){ if(!cur){ cur=[]; out.push(cur); } cur.push(el); } else cur=null; }); }); return out; }
function ordApply(list){ const O=(S.order&&S.order[list])||[]; if(!O.length) return; const rank={}, o=ORDL[list]; O.forEach((k,i) =>{ rank[k]=i; });
  ordRuns(list).forEach((run) =>{ if(run.length<2) return; const ks=run.map(o.key), ix=run.map((_,i) =>{ return i; }), par=run[0].parentNode, after=run[run.length-1].nextSibling;
    ix.sort((a,b) =>{ const ra=rank[ks[a]], rb=rank[ks[b]]; return (ra==null?1e6+a:ra)-(rb==null?1e6+b:rb); }); ix.forEach((i) =>{ par.insertBefore(run[i],after); }); }); }
function ordOk(list){ if(list==="inv") return invF==="all"&&(C.inv||[]).length>1; return !featQ&&(C.features||[]).length>0; }
function ordUI(list){ const o=ORDL[list], root=document.getElementById(o.body); if(!root) return; const ok=ordOk(list), on=ok&&!!ORD_ON[list];
  root.classList.toggle("ord-on",on); if(!ok) return;
  const bar=document.createElement("div"); bar.className="ordbar"; bar.innerHTML='<span class="muted">'+(on?'Drag a handle, or focus it and use the arrow keys.':'')+'</span><button type="button" class="btn press ordb" data-ord="'+list+'" aria-pressed="'+on+'">'+ico(on?"ui-check":"ui-sort","ibt")+(on?'Done':'Reorder')+'</button>';
  const fil=root.querySelector(".ifil"); if(fil) fil.parentNode.insertBefore(bar,fil.nextSibling); else root.insertBefore(bar,root.firstChild);
  if(!on) return; ordRuns(list).forEach((run) =>{ if(run.length<2) return; run.forEach((r,i) =>{ const h=document.createElement("button"); h.type="button"; h.className="dragh press"; h.setAttribute("data-ordl",list);
    h.setAttribute("aria-label","Move "+o.name(r)+", "+(i+1)+" of "+run.length+". Drag, or use the up and down arrow keys"); h.innerHTML=ico("ui-grip","dgi"); r.appendChild(h); r.classList.add("ordr"); }); }); }
__set_renderInv((function(f){ return function(){ const r=f.apply(this,arguments); ordApply("inv"); ordUI("inv"); return r; }; })(renderInv));
__set_renderFeat((function(f){ return function(){ const r=f.apply(this,arguments); ordApply("feat"); ordUI("feat"); return r; }; })(renderFeat));
function ordRender(list){ if(list==="inv") renderInv(); else renderFeat(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-ord]"); if(!b) return; const l=b.getAttribute("data-ord"); ORD_ON[l]=ORD_ON[l]?0:1; ordRender(l);
  const nb=document.querySelector('[data-ord="'+l+'"]'); if(nb) nb.focus({preventScroll:true}); if(ORD_ON[l]) ordLive("Reorder on. Drag a handle, or focus it and use the arrow keys."); });
/* FLIP: rows slide from where they were to where they now are, on a spring */
function ordFlip(list,before){ ordRuns(list).forEach((run) =>{ run.forEach((r) =>{ const k=ORDL[list].key(r), y0=before[k]; if(y0==null) return; const d=y0-r.getBoundingClientRect().top; if(Math.abs(d)<1) return;
  const sk="ord|"+k, s=SPR[sk]; if(s&&s.raf) cancelAnimationFrame(s.raf); SPR[sk]={x:d,v:0,t:d,raf:0}; r.style.transform="translateY("+d+"px)"; r.classList.add("ord-fly");
  spring(sk,0,(v) =>{ if(!r.isConnected) return; r.style.transform=Math.abs(v)<.3?"":"translateY("+v.toFixed(1)+"px)"; if(Math.abs(v)<.3) r.classList.remove("ord-fly"); },{k:360,zeta:.82}); }); }); }
function ordTops(list){ const m={}; ordRuns(list).forEach((run) =>{ run.forEach((r) =>{ const k=ORDL[list].key(r); if(k) m[k]=r.getBoundingClientRect().top; }); }); return m; }
function ordCommit(list,run,newOrder,focusKey){ const o=ORDL[list], before=ordTops(list), ks=newOrder.map(o.key); if(DRG&&DRG.row){ before[o.key(DRG.row)]=DRG.row.getBoundingClientRect().top; }
  if(!S.order||typeof S.order!=="object") S.order={}; const O=(S.order[list]||[]).filter((k) =>{ return ks.indexOf(k)<0; }); S.order[list]=O.concat(ks); save();
  ordRender(list); ordFlip(list,before);
  if(focusKey){ let row=null; ordRuns(list).forEach((rr) =>{ rr.forEach((r) =>{ if(o.key(r)===focusKey) row=r; }); }); const h=row&&row.querySelector(".dragh"); if(h) h.focus({preventScroll:true}); } }
function ordScroller(el){ return mq.matches?el.closest("#pager>section,.panel"):null; }
document.addEventListener("pointerdown",(e) =>{ const h=e.target.closest&&e.target.closest(".dragh"); if(!h||e.button>0) return; let list=h.getAttribute("data-ordl"), row=h.parentNode, run=null;
  ordRuns(list).forEach((r) =>{ if(r.indexOf(row)>=0) run=r; }); if(!run||run.length<2) return; e.preventDefault(); try{ h.setPointerCapture(e.pointerId); }catch(er){}
  const sc=ordScroller(row), from=run.indexOf(row), rects=run.map((r) =>{ return r.getBoundingClientRect(); });
  DRG={h:h,list:list,row:row,run:run,from:from,to:from,y0:e.clientY,st0:sc?sc.scrollTop:window.scrollY,sc:sc,tops:rects.map((b) =>{ return b.top; }),hs:rects.map((b) =>{ return b.height; }),y:e.clientY,raf:0};
  row.classList.add("dragging"); });
function ordShift(i,v){ const r=DRG.run[i]; spring("ordm|"+i,v,(x) =>{ r.style.transform=Math.abs(x)<.3?"":"translateY("+x.toFixed(1)+"px)"; },{k:420,zeta:.8}); }
function ordMove(){ if(!DRG) return; const D2=DRG, st=D2.sc?D2.sc.scrollTop:window.scrollY, dy=D2.y-D2.y0+(st-D2.st0), f=D2.from, hf=D2.hs[f];
  D2.row.style.transform="translateY("+dy.toFixed(1)+"px)";
  let c=D2.tops[f]+hf/2+dy, to=f; for(let i=0;i<D2.run.length;i++){ const mid=D2.tops[i]+D2.hs[i]/2; if(i>f&&c>mid) to=i; if(i<f&&c<mid&&to===f) to=i; }
  if(to!==D2.to){ D2.to=to; const step=(f<D2.run.length-1?D2.tops[f+1]-D2.tops[f]:hf+(D2.tops[f]-(f?D2.tops[f-1]+D2.hs[f-1]:D2.tops[f]))); const gap=Math.max(0,(f<D2.run.length-1?D2.tops[f+1]-(D2.tops[f]+hf):0)), sh=hf+gap;
    for(let j=0;j<D2.run.length;j++){ if(j===f) continue; ordShift(j,(f<to&&j>f&&j<=to)?-sh:(f>to&&j>=to&&j<f)?sh:0); } }
  /* near the edge of the scrolling area: scroll on */
  const top=D2.sc?D2.sc.getBoundingClientRect().top+(mq.matches?parseFloat(getComputedStyle(D2.sc).scrollPaddingTop)||0:0):72, bot=D2.sc?D2.sc.getBoundingClientRect().bottom:window.innerHeight, sp=D2.y<top+48?-10:D2.y>bot-48?10:0;
  if(sp){ if(D2.sc) D2.sc.scrollTop+=sp; else window.scrollBy(0,sp); D2.raf=requestAnimationFrame(ordMove); } else D2.raf=0; }
document.addEventListener("pointermove",(e) =>{ if(!DRG) return; if(!DRG.row.isConnected){ DRG=null; return; } DRG.y=e.clientY; if(!DRG.raf) DRG.raf=requestAnimationFrame(ordMove); });
function ordEnd(cancel){ const D2=DRG; if(!D2) return; if(D2.raf) cancelAnimationFrame(D2.raf); D2.row.classList.remove("dragging");
  D2.run.forEach((r,i) =>{ const s=SPR["ordm|"+i]; if(s){ if(s.raf) cancelAnimationFrame(s.raf); delete SPR["ordm|"+i]; } });
  if(cancel||D2.to===D2.from||!D2.row.isConnected){ const before=ordTops(D2.list); D2.run.forEach((r) =>{ r.style.transform=""; }); DRG=null; ordFlip(D2.list,before); return; }
  const arr=D2.run.slice(); arr.splice(D2.from,1); arr.splice(D2.to,0,D2.row); const nm=ORDL[D2.list].name(D2.row), k=ORDL[D2.list].key(D2.row);
  const before2=ordTops(D2.list); DRG=null; const o=ORDL[D2.list], ks=arr.map(o.key);
  if(!S.order||typeof S.order!=="object") S.order={}; S.order[D2.list]=(S.order[D2.list]||[]).filter((x) =>{ return ks.indexOf(x)<0; }).concat(ks); save(); ordRender(D2.list); ordFlip(D2.list,before2);
  ordLive(nm+" moved to position "+(D2.to+1)+" of "+arr.length+"."); }
document.addEventListener("pointerup",() =>{ if(DRG) ordEnd(false); });
document.addEventListener("pointercancel",() =>{ if(DRG) ordEnd(true); });
document.addEventListener("keydown",(e) =>{ if(DRG&&e.key==="Escape"){ e.stopPropagation(); ordEnd(true); return; }
  const h=e.target.closest&&e.target.closest(".dragh"); if(!h) return; const k=e.key; if(k!=="ArrowUp"&&k!=="ArrowDown"&&k!=="Home"&&k!=="End") return; e.preventDefault();
  let list=h.getAttribute("data-ordl"), row=h.parentNode, run=null; ordRuns(list).forEach((r) =>{ if(r.indexOf(row)>=0) run=r; }); if(!run) return;
  const i=run.indexOf(row), j=k==="ArrowUp"?i-1:k==="ArrowDown"?i+1:k==="Home"?0:run.length-1; if(j<0||j>=run.length||j===i) return;
  const arr=run.slice(); arr.splice(i,1); arr.splice(j,0,row); const nm=ORDL[list].name(row), key=ORDL[list].key(row); ordCommit(list,run,arr,key); ordLive(nm+" moved to position "+(j+1)+" of "+run.length+"."); },true);
/* ===== v31 p18 breakdown rows one by one (RU131) ===== */
__set_showEntry((function(f){ return function(en){ const r=f.apply(this,arguments), b=$("#sheetBody"); b.classList.remove("stag");
  if(en&&en.type==="bd"&&!REDUCE){ [].forEach.call(b.querySelectorAll(".bk-r,.bk-t"),(x,i) =>{ x.style.setProperty("--i",i); }); void b.offsetWidth; b.classList.add("stag"); } return r; }; })(showEntry));
__set_refreshEntry((function(f){ return function(){ const b=$("#sheetBody"); if(b) b.classList.remove("stag"); return f.apply(this,arguments); }; })(refreshEntry));
/* ===== v31 p19 scroll position per tab (RU132) ===== */
const TABY={};
function tabsTop(){ const d=document.querySelector(".detail"), t=$("#tabs"); if(!d||!t) return 0; const st=parseFloat(getComputedStyle(t).top)||0; return Math.max(0,Math.round(d.getBoundingClientRect().top+window.scrollY-st)); }
__set_setTab((function(f){ return function(id,focus,instant){ const from=activeTab, pc=!mq.matches&&id!==from; if(pc) TABY[from]=window.scrollY;
  const r=f.apply(this,arguments); if(pc){ const top=tabsTop(), y=TABY[id]; if(y!=null&&y>top){ window.scrollTo(0,y); let got=window.scrollY, again=function(){ if(activeTab===id&&window.scrollY===got&&Math.abs(got-y)>1){ window.scrollTo(0,y); got=window.scrollY; } }; requestAnimationFrame(again); setTimeout(again,120); setTimeout(again,300); } else if(window.scrollY>top) window.scrollTo(0,top); } return r; }; })(setTab));
/* ===== v31 p21 HP bars on the compositor ===== */
let SPRE=null;
/* the same spring as spring(), sampled once into a linear() easing, so the browser runs it off the main thread */
function springEase(k,zeta){ let c=2*Math.sqrt(k)*zeta, x=0, v=0, dt=1/240, t=0, pts=[0], step=0;
  while(t<3){ const f=-k*(x-1)-c*v; v+=f*dt; x+=v*dt; t+=dt; if(++step%6===0) pts.push(Math.round(x*1000)/1000); if(t>.2&&Math.abs(1-x)<.002&&Math.abs(v)<.02) break; }
  pts.push(1); const lin=window.CSS&&CSS.supports&&CSS.supports("animation-timing-function","linear(0, 1)");
  return {d:Math.round(t*1000), e:lin?"linear("+pts.join(",")+")":"cubic-bezier(.2,.8,.2,1)"}; }
function barTo(el,p,instant,bc){ if(!el) return; const t="scaleX("+(Math.round(p*1000)/1000)+")"; if(bc&&el.__bc!==bc){ el.__bc=bc; el.style.backgroundColor=bc; } if(el.__t===t) return;
  let from=null; if(!instant&&!REDUCE&&el.__t!=null&&el.animate){ from=(el.__a&&el.__a.playState==="running")?getComputedStyle(el).transform:el.__t; }
  if(el.__a){ try{ el.__a.cancel(); }catch(er){} el.__a=null; } el.__t=t; el.style.transform=t;
  if(from&&from!==t&&from!=="none"){ const e=SPRE||(SPRE=springEase(120,.9)); try{ el.__a=el.animate([{transform:from},{transform:t}],{duration:e.d,easing:e.e}); }catch(er){ el.__a=null; } } }
if(BAD.length) recover("Saved data",BAD.join(" | ")); else { applyLook();renderAll(true); renderNotes(); syncPortrait(); }
