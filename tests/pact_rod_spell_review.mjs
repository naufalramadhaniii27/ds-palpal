import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createPactRodEngine} from './fixtures/pact-rod-native.mjs';import {selectSpellSource} from '../src/data/lib/spell-source.js';
let checks=0;const ok=v=>{assert.ok(v);checks++};
export function attachPactRodReview(engine,current=engine.C){const c=engine.c;c.C=current;c.S.used??={};c.borrowedBound=owner=>c.B.cid==='actor'&&c.B.name===owner?{B:c.B}:null;c.borrowedProjection=()=>engine.project();c.withB=(build,run)=>{const previous=c.B;try{c.B=structuredClone(build);return run()}finally{c.B=previous}};vm.runInContext('(function(){'+fs.readFileSync(new URL('../src/builder/25p-logic-pact-rod-review.js',import.meta.url),'utf8').replace(/^import [^\n]*\n/gm,'')+'})()',c);return {info:index=>c.genv.__bldPactRodSpellInfo(c.C.name,index),capture:(index,signature)=>c.genv.__bldPactRodSpellCapture(c.C.name,{index,signature}),current:token=>c.genv.__bldPactRodSpellCurrent(token)}}
for(const bonus of[1,2,3]){
 const item='+'+bonus+' Rod of the Pact Keeper',e=createPactRodEngine({item}),p=attachPactRodReview(e),v=p.info(0);ok(v.ok);ok(p.info(1).ok);const token=p.capture(0,v.signature);ok(token);ok(p.current(token));Object.defineProperty(e.c.C.inv[0],'tattoo',{value:undefined,enumerable:false});ok(!p.current(token));ok(p.info(0).ok===false);
 const fresh=createPactRodEngine({item}),old=createPactRodEngine({item,legacy:true}).C,r=attachPactRodReview(fresh,old),bytes=JSON.stringify(old);ok(r.info(0).ok===false);ok(JSON.stringify(fresh.c.C)===bytes);fresh.c.C=fresh.project();ok(r.info(0).ok);
}
{
 const e=createPactRodEngine(),p=attachPactRodReview(e);e.c.B.cid='foreign';ok(p.info(0).ok===false);e.c.C.spells[0].sv='ATK';ok(p.info(0).ok===false);e.c.C.spells[0].sv='DEX';e.c.C.spells[0].itc={dc:17};ok(p.info(0)===null);delete e.c.C.spells[0].itc;e.c.C.spells[0].fixedSpellSource={kind:'stored-spell'};ok(p.info(0)===null);
}
{
 const e=createPactRodEngine({item:'Rod of the Pact Keeper, +1'}),p=attachPactRodReview(e);e.c.B.cid='foreign';ok(p.info(0)===null);
}
{
 const e=createPactRodEngine(),p=attachPactRodReview(e);e.c.genv.__appVer=134;e.c.genv.__lsSave=()=>{};const view=p.info(0),token=p.capture(0,view.signature);e.c.C._app=134;e.c.B._app=134;ok(p.current(token));e.c.C._app=999;ok(!p.current(token));
}
{
 const e=createPactRodEngine(),p=attachPactRodReview(e),view=p.info(0),token=p.capture(0,view.signature);e.c.WXI.dmg14=[];ok(!p.current(token));ok(p.info(0).ok===false);
}
{
 const e=createPactRodEngine({spellSave:'ATK'}),p=attachPactRodReview(e),view=p.info(0);ok(view.ok);ok(p.info('Wizard').ok);const by=p.info('Warlock'),token=p.capture('Warlock',by.signature);ok(p.current(token));ok(p.info('invented').ok===false);e.c.C.inv[0].slotRecovery={v:99};e.c.B.inv[0].slotRecovery={v:99};ok(e.c.C.spellcasting.atk===9);ok(e.project().spellcasting.atk===8);ok(p.info(0).ok===false);ok(p.info('Wizard').ok===false);ok(!p.current(token));
}
{
 const e=createPactRodEngine({main:'Bard'}),p=attachPactRodReview(e),v=p.info(null);ok(v.ok);const token=p.capture(null,v.signature);ok(p.current(token));e.c.B.inv[0].slotRecovery={v:99};e.c.C.inv[0].slotRecovery={v:99};ok(e.c.C.spellcasting.atk===9);ok(e.project().spellcasting.atk===8);ok(p.info(null).ok===false);ok(!p.current(token));
 const old=createPactRodEngine({main:'Bard',legacy:true}).C,current=createPactRodEngine({main:'Bard'}),q=attachPactRodReview(current,old);ok(old.spellcasting.by===undefined);ok(q.info(null).ok===false);
 const ordinary=createPactRodEngine({item:'Rod of the Pact Keeper, +1'}),r=attachPactRodReview(ordinary);ordinary.c.B.cid='foreign';ok(r.info(null)===null);
}
for(const spellSave of ['ATK','DEX']){
 const stat=spellSave==='ATK'?'atk':'dc',other=stat==='atk'?'dc':'atk';
 for(const itc of [{[other]:17},{[stat]:undefined},{[stat]:null}]){const e=createPactRodEngine({spellSave,main:'Warlock'}),p=attachPactRodReview(e);e.c.C.spells[0].itc=itc;e.c.C.inv[0].slotRecovery={v:99};e.c.B.inv[0].slotRecovery={v:99};ok(selectSpellSource(e.c.C.spellcasting,e.c.C.spells[0])[stat]===(stat==='atk'?9:17));ok(e.project().spellcasting[stat]===(stat==='atk'?8:16));ok(p.info(0).ok===false)}
 const e=createPactRodEngine({spellSave}),p=attachPactRodReview(e);e.c.C.spells[0].itc={[stat]:17};e.c.B.cid='foreign';ok(p.info(0)===null);
}
for(const options of [{cantrip:true},{starry:true}]){
 const e=createPactRodEngine(options),p=attachPactRodReview(e),target={attack:0},view=p.info(target);ok(view.ok);ok(e.c.C.attacks[0].misc===1);const token=p.capture({attack:0},view.signature);ok(p.current(token));target.attack=1;ok(p.capture(target,view.signature)===null);ok(p.info({attack:0,extra:undefined}).ok===false);const hidden={attack:0};Object.defineProperty(hidden,'hidden',{value:undefined});ok(p.info(hidden).ok===false);
 e.c.B.inv[0].slotRecovery={v:99};e.c.C.inv[0].slotRecovery={v:99};const next=e.project();ok(next.attacks[0].misc===undefined);e.c.C.spellcasting=next.spellcasting;ok(p.info({attack:0}).ok===false);ok(!p.current(token));
}
{
 const e=createPactRodEngine(),p=attachPactRodReview(e);e.c.C.attacks.push({n:'Ordinary sword',die:'1d8',misc:0});ok(p.info({attack:e.c.C.attacks.length-1})===null);
}
{
 const e=createPactRodEngine({cantrip:true,main:'Warlock'}),p=attachPactRodReview(e),target={sheet:true},view=p.info(target);ok(view.ok);const token=p.capture({sheet:true},view.signature);ok(p.current(token));ok(e.c.C.spellcasting.dc===17);ok(e.c.C.attacks[0].misc===1);target.sheet=false;ok(p.capture(target,view.signature)===null);ok(p.info({sheet:true,attack:0}).ok===false);const hidden={sheet:true};Object.defineProperty(hidden,'future',{value:undefined});ok(p.info(hidden).ok===false);
 e.c.B.inv[0].slotRecovery={v:99};e.c.C.inv[0].slotRecovery={v:99};const next=e.project();ok(next.spellcasting.dc===16);ok(next.attacks[0].misc===undefined);ok(p.info({sheet:true}).ok===false);ok(!p.current(token));e.c.C.spellcasting=next.spellcasting;ok(p.info({sheet:true}).ok===false);e.c.C=next;ok(p.info({sheet:true}).ok);
 const ordinary=createPactRodEngine({item:'Rod of the Pact Keeper, +1'}),q=attachPactRodReview(ordinary);ordinary.c.B.cid='foreign';ok(q.info({sheet:true})===null);
}
console.log(checks+' PASS');
