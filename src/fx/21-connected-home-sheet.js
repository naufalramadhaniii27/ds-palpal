
/* === T1: connected move between Home and the sheet. View or Edit on a Home card: the portrait and the name travel from the card
   to their place on the sheet. Opening Home: they travel back to the card. Another character reloads the page, so the start places go
   through sessionStorage (mi-cx). boot/arrive-flag.js marks the new page (html.mi-cx): a backdrop in the page colour covers it from
   the first paint and the two targets wait hidden until the copies land. Copies fly in a fixed layer, so no card or scroll box clips
   them. Transform and opacity only. Off with Immersive Off and Reduce Motion. === */
(function(){
  var D=document, html=D.documentElement, MI=window.__MI, KEY="mi-cx", EASE="cubic-bezier(.2,.8,.2,1)", DUR=440;
  if(!D.body||!D.body.animate) return;
  function rmo(){ return !MI||MI.rm(); }
  function rect(el){ if(!el||!el.getBoundingClientRect) return null; var r=el.getBoundingClientRect(); if(!r.width||!r.height) return null; return {x:r.left,y:r.top,w:r.width,h:r.height}; }
  function seen(r){ return !!r&&r.y<innerHeight&&r.y+r.h>0&&r.x<innerWidth&&r.x+r.w>0; }
  /* a copy that looks the same outside its card: computed styles written inline, element and children */
  function copyStyle(s,d){ var cs=getComputedStyle(s); for(var i=0;i<cs.length;i++){ var k=cs[i]; if(/^(transition|animation|will-change|view-transition|inset|translate|rotate|scale)|-(block|inline)|^(block|inline)-size/.test(k)) continue;/* logical twins of left, top, width would win over the inline place on the next page */ d.style.setProperty(k,cs.getPropertyValue(k)); }
    var a=s.children, b=d.children; for(var j=0;j<a.length&&j<b.length;j++) copyStyle(a[j],b[j]); }
  function copy(el,r,layer){ var c=el.cloneNode(true); c.removeAttribute("id"); Array.prototype.forEach.call(c.querySelectorAll("[id]"),function(x){ x.removeAttribute("id"); });
    copyStyle(el,c); c.setAttribute("aria-hidden","true");
    c.style.position="fixed"; c.style.left=r.x+"px"; c.style.top=r.y+"px"; c.style.width=r.w+"px"; c.style.height=r.h+"px"; c.style.margin="0"; c.style.transform="none"; c.style.transformOrigin="0 0"; c.style.visibility="visible"; c.style.opacity="1"; c.style.pointerEvents="none";
    layer.appendChild(c); return c; }
  function layer(){ var l=D.createElement("div"); l.className="mi-cx-layer"; l.setAttribute("aria-hidden","true"); D.body.appendChild(l); return l; }
  /* move copy c (drawn at rect to) so it starts at rect from. Text keeps its shape: one scale from the heights */
  function fly(c,from,to,even){ var sx=from.w/to.w, sy=from.h/to.h; if(even){ sx=sy; }
    return c.animate([{transform:"translate("+(from.x-to.x)+"px,"+(from.y-to.y)+"px) scale("+sx+","+sy+")"},{transform:"none"}],{duration:DUR,easing:EASE,fill:"both"}); }
  function sheetEls(){ return [D.getElementById("photo"),D.getElementById("idName")]; }
  function cardEls(card){ return card?[card.querySelector(".hpor,.hhpor"),card.querySelector(".hname b,.hhname")]:[null,null]; }

  /* arrive on the sheet: copies from the old places (d.p, d.n) to the sheet portrait and name */
  /* the card copy goes along and fades out while the sheet copy fades in: the look changes on the way, not at the end */
  function along(c,from,to,even,L){ if(!c) return; L.appendChild(c); var sx=to.w/from.w, sy=to.h/from.h; if(even) sx=sy;
    c.animate([{transform:"none",opacity:1},{transform:"translate("+(to.x-from.x)+"px,"+(to.y-from.y)+"px) scale("+sx+","+sy+")",opacity:0}],{duration:DUR,easing:EASE,fill:"both"}); }
  function flyIn(d,done,src){ var pre=D.querySelector(".mi-cx-pre"); if(!src&&pre) src=Array.prototype.slice.call(pre.children); if(pre) pre.remove(); src=src||[]; var els=sheetEls(), L=layer(), n=0, fin=false, end=function(){ if(fin) return; fin=true; html.classList.remove("mi-cx","mi-cx-go"); els.forEach(function(e){ if(e) e.style.visibility=""; }); L.remove(); if(done) done(); };
    els.forEach(function(el,i){ var from=i?d.n:d.p, to=rect(el); if(!el||!from||!seen(to)) return; n++;
      if(src[i]){/* the card copy travels and fades, the real portrait or name fades in at its place */
        along(src[i],from,to,i===1,L); el.style.visibility="visible"; el.animate([{opacity:0},{opacity:0,offset:.35},{opacity:1}],{duration:DUR,easing:"ease-out",fill:"backwards"}); return; }
      var c=copy(el,to,L); el.style.visibility="hidden"; fly(c,from,to,i===1); });
    html.classList.add("mi-cx-go");/* the backdrop fades while the copies travel */
    if(window.__miCascade) try{ window.__miCascade(); }catch(e){}/* the rest of the sheet arrives with them (fx/14) */
    window.__miFlyN=(window.__miFlyN||0)+(n?1:0);/* for tests */
    setTimeout(end,n?DUR+40:0); setTimeout(end,DUR+900); }
  window.__miFlyIn=flyIn;

  /* leave Home: keep the portrait and name where they are, cover the rest in the page colour, then let the app switch */
  window.__miFlyOut=function(card,go){ if(rmo()){ go(); return; }
    var els=cardEls(card), d={p:rect(els[0]),n:rect(els[1]),t:Date.now(),bg:getComputedStyle(D.body).backgroundColor||"#0f1417"};
    try{ sessionStorage.setItem(KEY,JSON.stringify(d)); }catch(e){}
    var L=layer(), bd=D.createElement("i"); bd.className="mi-cx-bd"; bd.style.background=d.bg; L.appendChild(bd);
    var cps=[]; els.forEach(function(el,i){ var r=i?d.n:d.p; if(el&&r) cps.push(copy(el,r,L)); });
    /* the copies also go to the new page, which shows them from its first paint (boot/arrive-flag.js) until they fly */
    try{ var hh=cps.map(function(c){ return c.outerHTML; }).join(""); if(hh.length<250000){ d.html=hh; sessionStorage.setItem(KEY,JSON.stringify(d)); } }catch(e){}
    var leaving=false; addEventListener("pagehide",function(){ leaving=true; },{once:true}); addEventListener("beforeunload",function(){ leaving=true; },{once:true});
    var a=bd.animate([{opacity:0},{opacity:1}],{duration:200,easing:"ease-out",fill:"forwards"}), went=false;
    function next(){ if(went) return; went=true; go();
      window.__miNF(function(){ window.__miNF(function(){ var hv=D.getElementById("homeV");
        if(hv&&hv.hidden&&!leaving){/* the same character: no reload, fly now */ try{ sessionStorage.removeItem(KEY); }catch(e){}
          html.classList.add("mi-cx"); var bdc=L.querySelector(".mi-cx-bd"); flyIn(d,null,Array.prototype.slice.call(L.children).filter(function(x){ return x!==bdc; })); var f=L.animate([{opacity:1},{opacity:0}],{duration:240,easing:"ease-out",fill:"forwards"}); f.onfinish=function(){ L.remove(); }; setTimeout(function(){ L.remove(); },700); }
        else setTimeout(function(){ if(!leaving){ L.remove(); try{ sessionStorage.removeItem(KEY); }catch(e){} } },3000); }); }); }
    a.onfinish=next; setTimeout(next,320); };

  /* the new page after a switch */
  function arrive(){ if(!html.classList.contains("mi-cx")) return; var d=null; try{ d=JSON.parse(sessionStorage.getItem(KEY)||"null"); sessionStorage.removeItem(KEY); }catch(e){}
    var hv=D.getElementById("homeV"); if(!d||rmo()||(hv&&!hv.hidden)){ html.classList.remove("mi-cx","mi-cx-go"); var pr=D.querySelector(".mi-cx-pre"); if(pr) pr.remove(); return; }
    window.__miNF(function(){ flyIn(d,null); }); }
  if(D.readyState==="loading") D.addEventListener("DOMContentLoaded",arrive,{once:true}); else arrive();
  setTimeout(function(){ html.classList.remove("mi-cx","mi-cx-go"); },4000);/* never leave the sheet hidden */

  /* open Home: the sheet portrait and name go back to the card of this character */
  var tap=0; addEventListener("click",function(){ tap=performance.now(); },true); addEventListener("keydown",function(){ tap=performance.now(); },true);
  var hv0=D.getElementById("homeV");
  function watchHome(hv,isNew){ var was=hv.hidden;
    function opened(){ if(hv.hidden||rmo()||performance.now()-tap>800) return;/* only when you open Home, not when the app starts on it */
      var els=sheetEls(), r0=[rect(els[0]),rect(els[1])]; if(!seen(r0[0])&&!seen(r0[1])) return;
      var id=null; try{ id=(JSON.parse(localStorage.getItem("cs-roster-v1"))||{}).active; }catch(e){}
      var b=id&&hv.querySelector('[data-hview="'+id+'"]'), card=b&&b.closest(".hcard,.hhero"), ce=cardEls(card); if(!card) return;
      var L=layer(), n=0;
      ce.forEach(function(el,i){ var to=rect(el), fr=r0[i]; if(!el||!seen(to)||!fr) return; var c=copy(el,to,L); el.style.visibility="hidden"; n++;
        fly(c,fr,to,i===1).onfinish=function(){ el.style.visibility=""; }; setTimeout(function(){ el.style.visibility=""; },DUR+600); });
      window.__miFlyBackN=(window.__miFlyBackN||0)+(n?1:0);/* for tests */
      setTimeout(function(){ L.remove(); },n?DUR+60:0); }
    new MutationObserver(function(){ if(hv.hidden===was) return; was=hv.hidden; opened(); }).observe(hv,{attributes:true,attributeFilter:["hidden"]});
    if(isNew&&!hv.hidden) window.__miNF(opened);/* the first open makes #homeV, filled in the same task */ }
  if(hv0) watchHome(hv0,false); else new MutationObserver(function(m,o){ var h=D.getElementById("homeV"); if(h){ o.disconnect(); watchHome(h,true); } }).observe(D.body,{childList:true});
})();
