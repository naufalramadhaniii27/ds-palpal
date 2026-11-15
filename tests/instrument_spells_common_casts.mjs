/* Actual four common grants through32ac→32b→25s for every printed profile. */
import assert from 'node:assert/strict';import{createInstrumentCaster}from'./fixtures/instrument-cast-native.mjs';import{instrumentProfiles,instrumentGenericRow}from'../src/data/lib/instrument-spell-profiles.js';
let checks=0;const ok=v=>{assert.ok(v);checks++},eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
for(const profile of instrumentProfiles()){
 const f=createInstrumentCaster({profileId:profile.id});f.ready();f.c.S.used.s1=2;f.c.S.used.pact=1;const oldKeys=Object.keys(f.c.S.used).filter(key=>!key.startsWith('i-instrument-')),old=structuredClone(f.c.S.used);
 for(const grantId of ['fly','invisibility','levitate','protection-from-evil-and-good']){const u=f.engine.undos,reply=f.cast(grantId,'INT');ok(reply.ok);ok(f.c.acceptInstrumentSpellsCommit(reply,f.root));eq(f.engine.undos,u+1);eq(reply.spell.instrumentSpellSource,profile.edition==='2014'?'phb2014':'phb2024');eq(reply.spell.cmp,'None (item)');eq(f.c.S.conc.n,reply.spell.n);eq(f.c.S.conc.l,reply.spell.castLevel);const grant=f.engine.C.instrumentSpells.physical[0].spells.find(g=>g.grantId===grantId);eq(f.c.S.used[grant.budgetKey],1);ok(!f.cast(grantId,'INT').ok);}
 for(const key of oldKeys)eq(f.c.S.used[key],old[key]);
}
for(const profile of instrumentProfiles().filter(profile=>profile.genericOriginAllowed)){
 const f=createInstrumentCaster({profileId:profile.id,inventory:[{n:instrumentGenericRow()[0],q:1,eq:true,attuned:true}]});f.ready();const p=f.engine.C.instrumentSpells.physical[0];ok(p.parentFingerprint);eq(p.profile,profile.id);eq(f.engine.c.B.inv[0].n,instrumentGenericRow()[0]);const reply=f.cast('fly','CHA');ok(reply.ok);ok(f.c.acceptInstrumentSpellsCommit(reply,f.root));ok(!f.cast('fly','CHA').ok);
}
console.log(checks+' real per-profile common-spell casts and generic physical-source checks PASS');
