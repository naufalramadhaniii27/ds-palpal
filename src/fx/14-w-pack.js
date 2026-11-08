/* === W pack: the wow pass. Class sigil, metal shield, sheet cascade, tab slide, campfire, crack, rune circle, equip flight, card flip, 3D tilt with glare. Motion is transform and opacity only, every layer removes itself === */
const FXS14A={};
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  FXS14A.D=document; FXS14A.WIDE=matchMedia("(min-width: 760px)"); FXS14A.FINE=matchMedia("(hover: hover) and (pointer: fine)");
  FXS14A.full=function full(){ return MI.full(); };;
  FXS14A.nf=function nf(fn){ (FXENV.__miNF||setTimeout)(fn); };;
  FXS14A.rm=function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); };;
  FXS14A.vis=function vis(e){ return e&&e.getClientRects().length; };;
  FXS14A.fx=function fx(cls,html,ms){ const e=FXS14A.D.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; FXS14A.D.body.appendChild(e); setTimeout(() =>{ FXS14A.rm(e); },ms||2300); return e; };;

  /* gradients the shield and medals use */
  const defs=FXS14A.D.createElementNS("http://www.w3.org/2000/svg","svg"); defs.setAttribute("width","0"); defs.setAttribute("height","0"); defs.setAttribute("aria-hidden","true"); defs.style.position="absolute";
  defs.innerHTML='<defs><linearGradient id="miSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8a96"/><stop offset=".45" stop-color="#3b454e"/><stop offset="1" stop-color="#1c2227"/></linearGradient><linearGradient id="miSteelHi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffffff" stop-opacity=".3"/></linearGradient></defs>';
  FXS14A.D.body.appendChild(defs);

  /* W1 class sigil: a large, faint copy of the class icon behind the ID card */
  function sigil(){ const card=FXS14A.D.querySelector("#app .idcard"); if(!card) return; let src=FXENV.__miIcon?{outerHTML:FXENV.__miIcon()}:card.querySelector(".ph-cls svg"), w=card.querySelector(":scope>.mi-sig");
    if(!src){ FXS14A.rm(w); return; } const k=src.outerHTML; if(w&&w.__k===k) return;
    if(!w){ w=FXS14A.D.createElement("i"); w.className="mi-sig"; w.setAttribute("aria-hidden","true"); card.appendChild(w); } w.__k=k; w.innerHTML=k; }
  let sq=0, sObs=new MutationObserver(() =>{ if(!sq){ sq=1; FXS14A.nf(() =>{ sq=0; sigil(); bindSig(); }); } }), sBound=null;
  function bindSig(){ const card=FXS14A.D.querySelector("#app .idcard"); if(!card||card===sBound) return; sBound=card; sObs.disconnect(); sObs.observe(card,{childList:true}); if(card.parentNode) sObs.observe(card.parentNode,{childList:true}); }
  bindSig(); sigil();

  /* M1 the sheet opens: its cards rise in one after another. M10 after Apply to Sheet the ID card turns over */
  FXS14A.lastC=-1e9;
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  /* T1: one cascade per arrival. The connected move from Home (fx/21) starts it with the flight, load and Home closing do not repeat it */
  function cascade(){ if(!FXS14A.full()||performance.now()-FXS14A.lastC<2500) return; FXS14A.lastC=performance.now(); let n=0;
    Array.prototype.forEach.call(FXS14A.D.querySelectorAll("#app .idcard,#app .vitals,#app .tiles>.tile,#abil .ab,#app .card,#app .panel>.inner"),(e) =>{ if(n>=24) return; const r=e.getBoundingClientRect(); if(!r.width||r.bottom<0||r.top>innerHeight) return;
      e.animate([{opacity:0,transform:"translateY(22px) scale(.97)"},{opacity:1,transform:"none"}],{duration:520,delay:n*38,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); n++; }); }
  FXS14A.flip=function flip(){ const c=FXS14A.D.querySelector("#app .idcard"); if(!FXS14A.vis(c)||!FXS14A.full()) return;
    c.animate([{transform:"perspective(1100px) rotateY(-100deg) scale(.92)",opacity:0},{transform:"perspective(1100px) rotateY(12deg) scale(1.02)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"});
    const s=c.querySelector(":scope>.mi-sig"); if(s) s.animate([{opacity:0,transform:"rotate(-24deg) scale(.6)"},{opacity:1,transform:"rotate(-12deg) scale(1)"}],{duration:1100,delay:350,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); };;
  const hv=FXS14A.D.getElementById("homeV");
  FXENV.__miCascade=cascade;
  function boot(){ if(FXS14A.D.documentElement.classList.contains("mi-cx")) return; if(FXS14A.vis(FXS14A.D.querySelector("#app .idcard"))&&!FXS14A.vis(hv)) FXS14A.nf(() =>{ FXS14A.nf(cascade); }); }
  if(FXS14A.D.readyState==="complete") boot(); else addEventListener("load",boot,{once:true});
  if(hv){ let hw=hv.hidden; new MutationObserver(() =>{ const h=hv.hidden; if(h&&!hw) FXS14A.nf(() =>{ FXS14A.nf(cascade); }); hw=h; }).observe(hv,{attributes:true,attributeFilter:["hidden"]}); }
  FXS14A.fw=0;
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("button"); if(!t) return; if(t.id==="b-toSheet"||(FXS14A.D.getElementById("bld")&&/^\s*Apply\s*$/i.test(t.textContent))){ let id=++FXS14A.fw, tries=0;
      (function wait(){ setTimeout(() =>{ if(id!==FXS14A.fw) return; const b=FXS14A.D.getElementById("bld"); if(!FXS14A.vis(b)&&FXS14A.vis(FXS14A.D.querySelector("#app .idcard"))){ FXS14A.flip(); return; } if(++tries<8) wait(); },380); })(); } },true);
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  /* M2 desktop tabs: the new page slides in from the side of the tab you picked */
  addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest('[role=tab][data-tab]'); if(!t||!FXS14A.WIDE.matches||!FXS14A.full()) return;
    let tabs=Array.prototype.slice.call(t.parentNode.querySelectorAll('[role=tab]')), cur=-1; tabs.forEach((x,i) =>{ if(x.getAttribute("aria-selected")==="true") cur=i; }); const nx=tabs.indexOf(t); if(cur<0||nx===cur) return; const dir=nx>cur?1:-1;
    FXS14A.nf(() =>{ const pn=FXS14A.D.getElementById(t.getAttribute("data-tab")), el=pn&&(pn.querySelector(":scope>.inner")||pn); if(!FXS14A.vis(el)) return;
      el.animate([{transform:"translateX("+(dir*34)+"px)",opacity:.15},{transform:"none",opacity:1}],{duration:360,easing:"cubic-bezier(.2,.8,.2,1)"}); }); },true);

  /* M5 Short Rest: a campfire flares in the middle of the screen, under the embers */
  const W=FXENV.__miWow;
  if(W&&W.rest){ const r0=W.rest; W.rest=function(k){ r0.apply(this,arguments); if(k!=="long"&&FXS14A.full()) fire(); }; }
  function fire(){ const f=FXS14A.fx("mi-fire",'<s></s><i></i><i></i><i></i><b></b><b></b>',2200);
    f.animate([{opacity:0,transform:"translate(-50%,-50%) scale(.7)"},{opacity:1,transform:"translate(-50%,-50%) scale(1.45)",offset:.22},{opacity:1,transform:"translate(-50%,-50%) scale(1.5)",offset:.7},{opacity:0,transform:"translate(-50%,-62%) scale(1.35)"}],{duration:1700,easing:"ease-out"}).onfinish=function(){ FXS14A.rm(f); };
    Array.prototype.forEach.call(f.querySelectorAll("i"),(fl,i) =>{ fl.animate([{transform:"scale(.6,.4)"},{transform:"scale(1,1.15)",offset:.3},{transform:"scale(.92,.95)",offset:.5},{transform:"scale(1.02,1.1)",offset:.75},{transform:"scale(.7,.5)"}],{duration:1700,delay:i*70,easing:"ease-in-out",fill:"backwards"}); }); }
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  /* M6 Damage: a crack runs across the Hit Points card */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#dmgBtn"); if(!b||!FXS14A.full()) return; const amt=+((FXS14A.D.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return;
    FXS14A.nf(() =>{ const box=FXS14A.D.getElementById("hpBox")||FXS14A.D.querySelector(".vitals"); if(!FXS14A.vis(box)) return; const r=box.getBoundingClientRect(), big=Math.min(1,amt/15), w=r.width, h=r.height, x0=w*(.25+Math.random()*.5), y0=h*.35;
      function path(){ let p="M"+x0+" "+y0, x=x0, y=y0, a=Math.random()*Math.PI*2; for(let i=0;i<5;i++){ a+=(Math.random()-.5)*1.2; const d=(18+Math.random()*30)*(.7+big); x+=Math.cos(a)*d; y+=Math.sin(a)*d; p+=" L"+x.toFixed(1)+" "+y.toFixed(1); } return p; }
      let ps=""; for(let k=0;k<4+Math.round(big*3);k++) { const d=path(); ps+='<path class="u" d="'+d+'"/><path d="'+d+'"/>'; }
      const c=FXS14A.fx("mi-crack",'<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+ps+'</svg>',1600); c.style.transform="translate("+r.left+"px,"+r.top+"px)"; c.style.width=w+"px"; c.style.height=h+"px";
      c.animate([{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.55},{opacity:0}],{duration:1100,easing:"ease-out"}).onfinish=function(){ FXS14A.rm(c); }; }); },true);

  /* M7 Concentration starts: a rune circle closes round its badge */
  const vc=FXS14A.D.getElementById("vbConc");
  if(vc){ let vh=vc.hidden; new MutationObserver(() =>{ const h=vc.hidden; if(vh&&!h&&FXS14A.full()) FXS14A.nf(() =>{ rune(vc); }); vh=h; }).observe(vc,{attributes:true,attributeFilter:["hidden"]}); }
  function rune(el){ if(!FXS14A.vis(el)) return; const r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    const g=FXS14A.fx("mi-rune",'<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="44" class="d"/><path d="M60 8 L105 86 L15 86 Z"/><path d="M60 112 L15 34 L105 34 Z"/></svg>',1700);
    g.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.3) rotate(-90deg)",opacity:0},{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(1) rotate(0deg)",opacity:1,offset:.45},{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(1.25) rotate(40deg)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ FXS14A.rm(g); };
    el.animate([{transform:"scale(1)"},{transform:"scale(1.12)",offset:.4},{transform:"none"}],{duration:520,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("medium"); }
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  /* M9 an item equipped: its icon flies to Armor Class when it is armor or a shield, otherwise it pops in place */
  FXS14A.eqTarget=function eqTarget(){ let tg=null; Array.prototype.some.call(FXS14A.D.querySelectorAll(".tile.ac,#vbar .vb"),(t) =>{ if(FXS14A.vis(t)&&(t.classList.contains("ac")||t.classList.contains("vb-ac"))){ const q=t.getBoundingClientRect(); if(q.top>=0&&q.bottom<=innerHeight&&q.left>=0&&q.right<=innerWidth){ tg=t; return true; } } }); return tg; };;
  FXS14A.eqFly=function eqFly(r0,tg,icon){ const q=tg.getBoundingClientRect(), g=FXS14A.fx("mi-eqf",icon,1500), dx=q.left+q.width/2-(r0.left+r0.width/2), dy=q.top+q.height/2-(r0.top+r0.height/2);
    g.style.left=(r0.left+r0.width/2)+"px"; g.style.top=(r0.top+r0.height/2)+"px";
    g.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:"translate(calc(-50% + "+dx*.5+"px),calc(-50% + "+(dy*.5-60)+"px)) scale(1.6) rotate(-12deg)",opacity:1,offset:.45},{transform:"translate(calc(-50% + "+dx+"px),calc(-50% + "+dy+"px)) scale(.6)",opacity:.2}],{duration:720,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ FXS14A.rm(g);
    tg.animate([{transform:"none"},{transform:"scale(1.12)",offset:.35},{transform:"none"}],{duration:460,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("success"); }; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  ;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".ichk[data-ieqs]"); if(!b||!FXS14A.full()) return; const key=b.getAttribute("data-ieqs"), row=b.closest(".irow"), ic=row&&row.querySelector(".iname svg"), r0=(ic||b).getBoundingClientRect();
    const armor=row&&/armor|shield/i.test(row.textContent), icon=ic?ic.outerHTML:"";
    FXS14A.nf(() =>{ FXS14A.nf(() =>{ const now=FXS14A.D.querySelector('.ichk[data-ieqs="'+CSS.escape(key)+'"]'); if(!now||!now.classList.contains("on")) return; let tg=armor?FXS14A.eqTarget():null;
    if(FXENV.__miBurst) FXENV.__miBurst(r0.left+r0.width/2,r0.top+r0.height/2,{n:10,colors:["#ffd166","#ffffff","rgb("+(getComputedStyle(FXS14A.D.documentElement).getPropertyValue("--pl-rgb")||"214,69,59")+")"],dist:42,dur:600});
      if(!tg||!icon) return; FXS14A.eqFly(r0,tg,icon); }); }); },true);
  /* H1 + H2 mouse only: cards lean toward the cursor and a light follows it. One card at a time, one frame per move */
  FXS14A.SEL="#app .idcard,#app .vitals,#abil .ab,#app .tiles>.tile,#app .card,#app .arow,#app .fitem,#app .sp-r,#app .irow,#bld .acc";
  FXS14A.lnCur=null; FXS14A.lnGl=null; FXS14A.lnRaf=0; FXS14A.lnMx=0; FXS14A.lnMy=0; FXS14A.lnK=1;
  FXS14A.lnEnter=function lnEnter(c){ if(c.__miHold) return; FXS14A.lnCur=c; const w=c.getBoundingClientRect().width; FXS14A.lnK=w>420?1.6:w>200?3:6; c.classList.add("mi-lean"); FXS14A.lnGl=FXS14A.D.createElement("i"); FXS14A.lnGl.className="mi-glare"; FXS14A.lnGl.setAttribute("aria-hidden","true"); FXS14A.lnGl.innerHTML="<b></b>"; c.appendChild(FXS14A.lnGl); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  ;
  FXS14A.lnLeave=function lnLeave(){ if(!FXS14A.lnCur) return; const c=FXS14A.lnCur, g=FXS14A.lnGl; FXS14A.lnCur=null; FXS14A.lnGl=null; c.style.removeProperty("--mrx"); c.style.removeProperty("--mry"); c.classList.remove("mi-lean"); if(g){ g.style.opacity="0"; setTimeout(() =>{ FXS14A.rm(g); },260); } };;
  FXS14A.lnStep=function lnStep(){ FXS14A.lnRaf=0; if(!FXS14A.lnCur||!FXS14A.lnGl) return; const r=FXS14A.lnCur.getBoundingClientRect(), px=Math.max(0,Math.min(1,(FXS14A.lnMx-r.left)/r.width)), py=Math.max(0,Math.min(1,(FXS14A.lnMy-r.top)/r.height));
    FXS14A.lnCur.style.setProperty("--mry",((px-.5)*FXS14A.lnK).toFixed(2)+"deg"); FXS14A.lnCur.style.setProperty("--mrx",((.5-py)*FXS14A.lnK).toFixed(2)+"deg"); const b=FXS14A.lnGl.firstChild; if(b) b.style.transform="translate("+(px*r.width).toFixed(0)+"px,"+(py*r.height).toFixed(0)+"px)"; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  ;
  if(FXS14A.FINE.matches){
    FXS14A.D.addEventListener("pointermove",(e) =>{ if(e.pointerType!=="mouse") return; const c=e.target.closest?e.target.closest(FXS14A.SEL):null;
      if(c!==FXS14A.lnCur){ FXS14A.lnLeave(); if(c&&FXS14A.full()&&!e.buttons&&!FXS14A.D.querySelector(".mi-drag,.dragging,[data-dragging]")) FXS14A.lnEnter(c); } if(!FXS14A.lnCur) return; FXS14A.lnMx=e.clientX; FXS14A.lnMy=e.clientY; if(!FXS14A.lnRaf) FXS14A.lnRaf=requestAnimationFrame(FXS14A.lnStep); },{passive:true});
    FXS14A.D.addEventListener("pointerdown",(e) =>{ if(e.pointerType==="mouse"&&FXS14A.lnCur&&e.button===0){ const c=FXS14A.lnCur; FXS14A.lnLeave(); c.__miHold=1; setTimeout(() =>{ c.__miHold=0; },400); } },true);
    FXS14A.D.documentElement.addEventListener("mouseleave",FXS14A.lnLeave); addEventListener("blur",FXS14A.lnLeave); addEventListener("scroll",() =>{ if(FXS14A.lnCur) FXS14A.lnLeave(); },{passive:true,capture:true}); }
})();
