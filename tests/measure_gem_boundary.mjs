import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C};const context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};const extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
function reset(){C={cls:'Wizard',rs:'2014',level:17,attacks:[],spells:[],res:[],inv:[]}}
reset();const original=extract();
for(const mineral of ['Obsidian','Lapis lazuli','Quartz','Bloodstone','Amber','Jade','Topaz','Star ruby','Ruby','Diamond']){
 for(const state of [{v:1,id:'gem-1',contents:null,imbueAvailable:null,reviewRequired:true},{v:1,id:'gem-1',contents:{spell:'Cure Wounds',level:1},imbueAvailable:false,loadId:'sgl-1'},{v:2,id:'future',opaque:{modifier:99,dc:99,atk:99}}]){
  reset();C.inv=[{n:'Spell Gem ('+mineral+')',q:1,attOptional:1,attunedActive:false,spellGem:state}];C.spellGemSources={v:1,nextId:2,reservedIds:['gem-1']};eq(extract(),original);
 }
}
for(const sourceLevel of [1,9,17,20]){reset();C.castingSources={v:1,edition:'2014',classParts:[{key:'Wizard',cls:'Wizard',sub:'',level:sourceLevel,list:'Wizard',ability:'INT',expandedLists:[],spellcasting:true}],sources:[{key:'Wizard',owner:'Wizard',ability:'INT',kind:'class',grantIds:[],spells:[]}],complete:true};eq(extract(),original)}
for(const version of [1,2]){reset();C.spellGemSources={v:version,nextId:999,reservedIds:[]};C.spellGemCasts={v:version,nextCastId:99,casts:[{spell:'Cure Wounds',dc:99,atk:99,modifier:99,castSucceeded:true}]};eq(extract(),original)}
reset();C.gemCheckBonuses={v:1,version:99,sources:[{owner:'Gem check',amount:99,dc:99,dice:'99d20'}]};eq(extract(),original);
console.log(count+' Gem physical/caster/receipt metadata cannot supply actor measurement evidence checks PASS');
