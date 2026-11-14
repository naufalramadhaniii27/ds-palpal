/* Native asynchronous HP consequences stay with the exact actor and payload. */
import {C,S,FROZEN} from '../04-logic-storage.js';
import {env} from '../00-env.js';
import {D} from '../06-logic-derivation.js';
const epochs=new WeakMap();
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
export function invalidateNativeActorFrame(state){if(state&&typeof state==='object')epochs.set(state,{})}
function shape(value,top=false){if(value===null||typeof value!=='object')return [typeof value,String(value)];const keys=Reflect.ownKeys(value),version=env.__appVer,native=top&&typeof env.__lsSave==='function'&&Number.isSafeInteger(version)&&version>=0;if(native&&!keys.includes('_app'))keys.push('_app');return [Array.isArray(value)?'array':'object',keys.map(key=>[typeof key,String(key),shape(native&&key==='_app'?Math.max(+value._app||0,version):value[key])])]}
export function captureNativeActorIdentity(){const state=S,identity=JSON.stringify([C.name,C.cid,C.id]),id=env.__sheetId?.(),generation=epoch(S);return ()=>!!(!FROZEN&&S===state&&epoch(S)===generation&&env.__sheetId?.()===id&&JSON.stringify([C.name,C.cid,C.id])===identity)}
export function captureNativeActorOwner(){const character=C,identity=captureNativeActorIdentity();return ()=>C===character&&identity()}

export function nativeActorPayload(){return JSON.stringify([shape(C,true),shape(S,true),D.hpmax])}
export function captureNativeActorFrame(options={allowCharacterClone:false}){const owner=options.allowCharacterClone?captureNativeActorIdentity():captureNativeActorOwner(),payload=nativeActorPayload();return ()=>owner()&&nativeActorPayload()===payload}
