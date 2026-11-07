/* Responsibility: coins: strip, conversion, pay and the Manage Coin sheet. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env (none used here). Shared names with other modules come from the imports below, late names through __R. */
import {C,S,save} from "./04-logic-storage.js";
import {$,$$,esc,num,toast} from "./05-logic-helpers.js";
import {CHEV,renderInv} from "./08-ui-render-sheet-and-actions.js";
import {__set_navStack,openSheet,sheetMode} from "./12-ui-bottom-sheet-modal.js";
import {__R} from "./00-reg.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
Object.defineProperty(__R,"coinSet",{get:function(){return coinSet;},set:function(v){coinSet=v;},configurable:true});
Object.defineProperty(__R,"coinStrip",{get:function(){return coinStrip;},set:function(v){coinStrip=v;},configurable:true});
Object.defineProperty(__R,"coinsNow",{get:function(){return coinsNow;},set:function(v){coinsNow=v;},configurable:true});
/* RU37: coins. S.coins {pp,gp,ep,sp,cp} is game state (kept by Apply). C.gp is the builder's starting gold: a change of C.gp is added to gp (S.coinBase) */
export var COINS=[["pp","Platinum",10,"1 pp = 10 gp"],["gp","Gold",1,""],["ep","Electrum",0.5,"1 gp = 2 ep"],["sp","Silver",0.1,"1 gp = 10 sp"],["cp","Copper",0.01,"1 gp = 100 cp"]];
export function coinsNow(){ const g=num(C.gp,0); if(!S.coins) return {pp:0,gp:g,ep:0,sp:0,cp:0}; const c={}; COINS.forEach((k) =>{ c[k[0]]=num(S.coins[k[0]],0); }); c.gp=Math.max(0,c.gp+g-num(S.coinBase,g)); return c; }
/* v31 RU123: the five coins, each with its icon and amount (copper to platinum), total in GP as a note. One button opens Manage Coin */
function coinStrip(c){ const o=[["cp","Copper"],["sp","Silver"],["ep","Electrum"],["gp","Gold"],["pp","Platinum"]], t=coinTotal(c);
  return '<button type="button" class="igp icoins" data-coinopen="1" aria-description="Manage Coin">'+o.map((k) =>{ return '<span class="icn ic-'+k[0]+'">'+ico("coin-"+k[0],"icn-i")+'<b>'+__R.fmtN(num(c[k[0]],0))+'</b> <small>'+k[0].toUpperCase()+'</small></span>'; }).join("")+'<span class="itot">'+t+' GP in all</span></button>'; }
export function coinTotal(c){ return Math.round(COINS.reduce((t,k) =>{ return t+c[k[0]]*k[2]; },0)*100)/100; }
export function coinSet(c){ S.coins=c; S.coinBase=num(C.gp,0); save(); }
/* T4: convert one coin into another, and pay a price with change. Values in copper: cp 1, sp 10, ep 50, gp 100, pp 1000 */
const CVAL={cp:1,sp:10,ep:50,gp:100,pp:1000}, CORD=["cp","sp","ep","gp","pp"];
export function coinCp(c){ return CORD.reduce((t,k) =>{ return t+num(c[k],0)*CVAL[k]; },0); }
export function coinList(o){ const a=[]; ["pp","gp","ep","sp","cp"].forEach((k) =>{ if(o[k]>0) a.push(__R.fmtN(o[k])+" "+k); }); return a.join(", "); }
/* price in gold (may be a fraction) shown in the largest coin that keeps it whole */
export function priceTxt(gp){ const cp=Math.round(gp*100); if(cp%100===0) return __R.fmtN(cp/100)+" gp"; if(cp%10===0) return __R.fmtN(cp/10)+" sp"; return __R.fmtN(cp)+" cp"; }
/* pay price (in copper) from coins c. Spends the smallest coins first. When a big coin has to be broken, change comes back in gp, sp and cp. Returns null when there is not enough */
export function coinPay(c,price){ price=Math.round(price); if(coinCp(c)<price) return null; let n={}, use={pp:0,gp:0,ep:0,sp:0,cp:0}, chg={pp:0,gp:0,ep:0,sp:0,cp:0}, left=price;
  CORD.forEach((k) =>{ n[k]=num(c[k],0); });
  CORD.forEach((k) =>{ const t=Math.min(n[k],Math.floor(left/CVAL[k])); use[k]+=t; n[k]-=t; left-=t*CVAL[k]; });
  if(left>0){ const b=CORD.filter((k) =>{ return n[k]>0&&CVAL[k]>=left; })[0]; if(!b) return null; n[b]--; use[b]++; let ch=CVAL[b]-left; left=0;
    ["gp","sp","cp"].forEach((k) =>{ const t=Math.floor(ch/CVAL[k]); chg[k]=t; n[k]+=t; ch-=t*CVAL[k]; }); }
  return {c:n,use:use,chg:chg}; }
/* convert amt coins of type from into type to. A remainder that does not fill a whole coin of the new type stays as the old coin */
function coinConv(c,from,to,amt){ amt=Math.floor(amt); if(from===to||amt<1) return {err:"Choose two different coins and an amount."}; if(amt>num(c[from],0)) return {err:"You only have "+__R.fmtN(num(c[from],0))+" "+from+"."};
  const val=amt*CVAL[from], cnt=Math.floor(val/CVAL[to]); if(cnt<1) return {err:amt+" "+from+" is worth less than one "+to+"."}; const rem=val-cnt*CVAL[to], back=Math.round(rem/CVAL[from]), n=Object.assign({},c);
  n[from]=num(c[from],0)-amt+back; n[to]=num(c[to],0)+cnt; return {c:n,got:cnt,used:amt-back}; }
let coinOpen=false;
function coinHTML(){ const c=coinsNow(), ls=S.lifestyle||"", L=(typeof LIFESTYLE!=="undefined"?LIFESTYLE:[]), lo=L.filter((x) =>{return x[0]===ls})[0];
  return '<div id="coinDlg"><button type="button" class="ctot" data-coin="tog" aria-expanded="'+coinOpen+'"><b>Total (in gp)</b><span>'+coinTotal(c)+'</span>'+CHEV+'</button>'+(coinOpen?'<p class="muted">Every coin converted to gold. Electrum, silver, and copper count as fractions of a gold piece.</p>':'')+
   '<div class="crows">'+COINS.map((k) =>{ return '<div class="crow"><span class="cico c-'+k[0]+'"></span><span class="cnm"><b>'+k[1]+' ('+k[0]+')</b><small>'+k[3]+'</small></span><span class="cv" id="cv-'+k[0]+'">'+c[k[0]]+'</span></div>'; }).join("")+'</div>'+
   '<div class="info-h">Adjust Coin</div><div class="cadj">'+COINS.map((k) =>{ return '<label><span>'+k[0].toUpperCase()+'</span><input type="number" min="0" inputmode="numeric" data-camt="'+k[0]+'" placeholder="0"></label>'; }).join("")+'</div>'+
   '<div class="info-h">Convert Coin</div><div class="cconv"><label><span>From</span><select data-cvf aria-label="Convert from">'+CORD.slice().reverse().map((k) =>{ return '<option value="'+k+'"'+(k==="gp"?' selected':'')+'>'+k.toUpperCase()+'</option>'; }).join("")+'</select></label><label><span>To</span><select data-cvt aria-label="Convert to">'+CORD.slice().reverse().map((k) =>{ return '<option value="'+k+'"'+(k==="sp"?' selected':'')+'>'+k.toUpperCase()+'</option>'; }).join("")+'</select></label><label><span>Amount</span><input type="number" min="1" inputmode="numeric" data-cvamt placeholder="0" aria-label="Amount to convert"></label><button type="button" class="btn press" data-coin="conv">Convert</button></div><p class="muted" id="cvPrev" aria-live="polite"></p>'+
   '<div class="cbtns"><button type="button" class="btn press" data-coin="add">+ Add</button><button type="button" class="btn press" data-coin="rem">\u2212 Remove</button><button type="button" class="btn press" data-coin="clr">\u00d7 Clear</button></div>'+
   '<div class="info-h">Lifestyle Expenses</div><select data-life="1" aria-label="Lifestyle"><option value="">Choose a lifestyle</option>'+L.map((x) =>{ return '<option value="'+x[0]+'"'+(x[0]===ls?' selected':'')+'>'+x[0]+' ('+x[1]+(x[1]==="Free"?'':' per day')+')</option>'; }).join("")+'</select>'+(lo?'<p class="info-d">'+esc(lo[2])+'</p>':'<p class="muted">Pick the lifestyle you pay for each week or month. It covers lodging, food, and upkeep.</p>')+'</div>'; }
function openCoins(){ __set_navStack([]); openSheet("Manage Coin", coinHTML(), "coin"); }
export function coinRefresh(){ const b=$("#sheetBody"); if(b&&sheetMode==="coin") b.innerHTML=coinHTML(); renderInv(); }
document.addEventListener("input",(e) =>{ const t=e.target; if(!t||!t.matches||!t.matches("[data-cvamt],[data-cvf],[data-cvt]")) return; const p=$("#cvPrev"); if(!p) return; const f=$("#coinDlg [data-cvf]").value, to=$("#coinDlg [data-cvt]").value, am=num($("#coinDlg [data-cvamt]").value,0), r=am>0?coinConv(coinsNow(),f,to,am):null;
  p.textContent=!r?"":r.err?r.err:__R.fmtN(r.used)+" "+f+" becomes "+__R.fmtN(r.got)+" "+to+"."+(r.used<Math.floor(am)?" The other "+__R.fmtN(Math.floor(am)-r.used)+" "+f+" stay as they are.":""); });
document.addEventListener("click",(e) =>{ const b=e.target.closest("[data-coin],[data-coinopen]"); if(!b) return;
  if(b.hasAttribute("data-coinopen")){ openCoins(); return; }
  const a=b.getAttribute("data-coin"); if(a==="tog"){ coinOpen=!coinOpen; coinRefresh(); return; }
  if(a==="conv"){ const c0=coinsNow(), cf=$("#coinDlg [data-cvf]").value, ct=$("#coinDlg [data-cvt]").value, r0=coinConv(c0,cf,ct,num($("#coinDlg [data-cvamt]").value,0)); if(r0.err){ toast(r0.err); return; }
    __R.undoMark("Convert coins"); coinSet(r0.c); coinRefresh(); __R.toastU("Converted "+__R.fmtN(r0.used)+" "+cf+" into "+__R.fmtN(r0.got)+" "+ct+"."); return; }
  let c=coinsNow(), amt={}, any=false; $$("#coinDlg [data-camt]").forEach((i) =>{ const v=Math.floor(num(i.value,0)); amt[i.getAttribute("data-camt")]=v>0?v:0; if(v>0) any=true; });
  if(a==="clr"){ $$("#coinDlg [data-camt]").forEach((i) =>{ i.value=""; }); return; }
  if(!any){ toast("Type an amount first."); return; }
  if(a==="rem"){ const short=COINS.filter((k) =>{ return amt[k[0]]>c[k[0]]; }); if(short.length){ toast("Not enough "+short.map((k) =>{return k[1].toLowerCase()}).join(" and ")+". Nothing was removed."); return; } }
  __R.undoMark(a==="add"?"Add coins":"Remove coins"); COINS.forEach((k) =>{ c[k[0]]+= (a==="add"?1:-1)*amt[k[0]]; }); coinSet(c); coinRefresh(); __R.toastU(a==="add"?"Coins added.":"Coins removed."); });
document.addEventListener("change",(e) =>{ const t=e.target; if(t.matches&&t.matches("[data-life]")){ S.lifestyle=t.value; save(); coinRefresh(); } });
