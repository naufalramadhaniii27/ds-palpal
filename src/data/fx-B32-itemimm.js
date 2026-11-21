DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B32 (hand written): resistances and immunities that a magic item gives the wearer, from the item text. */
(function(){
var P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
P("Book of Exalted Deeds",{n:"Book of Exalted Deeds (protection)",ed:"2024",res:["Psychic"],condImm:["Charmed","Frightened"]});
P("Armor of Invulnerability",{n:"Armor of Invulnerability (immunity)",ed:"2024",toggle:{id:"b32-armor-of-invulnerability",label:"Invulnerable: active (10 minutes)"},imm:["Bludgeoning","Piercing","Slashing"]});
P("Armor of Invulnerability",{n:"Armor of Invulnerability (2014)",ed:"2014",toggle:{id:"b32-armor-of-invulnerability",label:"Invulnerable: active (10 minutes)"},defs:[["Immunity","Nonmagical damage"]]});
P("Stormgirdle (Dormant)",{n:"Stormgirdle (resistance)",res:["Lightning","Thunder"]});
P("Stormgirdle (Dormant)",{n:"Stormgirdle (immunity)",toggle:{id:"b32-storm-avatar",label:"Storm Avatar (1 minute)"},imm:["Lightning","Thunder"]});
P("Gauntlets of Rage",{n:"Gauntlets of Rage (furious)",toggle:{id:"b32-gauntlets-of-rage",label:"Furious"},condImm:["Charmed","Frightened"]});
})();
