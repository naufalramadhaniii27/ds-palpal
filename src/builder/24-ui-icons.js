import {storedSpellProfile} from "./01-logic-core-helpers.js";
import {bindLive,own,lateGet} from "./01b-logic-late-ports.js";import {genv} from "./00-env.js";
import {DMAP,attMax,attunementState,setItemAttuned,getItemFormInfo,setItemForm,getItemToolFormInfo,setItemToolForm,getVehicleInfo,setDMsize,activateVehicle,splitVehicleOne} from "./03-logic-magic-item-effects.js";
import {B,save} from "./04-logic-storage.js";
import {toSheet} from "./12-logic-export-to-sheet.js";
import {baseOf,ensureInv} from "./14-logic-multiclass-hp-shop.js";
import {bI} from "./17-ui-step-builder.js";
import {ctFree,invFind} from "./21-ui-rules-reference.js";

bindLive("attN",{get:function(){return attN;}});
bindLive("bDeco",{get:function(){return bDeco;}});
/* v33 p02: header and footer icons (one line style, like the sheet) */
(function(){const pre=function(id,k,end){const e=typeof id==="string"?document.querySelector(id):id;if(!e||e.querySelector("svg"))return;e.insertAdjacentHTML(end?"beforeend":"afterbegin",bI(k))};
 pre("#bld .brand b","ui-build");pre("#bld .lvhead","ui-levelup");pre("#b-close","ui-close");pre("#prev","ui-chev-l");const nx=document.getElementById("next"),ns=nx&&nx.querySelector("svg");if(ns)ns.remove();pre("#next","ui-chev-r",true)})();
/* v33 p02: every builder button carries an icon. Chips and radios show their state, buttons their action. Runs after each render */
const BTXT=[[/^(Add|Add Item|Add Source|Create)$/,"ui-plus"],[/^Quick Build$/,"ui-build"],[/^(Wield|Wear|Use|Attune|Equip)$/,"ui-box"],[/^(Wielding|Wearing|In Use|Attuned|Unequip)$/,"item-equipped"],[/^Unpack$/,"ui-bag"],
 [/^(Prepare|Learn)$/,"ui-plus"],[/^Chosen$/,"ui-check"],[/^(Unprepare|Unlearn)$/,"ui-minus"],[/^Remove/,"ui-trash"],[/^Clear All$/,"ui-trash"],[/^Read: /,"ui-book"],[/pack template$/,"ui-file"],[/^Change /,"ui-pen"],[/^Edit$/,"ui-pen"],[/^Cancel$/,"ui-close"],
 [/^Skip /,"ui-close"],[/^Start a new character$/,"home-create"],[/^Restore backup/,"home-restore"],[/^Level Up to /,"ui-levelup"],[/^Load from sheet/i,"home-import"],[/^Export/i,"home-export"]];
const BINV={ARMOR:"item-armor",POTION:"item-potion",RING:"item-ring",ROD:"item-rod",SCROLL:"item-scroll",STAFF:"item-staff",WAND:"item-wand",WEAPON:"item-weapon",WONDROUS:"item-wondrous",GEAR:"item-gear"};
function bTxt(b){const t=(b.textContent||"").replace(/\s+/g," ").trim();for(let i=0;i<BTXT.length;i++)if(BTXT[i][0].test(t))return BTXT[i][1];return ""}
/* bDeco steps (SOLID s16): q(selector) lists the nodes under root, put(e,k,end) adds the icon k once */
function bdQ(root,s){return Array.prototype.slice.call(root.querySelectorAll(s))}
function bdPut(e,k,end){if(!k||e.querySelector("svg"))return;e.insertAdjacentHTML(end?"beforeend":"afterbegin",bI(k))}
function bdChips(q,put){
 q(".chip").forEach((b) =>{if(b.querySelector("svg"))return;const on=b.classList.contains("on");if(b.classList.contains("clash")&&b.firstChild&&b.firstChild.nodeType===3)b.firstChild.nodeValue=b.firstChild.nodeValue.replace(/^\u26a0\s*/,"");put(b,on?"ui-check":b.classList.contains("clash")?"toast-warn":b.classList.contains("have")?"ui-check":"ui-plus")});
 q(".rad").forEach((b) =>{put(b,b.classList.contains("on")?"ui-radio-on":"fr-round")});
 q(".eqo .bcb").forEach((s) =>{if(!s.querySelector("svg"))s.innerHTML=bI(s.parentNode.classList.contains("on")?"item-equipped":"ui-box")});
 q("[data-invt]").forEach((b) =>{put(b,BINV[b.getAttribute("data-invt")])});}
function bdData(q,put,ICO){
 q("[data-invr],[data-custr]").forEach((b) =>{put(b,"item-wondrous")});q("[data-avar]").forEach((b) =>{put(b,b.getAttribute("data-k")==="0"?"ui-minus":"ui-star")});
 q("[data-setcls]").forEach((b) =>{const k=genv.__icoCls?genv.__icoCls(b.getAttribute("data-setcls")):"";put(b,ICO[k]?k:"src-class")});
 q("[data-setsp]").forEach((b) =>{const k="sp-"+String(b.getAttribute("data-setsp")).toLowerCase().replace(/ \(.*\)$/,"");put(b,ICO[k]?k:"sp-custom")});}
function bdTail(q,put){
 q(".bxbtn").forEach((b) =>{if(b.querySelector("svg"))return;b.textContent="";put(b,b.hasAttribute("data-mcdel")?"ui-trash":"ui-pen")});
 q(".rmv").forEach((b) =>{if(b.querySelector("svg"))return;if(b.firstChild&&b.firstChild.nodeType===3)b.firstChild.nodeValue=b.firstChild.nodeValue.replace(/^\u2715\s*/,"");put(b,"ui-trash")});
 q("p.bhint,.bwarn,.caution").forEach((p) =>{if(p.querySelector(":scope > svg"))return;const w=p.classList.contains("caution")||p.getAttribute("data-hi")==="toast-warn";if(p.firstChild&&p.firstChild.nodeType===3)p.firstChild.nodeValue=p.firstChild.nodeValue.replace(/^\u26a0\s*/,"");const sp=document.createElement("span");while(p.firstChild)sp.appendChild(p.firstChild);p.appendChild(sp);p.classList.add("bhint");if(w)p.classList.add("warn");p.insertAdjacentHTML("afterbegin",bI(w?"toast-warn":"ui-info"))});
 q(".lvup").forEach((b) =>{if(b.querySelector("svg"))return;const t=b.firstChild;if(t&&t.nodeType===3){const sp=document.createElement("span");b.insertBefore(sp,t);sp.appendChild(t);sp.insertAdjacentHTML("afterbegin",bI("ui-levelup"))}});
 q("button").forEach((b) =>{if(b.querySelector("svg")||b.closest(".noico"))return;put(b,bTxt(b)||(genv.__icoText?genv.__icoText(b):""))})}
function bDeco(root){const ICO=genv.__ICO;if(!root||!ICO)return;const q=function(s){return bdQ(root,s)},put=bdPut;
 bdChips(q,put);bdData(q,put,ICO);bdTail(q,put)}
/* M18: attuned items in the build (equipped items that need attunement) */
function attN(){ensureInv();return attunementState().used}
function typedInventoryWriteAllowed(row,name,occ){for(const [field,port] of [['timedDefenses','__timedDefensesInventoryWriteAllowed'],['magicRopes','__magicRopesInventoryWriteAllowed'],['birdToken','__birdTokenInventoryWriteAllowed'],['defender','__defenderInventoryWriteAllowed'],['hornValhalla','__hornValhallaInventoryWriteAllowed'],['bagTricks','__bagTricksInventoryWriteAllowed'],['studyBook','__studyBookInventoryWriteAllowed'],['slotRecovery','__slotRecoveryInventoryWriteAllowed']])if(Object.prototype.hasOwnProperty.call(row,field)&&(!genv[port]||!genv[port](name,occ)))return false;return !(storedSpellProfile(row.key||row.n)||Object.prototype.hasOwnProperty.call(row,'storedSpells'))||!!(genv.__storedInventoryWriteAllowed&&genv.__storedInventoryWriteAllowed(name,occ))}
genv.__bldToggleEq=function(name,occ){ensureInv();const i=invFind(name,occ);if(i<0)return;if(!typedInventoryWriteAllowed(B.inv[i],name,occ))return false;const it=B.inv[i];it.eq=!it.eq;if(it.eq&&ARMOR[baseOf(it.n).b])B.inv.forEach((y,k) =>{if(k!==i&&ARMOR[baseOf(y.n).b])y.eq=false});save();if(genv.__sheetSoft)genv.__sheetSoft(toSheet())};
genv.__bldSetQty=function(name,q,occ){ensureInv();const i=invFind(name,occ);if(i<0)return;if(!typedInventoryWriteAllowed(B.inv[i],name,occ))return false;B.inv[i].q=Math.max(0,Math.floor(+q)||0);save();if(genv.__sheetSoft)genv.__sheetSoft(toSheet())};
genv.__bldRemove=function(name,occ){ensureInv();const i=invFind(name,occ);if(i<0)return;if(!typedInventoryWriteAllowed(B.inv[i],name,occ))return false;ctFree(B.inv[i]);B.inv.splice(i,1);save();if(genv.__sheetSoft)genv.__sheetSoft(toSheet())};

function formIndex(name,occ){if(typeof name!=="string"||!name||occ!=null&&(!Number.isInteger(occ)||occ<0))return -1;let left=occ==null?0:occ;for(let i=0;i<(B.inv||[]).length;i++){const it=B.inv[i];if((it.n===name||it.alias===name)&&left--===0)return i}return -1}
genv.__bldVehicleInfo=function(name,owner,occ){if(owner!==B.name||!own(owner))return {available:false,bound:false,reason:"owner"};ensureInv();const info=getVehicleInfo(formIndex(name,occ)),guard=lateGet("inventoryWriteGuard")(owner);return Object.assign({},info,{bound:guard.ok},guard.ok?{}:{available:false,splitAvailable:false,reason:guard.reason})};
function vehicleExpected(owner,name,occ,expected){const guard=lateGet("inventoryWriteGuard")(owner);if(!guard.ok)return guard;ensureInv();const index=formIndex(name,occ),info=getVehicleInfo(index);return expected&&expected.index===index&&expected.signature===info.signature?{ok:true,index:index}:{ok:false,reason:"stale"}}
function vehicleBeforeWrite(owner,name,occ,expected,beforeCommit){if(typeof beforeCommit==="function"){const result=beforeCommit();if(result===false||result&&typeof result.then==="function")return false}return vehicleExpected(owner,name,occ,expected).ok}
function vehicleMutation(name,owner,change,occ,expected,beforeCommit,split){const current=vehicleExpected(owner,name,occ,expected);if(!current.ok)return current;const before=()=>vehicleBeforeWrite(owner,name,occ,expected,beforeCommit),result=split?splitVehicleOne(current.index,change,before):vehicleChange(current.index,change,before);if(result.ok){save();genv.__sheetSoft(toSheet())}return result}
function vehicleChange(index,change,before){if(!change||typeof change!=="object"||Array.isArray(change))return {ok:false,reason:"change"};if(Object.keys(change).length===1&&Object.prototype.hasOwnProperty.call(change,"size"))return setDMsize(index,change.size,before);if(change.activate===true){const declarations=Object.assign({},change);delete declarations.activate;return activateVehicle(index,declarations,before)}return {ok:false,reason:"change"}}
genv.__bldSetVehicle=function(name,owner,change,occ,expected,beforeCommit=undefined){return vehicleMutation(name,owner,change,occ,expected,beforeCommit,false)};
genv.__bldSplitVehicle=function(name,owner,change,occ,expected,beforeCommit=undefined){return vehicleMutation(name,owner,change,occ,expected,beforeCommit,true)};
genv.__bldToolFormInfo=function(name,owner,occ){if(owner!==B.name||!own(owner))return {available:false,bound:false,reason:"owner"};ensureInv();const info=getItemToolFormInfo(formIndex(name,occ)),guard=lateGet("toolFormWriteGuard")(owner);return Object.assign({},info,{bound:guard.ok},guard.ok?{}:{available:false,reason:guard.reason})};
function toolFormBeforeWrite(owner,name,occ,expected,beforeCommit){if(typeof beforeCommit==="function"){const result=beforeCommit();if(result&&typeof result.then==="function")return false}const guard=lateGet("toolFormWriteGuard")(owner),index=formIndex(name,occ),info=getItemToolFormInfo(index);return guard.ok&&index===expected.index&&info.signature===expected.signature}
genv.__bldSetToolForm=function(name,owner,change,occ,expected,beforeCommit=undefined){const guard=lateGet("toolFormWriteGuard")(owner);if(!guard.ok)return guard;ensureInv();const index=formIndex(name,occ),info=getItemToolFormInfo(index);if(!expected||expected.index!==index||expected.signature!==info.signature)return {ok:false,reason:"stale"};const result=setItemToolForm(index,change,()=>toolFormBeforeWrite(owner,name,occ,expected,beforeCommit));if(result.ok){save();genv.__sheetSoft(toSheet())}return result};
genv.__bldFormInfo=function(name,owner,occ){if(!own(owner))return {available:false,reason:"owner"};ensureInv();return getItemFormInfo(formIndex(name,occ))};
genv.__bldSetForm=function(name,owner,change,occ){if(!own(owner))return {ok:false,reason:"owner"};ensureInv();const result=setItemForm(formIndex(name,occ),change);if(result.ok){save();if(genv.__sheetSoft)genv.__sheetSoft(toSheet())}return result};
genv.__bldSetAttuned=function(name,owner,on,occ){if(!own(owner))return {ok:false,reason:"owner"};ensureInv();const index=invFind(name,occ),result=setItemAttuned(index,on);
 if(result.ok){save();if(genv.__sheetSoft)genv.__sheetSoft(toSheet())}return result};
