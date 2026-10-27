/* === M pack: what the map asked for. Conditions in rolls, Concentration prompt, school and damage-type effects, weapon streaks,
   rounds, 4d6 in the builder, coins, XP, equip and attune sounds, journal, roll sharing, dice looks, phone tilt, pattern labels, heartbeat === */
(function(){
  var MI=window.__MI; if(!MI||!document.body.animate) return;
  var D=document, FINE=matchMedia("(hover: hover) and (pointer: fine)");
  function full(){ return MI.full(); }
  function calm(){ return MI.rm()||MI.mode==="off"; }
  function nf(fn){ (window.__miNF||setTimeout)(fn); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function vis(e){ return e&&e.getClientRects().length; }
  function esc(t){ return String(t).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function fx(cls,html,ms){ var e=D.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; D.body.appendChild(e); setTimeout(function(){ rm(e); },ms||2300); return e; }
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function st(){ try{ return window.__sheetState?window.__sheetState():null; }catch(e){ return null; } }
  function who(){ var s=st(); return (s&&s.C&&s.C.name)||"char"; }
  function play(k){ if(window.__miSnd) window.__miSnd(k); }
  var MIr=window.__miRoll=window.__miRoll||{};

  /* journal: what happened, kept per character, newest first */
  var J={ key:function(){ return "mi-jr-"+who(); }, all:function(){ try{ return JSON.parse(ls(this.key())||"[]")||[]; }catch(e){ return []; } },
    add:function(kind,txt){ var a=this.all(); a.unshift({t:Date.now(),k:kind,x:txt}); ls(this.key(),JSON.stringify(a.slice(0,400))); } };
  window.__miJournal=J;

  /* conditions that change a d20 roll (2024 rules) */
  function conds(){ var o={}; Array.prototype.forEach.call(D.querySelectorAll('#conds .chip.cnd[data-info^="g:"]'),function(c){ o[c.getAttribute("data-info").slice(2)]=1; }); return o; }
  function condMode(kind){ var c=conds(), adv=[], dis=[], fail=[];
    if(kind==="atk"){ ["Blinded","Frightened","Poisoned","Prone","Restrained"].forEach(function(k){ if(c[k]) dis.push(k); }); if(c.Invisible) adv.push("Invisible"); }
    if(kind==="chk"){ ["Frightened","Poisoned"].forEach(function(k){ if(c[k]) dis.push(k); }); }
    if(kind==="save"){ if(c.Restrained) dis.push("Restrained (DEX)"); ["Paralyzed","Petrified","Stunned","Unconscious"].forEach(function(k){ if(c[k]) fail.push(k); }); }
    return {adv:adv,dis:dis,fail:fail,mode:adv.length&&!dis.length?"adv":dis.length&&!adv.length?"dis":""}; }
  function kindOf(k){ return /^(ah-|spatk$)/.test(k)?"atk":/^save-/.test(k)?"save":/^(sk-|ab-|init$)/.test(k)?"chk":""; }
  MIr.hint=function(k){ var kd=kindOf(k); if(!kd) return null; var m=condMode(kd); if(kd==="save"&&!/^save-(STR|DEX)$/.test(k)) m.fail=[]; if(kd==="save"&&k!=="save-DEX") m.dis=m.dis.filter(function(x){ return !/DEX/.test(x); }), m.mode=m.dis.length?"dis":m.adv.length?"adv":"";
    if(!m.adv.length&&!m.dis.length&&!m.fail.length) return null; return m; };

  /* damage types and weapons for the roll overlay */
  var DT={Fire:"255,120,40",Cold:"140,210,255",Lightning:"170,170,255",Thunder:"150,160,220",Poison:"110,210,90",Acid:"170,230,60",Necrotic:"120,200,140",Radiant:"255,226,130",Force:"200,140,255",Psychic:"255,120,210",Bludgeoning:"220,200,170",Piercing:"200,210,225",Slashing:"230,220,215"};
  MIr.dtype=function(txt){ var m=/(Fire|Cold|Lightning|Thunder|Poison|Acid|Necrotic|Radiant|Force|Psychic|Bludgeoning|Piercing|Slashing)/.exec(txt||""); return m?m[1]:""; };
  MIr.fxDamage=function(type){ if(calm()||!type) return; var rgb=DT[type]||"255,255,255", cx=innerWidth/2, cy=innerHeight*.42;
    if(type==="Slashing"||type==="Piercing"||type==="Bludgeoning"){ weapon(type,cx,cy); return; }
    var n=type==="Lightning"?6:22; for(var i=0;i<n;i++){ (function(i){ var e=fx("mi-dt mi-dt-"+type.toLowerCase(),"",1700), a=Math.random()*Math.PI*2, d=60+Math.random()*160, s=.5+Math.random()*1.1;
        e.style.setProperty("--c",rgb);
        if(type==="Lightning"){ e.animate([{transform:"translate("+(cx+(Math.random()-.5)*300)+"px,"+(cy-220)+"px) scaleY(0)",opacity:1},{transform:"translate("+(cx+(Math.random()-.5)*300)+"px,"+(cy-220)+"px) scaleY(1)",opacity:1,offset:.2},{opacity:0}],{duration:420,delay:i*70,easing:"ease-out",fill:"backwards"}).onfinish=function(){ rm(e); }; return; }
        var up=type==="Fire"||type==="Radiant"||type==="Necrotic"?-1:1;
        e.animate([{transform:"translate("+cx+"px,"+cy+"px) scale(.2)",opacity:0},{transform:"translate("+(cx+Math.cos(a)*d*.5)+"px,"+(cy+Math.sin(a)*d*.5)+"px) scale("+s+")",opacity:1,offset:.3},{transform:"translate("+(cx+Math.cos(a)*d)+"px,"+(cy+Math.sin(a)*d*.6+up*60)+"px) scale("+(s*.4)+")",opacity:0}],{duration:900+Math.random()*500,delay:Math.random()*120,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards"}).onfinish=function(){ rm(e); }; })(i); }
    var f=fx("mi-dtf","",1200); f.style.background="radial-gradient(60% 50% at 50% 42%,rgba("+rgb+",.35),transparent 70%)"; f.animate([{opacity:0},{opacity:1,offset:.25},{opacity:0}],{duration:900}).onfinish=function(){ rm(f); }; };
  function weapon(type,cx,cy){ var e=fx("mi-slash mi-slash-"+type.toLowerCase(),"",1300);
    if(type==="Bludgeoning"){ e.style.left=cx+"px"; e.style.top=cy+"px"; e.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:.9},{transform:"translate(-50%,-50%) scale(2.6)",opacity:0}],{duration:620,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=function(){ rm(e); }; return; }
    var ang=type==="Piercing"?0:-28; e.style.left=(cx-200)+"px"; e.style.top=cy+"px";
    e.animate([{transform:"rotate("+ang+"deg) scaleX(0)",opacity:1},{transform:"rotate("+ang+"deg) scaleX(1)",opacity:1,offset:.45},{transform:"rotate("+ang+"deg) scaleX(1) translateX(40px)",opacity:0}],{duration:520,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ rm(e); }; }

  /* I1 cast: an effect for each school of magic */
  var SCHFX={Evocation:"255,110,40",Abjuration:"90,170,255",Conjuration:"242,193,78",Divination:"220,230,240",Enchantment:"255,111,177",Illusion:"169,139,255",Necromancy:"111,208,140",Transmutation:"58,214,198"};
  function schoolFx(sch,x,y){ if(calm()) return; var rgb=SCHFX[sch]||"170,140,255";
    var g=fx("mi-sch mi-sch-"+sch.toLowerCase(),'<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88"/><circle cx="100" cy="100" r="70" class="d"/><path d="'+(sch==="Abjuration"?"M100 22l68 39v78l-68 39-68-39V61z":sch==="Divination"?"M20 100c25-34 55-50 80-50s55 16 80 50c-25 34-55 50-80 50S45 134 20 100zM100 78a22 22 0 1 0 0 44 22 22 0 1 0 0-44":sch==="Transmutation"?"M100 20l70 120H30zM100 180L30 60h140z":sch==="Necromancy"?"M100 30a50 50 0 0 0-30 90v20h60v-20a50 50 0 0 0-30-90zM82 90a8 8 0 1 0 0 1M118 90a8 8 0 1 0 0 1":sch==="Enchantment"?"M100 160s-60-35-60-80a32 32 0 0 1 60-15 32 32 0 0 1 60 15c0 45-60 80-60 80z":sch==="Illusion"?"M100 20l20 60 60 20-60 20-20 60-20-60-60-20 60-20z":sch==="Conjuration"?"M100 30a70 70 0 1 1-1 0M100 60a40 40 0 1 1-1 0":"M100 15l14 60 56-20-40 45 40 45-56-20-14 60-14-60-56 20 40-45-40-45 56 20z")+'"/></svg>',1900);
    g.style.setProperty("--c",rgb); g.style.left=x+"px"; g.style.top=y+"px";
    g.animate([{transform:"translate(-50%,-50%) scale(.2) rotate(-60deg)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(0)",opacity:1,offset:.4},{transform:"translate(-50%,-50%) scale(1.5) rotate(40deg)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); };
    for(var i=0;i<14;i++){ (function(){ var p=fx("mi-schp","",1600), a=Math.random()*Math.PI*2, d=40+Math.random()*110; p.style.setProperty("--c",rgb);
      p.animate([{transform:"translate("+x+"px,"+y+"px) scale(.4)",opacity:0},{transform:"translate("+(x+Math.cos(a)*d*.4)+"px,"+(y+Math.sin(a)*d*.4)+"px) scale(1)",opacity:1,offset:.3},{transform:"translate("+(x+Math.cos(a)*d)+"px,"+(y+Math.sin(a)*d-(sch==="Necromancy"||sch==="Evocation"?50:0))+"px) scale(.3)",opacity:0}],{duration:900+Math.random()*500,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards",delay:Math.random()*150}).onfinish=function(){ rm(p); }; })(); } }
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-qcast]"); if(!b||!full()) return; var row=b.closest(".sp-r")||(b.previousElementSibling&&b.previousElementSibling.classList.contains("sp-r")?b.previousElementSibling:null), sch=row&&row.getAttribute("data-sch"); if(!sch) return; var r=b.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    var nm=row.querySelector(".sp-n b"); J.add("cast","Cast "+((nm&&nm.firstChild&&nm.firstChild.nodeValue)||"a spell").trim()); setTimeout(function(){ schoolFx(sch,x,y); },60); },true);

  /* Concentration: a hit while concentrating asks for the save, with its DC and a Roll button */
  var cp=null;
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#dmgBtn"); if(!b) return; var amt=+((D.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return; var vc=D.getElementById("vbConc"); if(!vc||vc.hidden) return;
    setTimeout(function(){ conPrompt(Math.max(10,Math.floor(amt/2))); },700); },true);
  function conPrompt(dc){ rm(cp); var sv=D.querySelector('#saves [data-bd="save-CON"]'), bon=sv?parseInt((sv.textContent||"").replace(/−/,"-"),10)||0:0;
    cp=D.createElement("div"); cp.className="mi-cp"; cp.setAttribute("role","dialog"); cp.setAttribute("aria-label","Concentration save");
    cp.innerHTML='<b>Concentration</b><span>Constitution save, DC '+dc+'</span><div><button type="button" class="mi-rb pri" data-cpr="1">Roll d20 '+(bon<0?"−"+(-bon):"+"+bon)+'</button><button type="button" class="mi-rb" data-cpx="1">Later</button></div><p class="mi-cpr" aria-live="polite"></p>'; D.body.appendChild(cp);
    if(!calm()) cp.animate([{opacity:0,transform:"translate(-50%,16px) scale(.96)"},{opacity:1,transform:"translate(-50%,0)"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"});
    var tm=setTimeout(function(){ close(); },14000);
    function close(){ clearTimeout(tm); var c=cp; cp=null; if(!c) return; if(calm()){ rm(c); return; } c.animate([{opacity:1},{opacity:0,transform:"translate(-50%,10px)"}],{duration:220}).onfinish=function(){ rm(c); }; }
    cp.addEventListener("click",function(e){ if(e.target.closest("[data-cpx]")){ close(); return; } if(e.target.closest("[data-cpr]")&&MIr.roll){ var r=MIr.roll({bon:bon},"","Concentration save (DC "+dc+")"), ok=r.v>=dc;
        cp.querySelector(".mi-cpr").innerHTML='<strong class="'+(ok?"ok":"bad")+'">'+r.v+'</strong> '+(ok?"Concentration holds":"Concentration is broken"); J.add("conc","Concentration save "+r.v+" vs DC "+dc+(ok?", held":", broken")); clearTimeout(tm); tm=setTimeout(close,4000); } }); }

  /* I14 rounds in Combat View */
  function rnd(){ try{ return +(sessionStorage.getItem("mi-rnd-"+who())||1); }catch(e){ return 1; } }
  function setRnd(n){ try{ sessionStorage.setItem("mi-rnd-"+who(),n); }catch(e){} chip(); }
  function chip(){ var h=D.getElementById("sheetHead"), sh=D.getElementById("sheet"); if(!h||!sh||!sh.classList.contains("on")||!D.querySelector("#sheetBody .cmb")){ return; } var c=h.querySelector(".mi-rnd");
    if(!c){ c=D.createElement("span"); c.className="mi-rnd"; c.innerHTML='<b></b><button type="button" class="mi-rndr" aria-label="Start a new combat">↺</button>'; var t=D.getElementById("sheetTitle"); (t||h).appendChild(c); }
    c.querySelector("b").textContent="Round "+rnd(); }
  var shE=D.getElementById("sheet"); if(shE) new MutationObserver(function(){ nf(chip); }).observe(shE,{attributes:true,attributeFilter:["class"]});
  var sbE=D.getElementById("sheetBody"); if(sbE) new MutationObserver(function(){ var h=D.getElementById("sheetHead"); if(h&&!D.querySelector("#sheetBody .cmb")){ var c=h.querySelector(".mi-rnd"); if(c) rm(c); } else chip(); }).observe(sbE,{childList:true});
  addEventListener("click",function(e){ var r=e.target.closest&&e.target.closest(".mi-rndr"); if(r){ e.stopPropagation(); e.preventDefault(); setRnd(1); J.add("combat","New combat"); return; }
    var b=e.target.closest&&e.target.closest("#sheet button,[data-ppcturn]"); if(!b||!/^\s*End Turn\s*$/i.test(b.textContent||"")) return; var n=rnd()+1; setTimeout(function(){ setRnd(n); var c=D.querySelector(".mi-rnd b"); if(c&&!calm()) c.animate([{transform:"scale(1.4)",color:"#ffd36b"},{transform:"none"}],{duration:500,easing:"cubic-bezier(.3,1.5,.5,1)"}); },60); J.add("combat","Round "+n); },true);

  /* 4d6, drop the lowest, for every ability in the builder */
  function d6(){ return 1+Math.floor(Math.random()*6); }
  function abilBtn(){ var sel=D.querySelector('#bld select[data-method]'); if(!vis(sel)) return; var have=sel.parentNode.querySelector(".mi-4d6"); if(sel.value!=="manual"){ rm(have); return; } if(have) return;
    var b=D.createElement("button"); b.type="button"; b.className="mi-4d6 mi-rb pri"; b.innerHTML='Roll 4d6 for every ability'; sel.parentNode.insertBefore(b,sel.nextSibling); }
  var bl=D.getElementById("bld"); if(bl){ var aq=0; new MutationObserver(function(){ if(!aq){ aq=1; nf(function(){ aq=0; abilBtn(); }); } }).observe(bl,{childList:true,subtree:true}); }
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest(".mi-4d6"); if(!b) return; e.preventDefault(); e.stopPropagation(); var AB=["STR","DEX","CON","INT","WIS","CHA"], i=0, log=[];
    (function next(){ if(i>=AB.length){ J.add("build","Rolled abilities: "+log.join(", ")); return; } var k=AB[i++], inp=D.querySelector('#bld input[data-b="base.'+k+'"]'); if(!inp){ next(); return; }
      var r=[d6(),d6(),d6(),d6()], lo=Math.min.apply(null,r), tot=r.reduce(function(a,b){ return a+b; },0)-lo, q=inp.getBoundingClientRect(); log.push(k+" "+tot); play("dice");
      if(!calm()){ var g=fx("mi-4d",r.map(function(v){ return '<i class="'+(v===lo?"lo":"")+'">'+v+'</i>'; }).join(""),1500); g.style.left=(q.left+q.width/2)+"px"; g.style.top=(q.top-8)+"px";
        g.animate([{transform:"translate(-50%,-100%) translateY(20px) scale(.6)",opacity:0},{transform:"translate(-50%,-100%) scale(1)",opacity:1,offset:.3},{transform:"translate(-50%,-100%)",opacity:1,offset:.75},{transform:"translate(-50%,-100%) translateY(-10px)",opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); }; }
      setTimeout(function(){ var n=D.querySelector('#bld input[data-b="base.'+k+'"]')||inp; n.value=tot; n.dispatchEvent(new Event("input",{bubbles:true})); n.dispatchEvent(new Event("change",{bubbles:true})); setTimeout(next,calm()?40:260); },calm()?0:420); })(); },true);

  /* coins and XP: numbers move, a coin sound */
  function coinTot(){ var t=0; Array.prototype.forEach.call(D.querySelectorAll("#invBody .icn b"),function(b){ t+=parseFloat(b.textContent)||0; }); return t; }
  var ib=D.getElementById("invBody"), cPrev=null; if(ib){ cPrev=coinTot(); new MutationObserver(function(){ var t=coinTot(); if(cPrev!=null&&t!==cPrev){ var up=t>cPrev; play(up?"coin":"click");
      if(full()){ Array.prototype.forEach.call(D.querySelectorAll("#invBody .icn"),function(c){ if(!vis(c)) return; c.animate([{transform:"none"},{transform:"translateY(-6px) scale(1.12)",offset:.35},{transform:"none"}],{duration:480,easing:"cubic-bezier(.3,1.5,.5,1)"}); });
        var box=D.querySelector("#invBody .icoins"); if(vis(box)){ var r=box.getBoundingClientRect(); for(var i=0;i<(up?10:4);i++){ (function(i){ var c=fx("mi-cn","",1400), x=r.left+r.width*(.2+Math.random()*.6);
          c.animate(up?[{transform:"translate("+x+"px,"+(r.top-80)+"px) rotateY(0)",opacity:0},{transform:"translate("+x+"px,"+(r.top-40)+"px) rotateY(360deg)",opacity:1,offset:.4},{transform:"translate("+x+"px,"+(r.top+r.height/2)+"px) rotateY(720deg)",opacity:0}]:[{transform:"translate("+x+"px,"+(r.top+r.height/2)+"px)",opacity:1},{transform:"translate("+x+"px,"+(r.top-60)+"px) rotateY(540deg)",opacity:0}],{duration:800,delay:i*60,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards"}).onfinish=function(){ rm(c); }; })(i); } } }
      J.add("coin","Coins "+(up?"+":"")+(Math.round((t-cPrev)*100)/100)); } cPrev=t; }).observe(ib,{childList:true}); }
  var xpv=null; function xpNow(){ var x=D.querySelector(".xpbar"); return x?+x.getAttribute("aria-valuenow"):null; }
  function xpWatch(){ var x=D.querySelector(".xpbar"); if(!x||x.__mi) return; x.__mi=1; xpv=xpNow(); new MutationObserver(function(){ var v=xpNow(); if(xpv!=null&&v>xpv){ play("coin"); if(full()){ var i=x.querySelector("i"); if(i) i.animate([{filter:"brightness(1)"},{filter:"brightness(1.8)"},{filter:"brightness(1)"}],{duration:700}); } } xpv=v; }).observe(x,{attributes:true,attributeFilter:["aria-valuenow"]}); }
  xpWatch(); var idc=D.querySelector("#app .idcard"); if(idc&&idc.parentNode) new MutationObserver(function(){ nf(xpWatch); }).observe(idc.parentNode,{childList:true,subtree:true});

  /* sounds for equip, attune, an empty slot row, Heroic Inspiration; journal for HP and conditions */
  addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest(".ichk[data-ieqs],.insp,.spsl .bx,#dmgBtn,#healBtn"); if(!t) return;
    if(t.matches(".ichk")){ var row=t.closest(".irow"); play(row&&/armor|shield/i.test(row.textContent)?"armor":"blade"); }
    else if(t.matches(".insp")) play("chime");
    else if(t.matches(".spsl .bx")) play("crystal");
    else { var amt=+((D.getElementById("hpAmt")||{}).value||0); if(amt>0) J.add(t.id==="healBtn"?"heal":"hurt",(t.id==="healBtn"?"Healed ":"Took ")+amt+(t.id==="healBtn"?" HP":" damage")); } },true);
  var cdE=D.getElementById("conds"), cSet=null; function cNow(){ return Object.keys(conds()).sort().join("|"); }
  if(cdE){ cSet=cNow(); new MutationObserver(function(){ var n=cNow(); if(cSet!==null&&n!==cSet){ var a=n?n.split("|"):[], b=cSet?cSet.split("|"):[]; a.filter(function(x){ return b.indexOf(x)<0; }).forEach(function(x){ J.add("cond","Became "+x); play("cond"); }); b.filter(function(x){ return a.indexOf(x)<0; }).forEach(function(x){ J.add("cond","No longer "+x); }); } cSet=n; }).observe(cdE,{childList:true}); }
  var W=window.__miWow; if(W){ if(W.rest){ var r0=W.rest; W.rest=function(k){ r0.apply(this,arguments); J.add("rest",k==="long"?"Long Rest":"Short Rest"); }; } if(W.level){ var l0=W.level; W.level=function(){ l0.apply(this,arguments); J.add("level","Level up"); }; } }

  /* heartbeat when Hit Points fall to a quarter or less */
  function hpPct(){ var c=D.getElementById("hpCur"), m=D.getElementById("hpMax"); var a=c?parseInt((c.textContent||"").replace(/[^\d-]/g,""),10):NaN, b=m?parseInt((m.textContent||"").replace(/[^\d]/g,""),10):NaN; return a>=0&&b>0?a/b:null; }
  var hpLow=null, hpE=D.getElementById("hpBox"); if(hpE){ hpLow=(hpPct()||1)<=.25; new MutationObserver(function(){ var p=hpPct(); if(p==null) return; var low=p>0&&p<=.25; if(low&&!hpLow){ play("heart"); if(MI.bz!=="off"&&navigator.vibrate) try{ navigator.vibrate([60,90,60]); }catch(er){} J.add("hurt","Badly hurt"); } hpLow=low; }).observe(hpE,{childList:true,subtree:true,characterData:true}); }

  /* phone tilt: the cards lean a little with the phone. Off unless turned on in Settings */
  var tilt=null; function tiltOn(){ return (ls("mi-gyro")||"off")==="on"; }
  function tiltSet(on){ if(on&&!tilt&&window.DeviceOrientationEvent&&!FINE.matches){ var bx=0,by=0,q=0; tilt=function(e){ if(e.beta==null) return; bx=Math.max(-1,Math.min(1,(e.gamma||0)/30)); by=Math.max(-1,Math.min(1,((e.beta||0)-40)/30)); if(!q){ q=1; requestAnimationFrame(function(){ q=0; var a=D.getElementById("app"); if(a){ a.style.setProperty("--gx",(bx*4).toFixed(1)+"px"); a.style.setProperty("--gy",(by*4).toFixed(1)+"px"); } }); } };
      var go=function(){ addEventListener("deviceorientation",tilt,{passive:true}); D.documentElement.classList.add("mi-gyro"); };
      if(typeof DeviceOrientationEvent.requestPermission==="function") DeviceOrientationEvent.requestPermission().then(function(r){ if(r==="granted") go(); }).catch(function(){}); else go(); }
    if(!on&&tilt){ removeEventListener("deviceorientation",tilt); tilt=null; D.documentElement.classList.remove("mi-gyro"); } }
  if(tiltOn()) tiltSet(true);

  /* settings: dice look, phone tilt, pattern labels */
  function dice(){ return ls("mi-dice-"+who())||"class"; }
  function applyPrefs(){ D.documentElement.setAttribute("data-mi-dice",dice()); D.documentElement.classList.toggle("mi-pat",(ls("mi-pat")||"off")==="on"); }
  applyPrefs();
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-midice],[data-migyro],[data-mipat]"); if(!b) return;
    if(b.hasAttribute("data-midice")) ls("mi-dice-"+who(),b.getAttribute("data-midice")); if(b.hasAttribute("data-migyro")){ ls("mi-gyro",b.getAttribute("data-migyro")); tiltSet(b.getAttribute("data-migyro")==="on"); } if(b.hasAttribute("data-mipat")) ls("mi-pat",b.getAttribute("data-mipat"));
    var a=b.attributes[0]&&Array.prototype.filter.call(b.attributes,function(x){ return /^data-mi(dice|gyro|pat)$/.test(x.name); })[0]; if(a) Array.prototype.forEach.call(D.querySelectorAll("["+a.name+"]"),function(x){ var on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on); });
    applyPrefs(); play("click"); },true);
  window.__miPrefH=function(){ var g=function(k,d){ return ls(k)||d; }, B=function(a,v,cur,l){ var on=cur===v; return '<button type="button" class="thb'+(on?" on":"")+'" '+a+'="'+v+'" aria-pressed="'+on+'">'+l+'</button>'; }, dc=dice();
    return '<div class="info-h">Dice</div><div class="thg">'+B("data-midice","class",dc,"Class colour")+B("data-midice","metal",dc,"Metal")+B("data-midice","crystal",dc,"Crystal")+B("data-midice","bone",dc,"Bone")+'</div><p class="info-d">For this character.</p>'+
      (FINE.matches?'':'<div class="info-h">Tilt with phone</div><div class="thg">'+B("data-migyro","on",g("mi-gyro","off"),"On")+B("data-migyro","off",g("mi-gyro","off"),"Off")+'</div><p class="info-d">The cards lean a little as you tilt the phone.</p>')+
      '<div class="info-h">Pattern labels</div><div class="thg">'+B("data-mipat","on",g("mi-pat","off"),"On")+B("data-mipat","off",g("mi-pat","off"),"Off")+'</div><p class="info-d">Short labels next to colours: spell schools and item rarity, so nothing depends on colour alone.</p>'; };
})();

