/* === A1 + B2: class colour and the Hit Points ring === */
(function(){
  var html=document.documentElement;
  function cls(){ try{ var st=window.__sheetState&&window.__sheetState(), c=st&&st.C&&st.C.cls; c=String(c||"").split(/[\s/,]/)[0].toLowerCase(); if(c) html.setAttribute("data-mi-cls",c); else html.removeAttribute("data-mi-cls"); }catch(e){} }
  var g=null, gi=null;
  function hp(){ var box=document.querySelector("#hpBox .hp-big"); if(!box) return; if(!g||!box.contains(g)){ g=document.createElement("i"); g.className="mi-hpg"; g.setAttribute("aria-hidden","true"); gi=document.createElement("span"); gi.className="mi-hpi"; gi.setAttribute("aria-hidden","true"); gi.innerHTML="<b></b><small></small>"; box.appendChild(g); box.appendChild(gi); }
    var c=document.getElementById("hpCur"), m=document.getElementById("hpMax"), bar=document.getElementById("hpBar"), mx=+(m&&(m.getAttribute("data-v")||m.textContent));
    var sx=bar&&/scaleX\(([\d.]+)\)/.exec(bar.style.transform||""), v=c&&(c.getAttribute("aria-label")||(c.children.length?"":c.textContent)); v=v!=null&&v!==""?+v:(sx?Math.round(+sx[1]*mx):NaN);
    if(!(mx>0)||isNaN(v)) return; var p=Math.max(0,Math.min(1,v/mx)), st=v<=0?"Down":p<=.5?"Bloodied":"Healthy", col=v<=0?"#e5534b":p<=.25?"#e5534b":p<=.5?"#e2aa4c":"#38b06b";
    var nar=box.clientWidth<300; if(box.classList.contains("mi-hpn")!==nar) box.classList.toggle("mi-hpn",nar);/* a narrow card gets a smaller ring, so the number never wraps */
    var key=p.toFixed(3)+col+st; if(g.__k===key) return; g.__k=key;
    g.style.setProperty("--hp",p.toFixed(3)); g.style.setProperty("--hc",col); gi.style.setProperty("--hc",col); gi.firstChild.textContent=Math.round(p*100)+"%"; gi.lastChild.textContent=st; }
  /* watch only the two places that matter: the Hit Points box, and the identity card for the class */
  var q=0, last=""; function kick(){ if(!q){ q=1; (window.__miNF||setTimeout)(function(){ q=0; hp(); }); } }
  var cq=0; function ckick(){ if(!cq){ cq=1; setTimeout(function(){ cq=0; var t=(document.querySelector(".idcard")||{}).textContent||""; if(t!==last){ last=t; cls(); } },120); } }
  function arm(){ var hb=document.getElementById("hpBox"), id=document.querySelector(".idcard")||document.getElementById("idName");
    if(hb) new MutationObserver(kick).observe(hb,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:["aria-label","data-v","style"]});
    if(id) new MutationObserver(ckick).observe(id,{childList:true,subtree:true,characterData:true});
    cls(); kick(); }
  var rz=0; window.addEventListener("resize",function(){ clearTimeout(rz); rz=setTimeout(function(){ var g0=document.querySelector(".mi-hpg"); if(g0) g0.__k=""; kick(); },150); });
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",arm); else arm();
})();

