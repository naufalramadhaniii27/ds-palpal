import assert from 'node:assert/strict';
import {createOrdersWrathRuntime,invalidateOrdersWrathState} from '../src/app/lib/orders-wrath-runtime.js';
import {ordersWrathProfile} from '../src/data/lib/orders-wrath.js';
import {divineStrikeProfile,blessedStrikeProfile,advanceTurnDamageGeneration} from '../src/data/lib/turn-damage.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++};
const hit={targetLabel:'Ogre by doorway',damageDealt:9,creature:true,ownTurn:true,divineStrikeDealt:true};
function harness({deferred=false,edition='2014',critical=false}={}){
 const source={kind:'sub',owner:'Order Domain',classKey:'Cleric',level:17,pre:'',edition};let profile=ordersWrathProfile(source),owner={C:{name:'Actor',cid:'actor-1',id:1,cls:'Cleric',sub:'Order Domain',level:17,rs:edition,ordersWrath:profile,divineStrike:{rule:edition==='2014'?divineStrikeProfile('Order Domain',17):blessedStrikeProfile(17),source:edition==='2014'?source:{...source,kind:'cls',owner:'Cleric'}}},S:{hp:12,used:{ordinary:2},sit:{used:{other:1},v:{choice:'kept'}}}},before=()=>undefined,save=()=>undefined;
 const root={active:true},trace=[],pending=[],specs=[];const dice={commitHook:1,roll(spec,mode,label,callback,guard,commit){specs.push({spec,mode,label});const result={v:mode==='crit'?16:8,k:'dmg'};const finish=()=>{if(!guard()||!guard()||commit(result)!==true)return false;trace.push('history');callback(result);return true};if(!guard())return false;if(deferred){pending.push(finish);return undefined}return finish()}};
 const runtime=createOrdersWrathRuntime({getActor:()=>owner,getRule:()=>profile,rootActive:r=>r.active===true,getDice:()=>dice,beforeCommit:()=>{trace.push('before');return before()},save:()=>{trace.push('save');return save()}});
 const h={runtime,root,trace,pending,specs,dice,owner:()=>owner,setOwner:x=>owner=x,setProfile:x=>profile=x,setBefore:fn=>before=fn,setSave:fn=>save=fn,capture:()=>runtime.capture(root)};
 h.create=(facts=hit,receipt)=>runtime.createCurse(h.capture(),facts,receipt);
 h.ally=(facts={})=>{const curse=owner.S.ordersWrath.curse;return runtime.recordAllyHit(h.capture(),{targetId:curse&&curse.target.id,hitter:'ally',nextAllyHit:true,yourNextTurnStarted:false,critical,...facts})};
 h.turn=()=>{invalidateOrdersWrathState(owner.S);owner.S.sit=advanceTurnDamageGeneration(owner.S.sit).sit};
 h.ownTurn=()=>runtime.myNextTurn(h.capture(),{myNextTurnStarts:true},()=>{delete owner.S.sit.used['orders-wrath'];h.turn();delete owner.S.sit.used['divine-strike']});
 h.prepare=()=>{eq(h.create().ok,true);eq(h.ally().ok,true);return owner.S.ordersWrath.pendingHits[0].id};return h;
}
for(const edition of ['2014','2024']){
 const h=harness({edition}),before=JSON.stringify(h.owner()),token=h.capture();eq(h.runtime.info(token).state.curse,null);eq(JSON.stringify(h.owner()),before);const done=h.runtime.createCurse(token,hit);eq(done.ok,true);eq(done.character,h.owner().C);eq(done.state,h.owner().S);eq(done.curse.target,{id:'ow-target-1',label:'Ogre by doorway'});eq(h.owner().S.sit.used['orders-wrath'],1);eq(h.owner().S.sit.used.other,1);eq(h.owner().S.hp,12);eq(h.owner().S.used.ordinary,2);eq(h.trace,['before','save']);eq(h.create().ok,false);eq(h.runtime.info(token).ok,false);
 h.turn();eq(h.owner().S.ordersWrath.curse.id,'ow-1');eq(h.owner().S.sit.used['orders-wrath'],1);eq(h.create().ok,false);const next=h.ally();eq(next.ok,true);eq(h.owner().S.ordersWrath.curse,null);eq(h.owner().S.ordersWrath.pendingHits.length,1);eq(h.specs.length,0);eq(h.ally().ok,false);
 const id=next.event.id;let reply;h.trace.length=0;eq(h.runtime.resolveDamage(h.capture(),id,value=>reply=value).committed,true);eq(h.specs[0].spec,{dmg:'2d8',dtype:'Psychic'});eq(h.specs[0].mode,'');eq(h.owner().S.ordersWrath.pendingHits.length,0);eq(h.trace,['before','save','history']);eq(reply.resolved.value,8);eq(h.runtime.resolveDamage(h.capture(),id).ok,false);eq(h.owner().S.hp,12);
}
for(const change of [{divineStrikeDealt:false},{damageDealt:0},{damageDealt:-1},{damageDealt:NaN},{damageDealt:1.5},{creature:false},{ownTurn:false},{targetLabel:''},{targetLabel:'  '},{critical:true},{ownTurn:'true'}]){const h=harness(),before=JSON.stringify(h.owner());eq(h.create({...hit,...change}).ok,false);eq(JSON.stringify(h.owner()),before);eq(h.trace,[])}
for(const change of [{hitter:'self'},{hitter:'other'},{nextAllyHit:false},{yourNextTurnStarted:true},{targetId:'different'},{critical:'yes'},{weaponAttack:true}]){const h=harness();h.create();const before=JSON.stringify(h.owner());h.trace.length=0;eq(h.ally(change).ok,false);eq(JSON.stringify(h.owner()),before);eq(h.trace,[])}
{
 const h=harness({critical:true}),id=h.prepare();eq(h.ownTurn().ok,true);eq(h.owner().S.ordersWrath.curse,null);eq(h.owner().S.ordersWrath.pendingHits[0].id,id);eq(h.owner().S.sit.used['orders-wrath'],undefined);eq(h.owner().S.ordersWrath.ownTurnGeneration,1);eq(h.runtime.info(h.capture()).generation,1);h.trace.length=0;eq(h.runtime.resolveDamage(h.capture(),id).committed,true);eq(h.specs[0].spec.dmg,'2d8');eq(h.specs[0].mode,'crit');eq(h.trace,['before','save','history']);eq(h.create().ok,true);
}
{
 const h=harness({deferred:true}),id=h.prepare(),token=h.capture();eq(h.runtime.resolveDamage(token,id).pending,true);eq(h.runtime.resolveDamage(token,id).reason,'roll-pending');eq(h.runtime.cancel(token),true);eq(h.pending[0](),false);eq(h.owner().S.ordersWrath.pendingHits[0].id,id);eq(h.owner().S.ordersWrath.curse,null);const fresh=h.capture();eq(h.runtime.resolveDamage(fresh,id).ok,true);eq(h.pending[1](),true);eq(h.owner().S.ordersWrath.pendingHits.length,0);eq(h.trace.filter(x=>x==='history').length,1);
}
{
 const h=harness({deferred:true}),id=h.prepare();h.trace.length=0;h.runtime.resolveDamage(h.capture(),id);h.runtime.resolveDamage(h.capture(),id);eq(h.pending[0](),true);eq(h.pending[1](),false);eq(h.trace.filter(x=>x==='before').length,1);eq(h.trace.filter(x=>x==='history').length,1);eq(h.owner().S.ordersWrath.pendingHits.length,0);
}
for(const mutate of [h=>h.root.active=false,h=>h.setOwner({...h.owner(),C:{...h.owner().C}}),h=>h.setOwner({...h.owner(),S:{...h.owner().S}}),h=>h.owner().C.name='Other',h=>h.owner().C.cid='other',h=>h.owner().C.id=2,h=>h.owner().C.sub='Life Domain',h=>h.owner().S.used.ordinary=3,h=>h.owner().S.ordersWrath=structuredClone(h.owner().S.ordersWrath),h=>h.owner().S.ordersWrath.pendingHits=structuredClone(h.owner().S.ordersWrath.pendingHits),h=>h.owner().S.sit.used={...h.owner().S.sit.used},h=>h.owner().S.ordersWrath.pendingHits[0].target.label='Different creature',h=>h.owner().S.ordersWrath.pendingHits[0].critical=true,h=>h.turn(),h=>{invalidateOrdersWrathState(h.owner().S);const old=h.owner().S.sit;h.turn();h.owner().S.sit=old}]){
 const h=harness({deferred:true}),id=h.prepare();h.trace.length=0;h.runtime.resolveDamage(h.capture(),id);mutate(h);eq(h.pending[0](),false);eq(h.trace.filter(x=>x==='history').length,0);eq(h.trace.filter(x=>x==='before').length,0);
}
{
 const h=harness({deferred:true}),id=h.prepare();h.runtime.resolveDamage(h.capture(),id);h.turn();eq(h.pending[0](),false);const original=h.owner().S.ordersWrath.pendingHits[0];eq(original.id,id);h.owner().C={...h.owner().C,cls:'Fighter',sub:'Champion',level:20};delete h.owner().C.divineStrike;delete h.owner().C.ordersWrath;h.setProfile(null);eq(h.runtime.info(h.capture()).profile,null);eq(h.runtime.resolveDamage(h.capture(),id).ok,true);eq(h.pending[1](),true);eq(h.owner().S.ordersWrath.pendingHits.length,0);
}
for(const accepted of [false,Promise.resolve(true)]){const h=harness(),id=h.prepare(),before=JSON.stringify(h.owner());h.trace.length=0;h.setBefore(()=>accepted);eq(h.runtime.resolveDamage(h.capture(),id).ok,false);eq(JSON.stringify(h.owner()),before);eq(h.trace.includes('history'),false);eq(h.trace.includes('save'),false)}
{
 const h=harness();h.setBefore(()=>{throw Error('denied')});eq(h.create().reason,'commit-failed');eq(h.owner().S.ordersWrath,undefined);eq(h.trace,['before']);
}
{
 const h=harness(),id=h.prepare();h.trace.length=0;h.setBefore(()=>{h.root.active=false});eq(h.runtime.resolveDamage(h.capture(),id).ok,false);eq(h.owner().S.ordersWrath.pendingHits[0].id,id);eq(h.trace.includes('history'),false);
}
{
 const h=harness();h.create();const before=JSON.stringify(h.owner());eq(h.runtime.myNextTurn(h.capture(),{myNextTurnStarts:true},()=>{}).reason,'native-turn-reset-failed');eq(JSON.stringify(h.owner()),before);eq(h.runtime.myNextTurn(h.capture(),{myNextTurnStarts:false},()=>{}).ok,false);eq(h.runtime.myNextTurn(h.capture(),{myNextTurnStarts:true},null).ok,false);
}
{
 const h=harness(),id=h.prepare();h.setSave(()=>{throw Error('storage')});let reply;eq(h.runtime.resolveDamage(h.capture(),id,x=>reply=x).committed,true);eq(reply.warning,'save-failed');eq(h.owner().S.ordersWrath.pendingHits.length,0);eq(h.trace.filter(x=>x==='history').length,1);
}
for(const missing of ['ordersWrath','divineStrike']){const h=harness();if(missing==='ordersWrath')h.setProfile(null);else delete h.owner().C.divineStrike;eq(h.create().ok,false);eq(h.owner().S.ordersWrath,undefined)}
for(const state of [null,{v:99,opaque:{preserved:true}},{v:1,nextId:1}]){const h=harness();h.owner().S.ordersWrath=state;const before=JSON.stringify(h.owner());eq(h.capture(),null);eq(JSON.stringify(h.owner()),before)}
{
 const h=harness();h.owner().S.sit.used['divine-strike']=1;const receipt={ok:true,committed:true,character:h.owner().C,state:h.owner().S,owner:'Actor',generation:0,useKey:'divine-strike',profile:{normalDice:'2d8',type:'Psychic',useKey:'divine-strike',generation:0},result:{v:8}};eq(h.create({...hit,damageDealt:99},receipt).ok,true);
}
for(const bad of [r=>({...r,owner:'Other'}),r=>({...r,committed:false}),r=>({...r,generation:1}),r=>({...r,character:{...r.character}}),r=>JSON.parse(JSON.stringify(r))]){const h=harness();h.owner().S.sit.used['divine-strike']=1;const receipt={ok:true,committed:true,character:h.owner().C,state:h.owner().S,owner:'Actor',generation:0,useKey:'divine-strike',profile:{normalDice:'2d8',useKey:'divine-strike',generation:0},result:{v:8}};eq(h.create(hit,bad(receipt)).reason,'stale-divine-strike-receipt');eq(h.owner().S.ordersWrath,undefined)}
for(const kind of ['different-refs','shared-state','same-objects']){
 const h=harness();h.create();const original=h.owner(),oldEffect=JSON.stringify(original.S.ordersWrath),token=h.capture();let foreign;
 const result=h.runtime.myNextTurn(token,{myNextTurnStarts:true},()=>{if(kind==='different-refs'){foreign={C:{name:'Foreign',cid:'other',id:2},S:{hp:99,notes:{foreign:'keep'}}};h.setOwner(foreign)}else if(kind==='shared-state'){foreign={C:{...original.C,name:'Foreign',cid:'other'},S:original.S};original.S.hp=99;original.S.notes={foreign:'keep'};h.setOwner(foreign)}else{original.C.name='Foreign';original.C.cid='other';original.S.hp=99;original.S.notes={foreign:'keep'};foreign=original}});
 eq(result.ok,false);eq(h.owner(),foreign);eq(foreign.S.hp,99);eq(foreign.S.notes.foreign,'keep');eq(JSON.stringify(original.S.ordersWrath),oldEffect);eq(original.S.sit.used['orders-wrath'],1);
}
{
 const h=harness();h.create();const original=h.owner(),effect=JSON.stringify(original.S.ordersWrath);eq(h.runtime.myNextTurn(h.capture(),{myNextTurnStarts:true},()=>{original.S.hp=27;original.S.notes={legitimate:'keep'};throw Error('callback failed')}).reason,'native-turn-reset-failed');eq(original.S.hp,27);eq(original.S.notes.legitimate,'keep');eq(JSON.stringify(original.S.ordersWrath),effect);
}
{
 const h=harness();h.create();const owner=h.owner();eq(h.runtime.myNextTurn(h.capture(),{myNextTurnStarts:true},()=>{owner.S.hp=27;delete owner.S.sit.used['orders-wrath'];h.turn()}).ok,true);eq(owner.S.hp,27);eq(owner.S.ordersWrath.curse,null);
}
{
 const h=harness(),first=h.prepare();delete h.owner().S.sit.used['orders-wrath'];invalidateOrdersWrathState(h.owner().S);eq(h.create({...hit,targetLabel:'Second creature'}).ok,true);eq(h.owner().S.ordersWrath.curse.id,'ow-2');eq(h.owner().S.ordersWrath.pendingHits[0].id,first);eq(h.ally().ok,true);eq(h.owner().S.ordersWrath.pendingHits.length,2);for(const event of [...h.owner().S.ordersWrath.pendingHits])eq(h.runtime.resolveDamage(h.capture(),event.id).committed,true);eq(h.trace.filter(x=>x==='history').length,2);
}
for(const mutate of [h=>delete h.owner().C.divineStrike,h=>h.owner().C.divineStrike.source.pre='m0:',h=>h.owner().C.divineStrike.rule.types=['Poison']]){const h=harness();mutate(h);eq(h.runtime.info(h.capture()).activeDivineStrike,null);eq(h.create().ok,false)}
{
 const h=harness(),id=h.prepare();eq(h.runtime.resolveDamage(h.capture(),id,()=>{throw Error('view callback')}).committed,true);eq(h.trace.filter(x=>x==='history').length,1);eq(h.owner().S.ordersWrath.pendingHits.length,0);
}
for(const resolve of [true,false]){
 const h=harness();h.create();const owner=h.owner(),oldId=owner.S.ordersWrath.curse.id;owner.C={name:'Actor',cid:'actor-1',id:1,cls:'Fighter',sub:'Champion',level:20};delete owner.C.ordersWrath;delete owner.C.divineStrike;h.setProfile(null);owner.S.cond={Unconscious:true};eq(h.runtime.info(h.capture()).profile,null);eq(h.runtime.info(h.capture()).state.curse.id,oldId);eq(h.create().ok,false);if(resolve){eq(h.ally().ok,true);const id=owner.S.ordersWrath.pendingHits[0].id;eq(h.ownTurn().ok,true);eq(owner.S.ordersWrath.pendingHits[0].id,id);eq(h.runtime.resolveDamage(h.capture(),id).committed,true);eq(owner.S.ordersWrath.pendingHits.length,0)}else{eq(h.ownTurn().ok,true);eq(owner.S.ordersWrath.curse,null)}eq(owner.S.hp,12);
}
console.log(checks+' Order’s Wrath owned runtime/lifecycle/dice checks PASS');
