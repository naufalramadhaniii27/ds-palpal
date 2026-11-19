DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B57 (hand written): two subclass Speed bonuses that depend on a state, so each has a switch on the sheet. */
(function(){
var S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)};
S("Absolute Chapter",[{n:"Unencumbered Movement (Speed)",l:3,toggle:{id:"b57-unencumbered",label:"Light or no armor and no Shield: Speed +10 ft"},speedAdd:10}]);
S("Metamorph",[{n:"Mutable Form (Speed)",l:3,toggle:{id:"b57-mutable-form",label:"Mutable Form active (1 minute): Speed +5 ft"},speedAdd:5}]);
})();
