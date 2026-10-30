(function(){
var A=Element.prototype.animate, cv=null, cx=null, P=[], raf=0, W=0, H=0, dpr=Math.min(2,window.devicePixelRatio||1);
function ensure(){ if(cv&&cv.isConnected) return; cv=document.createElement("canvas"); cv.id="miFxCanvas"; cv.setAttribute("aria-hidden","true");
 cv.style.cssText="position:fixed;left:0;top:0;width:100vw;height:100vh;pointer-events:none;z-index:var(--z-fx,9999)"; document.body.appendChild(cv); cx=cv.getContext("2d"); rs(); addEventListener("resize",rs); }
function rs(){ W=innerWidth; H=innerHeight; cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
function pt(t){ var m=/translate\(([-\d.e]+)px,\s*([-\d.e]+)px\).*?rotate\(([-\d.e]+)deg\)\s*scale\(([-\d.e]+)\)/.exec(t); if(m) return [+m[1],+m[2],+m[3],+m[4]]; m=/translate\(([-\d.e]+)px,\s*([-\d.e]+)px\)\s*scale\(([-\d.e]+)\)/.exec(t); if(m) return [+m[1],+m[2],0,+m[3]]; return null; }
function bez(x1,y1,x2,y2){ return function(x){ if(x<=0)return 0; if(x>=1)return 1; var lo=0,hi=1,t=x; for(var i=0;i<18;i++){ t=(lo+hi)/2; var cx_=3*x1*t*(1-t)*(1-t)+3*x2*t*t*(1-t)+t*t*t; if(cx_<x)lo=t; else hi=t; } return 3*y1*t*(1-t)*(1-t)+3*y2*t*t*(1-t)+t*t*t; }; }
var EASE=bez(.2,.8,.2,1);
function loop(ts){ raf=0; if(!P.length){ cx.clearRect(0,0,cv.width,cv.height); return; } cx.setTransform(dpr,0,0,dpr,0,0); cx.clearRect(0,0,W,H);
 for(var i=P.length-1;i>=0;i--){ var q=P[i], t=(ts-q.t0)/q.dur; if(t>=1||q.dead){ P.splice(i,1); if(!q.dead&&q.an.onfinish) try{ q.an.onfinish() }catch(e){} continue; } if(t<0) t=0;
  var p=EASE(t), k=q.k, a=k[0], b=k[1]; for(var j=0;j<k.length-1;j++){ if(p>=k[j].o&&p<=k[j+1].o){ a=k[j]; b=k[j+1]; break; } }
  var u=(b.o===a.o)?1:(p-a.o)/(b.o-a.o), x=a.x+(b.x-a.x)*u, y=a.y+(b.y-a.y)*u, r=a.r+(b.r-a.r)*u, s=a.s+(b.s-a.s)*u, op=a.op+(b.op-a.op)*u;
  cx.save(); cx.globalAlpha=Math.max(0,Math.min(1,op)); cx.translate(x,y); cx.rotate(r*Math.PI/180); cx.scale(s,s);
  if(q.shape==="ring"){ cx.strokeStyle=q.col; cx.lineWidth=2/Math.max(.01,s)*1; cx.beginPath(); cx.arc(0,0,q.w/2-1,0,6.2832); cx.stroke(); }
  else if(q.shape==="dot"){ cx.fillStyle=q.col; cx.beginPath(); cx.arc(0,0,q.w/2,0,6.2832); cx.fill(); }
  else { cx.fillStyle=q.col; var w=q.w,h=q.h,rd=Math.min(2,w/2); cx.beginPath(); cx.moveTo(-w/2+rd,-h/2); cx.arcTo(w/2,-h/2,w/2,h/2,rd); cx.arcTo(w/2,h/2,-w/2,h/2,rd); cx.arcTo(-w/2,h/2,-w/2,-h/2,rd); cx.arcTo(-w/2,-h/2,w/2,-h/2,rd); cx.fill(); }
  cx.restore(); }
 raf=requestAnimationFrame(loop); }
Element.prototype.animate=function(kf,o){ var c=this.className; if(typeof c!=="string"||c.indexOf("mi-fx")<0||!(/mi-(dot|spark|ring)\b/.test(c))||!Array.isArray(kf)||kf.length<2||!o||typeof o.duration!=="number") return A.call(this,kf,o);
 var k=[]; for(var i=0;i<kf.length;i++){ var v=pt(kf[i].transform||""); if(!v) return A.call(this,kf,o); k.push({o:kf[i].offset!=null?kf[i].offset:i/(kf.length-1),x:v[0],y:v[1],r:v[2],s:v[3],op:kf[i].opacity!=null?+kf[i].opacity:1}); }
 ensure(); var shape=/mi-spark/.test(c)?"spark":/mi-ring/.test(c)?"ring":"dot", st=this.style, w=parseFloat(st.width)||(shape==="spark"?3:shape==="ring"?16:7), h=parseFloat(st.height)||(shape==="spark"?12:w);
 var col=shape==="ring"?(st.color||"#fff"):(st.background||st.backgroundColor||"#ffd166"); st.visibility="hidden";
 var an={onfinish:null,cancel:function(){ q.dead=1 },finish:function(){ q.dead=1 }}; var q={k:k,t0:performance.now(),dur:o.duration,shape:shape,col:col,w:w,h:h,an:an}; P.push(q); if(!raf) raf=requestAnimationFrame(loop); return an; };
})();
