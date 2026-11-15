import assert from 'node:assert/strict';
import {createInstrumentCaster} from './fixtures/instrument-cast-native.mjs';
import {installInstrumentApp17} from './fixtures/instrument-app17-native.mjs';
import {migrateItems} from '../src/data/lib/attunement.js';
import {canonicalInstrumentDefinition as canonical} from '../src/data/lib/instrument-spell-profiles.js';
const x=createInstrumentCaster(),e=x.engine;installInstrumentApp17(e);let n=0;const eq=(a,b)=>{assert.equal(canonical(a),canonical(b));n++};
// Actual native withB runs cleanCh on a clone. Exercise its real attunement
// migration branch, which the lean shared fixture's raw withB does not run.
e.c.withB=(build,run)=>{const before=e.c.B;try{const normalized=structuredClone(build);normalized.inv=migrateItems(normalized.inv,e.c.attunementMeta);e.c.B=normalized;return run()}finally{e.c.B=before}};
x.ready();const cast=x.cast('fly','INT');eq(cast.ok,true);const key=e.c.S.instrumentSpells.physical[0].spells.find(g=>g.grantId==='fly').budgetKey;eq(e.c.S.used[key],1);
const used=canonical(e.c.S.used),facts={physicalId:'isp-1',facts:{actualPhysicalRemoved:true}},removed=e.command('remove',facts);eq(removed.ok,true);eq(e.C.inv.length,0);
const restored=e.command('restore',{physicalId:'isp-1',facts:{actualSamePhysicalReturned:true,recordedMagicHistoryUnchanged:true}});assert.equal(restored.ok,true,JSON.stringify(restored));n++;eq(e.accept(restored.receipt).ok,true);eq(e.C.instrumentSpells,e.c.S.instrumentSpells);eq(e.c.B.inv[0].attuned,false);eq(e.c.B.inv[0].eq,false);eq(e.C.inv[0].attunedActive,false);eq(e.c.S.used[key],1);eq(canonical(e.c.S.used),used);eq(e.info().physical[0].spells.find(g=>g.grantId==='fly').remaining,0);eq(e.info().physical[0].spells.some(g=>g.canCast),false);
console.log(n+' actual native migrateItems/App17 paid instrument removal/restore checks PASS');
