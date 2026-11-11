import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {createTemporaryCantripState,activateTemporaryCantrip,advanceTemporaryCantripTime} from '../src/data/lib/temporary-cantrip.js';
import {temporaryCantripStatus as status,temporaryGrantPermission} from '../src/app/lib/temporary-cantrip-guard.js';
import {resolveObjectRepairProfile as resolveObjectRepairProfile,evaluateRepairRequest} from '../src/app/lib/object-repair-runtime.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};const strip=s=>s.replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
function fixture(name='Fire Bolt'){const context={sourceEligible:true,chargeAvailable:true,actionComplete:true,focusOnTool:true,cantripOnClassList:true,definitelyKnown:false,notAlreadyKnown:true},state=activateTemporaryCantrip(createTemporaryCantripState(),{sourceId:'source-1',item:'+1 All-Purpose Tool',spell:name},context).state,grant=state.grants[0],record={...grant};delete record.spell;const row={n:name,l:0,ab:'INT',sourceKey:'Artificer',ct:name==='Mending'?'1 minute':'Action',temporaryCantrip:{v:1,grantIds:[grant.id],grants:[record]}};return {state,row}}
{
 const {state,row}=fixture();eq(status(row,state).allowed,true);eq(status({...row,sourceKey:'Wizard'},state).allowed,false);eq(status({...row,ab:'CHA'},state).allowed,false);eq(status({...row,l:1},state).allowed,false);eq(status({...row,n:'Other'},state).allowed,false);eq(status(row,{...state,v:2}).allowed,false);eq(status(row,advanceTemporaryCantripTime(state,28799).state).allowed,true);eq(status(row,advanceTemporaryCantripTime(state,28800).state).reason,'temporary-cantrip-expired');eq(status({n:'Ordinary'},undefined).allowed,true);eq(status({...row,temporaryCantrip:null},state).allowed,false);eq(status({...row,temporaryCantrip:{...row.temporaryCantrip,grantIds:['tc-1','tc-1']}},state).allowed,false);eq(temporaryGrantPermission(row.n,['tc-999'],state).allowed,false);
 const forged=structuredClone(row);forged.temporaryCantrip.grants[0].sourceId='wrong';eq(status(forged,state).allowed,false);
}
function castHarness(name='Fire Bolt'){const {state,row}=fixture(name),trace=[],events=[];let rage=false,prompt;const c={structuredClone,temporaryCantripStatus:status,resolveObjectRepairProfile,evaluateRepairRequest,C:{name:'Actor',cid:'actor-1',id:1,inv:[],spells:[row]},S:{temporaryCantrips:state,used:{},cond:{}},D:{res:[]},env:{},bindLive(){},document:{addEventListener:(type,fn)=>{if(type==='click')events.push(fn)}},modeOn:()=>rage,ask:(_text,_label,callback)=>{prompt=callback},lateGet:()=>({}),toast:()=>trace.push('failure'),undoMark:()=>trace.push('undo'),save:()=>trace.push('save'),syncLU(){},renderSpells(){},renderConds(){},refreshEntry(){},toastU(){},cmbCast(){},cmbRe(){},num:(x,d=0)=>Number.isFinite(+x)?+x:d};vm.createContext(c);vm.runInContext(strip(read('src/app/32b-logic-play-concentration-casting.js')),c);return {c,row,trace,events,rage:()=>{rage=true},prompt:()=>prompt}}
{
 const h=castHarness(),before=JSON.stringify(h.c.S.used);h.c.castDo(0,'',0);eq(h.trace.filter(v=>v==='undo').length,1);eq(JSON.stringify(h.c.S.used),before);
}
for(const change of [h=>h.c.S.temporaryCantrips=advanceTemporaryCantripTime(h.c.S.temporaryCantrips,28800).state,h=>h.c.C={...h.c.C},h=>h.c.S={...h.c.S},h=>h.c.C.cid='actor-2',h=>h.c.C.spells[0]={...h.row},h=>h.c.C.spells[0]={n:'Ordinary',l:0}]){const h=castHarness();h.rage();h.c.castDo(0,'',0);eq(typeof h.prompt(),'function');change(h);h.prompt()();eq(h.trace.includes('undo'),false);eq(h.c.S.used,{});eq(h.c.S.conc,undefined)}
{
 const h=castHarness();h.rage();h.c.castDo(0,'',0);h.prompt()();eq(h.trace.filter(v=>v==='undo').length,1);
}
{
 const h=castHarness();h.c.S.temporaryCantrips=advanceTemporaryCantripTime(h.c.S.temporaryCantrips,28800).state;const button={hasAttribute:key=>key==='data-concon',getAttribute:()=> '0'},event={target:{closest:()=>button},preventDefault(){},stopPropagation(){}};h.events[0](event);eq(h.c.S.conc,undefined);eq(h.trace.includes('undo'),false);
}
{
 const h=castHarness('Mending');h.row.objectRepair={spell:'Mending',baseKnown:false,sources:[{kind:'temporary-cantrip',grantIds:['tc-1'],maxBreakFeet:1,grantsKnowledge:true}]};let profile=h.c.currentRepairProfile(0);eq(profile.known,true);eq(profile.spec.maxBreakFeet,1);const forge={item:'Forge',itemState:'attuned',requiresAttunement:true,grantsKnowledge:false,maxBreakFeet:5};h.c.C.inv=[{key:'Forge',q:1,attuned:true,attunedActive:true,eq:false}];h.row.objectRepair.sources.push(forge);profile=h.c.currentRepairProfile(0);eq(profile.known,true);eq(profile.spec.maxBreakFeet,5);h.c.C.inv=[];eq(h.c.currentRepairProfile(0).known,true);eq(h.c.currentRepairProfile(0).spec.maxBreakFeet,1);
 const root={isConnected:true},session=h.c.createObjectRepairSession(0,root);h.c.S.temporaryCantrips=advanceTemporaryCantripTime(h.c.S.temporaryCantrips,28800).state;const result=h.c.requestObjectRepairCast({session,target:{object:true,kind:'Object',singleBreak:true,touch:true,dimensionsFeet:[1,0,0]},declarations:{components:true,equipment:true,castingTimeComplete:true}});eq(result.ok,false);eq(h.trace.includes('undo'),false);eq(h.c.currentRepairProfile(0).known,false);
 const permanent={n:'Mending',l:0,ct:'1 minute',objectRepair:{spell:'Mending',baseKnown:true,sources:[forge]}};eq(resolveObjectRepairProfile(h.c.C,permanent,h.c.S).known,true);eq(resolveObjectRepairProfile(h.c.C,permanent,h.c.S).spec.maxBreakFeet,1);
}
{
 const h=castHarness(),root={isConnected:true,classList:{contains:()=>true}};h.c.document.querySelector=()=>root;h.rage();h.c.castDo(0,'',0);root.isConnected=false;h.prompt()();eq(h.trace.includes('undo'),false);
}
function rollHarness(){const {state,row}=fixture(),attack={...row};delete attack.l;const c={C:{name:'Actor',cid:'actor-1',id:1,attacks:[attack],spells:[row],spellcasting:{by:[{k:'Artificer',n:'Artificer',ab:'INT',atk:6,dc:14}]}},S:{temporaryCantrips:state},temporaryCantripStatus:status,lateGet:key=>key==='scOf'?()=>({atk:6,dc:14}):value=>value,sheetRootActive:root=>root.isConnected,env:{},WeakSet,JSON,Object};vm.createContext(c);vm.runInContext(strip(read('src/app/lib/spell-source-runtime.js')),c);return c}
for(const key of ['ah-0','ad-0']){let c=rollHarness(),guard=c.temporaryAttackGuard(key);eq(typeof guard,'function');eq(guard(),true);c.C.inv=[];eq(c.temporaryAttackGuard(key)(),true);for(const change of [c=>c.S.temporaryCantrips=advanceTemporaryCantripTime(c.S.temporaryCantrips,28800).state,c=>c.C={...c.C},c=>c.S={...c.S},c=>c.C.cid='other',c=>c.C.attacks[0]={...c.C.attacks[0]},c=>c.C.attacks[0].ab='CHA']){c=rollHarness();guard=c.temporaryAttackGuard(key);change(c);eq(guard(),false)}c=rollHarness();c.C.attacks[0].temporaryCantrip=null;eq(c.temporaryAttackGuard(key),false);c=rollHarness();delete c.C.attacks[0].temporaryCantrip;eq(c.temporaryAttackGuard(key),undefined)}
{
 const c=rollHarness();eq(c.createSpellSourceContext({index:0})!==null,true);c.S.temporaryCantrips=advanceTemporaryCantripTime(c.S.temporaryCantrips,28800).state;eq(c.createSpellSourceContext({index:0}),null);c.C.spells[0].temporaryCantrip=null;eq(c.createSpellSourceContext({index:0}),null);
}
// Execute actual FX parsing and native dice engine with the live tagged-attack factory.
{
 const file=read('src/fx/16-z-pack-dice-sound-hover.js'),continuation=read('src/fx/16b-z-pack-dice-sound-hover-2.js');
 const c={FXS16A:{decorateAttack:(_element,spec)=>spec,calm:()=>false},FXENV:{},Date,isFinite,parseInt,d:()=>10,navigator:{},esc:String};vm.createContext(c);
 const assignment=(name,source=file)=>{const start=source.indexOf('  '+name+'='),end=source.indexOf('\n})();',start);assert.ok(start>=0&&end>start);vm.runInContext(source.slice(start,end),c)};
 assignment('FXS16A.sourceSpec',continuation);assignment('FXS16A.rollSpec');vm.runInContext(file.split('\n').find(line=>line.includes('FXS16A.parseDmg=function')),c);vm.runInContext(continuation.split('\n').find(line=>line.includes('FXS16A.damageExpressionFor=function')),c);assignment('FXS16A.rollDice');assignment('FXS16A.rollAllowed');
 const start=file.indexOf('  FXS16A.doRoll=function'),end=file.indexOf('  (FXENV.__miRoll=',start);vm.runInContext(file.slice(start,end),c);let history=0,callbacks=0;c.FXS16A.finish=()=>({v:10});c.FXS16A.after=()=>history++;
 for(const key of ['ah-0','ad-0'])for(const async of [false,true]){
  const actor=rollHarness();c.FXENV.__temporaryAttackGuard=actor.temporaryAttackGuard;const spec=c.FXS16A.rollSpec(key,null,key.startsWith('ad')?'1d10 Fire':'+6');eq(typeof spec.sourceGuard,'function');let release;if(async)c.FXENV.__dice3d={roll:()=>new Promise(resolve=>release=resolve)};const before=history;
  if(!async)actor.S.temporaryCantrips=advanceTemporaryCantripTime(actor.S.temporaryCantrips,28800).state;
  c.FXS16A.doRoll(spec,'','temporary',()=>callbacks++,spec.sourceGuard);
  if(async){actor.S.temporaryCantrips=advanceTemporaryCantripTime(actor.S.temporaryCantrips,28800).state;release([10]);await Promise.resolve();delete c.FXENV.__dice3d}
  eq(history,before);eq(callbacks,0);
 }
 const actor=rollHarness();c.FXENV.__temporaryAttackGuard=actor.temporaryAttackGuard;const spec=c.FXS16A.rollSpec('ah-0',null,'+6');c.FXS16A.doRoll(spec,'','temporary',()=>callbacks++,spec.sourceGuard);eq(history,1);eq(callbacks,1);
}
{
 const source=read('src/app/32c-ui-object-repair.js'),start=source.indexOf('function repairSources'),end=source.indexOf('export function objectRepairSummary',start),context={};vm.createContext(context);vm.runInContext(source.slice(start,end),context);const label=context.repairSources({sources:[{kind:'temporary-cantrip',maxBreakFeet:1}]});eq(label.includes('undefined'),false);eq(label.includes('Temporary All-Purpose Tool permission'),true);eq(context.repairReason('temporary-cantrip-expired',{}).includes('expired'),true);
}
console.log(count+' temporary cantrip cast / repair / attack permission checks PASS');
