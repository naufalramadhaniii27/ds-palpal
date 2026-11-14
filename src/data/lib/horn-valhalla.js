/* Horn of Valhalla NPC rosters retain their source profile and activation facts.
   Native physical ownership and the sole S.used budget are host-validated. */
const own=(o,k)=>o!=null&&Object.prototype.hasOwnProperty.call(o,k),obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o),exact=(o,keys)=>obj(o)&&Reflect.ownKeys(o).length===keys.length&&keys.every(k=>own(o,k)),dense=a=>Array.isArray(a)&&Reflect.ownKeys(a).length===a.length+1&&Object.keys(a).every((k,i)=>k===String(i)),int=(v,a,b)=>Number.isSafeInteger(v)&&v>=a&&v<=b,clone=structuredClone,fail=reason=>({ok:false,reason});
const METALS=['silver','brass','bronze','iron'];
const CONDITIONS=['Blinded','Charmed','Deafened','Frightened','Grappled','Incapacitated','Invisible','Paralyzed','Petrified','Poisoned','Prone','Restrained','Stunned','Unconscious'];
export function canonicalHornDefinition(o){if(Array.isArray(o))return '['+o.map(canonicalHornDefinition).join(',')+']';if(obj(o))return '{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+canonicalHornDefinition(o[k])).join(',')+'}';return JSON.stringify(o);}
export function createHornValhalla(){return {v:1,nextPhysical:1,nextActivation:1,nextEntity:1,physical:[],activations:[],entities:[],resetEvents:[]};}
const profile=p=>['current','legacy'].includes(p.profile)&&METALS.includes(p.metal)&&typeof p.key==='string'&&!!p.key;
const budgetOK=(b,key)=>exact(b,['key','used','max'])&&b.key===key&&int(b.used,0,1)&&b.max===1;
const idOK=(id,prefix)=>typeof id==='string'&&new RegExp('^'+prefix+'[1-9]\\d*$').test(id)&&Number.isSafeInteger(Number(id.slice(prefix.length)));
export function hornProficiencyDisposition(metal,profs){
 if(!METALS.includes(metal)||!exact(profs,['weapons','armor'])||typeof profs.weapons!=='string'||typeof profs.armor!=='string')return null;
 const tokens=s=>s.split(',').map(t=>t.trim());
 const qualified=metal==='silver'||(metal==='brass'?tokens(profs.weapons).includes('Simple'):metal==='iron'?tokens(profs.weapons).includes('Martial'):tokens(profs.armor).includes('Medium'));
 return qualified?'friendly':'hostile';
}
function receiptOK(r,p){
 if(!exact(r,['logicalName','nativeName','source','maxHP','definitionFingerprint','definition'])||r.logicalName!=='Berserker'||r.maxHP!==67||!obj(r.definition))return false;
 const source=p.profile==='current'?'core':'mm14',name='Berserker'+(source==='mm14'?' (MM)':'');
 if(r.source!==source||r.nativeName!==name||r.definition.n!==name||r.definition.s!==source||r.definitionFingerprint!==canonicalHornDefinition(r.definition))return false;
 const hp=Array.isArray(r.definition.tl)?r.definition.tl.filter(x=>Array.isArray(x)&&x[0]==='HP'):[];
 return hp.length===1&&/^67(?:\s*\([^\n]*\))?$/.test(hp[0][1]);
}
function countFor(p,dice){const count=METALS.indexOf(p.metal)+2;if(p.profile==='current')return dense(dice)&&dice.length===0?count:null;return dense(dice)&&dice.length===count&&dice.every(d=>int(d,1,4))?dice.reduce((a,b)=>a+b,count):null;}
export function hornValhallaProblems(s){
 if(!exact(s,['v','nextPhysical','nextActivation','nextEntity','physical','activations','entities','resetEvents'])||s.v!==1||![s.nextPhysical,s.nextActivation,s.nextEntity].every(n=>int(n,1,Number.MAX_SAFE_INTEGER))||![s.physical,s.activations,s.entities,s.resetEvents].every(dense))return ['unsupported-state'];
 const physical=new Set(),keys=new Set(),activations=new Set(),entities=new Set();
 for(const p of s.physical){if(!exact(p,['id','profile','metal','key','present','historyKnown'])||!idOK(p.id,'hvp-')||Number(p.id.slice(4))>=s.nextPhysical||physical.has(p.id)||!profile(p)||keys.has(p.key)||typeof p.present!=='boolean'||typeof p.historyKnown!=='boolean')return ['invalid-physical'];physical.add(p.id);keys.add(p.key);}
 for(const a of s.activations){const p=obj(a)?s.physical.find(x=>x.id===a.physicalId):null;if(!exact(a,['id','physicalId','profs','disposition','dice','count','creature','hourEnded'])||!idOK(a.id,'hva-')||Number(a.id.slice(4))>=s.nextActivation||activations.has(a.id)||!p||hornProficiencyDisposition(p.metal,a.profs)!==a.disposition||!['friendly','hostile'].includes(a.disposition)||countFor(p,a.dice)!==a.count||!receiptOK(a.creature,p)||typeof a.hourEnded!=='boolean')return ['invalid-activation'];activations.add(a.id);}
 for(const e of s.entities){const a=obj(e)?s.activations.find(x=>x.id===e.activationId):null,p=a?s.physical.find(x=>x.id===a.physicalId):null;if(!exact(e,['id','activationId','hp','active','endReason','conditions'])||!idOK(e.id,'hve-')||Number(e.id.slice(4))>=s.nextEntity||entities.has(e.id)||!a||!int(e.hp,0,67)||typeof e.active!=='boolean'||(e.active?(e.hp===0||e.endReason!==null||a.hourEnded):!['zero-hp','one-hour'].includes(e.endReason))||(e.endReason==='zero-hp'&&e.hp!==0)||!dense(e.conditions)||new Set(e.conditions).size!==e.conditions.length||e.conditions.some(c=>!CONDITIONS.includes(c)||p.profile==='current'&&['Charmed','Frightened'].includes(c)))return ['invalid-entity'];entities.add(e.id);}
 if(s.activations.some(a=>s.entities.filter(e=>e.activationId===a.id).length!==a.count))return ['invalid-roster'];
 if(new Set(s.resetEvents).size!==s.resetEvents.length||s.resetEvents.some(x=>typeof x!=='string'||!x.trim()))return ['invalid-reset-history'];return [];
}
export function adoptHornValhalla(s,p,budget,facts){
 if(hornValhallaProblems(s).length)return fail('unsupported-state');if(!obj(p)||!profile(p)||!budgetOK(budget,p.key)||facts?.actualPhysicalIdentityVerified!==true)return fail('physical-history-required');if(s.physical.some(x=>x.key===p.key))return fail('budget-already-bound');
 const state=clone(s),id='hvp-'+state.nextPhysical++;state.physical.push({id,profile:p.profile,metal:p.metal,key:p.key,present:true,historyKnown:budget.used===1});return {ok:true,state,id};
}
export function reviewHornValhallaHistory(s,id,budget,facts){
 if(hornValhallaProblems(s).length)return fail('unsupported-state');const p=s.physical.find(x=>x.id===id);if(!p||!budgetOK(budget,p.key)||p.historyKnown||facts?.actualSevenDayUseHistoryVerified!==true||!int(facts.used,0,1))return fail('actual-history-required');const state=clone(s);state.physical.find(x=>x.id===id).historyKnown=true;return {ok:true,state,budget:{key:p.key,max:1,used:facts.used}};
}
export function planHornValhallaSummon(s,id,budget,creature,profs,facts){
 if(hornValhallaProblems(s).length)return fail('unsupported-state');const p=s.physical.find(x=>x.id===id);if(!p||!p.present||!p.historyKnown)return fail('physical-history-required');if(!budgetOK(budget,p.key)||budget.used!==0)return fail('native-use-unavailable');
 const count=countFor(p,facts?.dice),disposition=hornProficiencyDisposition(p.metal,profs);if(count===null||!disposition||!receiptOK(creature,p)||facts?.actualPhysicalAccessVerified!==true||facts?.actualActivationCompleted!==true)return fail('qualified-activation-required');
 const state=clone(s),activationId='hva-'+state.nextActivation++;state.activations.push({id:activationId,physicalId:id,profs:clone(profs),disposition,dice:clone(facts.dice),count,creature:clone(creature),hourEnded:false});
 for(let i=0;i<count;i++)state.entities.push({id:'hve-'+state.nextEntity++,activationId,hp:67,active:true,endReason:null,conditions:[]});return {ok:true,state,activationId,budget:{key:p.key,used:1,max:1}};
}
export function changeHornValhallaHP(s,id,kind,amount){
 if(hornValhallaProblems(s).length)return fail('unsupported-state');const e=s.entities.find(x=>x.id===id);if(!e||!e.active||!['damage','healing'].includes(kind)||!int(amount,1,100000))return fail('active-entity-and-actual-amount-required');const hp=Math.max(0,Math.min(67,e.hp+(kind==='damage'?-amount:amount)));if(hp===e.hp)return fail('no-change');const state=clone(s),next=state.entities.find(x=>x.id===id);next.hp=hp;if(hp===0){next.active=false;next.endReason='zero-hp';}return {ok:true,state};
}
export function changeHornValhallaCondition(s,id,condition,present){
 if(hornValhallaProblems(s).length)return fail('unsupported-state');const e=s.entities.find(x=>x.id===id);if(!e||!e.active||!CONDITIONS.includes(condition)||typeof present!=='boolean')return fail('active-entity-and-condition-required');const a=s.activations.find(x=>x.id===e.activationId),p=s.physical.find(x=>x.id===a.physicalId);if(present&&p.profile==='current'&&['Charmed','Frightened'].includes(condition))return fail('entity-condition-immunity');if(e.conditions.includes(condition)===present)return fail('no-change');const state=clone(s),next=state.entities.find(x=>x.id===id);next.conditions=present?[...next.conditions,condition]:next.conditions.filter(x=>x!==condition);return {ok:true,state};
}
function endHour(state,activationId){state.activations.find(x=>x.id===activationId).hourEnded=true;for(const e of state.entities)if(e.activationId===activationId&&e.active){e.active=false;e.endReason='one-hour';}}
export function recordHornValhallaHour(s,id,facts){if(hornValhallaProblems(s).length)return fail('unsupported-state');const a=s.activations.find(x=>x.id===id);if(!a||a.hourEnded||facts?.actualOneHourSinceActivationPassed!==true)return fail('actual-hour-required');const state=clone(s);endHour(state,id);return {ok:true,state};}
export function recordHornValhallaSevenDays(s,id,budget,facts){
 if(hornValhallaProblems(s).length)return fail('unsupported-state');const p=s.physical.find(x=>x.id===id);if(!p||!budgetOK(budget,p.key)||facts?.actualSevenDaysSinceLastUsePassed!==true||typeof facts.eventId!=='string'||!facts.eventId.trim()||s.resetEvents.includes(facts.eventId))return fail('actual-seven-days-required');
 const state=clone(s);state.resetEvents.push(facts.eventId);state.physical.find(x=>x.id===id).historyKnown=true;for(const a of state.activations)if(a.physicalId===id&&!a.hourEnded)endHour(state,a.id);return {ok:true,state,budget:{key:p.key,used:0,max:1}};
}
export function setHornValhallaPresence(s,id,present,facts={}){if(hornValhallaProblems(s).length)return fail('unsupported-state');const p=s.physical.find(x=>x.id===id);if(!p||typeof present!=='boolean'||p.present===present)return fail('no-change');if(present&&facts.actualPhysicalCopyReturned!==true)return fail('actual-return-required');const state=clone(s);state.physical.find(x=>x.id===id).present=present;return {ok:true,state};}
