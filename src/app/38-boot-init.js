import {APP_VER,BAD,S,lsGet,save} from "./04-logic-storage.js";
import {showEntry} from "./12-ui-bottom-sheet-modal.js";
import {RKEY} from "./14-ui-editor.js";
import {__set_spmQ,openSpMan,spmQ,spmRefresh} from "./24-ui-manage-spells.js";
import {__set_gsQ,gsQ,gsRefresh,openSearch,pinToggle,printCards} from "./27-ui-party-search-commands-library.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"gsT",{get:function(){return gsT;},set:function(v){gsT=v;},configurable:true});
/* ================= INIT ================= */
/* v18 RU78: the character list must be readable too, or rEnsure() would start a new one over it */
(function(){ const r=lsGet(RKEY); if(r!=null){ try{ const p=JSON.parse(r); if(!p||typeof p!=="object"||!p.chars||typeof p.chars!=="object"||Array.isArray(p.chars)) throw new Error("the character list has a shape this version does not know"); }catch(e){ BAD.push("Character list: "+((e&&e.message)||e)); } } })();
/* v25 RU38 no. 3: Manage Spells button and the search box of the panel */
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-spman]"); if(b){ e.preventDefault(); openSpMan(); } });
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-spcards],[data-pin],[data-oldn],#srchBtn,#srchFab"); if(!t) return; e.preventDefault();/* v27 */
  if(t.id==="srchBtn"||t.id==="srchFab"){ openSearch(); return; } if(t.dataset.spcards){ printCards(); return; } if(t.dataset.pin){ e.stopPropagation(); pinToggle(t.dataset.pin); return; }
  if(t.dataset.oldn==="ok"){ S.updSeen=APP_VER; save(); const on=document.getElementById("oldNote"); if(on) on.innerHTML=""; return; } if(t.dataset.oldn==="bld"&&env.__bldOpen) env.__bldOpen(); },true);
var gsT=0; document.addEventListener("input",(e) =>{ if(e.target&&e.target.id==="gsQ"){ __set_gsQ(e.target.value); clearTimeout(gsT); gsT=setTimeout(gsRefresh,120); } });/* v29 RU126 */
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-cust]"); if(b){ e.preventDefault(); showEntry({type:"cust",key:b.getAttribute("data-cust"),n:b.getAttribute("data-custn")}, true); } });/* v26 RU38 no. 2 */
document.addEventListener("input",(e) =>{ if(e.target&&e.target.id==="spmQ"){ __set_spmQ(e.target.value); spmRefresh(); } });
