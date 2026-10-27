/* === v55 micro-interactions. Self-contained: it only listens to clicks and reads the DOM, so the sheet logic is untouched.
   Everything decorative is skipped with prefers-reduced-motion. === */
(function(){
  if(!document.body||!document.body.animate) return;
  
  var FINE=!!(window.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  function C(el){ var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function vis(r){ return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight; }
  function kill(e,an,ms){ an.onfinish=function(){ e.remove(); }; setTimeout(function(){ e.remove(); },ms); }

  /* particles: dots, stars, or sparks flying out from a point. Elements come from a pool and go back to it, so a burst adds nothing to the page */
  var POOL=[];
  function burst(x,y,o){ if(MI.rm()) return; o=o||{}; var n=o.n||10, cols=o.colors||["#ffd166"], d=o.dist||46, sh=o.shape||"mi-dot", dur=o.dur||700, s=o.scale||1;
    if(MI.full()){ n=Math.min(48,Math.round(n*1.6)); d*=1.4; s*=1.2; }/* W11: Full mode is the loud one */
    for(var i=0;i<n;i++){ var a=(Math.PI*2*i/n)+(Math.random()-.5)*.6, dd=d*(.6+Math.random()*.6), e=POOL.pop();
      if(!e){ e=document.createElement("i"); e.setAttribute("aria-hidden","true"); document.body.appendChild(e); }
      e.className="mi-fx "+sh; e.style.visibility=""; e.style.background=cols[i%cols.length];
      var dx=Math.cos(a)*dd, dy=Math.sin(a)*dd+(o.grav?dd*.35:0), spark=sh==="mi-spark", r0=spark?(a*180/Math.PI+90):Math.random()*180, sp=spark?0:1;
      var an=e.animate([
        {transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) rotate("+r0+"deg) scale("+(.4*s)+")",opacity:1},
        {transform:"translate("+(x+dx*.75)+"px,"+(y+dy*.75)+"px) translate(-50%,-50%) rotate("+(r0+90*sp)+"deg) scale("+s+")",opacity:1,offset:.55},
        {transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) rotate("+(r0+140*sp)+"deg) scale("+(.2*s)+")",opacity:0}
      ],{duration:dur*(.8+Math.random()*.4),easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
      (function(e,an){ var done=false, back=function(){ if(done) return; done=true; an.cancel(); e.style.visibility="hidden"; if(POOL.length<60) POOL.push(e); else e.remove(); }; an.onfinish=back; setTimeout(back,dur*1.5+200); })(e,an); } }
  /* an expanding ring */
  function ring(x,y,col,size){ if(MI.rm()) return; var e=document.createElement("i"); e.className="mi-fx mi-ring"; e.setAttribute("aria-hidden","true"); e.style.color=col; document.body.appendChild(e);
    var k=(size||70)/16*(MI.full()?1.35:1), an=e.animate([{transform:"translate("+x+"px,"+y+"px) scale(.3)",opacity:.9},{transform:"translate("+x+"px,"+y+"px) scale("+k+")",opacity:0}],{duration:620,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    kill(e,an,1000); }
  /* a little smoke rising, for a spell slot going out */
  function smoke(x,y){ if(MI.rm()) return; for(var i=0;i<6;i++){ var e=document.createElement("i"), s=6+Math.random()*5; e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background="rgba(170,170,182,.75)"; e.style.width=e.style.height=s+"px"; document.body.appendChild(e);
      var dx=(Math.random()-.5)*22, dy=-(28+Math.random()*26);
      kill(e,e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.5)",opacity:.75},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) scale(1.9)",opacity:0}],{duration:800+Math.random()*300,delay:i*40,easing:"cubic-bezier(.2,.7,.3,1)",fill:"both"}),1600); } }
  window.__miBurst=burst; window.__miRing=ring; window.__miSmoke=smoke;

  /* 1. ink ripple from the touch point on buttons */
  var RIP=".btn,.bb,.hact button,.hcreate,.rcard,.dsb";/* cards get the F1 light instead *//* not tabs: they switch with a view transition, which freezes a ripple mid-way */
  /* pooled: two wrappers reused, and each button's radius and colour read once */
  var RP=[], RC=new WeakMap();
  function rip(){ var w=RP.pop(); if(!w){ w=document.createElement("span"); w.className="mi-rip"; w.setAttribute("aria-hidden","true"); w.appendChild(document.createElement("i")); document.body.appendChild(w); } return w; }
  MI.on("pointerdown",function(e){ if(MI.rm()||e.button>0) return; var b=e.target.closest&&e.target.closest(RIP); if(!b||b.disabled||b.classList.contains("holdc")||b.closest(".slidec")) return;
    var r=b.getBoundingClientRect(); if(!vis(r)) return; var st=RC.get(b); if(!st){ var cs=getComputedStyle(b); st=[cs.borderRadius,cs.color]; RC.set(b,st); }
    var w=rip(), c=w.firstChild, d=Math.hypot(Math.max(e.clientX-r.left,r.right-e.clientX),Math.max(e.clientY-r.top,r.bottom-e.clientY))*2;
    w.style.cssText="left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+st[0]+";color:"+st[1];
    c.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";
    var an=c.animate([{transform:"scale(0)",opacity:.26},{transform:"scale(1)",opacity:0}],{duration:560,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ an.cancel(); w.style.cssText="display:none"; if(RP.length<3) RP.push(w); else w.remove(); }; },true);

  /* 2. jelly squash on toggles (death saves, slots, hit dice, conditions, equip), plus a small burst when one turns on */
  var TOG=".pip,.bx,.chip[data-c],[data-condtoggle],.ichk,.lu-box,.islot,.thb,input[type=checkbox]";
  var jel=function(n){ n.classList.remove("mi-jelly"); void n.offsetWidth; n.classList.add("mi-jelly"); setTimeout(function(){ n.classList.remove("mi-jelly"); },500); };
  MI.on("click",function(e){ if(MI.rm()) return; var t=e.target.closest&&e.target.closest(TOG); if(!t) return;
    if(!t.isConnected){ var a=t.getAttributeNames().filter(function(k){ return k.indexOf("data-")===0; }).map(function(k){ return "["+k+'="'+CSS.escape(t.getAttribute(k))+'"]'; }).join(""); t=a&&document.querySelector(t.tagName.toLowerCase()+a); if(!t) return; }/* the app redrew on pointerup */
    var p=C(t); if(!vis(p.r)) return;
    requestAnimationFrame(function(){ var h=document.elementFromPoint(p.x,p.y), n=(h&&h.closest&&h.closest(TOG))||t;
      if(!n.isConnected){ var q=Array.prototype.filter.call(t.attributes,function(a){ return a.name.indexOf("data-")===0; }).map(function(a){ return "["+a.name+'="'+(window.CSS&&CSS.escape?CSS.escape(a.value):a.value)+'"]'; }).join("");
        n=q&&document.querySelector(t.tagName.toLowerCase()+q);
        if(!n){ if(q){ var k=0, again=function(){ var m=document.querySelector(t.tagName.toLowerCase()+q); if(m) jel(m); else if(++k<8) setTimeout(again,50); }; setTimeout(again,50); } return; } }/* the panel is mid-redraw: wait for it */
      if(!n.matches('.bx[data-k],#dsS .pip,#dsF .pip')){ jel(n); var n0=n; setTimeout(function(){ if(n0.isConnected) return; var a=n0.getAttributeNames().filter(function(k){ return k.indexOf("data-")===0; }).map(function(k){ return "["+k+'="'+CSS.escape(n0.getAttribute(k))+'"]'; }).join(""); var m=a&&document.querySelector(n0.tagName.toLowerCase()+a); if(m) jel(m); },160); }/* redraws inside a View Transition land later */
      var on=n.getAttribute("aria-pressed")==="true"||n.classList.contains("on")||n.checked;
      if(n.closest(".spsl")){ if(on) smoke(p.x,p.y-4); else burst(p.x,p.y,{n:8,colors:["#ffd166","#fff3b0","#ff9f43"],shape:"mi-spark",dist:22,dur:450}); return; }/* spell slots are candles */
      if(on){ var cs=getComputedStyle(n), col=cs.backgroundColor;
        if(!col||col==="transparent"||/rgba\(0, 0, 0, 0\)/.test(col)) col=cs.borderColor; if(n.type==="checkbox") col="#d6453b"; burst(p.x,p.y,{n:7,colors:[col],dist:26,dur:520}); } }); },true);

  /* 3. Heroic Inspiration: the moment is the Bell Toggle (F5.1b), the lasting state is the Star Border */

  /* 4. casting a spell from the Spells list: arcane sparks */
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest(".sp-b[data-qcast]"); if(!t) return; var p=C(t); if(!vis(p.r)) return; if(window.__miWow) window.__miWow.cast(p.x,p.y);
    ring(p.x,p.y,"#b388ff",60); burst(p.x,p.y,{n:12,colors:["#b388ff","#7c4dff","#80d8ff","#ffffff"],shape:"mi-spark",dist:40,dur:600}); },true);

  /* 5. Death Saving Throws: green for a success, red sparks for a failure, a big burst for a natural 20 */
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest("[data-dsr]"); if(!t) return; var k=t.getAttribute("data-dsr"), p=C(t); if(!vis(p.r)) return;
    if(window.__miWow) window.__miWow.save(k);
    if(k==="20"){ ring(p.x,p.y,"#4cc27a",110); burst(p.x,p.y,{n:16,colors:["#4cc27a","#ffd166","#ffffff"],shape:"mi-star",dist:80,dur:900}); }
    else if(k==="s") burst(p.x,p.y,{n:8,colors:["#4cc27a"],dist:34});
    else if(k==="f"||k==="1") burst(p.x,p.y,{n:k==="1"?12:8,colors:["#e5534b","#7a1f1a"],shape:"mi-spark",dist:k==="1"?50:34,grav:true}); },true);

  /* 6. a rest that went through (the sheet closed): stars for a Long Rest, embers for a Short Rest */
  function restCele(kind){ if(!MI.full()) return; setTimeout(function(){ if(document.querySelector("#sheet.on #restDlg")) return; var x=innerWidth/2, y=Math.min(innerHeight*.42,320);
      if(window.__miWow) window.__miWow.rest(kind);
      if(kind==="long"){ ring(x,y,"#7cb6ff",160); burst(x,y,{n:22,colors:["#7cb6ff","#c3dcff","#ffd166","#ffffff"],shape:"mi-star",dist:150,dur:1300,scale:1.3,grav:true}); }
      else { ring(x,y,"#ffb26b",110); burst(x,y,{n:12,colors:["#ffb26b","#ffd166","#ffffff"],dist:90,dur:1000,grav:true}); } },380); }
  document.addEventListener("mi:rest",function(e){ restCele(e.detail); });

  /* 7. My Characters: cards rise in one after another, names decode, the cards tilt toward the mouse, Create a Character pulls toward it */
  function nameIn(el,delay){ el.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:420,delay:delay+120,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); }
  function homeEnter(){ if(MI.rm()) return; var g=document.getElementById("hgrid"); if(!g) return;
    Array.prototype.forEach.call(g.querySelectorAll(".hcard"),function(c,i){ var dl=Math.min(i,10)*60; c.style.animationDelay=dl+"ms"; c.classList.add("mi-in");
      setTimeout(function(){ c.classList.remove("mi-in"); c.style.animationDelay=""; },620+dl); var b=c.querySelector(".hname b"); if(b) nameIn(b,dl); }); }
  function watchHome(h){ if(h.__mi) return; h.__mi=1; var was=h.hidden; if(!was) setTimeout(homeEnter,30);
    new MutationObserver(function(){ if(was&&!h.hidden) setTimeout(homeEnter,30); was=h.hidden; }).observe(h,{attributes:true,attributeFilter:["hidden"]}); }
  var hv=document.getElementById("homeV"); if(hv) watchHome(hv);
  else { var mo=new MutationObserver(function(){ var h=document.getElementById("homeV"); if(h){ watchHome(h); mo.disconnect(); } }); mo.observe(document.body,{childList:true}); }

  /* View or Edit on a card: the card grows to fill the screen, then the sheet fades in. Switching reloads the page,
     so the cover ends in the page colour and the new page fades in from that same colour (no flash). */
  if(document.documentElement.classList.contains("mi-arrive")) setTimeout(function(){ document.documentElement.classList.remove("mi-arrive"); },650);
  var leaving=false; window.addEventListener("beforeunload",function(){ leaving=true; });
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#homeV [data-hview],#homeV [data-hedit]"); if(!b) return; if(b.__miGo){ b.__miGo=0; return; } if(MI.rm()) return;
    var card=b.closest(".hcard"), top=card&&card.querySelector(".hcard-top"); if(!card) return; e.preventDefault(); e.stopImmediatePropagation();
    if(window.__miFlyOut){ window.__miFlyOut(card,function(){ b.__miGo=1; b.click(); b.__miGo=0; }); return; }/* T1: portrait and name travel to the sheet (fx/21) */
    var r=card.getBoundingClientRect(), W=innerWidth, H=innerHeight, ov=document.createElement("div"), bg=top?(top.style.backgroundImage||getComputedStyle(top).backgroundImage):"none";
    ov.className="mi-sw"; ov.setAttribute("aria-hidden","true"); ov.style.width=W+"px"; ov.style.height=H+"px"; ov.style.backgroundImage=bg; ov.style.backgroundColor="var(--panel)"; ov.innerHTML="<i></i>"; document.body.appendChild(ov);
    var ex=ov.animate([{transform:"translate("+r.left+"px,"+r.top+"px) scale("+(r.width/W)+","+(r.height/H)+")",opacity:.85},{transform:"none",opacity:1}],{duration:340,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"});
    ov.firstChild.animate([{opacity:0},{opacity:1}],{duration:200,delay:200,fill:"forwards"});
    try{ sessionStorage.setItem("mi-sw","1"); }catch(er){}
    function fadeOut(){ try{ sessionStorage.removeItem("mi-sw"); }catch(er){} var f=ov.animate([{opacity:1},{opacity:0}],{duration:300,easing:"ease-out",fill:"forwards"}); f.onfinish=function(){ ov.remove(); }; setTimeout(function(){ ov.remove(); },700); }
    var went=false; function go(){ if(went) return; went=true; b.__miGo=1; b.click(); b.__miGo=0;
      __miNF(function(){ __miNF(function(){ var hv=document.getElementById("homeV"); if(!hv||hv.hidden) fadeOut(); else setTimeout(function(){ if(!leaving) fadeOut(); },2500); }); }); }
    ex.onfinish=go; setTimeout(go,600); },true);/* the app builds the sheet while the cover is still, never in the middle of the motion */

  if(FINE&&!MI.rm()){ var cur=null;
    var untilt=function(c){ c.classList.remove("mi-tilt"); c.style.transform=""; if(cur===c) cur=null; };
    MI.on("pointermove",function(e){ if(e.pointerType!=="mouse"||MI.rm()) return; var c=e.target.closest&&e.target.closest("#homeV .hcard"); if(cur&&cur!==c) untilt(cur); if(c){ cur=c; var r=c.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
        c.classList.add("mi-tilt"); c.style.transform="perspective(900px) rotateX("+((.5-py)*6).toFixed(2)+"deg) rotateY("+((px-.5)*8).toFixed(2)+"deg) translateY(-3px)";
        c.style.setProperty("--mx",(px*100).toFixed(1)+"%"); c.style.setProperty("--my",(py*100).toFixed(1)+"%"); }
      /* the Create button no longer follows the mouse: it pushed into its neighbours */

      },{passive:true});
    document.documentElement.addEventListener("mouseleave",function(){ if(cur) untilt(cur); }); }
  MI.on("pointerdown",function(e){ if(e.pointerType==="mouse"||!MI.full()) return; var c=e.target.closest&&e.target.closest("#homeV .hcard"); if(!c||e.target.closest("button,input,select,a")) return;
    var r=c.getBoundingClientRect(); c.style.setProperty("--mx",((e.clientX-r.left)/r.width*100).toFixed(1)+"%"); c.style.setProperty("--my",((e.clientY-r.top)/r.height*100).toFixed(1)+"%");
    c.classList.remove("mi-holo"); void c.offsetWidth; c.classList.add("mi-holo"); setTimeout(function(){ c.classList.remove("mi-holo"); },720); },{passive:true});
})();
/* --- v55 round 3: XP, coins, number bumps, level up fanfare, concentration, spotlight --- */
(function(){
  if(!document.body||!document.body.animate) return;
  
  var FINE=!!(window.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  var burst=window.__miBurst||function(){}, ring=window.__miRing||function(){};
  function C(el){ var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function floatTxt(x,y,txt,col){ if(MI.rm()) return; var e=document.createElement("i"); e.className="mi-float"; e.textContent=txt; e.style.color=col; e.setAttribute("aria-hidden","true"); document.body.appendChild(e);
    var an=e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.6)",opacity:0},{transform:"translate("+x+"px,"+(y-16)+"px) translate(-50%,-50%) scale(1.1)",opacity:1,offset:.25},{transform:"translate("+x+"px,"+(y-58)+"px) translate(-50%,-50%) scale(1)",opacity:0}],{duration:1150,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ e.remove(); }; setTimeout(function(){ e.remove(); },1600); }
  window.__miFloat=floatTxt;

  /* Add XP: the amount rises in gold, stars, and a shine runs along the XP bar */
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest('[data-xpadd="1"]'); if(!t) return; var inp=document.querySelector("[data-xpamt]"), v=inp?Math.floor(+inp.value||0):0; if(v<=0) return; var p=C(t);
    floatTxt(p.x,p.r.top,"+"+v.toLocaleString("en-US")+" XP","#ffd166"); burst(p.x,p.y,{n:8,colors:["#ffd166","#fff3b0"],shape:"mi-star",dist:36,dur:650});
    if(MI.rm()) return; setTimeout(function(){ Array.prototype.forEach.call(document.querySelectorAll(".xpbar"),function(b){ b.classList.remove("mi-shine"); void b.offsetWidth; b.classList.add("mi-shine"); setTimeout(function(){ b.classList.remove("mi-shine"); },1000); }); },60); },true);

  /* Manage Coin, Add: gold coins spill out and the amount rises */
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest('[data-coin="add"],[data-coin="rem"]'); if(!t) return; var add=t.getAttribute("data-coin")==="add", parts=[];
    Array.prototype.forEach.call(document.querySelectorAll("#coinDlg [data-camt]"),function(i){ var v=Math.floor(+i.value||0); if(v>0) parts.push((add?"+":"−")+v+" "+i.getAttribute("data-camt")); }); if(!parts.length) return; var p=C(t);
    floatTxt(p.x,p.r.top,parts.join("  "),add?"#ffc93c":"#e5a04b"); if(add&&MI.full()) burst(p.x,p.y,{n:12,shape:"mi-coin",colors:["#ffc93c"],dist:70,dur:950,grav:true}); },true);

  /* level up fanfare */
  function levelFx(lv){ if(!MI.full()) return; var x=innerWidth/2, y=innerHeight*.38; ring(x,y,"#ffc93c",220); if(window.__miWow) window.__miWow.level(x,y);
    burst(x,y,{n:26,colors:["#ffd166","#ffc93c","#fff3b0","#ffffff"],shape:"mi-star",dist:190,dur:1500,scale:1.4,grav:true});
    setTimeout(function(){ burst(x,y,{n:18,colors:["#ffd166","#7cb6ff","#ffffff"],shape:"mi-spark",dist:150,dur:1100}); },250);
    var b=document.createElement("div"); b.className="mi-lv"; b.setAttribute("aria-hidden","true"); b.innerHTML="<b>Level "+lv+"</b><span>Level up!</span>"; document.body.appendChild(b);
    var sz=Math.min(84,Math.max(40,innerWidth*.09)); particleText("LEVEL "+lv,x,y-sz*.1,sz);
    var an=b.animate([{transform:"translate(-50%,-50%) scale(.96)",opacity:0},{transform:"translate(-50%,-50%) scale(.96)",opacity:0,offset:.3},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.42},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.8},{transform:"translate(-50%,-62%) scale(1)",opacity:0}],{duration:2600,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ b.remove(); flipLevel(); }; setTimeout(function(){ b.remove(); },3100); }
  /* Particle Text: dots gather into the words, then hand over to the crisp banner. The canvas is used once to sample the letters */
  function particleText(txt,cx,cy,size){ var cv=document.createElement("canvas"), ctx=cv.getContext("2d"); if(!ctx) return; var w=Math.ceil(size*txt.length*.66), h=Math.ceil(size*1.2); cv.width=w; cv.height=h;
    ctx.font="900 "+size+"px "+(getComputedStyle(document.body).fontFamily||"sans-serif"); ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="#000"; ctx.fillText(txt,w/2,h/2);
    var d=ctx.getImageData(0,0,w,h).data, step=Math.max(4,Math.round(size/11)), P=[]; for(var yy=0;yy<h;yy+=step) for(var xx=0;xx<w;xx+=step) if(d[(yy*w+xx)*4+3]>140) P.push([xx,yy]);
    while(P.length>150) P.splice((Math.random()*P.length)|0,1);
    P.forEach(function(q){ var e=document.createElement("i"); e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background=Math.random()<.3?"#fff3b0":"#ffc93c"; e.style.width=e.style.height=Math.max(3,step-1)+"px"; document.body.appendChild(e);
      var tx=cx-w/2+q[0], ty=cy-h/2+q[1], fx=cx+(Math.random()-.5)*innerWidth*.9, fy=cy+(Math.random()-.5)*innerHeight*.7, dl=Math.random()*220;
      var a=e.animate([{transform:"translate("+fx+"px,"+fy+"px) scale(.3)",opacity:0},{transform:"translate("+tx+"px,"+ty+"px) scale(1)",opacity:1,offset:.45},{transform:"translate("+tx+"px,"+ty+"px) scale(1)",opacity:1,offset:.7},{transform:"translate("+tx+"px,"+(ty-10)+"px) scale(.4)",opacity:0}],{duration:1500,delay:dl,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"});
      a.onfinish=function(){ e.remove(); }; setTimeout(function(){ e.remove(); },2200); }); }
  /* Split Flap: after the banner, the level number on the sheet flips over */
  function flipLevel(){ var el=document.querySelector("#xpBox .xph b"); if(!el||MI.rm()) return; el.style.display="inline-block";
    el.animate([{transform:"perspective(300px) rotateX(-90deg)",opacity:.2},{transform:"perspective(300px) rotateX(18deg)",opacity:1,offset:.6},{transform:"perspective(300px) rotateX(-6deg)",offset:.8},{transform:"none"}],{duration:620,easing:"cubic-bezier(.3,1.5,.5,1)"}).onfinish=function(){ el.style.display=""; }; MI.buzz("success"); }
  window.__miLevel=levelFx;

  /* one light watcher: a changed stat bumps, a higher level celebrates, Concentration starting rings */
  var prev={}, who=null, pend=false, concWas=null;
  function ssGet(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }
  function ssSet(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }
  function scan(){ pend=false;
    var nm=document.getElementById("idName"), name=nm?nm.textContent.trim():"", lvb=document.querySelector("#xpBox .xph b"), m=lvb&&/(\d+)/.exec(lvb.textContent), lv=m?+m[1]:null;
    var same=name===who; who=name; var cur={};
    Array.prototype.forEach.call(document.querySelectorAll("#abil .ab, #tiles .tile"),function(el){ var k=el.querySelector(".k"), v=el.querySelector(".m, .v"); if(!k||!v) return; var key=k.textContent.trim(), val=window.__miOdoVal?window.__miOdoVal(v):v.textContent.trim(); cur[key]=val;
      if(same&&!MI.rm()&&prev[key]!=null&&prev[key]!==val&&!v.getAttribute("data-miv")&&window.__miOdo&&prev[key].length===val.length){ v.setAttribute("data-miv",prev[key]); v.textContent=prev[key]; window.__miOdo(v,val); } });
    prev=same?Object.assign(prev,cur):cur;
    if(name&&lv!=null){ var sk="mi-lv:"+name, was=+(ssGet(sk)||0); if(was&&lv>was) setTimeout(function(){ levelFx(lv); },350); ssSet(sk,String(lv)); }
    var vc=document.getElementById("vbConc"), on=!!(vc&&!vc.hidden);
    if(window.__miAmb) window.__miAmb();
    if(concWas===true&&!on&&window.__miWow&&window.__miWow.concBreak) window.__miWow.concBreak();
    if(concWas===false&&on&&window.__miBell){ window.__miBell(vc,"#8fb8ff"); var cc=document.querySelector("#conds .chip.conc"); if(cc) window.__miBell(cc,"#8fb8ff"); } concWas=on; }
  new MutationObserver(function(){ if(!pend){ pend=true; requestAnimationFrame(scan); } }).observe(document.getElementById("app")||document.body,{childList:true,subtree:true,characterData:true});/* the sheet only, so particles added to body do not wake it */
  requestAnimationFrame(scan);

  /* cursor spotlight position for ability scores and stat tiles */
  if(FINE&&!MI.rm()) MI.on("pointermove",function(e){ if(e.pointerType!=="mouse"||MI.rm()) return; var t=e.target.closest&&e.target.closest(".ab,.tiles .tile"); if(!t) return; var r=t.getBoundingClientRect();
    t.style.setProperty("--mx",(e.clientX-r.left)+"px"); t.style.setProperty("--my",(e.clientY-r.top)+"px"); },{passive:true});
})();
/* --- v55 round 5: search results, new inventory items, conditions with their own motion --- */
(function(){
  if(!document.body||!document.body.animate) return;
  
  var burst=window.__miBurst||function(){}, ring=window.__miRing||function(){};
  function C(el){ var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function rise(x,y,cols,n){ if(MI.rm()) return; for(var i=0;i<(n||6);i++){ var e=document.createElement("i"), s=5+Math.random()*5; e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background=cols[i%cols.length]; e.style.width=e.style.height=s+"px"; document.body.appendChild(e);
      var dx=(Math.random()-.5)*30, dy=-(26+Math.random()*30), an=e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.5)",opacity:.9},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) scale(1.5)",opacity:0}],{duration:850+Math.random()*300,delay:i*45,easing:"cubic-bezier(.2,.7,.3,1)",fill:"both"});
      (function(e){ an.onfinish=function(){ e.remove(); }; setTimeout(function(){ e.remove(); },1700); })(e); } }
  function who(){ var n=document.getElementById("idName"); return n?n.textContent.trim():""; }

  /* 1. Search: results drop in one after another when Search opens, and the letters you typed are marked in each result */
  var lastQ=null;
  function mark(b,q){ var tn=null, k; for(k=b.childNodes.length-1;k>=0;k--){ var c=b.childNodes[k]; if(c.nodeType===3&&c.nodeValue.trim()){ tn=c; break; } } if(!tn) return;
    var s=tn.nodeValue, lo=s.toLowerCase(), qt=q.trim().toLowerCase(), qq=qt.replace(/\s+/g,""), on=[], i, j=0; if(!qq) return;
    var at=lo.indexOf(qt); if(at>=0){ for(i=at;i<at+qt.length;i++) on[i]=1; } else { for(i=0;i<s.length&&j<qq.length;i++) if(lo[i]===qq[j]){ on[i]=1; j++; } if(j<qq.length) return; }
    var f=document.createDocumentFragment(), buf="", m=false;
    function flush(){ if(!buf) return; if(m){ var e=document.createElement("mark"); e.textContent=buf; f.appendChild(e); } else f.appendChild(document.createTextNode(buf)); buf=""; }
    for(i=0;i<s.length;i++){ var w=!!on[i]; if(w!==m){ flush(); m=w; } buf+=s[i]; } flush(); var wrap=document.createElement("span"); wrap.appendChild(f); tn.parentNode.replaceChild(wrap,tn); }/* one span: the row lays its parts out with a gap */
  var sb=document.getElementById("sheetBody");
  if(sb) new MutationObserver(function(){ var q=document.getElementById("gsQ"); if(!q){ lastQ=null; return; }
      var rows=sb.querySelectorAll(".gs-r"), fresh=q!==lastQ; lastQ=q;
      Array.prototype.forEach.call(rows,function(r){ var b=r.querySelector("b"); if(b&&q.value.trim()) mark(b,q.value); });
      if(fresh&&!MI.rm()) Array.prototype.slice.call(sb.querySelectorAll(".gs-c, .gs-r, .info-h"),0,16).forEach(function(r,i){ r.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:240,delay:i*18,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); });
    }).observe(sb,{childList:true});

  /* 2. Inventory: an item that just arrived flashes softly and slides into place */
  var ib=document.getElementById("invBody"), invPrev=null, invKey="";
  if(ib) new MutationObserver(function(){ var fb=ib.querySelector(".ifb.on"), key=who()+"|"+(fb?fb.getAttribute("data-invf"):""), cnt={}, rows=ib.querySelectorAll(".irow");
      Array.prototype.forEach.call(rows,function(r){ var b=r.querySelector(".iname b"); if(!b) return; var n=b.textContent.trim(); cnt[n]=(cnt[n]||0)+1; });
      if(invPrev&&key===invKey&&!MI.rm()){ var seen={}; for(var i=rows.length-1;i>=0;i--){ var b=rows[i].querySelector(".iname b"); if(!b) continue; var n=b.textContent.trim(); seen[n]=(seen[n]||0)+1;
          if(seen[n]<=(cnt[n]-(invPrev[n]||0))){ var r=rows[i]; r.classList.remove("mi-new"); void r.offsetWidth; r.classList.add("mi-new"); r.animate([{opacity:.3,transform:"translateX(-10px)"},{opacity:1,transform:"none"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"}); (function(r){ setTimeout(function(){ r.classList.remove("mi-new"); },1300); })(r); } } }
      invPrev=cnt; invKey=key; }).observe(ib,{childList:true});

  /* 3. Conditions: each one arrives with its own motion */
  var CFX={Poisoned:["rise",["#7bd389","#3fa34d"]],Frightened:["shake",["#c7b8ff"]],Charmed:["burst",["#ff8fc7","#ffc2e0"]],Paralyzed:["spark",["#ffe066","#fff3b0"]],Stunned:["ring",["#ffe066"]],
    Blinded:["rise",["#555a60","#8a9096"]],Deafened:["ring",["#9fb3b3"]],Invisible:["fade",["#cfe8ff"]],Prone:["drop",["#c9a27a"]],Grappled:["squeeze",["#d0a060"]],Restrained:["squeeze",["#d0a060"]],
    Incapacitated:["ring",["#aaaaaa"]],Petrified:["burst",["#9a9a9a","#6b6b6b"]],Unconscious:["rise",["#8aa0c8","#c3d0e8"]],Exhaustion:["ring",["#e5534b"]]};
  function condFx(el,name){ if(MI.rm()) return; var p=C(el); if(!p.r.width||p.r.bottom<0||p.r.top>innerHeight) return; var base=name.replace(/\s*\d+$/,"").trim(), f=CFX[base]||(/rag/i.test(name)?["burst",["#ff6b3d","#ffb26b"]]:["burst",[getComputedStyle(el).backgroundColor]]), k=f[0], c=f[1], E="cubic-bezier(.2,.8,.2,1)";
    el.animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.1)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:280,easing:E});
    if(window.__miWow) window.__miWow.stamp(el,c[0]);
    if(k==="rise") rise(p.x,p.y-6,c,7);
    else if(k==="burst") burst(p.x,p.y,{n:10,colors:c,dist:34,dur:600});
    else if(k==="spark") burst(p.x,p.y,{n:10,colors:c,shape:"mi-spark",dist:30,dur:500});
    else if(k==="ring") ring(p.x,p.y,c[0],70);
    else if(k==="shake") el.animate([{transform:"translateX(0)"},{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(-3px)"},{transform:"translateX(3px)"},{transform:"translateX(0)"}],{duration:420,delay:300,easing:"linear"});
    else if(k==="fade") el.animate([{opacity:1},{opacity:.25},{opacity:.9},{opacity:.35},{opacity:1}],{duration:900,delay:300,easing:"ease-in-out"});
    else if(k==="drop") el.animate([{transform:"translateY(-14px)"},{transform:"translateY(0)",offset:.5},{transform:"translateY(-4px)",offset:.7},{transform:"none"}],{duration:520,delay:200,easing:"ease-out"});
    else if(k==="squeeze") el.animate([{transform:"scaleX(1)"},{transform:"scaleX(.8)"},{transform:"scaleX(1.06)"},{transform:"none"}],{duration:480,delay:300,easing:E}); }
  var cd=document.getElementById("conds"), cPrev=null, cWho="";
  if(cd) new MutationObserver(function(){ var now={}, els={}; Array.prototype.forEach.call(cd.querySelectorAll(".chip.on"),function(c){ var k=(c.getAttribute("data-info")||"").replace(/^g:/,"")||c.textContent.trim(); if(c.classList.contains("exh-c")) k="Exhaustion"; now[k]=1; els[k]=c; });
      if(window.__miAmb) window.__miAmb();
      var w=who(); if(cPrev&&w===cWho) Object.keys(now).forEach(function(k){ if(!cPrev[k]) condFx(els[k],k==="Exhaustion"?"Exhaustion":els[k].textContent.trim()||k); }); cPrev=now; cWho=w; }).observe(cd,{childList:true});
})();
/* --- v55: ambience for every condition and for Concentration, Rage and the other modes, low Hit Points, and dying --- */
(function(){
  /* e: side edges, t/b: top or bottom edge, v: vignette, f: frame, h: hatching; a: strength; t: pulse seconds;
     p: [particle, count, colour]; m: extra motion; beat: heartbeat timing */
  var AMB={
    Poisoned:{e:"76,194,122",a:.22,t:3.6,p:["bubble",8,"123,211,137"]},
    Blinded:{v:"0,0,0",a:.72,t:5.5,e2:"0,0,0",p:["wisp",7,"40,40,46"]},
    Charmed:{e:"255,110,185",a:.24,t:3.2,p:["heart",9,"255,143,199"]},
    Deafened:{e:"140,160,175",a:.22,t:4.5,p:["wave",4,"185,200,210"]},
    Exhaustion:{v:"45,22,8",a:.32,t:6.5,e2:"200,120,60",p:["ash",9,"150,140,130"]},
    Frightened:{e:"120,70,200",a:.26,t:2.6,m:"shiver",v2:"25,10,45",p:["wisp",7,"120,80,190"]},
    Grappled:{e:"175,120,65",a:.26,t:3,m:"squeeze",p:["dust",7,"200,160,110"]},
    Restrained:{e:"175,120,65",a:.26,t:3,m:"squeeze",h:"160,110,60",p:["link",7,"190,140,85"]},
    Incapacitated:{e:"150,150,160",a:.24,t:5,v2:"20,20,25",p:["mote",9,"190,190,200"]},
    Invisible:{e:"160,210,255",a:.22,t:2.8,p:["mote",14,"200,230,255"]},
    Paralyzed:{e:"255,215,80",a:.22,t:1.8,p:["bolt",8,"255,230,120"]},
    Petrified:{e:"150,150,150",a:.28,t:7,h:"125,125,125",p:["ash",8,"165,165,165"]},
    Prone:{b:"175,130,85",a:.34,t:4,p:["dust",12,"200,165,120"]},
    Stunned:{t2:"255,215,80",a:.28,t:2.4,e2:"255,215,80",p:["star",10,"255,224,102"]},
    Unconscious:{v:"10,15,45",a:.62,t:6,p:["z",6,"170,190,235"]},
    conc:{f:"110,170,255",a:.7,t:3.2,p:["mote",8,"150,195,255"]},
    rage:{e:"255,85,35",a:.28,t:1.6,p:["ember",14,"255,140,60"]},
    sacred:{f:"255,215,120",a:.6,t:3,p:["mote",8,"255,225,150"]},
    radiance:{e:"255,240,200",a:.22,t:3,p:["mote",12,"255,240,200"]},
    wings:{e:"255,240,200",a:.22,t:3,p:["mote",12,"255,240,200"]},
    shroud:{v:"30,0,40",a:.5,t:4,p:["wisp",8,"150,90,190"]},
    insp:{e:"255,200,70",a:.12,t:4.2,p:["star",6,"255,214,102"],r:1},
    tmp:{f:"90,160,230",a:.45,t:4,r:1},
    combat:{f:"230,70,50",a:.42,t:2.2,e2:"230,70,50"},/* no particles: they would sit over the Combat View content */
    wildshape:{e:"90,160,70",a:.2,t:4,p:["leaf",10,"120,170,70"]},
    noslots:{e:"120,80,170",a:.16,t:5,p:["wisp",6,"130,100,170"]},
    stable:{v:"40,140,90",a:.38,t:5,p:["mote",9,"150,230,180"]},
    dead:{v:"12,12,15",a:.78,t:8,p:["ash",8,"150,150,155"]},
    low:{e:"229,83,75",a:.22,t:1.05,beat:1},
    dying:{v:"130,0,0",a:.5,t:1.05,beat:1}
  };
  var HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z"/></svg>';
  var box=null, last="";
  function seeded(k,i){ var x=Math.sin((k.length*31+i*97.3))*43758.5453; return x-Math.floor(x); }
  function parts(k,P){ var type=P[0], n=P[1], pc=P[2], h="";
    for(var i=0;i<n;i++){ var r1=seeded(k,i), r2=seeded(k,i+50), side=i%2===0, edge=6+Math.round(r1*38), pos=(side?"left":"right")+":"+edge+"px", st="--pc:"+pc+";", cls="p "+type+(side?" sl":" sr"), inner="";
      if(type==="ash"){ cls+=" fall"; st+=pos+";--s:"+(3+Math.round(r2*4))+"px;--d:"+(11+r2*7).toFixed(1)+"s;--dl:-"+(r1*14).toFixed(1)+"s;--w:"+(side?8:-8)+"px"; }
      else if(type==="leaf"){ st+=pos+";--s:"+(12+Math.round(r2*8))+"px;--d:"+(10+r2*6).toFixed(1)+"s;--dl:-"+(r1*14).toFixed(1)+"s;--w:"+(side?6:-6)+"px"; }
      else if(type==="bubble"||type==="ember"||type==="heart"||type==="z"||type==="wisp"||type==="link"||(type==="star"&&AMB[k].r)){ cls+=" rise"; if(type==="star") cls=cls.replace("p star","p star rise"); var s=type==="z"?12+Math.round(r2*8):type==="ember"?4+Math.round(r2*4):type==="heart"?12+Math.round(r2*8):type==="link"?12+Math.round(r2*6):type==="star"?7+Math.round(r2*5):type==="wisp"?10+Math.round(r2*8):6+Math.round(r2*6);
        st+=pos+";--s:"+s+"px;--d:"+(type==="ember"?4.5+r2*3:9+r2*6).toFixed(1)+"s;--dl:-"+(r1*10).toFixed(1)+"s;--w:"+(side?6:-6)+"px";
        if(type==="heart") inner=HEART; if(type==="z") inner="z"; }
      else if(type==="mote"||type==="star"){ cls+=" tw"; st+=(type==="star"?"left:"+(4+r1*92).toFixed(1)+"%;top:"+(6+r2*34).toFixed(0)+"px":pos+";top:"+(8+r2*84).toFixed(1)+"%")+";--s:"+(type==="star"?8+Math.round(r2*6):5+Math.round(r2*5))+"px;--d:"+(2.4+r2*2.6).toFixed(1)+"s;--dl:-"+(r1*4).toFixed(1)+"s"; }
      else if(type==="bolt"){ cls="p spark bolt "+(side?"sl":"sr"); st+=pos+";top:"+(6+r2*84).toFixed(1)+"%;--d:"+(1.4+r2*2.2).toFixed(1)+"s;--dl:-"+(r1*3).toFixed(1)+"s;width:26px;height:44px;background:none;box-shadow:none;transform:rotate("+(Math.round(r2*50)-25)+"deg)";
        inner='<svg viewBox="0 0 26 44" width="26" height="44" style="display:block;overflow:visible"><path d="M15 1 4 22h8L8 43l14-26h-8z" fill="rgba('+pc+',.85)" stroke="#fff" stroke-width="1" stroke-linejoin="round" style="filter:drop-shadow(0 0 4px rgba('+pc+',.9))"/></svg>'; }
      else if(type==="spark"){ st+=pos+";top:"+(8+r2*84).toFixed(1)+"%;--s:"+(10+Math.round(r1*10))+"px;--d:"+(1.6+r2*2.4).toFixed(1)+"s;--dl:-"+(r1*3).toFixed(1)+"s;transform:rotate("+(Math.round(r2*60)-30)+"deg)"; }
      else if(type==="dust"){ st+="left:"+(4+r1*92).toFixed(1)+"%;--s:"+(3+Math.round(r2*4))+"px;--d:"+(2.5+r2*2.5).toFixed(1)+"s;--dl:-"+(r1*4).toFixed(1)+"s;--w:"+(Math.round(r2*30)-15)+"px"; }
      else if(type==="wave"){ st+=(side?"left:0":"right:0")+";--d:3.8s;--dl:-"+(i*1.9).toFixed(1)+"s"; }
      h+='<i class="'+cls+'" style="'+st+'">'+inner+'</i>'; }
    return h; }
  function layer(k){ var c=AMB[k], h="", m=c.m?" "+c.m:"", bt=c.beat?" beat":"";
    if(c.e) h+='<i class="e l'+m+bt+'"></i><i class="e r'+m+bt+'"></i>';
    if(c.h) h+='<i class="e l h" style="--hc:'+c.h+'"></i><i class="e r h" style="--hc:'+c.h+'"></i>';
    if(c.t2) h+='<i class="e t'+bt+'" style="--c:'+c.t2+'"></i>';
    if(c.b) h+='<i class="e b'+bt+'" style="--c:'+c.b+'"></i>';
    if(c.v) h+='<i class="v'+bt+'"></i>';
    if(c.v2) h+='<i class="v" style="--c:'+c.v2+';--a:.3"></i>';
    if(c.e2) h+='<i class="e l" style="--c:'+c.e2+';--a:.12"></i><i class="e r" style="--c:'+c.e2+';--a:.12"></i>';
    if(c.f) h+='<i class="f"></i>';
    if(c.p) h+=parts(k,c.p);
    var d=document.createElement("div"); d.className="ma"; d.setAttribute("data-k",k);
    d.style.cssText="--c:"+(c.e||c.v||c.f||c.t2||c.b)+";--a:"+c.a+";--t:"+c.t+"s"; d.innerHTML=h; box.appendChild(d); void d.offsetWidth; return d; }
  function state(){ var st={}, cd=document.getElementById("conds");
    if(cd) Array.prototype.forEach.call(cd.querySelectorAll(".chip.on"),function(c){ var di=(c.getAttribute("data-info")||"").replace(/^g:/,""), md=c.getAttribute("data-mode");
      if(c.classList.contains("exh-c")){ var n=/(\d+)/.exec(c.textContent); st.Exhaustion=n?+n[1]:1; }
      else if(c.classList.contains("conc")) st.conc=1;
      else if(md){ if(AMB[md]) st[md]=1; else if(/rage/i.test(md)) st.rage=1; }
      else if(AMB[di]) st[di]=1; });
    var ip=document.getElementById("insp")||document.getElementById("vbInsp"); if(ip&&ip.getAttribute("aria-pressed")==="true") st.insp=1;
    var tm=document.getElementById("hpTmp"); if(tm&&tm.classList.contains("on")) st.tmp=1;
    var hb=document.getElementById("hpBox"), bar=document.getElementById("hpBar");
    if(hb&&hb.classList.contains("hp0")){ var vt=document.querySelector(".vitals"), ok=document.querySelectorAll('#dsS .pip[aria-pressed="true"]').length;
        if(vt&&vt.classList.contains("dead")) st.dead=1; else if(ok>=3) st.stable=1; else st.dying=1; }
    else if(bar&&bar.getAttribute("data-lv")==="low") st.low=1;
    if(document.querySelector("#sheet.on #cbv")) st.combat=1;
    var sl=document.querySelectorAll("#p-spells .spsl .bx"); if(sl.length&&!document.querySelector('#p-spells .spsl .bx[aria-pressed="false"]')) st.noslots=1;
    return st; }
  window.__miAmb=function(force){ var st=MI.rm()?{}:state(), key=JSON.stringify(st); if(key===last&&!force) return; last=key;
    if(!box){ if(key==="{}") return; box=document.createElement("div"); box.id="miAmb"; box.setAttribute("aria-hidden","true"); document.body.appendChild(box); }
    Object.keys(AMB).forEach(function(k){ var el=box.querySelector('.ma[data-k="'+k+'"]'), on=!!st[k];
      if(on&&!el) el=layer(k);
      if(el){ el.classList.toggle("on",on); if(k==="Exhaustion"&&on) el.style.setProperty("--a",(0.18+Math.min(6,st[k])*0.07).toFixed(2)); } }); };
  requestAnimationFrame(window.__miAmb);
  var sh=document.getElementById("sheet"), sbd=document.getElementById("sheetBody"), q=0, kick=function(){ if(!q){ q=1; requestAnimationFrame(function(){ q=0; window.__miAmb(); }); } };
  if(sh) new MutationObserver(kick).observe(sh,{attributes:true,attributeFilter:["class"]});
  if(sbd) new MutationObserver(kick).observe(sbd,{childList:true});
})();
/* --- v55: Peek Rating on slot rows (spell slots, limited uses, death saves) --- */
(function(){
  if(!document.body||!document.body.animate) return;
  
  var FINE=!!(window.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  var SEL='.bx[data-k],#dsS .pip,#dsF .pip';
  function row(b){ var k=b.getAttribute("data-k"); return Array.prototype.filter.call(b.parentNode.children,function(x){ return x.matches&&x.matches(SEL)&&x.getAttribute("data-k")===k; }); }
  function on(b){ return b.getAttribute("aria-pressed")==="true"; }
  function clear(L){ L.forEach(function(x){ x.classList.remove("mi-peek","mi-ghost","mi-unghost"); x.style.transitionDelay=""; }); }
  var cur=null;
  if(FINE&&!MI.rm()){
    MI.on("pointerover",function(e){ if(e.pointerType!=="mouse"||MI.rm()) return; var b=e.target.closest&&e.target.closest(SEL); if(!b){ if(cur){ clear(cur); cur=null; } return; }
      var L=row(b), i=L.indexOf(b), used=L.filter(on).length, to=(used===i+1)?i:i+1; if(cur&&cur!==L) clear(cur); cur=L;
      L.forEach(function(x,j){ var lift=j<=i, will=j<to; x.style.transitionDelay=(lift?j*28:0)+"ms"; x.classList.toggle("mi-peek",lift);
        x.classList.toggle("mi-ghost",will&&!on(x)); x.classList.toggle("mi-unghost",!will&&on(x)); }); },{passive:true});
    document.documentElement.addEventListener("mouseleave",function(){ if(cur){ clear(cur); cur=null; } });
  }
  /* click: remember the row before, pop what changed after the sheet redraws it */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest(SEL); if(!b||MI.rm()) return; var L=row(b), before=L.map(on), i=L.indexOf(b), r=b.getBoundingClientRect(), par=b.parentNode, k=b.getAttribute("data-k");
    requestAnimationFrame(function(){ var h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2), nb=(h&&h.closest&&h.closest(SEL))||b; if(!nb.isConnected) return; var N=row(nb), n=0;
      N.forEach(function(x,j){ if(before[j]===undefined||before[j]===on(x)) return; var d=(on(x)?j:(N.length-1-j))*38; n++;
        x.animate([{transform:"translateY(0) scale(1)"},{transform:"translateY(-7px) scale(1.28)",offset:.45},{transform:"translateY(0) scale(.94)",offset:.75},{transform:"none"}],{duration:420,delay:d,easing:"cubic-bezier(.2,.8,.2,1)"}); }); }); },true);
})();
/* Immersive Effects and vibration buttons in Settings */
MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("[data-mifx],[data-mibz]"); if(!b) return;
  if(b.hasAttribute("data-mifx")) MI.set("mode",b.getAttribute("data-mifx")); else MI.set("bz",b.getAttribute("data-mibz")); MI.buzz("light"); },true);
