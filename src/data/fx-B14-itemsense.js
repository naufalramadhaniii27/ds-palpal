DataEnv.slot.GX=DataEnv.slot.GX||{};
/* fx data batch B14: senses, +1 AC and +1 saves that magic items give plainly while worn or held. */
(function(){
var G=DataEnv.slot.GX.item=DataEnv.slot.GX.item||{};
var add=function(n,t,r){(G[n]=G[n]||[]).push({n:n+" (sense)",sense:[[t,r,""]]})};
add("Blindfold of True Darkness","Blindsight",10);
add("Helm of Domination","Truesight",120);
var bonus=function(n,e){e.n=n+" (bonus)";(G[n]=G[n]||[]).push(e)};
["Ingot of the Skold Rune","Orrery of the Wanderer","Knifewing Cape","Jewel of Three Prayers (Awakened)","Jewel of Three Prayers (Exalted)"].forEach(function(n){bonus(n,{ac:1})});
["Corvum Feather Robe","Gallus Feather Robe","Luma Feather Robe","Raptor Feather Robe","Strig Feather Robe"].forEach(function(n){bonus(n,{save:1})});
})();
