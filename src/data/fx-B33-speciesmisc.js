DataEnv.slot.GX=DataEnv.slot.GX||{};GX.species=GX.species||{};
/* fx data batch B33 (hand written): species traits that change speed, senses or immunities, from the trait text. */
(function(){
var P=function(k,e){GX.species[k]=(GX.species[k]||[]).concat([e])};
P("Dwarf",{n:"Stonecunning (tremorsense)",toggle:{id:"b33-stonecunning",label:"Stonecunning: Tremorsense (10 minutes, on or touching stone)"},sense:[["Tremorsense",60,"on or touching stone"]]});
P("Naga",{n:"Speed Burst (speed)",toggle:{id:"b33-speed-burst",label:"Speed Burst (until the end of your turn)"},speedAdd:5});
P("Tabaxi (2014)",{n:"Feline Agility (speed)",toggle:{id:"b33-feline-agility",label:"Feline Agility (until the end of your turn)"},speedMul:2});
P("Spring Mandrake",{n:"Sprightly Movement (speed)",speedAdd:5});
/* 0.0.85: horns as natural weapons for Unarmed Strikes, 1d6 + Strength, damage type as the trait text says */
["Bhain Kwai Minotaur","Boghaid Minotaur","Tauren"].forEach(function(n){P(n,{n:"Horns",unarmed:{die:"1d6",t:"Piercing"}})});
P("Minotaur (Amonkhet)",{n:"Natural Weapon (horns)",unarmed:{die:"1d6",t:"Bludgeoning"}});
/* Vect (DM24) Embedded Armor: base AC 13 + Dex; armor worn over it may be used instead (acOver keeps the better one) */
P("Vect",{n:"Embedded Armor",acBase:[13,"full"],acOver:true});
["Bisque Geppettin","Raggedy Geppettin"].forEach(function(n){P(n,{n:"Construct Anatomy (immunity)",defs:[["Immunity","Disease (nonmagical)"]]})});
})();
