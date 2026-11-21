DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B39 (hand written): items that give a Fly or Climb Speed, from the item text. */
(function(){
var P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
P("Wings of Flying",{n:"Wings of Flying (speed)",toggle:{id:"b39-wings-of-flying",label:"Wings of Flying spread (1 hour)"},mv:{fly:60}});
P("Broom of Flying",{n:"Broom of Flying (speed)",toggle:{id:"b39-broom-of-flying",label:"Riding the Broom of Flying"},mv:{fly:50}});
P("Cloak of the Bat",{n:"Cloak of the Bat (speed)",toggle:{id:"b39-cloak-of-the-bat",label:"Gripping the edges in Dim Light or Darkness: flying"},mv:{fly:40}});
P("Potion of Flying",{n:"Potion of Flying (speed)",toggle:{id:"b39-potion-of-flying",label:"Potion of Flying (1 hour)"},mv:{fly:"speed"}});
P("Potion of Climbing",{n:"Potion of Climbing (speed)",toggle:{id:"b39-potion-of-climbing",label:"Potion of Climbing (1 hour)"},mv:{climb:"speed"}});
})();
