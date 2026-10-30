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
(function(){
  var D=document, tray=null, cv=null, gl=null, P=null, PS=null, BUF=null, GEO={}, queue=Promise.resolve(), hideT=0, lost=false, stats={rolls:0,frames:0,ms:0};
  var PHI=(1+Math.sqrt(5))/2;
  /* ---------- vectors and quaternions ---------- */
  function sub(a,b){ return [a[0]-b[0],a[1]-b[1],a[2]-b[2]]; } function addv(a,b){ return [a[0]+b[0],a[1]+b[1],a[2]+b[2]]; } function mul(a,s){ return [a[0]*s,a[1]*s,a[2]*s]; }
  function dot(a,b){ return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; } function cross(a,b){ return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]]; }
  function len(a){ return Math.sqrt(dot(a,a)); } function nrm(a){ var l=len(a)||1; return [a[0]/l,a[1]/l,a[2]/l]; }
  function qax(ax,an){ ax=nrm(ax); var s=Math.sin(an/2); return [ax[0]*s,ax[1]*s,ax[2]*s,Math.cos(an/2)]; }
  function qmul(a,b){ return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]]; }
  function qrot(q,v){ var p=qmul(qmul(q,[v[0],v[1],v[2],0]),[-q[0],-q[1],-q[2],q[3]]); return [p[0],p[1],p[2]]; }
  function qfromto(a,b){ a=nrm(a); b=nrm(b); var d=dot(a,b); if(d>0.999999) return [0,0,0,1]; if(d<-0.999999){ var o=Math.abs(a[0])<0.9?[1,0,0]:[0,1,0]; return qax(cross(a,o),Math.PI); } return qax(cross(a,b),Math.acos(Math.max(-1,Math.min(1,d)))); }
  /* ---------- the solids ---------- */
  /* convex hull of a few points: every plane through three points with all points on one side is a face, its points ordered
     counter-clockwise seen from outside */
  function hull(V){ var F=[], seen={}, n=V.length;
    for(var i=0;i<n;i++) for(var j=i+1;j<n;j++) for(var k=j+1;k<n;k++){ var nn=cross(sub(V[j],V[i]),sub(V[k],V[i])); if(len(nn)<1e-9) continue; nn=nrm(nn); var d=dot(nn,V[i]), pos=0, neg=0, on=[];
      for(var m=0;m<n;m++){ var s=dot(nn,V[m])-d; if(s>1e-6) pos++; else if(s<-1e-6) neg++; else on.push(m); } if(pos&&neg) continue; if(pos){ nn=mul(nn,-1); }
      var key=on.join(","); if(seen[key]) continue; seen[key]=1; var c=[0,0,0]; on.forEach(function(q){ c=addv(c,V[q]); }); c=mul(c,1/on.length);
      var ax=nrm(sub(V[on[0]],c)), bx=cross(nn,ax); on.sort(function(p,q){ var a=sub(V[p],c), b=sub(V[q],c); return Math.atan2(dot(a,bx),dot(a,ax))-Math.atan2(dot(b,bx),dot(b,ax)); });
      F.push({v:on,n:nn,c:c}); }
    return F; }
  function points(t){ var V=[], i, a;
    if(t===4) V=[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
    else if(t===6){ for(i=0;i<8;i++) V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1]); }
    else if(t===8) V=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    else if(t===20){ [-1,1].forEach(function(s){ [-1,1].forEach(function(r){ V.push([0,s,r*PHI],[s,r*PHI,0],[r*PHI,0,s]); }); }); }
    else if(t===12){ for(i=0;i<8;i++) V.push([i&1?1:-1,i&2?1:-1,i&4?1:-1]); [-1,1].forEach(function(s){ [-1,1].forEach(function(r){ V.push([0,s/PHI,r*PHI],[s/PHI,r*PHI,0],[r*PHI,0,s/PHI]); }); }); }
    else if(t===10){ /* pentagonal trapezohedron: two rings of five, apex height solved so each kite is flat */
      var z=0.105, U=function(k){ a=2*Math.PI*k/5; return [Math.cos(a),z,Math.sin(a)]; }, L=function(k){ a=2*Math.PI*k/5+Math.PI/5; return [Math.cos(a),-z,Math.sin(a)]; };
      var det=function(h){ var T=[0,h,0]; return dot(cross(sub(U(0),T),sub(U(1),T)),sub(L(0),T)); }, d0=det(0), d1=det(1), h=-d0/(d1-d0);
      V.push([0,h,0],[0,-h,0]); for(i=0;i<5;i++) V.push(U(i),L(i)); }
    var R=0; V.forEach(function(p){ R=Math.max(R,len(p)); }); return V.map(function(p){ return mul(p,1/R); }); }
  /* faces, values (opposite faces add up to n+1), the direction a number reads upright, and the sizes the throw needs */
  function solid(t){ var V=points(t), F=hull(V), ord=F.map(function(f,i){ return i; }), N=F.length;
    ord.sort(function(a,b){ var A=F[a].n, B=F[b].n; return (B[1]-A[1])||(Math.atan2(A[2],A[0])-Math.atan2(B[2],B[0])); });
    var used={}, low=1; ord.forEach(function(i){ if(used[i]) return; var j=-1, best=2; F.forEach(function(g,k){ var dd=dot(F[i].n,g.n); if(k!==i&&!used[k]&&dd<best){ best=dd; j=k; } });
      F[i].val=low; used[i]=1; if(j>=0&&t!==4){ F[j].val=N+1-low; used[j]=1; } low++; });
    F.forEach(function(f){ var up;
      if(t===10){ var ap=f.v.reduce(function(a,q){ return Math.abs(V[q][1])>Math.abs(V[a][1])?q:a; },f.v[0]); up=sub(V[ap],f.c); }
      else if(f.v.length===4) up=sub(mul(addv(V[f.v[0]],V[f.v[1]]),0.5),f.c);
      else up=sub(V[f.v[0]],f.c);
      up=nrm(sub(up,mul(f.n,dot(up,f.n)))); f.up=up; f.rt=cross(up,f.n); f.d=dot(f.n,f.c); });
    var rin=F[0].d; return {t:t,V:V,F:F,rin:rin}; }
  /* ---------- the number atlas: red = number, green = near an edge (the bevel catches the light) ---------- */
  function atlas(S,labels){ var F=S.F, cols=Math.ceil(Math.sqrt(F.length)), px=Math.max(96,Math.min(192,Math.floor(1024/cols))), W=cols*px;
    /* one canvas, added light: numbers in red, edges in green, so no pixel read back is needed (getImageData took seconds on a first use) */
    var a=D.createElement("canvas"); a.width=a.height=W; var x=a.getContext("2d"), y=x; x.fillStyle="#000"; x.fillRect(0,0,W,W); x.globalCompositeOperation="lighter";
    var R=0; F.forEach(function(f){ f.v.forEach(function(q){ R=Math.max(R,len(sub(S.V[q],f.c))); }); });
    F.forEach(function(f,i){ var cx=(i%cols)*px+px/2, cy=Math.floor(i/cols)*px+px/2, k=0.47*px/R;
      var P2=f.v.map(function(q){ var p=sub(S.V[q],f.c); return [cx+dot(p,f.rt)*k, cy-dot(p,f.up)*k]; }); f.uv=P2.map(function(p){ return [p[0]/W,p[1]/W]; });
      /* inner distance to the edges, for the number size */
      var inr=1e9; for(var e=0;e<P2.length;e++){ var p=P2[e], q=P2[(e+1)%P2.length], ex=q[0]-p[0], ey=q[1]-p[1], l=Math.hypot(ex,ey); inr=Math.min(inr,Math.abs((cx-p[0])*ey-(cy-p[1])*ex)/l); }
      y.save(); y.beginPath(); P2.forEach(function(p,e){ if(e) y.lineTo(p[0],p[1]); else y.moveTo(p[0],p[1]); }); y.closePath(); y.clip(); for(var g=4;g>=1;g--){ y.strokeStyle="rgba(0,255,0,"+(0.22*(5-g)/4).toFixed(3)+")"; y.lineWidth=px/40*g*1.6; y.stroke(); } y.restore();/* soft bevel from four strokes (a canvas blur filter took seconds on slow phones) */
      x.fillStyle="#f00"; x.textAlign="center"; x.textBaseline="middle";
      if(S.t===4){ f.v.forEach(function(q,e){ var p=P2[e], dx=p[0]-cx, dy=p[1]-cy, l=Math.hypot(dx,dy); x.save(); x.translate(cx+dx*0.5,cy+dy*0.5); x.rotate(Math.atan2(dx,-dy)); x.font="700 "+Math.round(inr*0.95)+"px Archivo, 'Helvetica Neue', Arial, sans-serif"; x.fillText(String(S.vv[q]),0,0); x.restore(); }); return; }
      var s=String(labels?labels[f.val]:f.val), fs=inr*(s.length>1?(S.t===10?0.82:1.0):1.25)*(S.t===10?0.9:1); x.save(); x.translate(cx,cy+(S.t===10?inr*0.18:0)); x.font="700 "+Math.round(fs)+"px Archivo, 'Helvetica Neue', Arial, sans-serif"; x.fillText(s,0,fs*0.04);
      if(s==="6"||s==="9"){ x.fillRect(-fs*0.22,fs*0.42,fs*0.44,Math.max(2,fs*0.07)); } x.restore(); });
    return a; }
  /* ---------- WebGL ---------- */
  var VS="attribute vec3 p;attribute vec3 n;attribute vec2 t;uniform mat4 M;uniform mat4 VP;varying vec3 vn;varying vec3 vw;varying vec2 vt;void main(){vec4 w=M*vec4(p,1.);vw=w.xyz;vn=(M*vec4(n,0.)).xyz;vt=t;gl_Position=VP*w;}";
  var FS="precision mediump float;uniform sampler2D tx;uniform vec3 col;uniform vec3 ink;uniform vec3 eye;varying vec3 vn;varying vec3 vw;varying vec2 vt;"+
    "void main(){vec4 s=texture2D(tx,vt);vec3 N=normalize(vn);vec3 V=normalize(eye-vw);vec3 L1=normalize(vec3(-.75,.62,-.55));vec3 L2=normalize(vec3(.6,.5,.7));"+
    "float d1=max(dot(N,L1),0.);float d2=max(dot(N,L2),0.);vec3 base=mix(col,ink,s.r);"+
    "float sp=pow(max(dot(N,normalize(L1+V)),0.),70.)*.9+pow(max(dot(N,normalize(L2+V)),0.),30.)*.18;float fr=pow(1.-max(dot(N,V),0.),3.);"+
    "vec3 c=base*(.34+.72*d1+.22*d2)+vec3(1.)*sp*(1.-s.r*.5)+col*fr*.35+vec3(.85,.9,1.)*fr*.16+vec3(1.,.95,.9)*s.g*.16*(.4+d1);gl_FragColor=vec4(c,1.);}";
  var VSS="attribute vec2 q;uniform mat4 VP;uniform vec3 c;uniform float r;varying vec2 vq;void main(){vq=q;gl_Position=VP*vec4(c.x+q.x*r,.002,c.z+q.y*r,1.);}";
  var FSS="precision mediump float;uniform float a;varying vec2 vq;void main(){float d=length(vq);gl_FragColor=vec4(0.,0.,0.,a*(1.-smoothstep(.2,1.,d)));}";
  function sh(type,src){ var s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function prog(v,f,attrs){ var p=gl.createProgram(); gl.attachShader(p,sh(gl.VERTEX_SHADER,v)); gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f)); attrs.forEach(function(a,i){ gl.bindAttribLocation(p,i,a); }); gl.linkProgram(p); if(!gl.getProgramParameter(p,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p)); var u={}, n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS); for(var i=0;i<n;i++){ var k=gl.getActiveUniform(p,i).name; u[k]=gl.getUniformLocation(p,k); } return {p:p,u:u}; }
  function init(){ if(gl&&!lost) return true; if(!tray){ tray=D.createElement("div"); tray.id="diceTray"; tray.setAttribute("aria-hidden","true"); D.body.appendChild(tray); }
    if(!cv){ cv=D.createElement("canvas"); tray.appendChild(cv); cv.addEventListener("webglcontextlost",function(e){ e.preventDefault(); lost=true; }); cv.addEventListener("webglcontextrestored",function(){ lost=false; gl=null; GEO={}; init(); }); }
    try{ gl=cv.getContext("webgl",{alpha:true,antialias:true,premultipliedAlpha:true,preserveDrawingBuffer:true})||cv.getContext("experimental-webgl"); }catch(e){ gl=null; } if(!gl) return false;
    try{ P=prog(VS,FS,["p","n","t"]); PS=prog(VSS,FSS,["q"]); }catch(e){ gl=null; return false; }
    BUF=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,BUF); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW); GEO={}; lost=false; return true; }
  /* one mesh and atlas per kind: "4", "6" ... "10", and "10t" for the tens die of a d100 (00 to 90) */
  function geo(kind){ if(GEO[kind]) return GEO[kind]; var T1=performance.now(), t=kind==="10t"?10:+kind, S=solid(t), lab=null, T2=performance.now();
    if(t===4){ S.vv=S.V.map(function(v,i){ return i+1; }); }/* the number at a corner is the value of that corner on every face */
    if(t===10){ lab={}; for(var i=1;i<=10;i++) lab[i]=kind==="10t"?(i===10?"00":String(i*10)):(i===10?"0":String(i)); }
    var A=atlas(S,lab), T3=performance.now(), data=[]; S.F.forEach(function(f){ for(var e=1;e+1<f.v.length;e++){ [0,e,e+1].forEach(function(k){ var p=S.V[f.v[k]], uv=f.uv[k]; data.push(p[0],p[1],p[2],f.n[0],f.n[1],f.n[2],uv[0],uv[1]); }); } });
    var b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    var tx=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,tx); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,A);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    (stats.geo=stats.geo||{})[kind]=[Math.round(T2-T1),Math.round(T3-T2),Math.round(performance.now()-T3)]; GEO[kind]={S:S,b:b,n:data.length/8,tx:tx}; return GEO[kind]; }
  /* ---------- matrices ---------- */
  function persp(fov,asp,n,f){ var t=1/Math.tan(fov/2); return [t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,2*f*n/(n-f),0]; }
  function look(e,c,u){ var z=nrm(sub(e,c)), x=nrm(cross(u,z)), y=cross(z,x); return [x[0],y[0],z[0],0, x[1],y[1],z[1],0, x[2],y[2],z[2],0, -dot(x,e),-dot(y,e),-dot(z,e),1]; }
  function mm(a,b){ var o=new Array(16); for(var i=0;i<4;i++) for(var j=0;j<4;j++){ var s=0; for(var k=0;k<4;k++) s+=a[k*4+j]*b[i*4+k]; o[i*4+j]=s; } return o; }
  function model(pos,q,s){ var x=q[0],y=q[1],z=q[2],w=q[3]; return [(1-2*(y*y+z*z))*s,2*(x*y+z*w)*s,2*(x*z-y*w)*s,0, 2*(x*y-z*w)*s,(1-2*(x*x+z*z))*s,2*(y*z+x*w)*s,0, 2*(x*z+y*w)*s,2*(y*z-x*w)*s,(1-2*(x*x+y*y))*s,0, pos[0],pos[1],pos[2],1]; }
  function hex(h){ var n=parseInt(h.slice(1),16); return [(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]; }
  /* ---------- values ---------- */
  function rnd(n){ var c=window.crypto, a=new Uint32Array(1), lim=4294967296-(4294967296%n); for(var g=0;g<64;g++){ if(c&&c.getRandomValues) c.getRandomValues(a); else a[0]=Math.floor(Math.random()*4294967296); if(a[0]<lim) return 1+a[0]%n; } return 1+a[0]%n; }
  function acc(){ var v=getComputedStyle(D.documentElement).getPropertyValue("--dice").trim(); return /^#[0-9a-f]{6}$/i.test(v)?v:"#a3182b"; }
  function weak(){ return (navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2; }
  /* the final turn: the face (or for a d4 the corner) with the value on top, its number upright for the viewer, a little yaw for life */
  function finalQ(S,val,jit){ var q1, up=null;
    if(S.t===4){ var vi=val-1, bot=S.F.filter(function(f){ return f.v.indexOf(vi)<0; })[0]; q1=qfromto(bot.n,[0,-1,0]); return qmul(qax([0,1,0],(Math.random()*2-1)*Math.PI),q1); }
    var f=S.F.filter(function(x){ return x.val===val; })[0]; q1=qfromto(f.n,[0,1,0]); up=qrot(q1,f.up); var al=Math.atan2(up[0],-up[2]); return qmul(qax([0,1,0],al+jit),q1); }
  /* ---------- one throw ---------- */
  function throwDice(list,given){ var W=innerWidth, H=innerHeight, dpr=Math.min(window.devicePixelRatio||1,weak()?1.5:2);
    if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
    var items=[], vals=[]; list.forEach(function(f,i){ f=+f; var g=given&&given[i], v=(g>=1&&g<=f&&g===Math.floor(g))?g:rnd(f); vals.push(v);
      if(f===100){ var tens=v===100?10:(Math.floor(v/10)||10), ones=v%10||10; if(v%10===0&&v!==100) tens=v/10; items.push({k:"10t",v:tens},{k:"10",v:ones}); }
      else if(f===4||f===6||f===8||f===10||f===12||f===20) items.push({k:String(f),v:v}); });
    if(!items.length) return Promise.resolve(vals);
    /* the table in world units: about 34 px per unit on a phone, the die is 2 units across */
    var fov=0.62, pxu=Math.max(24,Math.min(40,Math.min(W,H)/11)), n=items.length, sc=1, sp=2.6, cols, rows, Ww=W/pxu, Hw=H/pxu;
    for(var g=0;g<12;g++){ cols=Math.max(1,Math.min(n,Math.floor(Ww*0.86/(sp*sc)))); rows=Math.ceil(n/cols); if(rows*sp*sc<=Hw*0.62) break; sc*=0.88; }
    var dist=(Hw/2)/Math.tan(fov/2), eye=[0,dist,dist*0.30], VP=mm(persp(fov,W/H,dist*0.3,dist*3),look(eye,[0,0,0],[0,0,-1]));
    var T0=0, dur=1250, cy=Hw*0.06, tSet=performance.now();
    items.forEach(function(it,i){ var c=i%cols, r=Math.floor(i/cols), inRow=Math.min(cols,n-r*cols);
      it.G=geo(it.k); it.s=sc; it.to=[((c-(inRow-1)/2)*sp+(Math.random()-0.5)*0.5)*sc, 0, ((r-(rows-1)/2)*sp+(Math.random()-0.5)*0.5)*sc+cy];
      it.from=[it.to[0]*0.35+(Math.random()-0.5)*Ww*0.3, 0, Hw/2+2.5+Math.random()*2]; it.qf=finalQ(it.G.S,it.v,(Math.random()*2-1)*0.35);
      it.a1=nrm([Math.random()-0.5,Math.random()-0.5,Math.random()-0.5]); it.a2=nrm([Math.random()-0.5,Math.random()-0.5,Math.random()-0.5]); it.A1=(3+Math.random()*3)*Math.PI; it.A2=(1+Math.random())*Math.PI;
      it.h0=2.5+Math.random()*1.5; it.del=Math.min(260,i*22); });
    var col=hex(acc()), ink=[0.98,0.94,0.86];
    function hy(s,h0){ /* height above the resting height: a fall, then three bounces, each lower */
      if(s<0.30){ var u=s/0.30; return h0*(1-u*u); } var B=[[0.30,0.60,1.0],[0.60,0.80,0.36],[0.80,0.90,0.10]];
      for(var i=0;i<B.length;i++){ if(s<B[i][1]){ var v=(s-B[i][0])/(B[i][1]-B[i][0]); return 4*B[i][2]*v*(1-v); } } return 0; }
    function frame(now){ var t0=performance.now(), done=true; gl.viewport(0,0,cv.width,cv.height); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
      var poses=items.map(function(it){ var s=Math.max(0,Math.min(1,(now-T0-it.del)/dur)); if(s<1) done=false; var e=1-Math.pow(1-s,2.2), r=Math.pow(1-s,2.4);
        var x=it.from[0]+(it.to[0]-it.from[0])*e, z=it.from[2]+(it.to[2]-it.from[2])*e, ang=(it.A1+it.A2)*r, R=it.G.S.rin;
        var q=qmul(it.qf,qmul(qax(it.a1,it.A1*r),qax(it.a2,it.A2*r))), lift=(1-R)*Math.min(1,ang/0.7), y=(R+lift+hy(s,it.h0))*it.s; return {p:[x,y,z],q:q,y:y}; });
      /* shadows first, without depth writes */
      gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA); gl.useProgram(PS.p); gl.bindBuffer(gl.ARRAY_BUFFER,BUF); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0,2,gl.FLOAT,false,8,0); gl.disableVertexAttribArray(1); gl.disableVertexAttribArray(2);
      gl.uniformMatrix4fv(PS.u.VP,false,VP); poses.forEach(function(o,i){ var it=items[i]; gl.uniform3f(PS.u.c,o.p[0]+o.y*0.18,0,o.p[2]+o.y*0.12); gl.uniform1f(PS.u.r,1.25*it.s*(1+o.y*0.12)); gl.uniform1f(PS.u.a,0.42/(1+o.y*0.35)); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); });
      gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW); gl.useProgram(P.p); gl.uniformMatrix4fv(P.u.VP,false,VP); gl.uniform3fv(P.u.col,col); gl.uniform3fv(P.u.ink,ink); gl.uniform3fv(P.u.eye,eye); gl.uniform1i(P.u.tx,0);
      poses.forEach(function(o,i){ var it=items[i]; gl.bindBuffer(gl.ARRAY_BUFFER,it.G.b); gl.enableVertexAttribArray(0); gl.enableVertexAttribArray(1); gl.enableVertexAttribArray(2); gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0); gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12); gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D,it.G.tx); gl.uniformMatrix4fv(P.u.M,false,model(o.p,o.q,it.s)); gl.drawArrays(gl.TRIANGLES,0,it.G.n); });
      stats.frames++; stats.ms+=performance.now()-t0; return done; }
    stats.setup=Math.round(performance.now()-tSet); T0=performance.now();/* the clock starts after the meshes and atlases are ready */
    return new Promise(function(ok){ (function loop(now){ if(lost){ ok(null); return; } var d=frame(now||performance.now()); if(d){ ok(vals); return; } requestAnimationFrame(loop); })(performance.now()); }); }
  /* the numbers use the app's own Archivo (embedded): wait for it once, at most 600 ms, so the atlas never draws with a fallback */
  var FONT=null; function font(){ if(FONT) return FONT; var f=D.fonts&&D.fonts.load?D.fonts.load("700 64px Archivo").catch(function(){}):null; FONT=f?Promise.race([f,new Promise(function(r){ setTimeout(r,600); })]):Promise.resolve(); return FONT; }
  function run(list,given){ if(!init()) return Promise.resolve(null); clearTimeout(hideT); tray.classList.add("on"); stats.rolls++;
    return font().then(function(){ return throwDice(list,given); }).then(function(v){ hideT=setTimeout(function(){ tray.classList.remove("on"); },1800); return v; },function(){ tray.classList.remove("on"); return null; }); }
  window.__dice3d={ roll:function(list,given){ var p=queue.then(function(){ try{ return run(list,given); }catch(e){ if(tray) tray.classList.remove("on"); return null; } }); queue=p.catch(function(){}); return p; },
    preload:function(){ return font().then(function(){ return init(); }); }, state:function(){ return {loaded:!!gl,loading:false,engine:"lite"}; }, stats:function(){ return stats; },
    /* for tests: the face each die shows, read back from its final turn (the face whose normal points up, or the corner on top of a d4) */
    topOf:function(kind,val){ var S=solid(+kind), q=finalQ(S,val,0.2); if(S.t===4){ var best=-9, vi=-1; S.V.forEach(function(v,i){ var y=qrot(q,v)[1]; if(y>best){ best=y; vi=i; } }); return vi+1; } var b=-9, fv=0; S.F.forEach(function(f){ var y=qrot(q,f.n)[1]; if(y>b){ b=y; fv=f.val; } }); return fv; },
    faces:function(kind){ var S=solid(+kind); return S.F.map(function(f){ return f.val; }); } };
})();
