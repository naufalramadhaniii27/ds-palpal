/* ================= TABS + PAGER ================= */
var mq = window.matchMedia("(max-width:759px)");
var PAGES = ["p-main","p-skills","p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"];/* v23 */
var activeTab = "p-actions";
function setTab(id, focus, instant){
  if(!instant&&!setTab.vt&&setTab.morph&&document.startViewTransition&&!mq.matches&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)&&id!==activeTab){ setTab.vt=1; var vt=document.startViewTransition(function(){ setTab(id,focus,true); }); vt.finished.then(function(){ setTab.vt=0; },function(){ setTab.vt=0; }); return; }/* v29: smooth morph between tabs */
  activeTab=id;
  $$("#tabs .tab").forEach(function(t){ var on=t.getAttribute("data-tab")===id; t.setAttribute("aria-selected",on); t.tabIndex=on?0:-1; if(on&&focus) t.focus(); });
  ["p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"].forEach(function(p){ var el=document.getElementById(p), on=p===id;
    if(!mq.matches){ if(on&&el.hidden){ el.hidden=false; el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); } else if(!on){ el.hidden=true; } } });
  moveTabInd(instant); var ts=$('#tabs .tab[aria-selected="true"]'), tb=$("#tabs"); if(ts&&tb&&tb.scrollWidth>tb.clientWidth){ var l=ts.offsetLeft, r=l+ts.offsetWidth; if(l<tb.scrollLeft) tb.scrollLeft=Math.max(0,l-16); else if(r>tb.scrollLeft+tb.clientWidth) tb.scrollLeft=r-tb.clientWidth+16; }/* v23: seven tabs */
}
var tabX=0, tabW=100;
function paintInd(){ $("#tabInd").style.transform="translateX("+tabX+"px) scaleX("+(tabW/100)+")"; }
function moveTabInd(instant){ var t=$('#tabs .tab[aria-selected="true"]'); if(!t||!t.offsetWidth) return; var x=t.offsetLeft+10, w=t.offsetWidth-20;
  spring("tabX", x, function(v){ tabX=v; paintInd(); }, {k:300, zeta:.86, instant:instant}); spring("tabW", w, function(v){ tabW=v; paintInd(); }, {k:300, zeta:.86, instant:instant}); }
$("#tabs").addEventListener("click",function(e){ var t=e.target.closest(".tab"); if(t) setTab(t.getAttribute("data-tab")); });
$("#tabs").addEventListener("keydown",function(e){ var tabs=$$("#tabs .tab"), i=tabs.findIndex(function(t){return t.getAttribute("aria-selected")==="true"});
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ e.preventDefault(); var n=(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length; setTab(tabs[n].getAttribute("data-tab"),true); } });
document.addEventListener("click",function(e){ var t=e.target.closest("[data-ieqs],[data-idel],[data-invman]"); if(!t) return; if(t.dataset.invman){ if(window.__bldEquip) window.__bldEquip(); return; } if(t.dataset.ieqs){ e.stopPropagation(); var nm=t.dataset.ieqs; var ai=invAt(nm,t.dataset.iix); if(ai&&ai.att&&!eqOn(ai)&&attCount()>=attMaxC()){ toast("You can attune to at most "+attMaxC()+" magic items. Unattune one first."); if(typeof closeSheet==="function"&&t.closest("#sheet")) closeSheet(); return; }/* M18 */ if(viaBld(nm)) bldGuard(function(){ window.__bldToggleEq(nm,occOf(invAt(nm,t.dataset.iix))); }); else { var it=invAt(nm,t.dataset.iix); if(it){ var lk=eqLinked(it), ne=!eqOn(it), fx=null, acd=false;
  /* RU29: armor or Shield on a hand-filled sheet: AC from the builder, no dialog. Manual entries stay */
  if(!lk&&window.__bldArmor){ try{ fx=window.__bldArmor({C:JSON.parse(JSON.stringify(C)),lang:S.lang},nm,ne); }catch(er){ fx=null; } }
  it.eq=ne; if(fx) acd=armorFx(fx,it); else bldSync(nm,{eq:it.eq,occ:occOf(it)}); saveC(); renderAll();
  toast(lk?(it.eq?"Equipped. Its attack is back on the Actions tab.":"Unequipped. Its attack is hidden from the Actions tab."):acd?((it.eq?"Equipped. ":"Unequipped. ")+"Armor Class is now "+D.ac+"."):(it.eq?"Equipped. Open Build and Apply to recalculate AC and attacks.":"Unequipped. Open Build and Apply to recalculate AC and attacks.")); } } if(typeof closeSheet==="function"&&t.closest("#sheet")) closeSheet(); return; } if(t.dataset.idel){ if(t.dataset.sure!=="1"){ t.dataset.sure="1"; t.textContent="TAP AGAIN TO DELETE"; return; } if(viaBld(t.dataset.idel)){ var dn=t.dataset.idel; bldGuard(function(){ undoMark("Delete "+dn); window.__bldRemove(dn,occOf(invAt(dn,t.dataset.iix))); toastU("Deleted "+dn+"."); }); } else { undoMark("Delete "+t.dataset.idel); var dIt=invAt(t.dataset.idel,t.dataset.iix); bldSync(t.dataset.idel,{del:1,occ:occOf(dIt)}); C.inv=(C.inv||[]).filter(function(x){return x!==dIt}); if(dIt&&ctOf(dIt.n)&&!C.inv.some(function(x){ return invKey(x)===invKey(dIt); })) C.inv.forEach(function(x){ if(x.in===invKey(dIt)) delete x.in; });/* v32 RU134 */ saveC(); renderAll(); toastU("Deleted "+t.dataset.idel+"."); } if(typeof closeSheet==="function") closeSheet(); } }, true);
/* Qty Apply: hand-filled sheet writes C.inv[].q, builder sheet goes through __bldSetQty (B.inv), then the popup redraws in place. */
function iqSync(box){ var r=box.closest(".iqty-r"), a=r&&r.querySelector("[data-iqa]"), v=parseInt(box.value,10); if(a) a.disabled=isNaN(v)||v<0||v===+box.getAttribute("data-iqv"); }
document.addEventListener("click",function(e){ var b=e.target.closest("[data-iqd],[data-iqa]"); if(!b||!b.closest("#sheet")) return; e.stopPropagation(); var box=b.closest(".iqty-r").querySelector(".iqi");
  if(b.dataset.iqd){ var v=parseInt(box.value,10); box.value=Math.max(0,(isNaN(v)?0:v)+(+b.dataset.iqd)); iqSync(box); return; }
  if(b.disabled) return; var nm=b.dataset.iqa, q=Math.max(0,parseInt(box.value,10)||0);
  var bix=b.dataset.iix, fin=function(){ var ix=(bix!=null&&C.inv&&C.inv[+bix]&&(C.inv[+bix].key||C.inv[+bix].n)===nm)?+bix:(C.inv||[]).findIndex(function(x){return (x.key||x.n)===nm}); if(ix>=0){ var r=infoHTML("it:"+ix); $("#sheetBody").innerHTML=r.h; if(navStack.length) navStack[navStack.length-1]={type:"info",spec:"it:"+ix}; }
    toast("Quantity set to "+q); };
  if(viaBld(nm)&&window.__bldSetQty){ bldGuard(function(){ window.__bldSetQty(nm,q,occOf(invAt(nm,bix))); fin(); }); return; } /* N1 */
  var it=invAt(nm,bix); if(!it) return; it.q=q; bldSync(nm,{q:q,occ:occOf(it)}); saveC(); renderAll(); fin(); },true);
document.addEventListener("input",function(e){ if(e.target.classList&&e.target.classList.contains("iqi")) iqSync(e.target); });
/* m6: typed points left for a pool resource */
document.addEventListener("change",function(e){ var t=e.target; if(!(t.classList&&t.classList.contains("pli"))) return; var k=t.getAttribute("data-k"), r=(D.res||[]).filter(function(q){return q.k===k})[0]; if(!r) return; var lf=clamp(Math.round(num(t.value,r.max-used(k,r.max))),0,r.max); S.used[k]=r.max-lf; save(); syncLU(); t.value=lf; });
document.addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("iqi")){ e.preventDefault(); var a=e.target.closest(".iqty-r").querySelector("[data-iqa]"); if(a&&!a.disabled) a.click(); } });
$("#invBody").addEventListener("click",function(e){ var b=e.target.closest("[data-invf]"); if(!b) return; invF=b.getAttribute("data-invf"); renderInv(); });
$("#actBody").addEventListener("click",function(e){ var b=e.target.closest("[data-actf]"); if(!b) return; actF=b.getAttribute("data-actf"); renderActions(); });
$("#featBody").addEventListener("input",function(e){ var t=e.target; if(t.id!=="featQ") return; featQ=t.value; var pos=t.selectionStart; renderFeat(); var qq=document.getElementById("featQ"); if(qq){ qq.focus(); qq.setSelectionRange(pos,pos);} });
$("#featBody").addEventListener("click",function(e){ var b=e.target.closest("[data-featf]"); if(!b) return; featF=b.getAttribute("data-featf"); renderFeat(); });
$("#spBody").addEventListener("click",function(e){ var b=e.target.closest("[data-spf]"); if(!b) return; e.stopPropagation(); spF=b.getAttribute("data-spf"); renderSpells(); });
$("#spBody").addEventListener("input",function(e){ var t=e.target; if(t.id!=="spQ") return; spQ=t.value; var pos=t.selectionStart; renderSpells(); var qq=document.getElementById("spQ"); if(qq){ qq.focus(); qq.setSelectionRange(pos,pos);} });
var pager=$("#pager"), bInd=$("#bInd"), navBtns=$$("#bnav button"), curPage=0, raf=0;
var BCSS=!!(window.CSS&&CSS.supports&&CSS.supports("animation-timeline","--a")&&CSS.supports("timeline-scope","--a")&&Element.prototype.animate);/* P1: scroll timeline drives the bar line */
if(BCSS) document.documentElement.classList.add("bi-css");
/* P2 frame rate: pages far from the view are not painted. A page keeps visibility:hidden until it is within one page of the view.
   goPage, focus() and scrollIntoView() show the page first, so a jump never lands on a blank page */
var PGCULL=null;
var PGCULL_ON=false;/* off: on a real phone the first visit to a far page painted late (frames of 120 to 150 ms in the fps test, A/B 2026-10-30). The server benchmark liked it, the phone did not */
function pgOn(){ if(!PGCULL_ON||PGCULL||!window.IntersectionObserver) return; PGCULL=new IntersectionObserver(function(es){ if(!mq.matches) return; es.forEach(function(e){ e.target.style.visibility=e.isIntersecting?"":"hidden"; }); },{root:pager,rootMargin:"0px 100% 0px 100%"});
  PAGES.forEach(function(id){ var el=document.getElementById(id); if(el) PGCULL.observe(el); }); }
function pgOff(){ if(PGCULL){ PGCULL.disconnect(); PGCULL=null; } PAGES.forEach(function(id){ var el=document.getElementById(id); if(el&&el.style.visibility) el.style.visibility=""; }); }
function pgShow(i){ for(var k=i-1;k<=i+1;k++){ var el=document.getElementById(PAGES[k]); if(el&&el.style.visibility) el.style.visibility=""; } }
function pgReveal(el){ var p=el&&el.closest&&el.closest("#pager>*, #pager .panel"); if(p&&p.style.visibility) p.style.visibility=""; }
(function(){ var f=HTMLElement.prototype.focus, s=Element.prototype.scrollIntoView;
  HTMLElement.prototype.focus=function(){ if(PGCULL) pgReveal(this); return f.apply(this,arguments); };
  Element.prototype.scrollIntoView=function(){ if(PGCULL) pgReveal(this); return s.apply(this,arguments); }; })();
function onPagerScroll(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=0; if(!mq.matches) return; var w=pager.clientWidth||1, f=pager.scrollLeft/w; if(!BCSS) bIndSet(f*100);/* v31 p11 */
  var idx=clamp(Math.round(f),0,PAGES.length-1); if(idx!==curPage){ curPage=idx; navBtns.forEach(function(b,i){ b.classList.toggle("on",i===idx); if(i===idx) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); }); navShow(idx); pCur(idx); }/* v31 p13 */ }); }
/* v23: the bottom bar scrolls sideways (9 pages); keep the current button in view */
function navShow(i){ var bn=document.querySelector(".bnav"), b=navBtns[i]; if(!bn||!b) return; var l=b.offsetLeft, r=l+b.offsetWidth; if(l<bn.scrollLeft+8) bn.scrollTo({left:Math.max(0,l-24),behavior:REDUCE?"auto":"smooth"}); else if(r>bn.scrollLeft+bn.clientWidth-8) bn.scrollTo({left:r-bn.clientWidth+24,behavior:REDUCE?"auto":"smooth"}); }
pager.addEventListener("scroll",onPagerScroll,{passive:true});
function goPage(i,smooth){ if(!mq.matches) return; pgShow(i); pager.scrollTo({left:i*pager.clientWidth, behavior:(smooth&&!REDUCE)?"smooth":"auto"}); }
navBtns.forEach(function(b){ b.addEventListener("click",function(){ var i=+b.getAttribute("data-go"); if(i===curPage){ document.getElementById(PAGES[i]).scrollTo({top:0,behavior:REDUCE?"auto":"smooth"}); } goPage(i,true); }); });
$("#hpChip").addEventListener("click",function(){ goPage(0,true); });
function onMode(){ if(mq.matches){ pgOn(); ["p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"].forEach(function(p){ document.getElementById(p).hidden=false; }); requestAnimationFrame(function(){ goPage(curPage,false); onPagerScroll(); }); } else { pgOff(); setTab(activeTab,false,true); } }
if(mq.addEventListener) mq.addEventListener("change",onMode); else if(mq.addListener) mq.addListener(onMode);
var rT=null;
window.addEventListener("resize",function(){ clearTimeout(rT); rT=setTimeout(function(){ if(mq.matches) goPage(curPage,false); else moveTabInd(true); },80); });

function spEffect(sp){var m=/(\d+d\d+(?:\s*\+\s*\d+)?)\s+([A-Z][a-z]+)/.exec(sp.sum||"");if(m)return m[1]+" "+m[2];var c=/\b(Blinded|Charmed|Frightened|Incapacitated|Invisible|Paralyzed|Poisoned|Prone|Restrained|Stunned|Unconscious)\b/.exec(sp.sum||"");return c?c[1]:"Utility"}
