
/* === T1: connected move between Home and the sheet. View or Edit on a Home card: the portrait and the name travel from the card
   to their place on the sheet. Opening Home: they travel back to the card. Another character reloads the page, so the start places go
   through sessionStorage (mi-cx). boot/arrive-flag.js marks the new page (html.mi-cx): a backdrop in the page colour covers it from
   the first paint and the two targets wait hidden until the copies land. Copies fly in a fixed layer, so no card or scroll box clips
   them. Transform and opacity only. Off with Immersive Off and Reduce Motion. === */
const FXS21A={};
(function(){
  const D=document, html=D.documentElement, MI=FXENV.__MI, KEY="mi-cx", EASE="cubic-bezier(.2,.8,.2,1)", DUR=440;
  if(!D.body||!D.body.animate) return;
  FXS21A.rmo=function rmo(){ return !MI||MI.rm(); };;
  FXS21A.rect=function rect(el){ if(!el||!el.getBoundingClientRect) return null; const r=el.getBoundingClientRect(); if(!r.width||!r.height) return null; return {x:r.left,y:r.top,w:r.width,h:r.height}; };;
  FXS21A.seen=function seen(r){ return !!r&&r.y<innerHeight&&r.y+r.h>0&&r.x<innerWidth&&r.x+r.w>0; };;
  /* a copy that looks the same outside its card: computed styles written inline, element and children */
  function copyStyle(s,d){ const cs=getComputedStyle(s); for(let i=0;i<cs.length;i++){ const k=cs[i]; if(/^(transition|animation|will-change|view-transition|inset|translate|rotate|scale)|-(block|inline)|^(block|inline)-size/.test(k)) continue;/* logical twins of left, top, width would win over the inline place on the next page */ d.style.setProperty(k,cs.getPropertyValue(k)); }
    const a=s.children, b=d.children; for(let j=0;j<a.length&&j<b.length;j++) copyStyle(a[j],b[j]); }
  FXS21A.copy=function copy(el,r,layer){ const c=el.cloneNode(true); c.removeAttribute("id"); Array.prototype.forEach.call(c.querySelectorAll("[id]"),(x) =>{ x.removeAttribute("id"); });
    copyStyle(el,c); c.setAttribute("aria-hidden","true");
    c.style.position="fixed"; c.style.left=r.x+"px"; c.style.top=r.y+"px"; c.style.width=r.w+"px"; c.style.height=r.h+"px"; c.style.margin="0"; c.style.transform="none"; c.style.transformOrigin="0 0"; c.style.visibility="visible"; c.style.opacity="1"; c.style.pointerEvents="none";
    layer.appendChild(c); return c; };;
  FXS21A.layer=function layer(){ const l=D.createElement("div"); l.className="mi-cx-layer"; l.setAttribute("aria-hidden","true"); D.body.appendChild(l); return l; };;
  /* move copy c (drawn at rect to) so it starts at rect from. Text keeps its shape: one scale from the heights */
  FXS21A.fly=function fly(c,from,to,even){ let sx=from.w/to.w, sy=from.h/to.h; if(even){ sx=sy; }
    return c.animate([{transform:"translate("+(from.x-to.x)+"px,"+(from.y-to.y)+"px) scale("+sx+","+sy+")"},{transform:"none"}],{duration:DUR,easing:EASE,fill:"both"}); };;
  FXS21A.sheetEls=function sheetEls(){ return [D.getElementById("photo"),D.getElementById("idName")]; };;
  FXS21A.cardEls=function cardEls(card){ return card?[card.querySelector(".hpor,.hhpor"),card.querySelector(".hname b,.hhname")]:[null,null]; };;

  /* arrive on the sheet: copies from the old places (d.p, d.n) to the sheet portrait and name */
  /* the card copy goes along and fades out while the sheet copy fades in: the look changes on the way, not at the end */
  FXS21A.along=function along(c,from,to,even,L){ if(!c) return; L.appendChild(c); let sx=to.w/from.w, sy=to.h/from.h; if(even) sx=sy;
    c.animate([{transform:"none",opacity:1},{transform:"translate("+(to.x-from.x)+"px,"+(to.y-from.y)+"px) scale("+sx+","+sy+")",opacity:0}],{duration:DUR,easing:EASE,fill:"both"}); };
})();
(function(){
  const D=document, html=D.documentElement, MI=FXENV.__MI, KEY="mi-cx", EASE="cubic-bezier(.2,.8,.2,1)", DUR=440;
  if(!D.body||!D.body.animate) return;
  ;
  FXS21A.flyIn=function flyIn(d,done,src){ const pre=D.querySelector(".mi-cx-pre"); if(!src&&pre) src=Array.prototype.slice.call(pre.children); if(pre) pre.remove(); src=src||[]; let els=FXS21A.sheetEls(), L=FXS21A.layer(), n=0, fin=false, end=function(){ if(fin) return; fin=true; html.classList.remove("mi-cx","mi-cx-go"); els.forEach((e) =>{ if(e) e.style.visibility=""; }); L.remove(); if(done) done(); };
    els.forEach((el,i) =>{ const from=i?d.n:d.p, to=FXS21A.rect(el); if(!el||!from||!FXS21A.seen(to)) return; n++;
      if(src[i]){/* the card copy travels and fades, the real portrait or name fades in at its place */
        FXS21A.along(src[i],from,to,i===1,L); el.style.visibility="visible"; el.animate([{opacity:0},{opacity:0,offset:.35},{opacity:1}],{duration:DUR,easing:"ease-out",fill:"backwards"}); return; }
      const c=FXS21A.copy(el,to,L); el.style.visibility="hidden"; FXS21A.fly(c,from,to,i===1); });
    html.classList.add("mi-cx-go");/* the backdrop fades while the copies travel */
    if(FXENV.__miCascade) try{ FXENV.__miCascade(); }catch(e){}/* the rest of the sheet arrives with them (fx/14) */
    FXENV.__miFlyN=(FXENV.__miFlyN||0)+(n?1:0);/* for tests */
    setTimeout(end,n?DUR+40:0); setTimeout(end,DUR+900); };;
  FXENV.__miFlyIn=FXS21A.flyIn;
})();
(function(){
  const D=document, html=D.documentElement, MI=FXENV.__MI, KEY="mi-cx", EASE="cubic-bezier(.2,.8,.2,1)", DUR=440;
  if(!D.body||!D.body.animate) return;
  /* leave Home: keep the portrait and name where they are, cover the rest in the page colour, then let the app switch */
  FXENV.__miFlyOut=function(card,go){ if(FXS21A.rmo()){ go(); return; }
    const els=FXS21A.cardEls(card), d={p:FXS21A.rect(els[0]),n:FXS21A.rect(els[1]),t:Date.now(),bg:getComputedStyle(D.body).backgroundColor||"#0f1417"};
    try{ sessionStorage.setItem(KEY,JSON.stringify(d)); }catch(e){}
    const L=FXS21A.layer(), bd=D.createElement("i"); bd.className="mi-cx-bd"; bd.style.background=d.bg; L.appendChild(bd);
    const cps=[]; els.forEach((el,i) =>{ const r=i?d.n:d.p; if(el&&r) cps.push(FXS21A.copy(el,r,L)); });
    /* the copies also go to the new page, which shows them from its first paint (boot/arrive-flag.js) until they fly */
    try{ const hh=cps.map((c) =>{ return c.outerHTML; }).join(""); if(hh.length<250000){ d.html=hh; sessionStorage.setItem(KEY,JSON.stringify(d)); } }catch(e){}
    let leaving=false; addEventListener("pagehide",() =>{ leaving=true; },{once:true}); addEventListener("beforeunload",() =>{ leaving=true; },{once:true});
    let a=bd.animate([{opacity:0},{opacity:1}],{duration:200,easing:"ease-out",fill:"forwards"}), went=false;
    function next(){ if(went) return; went=true; go();
      FXENV.__miNF(() =>{ FXENV.__miNF(() =>{ const hv=D.getElementById("homeV");
        if(hv&&hv.hidden&&!leaving){/* the same character: no reload, fly now */ try{ sessionStorage.removeItem(KEY); }catch(e){}
          html.classList.add("mi-cx"); const bdc=L.querySelector(".mi-cx-bd"); FXS21A.flyIn(d,null,Array.prototype.slice.call(L.children).filter((x) =>{ return x!==bdc; })); const f=L.animate([{opacity:1},{opacity:0}],{duration:240,easing:"ease-out",fill:"forwards"}); f.onfinish=function(){ L.remove(); }; setTimeout(() =>{ L.remove(); },700); }
        else setTimeout(() =>{ if(!leaving){ L.remove(); try{ sessionStorage.removeItem(KEY); }catch(e){} } },3000); }); }); }
    a.onfinish=next; setTimeout(next,320); };
})();
(function(){
  const D=document, html=D.documentElement, MI=FXENV.__MI, KEY="mi-cx", EASE="cubic-bezier(.2,.8,.2,1)", DUR=440;
  if(!D.body||!D.body.animate) return;
  /* the new page after a switch */
  function arrive(){ if(!html.classList.contains("mi-cx")) return; let d=null; try{ d=JSON.parse(sessionStorage.getItem(KEY)||"null"); sessionStorage.removeItem(KEY); }catch(e){}
    const hv=D.getElementById("homeV"); if(!d||FXS21A.rmo()||(hv&&!hv.hidden)){ html.classList.remove("mi-cx","mi-cx-go"); const pr=D.querySelector(".mi-cx-pre"); if(pr) pr.remove(); return; }
    FXENV.__miNF(() =>{ FXS21A.flyIn(d,null); }); }
  if(D.readyState==="loading") D.addEventListener("DOMContentLoaded",arrive,{once:true}); else arrive();
  setTimeout(() =>{ html.classList.remove("mi-cx","mi-cx-go"); },4000);/* never leave the sheet hidden */

  /* open Home: the sheet portrait and name go back to the card of this character */
  FXS21A.tap=0; addEventListener("click",() =>{ FXS21A.tap=performance.now(); },true); addEventListener("keydown",() =>{ FXS21A.tap=performance.now(); },true);
  FXS21A.hv0=D.getElementById("homeV");
  FXS21A.homeFly=function homeFly(ce,r0){ let L=FXS21A.layer(), n=0;
    ce.forEach((el,i) =>{ const to=FXS21A.rect(el), fr=r0[i]; if(!el||!FXS21A.seen(to)||!fr) return; const c=FXS21A.copy(el,to,L); el.style.visibility="hidden"; n++;
      FXS21A.fly(c,fr,to,i===1).onfinish=function(){ el.style.visibility=""; }; setTimeout(() =>{ el.style.visibility=""; },DUR+600); });
    FXENV.__miFlyBackN=(FXENV.__miFlyBackN||0)+(n?1:0);/* for tests */
    setTimeout(() =>{ L.remove(); },n?DUR+60:0); };
})();
(function(){
  const D=document, html=D.documentElement, MI=FXENV.__MI, KEY="mi-cx", EASE="cubic-bezier(.2,.8,.2,1)", DUR=440;
  if(!D.body||!D.body.animate) return;
  ;
  function homeOpened(hv){ if(hv.hidden||FXS21A.rmo()||performance.now()-FXS21A.tap>800) return;/* only when you open Home, not when the app starts on it */
    const els=FXS21A.sheetEls(), r0=[FXS21A.rect(els[0]),FXS21A.rect(els[1])]; if(!FXS21A.seen(r0[0])&&!FXS21A.seen(r0[1])) return;
    let id=null; try{ id=(JSON.parse(__store.getItem("cs-roster-v1"))||{}).active; }catch(e){}
    const b=id&&hv.querySelector('[data-hview="'+id+'"]'), card=b&&b.closest(".hcard,.hhero"), ce=FXS21A.cardEls(card); if(!card) return;
    FXS21A.homeFly(ce,r0); }
  function watchHome(hv,isNew){ let was=hv.hidden;
    function opened(){ homeOpened(hv); }
    new MutationObserver(() =>{ if(hv.hidden===was) return; was=hv.hidden; opened(); }).observe(hv,{attributes:true,attributeFilter:["hidden"]});
    if(isNew&&!hv.hidden) FXENV.__miNF(opened);/* the first open makes #homeV, filled in the same task */ }
  if(FXS21A.hv0) watchHome(FXS21A.hv0,false); else new MutationObserver((m,o) =>{ const h=D.getElementById("homeV"); if(h){ o.disconnect(); watchHome(h,true); } }).observe(D.body,{childList:true});
})();
