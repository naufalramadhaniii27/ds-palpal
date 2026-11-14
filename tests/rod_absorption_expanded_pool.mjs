import {SP14} from '../src/builder/07-data-2014-spells.js';
import {itemQuantity} from '../src/data/lib/attunement.js';
import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {createRodAbsorptionEngine} from './fixtures/rod-absorption-native.mjs';
import {CLS14} from '../src/builder/06-data-2014-classes.js';
import {targetMatches,normalizeTarget} from '../src/data/lib/attack-target.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/export /g,''),line=(s,n)=>s.split('\n').find(v=>new RegExp('^(?:export )?function '+n+'\\(').test(v)).replace(/^export /,'');
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++;};
function fixture(selected=true){
 const e=createRodAbsorptionEngine({main:'Wizard',secondary:'Warlock',spells:['Magic Weapon'],secondarySpells:selected?['Fireball']:[]}),c=e.c;c.SP14=structuredClone(SP14);c.B.rs='2014';c.B.mc[0].sub='The Fiend (2014)';
 for(const name of ['Wizard','Warlock'])Object.assign(c.CLASSES[name],structuredClone(CLS14[name].base));
 c.DataEnv={slot:{GX:c.GX}};vm.runInContext(read('data/fx-L12.js'),c);
 Object.assign(c,{targetMatches,normalizeTarget,itemQuantity});
 const registry=read('builder/10a-logic-fx-registry.js'),exports=[...registry.matchAll(/export function (\w+)/g)].map(m=>m[1]);vm.runInContext('(function(){'+strip(registry)+';Object.assign(globalThis,{'+exports.join(',')+'});})()',c);
 vm.runInContext(line(read('builder/01-logic-core-helpers.js'),'whenSingleProblems'),c);vm.runInContext(strip(read('builder/10b-logic-fx-handlers-entry.js')),c);vm.runInContext(strip(read('builder/11b-logic-fx-sources.js')),c);
 vm.runInContext(read('builder/01-logic-core-helpers.js').split('\n').find(s=>s.includes('let PBADD=')).replace(/export /g,''),c);
 const derivation=read('builder/11-logic-derivation.js');
 vm.runInContext('(function(){let FXTO=null,TARGET_OVERRIDE=null;'+line(derivation,'fxtMap')+line(derivation,'targetMap')+';Object.assign(globalThis,{fxtMap,targetMap});})()',c);
 vm.runInContext(derivation.slice(derivation.indexOf('function gfx(noItem)'),derivation.indexOf('/*ORCH-END gfx0*/')),c);vm.runInContext(line(derivation,'fxList')+'\n'+line(derivation,'fxListBase'),c);
 e.setCurrent(e.project());return e;
}
const selected=fixture(),c=selected.c,pool=c.spRec('Fireball')[3],part=c.casterParts().find(p=>p.cls==='Warlock');eq(pool.some(v=>v.startsWith('fx:')&&v.includes('The Fiend (2014)')),true);eq(part.xl.some(v=>pool.includes(v)),true);eq(c.spLists().Warlock.includes('Fireball'),true);
const canonical=c.spellGemCatalogForRuleset('2014').find(s=>s.n==='Fireball');eq(canonical.classList.includes('Warlock'),false);eq(canonical.classList.some(s=>s.startsWith('fx:')),false);
const row=selected.C.spells.find(s=>s.n==='Fireball');eq(row?.src,'Warlock');eq(row?.use,'Prepared');eq(selected.info().castOptions.some(s=>s.name==='Fireball'&&s.sourceKey==='Warlock'),true);
const unselected=fixture(false);eq(unselected.c.spLists().Warlock.includes('Fireball'),false);eq(unselected.C.spells.some(s=>s.n==='Fireball'),false);eq(unselected.info().castOptions.some(s=>s.name==='Fireball'),false);
console.log(checks+' actual native2014 Fiend expanded-list selection / Rod eligibility checks PASS');
