/* fx batch L3 (items, ledger shards 07 and 08): fixes for ledger verdicts MISS, MISS_TOGGLE and MISMATCH on magic items, supernatural gifts and grafts.
   Same registry as fx-D-item.js: window.GX.item[item] = list of entries (schema in SOURCE-NOTES.md), window.FXO[item] replaces the old DMGI fx.
   ITEM_SPELLS[item].dc is set where the item text gives a fixed save DC.
   Several ledger specs were wrong because the spell rows already come from ITEM_SPELLS (Boots of Levitation, Borealus, Budding Blossom Rod, Chattering Staff, Draconic Familiar, Echo of Dragonsight, Emerald Pen,
   Encyclopedia Sanguine, Bracers of Defense AC, Embedded Armor Dex, Deck of Wonder and Deck of Many More Things already dropped in fx-D-item.js). They need no data here.
   Not modelled (engine gaps) are listed in reports/ledger-skipped-L3.md. */
(function(){
 var W=window;W.FXO=W.FXO||{};W.GX=W.GX||{};var G=W.GX.item=W.GX.item||{};
 function add(n,e){(G[n]=G[n]||[]).push(Object.assign({n:n},e))}
 var AB6=["STR","DEX","CON","INT","WIS","CHA"],ABN={STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"};
 function dc(n,v){if(typeof ITEM_SPELLS!=="undefined"&&ITEM_SPELLS[n])ITEM_SPELLS[n].dc=v}
 function spl(n,list,extra){if(typeof ITEM_SPELLS==="undefined")return;ITEM_SPELLS[n]=Object.assign({sp:list},extra||{})}

 /* Ability scores */
 var TB={id:"book-exalted-studied",label:"Book of Exalted Deeds: finished the 80 hours of study",default:true};
 add("Book of Exalted Deeds",{n:"Divine Wisdom",toggle:TB,abUp:[["WIS",2,24]]});
 var TV={id:"book-vile-studied",label:"Book of Vile Darkness: finished the 80 hours of study",default:true};
 add("Book of Vile Darkness",{n:"Adjusted Ability Scores",toggle:TV,condImm:["Exhaustion"],abPick:{k:"up",from:AB6,up:2,max:24,title:"Ability score to raise by 2 (maximum 24)"},
  pick:[{k:"dn",t:"multi",n:1,title:"Ability score to lower by 2 (minimum 3)",list:AB6.map(function(a){return [ABN[a],""]})}]});
 AB6.forEach(function(a){add("Book of Vile Darkness",{n:"Adjusted Ability Scores ("+a+" lowered)",toggle:TV,when:{key:"gx-dn-item-Book of Vile Darkness",val:ABN[a]},abDown:[[a,-2,3]]})});
 [["Affliction","DEX","WIS"],["Deception","DEX","CHA"],["Destiny","STR","WIS"],["Harvests","CON","WIS"],["Horizons","CON","INT"],["Slaughter","STR","CON"],["Storms","INT","WIS"],["Victory","STR","CHA"],["the Dead","CON","WIS"],["the Forge","STR","INT"],["the Hunt","DEX","WIS"],["the Passage","INT","WIS"],["the Polis","INT","CHA"],["the Sea","DEX","INT"],["the Sun","STR","WIS"]].forEach(function(c){
  add("Champion of "+c[0],{abPick:{k:"a",from:[c[1],c[2]],up:2,max:22,title:"Ability score to raise by 2 (maximum 22)"}})});
 add("Corvum Feather Robe",{n:"Feather Robe",abPick:{k:"a",from:["INT","CHA"],set:22,title:"Ability score that becomes 22"}});
 /* fx-int: Boon of Undetectability, Crown of Daffodils (fx-H-audit), Dimensional Loop (fx-L1) and Dark Gift of Yog (fx-L2) are already defined in the earlier file; the copies here counted twice. */

 /* Languages */
 add("Charm of Argonnessen",{langs:["Draconic"]});
 add("Charm of Ashtakala",{langs:["Abyssal","Infernal"]});
 add("Charm of Dhakaan",{langs:["Goblin"]});
 add("Charm of Xen'drik",{langs:["Giant"]});
 add("Dragon Queen's Will",{langs:["Draconic"],saveBonusAb:[["WIS",4]]});
 ["Dragon's Call","Draconic Longsword"].forEach(function(n){add(n,{langs:["Draconic"]})});
 add("Drown",{langs:["Aquan"],atkDice:[{when:"Drown",d:"1d8",t:"Cold"}]});
 add("Earworm",{langs:["Deep Speech"]});
 add("Efreeti Chain",{langs:["Primordial"]});
 add("Demon Armor",{langs:["Abyssal"],unarmed:{die:"1d8",t:"Slashing",force:1},atkBonus:[{when:"unarmed",atk:1,dmg:1}]});
 FXO["Chronolometer"]={fx:null};

 /* Senses and darkvision */
 add("Circlet of Barbed Vision (Exalted)",{sense:[["Truesight",60,""]]});
 add("Draconic Senses",{sense:[["Blindsight",10,""]]});
 add("Eye of Dendallen",{darkNone:60,darkHave:{add:30}});
 var DV="Intelligence (Investigation) and Wisdom (Perception) checks that rely on sight";
 ["Dormant","Awakened","Exalted"].forEach(function(t){var n="Danoth's Visor ("+t+")",e={darkTo:60,advOn:[DV],defs:[["Note","Sees normally in magical and nonmagical darkness out to 60 feet"]]};
  if(t!=="Dormant")e.sense=[["See Invisible",60,"Also sees into the Ethereal Plane"]];
  if(t==="Exalted")e.defs.push(["Note","Automatically detects illusions you can see and succeeds on saving throws against them"]);
  add(n,e)});

 /* Advantage notes and save notes */
 var MAG="saving throws against spells and other magical effects";
 add("Cloak of the Mausgeist",{advOn:[MAG,"Wisdom (Perception) checks that rely on hearing"]});
 add("Cloak of the Stygian Bat",{advOn:["Wisdom (Perception) checks that rely on hearing"]});
 add("Cap of Bravery",{advOn:["saving throws to avoid or end the Frightened condition (you and allies in a 30-foot Emanation)"]});
 add("Cloak of Shadows",{advOn:["Dexterity (Stealth) checks"],defs:[["Note","Creatures making a Wisdom (Perception) check to notice you have Disadvantage"]]});
 add("Circlet of the Huntsman's Third Eye",{advOn:["Wisdom (Survival) checks"]});
 add("Couatl Herald's Mantle",{advOn:["saving throws to avoid or end the Poisoned condition and against magical contagions"],defs:[["Immunity","Effects that sense your emotions"]]});
 add("Bracers of Celerity",{speedAdd:10,advOn:["saving throws to avoid or end the Paralyzed or Restrained condition"],defs:[["Note","All your other Speeds (Fly, Swim, Climb, Burrow) also increase by 10 feet"]]});
 add("Dragonguard",{advOn:["saving throws against the breath weapons of Dragons"]});
 add("Dragonstaff of Ahghairon",{advOn:["saving throws against the spells and breath weapons of dragons and the breath weapons of dragon-type creatures (while holding it)"]});
 add("Donjon's Sundering Sphere",{advOn:["saving throws against spells or effects that would send you to another plane or an extradimensional space against your will (while wielding the weapon)"]});
 add("Deni Shield",{initAdv:true,advOn:["Wisdom (Perception) checks"]});
 add("Elder Cartographer's Glossography",{advOn:["Intelligence or Wisdom checks related to geographical features or locations"]});
 ["Aspirant","Adept","Master"].forEach(function(t){add("Dämglesvir ("+t+")",{n:"Curse",saveNote:["Disadvantage on Constitution saving throws (curse)"],def:["Curse","Disadvantage on Constitution saving throws"]})});
 add("Dragon Scale Mail",{n:"Dragon Scales",advOn:["saving throws against the breath weapons of Dragons"],
  pick:[{k:"r",t:"multi",n:1,title:"Damage type of your dragon (Acid: Black, Copper. Lightning: Blue, Bronze. Fire: Brass, Gold, Red. Poison: Green. Cold: Silver, White)",list:[["Acid",""],["Lightning",""],["Fire",""],["Poison",""],["Cold",""]]}]});
 ["Acid","Lightning","Fire","Poison","Cold"].forEach(function(t){add("Dragon Scale Mail",{n:"Dragon Scales ("+t+")",when:{key:"gx-r-item-Dragon Scale Mail",val:t},res:[t]})});

 /* Resistances, immunities, vulnerabilities, skills */
 add("Boon of Resilience",{def:["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical weapons"]});
 add("Crown of Horns",{imm:["Necrotic"]});
 add("Claw of the Wyrm Rune",{def:["Resistance","Damage from any dragon's breath weapon (while the claw is displayed on your person)"]});
 add("Dark Gift of Savnok the Inscrutable",{imm:["Psychic"],condImm:["Charmed"],defs:[["Immunity","Effects that sense your emotions or read your thoughts, and Divination spells (Mind Blank)"]]});

 /* Attack riders */
 add("Bracers of Archery",{weapons:["Longbow","Shortbow"],atkBonus:[{when:["Longbow","Shortbow"],dmg:2}]});
 add("Brass Repeater",{atkBonus:[{when:"Brass Repeater",atk:[[5,1],[11,2],[17,3]],dmg:[[5,1],[11,2],[17,3]]}]});
 add("Butcher's Bib",{atkBonus:[{when:["Battleaxe","Glaive","Greataxe","Greatsword","Halberd","Handaxe","Longsword","Scimitar","Sickle","Whip"],crit:19}]});
 add("Ephixis, Bow of Nylea",{atkBonus:[{when:"Ephixis, Bow of Nylea",crit:19,note:"No Disadvantage at long range."}]});
 add("Devotee's Censer",{atkDice:[{when:"Devotee's Censer",d:"1d8",t:"Radiant"}]});
 add("Dyrrn's Tentacle Whip",{atkDice:[{when:"Dyrrn's Tentacle Whip",d:"1d6",t:"Psychic"}]});
 add("Exo-Frame",{weapons:["Battlefist"]});

 /* Resources */
 add("Breathing Bubble",{lu:{n:"Breathable air (minutes)",max:60,reset:"dawn"}});
 add("Ceratopper",{lu:{n:"Polymorph (Triceratops)",max:1,reset:"none",tag:"Not again for 2 days"}});
 add("Ephara's Devotee",{lu:{n:"Comprehend Languages",max:"mod:INT",reset:"long"}});
 add("Erebos's Devotee",{lu:{n:"Bane",max:"mod:WIS",reset:"long"}});

 /* Embedded Armor: base AC 13 + Dex, also used over worn armor */
 FXO["Embedded Armor"]={fx:null};
 add("Embedded Armor",{acBase:[13,"full"],acOver:true});

 /* Toggles and picks */
 add("Dekella, Bident of Thassa",{n:"Blessing of the Deep",toggle:{id:"dekella-thassa",label:"Dekella: worshiper of Thassa with Piety 10+",default:false},mv:{swim:60},defs:[["Note","You can breathe underwater"]]});
 FXO["Dekella, Bident of Thassa"]={fx:{atk:3,dmg:3}};
 FXO["Cogwork Wings"]={fx:null};
 var CW="gx-w-item-Cogwork Wings";
 add("Cogwork Wings",{n:"Wings in motion",pick:[{k:"w",t:"multi",n:1,title:"Your total weight with gear",list:[["Under 150 lb",""],["150 to 250 lb",""],["Over 250 lb",""]]}],lu:{n:"Flight time (minutes)",max:60,reset:"none",tag:"Regains 10 minutes per 4 hours not in use"}});
 add("Cogwork Wings",{n:"Wings in motion (under 150 lb)",when:{key:CW,val:"Under 150 lb"},toggle:{id:"cogwork-wings",label:"Cogwork Wings flapping (1 hour total flight)",default:false},mv:{fly:60}});
 add("Cogwork Wings",{n:"Wings in motion (150 to 250 lb)",when:{key:CW,val:"150 to 250 lb"},toggle:{id:"cogwork-wings",label:"Cogwork Wings flapping (1 hour total flight)",default:false},mv:{fly:30}});

 /* Fixed save DCs on cast-from-item spells */
 dc("Boon of the Fire Soul",15);dc("Boon of the Stormborn",15);
 spl("Eye of Dendallen",[["See Invisibility",0]]);
 spl("Druidic Throwing Club",[["Shillelagh",0]]);
})();
