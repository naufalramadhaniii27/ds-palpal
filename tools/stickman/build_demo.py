import base64, json, sys
D = sys.argv[1] if len(sys.argv) > 1 else "layers_demo"
OUT = sys.argv[2] if len(sys.argv) > 2 else "/home/claude/dnd-sheet/stickman-demo.html"
m = json.load(open(D + "/meta.json"))
def uri(n): return "data:image/png;base64," + base64.b64encode(open(f"{D}/{n}.png", "rb").read()).decode()
L = m["layers"]; PV = m["pivots"]; W, H = m["w"], m["h"]
def img(n, cls=""):
    l = L[n]; return f'<img class="ly {cls}" id="l-{n}" src="{uri(n)}" style="left:{l["x"]}px;top:{l["y"]}px;width:{l["w"]}px;height:{l["h"]}px" alt="">'
def org(n): return f"{PV[n][0]*W:.1f}px {PV[n][1]*H:.1f}px"
html = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ink figure demo</title>
<style>
:root{{--bg:#14181b;--panel:#1c2226;--ink:#e9e4d8;--line:#334047;--acc:#d9463e}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.4 system-ui,sans-serif;display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px}}
h1{{font-size:20px;margin:0}}
#stage{{position:relative;width:min(420px,100%);aspect-ratio:{W}/{H};border:1px solid var(--line);border-radius:16px;overflow:hidden;background:rgb({m["paper"][0]},{m["paper"][1]},{m["paper"][2]})}}
#scale{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;transform-origin:0 0}}
.g{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;will-change:transform}}
.ly{{position:absolute;display:block;pointer-events:none;user-select:none}}
#base{{left:0;top:0;width:{W}px;height:{H}px}}
#fig{{transform-origin:{org("body")}}}
#head{{transform-origin:{org("head")}}}
#armL{{transform-origin:{org("armL")}}}
#armR{{transform-origin:{org("armR")}}}
#tail{{transform-origin:{org("tail")}}}
#fire{{transform-origin:{org("fire")}}}
#glow{{position:absolute;left:{PV["fire"][0]*W-150:.0f}px;top:{PV["fire"][1]*H-230:.0f}px;width:300px;height:300px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,150,40,.55),rgba(255,120,30,.18) 55%,rgba(255,120,30,0));pointer-events:none}}
#fx{{position:absolute;left:0;top:0;width:{W}px;height:{H}px;pointer-events:none;overflow:visible}}
.row{{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-items:center}}
button{{min-height:44px;padding:0 16px;border-radius:12px;border:1px solid var(--line);background:var(--panel);color:var(--ink);font:600 15px system-ui;cursor:pointer}}
button[aria-pressed="true"]{{background:var(--acc);border-color:var(--acc);color:#fff}}
#note{{display:none;font-size:14px;color:#aab;margin:0}}
</style></head><body>
<h1>Ink figure demo</h1>
<div id="stage"><div id="scale">
 <div class="g" id="fig">
  <img class="ly" id="base" src="{uri("base")}" alt="Tiefling cleric in scale mail">
  <div class="g" id="tail">{img("tail")}</div>
  <div class="g" id="head">{img("head")}</div>
  <div class="g" id="armR">{img("armR")}</div>
  <div class="g" id="armL">{img("armL")}<div class="g" id="fire"><div id="glow"></div>{img("fire")}</div></div>
 </div>
 <svg id="fx" viewBox="0 0 {W} {H}"></svg>
</div></div>
<div class="row" role="group" aria-label="Action">
<button type="button" id="bShield" aria-pressed="false">Shield</button>
<button type="button" id="bFire">Fireball</button>
<button type="button" id="bHit">Take damage</button>
</div>
<p id="note">Reduce Motion is on. The figure holds still and actions show one frame.</p>
<script>
(function(){{
var W={W},H={H},REDUCE=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var $=function(id){{return document.getElementById(id)}};
var stage=$("stage"),scale=$("scale"),fig=$("fig"),head=$("head"),armL=$("armL"),armR=$("armR"),tail=$("tail"),fire=$("fire"),glow=$("glow"),fx=$("fx");
var INK="#141517",PAPER="#f1ede4",RED="#d6413a",ORANGE="#ea7a2a",GOLD="#f0bb4c";
var PV={json.dumps({k:[v[0]*W,v[1]*H] for k,v in PV.items()})};
function fit(){{ var s=stage.clientWidth/W; scale.style.transform="scale("+s+")"; }}
addEventListener("resize",fit); fit();
function lerp(a,b,t){{return a+(b-a)*t}} function clamp(v,a,b){{return Math.max(a,Math.min(b,v))}}
function ss(t){{t=clamp(t,0,1);return t*t*(3-2*t)}} function eo(t){{t=clamp(t,0,1);return 1-Math.pow(1-t,3)}} function ei(t){{t=clamp(t,0,1);return t*t*t}}
function seg(t,a,b){{return clamp((t-a)/(b-a),0,1)}}
var EASE={{io:ss,o:eo,i:ei}};
function kf(f,tr){{ if(f<=tr[0][0]) return tr[0][1]; for(var i=1;i<tr.length;i++){{ if(f<=tr[i][0]){{ var a=tr[i-1],b=tr[i],u=seg(f,a[0],b[0]); return lerp(a[1],b[1],EASE[b[2]||"io"](u)); }} }} return tr[tr.length-1][1]; }}
function spring(x,v,target,dt,w,z){{ var a=(target-x)*w*w-2*z*w*v; v+=a*dt; x+=v*dt; return [x,v]; }}
function N(v){{return Math.round(v*10)/10}}
/* pose parameters: lean (deg at feet), crouch (scaleY), aL (left arm deg), aR (right arm deg), hd (head deg), fs (fire scale) */
var IDLE={{lean:0,crouch:0,aL:0,aR:0,hd:0,fs:1,fo:1}};
var FB={{lean:[[0,0],[.5,4],[.95,5],[1.06,-7,"o"],[1.35,-4],[2.3,0]],
 crouch:[[0,0],[.5,.02],[.95,.025],[1.06,.035,"o"],[1.35,.015],[2.3,0]],
 aL:[[0,0],[.5,26],[.95,30],[1.04,-22,"o"],[1.3,-16],[2.3,0]],
 aR:[[0,0],[.5,-8],[.95,-9],[1.06,6,"o"],[2.3,0]],
 hd:[[0,0],[.5,-5],[.95,-6],[1.06,5,"o"],[2.3,0]],
 fs:[[0,1],[.4,1.1],[.95,1.75],[1.0,1.8],[1.03,0,"i"],[1.6,0],[2.3,1,"o"]],
 fo:[[0,1],[1.0,1],[1.03,0],[1.6,0],[2.3,1,"o"]]}};
var cur={{}}; for(var k0 in IDLE) cur[k0]=IDLE[k0];
var shieldOn=false, shAmt=0, shVel=0, fireT=null, proj=null, boom=null, shake=0, hit=0, hitV=0, T0=performance.now(), lastT=0, raf=0, embers=[];
for(var e=0;e<7;e++) embers.push({{p:Math.random(),x:(Math.random()-.5)*120,s:.6+Math.random()*.8,r:Math.random()}});
function frame(now){{
  var dt=clamp((now-lastT)/1000||.016,.001,.05); lastT=now; var t=REDUCE?0:(now-T0)/1000;
  var r1=spring(shAmt,shVel,shieldOn?1:0,dt,9,.6); shAmt=clamp(r1[0],-.2,1.3); shVel=r1[1];
  var r2=spring(hit,hitV,0,dt,12,.35); hit=r2[0]; hitV=r2[1];
  if(REDUCE){{ shAmt=shieldOn?1:0; hit=0; }}
  var fT=null; if(fireT!=null){{ fT=(now-fireT)/1000; if(fT>2.3){{ fireT=null; fT=null; }} }}
  var tgt={{}},k; for(k in IDLE) tgt[k]=fT!=null?kf(fT,FB[k]):IDLE[k];
  var sh=ss(clamp(shAmt,0,1)); tgt.aR+=-14*sh; tgt.crouch+=.02*sh; tgt.lean+=1.5*sh;
  var kS=1-Math.exp(-dt*30); for(k in IDLE) cur[k]+=(tgt[k]-cur[k])*kS;
  /* idle layers */
  var br=.5+.5*Math.sin(t*1.5), sw=Math.sin(t*.45);
  var lean=cur.lean+sw*.7+hit*6, bob=-br*3+hit*8, sy=1+br*.009-cur.crouch, sx=1+br*.004;
  fig.style.transform="translate(0px,"+N(bob)+"px) rotate("+N(lean)+"deg) scale("+N(sx*1000)/1000+","+N(sy*1000)/1000+")";
  head.style.transform="rotate("+N(cur.hd+Math.sin(t*.5+1)*1.6-hit*4)+"deg)";
  armL.style.transform="rotate("+N(cur.aL+Math.sin(t*.9)*2.2)+"deg)";
  armR.style.transform="rotate("+N(cur.aR+Math.sin(t*1.1+2)*1.4)+"deg)";
  tail.style.transform="rotate("+N(Math.sin(t*1.3)*7+Math.sin(t*3.1)*1.5)+"deg)";
  var fl=1+Math.sin(t*9.1)*.03+Math.sin(t*13.7)*.025, fw=1-Math.sin(t*11.3)*.02;
  fire.style.transform="rotate("+N(Math.sin(t*5.3)*2)+"deg) scale("+N(cur.fs*fw*100)/100+","+N(cur.fs*fl*100)/100+")";
  fire.style.opacity=cur.fo; glow.style.opacity=.55+.25*Math.sin(t*7.3)+.3*(cur.fs-1);
  /* effects */
  var s="", i;
  /* embers rising from the fire */
  if(cur.fo>.3){{ var fb=PV.fire, rate=.18+(cur.fs-1)*.2; for(i=0;i<embers.length;i++){{ var em=embers[i]; em.p+=dt*rate*em.s; if(em.p>1){{ em.p=0; em.x=(Math.random()-.5)*120*cur.fs; em.r=Math.random(); }} var ex=fb[0]+em.x+Math.sin(t*3+em.r*9)*8, ey=fb[1]-60-em.p*220*cur.fs; s+='<circle cx="'+N(ex)+'" cy="'+N(ey)+'" r="'+N(3.5*(1-em.p)+1)+'" fill="'+(em.r<.5?ORANGE:GOLD)+'" fill-opacity="'+N(1-em.p)+'"/>'; }} }}
  /* projectile: starts when the fire in hand vanishes */
  if(fT!=null&&fT>=1.02&&fT<1.1&&!proj&&!boom){{ var fr=$("l-fire").getBoundingClientRect(), sr=stage.getBoundingClientRect(), k2=W/sr.width; var fy0=(fr.top+fr.height/2-sr.top)*k2-H*.03; proj={{t:now,from:[(fr.left+fr.width/2-sr.left)*k2,fy0],to:[W*.2,fy0-H*.16]}}; }}
  if(proj){{ var pq=(now-proj.t)/1000/.38; if(pq>=1){{ boom={{t:now,c:proj.to}}; proj=null; shake=.25; }} else {{ var px=lerp(proj.from[0],proj.to[0],eo(pq)), py=lerp(proj.from[1],proj.to[1],pq)-Math.sin(pq*Math.PI)*30, R=52;
      for(i=1;i<5;i++){{ var tq=clamp(pq-i*.05,0,1), tx=lerp(proj.from[0],proj.to[0],eo(tq)), ty=lerp(proj.from[1],proj.to[1],tq)-Math.sin(tq*Math.PI)*30; s+='<circle cx="'+N(tx)+'" cy="'+N(ty)+'" r="'+N(R*(.8-i*.14))+'" fill="'+ORANGE+'" fill-opacity="'+N(.45-i*.09)+'"/>'; }}
      s+=flame(px,py,R,t); }} }}
  if(boom){{ var be=(now-boom.t)/1000/.8; if(be>=1) boom=null; else {{ var BR=30+eo(be)*140, op=1-be, bc=boom.c, pts=[];
      for(i=0;i<18;i++){{ var an=i/18*Math.PI*2, rr=BR*(i%2?1:.62)*(1+.06*Math.sin(t*25+i)); pts.push(N(bc[0]+Math.cos(an)*rr)+" "+N(bc[1]+Math.sin(an)*rr)); }}
      s+='<path d="M'+pts.join("L")+'Z" fill="'+PAPER+'" fill-opacity="'+N(op)+'" stroke="'+INK+'" stroke-width="7" stroke-linejoin="round" stroke-opacity="'+N(op)+'"/>';
      var p2=[]; for(i=0;i<12;i++){{ var a2=i/12*Math.PI*2+.3, r3=BR*.62*(i%2?1:.58); p2.push(N(bc[0]+Math.cos(a2)*r3)+" "+N(bc[1]+Math.sin(a2)*r3)); }}
      s+='<path d="M'+p2.join("L")+'Z" fill="'+RED+'" fill-opacity="'+N(op)+'"/>';
      var p3=[]; for(i=0;i<10;i++){{ var a3=i/10*Math.PI*2+.8, r4=BR*.36*(i%2?1:.55); p3.push(N(bc[0]+Math.cos(a3)*r4)+" "+N(bc[1]+Math.sin(a3)*r4)); }}
      s+='<path d="M'+p3.join("L")+'Z" fill="'+GOLD+'" fill-opacity="'+N(op)+'"/>';
      for(i=0;i<9;i++){{ var sa=i/9*Math.PI*2+.2, s0=BR*1.12, s1=BR*(1.4+(i%2)*.25); s+='<path d="M'+N(bc[0]+Math.cos(sa)*s0)+' '+N(bc[1]+Math.sin(sa)*s0)+'L'+N(bc[0]+Math.cos(sa)*s1)+' '+N(bc[1]+Math.sin(sa)*s1)+'" stroke="'+INK+'" stroke-width="'+N(7*op+1)+'" stroke-linecap="round" stroke-opacity="'+N(op)+'"/>'; }}
      for(i=0;i<6;i++){{ var ca=i/6*Math.PI*2+.6, cr=BR*.8, pr=18+be*60, drift=be*120; s+='<circle cx="'+N(bc[0]+Math.cos(ca)*cr)+'" cy="'+N(bc[1]+Math.sin(ca)*cr-drift)+'" r="'+N(pr)+'" fill="'+PAPER+'" fill-opacity="'+N(op*.9)+'" stroke="'+INK+'" stroke-width="4" stroke-opacity="'+N(op*.8)+'"/>'; }} }} }}
  /* shield spell: arcane ring in front of the figure */
  if(sh>.02){{ var cx=W*.5, cy=H*.5, SR=(W*.36+Math.sin(t*4)*4)*sh, rp=(t*.8)%1;
    s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+N(SR)+'" fill="'+GOLD+'" fill-opacity="'+N(.12*sh)+'" stroke="'+INK+'" stroke-width="6" stroke-dasharray="26 14" stroke-opacity="'+N(.85*sh)+'" transform="rotate('+N(t*6)+' '+cx+' '+cy+')"/>';
    s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+N(SR*.9)+'" fill="none" stroke="'+GOLD+'" stroke-width="7" stroke-opacity="'+N(.75*sh)+'"/>';
    s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+N(SR*(.9+rp*.16))+'" fill="none" stroke="'+GOLD+'" stroke-width="4" stroke-opacity="'+N(.5*(1-rp)*sh)+'"/>';
    for(i=0;i<6;i++){{ var ra=i/6*Math.PI*2-t*.4, rx1=cx+Math.cos(ra)*SR*.9, ry1=cy+Math.sin(ra)*SR*.9; s+='<circle cx="'+N(rx1)+'" cy="'+N(ry1)+'" r="9" fill="'+PAPER+'" stroke="'+INK+'" stroke-width="4" stroke-opacity="'+N(.9*sh)+'"/>'; }} }}
  if(hit>.02){{ s+='<rect x="0" y="0" width="'+W+'" height="'+H+'" fill="'+RED+'" fill-opacity="'+N(.18*hit)+'"/>'; }}
  fx.innerHTML=s;
  var sk=shake>0?(shake-=dt,[Math.sin(now*.09)*8*shake/.25,Math.cos(now*.07)*5*shake/.25]):[0,0];
  scale.style.transform="scale("+(stage.clientWidth/W)+") translate("+N(sk[0])+"px,"+N(sk[1])+"px)";
  var moving=!REDUCE||fireT!=null||proj||boom||Math.abs(shAmt-(shieldOn?1:0))>.01||Math.abs(hit)>.01;
  if(moving) raf=requestAnimationFrame(frame); else raf=0;
}}
function flame(x,y,R,t){{ var h='', k; /* comic fireball flying left: round core, tongues trailing to the right */
  for(k=0;k<4;k++){{ var ang=(-.55+k*.37)+Math.sin(t*17+k*2)*.08, L=R*(1.6+.5*Math.sin(t*13+k*1.7)), w=R*.42, dx=Math.cos(ang),dy=Math.sin(ang),px=-dy,py=dx;
    var b1=[x+dx*R*.7+px*w,y+dy*R*.7+py*w], b2=[x+dx*R*.7-px*w,y+dy*R*.7-py*w], tip=[x+dx*(R+L),y+dy*(R+L)], m1=[x+dx*(R+L*.4)+px*w*1.2,y+dy*(R+L*.4)+py*w*1.2], m2=[x+dx*(R+L*.4)-px*w*1.2,y+dy*(R+L*.4)-py*w*1.2];
    h+='<path d="M'+N(b1[0])+' '+N(b1[1])+'Q'+N(m1[0])+' '+N(m1[1])+' '+N(tip[0])+' '+N(tip[1])+'Q'+N(m2[0])+' '+N(m2[1])+' '+N(b2[0])+' '+N(b2[1])+'Z" fill="'+(k%2?ORANGE:RED)+'" stroke="'+INK+'" stroke-width="5" stroke-linejoin="round"/>'; }}
  h+='<circle cx="'+N(x)+'" cy="'+N(y)+'" r="'+N(R)+'" fill="'+RED+'" stroke="'+INK+'" stroke-width="6"/><circle cx="'+N(x-R*.12)+'" cy="'+N(y-R*.08)+'" r="'+N(R*.68)+'" fill="'+ORANGE+'"/><circle cx="'+N(x-R*.2)+'" cy="'+N(y-R*.14)+'" r="'+N(R*.4)+'" fill="'+GOLD+'"/><circle cx="'+N(x-R*.26)+'" cy="'+N(y-R*.2)+'" r="'+N(R*.16+Math.sin(t*40)*2)+'" fill="'+PAPER+'"/>';
  return h; }}
function kick(){{ if(!raf) raf=requestAnimationFrame(frame); }}
var bS=$("bShield"); bS.onclick=function(){{ shieldOn=!shieldOn; bS.setAttribute("aria-pressed",shieldOn); kick(); }};
$("bFire").onclick=function(){{ if(fireT!=null||proj||boom) return; fireT=performance.now(); if(REDUCE) fireT-=1000; kick(); }};
$("bHit").onclick=function(){{ hitV=-14; hit=0; kick(); }};
if(REDUCE) $("note").style.display="block";
kick();
window.__stick={{shield:function(v){{ shieldOn=!!v; bS.setAttribute("aria-pressed",shieldOn); kick(); }},fire:function(){{ $("bFire").onclick(); }},hit:function(){{ $("bHit").onclick(); }}}};
}})();
</script></body></html>'''
open(OUT, "w").write(html)
print("wrote", OUT, len(html)//1024, "KB")
