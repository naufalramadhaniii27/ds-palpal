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
 var ALLX=["Acid","Bludgeoning","Cold","Fire","Force","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder"];
 function except(list){return ALLX.filter(function(t){return list.indexOf(t)<0})}
 /* ---- class ---- */
 C("Paladin",{n:"Paladin's Smite",l:2,ed:"2024",defs:[["Note","Divine Smite, as a Bonus Action right after a melee weapon or Unarmed Strike hit: 2d8 Radiant damage, plus 1d8 against a Fiend or an Undead, plus 1d8 for each spell slot level above 1"]]});
 C("Ranger",{n:"Foe Slayer",l:20,ed:"2024",defs:[["Note","Hunter's Mark uses a d10 for its damage die instead of a d6"]]});
 C("Ranger",{n:"Tireless",l:10,ed:"2024",defs:[["Note","Magic action: roll 1d8 and add your Wisdom modifier, then gain that many Temporary Hit Points (minimum of 1)"],["Note","Each Short Rest you finish lowers your Exhaustion level by 1"]]});
 C("Rogue",{n:"Reliable Talent",l:7,ed:"2024",defs:[["Note","Ability check with a skill or tool you are proficient with: a d20 roll of 9 or lower counts as a 10"]]});
 C("Rogue",{n:"Reliable Talent",l:11,ed:"2014",defs:[["Note","Ability check with a skill or tool you are proficient with: a d20 roll of 9 or lower counts as a 10"]]});
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
 /* ================= 2014 rules (zero miss 4, part 2). Class entries carry ed:"2014" because the 2024 class table has features of the same name. ================= */
 /* ---- class 2014 ---- */
 C("Bard",{n:"Countercharm",l:6,ed:"2014",toggle:{id:"countercharm",label:"Countercharm performance active"},advOn:["saving throws against being Frightened or Charmed (you and friendly creatures within 30 ft that can hear you)"]});
 C("Bard",{n:"Song of Rest",l:2,ed:"2014",defs:[["Note","Short Rest: you and friendly creatures who spend Hit Dice to heal regain an extra d6 Hit Points (d8 from level 9, d10 from level 13, d12 from level 17)"]]});
 C("Paladin",{n:"Divine Smite",l:2,ed:"2014",defs:[["Note","Melee weapon hit, expend a spell slot: 2d8 Radiant damage for a level 1 slot, plus 1d8 per slot level above 1 (5d8 at most), plus 1d8 against an Undead or a Fiend (6d8 at most)"]]});
 C("Ranger",{n:"Favored Enemy",l:1,ed:"2014",advOn:["Wisdom (Survival) checks to track your favored enemies and Intelligence checks to recall information about them"]});
 C("Ranger",{n:"Land's Stride",l:8,ed:"2014",advOn:["saving throws against plants magically created or manipulated to impede movement"]});
 C("Monk",{n:"Empty Body",l:18,ed:"2014",toggle:{id:"empty-body",label:"Empty Body active (4 ki points, 1 minute)"},res:except(["Force"]),defs:[["Note","You are Invisible while Empty Body lasts. Separately, 8 ki points cast Astral Projection without Material components (you alone)"]]});
 /* ---- subclass 2014 ---- */
 S("Path of the Totem Warrior",{n:"Totem Spirit (Wolf)",l:3,when:{key:"p3tot14",val:"Wolf"},defs:[["Note","While Raging, your friends have Advantage on melee attack rolls against any hostile creature within 5 ft of you"]]});
 S("Path of the Totem Warrior",{n:"Aspect of the Beast (Bear)",l:6,when:{key:"p6tot14",val:"Bear"},advOn:["Strength checks to push, pull, lift, or break objects"],defs:[["Note","Your carrying capacity is doubled"]]});
 S("Path of the Totem Warrior",{n:"Totemic Attunement (Eagle)",l:14,when:{key:"p14tot14",val:"Eagle"},toggle:{id:"totem-eagle",label:"Raging with the Eagle attunement"},mv:{fly:"speed"},defs:[["Note","You fall if you end your turn in the air with nothing to hold you up"]]});
 S("College of Valor (2014)",{n:"Combat Inspiration",l:3,defs:[["Note","A creature holding your Bardic Inspiration die can add it to a weapon damage roll it just made, or use a Reaction when it is hit to add the die to its Armor Class against that attack"]]});
 S("Knowledge Domain (2014)",{n:"Channel Divinity: Knowledge of the Ages",l:2,defs:[["Note","Channel Divinity, action: choose a skill or tool and you are proficient with it for 10 minutes"]]});
 S("Life Domain (2014)",{n:"Channel Divinity: Preserve Life",l:2,defs:[["Note","Channel Divinity, action: share a pool of Hit Points equal to 5 times your Cleric level among creatures within 30 ft, none raised above half its Hit Point maximum (not Undead or Constructs)"]]});
 S("Nature Domain",{n:"Dampen Elements",l:6,defs:[["Note","Reaction: you or a creature within 30 ft that takes Acid, Cold, Fire, Lightning, or Thunder damage gains Resistance to that instance of damage"]]});
 S("Tempest Domain",{n:"Wrath of the Storm",l:1,ed:"2014",defs:[["Note","Reaction, when a creature within 5 ft hits you: it makes a Dexterity save or takes 2d8 Lightning or Thunder damage (half on a success)"]]});
 S("Trickery Domain (2014)",{n:"Blessing of the Trickster",l:1,toggle:{id:"trickster-blessing",label:"Blessing of the Trickster on you"},advOn:["Dexterity (Stealth) checks"]});
 S("Trickery Domain (2014)",{n:"Channel Divinity: Invoke Duplicity",l:2,toggle:{id:"invoke-duplicity",label:"Invoke Duplicity: you and the illusion are within 5 ft of the target"},advOn:["attack rolls against a creature that can see your illusion"]});
 S("Circle of the Moon (2014)",{n:"Combat Wild Shape",l:2,defs:[["Note","In Wild Shape, Bonus Action: expend a spell slot to regain 1d8 Hit Points per level of the slot"]]});
 S("Way of Shadow",{n:"Shadow Step",l:6,toggle:{id:"shadow-step",label:"Shadow Step used this turn"},advOn:["the first melee attack you make before the end of the turn"]});
 S("Oath of Devotion (2014)",{n:"Holy Nimbus",l:20,toggle:{id:"holy-nimbus",label:"Holy Nimbus active (1 minute)"},advOn:["saving throws against spells cast by Fiends and Undead"]});
 S("Oath of Vengeance (2014)",{n:"Avenging Angel (Frightened foes)",l:20,toggle:{id:"avenging-angel",label:"Avenging Angel active"},defs:[["Note","Attack rolls against a creature Frightened by your aura have Advantage"]]});
 S("Oath of Vengeance (2014)",{n:"Channel Divinity: Vow of Enmity",l:3,toggle:{id:"vow-of-enmity",label:"Vow of Enmity sworn"},advOn:["attack rolls against the creature you swore the vow against"]});
 S("Oathbreaker",{n:"Dread Lord",l:20,toggle:{id:"dread-lord",label:"Dread Lord aura active (1 minute)"},defs:[["Note","A Frightened enemy takes 4d10 Psychic damage when it starts its turn in the aura. Bonus Action: a melee spell attack from the shadows deals 3d10 plus your Charisma modifier Necrotic damage"]]});
 S("Hunter (2014)",{n:"Hunter's Prey (Colossus Slayer)",l:3,when:{key:"p3hunt14a",val:"Colossus Slayer"},atkDice:[{when:"weapon",d:"1d8",t:"of the weapon's type",note:"Colossus Slayer, once per turn, against a target below its Hit Point maximum"}]});
 S("Hunter (2014)",{n:"Defensive Tactics (Escape the Horde)",l:7,when:{key:"p7hunt14b",val:"Escape the Horde"},defs:[["Note","Opportunity Attacks against you have Disadvantage"]]});
 S("Hunter (2014)",{n:"Defensive Tactics (Multiattack Defense)",l:7,when:{key:"p7hunt14b",val:"Multiattack Defense"},defs:[["Note","When a creature hits you, you gain +4 AC against its later attacks this turn"]]});
 S("Arcane Trickster (2014)",{n:"Versatile Trickster",l:13,toggle:{id:"versatile-trickster",label:"Versatile Trickster used this turn"},advOn:["attack rolls against the creature you designated near your Mage Hand"]});
 S("Assassin (2014)",{n:"Assassinate",l:3,defs:[["Note","Advantage on attack rolls against any creature that has not taken a turn in the combat yet; a hit against a surprised creature is a Critical Hit"]]});
 S("Draconic Bloodline",{n:"Elemental Affinity",l:6,defs:[["Note","Spell damage of your ancestry type: add your Charisma modifier to one damage roll, and spend 1 sorcery point for Resistance to that type for 1 hour"]]});
 S("Wild Magic",{n:"Bend Luck",l:6,defs:[["Note","Reaction and 2 sorcery points, when another creature you can see rolls an attack, check, or save: roll 1d4 and add or subtract it"]]});
 S("The Fiend (2014)",{n:"Hurl Through Hell",l:14,defs:[["Note","When you hit with an attack, the target vanishes and takes 10d10 Psychic damage when it returns at the end of your next turn (not Fiends)"]]});
 S("The Great Old One (2014)",{n:"Entropic Ward",l:6,defs:[["Note","Reaction, when a creature attacks you: impose Disadvantage on the roll. If it misses, you have Advantage on your next attack roll against it before the end of your next turn"]],advOn:["your next attack roll against a creature whose attack missed you thanks to Entropic Ward"]});
 S("School of Abjuration",{n:"Arcane Ward",l:2,defs:[["Note","Ward Hit Point maximum: twice your Wizard level plus your Intelligence modifier. It takes damage in your place until you finish a Long Rest"]]});
 S("School of Evocation",{n:"Overchannel",l:14,defs:[["Note","Wizard spell of level 1 to 5 that deals damage: maximum damage. Each use after the first before a Long Rest costs you 2d12 Necrotic damage per spell level, plus 1d12 per level for every further use (ignores Resistance and Immunity)"]]});
 /* ---- feat 2014 ---- */
 F("Alert (2014)",{n:"Alert",defs:[["Note","Creatures do not gain Advantage on attack rolls against you just because they are hidden from you, and you can't be Surprised while conscious"]]});
 F("Defensive Duelist (2014)",{n:"Defensive Duelist",defs:[["Note","Reaction, holding a Finesse weapon you are proficient with and hit by a melee attack: add your Proficiency Bonus to your AC against that attack"]]});
 F("Dual Wielder (2014)",{n:"Dual Wielder (Dual Defense)",toggle:{id:"dual-defense",label:"Wielding a separate melee weapon in each hand"},acAdd:1});
 F("Healer (2014)",{n:"Healer",defs:[["Note","Action, one use of a Healer's Kit: a creature regains 1d6 + 4 Hit Points plus its number of Hit Dice (once per creature until it finishes a rest)"]]});
 F("Polearm Master (2014)",{n:"Polearm Master",defs:[["Note","Bonus Action after the Attack action with a glaive, halberd, quarterstaff, or spear: attack with the other end for 1d4 Bludgeoning damage"]]});
})();
