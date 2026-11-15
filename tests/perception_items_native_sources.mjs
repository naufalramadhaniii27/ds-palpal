import assert from'node:assert/strict';import{createPerceptionItemsEngine}from'./fixtures/perception-items-native.mjs';import{perceptionItemFlag,perceptionItemSourceStatus}from'../src/data/lib/perception-item-source.js';import{canonicalPerceptionItemDefinition,perceptionItemDefinition}from'../src/data/lib/perception-item-profiles.js';
let checks=0;const eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
for(const actorRuleset of ['2024','2014'])for(const item of ['Rod of Alertness','Sentinel Shield']){
 const e=createPerceptionItemsEngine({item,actorRuleset}),c=e.c;eq(e.C.itemAdv,[{k:'Perception',s:item,ab:'WIS'},{k:'Initiative',s:item}]);eq(perceptionItemSourceStatus(e.C).verified,true);eq(e.attunement().used,item==='Rod of Alertness'?1:0);eq(perceptionItemFlag(e.C,e.C.itemAdv[0]).ab,'WIS');eq(Object.hasOwn(perceptionItemFlag(e.C,e.C.itemAdv[1]),'ab'),false);
 eq(e.c.DM14ON,actorRuleset==='2014');eq(perceptionItemDefinition(item,e.C.perceptionItemSources.bindings[0].definitionFingerprint).edition,actorRuleset);if(actorRuleset==='2014'){eq(e.C.rs,'2014');eq(canonicalPerceptionItemDefinition(c.DMAP[item]),canonicalPerceptionItemDefinition(c.DM14.ov[item]));eq(Array.isArray(c.DM14S),true);}
 const original=structuredClone(e.C);for(const change of [row=>row.eq=false,row=>row.q=0,...(item==='Rod of Alertness'?[row=>row.attuned=false]:[])]){const row=structuredClone(c.B.inv[0]);change(c.B.inv[0]);e.setC(e.project());eq(e.C.itemAdv,[]);eq(Object.hasOwn(e.C,'perceptionItemSources'),false);c.B.inv[0]=row;e.setC(e.project());}
 if(item==='Sentinel Shield'){c.B.inv[0].attuned=false;e.setC(e.project());eq(e.C.itemAdv[0].ab,'WIS');eq(e.attunement().used,0);}
 // Loaded pre-U61 generic flags are inert; source labels grant no new permission.
 const old=structuredClone(original);delete old.perceptionItemSources;delete old.itemAdv[0].ab;const before=structuredClone(old);for(const row of old.itemAdv)eq(perceptionItemFlag(old,row),null);eq(old,before);eq(perceptionItemSourceStatus(old).reviewRequired,true);
 for(const opaque of [undefined,{v:99,opaque:['preserved']}]){const future=structuredClone(original);future.perceptionItemSources=opaque;for(const row of future.itemAdv)eq(perceptionItemFlag(future,row),null);}
 // A changed native inventory cannot keep a previously valid source capability.
 const stale=structuredClone(original);stale.inv[0].eq=false;for(const row of stale.itemAdv)eq(perceptionItemFlag(stale,row),null);
}
console.log(checks+' actual native 03/ATT/12j/12zh source, typed flag and old/future sheet boundary checks PASS');
