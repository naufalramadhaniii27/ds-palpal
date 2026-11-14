import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createStudyBooks} from '../src/data/lib/study-books.js';
const root=new URL('../',import.meta.url),fixtures=JSON.parse(readFileSync(new URL('./fixtures/study-books-fx.json',import.meta.url))),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C},context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
for(const rs of ['2014','2024']){
 const reset=()=>{C={cls:'Wizard',rs,level:17,attacks:[],spells:[],res:[],inv:[]}};reset();const original=extract();
 for(const state of [...Object.values(fixtures.normal),fixtures.embedded,createStudyBooks(),{v:99,acquisitions:[{ability:'INT',delta:99,damage:'99d20',dc:99}]},null]){reset();C.studyBooks=structuredClone(state);eq(extract(),original)}
 reset();C.inv=[{n:'Tome of Clear Thought',q:1,studyBooks:fixtures.normal.thought,studyBook:{v:1,physicalId:'sbp-1'}}];eq(extract(),original);
 reset();C.studyBookSources={v:1,INT:2,CON:2,studyHours:48,windowHours:144,maximum:30};eq(extract(),original);
}
console.log(checks+' actual study-book ledger/physical/future metadata cannot supply actor measurement evidence checks PASS');
