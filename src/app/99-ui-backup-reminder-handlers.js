/* v33 p10 handlers */
document.addEventListener("change",function(e){ var t=e.target; if(!t||!t.getAttribute) return;
  if(t.getAttribute("data-chfrem")){ var o=uiGet("cs-ui-remind"); o.days=+t.value; uiSet("cs-ui-remind",o); updUnsaved(); var g=document.getElementById("hgrid"); if(g&&typeof homeCards==="function") g.innerHTML=homeCards(true); toast(+t.value?"Backup reminder after "+t.value+" days.":"Backup reminder is off."); }
  if(t.getAttribute("data-chfauto")){ var o2=uiGet("cs-ui-remind"); o2.auto=!!t.checked; uiSet("cs-ui-remind",o2); toast(t.checked?"This file will be kept updated after you save it once.":"Automatic file updates are off."); } });
