/* ================= v17 ================= */
/* RU40: every Limited Use row of a feature (several rows can belong to one feature, f = feature or item name) */
function resOf(name){ return (D.res||[]).filter(function(q){ return q.n===name||q.f===name; }); }
/* v36 p10: usage pips in the card head (the same .bx boxes), the reset line only when the sentence does not already say it */
function resPips(rl){ var p=rl.filter(function(r){ return !r.pool; }); return p.length?'<span class="hpips">'+p.map(function(r){ return (p.length>1?'<small class="hpl">'+esc(r.n)+'</small>':'')+'<span class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>'; }).join("")+'</span>':''; }
function resTail(rl,so){ var rest=so&&(so.m||[]).some(function(x){ return /Rest/.test(x); }); return rl.map(function(r){ if(so&&!r.pool) return rest?'':'<div class="fres">'+resetTxt(r)+'</div>'; return resBoxes([r]); }).join(""); }
function manCost(rl){ var r=rl.filter(function(q){ return !q.pool; })[0]; if(!r) return ""; var left=r.max-used(r.k,r.max); return '<div class="sum-m"><span class="supd" data-k="'+r.k+'">'+ico("ui-dice","sum-i")+'<span>1 '+esc(String(r.n).replace(/Dice$/,"Die"))+'. <b>'+left+'</b> left</span></span></div>'; }
function resBoxes(rl){ return rl.map(function(r){ return '<div class="fuse">'+(rl.length>1||r.n!==r.f?esc(r.n)+': ':'')+(r.pool?'Points:':'Used:')+'</div><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div><div class="fres">'+resetTxt(r)+'</div>'; }).join(""); }
function itemRes(it){ var rl=resOf(it.n); return rl.length?'<div class="fsub ires">'+resBoxes(rl)+rl.map(chMaxH).join("")+'</div>':''; }
function resetTxt(r){ return {short:"Resets on a Short or Long Rest",short1:"One use back on a Short Rest, all on a Long Rest",long:"Resets on a Long Rest",none:"Does not reset on a rest"}[r.reset]||""; }
/* RU35 no. 4: icon of the kind of attack */
var AK_ICON={melee:"M14 3h7v7L10 21l-7-7zM6 14l4 4",ranged:"M4 20L20 4M13 4h7v7M5 13c3 0 6 3 6 6",spell:"M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1z",unarmed:"M7 11V7a2 2 0 0 1 4 0v4M11 9V6a2 2 0 0 1 4 0v5M15 9a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0",feature:"M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"};
function atkKind(a){ if(/Unarmed/.test(a.n)) return "unarmed"; if(/^Cantrip/.test(a.sub||"")) return "spell"; if(/thrown/i.test(a.n)||/^\d+\/\d+/.test(String(a.range||"").trim())) return "ranged"; return "melee"; }
function akIcon(k){ return svgI(AK_ICON[k],"aki ak-"+k,{melee:"Melee attack",ranged:"Ranged attack",spell:"Spell attack",unarmed:"Unarmed Strike",feature:"Feature"}[k]); }
function tyIcon(t){ var h=dtIcon(String(t||"").replace(/ or |, /g,"|")); return h||(t?svgI(AK_ICON.melee,"dti dt-weapon",String(t)):""); }
/* RU35 no. 1: slot boxes in the heading of each spell level (Pact Magic slots where Pact spells are listed) */
function spSlotsH(l,rows){ if(!l) return ""; var o="", r=(D.res||[]).filter(function(q){return q.k==="s"+l})[0], pr=(D.res||[]).filter(function(q){return q.k==="pact"})[0];
  if(r) o+='<span class="spsl"><small>SLOTS</small>'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>';
  if(pr&&rows.some(function(p){return spPact(p[0])})) o+='<span class="spsl"><small>PACT</small>'+boxes(used(pr.k,pr.max),pr.max,pr.k,pr.n)+'</span>';
  return o?'<span class="spslw">'+o+'</span>':""; }
/* RU35 no. 7: Speed and Defenses, always shown */
function renderSpeedDef(){ var e=document.getElementById("speeds"); if(e){ var sp=Object.assign({},C.speeds||{}); if(D.cf&&D.cf.fly&&!sp.fly) sp.fly=D.cf.fly;/* v22 */ var rows='<div class="sense"><span class="bonus">'+D.speed+'</span><span>Walking, ft</span></div>';
    ["fly","swim","climb","burrow"].forEach(function(k){ var x=sp[k]; if(!x) return; var v=x.v==="walk"?D.speed:(D.cf&&D.cf.speed0.length?0:exSpd(num(x.v,0))); rows+='<div class="sense"><span class="bonus">'+v+'</span><span>'+{fly:"Fly",swim:"Swim",climb:"Climb",burrow:"Burrow"}[k]+', ft<small class="muted"> '+esc(x.s||"")+'</small></span></div>'; });
    if(!["fly","swim","climb","burrow"].some(function(k){return sp[k]})) rows+='<p class="muted dnone">No other speeds</p>'; e.innerHTML=rows; }
  var f=document.getElementById("defs"); if(f){ var L=(C.defenses||[]).concat(D.cf?D.cf.res:[]),/* v22 */ g=function(t){ return L.filter(function(d){return d.t===t}); };
    var sec=function(t,lbl,none){ var x=g(t); return '<h3 class="defh">'+lbl+'</h3>'+(x.length?x.map(function(d){return '<div class="defl"><b>'+esc(d.v)+'</b><small>'+esc(d.s)+'</small></div>'}).join(""):'<p class="muted dnone">'+none+'</p>'); };
    var oth=L.filter(function(d){return ["Resistance","Immunity","Vulnerability"].indexOf(d.t)<0});
    f.innerHTML=sec("Resistance","Resistances","No Resistances")+sec("Immunity","Immunities","No Immunities")+sec("Vulnerability","Vulnerabilities","No Vulnerabilities")+(oth.length?'<h3 class="defh">Other</h3>'+oth.map(function(d){return '<div class="defl"><b>'+esc(d.t)+'</b> '+esc(d.v)+'<small>'+esc(d.s)+'</small></div>'}).join(""):""); } }
/* RU35 no. 6: notes under Saving Throws */
function saveNotesH(){ var n=(C.saveNotes||[]), b=(C.saveBonus||[]); if(!n.length&&!b.length) return ""; return '<div class="snotes">'+b.map(function(x){return '<p><b>'+sg(num(x.v))+'</b> to all saving throws <small>'+esc(x.s)+'</small></p>'}).join("")+n.map(function(x){return '<p>'+esc(x.t)+' <small>'+esc(x.s)+'</small></p>'}).join("")+'</div>'; }
/* RU35 no. 8: containers. An item with "in" sits inside that container item. A magic container (CONTAINERS[2] set) has a fixed weight, its contents do not count */
function ctOf(n){ var b=String(n||"").replace(/ \(.*\)$/,""); return (typeof CONTAINERS!=="undefined"?CONTAINERS:[]).filter(function(c){ return c[0]===n||c[0]===b; })[0]||null; }
function invKey(i){ return i.key||i.n; }
/* v32 RU134: occurrence of an item among the items with the same key (0 = first), for the builder hooks */
function occOf(it){ var L=C.inv||[], k=it&&invKey(it), n=0; for(var i=0;i<L.length&&L[i]!==it;i++) if(invKey(L[i])===k) n++; return n; }
function packOf(it){ return typeof PACKS==="undefined"||!it?"":PACKS[it.n]?it.n:it.key&&PACKS[it.key]?it.key:""; }
function gearOf(n){ return (typeof GEAR!=="undefined"?GEAR:[]).filter(function(g){ return g[0]===n; })[0]||null; }
/* a pack row of a hand-filled sheet opens into its container and items, in its place (weight and price from the data) */
function unpackC(it){ var pn=packOf(it), L=C.inv||[], i=L.indexOf(it); if(!pn||i<0) return 0; var P=PACKS[pn], q=Math.max(0,Math.floor(num(it.q,1))), out=[];
  for(var k=0;k<q;k++){ var nm=P[0]+" ("+pn+")", c2=2; while(L.concat(out).some(function(y){ return invKey(y)===nm; })) nm=P[0]+" ("+pn+" "+(c2++)+")";
    var g0=gearOf(P[0]), ct={n:nm,q:1,w:g0?g0[2]:0}; if(g0) ct.cost=g0[1]; if(it.in) ct.in=it.in; out.push(ct);
    P[1].forEach(function(x){ var g=gearOf(x[0]), o={n:x[0],q:x[1],w:g?g[2]:0,in:nm}; if(g) o.cost=g[1]; out.push(o); }); }
  L.splice.apply(L,[i,1].concat(out)); C.inv=L; return out.length; }
function packH(it,ix){ var pn=packOf(it); if(!pn) return ""; var P=PACKS[pn], q=num(it.q,1);
  return '<div class="info-h">Unpack</div>'+(q>0?'<p class="info-d">Turns this row into the '+esc(P[0])+' and its '+P[1].length+' kinds of items, each with its own Qty, so you can count torches, rations, and oil as you use them.</p><div class="ipk"><button type="button" class="btn pri press" data-unpack="'+esc(invKey(it))+'" data-iix="'+ix+'">'+ico("item-container")+'Unpack</button></div>':'<p class="muted">Qty is 0, so there is nothing to unpack.</p>'); }
/* a container made from a pack holds what the book puts in it (a Backpack of 30 lb holds the 50 lb of an Explorer's Pack); more than that is over */
function ctCap(c,ct){ var m=/\(([^()]+'s Pack)(?: \d+)?\)$/.exec(c&&c.n||""), P=m&&typeof PACKS!=="undefined"&&PACKS[m[1]]; if(!P||!ct[1]) return ct[1];
  return Math.max(ct[1], P[1].reduce(function(t,x){ var g=gearOf(x[0]); return t+(g?g[2]:0)*x[1]; },0)); }
/* a container popup lists what is inside; each line opens that item */
function ctH(it,ix){ if(!ctOf(it.n)) return ""; var k=invKey(it), L=(C.inv||[]).map(function(x,i){ return [x,i]; }).filter(function(p){ return p[0]!==it&&p[0].in===k; });
  return '<div class="info-h">Inside ('+L.length+')</div>'+(L.length?'<div class="info-l">'+L.map(function(p){ var q=num(p[0].q,1); return '<button type="button" data-info="it:'+p[1]+'">'+esc(cuNm("i:"+invKey(p[0]),p[0].n))+'<span>Qty '+q+' • '+fmtW(q*cuW(p[0]))+' lb.</span></button>'; }).join("")+'</div>':'<p class="muted">Empty. Open an item and use Move to put it here.</p>'); }
var ctShut={};
var CONS1=/^(Torch|Candle|Rations \(1 day\)|Oil \(flask\))$/;
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-unpack]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  var nm=b.getAttribute("data-unpack"), it=invAt(nm,b.getAttribute("data-iix")); if(!it) return; var occ=occOf(it), pn=packOf(it), lbl=it.n;
  if(num(it.q,1)<1){ toast("Qty is 0, so there is nothing to unpack."); return; }
  var done1=function(n){ if(typeof closeSheet==="function") closeSheet(); renderAll(); if(typeof setTab==="function") setTab("p-inv"); toastU(n?"Unpacked "+lbl+": a "+PACKS[pn][0]+" and "+PACKS[pn][1].length+" kinds of items.":"Nothing to unpack."); };
  if(viaBld(nm)&&window.__bldUnpack){ bldGuard(function(){ undoMark("Unpack "+lbl); var ok=window.__bldUnpack(nm,C.name,occ,true); done1(ok?1:0); }); return; }
  undoMark("Unpack "+lbl); var n=unpackC(it); try{ if(window.__bldUnpack) window.__bldUnpack(nm,C.name,occ,false); }catch(er){} saveC(); done1(n); },true);
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-use1]"); if(!b) return; e.preventDefault(); e.stopPropagation(); var nm=b.getAttribute("data-potn"), ix=+b.getAttribute("data-use1"), it=invAt(nm,ix); if(!it) return;
  var left=Math.max(0,num(it.q,1)-1), lb=it.n; if(num(it.q,1)<1){ toast("None left."); return; } qtyAdj(nm,ix,-1,"Use "+lb,function(){ toastU("Used 1 "+lb+". "+left+" left."); }); },true);
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#invBody [data-ctog]"); if(!b) return; var k=b.getAttribute("data-ctog"); ctShut[k]=!ctShut[k]; renderInv();
  var nb=Array.prototype.slice.call(document.querySelectorAll("#invBody [data-ctog]")).filter(function(x){ return x.getAttribute("data-ctog")===k; })[0]; if(nb) nb.focus({preventScroll:true}); });

function itemW(i){ var c=ctOf(i.n); if(c&&c[2]!=null) return c[2]*num(i.q,1); return num(i.q,1)*cuW(i); }
function invWeight(){ var L=C.inv||[], byK={}; L.forEach(function(i){ byK[invKey(i)]=i; }); return L.reduce(function(t,i){ var p=i.in&&byK[i.in], pc=p&&ctOf(p.n); if(pc&&pc[2]!=null) return t; return t+itemW(i); },0); }
function ctLoad(c){ return (C.inv||[]).filter(function(i){ return i.in===invKey(c); }).reduce(function(t,i){ return t+num(i.q,1)*cuW(i); },0); }
function moveCtl(it,ix){ var cs=(C.inv||[]).filter(function(c){ return c!==it&&ctOf(c.n)&&c.in!==invKey(it); }); if(!cs.length&&!it.in) return "";
  return '<div class="imv"><label class="muted" for="imove">Move to</label><select id="imove" data-imove="'+ix+'"><option value="">Equipment (not in a container)</option>'+cs.map(function(c){ return '<option value="'+esc(invKey(c))+'"'+(it.in===invKey(c)?' selected':'')+'>'+esc(c.n)+'</option>'; }).join("")+'</select></div>'; }
var XDIM=/^(Bag of Holding|Heward's Handy Haversack|Portable Hole)\b/;
document.addEventListener("change",function(e){ var t=e.target; if(!t.matches||!t.matches("[data-imove]")) return; var it=(C.inv||[])[+t.getAttribute("data-imove")]; if(!it) return;
  var dst=t.value?(C.inv||[]).filter(function(c){ return invKey(c)===t.value; })[0]:null;
  if(dst&&XDIM.test(it.n)&&XDIM.test(dst.n)){ var tv=t.value, lbl=t.options[t.selectedIndex].text; t.value=it.in||""; ask("If "+it.n+" goes inside "+dst.n+", both are torn apart and a rift to the Astral Plane opens. Move it anyway?","Move", function(){ it.in=tv; bldSync(invKey(it),{in:tv,occ:occOf(it)}); saveC(); renderAll(); refreshEntry(); toast("Moved to "+lbl+"."); }); return; }
  if(t.value) it.in=t.value; else delete it.in; bldSync(invKey(it),{in:t.value||"",occ:occOf(it)}); saveC(); renderAll(); refreshEntry(); toast(t.value?"Moved to "+t.options[t.selectedIndex].text+".":"Moved out of the container.");
  if(t.value){ var ix0=t.getAttribute("data-imove"); setTimeout(function(){ var b=document.querySelector('.ichk.on[data-iix="'+ix0+'"]'); if(b) b.click(); },0); }/* v32 p24 */ });
/* RU37: coins. S.coins {pp,gp,ep,sp,cp} is game state (kept by Apply). C.gp is the builder's starting gold: a change of C.gp is added to gp (S.coinBase) */
var COINS=[["pp","Platinum",10,"1 pp = 10 gp"],["gp","Gold",1,""],["ep","Electrum",0.5,"1 gp = 2 ep"],["sp","Silver",0.1,"1 gp = 10 sp"],["cp","Copper",0.01,"1 gp = 100 cp"]];
function coinsNow(){ var g=num(C.gp,0); if(!S.coins) return {pp:0,gp:g,ep:0,sp:0,cp:0}; var c={}; COINS.forEach(function(k){ c[k[0]]=num(S.coins[k[0]],0); }); c.gp=Math.max(0,c.gp+g-num(S.coinBase,g)); return c; }
/* v31 RU123: the five coins, each with its icon and amount (copper to platinum), total in GP as a note. One button opens Manage Coin */
function coinStrip(c){ var o=[["cp","Copper"],["sp","Silver"],["ep","Electrum"],["gp","Gold"],["pp","Platinum"]], t=coinTotal(c);
  return '<button type="button" class="igp icoins" data-coinopen="1" aria-label="Manage Coin: '+o.map(function(k){ return fmtN(num(c[k[0]],0))+' '+k[1]; }).join(', ')+', '+t+' GP in all">'+o.map(function(k){ return '<span class="icn ic-'+k[0]+'">'+ico("coin-"+k[0],"icn-i")+'<b>'+fmtN(num(c[k[0]],0))+'</b><small>'+k[0].toUpperCase()+'</small></span>'; }).join("")+'<span class="itot">'+t+' GP in all</span></button>'; }
function coinTotal(c){ return Math.round(COINS.reduce(function(t,k){ return t+c[k[0]]*k[2]; },0)*100)/100; }
function coinSet(c){ S.coins=c; S.coinBase=num(C.gp,0); save(); }
/* T4: convert one coin into another, and pay a price with change. Values in copper: cp 1, sp 10, ep 50, gp 100, pp 1000 */
var CVAL={cp:1,sp:10,ep:50,gp:100,pp:1000}, CORD=["cp","sp","ep","gp","pp"];
function coinCp(c){ return CORD.reduce(function(t,k){ return t+num(c[k],0)*CVAL[k]; },0); }
function coinList(o){ var a=[]; ["pp","gp","ep","sp","cp"].forEach(function(k){ if(o[k]>0) a.push(fmtN(o[k])+" "+k); }); return a.join(", "); }
/* price in gold (may be a fraction) shown in the largest coin that keeps it whole */
function priceTxt(gp){ var cp=Math.round(gp*100); if(cp%100===0) return fmtN(cp/100)+" gp"; if(cp%10===0) return fmtN(cp/10)+" sp"; return fmtN(cp)+" cp"; }
/* pay price (in copper) from coins c. Spends the smallest coins first. When a big coin has to be broken, change comes back in gp, sp and cp. Returns null when there is not enough */
function coinPay(c,price){ price=Math.round(price); if(coinCp(c)<price) return null; var n={}, use={pp:0,gp:0,ep:0,sp:0,cp:0}, chg={pp:0,gp:0,ep:0,sp:0,cp:0}, left=price;
  CORD.forEach(function(k){ n[k]=num(c[k],0); });
  CORD.forEach(function(k){ var t=Math.min(n[k],Math.floor(left/CVAL[k])); use[k]+=t; n[k]-=t; left-=t*CVAL[k]; });
  if(left>0){ var b=CORD.filter(function(k){ return n[k]>0&&CVAL[k]>=left; })[0]; if(!b) return null; n[b]--; use[b]++; var ch=CVAL[b]-left; left=0;
    ["gp","sp","cp"].forEach(function(k){ var t=Math.floor(ch/CVAL[k]); chg[k]=t; n[k]+=t; ch-=t*CVAL[k]; }); }
  return {c:n,use:use,chg:chg}; }
/* convert amt coins of type from into type to. A remainder that does not fill a whole coin of the new type stays as the old coin */
function coinConv(c,from,to,amt){ amt=Math.floor(amt); if(from===to||amt<1) return {err:"Choose two different coins and an amount."}; if(amt>num(c[from],0)) return {err:"You only have "+fmtN(num(c[from],0))+" "+from+"."};
  var val=amt*CVAL[from], cnt=Math.floor(val/CVAL[to]); if(cnt<1) return {err:amt+" "+from+" is worth less than one "+to+"."}; var rem=val-cnt*CVAL[to], back=Math.round(rem/CVAL[from]), n=Object.assign({},c);
  n[from]=num(c[from],0)-amt+back; n[to]=num(c[to],0)+cnt; return {c:n,got:cnt,used:amt-back}; }
var coinOpen=false;
function coinHTML(){ var c=coinsNow(), ls=S.lifestyle||"", L=(typeof LIFESTYLE!=="undefined"?LIFESTYLE:[]), lo=L.filter(function(x){return x[0]===ls})[0];
  return '<div id="coinDlg"><button type="button" class="ctot" data-coin="tog" aria-expanded="'+coinOpen+'"><b>Total (in gp)</b><span>'+coinTotal(c)+'</span>'+CHEV+'</button>'+(coinOpen?'<p class="muted">Every coin converted to gold. Electrum, silver, and copper count as fractions of a gold piece.</p>':'')+
   '<div class="crows">'+COINS.map(function(k){ return '<div class="crow"><span class="cico c-'+k[0]+'"></span><span class="cnm"><b>'+k[1]+' ('+k[0]+')</b><small>'+k[3]+'</small></span><span class="cv" id="cv-'+k[0]+'">'+c[k[0]]+'</span></div>'; }).join("")+'</div>'+
   '<div class="info-h">Adjust Coin</div><div class="cadj">'+COINS.map(function(k){ return '<label><span>'+k[0].toUpperCase()+'</span><input type="number" min="0" inputmode="numeric" data-camt="'+k[0]+'" placeholder="0"></label>'; }).join("")+'</div>'+
   '<div class="info-h">Convert Coin</div><div class="cconv"><label><span>From</span><select data-cvf aria-label="Convert from">'+CORD.slice().reverse().map(function(k){ return '<option value="'+k+'"'+(k==="gp"?' selected':'')+'>'+k.toUpperCase()+'</option>'; }).join("")+'</select></label><label><span>To</span><select data-cvt aria-label="Convert to">'+CORD.slice().reverse().map(function(k){ return '<option value="'+k+'"'+(k==="sp"?' selected':'')+'>'+k.toUpperCase()+'</option>'; }).join("")+'</select></label><label><span>Amount</span><input type="number" min="1" inputmode="numeric" data-cvamt placeholder="0" aria-label="Amount to convert"></label><button type="button" class="btn press" data-coin="conv">Convert</button></div><p class="muted" id="cvPrev" aria-live="polite"></p>'+
   '<div class="cbtns"><button type="button" class="btn press" data-coin="add">+ Add</button><button type="button" class="btn press" data-coin="rem">\u2212 Remove</button><button type="button" class="btn press" data-coin="clr">\u00d7 Clear</button></div>'+
   '<div class="info-h">Lifestyle Expenses</div><select data-life="1" aria-label="Lifestyle"><option value="">Choose a lifestyle</option>'+L.map(function(x){ return '<option value="'+x[0]+'"'+(x[0]===ls?' selected':'')+'>'+x[0]+' ('+x[1]+(x[1]==="Free"?'':' per day')+')</option>'; }).join("")+'</select>'+(lo?'<p class="info-d">'+esc(lo[2])+'</p>':'<p class="muted">Pick the lifestyle you pay for each week or month. It covers lodging, food, and upkeep.</p>')+'</div>'; }
function openCoins(){ navStack=[]; openSheet("Manage Coin", coinHTML(), "coin"); }
function coinRefresh(){ var b=$("#sheetBody"); if(b&&sheetMode==="coin") b.innerHTML=coinHTML(); renderInv(); }
document.addEventListener("input",function(e){ var t=e.target; if(!t||!t.matches||!t.matches("[data-cvamt],[data-cvf],[data-cvt]")) return; var p=$("#cvPrev"); if(!p) return; var f=$("#coinDlg [data-cvf]").value, to=$("#coinDlg [data-cvt]").value, am=num($("#coinDlg [data-cvamt]").value,0), r=am>0?coinConv(coinsNow(),f,to,am):null;
  p.textContent=!r?"":r.err?r.err:fmtN(r.used)+" "+f+" becomes "+fmtN(r.got)+" "+to+"."+(r.used<Math.floor(am)?" The other "+fmtN(Math.floor(am)-r.used)+" "+f+" stay as they are.":""); });
document.addEventListener("click",function(e){ var b=e.target.closest("[data-coin],[data-coinopen]"); if(!b) return;
  if(b.hasAttribute("data-coinopen")){ openCoins(); return; }
  var a=b.getAttribute("data-coin"); if(a==="tog"){ coinOpen=!coinOpen; coinRefresh(); return; }
  if(a==="conv"){ var c0=coinsNow(), cf=$("#coinDlg [data-cvf]").value, ct=$("#coinDlg [data-cvt]").value, r0=coinConv(c0,cf,ct,num($("#coinDlg [data-cvamt]").value,0)); if(r0.err){ toast(r0.err); return; }
    undoMark("Convert coins"); coinSet(r0.c); coinRefresh(); toastU("Converted "+fmtN(r0.used)+" "+cf+" into "+fmtN(r0.got)+" "+ct+"."); return; }
  var c=coinsNow(), amt={}, any=false; $$("#coinDlg [data-camt]").forEach(function(i){ var v=Math.floor(num(i.value,0)); amt[i.getAttribute("data-camt")]=v>0?v:0; if(v>0) any=true; });
  if(a==="clr"){ $$("#coinDlg [data-camt]").forEach(function(i){ i.value=""; }); return; }
  if(!any){ toast("Type an amount first."); return; }
  if(a==="rem"){ var short=COINS.filter(function(k){ return amt[k[0]]>c[k[0]]; }); if(short.length){ toast("Not enough "+short.map(function(k){return k[1].toLowerCase()}).join(" and ")+". Nothing was removed."); return; } }
  undoMark(a==="add"?"Add coins":"Remove coins"); COINS.forEach(function(k){ c[k[0]]+= (a==="add"?1:-1)*amt[k[0]]; }); coinSet(c); coinRefresh(); toastU(a==="add"?"Coins added.":"Coins removed."); });
document.addEventListener("change",function(e){ var t=e.target; if(t.matches&&t.matches("[data-life]")){ S.lifestyle=t.value; save(); coinRefresh(); } });
/* RU41: rest dialogs like D&D Beyond. Hit Dice: a box per die left. Each picked box asks for the number rolled (no dice rolling in the app) */
var restSel={}, restAuto=true;
function hdRows(){ return (D.res||[]).filter(function(r){ return r.k==="hd"||/^hd-d/.test(r.k); }); }
function shortList(){ return (D.res||[]).filter(function(r){ return r.reset==="short"||r.reset==="short1"; }); }
function restHTML(kind){ var hp1=S.hp!=null&&S.hp<1, h='<div id="restDlg" data-kind="'+kind+'">';
  if(kind==="menu") return h+restCards()+'</div>';/* v32 p25 C15 */
  if(kind==="short"){ var cm=D.mod.CON, tot=0; h+=restHint();/* v32 p25 */
    h+=x14()?'<p class="info-d">A Short Rest lasts at least 1 hour. You do nothing more strenuous than eating, drinking, reading, or tending wounds. At the end you can spend any number of your Hit Dice to heal, one at a time, and some features recharge.</p>':'<p class="info-d">A Short Rest is 1 hour of downtime with nothing more tiring than talking, eating, reading, or keeping watch. It ends early, with no benefit, if you roll Initiative, cast any spell except a cantrip, or take damage. You can spend Hit Point Dice to heal, one at a time, and some features recharge.</p>';
    var rl=shortList(); h+='<div class="info-h">Recover</div>'+(rl.length?recUL(rl.map(function(r){ var u=used(r.k,r.max); return [r.n+(r.reset==="short1"?" (one use)":"")+(u?"":" (already full)"),!u]; })):'<p class="info-d">No features recharge on a Short Rest.</p>');
    h+='<label class="ck"><input type="checkbox" data-rauto="1"'+(restAuto?' checked':'')+'> Automatically apply healing</label>';
    hdRows().forEach(function(r){ var die=num(r.die,num(C.hitDie,10)), left=r.max-used(r.k,r.max), sel=restSel[r.k]||[];
      h+='<div class="hdrow"><b>'+(hdRows().length<2?esc((C.cls||"").toUpperCase())+' ':'D'+die+' ')+'HIT DICE</b>'+(hdRows().length>1&&hdCls(die)?' <span class="muted">('+esc(hdCls(die))+')</span>':'')+' <span class="muted">(Hit Die: 1d'+die+sg(cm)+' \u2022 Total: '+r.max+', left: '+left+')</span><div class="boxes">';
      for(var i=0;i<left;i++){ var on=sel[i]!=null; h+='<button type="button" class="bx" aria-pressed="'+on+'" data-hdk="'+r.k+'" data-hdi="'+i+'" aria-label="Spend Hit Die '+(i+1)+'"></button>'; }
      h+='</div>'+(left?'':'<p class="muted">No Hit Dice left. A Long Rest restores '+(x14()?'half of them, at least one':'them')+'.</p>');
      sel.forEach(function(v,i){ if(v==null) return; var heal=v?hdHeal(v):0; tot+=heal; h+='<label class="hdv">Die '+(i+1)+' (1 to '+die+')<input type="number" min="1" max="'+die+'" data-hdv="'+r.k+'" data-hdi="'+i+'" value="'+(v||"")+'" placeholder="roll"><span class="hdh">'+(v?'+'+heal+' '+hpW(heal):'type the number rolled')+'</span></label>'; });
      h+='</div>'; });
    h+=shortExtraH();/* v21 */
    h+='<p class="info-d"><b id="restTot">Healing: '+tot+' '+hpW(tot)+'</b> (each die: the number rolled plus your Constitution modifier, at least 1'+(periOn()?', then doubled':'')+')</p>';
    if(hp1) h+='<p class="caution">You need at least 1 Hit Point to take a Short Rest.</p>';
    return h+slideC("short","Slide to take Short Rest",hp1)+'</div>'; }
  var rec=longRec();/* v32 p25: the same list as the Long Rest card */
  h+=(x14()?'<p class="info-d">A Long Rest lasts at least 8 hours. You sleep and do light activity, with no more than 2 hours awake. One hour of fighting, casting spells, or walking breaks the rest, and you must start it again to gain anything. You can gain the benefit of only one Long Rest in 24 hours, and you need at least 1 Hit Point when you start. You regain all Hit Points and up to half of your total Hit Dice, at least one. If you had food and drink, you also lose 1 level of Exhaustion.</p>':'<p class="info-d">A Long Rest takes at least 8 hours: at least 6 asleep and no more than 2 of light activity. It ends early if you roll Initiative, cast any spell except a cantrip, take damage, or spend 1 hour walking or exerting yourself. If you had rested for at least 1 hour, an early end still counts as a Short Rest. You can resume right away by adding 1 hour to the rest. After a Long Rest, wait 16 hours before starting another.</p>')+'<div class="info-h">Recover</div>'+(rec.length?recUL(rec):'<p class="info-d">Everything is already full.</p>');
  h+=longExtraH();/* v21 */
  if(hp1) h+='<p class="caution">You need at least 1 Hit Point to take a Long Rest.</p>';
  return h+slideC("long","Slide to take Long Rest",hp1)+'</div>'; }
/* v55: slide-to-confirm control for the rests (the handler sits next to the PDF button code) */
function slideC(kind,txt,off){ return '<div class="slidec'+(off?' off':'')+'" data-slide-go="'+kind+'" data-label="'+txt+'"><div class="slidec-fill"></div><div class="slidec-label">'+txt+'</div><button type="button" class="slidec-h" aria-label="'+txt+'. Press Enter to confirm"'+(off?' disabled':'')+'><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>'; }
/* ===== v32 p25 (C15, RU132): rest cards, hint, and the summary after a rest ===== */
function longRec(){ var sl=(D.res||[]).filter(function(r){return /^s\d$/.test(r.k)||r.k==="pact"}).reduce(function(t,r){return t+used(r.k,r.max)},0), hdu=hdRows().reduce(function(t,r){return t+used(r.k,r.max)},0),
      oth=(D.res||[]).filter(function(r){ return r.reset!=="none"&&!/^s\d$|^pact$|^hd/.test(r.k)&&used(r.k,r.max)>0; }).map(function(r){return r.n});
  var hpTo=D.hpmax; if(restX.hpReset&&(num(S.hpMod,0)||num(S.hpOver,0)>0)) hpTo=Math.max(1,(B.hp&&B.hp.parts||[]).filter(function(p){ return p.l!=="Max HP modifier"&&p.l!=="Set by you"; }).reduce(function(t,p){ return t+num(p.v,0); },0));/* v21 i2 */
  var rec=[]; if(S.hp==null||S.hp<hpTo) rec.push("Hit Points to "+hpTo); if(x14()) hdu=hdPlan()._n; if(hdu) rec.push(hdu+" Hit "+(hdu>1?"Dice":"Die")); if(sl) rec.push(sl+" Spell Slot"+(sl>1?"s":"")); rec=rec.concat(oth); if(hasFeat("Resourceful")&&!S.insp) rec.push("Heroic Inspiration (Resourceful)"); if(S.exh>0) rec.push("Exhaustion level reduced by 1"); if(S.ds&&(S.ds[0]||S.ds[1])) rec.push("Death Saving Throws reset"); if(S.tmp) rec.push("Temporary Hit Points end");
  return rec; }
function hdLeft(){ return hdRows().reduce(function(t,r){ return t+Math.max(0,r.max-used(r.k,r.max)); },0); }
function shortRec(){ var o=[], miss=Math.max(0,D.hpmax-num(S.hp==null?D.hpmax:S.hp,0)), hl=hdLeft();
  if(miss&&hl) o.push("Spend up to "+hl+" Hit "+(hl>1?"Dice":"Die")+" to heal ("+miss+" "+hpW(miss)+" missing)"); else if(!hl) o.push(["No Hit Dice left to spend",1]); else o.push(["Hit Points are full",1]);
  shortList().forEach(function(r){ if(used(r.k,r.max)) o.push(r.n+(r.reset==="short1"?" (one use)":"")); });
  if(o.length===1&&typeof o[0]!=="string"&&!shortList().some(function(r){ return used(r.k,r.max); })) o.push(["No uses to get back",1]);
  return o; }
function recUL(L){ return '<div class="rlist" role="list">'+L.map(function(x){ var off=Array.isArray(x)&&x[1], t=Array.isArray(x)?x[0]:x; return '<span class="rli'+(off?' off':'')+'" role="listitem">'+ico(off?"ui-minus":"ui-check","rli-i")+'<span>'+esc(t)+'</span></span>'; }).join("")+'</div>'; }
function restCards(){ var z=S.hp!=null&&S.hp<1, card=function(k,t,d,L){ return '<button type="button" class="restm rcard press" data-rest="'+k+'"><span class="rc-h"><span class="rc-i">'+ico(k==="short"?"rest-short":"rest-long")+'</span><span class="rc-t"><b>'+t+'</b><small>'+d+'</small></span>'+ico("ui-chev-r","rc-go")+'</span>'+recUL(L)+'</button>'; };
  return (z?'<p class="caution">You need at least 1 Hit Point to rest. Heal first, or make Death Saving Throws.</p>':'')+'<div class="rcards">'+card("short","Short Rest","1 hour",shortRec())+card("long","Long Rest","8 hours",longRec().length?longRec():[["Everything is already full",1]])+'</div>'; }
function restHint(){ var hp=num(S.hp==null?D.hpmax:S.hp,0), miss=Math.max(0,D.hpmax-hp), hl=hdLeft(); if(hp<1) return "";
  var t=miss&&hl?"You are missing "+miss+" "+hpW(miss)+". You have "+hl+" Hit "+(hl>1?"Dice":"Die")+" left: tap a box below to spend one, then type the number rolled.":miss?"You are missing "+miss+" "+hpW(miss)+", but no Hit Dice are left. A Long Rest restores "+(x14()?"half of them, at least one":"them")+".":"Your Hit Points are full, so you do not need to spend Hit Dice.";
  return '<p class="rhint">'+ico("ui-info","rh-i")+'<span>'+esc(t)+'</span></p>'; }
var RS0=null, REST_SUM=null;
function restSnap(){ return {hp:S.hp==null?D.hpmax:S.hp, tmp:num(S.tmp,0), used:JSON.parse(JSON.stringify(S.used||{})), exh:num(S.exh,0), insp:!!S.insp, ds:(S.ds||[0,0]).slice(), mode:Object.keys(S.mode||{})}; }
function restDiff(a){ var o=[], hp=S.hp==null?D.hpmax:S.hp, MODE={rage:"Rage",sacred:"Sacred Weapon",wings:"Celestial wings",radiance:"Celestial radiance",shroud:"Celestial shroud",wild:"Wild Shape"};
  if(hp!==a.hp) o.push(["Hit Points",a.hp+" to "+hp]); if(a.tmp&&!num(S.tmp,0)) o.push(["Temporary Hit Points",a.tmp+" to 0"]);
  (D.res||[]).forEach(function(r){ var u0=Math.min(r.max,num(a.used[r.k],0)), u1=used(r.k,r.max); if(u0===u1) return; var n=/^s(\d)$/.exec(r.k)?"Level "+r.k.slice(1)+" Spell Slots":r.k==="pact"?"Pact Magic slots":r.n;
    o.push([n,(r.max-u0)+" to "+(r.max-u1)+" of "+r.max+" left"]); });
  if(a.exh!==num(S.exh,0)) o.push(["Exhaustion","level "+a.exh+" to "+num(S.exh,0)]); if(!a.insp&&S.insp) o.push(["Heroic Inspiration","gained"]);
  if((a.ds[0]||a.ds[1])&&!(S.ds&&(S.ds[0]||S.ds[1]))) o.push(["Death Saving Throws","reset"]);
  a.mode.forEach(function(k){ if(!(S.mode&&S.mode[k])) o.push([MODE[k]||k,"ended"]); });
  return o; }
function restSumToast(kind){ if(!RS0) return; var L=restDiff(RS0); REST_SUM={k:kind,L:L}; RS0=null; var t=$("#toast"); if(!t||!t.classList.contains("on")) return;
  var b=document.createElement("button"); b.type="button"; b.className="tsum"; b.setAttribute("data-restsum","1"); b.innerHTML=ico("ui-info")+"Details"; t.appendChild(b); }
function restSumHTML(){ var s=REST_SUM; if(!s) return '<p class="info-d">No rest taken yet.</p>';
  return '<div id="restSum"><p class="info-d">'+(s.L.length?'What changed when you finished the '+(s.k==="short"?"Short":"Long")+' Rest:':'Nothing changed. Everything was already full.')+'</p>'+(s.L.length?'<div class="rsum">'+s.L.map(function(x){ return '<div class="rsr">'+ico("ui-check","rli-i")+'<b>'+esc(x[0])+'</b><span>'+esc(x[1])+'</span></div>'; }).join("")+'</div>':'')+'<p class="muted">Undo in the message that appeared after the rest puts everything back.</p></div>'; }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-restsum]"); if(!b) return; e.preventDefault(); navStack=[]; openSheet((REST_SUM&&REST_SUM.k==="long"?"Long":"Short")+" Rest Summary",restSumHTML(),"restsum"); });
function restNames(L){ var n=L.filter(function(x){ return x[0]!=="Hit Points"&&!/^Hit Dice|^Hit Point Dice/.test(x[0]); }).map(function(x){ return x[0]; }); return n.length>4?n.slice(0,3).join(", ")+", and "+(n.length-3)+" more":n.join(", "); }
var CAMP="M12 3c1 3 4 4 4 7a4 4 0 0 1-8 0c0-2 1.5-3 1.5-4.5C11 7 11.5 8.5 12 9c.5-2 0-4 0-6zM4 20l16-4M4 16l16 4", MOON="M12 3a7.5 7.5 0 1 0 9 9A9 9 0 1 1 12 3z";
function openRest(kind){ restSel={}; restX={}; navStack=[]; openSheet(kind==="menu"?"Rest":kind==="short"?"Short Rest":"Long Rest", restHTML(kind), "rest"); }
function restRefresh(kind){ var b=$("#sheetBody"); if(b&&sheetMode==="rest") b.innerHTML=restHTML(kind); }
document.addEventListener("click",function(e){ var t=e.target, dlg=t.closest&&t.closest("#restDlg"); if(!dlg) return; var kind=dlg.getAttribute("data-kind");
  var bx=t.closest("[data-hdk]"); if(bx){ e.stopPropagation(); var k=bx.getAttribute("data-hdk"), i=+bx.getAttribute("data-hdi"), s=restSel[k]||(restSel[k]=[]); if(s[i]!=null) s[i]=null; else s[i]=0; restRefresh(kind); return; }
  var go=t.closest("[data-rest-go]"); if(go){ e.stopPropagation(); takeRest(go.getAttribute("data-rest-go")); return; } },true);
document.addEventListener("change",function(e){ var t=e.target; if(t.matches&&t.matches("[data-rauto]")){ restAuto=t.checked; return; } });
/* V17-3: a typed die value updates its line and the total in place. The dialog is not rebuilt, so focus and the next click stay */
document.addEventListener("input",function(e){ var t=e.target; if(!t.matches||!t.matches("#restDlg [data-hdv]")) return; var k=t.getAttribute("data-hdv"), i=+t.getAttribute("data-hdi"), r=hdRows().filter(function(q){return q.k===k})[0], die=r?num(r.die,num(C.hitDie,10)):12, v=Math.floor(num(t.value,0)), cm=D.mod.CON;
  v=v>=1?Math.min(die,v):0; (restSel[k]||(restSel[k]=[]))[i]=v; var sp=t.parentNode.querySelector(".hdh"); if(sp) sp.textContent=v?"+"+hdHeal(v)+" "+hpW(hdHeal(v)):"type the number rolled";
  var tot=0; Object.keys(restSel).forEach(function(q){ (restSel[q]||[]).forEach(function(x){ if(x) tot+=hdHeal(x); }); }); var te=document.getElementById("restTot"); if(te) te.textContent="Healing: "+tot+" "+hpW(tot); });
function hpW(n){ return n===1?"Hit Point":"Hit Points"; }
function hdCls(die){ return (String(C.clsLabel||"").match(/[A-Z][A-Za-z']+ \d+/g)||[]).filter(function(x){ var c=(typeof CLASSES!=="undefined")&&CLASSES[x.replace(/ \d+$/,"")]; return c&&num(c.hd,0)===die; }).join(", "); }
function takeRest(kind){ if(S.hp!=null&&S.hp<1){ toast("You need at least 1 Hit Point to rest."); return; }
  if(kind==="short"){ var cm=D.mod.CON, heal=0, spent=0, miss=0; Object.keys(restSel).forEach(function(k){ (restSel[k]||[]).forEach(function(v){ if(v===0) miss++; }); });
    if(miss){ toast("Type the number rolled for each Hit Die you picked, or untick it."); return; }/* V17-2: nothing changes before this check */
    var picked=Object.keys(restSel).some(function(k){ return (restSel[k]||[]).some(function(v){ return v; }); }), chefV=restX.chef&&picked?Math.floor(num(restX.chefV,0)):0;
    if(restX.chef&&picked&&(chefV<1||chefV>8)){ toast("Type the 1d8 roll for Replenishing Meal, 1 to 8, or untick it."); return; }
    var rl=recList(), bad=rl.filter(function(q,i){ return recSum(i)>q.cap; })[0]; if(bad){ toast(bad.n+": choose slots with a combined level of "+bad.cap+" or less."); return; }
    var both={}; rl.forEach(function(q,i){ var m=restX.rec&&restX.rec[i]||{}; Object.keys(m).forEach(function(L){ both[L]=(both[L]||0)+num(m[L],0); }); }); var over=Object.keys(both).filter(function(L){ return both[L]>slotUsed(+L); })[0]; if(over){ toast("You chose more level "+over+" slots than you have spent."); return; }
    undoMark("Short Rest");/* v21 RU57 */ RS0=restSnap();/* v32 p25 */
    Object.keys(restSel).forEach(function(k){ (restSel[k]||[]).forEach(function(v){ if(!v) return; spent++; heal+=hdHeal(v); S.used[k]=num(S.used[k],0)+1; }); });
    if(chefV) heal+=chefV;
    var before=S.hp==null?D.hpmax:S.hp; if(restAuto&&heal) S.hp=Math.min(D.hpmax,before+heal);
    doRest("short",true); var rec=[]; rl.forEach(function(q,i){ var s=recSum(i); if(!s) return; var m=restX.rec[i]; Object.keys(m).forEach(function(L){ S.used["s"+L]=Math.max(0,num(S.used["s"+L],0)-num(m[L],0)); }); S.used[q.r.k]=num(S.used[q.r.k],0)+1; rec.push(q.n+": "+s+" slot level"+(s>1?"s":"")+" recovered."); });
    var nc=chgApply(shortChg()); save(); syncLU(); closeSheet();
    toastU("Short Rest taken."+(spent?" "+spent+" Hit "+(spent>1?"Dice":"Die")+" spent"+(restAuto?", "+(S.hp-before)+" "+hpW(S.hp-before)+" regained.":", "+heal+" "+hpW(heal)+" rolled (apply them yourself)."):" No Hit Dice spent.")+(rec.length?" "+rec.join(" "):"")+(nc?" Charges updated.":"")+(function(){ var n=restNames(restDiff(RS0)); return n?" Restored: "+n+".":""; })()); restSumToast("short"); return; }
  undoMark("Long Rest");/* v21 RU57 */ RS0=restSnap();/* v32 p25 */ var lc=chgRows(["dawn","dusk","long"]), hr=restX.hpReset&&(num(S.hpMod,0)||num(S.hpOver,0)>0);
  if(hr){ delete S.hpMod; delete S.hpOver; derive(); }
  doRest("long",true); var nc2=chgApply(lc); if(nc2){ save(); syncLU(); } closeSheet(); var LD=restDiff(RS0), ln=restNames(LD), hpx=LD.filter(function(x){ return x[0]==="Hit Points"; })[0];
  toastU("Long Rest taken."+(LD.length?" Restored: "+[hpx?"Hit Points ("+hpx[1]+")":""].concat(ln?[ln]:[]).filter(Boolean).join(", ")+".":" Everything was already full.")+(hr?" Maximum HP changes reset.":"")+(nc2?" Charges updated.":"")); restSumToast("long"); }
window.__openRest=openRest; window.__coinsNow=coinsNow;
/* v33 p03 (RU123 builder): the five coins the sheet shows after Apply when the starting gold is g (same data and rule as coinsNow) */
window.__coinsFor=function(g,mine){ g=num(g,0); if(!mine||!S.coins) return {pp:0,gp:g,ep:0,sp:0,cp:0}; var c={}; COINS.forEach(function(k){ c[k[0]]=num(S.coins[k[0]],0); }); c.gp=Math.max(0,c.gp+g-num(S.coinBase,g)); return c; };
window.__coinTotal=coinTotal; window.__ico=ico; window.__icoCls=icoCls; window.__icoItem=icoItem; window.__icoText=icoText;
function ordL(n){return n===0?"Cantrip":n+(n===1?"st":n===2?"nd":n===3?"rd":"th")+" Level"}
var spQ="",spF="all";
/* Spells tab header: Modifier, Spell Attack, Save DC, then slots. Numbers come from C.spellcasting (builder).
   M9: C.spellcasting.by (2+ abilities, multiclass or species): one header per source, and each spell uses the numbers of its ability (C.spells[].ab) */
/* v19 RL44: spell attack shown with Exhaustion */
function scAdj(sc){ if(!sc) return sc; var ex=D&&D.exhN?2*D.exhN:0, o={}; for(var k in sc) o[k]=sc[k]; if(ex) o.atk=num(sc.atk,0)-ex;
  var many=Array.isArray(sc.by)&&sc.by.length>1; if(Array.isArray(sc.by)) o.by=sc.by.map(function(b){ var c={}; for(var j in b) c[j]=b[j]; if(ex) c.atk=num(b.atk,0)-ex; return many?scCu(c,"-"+b.ab,ex):scCu(c,"",ex,1); });
  return scCu(o,"",ex); }
/* v34 RU85: Spell Attack and Save DC set by you (S.cust "n:spatk", "n:spdc", one pair per ability when 2+ sources), with a breakdown */
function scCu(o,sf,ex,quiet){ var ak="n:spatk"+sf, dk="n:spdc"+sf, a=cuK(ak), d=cuK(dk), av=a?cuNum(a.o):null, dv=d?cuNum(d.o):null, m=num(o.mod,0), pb=D&&D.pb||2, oth=num(o.atk,0)+ex-m-pb, odc=num(o.dc,0)-8-m-pb, src=sf&&o.n?" ("+o.n+")":"";
  var pa=[part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")], pd=[{l:"Base",v:8,note:"",raw:true},part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")];
  if(oth) pa.push(part("Other bonuses",oth,"Items or features")); if(ex) pa.push(part("Exhaustion level "+(ex/2),-ex,"Every D20 Test is 2 lower for each Exhaustion level")); if(odc) pd.push(part("Other bonuses",odc,"Items or features"));
  if(av!=null){ CU0[ak+"|o"]=o.atk; pa.push({l:"Set by you",v:sg(av),note:"Calculated value: "+sg(o.atk)+". Your number replaces it.",raw:true}); o.atk=av; }
  if(dv!=null){ CU0[dk+"|o"]=o.dc; pd.push({l:"Set by you",v:String(dv),note:"Calculated value: "+o.dc+". Your number replaces it.",raw:true}); o.dc=dv; }
  if(B&&!quiet){ B["spatk"+sf]={t:"Spell Attack"+src,parts:pa,total:sg(o.atk),f:""}; B["spdc"+sf]={t:"Spell Save DC"+src,parts:pd,total:String(o.dc),f:"A creature makes its saving throw against this number when your spell asks for one."}; }
  return o; }
/* v26 RU38 no. 2: a spell with its own save DC or spell attack (Customize) */
function scOf(x){ var r=scOf0(x), c=x&&cuK("s:"+x.n); if(c&&(cuNum(c.dc)!=null||cuNum(c.atk)!=null)){ r=Object.assign({},r); if(cuNum(c.dc)!=null) r.dc=cuNum(c.dc); if(cuNum(c.atk)!=null) r.atk=cuNum(c.atk); } return r; }
function scOf0(x){ var sc=scAdj(C.spellcasting||{}); if(x&&x.itc&&(x.itc.dc!=null||x.itc.atk!=null)){ sc=Object.assign({},sc); if(x.itc.dc!=null) sc.dc=x.itc.dc; if(x.itc.atk!=null) sc.atk=x.itc.atk; return sc; } if(x&&x.ab&&Array.isArray(sc.by)){ var b=sc.by.filter(function(q){return q.ab===x.ab})[0]; if(b) return b; } return sc; }
function spHeadBy(sc){ return sc.by.map(function(b){ var sf="-"+b.ab; return '<p class="sp-src">'+esc(b.n)+'</p><div class="sp-head"><div><b>'+sg(b.mod)+'</b><span>Modifier ('+b.ab+')</span></div><div class="bd" data-bd="spatk'+sf+'" role="button" tabindex="0"><b>'+sg(b.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc'+sf+'" role="button" tabindex="0"><b>'+b.dc+'</b><span>Save DC</span></div></div>'; }).join(""); }
function spHead(sc){sc=scAdj(sc);var h=Array.isArray(sc.by)&&sc.by.length>1?spHeadBy(sc):'<div class="sp-head"><div><b>'+sg(sc.mod)+'</b><span>Modifier ('+sc.ab+')</span></div><div class="bd" data-bd="spatk" role="button" tabindex="0"><b>'+sg(sc.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc" role="button" tabindex="0"><b>'+sc.dc+'</b><span>Save DC</span></div></div>';
 var sl=[];(sc.slots||[]).forEach(function(n,i){sl.push(ordL(i+1).replace(" Level","")+" \u00d7"+n)});if(sc.pact)sl.push("Pact \u00d7"+sc.pact.n+" (level "+sc.pact.lvl+")");if(sl.length)h+='<p class="sp-slots">Slots: '+sl.join(", ")+'. Tick the boxes at each spell level, or in Limited Use on the Actions tab.</p>';
 return h}
function renderSpells(){var el=document.getElementById("spBody");if(!el)return;var L=C.spells||[],sc=C.spellcasting;
 /* RU20: a caster with no spells chosen still sees Modifier, Spell Attack, Save DC and slots (C.spellcasting), then the note */
 var MB='<div class="spm-bar">'+(L.length?'<button type="button" class="btn press spm-open" data-spcards="1">Print Cards</button>':'')+'<button type="button" class="btn press spm-open" data-spman="1">'+ico("spellbook","ibt")+'Manage Spells</button></div>';/* v27 RU68 *//* v25 RU38 no. 3 */
 if(!L.length){el.innerHTML=(sc?spHead(sc):'')+'<div class="empty-note empty-st">'+ico("tab-spells","es-i")+'<b>No spells yet</b><span>'+(sc?'Add the cantrips and spells your class can cast. They show here with their slots.':'Spells from your class, species, feats, or magic items show up here.')+'</span><button type="button" class="btn pri press spm-open" data-spman="1">'+ico("tab-spells","ibt")+'Manage Spells</button></div>';return}/* v31 C5 */
 var h=(sc?spHead(sc):'')+MB;
 h+='<input class="sp-q" id="spQ" type="search" placeholder="Search Spell Names, Casting Times, Damage Types" value="'+esc(spQ)+'">';
 var lvs=[],UP=spUpOn(),UPX=spUpMax();L.forEach(function(x){var g=spGrpLv(x);if(lvs.indexOf(g)<0)lvs.push(g);if(UP&&spUpOk(x))for(var u=g+1;u<=UPX;u++)if(lvs.indexOf(u)<0)lvs.push(u)});lvs.sort(function(a,b){return a-b});/* v25 RU38 no. 6 */
 h+='<div class="ifil">'+[["all","All"]].concat(lvs.map(function(l){return [String(l),l?ordL(l).replace(" Level","").toUpperCase():"-0-"]})).concat([["conc","Conc."],["rit","Ritual"]]).map(function(f){return '<button type="button" class="ifb'+(spF===f[0]?' on':'')+'" data-spf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
 var q=spQ.toLowerCase(),lv=lvs.slice();
 lv.forEach(function(l){var rows=L.map(function(x,i){return [x,i]}).filter(function(p){var x=p[0];return (spGrpLv(x)===l||(UP&&spUpOk(x)&&l>spGrpLv(x)&&l<=UPX))&&(spF==="all"||spF===String(l)||(spF==="conc"&&x.conc)||(spF==="rit"&&x.rit))&&(!q||(x.n+" "+x.ct+" "+x.sum+" "+x.src).toLowerCase().indexOf(q)>=0)&&!(x.use==="Prepared"&&L.some(function(y){return y!==x&&y.n===x.n&&y.use==="Always prepared"}))/* v22 T1: sheets saved before v22 */}).sort(function(a,b){return a[0].n<b[0].n?-1:a[0].n>b[0].n?1:a[1]-b[1]});if(!rows.length)return;
  h+='<h3 class="sp-lv"><span>'+ordL(l)+'</span>'+spSlotsH(l,rows)+'</h3><div class="sp-tbl"><div class="sp-r sp-th"><span></span><span>Name</span><span>Time</span><span>Range</span><span>Hit / DC</span><span>Effect</span></div>'+rows.map(function(p){var x=p[0],xs=scOf(x),hd=x.sv==="ATK"?sg(xs.atk):x.sv?x.sv+" "+xs.dc:"\u2014";
   var badge=/At will|Cantrip/i.test(x.use)||!x.l?'<span class="sp-b" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">AT<br>WILL</span>':/1\/Long/.test(x.use)?'<span class="sp-b use" data-qcast="'+p[1]+'" title="Use '+esc(x.n)+'" aria-hidden="true">USE</span>':'<span class="sp-b cast" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">CAST</span>';
   return '<button type="button" class="sp-r" data-info="sp:'+p[1]+'"'+(x.sch?' data-sch="'+esc(x.sch)+'"':'')+'>'+badge+'<span class="sp-n"><b>'+esc(cuNm("s:"+x.n,x.n))+(x.conc?' <i class="sp-c">C</i>':'')+(x.rit?' <i class="sp-c rit">R</i>':'')+'</b><small><span class="sp-u">'+esc(x.use)+' \u2022 </span><span class="sp-s">'+esc(x.src||"")+'</span>'+(l>spGrpLv(x)?'<span class="sp-w"> \u2022 with a '+ordL(l).replace(" Level","")+' slot</span>':'')+'</small></span><span class="sp-t">'+esc(x.ct.replace("Bonus Action","1BA").replace("Reaction","1R").replace("Action","1A"))+'</span><span class="sp-g">'+spRangeH(x.r,x)+'</span><span class="sp-hd'+(hd==="\u2014"?" sp-no":"")+'">'/* v36 p13 */+esc(hd)+'</span><span>'+spEffH(x,l>spGrpLv(x)?l:spRowLv(x))+'</span></button><button type="button" class="spk" data-qcast="'+p[1]+'">'+(/1\/Long/.test(x.use)?"Use ":"Cast ")+esc(x.n)+'</button>'}).join("")+'</div>'});/* v21 m4 */
 el.innerHTML=h}

