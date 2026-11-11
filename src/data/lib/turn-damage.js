// Source-owned conditional hit dice using the native Situations per-turn use pool.
import {criticalDice,damageType,DAMAGE_TYPES} from './attack-target.js';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const own=(x,key)=>Object.prototype.hasOwnProperty.call(x,key);
const text=x=>typeof x==='string'&&x.length>0&&x.trim()===x;
const keyValid=x=>typeof x==='string'&&/^[a-z][a-z0-9-]*$/.test(x);
// [domain, damage types or weapon reference, own turn only, creature required, upgrades at14].
/** @type {Array<[string,string|string[],boolean,boolean,boolean]>} */
const LEGACY=[
 ['Life Domain (2014)',['Radiant'],false,true,true],
 ['Nature Domain',['Cold','Fire','Lightning'],false,true,true],
 ['Tempest Domain',['Thunder'],false,true,true],
 ['Trickery Domain (2014)',['Poison'],false,true,true],
 ['War Domain (2014)','weapon',false,true,true],
 ['Death Domain',['Necrotic'],false,true,true],
 ['Solidarity Domain (PSA)','weapon',false,true,true],
 ['Strength Domain (PSA)','weapon',false,true,true],
 ['Zeal Domain (PSA)','weapon',false,true,true],
 ['Order Domain',['Psychic'],false,false,true],
 ['Twilight Domain',['Radiant'],false,false,true],
 ['Forge Domain',['Fire'],false,false,true],
 ['Blood Domain',['Necrotic'],false,false,true],
 ['Apocalypse Domain',['Necrotic'],true,true,true],
 ['Beer Domain',['Radiant'],true,true,true],
 ['Darkness Domain',['Necrotic'],true,true,true],
 ['Dragon Domain',['Fire'],true,true,true],
 ['Hunger Domain',['Necrotic'],true,true,true],
 ['Hunting Domain','weapon',true,true,true],
 ['Justice Domain',['Radiant'],true,true,true],
 ['Labyrinth Domain','weapon',true,false,true],
 ['Lust Domain',['Psychic'],true,false,true],
 ['Moon Domain (Deep Magic)',['Cold'],true,false,true],
 ['Mountain Domain',['Cold'],true,false,true],
 ['Ocean Domain',['Cold'],true,false,true],
 ['Prophecy Domain','weapon',true,false,true],
 ['Speed Domain','weapon',true,false,true],
 ['Travel Domain',['Lightning'],true,false,true],
 ['Void Domain',['Cold'],true,false,true],
 ['Winter Domain',['Cold'],true,false,true],
 ['Community Domain',['Psychic'],true,false,true]
];
export function divineStrikeProfile(domain,clericLevel){
 const row=LEGACY.find(x=>x[0]===domain);if(!row||!Number.isSafeInteger(clericLevel)||clericLevel<8||clericLevel>20)return null;
 return Object.assign({v:1,key:'divine-strike',source:row[0],feature:'Divine Strike',turn:row[2]?'own':'any',dice:row[4]&&clericLevel>=14?'2d8':'1d8',creatureOnly:row[3]},row[1]==='weapon'?{typeFrom:'weapon'}:{types:[...row[1]]});
}
export function divineStrikeMarkerProblems(marker){
 if(!object(marker)||Reflect.ownKeys(marker).length!==2||!own(marker,'v')||!own(marker,'profile'))return ['marker'];
 const errors=[];if(marker.v!==1)errors.push('v');if(!['legacy','blessed'].includes(marker.profile))errors.push('profile');return errors;
}
export function blessedStrikeProfile(clericLevel){
 if(!Number.isSafeInteger(clericLevel)||clericLevel<7||clericLevel>20)return null;
 return {v:1,key:'divine-strike',source:'Cleric',feature:'Blessed Strikes',turn:'own',dice:clericLevel>=14?'2d8':'1d8',creatureOnly:true,types:['Necrotic','Radiant']};
}
function exactKeys(value,keys){return object(value)&&Reflect.ownKeys(value).length===keys.length&&keys.every(key=>own(value,key))}
function strikePrefix(value){if(value==='')return true;if(typeof value!=='string')return false;const match=/^m(0|[1-9][0-9]*):$/.exec(value);return !!match&&Number.isSafeInteger(Number(match[1]))}
function canonicalStrikeRule(rule,expected){
 if(!expected||!exactKeys(rule,Object.keys(expected)))return false;
 return Object.keys(expected).every(key=>Array.isArray(expected[key])?Array.isArray(rule[key])&&Reflect.ownKeys(rule[key]).length===expected[key].length+1&&rule[key].length===expected[key].length&&expected[key].every((value,index)=>own(rule[key],index)&&rule[key][index]===value):rule[key]===expected[key]);
}
// Saved sheet capability validation; the builder separately proves actual build ownership.
export function divineStrikeDescriptorProblems(descriptor){
 if(!exactKeys(descriptor,['rule','source']))return ['descriptor'];const source=descriptor.source;
 if(!exactKeys(source,['kind','owner','classKey','level','pre','edition']))return ['source'];
 const errors=[];if(source.classKey!=='Cleric')errors.push('classKey');if(!Number.isSafeInteger(source.level)||source.level<1||source.level>20)errors.push('level');if(!strikePrefix(source.pre))errors.push('pre');
 let expected=null;
 if(source.edition==='2014'&&source.kind==='sub')expected=divineStrikeProfile(source.owner,source.level);
 else if(source.edition==='2024'&&source.kind==='cls'&&source.owner==='Cleric')expected=blessedStrikeProfile(source.level);
 else errors.push('provenance');
 if(!canonicalStrikeRule(descriptor.rule,expected))errors.push('rule');return errors;
}
export function turnDamageProblems(rule){
 if(!object(rule))return ['rule'];const errors=[],keys=['v','key','source','feature','turn','dice','creatureOnly','types','typeFrom'];
 Object.keys(rule).filter(k=>!keys.includes(k)).forEach(k=>errors.push(k));
 if(rule.v!==1)errors.push('v');if(!keyValid(rule.key))errors.push('key');if(!text(rule.source))errors.push('source');if(!text(rule.feature))errors.push('feature');
 if(!['any','own'].includes(rule.turn))errors.push('turn');if(!criticalDice(rule.dice))errors.push('dice');if(typeof rule.creatureOnly!=='boolean')errors.push('creatureOnly');
 if(own(rule,'types')===own(rule,'typeFrom'))errors.push('damage-type');
 if(own(rule,'types')&&(!Array.isArray(rule.types)||!rule.types.length||Object.keys(rule.types).length!==rule.types.length||rule.types.some(t=>!DAMAGE_TYPES.includes(t))||new Set(rule.types).size!==rule.types.length))errors.push('types');
 if(own(rule,'typeFrom')&&rule.typeFrom!=='weapon')errors.push('typeFrom');return errors;
}
function turnState(sit){
 if(sit===undefined)sit={};if(!object(sit))return {ok:false,reason:'unsupported-state'};
 if(!own(sit,'turn'))return {ok:true,sit,generation:0};const turn=sit.turn;
 if(!object(turn)||Object.keys(turn).length!==2||turn.v!==1||!Number.isSafeInteger(turn.generation)||turn.generation<0)return {ok:false,reason:'unsupported-turn'};
 return {ok:true,sit,generation:turn.generation};
}
export function readTurnDamageState(sit,key='divine-strike'){
 if(!keyValid(key))return {ok:false,reason:'invalid-use-key'};const state=turnState(sit);if(!state.ok)return state;
 const used=own(state.sit,'used')?state.sit.used:{};if(!object(used))return {ok:false,reason:'unsupported-use'};
 const value=own(used,key)?used[key]:0;if(![0,1,false,true].includes(value))return {ok:false,reason:'unsupported-use'};
 return {ok:true,generation:state.generation,used:value===1||value===true,useKey:key};
}
export function advanceTurnDamageGeneration(sit){
 const state=turnState(sit);if(!state.ok)return state;if(!Number.isSafeInteger(state.generation+1))return {ok:false,reason:'turn-capacity'};
 return {ok:true,sit:{...state.sit,turn:{v:1,generation:state.generation+1}},generation:state.generation+1};
}
export function evaluateTurnDamage(rule,sit,context){
 if(turnDamageProblems(rule).length)return {ok:false,reason:'invalid-rule'};
 const state=readTurnDamageState(sit,rule.key);if(!state.ok)return state;
 const flags=['weaponAttack','hit','targetCreature','ownTurn','critical'];
 if(!object(context)||Object.keys(context).some(k=>![...flags,'weaponType','selectedType'].includes(k))||flags.some(k=>!own(context,k)||typeof context[k]!=='boolean')||['weaponType','selectedType'].some(k=>own(context,k)&&typeof context[k]!=='string'))return {ok:false,reason:'invalid-context'};
 if(!context.weaponAttack||!context.hit)return {ok:false,reason:'weapon-hit-required'};
 if(rule.creatureOnly&&!context.targetCreature)return {ok:false,reason:'creature-required'};
 if(rule.turn==='own'&&!context.ownTurn)return {ok:false,reason:'own-turn-required'};
 if(state.used)return {ok:false,reason:'already-used'};
 const selected=damageType(context.selectedType),type=rule.typeFrom==='weapon'?damageType(context.weaponType):rule.types.length===1?rule.types[0]:selected;
 if(!type||rule.types&&!rule.types.includes(type)||rule.types&&context.selectedType&&!rule.types.includes(selected))return {ok:false,reason:'damage-type-required'};
 const normalDice=criticalDice(rule.dice),parts=normalDice.split('d'),doubled=Number(parts[0])*2;
 if(!Number.isSafeInteger(doubled))return {ok:false,reason:'dice-capacity'};
 const criticalPreview=doubled+'d'+parts[1];return {ok:true,normalDice,criticalDice:criticalPreview,dice:context.critical?criticalPreview:normalDice,type,generation:state.generation,useKey:rule.key};
}
export function commitTurnDamage(rule,sit,context,expectedGeneration){
 const result=evaluateTurnDamage(rule,sit,context);if(!result.ok)return result;
 if(!Number.isSafeInteger(expectedGeneration)||expectedGeneration!==result.generation)return {ok:false,reason:'stale-turn'};
 const previous=sit===undefined?{}:sit;return {...result,sit:{...previous,used:{...(previous.used||{}),[rule.key]:1},turn:{v:1,generation:result.generation}}};
}
