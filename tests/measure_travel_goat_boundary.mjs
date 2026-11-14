import assert from'node:assert/strict';import {readyTravelGoat,nativeTravelResourceHTML} from './fixtures/travel-goat-native.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
for(const profileId of ['current-generic','current-goats','legacy-goats'])for(const kind of ['absent','undefined','drift']){
 const old='i-figurine-of-wondrous-power-ivory-goats',{e,id,key}=readyTravelGoat(profileId,24,{used:{[old]:9}});if(kind==='absent')delete e.c.S.used[key];else e.c.S.used[key]=kind==='undefined'?undefined:1;const before=e.undos,snapshot=JSON.stringify([e.c.B,e.C,e.c.S]),candidate=e.project();
 eq(Object.hasOwn(candidate,'travelGoat'),true);eq(candidate.travelGoat,e.C.travelGoat);eq(candidate.travelGoatSources,e.C.travelGoatSources);eq(candidate.res.filter(r=>Object.hasOwn(r,'travelGoat')),e.C.res.filter(r=>Object.hasOwn(r,'travelGoat')));eq((e.info().physical||[]).some(p=>p.canActivate),false);if(profileId==='legacy-goats')eq(candidate.res.some(r=>r.k===old&&r.max===24),false);if(profileId==='current-goats')eq(candidate.res.some(r=>r.k===old&&r.max===3),true);eq(e.c.S.used[old],9);
 eq(e.command('activate',{physicalId:id,facts:{actualSourceActionCompleted:true,actualClearSpaceWithin60Feet:true}}).ok,false);eq(e.undos,before);eq(JSON.stringify([e.c.B,e.C,e.c.S]),snapshot);eq(/24 Traveling charges remain|data-k=/.test(nativeTravelResourceHTML(e,key).html),false);
}
console.log(checks+' metadata/history alone cannot substitute for canonical Travel availability or resurrect an old legacy pool checks PASS');
