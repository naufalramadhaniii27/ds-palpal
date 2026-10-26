/* === F4: rows arrive the first time a page is seen, description reveals on scroll, containers open like folders, spending an item tears it === */
(function(){
  if(!document.body.animate||!window.IntersectionObserver) return; var EASE="cubic-bezier(.2,.8,.2,1)";
  var ROWS=".sp-r,.irow,.arow,.fitem,.aitem,.skr,.svr";
  /* Animated List v2: every row rises in the first time it scrolls on screen (Inventory, Spells, Actions, Features, Skills).
     A row is known by its text, so a redraw of the same list does not replay it. Full: a clear rise with a slight overshoot. Lite: a short soft one */
  var known=new Set(), batch=0, bT=0;
  var rio=new IntersectionObserver(function(es){ var i=0; es.forEach(function(en){ if(!en.isIntersecting) return; var r=en.target; rio.unobserve(r); if(MI.rm()) return;
      var k=(r.__miPg||"")+"|"+(r.textContent||"").replace(/\s+/g," ").slice(0,60); if(known.has(k)) return; known.add(k); if(known.size>4000) known.clear();
      var full=MI.full(), d=Math.min(i++,8)*(full?45:28);
      r.animate(full?[{opacity:0,transform:"translateY(28px) scale(.96)"},{opacity:1,transform:"translateY(-3px) scale(1.005)",offset:.7},{opacity:1,transform:"none"}]:[{opacity:0,transform:"translateY(8px)"},{opacity:1,transform:"none"}],
        {duration:full?520:280,delay:d,easing:full?"cubic-bezier(.2,.8,.2,1)":EASE,fill:"backwards"}); }); },{threshold:.12});
  function watchRows(id){ var s=document.getElementById(id); if(!s) return; var q=0;
    var scan=function(){ q=0; Array.prototype.forEach.call(s.querySelectorAll(ROWS),function(r){ if(r.__miW) return; r.__miW=1; r.__miPg=id; rio.observe(r); }); };
    new MutationObserver(function(){ if(!q){ q=1; (window.__miNF||setTimeout)(scan); } }).observe(s,{childList:true,subtree:true}); scan(); }
  setTimeout(function(){ ["p-actions","p-spells","p-inv","p-feat","p-skills"].forEach(watchRows); },1200);/* start after the app has settled which page shows */
  /* Scroll Reveal: description fields that hold text come up softly the first time they scroll into view */
  var rv={}, io2=new IntersectionObserver(function(es){ es.forEach(function(en){ if(!en.isIntersecting) return; io2.unobserve(en.target); var k=en.target.textContent.slice(0,40); if(rv[k]||MI.rm()) return; rv[k]=1;
      en.target.animate([{opacity:0,transform:"translateY(14px)"},{opacity:1,transform:"none"}],{duration:420,easing:EASE,fill:"backwards"}); }); },{threshold:.15});
  function watchDesc(){ var d=document.getElementById("descBody"); if(!d) return; Array.prototype.forEach.call(d.querySelectorAll(".dfield:not(.empty)"),function(f){ if(!f.querySelector("textarea:focus,input:focus")) io2.observe(f); }); }
  var db=document.getElementById("descBody"); if(db){ new MutationObserver(watchDesc).observe(db,{childList:true}); watchDesc(); }
  /* Folder: a container closes by folding its rows up (copies, the app has already redrawn) and opens by springing them out */
  function rowsAfter(b){ var L=[], x=b.nextElementSibling; while(x&&!x.matches("[data-ctog]")&&x.matches(".irow,.isub")){ L.push(x); x=x.nextElementSibling; } return L; }
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest("#invBody [data-ctog]"); if(!b||MI.rm()) return; var k=b.getAttribute("data-ctog"), wasOpen=b.getAttribute("aria-expanded")==="true";
    var ghosts=wasOpen?rowsAfter(b).slice(0,10).map(function(r){ return MI.ghost(r); }).filter(Boolean):[];
    ghosts.forEach(function(g,i){ g.animate([{opacity:1,transform:"none"},{opacity:0,transform:"translateY(-10px) scaleY(.85)"}],{duration:220,delay:(ghosts.length-1-i)*22,easing:"ease-in",fill:"forwards"}).onfinish=function(){ g.remove(); }; });
    requestAnimationFrame(function(){ var nb=null; Array.prototype.some.call(document.querySelectorAll("#invBody [data-ctog]"),function(x){ if(x.getAttribute("data-ctog")===k){ nb=x; return true; } }); if(!nb) return;
      nb.animate([{transform:"scale(.97)"},{transform:"scale(1.02)",offset:.5},{transform:"none"}],{duration:280,easing:EASE});
      if(nb.getAttribute("aria-expanded")==="true") rowsAfter(nb).slice(0,12).forEach(function(r,i){ r.animate([{opacity:0,transform:"translateY(-8px) scale(.98)"},{opacity:1,transform:"none"}],{duration:300,delay:40+i*30,easing:"cubic-bezier(.3,1.3,.5,1)",fill:"backwards"}); });
      MI.buzz("light"); }); },true);
  /* Tear Ticket: lowering an item's quantity tears a stub off the quantity box */
  window.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest('[data-iqd="-1"]'); if(!b||MI.rm()) return;/* window level: the app stops this click before the document */ var box=b.parentNode&&b.parentNode.querySelector("input"); if(!box||+box.value<1) return;
    var g1=MI.ghost(box), g2=MI.ghost(box); if(!g1||!g2) return; g1.style.clipPath="polygon(0 0,52% 0,46% 20%,54% 40%,46% 60%,54% 80%,48% 100%,0 100%)"; g2.style.clipPath="polygon(52% 0,100% 0,100% 100%,48% 100%,54% 80%,46% 60%,54% 40%,46% 20%)";
    g1.animate([{transform:"none",opacity:1},{transform:"translate(-14px,18px) rotate(-14deg)",opacity:0}],{duration:520,easing:"cubic-bezier(.4,0,.6,1)",fill:"forwards"}).onfinish=function(){ g1.remove(); };
    g2.animate([{transform:"none",opacity:1},{transform:"translate(14px,24px) rotate(12deg)",opacity:0}],{duration:520,easing:"cubic-bezier(.4,0,.6,1)",fill:"forwards"}).onfinish=function(){ g2.remove(); };
    MI.buzz("medium"); },true);
})();
