/* ===== v34 p06: one wallet for the sheet and the builder ===== */
function coinsClean(c){ var o={}; COINS.forEach(function(k){ var v=Math.floor(num(c&&c[k[0]],0)); o[k[0]]=v>0?v:0; }); return o; }
function coinsSame(a,b){ return COINS.every(function(k){ return num(a[k[0]],0)===num(b[k[0]],0); }); }
window.__coinsGet=function(){ return coinsNow(); };
window.__coinsGp=function(){ return num(C.gp,0); };
window.__coinsPut=function(c,why){ var o=coinsClean(c); if(coinsSame(o,coinsNow())) return coinsNow(); undoMark(why||"Coins"); coinSet(o); try{ renderInv(); coinRefresh(); }catch(e){} return coinsNow(); };
/* coins a build brought (new character, build file): to the sheet after Apply. The sheet already has other coins: ask */
window.__coinsPending=function(c){ var o=coinsClean(c), cur=coinsNow(), f=function(k){ return COINS.map(function(x){ return num(k[x[0]],0)+" "+x[0]; }).filter(function(s){ return !/^0 /.test(s); }).join(", ")||"no coins"; };
  if(!S.coins||coinsSame(o,cur)||coinTotal(cur)===num(C.gp,0)&&!cur.pp&&!cur.ep&&!cur.sp&&!cur.cp){ coinSet(o); try{ renderInv(); }catch(e){} return true; }
  ask("The builder has coins for this character ("+f(o)+") and the sheet has other coins ("+f(cur)+"). Use the coins from the builder? Cancel keeps the sheet's coins.","Use Builder Coins",function(){ undoMark("Coins from the builder"); coinSet(o); try{ renderInv(); }catch(e){} toastU("Coins set from the builder."); }); return false; };
window.__sheetOwnNums=function(){ var L=[]; try{ derive(); }catch(e){} if(typeof cuNumList==="function"&&cuNumList().length) L.push(cuNumList().length+" number"+(cuNumList().length>1?"s":"")+" set in Edit mode"); if(num(S.hpMod,0)) L.push("Max HP modifier "+sg(num(S.hpMod,0))); return L.length?{ac:D.ac,hp:D.hpmax,what:L}:null; };
var BPD_T=0;
function bldPend(){ clearTimeout(BPD_T); BPD_T=setTimeout(function(){ var b=document.getElementById("bldBtn"); if(!b) return; var L=[]; try{ L=window.__bldDiff?(window.__bldDiff(C)||[]):[]; }catch(e){ L=[]; }
  var on=L.length>0, m=b.querySelector(".bpend"); b.classList.toggle("pend",on); window.__bldPendList=L;
  if(on&&!m){ m=document.createElement("i"); m.className="bpend"; m.setAttribute("aria-hidden","true"); b.appendChild(m); } else if(!on&&m) m.remove();
  if(on){ b.setAttribute("aria-description","The builder and the sheet differ"); b.title="The builder and the sheet differ: "+L.slice(0,3).join(". ")+(L.length>3?"...":""); } else if(b.hasAttribute("aria-description")) b.removeAttribute("aria-description"); },250); }
bldDot=(function(f){ return function(){ var r=f.apply(this,arguments); bldPend(); return r; }; })(bldDot); if(window.__bldDot) window.__bldDot=bldDot;
document.addEventListener("bldready",function(){ bldPend(); if(window.__sp14Set&&C&&C.rs==="2014"&&(document.getElementById("bld")||{hidden:true}).hidden)window.__sp14Set(true);/* v92 */ });
onMode();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ moveTabInd(true); });
})();

/* v33 p10 handlers */
document.addEventListener("change",function(e){ var t=e.target; if(!t||!t.getAttribute) return;
  if(t.getAttribute("data-chfrem")){ var o=uiGet("cs-ui-remind"); o.days=+t.value; uiSet("cs-ui-remind",o); updUnsaved(); var g=document.getElementById("hgrid"); if(g&&typeof homeCards==="function") g.innerHTML=homeCards(true); toast(+t.value?"Backup reminder after "+t.value+" days.":"Backup reminder is off."); }
  if(t.getAttribute("data-chfauto")){ var o2=uiGet("cs-ui-remind"); o2.auto=!!t.checked; uiSet("cs-ui-remind",o2); toast(t.checked?"This file will be kept updated after you save it once.":"Automatic file updates are off."); } });
