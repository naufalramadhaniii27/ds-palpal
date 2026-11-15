/* Native asynchronous HP consequences stay with the exact actor and payload. */
import {C,S,FROZEN} from '../04-logic-storage.js';
import {env} from '../00-env.js';
import {D} from '../06-logic-derivation.js';
import {iounCharacterMathStatus as cachedCharacterMathStatus} from '../../data/lib/ioun-orbit-source.js';
import {canonical} from '../../data/lib/vecna-graft-profiles.js';
function activeHandProof(character){return ['native-current-existing','native-current-graft','legacy-original','custom-explicit'].includes(character?.handVecnaStrength?.mode)}
function handCurrent(character,state){try{const value=typeof env.__nativeHandVecnaStrengthCurrent==='function'?env.__nativeHandVecnaStrengthCurrent(character,state):null;return value?.current===true&&typeof value.stamp==='string'?value:{current:false,stamp:'hand-strength-source-unavailable'}}catch{return {current:false,stamp:'hand-strength-source-unavailable'}}}
export function nativeCharacterMathStatus(character=C,state=S){const status=cachedCharacterMathStatus(character,state);if(status.reviewRequired||!activeHandProof(character))return status;return handCurrent(character,state).current?status:{reviewRequired:true,source:'hand-vecna',reason:'hand-strength-source-unavailable'}}
function handSourceStamp(){if(nativeCharacterMathStatus(C,S).reviewRequired)return null;return canonical(activeHandProof(C)?handCurrent(C,S):null)}
const epochs=new WeakMap();
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
export function invalidateNativeActorFrame(state){if(state&&typeof state==='object')epochs.set(state,{})}
function shape(value,top=false){if(value===null||typeof value!=='object')return [typeof value,String(value)];const keys=Reflect.ownKeys(value),version=env.__appVer,native=top&&typeof env.__lsSave==='function'&&Number.isSafeInteger(version)&&version>=0;if(native&&!keys.includes('_app'))keys.push('_app');return [Array.isArray(value)?'array':'object',keys.map(key=>[typeof key,String(key),shape(native&&key==='_app'?Math.max(+value._app||0,version):value[key])])]}
export function captureNativeActorIdentity(){const state=S,identity=JSON.stringify([C.name,C.cid,C.id]),id=env.__sheetId?.(),generation=epoch(S);return ()=>!!(!FROZEN&&S===state&&epoch(S)===generation&&env.__sheetId?.()===id&&JSON.stringify([C.name,C.cid,C.id])===identity&&!nativeCharacterMathStatus(C,S).reviewRequired)}
export function captureNativeActorOwner(){const character=C,identity=captureNativeActorIdentity();return ()=>C===character&&identity()}

export function nativeActorPayload(){return JSON.stringify([shape(C,true),shape(S,true),D.hpmax])}
export function captureNativeActorFrame(options={allowCharacterClone:false}){const owner=options.allowCharacterClone?captureNativeActorIdentity():captureNativeActorOwner(),payload=nativeActorPayload(),source=handSourceStamp();return ()=>source!==null&&owner()&&nativeActorPayload()===payload&&handSourceStamp()===source}
