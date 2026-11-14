/* Actual class resources, app recovery list, short-rest transaction and native reset loop. */
import fs from 'node:fs';import vm from 'node:vm';
import {createArcaneGrimoireEngine} from './arcane-grimoire-native.mjs';
import {arcaneGrimoireRecoveryBonus as sourceBonus} from '../../src/data/lib/arcane-grimoire-recovery-source.js';
import {canonicalTceSpellBonus} from '../../src/data/lib/tce-spell-bonus-profiles.js';
import {createSlotRecoveryRestBoundary} from '../../src/app/lib/slot-recovery-rest.js';
import {iounCharacterMathStatus} from '../../src/data/lib/ioun-orbit-source.js';
const read=file=>fs.readFileSync(new URL('../../src/'+file,import.meta.url),'utf8'),strip=text=>text.replace(/^import [^\n]*\n/gm,'').replace(/^export /gm,''),line=(text,name)=>text.split('\n').find(row=>new RegExp('^(?:export )?function '+name+'\\(').test(row)).replace(/^export /,'');
export function createArcaneGrimoireRestEngine(options={}){
 const engine=createArcaneGrimoireEngine(options),messages=[],events={undo:0,save:0};let onUndo=()=>{},character=engine.C,state=engine.c.S;
 const c={sourceBonus,canonicalTceSpellBonus,createSlotRecoveryRestBoundary,iounCharacterMathStatus,env:engine.c.genv,FROZEN:false,D:{level:character.level,hpmax:40,mod:{CON:0}},structuredClone,document:{addEventListener(){}},bindLive(){},toast:value=>messages.push(value),toastU:value=>messages.push(value),save(){events.save++},syncLU(){},syncHP(){},renderConds(){},closeSheet(){},restSumToast(){},flash(){},hasFeat:()=>false,summonResourceManaged:()=>false,sitReset(){},prepareDivineInterventionRest(){return null},finishDivineInterventionRest(){},invalidateSlotRecoveryState(){},undoMark(){events.undo++;onUndo()},x14:()=>character.rs==='2014'};
 Object.defineProperties(c,{C:{get:()=>character},S:{get:()=>state}});vm.createContext(c);
 const helpers=read('app/05-logic-helpers.js');for(const name of ['num','clamp','sg','hpWord','esc'])vm.runInContext(line(helpers,name),c);
 vm.runInContext(line(read('app/08-ui-render-sheet-and-actions.js'),'used'),c);
 const derivation=read('app/06-logic-derivation.js');vm.runInContext(line(derivation,'derivedTravelGoatFields')+'\n'+derivation.slice(derivation.indexOf('function deriveResources('),derivation.indexOf('function deriveSpellAdjust(')),c);c.deriveResources(character.level,6,0);
 const cast=read('app/32b-logic-play-concentration-casting.js');for(const name of ['clsLvls','lvOf','slotLeft'])vm.runInContext(line(cast,name),c);
 vm.runInContext(strip(read('app/lib/native-actor-frame.js')),c);
 vm.runInContext('(function(){'+strip(read('app/32aa-logic-arcane-grimoire-recovery.js'))+';Object.assign(globalThis,{arcaneGrimoireRecoveryBonus,prepareShortRestRecovery,currentShortRestRecovery})})()',c);
 const recovery=read('app/32d-logic-play-hp-rest-recovery.js');for(const name of ['periOn','hdHeal','recList','slotUsed','recSum','chgApply','chgRows','shortChg'])vm.runInContext(line(recovery,name),c);vm.runInContext('var restX={};',c);vm.runInContext(recovery.slice(recovery.indexOf('function shortExtraH('),recovery.indexOf('function chgRows(')),c);
 const global=read('app/19-ui-global-click-delegation.js');vm.runInContext(global.slice(global.indexOf('const slotRecoveryRest='),global.indexOf('/* ================= GLOBAL CLICK')),c);vm.runInContext(strip(global.slice(global.indexOf('export function doRest('),global.indexOf('\ndocument.addEventListener',global.indexOf('export function doRest(')))),c);
 const rest=read('app/23d-ui-rest.js');c.lateGet=name=>c[name];vm.runInContext('let restSel={},restAuto=true,RS0=null;'+line(rest,'hdRows')+'\n'+line(rest,'restSnap')+'\n'+line(rest,'iounRestDenied'),c);vm.runInContext(strip(rest.slice(rest.indexOf('export function takeRest('),rest.indexOf('function takeRest2Step1('))),c);for(const name of ['takeRestFn1','takeRestFn2','takeRestFn3','takeRestFn4'])vm.runInContext(line(rest,name),c);c.restDiff=()=>[];c.restNames=()=>'';
 return {engine,c,events,messages,get C(){return character},get S(){return state},select(value,hd={}){c.restX={rec:structuredClone(value)};vm.runInContext('restSel='+JSON.stringify(hd),c)},list:()=>c.recList(),take:()=>c.takeRest('short'),setUndo:fn=>onUndo=fn,setC:value=>character=value,setS:value=>state=value};
}
