import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C};const context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};const extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
function reset(){C={cls:'Wizard',rs:'2014',level:17,attacks:[],spells:[],res:[],inv:[]}}
reset();const original=extract();
// Storage snapshots are source-scoped inventory facts, not actor spell rows.
for(const [name,profile] of [['Ring of Spell Storing','ring'],['Ioun Stone (reserve)','reserve-2024'],['Ioun Stone, Reserve','reserve-2014'],['Ioun Stone','reserve-2024']]){
 for(const entries of [null,[],[{loadId:'ssl-1',spell:'Cure Wounds',baseLevel:1,slotLevel:3,originalSource:{kind:'spellcasting',ability:'CHA',modifier:8,attack:19,saveDC:27},spellEdition:'2014',nativeDefinition:'{"fx":{"heal":["99d20"]}}'}]]){
  reset();C.inv=[{n:name,q:1,attuned:true,attunedActive:true,storedSpells:{v:1,id:'ssi-1',profile,entries}}];eq(extract(),original);
 }
 reset();C.inv=[{n:name,q:1,storedSpells:{v:99,id:'future',profile,entries:[{attack:99,saveDC:99,slotLevel:9}],opaque:{dice:'99d20'}}}];eq(extract(),original);
}
for(const level of [1,9,17,20]){reset();C.storedSpellItems={v:1,sources:[{sourceId:'ssi-1',profile:'ring',entries:[{originalSource:{modifier:level,attack:99,saveDC:99},slotLevel:level}]}]};C.storedSpellCasts={v:1,casts:[{castId:'ssc-1',spell:'Cure Wounds',originalSource:{modifier:level,attack:99,saveDC:99},slotLevel:9}]};eq(extract(),original)}
console.log(count+' stored-spell original stats/physical/future/receipt metadata cannot supply actor measurement evidence checks PASS');
