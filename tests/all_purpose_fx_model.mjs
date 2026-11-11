import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../src/data/fx-Z15.js',import.meta.url),'utf8');
const plain=x=>JSON.parse(JSON.stringify(x));
let count=0;
const F={};
for(const potency of [1,2,3])F['+'+potency+' All-Purpose Tool']={base:['Screwdriver'],by:'an artificer',ch:[1,'1','dawn'],opaque:{keep:true},fx:{spellAtk:99,spellDc:99,spellCls:'Wizard',unrelated:7}};
const context=vm.createContext({DataEnv:{slot:{FXO:F},declare(){}}});
vm.runInContext(source,context);
for(const potency of [1,2,3]){
 const entry=F['+'+potency+' All-Purpose Tool'];
 assert.deepEqual(plain(entry),{base:['Screwdriver'],by:'an artificer',ch:[1,'1','dawn'],opaque:{keep:true},fx:{spellAtk:potency,spellDc:potency,spellCls:'Artificer',unrelated:7}});count++;
}
const first=JSON.stringify(F),entries=Object.values(F);
vm.runInContext(source,context);
assert.equal(JSON.stringify(F),first);count++;
assert.ok(Object.values(F).every((entry,index)=>entry===entries[index]));count++;
const clean=vm.createContext({DataEnv:{slot:{},declare(){}}});vm.runInContext(source,clean);
for(const potency of [1,2,3]){assert.deepEqual(plain(clean.DataEnv.slot.FXO['+'+potency+' All-Purpose Tool']),{fx:{spellAtk:potency,spellDc:potency,spellCls:'Artificer'}});count++}
console.log(count+' All-Purpose FX preservation and idempotence checks PASS');
