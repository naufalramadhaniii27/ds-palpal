/* === G pack: on a laptop it opens like a game. A cinematic title, a frame around the screen, a game cursor with a spark trail, interface sounds,
   music made on the fly, a 3D d20, a sky that answers your Hit Points and the music, a camera shake, night before a Long Rest, level up cards === */
const FXS19A={};
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  FXS19A.skyScene=function skyScene(){ if(FXENV.__miSky) FXENV.__miSky({scene:FXS19A.SCN[FXS19A.scene]||null}); };
  FXS19A.D=document; FXS19A.LAP=matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1100px)"); const RM=matchMedia("(prefers-reduced-motion: reduce)");
  FXS19A.lap=function lap(){ return FXS19A.LAP.matches&&!RM.matches&&MI.mode==="full"; };;
  function full(){ return MI.full(); }
  FXS19A.calm=function calm(){ return MI.rm()||MI.mode==="off"; };;
  FXS19A.rm=function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); };;
  function vis(e){ return e&&e.getClientRects().length; }
  FXS19A.ls=function ls(k,v){ try{ if(v===undefined) return __store.getItem(k); __store.setItem(k,v); }catch(e){ return null; } };;
  FXS19A.st=function st(){ try{ return FXENV.__sheetState?FXENV.__sheetState():null; }catch(e){ return null; } };;
  FXS19A.play=function play(k){ if(FXENV.__miSnd) FXENV.__miSnd(k); };;
  FXS19A.layer=function layer(cls,html,ms){ const e=FXS19A.D.createElement("div"); e.className=cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; FXS19A.D.body.appendChild(e); setTimeout(() =>{ FXS19A.rm(e); },ms); return e; };;
  function sync(){ FXS19A.D.documentElement.classList.toggle("mi-lap",FXS19A.lap()); }
  sync(); if(FXS19A.LAP.addEventListener) FXS19A.LAP.addEventListener("change",sync); new MutationObserver(sync).observe(FXS19A.D.documentElement,{attributes:true,attributeFilter:["class"]});

  /* G1 the title: letterbox bars, the sigil and the name, gone at the first key or click */
  FXS19A.sp0=FXS19A.D.querySelector(".mi-splash");
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
 function lapSplash(e){ if(!e||!FXS19A.lap()) return; e.classList.add("lap"); try{ e.getAnimations().forEach((a) =>{ if(a.effect&&a.effect.target===e) a.effect.updateTiming({duration:2200}); }); }catch(er){} const kill=function(){ FXS19A.rm(e); removeEventListener("pointerdown",kill,true); removeEventListener("keydown",kill,true); }; addEventListener("pointerdown",kill,true); addEventListener("keydown",kill,true); }
  if(FXS19A.sp0) lapSplash(FXS19A.sp0); new MutationObserver((ms) =>{ ms.forEach((m) =>{ Array.prototype.forEach.call(m.addedNodes,(n) =>{ if(n.classList&&n.classList.contains("mi-splash")) lapSplash(n); }); }); }).observe(FXS19A.D.body,{childList:true});

  /* G2 a frame around the screen */
  const hud=FXS19A.D.createElement("div"); hud.className="mi-hud"; hud.setAttribute("aria-hidden","true"); hud.innerHTML="<i></i><i></i><i></i><i></i>"; FXS19A.D.body.appendChild(hud);

  /* G5 interface sounds: a soft tick on hover, a page sound on tabs and toasts */
  let hv=0, hvT=0; MI.on("pointerover",(e) =>{ if(e.pointerType!=="mouse"||!FXS19A.lap()||e.buttons) return; const b=e.target.closest&&e.target.closest("button,[role=tab],[role=button]"); if(!b||b===hv) return; hv=b; },true);
  addEventListener("click",(e) =>{ if(!FXS19A.lap()) return; if(e.target.closest&&e.target.closest("[role=tab],.bnav button")) FXS19A.play("page"); },true);
  FXS19A.tst=FXS19A.D.getElementById("toast");
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
 if(FXS19A.tst) new MutationObserver(() =>{ if(FXS19A.lap()&&(FXS19A.tst.textContent||"").trim()) FXS19A.play("chime"); }).observe(FXS19A.tst,{childList:true,characterData:true,subtree:true});

  /* G6 music, made on the fly with Web Audio. Off unless chosen in Settings. Stops while the tab is hidden */
  FXS19A.AC=null; FXS19A.out=null; FXS19A.timer=0; FXS19A.scene=FXS19A.ls("mi-music")||"off"; FXS19A.next=0; FXS19A.step=0;
  FXS19A.ctx=function ctx(){ const c=MI.ac(); if(!c) return null; if(!FXS19A.AC){ FXS19A.AC=c; FXS19A.out=FXS19A.AC.createGain(); FXS19A.out.gain.value=.0001; const lp=FXS19A.AC.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=5200; FXS19A.out.connect(lp); lp.connect(FXS19A.AC.destination); } return FXS19A.AC; };;
  FXS19A.note=function note(f,t,d,type,v,att){ const o=FXS19A.AC.createOscillator(), g=FXS19A.AC.createGain(); o.type=type||"triangle"; o.frequency.setValueAtTime(f,t); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+(att||.01)); g.gain.exponentialRampToValueAtTime(.0001,t+d); o.connect(g); g.connect(FXS19A.out); o.start(t); o.stop(t+d+.05); };;
  FXS19A.nz=function nz(t,d,f,v,q){ const n=Math.floor(FXS19A.AC.sampleRate*d), b=FXS19A.AC.createBuffer(1,n,FXS19A.AC.sampleRate), x=b.getChannelData(0); for(let i=0;i<n;i++) x[i]=Math.random()*2-1; const s=FXS19A.AC.createBufferSource(), fl=FXS19A.AC.createBiquadFilter(), g=FXS19A.AC.createGain(); s.buffer=b; fl.type="bandpass"; fl.frequency.value=f; fl.Q.value=q||1; g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(v,t+d*.3); g.gain.exponentialRampToValueAtTime(.0001,t+d); s.connect(fl); fl.connect(g); g.connect(FXS19A.out); s.start(t); };;
  FXS19A.M=function(n){ return 440*Math.pow(2,(n-69)/12); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  FXS19A.SC={
    tavern:{bpm:104,fn:function(t,i){ const prog=[[62,65,69],[60,64,67],[58,62,65],[60,64,67]], ch=prog[Math.floor(i/8)%4], k=i%8, pat=[0,2,1,2,0,2,1,2]; FXS19A.note(FXS19A.M(ch[pat[k]]+12),t,.5,"triangle",.05); if(k===0){ FXS19A.note(FXS19A.M(ch[0]-12),t,1.6,"sine",.06,.05); } if(k===4) FXS19A.note(FXS19A.M(ch[0]-12),t,.9,"sine",.04); if(Math.random()<.18) FXS19A.note(FXS19A.M(ch[(k+1)%3]+24),t+.12,.3,"sine",.02); }},
    dungeon:{bpm:50,fn:function(t,i){ if(i%8===0){ FXS19A.note(FXS19A.M(38),t,6,"sawtooth",.018,1.5); FXS19A.note(FXS19A.M(38.1),t,6,"sawtooth",.018,1.5); } if(Math.random()<.35) FXS19A.note(FXS19A.M(84+Math.floor(Math.random()*6)),t+Math.random()*.4,.25,"sine",.03); if(i%16===10) FXS19A.nz(t,1.2,180,.05,2); }},
    forest:{bpm:70,fn:function(t,i){ if(i%4===0) FXS19A.nz(t,3.2,500+Math.random()*400,.025,.6); if(Math.random()<.3){ const f=2400+Math.random()*1400, o=FXS19A.AC.createOscillator(), g=FXS19A.AC.createGain(); o.type="sine"; o.frequency.setValueAtTime(f,t); o.frequency.exponentialRampToValueAtTime(f*1.4,t+.08); o.frequency.exponentialRampToValueAtTime(f*.9,t+.16); g.gain.setValueAtTime(.0001,t); g.gain.linearRampToValueAtTime(.02,t+.02); g.gain.exponentialRampToValueAtTime(.0001,t+.18); o.connect(g); g.connect(FXS19A.out); o.start(t); o.stop(t+.25); } if(i%8===0) FXS19A.note(FXS19A.M([57,60,64,62][Math.floor(i/8)%4]),t,2.4,"sine",.025,.4); }},
    battle:{bpm:132,fn:function(t,i){ const k=i%8; if(k===0||k===3||k===6){ const o=FXS19A.AC.createOscillator(), g=FXS19A.AC.createGain(); o.frequency.setValueAtTime(110,t); o.frequency.exponentialRampToValueAtTime(40,t+.25); g.gain.setValueAtTime(.18,t); g.gain.exponentialRampToValueAtTime(.0001,t+.3); o.connect(g); g.connect(FXS19A.out); o.start(t); o.stop(t+.35); } if(k===4) FXS19A.nz(t,.2,1800,.08,.8); if(k%2) FXS19A.nz(t,.05,7000,.025,1); if(i%16===0) FXS19A.note(FXS19A.M(45),t,1.2,"sawtooth",.035,.04); if(i%16===8) FXS19A.note(FXS19A.M(48),t,1.2,"sawtooth",.035,.04); }}
  };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  function tick(){ if(!FXS19A.AC||FXS19A.scene==="off"||FXS19A.D.hidden) return; const s=FXS19A.SC[FXS19A.scene]; if(!s) return; const dt=60/s.bpm/2; while(FXS19A.next<FXS19A.AC.currentTime+.4){ try{ s.fn(FXS19A.next,FXS19A.step); }catch(e){} FXS19A.next+=dt; FXS19A.step++; } }
  function music(sc){ FXS19A.scene=sc; FXS19A.ls("mi-music",sc); if(sc==="off"){ if(FXS19A.AC){ FXS19A.out.gain.setTargetAtTime(.0001,FXS19A.AC.currentTime,.4); } clearInterval(FXS19A.timer); FXS19A.timer=0; FXS19A.skyScene(); return; }
    if(!FXS19A.ctx()) return; FXS19A.out.gain.setTargetAtTime(.9,FXS19A.AC.currentTime,.8); FXS19A.next=FXS19A.AC.currentTime+.1; FXS19A.step=0; if(!FXS19A.timer) FXS19A.timer=setInterval(tick,120); FXS19A.skyScene(); }
  FXS19A.D.addEventListener("visibilitychange",() =>{ if(!FXS19A.AC) return; if(FXS19A.D.hidden) FXS19A.AC.suspend(); else if(FXS19A.scene!=="off"){ FXS19A.AC.resume(); FXS19A.next=FXS19A.AC.currentTime+.1; } });
  addEventListener("pointerdown",function once(){ removeEventListener("pointerdown",once,true); if(FXS19A.scene!=="off"&&FXS19A.LAP.matches) music(FXS19A.scene); },true);
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-mimus]"); if(!b) return; Array.prototype.forEach.call(FXS19A.D.querySelectorAll("[data-mimus]"),(x) =>{ const on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on); }); music(b.getAttribute("data-mimus")); },true);
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  FXENV.__miMusicH=function(){ if(!FXS19A.LAP.matches) return ""; const B=function(v,l){ const on=FXS19A.scene===v; return '<button type="button" class="thb'+(on?" on":"")+'" data-mimus="'+v+'" aria-pressed="'+on+'">'+l+'</button>'; };
    return '<div class="info-h">Music</div><div class="thg">'+B("off","Off")+B("tavern","Tavern")+B("dungeon","Dungeon")+B("forest","Forest")+B("battle","Battle")+'</div><p class="info-d">Made on the fly, nothing to download. The sky follows the music.</p>'; };
  /* heartbeat keeps going on a laptop while Hit Points stay at a quarter or less */
  const hbT=0; FXS19A.hpPct=function hpPct(){ const c=FXS19A.D.getElementById("hpCur"), m=FXS19A.D.getElementById("hpMax"); const a=c?parseInt((c.textContent||"").replace(/[^\d-]/g,""),10):NaN, b=m?parseInt((m.textContent||"").replace(/[^\d]/g,""),10):NaN; return a>=0&&b>0?a/b:null; };;
  setInterval(() =>{ if(!FXS19A.lap()||FXS19A.D.hidden) return; const p=FXS19A.hpPct(); if(p!=null&&p>0&&p<=.25&&(FXS19A.ls("mi-snd")||"on")==="on") FXS19A.play("heart"); },2600);

  /* G10 the sky answers: danger from Hit Points, colour from the music */
  FXS19A.SCN={off:null,tavern:[1,.62,.3],dungeon:[.35,.42,.75],forest:[.35,.8,.45],battle:[.95,.25,.2]};;
  FXS19A.hpE=FXS19A.D.getElementById("hpBox");
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
 if(FXS19A.hpE) new MutationObserver(() =>{ const p=FXS19A.hpPct(); if(FXENV.__miSky&&p!=null) FXENV.__miSky({danger:p<=0?1:p<=.25?.85:p<=.5?.35:0}); }).observe(FXS19A.hpE,{childList:true,subtree:true,characterData:true});
  setTimeout(() =>{ FXS19A.skyScene(); const p=FXS19A.hpPct(); if(FXENV.__miSky&&p!=null) FXENV.__miSky({danger:p<=0?1:p<=.25?.85:p<=.5?.35:0}); },600);
  addEventListener("pointermove",(e) =>{ if(e.pointerType==="mouse"&&FXENV.__miSky) FXENV.__miSky({mx:e.clientX/innerWidth,my:e.clientY/innerHeight}); },{passive:true});

  /* G12 a heavy hit shakes the whole view on a laptop */
  FXS19A.stage=function stage(){ const p=FXS19A.D.getElementById("p-main"); if(!p) return null; let e=p; while(e.parentElement&&e.parentElement.id!=="app") e=e.parentElement; return e; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  ;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#dmgBtn"); if(!b||!FXS19A.lap()) return; const amt=+((FXS19A.D.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return; const s=FXS19A.stage(); if(!s) return; const k=Math.min(1,amt/15)*8+3;
    setTimeout(() =>{ s.animate([{transform:"none"},{transform:"translate("+(-k)+"px,"+(k*.4)+"px) rotate(-.3deg)"},{transform:"translate("+(k*.8)+"px,"+(-k*.3)+"px) rotate(.25deg)"},{transform:"translate("+(-k*.4)+"px,"+(k*.2)+"px)"},{transform:"none"}],{duration:420,easing:"ease-out"}); },40); },true);

  /* G11 a 3D d20 on laptops: a lit icosahedron that tumbles and settles, drawn only while it moves */
  const t3=(1+Math.sqrt(5))/2, V=[[-1,t3,0],[1,t3,0],[-1,-t3,0],[1,-t3,0],[0,-1,t3],[0,1,t3],[0,-1,-t3],[0,1,-t3],[t3,0,-1],[t3,0,1],[-t3,0,-1],[-t3,0,1]],
      F=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]];
  const DICE={class:null,metal:[.62,.67,.72],crystal:[.55,.75,1],bone:[.92,.88,.78]};
  FXS19A.die3d=function die3d(host){ if(!FXS19A.lap()) return false; const cv=FXS19A.D.createElement("canvas"); cv.width=280; cv.height=280; cv.className="mi-d3"; const gl=cv.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:true}); if(!gl) return false;
    const vs="attribute vec3 p;attribute vec3 n;uniform mat3 r;varying vec3 vn;varying vec3 vp;void main(){vec3 q=r*p;vn=r*n;vp=q;gl_Position=vec4(q.xy*.52,-q.z*.1,1.);}",
        fs="precision mediump float;varying vec3 vn;varying vec3 vp;uniform vec3 c;void main(){vec3 L=normalize(vec3(-.4,.6,.7));float d=max(dot(normalize(vn),L),0.);float s=pow(max(dot(reflect(-L,normalize(vn)),vec3(0,0,1)),0.),24.);float rim=pow(1.-abs(normalize(vn).z),2.)*.35;gl_FragColor=vec4(c*(.28+.8*d)+vec3(s*.7+rim),1.);}";
    function sh(t,s){ const x=gl.createShader(t); gl.shaderSource(x,s); gl.compileShader(x); return x; } const pg=gl.createProgram(); gl.attachShader(pg,sh(gl.VERTEX_SHADER,vs)); gl.attachShader(pg,sh(gl.FRAGMENT_SHADER,fs)); gl.linkProgram(pg); if(!gl.getProgramParameter(pg,gl.LINK_STATUS)) return false; gl.useProgram(pg);
    const P=[],N=[]; F.forEach((f) =>{ let a=V[f[0]],b=V[f[1]],c=V[f[2]], u=[b[0]-a[0],b[1]-a[1],b[2]-a[2]], v=[c[0]-a[0],c[1]-a[1],c[2]-a[2]], n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]], l=Math.hypot(n[0],n[1],n[2]); n=n.map((x) =>{ return x/l; }); [a,b,c].forEach((q) =>{ P.push(q[0]/1.9,q[1]/1.9,q[2]/1.9); N.push(n[0],n[1],n[2]); }); });
    function buf(d,name){ const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW); const l=gl.getAttribLocation(pg,name); gl.enableVertexAttribArray(l); gl.vertexAttribPointer(l,3,gl.FLOAT,false,0,0); } buf(P,"p"); buf(N,"n");
    gl.enable(gl.DEPTH_TEST); let uR=gl.getUniformLocation(pg,"r"), uC=gl.getUniformLocation(pg,"c"), sk=FXS19A.D.documentElement.getAttribute("data-mi-dice")||"class", col=DICE[sk];
    if(!col){ const v=(getComputedStyle(FXS19A.D.documentElement).getPropertyValue("--pl-rgb")||"214,69,59").split(",").map((x) =>{ return (+x||0)/255; }); col=v.length===3?v:[.8,.3,.25]; } gl.uniform3f(uC,col[0],col[1],col[2]);
    const ax=Math.random()*6, ay=Math.random()*6, sx=9+Math.random()*4, sy=7+Math.random()*4, t0=performance.now(), dur=860;
    function rot(a,b){ const ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b); return [cb,sa*sb,-ca*sb, 0,ca,sa, sb,-sa*cb,ca*cb]; }
    (function fr(now){ const k=Math.min(1,(now-t0)/dur), e=1-Math.pow(1-k,3); gl.viewport(0,0,280,280); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT); gl.uniformMatrix3fv(uR,false,new Float32Array(rot(ax+sx*(1-e),ay+sy*(1-e)))); gl.drawArrays(gl.TRIANGLES,0,60); if(k<1&&cv.isConnected) requestAnimationFrame(fr); })(t0);
    host.insertBefore(cv,host.firstChild); host.classList.add("mi-3d"); return true; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  ;
  new MutationObserver((ms) =>{ ms.forEach((m) =>{ Array.prototype.forEach.call(m.addedNodes,(n) =>{ if(n.classList&&n.classList.contains("mi-roll-o")){ const dz=n.querySelector(".dz"); if(dz) FXS19A.die3d(dz); } }); }); }).observe(FXS19A.D.body,{childList:true});

  /* I4 Long Rest: night falls, the stars turn, "8 hours later", then dawn */
  const W=FXENV.__miWow; if(W&&W.rest){ const r0=W.rest; W.rest=function(k){ const self=this, args=arguments; if(k!=="long"||FXS19A.calm()){ r0.apply(self,args); return; }
      const n=FXS19A.layer("mi-night",'<div class="sky"></div><div class="moon"></div><b>8 hours later</b>',3400), sk=n.querySelector(".sky"), mo=n.querySelector(".moon"), tx=n.querySelector("b");
      n.animate([{opacity:0},{opacity:1,offset:.2},{opacity:1,offset:.75},{opacity:0}],{duration:3000,easing:"ease-in-out"}).onfinish=function(){ FXS19A.rm(n); };
      sk.animate([{transform:"rotate(0deg) scale(1.2)"},{transform:"rotate(18deg) scale(1.2)"}],{duration:3000,easing:"linear"});
      mo.animate([{transform:"translate(-30vw,20vh)"},{transform:"translate(30vw,-6vh)"}],{duration:3000,easing:"cubic-bezier(.4,0,.2,1)"});
      tx.animate([{opacity:0,transform:"translateY(10px)",letterSpacing:".1em"},{opacity:1,transform:"none",letterSpacing:".22em",offset:.5},{opacity:0,letterSpacing:".3em"}],{duration:2400,delay:400,easing:"ease-in-out",fill:"backwards"});
      FXS19A.play("rest"); setTimeout(() =>{ r0.apply(self,args); },2200); }; }

  /* I5 Level Up: the new features turn over one by one */
  FXS19A.feats=function feats(){ return Array.prototype.map.call(FXS19A.D.querySelectorAll("#featBody .fitem h4 .tx"),(e) =>{ return (e.textContent||"").trim(); }).filter(Boolean); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  ;
  function lvCards(){ const s=FXS19A.st(); if(!s||!s.C) return; let key="mi-feat-"+s.C.name, now=FXS19A.feats(), old=null; try{ old=JSON.parse(FXS19A.ls(key)||"null"); }catch(e){}
    const lvKey="mi-lvl-"+s.C.name, lv0=+(FXS19A.ls(lvKey)||0); FXS19A.ls(key,JSON.stringify(now)); FXS19A.ls(lvKey,s.C.level||0);
    if(!old||!(s.C.level>lv0)||!lv0||FXS19A.calm()) return; const nw=now.filter((x) =>{ return old.indexOf(x)<0; }).slice(0,5);
    const h='<div class="lv"><small>Level up</small><b>Level '+s.C.level+'</b></div><div class="cards">'+(nw.length?nw:["Stronger than before"]).map((x,i) =>{ return '<div class="cd" style="--i:'+i+'"><i></i><span></span></div>'; }).join("")+'</div>';
    const o=FXS19A.layer("mi-lvc",h,5200); Array.prototype.forEach.call(o.querySelectorAll(".cd span"),(sp,i) =>{ sp.textContent=(nw.length?nw:["Stronger than before"])[i]; });
    o.animate([{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.86},{opacity:0}],{duration:4800,easing:"ease-in-out"}).onfinish=function(){ FXS19A.rm(o); };
    o.querySelector(".lv").animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.08)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:700,easing:"cubic-bezier(.2,.8,.2,1)"});
    Array.prototype.forEach.call(o.querySelectorAll(".cd"),(c,i) =>{ c.animate([{transform:"perspective(900px) rotateY(-110deg) translateY(30px)",opacity:0},{transform:"perspective(900px) rotateY(8deg)",opacity:1,offset:.7},{transform:"none",opacity:1}],{duration:800,delay:700+i*260,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); });
    FXS19A.play("level"); }
  function lvBoot(){ setTimeout(lvCards,900); } if(FXS19A.D.readyState==="complete") lvBoot(); else addEventListener("load",lvBoot,{once:true});
})();
