DataEnv.declare("__fxZ6");
/* Target-qualified weapon damage. Unknown target facts grant no rider. */
(function(){
 if(DataEnv.slot.__fxZ6)return;DataEnv.slot.__fxZ6=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 function rider(n,target,d,t){(GX.item[n]=GX.item[n]||[]).push({n:n,target:target,atkDice:[{when:n,d:d,t:t,roll:true}]})}
 rider("Ebonbane",{types:["Celestial","Humanoid"]},"3d6","Necrotic");
 rider("Wrought-Iron Tower",{creature:true,alignment:"Good"},"3d6","Fire");
})();
