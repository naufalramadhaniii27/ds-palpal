/* === WOW pack: screen-wide moments. One pooled full-screen layer for flashes; everything else is added, animated with
   transform and opacity only, and removed by itself (CSS miKill is the hard stop). Full mode only. === */
const FXS09A={};
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body||!document.body.animate) return;
  FXS09A.full=function full(){ return MI.full(); };;
  FXS09A.rm=function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); };;
  FXS09A.add=function add(cls,html){ const e=document.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; document.body.appendChild(e); setTimeout(() =>{ FXS09A.rm(e); },2600); return e; };;
  FXS09A.C=function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; };;
  FXS09A.nf=function nf(fn){ (FXENV.__miNF||setTimeout)(fn); };;
  let FL=null;
  /* edge flash: one layer, reused; colour set once per flash, then only its opacity moves */
  FXS09A.flash=function flash(rgb,peak,dur,dark){ if(!FXS09A.full()) return; if(!FL){ FL=document.createElement("div"); FL.className="mi-flash"; FL.setAttribute("aria-hidden","true"); document.body.appendChild(FL); }
    FL.style.background="radial-gradient(ellipse at center,"+(dark?"rgba(0,0,0,.28)":"transparent")+" 38%,rgba("+rgb+","+(dark?.75:.6)+") 100%)";
    FL.getAnimations().forEach((a) =>{ a.cancel(); });
    FL.animate([{opacity:0},{opacity:peak,offset:.18},{opacity:0}],{duration:dur,easing:"ease-out"}); };;
  FXS09A.shake=function shake(el,amp){ if(!el||!el.getClientRects().length) return; el.animate([{transform:"translate(0,0)"},{transform:"translate("+(-amp)+"px,1px)"},{transform:"translate("+amp+"px,-1px)"},{transform:"translate("+(-amp*.6)+"px,0)"},{transform:"translate("+(amp*.6)+"px,1px)"},{transform:"translate("+(-amp*.3)+"px,0)"},{transform:"none"}],{duration:380,easing:"linear"}); };;
  FXS09A.hpBox=function hpBox(){ const b=document.getElementById("hpBox"); return b&&b.getClientRects().length?b:document.getElementById("vbHp"); };;
  FXS09A.W={};
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body||!document.body.animate) return;
  /* W1 Damage: the edges of the screen flash red, the Hit Points box shakes, the number is thrown out large */
  /* W2 Heal: green light blooms from the Hit Points box and sparks rise */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#dmgBtn,#healBtn"); if(!b||!FXS09A.full()) return; const amt=+((document.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return; const heal=b.id==="healBtn";
    FXS09A.nf(() =>{ const box=FXS09A.hpBox(); if(!box) return; const p=FXS09A.C(box);
      if(!heal){ const big=Math.min(1,amt/20); FXS09A.flash("229,57,53",.55+.35*big,520+big*260); FXS09A.shake(box,4+big*6); MI.buzz("heavy");
        const n=FXS09A.add("mi-dmgn","-"+amt); n.animate([{transform:"translate("+p.x+"px,"+(p.y-10)+"px) translate(-50%,-50%) scale(.4) rotate(-8deg)",opacity:0},{transform:"translate("+(p.x+18)+"px,"+(p.y-60)+"px) translate(-50%,-50%) scale(1.25) rotate(6deg)",opacity:1,offset:.25},{transform:"translate("+(p.x+34)+"px,"+(p.y-110)+"px) translate(-50%,-50%) scale(1) rotate(10deg)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ FXS09A.rm(n); };
        if(FXENV.__miBurst) FXENV.__miBurst(p.x,p.y,{n:10,colors:["#e5534b","#ff8a80","#7a1f1a"],shape:"mi-spark",dist:60,dur:600,grav:true}); }
      else { FXS09A.flash("76,194,122",.35,700); const g=FXS09A.add("mi-bloom"); g.style.left=p.x+"px"; g.style.top=p.y+"px";
        g.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:.9},{transform:"translate(-50%,-50%) scale(1.6)",opacity:0}],{duration:800,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ FXS09A.rm(g); };
        rise(p.x,p.y,["#4cc27a","#b9f6ca","#ffffff"],18); MI.buzz("success"); } }); },true);

  /* sparks that float up from a point */
  function rise(x,y,cols,n){ for(let i=0;i<n;i++){ const d=FXS09A.add("mi-wdot"); d.style.background=cols[i%cols.length]; const dx=(Math.random()-.5)*120, dy=-(80+Math.random()*140), s=.6+Math.random()*.8;
      d.animate([{transform:"translate("+x+"px,"+y+"px) scale("+s+")",opacity:0},{transform:"translate("+(x+dx*.4)+"px,"+(y+dy*.4)+"px) scale("+s+")",opacity:1,offset:.2},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) scale(.2)",opacity:0}],{duration:900+Math.random()*500,delay:Math.random()*160,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards"}).onfinish=(function(d){ return function(){ FXS09A.rm(d); }; })(d); } }

  /* W3 Level Up: golden rays turn across the whole screen behind the existing fanfare, then confetti falls */
  FXS09A.W.level=function(x,y){ if(!FXS09A.full()) return; const r=FXS09A.add("mi-rays"); r.style.left=x+"px"; r.style.top=y+"px";
    r.animate([{transform:"translate(-50%,-50%) scale(.3) rotate(0)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(25deg)",opacity:.85,offset:.3},{transform:"translate(-50%,-50%) scale(1.25) rotate(60deg)",opacity:0}],{duration:1900,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=function(){ FXS09A.rm(r); };
    FXS09A.flash("255,201,60",.4,900);
    const cols=["#ffd166","#ff8fc7","#7cb6ff","#4cc27a","#ffffff","#ff6b3d"];
    for(let i=0;i<34;i++){ const f=FXS09A.add("mi-conf"); f.style.background=cols[i%cols.length]; const sx=Math.random()*innerWidth, ex=sx+(Math.random()-.5)*160, rot=Math.random()*720-360;
      f.animate([{transform:"translate("+sx+"px,-30px) rotate(0)",opacity:1},{transform:"translate("+ex+"px,"+(innerHeight*.95)+"px) rotate("+rot+"deg)",opacity:.9,offset:.9},{transform:"translate("+ex+"px,"+(innerHeight+20)+"px) rotate("+rot+"deg)",opacity:0}],{duration:1500+Math.random()*700,delay:250+Math.random()*350,easing:"cubic-bezier(.4,0,.2,1)",fill:"backwards"}).onfinish=(function(f){ return function(){ FXS09A.rm(f); }; })(f); } };

  /* W5 Long Rest: a dawn light sweeps up the screen. W6 Short Rest: embers rise from the bottom */
  FXS09A.W.rest=function(kind){ if(!FXS09A.full()) return;
    if(kind==="long"){ const s=FXS09A.add("mi-dawn"); s.animate([{transform:"translateY(100vh)",opacity:0},{transform:"translateY(40vh)",opacity:1,offset:.35},{transform:"translateY(-70vh)",opacity:0}],{duration:1600,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=function(){ FXS09A.rm(s); }; }
    else { for(let i=0;i<18;i++){ var x=Math.random()*innerWidth; (function(){ const d=FXS09A.add("mi-wdot mi-ember"); const dx=(Math.random()-.5)*60, h=innerHeight*(.35+Math.random()*.4);
        d.animate([{transform:"translate("+x+"px,"+(innerHeight+10)+"px) scale(1)",opacity:0},{transform:"translate("+(x+dx*.5)+"px,"+(innerHeight-h*.4)+"px) scale(1)",opacity:1,offset:.3},{transform:"translate("+(x+dx)+"px,"+(innerHeight-h)+"px) scale(.3)",opacity:0}],{duration:1300+Math.random()*700,delay:Math.random()*400,easing:"ease-out",fill:"backwards"}).onfinish=function(){ FXS09A.rm(d); }; })(); } } };

  /* W7 Cast: a magic circle turns and grows out of the button */
  FXS09A.W.cast=function(x,y){ if(!FXS09A.full()) return; const m=FXS09A.add("mi-mcirc",'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="34" stroke-dasharray="4 6"/><path d="M50 8 L86 71 L14 71 Z M50 92 L14 29 L86 29 Z"/></svg>'); m.style.left=x+"px"; m.style.top=y+"px";
    m.animate([{transform:"translate(-50%,-50%) scale(.2) rotate(0)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(90deg)",opacity:1,offset:.45},{transform:"translate(-50%,-50%) scale(1.5) rotate(160deg)",opacity:0}],{duration:950,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ FXS09A.rm(m); }; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body||!document.body.animate) return;
  /* W8 Death save: success pulses green, failure pulses red and darkens */
  FXS09A.W.save=function(k){ if(!FXS09A.full()) return; if(k==="s") FXS09A.flash("76,194,122",.4,600); else if(k==="20") FXS09A.flash("76,194,122",.6,900); else if(k==="f"||k==="d") FXS09A.flash("229,57,53",.45,650,true); else if(k==="1"||k==="c"){ FXS09A.flash("229,57,53",.75,950,true); const b=FXS09A.hpBox(); if(b) FXS09A.shake(b,9); MI.buzz("heavy"); } };

  /* W9 Condition added: its icon drops onto the chip like a stamp */
  FXS09A.W.stamp=function(el,col){ if(!FXS09A.full()) return; const ic=el.querySelector("svg"); if(!ic) return; const p=FXS09A.C(el), s=FXS09A.add("mi-stamp"); s.appendChild(ic.cloneNode(true)); s.style.color=col||"#fff"; s.style.left=p.x+"px"; s.style.top=p.y+"px";
    s.animate([{transform:"translate(-50%,-50%) scale(3.2) rotate(-12deg)",opacity:0},{transform:"translate(-50%,-50%) scale(1.05) rotate(0)",opacity:1,offset:.55},{transform:"translate(-50%,-50%) scale(1)",opacity:0}],{duration:520,easing:"cubic-bezier(.5,0,.75,0)"}).onfinish=function(){ FXS09A.rm(s); };
    setTimeout(() =>{ FXS09A.shake(el,3); },280); };

  /* W10 Heroic Inspiration: a gold coin spins up out of the tile */
  FXS09A.W.coin=function(el){ if(!FXS09A.full()) return; const p=FXS09A.C(el), c=FXS09A.add("mi-coin","<b>&#10022;</b>"); c.style.left=p.x+"px"; c.style.top=p.y+"px";
    c.animate([{transform:"translate(-50%,-50%) translateY(0) rotateY(0) scale(.5)",opacity:0},{transform:"translate(-50%,-50%) translateY(-70px) rotateY(540deg) scale(1.15)",opacity:1,offset:.55},{transform:"translate(-50%,-50%) translateY(-90px) rotateY(720deg) scale(1)",opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ FXS09A.rm(c); }; };

  FXENV.__miWow=FXS09A.W;
})();
