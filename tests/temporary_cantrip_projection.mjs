import assert from 'node:assert/strict';
import fs from 'node:fs';import vm from 'node:vm';
import {nativeCantripDefinition as native,definitelyKnownCantrip as known,projectTemporaryCantrips as project} from '../src/data/lib/temporary-cantrip-projection.js';
import {createTemporaryCantripState as fresh,activateTemporaryCantrip as activate,advanceTemporaryCantripTime as advance} from '../src/data/lib/temporary-cantrip.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const context=vm.createContext({});vm.runInContext(fs.readFileSync(new URL('../src/data/spells-spell-list.js',import.meta.url),'utf8'),context);const rows=JSON.parse(JSON.stringify(context.SPELLS));
const classes=['Artificer','Barbarian','Bard','Cleric','Druid','Fighter','Monk','Paladin','Ranger','Rogue','Sorcerer','Warlock','Wizard'];
const activation={sourceEligible:true,chargeAvailable:true,actionComplete:true,focusOnTool:true,cantripOnClassList:true,definitelyKnown:false,notAlreadyKnown:true};
const grant=(state,spell,sourceId='copy-1')=>activate(state,{sourceId,item:'+1 All-Purpose Tool',spell},activation).state;
let state=grant(fresh(),'Eldritch Blast');const before=JSON.stringify({state,rows});let projected=project(state,rows,classes,'Artificer');
eq(projected.length,1);eq(projected[0].sourceKey,'Artificer');eq(projected[0].ability,'INT');eq(projected[0].classLists,['Warlock']);eq(projected[0].sv,'ATK');eq(projected[0].baseKnown,false);eq(projected[0].temporaryCantrip.grantIds,['tc-1']);eq(JSON.stringify({state,rows}),before);
state=advance(state,60).state;state=grant(state,'Eldritch Blast','copy-2');state=grant(state,'Mending');projected=project(state,rows,classes,'Artificer');eq(projected.length,2);eq(projected[0].temporaryCantrip.grantIds,['tc-1','tc-2']);eq(projected[0].temporaryCantrip.grants.map(g=>g.sourceId),['copy-1','copy-2']);eq(projected[1].ct,'1 minute');eq(projected[1].cmp,'V, S, M');eq(projected[1].baseKnown,false);
eq(project(grant(fresh(),'Produce Flame'),rows,classes,'Artificer')[0].ct,'Bonus Action');
state=advance(state,28740).state;projected=project(state,rows,classes,'Artificer');eq(projected[0].temporaryCantrip.grantIds,['tc-2']);state=advance(state,60).state;eq(project(state,rows,classes,'Artificer'),[]);
for(const key of [undefined,null,'','Wizard','Artificer2014',17])eq(project(grant(fresh(),'Mending'),rows,classes,key),[]);
eq(project(grant(fresh(),'Mending'),rows,['Wizard'],'Artificer')[0].sourceKey,'Artificer');
for(const bad of [null,{},[],{v:2,elapsedSeconds:0,nextGrantId:1,grants:[]}])eq(project(bad,rows,classes,'Artificer'),[]);
for(const name of ['Magic Missile','Missing',' Mending',''])eq(native(rows,name,classes),null);
const mending=rows.find(row=>row[0]==='Mending');
for(const mutate of [row=>row[1]='0',row=>row[3]=[],row=>row[3]=['fx:Artificer'],row=>row[3]=['Mark of Finding'],row=>row[3]=null,row=>row[4]=null,row=>row[8]=true,row=>row[9]=2]){const row=structuredClone(mending);mutate(row);eq(native([row],'Mending',classes),null)}
eq(native([mending,mending],'Mending',classes),null);
for(const metadata of ['fx:Artificer','Mark of Finding','Aberrant Dragonmark'])eq(native([[...mending.slice(0,3),[metadata],...mending.slice(4)]],'Mending',[metadata]),null);
for(const bad of [[],['Wizard','Wizard'],[''],null])eq(native(rows,'Mending',bad),null);
const copy=native(rows,'Mending',classes);copy.classLists.push('Fake');eq(mending[3].includes('Fake'),false);
for(const kind of ['temporary','cast-only','unknown',null,undefined])eq(known('Mending',[{spell:'Mending',kind,src:'Artificer'}]),false);
eq(known('Mending',[{spell:'Mending',kind:'known'}]),true);eq(known('Mending',[{spell:'Other',kind:'known'}]),false);eq(known('Mending',null),false);eq(known('Mending',[{n:'Mending',src:'Artificer'}]),false);
const permanent={n:'Mending',sourceKey:'Wizard',knowledge:{kind:'known'}},saved=JSON.stringify(permanent);project(grant(fresh(),'Mending'),rows,classes,'Artificer');eq(JSON.stringify(permanent),saved);
// The actual legacy overlay supplies additional rows; capture the registration rather than inventing class metadata.
const legacy=vm.createContext({SPELL_FULL:{},SPELL_FX:{},DataEnv:{slot:{WX:{src:[{id:'tce',rows:[]}]}}}});vm.runInContext(fs.readFileSync(new URL('../src/data/wotc12-spells-2014.js',import.meta.url),'utf8'),legacy);const legacyRows=JSON.parse(JSON.stringify(legacy.DataEnv.slot.WX.src[0].rows));
const blade=native(legacyRows,'Booming Blade',classes);eq(blade.l,0);eq(blade.classLists.includes('Artificer'),true);const legacyProjected=project(grant(fresh(),'Booming Blade'),legacyRows,classes,'Artificer');eq(legacyProjected[0].sourceKey,'Artificer');eq(legacyProjected[0].ability,'INT');eq(legacyProjected[0].ct,blade.ct);eq(legacyProjected[0].cmp,blade.cmp);
for(const spell of rows.filter(row=>row[1]===0)){const definition=native(rows,spell[0],classes);eq(!!definition,true);eq(definition.ct,spell[4]);eq(definition.sv,spell[10])}
console.log(count+' temporary cantrip projection checks PASS');
