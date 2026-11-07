/* === D pack: the last two from the catalog, and D&D moments. Same strict rules. === */
(function(){
  const MI=FXENV.__MI; if(!MI||!document.body.animate) return;
  function full(){ return MI.full(); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function add(cls,html){ const e=document.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; document.body.appendChild(e); setTimeout(() =>{ rm(e); },2600); return e; }
  function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function nf(fn){ (FXENV.__miNF||setTimeout)(fn); }
  function later(fn){ nf(() =>{ nf(fn); }); }

  /* D1 Split Text: "My Characters" comes in letter by letter. D2 Shiny Text: a light passes once over Create */
  let hv=document.getElementById("homeV"), hq=0;
  function homeFx(){ hq=0; if(!hv||hv.hidden||MI.rm()) return; const h=hv.querySelector(".hhead h1"); if(h&&!h.__miSplit){ h.__miSplit=1; const t=h.textContent;
      h.setAttribute("aria-label",t); h.innerHTML=t.split("").map((ch,i) =>{ return '<span class="mi-ch" aria-hidden="true" style="--i:'+i+'">'+(ch===" "?"&nbsp;":ch.replace(/[&<>]/g,""))+'</span>'; }).join(""); }
    const b=hv.querySelector(".hcreate"); if(b&&!b.__miShine){ b.__miShine=1; b.classList.add("mi-shine"); } }
  if(hv){ new MutationObserver(() =>{ if(!hq){ hq=1; nf(homeFx); } }).observe(hv,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]}); homeFx(); }

  /* D3 last slot of a level spent: the row's candles go out together and a label says so */
  FXENV.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".spsl .bx[data-k]"); if(!b||!full()) return; const k=b.getAttribute("data-k");
    later(() =>{ const all=document.querySelectorAll('.spsl .bx[data-k="'+CSS.escape(k)+'"]'), vis=Array.prototype.filter.call(all,(x) =>{ return x.getClientRects().length; });
      if(!vis.length||!vis.every((x) =>{ return x.getAttribute("aria-pressed")==="true"; })) return;
      const row=vis[0].closest(".spsl"), p=C(row), lv=/^s(\d)/.exec(k), txt=lv?"Level "+lv[1]+" slots spent":(k==="pact"?"Pact slots spent":"All spent");
      vis.forEach((x,i) =>{ x.animate([{transform:"none",opacity:1},{transform:"translateY(-3px) scale(.85)",opacity:.5,offset:.4},{transform:"none",opacity:1}],{duration:520,delay:i*60,easing:"ease-out"}); });
      for(let i=0;i<8;i++){ const s=add("mi-puff"), x=p.r.left+Math.random()*p.r.width; s.animate([{transform:"translate("+x+"px,"+p.y+"px) scale(.5)",opacity:0},{transform:"translate("+(x+(Math.random()-.5)*14)+"px,"+(p.y-26)+"px) scale(1)",opacity:.75,offset:.35},{transform:"translate("+(x+(Math.random()-.5)*24)+"px,"+(p.y-60)+"px) scale(1.4)",opacity:0}],{duration:1100,delay:i*50,easing:"ease-out",fill:"backwards"}).onfinish=(function(s){ return function(){ rm(s); }; })(s); }
      const l=add("mi-spent","<b>"+txt+"</b>"); l.style.left=p.x+"px"; l.style.top=(p.r.top-8)+"px";
      l.animate([{transform:"translate(-50%,-100%) translateY(8px)",opacity:0},{transform:"translate(-50%,-100%)",opacity:1,offset:.2},{transform:"translate(-50%,-100%)",opacity:1,offset:.8},{transform:"translate(-50%,-100%) translateY(-6px)",opacity:0}],{duration:1600,easing:"ease-out"}).onfinish=function(){ rm(l); };
      MI.buzz("medium"); }); },true);

  /* D4 a magic item attuned: its slot is bound with an arcane circle and sparks */
  let aPrev=null, aq=0; function aCount(){ return document.querySelectorAll(".islots .islot.on").length; }
  function aCheck(){ aq=0; const n=aCount(); if(aPrev!=null&&n>aPrev&&full()){ const all=document.querySelectorAll(".islots .islot.on"), el=all[all.length-1]; if(el&&el.getClientRects().length){ const p=C(el);
        if(FXENV.__miWow&&FXENV.__miWow.cast) FXENV.__miWow.cast(p.x,p.y); if(FXENV.__miBurst) FXENV.__miBurst(p.x,p.y,{n:12,colors:["#b388ff","#e1d5ff","#ffd166"],shape:"mi-star",dist:60,dur:800});
        el.animate([{transform:"scale(.9)"},{transform:"scale(1.08)",offset:.5},{transform:"none"}],{duration:480,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("success"); } }
    aPrev=n; }
  const inv=document.getElementById("p-inv")||document.getElementById("app"); if(inv){ new MutationObserver(() =>{ if(!aq){ aq=1; nf(aCheck); } }).observe(inv,{childList:true,subtree:true}); aPrev=aCount(); }

  /* D5 a Hit Die chosen in the Short Rest: a die tumbles up out of its box */
  let hdP=null;/* the app redraws the box on pointer-down, so its place is taken then */
  FXENV.addEventListener("pointerdown",(e) =>{ const b=e.target.closest&&e.target.closest(".bx[data-hdk]"); hdP=b&&b.getAttribute("aria-pressed")!=="true"?{k:b.getAttribute("data-hdk"),p:C(b),t:Date.now()}:null; },true);
  FXENV.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".bx[data-hdk]"); if(!b||!full()) return; let src=hdP&&Date.now()-hdP.t<1500?hdP:null; hdP=null;
    if(!src){ if(!b.isConnected||b.getAttribute("aria-pressed")==="true") return; src={k:b.getAttribute("data-hdk"),p:C(b)}; }
    const k=src.k, m=/d(\d+)/.exec(k||""), sz=m?m[1]:"", p=src.p;
    later(() =>{ const d=add("mi-die","<b>"+(sz?"d"+sz:"HD")+"</b>"); d.style.left=p.x+"px"; d.style.top=p.y+"px";
      d.animate([{transform:"translate(-50%,-50%) translateY(0) rotateX(0) rotateZ(0) scale(.6)",opacity:0},{transform:"translate(-50%,-50%) translateY(-46px) rotateX(360deg) rotateZ(90deg) scale(1.1)",opacity:1,offset:.5},{transform:"translate(-50%,-50%) translateY(-58px) rotateX(540deg) rotateZ(120deg) scale(1)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(d); }; }); },true);
})();

