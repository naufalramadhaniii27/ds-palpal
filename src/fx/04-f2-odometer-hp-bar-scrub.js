/* === F2: odometer, liquid HP bar, scrub fields === */
const FXS04A={};
(function(){
  if(!document.body.animate) return;
  /* odometer: each digit is a column 0-9 that rolls; anything else (+, -, space) stays still. The element keeps an aria-label with the value. */
  /* a digit column holds 0-9 plus a blank (row 10), so a number can grow or shrink a digit while rolling */
  const COL="0\n1\n2\n3\n4\n5\n6\n7\n8\n9\n\u00a0";/* one text node per column: few elements, so a colour change on the number stays cheap */
  function row(ch){ return /\d/.test(ch)?+ch:10; }
  function build(el,txt){ let h=""; for(let i=0;i<txt.length;i++){ const ch=txt[i]; h+=(/[\d ]/.test(ch))?'<span><i style="transform:translateY(-'+row(ch)+'em)">'+COL+'</i></span>':'<span>'+ch+'</span>'; } el.innerHTML='<span class="mi-odo" aria-hidden="true">'+h+'</span>'; }
  function pad(t,n){ while(t.length<n) t=" "+t; return t; }
  FXENV.__miOdo=function(el,val){ if(!el) return; const to=String(val), from=el.getAttribute("data-miv"); el.setAttribute("data-miv",to); el.setAttribute("aria-label",to);
    if(MI.rm()||from===null||from===to){ if(!el.querySelector(".mi-odo")&&el.textContent!==to) el.textContent=to; if(MI.rm()&&el.querySelector(".mi-odo")) el.textContent=to; return; }
    const n=Math.max(from.length,to.length), f=pad(from,n), t=pad(to,n);
    if(!/^[\d ]*$/.test(f+t)){ el.textContent=to; return; }
    build(el,f); const cols=el.querySelectorAll(".mi-odo>span>i");
    __miNF(() =>{ __miNF(() =>{ for(let i=0;i<n;i++) if(cols[i]) cols[i].style.transform="translateY(-"+row(t[i])+"em)"; }); });
    if(t!==to) setTimeout(() =>{ if(el.getAttribute("data-miv")===to) build(el,to); },500); };
})();
(function(){
  if(!document.body.animate) return;
  FXENV.__miOdoVal=function(el){ return el?(el.getAttribute("data-miv")||el.textContent.trim()):""; };

  /* liquid HP bar: a slow shimmer on the fill, clipped to the fill, plus a slosh when Hit Points change */
  FXS04A.liquid=function liquid(bar,fill){ if(!bar||!fill||bar.querySelector(".mi-wave")) return; bar.classList.add("mi-liq"); const w=document.createElement("span"); w.className="mi-wave"; w.setAttribute("aria-hidden","true"); bar.appendChild(w); };;
  FXS04A.frac=function frac(fill){ const m=/scaleX\(([\d.]+)\)/.exec(fill.style.transform||""); return m?+m[1]:1; };;
  FXS04A.lastP={};
})();
(function(){
  if(!document.body.animate) return;
  /* p comes from the final value (one update per change), never from the bar's spring, which writes every frame */
  FXS04A.track=function track(fillSel,getP,watch,opt){ const fill=document.querySelector(fillSel), bar=fill&&fill.parentNode; if(!fill) return; FXS04A.liquid(bar,fill);
    const upd=function(){ let p=getP(fill); if(p==null||isNaN(p)) return; p=Math.max(0,Math.min(1,p)); const w=bar.querySelector(".mi-wave"); if(w) w.style.setProperty("--p",(p*100).toFixed(1)+"%");
      const old=FXS04A.lastP[fillSel]; FXS04A.lastP[fillSel]=p; if(old===undefined||Math.abs(old-p)<.001||MI.rm()) return;
      if(w&&MI.full()){ w.classList.remove("mi-run"); void w.offsetWidth; w.classList.add("mi-run"); clearTimeout(w.__t); w.__t=setTimeout(() =>{ w.classList.remove("mi-run"); },2500); }/* the shimmer runs after a change only */
      bar.animate([{transform:"scaleY(1)"},{transform:"scaleY("+(p<old?1.9:1.6)+") skewX("+(p<old?-8:6)+"deg)"},{transform:"scaleY(.8)"},{transform:"none"}],{duration:520,easing:"cubic-bezier(.3,1.5,.5,1)"});
      if(MI.full()&&FXENV.__miBurst){ const r=bar.getBoundingClientRect(); if(r.width&&r.bottom>0&&r.top<innerHeight) FXENV.__miBurst(r.left+r.width*p,r.top+r.height/2,{n:6,colors:[getComputedStyle(fill).backgroundColor,"rgba(255,255,255,.8)"],dist:20,dur:520,grav:true}); } };
    let q=0; new MutationObserver(() =>{ if(!q){ q=1; requestAnimationFrame(() =>{ q=0; upd(); }); } }).observe(watch(fill),opt); upd(); };
})();
(function(){
  if(!document.body.animate) return;
  ;
  function hpP(){ const c=document.getElementById("hpCur"), m=document.getElementById("hpMax"); const v=+(c&&(c.getAttribute("data-miv")||c.textContent)), mx=+(m&&(m.getAttribute("data-v")||m.textContent)); return mx?v/mx:null; }
  function arm(){ FXS04A.track("#hpBar",hpP,() =>{ return document.getElementById("hpCur"); },{attributes:true,attributeFilter:["data-miv"],childList:true,characterData:true,subtree:true});
    FXS04A.track("#vbBar",(f) =>{ return FXS04A.frac(f); },(f) =>{ return f; },{attributes:true,attributeFilter:["style"]}); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",arm); else arm();

  /* scrub fields: drag sideways on Temporary HP or a coin amount to change it; a plain tap still types */
  let SC="#tmpV,#coinDlg [data-camt]", S=null;
  FXS04A.mark=function mark(){ Array.prototype.forEach.call(document.querySelectorAll(SC),(x) =>{ x.classList.add("mi-scrub"); }); };;
  MI.on("pointerdown",(e) =>{ const t=e.target.closest&&e.target.closest(SC); if(!t||e.button>0) return; FXS04A.mark(); S={t:t,x:e.clientX,v:Math.max(0,Math.floor(+t.value||0)),on:false,id:e.pointerId,last:null}; },true);
  MI.on("pointermove",(e) =>{ if(!S||e.pointerId!==S.id) return; const dx=e.clientX-S.x; if(!S.on){ if(Math.abs(dx)<7) return; S.on=true; S.t.classList.add("mi-scrubbing"); try{ S.t.setPointerCapture(e.pointerId); }catch(er){} S.t.blur(); }
    const v=Math.max(0,S.v+Math.round(dx/9)); if(v!==S.last){ S.last=v; S.t.value=v; MI.buzz("light"); } });
  function end(){ if(!S) return; const s=S; S=null; if(!s.on) return; s.t.classList.remove("mi-scrubbing");
    s.t.dispatchEvent(new Event("input",{bubbles:true})); s.t.dispatchEvent(new Event("change",{bubbles:true}));
    const stop=function(ev){ ev.preventDefault(); ev.stopPropagation(); document.removeEventListener("click",stop,true); }; document.addEventListener("click",stop,true); setTimeout(() =>{ document.removeEventListener("click",stop,true); },50); }
  MI.on("pointerup",end,true); MI.on("pointercancel",end,true);
})();
(function(){
  if(!document.body.animate) return;
  new MutationObserver(() =>{ const d=document.getElementById("coinDlg"); if(d) FXS04A.mark(); }).observe(document.getElementById("sheetBody")||document.body,{childList:true}); FXS04A.mark();
})();
