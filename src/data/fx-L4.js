/* fx data batch L4 (ledger bin 4, shards 09 10 11): items from "Eye of Vecna" to "Necklace of Adaptation" that the ledger marked MISS, MISS_TOGGLE or MISMATCH.
   Registry: window.GX.item[name] (fx engine v2 to v4 entries, schema in SOURCE-NOTES.md) and window.FXO[name] (replaces the old row fx, fx:null drops it).
   Every value was read again from the item text of the row, not from the reviewer spec. Spec errors found:
   - Infernal Amulet: the fields are spAtk and spDc (the spec said spellatk and spelldc).
   - Gamma Pendant, Jetpack, Fish Suit: movement is mv:{fly:"speed"} in engine v4 (the spec said "walk").
   - Helm of Underwater Action: the text says darkvision with a range of 60 feet (not "additional"), so darkTo:60.
   - Hazirawn: an attuned item counts only while attuned, so the row shows the attuned numbers (+2 and 2d6 necrotic).
   - Mace of the Black Crown: Awakened gives poison resistance only, Exalted adds fire resistance, Dormant gives none.
   Text only on purpose (conditional or timed): curses, activated forms, Dormant extra damage of Grovelthrash, Gamma Pendant complete form.
   Not modelled (needs engine, listed in reports/ledger-skipped-L4.md): granted attack rows (Flensing Claws), reach, range multiplier, weapon dice replacement (Gurt's Greataxe), damage type override (Frozen Dagger, Lucent Destroyer), Proficiency Bonus +1 (Ioun Mastery), item spellbook list (Libram), armor flag override (Mithral Armor), Jack-of-all-trades style bonus (Logic Unit), Monstrous Weapon tier table. */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};DataEnv.slot.FXO=DataEnv.slot.FXO||{};
(function(){
 function add(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 function nm(n,bases){return [n].concat((bases||[]).map(function(b){return n+" ("+b+")"}))}
 function cap(s){return s}
 /* Senses and plain advantage notes */
 add("Eye of Vecna",{n:"Truesight",sense:[["Truesight",240,""]]});
 add("Eyes of Minute Seeing",{n:"Eyes of Minute Seeing",sense:[["Darkvision",1,"within 1 foot only"]],advOn:["Intelligence (Investigation) checks to examine something within 1 foot"]});
 add("Eyes of the Dragonne",{n:"Eyes of the Dragonne",advOn:["sight-based Wisdom (Perception) checks"]});
 add("Eyes of the Eagle",{n:"Eyes of the Eagle",advOn:["Wisdom (Perception) checks that depend on sight"]});
 add("Fangs of Guile",{n:"Fangs of Guile",advOn:["Deception, Insight and Persuasion checks"]});
 add("Festerwood Vizard",{n:"Festerwood Vizard",sense:[["Blindsight",10,""]]});
 add("Fin Symbiote",{n:"Fin Symbiote",advOn:["Constitution saving throws"]});
 add("Ghallanda Cauldron",{n:"Ghallanda Cauldron",advOn:["ability checks with Cook's Utensils"]});
 add("Greater Silver Sword",{n:"Greater Silver Sword",advOn:["Intelligence, Wisdom and Charisma saving throws (while held)"]});
 add("Helm of Perfect Potential",{n:"Master of Guile",advOn:["Charisma (Deception) checks","Wisdom (Insight) checks"]});
 add("Helm of Telepathy",{n:"Helm of Telepathy",sense:[["Telepathy",30,""]]});
 add("Kagonesti Forest Shroud",{n:"Kagonesti Forest Shroud",advOn:["Dexterity (Stealth) checks"]});
 add("Knave's Eye Patch",{n:"Knave's Eye Patch",advOn:["Wisdom (Perception) checks that rely on sight"],defs:[["Note","Immune to magic that reads your thoughts or tells whether you are lying. Creatures can talk to you telepathically only if you allow it."]]});
 add("Lost Crown of Besilmer",{n:"Lost Crown of Besilmer",advOn:["saving throws against effects that would charm you"]});
 add("Mantle of Spell Resistance",{n:"Mantle of Spell Resistance",advOn:["saving throws against spells"]});
 add("Mantle of the Pack Lord",{n:"Mantle of the Pack Lord",defs:[["Note","Enemies do not gain Advantage on attack rolls against you just because an ally of theirs is within 5 feet of you (Pack Tactics)."]]});
 add("Mindguard Crown",{n:"Mindguard Crown",advOn:["Intelligence, Wisdom and Charisma saving throws"]});
 add("Necklace of Adaptation",{n:"Necklace of Adaptation",advOn:["saving throws to resist or shake off the Poisoned condition"]});
 ["Moongold Ammunition","Moongold Weapon"].forEach(function(n){add(n,{n:"Moongold",advOn:["saving throws against the Frightened condition","saving throws against Madness"]})});
 add("Ioun Stone, Awareness",{n:"Ioun Stone, Awareness",noSurprise:true});
 add("Ioun Stone, Supreme Intellect",{n:"Ioun Stone, Supreme Intellect",chkBonus:[["INT",1]]});
 add("Gloves of Thievery",{n:"Gloves of Thievery",skillBonus:[["Sleight of Hand",5]]});
 add("Helm of Heroes",{n:"Helm of Heroes",acAdd:1,cond:"noBody"});

 /* Drawbacks as notes */
 add("Fragment of Deception",{n:"Fragment of Deception",defs:[["Note","Disadvantage on Wisdom checks"]]});
 add("Fragment of Loathing",{n:"Fragment of Loathing",defs:[["Note","Disadvantage on Charisma checks"]]});
 add("Fragment of Pity",{n:"Fragment of Pity",saveNote:["Disadvantage on death saving throws"],defs:[["Note","Each Hit Die you spend to heal gives extra Hit Points equal to your Proficiency Bonus"]]});
 add("Infernal Amulet",{n:"Infernal Amulet",spAtk:2,spDc:2,saveNote:["Disadvantage on Strength saving throws"],defs:[["Note","Disadvantage on Strength checks (curse)"]]});

 /* Weapon riders. Row names: the item name and, for items with a base list, "Name (Base)" */
 var FB=["Longsword","Glaive","Greatsword","Rapier","Scimitar","Shortsword"];
 function addV(n,bases,fn){nm(n,bases).forEach(function(v){add(v,fn(v))})}
 function rider(n,d,t,bases){addV(n,bases,function(v){return {n:v,atkDice:[{when:[v],d:d,t:t}]}})}
 rider("Fate Cutter Shears","1d6","force");
 rider("Festerwood Logger","1d4","acid");
 rider("Flail of Tiamat","5d4","acid, cold, fire, lightning or poison (your choice)");
 rider("Frost Brand","1d6","cold",FB);
 rider("Grave Reaper","2d8","necrotic");
 rider("Khrusor, Spear of Heliod","2d8","radiant");
 rider("Lash of Immolation","1d6","fire");
 rider("Lute of Thunderous Thumping","2d8","thunder");
 rider("Ironfang","1d8","thunder");
 rider("Ionbreaker, the Tempest's Reach","1d8","lightning (ranged hit on your turn)");
 add("Festerwood Logger",{n:"Festerwood Logger",atkBonus:[{when:["Festerwood Logger"],note:"The extra acid damage is maximized against plants, Plant creatures and wooden objects."}]});
 add("Hand of Vecna",{n:"Icy Touch",atkDice:[{when:"melee",d:"2d8",t:"cold (weapon held in the hand, and melee spell attacks with the hand)"}]});
 add("Hazirawn",{n:"Hazirawn (attuned)",atkDice:[{when:["Hazirawn"],d:"2d6",t:"necrotic"}]});
 DataEnv.slot.FXO["Hazirawn"]={fx:{atk:2,dmg:2}};
 var HA=["Longsword","Battleaxe","Blowgun","Club","Dagger","Dart","Flail","Glaive","Greataxe","Greatclub","Greatsword","Halberd","Hand Crossbow","Handaxe","Heavy Crossbow","Javelin","Lance","Light Crossbow","Light Hammer","Longbow","Mace","Maul","Morningstar","Musket","Pike","Pistol","Quarterstaff","Rapier","Scimitar","Shortbow","Shortsword","Sickle","Sling","Spear","Trident","War Pick","Warhammer","Whip"];
 addV("Holy Avenger",HA,function(v){return {n:v,atkBonus:[{when:[v],note:"Against a Fiend or an Undead: extra 2d10 radiant damage on a hit."}]}});
 add("Keranos's Devotee",{n:"Keranos's Devotee",atkBonus:[{when:"weapon",note:"Keranos's Devotee: once per turn on a hit, an extra 1d6 lightning (uses are in Resources)."}]});
 add("Malleus Macabre",{n:"Malleus Macabre",atkBonus:[{when:["Malleus Macabre"],crit:19}]});
 add("Fife of Dragonsong",{n:"Fife of Dragonsong",weapons:["Blowgun"],tools:["Fife"]});
 add("Mockingblade",{n:"Mockingblade",weapons:["Shortsword"]});
 /* levelled bonuses: +1 at level 5, +2 at 11, +3 at 17 */
 ["Heretical Sunstaff of Ra","Justiciar's Gavel"].forEach(function(n){add(n,{n:n+" (Upgraded)",atkBonus:[{when:[n],atk:[[5,1],[11,2],[17,3]],dmg:[[5,1],[11,2],[17,3]]}]})});

 /* Wrong old fx: replaced */
 /* fx-int: Far Gear is already defined in fx-L1 */
 DataEnv.slot.FXO["Ioun Stone of Vitality"]={fx:null};
 add("Ioun Stone of Vitality",{n:"Ioun Stone of Vitality",saveNote:["+1 bonus to death saving throws"]});
 DataEnv.slot.FXO["Ioun Stone, Self-Preservation"]={fx:null};
 add("Ioun Stone, Self-Preservation",{n:"Ioun Stone, Self-Preservation",saveBonusAb:[["INT",1]]});
 DataEnv.slot.FXO["Insignia of Claws"]={fx:null};
 add("Insignia of Claws",{n:"Insignia of Claws",atkBonus:[{when:["unarmed","natural"],atk:1,dmg:1}]});
 DataEnv.slot.FXO["Leather Golem Armor"]={fx:{ac:1,res:["Lightning"]}};
 add("Leather Golem Armor",{n:"Leather Golem Armor",saveNote:["+1 bonus to saving throws against spells and other magical effects"]});
 /* Infiltrator's Key: no bonus at Dormant, +1 only in dagger form from Awakened (text), nothing on the sheet */
 ["Dormant","Awakened","Exalted"].forEach(function(t){var n="Infiltrator's Key ("+t+")";DataEnv.slot.FXO[n]={fx:null};
  add(n,{n:"Infiltrator's Key",tools:["Thieves' Tools"],advOn:["ability checks to open locks (key as thieves' tools)","Dexterity (Stealth) checks to move silently"]});
  if(t!=="Dormant")add(n,{n:"Infiltrator's Key spells",lu:{n:"Key spell (Alter Self, Invisibility, Knock or Pass without Trace)",max:4,reset:"dawn",tag:"One use per spell"}});
  if(t==="Exalted")add(n,{n:"Infiltrator's Key opening",lu:[{n:"Key spell (Dimension Door, Gaseous Form or Mislead)",max:3,reset:"dawn",tag:"One use per spell"}]})});
 /* fx-int: Hide of the Feral Guardian (AC row and melee bonus while transformed) is defined in fx-L6 */
 /* Hammer of Runic Focus: +3 only inside the rune circle */
 DataEnv.slot.FXO["Hammer of Runic Focus"]={fx:null};
 add("Hammer of Runic Focus",{n:"Hammer of Runic Focus",toggle:{id:"runic-focus",label:"Inside the rune circle"},atkBonus:[{when:["Hammer of Runic Focus"],atk:3,dmg:3}]});
 /* Timed forms as switches */
 DataEnv.slot.FXO["Flying Chariot"]={fx:null};
 add("Flying Chariot",{n:"Flying Chariot",toggle:{id:"flying-chariot",label:"Riding or pulling the chariot"},acAdd:1});
 DataEnv.slot.FXO["Ghost Step Tattoo"]={fx:null};
 add("Ghost Step Tattoo",{n:"Ghostly Form",toggle:{id:"ghost-step",label:"Ghostly Form (until end of your next turn)"},condImm:["Grappled","Restrained"],def:["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical attacks"]});
 DataEnv.slot.FXO["Jetpack"]={fx:null};
 add("Jetpack",{n:"Jetpack",toggle:{id:"jetpack",label:"Jetpack active (10 minutes)"},mv:{fly:"speed"}});
 DataEnv.slot.FXO["Moon Card"]={fx:null};
 add("Moon Card",{n:"Moon Card",toggle:{id:"moon-card",label:"Wolflike form (1 minute)"},res:["Bludgeoning","Piercing","Slashing"],atkDice:[{when:["weapon","unarmed"],d:"1d6",t:"force"}]});
 add("Moonswaddled Armor",{n:"Moonswaddled Armor",toggle:{id:"night",label:"Dusk to dawn"},acAdd:1});

 /* Mace of the Black Crown */
 DataEnv.slot.FXO["Mace of the Black Crown (Dormant)"]={fx:{atk:1,dmg:1}};
 DataEnv.slot.FXO["Mace of the Black Crown (Awakened)"]={fx:{atk:2,dmg:2,res:["Poison"]}};
 /* Languages */
 /* Many Keyholes Dagger: +1 base, +2 Ten, +3 Many (choose the tier) */
 var MK=["Dagger","Club","Greatclub","Handaxe","Javelin","Light Hammer","Mace","Quarterstaff","Sickle","Spear","Battleaxe","Longsword","Rapier","Scimitar","Warhammer"];
 DataEnv.slot.FXO["Many Keyholes Dagger"]={fx:null};
 nm("Many Keyholes Dagger",MK).forEach(function(v){var K="gx-tier-item-"+v,W=[v];
  DataEnv.slot.FXO[v]={fx:null};
  add(v,{n:"Keyholes",atkBonus:[{when:W,atk:1,dmg:1}],pick:[{k:"tier",t:"multi",n:1,opt:1,title:"Keyholes (leave empty for Three)",list:[["Ten","Bonus +2"],["Many","Bonus +3"]]}]});
  add(v,{n:"Ten keyholes",when:{key:K,val:"Ten"},atkBonus:[{when:W,atk:1,dmg:1}]});
  add(v,{n:"Many keyholes",when:{key:K,val:"Many"},atkBonus:[{when:W,atk:2,dmg:2}]})});
 /* Marotte of Chance: Charisma for attack and damage (the row gets base Club in the data file) */
 add("Marotte of Chance",{n:"Marotte of Chance",atkAb:{kind:"Marotte of Chance",ab:"CHA"}});

 /* Movement, speed, defenses */
 add("Fish Suit",{n:"Fish Suit",mv:{swim:"speed"},defs:[["Note","Breathe in an airless environment; immune to the harmful effects of any gas. Fly Speed equal to your Speed in zero gravity."]]});
 add("Gamma Pendant",{n:"Gamma Pendant",mv:{fly:"speed"}});
 add("Nangnang",{n:"Nangnang",mv:{climb:"speed"}});
 add("Flesh of Dendallen",{n:"Flesh of Dendallen",vul:["Radiant"]});
 add("Infernal Plate Armor",{n:"Infernal Plate Armor",vul:["Force","Lightning","Psychic","Radiant","Thunder"]});
 add("Iron Elixir",{n:"Iron Elixir",toggle:{id:"iron-elixir",label:"Iron Elixir drunk",default:false},res:["Bludgeoning","Piercing","Slashing"],speedAdd:-10,defs:[["Note","Damage threshold 5. Disadvantage on Dexterity saving throws and checks that nothing can cancel."]]});
 add("Helm of Underwater Action",{n:"Helm of Underwater Action",darkTo:60});
 /* Scores */
 add("I'jin",{n:"I'jin",abSet:[["DEX",23]]});
 add("Kubazan",{n:"Kubazan",abSet:[["STR",23]]});
 ["Gallus Feather Robe","Luma Feather Robe"].forEach(function(n){add(n,{n:n,abPick:{k:"a",from:["INT","CHA"],set:22,title:"Ability that becomes 22"},lu:{n:n==="Gallus Feather Robe"?"Second target (single-ally spell)":"Reroll a successful save",max:3,reset:"dawn"}})});

 /* Spells and proficiencies */
 add("Finger Gun Glove",{n:"Finger Gun Glove",spells:[[1,"Finger Guns"]]});
 add("Finger Picks",{n:"Finger Picks",toolPE:["Thieves' Tools"]});/* fx engine v5: proficiency, or Expertise when already proficient */
 add("Fireweaver Gloves",{n:"Fireweaver Gloves",spells:[[1,"Produce Flame"]],defs:[["Note","Produce Flame from the gloves: +5 to hit, 1-hour duration"]]});
 add("Flamefriend Lantern",{n:"Flamefriend Lantern",spells:[[1,"Produce Flame"]],spCls:"@sub:WIS"});
 add("Forgemaster's Might",{n:"Forgemaster's Might",spells:[[1,"Mending"]],lu:[{n:"Creation (Forgemaster's Might)",max:1,reset:"dawn"},{n:"Fabricate (Forgemaster's Might)",max:1,reset:"dawn"}]});
 add("Glove of the Grim Fandango",{n:"Glove of the Grim Fandango",tools:["Musical Instruments (all)"]});
 add("Hand of the Master",{n:"Hand of the Master",spells:[[1,"Mage Hand"]]});
 add("Harp of Valor",{n:"Harp of Valor",tools:["Harp"]});
 add("Hat Trick",{n:"Hat Trick",spells:[[1,"Prestidigitation"]],defs:[["Note","Hat Trick: Prestidigitation only for the sensory effect or minor creation (illusory image) options"]]});
 add("Hat of Disguise",{n:"Hat of Disguise",spells:[[1,"Disguise Self"]]});
 add("Liar's Lyre",{n:"Liar's Lyre",tools:["Lyre"]});
 add("Grip of Dendallen",{n:"Grip of Dendallen",unarmed:{die:"1d6",t:"Necrotic",force:1},lu:{n:"Grip spell (Blight, Contagion or Vampiric Touch)",max:3,reset:"dusk",tag:"One use per spell"},defs:[["Note","Disadvantage on Charisma checks (curse)"]]});

 /* Prepared spells */

 /* Limited use pools */
 ["Aspirant","Adept","Master"].forEach(function(t,i){var n="Hearthfire Breastplate ("+t+")";
  add(n,{n:"Hearthfire Breastplate",saveNote:["Disadvantage on Dexterity saving throws (curse)"],lu:{n:"Shield (Hearthfire Breastplate)",max:"pb",reset:"long"}});
  if(i>=1)add(n,{n:"Hearthfire Breastplate (Adept)",lu:{n:"Temporary Hit Points (Hearthfire Breastplate)",max:"pb",reset:"long"}});
  if(i>=2)add(n,{n:"Hearthfire Breastplate (Master)",lu:{n:"Damage immunity reaction (Hearthfire Breastplate)",max:1,reset:"long"}})});
 ["Aspirant","Adept","Master"].forEach(function(t,i){var n="Indorius's Crown ("+t+")";
  add(n,{n:"Indorius's Crown",advOn:["Charisma checks","Charisma saving throws"],saveNote:["Disadvantage on Wisdom saving throws (curse)"],defs:[["Note","Disadvantage on Wisdom (Insight) checks (curse)"]]});
  if(i>=1)add(n,{n:"Indorius's Crown (Adept)",lu:{n:"Command a Friendly creature's Reaction",max:"pb",reset:"long"}})});
 add("Frightful Presence",{n:"Frightful Presence",lu:{n:"Frightful Presence",max:"pb",reset:"long",tag:"DC 8 + Proficiency Bonus + Charisma modifier"}});
 add("Heliod's Devotee",{n:"Heliod's Devotee",lu:{n:"Bless without components",max:"mod:WIS",reset:"long"}});
 add("Iroas's Devotee",{n:"Iroas's Devotee",lu:{n:"Compelled Duel",max:"mod:CHA",reset:"long"}});
 add("Keranos's Devotee",{n:"Keranos's Devotee",lu:{n:"Extra 1d6 lightning",max:"mod:INT",reset:"long"}});
 add("Hurricane Lance",{n:"Hurricane Lance",lu:{n:"Thunderwave (Hurricane Lance)",max:1,reset:"dawn"}});
 add("Girdle of Traveling Alchemy",{n:"Girdle of Traveling Alchemy",lu:[
  {n:"Alchemist's Fire (Girdle)",max:2,reset:"dawn"},{n:"Alchemist's ice (Girdle)",max:2,reset:"dawn"},{n:"Acid (Girdle)",max:2,reset:"dawn"},
  {n:"Swarm repellent (Girdle)",max:2,reset:"dawn"},{n:"Assassin's blood (Girdle)",max:1,reset:"dawn"},{n:"Potion of climbing (Girdle)",max:1,reset:"dawn"},{n:"Potion of healing (Girdle)",max:1,reset:"dawn"}]});

 /* Ironfang, Iron Fangs */
 add("Ironfang",{n:"Earth Mastery",langs:["Terran"],sense:[["Tremorsense",60,""]]});
 add("Iron Fangs",{n:"Iron Fangs",atkBonus:[{when:["Bite"],atk:2,dmg:2}]});
 add("Ionbreaker, the Tempest's Reach",{n:"A Storm Is Coming",initDie:"1d10"});
 /* Graft unarmed strikes */
 add("Monstrous Bite",{n:"Monstrous Bite",unarmed:{die:"1d6",t:"Piercing",force:1},atkAb:{kind:"unarmed",ab:"DEX"}});

 /* Logic Unit: Machine Code, and the Technomancy cantrip with a chosen casting ability. The half Proficiency Bonus on non-proficient Intelligence skills is not modelled (needs a per-skill proficiency test) */
 var LU="gx-lu-item-Logic Unit";
 add("Logic Unit",{n:"Logic Unit",langs:["Machine Code"],pick:[{k:"lu",t:"multi",n:1,title:"Technomancy casting ability (chosen when installed)",list:[["Intelligence",""],["Wisdom",""],["Charisma",""]]}]});
 [["Intelligence","INT"],["Wisdom","WIS"],["Charisma","CHA"]].forEach(function(a){add("Logic Unit",{n:"Logic Unit: Technomancy",when:{key:LU,val:a[0]},spells:[[1,"Technomancy"]],spCls:"@sub:"+a[1]})});
 /* Living Gloves: one proficiency chosen when attuning, doubled */
 var LG="gx-lg-item-Living Gloves";
 add("Living Gloves",{n:"Living Gloves",pick:[{k:"lg",t:"multi",n:1,title:"Living Gloves proficiency (chosen when you attune)",list:[["Sleight of Hand",""],["Thieves' Tools",""],["Artisan's Tools",""],["Musical Instrument",""]]}]});
 add("Living Gloves",{n:"Living Gloves: Sleight of Hand",when:{key:LG,val:"Sleight of Hand"},skillProf:["Sleight of Hand"],skillExpert:["Sleight of Hand"]});
 add("Living Gloves",{n:"Living Gloves: Thieves' Tools",when:{key:LG,val:"Thieves' Tools"},tools:["Thieves' Tools"],defs:[["Note","Living Gloves: double Proficiency Bonus on Thieves' Tools checks"]]});
 add("Living Gloves",{n:"Living Gloves: Artisan's Tools",when:{key:LG,val:"Artisan's Tools"},pick:[{k:"at",t:"tool",n:1,cats:["art"],title:"Living Gloves artisan's tools"}],defs:[["Note","Living Gloves: double Proficiency Bonus on checks with the chosen artisan's tools"]]});
 add("Living Gloves",{n:"Living Gloves: Musical Instrument",when:{key:LG,val:"Musical Instrument"},pick:[{k:"mi",t:"tool",n:1,cats:["music"],title:"Living Gloves musical instrument"}],defs:[["Note","Living Gloves: double Proficiency Bonus on checks with the chosen instrument"]]});
})();
