// Source-owned healing capability derived from native text and the RL14 subclass compiler.
import {clericPowerSourceProblems} from './cleric-capabilities.js';
const object=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>object(x)&&Reflect.ownKeys(x).length===keys.length&&keys.every(key=>{const d=Object.getOwnPropertyDescriptor(x,key);return d&&Object.prototype.hasOwnProperty.call(d,'value')});
export function discipleOfLifeProfile(source){
 if(clericPowerSourceProblems(source).length||source.kind!=='sub')return null;const legacy=source.owner==='Life Domain (2014)',current=source.owner==='Life Domain';if(!legacy&&!current||current&&source.edition!=='2024'||source.level<(legacy&&source.edition==='2014'?1:3))return null;
 return {v:1,key:'disciple-of-life',feature:'Disciple of Life',sourceEdition:legacy?'2014':'2024',minimumSpellLevel:1,requiresSpellSlot:!legacy,creatureOnly:true,flat:2,levelFrom:legacy?'spell':'slot'};
}
export function discipleOfLifeDescriptorProblems(descriptor){
 if(!exact(descriptor,['rule','source']))return ['disciple-of-life'];const native=discipleOfLifeProfile(descriptor.source);if(!native||!exact(descriptor.rule,Object.keys(native))||Object.keys(native).some(key=>descriptor.rule[key]!==native[key]))return ['disciple-of-life-source'];return [];
}
export function discipleHealingBonus(descriptor,facts){
 if(discipleOfLifeDescriptorProblems(descriptor).length)return {ok:false,reason:'unsupported-disciple'};
 if(!exact(facts,['spellLevel','slotLevel','usedSpellSlot','targetCreature','restoresHitPoints'])||!Number.isInteger(facts.spellLevel)||facts.spellLevel<0||facts.spellLevel>9||['usedSpellSlot','targetCreature','restoresHitPoints'].some(key=>typeof facts[key]!=='boolean')||(facts.usedSpellSlot?(!Number.isInteger(facts.slotLevel)||facts.slotLevel<1||facts.slotLevel>9||facts.slotLevel<facts.spellLevel):facts.slotLevel!==null))return {ok:false,reason:'invalid-healing-facts'};
 const rule=descriptor.rule,applies=facts.spellLevel>=1&&facts.targetCreature&&facts.restoresHitPoints&&(!rule.requiresSpellSlot||facts.usedSpellSlot),bonus=applies?rule.flat+(rule.levelFrom==='slot'?facts.slotLevel:facts.spellLevel):0;return {ok:true,applies,bonus};
}
