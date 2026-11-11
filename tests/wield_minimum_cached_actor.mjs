import {temporaryCantripStatus} from '../src/app/lib/temporary-cantrip-guard.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {nativeWieldMinimum,evaluateWieldMinimum,explainWieldMinimum} from '../src/data/lib/wield-minimum.js';
import {weaponFormMetadata,weaponFormUsable} from '../src/data/lib/weapon-form.js';
const read=p=>fs.readFileSync(new URL('../src/app/'+p,import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
const ABK=['STR','DEX','CON','INT','WIS','CHA'];let scratch={};
const ctx={temporaryCantripStatus,C:{},S:{},ABK,ABN:Object.fromEntries(ABK.map(k=>[k,k])),env:{},nativeWieldMinimum,evaluateWieldMinimum,explainWieldMinimum,weaponFormMetadata,weaponFormUsable,bindLive(){},document:{addEventListener(){}},x14:()=>false,lateGet:key=>scratch[key],lateSet:(key,value)=>{scratch[key]=value}};
vm.createContext(ctx);for(const file of ['05-logic-helpers.js','06-logic-derivation.js','26-ui-customize.js'])vm.runInContext(read(file),ctx);
let checks=0;const eq=(got,want)=>{assert.deepEqual(got,want);checks++};const clone=x=>JSON.parse(JSON.stringify(x));
function actor(str=16){return {name:'Current actor',abilities:Object.fromEntries(ABK.map(k=>[k,{base:k==='STR'?str:10,bonus:[]}])),inv:[{n:"Forgemaster's Might",key:"Forgemaster's Might",eq:true,q:1,att:true,attuned:true,attunedActive:true,wieldInfo:{allowed:true}}],attacks:[{n:"Forgemaster's Might"},{n:'Pole Strike',of:"Forgemaster's Might"},{n:"Forgemaster's Might (thrown)"},{n:'Longsword'},{n:'Custom spell attack'}],spells:[{n:'Creation'},{n:'Fabricate'},{n:'Mending'}]}}
// The production score derivation and Customize overlay are the independent oracle.
for(const [base,bonus,custom] of [[16,[],{}],[16,[{v:1}],{}],[18,[{v:-2}],{}],['16tail',[{v:'2'}],{}],[16,[],{b:1}],[20,[],{b:-4}],[8,[{v:2}],{b:99,o:17}],[20,[],{o:'16'}],[20,[],{o:0}],[16,[],{b:'bogus',o:''}],[16,[],{b:0,o:Infinity}]]){
 ctx.C=actor(base);ctx.C.abilities.STR.bonus=bonus;ctx.S={cust:{'n:ab-STR':custom}};ctx.deriveBase();const actual=ctx.D.score;
 const untouched=JSON.stringify({C:ctx.C,S:ctx.S,B:ctx.B,D:ctx.D,scratch});const current=ctx.currentAbilityScores();
 for(const key of ABK)eq(Object.is(current[key],actual[key]),true);
 eq(JSON.stringify({C:ctx.C,S:ctx.S,B:ctx.B,D:ctx.D,scratch}),untouched);
}
// D belongs to a different actor. Cached rows must read current C + current S.
ctx.C=actor(25);ctx.S={};ctx.deriveBase();eq(ctx.D.score.STR,25);ctx.C=actor(16);ctx.S={used:{creation:1},cust:{}};
const before=JSON.stringify({C:ctx.C,S:ctx.S});for(const attack of ctx.C.attacks.slice(0,3))eq(ctx.atkOn(attack),false);eq(ctx.atkOn(ctx.C.attacks[3]),true);eq(ctx.atkOn(ctx.C.attacks[4]),true);eq(JSON.stringify({C:ctx.C,S:ctx.S}),before);
let info=ctx.weaponWieldInfo(ctx.C.inv[0]);eq(info.allowed,false);eq(info.unmet[0].actual,16);eq(info.currentScores.STR,16);assert.match(info.text,/17/);checks++;
ctx.S.cust['n:ab-STR']={b:1};for(const attack of ctx.C.attacks.slice(0,3))eq(ctx.atkOn(attack),true);ctx.S.cust['n:ab-STR']={b:100,o:16};eq(ctx.atkOn(ctx.C.attacks[0]),false);ctx.S.cust['n:ab-STR']={o:17};eq(ctx.atkOn(ctx.C.attacks[0]),true);ctx.S.cust['n:ab-STR']={o:Infinity};eq(ctx.atkOn(ctx.C.attacks[0]),false);ctx.S.cust['n:ab-STR']={o:17};
// A duplicate stale/unequipped copy cannot mask a second eligible copy.
const second=structuredClone(ctx.C.inv[0]);ctx.C.inv[0].eq=false;ctx.C.inv.push(second);eq(ctx.atkOn(ctx.C.attacks[0]),true);second.q=0;eq(ctx.atkOn(ctx.C.attacks[0]),false);second.q=1;second.attunedActive=false;eq(ctx.atkOn(ctx.C.attacks[0]),true);
// Exact reviewed base variants and new actor changes use the same current scores.
for(const key of ["Forgemaster's Might (Maul)","Forgemaster's Might (Warhammer)"]){ctx.C=actor(16);ctx.S={};ctx.C.inv[0].key=key;ctx.C.inv[0].n=key;eq(ctx.atkOn({n:key}),false);ctx.C.abilities.STR.bonus=[{v:1}];eq(ctx.atkOn({n:key}),true)}
ctx.C={inv:[],attacks:[{n:"Forgemaster's Might"},{n:'Hand-written attack'}]};ctx.S={};eq(ctx.atkOn(ctx.C.attacks[0]),true);eq(ctx.atkOn(ctx.C.attacks[1]),true);eq(ctx.weaponWieldInfo({n:'Longsword'}).rule,null);
// The backend bridge receives the real current customization map through the read hook.
const hook=fs.readFileSync(new URL('../src/app/17-logic-tab-sync-and-test-hooks.js',import.meta.url),'utf8').split('\n').find(line=>line.startsWith('env.__sheetState=function')).split('/*')[0];ctx.campName=()=>'';vm.runInContext(hook,ctx);ctx.S={cust:{'n:ab-STR':{o:17}}};eq(ctx.env.__sheetState().cust,ctx.S.cust);ctx.S={};eq(clone(ctx.env.__sheetState().cust),{});
console.log(checks+' current actor score parity / cached wield eligibility / immutable state checks passed');
