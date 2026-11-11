import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {selectSpellSource as staged,spellChannel} from '../src/data/lib/spell-source.js';
import {selectSpellSource as current} from './fixtures/spell-source-before-tattoo.mjs';
import {healingSpellOwned} from '../src/data/lib/tattoo-projection.js';
import {tattooFixedSourceStats,tattooFixedSourceMarker,tattooFixedSourceCapability,createTattooBodyState,recordTattooNeedle,applySpellwroughtTattoo,beginTattooCasting,completeTattooCasting} from '../src/data/lib/spellwrought-tattoo.js';
import {supremeHealingProfile,evaluateSupremeHealing} from '../src/data/lib/cleric-maths.js';
import {supremeHealingRuleForCharacter} from '../src/app/lib/supreme-healing-runtime.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const scores={INT:16,WIS:30,CHA:18},wizard=spellChannel({k:'Wizard',n:'Wizard',ab:'INT'},scores,6),artificer=spellChannel({k:'Artificer',n:'Artificer',ab:'INT'},scores,6,{atk:3,dc:3}),main={ab:'WIS',mod:10,atk:200,dc:208,by:[wizard,artificer]};
// Preserve the actual existing selector's ordinary/class/fixed-item and customization behavior.
for(const sc of [undefined,{},main,{...artificer,by:[artificer,wizard]}])for(const spell of [undefined,{}, {sourceKey:'Wizard',ab:'INT'},{sourceKey:'Artificer',ab:'INT'},{ab:'INT'},{sourceKey:'missing'},{sourceKey:null,ab:'INT'},{itc:{dc:17}},{itc:{atk:8,dc:19}},{sourceKey:'Artificer',itc:{atk:0,dc:0}}])for(const overrides of [undefined,{}, {atk:0,dc:'0'},{atk:'11',dc:19},{atk:'',dc:Infinity}])eq(staged(sc,spell,overrides),current(sc,spell,overrides));
const native={};vm.createContext(native);vm.runInContext(fs.readFileSync(new URL('../src/data/spells-spell-list.js',import.meta.url),'utf8'),native);const rows=JSON.parse(JSON.stringify(native.SPELLS)),fx=JSON.parse(JSON.stringify(native.SPELL_FX));
function definition(name){const r=rows.find(r=>r[0]===name);assert(r);return {n:r[0],l:r[1],ct:r[4],r:r[5],cmp:r[6],dur:r[7],conc:r[8],fx:fx[name]}}
const itemNames=['Spellwrought Tattoo (Cantrip)','Spellwrought Tattoo (1st Level)','Spellwrought Tattoo (2nd Level)','Spellwrought Tattoo (3rd Level)','Spellwrought Tattoo (4th Level)','Spellwrought Tattoo (5th Level)'];
function tattoo(name,item){const def=definition(name),row={n:item,q:1,tattoo:{v:1,id:'tattoo-1',spell:null,phase:'unrecorded'}},configured=recordTattooNeedle(row,def,{unusedNeedleDeclared:true}),applied=applySpellwroughtTattoo(configured.row,createTattooBodyState(),def,{needleAgainstSkin:true,commandWord:true});assert(applied.ok);const marker=tattooFixedSourceMarker(applied.body,'tattoo-1');return {def,body:applied.body,marker,spell:{...def,sourceKey:'@tattoo:tattoo-1',ab:'INT',fixedSpellSource:marker}}}
const f=tattoo('Cure Wounds',itemNames[1]);eq(staged(main,f.spell),{n:itemNames[1],mod:3,atk:5,dc:13});eq(staged(main,{...f.spell,itc:{atk:999,dc:999}}),staged(main,f.spell));eq(staged(main,f.spell,{atk:'9',dc:'18',mod:99}),{n:itemNames[1],mod:3,atk:9,dc:18});eq('ab' in staged(main,f.spell),false);eq('by' in staged(main,f.spell),false);eq('k' in staged(main,f.spell),false);
for(const marker of [undefined,null,[],{}, {...f.marker,v:2},{...f.marker,item:'Unknown'},{...f.marker,sourceId:'tattoo-0'},{...f.marker,spell:'Other'},{...f.marker,castId:'swc-0'},{...f.marker,mod:99}])for(const overrides of [undefined,{atk:99,dc:99}])eq(staged(main,{...f.spell,fixedSpellSource:marker,itc:{atk:123,dc:123}},overrides),{});
eq(staged(main,{...f.spell,n:'Other'}),{});eq(staged(main,{...f.spell,l:2}),{});
eq(tattooFixedSourceCapability(f.body,f.marker,f.spell,'ready').ok,true);eq(tattooFixedSourceCapability(f.body,f.marker,f.spell,'receipt').ok,false);
const casting=beginTattooCasting(f.body,'tattoo-1',{castingStarted:true}),complete=completeTattooCasting(casting.body,casting.castId,f.def,{spellWasCast:true,castSucceeded:true,actualEffectEnded:false}),receiptMarker=tattooFixedSourceMarker(complete.body,'tattoo-1');eq(complete.body.tattoos[0].phase,'ended');eq(tattooFixedSourceCapability(complete.body,receiptMarker,f.def,'receipt').ok,true);eq(tattooFixedSourceCapability(complete.body,receiptMarker,f.spell,'ready').ok,false);eq(tattooFixedSourceCapability(complete.body,receiptMarker,f.spell,'receipt').ok,false);eq(tattooFixedSourceCapability(complete.body,receiptMarker,{...f.spell,fixedSpellSource:receiptMarker},'receipt').ok,true);
// No mutation of actor channels, item source payload or customization objects.
const before=JSON.stringify([main,f.spell]);staged(main,f.spell,{atk:12,dc:20});eq(JSON.stringify([main,f.spell]),before);eq(tattooFixedSourceStats(f.marker,f.spell).mod,3);
// Universal D20 adjustments are applied to fixed native attack before the existing explicit override.
for(const penalty of [0,2,4,12]){const value=staged(main,f.spell,undefined,{attackAdjustment:-penalty});eq(value.atk,5-penalty);eq(value.dc,13);eq(value.mod,3);eq('ab' in value,false)}
eq(staged(main,f.spell,{atk:9,dc:18},{attackAdjustment:-4}),{n:itemNames[1],mod:3,atk:9,dc:18});
for(const adjustments of [null,[],{}, {attackAdjustment:NaN},{attackAdjustment:'-2'},{attackAdjustment:Infinity},{attackAdjustment:-2,extra:true}])eq(staged(main,f.spell,{atk:99},adjustments),{});
for(const ordinary of [{sourceKey:'Wizard'}, {itc:{dc:17,atk:9}}, {}])eq(staged(main,ordinary,{atk:11},{attackAdjustment:-4}),current(main,ordinary,{atk:11}));
console.log(count+' native fixed-source/legacy interoperability checks PASS');
