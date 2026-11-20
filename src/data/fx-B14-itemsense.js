DataEnv.slot.GX=DataEnv.slot.GX||{};
/* fx data batch B14: senses that magic items give plainly while worn or held. (The +1 AC and +1 save rows were removed in 0.0.85: the items carry those in their own fx, so the sheet counted them twice.) */
(function(){
var G=DataEnv.slot.GX.item=DataEnv.slot.GX.item||{};
var add=function(n,t,r){(G[n]=G[n]||[]).push({n:n+" (sense)",sense:[[t,r,""]]})};
add("Blindfold of True Darkness","Blindsight",10);
add("Helm of Domination","Truesight",120);
})();
