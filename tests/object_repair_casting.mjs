import {iounCharacterMathStatus} from '../src/data/lib/ioun-orbit-source.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {resolveObjectRepairProfile,evaluateRepairRequest} from '../src/app/lib/object-repair-runtime.js';
const code=fs.readFileSync(new URL('../src/app/32b-logic-play-concentration-casting.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const source={item:"Forgemaster's Might",maxBreakFeet:5,requiresAttunement:true,itemState:'attuned',grantsKnowledge:true};
const target={object:true,kind:'MagicItem',singleBreak:true,touch:true,dimensionsFeet:[5,1,0]};const declarations={components:true,equipment:true,castingTimeComplete:true};
function harness(baseKnown=false){
 const trace=[],item={n:source.item,key:source.item,q:1,eq:false,attuned:true,attunedActive:true};const root={isConnected:true};let raging=false,opened=0,prompt=null;
 const c={C:{name:'Owned',inv:[item],spells:[{n:'Mending',l:0,ct:'1 minute',r:'Touch',cmp:'V, S, M',objectRepair:{spell:'Mending',baseKnown,sources:[{...source}],maxBreakFeet:5}}]},S:{used:{creation:1,fabricate:1,s2:1},hp:20,tmp:3},D:{res:[]},env:{},resolveObjectRepairProfile,evaluateRepairRequest,structuredClone,bindLive(){},document:{addEventListener(){}},modeOn:()=>raging,lateGet:k=>k==='openObjectRepair'?()=>opened++:{},ask:(msg,label,cb)=>{prompt=cb;trace.push('ask')},undoMark:()=>trace.push('undo'),save:()=>trace.push('save'),syncLU:()=>trace.push('sync'),renderSpells:()=>trace.push('spells'),renderConds:()=>trace.push('conds'),refreshEntry:()=>{trace.push('refresh');root.isConnected=false},toastU:()=>trace.push('toast'),toast:()=>trace.push('failure'),cmbCast:()=>trace.push('combo'),cmbRe:()=>trace.push('combo-render')};
 Object.assign(c,{iounCharacterMathStatus});vm.createContext(c);vm.runInContext(code,c);return {c,root,item,trace,session:()=>c.createObjectRepairSession(0,root),request:(session,extra={})=>c.requestObjectRepairCast({session,target:structuredClone(target),declarations:{...declarations},...extra}),rage:on=>raging=on,opened:()=>opened,prompt:()=>prompt};
}
{
 const h=harness();h.c.castDo(0,'',0);h.c.quickCast(0);eq(h.opened(),2);eq(h.trace,[]);h.c.castDo(0,'',0,true,{});eq(h.opened(),3);eq(h.trace,[]);
 const before=JSON.stringify(h.c.S),session=h.session();let called=0;
 const result=h.request(session,{onCommitted:cert=>{called++;h.trace.push('callback');eq(cert.committed,true);eq(cert.character,h.c.C);eq(cert.state,h.c.S);eq(h.root.isConnected,false);eq(cert.result.magicRestored,false)}});
 eq(result.ok,true);eq(called,1);eq(h.trace.indexOf('refresh')<h.trace.indexOf('callback'),true);eq(h.trace.filter(x=>x==='undo').length,1);eq(JSON.stringify(h.c.S),before);eq(h.request(session).reason,'stale-cast');eq(called,1);
}
for(const itc of [{it:"Master Machinist's Marvelous Mallet",c:1},{it:'Lyre of Building',c:0},{it:'Needle of Mending',c:0}]){const h=harness();h.c.C.spells[0].itc=itc;eq(h.request(h.session()).ok,false);eq(h.trace,[])}
for(const bad of [{declarations:{...declarations,components:false}},{declarations:{...declarations,equipment:false}},{declarations:{...declarations,castingTimeComplete:false}},{target:{...target,touch:false}},{target:{...target,singleBreak:false}},{target:{...target,kind:'Construct'}},{target:{...target,dimensionsFeet:[5.01,0,0]}}]){
 const h=harness();eq(h.request(h.session(),bad).ok,false);eq(h.trace,[]);
}
{
 const h=harness();h.rage(true);eq(h.request(h.session()).reason,'rage');eq(h.trace,[]);eq(h.prompt(),null);
}
for(const invalidate of [h=>{h.c.C={...h.c.C}},h=>{h.c.S={...h.c.S}},h=>{h.c.C.name='Other'},h=>{h.root.isConnected=false},h=>{h.c.C.spells[0]={n:'Light',l:0}},h=>{h.item.attuned=false},h=>{h.item.q=0}]){
 const h=harness(),session=h.session();invalidate(h);eq(h.request(session).ok,false);eq(h.trace,[]);
}
{
 // Change the source between request validation and native pre-commit validation.
 const h=harness();let calls=0;h.c.modeOn=()=>{if(++calls===1)h.item.attuned=false;return false};eq(h.request(h.session()).reason,'stale-source');eq(h.trace,[]);
}
{
 const h=harness(true),session=h.session();h.item.attuned=false;eq(h.request(session).reason,'stale-source');eq(h.c.currentRepairProfile(0).spec.maxBreakFeet,1);eq(h.request(h.session(),{target:{...target,dimensionsFeet:[1,0,0]}}).ok,true);
}
{
 const h=harness();h.c.C.spells=[{n:'Light',l:0}];h.c.castDo(0,'',0);eq(h.trace.includes('undo'),true);eq(h.opened(),0);
 const r=harness();r.c.C.spells=[{n:'Light',l:0}];r.rage(true);r.c.castDo(0,'',0);eq(r.trace,['ask']);r.prompt()();eq(r.trace.includes('undo'),true);
}
console.log(checks+' native repair cast routing / declarations / stale source / success callback / ordinary cast checks passed');
