/* --- v55: Peek Rating on slot rows (spell slots, limited uses, death saves) --- */
(function(){
  if(!document.body||!document.body.animate) return;
  
  const FINE=!!(FXENV.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  const SEL='.bx[data-k],#dsS .pip,#dsF .pip';
  function row(b){ const k=b.getAttribute("data-k"); return Array.prototype.filter.call(b.parentNode.children,(x) =>{ return x.matches&&x.matches(SEL)&&x.getAttribute("data-k")===k; }); }
  function on(b){ return b.getAttribute("aria-pressed")==="true"; }
  function clear(L){ L.forEach((x) =>{ x.classList.remove("mi-peek","mi-ghost","mi-unghost"); x.style.transitionDelay=""; }); }
  let cur=null;
  if(FINE&&!MI.rm()){
    MI.on("pointerover",(e) =>{ if(e.pointerType!=="mouse"||MI.rm()) return; const b=e.target.closest&&e.target.closest(SEL); if(!b){ if(cur){ clear(cur); cur=null; } return; }
      const L=row(b), i=L.indexOf(b), used=L.filter(on).length, to=(used===i+1)?i:i+1; if(cur&&cur!==L) clear(cur); cur=L;
      L.forEach((x,j) =>{ const lift=j<=i, will=j<to; x.style.transitionDelay=(lift?j*28:0)+"ms"; x.classList.toggle("mi-peek",lift);
        x.classList.toggle("mi-ghost",will&&!on(x)); x.classList.toggle("mi-unghost",!will&&on(x)); }); },{passive:true});
    document.documentElement.addEventListener("mouseleave",() =>{ if(cur){ clear(cur); cur=null; } });
  }
  /* click: remember the row before, pop what changed after the sheet redraws it */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest(SEL); if(!b||MI.rm()) return; const L=row(b), before=L.map(on), i=L.indexOf(b), r=b.getBoundingClientRect(), par=b.parentNode, k=b.getAttribute("data-k");
    requestAnimationFrame(() =>{ const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2), nb=(h&&h.closest&&h.closest(SEL))||b; if(!nb.isConnected) return; let N=row(nb), n=0;
      N.forEach((x,j) =>{ if(before[j]===undefined||before[j]===on(x)) return; const d=(on(x)?j:(N.length-1-j))*38; n++;
        x.animate([{transform:"translateY(0) scale(1)"},{transform:"translateY(-7px) scale(1.28)",offset:.45},{transform:"translateY(0) scale(.94)",offset:.75},{transform:"none"}],{duration:420,delay:d,easing:"cubic-bezier(.2,.8,.2,1)"}); }); }); },true);
})();
/* Immersive Effects and vibration buttons in Settings */
MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-mifx],[data-mibz]"); if(!b) return;
  if(b.hasAttribute("data-mifx")) MI.set("mode",b.getAttribute("data-mifx")); else MI.set("bz",b.getAttribute("data-mibz")); MI.buzz("light"); },true);
