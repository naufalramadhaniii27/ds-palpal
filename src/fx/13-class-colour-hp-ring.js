/* === A1 + B2: class colour and the Hit Points ring === */
(function(){
  const html=document.documentElement;
  function cls(){ try{ let st=FXENV.__sheetState&&FXENV.__sheetState(), c=st&&st.C&&st.C.cls; c=String(c||"").split(/[\s/,]/)[0].toLowerCase(); if(c) html.setAttribute("data-mi-cls",c); else html.removeAttribute("data-mi-cls"); }catch(e){} }
  function hp(){ const box=document.querySelector("#hpBox .hp-big"); if(!box) return; /* the percent ring was removed: it only repeated the bar (its drawing code, unreachable since then, is gone too) */ Array.prototype.forEach.call(document.querySelectorAll(".mi-hpg,.mi-hpi"),(n) =>{ n.remove(); }); box.classList.remove("mi-hpn"); }
  /* watch only the two places that matter: the Hit Points box, and the identity card for the class */
  let q=0, last=""; function kick(){ if(!q){ q=1; (FXENV.__miNF||setTimeout)(() =>{ q=0; hp(); }); } }
  let cq=0; function ckick(){ if(!cq){ cq=1; setTimeout(() =>{ cq=0; const t=(document.querySelector(".idcard")||{}).textContent||""; if(t!==last){ last=t; cls(); } },120); } }
  function arm(){ const hb=document.getElementById("hpBox"), id=document.querySelector(".idcard")||document.getElementById("idName");
    if(hb) new MutationObserver(kick).observe(hb,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["aria-label","data-v","style"]});
    if(id) new MutationObserver(ckick).observe(id,{childList:true,subtree:true,characterData:true});
    cls(); kick(); }
  let rz=0; FXENV.addEventListener("resize",() =>{ clearTimeout(rz); rz=setTimeout(() =>{ const g0=document.querySelector(".mi-hpg"); if(g0) g0.__k=""; kick(); },150); });
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",arm); else arm();
})();

