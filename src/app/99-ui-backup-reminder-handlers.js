import {toast} from "./05-logic-helpers.js";
import {uiGet} from "./07-ui-theme-contrast-spring.js";
import {homeCards,uiSet,updUnsaved} from "./15-logic-roster-backup-files-snapshots.js";
import { render as drawHtml, raw as rawHtml } from "./lib/html.js";
/* v33 p10 handlers */
document.addEventListener("change",(e) =>{ const t=e.target; if(!t||!t.getAttribute) return;
  if(t.getAttribute("data-chfrem")){ const o=uiGet("cs-ui-remind"); o.days=+t.value; uiSet("cs-ui-remind",o); updUnsaved(); const g=document.getElementById("hgrid"); if(g&&typeof homeCards==="function") drawHtml(rawHtml(homeCards(true)), g); toast(+t.value?"Backup reminder after "+t.value+" days.":"Backup reminder is off."); }
  if(t.getAttribute("data-chfauto")){ const o2=uiGet("cs-ui-remind"); o2.auto=!!t.checked; uiSet("cs-ui-remind",o2); toast(t.checked?"This file will be kept updated after you save it once.":"Automatic file updates are off."); } });
