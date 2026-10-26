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
/* === F2: odometer, liquid HP bar, scrub fields === */
(function(){
  if(!document.body.animate) return;
  /* odometer: each digit is a column 0-9 that rolls; anything else (+, -, space) stays still. The element keeps an aria-label with the value. */
  /* a digit column holds 0-9 plus a blank (row 10), so a number can grow or shrink a digit while rolling */
  var COL="0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n\u00a0";/* one text node per column: few elements, so a colour change on the number stays cheap */
  function row(ch){ return /\d/.test(ch)?+ch:10; }
  function build(el,txt){ var h=""; for(var i=0;i<txt.length;i++){ var ch=txt[i]; h+=(/[\d ]/.test(ch))?'<span><i style="transform:translateY(-'+row(ch)+'em)">'+COL+'</i></span>':'<span>'+ch+'</span>'; } el.innerHTML='<span class="mi-odo" aria-hidden="true">'+h+'</span>'; }
  function pad(t,n){ while(t.length<n) t=" "+t; return t; }
  window.__miOdo=function(el,val){ if(!el) return; var to=String(val), from=el.getAttribute("data-miv"); el.setAttribute("data-miv",to); el.setAttribute("aria-label",to);
    if(MI.rm()||from===null||from===to){ if(!el.querySelector(".mi-odo")&&el.textContent!==to) el.textContent=to; if(MI.rm()&&el.querySelector(".mi-odo")) el.textContent=to; return; }
    var n=Math.max(from.length,to.length), f=pad(from,n), t=pad(to,n);
    if(!/^[\d ]*$/.test(f+t)){ el.textContent=to; return; }
    build(el,f); var cols=el.querySelectorAll(".mi-odo>span>i");
    __miNF(function(){ __miNF(function(){ for(var i=0;i<n;i++) if(cols[i]) cols[i].style.transform="translateY(-"+row(t[i])+"em)"; }); });
    if(t!==to) setTimeout(function(){ if(el.getAttribute("data-miv")===to) build(el,to); },500); };
  window.__miOdoVal=function(el){ return el?(el.getAttribute("data-miv")||el.textContent.trim()):""; };

  /* liquid HP bar: a slow shimmer on the fill, clipped to the fill, plus a slosh when Hit Points change */
  function liquid(bar,fill){ if(!bar||!fill||bar.querySelector(".mi-wave")) return; bar.classList.add("mi-liq"); var w=document.createElement("span"); w.className="mi-wave"; w.setAttribute("aria-hidden","true"); bar.appendChild(w); }
  function frac(fill){ var m=/scaleX\(([\d.]+)\)/.exec(fill.style.transform||""); return m?+m[1]:1; }
  var lastP={};
  /* p comes from the final value (one update per change), never from the bar's spring, which writes every frame */
  function track(fillSel,getP,watch,opt){ var fill=document.querySelector(fillSel), bar=fill&&fill.parentNode; if(!fill) return; liquid(bar,fill);
    var upd=function(){ var p=getP(fill); if(p==null||isNaN(p)) return; p=Math.max(0,Math.min(1,p)); var w=bar.querySelector(".mi-wave"); if(w) w.style.setProperty("--p",(p*100).toFixed(1)+"%");
      var old=lastP[fillSel]; lastP[fillSel]=p; if(old===undefined||Math.abs(old-p)<.001||MI.rm()) return;
      if(w&&MI.full()){ w.classList.remove("mi-run"); void w.offsetWidth; w.classList.add("mi-run"); clearTimeout(w.__t); w.__t=setTimeout(function(){ w.classList.remove("mi-run"); },2500); }/* the shimmer runs after a change only */
      bar.animate([{transform:"scaleY(1)"},{transform:"scaleY("+(p<old?1.9:1.6)+") skewX("+(p<old?-8:6)+"deg)"},{transform:"scaleY(.8)"},{transform:"none"}],{duration:520,easing:"cubic-bezier(.3,1.4,.5,1)"});
      if(MI.full()&&window.__miBurst){ var r=bar.getBoundingClientRect(); if(r.width&&r.bottom>0&&r.top<innerHeight) window.__miBurst(r.left+r.width*p,r.top+r.height/2,{n:6,colors:[getComputedStyle(fill).backgroundColor,"rgba(255,255,255,.8)"],dist:20,dur:520,grav:true}); } };
    var q=0; new MutationObserver(function(){ if(!q){ q=1; requestAnimationFrame(function(){ q=0; upd(); }); } }).observe(watch(fill),opt); upd(); }
  function hpP(){ var c=document.getElementById("hpCur"), m=document.getElementById("hpMax"); var v=+(c&&(c.getAttribute("data-miv")||c.textContent)), mx=+(m&&(m.getAttribute("data-v")||m.textContent)); return mx?v/mx:null; }
  function arm(){ track("#hpBar",hpP,function(){ return document.getElementById("hpCur"); },{attributes:true,attributeFilter:["data-miv"],childList:true,characterData:true,subtree:true});
    track("#vbBar",function(f){ return frac(f); },function(f){ return f; },{attributes:true,attributeFilter:["style"]}); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",arm); else arm();

  /* scrub fields: drag sideways on Temporary HP or a coin amount to change it; a plain tap still types */
  var SC="#tmpV,#coinDlg [data-camt]", S=null;
  function mark(){ Array.prototype.forEach.call(document.querySelectorAll(SC),function(x){ x.classList.add("mi-scrub"); }); }
  MI.on("pointerdown",function(e){ var t=e.target.closest&&e.target.closest(SC); if(!t||e.button>0) return; mark(); S={t:t,x:e.clientX,v:Math.max(0,Math.floor(+t.value||0)),on:false,id:e.pointerId,last:null}; },true);
  MI.on("pointermove",function(e){ if(!S||e.pointerId!==S.id) return; var dx=e.clientX-S.x; if(!S.on){ if(Math.abs(dx)<7) return; S.on=true; S.t.classList.add("mi-scrubbing"); try{ S.t.setPointerCapture(e.pointerId); }catch(er){} S.t.blur(); }
    var v=Math.max(0,S.v+Math.round(dx/9)); if(v!==S.last){ S.last=v; S.t.value=v; MI.buzz("light"); } });
  function end(){ if(!S) return; var s=S; S=null; if(!s.on) return; s.t.classList.remove("mi-scrubbing");
    s.t.dispatchEvent(new Event("input",{bubbles:true})); s.t.dispatchEvent(new Event("change",{bubbles:true}));
    var stop=function(ev){ ev.preventDefault(); ev.stopPropagation(); document.removeEventListener("click",stop,true); }; document.addEventListener("click",stop,true); setTimeout(function(){ document.removeEventListener("click",stop,true); },50); }
  MI.on("pointerup",end,true); MI.on("pointercancel",end,true);
  new MutationObserver(function(){ var d=document.getElementById("coinDlg"); if(d) mark(); }).observe(document.getElementById("sheetBody")||document.body,{childList:true}); mark();
})();
/* === F3: sliding indicator, Dock, staggered More menu, swipe toast with fuse === */
(function(){
  if(!document.body.animate) return; var EASE="cubic-bezier(.2,.8,.2,1)";
  /* filter and section chips: the chosen chip springs into place by itself (pure CSS, see .ifb.on). Here only a light tick. Nothing is added over the app, so nothing can be left behind */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest(".ifb,.cmb-tab,.ed-sec"); if(b&&!b.classList.contains("on")) MI.buzz("light"); },true);

  /* Dock: on phones the pressed icon in the bottom bar swells and its neighbours lift a little */
  var dk=[];
  function undock(){ dk.forEach(function(x){ x.classList.remove("mi-dock","mi-dock1"); }); dk=[]; }
  MI.on("pointerdown",function(e){ if(MI.rm()) return; var b=e.target.closest&&e.target.closest(".bnav button"); if(!b) return; undock(); b.classList.add("mi-dock"); dk.push(b); },true);
  MI.on("pointerup",function(){ setTimeout(undock,120); },true); MI.on("pointercancel",undock,true);

  /* More menu: items come in one after another */
  var mm=document.getElementById("moreMenu");
  if(mm) new MutationObserver(function(){ if(!mm.classList.contains("open")||MI.rm()) return; Array.prototype.forEach.call(mm.children,function(c,i){ c.animate([{opacity:0,transform:"translateY(-8px) scale(.96)"},{opacity:1,transform:"none"}],{duration:240,delay:i*35,easing:EASE,fill:"backwards"}); }); }).observe(mm,{attributes:true,attributeFilter:["class"]});

  /* toast: a fuse burns down for the time it stays; swipe it down to dismiss */
  var t=document.getElementById("toast"), fz=null;
  function fuse(){ if(!t||!t.classList.contains("on")||MI.rm()) return; var f=t.querySelector(".mi-fuse"); if(!f){ f=document.createElement("i"); f.className="mi-fuse"; f.setAttribute("aria-hidden","true"); t.appendChild(f); }
    if(fz) fz.cancel(); fz=f.animate([{transform:"scaleX(1)"},{transform:"scaleX(0)"}],{duration:t.classList.contains("act")?6000:2400,easing:"linear",fill:"forwards"}); }
  if(t){ var key=""; new MutationObserver(function(){ var k=t.className+"|"+(t.firstChild?t.textContent:""); if(k===key) return; key=k; if(t.classList.contains("on")) fuse(); t.style.translate=""; }).observe(t,{attributes:true,attributeFilter:["class"],childList:true});
    var sw=null;
    MI.on("pointerdown",function(e){ if(!t.classList.contains("on")||!t.contains(e.target)||e.target.closest(".tundo")) return; sw={y:e.clientY,dy:0,id:e.pointerId}; try{ t.setPointerCapture(e.pointerId); }catch(er){} },true);
    MI.on("pointermove",function(e){ if(!sw||e.pointerId!==sw.id) return; sw.dy=Math.max(0,e.clientY-sw.y); t.style.translate="0 "+sw.dy+"px"; t.style.opacity=String(Math.max(.2,1-sw.dy/120)); });
    var up=function(){ if(!sw) return; var s=sw; sw=null; t.style.opacity="";
      if(s.dy>40){ t.animate([{translate:"0 "+s.dy+"px",opacity:.6},{translate:"0 90px",opacity:0}],{duration:180,easing:"ease-in"}).onfinish=function(){ t.classList.remove("on","act"); t.style.translate=""; }; setTimeout(function(){ t.style.translate=""; },400); MI.buzz("light"); }
      else { t.animate([{translate:"0 "+s.dy+"px"},{translate:"0 0"}],{duration:220,easing:EASE}); t.style.translate=""; } };
    MI.on("pointerup",up,true); MI.on("pointercancel",up,true); }
})();
/* === F4: rows arrive the first time a page is seen, description reveals on scroll, containers open like folders, spending an item tears it === */
(function(){
  if(!document.body.animate||!window.IntersectionObserver) return; var EASE="cubic-bezier(.2,.8,.2,1)";
  var ROWS=".sp-r,.irow,.arow,.fitem,.aitem,.skr,.svr";
  /* Animated List v2: every row rises in the first time it scrolls on screen (Inventory, Spells, Actions, Features, Skills).
     A row is known by its text, so a redraw of the same list does not replay it. Full: a clear rise with a slight overshoot. Lite: a short soft one */
  var known=new Set(), batch=0, bT=0;
  var rio=new IntersectionObserver(function(es){ var i=0; es.forEach(function(en){ if(!en.isIntersecting) return; var r=en.target; rio.unobserve(r); if(MI.rm()) return;
      var k=(r.__miPg||"")+"|"+(r.textContent||"").replace(/\s+/g," ").slice(0,60); if(known.has(k)) return; known.add(k); if(known.size>4000) known.clear();
      var full=MI.full(), d=Math.min(i++,8)*(full?45:28);
      r.animate(full?[{opacity:0,transform:"translateY(28px) scale(.96)"},{opacity:1,transform:"translateY(-3px) scale(1.005)",offset:.7},{opacity:1,transform:"none"}]:[{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],
        {duration:full?520:280,delay:d,easing:full?"cubic-bezier(.2,.8,.2,1)":EASE,fill:"backwards"}); }); },{threshold:.12});
  function watchRows(id){ var s=document.getElementById(id); if(!s) return; var q=0;
    var scan=function(){ q=0; Array.prototype.forEach.call(s.querySelectorAll(ROWS),function(r){ if(r.__miW) return; r.__miW=1; r.__miPg=id; rio.observe(r); }); };
    new MutationObserver(function(){ if(!q){ q=1; (window.__miNF||setTimeout)(scan); } }).observe(s,{childList:true,subtree:true}); scan(); }
  setTimeout(function(){ ["p-actions","p-spells","p-inv","p-feat","p-skills"].forEach(watchRows); },1200);/* start after the app has settled which page shows */
  /* Scroll Reveal: description fields that hold text come up softly the first time they scroll into view */
  var rv={}, io2=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return; io2.unobserve(en.target); var k=en.target.textContent.slice(0,40); if(rv[k]||MI.rm()) return; rv[k]=1;
      en.target.animate([{opacity:0,transform:"translateY(14px)"},{opacity:1,transform:"none"}],{duration:420,easing:EASE,fill:"backwards"}); }); },{threshold:.15});
  function watchDesc(){ var d=document.getElementById("descBody"); if(!d) return; Array.prototype.forEach.call(d.querySelectorAll(".dfield:not(.empty)"),function(f){ if(!f.querySelector("textarea:focus,input:focus")) io2.observe(f); }); }
  var db=document.getElementById("descBody"); if(db){ new MutationObserver(watchDesc).observe(db,{childList:true}); watchDesc(); }
  /* Folder: a container closes by folding its rows up (copies, the app has already redrawn) and opens by springing them out */
  function rowsAfter(b){ var L=[], x=b.nextElementSibling; while(x&&!x.matches("[data-ctog]")&&x.matches(".irow,.isub")){ L.push(x); x=x.nextElementSibling; } return L; }
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#invBody [data-ctog]"); if(!b||MI.rm()) return; var k=b.getAttribute("data-ctog"), wasOpen=b.getAttribute("aria-expanded")==="true";
    var ghosts=wasOpen?rowsAfter(b).slice(0,10).map(function(r){ return MI.ghost(r); }).filter(Boolean):[];
    ghosts.forEach(function(g,i){ g.animate([{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-10px) scaleY(.85)"}],{duration:220,delay:(ghosts.length-1-i)*22,easing:"ease-in",fill:"forwards"}).onfinish=function(){ g.remove(); }; });
    requestAnimationFrame(function(){ var nb=null; Array.prototype.some.call(document.querySelectorAll("#invBody [data-ctog]"),function(x){ if(x.getAttribute("data-ctog")===k){ nb=x; return true; } }); if(!nb) return;
      nb.animate([{transform:"scale(.97)"},{transform:"scale(1.02)",offset:.5},{transform:"none"}],{duration:280,easing:EASE});
      if(nb.getAttribute("aria-expanded")==="true") rowsAfter(nb).slice(0,12).forEach(function(r,i){ r.animate([{opacity:0,transform:"translateY(-8px) scale(.98)"},{opacity:1,transform:"none"}],{duration:300,delay:40+i*30,easing:"cubic-bezier(.3,1.3,.5,1)",fill:"backwards"}); });
      MI.buzz("light"); }); },true);
  /* Tear Ticket: lowering an item's quantity tears a stub off the quantity box */
  window.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest('[data-iqd="-1"]'); if(!b||MI.rm()) return;/* window level: the app stops this click before the document */ var box=b.parentNode&&b.parentNode.querySelector("input"); if(!box||+box.value<1) return;
    var g1=MI.ghost(box), g2=MI.ghost(box); if(!g1||!g2) return; g1.style.clipPath="polygon(0 0,52% 0,46% 20%,54% 40%,46% 60%,54% 80%,48% 100%,0 100%)"; g2.style.clipPath="polygon(52% 0,100% 0,100% 100%,48% 100%,54% 80%,46% 60%,54% 40%,46% 20%)";
    g1.animate([{transform:"none",opacity:1},{transform:"translate(-14px,18px) rotate(-14deg)",opacity:0}],{duration:520,easing:"cubic-bezier(.4,0,.6,1)",fill:"forwards"}).onfinish=function(){ g1.remove(); };
    g2.animate([{transform:"none",opacity:1},{transform:"translate(14px,24px) rotate(12deg)",opacity:0}],{duration:520,easing:"cubic-bezier(.4,0,.6,1)",fill:"forwards"}).onfinish=function(){ g2.remove(); };
    MI.buzz("medium"); },true);
})();
/* === F5: Bell Toggle, STABLE / DEAD moments, Decay Card, loader, backup mark, echo numbers, peel, shredder; pause loops while scrolling === */
(function(){
  if(!document.body.animate) return; var html=document.documentElement, EASE="cubic-bezier(.2,.8,.2,1)";
  var st=0, sc=[];
  MI.on("scroll",function(){ if(!sc.length){ sc=Array.prototype.slice.call(document.querySelectorAll("#miAmb,#homeV:not([hidden]),.btn.pri.lvup,#insp[aria-pressed='true'],#vbInsp[aria-pressed='true']")); sc.forEach(function(x){ x.classList.add("mi-sc"); }); }
    clearTimeout(st); st=setTimeout(function(){ sc.forEach(function(x){ x.classList.remove("mi-sc"); }); sc=[]; },160); },true);
  /* the Star Border cover needs the colour really behind the tile (tiles can be transparent in a skin); kept on stable containers */
  function alpha(b){ var m=/rgba?\(([^)]+)\)/.exec(b||""); if(!m) return 0; var v=m[1].split(","); return v.length>3?+v[3]:1; }
  function solid(el){ while(el&&el!==document.documentElement){ var b=getComputedStyle(el).backgroundColor; if(alpha(b)>=.95) return b; el=el.parentElement; } return getComputedStyle(document.body).backgroundColor; }
  function covers(){ [["tiles","#insp"],["vbar","#vbInsp"]].forEach(function(p){ var box=document.getElementById(p[0]), t=document.querySelector(p[1]); if(!box||!t) return; var own=getComputedStyle(t).backgroundColor;
      box.style.setProperty("--mi-cover",solid(t.parentElement)); box.style.setProperty("--mi-tint",alpha(own)>0&&alpha(own)<.95?own:"transparent"); }); }
  covers(); new MutationObserver(function(){ requestAnimationFrame(covers); }).observe(html,{attributes:true,attributeFilter:["data-theme","data-skin","data-hc"]});
  /* Bell Toggle: the switch swings like a struck bell, with one ring */
  window.__miBell=function(el,col){ if(!el||MI.rm()) return; var r=el.getBoundingClientRect(); if(!r.width) return;
    el.animate([{transform:"rotate(0)"},{transform:"rotate(-14deg)"},{transform:"rotate(11deg)"},{transform:"rotate(-7deg)"},{transform:"rotate(4deg)"},{transform:"none"}],{duration:620,easing:"ease-out"});
    if(window.__miRing) window.__miRing(r.left+r.width/2,r.top+r.height/2,col||"#ffcf4a",Math.max(r.width,r.height)*1.6); MI.buzz("medium"); };
  MI.on("click",function(e){ var t=e.target.closest&&e.target.closest("#insp,#vbInsp"); if(!t||e.target.closest(".ib")) return; var id=t.id;
    setTimeout(function(){ var n=document.getElementById(id); if(n&&n.getAttribute("aria-pressed")==="true"){ window.__miBell(n,"#ffcf4a"); if(window.__miWow) window.__miWow.coin(n); } },30); },true);
  /* STABLE draws itself in, DEAD glitches; both once, when the state starts */
  var dsWas="";
  function dsCheck(){ var s=document.querySelector(".dsg-t b"), d=document.querySelector("#deadNote:not([hidden]) b"), k=d?"dead":(s&&/Stable/.test(s.textContent)?"stable":""); if(k===dsWas) return; dsWas=k; if(MI.rm()||!k) return;
    if(window.__miWow&&window.__miWow.ds) window.__miWow.ds(k);
    if(k==="stable"){ var g=MI.ghost(s); if(!g) return; g.style.background="transparent"; g.style.color="transparent"; g.style.webkitTextStroke="1px #4cc27a"; g.style.clipPath="inset(0 100% 0 0)";
      g.animate([{clipPath:"inset(0 100% 0 0)"},{clipPath:"inset(0 0 0 0)",offset:.6},{clipPath:"inset(0 0 0 0)",opacity:1},{opacity:0}],{duration:1100,easing:"ease-out",fill:"forwards"}).onfinish=function(){ g.remove(); };
      s.animate([{opacity:0},{opacity:0,offset:.45},{opacity:1}],{duration:900}); }
    else { var a=MI.ghost(d), b=MI.ghost(d); [a,b].forEach(function(g,i){ if(!g) return; g.style.background="transparent"; g.style.color=i?"#00e5ff":"#ff3355"; g.style.mixBlendMode="screen";
        g.animate([0,1,2,3,4,5,6,7,8].map(function(f){ return {transform:"translate("+((Math.random()-.5)*(f<8?10:0))+"px,"+((Math.random()-.5)*(f<8?3:0))+"px)",clipPath:"inset("+(Math.random()*60|0)+"% 0 "+(Math.random()*30|0)+"% 0)"}; }),{duration:900,easing:"steps(9,end)",fill:"forwards"}).onfinish=function(){ g.remove(); }; });
      d.animate([{transform:"translateX(-3px)"},{transform:"translateX(3px)"},{transform:"translateX(-2px)"},{transform:"none"}],{duration:300,iterations:2}); } }
  var dg=document.getElementById("death"); if(dg) new MutationObserver(function(){ requestAnimationFrame(dsCheck); }).observe(dg,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]});
  /* Decay Card: when a held Delete goes through, the card crumbles (a copy shrinks, blurs and sheds dust) */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#homeV [data-hdel]"); if(!b||b.dataset.heldDone!=="1"||MI.rm()) return; var card=b.closest(".hcard"), g=MI.ghost(card); if(!g) return; var r=card.getBoundingClientRect();
    g.style.overflow="hidden"; g.animate([{transform:"none",opacity:1},{transform:"translateY(6px) scale(.97)",opacity:.8,offset:.35},{transform:"translateY(26px) scale(.9) rotate(-1.5deg)",opacity:0}],{duration:700,easing:"ease-in",fill:"forwards"}).onfinish=function(){ g.remove(); };
    if(window.__miBurst) for(var k=0;k<3;k++) window.__miBurst(r.left+r.width*(.2+.3*k),r.top+r.height*.6,{n:7,colors:["#8a8f96","#5d636b","#b9bec5"],dist:60,dur:900,grav:true}); MI.buzz("heavy"); },true);
  /* Lattice Loader in the Building PDF box */
  var sp=document.querySelector(".busy .spin"); if(sp){ sp.classList.add("mi-lat"); sp.innerHTML=[0,1,2,3,4,5,6,7,8].map(function(i){ return '<i style="animation-delay:'+(((i%3)+((i/3)|0))*90)+'ms"></i>'; }).join(""); }
  /* Status Mark on Back Up: a ring turns into an arc, then a check */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest('[data-hbk="out"]'); if(!b||MI.rm()) return; var ic=b.querySelector("svg")||b, r=ic.getBoundingClientRect(); if(!r.width) return;
    var m=document.createElementNS("http://www.w3.org/2000/svg","svg"); m.setAttribute("viewBox","0 0 24 24"); m.setAttribute("class","mi-sm"); m.style.left=(r.left+r.width/2-11)+"px"; m.style.top=(r.top+r.height/2-11)+"px"; m.style.color=getComputedStyle(b).color;
    m.innerHTML='<circle cx="12" cy="12" r="9" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/><path d="M7.5 12.5l3 3 6-6.5" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"/>'; document.body.appendChild(m);
    var c=m.querySelector("circle"), p=m.querySelector("path"); ic.style.opacity="0";
    c.animate([{strokeDashoffset:100},{strokeDashoffset:0}],{duration:600,easing:"ease-in-out",fill:"forwards"});
    p.animate([{strokeDashoffset:100},{strokeDashoffset:0}],{duration:320,delay:560,easing:EASE,fill:"forwards"});
    m.animate([{opacity:1},{opacity:1,offset:.8},{opacity:0}],{duration:1500,fill:"forwards"}).onfinish=function(){ m.remove(); ic.style.opacity=""; }; setTimeout(function(){ m.remove(); ic.style.opacity=""; },1800); },true);
  /* Echo Text: the rising Hit Point number leaves two fading echoes */
  window.__miEcho=function(f){ if(!MI.full()) return; var a=f.getAnimations&&f.getAnimations()[0]; if(!a) return; var kf=a.effect.getKeyframes(), t=a.effect.getTiming();
    [1,2].forEach(function(n){ var e=f.cloneNode(true); e.style.opacity=""; document.body.appendChild(e);
      var an=e.animate(kf.map(function(k){ var o={transform:k.transform,offset:k.offset}; if(k.opacity!=null) o.opacity=k.opacity*(n===1?.45:.22); return o; }),{duration:t.duration,easing:t.easing,delay:n*70,fill:"both"}); an.onfinish=function(){ e.remove(); }; setTimeout(function(){ e.remove(); },1600); }); };
  /* Sticker Peel: a condition removed in the dialog peels off the sheet when the dialog closes */
  var peel=[];
  MI.on("click",function(e){ var c=e.target.closest&&e.target.closest("#sheetBody [data-c]"); if(!c||MI.rm()) return; var k=c.getAttribute("data-c");
    var chip=document.querySelector('#conds .chip.on[data-info="g:'+CSS.escape(k)+'"]'); if(!chip) return; var g=MI.ghost(chip); if(!g) return; g.style.visibility="hidden"; peel.push(g); },true);
  var sh=document.getElementById("sheet"); if(sh) new MutationObserver(function(){ if(sh.classList.contains("on")||!peel.length) return; var L=peel; peel=[];
    L.forEach(function(g,i){ g.style.visibility=""; g.style.transformOrigin="0 0"; g.style.boxShadow="0 6px 14px rgba(0,0,0,.35)";
      g.animate([{transform:"none",opacity:1},{transform:"rotate(-8deg) translate(4px,-6px) scale(1.04)",opacity:1,offset:.3},{transform:"rotate(-28deg) translate(30px,40px) scale(.9)",opacity:0}],{duration:650,delay:180+i*90,easing:"cubic-bezier(.4,0,.7,1)",fill:"both"}).onfinish=function(){ g.remove(); }; }); }).observe(sh,{attributes:true,attributeFilter:["class"]});
  /* Shredder: Remove Item in Manage Inventory cuts the row into falling strips */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("[data-irm],[data-idel]"); if(!b||MI.rm()) return; var row=b.closest(".imr,.irow,.icard,li,.mrow")||b.parentNode; var r=row.getBoundingClientRect(); if(!r.width) return; var N=6;
    for(var i=0;i<N;i++){ var g=MI.ghost(row); if(!g) return; var a=(i*100/N).toFixed(1), z=((i+1)*100/N).toFixed(1); g.style.clipPath="inset(0 "+(100-z)+"% 0 "+a+"%)";
      g.animate([{transform:"none",opacity:1},{transform:"translateY("+(30+Math.random()*30)+"px) rotate("+((Math.random()-.5)*10)+"deg)",opacity:0}],{duration:520,delay:i*35,easing:"ease-in",fill:"both"}).onfinish=(function(g){ return function(){ g.remove(); }; })(g); }
    MI.buzz("medium"); },true);
})();

/* --- F6.2: warm tooltip (mouse only). One pooled bubble replaces the native title. --- */
(function(){
  if(!window.__MI||!document.body||!(window.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
  var MI=window.__MI, tip=null, cur=null, tm=0;
  function hide(){ clearTimeout(tm); cur=null; if(tip) tip.classList.remove("on"); }
  MI.on("pointerover",function(e){ if(e.pointerType!=="mouse") return; var t=e.target.closest&&(e.target.closest("header.band button,header.band a,#moreMenu button")||e.target.closest("[title],[data-mi-tip]")); if(!t||t===cur||t.closest("svg")&&!t.closest("button")) return;
    if(!t.hasAttribute("data-mi-tip")){ var s=t.getAttribute("title")||t.getAttribute("aria-label")||(t.textContent||"").replace(/\s+/g," ").trim(); if(!s) return;
      t.setAttribute("data-mi-tip",s); if(t.hasAttribute("title")) t.removeAttribute("title");
      if(!t.hasAttribute("aria-label")&&!(t.textContent||"").trim()) t.setAttribute("aria-label",s); }/* every button in the top bar gets a tip: its title, else its label, else its text */
    hide(); cur=t; tm=setTimeout(function(){ if(cur!==t||!t.isConnected) return;
      if(!tip){ tip=document.createElement("div"); tip.className="mi-tip"; tip.setAttribute("aria-hidden","true"); document.body.appendChild(tip); }
      tip.textContent=t.getAttribute("data-mi-tip"); var r=t.getBoundingClientRect(), w=tip.offsetWidth, h=tip.offsetHeight, x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)), y=r.top-h-10, up=y>8; if(!up) y=r.bottom+10;
      tip.style.left=x+"px"; tip.style.top=y+"px"; tip.classList.toggle("dn",!up); tip.style.setProperty("--ax",(r.left+r.width/2-x)+"px"); tip.classList.add("on"); },380); },true);
  MI.on("pointerout",function(e){ if(cur&&(!e.relatedTarget||!cur.contains(e.relatedTarget))) hide(); },true);
  MI.on("pointerdown",hide,true); MI.on("scroll",hide,true); MI.on("keydown",hide,true);
})();

/* --- Builder: answer the tap at once. A cover paints first, then the builder is built under it, then it slides in. --- */
(function(){
  var MI=window.__MI; if(!MI||!document.body.animate) return;
  var T0=Date.now();
  function wrap(){ var o=window.__bldOpen; if(!o||o.__mi) return; var w=function(){ var self=this, a=arguments, bd=document.getElementById("bld");
      if(MI.rm()||!bd||!bd.hidden) return o.apply(self,a);
      if(Date.now()-T0<3000){ var res=o.apply(self,a); if(window.__miWow&&window.__miWow.welcome) window.__miWow.welcome(); return res; }/* at start-up (a new character) the app opens the Builder itself, in order: never delay that, only greet */
      var cv=document.createElement("div"); cv.className="mi-bcov"; cv.setAttribute("aria-hidden","true"); cv.innerHTML="<i></i><i></i><i></i>"; document.body.appendChild(cv);
      cv.animate([{opacity:0},{opacity:1}],{duration:140,fill:"forwards"});
      __miNF(function(){ setTimeout(function(){ try{ o.apply(self,a); }finally{
        bd.animate([{opacity:0,transform:"translateY(22px) scale(.99)"},{opacity:1,transform:"none"}],{duration:380,easing:"cubic-bezier(.2,.8,.2,1)"});
        cv.animate([{opacity:1},{opacity:0}],{duration:260,fill:"forwards"}).onfinish=function(){ cv.remove(); }; setTimeout(function(){ cv.remove(); },1500); } },0); }); };
    w.__mi=1; window.__bldOpen=w; }
  if(document.readyState==="complete") wrap(); else window.addEventListener("load",wrap); setTimeout(wrap,1500);
})();

