/* === W pack: the wow pass. Class sigil, metal shield, sheet cascade, tab slide, campfire, crack, rune circle, equip flight, card flip, 3D tilt with glare. Motion is transform and opacity only, every layer removes itself === */
(function(){
  const MI=FXENV.__MI; if(!MI||!document.body.animate) return;
  const D=document, WIDE=matchMedia("(min-width: 760px)"), FINE=matchMedia("(hover: hover) and (pointer: fine)");
  function full(){ return MI.full(); }
  function nf(fn){ (FXENV.__miNF||setTimeout)(fn); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function vis(e){ return e&&e.getClientRects().length; }
  function fx(cls,html,ms){ const e=D.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; D.body.appendChild(e); setTimeout(() =>{ rm(e); },ms||2300); return e; }

  /* gradients the shield and medals use */
  const defs=D.createElementNS("http://www.w3.org/2000/svg","svg"); defs.setAttribute("width","0"); defs.setAttribute("height","0"); defs.setAttribute("aria-hidden","true"); defs.style.position="absolute";
  defs.innerHTML='<defs><linearGradient id="miSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8a96"/><stop offset=".45" stop-color="#3b454e"/><stop offset="1" stop-color="#1c2227"/></linearGradient><linearGradient id="miSteelHi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffffff" stop-opacity=".3"/></linearGradient></defs>';
  D.body.appendChild(defs);

  /* W1 class sigil: a large, faint copy of the class icon behind the ID card */
  function sigil(){ const card=D.querySelector("#app .idcard"); if(!card) return; let src=FXENV.__miIcon?{outerHTML:FXENV.__miIcon()}:card.querySelector(".ph-cls svg"), w=card.querySelector(":scope>.mi-sig");
    if(!src){ rm(w); return; } const k=src.outerHTML; if(w&&w.__k===k) return;
    if(!w){ w=D.createElement("i"); w.className="mi-sig"; w.setAttribute("aria-hidden","true"); card.appendChild(w); } w.__k=k; w.innerHTML=k; }
  let sq=0, sObs=new MutationObserver(() =>{ if(!sq){ sq=1; nf(() =>{ sq=0; sigil(); bindSig(); }); } }), sBound=null;
  function bindSig(){ const card=D.querySelector("#app .idcard"); if(!card||card===sBound) return; sBound=card; sObs.disconnect(); sObs.observe(card,{childList:true}); if(card.parentNode) sObs.observe(card.parentNode,{childList:true}); }
  bindSig(); sigil();

  /* M1 the sheet opens: its cards rise in one after another. M10 after Apply to Sheet the ID card turns over */
  let lastC=-1e9;/* T1: one cascade per arrival. The connected move from Home (fx/21) starts it with the flight, load and Home closing do not repeat it */
  function cascade(){ if(!full()||performance.now()-lastC<2500) return; lastC=performance.now(); let n=0;
    Array.prototype.forEach.call(D.querySelectorAll("#app .idcard,#app .vitals,#app .tiles>.tile,#abil .ab,#app .card,#app .panel>.inner"),(e) =>{ if(n>=24) return; const r=e.getBoundingClientRect(); if(!r.width||r.bottom<0||r.top>innerHeight) return;
      e.animate([{opacity:0,transform:"translateY(22px) scale(.97)"},{opacity:1,transform:"none"}],{duration:520,delay:n*38,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); n++; }); }
  function flip(){ const c=D.querySelector("#app .idcard"); if(!vis(c)||!full()) return;
    c.animate([{transform:"perspective(1100px) rotateY(-100deg) scale(.92)",opacity:0},{transform:"perspective(1100px) rotateY(12deg) scale(1.02)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"});
    const s=c.querySelector(":scope>.mi-sig"); if(s) s.animate([{opacity:0,transform:"rotate(-24deg) scale(.6)"},{opacity:1,transform:"rotate(-12deg) scale(1)"}],{duration:1100,delay:350,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); }
  const hv=D.getElementById("homeV");
  FXENV.__miCascade=cascade;
  function boot(){ if(D.documentElement.classList.contains("mi-cx")) return; if(vis(D.querySelector("#app .idcard"))&&!vis(hv)) nf(() =>{ nf(cascade); }); }
  if(D.readyState==="complete") boot(); else addEventListener("load",boot,{once:true});
  if(hv){ let hw=hv.hidden; new MutationObserver(() =>{ const h=hv.hidden; if(h&&!hw) nf(() =>{ nf(cascade); }); hw=h; }).observe(hv,{attributes:true,attributeFilter:["hidden"]}); }
  let fw=0;
  addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("button"); if(!t) return; if(t.id==="b-toSheet"||(D.getElementById("bld")&&/^\s*Apply\s*$/i.test(t.textContent))){ let id=++fw, tries=0;
      (function wait(){ setTimeout(() =>{ if(id!==fw) return; const b=D.getElementById("bld"); if(!vis(b)&&vis(D.querySelector("#app .idcard"))){ flip(); return; } if(++tries<8) wait(); },380); })(); } },true);

  /* M2 desktop tabs: the new page slides in from the side of the tab you picked */
  addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest('[role=tab][data-tab]'); if(!t||!WIDE.matches||!full()) return;
    let tabs=Array.prototype.slice.call(t.parentNode.querySelectorAll('[role=tab]')), cur=-1; tabs.forEach((x,i) =>{ if(x.getAttribute("aria-selected")==="true") cur=i; }); const nx=tabs.indexOf(t); if(cur<0||nx===cur) return; const dir=nx>cur?1:-1;
    nf(() =>{ const pn=D.getElementById(t.getAttribute("data-tab")), el=pn&&(pn.querySelector(":scope>.inner")||pn); if(!vis(el)) return;
      el.animate([{transform:"translateX("+(dir*34)+"px)",opacity:.15},{transform:"none",opacity:1}],{duration:360,easing:"cubic-bezier(.2,.8,.2,1)"}); }); },true);

  /* M5 Short Rest: a campfire flares in the middle of the screen, under the embers */
  const W=FXENV.__miWow;
  if(W&&W.rest){ const r0=W.rest; W.rest=function(k){ r0.apply(this,arguments); if(k!=="long"&&full()) fire(); }; }
  function fire(){ const f=fx("mi-fire",'<s></s><i></i><i></i><i></i><b></b><b></b>',2200);
    f.animate([{opacity:0,transform:"translate(-50%,-50%) scale(.7)"},{opacity:1,transform:"translate(-50%,-50%) scale(1.45)",offset:.22},{opacity:1,transform:"translate(-50%,-50%) scale(1.5)",offset:.7},{opacity:0,transform:"translate(-50%,-62%) scale(1.35)"}],{duration:1700,easing:"ease-out"}).onfinish=function(){ rm(f); };
    Array.prototype.forEach.call(f.querySelectorAll("i"),(fl,i) =>{ fl.animate([{transform:"scale(.6,.4)"},{transform:"scale(1,1.15)",offset:.3},{transform:"scale(.92,.95)",offset:.5},{transform:"scale(1.02,1.1)",offset:.75},{transform:"scale(.7,.5)"}],{duration:1700,delay:i*70,easing:"ease-in-out",fill:"backwards"}); }); }

  /* M6 Damage: a crack runs across the Hit Points card */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#dmgBtn"); if(!b||!full()) return; const amt=+((D.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return;
    nf(() =>{ const box=D.getElementById("hpBox")||D.querySelector(".vitals"); if(!vis(box)) return; const r=box.getBoundingClientRect(), big=Math.min(1,amt/15), w=r.width, h=r.height, x0=w*(.25+Math.random()*.5), y0=h*.35;
      function path(){ let p="M"+x0+" "+y0, x=x0, y=y0, a=Math.random()*Math.PI*2; for(let i=0;i<5;i++){ a+=(Math.random()-.5)*1.2; const d=(18+Math.random()*30)*(.7+big); x+=Math.cos(a)*d; y+=Math.sin(a)*d; p+=" L"+x.toFixed(1)+" "+y.toFixed(1); } return p; }
      let ps=""; for(let k=0;k<4+Math.round(big*3);k++) { const d=path(); ps+='<path class="u" d="'+d+'"/><path d="'+d+'"/>'; }
      const c=fx("mi-crack",'<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+ps+'</svg>',1600); c.style.transform="translate("+r.left+"px,"+r.top+"px)"; c.style.width=w+"px"; c.style.height=h+"px";
      c.animate([{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.55},{opacity:0}],{duration:1100,easing:"ease-out"}).onfinish=function(){ rm(c); }; }); },true);

  /* M7 Concentration starts: a rune circle closes round its badge */
  const vc=D.getElementById("vbConc");
  if(vc){ let vh=vc.hidden; new MutationObserver(() =>{ const h=vc.hidden; if(vh&&!h&&full()) nf(() =>{ rune(vc); }); vh=h; }).observe(vc,{attributes:true,attributeFilter:["hidden"]}); }
  function rune(el){ if(!vis(el)) return; const r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    const g=fx("mi-rune",'<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="44" class="d"/><path d="M60 8 L105 86 L15 86 Z"/><path d="M60 112 L15 34 L105 34 Z"/></svg>',1700);
    g.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.3) rotate(-90deg)",opacity:0},{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(1) rotate(0deg)",opacity:1,offset:.45},{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(1.25) rotate(40deg)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); };
    el.animate([{transform:"scale(1)"},{transform:"scale(1.12)",offset:.4},{transform:"none"}],{duration:520,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("medium"); }

  /* M9 an item equipped: its icon flies to Armor Class when it is armor or a shield, otherwise it pops in place */
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".ichk[data-ieqs]"); if(!b||!full()) return; const key=b.getAttribute("data-ieqs"), row=b.closest(".irow"), ic=row&&row.querySelector(".iname svg"), r0=(ic||b).getBoundingClientRect();
    const armor=row&&/armor|shield/i.test(row.textContent), icon=ic?ic.outerHTML:"";
    nf(() =>{ nf(() =>{ const now=D.querySelector('.ichk[data-ieqs="'+CSS.escape(key)+'"]'); if(!now||!now.classList.contains("on")) return; let tg=null; if(armor) Array.prototype.some.call(D.querySelectorAll(".tile.ac,#vbar .vb"),(t) =>{ if(vis(t)&&(t.classList.contains("ac")||t.classList.contains("vb-ac"))){ const q=t.getBoundingClientRect(); if(q.top>=0&&q.bottom<=innerHeight&&q.left>=0&&q.right<=innerWidth){ tg=t; return true; } } });
      if(FXENV.__miBurst) FXENV.__miBurst(r0.left+r0.width/2,r0.top+r0.height/2,{n:10,colors:["#ffd166","#ffffff","rgb("+(getComputedStyle(D.documentElement).getPropertyValue("--pl-rgb")||"214,69,59")+")"],dist:42,dur:600});
      if(!tg||!icon) return; const q=tg.getBoundingClientRect(), g=fx("mi-eqf",icon,1500), dx=q.left+q.width/2-(r0.left+r0.width/2), dy=q.top+q.height/2-(r0.top+r0.height/2);
      g.style.left=(r0.left+r0.width/2)+"px"; g.style.top=(r0.top+r0.height/2)+"px";
      g.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:"translate(calc(-50% + "+dx*.5+"px),calc(-50% + "+(dy*.5-60)+"px)) scale(1.6) rotate(-12deg)",opacity:1,offset:.45},{transform:"translate(calc(-50% + "+dx+"px),calc(-50% + "+dy+"px)) scale(.6)",opacity:.2}],{duration:720,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ rm(g);
        tg.animate([{transform:"none"},{transform:"scale(1.12)",offset:.35},{transform:"none"}],{duration:460,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("success"); }; }); }); },true);

  /* H1 + H2 mouse only: cards lean toward the cursor and a light follows it. One card at a time, one frame per move */
  const SEL="#app .idcard,#app .vitals,#abil .ab,#app .tiles>.tile,#app .card,#app .arow,#app .fitem,#app .sp-r,#app .irow,#bld .acc";
  if(FINE.matches){ let cur=null, gl=null, raf=0, mx=0, my=0, k=1;
    D.addEventListener("pointermove",(e) =>{ if(e.pointerType!=="mouse") return; const c=e.target.closest?e.target.closest(SEL):null;
      if(c!==cur){ leave(); if(c&&full()&&!e.buttons&&!D.querySelector(".mi-drag,.dragging,[data-dragging]")) enter(c); } if(!cur) return; mx=e.clientX; my=e.clientY; if(!raf) raf=requestAnimationFrame(step); },{passive:true});
    D.addEventListener("pointerdown",(e) =>{ if(e.pointerType==="mouse"&&cur&&e.button===0){ const c=cur; leave(); c.__miHold=1; setTimeout(() =>{ c.__miHold=0; },400); } },true);
    D.documentElement.addEventListener("mouseleave",leave); addEventListener("blur",leave); addEventListener("scroll",() =>{ if(cur) leave(); },{passive:true,capture:true});
    function enter(c){ if(c.__miHold) return; cur=c; const w=c.getBoundingClientRect().width; k=w>420?1.6:w>200?3:6; c.classList.add("mi-lean"); gl=D.createElement("i"); gl.className="mi-glare"; gl.setAttribute("aria-hidden","true"); gl.innerHTML="<b></b>"; c.appendChild(gl); }
    function leave(){ if(!cur) return; const c=cur, g=gl; cur=null; gl=null; c.style.removeProperty("--mrx"); c.style.removeProperty("--mry"); c.classList.remove("mi-lean"); if(g){ g.style.opacity="0"; setTimeout(() =>{ rm(g); },260); } }
    function step(){ raf=0; if(!cur||!gl) return; const r=cur.getBoundingClientRect(), px=Math.max(0,Math.min(1,(mx-r.left)/r.width)), py=Math.max(0,Math.min(1,(my-r.top)/r.height));
      cur.style.setProperty("--mry",((px-.5)*k).toFixed(2)+"deg"); cur.style.setProperty("--mrx",((.5-py)*k).toFixed(2)+"deg"); const b=gl.firstChild; if(b) b.style.transform="translate("+(px*r.width).toFixed(0)+"px,"+(py*r.height).toFixed(0)+"px)"; } }
})();

