/* v30 p11 RU131: Keep screen on (Screen Wake Lock). Asked again each time the page shows, let go when the setting is off */
var WL=null, WLp=false;
function wakeApply(){ var api=!!(navigator.wakeLock&&typeof navigator.wakeLock.request==="function"), want=api&&setOf("wake")==="1"&&document.visibilityState==="visible";
  if(want&&!WL&&!WLp){ WLp=true; try{ navigator.wakeLock.request("screen").then(function(l){ WLp=false; WL=l; try{ l.addEventListener("release",function(){ if(WL===l) WL=null; }); }catch(er){} if(setOf("wake")!=="1"){ WL=null; try{ l.release(); }catch(er){} } },function(){ WLp=false; WL=null; }); }catch(er){ WLp=false; } }
  else if(!want&&WL){ var l=WL; WL=null; try{ l.release(); }catch(er){} } }
document.addEventListener("visibilitychange",function(){ try{ wakeApply(); }catch(er){} });
window.__wake=function(){ return {on:setOf("wake")==="1",held:!!WL}; };
/* v30 p11 RU131: one-handed mode, a thumb bar on phones */
function ohSync(){ var o=document.getElementById("ohAmt"), a=document.getElementById("hpAmt"); if(o&&a&&o.value!==a.value&&document.activeElement!==o) o.value=a.value; }
(function(){ var d=document.getElementById("ohDock"); if(!d) return;
  d.innerHTML='<button type="button" class="oh-b oh-sq press" data-oh="minus" aria-label="Lower the amount">'+ico("ui-minus")+'</button><input id="ohAmt" class="oh-amt" type="number" inputmode="numeric" min="0" placeholder="0" aria-label="Amount"><button type="button" class="oh-b oh-sq press" data-oh="plus" aria-label="Raise the amount">'+ico("ui-plus")+'</button>'+
    '<button type="button" class="oh-b oh-heal press" data-oh="heal">'+ico("hp-heal")+'<span>Heal</span></button><button type="button" class="oh-b oh-dmg press" data-oh="dmg">'+ico("hp-damage")+'<span>Damage</span></button>'+
    '<button type="button" class="oh-b press" data-oh="rest" aria-label="Short Rest or Long Rest">'+ico("rest-short")+'<span>Rest</span></button><button type="button" class="oh-b press" data-oh="search" aria-label="Search and commands">'+ico("ui-search")+'<span>Search</span></button>';
  d.addEventListener("click",function(e){ var b=e.target.closest("[data-oh]"); if(!b) return; var k=b.getAttribute("data-oh"), i=document.getElementById("ohAmt"), n=Math.max(0,parseInt(i.value,10)||0);
    if(k==="minus"||k==="plus"){ hpAmtSet(Math.max(0,n+(k==="plus"?1:-1))); return; }
    if(k==="rest"){ openRest("menu"); return; } if(k==="search"){ openSearch(); return; }
    if(!n){ toast("Type an amount first."); i.focus(); return; } var a=$("#hpAmt"); if(!a) return; a.value=String(n); (k==="heal"?$("#healBtn"):$("#dmgBtn")).click(); hpAmtSet(0); });
  d.addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.id==="ohAmt"){ e.preventDefault(); var b=d.querySelector(e.shiftKey?'[data-oh="heal"]':'[data-oh="dmg"]'); if(b) b.click(); } });
  document.addEventListener("input",function(e){ var t=e.target; if(!t) return; if(t.id==="ohAmt"){ var v=parseInt(t.value,10), a=$("#hpAmt"); if(a) a.value=isNaN(v)?"":String(Math.max(0,v)); } else if(t.id==="hpAmt") ohSync(); });
  document.addEventListener("click",function(e){ if(e.target.closest&&e.target.closest("[data-hpadd]")) ohSync(); });
})();
/* ===== v31 p02 segments (B2) ===== */
var SEGX={};
function segKey(el){ var r=el.closest("[id]"); return (r?r.id:"")+"|"+Array.prototype.indexOf.call((r||document).querySelectorAll(".ifil"),el); }
function segEdge(el){ var m=el.scrollWidth-el.clientWidth; el.classList.toggle("fit",m<=2);/* v31 p11: a row that cannot scroll lets the swipe go nowhere */ el.classList.toggle("ovf-l",el.scrollLeft>2); el.classList.toggle("ovf-r",m>2&&el.scrollLeft<m-2); }
function segFix(root){ if(!root||!root.querySelectorAll) return; Array.prototype.forEach.call(root.querySelectorAll(".ifil"),function(el){ var k=segKey(el);
  el.setAttribute("data-hscroll","1"); if(SEGX[k]!=null) el.scrollLeft=SEGX[k];
  var on=el.querySelector(".ifb.on"); if(on&&el.clientWidth){ var l=on.offsetLeft, r=l+on.offsetWidth; if(l<el.scrollLeft+8) el.scrollLeft=Math.max(0,l-28); else if(r>el.scrollLeft+el.clientWidth-8) el.scrollLeft=r-el.clientWidth+28; }
  SEGX[k]=el.scrollLeft; segEdge(el); }); }
/* icons are added one frame after a render and make the segments wider: check again two frames later */
function segFixL(root){ segFix(root); requestAnimationFrame(function(){ requestAnimationFrame(function(){ segFix(root); }); }); }
document.addEventListener("scroll",function(e){ var el=e.target; if(el&&el.classList&&el.classList.contains("ifil")){ SEGX[segKey(el)]=el.scrollLeft; segEdge(el); } },true);
window.addEventListener("resize",function(){ Array.prototype.forEach.call(document.querySelectorAll(".ifil"),segEdge); });
renderActions=(function(f){ return function(){ var r=f.apply(this,arguments); segFixL(document.getElementById("actBody")); return r; }; })(renderActions);
renderInv=(function(f){ return function(){ var r=f.apply(this,arguments); segFixL(document.getElementById("invBody")); return r; }; })(renderInv);
renderFeat=(function(f){ return function(){ var r=f.apply(this,arguments); segFixL(document.getElementById("featBody")); return r; }; })(renderFeat);
renderSpells=(function(f){ return function(){ var r=f.apply(this,arguments); segFixL(document.getElementById("spBody")); return r; }; })(renderSpells);
renderExtras=(function(f){ return function(){ var r=f.apply(this,arguments); segFixL(document.getElementById("extBody")); return r; }; })(renderExtras);
/* a page that was hidden while it rendered has no width yet: fix its segments when it shows */
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("#tabs .tab,#bnav button"); if(t) setTimeout(function(){ segFix(document); },60); });
/* ===== v31 p04 folded rules text (C4, C7, F1) ===== */
/* FOPEN: what the player opened, kept for this visit only (no storage) */
var FOPEN={};
function foldLen(t){ return String(t||"").replace(/\[\[|\]\]|\*\*/g,"").replace(/<[^>]+>/g,"").length; }
function foldP(html,key,t,force){ if(force||foldLen(t)<=110||/class="fch"/.test(html)) return '<p>'+html+'</p>'; var op=!!FOPEN[key];
  return '<p class="fold'+(op?' open':'')+'" data-fold="'+esc(key)+'">'+html+'</p><button type="button" class="fmore press" data-fmore="'+esc(key)+'" aria-expanded="'+op+'">'+ico("ui-chev-d","fmi")+'<span>'+(op?'Show less':'Show more')+'</span></button>'; }
function foldSet(key,op){ FOPEN[key]=op?1:0; if(!op) delete FOPEN[key];
  Array.prototype.forEach.call(document.querySelectorAll('[data-fmore]'),function(b){ if(b.getAttribute("data-fmore")!==key) return; b.setAttribute("aria-expanded",op?"true":"false");
    var s=b.querySelector("span:not(.asub)"); if(s&&!b.classList.contains("acomb-t")) s.textContent=op?"Show less":"Show more";
    var p=b.previousElementSibling; if(p&&p.classList.contains("fold")) p.classList.toggle("open",op);
    var w=b.closest(".acomb"); if(w&&b.classList.contains("acomb-t")){ w.classList.toggle("open",op); var l=w.querySelector(".aline"); if(l) l.hidden=!op; } }); }
/* a short text that fits in two lines needs no Show more (measured when its page is visible) */
function foldFix(root){ Array.prototype.forEach.call((root||document).querySelectorAll("p.fold:not(.open)"),function(p){ if(!p.clientHeight) return; var b=p.nextElementSibling, fits=p.scrollHeight<=p.clientHeight+2;
  p.classList.toggle("fits",fits); if(b&&b.classList.contains("fmore")) b.hidden=fits; }); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-fmore]");
  if(b){ e.preventDefault(); foldSet(b.getAttribute("data-fmore"),b.getAttribute("aria-expanded")!=="true"); return; }
  var p=e.target.closest&&e.target.closest("p.fold:not(.open)"); if(p&&!e.target.closest("button,a,input")&&!p.classList.contains("fits")) foldSet(p.getAttribute("data-fold"),true); });
renderActions=(function(f){ return function(){ var r=f.apply(this,arguments); requestAnimationFrame(function(){ foldFix(document.getElementById("actBody")); }); return r; }; })(renderActions);
renderFeat=(function(f){ return function(){ var r=f.apply(this,arguments); requestAnimationFrame(function(){ foldFix(document.getElementById("featBody")); }); return r; }; })(renderFeat);
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("#tabs .tab,#bnav button"); if(t) setTimeout(function(){ foldFix(document); },80); });
window.addEventListener("resize",function(){ Array.prototype.forEach.call(document.querySelectorAll("p.fold.fits"),function(p){ p.classList.remove("fits"); var b=p.nextElementSibling; if(b&&b.classList.contains("fmore")) b.hidden=false; }); foldFix(document); });
/* ===== v31 p06 notes (B9, C8) ===== */
var NOTE_ICO={org:"ui-flag",allies:"ui-users",enemies:"sk-intimidation",backstory:"ui-book",other:"ui-pen",session:"tab-notes"};
function noteSec(f){ return '<section class="nsec"><label class="nsec-h" for="n-'+f.k+'">'+ico(NOTE_ICO[f.k]||"tab-notes","nsec-i")+'<span><b>'+f.l+'</b><small>'+esc(f.h)+'</small></span></label><textarea id="n-'+f.k+'" class="nsec-t grow" data-note="'+f.k+'" rows="2" placeholder="Write here">'+esc(S.notes[f.k]||"")+'</textarea></section>'; }
/* boxes grow with their text; browsers without field-sizing get the height from JavaScript */
var GROW_CSS=!!(window.CSS&&CSS.supports&&CSS.supports("field-sizing","content"));
function growOne(t){ if(GROW_CSS||!t||!t.isConnected) return; t.style.height="auto"; t.style.height=(t.scrollHeight+2)+"px"; }
function growAll(root){ if(GROW_CSS) return; Array.prototype.forEach.call((root||document).querySelectorAll("textarea.grow"),growOne); }
document.addEventListener("input",function(e){ if(e.target&&e.target.classList&&e.target.classList.contains("grow")) growOne(e.target); });
renderNotes=(function(f){ return function(){ var r=f.apply(this,arguments); requestAnimationFrame(function(){ growAll(document.getElementById("notesBody")); growAll(document.getElementById("descBody")); }); return r; }; })(renderNotes);
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("#tabs .tab,#bnav button"); if(t) setTimeout(function(){ growAll(document); },80); });
/* ===== v31 p07 description (B10, C8) ===== */
var DESC_MORE=false;
/* one field: the label above, the value as plain text until tapped. Same ids and data attributes as before (n-camp, n-align, n-ch_*, n-<note>, data-lang) */
function dField(id,lbl,val,attr,ta,ph){ var v=String(val||""); return '<div class="dfield'+(v.trim()?'':' empty')+(ta?' long':'')+'"><label for="'+id+'">'+lbl+'</label>'+
  (ta?'<textarea id="'+id+'" class="dval grow" '+attr+' rows="1" placeholder="'+esc(ph||"Tap to write")+'">'+esc(v)+'</textarea>':'<input id="'+id+'" class="dval field" '+attr+' value="'+esc(v)+'" placeholder="'+esc(ph||"Tap to write")+'" autocomplete="off">')+'</div>'; }
function renderDesc(){ var el=$("#descBody"); if(!el) return;
  var bgG=(C.features||[]).filter(function(g){return /^Background/.test(g.g)})[0], miss=[], keep=function(v,name){ var e=!String(v||"").trim(); if(e) miss.push(name); return !e||DESC_MORE; };
  var h='<div class="dsec dcamp camp-f">'+dField("n-camp","Campaign",campName(),"",false,"Campaign name")+'<p class="dhint">Optional. Shown under your name, and My Characters can group by it.</p></div>';/* v30 RU133 */
  h+='<h3 class="noteh">'+ico("src-background")+'Background'+(C.bg?': '+esc(C.bg):'')+'</h3>'+(bgG?bgG.items.map(function(it){return '<p class="bgl"><b>'+esc(it.n)+'.</b> '+rich(String(it.d).replace(/\*\*Your choice\.\*\*\s*/,""))+'</p>'}).join(''):'<p class="muted">No background chosen yet.</p>');
  var lg=[0,1,2].map(function(i){ var v=S.lang[i]||""; if(i>0&&!keep(v,"Language "+(i+1))) return ""; return dField("n-lang"+i,i===0?"Language 1":"Language "+(i+1),v,'data-lang="'+i+'" aria-label="Language '+(i+1)+'"',false,i===0?"Common":"Language "+(i+1)); }).join("");
  h+='<h3 class="noteh">'+ico("ui-book")+'Languages</h3><p class="dhint">Common plus two of your choice. Rare or setting languages need DM approval.</p><div class="dgrid">'+lg+'</div>';
  var ch=(keep(S.align,"Alignment")?dField("n-align","Alignment",S.align||"","",false,"Optional in the 2024 rules"):"")+CHAR_FIELDS.map(function(f){ var v=S.notes[f[0]]||""; return keep(v,f[1])?dField("n-"+f[0],f[1],v,'data-note="'+f[0]+'"',false):""; }).join("");
  h+='<h3 class="noteh">Characteristics</h3><div class="dgrid">'+ch+'<div class="dfield ro"><span class="dlbl">Size</span><p class="chsz">'+esc(C.size||"Medium")+'</p></div></div>';
  var pe=NOTE_FIELDS.filter(function(f){ return /^(personality|ideal|bond|flaw|appearance)$/.test(f.k); }).map(function(f){ var v=S.notes[f.k]||""; return keep(v,f.l)?dField("n-"+f.k,f.l,v,'data-note="'+f.k+'"',true,f.h):""; }).join("");
  if(pe) h+='<h3 class="noteh">'+ico("tab-description")+'Personality</h3><div class="dlist">'+pe+'</div>';
  if(miss.length) h+='<button type="button" class="dmore press" data-dmore="1" aria-expanded="'+DESC_MORE+'">'+ico(DESC_MORE?"ui-chev-d":"ui-plus","dmi")+'<span><b>'+(DESC_MORE?'Hide empty details':'Add details')+'</b><small>'+esc(miss.join(", "))+'</small></span></button>';
  h+='<div class="saved">Saved on this device as you type.</div>';
  el.innerHTML=h; requestAnimationFrame(function(){ growAll(el); }); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-dmore]"); if(!b) return; e.preventDefault(); DESC_MORE=!DESC_MORE; renderDesc();
  if(DESC_MORE){ var f=document.querySelector("#descBody .dfield.empty .dval"); if(f) try{ f.focus({preventScroll:false}); }catch(er){} } });
/* ===== v31 p11 swipe + tab slide (RU112, D6, D2) ===== */
var BSPR=0;
function bIndSet(x){ if(BSPR) return; var s=SPR.bInd||(SPR.bInd={x:x,v:0,t:x,raf:0}); if(s.raf){ cancelAnimationFrame(s.raf); s.raf=0; } s.x=s.t=x; s.v=0; bInd.style.transform="translateX("+x+"%)"; }
function bIndTo(i){ var t=i*100; BSPR=1; spring("bInd", t, function(v){ bInd.style.transform="translateX("+(Math.round(v*10)/10)+"%)"; if(Math.abs(v-t)<.05) BSPR=0; }, {k:340, zeta:.82}); if(REDUCE) BSPR=0; }
pager.addEventListener("touchstart",function(){ if(BSPR){ BSPR=0; onPagerScroll(); } },{passive:true});/* a finger on the pages takes the bar line back */
function pageSlide(el,dir){ if(!el||REDUCE) return; var c=dir>0?"psl-r":"psl-l", busy=el.classList.contains("psl-l")||el.classList.contains("psl-r"); el.classList.remove("psl-l","psl-r"); clearTimeout(el.__psl);
  var go=function(){ el.classList.add(c); el.__psl=setTimeout(function(){ el.classList.remove("psl-l","psl-r"); },260); }; if(busy) requestAnimationFrame(go); else go(); }/* no forced layout: a running slide restarts on the next frame */
goPage=function(i,smooth){ if(!mq.matches) return; var from=curPage, w=pager.clientWidth; if(smooth&&i!==from&&Math.abs(pager.scrollLeft-from*w)<2){ pageSlide(document.getElementById(PAGES[i]), i>from?1:-1); bIndTo(i); }
  pager.scrollTo({left:i*w, behavior:"auto"}); };
setTab=(function(f){ return function(id,focus,instant){ var from=activeTab, ids=$$("#tabs .tab").map(function(t){ return t.getAttribute("data-tab"); }), a=ids.indexOf(from), b=ids.indexOf(id);
  var r=f.apply(this,arguments); if(!instant&&!mq.matches&&id!==from&&a>=0&&b>=0){ var el=document.getElementById(id); if(el){ el.classList.remove("enter"); pageSlide(el,b>a?1:-1); } } return r; }; })(setTab);
/* ===== v31 p12 card to detail (RU131 shared element) ===== */
var MORPH=null, VTC=null;
function morphSrc(inf){ if(inf.matches(".sp-r,.islot")) return inf; if(inf.matches(".iname")) return inf.closest(".irow")||inf;
  var h=inf.closest(".fitem>h4,.aitem>h4"); if(h) return h.parentNode; if(inf.closest(".arow .an")) return inf.closest(".arow"); if(inf.closest(".rs-h")) return inf.closest(".rs"); return null; }
document.addEventListener("click",function(e){ MORPH=null; var t=e.target; if(!t||!t.closest||!document.startViewTransition||REDUCE) return; if(window.__MI&&!window.__MI.rm()) return;/* v55: the F1 morph engine takes over */ if(t.closest("#sheet")) return;
  var inf=t.closest("[data-info]"); if(!inf) return; var c=morphSrc(inf); if(c) MORPH={el:c,t:performance.now()}; },true);
function morphEnd(){ var root=document.documentElement; root.classList.remove("vt-card"); sheet.classList.remove("vt-hold","vt-on"); sheet.style.viewTransitionName=""; $$(".vt-src").forEach(function(x){ x.classList.remove("vt-src"); x.style.viewTransitionName=""; }); VTC=null; }
function morphIn(card){ var root=document.documentElement, vt;
  card.classList.add("vt-src"); card.style.viewTransitionName="v31card"; root.classList.add("vt-card"); sheet.classList.add("vt-hold");
  try{ vt=document.startViewTransition(function(){ card.style.viewTransitionName=""; sheet.classList.remove("vt-hold"); sheet.style.viewTransitionName="v31card"; }); }catch(er){ morphEnd(); return; }
  VTC=vt; vt.finished.then(function(){ if(VTC===vt) morphEnd(); },function(){ if(VTC===vt) morphEnd(); }); }
openSheet=(function(f){ return function(){ var m=MORPH; MORPH=null; morphStop();
  var ok=m&&m.el.isConnected&&performance.now()-m.t<400&&!sheet.classList.contains("on")&&document.startViewTransition&&!REDUCE;
  if(ok) sheet.classList.add("vt-on"); var r=f.apply(this,arguments); if(ok) morphIn(m.el); return r; }; })(openSheet);
function morphStop(){ if(VTC){ try{ VTC.skipTransition(); }catch(er){} morphEnd(); } }
/* ===== v31 p13 header shrinks on scroll (RU130) ===== */
function pCur(i){ PAGES.forEach(function(p,k){ var el=document.getElementById(p); if(el) el.classList.toggle("pcur",k===i); }); }
pCur(curPage);
(function(){ var band=document.querySelector(".band"), app=document.getElementById("app"); if(!band||!app) return;
  function setH(){ var h=band.offsetHeight; if(h) app.style.setProperty("--bandh",h+"px"); }
  setH(); if(window.ResizeObserver) new ResizeObserver(setH).observe(band); else window.addEventListener("resize",setH); })();
/* ===== v31 p14 popup spring (RU130) ===== */
function shApply(p){ var s=SPR.sheet; if(s&&s.t===0&&p>0&&p<.012){ s.x=0; s.v=0; }
  var q=Math.max(-.2,Math.min(1.2,p)), t;
  if(sheet.classList.contains("dock")) t="translateX("+((1-q)*104).toFixed(2)+"%)";
  else if(mq.matches) t="translateY("+((1-q)*105).toFixed(2)+"%)";
  else t="translate(-50%,"+(-50+3*(1-q)).toFixed(2)+"%) scale("+(.97+.03*q).toFixed(4)+")";
  sheet.style.transform=t; sheet.style.opacity=(mq.matches&&!sheet.classList.contains("dock"))?"":String(Math.max(0,Math.min(1,q*1.6)).toFixed(3));
  if(s&&s.v===0&&s.x===s.t){ sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; } }
function shOpened(){ var s=SPR.sheet; if(REDUCE||sheet.classList.contains("vt-on")){ if(s){ if(s.raf) cancelAnimationFrame(s.raf); s.raf=0; s.x=s.t=1; s.v=0; } sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; return; }
  if(!s||(!s.raf&&!sheet.classList.contains("sp-out"))) s=SPR.sheet={x:0,v:0,t:0,raf:0};
  sheet.classList.add("spr"); sheet.classList.remove("sp-out"); spring("sheet",1,shApply,{k:300,zeta:.86}); shApply(s.x); }
function shClosed(){ var s=SPR.sheet; if(REDUCE||!s){ sheet.classList.remove("spr","sp-out"); sheet.style.transform=""; sheet.style.opacity=""; return; }
  sheet.classList.add("spr","sp-out"); spring("sheet",0,shApply,{k:420,zeta:1}); }
function shDragEnd(dy,vel,close){ var h=(sheet.offsetHeight||1)*1.05, s=SPR.sheet||(SPR.sheet={x:1,v:0,t:1,raf:0}); if(s.raf){ cancelAnimationFrame(s.raf); s.raf=0; }
  s.x=1-dy/h; s.v=-vel*1000/h; sheet.style.transform=""; if(close) closeSheet(); else { sheet.classList.add("spr"); spring("sheet",1,shApply,{k:300,zeta:.86}); } }
$("#sheetHead").addEventListener("pointerdown",function(e){ var s=SPR.sheet; if(!mq.matches||e.target.closest("button")||!s||!s.raf) return; cancelAnimationFrame(s.raf); s.raf=0; sheet.classList.remove("spr"); sheet.style.opacity=""; });
/* ===== v32 p29 (B15, RU132): exit motion and the Back button for popups and dialogs ===== */
(function(){
  function strip(n){ if(n.nodeType!==1) return; n.removeAttribute("id"); Array.prototype.slice.call(n.attributes).forEach(function(a){ if(/^data-|^aria-(?!hidden)|^role$|^for$|^name$/.test(a.name)) n.removeAttribute(a.name); }); }
  function ghost(n){ if(REDUCE||!n||n.nodeType!==1||!n.classList||!(n.classList.contains("ask")||n.classList.contains("bkp"))||n.id==="staleV") return;
    var g=n.cloneNode(true); strip(g); Array.prototype.slice.call(g.querySelectorAll("*")).forEach(strip); g.className="ovg"+(n.classList.contains("ask")?" ovg-a":""); g.setAttribute("aria-hidden","true"); g.inert=true;
    document.body.appendChild(g); setTimeout(function(){ g.remove(); },220); }
  var sig=function(n){ return n.nodeType===1?(n.id||n.className||""):""; };
  var mo=new MutationObserver(function(recs){ var add={}, rem=[]; recs.forEach(function(r){ if(r.type==="childList"&&r.target===document.body){ Array.prototype.forEach.call(r.addedNodes,function(n){ add[sig(n)]=1; }); Array.prototype.forEach.call(r.removedNodes,function(n){ rem.push(n); }); } });
    rem.forEach(function(n){ if(!add[sig(n)]) ghost(n); });/* a dialog redrawn in place (same id) does not fade */ ovQueue(); });
  mo.observe(document.body,{childList:true}); mo.observe(sheet,{attributes:true,attributeFilter:["class"]});
  var tieB=function(){ var b=document.getElementById("bld"); if(b&&!b.__ovo){ b.__ovo=1; mo.observe(b,{childList:true,attributes:true,attributeFilter:["hidden"]}); } }; tieB(); setTimeout(tieB,500);
})();
var OVG=false, OVSKIP=0, OVQ=0, OV_UNLOAD=0;
window.addEventListener("beforeunload",function(){ OV_UNLOAD=1; });/* a reload or page change is under way: going back in history now would cancel it */
function ovTop(){ var c=document.getElementById("ctxm"); if(c) return function(){ c.remove(); };
  var a=document.querySelectorAll("body > .ask"); if(a.length){ var x=a[a.length-1]; return function(){ var b=x.querySelector("[data-no]"); if(b) b.click(); else x.remove(); }; }
  var bl=document.getElementById("bld"); if(bl&&!bl.hidden){ var e=Array.prototype.slice.call(bl.children).filter(function(d){ return d.classList.contains("exp")&&d.id!=="exp"&&d.querySelector("[data-no]"); }); if(e.length){ var y=e[e.length-1]; return function(){ y.querySelector("[data-no]").click(); }; } }
  var q=document.getElementById("hpQm"); if(q) return function(){ qmClose(); };
  var k=Array.prototype.slice.call(document.querySelectorAll("body > .bkp")).filter(function(w){ return !w.hidden&&w.querySelector(".bkpx"); }); if(k.length){ var z=k[k.length-1]; return function(){ z.querySelector(".bkpx").click(); }; }
  if(sheet.classList.contains("on")) return function(){ var bk=$("#sheetBack"); if(bk&&!bk.hidden) bk.click(); else closeSheet(); };
  return null; }
function ovSync(){ OVQ=0; if(FROZEN||OV_UNLOAD) return; var on=!!ovTop();
  if(on&&!OVG){ try{ history.pushState({csOv:1},""); OVG=true; }catch(e){} }
  else if(!on&&OVG){ OVG=false; if(history.state&&history.state.csOv){ OVSKIP++; try{ history.back(); }catch(e){ OVSKIP--; } } } }
function ovQueue(){ if(!OVQ) OVQ=setTimeout(ovSync,0); }
window.addEventListener("popstate",function(){ if(OVSKIP>0){ OVSKIP--; ovQueue(); return; } if(!OVG) return; OVG=false; var f=ovTop(); if(f){ try{ f(); }catch(e){} } ovQueue(); });
try{ if(history.state&&history.state.csOv) history.replaceState(null,""); }catch(e){}/* a reload while a popup was open: the held entry is plain again */
window.__ovState=function(){ return {held:OVG, top:!!ovTop()}; };
/* ===== v32 p34 RU132: right-click menu on a computer ===== */
function ctxFire(attrs){ var b=document.createElement("button"); b.type="button"; b.hidden=true; Object.keys(attrs).forEach(function(k){ b.setAttribute(k,attrs[k]); }); document.body.appendChild(b); try{ b.click(); }finally{ b.remove(); } }
function ctxBoxes(scope){ var bx=Array.prototype.slice.call(scope.querySelectorAll(".bx[data-k]")); if(!bx.length) return []; var on=bx.filter(function(b){ return b.getAttribute("aria-pressed")==="true"||b.classList.contains("on"); }), off=bx.filter(function(b){ return on.indexOf(b)<0; }), L=[];
  if(off.length) L.push(["Use 1","ui-check",function(){ off[0].click(); }]); else L.push(["Use 1 (none left)","ui-check",null]);
  if(on.length) L.push(["Regain 1","ui-undo",function(){ on[on.length-1].click(); }]); return L; }
function ctxSpec(t){
  var row=t.closest&&t.closest("#invBody .irow"); if(row){ var nb=row.querySelector('[data-info^="it:"]'); if(!nb) return null; var ix=+nb.getAttribute("data-info").slice(3), it=(C.inv||[])[ix]; if(!it) return null;
    var L=[["Details","ui-info",function(){ nb.click(); }]], ck=row.querySelector("[data-ieqs]"); if(ck) L.push([eqOn(it)?"Unequip":"Equip",eqOn(it)?"ui-close":"ui-check",function(){ ck.click(); }]);
    if(CONS1.test(it.n)) L.push([num(it.q,1)>0?"Use 1":"Use 1 (none left)","ui-check",num(it.q,1)>0?function(){ ctxFire({"data-use1":ix,"data-potn":it.key||it.n}); }:null]);
    L.push(["Delete","ui-trash",function(){ ctxFire({"data-idel":it.key||it.n,"data-iix":ix,"data-sure":"1"}); },1]); return {t:cuNm("i:"+invKey(it),it.n),L:L,el:row}; }
  var sp=t.closest&&t.closest('#spBody .sp-r[data-info^="sp:"]'); if(sp){ var i=+sp.getAttribute("data-info").slice(3), x=(C.spells||[])[i]; if(!x) return null; var L2=[["Details","ui-info",function(){ sp.click(); }]];
    if(spAtWill(x)) L2.push(["Cast","tab-spells",function(){ ctxFire({"data-cast":i,"data-ck":""}); }]);
    else { var o=spCastOpts(x); if(!o.length) L2.push(["Cast (no slots left)","tab-spells",null]); o.forEach(function(q){ L2.push([(q.free?"Use ":"Cast with ")+q.lab+" ("+q.left+" left)","tab-spells",qOk(q)?function(){ ctxFire({"data-cast":i,"data-ck":ckOf(q),"data-cl":q.lv}); }:null]); }); }
    return {t:x.n,L:L2,el:sp}; }
  var fi=t.closest&&t.closest("#featBody .fitem"); if(fi){ var tx=fi.querySelector('.tx[data-info^="f:"]'); if(!tx) return null; return {t:tx.textContent,L:[["Details","ui-info",function(){ tx.click(); }]].concat(ctxBoxes(fi)),el:fi}; }
  var ar=t.closest&&t.closest("#actBody .arow, #actBody .rs"); if(ar){ var ax=ar.querySelector(".tx[data-info],[data-info]"); if(!ax) return null; return {t:ax.textContent,L:[["Details","ui-info",function(){ ax.click(); }]].concat(ctxBoxes(ar)),el:ar}; }
  return null; }
function ctxClose(){ var m=document.getElementById("ctxm"); if(m){ m.remove(); if(ctxClose.back&&ctxClose.back.focus) try{ ctxClose.back.focus({preventScroll:true}); }catch(e){} } ctxClose.back=null; }
function ctxOpen(spec,x,y){ ctxClose(); var m=document.createElement("div"); m.id="ctxm"; m.className="ctxm"; m.setAttribute("role","menu"); m.setAttribute("aria-label",spec.t);
  m.innerHTML='<div class="ctxh">'+esc(spec.t)+'</div>'+spec.L.map(function(a,i){ return '<button type="button" role="menuitem" class="ctxi'+(a[3]?' del':'')+'" data-ctxi="'+i+'"'+(a[2]?'':' disabled')+'>'+ico(a[1])+'<span>'+esc(a[0])+'</span></button>'; }).join("");
  document.body.appendChild(m); var w=m.offsetWidth, h=m.offsetHeight; m.style.left=Math.max(8,Math.min(x,innerWidth-w-8))+"px"; m.style.top=Math.max(8,Math.min(y,innerHeight-h-8))+"px";
  ctxClose.back=document.activeElement; m.__L=spec.L; var f=m.querySelector(".ctxi:not([disabled])"); if(f) f.focus({preventScroll:true}); }
document.addEventListener("contextmenu",function(e){ if(mq.matches||e.shiftKey) return; var spec=ctxSpec(e.target); if(!spec) return; e.preventDefault(); ctxOpen(spec,e.clientX,e.clientY); });
document.addEventListener("keydown",function(e){ var m=document.getElementById("ctxm");
  if(!m){ if((e.key==="ContextMenu"||(e.shiftKey&&e.key==="F10"))&&!mq.matches){ var spec=ctxSpec(document.activeElement||document.body); if(spec){ e.preventDefault(); var r=spec.el.getBoundingClientRect(); ctxOpen(spec,r.left+16,r.top+r.height/2); } } return; }
  if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); ctxClose(); return; }
  if(e.key==="ArrowDown"||e.key==="ArrowUp"){ e.preventDefault(); var b=Array.prototype.slice.call(m.querySelectorAll(".ctxi:not([disabled])")), i=b.indexOf(document.activeElement); if(b.length) b[(i+(e.key==="ArrowDown"?1:-1)+b.length)%b.length].focus(); } },true);
document.addEventListener("pointerdown",function(e){ var m=document.getElementById("ctxm"); if(m&&!m.contains(e.target)) ctxClose(); },true);
document.addEventListener("scroll",function(){ if(document.getElementById("ctxm")) ctxClose(); },true);
window.addEventListener("resize",function(){ ctxClose(); });
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#ctxm [data-ctxi]"); if(!b) return; e.preventDefault(); e.stopPropagation(); var m=document.getElementById("ctxm"), a=m&&m.__L&&m.__L[+b.getAttribute("data-ctxi")]; ctxClose.back=null; ctxClose(); if(a&&a[2]) a[2](); },true);
