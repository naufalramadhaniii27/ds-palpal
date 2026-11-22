/* === Immersive brief, stage 3 gaps: hit pulse on any HP drop, condition tint, header hides on scroll down, staggered rows on tab change.
   Everything else in the brief already lives in earlier fx files (MI switch, class colour, class art, odometer, nat 20, crystals, morph). === */
(function(){
  const MI=FXENV.__MI, H=document.documentElement;
  if(!MI) return;
  const on=function(){ return MI.mode!=="off"; };
  /* HP drop: red edge pulse and a short buzz, whatever lowered the number (Damage, scrub, undo) */
  let hp=null, ht=0;
  function hpNow(){ const e=document.querySelector("#hpBox .hp-cur"); const v=e?parseInt(e.textContent,10):NaN; return isNaN(v)?null:v; }
  function hpCheck(){ const v=hpNow(); if(v==null) return; if(hp!=null&&v<hp&&on()){ H.classList.remove("imm-hit"); void H.offsetWidth; H.classList.add("imm-hit"); clearTimeout(ht); ht=setTimeout(() =>{ H.classList.remove("imm-hit"); },900); MI.buzz("heavy"); } hp=v; }
  /* active condition: the screen takes a slight tint */
  function cond(){ H.classList.toggle("imm-cond",on()&&!!document.querySelector('#conds .chip.cnd[data-info^="g:"]')); }
  let q=0; function kick(){ if(!q){ q=1; setTimeout(() =>{ q=0; hpCheck(); cond(); },30); } }
  function arm(){ const b=document.getElementById("hpBox"), c=document.getElementById("conds");
    if(b) new MutationObserver(kick).observe(b,{childList:true,subtree:true,characterData:true});
    if(c) new MutationObserver(kick).observe(c,{childList:true,subtree:true,attributes:true});
    hp=hpNow(); cond(); }
  if(document.getElementById("hpBox")) arm(); else addEventListener("load",arm,{once:true});
  new MutationObserver(cond).observe(H,{attributes:true,attributeFilter:["class"]});
})();
(function(){
  const MI=FXENV.__MI, H=document.documentElement;
  if(!MI) return;
  const moving=function(){ return MI.mode!=="off"&&!MI.rm(); };
  /* header hides while scrolling down a tab and comes back on any scroll up */
  const last=new WeakMap(); let finger=0;/* only a finger or wheel scroll hides it, never a scroll the app makes */
  ["touchmove","wheel"].forEach((k) =>{ addEventListener(k,() =>{ finger=Date.now(); },{passive:true}); });
  MI.on("scroll",(e) =>{ const t=e.target; if(!t||t.nodeType!==1||!t.closest("#pager")||Date.now()-finger>600) return; const y=t.scrollTop, p=last.get(t)||0; last.set(t,y);
    if(Math.abs(y-p)<6) return; H.classList.toggle("imm-hdn",moving()&&y>p&&y>60); },true);
})();
(function(){
  const MI=FXENV.__MI, H=document.documentElement;
  if(!MI) return;
  /* tab change: the visible rows of the new tab enter one after another */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-go]"); H.classList.remove("imm-hdn"); if(!b||!MI.full()) return;
    setTimeout(() =>{ const L=[].filter.call(document.querySelectorAll("#pager>.pcur .arow,#pager>.pcur .sp-r,#pager>.pcur .card"),(r) =>{ const x=r.getBoundingClientRect(); return x.width&&x.top<innerHeight&&x.bottom>0; }).slice(0,8);
      L.forEach((r,i) =>{ r.animate([{opacity:0,transform:"translateY(10px)"},{opacity:1,transform:"none"}],{duration:320,delay:i*40,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); }); },120); });
})();
