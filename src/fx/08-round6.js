/* === Round 6: the final list. Every effect here moves only transform and opacity, adds nothing it does not take away itself,
   and has a hard stop in CSS (miKill) for anything it adds. === */
(function(){
  const MI=FXENV.__MI; if(!MI||!document.body||!document.body.animate) return;
  const EASE="cubic-bezier(.2,.8,.2,1)", POP="cubic-bezier(.3,1.5,.5,1)";
  function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function vis(r){ return r&&r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth; }
  function later(fn){ __miNF(() =>{ __miNF(fn); }); }/* after the app has redrawn */
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }

  /* B1 Flying Button: an item added in the Builder flies into the Equipment step */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#bld [data-iadd],#bld [data-custadd]"); if(!b||MI.rm()) return; const p=C(b); if(!vis(p.r)) return;
    later(() =>{ const t=document.querySelector('#steps [data-step="equip"]'); if(!t) return; const q=C(t); if(!vis(q.r)) return;
      const d=document.createElement("i"); d.className="mi-fly"; d.setAttribute("aria-hidden","true"); document.body.appendChild(d);
      const dx=q.x-p.x, dy=q.y-p.y, lift=Math.min(-60,dy*.5-60);
      const an=d.animate([{transform:"translate("+p.x+"px,"+p.y+"px) scale(.6)",opacity:0},{transform:"translate("+(p.x+dx*.15)+"px,"+(p.y+lift*.6)+"px) scale(1.15)",opacity:1,offset:.25},{transform:"translate("+(p.x+dx*.6)+"px,"+(p.y+lift)+"px) scale(1)",opacity:1,offset:.6},{transform:"translate("+q.x+"px,"+q.y+"px) scale(.35)",opacity:.2}],{duration:620,easing:"cubic-bezier(.4,0,.2,1)"});
      an.onfinish=function(){ rm(d); const t2=document.querySelector('#steps [data-step="equip"]'); if(t2) t2.animate([{transform:"scale(1)"},{transform:"scale(1.14)",offset:.4},{transform:"none"}],{duration:380,easing:POP}); MI.buzz("light"); };
      setTimeout(() =>{ rm(d); },1200); }); },true);

  /* B2 Code Slots: Roll in the Builder spins the number like a slot reel before it lands */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#bld [data-roll]"); if(!b||MI.rm()) return; const key=b.getAttribute("data-roll"), hd=+b.getAttribute("data-hd")||8;
    later(() =>{ const inp=document.querySelector('#bld [data-hpr="'+CSS.escape(key)+'"]'); if(!inp) return; const r=inp.getBoundingClientRect(); if(!vis(r)) return; const v=inp.value; if(!v) return;
      const cs=getComputedStyle(inp), w=document.createElement("span"), col=document.createElement("span"), seq=[];
      for(let i=0;i<9;i++) seq.push(1+Math.floor(Math.random()*hd)); seq.push(v);
      let bw=parseFloat(cs.borderTopWidth)||0, H=r.height-bw*2, bg=cs.backgroundColor; if(!bg||/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) bg="var(--panel)";
      w.className="mi-slot"; w.setAttribute("aria-hidden","true"); w.style.cssText="left:"+(r.left+bw)+"px;top:"+(r.top+bw)+"px;width:"+(r.width-bw*2)+"px;height:"+H+"px;font:"+cs.font+";color:"+cs.color+";text-align:"+cs.textAlign+";background:"+bg+";border-radius:"+cs.borderRadius;
      col.innerHTML=seq.map((n) =>{ return "<b style=\"height:"+H+"px;line-height:"+H+"px\">"+n+"</b>"; }).join(""); w.appendChild(col); document.body.appendChild(w);/* the reel sits inside the box and covers its number; the box itself is not touched */
      const an=col.animate([{transform:"translateY(0)"},{transform:"translateY(-"+(H*(seq.length-1))+"px)"}],{duration:560,easing:"cubic-bezier(.2,.7,.3,1)",fill:"forwards"});
      an.onfinish=function(){ w.animate([{opacity:1},{opacity:0}],{duration:90}).onfinish=function(){ rm(w); }; inp.animate([{transform:"scale(1.12)"},{transform:"none"}],{duration:260,easing:POP}); MI.buzz("medium"); };
      setTimeout(() =>{ rm(w); },1200); }); },true);

  /* B3 Pulse Heart: the heart beside Hit Points beats once on a heal */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("#healBtn,[data-vbheal]"); if(!b||MI.rm()) return;
    later(() =>{ Array.prototype.forEach.call(document.querySelectorAll("#hpBox .hp-h svg,#vbHp .vb-h svg"),(s) =>{ if(!s.getClientRects().length) return;
      s.animate([{transform:"scale(1)"},{transform:"scale(1.35)",offset:.18},{transform:"scale(.92)",offset:.36},{transform:"scale(1.18)",offset:.52},{transform:"none"}],{duration:620,easing:"ease-out"}); }); }); },true);

  /* B4 Animated List after a filter: the rows of that list come in one after another */
  const ROWS=".sp-r,.irow,.arow,.fitem,.aitem,.skr,.svr";
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest(".ifb"); if(!b||b.classList.contains("on")||!MI.full()) return; const pg=b.closest("section,[id^='p-']"); if(!pg) return; const id=pg.id;
    later(() =>{ const root=id?document.getElementById(id):null; if(!root) return; let n=0;
      Array.prototype.some.call(root.querySelectorAll(ROWS),(r) =>{ if(!r.getClientRects().length) return false; const q=r.getBoundingClientRect(); if(q.top>innerHeight) return true; if(q.bottom<0) return false;
        r.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:260,delay:n*32,easing:EASE,fill:"backwards"}); return ++n>=8; }); }); },true);

  /* B5 Heading reveal: a page title rises in the first time it comes on screen (the class stays, so nothing is left to undo) */
  if(FXENV.IntersectionObserver){ var hio=new IntersectionObserver(((es) =>{ es.forEach((en) =>{ if(!en.isIntersecting) return; hio.unobserve(en.target); if(!MI.rm()) en.target.classList.add("mi-hd"); }); }),{threshold:.6});
    Array.prototype.forEach.call(document.querySelectorAll(".ptitle"),(h) =>{ hio.observe(h); }); }

  /* B7 Stepper: a Builder step that becomes complete pops its badge */
  let stOk={}, stq=0, stp=document.getElementById("steps");
  function stScan(){ stq=0; const bs=stp.querySelectorAll("[data-step]"); Array.prototype.forEach.call(bs,(b) =>{ const k=b.getAttribute("data-step"), g=b.querySelector(".sprog"), ok=!!(g&&g.classList.contains("ok"));
      if(ok&&stOk[k]===false&&!MI.rm()){ g.animate([{transform:"scale(.6)",opacity:.4},{transform:"scale(1.25)",opacity:1,offset:.5},{transform:"none"}],{duration:420,easing:POP}); b.animate([{transform:"translateY(0)"},{transform:"translateY(-3px)",offset:.4},{transform:"none"}],{duration:420,easing:POP}); MI.buzz("success"); }
      stOk[k]=g?ok:undefined; }); }
  if(stp){ new MutationObserver(() =>{ if(!stq) stq=requestAnimationFrame(stScan); }).observe(stp,{childList:true}); stScan(); }

  /* B8 Card Swap: switching combos in Combat View deals the new combo in from the side you moved toward */
  const cmbI=null;
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-cmbtab]"); if(!b||MI.rm()) return; const to=+b.getAttribute("data-cmbtab"), on=document.querySelector(".cmb-tab.on"), from=on?+on.getAttribute("data-cmbtab"):to; if(to===from) return; const dir=to>from?1:-1;
    later(() =>{ const top=document.querySelector(".cmb .cmb-top"); if(!top) return; let n=top.nextElementSibling, i=0;
      while(n&&i<6){ if(n.getClientRects().length) n.animate([{opacity:0,transform:"translateX("+(dir*34)+"px) rotate("+(dir*1.2)+"deg) scale(.97)"},{opacity:1,transform:"none"}],{duration:320,delay:i*30,easing:EASE,fill:"backwards"}); n=n.nextElementSibling; i++; } }); },true);

  /* B9 Profile Card: the portrait tilts under a mouse and catches a sheen when touched */
  const ph=document.getElementById("photo");
  if(ph){ let phOn=false;
    MI.on("pointermove",(e) =>{ if(e.pointerType!=="mouse"||MI.rm()) return; const inn=ph.contains(e.target);
      if(inn){ const r=ph.getBoundingClientRect(), px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height; phOn=true; ph.classList.add("mi-ptilt");
        ph.style.transform="perspective(600px) rotateX("+((.5-py)*10).toFixed(2)+"deg) rotateY("+((px-.5)*12).toFixed(2)+"deg)"; ph.style.setProperty("--mx",(px*100).toFixed(1)+"%"); ph.style.setProperty("--my",(py*100).toFixed(1)+"%"); }
      else if(phOn){ phOn=false; ph.classList.remove("mi-ptilt"); ph.style.transform=""; } },{passive:true});
    MI.on("pointerdown",(e) =>{ if(e.pointerType==="mouse"||!MI.full()||!ph.contains(e.target)) return; ph.classList.remove("mi-psheen"); void ph.offsetWidth; ph.classList.add("mi-psheen"); },{passive:true}); }

  /* B12 Specular / Glare: under a mouse, a soft light follows the pointer on main buttons and sheet cards. One pooled light, moved with transform */
  let GSEL=".btn.pri:not(.lvup),.hcreate,#sheet .card,.tiles .tile,.ab", gw=null, gi=null, gcur=null;
  function gHide(){ if(gw){ gw.style.opacity="0"; } gcur=null; }
  MI.on("pointermove",(e) =>{ if(e.pointerType!=="mouse"||!MI.full()) return; const t=e.target.closest&&e.target.closest(GSEL); if(!t){ if(gcur) gHide(); return; }
    const r=t.getBoundingClientRect();
    if(!gw){ gw=document.createElement("span"); gw.className="mi-glarew"; gw.setAttribute("aria-hidden","true"); gi=document.createElement("i"); gw.appendChild(gi); document.body.appendChild(gw); }
    if(gcur!==t){ gcur=t; gw.style.cssText="left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+getComputedStyle(t).borderRadius+";opacity:1"; }
    gi.style.transform="translate("+(e.clientX-r.left-90)+"px,"+(e.clientY-r.top-90)+"px)"; },{passive:true});
  MI.on("scroll",gHide,true); MI.on("pointerdown",gHide,true); document.documentElement.addEventListener("mouseleave",gHide);

})();

