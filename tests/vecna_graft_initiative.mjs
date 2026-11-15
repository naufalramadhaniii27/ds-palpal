import fs from 'node:fs';import assert from 'node:assert/strict';
import {readyNativeVecnaPair} from './fixtures/vecna-graft-ready-native.mjs';import {createVecnaGraftsEngine} from './fixtures/vecna-grafts-native.mjs';
import {createActualVecnaInitiativeChecks} from './fixtures/vecna-initiative-check-native.mjs';import {assertActualVecnaInitiativeRoll,createActualVecnaInitiativeDice} from './fixtures/vecna-initiative-dice-native.mjs';
import *as bindings from '../src/data/lib/vecna-graft-source.js';
const source=file=>fs.readFileSync(new URL(file,import.meta.url),'utf8'),options={bindings,consumerSource:source('../src/app/32ab-logic-perception-item-checks.js'),featureSource:source('../src/app/34b-ui-combat-effects-modes.js')};
let checks=0;
const f=createActualVecnaInitiativeChecks(readyNativeVecnaPair(),options);await assertActualVecnaInitiativeRoll(f);checks+=6;
assert.equal(f.check('sk-11')?.adv?.includes('Eye and Hand of Vecna')??false,false);checks++;
for(const mutate of [f=>{f.C.inv[0].attunedActive=false},f=>{f.engine.c.S.vecnaGrafts.events[0].facts.actualPhysicalIdentityVerified=false},f=>{f.engine.c.DMGI.find(r=>r[0]==='Eye of Vecna')[4]+=' changed'}]){const f=createActualVecnaInitiativeChecks(readyNativeVecnaPair(),options);await assertActualVecnaInitiativeRoll(f,{mutatePending:mutate});checks+=6;}
for(const provider of [undefined,()=>null]){const f=createActualVecnaInitiativeChecks(readyNativeVecnaPair(),options);if(provider===undefined)delete f.engine.c.genv.__nativeVecnaGraftSourceCurrent;else f.engine.c.genv.__nativeVecnaGraftSourceCurrent=provider;const q=f.check('init');assert.equal(q.mode,'');assert.equal(q.guard(),false);const d=createActualVecnaInitiativeDice(f),spec=d.spec('init',f.c.D.init);assert.equal(spec.sourceGuard(),false);d.roll(spec,'adv');assert.equal(d.requests.length,0);checks+=4;}
const poisoned=createActualVecnaInitiativeChecks(readyNativeVecnaPair(),options);poisoned.c.S.cond={Poisoned:true};poisoned.derive();await assertActualVecnaInitiativeRoll(poisoned,{advantage:false});checks+=6;
const legacy=createActualVecnaInitiativeChecks(createVecnaGraftsEngine({actorRuleset:'2014'}),options);assert.equal(legacy.engine.c.DM14ON,true);assert.equal(legacy.engine.c.vecnaGraftSourceForRow(legacy.engine.c.B.inv[0],0,'current-eye').ok,false);checks+=2;
// Legacy pair has no current joint certificate; use the actual ordinary Initiative path.
assert.equal(legacy.check('init'),undefined);const raw=legacy.c.D.cf.init;assert.equal(raw.some(r=>r.t==='ADV'&&r.s==='Eye and Hand of Vecna'),false);checks+=2;
const legacyDice=createActualVecnaInitiativeDice(legacy),legacySpec=legacyDice.spec('init',legacy.c.D.init),legacyHint=legacyDice.hint('init',legacySpec);assert.equal(legacyHint,null);legacyDice.roll(legacySpec,legacyHint?.mode??'');assert.deepEqual(legacyDice.requests[0],[20]);legacyDice.release([7]);await new Promise(setImmediate);assert.equal(legacyDice.history.length,1);assert.equal(legacyDice.history[0].v,7+legacy.c.D.init);checks+=4;
console.log(checks+' actual native Vecna Initiative CF/dice/stale-source and legacy-negative checks PASS');
