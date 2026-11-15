/* Qualified item Advantage uses the actual native check flags and roll bonus. */
import {C,S,FROZEN} from './04-logic-storage.js';
import {D} from './06-logic-derivation.js';
import {env} from './00-env.js';
import {cfSkill} from './34b-ui-combat-effects-modes.js';
import {iounOrbitCheckRoll} from './32v-logic-ioun-orbit.js';
import {captureNativeActorFrame} from './lib/native-actor-frame.js';
import {perceptionItemSourceStatus} from '../data/lib/perception-item-source.js';
import {canonicalTceSpellBonus} from '../data/lib/tce-spell-bonus-profiles.js';
function context(key){if(key==='init')return {bonus:D.init,flags:[...(D.cf?.chk||[]),...(D.cf?.init||[])]};const match=/^sk-([0-9]+)$/.exec(key),index=match?Number(match[1]):-1,row=C.skills?.[index];return row?.n==='Perception'?{bonus:D.skill?.[index],flags:cfSkill(row)}:null}
function flagLists(flags){const adv=flags.filter(flag=>flag.t==='ADV').map(flag=>flag.s),dis=flags.filter(flag=>flag.t==='DIS').map(flag=>flag.s),fail=flags.filter(flag=>flag.t==='FAIL').map(flag=>flag.s);return {adv,dis,fail,mode:adv.length&&!dis.length?'adv':dis.length&&!adv.length?'dis':''}}
function sourceCurrent(){if(typeof env.__nativePerceptionItemSourceCurrent!=="function")return {available:false,value:null};try{const value=env.__nativePerceptionItemSourceCurrent(C);return {available:true,value:value===null||typeof value?.current==="boolean"&&typeof value?.stamp==="string"?value:{current:false}}}catch(error){return {available:true,value:{current:false}}}}
export function perceptionItemReview(){if(perceptionItemSourceStatus(C).reviewRequired)return 'The saved Rod of Alertness or Sentinel Shield Advantage needs verification. Apply this character’s matching Build; ordinary checks and manual Advantage remain available.';return sourceCurrent().value?.current===false?'The original Rod of Alertness or Sentinel Shield source changed. Review and Apply this character’s matching Build before using its recorded check benefits.':''}
export function nativePerceptionCheckRoll(key){
 const current=context(key);if(FROZEN||!current||!Number.isFinite(current.bonus)||!perceptionItemSourceStatus(C).relevant)return undefined;
 const character=C,state=S,frame=captureNativeActorFrame(),stamp=canonicalTceSpellBonus(current),proof=sourceCurrent(),source=canonicalTceSpellBonus([perceptionItemSourceStatus(C),proof]),ioun=iounOrbitCheckRoll(key);
 if(typeof stamp!=='string'||typeof source!=='string'||!frame()||proof.value?.current===false)return {...flagLists([]),guard:()=>false};
 const guard=()=>!FROZEN&&C===character&&S===state&&frame()&&canonicalTceSpellBonus(context(key))===stamp&&canonicalTceSpellBonus([perceptionItemSourceStatus(C),sourceCurrent()])===source&&(!ioun||typeof ioun.guard==='function'&&ioun.guard());
 return {...flagLists(current.flags),bonus:current.bonus,guard};
}
env.__nativePerceptionCheckRoll=nativePerceptionCheckRoll;
