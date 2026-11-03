/* fx data, batch A: class and species features that change sheet numbers.
   Registry window.GX (fx engine v2, see SOURCE-NOTES.md "fx schema"). This file is separate from tp*.js so a tp_build run does not remove it.
   Values checked against the feature text of each source (VSS24, SHL, DDD24, GEH24, DM24, EE24) and the PHB 2024 Barbarian. */
(function(){
var G=window.GX=window.GX||{};
G.cls=G.cls||{};G.species=G.species||{};
function add(kind,name,list){G[kind][name]=(G[kind][name]||[]).concat(list)}

/* PHB 2024 Barbarian 7: Feral Instinct, Advantage on Initiative rolls */
add("cls","Barbarian",[{n:"Feral Instinct",l:7,initAdv:true}]);

/* Craftsman (VSS24). Masterwork Bonus track: +1 (1-4), +2 (5-10), +3 (11-16), +4 (17-20).
   Masterwork Armor: AC bonus = half the Masterwork Bonus, rounded up, while wearing Masterwork armor (inventory name "<Armor>, Masterwork").
   Spellwrought Armor (18): the Masterwork Bonus (+4 at that level) is added to saving throws while wearing Masterwork armor */
add("cls","Craftsman",[
 {n:"Masterwork Armor",l:2,ac:[[2,1],[11,2]],cond:"mwArmor"},
 {n:"Spellwrought Armor",l:18,saveBonus:4,cond:"mwArmor"}
]);

/* Healer (SHL) Expert Physician: pick one skill, checks with it get an Intelligence modifier bonus (minimum +1) */
var HS=["Medicine","Nature","Sleight of Hand","Survival"],HK="gx-phys-cls-Healer";
add("cls","Healer",[{n:"Expert Physician",l:1,pick:[{k:"phys",t:"multi",n:1,title:"Expert Physician skill",list:HS.map(function(s){return [s,""]})}]}].concat(HS.map(function(s){
 return {n:"Expert Physician",l:1,when:{key:HK,val:s},skillBonus:[[s,"INT"]],min:1}})));

/* Investigator (VSS24) Expertise: two skills at level 2, two more at level 9 */
add("cls","Investigator",[
 {n:"Expertise",l:2,pick:[{k:"exp1",t:"exp",n:2,title:"Expertise"}]},
 {n:"Expertise",l:9,pick:[{k:"exp2",t:"exp",n:2,title:"Expertise (level 9)"}]}
]);

/* Martyr (VSS24) Armor of Faith: Anointed Armor (Medium armor training, Wisdom in place of Dexterity while wearing armor)
   or Unarmored Defense (10 + Dex + Wis, a Shield is fine) */
var MK="gx-armorFaith-cls-Martyr";
add("cls","Martyr",[
 {n:"Armor of Faith",l:1,pick:[{k:"armorFaith",t:"multi",n:1,title:"Armor of Faith",list:[
  ["Anointed Armor","Medium armor training. While you wear armor, add your Wisdom modifier to AC in place of your Dexterity modifier."],
  ["Unarmored Defense","With no armor, base AC is 10 plus Dexterity modifier plus Wisdom modifier. A Shield is allowed."]]}]},
 {n:"Anointed Armor",l:1,when:{key:MK,val:"Anointed Armor"},armor:["Medium"],acArmAb:"WIS",cond:"armor"},
 {n:"Unarmored Defense",l:1,when:{key:MK,val:"Unarmored Defense"},acBase:[10,"full","WIS"],cond:"noBody"}
]);

/* Ankylier (DDD24) Osteoderms: two versions, agreed with the GM. A: +3 AC and no Dexterity modifier. B: unarmored AC 17 and no Dexterity modifier */
var AK="gx-osteo-species-Ankylier",OA="+3 AC, no Dexterity",OB="Unarmored AC 17, no Dexterity";
add("species","Ankylier",[
 {n:"Osteoderms",pick:[{k:"osteo",t:"multi",n:1,title:"Osteoderms version",list:[[OA,"You get +3 AC but cannot add your Dexterity modifier to AC."],[OB,"Your unarmored AC is 17 and you do not add your Dexterity modifier."]]}]},
 {n:"Osteoderms",when:{key:AK,val:OA},acAdd:3,acNoDex:true},
 {n:"Osteoderms",when:{key:AK,val:OB},acBase:[17,""],cond:"noBody"}
]);

/* Manikin (GEH24) */
add("species","Manikin",[
 {n:"Electric Heart",res:["Lightning"]},
 {n:"Living Material",def:["Immunity","Poisoned (condition)"]}
]);

/* Pluvenn (DDD24) and Skathari (DM24): Resistance to falling damage */
add("species","Pluvenn",[{n:"Pneumatised and Feathered",def:["Resistance","Falling damage (while not Incapacitated)"]}]);
add("species","Skathári",[{n:"Gliding Wings",def:["Resistance","Falling damage"]}]);

/* Ruinbound (EE24) Unnatural Resilience */
add("species","Ruinbound",[{n:"Unnatural Resilience",res:["Poison"],advOn:["saving throws to avoid or end the Poisoned condition"]}]);

/* Orc (Dark Matter) Follow Through: the use counter in tp13-tsdm.js is owned by "Orc", but the species is "Orc (Dark Matter)", so the counter never showed */
if(typeof LU_X!=="undefined")LU_X.forEach(function(e){if(e.src==="species"&&e.owner==="Orc"&&e.feature==="Follow Through")e.owner="Orc (Dark Matter)"});
})();
