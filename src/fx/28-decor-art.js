/* === Painted interface pieces (owner 2026-11-06): parchment toast with a wax seal, a framed confirm dialog with a ribbon, a parchment
   tooltip, a brush stroke under Home headings, and painted sprite effects (heal, damage, level up, saved, loading, resting).
   Sprites are 4x4 sheets drawn on a canvas with a crossfade between frames and an eased scale and fade, so they move smoothly at the
   screen's frame rate instead of stepping. Off with Art off. Under prefers-reduced-motion the pieces stay, the motion is skipped. === */
(function(){
  const D=document, H=D.documentElement, A=(window.__ART||{}).ui||{}, RM=matchMedia("(prefers-reduced-motion:reduce)");
  function ls(k){ try{ return __store.getItem(k); }catch(e){ return null; } }
  const on=() =>ls("mi-clsart")!=="off"&&!!A["scroll-toast"];
  function sync(){ H.classList.toggle("decor-art",on()); }
  sync(); addEventListener("storage",sync); new MutationObserver(sync).observe(H,{attributes:true,attributeFilter:["data-skin","class"]});
  const IMG={};
  function img(k){ if(!IMG[k]){ const i=new Image(); i.decoding="async"; i.src=A[k]; IMG[k]=i; } return IMG[k]; }
  const ease=(t) =>1-Math.pow(1-t,3), easeIO=(t) =>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
  /* one sprite effect at (x,y) page coordinates, size s px; dur ms; loop until stop() for loaders */
  function sprite(kind,x,y,s,dur,opt){ opt=opt||{}; if(!H.classList.contains("decor-art")) return null; const im=img("sprite-"+kind); if(!im) return null;
    const c=D.createElement("canvas"), dpr=Math.min(2,devicePixelRatio||1); c.width=c.height=Math.round(s*dpr); c.className="dc-spr"; c.setAttribute("aria-hidden","true");
    Object.assign(c.style,opt.host?{width:s+"px",height:s+"px"}:{left:(x-s/2)+"px",top:(y-s/2)+"px",width:s+"px",height:s+"px"}); (opt.host||D.body).appendChild(c);
    const g=c.getContext("2d"), N=16, fw=256; let t0=0, raf=0, dead=false;
    function frame(f,a,sc){ const i=Math.floor(f)%N, sx=(i%4)*fw, sy=Math.floor(i/4)*fw, w=c.width*sc, o=(c.width-w)/2; g.globalAlpha=a; g.drawImage(im,sx,sy,fw,fw,o,o,w,w); }
    function draw(now){ if(dead) return; if(!t0) t0=now; const t=(now-t0)/dur, p=opt.loop?(t%1):Math.min(1,t);
      g.clearRect(0,0,c.width,c.height);
      const fp=p*(N-1), k=fp-Math.floor(fp), env=opt.loop?1:(p<.18?ease(p/.18):p>.8?1-easeIO((p-.8)/.2):1), sc=opt.loop?1:(.86+.14*ease(Math.min(1,p/.3)));
      if(RM.matches){ frame(opt.loop?0:N*.4,1,1); return; }
      frame(fp,env*(1-k),sc); frame(Math.min(N-1,fp+1),env*k,sc);          /* crossfade the two nearest frames */
      if(opt.loop||t<1) raf=requestAnimationFrame(draw); else stop(); }
    function stop(){ dead=true; cancelAnimationFrame(raf); c.remove(); }
    const go=() =>{ raf=requestAnimationFrame(draw); };
    if(im.complete&&im.naturalWidth) go(); else im.addEventListener("load",go,{once:true});
    return {stop}; }
  window.__decorFx=function(kind,x,y,s){ return sprite(kind,x,y,s||160,kind==="damage"?760:kind==="levelup"?1300:1000); };
  /* Hit Points: heal and damage play over the number */
  addEventListener("hpfx",(e) =>{ const k=e.detail==="heal"?"heal":e.detail==="dmg"?"damage":""; if(!k) return; let el=D.getElementById("hpCur"); if(!el||!el.offsetParent) el=D.getElementById("vbHpV"); if(!el) return;
    const r=el.getBoundingClientRect(); sprite(k,r.left+r.width/2+scrollX,r.top+r.height/2+scrollY,Math.max(150,r.height*2.6),k==="damage"?760:1000); });
  /* toast: unrolls, the seal stamps; saving and resting add their sprite in place of the seal */
  const toast=D.getElementById("toast");
  if(toast) new MutationObserver(() =>{ if(!toast.classList.contains("on")||!H.classList.contains("decor-art")||toast._dc===toast.textContent) return; toast._dc=toast.textContent;
    toast.classList.remove("dc-in"); void toast.offsetWidth; toast.classList.add("dc-in");
    const m=toast.textContent||"", k=/backup|saved|copied|download started|synced|exported/i.test(m)?"save":/rest taken|short rest|long rest/i.test(m)?"candle":"";
    toast.classList.toggle("dc-spr-on",!!k); if(k){ const h=D.createElement("span"); h.className="dc-th"; toast.insertBefore(h,toast.firstChild); sprite(k,0,0,52,k==="candle"?1600:1100,{host:h}); setTimeout(() =>{ h.remove(); toast.classList.remove("dc-spr-on"); },2300); }
    setTimeout(() =>{ toast._dc=""; },2600); }).observe(toast,{attributes:true,attributeFilter:["class"],childList:true});
  /* loading lines get the spinning d20 */
  function loaders(root){ if(!H.classList.contains("decor-art")||!root.querySelectorAll) return; root.querySelectorAll("p.lib-empty,p.sy-note").forEach((p) =>{ if(p._dc||!/^Loading/i.test(p.textContent.trim())) return; p._dc=1; p.classList.add("dc-load"); const h=D.createElement("span"); h.className="dc-ld"; p.insertBefore(h,p.firstChild); const s=sprite("loader-d20",0,0,40,1400,{host:h,loop:true});
    const mo=new MutationObserver(() =>{ if(!p.isConnected||!/^Loading/i.test(p.textContent.trim())){ if(s) s.stop(); mo.disconnect(); } }); mo.observe(D.body,{childList:true,subtree:true}); }); }
  new MutationObserver((ms) =>{ ms.forEach((m) =>{ m.addedNodes.forEach((n) =>{ if(n.nodeType===1) loaders(n.parentNode||n); }); }); }).observe(D.body,{childList:true,subtree:true});
  /* warm the cache once the app is idle */
  (window.requestIdleCallback||function(f){ setTimeout(f,3000); })(() =>{ if(on()) ["sprite-heal","sprite-damage","sprite-levelup","sprite-save","sprite-loader-d20","sprite-candle"].forEach(img); });
})();
