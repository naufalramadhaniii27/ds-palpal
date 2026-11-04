/* fx batch L12: fixes for ledger verdicts MISS, MISS_TOGGLE and MISMATCH, shards 32 to 35 (subclasses Necromancer to Warmage).
   Registry: window.GX.sub["<Subclass>"]. Entry l = class level. Schema: SOURCE-NOTES.md, "fx schema", "fx engine v4" and "fx batch L12".
   Every value was re-read in the feature text (SUB_FULL). Differences from the ledger specs are listed in reports/ledger-skipped-L12.md.
   MISMATCH rows are overridden here by changing the global rows (AUTO, LU_X) that the source files filled, so no source file is edited for them. */
(function(){
var G=window.GX=window.GX||{};var S=G.sub=G.sub||{};
function add(k,list){S[k]=(S[k]||[]).concat(list)}
var BPS=["Bludgeoning","Piercing","Slashing"];
window.THIRD_SUBS=window.THIRD_SUBS||{};
function lux(owner,n,fn){if(typeof LU_X==="undefined")return;LU_X.forEach(function(e){if(e.src==="sub"&&e.owner===owner&&e.n===n)fn(e)})}
function sk(k){return "gx-"+k}
/* ---------- Necromancer ---------- */
add("Reanimator",[{l:20,n:"Patchwork Golem (Gruesome Physicality, Damage Resistance)",abSet:[["STR",20],["DEX",20],["CON",20]],res:BPS}]);
/* ---------- Paladin ---------- */
add("Oath of Devotion",[{l:7,n:"Aura of Devotion",defs:[["Immunity","Charmed condition (you and your allies, while inside your Aura of Protection)"]]}]);
add("Oath of the Annihilator",[{l:7,n:"Aura of Inevitability",defs:[["Immunity","Frightened condition (you and allies within 10 ft, 30 ft at level 18)"]]}]);
add("Oath of the Giving Grave",[
 {l:7,n:"Aura of the Unrepentant",defs:[["Note","While conscious, you and allies within 10 ft (30 ft at level 18) cannot be turned"]]},
 {l:11,n:"Improved Unholy Smite",atkDice:[{when:"melee",d:"1d8",t:"Necrotic",note:"Melee weapon hits"}]},
 {l:20,n:"Undying Sentinel",advOn:["saving throws against spells and other magical effects"]}]);
add("Oath of the Sun",[{l:15,n:"Incandescent Strikes",defs:[["Note","Radiant Strikes extra damage is 1d10 Radiant instead of 1d8"]]}]);
/* ---------- Ranger ---------- */
add("Fey Wanderer (2014)",[{l:3,n:"Otherworldly Glamour",chkBonus:[["CHA","WIS"]],min:1}]);
add("Fey Wanderer",[{l:3,n:"Otherworldly Glamour",chkBonus:[["CHA","WIS"]],min:1}]);
add("Gloom Stalker",[{l:3,n:"Umbral Sight",darkNone:60,darkHave:{add:60}}]);
add("Green Reaper",[{l:3,n:"Toxic Tradecraft",tools:["Poisoner's Kit"],toolExpert:["Poisoner's Kit"]}]);
add("Hollow Warden",[{l:7,n:"Hungering Might",saveBonusAb:[["CON","WIS"]],min:1}]);
add("Hunter (2014)",[{l:7,n:"Steel Will",when:{key:"p7hunt14b",val:"Steel Will"},advOn:["saves against being Frightened"]}]);
add("Primordial Archer",[{l:3,n:"Herbal Lore",tools:["Herbalism Kit"]}].concat(["Acid","Cold","Fire","Lightning","Thunder"].map(function(t){return {l:7,n:"Weave the Elements ("+t+")",when:{key:"pa_weave",val:t},res:[t]}})));
add("Vampire Slayer",[{l:7,n:"Defensive Tactics",pick:[{k:"dt",t:"multi",n:1,yc:1,title:"Defensive Tactics",list:[["Escape the Horde","Opportunity Attacks against you have Disadvantage."],["Multiattack Defense","After a creature hits you, +4 AC against its later attacks this turn."],["Steel Will","Advantage on saves against being Frightened."],["Ranger's Resilience","Advantage on saves against paralysis and effects that lower your Hit Point maximum."]]}]},
 {l:7,n:"Steel Will",when:{key:sk("dt-sub-Vampire Slayer"),val:"Steel Will"},advOn:["saves against being Frightened"]},
 {l:7,n:"Ranger's Resilience",when:{key:sk("dt-sub-Vampire Slayer"),val:"Ranger's Resilience"},advOn:["saves against paralysis and effects that lower your Hit Point maximum"]}]);
add("Winter Trapper",[{l:7,n:"Arctic Predator (Sure-Footed)",def:["Immunity","Prone condition unless you are also Incapacitated"]}]);
add("Big Game Hunter",[]);
/* ---------- Rogue ---------- */
add("Arcane Trickster",[{l:3,n:"Spellcasting",spCls:"@sub:INT",spells:[[3,"Mage Hand"]]}]);
add("Assassin",[{l:3,n:"Assassinate",initAdv:true}]);
add("Highway Rider",[{l:3,n:"Trusty Mount",spCls:"@sub:INT",spells:[[3,"Find Steed"]]}]);
add("Infiltrator",[{l:3,n:"Codebreaker",skillPE:["Data"]}]);
add("Phantom",[{l:9,n:"Tokens of the Departed",lu:{n:"Soul Trinkets",max:[0,0,0,0,0,0,0,0,2,2,2,2,3,3,3,3,4,4,4,4],reset:"long",tag:"Refill to 2 after a Long Rest if you have fewer"}}]);
add("Runetagger",[{l:3,n:"Impressionist",tools:["Calligrapher's Supplies","Painter's Supplies"],toolExpert:["Calligrapher's Supplies","Painter's Supplies"]},
 {l:9,n:"Escape Artist",advOn:["ability checks and saves to avoid or end the Grappled and Restrained conditions"]}]);
window.THIRD_SUBS["Sanguine Thief"]={list:"Wizard",ab:"INT",cant:3};
add("Sanguine Thief",[{l:3,n:"Stolen Power",lu:{n:"Sangromancy Dice",max:{f:"(lvl+1)/2"},reset:"long",die:"d8",tag:"One d8 per Sneak Attack die"}}]);
/* Scout walking Speed +10 is already built in (12-logic-export-to-sheet.js); only the Climb and Swim part is added here */
add("Scout",[{l:9,n:"Superior Mobility (Climb, Swim)",speedAddIf:{climb:10,swim:10}}]);
add("Soulknife (2014)",[{l:3,n:"Psychic Whispers",lu:{n:"Psychic Whispers: free use",max:1,reset:"long"}}]);
/* Swashbuckler Rakish Audacity Initiative is already built in (12-logic-export-to-sheet.js, v35): ledger false positive */
lux("Misfortune Bringer","Jinx Points",function(e){e.max=[0,0,4,4,4,4,4,4,4,4,4,4,6,6,6,6,6,6,6,6]});
lux("Misfortune Bringer","Steal Luck",function(e){e.max=[0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0]});
add("Misfortune Bringer",[{l:17,n:"Improved Steal Luck",lu:{n:"Steal Luck (Improved)",max:3,reset:"long",tag:"Reaction"}}]);
/* ---------- Sorcerer ---------- */
add("Aberrant Sorcery",[{l:6,n:"Psychic Defenses",res:["Psychic"],advOn:["saves to avoid or end the Charmed or Frightened condition"]}]);
add("Apocalypse Sorcery",[{l:6,n:"Bear Witness",toggle:{id:"innate-sorcery",label:"Innate Sorcery active"},res:["Force"],condImm:["Frightened"]}]);
var SCH=[["Abjuration","Alarm"],["Conjuration","Tenser's Floating Disk"],["Divination","Identify"],["Enchantment","Tasha's Hideous Laughter"],["Evocation","Burning Hands"],["Illusion","Illusory Script"],["Necromancy","False Life"],["Transmutation","Feather Fall"]];
add("Aristocratic",SCH.map(function(c){return {l:3,n:"School Mastery ("+c[0]+")",when:{key:"aris_school",val:c[0]},spCls:"@sub:CHA",spells:[[3,c[1]]]}}).concat([{l:3,n:"School Mastery",lu:{n:"School Mastery: free cast",max:1,reset:"long"}}]));
add("Divine Soul",[{l:3,n:"Divine Magic",spListAdd:{cls:"Sorcerer",from:"Cleric"}}]);
add("Draconic Sorcery",["Acid","Cold","Fire","Lightning","Poison"].map(function(t){return {l:6,n:"Elemental Affinity ("+t+")",when:{key:"p6opt",val:t},res:[t]}}));
(function(){var EE="ee_heritage";
 add("Elemental Essence",[{l:6,n:"Infuse Elements (Earth)",when:{key:EE,val:"Earth"},res:["Bludgeoning"]},{l:6,n:"Infuse Elements (Fire)",when:{key:EE,val:"Fire"},res:["Fire"]},{l:6,n:"Infuse Elements (Water)",when:{key:EE,val:"Water"},res:["Cold"]},
  {l:6,n:"Infuse Elements (Air)",when:{key:EE,val:"Air"},pick:[{k:"air",t:"multi",n:1,yc:1,title:"Infuse Elements (Air): damage type",list:[["Lightning",""],["Thunder",""]]}]},
  {l:6,n:"Infuse Elements (Air, Lightning)",when:{key:sk("air-sub-Elemental Essence"),val:"Lightning"},res:["Lightning"]},{l:6,n:"Infuse Elements (Air, Thunder)",when:{key:sk("air-sub-Elemental Essence"),val:"Thunder"},res:["Thunder"]}])})();
add("Frost Sorcery",[{l:18,n:"Frozen Soul (Wall of Ice)",spCls:"@sub:CHA",spells:[[18,"Wall of Ice"]]}]);
add("Haunted Sorcery",[{l:3,n:"Phantom Companion",spCls:"@sub:CHA",spells:[[3,"Find Familiar"]]},{l:3,n:"Sixth Sense",init:"CHA"}]);
add("Lunar Sorcery",[{l:6,n:"Waxing and Waning",lu:{n:"Waxing and Waning: free spells",max:3,reset:"long",tag:"One 1st-level spell per lunar phase, current phase only"}},
 {l:14,n:"Lunar Empowerment (Crescent Moon)",when:{key:"p3opt",val:"Crescent Moon"},res:["Necrotic","Radiant"]}]);
add("Nanite Magic",[{l:3,n:"Techno-Intuition",langs:["Machine Code"],spCls:"@sub:CHA",spells:[[3,"Technomancy"]],skillProf:["Data","Technology"],skillBonus:[["Data","CHA",1],["Technology","CHA",1]]}]);
add("Runechild",[{l:3,n:"Essence Runes",lu:{n:"Essence Runes",max:{f:"lvl+1"},reset:"long",tag:"Charged runes power features, back to inert after a rest"}}]);
add("Shadow Bloodline",[{l:6,n:"Dark Illusions",advOn:["saves against Illusion magic"]}]);
add("Storm Sorcery",[{l:18,n:"Wind Soul (Fly Speed)",mv:{fly:60}}]);
add("Wretched Bloodline Sorcery",[
 {l:3,n:"Wretched Curse (Hulking)",when:{key:"wcurse",val:"Hulking"},hpFlat:1,hpLvl:1,carryBump:true},
 {l:3,n:"Wretched Curse (Nocturnal)",when:{key:"wcurse",val:"Nocturnal"},darkTo:120,defs:[["Note","You see normally in Dim Light and Darkness, magical or not, within 120 ft"]]},
 {l:3,n:"Wretched Curse (Plaguebearer)",when:{key:"wcurse",val:"Plaguebearer"},res:["Necrotic"],condImm:["Poisoned"]}]);
/* ---------- Summoner ---------- */
function ex(sub,school){add(sub,[{l:3,n:school+" Expert",spListAdd:{cls:"Summoner",from:"Wizard",school:school}}])}
ex("Bond of the Aberrant Psion","Divination");ex("Bond of the Dragon Herald","Evocation");ex("Bond of the Faerie Trickster","Enchantment");ex("Bond of the Grave Caller","Necromancy");ex("Bond of the Mirror Mage","Illusion");ex("Bond of the Monster Shaper","Transmutation");ex("Bond of the Spirit Animal","Abjuration");
add("Bond of the Aberrant Psion",[{l:3,n:"Psychic Spells",spells:[[3,"Dissonant Whispers,Sleep"],[5,"Detect Thoughts,Suggestion"],[7,"Summon Aberration"],[9,"Hunger of Hadar,Sending"],[13,"Confusion"],[17,"Synaptic Static,Telekinesis"]]}]);
add("Bond of the Living Armament",[{l:3,n:"Armament Spells",spells:[[3,"Magic Missile,Shield"],[5,"Cloud of Daggers,Magic Weapon"],[7,"Summon Construct"],[9,"Elemental Weapon,Conjure Barrage"],[13,"Death Ward"],[17,"Animate Objects,Steel Wind Strike"]]},{l:14,n:"Autopilot",spells:[[14,"Contingency"]]}]);
add("Bond of the Mirror Mage",[{l:3,n:"Mirror Spells",spells:[[3,"Disguise Self,Silent Image"],[5,"Mirror Image,Misty Step"],[9,"Counterspell,Major Image"],[13,"Dimension Door,Phantasmal Killer"],[17,"Circle of Power,Wall of Force"]]}]);
add("Bond of the Monster Shaper",[{l:3,n:"Monstrous Spells",spells:[[3,"Expeditious Retreat,Jump"],[5,"Alter Self,Enlarge/Reduce,Summon Monstrosity"],[9,"Haste"],[13,"Freedom of Movement,Stoneskin"],[17,"Modify Memory,Reincarnate"]]}]);
add("Bond of the Shambling Plant",[{l:3,n:"Plant Spells",spells:[[3,"Entangle,Goodberry"],[5,"Barkskin,Spike Growth,Summon Plant (Summoner class)"],[9,"Plant Growth"],[13,"Conjure Woodland Beings,Grasping Vine"],[17,"Awaken,Tree Stride"]]},{l:14,n:"Root Network",spells:[[14,"Transport via Plants"]]}]);
add("Bond of the Spirit Animal",[{l:3,n:"Spirit Animal Spells",spells:[[3,"Protection from Evil and Good,Shield,Summon Beast"],[5,"Pass without Trace"],[9,"Conjure Animals,Dispel Magic"],[13,"Conjure Woodland Beings,Polymorph"],[17,"Antilife Shell,Greater Restoration"]]}]);
add("Bond of the Wrathful Giant",[{l:3,n:"Giant Spells",spells:[[3,"Jump,Longstrider"],[5,"Enhance Ability,Enlarge/Reduce"],[9,"Conjure Barrage,Glyph of Warding"],[11,"Summon Giant"],[13,"Death Ward,Freedom of Movement"],[17,"Bigby's Hand"]]}]);
add("Bond of the Fiendish Chain",[{l:3,n:"Honorary Fiend",pick:[{k:"hf",t:"multi",n:1,title:"Honorary Fiend: language",list:[["Infernal",""],["Abyssal",""]]}]},
 {l:3,n:"Honorary Fiend (Infernal)",when:{key:sk("hf-sub-Bond of the Fiendish Chain"),val:"Infernal"},langs:["Infernal"]},
 {l:3,n:"Honorary Fiend (Abyssal)",when:{key:sk("hf-sub-Bond of the Fiendish Chain"),val:"Abyssal"},langs:["Abyssal"]},
 {l:10,n:"Condition Resilience",advOn:["saves to avoid or end the Charmed and Frightened conditions"]}]);
add("Bond of the Grave Caller",[{l:10,n:"Soul of Death (Poisoned saves)",advOn:["saves to avoid or end the Poisoned condition"]}]);
add("Bond of the Guardian Angel",[{l:3,n:"Exalted Presence",advOn:["Wisdom (Insight) checks to tell whether a creature is lying"],pick:[{k:"ep",t:"multi",n:1,title:"Exalted Presence: skill",list:[["Intimidation",""],["Persuasion",""]]}]},
 {l:3,n:"Exalted Presence (Intimidation)",when:{key:sk("ep-sub-Bond of the Guardian Angel"),val:"Intimidation"},skillPE:["Intimidation"]},
 {l:3,n:"Exalted Presence (Persuasion)",when:{key:sk("ep-sub-Bond of the Guardian Angel"),val:"Persuasion"},skillPE:["Persuasion"]}]);
/* ---------- Vagabond ---------- */
var MAN=function(){var l=S["Experiment X"]&&S["Experiment X"].filter(function(e){return e.n==="Bloody Rampage"})[0];return l?l.pick[0].list:[["Challenge",""]]};
function mp(sub,l,n,k,title){add(sub,[{l:l,n:n,pick:[{k:k,t:"multi",n:1,yc:1,title:title,list:MAN()}]}])}
add("Adrenaline Junkie",[{l:6,n:"Live Fast (Tuck and Roll)",def:["Immunity","Falling damage of 60 feet or less"]}]);
add("Daggermark",[{l:3,n:"Covert Tactics",skillProf:["Sleight of Hand","Stealth"],init:"CHA",min:1,defs:[["Note","Quick Hide: you can take the Hide action as a Bonus Action"]]}]);
add("Digital Nomad",[{l:3,n:"Technophile",langs:["Machine Code"],spCls:"@sub:INT",spells:[[3,"Technomancy"]],skillProf:["Data"],skillExpert:["Data"]}]);
add("Knight Errant",["Animal Handling","History","Insight","Persuasion"].map(function(s){return {l:3,n:"Chivalrous Oath ("+s+")",when:{key:"knighterrant_skills",val:s},skillProf:[s]}}).concat([{l:3,n:"Chivalrous Oath",advOn:["saves to avoid or end the Charmed or Frightened condition"]}]));
mp("Knight Errant",3,"Knight's Challenge","challenge","Challenge, or another maneuver if you know it");
mp("Plague Doctor",14,"Bloodletting","wounding","Wounding Strike, or another maneuver if you know it");
mp("Pugilist",6,"Intimidating Blow","horrific","Horrific Strike, or another maneuver if you know it");
add("Pugilist",[{l:3,n:"Hand-to-Hand (Unarmored Defense)",acDexAb:"CON",cond:"noBody"},{l:3,n:"Hand-to-Hand",unarmed:{die:[[3,"1d6"],[5,"1d8"],[11,"1d10"],[17,"1d12"]]},defs:[["Note","From level 6 your Unarmed Strike can deal Force damage. Brute Force: the first creature you hit with an Unarmed Strike each turn takes one extra roll of your Unarmed Strike die"]]}]);
add("Rōnin",["Deception","Intimidation"].map(function(s){return {l:3,n:"Infamy ("+s+")",when:{key:"ronin_infamy",val:s},skillProf:[s],skillExpert:[s]}}));
add("Siegeball Jersey",[{l:3,n:"Sports Fanatic",skillProf:["Athletics"],skillBonus:[["Athletics","CHA",1]]}]);
/* ---------- Warden ---------- */
function wpick(sub,lv,n,skills,extra){var K="sk";add(sub,[Object.assign({l:lv,n:n,pick:[{k:K,t:"skills",n:1,from:skills,title:n+": skill"}]},extra||{})].concat(skills.map(function(s){return {l:lv,n:n+" ("+s+")",when:{key:sk(K+"-sub-"+sub),val:s},skillBonus:[[s,"CON",1]]}})))}
wpick("Beastblood Guardian",3,"Primal Warrior",["Animal Handling","Nature","Survival"]);
add("Beastblood Guardian",[{l:6,n:"Hunting Grounds",mv:{climb:"speed",swim:"speed"}}]);
wpick("Diabolist",3,"Devil's Advocate",["Deception","Intimidation","Persuasion"]);
wpick("Verdant Protector",3,"Cultivator",["Nature","Stealth","Survival"]);
add("Godsworn",[{l:3,n:"Divine Mandate",spCls:"@sub:WIS",pick:[{k:"c",t:"cantrip",n:2,cls:"Cleric",title:"Two Cleric cantrips"}],skillBonus:[["Religion","CON",1]]}]);
add("Nightgaunt",[{l:3,n:"Grave Keeper",darkNone:60,darkHave:{add:60}}]);
add("Steel Shepherd",[{l:3,n:"Gearhead",langs:["Machine Code"],spCls:"@sub:WIS",spells:[[3,"Technomancy"]],skillProf:["Technology"],skillBonus:[["Technology","CON",1]]}]);
add("Stoneheart Defender",[{l:6,n:"Roots of Rock",defs:[["Immunity","Prone condition (unless you choose to have it or you are Incapacitated)"],["Note","Immovable: you cannot be pushed, pulled, or teleported against your will"]]}]);
add("Storm Sentinel",[{l:3,n:"Seafarer",mv:{swim:"speed"},pick:[{k:"st",t:"multi",n:1,title:"Storm Resistance",list:[["Lightning",""],["Thunder",""]]}]},
 {l:3,n:"Seafarer (Lightning)",when:{key:sk("st-sub-Storm Sentinel"),val:"Lightning"},res:["Lightning"]},{l:3,n:"Seafarer (Thunder)",when:{key:sk("st-sub-Storm Sentinel"),val:"Thunder"},res:["Thunder"]}]);
add("Witchbane Hunter",[{l:6,n:"Otherworldly Eye",sense:[["See Invisibility",0,"You see creatures and objects that have the Invisible condition, and into the Ethereal Plane"]]}]);
window.THIRD_SUBS["Drake-Blooded"]={list:"Sorcerer",ab:"CHA",cant:2};
/* ---------- Warlock ---------- */
if(typeof AUTO!=="undefined"){AUTO["Astral Griffon Patron"]=[[3,"Identify,Magic Missile,Locate Object,Rope Trick"],[5,"Blink,Clairvoyance"],[7,"Mordenkainen's Private Sanctum,Leomund's Secret Chest"],[9,"Legend Lore,Passwall"]];
 ["The Frozen One","The Genie Lord","The Sibyl"].forEach(function(k){delete AUTO[k]})}
function xl(sub,sp,l){add(sub,[{l:l||3,n:"Expanded Spell List",spListAdd:{cls:"Warlock",spells:sp.split(", ")}}])}
xl("The Archfey (2014)","Faerie Fire, Sleep, Calm Emotions, Phantasmal Force, Blink, Plant Growth, Dominate Beast, Greater Invisibility, Dominate Person, Seeming");
xl("The Celestial","Cure Wounds, Guiding Bolt, Flaming Sphere, Lesser Restoration, Daylight, Revivify, Guardian of Faith, Wall of Fire, Flame Strike, Greater Restoration");
xl("The Fathomless","Create or Destroy Water, Thunderwave, Gust of Wind, Silence, Lightning Bolt, Sleet Storm, Control Water, Summon Elemental, Bigby's Hand, Cone of Cold");
xl("The Fiend (2014)","Burning Hands, Command, Blindness/Deafness, Scorching Ray, Fireball, Stinking Cloud, Fire Shield, Wall of Fire, Flame Strike, Hallow");
xl("The Frozen One","Create or Destroy Water, Fog Cloud, Blur, Ice Hammer, Protection from Energy, Sleet Storm, Ice Storm, Wintry Glide, Cone of Cold, Ice Fortress");
xl("The Genie Lord","Chromatic Orb, Thunderwave, Gust of Wind, Sleet Storm, Protection from Energy, Water Breathing, Conjure Minor Elementals, Fire Shield, Creation, Wall of Stone");
xl("The Great Machine","Pendulum, Tireless (Deep Magic), Armored Heart, Lock Armor, Thousand Darts, Winding Key, Legend Lore, Steam Blast, Animate Objects, Mechanical Union");
xl("The Great Old One (2014)","Dissonant Whispers, Tasha's Hideous Laughter, Detect Thoughts, Phantasmal Force, Clairvoyance, Sending, Dominate Beast, Evard's Black Tentacles, Dominate Person, Telekinesis");
xl("The Hexblade","Shield, Wrathful Smite, Blur, Branding Smite, Blink, Elemental Weapon, Phantasmal Killer, Staggering Smite, Banishing Smite, Cone of Cold");
xl("The Predator","Hunter's Mark, Jump, Alter Self, Ambush Prey, Blink, Slow, Dominate Beast, Freedom of Movement, Contagion, Mislead");
xl("The Sibyl","Alarm, Seer's Reaction, Augury, Blindness/Deafness, Bestow Curse, Clairvoyance, Confusion, Divination, Eidetic Memory, Legend Lore");
xl("The Undead","Bane, False Life, Blindness/Deafness, Phantasmal Force, Phantom Steed, Speak with Dead, Death Ward, Greater Invisibility, Antilife Shell, Cloudkill");
xl("The Undying","False Life, Ray of Sickness, Blindness/Deafness, Silence, Feign Death, Speak with Dead, Aura of Life, Death Ward, Contagion, Legend Lore");
add("The Genie",[{l:3,n:"Expanded Spell List",spListAdd:{cls:"Warlock",spells:["Detect Evil and Good","Phantasmal Force","Create Food and Water","Phantasmal Killer","Creation","Wish"]}}].concat([
 ["Dao","Sanctuary, Spike Growth, Meld into Stone, Stone Shape, Wall of Stone"],["Djinni","Thunderwave, Gust of Wind, Wind Wall, Greater Invisibility, Seeming"],["Efreeti","Burning Hands, Scorching Ray, Fireball, Fire Shield, Flame Strike"],["Marid","Fog Cloud, Blur, Sleet Storm, Control Water, Cone of Cold"]].map(function(k){return {l:3,n:"Expanded Spell List ("+k[0]+")",when:{key:"p3opt",val:k[0]},spListAdd:{cls:"Warlock",spells:k[1].split(", ")}}})));
add("The Fathomless",[{l:3,n:"Gift of the Sea (Swim Speed)",mv:{swim:40},defs:[["Note","You can breathe underwater"]]}]);
add("Great Old One Patron",[{l:10,n:"Eldritch Hex",spCls:"@sub:CHA",spells:[[10,"Hex"]]}]);
add("The First Vampire Patron",[{l:3,n:"Nocturnal Predator (Darkvision)",darkNone:60,darkHave:{add:60}}]);
add("The Genie Lord",[{l:3,n:"Genie Lord's Favor",lu:{n:"Genie Lord's Gem",max:{f:"2*lvl+mod:CHA"},reset:"long",pool:1,tag:"Elemental damage absorbed, empties on a Long Rest"}}]);
add("The Parasite Patron",[{l:10,n:"Spawn Pawn",spCls:"@sub:CHA",spells:[[10,"Dominate Person"]]},
 {l:6,n:"Symbiotic Sentinel",initAdv:true,advOn:["saves to avoid or end the Charmed and Frightened conditions"],defs:[["Note","You cannot be surprised"]]}]);
add("The Sibyl",[{l:10,n:"Whispered Warnings",acAdd:"CHA",min:1,cond:"lightNone"}]);
})();
