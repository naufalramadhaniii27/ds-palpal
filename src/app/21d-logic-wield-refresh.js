import {C,S} from "./04-logic-storage.js";
import {currentAbilityScores,toast,weaponWieldInfo} from "./05-logic-helpers.js";
import {env} from "./00-env.js";
let wieldRefreshBusy=false,wieldRefreshSkipped=null;
function wieldRefreshContext(){const items=(C.inv||[]).filter(it=>it&&it.key&&it.wieldInfo&&it.wieldInfo.rule);if(!items.some(it=>weaponWieldInfo(it).allowed!==it.wieldInfo.allowed))return null;return {state:S,character:C,owner:C.name,signature:JSON.stringify([currentAbilityScores(),items])}}
function wieldRefreshCurrent(view){const current=wieldRefreshContext();return current&&current.state===view.state&&current.character===view.character&&current.owner===view.owner&&current.signature===view.signature}
function wieldRefreshSkip(view){return wieldRefreshSkipped&&wieldRefreshSkipped.character===view.character&&wieldRefreshSkipped.state===view.state&&wieldRefreshSkipped.signature===view.signature}
async function wieldRefreshRun(view){try{if(!env.__bldRefreshWield&&env.__bldNeed)await env.__bldNeed();if(!wieldRefreshCurrent(view))return;if(!env.__bldRefreshWield){wieldRefreshSkipped=view;return}const result=env.__bldRefreshWield(view.owner);if(!result||!result.ok){wieldRefreshSkipped=view;if(result)toast(result.reason==='manual'?'This sheet has manual changes. Open Build to update weapon availability.':'Open Build to update weapon availability.')}}catch(error){wieldRefreshSkipped=view}finally{wieldRefreshBusy=false;queueMicrotask(syncWieldMinimum)}}
/* A score override can cross a wield minimum without changing saved Build
   inputs. Reproject only an unchanged builder-made sheet; never replace manual
   edits, and never borrow another actor's scores while lazy loading. */
export function syncWieldMinimum(){if(wieldRefreshBusy)return;const view=wieldRefreshContext();if(!view){wieldRefreshSkipped=null;return}if(wieldRefreshSkip(view))return;wieldRefreshBusy=true;wieldRefreshRun(view)}
