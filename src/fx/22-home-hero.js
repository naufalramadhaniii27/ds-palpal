/* === T3: Home hero. The edge of the hero lights up where the pointer is (the cards already have their own light, fx/02) (laptop, mouse only). Text is never touched.
   Each frame changes only two custom properties. Off when Immersive is not Full or reduced motion is on. === */
(function(){
  var MI=window.__MI; if(!MI) return; var cur=null, q=0, px=0, py=0;
  function paint(){ q=0; if(!cur||!cur.isConnected) return; var r=cur.getBoundingClientRect(); cur.style.setProperty("--mx",(px-r.left)+"px"); cur.style.setProperty("--my",(py-r.top)+"px"); }
  MI.on("pointermove",function(e){ if(e.pointerType!=="mouse"||!MI.full()) return; var c=e.target.closest&&e.target.closest("#homeV .hhero");
    if(cur&&cur!==c){ cur.classList.remove("hx-lit"); cur=null; }
    if(!c) return; if(cur!==c){ cur=c; c.classList.add("hx-lit"); } px=e.clientX; py=e.clientY; if(!q){ q=1; requestAnimationFrame(paint); } });
  document.addEventListener("pointerleave",function(){ if(cur){ cur.classList.remove("hx-lit"); cur=null; } },true);
})();
