/* === L pack (laptop only): a WebGL ambient sky behind the sheet with drifting motes. Rendered at half size, 30 frames a second at most,
   paused when the tab is hidden, the window loses focus, Immersive is not Full, or reduced motion is on.
   T2 quality governor: it watches the real frame gap. When frames stay slow it steps down (size and rate), and at the last step it keeps one still frame. Button and panel effects are not part of this. === */
const FXS17A={};
(function(){
  const MI=FXENV.__MI;
  if(!MI) return;
  function drawOne(){ if(!FXS17A.gl||!FXS17A.cv) return; FXS17A.gl.uniform1f(FXS17A.uT,(performance.now()-FXS17A.t0)/1000); FXS17A.gl.uniform2f(FXS17A.uR,FXS17A.cv.width,FXS17A.cv.height); FXS17A.gl.uniform3f(FXS17A.uC,FXS17A.col[0],FXS17A.col[1],FXS17A.col[2]); FXS17A.gl.uniform1f(FXS17A.uD,FXS17A.dg); FXS17A.gl.uniform2f(FXS17A.uM,FXS17A.mx,FXS17A.my); FXS17A.gl.drawArrays(FXS17A.gl.TRIANGLES,0,3); }
  FXS17A.Q=matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1100px)"); FXS17A.RM=matchMedia("(prefers-reduced-motion: reduce)");
  FXS17A.cv=null; FXS17A.gl=null; let prog=null; FXS17A.uT=void 0; FXS17A.uR=void 0; FXS17A.uC=void 0; FXS17A.uD=void 0; FXS17A.uM=void 0; FXS17A.dg=0; FXS17A.dgT=0; FXS17A.mx=.5; FXS17A.my=.5; FXS17A.scn=null; FXS17A.raf=0; FXS17A.last=0; FXS17A.t0=performance.now(); FXS17A.run=false; FXS17A.col=[.84,.27,.23];
  const VS="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  const FS="precision mediump float;uniform float t;uniform vec2 r;uniform vec3 c;uniform float dg;uniform vec2 mo;"+
    "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}"+
    "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}"+
    "void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2+(mo-.5)*vec2(-.12,.08);float tt=t*(.035+dg*.05);"+
    "float q=fb(p+vec2(tt,tt*.6));float w=fb(p*1.3+q*1.6-vec2(tt*.8,0.));"+
    "float neb=smoothstep(.3,.95,w)*.9*(1.-uv.y*.45);"+
    "vec2 g=p*7.;vec2 gi=floor(g);vec2 gf=fract(g)-.5;float s=h(gi);vec2 o=vec2(h(gi+3.1),h(gi+7.7))-.5;"+
    "float tw=.5+.5*sin(t*.9+s*40.);float m=smoothstep(.07,0.,length(gf-o*.6))*step(.86,s)*tw;"+
    "vec3 cc=mix(c,vec3(.75,.08,.06),dg*.8);float fl=dg*step(.985,h(vec2(floor(t*3.),1.)))*smoothstep(.6,1.,uv.y);vec3 col=cc*neb+vec3(1.,.86,.55)*m*.8+vec3(.9,.85,1.)*fl*.5;float a=clamp(neb*(.85+dg*.3)+m*.7+fl*.4,0.,.92);gl_FragColor=vec4(col*a,a);}";
  function sh(t,src){ const s=FXS17A.gl.createShader(t); FXS17A.gl.shaderSource(s,src); FXS17A.gl.compileShader(s); return FXS17A.gl.getShaderParameter(s,FXS17A.gl.COMPILE_STATUS)?s:null; }
  FXS17A.init=function init(){ if(FXS17A.cv) return !!FXS17A.gl; FXS17A.cv=document.createElement("canvas"); FXS17A.cv.className="mi-amb"; FXS17A.cv.setAttribute("aria-hidden","true");
    FXS17A.gl=FXS17A.cv.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:"low-power"}); if(!FXS17A.gl){ FXS17A.cv=null; return false; }
    const v=sh(FXS17A.gl.VERTEX_SHADER,VS), f=sh(FXS17A.gl.FRAGMENT_SHADER,FS); if(!v||!f){ FXS17A.gl=null; return false; } prog=FXS17A.gl.createProgram(); FXS17A.gl.attachShader(prog,v); FXS17A.gl.attachShader(prog,f); FXS17A.gl.linkProgram(prog); if(!FXS17A.gl.getProgramParameter(prog,FXS17A.gl.LINK_STATUS)){ FXS17A.gl=null; return false; }
    FXS17A.gl.useProgram(prog); const b=FXS17A.gl.createBuffer(); FXS17A.gl.bindBuffer(FXS17A.gl.ARRAY_BUFFER,b); FXS17A.gl.bufferData(FXS17A.gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),FXS17A.gl.STATIC_DRAW); const a=FXS17A.gl.getAttribLocation(prog,"p"); FXS17A.gl.enableVertexAttribArray(a); FXS17A.gl.vertexAttribPointer(a,2,FXS17A.gl.FLOAT,false,0,0);
    FXS17A.uT=FXS17A.gl.getUniformLocation(prog,"t"); FXS17A.uR=FXS17A.gl.getUniformLocation(prog,"r"); FXS17A.uC=FXS17A.gl.getUniformLocation(prog,"c"); FXS17A.uD=FXS17A.gl.getUniformLocation(prog,"dg"); FXS17A.uM=FXS17A.gl.getUniformLocation(prog,"mo"); document.body.insertBefore(FXS17A.cv,document.body.firstChild); FXS17A.size(); return true; };;
  FXS17A.size=function size(){ if(!FXS17A.cv) return; const sc=FXS17A.SC[FXS17A.LV]||FXS17A.SC[1], w=Math.max(1,Math.round(innerWidth*sc)), h=Math.max(1,Math.round(innerHeight*sc)); if(FXS17A.cv.width!==w||FXS17A.cv.height!==h){ FXS17A.cv.width=w; FXS17A.cv.height=h; if(FXS17A.gl){ FXS17A.gl.viewport(0,0,w,h); if(FXS17A.LV===0&&FXS17A.uT) drawOne(); } } };;
  FXS17A.color=function color(){ const v=(getComputedStyle(document.documentElement).getPropertyValue("--pl-rgb")||"214,69,59").split(",").map((x) =>{ return (+x||0)/255; }); if(v.length===3) FXS17A.col=v; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI) return;
  ;
  function gov(now){ if(FXS17A.gP&&now>FXS17A.hold+300){ const d=now-FXS17A.gP; if(d<250){ FXS17A.gW.push(d); if(FXS17A.gW.length>=40){ FXS17A.gW.sort((a,b) =>{ return a-b; }); const m=FXS17A.gW[20]; FXS17A.gW.length=0; if(m>26&&FXS17A.LV>0){ FXS17A.LV--; gOK=0; FXENV.__miQ=FXS17A.LV; FXS17A.size(); } } } } FXS17A.gP=now; }
  FXS17A.frame=function frame(now){ FXS17A.raf=0; if(!FXS17A.run) return; gov(now); if(FXS17A.LV===0){ FXS17A.run=false; return; } FXS17A.raf=requestAnimationFrame(FXS17A.frame); if(now-FXS17A.last<IV[FXS17A.LV]||now<FXS17A.hold) return; FXS17A.last=now; FXS17A.gl.uniform1f(FXS17A.uT,(now-FXS17A.t0)/1000); FXS17A.gl.uniform2f(FXS17A.uR,FXS17A.cv.width,FXS17A.cv.height); FXS17A.dg+=(FXS17A.dgT-FXS17A.dg)*.04; const cc=FXS17A.scn?[FXS17A.col[0]*.35+FXS17A.scn[0]*.65,FXS17A.col[1]*.35+FXS17A.scn[1]*.65,FXS17A.col[2]*.35+FXS17A.scn[2]*.65]:FXS17A.col; FXS17A.gl.uniform3f(FXS17A.uC,cc[0],cc[1],cc[2]); FXS17A.gl.uniform1f(FXS17A.uD,FXS17A.dg); FXS17A.gl.uniform2f(FXS17A.uM,FXS17A.mx,FXS17A.my); FXS17A.gl.drawArrays(FXS17A.gl.TRIANGLES,0,3); };;
  FXS17A.hold=0;
  FXS17A.LV=3; FXS17A.SC=[0,.25,.33,.5]; var IV=[0,100,50,33]; FXS17A.gW=[]; FXS17A.gP=0; var gOK=0; /* level 3 = half size 30/s, 2 = third size 20/s, 1 = quarter size 10/s, 0 = one still frame */
  addEventListener("pointerdown",() =>{ FXS17A.hold=performance.now()+900; },{passive:true,capture:true}); addEventListener("keydown",() =>{ FXS17A.hold=performance.now()+900; },{passive:true,capture:true});
  FXS17A.want=function want(){ return FXS17A.Q.matches&&!FXS17A.RM.matches&&MI.mode==="full"&&!document.hidden&&document.hasFocus()&&document.documentElement.getAttribute("data-skin")==="ddb"&&document.documentElement.getAttribute("data-theme")!=="light"; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI) return;
  ;
  function upd(){ const w=FXS17A.want(); if(w&&!FXS17A.init()) return; if(FXS17A.cv) FXS17A.cv.classList.toggle("on",w); if(w&&!FXS17A.run&&FXS17A.LV>0){ FXS17A.run=true; FXS17A.color(); FXS17A.last=0; FXS17A.gP=0; FXS17A.gW.length=0; FXS17A.raf=requestAnimationFrame(FXS17A.frame); } else if(!w&&FXS17A.run){ FXS17A.run=false; if(FXS17A.raf) cancelAnimationFrame(FXS17A.raf); FXS17A.raf=0; } }
  document.addEventListener("visibilitychange",upd); addEventListener("focus",upd); addEventListener("blur",upd); addEventListener("resize",() =>{ FXS17A.size(); upd(); },{passive:true});
  if(FXS17A.Q.addEventListener){ FXS17A.Q.addEventListener("change",upd); FXS17A.RM.addEventListener("change",upd); }
  let mq=0; new MutationObserver(() =>{ if(mq) return; mq=requestAnimationFrame(() =>{ mq=0; FXS17A.color(); upd(); }); }).observe(document.documentElement,{attributes:true,attributeFilter:["class","data-mi-cls","data-skin","data-theme"]});/* T1: once per frame. Each class change used to read the computed style at once */
  const a0=FXENV.__miAmb; FXENV.__miAmb=function(){ if(a0) try{ a0.apply(this,arguments); }catch(e){} upd(); };
  const shq=document.getElementById("sheet"); if(shq) new MutationObserver(() =>{ FXS17A.hold=performance.now()+900; }).observe(shq,{attributes:true,attributeFilter:["class"]});
  FXENV.__miQ=FXS17A.LV; /* read by tests: 3 full quality, 0 still frame */
  FXENV.__miSky=function(o){ if(!o) return; if(o.danger!=null) FXS17A.dgT=o.danger; if(o.mx!=null){ FXS17A.mx=o.mx; FXS17A.my=o.my; } if("scene" in o) FXS17A.scn=o.scene; };
  setTimeout(upd,300);
})();
