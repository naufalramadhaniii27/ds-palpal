/* Native TKDM Necronomicon: immutable reading history and retained actor benefits.
   The host verifies actual native source/attunement and owns the commit boundary.
   No raw Build marker or item-presence flag authorizes a reading here. */
const own=(value,key)=>value!=null&&Object.prototype.hasOwnProperty.call(value,key),obj=value=>!!value&&typeof value==='object'&&!Array.isArray(value),exact=(value,keys)=>obj(value)&&Reflect.ownKeys(value).length===keys.length&&keys.every(key=>own(value,key)),score=value=>Number.isSafeInteger(value)&&value>=1&&value<=30,clone=structuredClone,fail=reason=>({ok:false,reason});
const ABILITIES=['INT','WIS'],SOCIAL_SKILLS=['Persuasion','Intimidation'],TARGET_TYPES=['aberration','non-aberration','unknown'];
export function necronomiconReadingProfile(item){return item==='Necronomicon'?{v:1,item,source:'tkdm',hoursRequired:19,intelligence:{increase:2,maximum:24},wisdom:{decrease:2,minimum:3},oncePerActor:true}:null}
export function createNecronomiconReading(){return {v:1,reading:null}}
function adjustment(before,kind){return kind==='INT'?Math.max(0,Math.min(24,before+2)-before):Math.min(0,Math.max(3,before-2)-before)}
function abilityValid(value,kind){if(!exact(value,['mode','before','delta','baseAnchor']))return false;if(value.mode==='already-accounted')return value.before===null&&value.delta===null&&score(value.baseAnchor);return value.mode==='fixed-delta'&&score(value.before)&&value.delta===adjustment(value.before,kind)&&value.baseAnchor===null}
function afflictionValid(value){return exact(value,['result','cured'])&&(value.result===null||typeof value.result==='string'&&value.result.trim()===value.result&&!!value.result)&&typeof value.cured==='boolean'}
export function necronomiconProblems(state){
 if(!exact(state,['v','reading'])||state.v!==1)return ['unsupported-state'];const reading=state.reading;if(reading===null)return [];
 return exact(reading,['source','hoursVerified','INT','WIS','warp','madness'])&&reading.source==='Necronomicon'&&reading.hoursVerified===19&&abilityValid(reading.INT,'INT')&&abilityValid(reading.WIS,'WIS')&&afflictionValid(reading.warp)&&afflictionValid(reading.madness)?[]:['invalid-reading'];
}
function readingFactsValid(scores,facts){return exact(facts,['actualAttunement','completedReadingHours','baseAlreadyAccountsForChange','historicalReview'])&&facts.actualAttunement===true&&Number.isFinite(facts.completedReadingHours)&&facts.completedReadingHours>=19&&typeof facts.historicalReview==='boolean'&&exact(facts.baseAlreadyAccountsForChange,ABILITIES)&&Object.values(facts.baseAlreadyAccountsForChange).every(value=>typeof value==='boolean')&&exact(scores,ABILITIES)&&ABILITIES.every(kind=>score(scores[kind]))}
function readingAbilities(scores,facts,baseScores){
 const result={};for(const kind of ABILITIES){if(facts.baseAlreadyAccountsForChange[kind]){if(!facts.historicalReview||!exact(baseScores,ABILITIES)||!score(baseScores[kind]))return null;result[kind]={mode:'already-accounted',before:null,delta:null,baseAnchor:baseScores[kind]}}else result[kind]={mode:'fixed-delta',before:scores[kind],delta:adjustment(scores[kind],kind),baseAnchor:null}}return result;
}
export function recordNecronomiconReading(state,scores,facts,baseScores=null){
 if(necronomiconProblems(state).length||state.reading!==null)return fail('reading-already-recorded-or-unsupported');if(!readingFactsValid(scores,facts))return fail('actual-reading-facts-required');const abilities=readingAbilities(scores,facts,baseScores);if(!abilities)return fail('historical-base-review-required');
 return {ok:true,state:{v:1,reading:{source:'Necronomicon',hoursVerified:19,...abilities,warp:{result:null,cured:false},madness:{result:null,cured:false}}}};
}
export function necronomiconProjection(state,currentBase){
 if(necronomiconProblems(state).length)return fail('unsupported-state');if(state.reading===null)return {ok:true,acquired:false,additional:{INT:0,WIS:0},review:[]};const additional={INT:0,WIS:0},review=[];
 for(const kind of ABILITIES){const benefit=state.reading[kind];if(benefit.mode==='fixed-delta')additional[kind]=benefit.delta;else if(!currentBase||currentBase[kind]!==benefit.baseAnchor)review.push(kind)}return {ok:true,acquired:true,additional,review};
}
function baseReviewSelection(abilities){return Array.isArray(abilities)&&abilities.length>0&&Reflect.ownKeys(abilities).length===abilities.length+1&&Object.keys(abilities).every((key,index)=>key===String(index))&&new Set(abilities).size===abilities.length&&abilities.every(kind=>ABILITIES.includes(kind))}
// Reaffirm an embedded historical change; this never changes its unknown original amount.
export function reviewNecronomiconBase(state,abilities,currentBase,facts){
 if(necronomiconProblems(state).length)return fail('unsupported-state');if(!state.reading)return fail('completed-reading-required');
 if(!baseReviewSelection(abilities)||!exact(currentBase,ABILITIES)||!ABILITIES.every(kind=>score(currentBase[kind]))||!exact(facts,['actualSavedBaseReviewed','includesExistingChange'])||facts.actualSavedBaseReviewed!==true||facts.includesExistingChange!==true)return fail('actual-base-review-required');
 if(abilities.some(kind=>state.reading[kind].mode!=='already-accounted'))return fail('embedded-ability-review-required');if(abilities.some(kind=>state.reading[kind].baseAnchor===currentBase[kind]))return fail('base-review-no-change');
 const next=clone(state);for(const kind of abilities)next.reading[kind].baseAnchor=currentBase[kind];return {ok:true,state:next,reviewed:abilities.slice()};
}
export function recordNecronomiconAffliction(state,kind,result,facts){
 if(necronomiconProblems(state).length||!state.reading||!['warp','madness'].includes(kind)||state.reading[kind].result!==null||typeof result!=='string'||!result.trim()||result.trim()!==result||!exact(facts,['actualResultVerified'])||facts.actualResultVerified!==true)return fail('recorded-result-required');const next=clone(state);next.reading[kind].result=result;return {ok:true,state:next};
}
export function recordNecronomiconCure(state,kind,facts){
 if(necronomiconProblems(state).length||!state.reading||!['warp','madness'].includes(kind)||!exact(facts,['actualCureOccurred'])||facts.actualCureOccurred!==true||state.reading[kind].cured)return fail('actual-cure-required');const next=clone(state);next.reading[kind].cured=true;return {ok:true,state:next};
}
function socialContextValid(context){return obj(context)&&Reflect.ownKeys(context).every(key=>typeof key==='string'&&['skill','ability','creatureType','interactingWithCreature','otherAdvantage','disadvantage'].includes(key))&&SOCIAL_SKILLS.includes(context.skill)&&['STR','DEX','CON','INT','WIS','CHA'].includes(context.ability)&&TARGET_TYPES.includes(context.creatureType)&&typeof context.interactingWithCreature==='boolean'&&(!own(context,'otherAdvantage')||typeof context.otherAdvantage==='boolean')&&(!own(context,'disadvantage')||typeof context.disadvantage==='boolean')}
// An actual affliction cure does not silently decide the separate social-benefit lifetime.
export function necronomiconSocialCheck(state,context){
 if(necronomiconProblems(state).length||!state.reading)return fail('reading-required');if(!socialContextValid(context))return fail('actual-check-context-required');const {skill,creatureType,interactingWithCreature}=context,eligible=context.ability==='CHA'&&interactingWithCreature&&(skill==='Persuasion'&&creatureType==='aberration'||skill==='Intimidation'&&creatureType==='non-aberration'),advantage=eligible||context.otherAdvantage===true,disadvantage=context.disadvantage===true;
 return {ok:true,sourceAdvantage:eligible,mode:advantage&&!disadvantage?'adv':disadvantage&&!advantage?'dis':'',dice:advantage!==disadvantage?2:1};
}
