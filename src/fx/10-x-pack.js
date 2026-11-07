/* === X pack: more screen-wide moments. Same rules as the WOW pack. === */
(function(){
  const MI=FXENV.__MI, W=FXENV.__miWow; if(!MI||!W||!document.body.animate) return;
  function full(){ return MI.full(); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function add(cls,html){ const e=document.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; document.body.appendChild(e); setTimeout(() =>{ rm(e); },2600); return e; }
  function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function nf(fn){ (FXENV.__miNF||setTimeout)(fn); }
  function later(fn){ nf(() =>{ nf(fn); }); }
  let FL=null;
  function flash(bg,peak,dur){ if(!full()) return; if(!FL){ FL=document.createElement("div"); FL.className="mi-flash mi-flash2"; FL.setAttribute("aria-hidden","true"); document.body.appendChild(FL); }
    FL.style.background=bg; FL.getAnimations().forEach((a) =>{ a.cancel(); }); FL.animate([{opacity:0},{opacity:peak,offset:.2},{opacity:0}],{duration:dur,easing:"ease-out"}); }
  function edge(rgb,a){ return "radial-gradient(ellipse at center,transparent 38%,rgba("+rgb+","+a+") 100%)"; }
  function hpBox(){ const b=document.getElementById("hpBox"); return b&&b.getClientRects().length?b:document.getElementById("vbHp"); }
  function sweep(cls,txt,dir){ const s=add("mi-sweep "+cls,txt?"<b>"+txt+"</b>":""); const a=dir<0?["110vw","-110vw"]:["-110vw","110vw"];
    s.animate([{transform:"translateX("+a[0]+") skewX(-14deg)",opacity:0},{transform:"translateX(0) skewX(-14deg)",opacity:1,offset:.42},{transform:"translateX(0) skewX(-14deg)",opacity:1,offset:.58},{transform:"translateX("+a[1]+") skewX(-14deg)",opacity:0}],{duration:900,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ rm(s); }; }

  /* X1 Hit Points fall to 0: the edges close in dark and the screen beats twice. X2 back up from 0: a column of gold light rises */
  let hb=document.getElementById("hpBox"), was0=hb?hb.classList.contains("hp0"):false;
  if(hb) new MutationObserver(() =>{ const z=hb.classList.contains("hp0"); if(z===was0) return; const from0=was0; was0=z; if(!full()) return; const box=hpBox(); if(!box) return; const p=C(box);
      if(z){ flash("radial-gradient(ellipse at center,rgba(0,0,0,.25) 30%,rgba(120,0,0,.85) 100%)",.95,1400); setTimeout(() =>{ flash(edge("200,20,20",.8),.8,700); },520);
        box.animate([{transform:"none"},{transform:"translateY(10px) scale(.97)",offset:.25},{transform:"translateY(-3px)",offset:.55},{transform:"none"}],{duration:620,easing:"cubic-bezier(.2,.7,.3,1)"}); MI.buzz("heavy"); }
      else if(from0){ const col=add("mi-revive"); col.style.left=p.x+"px"; col.style.top=p.y+"px";
        col.animate([{transform:"translate(-50%,-100%) scaleY(.1)",opacity:0},{transform:"translate(-50%,-100%) scaleY(1)",opacity:1,offset:.35},{transform:"translate(-50%,-110%) scaleY(1.1)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(col); };
        flash(edge("255,201,60",.55),.7,900); if(FXENV.__miBurst) FXENV.__miBurst(p.x,p.y,{n:16,colors:["#ffd166","#fff3b0","#4cc27a"],shape:"mi-star",dist:110,dur:1100}); MI.buzz("success"); } }).observe(hb,{attributes:true,attributeFilter:["class"]});

  /* X3 Temporary Hit Points go up: a blue shield ring closes round the box and a sheen crosses it */
  let tmpPrev=null; function tmpVal(){ const t=document.getElementById("tmpV"); return t?(+t.value||0):0; } tmpPrev=tmpVal();
  function tmpCheck(){ const v=tmpVal(); if(tmpPrev!=null&&v>tmpPrev&&full()){ const box=hpBox(); if(box){ const p=C(box), s=add("mi-shield"); s.style.left=p.r.left+"px"; s.style.top=p.r.top+"px"; s.style.width=p.r.width+"px"; s.style.height=p.r.height+"px";
        s.animate([{transform:"scale(1.15)",opacity:0},{transform:"scale(1)",opacity:1,offset:.4},{transform:"scale(1.02)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(s); };
        if(FXENV.__miRing) FXENV.__miRing(p.x,p.y,"#7cb6ff",Math.max(p.r.width,p.r.height)); MI.buzz("medium"); } } tmpPrev=v; }
  MI.on("click",(e) =>{ if(e.target.closest&&e.target.closest("[data-tmp],[data-tmpapply],[data-tmpset],[data-tmproll],[data-tmpdice]")) later(tmpCheck); },true);
  MI.on("change",(e) =>{ if(e.target&&e.target.id==="tmpV") later(tmpCheck); },true);

  /* X4 Combat View opens: a blade sweeps across the screen. X5 End Turn: a band sweeps with Next Turn. X6 Use: a hit from the button */
  let sh=document.getElementById("sheet"), cbvWas=false;
  const cbvChk=function(){ const on=!!document.querySelector("#sheet.on #cbv"); if(on&&!cbvWas&&full()){ sweep("mi-blade","",1); flash(edge("229,57,53",.6),.6,700); MI.buzz("medium"); } cbvWas=on; }; if(sh){ const cbvMO=new MutationObserver(cbvChk); cbvMO.observe(sh,{attributes:true,attributeFilter:["class"]}); const sbd=document.getElementById("sheetBody"); if(sbd) cbvMO.observe(sbd,{childList:true}); }
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-cmbturn]"); if(!t||!full()) return; sweep("mi-turn","Next Turn",1); MI.buzz("medium"); },true);
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-cmbuse]"); if(!t||!full()) return; const p=C(t);
    if(FXENV.__miRing) FXENV.__miRing(p.x,p.y,"#ff8a3d",140); if(FXENV.__miBurst) FXENV.__miBurst(p.x,p.y,{n:14,colors:["#ff8a3d","#ffd166","#ffffff"],shape:"mi-spark",dist:80,dur:650}); flash(edge("255,138,61",.45),.5,600); MI.buzz("heavy"); },true);

  /* X7 Apply to Sheet: a wave of light crosses the screen and a check lands in the middle */
  let apWait=null;
  MI.on("click",(e) =>{ if(apWait&&e.target.closest&&e.target.closest("button")===apWait){ apWait=null; later(applyFx); return; } const t=e.target.closest&&e.target.closest("#b-toSheet"); if(!t||!full()) return;
    later(() =>{ let ok=null; Array.prototype.some.call(document.querySelectorAll("#bld button,.ask button,[role=dialog] button"),(b) =>{ if(b!==t&&b.getClientRects().length&&/^\s*Apply\s*$/i.test(b.textContent)){ ok=b; return true; } });
      if(ok){ apWait=ok; setTimeout(() =>{ if(apWait===ok) apWait=null; },30000); } else applyFx(); }); },true);/* when the app asks first, the moment waits for your Apply */
  function applyFx(){ if(!full()) return; (function(){ sweep("mi-wave","",1); const k=add("mi-check",'<svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="23"/><path d="M15 27l7 7 15-16"/></svg>'); k.style.left=innerWidth/2+"px"; k.style.top=innerHeight*.42+"px";
      k.animate([{transform:"translate(-50%,-50%) scale(2.2)",opacity:0},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.35},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.75},{transform:"translate(-50%,-50%) scale(.9)",opacity:0}],{duration:1200,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(k); }; MI.buzz("success"); })(); }

  /* X8 a new character: the Builder greets you, its parts rise in one after another */
  W.welcome=function(){ if(!full()) return; later(() =>{ const b=document.getElementById("body")||document.getElementById("bld"); if(!b) return; let i=0;
    Array.prototype.slice.call(b.children,0,10).forEach((c) =>{ if(!c.getClientRects().length) return; c.animate([{opacity:0,transform:"translateY(18px)"},{opacity:1,transform:"none"}],{duration:420,delay:120+i*60,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); i++; });
    flash(edge("124,182,255",.4),.6,900); }); };

  /* X9 DEAD: the screen fades to a grey dark, once. STABLE: one calm blue breath */
  W.ds=function(k){ if(!full()) return; if(k==="dead") flash("radial-gradient(ellipse at center,rgba(20,20,24,.55) 20%,rgba(10,10,12,.92) 100%)",1,2200); else if(k==="stable") flash(edge("124,182,255",.55),.7,1400); };

  /* X10 Exhaustion goes up a level: a dark pulse and the chip shudders */
  let cd=document.getElementById("conds"), exPrev=null; function exLv(){ const e=cd&&cd.querySelector(".exh-c"); const m=e&&/(\d+)/.exec(e.textContent); return m?+m[1]:0; } exPrev=exLv();
  if(cd) new MutationObserver(() =>{ const v=exLv(); if(exPrev!=null&&v>exPrev&&full()){ flash("radial-gradient(ellipse at center,transparent 30%,rgba(40,10,10,.8) 100%)",.8,900); const e=cd.querySelector(".exh-c"); if(e) e.animate([{transform:"none"},{transform:"translateX(-5px) rotate(-3deg)"},{transform:"translateX(5px) rotate(3deg)"},{transform:"translateX(-3px)"},{transform:"none"}],{duration:420}); MI.buzz("heavy"); } exPrev=v; }).observe(cd,{childList:true,subtree:true,characterData:true});

  /* X11 Undo: a short grey flash and the undo arrow spins back */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest(".tundo"); if(!t||!full()) return; const ic=t.querySelector("svg"); if(ic) ic.animate([{transform:"rotate(0)"},{transform:"rotate(-360deg)"}],{duration:520,easing:"cubic-bezier(.2,.8,.2,1)"});
    flash(edge("160,170,180",.45),.55,500); MI.buzz("light"); },true);

  /* X12 Concentration breaks: the blue ring shatters into shards */
  W.concBreak=function(){ if(!full()) return; let box=document.getElementById("vbConc"); box=(box&&box.getClientRects().length)?box:(hpBox()||document.body); const p=C(box);
    for(let i=0;i<12;i++){ const s=add("mi-shard"), a=Math.PI*2*i/12+(Math.random()-.5)*.4, d=60+Math.random()*60;
      s.animate([{transform:"translate("+p.x+"px,"+p.y+"px) rotate("+(a*57)+"deg) scale(1)",opacity:1},{transform:"translate("+(p.x+Math.cos(a)*d)+"px,"+(p.y+Math.sin(a)*d+30)+"px) rotate("+(a*57+180)+"deg) scale(.4)",opacity:0}],{duration:700+Math.random()*300,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=(function(s){ return function(){ rm(s); }; })(s); }
    flash(edge("124,182,255",.45),.5,600); MI.buzz("medium"); };

  /* X13 page depth: where the browser runs scroll-linked animation itself, a page title trails its page during a swipe */
  /* turned off: on some phones the scroll timeline left the page titles part way off screen at rest */
})();

