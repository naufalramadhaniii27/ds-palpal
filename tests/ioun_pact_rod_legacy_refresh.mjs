import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {createIounOrbitEngine} from './fixtures/ioun-orbit-native.mjs';
import {iounPreU54Source} from './fixtures/ioun-orbit-legacy-native.mjs';
import {legacyRodRows} from './fixtures/pact-rod-native.mjs';
import *as rodModel from '../src/data/lib/pact-rod-source.js';
import *as rodProfiles from '../src/data/lib/pact-rod-profiles.js';
import {spellChannel,spellChannelsDiffer} from '../src/data/lib/spell-source.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/export /g,''),line=(s,n)=>s.split('\n').find(v=>v.includes('function '+n+'(')).replace(/^export /,'');
const old=JSON.parse(fs.readFileSync(new URL('./fixtures/pact-rod-pre-u56-consumer.json',import.meta.url),'utf8'));assert.equal(createHash('sha256').update(old.source).digest('hex'),old.sha256);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
const shape=v=>v===null||typeof v!=='object'?[typeof v,String(v)]:[Array.isArray(v)?'array':'object',Reflect.ownKeys(v).map(k=>[typeof k,String(k),shape(v[k])])];
function fixture(item='+1 Rod of the Pact Keeper',kind='intellect',main='Wizard',secondary='Warlock'){
 const e=createIounOrbitEngine({cls:main,level:5,base:{INT:18,CHA:18},inventory:[{n:'Ioun Stone ('+kind+')',q:1,eq:true,attuned:true},{n:item,q:1,eq:true,attuned:true}]}),c=e.c;
 Object.assign(c,rodModel,rodProfiles,{spellChannel,spellChannelsDiffer});c.genv.WXI={dmg14:structuredClone(legacyRodRows)};for(const r of legacyRodRows)c.DMAP[r[0]]=structuredClone(r);c.DMGI=c.DMGI.concat(legacyRodRows.filter(r=>!c.DMGI.some(v=>v[0]===r[0])));c.B.mc=[{cls:secondary,sub:'',lv:5}];c.B.pk={};c.B.ch={};c.R14=()=>false;c.thirdSubs=()=>c.genv.THIRD_SUBS;
 c.ALLSK=e.C.skills.map(r=>r.n);
 for(const p of ['data/db2-phb-classes-a.js','data/db3-phb-classes-b.js'])vm.runInContext(read(p),c);
 const deriv=read('builder/11-logic-derivation.js'),equip=read('builder/14-logic-multiclass-hp-shop.js');for(const n of ['MCL','casterLv','TL'])vm.runInContext(line(equip,n),c);vm.runInContext(equip.slice(equip.indexOf('export function slotsAll('),equip.indexOf('/* fx engine v6: slotAdd')).replace(/export /g,''),c);for(const n of ['clsParts','isThird3','casterParts'])vm.runInContext(line(deriv,n),c);
 const adapter=read('builder/10p-logic-pact-rod.js');vm.runInContext('(function(){'+strip(adapter)+';Object.assign(globalThis,{'+[...adapter.matchAll(/export function (\w+)/g)].map(m=>m[1]).join(',')+'})})()',c);
 vm.runInContext(line(deriv,'fxList'),c);
 const choices=read('builder/09-logic-feats-and-choices.js');vm.runInContext(choices.slice(choices.indexOf('let DMX_BUSY='),choices.indexOf('export function featSpells(')).replace(/export /g,''),c);for(const n of ['gxSp','spItemB','spItemSrc'])vm.runInContext(line(choices,n),c);
 const sheet=read('builder/12k-logic-sheet-handlers-spells.js'),start=sheet.indexOf('registerSheetGroup({id:"spell-sheet"');let group;c.registerSheetGroup=g=>group=g;vm.runInContext(sheet.slice(start,sheet.indexOf('\nregisterSheet',start+1)),c);
 const baseProject=e.project;
 function project(options){const C=baseProject(options),CP=c.casterParts(),first=CP[0],a=e.ability.calculate(options),pb=c.pbOf(c.TL()),mod=c.mod(a.sc[first.ab]),sources=CP.map(p=>({k:p.cls,n:p.cls,ab:p.ab})),sp={ab:first.ab,scm:mod,sdc:8+pb+mod+c.spItemB('dc',first.cls),satk:pb+mod+c.spItemB('atk',first.cls),SA:c.slotsAll(),castAb:first.ab,mainSc:first.cls},list=sources.map(p=>({n:p.k+' spell',_ab:p.ab,_sourceKey:p.k}));group.run({i:{a,pb},l:{sp,spList:list,bysrc:sources},C,q:{spItemB:c.spItemB,spItemSrc:c.spItemSrc},patch:()=>({})});return C;}
 c.borrowedProjection=project;e.project=project;
 const original={activeFx:c.activeFx,spItemB:c.spItemB};
 try{vm.runInContext(iounPreU54Source.source.replace(/export /g,''),c);vm.runInContext(old.source.replace(/export /g,''),c);const C=project();delete C.iounOrbit;delete C.iounOrbitSources;e.setC(C);}finally{Object.assign(c,original);}
 return e;
}
for(const amount of [1,2,3])for(const kind of ['intellect','mastery','protection'])for(const [main,secondary]of [['Wizard','Warlock'],['Bard','Warlock']]){
 const e=fixture('+'+amount+' Rod of the Pact Keeper',kind,main,secondary),oldC=structuredClone(e.C),beforeB=structuredClone(e.c.B),beforeS=structuredClone(e.c.S);
 eq(Number.isFinite(oldC.spellcasting.dc),true);eq(e.info().legacyRefreshRequired,true);eq(e.info().canLegacyRefresh,true);
 const corrected=e.project(),reply=e.command('legacy-refresh',{actualNativeRebuildReviewed:true});eq(reply.ok,true);eq(e.undos,1);eq(e.C.spellcasting,corrected.spellcasting);eq(e.c.B,beforeB);eq(e.c.S,beforeS);eq(e.c.spItemB('dc',main),0);eq(e.c.spItemB('atk',main),amount);
}
for(const change of [e=>{delete e.c.genv.WXI.dmg14},e=>{e.c.DMAP['+1 Rod of the Pact Keeper'][4]='Edited'},e=>{e.c.B.custLib=[{n:'+1 Rod of the Pact Keeper'}]},e=>{e.c.fxo=()=>({'+1 Rod of the Pact Keeper':{fx:{spellDc:9}}})},e=>{e.c.B.inv[1].storedSpells=undefined},e=>{e.c.B.inv[1].slotRecovery={v:99}},e=>{e.c.S.iounOrbit={v:99}},e=>{e.c.B.name='Foreign'}]){
 const e=fixture();change(e);const before=shape([e.c.B,e.C,e.c.S]);eq(e.info().canLegacyRefresh===true,false);eq(e.command('legacy-refresh',{actualNativeRebuildReviewed:true}).ok,false);eq(e.undos,0);eq(shape([e.c.B,e.C,e.c.S]),before);
}
{const e=fixture();let threw=false;try{e.c.withIounOrbitLegacyComparison(()=>{eq(e.c.spItemB('dc','Wizard'),1);throw Error('projection failure')})}catch{threw=true}eq(threw,true);eq(e.c.iounOrbitLegacyComparisonActive(),false);eq(e.c.spItemB('dc','Wizard'),0);eq(e.c.spItemB('atk','Wizard'),1);}
console.log(checks+' actual preU56 Pact Rod + preU54 Ioun refresh checks PASS');
