/* ================= v24: TOUR (RU76) ================= */
/* A short tour for new players. Home shows an inline offer once (cs-ui-tour); the tour only starts when the player asks, so it never covers the app */
/* T11 U52: the tour now runs on the character's own sheet with the Learn spotlight (window.__spot, src/learn/46): HP, Armor Class,
   tap a number to see where it comes from, roll it with the 3D dice, the tabs, Rest and More. Two steps wait for a real tap and move
   on by themselves. The rolls made in the tour are taken back at the end (journal and roll history), so the character is as before.
   Without a character the tour points at Create a Character. Home shows one card for new people: Learn to play, or the tour.
   The tour can start again from Settings or the command search ("tour"). Back closes it (40-ui ovTop asks the spotlight first) */
var TOURS=[["sel:#hpBox","Your Hit Points. Type a number, then tap Damage or Heal. Undo is always one tap away."],
 ['bd:ac',"Armor Class. An attack has to reach this number to hit you."],
 ["skill:Athletics","Tap any number to see where it comes from. Try this one now.","bd"],
 ["sel:#sheet [data-mr]","Now roll it. The dice land on the screen and your bonus is added for you.","roll"],
 ["sel:#bnav","Actions, Spells, Inventory, Features and Notes live here. Swipe or tap to move.",null,"sel:#tabs"],
 ['sel:[data-rest="menu"]',"Rest after a fight. Short and Long Rests bring back HP and uses.",null,'sel:[data-rest="short"]'],
 ["sel:#moreBtn","More holds Settings, the Library and Export PDF. Settings can start this tour again.",null,"sel:#themeBtn","Settings changes the look and the rules. It can start this tour again."]];
function tourWide(){ return window.matchMedia&&matchMedia("(min-width:760px)").matches; }
var tourI=-1, TOUR_KEEP=null, TOUR_WAIT=null, TOUR_OPT=null;/* TOUR_OPT: words in the Learn language and what to do at the end (Learn passes them) */
function tourT(i){ var o=TOUR_OPT, st=TOURS[i]; if(o&&o.texts&&o.texts[i]) return tourWide()&&o.wide&&o.wide[i]?o.wide[i]:o.texts[i]; return tourWide()&&st[4]?st[4]:st[1]; }
function tourU(k,en){ var o=TOUR_OPT; return o&&o.ui&&o.ui[k]?o.ui[k]:en; }
function tourBanner(){ return "";/* T11 U52: the tour is part of Learn now, Home shows the Learn card only */ if(uiGet("cs-ui-tour").done) return ""; return '<div class="htour" id="htour" role="region" aria-label="New here?"><span><b>New here?</b> Learn D&amp;D by playing, or take a short tour of the app on your own character.</span><span class="htb"><button type="button" class="btn pri press" data-hlearn="1">Learn to play</button><button type="button" class="btn press" data-tour="go">Tour the app</button><button type="button" class="btn press" data-tour="no">No Thanks</button></span></div>'; }
function tourHasChar(){ var r=rGet(); return !!(r&&r.chars&&Object.keys(r.chars).length-rPh(r).length>0&&C&&!FROZEN); }/* placeholders (an empty first visit) do not count */
function tourGo(o){ TOUR_OPT=o||null; if(!window.__spot&&window.__bldNeed) window.__bldNeed(); if(!window.__spot){ toast("The tour is still loading. Try again in a moment."); return; }
  if(!tourHasChar()){ var c=document.querySelector("#homeV .hcreate"); if(c){ window.__spot.show(c,'<p class="tourn">Tour</p><p>'+esc(o&&o.create||"Make a character first. Create a Character opens the builder.")+'</p><div class="tourb"><button type="button" class="btn pri press" data-tour="done">OK</button></div>',tourQuit); } else tourFin(false); return; }
  var jk="mi-jr-"+(rGet().active||""); TOUR_KEEP={jk:jk,j:lsGet(jk),r:(function(){ try{ return sessionStorage.getItem("mi-rolls"); }catch(e){ return null; } })()};
  var hv=document.getElementById("homeV"); if(hv&&!hv.hidden){ hv.hidden=true; document.body.style.overflow=""; homeInert(); }
  if(sheet.classList.contains("on")) closeSheet(); tourShow(0); }
function tourCard(i){ var st=TOURS[i], last=i===TOURS.length-1; return '<p class="tourn">'+esc(tourU("step","Step"))+' '+(i+1)+' '+esc(tourU("of","of"))+' '+TOURS.length+'</p><p>'+esc(tourT(i))+'</p><div class="tourb">'+(last?'':'<button type="button" class="btn press" data-tour="skip">'+esc(tourU("skip","Skip tour"))+'</button>')+(i?'<button type="button" class="btn press" data-tour="back">'+esc(tourU("back","Back"))+'</button>':'')+(last?'<button type="button" class="btn pri press" data-tour="done">'+esc(tourU("done","Done"))+'</button>':'<button type="button" class="btn pri press" data-tour="next">'+esc(st[2]?tourU("skipThis","Skip this"):tourU("next","Next"))+'</button>')+'</div>'; }
function tourShow(i){ tourI=i; tourUnwait(); var st=TOURS[i], S=window.__spot; if(!S) return; var el=S.find(tourWide()&&st[3]?st[3]:st[0])||S.find(st[0]);
  if(!el){ if(i<TOURS.length-1){ tourShow(i+1); } else tourEnd(); return; }
  try{ el.scrollIntoView({block:"center",behavior:REDUCE?"auto":"smooth"}); }catch(er){}
  setTimeout(function(){ if(tourI!==i) return; S.show(el,tourCard(i),tourQuit); tourWait(st[2]); },REDUCE?0:300); }
/* steps that wait for a real tap: the breakdown opens (bd), the result of a roll shows (roll) */
function tourWait(k){ if(!k) return; var done=false, go=function(){ if(done) return; done=true; tourUnwait(); var n=tourI+1;
    if(k==="roll"){ setTimeout(function(){ if(tourI<0) return; if(sheet.classList.contains("on")) closeSheet(); setTimeout(function(){ if(tourI>=0) tourShow(n); },350); },2600); } else setTimeout(function(){ if(tourI>=0) tourShow(n); },450); };
  if(k==="roll"){ var r0=null; try{ r0=sessionStorage.getItem("mi-rolls"); }catch(e){} var iv=setInterval(function(){ var r1=null; try{ r1=sessionStorage.getItem("mi-rolls"); }catch(e){} if(r1!==r0) go(); },250); TOUR_WAIT={disconnect:function(){ clearInterval(iv); }}; return; }/* a roll lands in the roll history, with or without effects */
  var mo=new MutationObserver(function(){ if(sheet.classList.contains("on")&&sheet.querySelector("[data-mr]")) go(); });
  mo.observe(sheet,{attributes:true,attributeFilter:["class"],childList:true,subtree:true}); TOUR_WAIT=mo; }
function tourUnwait(){ if(TOUR_WAIT){ TOUR_WAIT.disconnect(); TOUR_WAIT=null; } }
function tourQuit(){ if(tourI>=0||TOUR_KEEP) tourEnd(true); else { uiSet("cs-ui-tour",{done:1}); tourBand(); tourFin(false); } }
function tourBand(){ var b=document.getElementById("htour"); if(b){ b.outerHTML=uiGet("cs-ui-tour").done&&typeof learnBand==="function"?learnBand():""; } }
function tourFin(full){ var o=TOUR_OPT; TOUR_OPT=null; if(o&&o.done) try{ o.done(!!full); }catch(e){} }
function tourEnd(fromSpot,full){ tourUnwait(); var was=tourI; tourI=-1; uiSet("cs-ui-tour",{done:1});
  if(!fromSpot&&window.__spot&&window.__spot.on()) window.__spot.hide(true);
  if(TOUR_KEEP){ var k=TOUR_KEEP; TOUR_KEEP=null; try{ if(k.j==null) __store.removeItem(k.jk); else __store.setItem(k.jk,k.j); }catch(e){} try{ if(k.r==null) sessionStorage.removeItem("mi-rolls"); else sessionStorage.setItem("mi-rolls",k.r); }catch(e){} }/* the tour rolls are taken back */
  if(was>=0&&sheet.classList.contains("on")) closeSheet();
  var c=document.getElementById("tourC"); if(c) c.remove(); document.querySelectorAll(".tour-hl").forEach(function(e){ e.classList.remove("tour-hl"); }); tourBand(); tourFin(full&&was===TOURS.length-1); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-tour]"); if(!b) return; var a=b.getAttribute("data-tour");
  if(a==="go"){ if(sheet.classList.contains("on")) closeSheet(); learnGo({place:"apptour"}); } else if(a==="next") tourShow(Math.min(TOURS.length-1,tourI+1)); else if(a==="back") tourShow(Math.max(0,tourI-1)); else if(a==="done"&&tourI<0){ if(window.__spot&&window.__spot.on()) window.__spot.hide(); } else tourEnd(false,a==="done"); });
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-hlearn]"); if(!b||b.closest("#homeV")) return; if(tourI>=0) tourEnd(); if(sheet.classList.contains("on")) closeSheet(); if(typeof learnGo==="function") learnGo(b.getAttribute("data-hlearn")==="tour"?{place:"apptour"}:undefined); });/* Learn to play from the tour card or Settings */
document.addEventListener("keydown",function(e){ if(tourI>=0&&e.key==="Escape"){ e.stopPropagation(); tourEnd(); } },true);
window.__tour={go:tourGo,state:function(){ return {i:tourI,keep:!!TOUR_KEEP}; }};

/* v24 M1: what Home covers is inert, so Tab starts on Home. m2: Tab stays inside an open dialog */
function homeInert(){ var h=document.getElementById("homeV"), on=!!(h&&!h.hidden); Array.prototype.slice.call(document.body.children).forEach(function(e){ if(e===h||/^(SCRIPT|STYLE)$/.test(e.tagName)||e.matches(".ask,.exp,#learn,#lrnSpot,#spotR,#toast,#pwaUpd,#qrSend,#qrScan,#bkp,#chf,#party,#rep,#lib,#tourC,#bld,.busy,#ps-wrap,.ps-wrap,#syBan,#frBar")/* v27: Party and Report dialogs sit over Home */) return;
  if(on){ if(!e.inert){ e.inert=true; e.setAttribute("data-hinert","1"); } } else if(e.getAttribute("data-hinert")){ e.inert=false; e.removeAttribute("data-hinert"); } }); }
(function(){ var mo=new MutationObserver(function(){ homeInert(); }); mo.observe(document.body,{childList:true}); var tie=function(){ var h=document.getElementById("homeV"); if(h&&!h.__ino){ h.__ino=1; new MutationObserver(homeInert).observe(h,{attributes:true,attributeFilter:["hidden"]}); homeInert(); } }; tie(); new MutationObserver(tie).observe(document.body,{childList:true}); })();
document.addEventListener("keydown",function(e){ if(e.key!=="Tab") return; var L=Array.prototype.slice.call(document.querySelectorAll('.ask,#sheet.on,#bkp,#chf,#party,#rep')).filter(function(d){ return !d.hidden&&getComputedStyle(d).display!=="none"; }), D0=L[L.length-1]; if(!D0) return;
  var f=Array.prototype.slice.call(D0.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function(x){ return !x.disabled&&(x.offsetWidth||x.offsetHeight); }); if(!f.length) return;
  var i=f.indexOf(document.activeElement); if(i<0){ e.preventDefault(); f[e.shiftKey?f.length-1:0].focus(); } else if(e.shiftKey&&i===0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&i===f.length-1){ e.preventDefault(); f[0].focus(); } },true);
