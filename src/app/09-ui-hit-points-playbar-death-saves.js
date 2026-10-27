/* ================= HIT POINTS ================= */
var flashT=null;
function buzz(ms){ try{ if(localStorage.getItem("mi-bz")==="off") return; }catch(e){} try{ if(navigator.vibrate&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)) navigator.vibrate(ms||8); }catch(e){} }/* v29: short haptic tap on phones */
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("#healBtn,#dmgBtn,.pip,.slot,.lu-box,.box,.ifb,.tab,#bnav button"); if(t) buzz(t.id==="dmgBtn"?[12,30,12]:8); },true);
function flash(cls){ var el=$("#hpCur"), vc=cls==="hit"?"m-hit":"m-heal", xs=[document.querySelector(".vitals"),document.getElementById("vbHp"),document.getElementById("hpBox")];/* v29 RU120, v30 */
  var again=el.classList.contains("hit")||el.classList.contains("healed")||xs.some(function(x){ return x&&(x.classList.contains("m-hit")||x.classList.contains("m-heal")); });
  el.classList.remove("hit","healed"); xs.forEach(function(x){ if(x) x.classList.remove("m-hit","m-heal"); }); if(again) void el.offsetWidth;/* v30 p13: one forced layout, only to restart a running animation */
  el.classList.add(cls); xs.forEach(function(x){ if(x) x.classList.add(vc); });
  clearTimeout(flashT); flashT=setTimeout(function(){ el.classList.remove(cls); xs.forEach(function(x){ if(x) x.classList.remove("m-hit","m-heal"); }); },700); }
/* v50: a number rises from the Hit Points and fades. The sign stays, so the meaning does not rest on colour alone */
function hpFloat(txt,kind){ if(REDUCE||!document.body.animate) return; var el=$("#hpCur"); if(!el||!el.offsetParent) el=document.getElementById("vbHpV"); if(!el||!el.getBoundingClientRect) return; var r=el.getBoundingClientRect(); if((!r.width&&!r.height)||r.bottom<0||r.top>innerHeight) return;
  var f=document.createElement("i"); f.className="hpf hpf-"+kind; f.textContent=txt; f.setAttribute("aria-hidden","true"); f.style.left=Math.round(r.left+r.width/2)+"px"; f.style.top=Math.round(r.top)+"px"; document.body.appendChild(f); setTimeout(function(){ if(window.__miEcho) window.__miEcho(f); },0);/* v55 echo */
  var a=f.animate([{transform:"translate(-50%,0) scale(.7)",opacity:0},{transform:"translate(-50%,-14px) scale(1.08)",opacity:1,offset:.25},{transform:"translate(-50%,-44px) scale(1)",opacity:0}],{duration:1000,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
  a.onfinish=a.oncancel=function(){ if(f.parentNode) f.parentNode.removeChild(f); }; setTimeout(function(){ if(f.parentNode) f.parentNode.removeChild(f); },1500); }
function barColor(p){ return p>.5 ? "var(--good)" : (p>.25 ? "var(--warn)" : "var(--bad)"); }
function hpLv(p){ return p>.5?"ok":p>.25?"mid":"low"; }/* v32 p27 RU113: the level as a pattern too */
function syncHP(instant){
  S.hp = clamp(S.hp,0,D.hpmax); S.tmp = Math.max(0,S.tmp);
  var cur=$("#hpCur"), bar=$("#hpBar"), tb=$("#tmpBar");
  if(window.__miOdo&&window.__MI&&!window.__MI.rm()) window.__miOdo(cur,S.hp); else spring("hpNum", S.hp, function(x){ var r=String(Math.round(x)); if(cur.textContent!==r) cur.textContent=r; }, {k:140, instant:instant});/* v55: odometer *//* v30 p13: write only what changed */
  barTo(bar, clamp(S.hp/D.hpmax,0,1), instant, barColor(S.hp/D.hpmax));/* v31 p21: compositor spring */ bar.setAttribute("data-lv",hpLv(S.hp/D.hpmax));/* v32 p27 RU113 */
  (function(){ var g=document.getElementById("hpGhost"); if(!g&&bar.parentNode){ g=document.createElement("i"); g.id="hpGhost"; bar.parentNode.insertBefore(g,bar); } if(!g) return; var to=clamp(S.hp/D.hpmax,0,1), was=+(g.getAttribute("data-v")||to);
    g.style.transition=(instant||to>was)?"none":""; g.style.transform="scaleX("+to+")"; g.setAttribute("data-v",to); })();/* v29 RU120: the red trail follows the bar down a moment later */
  barTo(tb, clamp(S.tmp/D.hpmax,0,1), instant);/* v31 p21 */
  var hmx=$("#hpMax"); if(hmx.getAttribute("data-v")!==String(D.hpmax)||!hmx.firstElementChild){ hmx.setAttribute("data-v",D.hpmax); hmx.innerHTML = '<button type="button" class="bd" data-bd="hp" style="border-radius:6px;padding:0 4px">'+D.hpmax+'</button>'; }/* v30 p13 */
  $("#hpChipV").textContent = S.hp + (S.tmp?"+"+S.tmp:"");
  (function(){ var tv=$("#tmpV"); if(!tv) return; if(tv.tagName==="INPUT"){ if(document.activeElement!==tv) tv.value=S.tmp; } else tv.textContent=S.tmp; })();/* v31 p96 */
  var ht=$("#hpTmp"); ht.textContent="+"+S.tmp+" temp"; ht.classList.toggle("on",S.tmp>0);
  $("#death").classList.toggle("on", S.hp===0);
  Array.prototype.forEach.call(document.querySelectorAll(".vitals,#hpBox,#vbHp"),function(x){ x.classList.toggle("hp0",S.hp===0); });/* v50: a slow red pulse at 0 */
  if(S.hp>0) S.ds=[0,0];
  syncDeath(); vbSync();
}
/* v30 RU87, RU84: play bar on phones (HP, Temp HP, AC, conditions with Exhaustion, Concentration, Heroic Inspiration) */
function vbSync(){ if(PIP) try{ pipSync(); }catch(er){} ohSync(); var vb=document.getElementById("vbar"); if(!vb||!D||!D.hpmax) return;
  try{ var hp=clamp(num(S.hp,0),0,D.hpmax), tp=Math.max(0,num(S.tmp,0)), p=clamp(hp/D.hpmax,0,1);
  var hasI=typeof ICO==="object"&&!!ICO; if(hasI&&!vb.getAttribute("data-ico")){ vb.setAttribute("data-ico","1"); $("#vbHpI").innerHTML=ico("hp-heal","vb-hi"); $("#vbConc").innerHTML=ico("tag-concentration"); $("#vbInsp").innerHTML=ico("ui-star","vb-star"); }
  if(window.__miOdo&&window.__MI&&!window.__MI.rm()) window.__miOdo($("#vbHpV"),hp); else $("#vbHpV").textContent=hp; $("#vbHpM").textContent=D.hpmax; var t=$("#vbTmp"); t.hidden=!tp; t.textContent="+"+tp;
  var b=$("#vbBar"); b.style.transform="scaleX("+p+")"; b.style.backgroundColor=barColor(p); b.setAttribute("data-lv",hpLv(p)); $("#vbTbar").style.transform="scaleX("+clamp(tp/D.hpmax,0,1)+")";
  $("#vbHp").setAttribute("aria-label","Hit Points "+hp+" of "+D.hpmax+(tp?", "+tp+" temporary":"")+". Heal or take damage"); $("#vbHp").classList.toggle("zero",hp===0);
  $("#vbAcV").textContent=D.ac; $("#vbAc").setAttribute("aria-label","Armor Class "+D.ac);
  var L=activeConds().map(function(c){ return c.k+(c.extra||""); }); if(S.exh) L.unshift("Exhaustion "+S.exh);
  var cb=$("#vbCond"), k0=S.exh?"exhaustion":(activeConds()[0]||{}).k; cb.classList.toggle("on",L.length>0);
  if(hasI) $("#vbCondI").innerHTML=L.length?(ico("cond-"+String(k0).toLowerCase())||ico("cond-exhaustion")):ico("ui-plus");
  $("#vbCondT").textContent=L.length?L[0]+(L.length>1?" +"+(L.length-1):""):"Conditions";
  cb.setAttribute("aria-label",L.length?"Conditions: "+L.join(", ")+". Change conditions":"No conditions. Add a condition");
  var o=concOf(), cc=$("#vbConc"); cc.hidden=!o; if(o){ var i=spIx(o.n); if(i>=0) cc.setAttribute("data-info","sp:"+i); else cc.removeAttribute("data-info"); cc.setAttribute("aria-label","Concentrating on "+o.n+". Open the spell"); cc.title="Concentrating on "+o.n; }
  $("#vbInsp").setAttribute("aria-pressed",S.insp?"true":"false"); }catch(er){}
}
/* Hit Points from any page: Main scrolls to the card, other pages open the same controls in a bottom sheet */
function hpDockBack(){ var s=document.getElementById("hpSlot"), h=document.getElementById("hpBox"), b=document.getElementById("sheetBody"); if(b) b.classList.remove("hpdock"); if(s&&h&&s.nextElementSibling!==h) s.parentNode.insertBefore(h,s.nextSibling); }
function hpOpen(){ var h=document.getElementById("hpBox"); if(!h) return;
  if(!mq.matches||curPage===0){ var v=document.querySelector(".vitals"), pm=$("#p-main"); if(v&&pm&&mq.matches) pm.scrollTo({top:Math.max(0,v.getBoundingClientRect().top-pm.getBoundingClientRect().top+pm.scrollTop-8),behavior:REDUCE?"auto":"smooth"}); return; }
  var slot=document.getElementById("hpSlot"); if(!slot){ slot=document.createElement("i"); slot.id="hpSlot"; slot.hidden=true; h.parentNode.insertBefore(slot,h); }
  navStack=[]; openSheet("Hit Points","","hp"); var b=$("#sheetBody"); b.classList.add("hpdock"); b.appendChild(h); }
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("#vbHp,#vbCond,#vbInsp"); if(!t) return;
  if(t.id==="vbCond"){ showEntry({type:"cond"},false); return; }
  if(t.id==="vbInsp"){ var ib=$("#insp"); if(ib) ib.click(); vbSync(); return; }
  hpOpen(); });
function pipsHTML(n,max,lbl){ var h=""; for(var i=0;i<max;i++) h+='<button type="button" class="pip" aria-pressed="'+(i<n)+'" data-i="'+i+'" aria-label="'+lbl+' '+(i+1)+'"></button>'; return h; }
function syncDeath(){ $("#dsS").innerHTML = pipsHTML(S.ds[0],3,"Success"); $("#dsF").innerHTML = pipsHTML(S.ds[1],3,"Failure");
  var dead=S.hp===0&&S.ds[1]>=3, v=document.querySelector(".vitals"), n=document.getElementById("deadNote"); if(v) v.classList.toggle("dead",dead);/* v29 RU127 */
  if(!n){ n=document.createElement("div"); n.id="deadNote"; n.className="dead-note"; var di=document.querySelector(".death-in"); if(di) di.insertBefore(n,di.firstChild); }
  n.innerHTML=dead?('<b>Dead</b><span>'+(S.exh>=6?'Exhaustion level 6':'Three failed death saves')+'. Heal or lower Exhaustion to undo.</span>'):""; n.hidden=!dead; if(S.hp!==0) DS_OVER=0; dsGuideSync();/* v32 p26 */ }
/* v32 p26 RU130: guide for Death Saving Throws (rules: PHB 2024, Death Saving Throws) */
var DS_OVER=0;
function dsGuideH(){ var s=S.ds||[0,0], st=s[0]>=3, dead=s[1]>=3; if(S.hp!==0||dead) return "";
  var ic=function(k,c){ return (typeof ICO==="object"&&ICO)?ico(k,c):""; }, b=function(k,ik,t,sm){ return '<button type="button" class="btn press dsb dsb-'+k+'" data-dsr="'+k+'">'+ic(ik,"dsb-i")+'<span><b>'+t+'</b>'+(sm?'<small>'+sm+'</small>':'')+'</span></button>'; };
  var h='<div class="dsg" id="dsGuide">';
  if(DS_OVER>0) h+='<div class="caution dsg-mass"><span>Massive damage: '+DS_OVER+' damage was left over after you dropped to 0, which is at least your Hit Point maximum ('+D.hpmax+'). By the rules your character dies.</span><button type="button" class="btn press dsb" data-dsr="dead">'+ic("death-fail","dsb-i")+'<span><b>Mark as Dead</b></span></button></div>';
  if(st) h+='<p class="dsg-t">'+(window.__artVig?window.__artVig("moment","stabilized",72):"")+'<b>Stable.</b> You stop making Death Saving Throws but stay Unconscious. Without healing you regain 1 Hit Point after 1d4 hours.</p>';
  else h+='<p class="dsg-t"><b>Death Saving Throw.</b> At the start of each of your turns, roll a d20 and tap the result. Three successes: Stable. Three failures: you die.'+((D.cf&&D.cf.ds||[]).length?' '+cfFlags(D.cf.ds)+(function(){ var L=D.cf.ds, a=L.filter(function(x){ return x.t==="ADV"; }), d=L.filter(function(x){ return x.t==="DIS"; }); return ' '+(a.length&&d.length?'Advantage and Disadvantage cancel out, so you roll normally':'You roll with '+(a.length?'Advantage':'Disadvantage'))+' ('+esc(L.map(function(x){ return x.s; }).join(", "))+').'; })():'')+'</p><div class="dsg-b">'+b("s","death-success","10 or higher","Success")+b("f","death-fail","9 or lower","Failure")+b("1","death-fail","Rolled a 1","Two failures")+b("20","hp-heal","Rolled a 20","Regain 1 Hit Point")+'</div>';
  h+='<p class="dsg-t2">Hit while at 0 Hit Points?</p><div class="dsg-b">'+b("d","hp-damage","Damage","One failure")+b("c","hp-damage","Critical Hit","Two failures")+'</div></div>';
  return h; }
function dsGuideSync(){ var di=document.querySelector(".death-in"); if(!di) return; var g=document.getElementById("dsGuide"), h=dsGuideH();
  if(!h){ if(g) g.remove(); return; } if(g&&g.getAttribute("data-k")===h.length+":"+(S.ds||[]).join()) return; if(g) g.remove(); di.insertAdjacentHTML("beforeend",h); var n=document.getElementById("dsGuide"); if(n) n.setAttribute("data-k",h.length+":"+(S.ds||[]).join()); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-dsr]"); if(!b||S.hp!==0) return; e.preventDefault(); var k=b.getAttribute("data-dsr"), s=(S.ds||[0,0]).slice(), msg="";
  undoMark("Death Saving Throw");
  if(k==="20"){ S.hp=1; S.ds=[0,0]; DS_OVER=0; flash("healed"); save(); syncHP(); renderConds(); toastU("Rolled a 20: you regain 1 Hit Point and wake up."); return; }
  if(k==="dead"){ S.ds=[0,3]; DS_OVER=0; save(); syncHP(); toastU("Marked as dead. Undo if your DM rules otherwise."); return; }
  if(k==="s") s[0]=Math.min(3,s[0]+1); else { if(s[0]>=3&&(k==="d"||k==="c")) s[0]=0; s[1]=Math.min(3,s[1]+(k==="1"||k==="c"?2:1)); }
  S.ds=s; save(); syncHP();
  msg=s[1]>=3?"Three failures. Your character dies.":s[0]>=3?"Three successes. You are Stable.":(k==="s"?"Success":k==="d"?"Damage at 0 Hit Points: one failure":k==="c"?"Critical Hit at 0 Hit Points: two failures":k==="1"?"Rolled a 1: two failures":"Failure")+". Successes "+s[0]+" of 3, failures "+s[1]+" of 3.";
  toastU(msg); });

