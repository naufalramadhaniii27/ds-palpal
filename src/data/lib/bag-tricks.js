/* Bag of Tricks retained entities. Host establishes native physical/source ownership;
   the existing S.used resource remains the only draw budget. */
const TABLES={gray:['Weasel','Giant Rat','Badger','Boar','Panther','Giant Badger','Dire Wolf','Giant Elk'],rust:['Rat','Owl','Mastiff','Goat','Giant Goat','Giant Boar','Lion','Brown Bear'],tan:['Jackal','Ape','Baboon','Axe Beak','Black Bear','Giant Weasel','Giant Hyena','Tiger']};
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const obj=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const int=(n,min,max)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
const clone=o=>JSON.parse(JSON.stringify(o));
const exact=(o,keys)=>obj(o)&&Reflect.ownKeys(o).length===keys.length&&keys.every(k=>own(o,k));
const dense=a=>Array.isArray(a)&&Reflect.ownKeys(a).length===a.length+1&&Object.keys(a).every((k,i)=>k===String(i));
export function canonicalBagDefinition(o){if(Array.isArray(o))return '['+o.map(canonicalBagDefinition).join(',')+']';if(obj(o))return '{'+Object.keys(o).sort().map(k=>JSON.stringify(k)+':'+canonicalBagDefinition(o[k])).join(',')+'}';return JSON.stringify(o);}
export function createBagTricks(){return {v:1,nextPhysical:1,nextEntity:1,physical:[],entities:[],dawnEvents:[]};}
function budgetOK(b,key){return obj(b)&&b.key===key&&b.max===3&&int(b.used,0,3);}
function profileOK(p){return ['current','legacy'].includes(p.profile)&&own(TABLES,p.color)&&typeof p.key==='string'&&p.key.length>0;}
function receiptOK(r,p,die){
 if(!exact(r,['logicalName','nativeName','source','maxHP','definitionFingerprint','definition'])||!int(die,1,8))return false;
 const name=TABLES[p.color][die-1],source=p.profile==='current'?'core':'mm14',nativeName=name+(source==='mm14'?' (MM)':'');
 if(r.logicalName!==name||r.nativeName!==nativeName||r.source!==source||!int(r.maxHP,1,100000)||!obj(r.definition))return false;
 if(r.definition.n!==nativeName||r.definition.s!==source||canonicalBagDefinition(r.definition)!==r.definitionFingerprint)return false;
 const hp=Array.isArray(r.definition.tl)?r.definition.tl.filter(x=>Array.isArray(x)&&x[0]==='HP'):[];
 if(hp.length!==1||typeof hp[0][1]!=='string')return false;
 const match=/^([1-9]\d*)(?:\s*\([^\n]*\))?$/.exec(hp[0][1]);
 return !!match&&Number(match[1])===r.maxHP;
}
export function bagTricksProblems(s){
 const errors=[];
 if(!exact(s,['v','nextPhysical','nextEntity','physical','entities','dawnEvents'])||s.v!==1||!int(s.nextPhysical,1,Number.MAX_SAFE_INTEGER)||!int(s.nextEntity,1,Number.MAX_SAFE_INTEGER)||!dense(s.physical)||!dense(s.entities)||!dense(s.dawnEvents))return ['unsupported-state'];
 const ids=new Set(),keys=new Set(),entityIds=new Set();
 for(const p of s.physical){if(!exact(p,['id','profile','color','key','present','historyKnown'])||typeof p.id!=='string'||!/^btp-[1-9]\d*$/.test(p.id)||!Number.isSafeInteger(Number(p.id.slice(4)))||ids.has(p.id)||!profileOK(p)||keys.has(p.key)||typeof p.present!=='boolean'||typeof p.historyKnown!=='boolean')errors.push('invalid-physical');else{ids.add(p.id);keys.add(p.key);}}
 for(const e of s.entities){const p=obj(e)?s.physical.find(x=>obj(x)&&x.id===e.physicalId):null;if(!exact(e,['id','physicalId','die','creature','hp','active','endReason'])||!p||typeof e.id!=='string'||!/^bte-[1-9]\d*$/.test(e.id)||!Number.isSafeInteger(Number(e.id.slice(4)))||entityIds.has(e.id)||!receiptOK(e.creature,p,e.die)||!int(e.hp,0,e.creature.maxHP)||typeof e.active!=='boolean'||(e.active?(e.hp===0||e.endReason!==null):!['zero-hp','next-dawn'].includes(e.endReason))||(e.endReason==='zero-hp'&&e.hp!==0))errors.push('invalid-entity');else entityIds.add(e.id);}
 if(new Set(s.dawnEvents).size!==s.dawnEvents.length||s.dawnEvents.some(x=>typeof x!=='string'||!x.trim()))errors.push('invalid-dawn-history');
 if(s.physical.some(p=>obj(p)&&typeof p.id==='string'&&Number(p.id.slice(4))>=s.nextPhysical)||s.entities.some(e=>obj(e)&&typeof e.id==='string'&&Number(e.id.slice(4))>=s.nextEntity))errors.push('invalid-sequence');
 return errors;
}
const fail=reason=>({ok:false,reason});
function checked(s){return bagTricksProblems(s).length===0;}
export function adoptBagTricks(s,profile,budget,facts){
 if(!checked(s))return fail('unsupported-state');
 if(!obj(profile)||!profileOK(profile)||!budgetOK(budget,profile.key)||facts?.actualPhysicalIdentityVerified!==true)return fail('physical-history-required');
 if(s.physical.some(p=>p.key===profile.key))return fail('budget-already-bound');
 const state=clone(s),id='btp-'+state.nextPhysical++;
 state.physical.push({id,profile:profile.profile,color:profile.color,key:profile.key,present:true,historyKnown:budget.used===3});
 return {ok:true,state,id};
}
export function reviewBagTricksHistory(s,id,budget,facts){
 if(!checked(s))return fail('unsupported-state');
 const p=s.physical.find(x=>x.id===id);
 if(!p||!budgetOK(budget,p.key)||facts?.actualDawnHistoryVerified!==true||!int(facts.used,0,3))return fail('actual-history-required');
 if(p.historyKnown)return fail('history-already-established');
 const state=clone(s);state.physical.find(x=>x.id===id).historyKnown=true;
 return {ok:true,state,budget:{key:p.key,used:facts.used,max:3}};
}
export function planBagTricksDraw(s,id,budget,creature,facts){
 if(!checked(s))return fail('unsupported-state');
 const p=s.physical.find(x=>x.id===id);
 if(!p||!p.present||!p.historyKnown)return fail('physical-history-required');
 if(!budgetOK(budget,p.key)||budget.used>=3)return fail('no-native-draw-remaining');
 if(facts?.actualActionCompleted!==true||facts?.actualLandingWithin20Feet!==true||!receiptOK(creature,p,facts.die))return fail('qualified-draw-required');
 const state=clone(s),entityId='bte-'+state.nextEntity++;
 state.entities.push({id:entityId,physicalId:id,die:facts.die,creature:clone(creature),hp:creature.maxHP,active:true,endReason:null});
 return {ok:true,state,entityId,budget:{key:p.key,used:budget.used+1,max:3}};
}
export function changeBagTricksHP(s,id,kind,amount){
 if(!checked(s))return fail('unsupported-state');
 const e=s.entities.find(x=>x.id===id);
 if(!e||!e.active||!['damage','healing'].includes(kind)||!int(amount,1,100000))return fail('active-entity-and-actual-amount-required');
 const state=clone(s),next=state.entities.find(x=>x.id===id);
 next.hp=Math.max(0,Math.min(next.creature.maxHP,next.hp+(kind==='damage'?-amount:amount)));
 if(next.hp===e.hp)return fail('no-change');
 if(next.hp===0){next.active=false;next.endReason='zero-hp';}
 return {ok:true,state};
}
export function recordBagTricksDawn(s,facts){
 if(!checked(s))return fail('unsupported-state');
 if(facts?.actualNextDawnOccurred!==true||typeof facts.eventId!=='string'||!facts.eventId.trim())return fail('actual-next-dawn-required');
 if(s.dawnEvents.includes(facts.eventId))return fail('dawn-already-recorded');
 const state=clone(s);state.dawnEvents.push(facts.eventId);
 for(const e of state.entities)if(e.active){e.active=false;e.endReason='next-dawn';}
 for(const p of state.physical)p.historyKnown=true;
 return {ok:true,state,budgets:state.physical.map(p=>({key:p.key,used:0,max:3}))};
}
export function setBagTricksPresence(s,id,present,facts={}){
 if(!checked(s))return fail('unsupported-state');
 const p=s.physical.find(x=>x.id===id);
 if(!p||typeof present!=='boolean'||p.present===present)return fail('no-change');
 if(present&&facts.actualPhysicalCopyReturned!==true)return fail('actual-return-required');
 const state=clone(s);state.physical.find(x=>x.id===id).present=present;
 return {ok:true,state};
}
