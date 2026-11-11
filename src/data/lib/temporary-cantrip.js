// Declared game time and independent casting permissions; never spends a resource itself.
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const data=(x,key)=>{const d=Object.getOwnPropertyDescriptor(x,key);return !!d&&Object.prototype.hasOwnProperty.call(d,'value')};
const exact=(x,keys)=>object(x)&&Reflect.ownKeys(x).length===keys.length&&keys.every(k=>data(x,k));
const dense=x=>Array.isArray(x)&&Object.keys(x).length===x.length&&Reflect.ownKeys(x).length===x.length+1&&Object.keys(x).every((k,i)=>k===String(i)&&data(x,k));
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const text=x=>typeof x==='string'&&x.length>0&&x.trim()===x;
const ITEMS=['+1 All-Purpose Tool','+2 All-Purpose Tool','+3 All-Purpose Tool'];
export const TEMPORARY_CANTRIP_SECONDS=28800;
export function createTemporaryCantripState(){return {v:1,elapsedSeconds:0,nextGrantId:1,grants:[]}}
export function temporaryCantripStateProblems(state){
 if(!exact(state,['v','elapsedSeconds','nextGrantId','grants'])||state.v!==1)return ['state'];
 const errors=[];
 if(!integer(state.elapsedSeconds))errors.push('elapsedSeconds');
 if(!integer(state.nextGrantId)||state.nextGrantId<1)errors.push('nextGrantId');
 if(!dense(state.grants))return [...errors,'grants'];
 const seen=new Set();
 for(const grant of state.grants){
  if(!exact(grant,['id','sourceId','item','spell','startedAt','expiresAt'])){errors.push('grant');continue}
  const match=typeof grant.id==='string'&&/^tc-([1-9][0-9]*)$/.exec(grant.id),id=match?Number(match[1]):NaN;
  if(!Number.isSafeInteger(id)||id>=state.nextGrantId||seen.has(grant.id))errors.push('grant-id');
  seen.add(grant.id);
  if(!text(grant.sourceId)||!ITEMS.includes(grant.item)||!text(grant.spell))errors.push('grant-source');
  if(!integer(grant.startedAt)||!integer(grant.expiresAt)||grant.startedAt>state.elapsedSeconds||grant.expiresAt-grant.startedAt!==TEMPORARY_CANTRIP_SECONDS)errors.push('grant-time');
 }
 return errors;
}
export function advanceTemporaryCantripTime(state,seconds){
 if(temporaryCantripStateProblems(state).length)return {ok:false,reason:'unsupported-state'};
 if(!integer(seconds)||!Number.isSafeInteger(state.elapsedSeconds+seconds))return {ok:false,reason:'invalid-elapsed-time'};
 return {ok:true,state:{...state,elapsedSeconds:state.elapsedSeconds+seconds,grants:state.grants.map(g=>({...g}))}};
}
export function activateTemporaryCantrip(state,choice,context){
 if(temporaryCantripStateProblems(state).length)return {ok:false,reason:'unsupported-state'};
 if(!exact(choice,['sourceId','item','spell'])||!text(choice.sourceId)||!ITEMS.includes(choice.item)||!text(choice.spell))return {ok:false,reason:'invalid-choice'};
 const fields=['sourceEligible','chargeAvailable','actionComplete','focusOnTool','cantripOnClassList','definitelyKnown','notAlreadyKnown'];
 if(!exact(context,fields)||fields.some(k=>typeof context[k]!=='boolean'))return {ok:false,reason:'invalid-context'};
 if(context.definitelyKnown)return {ok:false,reason:'already-known'};
 if(!context.notAlreadyKnown)return {ok:false,reason:'knowledge-declaration-required'};
 if(!context.cantripOnClassList)return {ok:false,reason:'cantrip-required'};
 if(!context.sourceEligible)return {ok:false,reason:'source-ineligible'};
 if(!context.chargeAvailable)return {ok:false,reason:'charge-unavailable'};
 if(!context.actionComplete||!context.focusOnTool)return {ok:false,reason:'activation-declaration-required'};
 const expiresAt=state.elapsedSeconds+TEMPORARY_CANTRIP_SECONDS;
 if(!Number.isSafeInteger(expiresAt)||!Number.isSafeInteger(state.nextGrantId+1))return {ok:false,reason:'clock-capacity'};
 const grant={id:'tc-'+state.nextGrantId,sourceId:choice.sourceId,item:choice.item,spell:choice.spell,startedAt:state.elapsedSeconds,expiresAt};
 return {ok:true,state:{...state,nextGrantId:state.nextGrantId+1,grants:[...state.grants.map(g=>({...g})),grant]},grant:{...grant},chargeSpend:1};
}
export function activeTemporaryCantrips(state){
 if(temporaryCantripStateProblems(state).length)return [];
 return state.grants.filter(g=>state.elapsedSeconds<g.expiresAt).map(g=>({...g,classKey:'Artificer',ability:'INT'}));
}
