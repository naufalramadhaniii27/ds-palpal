/* Actual original 03/allocated ATT/12j/12zh producers. No flag permission is fabricated. */
import fs from'node:fs';import vm from'node:vm';import{createBracersEngine}from'./bracers-native.mjs';import{loadPerceptionItemsNative}from'./load-perception-items-native.mjs';
const read=p=>fs.readFileSync(new URL('../../src/'+p,import.meta.url),'utf8');
const original=vm.createContext({});vm.runInContext(read('data/dmgi-magic-items-dmg2024.js'),original);export const originalPerceptionLegacyOverlay=structuredClone(original.DM14);
export function createPerceptionItemsEngine({item='Rod of Alertness',inventory,actorRuleset='2024',mutate=()=>{}}={}){
 const e=createBracersEngine({inventory:inventory??[{n:item,q:1,eq:true,attuned:true}]}),c=e.c;c.B.rs=actorRuleset;c.B.src={core:true,dmg:true,dmg14:true};
 // Match the real actor-edition item overlay, retaining its original current catalogue snapshot.
 c.DM14=structuredClone(originalPerceptionLegacyOverlay);c.genv.DM14=c.DM14;const overlay=read('builder/09c-logic-edition-overlays.js'),start=overlay.indexOf('/* dm14Set steps'),end=overlay.indexOf('genv.__sp14Set=',start);if(start<0||end<0)throw Error('Actual native DM14 overlay missing');vm.runInContext('var DM14ON=false,DM14S=null,DM14M=null;'+overlay.slice(start,end).replace(/export /g,''),c);c.dm14Set(actorRuleset==='2014',true);
 loadPerceptionItemsNative(c);mutate(c);
 let edition;c.registerSheetGroup=g=>edition=g;const movement=read('builder/12f-logic-sheet-handlers-movement.js'),ma=movement.indexOf('registerSheetGroup({id:"speed-sheet"'),mb=movement.indexOf('/* ---------- Darkvision',ma);vm.runInContext(movement.slice(ma,mb),c);
 let advantage,post;c.registerSheetGroup=g=>advantage=g;const text=read('builder/12j-logic-sheet-handlers-features.js'),a=text.indexOf('registerSheetGroup({id:"item-advantage"'),b=text.indexOf('\nregisterSheet',a+1);vm.runInContext(text.slice(a,b),c);c.registerSheetGroup=g=>post=g;vm.runInContext(read('builder/12zh-logic-perception-items.js').replace(/^import [^\n]*\n/gm,''),c);
 const project=()=>{const out=e.project(),ATT=e.attunement(),AFX=c.activeFx(ATT),ctx={C:out,i:{B:c.B,ATT,AFX},patch:()=>({})};edition.run({C:out,i:{r14:c.B.rs==='2014'},l:{spd:out.speed??30,spSrc:out.speedSrc??''},patch:()=>({})});advantage.run(ctx);post.run(ctx);return out};let C=project();const setC=value=>{C=value;c.C=value;e.setCurrent(value)};setC(C);return {c,project,get C(){return C},setC,setCurrent:setC,setReadOnly:e.setReadOnly,attunement:e.attunement};
}
