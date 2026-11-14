/* === M pack: what the map asked for. Conditions in rolls, Concentration prompt, school and damage-type effects, weapon streaks,
   rounds, 4d6 in the builder, coins, XP, equip and attune sounds, journal, roll sharing, dice looks, phone tilt, pattern labels, heartbeat === */
const FXS18A={};
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS18A.calm=function calm(){ return MI.rm()||MI.mode==="off"; };
  FXS18A.who=function who(){ const s=st(); return (s&&s.C&&s.C.name)||"char"; };
  FXS18A.conPrompt=function conPrompt(dc){ rm(FXS18A.cp); const sv=FXS18A.D.querySelector('#saves [data-bd="save-CON"]'), bon=sv?parseInt((sv.textContent||"").replace(/−/,"-"),10)||0:0;
    FXS18A.cp=FXS18A.D.createElement("div"); FXS18A.cp.className="mi-cp"; FXS18A.cp.setAttribute("role","dialog"); FXS18A.cp.setAttribute("aria-label","Concentration save");
    FXS18A.cp.innerHTML='<b>Concentration</b><span>Constitution save, DC '+dc+'</span><div><button type="button" class="mi-rb pri" data-cpr="1">Roll d20 '+(bon<0?"−"+(-bon):"+"+bon)+'</button><button type="button" class="mi-rb" data-cpx="1">Later</button></div><p class="mi-cpr" aria-live="polite"></p>'; FXS18A.D.body.appendChild(FXS18A.cp);
    if(!FXS18A.calm()) FXS18A.cp.animate([{opacity:0,transform:"translate(-50%,16px) scale(.96)"},{opacity:1,transform:"translate(-50%,0)"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"});
    let tm=setTimeout(() =>{ close(); },14000);
    function close(){ clearTimeout(tm); const c=FXS18A.cp; FXS18A.cp=null; if(!c) return; if(FXS18A.calm()){ rm(c); return; } c.animate([{opacity:1},{opacity:0,transform:"translate(-50%,10px)"}],{duration:220}).onfinish=function(){ rm(c); }; }
    FXS18A.cp.addEventListener("click",(e) =>{ if(e.target.closest("[data-cpx]")){ close(); return; } if(e.target.closest("[data-cpr]")&&FXS18A.MIr.roll){ clearTimeout(tm); FXS18A.MIr.roll({bon:bon},"","Concentration save (DC "+dc+")",(r) =>{ const ok=r.v>=dc;/* T11 D2: the roll may wait for the 3D dice */
        FXS18A.cp.querySelector(".mi-cpr").innerHTML='<strong class="'+(ok?"ok":"bad")+'">'+r.v+'</strong> '+(ok?"Concentration holds":"Concentration is broken"); FXS18A.J.add("conc","Concentration save "+r.v+" vs DC "+dc+(ok?", held":", broken")); clearTimeout(tm); tm=setTimeout(close,4000); }); } }); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;

  /* I14 rounds in Combat View */
  FXS18A.rnd=function rnd(){ try{ return +(sessionStorage.getItem("mi-rnd-"+FXS18A.who())||1); }catch(e){ return 1; } };;
  FXS18A.chip=function chip(){ const h=FXS18A.D.getElementById("sheetHead"), sh=FXS18A.D.getElementById("sheet"); if(!h||!sh||!sh.classList.contains("on")||!FXS18A.D.querySelector("#sheetBody .cmb")){ return; } let c=h.querySelector(".mi-rnd");
    if(!c){ c=FXS18A.D.createElement("span"); c.className="mi-rnd"; c.innerHTML='<b></b><button type="button" class="mi-rndr" aria-label="Start a new combat">↺</button>'; const t=FXS18A.D.getElementById("sheetTitle"); (t||h).appendChild(c); }
    c.querySelector("b").textContent="Round "+FXS18A.rnd(); };
  FXS18A.D=document; FXS18A.FINE=matchMedia("(hover: hover) and (pointer: fine)");
  FXS18A.full=function full(){ return MI.full(); };;
  FXS18A.play=function play(k){ if(FXENV.__miSnd) FXENV.__miSnd(k); };;
  FXS18A.MIr=FXENV.__miRoll=FXENV.__miRoll||{};

  /* journal: what happened, kept per character, newest first */
  FXS18A.J={ key:function(){ return "mi-jr-"+FXS18A.who(); }, all:function(){ try{ return JSON.parse(ls(this.key())||"[]")||[]; }catch(e){ return []; } },
    add:function(kind,txt){ const a=this.all(); a.unshift({t:Date.now(),k:kind,x:txt}); ls(this.key(),JSON.stringify(a.slice(0,400))); } };
  FXENV.__miJournal=FXS18A.J;

  /* conditions that change a d20 roll (2024 rules) */
  FXS18A.conds=function conds(){ const o={}; Array.prototype.forEach.call(FXS18A.D.querySelectorAll('#conds .chip.cnd[data-info^="g:"]'),(c) =>{ o[c.getAttribute("data-info").slice(2)]=1; }); return o; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS18A.condMode=function condMode(kind){ const c=FXS18A.conds(), adv=[], dis=[], fail=[];
    if(kind==="atk"){ ["Blinded","Frightened","Poisoned","Prone","Restrained"].forEach((k) =>{ if(c[k]) dis.push(k); }); if(c.Invisible) adv.push("Invisible"); }
    if(kind==="chk"){ ["Frightened","Poisoned"].forEach((k) =>{ if(c[k]) dis.push(k); }); }
    if(kind==="save"){ if(c.Restrained) dis.push("Restrained (DEX)"); ["Paralyzed","Petrified","Stunned","Unconscious"].forEach((k) =>{ if(c[k]) fail.push(k); }); }
    return {adv:adv,dis:dis,fail:fail,mode:adv.length&&!dis.length?"adv":dis.length&&!adv.length?"dis":""}; };;
  FXS18A.kindOf=function kindOf(k){ return /^(ah-|spatk(?:$|-[A-Z]{3}$|-source-))/.test(k)?"atk":/^save-/.test(k)?"save":/^(sk-|ab-|init$)/.test(k)?"chk":""; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS18A.iounCheckHint=function iounCheckHint(key){if(!/^(sk-[0-9]+|init)$/.test(key)||typeof FXENV.__iounOrbitCheckRoll!=="function")return null;try{const check=FXENV.__iounOrbitCheckRoll(key);return check?{adv:check.adv,dis:check.dis,fail:check.fail,mode:check.mode}:null}catch(error){return null}};
  FXS18A.MIr.hint=function(k){ const source=FXS18A.iounCheckHint(k);if(source)return source; const kd=FXS18A.kindOf(k); if(!kd) return null; const m=FXS18A.condMode(kd); if(kd==="save"&&!/^save-(STR|DEX)$/.test(k)) m.fail=[]; if(kd==="save"&&k!=="save-DEX") m.dis=m.dis.filter((x) =>{ return !/DEX/.test(x); }), m.mode=m.dis.length?"dis":m.adv.length?"adv":"";
    if(!m.adv.length&&!m.dis.length&&!m.fail.length) return null; return m; };

  /* damage types and weapons for the roll overlay */
  FXS18A.DT={Fire:"255,120,40",Cold:"140,210,255",Lightning:"170,170,255",Thunder:"150,160,220",Poison:"110,210,90",Acid:"170,230,60",Necrotic:"120,200,140",Radiant:"255,226,130",Force:"200,140,255",Psychic:"255,120,210",Bludgeoning:"220,200,170",Piercing:"200,210,225",Slashing:"230,220,215"};
  FXS18A.MIr.dtype=function(txt){ const m=/(Fire|Cold|Lightning|Thunder|Poison|Acid|Necrotic|Radiant|Force|Psychic|Bludgeoning|Piercing|Slashing)/.exec(txt||""); return m?m[1]:""; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  FXS18A.MIr.fxDamage=function(type){ if(FXS18A.calm()||!type) return; const rgb=FXS18A.DT[type]||"255,255,255", cx=innerWidth/2, cy=innerHeight*.42;
    if(type==="Slashing"||type==="Piercing"||type==="Bludgeoning"){ weapon(type,cx,cy); return; }
    const n=type==="Lightning"?6:22; for(let i=0;i<n;i++){ (function(i){ const e=fx("mi-dt mi-dt-"+type.toLowerCase(),"",1700), a=Math.random()*Math.PI*2, d=60+Math.random()*160, s=.5+Math.random()*1.1;
        e.style.setProperty("--c",rgb);
        if(type==="Lightning"){ e.animate([{transform:"translate("+(cx+(Math.random()-.5)*300)+"px,"+(cy-220)+"px) scaleY(0)",opacity:1},{transform:"translate("+(cx+(Math.random()-.5)*300)+"px,"+(cy-220)+"px) scaleY(1)",opacity:1,offset:.2},{opacity:0}],{duration:420,delay:i*70,easing:"ease-out",fill:"backwards"}).onfinish=function(){ rm(e); }; return; }
        const up=type==="Fire"||type==="Radiant"||type==="Necrotic"?-1:1;
        e.animate([{transform:"translate("+cx+"px,"+cy+"px) scale(.2)",opacity:0},{transform:"translate("+(cx+Math.cos(a)*d*.5)+"px,"+(cy+Math.sin(a)*d*.5)+"px) scale("+s+")",opacity:1,offset:.3},{transform:"translate("+(cx+Math.cos(a)*d)+"px,"+(cy+Math.sin(a)*d*.6+up*60)+"px) scale("+(s*.4)+")",opacity:0}],{duration:900+Math.random()*500,delay:Math.random()*120,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards"}).onfinish=function(){ rm(e); }; })(i); }
    const f=fx("mi-dtf","",1200); f.style.background="radial-gradient(60% 50% at 50% 42%,rgba("+rgb+",.35),transparent 70%)"; f.animate([{opacity:0},{opacity:1,offset:.25},{opacity:0}],{duration:900}).onfinish=function(){ rm(f); }; };
  function weapon(type,cx,cy){ const e=fx("mi-slash mi-slash-"+type.toLowerCase(),"",1300);
    if(type==="Bludgeoning"){ e.style.left=cx+"px"; e.style.top=cy+"px"; e.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:.9},{transform:"translate(-50%,-50%) scale(2.6)",opacity:0}],{duration:620,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=function(){ rm(e); }; return; }
    const ang=type==="Piercing"?0:-28; e.style.left=(cx-200)+"px"; e.style.top=cy+"px";
    e.animate([{transform:"rotate("+ang+"deg) scaleX(0)",opacity:1},{transform:"rotate("+ang+"deg) scaleX(1)",opacity:1,offset:.45},{transform:"rotate("+ang+"deg) scaleX(1) translateX(40px)",opacity:0}],{duration:520,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ rm(e); }; }

  /* I1 cast: an effect for each school of magic */
  FXS18A.SCHFX={Evocation:"255,110,40",Abjuration:"90,170,255",Conjuration:"242,193,78",Divination:"220,230,240",Enchantment:"255,111,177",Illusion:"169,139,255",Necromancy:"111,208,140",Transmutation:"58,214,198"};
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  FXS18A.schoolFx=function schoolFx(sch,x,y){ if(FXS18A.calm()) return; const rgb=FXS18A.SCHFX[sch]||"170,140,255";
    const g=fx("mi-sch mi-sch-"+sch.toLowerCase(),'<svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="88"/><circle cx="100" cy="100" r="70" class="d"/><path d="'+(sch==="Abjuration"?"M100 22l68 39v78l-68 39-68-39V61z":sch==="Divination"?"M20 100c25-34 55-50 80-50s55 16 80 50c-25 34-55 50-80 50S45 134 20 100zM100 78a22 22 0 1 0 0 44 22 22 0 1 0 0-44":sch==="Transmutation"?"M100 20l70 120H30zM100 180L30 60h140z":sch==="Necromancy"?"M100 30a50 50 0 0 0-30 90v20h60v-20a50 50 0 0 0-30-90zM82 90a8 8 0 1 0 0 1M118 90a8 8 0 1 0 0 1":sch==="Enchantment"?"M100 160s-60-35-60-80a32 32 0 0 1 60-15 32 32 0 0 1 60 15c0 45-60 80-60 80z":sch==="Illusion"?"M100 20l20 60 60 20-60 20-20 60-20-60-60-20 60-20z":sch==="Conjuration"?"M100 30a70 70 0 1 1-1 0M100 60a40 40 0 1 1-1 0":"M100 15l14 60 56-20-40 45 40 45-56-20-14 60-14-60-56 20 40-45-40-45 56 20z")+'"/></svg>',1900);
    g.style.setProperty("--c",rgb); g.style.left=x+"px"; g.style.top=y+"px";
    g.animate([{transform:"translate(-50%,-50%) scale(.2) rotate(-60deg)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(0)",opacity:1,offset:.4},{transform:"translate(-50%,-50%) scale(1.5) rotate(40deg)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); };
    for(let i=0;i<14;i++){ (function(){ const p=fx("mi-schp","",1600), a=Math.random()*Math.PI*2, d=40+Math.random()*110; p.style.setProperty("--c",rgb);
      p.animate([{transform:"translate("+x+"px,"+y+"px) scale(.4)",opacity:0},{transform:"translate("+(x+Math.cos(a)*d*.4)+"px,"+(y+Math.sin(a)*d*.4)+"px) scale(1)",opacity:1,offset:.3},{transform:"translate("+(x+Math.cos(a)*d)+"px,"+(y+Math.sin(a)*d-(sch==="Necromancy"||sch==="Evocation"?50:0))+"px) scale(.3)",opacity:0}],{duration:900+Math.random()*500,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards",delay:Math.random()*150}).onfinish=function(){ rm(p); }; })(); } };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-qcast]"); if(!b||!FXS18A.full()) return; const row=b.closest(".sp-r")||(b.previousElementSibling&&b.previousElementSibling.classList.contains("sp-r")?b.previousElementSibling:null), sch=row&&row.getAttribute("data-sch"); if(!sch) return; const r=b.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    const nm=row.querySelector(".sp-n b"); FXS18A.J.add("cast","Cast "+((nm&&nm.firstChild&&nm.firstChild.nodeValue)||"a spell").trim()); setTimeout(() =>{ FXS18A.schoolFx(sch,x,y); },60); },true);

  /* Concentration: a hit while concentrating asks for the save, with its DC and a Roll button */
  FXS18A.cp=null;
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#dmgBtn"); if(!b) return; const amt=+((FXS18A.D.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return; const vc=FXS18A.D.getElementById("vbConc"); if(!vc||vc.hidden) return;
    setTimeout(() =>{ FXS18A.conPrompt(Math.max(10,Math.floor(amt/2))); },700); },true);;
  FXS18A.setRnd=function setRnd(n){ try{ sessionStorage.setItem("mi-rnd-"+FXS18A.who(),n); }catch(e){} FXS18A.chip(); };;
  const shE=FXS18A.D.getElementById("sheet"); if(shE) new MutationObserver(() =>{ nf(FXS18A.chip); }).observe(shE,{attributes:true,attributeFilter:["class"]});
  const sbE=FXS18A.D.getElementById("sheetBody"); if(sbE) new MutationObserver(() =>{ const h=FXS18A.D.getElementById("sheetHead"); if(h&&!FXS18A.D.querySelector("#sheetBody .cmb")){ const c=h.querySelector(".mi-rnd"); if(c) rm(c); } else FXS18A.chip(); }).observe(sbE,{childList:true});
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  addEventListener("click",(e) =>{ const r=e.target.closest&&e.target.closest(".mi-rndr"); if(r){ e.stopPropagation(); e.preventDefault(); FXS18A.setRnd(1); FXS18A.J.add("combat","New combat"); return; }
    const b=e.target.closest&&e.target.closest("#sheet button,[data-ppcturn]"); if(!b||!/^\s*End Turn\s*$/i.test(b.textContent||"")) return; const n=FXS18A.rnd()+1; setTimeout(() =>{ FXS18A.setRnd(n); const c=FXS18A.D.querySelector(".mi-rnd b"); if(c&&!FXS18A.calm()) c.animate([{transform:"scale(1.4)",color:"#ffd36b"},{transform:"none"}],{duration:500,easing:"cubic-bezier(.3,1.5,.5,1)"}); },60); FXS18A.J.add("combat","Round "+n); },true);

  /* 4d6, drop the lowest, for every ability in the builder */
  FXS18A.d6=function d6(){ const a=new Uint32Array(1); try{ crypto.getRandomValues(a); return 1+a[0]%6; }catch(e){ return 1+Math.floor(Math.random()*6); } };;
  function abilBtn(){ const sel=FXS18A.D.querySelector('#bld select[data-method]'); if(!vis(sel)) return; const have=sel.parentNode.querySelector(".mi-4d6"); if(sel.value!=="manual"){ rm(have); return; } if(have) return;
    const b=FXS18A.D.createElement("button"); b.type="button"; b.className="mi-4d6 mi-rb pri"; b.innerHTML='Roll 4d6 for every ability'; sel.parentNode.insertBefore(b,sel.nextSibling); }
  const bl=FXS18A.D.getElementById("bld"); if(bl){ let aq=0; new MutationObserver(() =>{ if(!aq){ aq=1; nf(() =>{ aq=0; abilBtn(); }); } }).observe(bl,{childList:true,subtree:true}); }
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  /* T11 G6 B2: the 24 dice land together on the 3D table (25-dice3d) when effects are on, then each ability takes its four */
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".mi-4d6"); if(!b) return; e.preventDefault(); e.stopPropagation(); if(b.__busy) return; b.__busy=1; let AB=["STR","DEX","CON","INT","WIS","CHA"], i=0, log=[], pool=null;
    const go=function(v){ pool=v&&v.length===24?v.slice():null; b.__busy=0; next(); };
    if(FXENV.__dice3d&&!FXS18A.calm()){ const L=[]; for(let z=0;z<24;z++) L.push(6); FXENV.__dice3d.roll(L).then(go,() =>{ go(null); }); } else go(null);
    function next(){ if(i>=AB.length){ FXS18A.J.add("build","Rolled abilities: "+log.join(", ")); return; } const k=AB[i++], inp=FXS18A.D.querySelector('#bld input[data-b="base.'+k+'"]'); if(!inp){ next(); return; }
      const r=pool?pool.splice(0,4):[FXS18A.d6(),FXS18A.d6(),FXS18A.d6(),FXS18A.d6()], lo=Math.min.apply(null,r), tot=r.reduce((a,b) =>{ return a+b; },0)-lo, q=inp.getBoundingClientRect(); log.push(k+" "+tot); FXS18A.play("dice");
      if(!FXS18A.calm()){ const g=fx("mi-4d",r.map((v) =>{ return '<i class="'+(v===lo?"lo":"")+'">'+v+'</i>'; }).join(""),1500); g.style.left=(q.left+q.width/2)+"px"; g.style.top=(q.top-8)+"px";
        g.animate([{transform:"translate(-50%,-100%) translateY(20px) scale(.6)",opacity:0},{transform:"translate(-50%,-100%) scale(1)",opacity:1,offset:.3},{transform:"translate(-50%,-100%)",opacity:1,offset:.75},{transform:"translate(-50%,-100%) translateY(-10px)",opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); }; }
      setTimeout(() =>{ const n=FXS18A.D.querySelector('#bld input[data-b="base.'+k+'"]')||inp; n.value=tot; n.dispatchEvent(new Event("input",{bubbles:true})); n.dispatchEvent(new Event("change",{bubbles:true})); setTimeout(next,FXS18A.calm()?40:260); },FXS18A.calm()?0:420); } },true);

  /* coins and XP: numbers move, a coin sound */
  FXS18A.coinTot=function coinTot(){ let t=0; Array.prototype.forEach.call(FXS18A.D.querySelectorAll("#invBody .icn b"),(b) =>{ t+=parseFloat(b.textContent)||0; }); return t; };;
  FXS18A.ib=FXS18A.D.getElementById("invBody"); FXS18A.cPrev=null;
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
 if(FXS18A.ib){ FXS18A.cPrev=FXS18A.coinTot(); new MutationObserver(() =>{ const t=FXS18A.coinTot(); if(FXS18A.cPrev!=null&&t!==FXS18A.cPrev){ const up=t>FXS18A.cPrev; FXS18A.play(up?"coin":"click");
      if(FXS18A.full()){ Array.prototype.forEach.call(FXS18A.D.querySelectorAll("#invBody .icn"),(c) =>{ if(!vis(c)) return; c.animate([{transform:"none"},{transform:"translateY(-6px) scale(1.12)",offset:.35},{transform:"none"}],{duration:480,easing:"cubic-bezier(.3,1.5,.5,1)"}); });
        const box=FXS18A.D.querySelector("#invBody .icoins"); if(vis(box)){ const r=box.getBoundingClientRect(); for(let i=0;i<(up?10:4);i++){ (function(i){ const c=fx("mi-cn","",1400), x=r.left+r.width*(.2+Math.random()*.6);
          c.animate(up?[{transform:"translate("+x+"px,"+(r.top-80)+"px) rotateY(0)",opacity:0},{transform:"translate("+x+"px,"+(r.top-40)+"px) rotateY(360deg)",opacity:1,offset:.4},{transform:"translate("+x+"px,"+(r.top+r.height/2)+"px) rotateY(720deg)",opacity:0}]:[{transform:"translate("+x+"px,"+(r.top+r.height/2)+"px)",opacity:1},{transform:"translate("+x+"px,"+(r.top-60)+"px) rotateY(540deg)",opacity:0}],{duration:800,delay:i*60,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards"}).onfinish=function(){ rm(c); }; })(i); } } }
      FXS18A.J.add("coin","Coins "+(up?"+":"")+(Math.round((t-FXS18A.cPrev)*100)/100)); } FXS18A.cPrev=t; }).observe(FXS18A.ib,{childList:true}); }
  FXS18A.xpv=null; FXS18A.xpNow=function xpNow(){ const x=FXS18A.D.querySelector(".xpbar"); return x?+x.getAttribute("aria-valuenow"):null; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  function xpWatch(){ const x=FXS18A.D.querySelector(".xpbar"); if(!x||x.__mi) return; x.__mi=1; FXS18A.xpv=FXS18A.xpNow(); new MutationObserver(() =>{ const v=FXS18A.xpNow(); if(FXS18A.xpv!=null&&v>FXS18A.xpv){ FXS18A.play("coin"); if(FXS18A.full()){ const i=x.querySelector("i"); if(i) i.animate([{filter:"brightness(1)"},{filter:"brightness(1.8)"},{filter:"brightness(1)"}],{duration:700}); } } FXS18A.xpv=v; }).observe(x,{attributes:true,attributeFilter:["aria-valuenow"]}); }
  xpWatch(); const idc=FXS18A.D.querySelector("#app .idcard"); if(idc&&idc.parentNode) new MutationObserver(() =>{ nf(xpWatch); }).observe(idc.parentNode,{childList:true,subtree:true});
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  /* sounds for equip, attune, an empty slot row, Heroic Inspiration; journal for HP and conditions */
  addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest(".ichk[data-ieqs],.insp,.spsl .bx,#dmgBtn,#healBtn"); if(!t) return;
    if(t.matches(".ichk")){ const row=t.closest(".irow"); FXS18A.play(row&&/armor|shield/i.test(row.textContent)?"armor":"blade"); }
    else if(t.matches(".insp")) FXS18A.play("chime");
    else if(t.matches(".spsl .bx")) FXS18A.play("crystal");
    else { const amt=+((FXS18A.D.getElementById("hpAmt")||{}).value||0); if(amt>0) FXS18A.J.add(t.id==="healBtn"?"heal":"hurt",(t.id==="healBtn"?"Healed ":"Took ")+amt+(t.id==="healBtn"?" HP":" damage")); } },true);
  FXS18A.cdE=FXS18A.D.getElementById("conds"); FXS18A.cSet=null; FXS18A.cNow=function cNow(){ return Object.keys(FXS18A.conds()).sort().join("|"); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  if(FXS18A.cdE){ FXS18A.cSet=FXS18A.cNow(); new MutationObserver(() =>{ const n=FXS18A.cNow(); if(FXS18A.cSet!==null&&n!==FXS18A.cSet){ const a=n?n.split("|"):[], b=FXS18A.cSet?FXS18A.cSet.split("|"):[]; a.filter((x) =>{ return b.indexOf(x)<0; }).forEach((x) =>{ FXS18A.J.add("cond","Became "+x); FXS18A.play("cond"); }); b.filter((x) =>{ return a.indexOf(x)<0; }).forEach((x) =>{ FXS18A.J.add("cond","No longer "+x); }); } FXS18A.cSet=n; }).observe(FXS18A.cdE,{childList:true}); }
  const W=FXENV.__miWow; if(W){ if(W.rest){ const r0=W.rest; W.rest=function(k){ r0.apply(this,arguments); FXS18A.J.add("rest",k==="long"?"Long Rest":"Short Rest"); }; } if(W.level){ const l0=W.level; W.level=function(){ l0.apply(this,arguments); FXS18A.J.add("level","Level up"); }; } }

  /* heartbeat when Hit Points fall to a quarter or less */
  FXS18A.hpPct=function hpPct(){ const c=FXS18A.D.getElementById("hpCur"), m=FXS18A.D.getElementById("hpMax"); const a=c?parseInt((c.textContent||"").replace(/[^\d-]/g,""),10):NaN, b=m?parseInt((m.textContent||"").replace(/[^\d]/g,""),10):NaN; return a>=0&&b>0?a/b:null; };;
  FXS18A.hpLow=null; FXS18A.hpE=FXS18A.D.getElementById("hpBox");
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
 if(FXS18A.hpE){ FXS18A.hpLow=(FXS18A.hpPct()||1)<=.25; new MutationObserver(() =>{ const p=FXS18A.hpPct(); if(p==null) return; const low=p>0&&p<=.25; if(low&&!FXS18A.hpLow){ FXS18A.play("heart"); if(MI.bz!=="off"&&navigator.vibrate) try{ navigator.vibrate([60,90,60]); }catch(er){} FXS18A.J.add("hurt","Badly hurt"); } FXS18A.hpLow=low; }).observe(FXS18A.hpE,{childList:true,subtree:true,characterData:true}); }

  /* phone tilt: the cards lean a little with the phone. Off unless turned on in Settings */
  FXS18A.tilt=null; FXS18A.tiltOn=function tiltOn(){ return (ls("mi-gyro")||"off")==="on"; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS18A.tiltSet=function tiltSet(on){ if(on&&!FXS18A.tilt&&FXENV.DeviceOrientationEvent&&!FXS18A.FINE.matches){ let bx=0,by=0,q=0; FXS18A.tilt=function(e){ if(e.beta==null) return; bx=Math.max(-1,Math.min(1,(e.gamma||0)/30)); by=Math.max(-1,Math.min(1,((e.beta||0)-40)/30)); if(!q){ q=1; requestAnimationFrame(() =>{ q=0; const a=FXS18A.D.getElementById("app"); if(a){ a.style.setProperty("--gx",(bx*4).toFixed(1)+"px"); a.style.setProperty("--gy",(by*4).toFixed(1)+"px"); } }); } };
      const go=function(){ addEventListener("deviceorientation",FXS18A.tilt,{passive:true}); FXS18A.D.documentElement.classList.add("mi-gyro"); };
      if(typeof DeviceOrientationEvent.requestPermission==="function") DeviceOrientationEvent.requestPermission().then((r) =>{ if(r==="granted") go(); }).catch(() =>{}); else go(); }
    if(!on&&FXS18A.tilt){ removeEventListener("deviceorientation",FXS18A.tilt); FXS18A.tilt=null; FXS18A.D.documentElement.classList.remove("mi-gyro"); } };;
  if(FXS18A.tiltOn()) FXS18A.tiltSet(true);

  /* settings: dice look, phone tilt, pattern labels */
  FXS18A.dice=function dice(){ return ls("mi-dice-"+FXS18A.who())||"class"; };;
  FXS18A.applyPrefs=function applyPrefs(){ FXS18A.D.documentElement.setAttribute("data-mi-dice",FXS18A.dice()); FXS18A.D.documentElement.classList.toggle("mi-pat",(ls("mi-pat")||"off")==="on"); };;
  FXS18A.applyPrefs();
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-midice],[data-migyro],[data-mipat]"); if(!b) return;
    if(b.hasAttribute("data-midice")) ls("mi-dice-"+FXS18A.who(),b.getAttribute("data-midice")); if(b.hasAttribute("data-migyro")){ ls("mi-gyro",b.getAttribute("data-migyro")); FXS18A.tiltSet(b.getAttribute("data-migyro")==="on"); } if(b.hasAttribute("data-mipat")) ls("mi-pat",b.getAttribute("data-mipat"));
    const a=b.attributes[0]&&Array.prototype.filter.call(b.attributes,(x) =>{ return /^data-mi(dice|gyro|pat)$/.test(x.name); })[0]; if(a) Array.prototype.forEach.call(FXS18A.D.querySelectorAll("["+a.name+"]"),(x) =>{ const on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on); });
    FXS18A.applyPrefs(); FXS18A.play("click"); },true);
  FXENV.__miPrefH=function(){ const g=function(k,d){ return ls(k)||d; }, B=function(a,v,cur,l){ const on=cur===v; return '<button type="button" class="thb'+(on?" on":"")+'" '+a+'="'+v+'" aria-pressed="'+on+'">'+l+'</button>'; }, dc=FXS18A.dice();
    return '<div class="info-h">Dice</div><div class="thg">'+B("data-midice","class",dc,"Class colour")+B("data-midice","metal",dc,"Metal")+B("data-midice","crystal",dc,"Crystal")+B("data-midice","bone",dc,"Bone")+'</div><p class="info-d">For this character.</p>'+
      (FXS18A.FINE.matches?'':'<div class="info-h">Tilt with phone</div><div class="thg">'+B("data-migyro","on",g("mi-gyro","off"),"On")+B("data-migyro","off",g("mi-gyro","off"),"Off")+'</div><p class="info-d">The cards lean a little as you tilt the phone.</p>')+
      '<div class="info-h">Pattern labels</div><div class="thg">'+B("data-mipat","on",g("mi-pat","off"),"On")+B("data-mipat","off",g("mi-pat","off"),"Off")+'</div><p class="info-d">Short labels next to colours: spell schools and item rarity, so nothing depends on colour alone.</p>'; };
})();
