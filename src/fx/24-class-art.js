/* === T6: class scene behind the sheet. PC: full background seen at the sides. Phone: a ribbon at the top that fades out. Off: Settings or html.mi-off === */
(function(){
  const A=window.__ART, D=document, H=D.documentElement; if(!A||!A.scene) return;
  function ls(k){ try{ return __store.getItem(k); }catch(e){ return null; } }
  let L=[], on=-1, curKey="", PHONE=matchMedia("(max-width:759px)");
  function layers(){ if(L.length) return L; for(let i=0;i<2;i++){ const e=D.createElement("div"); e.className="cls-art-l"; e.setAttribute("aria-hidden","true"); if(i===0) e.id="clsArt"; D.body.insertBefore(e,D.body.firstChild); L.push(e); } return L; }
  function homeOpen(){ const h=D.getElementById("homeV"); return !!h&&!h.hidden; }
  function emb(c){ const m=A.emblem&&A.emblem[c]; if(m&&ls("mi-clsart")!=="off"){ H.style.setProperty("--ca-emb",'url("'+m.p+'")'); H.classList.add("cls-emb"); } else { H.style.removeProperty("--ca-emb"); H.classList.remove("cls-emb"); } }
  /* which sheet page is open: phone uses the bottom bar, laptop uses the tabs. Main and Skills keep the class scene, so does Actions on a laptop */
  const PAGE=["","","actions","spells","inventory","features","description","notes","extras"], TAB={"p-spells":"spells","p-inv":"inventory","p-feat":"features","p-desc":"description","p-notes":"notes","p-ext":"extras"};
  function tabId(){ if(PHONE.matches){ const b=D.querySelector("#bnav button.on"); return PAGE[b?+b.getAttribute("data-go"):0]||""; } const t=D.querySelector('#tabs .tab[aria-selected="true"]'); return (t&&TAB[t.getAttribute("data-tab")])||""; }
  function pick(c){ const t=tabId(), x=t&&A.scn&&A.scn.tab&&A.scn.tab[t]; if(x&&x.pc&&x.phone) return {pc:x.pc,ph:x.phone,c:x.c,o:x.o}; const s=A.scene[c]; return s?{pc:s.pc.p,ph:s.phone.p,c:s.c,o:s.o}:null; }
  /* card art (css/37-g0-art.css): the class html.g0-art turns it on. Corner set follows the skin and palette */
  const COOL={ocean:1,royal:1,slate:1}, VINE={forest:1,grove:1}; let g0ok=false;
  function g0(){ const on=ls("mi-clsart")!=="off"&&g0ok&&!!(A.g0&&A.g0["corner-wood-tl"]), pal=H.getAttribute("data-pal")||"forest", skin=H.getAttribute("data-skin")||"ddb";
    H.setAttribute("data-corner",skin==="record"?"wood":VINE[pal]?"vine":COOL[pal]?"metal":"wood"); H.setAttribute("data-paper",COOL[pal]?"cool":"neutral"); H.classList.toggle("g0-art",on); }
  try{ if(A.g0&&A.g0["corner-wood-tl"]){ const pr=new Image(); pr.onload=function(){ g0ok=true; g0(); }; pr.src=A.g0["corner-wood-tl"]; new MutationObserver(g0).observe(H,{attributes:true,attributeFilter:["data-pal","data-skin"]}); } }catch(er){}
  function apply(){ let c=H.getAttribute("data-mi-cls")||"", t=null; emb(c); g0(); H.classList.toggle("home-art",ls("mi-clsart")!=="off"&&!!(A.g0&&A.g0["home-inn-phone"])); if(ls("mi-clsart")!=="off"&&!homeOpen()) t=pick(c);
    if(!t){ H.classList.remove("cls-art"); return; }
    H.classList.add("cls-art"); const key=t.pc+"|"+t.ph; if(key===curKey) return; curKey=key;
    const im=new Image(); im.onload=im.onerror=function(){ if(curKey!==key) return; const ls_=layers(), n=on<0?0:1-on, e=ls_[n];
      e.style.setProperty("--ca-pc",'url("'+t.pc+'")'); e.style.setProperty("--ca-ph",'url("'+t.ph+'")'); e.style.setProperty("--ca-c",t.c); e.style.setProperty("--ca-o",String(t.o?(PHONE.matches?t.o.ph:t.o.pc):.37));
      e.classList.add("on"); if(on>=0) ls_[on].classList.remove("on"); on=n; }; im.src=PHONE.matches?t.ph:t.pc; }
  let q=0; function soon(){ if(q) return; q=requestAnimationFrame(() =>{ q=0; apply(); }); }
  new MutationObserver(soon).observe(H,{attributes:true,attributeFilter:["data-mi-cls"]});
  const hv=D.getElementById("homeV"); if(hv) new MutationObserver(soon).observe(hv,{attributes:true,attributeFilter:["hidden"]});
  const tb=D.getElementById("tabs"); if(tb) new MutationObserver(soon).observe(tb,{attributes:true,subtree:true,attributeFilter:["aria-selected"]});
  const bn=D.getElementById("bnav"); if(bn) new MutationObserver(soon).observe(bn,{attributes:true,subtree:true,attributeFilter:["class"]});
  try{ PHONE.addEventListener("change",() =>{ curKey=""; soon(); }); }catch(er){}
  /* Small pictures for moments and states: window.__artVig("moment","level-up") gives <img> html, or "" when missing or Art is off */
  window.__artVig=function(g,id,px){ const v=A.vig&&A.vig[g]; if(!v||v.indexOf(id)<0||ls("mi-clsart")==="off") return ""; return '<img class="mi-vig" src="img/vig/'+g+'/'+id+'.avif" width="'+(px||112)+'" height="'+(px||112)+'" alt="" decoding="async">'; };
  try{ (window.requestIdleCallback||function(f){setTimeout(f,3000)})(() =>{ [["moment","natural-20"],["moment","natural-1"],["moment","level-up"],["moment","level-20"]].forEach((x) =>{ const i=new Image(); i.src="img/vig/"+x[0]+"/"+x[1]+".avif"; }); }); }catch(er){}
  /* Subclass emblem: window.__artSub("Fighter","Champion") gives <img> html, or "" */
  window.__artSub=function(cl,sub,px){ const id=bslug(cl)+"-"+bslug(sub); if(!A.esub||A.esub.indexOf(id)<0||ls("mi-clsart")==="off") return ""; return '<img class="art-sub" src="img/emblem/sub/'+id+'.avif" width="'+(px||28)+'" height="'+(px||28)+'" alt="" loading="lazy" decoding="async">'; };
  /* Bottom sheet: Settings and the rest pages get a faint scene behind their content */
  window.__artSheet=function(mode,title){ const sh=D.getElementById("sheet"); if(!sh) return; const id=mode==="theme"?"settings":mode==="rest"?(/^Short/.test(title)?"short-rest":"long-rest"):"", x=id&&A.scn&&A.scn.screen&&A.scn.screen[id];
    if(!x||!x.pc||!x.phone||ls("mi-clsart")==="off"){ sh.classList.remove("sh-scn"); sh.style.removeProperty("--sh-pc"); sh.style.removeProperty("--sh-ph"); return; }
    sh.style.setProperty("--sh-pc",'url("'+x.pc+'")'); sh.style.setProperty("--sh-ph",'url("'+x.phone+'")'); sh.classList.add("sh-scn"); };
  /* Builder: a faint scene behind each step. Class, Species and Background follow the pick, the rest use the builder scenes */
  let BL=[], bon=-1, bkey="", BSTEP={abil:"abilities",equip:"equipment",next:"review"};
  function bslug(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }
  /* Variants share the scene of their parent: Hill Dwarf uses dwarf, Human (2014) and Custom Lineage use human, Variant Noble uses noble.
     Order: own scene, listed parent, name without the bracket or "Variant", last word when it is a core family. Half-X never falls back */
  const PARENT={"custom-lineage":"human","variant-human":"human","hill-dwarf":"dwarf","mountain-dwarf":"dwarf","deep-one-dwarf":"dwarf","high-elf":"elf","wood-elf":"elf","eladrin-elf":"elf","pallid-elf":"elf","lightfoot-halfling":"halfling","stout-halfling":"halfling","ghostwise-halfling":"halfling","lotusden-halfling":"halfling","forest-gnome":"gnome","rock-gnome":"gnome","draconblood-dragonborn":"dragonborn","ravenite-dragonborn":"dragonborn"};
  const FAMILY=["elf","dwarf","halfling","gnome","human","dragonborn","orc","goblin","tiefling","aasimar","genasi","shifter"];
  function scnFind(m,n){ if(!m) return null; const k=bslug(n); if(m[k]) return m[k]; if(PARENT[k]&&m[PARENT[k]]) return m[PARENT[k]];
    const b=bslug(String(n||"").replace(/\s*\(.*$/,"").replace(/^variant\s+/i,"")); if(b&&m[b]) return m[b];
    const w=b.split("-").pop(); if(b.indexOf("half-")!==0&&FAMILY.indexOf(w)>=0&&m[w]) return m[w]; return null; }
  window.__scnFind=scnFind; let lastB=null;
  window.__bldArt=function(step,B){ const bl=D.getElementById("bld"); if(!bl) return; let g=A.scn||{}, x=null;
    if(ls("mi-clsart")!=="off"){
      if(step==="class"&&B&&B.cls){ const s=A.scene&&A.scene[bslug(B.cls)]; if(s) x={pc:s.pc.p,phone:s.phone.p,c:s.c}; }
      else if(step==="species"&&B&&B.species) x=scnFind(g.species,B.species);
      else if(step==="bg"&&B&&B.bg) x=scnFind(g.background,B.bg);
      if(x&&!(x.pc&&x.phone)) x=null;
      if(!x&&g.builder){ const id=BSTEP[step]||(step==="class"?"class":step==="species"?"species":step==="bg"?"background":""); x=id&&g.builder[id]; }
    }
    const key=x&&x.pc?x.pc:""; if(key===bkey) return; bkey=key;
    if(!BL.length){ for(let i=0;i<2;i++){ const e=D.createElement("div"); e.className="bld-art"; e.setAttribute("aria-hidden","true"); bl.insertBefore(e,bl.firstChild); BL.push(e); } }
    if(!key){ BL.forEach((e) =>{ e.classList.remove("on"); }); bon=-1; return; }
    const u=PHONE.matches?x.phone:x.pc, im=new Image(); im.onload=im.onerror=function(){ if(bkey!==key) return; const n=bon<0?0:1-bon, e=BL[n];
      e.style.setProperty("--ca-pc",'url("'+x.pc+'")'); e.style.setProperty("--ca-ph",'url("'+x.phone+'")'); e.style.setProperty("--ca-c",x.c||"#0f1417");
      e.classList.add("on"); if(bon>=0) BL[bon].classList.remove("on"); bon=n; }; im.src=u; };
  /* T11 G6 B3: the chosen class, species or background as a large picture at the top of its step (the same art as the backdrop, sharp
     and in full colour), with the name over it. Nothing when art is off or nothing is chosen yet */
  window.__bldBanner=function(step,B,body){ if(!body||ls("mi-clsart")==="off"||!B) return; lastB=B; let g=A.scn||{}, x=null, nm="";
    if(step==="class"&&B.cls){ const s=A.scene&&A.scene[bslug(B.cls)]; if(s) x={pc:s.pc.p,phone:s.phone.p}; nm=B.cls; }
    else if(step==="species"&&B.species){ x=scnFind(g.species,B.species); nm=B.species; }
    else if(step==="bg"&&B.bg){ x=scnFind(g.background,B.bg); nm=B.bg; }
    if(!x||!x.pc||!x.phone) return; const d=D.createElement("div"); d.className="bld-hero"; d.setAttribute("aria-hidden","true");
    d.innerHTML='<picture><source media="(min-width:760px)" srcset="'+x.pc+'"><img src="'+x.phone+'" alt="" decoding="async"></picture><b>'+String(nm).replace(/[&<>"]/g,"")+'</b>';
    const h=body.querySelector("h2.ttl"); if(h&&h.parentNode===body) body.insertBefore(d,h.nextSibling); else body.insertBefore(d,body.firstChild); };
  /* T11 G6 B4: the class and species lists become picture cards (the art of each choice beside its name and a 3-line summary) */
  window.__bldCards=function(body){ if(!body||ls("mi-clsart")==="off") return; const g=A.scn||{}, todo=[];
    Array.prototype.forEach.call(body.querySelectorAll(".pickrow[data-setcls],.pickrow[data-setsp]"),(b) =>{ let n=b.getAttribute("data-setcls")||b.getAttribute("data-setsp"), x=null;
      if(b.hasAttribute("data-setcls")){ const s=A.scene&&A.scene[bslug(n)]; if(s) x=s.phone.p; } else { const y=scnFind(g.species,n); if(y) x=y.phone; }
      if(!x) return; b.classList.add("pcard"); todo.push([b,x]); });
    /* the picture of a row loads when the row comes near the screen, not all at once */
    const put=(b,x) =>{ b.style.setProperty("--pc-art",'url("'+x+'")'); };
    if(!todo.length) { subCards(body); return; }
    if(!window.IntersectionObserver){ todo.forEach((t) =>{ put(t[0],t[1]); }); }
    else { const io=new IntersectionObserver((es) =>{ es.forEach((e) =>{ if(!e.isIntersecting) return; io.unobserve(e.target); put(e.target,e.target.__pcArt); }); },{rootMargin:"300px 0px"}); todo.forEach((t) =>{ t[0].__pcArt=t[1]; io.observe(t[0]); }); }
    subCards(body); };
  /* Class step: a strip of subclass cards (512x288, lazy) under the subclass list. A tap sets the list and fires its own change, so the builder logic stays the same */
  function subCards(body){ const sel=body.querySelector("select[data-subsel]"), B=lastB; if(!sel||!B||!B.cls||!A.scard||!A.scard.length) return;
    const cl=bslug(B.cls), items=Array.prototype.map.call(sel.options,(o) =>{ return {v:o.value,t:o.textContent}; }).filter((o) =>{ return o.v&&A.scard.indexOf(cl+"-"+bslug(o.v))>=0; }); if(!items.length) return;
    const w=D.createElement("div"); w.className="sub-cards"; w.setAttribute("role","group"); w.setAttribute("aria-label","Subclass pictures");
    w.innerHTML=items.map((o) =>{ const on=sel.value===o.v, k=cl+"-"+bslug(o.v); return '<button type="button" class="sub-card'+(on?" on":"")+'" data-subcard="'+o.v.replace(/"/g,"&quot;")+'" aria-pressed="'+on+'"><img src="img/scard/'+k+'.avif" alt="" width="512" height="288" loading="lazy" decoding="async"><span>'+o.t.replace(/[&<>"]/g,"")+'</span></button>'; }).join("");
    sel.parentNode.insertBefore(w,sel.nextSibling); }
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-subcard]"); if(!b) return; const sel=D.querySelector("#bld select[data-subsel]"); if(!sel) return; sel.value=b.getAttribute("data-subcard"); sel.dispatchEvent(new Event("change",{bubbles:true})); },true);
  function slug(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); }
  window.__artIc=function(cat,name){ const l=A.icon&&A.icon[cat]; if(!l||ls("mi-clsart")==="off") return ""; const k=slug(name); if(l.indexOf(k)<0) return ""; return '<img class="art-ic" src="img/icon/'+cat+'/'+k+'.avif" alt="" width="24" height="24" loading="lazy" decoding="async">'; };
  window.__clsArt=function(){ apply(); };
  window.__miArtH=function(){ const on=ls("mi-clsart")!=="off", B=function(v,l){ const a=(v==="on")===on; return '<button type="button" class="thb'+(a?" on":"")+'" data-miart="'+v+'" aria-pressed="'+a+'">'+l+'</button>'; };
    return '<div class="info-h">Art</div><div class="thg">'+B("on","On")+B("off","Off")+'</div><p class="info-d">Pictures of your class behind the sheet and on the empty portrait, and small icons on spells and gear. Cards stay solid, so text keeps its contrast.</p>'; };
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-miart]"); if(!b) return; try{ if(b.getAttribute("data-miart")==="off") __store.setItem("mi-clsart","off"); else __store.removeItem("mi-clsart"); }catch(er){}
    Array.prototype.forEach.call(D.querySelectorAll("[data-miart]"),(x) =>{ const a=x===b; x.classList.toggle("on",a); x.setAttribute("aria-pressed",a); }); window.__clsArt(); },true);
  window.__clsArt();
})();
