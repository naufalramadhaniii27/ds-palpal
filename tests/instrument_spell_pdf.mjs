import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {instrumentSpellNeedsController} from '../src/data/lib/instrument-spells-source.js';
let count=0;const check=(a,b)=>{assert.deepEqual(a,b);count++};
const modelSource=fs.readFileSync(new URL('../src/app/37a-ui-pdf-model.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/\bexport /g,'');
let statReads=0,fillReads=0;
const C={cls:'Wizard',spellcasting:{ab:'INT',dc:99,atk:91},spells:[]};
const context=vm.createContext({C,S:{used:{}},D:{res:[]},env:{},instrumentSpellNeedsController,structuredClone,console,
 fill:text=>{fillReads++;return String(text).replace(/\{dc\}/g,'99').replace(/\{unarmed\}/g,'9d99')},
 scOf:spell=>{statReads++;if(spell&&instrumentSpellNeedsController(C,spell))throw Error('protected row asked for cached class stats');return {ab:'INT',dc:99,atk:91}},
 num:(value,fallback=0)=>Number.isFinite(Number(value))?Number(value):fallback,sg:n=>n>=0?'+'+n:String(n),ordL:n=>'Level '+n,cuNm:(_,name)=>name});
vm.runInContext(modelSource+'\nglobalThis.actual={pxSpellDetails,pxSpellText,pxSpell,pxSpells};',context);
const instrument={n:'Cure Wounds',l:1,sv:'DEX',ct:'Action',r:'Touch',cmp:'None (item)',dur:'Instantaneous',src:'Instrument of the Bards (Anstruth harp)',itc:{it:'Instrument of the Bards (Anstruth harp)',lv:5},instrumentSpell:{v:1,id:'isp-1'},instrumentCastLevel:5,sum:'Restore {unarmed}; DC {dc}.',full:'Restore {unarmed}; DC {dc}.',use:'Item'};
const protectedDetails=context.actual.pxSpellDetails(instrument,'2024');check(statReads,0);check(JSON.stringify(protectedDetails).includes('99'),false);check(protectedDetails.some(([k,v])=>k==='Item cast level'&&v==='5'),true);check(protectedDetails.some(([k,v])=>k==='Instrument casting'&&v.includes('choose a spellcasting ability')),true);
const text=context.actual.pxSpellText(instrument);check(fillReads,0);check(JSON.stringify(text).includes('9d99'),false);check(JSON.stringify(text).includes('chosen spell save DC'),true);
C.spells=[instrument];const only=context.actual.pxSpells('2024');check(statReads,0);check(only.ability,'');check(only.dc,'');check(only.attack,'');check(only.className,'Instrument spells');check(typeof only.instrumentGuidance,'string');
const ordinary={...instrument,src:'Wizard',itc:undefined};delete ordinary.instrumentSpell;delete ordinary.instrumentCastLevel;delete ordinary.itc;
const ordinaryDetails=context.actual.pxSpellDetails(ordinary,'2024');check(ordinaryDetails.some(([,v])=>String(v).includes('DC 99')),true);check(statReads,1);
C.spells=[ordinary,instrument];const mixed=context.actual.pxSpells('2024');check(mixed.dc,'99');check(mixed.attack,'+91');check(mixed.ability,'INT');check(mixed.levels[0].spells.length,2);
const spellPartSource=fs.readFileSync(new URL('../src/pdf/10-ui-appendix.js',import.meta.url),'utf8').replace(/^import .*;\n/gm,'').replace(/\bexport /g,'');const pdf=vm.createContext({PX_BLOCKS:{},PX_INK:0,PX_GRAY:0});vm.runInContext(spellPartSource+'\nglobalThis.spellPart=PX_PARTS.find(part=>part.id===\'spells\');',pdf);
check(pdf.spellPart.strip({spellcasting:only}),only.instrumentGuidance);check(pdf.spellPart.strip({spellcasting:mixed}).includes('Instrument casts choose their own ability.'),true);check(pdf.spellPart.strip({spellcasting:{ability:'INT',dc:'17',attack:'+9'}}),'Spellcasting INT   •   Spell Save DC 17   •   Spell Attack +9');
const printable=fs.readFileSync(new URL('../src/app/36-ui-printable-sheet.js',import.meta.url),'utf8');check(/scOf|C\.spells|C\.spellcasting/.test(printable),false);
console.log(`${count} actual PDF/print instrument stat-boundary checks PASS`);
