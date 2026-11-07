import {C,CKEY,FROZEN,KEY,S,cSaveT,lsGet,lsSet,saveT} from "./04-logic-storage.js";
import {ask,esc} from "./05-logic-helpers.js";
import {__set_navStack,navStack,openSheet} from "./12-ui-bottom-sheet-modal.js";
import {BKEY,rEnsure,rGet,rSave,setOrDel} from "./14-ui-editor.js";
import {curRaw,fmtT,rSnap,rawHash,snTake} from "./15-logic-roster-backup-files-snapshots.js";
import {undoLbl} from "./32-logic-play-undo-actions.js";
import {rcptDiff,rcptHTML,rcptNow} from "./46-logic-receipts.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"tmOpen",{get:function(){return tmOpen;},set:function(v){tmOpen=v;},configurable:true});
/* T11 G3 N2 Time machine. The open character is kept as it was at many points in time: after a quiet minute following a change,
   at most one point per 10 minutes, the last 40 points per character. Each point keeps the build, sheet and state (portrait left out)
   with its number receipt (N3) and the last action name. History lists the points with what changed since the one before, compares any
   point with now, and goes back to it (the character as it is now is kept as a snapshot first). Stored under cs-tm-<id>, never synced */
let TM_MAX=40, TM_GAP=6e5, TM_T=0, TM_LAST="";
function tmKey(id){ return "cs-tm-"+id; }
function tmGet(id){ try{ const a=JSON.parse(lsGet(tmKey(id))||"[]"); return Array.isArray(a)?a:[]; }catch(e){ return []; } }
function tmTake(why,force){ if(FROZEN||!C||!S) return; const id=(rGet()||{}).active; if(!id) return; let raw=curRaw(), s=raw.S;
  try{ const so=JSON.parse(s||"null"); if(so&&so.portrait){ so.portrait=""; s=JSON.stringify(so); } }catch(e){}
  const h=rawHash({B:raw.B,C:raw.C,S:s}); if(h===TM_LAST&&!force) return; const L=tmGet(id), now=Date.now();
  if(L[0]&&L[0].h===h) { TM_LAST=h; return; }
  const pt={t:now,why:why||"Changes",h:h,B:raw.B,C:raw.C,S:s,r:rcptNow()};
  if(!force&&L[0]&&now-L[0].t<TM_GAP&&L[0].auto) L[0]=pt; else L.unshift(pt); pt.auto=!force;
  try{ __store.setItem(tmKey(id),JSON.stringify(L.slice(0,TM_MAX))); TM_LAST=h; }catch(e){ try{ __store.setItem(tmKey(id),JSON.stringify(L.slice(0,10))); }catch(er){} } }
/* a quiet minute after the last change */
function tmQueue(){ clearTimeout(TM_T); TM_T=setTimeout(() =>{ let l=""; try{ l=undoLbl(); }catch(e){} tmTake(l||"Changes"); },60000); }
document.addEventListener("click",() =>{ if(!FROZEN) tmQueue(); },true); document.addEventListener("input",() =>{ if(!FROZEN) tmQueue(); },true);
document.addEventListener("visibilitychange",() =>{ if(document.visibilityState==="hidden"&&TM_T){ clearTimeout(TM_T); TM_T=0; try{ tmTake(undoLbl()||"Changes"); }catch(e){} } });
setTimeout(() =>{ try{ tmTake("Opened",false); }catch(e){} },4000);
function tmHTML(){ const id=(rGet()||{}).active, L=tmGet(id); if(!L.length) return '<p class="rc-none">No history yet. Points are kept a minute after you change something.</p>';
  return '<p class="bk-f">Your character at earlier moments, newest first. Compare any moment with now, or go back to it.</p><ul class="tml">'+L.map((p,i) =>{ const prev=L[i+1], d=prev?rcptDiff(prev.r,p.r):[];
    return '<li><div class="tm-h"><b>'+esc(fmtT(p.t))+'</b><span>'+esc(p.why)+'</span></div>'+(d.length?'<small>'+d.slice(0,3).map((x) =>{ return esc(x.l+" "+(x.from||"-")+" → "+(x.to||"-")); }).join("<br>")+(d.length>3?"<br>and "+(d.length-3)+" more":"")+'</small>':'')
      +'<div class="tm-a"><button type="button" class="btn press" data-tmc="'+i+'">Compare with now</button>'+(i?'<button type="button" class="btn press" data-tmr="'+i+'">Go back here</button>':'')+'</div></li>'; }).join("")+'</ul>'; }
function tmOpen(){ __set_navStack([]); openSheet("History",tmHTML(),"tm"); }
document.addEventListener("click",(e) =>{ const c=e.target.closest&&e.target.closest("[data-tmc],[data-tmr]"); if(!c) return; const id=(rGet()||{}).active, L=tmGet(id);
  if(c.hasAttribute("data-tmc")){ const p=L[+c.getAttribute("data-tmc")]; if(!p) return; const d=rcptDiff(p.r,rcptNow()); __set_navStack([]); openSheet("Then and now",'<p class="bk-f">'+esc(fmtT(p.t))+' compared with now.</p>'+rcptHTML(d,"The numbers are the same."),"tm"); return; }
  const q=L[+c.getAttribute("data-tmr")]; if(!q) return; const dd=rcptDiff(rcptNow(),q.r), pv=dd.slice(0,6).map((x) =>{ return x.l+": "+(x.from||"-")+" → "+(x.to||"-"); }).join("\n");
  ask("Go back to "+fmtT(q.t)+"? The character as it is now is kept as a snapshot first, so you can undo this."+(pv?"\n\nNumbers that change:\n"+pv:""),"Go Back",() =>{ const r=rSnap(rEnsure()); snTake(id,"Before going back in History",r);
    let s=q.S; try{ const so=JSON.parse(s), co=JSON.parse(curRaw().S||"{}"); if(co.portrait){ so.portrait=co.portrait; s=JSON.stringify(so); } }catch(er){}
    const e2=r.chars[id]; if(!e2) return; e2.B=q.B; e2.C=q.C; e2.S=s; e2.t=Date.now(); if(!rSave(r)) return; clearTimeout(cSaveT); clearTimeout(saveT); setOrDel(BKEY,q.B); lsSet(CKEY,q.C); lsSet(KEY,s); sessionStorage.setItem("cs-skip","1"); __miReload(); }); });
env.__tm={take:function(w){ tmTake(w||"Test",true); }, list:function(){ return tmGet((rGet()||{}).active).map((p) =>{ return {t:p.t,why:p.why}; }); }, open:tmOpen};
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-tmopen]"); if(b) tmOpen(); });
