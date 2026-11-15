/* Outside-only pure state prototype. Host source/cast certificates remain mandatory. */
const own=(v,k)=>v!=null&&Object.prototype.hasOwnProperty.call(v,k),obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v),copy=structuredClone;
const exact=(v,keys)=>obj(v)&&Reflect.ownKeys(v).length===keys.length&&keys.every(k=>{const d=Object.getOwnPropertyDescriptor(v,k);return d?.enumerable===true&&own(d,'value')});
const data=(v,k)=>{const d=Object.getOwnPropertyDescriptor(v,k);return !!d&&d.enumerable===true&&own(d,'value')};
const dense=v=>Array.isArray(v)&&Reflect.ownKeys(v).length===v.length+1&&Object.keys(v).every((k,i)=>k===String(i)&&data(v,k));
const int=v=>Number.isSafeInteger(v)&&v>=0,fail=reason=>({ok:false,reason}),facts=(v,keys)=>exact(v,keys)&&keys.every(k=>v[k]===true);
const marker=v=>exact(v,['occurrenceId','ordinal'])&&typeof v.occurrenceId==='string'&&v.occurrenceId.trim()===v.occurrenceId&&v.occurrenceId.length>0&&int(v.ordinal);
function supportedData(value,seen=new Set()){
 if(value===undefined||value===null||['string','boolean'].includes(typeof value))return true;if(typeof value==='number')return Number.isFinite(value);if(typeof value!=='object'||seen.has(value))return false;seen.add(value);
 const ok=Reflect.ownKeys(value).every(key=>{if(Array.isArray(value)&&key==='length')return true;if(typeof key!=='string'||!data(value,key))return false;return supportedData(Object.getOwnPropertyDescriptor(value,key).value,seen)});seen.delete(value);return ok;
}
export const createInstrumentSpells=()=>({v:1,nextPhysical:1,nextEvent:1,physical:[],events:[]});
export function instrumentBudgetKey(physicalNumber,grantId){return Number.isSafeInteger(physicalNumber)&&physicalNumber>0&&typeof grantId==='string'&&/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(grantId)?'i-instrument-'+physicalNumber+'-'+grantId:null;}
export function instrumentModel(profiles){
 const registry=new Map(profiles.map(p=>[p.id,p]));
 function sourceValid(p,index){if(!exact(p,['id','admittedAtEvent','profile','itemFingerprint','grantsFingerprint','parentFingerprint','spells']))return false;const profile=registry.get(p.profile);return p.id==='isp-'+(index+1)&&Number.isSafeInteger(p.admittedAtEvent)&&p.admittedAtEvent>0&&profile&&p.itemFingerprint===profile.itemFingerprint&&p.grantsFingerprint===profile.grantsFingerprint&&(p.parentFingerprint===null||(profile.parentFingerprints||[]).includes(p.parentFingerprint))&&dense(p.spells)&&p.spells.length===profile.grants.length&&p.spells.every((spell,i)=>exact(spell,['grantId','budgetKey'])&&spell.grantId===profile.grants[i].id&&typeof spell.budgetKey==='string'&&/^i-instrument-([1-9][0-9]*)-/.test(spell.budgetKey)&&Number.isSafeInteger(Number(/^i-instrument-([1-9][0-9]*)-/.exec(spell.budgetKey)[1]))&&spell.budgetKey===instrumentBudgetKey(Number(/^i-instrument-([1-9][0-9]*)-/.exec(spell.budgetKey)[1]),spell.grantId));}
 function replay(s){
  if(!supportedData(s))return fail('unsupported-instrument-state');
  if(!exact(s,['v','nextPhysical','nextEvent','physical','events'])||s.v!==1||!dense(s.physical)||!dense(s.events)||s.nextPhysical!==s.physical.length+1||s.nextEvent!==s.events.length+1||!s.physical.every((p,i)=>sourceValid(p,i)&&p.admittedAtEvent<=s.nextEvent&&(i===0||s.physical[i-1].admittedAtEvent<=p.admittedAtEvent)))return fail('unsupported-instrument-state');
  const allKeys=s.physical.flatMap(p=>p.spells.map(g=>g.budgetKey));if(new Set(allKeys).size!==allKeys.length)return fail('duplicate-instrument-budget-key');
  const physical=new Map(s.physical.map(p=>[p.id,{source:p,present:true,used:null}])),seenDawns=new Set();let lastDawn=null;
  for(let index=0;index<s.events.length;index++){
   const e=s.events[index];if(!obj(e)||!data(e,'id')||!data(e,'kind')||e.id!=='ise-'+(index+1))return fail('unsupported-instrument-receipt');
   if(e.kind==='dawn'){
    if(!exact(e,['id','kind','dawn','facts'])||!marker(e.dawn)||lastDawn&&e.dawn.ordinal<=lastDawn.ordinal||seenDawns.has(e.dawn.occurrenceId)||!facts(e.facts,['actualDawnOccurred','actualCampaignDawnVerified','actualDawnOccurredAfterAdmissions']))return fail('actual-new-dawn-required');
    seenDawns.add(e.dawn.occurrenceId);lastDawn=e.dawn;for(const p of physical.values())if(p.source.admittedAtEvent<=index+1){if(p.used===null)p.used={};for(const grant of p.source.spells)p.used[grant.grantId]=0;}continue;
   }
   if(!data(e,'physicalId'))return fail('original-physical-instrument-required');const p=physical.get(e.physicalId);if(!p||p.source.admittedAtEvent>index+1)return fail('original-physical-instrument-required');
   if(e.kind==='review'){
    if(!exact(e,['id','kind','physicalId','initialUsed','lastDawn','facts'])||p.used!==null||!dense(e.initialUsed)||e.initialUsed.length!==p.source.spells.length||!marker(e.lastDawn)||!facts(e.facts,['actualPhysicalIdentityVerified','actualEverySpellHistoryVerified','actualLastDawnVerified']))return fail('actual-every-spell-history-required');
    if(lastDawn&&(lastDawn.ordinal!==e.lastDawn.ordinal||lastDawn.occurrenceId!==e.lastDawn.occurrenceId))return fail('actual-current-dawn-history-required');
    if(!lastDawn){lastDawn=e.lastDawn;seenDawns.add(lastDawn.occurrenceId);}p.used={};
    for(let i=0;i<e.initialUsed.length;i++){const v=e.initialUsed[i];if(!exact(v,['grantId','used'])||v.grantId!==p.source.spells[i].grantId||![0,1].includes(v.used))return fail('actual-every-spell-history-required');p.used[v.grantId]=v.used;}continue;
   }
   if(e.kind==='presence'){
    if(!exact(e,['id','kind','physicalId','present','facts'])||typeof e.present!=='boolean'||p.present===e.present||!facts(e.facts,e.present?['actualSamePhysicalReturned','recordedMagicHistoryUnchanged']:['actualPhysicalRemoved']))return fail('actual-physical-presence-required');p.present=e.present;continue;
   }
   if(e.kind==='cast'){
    if(!exact(e,['id','kind','physicalId','grantId','cast','facts']))return fail('actual-certified-instrument-cast-required');const profile=registry.get(p.source.profile),grant=profile.grants.find(g=>g.id===e.grantId);
    if(!grant||p.used===null||p.used[e.grantId]!==0||!p.present)return fail('available-physical-spell-required');
    if(!exact(e.cast,['spell','spellSource','definitionFingerprint','castLevel','restriction','ability','channelFingerprint'])||e.cast.spell!==grant.spell||e.cast.spellSource!==grant.spellSource||e.cast.castLevel!==grant.castLevel||JSON.stringify(e.cast.restriction)!==JSON.stringify(grant.restriction)||!['STR','DEX','CON','INT','WIS','CHA',null].includes(e.cast.ability)||typeof e.cast.definitionFingerprint!=='string'||!e.cast.definitionFingerprint||typeof e.cast.channelFingerprint!=='string'||!e.cast.channelFingerprint||!facts(e.facts,['actualSourceAndActorCertified','actualBardAttunementAllocated','actualPlayingCompleted','actualPrintedCastingTimeCompleted','actualCanonicalSpellCertified','actualItemAbilityChannelCertified']))return fail('actual-certified-instrument-cast-required');
    p.used[e.grantId]=1;continue;
   }
   return fail('unsupported-instrument-receipt');
  }
  return {ok:true,physical,lastDawn};
 }
 function bound(s,used){const r=replay(s);if(!r.ok)return r;if(!obj(used))return fail('canonical-instrument-counters-required');for(const p of r.physical.values())for(const grant of p.source.spells){if(p.used===null?own(used,grant.budgetKey):!data(used,grant.budgetKey)||![0,1].includes(used[grant.budgetKey])||used[grant.budgetKey]!==p.used[grant.grantId])return fail('canonical-instrument-counters-required');}return r;}
 function append(s,used,event){try{if(!supportedData(event))return fail('unsupported-instrument-operation');const b=bound(s,used);if(!b.ok)return b;const next=copy(s),receipt={id:'ise-'+next.nextEvent,...copy(event)};next.nextEvent++;next.events.push(receipt);const r=replay(next);if(!r.ok)return r;const writes={};for(const p of r.physical.values())if(p.used!==null)for(const grant of p.source.spells)if(!data(used,grant.budgetKey)||![0,1].includes(used[grant.budgetKey])||used[grant.budgetKey]!==p.used[grant.grantId])writes[grant.budgetKey]=p.used[grant.grantId];return {ok:true,state:next,writes,receipt};}catch{return fail('unsupported-instrument-operation')}}
 return {
  allocate(s,used,profileId,reserved=[]){try{const b=bound(s,used),profile=registry.get(profileId);if(!b.ok)return b;if(!profile||!dense(reserved))return fail('original-instrument-profile-required');const taken=new Set([...Reflect.ownKeys(used),...reserved,...s.physical.flatMap(p=>p.spells.map(g=>g.budgetKey))]);for(let n=1;n<=taken.size+1;n++){const spells=profile.grants.map(g=>({grantId:g.id,budgetKey:instrumentBudgetKey(n,g.id)}));if(spells.every(g=>g.budgetKey&&!taken.has(g.budgetKey)))return {ok:true,spells};}return fail('instrument-budget-key-unavailable')}catch{return fail('unsupported-instrument-allocation')}},
  problems:s=>{try{const r=replay(s);return r.ok?[]:[r.reason]}catch{return ['unsupported-instrument-state']}},
  projection(s,used){try{const r=bound(s,used);return r.ok?{ok:true,physical:[...r.physical.values()].map(p=>({id:p.source.id,profile:p.source.profile,present:p.present,reviewRequired:p.used===null,spells:p.source.spells.map(g=>({...g,remaining:p.used===null?null:1-p.used[g.grantId]}))})),lastDawn:copy(r.lastDawn)}:r}catch{return fail('unsupported-instrument-state')}},
  admit(s,used,source,verified,reserved=[]){try{const b=bound(s,used);if(!b.ok)return b;if(!exact(source,['profile','itemFingerprint','grantsFingerprint','parentFingerprint','spells']))return fail('new-original-physical-instrument-required');const p={id:'isp-'+s.nextPhysical,admittedAtEvent:s.nextEvent,...source};if(!sourceValid(p,s.nextPhysical-1)||!facts(verified,['actualPhysicalIdentityVerified','actualSpecificOriginalProfileVerified'])||!dense(reserved)||p.spells.some(g=>own(used,g.budgetKey)||reserved.includes(g.budgetKey)||s.physical.some(old=>old.spells.some(prior=>prior.budgetKey===g.budgetKey))))return fail('new-original-physical-instrument-required');const next=copy(s);next.nextPhysical++;next.physical.push(copy(p));return {ok:true,state:next,id:p.id,writes:{}}}catch{return fail('unsupported-instrument-admission')}},
  review:(s,used,id,initialUsed,lastDawn,verified)=>append(s,used,{kind:'review',physicalId:id,initialUsed,lastDawn,facts:verified}),
  cast:(s,used,id,grantId,cast,verified)=>append(s,used,{kind:'cast',physicalId:id,grantId,cast,facts:verified}),
  dawn:(s,used,dawn,verified)=>append(s,used,{kind:'dawn',dawn,facts:verified}),
  presence:(s,used,id,present,verified)=>append(s,used,{kind:'presence',physicalId:id,present,facts:verified})
 };
}
