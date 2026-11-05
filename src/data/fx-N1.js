/* fx data N1 (gate batch N1): rows that tests/clause_gate.py flagged as real gaps (keyword class RES, IMM, ADV, SPEED, SENSE, AC, PROF) and that the CURRENT engine (fx engine v5, fx-M1 era) can express.
   Each entry was read against the feature text in the data and checked on the sheet before and after (tests/golden/builds/fx_N1_*.json). Only fields that exist in SOURCE-NOTES.md are used: res, imm, def, advOn, condImm, skillProf, skillExpert, skillPE, pick (skills, multi), mv, speedMul, darkTo, darkNone, darkHave, atkDice, acAdd, toggle.
   Forms that last a minute or an hour (Rage of the Gods, Umbral Form ...) are toggles, like the other play states of fx engine v3b. Items count only while equipped (and attuned when needed).
   Not in this file: rows that need a new engine field, listed in reports/gate-engine-needs.md. Names that the engine wave 3 file fx-M2.js uses (Star-Spangled Banner, Two-Weapon Fighting, ...) are left out on purpose. */
window.GX=window.GX||{};GX.item=GX.item||{};GX.sub=GX.sub||{};GX.species=GX.species||{};GX.feat=GX.feat||{};GX.cls=GX.cls||{};
(function(){
 if(window.__fxN1)return;window.__fxN1=1;
 function put(t,n,e){(GX[t][n]=GX[t][n]||[]).push(e)}
 function F(n,e){put("feat",n,e)}
 function SP(n,e){put("species",n,e)}
 function S(n,e){put("sub",n,e)}
 function C(n,e){put("cls",n,e)}
 function I(n,e){e.n=e.n||n;put("item",n,e)}

 /* ---- feats ---- */
 F("Hacker",{n:"Data Expert",skillPE:["Data"]});
 F("Mark of Storm",{n:"Storm's Boon",res:["Lightning"]});
 F("Squat Nimbleness",{n:"Slippery",advOn:["Strength (Athletics) and Dexterity (Acrobatics) checks made to escape a grapple"]});
 F("Squat Nimbleness",{n:"Skill",pick:[{k:"sk",t:"skills",n:1,title:"Skill (Acrobatics or Athletics)",from:["Acrobatics","Athletics"]}]});
 F("Woodwise",{n:"Skill",pick:[{k:"sk",t:"skills",n:1,title:"Skill (Survival or Nature)",from:["Survival","Nature"]}]});
 F("Inspirational Caster",{n:"Skill Training",pick:[{k:"sk",t:"skills",n:1,title:"Skill (Intimidation or Persuasion)",from:["Intimidation","Persuasion"]}]});
 F("Boon of the Furious Storm",{n:"Eye of the Storm (Bloodied)",toggle:{id:"bloodied",label:"Bloodied"},imm:["Lightning","Thunder"]});
 /* ---- species ---- */
 SP("Corvum",{n:"Talons",advOn:["Strength (Athletics) checks to climb any surface your talons can grip"]});
 SP("Raptor",{n:"Talons",advOn:["Strength (Athletics) checks to climb any surface your talons can grip"]});
 SP("Strig",{n:"Talons",advOn:["Strength (Athletics) checks to climb any surface your talons can grip"]});
 SP("Strig",{n:"Patterned Feathers",advOn:["Dexterity (Stealth) checks to hide in a forest"]});
 SP("Deep Gnome (2014)",{n:"Stone Camouflage",advOn:["Dexterity (Stealth) checks to hide in rocky terrain"]});
 SP("Deep Gnome (Monster)",{n:"Stone Camouflage",advOn:["Dexterity (Stealth) checks to hide in rocky terrain"]});
 SP("Grimlock",{n:"Stone Camouflage",advOn:["Dexterity (Stealth) checks to hide in rocky terrain"]});
 SP("Deep One Dwarf",{n:"Illusory Body",advOn:["Charisma (Deception) checks against creatures that cannot see through the illusion"]});
 SP("Dhakaani Guul'dar (Bugbear)",{n:"Powerful Build",advOn:["ability checks to end the Grappled condition"]});
 SP("Feathren",{n:"Kindred Speech",advOn:["Wisdom (Animal Handling) checks and Charisma checks to influence birds and cats"]});
 SP("Firbolg (2014)",{n:"Speech of Beast and Leaf",advOn:["Charisma checks to influence Beasts and Plants"]});
 SP("Goblin (Lavastep Tribe)",{n:"Lavastep Grit",advOn:["Dexterity (Stealth) checks to hide in rocky or subterranean places"]});
 SP("Goliath",{n:"Powerful Build",advOn:["checks to end the Grappled condition"]});
 SP("Kenku (2014)",{n:"Expert Forgery",advOn:["checks to forge or duplicate existing objects or handwriting"]});
 SP("Limukin",{n:"Hunter-Gatherer",advOn:["Stealth and Survival checks in a forest, wood, jungle or other heavily vegetated area"]});
 SP("Loxodon",{n:"Keen Smell",advOn:["Wisdom (Perception), Wisdom (Survival) and Intelligence (Investigation) checks that involve smell"]});
 SP("Mapach",{n:"Skulker",advOn:["Stealth checks in dim light and darkness"]});
 SP("Nautilid",{n:"Powerful Build",advOn:["saving throws to end the Grappled condition"]});
 SP("Orc (Dark Matter)",{n:"Powerful Build",advOn:["saving throws to end the Grappled condition"]});
 SP("Orc (Dark Matter)",{n:"Gearhead",advOn:["any check to repair or modify a ship"]});
 SP("Plasmoid",{n:"Amorphous",advOn:["ability checks to start or escape a grapple"]});
 SP("Hobgoblin (Monster)",{n:"Martial Advantage",atkDice:[{when:"weapon",d:"2d6",t:"",note:"Martial Advantage: once per turn, if the target is within 5 ft of an ally of yours who is not Incapacitated"}]});
 SP("Aven (Hawk-Headed)",{n:"Flight",mv:{fly:30},cond:"noMedHeavy"});
 /* ---- subclasses ---- */
 S("White Necromancer",{n:"Lore of Life and Death",l:3,skillProf:["Medicine","Religion"],skillExpert:["Medicine"],advOn:["Intelligence (Religion) checks to recall lore about death gods, burial customs and the afterlife"]});
 S("Plague Doctor",{n:"Physician",l:3,skillProf:["Medicine"],skillExpert:["Medicine"]});
 S("Cavalier",{n:"Born to the Saddle",l:3,advOn:["saves to avoid falling off your mount"]});
 S("Path of the Dad",{n:"Paternal Proficiencies",l:3,advOn:["checks to grill food, make minor repairs, or assert authority over something unimportant"]});
 S("Path of the Muscle Wizard",{n:"Unarguable Wizardry",l:3,advOn:["Intimidation checks to convince others you are a wizard"]});
 S("Blood Domain",{n:"Divine Strike",l:8,atkDice:[{when:"weapon",d:"1d8",t:"Necrotic",note:"Divine Strike, once per turn"}]});
 S("Apocalypse Domain",{n:"Ranting Ruin",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Arcana, Survival)",from:["Arcana","Survival"]}]});
 S("Darkness Domain",{n:"Creature of Darkness",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Deception, Stealth)",from:["Deception","Stealth"]}]});
 S("Mountain Domain",{n:"Bonus Proficiency",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Athletics, Nature, Survival)",from:["Athletics","Nature","Survival"]}]});
 S("Nature Domain",{n:"Acolyte of Nature",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Animal Handling, Nature, Survival)",from:["Animal Handling","Nature","Survival"]}]});
 S("Order Domain",{n:"Bonus Proficiencies",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Intimidation, Persuasion)",from:["Intimidation","Persuasion"]}]});
 S("Peace Domain",{n:"Implement of Peace",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Insight, Performance, Persuasion)",from:["Insight","Performance","Persuasion"]}]});
 S("Travel Domain",{n:"Born to the Road",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Insight, Nature, Survival)",from:["Insight","Nature","Survival"]}]});
 S("Mime",{n:"Silent Routine",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Stealth, Sleight of Hand)",from:["Stealth","Sleight of Hand"]}]});
 S("Cavalier",{n:"Bonus Proficiency",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (Animal Handling, History, Insight, Performance, Persuasion)",from:["Animal Handling","History","Insight","Performance","Persuasion"],opt:1}]});
 S("Samurai",{n:"Bonus Proficiency",l:3,pick:[{k:"sk",t:"skills",n:1,title:"Skill (History, Insight, Performance, Persuasion)",from:["History","Insight","Performance","Persuasion"],opt:1}]});
 S("Knight Errant",{n:"Chivalrous Oath",l:3,pick:[{k:"sk",t:"skills",n:2,title:"Skill (Animal Handling, History, Insight, Persuasion)",from:["Animal Handling","History","Insight","Persuasion"]}]});
 /* ---- classes ---- */
 C("Ranger",{n:"Roving (Climb and Swim)",l:6,mv:{climb:"speed",swim:"speed"}});
 /* ---- subclasses ---- */
 S("Path of the Beast",{n:"Bestial Soul",l:6,pick:[{k:"bs",t:"multi",n:1,title:"Bestial Soul benefit (chosen after a rest)",list:[["Swimmer","Swimming speed equal to your walking speed, and you breathe underwater."],["Climber","Climbing speed equal to your walking speed."],["Jumper","Strength (Athletics) check added to jump distance, once per turn."]]}]});
 S("Path of the Beast",{n:"Bestial Soul: Swimmer",l:6,when:{key:"gx-bs-sub-Path of the Beast",val:"Swimmer"},mv:{swim:"speed"},def:["Note","Bestial Soul: you breathe underwater"]});
 S("Path of the Beast",{n:"Bestial Soul: Climber",l:6,when:{key:"gx-bs-sub-Path of the Beast",val:"Climber"},mv:{climb:"speed"}});
 S("Path of the Wild Heart",{n:"Aspect of the Wilds",l:6,pick:[{k:"aw",t:"multi",n:1,title:"Aspect of the Wilds (switch after a Long Rest)",list:[["Owl","Darkvision 60 ft, or +60 ft to Darkvision you already have."],["Panther","Climb Speed equal to your Speed."],["Salmon","Swim Speed equal to your Speed."]]}]});
 S("Path of the Wild Heart",{n:"Aspect of the Wilds: Owl",l:6,when:{key:"gx-aw-sub-Path of the Wild Heart",val:"Owl"},darkNone:60,darkHave:{add:60}});
 S("Path of the Wild Heart",{n:"Aspect of the Wilds: Panther",l:6,when:{key:"gx-aw-sub-Path of the Wild Heart",val:"Panther"},mv:{climb:"speed"}});
 S("Path of the Wild Heart",{n:"Aspect of the Wilds: Salmon",l:6,when:{key:"gx-aw-sub-Path of the Wild Heart",val:"Salmon"},mv:{swim:"speed"}});
 S("Path of the Zealot",{n:"Rage of the Gods",l:14,toggle:{id:"zealot-rage-of-the-gods",label:"Rage of the Gods form active"},mv:{fly:"speed"},res:["Necrotic","Psychic","Radiant"]});
 S("Oath of the Noble Genies",{n:"Noble Scion",l:20,toggle:{id:"genies-noble-scion",label:"Noble Scion active"},mv:{fly:60}});
 S("Spellfire Sorcery",{n:"Crown of Spellfire",l:18,toggle:{id:"spellfire-crown",label:"Crown of Spellfire active"},mv:{fly:60}});
 S("Phantom",{n:"Ghost Walk",l:13,toggle:{id:"phantom-ghost-walk",label:"Ghost Walk active"},mv:{fly:10}});
 S("Reaper",{n:"Umbral Form",l:6,toggle:{id:"reaper-umbral-form",label:"Umbral Form active"},speedMul:2,mv:{climb:"speed"},condImm:["Grappled","Prone"]});
 S("Circle of the Spirits",{n:"Spirit Walk",l:14,toggle:{id:"spirits-spirit-walk",label:"Spirit Walk active"},mv:{fly:"speed"},res:["Acid","Cold","Fire","Lightning","Thunder"],def:["Resistance","Nonmagical Bludgeoning, Piercing and Slashing damage"]});
 S("Drake-Blooded",{n:"Aspect of the Greatwyrm",l:17,toggle:{id:"drake-greatwyrm",label:"Aspect of the Greatwyrm active"},mv:{fly:60}});
 S("Verdant Protector",{n:"Oak Sentinel",l:17,toggle:{id:"verdant-oak-sentinel",label:"Oak Sentinel active"},acAdd:4});
 S("Hollow Warden",{n:"Wrath of the Wild",l:3,toggle:{id:"hollow-wrath",label:"Wrath of the Wild active"},acAdd:[[3,1],[11,2]]});
 S("Oath of Conquest",{n:"Invincible Conqueror",l:20,toggle:{id:"conquest-invincible",label:"Invincible Conqueror active"},def:["Resistance","All damage"]});
 S("Oath of the Crown",{n:"Exalted Champion",l:20,toggle:{id:"crown-exalted",label:"Exalted Champion active"},def:["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical weapons"]});
 S("Burden of Rebirth",{n:"Verdant Resilience",l:14,toggle:{id:"rebirth-verdant",label:"Verdant Resilience active"},res:["Bludgeoning","Piercing","Slashing"]});
 S("College of Wyrdsingers",{n:"Make Your Own Fate",l:14,toggle:{id:"wyrdsingers-fate",label:"Song of valor active"},condImm:["Frightened"]});
 /* ---- classes ---- */
 C("Martyr",{n:"Final Martyrdom",l:20,toggle:{id:"martyr-final-martyrdom",label:"Final Martyrdom active"},def:["Immunity","All damage and all conditions except Grappled, Invisible, Prone and Unconscious"],advOn:["all D20 Tests"]});
 /* ---- items ---- */
 I("Omenbringer's Mantle",{n:"Omenbringer's Mantle",res:["Necrotic"],def:["Note","Falls at 60 ft per round without taking fall damage"]});
})();
