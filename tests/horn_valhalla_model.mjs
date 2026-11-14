import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import * as m from '../src/data/lib/horn-valhalla.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},ok=a=>{assert.ok(a);checks++};
const context=vm.createContext({DataEnv:{slot:{}}});vm.runInContext(fs.readFileSync(new URL('../src/data/q07-bestiary.js',import.meta.url),'utf8'),context);const native=JSON.parse(JSON.stringify(context.DataEnv.slot.QREFS.monster));
function receipt(profile){const source=profile==='current'?'core':'mm14',nativeName='Berserker'+(source==='mm14'?' (MM)':''),rows=native.filter(x=>x.n===nativeName&&x.s===source);eq(rows.length,1);const definition=rows[0];return {logicalName:'Berserker',nativeName,source,maxHP:67,definition,definitionFingerprint:m.canonicalHornDefinition(definition)};}
const metals=['silver','brass','bronze','iron'],positive={weapons:'Simple, Martial',armor:'Light, Medium, Heavy, Shields'},negative={weapons:'Simple melee, Martial with Finesse or Light, Martial without Heavy',armor:'not Medium'},budget={key:'native-k',used:0,max:1};
for(const profile of ['current','legacy'])for(const metal of metals)for(const qualified of [true,false]){
 let state=m.createHornValhalla(),a=m.adoptHornValhalla(state,{profile,metal,key:budget.key},budget,{actualPhysicalIdentityVerified:true});ok(a.ok);eq(a.state.physical[0].historyKnown,false);
 let r=m.reviewHornValhallaHistory(a.state,a.id,budget,{actualSevenDayUseHistoryVerified:true,used:0});ok(r.ok);
 const creature=receipt(profile),facts={actualPhysicalAccessVerified:true,actualActivationCompleted:true,dice:profile==='current'?[]:Array(metals.indexOf(metal)+2).fill(4)},profs=qualified?positive:negative;
 let summon=m.planHornValhallaSummon(r.state,a.id,budget,creature,profs,facts);ok(summon.ok);eq(summon.budget.used,1);const expected=(metals.indexOf(metal)+2)*(profile==='current'?1:5);eq(summon.state.entities.length,expected);eq(summon.state.activations[0].disposition,metal==='silver'||qualified?'friendly':'hostile');eq(m.hornValhallaProblems(summon.state),[]);
 eq(m.planHornValhallaSummon(summon.state,a.id,summon.budget,creature,profs,facts).ok,false);
 const removed=m.setHornValhallaPresence(summon.state,a.id,false);ok(removed.ok);eq(removed.state.entities.every(e=>e.active),true);
 for(const condition of ['Charmed','Frightened']){const changed=m.changeHornValhallaCondition(removed.state,'hve-1',condition,true);eq(changed.ok,profile==='legacy');if(changed.ok)eq(changed.state.entities[0].conditions,[condition]);else eq(changed.reason,'entity-condition-immunity');}
 const poisoned=m.changeHornValhallaCondition(removed.state,'hve-1','Poisoned',true);ok(poisoned.ok);eq(poisoned.state.entities[0].conditions,['Poisoned']);ok(m.changeHornValhallaCondition(poisoned.state,'hve-1','Poisoned',false).ok);
 const zero=m.changeHornValhallaHP(removed.state,'hve-1','damage',100);ok(zero.ok);eq(zero.state.entities[0].endReason,'zero-hp');eq(zero.state.entities[1].active,true);eq(m.changeHornValhallaHP(zero.state,'hve-1','healing',67).ok,false);
 const hour=m.recordHornValhallaHour(zero.state,summon.activationId,{actualOneHourSinceActivationPassed:true});ok(hour.ok);eq(hour.state.entities[0].endReason,'zero-hp');eq(hour.state.entities.slice(1).every(e=>e.endReason==='one-hour'),true);eq(m.recordHornValhallaHour(hour.state,summon.activationId,{actualOneHourSinceActivationPassed:true}).ok,false);eq(summon.budget.used,1);
 const reset=m.recordHornValhallaSevenDays(removed.state,a.id,summon.budget,{actualSevenDaysSinceLastUsePassed:true,eventId:'week-1'});ok(reset.ok);eq(reset.budget.used,0);eq(reset.state.entities.every(e=>!e.active),true);eq(reset.state.physical[0].present,false);eq(m.recordHornValhallaSevenDays(reset.state,a.id,reset.budget,{actualSevenDaysSinceLastUsePassed:true,eventId:'week-1'}).ok,false);
 eq(m.recordHornValhallaHour(removed.state,summon.activationId,{actualLongRest:true}).ok,false);eq(m.recordHornValhallaSevenDays(removed.state,a.id,summon.budget,{actualDawnOccurred:true,eventId:'dawn'}).ok,false);
}
for(const weapons of ['Martial with Finesse or Light','Martial without Heavy','Martial melee','Longsword, Greatsword','not Martial'])eq(m.hornProficiencyDisposition('iron',{weapons,armor:''}),'hostile');
for(const armor of ['not Medium','Medium except Half Plate','Light, Shield'])eq(m.hornProficiencyDisposition('bronze',{weapons:'',armor}),'hostile');
for(const state of [null,{v:99},{...m.createHornValhalla(),future:true},{...m.createHornValhalla(),entities:[null]}])ok(m.hornValhallaProblems(state).length);
eq(m.hornProficiencyDisposition('silver',{weapons:null,armor:''}),null);eq(m.hornProficiencyDisposition('silver',{weapons:'',armor:''}),'friendly');
const source=receipt('legacy');
let adopted=m.adoptHornValhalla(m.createHornValhalla(),{profile:'legacy',metal:'iron',key:budget.key},budget,{actualPhysicalIdentityVerified:true});
let reviewed=m.reviewHornValhallaHistory(adopted.state,adopted.id,budget,{actualSevenDayUseHistoryVerified:true,used:0});
const facts={actualPhysicalAccessVerified:true,actualActivationCompleted:true,dice:[1,2,3,4,1]},activate=(b=budget,c=source,p=positive,f=facts)=>m.planHornValhallaSummon(reviewed.state,adopted.id,b,c,p,f);
for(const dice of [[],[4,4,4,4],[4,4,4,4,4,4],[0,1,1,1,1],[5,1,1,1,1],[1.5,1,1,1,1],null])eq(activate(budget,source,positive,{...facts,dice}).ok,false);
for(const b of [{...budget,key:'other'},{...budget,used:1},{...budget,used:-1},{...budget,max:2},{...budget,future:true}])eq(activate(b).ok,false);
for(const c of [{...source,source:'core'},{...source,maxHP:68},{...source,definitionFingerprint:'different'},{...source,nativeName:'Berserker'},{...source,future:true}])eq(activate(budget,c).ok,false);
for(const p of [{weapons:null,armor:''},{weapons:'Martial',armor:'',future:true},null])eq(activate(budget,source,p).ok,false);
for(const f of [{...facts,actualActivationCompleted:false},{...facts,actualPhysicalAccessVerified:false}])eq(activate(budget,source,positive,f).ok,false);
const before=JSON.stringify({state:reviewed.state,budget,source,positive,facts}),summon=activate();ok(summon.ok);eq(summon.state.entities.length,16);eq(JSON.stringify({state:reviewed.state,budget,source,positive,facts}),before);
const profs={weapons:'Martial',armor:''},snapshot=activate(budget,source,profs);profs.weapons='';eq(snapshot.state.activations[0].disposition,'friendly');eq(snapshot.state.activations[0].profs.weapons,'Martial');
const damaged=m.changeHornValhallaHP(summon.state,'hve-1','damage',7);eq(damaged.state.entities[0].hp,60);eq(m.changeHornValhallaHP(damaged.state,'hve-1','healing',100).state.entities[0].hp,67);
for(const action of [()=>m.changeHornValhallaHP(summon.state,'hve-1','damage',0),()=>m.changeHornValhallaHP(summon.state,'hve-1','damage',1.5),()=>m.changeHornValhallaCondition(summon.state,'hve-1','future',true),()=>m.recordHornValhallaHour(summon.state,'missing',{actualOneHourSinceActivationPassed:true})])eq(action().ok,false);
const ended=m.recordHornValhallaHour(summon.state,summon.activationId,{actualOneHourSinceActivationPassed:true});eq(m.changeHornValhallaCondition(ended.state,'hve-1','Poisoned',true).ok,false);eq(m.changeHornValhallaHP(ended.state,'hve-1','healing',1).ok,false);
const duplicate=structuredClone(summon.state);duplicate.entities[1].id=duplicate.entities[0].id;ok(m.hornValhallaProblems(duplicate).length);const future=structuredClone(summon.state);future.activations[0].future=true;ok(m.hornValhallaProblems(future).length);
console.log(`${checks} native Horn of Valhalla source/roster lifecycle checks PASS`);
