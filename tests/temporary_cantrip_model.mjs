import assert from 'node:assert/strict';
import {createTemporaryCantripState as create,temporaryCantripStateProblems as problems,advanceTemporaryCantripTime as advance,activateTemporaryCantrip as activate,activeTemporaryCantrips as active,TEMPORARY_CANTRIP_SECONDS} from '../src/data/lib/temporary-cantrip.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const choice={sourceId:'physical-source-1',item:'+1 All-Purpose Tool',spell:'Eldritch Blast'};
const context={sourceEligible:true,chargeAvailable:true,actionComplete:true,focusOnTool:true,cantripOnClassList:true,definitelyKnown:false,notAlreadyKnown:true};
const empty=create();eq(problems(empty),[]);eq(TEMPORARY_CANTRIP_SECONDS,28800);eq(active(empty),[]);
const result=activate(empty,choice,context),first=result.state;eq(result.ok,true);eq(result.chargeSpend,1);eq(result.grant.id,'tc-1');eq(result.grant.expiresAt,28800);eq(first.nextGrantId,2);eq(empty.grants,[]);eq(first.elapsedSeconds,0);eq(problems(first),[]);
eq(active(first)[0].classKey,'Artificer');eq(active(first)[0].ability,'INT');eq(active(first)[0].spell,'Eldritch Blast');
for(const [seconds,length] of [[0,1],[28799,1],[28800,0],[28801,0]]){const next=advance(first,seconds);eq(next.ok,true);eq(active(next.state).length,length);eq(next.state.grants.length,1);eq(next.state.nextGrantId,2)}
const afterHour=advance(first,3600).state;const second=activate(afterHour,{...choice,spell:'Mending'},context).state;eq(second.grants.length,2);eq(second.grants[0],first.grants[0]);eq(second.grants[1].id,'tc-2');eq(second.grants[1].expiresAt,32400);eq(active(second).length,2);
const firstExpired=advance(second,25200).state;eq(active(firstExpired).map(g=>g.spell),['Mending']);eq(firstExpired.grants.length,2);eq(active(advance(firstExpired,3600).state),[]);
const sameSpell=activate(afterHour,choice,context).state;eq(active(sameSpell).length,2);eq(active(sameSpell).map(g=>g.id),['tc-1','tc-2']);
const twoSources=activate(first,{...choice,sourceId:'physical-source-2',item:'+3 All-Purpose Tool'},context).state;eq(active(twoSources).map(g=>g.sourceId),['physical-source-1','physical-source-2']);
// A recorded permission has no dependency on a current inventory/attunement/holding flag.
eq(active(JSON.parse(JSON.stringify(second))),active(second));eq(active(first).length,1);eq(first.elapsedSeconds,0);
for(const flag of ['sourceEligible','chargeAvailable','actionComplete','focusOnTool','cantripOnClassList','notAlreadyKnown'])eq(activate(empty,choice,{...context,[flag]:false}).ok,false);
eq(activate(empty,choice,{...context,definitelyKnown:true}).reason,'already-known');
for(const flag of Object.keys(context))for(const bad of [null,undefined,1,'true'])eq(activate(empty,choice,{...context,[flag]:bad}).reason,'invalid-context');
for(const field of Object.keys(context)){const bad={...context};delete bad[field];eq(activate(empty,choice,bad).reason,'invalid-context')}
eq(activate(empty,choice,{...context,held:true}).reason,'invalid-context');
for(const item of ['Manifold Tool','All-Purpose Tool','+4 All-Purpose Tool',null])eq(activate(empty,{...choice,item},context).reason,'invalid-choice');
for(const item of ['+1 All-Purpose Tool','+2 All-Purpose Tool','+3 All-Purpose Tool'])eq(activate(empty,{...choice,item},context).ok,true);
for(const key of ['sourceId','spell'])for(const value of ['',null,1,' leading','trailing '])eq(activate(empty,{...choice,[key]:value},context).reason,'invalid-choice');
for(const value of [-1,0.5,NaN,Infinity,'60',null,undefined])eq(advance(first,value).ok,false);
eq(advance(first,Number.MAX_SAFE_INTEGER).ok,true);eq(advance({...empty,elapsedSeconds:1},Number.MAX_SAFE_INTEGER).ok,false);
const nearMax={...empty,elapsedSeconds:Number.MAX_SAFE_INTEGER-28800};eq(activate(nearMax,choice,context).ok,true);eq(activate({...nearMax,elapsedSeconds:nearMax.elapsedSeconds+1},choice,context).reason,'clock-capacity');
eq(activate({...empty,nextGrantId:Number.MAX_SAFE_INTEGER},choice,context).reason,'clock-capacity');
for(const bad of [null,[],{}, {...empty,v:2},{...empty,elapsedSeconds:-1},{...empty,elapsedSeconds:0.5},{...empty,nextGrantId:0},{...empty,nextGrantId:'1'},{...empty,grants:{}},{...empty,extra:true}]){eq(problems(bad).length>0,true);eq(advance(bad,1).reason,'unsupported-state');eq(activate(bad,choice,context).reason,'unsupported-state');eq(active(bad),[])}
for(const patch of [{id:'tc-0'},{id:'tc-2'},{id:'tc-01'},{id:'tc-9007199254740993'},{sourceId:''},{item:'Manifold Tool'},{spell:''},{startedAt:1},{expiresAt:28799},{expiresAt:NaN},{extra:true}]){const state={...first,grants:[{...first.grants[0],...patch}]};eq(problems(state).length>0,true);eq(active(state),[])}
eq(problems({...first,grants:[first.grants[0],first.grants[0]]}).includes('grant-id'),true);
const before=JSON.stringify(first);const projected=active(first);projected[0].spell='changed';eq(JSON.stringify(first),before);const advanced=advance(first,0);advanced.state.grants[0].spell='changed';eq(JSON.stringify(first),before);result.grant.spell='changed';eq(first.grants[0].spell,'Eldritch Blast');
const future={v:2,opaque:{preserve:true}};const frozen=JSON.stringify(future);activate(future,choice,context);advance(future,1);eq(JSON.stringify(future),frozen);
// Imported state is data; accessor properties cannot change checks between reads.
let getterCalls=0;const getter=()=>{getterCalls++;throw Error('must not execute')};
for(const key of Object.keys(context)){const bad={...context};Object.defineProperty(bad,key,{enumerable:true,get:getter});eq(activate(empty,choice,bad).reason,'invalid-context')}
for(const key of Object.keys(choice)){const bad={...choice};Object.defineProperty(bad,key,{enumerable:true,get:getter});eq(activate(empty,bad,context).reason,'invalid-choice')}
for(const key of Object.keys(first)){const bad={...first};Object.defineProperty(bad,key,{enumerable:true,get:getter});eq(problems(bad),['state']);eq(active(bad),[])}
const getterGrant={...first.grants[0]};Object.defineProperty(getterGrant,'spell',{enumerable:true,get:getter});eq(problems({...first,grants:[getterGrant]}),['grant']);
const getterArray=[];Object.defineProperty(getterArray,'0',{enumerable:true,get:getter});eq(problems({...first,grants:getterArray}),['grants']);
for(const grants of [new Array(1),Object.assign([first.grants[0]],{extra:true}),Object.assign([first.grants[0]],{[Symbol('extra')]:true})])eq(problems({...first,grants}),['grants']);
eq(activate(empty,{...choice,[Symbol('extra')]:true},context).reason,'invalid-choice');eq(activate(empty,choice,{...context,[Symbol('extra')]:true}).reason,'invalid-context');eq(problems({...first,[Symbol('extra')]:true}),['state']);eq(getterCalls,0);
for(const value of [' source','source ','\u00a0source','source\n'])eq(activate(empty,{...choice,sourceId:value},context).reason,'invalid-choice');
for(const elapsedSeconds of [-1,NaN,Infinity,28799]){const state={...second,elapsedSeconds};eq(problems(state).length>0,elapsedSeconds!==28799)}
eq(problems({...second,elapsedSeconds:3599}).includes('grant-time'),true);eq(advance(first,-0).ok,true);
console.log(count+' temporary cantrip model checks PASS');
