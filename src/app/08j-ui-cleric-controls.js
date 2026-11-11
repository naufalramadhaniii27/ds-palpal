/* Shared ownership and native controls for the bounded Cleric feature panels. */
import {C,S,FROZEN,save} from './04-logic-storage.js';
import {esc,sheetRootActive} from './05-logic-helpers.js';
import {openSheet,undoMark,renderActions,syncLU} from './00a-reg-late-ports.js';
import {env} from './00-env.js';
export function clericUiActor(){return {C,S,readOnly:!!FROZEN}}
export function clericUiOwner(){return {C,S,name:C.name,cid:C.cid,id:C.id}}
export function clericUiOwned(owner,root){return !!owner&&!FROZEN&&owner.C===C&&owner.S===S&&owner.name===C.name&&owner.cid===C.cid&&owner.id===C.id&&sheetRootActive(root)}
export function clericUiCheckbox(key,label){return '<label class="ck info-d"><input type="checkbox" data-cleric-fact="'+esc(key)+'"><span>'+esc(label)+'</span></label>'}
export function clericUiFact(root,key){const input=root.querySelector('[data-cleric-fact="'+key+'"]');return !!input&&input.checked}
export function clericUiText(root,selector,value){const node=root.querySelector(selector);if(node&&node.textContent!==String(value))node.textContent=String(value)}
export function clericUiOpen(title,body){openSheet(title,'<div class="jform" data-cleric-panel data-roll-controls="own">'+body+'</div>');return document.querySelector('#sheet [data-cleric-panel]')}
export function clericUiPorts(){return {getActor:clericUiActor,rootActive:sheetRootActive,getDice:()=>env.__miRoll,beforeCommit:(owner,label,change)=>{if(owner.C!==C||owner.S!==S||FROZEN)return false;if(!change||change.changesActor!==false)undoMark(label||'Cleric feature')},save:owner=>{if(owner.C!==C||owner.S!==S||FROZEN)throw Error('stale actor');save()}}}
export function clericUiRefresh(){renderActions();syncLU()}
export function clericUiNumber(root,selector){const node=root.querySelector(selector),value=node&&node.value.trim();return value!==''&&value!==null?Number(value):NaN}
export function clericUiBusy(root,busy){root.querySelectorAll('input,select,button').forEach(node=>{node.disabled=!!busy})}
