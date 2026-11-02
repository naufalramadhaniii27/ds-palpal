import {C,FROZEN,lsGet,lsSet} from "./04-logic-storage.js";
import {ask,esc} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {REDUCE} from "./07-ui-theme-contrast-spring.js";
import {buzz} from "./09-ui-hit-points-playbar-death-saves.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {learnBand,showHome} from "./15-logic-roster-backup-files-snapshots.js";
import {PAGES,goPage,mq,setTab} from "./21-ui-tabs-pager.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {libOpen} from "./27-ui-party-search-commands-library.js";
import {homeInert} from "./31-ui-tour-and-focus.js";
import {ovQueue} from "./40-ui-segments-notes-swipe-motion-panels.js";
/* T11 Learn: the app code runs inside one closure, so Learn (src/learn, a deferred part) reaches it only through this bridge:
   the open character and its derived numbers (read only), and the helpers Learn shares with the sheet */
window.__app={ esc:esc, ico:ico, lsGet:lsGet, lsSet:lsSet, ask:ask, libOpen:libOpen, ovQueue:ovQueue, homeInert:homeInert, showHome:showHome, buzz:buzz,
  setTab:setTab, goPage:goPage, pages:PAGES, narrow:function(){ return mq.matches; }, closeSheet:closeSheet,
  sheetOn:function(){ const s=document.getElementById("sheet"); return !!(s&&s.classList.contains("on")); },
  C:function(){ return C; }, D:function(){ return D; }, frozen:function(){ return !!FROZEN; }, reduce:function(){ return !!REDUCE; }, learnBand:learnBand };
