import{loadNativeActorFrame}from'./load-native-actor-frame.mjs';
import fs from 'node:fs';import vm from 'node:vm';
import {createPerceptionItemsEngine} from './perception-items-native.mjs';
import {perceptionItemFlag,perceptionItemSourceStatus} from '../../src/data/lib/perception-item-source.js';
import {canonicalTceSpellBonus} from '../../src/data/lib/tce-spell-bonus-profiles.js';
import {canonicalIounDefinition,iounCharacterMathStatus} from '../../src/data/lib/ioun-orbit-source.js';
import {iounOrbitAvailability} from '../../src/data/lib/ioun-orbit.js';
import {defenderArmorClassBonus} from '../../src/data/lib/defender-effects.js';
import {isBracersDefensePart,bracersDefensePartEligible} from '../../src/data/lib/bracers-source.js';
const read=file=>fs.readFileSync(new URL('../../src/'+file,import.meta.url),'utf8'),strip=text=>text.replace(/^import [^\n]*\n/gm,'').replace(/^export /gm,''),line=(text,name)=>text.split('\n').find(row=>new RegExp('^(?:export )?function '+name+'\\(').test(row)).replace(/^export /,'');
export function createActualVecnaInitiativeChecks(engine,{bindings={},consumerSource=null,featureSource=null}={}){
 const c={S:engine.c.S,env:engine.c.genv,FROZEN:false,ABK:['STR','DEX','CON','INT','WIS','CHA'],ABN:{STR:'Strength',DEX:'Dexterity',CON:'Constitution',INT:'Intelligence',WIS:'Wisdom',CHA:'Charisma'},perceptionItemFlag,perceptionItemSourceStatus,canonicalTceSpellBonus,canonicalIounDefinition,iounCharacterMathStatus,iounOrbitAvailability,defenderArmorClassBonus,isBracersDefensePart,bracersDefensePartEligible,bindLive(){},lateSet:(key,value)=>c[key]=value,lateGet:key=>c[key],x14:()=>engine.C.rs==='2014',sitNum:()=>[],PADV:[],INCAP:['Incapacitated','Stunned','Paralyzed','Petrified','Unconscious'],hasFeat:()=>false,modeOn:()=>false,sitFx(){},esc:String,renderAll(){},document:{addEventListener(){}}};
 Object.assign(c,bindings);Object.defineProperty(c,'C',{get:()=>engine.C});vm.createContext(c);const helpers=read('app/05-logic-helpers.js');for(const name of ['sg','num','clamp','mod'])vm.runInContext(line(helpers,name),c);
 vm.runInContext(strip(read('app/06-logic-derivation.js')),c);const custom=read('app/26-ui-customize.js');vm.runInContext(strip(custom.slice(custom.indexOf('export function cuK('),custom.indexOf('function cuSpeed('))),c);
 vm.runInContext(strip(featureSource??read('app/34b-ui-combat-effects-modes.js')),c);
 loadNativeActorFrame(c);
 vm.runInContext('(function(){'+strip(read('app/32v-logic-ioun-orbit.js'))+';globalThis.iounOrbitCheckRoll=iounOrbitCheckRoll})()',c);
 vm.runInContext(strip(consumerSource??read('app/32ab-logic-perception-item-checks.js')),c);
 const derive=()=>{vm.runInContext('var base=deriveBase();deriveSaves(base.abPart,base.pb,base.exhN,base.exP);var sk=deriveSkills(base.abPart,base.pb,base.exhN,base.exP);derivePassivesAcInit(base.abPart,base.exhN,base.exP,sk.skillByName,base.xr,base.exh);D.cf=cfx();',c);return c};derive();return {engine,c,derive,check:key=>c.nativePerceptionCheckRoll(key),get C(){return engine.C},setC:engine.setC};
}
