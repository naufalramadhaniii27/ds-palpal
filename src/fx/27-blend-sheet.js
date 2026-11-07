/* === Blended detail sheet. The picture of an entry fills the top of the sheet and fades into the panel; the title sits over it. 
   Transparent icons get a blurred copy of themselves as the backdrop plus a glow and grain. Scenes (species, background, class) run full width and stay anchored to the top.
   Tint, accent line and compact header take the main colour of the picture, measured in the browser. Off with Art off. Motion stops with prefers-reduced-motion. === */
/* Split into small closures (SOLID stage 8, S): each one does one job and shares the page parts through BLEND.K, built by the first closure.
   If the sheet is missing nothing else runs, as before. The order of the DOM work inside __blendSheet is unchanged. */
const BLEND={};
/* 1. the page parts */
(function(){
  const D=document, A=FXENV.__ART||{}, RM=matchMedia("(prefers-reduced-motion:reduce)"), sh=D.getElementById("sheet"), body=D.getElementById("sheetBody"); if(!sh||!body) return;
  BLEND.K={D:D,A:A,RM:RM,sh:sh,body:body,
    pic:function(c,u){ const i=D.createElement("img"); i.className=c; i.src=u; i.alt=""; i.decoding="async"; return i; },
    ls:function(k){ try{ return __store.getItem(k); }catch(e){ return null; } }};
})();
/* 2. main colour: a 24 px copy, saturated and opaque pixels count most. A picture from another origin cannot be read, then the caller falls back */
(function(K){ if(!K) return; const D=K.D, sh=K.sh;
  K.measure=function(img){ try{ const c=D.createElement("canvas"); c.width=c.height=24; const x=c.getContext("2d",{willReadFrequently:true}); x.drawImage(img,0,0,24,24); const d=x.getImageData(0,0,24,24).data; let r=0,g=0,b=0,w=0;
      for(let i=0;i<d.length;i+=4){ const a=d[i+3]/255; if(a<.25) continue; const R=d[i],G=d[i+1],B=d[i+2], mx=Math.max(R,G,B), mn=Math.min(R,G,B), wt=a*(.12+(mx-mn)/(mx||1))*(mx<28?.15:1); r+=R*wt; g+=G*wt; b+=B*wt; w+=wt; }
      if(!w) return null; r/=w; g/=w; b/=w; const k=Math.max(r,g,b), f=k<150?150/(k||1):1; return [Math.min(255,r*f)|0,Math.min(255,g*f)|0,Math.min(255,b*f)|0]; }catch(e){ return null; } };
  K.hex2rgb=function(h){ const m=/^#([0-9a-f]{6})$/i.exec(h||""); return m?[parseInt(m[1].slice(0,2),16),parseInt(m[1].slice(2,4),16),parseInt(m[1].slice(4,6),16)]:null; };
  K.setC=function(rgb){ if(rgb) sh.style.setProperty("--bl-c",rgb.join(",")); };
})(BLEND.K);
/* 3. creatures: the 5etools picture stays first, a small Codex painting in the corner swaps the two with a crossfade (owner, option B) */
(function(K){ if(!K) return; const D=K.D, A=K.A, RM=K.RM;
  K.mslug=function(t){ return String(t||"").toLowerCase().replace(/\s*\([^)]*\)\s*$/,"").replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); };
  K.swapBtn=function(th){ const b=D.createElement("button"); b.type="button"; b.className="bl-swap"; b.setAttribute("aria-pressed","false"); b.setAttribute("aria-label","Show the painted version"); b.style.backgroundImage='url("'+th+'")'; return b; };
  K.swapLook=function(b,alt,orig,th){ b.style.backgroundImage='url("'+(alt?orig:th)+'")'; b.setAttribute("aria-pressed",String(alt)); b.setAttribute("aria-label",alt?"Show the book picture":"Show the painted version"); };
  K.monSwap=function(wm,img,title,orig){ const k=K.mslug(title); if(!(A.mon||[]).includes(k)) return;
    const cu="img/hd/mon/"+k+".avif", th="img/mon/"+k+".avif", b=K.swapBtn(th); let alt=false;
    b.addEventListener("click",(ev) =>{ ev.stopPropagation(); alt=!alt; const to=alt?cu:orig, bg=wm.querySelector(".bl-bg");
      img.classList.add("bl-xf"); setTimeout(() =>{ img.src=to; if(bg) bg.style.backgroundImage='url("'+to+'")'; img.classList.remove("bl-xf"); },RM.matches?0:200);
      K.swapLook(b,alt,orig,th); });
    wm.appendChild(b); };
})(BLEND.K);
/* 4. which painted picture belongs to a creature picture: the alt text, the sheet title (Bandit Captain, never the shared Bandits.webp), else the 5etools file name. null when the painted set has none */
(function(K){ if(!K) return; const A=K.A;
  const has=(x) =>!!x&&(A.mon||[]).includes(x);
  K.monKey=function(im,fn){ let k=K.mslug(im.getAttribute("alt")); const sh=im.closest(".sheet"), ttl=im.closest("#lib")?document.getElementById("libT"):sh&&sh.querySelector("#sheetTitle,h2");
    if(!has(k)&&ttl) k=K.mslug(ttl.textContent.replace(/\s*\([^)]*\)\s*$/,"")); if(!has(k)) k=K.mslug(fn); if(!has(k)) k=K.mslug(fn.replace(/s$/,"")); return has(k)?k:null; };
})(BLEND.K);
/* 4b. creature pictures outside the blended hero (Library detail, creature cards): same swap, the 5etools picture first */
(function(K){ if(!K) return; const D=K.D, A=K.A, RM=K.RM;
  function wrapMon(im){ if(im.closest(".sh-wm,.mon-sw")||!/bestiary\//.test(im.getAttribute("src")||"")) return; const fn=decodeURIComponent(((im.getAttribute("src")||"").split("/").pop()||"").replace(/\.[a-z0-9]+$/i,"")); const k=K.monKey(im,fn); if(!k) return;
    const tok=im.classList.contains("tok"), w=D.createElement("span"); w.className="mon-sw"; im.parentNode.insertBefore(w,im); w.appendChild(im); const orig=im.getAttribute("src"), cu="img/hd/mon/"+k+".avif", th="img/mon/"+k+".avif", b=K.swapBtn(th); let alt=false;
    b.addEventListener("click",(ev) =>{ ev.stopPropagation(); ev.preventDefault(); alt=!alt; im.classList.add("bl-xf"); setTimeout(() =>{ im.src=alt?cu:orig; im.classList.toggle("mon-alt",alt); if(tok) im.classList.toggle("tok",!alt); im.classList.remove("bl-xf"); },RM.matches?0:200);
      K.swapLook(b,alt,orig,th); });
    w.appendChild(b); }
  function scanMon(root){ if(!A.mon||!root.querySelectorAll) return; root.querySelectorAll('img.lib-im[src*="bestiary/"]').forEach(wrapMon); }
  new MutationObserver((ms) =>{ ms.forEach((m) =>{ m.addedNodes.forEach((n) =>{ if(n.nodeType===1){ if(n.matches&&n.matches('img.lib-im')) wrapMon(n); else scanMon(n); } }); }); }).observe(D.body,{childList:true,subtree:true});
})(BLEND.K);
/* 5. the scene of an entry that has no 5etools picture: species, background or a class */
(function(K){ if(!K) return; const A=K.A;
  /* a Library entry names its kind: lib:species|Drow, lib:bg|Acolyte, lib:class|Fighter. Gives a scene, or null to go on with the title */
  K.libScene=function(sp,f,g,sl){
    if(sp[1]==="species"||sp[1]==="race"){ const r=f(g.species,sp[2]); if(r) return r; } if(sp[1]==="bg"||sp[1]==="background"){ const r=f(g.background,sp[2]); if(r) return r; } if(sp[1]==="class"&&sl&&A.scene){ const s2=A.scene[sl(sp[2])];
      if(s2) return {phone:s2.phone.p,pc:s2.pc.p,c:s2.c}; } return null; };
})(BLEND.K);
(function(K){ if(!K) return; const A=K.A, sh=K.sh;
  K.sceneOf=function(title){ const t=String(title||""), g=A.scn||{}, f=FXENV.__scnFind, sl=FXENV.__bslug; let m;
    const sp=/^lib:([a-z]+)\|(.+)$/.exec(sh.dataset.spec||"");
    if(sp&&f){ const r=K.libScene(sp,f,g,sl); if(r) return r; }
    if((m=/^Species: (.+)$/.exec(t))&&f) return f(g.species,m[1]); if((m=/^Background: (.+)$/.exec(t))&&f) return f(g.background,m[1]);
    if(sl&&(m=/^(.+) Subclass: (.+)$/.exec(t))&&A.scard&&A.scard.indexOf(sl(m[1])+"-"+sl(m[2]))>=0){ const u="img/scard/"+sl(m[1])+"-"+sl(m[2])+".avif"; return {phone:u,pc:u}; }
    if(sl&&A.scene&&typeof CLASSES==="object"&&CLASSES[t]){ const s=A.scene[sl(t)]; return s?{phone:s.phone.p,pc:s.pc.p,c:s.c}:null; } return null; };
})(BLEND.K);
/* 6. title block over the fade: price chip on the right of the title, then one line of subtitle and the rarity chip */
(function(K){ if(!K) return; const D=K.D, sh=K.sh, body=K.body;
  function priceChip(hd){ let cost="";
    [].some.call(body.querySelectorAll("small"),(e) =>{ if(/^(cost|price)$/i.test(e.textContent.trim())){ cost=(e.parentNode.textContent||"").replace(e.textContent,"").trim(); return true; } return false; });
    if(cost&&cost.length<18){ const p=D.createElement("span"); p.className="bl-price"; p.textContent=cost; hd.appendChild(p); sh.style.setProperty("--bl-pw",(Math.ceil(p.offsetWidth)+12)+"px"); } }
  /* [subtitle, rarity chip or null]. Library entries: "Uncommon Wondrous Item" gives the chip and the subtitle */
  function subAndRarity(){ const dc=body.querySelector(".dc"), ic=body.querySelector(".info-meta .info-cat"); let sub=dc?((dc.innerText||"").split("\n")[0]||"").trim():"", rl=body.querySelector(".rline");
    if(!rl&&ic){ const rm=/^(Common|Uncommon|Rare|Very Rare|Legendary|Artifact)\b\s*(.*)$/i.exec((ic.textContent||"").trim()); if(rm){ rl=D.createElement("span"); rl.className="rline r-"+rm[1].toLowerCase().replace(/\s+/g,""); rl.textContent=rm[1]; if(!sub) sub=rm[2];
      sh.classList.add("bl-im"); } }
    return [sub,rl]; }
  K.titleBits=function(){ const hd=D.getElementById("sheetHead"); priceChip(hd); const sr=subAndRarity(), sub=sr[0], rl=sr[1];
    if((sub&&sub.length<42)||rl){ const m=D.createElement("div"); m.className="bl-meta"; if(sub&&sub.length<42){ const t=D.createElement("span"); t.textContent=sub; m.appendChild(t); } if(rl){ const c=rl.cloneNode(true); c.removeAttribute("id"); m.appendChild(c); } hd.appendChild(m); } };
})(BLEND.K);
/* 7. the hero picture: the Codex icon of an item or spell, the scene or the icon, and the backdrop layers */
(function(K){ if(!K) return; const D=K.D, sh=K.sh;
  /* items and spells: the Codex icon (HD) instead of the book photo. Gives the new picture, or null */
  function codexIcon(wm,title){
    for(const c of ["spell","item"]){ const h=FXENV.__artIc(c,title); if(h){ const m=/src="img\/icon\/([^"]+)"/.exec(h); if(m){ const ni=K.pic("art-ic","img/hd/icon/"+m[1]); ni.setAttribute("data-fb","img/icon/"+m[1]); wm.replaceChildren(ni); return ni; } } } return null; }
  /* the picture to blend: species, class, background, subclass scene first, else the entry icon. null for a line icon only */
  K.heroOf=function(wm,title){ let img=wm.querySelector("img.art-ic,img.lib-im,img.art-sub"), sc=K.sceneOf(title);
    if(!sc&&img&&img.classList.contains("lib-im")&&FXENV.__artIc){ const ni=codexIcon(wm,title); if(ni) img=ni; }
    return (!img&&!sc)?null:{img:img,sc:sc}; };
  /* the backdrop layers of a scene or of a transparent icon. Gives {img, src} */
  K.backdrop=function(wm,hero){ let img=hero.img, sc=hero.sc, src="";
    if(sc){ const u=sc.phone||sc.pc; src=u; const ni=K.pic("bl-sc",u); ni.setAttribute("fetchpriority","high"); wm.replaceChildren(ni); wm.classList.add("bl-s"); sh.classList.add("bl-scn"); K.setC(K.hex2rgb(sc.c)); img=ni; }
    else { src=img.currentSrc||img.getAttribute("src")||""; wm.classList.add("bl-i"); sh.classList.add("bl-ico");
      ["bl-bg","bl-glow","bl-grain"].forEach((c) =>{ const e=D.createElement("i"); e.className=c; e.setAttribute("aria-hidden","true"); if(c==="bl-bg") e.style.backgroundImage='url("'+src+'")'; wm.insertBefore(e,wm.firstChild); }); }
    return {img:img,src:src}; };
})(BLEND.K);
/* 8. scroll parallax and the settle step: the line under the hero, the title bits, the tint once the picture is measured, the cascade index and the entrance */
(function(K){ if(!K) return; const D=K.D, RM=K.RM, sh=K.sh, body=K.body; let raf=0, heroH=0;
  function sync(){ raf=0; const y=body.scrollTop, h=heroH||1; sh.style.setProperty("--bl-py",(RM.matches?0:Math.round(y*.35))+"px"); sh.style.setProperty("--bl-op",String(Math.max(0,1-y/(h*1.1)).toFixed(2))); sh.classList.toggle("bl-compact",y>h*.72); }
  body.addEventListener("scroll",() =>{ if(!sh.classList.contains("blend")||raf) return; raf=requestAnimationFrame(sync); },{passive:true});
  K.settle=function(wm,img,keep){ heroH=0;
    const ln=D.createElement("div"); ln.className="bl-line"; ln.setAttribute("aria-hidden","true"); wm.after(ln); K.titleBits(); sh.style.setProperty("--bl-hero",wm.offsetHeight+"px"); sh.style.setProperty("--bl-hh",(D.getElementById("sheetHead").offsetHeight||81)+"px");
    const done=() =>{ heroH=wm.offsetHeight||1; const m=K.measure(img); if(m) K.setC(m); sync(); };
    if(img.complete&&img.naturalWidth) done(); else img.addEventListener("load",done,{once:true});
    [].forEach.call(body.children,(e,i) =>{ e.style.setProperty("--i",String(Math.min(i,9))); });
    if(!keep) body.scrollTop=0; sync(); if(!RM.matches&&!keep){ sh.classList.remove("bl-in"); void sh.offsetWidth; sh.classList.add("bl-in"); } };
})(BLEND.K);
/* 9. the entry point the detail sheet calls */
(function(K){ if(!K) return; const D=K.D, sh=K.sh, body=K.body;
  function off(){ sh.classList.remove("blend","bl-compact","bl-in","bl-scn","bl-ico","bl-im"); ["--bl-c","--bl-py","--bl-op","--bl-hero","--bl-pw"].forEach((k) =>{ sh.style.removeProperty(k); }); sh.querySelectorAll(".bl-meta,.bl-price,.bl-line").forEach((e) =>{ e.remove(); }); }
  FXENV.__blendSheet=function(mode,title,keep){ off(); if(mode!=="info"||K.ls("mi-clsart")==="off") return; const wm=D.getElementById("shWm"); if(!wm||!wm.parentNode||wm.parentNode!==body) return;
    const hero=K.heroOf(wm,title); if(!hero) return;
    wm.classList.remove("bl-s","bl-i"); wm.querySelectorAll(".bl-bg,.bl-glow,.bl-grain,.bl-sc").forEach((e) =>{ e.remove(); });
    const bd=K.backdrop(wm,hero);
    if(!hero.sc&&bd.img.classList.contains("lib-im")&&/bestiary\//.test(bd.src)) K.monSwap(wm,bd.img,title,bd.src);
    sh.classList.add("blend"); K.settle(wm,bd.img,keep); };
})(BLEND.K);
