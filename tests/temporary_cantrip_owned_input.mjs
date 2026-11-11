// Exercise the production sheet input boundary with real temporal projection.
import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
import {projectTemporaryCantrips} from '../src/data/lib/temporary-cantrip-projection.js';
import {createTemporaryCantripState,activateTemporaryCantrip,advanceTemporaryCantripTime} from '../src/data/lib/temporary-cantrip.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a===undefined?undefined:JSON.parse(JSON.stringify(a)),b);count++};
const native=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/data/spells-spell-list.js',import.meta.url),'utf8'),native);const rows=JSON.parse(JSON.stringify(native.SPELLS));
const yes={sourceEligible:true,chargeAvailable:true,actionComplete:true,focusOnTool:true,cantripOnClassList:true,definitelyKnown:false,notAlreadyKnown:true};
const temporal=activateTemporaryCantrip(createTemporaryCantripState(),{sourceId:'ap-1',item:'+1 All-Purpose Tool',spell:'Fire Bolt'},yes).state;
let actorState={C:{name:'Actor'},temporaryCantrips:temporal},sheetId='actor-1';
const c={B:{name:'Actor',cid:'actor-1',level:5,species:'Human',sub:'',bg:'Acolyte',ch:{}},projectTemporaryCantrips,structuredClone,sheetState:()=>actorState,genv:{__sheetId:()=>sheetId},spellRows:()=>rows,classDef:k=>['Artificer','Wizard','Warlock','Bard','Cleric','Druid','Sorcerer'].includes(k),abilScores:()=>({sc:{STR:10,DEX:10,CON:10,INT:16,WIS:10,CHA:10}}),hpCalc:()=>({list:[]}),baseOf:()=>({b:''}),R14:()=>false,appVer:()=>1,QRY:{},SRC:{},G:{},CH:{},SG:{},chJoin:()=>'',applyWieldScoreCustomization:x=>x};
for(const key of ['syncPickItems','CL','TL','pbOf','speciesDef','bgDef','allFeats','fxList','choices','subGrant','clsParts','effArmor','effShield','effWeps','armorDef','MCL','attunementState','activeFx','itemMagicBonus','spOptFx','toolChoices','grantTools','wmAll','classFeatures','slotsFor','packSkills','xsk','attMax'])if(!c[key])c[key]=()=>[];
const source=fs.readFileSync(new URL('../src/builder/12-logic-export-to-sheet.js',import.meta.url),'utf8');vm.createContext(c);vm.runInContext(source.slice(source.indexOf('function ownedWieldCustomization()'),source.indexOf('/* solid:orchestrator toSheet */')),c);
const input=options=>c.sheetInputs(options).i.temporaryCantrips;
const before=JSON.stringify([c.B,actorState]);eq(input().map(x=>x.n),['Fire Bolt']);eq(input()[0].ability,'INT');eq(input()[0].sourceKey,'Artificer');eq(input()[0].temporaryCantrip.grantIds,['tc-1']);eq(JSON.stringify([c.B,actorState]),before);
// Same display name cannot borrow a different actor's temporary permission.
sheetId='actor-2';eq(input(),[]);sheetId='actor-1';actorState.C.name='Other actor';eq(input(),[]);actorState.C.name='Actor';
for(const bad of ['',undefined,null]){c.B.cid=bad;eq(input(),[])}c.B.cid='actor-1';
for(const bad of ['',undefined,null]){sheetId=bad;eq(input(),[])}sheetId='actor-1';
actorState=null;eq(input(),[]);actorState={};eq(input(),[]);actorState={C:{name:'Actor'}};eq(input(),[]);actorState={C:{name:'Actor'},temporaryCantrips:temporal};
// Explicit pure-build inputs override live state, including intentionally absent data.
eq(input({temporaryCantrips:undefined}),[]);eq(input({temporaryCantrips:createTemporaryCantripState()}),[]);eq(input({temporaryCantrips:{...temporal,v:2}}),[]);eq(input({temporaryCantrips:advanceTemporaryCantripTime(temporal,28800).state}),[]);
sheetId='foreign';eq(input({temporaryCantrips:temporal}).map(x=>x.n),['Fire Bolt']);sheetId='actor-1';
// Projection must not leak across alternating builds or mutate caller-owned arrays.
const b0=JSON.stringify(c.B),s0=JSON.stringify(actorState);for(let i=0;i<3;i++){c.B.cid='foreign';eq(input(),[]);c.B.cid='actor-1';eq(input().length,1)}eq(JSON.stringify(c.B),b0);eq(JSON.stringify(actorState),s0);
const projected=input();projected[0].temporaryCantrip.grantIds.push('external');eq(input()[0].temporaryCantrip.grantIds,['tc-1']);
console.log(count+' actual owned temporary-cantrip sheet-input checks PASS');
