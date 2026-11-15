import assert from 'node:assert/strict';
import {perceptionItemProfiles,canonicalPerceptionItemDefinition as canonical} from '../src/data/lib/perception-item-profiles.js';
import {perceptionItemSource,perceptionItemSourcesProblems,perceptionItemSourceStatus,perceptionItemFlag,perceptionItemCertificateCurrent} from '../src/data/lib/perception-item-source.js';
let count=0;const check=(actual,expected)=>{assert.deepEqual(actual,expected);count++;};
for(const p of perceptionItemProfiles()){
 const row={n:p.item,key:p.item,eq:true,q:1,att:p.requiresAttunement,attunedActive:p.requiresAttunement};
 const frame={item:p.item,row,attunement:{requires:p.requiresAttunement,attuned:p.requiresAttunement},originalCatalogRows:[p.row],resolvedRow:p.row};
 const source=perceptionItemSource(frame);check(source.ok,true);check(source.mode,'native');
 const binding={index:0,item:p.item,mode:source.mode,definitionFingerprint:source.definitionFingerprint,flags:source.flags,inventoryName:row.n,inventoryKey:row.key};
 const C={inv:[row],itemAdv:[],perceptionItemSources:{v:1,inventoryFingerprint:canonical([row]),bindings:[binding]}};
 check(perceptionItemSourcesProblems(C.perceptionItemSources),[]);check(perceptionItemSourceStatus(C).verified,true);
 const flag={k:'Perception',s:p.item,ab:'WIS'};check(perceptionItemFlag(C,flag),flag);check(perceptionItemFlag(C,{k:'Perception',s:p.item,ab:'CHA'}),null);check(perceptionItemFlag(C,{k:'Perception',s:p.item}),null);
 check(perceptionItemFlag(C,{k:'Initiative',s:p.item}),{k:'Initiative',s:p.item});
 check(perceptionItemCertificateCurrent(C,{originalCatalogRows:[p.row]}).current,true);check(perceptionItemCertificateCurrent(C,{originalCatalogRows:[]}).current,false);
 const changed=structuredClone(C);changed.inv[0].n=changed.inv[0].key='Longsword';changed.perceptionItemSources.inventoryFingerprint=canonical(changed.inv);check(perceptionItemSourceStatus(changed).verified,false);check(perceptionItemFlag(changed,flag),null);
 const fake=structuredClone(C);fake.perceptionItemSources.bindings[0].mode='custom';fake.perceptionItemSources.bindings[0].definitionFingerprint='future';check(perceptionItemSourcesProblems(fake.perceptionItemSources).length>0,true);
 const future={inv:[{n:'WatchRod',key:'WatchRod'}],perceptionItemSources:{v:99}};check(perceptionItemFlag(future,{k:'Perception',s:'WatchRod'}),null);
 check(perceptionItemSource({...frame,row:{...row,key:undefined}}).ok,false);
 check(perceptionItemSource({...frame,row:{...row,n:'WatchRod',key:'WatchRod'},resolvedName:'WatchRod',gxItems:{WatchRod:{}}}).ok,false);
 const customItem=[p.item,'Wondrous Item','Rare',0,'',{fx:{adv:['Perception']}}];
 const custom=perceptionItemSource({...frame,customItems:[customItem],entryFx:{adv:['Perception']}});check(custom.ok,true);check(custom.mode,'custom');
 const customC=structuredClone(C);Object.assign(customC.perceptionItemSources.bindings[0],{mode:'custom',definitionFingerprint:custom.definitionFingerprint,flags:custom.flags});
 check(perceptionItemSourcesProblems(customC.perceptionItemSources),[]);check(perceptionItemFlag(customC,{k:'Perception',s:p.item}),{k:'Perception',s:p.item});
 check(perceptionItemCertificateCurrent(customC,{customItems:[customItem]}).current,true);check(perceptionItemCertificateCurrent(customC,{customItems:[]}).current,false);
 check(perceptionItemFlag({inv:[]},{k:'Perception',s:'Other item'}),{k:'Perception',s:'Other item'});
 const alias=structuredClone(C);alias.inv[0].n=alias.inv[0].key='WatchRod';Object.assign(alias.perceptionItemSources.bindings[0],{inventoryName:'WatchRod',inventoryKey:'WatchRod'});alias.perceptionItemSources.inventoryFingerprint=canonical(alias.inv);check(perceptionItemFlag(alias,{k:'Perception',s:'WatchRod',ab:'WIS'}),{k:'Perception',s:'WatchRod',ab:'WIS'});
 check(perceptionItemCertificateCurrent(alias,{originalCatalogRows:[p.row],gxItems:{WatchRod:{}}}).current,false);
 const legacy=p.definitions.find(definition=>definition.edition==='2014');
 const legacyFrame={...frame,resolvedRow:legacy.row,legacyCatalogRows:[legacy.row]};
 const legacySource=perceptionItemSource(legacyFrame);check(legacySource.ok,true);check(legacySource.definitionFingerprint,legacy.fingerprint);
 check(perceptionItemSource({...legacyFrame,legacyCatalogRows:[]}).ok,false);
 check(perceptionItemSource({...legacyFrame,originalCatalogRows:[legacy.row]}).ok,false);
 check(perceptionItemSource({...legacyFrame,legacyCatalogRows:[legacy.row,legacy.row]}).ok,false);
 const changedLegacy=structuredClone(legacy.row);changedLegacy[4]+=' changed';check(perceptionItemSource({...legacyFrame,legacyCatalogRows:[changedLegacy]}).ok,false);
 const legacyC=structuredClone(C);legacyC.perceptionItemSources.bindings[0].definitionFingerprint=legacy.fingerprint;
 check(perceptionItemSourcesProblems(legacyC.perceptionItemSources),[]);check(perceptionItemFlag(legacyC,flag),flag);check(perceptionItemFlag(legacyC,{k:'Perception',s:p.item,ab:'CHA'}),null);
 check(perceptionItemCertificateCurrent(legacyC,{originalCatalogRows:[p.row],legacyCatalogRows:[legacy.row]}).current,true);
 check(perceptionItemCertificateCurrent(legacyC,{originalCatalogRows:[p.row],legacyCatalogRows:[]}).current,false);
 check(perceptionItemCertificateCurrent(legacyC,{originalCatalogRows:[p.row],legacyCatalogRows:[changedLegacy]}).current,false);
 check(perceptionItemCertificateCurrent(legacyC,{originalCatalogRows:[p.row],legacyCatalogRows:[legacy.row],resolvedRows:{[p.item]:p.row}}).current,false);
 check(perceptionItemCertificateCurrent(legacyC,{originalCatalogRows:[p.row],legacyCatalogRows:[legacy.row],resolvedRows:{[p.item]:legacy.row}}).current,true);

 if(!p.requiresAttunement){const multi=structuredClone(C);multi.inv.push({...row,n:'Second Shield',key:'Second Shield'});multi.perceptionItemSources.bindings.push({...binding,index:1,inventoryName:'Second Shield',inventoryKey:'Second Shield'});multi.perceptionItemSources.inventoryFingerprint=canonical(multi.inv);check(perceptionItemSourceStatus(multi).verified,true);}
}
console.log(`perception item source: ${count} checks PASS`);
