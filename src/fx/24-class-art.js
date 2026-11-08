/* === T6: class scene behind the sheet. PC: full background seen at the sides. Phone: a ribbon at the top that fades out. Off: Settings or html.mi-off === */
const FXS24A={};
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  FXS24A.bslug=function bslug(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); };
  /* Class step: a strip of subclass cards (512x288, lazy) under the subclass list. A tap sets the list and fires its own change, so the builder logic stays the same */
  FXS24A.subCards=function subCards(body){ const sel=body.querySelector("select[data-subsel]"), B=FXS24A.lastB; if(!sel||!B||!B.cls||!A.scard||!A.scard.length) return;
    const cl=FXS24A.bslug(B.cls), items=Array.prototype.map.call(sel.options,(o) =>{ return {v:o.value,t:o.textContent}; }).filter((o) =>{ return o.v&&A.scard.indexOf(cl+"-"+FXS24A.bslug(o.v))>=0; }); if(!items.length) return;
    const w=D.createElement("div"); w.className="sub-cards"; w.setAttribute("role","group"); w.setAttribute("aria-label","Subclass pictures");
    items.forEach((o) =>{ const on=sel.value===o.v, k=cl+"-"+FXS24A.bslug(o.v), bt=D.createElement("button"), im=D.createElement("img"), sp=D.createElement("span");
      bt.type="button"; bt.className="sub-card"+(on?" on":""); bt.setAttribute("data-subcard",o.v); bt.setAttribute("aria-pressed",String(on));
      im.src="img/scard/"+k+".avif"; im.alt=""; im.width=512; im.height=288; im.loading="lazy"; im.decoding="async"; sp.textContent=o.t; bt.append(im,sp); w.appendChild(bt); });
    sel.parentNode.insertBefore(w,sel.nextSibling); };
  FXS24A.ls=function ls(k){ try{ return __store.getItem(k); }catch(e){ return null; } };;
  let L=[]; FXS24A.on=-1; FXS24A.curKey=""; FXS24A.PHONE=matchMedia("(max-width:759px)");
  FXS24A.layers=function layers(){ if(L.length) return L; for(let i=0;i<2;i++){ const e=D.createElement("div"); e.className="cls-art-l"; e.setAttribute("aria-hidden","true"); if(i===0) e.id="clsArt"; D.body.insertBefore(e,D.body.firstChild); L.push(e); } return L; };;
  FXS24A.homeOpen=function homeOpen(){ const h=D.getElementById("homeV"); return !!h&&!h.hidden; };;
  FXS24A.emb=function emb(c){ const m=A.emblem&&A.emblem[c]; if(m&&FXS24A.ls("mi-clsart")!=="off"){ H.style.setProperty("--ca-emb",'url("'+m.p+'")'); H.classList.add("cls-emb"); } else { H.style.removeProperty("--ca-emb"); H.classList.remove("cls-emb"); } };;
  /* which sheet page is open: phone uses the bottom bar, laptop uses the tabs. Main and Skills keep the class scene, so does Actions on a laptop */
  FXS24A.PAGE=["","","actions","spells","inventory","features","description","notes","extras"]; FXS24A.TAB={"p-spells":"spells","p-inv":"inventory","p-feat":"features","p-desc":"description","p-notes":"notes","p-ext":"extras"};
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  function tabId(){ if(FXS24A.PHONE.matches){ const b=D.querySelector("#bnav button.on"); return FXS24A.PAGE[b?+b.getAttribute("data-go"):0]||""; } const t=D.querySelector('#tabs .tab[aria-selected="true"]'); return (t&&FXS24A.TAB[t.getAttribute("data-tab")])||""; }
  FXS24A.pick=function pick(c){ const t=tabId(), x=t&&A.scn&&A.scn.tab&&A.scn.tab[t]; if(x&&x.pc&&x.phone) return {pc:x.pc,ph:x.phone,c:x.c,o:x.o}; const s=A.scene[c]; return s?{pc:s.pc.p,ph:s.phone.p,c:s.c,o:s.o}:null; };;
  /* card art (css/37-g0-art.css): the class html.g0-art turns it on. Corner set follows the skin and palette */
  const COOL={ocean:1,royal:1,slate:1}; FXS24A.g0ok=false;/* card corners were dropped by the owner (2026-11-03): only paper, divider, badge, crest and wipe */
  FXS24A.g0=function g0(){ const on=FXS24A.ls("mi-clsart")!=="off"&&FXS24A.g0ok&&!!(A.g0&&A.g0["divider-wood"]), pal=H.getAttribute("data-pal")||"forest";
    H.setAttribute("data-paper",COOL[pal]?"cool":"neutral"); H.classList.toggle("g0-art",on); };
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  ;
  try{ if(A.g0&&A.g0["divider-wood"]){ const pr=new Image(); pr.onload=function(){ FXS24A.g0ok=true; FXS24A.g0(); }; pr.src=A.g0["divider-wood"]; new MutationObserver(FXS24A.g0).observe(H,{attributes:true,attributeFilter:["data-pal","data-skin"]}); } }catch(er){}
  FXS24A.apply=function apply(){ let c=H.getAttribute("data-mi-cls")||"", t=null; FXS24A.emb(c); FXS24A.g0(); H.classList.toggle("home-art",FXS24A.ls("mi-clsart")!=="off"&&!!(A.g0&&A.g0["home-inn-phone"])); if(FXS24A.ls("mi-clsart")!=="off"&&!FXS24A.homeOpen()) t=FXS24A.pick(c);
    if(!t){ H.classList.remove("cls-art"); return; }
    H.classList.add("cls-art"); const key=t.pc+"|"+t.ph; if(key===FXS24A.curKey) return; FXS24A.curKey=key;
    const im=new Image(); im.onload=im.onerror=function(){ if(FXS24A.curKey!==key) return; const ls_=FXS24A.layers(), n=FXS24A.on<0?0:1-FXS24A.on, e=ls_[n];
      e.style.setProperty("--ca-pc",'url("'+t.pc+'")'); e.style.setProperty("--ca-ph",'url("'+t.ph+'")'); e.style.setProperty("--ca-c",t.c); e.style.setProperty("--ca-o",String(t.o?(FXS24A.PHONE.matches?t.o.ph:t.o.pc):.37));
      e.classList.add("on"); if(FXS24A.on>=0) ls_[FXS24A.on].classList.remove("on"); FXS24A.on=n; }; im.src=FXS24A.PHONE.matches?t.ph:t.pc; };;
  let q=0; FXS24A.soon=function soon(){ if(q) return; q=requestAnimationFrame(() =>{ q=0; FXS24A.apply(); }); };;
  new MutationObserver(FXS24A.soon).observe(H,{attributes:true,attributeFilter:["data-mi-cls"]});
  FXS24A.hv=D.getElementById("homeV");
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
 if(FXS24A.hv) new MutationObserver(FXS24A.soon).observe(FXS24A.hv,{attributes:true,attributeFilter:["hidden"]});
  const tb=D.getElementById("tabs"); if(tb) new MutationObserver(FXS24A.soon).observe(tb,{attributes:true,subtree:true,attributeFilter:["aria-selected"]});
  const bn=D.getElementById("bnav"); if(bn) new MutationObserver(FXS24A.soon).observe(bn,{attributes:true,subtree:true,attributeFilter:["class"]});
  try{ FXS24A.PHONE.addEventListener("change",() =>{ FXS24A.curKey=""; FXS24A.soon(); }); }catch(er){}
  /* Small pictures for moments and states: window.__artVig("moment","level-up") gives <img> html, or "" when missing or Art is off */
  FXENV.__artVig=function(g,id,px){ const v=A.vig&&A.vig[g]; if(!v||v.indexOf(id)<0||FXS24A.ls("mi-clsart")==="off") return ""; return '<img class="mi-vig" src="img/vig/'+g+'/'+id+'.avif" width="'+(px||112)+'" height="'+(px||112)+'" alt="" decoding="async">'; };
  try{ (FXENV.requestIdleCallback||function(f){setTimeout(f,3000)})(() =>{ [["moment","natural-20"],["moment","natural-1"],["moment","level-up"],["moment","level-20"]].forEach((x) =>{ const i=new Image(); i.src="img/vig/"+x[0]+"/"+x[1]+".avif"; }); }); }catch(er){}
  /* Subclass emblem: window.__artSub("Fighter","Champion") gives <img> html, or "" */
  FXENV.__artSub=function(cl,sub,px){ const id=FXS24A.bslug(cl)+"-"+FXS24A.bslug(sub); if(!A.esub||A.esub.indexOf(id)<0||FXS24A.ls("mi-clsart")==="off") return ""; return '<img class="art-sub" src="img/emblem/sub/'+id+'.avif" width="'+(px||28)+'" height="'+(px||28)+'" alt="" loading="lazy" decoding="async">'; };
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  /* Bottom sheet: Settings and the rest pages get a faint scene behind their content */
  FXENV.__artSheet=function(mode,title){ const sh=D.getElementById("sheet"); if(!sh) return; const id=mode==="theme"?"settings":mode==="rest"?(/^Short/.test(title)?"short-rest":"long-rest"):"", x=id&&A.scn&&A.scn.screen&&A.scn.screen[id];
    if(!x||!x.pc||!x.phone||FXS24A.ls("mi-clsart")==="off"){ sh.classList.remove("sh-scn"); sh.style.removeProperty("--sh-pc"); sh.style.removeProperty("--sh-ph"); return; }
    sh.style.setProperty("--sh-pc",'url("'+x.pc+'")'); sh.style.setProperty("--sh-ph",'url("'+x.phone+'")'); sh.classList.add("sh-scn"); };
  /* Builder: a faint scene behind each step. Class, Species and Background follow the pick, the rest use the builder scenes */
  FXS24A.BL=[]; FXS24A.bon=-1; FXS24A.bkey=""; FXS24A.BSTEP={abil:"abilities",equip:"equipment",next:"review"};;
  /* Variants share the scene of their parent: Hill Dwarf uses dwarf, Human (2014) and Custom Lineage use human, Variant Noble uses noble.
     Order: own scene, listed parent, name without the bracket or "Variant", last word when it is a core family. Half-X never falls back */
  FXS24A.PARENT={"custom-lineage":"human","variant-human":"human","hill-dwarf":"dwarf","mountain-dwarf":"dwarf","deep-one-dwarf":"dwarf","high-elf":"elf","wood-elf":"elf","eladrin-elf":"elf","pallid-elf":"elf","lightfoot-halfling":"halfling","stout-halfling":"halfling",
    "ghostwise-halfling":"halfling","lotusden-halfling":"halfling","forest-gnome":"gnome","rock-gnome":"gnome","draconblood-dragonborn":"dragonborn","ravenite-dragonborn":"dragonborn"};
  FXS24A.FAMILY=["elf","dwarf","halfling","gnome","human","dragonborn","orc","goblin","tiefling","aasimar","genasi","shifter"];
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  FXS24A.scnFind=function scnFind(m,n){ if(!m) return null; const k=FXS24A.bslug(n); if(m[k]) return m[k]; if(FXS24A.PARENT[k]&&m[FXS24A.PARENT[k]]) return m[FXS24A.PARENT[k]];
    const b=FXS24A.bslug(String(n||"").replace(/\s*\(.*$/,"").replace(/^variant\s+/i,"")); if(b&&m[b]) return m[b];
    const w=b.split("-").pop(); if(b.indexOf("half-")!==0&&FXS24A.FAMILY.indexOf(w)>=0&&m[w]) return m[w]; return null; };;
  FXENV.__scnFind=FXS24A.scnFind; FXENV.__bslug=FXS24A.bslug; FXS24A.lastB=null;
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  FXS24A.bldMatch=function bldMatch(step,B,g){ let x=null;
    if(step==="class"&&B&&B.cls){ const s=A.scene&&A.scene[FXS24A.bslug(B.cls)]; if(s) x={pc:s.pc.p,phone:s.phone.p,c:s.c}; }
    else if(step==="species"&&B&&B.species) x=FXS24A.scnFind(g.species,B.species);
    else if(step==="bg"&&B&&B.bg) x=FXS24A.scnFind(g.background,B.bg);
    return x; };
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  ;
  FXS24A.bldPick=function bldPick(step,B,g){ let x=null;
    if(FXS24A.ls("mi-clsart")!=="off"){
      x=FXS24A.bldMatch(step,B,g);
      if(x&&!(x.pc&&x.phone)) x=null;
      if(!x&&g.builder){ const id=FXS24A.BSTEP[step]||(step==="class"?"class":step==="species"?"species":step==="bg"?"background":""); x=id&&g.builder[id]; }
    }
    return x; };;
  FXS24A.bldFade=function bldFade(x,key){
    const u=FXS24A.PHONE.matches?x.phone:x.pc, im=new Image(); im.onload=im.onerror=function(){ if(FXS24A.bkey!==key) return; const n=FXS24A.bon<0?0:1-FXS24A.bon, e=FXS24A.BL[n];
      e.style.setProperty("--ca-pc",'url("'+x.pc+'")'); e.style.setProperty("--ca-ph",'url("'+x.phone+'")'); e.style.setProperty("--ca-c",x.c||"#0f1417");
      e.classList.add("on"); if(FXS24A.bon>=0) FXS24A.BL[FXS24A.bon].classList.remove("on"); FXS24A.bon=n; }; im.src=u; };
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  ;
  FXENV.__bldArt=function(step,B){ const bl=D.getElementById("bld"); if(!bl) return; let g=A.scn||{};
    const x=FXS24A.bldPick(step,B,g);
    const key=x&&x.pc?x.pc:""; if(key===FXS24A.bkey) return; FXS24A.bkey=key;
    if(!FXS24A.BL.length){ for(let i=0;i<2;i++){ const e=D.createElement("div"); e.className="bld-art"; e.setAttribute("aria-hidden","true"); bl.insertBefore(e,bl.firstChild); FXS24A.BL.push(e); } }
    if(!key){ FXS24A.BL.forEach((e) =>{ e.classList.remove("on"); }); FXS24A.bon=-1; return; }
    FXS24A.bldFade(x,key); };
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  /* T11 G6 B3: the chosen class, species or background as a large picture at the top of its step (the same art as the backdrop, sharp
     and in full colour), with the name over it. Nothing when art is off or nothing is chosen yet */
  FXENV.__bldBanner=function(step,B,body){ if(!body||FXS24A.ls("mi-clsart")==="off"||!B) return; FXS24A.lastB=B; let g=A.scn||{}, x=null, nm="";
    if(step==="class"&&B.cls){ const s=A.scene&&A.scene[FXS24A.bslug(B.cls)]; if(s) x={pc:s.pc.p,phone:s.phone.p}; nm=B.cls; }
    else if(step==="species"&&B.species){ x=FXS24A.scnFind(g.species,B.species); nm=B.species; }
    else if(step==="bg"&&B.bg){ x=FXS24A.scnFind(g.background,B.bg); nm=B.bg; }
    if(!x||!x.pc||!x.phone) return; const d=D.createElement("div"); d.className="bld-hero"; d.setAttribute("aria-hidden","true");
    d.innerHTML='<picture><source media="(min-width:760px)" srcset="'+x.pc+'"><img src="'+x.phone+'" alt="" decoding="async"></picture><b>'+String(nm).replace(/[&<>"]/g,"")+'</b>';
    const h=body.querySelector("h2.ttl"); if(h&&h.parentNode===body) body.insertBefore(d,h.nextSibling); else body.insertBefore(d,body.firstChild); };
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  /* T11 G6 B4: the class and species lists become picture cards (the art of each choice beside its name and a 3-line summary) */
  FXENV.__bldCards=function(body){ if(!body||FXS24A.ls("mi-clsart")==="off") return; const g=A.scn||{}, todo=[];
    Array.prototype.forEach.call(body.querySelectorAll(".pickrow[data-setcls],.pickrow[data-setsp]"),(b) =>{ let n=b.getAttribute("data-setcls")||b.getAttribute("data-setsp"), x=null;
      if(b.hasAttribute("data-setcls")){ const s=A.scene&&A.scene[FXS24A.bslug(n)]; if(s) x=s.phone.p; } else { const y=FXS24A.scnFind(g.species,n); if(y) x=y.phone; }
      if(!x) return; b.classList.add("pcard"); todo.push([b,x]); });
    /* the picture of a row loads when the row comes near the screen, not all at once */
    const put=(b,x) =>{ b.style.setProperty("--pc-art",'url("'+x+'")'); };
    if(!todo.length) { FXS24A.subCards(body); return; }
    if(!FXENV.IntersectionObserver){ todo.forEach((t) =>{ put(t[0],t[1]); }); }
    else { const io=new IntersectionObserver((es) =>{ es.forEach((e) =>{ if(!e.isIntersecting) return; io.unobserve(e.target); put(e.target,e.target.__pcArt); }); },{rootMargin:"300px 0px"}); todo.forEach((t) =>{ t[0].__pcArt=t[1]; io.observe(t[0]); }); }
    FXS24A.subCards(body); };;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-subcard]"); if(!b) return; const sel=D.querySelector("#bld select[data-subsel]"); if(!sel) return; sel.value=b.getAttribute("data-subcard"); sel.dispatchEvent(new Event("change",{bubbles:true})); },true);
  FXS24A.slug=function slug(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,""); };
})();
(function(){
  const A=FXENV.__ART, D=document, H=D.documentElement;
  if(!A||!A.scene) return;
  ;
  FXENV.__artIc=function(cat,name){ const l=A.icon&&A.icon[cat]; if(!l||FXS24A.ls("mi-clsart")==="off") return ""; const k=FXS24A.slug(name); if(l.indexOf(k)<0) return ""; return '<img class="art-ic" src="img/icon/'+cat+'/'+k+'.avif" alt="" width="24" height="24" loading="lazy" decoding="async">'; };
  FXENV.__clsArt=function(){ FXS24A.apply(); };
  FXENV.__miArtH=function(){ const on=FXS24A.ls("mi-clsart")!=="off", B=function(v,l){ const a=(v==="on")===on; return '<button type="button" class="thb'+(a?" on":"")+'" data-miart="'+v+'" aria-pressed="'+a+'">'+l+'</button>'; };
    return '<div class="info-h">Art</div><div class="thg">'+B("on","On")+B("off","Off")+'</div><p class="info-d">Pictures of your class behind the sheet and on the empty portrait, and small icons on spells and gear. Cards stay solid, so text keeps its contrast.</p>'; };
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-miart]"); if(!b) return; try{ if(b.getAttribute("data-miart")==="off") __store.setItem("mi-clsart","off"); else __store.removeItem("mi-clsart"); }catch(er){}
    Array.prototype.forEach.call(D.querySelectorAll("[data-miart]"),(x) =>{ const a=x===b; x.classList.toggle("on",a); x.setAttribute("aria-pressed",a); }); FXENV.__clsArt(); },true);
  FXENV.__clsArt();
})();
