import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHornValhalla} from '../src/data/lib/horn-valhalla.js';
const root=new URL('../',import.meta.url),fixtures=JSON.parse(readFileSync(new URL('./fixtures/horn-valhalla-fx.json',import.meta.url))),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C},context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
for(const rs of ['2014','2024']){
 const reset=()=>{C={cls:'Wizard',rs,level:17,attacks:[],spells:[],res:[],inv:[]}};reset();const original=extract();
 const states=[...['current','legacy'].flatMap(profile=>['silver','brass','bronze','iron'].map(metal=>fixtures.states[profile+'-'+metal].active)),fixtures.legacyCharmed,createHornValhalla(),{v:99,entities:[{hp:999,damage:'99d20',immunities:['Charmed','Frightened']}],profs:{weapons:'Martial',armor:'Medium'}}];
 for(const state of states){reset();C.hornValhalla=structuredClone(state);eq(extract(),original)}
 reset();C.inv=[{n:'Horn of Valhalla',q:1,hornValhalla:fixtures.markers.generic}];eq(extract(),original);
 reset();C.hornValhallaBudget={used:0,max:1,days:7,NPCimmunities:['Charmed','Frightened'],profs:{weapons:'Martial',armor:'Medium'}};eq(extract(),original);
}
console.log(checks+' native NPC/proficiency/condition/budget metadata cannot supply actor measurement evidence checks PASS');
