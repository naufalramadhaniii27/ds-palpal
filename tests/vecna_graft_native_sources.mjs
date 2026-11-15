import assert from 'node:assert/strict';
import {readyNativeVecnaPair} from './fixtures/vecna-graft-ready-native.mjs';
import {createVecnaGraftsEngine} from './fixtures/vecna-grafts-native.mjs';
import {vecnaGraftProfiles} from '../src/data/lib/vecna-graft-profiles.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++},e=readyNativeVecnaPair(),c=e.c;
eq(c.B.inv.every(row=>row.eq===false),true);eq(e.attunement().rows.every(row=>row.attuned===true),true);
eq(c.vecnaGraftSourcesSupported(e.C,c.S),true);eq(c.vecnaGraftInitiativeAllowed(e.C,c.S),true);
eq(c.nativeVecnaGraftSourceCurrent(e.C,c.S).current,true);
const profiles=vecnaGraftProfiles(),table=c.DM14S||c.DMGI,index=table.findIndex(row=>row[0]===profiles[0].item),original=table[index];table[index]=structuredClone(original);table[index][4]+=' Changed.';eq(c.nativeVecnaGraftSourceCurrent(e.C,c.S).current,false);table[index]=original;
c.FXO??={};const fxo=c.fxo();fxo[profiles[0].item]={};eq(c.nativeVecnaGraftSourceCurrent(e.C,c.S).current,false);delete fxo[profiles[0].item];
const priorB=c.B;c.B={...priorB,cid:'foreign',name:'Foreign draft',custLib:[{n:profiles[0].item,fx:{}}]};eq(c.nativeVecnaGraftSourceCurrent(e.C,c.S).current,true);c.B=priorB;
for(const value of [undefined,null,{v:99}]){const C=structuredClone(e.C);C.vecnaGraftSources=value;eq(c.nativeVecnaGraftSourceCurrent(C,c.S),null);eq(c.vecnaGraftInitiativeAllowed(C,c.S),false)}
const resolved=c.DMAP[profiles[0].item];c.DMAP[profiles[0].item]=profiles[0].legacyRow;eq(c.nativeVecnaGraftSourceCurrent(e.C,c.S).current,false);c.DMAP[profiles[0].item]=resolved;const originalAttuned=c.B.inv[0].attuned;c.B.inv[0].attuned=false;const unattuned=e.project();eq(c.vecnaGraftInitiativeAllowed(unattuned,c.S),false);c.B.inv[0].attuned=originalAttuned;const noState={...c.S};delete noState.vecnaGrafts;eq(c.vecnaGraftInitiativeAllowed(e.C,noState),false);
const legacy=createVecnaGraftsEngine({actorRuleset:'2014'});for(const [i,p] of profiles.entries())eq(legacy.c.vecnaGraftSourceForRow(legacy.c.B.inv[i],i,p.id).ok,false);
console.log(count+' actual native Vecna source/allocated ATT/Eqfalse/current catalogue/future/legacy checks PASS');
