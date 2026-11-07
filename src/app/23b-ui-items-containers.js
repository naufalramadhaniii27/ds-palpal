import {C,saveC} from "./04-logic-storage.js";
import {ask,bldGuard,bldSync,esc,fmtW,invAt,num,toast,viaBld} from "./05-logic-helpers.js";
import {renderInv} from "./08-ui-render-sheet-and-actions.js";
import {refreshEntry} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {setTab} from "./21-ui-tabs-pager.js";
import {__R} from "./00-reg.js";
import {env} from "./00-env.js";
import {ctOf,ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
Object.defineProperty(__R,"ctCap",{get:function(){return ctCap;},set:function(v){ctCap=v;},configurable:true});
Object.defineProperty(__R,"ctH",{get:function(){return ctH;},set:function(v){ctH=v;},configurable:true});
Object.defineProperty(__R,"ctLoad",{get:function(){return ctLoad;},set:function(v){ctLoad=v;},configurable:true});
Object.defineProperty(__R,"ctShut",{get:function(){return ctShut;},set:function(v){ctShut=v;},configurable:true});
Object.defineProperty(__R,"invKey",{get:function(){return invKey;},set:function(v){invKey=v;},configurable:true});
Object.defineProperty(__R,"invWeight",{get:function(){return invWeight;},set:function(v){invWeight=v;},configurable:true});
Object.defineProperty(__R,"itemW",{get:function(){return itemW;},set:function(v){itemW=v;},configurable:true});
Object.defineProperty(__R,"moveCtl",{get:function(){return moveCtl;},set:function(v){moveCtl=v;},configurable:true});
Object.defineProperty(__R,"occOf",{get:function(){return occOf;},set:function(v){occOf=v;},configurable:true});
Object.defineProperty(__R,"packH",{get:function(){return packH;},set:function(v){packH=v;},configurable:true});
export function invKey(i){ return i.key||i.n; }
/* v32 RU134: occurrence of an item among the items with the same key (0 = first), for the builder hooks */
export function occOf(it){ let L=C.inv||[], k=it&&invKey(it), n=0; for(let i=0;i<L.length&&L[i]!==it;i++) if(invKey(L[i])===k) n++; return n; }
function packOf(it){ return typeof PACKS==="undefined"||!it?"":PACKS[it.n]?it.n:it.key&&PACKS[it.key]?it.key:""; }
function gearOf(n){ return (typeof GEAR!=="undefined"?GEAR:[]).filter((g) =>{ return g[0]===n; })[0]||null; }
/* a pack row of a hand-filled sheet opens into its container and items, in its place (weight and price from the data) */
function unpackC(it){ const pn=packOf(it), L=C.inv||[], i=L.indexOf(it); if(!pn||i<0) return 0; const P=PACKS[pn], q=Math.max(0,Math.floor(num(it.q,1))), out=[];
  for(let k=0;k<q;k++){ var nm=P[0]+" ("+pn+")", c2=2; while(L.concat(out).some((y) =>{ return invKey(y)===nm; })) nm=P[0]+" ("+pn+" "+(c2++)+")";
    const g0=gearOf(P[0]), ct={n:nm,q:1,w:g0?g0[2]:0}; if(g0) ct.cost=g0[1]; if(it.in) ct.in=it.in; out.push(ct);
    P[1].forEach((x) =>{ const g=gearOf(x[0]), o={n:x[0],q:x[1],w:g?g[2]:0,in:nm}; if(g) o.cost=g[1]; out.push(o); }); }
  L.splice.apply(L,[i,1].concat(out)); C.inv=L; return out.length; }
function packH(it,ix){ const pn=packOf(it); if(!pn) return ""; const P=PACKS[pn], q=num(it.q,1);
  return '<div class="info-h">Unpack</div>'+(q>0?'<p class="info-d">Turns this row into the '+esc(P[0])+' and its '+P[1].length+' kinds of items, each with its own Qty, so you can count torches, rations, and oil as you use them.</p><div class="ipk"><button type="button" class="btn pri press" data-unpack="'+esc(invKey(it))+'" data-iix="'+ix+'">'+ico("item-container")+'Unpack</button></div>':'<p class="muted">Qty is 0, so there is nothing to unpack.</p>'); }
/* a container made from a pack holds what the book puts in it (a Backpack of 30 lb holds the 50 lb of an Explorer's Pack); more than that is over */
function ctCap(c,ct){ const m=/\(([^()]+'s Pack)(?: \d+)?\)$/.exec(c&&c.n||""), P=m&&typeof PACKS!=="undefined"&&PACKS[m[1]]; if(!P||!ct[1]) return ct[1];
  return Math.max(ct[1], P[1].reduce((t,x) =>{ const g=gearOf(x[0]); return t+(g?g[2]:0)*x[1]; },0)); }
/* a container popup lists what is inside; each line opens that item */
function ctH(it,ix){ if(!ctOf(it.n)) return ""; const k=invKey(it), L=(C.inv||[]).map((x,i) =>{ return [x,i]; }).filter((p) =>{ return p[0]!==it&&p[0].in===k; });
  return '<div class="info-h">Inside ('+L.length+')</div>'+(L.length?'<div class="info-l">'+L.map((p) =>{ const q=num(p[0].q,1); return '<button type="button" data-info="it:'+p[1]+'">'+esc(__R.cuNm("i:"+invKey(p[0]),p[0].n))+'<span>Qty '+q+' • '+fmtW(q*__R.cuW(p[0]))+' lb.</span></button>'; }).join("")+'</div>':'<p class="muted">Empty. Open an item and use Move to put it here.</p>'); }
var ctShut={};
export var CONS1=/^(Torch|Candle|Rations \(1 day\)|Oil \(flask\))$/;
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-unpack]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  const nm=b.getAttribute("data-unpack"), it=invAt(nm,b.getAttribute("data-iix")); if(!it) return; const occ=occOf(it), pn=packOf(it), lbl=it.n;
  if(num(it.q,1)<1){ toast("Qty is 0, so there is nothing to unpack."); return; }
  const done1=function(n){ if(typeof closeSheet==="function") closeSheet(); __R.renderAll(); if(typeof setTab==="function") setTab("p-inv"); __R.toastU(n?"Unpacked "+lbl+": a "+PACKS[pn][0]+" and "+PACKS[pn][1].length+" kinds of items.":"Nothing to unpack."); };
  if(viaBld(nm)&&env.__bldUnpack){ bldGuard(() =>{ __R.undoMark("Unpack "+lbl); const ok=env.__bldUnpack(nm,C.name,occ,true); done1(ok?1:0); }); return; }
  __R.undoMark("Unpack "+lbl); const n=unpackC(it); try{ if(env.__bldUnpack) env.__bldUnpack(nm,C.name,occ,false); }catch(er){} saveC(); done1(n); },true);
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-use1]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const nm=b.getAttribute("data-potn"), ix=+b.getAttribute("data-use1"), it=invAt(nm,ix); if(!it) return;
  const left=Math.max(0,num(it.q,1)-1), lb=it.n; if(num(it.q,1)<1){ toast("None left."); return; } __R.qtyAdj(nm,ix,-1,"Use "+lb,() =>{ __R.toastU("Used 1 "+lb+". "+left+" left."); }); },true);
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#invBody [data-ctog]"); if(!b) return; const k=b.getAttribute("data-ctog"); ctShut[k]=!ctShut[k]; renderInv();
  const nb=Array.prototype.slice.call(document.querySelectorAll("#invBody [data-ctog]")).filter((x) =>{ return x.getAttribute("data-ctog")===k; })[0]; if(nb) nb.focus({preventScroll:true}); });
function itemW(i){ const c=ctOf(i.n); if(c&&c[2]!=null) return c[2]*num(i.q,1); return num(i.q,1)*__R.cuW(i); }
export function invWeight(){ const L=C.inv||[], byK={}; L.forEach((i) =>{ byK[invKey(i)]=i; }); return L.reduce((t,i) =>{ const p=i.in&&byK[i.in], pc=p&&ctOf(p.n); if(pc&&pc[2]!=null) return t; return t+itemW(i); },0); }
function ctLoad(c){ return (C.inv||[]).filter((i) =>{ return i.in===invKey(c); }).reduce((t,i) =>{ return t+num(i.q,1)*__R.cuW(i); },0); }
function moveCtl(it,ix){ const cs=(C.inv||[]).filter((c) =>{ return c!==it&&ctOf(c.n)&&c.in!==invKey(it); }); if(!cs.length&&!it.in) return "";
  return '<div class="imv"><label class="muted" for="imove">Move to</label><select id="imove" data-imove="'+ix+'"><option value="">Equipment (not in a container)</option>'+cs.map((c) =>{ return '<option value="'+esc(invKey(c))+'"'+(it.in===invKey(c)?' selected':'')+'>'+esc(c.n)+'</option>'; }).join("")+'</select></div>'; }
const XDIM=/^(Bag of Holding|Heward's Handy Haversack|Portable Hole)\b/;
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.matches||!t.matches("[data-imove]")) return; const it=(C.inv||[])[+t.getAttribute("data-imove")]; if(!it) return;
  const dst=t.value?(C.inv||[]).filter((c) =>{ return invKey(c)===t.value; })[0]:null;
  if(dst&&XDIM.test(it.n)&&XDIM.test(dst.n)){ const tv=t.value, lbl=t.options[t.selectedIndex].text; t.value=it.in||""; ask("If "+it.n+" goes inside "+dst.n+", both are torn apart and a rift to the Astral Plane opens. Move it anyway?","Move", () =>{ it.in=tv; bldSync(invKey(it),{in:tv,occ:occOf(it)}); saveC(); __R.renderAll(); refreshEntry(); toast("Moved to "+lbl+"."); }); return; }
  if(t.value) it.in=t.value; else delete it.in; bldSync(invKey(it),{in:t.value||"",occ:occOf(it)}); saveC(); __R.renderAll(); refreshEntry(); toast(t.value?"Moved to "+t.options[t.selectedIndex].text+".":"Moved out of the container.");
  if(t.value){ const ix0=t.getAttribute("data-imove"); setTimeout(() =>{ const b=document.querySelector('.ichk.on[data-iix="'+ix0+'"]'); if(b) b.click(); },0); }/* v32 p24 */ });
