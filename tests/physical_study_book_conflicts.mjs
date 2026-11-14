import assert from 'node:assert/strict';
import fs from 'node:fs';
// Reuse only the established native backend fixture setup, never its regression matrix.
async function fixtureModule(file,marker,exports){
 const url=new URL(file,import.meta.url),source=fs.readFileSync(url,'utf8'),end=source.indexOf(marker);
 assert.ok(end>0,`Fixture boundary exists: ${file}`);
 const setup=source.slice(0,end).replace(/(from\s*['"])(\.[^'"]+)(['"])/g,(_,a,path,b)=>a+new URL(path,url).href+b).replaceAll('import.meta.url',JSON.stringify(url.href));
 return import('data:text/javascript;base64,'+Buffer.from(setup+'\nexport {'+exports+'};').toString('base64'));
}
const recovery=await fixtureModule('slot_recovery_backend.mjs','const f=fixture();','fixture,ready');
const gem=await fixtureModule('spell_gem_backend.mjs','const legacy=fixture();','fixture,review,release');
const tattoo=await fixtureModule('tattoo_backend.mjs','for(let iteration=0;','fixture,ready,apply');
const stored=await fixtureModule('stored_spell_backend.mjs','const f=fixture();','fixture,ready,load,releaseFacts');
let checks=0;function eq(a,b){assert.deepEqual(a,b);checks++}
const cases=[
 {name:'Pearl',module:recovery,ready:recovery.ready,action:f=>f.activate(),adopt:f=>f.adopt()},
 {name:'Gem',module:gem,ready:gem.review,action:f=>gem.release(f),adopt:f=>f.genv.__bldGemAdopt('Hero',f.undo)},
 {name:'Tattoo',module:tattoo,ready:tattoo.ready,action:f=>tattoo.apply(f),adopt:f=>f.genv.__bldAdoptTattoos('Actor',f.undo)},
 {name:'Stored',module:stored,ready:stored.ready,action:f=>stored.load(f,'Cure Wounds',2),adopt:f=>f.service.adopt()}
];
const snapshot=f=>JSON.stringify([f.B,f.C,f.S]);
for(const marker of ['studyBook','bagTricks'])for(const c of cases){
 const normal=c.module.fixture();c.ready(normal);eq(c.action(normal).ok,true);
 for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
  const f=c.module.fixture();c.ready(f);f[side].inv[0][marker]=structuredClone(value);
  const before=snapshot(f),undos=f.history.length;
  eq(c.action(f).ok,false);eq(f.history.length,undos);eq(snapshot(f),before);eq(Object.hasOwn(f[side].inv[0],marker),true);
 }
 const fresh=c.module.fixture();fresh.B.inv[0][marker]={v:99,opaque:'unadopted'};const before=snapshot(fresh);
 eq(c.adopt(fresh).ok,false);eq(fresh.history.length,0);eq(snapshot(fresh),before);
}
// A successful stored cast remains historical authority after the physical row conflicts.
const retained=stored.fixture();stored.ready(retained);eq(stored.load(retained,'Cure Wounds',2).ok,true);
const entry=retained.C.inv[0].storedSpells.entries[0];eq(retained.service.release(retained.capture(),entry.loadId,stored.releaseFacts).ok,true);
const ledger=JSON.stringify(retained.S.storedSpellCasts);
retained.B.inv[0].studyBook={v:99};retained.C.inv[0].studyBook={v:99};
eq(stored.load(retained,'Cure Wounds',2).ok,false);eq(JSON.stringify(retained.S.storedSpellCasts),ledger);
const {createStudyBooksBackend}=await import('./fixtures/study-books-backend-native.mjs');
for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=createStudyBooksBackend();eq(f.command('adopt',{index:0}).ok,true);eq(f.command('review-availability',{physicalId:'sbp-1',actualAvailabilityVerified:true,available:true}).ok,true);
 f.c[side].inv[0].bagTricks=structuredClone(value);const before=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;
 eq(f.command('study',{physicalId:'sbp-1',actualStudyAndPracticeCompleted:true,completedStudyHours:48,elapsedSpanHours:72}).ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),before);eq(Object.hasOwn(f.c[side].inv[0],'bagTricks'),true);
 const fresh=createStudyBooksBackend();fresh.c.B.inv[0].bagTricks=structuredClone(value);eq(fresh.command('adopt',{index:0}).ok,false);eq(fresh.undos,0);
}
console.log(`physical typed-marker conflicts: ${checks} PASS`);
