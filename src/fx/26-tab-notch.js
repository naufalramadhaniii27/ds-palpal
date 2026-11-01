/* === Floating Notch tab bar (phone) ===
   The bar is one SVG shape. Its top edge has a round notch under the ball. The ball slides with the page (see .bnav-ind in 36-tidy.css).
   The notch sits on the tab nearest to the ball and is as deep as the ball is close to that tab's centre:
   it closes on the tab the ball leaves and opens on the tab the ball reaches, as in the reference clip. */
(function(){
  var nav=document.getElementById("bnav"), ind=document.getElementById("bInd"), pager=document.getElementById("pager");
  if(!nav||!ind||!document.createElementNS) return;
  var NS="http://www.w3.org/2000/svg", svg=document.createElementNS(NS,"svg"), fill=document.createElementNS(NS,"path"), line=document.createElementNS(NS,"path");
  svg.setAttribute("class","nb-s"); svg.setAttribute("aria-hidden","true"); fill.setAttribute("class","nb-f"); line.setAttribute("class","nb-l");
  svg.appendChild(fill); svg.appendChild(line); nav.insertBefore(svg,nav.firstChild);
  var W=0, H=0, key="", run=0, still=0, DM=30, HW=31, R=18;/* notch depth, half width at the top edge, corner radius */
  var bar=nav.parentNode;
  function size(){ var bs=nav.querySelector("button"); var w=bar.clientWidth-20; if(!bs||w<100){ W=0; return; } W=w; H=bs.offsetHeight; svg.setAttribute("width",W); svg.setAttribute("height",H); svg.setAttribute("viewBox","0 0 "+W+" "+H); key=""; }
  function f(n){ return Math.round(n*10)/10; }
  function shape(c,d){ var D=DM*d, w=Math.min(HW*(.45+.55*d),c-R-1,W-c-R-1), x0=c-w, x1=c+w, on=D>.4&&w>8, a=on?" L"+f(x0)+",0 C"+f(x0+w*.42)+",0 "+f(c-w*.74)+","+f(D)+" "+f(c)+","+f(D)+" C"+f(c+w*.74)+","+f(D)+" "+f(x1-w*.42)+",0 "+f(x1)+",0":"";
    var body="M"+R+",0"+a+" L"+f(W-R)+",0 Q"+W+",0 "+W+","+R+" L"+W+","+f(H-R)+" Q"+W+","+H+" "+f(W-R)+","+H+" L"+R+","+H+" Q0,"+H+" 0,"+f(H-R)+" L0,"+R+" Q0,0 "+R+",0 Z";
    return [body,body]; }
  var CX=[], PITCH=60;/* centres of the tabs inside the bar, measured when the size changes */
  function centres(){ var bs=nav.querySelectorAll("button"); CX=Array.prototype.map.call(bs,function(b){ return b.offsetLeft+b.offsetWidth/2; }); PITCH=bs.length?bs[0].offsetWidth:60; }
  function draw(){ if(!W){ size(); if(!W) return 0; centres(); }
    var r=ind.getBoundingClientRect(), n=svg.getBoundingClientRect(), m=nav.getBoundingClientRect(), x=r.left+r.width/2-n.left, off=m.left-n.left, j=0, b=1e9, i, dd;
    for(i=0;i<CX.length;i++){ dd=Math.abs(x-(CX[i]+off)); if(dd<b){ b=dd; j=i; } }
    var cj=CX[j]+off, d=Math.max(0,Math.min(1,1-(b-3)/(.62*PITCH))); d=d*d*(3-2*d);
    var k=cj.toFixed(1)+"|"+d.toFixed(3)+"|"+W; if(k===key) return 0; key=k; var p=shape(cj,d); fill.setAttribute("d",p[0]); line.setAttribute("d",p[1]); return 1; }
  function loop(){ run=1; var moved=draw(); still=moved?0:still+1; if(still<14) requestAnimationFrame(loop); else run=0; }
  function kick(){ still=0; if(!run) requestAnimationFrame(loop); }
  window.addEventListener("resize",function(){ W=0; kick(); });
  if(pager) pager.addEventListener("scroll",kick,{passive:true});
  nav.addEventListener("click",kick);
  bar.addEventListener("scroll",kick,{passive:true});
  if(window.MutationObserver) new MutationObserver(kick).observe(nav,{attributes:true,subtree:true,attributeFilter:["class"]});
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ W=0; kick(); });
  setTimeout(function(){ W=0; kick(); },400); kick();
  window.__nbDraw=function(){ W=0; key=""; return draw(); };/* test hook */
})();
