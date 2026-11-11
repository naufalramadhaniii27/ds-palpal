import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../src/builder/12k-logic-sheet-handlers-spells.js',import.meta.url),'utf8').replace(/^import .*$/gm,'');
const handlers=new Map();
const spells={Dawnbringer:{sp:[['Lesser Restoration',1]]},Duskcrusher:{sp:[['Sunbeam',1]]},'Other Wand':{sp:[['Lesser Restoration',1]]}};
const env={registerSheetGroup:x=>handlers.set(x.id,x),registerSheetRule:x=>handlers.set(x.id,x),defineLocals(){},itemSpellRow:n=>spells[n],spellFullText:()=>'',mod:()=>0};
vm.createContext(env);vm.runInContext(source,env);
for(const edition of ['2014','2024']){
 const SM={'Lesser Restoration':['Lesser Restoration',2,'Abjuration',['Wizard'],edition==='2024'?'Bonus Action':'Action','Touch','V,S','Instantaneous',false,false,'','Restore'],Sunbeam:['Sunbeam',6,'Evocation',['Wizard'],'Action','60 ft','V,S','1 minute',true,false,'CON','Beam']};
 const original=structuredClone(SM),C={spells:[]};
 const q={ensureInv:()=>Object.keys(spells).map(n=>({n,q:1,eq:true})),dmapRow:()=>['','','',1],qOf:x=>x.q,itemInUse:()=>true,spFxTo(){},spellAb:()=> 'INT',spClsJ:()=> 'Wizard'};
 const ctx={i:{SM,a:{sc:{INT:18}},ATT:{rows:[{attuned:true},{attuned:true},{attuned:true}]}},q,C,l:{spSeen:{},bysrc:[],spList:[],sp:{ab:'INT'}},patch:()=>({})};
 handlers.get('item-spells').run(ctx);
 assert.equal(C.spells.find(s=>s.itc.it==='Dawnbringer').ct,'Action');assert.equal(C.spells.find(s=>s.itc.it==='Duskcrusher').ct,'Action');assert.equal(C.spells.find(s=>s.itc.it==='Other Wand').ct,SM['Lesser Restoration'][4]);
 env.adder(ctx)('Lesser Restoration','Prepared','Wizard','Wizard');assert.equal(ctx.l.spList[0].ct,SM['Lesser Restoration'][4]);assert.deepEqual(SM,original);
 assert.equal(C.spells.find(s=>s.itc.it==='Dawnbringer').itc.c,1);assert.equal(C.spells.find(s=>s.itc.it==='Dawnbringer').itc.lv,2);
}
assert.equal(env.itemSpellCastingTime('Dawnbringer','Other Spell','Bonus Action'),'Bonus Action');
console.log('item spell timing: Dawnbringer Action both editions; generic Wizard/other item spell timing unchanged');
