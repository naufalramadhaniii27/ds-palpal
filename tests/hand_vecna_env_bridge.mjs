/* Actual builder00 page bridge + native09c overlay + native10w/10x legacy source checks. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createVecnaGraftsEngine} from './fixtures/vecna-grafts-native.mjs';
import {vecnaGraftProfile,canonical} from '../src/data/lib/vecna-graft-profiles.js';
const e=createVecnaGraftsEngine({actorRuleset:'2014',inventory:[{n:'Hand of Vecna',q:1,eq:true,attuned:true}]}),c=e.c,original=c.DM14,hand=vecnaGraftProfile('current-hand');
assert.equal(canonical(c.DMAP[hand.item]),hand.legacyFingerprint);
const page={};for(const key of Reflect.ownKeys(c.genv))Object.defineProperty(page,key,Object.getOwnPropertyDescriptor(c.genv,key));page.DM14=original;page.GX=c.GX;page.FXO=c.FXO;c.window=page;
const envSource=fs.readFileSync(new URL('../src/builder/00-env.js',import.meta.url),'utf8').replace(/^export /gm,'');
vm.runInContext('(function(){'+envSource+';Object.assign(globalThis,{genv,gx,fxo,sheetState})})()',c);
const proof=()=>c.vecnaHandStrengthProofSource(c.activeFx(c.attunementState())),current=()=>c.nativeHandVecnaStrengthCurrent(e.C,c.S),descriptor=Object.getOwnPropertyDescriptor(c.genv,'DM14');
let checks=1;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
eq(typeof descriptor?.get,'function');eq(typeof descriptor?.set,'function');eq(c.genv.DM14,original);eq(proof().mode,'legacy-original');eq(e.C.handVecnaStrength.mode,'legacy-original');eq(current().current,true);
const altered=structuredClone(original);altered.ov[hand.item][4]+=' changed source';page.DM14=altered;eq(c.genv.DM14,altered);eq(proof().mode,'unverified');eq(current().current,false);
c.genv.DM14=original;eq(page.DM14,original);eq(proof().mode,'legacy-original');eq(current().current,true);
console.log(`${checks} actual builder00 DM14 live bridge/native legacy Hand source checks PASS`);
