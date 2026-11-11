/* Declared vehicle facts stay in the owned view, never in actor movement. */
import {C,S} from '../04-logic-storage.js';
import {sheetRootActive} from '../05-logic-helpers.js';
import {carpetMetadata,carpetSourceStatus,activateCarpet,evaluateCarpet} from '../../data/lib/carpet-vehicle.js';
const sessions=new WeakSet(),INCAP=['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'];
function carpetCannotSpeak(){const cond=S.cond||{};return S.hp===0||['Paralyzed','Petrified','Unconscious'].some(k=>cond[k])}
function carpetCannotAct(){return S.hp===0||INCAP.some(k=>(S.cond||{})[k])}
function carpetRow(index){return Number.isInteger(index)&&(C.inv||[])[index]}
function carpetBlocked(reason,info={}){return {allowed:false,reason,breakdown:'',result:null,...info}}
export function currentCarpetActivation(index,declarations={}){const row=carpetRow(index),source=carpetSourceStatus(row),metadata=row&&carpetMetadata(row.key||row.n);if(!source.ok)return carpetBlocked(source.reason,{metadata});if(carpetCannotAct())return carpetBlocked('cannot-take-action',{metadata});if(carpetCannotSpeak())return carpetBlocked('cannot-speak',{metadata});const result=activateCarpet(row,declarations);return result?{allowed:true,reason:'',result,metadata,breakdown:metadata.activation+' and command word; no load, size, or distance prerequisite.'}:carpetBlocked('activation-declarations-required',{metadata})}
export function currentCarpetVehicle(index,options={}){
 const row=carpetRow(index),metadata=row&&carpetMetadata(row.key||row.n),source=carpetSourceStatus(row),info={metadata,sourceEligible:source.ok};
 if(!source.ok)return carpetBlocked(source.reason,info);
 const facts={loadLb:options.loadLb,loadDeclared:options.loadDeclared,distanceFeet:options.distanceFeet,distanceDeclared:options.distanceDeclared,directionsGiven:options.directionDeclared===true,spokenDirections:options.directionDeclared===true&&options.spoken===true},result=evaluateCarpet(row,facts);
 if(!result.ok)return carpetBlocked(result.reason,{...info,result});
 const unaware=!!((S.cond||{}).Unconscious||(S.cond||{}).Petrified),speechBlocked=metadata.direction==='spokenDirections'&&carpetCannotSpeak(),allowed=result.commandAllowed&&!speechBlocked&&!unaware,reason=unaware?'cannot-give-directions':speechBlocked?'cannot-speak':result.commandReason;
 const breakdown=result.canCarry?'Declared riders and cargo: '+result.loadLb+' lb; vehicle Fly Speed '+result.flyFeet+' ft.':'Declared riders and cargo exceed '+result.maxCapacityLb+' lb; transport is unsupported.';
 return {...info,result,allowed,reason,breakdown};
}
function carpetInventorySignature(){return JSON.stringify((C.inv||[]).map(row=>row&&({n:row.n,key:row.key,q:row.q,vehicle:row.vehicle})))}
function carpetOccurrence(index,key){return (C.inv||[]).slice(0,index).filter(row=>row&&(row.key||row.n)===key).length}
export function createCarpetVehicleSession(index,root){const item=carpetRow(index);if(!item||!root||!carpetMetadata(item.key||item.n))return null;const key=item.key||item.n,view={index,root,item,key,occurrence:carpetOccurrence(index,key),character:C,state:S,owner:C.name,cid:C.cid,id:C.id,inventorySignature:carpetInventorySignature()};sessions.add(view);return view}
export function carpetVehicleSessionCurrent(view){return !!view&&sessions.has(view)&&view.character===C&&view.state===S&&view.owner===C.name&&view.cid===C.cid&&view.id===C.id&&sheetRootActive(view.root)&&carpetRow(view.index)===view.item&&(view.item.key||view.item.n)===view.key&&carpetOccurrence(view.index,view.key)===view.occurrence&&carpetInventorySignature()===view.inventorySignature}
export function requestCarpetDirection(request){const view=request&&request.session;if(!carpetVehicleSessionCurrent(view))return {ok:false,reason:'stale-carpet-vehicle'};const check=currentCarpetVehicle(view.index,request);if(!check.allowed)return {ok:false,reason:check.reason,check};if(!carpetVehicleSessionCurrent(view))return {ok:false,reason:'stale-carpet-vehicle'};const certificate={ok:true,result:check.result,owner:view.owner,index:view.index,character:view.character,state:view.state};if(typeof request.onDirected==='function')request.onDirected(certificate);return certificate}
