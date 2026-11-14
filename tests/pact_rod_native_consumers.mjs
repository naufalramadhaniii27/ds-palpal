import assert from 'node:assert/strict';import {createPactRodEngine} from './fixtures/pact-rod-native.mjs';import {selectSpellSource} from '../src/data/lib/spell-source.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
for(const bonus of [1,2,3])for(const main of ['Wizard','Warlock','Bard']){
 const item='+'+bonus+' Rod of the Pact Keeper',secondary=main==='Warlock'?'Wizard':'Warlock',old=createPactRodEngine({item,main,secondary,legacy:true}),engine=createPactRodEngine({item,main,secondary}),saved=old.C,untouched=JSON.stringify(saved),applied=engine.C;
 for(const cls of [main,secondary]){eq(old.bonus('dc',cls),bonus);eq(engine.bonus('dc',cls),cls==='Warlock'?bonus:0);eq(engine.bonus('atk',cls),bonus);eq(selectSpellSource(applied.spellcasting,{sourceKey:cls}).dc,16+(cls==='Warlock'?bonus:0));eq(selectSpellSource(applied.spellcasting,{sourceKey:cls}).atk,8+bonus)}
 eq(saved.spellcasting.dc,16+bonus);eq(JSON.stringify(saved),untouched);eq(applied.spellcasting.dc,16+(main==='Warlock'?bonus:0));eq(applied.spellcasting.slots,saved.spellcasting.slots);eq(applied.spellcasting.pact,saved.spellcasting.pact);eq(selectSpellSource(applied.spellcasting,{sourceKey:secondary},{dc:50}).dc,50);eq(applied.spells.map(s=>s.sourceKey),[main,secondary]);if(main==='Bard'){eq(saved.spellcasting.by,undefined);eq(applied.spellcasting.by.length,2)}
}
for(const bonus of[1,2,3]){
 const item='+'+bonus+' Rod of the Pact Keeper';for(const mutate of[c=>c.B.inv[0].eq=false,c=>c.B.inv[0].q=0,c=>c.B.inv[0].attuned=false,c=>c.WXI.dmg14=[],c=>c.DMAP[item]=[...c.DMAP[item].slice(0,4),'changed',c.DMAP[item][5]],c=>c.FXO[item]={},c=>c.GX.item[item]=[],c=>c.B.inv[0].slotRecovery={v:99},c=>c.B.inv[0].tattoo=undefined,c=>c.B.custLib=[{n:item}]]){const e=createPactRodEngine({item,mutate});eq(e.bonus('dc','Wizard'),0);eq(e.bonus('dc','Warlock'),0);eq(e.bonus('atk','Wizard'),0)}
 const custom=createPactRodEngine({item,mutate:c=>c.FXO[item]={fx:{spellDc:7,spellAtk:6}}});eq(custom.bonus('dc','Wizard'),7);eq(custom.bonus('atk','Wizard'),6);
}
const modern=createPactRodEngine({item:'Rod of the Pact Keeper, +1'});eq(modern.bonus('dc','Wizard'),0);eq(modern.bonus('dc','Warlock'),1);eq(modern.bonus('atk','Wizard'),0);eq(modern.bonus('atk','Warlock'),1);
console.log(checks+' PASS');
