// Pure pure prototype: physical contents and actual dawn events, not a cast-use pool.
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k),object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>object(x)&&Reflect.ownKeys(x).length===keys.length&&keys.every(k=>own(x,k));
const text=x=>typeof x==='string'&&x.trim()===x&&x.length>0;
const integer=x=>Number.isSafeInteger(x)&&x>=0;
const fail=reason=>({ok:false,reason});
const profiles=[['Obsidian',0,13,5],['Lapis lazuli',1,13,5],['Quartz',2,13,5],['Bloodstone',3,15,7],['Amber',4,15,9],['Jade',5,17,9],['Topaz',6,17,10],['Star ruby',7,18,10],['Ruby',8,18,10],['Diamond',9,19,11]];
export function spellGemProfile(name){const p=profiles.find(p=>'Spell Gem ('+p[0]+')'===name);return p?{v:1,item:name,maxSpellLevel:p[1],dc:p[2],atk:p[3],releaseAction:'Action',releaseAttunement:false,releaseComponents:false,imbueAttunement:true}:null}
export function spellGemProblems(row){
 if(!object(row)||!spellGemProfile(row.key||row.n))return ['item'];const state=row.spellGem;if(!exact(state,['v','id','contents','imbueAvailable'].concat(own(state,'loadId')?['loadId']:[])))return ['state'];const errors=[],profile=spellGemProfile(row.key||row.n);
 if(state.v!==1||!/^gem-[1-9][0-9]*$/.test(state.id)||!Number.isSafeInteger(Number(state.id.slice(4))))errors.push('identity');
 if(typeof state.imbueAvailable!=='boolean')errors.push('imbue-history');
 if(own(state,'loadId')&&(state.contents===null?state.loadId!==null:typeof state.loadId!=='string'||!/^sgl-[1-9][0-9]*$/.test(state.loadId)||!Number.isSafeInteger(Number(state.loadId.slice(4)))))errors.push('load-id');
 if(state.contents!==null&&(!exact(state.contents,['spell','level'])||!text(state.contents.spell)||!integer(state.contents.level)||state.contents.level>profile.maxSpellLevel))errors.push('contents');return errors;
}
function source(row){return spellGemProblems(row).length?null:row.spellGem}
function singleton(row){return (row.q==null?1:row.q)===1}
export function evaluateGemRelease(row,facts){
 const state=source(row);if(!state)return fail('unsupported-gem');if(!singleton(row))return fail('singleton-required');if(!state.contents)return fail('empty-gem');
 if(!exact(facts,['holding','knowsSpell','onOwnClassList','normallyCanCastLevel'])||['holding','knowsSpell','onOwnClassList'].some(k=>typeof facts[k]!=='boolean')||!integer(facts.normallyCanCastLevel)||facts.normallyCanCastLevel>9)return fail('invalid-release-facts');
 if(!facts.holding)return fail('holding-required');if(!facts.knowsSpell&&!facts.onOwnClassList)return fail('source-ineligible');
 const checkRequired=state.contents.level>facts.normallyCanCastLevel;
 return {ok:true,profile:spellGemProfile(row.key||row.n),contents:{...state.contents},checkRequired,checkDC:checkRequired?10+state.contents.level:null};
}
export function releaseSpellGem(row,facts,event){
 const evaluated=evaluateGemRelease(row,facts);if(!evaluated.ok)return evaluated;
 if(!exact(event,['actionComplete','checkTotal'])||event.actionComplete!==true||(evaluated.checkRequired?!Number.isSafeInteger(event.checkTotal):event.checkTotal!==null))return fail('release-event-required');
 const castSucceeded=!evaluated.checkRequired||event.checkTotal>=evaluated.checkDC;
 return {ok:true,row:{...row,spellGem:{...row.spellGem,contents:null,...(own(row.spellGem,'loadId')?{loadId:null}:{})}},castSucceeded,spellEffectAllowed:castSucceeded,receipt:{item:row.key||row.n,sourceId:row.spellGem.id,spell:evaluated.contents.spell,level:evaluated.contents.level,...(own(row.spellGem,'loadId')?{loadId:row.spellGem.loadId}:{}),dc:evaluated.profile.dc,atk:evaluated.profile.atk},cost:{spellSlot:false,components:false,charge:false}};
}
export function evaluateGemImbue(row,definition,facts){
 const state=source(row);if(!state)return fail('unsupported-gem');if(!singleton(row))return fail('singleton-required');if(state.contents!==null)return fail('gem-not-empty');if(!state.imbueAvailable)return fail('await-next-dawn');
 if(!exact(definition,['n','l','castingKind','school','consumesMaterial'])||!text(definition.n)||!integer(definition.l)||definition.l>spellGemProfile(row.key||row.n).maxSpellLevel||!['one-action','one-minute-or-longer'].includes(definition.castingKind)||!text(definition.school)||typeof definition.consumesMaterial!=='boolean')return fail('unsupported-imbue-spell');
 if(!exact(facts,['holding','attunedActive','canActuallyCast','actualCastLevel'])||['holding','attunedActive','canActuallyCast'].some(key=>typeof facts[key]!=='boolean')||!Number.isSafeInteger(facts.actualCastLevel)||facts.actualCastLevel<definition.l)return fail('invalid-imbue-facts');if(facts.actualCastLevel>spellGemProfile(row.key||row.n).maxSpellLevel)return fail('imbue-level-exceeds-capacity');if(!facts.holding||!facts.attunedActive||!facts.canActuallyCast)return fail('imbue-source-ineligible');
 return {ok:true,materialCostMultiplier:definition.school==='Abjuration'&&definition.consumesMaterial?0.5:1};
}
export function imbueSpellGem(row,definition,facts,event){
 const evaluated=evaluateGemImbue(row,definition,facts);if(!evaluated.ok)return evaluated;
 if(!exact(event,['actualSpellCast','nativeCostsAccounted','nativeCastingTimeComplete','castSucceeded'])||Object.values(event).some(v=>v!==true))return fail('actual-imbue-cast-required');
 const nextState={...row.spellGem,contents:{spell:definition.n,level:definition.l},imbueAvailable:false};delete nextState.loadId;return {ok:true,row:{...row,spellGem:nextState},externalSpellEffectAllowed:false,materialCostMultiplier:evaluated.materialCostMultiplier};
}
export function declareGemNextDawn(row,event){if(!source(row))return fail('unsupported-gem');if(!exact(event,['actualNextDawn'])||event.actualNextDawn!==true)return fail('actual-dawn-required');return {ok:true,row:{...row,spellGem:{...row.spellGem,contents:row.spellGem.contents&&{...row.spellGem.contents},imbueAvailable:true}}}}
