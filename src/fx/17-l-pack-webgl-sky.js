/* === L pack (laptop only): a WebGL ambient sky behind the sheet with drifting motes. Rendered at half size, 30 frames a second at most,
   paused when the tab is hidden, the window loses focus, Immersive is not Full, or reduced motion is on === */
(function(){
  var MI=window.__MI; if(!MI) return;
  var Q=matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1100px)"), RM=matchMedia("(prefers-reduced-motion: reduce)");
  var cv=null, gl=null, prog=null, uT, uR, uC, uD, uM, dg=0, dgT=0, mx=.5, my=.5, scn=null, raf=0, last=0, t0=performance.now(), run=false, col=[.84,.27,.23];
  var VS="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
  var FS="precision mediump float;uniform float t;uniform vec2 r;uniform vec3 c;uniform float dg;uniform vec2 mo;"+
    "float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}"+
    "float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}"+
    "float fb(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}"+
    "void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=uv*vec2(r.x/r.y,1.)*2.2+(mo-.5)*vec2(-.12,.08);float tt=t*(.035+dg*.05);"+
    "float q=fb(p+vec2(tt,tt*.6));float w=fb(p*1.3+q*1.6-vec2(tt*.8,0.));"+
    "float neb=smoothstep(.3,.95,w)*.9*(1.-uv.y*.45);"+
    "vec2 g=p*7.;vec2 gi=floor(g);vec2 gf=fract(g)-.5;float s=h(gi);vec2 o=vec2(h(gi+3.1),h(gi+7.7))-.5;"+
    "float tw=.5+.5*sin(t*.9+s*40.);float m=smoothstep(.07,0.,length(gf-o*.6))*step(.86,s)*tw;"+
    "vec3 cc=mix(c,vec3(.75,.08,.06),dg*.8);float fl=dg*step(.985,h(vec2(floor(t*3.),1.)))*smoothstep(.6,1.,uv.y);vec3 col=cc*neb+vec3(1.,.86,.55)*m*.8+vec3(.9,.85,1.)*fl*.5;float a=clamp(neb*(.85+dg*.3)+m*.7+fl*.4,0.,.92);gl_FragColor=vec4(col*a,a);}";
  function sh(t,src){ var s=gl.createShader(t); gl.shaderSource(s,src); gl.compileShader(s); return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null; }
  function init(){ if(cv) return !!gl; cv=document.createElement("canvas"); cv.className="mi-amb"; cv.setAttribute("aria-hidden","true");
    gl=cv.getContext("webgl",{alpha:true,premultipliedAlpha:true,antialias:false,depth:false,stencil:false,powerPreference:"low-power"}); if(!gl){ cv=null; return false; }
    var v=sh(gl.VERTEX_SHADER,VS), f=sh(gl.FRAGMENT_SHADER,FS); if(!v||!f){ gl=null; return false; } prog=gl.createProgram(); gl.attachShader(prog,v); gl.attachShader(prog,f); gl.linkProgram(prog); if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ gl=null; return false; }
    gl.useProgram(prog); var b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW); var a=gl.getAttribLocation(prog,"p"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
    uT=gl.getUniformLocation(prog,"t"); uR=gl.getUniformLocation(prog,"r"); uC=gl.getUniformLocation(prog,"c"); uD=gl.getUniformLocation(prog,"dg"); uM=gl.getUniformLocation(prog,"mo"); document.body.insertBefore(cv,document.body.firstChild); size(); return true; }
  function size(){ if(!cv) return; var w=Math.max(1,Math.round(innerWidth*.5)), h=Math.max(1,Math.round(innerHeight*.5)); if(cv.width!==w||cv.height!==h){ cv.width=w; cv.height=h; if(gl) gl.viewport(0,0,w,h); } }
  function color(){ var v=(getComputedStyle(document.documentElement).getPropertyValue("--pl-rgb")||"214,69,59").split(",").map(function(x){ return (+x||0)/255; }); if(v.length===3) col=v; }
  function frame(now){ raf=0; if(!run) return; raf=requestAnimationFrame(frame); if(now-last<33||now<hold) return; last=now; gl.uniform1f(uT,(now-t0)/1000); gl.uniform2f(uR,cv.width,cv.height); dg+=(dgT-dg)*.04; var cc=scn?[col[0]*.35+scn[0]*.65,col[1]*.35+scn[1]*.65,col[2]*.35+scn[2]*.65]:col; gl.uniform3f(uC,cc[0],cc[1],cc[2]); gl.uniform1f(uD,dg); gl.uniform2f(uM,mx,my); gl.drawArrays(gl.TRIANGLES,0,3); }
  var hold=0; addEventListener("pointerdown",function(){ hold=performance.now()+900; },{passive:true,capture:true}); addEventListener("keydown",function(){ hold=performance.now()+900; },{passive:true,capture:true});
  function want(){ return Q.matches&&!RM.matches&&MI.mode==="full"&&!document.hidden&&document.hasFocus()&&document.documentElement.getAttribute("data-skin")==="ddb"&&document.documentElement.getAttribute("data-theme")!=="light"; }
  function upd(){ var w=want(); if(w&&!init()) return; if(cv) cv.classList.toggle("on",w); if(w&&!run){ run=true; color(); last=0; raf=requestAnimationFrame(frame); } else if(!w&&run){ run=false; if(raf) cancelAnimationFrame(raf); raf=0; } }
  document.addEventListener("visibilitychange",upd); addEventListener("focus",upd); addEventListener("blur",upd); addEventListener("resize",function(){ size(); upd(); },{passive:true});
  if(Q.addEventListener){ Q.addEventListener("change",upd); RM.addEventListener("change",upd); }
  new MutationObserver(function(){ color(); upd(); }).observe(document.documentElement,{attributes:true,attributeFilter:["class","data-mi-cls","data-skin","data-theme"]});
  var a0=window.__miAmb; window.__miAmb=function(){ if(a0) try{ a0.apply(this,arguments); }catch(e){} upd(); };
  var shq=document.getElementById("sheet"); if(shq) new MutationObserver(function(){ hold=performance.now()+900; }).observe(shq,{attributes:true,attributeFilter:["class"]});
  window.__miSky=function(o){ if(!o) return; if(o.danger!=null) dgT=o.danger; if(o.mx!=null){ mx=o.mx; my=o.my; } if("scene" in o) scn=o.scene; };
  setTimeout(upd,300);
})();

