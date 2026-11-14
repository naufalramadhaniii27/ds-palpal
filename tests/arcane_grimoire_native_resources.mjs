import assert from'node:assert/strict';import{createArcaneGrimoireEngine,nativeArcaneRecoveryRows}from'./fixtures/arcane-grimoire-native.mjs';
let checks=0;const eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
for(const actorRuleset of ['2024','2014'])for(const magnitude of [1,2,3])for(const secondaryWizard of [false,true]){
 const e=createArcaneGrimoireEngine({item:'+'+magnitude+' Arcane Grimoire',actorRuleset,...(secondaryWizard?{main:'Druid',secondary:'Wizard',spells:['Guidance'],secondarySpells:['Fire Bolt']}:{} )}),c=e.c,pool=e.C.res.find(r=>r.n==='Arcane Recovery'),before=structuredClone(e.C.res),rows=nativeArcaneRecoveryRows(e),recovery=rows.find(r=>r.n==='Arcane Recovery');
 eq(pool.k,secondaryWizard?'m-wizard-arcane-recovery':'r-arcane-recovery');eq(pool.max,1);eq(pool.reset,'long');eq(c.attunementState().rows[0].attuned,true);eq(e.C.arcaneGrimoireRecovery.bonus,1);eq(e.C.arcaneGrimoireRecovery.wizardLevel,5);eq(recovery.cap,4);eq(recovery.grimoireBonus,1);eq(recovery.left,1);eq(e.C.res,before);eq(e.C.spellcasting.slots.slice(0,3),secondaryWizard?[4,3,3]:[4,3,2]);
 // Recovery's separate paragraph works while the attuned book is stowed.
 c.B.inv[0].eq=false;e.setC(e.project());eq(nativeArcaneRecoveryRows(e).find(r=>r.n==='Arcane Recovery').cap,4);c.B.inv[0].eq=true;
 for(const change of [row=>row.attuned=false,row=>row.q=0]){const raw=structuredClone(c.B.inv[0]);change(c.B.inv[0]);e.setC(e.project());eq(Object.hasOwn(e.C,'arcaneGrimoireRecovery'),false);eq(nativeArcaneRecoveryRows(e).find(r=>r.n==='Arcane Recovery').cap,3);c.B.inv[0]=raw;}
 e.setC(e.project());c.S.used[pool.k]=1;eq(nativeArcaneRecoveryRows(e).find(r=>r.n==='Arcane Recovery').left,0);eq(e.C.res.find(r=>r.k===pool.k).max,1);
}
// Three differently-magnituded books are one named +1 effect, not +3 or a new use.
{const e=createArcaneGrimoireEngine({inventory:[1,2,3].map(n=>({n:'+'+n+' Arcane Grimoire',q:1,eq:false,attuned:true}))});eq(e.c.attunementState().used,3);eq(nativeArcaneRecoveryRows(e).find(r=>r.n==='Arcane Recovery').cap,4);eq(e.C.res.find(r=>r.n==='Arcane Recovery').max,1);}
console.log(checks+' actual native 12i/12zg/ATT/32d Arcane Recovery resource and numerical allowance checks PASS');
