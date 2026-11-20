DataEnv.slot.GX=DataEnv.slot.GX||{};
/* fx data batch B14: senses that magic items give plainly while worn or held. (The +1 AC and +1 save rows were removed in 0.0.85: the items carry those in their own fx, so the sheet counted them twice.) */
(function(){
var G=DataEnv.slot.GX.item=DataEnv.slot.GX.item||{};
var add=function(n,t,r){(G[n]=G[n]||[]).push({n:n+" (sense)",sense:[[t,r,""]]})};
add("Blindfold of True Darkness","Blindsight",10);
/* 0.0.85: worn effects with no field in the item row. Titan Frame is Armor without a base armor, so its row's ac is not read as a worn-armor bonus */
(G["Titan Frame"]=G["Titan Frame"]||[]).push({n:"Titan Frame",acAdd:2,speedSet:30,size:"Large"});
(G["Boots of Striding and Springing"]=G["Boots of Striding and Springing"]||[]).push({n:"Boots of Striding and Springing",speedSet:30});
add("Helm of Domination","Truesight",120);
})();
