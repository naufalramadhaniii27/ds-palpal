/* micro-interactions, My Characters: cards rise in */
(function(){
  if(!document.body||!document.body.animate) return;
  /* 7. My Characters: cards rise in one after another, names decode, the cards tilt toward the mouse, Create a Character pulls toward it */
  function nameIn(el,delay){ el.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:420,delay:delay+120,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); }
  function homeEnter(){ if(MI.rm()) return; const g=document.getElementById("hgrid"); if(!g) return;
    Array.prototype.forEach.call(g.querySelectorAll(".hcard"),(c,i) =>{ const dl=Math.min(i,10)*60; c.style.animationDelay=dl+"ms"; c.classList.add("mi-in");
      setTimeout(() =>{ c.classList.remove("mi-in"); c.style.animationDelay=""; },620+dl); const b=c.querySelector(".hname b"); if(b) nameIn(b,dl); }); }
  function watchHome(h){ if(h.__mi) return; h.__mi=1; let was=h.hidden; if(!was) setTimeout(homeEnter,30);
    new MutationObserver(() =>{ if(was&&!h.hidden) setTimeout(homeEnter,30); was=h.hidden; }).observe(h,{attributes:true,attributeFilter:["hidden"]}); }
  const hv=document.getElementById("homeV"); if(hv) watchHome(hv);
  else { var mo=new MutationObserver(() =>{ const h=document.getElementById("homeV"); if(h){ watchHome(h); mo.disconnect(); } }); mo.observe(document.body,{childList:true}); }
})();
/* the sheet opens from a card: the card grows to fill the screen, then the sheet fades in */
(function(){
  if(!document.body||!document.body.animate) return;
  /* View or Edit on a card: the card grows to fill the screen, then the sheet fades in. Switching reloads the page,
     so the cover ends in the page colour and the new page fades in from that same colour (no flash). */
  if(document.documentElement.classList.contains("mi-arrive")) setTimeout(() =>{ document.documentElement.classList.remove("mi-arrive"); },650);
  let leaving=false; FXENV.addEventListener("beforeunload",() =>{ leaving=true; });
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
      __miNF(() =>{ __miNF(() =>{ const hv=document.getElementById("homeV"); if(!hv||hv.hidden) fadeOut(); else setTimeout(() =>{ if(!leaving) fadeOut(); },2500); }); }); }
    ex.onfinish=go; setTimeout(go,600); },true);/* the app builds the sheet while the cover is still, never in the middle of the motion */
})();
/* the cards tilt toward the mouse */
(function(){
  if(!document.body||!document.body.animate) return;
  const FINE=!!(FXENV.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  if(FINE&&!MI.rm()){ let cur=null;
    const untilt=function(c){ c.classList.remove("mi-tilt"); c.style.transform=""; if(cur===c) cur=null; };
    MI.on("pointermove",(e) =>{ if(e.pointerType!=="mouse"||MI.rm()) return; const c=e.target.closest&&e.target.closest("#homeV .hcard"); if(cur&&cur!==c) untilt(cur); if(c){ cur=c; const r=c.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        c.classList.add("mi-tilt"); c.style.transform="perspective(900px) rotateX("+((.5-py)*6).toFixed(2)+"deg) rotateY("+((px-.5)*8).toFixed(2)+"deg) translateY(-3px)";
        c.style.setProperty("--mx",(px*100).toFixed(1)+"%"); c.style.setProperty("--my",(py*100).toFixed(1)+"%"); }
      /* the Create button no longer follows the mouse: it pushed into its neighbours */

      },{passive:true});
    document.documentElement.addEventListener("mouseleave",() =>{ if(cur) untilt(cur); }); }
})();
/* a touch on a card lights it (holo) */
(function(){
  if(!document.body||!document.body.animate) return;
  MI.on("pointerdown",(e) =>{ if(e.pointerType==="mouse"||!MI.full()) return; const c=e.target.closest&&e.target.closest("#homeV .hcard"); if(!c||e.target.closest("button,input,select,a")) return;
    const r=c.getBoundingClientRect(); c.style.setProperty("--mx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%"); c.style.setProperty("--my",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
    c.classList.remove("mi-holo"); void c.offsetWidth; c.classList.add("mi-holo"); setTimeout(() =>{ c.classList.remove("mi-holo"); },720); },{passive:true});
})();
