/* fx data batch G (engine v3b): toggle states, pickLv, abUpPick, item picks. Schema: SOURCE-NOTES.md, "fx engine v3b".
   Toggle ids are stored in the saved sheet state S.fxT. The same id in two entries is one switch (id "rage" is meant to follow the Rage mode of the sheet).
   Aberrant Horror Stage 1: Chitinous Shell (AC +2, Speed -10, not with heavy armor) and Slimy Form (Acid, Fire, Cold resistance) are mutations (1 minute, one at a time, swapping costs a use), so they are switches.
   Eldritch Limbs is an attack option (text only). Specter Incorporeal Movement and the Vampire Sanguine Curse are timed or place based states.
   Barbarian Path of the Abomination: while Raging the size is Large and STR and DEX rise by the Rage Damage bonus (maximum 29).
   Worthless From the Ashes: +2 to one score or +1 to two scores at levels 4, 8, 12, 16, 19 (maximum 18), one pick per level. */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.feat=GX.feat||{};GX.sub=GX.sub||{};
(function(){
 function addF(n,e){GX.feat[n]=(GX.feat[n]||[]).concat(e)}
 addF("Aberrant Horror Transformation: Stage 1",[
  {n:"Chitinous Shell",toggle:{id:"aberrant-chitinous",label:"Chitinous Shell (mutation)"},acAdd:2,speedAdd:-10,cond:"noHeavy"},
  {n:"Slimy Form",toggle:{id:"aberrant-slimy",label:"Slimy Form (mutation)"},res:["Acid","Fire","Cold"],advOn:["checks to escape a grapple"]}]);
 addF("Specter Transformation: Stage 1",[
  {n:"Incorporeal Movement",when:{key:"trSpecter1",val:"Incorporeal Movement"},toggle:{id:"specter-incorporeal",label:"Incorporeal (until the start of your next turn)"},
   res:["Acid","Bludgeoning","Cold","Fire","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder"]}]);
 addF("Vampire Transformation: Stage 1",[
  {n:"The Sanguine Curse",toggle:{id:"vampire-uninvited",label:"In a residence you entered uninvited"},def:["Curse","Disadvantage on all D20 Tests here, 1d4 Psychic damage at the start of each of your turns, no Resistance or Immunity to Psychic damage"]}]);
 GX.sub["Path of the Abomination"]=(GX.sub["Path of the Abomination"]||[]).concat([
  {n:"Abominable Transformation",l:3,toggle:{id:"rage",label:"Raging"},size:"Large",abUp:[["STR","rage",29],["DEX","rage",29]]}]);
 var AB=["STR","DEX","CON","INT","WIS","CHA"],OPT=[];
 AB.forEach(function(a){OPT.push([a+" +2",""])});
 AB.forEach(function(a,i){AB.slice(i+1).forEach(function(b){OPT.push([a+" +1, "+b+" +1",""])})});
 addF("Worthless",[{n:"From the Ashes",abUpPick:{max:18},pickLv:[4,8,12,16,19].map(function(L){return {lv:L,k:"ash"+L,t:"multi",n:1,title:"From the Ashes, level "+L+" (+2 to one score or +1 to two, maximum 18)",list:OPT}})}]);
})();
