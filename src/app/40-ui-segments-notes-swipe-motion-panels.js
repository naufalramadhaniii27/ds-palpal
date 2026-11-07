import {env} from "./00-env.js";import {C,S} from "./04-logic-storage.js";
import {attMaxC,eqOn,esc,num} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {__set_renderActions,renderActions} from "./08b-ui-render-summaries-actions.js";import {__set_renderFeat,__set_renderInv,renderFeat,renderInv} from "./08c-ui-render-inventory-features-notes.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {__set_renderSpells,renderSpells} from "./23e-ui-spells-dc.js";
import {__set_renderExtras,renderExtras} from "./29b-ui-creatures-extras.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"FOPEN",{get:function(){return FOPEN;},set:function(v){FOPEN=v;},configurable:true});
Object.defineProperty(__R,"foldP",{get:function(){return foldP;},set:function(v){foldP=v;},configurable:true});
Object.defineProperty(__R,"lintChip",{get:function(){return lintChip;},set:function(v){lintChip=v;},configurable:true});
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
setTimeout(edgeRows,600);
setTimeout(edgeRows,2500);
setTimeout(edgeRows,6000);
document.addEventListener("click",() =>{ setTimeout(edgeRows,350); },true);
env.addEventListener("resize",() =>{ Array.prototype.forEach.call(document.querySelectorAll(".ifil"),segEdge); if(typeof edgeRows==="function") edgeRows(); });
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
env.addEventListener("resize",() =>{ Array.prototype.forEach.call(document.querySelectorAll("p.fold.fits"),(p) =>{ p.classList.remove("fits"); const b=p.nextElementSibling; if(b&&b.classList.contains("fmore")) b.hidden=false; }); foldFix(document); });

