/* Saved spell DCs are verified against the original source; no number is reconstructed here. */
import {C,FROZEN} from './04-logic-storage.js';
import {env} from './00-env.js';
import {lateGet} from './00a-reg-late-ports.js';
import {captureNativeActorFrame} from './lib/native-actor-frame.js';
import {nativeSpellBonusItemNames,nativeSpellBonusSourceClaim,nativeSpellBonusAttackClaim,nativeSpellBonusReviewGuidance} from '../data/lib/pact-rod-source.js';
const rodNames=nativeSpellBonusItemNames(),views=new WeakMap(),guidance=nativeSpellBonusReviewGuidance;
const own=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key);
function fixed(spell,stat=spell?.sv==='ATK'?'atk':'dc'){return ['fixedSpellSource','tattooSource','gemSpellcasting','storedSpellcasting','storedSpellSlotLevel'].some(key=>own(spell,key))||Number.isFinite(spell?.itc?.[stat])}
function targetKey(index){if(index&&typeof index==='object'&&Reflect.ownKeys(index).length===1&&own(index,'spellAttack')&&Number.isInteger(index.spellAttack)&&index.spellAttack>=0)return 'spell-attack:'+index.spellAttack;if(index&&typeof index==='object'&&Reflect.ownKeys(index).length===1&&own(index,'sheet')&&index.sheet===true)return 'sheet';if(index===null)return 'main';if(typeof index==='string')return 'channel:'+JSON.stringify(index);if(Number.isInteger(index))return 'spell:'+index;return index&&Reflect.ownKeys(index).length===1&&own(index,'attack')&&Number.isInteger(index.attack)&&index.attack>=0?'attack:'+index.attack:null}
function attributed(row){return typeof row?.miscSrc==='string'&&rodNames.some(name=>row.miscSrc.includes(name))}
function spellAttackCandidate(row){return nativeSpellBonusAttackClaim(C,row)||!!row&&/spell attack/i.test(String(row.sub||''))}
function sourceClaim(){return nativeSpellBonusSourceClaim(C)}
function suspect(index){if(index&&typeof index==='object'){if(own(index,'sheet'))return sourceClaim();if(own(index,'spellAttack')){const spell=C.spells?.[index.spellAttack];return !!spell&&!fixed(spell,'atk')&&sourceClaim()}const row=C.attacks?.[index.attack];return spellAttackCandidate(row)&&(attributed(row)||sourceClaim())}const spell=Number.isInteger(index)?C.spells?.[index]:null;if(Number.isInteger(index)&&(!spell?.sv||fixed(spell)))return false;return sourceClaim()}
function info(index){try{return typeof env.__bldPactRodSpellInfo==='function'?env.__bldPactRodSpellInfo(C.name,index):undefined}catch(error){return undefined}}
function nativeCurrent(token){try{return !!token&&typeof env.__bldPactRodSpellCurrent==='function'&&env.__bldPactRodSpellCurrent(token)===true}catch(error){return false}}
function capture(index,result){try{return typeof env.__bldPactRodSpellCapture==='function'?env.__bldPactRodSpellCapture(C.name,{index,signature:result.signature}):null}catch(error){return null}}
export function pactRodSpellReview(index){const result=info(index);return result?.ok||result==null&&!suspect(index)?'':guidance}
export function pactRodCastCurrent(context,index){if(context===undefined)return true;const view=views.get(context);return !!(view&&view.index===targetKey(index)&&view.frame()&&nativeCurrent(view.native))}
export function preparePactRodCast(index,previous=undefined){
 if(previous!==undefined)return pactRodCastCurrent(previous,index)?{ok:true,context:previous}:{ok:false,guidance};
 const result=info(index);if(result==null&&!suspect(index))return {ok:true,context:undefined};if(!result?.ok||FROZEN)return {ok:false,guidance};
 const native=capture(index,result),frame=captureNativeActorFrame();if(!frame()||!nativeCurrent(native))return {ok:false,guidance};
 const context={};views.set(context,{index:targetKey(index),native,frame});return {ok:true,context};
}

export function pactRodLegacyAttackGuard(){return sourceClaim()?()=>false:undefined}
export function pactRodMainRollGuard(bonus){const permission=preparePactRodCast(null);if(!permission.ok)return ()=>false;if(permission.context===undefined)return undefined;const adjust=lateGet("scAdj"),stats=typeof adjust==="function"?adjust(C.spellcasting||{}):null;if(!stats||!Number.isFinite(bonus)||stats.atk!==bonus)return ()=>false;return ()=>pactRodCastCurrent(permission.context,null);}

export function pactRodAttackGuard(index){if(!spellAttackCandidate(C.attacks?.[index]))return undefined;const target=Object.freeze({attack:index}),permission=preparePactRodCast(target);if(!permission.ok)return false;if(permission.context===undefined)return undefined;return ()=>pactRodCastCurrent(permission.context,target);}

export function pactRodSheetReview(){if(!sourceClaim())return "";const result=info(Object.freeze({sheet:true}));return result?.ok?"":guidance;}
