import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {createBracersEngine} from './fixtures/bracers-native.mjs';
let count=0;const ok=v=>{assert.ok(v);count++};
export function attachBracersBackend(e){const c=e.c;c.S.used??={};c.borrowedBound=owner=>c.B.cid==='actor'&&c.B.name===owner?{B:c.B}:null;c.borrowedProjection=()=>e.project();c.withB=(build,run)=>{const previous=c.B;try{c.B=structuredClone(build);return run()}finally{c.B=previous}};vm.runInContext('(function(){'+fs.readFileSync(new URL('../src/builder/25o-logic-bracers.js',import.meta.url),'utf8').replace(/^import [^\n]*\n/gm,'')+'})()',c);return {info:i=>c.genv.__bldBracersAttackInfo(c.C.name,i),capture:(index,signature)=>c.genv.__bldBracersAttackCapture(c.C.name,{index,signature}),current:t=>c.genv.__bldBracersAttackCurrent(t)}}
const inventory=[{n:'Bracers of Archery',q:1,eq:true,attuned:true},{n:'Longbow',q:1,eq:true}];
{
 const e=createBracersEngine({inventory}),p=attachBracersBackend(e),i=p.info(0);ok(i.ok);ok(e.C.attacks[0].dmgBonus===2);const t=p.capture(0,i.signature);ok(t);ok(p.current(t));ok(p.info(2)===null);e.c.C.inv[0].eq=false;ok(!p.current(t));ok(p.info(0).ok===false);
}
{
 const e=createBracersEngine({inventory}),p=attachBracersBackend(e);e.c.B.inv[0].eq=false;e.c.C.inv[0].eq=false;ok(e.C.attacks[0].dmgBonus===2);ok(p.info(0).ok===false);e.setCurrent(e.project());ok(p.info(0).ok);ok(e.C.attacks[0].dmgBonus===0);
}
{
 const e=createBracersEngine({inventory}),p=attachBracersBackend(e);e.c.B.cid='foreign';ok(p.info(0).ok===false);
}
{
 const e=createBracersEngine({inventory:[{n:'Longbow',q:1,eq:true}]}),p=attachBracersBackend(e);e.c.B.cid='foreign';ok(p.info(0)===null);
}
{
 const e=createBracersEngine({inventory}),p=attachBracersBackend(e),i=p.info(0),t=p.capture(0,i.signature);e.c.FXO['Bracers of Archery']={};ok(!p.current(t));ok(p.info(0).ok===false);
}
{
 const e=createBracersEngine({inventory}),p=attachBracersBackend(e);e.c.C.attacks[0].unsupported=()=>{};e.c.B.inv[0].unsupported=()=>{};ok(p.info(0).ok===false);
}
{
 const e=createBracersEngine({inventory}),p=attachBracersBackend(e);e.c.genv.__appVer=134;e.c.genv.__lsSave=()=>{};const i=p.info(0),t=p.capture(0,i.signature);e.c.C._app=134;e.c.B._app=134;ok(p.current(t));e.c.C._app=999;ok(!p.current(t));
}
{
 const e=createBracersEngine({inventory}),p=attachBracersBackend(e),i=p.info(0),t=p.capture(0,i.signature);Object.defineProperty(e.c.C.inv[0],'slotRecovery',{value:undefined,enumerable:false});ok(!p.current(t));ok(p.info(0).ok===false);
}
console.log(count+' PASS');
