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
  if(st) h+='<p class="dsg-t"><b>Stable.</b> You stop making Death Saving Throws but stay Unconscious. Without healing you regain 1 Hit Point after 1d4 hours.</p>';
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

/* ================= CONDITIONS ================= */
function activeConds(){
  var list=[];
  STD_CONDS.forEach(function(c){ if(S.cond[c]) list.push({k:c}); });
  HB_CONDS.forEach(function(c){ if(S.cond[c.k]) list.push({k:c.k,hb:true,extra:c.stack?(" ×"+S.burn):(c.num&&S.jinx?" ("+esc(S.jinx)+")":"")}); });
  return list;
}
function renderConds(){
  var list=activeConds();
  concAuto();/* v21 RU50 */ modeClean(); modeAuto();/* v22 M2, m3 */
  var any=list.length||S.exh;/* v30 B3, RU84: a titled row; Exhaustion is a chip too; empty is a clear Add condition button */
  var h = '<span class="cond-l">Conditions</span>'+modeChips()+concChip()+(S.exh?'<button type="button" class="chip on exh-c press" data-info="g:Exhaustion">Exhaustion '+S.exh+'</button>':'')+list.map(function(c){return '<button type="button" class="chip on cnd press'+(c.hb?' hb':'')+'" data-info="g:'+c.k+'">'+c.k+(c.extra||"")+'</button>'}).join("");
  h += '<button type="button" class="chip add press" id="condOpen">'+(any?'Edit':'Add condition')+'</button>';
  if(S.exh) h += '<button type="button" class="exh-note tx" data-info="g:Exhaustion">Exhaustion '+S.exh+': '+exTxt(S.exh)+'</button>';
  $("#conds").innerHTML = h; concHead(); vbSync();
}
function condHTML(){
  var h = '<div class="exh"><div><b><button type="button" class="tx" data-info="g:Exhaustion">Exhaustion</button></b><small>'+exHelp()+'</small></div><span class="stepper"><button type="button" data-exh="-1" aria-label="Decrease">−</button><output>'+S.exh+'</output><button type="button" data-exh="1" aria-label="Increase">+</button></span></div>';
  /* v30 B12: icon cards that light up when active. The name toggles, the i button opens the rule */
  function card(k,d,hb,extra){ var on=!!S.cond[k]; return '<div class="cc'+(on?' on':'')+(extra?' wide':'')+'"><button type="button" class="tog cc-b press" data-c="'+k+'" aria-pressed="'+on+'">'+ico("cond-"+k.toLowerCase())+'<span class="cc-n">'+k+'</span>'+(hb?'<span class="flag hb">HB</span>':'')+'<span class="cc-s" aria-hidden="true">'+ico("ui-check")+'</span></button><button type="button" class="cc-i press" data-info="g:'+k+'" aria-label="About '+k+'" title="About '+k+'">'+ico("ui-info")+'</button>'+(extra||'')+'</div>'; }
  h += '<span class="src" style="margin-bottom:8px">'+(x14()?"PHB-2014, Appendix A":"PHB-2024, Rules Glossary")+'</span><p class="cc-help">Tap a condition to turn it on or off. The i button shows its rules.</p>';
  h += '<div class="ccg">'+STD_CONDS.map(function(c){ return card(c,GLOSS[c].d,false); }).join("")+'</div>';
  h += '<span class="src" style="margin:12px 0 8px">'+HB_SRC+'</span>';
  h += '<div class="ccg">'+HB_CONDS.map(function(c){
    var ex="";
    if(c.stack) ex='<div class="hbx">Stacks <span class="stepper"><button type="button" data-burn="-1" aria-label="Remove a stack">−</button><output>'+S.burn+'</output><button type="button" data-burn="1" aria-label="Add a stack">+</button></span></div>';
    if(c.num) ex='<div class="hbx"><label for="jinxN">Recorded number</label><input id="jinxN" class="jin" type="number" min="1" max="20" inputmode="numeric" value="'+esc(S.jinx)+'"></div>';
    return card(c.k,c.d,true,ex);
  }).join("")+'</div>';
  return h;
}

/* ================= BREAKDOWN ================= */
function bdAbout(key){
  var m=key.match(/^(ab|save|sk|ah|ad)-(.+)$/), spec=null, label="";
  if(m){ if(m[1]==="ab"){ spec="g:"+ABN[m[2]]; label=ABN[m[2]]; } else if(m[1]==="save"){ spec="g:Saving Throw"; label="a saving throw"; }
    else if(m[1]==="sk"){ var sk=C.skills[+m[2]]; if(sk&&GLOSS[sk.n]){ spec="g:"+sk.n; label=sk.n; } }
    else { spec="w:"+m[2]; label="this attack"; } }
  else { var map={ac:"Armor Class",init:"Initiative",speed:"Speed",pb:"Proficiency Bonus",hp:"Hit Points",carry:"Carrying Capacity",dc:"Grapple",dark:"Darkvision","pas-per":"Passive Perception","pas-ins":"Insight","pas-inv":"Investigation"}; if(map[key]){ spec="g:"+map[key]; label=map[key]; } }
  return spec ? '<p class="bk-about"><button type="button" class="lk" data-info="'+esc(spec)+'">What is '+esc(label)+'?</button></p>' : '';
}
window.__miInfo=function(s){ try{ return infoHTML(s); }catch(e){ return null; } }; window.__miBd=function(k){ try{ return B[k]||null; }catch(e){ return null; } };
function bdHTML(key){
  var b=B[key]; if(!b) return "";
  var rows=b.parts.map(function(p){
    var v = p.raw ? esc(p.v) : sg(p.v);
    var cls = p.raw ? "" : (p.v<0?" neg":(p.v===0?" zero":""));
    return '<div class="bk-r"><b>'+esc(p.l)+'</b>'+(p.note?'<small>'+esc(p.note)+'</small>':'')+'<span class="v'+cls+'">'+v+'</span></div>';
  }).join("");
  return '<div class="bk">'+rows+'</div><div class="bk-t"><span>'+(b.totalLabel||"Total")+'</span><b>'+esc(b.total)+'</b></div>'+(b.f?'<p class="bk-f">'+b.f+'</p>':'')+(key==="hp"?hpModH():'')+bdAbout(key)+
    (/^sense-/.test(key)?'<p class="bk-f" style="color:var(--faint)">Set by the builder. Change it there, then Apply.</p>':(cuqOf(key)?'<p class="bk-f" style="color:var(--faint)">To set your own number, turn on Edit mode and tap it.</p>':'<p class="bk-f" style="color:var(--faint)">Change any of these in Edit.</p>'));
}
function showBD(key){ if(!B[key]) return; showEntry({type:"bd",key:key},false); }

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

/* ================= DETAIL (info) BUILDERS ================= */
function meta(c,s){ return '<div class="info-meta">'+(c?'<span class="info-cat">'+esc(c)+'</span>':'')+(s?'<span class="src">'+esc(s)+'</span>':'')+'</div>'; }
function tileBd(label,val,bd){ return '<button type="button" class="tile bd" data-bd="'+bd+'"><span class="k">'+label+'</span><span class="v" style="font-size:24px">'+val+'</span></button>'; }
function tileH(label,html){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:15px">'+html+'</span></div>'; }
function tileS(label,val){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:'+(String(val).length>8?'15px':'24px')+'">'+esc(val)+'</span></div>'; }
function featSpec(name){ var fs=C.features||[]; for(var g=0;g<fs.length;g++){ var it=fs[g].items||[]; for(var f=0;f<it.length;f++){ if(it[f].n===name) return "f:"+g+"."+f; } } return null; }
function grpSpec(kind){
  var fs=C.features||[], want={species:/species/i, bg:/background/i}[kind];
  for(var g=0;g<fs.length;g++){ var n=fs[g].g||"";
    if(want && want.test(n)) return "grp:"+g;
    if(kind==="class" && C.cls && n.trim().toLowerCase()===C.cls.trim().toLowerCase()) return "grp:"+g;
    if(kind==="sub" && C.sub && n.toLowerCase().indexOf(C.sub.toLowerCase())>=0) return "grp:"+g; }
  return null;
}
function resSpec(r){ if(r.k==="hd"||r.n==="Hit Dice") return "g:Hit Point Dice"; if(GLOSS[r.n]) return "g:"+r.n; return featSpec(r.f||r.n)||featSpec(r.n); }
function linkify(text){
  return esc(text).split(/(,\s*)/).map(function(part){
    var raw=part.replace(/&#39;/g,"'"), base=raw.replace(/\s*\(.*\)\s*$/,"").trim();
    return GLOSS[base] ? '<button type="button" class="lk" data-info="g:'+esc(base)+'">'+part+'</button>' : part;
  }).join("");
}
function actTitle(n){
  var special={"Attack with Dagger and Celurit":"g:Nick","Attack with Dagger and Sickle":"g:Nick","Grapple, then Celurit":"f:3.2","Utilize: Healer's Kit":"g:Healer's Kit","Release a Grapple":"g:Grappled"};
  if(n.indexOf(",")>=0) return n.split(/,\s*/).map(function(x){ return GLOSS[x]?'<button type="button" class="tx" data-info="g:'+esc(x)+'">'+esc(x)+'</button>':esc(x); }).join(", ");
  var spec = special[n] || (GLOSS[n]?"g:"+n:featSpec(n));
  return spec ? '<button type="button" class="tx" data-info="'+esc(spec)+'">'+esc(n)+'</button>' : esc(n);
}
var NUM_MAP={"Armor Class":"ac","Initiative":"init","Speed":"speed","Proficiency Bonus":"pb","Hit Points":"hp","Carrying Capacity":"carry","Grapple":"dc","Shove":"dc","Passive Perception":"pas-per"};
