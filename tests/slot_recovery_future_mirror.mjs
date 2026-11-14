import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import * as model from '../src/data/lib/slot-recovery.js';
import {allocateAttunement} from '../src/data/lib/attunement.js';
// Reuse the existing native backend fixture without executing its regression suite.
const testURL=new URL('./slot_recovery_backend.mjs',import.meta.url),test=fs.readFileSync(testURL,'utf8'),end=test.indexOf('const f=fixture();ready(f);');assert(end>0);
const helpers=test.slice(0,end).split('\n').slice(1).join('\n').replaceAll('import.meta.url',JSON.stringify(testURL.href)),host={assert,fs,vm,model,allocateAttunement,URL,structuredClone};vm.createContext(host);vm.runInContext(helpers,host);
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},snapshot=h=>structuredClone({B:h.B,C:h.C,S:h.S}),plain=value=>JSON.parse(JSON.stringify(value)),dawn={reset:'dawn',actualResetOccurred:true,eventId:'actual-dawn'};
const invalid=[undefined,null,false,[],{v:99,opaque:['preserve']},{v:1,nextId:2,dawnEvents:[],sources:{}},{v:1,nextId:1,dawnEvents:[],sources:[],opaque:'future'}];
for(const value of invalid)for(const where of ['C','ownedB','both']){
 const h=host.fixture();assert(h.adopt().ok);const oldToken=h.capture();if(where!=='C')h.B.slotRecoverySources=structuredClone(value);if(where!=='ownedB')h.C.slotRecoverySources=structuredClone(value);
 const before=snapshot(h),undo=h.history.length,info=h.info();eq(info.available,false);eq(info.reviewRequired===true,false);eq(info.initializable===true,false);eq(info.restoreAvailable===true,false);eq(h.capture(),null);
 eq(h.adopt().ok,false);eq(h.review(true).ok,false);eq(h.activate().ok,false);eq(h.genv.__bldSlotRecoveryReset('Actor',dawn,h.undo).ok,false);eq(h.genv.__bldSlotRecoveryRemove(oldToken,h.undo).ok,false);eq(h.genv.__bldSlotRecoveryRestPlan('long'),null);
 eq(snapshot(h),before);eq(h.history.length,undo);if(where!=='C')eq(Object.hasOwn(h.B,'slotRecoverySources'),true);if(where!=='ownedB')eq(Object.hasOwn(h.C,'slotRecoverySources'),true);
}
// Missing mirrors retain the explicit migration path; they are not future claims.
{const h=host.fixture();eq(Object.hasOwn(h.B,'slotRecoverySources'),false);eq(Object.hasOwn(h.C,'slotRecoverySources'),false);eq(h.adopt().ok,true);eq(h.info().reviewRequired,true);eq(h.review().ok,true);eq(h.activate().ok,true)}
// A foreign Build is independent: its future metadata cannot block or be rewritten
// by this actor's supported source operations or personal-rest plan.
for(const value of invalid){const h=host.fixture();host.ready(h);h.setForeign();h.B.slotRecoverySources=structuredClone(value);const foreign=structuredClone(h.B),undo=h.history.length;eq(h.info().available,true);eq(h.activate().ok,true);eq(h.S.used.s1,0);eq(h.history.length,undo+1);eq(h.genv.__bldSlotRecoveryReset('Actor',dawn,h.undo).ok,true);eq(h.genv.__bldSlotRecoveryRestPlan('long').ok,true);eq(structuredClone(h.B),foreign)}
// Valid old v1 mirrors can still be explicitly synchronized to current authority.
{const h=host.fixture();host.ready(h);h.B.slotRecoverySources.sources[0].historyKnown=false;const reply=h.genv.__bldSlotRecoveryResync(h.capture(),h.undo);eq(reply.ok,true);eq(plain(h.B.slotRecoverySources),plain(h.S.slotRecoveryItems));eq(h.S.used[h.C.inv[0].slotRecovery.chargeKey],0)}
{const h=host.fixture();host.ready(h);const row=structuredClone(h.B.inv[0]),source=row.slotRecovery.id;eq(h.genv.__bldSlotRecoveryRemove(h.capture(),h.undo).ok,true);h.B.inv.push(row);h.C.inv.push({...structuredClone(row),key:row.n,attunedActive:true});eq(h.info().restoreAvailable,true);const reply=h.genv.__bldSlotRecoveryRestore(h.capture(),{physicalItemReturned:true,useHistoryUnchanged:true},h.undo);eq(reply.ok,true);eq(h.S.slotRecoveryItems.sources.find(item=>item.id===source).present,true);eq(h.S.used[row.slotRecovery.chargeKey],0)}
console.log(checks+' future mirror preservation, foreign isolation and supported migration assertions PASS');
