DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B47 (hand written): items with a speed that turns on or off, from the item text. Each has a switch because the speed holds only while the item is used. */
(function(){
var P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
P("Boots of Speed",{n:"Boots of Speed (speed)",toggle:{id:"b47-boots-of-speed",label:"Heels clicked: Speed doubled (10 minutes a Long Rest)"},speedMul:2});
P("Ori Boots",{n:"Ori Boots (speed)",toggle:{id:"b47-ori-boots",label:"Heels clicked: Speed doubled (10 minutes a Long Rest)"},speedMul:2});
P("Shrieking Greaves",{n:"Shrieking Greaves (speed)",toggle:{id:"b47-shrieking-greaves",label:"Greaves active (1 minute): walking Speed +30 ft"},speedAdd:30});
P("Eagle Whistle",{n:"Eagle Whistle (speed)",toggle:{id:"b47-eagle-whistle",label:"Blowing the whistle: Fly Speed twice your walking Speed"},mv:{fly:"speed2"}});
P("Pixie Dust",{n:"Pixie Dust (speed)",toggle:{id:"b47-pixie-dust",label:"Pixie dust on you (1 minute): Fly Speed 30 ft, hover"},mv:{fly:30}});
P("Skysail",{n:"Skysail (speed)",toggle:{id:"b47-skysail",label:"Riding it with the wings open: glide at 60 ft"},mv:{fly:60}});
[["3 ft. × 5 ft.",80],["4 ft. × 6 ft.",60],["5 ft. × 7 ft.",40],["6 ft. × 9 ft.",30]].forEach(function(z){P("Carpet of Flying, "+z[0],{n:"Carpet of Flying (speed)",toggle:{id:"b47-carpet-"+z[1],label:"On the flying carpet: Fly Speed "+z[1]+" ft (normal load)"},mv:{fly:z[1]}})});
})();
