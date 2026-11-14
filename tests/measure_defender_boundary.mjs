import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),fixtures=JSON.parse(readFileSync(new URL('./fixtures/defender-fx.json',import.meta.url))),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C},context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
for(const rs of ['2014','2024']){
 const reset=()=>{C={cls:'Wizard',rs,level:17,attacks:[],spells:[],res:[],inv:[]}};reset();const original=extract();
 for(const state of [fixtures.states.unknown,fixtures.states.k0,fixtures.states.k1,fixtures.states.k2,fixtures.states.k3,fixtures.states.drop,fixtures.states.nextTurn,{v:99,physical:[{allocation:99,attackDelta:99,armorClass:99,damage:'99d20'}]}]){reset();C.defender=structuredClone(state);eq(extract(),original)}
 reset();C.inv=[{n:'Defender',q:1,defender:{v:99,source:'future',physical:'opaque'}}];eq(extract(),original);
 reset();C.defenderSource={sourceBonus:3,attackDelta:-2,damageDelta:-2,armorClass:2,held:true,firstAttack:true};eq(extract(),original);
}
console.log(checks+' physical allocation/turn/future metadata cannot supply actor AC/attack/damage measurement evidence checks PASS');
