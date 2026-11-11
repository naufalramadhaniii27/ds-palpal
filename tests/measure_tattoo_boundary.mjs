import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C};const context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
function reset(){C={cls:'Cleric',rs:'2014',level:17,attacks:[],spells:[],res:[],inv:[]}}
reset();const empty=extract();
for(const item of ['Spellwrought Tattoo (Cantrip)','Spellwrought Tattoo (1st Level)','Spellwrought Tattoo (2nd Level)','Spellwrought Tattoo (3rd Level)','Spellwrought Tattoo (4th Level)','Spellwrought Tattoo (5th Level)']){
 for(const phase of ['unrecorded','needle','applied']){reset();C.inv=[{n:item,q:phase==='applied'?0:1,tattoo:{v:1,id:'tattoo-1',spell:phase==='unrecorded'?null:'Cure Wounds',phase}}];C.tattooSources={v:1,nextId:2};eq(extract(),empty)}
}
for(const version of [1,2]){reset();C.inv=[{n:'Spellwrought Tattoo (1st Level)',tattoo:{v:version,phase:'future',opaque:{mod:99,atk:99,dc:99}}}];C.tattooSources={v:version,nextId:999};eq(extract(),empty)}
for(const level of [1,16,17,20]){reset();C.discipleOfLife={rule:{v:1,key:'disciple-of-life',feature:'Disciple of Life',sourceEdition:'2014',minimumSpellLevel:1,requiresSpellSlot:false,creatureOnly:true,flat:2,levelFrom:'spell'},source:{kind:'sub',owner:'Life Domain (2014)',classKey:'Cleric',level,pre:'',edition:'2014'}};eq(extract(),empty)}
reset();C.spellwroughtTattoos={v:2,nextCastId:999,tattoos:[{phase:'active',glowing:true,mod:99,atk:99,dc:99}]};eq(extract(),empty);
console.log(count+' Tattoo inventory/passive metadata cannot supply actor measurement evidence checks PASS');
