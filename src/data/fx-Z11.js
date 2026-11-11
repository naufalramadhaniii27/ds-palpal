DataEnv.declare("__fxZ11");
/* A paid melee hit against a creature missing Hit Points. */
(function(){
 if(DataEnv.slot.__fxZ11)return;DataEnv.slot.__fxZ11=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 var n="Cinder Coat";
 (GX.item[n]=GX.item[n]||[]).push({n:n,target:{creature:true,missingHp:true},atkSpendDice:[{when:"any",n:"Cinder Strike",d:"1d10",type:"Fire",maxCost:1,resource:{kind:"charges"},attackKind:"melee"}]});
})();
