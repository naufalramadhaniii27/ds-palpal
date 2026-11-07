import {env} from "./00-env.js";/* Responsibility: drag to reorder the inventory and feature lists. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env (none used here). Shared names with other modules come from the imports below, late names through __R. */
import {C,S,save} from "./04-logic-storage.js";
import {$} from "./05-logic-helpers.js";
import {REDUCE,SPR,spring} from "./07-ui-theme-contrast-spring.js";
import {__set_renderFeat,__set_renderInv,featQ,invF,renderFeat,renderInv} from "./08c-ui-render-inventory-features-notes.js";
import {__set_refreshEntry,__set_showEntry,refreshEntry,showEntry} from "./12-ui-bottom-sheet-modal.js";
import {mq} from "./21-ui-tabs-pager.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {invKey} from "./23b-ui-items-containers.js";
import {__R} from "./00-reg.js";
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
  DRG={h:h,list:list,row:row,run:run,from:from,to:from,y0:e.clientY,st0:sc?sc.scrollTop:env.scrollY,sc:sc,tops:rects.map((b) =>{ return b.top; }),hs:rects.map((b) =>{ return b.height; }),y:e.clientY,raf:0};
  row.classList.add("dragging"); });
function ordShift(i,v){ const r=DRG.run[i]; spring("ordm|"+i,v,(x) =>{ r.style.transform=Math.abs(x)<.3?"":"translateY("+x.toFixed(1)+"px)"; },{k:420,zeta:.8}); }
function ordMove(){ if(!DRG) return;
 const {D2}=ordMoveStep1();
  ordMoveStep2(D2); }
function ordMoveStep1(){
const D2=DRG, st=D2.sc?D2.sc.scrollTop:env.scrollY, dy=D2.y-D2.y0+(st-D2.st0), f=D2.from, hf=D2.hs[f];
  D2.row.style.transform="translateY("+dy.toFixed(1)+"px)";
  let c=D2.tops[f]+hf/2+dy, to=f; for(let i=0;i<D2.run.length;i++){ const mid=D2.tops[i]+D2.hs[i]/2; if(i>f&&c>mid) to=i; if(i<f&&c<mid&&to===f) to=i; }
  if(to!==D2.to){ D2.to=to; const step=(f<D2.run.length-1?D2.tops[f+1]-D2.tops[f]:hf+(D2.tops[f]-(f?D2.tops[f-1]+D2.hs[f-1]:D2.tops[f]))); const gap=Math.max(0,(f<D2.run.length-1?D2.tops[f+1]-(D2.tops[f]+hf):0)), sh=hf+gap;
    for(let j=0;j<D2.run.length;j++){ if(j===f) continue; ordShift(j,(f<to&&j>f&&j<=to)?-sh:(f>to&&j>=to&&j<f)?sh:0); } }
  return /** @type {any} */ ({D2});
}
function ordMoveStep2(D2){
  /* near the edge of the scrolling area: scroll on */
  const top=D2.sc?D2.sc.getBoundingClientRect().top+(mq.matches?parseFloat(getComputedStyle(D2.sc).scrollPaddingTop)||0:0):72, bot=D2.sc?D2.sc.getBoundingClientRect().bottom:env.innerHeight, sp=D2.y<top+48?-10:D2.y>bot-48?10:0;
  if(sp){ if(D2.sc) D2.sc.scrollTop+=sp; else env.scrollBy(0,sp); D2.raf=requestAnimationFrame(ordMove); } else D2.raf=0;
}
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
