/* === Round 6: the final list. Every effect here moves only transform and opacity, adds nothing it does not take away itself,
   and has a hard stop in CSS (miKill) for anything it adds. === */
(function(){
  var MI=window.__MI; if(!MI||!document.body||!document.body.animate) return;
  var EASE="cubic-bezier(.2,.8,.2,1)", POP="cubic-bezier(.3,1.5,.5,1)";
  function C(el){ var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function vis(r){ return r&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth; }
  function later(fn){ __miNF(function(){ __miNF(fn); }); }/* after the app has redrawn */
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }

  /* B1 Flying Button: an item added in the Builder flies into the Equipment step */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#bld [data-iadd],#bld [data-custadd]"); if(!b||MI.rm()) return; var p=C(b); if(!vis(p.r)) return;
    later(function(){ var t=document.querySelector('#steps [data-step="equip"]'); if(!t) return; var q=C(t); if(!vis(q.r)) return;
      var d=document.createElement("i"); d.className="mi-fly"; d.setAttribute("aria-hidden","true"); document.body.appendChild(d);
      var dx=q.x-p.x, dy=q.y-p.y, lift=Math.min(-60,dy*.5-60);
      var an=d.animate([{transform:"translate("+p.x+"px,"+p.y+"px) scale(.6)",opacity:0},{transform:"translate("+(p.x+dx*.15)+"px,"+(p.y+lift*.6)+"px) scale(1.15)",opacity:1,offset:.25},{transform:"translate("+(p.x+dx*.6)+"px,"+(p.y+lift)+"px) scale(1)",opacity:1,offset:.6},{transform:"translate("+q.x+"px,"+q.y+"px) scale(.35)",opacity:.2}],{duration:620,easing:"cubic-bezier(.45,.05,.4,1)"});
      an.onfinish=function(){ rm(d); var t2=document.querySelector('#steps [data-step="equip"]'); if(t2) t2.animate([{transform:"scale(1)"},{transform:"scale(1.14)",offset:.4},{transform:"none"}],{duration:380,easing:POP}); MI.buzz("light"); };
      setTimeout(function(){ rm(d); },1200); }); },true);

  /* B2 Code Slots: Roll in the Builder spins the number like a slot reel before it lands */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#bld [data-roll]"); if(!b||MI.rm()) return; var key=b.getAttribute("data-roll"), hd=+b.getAttribute("data-hd")||8;
    later(function(){ var inp=document.querySelector('#bld [data-hpr="'+CSS.escape(key)+'"]'); if(!inp) return; var r=inp.getBoundingClientRect(); if(!vis(r)) return; var v=inp.value; if(!v) return;
      var cs=getComputedStyle(inp), w=document.createElement("span"), col=document.createElement("span"), seq=[];
      for(var i=0;i<9;i++) seq.push(1+Math.floor(Math.random()*hd)); seq.push(v);
      var bw=parseFloat(cs.borderTopWidth)||0, H=r.height-bw*2, bg=cs.backgroundColor; if(!bg||/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) bg="var(--panel)";
      w.className="mi-slot"; w.setAttribute("aria-hidden","true"); w.style.cssText="left:"+(r.left+bw)+"px;top:"+(r.top+bw)+"px;width:"+(r.width-bw*2)+"px;height:"+H+"px;font:"+cs.font+";color:"+cs.color+";text-align:"+cs.textAlign+";background:"+bg+";border-radius:"+cs.borderRadius;
      col.innerHTML=seq.map(function(n){ return "<b style=\"height:"+H+"px;line-height:"+H+"px\">"+n+"</b>"; }).join(""); w.appendChild(col); document.body.appendChild(w);/* the reel sits inside the box and covers its number; the box itself is not touched */
      var an=col.animate([{transform:"translateY(0)"},{transform:"translateY(-"+(H*(seq.length-1))+"px)"}],{duration:560,easing:"cubic-bezier(.15,.6,.2,1.02)",fill:"forwards"});
      an.onfinish=function(){ w.animate([{opacity:1},{opacity:0}],{duration:90}).onfinish=function(){ rm(w); }; inp.animate([{transform:"scale(1.12)"},{transform:"none"}],{duration:260,easing:POP}); MI.buzz("medium"); };
      setTimeout(function(){ rm(w); },1200); }); },true);

  /* B3 Pulse Heart: the heart beside Hit Points beats once on a heal */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#healBtn,[data-vbheal]"); if(!b||MI.rm()) return;
    later(function(){ Array.prototype.forEach.call(document.querySelectorAll("#hpBox .hp-h svg,#vbHp .vb-h svg"),function(s){ if(!s.getClientRects().length) return;
      s.animate([{transform:"scale(1)"},{transform:"scale(1.35)",offset:.18},{transform:"scale(.92)",offset:.36},{transform:"scale(1.18)",offset:.52},{transform:"none"}],{duration:620,easing:"ease-out"}); }); }); },true);

  /* B4 Animated List after a filter: the rows of that list come in one after another */
  var ROWS=".sp-r,.irow,.arow,.fitem,.aitem,.skr,.svr";
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest(".ifb"); if(!b||b.classList.contains("on")||!MI.full()) return; var pg=b.closest("section,[id^='p-']"); if(!pg) return; var id=pg.id;
    later(function(){ var root=id?document.getElementById(id):null; if(!root) return; var n=0;
      Array.prototype.some.call(root.querySelectorAll(ROWS),function(r){ if(!r.getClientRects().length) return false; var q=r.getBoundingClientRect(); if(q.top>innerHeight) return true; if(q.bottom<0) return false;
        r.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:260,delay:n*32,easing:EASE,fill:"backwards"}); return ++n>=8; }); }); },true);

  /* B5 Heading reveal: a page title rises in the first time it comes on screen (the class stays, so nothing is left to undo) */
  if(window.IntersectionObserver){ var hio=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return; hio.unobserve(en.target); if(!MI.rm()) en.target.classList.add("mi-hd"); }); },{threshold:.6});
    Array.prototype.forEach.call(document.querySelectorAll(".ptitle"),function(h){ hio.observe(h); }); }

  /* B7 Stepper: a Builder step that becomes complete pops its badge */
  var stOk={}, stq=0, stp=document.getElementById("steps");
  function stScan(){ stq=0; var bs=stp.querySelectorAll("[data-step]"); Array.prototype.forEach.call(bs,function(b){ var k=b.getAttribute("data-step"), g=b.querySelector(".sprog"), ok=!!(g&&g.classList.contains("ok"));
      if(ok&&stOk[k]===false&&!MI.rm()){ g.animate([{transform:"scale(.6)",opacity:.4},{transform:"scale(1.25)",opacity:1,offset:.5},{transform:"none"}],{duration:420,easing:POP}); b.animate([{transform:"translateY(0)"},{transform:"translateY(-3px)",offset:.4},{transform:"none"}],{duration:420,easing:POP}); MI.buzz("success"); }
      stOk[k]=g?ok:undefined; }); }
  if(stp){ new MutationObserver(function(){ if(!stq) stq=requestAnimationFrame(stScan); }).observe(stp,{childList:true}); stScan(); }

  /* B8 Card Swap: switching combos in Combat View deals the new combo in from the side you moved toward */
  var cmbI=null;
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("[data-cmbtab]"); if(!b||MI.rm()) return; var to=+b.getAttribute("data-cmbtab"), on=document.querySelector(".cmb-tab.on"), from=on?+on.getAttribute("data-cmbtab"):to; if(to===from) return; var dir=to>from?1:-1;
    later(function(){ var top=document.querySelector(".cmb .cmb-top"); if(!top) return; var n=top.nextElementSibling, i=0;
      while(n&&i<6){ if(n.getClientRects().length) n.animate([{opacity:0,transform:"translateX("+(dir*34)+"px) rotate("+(dir*1.2)+"deg) scale(.97)"},{opacity:1,transform:"none"}],{duration:320,delay:i*30,easing:EASE,fill:"backwards"}); n=n.nextElementSibling; i++; } }); },true);

  /* B9 Profile Card: the portrait tilts under a mouse and catches a sheen when touched */
  var ph=document.getElementById("photo");
  if(ph){ var phOn=false;
    MI.on("pointermove",function(e){ if(e.pointerType!=="mouse"||MI.rm()) return; var inn=ph.contains(e.target);
      if(inn){ var r=ph.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height; phOn=true; ph.classList.add("mi-ptilt");
        ph.style.transform="perspective(600px) rotateX("+((.5-py)*10).toFixed(2)+"deg) rotateY("+((px-.5)*12).toFixed(2)+"deg)"; ph.style.setProperty("--mx",(px*100).toFixed(1)+"%"); ph.style.setProperty("--my",(py*100).toFixed(1)+"%"); }
      else if(phOn){ phOn=false; ph.classList.remove("mi-ptilt"); ph.style.transform=""; } },{passive:true});
    MI.on("pointerdown",function(e){ if(e.pointerType==="mouse"||!MI.full()||!ph.contains(e.target)) return; ph.classList.remove("mi-psheen"); void ph.offsetWidth; ph.classList.add("mi-psheen"); },{passive:true}); }

  /* B12 Specular / Glare: under a mouse, a soft light follows the pointer on main buttons and sheet cards. One pooled light, moved with transform */
  var GSEL=".btn.pri:not(.lvup),.hcreate,#sheet .card,.tiles .tile,.ab", gw=null, gi=null, gcur=null;
  function gHide(){ if(gw){ gw.style.opacity="0"; } gcur=null; }
  MI.on("pointermove",function(e){ if(e.pointerType!=="mouse"||!MI.full()) return; var t=e.target.closest&&e.target.closest(GSEL); if(!t){ if(gcur) gHide(); return; }
    var r=t.getBoundingClientRect();
    if(!gw){ gw=document.createElement("span"); gw.className="mi-glarew"; gw.setAttribute("aria-hidden","true"); gi=document.createElement("i"); gw.appendChild(gi); document.body.appendChild(gw); }
    if(gcur!==t){ gcur=t; gw.style.cssText="left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+getComputedStyle(t).borderRadius+";opacity:1"; }
    gi.style.transform="translate("+(e.clientX-r.left-90)+"px,"+(e.clientY-r.top-90)+"px)"; },{passive:true});
  MI.on("scroll",gHide,true); MI.on("pointerdown",gHide,true); document.documentElement.addEventListener("mouseleave",gHide);

})();

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
      f.animate([{transform:"translate("+sx+"px,-30px) rotate(0)",opacity:1},{transform:"translate("+ex+"px,"+(innerHeight*.95)+"px) rotate("+rot+"deg)",opacity:.9,offset:.9},{transform:"translate("+ex+"px,"+(innerHeight+20)+"px) rotate("+rot+"deg)",opacity:0}],{duration:1500+Math.random()*700,delay:250+Math.random()*350,easing:"cubic-bezier(.3,.1,.6,1)",fill:"backwards"}).onfinish=(function(f){ return function(){ rm(f); }; })(f); } };

  /* W5 Long Rest: a dawn light sweeps up the screen. W6 Short Rest: embers rise from the bottom */
  W.rest=function(kind){ if(!full()) return;
    if(kind==="long"){ var s=add("mi-dawn"); s.animate([{transform:"translateY(100vh)",opacity:0},{transform:"translateY(40vh)",opacity:1,offset:.35},{transform:"translateY(-70vh)",opacity:0}],{duration:1600,easing:"cubic-bezier(.3,.6,.3,1)"}).onfinish=function(){ rm(s); }; }
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

/* === X pack: more screen-wide moments. Same rules as the WOW pack. === */
(function(){
  var MI=window.__MI, W=window.__miWow; if(!MI||!W||!document.body.animate) return;
  function full(){ return MI.full(); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function add(cls,html){ var e=document.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; document.body.appendChild(e); setTimeout(function(){ rm(e); },2600); return e; }
  function C(el){ var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function nf(fn){ (window.__miNF||setTimeout)(fn); }
  function later(fn){ nf(function(){ nf(fn); }); }
  var FL=null;
  function flash(bg,peak,dur){ if(!full()) return; if(!FL){ FL=document.createElement("div"); FL.className="mi-flash mi-flash2"; FL.setAttribute("aria-hidden","true"); document.body.appendChild(FL); }
    FL.style.background=bg; FL.getAnimations().forEach(function(a){ a.cancel(); }); FL.animate([{opacity:0},{opacity:peak,offset:.2},{opacity:0}],{duration:dur,easing:"ease-out"}); }
  function edge(rgb,a){ return "radial-gradient(ellipse at center,transparent 38%,rgba("+rgb+","+a+") 100%)"; }
  function hpBox(){ var b=document.getElementById("hpBox"); return b&&b.getClientRects().length?b:document.getElementById("vbHp"); }
  function sweep(cls,txt,dir){ var s=add("mi-sweep "+cls,txt?"<b>"+txt+"</b>":""); var a=dir<0?["110vw","-110vw"]:["-110vw","110vw"];
    s.animate([{transform:"translateX("+a[0]+") skewX(-14deg)",opacity:0},{transform:"translateX(0) skewX(-14deg)",opacity:1,offset:.42},{transform:"translateX(0) skewX(-14deg)",opacity:1,offset:.58},{transform:"translateX("+a[1]+") skewX(-14deg)",opacity:0}],{duration:900,easing:"cubic-bezier(.6,0,.4,1)"}).onfinish=function(){ rm(s); }; }

  /* X1 Hit Points fall to 0: the edges close in dark and the screen beats twice. X2 back up from 0: a column of gold light rises */
  var hb=document.getElementById("hpBox"), was0=hb?hb.classList.contains("hp0"):false;
  if(hb) new MutationObserver(function(){ var z=hb.classList.contains("hp0"); if(z===was0) return; var from0=was0; was0=z; if(!full()) return; var box=hpBox(); if(!box) return; var p=C(box);
      if(z){ flash("radial-gradient(ellipse at center,rgba(0,0,0,.25) 30%,rgba(120,0,0,.85) 100%)",.95,1400); setTimeout(function(){ flash(edge("200,20,20",.8),.8,700); },520);
        box.animate([{transform:"none"},{transform:"translateY(10px) scale(.97)",offset:.25},{transform:"translateY(-3px)",offset:.55},{transform:"none"}],{duration:620,easing:"cubic-bezier(.3,.7,.3,1)"}); MI.buzz("heavy"); }
      else if(from0){ var col=add("mi-revive"); col.style.left=p.x+"px"; col.style.top=p.y+"px";
        col.animate([{transform:"translate(-50%,-100%) scaleY(.1)",opacity:0},{transform:"translate(-50%,-100%) scaleY(1)",opacity:1,offset:.35},{transform:"translate(-50%,-110%) scaleY(1.1)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(col); };
        flash(edge("255,201,60",.55),.7,900); if(window.__miBurst) window.__miBurst(p.x,p.y,{n:16,colors:["#ffd166","#fff3b0","#4cc27a"],shape:"mi-star",dist:110,dur:1100}); MI.buzz("success"); } }).observe(hb,{attributes:true,attributeFilter:["class"]});

  /* X3 Temporary Hit Points go up: a blue shield ring closes round the box and a sheen crosses it */
  var tmpPrev=null; function tmpVal(){ var t=document.getElementById("tmpV"); return t?(+t.value||0):0; } tmpPrev=tmpVal();
  function tmpCheck(){ var v=tmpVal(); if(tmpPrev!=null&&v>tmpPrev&&full()){ var box=hpBox(); if(box){ var p=C(box), s=add("mi-shield"); s.style.left=p.r.left+"px"; s.style.top=p.r.top+"px"; s.style.width=p.r.width+"px"; s.style.height=p.r.height+"px";
        s.animate([{transform:"scale(1.15)",opacity:0},{transform:"scale(1)",opacity:1,offset:.4},{transform:"scale(1.02)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(s); };
        if(window.__miRing) window.__miRing(p.x,p.y,"#7cb6ff",Math.max(p.r.width,p.r.height)); MI.buzz("medium"); } } tmpPrev=v; }
  MI.on("click",function(e){ if(e.target.closest&&e.target.closest("[data-tmp],[data-tmpapply],[data-tmpset],[data-tmproll],[data-tmpdice]")) later(tmpCheck); },true);
  MI.on("change",function(e){ if(e.target&&e.target.id==="tmpV") later(tmpCheck); },true);

  /* X4 Combat View opens: a blade sweeps across the screen. X5 End Turn: a band sweeps with Next Turn. X6 Use: a hit from the button */
  var sh=document.getElementById("sheet"), cbvWas=false;
  var cbvChk=function(){ var on=!!document.querySelector("#sheet.on #cbv"); if(on&&!cbvWas&&full()){ sweep("mi-blade","",1); flash(edge("229,57,53",.6),.6,700); MI.buzz("medium"); } cbvWas=on; }; if(sh){ var cbvMO=new MutationObserver(cbvChk); cbvMO.observe(sh,{attributes:true,attributeFilter:["class"]}); var sbd=document.getElementById("sheetBody"); if(sbd) cbvMO.observe(sbd,{childList:true}); }
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest("[data-cmbturn]"); if(!t||!full()) return; sweep("mi-turn","Next Turn",1); MI.buzz("medium"); },true);
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest("[data-cmbuse]"); if(!t||!full()) return; var p=C(t);
    if(window.__miRing) window.__miRing(p.x,p.y,"#ff8a3d",140); if(window.__miBurst) window.__miBurst(p.x,p.y,{n:14,colors:["#ff8a3d","#ffd166","#ffffff"],shape:"mi-spark",dist:80,dur:650}); flash(edge("255,138,61",.45),.5,600); MI.buzz("heavy"); },true);

  /* X7 Apply to Sheet: a wave of light crosses the screen and a check lands in the middle */
  var apWait=null;
  MI.on("click",function(e){ if(apWait&&e.target.closest&&e.target.closest("button")===apWait){ apWait=null; later(applyFx); return; } var t=e.target.closest&&e.target.closest("#b-toSheet"); if(!t||!full()) return;
    later(function(){ var ok=null; Array.prototype.some.call(document.querySelectorAll("#bld button,.ask button,[role=dialog] button"),function(b){ if(b!==t&&b.getClientRects().length&&/^\s*Apply\s*$/i.test(b.textContent)){ ok=b; return true; } });
      if(ok){ apWait=ok; setTimeout(function(){ if(apWait===ok) apWait=null; },30000); } else applyFx(); }); },true);/* when the app asks first, the moment waits for your Apply */
  function applyFx(){ if(!full()) return; (function(){ sweep("mi-wave","",1); var k=add("mi-check",'<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M15 27l7 7 15-16"/></svg>'); k.style.left=innerWidth/2+"px"; k.style.top=innerHeight*.42+"px";
      k.animate([{transform:"translate(-50%,-50%) scale(2.2)",opacity:0},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.35},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.75},{transform:"translate(-50%,-50%) scale(.9)",opacity:0}],{duration:1200,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(k); }; MI.buzz("success"); })(); }

  /* X8 a new character: the Builder greets you, its parts rise in one after another */
  W.welcome=function(){ if(!full()) return; later(function(){ var b=document.getElementById("body")||document.getElementById("bld"); if(!b) return; var i=0;
    Array.prototype.slice.call(b.children,0,10).forEach(function(c){ if(!c.getClientRects().length) return; c.animate([{opacity:0,transform:"translateY(18px)"},{opacity:1,transform:"none"}],{duration:420,delay:120+i*60,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); i++; });
    flash(edge("124,182,255",.4),.6,900); }); };

  /* X9 DEAD: the screen fades to a grey dark, once. STABLE: one calm blue breath */
  W.ds=function(k){ if(!full()) return; if(k==="dead") flash("radial-gradient(ellipse at center,rgba(20,20,24,.55) 20%,rgba(10,10,12,.92) 100%)",1,2200); else if(k==="stable") flash(edge("124,182,255",.55),.7,1400); };

  /* X10 Exhaustion goes up a level: a dark pulse and the chip shudders */
  var cd=document.getElementById("conds"), exPrev=null; function exLv(){ var e=cd&&cd.querySelector(".exh-c"); var m=e&&/(\d+)/.exec(e.textContent); return m?+m[1]:0; } exPrev=exLv();
  if(cd) new MutationObserver(function(){ var v=exLv(); if(exPrev!=null&&v>exPrev&&full()){ flash("radial-gradient(ellipse at center,transparent 30%,rgba(40,10,10,.8) 100%)",.8,900); var e=cd.querySelector(".exh-c"); if(e) e.animate([{transform:"none"},{transform:"translateX(-5px) rotate(-3deg)"},{transform:"translateX(5px) rotate(3deg)"},{transform:"translateX(-3px)"},{transform:"none"}],{duration:420}); MI.buzz("heavy"); } exPrev=v; }).observe(cd,{childList:true,subtree:true,characterData:true});

  /* X11 Undo: a short grey flash and the undo arrow spins back */
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest(".tundo"); if(!t||!full()) return; var ic=t.querySelector("svg"); if(ic) ic.animate([{transform:"rotate(0)"},{transform:"rotate(-360deg)"}],{duration:520,easing:"cubic-bezier(.2,.8,.2,1)"});
    flash(edge("160,170,180",.45),.55,500); MI.buzz("light"); },true);

  /* X12 Concentration breaks: the blue ring shatters into shards */
  W.concBreak=function(){ if(!full()) return; var box=document.getElementById("vbConc"); box=(box&&box.getClientRects().length)?box:(hpBox()||document.body); var p=C(box);
    for(var i=0;i<12;i++){ var s=add("mi-shard"), a=Math.PI*2*i/12+(Math.random()-.5)*.4, d=60+Math.random()*60;
      s.animate([{transform:"translate("+p.x+"px,"+p.y+"px) rotate("+(a*57)+"deg) scale(1)",opacity:1},{transform:"translate("+(p.x+Math.cos(a)*d)+"px,"+(p.y+Math.sin(a)*d+30)+"px) rotate("+(a*57+180)+"deg) scale(.4)",opacity:0}],{duration:700+Math.random()*300,easing:"cubic-bezier(.2,.7,.4,1)"}).onfinish=(function(s){ return function(){ rm(s); }; })(s); }
    flash(edge("124,182,255",.45),.5,600); MI.buzz("medium"); };

  /* X13 page depth: where the browser runs scroll-linked animation itself, a page title trails its page during a swipe */
  /* turned off: on some phones the scroll timeline left the page titles part way off screen at rest */
})();

