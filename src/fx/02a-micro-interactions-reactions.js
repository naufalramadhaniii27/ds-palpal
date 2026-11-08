/* micro-interactions, reactions: casting sparks, death saving throws, rest celebration */
(function(){
  if(!document.body||!document.body.animate) return;
  const C=FXH.center, vis=FXH.inView, burst=FXENV.__miBurst, ring=FXENV.__miRing, smoke=FXENV.__miSmoke;
  /* 3. Heroic Inspiration: the moment is the Bell Toggle (F5.1b), the lasting state is the Star Border */

  /* 4. casting a spell from the Spells list: arcane sparks */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest(".sp-b[data-qcast]"); if(!t) return; const p=C(t); if(!vis(p.r)) return; if(FXENV.__miWow) FXENV.__miWow.cast(p.x,p.y);
    ring(p.x,p.y,"#b388ff",60); burst(p.x,p.y,{n:12,colors:["#b388ff","#7c4dff","#80d8ff","#ffffff"],shape:"mi-spark",dist:40,dur:600}); },true);

  /* 5. Death Saving Throws: green for a success, red sparks for a failure, a big burst for a natural 20 */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-dsr]"); if(!t) return; const k=t.getAttribute("data-dsr"), p=C(t); if(!vis(p.r)) return;
    if(FXENV.__miWow) FXENV.__miWow.save(k);
    if(k==="20"){ ring(p.x,p.y,"#4cc27a",110); burst(p.x,p.y,{n:16,colors:["#4cc27a","#ffd166","#ffffff"],shape:"mi-star",dist:80,dur:900}); }
    else if(k==="s") burst(p.x,p.y,{n:8,colors:["#4cc27a"],dist:34});
    else if(k==="f"||k==="1") burst(p.x,p.y,{n:k==="1"?12:8,colors:["#e5534b","#7a1f1a"],shape:"mi-spark",dist:k==="1"?50:34,grav:true}); },true);

  /* 6. a rest that went through (the sheet closed): stars for a Long Rest, embers for a Short Rest */
  function restCele(kind){ if(!MI.full()) return; setTimeout(() =>{ if(document.querySelector("#sheet.on #restDlg")) return; const x=innerWidth/2, y=Math.min(innerHeight*.42,320);
      if(FXENV.__miWow) FXENV.__miWow.rest(kind);
      if(kind==="long"){ ring(x,y,"#7cb6ff",160); burst(x,y,{n:22,colors:["#7cb6ff","#c3dcff","#ffd166","#ffffff"],shape:"mi-star",dist:150,dur:1300,scale:1.3,grav:true}); }
      else { ring(x,y,"#ffb26b",110); burst(x,y,{n:12,colors:["#ffb26b","#ffd166","#ffffff"],dist:90,dur:1000,grav:true}); } },380); }
  document.addEventListener("mi:rest",(e) =>{ restCele(e.detail); });
})();
