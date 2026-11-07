/* fx engine v2 data, batch B2: mechanics of 23 subclass features that the sheet could not count.
   Registry: window.GX.sub["<Subclass>"] = [entries]. Entry l = class level. Schema: SOURCE-NOTES.md, "fx schema".
   Values re-checked against the feature text in src/data (wotc02, db3, tp03, tp05, tp10, tp12, tp13, tp14). */
(function(){
var G=DataEnv.slot.GX=DataEnv.slot.GX||{};var S=G.sub=G.sub||{};
function add(k,list){S[k]=(S[k]||[]).concat(list)}
var BPS=["Bludgeoning","Piercing","Slashing"];
/* Monk */
add("Warrior of the Mystic Arts",[{l:3,n:"Spellcasting",spCls:"@sub:WIS",pick:[{k:"c",t:"cantrip",n:2,cls:"Sorcerer",title:"Sorcerer cantrips"}]}]);
/* Monster Hunter */
add("Trapper Guild",[{l:7,n:"Ambusher's Advantage",init:"INT"}]);
/* Necromancer */
add("Dead Mist Acolyte",[{l:20,n:"Dead Mist Lord",res:BPS,mv:{fly:"speed"}}]);
add("Death Knight",[{l:20,n:"Imperator",res:BPS}]);
add("Reaper",[{l:20,n:"Harbinger",mv:{fly:60}}]);
add("Toymaker",[{l:20,n:"Clockwork Lich",defs:[["Immunity","Conditions: Blinded, Charmed, Deafened, Frightened, Paralyzed, Stunned"]]}]);
/* Paladin */
add("Oath of Glory",[{l:7,n:"Aura of Alacrity",speedAdd:10}]);
add("Oath of Thunder",[{l:7,n:"Aura of Alacrity",init:"pb"}]);
/* Rogue */
add("Thief",[{l:3,n:"Second-Story Work",mv:{climb:"speed"}}]);
/* Sorcerer. The heritage pick (B.ch.ee_heritage) decides the element */
var EE="ee_heritage";
add("Elemental Essence",[
 {l:18,n:"Elemental Soul (Air)",when:{key:EE,val:"Air"},defs:[["Immunity","Lightning or Thunder damage (the type chosen for your heritage)"]],mv:{fly:"speed"}},
 {l:18,n:"Elemental Soul (Earth)",when:{key:EE,val:"Earth"},imm:["Bludgeoning"],mv:{burrow:"speed"}},
 {l:18,n:"Elemental Soul (Fire)",when:{key:EE,val:"Fire"},imm:["Fire"],speedAdd:10},
 {l:18,n:"Elemental Soul (Water)",when:{key:EE,val:"Water"},imm:["Cold"],mv:{swim:"speed"},defs:[["Note","You can breathe water and air"]]}]);
add("Frost Sorcery",[{l:3,n:"Frozen Body",hpLvl:1}]);/* +3 at level 3, then +1 per Sorcerer level after 3: Sorcerer level in total */
/* Summoner */
add("Bond of the Shambling Plant",[{l:3,n:"Natural Spellcasting",spCls:"@sub:CHA",pick:[{k:"c",t:"cantrip",n:1,cls:"Druid",title:"Druid cantrip"},{k:"s",t:"cantrip",n:1,cls:"Druid",slv:1,title:"Level 1 Druid spell (always prepared)"}]}]);
/* Vagabond */
add("Eagle Banner",[{l:6,n:"Vantage Point",mv:{climb:"speed"}}]);
add("Jolly Roger",[{l:3,n:"Scallywag",mv:{swim:"speed"}}]);
add("Mage Brand",[
 {l:3,n:"Spellbranding",spCls:"@sub:CHA",pick:[{k:"c",t:"cantrip",n:2,cls:"Sorcerer",title:"Sorcerer cantrips"}]},
 {l:10,n:"Spellbranding (level 10 cantrip)",spCls:"@sub:CHA",pick:[{k:"c10",t:"cantrip",n:1,cls:"Sorcerer",title:"Extra Sorcerer cantrip"}]}]);
/* Warden */
add("Drake-Blooded",[
 {l:3,n:"Spellcasting",spCls:"@sub:CHA",pick:[{k:"c",t:"cantrip",n:2,cls:"Sorcerer",title:"Sorcerer cantrips"}]},
 {l:10,n:"Spellcasting (level 10 cantrip)",spCls:"@sub:CHA",pick:[{k:"c10",t:"cantrip",n:1,cls:"Sorcerer",title:"Extra Sorcerer cantrip"}]}]);
/* Warmage */
add("House of Bishops",[{l:3,n:"Arcane Study",pick:[{k:"sk",t:"skills",n:2,from:["Arcana","History","Investigation","Medicine","Religion"],title:"Arcane Study skills"}]}]);
add("House of Knights",[{l:7,n:"Fighting Style",fsPick:1}]);
add("House of Pawns",[{l:10,n:"Multidiscipline",saveBonusNp:"halfPb"}]);
add("House of Rooks",[{l:3,n:"Arcane Acrobat",chkBonus:[["DEX","INT"]],min:1,pick:[{k:"sk",t:"skills",n:1,from:["Acrobatics","Sleight of Hand","Stealth"],title:"Arcane Acrobat skill"}]}]);
/* Wizard */
add("Materializer",[{l:3,n:"Arcane Artisan",spCls:"Wizard",spells:[[3,"Mending"]],pick:[{k:"t",t:"tool",n:3,cats:["art"],title:"Artisan's Tools"}]}]);
add("Spellhacker",[{l:6,n:"Counter-Hack",spCls:"Wizard",spells:[[6,"Counterspell"]]}]);
add("Universalist",[{l:3,n:"Multidisciplinary Scholar",pick:[{k:"x",t:"exp",n:1,from:["Arcana","History","Investigation","Medicine","Nature","Religion"],title:"Expertise (another Scholar skill)"}]}]);
})();
