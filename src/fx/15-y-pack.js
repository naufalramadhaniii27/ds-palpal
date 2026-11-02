/* === Y pack: class motif, level crest, load meter, hero sheet, splash, gem shatter and refill, skull, nav bounce, header shrink === */
(function(){
  const MI=window.__MI; if(!MI||!document.body.animate) return;
  const D=document;
  function full(){ return MI.full(); }
  function nf(fn){ (window.__miNF||setTimeout)(fn); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function vis(e){ return e&&e.getClientRects().length; }
  function st(){ try{ return window.__sheetState?window.__sheetState():null; }catch(e){ return null; } }
  function fx(cls,html,ms){ const e=D.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; D.body.appendChild(e); setTimeout(() =>{ rm(e); },ms||2300); return e; }

  /* T1 motif and T2 level crest on the ID card, re-added when the app redraws the card */
  function deco(){ const card=D.querySelector("#app .idcard"); if(!card) return;
    if(!card.querySelector(":scope>.mi-motif")){ const m=D.createElement("i"); m.className="mi-motif"; m.setAttribute("aria-hidden","true"); card.insertBefore(m,card.firstChild); }
    let s=st(), lv=s&&s.C&&s.C.level, ph=card.querySelector(".photo"), cr=card.querySelector(":scope>.mi-crest");
    if(!lv||!vis(ph)){ rm(cr); return; }
    if(!cr){ cr=D.createElement("i"); cr.className="mi-crest"; cr.setAttribute("aria-hidden","true"); card.appendChild(cr); }
    if(cr.__lv!==lv){ cr.__lv=lv; cr.innerHTML="<b>"+lv+"</b><small>LVL</small>"; }
    const a=card.getBoundingClientRect(), b=ph.getBoundingClientRect(); cr.style.left=Math.round(b.left-a.left-10)+"px"; cr.style.top=Math.round(b.top-a.top-10)+"px"; }
  let dq=0; function dQ(){ if(!dq){ dq=1; nf(() =>{ dq=0; deco(); bind(); }); } }
  let dObs=new MutationObserver(dQ), bound=null;
  function bind(){ const card=D.querySelector("#app .idcard"); if(!card||card===bound) return; bound=card; dObs.disconnect(); dObs.observe(card,{childList:true,subtree:true,characterData:true}); if(card.parentNode) dObs.observe(card.parentNode,{childList:true}); }
  bind(); deco(); addEventListener("resize",dQ,{passive:true});

  /* T9 load meter under the weight: Encumbered from 5 x Strength, Heavily from 10 x, the most you can carry 15 x */
  function enc(){ const w=D.querySelector("#invBody .iwt"); if(!w) return; let wt=parseFloat(((w.querySelector("b")||{}).textContent||"").replace(/,/g,"")), sc=null;
    Array.prototype.some.call(D.querySelectorAll('#abil .ab[data-bd="ab-STR"] .s'),(e) =>{ sc=parseInt(e.textContent,10); return true; });
    let bar=w.querySelector(".mi-enc"), lab=w.querySelector(".mi-encl"); if(!(sc>0)||isNaN(wt)){ rm(bar); rm(lab); return; }
    if(!bar){ bar=D.createElement("span"); bar.className="mi-enc"; bar.setAttribute("aria-hidden","true"); bar.innerHTML="<i></i>"; w.appendChild(bar); lab=D.createElement("span"); lab.className="mi-encl"; lab.setAttribute("aria-hidden","true"); w.appendChild(lab); }
    const max=sc*15, f=Math.max(0,Math.min(1,wt/max)), i=bar.firstChild; i.style.setProperty("--ew",(100/Math.max(f,.001))+"%"); i.style.transform="scaleX("+f.toFixed(3)+")";
    lab.innerHTML="<span>0</span><span>"+sc*5+"</span><span>"+sc*10+"</span><span>"+max+" lb.</span>"; }
  const ib=D.getElementById("invBody"); if(ib){ let eq=0; new MutationObserver(() =>{ if(!eq){ eq=1; nf(() =>{ eq=0; enc(); }); } }).observe(ib,{childList:true}); enc(); }

  /* T12 detail sheet: a header in the colour of the item rarity or the spell school, with its name as a tag */
  const RAR={uncommon:"31,168,58",rare:"47,127,224",veryrare:"155,79,209",legendary:"224,123,26",artifact:"194,65,59"};
  const SCH={Abjuration:"79,163,255",Conjuration:"242,193,78",Divination:"201,214,226",Enchantment:"255,111,177",Evocation:"255,106,61",Illusion:"169,139,255",Necromancy:"111,208,140",Transmutation:"58,214,198"};
  const sh=D.getElementById("sheet"), sb=D.getElementById("sheetBody"), sq=0;
  function heroWant(){ if(!sh.classList.contains("on")||!sb) return ""; const rl=sb.querySelector(".rline"); if(rl){ const m=/r-([a-z]+)/.exec(rl.className); if(m&&RAR[m[1]]) return RAR[m[1]]+"|"+rl.textContent.split(/[\u2022,]/)[0].trim(); }
    const t=(sb.textContent||"").slice(0,260); for(const k in SCH){ if(new RegExp("\\b"+k+"\\b").test(t)) return SCH[k]+"|"+k; } return ""; }
  function hero(){ if(!sh) return; const head=D.getElementById("sheetHead"); if(!head) return; let w=heroWant(), h2=D.getElementById("sheetTitle"), g=head.querySelector(".mi-hero-g"), tg=h2&&h2.querySelector(".mi-hero-t");
    if(w===(sh.getAttribute("data-mi-hero")||"")&&(!w||(g&&(tg||!h2)))) return;
    if(g) rm(g); if(tg) rm(tg); if(!w){ sh.removeAttribute("data-mi-hero"); if(sh.classList.contains("mi-hero")) sh.classList.remove("mi-hero"); return; }
    sh.setAttribute("data-mi-hero",w); const pr=w.split("|"), rgb=pr[0], tag=pr[1]; sh.style.setProperty("--hero",rgb); if(!sh.classList.contains("mi-hero")) sh.classList.add("mi-hero");
    g=D.createElement("i"); g.className="mi-hero-g"; g.setAttribute("aria-hidden","true"); head.insertBefore(g,head.firstChild);
    if(h2&&tag&&tag.length<24){ tg=D.createElement("span"); tg.className="mi-hero-t"; tg.textContent=tag; h2.appendChild(tg); } }
  if(sh&&sb){ const hq=function(){ hero(); }; new MutationObserver(hq).observe(sh,{attributes:true,attributeFilter:["class"]}); new MutationObserver(hq).observe(sb,{childList:true}); }

  /* M11 opening a character: its sigil and name, once per character per session */
  /* T1: no splash over the builder. Create a Character and Edit reload and then open the builder (cs-skip with cs-new or cs-edit) */
  const html0=D.documentElement;
  function bldSoon(){ const b=D.getElementById("bld"); if(b&&!b.hidden) return true; if(window.__bldBusyOff) return true;
    try{ return sessionStorage.getItem("cs-skip")==="1"&&(__store.getItem("cs-new")==="1"||__store.getItem("cs-edit")==="1"); }catch(e){ return false; } }
  function splash(){ if(!full()||bldSoon()||html0.classList.contains("mi-cx")) return;/* T1: the connected move from Home replaces the splash */ const s=st(), id=s&&(s.id||(s.C&&s.C.name)); if(!id) return; const k="mi-spl-"+id; try{ if(sessionStorage.getItem(k)) return; sessionStorage.setItem(k,"1"); }catch(e){ return; }
    const ic=window.__miIcon?{outerHTML:window.__miIcon()}:D.querySelector("#app .idcard .ph-cls svg"), nm=(s.C&&s.C.name)||"", cl=((s.C&&s.C.cls)||"")+(s.C&&s.C.level?" • Level "+s.C.level:"");
    const e=D.createElement("div"); e.className="mi-splash"; e.setAttribute("aria-hidden","true"); e.innerHTML='<div class="s">'+(ic?ic.outerHTML:"")+'</div><b></b><small></small>'; e.querySelector("b").textContent=nm; e.querySelector("small").textContent=cl; D.body.appendChild(e);
    e.querySelector(".s").animate([{transform:"scale(.6) rotate(-20deg)",opacity:0},{transform:"scale(1) rotate(0)",opacity:1,offset:.4},{transform:"scale(1.05)",opacity:1}],{duration:900,easing:"cubic-bezier(.2,.8,.2,1)"});
    e.animate([{opacity:1},{opacity:1,offset:.55},{opacity:0}],{duration:1500,easing:"ease-in"}).onfinish=function(){ rm(e); }; setTimeout(() =>{ rm(e); },2300);
    const bl=D.getElementById("bld"); if(bl){ var mo=new MutationObserver(() =>{ if(!bl.hidden){ mo.disconnect(); rm(e); } }); mo.observe(bl,{attributes:true,attributeFilter:["hidden"]}); setTimeout(() =>{ mo.disconnect(); },2400); } }
  function boot(){ if(vis(D.querySelector("#app .idcard"))&&!vis(D.getElementById("homeV"))) splash(); }
  if(D.readyState==="complete") boot(); else addEventListener("load",boot,{once:true});

  /* M12 a spell slot spent: the gem shatters. Long Rest: every gem lights again */
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".spsl .bx"); if(!b||!full()) return; const was=b.getAttribute("aria-pressed")==="true", k=b.getAttribute("data-k"), i=b.getAttribute("data-i"), r=b.getBoundingClientRect();
    nf(() =>{ nf(() =>{ const n=D.querySelector('.spsl .bx[data-k="'+CSS.escape(k||"")+'"][data-i="'+CSS.escape(i||"")+'"]'); if(!n||was||n.getAttribute("aria-pressed")!=="true") return; const x=r.left+r.width/2, y=r.top+r.height/2;
      for(let j=0;j<9;j++){ (function(j){ const s=fx("mi-gsh","",1200), a=Math.PI*2*j/9+Math.random()*.5, d=18+Math.random()*26; s.animate([{transform:"translate("+x+"px,"+y+"px) rotate(0)",opacity:1},{transform:"translate("+(x+Math.cos(a)*d)+"px,"+(y+Math.sin(a)*d+14)+"px) rotate("+(200+Math.random()*200)+"deg) scale(.5)",opacity:0}],{duration:620+Math.random()*240,easing:"cubic-bezier(.2,.7,.3,1)"}).onfinish=function(){ rm(s); }; })(j); }
      MI.buzz("light"); }); }); },true);
  const W=window.__miWow; if(W&&W.rest){ const r0=W.rest; W.rest=function(k){ r0.apply(this,arguments); if(k==="long"&&full()) setTimeout(() =>{ let i=0; Array.prototype.forEach.call(D.querySelectorAll(".spsl .bx,.lu .bx"),(b) =>{ if(!vis(b)) return; b.animate([{transform:"scale(.6)",opacity:.3},{transform:"scale(1.18)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:520,delay:Math.min(i++,24)*40,easing:"cubic-bezier(.3,1.5,.5,1)",fill:"backwards"}); }); },700); }; }

  /* M17 Exhaustion goes up: a skull pops from its note */
  let cd=D.getElementById("conds"), exPrev=null; function exN(){ const n=cd&&cd.querySelector(".exh-note"), m=n&&/Exhaustion\s+(\d)/.exec(n.textContent); return m?+m[1]:0; }
  if(cd){ exPrev=exN(); new MutationObserver(() =>{ const v=exN(); if(exPrev!=null&&v>exPrev&&full()){ const n=cd.querySelector(".exh-note"); if(vis(n)){ const r=n.getBoundingClientRect(), x=r.left+18, y=r.top+r.height/2;
      const s=fx("mi-skull","",1500); s.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.3)",opacity:0},{transform:"translate("+x+"px,"+(y-34)+"px) translate(-50%,-50%) scale(1.2)",opacity:1,offset:.35},{transform:"translate("+x+"px,"+(y-50)+"px) translate(-50%,-50%) scale(1)",opacity:1,offset:.7},{transform:"translate("+x+"px,"+(y-64)+"px) translate(-50%,-50%) scale(.9)",opacity:0}],{duration:1200,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(s); }; } } exPrev=v; }).observe(cd,{childList:true}); }

  /* M18 the bottom bar icon hops once when chosen */
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest(".bnav button"); if(!b||MI.rm()||MI.mode==="off") return; const i=b.querySelector("svg"); if(i) i.animate([{transform:"none"},{transform:"translateY(-6px) scale(1.15)",offset:.35},{transform:"translateY(1px) scale(.96)",offset:.7},{transform:"none"}],{duration:420,easing:"ease-out"}); },true);

  /* M19 phones: the name in the top bar settles smaller once a page is scrolled */
  let band=D.querySelector("header.band"), bs=false;
  if(band) D.addEventListener("scroll",(e) =>{ const t=e.target, y=t===D?(D.scrollingElement||D.documentElement).scrollTop:(t&&t.scrollTop)||0; if(t&&t.closest&&t.closest("#sheet,#bld,.ask,dialog")) return; const on=y>36; if(on!==bs){ bs=on; band.classList.toggle("mi-bs",on); } },{passive:true,capture:true});
})();

