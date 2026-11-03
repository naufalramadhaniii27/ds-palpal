/* === Blended detail sheet. The picture of an entry fills the top of the sheet and fades into the panel; the title sits over it. 
   Transparent icons get a blurred copy of themselves as the backdrop plus a glow and grain. Scenes (species, background, class) run full width and stay anchored to the top.
   Tint, accent line and compact header take the main colour of the picture, measured in the browser. Off with Art off. Motion stops with prefers-reduced-motion. === */
(function(){
  const D=document, A=window.__ART||{}, RM=matchMedia("(prefers-reduced-motion:reduce)"), sh=D.getElementById("sheet"), body=D.getElementById("sheetBody"); if(!sh||!body) return;
  let raf=0, heroH=0;
  function ls(k){ try{ return __store.getItem(k); }catch(e){ return null; } }
  function off(){ sh.classList.remove("blend","bl-compact","bl-in","bl-scn","bl-ico"); ["--bl-c","--bl-py","--bl-op","--bl-hero","--bl-pw"].forEach((k) =>{ sh.style.removeProperty(k); }); sh.querySelectorAll(".bl-meta,.bl-price,.bl-line").forEach((e) =>{ e.remove(); }); }
  /* title block over the fade: price chip on the right of the title, then one line of subtitle and the rarity chip */
  function titleBits(){ const hd=D.getElementById("sheetHead"); let cost="";
    [].some.call(body.querySelectorAll("small"),(e) =>{ if(/^(cost|price)$/i.test(e.textContent.trim())){ cost=(e.parentNode.textContent||"").replace(e.textContent,"").trim(); return true; } return false; });
    if(cost&&cost.length<18){ const p=D.createElement("span"); p.className="bl-price"; p.textContent=cost; hd.appendChild(p); sh.style.setProperty("--bl-pw",(Math.ceil(p.offsetWidth)+12)+"px"); }
    const dc=body.querySelector(".dc"), sub=dc?((dc.innerText||"").split("\n")[0]||"").trim():"", rl=body.querySelector(".rline");
    if((sub&&sub.length<42)||rl){ const m=D.createElement("div"); m.className="bl-meta"; if(sub&&sub.length<42){ const t=D.createElement("span"); t.textContent=sub; m.appendChild(t); } if(rl){ const c=rl.cloneNode(true); c.removeAttribute("id"); m.appendChild(c); } hd.appendChild(m); } }
  /* the scene of an entry that has no 5etools picture: species, background or a class */
  function sceneOf(title){ const t=String(title||""), g=A.scn||{}, f=window.__scnFind, sl=window.__bslug; let m;
    if((m=/^Species: (.+)$/.exec(t))&&f) return f(g.species,m[1]); if((m=/^Background: (.+)$/.exec(t))&&f) return f(g.background,m[1]);
    if(sl&&(m=/^(.+) Subclass: (.+)$/.exec(t))&&A.scard&&A.scard.indexOf(sl(m[1])+"-"+sl(m[2]))>=0){ const u="img/scard/"+sl(m[1])+"-"+sl(m[2])+".avif"; return {phone:u,pc:u}; }
    if(sl&&A.scene&&typeof CLASSES==="object"&&CLASSES[t]){ const s=A.scene[sl(t)]; return s?{phone:s.phone.p,pc:s.pc.p,c:s.c}:null; } return null; }
  /* main colour: a 24 px copy, saturated and opaque pixels count most. A picture from another origin cannot be read, then the caller falls back */
  function measure(img){ try{ const c=D.createElement("canvas"); c.width=c.height=24; const x=c.getContext("2d",{willReadFrequently:true}); x.drawImage(img,0,0,24,24); const d=x.getImageData(0,0,24,24).data; let r=0,g=0,b=0,w=0;
      for(let i=0;i<d.length;i+=4){ const a=d[i+3]/255; if(a<.25) continue; const R=d[i],G=d[i+1],B=d[i+2], mx=Math.max(R,G,B), mn=Math.min(R,G,B), wt=a*(.12+(mx-mn)/(mx||1))*(mx<28?.15:1); r+=R*wt; g+=G*wt; b+=B*wt; w+=wt; }
      if(!w) return null; r/=w; g/=w; b/=w; const k=Math.max(r,g,b), f=k<150?150/(k||1):1; return [Math.min(255,r*f)|0,Math.min(255,g*f)|0,Math.min(255,b*f)|0]; }catch(e){ return null; } }
  function hex2rgb(h){ const m=/^#([0-9a-f]{6})$/i.exec(h||""); return m?[parseInt(m[1].slice(0,2),16),parseInt(m[1].slice(2,4),16),parseInt(m[1].slice(4,6),16)]:null; }
  function setC(rgb){ if(rgb) sh.style.setProperty("--bl-c",rgb.join(",")); }
  function sync(){ raf=0; const y=body.scrollTop, h=heroH||1; sh.style.setProperty("--bl-py",(RM.matches?0:Math.round(y*.35))+"px"); sh.style.setProperty("--bl-op",String(Math.max(0,1-y/(h*1.1)).toFixed(2))); sh.classList.toggle("bl-compact",y>h*.72); }
  body.addEventListener("scroll",() =>{ if(!sh.classList.contains("blend")||raf) return; raf=requestAnimationFrame(sync); },{passive:true});
  window.__blendSheet=function(mode,title,keep){ off(); if(mode!=="info"||ls("mi-clsart")==="off") return; const wm=D.getElementById("shWm"); if(!wm||!wm.parentNode||wm.parentNode!==body) return;
    let img=wm.querySelector("img.art-ic,img.lib-im,img.art-sub"), sc=sceneOf(title);   /* species, class, background, subclass: the scene first */
    if(!sc&&img&&img.classList.contains("lib-im")&&window.__artIc){                     /* items and spells: the Codex icon (HD) instead of the book photo */
      for(const c of ["spell","item"]){ const h=window.__artIc(c,title); if(h){ const m=/src="img\/icon\/([^"]+)"/.exec(h); if(m){ wm.innerHTML='<img class="art-ic" src="img/hd/icon/'+m[1]+'" data-fb="img/icon/'+m[1]+'" alt="" decoding="async">'; img=wm.querySelector("img"); break; } } } }
    if(!img&&!sc) return;                                   /* a line icon only: nothing to blend */
    wm.classList.remove("bl-s","bl-i"); wm.querySelectorAll(".bl-bg,.bl-glow,.bl-grain,.bl-sc").forEach((e) =>{ e.remove(); });
    let src="";
    if(sc){ const u=sc.phone||sc.pc; src=u; wm.innerHTML='<img class="bl-sc" src="'+u+'" alt="" decoding="async" fetchpriority="high">'; wm.classList.add("bl-s"); sh.classList.add("bl-scn"); setC(hex2rgb(sc.c)); img=wm.querySelector("img"); }
    else { src=img.currentSrc||img.getAttribute("src")||""; wm.classList.add("bl-i"); sh.classList.add("bl-ico");
      ["bl-bg","bl-glow","bl-grain"].forEach((c) =>{ const e=D.createElement("i"); e.className=c; e.setAttribute("aria-hidden","true"); if(c==="bl-bg") e.style.backgroundImage='url("'+src+'")'; wm.insertBefore(e,wm.firstChild); }); }
    sh.classList.add("blend"); heroH=0;
    const ln=D.createElement("div"); ln.className="bl-line"; ln.setAttribute("aria-hidden","true"); wm.after(ln); titleBits(); sh.style.setProperty("--bl-hero",wm.offsetHeight+"px"); sh.style.setProperty("--bl-hh",(D.getElementById("sheetHead").offsetHeight||81)+"px");
    const done=() =>{ heroH=wm.offsetHeight||1; const m=measure(img); if(m) setC(m); sync(); };
    if(img.complete&&img.naturalWidth) done(); else img.addEventListener("load",done,{once:true});
    [].forEach.call(body.children,(e,i) =>{ e.style.setProperty("--i",String(Math.min(i,9))); });
    if(!keep) body.scrollTop=0; sync(); if(!RM.matches&&!keep){ sh.classList.remove("bl-in"); void sh.offsetWidth; sh.classList.add("bl-in"); } };
})();
