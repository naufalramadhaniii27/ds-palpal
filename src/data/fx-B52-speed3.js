DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};GX.item=GX.item||{};
/* fx data batch B52 (hand written): more Speed rules from the text. Always-on movement of subclasses (Up Over and In), and items that add a movement mode or a cursed slowdown (the cursed ones have a switch). */
(function(){
var S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)},P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
S("Cat Burglar",[{n:"Up, Over, and In (speeds)",l:3,mv:{climb:"speed",swim:"speed"}}]);
S("Oath of the Sepulcher",[{n:"Galactic Knight (Solar Knight)",l:20,toggle:{id:"b52-solar-knight",label:"Solar Knight (1 hour): Fly Speed 60 ft"},mv:{fly:60}}]);
P("Tectonic Gauntlets",{n:"Tectonic Plate Armor (burrow)",toggle:{id:"b52-tectonic-plate",label:"Tectonic Plate Armor (1 hour): Burrow Speed 30 ft"},mv:{burrow:30}});
P("Loadstone",{n:"Loadstone (curse)",toggle:{id:"b52-loadstone",label:"Loadstone curse active: Speed -5 ft"},speedAdd:-5});
P("Shield of the Tortoise",{n:"Shield of the Tortoise (curse)",toggle:{id:"b52-tortoise",label:"Tortoise curse active (sluggish): Speed halved"},speedMul:0.5});
})();
