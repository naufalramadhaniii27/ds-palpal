/* === F5: Bell Toggle, STABLE / DEAD moments, Decay Card, loader, backup mark, echo numbers, peel, shredder; pause loops while scrolling === */
(function(){
  if(!document.body.animate) return; const html=document.documentElement, EASE="cubic-bezier(.2,.8,.2,1)";
  let st=0, sc=[];
  MI.on("scroll",() =>{ if(!sc.length){ sc=Array.prototype.slice.call(document.querySelectorAll("#miAmb,#homeV:not([hidden]),.btn.pri.lvup,#insp[aria-pressed='true'],#vbInsp[aria-pressed='true']")); sc.forEach((x) =>{ x.classList.add("mi-sc"); }); }
    clearTimeout(st); st=setTimeout(() =>{ sc.forEach((x) =>{ x.classList.remove("mi-sc"); }); sc=[]; },160); },true);
  /* the Star Border cover needs the colour really behind the tile (tiles can be transparent in a skin); kept on stable containers */
  function alpha(b){ const m=/rgba?\(([^)]+)\)/.exec(b||""); if(!m) return 0; const v=m[1].split(","); return v.length>3?+v[3]:1; }
  function solid(el){ while(el&&el!==document.documentElement){ const b=getComputedStyle(el).backgroundColor; if(alpha(b)>=.95) return b; el=el.parentElement; } return getComputedStyle(document.body).backgroundColor; }
  function covers(){ [["tiles","#insp"],["vbar","#vbInsp"]].forEach((p) =>{ const box=document.getElementById(p[0]), t=document.querySelector(p[1]); if(!box||!t) return; const own=getComputedStyle(t).backgroundColor;
      box.style.setProperty("--mi-cover",solid(t.parentElement)); box.style.setProperty("--mi-tint",alpha(own)>0&&alpha(own)<.95?own:"transparent"); }); }
  covers(); new MutationObserver(() =>{ requestAnimationFrame(covers); }).observe(html,{attributes:true,attributeFilter:["data-theme","data-skin","data-hc"]});
  /* Bell Toggle: the switch swings like a struck bell, with one ring */
  window.__miBell=function(el,col){ if(!el||MI.rm()) return; const r=el.getBoundingClientRect(); if(!r.width) return;
    el.animate([{transform:"rotate(0)"},{transform:"rotate(-14deg)"},{transform:"rotate(11deg)"},{transform:"rotate(-7deg)"},{transform:"rotate(4deg)"},{transform:"none"}],{duration:620,easing:"ease-out"});
    if(window.__miRing) window.__miRing(r.left+r.width/2,r.top+r.height/2,col||"#ffcf4a",Math.max(r.width,r.height)*1.6); MI.buzz("medium"); };
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest("#insp,#vbInsp"); if(!t||e.target.closest(".ib")) return; const id=t.id;
    setTimeout(() =>{ const n=document.getElementById(id); if(n&&n.getAttribute("aria-pressed")==="true"){ window.__miBell(n,"#ffcf4a"); if(window.__miWow) window.__miWow.coin(n); } },30); },true);
  /* STABLE draws itself in, DEAD glitches; both once, when the state starts */
  let dsWas="";
  function dsCheck(){ const s=document.querySelector(".dsg-t b"), d=document.querySelector("#deadNote:not([hidden]) b"), k=d?"dead":(s&&/Stable/.test(s.textContent)?"stable":""); if(k===dsWas) return; dsWas=k; if(MI.rm()||!k) return;
    if(window.__miWow&&window.__miWow.ds) window.__miWow.ds(k);
    if(k==="stable"){ const g=MI.ghost(s); if(!g) return; g.style.background="transparent"; g.style.color="transparent"; g.style.webkitTextStroke="1px #4cc27a"; g.style.clipPath="inset(0 100% 0 0)";
      g.animate([{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0 0 0)",offset:.6},{clipPath:"inset(0 0 0 0)",opacity:1},{opacity:0}],{duration:1100,easing:"ease-out",fill:"forwards"}).onfinish=function(){ g.remove(); };
      s.animate([{opacity:0},{opacity:0,offset:.45},{opacity:1}],{duration:900}); }
    else { const a=MI.ghost(d), b=MI.ghost(d); [a,b].forEach((g,i) =>{ if(!g) return; g.style.background="transparent"; g.style.color=i?"#00e5ff":"#ff3355"; g.style.mixBlendMode="screen";
        g.animate([0,1,2,3,4,5,6,7,8].map((f) =>{ return {transform:"translate("+((Math.random()-.5)*(f<8?10:0))+"px,"+((Math.random()-.5)*(f<8?3:0))+"px)",clipPath:"inset("+(Math.random()*60|0)+"% 0 "+(Math.random()*30|0)+"% 0)"}; }),{duration:900,easing:"steps(9,end)",fill:"forwards"}).onfinish=function(){ g.remove(); }; });
      d.animate([{transform:"translateX(-3px)"},{transform:"translateX(3px)"},{transform:"translateX(-2px)"},{transform:"none"}],{duration:300,iterations:2}); } }
  const dg=document.getElementById("death"); if(dg) new MutationObserver(() =>{ requestAnimationFrame(dsCheck); }).observe(dg,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  /* Decay Card: when a held Delete goes through, the card crumbles (a copy shrinks, blurs and sheds dust) */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#homeV [data-hdel]"); if(!b||b.dataset.heldDone!=="1"||MI.rm()) return; const card=b.closest(".hcard"), g=MI.ghost(card); if(!g) return; const r=card.getBoundingClientRect();
    g.style.overflow="hidden"; g.animate([{transform:"none",opacity:1},{transform:"translateY(6px) scale(.97)",opacity:.8,offset:.35},{transform:"translateY(26px) scale(.9) rotate(-1.5deg)",opacity:0}],{duration:700,easing:"ease-in",fill:"forwards"}).onfinish=function(){ g.remove(); };
    if(window.__miBurst) for(let k=0;k<3;k++) window.__miBurst(r.left+r.width*(.2+.3*k),r.top+r.height*.6,{n:7,colors:["#8a8f96","#5d636b","#b9bec5"],dist:60,dur:900,grav:true}); MI.buzz("heavy"); },true);
  /* Lattice Loader in the Building PDF box */
  const sp=document.querySelector(".busy .spin"); if(sp){ sp.classList.add("mi-lat"); sp.innerHTML=[0,1,2,3,4,5,6,7,8].map((i) =>{ return '<i style="animation-delay:'+(((i%3)+((i/3)|0))*90)+'ms"></i>'; }).join(""); }
  /* Status Mark on Back Up: a ring turns into an arc, then a check */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest('[data-hbk="out"]'); if(!b||MI.rm()) return; const ic=b.querySelector("svg")||b, r=ic.getBoundingClientRect(); if(!r.width) return;
    const m=document.createElementNS("http://www.w3.org/2000/svg","svg"); m.setAttribute("viewBox","0 0 24 24"); m.setAttribute("class","mi-sm"); m.style.left=(r.left+r.width/2-11)+"px"; m.style.top=(r.top+r.height/2-11)+"px"; m.style.color=getComputedStyle(b).color;
    m.innerHTML='<circle cx="12" cy="12" r="9" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/><path d="M7.5 12.5l3 3 6-6.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>'; document.body.appendChild(m);
    const c=m.querySelector("circle"), p=m.querySelector("path"); ic.style.opacity="0";
    c.animate([{strokeDashoffset:100},{strokeDashoffset:0}],{duration:600,easing:"ease-in-out",fill:"forwards"});
    p.animate([{strokeDashoffset:100},{strokeDashoffset:0}],{duration:320,delay:560,easing:EASE,fill:"forwards"});
    m.animate([{opacity:1},{opacity:1,offset:.8},{opacity:0}],{duration:1500,fill:"forwards"}).onfinish=function(){ m.remove(); ic.style.opacity=""; }; setTimeout(() =>{ m.remove(); ic.style.opacity=""; },1800); },true);
  /* Echo Text: the rising Hit Point number leaves two fading echoes */
  window.__miEcho=function(f){ if(!MI.full()) return; const a=f.getAnimations&&f.getAnimations()[0]; if(!a) return; const kf=a.effect.getKeyframes(), t=a.effect.getTiming();
    [1,2].forEach((n) =>{ const e=f.cloneNode(true); e.style.opacity=""; document.body.appendChild(e);
      const an=e.animate(kf.map((k) =>{ const o={transform:k.transform,offset:k.offset}; if(k.opacity!=null) o.opacity=k.opacity*(n===1?.45:.22); return o; }),{duration:t.duration,easing:t.easing,delay:n*70,fill:"both"}); an.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },1600); }); };
  /* Sticker Peel: a condition removed in the dialog peels off the sheet when the dialog closes */
  let peel=[];
  MI.on("click",(e) =>{ const c=e.target.closest&&e.target.closest("#sheetBody [data-c]"); if(!c||MI.rm()) return; const k=c.getAttribute("data-c");
    const chip=document.querySelector('#conds .chip.on[data-info="g:'+CSS.escape(k)+'"]'); if(!chip) return; const g=MI.ghost(chip); if(!g) return; g.style.visibility="hidden"; peel.push(g); },true);
  const sh=document.getElementById("sheet"); if(sh) new MutationObserver(() =>{ if(sh.classList.contains("on")||!peel.length) return; const L=peel; peel=[];
    L.forEach((g,i) =>{ g.style.visibility=""; g.style.transformOrigin="0 0"; g.style.boxShadow="0 6px 14px rgba(0,0,0,.35)";
      g.animate([{transform:"none",opacity:1},{transform:"rotate(-8deg) translate(4px,-6px) scale(1.04)",opacity:1,offset:.3},{transform:"rotate(-28deg) translate(30px,40px) scale(.9)",opacity:0}],{duration:650,delay:180+i*90,easing:"cubic-bezier(.4,0,.2,1)",fill:"both"}).onfinish=function(){ g.remove(); }; }); }).observe(sh,{attributes:true,attributeFilter:["class"]});
  /* Shredder: Remove Item in Manage Inventory cuts the row into falling strips */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-irm],[data-idel]"); if(!b||MI.rm()) return; const row=b.closest(".imr,.irow,.icard,li,.mrow")||b.parentNode; const r=row.getBoundingClientRect(); if(!r.width) return; const N=6;
    for(let i=0;i<N;i++){ const g=MI.ghost(row); if(!g) return; const a=(i*100/N).toFixed(1), z=((i+1)*100/N).toFixed(1); g.style.clipPath="inset(0 "+(100-z)+"% 0 "+a+"%)";
      g.animate([{transform:"none",opacity:1},{transform:"translateY("+(30+Math.random()*30)+"px) rotate("+((Math.random()-.5)*10)+"deg)",opacity:0}],{duration:520,delay:i*35,easing:"ease-in",fill:"both"}).onfinish=(function(g){ return function(){ g.remove(); }; })(g); }
    MI.buzz("medium"); },true);
})();

/* --- F6.2: warm tooltip (mouse only). One pooled bubble replaces the native title. --- */
(function(){
  if(!window.__MI||!document.body||!(window.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
  let MI=window.__MI, tip=null, cur=null, tm=0;
  function hide(){ clearTimeout(tm); cur=null; if(tip) tip.classList.remove("on"); }
  MI.on("pointerover",(e) =>{ if(e.pointerType!=="mouse") return; const t=e.target.closest&&(e.target.closest("header.band button,header.band a,#moreMenu button")||e.target.closest("[title],[data-mi-tip]")); if(!t||t===cur||t.closest("svg")&&!t.closest("button")) return;
    if(!t.hasAttribute("data-mi-tip")){ const s=t.getAttribute("title")||t.getAttribute("aria-label")||(t.textContent||"").replace(/\s+/g," ").trim(); if(!s) return;
      t.setAttribute("data-mi-tip",s); if(t.hasAttribute("title")) t.removeAttribute("title");
      if(!t.hasAttribute("aria-label")&&!(t.textContent||"").trim()) t.setAttribute("aria-label",s); }/* every button in the top bar gets a tip: its title, else its label, else its text */
    hide(); cur=t; tm=setTimeout(() =>{ if(cur!==t||!t.isConnected) return;
      if(!tip){ tip=document.createElement("div"); tip.className="mi-tip"; tip.setAttribute("aria-hidden","true"); document.body.appendChild(tip); }
      tip.textContent=t.getAttribute("data-mi-tip"); let r=t.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight, x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)), y=r.top-h-10, up=y>8; if(!up) y=r.bottom+10;
      tip.style.left=x+"px"; tip.style.top=y+"px"; tip.classList.toggle("dn",!up); tip.style.setProperty("--ax",(r.left+r.width/2-x)+"px"); tip.classList.add("on"); },380); },true);
  MI.on("pointerout",(e) =>{ if(cur&&(!e.relatedTarget||!cur.contains(e.relatedTarget))) hide(); },true);
  MI.on("pointerdown",hide,true); MI.on("scroll",hide,true); MI.on("keydown",hide,true);
})();

/* --- Builder: answer the tap at once. A cover paints first, then the builder is built under it, then it slides in. --- */
(function(){
  const MI=window.__MI; if(!MI||!document.body.animate) return;
  const T0=Date.now();
  function wrap(){ const o=window.__bldOpen; if(!o||o.__mi) return; const w=function(){ const self=this, a=arguments, bd=document.getElementById("bld");
      if(MI.rm()||!bd||!bd.hidden) return o.apply(self,a);
      if(Date.now()-T0<3000){ const res=o.apply(self,a); if(window.__miWow&&window.__miWow.welcome) window.__miWow.welcome(); return res; }/* at start-up (a new character) the app opens the Builder itself, in order: never delay that, only greet */
      const cv=document.createElement("div"); cv.className="mi-bcov"; cv.setAttribute("aria-hidden","true"); cv.innerHTML="<i></i><i></i><i></i>"; document.body.appendChild(cv);
      cv.animate([{opacity:0},{opacity:1}],{duration:140,fill:"forwards"});
      __miNF(() =>{ setTimeout(() =>{ try{ o.apply(self,a); }finally{
        bd.animate([{opacity:0,transform:"translateY(22px) scale(.99)"},{opacity:1,transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"});
        cv.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"}).onfinish=function(){ cv.remove(); }; setTimeout(() =>{ cv.remove(); },1500); } },0); }); };
    w.__mi=1; window.__bldOpen=w; }
  if(document.readyState==="complete") wrap(); else window.addEventListener("load",wrap); setTimeout(wrap,1500);
})();

