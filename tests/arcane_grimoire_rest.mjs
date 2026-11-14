import assert from 'node:assert/strict';import {createArcaneGrimoireRestEngine} from './fixtures/arcane-grimoire-rest-native.mjs';
let checks=0;const ok=v=>{assert.ok(v);checks++},eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
function ready(options={}){const f=createArcaneGrimoireRestEngine(options);f.S.used={s1:4,s2:3,s3:2,pact:2};return f}
for(const item of ['+1 Arcane Grimoire','+2 Arcane Grimoire','+3 Arcane Grimoire'])for(const stowed of [false,true]){
 const f=ready({item,inventory:[{n:item,q:1,eq:!stowed,attuned:true}]});eq(f.list()[0].cap,4);eq(f.list()[0].grimoireBonus,1);f.select({0:{1:4}});f.take();eq(f.events.undo,1);eq(f.S.used.s1,0);eq(f.S.used['r-arcane-recovery'],1);eq(f.S.used.s2,3);eq(f.S.used.pact,0);eq(f.S.used['i-'+item],undefined);const used=structuredClone(f.S.used);f.select({0:{2:1}});f.take();eq(f.events.undo,1);eq(f.S.used,used);
}
for(const options of [{inventory:[]},{inventory:[{n:'+1 Arcane Grimoire',q:1,eq:false,attuned:false}]}]){
 const f=ready(options);eq(f.list()[0].cap,3);f.select({0:{1:4}});const before=structuredClone(f.S);f.take();eq(f.events.undo,0);eq(f.S,before);
}
for(const selection of [{0:{1:1.5}},{0:{1:-1}},{0:{6:0}},{0:{foo:0}},{9:{1:1}},{0:[]},{0:{1:NaN}}]){
 const f=ready();f.select(selection);const before=structuredClone(f.S);f.take();eq(f.events.undo,0);eq(f.S,before);
}
for(const mutate of [f=>{f.C.inv[0].q=0},f=>{f.C.inv[0].attunedActive=false},f=>{f.S.used['r-arcane-recovery']=1},f=>{f.S.used.s1=0},f=>{f.c.restX.rec[0][1]=3},f=>{f.C.name='Different actor'},f=>{f.setC({...f.C})},f=>{Object.defineProperty(f.C.inv[0],'studyBook',{value:undefined,enumerable:false})}]){
 const f=ready();f.select({0:{1:4}});let after;f.setUndo(()=>{mutate(f);after=structuredClone(f.S)});f.take();eq(f.events.undo,1);eq(f.events.save,0);eq(f.S,after);ok(f.messages.some(message=>message.includes('changed')));
}
for(const cap of [undefined,null,{v:99}]){
 const f=ready();f.C.arcaneGrimoireRecovery=cap;eq(f.list()[0].cap,3);f.select({0:{1:3}});f.take();eq(f.S.used.s1,1);eq(Object.hasOwn(f.C,'arcaneGrimoireRecovery'),true);eq(f.C.arcaneGrimoireRecovery,cap);
}
{
 const f=ready({main:'Druid',secondary:'Wizard'}),rows=f.list();eq(rows.some(row=>row.n==='Natural Recovery'&&row.grimoireBonus>0),false);const index=rows.findIndex(row=>row.n==='Arcane Recovery');eq(rows[index].cap,4);f.select({[index]:{2:2}});f.take();eq(f.S.used.s2,1);eq(f.S.used['m-wizard-arcane-recovery'],1);
}
{
 const f=ready();f.S.used.s1=0;f.select({0:{1:1}});const before=structuredClone(f.S);f.take();eq(f.events.undo,0);eq(f.S,before);
}
{
 const f=ready();f.S.hp=20;f.select({0:{1:4}},{hd:[4]});f.take();eq(f.S.hp,24);eq(f.S.used.hd,1);eq(f.S.used.s1,0);eq(f.S.used['r-arcane-recovery'],1);eq(f.events.undo,1);eq(f.events.save,2);
}
{
 const f=ready({level:9});f.S.used.s5=1;f.select({0:{5:1}});f.take();eq(f.S.used.s5,0);eq(f.S.used['r-arcane-recovery'],1);eq(f.events.undo,1);
}
{
 const f=ready(),html=f.c.shortExtraH();ok(html.includes('rounded up, plus 1 from Arcane Grimoire)'));ok(!html.includes('q.grimoireBonus'));ok(!html.includes('\"+('));
 delete f.C.arcaneGrimoireRecovery;const ordinary=f.c.shortExtraH();ok(ordinary.includes('level, rounded up)'));ok(!ordinary.includes('plus 1 from Arcane Grimoire'));
}
console.log(checks+' actual native rest checks PASS');
