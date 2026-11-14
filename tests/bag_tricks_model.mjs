import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as m from '../src/data/lib/bag-tricks.js';
const context=vm.createContext({DataEnv:{slot:{}}});
vm.runInContext(fs.readFileSync(new URL('../src/data/q07-bestiary.js',import.meta.url),'utf8'),context);
const native=JSON.parse(JSON.stringify(context.DataEnv.slot.QREFS.monster));
const tables={gray:['Weasel','Giant Rat','Badger','Boar','Panther','Giant Badger','Dire Wolf','Giant Elk'],rust:['Rat','Owl','Mastiff','Goat','Giant Goat','Giant Boar','Lion','Brown Bear'],tan:['Jackal','Ape','Baboon','Axe Beak','Black Bear','Giant Weasel','Giant Hyena','Tiger']};
const outcomes=[];
for(const [color,names] of Object.entries(tables))for(const [i,logicalName] of names.entries())for(const source of ['core','mm14']){
 const nativeName=logicalName+(source==='mm14'?' (MM)':''),matches=native.filter(x=>x.n===nativeName&&x.s===source);
 assert.equal(matches.length,1);const definition=matches[0],hp=Number(/^([0-9]+)/.exec(definition.tl.find(x=>x[0]==='HP')[1])[1]);
 outcomes.push({color,die:i+1,logicalName,source,nativeName,hp,definition});
}
let n=0;const ok=(v)=>{assert.ok(v);n++;},eq=(a,b)=>{assert.deepEqual(a,b);n++;};
const receipt=o=>{const definition=o.definition;return {logicalName:o.logicalName,nativeName:o.nativeName,source:o.source,maxHP:o.hp,definition,definitionFingerprint:m.canonicalBagDefinition(definition)};};
for(const o of outcomes){
 const profile={profile:o.source==='core'?'current':'legacy',color:o.color,key:'native-key'};
 let a=m.adoptBagTricks(m.createBagTricks(),profile,{key:profile.key,used:0,max:3},{actualPhysicalIdentityVerified:true});ok(a.ok);
 eq(m.planBagTricksDraw(a.state,a.id,{key:profile.key,used:0,max:3},receipt(o),{die:o.die,actualActionCompleted:true,actualLandingWithin20Feet:true}).ok,false);
 let r=m.reviewBagTricksHistory(a.state,a.id,{key:profile.key,used:0,max:3},{actualDawnHistoryVerified:true,used:0});ok(r.ok);
 const before=JSON.stringify(r.state),draw=m.planBagTricksDraw(r.state,a.id,r.budget,receipt(o),{die:o.die,actualActionCompleted:true,actualLandingWithin20Feet:true});ok(draw.ok);eq(JSON.stringify(r.state),before);eq(draw.budget.used,1);eq(draw.state.entities[0].hp,o.hp);eq(m.bagTricksProblems(draw.state),[]);
 const missing=m.planBagTricksDraw(r.state,a.id,r.budget,{...receipt(o),source:'unknown'},{die:o.die,actualActionCompleted:true,actualLandingWithin20Feet:true});eq(missing.ok,false);
 const removed=m.setBagTricksPresence(draw.state,a.id,false);ok(removed.ok);eq(removed.state.entities[0].active,true);
 const zero=m.changeBagTricksHP(removed.state,draw.entityId,'damage',o.hp);ok(zero.ok);eq(zero.state.entities[0].endReason,'zero-hp');eq(m.changeBagTricksHP(zero.state,draw.entityId,'healing',1).ok,false);
 const dawn=m.recordBagTricksDawn(removed.state,{actualNextDawnOccurred:true,eventId:'dawn-1'});ok(dawn.ok);eq(dawn.state.entities[0].endReason,'next-dawn');eq(dawn.budgets,[{key:'native-key',used:0,max:3}]);eq(dawn.state.physical[0].present,false);eq(m.recordBagTricksDawn(dawn.state,{actualNextDawnOccurred:true,eventId:'dawn-1'}).ok,false);
 eq(m.setBagTricksPresence(dawn.state,a.id,true).ok,false);
}
for(const used of [0,1,2,3]){const a=m.adoptBagTricks(m.createBagTricks(),{profile:'legacy',color:'tan',key:'k'},{key:'k',used,max:3},{actualPhysicalIdentityVerified:true});eq(a.state.physical[0].historyKnown,used===3);eq(ownCounter(a.state),false);}
function ownCounter(s){return ['used','remaining','drawn'].some(k=>Object.hasOwn(s,k)||s.physical.some(p=>Object.hasOwn(p,k)));}
for(const s of [null,{v:99}, {...m.createBagTricks(),entities:[null]}, {...m.createBagTricks(),physical:[null]}])ok(m.bagTricksProblems(s).length>0);
const tiger=outcomes.filter(x=>x.logicalName==='Tiger');eq(tiger.map(x=>x.hp),[30,37]);
const sample=outcomes.find(o=>o.logicalName==='Tiger'&&o.source==='core'),creature=receipt(sample),budget={key:'k',used:0,max:3};
let adopted=m.adoptBagTricks(m.createBagTricks(),{profile:'current',color:'tan',key:'k'},budget,{actualPhysicalIdentityVerified:true});
let reviewed=m.reviewBagTricksHistory(adopted.state,adopted.id,budget,{actualDawnHistoryVerified:true,used:0});
const facts={die:8,actualActionCompleted:true,actualLandingWithin20Feet:true},draw=(b=budget,c=creature,f=facts)=>m.planBagTricksDraw(reviewed.state,adopted.id,b,c,f);
for(const b of [{...budget,key:'other'},{...budget,used:3},{...budget,used:-1},{...budget,used:0.5},{...budget,max:4}])eq(draw(b).ok,false);
for(const f of [{...facts,die:0},{...facts,die:9},{...facts,die:1},{...facts,actualActionCompleted:false},{...facts,actualLandingWithin20Feet:false}])eq(draw(budget,creature,f).ok,false);
for(const c of [{...creature,maxHP:22},{...creature,nativeName:'Tiger (MM)'},{...creature,definitionFingerprint:'changed'},{...creature,future:true}])eq(draw(budget,c).ok,false);
let sequence=reviewed.state,counter=budget;
for(let i=0;i<3;i++){const next=m.planBagTricksDraw(sequence,adopted.id,counter,creature,facts);ok(next.ok);sequence=next.state;counter=next.budget;}eq(counter.used,3);eq(m.planBagTricksDraw(sequence,adopted.id,counter,creature,facts).ok,false);eq(sequence.entities.length,3);
const damaged=m.changeBagTricksHP(sequence,'bte-1','damage',4);eq(damaged.state.entities[0].hp,26);const healed=m.changeBagTricksHP(damaged.state,'bte-1','healing',100);eq(healed.state.entities[0].hp,30);
const badState=structuredClone(reviewed.state);badState.future=true;ok(m.bagTricksProblems(badState).length);const sparse=m.createBagTricks();sparse.entities=new Array(1);ok(m.bagTricksProblems(sparse).length);
for(const id of [Symbol('future'),'btp-9007199254740992']){const invalid=structuredClone(reviewed.state);invalid.physical[0].id=id;ok(m.bagTricksProblems(invalid).length);}
console.log(`${n} native source-qualified Bag of Tricks model checks PASS`);
