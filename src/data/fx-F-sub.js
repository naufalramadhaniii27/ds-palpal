/* fx data batch F: remaining subclass gaps from the mechanics scan (tests/mech_baseline.json, 2026-11-03). Registry GX.sub[subclass]. Schema: SOURCE-NOTES.md, "fx schema".
   Rule text checked in src/data: tp03-tvss, tp13-tsdm, tp14-tkdm, subfull-subclass-feature-text, db2-phb-classes-a. What stays text only is noted per entry.
   Not here on purpose: College of Origami "Origami Familiar" (Find Familiar is already always prepared through the subclass spell data, source "College of Origami"; the scan hit was the familiar's Fly Speed, which is not the character's),
   Champion "Additional Fighting Style" (the native pick CLASSES.Fighter.pickSub.Champion {l:7,k:"fs"}, key p7fs, already counts it; see by_design in the baseline),
   Exo-Frame and Harkon's Bite (fx-D-item.js; Exo-Frame gets "size" there), Toymaker immunities to conditions (fx-B2-subclass.js). */
window.GX=window.GX||{};GX.sub=GX.sub||{};
(function(){
 var S=GX.sub,add=function(n,e){S[n]=(S[n]||[]).concat(e)};
 /* Record-only lists. The grafts are inventory items (tp13-tsdm, tp03-tvss); a pick cannot add an item, so it only stores the choice. */
 var CONSTRUCT_GRAFTS=[
  ["Android Skin", "External slot graft."],
  ["Cantrip Module", "Head slot graft."],
  ["Arm Blade", "Arms slot graft."],
  ["Arm Cannon", "Arms slot graft."],
  ["Black Box", "Head slot graft."],
  ["Climbing Apparatus", "Legs slot graft."],
  ["Concentration Module", "Internal slot graft."],
  ["Embedded Armor", "External slot graft."],
  ["Embedded Mini Fridge", "Internal slot graft."],
  ["Embedded Translator", "Head slot graft."],
  ["Embedded Weapon", "Arms slot graft."],
  ["Finger Picks", "Arms slot graft."],
  ["Hacker Hands", "Arms slot graft."],
  ["Heart of Steel", "Internal slot graft."],
  ["Heavy Legs", "Legs slot graft."],
  ["Impulse Unit", "Legs slot graft."],
  ["Infrasight Eyes", "Head slot graft."],
  ["Laser Eyes", "Head slot graft."],
  ["Logic Unit", "Head slot graft."],
  ["Personality Module", "Head slot graft."],
  ["Remote Eye", "Head slot graft."],
  ["Replacement", "Any slot graft."],
  ["Shield Module", "Internal slot graft."],
  ["Shock Absorbers", "Legs slot graft."],
  ["Spacewalkers", "Legs slot graft."],
  ["Spiked Skin", "External slot graft."],
  ["Thermalsight Eyes", "Head slot graft."],
  ["Traction Spikes", "Legs slot graft."],
  ["Voice Changer", "Head slot graft."]];
 var MONSTROUS_GRAFTS=[
  ["Amphibious Adaptation", "Graft, Any Creature with Amphibious or Water Breathing."],
  ["Arcane Synapses", "Donor: a creature with the Spellcasting action."],
  ["Burrowing Adaptation", "Donor: a creature with a Burrow Speed of 10+ ft."],
  ["Climbing Apparatus", "Donor: a creature with a Climb Speed."],
  ["Heart of Steel", "Donor: a Construct."],
  ["Heavy Legs", "Donor: a Large or larger Monstrosity."],
  ["Hellfire Blood", "Donor: a Fiend."],
  ["Leaping Legs", "Donor: a creature with Standing Leap or a leap Bonus Action."],
  ["Monstrous Bite", "Donor: a creature with a Bite action."],
  ["Monstrous Hide", "Donor: a creature with AC 17+ without armor."],
  ["Monstrous Weapon", "Donor: a creature with a Claw or Rend action. Rare in the book but suggested by Mad Scientist."],
  ["Nocturnal Eyes", "Donor: a creature with Darkvision."],
  ["Ooze Infusion", "Donor: an Ooze."],
  ["Prehensile Tail", "Donor: a creature with a tail."],
  ["Replacement", "Graft, any donor."],
  ["Shapeshifter Blood", "Donor: a creature with a Shape-Shift action."]];
 var MANEUVERS=["Battle Edge","Bear Hug","Blinding Attack","Bull Rush","Challenge","Coup de Grâce","Dig Deep","Dodge Roll","Eagle Eye","Effortless Dodge","Flourish","Heel-Cutter","Horrific Strike","Iron Wall","Knack","Lightning Reflexes","Rampage","Riposte","Ruinous Blow","Skirmish","Staggering Strike","Stunning Blow","Whirlwind","Wounding Strike"].map(function(n){return [n,""]});
 var FOES=["Aberrations","Beasts","Celestials","Constructs","Dragons","Elementals","Fey","Fiends","Giants","Monstrosities","Oozes","Plants","Undead","Two humanoid races (name them in your notes)"].map(function(n){return [n,""]});
 /* Cleric, Hunting Domain. Resolute Hunter: favored enemy as a ranger (2014 Favored Enemy text in the Ranger row): Advantage on Wisdom (Survival) checks to track them and Intelligence checks to recall information about them, plus a language they speak.
    The first enemy is chosen at 6, more at 10 and 16. The checks are conditional, so they are text (advOn). Enemy type and language are stored picks (the language is optional: the enemy may have none). */
 add("Hunting Domain",[
  {n:"Resolute Hunter",l:6,advOn:["Wisdom (Survival) checks to track your favored enemies","Intelligence checks to recall information about your favored enemies"],pick:[{k:"fe1",t:"multi",n:1,yc:1,list:FOES,title:"Favored enemy"},{k:"fl1",t:"lang",n:1,opt:1,title:"Language of that favored enemy (if it speaks one)"}]},
  {n:"Resolute Hunter",l:10,pick:[{k:"fe2",t:"multi",n:1,yc:1,list:FOES,title:"Second favored enemy"},{k:"fl2",t:"lang",n:1,opt:1,title:"Language of the second favored enemy (if it speaks one)"}]},
  {n:"Resolute Hunter",l:16,pick:[{k:"fe3",t:"multi",n:1,yc:1,list:FOES,title:"Third favored enemy"},{k:"fl3",t:"lang",n:1,opt:1,title:"Language of the third favored enemy (if it speaks one)"}]}]);
 /* Druid, Circle of the Sea. Aquatic Affinity: Swim Speed equal to your Speed (stated without a condition). The 10-ft Emanation of Wrath of the Sea is text only (it needs Wild Shape to be active). */
 add("Circle of the Sea",[{n:"Aquatic Affinity",l:6,mv:{swim:"speed"}}]);
 /* Fighter, Cybernetic. Cybernetic Crafts: two Common or Uncommon Construct grafts. Stored choice only; add the grafts to the inventory. Graft slots and free installation are text only. */
 add("Cybernetic",[{n:"Cybernetic Crafts",l:3,pick:[{k:"graft",t:"multi",n:2,yc:1,list:CONSTRUCT_GRAFTS,title:"Two Construct grafts"}]}]);
 /* Gadgeteer, AI Futurist. Novel Intelligence: one more skill from the AI Companion list (Arcana, Data, History, Investigation, Nature, Religion, Technology).
    The skill gives Advantage on Intelligence checks with it, not proficiency, so this is a stored choice only (a "skills" pick would grant proficiency). Translator: the AI knows all languages (the AI, not you), text only. */
 add("AI Futurist",[{n:"Novel Intelligence",l:3,pick:[{k:"aiskill",t:"multi",n:1,yc:1,list:[["Arcana",""],["Data",""],["History",""],["Investigation",""],["Nature",""],["Religion",""],["Technology",""]],title:"Bonus AI Companion skill"}]}]);
 /* Necromancer, Toymaker. Clockwork Lich [Lichdom]. The six condition immunities are counted in fx-B2-subclass.js. Added here: the Construct body and the three spell immunities, as defenses lines (the spells are picked when the body is built, free text). */
 add("Toymaker",[{n:"Clockwork Lich [Lichdom]",l:20,defs:[["Note","Your type is Construct instead of Undead (Clockwork Body)"]],pick:[{k:"spimm",t:"text",n:1,yc:1,defT:"Immunity",dpre:"Spells",title:"Three spells you are immune to (type their names)"}]}]);
 /* Alchemist, Xenoalchemist. Mad Scientist: two Common or Uncommon monstrous grafts. Intelligence for graft Unarmed Strikes and the Alchemist save DC for graft saves are text only (no attack-stat substitution field). */
 add("Xenoalchemist",[{n:"Mad Scientist",l:3,pick:[{k:"graft",t:"multi",n:2,yc:1,list:MONSTROUS_GRAFTS,title:"Two monstrous grafts"}]}]);
 /* Intelligent Grafts: Intelligence may replace Strength or Dexterity only for Unarmed Strikes that a graft improves (Monstrous Bite, Monstrous Weapon). The text is conditional, so atkAb is a note (opt:1), not a changed stat. */
 ["Monstrous Bite","Monstrous Weapon"].forEach(function(g){add("Xenoalchemist",[{n:"Mad Scientist: "+g,l:3,when:{key:"gx-graft-sub-Xenoalchemist",val:g},atkAb:{kind:"unarmed",ab:"INT",opt:1,note:"Intelligent Grafts ("+g+"): you can use Intelligence instead of Strength or Dexterity for the attack and damage of Unarmed Strikes that this graft improves"}}])});
 /* Vagabond, Experiment X (also Captain and Gunslinger by cross-compatibility, same subclass name). Bloody Rampage: learn Rampage, or another maneuver if you already know it. Stored choice only.
    Using Rampage when damage makes a creature Bloodied is a play-time trigger, text only. */
 add("Experiment X",[{n:"Bloody Rampage",l:3,pick:[{k:"rampage",t:"multi",n:1,yc:1,list:MANEUVERS,title:"Rampage, or another maneuver if you already know Rampage"}]}]);
})();
