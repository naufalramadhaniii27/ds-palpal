import assert from 'node:assert/strict';
import {createNativeHandStrengthConsumer} from './fixtures/vecna-hand-strength-consumer-native.mjs';
import {createVecnaManagementEngine} from './fixtures/vecna-management-native.mjs';
import {installInstrumentApp17} from './fixtures/instrument-app17-native.mjs';
import {canonical} from '../src/data/lib/vecna-graft-profiles.js';
import {handVecnaStrengthMathStatus} from '../src/data/lib/hand-vecna-strength.js';
let n=0;const eq=(a,b)=>{assert.equal(canonical(a),canonical(b));n++};
const f=createNativeHandStrengthConsumer({equipped:true}),m=f.manager,e=m.e,app=installInstrumentApp17(e);
const detached=m.command('detach',{physicalId:'vg-1',facts:{actualPhysicalRemovalVerified:true,printedRemovalConsequenceAcknowledged:true}});eq(detached.ok,true);eq(e.C.abilities.STR.bonus,[]);
const raw=structuredClone(e.c.B.inv),beforeC=e.C,beforeState=canonical([e.C,e.c.S]),undo=m.undos;
for(const edit of [row=>delete row.vecnaGraft,row=>row.vecnaGraft={v:1,id:'vg-99'},row=>row.q=0,row=>row.n='Eye of Vecna']){e.c.B.inv=structuredClone(raw);edit(e.c.B.inv[0]);const candidate=e.project();eq(m.controller.inventoryOwner(e.C,candidate,e.c.S).ok,false);eq(app.apply(candidate),false);eq(e.C,beforeC);eq(canonical([e.C,e.c.S]),beforeState);eq(m.undos,undo);}
e.c.B.inv=structuredClone(raw);delete e.c.B.inv[0].vecnaGraft;const replay=e.project();eq(replay.abilities.STR.bonus,[]);eq(replay.handVecnaStrength.mode,'inactive');eq(handVecnaStrengthMathStatus(replay,e.c.S).reviewRequired,false);eq(app.apply(replay),false);eq(canonical([e.C,e.c.S]),beforeState);
const unowned=createVecnaManagementEngine({inventory:[{n:'Hand of Vecna',q:1,eq:true,attuned:true}]}),ordinary=installInstrumentApp17(unowned.e),original=canonical([unowned.e.C,unowned.e.c.S]);unowned.e.c.B.inv[0].vecnaGraft={v:1,id:'vg-1'};eq(ordinary.apply(unowned.e.project()),false);eq(canonical([unowned.e.C,unowned.e.c.S]),original);eq(unowned.undos,0);
console.log(n+' actual native/App17 Hand identity-erasure/invention/old-B replay checks PASS');
