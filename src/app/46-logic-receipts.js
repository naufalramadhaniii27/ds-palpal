import {ABN} from "./02-data-default-character.js";
import {APP_VER,C,FROZEN,__set_C,lsGet} from "./04-logic-storage.js";
import {$,__set_toastT,esc,toastT} from "./05-logic-helpers.js";
import {B,D,__set_B,__set_D,derive} from "./06-logic-derivation.js";
import {__set_navStack,navStack,openSheet} from "./12-ui-bottom-sheet-modal.js";
import {rGet} from "./14-ui-editor.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"rcptShow",{get:function(){return rcptShow;},set:function(v){rcptShow=v;},configurable:true});
/* T11 G3 N3 Number receipts. The derivation already keeps where each number comes from (B, the breakdowns). Here every main number is
   kept as a receipt (label, total, parts). Two receipts compare into "what changed and why": after an app update (N3), before Apply
   in the builder (N16) and before a restore (N13). Kept per character under cs-rcpt-v1 (new key, small, never synced) */
const RCPT_KEYS=/^(ac|hp|init|speed|pb|spdc|spatk|dc|pas-per|save-|sk-|ab-|ah-|ad-)/;
export function rcptNow(){ const o={}; Object.keys(B).forEach((k) =>{ if(!RCPT_KEYS.test(k)) return; const b=B[k]; if(!b||!b.parts||b.total==null||b.total==="undefined") return;
    const l=/^ab-/.test(k)?ABN[k.slice(3)]+" score":String(b.t||k); o[k]={l:l,v:String(b.total),p:b.parts.map((p) =>{ return [String(p.l),String(p.v)]; })}; });
  return o; }
/* the receipt of another build (a C from the builder or a backup), worked out with the same derivation and then put back */
function rcptFor(c){ let C0=C, D0=D, B0=B, out=null; try{ __set_C(structuredClone(c)); __set_B({}); derive(); out=rcptNow(); }catch(e){ out=null; } __set_C(C0); __set_D(D0); __set_B(B0); try{ derive(); }catch(e){} return out; }
export function rcptDiff(a,b){ const out=[]; if(!a||!b) return out; Object.keys(b).forEach((k) =>{ const x=a[k], y=b[k];
    if(!x){ if(/^(ah-|ad-)/.test(k)) out.push({k:k,l:y.l,from:"",to:y.v,why:["New"]}); return; }
    if(x.v===y.v) return; const why=[], am={}, bm={}; x.p.forEach((p) =>{ am[p[0]]=p[1]; }); y.p.forEach((p) =>{ bm[p[0]]=p[1]; });
    y.p.forEach((p) =>{ if(!(p[0] in am)) why.push("Now: "+p[0]+" ("+p[1]+")"); else if(am[p[0]]!==p[1]) why.push(p[0]+": "+am[p[0]]+" → "+p[1]); });
    x.p.forEach((p) =>{ if(!(p[0] in bm)) why.push("Gone: "+p[0]+" ("+p[1]+")"); });
    out.push({k:k,l:y.l,from:x.v,to:y.v,why:why}); });
  Object.keys(a).forEach((k) =>{ if(!b[k]&&/^(ah-|ad-)/.test(k)) out.push({k:k,l:a[k].l,from:a[k].v,to:"",why:["Gone"]}); });
  return out; }
export function rcptHTML(list,empty){ if(!list.length) return '<p class="rc-none">'+esc(empty||"No numbers change.")+'</p>';
  return '<ul class="rcpt">'+list.map((d) =>{ return '<li><div class="rc-h"><b>'+esc(d.l)+'</b><span>'+(d.from?esc(d.from):"")+(d.from&&d.to?' → ':'')+(d.to?'<strong>'+esc(d.to)+'</strong>':'')+'</span></div>'+(d.why.length?'<small>'+d.why.map(esc).join("<br>")+'</small>':'')+'</li>'; }).join("")+'</ul>'; }
window.__rcptPreview=function(newC){ if(FROZEN||!newC) return ""; const a=rcptNow(), b=rcptFor(newC); return b?rcptHTML(rcptDiff(a,b),"Nothing changes on your sheet."):""; };
window.__rcptDiffFor=function(c){ const b=rcptFor(c); return b?rcptDiff(rcptNow(),b):[]; };
window.__rcptRestoreText=function(c){ const l=window.__rcptDiffFor(c); if(!l.length) return ""; return l.slice(0,6).map((d) =>{ return d.l+": "+(d.from||"-")+" → "+(d.to||"-"); }).join("\n")+(l.length>6?"\n…and "+(l.length-6)+" more":""); };
/* N3 after an update: the numbers of this character are compared with the ones kept by the last app version */
let RCPT_LAST=null;
function rcptCheck(){ if(FROZEN||!C) return; let id=(rGet()||{}).active||"", st={}; try{ st=JSON.parse(lsGet("cs-rcpt-v1")||"{}")||{}; }catch(e){ st={}; }
  const now=rcptNow(), old=st[id]; st[id]={ver:APP_VER,r:now};
  Object.keys(st).forEach((k) =>{ if(!(rGet()||{chars:{}}).chars[k]) delete st[k]; });
  try{ __store.setItem("cs-rcpt-v1",JSON.stringify(st)); }catch(e){}
  if(!old||old.ver===APP_VER) return; const d=rcptDiff(old.r,now); if(!d.length) return; RCPT_LAST={ver:old.ver,list:d};
  setTimeout(() =>{ const t=$("#toast"); if(!t) return; t.innerHTML=ico("toast-ok","tico")+'<span>After the update, '+d.length+' number'+(d.length>1?"s":"")+' changed.</span><button type="button" class="tundo" data-rcpt="1">See why</button>'; t.classList.add("on","act"); if(window.__topLayer) window.__topLayer(t); clearTimeout(toastT); __set_toastT(setTimeout(() =>{ t.classList.remove("on","act"); },9000)); },1500); }
function rcptShow(){ const l=RCPT_LAST?RCPT_LAST.list:[]; __set_navStack([]); openSheet("What changed",'<p class="bk-f">Numbers of this character that changed with the last app update, and the reason for each.</p>'+rcptHTML(l,"Nothing changed with the last update."),"rcpt"); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-rcpt]"); if(!b) return; $("#toast").classList.remove("on","act"); rcptShow(); });
window.__rcptNow=rcptNow; window.__rcptShow=rcptShow; window.__rcptCheck=rcptCheck;
setTimeout(() =>{ try{ rcptCheck(); }catch(e){} },2500);
