import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as books from '../src/data/lib/study-books.js';
import {createStudyBooksBackend} from './fixtures/study-books-backend-native.mjs';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8');
const line=read('data/tp14-tkdm.js').split('\n').find(s=>s.startsWith('var IT='));
const native=JSON.parse(line.slice(7,-1)).find(row=>row[0]==='Necronomicon');
assert(native);
let checks=0;const plain=x=>x===undefined?undefined:JSON.parse(JSON.stringify(x)),eq=(a,b)=>{assert.deepEqual(plain(a),b);checks++};
function studied(ability='understanding'){
 let plan=books.adoptStudyBook(books.createStudyBooks(),ability);assert(plan.ok);const id=plan.id;
 plan=books.reviewStudyBook(plan.state,id,{actualAvailabilityVerified:true,available:true});assert(plan.ok);
 plan=books.recordStudyBook(plan.state,id,{[books.studyBookProfile(ability).ability]:10},{actualStudyAndPracticeCompleted:true,completedStudyHours:48,elapsedSpanHours:72});assert(plan.ok);
 return books.removeStudyBook(plan.state,id).state;
}
function fixture({state=studied(),base={WIS:10},save}={}){
 const host=createStudyBooksBackend({namespace:state,base,inventory:[{n:'Necronomicon',q:1,attuned:true}]}),c=host.c;
 c.DMAP={Necronomicon:structuredClone(native)};c.genv.WXI={tkdm:[structuredClone(native)]};
 c.attunementState=()=>({rows:c.B.inv.map(row=>({attuned:row.n==='Necronomicon'&&row.attuned===true}))});
 c.borrowedProjection=options=>{
  const study=Object.hasOwn(options,'studyBooks')?options.studyBooks:host.engine.studyMirror(),necro=Object.hasOwn(options,'necronomiconReading')?options.necronomiconReading:host.engine.mirror();
  const result={name:'Actor',cid:'actor',abilities:host.engine.calculate(options).sc,inv:structuredClone(c.B.inv)};
  if(study!==undefined){result.studyBooks=structuredClone(study);result.studyBookSources=books.studyBookSources(study)}
  if(necro!==undefined)result.necronomiconReading=structuredClone(necro);
  return result;
 };
 host.setC(c.borrowedProjection({}));c.genv.__necronomiconReadingSave=c.genv.__studyBooksSave;
 if(save)host.setSave(()=>save(host));
 vm.runInContext('(function(){'+read('builder/25e-logic-necronomicon-reading.js').replace(/^import .*;\n/gm,'')+'})()',c);
 const info=()=>c.genv.__bldNecronomiconInfo('Actor'),capture=()=>c.genv.__bldNecronomiconCapture('Actor',{signature:info().signature});
 return {...host,host,c,info,study(body={}){return c.genv.__bldNecronomiconStudy(capture(),{historicalReview:false,completedReadingHours:19,actualAttunement:true,baseAlreadyAccountsForChange:{INT:false,WIS:false},neverReceivedBefore:true,...body},host.before,()=>true)}};
}
{
 const x=fixture(),before=JSON.stringify(x.c.B.base),u=x.host.undos;
 const result=x.study();eq(result.ok,true);eq(x.host.undos,u+1);
 eq(x.c.S.studyBooks.order.beforeAcquisitionIds,['sba-1']);eq(x.host.C.studyBooks,x.c.S.studyBooks);
 eq(x.c.S.necronomiconReading.reading.WIS.before,12);eq(x.host.C.abilities.WIS,10);
 eq(JSON.stringify(x.c.B.base),before);eq(x.c.genv.__bldNecronomiconAcceptReceipt(result.receipt).ok,true);
 x.c.B.base.WIS=1;eq(x.host.engine.calculate().sc.WIS,1);
}
const historical={historicalReview:true,actualScoresVerified:true,scores:{INT:18,WIS:12}};
for(const initial of [undefined,100]){
 const x=fixture();x.c.APP_VER=134;x.c.lsSet=()=>true;x.c.genv.__appVer=134;
 vm.runInContext(read('app/04-logic-storage.js').split('\n').find(line=>line.startsWith('export function lsSave(')).replace('export ',''),x.c);
 x.c.genv.__lsSave=x.c.lsSave;if(initial!==undefined)x.c.S._app=initial;
 const withoutStamp=value=>{const copy={...value};delete copy._app;return JSON.stringify(copy)};
 x.c.wieldProjectionChanged=(a,b)=>withoutStamp(a)!==withoutStamp(b);
 const token=x.c.genv.__bldNecronomiconCapture('Actor',{signature:x.info().signature});
 eq(x.c.lsSave('state',x.c.S),true);eq(x.c.S._app,134);
 const result=x.c.genv.__bldNecronomiconStudy(token,{historicalReview:false,completedReadingHours:19,actualAttunement:true,baseAlreadyAccountsForChange:{INT:false,WIS:false},neverReceivedBefore:true},x.host.before,()=>true);
 eq(result.ok,true);eq(x.host.undos,1);
}
for(const change of ['notes','futureVersion']){
 const x=fixture();x.c.genv.__lsSave=()=>true;x.c.genv.__appVer=134;
 const token=x.c.genv.__bldNecronomiconCapture('Actor',{signature:x.info().signature});
 if(change==='notes')x.c.S.notes='a real state edit';else x.c.S._app=135;
 const result=x.c.genv.__bldNecronomiconStudy(token,{},x.host.before,()=>true);
 eq(result.ok,false);eq(x.host.undos,0);eq(x.c.S.necronomiconReading,undefined);
}
for(const version of [134,999]){
 const x=fixture();x.c.genv.__lsSave=()=>{};x.c.genv.__appVer=134;x.host.C._app=version;
 const withoutStamp=value=>{const copy={...value};delete copy._app;return JSON.stringify(copy)};
 x.c.wieldProjectionChanged=(a,b)=>withoutStamp(a)!==withoutStamp(b);
 const result=x.study();eq(result.ok,true);eq(x.host.C._app,version);
 eq(x.c.genv.__bldNecronomiconAcceptReceipt(result.receipt).ok,true);
}
{
 const x=fixture();x.c.genv.__lsSave=()=>{};x.c.genv.__appVer=134;
 const withoutStamp=value=>{const copy={...value};delete copy._app;return JSON.stringify(copy)};
 x.c.wieldProjectionChanged=(a,b)=>withoutStamp(a)!==withoutStamp(b);
 assert(read('builder/25-logic-hooks-for-the-sheet.js').includes('k!=="_app"'));
 const token=x.c.genv.__bldNecronomiconCapture('Actor',{signature:x.info().signature});
 x.host.C._app=134;
 const result=x.c.genv.__bldNecronomiconStudy(token,{historicalReview:false,completedReadingHours:19,actualAttunement:true,baseAlreadyAccountsForChange:{INT:false,WIS:false},neverReceivedBefore:true},x.host.before,()=>true);
 eq(result.ok,true);eq(x.host.C._app,134);eq(x.host.undos,1);
}
{
 const x=fixture({base:{WIS:1}}),snapshot=JSON.stringify([x.c.S,x.c.B,x.host.C]);
 const body={...historical,baseAlreadyAccountsForChange:{INT:false,WIS:true},actualChronologyVerified:true};
 const denied=x.study({...body,beforeAcquisitionIds:['sba-1']});
 eq(denied.ok,false);eq(denied.reason,'original-necronomicon-change-history-required');
 eq(x.host.undos,0);eq(JSON.stringify([x.c.S,x.c.B,x.host.C]),snapshot);
 eq(x.study({...body,beforeAcquisitionIds:[]}).ok,true);eq(x.host.C.abilities.WIS,3);
 eq(x.c.S.necronomiconReading.reading.WIS.delta,null);
}
for(const beforeIds of [[],['sba-1']]){
 const x=fixture({base:{WIS:1}}),snapshot=JSON.stringify([x.c.S,x.c.B,x.host.C]);
 eq(x.study(historical).ok,false);eq(x.host.undos,0);eq(JSON.stringify([x.c.S,x.c.B,x.host.C]),snapshot);
 const result=x.study({...historical,actualChronologyVerified:true,beforeAcquisitionIds:beforeIds});
 eq(result.ok,true);eq(x.host.undos,1);eq(x.host.C.abilities.WIS,beforeIds.length?1:3);
 eq(x.c.S.studyBooks.order.beforeAcquisitionIds,beforeIds);eq(x.host.C.studyBooks,x.c.S.studyBooks);
}
{
 const x=fixture({base:{WIS:1}}),snapshot=JSON.stringify(x.c.S);
 eq(x.study({...historical,actualChronologyVerified:true,beforeAcquisitionIds:['sba-unknown']}).ok,false);
 eq(x.host.undos,0);eq(JSON.stringify(x.c.S),snapshot);
}
{
 const x=fixture({state:studied('thought'),base:{INT:22}}),result=x.study();eq(result.ok,true);
 eq(x.c.S.necronomiconReading.reading.INT.before,24);eq(x.c.S.necronomiconReading.reading.INT.delta,0);eq(x.host.C.abilities.INT,24);
}
{
 const x=fixture({save:host=>{host.c.S.studyBooks.physical[0].present=true}}),result=x.study();
 eq(result.committed,true);eq(result.warning,'actor-changed-after-save');eq(x.c.genv.__bldNecronomiconAcceptReceipt(result.receipt).ok,false);
 eq(x.info().actorAvailable,false);eq(x.c.genv.__bldNecronomiconCapture('Actor',{signature:x.info().signature}),null);
}
console.log(checks+' actual native Necronomicon/study chronology transaction assertions PASS');
