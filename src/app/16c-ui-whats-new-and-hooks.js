import {bindLive,lateGet} from "./00a-reg-late-ports.js";/* Responsibility: the What is new list, banner and window, and the backup hooks published to the page. Split out of the former single file 16 in SOLID stage 9 (S); runs in the same order as before. */
import {APP_LABEL,APP_VER} from "./04-logic-storage.js";import {esc} from "./05-logic-helpers.js";import {bkpCheck,bkpMake} from "./15b-logic-backup.js";import {env} from "./00-env.js";import {WHATSNEW} from "./16b-data-whats-new.js";
bindLive("wnBanner",{get:function(){return wnBanner;}});
bindLive("wnOpen",{get:function(){return wnOpen;}});
function wnList(from){ return WHATSNEW.filter((x) =>{ return x.v>from&&x.l; }).map((x) =>{ return '<h4>Version '+x.l+' <small>'+x.d+'</small></h4><ul>'+x.n.map((t) =>{ return '<li>'+esc(t)+'</li>'; }).join("")+'</ul>'; }).join(""); }
export function wnBanner(){ if(!lateGet("WN_SHOW")) return ""; return '<div class="hwn" id="hwnB" role="status"><b>What\'s new in version '+APP_LABEL+'</b>'+wnList(lateGet("WN_FROM")||APP_VER-1)+'<button type="button" class="btn press" data-hwn="ok">Got It</button></div>'; }
function wnOpen(){ const old=document.getElementById("bkp"); if(old) old.remove(); const w=document.createElement("div"); w.id="bkp"; w.className="bkp"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true");
  w.setAttribute("aria-labelledby","bkpT"); w.innerHTML='<div class="bkpb"><div class="bkph"><b id="bkpT">What\'s New</b><button type="button" class="bkpx" data-bkp="close" aria-label="Close">×</button></div>'+wnList(0)+'</div>'; document.body.appendChild(w);
  w.addEventListener("click",(e) =>{ if(e.target===w||e.target.closest("[data-bkp]")) w.remove(); }); }
env.__bkpMake=bkpMake; env.__bkpCheck=bkpCheck;
