/* Actual 25t host + native source/projection; only storage/render adapters isolated. */
import fs from 'node:fs';import vm from 'node:vm';
import {createVecnaGraftsEngine} from './vecna-grafts-native.mjs';
import {createVecnaGraftsController} from '../../src/data/lib/vecna-graft-controller.js';
import {migrateItems} from '../../src/data/lib/attunement.js';
import {spellGemProfile} from '../../src/data/lib/spell-gem.js';
const read=p=>fs.readFileSync(new URL('../../src/'+p,import.meta.url),'utf8'),strip=s=>s.replace(/^import [^\n]*\n/gm,'').replace(/^export /gm,'');
export function createVecnaManagementEngine(options={}){const e=createVecnaGraftsEngine(options),c=e.c;c.spellGemProfile=spellGemProfile;vm.runInContext(read('builder/03-logic-magic-item-effects.js').split('\n').find(l=>l.startsWith('export function attunementMeta(')).replace('export ',''),c);let undos=0,saves=0,rejectSave=false,readOnly=false;Object.assign(c,{createVecnaGraftsController,KEY:'native-build',__set_B:b=>c.B=b});c.S.used={unrelated:3};
 c.genv.__appVer=134;c.genv.__lsSave=(_key,value)=>{value._app=Math.max(+value._app||0,134);return true};
 c.genv.__sheetState=()=>({C:e.C,state:c.S,readOnly});c.borrowedBound=name=>!readOnly&&name===e.C.name&&c.B.name===name&&c.B.cid===e.C.cid?{B:c.B,C:e.C,S:c.S}:null;
 c.withB=(build,run)=>{const prior=c.B;try{const normalized=structuredClone(build);normalized.inv=migrateItems(normalized.inv,c.attunementMeta);c.B=normalized;return run()}finally{c.B=prior}};
 c.borrowedProjection=()=>e.project(c.vecnaGraftsOwnedState(),c.B);vm.runInContext(strip(read('builder/04-logic-storage.js').split('\n').find(l=>l.startsWith('export function save(){'))),c);
 c.genv.__vecnaGraftsSave=S=>{if(S!==c.S||readOnly)return false;saves++;return !rejectSave};
 vm.runInContext('(function(){'+strip(read('builder/25t-logic-vecna-grafts.js'))+'})()',c);
 c.genv.__sheetSoft=next=>{if(c.genv.__bldVecnaGraftsInventoryOwner(e.C,next,c.S,next,true)?.ok!==true)throw Error('private-publication-required');e.setC(next)};
 const info=()=>c.genv.__bldVecnaGraftsInfo(e.C.name),capture=()=>c.genv.__bldVecnaGraftsCapture(e.C.name,{signature:info().signature}),before=()=>{undos++;return true},command=(kind,body)=>c.genv.__bldVecnaGraftsCommand(capture(),kind,body,before,()=>true),controller={info:c.genv.__bldVecnaGraftsInfo,capture:c.genv.__bldVecnaGraftsCapture,current:c.genv.__bldVecnaGraftsTokenCurrent,command:c.genv.__bldVecnaGraftsCommand,acceptReceipt:c.genv.__bldVecnaGraftsAcceptReceipt,inventoryOwner:(C,N,S,only=false)=>c.genv.__bldVecnaGraftsInventoryOwner(C,N,S,N,only)};
 return {e,controller,info,capture,command,before,get undos(){return undos},get saves(){return saves},set rejectSave(v){rejectSave=v},setReadOnly:v=>readOnly=v};}
