/* fx data batch L2 (ledger bin 2, shards 04 05 06): item verdicts MISS, MISS_TOGGLE and MISMATCH from the cross audit (ledger/out/shard-04..06.json).
   Every effect below was re-read in the item text before it was written. Schema: SOURCE-NOTES.md, "fx schema", "fx engine v3b", "fx engine v4", "fx batch L2".
   Two tables, like fx-D-item.js:
   - window.FXO[item]: replaces the old DMGI row fx. Used where the old row counted something the item gives only on a trigger (rune, charge, half HP, slain elemental) or not at all.
     The trigger itself is a toggle entry in GX.item (switch on the sheet, S.fxT).
   - window.GX.item[item]: fx engine entries (equipped, and attuned when the item needs it).
   Notes that are text on purpose (no field exists, see reports/ledger-skipped-L2.md): dice and damage type replacement (Ranseur of Torture, Ruby Rod, True-Ice Shards, Scourge of Shadow, Lucent Destroyer),
   weapon rows for items without a base weapon (Boomerang Shield, Arcane Propulsion Arm, Battlechef's Splendid Saucepan, Warrior's Passkey), range doubling (Extended Barrel), +1 to Proficiency Bonus (Ioun Stone of Mastery),
   a 9th level slot (Boon of High Magic), no Stealth disadvantage (Serpent Scale Armor). */
(function(){
 var W=DataEnv.slot;W.FXO=W.FXO||{};W.GX=W.GX||{};var G=W.GX.item=W.GX.item||{};
 function add(n,e){(G[n]=G[n]||[]).push(e)}
 function each(list,f){list.forEach(f)}
 var NM="Bludgeoning, Piercing and Slashing";
 var BPS=["Bludgeoning","Piercing","Slashing"];
 /* Blasters of the Starfinder-style packs: the host weapons of the Blaster Mods (a mod does not name its host, so every blaster the character carries is counted) */
 var BLASTERS=["Laser Pistol","Laser Rifle","Antimatter Rifle","Standard Carbine","Antimatter Carbine","Hardlight Blaster","Dueling Laser"];

 /* ---------- Old row fx that was wrong or only true on a trigger ---------- */
 W.FXO["Banner of the Krig Rune"]={fx:null};              /* row had +1 AC and +1 attack: those belong to the Gift of Battle area (a place), not to carrying the banner */
/* row had AC +2: the text lists no AC bonus (the base shield gives +2) */
 W.FXO["Ring of Red Fury"]={fx:{swim:"walk"}};            /* row had paralyzed and restrained immunity always: only during Ruidium Rage (toggle below) */
 W.FXO["Nimbus Coronet"]={fx:null};                       /* row had Fly 60 always: only in cloud form */
 W.FXO["Shield of the Blazing Dreadnought"]={fx:null};    /* row had Fire immunity always: only while the shield is active */
 W.FXO["War Horn of Valor"]={fx:null};                    /* row had AC +1 always: one round, after invoking the rune */
 W.FXO["Bloodrage Greataxe"]={fx:null};                   /* row had +2 attack and damage always: only at half Hit Points or fewer */
 W.FXO["Crown of Whirling Comets"]={fx:null};             /* row had Fly always: 10 minutes, 1 charge */
 W.FXO["Hammer of Runic Focus"]={fx:null};                /* row had +3 always: only inside the rune circle */
 W.FXO["Moon Card"]={fx:null};                            /* row had four resistances always: Bludgeoning, Piercing, Slashing in wolf form only (Force was never a resistance) */
 W.FXO["Amethyst Lodestone"]={fx:null};                   /* row had Fly always: 1 charge, 10 minutes */
 W.FXO["Ring of Air Elemental Command"]={fx:null};        /* row had Fly and Lightning resistance always: only after helping slay an air elemental */
 W.FXO["Ring of Earth Elemental Command"]={fx:null};      /* row had Acid resistance always: only after helping slay an earth elemental */
/* Fire resistance is the base ring, Fire immunity needs the slain elemental (toggle below) */
 W.FXO["Armor of Zombie Flesh"]={fx:null};                /* row had Hide Armor plus 2 (Dex capped at 2): the text says AC 14 + Dexterity modifier (acBase below) */
 /* Deck of Wonder and Deck of Many More Things: fx:null already in fx-D-item.js (random card results). Verified again in tests/golden/builds/fx_L2_*.json */

 /* ---------- Cantrips and spells cast from the item (always prepared while the item counts) ---------- */
 each(["Budding Blossom Rod","Flowering Blossom Rod","Somniferous Blossom Rod"],function(n){add(n,{n:n,spells:[[1,"Druidcraft"]]})});   /* Plant Growth (Overgrowth only) and the later rod spells are charged or once per dawn: text */
 each(["Chattering Staff of Skulls"],function(n){add(n,{n:n,spells:[[1,"Chill Touch"]]})});
 add("Diamond Staff",{n:"Diamond Staff",spells:[[1,"Detect Magic,Light,Tongues"]]});   /* the three charge cost 0 spells; the others cost charges */
 add("Bigby's Beneficent Bracelet",{n:"Bigby's Beneficent Bracelet",spells:[[1,"Mage Hand"]]});
 add("Lucent Destroyer",{n:"Lucent Destroyer",spells:[[1,"Dancing Lights"]],atkBonus:[{when:"Lucent Destroyer",note:"No ammunition and no Loading property."}]});
 add("Sanctum Amulet",{n:"Sanctum Amulet",spells:[[1,"Spare the Dying"]]});
 add("Stonky's ring",{n:"Stonky's ring",spells:[[1,"Telekinesis"]],defs:[["Note","Telekinesis from the ring targets only objects that are not worn or carried"]]});
 add("Boon of the Fire Soul",{n:"Boon of the Fire Soul",spells:[[1,"Burning Hands"]],defs:[["Note","Burning Hands (Boon of the Fire Soul): save DC 15, at will, no spell slot, no components"]]});
 add("Boon of the Stormborn",{n:"Boon of the Stormborn",spells:[[1,"Thunderwave"]],defs:[["Note","Thunderwave (Boon of the Stormborn): save DC 15, at will, no spell slot, no components"]]});
 add("Abjurer's Gilder",{n:"Abjurer's Gilder",spells:[[1,"Shield"]],spCls:"Wizard"});   /* the text says: if it is in your spellbook. The sheet cannot read the spellbook, so Shield is always prepared for the Wizard */
 add("Amulet of the Inferno",{n:"Amulet of the Inferno",res:["Cold"],spells:[[1,"Fire Bolt,Produce Flame"]],defs:[["Note","You can breathe underwater"]]});
 /* Boon of Spell Mastery: one 1st-level spell from the Sorcerer, Warlock or Wizard list, cast at its lowest level without a slot. One optional pick per list (pick only one) */
 each(["Sorcerer","Warlock","Wizard"],function(c){add("Boon of Spell Mastery",{n:"Spell Mastery ("+c+" list)",spCls:c,pick:[{k:"sm"+c.slice(0,3).toLowerCase(),t:"cantrip",cls:c,slv:1,n:1,opt:1,yc:1,title:"1st-level "+c+" spell (pick only one spell across the three lists)"}]})});

 /* ---------- Extra damage dice on a hit ---------- */
 function dice(item,d,t,note){add(item,{n:item,atkDice:[{when:item,d:d,t:t,note:note}]})}
 dice("Adze of Annam","3d12","Force");
/* 2d6 when the rune is invoked: once per dawn, text */
 dice("Astral Sea Piercer","1d4","Force");
 dice("Bloodaxe","1d6","Necrotic");              /* not against Constructs or Undead: the note says so */
 add("Bloodaxe",{n:"Bloodaxe",atkBonus:[{when:"Bloodaxe",note:"The extra Necrotic damage does not apply to Constructs and Undead."}]});
 add("Elven Thrower",{n:"Elven Thrower",atkDice:[{when:"Elven Thrower",d:"1d8",t:"(2d8 against a Giant)"}],atkBonus:[{when:"Elven Thrower",note:"The extra damage applies to ranged attacks (thrown) only."}]});
 add("Ballistic Sledge",{n:"Ballistic Sledge",atkDice:[{when:"Ballistic Sledge",d:"1d4",t:"Bludgeoning (once per turn, when you fire the thrusters)"}],atkBonus:[{when:"Ballistic Sledge",atk:[[5,1],[11,2],[17,3]],dmg:[[5,1],[11,2],[17,3]]}]});
 add("Akmon, Hammer of Purphoros",{n:"Akmon, Hammer of Purphoros",atkDice:[{when:"Akmon, Hammer of Purphoros",d:"3d10",t:"Fire"}],tools:["Smith's Tools"],advOn:["ability checks made with Smith's Tools"]});
 add("Wyrmreaver Gauntlets",{n:"Wyrmreaver Gauntlets",atkDice:[{when:"unarmed",d:"1d6",t:"Force"}]});
 each([1,2,3],function(n){
  add("+"+n+" Dragonkin Weapon",{n:"Dragonkin Weapon",atkDice:[{when:"melee",d:"1d6",t:"damage of the type of your Breath Weapon",note:"Dragonkin Weapon extra damage"}],dcAdd:{"Breath Weapon":n}});
  add("+"+n+" Dragonhide Belt",{n:"Dragonhide Belt",dcAdd:{"Monk's Focus":n,"Ki":n}})});
 /* Blaster Mods: the host blaster is not named by the mod, so the listed blasters count */
 each([1,2,3],function(n){add("Blaster Mod (+"+n+" Enchanted Battery)",{n:"Enchanted Battery",atkBonus:[{when:BLASTERS,atk:n,dmg:n,note:"Does not stack with a bonus the blaster already has."}]})});
 add("Blaster Mod (Dragonfire Break)",{n:"Dragonfire Break",atkDice:[{when:BLASTERS,d:"1d6",t:"Fire",note:"Dragonfire Break extra damage"}]});

 /* ---------- Scoped attack bonuses ---------- */
 add("Arcanist's Bowstaff",{n:"Arcanist's Bowstaff",atkAb:{kind:"Arcanist's Bowstaff",ab:"INT"}});
 each([1,2,3],function(n){add("Arcane Carbine +"+n,{n:"Arcane Carbine",spDc:n})});   /* the spell attack bonus is already in the row */
 add("Scourge of Shadow",{n:"Scourge of Shadow",init:"CHA",initAdv:true,res:["Radiant","Necrotic"],atkBonus:[{when:"Scourge of Shadow",crit:18,note:"On a critical hit the whip deals 3d6."}]});
 add("Ruby Rod of Asmodeus",{n:"Ruby Rod of Asmodeus",atkBonus:[{when:"Ruby Rod of Asmodeus",note:"All damage dealt with the rod is converted to Necrotic."}]});
 add("True-Ice Shards (Rapier)",{n:"True-Ice Shards (Rapier)",atkBonus:[{when:"True-Ice Shards (Rapier)",note:"Damage is 1d8 Cold instead of the rapier's regular damage."}]});
 add("True-Ice Shards (Dagger)",{n:"True-Ice Shards (Dagger)",atkBonus:[{when:"True-Ice Shards (Dagger)",note:"Damage is 1d6 Cold instead of the dagger's regular damage."}]});

 /* ---------- Resistances, immunities, vulnerabilities, conditions ---------- */
 add("Canian Fork",{n:"Canian Fork",vul:["Radiant"]});
 add("Amulet of Appearance",{n:"Amulet of Appearance",condImm:["Frightened","Poisoned"]});
 add("Dark Gift of Delban, the Star of Ice and Hate",{n:"Ring of Warmth",res:["Cold"]});
 add("Dark Gift of Drizlash, the Nine-Eyed Spider",{n:"Dark Gift of Drizlash",mv:{climb:"speed"}});
 add("Dark Gift of Great Taar Haak, the Five-Headed Destroyer",{n:"Dark Gift of Great Taar Haak",abSet:[["STR",25]]});   /* Belt of Fire Giant Strength: 25. The gift lasts 10 days: text */
/* Mind Blank */
 add("Dark Gift of Seriach, the Hell Hound Whisperer",{n:"Dark Gift of Seriach",langs:["Infernal"]});
 add("Dark Gift of Yog the Invincible",{n:"Dark Gift of Yog",hpFlat:30});
 add("Dark Gift of Yrrga, the Eye of Shadows",{n:"Dark Gift of Yrrga",sense:[["Truesight",60,""]]});
 each(["Black","Blue","Brass","Bronze","Copper","Gold","Green","Red","Silver","White"],function(c){
  add(c+" Dragon Scale Mail",{n:c+" Dragon Scale Mail",advOn:["saving throws against the Frightful Presence and breath weapons of dragons"]})});
 add("Boon of Magic Resistance",{n:"Boon of Magic Resistance",advOn:["saving throws against spells and other magical effects"]});
 add("Blessing of Magic Resistance",{n:"Blessing of Magic Resistance",advOn:["saving throws against spells and other magical effects"]});
 add("Boon of Perfect Health",{n:"Boon of Perfect Health",advOn:["Constitution saving throws"],defs:[["Immunity","Disease"]]});
 add("Boon of Undetectability",{n:"Boon of Undetectability",skillBonus:[["Stealth",10]],defs:[["Note","Divination magic, including scrying sensors, can't detect or target you"]]});
 add("Boon of the Unfettered",{n:"Boon of the Unfettered",advOn:["ability checks to resist being grappled"]});
 add("Amulet of Protection from Turning",{n:"Amulet of Protection from Turning",advOn:["saving throws against effects that turn undead"]});
 add("Battlechef Buckler",{n:"Battlechef Buckler",advOn:["saving throws against Fire damage"]});
 add("Big Bertha",{n:"Big Bertha",advOn:["saving throws against the Frightened condition and against Madness"]});
 add("Blessed Reliquary",{n:"Blessed Reliquary",advOn:["saving throws caused by Undead"],defs:[["Note","Blessed Reliquary: you can use each Channel Divinity feature one additional time"]],lu:{n:"Turn Undead: targets have Disadvantage on their saves",max:1,reset:"long"}});
 /* Armor of Resistance and Armor of Vulnerability: the Dungeon Master picks or rolls the type, the player records it with a pick */
 var TYPES=["Acid","Cold","Fire","Force","Lightning","Necrotic","Poison","Psychic","Radiant","Thunder"];
 add("Armor of Resistance",{n:"Armor of Resistance",pick:[{k:"t",t:"multi",n:1,yc:1,title:"Damage type of the Resistance (set by your DM)",list:TYPES.map(function(t){return [t,""]})}]});
 each(TYPES,function(t){add("Armor of Resistance",{n:"Armor of Resistance ("+t+")",when:{key:"gx-t-item-Armor of Resistance",val:t},res:[t]})});
 add("Armor of Vulnerability",{n:"Armor of Vulnerability",pick:[{k:"t",t:"multi",n:1,yc:1,title:"Damage type of the Resistance (the other two become Vulnerabilities)",list:BPS.map(function(t){return [t,""]})}]});
 each(BPS,function(t){add("Armor of Vulnerability",{n:"Armor of Vulnerability ("+t+")",when:{key:"gx-t-item-Armor of Vulnerability",val:t},res:[t],vul:BPS.filter(function(o){return o!==t})})});

 /* ---------- Languages, tools, skills, senses, speed, other numbers ---------- */
 add("Charm of Many Tongues",{n:"Charm of Many Tongues",langs:["All languages"],skillProf:["Deception","Persuasion"],skillExpert:["Deception","Persuasion"]});
 add("Delver's Claws",{n:"Delver's Claws",sense:[["Blindsight",15,""]]});
 add("Belashyrra's Beholder Crown",{n:"Belashyrra's Beholder Crown",darkTo:120});
 add("Rogue's Mantle",{n:"Rogue's Mantle",darkNone:60,darkHave:{add:60}});
 add("Watchful Helm",{n:"Watchful Helm",advOn:["Wisdom (Perception) checks that rely on sight"]});
 add("Blackrazor",{n:"Blackrazor",sense:[["Blindsight",30,""]]});
 add("Axe of the Dwarvish Lords",{n:"Axe of the Dwarvish Lords",tools:["Smith's Tools","Brewer's Supplies","Mason's Tools"]});
 add("Belt of Dwarvenkind",{n:"Belt of Dwarvenkind",langs:["Dwarvish"],res:["Poison"],advOn:["saving throws to avoid or end the Poisoned condition"],darkNone:60});/* non-dwarf benefits; a dwarf already has them, so they change nothing there */
 add("Accounting and Valuation of All Things",{n:"Accounting and Valuation of All Things",spAtk:3,spDc:3});
 add("Arcane Resonator",{n:"Arcane Resonator",attune:4});
 add("Athreos's Devotee",{n:"Athreos's Devotee",lu:{n:"Gentle Repose (no Material components)",max:"mod:WIS",reset:"long"}});
 add("Blaster for Dummies",{n:"Blaster for Dummies",pick:[{k:"w",t:"weapon",wcats:["M"],n:1,title:"The Martial blaster you are proficient with"}]});
 each(["Large","Medium","Small"],function(s){
  var e={Large:{acBase:[18,""]},Medium:{acBase:[15,"full"],acDexMax:2},Small:{acBase:[12,"full"]}}[s];
  e.n="Barrier Tattoo";e.cond="noBody";add("Barrier Tattoo ("+s+")",e)});
 add("Armor of Zombie Flesh",{n:"Armor of Zombie Flesh",acBase:[14,"full"],acOver:true});
 add("Serpent Scale Armor",{n:"Serpent Scale Armor",acBase:[14,"full"],acOver:true,defs:[["Note","Serpent Scale Armor does not impose Disadvantage on Dexterity (Stealth) checks"]]});

 /* ---------- Toggles: the effect is true only after a trigger ---------- */
 add("War Horn of Valor",{n:"War Horn Rune",toggle:{id:"war-horn-rune",label:"War Horn of Valor: rune invoked (until the start of your next turn)"},acAdd:1});
 each(["Bloodrage Greataxe"],function(n){add(n,{n:n+" (half Hit Points or fewer)",toggle:{id:"bloodied",label:"At half Hit Points or fewer"},atkBonus:[{when:n,atk:2,dmg:2}]})});
 add("Crown of Whirling Comets",{n:"Star Flight",toggle:{id:"comets-flight",label:"Crown of Whirling Comets: Star Flight (10 minutes)"},mv:{fly:"speed"}});
 add("Amethyst Lodestone",{n:"Amethyst Lodestone",advOn:["Strength saving throws"]});
 add("Amethyst Lodestone",{n:"Flight",toggle:{id:"lodestone-flight",label:"Amethyst Lodestone: flight (10 minutes)"},mv:{fly:"speed"}});
 add("Warrior's Passkey",{n:"Sword Form",toggle:{id:"passkey-sword",label:"Warrior's Passkey: sword form"},defs:[["Note","Sword form: magic longsword, you are proficient, +1 to attack and damage rolls, a hit deals an extra 1d10 Force damage"]]});
})();
