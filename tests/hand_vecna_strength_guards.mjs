import assert from'node:assert/strict';import fs from'node:fs';import vm from'node:vm';
import{createNativeHandStrengthConsumer}from'./fixtures/vecna-hand-strength-consumer-native.mjs';
import{createActualVecnaInitiativeDice}from'./fixtures/vecna-initiative-dice-native.mjs';
import{canonical}from'../src/data/lib/vecna-graft-profiles.js';
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
function dice(f){const d=createActualVecnaInitiativeDice(f),source=fs.readFileSync(new URL('../src/fx/16b-z-pack-dice-sound-hover-2.js',import.meta.url),'utf8');for(const name of ['defenderSpec','bracersSpec'])vm.runInContext(source.split('\n').find(line=>line.includes('FXS16A.'+name+'=function')),d.c);d.c.FXENV.__iounOrbitMathStatus=()=>f.c.nativeCharacterMathStatus(f.C,f.engine.c.S);return d}
const f=createNativeHandStrengthConsumer({strength:10}),state=f.engine.c.S;eq(f.c.D.score.STR,20);eq(f.c.nativeCharacterMathStatus(f.C,state).reviewRequired,false);let frame=f.c.captureNativeActorFrame();eq(frame(),true);
const before=canonical([f.C,state]),data=f.engine.c.DM14S||f.engine.c.DMGI,row=data.find(r=>r[0]==='Hand of Vecna'),text=row[4];row[4]+=' Changed original source';eq(f.c.nativeCharacterMathStatus(f.C,state).reviewRequired,true);eq(f.c.nativeCharacterMathStatus(f.C,state).source,'hand-vecna');eq(frame(),false);let d=dice(f);d.roll(d.spec('ah-0',f.c.D.atk[0].hit),'');eq(d.requests.length,0);eq(d.history.length,0);eq(canonical([f.C,state]),before);eq(f.c.D.score.STR,20);row[4]=text;
const service=f.engine.c.genv.__nativeHandVecnaStrengthCurrent;delete f.engine.c.genv.__nativeHandVecnaStrengthCurrent;eq(f.c.nativeCharacterMathStatus(f.C,state).reviewRequired,true);eq(f.c.captureNativeActorFrame()(),false);f.engine.c.genv.__nativeHandVecnaStrengthCurrent=service;eq(f.c.nativeCharacterMathStatus(f.C,state).reviewRequired,false);
frame=f.c.captureNativeActorFrame();f.c.invalidateNativeActorFrame(state);eq(frame(),false);eq(f.c.captureNativeActorFrame()(),true);
d=dice(f);const spec=d.spec('ah-0',f.c.D.atk[0].hit);d.roll(spec,'');eq(d.requests[0],[20]);row[4]+=' Changed while dice pending';d.release([12]);await new Promise(setImmediate);eq(d.history.length,0);row[4]=text;
d=dice(f);d.roll(d.spec('ah-0',f.c.D.atk[0].hit),'');eq(d.requests[0],[20]);d.release([12]);await new Promise(setImmediate);eq(d.history.length,1);eq(d.history[0].v,19);
console.log(n+' actual Hand live math/frame/FX source/Undo-generation protection checks PASS');
