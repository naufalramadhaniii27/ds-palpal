import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {evaluateWieldMinimum,applyWieldScoreCustomization} from '../src/data/lib/wield-minimum.js';
const appSource=fs.readFileSync(new URL('../src/app/21d-logic-wield-refresh.js',import.meta.url),'utf8').replace(/^import .*;$/gm,'').replace('export function syncWieldMinimum','function syncWieldMinimum');
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const rule={abilityMin:{STR:17}};
const item=(str=16)=>({key:"Forgemaster's Might",wieldInfo:{rule,...evaluateWieldMinimum(rule,{STR:str})}});
function harness({lazy=false,reason=null,throws=false}={}){
 let calls=0,toasts=0,need=0,release;const waits=[];
 const c={C:{name:'Owned',inv:[item()]},S:{cust:{}},score:17,queueMicrotask:f=>waits.push(f),toast:()=>toasts++,currentAbilityScores:()=>({STR:c.score}),weaponWieldInfo:it=>evaluateWieldMinimum(it.wieldInfo.rule,{STR:c.score}),env:{}};
 const refresh=()=>{calls++;if(throws)throw Error('failure');if(reason)return {ok:false,reason};c.C={...c.C,inv:[item(c.score)]};return {ok:true}};
 if(lazy)c.env.__bldNeed=()=>{need++;return new Promise(r=>release=()=>{c.env.__bldRefreshWield=refresh;r()})};else c.env.__bldRefreshWield=refresh;
 vm.createContext(c);vm.runInContext(appSource,c);
 return {c,run:()=>c.syncWieldMinimum(),release:()=>release(),stats:()=>({calls,toasts,need}),async flush(){for(let n=0;n<30;n++){await Promise.resolve();while(waits.length)waits.shift()()}eq(waits.length,0)}};
}
// Real source refreshes missing row after raise and removes it on Undo; refreshed metadata breaks loop.
{
 const h=harness();h.run();await h.flush();eq(h.stats().calls,1);eq(h.c.C.inv[0].wieldInfo.allowed,true);
 h.c.score=16;h.run();await h.flush();eq(h.stats().calls,2);eq(h.c.C.inv[0].wieldInfo.allowed,false);h.run();await h.flush();eq(h.stats().calls,2);
}
for(const inv of [[],[{key:'Longsword'}],[{n:"Forgemaster's Might"}]]){const h=harness();h.c.C.inv=inv;h.run();await h.flush();eq(h.stats().calls,0)}
// Every lazy boundary must reject changed owner, state, source inventory or current scores.
for(const mutate of [c=>c.C={...c.C},c=>c.S={},c=>c.C.name='Other',c=>c.C.inv[0].key='Other',c=>c.score=18]){
 const h=harness({lazy:true});h.run();eq(h.stats().need,1);mutate(h.c);h.release();for(let n=0;n<12;n++)await Promise.resolve();
 // The stale lazy continuation must not write. A separately queued fresh context may retry.
 eq(h.stats().calls,0);await h.flush();eq(h.stats().calls,1);
}
for(const reason of ['manual','owner']){const h=harness({reason});const before=JSON.stringify(h.c.C);h.run();await h.flush();h.run();await h.flush();eq(h.stats().calls,1);eq(h.stats().toasts,1);eq(JSON.stringify(h.c.C),before)}
{const h=harness({throws:true});h.run();await h.flush();h.run();await h.flush();eq(h.stats().calls,1);eq(h.stats().toasts,0)}
// Execute actual backend API slice with causal projections, not a mocked API contract.
const backend=fs.readFileSync(new URL('../src/builder/25-logic-hooks-for-the-sheet.js',import.meta.url),'utf8');
const begin=backend.indexOf('function wieldRefreshOwner('),end=backend.indexOf('/* v18 RU74:',begin);assert.ok(begin>=0&&end>begin);
let current,cust={},soft=0;const B={name:'Owned',cid:'id',inv:[{n:"Forgemaster's Might",q:1,eq:true,attuned:true}]};
function projection(options){const scores=options?.wieldScores??applyWieldScoreCustomization({STR:16},cust),r=evaluateWieldMinimum(rule,scores);return {features:[{g:'Species: Human',items:[{n:'Trait',d:'original'}]}],name:'Owned',abilities:[{ab:'STR',v:16}],inv:[{key:"Forgemaster's Might",wieldInfo:{rule,...r}}],attacks:r.allowed?[{n:'Forge'}]:[],res:[{n:'pool',max:7}]}}
const b={B,genv:{__sheetState:()=>({C:current}),__sheetId:()=> 'id',__sheetSoft:N=>{current=N;soft++}},own:n=>n===B.name,toSheet:projection,manualLost:()=>({attacks:[],res:[]}),bdJ:x=>JSON.stringify(x??null),bdField:(k,P,N,l,o)=>{if(!['v','_app','bv'].includes(k)&&JSON.stringify(P[k])!==JSON.stringify(N[k]))o.push(k)}};
vm.createContext(b);vm.runInContext(backend.slice(backend.indexOf('const DIFFL='),backend.indexOf('genv.__bldDiff=function'))+backend.slice(begin,end),b);current=projection();const before=JSON.stringify(B);
for(const customization of [{'n:ab-STR':{b:1}},{},{'n:ab-STR':{o:19}},{}]){cust=customization;eq(b.genv.__bldRefreshWield('Owned').ok,true);eq(current.attacks.length,Object.keys(cust).length?1:0);eq(current.abilities[0].v,16)}
eq(JSON.stringify(B),before);current.res.push({n:'manual'});const untouched=JSON.stringify(current),previousSoft=soft;cust={'n:ab-STR':{b:1}};eq(b.genv.__bldRefreshWield('Owned').reason,'manual');eq(JSON.stringify(current),untouched);eq(soft,previousSoft);eq(b.genv.__bldRefreshWield('Other').reason,'owner');current=projection();delete current.inv[0].wieldInfo;eq(b.genv.__bldRefreshWield('Owned').reason,'metadata');
// Actual general comparator intentionally ignores Species groups; refresh must preserve every manual feature.
for(const mutate of [P=>{P.features[0].items[0].d='manual edit'},P=>{P.features.push({g:'Species: Homebrew',items:[{n:'Added',d:'keep'}]})},P=>{P.features.push({g:'Manual',items:[{n:'Added',d:'keep'}]})}]){
 cust={};current=projection();mutate(current);const beforeManual=JSON.stringify(current),beforeSoft=soft;cust={'n:ab-STR':{b:1}};
 eq(b.genv.__bldRefreshWield('Owned').reason,'manual');eq(JSON.stringify(current),beforeManual);eq(soft,beforeSoft);
}
console.log(checks+' wield refresh checks PASS');
