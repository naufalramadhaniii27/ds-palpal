import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRodAbsorptionEngine} from './fixtures/rod-absorption-native.mjs';
import {instrumentSpellNeedsController} from '../src/data/lib/instrument-spells-source.js';
import {supremeHealingRuleForCharacter} from '../src/app/lib/supreme-healing-runtime.js';

const read=file=>fs.readFileSync(new URL('../src/'+file,import.meta.url),'utf8');
const line=(text,name)=>text.split('\n').find(row=>new RegExp('^(?:export )?function '+name+'\\(').test(row)).replace(/^export /,'');
const item='Instrument of the Bards (Anstruth harp)';
const e=createRodAbsorptionEngine({main:'Bard',secondary:'Wizard',spells:['Cure Wounds'],inventory:[{n:item,q:1,eq:true,attuned:true}]}),c=e.c;
vm.runInContext('globalThis.dmapRow='+read('builder/12-logic-export-to-sheet.js').match(/dmapRow:(function\(n\)\{return DMAP\[n\]\})/)[1],c);
vm.runInContext(read('data/itsp-spells-from-items.js'),c);
vm.runInContext(line(read('builder/00-env.js'),'itemSpellRow'),c);
const sheet=read('builder/12k-logic-sheet-handlers-spells.js'),at=sheet.indexOf('registerSheetGroup({id:"item-spells"');
let group;c.registerSheetGroup=value=>group=value;
vm.runInContext(sheet.slice(at,sheet.indexOf('\nregisterSheet',at+1)),c);
const C=e.project();
group.run({C,i:{SM:c.SMAP,a:c.abilScores(),ATT:c.attunementState()},q:{ensureInv:c.ensureInv,dmapRow:c.dmapRow,spFxTo:c.spFxTo,itemInUse:c.itemInUse,qOf:c.qOf},patch:()=>({})});
const itemSpell=C.spells.find(row=>row.n==='Cure Wounds'&&row.itc?.it===item);
const classSpell=C.spells.find(row=>row.n==='Cure Wounds'&&!row.itc);
assert.ok(itemSpell);assert.equal(itemSpell.itc.lv,5);assert.ok(classSpell);
Object.assign(c,{C,D:{level:C.level,mod:{}},instrumentSpellNeedsController,supremeHealingRuleForCharacter});
const math=read('app/22-ui-spell-data-and-slots.js'),helpers=read('app/05-logic-helpers.js');
vm.runInContext(line(helpers,'sg')+'\n'+math.slice(math.indexOf('function dAdd('),math.indexOf('// Standalone body spells')).replace(/export /g,'')+'\n'+math.slice(math.indexOf('function spCalcStep1('),math.indexOf('/* sheets applied before v15'))+'\n'+line(math,'spDb'),c);
const tg=read('app/52-tg-bridge.js');
vm.runInContext(tg.slice(tg.indexOf('function tgSpells(){'),tg.indexOf('function tgSourceReview(){')),c);
const result=c.tgSpells(),cures=result.list.filter(row=>row.n==='Cure Wounds');
assert.equal(cures.length,1,'ordinary class Cure Wounds survives independently');
assert.equal(cures[0].l,classSpell.l);
assert.equal(cures[0].heal[1],c.spCalc(classSpell,1,C.level,C.spellcasting.mod).heal);
assert.equal(result.manual.some(row=>row.n==='Fly'),false,'original item manual spells cannot bypass payment');
assert.equal(result.list.some(row=>row.n==='Ice Storm'),false,'original item damage spells cannot bypass payment');
const originalSpells=C.spells;
for(const marker of ['instrumentSpells','instrumentSpell']){
 for(const value of [undefined,{v:99}]){
  C.spells=[{...classSpell,[marker]:value}];
  assert.equal(c.tgSpells().list.length,0,'opaque owned source marker fails closed');
 }
}
C.spells=[itemSpell];c.scOf=()=>{throw Error('excluded item must not contaminate aggregate class statistics')};
assert.equal(c.tgSpellStatsDiffer({atk:0,dc:0,mod:0}),false);
C.spells=originalSpells;
assert.equal(instrumentSpellNeedsController(C,classSpell),false);
console.log('14 actual native instrument/TG source and ordinary class checks PASS');
