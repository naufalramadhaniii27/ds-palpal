/* fx data batch L10: ledger fixes (shards 25 to 28). Registry GX.sub / GX.species. Schema: SOURCE-NOTES.md, "fx engine v4" and "fx batch L10".
   Not done (engine gap or missing book table) is listed in reports/ledger-skipped-L10.md. */
window.GX=window.GX||{};GX.sub=GX.sub||{};GX.species=GX.species||{};
(function(){
 function add(n,e){GX.sub[n]=(GX.sub[n]||[]).concat(e)}
 var BPS=["Bludgeoning","Piercing","Slashing"];
 function alt(k,t){return {k:k,t:"tool",n:1,cats:["art"],opt:1,title:t}}
 function SK(l,n,sk,ab){return {l:l,n:n,skillBonus:sk.map(function(s){return [s,ab,1]})}}
 GX.species["Zombie"]=(GX.species["Zombie"]||[]).concat([{n:"Undead Nature",imm:["Poison"],condImm:["Poisoned"]}]);
 /* Alchemist */
 add("Amorist",[SK(3,"Charmer",["Deception","Persuasion"],"INT")]);
 add("Apothecary",[SK(3,"Physician's Studies",["Medicine"],"INT")]);
 add("Venomsmith",[{l:6,n:"Alchemical Assassin",advOn:["Dexterity (Sleight of Hand and Stealth) checks to hide and use the needle ring"]}]);
 /* Artificer */
 add("Alchemist",[{l:15,n:"Chemical Mastery",res:["Acid","Poison"],condImm:["Poisoned"]}]);
 add("Armorer",[{l:5,n:"Extra Attack",extraAttack:2}]);
 add("Battle Smith",[{l:3,n:"Battle Ready",atkAb:{kind:"weapon",ab:"INT",opt:1,note:"Magic weapons only: you can use Intelligence for attack and damage."}},{l:5,n:"Extra Attack",extraAttack:2}]);
 add("Cartographer",[{l:3,n:"Adventurer's Atlas",toggle:{id:"atlas-map",label:"Holding an Atlas map"},initDie:"1d4"}]);
 add("Forceforger",[{l:3,n:"Tools of the Trade",tools:["Smith's Tools"],pick:[alt("alt","Artisan's Tools instead (only if you already have Smith's Tools)")]}]);
 add("Forge Adept",[
  {l:3,n:"Battle Ready",weapons:["Martial"],atkAb:{kind:"weapon",ab:"INT",opt:1,note:"Magic weapons only: you can use Intelligence for attack and damage."}},
  {l:5,n:"Extra Attack",extraAttack:2},
  {l:3,n:"Tool Proficiency",tools:["Smith's Tools"],pick:[alt("alt","Artisan's Tools instead (only if you already have Smith's Tools)")]},
  {l:3,n:"Ghaal'Shaarat",toggle:{id:"ghaalshaarat",label:"Wielding your ghaal'shaarat"},atkBonus:[{when:"melee",atk:[[3,1],[9,2],[15,3]],dmg:[[3,1],[9,2],[15,3]],note:"Mighty Blade bonus applies to the imbued weapon only."}]},
  {l:15,n:"Perfect Weapon",toggle:{id:"ghaalshaarat",label:"Wielding your ghaal'shaarat"},res:["Psychic"],condImm:["Charmed","Frightened"]}]);
 add("Magneticist",[{l:5,n:"Extra Attack",extraAttack:2},
  {l:3,n:"Metal Slinger",weapons:["Dagger","Handaxe","Javelin","Light Hammer","Spear","Dart","Trident","Net"],atkAb:{kind:"ranged",ab:"INT",opt:1,note:"Metal thrown weapons with your Magnetic Manipulator: you can use Intelligence for attack and damage."}},
  {l:3,n:"Tools of the Trade",tools:["Smith's Tools"],pick:[alt("alt","Artisan's Tools instead (only if you already have Smith's Tools)")]}]);
 add("Maverick",[
  {l:3,n:"Arcane Prototype",lu:{n:"Arcane Charges",max:[0,0,1,1,3,3,3,3,5,5,5,5,7,7,9,9,11,11,11,13],reset:"long"}},
  {l:3,n:"Maverick Spells",spCls:"Artificer",prepAdd:"pb",cantAdd:1,spListAdd:[{cls:"Artificer",from:"Cleric"},{cls:"Artificer",from:"Wizard"}]},
  {l:3,n:"Tool Proficiency",pick:[{k:"tool",t:"tool",n:1,cats:["art"],title:"Artisan's Tools (you already have Tinker's Tools)"}]}]);
 add("Portalweaver",[{l:3,n:"Tools of the Trade",tools:["Weaver's Tools"],pick:[alt("alt","Artisan's Tools instead (only if you already have Weaver's Tools)")]}]);
 /* Barbarian */
 add("Path of Heavy Metal",[{l:3,n:"Rocker",skillBonus:[["Performance","STR",1]],pick:[{k:"inst",t:"tool",n:3,cats:["music"],title:"Three Musical Instruments"}]}]);
 add("Path of Spellfury",[SK(3,"Mystical Physicality",["Arcana"],"STR"),
  {l:3,n:"Spellcasting",spCls:"@sub:CHA",pick:[{k:"c",t:"cantrip",n:2,cls:"Sorcerer",title:"Sorcerer cantrips"}]},
  {l:10,n:"Spellcasting (third cantrip)",spCls:"@sub:CHA",pick:[{k:"c10",t:"cantrip",n:1,cls:"Sorcerer",title:"Extra Sorcerer cantrip"}]},
  {l:10,n:"Supernatural Exploits",spCls:"@sub:CHA",spells:[[10,"Darkvision,Jump,Longstrider,See Invisibility,Spider Climb,Water Breathing"]],defs:[["Note","Cast these six spells on yourself with no slot, even when not Raging"]]}]);
 add("Path of the Dreadnought",[{l:3,n:"Brutal Gunplay",atkAb:{kind:"ranged",ab:"STR",opt:1,note:"Target within 20 ft: you can use Strength instead of Dexterity for attack and damage."}}]);
 add("Path of the Fin",[{l:3,n:"Aquatic Adaptation",mv:{swim:"speed"},defs:[["Note","You breathe underwater"]]}]);
 add("Path of the Frostrager",[{l:10,n:"Abominable",advOn:["Constitution saving throws (unless Incapacitated)"]},{l:3,n:"Frostrage",toggle:{id:"rage",label:"Raging"},acAdd:"rage",cond:"noShield"}]);
 add("Path of the Glacier",[{l:3,n:"Permafrost",acAdd:1,cond:"noBody"}]);
 add("Path of the Primal Spirit",[{l:6,n:"Kin to Beasts",spCls:"@sub:CON",spells:[[6,"Animal Friendship,Speak with Animals"]],
  lu:[{n:"Kin to Beasts: Animal Friendship",max:1,reset:"short"},{n:"Kin to Beasts: Speak with Animals",max:1,reset:"short"}]}]);
 add("Path of the Storm Herald",[{l:6,n:"Storm Soul",when:{key:"p3opt",val:"Sea"},mv:{swim:30},defs:[["Note","You breathe underwater"]]}]);
 add("Path of the Swamp",[{l:3,n:"Bogborne",mv:{swim:"speed"},defs:[["Note","You breathe underwater"]]}]);
 add("Path of the Totem Warrior",[{l:3,n:"Totem Spirit",when:{key:"p3tot14",val:"Bear"},toggle:{id:"rage",label:"Raging"},res:["Acid","Bludgeoning","Cold","Fire","Force","Lightning","Necrotic","Piercing","Poison","Radiant","Slashing","Thunder"]}]);
 add("Path of the Wild Heart",[{l:3,n:"Animal Speaker",spCls:"@sub:WIS",spells:[[3,"Beast Sense,Speak with Animals"]]},{l:10,n:"Nature Speaker",spCls:"@sub:WIS",spells:[[10,"Commune with Nature"]]}]);
 add("Path of the Wrathful Dead",[{l:10,n:"Hard to Kill",advOn:["Death Saving Throws"],defs:[["Note","Needs four failed death saves to die"]]},{l:3,n:"Rage of the Dead",toggle:{id:"rage",label:"Raging"},speedAdd:10}]);
 /* Bard */
 var TA=["adv_talent3","adv_talent6","adv_talent14"],ta=[];
 TA.forEach(function(k,i){var l=[3,6,14][i];
  ta.push({l:l,n:"Talented Adventurer (Fighter)",when:{key:k,val:"Fighter"},weapons:["Martial"],armor:["Shields"]});
  ta.push({l:l,n:"Talented Adventurer (Ranger)",when:{key:k,val:"Ranger"},spCls:"Bard",spells:[[l,"Hunter's Mark"]]});
  ta.push({l:l,n:"Talented Adventurer (Monk)",when:{key:k,val:"Monk"},acBase:[10,"full","CHA"],cond:"noArmor",atkAb:{kind:"unarmed",ab:"DEX"},unarmed:{die:"1d6"}})});
 add("College of Adventurers",ta);
 add("College of Bartending",[SK(3,"Bartender",["Insight"],"CHA")]);
 add("College of Cantors",[SK(3,"Chorus Leader",["Religion"],"CHA")]);
 add("College of Choreography",[{l:6,n:"Entrancing Movement",spCls:"Bard",spells:[[6,"Charm Person"]]}]);
 add("College of Chronology (Dark Matter)",[{l:6,n:"Borrowed Time",spCls:"Bard",spells:[[6,"Action,Delay"]]},{l:3,n:"Chronomantic Secrets",spCls:"Bard",spells:[[3,"Moment to Think"]],skillBonus:[["History","CHA",1]]}]);
 add("College of Chronology",[SK(3,"Chronomantic Secrets",["History"],"CHA")]);
 add("College of Dance",[{l:3,n:"Dazzling Footwork",cond:"noArmor",atkAb:{kind:"unarmed",ab:"DEX"},advOn:["Charisma (Performance) checks that involve your dancing"]}]);
 add("College of Entropy",[{l:3,n:"Bonus Proficiencies",pick:[{k:"game",t:"tool",n:1,cats:["game"],title:"Gaming set"}]}]);
 add("Entropy",[{l:3,n:"Bonus Proficiencies",pick:[{k:"game",t:"tool",n:1,cats:["game"],title:"Gaming set"}]}]);
 add("College of Glamour",[{l:3,n:"Beguiling Magic",spCls:"Bard",spells:[[3,"Charm Person,Mirror Image"],[6,"Command"]]}]);
 add("College of Jesters",[{l:3,n:"Acrobatic Clown",skillBonus:[["Acrobatics","CHA",1],["Performance","DEX",1]]}]);
 add("College of Opera",[{l:3,n:"Vocalist",tools:["Voice (Musical Instrument)"]}]);
 add("College of the Dirge Singer",[{l:3,n:"Broad Inspiration",spCls:"Bard",spells:[[3,"Guidance"]]},{l:3,n:"Keeper of History",skillPE:["History","Performance"]}]);
 var RB="road_bp";
 add("College of the Road",[
  {l:3,n:"Bonus Proficiencies",when:{key:RB,val:"Herbalism Kit"},tools:["Herbalism Kit"]},
  {l:3,n:"Bonus Proficiencies",when:{key:RB,val:"Thieves' Tools"},tools:["Thieves' Tools"]},
  {l:3,n:"Bonus Proficiencies",when:{key:RB,val:"Gaming Set"},pick:[{k:"game",t:"tool",n:1,cats:["game"],title:"Gaming set"}]},
  {l:3,n:"Bonus Proficiencies",when:{key:RB,val:"Martial weapon"},pick:[{k:"wep",t:"weapon",n:1,wcats:["M"],title:"Martial weapon"}]},
  {l:3,n:"Bonus Proficiencies",when:{key:RB,val:"Skill"},pick:[{k:"skill",t:"skills",n:1,title:"Skill"}]},
  {l:3,n:"Bonus Proficiencies",when:{key:RB,val:"Languages"},pick:[{k:"lang",t:"lang",n:2,title:"Two languages"}]}]);
 add("Greenleaf College",[{l:3,n:"Expanded Spell List",spListAdd:{cls:"Bard",spells:["Entangle","Goodberry","Pass without Trace","Spike Growth","Conjure Animals","Daylight","Conjure Woodland Beings","Dominate Beast","Commune with Nature","Tree Stride"]}},
  {l:6,n:"Land's Stride",advOn:["saves against plants magically made or shaped to hinder movement"],defs:[["Note","Nonmagical Difficult Terrain costs no extra movement"]]}]);
 /* Captain (names shared with Vagabond, same text) */
 add("Adrenaline Junkie",[{l:6,n:"Live Fast",defs:[["Note","No damage from falls of 60 ft or less"]]}]);
 add("Daggermark",[{l:3,n:"Covert Tactics",init:"CHA",min:1}]);
 add("Demon Brand",[{l:6,n:"Blindsight",sense:[["Blindsight",30,""]]}]);
 add("Gourmand",[{l:3,n:"Fine Cuisine",spCls:"@sub:WIS",spells:[[3,"Gentle Repose"]],defs:[["Note","Gentle Repose can be cast only as a Ritual"]]}]);
 add("Holy Icon",[{l:3,n:"Theological Studies",spCls:"@sub:CHA",skillBonus:[["Religion","CHA",1]],pick:[{k:"c",t:"cantrip",n:2,cls:"Cleric",title:"Two Cleric cantrips"}]}]);
 add("Knight Errant",[{l:3,n:"Chivalrous Oath",advOn:["saves to avoid or end the Charmed and Frightened conditions"]}]);
 add("Pugilist",[{l:3,n:"Hand-to-Hand",acDexAb:"CON",cond:"noBody",unarmed:{die:[[3,"1d6"],[5,"1d8"],[11,"1d10"],[17,"1d12"]]}}]);
 add("Siegeball Jersey",[SK(3,"Sports Fanatic",["Athletics"],"CHA")]);
 add("Star-Spangled Banner",[{l:10,n:"Freedom of Movement",spCls:"@sub:CHA",spells:[[10,"Freedom of Movement"]]}]);
 /* Cleric */
 add("Apocalypse Domain",[{l:3,n:"Ranting Ruin",spCls:"Cleric",spells:[[3,"Vicious Mockery"]],pick:[{k:"skill",t:"skills",n:1,from:["Arcana","Survival"],title:"Ranting Ruin skill"}]}]);
 function mast(n){return {l:17,n:n,spCls:"Cleric",pick:[6,7,8,9].map(function(s){return {k:"m"+s,t:"cantrip",cls:"Wizard",slv:s,n:1,title:"Wizard spell level "+s}})}}
 add("Arcana Domain (2014)",[mast("Arcane Mastery")]);
 add("Arcana Domain",[mast("Magical Mastery")]);
 add("Beer Domain",[{l:3,n:"Disciple of the Draught",tools:["Brewer's Supplies"],spCls:"Cleric",spells:[[3,"Message"]],pick:[{k:"skill",t:"skills",n:1,from:["Insight","Medicine"],title:"Disciple of the Draught skill"}]}]);
 add("Cat Domain",[{l:6,n:"Eyes of the Cat",darkNone:60,darkHave:{to:90}}]);
 add("Clockwork Domain",[{l:3,n:"Bonus Proficiencies",tools:["Clockmaker's Tools"],armor:["Heavy"]}]);
 add("Darkness Domain",[{l:3,n:"Creature of Darkness",pick:[{k:"skill",t:"skills",n:1,from:["Deception","Stealth"],title:"Creature of Darkness skill"}]}]);
 add("Evolution Domain",[{l:17,n:"High Evolutionary",abUp:["STR","DEX","CON","INT","WIS","CHA"].map(function(a){return [a,2,22]})}]);
 add("Forge Domain",[{l:6,n:"Soul of the Forge",acAdd:1,cond:"heavy"}]);
 add("Grave Domain (2014)",[{l:8,n:"Potent Spellcasting",atkBonus:[{when:"spell",dmg:"WIS",note:"Cleric cantrips only."}]}]);
 add("Moon Domain",[{l:8,n:"Empowered Cantrips",atkBonus:[{when:"spell",dmg:"WIS",note:"Cleric cantrips only (minimum +1)."}]}]);
 add("Peace Domain",[{l:8,n:"Potent Spellcasting",atkBonus:[{when:"spell",dmg:"WIS",note:"Cleric cantrips only."}]}]);
 add("Hunger Domain",[{l:3,n:"Bonus Proficiency",armor:["Heavy"]},{l:3,n:"Unsated",tools:["Cook's Utensils"]}]);
 add("Hunting Domain",[{l:3,n:"Forest Master",weapons:["Longbow","Heavy Crossbow"]}]);
 add("Justice Domain",[{l:3,n:"Bonus Proficiency",armor:["Heavy"],weapons:["Martial"]}]);
 [["Knowledge Domain (2014)","p3skilknowledg"],["Knowledge Domain (PSA)","p1skillknpsa"]].forEach(function(q){
  add(q[0],["Arcana","History","Nature","Religion"].map(function(s){return {l:3,n:"Blessings of Knowledge",when:{key:q[1],val:s},skillExpert:[s]}}))});
 add("Labyrinth Domain",[{l:6,n:"Befuddling Touch",lu:{n:"Befuddling Touch",max:{f:"3+mod:WIS"},reset:"long",tag:"Action"}},{l:3,n:"First Passage",langs:["Abyssal","Rue-Thothka"]}]);
 add("Lust Domain",[{l:3,n:"Gifts of Lust",spCls:"Cleric",spells:[[3,"Message"]],pick:[{k:"skill",t:"skills",n:1,from:["Deception","Performance","Persuasion"],title:"Gifts of Lust skill"}]}]);
 add("Machine Domain",[{l:3,n:"Gearpriest",skillProf:["Technology"],skillBonus:[["Technology","WIS",1]]}]);
 add("Mind Domain",[{l:6,n:"Gestalt Anchor",saveBonusAb:[["INT",2],["WIS",2],["CHA",2]]}]);
 add("Mountain Domain",[{l:3,n:"Bonus Proficiency",pick:[{k:"skill",t:"skills",n:1,from:["Athletics","Nature","Survival"],title:"Bonus Proficiency skill"}]},
  {l:3,n:"Tongues of the Mountains",pick:[{k:"lang",t:"multi",n:1,title:"Language",list:[["Dwarvish",""],["Giant",""]]}]},
  {l:3,n:"Tongues of the Mountains",when:{key:"gx-lang-sub-Mountain Domain",val:"Dwarvish"},langs:["Dwarvish"]},
  {l:3,n:"Tongues of the Mountains",when:{key:"gx-lang-sub-Mountain Domain",val:"Giant"},langs:["Giant"]}]);
 add("Night Domain",[{l:3,n:"Eye of Twilight",sense:[["Darkvision",60,"gray only"]]},{l:6,n:"Eye of Twilight (120 ft)",sense:[["Darkvision",120,"gray only"]]},
  {l:3,n:"Ward of Shadows",lu:{n:"Ward of Shadows",max:"mod:WIS",reset:"long",tag:"Reaction"}}]);
 add("Ocean Domain",[{l:6,n:"At Home in the Waves",mv:{swim:30},darkNone:60,darkHave:{add:30}},{l:3,n:"Envoy to the Waves",langs:["Aquan"],weapons:["Trident","Net"]},
  {l:17,n:"Scales of the Sea",toggle:{id:"ocean-scales",label:"Scaled"},def:["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical weapons"]}]);
 add("Prophecy Domain",[{l:3,n:"A Path Foretold",pick:[{k:"lang",t:"lang",n:1,title:"Exotic language"}]}]);
 add("Purification Domain",[{l:3,n:"Cleanse with Fire",lu:{n:"Cleanse with Fire",max:{f:"mod:WIS+pb",min:1},reset:"short"}},{l:6,n:"Ward Against Corruption",advOn:["saves to avoid or end diseases","saves against effects that change your form"]}]);
 add("Speed Domain",[{l:3,n:"Celerity in Thought and Action",speedAdd:5},{l:6,n:"Quickness of the Gods",speedAdd:5}]);
 add("Strength Domain (PSA)",[{l:17,n:"Avatar of Battle",def:["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical attacks"]}]);
 add("War Domain (2014)",[{l:17,n:"Avatar of Battle",def:["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical attacks"]}]);
 add("Tempest Domain",[{l:17,n:"Stormborn",mv:{fly:"speed"}}]);
 add("Time Domain",[{l:17,n:"Master of Time",spListAdd:{cls:"Cleric",spells:["Foresight","Time Stop"]}}]);
 add("Travel Domain",[{l:3,n:"Bonus Proficiency",tools:["Cartographer's Tools"],pick:[{k:"lang",t:"lang",n:2,title:"Two languages"}]},{l:3,n:"Born to the Road",pick:[{k:"skill",t:"skills",n:1,from:["Insight","Nature","Survival"],title:"Born to the Road skill"}]}]);
 add("Void Domain",[{l:3,n:"Bonus Proficiency",tools:["Navigator's Tools"]}]);
 /* Craftsman */
 add("Courtiers' Guild",["Deception","Insight","Performance","Persuasion"].map(function(s){return {l:3,n:"Fashionable",when:{key:"courtier_elegant",val:s},skillProf:[s]}}));
 add("Forgeknights' Guild",[{l:3,n:"Portable Forge",res:["Fire"],spCls:"@sub:INT",spells:[[3,"Mending,Produce Flame"]]}]);
 add("Luminaries' Guild",[{l:10,n:"Improved Radiant Shell",toggle:{id:"lum-shell-thp",label:"Have Temporary HP"},acAdd:2}]);
 add("Thunderlords' Guild",[{l:3,n:"Power Cell",res:["Lightning"]}]);
 add("Wintercarvers' Guild",[{l:3,n:"Winter Core",res:["Cold"]}]);
 /* Dancer */
 add("Acrobat",[{l:3,n:"Aerial Acrobat",skillBonus:[["Acrobatics","CHA",1]],mv:{climb:"speed"}},{l:6,n:"Tumbling",toggle:{id:"dance-agile",label:"Agile Movement is your active Dance Style"},speedAdd:10}]);
 add("Cheerleader",[{l:3,n:"Team Player",advOn:["saves to avoid or end the Frightened condition"]}]);
 add("Contortionist",[{l:3,n:"Double Joints",toggle:{id:"dance-active",label:"Your Dance is active"},condImm:["Grappled","Restrained"]}]);
 add("Courtesan",[{l:3,n:"Honeyed Words",pick:[{k:"lang",t:"lang",n:2,title:"Two languages"}]}]);
 add("Danseur Macabre",[{l:3,n:"Danse Macabre [Dance Style]",lu:{n:"Danse Macabre spirits",max:{f:"lvl+mod:CHA",min:1},reset:"long",tag:"Bonus Action"}},{l:3,n:"Ghoulish Calling",darkAdd:60}]);
 add("Dramaturge",[{l:3,n:"Spellcasting",spCls:"@sub:CHA",pick:[{k:"c",t:"cantrip",n:2,cls:"Bard",title:"Two Bard cantrips"}]},{l:10,n:"Spellcasting (third cantrip)",spCls:"@sub:CHA",pick:[{k:"c10",t:"cantrip",n:1,cls:"Bard",title:"Extra Bard cantrip"}]}]);
 add("Fencer",[SK(3,"Panache",["Persuasion"],"DEX")]);
 /* limited-use rows with a wrong reset: a Short Rest returns one use */
 if(window.LU_X)window.LU_X.forEach(function(r){if(r.src==="sub"&&((r.owner==="Contortionist"&&r.feature==="Twisting Redirection")||(r.owner==="Fencer"&&r.feature==="Parry and Riposte")||(r.owner==="Fey Ballerina"&&r.feature==="Misty Waltz")))r.reset="short1"});
 /* Greenleaf College: the spells only join the Bard list, they are not always prepared */
 if(window.AUTO)window.AUTO["Greenleaf College"]=[];
})();
