DataEnv.declare("__fxZ6");
/* Target-qualified weapon damage. Unknown target facts grant no rider. */
(function(){
 if(DataEnv.slot.__fxZ6)return;DataEnv.slot.__fxZ6=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 function rider(n,target,d,t){(GX.item[n]=GX.item[n]||[]).push({n:n,target:target,atkDice:[{when:n,d:d,t:t,roll:true}]})}
 rider("Mace of Disruption",{types:["Fiend","Undead"]},"2d6","Radiant");
 rider("Flayer Slayer",{types:["Aberration"]},"1d12","Slashing");
 (GX.item["Lightbringer"]=GX.item["Lightbringer"]||[]).push({n:"Lightbringer",toggle:{id:"lightbringer-glow",label:"Lightbringer: glowing",default:false},target:{types:["Undead"]},atkDice:[{when:"Lightbringer",d:"1d6",t:"Radiant",roll:true}]});
 rider("Ebonbane",{types:["Celestial","Humanoid"]},"3d6","Necrotic");
 rider("Wrought-Iron Tower",{creature:true,alignment:"Good"},"3d6","Fire");
})();
