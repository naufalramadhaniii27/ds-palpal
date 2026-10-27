/* === T6: class scene behind the sheet. PC: full background seen at the sides. Phone: a ribbon at the top that fades out. Off: Settings or html.mi-off === */
(function(){
  var A=window.__ART, D=document, H=D.documentElement; if(!A||!A.scene) return;
  function ls(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  var el=null, cur="";
  function ensure(){ if(el) return el; el=D.createElement("div"); el.id="clsArt"; el.setAttribute("aria-hidden","true"); D.body.insertBefore(el,D.body.firstChild); return el; }
  function homeOpen(){ var h=D.getElementById("homeV"); return !!h&&!h.hidden; }
  function apply(){ var c=H.getAttribute("data-mi-cls")||"", s=A.scene[c], ok=!!s&&ls("mi-clsart")!=="off"&&!homeOpen();
    if(!ok){ H.classList.remove("cls-art"); return; }
    var e=ensure(); if(c!==cur){ cur=c; e.style.setProperty("--ca-pc",'url("'+s.pc.p+'")'); e.style.setProperty("--ca-ph",'url("'+s.phone.p+'")'); e.style.setProperty("--ca-c",s.c); }
    H.classList.add("cls-art"); }
  var q=0; function soon(){ if(q) return; q=requestAnimationFrame(function(){ q=0; apply(); }); }
  new MutationObserver(soon).observe(H,{attributes:true,attributeFilter:["data-mi-cls"]});
  var hv=D.getElementById("homeV"); if(hv) new MutationObserver(soon).observe(hv,{attributes:true,attributeFilter:["hidden"]});
  window.__clsArt=apply; apply();
})();
