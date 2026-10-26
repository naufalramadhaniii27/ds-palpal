/* === F1: card light, card to detail morph (both ways), staggered content, kind glow, scroll fade === */
(function(){
  var sheet=document.getElementById("sheet"), body=document.getElementById("sheetBody"); if(!sheet||!body||!document.body.animate) return;
  var TRIG="[data-info],[data-bd]", EASE="cubic-bezier(.2,.8,.2,1)";
  var KIND={sp:"155,110,255",spn:"155,110,255",it:"255,196,70",w:"235,95,70",f:"60,190,170",xd:"60,190,170",cust:"60,190,170",cuq:"60,190,170",cr:"60,190,170",g:"120,170,235",grp:"120,170,235",cond:"120,170,235"};
  var STAMP=null; new MutationObserver(function(){ STAMP=null; }).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme","data-skin","data-hc","style","class"]});
  function stampRGB(){ if(STAMP) return STAMP; STAMP=stampRGB0(); return STAMP; }
  function stampRGB0(){ var t=document.createElement("i"); t.style.color="var(--stamp)"; document.body.appendChild(t); var m=/(\d+),\s*(\d+),\s*(\d+)/.exec(getComputedStyle(t).color)||[0,200,200,210]; t.remove(); return m[1]+","+m[2]+","+m[3]; }
  function kindRGB(el){ var v=el.getAttribute("data-info"); return (v&&KIND[v.split(":")[0]])||stampRGB(); }
  /* on wide screens the app grows the side panel from the button itself, so our flight would fight it: there, only on phones */
  var WIDE=window.matchMedia?matchMedia("(min-width: 760px)"):null;
  function ok(el){ return el&&!(WIDE&&WIDE.matches)&&el.closest("#app")&&!el.closest("#sheet,#homeV,#bld,.ask,#moreMenu,#hpQm"); }
  function vis(r){ return r&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth; }
  var pend=null, open=null, GP=[], GR=new WeakMap();
  /* F1.0 light: a glow spreads from the point you press on any card that opens a detail */
  /* only for a press, not for the start of a swipe: wait 80 ms and drop it if the finger moves */
  var GL=null;
  MI.on("pointerdown",function(e){ if(MI.rm()||e.button>0) return; var el=e.target.closest&&e.target.closest(TRIG); if(!ok(el)) return; var g={x:e.clientX,y:e.clientY,id:e.pointerId}; GL=g;
    g.t=setTimeout(function(){ if(GL===g){ GL=null; glow(el,g.x,g.y); } },80); },true);
  function noGlow(){ if(GL){ clearTimeout(GL.t); GL=null; } }
  MI.on("pointermove",function(e){ if(GL&&e.pointerId===GL.id&&Math.abs(e.clientX-GL.x)+Math.abs(e.clientY-GL.y)>8) noGlow(); });
  MI.on("pointercancel",noGlow,true);
  MI.on("pointerup",function(){ if(GL){ var g=GL; clearTimeout(g.t); GL=null; var el=document.elementFromPoint(g.x,g.y); el=el&&el.closest&&el.closest(TRIG); if(ok(el)) glow(el,g.x,g.y); } },true);
  function glow(el,cx,cy){ var r=el.getBoundingClientRect(); if(!vis(r)) return; var e={clientX:cx,clientY:cy};
    var w=GP.pop(), d=Math.max(r.width,r.height)*2.2, rad=GR.get(el); if(!rad){ rad=getComputedStyle(el).borderRadius; GR.set(el,rad); }
    if(!w){ w=document.createElement("span"); w.className="mi-rip mi-glow"; w.setAttribute("aria-hidden","true"); w.appendChild(document.createElement("i")); document.body.appendChild(w); }
    var i=w.firstChild; w.style.cssText="left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+rad+";--mi-k:"+kindRGB(el);
    i.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";
    var a=i.animate([{transform:"scale(.15)",opacity:0},{transform:"scale(.6)",opacity:1,offset:.35},{transform:"scale(1)",opacity:0}],{duration:520,easing:EASE,fill:"forwards"});
    a.onfinish=function(){ a.cancel(); w.style.cssText="display:none"; if(GP.length<3) GP.push(w); else w.remove(); }; }
  /* F1.1 open: hold the click one frame, put a shell on the card, then let the app open the panel */
  MI.on("click",function(e){ if(MI.rm()) return; var el=e.target.closest&&e.target.closest(TRIG); if(!el||el.__miGo||!ok(el)||sheet.classList.contains("on")) return;
    var r=el.getBoundingClientRect(); if(!vis(r)) return; e.preventDefault(); e.stopImmediatePropagation();
    var rgb=kindRGB(el), sh=document.createElement("div"); sh.className="mi-shell"; sh.setAttribute("aria-hidden","true"); sh.style.cssText+=";--mi-k:"+rgb+";left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+getComputedStyle(el).borderRadius+";opacity:0";
    document.body.appendChild(sh); pend={el:el,r:r,sh:sh,rgb:rgb,key:el.hasAttribute("data-info")?'[data-info="'+CSS.escape(el.getAttribute("data-info"))+'"]':'[data-bd="'+CSS.escape(el.getAttribute("data-bd"))+'"]'};
    __miNF(function(){ el.__miGo=1; try{ el.click(); }finally{ el.__miGo=0; }
      setTimeout(function(){ if(pend&&pend.sh===sh){ pend=null; sh.remove(); } },120); }); },true);
  /* the app moves the panel with its own spring (class spr / sp-out). Keep our lock until that spring is done, so nothing jumps */
  function release(n){ n=n||0; if(sheet.classList.contains("spr")&&n<20) return setTimeout(function(){ release(n+1); },60); sheet.classList.remove("mi-flip"); }
  function unhide(n){ n=n||0; if(sheet.classList.contains("sp-out")&&n<25) return setTimeout(function(){ unhide(n+1); },60); sheet.classList.remove("mi-gone"); }
  function stagger(){ Array.prototype.slice.call(body.children,0,10).forEach(function(c,i){ c.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:280,delay:150+i*32,easing:EASE,fill:"backwards"}); }); }
  var fq=0; function fades(){ if(fq) return; fq=requestAnimationFrame(function(){ fq=0; var t=body.scrollTop>4, b=body.scrollTop+body.clientHeight<body.scrollHeight-4; if(body.classList.contains("mi-ft")!==t) body.classList.toggle("mi-ft",t); if(body.classList.contains("mi-fb")!==b) body.classList.toggle("mi-fb",b); }); }
  MI.on("scroll",function(e){ if(e.target===body) fades(); },true);
  function onOpen(){ var p=pend; pend=null; sheet.style.setProperty("--mi-k",p.rgb); sheet.classList.remove("mi-gone"); sheet.classList.add("mi-kind","mi-flip");
    p.pre=sheet.animate([{opacity:0},{opacity:0}],{duration:700});/* hidden by an animation, not a style: if the next frame never comes, it shows itself */
    __miNF(function(){ openAnim(p); }); }
  function openAnim(p){ var R=sheet.getBoundingClientRect(), c=p.r, sh=p.sh; if(p.pre) p.pre.cancel();
    sh.style.left=R.left+"px"; sh.style.top=R.top+"px"; sh.style.width=R.width+"px"; sh.style.height=R.height+"px"; sh.style.borderRadius=getComputedStyle(sheet).borderRadius; sh.style.opacity="1";
    sh.animate([{transform:"translate("+(c.left-R.left)+"px,"+(c.top-R.top)+"px) scale("+(c.width/R.width)+","+(c.height/R.height)+")"},{transform:"none"}],{duration:300,easing:EASE,fill:"forwards"});
    var hide=p.el.animate([{opacity:1},{opacity:0}],{duration:110,fill:"forwards"});
    sheet.animate([{opacity:0},{opacity:0,offset:.5},{opacity:1}],{duration:360,easing:"ease-out"});
    stagger(); fades();
    setTimeout(function(){ sh.animate([{opacity:1},{opacity:0}],{duration:140,fill:"forwards"}).onfinish=function(){ sh.remove(); }; release(); },330);
    open={el:p.el,key:p.key,rgb:p.rgb,hide:hide}; MI.buzz("light"); }
  function onClose(){ var o=open; open=null; sheet.classList.remove("mi-kind"); if(!o) return; if(o.hide) setTimeout(function(){ o.hide.cancel(); },700);/* the card always comes back */ if(MI.rm()){ if(o.hide) o.hide.cancel(); return; }
    __miNF(function(){ closeAnim(o); }); }
  function closeAnim(o){
    var el=o.el.isConnected&&o.el.getClientRects().length?o.el:null, c;
    if(!el) Array.prototype.some.call(document.querySelectorAll("#app "+o.key),function(x){ var r=x.getBoundingClientRect(); if(vis(r)){ el=x; return true; } });
    c=el&&el.getBoundingClientRect();
    if(MI.rm()||!vis(c)){ if(o.hide) o.hide.cancel(); return; }
    var R=sheet.getBoundingClientRect(); sheet.classList.add("mi-gone");
    var sh=document.createElement("div"); sh.className="mi-shell"; sh.setAttribute("aria-hidden","true"); sh.style.cssText+=";--mi-k:"+o.rgb+";left:"+R.left+"px;top:"+R.top+"px;width:"+R.width+"px;height:"+R.height+"px;border-radius:"+getComputedStyle(sheet).borderRadius;
    document.body.appendChild(sh);
    sh.animate([{transform:"none",opacity:1},{transform:"translate("+(c.left-R.left)+"px,"+(c.top-R.top)+"px) scale("+(c.width/R.width)+","+(c.height/R.height)+")",opacity:1,offset:.85},{transform:"translate("+(c.left-R.left)+"px,"+(c.top-R.top)+"px) scale("+(c.width/R.width)+","+(c.height/R.height)+")",opacity:0}],{duration:300,easing:EASE,fill:"forwards"}).onfinish=function(){ sh.remove(); };
    if(o.hide&&o.el===el){ setTimeout(function(){ o.hide.cancel(); el.animate([{opacity:0},{opacity:1}],{duration:120}); },230); } else if(o.hide) o.hide.cancel();
    setTimeout(unhide,320); }
  var was=sheet.classList.contains("on");
  new MutationObserver(function(){ var on=sheet.classList.contains("on"); if(on===was){ if(on) fades(); return; } was=on; if(on){ if(pend) onOpen(); else fades(); } else onClose(); }).observe(sheet,{attributes:true,attributeFilter:["class"]});
  new MutationObserver(function(){ if(sheet.classList.contains("on")) fades(); }).observe(body,{childList:true});
})();
