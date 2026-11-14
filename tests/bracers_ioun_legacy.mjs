import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {createLegacyIounEngine} from './fixtures/ioun-orbit-legacy-native.mjs';
import *as pure from '../src/data/lib/bracers.js';import *as source from '../src/data/lib/bracers-source.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/export /g,'');
const oldGroup=JSON.parse(fs.readFileSync(new URL('./fixtures/bracers-pre-u55-defense.json',import.meta.url),'utf8')).source;
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
function fixture(shield=true){
 const e=createLegacyIounEngine({base:{INT:18},inventory:[{n:'Ioun Stone (intellect)',q:1,eq:true,attuned:true},{n:'Bracers of Defense',q:1,eq:true,attuned:true},...(shield?[{n:'Shield',q:1,eq:false}]:[])]}),c=e.c,groups=[];
 Object.assign(c,pure,source,{gearDefinition:()=>null,registerSheetGroup:g=>groups.push(g),registerSheetRule:()=>{},defineLocals:()=>{}});
 vm.runInContext('(function(){'+strip(read('builder/12e-logic-sheet-handlers-defense.js'))+'})()',c);const current=groups.slice();groups.length=0;vm.runInContext(oldGroup,c);const historical=groups[0],original=e.project;
 function project(options={},old=false){const C=original(options),ctx={C,i:{B:c.B,ATT:c.attunementState(),EA:'',ESH:false,ar:null},l:{},q:{itemInUse:c.itemInUse,qOf:c.itemQuantity,baseOf:c.baseOf,dmapRow:n=>c.DMAP[n],bracersDefinitions:()=>c.DMGI},patch:()=>({})};if(old)historical.run(ctx);else for(const id of ['item-bracers','bracers-defense-source'])current.find(g=>g.id===id).run(ctx);return C}
 const old=e.C;historical.run({C:old,i:{B:c.B,ATT:c.attunementState(),EA:'',ESH:false},q:{itemInUse:c.itemInUse},patch:()=>({})});e.setC(old);c.borrowedProjection=options=>project(options);return {e,c,project};
}
const {e,c,project}=fixture();eq(e.C.ac.bonus.some(p=>p.s==='Bracers of Defense (no armor or Shield)'),true);eq(Object.hasOwn(e.C,'bracersDefense'),false);
const candidate=project();eq(candidate.ac.bonus.some(p=>p.s==='Bracers of Defense (no armor or Shield)'),false);eq(candidate.bracersDefense.v,1);
console.log('actual legacy canRefresh:',e.info().canLegacyRefresh);
eq(e.info().canLegacyRefresh,true);
const reply=e.command('legacy-refresh',{actualNativeRebuildReviewed:true});eq(reply.ok,true);eq(e.C.ac.bonus.some(p=>p.s==='Bracers of Defense (no armor or Shield)'),false);eq(e.C.bracersDefense.v,1);
{const {e}=fixture(false);eq(e.info().canLegacyRefresh,true);eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,true);eq(e.C.bracersDefense.v,1);eq(e.C.ac.bonus.some(p=>p.s==='Bracers of Defense (no armor or Shield)'),true);}
for(const mutate of [e=>{e.c.B.cid='foreign'},e=>{e.c.B.base.INT=17},e=>{e.c.B.custLib=[{n:'Bracers of Defense'}]},e=>{e.c.GX.item['Bracers of Defense']=[{n:'override',ac:99}]}]){const {e}=fixture();mutate(e);eq(e.info().canLegacyRefresh,false);}
for(const value of [undefined,null,{v:99}]){const {e}=fixture();e.C.bracersDefense=value;const before=JSON.stringify(e.C),u=e.undos;eq(e.info().canLegacyRefresh,false);eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,false);eq(e.undos,u);eq(JSON.stringify(e.C),before);}
console.log(checks+' actual old Ioun+Bracers comparison/current certified repair checks PASS');
