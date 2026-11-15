import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createInstrumentSpellsEngine} from './fixtures/instrument-spells-native.mjs';
const f=createInstrumentSpellsEngine(),page={...f.c.genv},source=fs.readFileSync(new URL('../src/builder/00-env.js',import.meta.url),'utf8').replace(/^export /gm,''),context=vm.createContext({window:page});
vm.runInContext(source,context);const accessor=vm.runInContext('genv',context),nativeDerive=page.__deriveFor;let n=0;const eq=(actual,expected)=>{assert.equal(actual,expected);n++};
eq(typeof nativeDerive,'function');eq(typeof Object.getOwnPropertyDescriptor(accessor,'__deriveFor')?.get,'function');eq(accessor.__deriveFor,nativeDerive);
// The controller/source provider now use the actual browser accessor object.
// No __deriveFor property is assigned or injected into that object.
f.c.genv=accessor;
const invoke=(kind,body)=>accessor.__bldInstrumentSpellsCommand(accessor.__bldInstrumentSpellsCapture(f.C.name,{signature:accessor.__bldInstrumentSpellsInfo(f.C.name).signature}),kind,body,f.before,()=>true);
eq(invoke('admit',{index:0,profile:'current-canaith',facts:{actualPhysicalIdentityVerified:true,actualSpecificOriginalProfileVerified:true}}).ok,true);
const p=f.C.instrumentSpells.physical[0];eq(invoke('review',{physicalId:p.id,initialUsed:p.spells.map(g=>({grantId:g.grantId,used:0})),lastDawn:{occurrenceId:'initial',ordinal:0},facts:{actualPhysicalIdentityVerified:true,actualEverySpellHistoryVerified:true,actualLastDawnVerified:true}}).ok,true);
const info=()=>accessor.__bldInstrumentSpellsInfo(f.C.name),fly=()=>info().physical[0].spells.find(g=>g.grantId==='fly');eq(fly().canCast,true);
const request={physicalId:p.id,grantId:'fly',ability:'INT',facts:{actualPlayingCompleted:true,actualPrintedCastingTimeCompleted:true}},prepare=()=>accessor.__bldInstrumentSpellsCastPrepare(f.C.name,accessor.__bldInstrumentSpellsCapture(f.C.name,{signature:info().signature}),request);
let paid=prepare();eq(paid.ok,true);eq(Number.isFinite(paid.stats.atk),true);eq(Number.isFinite(paid.stats.dc),true);
delete page.__deriveFor;eq(accessor.__deriveFor,undefined);eq(fly().canCast,false);eq(prepare().ok,false);
page.__deriveFor=nativeDerive;eq(accessor.__deriveFor,nativeDerive);eq(fly().canCast,true);paid=prepare();eq(paid.ok,true);
console.log(n+' actual builder00 accessor/native instrument casting statistics boundary checks PASS');
