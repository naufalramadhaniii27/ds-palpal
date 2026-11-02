import {KEY,clone} from "./01-logic-core-helpers.js";
import {BLANK,cleanCh} from "./03-logic-magic-item-effects.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"B",{get:function(){return B;},set:function(v){B=v;},configurable:true});
/* v18 RU78: a build that cannot be read opens the recovery screen (sheet.js) instead of being replaced by a blank one */
export function loadB(){try{const r=__store.getItem(KEY);if(r){const p=JSON.parse(r);if(p&&p.cls){for(const k in BLANK)if(p[k]==null)p[k]=clone(BLANK)[k];return cleanCh(p)}if(!p||typeof p!=="object"||Array.isArray(p))throw new Error("the saved build has a shape this version does not know")}}catch(e){if(window.__recover)window.__recover("Build",e)}return clone(BLANK)}
export var B=loadB();
/* v18 RL47, RU61: written through the sheet's lsSave (field _app, full storage caution, paused tab) */
export function save(){if(window.__lsSave)window.__lsSave(KEY,B);else try{__store.setItem(KEY,JSON.stringify(B))}catch(e){}}
/* C2/L3: saved build as stored (null = none yet) and a one-slot backup before it is replaced from the sheet.
   The backup has the same shape as KEY, so copying it back into KEY restores the build. */
export var BAK=KEY+"-bak";
export function savedRaw(){try{return __store.getItem(KEY)}catch(e){return null}}
export function saveBak(raw){if(raw==null)return;if(window.__lsSet)window.__lsSet(BAK,raw);else try{__store.setItem(BAK,raw)}catch(e){}}


export function __set_B(v){ return B=v; }
