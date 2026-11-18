DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B49 (hand written): subclass features that raise or double your Speed, each with a switch because the effect lasts only for a time. */
(function(){
var S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)};
S("Travel Domain",[{n:"Godspeed (speed)",l:17,toggle:{id:"b49-godspeed",label:"Godspeed active: walking Speed doubled"},speedMul:2}]);
S("Speed Domain",[{n:"Burst of Speed (speed)",l:3,toggle:{id:"b49-burst-of-speed",label:"Burst of Speed (Channel Divinity): base Speed +10 ft"},speedAdd:10}]);
S("Prophecy Domain",[{n:"One Move Ahead (speed)",l:3,toggle:{id:"b49-one-move-ahead",label:"One Move Ahead (Channel Divinity): Speed +20 ft for your Cleric level in rounds"},speedAdd:20}]);
S("Fey Ballerina",[{n:"Sublime Start (speed)",l:10,toggle:{id:"b49-sublime-start",label:"First round of combat: Speed doubled"},speedMul:2}]);
S("Circle of the Fist",[{n:"Primal Infusion (speed)",l:3,toggle:{id:"b49-primal-infusion",label:"Primal Infusion active: walking Speed +10 ft"},speedAdd:10}]);
})();
