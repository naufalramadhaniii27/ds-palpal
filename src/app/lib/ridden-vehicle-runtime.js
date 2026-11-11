/* Current rider declarations describe a vehicle, never a character speed grant. */
import {C,S} from '../04-logic-storage.js';
import {sheetRootActive} from '../05-logic-helpers.js';
import {riddenVehicleMetadata,riddenVehicleSourceStatus,activateRiddenVehicle,endRiddenVehicle,evaluateRiddenVehicle} from '../../data/lib/ridden-vehicle.js';
const sessions=new WeakSet(),INCAP=['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'];
const rowAt=index=>Number.isInteger(index)&&(C.inv||[])[index];
const blocked=(reason,info={})=>({allowed:false,reason,breakdown:'',result:null,...info});
function nativeEdition(row){const edition=C.rs===undefined?'2024':C.rs;if(!['2014','2024'].includes(edition))return null;const profile=row&&row.riddenVehicleInfo;return profile&&Object.prototype.hasOwnProperty.call(profile,'nativeEdition')&&profile.nativeEdition!==edition?null:edition}
function cannotAct(){return INCAP.some(condition=>(S.cond||{})[condition])}
function cannotSpeak(edition){const conditions=edition==='2014'?['Paralyzed','Petrified','Unconscious']:INCAP;return conditions.some(condition=>(S.cond||{})[condition])}
function unaware(){return ['Petrified','Unconscious'].some(condition=>(S.cond||{})[condition])}
export function currentRiddenActivation(index,declarations={}){
 const row=rowAt(index),edition=nativeEdition(row),metadata=row&&riddenVehicleMetadata(row.key||row.n,edition);if(!edition)return blocked('source-profile-mismatch',{metadata});const source=riddenVehicleSourceStatus(row,edition);if(!source.ok)return blocked(source.reason,{metadata,nativeEdition:edition});
 if(!metadata.activation)return blocked('activation-unavailable',{metadata,nativeEdition:edition});if(metadata.activation==='Magic'&&cannotAct())return blocked('cannot-take-action',{metadata,nativeEdition:edition});if(metadata.activation==='Command word'&&cannotSpeak(edition))return blocked('cannot-speak',{metadata,nativeEdition:edition});
 const result=activateRiddenVehicle(row,declarations,edition),breakdown=edition==='2014'?'Astride this broom and its command word spoken; no activation action is printed.':'Magic action while astride this broom; no holding, word, load, or distance prerequisite.';return result?{allowed:true,reason:'',metadata,nativeEdition:edition,result,breakdown}:blocked('activation-declarations-required',{metadata,nativeEdition:edition});
}
export function currentRiddenEnding(index,declarations={}){
 const row=rowAt(index),edition=nativeEdition(row),metadata=row&&riddenVehicleMetadata(row.key||row.n,edition);if(!edition)return blocked('source-profile-mismatch',{metadata});if(!metadata||!metadata.activation)return blocked('ending-unavailable',{metadata,nativeEdition:edition});
 const result=endRiddenVehicle(row,declarations,edition);if(result)return {allowed:true,reason:'',metadata,nativeEdition:edition,result,breakdown:edition==='2014'?'Landing ends this broom’s hovering; getting off alone does not end its native hovering.':'Landing or getting off ends this broom’s hovering; no additional action is required.'};
 const source=riddenVehicleSourceStatus(row,edition);return blocked(!source.ok&&source.reason!=='attunement'?source.reason:'ending-declarations-required',{metadata,nativeEdition:edition});
}
export function currentRiddenVehicle(index,options={}){
 const row=rowAt(index),edition=nativeEdition(row),metadata=row&&riddenVehicleMetadata(row.key||row.n,edition);if(!edition)return blocked('source-profile-mismatch',{metadata});const source=riddenVehicleSourceStatus(row,edition),info={metadata,nativeEdition:edition,sourceEligible:source.ok};if(!source.ok)return blocked(source.reason,info);
 const facts={loadDeclared:options.loadDeclared,loadLb:options.loadLb,riding:options.riding};if(Object.prototype.hasOwnProperty.call(options,'spokenDirections'))facts.spokenDirections=options.spokenDirections;
 const result=evaluateRiddenVehicle(row,facts,edition);if(!result.ok)return blocked(result.reason,{...info,result});
 const speechBlocked=metadata.spokenDirections&&cannotSpeak(edition),awarenessBlocked=unaware(),allowed=result.commandAllowed&&!speechBlocked&&!awarenessBlocked,reason=awarenessBlocked?'cannot-give-directions':speechBlocked?'cannot-speak':result.commandReason;
 const movement=metadata.swimSurfaceOnly?'Walking, Fly and surface-only Swim Speeds: '+result.walkFeet+' / '+result.flyFeet+' / '+result.swimFeet+' ft.':'Vehicle Fly Speed: '+result.flyFeet+' ft.';
 const breakdown=result.canCarry?'Declared rider, equipment and cargo: '+result.loadLb+' lb. '+movement:'Declared total load exceeds '+result.maxCapacityLb+' lb; this vehicle cannot carry the declared load.';
 return {...info,result,allowed,reason,breakdown};
}
function inventorySignature(){return JSON.stringify({edition:C.rs,rows:(C.inv||[]).map(row=>row&&({n:row.n,key:row.key,q:row.q,attuned:row.attuned,attunedActive:row.attunedActive,vehicle:row.vehicle,riddenVehicleInfo:row.riddenVehicleInfo}))})}
function occurrence(index,key){return (C.inv||[]).slice(0,index).filter(row=>row&&(row.key||row.n)===key).length}
export function createRiddenVehicleSession(index,root){const item=rowAt(index);if(!item||!root||!nativeEdition(item)||!riddenVehicleMetadata(item.key||item.n,nativeEdition(item)))return null;const key=item.key||item.n,view={index,root,item,key,occurrence:occurrence(index,key),character:C,state:S,owner:C.name,cid:C.cid,id:C.id,inventorySignature:inventorySignature()};sessions.add(view);return view}
export function riddenVehicleSessionCurrent(view){return !!view&&sessions.has(view)&&view.character===C&&view.state===S&&view.owner===C.name&&view.cid===C.cid&&view.id===C.id&&sheetRootActive(view.root)&&rowAt(view.index)===view.item&&(view.item.key||view.item.n)===view.key&&occurrence(view.index,view.key)===view.occurrence&&inventorySignature()===view.inventorySignature}
export function requestRiddenDirection(request){const view=request&&request.session;if(!riddenVehicleSessionCurrent(view))return {ok:false,reason:'stale-ridden-vehicle'};const check=currentRiddenVehicle(view.index,request);if(!check.allowed)return {ok:false,reason:check.reason,check};if(!riddenVehicleSessionCurrent(view))return {ok:false,reason:'stale-ridden-vehicle'};const certificate={ok:true,result:check.result,owner:view.owner,index:view.index,character:view.character,state:view.state};if(typeof request.onDirected==='function')request.onDirected(certificate);return certificate}
