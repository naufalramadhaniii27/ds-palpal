DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B40 (hand written): the ten Potions of Resistance give Resistance to their damage type for 1 hour. */
(function(){
var P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
P("Potion of Acid Resistance",{n:"Potion of Acid Resistance (resistance)",toggle:{id:"b40-potion-acid-resistance",label:"Potion of Acid Resistance (1 hour)"},res:["Acid"]});
P("Potion of Cold Resistance",{n:"Potion of Cold Resistance (resistance)",toggle:{id:"b40-potion-cold-resistance",label:"Potion of Cold Resistance (1 hour)"},res:["Cold"]});
P("Potion of Fire Resistance",{n:"Potion of Fire Resistance (resistance)",toggle:{id:"b40-potion-fire-resistance",label:"Potion of Fire Resistance (1 hour)"},res:["Fire"]});
P("Potion of Force Resistance",{n:"Potion of Force Resistance (resistance)",toggle:{id:"b40-potion-force-resistance",label:"Potion of Force Resistance (1 hour)"},res:["Force"]});
P("Potion of Lightning Resistance",{n:"Potion of Lightning Resistance (resistance)",toggle:{id:"b40-potion-lightning-resistance",label:"Potion of Lightning Resistance (1 hour)"},res:["Lightning"]});
P("Potion of Necrotic Resistance",{n:"Potion of Necrotic Resistance (resistance)",toggle:{id:"b40-potion-necrotic-resistance",label:"Potion of Necrotic Resistance (1 hour)"},res:["Necrotic"]});
P("Potion of Poison Resistance",{n:"Potion of Poison Resistance (resistance)",toggle:{id:"b40-potion-poison-resistance",label:"Potion of Poison Resistance (1 hour)"},res:["Poison"]});
P("Potion of Psychic Resistance",{n:"Potion of Psychic Resistance (resistance)",toggle:{id:"b40-potion-psychic-resistance",label:"Potion of Psychic Resistance (1 hour)"},res:["Psychic"]});
P("Potion of Radiant Resistance",{n:"Potion of Radiant Resistance (resistance)",toggle:{id:"b40-potion-radiant-resistance",label:"Potion of Radiant Resistance (1 hour)"},res:["Radiant"]});
P("Potion of Thunder Resistance",{n:"Potion of Thunder Resistance (resistance)",toggle:{id:"b40-potion-thunder-resistance",label:"Potion of Thunder Resistance (1 hour)"},res:["Thunder"]});
})();
