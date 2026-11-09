DataEnv.declare("__fxZ4");
/* fx data Z4 (zero miss 4, reports/zm4.md): sentences of the classes DICE, AC, SPEED and D20 that the sheet did not carry (the triage of the 37 missing features of zero miss 3).
   Same shape as fx-Z3.js: a plain Note for a rule that is always true or a rider the player decides at the table, a toggle for a state with a duration.
   Uses with a counter already have a resource row; their dice or bonus is written in the tag of that row (LU_X in db4/02-limited-uses-damage-rows-save-notes.js).
   Entries marked ed:"2024" are for 2024 builds only (the 2014 class table has a feature of the same name with another text, or none).
   Readings: reports/rules-notes.md, section "Zero miss 4". */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};GX.feat=GX.feat||{};GX.cls=GX.cls||{};
(function(){
 if(DataEnv.slot.__fxZ4)return;DataEnv.slot.__fxZ4=1;
 function put(t,n,e){(GX[t][n]=GX[t][n]||[]).push(e)}
 function S(n,e){put("sub",n,e)}
 function F(n,e){put("feat",n,e)}
 function C(n,e){put("cls",n,e)}
 /* ---- class ---- */
 C("Paladin",{n:"Paladin's Smite",l:2,ed:"2024",defs:[["Note","Divine Smite, as a Bonus Action right after a melee weapon or Unarmed Strike hit: 2d8 Radiant damage, plus 1d8 against a Fiend or an Undead, plus 1d8 for each spell slot level above 1"]]});
 C("Ranger",{n:"Foe Slayer",l:20,ed:"2024",defs:[["Note","Hunter's Mark uses a d10 for its damage die instead of a d6"]]});
 C("Ranger",{n:"Tireless",l:10,ed:"2024",defs:[["Note","Magic action: roll 1d8 and add your Wisdom modifier, then gain that many Temporary Hit Points (minimum of 1)"],["Note","Each Short Rest you finish lowers your Exhaustion level by 1"]]});
 C("Rogue",{n:"Reliable Talent",l:7,defs:[["Note","Ability check with a skill or tool you are proficient with: a d20 roll of 9 or lower counts as a 10"]]});
 /* ---- subclass ---- */
 S("College of Valor",{n:"Combat Inspiration (Defense)",l:3,defs:[["Note","A creature holding your Bardic Inspiration die can use a Reaction when an attack hits it, roll the die, and add the result to its Armor Class against that attack"]]});
 S("College of Valor",{n:"Combat Inspiration (Offense)",l:3,defs:[["Note","A creature holding your Bardic Inspiration die can roll it as soon as its attack roll hits and add the result to the damage"]]});
 S("Oath of Glory",{n:"Inspiring Smite",l:3,defs:[["Note","Right after you cast Divine Smite, spend one Channel Divinity use: roll 2d8 and add your Paladin level, then divide that many Temporary Hit Points among creatures within 30 ft (yourself included)"]]});
 S("Wild Magic Sorcery",{n:"Bend Luck",l:6,defs:[["Note","Reaction and 1 Sorcery Point, right after another creature's d20 roll: roll 1d4 and add it to or subtract it from that roll"]]});
 S("Evoker",{n:"Overchannel",l:14,defs:[["Note","Second use before a Long Rest: you take 2d12 Necrotic damage per spell level, ignoring Resistance and Immunity. Each further use raises it by 1d12 per spell level"]]});
 /* Starry Form: the Dragon constellation shares the toggle of Twinkling Constellations (the Dragon is the active one) */
 S("Circle of the Stars",{n:"Starry Form (Dragon)",l:3,toggle:{id:"stars-dragon",label:"Dragon is the active constellation"},defs:[["Note","Intelligence checks, Wisdom checks, and Constitution saves to keep Concentration: a d20 roll of 9 or lower counts as a 10"]]});
 /* ---- feat ---- */
 F("Grappler",{n:"Grappler (Fast Wrestler)",defs:[["Note","Moving a creature you have Grappled that is your size or smaller does not halve your Speed"]]});
 F("Chef",{n:"Chef (Replenishing Meal)",defs:[["Note","Short Rest meal: each creature that ate it and spends Hit Point Dice to heal gains an extra 1d8 Hit Points (it feeds Proficiency Bonus + 4 creatures)"]]});
 F("Interception",{n:"Interception",defs:[["Note","Reaction, when a creature you can see hits someone within 5 ft of you: reduce that damage by 1d10 plus your Proficiency Bonus (you must hold a Shield or a Simple or Martial weapon)"]]});
})();
