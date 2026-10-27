/* ================= SHEET (modal / bottom sheet) with navigation ================= */
var sheet=$("#sheet"), sheetMode="", lastFocus=null, navStack=[];
var LASTPT=null;document.addEventListener("pointerdown",function(e){ LASTPT={x:e.clientX,y:e.clientY,t:Date.now()}; },true);/* v53: the panel grows from where you tapped (wide screens) */
function growFrom(){ try{ if(REDUCE||innerWidth<760||!LASTPT||Date.now()-LASTPT.t>1500){ sheet.style.transformOrigin=""; return; } var r=sheet.getBoundingClientRect(); if(!r.width) return; var x=Math.max(0,Math.min(r.width,LASTPT.x-r.left)), y=Math.max(0,Math.min(r.height,LASTPT.y-r.top)); sheet.style.transformOrigin=Math.round(x)+"px "+Math.round(y)+"px"; }catch(er){} }
function openSheet(title, html, mode, wide){
  hpDockBack();/* v30 */
  if(!sheet.classList.contains("on")) lastFocus=document.activeElement;
  sheetMode=mode;
  $("#sheetTitle").textContent=title; $("#sheetBody").innerHTML=html; $("#sheetBody").scrollTop=0;
  $("#sheetBack").hidden = navStack.length<2;
  sheet.classList.toggle("wide",!!wide); sheet.style.transform="";
  if(!sheet.classList.contains("on")) growFrom();
  try{ window.__artSheet&&window.__artSheet(mode,title); }catch(er){}
  $("#scrim").classList.add("on"); sheet.classList.add("on"); dockApply(mode,wide); shOpened();/* v31 p14, p16 */
  setTimeout(function(){ var b=$("#sheet [data-close]"); if(b) b.focus({preventScroll:true}); },80);
}
function entryContent(en){
  if(en.type==="bd"){ var cb=cuOf("bd",en.key); return {t:B[en.key]?B[en.key].t:"", h:bdHTML(en.key)+cuqBackH(en.key)+(cb?cuBtn(cb):""), m:"bd"}; }/* v26 RU38 no. 2 */
  if(en.type==="cond") return {t:"Conditions", h:condHTML(), m:"cond"};
  if(en.type==="combat") return {t:"Combat", h:combatHTML(), m:"combat"};/* v22 RU62 */
  if(en.type==="spman") return {t:"Manage Spells", h:spmHTML(), m:"spman"};
  if(en.type==="search"){ setTimeout(gsMark,0); return {t:"Search", h:gsHTML(), m:"search"}; }/* v27 RU66 *//* v25 RU38 no. 3 */
  if(en.type==="cuq"){ var cq=cuqOf(en.key); return {t:cq?"Edit "+cq.t:"Edit", h:cuqHTML(en.key), m:"cuq"}; }/* v34 RU85 */
  if(en.type==="cust") return {t:"Customize", h:cuHTML(en.key,en.n), m:"cust"};/* v26 RU38 no. 2 */
  var r=cuDecor(en.spec,infoHTML(en.spec)); return {t:r.t, h:r.h, m:"info"};
}
var SWP=null;/* v36 p18: {list:[spec], i} of the list the open card came from */
function swpSet(el){ var c=el.closest("[id$='Body']")||document, sp=el.getAttribute("data-info"), seen={}, L=[];
  [].forEach.call(c.querySelectorAll('[data-info]'),function(b){ var s=b.getAttribute("data-info"); if(!/^(sp|f|w|it|xd):/.test(s)||seen[s]||!b.offsetParent) return; seen[s]=1; L.push(s); });
  var i=L.indexOf(sp); SWP=(i>=0&&L.length>1)?{list:L,i:i}:null; }
function swpMove(d){ if(!SWP||navStack.length!==1) return false; var j=SWP.i+d; if(j<0||j>=SWP.list.length) return false; SWP.i=j; showEntry({type:"info",spec:SWP.list[j]},false); return true; }
function swpSync(){ var b=$("#sheetBody"), old=b&&b.querySelector(".swp"); if(old) old.remove(); var en=navStack[navStack.length-1];
  if(!b||!SWP||navStack.length!==1||!en||en.type!=="info"||en.spec!==SWP.list[SWP.i]||sheetMode==="edit") return;
  var n=SWP.list.length, i=SWP.i, a=Math.max(0,Math.min(i-3,n-7)), dots="";
  for(var k=a;k<Math.min(n,a+7);k++) dots+='<i'+(k===i?' class="on"':'')+'></i>';
  var d=document.createElement("div"); d.className="swp"; d.setAttribute("role","group"); d.setAttribute("aria-label","Card "+(i+1)+" of "+n);
  d.innerHTML='<button type="button" class="swp-b" data-swp="-1" aria-label="Previous card"'+(i?'':' disabled')+'>\u2039</button><span class="swp-d">'+dots+'</span><span class="swp-n">'+(i+1)+' / '+n+'</span><button type="button" class="swp-b" data-swp="1" aria-label="Next card"'+(i<n-1?'':' disabled')+'>\u203a</button>';
  b.insertBefore(d,b.firstChild); }
document.addEventListener("keydown",function(e){ if(!SWP||!sheet.classList.contains("on")||sheetMode!=="info"||/INPUT|TEXTAREA|SELECT/.test((e.target||{}).tagName||"")) return; if(e.key==="ArrowRight"){ if(swpMove(1)) e.preventDefault(); } else if(e.key==="ArrowLeft"){ if(swpMove(-1)) e.preventDefault(); } });
(function(){ var b=document.getElementById("sheetBody"), x0=0, y0=0, on=false; if(!b) return;
  b.addEventListener("touchstart",function(e){ on=e.touches.length===1&&!!SWP&&!(e.target.closest&&e.target.closest("input,textarea,select,.swp")); if(on){ x0=e.touches[0].clientX; y0=e.touches[0].clientY; } },{passive:true});
  b.addEventListener("touchend",function(e){ if(!on) return; on=false; var t=e.changedTouches[0], dx=t.clientX-x0, dy=t.clientY-y0; if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.6) swpMove(dx<0?1:-1); },{passive:true}); })();
function showEntry(en, push){
  hpDockBack();/* v30 */
  var open=sheet.classList.contains("on") && sheetMode!=="edit";
  if(push && open) navStack.push(en); else navStack=[en];
  var c=entryContent(en);
  if(open){
    sheetMode=c.m; $("#sheetTitle").textContent=c.t; var b=$("#sheetBody"); b.innerHTML=c.h; b.scrollTop=0;
    b.classList.remove("swap"); void b.offsetWidth; b.classList.add("swap");
    $("#sheetBack").hidden = navStack.length<2;
  } else openSheet(c.t, c.h, c.m);
  swpSync();/* v36 p18 */
}
function refreshEntry(){
  if(!navStack.length || !sheet.classList.contains("on") || sheetMode==="edit") return;
  var c=entryContent(navStack[navStack.length-1]), b=$("#sheetBody"), st=b.scrollTop;
  $("#sheetTitle").textContent=c.t; b.innerHTML=c.h; b.scrollTop=st; swpSync();/* v36 p18 */
}
$("#sheetBack").addEventListener("click",function(){
  if(navStack.length<2) return;
  hpDockBack(); navStack.pop(); var c=entryContent(navStack[navStack.length-1]);
  sheetMode=c.m; $("#sheetTitle").textContent=c.t; var b=$("#sheetBody"); b.innerHTML=c.h; b.scrollTop=0;
  b.classList.remove("swap"); void b.offsetWidth; b.classList.add("swap");
  $("#sheetBack").hidden = navStack.length<2; swpSync();/* v36 p18 */
});

