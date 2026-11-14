import assert from'node:assert/strict';import{readyTravelGoat}from'./fixtures/travel-goat-native.mjs';
let n=0;const eq=(a,b)=>{assert.deepEqual(a,b);n++};
for(const[profileId,actorRuleset,source,ac,action]of [['legacy-goats','2024','mm14','10','Action'],['current-goats','2014','core','11','Magic action']]){
 const{e,id,key}=readyTravelGoat(profileId);e.c.B.rs=actorRuleset;e.setC(e.project());eq(e.C.rs,actorRuleset);eq(e.info().physical[0].sourceAction,action);eq(e.command('activate',{physicalId:id,facts:{actualSourceActionCompleted:true,actualClearSpaceWithin60Feet:true}}).ok,true);const active=e.info().physical[0].active;eq(active.creature.source,source);eq(active.creature.definition.tl.find(row=>row[0]==='AC')[1],ac);eq(active.creature.maxHP,13);eq(e.c.S.used[key],0);
}
console.log(n+' actual crossed actor-edition / original Traveling-source NPC/action checks PASS');
