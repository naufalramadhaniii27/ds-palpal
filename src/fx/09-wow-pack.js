/* === WOW pack: screen-wide moments. One pooled full-screen layer for flashes; everything else is added, animated with
   transform and opacity only, and removed by itself (CSS miKill is the hard stop). Full mode only. === */
(function(){
  var MI=window.__MI; if(!MI||!document.body||!document.body.animate) return;
  function full(){ return MI.full(); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function add(cls,html){ var e=document.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; document.body.appendChild(e); setTimeout(function(){ rm(e); },2600); return e; }
  function C(el){ var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function nf(fn){ (window.__miNF||setTimeout)(fn); }
  var FL=null;
  /* edge flash: one layer, reused; colour set once per flash, then only its opacity moves */
  function flash(rgb,peak,dur,dark){ if(!full()) return; if(!FL){ FL=document.createElement("div"); FL.className="mi-flash"; FL.setAttribute("aria-hidden","true"); document.body.appendChild(FL); }
    FL.style.background="radial-gradient(ellipse at center,"+(dark?"rgba(0,0,0,.28)":"transparent")+" 38%,rgba("+rgb+","+(dark?.75:.6)+") 100%)";
    FL.getAnimations().forEach(function(a){ a.cancel(); });
    FL.animate([{opacity:0},{opacity:peak,offset:.18},{opacity:0}],{duration:dur,easing:"ease-out"}); }
  function shake(el,amp){ if(!el||!el.getClientRects().length) return; el.animate([{transform:"translate(0,0)"},{transform:"translate("+(-amp)+"px,1px)"},{transform:"translate("+amp+"px,-1px)"},{transform:"translate("+(-amp*.6)+"px,0)"},{transform:"translate("+(amp*.6)+"px,1px)"},{transform:"translate("+(-amp*.3)+"px,0)"},{transform:"none"}],{duration:380,easing:"linear"}); }
  function hpBox(){ var b=document.getElementById("hpBox"); return b&&b.getClientRects().length?b:document.getElementById("vbHp"); }
  var W={};

  /* W1 Damage: the edges of the screen flash red, the Hit Points box shakes, the number is thrown out large */
  /* W2 Heal: green light blooms from the Hit Points box and sparks rise */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#dmgBtn,#healBtn"); if(!b||!full()) return; var amt=+((document.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return; var heal=b.id==="healBtn";
    nf(function(){ var box=hpBox(); if(!box) return; var p=C(box);
      if(!heal){ var big=Math.min(1,amt/20); flash("229,57,53",.55+.35*big,520+big*260); shake(box,4+big*6); MI.buzz("heavy");
        var n=add("mi-dmgn","-"+amt); n.animate([{transform:"translate("+p.x+"px,"+(p.y-10)+"px) translate(-50%,-50%) scale(.4) rotate(-8deg)",opacity:0},{transform:"translate("+(p.x+18)+"px,"+(p.y-60)+"px) translate(-50%,-50%) scale(1.25) rotate(6deg)",opacity:1,offset:.25},{transform:"translate("+(p.x+34)+"px,"+(p.y-110)+"px) translate(-50%,-50%) scale(1) rotate(10deg)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(n); };
        if(window.__miBurst) window.__miBurst(p.x,p.y,{n:10,colors:["#e5534b","#ff8a80","#7a1f1a"],shape:"mi-spark",dist:60,dur:600,grav:true}); }
      else { flash("76,194,122",.35,700); var g=add("mi-bloom"); g.style.left=p.x+"px"; g.style.top=p.y+"px";
        g.animate([{transform:"translate(-50%,-50%) scale(.2)",opacity:.9},{transform:"translate(-50%,-50%) scale(1.6)",opacity:0}],{duration:800,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); };
        rise(p.x,p.y,["#4cc27a","#b9f6ca","#ffffff"],18); MI.buzz("success"); } }); },true);

  /* sparks that float up from a point */
  function rise(x,y,cols,n){ for(var i=0;i<n;i++){ var d=add("mi-wdot"); d.style.background=cols[i%cols.length]; var dx=(Math.random()-.5)*120, dy=-(80+Math.random()*140), s=.6+Math.random()*.8;
      d.animate([{transform:"translate("+x+"px,"+y+"px) scale("+s+")",opacity:0},{transform:"translate("+(x+dx*.4)+"px,"+(y+dy*.4)+"px) scale("+s+")",opacity:1,offset:.2},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) scale(.2)",opacity:0}],{duration:900+Math.random()*500,delay:Math.random()*160,easing:"cubic-bezier(.2,.7,.3,1)",fill:"backwards"}).onfinish=(function(d){ return function(){ rm(d); }; })(d); } }

  /* W3 Level Up: golden rays turn across the whole screen behind the existing fanfare, then confetti falls */
  W.level=function(x,y){ if(!full()) return; var r=add("mi-rays"); r.style.left=x+"px"; r.style.top=y+"px";
    r.animate([{transform:"translate(-50%,-50%) scale(.3) rotate(0)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(25deg)",opacity:.85,offset:.3},{transform:"translate(-50%,-50%) scale(1.25) rotate(60deg)",opacity:0}],{duration:1900,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=function(){ rm(r); };
    flash("255,201,60",.4,900);
    var cols=["#ffd166","#ff8fc7","#7cb6ff","#4cc27a","#ffffff","#ff6b3d"];
    for(var i=0;i<34;i++){ var f=add("mi-conf"); f.style.background=cols[i%cols.length]; var sx=Math.random()*innerWidth, ex=sx+(Math.random()-.5)*160, rot=Math.random()*720-360;
      f.animate([{transform:"translate("+sx+"px,-30px) rotate(0)",opacity:1},{transform:"translate("+ex+"px,"+(innerHeight*.95)+"px) rotate("+rot+"deg)",opacity:.9,offset:.9},{transform:"translate("+ex+"px,"+(innerHeight+20)+"px) rotate("+rot+"deg)",opacity:0}],{duration:1500+Math.random()*700,delay:250+Math.random()*350,easing:"cubic-bezier(.4,0,.2,1)",fill:"backwards"}).onfinish=(function(f){ return function(){ rm(f); }; })(f); } };

  /* W5 Long Rest: a dawn light sweeps up the screen. W6 Short Rest: embers rise from the bottom */
  W.rest=function(kind){ if(!full()) return;
    if(kind==="long"){ var s=add("mi-dawn"); s.animate([{transform:"translateY(100vh)",opacity:0},{transform:"translateY(40vh)",opacity:1,offset:.35},{transform:"translateY(-70vh)",opacity:0}],{duration:1600,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=function(){ rm(s); }; }
    else { for(var i=0;i<18;i++){ var x=Math.random()*innerWidth; (function(){ var d=add("mi-wdot mi-ember"); var dx=(Math.random()-.5)*60, h=innerHeight*(.35+Math.random()*.4);
        d.animate([{transform:"translate("+x+"px,"+(innerHeight+10)+"px) scale(1)",opacity:0},{transform:"translate("+(x+dx*.5)+"px,"+(innerHeight-h*.4)+"px) scale(1)",opacity:1,offset:.3},{transform:"translate("+(x+dx)+"px,"+(innerHeight-h)+"px) scale(.3)",opacity:0}],{duration:1300+Math.random()*700,delay:Math.random()*400,easing:"ease-out",fill:"backwards"}).onfinish=function(){ rm(d); }; })(); } } };

  /* W7 Cast: a magic circle turns and grows out of the button */
  W.cast=function(x,y){ if(!full()) return; var m=add("mi-mcirc",'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="34" stroke-dasharray="4 6"/><path d="M50 8 L86 71 L14 71 Z M50 92 L14 29 L86 29 Z"/></svg>'); m.style.left=x+"px"; m.style.top=y+"px";
    m.animate([{transform:"translate(-50%,-50%) scale(.2) rotate(0)",opacity:0},{transform:"translate(-50%,-50%) scale(1) rotate(90deg)",opacity:1,offset:.45},{transform:"translate(-50%,-50%) scale(1.5) rotate(160deg)",opacity:0}],{duration:950,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(m); }; };

  /* W8 Death save: success pulses green, failure pulses red and darkens */
  W.save=function(k){ if(!full()) return; if(k==="s") flash("76,194,122",.4,600); else if(k==="20") flash("76,194,122",.6,900); else if(k==="f"||k==="d") flash("229,57,53",.45,650,true); else if(k==="1"||k==="c"){ flash("229,57,53",.75,950,true); var b=hpBox(); if(b) shake(b,9); MI.buzz("heavy"); } };

  /* W9 Condition added: its icon drops onto the chip like a stamp */
  W.stamp=function(el,col){ if(!full()) return; var ic=el.querySelector("svg"); if(!ic) return; var p=C(el), s=add("mi-stamp"); s.appendChild(ic.cloneNode(true)); s.style.color=col||"#fff"; s.style.left=p.x+"px"; s.style.top=p.y+"px";
    s.animate([{transform:"translate(-50%,-50%) scale(3.2) rotate(-12deg)",opacity:0},{transform:"translate(-50%,-50%) scale(1.05) rotate(0)",opacity:1,offset:.55},{transform:"translate(-50%,-50%) scale(1)",opacity:0}],{duration:520,easing:"cubic-bezier(.5,0,.75,0)"}).onfinish=function(){ rm(s); };
    setTimeout(function(){ shake(el,3); },280); };

  /* W10 Heroic Inspiration: a gold coin spins up out of the tile */
  W.coin=function(el){ if(!full()) return; var p=C(el), c=add("mi-coin","<b>&#10022;</b>"); c.style.left=p.x+"px"; c.style.top=p.y+"px";
    c.animate([{transform:"translate(-50%,-50%) translateY(0) rotateY(0) scale(.5)",opacity:0},{transform:"translate(-50%,-50%) translateY(-70px) rotateY(540deg) scale(1.15)",opacity:1,offset:.55},{transform:"translate(-50%,-50%) translateY(-90px) rotateY(720deg) scale(1)",opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(c); }; };

  window.__miWow=W;
})();

