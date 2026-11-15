/* Actual03/allocatedATT/native12 producers; no source permission stub. */
import fs from 'node:fs';import vm from 'node:vm';
import {createBracersEngine} from './bracers-native.mjs';
import {createReadingEngine} from './necronomicon-native.mjs';
import * as profiles from '../../src/data/lib/vecna-graft-profiles.js';import * as model from '../../src/data/lib/vecna-grafts.js';import *as sharedSource from '../../src/data/lib/vecna-graft-source.js';import *as handStrength from '../../src/data/lib/hand-vecna-strength.js';
const repo=new URL('../../src/',import.meta.url).pathname;
const read=p=>fs.readFileSync(p,'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/export /g,'');
export function createVecnaGraftsEngine({inventory,actorRuleset='2024',mutate=()=>{},nativeDerivedProjection}={}){
 const e=createBracersEngine({inventory:inventory??profiles.vecnaGraftProfiles().map(p=>({n:p.item,q:1,eq:false,attuned:true}))}),c=e.c;
 c.B.rs=actorRuleset;c.B.src={core:true,dmg:true,dmg14:true};Object.assign(c,profiles,model,sharedSource,handStrength);
 // Load the full actual native L4 registry over the actual L3 base, including both artifact defaults.
 const fxNative=vm.createContext({DataEnv:{slot:{GX:structuredClone(c.GX),FXO:structuredClone(c.FXO)}}});fxNative.GX=fxNative.DataEnv.slot.GX;fxNative.FXO=fxNative.DataEnv.slot.FXO;vm.runInContext(read(repo+'data/fx-L4.js'),fxNative);c.GX=structuredClone(fxNative.DataEnv.slot.GX);c.FXO=structuredClone(fxNative.DataEnv.slot.FXO);c.genv.GX=c.GX;c.genv.FXO=c.FXO;
 const original=vm.createContext({});vm.runInContext(read(repo+'data/dmgi-magic-items-dmg2024.js'),original);c.DM14=structuredClone(original.DM14);c.genv.DM14=c.DM14;
 const overlay=read(repo+'builder/09c-logic-edition-overlays.js'),a=overlay.indexOf('/* dm14Set steps'),b=overlay.indexOf('genv.__sp14Set=',a);if(a<0||b<0)throw Error('Actual native edition overlay unavailable');
 vm.runInContext('var DM14ON=false,DM14S=null,DM14M=null;'+strip(overlay.slice(a,b)),c);c.dm14Set(actorRuleset==='2014',true);
 const helper=read(repo+'builder/10w-logic-vecna-grafts.js'),exports=[...helper.matchAll(/export function (\w+)/g)].map(m=>m[1]);vm.runInContext('(function(){'+strip(helper)+';Object.assign(globalThis,{'+exports.join(',')+'})})()',c);
 let post;c.registerSheetGroup=g=>post=g;vm.runInContext(strip(read(repo+'builder/12zj-logic-vecna-grafts.js')),c);
 const handHelper=read(repo+'builder/10x-logic-hand-vecna-strength.js'),handExports=[...handHelper.matchAll(/export function (\w+)/g)].map(m=>m[1]);vm.runInContext('(function(){'+strip(handHelper)+';Object.assign(globalThis,{'+handExports.join(',')+'})})()',c);let handPost;c.registerSheetGroup=g=>handPost=g;vm.runInContext(strip(read(repo+'builder/12zk-logic-hand-vecna-strength.js')),c);
 let edition;c.registerSheetGroup=g=>edition=g;const movement=read(repo+'builder/12f-logic-sheet-handlers-movement.js'),ma=movement.indexOf('registerSheetGroup({id:"speed-sheet"'),mb=movement.indexOf('/* ---------- Darkvision',ma);vm.runInContext(movement.slice(ma,mb),c);
 let advantage;c.registerSheetGroup=g=>advantage=g;const nativeFeatures=read(repo+'builder/12j-logic-sheet-handlers-features.js'),start=nativeFeatures.indexOf('registerSheetGroup({id:"item-advantage"'),end=nativeFeatures.indexOf('\nregisterSheet',start+1);if(start<0||end<0)throw Error('Actual native advantage producer unavailable');vm.runInContext(nativeFeatures.slice(start,end),c);
 const reading=createReadingEngine({base:c.B.base});const nativeAbilities=()=>{reading.ctx.B=c.B;reading.ctx.S=c.S;reading.ctx.vecnaGraftAbilitySources=c.vecnaGraftAbilitySources;reading.ctx.activeFx=()=>c.activeFx(c.attunementState());return reading.calculate()};c.abilScores=nativeAbilities;
 mutate(c);let C;
 const project=(stateOverride=c.S.vecnaGrafts,buildOverride=c.B)=>{const prior=c.B;c.B=buildOverride;try{return c.withVecnaGraftsProjection(stateOverride,()=>{const out=e.project(),ATT=e.attunement(),AFX=c.activeFx(ATT),ctx={C:out,i:{B:c.B,ATT,AFX},patch:()=>({})};edition.run({C:out,i:{r14:c.B.rs==='2014'},l:{spd:out.speed??30,spSrc:out.speedSrc??''},patch:()=>({})});const ability=nativeAbilities();e.groups.find(g=>g.id==='abilities').run({C:out,i:{B:c.B,a:ability},patch:()=>({})});advantage.run(ctx);if(typeof nativeDerivedProjection==='function')nativeDerivedProjection(out,ctx,{c,groups:e.groups});post.run(ctx);handPost.run(ctx);return out})}finally{c.B=prior}};
 const setC=value=>{C=value;c.C=value;e.setCurrent(value)};setC(project());
 return {c,groups:e.groups,project,get C(){return C},setC,setCurrent:setC,attunement:e.attunement,setReadOnly:e.setReadOnly};
}
