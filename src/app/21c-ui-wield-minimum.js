import {C} from "./04-logic-storage.js";
import {esc,weaponWieldInfo} from "./05-logic-helpers.js";
/* The status is recomputed from the current character; no wield toggle is saved. */
export function weaponWieldControl(it){const info=weaponWieldInfo(it);if(!info.rule)return '';return '<div class="mwsw" data-wield-minimum data-wield-allowed="'+info.allowed+'"><div class="mwsw-t"><b>'+ (info.allowed?'Wield requirement met':'Weapon profile preview')+'</b><small>'+esc(info.text)+'</small>'+(!info.allowed?'<small>Weapon attacks require meeting this minimum.</small>':'')+'</div></div>'}

export function weaponWieldAttackControl(a){const name=String(a&&(a.of||a.n)||'').replace(/ \(thrown\)$/,''),it=(C.inv||[]).find(item=>(item.key||item.n)===name||item.n===name);if(!it)return '';const info=weaponWieldInfo(it);return info.rule&&!info.allowed?weaponWieldControl(it):''}
