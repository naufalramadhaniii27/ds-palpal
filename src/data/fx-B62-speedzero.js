DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B62 (hand written, from the text): items from tests/mech_baseline.json "by_design" that force walking Speed to a fixed number in a play state.
   The state is a switch on the sheet; speedTo = Speed becomes at most this number. */
(function(){
var I=function(k,id,label,v){GX.item[k]=(GX.item[k]||[]).concat([{n:k+" ("+label+")",toggle:{id:id,label:label+": Speed "+v+" ft"},speedTo:v}])};
I("Barricade Shield","b62-barricade","Shield planted (1 minute)",0);
I("Doublet of Dramatic Demise","b62-doublet","At 0 Hit Points",0);
I("Ring of Anchoring","b62-anchoring","Anchored while submerged (failed save)",0);
I("Sanctified Cannon","b62-cannon","Charged shot fired (until end of next turn)",0);
I("Boots of the Hare","b62-hare","Curse active",15);
})();
