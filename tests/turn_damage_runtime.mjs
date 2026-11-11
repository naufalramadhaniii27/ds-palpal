import assert from 'node:assert/strict';
import {createTurnDamageRuntime,invalidateTurnDamageState} from '../src/app/lib/turn-damage-runtime.js';
import {divineStrikeProfile,advanceTurnDamageGeneration} from '../src/data/lib/turn-damage.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};const facts={weaponAttack:true,hit:true,targetCreature:true,ownTurn:true,critical:false};
function harness({deferred=false,domain='Life Domain (2014)',level=8,sit}={}){let owner={C:{name:'Actor',cid:'actor-1',id:1,cls:'Cleric',level,inv:[{n:'Mace',q:1,eq:true}],attacks:[{n:'Mace',type:'Bludgeoning'}]},S:{hp:10,used:{other:2}}};if(sit!==undefined)owner.S.sit=sit;let rule=divineStrikeProfile(domain,level),status={available:true,weaponAttack:true},before=()=>undefined;const root={active:true},trace=[],pending=[],specs=[];
 const dice={commitHook:1,roll(spec,mode,label,callback,guard,commit){specs.push({spec,mode,label});const finish=()=>{if(!guard())return null;const result={v:mode==='crit'?12:6,k:'dmg',l:label};if(!guard()||commit(result)!==true)return null;trace.push('history');callback(result);return result};if(!guard())return null;if(deferred){pending.push(finish);return null}return finish()}};
 const runtime=createTurnDamageRuntime({getActor:()=>owner,getRule:()=>rule,getAttackStatus:()=>status,rootActive:node=>node.active===true,getDice:()=>dice,beforeCommit:()=>{trace.push('before');return before()},save:()=>trace.push('save')});
 return {runtime,root,dice,trace,specs,pending,owner:()=>owner,rule:()=>rule,status:()=>status,setOwner:value=>owner=value,setRule:value=>rule=value,setStatus:value=>status=value,setBefore:fn=>before=fn,capture:()=>runtime.capture(0,root),turn(){invalidateTurnDamageState(owner.S);const next=advanceTurnDamageGeneration(owner.S.sit);owner.S.sit=next.sit;if(owner.S.sit.used)delete owner.S.sit.used['divine-strike']}}}
{
 const h=harness(),token=h.capture(),before=JSON.stringify(h.owner());eq(!!token,true);eq(h.runtime.inspect(token,facts).normalDice,'1d8');eq(JSON.stringify(h.owner()),before);let reply;const result=h.runtime.request(token,facts,value=>reply=value);eq(result.committed,true);eq(h.owner().S.sit.used['divine-strike'],1);eq(h.owner().S.used.other,2);eq(h.owner().S.hp,10);eq(h.trace,['before','save','history']);eq(reply.character,h.owner().C);eq(reply.state,h.owner().S);eq(reply.useKey,'divine-strike');eq(h.runtime.request(token,facts).ok,false);eq(h.trace.filter(value=>value==='history').length,1);
}
for(const [level,dice] of [[8,'1d8'],[13,'1d8'],[14,'2d8']]){const h=harness({level}),token=h.capture();h.runtime.request(token,{...facts,critical:true});eq(h.specs[0].spec.dmg,dice);eq(h.specs[0].mode,'crit');eq(h.specs[0].spec.dtype,'Radiant')}
for(const bad of [{hit:false},{weaponAttack:false},{targetCreature:'true'},{ownTurn:'yes'},{critical:undefined},{unknown:true}]){const h=harness(),token=h.capture(),before=JSON.stringify(h.owner());eq(h.runtime.request(token,{...facts,...bad}).ok,false);eq(h.trace,[]);eq(JSON.stringify(h.owner()),before)}
{
 const h=harness({domain:'Nature Domain'}),token=h.capture();eq(h.runtime.request(token,facts).ok,false);eq(h.runtime.request(token,{...facts,selectedType:'Fire'}).committed,true);eq(h.specs[0].spec.dtype,'Fire');
}
{
 const h=harness({domain:'Hunting Domain'});h.owner().C.attacks[0].type='Piercing';const token=h.capture();eq(h.runtime.request(token,{...facts,weaponType:'Piercing',ownTurn:false}).reason,'own-turn-required');eq(h.runtime.request(token,{...facts,weaponType:'Piercing'}).committed,true);eq(h.specs[0].spec.dtype,'Piercing');
}
{
 const h=harness(),token=h.capture();eq(h.runtime.request(token,{...facts,ownTurn:false}).committed,true);
}
for(const accepted of [false,Promise.resolve(true)]){const h=harness(),token=h.capture(),before=JSON.stringify(h.owner());h.setBefore(()=>accepted);eq(h.runtime.request(token,facts).ok,false);eq(h.trace.includes('history'),false);eq(h.trace.includes('save'),false);eq(JSON.stringify(h.owner()),before)}
{
 const h=harness(),token=h.capture(),before=JSON.stringify(h.owner());h.setBefore(()=>{throw Error('no commit')});eq(h.runtime.request(token,facts).ok,false);eq(JSON.stringify(h.owner()),before);eq(h.trace.includes('history'),false);
}
for(const mutate of [h=>h.setOwner({...h.owner(),C:{...h.owner().C}}),h=>h.setOwner({...h.owner(),S:{...h.owner().S}}),h=>h.owner().C.cid='other',h=>h.owner().C.id=2,h=>h.owner().C.name='Other',h=>h.owner().C.attacks[0]={...h.owner().C.attacks[0]},h=>h.owner().C.inv[0].eq=false,h=>h.setRule(divineStrikeProfile('War Domain (2014)',8)),h=>h.setStatus({available:false,weaponAttack:true}),h=>h.root.active=false,h=>h.turn()]){const h=harness({deferred:true}),token=h.capture();let replies=0;eq(h.runtime.request(token,facts,()=>replies++).pending,true);mutate(h);h.pending[0]();eq(h.trace.includes('history'),false);eq(h.trace.includes('before'),false);eq(h.owner().S.sit?.used?.['divine-strike'],undefined);eq(replies<=1,true)}
// A new turn followed by Undo can restore an absent generation before the guard runs; shared invalidation still denies it.
{
 const h=harness({deferred:true}),token=h.capture();h.runtime.request(token,facts);h.turn();delete h.owner().S.sit;h.pending[0]();eq(h.trace.includes('history'),false);eq(h.owner().S.sit,undefined);
}
{
 const h=harness({deferred:true,sit:{turn:{v:1,generation:4},used:{}}}),token=h.capture(),old=h.owner().S.sit;h.runtime.request(token,facts);h.turn();h.owner().S.sit=structuredClone(old);h.pending[0]();eq(h.trace.includes('history'),false);
}
{
 const h=harness({deferred:true}),one=h.capture(),two=h.capture();h.runtime.request(one,facts);eq(h.runtime.request(one,facts).reason,'roll-pending');h.runtime.request(two,facts);h.pending[0]();h.pending[1]();eq(h.trace.filter(value=>value==='history').length,1);eq(h.trace.filter(value=>value==='before').length,1);eq(h.owner().S.sit.used['divine-strike'],1);
}
{
 const h=harness(),token=h.capture();h.runtime.request(token,facts);h.turn();eq(h.runtime.request(h.capture(),facts).committed,true);eq(h.owner().S.sit.turn.generation,1);eq(h.trace.filter(value=>value==='history').length,2);
}
for(const sit of [null,[],{turn:{v:2,generation:0}},{turn:{v:1,generation:-1}},{used:{'divine-strike':2}}]){const h=harness({sit});eq(h.capture(),null)}
{
 const h=harness({deferred:true}),token=h.capture();h.runtime.request(token,facts);eq(h.runtime.cancel(token),true);h.pending[0]();eq(h.trace.includes('history'),false);eq(h.owner().S.sit,undefined);
}
{
 const h=harness(),token=h.capture();delete h.dice.commitHook;eq(h.runtime.request(token,facts).reason,'dice-transaction-unavailable');eq(h.trace,[]);h.setStatus({available:true,weaponAttack:false});eq(h.capture(),null);h.setStatus({available:true,weaponAttack:null});h.dice.commitHook=1;eq(h.runtime.request(h.capture(),facts).committed,true);
}
{
 const h=harness(),token=h.capture(),snapshot=JSON.stringify(h.owner());h.setBefore(()=>{h.root.active=false});eq(h.runtime.request(token,facts).ok,false);eq(h.trace.includes('history'),false);eq(JSON.stringify(h.owner()),snapshot);
}
{
 const h=harness({domain:'Hunting Domain'}),token=h.capture();eq(h.runtime.inspect(token,facts).type,'Bludgeoning');eq(h.runtime.request(token,{...facts,weaponType:'Fire'}).reason,'weapon-type-mismatch');eq(h.trace,[]);eq(h.runtime.request(token,facts).committed,true);eq(h.specs[0].spec.dtype,'Bludgeoning');
}
// A live provider's canonical base packet type outranks a stale raw row type.
{
 const h=harness({domain:'Hunting Domain'});h.setStatus({available:true,weaponAttack:true,weaponType:'Fire'});const token=h.capture();eq(h.owner().C.attacks[0].type,'Bludgeoning');eq(h.runtime.inspect(token,facts).type,'Fire');eq(h.runtime.request(token,{...facts,weaponType:'Bludgeoning'}).reason,'weapon-type-mismatch');eq(h.runtime.request(token,facts).committed,true);eq(h.specs[0].spec.dtype,'Fire');
}
{
 const h=harness({domain:'Hunting Domain'});h.setStatus({available:true,weaponAttack:true,weaponType:null});const token=h.capture();eq(h.runtime.inspect(token,facts).reason,'damage-type-required');eq(h.runtime.request(token,{...facts,weaponType:'Piercing'}).committed,true);eq(h.specs[0].spec.dtype,'Piercing');
}
{
 const h=harness({deferred:true,domain:'Hunting Domain'});h.setStatus({available:true,weaponAttack:true,weaponType:'Fire'});const token=h.capture();h.runtime.request(token,facts);h.setStatus({available:true,weaponAttack:true,weaponType:'Cold'});h.pending[0]();eq(h.trace.includes('history'),false);eq(h.owner().S.sit,undefined);
}
for(const weaponType of [undefined,'bad',{},1]){const h=harness();h.setStatus({available:true,weaponAttack:true,weaponType});eq(h.capture(),null)}
{
 const h=harness({deferred:true}),token=h.capture();h.runtime.request(token,facts);h.owner().S.cust={'a:Mace':{do:'1d8 Fire'}};h.pending[0]();eq(h.trace.includes('history'),false);eq(h.owner().S.sit,undefined);
}
{
 const h=harness({deferred:true});h.owner().C.divineStrike={rule:h.rule(),source:{owner:'Life Domain (2014)',level:8}};const token=h.capture();h.runtime.request(token,facts);h.owner().C.divineStrike.source.level=14;h.pending[0]();eq(h.trace.includes('history'),false);eq(h.owner().S.sit,undefined);
}
{
 const h=harness({domain:'Nature Domain'});h.runtime.request(h.capture(),{...facts,selectedType:'Fire'});eq(h.runtime.request(h.capture(),{...facts,selectedType:'Cold',critical:true}).reason,'already-used');h.setRule(divineStrikeProfile('Life Domain (2014)',8));eq(h.runtime.request(h.capture(),facts).reason,'already-used');eq(h.owner().S.sit.used['divine-strike'],1);eq(h.trace.filter(value=>value==='history').length,1);
}
console.log(count+' turn damage runtime transaction checks PASS');
