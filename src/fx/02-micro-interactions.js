/* === v55 micro-interactions. Self-contained: it only listens to clicks and reads the DOM, so the sheet logic is untouched.
   Everything decorative is skipped with prefers-reduced-motion. === */
/* particles, part 1: an expanding ring and a little smoke (the burst is below) */
(function(){
  if(!document.body||!document.body.animate) return;
  
  function kill(e,an,ms){ an.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },ms); }

  /* an expanding ring */
  function ring(x,y,col,size){ if(MI.rm()) return; const e=document.createElement("i"); e.className="mi-fx mi-ring"; e.setAttribute("aria-hidden","true"); e.style.color=col; document.body.appendChild(e);
    const k=(size||70)/16*(MI.full()?1.35:1), an=e.animate([{transform:"translate("+x+"px,"+y+"px) scale(.3)",opacity:.9},{transform:"translate("+x+"px,"+y+"px) scale("+k+")",opacity:0}],{duration:620,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    kill(e,an,1000); }
  /* a little smoke rising, for a spell slot going out */
  function smoke(x,y){ if(MI.rm()) return; for(let i=0;i<6;i++){ const e=document.createElement("i"), s=6+Math.random()*5; e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background="rgba(170,170,182,.75)"; e.style.width=e.style.height=s+"px"; document.body.appendChild(e);
      const dx=(Math.random()-.5)*22, dy=-(28+Math.random()*26);
      kill(e,e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.5)",opacity:.75},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) scale(1.9)",opacity:0}],{duration:800+Math.random()*300,delay:i*40,easing:"cubic-bezier(.2,.7,.3,1)",fill:"both"}),1600); } }
  FXENV.__miRing=ring; FXENV.__miSmoke=smoke;
})();
/* particles: dots, stars, or sparks flying out from a point. Elements come from a pool and go back to it, so a burst adds nothing to the page */
(function(){
  if(!document.body||!document.body.animate) return;
  const POOL=[];
  function burst(x,y,o){ if(MI.rm()) return; o=o||{}; let n=o.n||10, cols=o.colors||["#ffd166"], d=o.dist||46, sh=o.shape||"mi-dot", dur=o.dur||700, s=o.scale||1;
    if(MI.full()){ n=Math.min(48,Math.round(n*1.6)); d*=1.4; s*=1.2; }/* W11: Full mode is the loud one */
    for(let i=0;i<n;i++){ let a=(Math.PI*2*i/n)+(Math.random()-.5)*.6, dd=d*(.6+Math.random()*.6), e=POOL.pop();
      if(!e){ e=document.createElement("i"); e.setAttribute("aria-hidden","true"); document.body.appendChild(e); }
      e.className="mi-fx "+sh; e.style.visibility=""; e.style.background=cols[i%cols.length];
      const dx=Math.cos(a)*dd, dy=Math.sin(a)*dd+(o.grav?dd*.35:0), spark=sh==="mi-spark", r0=spark?(a*180/Math.PI+90):Math.random()*180, sp=spark?0:1;
      const an=e.animate([
        {transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) rotate("+r0+"deg) scale("+(.4*s)+")",opacity:1},
        {transform:"translate("+(x+dx*.75)+"px,"+(y+dy*.75)+"px) translate(-50%,-50%) rotate("+(r0+90*sp)+"deg) scale("+s+")",opacity:1,offset:.55},
        {transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) rotate("+(r0+140*sp)+"deg) scale("+(.2*s)+")",opacity:0}
      ],{duration:dur*(.8+Math.random()*.4),easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
      (function(e,an){ let done=false, back=function(){ if(done) return; done=true; an.cancel(); e.style.visibility="hidden"; if(POOL.length<60) POOL.push(e); else e.remove(); }; an.onfinish=back; setTimeout(back,dur*1.5+200); })(e,an); } }
  FXENV.__miBurst=burst;
})();
/* ink ripple from the touch point on buttons */
(function(){
  if(!document.body||!document.body.animate) return;
  const vis=FXH.inView;
  /* 1. ink ripple from the touch point on buttons */
  const RIP=".btn,.bb,.hact button,.hcreate,.rcard,.dsb";/* cards get the F1 light instead *//* not tabs: they switch with a view transition, which freezes a ripple mid-way */
  /* pooled: two wrappers reused, and each button's radius and colour read once */
  const RP=[], RC=new WeakMap();
  function rip(){ let w=RP.pop(); if(!w){ w=document.createElement("span"); w.className="mi-rip"; w.setAttribute("aria-hidden","true"); w.appendChild(document.createElement("i")); document.body.appendChild(w); } return w; }
  MI.on("pointerdown",(e) =>{ if(MI.rm()||e.button>0) return; const b=e.target.closest&&e.target.closest(RIP); if(!b||b.disabled||b.classList.contains("holdc")||b.closest(".slidec")) return;
    const r=b.getBoundingClientRect(); if(!vis(r)) return; let st=RC.get(b); if(!st){ const cs=getComputedStyle(b); st=[cs.borderRadius,cs.color]; RC.set(b,st); }
    const w=rip(), c=w.firstChild, d=Math.hypot(Math.max(e.clientX-r.left,r.right-e.clientX),Math.max(e.clientY-r.top,r.bottom-e.clientY))*2;
    w.style.cssText="left:"+r.left+"px;top:"+r.top+"px;width:"+r.width+"px;height:"+r.height+"px;border-radius:"+st[0]+";color:"+st[1];
    c.style.cssText="width:"+d+"px;height:"+d+"px;left:"+(e.clientX-r.left-d/2)+"px;top:"+(e.clientY-r.top-d/2)+"px";
    const an=c.animate([{transform:"scale(0)",opacity:.26},{transform:"scale(1)",opacity:0}],{duration:560,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ an.cancel(); w.style.cssText="display:none"; if(RP.length<3) RP.push(w); else w.remove(); }; },true);
})();
/* jelly squash on toggles, plus a small burst or smoke when one turns on */
(function(){
  if(!document.body||!document.body.animate) return;
  const C=FXH.center, vis=FXH.inView, burst=FXENV.__miBurst, smoke=FXENV.__miSmoke;
  /* 2. jelly squash on toggles (death saves, slots, hit dice, conditions, equip), plus a small burst when one turns on */
  const TOG=".pip,.bx,.chip[data-c],[data-condtoggle],.ichk,.lu-box,.islot,.thb,input[type=checkbox]";
  const jel=function(n){ n.classList.remove("mi-jelly"); void n.offsetWidth; n.classList.add("mi-jelly"); setTimeout(() =>{ n.classList.remove("mi-jelly"); },500); };
  MI.on("click",(e) =>{ if(MI.rm()) return; let t=e.target.closest&&e.target.closest(TOG); if(!t) return;
    if(!t.isConnected){ const a=t.getAttributeNames().filter((k) =>{ return k.indexOf("data-")===0; }).map((k) =>{ return "["+k+'="'+CSS.escape(t.getAttribute(k))+'"]'; }).join(""); t=a&&document.querySelector(t.tagName.toLowerCase()+a); if(!t) return; }/* the app redrew on pointerup */
    const p=C(t); if(!vis(p.r)) return;
    requestAnimationFrame(() =>{ let h=document.elementFromPoint(p.x,p.y), n=(h&&h.closest&&h.closest(TOG))||t;
      if(!n.isConnected){ const q=Array.prototype.filter.call(t.attributes,(a) =>{ return a.name.indexOf("data-")===0; }).map((a) =>{ return "["+a.name+'="'+(FXENV.CSS&&CSS.escape?CSS.escape(a.value):a.value)+'"]'; }).join("");
        n=q&&document.querySelector(t.tagName.toLowerCase()+q);
        if(!n){ if(q){ let k=0, again=function(){ const m=document.querySelector(t.tagName.toLowerCase()+q); if(m) jel(m); else if(++k<8) setTimeout(again,50); }; setTimeout(again,50); } return; } }/* the panel is mid-redraw: wait for it */
      if(!n.matches('.bx[data-k],#dsS .pip,#dsF .pip')){ jel(n); const n0=n; setTimeout(() =>{ if(n0.isConnected) return; const a=n0.getAttributeNames().filter((k) =>{ return k.indexOf("data-")===0; }).map((k) =>{ return "["+k+'="'+CSS.escape(n0.getAttribute(k))+'"]'; }).join(""); const m=a&&document.querySelector(n0.tagName.toLowerCase()+a); if(m) jel(m); },160); }/* redraws inside a View Transition land later */
      const on=n.getAttribute("aria-pressed")==="true"||n.classList.contains("on")||n.checked;
      if(n.closest(".spsl")){ if(on) smoke(p.x,p.y-4); else burst(p.x,p.y,{n:8,colors:["#ffd166","#fff3b0","#ff9f43"],shape:"mi-spark",dist:22,dur:450}); return; }/* spell slots are candles */
      if(on){ let cs=getComputedStyle(n), col=cs.backgroundColor;
        if(!col||col==="transparent"||/rgba\(0, 0, 0, 0\)/.test(col)) col=cs.borderColor; if(n.type==="checkbox") col="#d6453b"; burst(p.x,p.y,{n:7,colors:[col],dist:26,dur:520}); } }); },true);
})();
