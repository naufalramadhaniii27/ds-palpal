/* ================= INIT ================= */
/* v18 RU78: the character list must be readable too, or rEnsure() would start a new one over it */
(function(){ var r=lsGet(RKEY); if(r!=null){ try{ var p=JSON.parse(r); if(!p||typeof p!=="object"||!p.chars||typeof p.chars!=="object"||Array.isArray(p.chars)) throw new Error("the character list has a shape this version does not know"); }catch(e){ BAD.push("Character list: "+((e&&e.message)||e)); } } })();
/* v25 RU38 no. 3: Manage Spells button and the search box of the panel */
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-spman]"); if(b){ e.preventDefault(); openSpMan(); } });
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-spcards],[data-pin],[data-oldn],#srchBtn,#srchFab"); if(!t) return; e.preventDefault();/* v27 */
  if(t.id==="srchBtn"||t.id==="srchFab"){ openSearch(); return; } if(t.dataset.spcards){ printCards(); return; } if(t.dataset.pin){ e.stopPropagation(); pinToggle(t.dataset.pin); return; }
  if(t.dataset.oldn==="ok"){ S.updSeen=APP_VER; save(); var on=document.getElementById("oldNote"); if(on) on.innerHTML=""; return; } if(t.dataset.oldn==="bld"&&window.__bldOpen) window.__bldOpen(); },true);
var gsT=0; document.addEventListener("input",function(e){ if(e.target&&e.target.id==="gsQ"){ gsQ=e.target.value; clearTimeout(gsT); gsT=setTimeout(gsRefresh,120); } });/* v29 RU126 */
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-cust]"); if(b){ e.preventDefault(); showEntry({type:"cust",key:b.getAttribute("data-cust"),n:b.getAttribute("data-custn")}, true); } });/* v26 RU38 no. 2 */
document.addEventListener("input",function(e){ if(e.target&&e.target.id==="spmQ"){ spmQ=e.target.value; spmRefresh(); } });
