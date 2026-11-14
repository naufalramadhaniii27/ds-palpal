import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {initializeSlotRecovery,reviewSlotRecoveryUseHistory,reconcileSlotRecoveryInventory} from '../src/data/lib/slot-recovery.js';
import {createSlotRecoveryRestBoundary} from '../src/app/lib/slot-recovery-rest.js';
let checks=0;const eq=(actual,expected)=>{assert.deepEqual(actual,expected);checks++};
function fixture({absent=false,unknown=false}={}){
 let plan=initializeSlotRecovery([{n:'Pearl of Power',q:1},{n:'Rod of the Pact Keeper, +1',q:1}],undefined,{used:{s1:3},hp:7,tmp:2,ds:[0,0],exh:0},[{index:0,nativeProfile:'dmg2024'},{index:1,nativeProfile:'dmg2024'}]);assert(plan.ok);
 if(!unknown)for(let index=0;index<2;index++)plan=reviewSlotRecoveryUseHistory(plan.rows,index,plan.authority,plan.state,false,{actualUseHistoryVerified:true});
 if(absent){plan.authority=reconcileSlotRecoveryInventory(plan.rows,[],plan.authority).authority;plan.rows=[]}
 const C={name:'Actor',cid:'native-actor',inv:structuredClone(plan.rows)},S={...plan.state,slotRecoveryItems:structuredClone(plan.authority)},keys=plan.authority.sources.map(source=>source.state.chargeKey),host={actor:()=>({C,S,readOnly:false}),plan:()=>({ok:true,authority:structuredClone(S.slotRecoveryItems),managedKeys:keys.slice(),nativeSignature:'actual-native-profile'})};
 return {C,S,keys,host,boundary:createSlotRecoveryRestBoundary(host)};
}
const source=fs.readFileSync(new URL('../src/app/19-ui-global-click-delegation.js',import.meta.url),'utf8'),start=source.indexOf('export function doRest('),end=source.indexOf('document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-campadd]")',start);assert(start>=0&&end>start);
function nativeRest(h,kind){const trace=[],ctx={S:h.S,C:h.C,slotRecoveryRest:h.boundary,invalidateSlotRecoveryState:()=>trace.push('invalidate'),prepareDivineInterventionRest(){},finishDivineInterventionRest(){},sitReset(){},num:(value,fallback=0)=>Number.isFinite(+value)?+value:fallback,x14:()=>false,hdPlan:()=>null,D:{res:[{k:'s1',max:4,reset:'long'},...h.keys.map(k=>({k,max:1,reset:'none',slotRecovery:{v:1}}))],hpmax:20,exhMin:0},toast(){},hasFeat:()=>false,flash(){},save:()=>trace.push('save'),syncHP(){},syncLU(){},renderConds(){},renderAll(){},renderTiles(){},Object};vm.createContext(ctx);vm.runInContext(source.slice(start,end).replace('export function','function'),ctx);ctx.doRest(kind,true);return trace}
for(const absent of [false,true])for(const unknown of [false,true]){
 const h=fixture({absent,unknown}),[pearl,rod]=h.keys,before=JSON.stringify(h.C),oldPearl=h.S.used[pearl];nativeRest(h,'long');eq(h.S.used.s1,0);eq(h.S.used[pearl],oldPearl);eq(h.S.slotRecoveryItems.sources[0].historyKnown,!unknown);eq(h.S.used[rod],0);eq(h.S.slotRecoveryItems.sources[1].historyKnown,true);eq(h.S.slotRecoveryItems.sources.map(row=>row.present),[!absent,!absent]);eq(JSON.stringify(h.C),before);eq(h.S.slotRecoveryItems.dawnEvents.length,1);nativeRest(h,'long');eq(h.S.slotRecoveryItems.dawnEvents.length,2);
}
{const h=fixture(),before=JSON.stringify(h.S.used);nativeRest(h,'short');eq(JSON.stringify(h.S.used),before);eq(h.S.slotRecoveryItems.dawnEvents,[])}
for(const kind of ['short','long']){const h=fixture(),token=h.boundary.prepare(kind);h.S.used[h.keys[0]]=0;h.S.used[h.keys[1]]=0;eq(h.boundary.finish(kind,token),true);eq(h.S.used[h.keys[0]],1);eq(h.S.used[h.keys[1]],kind==='long'?0:1);eq(h.boundary.finish(kind,token),false)}
for(const mutation of ['actor','namespace','catalog','readonly','planWrite']){const h=fixture(),token=h.boundary.prepare('long'),before=JSON.stringify(h.S);if(mutation==='actor')h.C.name='Other';if(mutation==='namespace')h.S.slotRecoveryItems={v:99,opaque:'preserve'};if(mutation==='catalog')h.host.plan=()=>({ok:true,authority:structuredClone(h.S.slotRecoveryItems),managedKeys:h.keys,nativeSignature:'changed'});if(mutation==='readonly')h.host.actor=()=>({C:h.C,S:h.S,readOnly:true});if(mutation==='planWrite')h.host.plan=()=>{h.S.hp=99;return {ok:true,authority:structuredClone(h.S.slotRecoveryItems),managedKeys:h.keys,nativeSignature:'actual-native-profile'}};eq(h.boundary.finish('long',token),false);eq(h.S.used[h.keys[0]],1);eq(h.S.used[h.keys[1]],1);if(!['namespace','planWrite'].includes(mutation))eq(JSON.stringify(h.S),before)}
for(const authority of [undefined,null,{v:99,opaque:'keep'}]){const h=fixture();h.S.slotRecoveryItems=authority;eq(h.boundary.prepare('long'),null)}
for(const bad of [undefined,null,[],0]){const h=fixture();h.S.used=bad;eq(h.boundary.prepare('long'),null)}
for(const keys of [['s1'],['pact'],['rage'],[],['duplicate','duplicate']]){const h=fixture();h.host.plan=()=>({ok:true,authority:structuredClone(h.S.slotRecoveryItems),managedKeys:keys,nativeSignature:'actual-native-profile'});eq(h.boundary.prepare('long'),null)}
console.log(checks+' native rest and typed slot-recovery boundary assertions PASS');
