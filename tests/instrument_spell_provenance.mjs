import assert from 'node:assert/strict';
import {createInstrumentCaster} from './fixtures/instrument-cast-native.mjs';
import {instrumentSpellNeedsController} from '../src/data/lib/instrument-spells-source.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
const f=createInstrumentCaster({spells:['Fly','Charm Person']});f.ready();
const index=f.engine.C.spells.findIndex(row=>row.instrumentSpell?.grantId==='fly'),original=structuredClone(f.engine.C.spells[index]);
assert.ok(index>=0);checks++;
for(const remaining of ['both','sourceKey','sourceLabel']){
 const row=structuredClone(original);delete row.instrumentSpell;delete row.instrumentSpells;delete row.itc;
 if(remaining==='sourceKey')row.src='Bard';if(remaining==='sourceLabel')delete row.sourceKey;
 eq(instrumentSpellNeedsController(f.engine.C,row),true);f.engine.C.spells[index]=row;
 const undo=f.engine.undos,before=structuredClone(f.c.S.used);eq(f.c.spCastOpts(row),[]);eq(f.c.castDo(index,'s3',3),false);eq(f.engine.undos,undo);eq(f.c.S.used,before);
 f.engine.C.spells[index]=structuredClone(original);
}
const ordinary=f.engine.C.spells.find(row=>row.n==='Fly'&&!row.itc&&!row.instrumentSpell);assert.ok(ordinary);checks++;eq(instrumentSpellNeedsController(f.engine.C,ordinary),false);
eq(instrumentSpellNeedsController({}, {n:'Fly',sourceKey:'@instrument:future-opaque',src:'Bard'}),true);
console.log(`${checks} actual instrument erased-tag provenance checks PASS`);
