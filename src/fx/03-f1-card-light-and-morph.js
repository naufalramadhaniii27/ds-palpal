/* === F1: card light, card to detail morph (both ways), staggered content, kind glow, scroll fade === */
const FXS03A={};
(function(){
  const sheet=document.getElementById("sheet"), body=document.getElementById("sheetBody");
  if(!sheet||!body||!document.body.animate) return;
  function stampRGB(){ if(FXS03A.STAMP) return FXS03A.STAMP; FXS03A.STAMP=stampRGB0(); return FXS03A.STAMP; }
  function stampRGB0(){ const t=document.createElement("i"); t.style.color="var(--stamp)"; document.body.appendChild(t); const m=/(\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(t).color)||[0,200,200,210]; t.remove(); return m[1]+","+m[2]+","+m[3]; }
  FXS03A.kindRGB=function kindRGB(el){ const v=el.getAttribute("data-info"); return (v&&FXS03A.KIND[v.split(":")[0]])||stampRGB(); };;
  FXS03A.vis=function vis(r){ return r&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth; };
  FXS03A.glow=function glow(el,cx,cy){ const r=el.getBoundingClientRect(); if(!FXS03A.vis(r)) return; const e={clientX:cx,clientY:cy};
    let w=FXS03A.GP.pop(), d=Math.max(r.width,r.height)*2.2, rad=FXS03A.GR.get(el); if(!rad){ rad=getComputedStyle(el).borderRadius; FXS03A.GR.set(el,rad); }
    if(!w){ w=document.createElement("span"); w.className="mi-rip mi-glow"; w.setAttribute("aria-hidden","true"); w.appendChild(document.createElement("i")); document.body.appendChild(w); }
    const i=w.firstChild; w.style.cssText="left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+rad+";--mi-k:"+FXS03A.kindRGB(el);
    i.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";
    const a=i.animate([{transform:"scale(.15)",opacity:0},{transform:"scale(.6)",opacity:1,offset:.35},{transform:"scale(1)",opacity:0}],{duration:520,easing:FXS03A.EASE,fill:"forwards"});
    a.onfinish=function(){ a.cancel(); w.style.cssText="display:none"; if(FXS03A.GP.length<3) FXS03A.GP.push(w); else w.remove(); }; };
})();
(function(){
  const sheet=document.getElementById("sheet"), body=document.getElementById("sheetBody");
  if(!sheet||!body||!document.body.animate) return;
  function unhide(n){ n=n||0; if(sheet.classList.contains("sp-out")&&n<25) return setTimeout(() =>{ unhide(n+1); },60); sheet.classList.remove("mi-gone"); }
  FXS03A.closeAnim=function closeAnim(o){
    let el=o.el.isConnected&&o.el.getClientRects().length?o.el:null, c;
    if(!el) Array.prototype.some.call(document.querySelectorAll("#app "+o.key),(x) =>{ const r=x.getBoundingClientRect(); if(FXS03A.vis(r)){ el=x; return true; } });
    c=el&&el.getBoundingClientRect();
    if(MI.rm()||!FXS03A.vis(c)){ if(o.hide) o.hide.cancel(); return; }
    const R=sheet.getBoundingClientRect(); sheet.classList.add("mi-gone");
    const sh=document.createElement("div"); sh.className="mi-shell"; sh.setAttribute("aria-hidden","true"); sh.style.cssText+=";--mi-k:"+o.rgb+";left:"+R.left+"px;top:"+R.top+"px;width:"+R.width+"px;height:"+R.height+"px;border-radius:"+getComputedStyle(sheet).borderRadius;
    document.body.appendChild(sh);
    sh.animate([{transform:"none",opacity:1},{transform:"translate("+(c.left-R.left)+"px,"+(c.top-R.top)+"px) scale("+(c.width/R.width)+","+(c.height/R.height)+")",opacity:1,offset:.85},{transform:"translate("+(c.left-R.left)+"px,"+(c.top-R.top)+"px) scale("+(c.width/R.width)+","+(c.height/R.height)+")",opacity:0}],{duration:300,easing:FXS03A.EASE,fill:"forwards"}).onfinish=function(){ sh.remove(); };
    if(o.hide&&o.el===el){ setTimeout(() =>{ o.hide.cancel(); el.animate([{opacity:0},{opacity:1}],{duration:120}); },230); } else if(o.hide) o.hide.cancel();
    setTimeout(unhide,320); };
  FXS03A.TRIG="[data-info],[data-bd]"; FXS03A.EASE="cubic-bezier(.2,.8,.2,1)";
  FXS03A.KIND={sp:"155,110,255",spn:"155,110,255",it:"255,196,70",w:"235,95,70",f:"60,190,170",xd:"60,190,170",cust:"60,190,170",cuq:"60,190,170",cr:"60,190,170",g:"120,170,235",grp:"120,170,235",cond:"120,170,235"};
  FXS03A.STAMP=null; new MutationObserver(() =>{ FXS03A.STAMP=null; }).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-skin","data-hc","style","class"]});;
  /* on wide screens the app grows the side panel from the button itself, so our flight would fight it: there, only on phones */
  FXS03A.WIDE=FXENV.matchMedia?matchMedia("(min-width: 760px)"):null;
})();
(function(){
  const sheet=document.getElementById("sheet"), body=document.getElementById("sheetBody");
  if(!sheet||!body||!document.body.animate) return;
  FXS03A.ok=function ok(el){ return el&&!(FXS03A.WIDE&&FXS03A.WIDE.matches)&&el.closest("#app")&&!el.closest("#sheet,#homeV,#bld,.ask,#moreMenu,#hpQm"); };;
  FXS03A.pend=null; FXS03A.open=null; FXS03A.GP=[]; FXS03A.GR=new WeakMap();
  /* F1.0 light: a glow spreads from the point you press on any card that opens a detail */
  /* only for a press, not for the start of a swipe: wait 80 ms and drop it if the finger moves */
  FXS03A.GL=null;
  MI.on("pointerdown",(e) =>{ if(MI.rm()||e.button>0) return; const el=e.target.closest&&e.target.closest(FXS03A.TRIG); if(!FXS03A.ok(el)) return; const g={x:e.clientX,y:e.clientY,id:e.pointerId}; FXS03A.GL=g;
    g.t=setTimeout(() =>{ if(FXS03A.GL===g){ FXS03A.GL=null; FXS03A.glow(el,g.x,g.y); } },80); },true);
  function noGlow(){ if(FXS03A.GL){ clearTimeout(FXS03A.GL.t); FXS03A.GL=null; } }
  MI.on("pointermove",(e) =>{ if(FXS03A.GL&&e.pointerId===FXS03A.GL.id&&Math.abs(e.clientX-FXS03A.GL.x)+Math.abs(e.clientY-FXS03A.GL.y)>8) noGlow(); });
  MI.on("pointercancel",noGlow,true);
})();
(function(){
  const sheet=document.getElementById("sheet"), body=document.getElementById("sheetBody");
  if(!sheet||!body||!document.body.animate) return;
  MI.on("pointerup",() =>{ if(FXS03A.GL){ const g=FXS03A.GL; clearTimeout(g.t); FXS03A.GL=null; let el=document.elementFromPoint(g.x,g.y); el=el&&el.closest&&el.closest(FXS03A.TRIG); if(FXS03A.ok(el)) FXS03A.glow(el,g.x,g.y); } },true);;
  /* F1.1 open: hold the click one frame, put a shell on the card, then let the app open the panel */
  MI.on("click",(e) =>{ if(MI.rm()) return; const el=e.target.closest&&e.target.closest(FXS03A.TRIG); if(!el||el.__miGo||!FXS03A.ok(el)||sheet.classList.contains("on")) return;
    const r=el.getBoundingClientRect(); if(!FXS03A.vis(r)) return; e.preventDefault(); e.stopImmediatePropagation();
    const rgb=FXS03A.kindRGB(el), sh=document.createElement("div"); sh.className="mi-shell"; sh.setAttribute("aria-hidden","true"); sh.style.cssText+=";--mi-k:"+rgb+";left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+getComputedStyle(el).borderRadius+";opacity:0";
    document.body.appendChild(sh); FXS03A.pend={el:el,r:r,sh:sh,rgb:rgb,key:el.hasAttribute("data-info")?'[data-info="'+CSS.escape(el.getAttribute("data-info"))+'"]':'[data-bd="'+CSS.escape(el.getAttribute("data-bd"))+'"]'};
    __miNF(() =>{ el.__miGo=1; try{ el.click(); }finally{ el.__miGo=0; }
      setTimeout(() =>{ if(FXS03A.pend&&FXS03A.pend.sh===sh){ FXS03A.pend=null; sh.remove(); } },120); }); },true);
})();
(function(){
  const sheet=document.getElementById("sheet"), body=document.getElementById("sheetBody");
  if(!sheet||!body||!document.body.animate) return;
  /* the app moves the panel with its own spring (class spr / sp-out). Keep our lock until that spring is done, so nothing jumps */
  function release(n){ n=n||0; if(sheet.classList.contains("spr")&&n<20) return setTimeout(() =>{ release(n+1); },60); sheet.classList.remove("mi-flip"); }
  function stagger(){ Array.prototype.slice.call(body.children,0,10).forEach((c,i) =>{ c.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:280,delay:150+i*32,easing:FXS03A.EASE,fill:"backwards"}); }); }
  let fq=0; FXS03A.fades=function fades(){ if(fq) return; fq=requestAnimationFrame(() =>{ fq=0; const t=body.scrollTop>4, b=body.scrollTop+body.clientHeight<body.scrollHeight-4; if(body.classList.contains("mi-ft")!==t) body.classList.toggle("mi-ft",t); if(body.classList.contains("mi-fb")!==b) body.classList.toggle("mi-fb",b); }); };;
  MI.on("scroll",(e) =>{ if(e.target===body) FXS03A.fades(); },true);
  function onOpen(){ const p=FXS03A.pend; FXS03A.pend=null; sheet.style.setProperty("--mi-k",p.rgb); sheet.classList.remove("mi-gone"); sheet.classList.add("mi-kind","mi-flip");
    p.pre=sheet.animate([{opacity:0},{opacity:0}],{duration:700});/* hidden by an animation, not a style: if the next frame never comes, it shows itself */
    __miNF(() =>{ openAnim(p); }); }
  function openAnim(p){ const R=sheet.getBoundingClientRect(), c=p.r, sh=p.sh; if(p.pre) p.pre.cancel();
    sh.style.left=R.left+"px"; sh.style.top=R.top+"px"; sh.style.width=R.width+"px"; sh.style.height=R.height+"px"; sh.style.borderRadius=getComputedStyle(sheet).borderRadius; sh.style.opacity="1";
    sh.animate([{transform:"translate("+(c.left-R.left)+"px,"+(c.top-R.top)+"px) scale("+(c.width/R.width)+","+(c.height/R.height)+")"},{transform:"none"}],{duration:300,easing:FXS03A.EASE,fill:"forwards"});
    const hide=p.el.animate([{opacity:1},{opacity:0}],{duration:110,fill:"forwards"});
    sheet.animate([{opacity:0},{opacity:0,offset:.5},{opacity:1}],{duration:360,easing:"ease-out"});
    stagger(); FXS03A.fades();
    setTimeout(() =>{ sh.animate([{opacity:1},{opacity:0}],{duration:140,fill:"forwards"}).onfinish=function(){ sh.remove(); }; release(); },330);
    FXS03A.open={el:p.el,key:p.key,rgb:p.rgb,hide:hide}; MI.buzz("light"); }
  function onClose(){ const o=FXS03A.open; FXS03A.open=null; sheet.classList.remove("mi-kind"); if(!o) return; if(o.hide) setTimeout(() =>{ o.hide.cancel(); },700);/* the card always comes back */ if(MI.rm()){ if(o.hide) o.hide.cancel(); return; }
    __miNF(() =>{ FXS03A.closeAnim(o); }); };
  let was=sheet.classList.contains("on");
  new MutationObserver(() =>{ const on=sheet.classList.contains("on"); if(on===was){ if(on) FXS03A.fades(); return; } was=on; if(on){ if(FXS03A.pend) onOpen(); else FXS03A.fades(); } else onClose(); }).observe(sheet,{attributes:true,attributeFilter:["class"]});
})();
(function(){
  const sheet=document.getElementById("sheet"), body=document.getElementById("sheetBody");
  if(!sheet||!body||!document.body.animate) return;
  new MutationObserver(() =>{ if(sheet.classList.contains("on")) FXS03A.fades(); }).observe(body,{childList:true});
})();
