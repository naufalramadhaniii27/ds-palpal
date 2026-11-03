import {DMAP,attMax} from "./03-logic-magic-item-effects.js";
import {B,save} from "./04-logic-storage.js";
import {toSheet} from "./12-logic-export-to-sheet.js";
import {baseOf,ensureInv} from "./14-logic-multiclass-hp-shop.js";
import {bI} from "./17-ui-step-builder.js";
import {ctFree,invFind} from "./21-ui-rules-reference.js";
import {__R} from "./00-reg.js";
import { render as drawHtml, raw as rawHtml } from "../app/lib/html.js";
Object.defineProperty(__R,"attN",{get:function(){return attN;},set:function(v){attN=v;},configurable:true});
Object.defineProperty(__R,"bDeco",{get:function(){return bDeco;},set:function(v){bDeco=v;},configurable:true});
/* v33 p02: header and footer icons (one line style, like the sheet) */
(function(){const pre=function(id,k,end){const e=typeof id==="string"?document.querySelector(id):id;if(!e||e.querySelector("svg"))return;e.insertAdjacentHTML(end?"beforeend":"afterbegin",bI(k))};
 pre("#bld .brand b","ui-build");pre("#bld .lvhead","ui-levelup");pre("#b-close","ui-close");pre("#prev","ui-chev-l");const nx=document.getElementById("next"),ns=nx&&nx.querySelector("svg");if(ns)ns.remove();pre("#next","ui-chev-r",true)})();
/* v33 p02: every builder button carries an icon. Chips and radios show their state, buttons their action. Runs after each render */
const BTXT=[[/^(Add|Add Item|Add Source|Create)$/,"ui-plus"],[/^Quick Build$/,"ui-build"],[/^(Wield|Wear|Use|Attune|Equip)$/,"ui-box"],[/^(Wielding|Wearing|In Use|Attuned|Unequip)$/,"item-equipped"],[/^Unpack$/,"ui-bag"],
 [/^(Prepare|Learn)$/,"ui-plus"],[/^Chosen$/,"ui-check"],[/^(Unprepare|Unlearn)$/,"ui-minus"],[/^Remove/,"ui-trash"],[/^Clear All$/,"ui-trash"],[/^Read: /,"ui-book"],[/pack template$/,"ui-file"],[/^Change /,"ui-pen"],[/^Edit$/,"ui-pen"],[/^Cancel$/,"ui-close"],
 [/^Skip /,"ui-close"],[/^Start a new character$/,"home-create"],[/^Restore backup/,"home-restore"],[/^Level Up to /,"ui-levelup"],[/^Load from sheet/i,"home-import"],[/^Export/i,"home-export"]];
const BINV={ARMOR:"item-armor",POTION:"item-potion",RING:"item-ring",ROD:"item-rod",SCROLL:"item-scroll",STAFF:"item-staff",WAND:"item-wand",WEAPON:"item-weapon",WONDROUS:"item-wondrous",GEAR:"item-gear"};
function bTxt(b){const t=(b.textContent||"").replace(/\s+/g," ").trim();for(let i=0;i<BTXT.length;i++)if(BTXT[i][0].test(t))return BTXT[i][1];return ""}
function bDeco(root){const ICO=window.__ICO;if(!root||!ICO)return;const q=function(s){return Array.prototype.slice.call(root.querySelectorAll(s))},put=function(e,k,end){if(!k||e.querySelector("svg"))return;e.insertAdjacentHTML(end?"beforeend":"afterbegin",bI(k))};
 q(".chip").forEach((b) =>{if(b.querySelector("svg"))return;const on=b.classList.contains("on");if(b.classList.contains("clash")&&b.firstChild&&b.firstChild.nodeType===3)b.firstChild.nodeValue=b.firstChild.nodeValue.replace(/^\u26a0\s*/,"");put(b,on?"ui-check":b.classList.contains("clash")?"toast-warn":b.classList.contains("have")?"ui-check":"ui-plus")});
 q(".rad").forEach((b) =>{put(b,b.classList.contains("on")?"ui-radio-on":"fr-round")});
 q(".eqo .bcb").forEach((s) =>{if(!s.querySelector("svg"))drawHtml(rawHtml(bI(s.parentNode.classList.contains("on")?"item-equipped":"ui-box")), s)});
 q("[data-invt]").forEach((b) =>{put(b,BINV[b.getAttribute("data-invt")])});
 q("[data-invr],[data-custr]").forEach((b) =>{put(b,"item-wondrous")});q("[data-avar]").forEach((b) =>{put(b,b.getAttribute("data-k")==="0"?"ui-minus":"ui-star")});
 q("[data-setcls]").forEach((b) =>{const k=window.__icoCls?window.__icoCls(b.getAttribute("data-setcls")):"";put(b,ICO[k]?k:"src-class")});
 q("[data-setsp]").forEach((b) =>{const k="sp-"+String(b.getAttribute("data-setsp")).toLowerCase().replace(/ \(.*\)$/,"");put(b,ICO[k]?k:"sp-custom")});
 q(".bxbtn").forEach((b) =>{if(b.querySelector("svg"))return;b.textContent="";put(b,b.hasAttribute("data-mcdel")?"ui-trash":"ui-pen")});
 q(".rmv").forEach((b) =>{if(b.querySelector("svg"))return;if(b.firstChild&&b.firstChild.nodeType===3)b.firstChild.nodeValue=b.firstChild.nodeValue.replace(/^\u2715\s*/,"");put(b,"ui-trash")});
 q("p.bhint,.bwarn,.caution").forEach((p) =>{if(p.querySelector(":scope > svg"))return;const w=p.classList.contains("caution")||p.getAttribute("data-hi")==="toast-warn";if(p.firstChild&&p.firstChild.nodeType===3)p.firstChild.nodeValue=p.firstChild.nodeValue.replace(/^\u26a0\s*/,"");const sp=document.createElement("span");while(p.firstChild)sp.appendChild(p.firstChild);p.appendChild(sp);p.classList.add("bhint");if(w)p.classList.add("warn");p.insertAdjacentHTML("afterbegin",bI(w?"toast-warn":"ui-info"))});
 q(".lvup").forEach((b) =>{if(b.querySelector("svg"))return;const t=b.firstChild;if(t&&t.nodeType===3){const sp=document.createElement("span");b.insertBefore(sp,t);sp.appendChild(t);sp.insertAdjacentHTML("afterbegin",bI("ui-levelup"))}});
 q("button").forEach((b) =>{if(b.querySelector("svg")||b.closest(".noico"))return;put(b,bTxt(b)||(window.__icoText?window.__icoText(b):""))})}
/* M18: attuned items in the build (equipped items that need attunement) */
function attN(){return (B.inv||[]).filter((y) =>{return y.eq&&DMAP[y.n]&&DMAP[y.n][3]}).length}
window.__bldToggleEq=function(name,occ){ensureInv();const i=invFind(name,occ);if(i<0)return;const it=B.inv[i];if(!it.eq&&DMAP[it.n]&&DMAP[it.n][3]&&attN()>=attMax())return;it.eq=!it.eq;if(it.eq&&ARMOR[baseOf(it.n).b])B.inv.forEach((y,k) =>{if(k!==i&&ARMOR[baseOf(y.n).b])y.eq=false});save();if(window.__sheetSoft)window.__sheetSoft(toSheet())};
window.__bldSetQty=function(name,q,occ){ensureInv();const i=invFind(name,occ);if(i<0)return;B.inv[i].q=Math.max(0,Math.floor(+q)||0);save();if(window.__sheetSoft)window.__sheetSoft(toSheet())};
window.__bldRemove=function(name,occ){ensureInv();const i=invFind(name,occ);if(i<0)return;ctFree(B.inv[i]);B.inv.splice(i,1);save();if(window.__sheetSoft)window.__sheetSoft(toSheet())};
