DataEnv.declare("__fxZ14");
/* Forgemaster's Might: independent spells and damage against Constructs or structures. */
(function(){
 if(DataEnv.slot.__fxZ14)return;DataEnv.slot.__fxZ14=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 var n="Forgemaster's Might";
 (GX.item[n]=GX.item[n]||[]).push({n:n,spells:[[1,"Mending"]],lu:[{n:"Creation (Forgemaster's Might)",max:1,reset:"dawn"},{n:"Fabricate (Forgemaster's Might)",max:1,reset:"dawn"}]});
 GX.item[n].push({n:n,target:{types:["Construct","Structure"]},atkDice:[{when:n,d:"2d8",t:"Bludgeoning",roll:true}]});
 GX.item[n].push({n:"Smith's Blessing: anvil",toggle:{id:"forge-anvil",label:"Using hammer head as an anvil to craft or repair",default:false},advOn:["Smith's Tools checks to craft or repair an object using the hammer head as an anvil"]});
})();
