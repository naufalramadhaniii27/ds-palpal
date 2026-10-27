/* === T6: class scene behind the sheet. PC: full background seen at the sides. Phone: a ribbon at the top that fades out. Off: Settings or html.mi-off === */
(function(){
  var A=window.__ART, D=document, H=D.documentElement; if(!A||!A.scene) return;
  function ls(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  var el=null, cur="";
  function ensure(){ if(el) return el; el=D.createElement("div"); el.id="clsArt"; el.setAttribute("aria-hidden","true"); D.body.insertBefore(el,D.body.firstChild); return el; }
  function homeOpen(){ var h=D.getElementById("homeV"); return !!h&&!h.hidden; }
  function emb(c){ var m=A.emblem&&A.emblem[c]; if(m&&ls("mi-clsart")!=="off"){ H.style.setProperty("--ca-emb",'url("'+m.p+'")'); H.classList.add("cls-emb"); } else { H.style.removeProperty("--ca-emb"); H.classList.remove("cls-emb"); } }
  function apply(){ var c=H.getAttribute("data-mi-cls")||"", s0=emb(c), s=A.scene[c], ok=!!s&&ls("mi-clsart")!=="off"&&!homeOpen();
    if(!ok){ H.classList.remove("cls-art"); return; }
    var e=ensure(); if(c!==cur){ cur=c; e.style.setProperty("--ca-pc",'url("'+s.pc.p+'")'); e.style.setProperty("--ca-ph",'url("'+s.phone.p+'")'); e.style.setProperty("--ca-c",s.c); }
    H.classList.add("cls-art"); }
  var q=0; function soon(){ if(q) return; q=requestAnimationFrame(function(){ q=0; apply(); }); }
  new MutationObserver(soon).observe(H,{attributes:true,attributeFilter:["data-mi-cls"]});
  var hv=D.getElementById("homeV"); if(hv) new MutationObserver(soon).observe(hv,{attributes:true,attributeFilter:["hidden"]});
  function slug(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
  window.__artIc=function(cat,name){ var l=A.icon&&A.icon[cat]; if(!l||ls("mi-clsart")==="off") return ""; var k=slug(name); if(l.indexOf(k)<0) return ""; return '<img class="art-ic" src="img/icon/'+cat+'/'+k+'.avif" alt="" width="24" height="24" loading="lazy" decoding="async">'; };
  window.__clsArt=function(){ emb(H.getAttribute("data-mi-cls")||""); apply(); };
  window.__miArtH=function(){ var on=ls("mi-clsart")!=="off", B=function(v,l){ var a=(v==="on")===on; return '<button type="button" class="thb'+(a?" on":"")+'" data-miart="'+v+'" aria-pressed="'+a+'">'+l+'</button>'; };
    return '<div class="info-h">Art</div><div class="thg">'+B("on","On")+B("off","Off")+'</div><p class="info-d">Pictures of your class behind the sheet and on the empty portrait, and small icons on spells and gear. Cards stay solid, so text keeps its contrast.</p>'; };
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-miart]"); if(!b) return; try{ if(b.getAttribute("data-miart")==="off") localStorage.setItem("mi-clsart","off"); else localStorage.removeItem("mi-clsart"); }catch(er){}
    Array.prototype.forEach.call(D.querySelectorAll("[data-miart]"),function(x){ var a=x===b; x.classList.toggle("on",a); x.setAttribute("aria-pressed",a); }); window.__clsArt(); },true);
  window.__clsArt();
})();
