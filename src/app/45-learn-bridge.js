/* T11 Learn: the app code runs inside one closure, so Learn (src/learn, a deferred part) reaches it only through this bridge:
   the open character and its derived numbers (read only), and the helpers Learn shares with the sheet */
window.__app={ esc:esc, ico:ico, lsGet:lsGet, lsSet:lsSet, ask:ask, libOpen:libOpen, ovQueue:ovQueue, homeInert:homeInert, showHome:showHome, buzz:buzz,
  setTab:setTab, goPage:goPage, pages:PAGES, narrow:function(){ return mq.matches; }, closeSheet:closeSheet,
  sheetOn:function(){ var s=document.getElementById("sheet"); return !!(s&&s.classList.contains("on")); },
  C:function(){ return C; }, D:function(){ return D; }, frozen:function(){ return !!FROZEN; }, reduce:function(){ return !!REDUCE; }, learnBand:learnBand };
