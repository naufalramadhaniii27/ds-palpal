/* Both raw typed damage and already-adjusted entry use this native HP transaction. */
import {C,S,FROZEN,save} from './04-logic-storage.js';
import {iounCharacterMathStatus} from '../data/lib/ioun-orbit-source.js';
import {D} from './06-logic-derivation.js';
import {lateGet} from './00a-reg-late-ports.js';
import {concCheck,concEnd,concOf} from './32b-logic-play-concentration-casting.js';
import {undoMark,toastU} from './32-logic-play-undo-actions.js';
import {martyrZero} from './32e-logic-martyr-actions.js';
import {__set_DS_OVER,flash,hpFloat,hpOpen,syncHP} from './09-ui-hit-points-playbar-death-saves.js';
import {renderConds} from './10-ui-conditions.js';
import {sheet} from './12-ui-bottom-sheet-modal.js';
import {REDUCE} from './07-ui-theme-contrast-spring.js';
import {captureNativeActorIdentity,captureNativeActorFrame,invalidateNativeActorFrame} from './lib/native-actor-frame.js';
const fail=reason=>({ok:false,reason});
function permitted(guard){try{return !iounCharacterMathStatus(C,S).reviewRequired&&(!guard||guard()===true)}catch(error){return false}}
export function applyNativePlayerDamage(amount,options={}){
 if(FROZEN||!Number.isFinite(amount)||amount<0||!Number.isInteger(amount))return fail('actual-damage-required');
 if(!permitted(options.guard))return fail('stale-player-damage');
 if(amount===0)return {ok:true,committed:false,applied:0,current:captureNativeActorFrame({allowCharacterClone:true})};
 const pending=captureNativeActorFrame();if(!pending())return fail('stale-player-damage');
 undoMark('Damage');if(!pending()||!permitted(options.guard))return fail('stale-player-damage');
 invalidateNativeActorFrame(S);const owner=captureNativeActorIdentity(),record=nativeDamageState(amount,options.input,options.critical===true,owner);
 if(!owner())return {...fail('actor-changed-during-damage'),committed:true,applied:amount};
 const post=captureNativeActorFrame({allowCharacterClone:true});if(!post())return {...fail('actor-changed-during-damage'),committed:true,applied:amount};
 save();if(!post())return {...fail('actor-changed-after-damage'),committed:true,applied:amount};
 syncHP();if(!owner())return {...fail('actor-changed-after-damage'),committed:true,applied:amount};
 renderConds();if(!owner())return {...fail('actor-changed-after-damage'),committed:true,applied:amount};
 const consequences=captureNativeActorFrame({allowCharacterClone:true});nativeDamageConsequences(record,consequences,options.critical===true);
 return {ok:true,committed:true,applied:amount,fromTemporary:record.fromTmp,hpLoss:record.hpLoss,current:consequences};
}
function nativeDamageState(amount,input,critical,owner){
 const a0=amount,fromTmp=Math.min(S.tmp,amount);S.tmp-=fromTmp;amount-=fromTmp;const before=S.hp;S.hp=Math.max(0,S.hp-amount);S.lastDmg={a:a0,hp:before-S.hp,tmp:fromTmp};
 if(S.hp<before){flash('hit');hpFloat('\u2212'+(before-S.hp),'dmg')}else if(fromTmp)hpFloat('\u2212'+fromTmp+' temp','tmp');if(input)input.value='';
 let cm='',z0=before===0&&amount>0&&S.ds&&S.ds[1]<3&&!(S.exh>=6);
 if(z0){S.ds=S.ds.slice();if(S.ds[0]>=3)S.ds[0]=0;S.ds[1]=Math.min(3,S.ds[1]+(critical?2:1))}
 if(before>0&&S.hp===0)__set_DS_OVER(Math.max(0,amount-before)>=D.hpmax?amount-before:0);
 if(concOf()&&S.hp===0)cm=' '+concEnd('0 Hit Points',owner);
 return {a0,fromTmp,before,cm,z0,hpLoss:before-S.hp};
}
function nativeDamageConsequences(record,current,critical){
 if(!current())return;const {before,z0,a0,fromTmp,cm}=record;
 if(before>0&&S.hp===0){toastU('0 Hit Points. Start making Death Saving Throws.'+cm);try{martyrZero(current)}catch(error){}if(!current())return;if(lateGet('mq').matches&&lateGet('curPage')!==0&&!sheet.classList.contains('on'))hpOpen();else if(!sheet.classList.contains('on'))setTimeout(()=>{if(!current())return;const guide=document.getElementById('dsGuide');if(guide&&guide.scrollIntoView)guide.scrollIntoView({block:'nearest',behavior:REDUCE?'auto':'smooth'})},480)}
 else if(z0)toastU('Took '+a0+' damage at 0 Hit Points: '+(critical?'two Death Saving Throw failures':'one Death Saving Throw failure')+' ('+S.ds[1]+' of 3).'+(S.ds[1]>=3?' Your character dies.':critical?'':' A Critical Hit counts as two: use Critical Hit under Death Saves.'));
 else toastU('Took '+a0+' damage'+(fromTmp?' ('+fromTmp+' from Temporary Hit Points)':'')+'.');
 if(current()&&concOf())concCheck(a0,current);
}
