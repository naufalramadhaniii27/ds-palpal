/* T11 N27: 3D dice without a physics engine (before: dice-box on BabylonJS and Havok, vendor/dice, 6 MB, D1 and D2).
   Same idea as instanced grass with wind in the shader: the result looks the same, the machine does far less. The value of each die is
   decided first (crypto.getRandomValues, or a value given by the caller, N23), then the die is thrown along a computed path: a fall,
   three bounces that get lower, and a tumble that slows down and ends exactly with the decided face up and its number upright.
   No collisions: every die has its own landing spot, so dice never pass through each other. One small WebGL program (WebGL 1),
   flat faces, a number atlas drawn on a 2D canvas, gloss from a highlight and a rim light, a soft shadow on the table.
   Nothing to download: the code is part of the app. window.__dice3d.roll([20,20]) answers the values in the same order after the dice
   land, roll(list, values) shows given values. Without WebGL it answers null and the caller uses crypto numbers as before.
   Motion off and Calm never call it (16-z-pack). Faces it knows: 4, 6, 8, 10, 12, 20 and 100 (two ten-sided dice). Other sizes get a
   crypto value and no die. */
const FXS25A={};
(function(){
  FXS25A.D=document; FXS25A.tray=null; FXS25A.cv=null; FXS25A.gl=null; FXS25A.P=null; FXS25A.PS=null; FXS25A.BUF=null; FXS25A.GEO={}; FXS25A.queue=Promise.resolve(); FXS25A.hideT=0; FXS25A.lost=false; FXS25A.stats={rolls:0,frames:0,ms:0};
  FXS25A.PHI=(1+Math.sqrt(5))/2;
  /* ---------- vectors and quaternions ---------- */
  FXS25A.sub=function sub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; };; FXS25A.addv=function addv(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; };; FXS25A.mul=function mul(a,s){ return [a[0]*s,a[1]*s,a[2]*s]; };;
  FXS25A.dot=function dot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; };; FXS25A.cross=function cross(a,b){ return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; };;
  FXS25A.len=function len(a){ return Math.sqrt(FXS25A.dot(a,a)); };; FXS25A.nrm=function nrm(a){ const l=FXS25A.len(a)||1; return [a[0]/l,a[1]/l,a[2]/l]; };;
  FXS25A.qax=function qax(ax,an){ ax=FXS25A.nrm(ax); const s=Math.sin(an/2); return [ax[0]*s,ax[1]*s,ax[2]*s,Math.cos(an/2)]; };;
  FXS25A.qmul=function qmul(a,b){ return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]]; };;
  FXS25A.qrot=function qrot(q,v){ const p=FXS25A.qmul(FXS25A.qmul(q,[v[0],v[1],v[2],0]),[-q[0],-q[1],-q[2],q[3]]); return [p[0],p[1],p[2]]; };;
  FXS25A.qfromto=function qfromto(a,b){ a=FXS25A.nrm(a); b=FXS25A.nrm(b); const d=FXS25A.dot(a,b); if(d>0.999999) return [0,0,0,1]; if(d<-0.999999){ const o=Math.abs(a[0])<0.9?[1,0,0]:[0,1,0]; return FXS25A.qax(FXS25A.cross(a,o),Math.PI); } return FXS25A.qax(FXS25A.cross(a,b),Math.acos(Math.max(-1,Math.min(1,d)))); };;
  /* ---------- the solids ---------- */
  /* convex hull of a few points: every plane through three points with all points on one side is a face, its points ordered
     counter-clockwise seen from outside */
  FXS25A.hull=function hull(V){ const F=[], seen={}, n=V.length;
    for(let i=0;i<n;i++) for(let j=i+1;j<n;j++) for(let k=j+1;k<n;k++){ let nn=FXS25A.cross(FXS25A.sub(V[j],V[i]),FXS25A.sub(V[k],V[i])); if(FXS25A.len(nn)<1e-9) continue; nn=FXS25A.nrm(nn); let d=FXS25A.dot(nn,V[i]), pos=0, neg=0, on=[];
      for(let m=0;m<n;m++){ const s=FXS25A.dot(nn,V[m])-d; if(s>1e-6) pos++; else if(s<-1e-6) neg++; else on.push(m); } if(pos&&neg) continue; if(pos){ nn=FXS25A.mul(nn,-1); }
      const key=on.join(","); if(seen[key]) continue; seen[key]=1; var c=[0,0,0]; on.forEach((q) =>{ c=FXS25A.addv(c,V[q]); }); c=FXS25A.mul(c,1/on.length);
      var ax=FXS25A.nrm(FXS25A.sub(V[on[0]],c)), bx=FXS25A.cross(nn,ax); on.sort((p,q) =>{ const a=FXS25A.sub(V[p],c), b=FXS25A.sub(V[q],c); return Math.atan2(FXS25A.dot(a,bx),FXS25A.dot(a,ax))-Math.atan2(FXS25A.dot(b,bx),FXS25A.dot(b,ax)); });
      F.push({v:on,n:nn,c:c}); }
    return F; };
})();
(function(){
  ;
  FXS25A.points=function points(t){ let V=[], i, a;
    if(t===4) V=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
    else if(t===6){ for(i=0;i<8;i++) V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1]); }
    else if(t===8) V=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    else if(t===20){ [-1,1].forEach((s) =>{ [-1,1].forEach((r) =>{ V.push([0,s,r*FXS25A.PHI],[s,r*FXS25A.PHI,0],[r*FXS25A.PHI,0,s]); }); }); }
    else if(t===12){ for(i=0;i<8;i++) V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1]); [-1,1].forEach((s) =>{ [-1,1].forEach((r) =>{ V.push([0,s/FXS25A.PHI,r*FXS25A.PHI],[s/FXS25A.PHI,r*FXS25A.PHI,0],[r*FXS25A.PHI,0,s/FXS25A.PHI]); }); }); }
    else if(t===10){ /* pentagonal trapezohedron: two rings of five, apex height solved so each kite is flat */
      const z=0.105, U=function(k){ a=2*Math.PI*k/5; return [Math.cos(a),z,Math.sin(a)]; }, L=function(k){ a=2*Math.PI*k/5+Math.PI/5; return [Math.cos(a),-z,Math.sin(a)]; };
      const det=function(h){ const T=[0,h,0]; return FXS25A.dot(FXS25A.cross(FXS25A.sub(U(0),T),FXS25A.sub(U(1),T)),FXS25A.sub(L(0),T)); }, d0=det(0), d1=det(1), h=-d0/(d1-d0);
      V.push([0,h,0],[0,-h,0]); for(i=0;i<5;i++) V.push(U(i),L(i)); }
    let R=0; V.forEach((p) =>{ R=Math.max(R,FXS25A.len(p)); }); return V.map((p) =>{ return FXS25A.mul(p,1/R); }); };
})();
(function(){
  ;
  /* faces, values (opposite faces add up to n+1), the direction a number reads upright, and the sizes the throw needs */
  FXS25A.solid=function solid(t){ const V=FXS25A.points(t), F=FXS25A.hull(V), ord=F.map((f,i) =>{ return i; }), N=F.length;
    ord.sort((a,b) =>{ const A=F[a].n, B=F[b].n; return (B[1]-A[1])||(Math.atan2(A[2],A[0])-Math.atan2(B[2],B[0])); });
    let used={}, low=1; ord.forEach((i) =>{ if(used[i]) return; let j=-1, best=2; F.forEach((g,k) =>{ const dd=FXS25A.dot(F[i].n,g.n); if(k!==i&&!used[k]&&dd<best){ best=dd; j=k; } });
      F[i].val=low; used[i]=1; if(j>=0&&t!==4){ F[j].val=N+1-low; used[j]=1; } low++; });
    F.forEach((f) =>{ let up;
      if(t===10){ const ap=f.v.reduce((a,q) =>{ return Math.abs(V[q][1])>Math.abs(V[a][1])?q:a; },f.v[0]); up=FXS25A.sub(V[ap],f.c); }
      else if(f.v.length===4) up=FXS25A.sub(FXS25A.mul(FXS25A.addv(V[f.v[0]],V[f.v[1]]),0.5),f.c);
      else up=FXS25A.sub(V[f.v[0]],f.c);
      up=FXS25A.nrm(FXS25A.sub(up,FXS25A.mul(f.n,FXS25A.dot(up,f.n)))); f.up=up; f.rt=FXS25A.cross(up,f.n); f.d=FXS25A.dot(f.n,f.c); });
    const rin=F[0].d; return {t:t,V:V,F:F,rin:rin}; };
})();
(function(){
  ;
  /* ---------- the number atlas: red = number, green = near an edge (the bevel catches the light) ---------- */
  FXS25A.atlas=function atlas(S,labels){ const F=S.F, cols=Math.ceil(Math.sqrt(F.length)), px=Math.max(96,Math.min(192,Math.floor(1024/cols))), W=cols*px;
    /* one canvas, added light: numbers in red, edges in green, so no pixel read back is needed (getImageData took seconds on a first use) */
    const a=FXS25A.D.createElement("canvas"); a.width=a.height=W; const x=a.getContext("2d"), y=x; x.fillStyle="#000"; x.fillRect(0,0,W,W); x.globalCompositeOperation="lighter";
    let R=0; F.forEach((f) =>{ f.v.forEach((q) =>{ R=Math.max(R,FXS25A.len(FXS25A.sub(S.V[q],f.c))); }); });
    F.forEach((f,i) =>{ const cx=(i%cols)*px+px/2, cy=Math.floor(i/cols)*px+px/2, k=0.47*px/R;
      const P2=f.v.map((q) =>{ const p=FXS25A.sub(S.V[q],f.c); return [cx+FXS25A.dot(p,f.rt)*k, cy-FXS25A.dot(p,f.up)*k]; }); f.uv=P2.map((p) =>{ return [p[0]/W,p[1]/W]; });
      /* inner distance to the edges, for the number size */
      let inr=1e9; for(let e=0;e<P2.length;e++){ const p=P2[e], q=P2[(e+1)%P2.length], ex=q[0]-p[0], ey=q[1]-p[1], l=Math.hypot(ex,ey); inr=Math.min(inr,Math.abs((cx-p[0])*ey-(cy-p[1])*ex)/l); }
      y.save(); y.beginPath(); P2.forEach((p,e) =>{ if(e) y.lineTo(p[0],p[1]); else y.moveTo(p[0],p[1]); }); y.closePath(); y.clip(); for(let g=4;g>=1;g--){ y.strokeStyle="rgba(0,255,0,"+(0.22*(5-g)/4).toFixed(3)+")"; y.lineWidth=px/40*g*1.6; y.stroke(); } y.restore();/* soft bevel from four strokes (a canvas blur filter took seconds on slow phones) */
      x.fillStyle="#f00"; x.textAlign="center"; x.textBaseline="middle";
      if(S.t===4){ f.v.forEach((q,e) =>{ const p=P2[e], dx=p[0]-cx, dy=p[1]-cy, l=Math.hypot(dx,dy); x.save(); x.translate(cx+dx*0.5,cy+dy*0.5); x.rotate(Math.atan2(dx,-dy)); x.font="700 "+Math.round(inr*0.95)+"px Archivo, 'Helvetica Neue', Arial, sans-serif"; x.fillText(String(S.vv[q]),0,0); x.restore(); }); return; }
      const s=String(labels?labels[f.val]:f.val), fs=inr*(s.length>1?(S.t===10?0.82:1.0):1.25)*(S.t===10?0.9:1); x.save(); x.translate(cx,cy+(S.t===10?inr*0.18:0)); x.font="700 "+Math.round(fs)+"px Archivo, 'Helvetica Neue', Arial, sans-serif"; x.fillText(s,0,fs*0.04);
      if(s==="6"||s==="9"){ x.fillRect(-fs*0.22,fs*0.42,fs*0.44,Math.max(2,fs*0.07)); } x.restore(); });
    return a; };;
  /* ---------- WebGL ---------- */
  FXS25A.VS="attribute vec3 p;attribute vec3 n;attribute vec2 t;uniform mat4 M;uniform mat4 VP;varying vec3 vn;varying vec3 vw;varying vec2 vt;void main(){vec4 w=M*vec4(p,1.);vw=w.xyz;vn=(M*vec4(n,0.)).xyz;vt=t;gl_Position=VP*w;}";
  FXS25A.FS="precision mediump float;uniform sampler2D tx;uniform vec3 col;uniform vec3 ink;uniform vec3 eye;varying vec3 vn;varying vec3 vw;varying vec2 vt;"+
    "void main(){vec4 s=texture2D(tx,vt);vec3 N=normalize(vn);vec3 V=normalize(eye-vw);vec3 L1=normalize(vec3(-.75,.62,-.55));vec3 L2=normalize(vec3(.6,.5,.7));"+
    "float d1=max(dot(N,L1),0.);float d2=max(dot(N,L2),0.);vec3 base=mix(col,ink,s.r);"+
    "float sp=pow(max(dot(N,normalize(L1+V)),0.),70.)*.9+pow(max(dot(N,normalize(L2+V)),0.),30.)*.18;float fr=pow(1.-max(dot(N,V),0.),3.);"+
    "vec3 c=base*(.34+.72*d1+.22*d2)+vec3(1.)*sp*(1.-s.r*.5)+col*fr*.35+vec3(.85,.9,1.)*fr*.16+vec3(1.,.95,.9)*s.g*.16*(.4+d1);gl_FragColor=vec4(c,1.);}";
  FXS25A.VSS="attribute vec2 q;uniform mat4 VP;uniform vec3 c;uniform float r;varying vec2 vq;void main(){vq=q;gl_Position=VP*vec4(c.x+q.x*r,.002,c.z+q.y*r,1.);}";
  FXS25A.FSS="precision mediump float;uniform float a;varying vec2 vq;void main(){float d=length(vq);gl_FragColor=vec4(0.,0.,0.,a*(1.-smoothstep(.2,1.,d)));}";
  function sh(type,src){ const s=FXS25A.gl.createShader(type); FXS25A.gl.shaderSource(s,src); FXS25A.gl.compileShader(s); if(!FXS25A.gl.getShaderParameter(s,FXS25A.gl.COMPILE_STATUS)) throw new Error(FXS25A.gl.getShaderInfoLog(s)); return s; }
  FXS25A.prog=function prog(v,f,attrs){ const p=FXS25A.gl.createProgram(); FXS25A.gl.attachShader(p,sh(FXS25A.gl.VERTEX_SHADER,v)); FXS25A.gl.attachShader(p,sh(FXS25A.gl.FRAGMENT_SHADER,f)); attrs.forEach((a,i) =>{ FXS25A.gl.bindAttribLocation(p,i,a); }); FXS25A.gl.linkProgram(p); if(!FXS25A.gl.getProgramParameter(p,FXS25A.gl.LINK_STATUS)) throw new Error(FXS25A.gl.getProgramInfoLog(p)); const u={}, n=FXS25A.gl.getProgramParameter(p,FXS25A.gl.ACTIVE_UNIFORMS); for(let i=0;i<n;i++){ const k=FXS25A.gl.getActiveUniform(p,i).name; u[k]=FXS25A.gl.getUniformLocation(p,k); } return {p:p,u:u}; };
})();
(function(){
  ;
  FXS25A.init=function init(){ if(FXS25A.gl&&!FXS25A.lost) return true; if(!FXS25A.tray){ FXS25A.tray=FXS25A.D.createElement("div"); FXS25A.tray.id="diceTray"; FXS25A.tray.setAttribute("aria-hidden","true"); FXS25A.D.body.appendChild(FXS25A.tray); }
    if(!FXS25A.cv){ FXS25A.cv=FXS25A.D.createElement("canvas"); FXS25A.tray.appendChild(FXS25A.cv); FXS25A.cv.addEventListener("webglcontextlost",(e) =>{ e.preventDefault(); FXS25A.lost=true; }); FXS25A.cv.addEventListener("webglcontextrestored",() =>{ FXS25A.lost=false; FXS25A.gl=null; FXS25A.GEO={}; FXS25A.init(); }); }
    try{ FXS25A.gl=FXS25A.cv.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true})||FXS25A.cv.getContext("experimental-webgl"); }catch(e){ FXS25A.gl=null; } if(!FXS25A.gl) return false;
    try{ FXS25A.P=FXS25A.prog(FXS25A.VS,FXS25A.FS,["p","n","t"]); FXS25A.PS=FXS25A.prog(FXS25A.VSS,FXS25A.FSS,["q"]); }catch(e){ FXS25A.gl=null; return false; }
    FXS25A.BUF=FXS25A.gl.createBuffer(); FXS25A.gl.bindBuffer(FXS25A.gl.ARRAY_BUFFER,FXS25A.BUF); FXS25A.gl.bufferData(FXS25A.gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),FXS25A.gl.STATIC_DRAW); FXS25A.GEO={}; FXS25A.lost=false; return true; };;
  /* one mesh and atlas per kind: "4", "6" ... "10", and "10t" for the tens die of a d100 (00 to 90) */
  FXS25A.geo=function geo(kind){ if(FXS25A.GEO[kind]) return FXS25A.GEO[kind]; let T1=performance.now(), t=kind==="10t"?10:+kind, S=FXS25A.solid(t), lab=null, T2=performance.now();
    if(t===4){ S.vv=S.V.map((v,i) =>{ return i+1; }); }/* the number at a corner is the value of that corner on every face */
    if(t===10){ lab={}; for(let i=1;i<=10;i++) lab[i]=kind==="10t"?(i===10?"00":String(i*10)):(i===10?"0":String(i)); }
    const A=FXS25A.atlas(S,lab), T3=performance.now(), data=[]; S.F.forEach((f) =>{ for(let e=1;e+1<f.v.length;e++){ [0,e,e+1].forEach((k) =>{ const p=S.V[f.v[k]], uv=f.uv[k]; data.push(p[0],p[1],p[2],f.n[0],f.n[1],f.n[2],uv[0],uv[1]); }); } });
    const b=FXS25A.gl.createBuffer(); FXS25A.gl.bindBuffer(FXS25A.gl.ARRAY_BUFFER,b); FXS25A.gl.bufferData(FXS25A.gl.ARRAY_BUFFER,new Float32Array(data),FXS25A.gl.STATIC_DRAW);
    const tx=FXS25A.gl.createTexture(); FXS25A.gl.bindTexture(FXS25A.gl.TEXTURE_2D,tx); FXS25A.gl.pixelStorei(FXS25A.gl.UNPACK_FLIP_Y_WEBGL,false); FXS25A.gl.texImage2D(FXS25A.gl.TEXTURE_2D,0,FXS25A.gl.RGBA,FXS25A.gl.RGBA,FXS25A.gl.UNSIGNED_BYTE,A);
    FXS25A.gl.texParameteri(FXS25A.gl.TEXTURE_2D,FXS25A.gl.TEXTURE_MIN_FILTER,FXS25A.gl.LINEAR); FXS25A.gl.texParameteri(FXS25A.gl.TEXTURE_2D,FXS25A.gl.TEXTURE_MAG_FILTER,FXS25A.gl.LINEAR); FXS25A.gl.texParameteri(FXS25A.gl.TEXTURE_2D,FXS25A.gl.TEXTURE_WRAP_S,FXS25A.gl.CLAMP_TO_EDGE); FXS25A.gl.texParameteri(FXS25A.gl.TEXTURE_2D,FXS25A.gl.TEXTURE_WRAP_T,FXS25A.gl.CLAMP_TO_EDGE);
    (FXS25A.stats.geo=FXS25A.stats.geo||{})[kind]=[Math.round(T2-T1),Math.round(T3-T2),Math.round(performance.now()-T3)]; FXS25A.GEO[kind]={S:S,b:b,n:data.length/8,tx:tx}; return FXS25A.GEO[kind]; };;
  /* ---------- matrices ---------- */
  FXS25A.persp=function persp(fov,asp,n,f){ const t=1/Math.tan(fov/2); return [t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]; };;
  FXS25A.look=function look(e,c,u){ const z=FXS25A.nrm(FXS25A.sub(e,c)), x=FXS25A.nrm(FXS25A.cross(u,z)), y=FXS25A.cross(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -FXS25A.dot(x,e),-FXS25A.dot(y,e),-FXS25A.dot(z,e),1]; };
})();
(function(){
  ;
  FXS25A.mm=function mm(a,b){ const o=new Array(16); for(let i=0;i<4;i++) for(let j=0;j<4;j++){ let s=0; for(let k=0;k<4;k++) s+=a[k*4+j]*b[i*4+k]; o[i*4+j]=s; } return o; };;
  FXS25A.model=function model(pos,q,s){ const x=q[0],y=q[1],z=q[2],w=q[3]; return [(1-2*(y*y+z*z))*s,2*(x*y+z*w)*s,2*(x*z-y*w)*s,0, 2*(x*y-z*w)*s,(1-2*(x*x+z*z))*s,2*(y*z+x*w)*s,0, 2*(x*z+y*w)*s,2*(y*z-x*w)*s,(1-2*(x*x+y*y))*s,0, pos[0],pos[1],pos[2],1]; };;
  FXS25A.hex=function hex(h){ const n=parseInt(h.slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; };;
  /* ---------- values ---------- */
  FXS25A.rnd=function rnd(n){ const c=FXENV.crypto, a=new Uint32Array(1), lim=4294967296-(4294967296%n); for(let g=0;g<64;g++){ if(c&&c.getRandomValues) c.getRandomValues(a); else a[0]=Math.floor(Math.random()*4294967296); if(a[0]<lim) return 1+a[0]%n; } return 1+a[0]%n; };;
  FXS25A.acc=function acc(){ const v=getComputedStyle(FXS25A.D.documentElement).getPropertyValue("--dice").trim(); return /^#[0-9a-f]{6}$/i.test(v)?v:"#a3182b"; };;
  FXS25A.weak=function weak(){ return (navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2; };;
  /* ---------- the throw: a small rigid-body simulation on the CPU, nothing more for the GPU ----------
     The idea of the grass video: keep the look, drop the expensive machine. Each die is a point mass with a spin. The table is a plane
     tested against the die's corners only (no mesh collider), dice meet each other as spheres (one radius, no mesh against mesh), and the
     screen edges are four walls. Impulses at the touching corner make it bounce, tumble and slide with friction, like a real die.
     The whole throw is computed before it is shown (120 steps a second, a few ms for 24 dice), so the face that lands on top is known
     in advance. The value was decided first (crypto or given): the die is drawn turned by one of its own symmetries, a turn that maps the
     solid onto itself, so the shape and the motion stay exactly the same and only the numbers move: the landed face shows the value. */
  FXS25A.nq=function nq(q){ const l=Math.sqrt(q[0]*q[0]+q[1]*q[1]+q[2]*q[2]+q[3]*q[3])||1; return [q[0]/l,q[1]/l,q[2]/l,q[3]/l]; };;
  /* a turn of the solid onto itself that takes direction a (a face normal, or a d4 corner) to direction b */
  FXS25A.sym=function sym(S,a,b){ const r0=FXS25A.qfromto(a,b), P=S.V.map((v) =>{ return FXS25A.qrot(r0,v); }), pr=function(p){ return FXS25A.sub(p,FXS25A.mul(b,FXS25A.dot(p,b))); };
    let ref=null; for(let i=0;i<P.length;i++){ if(FXS25A.len(pr(P[i]))>1e-3){ ref=pr(P[i]); break; } } if(!ref) return r0;
    for(let j=0;j<S.V.length;j++){ const w=pr(S.V[j]); if(Math.abs(FXS25A.len(w)-FXS25A.len(ref))>1e-3) continue; var be=Math.atan2(FXS25A.dot(FXS25A.cross(ref,w),b),FXS25A.dot(ref,w)), q=FXS25A.qmul(FXS25A.qax(b,be),r0);
      if(S.V.every((v) =>{ const x=FXS25A.qrot(q,v); return S.V.some((u) =>{ return FXS25A.len(FXS25A.sub(x,u))<1e-3; }); })) return q; }
    return null; };
})();
(function(){
  ;
  FXS25A.topIdx=function topIdx(S,q){ let best=-9, k=-1, L=S.t===4?S.V:S.F.map((f) =>{ return f.n; }); L.forEach((v,i) =>{ const y=FXS25A.qrot(q,v)[1]; if(y>best){ best=y; k=i; } }); return k; };;
  FXS25A.shown=function shown(S,q){ const k=FXS25A.topIdx(S,q); return S.t===4?k+1:S.F[k].val; };;
  /* items: {S, s scale, v value, p, vel, w spin, delN}. box: walls {x0,x1,z0,z1}. Fills it.P (positions) and it.Q (turns), sets it.g */
  FXS25A.SIMK={dt:1/120,G:-58,E:0.34,MU:0.42,maxN:300};
  function simHit(it,r,J,Iinv){ it.vel=FXS25A.addv(it.vel,J); it.w=FXS25A.addv(it.w,FXS25A.mul(FXS25A.cross(r,J),Iinv)); }
  FXS25A.simMove=function simMove(it){ it.vel[1]+=FXS25A.SIMK.G*FXS25A.SIMK.dt; it.p=FXS25A.addv(it.p,FXS25A.mul(it.vel,FXS25A.SIMK.dt)); const ang=FXS25A.len(it.w)*FXS25A.SIMK.dt; if(ang>1e-9) it.q=FXS25A.nq(FXS25A.qmul(FXS25A.qax(it.w,ang),it.q)); };;
  FXS25A.simGround=function simGround(it){ const s=it.s, Iinv=1/(0.4*s*s); let touch=false;
    for(let pass=0;pass<3;pass++){ var low=9, lr=null; it.S.V.forEach((v) =>{ const r=FXS25A.mul(FXS25A.qrot(it.q,v),s), y=it.p[1]+r[1]; if(y<low){ low=y; lr=r; } }); if(low>=0) break;
      touch=true; it.p[1]-=low; let vc=FXS25A.addv(it.vel,FXS25A.cross(it.w,lr)), vn=vc[1]; if(vn>=0) continue;
      const rn=FXS25A.cross(lr,[0,1,0]), j=-(1+FXS25A.SIMK.E)*vn/(1+FXS25A.dot(rn,rn)*Iinv); simHit(it,lr,[0,j,0],Iinv);
      vc=FXS25A.addv(it.vel,FXS25A.cross(it.w,lr)); const vt=[vc[0],0,vc[2]], lt=FXS25A.len(vt); if(lt>1e-6){ const t=FXS25A.mul(vt,1/lt), rt=FXS25A.cross(lr,t), jt=Math.min(FXS25A.SIMK.MU*j,lt/(1+FXS25A.dot(rt,rt)*Iinv)); simHit(it,lr,FXS25A.mul(t,-jt),Iinv); } }
    return touch; };;
  FXS25A.simWallX=function simWallX(it,box){ const m=0.85*it.s; if(it.p[0]<box.x0+m){ it.p[0]=box.x0+m; if(it.vel[0]<0){ it.vel[0]*=-0.5; it.w=FXS25A.mul(it.w,0.7); } } if(it.p[0]>box.x1-m){ it.p[0]=box.x1-m; if(it.vel[0]>0){ it.vel[0]*=-0.5; it.w=FXS25A.mul(it.w,0.7); } } };;
  FXS25A.simWallZ=function simWallZ(it,box){ const m=0.85*it.s; if(it.p[2]<box.z0+m){ it.p[2]=box.z0+m; if(it.vel[2]<0){ it.vel[2]*=-0.5; it.w=FXS25A.mul(it.w,0.7); } } if(it.p[2]<box.z1-m) it.inBox=true; if(it.inBox&&it.p[2]>box.z1-m){ it.p[2]=box.z1-m; if(it.vel[2]>0){ it.vel[2]*=-0.5; it.w=FXS25A.mul(it.w,0.7); } } };
})();
(function(){
  ;
  /* one die for one step: true while it is still moving (or waiting for its turn) */
  FXS25A.simStep=function simStep(it,n,box){ if(it.done||n<it.delN) return !it.done; const touch=simMoveGround(it);
    if(touch){ it.w=FXS25A.mul(it.w,0.962); it.vel[0]*=0.985; it.vel[2]*=0.985; }/* rolling resistance: felt on a tray, round dice stop sooner */
    FXS25A.simWallX(it,box); FXS25A.simWallZ(it,box);
    if(touch&&FXS25A.len(it.vel)<0.45*it.s&&FXS25A.len(it.w)<1.2) it.rest++; else it.rest=0; return true; };;
  function simMoveGround(it){ FXS25A.simMove(it); return FXS25A.simGround(it); }
  /* dice against dice: two spheres. Push apart, swap the speed along the line between them, a little spin from the knock */
  FXS25A.simPair=function simPair(A,B,n){ if(A.done&&B.done||n<A.delN||n<B.delN) return;
    const d=FXS25A.sub(B.p,A.p), dl=FXS25A.len(d), RR=(A.s+B.s)*0.8; if(dl>=RR||dl<1e-6) return; const nn=FXS25A.mul(d,1/dl), ps=(RR-dl)/2;
    if(!A.done) A.p=FXS25A.sub(A.p,FXS25A.mul(nn,ps)); if(!B.done) B.p=FXS25A.addv(B.p,FXS25A.mul(nn,ps)); const rel=FXS25A.dot(FXS25A.sub(B.vel,A.vel),nn); if(rel<0){ const jj=-1.45*rel/2;
      if(!A.done){ A.vel=FXS25A.sub(A.vel,FXS25A.mul(nn,jj)); A.w=FXS25A.addv(A.w,FXS25A.mul(FXS25A.cross([0,1,0],nn),-jj*0.6)); } if(!B.done){ B.vel=FXS25A.addv(B.vel,FXS25A.mul(nn,jj)); B.w=FXS25A.addv(B.w,FXS25A.mul(FXS25A.cross([0,1,0],nn),jj*0.6)); } } };
})();
(function(){
  ;
  function simLie(it){ /* at rest: lie flat on the face that points down (a few degrees at most), in a few steps */
    let dn=null, lo=9; it.S.F.forEach((f) =>{ const y=FXS25A.qrot(it.q,f.n)[1]; if(y<lo){ lo=y; dn=FXS25A.qrot(it.q,f.n); } });
    const qf=FXS25A.nq(FXS25A.qmul(FXS25A.qfromto(dn,[0,-1,0]),it.q)); for(let z=1;z<=8;z++){ var u=z/8, q=FXS25A.nq([it.q[0]+(qf[0]-it.q[0])*u,it.q[1]+(qf[1]-it.q[1])*u,it.q[2]+(qf[2]-it.q[2])*u,it.q[3]+(qf[3]-it.q[3])*u]);
      var low=9; it.S.V.forEach((v) =>{ const y=FXS25A.qrot(q,v)[1]*it.s; if(y<low) low=y; }); const p=it.p.slice(); p[1]=-low; it.P.push(p); it.Q.push(q); }
    it.q=qf; it.done=true; }
  function simSave(it,n){ if(it.done||n<it.delN) return; it.P.push(it.p.slice()); it.Q.push(it.q.slice());
    if(it.rest>10||n===FXS25A.SIMK.maxN-1) simLie(it); }
  function simFace(it){ const S=it.S, k=FXS25A.topIdx(S,it.q), want=S.t===4?it.v-1:S.F.map((f) =>{ return f.val; }).indexOf(it.v);
    const a=S.t===4?S.V[want]:S.F[want].n, b=S.t===4?S.V[k]:S.F[k].n; it.g=FXS25A.sym(S,a,b)||[0,0,0,1]; }
  FXS25A.simulate=function simulate(items,box){ let n, alive;
    items.forEach((it) =>{ it.P=[]; it.Q=[]; it.rest=0; it.done=false; it.inBox=false; });
    for(n=0;n<FXS25A.SIMK.maxN;n++){ alive=false;
      items.forEach((it) =>{ if(FXS25A.simStep(it,n,box)) alive=true; });
      for(let i=0;i<items.length;i++) for(let k=i+1;k<items.length;k++) FXS25A.simPair(items[i],items[k],n);
      items.forEach((it) =>{ simSave(it,n); });
      if(!alive) break; }
    items.forEach((it) =>{ simFace(it); }); };;
  FXS25A.start=function start(it,i,n,box,R){ const s=it.s, W=box.x1-box.x0, x=box.x0+W*(0.15+0.7*((i%6)+0.5)/Math.min(6,n))+(R()-0.5)*1.5;
    it.p=[x,2.2+R()*1.8,box.z1+1.5*s+R()*1.5+Math.floor(i/6)*1.6]; it.vel=[(R()-0.5)*7-x*0.35,1.5+R()*3,-(15+R()*5)];
    it.q=FXS25A.nq([R()-0.5,R()-0.5,R()-0.5,R()-0.5]); it.w=FXS25A.mul(FXS25A.nrm([R()-0.5,R()-0.5,R()-0.5]),14+R()*10); it.delN=Math.min(30,i*3); };
})();
(function(){
  ;
  /* ---------- one throw ---------- */
  FXS25A.throwItems=function throwItems(list,given){
    const items=[], vals=[]; list.forEach((f,i) =>{ f=+f; const g=given&&given[i], v=(g>=1&&g<=f&&g===Math.floor(g))?g:FXS25A.rnd(f); vals.push(v);
      if(f===100){ let tens=v===100?10:(Math.floor(v/10)||10), ones=v%10||10; if(v%10===0&&v!==100) tens=v/10; items.push({k:"10t",v:tens},{k:"10",v:ones}); }
      else if(f===4||f===6||f===8||f===10||f===12||f===20) items.push({k:String(f),v:v}); });
    return {items:items,vals:vals}; };;
  FXS25A.dicePose=function dicePose(it,f){ if(f<it.delN||!it.P.length) return null; const k=Math.min(it.P.length-1,f-it.delN), p=it.P[k]; return {p:p,q:FXS25A.qmul(it.Q[k],it.g),y:p[1]}; };
})();
(function(){
  ;
  function throwDice(list,given){ const W=innerWidth, H=innerHeight, dpr=Math.min(FXENV.devicePixelRatio||1,FXS25A.weak()?1.5:2);
    if(FXS25A.cv.width!==Math.round(W*dpr)||FXS25A.cv.height!==Math.round(H*dpr)){ FXS25A.cv.width=Math.round(W*dpr); FXS25A.cv.height=Math.round(H*dpr); }
    const ti=FXS25A.throwItems(list,given), items=ti.items, vals=ti.vals;
    if(!items.length) return Promise.resolve(vals);
    /* the table in world units: about 34 px per unit on a phone, a die is 2 units across. The result card (top) and the tab bar (bottom) stay clear */
    const fov=0.62, pxu=Math.max(24,Math.min(40,Math.min(W,H)/11)), n=items.length, sc=n>12?0.74:n>6?0.86:1, Ww=W/pxu, Hw=H/pxu, tSet=performance.now(), R=Math.random;
    const dist=(Hw/2)/Math.tan(fov/2), eye=[0,dist,dist*0.30], VP=FXS25A.mm(FXS25A.persp(fov,W/H,dist*0.3,dist*3),FXS25A.look(eye,[0,0,0],[0,0,-1]));
    const box={x0:-Ww/2+0.3,x1:Ww/2-0.3,z0:-Hw/2+Math.min(240,H*0.3)/pxu,z1:Hw/2-80/pxu};
    items.forEach((it,i) =>{ it.G=FXS25A.geo(it.k); it.S=it.G.S; it.s=sc; FXS25A.start(it,i,n,box,R); });
    FXS25A.simulate(items,box); FXS25A.stats.sim=Math.round(performance.now()-tSet);
    let col=FXS25A.hex(FXS25A.acc()), ink=[0.98,0.94,0.86], T0=0, last=0; items.forEach((it) =>{ last=Math.max(last,it.P.length+it.delN); });
    function frame(now){ const t0=performance.now(), f=Math.floor((now-T0)*0.12), done=f>=last; FXS25A.gl.viewport(0,0,FXS25A.cv.width,FXS25A.cv.height); FXS25A.gl.clearColor(0,0,0,0); FXS25A.gl.clear(FXS25A.gl.COLOR_BUFFER_BIT|FXS25A.gl.DEPTH_BUFFER_BIT);
      const poses=items.map((it) =>{ return FXS25A.dicePose(it,f); });
      /* shadows first, without depth writes */
      FXS25A.gl.disable(FXS25A.gl.DEPTH_TEST); FXS25A.gl.enable(FXS25A.gl.BLEND); FXS25A.gl.blendFunc(FXS25A.gl.ONE,FXS25A.gl.ONE_MINUS_SRC_ALPHA); FXS25A.gl.useProgram(FXS25A.PS.p); FXS25A.gl.bindBuffer(FXS25A.gl.ARRAY_BUFFER,FXS25A.BUF); FXS25A.gl.enableVertexAttribArray(0); FXS25A.gl.vertexAttribPointer(0,2,FXS25A.gl.FLOAT,false,8,0); FXS25A.gl.disableVertexAttribArray(1); FXS25A.gl.disableVertexAttribArray(2);
      FXS25A.gl.uniformMatrix4fv(FXS25A.PS.u.VP,false,VP); poses.forEach((o,i) =>{ if(!o) return; const it=items[i]; FXS25A.gl.uniform3f(FXS25A.PS.u.c,o.p[0]+o.y*0.18,0,o.p[2]+o.y*0.12); FXS25A.gl.uniform1f(FXS25A.PS.u.r,1.25*it.s*(1+o.y*0.12)); FXS25A.gl.uniform1f(FXS25A.PS.u.a,0.42/(1+o.y*0.35)); FXS25A.gl.drawArrays(FXS25A.gl.TRIANGLE_STRIP,0,4); });
      FXS25A.gl.disable(FXS25A.gl.BLEND); FXS25A.gl.enable(FXS25A.gl.DEPTH_TEST); FXS25A.gl.enable(FXS25A.gl.CULL_FACE); FXS25A.gl.cullFace(FXS25A.gl.BACK); FXS25A.gl.frontFace(FXS25A.gl.CCW); FXS25A.gl.useProgram(FXS25A.P.p); FXS25A.gl.uniformMatrix4fv(FXS25A.P.u.VP,false,VP); FXS25A.gl.uniform3fv(FXS25A.P.u.col,col); FXS25A.gl.uniform3fv(FXS25A.P.u.ink,ink); FXS25A.gl.uniform3fv(FXS25A.P.u.eye,eye); FXS25A.gl.uniform1i(FXS25A.P.u.tx,0);
      poses.forEach((o,i) =>{ if(!o) return; const it=items[i]; FXS25A.gl.bindBuffer(FXS25A.gl.ARRAY_BUFFER,it.G.b); FXS25A.gl.enableVertexAttribArray(0); FXS25A.gl.enableVertexAttribArray(1); FXS25A.gl.enableVertexAttribArray(2); FXS25A.gl.vertexAttribPointer(0,3,FXS25A.gl.FLOAT,false,32,0); FXS25A.gl.vertexAttribPointer(1,3,FXS25A.gl.FLOAT,false,32,12); FXS25A.gl.vertexAttribPointer(2,2,FXS25A.gl.FLOAT,false,32,24);
        FXS25A.gl.activeTexture(FXS25A.gl.TEXTURE0); FXS25A.gl.bindTexture(FXS25A.gl.TEXTURE_2D,it.G.tx); FXS25A.gl.uniformMatrix4fv(FXS25A.P.u.M,false,FXS25A.model(o.p,o.q,it.s)); FXS25A.gl.drawArrays(FXS25A.gl.TRIANGLES,0,it.G.n); });
      FXS25A.stats.frames++; FXS25A.stats.ms+=performance.now()-t0; return done; }
    FXS25A.stats.setup=Math.round(performance.now()-tSet); T0=performance.now();/* the clock starts after the meshes and atlases are ready */
    return new Promise((ok) =>{ (function loop(now){ if(FXS25A.lost){ ok(null); return; } const d=frame(now||performance.now()); if(d){ ok(vals); return; } requestAnimationFrame(loop); })(performance.now()); }); }
  /* the numbers use the app's own Archivo (embedded): wait for it once, at most 600 ms, so the atlas never draws with a fallback */
  let FONT=null; FXS25A.font=function font(){ if(FONT) return FONT; const f=FXS25A.D.fonts&&FXS25A.D.fonts.load?FXS25A.D.fonts.load("700 64px Archivo").catch(() =>{}):null; FONT=f?Promise.race([f,new Promise((r) =>{ setTimeout(r,600); })]):Promise.resolve(); return FONT; };;
  FXS25A.run=function run(list,given){ if(!FXS25A.init()) return Promise.resolve(null); clearTimeout(FXS25A.hideT); FXS25A.tray.classList.add("on"); FXS25A.stats.rolls++;
    return FXS25A.font().then(() =>{ return throwDice(list,given); }).then((v) =>{ FXS25A.hideT=setTimeout(() =>{ FXS25A.tray.classList.remove("on"); },1800); return v; },() =>{ FXS25A.tray.classList.remove("on"); return null; }); };
})();
(function(){
  ;
  FXENV.__dice3d={ roll:function(list,given){ const p=FXS25A.queue.then(() =>{ try{ return FXS25A.run(list,given); }catch(e){ if(FXS25A.tray) FXS25A.tray.classList.remove("on"); return null; } }); FXS25A.queue=p.catch(() =>{}); return p; },
    preload:function(){ return FXS25A.font().then(() =>{ return FXS25A.init(); }); }, state:function(){ return {loaded:!!FXS25A.gl,loading:false,engine:"lite"}; }, stats:function(){ return FXS25A.stats; },
    /* for tests: the face each die shows, read back from its final turn (the face whose normal points up, or the corner on top of a d4) */
    /* for tests: one die thrown in an empty tray without drawing; answers the value its top face shows and how flat it lies */
    simTop:function(kind,val){ const S=FXS25A.solid(+kind), it={S:S,s:1,v:val}, box={x0:-6,x1:6,z0:-10,z1:10}; FXS25A.start(it,0,1,box,Math.random); FXS25A.simulate([it],box);
      let q=FXS25A.qmul(it.q,it.g), lo=9; S.F.forEach((f) =>{ const y=FXS25A.qrot(q,f.n)[1]; if(y<lo) lo=y; }); return {v:FXS25A.shown(S,q),flat:Math.round(Math.acos(Math.min(1,-lo))*1800/Math.PI)/10,steps:it.P.length}; },
    simPath:function(kinds){ const box={x0:-7,x1:7,z0:-9,z1:12}, L=kinds.map((k,i) =>{ const it={S:FXS25A.solid(+k),s:kinds.length>6?0.86:1,v:1}; FXS25A.start(it,i,kinds.length,box,Math.random); return it; }); FXS25A.simulate(L,box); return L.map((it) =>{ return {d:it.delN,P:it.P,Q:it.Q}; }); },
    faces:function(kind){ const S=FXS25A.solid(+kind); return S.F.map((f) =>{ return f.val; }); } };
})();
