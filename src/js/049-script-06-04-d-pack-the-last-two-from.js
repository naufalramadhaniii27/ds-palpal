/* === D pack: the last two from the catalog, and D&D moments. Same strict rules. === */
(function(){
  var MI=window.__MI; if(!MI||!document.body.animate) return;
  function full(){ return MI.full(); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function add(cls,html){ var e=document.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; document.body.appendChild(e); setTimeout(function(){ rm(e); },2600); return e; }
  function C(el){ var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function nf(fn){ (window.__miNF||setTimeout)(fn); }
  function later(fn){ nf(function(){ nf(fn); }); }

  /* D1 Split Text: "My Characters" comes in letter by letter. D2 Shiny Text: a light passes once over Create */
  var hv=document.getElementById("homeV"), hq=0;
  function homeFx(){ hq=0; if(!hv||hv.hidden||MI.rm()) return; var h=hv.querySelector(".hhead h1"); if(h&&!h.__miSplit){ h.__miSplit=1; var t=h.textContent;
      h.setAttribute("aria-label",t); h.innerHTML=t.split("").map(function(ch,i){ return '<span class="mi-ch" aria-hidden="true" style="--i:'+i+'">'+(ch===" "?"&nbsp;":ch.replace(/[&<>]/g,""))+'</span>'; }).join(""); }
    var b=hv.querySelector(".hcreate"); if(b&&!b.__miShine){ b.__miShine=1; b.classList.add("mi-shine"); } }
  if(hv){ new MutationObserver(function(){ if(!hq){ hq=1; nf(homeFx); } }).observe(hv,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden"]}); homeFx(); }

  /* D3 last slot of a level spent: the row's candles go out together and a label says so */
  window.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest(".spsl .bx[data-k]"); if(!b||!full()) return; var k=b.getAttribute("data-k");
    later(function(){ var all=document.querySelectorAll('.spsl .bx[data-k="'+CSS.escape(k)+'"]'), vis=Array.prototype.filter.call(all,function(x){ return x.getClientRects().length; });
      if(!vis.length||!vis.every(function(x){ return x.getAttribute("aria-pressed")==="true"; })) return;
      var row=vis[0].closest(".spsl"), p=C(row), lv=/^s(\d)/.exec(k), txt=lv?"Level "+lv[1]+" slots spent":(k==="pact"?"Pact slots spent":"All spent");
      vis.forEach(function(x,i){ x.animate([{transform:"none",opacity:1},{transform:"translateY(-3px) scale(.85)",opacity:.5,offset:.4},{transform:"none",opacity:1}],{duration:520,delay:i*60,easing:"ease-out"}); });
      for(var i=0;i<8;i++){ var s=add("mi-puff"), x=p.r.left+Math.random()*p.r.width; s.animate([{transform:"translate("+x+"px,"+p.y+"px) scale(.5)",opacity:0},{transform:"translate("+(x+(Math.random()-.5)*14)+"px,"+(p.y-26)+"px) scale(1)",opacity:.75,offset:.35},{transform:"translate("+(x+(Math.random()-.5)*24)+"px,"+(p.y-60)+"px) scale(1.4)",opacity:0}],{duration:1100,delay:i*50,easing:"ease-out",fill:"backwards"}).onfinish=(function(s){ return function(){ rm(s); }; })(s); }
      var l=add("mi-spent","<b>"+txt+"</b>"); l.style.left=p.x+"px"; l.style.top=(p.r.top-8)+"px";
      l.animate([{transform:"translate(-50%,-100%) translateY(8px)",opacity:0},{transform:"translate(-50%,-100%)",opacity:1,offset:.2},{transform:"translate(-50%,-100%)",opacity:1,offset:.8},{transform:"translate(-50%,-100%) translateY(-6px)",opacity:0}],{duration:1600,easing:"ease-out"}).onfinish=function(){ rm(l); };
      MI.buzz("medium"); }); },true);

  /* D4 a magic item attuned: its slot is bound with an arcane circle and sparks */
  var aPrev=null, aq=0; function aCount(){ return document.querySelectorAll(".islots .islot.on").length; }
  function aCheck(){ aq=0; var n=aCount(); if(aPrev!=null&&n>aPrev&&full()){ var all=document.querySelectorAll(".islots .islot.on"), el=all[all.length-1]; if(el&&el.getClientRects().length){ var p=C(el);
        if(window.__miWow&&window.__miWow.cast) window.__miWow.cast(p.x,p.y); if(window.__miBurst) window.__miBurst(p.x,p.y,{n:12,colors:["#b388ff","#e1d5ff","#ffd166"],shape:"mi-star",dist:60,dur:800});
        el.animate([{transform:"scale(.9)"},{transform:"scale(1.08)",offset:.5},{transform:"none"}],{duration:480,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("success"); } }
    aPrev=n; }
  var inv=document.getElementById("p-inv")||document.getElementById("app"); if(inv){ new MutationObserver(function(){ if(!aq){ aq=1; nf(aCheck); } }).observe(inv,{childList:true,subtree:true}); aPrev=aCount(); }

  /* D5 a Hit Die chosen in the Short Rest: a die tumbles up out of its box */
  var hdP=null;/* the app redraws the box on pointer-down, so its place is taken then */
  window.addEventListener("pointerdown",function(e){ var b=e.target.closest&&e.target.closest(".bx[data-hdk]"); hdP=b&&b.getAttribute("aria-pressed")!=="true"?{k:b.getAttribute("data-hdk"),p:C(b),t:Date.now()}:null; },true);
  window.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest(".bx[data-hdk]"); if(!b||!full()) return; var src=hdP&&Date.now()-hdP.t<1500?hdP:null; hdP=null;
    if(!src){ if(!b.isConnected||b.getAttribute("aria-pressed")==="true") return; src={k:b.getAttribute("data-hdk"),p:C(b)}; }
    var k=src.k, m=/d(\d+)/.exec(k||""), sz=m?m[1]:"", p=src.p;
    later(function(){ var d=add("mi-die","<b>"+(sz?"d"+sz:"HD")+"</b>"); d.style.left=p.x+"px"; d.style.top=p.y+"px";
      d.animate([{transform:"translate(-50%,-50%) translateY(0) rotateX(0) rotateZ(0) scale(.6)",opacity:0},{transform:"translate(-50%,-50%) translateY(-46px) rotateX(360deg) rotateZ(90deg) scale(1.1)",opacity:1,offset:.5},{transform:"translate(-50%,-50%) translateY(-58px) rotateX(540deg) rotateZ(120deg) scale(1)",opacity:0}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(d); }; }); },true);
})();

/* === Mini window v2: a cleaner, card-based layout and its own small motion. Only styling and grouping; the app keeps every id and button === */
(function(){
  var CSS=[
  'body{padding:12px;gap:10px;background:radial-gradient(130% 55% at 50% -12%,color-mix(in srgb,var(--acc) 16%,transparent),transparent 62%),var(--paper);min-height:100vh}',
  '::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:color-mix(in srgb,var(--ink) 22%,transparent);border-radius:9px}::-webkit-scrollbar-track{background:transparent}',
  '.pp-hero,.pp-ctrl,#ppCond,#ppCmb{position:relative;border-radius:16px;background:linear-gradient(165deg,color-mix(in srgb,var(--panel) 90%,#fff 10%),var(--panel) 55%);border:1px solid color-mix(in srgb,var(--line-2) 80%,transparent);box-shadow:0 10px 28px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.06)}',
  '.pp-hero{padding:12px 14px 14px;overflow:hidden}',
  '.pp-fl{position:absolute;inset:0;pointer-events:none;opacity:0;border-radius:inherit}',
  '.pp-hp{gap:6px}.pp-hp svg{width:20px;height:20px}.pp-hp b{font:800 54px/.9 var(--f-nar);letter-spacing:-.02em;display:inline-block;transform-origin:50% 80%}.pp-hp>span{font:700 18px/1 var(--f-nar)}',
  '.pp-tmp{padding:3px 8px;border-radius:999px;background:color-mix(in srgb,#7fb2ff 18%,transparent);font-size:13px}.pp-tmp:empty{display:none}',
  '.pp-ac{flex-direction:column;gap:2px;padding:6px 12px 7px;border-radius:12px;background:color-mix(in srgb,var(--panel-2) 85%,transparent);border-color:color-mix(in srgb,var(--line-2) 70%,transparent);font-size:24px;line-height:1}.pp-ac svg{width:14px;height:14px}.pp-ac::after{content:"AC";font:700 9px/1 var(--f-nar);letter-spacing:.12em;color:var(--muted)}',
  '.pp-bar{height:10px;margin-top:12px;border-radius:999px;background:color-mix(in srgb,var(--ink) 10%,transparent)}.pp-bar i{border-radius:999px;transition:transform .45s cubic-bezier(.2,.8,.2,1),background-color .3s}.pp-bar i::after{content:"";position:absolute;inset:0;border-radius:inherit;background:linear-gradient(180deg,rgba(255,255,255,.38),rgba(255,255,255,0) 65%)}',
  '.pp-ctrl{display:flex;flex-direction:column;gap:8px;padding:10px}',
  'input{height:48px;border-radius:12px;font-size:24px;background:color-mix(in srgb,var(--paper) 80%,transparent);border-color:color-mix(in srgb,var(--line-2) 70%,transparent)}input::placeholder{color:var(--faint);font-size:18px}',
  'button{border-radius:12px;transition:transform .12s ease,box-shadow .2s;-webkit-tap-highlight-color:transparent}button:active{transform:scale(.95)}button:hover{box-shadow:0 0 0 1px color-mix(in srgb,var(--ink) 18%,transparent) inset}',
  '.pp-sq{width:48px;border-radius:12px}',
  '.pp-heal{background:linear-gradient(180deg,#38b06b,#23804b)!important;border-color:transparent!important;box-shadow:0 6px 16px rgba(56,176,107,.32)}',
  '.pp-dmg{background:linear-gradient(180deg,#e2554a,#a92f26)!important;border-color:transparent!important;box-shadow:0 6px 16px rgba(226,85,74,.32)}',
  '.pp-tb{background:linear-gradient(180deg,color-mix(in srgb,#7fb2ff 26%,var(--panel-2)),var(--panel-2));border-color:color-mix(in srgb,#7fb2ff 40%,transparent)}',
  '#ppCond,#ppCmb{padding:10px 12px;gap:8px}',
  '.pp-k{flex-basis:100%;font-size:10.5px;letter-spacing:.14em;margin:0 0 -2px}',
  '.pp-c button{border-radius:999px;min-height:34px}.pp-c .on{box-shadow:0 0 0 1px color-mix(in srgb,var(--warn,#e2aa4c) 60%,transparent) inset}',
  '.pp-ct{border-radius:10px!important;min-width:36px;min-height:34px!important}.pp-ct.on{background:linear-gradient(180deg,#ffc24a,#e09a12)!important;border-color:transparent!important;color:#2b1a00!important;box-shadow:0 4px 12px rgba(255,176,32,.35)}',
  '[data-ppcturn]{margin-left:auto;border-radius:999px!important;padding:0 14px!important}',
  '.pp-cl{gap:6px;margin-top:2px}',
  '.pp-cr{padding:8px 8px 8px 10px;border:0!important;border-radius:12px;background:color-mix(in srgb,var(--panel-2) 80%,transparent);box-shadow:inset 3px 0 0 #ffb020}.pp-cr.emp{box-shadow:inset 3px 0 0 color-mix(in srgb,var(--ink) 20%,transparent)}',
  '.pp-cs{width:48px}.pp-cn{font-size:14.5px}',
  '.pp-cu{border-radius:999px!important;padding:0 14px!important;background:color-mix(in srgb,var(--acc) 22%,var(--panel-2));border-color:color-mix(in srgb,var(--acc) 45%,transparent)}.pp-cu[aria-pressed="true"]{background:var(--panel-2);color:var(--muted);border-color:var(--line-2)}',
  ':root[data-theme="light"] .pp-hero,:root[data-theme="light"] .pp-ctrl,:root[data-theme="light"] #ppCond,:root[data-theme="light"] #ppCmb{box-shadow:0 6px 18px rgba(0,0,0,.08)}',
  '@media (prefers-reduced-motion:reduce){button{transition:none}.pp-bar i{transition:none}}'].join("");
  window.__miPip=function(w){ var d=w.document; if(!d||!d.body) return;
    var st=d.createElement("style"); st.id="miPip"; st.textContent=CSS; d.head.appendChild(st);
    var top=d.querySelector(".pp-top"), bar=d.querySelector(".pp-bar"), rows=d.querySelectorAll(".pp-row");
    if(top&&bar){ var h=d.createElement("div"); h.className="pp-hero"; top.parentNode.insertBefore(h,top); h.appendChild(top); h.appendChild(bar); var fl=d.createElement("i"); fl.className="pp-fl"; h.appendChild(fl); }
    if(rows.length){ var c=d.createElement("div"); c.className="pp-ctrl"; rows[0].parentNode.insertBefore(c,rows[0]); Array.prototype.forEach.call(rows,function(r){ c.appendChild(r); }); }
    /* motion: the number pops and the card flashes when Hit Points change */
    var hp=d.getElementById("ppHp"), prev=null, MI=window.__MI;
    if(hp&&hp.animate) new w.MutationObserver(function(){ var v=+hp.textContent; if(prev===null||isNaN(v)){ prev=v; return; } if(v===prev) return; var down=v<prev; prev=v; if(MI&&MI.rm()) return;
      hp.animate(down?[{transform:"none"},{transform:"translateX(-5px) scale(1.08)"},{transform:"translateX(4px)"},{transform:"translateX(-2px)"},{transform:"none"}]:[{transform:"scale(1)"},{transform:"scale(1.18)",offset:.35},{transform:"none"}],{duration:down?380:420,easing:"ease-out"});
      var f=d.querySelector(".pp-fl"); if(f){ f.style.background=down?"radial-gradient(120% 90% at 20% 30%,rgba(229,57,53,.42),transparent 70%)":"radial-gradient(120% 90% at 20% 30%,rgba(76,194,122,.42),transparent 70%)"; f.animate([{opacity:0},{opacity:1,offset:.2},{opacity:0}],{duration:650,easing:"ease-out"}); } }).observe(hp,{childList:true,characterData:true,subtree:true});
    if(hp) prev=+hp.textContent; };
})();

/* === A1 + B2: class colour and the Hit Points ring === */
(function(){
  var html=document.documentElement;
  function cls(){ try{ var st=window.__sheetState&&window.__sheetState(), c=st&&st.C&&st.C.cls; c=String(c||"").split(/[\s/,]/)[0].toLowerCase(); if(c) html.setAttribute("data-mi-cls",c); else html.removeAttribute("data-mi-cls"); }catch(e){} }
  var g=null, gi=null;
  function hp(){ var box=document.querySelector("#hpBox .hp-big"); if(!box) return; if(!g||!box.contains(g)){ g=document.createElement("i"); g.className="mi-hpg"; g.setAttribute("aria-hidden","true"); gi=document.createElement("span"); gi.className="mi-hpi"; gi.setAttribute("aria-hidden","true"); gi.innerHTML="<b></b><small></small>"; box.appendChild(g); box.appendChild(gi); }
    var c=document.getElementById("hpCur"), m=document.getElementById("hpMax"), bar=document.getElementById("hpBar"), mx=+(m&&(m.getAttribute("data-v")||m.textContent));
    var sx=bar&&/scaleX\(([\d.]+)\)/.exec(bar.style.transform||""), v=c&&(c.getAttribute("aria-label")||(c.children.length?"":c.textContent)); v=v!=null&&v!==""?+v:(sx?Math.round(+sx[1]*mx):NaN);
    if(!(mx>0)||isNaN(v)) return; var p=Math.max(0,Math.min(1,v/mx)), st=v<=0?"Down":p<=.5?"Bloodied":"Healthy", col=v<=0?"#e5534b":p<=.25?"#e5534b":p<=.5?"#e2aa4c":"#38b06b";
    var nar=box.clientWidth<300; if(box.classList.contains("mi-hpn")!==nar) box.classList.toggle("mi-hpn",nar);/* a narrow card gets a smaller ring, so the number never wraps */
    var key=p.toFixed(3)+col+st; if(g.__k===key) return; g.__k=key;
    g.style.setProperty("--hp",p.toFixed(3)); g.style.setProperty("--hc",col); gi.style.setProperty("--hc",col); gi.firstChild.textContent=Math.round(p*100)+"%"; gi.lastChild.textContent=st; }
  /* watch only the two places that matter: the Hit Points box, and the identity card for the class */
  var q=0, last=""; function kick(){ if(!q){ q=1; (window.__miNF||setTimeout)(function(){ q=0; hp(); }); } }
  var cq=0; function ckick(){ if(!cq){ cq=1; setTimeout(function(){ cq=0; var t=(document.querySelector(".idcard")||{}).textContent||""; if(t!==last){ last=t; cls(); } },120); } }
  function arm(){ var hb=document.getElementById("hpBox"), id=document.querySelector(".idcard")||document.getElementById("idName");
    if(hb) new MutationObserver(kick).observe(hb,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["aria-label","data-v","style"]});
    if(id) new MutationObserver(ckick).observe(id,{childList:true,subtree:true,characterData:true});
    cls(); kick(); }
  var rz=0; window.addEventListener("resize",function(){ clearTimeout(rz); rz=setTimeout(function(){ var g0=document.querySelector(".mi-hpg"); if(g0) g0.__k=""; kick(); },150); });
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",arm); else arm();
})();

/* === W pack: the wow pass. Class sigil, metal shield, sheet cascade, tab slide, campfire, crack, rune circle, equip flight, card flip, 3D tilt with glare. Motion is transform and opacity only, every layer removes itself === */
(function(){
  var MI=window.__MI; if(!MI||!document.body.animate) return;
  var D=document, WIDE=matchMedia("(min-width: 760px)"), FINE=matchMedia("(hover: hover) and (pointer: fine)");
  function full(){ return MI.full(); }
  function nf(fn){ (window.__miNF||setTimeout)(fn); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function vis(e){ return e&&e.getClientRects().length; }
  function fx(cls,html,ms){ var e=D.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; D.body.appendChild(e); setTimeout(function(){ rm(e); },ms||2300); return e; }

  /* gradients the shield and medals use */
  var defs=D.createElementNS("http://www.w3.org/2000/svg","svg"); defs.setAttribute("width","0"); defs.setAttribute("height","0"); defs.setAttribute("aria-hidden","true"); defs.style.position="absolute";
  defs.innerHTML='<defs><linearGradient id="miSteel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8a96"/><stop offset=".45" stop-color="#3b454e"/><stop offset="1" stop-color="#1c2227"/></linearGradient><linearGradient id="miSteelHi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".55"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".08"/><stop offset="1" stop-color="#ffffff" stop-opacity=".3"/></linearGradient></defs>';
  D.body.appendChild(defs);

  /* W1 class sigil: a large, faint copy of the class icon behind the ID card */
  function sigil(){ var card=D.querySelector("#app .idcard"); if(!card) return; var src=window.__miIcon?{outerHTML:window.__miIcon()}:card.querySelector(".ph-cls svg"), w=card.querySelector(":scope>.mi-sig");
    if(!src){ rm(w); return; } var k=src.outerHTML; if(w&&w.__k===k) return;
    if(!w){ w=D.createElement("i"); w.className="mi-sig"; w.setAttribute("aria-hidden","true"); card.appendChild(w); } w.__k=k; w.innerHTML=k; }
  var sq=0, sObs=new MutationObserver(function(){ if(!sq){ sq=1; nf(function(){ sq=0; sigil(); bindSig(); }); } }), sBound=null;
  function bindSig(){ var card=D.querySelector("#app .idcard"); if(!card||card===sBound) return; sBound=card; sObs.disconnect(); sObs.observe(card,{childList:true}); if(card.parentNode) sObs.observe(card.parentNode,{childList:true}); }
  bindSig(); sigil();

  /* M1 the sheet opens: its cards rise in one after another. M10 after Apply to Sheet the ID card turns over */
  function cascade(){ if(!full()) return; var n=0;
    Array.prototype.forEach.call(D.querySelectorAll("#app .idcard,#app .vitals,#app .tiles>.tile,#abil .ab,#app .card,#app .panel>.inner"),function(e){ if(n>=24) return; var r=e.getBoundingClientRect(); if(!r.width||r.bottom<0||r.top>innerHeight) return;
      e.animate([{opacity:0,transform:"translateY(22px) scale(.97)"},{opacity:1,transform:"none"}],{duration:520,delay:n*38,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); n++; }); }
  function flip(){ var c=D.querySelector("#app .idcard"); if(!vis(c)||!full()) return;
    c.animate([{transform:"perspective(1100px) rotateY(-100deg) scale(.92)",opacity:0},{transform:"perspective(1100px) rotateY(12deg) scale(1.02)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"});
    var s=c.querySelector(":scope>.mi-sig"); if(s) s.animate([{opacity:0,transform:"rotate(-24deg) scale(.6)"},{opacity:1,transform:"rotate(-12deg) scale(1)"}],{duration:1100,delay:350,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); }
  var hv=D.getElementById("homeV");
  function boot(){ if(vis(D.querySelector("#app .idcard"))&&!vis(hv)) nf(function(){ nf(cascade); }); }
  if(D.readyState==="complete") boot(); else addEventListener("load",boot,{once:true});
  if(hv){ var hw=hv.hidden; new MutationObserver(function(){ var h=hv.hidden; if(h&&!hw) nf(function(){ nf(cascade); }); hw=h; }).observe(hv,{attributes:true,attributeFilter:["hidden"]}); }
  var fw=0;
  addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("button"); if(!t) return; if(t.id==="b-toSheet"||(D.getElementById("bld")&&/^\s*Apply\s*$/i.test(t.textContent))){ var id=++fw, tries=0;
      (function wait(){ setTimeout(function(){ if(id!==fw) return; var b=D.getElementById("bld"); if(!vis(b)&&vis(D.querySelector("#app .idcard"))){ flip(); return; } if(++tries<8) wait(); },380); })(); } },true);

  /* M2 desktop tabs: the new page slides in from the side of the tab you picked */
  addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest('[role=tab][data-tab]'); if(!t||!WIDE.matches||!full()) return;
    var tabs=Array.prototype.slice.call(t.parentNode.querySelectorAll('[role=tab]')), cur=-1; tabs.forEach(function(x,i){ if(x.getAttribute("aria-selected")==="true") cur=i; }); var nx=tabs.indexOf(t); if(cur<0||nx===cur) return; var dir=nx>cur?1:-1;
    nf(function(){ var pn=D.getElementById(t.getAttribute("data-tab")), el=pn&&(pn.querySelector(":scope>.inner")||pn); if(!vis(el)) return;
      el.animate([{transform:"translateX("+(dir*34)+"px)",opacity:.15},{transform:"none",opacity:1}],{duration:360,easing:"cubic-bezier(.2,.8,.2,1)"}); }); },true);

  /* M5 Short Rest: a campfire flares in the middle of the screen, under the embers */
  var W=window.__miWow;
  if(W&&W.rest){ var r0=W.rest; W.rest=function(k){ r0.apply(this,arguments); if(k!=="long"&&full()) fire(); }; }
  function fire(){ var f=fx("mi-fire",'<s></s><i></i><i></i><i></i><b></b><b></b>',2200);
    f.animate([{opacity:0,transform:"translate(-50%,-50%) scale(.7)"},{opacity:1,transform:"translate(-50%,-50%) scale(1.45)",offset:.22},{opacity:1,transform:"translate(-50%,-50%) scale(1.5)",offset:.7},{opacity:0,transform:"translate(-50%,-62%) scale(1.35)"}],{duration:1700,easing:"ease-out"}).onfinish=function(){ rm(f); };
    Array.prototype.forEach.call(f.querySelectorAll("i"),function(fl,i){ fl.animate([{transform:"scale(.6,.4)"},{transform:"scale(1,1.15)",offset:.3},{transform:"scale(.92,.95)",offset:.5},{transform:"scale(1.02,1.1)",offset:.75},{transform:"scale(.7,.5)"}],{duration:1700,delay:i*70,easing:"ease-in-out",fill:"backwards"}); }); }

  /* M6 Damage: a crack runs across the Hit Points card */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#dmgBtn"); if(!b||!full()) return; var amt=+((D.getElementById("hpAmt")||{}).value||0); if(!(amt>0)) return;
    nf(function(){ var box=D.getElementById("hpBox")||D.querySelector(".vitals"); if(!vis(box)) return; var r=box.getBoundingClientRect(), big=Math.min(1,amt/15), w=r.width, h=r.height, x0=w*(.25+Math.random()*.5), y0=h*.35;
      function path(){ var p="M"+x0+" "+y0, x=x0, y=y0, a=Math.random()*Math.PI*2; for(var i=0;i<5;i++){ a+=(Math.random()-.5)*1.2; var d=(18+Math.random()*30)*(.7+big); x+=Math.cos(a)*d; y+=Math.sin(a)*d; p+=" L"+x.toFixed(1)+" "+y.toFixed(1); } return p; }
      var ps=""; for(var k=0;k<4+Math.round(big*3);k++) { var d=path(); ps+='<path class="u" d="'+d+'"/><path d="'+d+'"/>'; }
      var c=fx("mi-crack",'<svg width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'">'+ps+'</svg>',1600); c.style.transform="translate("+r.left+"px,"+r.top+"px)"; c.style.width=w+"px"; c.style.height=h+"px";
      c.animate([{opacity:0},{opacity:1,offset:.08},{opacity:1,offset:.55},{opacity:0}],{duration:1100,easing:"ease-out"}).onfinish=function(){ rm(c); }; }); },true);

  /* M7 Concentration starts: a rune circle closes round its badge */
  var vc=D.getElementById("vbConc");
  if(vc){ var vh=vc.hidden; new MutationObserver(function(){ var h=vc.hidden; if(vh&&!h&&full()) nf(function(){ rune(vc); }); vh=h; }).observe(vc,{attributes:true,attributeFilter:["hidden"]}); }
  function rune(el){ if(!vis(el)) return; var r=el.getBoundingClientRect(), x=r.left+r.width/2, y=r.top+r.height/2;
    var g=fx("mi-rune",'<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52"/><circle cx="60" cy="60" r="44" class="d"/><path d="M60 8 L105 86 L15 86 Z"/><path d="M60 112 L15 34 L105 34 Z"/></svg>',1700);
    g.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.3) rotate(-90deg)",opacity:0},{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(1) rotate(0deg)",opacity:1,offset:.45},{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(1.25) rotate(40deg)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); };
    el.animate([{transform:"scale(1)"},{transform:"scale(1.12)",offset:.4},{transform:"none"}],{duration:520,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("medium"); }

  /* M9 an item equipped: its icon flies to Armor Class when it is armor or a shield, otherwise it pops in place */
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest(".ichk[data-ieqs]"); if(!b||!full()) return; var key=b.getAttribute("data-ieqs"), row=b.closest(".irow"), ic=row&&row.querySelector(".iname svg"), r0=(ic||b).getBoundingClientRect();
    var armor=row&&/armor|shield/i.test(row.textContent), icon=ic?ic.outerHTML:"";
    nf(function(){ nf(function(){ var now=D.querySelector('.ichk[data-ieqs="'+CSS.escape(key)+'"]'); if(!now||!now.classList.contains("on")) return; var tg=null; if(armor) Array.prototype.some.call(D.querySelectorAll(".tile.ac,#vbar .vb"),function(t){ if(vis(t)&&(t.classList.contains("ac")||t.classList.contains("vb-ac"))){ var q=t.getBoundingClientRect(); if(q.top>=0&&q.bottom<=innerHeight&&q.left>=0&&q.right<=innerWidth){ tg=t; return true; } } });
      if(window.__miBurst) window.__miBurst(r0.left+r0.width/2,r0.top+r0.height/2,{n:10,colors:["#ffd166","#ffffff","rgb("+(getComputedStyle(D.documentElement).getPropertyValue("--pl-rgb")||"214,69,59")+")"],dist:42,dur:600});
      if(!tg||!icon) return; var q=tg.getBoundingClientRect(), g=fx("mi-eqf",icon,1500), dx=q.left+q.width/2-(r0.left+r0.width/2), dy=q.top+q.height/2-(r0.top+r0.height/2);
      g.style.left=(r0.left+r0.width/2)+"px"; g.style.top=(r0.top+r0.height/2)+"px";
      g.animate([{transform:"translate(-50%,-50%) scale(1)",opacity:1},{transform:"translate(calc(-50% + "+dx*.5+"px),calc(-50% + "+(dy*.5-60)+"px)) scale(1.6) rotate(-12deg)",opacity:1,offset:.45},{transform:"translate(calc(-50% + "+dx+"px),calc(-50% + "+dy+"px)) scale(.6)",opacity:.2}],{duration:720,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ rm(g);
        tg.animate([{transform:"none"},{transform:"scale(1.12)",offset:.35},{transform:"none"}],{duration:460,easing:"cubic-bezier(.3,1.5,.5,1)"}); MI.buzz("success"); }; }); }); },true);

  /* H1 + H2 mouse only: cards lean toward the cursor and a light follows it. One card at a time, one frame per move */
  var SEL="#app .idcard,#app .vitals,#abil .ab,#app .tiles>.tile,#app .card,#app .arow,#app .fitem,#app .sp-r,#app .irow,#bld .acc";
  if(FINE.matches){ var cur=null, gl=null, raf=0, mx=0, my=0, k=1;
    D.addEventListener("pointermove",function(e){ if(e.pointerType!=="mouse") return; var c=e.target.closest?e.target.closest(SEL):null;
      if(c!==cur){ leave(); if(c&&full()&&!e.buttons&&!D.querySelector(".mi-drag,.dragging,[data-dragging]")) enter(c); } if(!cur) return; mx=e.clientX; my=e.clientY; if(!raf) raf=requestAnimationFrame(step); },{passive:true});
    D.addEventListener("pointerdown",function(e){ if(e.pointerType==="mouse"&&cur&&e.button===0){ var c=cur; leave(); c.__miHold=1; setTimeout(function(){ c.__miHold=0; },400); } },true);
    D.documentElement.addEventListener("mouseleave",leave); addEventListener("blur",leave); addEventListener("scroll",function(){ if(cur) leave(); },{passive:true,capture:true});
    function enter(c){ if(c.__miHold) return; cur=c; var w=c.getBoundingClientRect().width; k=w>420?1.6:w>200?3:6; c.classList.add("mi-lean"); gl=D.createElement("i"); gl.className="mi-glare"; gl.setAttribute("aria-hidden","true"); gl.innerHTML="<b></b>"; c.appendChild(gl); }
    function leave(){ if(!cur) return; var c=cur, g=gl; cur=null; gl=null; c.style.removeProperty("--mrx"); c.style.removeProperty("--mry"); c.classList.remove("mi-lean"); if(g){ g.style.opacity="0"; setTimeout(function(){ rm(g); },260); } }
    function step(){ raf=0; if(!cur||!gl) return; var r=cur.getBoundingClientRect(), px=Math.max(0,Math.min(1,(mx-r.left)/r.width)), py=Math.max(0,Math.min(1,(my-r.top)/r.height));
      cur.style.setProperty("--mry",((px-.5)*k).toFixed(2)+"deg"); cur.style.setProperty("--mrx",((.5-py)*k).toFixed(2)+"deg"); var b=gl.firstChild; if(b) b.style.transform="translate("+(px*r.width).toFixed(0)+"px,"+(py*r.height).toFixed(0)+"px)"; } }
})();

