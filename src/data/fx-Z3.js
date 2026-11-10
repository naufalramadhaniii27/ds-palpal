DataEnv.declare("__fxZ3");
/* fx data Z3 (zero miss 3, reports/zm3.md): sentences of the classes ADV (advantage), RES (resistance) and SPELL that the sheet did not carry.
   Play states with a duration (a vow, a trance, a form, a spirit) are toggles like fx-Z2.js: the line appears in Defenses only while the state is on (S.fxT).
   Passive rules that are true all the time, with their condition in the words, are plain Notes (defs) or advOn lines.
   Entries marked ed:"2024" are for 2024 builds only (the 2014 class table has no such feature, or reads differently). The field and its gate handler are new (10b, schema 10e).
   Readings and sources: reports/rules-notes.md, section "Zero miss 3". */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};GX.feat=GX.feat||{};GX.cls=GX.cls||{};
(function(){
 if(DataEnv.slot.__fxZ3)return;DataEnv.slot.__fxZ3=1;
 function put(t,n,e){(GX[t][n]=GX[t][n]||[]).push(e)}
 function S(n,e){put("sub",n,e)}
 function F(n,e){put("feat",n,e)}
 function C(n,e){put("cls",n,e)}
 var ALLX=["Acid","Bludgeoning","Cold","Fire","Force","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder"];
 function except(list){return ALLX.filter(function(t){return list.indexOf(t)<0})}
 /* ---- class ---- */
 C("Bard",{n:"Countercharm",l:7,ed:"2024",defs:[["Note","Reaction: you, or a creature within 30 ft, that fails a save against being Charmed or Frightened rerolls it with Advantage"]]});
 C("Rogue",{n:"Elusive",l:18,defs:[["Note","Attack rolls against you can't have Advantage unless you have the Incapacitated condition"]]});
 C("Rogue",{n:"Steady Aim",l:3,ed:"2024",toggle:{id:"steady-aim",label:"Steady Aim used this turn"},advOn:["your next attack roll this turn (only if you haven't moved)"],defs:[["Note","Your Speed is 0 for the rest of the turn"]]});
 C("Sorcerer",{n:"Innate Sorcery",l:1,ed:"2024",toggle:{id:"innate-sorcery",label:"Innate Sorcery active"},spDc:1,advOn:["attack rolls for Sorcerer spells you cast"]});
 C("Monk",{n:"Superior Defense",l:18,ed:"2024",toggle:{id:"superior-defense",label:"Superior Defense active (3 Focus Points)"},res:except(["Force"])});
 C("Warlock",{n:"Eldritch Master",l:20,ed:"2024",defs:[["Note","Magical Cunning restores every expended Pact Magic slot"]]});
 /* ---- subclass ---- */
 S("Path of the Wild Heart",{n:"Rage of the Wilds (Bear)",l:3,toggle:{id:"wild-bear",label:"Raging with the Bear spirit"},res:except(["Force","Necrotic","Psychic","Radiant"])});
 S("Path of the Wild Heart",{n:"Rage of the Wilds (Wolf)",l:3,toggle:{id:"wild-wolf",label:"Raging with the Wolf spirit"},defs:[["Note","Your allies make attack rolls with Advantage against any enemy of yours within 5 ft of you"]]});
 S("Path of the Zealot",{n:"Zealous Presence",l:10,toggle:{id:"zealous-presence",label:"Zealous Presence active (until your next turn starts)"},defs:[["Note","Up to ten creatures you chose within 60 ft have Advantage on attack rolls and saving throws"]]});
 S("Champion",{n:"Survivor (Defy Death)",l:18,advOn:["Death Saving Throws"],defs:[["Note","A Death Saving Throw of 18 to 20 counts as a 20"]]});
 S("Oath of Glory",{n:"Living Legend",l:20,toggle:{id:"living-legend",label:"Living Legend active (10 minutes)"},advOn:["Charisma checks"],defs:[["Note","After a failed saving throw, Reaction: reroll it and keep the new result"],["Note","Once per turn, a missed weapon attack roll can be turned into a hit"]]});
 S("Oath of Vengeance",{n:"Avenging Angel (Frightful Aura)",l:20,toggle:{id:"avenging-angel",label:"Avenging Angel active"},defs:[["Note","An enemy Frightened by your Frightful Aura: attack rolls against it have Advantage"]]});
 S("Trickery Domain",{n:"Blessing of the Trickster",l:3,toggle:{id:"trickster-blessing",label:"Blessing of the Trickster on you"},advOn:["Dexterity (Stealth) checks"]});
 S("Trickery Domain",{n:"Invoke Duplicity",l:3,toggle:{id:"invoke-duplicity",label:"Invoke Duplicity: you and the illusion are within 5 ft of the target"},advOn:["attack rolls against a creature that can see your illusion"]});
 S("Circle of the Moon",{n:"Moonlight Step",l:10,toggle:{id:"moonlight-step",label:"Moonlight Step used this turn"},advOn:["your next attack roll this turn"]});
 S("Circle of the Stars",{n:"Full of Stars",l:14,toggle:{id:"starry-form",label:"Starry Form active"},res:["Bludgeoning","Piercing","Slashing"]});
 S("Warrior of Shadow",{n:"Shadow Step",l:6,toggle:{id:"shadow-step",label:"Shadow Step used this turn"},advOn:["your next melee attack before the turn ends"]});
 /* Elemental Epitome: one damage type, switched at the start of each turn. A builder pick, the resistance follows the pick (like Totem Spirit). */
 S("Warrior of the Elements",{n:"Elemental Epitome (Damage Resistance)",l:17,pick:[{k:"epitome",t:"multi",n:1,title:"Elemental Epitome: Damage Resistance",list:[["Acid",""],["Cold",""],["Fire",""],["Lightning",""],["Thunder",""]]}]});
 ["Acid","Cold","Fire","Lightning","Thunder"].forEach(function(t){S("Warrior of the Elements",{n:"Elemental Epitome (Damage Resistance)",l:17,when:{key:"gx-epitome-sub-Warrior of the Elements",val:t},toggle:{id:"elem-attune",label:"Elemental Attunement active"},res:[t]})});
 S("Oath of Glory",{n:"Peerless Athlete",l:3,toggle:{id:"peerless-athlete",label:"Peerless Athlete active (1 hour)"},advOn:["Dexterity (Acrobatics) and Strength (Athletics) checks"]});
 S("Oath of Vengeance",{n:"Vow of Enmity",l:3,toggle:{id:"vow-of-enmity",label:"Vow of Enmity sworn"},advOn:["attack rolls against the creature you swore the vow against"]});
 S("Oath of the Ancients",{n:"Elder Champion",l:20,toggle:{id:"elder-champion",label:"Elder Champion active (1 minute)"},defs:[["Note","Enemies in your aura have Disadvantage on saves against your spells and Channel Divinity options"],["Note","You regain 10 Hit Points at the start of each of your turns"],["Note","A spell with a casting time of an action can be cast with a Bonus Action"]]});
 S("Hunter",{n:"Superior Hunter's Defense",l:15,defs:[["Note","Reaction when you take damage: Resistance to that damage, and to further damage of that type until the end of the turn"]]});
 S("Clockwork Sorcery",{n:"Trance of Order",l:14,toggle:{id:"trance-of-order",label:"Trance of Order active (1 minute)"},defs:[["Note","Attack rolls against you can't benefit from Advantage"],["Note","D20 Tests: you can count a d20 result of 9 or lower as a 10"]]});
 S("Wild Magic Sorcery",{n:"Tides of Chaos",l:3,toggle:{id:"tides-of-chaos",label:"Tides of Chaos ready"},advOn:["a single D20 Test (chosen before the roll)"]});
 S("Great Old One Patron",{n:"Clairvoyant Combatant",l:6,toggle:{id:"clairvoyant-combatant",label:"Awakened Mind bond: the creature failed its save"},advOn:["attack rolls against the bonded creature"],defs:[["Note","The bonded creature has Disadvantage on attack rolls against you"],["Note","Its use returns on a Short or Long Rest, or at once by expending a Pact Magic slot (no action)"]]});
 /* ---- feat ---- */
 F("Crusher",{n:"Crusher (Enhanced Critical)",defs:[["Note","A Critical Hit that deals Bludgeoning damage: attack rolls against that creature have Advantage until the start of your next turn"]]});
 F("Boon of Spell Recall",{n:"Boon of Spell Recall (Free Casting)",defs:[["Note","Casting with a level 1 to 4 slot: roll 1d4. If it equals the slot's level, the slot is not expended"]]});
 F("Boon of the Night Spirit",{n:"Boon of the Night Spirit (Shadowy Form)",toggle:{id:"shadowy-form",label:"In Dim Light or Darkness"},res:except(["Psychic","Radiant"])});
 /* ---- uncovered 2 (reports/uncovered-2.md): Extra Attack of the classes and subclasses whose text says "attack twice". The level is the row level of the app data.
    Fighter, Barbarian, Monk, Paladin and Ranger keep the old text rule "per Extra Attack" (12i), and the largest value wins in 12l, so a multiclass character is not counted twice.
    The Dancer rows "Three-, Four- and Five-Target Extra Attack" are conditional on every attack hitting another creature and are not set here (reports/rules-notes.md). */
 [["Craftsman",5],["Dancer",5],["Gadgeteer",5],["Jaeger",5],["Martyr",5],["Monster Hunter",11],["Vagabond",5],["Warden",5]].forEach(function(a){C(a[0],{n:"Extra Attack",l:a[1],extraAttack:2})});
 [["Mutagenist",5],["College of Valor",6],["College of Valor (2014)",6],["College of Swords",6],["Star-Spangled Banner",6],["Black Rider",6],["Death Knight",6],["Lumimancer",6]].forEach(function(a){S(a[0],{n:"Extra Attack",l:a[1],extraAttack:2})});
})();
