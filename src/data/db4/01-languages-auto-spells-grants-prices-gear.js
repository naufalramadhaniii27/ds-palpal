
/* PHB 2024 database, part 4: rule tables used by Logic and the builder UI (M17: moved here from logic.js, auto.js, mc.js, calc.js, ui.js).
   Global scope like db1 to db3. No calculation here. */
/* languages: [name, kind] */
var LANGS=[["Common Sign Language","Standard"],["Draconic","Standard"],["Dwarvish","Standard"],["Elvish","Standard"],["Giant","Standard"],["Gnomish","Standard"],["Goblin","Standard"],["Halfling","Standard"],["Orc","Standard"],["Abyssal","Rare, ask your DM"],["Celestial","Rare, ask your DM"],["Deep Speech","Rare, ask your DM"],["Druidic","Rare, ask your DM"],["Infernal","Rare, ask your DM"],["Primordial","Rare, ask your DM"],["Sylvan","Rare, ask your DM"],["Thieves' Cant","Rare, ask your DM"],["Undercommon","Rare, ask your DM"]];
/* always-prepared spells: [level, "a,b"]. AUTO by subclass, LAND by Circle of the Land type, CLS_AUTO by class, SP_AUTO by species and lineage prefix */
var AUTO={
"Life Domain":[[3,"Aid,Bless,Cure Wounds,Lesser Restoration"],[5,"Mass Healing Word,Revivify"],[7,"Aura of Life,Death Ward"],[9,"Greater Restoration,Mass Cure Wounds"]],
"Light Domain":[[3,"Burning Hands,Faerie Fire,Scorching Ray,See Invisibility"],[5,"Daylight,Fireball"],[7,"Arcane Eye,Wall of Fire"],[9,"Flame Strike,Scrying"]],
"Trickery Domain":[[3,"Charm Person,Disguise Self,Invisibility,Pass without Trace"],[5,"Hypnotic Pattern,Nondetection"],[7,"Confusion,Dimension Door"],[9,"Dominate Person,Modify Memory"]],
"War Domain":[[3,"Guiding Bolt,Magic Weapon,Shield of Faith,Spiritual Weapon"],[5,"Crusader's Mantle,Spirit Guardians"],[7,"Fire Shield,Freedom of Movement"],[9,"Hold Monster,Steel Wind Strike"]],
"Oath of Devotion":[[3,"Protection from Evil and Good,Shield of Faith"],[5,"Aid,Zone of Truth"],[9,"Beacon of Hope,Dispel Magic"],[13,"Freedom of Movement,Guardian of Faith"],[17,"Commune,Flame Strike"]],
"Oath of Glory":[[3,"Guiding Bolt,Heroism"],[5,"Enhance Ability,Magic Weapon"],[9,"Haste,Protection from Energy"],[13,"Compulsion,Freedom of Movement"],[17,"Legend Lore,Yolande's Regal Presence"]],
"Oath of the Ancients":[[3,"Ensnaring Strike,Speak with Animals"],[5,"Misty Step,Moonbeam"],[9,"Plant Growth,Protection from Energy"],[13,"Ice Storm,Stoneskin"],[17,"Commune with Nature,Tree Stride"]],
"Oath of Vengeance":[[3,"Bane,Hunter's Mark"],[5,"Hold Person,Misty Step"],[9,"Haste,Protection from Energy"],[13,"Banishment,Dimension Door"],[17,"Hold Monster,Scrying"]],
"Archfey Patron":[[3,"Calm Emotions,Faerie Fire,Misty Step,Phantasmal Force,Sleep"],[5,"Blink,Plant Growth"],[7,"Dominate Beast,Greater Invisibility"],[9,"Dominate Person,Seeming"]],
"Celestial Patron":[[3,"Aid,Cure Wounds,Guiding Bolt,Lesser Restoration,Light,Sacred Flame"],[5,"Daylight,Revivify"],[7,"Guardian of Faith,Wall of Fire"],[9,"Greater Restoration,Summon Celestial"]],
"Fiend Patron":[[3,"Burning Hands,Command,Scorching Ray,Suggestion"],[5,"Fireball,Stinking Cloud"],[7,"Fire Shield,Wall of Fire"],[9,"Geas,Insect Plague"]],
"Great Old One Patron":[[3,"Detect Thoughts,Dissonant Whispers,Phantasmal Force,Tasha's Hideous Laughter"],[5,"Clairvoyance,Hunger of Hadar"],[7,"Confusion,Summon Aberration"],[9,"Modify Memory,Telekinesis"]],
"Aberrant Sorcery":[[3,"Arms of Hadar,Calm Emotions,Detect Thoughts,Dissonant Whispers,Mind Sliver"],[5,"Hunger of Hadar,Sending"],[7,"Evard's Black Tentacles,Summon Aberration"],[9,"Rary's Telepathic Bond,Telekinesis"]],
"Clockwork Sorcery":[[3,"Aid,Alarm,Lesser Restoration,Protection from Evil and Good"],[5,"Dispel Magic,Protection from Energy"],[7,"Freedom of Movement,Summon Construct"],[9,"Greater Restoration,Wall of Force"]],
"Draconic Sorcery":[[3,"Alter Self,Chromatic Orb,Command,Dragon's Breath"],[5,"Fear,Fly"],[7,"Arcane Eye,Charm Monster"],[9,"Legend Lore,Summon Dragon"]],
"Circle of the Moon":[[3,"Cure Wounds,Moonbeam,Starry Wisp"],[5,"Conjure Animals"],[7,"Fount of Moonlight"],[9,"Mass Cure Wounds"]],
"Circle of the Sea":[[3,"Fog Cloud,Gust of Wind,Ray of Frost,Shatter,Thunderwave"],[5,"Lightning Bolt,Water Breathing"],[7,"Control Water,Ice Storm"],[9,"Conjure Elemental,Hold Monster"]],
"Circle of the Stars":[[3,"Guidance,Guiding Bolt"]],
"Fey Wanderer":[[3,"Charm Person"],[5,"Misty Step"],[9,"Summon Fey"],[13,"Dimension Door"],[17,"Mislead"]],
"Gloom Stalker":[[3,"Disguise Self"],[5,"Rope Trick"],[9,"Fear"],[13,"Greater Invisibility"],[17,"Seeming"]]};
var LAND={Arid:[[3,"Blur,Burning Hands,Fire Bolt"],[5,"Fireball"],[7,"Blight"],[9,"Wall of Stone"]],Polar:[[3,"Fog Cloud,Hold Person,Ray of Frost"],[5,"Sleet Storm"],[7,"Ice Storm"],[9,"Cone of Cold"]],Temperate:[[3,"Misty Step,Shocking Grasp,Sleep"],[5,"Lightning Bolt"],[7,"Freedom of Movement"],[9,"Tree Stride"]],Tropical:[[3,"Acid Splash,Ray of Sickness,Web"],[5,"Stinking Cloud"],[7,"Polymorph"],[9,"Insect Plague"]]};
var CLS_AUTO={Paladin:[[2,"Divine Smite"],[5,"Find Steed"]],Ranger:[[1,"Hunter's Mark"]],Druid:[[1,"Speak with Animals"]],Bard:[[20,"Power Word Heal,Power Word Kill"]]};
var SP_AUTO={Aasimar:{"":[[1,"Light"]]},Elf:{Drow:[[1,"Dancing Lights"],[3,"Faerie Fire"],[5,"Darkness"]],High:[[1,"Prestidigitation"],[3,"Detect Magic"],[5,"Misty Step"]],Wood:[[1,"Druidcraft"],[3,"Longstrider"],[5,"Pass without Trace"]]},
 Gnome:{Forest:[[1,"Minor Illusion,Speak with Animals"]],Rock:[[1,"Mending,Prestidigitation"]]},
 Tiefling:{Abyssal:[[1,"Thaumaturgy,Poison Spray"],[3,"Ray of Sickness"],[5,"Hold Person"]],Chthonic:[[1,"Thaumaturgy,Chill Touch"],[3,"False Life"],[5,"Ray of Enfeeblement"]],Infernal:[[1,"Thaumaturgy,Fire Bolt"],[3,"Hellish Rebuke"],[5,"Darkness"]]}};
/* multiclass grants and prerequisites, prices (GP), gear [name, GP, lb], item texts, rarity by +N, potions, Spell Scroll table [level, rarity, DC, attack] */
var MC_GRANT={Barbarian:{armor:"Shields",weapons:"Martial"},Bard:{armor:"Light",sk:1,skFrom:"any",tools:"One Musical Instrument",toolPick:{n:1,cats:["music"]}/* v32 RL49 */},Cleric:{armor:"Light, Medium, Shields"},Druid:{armor:"Light, Shields"},Fighter:{armor:"Light, Medium, Shields",weapons:"Martial"},Monk:{},Paladin:{armor:"Light, Medium, Shields",weapons:"Martial"},Ranger:{armor:"Light, Medium, Shields",weapons:"Martial",sk:1},Rogue:{armor:"Light",sk:1,tools:"Thieves' Tools"},Sorcerer:{},Warlock:{armor:"Light"},Wizard:{}};
var MC_REQ={Barbarian:[["STR"]],Bard:[["CHA"]],Cleric:[["WIS"]],Druid:[["WIS"]],Fighter:[["STR","DEX"]],Monk:[["DEX"],["WIS"]],Paladin:[["STR"],["CHA"]],Ranger:[["DEX"],["WIS"]],Rogue:[["DEX"]],Sorcerer:[["CHA"]],Warlock:[["CHA"]],Wizard:[["INT"]]};
var PRICE={"Padded Armor":5,"Leather Armor":10,"Studded Leather Armor":45,"Hide Armor":10,"Chain Shirt":50,"Scale Mail":50,"Breastplate":400,"Half Plate Armor":750,"Ring Mail":30,"Chain Mail":75,"Splint Armor":200,"Plate Armor":1500,"Shield":10,
 "Club":0.1,"Dagger":2,"Greatclub":0.2,"Handaxe":5,"Javelin":0.5,"Light Hammer":2,"Mace":5,"Quarterstaff":0.2,"Sickle":1,"Spear":1,"Dart":0.05,"Light Crossbow":25,"Shortbow":25,"Sling":0.1,"Battleaxe":10,"Flail":10,"Glaive":20,"Greataxe":30,"Greatsword":50,"Halberd":20,"Lance":10,"Longsword":15,"Maul":10,"Morningstar":15,"Pike":5,"Rapier":25,"Scimitar":25,"Shortsword":10,"Trident":5,"Warhammer":15,"War Pick":5,"Whip":2,"Blowgun":10,"Hand Crossbow":75,"Heavy Crossbow":50,"Longbow":50,"Musket":500,"Pistol":250};
var GEAR=[["Arrows (20)",1,1],["Bolts (20)",1,1.5],["Quiver",1,1],["Backpack",2,5],["Pouch",0.5,1],["Sack",0.01,0.5],["Basket",0.4,2],["Barrel",2,70],["Chest",5,25],["Case, Map or Scroll",1,1],["Case, Crossbow Bolt",1,1],/* V17-6 PHB 2024 gear table */["Bedroll",1,7],["Crowbar",2,5],["Healer's Kit",5,3],["Holy Symbol",5,1],["Arcane Focus",10,1],["Druidic Focus",1,1],["Component Pouch",25,2],["Spellbook",50,3],["Rope",1,5],["Rations (1 day)",0.5,2],["Torch",0.01,1],["Tinderbox",0.5,1],["Waterskin",0.2,5],["Lantern, Hooded",5,2],["Oil (flask)",0.1,1],["Ball Bearings",1,2],["Caltrops",1,2],["Manacles",2,6],["Potion of Healing",50,0.5],["Thieves' Tools",25,1],["Traveler's Clothes",2,4],["Fine Clothes",15,6],["Explorer's Pack",10,55],["Dungeoneer's Pack",12,55],["Burglar's Pack",16,42],["Priest's Pack",33,29],["Scholar's Pack",40,22],["Entertainer's Pack",40,58.5],["Diplomat's Pack",39,39],["Bagpipes",30,6],["Drum",6,3],["Dulcimer",25,10],["Flute",2,1],["Horn",3,2],["Lute",35,2],["Lyre",30,2],["Pan Flute",12,2],["Shawm",2,1],["Viol",30,1]/* v22 S1: Musical Instruments, PHB 2024 */,/* v27 RD26: the rest of the Adventuring Gear table, PHB 2024 */["Acid", 25, 1],["Alchemist's Fire", 50, 1],["Antitoxin", 50, 0],["Bell", 1, 0],["Blanket", 0.5, 3],["Block and Tackle", 1, 5],["Book", 25, 5],["Bottle, Glass", 2, 2],["Bucket", 0.05, 2],["Candle", 0.01, 0],["Chain", 5, 10],["Climber's Kit", 25, 12],["Costume", 5, 4],["Flask", 0.02, 1],["Grappling Hook", 2, 4],["Holy Water", 25, 1],["Hunting Trap", 5, 25],["Ink", 10, 0],["Ink Pen", 0.02, 0],["Jug", 0.02, 4],["Ladder", 0.1, 25],["Lamp", 0.5, 1],["Lantern, Bullseye", 10, 2],["Lock", 10, 1],["Magnifying Glass", 100, 0],["Map", 1, 0],["Mirror", 5, 0.5],["Net", 1, 3],["Paper", 0.2, 0],["Parchment", 0.1, 0],["Perfume", 5, 0],["Poison, Basic", 100, 0],["Pole", 0.05, 7],["Pot, Iron", 2, 10],["Ram, Portable", 4, 35],["Robe", 1, 4],["Shovel", 2, 5],["Signal Whistle", 0.05, 0],["Spikes, Iron", 1, 5],["Spyglass", 1000, 1],["String", 0.1, 0],["Tent", 2, 20],["Vial", 1, 0],["Bullets, Firearm (10)", 3, 2],["Bullets, Sling (20)", 0.04, 1.5],["Needles (50)", 1, 1]];
/* v47: PHB 2024 chapter 6, Mounts and Vehicles. Cost in GP, weight in lb. An animal has no carried weight. */
GEAR.push(["Camel",50,0],["Elephant",200,0],["Horse, Draft",50,0],["Horse, Riding",75,0],["Mastiff",25,0],["Mule",8,0],["Pony",30,0],["Warhorse",400,0],
["Saddle, Exotic",60,40],["Saddle, Military",20,30],["Saddle, Riding",10,25],["Feed (1 day)",0.05,10],["Stabling (1 day)",0.5,0],
["Carriage",100,600],["Cart",15,200],["Chariot",250,100],["Sled",20,300],["Wagon",35,400],
["Airship",40000,0],["Galley",30000,0],["Keelboat",3000,0],["Longship",10000,0],["Rowboat",50,100],["Sailing Ship",10000,0],["Warship",25000,0]);
/* v48: DMG 2024 chapter 3, Explosives, Energy Cell, Poison. Cost in GP (null: not sold), weight in lb */
GEAR.push(["Bomb",100,1],["Dynamite Stick",null,1],["Grenade, Fragmentation",null,1],["Grenade Launcher",null,7],["Grenade, Smoke",50,2],["Gunpowder (keg)",250,20],["Gunpowder (powder horn)",35,2],["Energy Cell",null,0.5],
["Assassin's Blood",150,0],["Burnt Othur Fumes",500,0],["Carrion Crawler Mucus",200,0],["Essence of Ether",300,0],["Lolth's Sting",200,0],["Malice",250,0],["Midnight Tears",1500,0],["Oil of Taggit",400,0],["Pale Tincture",250,0],["Purple Worm Poison",2000,0],["Serpent Venom",200,0],["Torpor",600,0],["Truth Serum",150,0],["Wyvern Poison",1200,0]);
var MOUNTT={"Bomb":"Explosive","Dynamite Stick":"Explosive","Grenade, Fragmentation":"Explosive","Grenade Launcher":"Explosive","Grenade, Smoke":"Explosive","Gunpowder (keg)":"Explosive","Gunpowder (powder horn)":"Explosive","Energy Cell":"Ammunition",
"Assassin's Blood":"Poison (Ingested)","Burnt Othur Fumes":"Poison (Inhaled)","Carrion Crawler Mucus":"Poison (Contact)","Essence of Ether":"Poison (Inhaled)","Lolth's Sting":"Poison (Injury)","Malice":"Poison (Inhaled)","Midnight Tears":"Poison (Ingested)","Oil of Taggit":"Poison (Contact)","Pale Tincture":"Poison (Ingested)","Purple Worm Poison":"Poison (Injury)","Serpent Venom":"Poison (Injury)","Torpor":"Poison (Ingested)","Truth Serum":"Poison (Ingested)","Wyvern Poison":"Poison (Injury)",
"Camel":"Mount","Elephant":"Mount","Horse, Draft":"Mount","Horse, Riding":"Mount","Mastiff":"Mount","Mule":"Mount","Pony":"Mount","Warhorse":"Mount",
"Saddle, Exotic":"Tack and Harness","Saddle, Military":"Tack and Harness","Saddle, Riding":"Tack and Harness","Feed (1 day)":"Tack and Harness","Stabling (1 day)":"Tack and Harness",
"Carriage":"Drawn Vehicle","Cart":"Drawn Vehicle","Chariot":"Drawn Vehicle","Sled":"Drawn Vehicle","Wagon":"Drawn Vehicle",
"Airship":"Airborne Vehicle","Galley":"Waterborne Vehicle","Keelboat":"Waterborne Vehicle","Longship":"Waterborne Vehicle","Rowboat":"Waterborne Vehicle","Sailing Ship":"Waterborne Vehicle","Warship":"Waterborne Vehicle"};
var ITEMDESC={
"Bomb":"As an action, light it and throw it up to 60 feet. Each creature in a 5-foot-radius Sphere makes a DC 12 Dexterity save, taking 3d6 Fire damage on a failure or half on a success. If sold, treat it as a Rare magic item.",
"Dynamite Stick":"As an action, light it and throw it up to 60 feet. Each creature in a 5-foot-radius Sphere makes a DC 12 Dexterity save, taking 5d6 Force damage on a failure or half on a success. Binding sticks together takes 1 minute. Each extra stick adds 1d6 damage (up to 10d6) and 5 feet of radius (up to 20 feet). Rigging a longer fuse takes 1 minute.",
"Grenade, Fragmentation":"As an action, throw it up to 60 feet, or fire it from a Grenade Launcher up to 1,000 feet. It bursts in a 20-foot-radius Sphere. Each creature there makes a DC 15 Dexterity save, taking 17 (5d6) Piercing damage on a failure or half on a success.",
"Grenade Launcher":"Fires a grenade as an action to a point up to 1,000 feet away.",
"Grenade, Smoke":"As an action, throw it up to 60 feet, or fire it from a Grenade Launcher up to 1,000 feet. A 20-foot-radius Sphere becomes Heavily Obscured for 1 minute. Strong wind, such as Gust of Wind, clears it.",
"Gunpowder (keg)":"Fire sets off the whole container. Each creature in a 10-foot-radius Sphere makes a DC 12 Dexterity save, taking 24 (7d6) Fire damage on a failure or half on a success.",
"Gunpowder (powder horn)":"Fire sets off the whole container. Each creature in a 10-foot-radius Sphere makes a DC 12 Dexterity save, taking 10 (3d6) Fire damage on a failure or half on a success.",
"Energy Cell":"Ammunition for futuristic firearms. It is used up when it runs dry, and you decide whether special gear can recharge it.",
"Assassin's Blood":"Ingested. DC 10 Constitution save. On a failure: 6 (1d12) Poison damage and Poisoned for 24 hours. On a success: half damage only.",
"Burnt Othur Fumes":"Inhaled. DC 13 Constitution save or 10 (3d6) Poison damage. The target repeats the save at the start of each of its turns and takes 3 (1d6) Poison damage on each failure. Three successes end it.",
"Carrion Crawler Mucus":"Contact. DC 13 Constitution save or Poisoned for 1 minute, and also Paralyzed while Poisoned this way. The target repeats the save at the end of each of its turns, ending the effect on a success.",
"Essence of Ether":"Inhaled. DC 15 Constitution save or Poisoned for 8 hours, and also Unconscious while Poisoned this way. It wakes if it takes damage or another creature uses an action to shake it awake.",
"Lolth's Sting":"Injury. DC 13 Constitution save or Poisoned for 1 hour. If the save fails by 5 or more, the target is also Unconscious while Poisoned this way. It wakes if it takes damage or another creature uses an action to shake it awake.",
"Malice":"Inhaled. DC 15 Constitution save or Poisoned for 1 hour, and also Blinded while Poisoned this way.",
"Midnight Tears":"Ingested. No effect until midnight. Anything that ends the Poisoned condition neutralizes it first. At midnight, DC 17 Constitution save: 31 (9d6) Poison damage on a failure or half on a success.",
"Oil of Taggit":"Contact. DC 13 Constitution save or Poisoned for 24 hours, and also Unconscious while Poisoned this way. It wakes if it takes damage.",
"Pale Tincture":"Ingested. DC 16 Constitution save or 3 (1d6) Poison damage and Poisoned. The target repeats the save every 24 hours, taking 3 (1d6) Poison damage on each failure. That damage can't be healed while Poisoned. Seven successes end it.",
"Purple Worm Poison":"Injury. DC 21 Constitution save, taking 35 (10d6) Poison damage on a failure or half on a success.",
"Serpent Venom":"Injury. DC 11 Constitution save, taking 10 (3d6) Poison damage on a failure or half on a success.",
"Torpor":"Ingested. DC 15 Constitution save or Poisoned for 4d6 hours. Its Speed is halved while Poisoned this way.",
"Truth Serum":"Ingested. DC 11 Constitution save or Poisoned for 1 hour. While Poisoned this way, the target can't knowingly tell a lie.",
"Wyvern Poison":"Injury. DC 14 Constitution save, taking 24 (7d6) Poison damage on a failure or half on a success.",
"Camel":"A mount that carries up to 450 lb. Its stat block is in appendix B.",
"Elephant":"A mount that carries up to 1,320 lb. Its stat block is in appendix B.",
"Horse, Draft":"A mount that carries up to 540 lb. Built to pull a heavy load. Its stat block is in appendix B.",
"Horse, Riding":"A mount that carries up to 480 lb. Its stat block is in appendix B. Barding for any mount costs 4 times the armor's price and weighs twice as much.",
"Mastiff":"A mount that carries up to 195 lb. Its stat block is in appendix B.",
"Mule":"A mount that carries up to 420 lb. Its stat block is in appendix B.",
"Pony":"A mount that carries up to 225 lb. Its stat block is in appendix B.",
"Warhorse":"A mount that carries up to 540 lb. Its stat block is in appendix B. Barding for any mount costs 4 times the armor's price and weighs twice as much.",
"Saddle, Exotic":"Needed to ride an aquatic or a flying mount. It comes with a bit, a bridle, reins, and the other gear the saddle needs.",
"Saddle, Military":"Gives you Advantage on any ability check to stay on your mount. It comes with a bit, a bridle, reins, and the other gear the saddle needs.",
"Saddle, Riding":"A basic saddle. It comes with a bit, a bridle, reins, and the other gear the saddle needs.",
"Feed (1 day)":"One day of food for a mount or a pulling animal.",
"Stabling (1 day)":"One day of housing and care for an animal.",
"Carriage":"A covered, wheeled vehicle pulled by animals.",
"Cart":"A two-wheeled vehicle pulled by animals.",
"Chariot":"A light, fast vehicle pulled by animals.",
"Sled":"Slides over snow and ice behind pulling animals.",
"Wagon":"A four-wheeled vehicle pulled by animals.",
"Airship":"Speed 8 mph. Crew 10. Passengers 20. Cargo 1 ton. AC 13. HP 300. Cost 40,000 GP.",
"Galley":"Speed 4 mph. Crew 80. Cargo 150 tons. AC 15. HP 500. Damage Threshold 20. Cost 30,000 GP.",
"Keelboat":"Speed 1 mph. Crew 1. Passengers 6. Cargo 1/2 ton. AC 15. HP 100. Damage Threshold 10. Cost 3,000 GP. Made for lakes and rivers.",
"Longship":"Speed 3 mph. Crew 40. Passengers 150. Cargo 10 tons. AC 15. HP 300. Damage Threshold 15. Cost 10,000 GP.",
"Rowboat":"Speed 1.5 mph. Crew 1. Passengers 3. AC 11. HP 50. Cost 50 GP. Made for lakes and rivers. Two people can carry it.",
"Sailing Ship":"Speed 2 mph. Crew 20. Passengers 20. Cargo 100 tons. AC 15. HP 300. Damage Threshold 15. Cost 10,000 GP.",
"Warship":"Speed 2.5 mph. Crew 60. Passengers 60. Cargo 200 tons. AC 15. HP 500. Damage Threshold 20. Cost 25,000 GP.",
"Pouch":"A small cloth or leather bag. Holds up to 6 pounds of gear in one-fifth of a cubic foot.","Sack":"A cloth sack. Holds up to 30 pounds of gear in 1 cubic foot.","Basket":"A woven basket. Holds up to 40 pounds of gear in 2 cubic feet.","Barrel":"A wooden barrel. It fits 4 cubic feet of dry goods, or 40 gallons of liquid.","Chest":"A wooden chest. Holds up to 12 cubic feet of contents.","Case, Map or Scroll":"A tube for rolled documents: up to 10 paper sheets or 5 parchment sheets.","Case, Crossbow Bolt":"A case that holds up to 20 Bolts.",
"Padded Armor":"Quilted layers of cloth and batting. Cheap and light, but noisy when you move.",
"Leather Armor":"A breastplate and shoulder guards of leather stiffened in oil, with softer leather for the rest.",
"Studded Leather Armor":"Tough leather reinforced with close-set rivets or spikes. The best protection among light armors.",
"Hide Armor":"Thick furs and pelts. Common among tribes and anyone without access to better tools.",
"Chain Shirt":"Interlocking metal rings worn between layers of clothing. Quiet enough to wear under a cloak.",
"Scale Mail":"A coat and leggings of leather covered with overlapping metal pieces, like fish scales.",
"Breastplate":"A fitted metal chest piece over supple leather. Leaves arms and legs fairly free and makes no extra noise.",
"Half Plate Armor":"Shaped metal plates over most of the body, without leg protection beyond simple greaves.",
"Ring Mail":"Leather armor with heavy rings sewn into it. Weaker than chain mail, and usually worn by those who can't afford better.",
"Chain Mail":"Interlocking metal rings with a layer of quilted fabric underneath to cushion blows. Includes gauntlets.",
"Splint Armor":"Narrow vertical strips of metal riveted to a leather backing, worn over cloth padding. Flexible joints are covered by chain mail.",
"Plate Armor":"Shaped, interlocking metal plates that cover the entire body, with gauntlets, boots, and a visored helmet.",
"Shield":"Held in one hand. While you carry it and have training with Shields, it adds 2 to your Armor Class. You can benefit from only one Shield at a time.",
"Arrows (20)":"Ammunition for bows. After a fight, you can spend a minute to recover half the ammunition you used.",
"Bolts (20)":"Ammunition for crossbows. After a fight, you can spend a minute to recover half the ammunition you used.",
"Quiver":"Holds up to 20 arrows or bolts.",
"Backpack":"Holds up to 30 pounds of gear in about 1 cubic foot.",
"Bedroll":"Sleeping in light or medium armor for a Long Rest is easier with one. Gives Advantage on saves against extreme cold while you sleep in it.",
"Crowbar":"Gives Advantage on Strength checks where a crowbar's leverage helps, such as prying open a door.",
"Healer's Kit":"Has 10 uses. As a Utilize action, spend one use to stabilize an Unconscious creature at 0 Hit Points without a Medicine check.",
"Holy Symbol":"A Cleric or Paladin can use it as a spellcasting focus. It must be held or worn visibly.",
"Arcane Focus":"An orb, crystal, rod, staff, or wand. A Sorcerer, Warlock, or Wizard can use it as a spellcasting focus.",
"Druidic Focus":"A sprig of mistletoe, yew wand, or wooden staff. A Druid or Ranger can use it as a spellcasting focus.",
"Component Pouch":"Holds the free Material components your spells need. Can replace components that have no cost listed.",
"Spellbook":"A Wizard's 100-page book of spells. Losing it is a serious problem.",
"Rope":"50 feet of hempen rope. You can tie a knot with a Utilize action; a DC 10 Sleight of Hand check ties a secure one.",
"Rations (1 day)":"Dried food that keeps you fed for a day.",
"Torch":"Burns for 1 hour. It gives Bright Light out to 20 feet and Dim Light for another 20 feet beyond that. Can be used as a makeshift weapon dealing 1 Fire damage.",
"Tinderbox":"Flint, fire steel, and tinder. Lights a torch or similar fuel as a Bonus Action, or other fires in 1 minute.",
"Waterskin":"Holds 4 pints of liquid.",
"Lantern, Hooded":"Burns oil for 6 hours, shedding light in a 30-foot radius. Lowering the hood reduces it to Dim Light in a 5-foot radius.",
"Oil (flask)":"Fuel for lanterns. Can be thrown to coat an area; if lit, it burns creatures standing in it.",
"Ball Bearings":"Spill them to cover a 10-foot square. A creature moving through it makes a DC 10 Dexterity saving throw and falls Prone if it fails.",
"Caltrops":"Scatter them over a 5-foot square. A creature entering it makes a DC 15 Dexterity saving throw. If it fails, it takes 1 Piercing damage and its Speed drops to 0 until its next turn starts.",
"Manacles":"Bind a Small or Medium creature. Escaping requires a DC 20 Sleight of Hand check; breaking them a DC 25 Strength check.",
"Potion of Healing":"Drink it (Bonus Action) or give it to someone (Action) to regain 2d4 + 2 Hit Points.",
"Thieves' Tools":"Lock picks and small tools. Used to pick locks and disarm traps.",
"Traveler's Clothes":"Sturdy clothes for the road.",
"Fine Clothes":"Expensive clothes for nobles and formal events.",
"Explorer's Pack":"A backpack holding a bedroll, a tinderbox, rope, a waterskin, 10 torches, 2 flasks of oil, and 10 days of rations.",
"Dungeoneer's Pack":"A backpack holding caltrops, a crowbar, a tinderbox, rope, a waterskin, 10 torches, 2 flasks of oil, and 10 days of rations.",
"Burglar's Pack":"A backpack holding ball bearings, a bell, a crowbar, a hooded lantern, a tinderbox, rope, a waterskin, 10 candles, 7 flasks of oil, and 5 days of rations.",
"Priest's Pack":"A backpack holding a blanket, a lamp, a robe, a tinderbox, holy water, and 7 days of rations.",
"Scholar's Pack":"A backpack holding a book, a lamp, a tinderbox, ink, an ink pen, 10 sheets of parchment, and 10 flasks of oil.",
"Entertainer's Pack":"A backpack holding a bedroll, a bell, a bullseye lantern, a mirror, a tinderbox, a waterskin, 3 costumes, 8 flasks of oil, and 9 days of rations.",
"Diplomat's Pack":"A chest holding fine clothes, a lamp, perfume, a tinderbox, ink, an ink pen, 2 map or scroll cases, 5 sheets of paper, and 4 flasks of oil."};
var ARMOR_RULE={Light:"Light armor: takes 1 minute to put on and 1 minute to take off.",Medium:"Medium armor: takes 5 minutes to put on and 1 minute to take off. You add at most +2 from Dexterity to AC.",Heavy:"Heavy armor: takes 10 minutes to put on and 5 minutes to take off. Dexterity doesn't add to your AC."};
var ARMOR_GEN="Without training in this armor, you have Disadvantage on any D20 Test that uses Strength or Dexterity, and you can't cast spells.";
var RAR_W={1:"Uncommon",2:"Rare",3:"Very Rare"},RAR_A={1:"Rare",2:"Very Rare",3:"Legendary"},RAR_S={1:"Uncommon",2:"Rare",3:"Very Rare"};
var POTIONS=[["Potion of Healing","Common","Regain 2d4 + 2 Hit Points.",50],["Potion of Healing (Greater)","Uncommon","Regain 4d4 + 4 Hit Points.",null],["Potion of Healing (Superior)","Rare","Regain 8d4 + 8 Hit Points.",null],["Potion of Healing (Supreme)","Very Rare","Regain 10d4 + 20 Hit Points.",null]];
var SCROLL_T=[[0,"Common",13,5],[1,"Common",13,5],[2,"Uncommon",13,5],[3,"Uncommon",15,7],[4,"Rare",15,7],[5,"Rare",17,9],[6,"Very Rare",17,9],[7,"Very Rare",18,10],[8,"Very Rare",18,10],[9,"Legendary",19,11]];
/* species defenses: [type, value] */
var DEF_SP={"Duergar":[["Resistance","Poison"]],"Air Genasi":[["Resistance","Lightning"]],"Fire Genasi":[["Resistance","Fire"]],"Water Genasi":[["Resistance","Acid"]],"Githyanki":[["Resistance","Psychic"]],"Githzerai":[["Resistance","Psychic"]],"Sea Elf":[["Resistance","Cold"]],"Shadar-kai":[["Resistance","Necrotic"]],"Triton":[["Resistance","Cold"]],"Yuan-ti":[["Resistance","Poison"]],Dwarf:[["Resistance","Poison"]],Aasimar:[["Resistance","Necrotic"],["Resistance","Radiant"]]};
/* cantrips known [base, +1 at level, +1 at level], prepared spells by level, third casters (Eldritch Knight, Arcane Trickster) from level 3, standard array and point-buy cost */
var CANT={Bard:[2,4,10],Cleric:[3,4,10],Druid:[2,4,10],Sorcerer:[4,4,10],Warlock:[2,4,10],Wizard:[3,4,10]};
var PREP={Bard:[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],Sorcerer:[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],Wizard:[4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25],Warlock:[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],Paladin:[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15]};
PREP.Cleric=PREP.Druid=PREP.Bard;PREP.Ranger=PREP.Paladin;
/* v92: spells of a class in the 2014 rules. A known caster has a fixed list (kn), a preparing caster prepares ability modifier + level (Paladin and Artificer: half the level). m: modifier of the casting ability */
var KN14={Bard:[4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22],Sorcerer:[2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15],Warlock:[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],Ranger:[0,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11]};
function pr14(cls,L,m){if(KN14[cls])return {pr:KN14[cls][L-1],kn:1};if(cls==="Cleric"||cls==="Druid"||cls==="Wizard")return {pr:Math.max(1,m+L),kn:0};if(cls==="Paladin")return {pr:L<2?0:Math.max(1,m+Math.floor(L/2)),kn:0};if(cls==="Artificer")return {pr:Math.max(1,m+Math.floor(L/2)),kn:0};return null}
function spKn(cls,sub,rs){return rs==="2014"&&(!!KN14[cls]||(cls==="Fighter"&&sub==="Eldritch Knight (2014)")||(cls==="Rogue"&&sub==="Arcane Trickster (2014)"))}
var THIRD=[3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
var ARR=[15,14,13,12,10,8],PBC={8:0,9:1,10:2,11:3,12:4,13:5,14:7,15:9};
/* Eldritch Invocations that let you cast a spell at will: invocation -> spell */
var INV_SPELLS={"Pact of the Chain":"Find Familiar","Armor of Shadows":"Mage Armor","Ascendant Step":"Levitate","Fiendish Vigor":"False Life","Mask of Many Faces":"Disguise Self","Master of Myriad Forms":"Alter Self","Misty Visions":"Silent Image","Otherworldly Leap":"Jump","Visions of Distant Realms":"Arcane Eye","Whispers of the Grave":"Speak with Dead"};
