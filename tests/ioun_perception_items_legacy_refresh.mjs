import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createIounOrbitEngine} from './fixtures/ioun-orbit-native.mjs';
import {iounPreU54Source} from './fixtures/ioun-orbit-legacy-native.mjs';
import {tceSpellBonusProfiles} from '../src/data/lib/tce-spell-bonus-profiles.js';
const legacyRodRows=tceSpellBonusProfiles().map(p=>p.row);
import *as rodModel from '../src/data/lib/pact-rod-source.js';
import *as rodProfiles from '../src/data/lib/pact-rod-profiles.js';
import {spellChannel,spellChannelsDiffer} from '../src/data/lib/spell-source.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/export /g,''),line=(s,n)=>s.split('\n').find(v=>v.includes('function '+n+'(')).replace(/^export /,'');
const old=JSON.parse(fs.readFileSync(new URL('./fixtures/pact-rod-pre-u56-consumer.json',import.meta.url),'utf8'));assert.equal(createHash('sha256').update(old.source).digest('hex'),old.sha256);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const shape=v=>v===null||typeof v!=='object'?[typeof v,String(v)]:[Array.isArray(v)?'array':'object',Reflect.ownKeys(v).map(k=>[typeof k,String(k),shape(v[k])])];
function fixture(item="Rod of Alertness",kind='intellect',main='Wizard',secondary='Warlock'){
 const e=createIounOrbitEngine({cls:main,level:5,base:{INT:18,CHA:18},inventory:[{n:'Ioun Stone ('+kind+')',q:1,eq:true,attuned:true},{n:item,q:1,eq:true,attuned:true}]}),c=e.c;
 Object.assign(c,rodModel,rodProfiles,{spellChannel,spellChannelsDiffer});c.genv.WXI={tce:structuredClone(legacyRodRows)};for(const r of legacyRodRows)c.DMAP[r[0]]=structuredClone(r);c.DMGI=c.DMGI.concat(legacyRodRows.filter(r=>!c.DMGI.some(v=>v[0]===r[0])));c.B.mc=[{cls:secondary,sub:'',lv:5}];c.B.pk={};c.B.ch={};c.R14=()=>false;c.thirdSubs=()=>c.genv.THIRD_SUBS;
 c.ALLSK=e.C.skills.map(r=>r.n);
 for(const p of ['data/db2-phb-classes-a.js','data/db3-phb-classes-b.js'])vm.runInContext(read(p),c);
 const deriv=read('builder/11-logic-derivation.js'),equip=read('builder/14-logic-multiclass-hp-shop.js');for(const n of ['MCL','casterLv','TL'])vm.runInContext(line(equip,n),c);vm.runInContext(equip.slice(equip.indexOf('export function slotsAll('),equip.indexOf('/* fx engine v6: slotAdd')).replace(/export /g,''),c);for(const n of ['clsParts','isThird3','casterParts'])vm.runInContext(line(deriv,n),c);
 const adapter=read('builder/10p-logic-pact-rod.js');vm.runInContext('(function(){'+strip(adapter)+';Object.assign(globalThis,{'+[...adapter.matchAll(/export function (\w+)/g)].map(m=>m[1]).join(',')+'})})()',c);
 vm.runInContext(line(deriv,'fxList'),c);
 const choices=read('builder/09-logic-feats-and-choices.js');vm.runInContext(choices.slice(choices.indexOf('let DMX_BUSY='),choices.indexOf('export function featSpells(')).replace(/export /g,''),c);for(const n of ['gxSp','spItemB','spItemSrc','tceSpellItemSource'])vm.runInContext(line(choices,n),c);vm.runInContext(choices.slice(choices.indexOf('function tceSpellClassOrigin(')),c);
 const sheet=read('builder/12k-logic-sheet-handlers-spells.js'),start=sheet.indexOf('registerSheetGroup({id:"spell-sheet"');let group;c.registerSheetGroup=g=>group=g;vm.runInContext(sheet.slice(start,sheet.indexOf('\nregisterSheet',start+1)),c);
 const flagGroups=[];c.registerSheetGroup=g=>flagGroups.push(g);vm.runInContext(strip(read('builder/12zh-logic-perception-items.js')),c);let historicalProjection=false;
 const baseProject=e.project;
 function project(options){const C=baseProject(options),CP=c.casterParts(),first=CP[0],a=e.ability.calculate(options),pb=c.pbOf(c.TL()),mod=c.mod(a.sc[first.ab]),sources=CP.map(p=>({k:p.cls,n:p.cls,ab:p.ab})),sp={ab:first.ab,scm:mod,sdc:8+pb+mod+c.spItemB('dc',first.cls),satk:pb+mod+c.spItemB('atk',first.cls),SA:c.slotsAll(),castAb:first.ab,mainSc:first.cls},list=sources.map(p=>({n:p.k+' spell',_ab:p.ab,_sourceKey:p.k}));group.run({i:{a,pb},l:{sp,spList:list,bysrc:sources},C,q:{spItemB:c.spItemB,spItemSrc:c.spItemSrc},patch:()=>({})});if(!historicalProjection)flagGroups[0].run({C,i:{ATT:c.attunementState(),AFX:c.activeFx()},patch:()=>({})});return C;}
 c.borrowedProjection=project;e.project=project;
 const original={activeFx:c.activeFx,spItemB:c.spItemB};
 try{vm.runInContext(iounPreU54Source.source.replace(/export /g,''),c);vm.runInContext(old.source.replace(/export /g,''),c);historicalProjection=true;const C=project();historicalProjection=false;delete C.iounOrbit;delete C.iounOrbitSources;e.setC(C);}finally{Object.assign(c,original);}
 return e;
}
for(const item of ['Rod of Alertness','Sentinel Shield'])for(const kind of ['intellect','mastery','protection']){const e=fixture(item,kind);eq(e.C.itemAdv.find(row=>row.s===item&&row.k==='Perception')?.ab,undefined);eq(Object.hasOwn(e.C,'perceptionItemSources'),false);eq(e.info().canLegacyRefresh,true);const corrected=e.project();eq(corrected.itemAdv.find(row=>row.s===item&&row.k==='Perception')?.ab,'WIS');eq(corrected.perceptionItemSources.v,1);eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,true);eq(e.C,corrected);}
for(const value of [undefined,null,{v:99}]){const e=fixture();e.C.perceptionItemSources=value;const before=shape([e.c.B,e.C,e.c.S]);eq(e.info().canLegacyRefresh===true,false);eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,false);eq(shape([e.c.B,e.C,e.c.S]),before);}
{const e=fixture();assert.throws(()=>e.c.withIounOrbitLegacyComparison(()=>{eq(e.project().itemAdv.find(row=>row.s==='Rod of Alertness'&&row.k==='Perception')?.ab,undefined);throw Error('probe')}));eq(e.project().itemAdv.find(row=>row.s==='Rod of Alertness'&&row.k==='Perception')?.ab,'WIS');}
for(const [item,field,value,expected]of [['Rod of Alertness','attuned',false,false],['Rod of Alertness','eq',false,false],['Sentinel Shield','eq',false,false],['Sentinel Shield','attuned',false,true]]){const e=fixture(item);e.c.B.inv[1][field]=value;const original=e.c.activeFx;try{vm.runInContext(iounPreU54Source.source.replace(/export /g,''),e.c);const old=e.project();delete old.iounOrbit;delete old.iounOrbitSources;delete old.perceptionItemSources;old.itemAdv=old.itemAdv.map(row=>row.s===item&&row.k==='Perception'?{k:row.k,s:row.s}:row);e.setC(old);}finally{e.c.activeFx=original;}eq(e.info().canLegacyRefresh,true);eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,true);eq(Object.hasOwn(e.C,'perceptionItemSources'),expected);}
console.log(checks+' actual mixed preU54 Ioun and preU61 alertness flags/full-C comparison checks PASS');
