/* Helpers that the Z pack and the M pack both used as private copies (SOLID stage 8, DRY). Plain functions, no state. Classic script: loads before the packs in the fx block.
   They read the same things the private copies read: FXENV.__miNF and FXENV.__sheetState at call time, __store for the saved flags. */
const FXH={
  nf:function(fn){ (FXENV.__miNF||setTimeout)(fn); },
  rm:function(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); },
  vis:function(e){ return e&&e.getClientRects().length; },
  esc:function(t){ return String(t).replace(/[&<>"]/g,(c) =>{ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); },
  fx:function(cls,html,ms){ const e=document.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; document.body.appendChild(e); setTimeout(() =>{ FXH.rm(e); },ms||2300); return e; },
  ls:function(k,v){ try{ if(v===undefined) return __store.getItem(k); __store.setItem(k,v); }catch(e){ return null; } },
  st:function(){ try{ return FXENV.__sheetState?FXENV.__sheetState():null; }catch(e){ return null; } }
};
