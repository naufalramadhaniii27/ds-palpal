/* === T6: class scene behind the sheet. PC: full background seen at the sides. Phone: a ribbon at the top that fades out. Off: Settings or html.mi-off === */
(function(){
  var A=window.__ART, D=document, H=D.documentElement; if(!A||!A.scene) return;
  function ls(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  var L=[], on=-1, curKey="", PHONE=matchMedia("(max-width:759px)");
  function layers(){ if(L.length) return L; for(var i=0;i<2;i++){ var e=D.createElement("div"); e.className="cls-art-l"; e.setAttribute("aria-hidden","true"); if(i===0) e.id="clsArt"; D.body.insertBefore(e,D.body.firstChild); L.push(e); } return L; }
  function homeOpen(){ var h=D.getElementById("homeV"); return !!h&&!h.hidden; }
  function emb(c){ var m=A.emblem&&A.emblem[c]; if(m&&ls("mi-clsart")!=="off"){ H.style.setProperty("--ca-emb",'url("'+m.p+'")'); H.classList.add("cls-emb"); } else { H.style.removeProperty("--ca-emb"); H.classList.remove("cls-emb"); } }
  /* which sheet page is open: phone uses the bottom bar, laptop uses the tabs. Main and Skills keep the class scene, so does Actions on a laptop */
  var PAGE=["","","actions","spells","inventory","features","description","notes","extras"], TAB={"p-spells":"spells","p-inv":"inventory","p-feat":"features","p-desc":"description","p-notes":"notes","p-ext":"extras"};
  function tabId(){ if(PHONE.matches){ var b=D.querySelector("#bnav button.on"); return PAGE[b?+b.getAttribute("data-go"):0]||""; } var t=D.querySelector('#tabs .tab[aria-selected="true"]'); return (t&&TAB[t.getAttribute("data-tab")])||""; }
  function pick(c){ var t=tabId(), x=t&&A.scn&&A.scn.tab&&A.scn.tab[t]; if(x&&x.pc&&x.phone) return {pc:x.pc,ph:x.phone,c:x.c}; var s=A.scene[c]; return s?{pc:s.pc.p,ph:s.phone.p,c:s.c}:null; }
  function apply(){ var c=H.getAttribute("data-mi-cls")||"", t=null; emb(c); if(ls("mi-clsart")!=="off"&&!homeOpen()) t=pick(c);
    if(!t){ H.classList.remove("cls-art"); return; }
    H.classList.add("cls-art"); var key=t.pc+"|"+t.ph; if(key===curKey) return; curKey=key;
    var im=new Image(); im.onload=im.onerror=function(){ if(curKey!==key) return; var ls_=layers(), n=on<0?0:1-on, e=ls_[n];
      e.style.setProperty("--ca-pc",'url("'+t.pc+'")'); e.style.setProperty("--ca-ph",'url("'+t.ph+'")'); e.style.setProperty("--ca-c",t.c);
      e.classList.add("on"); if(on>=0) ls_[on].classList.remove("on"); on=n; }; im.src=PHONE.matches?t.ph:t.pc; }
  var q=0; function soon(){ if(q) return; q=requestAnimationFrame(function(){ q=0; apply(); }); }
  new MutationObserver(soon).observe(H,{attributes:true,attributeFilter:["data-mi-cls"]});
  var hv=D.getElementById("homeV"); if(hv) new MutationObserver(soon).observe(hv,{attributes:true,attributeFilter:["hidden"]});
  var tb=D.getElementById("tabs"); if(tb) new MutationObserver(soon).observe(tb,{attributes:true,subtree:true,attributeFilter:["aria-selected"]});
  var bn=D.getElementById("bnav"); if(bn) new MutationObserver(soon).observe(bn,{attributes:true,subtree:true,attributeFilter:["class"]});
  try{ PHONE.addEventListener("change",function(){ curKey=""; soon(); }); }catch(er){}
  /* Small pictures for moments and states: window.__artVig("moment","level-up") gives <img> html, or "" when missing or Art is off */
  window.__artVig=function(g,id,px){ var v=A.vig&&A.vig[g]; if(!v||v.indexOf(id)<0||ls("mi-clsart")==="off") return ""; return '<img class="mi-vig" src="img/vig/'+g+'/'+id+'.avif" width="'+(px||112)+'" height="'+(px||112)+'" alt="" decoding="async">'; };
  try{ (window.requestIdleCallback||function(f){setTimeout(f,3000)})(function(){ [["moment","natural-20"],["moment","natural-1"],["moment","level-up"]].forEach(function(x){ var i=new Image(); i.src="img/vig/"+x[0]+"/"+x[1]+".avif"; }); }); }catch(er){}
  /* Builder: a faint scene behind each step. Class, Species and Background follow the pick, the rest use the builder scenes */
  var BL=[], bon=-1, bkey="", BSTEP={abil:"abilities",equip:"equipment",next:"review"};
  function bslug(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
  window.__bldArt=function(step,B){ var bl=D.getElementById("bld"); if(!bl) return; var g=A.scn||{}, x=null;
    if(ls("mi-clsart")!=="off"){
      if(step==="class"&&B&&B.cls){ var s=A.scene&&A.scene[bslug(B.cls)]; if(s) x={pc:s.pc.p,phone:s.phone.p,c:s.c}; }
      else if(step==="species"&&B&&B.species) x=g.species&&g.species[bslug(B.species)];
      else if(step==="bg"&&B&&B.bg) x=g.background&&g.background[bslug(B.bg)];
      if(!x&&g.builder){ var id=BSTEP[step]||(step==="class"?"class":step==="species"?"species":step==="bg"?"background":""); x=id&&g.builder[id]; }
    }
    var key=x&&x.pc?x.pc:""; if(key===bkey) return; bkey=key;
    if(!BL.length){ for(var i=0;i<2;i++){ var e=D.createElement("div"); e.className="bld-art"; e.setAttribute("aria-hidden","true"); bl.insertBefore(e,bl.firstChild); BL.push(e); } }
    if(!key){ BL.forEach(function(e){ e.classList.remove("on"); }); bon=-1; return; }
    var u=PHONE.matches?x.phone:x.pc, im=new Image(); im.onload=im.onerror=function(){ if(bkey!==key) return; var n=bon<0?0:1-bon, e=BL[n];
      e.style.setProperty("--ca-pc",'url("'+x.pc+'")'); e.style.setProperty("--ca-ph",'url("'+x.phone+'")'); e.style.setProperty("--ca-c",x.c||"#0f1417");
      e.classList.add("on"); if(bon>=0) BL[bon].classList.remove("on"); bon=n; }; im.src=u; };
  function slug(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
  window.__artIc=function(cat,name){ var l=A.icon&&A.icon[cat]; if(!l||ls("mi-clsart")==="off") return ""; var k=slug(name); if(l.indexOf(k)<0) return ""; return '<img class="art-ic" src="img/icon/'+cat+'/'+k+'.avif" alt="" width="24" height="24" loading="lazy" decoding="async">'; };
  window.__clsArt=function(){ apply(); };
  window.__miArtH=function(){ var on=ls("mi-clsart")!=="off", B=function(v,l){ var a=(v==="on")===on; return '<button type="button" class="thb'+(a?" on":"")+'" data-miart="'+v+'" aria-pressed="'+a+'">'+l+'</button>'; };
    return '<div class="info-h">Art</div><div class="thg">'+B("on","On")+B("off","Off")+'</div><p class="info-d">Pictures of your class behind the sheet and on the empty portrait, and small icons on spells and gear. Cards stay solid, so text keeps its contrast.</p>'; };
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-miart]"); if(!b) return; try{ if(b.getAttribute("data-miart")==="off") localStorage.setItem("mi-clsart","off"); else localStorage.removeItem("mi-clsart"); }catch(er){}
    Array.prototype.forEach.call(D.querySelectorAll("[data-miart]"),function(x){ var a=x===b; x.classList.toggle("on",a); x.setAttribute("aria-pressed",a); }); window.__clsArt(); },true);
  window.__clsArt();
})();
