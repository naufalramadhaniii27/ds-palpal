import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C};const context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};const extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
function reset(){C={cls:'Wizard',rs:'2014',level:17,attacks:[],spells:[],res:[],inv:[]}}
reset();const original=extract();
const profiles=[['Pearl of Power','dmg2024'],['Spell-Refueling Ring','efa'],...[1,2,3].map(n=>['Rod of the Pact Keeper, +'+n,'dmg2024']),...[1,2,3].map(n=>['+'+n+' Rod of the Pact Keeper','dmg2014']),...['Psionic','Tranquil','Vigilant'].map(n=>[n+' Rod of the Honed Mind','au'])];
for(const [name,nativeProfile] of profiles){
 for(const marker of [{v:1,id:'recovery-1',nativeProfile,chargeKey:'recovery-item-1'},{v:2,id:'future',nativeProfile,chargeKey:'s9',opaque:{recoveredLevels:99,attack:99,dc:99,dice:'99d20'}},null]){
  reset();C.inv=[{n:name,q:1,attunedActive:true,slotRecovery:marker}];eq(extract(),original);
 }
}
for(const version of [1,2]){for(const spent of [0,1]){reset();C.slotRecovery={v:version,nextId:2,sources:[{id:'recovery-1',item:'Pearl of Power',nativeProfile:'dmg2024',historyKnown:true,state:{v:1,id:'recovery-1',nativeProfile:'dmg2024',chargeKey:'item-1'},present:true}]};C.slotRecoverySources={v:version,recoveredSlotLevel:9,used:{'item-1':spent,s9:1}};eq(extract(),original)}}
console.log(count+' direct slot-recovery marker/history/future metadata cannot supply actor measurement evidence checks PASS');
