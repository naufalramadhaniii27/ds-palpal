import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as bag from '../src/data/lib/bag-tricks.js';
import * as horn from "../src/data/lib/horn-valhalla.js";
import * as timed from "../src/data/lib/timed-defenses.js";
import {createTimedDefensesEngine} from "./fixtures/timed-defenses-native.mjs";
import {summonResourceManaged} from "../src/app/lib/summon-resource.js";
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const click=read('app/19-ui-global-click-delegation.js'),pager=read('app/21-ui-tabs-pager.js');
const paths=['const uf=e.target.closest','const plb=e.target.closest','const bx=e.target.closest'];
const nativeArmorPool=createTimedDefensesEngine().C.res.find(row=>Object.hasOwn(row,"timedDefenses"));assert.equal(nativeArmorPool.k,"i-armor-of-invulnerability");assert.equal(nativeArmorPool.max,1);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
function fixture(marker,namespace,family="bagTricks"){
 const key=family==="timedDefenses"?nativeArmorPool.k:family==="bagTricks"?"i-bag-of-tricks":"i-horn-of-valhalla-silver",trace=[],C={res:[{k:key,n:family,max:family==="bagTricks"?3:1,reset:"long"},{k:"s1",n:"Slot",max:3,reset:"long"}]},S={used:{[key]:family==="bagTricks"?2:1,s1:2}};
 if(marker!==false)C.res[0][family]=marker;if(namespace!==undefined)S[family]=namespace;
 const ctx={...bag,summonResourceManaged,C,S,D:{res:C.res},bagOwn:(o,k)=>Object.prototype.hasOwnProperty.call(o,k),used:(k,max)=>Math.min(max,S.used[k]||0),num:(v,f)=>Number.isFinite(+v)?+v:f,clamp:(v,min,max)=>Math.min(max,Math.max(min,v)),toast:()=>trace.push('toast'),undoMark:()=>trace.push('undo'),save:()=>trace.push('save'),syncLU(){},refreshEntry(){},invalidateClericResourceState(){},invalidateSlotRecoveryState(){},routeDivineInterventionUse:()=>false,esc:String};
 vm.createContext(ctx);vm.runInContext(read('app/32n-logic-bag-tricks.js').split('\n').find(line=>line.startsWith('export function bagTricksResourceManaged(')).replace('export ',''),ctx);
 return {ctx,C,S,key,trace};
}
function event(key){const node={disabled:false,value:3,classList:{contains:name=>name==='pli'},getAttribute:name=>({'data-usef':key+'|1','data-k':key,'data-pd':'1','data-i':'0'})[name]};node.closest=()=>node;return {target:node}}
function run(h,kind,key=h.key){
 const line=kind<3?click.split('\n').find(line=>line.trim().startsWith(paths[kind])):pager.split('\n').find(line=>line.includes('contains("pli")'));
 const body=kind<3?line:line.slice(line.indexOf('=>{')+3,-3);
 vm.runInContext('(function(e){'+body+'})',h.ctx)(event(key));
}
let plan=bag.adoptBagTricks(bag.createBagTricks(),{profile:'current',color:'gray',key:'i-bag-of-tricks'},{key:'i-bag-of-tricks',used:2,max:3},{actualPhysicalIdentityVerified:true});assert(plan.ok);
for(const marker of [undefined,null,{v:99},{v:1},false])for(let kind=0;kind<4;kind++){
 const h=fixture(marker,marker===false?plan.state:undefined),before=JSON.stringify(h.S);
 run(h,kind);eq(JSON.stringify(h.S),before);eq(h.trace.includes('undo'),false);eq(h.trace.includes('save'),false);
}
const adoptedHorn=horn.adoptHornValhalla(horn.createHornValhalla(),{profile:'current',metal:'silver',key:'i-horn-of-valhalla-silver'},{key:'i-horn-of-valhalla-silver',used:1,max:1},{actualPhysicalIdentityVerified:true});assert(adoptedHorn.ok);
for(const marker of [undefined,null,{v:99},{v:1},false])for(let kind=0;kind<4;kind++){
 const h=fixture(marker,marker===false?adoptedHorn.state:undefined,'hornValhalla'),before=JSON.stringify(h.S);
 run(h,kind);eq(JSON.stringify(h.S),before);eq(h.trace.includes('undo'),false);eq(h.trace.includes('save'),false);
}
const adoptedArmor=timed.adoptTimedArmor(timed.createTimedDefenses(),nativeArmorPool.k,{key:nativeArmorPool.k,used:1,max:1},{actualPhysicalIdentityVerified:true});assert(adoptedArmor.ok);
for(const marker of [undefined,null,{v:99},{v:1},false])for(let kind=0;kind<4;kind++){
 const h=fixture(marker,marker===false?adoptedArmor.state:undefined,'timedDefenses'),before=JSON.stringify(h.S);
 eq(summonResourceManaged(h.C,h.S,h.key),true);run(h,kind);eq(JSON.stringify(h.S),before);eq(h.trace.includes('undo'),false);eq(h.trace.includes('save'),false);
}
for(let kind=0;kind<4;kind++){
 const h=fixture(false,adoptedArmor.state,'timedDefenses');h.C.res=[];h.ctx.D.res=[];const before=JSON.stringify(h.S);
 eq(summonResourceManaged(h.C,h.S,h.key),true);run(h,kind);eq(JSON.stringify(h.S),before);eq(h.trace.includes('undo'),false);eq(h.trace.includes('save'),false);
}
const adoptedPotion=timed.adoptResistancePotion(timed.createTimedDefenses(),{actualPhysicalIdentityVerified:true});assert(adoptedPotion.ok);
for(const namespace of [adoptedPotion.state,{v:99},undefined]){
 const h=fixture(false,namespace,'timedDefenses');h.C.res=[];eq(summonResourceManaged(h.C,h.S,'i-potion-of-resistance'),false);eq(summonResourceManaged(h.C,h.S,nativeArmorPool.k),false);
}
for(let kind=0;kind<4;kind++){
 const h=fixture({v:1});run(h,kind,'s1');eq(h.S.used.s1,kind===3?0:1);eq(h.trace.includes('save'),true);
}
{
 const h=fixture({v:99});h.ctx.kind='long';h.ctx.hp14=null;
 const start=click.indexOf('  D.res.forEach((r) =>{'),end=click.indexOf('\n  finishDivineInterventionRest',start);
 assert(start>=0&&end>start);vm.runInContext(click.slice(start,end),h.ctx);
 eq(h.S.used[h.key],2);eq(h.S.used.s1,0);
}
{
 const h=fixture({v:1}),source=read('app/08-ui-render-sheet-and-actions.js'),start=source.indexOf('export function boxes('),end=source.indexOf('export function used(',start);
 vm.runInContext(source.slice(start,end).replace('export ',''),h.ctx);
 const html=h.ctx.boxes(2,3,h.key,'Bag of Tricks',false);eq(html.includes('data-k='),false);eq(html.includes('item panel'),true);
 eq(h.ctx.boxes(2,3,'s1','Slot',false).includes('class="bx"'),true);
}
{
 const h=fixture(false,{v:99,physical:[{key:'s1'}]});eq(h.ctx.bagTricksResourceManaged('s1'),false);
}
{
 const h=fixture(undefined,undefined,'timedDefenses');h.ctx.kind='long';h.ctx.hp14=null;
 const start=click.indexOf('  D.res.forEach((r) =>{'),end=click.indexOf('\n  finishDivineInterventionRest',start);
 assert(start>=0&&end>start);vm.runInContext(click.slice(start,end),h.ctx);eq(h.S.used[h.key],1);eq(h.S.used.s1,0);
}
{
 const h=fixture({v:99},undefined,'timedDefenses'),source=read('app/08-ui-render-sheet-and-actions.js'),start=source.indexOf('export function boxes('),end=source.indexOf('export function used(',start);
 vm.runInContext(source.slice(start,end).replace('export ',''),h.ctx);const html=h.ctx.boxes(1,1,h.key,'Armor of Invulnerability',false);eq(html.includes('data-k='),false);eq(html.includes('item panel'),true);eq(h.ctx.boxes(2,3,'s1','Slot',false).includes('class="bx"'),true);
}
console.log(checks+' actual native summon counter editor/rest/render boundary assertions PASS');
