/* Archery values remain native. Unverified saved bow sources cannot authorize a roll. */
import {C,FROZEN} from './04-logic-storage.js';
import {D} from './06-logic-derivation.js';
import {env} from './00-env.js';
import {captureNativeActorFrame} from './lib/native-actor-frame.js';
const ARCHERY='Bracers of Archery';
const guidance='These saved bow values need review. Open this character’s matching Build and Apply to verify its original Bracers of Archery, bow proficiency and damage.';
function tagged(value){return typeof value==='string'&&(value===ARCHERY||value.startsWith(ARCHERY+' (')||value.startsWith(ARCHERY+': '))}
function attackCandidate(index){const row=C.attacks?.[index];if(!row)return false;if(String(row.miscSrc||'').split('; ').some(tagged))return true;const source=(Array.isArray(C.inv)&&C.inv.some(item=>(Object.prototype.hasOwnProperty.call(item,'key')?item.key:item.n)===ARCHERY))||(Array.isArray(C.profSrc?.weapons)&&C.profSrc.weapons.some(item=>Array.isArray(item)&&tagged(item[1])));return !!source&&/\b(?:Longbow|Shortbow)\b/.test(String(row.n)+' '+String(row.dieSrc||''))}
function query(index){try{return typeof env.__bldBracersAttackInfo==='function'?env.__bldBracersAttackInfo(C.name,index):undefined}catch(error){return undefined}}
function currentToken(token){try{return !!token&&typeof env.__bldBracersAttackCurrent==='function'&&env.__bldBracersAttackCurrent(token)===true}catch(error){return false}}
function capture(index,info){try{return typeof env.__bldBracersAttackCapture==='function'?env.__bldBracersAttackCapture(C.name,{index,signature:info.signature}):null}catch(error){return null}}
function denied(spec){return {...spec,sourceGuard:()=>false,sourceGuidance:guidance,sourceFailureGuidance:guidance}}
export function bracersAttackSpec(key,spec){
 const match=/^(ah|ad)-([0-9]+)$/.exec(key);if(!match||!spec)return spec;const index=Number(match[2]),info=query(index),suspect=attackCandidate(index);
 if(info==null&&!suspect)return spec;if(!info?.ok||FROZEN)return denied(spec);
 const token=capture(index,info),frame=captureNativeActorFrame(),derived=JSON.stringify(D.atk?.[index]),prior=spec.sourceGuard;
 if(!currentToken(token)||!frame()||!Number.isFinite(D.atk?.[index]?.hit)||prior!==undefined&&typeof prior!=='function')return denied(spec);
 const guard=()=>{try{return frame()&&JSON.stringify(D.atk?.[index])===derived&&currentToken(token)&&(prior===undefined||prior()===true)}catch(error){return false}};
 return {...spec,sourceGuard:guard,sourceFailureGuidance:guidance};
}
env.__bracersAttackSpec=bracersAttackSpec;
