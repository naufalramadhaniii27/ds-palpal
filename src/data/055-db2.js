
/* PHB 2024 database, part 2. f: [level, name, summary]. res: resources. pick: choices on level up. eq: starting equipment options A, B (C). */
var CLASSES={};
CLASSES.Barbarian={hd:12,prim:"STR",saves:["STR","CON"],sk:{n:2,from:["Animal Handling","Athletics","Intimidation","Nature","Perception","Survival"]},
 armor:"Light, Medium, Shields",weapons:"Simple, Martial",tools:"",wm:[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4],
 eq:["Greataxe, 4 Handaxes, Explorer's Pack, 15 GP","75 GP"],
 f:[[1,"Rage","Bonus Action, not in Heavy armor: Resistance to Bludgeoning, Piercing, Slashing. Bonus damage on Str attacks. Advantage on Str checks and saves. No spells. Lasts until end of next turn, extendable up to 10 minutes. Regain one use on a Short Rest."],
 [1,"Unarmored Defense","Without armor, AC = 10 + Dex + Con. Shield allowed."],
 [1,"Weapon Mastery","Choose two kinds of Simple or Martial melee weapons and use their mastery properties. The number grows with Barbarian level: 3 at level 4, 4 at level 10. Whenever you finish a Long Rest, you can swap one choice."],
 [2,"Danger Sense","Advantage on Dex saves unless Incapacitated."],
 [2,"Reckless Attack","Advantage on Str attacks this turn, but attacks against you have Advantage until your next turn."],
 [3,"Barbarian Subclass","Choose a Barbarian subclass."],
 [3,"Primal Knowledge","One more Barbarian skill. While raging, use Str for Acrobatics, Intimidation, Perception, Stealth, or Survival."],
 [5,"Extra Attack","Attack twice with the Attack action."],
 [5,"Fast Movement","Speed +10 ft without Heavy armor."],
 [7,"Feral Instinct","Advantage on Initiative."],
 [7,"Instinctive Pounce","When you enter Rage, move up to half your Speed."],
 [9,"Brutal Strike","Forgo Advantage from Reckless Attack to deal +1d10 and apply Forceful Blow or Hamstring Blow."],
 [11,"Relentless Rage","At 0 HP while raging, a Con save (DC 10, +5 each use) sets HP to twice your level."],
 [13,"Improved Brutal Strike","New options: Staggering Blow and Sundering Blow."],
 [15,"Persistent Rage","Regain all Rage uses on Initiative once per Long Rest. Rage lasts 10 minutes without extending."],
 [17,"Improved Brutal Strike","Brutal Strike deals +2d10 and applies two effects."],
 [18,"Indomitable Might","Str checks and saves use your Str score as a minimum."],
 [19,"Epic Boon","Gain an Epic Boon feat."],
 [20,"Primal Champion","Str and Con +4, max 25."]],
 res:[{n:"Rage",tag:"Bonus Action",reset:"short1",max:[2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,6]}],
 track:{"Rage Damage":[2,2,2,2,2,2,2,2,3,3,3,3,3,3,3,4,4,4,4,4]},
 pick:[{l:3,k:"skill",n:1,feature:"Primal Knowledge",title:"Primal Knowledge: skill"}],
 subs:{
  "Path of the Berserker":[[3,"Frenzy","While raging with Reckless Attack, the first Str hit each turn deals extra d6s equal to your Rage Damage bonus."],[6,"Mindless Rage","Immune to Charmed and Frightened while raging."],[10,"Retaliation","Reaction: melee attack a creature within 5 ft that damages you."],[14,"Intimidating Presence","Bonus Action: creatures you choose in a 30 ft Emanation. Target WIS save (DC 8 + PB + STR). Fail: Frightened for 1 minute, save again at the end of each turn. Once per Long Rest, or spend a Rage to use it again."]],
  "Path of the Wild Heart":[[3,"Animal Speaker","Ritual-cast Beast Sense and Speak with Animals."],[3,"Rage of the Wilds","While raging choose Bear (resist almost everything), Eagle (Dash/Disengage bonus), or Wolf (allies get Advantage)."],[6,"Aspect of the Wilds","Choose Owl (Darkvision 60), Panther (climb), or Salmon (swim)."],[10,"Nature Speaker","Ritual-cast Commune with Nature."],[14,"Power of the Wilds","While raging choose Falcon (fly), Lion (enemies distracted), or Ram (knock Prone)."]],
  "Path of the World Tree":[[3,"Vitality of the Tree","Raging grants Temporary HP equal to level. Each turn give an ally Temp HP in d6s."],[6,"Branches of the Tree","Reaction while raging, when a creature you see within 30 ft starts its turn. Target STR save (DC 8 + PB + STR). Fail: teleported to a space within 5 ft of you, and you can set its Speed to 0 for this turn."],[10,"Battering Roots","Reach +10 ft with Heavy or Versatile weapons. Push or Topple on hits."],[14,"Travel Along the Tree","Teleport 60 ft when raging, or 150 ft with allies once per Rage."]],
  "Path of the Zealot":[[3,"Divine Fury","First hit each turn while raging: +1d6 + half level Necrotic or Radiant."],[3,"Warrior of the Gods","Pool of d12s to heal yourself as a Bonus Action."],[6,"Fanatical Focus","Reroll a failed save once per Rage with a bonus equal to Rage Damage."],[10,"Zealous Presence","Bonus Action: up to ten allies gain Advantage on attacks and saves. Once per Long Rest or spend a Rage."],[14,"Rage of the Gods","Once per Long Rest: fly, resist Necrotic, Psychic, Radiant, and save allies from dying."]]}};

CLASSES.Bard={hd:8,prim:"CHA",saves:["DEX","CHA"],sk:{n:3,from:ALLSK},armor:"Light",weapons:"Simple",tools:"Three Musical Instruments",toolPick:{n:3,cats:["music"]},caster:"full",cast:"CHA",
 eq:["Leather Armor, 2 Daggers, Musical Instrument, Entertainer's Pack, 19 GP","90 GP"],
 f:[[1,"Bardic Inspiration","Bonus Action: give a creature in 60 ft a die (d6, d8 at 5, d10 at 10, d12 at 15) to add to a failed D20 Test. Uses equal to Cha mod per Long Rest."],
 [1,"Spellcasting","Charisma-based. Cantrips and prepared spells from the Bard list."],
 [2,"Expertise","Expertise in two skills you're proficient in."],
 [2,"Jack of All Trades","Add half PB to ability checks without proficiency."],
 [3,"Bard Subclass","Choose a Bard subclass."],
 [5,"Font of Inspiration","Regain Bardic Inspiration on a Short Rest. Spend a slot to regain a use."],
 [7,"Countercharm","Reaction: a creature in 30 ft rerolls a failed save against Charmed or Frightened with Advantage."],
 [9,"Expertise","Expertise in two more skills."],
 [10,"Magical Secrets","Prepare spells from the Bard, Cleric, Druid, and Wizard lists."],
 [18,"Superior Inspiration","Regain Bardic Inspiration up to two uses on Initiative."],
 [19,"Epic Boon","Gain an Epic Boon feat."],
 [20,"Words of Creation","Power Word Heal and Power Word Kill always prepared, can target a second creature."]],
 res:[{n:"Bardic Inspiration",tag:"Bonus Action",reset:"long",short5:1,max:"mod:CHA"}],
 track:{"Inspiration Die":["d6","d6","d6","d6","d8","d8","d8","d8","d8","d10","d10","d10","d10","d10","d12","d12","d12","d12","d12","d12"]},
 pick:[{l:2,k:"expertise",n:2},{l:9,k:"expertise",n:2}],
 subs:{
  "College of Dance":[[3,"Dazzling Footwork","Unarmored: AC 10 + Dex + Cha, Unarmed Strike uses Dex with Bardic die damage, Advantage on Performance."],[6,"Inspiring Movement","Reaction: you and an ally move half Speed without opportunity attacks."],[6,"Tandem Footwork","Spend Bardic Inspiration to boost your and allies' Initiative."],[14,"Leading Evasion","Evasion for you and nearby allies."]],
  "College of Glamour":[[3,"Beguiling Magic","Charm Person and Mirror Image always prepared. After an Enchantment or Illusion spell, charm or frighten a creature."],[3,"Mantle of Inspiration","Spend Bardic Inspiration to give allies Temporary HP and free movement."],[6,"Mantle of Majesty","Command always prepared, cast it as a Bonus Action each turn for 1 minute."],[14,"Unbreakable Majesty","Bonus Action: majestic presence for 1 minute, once per Short or Long Rest. The first creature to hit you each turn: Target CHA save (spell save DC). Fail: the attack misses."]],
  "College of Lore":[[3,"Bonus Proficiencies","Three skills of your choice."],[3,"Cutting Words","Reaction: subtract Bardic Inspiration from an enemy's attack, damage, or check."],[6,"Magical Discoveries","Prepare two spells from the Cleric, Druid, or Wizard lists."],[14,"Peerless Skill","Add Bardic Inspiration to your own failed check or attack."]],
  "College of Valor":[[3,"Combat Inspiration","Allies can add Bardic Inspiration to damage or to AC against one attack."],[3,"Martial Training","Martial weapons, Medium armor, and Shields. Use a weapon as a spellcasting focus."],[6,"Extra Attack","Attack twice, one can be a cantrip."],[14,"Battle Magic","After casting a spell, attack with a weapon as a Bonus Action."]]}};

CLASSES.Cleric={hd:8,prim:"WIS",saves:["WIS","CHA"],sk:{n:2,from:["History","Insight","Medicine","Persuasion","Religion"]},armor:"Light, Medium, Shields",weapons:"Simple",tools:"",caster:"full",cast:"WIS",
 eq:["Chain Shirt, Shield, Mace, Holy Symbol, Priest's Pack, 7 GP","110 GP"],
 f:[[1,"Spellcasting","Wisdom-based. Cantrips and prepared spells from the Cleric list."],
 [1,"Divine Order","Protector (Heavy armor and Martial weapons) or Thaumaturge (extra cantrip, add Wis to Arcana and Religion)."],
 [2,"Channel Divinity","Divine Spark (heal or deal Necrotic/Radiant damage) and Turn Undead. Regain one use on a Short Rest."],
 [3,"Cleric Subclass","Choose a Cleric subclass."],
 [5,"Sear Undead","Turn Undead also deals Radiant damage in d8s equal to Wis mod."],
 [7,"Blessed Strikes","Divine Strike (+1d8 weapon damage) or Potent Spellcasting (add Wis to cantrip damage)."],
 [10,"Divine Intervention","Cast a Cleric spell of level 5 or lower free, once per Long Rest."],
 [14,"Improved Blessed Strikes","Divine Strike becomes 2d8, or Potent Spellcasting grants Temporary HP."],
 [19,"Epic Boon","Gain an Epic Boon feat."],
 [20,"Greater Divine Intervention","Divine Intervention can cast Wish."]],
 res:[{n:"Channel Divinity",tag:"Short Rest",reset:"short1",max:[0,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4,4]}],
 pick:[{l:1,k:"opt",list:"Divine Order"},{l:7,k:"opt",list:"Blessed Strikes"}],
 subs:{
  "Life Domain":[[3,"Disciple of Life","Healing spells restore extra HP equal to 2 + spell level."],[3,"Life Domain Spells","Aid, Bless, Cure Wounds, Lesser Restoration and more always prepared."],[3,"Preserve Life","Channel Divinity: split HP equal to five times your level among creatures in 30 ft."],[6,"Blessed Healer","Healing others also heals you."],[17,"Supreme Healing","Healing dice use their maximum value."]],
  "Light Domain":[[3,"Light Domain Spells","Burning Hands, Faerie Fire, Scorching Ray, Fireball and more always prepared."],[3,"Radiance of the Dawn","Channel Divinity: dispel magical Darkness and deal 2d10 + level Radiant in 30 ft."],[3,"Warding Flare","Reaction: impose Disadvantage on an attack. Uses equal to Wis mod."],[6,"Improved Warding Flare","Regain uses on Short Rest, grant Temporary HP."],[17,"Corona of Light","Emit sunlight. Enemies have Disadvantage on saves against your fire and radiant spells."]],
  "Trickery Domain":[[3,"Blessing of the Trickster","Give a creature Advantage on Stealth checks."],[3,"Invoke Duplicity","Channel Divinity: create an illusory double to cast through and gain Advantage."],[3,"Trickery Domain Spells","Charm Person, Disguise Self, Invisibility, Pass without Trace and more."],[6,"Trickster's Transposition","Teleport to swap places with your duplicate."],[17,"Improved Duplicity","Allies gain Advantage near the duplicate. Healing when it ends."]],
  "War Domain":[[3,"Guided Strike","Channel Divinity: +10 to an attack roll."],[3,"War Domain Spells","Guiding Bolt, Magic Weapon, Shield of Faith, Spirit Guardians and more."],[3,"War Priest","Bonus Action weapon attack. Uses equal to Wis mod per Short Rest."],[6,"War God's Blessing","Cast Shield of Faith or Spiritual Weapon via Channel Divinity without Concentration."],[17,"Avatar of Battle","Resistance to Bludgeoning, Piercing, and Slashing."]]}};

CLASSES.Druid={hd:8,prim:"WIS",saves:["INT","WIS"],sk:{n:2,from:["Animal Handling","Arcana","Insight","Medicine","Nature","Perception","Religion","Survival"]},armor:"Light, Shields",weapons:"Simple",tools:"Herbalism Kit",caster:"full",cast:"WIS",
 eq:["Leather Armor, Shield, Sickle, Druidic Focus (Quarterstaff), Explorer's Pack, Herbalism Kit, 9 GP","50 GP"],
 f:[[1,"Spellcasting","Wisdom-based. Cantrips and prepared spells from the Druid list."],
 [1,"Druidic","You know Druidic. Speak with Animals always prepared."],
 [1,"Primal Order","Magician (extra cantrip, add Wis to Arcana and Nature) or Warden (Martial weapons, Medium armor)."],
 [2,"Wild Shape","Bonus Action: turn into a known Beast. Uses regain one on Short Rest."],
 [2,"Wild Companion","Spend a slot or Wild Shape to cast Find Familiar."],
 [3,"Druid Subclass","Choose a Druid subclass."],
 [5,"Wild Resurgence","Trade Wild Shape and spell slots both ways."],
 [7,"Elemental Fury","Potent Spellcasting (add Wis to cantrip damage) or Primal Strike (+1d8 elemental damage)."],
 [15,"Improved Elemental Fury","Cantrip range +300 ft, or Primal Strike 2d8."],
 [18,"Beast Spells","Cast spells in Wild Shape."],
 [19,"Epic Boon","Gain an Epic Boon feat."],
 [20,"Archdruid","Regain a Wild Shape on Initiative. Convert Wild Shape to slots. Age slowly."]],
 res:[{n:"Wild Shape",tag:"Bonus Action",reset:"short1",max:[0,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,4,4,4,4]}],
 pick:[{l:1,k:"opt",list:"Primal Order"},{l:2,k:"forms",feature:"Wild Shape",title:"Wild Shape: known Beast forms",yc:1},{l:7,k:"opt",list:"Elemental Fury"}],
 subs:{
  "Circle of the Land":[[3,"Circle of the Land Spells","Choose arid, polar, temperate, or tropical land for always-prepared spells."],[3,"Land's Aid","Wild Shape use: 2d6 Necrotic damage in an area and heal one creature 2d6."],[6,"Natural Recovery","Recover spell slots on a Short Rest."],[10,"Nature's Ward","Immune to Poisoned. Resistance tied to your land."],[14,"Nature's Sanctuary","Wild Shape use: spectral trees give Half Cover and Resistance."]],
  "Circle of the Moon":[[3,"Circle Forms","Wild Shape into CR up to level / 3, AC at least 13 + Wis, Temp HP x3 level."],[3,"Circle of the Moon Spells","Cure Wounds, Moonbeam, Starry Wisp and more. Cast some in Wild Shape."],[6,"Improved Circle Forms","Radiant damage option, add Wis to Con saves."],[10,"Moonlight Step","Bonus Action teleport 30 ft with Advantage after."],[14,"Lunar Form","+2d10 Radiant once per turn, teleport an ally."]],
  "Circle of the Sea":[[3,"Circle of the Sea Spells","Fog Cloud, Gust of Wind, Thunderwave and more."],[3,"Wrath of the Sea","Wild Shape use: emanation that deals Cold damage and pushes."],[6,"Aquatic Affinity","Larger emanation, swim Speed."],[10,"Stormborn","Fly Speed, Resistance to Cold, Lightning, Thunder."],[14,"Oceanic Gift","Put the emanation on an ally, or both."]],
  "Circle of the Stars":[[3,"Star Map","Guiding Bolt prepared and free uses. Guidance cantrip."],[3,"Starry Form","Wild Shape use: Archer, Chalice, or Dragon constellation."],[6,"Cosmic Omen","Reaction: add or subtract a d6 from a roll."],[10,"Twinkling Constellations","Constellation die becomes 2d8. Dragon gives fly. Swap each turn."],[14,"Full of Stars","Resistance to Bludgeoning, Piercing, Slashing in Starry Form."]]}};

CLASSES.Fighter={hd:10,prim:"STR",saves:["STR","CON"],sk:{n:2,from:["Acrobatics","Animal Handling","Athletics","History","Insight","Intimidation","Persuasion","Perception","Survival"]},armor:"Light, Medium, Heavy, Shields",weapons:"Simple, Martial",tools:"",
 wm:[3,3,3,4,4,4,4,4,4,5,5,5,5,5,5,6,6,6,6,6],fs:1,asiX:[6,14],
 eq:["Chain Mail, Greatsword, Flail, 8 Javelins, Dungeoneer's Pack, 4 GP","Studded Leather Armor, Scimitar, Shortsword, Longbow, 20 Arrows, Quiver, Dungeoneer's Pack, 11 GP","155 GP"],
 f:[[1,"Fighting Style","Gain a Fighting Style feat."],
 [1,"Second Wind","Catch your breath and heal yourself. Bonus Action: heal 1d10 + Fighter level. Short Rest: 1 use back."],
 [1,"Weapon Mastery","Choose three kinds of Simple or Martial weapons and use their mastery properties. The number grows with Fighter level: 4 at level 4, 5 at level 10, 6 at level 16 (Weapon Mastery column of the Fighter Features table). Whenever you finish a Long Rest, you can swap one choice."],
 [2,"Action Surge","Take one extra action on your turn, except Magic. Once per Short Rest (twice at 17)."],
 [2,"Tactical Mind","Spend Second Wind to add 1d10 to a failed ability check. Not spent if it still fails."],
 [3,"Fighter Subclass","Choose a Fighter subclass."],
 [5,"Extra Attack","Attack twice with the Attack action."],
 [5,"Tactical Shift","Second Wind also lets you move half Speed without opportunity attacks."],
 [9,"Indomitable","Reroll a failed save with a bonus equal to Fighter level. Uses: 1, 2 at 13, 3 at 17."],
 [9,"Tactical Master","Swap a weapon's mastery to Push, Sap, or Slow on a hit."],
 [11,"Two Extra Attacks","Attack three times with the Attack action."],
 [13,"Studied Attacks","After a miss, gain Advantage on your next attack against that creature."],
 [19,"Epic Boon","Gain an Epic Boon feat."],
 [20,"Three Extra Attacks","Attack four times with the Attack action."]],
 res:[{n:"Second Wind",tag:"Bonus Action",reset:"short1",max:[2,2,2,3,3,3,3,3,3,4,4,4,4,4,4,4,4,4,4,4]},
  {n:"Action Surge",tag:"Short Rest",reset:"short",max:[0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2]},
  {n:"Indomitable",tag:"Long Rest",reset:"long",max:[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3]}],
 subs:{
  "Battle Master":[[3,"Combat Superiority","Four d8 Superiority Dice (more at 7 and 15, d10 at 10, d12 at 18), all back on a Short Rest. Learn three Maneuvers. Maneuver save (DC 8 + PB + STR or DEX)."],[3,"Student of War","One Artisan's Tool and one Fighter skill."],[7,"Know Your Enemy","Bonus Action: learn a creature's immunities, resistances, vulnerabilities."],[10,"Improved Combat Superiority","Superiority Die becomes d10."],[15,"Relentless","Once per turn use a d8 for a maneuver without spending a die."],[18,"Ultimate Combat Superiority","Superiority Die becomes d12."]],
  "Champion":[[3,"Improved Critical","Critical hit on 19 or 20."],[3,"Remarkable Athlete","Advantage on Initiative and Athletics. Move half Speed after a critical hit."],[7,"Additional Fighting Style","Gain another Fighting Style feat."],[10,"Heroic Warrior","Gain Heroic Inspiration at the start of your turn if you have none."],[15,"Superior Critical","Critical hit on 18 to 20."],[18,"Survivor","Advantage on Death Saves. Regain 5 + Con HP each turn when Bloodied."]],
  "Eldritch Knight":[[3,"Spellcasting","Intelligence-based third caster, Wizard list."],[3,"War Bond","Bond with two weapons and summon them as a Bonus Action."],[7,"War Magic","Replace one attack with a cantrip."],[10,"Eldritch Strike","A weapon hit gives the target Disadvantage on its next save against your spell."],[15,"Arcane Charge","Teleport 30 ft when you Action Surge."],[18,"Improved War Magic","Replace two attacks with a level 1 or 2 spell."]],
  "Psi Warrior":[[3,"Psionic Power","Psionic Energy Dice (d6, grows). Protective Field, Psionic Strike, Telekinetic Movement."],[7,"Telekinetic Adept","Psi-Powered Leap and Telekinetic Thrust."],[10,"Guarded Mind","Resistance to Psychic damage. End Charmed or Frightened."],[15,"Bulwark of Force","Give allies Half Cover."],[18,"Telekinetic Master","Cast Telekinesis and attack as a Bonus Action."]]}};
CLASSES.Fighter.pickSub={"Battle Master":[{l:3,k:"maneuver",n:3},{l:7,k:"maneuver",n:2},{l:10,k:"maneuver",n:2},{l:15,k:"maneuver",n:2}],"Champion":[{l:7,k:"fs",n:1}]};
CLASSES.Fighter.resSub={"Battle Master":[{n:"Superiority Dice",tag:"Short Rest",reset:"short",max:[0,0,4,4,4,4,5,5,5,5,5,5,5,5,6,6,6,6,6,6]}],"Psi Warrior":[{n:"Psionic Energy Dice",tag:"Short Rest",reset:"short1",max:[0,0,4,4,6,6,6,6,8,8,8,8,10,10,10,10,12,12,12,12]}],"Eldritch Knight":[]};

CLASSES.Monk={hd:8,prim:"DEX",saves:["STR","DEX"],sk:{n:2,from:["Acrobatics","Athletics","History","Insight","Religion","Stealth"]},armor:"None",weapons:"Simple, Martial with the Light property",tools:"One Artisan's Tool or Musical Instrument",toolPick:{n:1,cats:["art","music"]},
 eq:["Spear, 5 Daggers, Artisan's Tools or Musical Instrument, Explorer's Pack, 11 GP","50 GP"],
 f:[[1,"Martial Arts","Unarmed and Monk weapons use Dex, Martial Arts die (d6 rising to d12). Bonus Action Unarmed Strike."],
 [1,"Unarmored Defense","Without armor or Shield, AC = 10 + Dex + Wis."],
 [2,"Monk's Focus","Focus Points equal to level. Flurry of Blows, Patient Defense, Step of the Wind."],
 [2,"Unarmored Movement","Speed bonus without armor (+10 ft, rising to +30)."],
 [2,"Uncanny Metabolism","On Initiative, regain all Focus Points and heal Martial Arts die + level, once per Long Rest."],
 [3,"Deflect Attacks","Reaction: reduce attack damage by 1d10 + Dex + level, redirect for 1 Focus."],
 [3,"Monk Subclass","Choose a Monk subclass."],
 [4,"Slow Fall","Reaction: reduce falling damage by five times your level."],
 [5,"Extra Attack","Attack twice with the Attack action."],
 [5,"Stunning Strike","Once per turn, on a Monk weapon or Unarmed Strike hit, spend 1 Focus. Target CON save (DC 8 + PB + WIS). Fail: Stunned until your next turn. Success: Speed halved and the next attack on it has Advantage."],
 [6,"Empowered Strikes","Unarmed Strike can deal Force damage."],
 [7,"Evasion","Dex saves for half damage take none, and failures take half."],
 [9,"Acrobatic Movement","Move along walls and on liquids."],
 [10,"Heightened Focus","Flurry gets three strikes, Patient Defense and Step of the Wind improved."],
 [10,"Self-Restoration","End Charmed, Frightened, or Poisoned at end of turn. No exhaustion from skipping food and water."],
 [13,"Deflect Energy","Deflect Attacks works on any damage type."],
 [14,"Disciplined Survivor","Proficiency in all saves. Reroll a failed save for 1 Focus."],
 [15,"Perfect Focus","On Initiative with 3 or fewer Focus, regain up to 4."],
 [18,"Superior Defense","3 Focus: Resistance to all damage except Force for 1 minute."],
 [19,"Epic Boon","Gain an Epic Boon feat."],
 [20,"Body and Mind","Dex and Wis +4, max 25."]],
 res:[{n:"Focus Points",tag:"Short Rest",reset:"short",max:"lvl",min2:1}],
 track:{"Martial Arts Die":["d6","d6","d6","d6","d8","d8","d8","d8","d8","d8","d10","d10","d10","d10","d10","d10","d12","d12","d12","d12"],"Unarmored Movement":["","+10 ft","+10 ft","+10 ft","+10 ft","+15 ft","+15 ft","+15 ft","+15 ft","+20 ft","+20 ft","+20 ft","+20 ft","+25 ft","+25 ft","+25 ft","+25 ft","+30 ft","+30 ft","+30 ft"]},
 subs:{
  "Warrior of Mercy":[[3,"Hand of Harm","Once per turn, 1 Focus: extra Necrotic damage on an Unarmed hit."],[3,"Hand of Healing","Replace a Flurry strike or spend Focus to heal."],[3,"Implements of Mercy","Insight, Medicine, and Herbalism Kit."],[6,"Physician's Touch","Harm poisons, Healing ends conditions."],[11,"Flurry of Healing and Harm","Use Healing and Harm with Flurry for free."],[17,"Hand of Ultimate Mercy","Revive a creature dead under 24 hours, once per Long Rest."]],
  "Warrior of Shadow":[[3,"Shadow Arts","Cast Darkness for Focus and see through it. Darkvision 60 ft. Minor Illusion."],[6,"Shadow Step","Teleport 60 ft between Dim Light or Darkness with Advantage after."],[11,"Improved Shadow Step","Teleport anywhere visible, attack after."],[17,"Cloak of Shadows","Become Invisible in darkness for 1 minute, pass through objects."]],
  "Warrior of the Elements":[[3,"Elemental Attunement","Spend Focus for reach +10 ft and elemental damage."],[3,"Manipulate Elements","Elementalism cantrip."],[6,"Elemental Burst","Spend Focus: 20 ft sphere of elemental damage."],[11,"Stride of the Elements","Fly and swim Speed while attuned."],[17,"Elemental Epitome","Resistance and extra damage while attuned."]],
  "Warrior of the Open Hand":[[3,"Open Hand Technique","Flurry hits can Addle, Push 15 ft, or Topple."],[6,"Wholeness of Body","Bonus Action heal Martial Arts die + Wis."],[11,"Fleet Step","Step of the Wind after any Bonus Action."],[17,"Quivering Palm","Unarmed Strike hit, spend 4 Focus: start vibrations. End them with an action or one attack. Target CON save (DC 8 + PB + WIS). Fail: 10d12 Force. Success: half damage."]]}};

var OPTS={
 "Race Ability Mode":[["+2 and +1","One score rises by 2 and a different score by 1."],["+1, +1, +1","Three different scores rise by 1 each."]],
 "Divine Order":[["Protector","Training with Heavy armor and Martial weapons."],["Thaumaturge","One extra Cleric cantrip. Add Wis mod to Arcana and Religion checks."]],
 "Primal Order":[["Magician","One extra Druid cantrip. Add Wis mod to Arcana and Nature checks."],["Warden","Training with Martial weapons and Medium armor."]],
 "Blessed Strikes":[["Divine Strike","Once per turn, a weapon hit deals +1d8 Necrotic or Radiant."],["Potent Spellcasting","Add Wis mod to Cleric cantrip damage."]],
 "Elemental Fury":[["Potent Spellcasting","Add Wis mod to Druid cantrip damage."],["Primal Strike","Once per turn, a weapon or Beast form hit deals +1d8 Cold, Fire, Lightning, or Thunder."]],
 "Species Spellcasting Ability":[["Intelligence","Spells from your lineage or legacy use Intelligence."],["Wisdom","Spells from your lineage or legacy use Wisdom."],["Charisma","Spells from your lineage or legacy use Charisma."]]
};
var MANEUVERS=[["Ambush","If you roll Initiative or make a Dexterity (Stealth) check, you can expend one Superiority Die and add it to the roll, as long as you don't have the Incapacitated condition."],["Bait and Switch","During your turn, if a creature is within 5 feet of you, you can expend one Superiority Die and swap positions with it. This requires you to use at least 5 feet of your movement, and the creature has to be willing and free of the Incapacitated condition. This swap doesn't provoke Opportunity Attacks. Then roll the die. You or the other creature, whichever you pick, adds the number rolled to its Armor Class until your next turn starts."],["Commander's Strike","During your turn, as part of the Attack action, you can give up one of your attacks to direct a companion to strike. Choose a willing creature that can see or hear you, then expend one Superiority Die. Right away, that creature can use its Reaction to attack once, using a weapon or an Unarmed Strike, and on a hit it adds the Superiority Die to the attack's damage roll."],["Commanding Presence","Whenever you make a Charisma check using Intimidation, Performance, or Persuasion, you can expend one Superiority Die and add it to the roll."],["Disarming Attack","After your attack roll hits a creature, you can expend one Superiority Die in an attempt to disarm it. Add the die's roll to the attack's damage roll. The target makes a Strength saving throw against your maneuver save DC. On a failed save, it drops one object of your choice that it's holding, and the object falls into the target's space."],["Distracting Strike","After your attack roll hits a creature, you can expend one Superiority Die in an attempt to distract that creature. The die's roll is added to the attack's damage roll. If an attacker other than you makes an attack roll against the target before the start of your next turn, the first such attack roll has Advantage."],["Evasive Footwork","You can take a Bonus Action to expend one Superiority Die and take the Disengage action. Roll that die as well. Until the start of your next turn, your Armor Class gains a bonus equal to the number rolled."],["Feinting Attack","You can take a Bonus Action to expend one Superiority Die and feint, choosing as your target one creature within 5 feet of yourself. This turn, your next attack roll against that target has Advantage. If that attack hits, the Superiority Die is added to its damage roll."],["Goading Attack","After your attack roll hits a creature, you can expend one Superiority Die to try to goad the target into attacking you. Add the die to the attack's damage roll. The target makes a Wisdom saving throw against your maneuver save DC. On a failed save, until the end of your next turn, the target has Disadvantage on any attack roll against a target other than you."],["Lunging Attack","You can take a Bonus Action to expend one Superiority Die and take the Dash action. Then, during this turn, if you hit with a melee attack made as part of the Attack action right after moving 5 feet or more in a straight line, you can add the Superiority Die to that attack's damage roll."],["Maneuvering Attack","After your attack roll hits a creature, you can expend one Superiority Die to move one of your comrades into a new position. Add the die's roll to the attack's damage roll, then choose a willing creature that can see or hear you. That creature can spend its Reaction moving as far as half its Speed, and this movement doesn't provoke an Opportunity Attack from your attack's target."],["Menacing Attack","After your attack roll hits a creature, you can expend one Superiority Die in an attempt to frighten it. Add the die to the attack's damage roll. The target makes a Wisdom saving throw against your maneuver save DC. A target that fails gains the Frightened condition, which lasts until the end of your next turn."],["Parry","When a melee attack roll from another creature damages you, you can take a Reaction. Expend one Superiority Die, roll it, and reduce the damage by the number rolled plus your Strength or Dexterity modifier (your choice)."],["Precision Attack","If your attack roll misses, you can expend one Superiority Die, roll it, and add the number to that attack roll, which might turn the miss into a hit."],["Pushing Attack","After your attack roll with a weapon or an Unarmed Strike hits a creature, you can expend one Superiority Die in an attempt to drive that creature back. The die is also added to the attack's damage roll. A target that is Large or smaller makes a Strength saving throw against your maneuver save DC, and on a failed save you push it up to 15 feet in a straight line away from you."],["Rally","You can take a Bonus Action to expend one Superiority Die and bolster a companion's resolve. Choose one ally within 30 feet of you that can see or hear you. Roll the Superiority Die. The ally gains Temporary Hit Points equal to the number rolled plus half your Fighter level (round down)."],["Riposte","If a creature's melee attack roll misses you, you can expend one Superiority Die and take a Reaction to strike back, making a melee attack roll against that creature with a weapon or an Unarmed Strike. On a hit, add the Superiority Die to the attack's damage."],["Sweeping Attack","After you hit a creature with a weapon or an Unarmed Strike using a melee attack roll, you can expend one Superiority Die in an attempt to damage a second creature. Pick another creature that is within your reach and also within 5 feet of the original target. If the original attack roll would also hit the second creature, roll the Superiority Die, and that creature takes damage equal to the number rolled. The damage type matches the one dealt by the original attack."],["Tactical Assessment","You can expend one Superiority Die when you make an ability check of one of these kinds, adding the die to the check: Intelligence (History), Intelligence (Investigation), or Wisdom (Insight)."],["Trip Attack","After your attack roll with a weapon or an Unarmed Strike hits a creature, you can expend one Superiority Die and add it to the damage roll of that attack. A target that is Large or smaller makes a Strength saving throw against your maneuver save DC, and on a failed save it has the Prone condition."]];
/* M17: Unarmored Defense from data. ab: ability added to 10 + Dex, shield: a Shield keeps it, l: class level, n: feature name */
CLASSES.Barbarian.ua={ab:"CON",shield:1,l:1,n:"Unarmored Defense"};
CLASSES.Monk.ua={ab:"WIS",shield:0,l:1,n:"Unarmored Defense"};

/* v32 RL49: options of subclass features (PHB 2024, own words). Read through CLASSES.*.pickSub {k:"opt", list} */
OPTS["Hunter's Prey"]=[["Colossus Slayer","Once per turn, when your weapon hits a creature that is missing any of its Hit Points, it takes an extra 1d8 damage."],["Horde Breaker","Once per turn, after you make a weapon attack, make one more attack with the same weapon against a different creature within 5 feet of the first target and within range."]];
OPTS["Defensive Tactics"]=[["Escape the Horde","Opportunity Attacks against you have Disadvantage."],["Multiattack Defense","After a creature hits you with an attack roll, its other attack rolls against you this turn have Disadvantage."]];
OPTS["Primal Companion"]=[["Beast of the Land","A sturdy beast with a Climb Speed. Its Charge adds damage and can knock a target Prone."],["Beast of the Sea","A beast that breathes air and water and has a Swim Speed. Its Binding Strike can grapple or knock Prone."],["Beast of the Sky","A light beast with a Fly Speed and Flyby, so it leaves without provoking Opportunity Attacks."]];
OPTS["Iron Mind"]=[["Intelligence","Proficiency in Intelligence saving throws. You already have Wisdom."],["Charisma","Proficiency in Charisma saving throws. You already have Wisdom."]];
OPTS["Aspect of the Wilds"]=[["Owl","Darkvision 60 feet. With Darkvision already, its range grows by 60 feet."],["Panther","A Climb Speed equal to your Speed."],["Salmon","A Swim Speed equal to your Speed."]];
OPTS["Fiendish Resilience"]=["Acid","Bludgeoning","Cold","Fire","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder"].map(function(t){return [t,"Resistance to "+t+" damage. You can pick again after a Short or Long Rest."]});
OPTS["Land Type"]=[["Arid","Arid land spells (Blur, Burning Hands, Fire Bolt, and more). Nature's Ward: Fire."],["Polar","Polar land spells (Fog Cloud, Hold Person, Ray of Frost, and more). Nature's Ward: Cold."],["Temperate","Temperate land spells (Misty Step, Shocking Grasp, Sleep, and more). Nature's Ward: Lightning."],["Tropical","Tropical land spells (Acid Splash, Ray of Sickness, Web, and more). Nature's Ward: Poison."]];
CLASSES.Barbarian.pickSub={"Path of the Wild Heart":[{l:6,k:"opt",list:"Aspect of the Wilds",feature:"Aspect of the Wilds",yc:1}]};
CLASSES.Bard.pickSub={"College of Lore":[{l:3,k:"skill",n:3,from:"all",feature:"Bonus Proficiencies",title:"Bonus Proficiencies: 3 skills"},{l:6,k:"spells",key:"p6disc",n:2,lists:["Cleric","Druid","Wizard"],feature:"Magical Discoveries",title:"Magical Discoveries: 2 spells",yc:1}]};
CLASSES.Bard.xlists={l:10,lists:["Cleric","Druid","Wizard"]};/* Magical Secrets: prepare spells from these lists too */
CLASSES.Druid.pickSub={"Circle of the Land":[{l:3,k:"opt",list:"Land Type",key:"land",feature:"Circle of the Land Spells",yc:1}]};
CLASSES.Fighter.pickSub["Battle Master"].push({l:3,k:"skill",n:1,feature:"Student of War",title:"Student of War: skill"},{l:3,k:"tool",n:1,cats:["art"],feature:"Student of War",title:"Student of War: Artisan's Tools"});

/* v32: Eldritch Knight War Bond, up to two bonded weapons (optional choice) */
(CLASSES.Fighter.pickSub["Eldritch Knight"]=CLASSES.Fighter.pickSub["Eldritch Knight"]||[]).push({l:3,k:"bond",n:2,feature:"War Bond",title:"War Bond: up to 2 bonded weapons",yc:1});
