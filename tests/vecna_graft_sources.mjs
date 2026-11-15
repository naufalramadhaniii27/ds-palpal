import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {vecnaGraftProfiles,vecnaGraftNativeGx,canonical} from '../src/data/lib/vecna-graft-profiles.js';
import {createVecnaGrafts,admitVecnaGraft,recordVecnaAttachment,recordVecnaDetachment} from '../src/data/lib/vecna-grafts.js';
import {vecnaGraftSourcesProblems,vecnaGraftSourcesSupported,vecnaGraftSourceStatus,vecnaGraftFlag,vecnaGraftCertificateCurrent,VECNA_GRAFT_LABEL} from '../src/data/lib/vecna-graft-source.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},profiles=vecnaGraftProfiles();let state=createVecnaGrafts();
for(const p of profiles){state=admitVecnaGraft(state,{profile:p.id,part:p.part,itemFingerprint:p.itemFingerprint},{actualPhysicalArtifactIdentityVerified:true,actualCurrentOriginalSourceVerified:true}).state;state=recordVecnaAttachment(state,state.physical.at(-1).id,{actualPhysicalIdentityVerified:true,[p.part==='eye'?'actualEyeFusedIntoThisCharactersSocket':'actualHandGraftedOntoThisCharactersLeftStump']:true,printedRemovalConsequenceAcknowledged:true}).state;}
const inv=profiles.map((p,index)=>({n:p.item,key:p.item,q:1,eq:false,attunedActive:true,vecnaGraft:{v:1,id:state.physical[index].id}})),S={vecnaGrafts:structuredClone(state)},C={inv,vecnaGrafts:state,itemAdv:[{k:'Initiative',s:VECNA_GRAFT_LABEL}]};
C.vecnaGraftSources={v:1,inventoryFingerprint:canonical(inv),authorityFingerprint:canonical(state),bindings:profiles.map((p,index)=>({id:state.physical[index].id,profile:p.id,index,itemFingerprint:p.itemFingerprint,inventoryName:inv[index].n,inventoryKey:inv[index].key}))};
const frame={originalCatalogRows:profiles.map(p=>p.row),resolvedRows:Object.fromEntries(profiles.map(p=>[p.item,p.row])),customItems:[]},flag=C.itemAdv[0];
eq(vecnaGraftSourcesProblems(C.vecnaGraftSources),[]);eq(vecnaGraftSourcesSupported(C,S),true);eq(vecnaGraftSourceStatus(C,S).initiativeAdvantage,true);eq(vecnaGraftFlag(C,flag,S),flag);eq(vecnaGraftCertificateCurrent(C,S,frame).current,true);eq(vecnaGraftCertificateCurrent(C,undefined,frame).current,false);eq(vecnaGraftCertificateCurrent(C,null,frame).current,false);
eq(vecnaGraftFlag(C,{...flag,ab:'DEX'},S),null);eq(vecnaGraftFlag({},flag),null);eq(vecnaGraftSourceStatus({itemAdv:[flag]}).reviewRequired,true);
for(const source of ['Manual','Eye of Vecna','Hand of Vecna','Weapon of Warning']){const row={k:'Initiative',s:source};eq(vecnaGraftFlag({},row),row);}
const altered=structuredClone(C);altered.inv[0].n=altered.inv[0].key='Longsword';altered.vecnaGraftSources.inventoryFingerprint=canonical(altered.inv);eq(vecnaGraftSourcesSupported(altered,S),false);eq(vecnaGraftFlag(altered,flag,S),null);
for(const field of ['vecnaGrafts','vecnaGraftSources'])for(const value of [undefined,null,{v:99}]){const future=structuredClone(C);future[field]=value;const before=structuredClone(future);eq(vecnaGraftSourceStatus(future,S).verified,false);eq(vecnaGraftFlag(future,flag,S),null);eq(future,before);}
const wrongS={vecnaGrafts:undefined};eq(vecnaGraftSourcesSupported(C,wrongS),false);eq(vecnaGraftFlag(C,flag,wrongS),null);
for(const change of [c=>c.inv[1].attunedActive=false,c=>c.inv[1].q=2,c=>c.inv[1].vecnaGraft.id='vg-1']){const bad=structuredClone(C);change(bad);bad.vecnaGraftSources.inventoryFingerprint=canonical(bad.inv);eq(vecnaGraftSourcesSupported(bad,S),false);}
eq(vecnaGraftCertificateCurrent(C,S,{...frame,originalCatalogRows:[]}).current,false);eq(vecnaGraftCertificateCurrent(C,S,{...frame,originalCatalogRows:profiles.map(p=>p.legacyRow)}).current,false);
for(const field of ['fxOverrides','gxItems'])eq(vecnaGraftCertificateCurrent(C,S,{...frame,[field]:{[profiles[0].item]:undefined}}).current,false);
const changedRows=structuredClone(frame.resolvedRows);changedRows[profiles[0].item][4]+=' changed';eq(vecnaGraftCertificateCurrent(C,S,{...frame,resolvedRows:changedRows}).current,false);
eq(vecnaGraftCertificateCurrent(C,S,{originalCatalogRows:frame.originalCatalogRows}).current,true);
let getterReads=0;const getter=structuredClone(C);Object.defineProperty(getter,'vecnaGraftSources',{get(){getterReads++;return C.vecnaGraftSources},enumerable:true});eq(vecnaGraftSourceStatus(getter,S).verified,false);eq(vecnaGraftCertificateCurrent(getter,S,frame).current,false);eq(getterReads,0);
const hidden=structuredClone(C);Object.defineProperty(hidden,'vecnaGraftSources',{value:C.vecnaGraftSources,enumerable:false});eq(vecnaGraftSourcesSupported(hidden,S),false);
const cap=structuredClone(C.vecnaGraftSources);Object.defineProperty(cap.bindings[0],'profile',{get(){getterReads++;return profiles[0].id},enumerable:true});eq(vecnaGraftSourcesProblems(cap).length>0,true);eq(getterReads,0);
const removed=recordVecnaDetachment(state,'vg-1',{actualPhysicalRemovalVerified:true,printedRemovalConsequenceAcknowledged:true}).state,negative=structuredClone(C);negative.vecnaGrafts=removed;negative.vecnaGraftSources.authorityFingerprint=canonical(removed);eq(vecnaGraftSourcesSupported(negative,{vecnaGrafts:removed}),true);eq(vecnaGraftFlag(negative,flag,{vecnaGrafts:removed}),null);
{
 const GX={},FXO={},actual=vm.createContext({GX,FXO,DataEnv:{slot:{GX,FXO}}});vm.runInContext(fs.readFileSync(new URL('../src/data/fx-L4.js',import.meta.url),'utf8'),actual);
 for(const p of profiles){eq(canonical(GX.item[p.item]),p.nativeGxFingerprint);eq(vecnaGraftNativeGx(p.item,GX.item[p.item]),true);eq(vecnaGraftNativeGx(p.item,undefined),false);}
 eq(vecnaGraftCertificateCurrent(C,S,{...frame,gxItems:GX.item}).current,true);
 const changed=structuredClone(GX.item);changed[profiles[0].item][0].sense[0][1]=241;eq(vecnaGraftCertificateCurrent(C,S,{...frame,gxItems:changed}).current,false);
 const extra=structuredClone(GX.item);extra[profiles[1].item].push({n:'Unapproved extra property'});eq(vecnaGraftCertificateCurrent(C,S,{...frame,gxItems:extra}).current,false);
 const aliasC=structuredClone(C);aliasC.inv[0].n='Eye Alias';aliasC.vecnaGraftSources.bindings[0].inventoryName='Eye Alias';aliasC.vecnaGraftSources.inventoryFingerprint=canonical(aliasC.inv);const aliases={...frame.resolvedRows,'Eye Alias':profiles[0].row};eq(vecnaGraftCertificateCurrent(aliasC,S,{...frame,resolvedRows:aliases,gxItems:{...GX.item,'Eye Alias':GX.item[profiles[0].item]}}).current,false);
 const emptyAlias={...GX.item,'Eye Alias':[]};eq(vecnaGraftCertificateCurrent(aliasC,S,{...frame,resolvedRows:aliases,gxItems:emptyAlias}).current,false);
}
console.log(`${checks} portable Vecna source/capability/flag/current checks PASS`);
