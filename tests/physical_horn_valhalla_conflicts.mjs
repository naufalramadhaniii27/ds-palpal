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

for(const c of cases)for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=c.module.fixture();c.ready(f);f[side].inv[0].hornValhalla=structuredClone(value);const before=snapshot(f),undos=f.history.length;
 eq(c.action(f).ok,false);eq(f.history.length,undos);eq(snapshot(f),before);eq(Object.hasOwn(f[side].inv[0],'hornValhalla'),true);
 const fresh=c.module.fixture();fresh.B.inv[0].hornValhalla=structuredClone(value);const state=snapshot(fresh);eq(c.adopt(fresh).ok,false);eq(snapshot(fresh),state);eq(fresh.history.length,0);
}
const {createStudyBooksBackend}=await import('./fixtures/study-books-backend-native.mjs');
const {createBagTricksEngine}=await import('./fixtures/bag-tricks-native.mjs');
for(const kind of ['book','bag'])for(const value of [undefined,null,{v:99,opaque:'preserve'}])for(const side of ['B','C']){
 const f=kind==='book'?createStudyBooksBackend():createBagTricksEngine();
 const adopt=()=>f.command('adopt',kind==='book'?{index:0}:{index:0,nativeProfile:'dmg2024',color:'tan',actualPhysicalIdentityVerified:true});eq(adopt().ok,true);
 const id=kind==='book'?f.c.B.inv[0].studyBook.id:f.c.B.inv[0].bagTricks.id;
 eq(f.command(kind==='book'?'review-availability':'review-history',kind==='book'?{physicalId:id,actualAvailabilityVerified:true,available:true}:{physicalId:id,actualDawnHistoryVerified:true,used:0}).ok,true);
 f.c[side].inv[0].hornValhalla=structuredClone(value);const before=JSON.stringify([f.c.B,f.C,f.c.S]),undos=f.undos;
 const result=f.command(kind==='book'?'study':'draw',kind==='book'?{physicalId:id,actualStudyAndPracticeCompleted:true,completedStudyHours:48,elapsedSpanHours:72}:{physicalId:id,die:8,actualActionCompleted:true,actualLandingWithin20Feet:true});
 eq(result.ok,false);eq(f.undos,undos);eq(JSON.stringify([f.c.B,f.C,f.c.S]),before);eq(Object.hasOwn(f.c[side].inv[0],'hornValhalla'),true);
}
// Committed summoned creatures retain their own HP/dawn permissions despite a later source conflict.
const kept=createBagTricksEngine();eq(kept.command('adopt',{index:0,nativeProfile:'dmg2024',color:'tan',actualPhysicalIdentityVerified:true}).ok,true);const pid=kept.c.B.inv[0].bagTricks.id;
eq(kept.command('review-history',{physicalId:pid,actualDawnHistoryVerified:true,used:0}).ok,true);eq(kept.command('draw',{physicalId:pid,die:8,actualActionCompleted:true,actualLandingWithin20Feet:true}).ok,true);const eid=kept.info().entities[0].id;
kept.c.B.inv[0].hornValhalla={v:99};kept.C.inv[0].hornValhalla={v:99};eq(kept.command('hp',{entityId:eid,kind:'damage',amount:1}).ok,true);eq(kept.command('dawn',{actualNextDawnOccurred:true,eventId:'retained-dawn'}).ok,true);
eq(kept.c.B.inv[0].hornValhalla.v,99);eq(kept.C.inv[0].hornValhalla.v,99);
console.log(`physical Horn typed-marker conflicts: ${checks} PASS`);
