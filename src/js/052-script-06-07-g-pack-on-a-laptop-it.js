/* === G pack: on a laptop it opens like a game. A cinematic title, a frame around the screen, a game cursor with a spark trail, interface sounds,
   music made on the fly, a 3D d20, a sky that answers your Hit Points and the music, a camera shake, night before a Long Rest, level up cards === */
(function(){
  var MI=window.__MI; if(!MI||!document.body.animate) return;
  var D=document, LAP=matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1100px)"), RM=matchMedia("(prefers-reduced-motion: reduce)");
  function lap(){ return LAP.matches&&!RM.matches&&MI.mode==="full"; }
  function full(){ return MI.full(); }
  function calm(){ return MI.rm()||MI.mode==="off"; }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function vis(e){ return e&&e.getClientRects().length; }
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function st(){ try{ return window.__sheetState?window.__sheetState():null; }catch(e){ return null; } }
  function play(k){ if(window.__miSnd) window.__miSnd(k); }
  function layer(cls,html,ms){ var e=D.createElement("div"); e.className=cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; D.body.appendChild(e); setTimeout(function(){ rm(e); },ms); return e; }
  function sync(){ D.documentElement.classList.toggle("mi-lap",lap()); }
  sync(); if(LAP.addEventListener) LAP.addEventListener("change",sync); new MutationObserver(sync).observe(D.documentElement,{attributes:true,attributeFilter:["class"]});

  /* G1 the title: letterbox bars, the sigil and the name, gone at the first key or click */
  var sp0=D.querySelector(".mi-splash"); function lapSplash(e){ if(!e||!lap()) return; e.classList.add("lap"); try{ e.getAnimations().forEach(function(a){ if(a.effect&&a.effect.target===e) a.effect.updateTiming({duration:2200}); }); }catch(er){} var kill=function(){ rm(e); removeEventListener("pointerdown",kill,true); removeEventListener("keydown",kill,true); }; addEventListener("pointerdown",kill,true); addEventListener("keydown",kill,true); }
  if(sp0) lapSplash(sp0); new MutationObserver(function(ms){ ms.forEach(function(m){ Array.prototype.forEach.call(m.addedNodes,function(n){ if(n.classList&&n.classList.contains("mi-splash")) lapSplash(n); }); }); }).observe(D.body,{childList:true});

  /* G2 a frame around the screen */
  var hud=D.createElement("div"); hud.className="mi-hud"; hud.setAttribute("aria-hidden","true"); hud.innerHTML="<i></i><i></i><i></i><i></i>"; D.body.appendChild(hud);

  /* G4 a spark trail behind the cursor, at most one spark every 40 ms, pooled */
  var pool=[], pi=0, lastT=0; for(var i=0;i<0;i++){ var s=D.createElement("i"); s.className="mi-trail"; s.setAttribute("aria-hidden","true"); D.body.appendChild(s); pool.push(s); }
  addEventListener("pointermove",function(e){ return; if(e.pointerType!=="mouse"||!lap()) return; var t=performance.now(); if(t-lastT<40) return; lastT=t; var s=pool[pi++%pool.length];
    s.style.left=e.clientX+"px"; s.style.top=e.clientY+"px"; s.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:.9},{transform:"translate(-50%,calc(-50% + 14px)) scale(.2)",opacity:0}],{duration:620,easing:"ease-out"}); },{passive:true});
  /* G5 interface sounds: a soft tick on hover, a page sound on tabs and toasts */
  var hv=0, hvT=0; MI.on("pointerover",function(e){ if(e.pointerType!=="mouse"||!lap()||e.buttons) return; var b=e.target.closest&&e.target.closest("button,[role=tab],[role=button]"); if(!b||b===hv) return; hv=b; },true);
  addEventListener("click",function(e){ if(!lap()) return; if(e.target.closest&&e.target.closest("[role=tab],.bnav button")) play("page"); },true);
  var tst=D.getElementById("toast"); if(tst) new MutationObserver(function(){ if(lap()&&(tst.textContent||"").trim()) play("chime"); }).observe(tst,{childList:true,characterData:true,subtree:true});

  /* G6 music, made on the fly with Web Audio. Off unless chosen in Settings. Stops while the tab is hidden */
  var AC=null, out=null, timer=0, scene=ls("mi-music")||"off", next=0, step=0;
  function ctx(){ if(!AC){ var A=window.AudioContext||window.webkitAudioContext; if(!A) return null; AC=new A(); out=AC.createGain(); out.gain.value=.0001; var lp=AC.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=5200; out.connect(lp); lp.connect(AC.destination); } if(AC.state==="suspended") AC.resume(); return AC; }
  function note(f,t,d,type,v,att){ var o=AC.createOscillator(), g=AC.createGain(); o.type=type||"triangle"; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+(att||.01)); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(out); o.start(t); o.stop(t+d+.05); }
  function nz(t,d,f,v,q){ var n=Math.floor(AC.sampleRate*d), b=AC.createBuffer(1,n,AC.sampleRate), x=b.getChannelData(0); for(var i=0;i<n;i++) x[i]=Math.random()*2-1; var s=AC.createBufferSource(), fl=AC.createBiquadFilter(), g=AC.createGain(); s.buffer=b; fl.type="bandpass"; fl.frequency.value=f; fl.Q.value=q||1; g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+d*.3); g.gain.exponentialRampToValueAtTime(.0001,t+d); s.connect(fl); fl.connect(g); g.connect(out); s.start(t); }
  var M=function(n){ return 440*Math.pow(2,(n-69)/12); };
  var SC={
    tavern:{bpm:104,fn:function(t,i){ var prog=[[62,65,69],[60,64,67],[58,62,65],[60,64,67]], ch=prog[Math.floor(i/8)%4], k=i%8, pat=[0,2,1,2,0,2,1,2]; note(M(ch[pat[k]]+12),t,.5,"triangle",.05); if(k===0){ note(M(ch[0]-12),t,1.6,"sine",.06,.05); } if(k===4) note(M(ch[0]-12),t,.9,"sine",.04); if(Math.random()<.18) note(M(ch[(k+1)%3]+24),t+.12,.3,"sine",.02); }},
    dungeon:{bpm:50,fn:function(t,i){ if(i%8===0){ note(M(38),t,6,"sawtooth",.018,1.5); note(M(38.1),t,6,"sawtooth",.018,1.5); } if(Math.random()<.35) note(M(84+Math.floor(Math.random()*6)),t+Math.random()*.4,.25,"sine",.03); if(i%16===10) nz(t,1.2,180,.05,2); }},
    forest:{bpm:70,fn:function(t,i){ if(i%4===0) nz(t,3.2,500+Math.random()*400,.025,.6); if(Math.random()<.3){ var f=2400+Math.random()*1400, o=AC.createOscillator(), g=AC.createGain(); o.type="sine"; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*1.4,t+.08); o.frequency.exponentialRampToValueAtTime(f*.9,t+.16); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.02,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.18); o.connect(g); g.connect(out); o.start(t); o.stop(t+.25); } if(i%8===0) note(M([57,60,64,62][Math.floor(i/8)%4]),t,2.4,"sine",.025,.4); }},
    battle:{bpm:132,fn:function(t,i){ var k=i%8; if(k===0||k===3||k===6){ var o=AC.createOscillator(), g=AC.createGain(); o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(40,t+.25); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.0001,t+.3); o.connect(g); g.connect(out); o.start(t); o.stop(t+.35); } if(k===4) nz(t,.2,1800,.08,.8); if(k%2) nz(t,.05,7000,.025,1); if(i%16===0) note(M(45),t,1.2,"sawtooth",.035,.04); if(i%16===8) note(M(48),t,1.2,"sawtooth",.035,.04); }}
  };
  function tick(){ if(!AC||scene==="off"||D.hidden) return; var s=SC[scene]; if(!s) return; var dt=60/s.bpm/2; while(next<AC.currentTime+.4){ try{ s.fn(next,step); }catch(e){} next+=dt; step++; } }
  function music(sc){ scene=sc; ls("mi-music",sc); if(sc==="off"){ if(AC){ out.gain.setTargetAtTime(.0001,AC.currentTime,.4); } clearInterval(timer); timer=0; skyScene(); return; }
    if(!ctx()) return; out.gain.setTargetAtTime(.9,AC.currentTime,.8); next=AC.currentTime+.1; step=0; if(!timer) timer=setInterval(tick,120); skyScene(); }
  D.addEventListener("visibilitychange",function(){ if(!AC) return; if(D.hidden) AC.suspend(); else if(scene!=="off"){ AC.resume(); next=AC.currentTime+.1; } });
  addEventListener("pointerdown",function once(){ removeEventListener("pointerdown",once,true); if(scene!=="off"&&LAP.matches) music(scene); },true);
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-mimus]"); if(!b) return; Array.prototype.forEach.call(D.querySelectorAll("[data-mimus]"),function(x){ var on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on); }); music(b.getAttribute("data-mimus")); },true);
  window.__miMusicH=function(){ if(!LAP.matches) return ""; var B=function(v,l){ var on=scene===v; return '<button type="button" class="thb'+(on?" on":"")+'" data-mimus="'+v+'" aria-pressed="'+on+'">'+l+'</button>'; };
    return '<div class="info-h">Music</div><div class="thg">'+B("off","Off")+B("tavern","Tavern")+B("dungeon","Dungeon")+B("forest","Forest")+B("battle","Battle")+'</div><p class="info-d">Made on the fly, nothing to download. The sky follows the music.</p>'; };
  /* heartbeat keeps going on a laptop while Hit Points stay at a quarter or less */
  var hbT=0; function hpPct(){ var c=D.getElementById("hpCur"), m=D.getElementById("hpMax"); var a=c?parseInt((c.textContent||"").replace(/[^\d-]/g,""),10):NaN, b=m?parseInt((m.textContent||"").replace(/[^\d]/g,""),10):NaN; return a>=0&&b>0?a/b:null; }
  setInterval(function(){ if(!lap()||D.hidden) return; var p=hpPct(); if(p!=null&&p>0&&p<=.25&&(ls("mi-snd")||"on")==="on") play("heart"); },2600);

  /* G10 the sky answers: danger from Hit Points, colour from the music */
  var SCN={off:null,tavern:[1,.62,.3],dungeon:[.35,.42,.75],forest:[.35,.8,.45],battle:[.95,.25,.2]};
  function skyScene(){ if(window.__miSky) window.__miSky({scene:SCN[scene]||null}); }
  var hpE=D.getElementById("hpBox"); if(hpE) new MutationObserver(function(){ var p=hpPct(); if(window.__miSky&&p!=null) window.__miSky({danger:p<=0?1:p<=.25?.85:p<=.5?.35:0}); }).observe(hpE,{childList:true,subtree:true,characterData:true});
  setTimeout(function(){ skyScene(); var p=hpPct(); if(window.__miSky&&p!=null) window.__miSky({danger:p<=0?1:p<=.25?.85:p<=.5?.35:0}); },600);
  addEventListener("pointermove",function(e){ if(e.pointerType==="mouse"&&window.__miSky) window.__miSky({mx:e.clientX/innerWidth,my:e.clientY/innerHeight}); },{passive:true});

  /* G12 a heavy hit shakes the whole view on a laptop */
  function stage(){ var p=D.getElementById("p-main"); if(!p) return null; var e=p; while(e.parentElement&&e.parentElement.id!=="app") e=e.parentElement; return e; }
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#dmgBtn"); if(!b||!lap()) return; var amt=+((D.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return; var s=stage(); if(!s) return; var k=Math.min(1,amt/15)*8+3;
    setTimeout(function(){ s.animate([{transform:"none"},{transform:"translate("+(-k)+"px,"+(k*.4)+"px) rotate(-.3deg)"},{transform:"translate("+(k*.8)+"px,"+(-k*.3)+"px) rotate(.25deg)"},{transform:"translate("+(-k*.4)+"px,"+(k*.2)+"px)"},{transform:"none"}],{duration:420,easing:"ease-out"}); },40); },true);

  /* G11 a 3D d20 on laptops: a lit icosahedron that tumbles and settles, drawn only while it moves */
  var t3=(1+Math.sqrt(5))/2, V=[[-1,t3,0],[1,t3,0],[-1,-t3,0],[1,-t3,0],[0,-1,t3],[0,1,t3],[0,-1,-t3],[0,1,-t3],[t3,0,-1],[t3,0,1],[-t3,0,-1],[-t3,0,1]],
      F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  var DICE={class:null,metal:[.62,.67,.72],crystal:[.55,.75,1],bone:[.92,.88,.78]};
  function die3d(host){ if(!lap()) return false; var cv=D.createElement("canvas"); cv.width=280; cv.height=280; cv.className="mi-d3"; var gl=cv.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:true}); if(!gl) return false;
    var vs="attribute vec3 p;attribute vec3 n;uniform mat3 r;varying vec3 vn;varying vec3 vp;void main(){vec3 q=r*p;vn=r*n;vp=q;gl_Position=vec4(q.xy*.52,-q.z*.1,1.);}",
        fs="precision mediump float;varying vec3 vn;varying vec3 vp;uniform vec3 c;void main(){vec3 L=normalize(vec3(-.4,.6,.7));float d=max(dot(normalize(vn),L),0.);float s=pow(max(dot(reflect(-L,normalize(vn)),vec3(0,0,1)),0.),24.);float rim=pow(1.-abs(normalize(vn).z),2.)*.35;gl_FragColor=vec4(c*(.28+.8*d)+vec3(s*.7+rim),1.);}";
    function sh(t,s){ var x=gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; } var pg=gl.createProgram(); gl.attachShader(pg,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(pg); if(!gl.getProgramParameter(pg,gl.LINK_STATUS)) return false; gl.useProgram(pg);
    var P=[],N=[]; F.forEach(function(f){ var a=V[f[0]],b=V[f[1]],c=V[f[2]], u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]], n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]], l=Math.hypot(n[0],n[1],n[2]); n=n.map(function(x){ return x/l; }); [a,b,c].forEach(function(q){ P.push(q[0]/1.9,q[1]/1.9,q[2]/1.9); N.push(n[0],n[1],n[2]); }); });
    function buf(d,name){ var b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW); var l=gl.getAttribLocation(pg,name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l,3,gl.FLOAT,false,0,0); } buf(P,"p"); buf(N,"n");
    gl.enable(gl.DEPTH_TEST); var uR=gl.getUniformLocation(pg,"r"), uC=gl.getUniformLocation(pg,"c"), sk=D.documentElement.getAttribute("data-mi-dice")||"class", col=DICE[sk];
    if(!col){ var v=(getComputedStyle(D.documentElement).getPropertyValue("--pl-rgb")||"214,69,59").split(",").map(function(x){ return (+x||0)/255; }); col=v.length===3?v:[.8,.3,.25]; } gl.uniform3f(uC,col[0],col[1],col[2]);
    var ax=Math.random()*6, ay=Math.random()*6, sx=9+Math.random()*4, sy=7+Math.random()*4, t0=performance.now(), dur=860;
    function rot(a,b){ var ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b); return [cb,sa*sb,-ca*sb, 0,ca,sa, sb,-sa*cb,ca*cb]; }
    (function fr(now){ var k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); gl.viewport(0,0,280,280); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.uniformMatrix3fv(uR,false,new Float32Array(rot(ax+sx*(1-e),ay+sy*(1-e)))); gl.drawArrays(gl.TRIANGLES,0,60); if(k<1&&cv.isConnected) requestAnimationFrame(fr); })(t0);
    host.insertBefore(cv,host.firstChild); host.classList.add("mi-3d"); return true; }
  new MutationObserver(function(ms){ ms.forEach(function(m){ Array.prototype.forEach.call(m.addedNodes,function(n){ if(n.classList&&n.classList.contains("mi-roll-o")){ var dz=n.querySelector(".dz"); if(dz) die3d(dz); } }); }); }).observe(D.body,{childList:true});

  /* I4 Long Rest: night falls, the stars turn, "8 hours later", then dawn */
  var W=window.__miWow; if(W&&W.rest){ var r0=W.rest; W.rest=function(k){ var self=this, args=arguments; if(k!=="long"||calm()){ r0.apply(self,args); return; }
      var n=layer("mi-night",'<div class="sky"></div><div class="moon"></div><b>8 hours later</b>',3400), sk=n.querySelector(".sky"), mo=n.querySelector(".moon"), tx=n.querySelector("b");
      n.animate([{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.75},{opacity:0}],{duration:3000,easing:"ease-in-out"}).onfinish=function(){ rm(n); };
      sk.animate([{transform:"rotate(0deg) scale(1.2)"},{transform:"rotate(18deg) scale(1.2)"}],{duration:3000,easing:"linear"});
      mo.animate([{transform:"translate(-30vw,20vh)"},{transform:"translate(30vw,-6vh)"}],{duration:3000,easing:"cubic-bezier(.3,.1,.3,1)"});
      tx.animate([{opacity:0,transform:"translateY(10px)",letterSpacing:".1em"},{opacity:1,transform:"none",letterSpacing:".22em",offset:.5},{opacity:0,letterSpacing:".3em"}],{duration:2400,delay:400,easing:"ease-in-out",fill:"backwards"});
      play("rest"); setTimeout(function(){ r0.apply(self,args); },2200); }; }

  /* I5 Level Up: the new features turn over one by one */
  function feats(){ return Array.prototype.map.call(D.querySelectorAll("#featBody .fitem h4 .tx"),function(e){ return (e.textContent||"").trim(); }).filter(Boolean); }
  function lvCards(){ var s=st(); if(!s||!s.C) return; var key="mi-feat-"+s.C.name, now=feats(), old=null; try{ old=JSON.parse(ls(key)||"null"); }catch(e){}
    var lvKey="mi-lvl-"+s.C.name, lv0=+(ls(lvKey)||0); ls(key,JSON.stringify(now)); ls(lvKey,s.C.level||0);
    if(!old||!(s.C.level>lv0)||!lv0||calm()) return; var nw=now.filter(function(x){ return old.indexOf(x)<0; }).slice(0,5);
    var h='<div class="lv"><small>Level up</small><b>Level '+s.C.level+'</b></div><div class="cards">'+(nw.length?nw:["Stronger than before"]).map(function(x,i){ return '<div class="cd" style="--i:'+i+'"><i></i><span></span></div>'; }).join("")+'</div>';
    var o=layer("mi-lvc",h,5200); Array.prototype.forEach.call(o.querySelectorAll(".cd span"),function(sp,i){ sp.textContent=(nw.length?nw:["Stronger than before"])[i]; });
    o.animate([{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.86},{opacity:0}],{duration:4800,easing:"ease-in-out"}).onfinish=function(){ rm(o); };
    o.querySelector(".lv").animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.08)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:700,easing:"cubic-bezier(.2,.8,.2,1)"});
    Array.prototype.forEach.call(o.querySelectorAll(".cd"),function(c,i){ c.animate([{transform:"perspective(900px) rotateY(-110deg) translateY(30px)",opacity:0},{transform:"perspective(900px) rotateY(8deg)",opacity:1,offset:.7},{transform:"none",opacity:1}],{duration:800,delay:700+i*260,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); });
    play("level"); }
  function lvBoot(){ setTimeout(lvCards,900); } if(D.readyState==="complete") lvBoot(); else addEventListener("load",lvBoot,{once:true});
})();

/* === K pack: each character picks its own colour and icon. The icon is drawn on the portrait, the sigil, the title screen and the share card === */
(function(){
  var MI=window.__MI; if(!MI) return; var D=document;
  var ICO={"barbarian": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M12 8c6 9 6 22 1 32M22 6c6 10 6 24 1 36M32 8c6 9 6 22 1 32\"/></svg>", "bard": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"17\" cy=\"33\" r=\"5\"/><path d=\"M22 33V11l12-4v20\"/><circle cx=\"29\" cy=\"27\" r=\"5\"/></svg>", "cleric": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"24\" cy=\"24\" r=\"7\"/><path d=\"M24 6v6M24 36v6M6 24h6M36 24h6M11 11l4 4M33 33l4 4M37 11l-4 4M15 33l-4 4\"/></svg>", "druid": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M24 6c12 8 12 26 0 36C12 32 12 14 24 6z\"/><path d=\"M24 12v28M24 22l-6-5M24 30l6-5\"/></svg>", "fighter": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M10 38L34 10M38 38L14 10M30 10h6v6M18 10h-6v6M8 34l6 6M40 34l-6 6\"/></svg>", "monk": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M38 24a14 14 0 1 1-6-11.5\"/><circle cx=\"24\" cy=\"24\" r=\"4\"/></svg>", "paladin": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M24 6l14 5v12c0 9-6 15-14 19C16 38 10 32 10 23V11z\"/><path d=\"M24 14v20M17 21h14\"/></svg>", "ranger": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 40L36 12M36 12h-9M36 12v9M8 40l2-8M8 40l8-2M14 34l-4 0M14 34v4\"/></svg>", "rogue": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M24 4l4 24h-8z\"/><path d=\"M16 28h16M24 28v10M21 42h6\"/></svg>", "sorcerer": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M24 6l4 14 14 4-14 4-4 14-4-14-14-4 14-4z\"/></svg>", "warlock": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M6 24c5-8 11-12 18-12s13 4 18 12c-5 8-11 12-18 12S11 32 6 24z\"/><circle cx=\"24\" cy=\"24\" r=\"5\"/></svg>", "wizard": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M24 6l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z\"/></svg>", "artificer": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 48 48\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2.6\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"24\" cy=\"24\" r=\"8\"/><path d=\"M24 8v5M24 35v5M8 24h5M35 24h5M12.7 12.7l3.6 3.6M31.7 31.7l3.6 3.6M35.3 12.7l-3.6 3.6M16.3 31.7l-3.6 3.6\"/></svg>"}, COL=[["Class colour", ""], ["Crimson", "214,69,59"], ["Ember", "232,116,59"], ["Amber", "224,164,72"], ["Gold", "226,178,60"], ["Emerald", "76,184,106"], ["Forest", "106,168,79"], ["Teal", "63,184,176"], ["Sky", "90,170,240"], ["Sapphire", "76,142,240"], ["Violet", "143,106,216"], ["Arcane", "165,94,234"], ["Rose", "242,95,138"], ["Orchid", "224,107,192"], ["Steel", "150,178,204"], ["Bone", "220,210,190"]], CLS=["artificer","barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard"];
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); if(v===null) localStorage.removeItem(k); else localStorage.setItem(k,v); }catch(e){ return null; } }
  function st(){ try{ return window.__sheetState?window.__sheetState():null; }catch(e){ return null; } }
  function rid(){ try{ return (JSON.parse(localStorage.getItem("cs-roster-v1")||"{}")||{}).active||""; }catch(e){ return ""; } }
  function who(){ var id=rid(), s=st(), nm=(s&&s.C&&s.C.name)||"char"; if(id){ ["mi-acc-","mi-ico-"].forEach(function(p){ var old=ls(p+nm); if(old!=null&&ls(p+id)==null){ ls(p+id,old); } }); return id; } return nm; }
  function cls(){ var s=st(), c=s&&s.C&&s.C.cls; c=String(c||"").split(/[\s/,]/)[0].toLowerCase(); return CLS.indexOf(c)>=0?c:"fighter"; }
  function icoKey(){ var k=ls("mi-ico-"+who()); return k&&ICO[k]?k:cls(); }
  function colRgb(){ return ls("mi-acc-"+who())||""; }
  window.__miIcon=function(){ return ICO[icoKey()]; };
  function url(svg){ return 'url("data:image/svg+xml,'+encodeURIComponent(svg.replace('stroke="currentColor"','stroke="#000"'))+'")'; }
  function apply(){ var h=D.documentElement, c=colRgb(); if(c) h.style.setProperty("--pl-rgb",c); else h.style.removeProperty("--pl-rgb"); h.style.setProperty("--mi-icon",url(ICO[icoKey()])); h.classList.add("mi-ico"); }
  apply(); var aq=0; new MutationObserver(function(){ if(!aq){ aq=1; setTimeout(function(){ aq=0; apply(); },50); } }).observe(D.documentElement,{attributes:true,attributeFilter:["data-mi-cls"]});
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-mlc],[data-mli]"); if(!b) return;
    if(b.hasAttribute("data-mlc")){ var v=b.getAttribute("data-mlc"); ls("mi-acc-"+who(),v||null); } else { var k=b.getAttribute("data-mli"); ls("mi-ico-"+who(),k||null); }
    var a=b.hasAttribute("data-mlc")?"data-mlc":"data-mli"; Array.prototype.forEach.call(D.querySelectorAll("["+a+"]"),function(x){ var on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on); });
    apply(); if(window.__miSnd) window.__miSnd("click"); },true);
  /* the cards on My Characters take the chosen colour too */
  function homeCards(){ Array.prototype.forEach.call(D.querySelectorAll("#homeV .hcard"),function(c){ var b=c.querySelector("[data-hview]"), id=b&&b.getAttribute("data-hview"), top=c.querySelector(".hcard-top"); if(!id||!top) return; var col=ls("mi-acc-"+id);
      if(col){ top.style.backgroundImage="linear-gradient(90deg,color-mix(in srgb,rgb("+col+") 42%,#10151a),color-mix(in srgb,rgb("+col+") 24%,#0d1114))"; top.setAttribute("data-mi-acc",col); } else if(top.hasAttribute("data-mi-acc")){ top.style.backgroundImage=""; top.removeAttribute("data-mi-acc"); } }); }
  var hv=D.getElementById("homeV"); if(hv){ var hq=0; new MutationObserver(function(){ if(!hq){ hq=1; setTimeout(function(){ hq=0; homeCards(); },30); } }).observe(hv,{childList:true,subtree:true}); homeCards(); }
  window.__miLookH=function(){ var c=colRgb(), ik=ls("mi-ico-"+who())||"";
    var sw=COL.map(function(x){ var on=(x[1]||"")===c; return '<button type="button" class="mi-swc'+(on?" on":"")+'" data-mlc="'+x[1]+'" aria-pressed="'+on+'" aria-label="'+x[0]+'" title="'+x[0]+'" style="--sw:'+(x[1]||"var(--pl-rgb)")+'">'+(x[1]?"":"<i>A</i>")+'</button>'; }).join("");
    var ic='<button type="button" class="mi-ic'+(!ik?" on":"")+'" data-mli="" aria-pressed="'+(!ik)+'" title="Class icon"><span class="mi-icd">'+ICO[cls()]+'</span><small>Class</small></button>'+CLS.map(function(k){ var on=ik===k; return '<button type="button" class="mi-ic'+(on?" on":"")+'" data-mli="'+k+'" aria-pressed="'+on+'" title="'+k.charAt(0).toUpperCase()+k.slice(1)+'">'+ICO[k]+'<small>'+k.charAt(0).toUpperCase()+k.slice(1)+'</small></button>'; }).join("");
    return '<div class="info-h">Character colour</div><div class="mi-sws">'+sw+'</div><div class="info-h">Character icon</div><div class="mi-ics">'+ic+'</div><p class="info-d">For this character: the portrait badge, the large sigil on the ID card, the title screen and the share card.</p>'; };
})();
