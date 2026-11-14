/* Actual item resource producer + original catalogs + native source/postprojection + transaction controller. */
import fs from 'node:fs';import vm from 'node:vm';import {createBagTricksEngine,bagNativeData} from './bag-tricks-native.mjs';
import {createReadingEngine} from './necronomicon-native.mjs';
import {travelGoatResourceSummary} from '../../src/app/lib/travel-goat-inventory.js';
import * as model from '../../src/data/lib/travel-goat.js';import * as source from '../../src/data/lib/travel-goat-source.js';import * as profile from '../../src/data/lib/travel-goat-profile.js';
const read=p=>fs.readFileSync(new URL('../../src/'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/export /g,''),line=(s,n)=>s.split('\n').find(v=>v.startsWith('function '+n+'('));
export function createTravelGoatEngine({namespace,inventory,used={},readOnly=false,profileId='current-generic',controller=true}={}){
 const p=profile.travelGoatProfile(profileId);if(!p)throw Error('Actual source profile required');const ability=createReadingEngine(),e=createBagTricksEngine({inventory:inventory??[{n:p.item,q:1,eq:false}],used}),c=e.c;
 Object.assign(c,model,source,profile,{model,goats:model,travel:model});c.B={...structuredClone(ability.ctx.B),...c.B};c.B.rs=p.edition==='legacy'?'2014':'2024';c.B.src={core:true,dmg:true,dmg14:true};c.B.pk={};c.B.ch={};c.S.hp=25;c.FXO={};c.GX={item:{}};c.fxo=()=>c.FXO;c.gx=()=>c.GX;c.lateGet=k=>c[k];
 c.DMGI=c.DMGI.concat(bagNativeData.legacy.filter(row=>!c.DMGI.some(v=>v[0]===row[0])));c.DMAP=Object.fromEntries(c.DMGI.map(row=>[row[0],row]));if(namespace!==undefined)c.S.travelGoat=structuredClone(namespace);
 let C={name:'Actor',cid:'actor',inv:structuredClone(c.B.inv),hp:25,res:[]},onUndo=()=>{},onSave=()=>{},onPublish=()=>{},undos=0;
 c.genv.__sheetId=()=> 'actor';c.genv.__sheetState=()=>({C,state:c.S,readOnly});c.sheetState=c.genv.__sheetState;
 const helpers=read('builder/10r-logic-travel-goat.js'),exports=[...helpers.matchAll(/export function (\w+)/g)].map(m=>m[1]);vm.runInContext('(function(){'+strip(helpers)+';Object.assign(globalThis,{'+exports.join(',')+'});})()',c);
 let group;c.registerSheetGroup=value=>group=value;vm.runInContext(strip(read('builder/12zf-logic-travel-goat.js')),c);vm.runInContext(line(read('builder/12i-logic-sheet-handlers-gear-resources.js'),'invTattoo'),c);
 const core=read('builder/12c-logic-sheet-handlers-core.js'),astart=core.indexOf('registerSheetGroup({id:"abilities"'),aend=core.indexOf('\nregisterSheet',astart+1);let abilitiesGroup;c.ABK=ability.ctx.ABK;c.registerSheetGroup=value=>abilitiesGroup=value;vm.runInContext(core.slice(astart,aend),c);
 const project=options=>{const run=()=>{const out={name:c.B.name,cid:c.B.cid,rs:c.B.rs,inv:c.B.inv.map(row=>{const result=structuredClone(row);c.invTattoo(row,result);return result}),hp:25,res:[],abilities:{}};ability.ctx.B=c.B;ability.ctx.S=c.S;abilitiesGroup.run({C:out,i:{B:c.B,a:ability.calculate()},patch:()=>({})});for(const[index,row]of c.B.inv.entries())c.luItemRow(out,row,index);group.run({C:out,i:{B:c.B},patch:()=>({})});return out};return Object.hasOwn(options||{},'travelGoat')?c.withTravelGoatProjection(options.travelGoat,run,options.used??c.S.used):run()};
 c.borrowedProjection=project;c.withB=(build,run)=>{const old=c.B;try{c.B=build;return run()}finally{c.B=old}};c.borrowedBound=owner=>c.B.name===owner&&c.B.cid==='actor'?{B:c.B}:null;c.__set_B=build=>c.B=build;c.save=()=>{};c.genv.__travelGoatSave=state=>onSave(state);c.genv.__sheetSoft=next=>{onPublish(next);C=next;c.C=next};C=project(namespace===undefined?{}:{travelGoat:namespace});c.C=C;
 if(controller)vm.runInContext('(function(){'+strip(read('builder/25r-logic-travel-goat.js'))+'})()',c);
 const info=()=>c.genv.__bldTravelGoatInfo('Actor'),capture=()=>c.genv.__bldTravelGoatCapture('Actor',{signature:info().signature}),before=()=>{undos++;return onUndo()},command=(kind,body={},token=capture())=>c.genv.__bldTravelGoatCommand(token,kind,body,before,()=>true),accept=receipt=>c.genv.__bldTravelGoatAcceptReceipt(receipt);
 return {c,info,capture,before,command,project,accept,get C(){return C},get undos(){return undos},setC:value=>{C=value;c.C=value},setUndo:fn=>onUndo=fn,setSave:fn=>onSave=fn,setPublish:fn=>onPublish=fn,setReadOnly:value=>readOnly=value};
}

export function nativeTravelResourceView(engine,key){
 const c=engine.c,appRead=p=>fs.readFileSync(new URL('../../src/app/'+p,import.meta.url),'utf8'),helper=appRead('05-logic-helpers.js'),derivation=appRead('06-logic-derivation.js'),render=appRead('08-ui-render-sheet-and-actions.js');
 for(const name of ['num','clamp','sg','esc'])vm.runInContext(helper.split('\n').find(l=>l.startsWith('export function '+name+'(')).replace('export ',''),c);
 c.D={hpmax:25};vm.runInContext(derivation.split('\n').find(l=>l.startsWith('function derivedTravelGoatFields(')),c);const start=derivation.indexOf('function deriveResources('),end=derivation.indexOf('\nfunction ',start+1);vm.runInContext(derivation.slice(start,end),c);c.deriveResources(5,8,1);
 vm.runInContext(render.split('\n').find(l=>l.startsWith('export function used(')).replace('export ',''),c);
 return {row:c.D.res.find(r=>r.k===key),used:c.used(key,24),remaining:24-c.used(key,24)};
}

export function nativeTravelResourceHTML(engine,key){const result=nativeTravelResourceView(engine,key),c=engine.c,render=fs.readFileSync(new URL('../../src/app/08-ui-render-sheet-and-actions.js',import.meta.url),'utf8');c.travelGoatResourceSummary=travelGoatResourceSummary;c.summonResourceManaged=()=>{throw Error('Travel counter fell through into generic pips')};const start=render.indexOf('export function boxes('),end=render.indexOf('export function used(',start);vm.runInContext(render.slice(start,end).replace('export ',''),c);return {...result,html:c.boxes(result.used,24,key,'Traveling charges',false)}}

export function readyTravelGoat(profileId='current-generic',remaining=24,options={}){const e=createTravelGoatEngine({...options,profileId}),admit=e.command('admit',{index:0,nativeProfile:profileId,facts:{actualPhysicalIdentityVerified:true,actualTravelingComponentVerified:true,actualIvoryGoatTravelingSelection:profileId==='current-generic'}});if(!admit.ok)throw Error(admit.reason);const physical=e.c.S.travelGoat.physical.at(-1),review=e.command('review',{physicalId:physical.id,remaining,facts:{actualTravelChargeHistoryVerified:true}});if(!review.ok)throw Error(review.reason);return {e,id:physical.id,key:physical.budgetKey}}
