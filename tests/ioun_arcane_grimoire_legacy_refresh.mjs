import{slotRecoveryAuthorityProblems}from'../src/data/lib/slot-recovery.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createIounOrbitEngine} from './fixtures/ioun-orbit-native.mjs';
import {iounPreU54Source} from './fixtures/ioun-orbit-legacy-native.mjs';
import {originalTceRows} from './fixtures/tce-spell-bonus-native.mjs';
const legacyRodRows=originalTceRows;
import *as rodModel from '../src/data/lib/pact-rod-source.js';
import *as rodProfiles from '../src/data/lib/pact-rod-profiles.js';
import {spellChannel,spellChannelsDiffer} from '../src/data/lib/spell-source.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/export /g,''),line=(s,n)=>s.split('\n').find(v=>v.includes('function '+n+'(')).replace(/^export /,'');
const old=JSON.parse(fs.readFileSync(new URL('./fixtures/pact-rod-pre-u56-consumer.json',import.meta.url),'utf8'));assert.equal(createHash('sha256').update(old.source).digest('hex'),old.sha256);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const shape=v=>v===null||typeof v!=='object'?[typeof v,String(v)]:[Array.isArray(v)?'array':'object',Reflect.ownKeys(v).map(k=>[typeof k,String(k),shape(v[k])])];
function fixture(item="+1 Arcane Grimoire",kind='intellect',main='Wizard',secondary='Warlock'){
 const e=createIounOrbitEngine({cls:main,level:5,base:{INT:18,CHA:18},inventory:[{n:'Ioun Stone ('+kind+')',q:1,eq:true,attuned:true},{n:item,q:1,eq:true,attuned:true}]}),c=e.c;
 Object.assign(c,rodModel,rodProfiles,{spellChannel,spellChannelsDiffer});c.genv.WXI={tce:structuredClone(legacyRodRows)};for(const r of legacyRodRows)c.DMAP[r[0]]=structuredClone(r);c.DMGI=c.DMGI.concat(legacyRodRows.filter(r=>!c.DMGI.some(v=>v[0]===r[0])));c.B.mc=[{cls:secondary,sub:'',lv:5}];c.B.pk={};c.B.ch={};c.R14=()=>false;c.thirdSubs=()=>c.genv.THIRD_SUBS;
 c.ALLSK=e.C.skills.map(r=>r.n);
 for(const p of ['data/db2-phb-classes-a.js','data/db3-phb-classes-b.js'])vm.runInContext(read(p),c);
 const deriv=read('builder/11-logic-derivation.js'),equip=read('builder/14-logic-multiclass-hp-shop.js');for(const n of ['MCL','casterLv','TL'])vm.runInContext(line(equip,n),c);vm.runInContext(equip.slice(equip.indexOf('export function slotsAll('),equip.indexOf('/* fx engine v6: slotAdd')).replace(/export /g,''),c);for(const n of ['clsParts','isThird3','casterParts'])vm.runInContext(line(deriv,n),c);
 const adapter=read('builder/10p-logic-pact-rod.js');vm.runInContext('(function(){'+strip(adapter)+';Object.assign(globalThis,{'+[...adapter.matchAll(/export function (\w+)/g)].map(m=>m[1]).join(',')+'})})()',c);
 vm.runInContext(line(deriv,'fxList'),c);
 const choices=read('builder/09-logic-feats-and-choices.js');vm.runInContext(choices.slice(choices.indexOf('let DMX_BUSY='),choices.indexOf('export function featSpells(')).replace(/export /g,''),c);for(const n of ['gxSp','spItemB','spItemSrc','tceSpellItemSource'])vm.runInContext(line(choices,n),c);vm.runInContext(choices.slice(choices.indexOf('function tceSpellClassOrigin(')),c);
 const sheet=read('builder/12k-logic-sheet-handlers-spells.js'),start=sheet.indexOf('registerSheetGroup({id:"spell-sheet"');let group;c.registerSheetGroup=g=>group=g;vm.runInContext(sheet.slice(start,sheet.indexOf('\nregisterSheet',start+1)),c);
 vm.runInContext(line(read('builder/00-env.js'),'classDef'),c);c.slotRecoveryAuthorityProblems=slotRecoveryAuthorityProblems;vm.runInContext(line(read('builder/03-logic-magic-item-effects.js'),'slotRecoveryAllocatedKeys'),c);for(const n of ['slugK','resKey'])vm.runInContext(line(deriv,n),c);
 const spellSheet=group,resourceGroups=[];c.registerSheetGroup=g=>resourceGroups.push(g);c.defineLocals=()=>{};
 vm.runInContext(deriv.slice(deriv.indexOf('export function resMax('),deriv.indexOf('/* M10:')).replace(/export /g,''),c);vm.runInContext(line(equip,'mcResMax'),c);
 const resource=read('builder/12i-logic-sheet-handlers-gear-resources.js');for(const id of ['res-init','res-class','res-multiclass','res-spell-slots']){const a=resource.indexOf('registerSheetGroup({id:"'+id+'"'),b=resource.indexOf('\nregisterSheet',a+1);let text=resource.slice(a,b<0?undefined:b);if(id==='res-class')text=text.slice(0,text.indexOf('/* M17:'));vm.runInContext(text,c)}
 vm.runInContext(strip(read('builder/12zg-logic-arcane-grimoire-recovery.js')),c);
 function recovery(C){const ctx={C,i:{B:c.B,c:c.classDef(c.B.cls),L:c.B.level,a:c.abilScores(),mcl:c.B.mc,parts:c.clsParts(),ATT:c.attunementState()},l:{},q:{resMax:c.resMax,mcResMax:c.mcResMax,resKey:c.resKey,slugK:c.slugK,slotsAll:c.slotsAll},patch:()=>({})};for(const id of ['res-init','res-class','res-multiclass','res-spell-slots','arcane-grimoire-resource-binding','arcane-grimoire-recovery-source'])resourceGroups.find(g=>g.id===id).run(ctx);}
 const baseProject=e.project;
 function project(options){const C=baseProject(options),CP=c.casterParts(),first=CP[0],a=e.ability.calculate(options),pb=c.pbOf(c.TL()),mod=c.mod(a.sc[first.ab]),sources=CP.map(p=>({k:p.cls,n:p.cls,ab:p.ab})),sp={ab:first.ab,scm:mod,sdc:8+pb+mod+c.spItemB('dc',first.cls),satk:pb+mod+c.spItemB('atk',first.cls),SA:c.slotsAll(),castAb:first.ab,mainSc:first.cls},list=sources.map(p=>({n:p.k+' spell',_ab:p.ab,_sourceKey:p.k}));spellSheet.run({i:{a,pb},l:{sp,spList:list,bysrc:sources},C,q:{spItemB:c.spItemB,spItemSrc:c.spItemSrc},patch:()=>({})});recovery(C);return C;}
 c.borrowedProjection=project;e.project=project;
 const original={activeFx:c.activeFx,spItemB:c.spItemB};
 try{vm.runInContext(iounPreU54Source.source.replace(/export /g,''),c);vm.runInContext(old.source.replace(/export /g,''),c);const C=project();delete C.iounOrbit;delete C.iounOrbitSources;delete C.arcaneGrimoireRecovery;e.setC(C);}finally{Object.assign(c,original);}
 return e;
}
for(const attuned of [false,true])for(const magnitude of [1,2,3]){const e=fixture('+'+magnitude+' Arcane Grimoire');if(!attuned){e.c.B.inv[1].attuned=false;const original=e.c.activeFx;try{vm.runInContext(iounPreU54Source.source.replace(/export /g,''),e.c);const old=e.project();delete old.iounOrbit;delete old.iounOrbitSources;delete old.arcaneGrimoireRecovery;e.setC(old);}finally{e.c.activeFx=original;}}
 eq(e.info().canLegacyRefresh,true);const expected=e.project();eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,true);eq(e.C,expected);eq(Object.hasOwn(e.C,'arcaneGrimoireRecovery'),attuned);if(attuned)eq(e.C.arcaneGrimoireRecovery.bonus,1);}
for(const value of [undefined,null,{v:99}]){const e=fixture();e.C.arcaneGrimoireRecovery=value;eq(e.info().canLegacyRefresh===true,false);const before=shape([e.c.B,e.C,e.c.S]);eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,false);eq(shape([e.c.B,e.C,e.c.S]),before);}
console.log(checks+' actual mixed preU54 Ioun and preU60 Grimoire native full-C comparison checks PASS');
