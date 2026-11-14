import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createBagTricks} from '../src/data/lib/bag-tricks.js';
const root=new URL('../',import.meta.url),fixtures=JSON.parse(readFileSync(new URL('./fixtures/bag-tricks-fx.json',import.meta.url))),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C},context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
for(const rs of ['2014','2024']){
 const reset=()=>{C={cls:'Wizard',rs,level:17,attacks:[],spells:[],res:[],inv:[]}};reset();const original=extract();
 const ledgers=[...Object.values(fixtures.states).map(group=>group.active),fixtures.states['current-tan'].zero,fixtures.states['legacy-tan'].dawn,createBagTricks(),{v:99,entities:[{hp:999,attack:99,damage:'99d20',dc:99}]},null];
 for(const state of ledgers){reset();C.bagTricks=structuredClone(state);eq(extract(),original)}
 reset();C.inv=[{n:'Bag of Tricks',q:1,bagTricks:fixtures.markers['dmg2024-tan']}];eq(extract(),original);
 reset();C.bagTricksBudget={used:0,max:3,creatureHP:30,entityAttack:99};eq(extract(),original);
}
console.log(checks+' actual Bag entity/physical/future metadata cannot supply actor measurement evidence checks PASS');
