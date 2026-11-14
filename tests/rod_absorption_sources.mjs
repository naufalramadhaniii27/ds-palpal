import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import *as s from '../src/data/lib/rod-absorption-source.js';import *as m from '../src/data/lib/rod-absorption.js';import {allocateAttunement} from '../src/data/lib/attunement.js';
const read=p=>fs.readFileSync(new URL('../src/'+p,import.meta.url),'utf8'),data=vm.createContext({});vm.runInContext(read('data/dmgi-magic-items-dmg2024.js'),data);const rows=structuredClone(data.DMGI),source=s.rodAbsorptionNativeSource(rows);let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};eq(source.item,'Rod of Absorption');
for(const options of [{customItems:[{n:source.item}]},{fxOverrides:{[source.item]:undefined}},{gxItems:{[source.item]:[]}},{resolvedRow:[]}])eq(s.rodAbsorptionNativeSource(rows,options),null);
eq(s.rodAbsorptionNativeSource([...rows,rows.find(r=>r[0]===source.item)]),null);
let state=m.admitRodAbsorption(m.createRodAbsorption(),{nativeFingerprint:source.itemFingerprint,actualPhysicalIdentityVerified:true}).state;const rod=state.rods[0],row={n:source.item,q:1,eq:true,attuned:true,rodAbsorption:s.rodAbsorptionMarker(rod)},inventory=[row],ATT=()=>allocateAttunement(inventory,3,()=>({requires:true}),()=>true);
eq(s.rodAbsorptionPhysicalSource(row,state,source,ATT().rows[0],inventory)?.id,rod.id);
for(const change of [{q:0},{q:2},{eq:false},{attuned:false},{storedSpells:undefined},{rodAbsorption:{v:99}}]){const r={...row,...change},list=[r],st=allocateAttunement(list,3,()=>({requires:true}),()=>true);eq(s.rodAbsorptionPhysicalSource(r,state,source,st.rows[0],list),null)}
eq(s.rodAbsorptionPhysicalSource(row,state,source,ATT().rows[0],[row,structuredClone(row)]),null);
state=m.reviewRodAbsorption(state,rod.id,{totalAbsorbed:50,stored:0,foundRoll:null},{actualAttunementCountReview:true,actualFoundRollVerified:false}).state;eq(s.rodAbsorptionPhysicalSource(row,state,source,ATT().rows[0],inventory),null);
const def={n:'Shield',l:1,cmp:'V, S',school:'Abjuration',classList:['Wizard','Sorcerer'],ct:'Reaction',consumesMaterial:false,fx:{}},spell={n:'Shield',l:1,src:'Wizard',use:'Prepared',rit:false},C={spells:[spell],spellcasting:{slots:[4,3,2],pact:{n:2,lvl:4}}},parts=[{cls:'Wizard',maximumPreparedLevel:3},{cls:'Warlock',maximumPreparedLevel:3}],selected={Wizard:['Shield'],Warlock:[]};
function witness(character=C,catalog=[def],classes=selected,always=[]){return s.rodAbsorptionSpellWitness(character,catalog,parts,classes,always)}
eq(witness().casting.maximumSlotLevel,4);eq(witness().bindings[0].sourceKey,'Wizard');eq(witness().casting.knownPreparedSpells[0].name,'Shield');eq(witness({...C,used:{s1:4,pact:2}}).casting.maximumSlotLevel,4);
for(const marker of ['itc','storedSpellcasting','storedSpellSlotLevel','fixedSpellSource','temporaryCantrip','tattooSource','gemSpellcasting'])eq(witness({...C,spells:[{...spell,[marker]:undefined}]}).bindings.length,0);
eq(witness(C,[def],{Wizard:[],Warlock:[]}).bindings.length,0);eq(witness({...C,spells:[{...spell,use:'Ritual only',rit:true}]}).bindings.length,0);eq(witness({...C,spells:[{...spell,sourceKey:'@mi:mi0'}]}).bindings.length,0);eq(witness(C,[def,{...def}]).bindings.length,0);
eq(witness(C,[{...def,classList:['Cleric']}]).bindings.length,0);
eq(witness(C,[{...def,classList:undefined}]).bindings.length,0);
const auto={n:'Shield',k:'Wizard',src:'Subclass'};eq(witness({...C,spells:[{...spell,use:'Always prepared',src:'Subclass'}]},[def],{Wizard:[],Warlock:[]},[auto]).bindings.length,1);
for(const slots of [[4,NaN],Array(2),[-1],[4,3,2,1,1,1,1,1,1,1]])eq(s.rodAbsorptionSlotMaximum({...C,spellcasting:{slots,pact:null}}),null);
eq(s.rodAbsorptionSlotMaximum({...C,spellcasting:{slots:[4],pact:null}}),1);eq(s.rodAbsorptionSlotMaximum({...C,spellcasting:{slots:[],pact:{n:2,lvl:5}}}),5);
const fp=s.canonicalRodAbsorptionDefinition(row);Object.defineProperty(row,'future',{value:undefined});eq(s.canonicalRodAbsorptionDefinition(row)===fp,false);
console.log(n+' Rod Absorption native source/physical/canonical class eligibility checks PASS');
{
 const C={name:'Actor'},S={},B={name:'Actor',cid:'actor',inv:[]},c={...s,structuredClone,rodAbsorptionProblems:m.rodAbsorptionProblems,QRY:{casterParts:()=>parts,spLists:()=>selected,autoSpells:()=>[]},genv:{__sheetId:()=>B.cid},sheetState:()=>({C,state:S}),fxo:()=>({}),gx:()=>({item:{}}),lateGet:k=>({B,DM14S:rows,DMAP:{'Rod of Absorption':rows.find(r=>r[0]==='Rod of Absorption')}})[k]};vm.createContext(c);vm.runInContext('(function(){'+read('builder/10q-logic-rod-absorption.js').replace(/^import [^\n]*\n/gm,'').replace(/export /g,'')+';Object.assign(globalThis,{rodAbsorptionOwnedState,rodAbsorptionOwnFuture,rodAbsorptionSourceWitness,withRodAbsorptionProjection})})()',c);
 for(const value of [undefined,null,{v:99}]){C.rodAbsorption=value;eq(c.withRodAbsorptionProjection(m.createRodAbsorption(),()=>c.rodAbsorptionOwnedState()),value);eq(c.rodAbsorptionOwnFuture(),true);delete C.rodAbsorption;C.rodAbsorptionSources=value;eq(JSON.stringify(c.withRodAbsorptionProjection(m.createRodAbsorption(),()=>c.rodAbsorptionSourceWitness({rows:[]},[]))),JSON.stringify(value));delete C.rodAbsorptionSources;}
}
console.log(n+' total Rod Absorption source/projection checks PASS');
