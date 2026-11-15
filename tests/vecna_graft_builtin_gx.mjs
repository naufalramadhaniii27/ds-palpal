import assert from 'node:assert/strict';
import {createVecnaGraftsEngine} from './fixtures/vecna-grafts-native.mjs';
import {readyNativeVecnaPair} from './fixtures/vecna-graft-ready-native.mjs';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++},e=createVecnaGraftsEngine();
for(const [index,profile]of ['current-eye','current-hand'].entries())eq(e.c.vecnaGraftSourceForRow(e.c.B.inv[index],index,profile).ok,true);
const pair=readyNativeVecnaPair(),c=pair.c;eq(c.vecnaGraftInitiativeAllowed(pair.C,c.S),true);eq(c.nativeVecnaGraftSourceCurrent(pair.C,c.S).current,true);
for(const name of ['Eye of Vecna','Hand of Vecna']){const original=c.GX.item[name];c.GX.item[name]=[...original,{n:'Additional unverified rule',adv:['Initiative']}];eq(c.nativeVecnaGraftSourceCurrent(pair.C,c.S).current,false);eq(c.vecnaGraftSourceForRow(c.B.inv.find(r=>r.n===name),c.B.inv.findIndex(r=>r.n===name),name==='Eye of Vecna'?'current-eye':'current-hand').ok,false);c.GX.item[name]=structuredClone(original);c.GX.item[name][0].n+=' altered';eq(c.nativeVecnaGraftSourceCurrent(pair.C,c.S).current,false);eq(c.vecnaGraftSourceForRow(c.B.inv.find(r=>r.n===name),c.B.inv.findIndex(r=>r.n===name),name==='Eye of Vecna'?'current-eye':'current-hand').ok,false);c.GX.item[name]=original;}
const gx=c.GX.item['Eye of Vecna'];delete c.GX.item['Eye of Vecna'];eq(c.nativeVecnaGraftSourceCurrent(pair.C,c.S).current,true);c.GX.item['Eye of Vecna']=undefined;eq(c.nativeVecnaGraftSourceCurrent(pair.C,c.S).current,false);c.GX.item['Eye of Vecna']=gx;c.FXO['Eye of Vecna']={};eq(c.nativeVecnaGraftSourceCurrent(pair.C,c.S).current,false);
console.log(count+' actual fx-L4 original Vecna GX admission/current/modified/extra/absence/FXO checks PASS');
