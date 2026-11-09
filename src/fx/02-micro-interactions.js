/* === v55 micro-interactions. Self-contained: it only listens to clicks and reads the DOM, so the sheet logic is untouched.
   Everything decorative is skipped with prefers-reduced-motion. === */
const FXS02A={};
(function(){
  if(!document.body||!document.body.animate) return;
  
  FXS02A.FINE=!!(FXENV.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  FXS02A.C=function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; };;
  FXS02A.vis=function vis(r){ return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight; };;
  FXS02A.kill=function kill(e,an,ms){ an.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },ms); };;

  /* particles: dots, stars, or sparks flying out from a point. Elements come from a pool and go back to it, so a burst adds nothing to the page */
  FXS02A.POOL=[];
})();
(function(){
  if(!document.body||!document.body.animate) return;
  FXS02A.burst=function burst(x,y,o){ if(MI.rm()) return; o=o||{}; let n=o.n||10, cols=o.colors||["#ffd166"], d=o.dist||46, sh=o.shape||"mi-dot", dur=o.dur||700, s=o.scale||1;
    if(MI.full()){ n=Math.min(48,Math.round(n*1.6)); d*=1.4; s*=1.2; }/* W11: Full mode is the loud one */
    for(let i=0;i<n;i++){ let a=(Math.PI*2*i/n)+(Math.random()-.5)*.6, dd=d*(.6+Math.random()*.6), e=FXS02A.POOL.pop();
      if(!e){ e=document.createElement("i"); e.setAttribute("aria-hidden","true"); document.body.appendChild(e); }
      e.className="mi-fx "+sh; e.style.visibility=""; e.style.background=cols[i%cols.length];
      const dx=Math.cos(a)*dd, dy=Math.sin(a)*dd+(o.grav?dd*.35:0), spark=sh==="mi-spark", r0=spark?(a*180/Math.PI+90):Math.random()*180, sp=spark?0:1;
      const an=e.animate([
        {transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) rotate("+r0+"deg) scale("+(.4*s)+")",opacity:1},
        {transform:"translate("+(x+dx*.75)+"px,"+(y+dy*.75)+"px) translate(-50%,-50%) rotate("+(r0+90*sp)+"deg) scale("+s+")",opacity:1,offset:.55},
        {transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) rotate("+(r0+140*sp)+"deg) scale("+(.2*s)+")",opacity:0}
      ],{duration:dur*(.8+Math.random()*.4),easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
      (function(e,an){ let done=false, back=function(){ if(done) return; done=true; an.cancel(); e.style.visibility="hidden"; if(FXS02A.POOL.length<60) FXS02A.POOL.push(e); else e.remove(); }; an.onfinish=back; setTimeout(back,dur*1.5+200); })(e,an); } };
})();
(function(){
  if(!document.body||!document.body.animate) return;
  ;
  /* an expanding ring */
  FXS02A.ring=function ring(x,y,col,size){ if(MI.rm()) return; const e=document.createElement("i"); e.className="mi-fx mi-ring"; e.setAttribute("aria-hidden","true"); e.style.color=col; document.body.appendChild(e);
    const k=(size||70)/16*(MI.full()?1.35:1), an=e.animate([{transform:"translate("+x+"px,"+y+"px) scale(.3)",opacity:.9},{transform:"translate("+x+"px,"+y+"px) scale("+k+")",opacity:0}],{duration:620,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    FXS02A.kill(e,an,1000); };;
  /* a little smoke rising, for a spell slot going out */
  FXS02A.smoke=function smoke(x,y){ if(MI.rm()) return; for(let i=0;i<6;i++){ const e=document.createElement("i"), s=6+Math.random()*5; e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background="rgba(170,170,182,.75)"; e.style.width=e.style.height=s+"px"; document.body.appendChild(e);
      const dx=(Math.random()-.5)*22, dy=-(28+Math.random()*26);
      FXS02A.kill(e,e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.5)",opacity:.75},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) scale(1.9)",opacity:0}],{duration:800+Math.random()*300,delay:i*40,easing:"cubic-bezier(.2,.7,.3,1)",fill:"both"}),1600); } };;
  FXENV.__miBurst=FXS02A.burst; FXENV.__miRing=FXS02A.ring; FXENV.__miSmoke=FXS02A.smoke;

  /* 1. ink ripple from the touch point on buttons */
  const RIP=".btn,.bb,.hact button,.hcreate,.rcard,.dsb";/* cards get the F1 light instead *//* not tabs: they switch with a view transition, which freezes a ripple mid-way */
  /* pooled: two wrappers reused, and each button's radius and colour read once */
  const RP=[], RC=new WeakMap();
  function rip(){ let w=RP.pop(); if(!w){ w=document.createElement("span"); w.className="mi-rip"; w.setAttribute("aria-hidden","true"); w.appendChild(document.createElement("i")); document.body.appendChild(w); } return w; }
  MI.on("pointerdown",(e) =>{ if(MI.rm()||e.button>0) return; const b=e.target.closest&&e.target.closest(RIP); if(!b||b.disabled||b.classList.contains("holdc")||b.closest(".slidec")) return;
    const r=b.getBoundingClientRect(); if(!FXS02A.vis(r)) return; let st=RC.get(b); if(!st){ const cs=getComputedStyle(b); st=[cs.borderRadius,cs.color]; RC.set(b,st); }
    const w=rip(), c=w.firstChild, d=Math.hypot(Math.max(e.clientX-r.left,r.right-e.clientX),Math.max(e.clientY-r.top,r.bottom-e.clientY))*2;
    w.style.cssText="left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+st[0]+";color:"+st[1];
    c.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";
    const an=c.animate([{transform:"scale(0)",opacity:.26},{transform:"scale(1)",opacity:0}],{duration:560,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ an.cancel(); w.style.cssText="display:none"; if(RP.length<3) RP.push(w); else w.remove(); }; },true);

  /* 2. jelly squash on toggles (death saves, slots, hit dice, conditions, equip), plus a small burst when one turns on */
  FXS02A.TOG=".pip,.bx,.chip[data-c],[data-condtoggle],.ichk,.lu-box,.islot,.thb,input[type=checkbox]";
  FXS02A.jel=function(n){ n.classList.remove("mi-jelly"); void n.offsetWidth; n.classList.add("mi-jelly"); setTimeout(() =>{ n.classList.remove("mi-jelly"); },500); };
  /* attribute selector of an element (a redraw replaced it: find its copy again) */
  FXS02A.selA=function selA(el){ return el.getAttributeNames().filter((k) =>{ return k.indexOf("data-")===0; }).map((k) =>{ return "["+k+'="'+CSS.escape(el.getAttribute(k))+'"]'; }).join(""); };;
  FXS02A.selB=function selB(el){ return Array.prototype.filter.call(el.attributes,(a) =>{ return a.name.indexOf("data-")===0; }).map((a) =>{ return "["+a.name+'="'+(FXENV.CSS&&CSS.escape?CSS.escape(a.value):a.value)+'"]'; }).join(""); };
})();
(function(){
  if(!document.body||!document.body.animate) return;
  ;
  function jelRetry(t,q){ let k=0, again=function(){ const m=document.querySelector(t.tagName.toLowerCase()+q); if(m) FXS02A.jel(m); else if(++k<8) setTimeout(again,50); }; setTimeout(again,50); }
  FXS02A.jelLate=function jelLate(n0){ setTimeout(() =>{ if(n0.isConnected) return; const a=FXS02A.selA(n0); const m=a&&document.querySelector(n0.tagName.toLowerCase()+a); if(m) FXS02A.jel(m); },160); };;/* redraws inside a View Transition land later */
  FXS02A.toggleNode=function toggleNode(t,n){ if(n.isConnected) return n; const q=FXS02A.selB(t);
    n=q&&document.querySelector(t.tagName.toLowerCase()+q);
    if(!n){ if(q) jelRetry(t,q); return null; } return n; };;/* the panel is mid-redraw: wait for it */
  FXS02A.toggleBurst=function toggleBurst(n,p){ const on=n.getAttribute("aria-pressed")==="true"||n.classList.contains("on")||n.checked;
    if(n.closest(".spsl")){ if(on) FXS02A.smoke(p.x,p.y-4); else FXS02A.burst(p.x,p.y,{n:8,colors:["#ffd166","#fff3b0","#ff9f43"],shape:"mi-spark",dist:22,dur:450}); return; }/* spell slots are candles */
    if(on){ let cs=getComputedStyle(n), col=cs.backgroundColor;
      if(!col||col==="transparent"||/rgba\(0, 0, 0, 0\)/.test(col)) col=cs.borderColor; if(n.type==="checkbox") col="#d6453b"; FXS02A.burst(p.x,p.y,{n:7,colors:[col],dist:26,dur:520}); } };
})();
(function(){
  if(!document.body||!document.body.animate) return;
  ;
  MI.on("click",(e) =>{ if(MI.rm()) return; let t=e.target.closest&&e.target.closest(FXS02A.TOG); if(!t) return;
    if(!t.isConnected){ const a=FXS02A.selA(t); t=a&&document.querySelector(t.tagName.toLowerCase()+a); if(!t) return; }/* the app redrew on pointerup */
    const p=FXS02A.C(t); if(!FXS02A.vis(p.r)) return;
    requestAnimationFrame(() =>{ let h=document.elementFromPoint(p.x,p.y), n=(h&&h.closest&&h.closest(FXS02A.TOG))||t;
      n=FXS02A.toggleNode(t,n); if(!n) return;
      if(!n.matches('.bx[data-k],#dsS .pip,#dsF .pip')){ FXS02A.jel(n); FXS02A.jelLate(n); }
      FXS02A.toggleBurst(n,p); }); },true);
  /* 3. Heroic Inspiration: the moment is the Bell Toggle (F5.1b), the lasting state is the Star Border */

  /* 4. casting a spell from the Spells list: arcane sparks */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest(".sp-b[data-qcast]"); if(!t) return; const p=FXS02A.C(t); if(!FXS02A.vis(p.r)) return; if(FXENV.__miWow) FXENV.__miWow.cast(p.x,p.y);
    FXS02A.ring(p.x,p.y,"#b388ff",60); FXS02A.burst(p.x,p.y,{n:12,colors:["#b388ff","#7c4dff","#80d8ff","#ffffff"],shape:"mi-spark",dist:40,dur:600}); },true);
})();
(function(){
  if(!document.body||!document.body.animate) return;
  /* 5. Death Saving Throws: green for a success, red sparks for a failure, a big burst for a natural 20 */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-dsr]"); if(!t) return; const k=t.getAttribute("data-dsr"), p=FXS02A.C(t); if(!FXS02A.vis(p.r)) return;
    if(FXENV.__miWow) FXENV.__miWow.save(k);
    if(k==="20"){ FXS02A.ring(p.x,p.y,"#4cc27a",110); FXS02A.burst(p.x,p.y,{n:16,colors:["#4cc27a","#ffd166","#ffffff"],shape:"mi-star",dist:80,dur:900}); }
    else if(k==="s") FXS02A.burst(p.x,p.y,{n:8,colors:["#4cc27a"],dist:34});
    else if(k==="f"||k==="1") FXS02A.burst(p.x,p.y,{n:k==="1"?12:8,colors:["#e5534b","#7a1f1a"],shape:"mi-spark",dist:k==="1"?50:34,grav:true}); },true);

  /* 6. a rest that went through (the sheet closed): stars for a Long Rest, embers for a Short Rest */
  function restCele(kind){ if(!MI.full()) return; setTimeout(() =>{ if(document.querySelector("#sheet.on #restDlg")) return; const x=innerWidth/2, y=Math.min(innerHeight*.42,320);
      if(FXENV.__miWow) FXENV.__miWow.rest(kind);
      if(kind==="long"){ FXS02A.ring(x,y,"#7cb6ff",160); FXS02A.burst(x,y,{n:22,colors:["#7cb6ff","#c3dcff","#ffd166","#ffffff"],shape:"mi-star",dist:150,dur:1300,scale:1.3,grav:true}); }
      else { FXS02A.ring(x,y,"#ffb26b",110); FXS02A.burst(x,y,{n:12,colors:["#ffb26b","#ffd166","#ffffff"],dist:90,dur:1000,grav:true}); } },380); }
  document.addEventListener("mi:rest",(e) =>{ restCele(e.detail); });

  /* 7. My Characters: cards rise in one after another, names decode, the cards tilt toward the mouse, Create a Character pulls toward it */
  function nameIn(el,delay){ el.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:420,delay:delay+120,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); }
  FXS02A.homeEnter=function homeEnter(){ if(MI.rm()) return; const g=document.getElementById("hgrid"); if(!g) return;
    Array.prototype.forEach.call(g.querySelectorAll(".hcard"),(c,i) =>{ const dl=Math.min(i,10)*60; c.style.animationDelay=dl+"ms"; c.classList.add("mi-in");
      setTimeout(() =>{ c.classList.remove("mi-in"); c.style.animationDelay=""; },620+dl); const b=c.querySelector(".hname b"); if(b) nameIn(b,dl); }); };
})();
(function(){
  if(!document.body||!document.body.animate) return;
  ;
  function watchHome(h){ if(h.__mi) return; h.__mi=1; let was=h.hidden; if(!was) setTimeout(FXS02A.homeEnter,30);
    new MutationObserver(() =>{ if(was&&!h.hidden) setTimeout(FXS02A.homeEnter,30); was=h.hidden; }).observe(h,{attributes:true,attributeFilter:["hidden"]}); }
  const hv=document.getElementById("homeV"); if(hv) watchHome(hv);
  else { var mo=new MutationObserver(() =>{ const h=document.getElementById("homeV"); if(h){ watchHome(h); mo.disconnect(); } }); mo.observe(document.body,{childList:true}); }

  /* View or Edit on a card: the card grows to fill the screen, then the sheet fades in. Switching reloads the page,
     so the cover ends in the page colour and the new page fades in from that same colour (no flash). */
  if(document.documentElement.classList.contains("mi-arrive")) setTimeout(() =>{ document.documentElement.classList.remove("mi-arrive"); },650);
  FXS02A.leaving=false; FXENV.addEventListener("beforeunload",() =>{ FXS02A.leaving=true; });
})();
(function(){
  if(!document.body||!document.body.animate) return;
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#homeV [data-hview],#homeV [data-hedit]"); if(!b) return; if(b.__miGo){ b.__miGo=0; return; } if(MI.rm()) return;
    const card=b.closest(".hcard,.hhero"), top=card&&card.querySelector(".hcard-top"); if(!card) return; e.preventDefault(); e.stopImmediatePropagation();
    if(FXENV.__miFlyOut){ FXENV.__miFlyOut(card,() =>{ b.__miGo=1; b.click(); b.__miGo=0; }); return; }/* T1: portrait and name travel to the sheet (fx/21) */
    const r=card.getBoundingClientRect(), W=innerWidth, H=innerHeight, ov=document.createElement("div"), bg=top?(top.style.backgroundImage||getComputedStyle(top).backgroundImage):"none";
    ov.className="mi-sw"; ov.setAttribute("aria-hidden","true"); ov.style.width=W+"px"; ov.style.height=H+"px"; ov.style.backgroundImage=bg; ov.style.backgroundColor="var(--panel)"; ov.innerHTML="<i></i>"; document.body.appendChild(ov);
    const ex=ov.animate([{transform:"translate("+r.left+"px,"+r.top+"px) scale("+(r.width/W)+","+(r.height/H)+")",opacity:.85},{transform:"none",opacity:1}],{duration:340,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"});
    ov.firstChild.animate([{opacity:0},{opacity:1}],{duration:200,delay:200,fill:"forwards"});
    try{ sessionStorage.setItem("mi-sw","1"); }catch(er){}
    function fadeOut(){ try{ sessionStorage.removeItem("mi-sw"); }catch(er){} const f=ov.animate([{opacity:1},{opacity:0}],{duration:300,easing:"ease-out",fill:"forwards"}); f.onfinish=function(){ ov.remove(); }; setTimeout(() =>{ ov.remove(); },700); }
    let went=false; function go(){ if(went) return; went=true; b.__miGo=1; b.click(); b.__miGo=0;
      __miNF(() =>{ __miNF(() =>{ const hv=document.getElementById("homeV"); if(!hv||hv.hidden) fadeOut(); else setTimeout(() =>{ if(!FXS02A.leaving) fadeOut(); },2500); }); }); }
    ex.onfinish=go; setTimeout(go,600); },true);
})();
(function(){
  if(!document.body||!document.body.animate) return;
  /* the app builds the sheet while the cover is still, never in the middle of the motion */

  if(FXS02A.FINE&&!MI.rm()){ let cur=null;
    const untilt=function(c){ c.classList.remove("mi-tilt"); c.style.transform=""; if(cur===c) cur=null; };
    MI.on("pointermove",(e) =>{ if(e.pointerType!=="mouse"||MI.rm()) return; const c=e.target.closest&&e.target.closest("#homeV .hcard"); if(cur&&cur!==c) untilt(cur); if(c){ cur=c; const r=c.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        c.classList.add("mi-tilt"); c.style.transform="perspective(900px) rotateX("+((.5-py)*6).toFixed(2)+"deg) rotateY("+((px-.5)*8).toFixed(2)+"deg) translateY(-3px)";
        c.style.setProperty("--mx",(px*100).toFixed(1)+"%"); c.style.setProperty("--my",(py*100).toFixed(1)+"%"); }
      /* the Create button no longer follows the mouse: it pushed into its neighbours */

      },{passive:true});
    document.documentElement.addEventListener("mouseleave",() =>{ if(cur) untilt(cur); }); }
  MI.on("pointerdown",(e) =>{ if(e.pointerType==="mouse"||!MI.full()) return; const c=e.target.closest&&e.target.closest("#homeV .hcard"); if(!c||e.target.closest("button,input,select,a")) return;
    const r=c.getBoundingClientRect(); c.style.setProperty("--mx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%"); c.style.setProperty("--my",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
    c.classList.remove("mi-holo"); void c.offsetWidth; c.classList.add("mi-holo"); setTimeout(() =>{ c.classList.remove("mi-holo"); },720); },{passive:true});
})();
/* --- v55 round 3: XP, coins, number bumps, level up fanfare, concentration, spotlight --- */
const FXS02B={};
(function(){
  if(!document.body||!document.body.animate) return;
  ;
  /* Particle Text: dots gather into the words, then hand over to the crisp banner. The canvas is used once to sample the letters */
  FXS02B.particleText=function particleText(txt,cx,cy,size){ const cv=document.createElement("canvas"), ctx=cv.getContext("2d"); if(!ctx) return; const w=Math.ceil(size*txt.length*.66), h=Math.ceil(size*1.2); cv.width=w; cv.height=h;
    ctx.font="900 "+size+"px "+(getComputedStyle(document.body).fontFamily||"sans-serif"); ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="#000"; ctx.fillText(txt,w/2,h/2);
    const d=ctx.getImageData(0,0,w,h).data, step=Math.max(4,Math.round(size/11)), P=[]; for(let yy=0;yy<h;yy+=step) for(let xx=0;xx<w;xx+=step) if(d[(yy*w+xx)*4+3]>140) P.push([xx,yy]);
    while(P.length>150) P.splice((Math.random()*P.length)|0,1);
    P.forEach((q) =>{ const e=document.createElement("i"); e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background=Math.random()<.3?"#fff3b0":"#ffc93c"; e.style.width=e.style.height=Math.max(3,step-1)+"px"; document.body.appendChild(e);
      const tx=cx-w/2+q[0], ty=cy-h/2+q[1], fx=cx+(Math.random()-.5)*innerWidth*.9, fy=cy+(Math.random()-.5)*innerHeight*.7, dl=Math.random()*220;
      const a=e.animate([{transform:"translate("+fx+"px,"+fy+"px) scale(.3)",opacity:0},{transform:"translate("+tx+"px,"+ty+"px) scale(1)",opacity:1,offset:.45},{transform:"translate("+tx+"px,"+ty+"px) scale(1)",opacity:1,offset:.7},{transform:"translate("+tx+"px,"+(ty-10)+"px) scale(.4)",opacity:0}],{duration:1500,delay:dl,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"});
      a.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },2200); }); };;
  /* Split Flap: after the banner, the level number on the sheet flips over */
  FXS02B.flipLevel=function flipLevel(){ const el=document.querySelector("#xpBox .xph b"); if(!el||MI.rm()) return; el.style.display="inline-block";
    el.animate([{transform:"perspective(300px) rotateX(-90deg)",opacity:.2},{transform:"perspective(300px) rotateX(18deg)",opacity:1,offset:.6},{transform:"perspective(300px) rotateX(-6deg)",offset:.8},{transform:"none"}],{duration:620,easing:"cubic-bezier(.3,1.5,.5,1)"}).onfinish=function(){ el.style.display=""; }; MI.buzz("success"); };
  
  FXS02B.FINE=!!(FXENV.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  FXS02B.burst=FXENV.__miBurst||function(){}; FXS02B.ring=FXENV.__miRing||function(){};
  FXS02B.C=function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; };;
  FXS02B.floatTxt=function floatTxt(x,y,txt,col){ if(MI.rm()) return; const e=document.createElement("i"); e.className="mi-float"; e.textContent=txt; e.style.color=col; e.setAttribute("aria-hidden","true"); document.body.appendChild(e);
    const an=e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.6)",opacity:0},{transform:"translate("+x+"px,"+(y-16)+"px) translate(-50%,-50%) scale(1.1)",opacity:1,offset:.25},{transform:"translate("+x+"px,"+(y-58)+"px) translate(-50%,-50%) scale(1)",opacity:0}],{duration:1150,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },1600); };;
  FXENV.__miFloat=FXS02B.floatTxt;
})();
(function(){
  if(!document.body||!document.body.animate) return;
  /* Add XP: the amount rises in gold, stars, and a shine runs along the XP bar */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest('[data-xpadd="1"]'); if(!t) return; const inp=document.querySelector("[data-xpamt]"), v=inp?Math.floor(+inp.value||0):0; if(v<=0) return; const p=FXS02B.C(t);
    FXS02B.floatTxt(p.x,p.r.top,"+"+v.toLocaleString("en-US")+" XP","#ffd166"); FXS02B.burst(p.x,p.y,{n:8,colors:["#ffd166","#fff3b0"],shape:"mi-star",dist:36,dur:650});
    if(MI.rm()) return; setTimeout(() =>{ Array.prototype.forEach.call(document.querySelectorAll(".xpbar"),(b) =>{ b.classList.remove("mi-shine"); void b.offsetWidth; b.classList.add("mi-shine"); setTimeout(() =>{ b.classList.remove("mi-shine"); },1000); }); },60); },true);

  /* Manage Coin, Add: gold coins spill out and the amount rises */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest('[data-coin="add"],[data-coin="rem"]'); if(!t) return; const add=t.getAttribute("data-coin")==="add", parts=[];
    Array.prototype.forEach.call(document.querySelectorAll("#coinDlg [data-camt]"),(i) =>{ const v=Math.floor(+i.value||0); if(v>0) parts.push((add?"+":"−")+v+" "+i.getAttribute("data-camt")); }); if(!parts.length) return; const p=FXS02B.C(t);
    FXS02B.floatTxt(p.x,p.r.top,parts.join("  "),add?"#ffc93c":"#e5a04b"); if(add&&MI.full()) FXS02B.burst(p.x,p.y,{n:12,shape:"mi-coin",colors:["#ffc93c"],dist:70,dur:950,grav:true}); },true);
})();
(function(){
  if(!document.body||!document.body.animate) return;
  /* level up fanfare */
  FXS02B.levelFx=function levelFx(lv){ if(!MI.full()) return; const x=innerWidth/2, y=innerHeight*.38; FXS02B.ring(x,y,"#ffc93c",220); if(FXENV.__miWow) FXENV.__miWow.level(x,y);
    FXS02B.burst(x,y,{n:26,colors:["#ffd166","#ffc93c","#fff3b0","#ffffff"],shape:"mi-star",dist:190,dur:1500,scale:1.4,grav:true});
    setTimeout(() =>{ FXS02B.burst(x,y,{n:18,colors:["#ffd166","#7cb6ff","#ffffff"],shape:"mi-spark",dist:150,dur:1100}); },250);
    const b=document.createElement("div"); b.className="mi-lv"; b.setAttribute("aria-hidden","true"); b.innerHTML=(FXENV.__artVig?FXENV.__artVig("moment",lv>=20?"level-20":"level-up",120):"")+"<b>Level "+lv+"</b><span>Level up!</span>"; document.body.appendChild(b);
    const sz=Math.min(84,Math.max(40,innerWidth*.09)); FXS02B.particleText("LEVEL "+lv,x,y-sz*.1,sz);
    const an=b.animate([{transform:"translate(-50%,-50%) scale(.96)",opacity:0},{transform:"translate(-50%,-50%) scale(.96)",opacity:0,offset:.3},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.42},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.8},{transform:"translate(-50%,-62%) scale(1)",opacity:0}],{duration:2600,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ b.remove(); FXS02B.flipLevel(); }; setTimeout(() =>{ b.remove(); },3100); };;
  FXENV.__miLevel=FXS02B.levelFx;

  /* one light watcher: a changed stat bumps, a higher level celebrates, Concentration starting rings */
  FXS02B.prev={}; FXS02B.who=null; FXS02B.pend=false; FXS02B.concWas=null;
  FXS02B.ssGet=function ssGet(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } };;
  FXS02B.ssSet=function ssSet(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} };;
  FXS02B.scanStats=function scanStats(same,cur){
    Array.prototype.forEach.call(document.querySelectorAll("#abil .ab, #tiles .tile"),(el) =>{ const k=el.querySelector(".k"), v=el.querySelector(".m, .v"); if(!k||!v) return; const key=k.textContent.trim(), val=FXENV.__miOdoVal?FXENV.__miOdoVal(v):v.textContent.trim(); cur[key]=val;
      if(same&&!MI.rm()&&FXS02B.prev[key]!=null&&FXS02B.prev[key]!==val&&!v.getAttribute("data-miv")&&FXENV.__miOdo&&FXS02B.prev[key].length===val.length){ v.setAttribute("data-miv",FXS02B.prev[key]); v.textContent=FXS02B.prev[key]; FXENV.__miOdo(v,val); } }); };
})();
(function(){
  if(!document.body||!document.body.animate) return;
  ;
  FXS02B.scanLevel=function scanLevel(name,lv){
    if(name&&lv!=null){ const sk="mi-lv:"+name, was=+(FXS02B.ssGet(sk)||0); if(was&&lv>was) setTimeout(() =>{ FXS02B.levelFx(lv); },350); FXS02B.ssSet(sk,String(lv)); } };;
  FXS02B.scanConc=function scanConc(){
    const vc=document.getElementById("vbConc"), on=!!(vc&&!vc.hidden);
    if(FXENV.__miAmb) FXENV.__miAmb();
    if(FXS02B.concWas===true&&!on&&FXENV.__miWow&&FXENV.__miWow.concBreak) FXENV.__miWow.concBreak();
    if(FXS02B.concWas===false&&on&&FXENV.__miBell){ FXENV.__miBell(vc,"#8fb8ff"); const cc=document.querySelector("#conds .chip.conc"); if(cc) FXENV.__miBell(cc,"#8fb8ff"); } FXS02B.concWas=on; };
})();
(function(){
  if(!document.body||!document.body.animate) return;
  ;
  function scan(){ FXS02B.pend=false;
    const nm=document.getElementById("idName"), name=nm?nm.textContent.trim():"", lvb=document.querySelector("#xpBox .xph b"), m=lvb&&/(\d+)/.exec(lvb.textContent), lv=m?+m[1]:null;
    const same=name===FXS02B.who; FXS02B.who=name; const cur={};
    FXS02B.scanStats(same,cur);
    FXS02B.prev=same?Object.assign(FXS02B.prev,cur):cur;
    FXS02B.scanLevel(name,lv);
    FXS02B.scanConc(); }
  new MutationObserver(() =>{ if(!FXS02B.pend){ FXS02B.pend=true; requestAnimationFrame(scan); } }).observe(document.getElementById("app")||document.body,{childList:true,subtree:true,characterData:true});/* the sheet only, so particles added to body do not wake it */
  requestAnimationFrame(scan);

  /* cursor spotlight position for ability scores and stat tiles */
  if(FXS02B.FINE&&!MI.rm()) MI.on("pointermove",(e) =>{ if(e.pointerType!=="mouse"||MI.rm()) return; const t=e.target.closest&&e.target.closest(".ab,.tiles .tile"); if(!t) return; const r=t.getBoundingClientRect();
    t.style.setProperty("--mx",(e.clientX-r.left)+"px"); t.style.setProperty("--my",(e.clientY-r.top)+"px"); },{passive:true});
})();
/* --- v55 round 5: search results, new inventory items, conditions with their own motion --- */
const FXS02C={};
(function(){
  if(!document.body||!document.body.animate) return;
  
  FXS02C.burst=FXENV.__miBurst||function(){}; FXS02C.ring=FXENV.__miRing||function(){};
  FXS02C.C=function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; };;
  FXS02C.rise=function rise(x,y,cols,n){ if(MI.rm()) return; for(let i=0;i<(n||6);i++){ const e=document.createElement("i"), s=5+Math.random()*5; e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background=cols[i%cols.length]; e.style.width=e.style.height=s+"px"; document.body.appendChild(e);
      var dx=(Math.random()-.5)*30, dy=-(26+Math.random()*30), an=e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.5)",opacity:.9},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) scale(1.5)",opacity:0}],{duration:850+Math.random()*300,delay:i*45,easing:"cubic-bezier(.2,.7,.3,1)",fill:"both"});
      (function(e){ an.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },1700); })(e); } };;
  FXS02C.who=function who(){ const n=document.getElementById("idName"); return n?n.textContent.trim():""; };;

  /* 1. Search: results drop in one after another when Search opens, and the letters you typed are marked in each result */
  FXS02C.lastQ=null;
})();
(function(){
  if(!document.body||!document.body.animate) return;
  FXS02C.mark=function mark(b,q){ let tn=null, k; for(k=b.childNodes.length-1;k>=0;k--){ const c=b.childNodes[k]; if(c.nodeType===3&&c.nodeValue.trim()){ tn=c; break; } } if(!tn) return;
    let s=tn.nodeValue, lo=s.toLowerCase(), qt=q.trim().toLowerCase(), qq=qt.replace(/\s+/g,""), on=[], i, j=0; if(!qq) return;
    const at=lo.indexOf(qt); if(at>=0){ for(i=at;i<at+qt.length;i++) on[i]=1; } else { for(i=0;i<s.length&&j<qq.length;i++) if(lo[i]===qq[j]){ on[i]=1; j++; } if(j<qq.length) return; }
    let f=document.createDocumentFragment(), buf="", m=false;
    function flush(){ if(!buf) return; if(m){ const e=document.createElement("mark"); e.textContent=buf; f.appendChild(e); } else f.appendChild(document.createTextNode(buf)); buf=""; }
    for(i=0;i<s.length;i++){ const w=!!on[i]; if(w!==m){ flush(); m=w; } buf+=s[i]; } flush(); const wrap=document.createElement("span"); wrap.appendChild(f); tn.parentNode.replaceChild(wrap,tn); };;/* one span: the row lays its parts out with a gap */
  FXS02C.sb=document.getElementById("sheetBody");
})();