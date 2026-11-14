/* Physical Traveling component history; its only live budget is the host's native S.used key. */
import {travelGoatProfile,travelGoatCreatureProblems} from './travel-goat-profile.js';
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),integer=(v,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(v)&&v>=0&&v<=max,copy=structuredClone,fail=reason=>({ok:false,reason});
function exact(v,keys){if(!obj(v))return false;const actual=Reflect.ownKeys(v);return actual.length===keys.length&&actual.every(k=>typeof k==='string'&&keys.includes(k)&&Object.getOwnPropertyDescriptor(v,k)?.enumerable===true&&own(Object.getOwnPropertyDescriptor(v,k),'value'))}
function dense(v){return Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&v.every((_,i)=>own(v,i))}
function facts(v,keys){return exact(v,keys)&&keys.every(k=>v[k]===true)}
const BASE=['id','kind','physicalId'],FORMS=['activate','elapsed','hp','revert'];
export function travelGoatBudgetKey(key){const match=typeof key==='string'&&/^i-ivory-goats-traveling(?:-([2-9]|[1-9][0-9]+))?$/.exec(key);return !!match&&(!match[1]||Number.isSafeInteger(Number(match[1])))}
export function createTravelGoat(){return {v:1,nextPhysical:1,nextEvent:1,physical:[],events:[]}}
function physicalValid(p,index){if(!exact(p,['id','profile','itemFingerprint','parentFingerprint','budgetKey','component']))return false;const profile=travelGoatProfile(p.profile);return p.id==='tgp-'+(index+1)&&profile&&p.itemFingerprint===profile.itemFingerprint&&p.parentFingerprint===profile.parentFingerprint&&p.component==='traveling'&&travelGoatBudgetKey(p.budgetKey)}
function structure(s){if(!exact(s,['v','nextPhysical','nextEvent','physical','events'])||s.v!==1||!dense(s.physical)||!dense(s.events)||s.nextPhysical!==s.physical.length+1||s.nextEvent!==s.events.length+1)return 'unsupported-travel-goat-state';if(!s.physical.every(physicalValid)||new Set(s.physical.map(p=>p.budgetKey)).size!==s.physical.length)return 'unsupported-traveling-component';return null}
function charge(p,form,total){const debit=Math.min(24-p.used,Math.max(0,total-form.billed));p.used+=debit;form.billed+=debit;if(p.used===24){form.active=false;form.endReason='charges-exhausted';p.active=null}}
function end(p,form,reason){charge(p,form,Math.max(1,form.completedHours+(form.partialHour?1:0)));form.active=false;form.endReason=reason;p.active=null}
function activate(p,e,index){if(!exact(e,BASE.concat(['formId','creature','facts']))||e.formId!=='tgf-'+(index+1)||p.used===null||p.used===24||p.active||!p.present||travelGoatCreatureProblems(e.creature,p.source.profile).length||!facts(e.facts,['actualSourceActionCompleted','actualClearSpaceWithin60Feet']))return 'actual-traveling-activation-required';const form={id:e.formId,physicalId:e.physicalId,creature:copy(e.creature),hp:e.creature.maxHP,active:true,completedHours:0,partialHour:false,billed:0,endReason:null};p.forms.push(form);p.active=form;return null}
function elapsed(p,e,form){
 if(!exact(e,BASE.concat(['formId','completedHours','partialHour','facts']))||!integer(e.completedHours,Math.floor(Number.MAX_SAFE_INTEGER/2)-1)||typeof e.partialHour!=='boolean'||!facts(e.facts,['actualElapsedTimeVerified']))return 'actual-elapsed-time-required';
 const total=e.completedHours+(e.partialHour?1:0),maximum=form.billed+24-p.used;
 if(total>maximum)return 'elapsed-time-exceeds-traveling-charges';
 const order=e.completedHours*2+(e.partialHour?1:0),old=form.completedHours*2+(form.partialHour?1:0);if(order<=old)return 'elapsed-time-must-advance';
 form.completedHours=e.completedHours;form.partialHour=e.partialHour;charge(p,form,total);return null;
}
function hitPoints(p,e,form){if(!exact(e,BASE.concat(['formId','operation','amount']))||!['damage','healing'].includes(e.operation)||!integer(e.amount)||e.amount===0)return 'actual-npc-hp-change-required';const hp=e.operation==='damage'?Math.max(0,form.hp-e.amount):Math.min(form.creature.maxHP,form.hp+e.amount);if(hp===form.hp)return 'npc-hp-unchanged';form.hp=hp;if(hp===0)end(p,form,'zero-hp');return null}
function recovery(p,e){if(!exact(e,BASE.concat(['eventId','facts']))||p.used!==24||p.active||typeof e.eventId!=='string'||!e.eventId.trim()||p.recoveries.includes(e.eventId)||!facts(e.facts,['actualSevenDaysSinceExhaustionPassed']))return 'actual-seven-day-recovery-required';p.used=0;p.recoveries.push(e.eventId);return null}
function presence(p,e){if(!exact(e,BASE.concat(['present','facts']))||typeof e.present!=='boolean'||p.present===e.present)return 'physical-presence-unchanged';const required=e.present?['actualPhysicalReturned','recordedMagicHistoryUnchanged']:['actualPhysicalRemoved'];if(!facts(e.facts,required))return 'actual-physical-presence-required';p.present=e.present;return null}
function apply(p,e,index){
 if(e.kind==='review'){if(!exact(e,BASE.concat(['initialUsed','facts']))||p.used!==null||!integer(e.initialUsed,24)||!facts(e.facts,['actualTravelChargeHistoryVerified']))return 'actual-charge-history-required';p.used=e.initialUsed;return null}
 if(e.kind==='activate')return activate(p,e,index);
 if(e.kind==='recover')return recovery(p,e);
 if(e.kind==='presence')return presence(p,e);
 const form=p.active;if(!form||e.formId!==form.id||!FORMS.includes(e.kind))return 'active-traveling-form-required';
 if(e.kind==='elapsed')return elapsed(p,e,form);
 if(e.kind==='hp')return hitPoints(p,e,form);
 if(!exact(e,BASE.concat(['formId','facts']))||!facts(e.facts,['actualTouchAndSourceActionCompleted']))return 'actual-touch-and-action-required';end(p,form,'touched-reversion');return null;
}
function replay(s){const problem=structure(s);if(problem)return {problems:[problem]};const physical=new Map(s.physical.map(source=>[source.id,{source,used:null,present:true,active:null,forms:[],recoveries:[]}]));for(let i=0;i<s.events.length;i++){const e=s.events[i];if(!obj(e)||e.id!=='tge-'+(i+1)||typeof e.kind!=='string'||!physical.has(e.physicalId))return {problems:['unsupported-traveling-receipt']};const error=apply(physical.get(e.physicalId),e,i);if(error)return {problems:[error]}}return {problems:[],physical}}
export function travelGoatProblems(s){try{return replay(s).problems}catch(error){return ['unsupported-travel-goat-state']}}
function bound(s,id,budget){try{const r=replay(s),p=r.physical?.get(id);if(r.problems.length||!p||!exact(budget,['key','used','max'])||budget.key!==p.source.budgetKey||budget.max!==24||budget.used!==p.used)return fail('canonical-traveling-budget-required');return {ok:true,p}}catch(error){return fail('unsupported-travel-goat-state')}}
export function travelGoatProjection(s,id,budget){const b=bound(s,id,budget);if(!b.ok)return b;return {ok:true,id,profile:b.p.source.profile,present:b.p.present,reviewRequired:b.p.used===null,remaining:b.p.used===null?null:24-b.p.used,waiting:b.p.used===24,active:b.p.active?copy(b.p.active):null,forms:copy(b.p.forms),recoveries:copy(b.p.recoveries)}}
function append(s,id,budget,event){
 try{
  const b=bound(s,id,budget);if(!b.ok)return b;
  const raw={id:'tge-'+s.nextEvent,kind:event.kind,physicalId:id,...event},problem=apply(b.p,raw,s.events.length);if(problem)return fail(problem);
  const next=copy(s),receipt=copy(raw);next.nextEvent++;next.events.push(receipt);
  const result=replay(next);if(result.problems.length)return fail(result.problems[0]);
  return {ok:true,state:next,budget:{key:budget.key,used:result.physical.get(id).used,max:24},receipt:copy(receipt)};
 }catch(error){return fail('unsupported-traveling-operation')}
}
export function admitTravelGoat(s,source,verified){if(travelGoatProblems(s).length||!exact(source,['profile','itemFingerprint','parentFingerprint','budgetKey','component'])||!physicalValid({id:'tgp-'+s.nextPhysical,...source},s.nextPhysical-1)||s.physical.some(p=>p.budgetKey===source.budgetKey)||!exact(verified,['actualPhysicalIdentityVerified','actualTravelingComponentVerified','actualIvoryGoatTravelingSelection'])||verified.actualPhysicalIdentityVerified!==true||verified.actualTravelingComponentVerified!==true||verified.actualIvoryGoatTravelingSelection!==(source.profile==='current-generic'))return fail('original-traveling-component-required');const next=copy(s),id='tgp-'+next.nextPhysical++;next.physical.push({id,...copy(source)});return {ok:true,state:next,id}}
export function reviewTravelGoat(s,id,budget,remaining,verified){if(!integer(remaining,24))return fail('actual-charge-history-required');return append(s,id,budget,{kind:'review',initialUsed:24-remaining,facts:verified})}
export function activateTravelGoat(s,id,budget,creature,verified){if(travelGoatProblems(s).length)return fail('unsupported-travel-goat-state');return append(s,id,budget,{kind:'activate',formId:'tgf-'+s.nextEvent,creature,facts:verified})}
export function recordTravelGoatElapsed(s,id,budget,formId,time,verified){if(!exact(time,['completedHours','partialHour']))return fail('actual-elapsed-time-required');return append(s,id,budget,{kind:'elapsed',formId,...time,facts:verified})}
export function changeTravelGoatHP(s,id,budget,formId,operation,amount){return append(s,id,budget,{kind:'hp',formId,operation,amount})}
export function revertTravelGoat(s,id,budget,formId,verified){return append(s,id,budget,{kind:'revert',formId,facts:verified})}
export function recoverTravelGoat(s,id,budget,eventId,verified){return append(s,id,budget,{kind:'recover',eventId,facts:verified})}
export function recordTravelGoatPresence(s,id,budget,present,verified){return append(s,id,budget,{kind:'presence',present,facts:verified})}
