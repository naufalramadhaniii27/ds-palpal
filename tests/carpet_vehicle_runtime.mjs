import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as pure from '../src/data/lib/carpet-vehicle.js';
const code=fs.readFileSync(new URL('../src/app/lib/carpet-vehicle-runtime.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export (function|const) /g,'$1 '),ctx={C:{},S:{},...pure};vm.createContext(ctx);const helperSource=fs.readFileSync(new URL('../src/app/05-logic-helpers.js',import.meta.url),'utf8'),helper=helperSource.split('\n').find(line=>line.startsWith('export function sheetRootActive('));assert.ok(helper);vm.runInContext(helper.replace('export ',''),ctx);vm.runInContext(code,ctx);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const opts={loadLb:0,loadDeclared:true,distanceFeet:30,distanceDeclared:true,directionDeclared:true,spoken:true};
function reset(name='Carpet of Flying',size='3x5'){ctx.C={name:'Owner',cid:'one',speed:{fly:0},inv:[{n:name,key:name,q:1,eq:false,attuned:false,vehicle:{v:1,active:true,size}}]};ctx.S={hp:12,cond:{},exh:6,used:{x:1}}}
for(const [i,size] of pure.CARPET_SIZES.entries())for(const name of ['Carpet of Flying','Carpet of Flying, '+['3 ft. × 5 ft.','4 ft. × 6 ft.','5 ft. × 7 ft.','6 ft. × 9 ft.'][i]]){
 reset(name,size.size);const before=JSON.stringify([ctx.C,ctx.S]);for(const [load,speed] of [[0,size.flyFeet],[size.capacityLb,size.flyFeet],[size.capacityLb+0.001,size.flyFeet/2],[size.capacityLb*2,size.flyFeet/2],[size.capacityLb*2+0.001,null]]){const r=ctx.currentCarpetVehicle(0,{...opts,loadLb:load});eq(r.result.flyFeet,speed);eq(r.allowed,speed!==null)}eq(JSON.stringify([ctx.C,ctx.S]),before);
 for(const distanceFeet of [-1,30.001,Infinity,NaN])eq(ctx.currentCarpetVehicle(0,{...opts,distanceFeet}).allowed,false);
 for(const loadLb of [-1,Infinity,NaN])eq(ctx.currentCarpetVehicle(0,{...opts,loadLb}).allowed,false);
 eq(ctx.currentCarpetVehicle(0,{...opts,directionDeclared:false}).allowed,false);
 const root={isConnected:true},session=ctx.createCarpetVehicleSession(0,root);let calls=0;eq(ctx.requestCarpetDirection({...opts,session,onDirected:r=>{eq(r.character,ctx.C);eq(r.state,ctx.S);calls++}}).ok,true);eq(calls,1);root.isConnected=false;eq(ctx.requestCarpetDirection({...opts,session}).ok,false);
}
reset();ctx.C.inv[0].vehicle.size=null;ctx.C.inv[0].vehicle.active=false;eq(ctx.currentCarpetActivation(0,{commandWord:true,actionComplete:true,action:'Magic'}).allowed,true);eq(ctx.currentCarpetVehicle(0,opts).reason,'size-required');
for(const q of [0,2,0.5,Infinity]){reset();ctx.C.inv[0].q=q;eq(ctx.currentCarpetVehicle(0,opts).allowed,false);eq(ctx.currentCarpetActivation(0,{commandWord:true,actionComplete:true,action:'Magic'}).allowed,false)}
for(const condition of ['Incapacitated','Stunned']){reset();ctx.S.cond[condition]=true;eq(ctx.currentCarpetActivation(0,{commandWord:true,actionComplete:true,action:'Magic'}).allowed,false);eq(ctx.currentCarpetVehicle(0,opts).allowed,true)}
for(const condition of ['Paralyzed','Petrified','Unconscious']){reset('Carpet of Flying, 3 ft. × 5 ft.');ctx.S.cond[condition]=true;eq(ctx.currentCarpetVehicle(0,opts).allowed,false)}
for(const mutate of [()=>ctx.C={...ctx.C},()=>ctx.S={...ctx.S},()=>ctx.C.name='Other',()=>ctx.C.cid='other',()=>ctx.C.inv.reverse(),()=>ctx.C.inv[0].vehicle.active=false,()=>ctx.C.inv[0].q=0,()=>ctx.C.inv[0]={...ctx.C.inv[0]}]){reset();ctx.C.inv.push({...ctx.C.inv[0]});const session=ctx.createCarpetVehicleSession(0,{isConnected:true});mutate();eq(ctx.requestCarpetDirection({...opts,session}).ok,false)}
reset();delete ctx.C.inv[0].key;eq(ctx.currentCarpetVehicle(0,opts).allowed,true);eq(ctx.createCarpetVehicleSession(0,{isConnected:true})!==null,true);ctx.C.inv[0].vehicle={v:2,active:true,size:'3x5'};eq(ctx.currentCarpetVehicle(0,opts).allowed,false);
reset();const closedRoot={isConnected:true,closest:()=>({classList:{contains:()=>false}})},closedSession=ctx.createCarpetVehicleSession(0,closedRoot),snapshot=JSON.stringify([ctx.C,ctx.S]);let replies=0;eq(ctx.requestCarpetDirection({...opts,session:closedSession,onDirected:()=>replies++}).ok,false);eq(replies,0);eq(JSON.stringify([ctx.C,ctx.S]),snapshot);const outsideSession=ctx.createCarpetVehicleSession(0,{isConnected:true,closest:()=>null});eq(ctx.requestCarpetDirection({...opts,session:outsideSession}).ok,true);
console.log('Carpet runtime: '+checks+' checks PASS');
