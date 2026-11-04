/* fx data, ledger bin L1 (shards 00 to 03): fixes for the MISS, MISS_TOGGLE and MISMATCH verdicts of the ledger review.
   Registry window.GX (fx engine v4, SOURCE-NOTES.md "fx schema" and "fx engine v4"). Every rule below was read again in the feature text before it was written.
   Where the ledger spec named a field that does not exist, or said "not carried" for something the sheet already counts, the text and the real sheet output decide.
   Not done here (engine has no field): see reports/ledger-skipped-L1.md. Section 1 classes, section 2 feats, section 3 items. */
window.GX=window.GX||{};window.FXO=window.FXO||{};
GX.cls=GX.cls||{};GX.feat=GX.feat||{};GX.item=GX.item||{};
(function(){
 var A3=["INT","WIS","CHA"].map(function(k){return [{INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"}[k],""]});
 function add(kind,name,list){GX[kind][name]=(GX[kind][name]||[]).concat(list)}
 var ALLSAVE=["STR","DEX","CON","INT","WIS","CHA"];

 /* ===== 1. Classes ===== */
 /* Bard 20 Words of Creation: Power Word Heal and Power Word Kill are always prepared */
 add("cls","Bard",[{n:"Words of Creation",l:20,spells:[[20,"Power Word Heal,Power Word Kill"]],spCls:"Bard"}]);

 /* Cleric. Blessed Strikes (pick p7opt): Divine Strike 1d8 Necrotic or Radiant once per turn, 2d8 with Improved (14); Potent Spellcasting adds Wisdom to Cleric cantrip damage.
    Divine Order (pick p1opt): Thaumaturge adds the Wisdom modifier (minimum +1) to Arcana and Religion checks */
 add("cls","Cleric",[
  {n:"Blessed Strikes",l:7,when:{key:"p7opt",val:"Divine Strike"},atkDice:[{when:"weapon",d:"1d8",t:"Necrotic or Radiant",note:"Divine Strike, once per turn"}]},
  {n:"Improved Blessed Strikes",l:14,when:{key:"p7opt",val:"Divine Strike"},atkDice:[{when:"weapon",d:"1d8",t:"Necrotic or Radiant",note:"Improved Divine Strike (a second 1d8, 2d8 in all), once per turn"}]},
  {n:"Blessed Strikes",l:7,when:{key:"p7opt",val:"Potent Spellcasting"},atkBonus:[{when:"spell",dmg:"WIS",note:"Potent Spellcasting: Wisdom modifier added to Cleric cantrip damage."}]},
  {n:"Improved Blessed Strikes",l:14,when:{key:"p7opt",val:"Potent Spellcasting"},defs:[["Note","Potent Spellcasting: when a Cleric cantrip damages a creature, you or a creature within 60 ft gains Temporary Hit Points equal to twice your Wisdom modifier"]]},
  {n:"Divine Order",l:1,when:{key:"p1opt",val:"Thaumaturge"},skillBonus:[["Arcana","WIS"],["Religion","WIS"]],min:1}
 ]);

 /* Druid. Elemental Fury (pick p7opt): Primal Strike 1d8 (2d8 with Improved, 15), Potent Spellcasting adds Wisdom to Druid cantrip damage and, improved, +300 ft range.
    Primal Order (pick p1opt): Magician adds the Wisdom modifier (minimum +1) to Arcana and Nature checks. Druidic: the language and Speak with Animals */
 add("cls","Druid",[
  {n:"Druidic",l:1,langs:["Druidic"],spells:[[1,"Speak with Animals"]],spCls:"Druid"},
  {n:"Elemental Fury",l:7,when:{key:"p7opt",val:"Primal Strike"},atkDice:[{when:"weapon",d:"1d8",t:"Cold, Fire, Lightning or Thunder",note:"Primal Strike, once per turn"}]},
  {n:"Improved Elemental Fury",l:15,when:{key:"p7opt",val:"Primal Strike"},atkDice:[{when:"weapon",d:"1d8",t:"Cold, Fire, Lightning or Thunder",note:"Improved Primal Strike (a second 1d8, 2d8 in all), once per turn"}]},
  {n:"Elemental Fury",l:7,when:{key:"p7opt",val:"Potent Spellcasting"},atkBonus:[{when:"spell",dmg:"WIS",note:"Potent Spellcasting: Wisdom modifier added to Druid cantrip damage."}]},
  {n:"Improved Elemental Fury",l:15,when:{key:"p7opt",val:"Potent Spellcasting"},defs:[["Note","Potent Spellcasting: Druid cantrips with a range of 10 feet or more gain 300 feet of range"]]},
  {n:"Primal Order",l:1,when:{key:"p1opt",val:"Magician"},skillBonus:[["Arcana","WIS"],["Nature","WIS"]],min:1}
 ]);

 /* Craftsman (VSS24). Eye for Quality and Fabrication: free casts with Intelligence (Craftsman has no casting ability of its own, so the ability is fixed with @sub) */
 add("cls","Craftsman",[
  {n:"Eye for Quality",l:9,spells:[[9,"Identify,Locate Object"]],spCls:"@sub:INT"},
  {n:"Fabrication",l:15,spells:[[15,"Fabricate"]],spCls:"@sub:INT"}
 ]);

 /* Dancer (VSS24): Unarmored Defense 10 + Dex + Cha with no armor and no Shield. Dervish Fighting: Finesse for 1d4 and 1d6 weapons (note on the weapon rows, the sheet cannot tell which weapons qualify) */
 add("cls","Dancer",[
  {n:"Unarmored Defense",l:1,acBase:[10,"full","CHA"],cond:"noArmor"},
  {n:"Dervish Fighting",l:1,atkAb:{kind:"weapon",ab:"DEX",opt:1,note:"Dervish Fighting: a weapon that deals 1d4 or 1d6 has Finesse for you, so you can use Dexterity instead of Strength"}}
 ]);

 /* Martyr: immune to Paralyzed, Petrified and Stunned */
 add("cls","Martyr",[{n:"March Unto Destiny",l:15,condImm:["Paralyzed","Petrified","Stunned"]}]);

 /* Monster Hunter: Expert Strike adds Intelligence to attack and damage of weapons and Unarmed Strikes.
    Monster Grimoire (pick monsterhunter0_1/_6/_13): the language of each type. Aberration, Fiend, Ooze and Undead give a choice of two languages, so those four are a pick */
 var MG={"Beast":"Sylvan","Celestial":"Celestial","Construct":"Draconic","Dragon":"Draconic","Elemental":"Primordial","Fey":"Sylvan","Giant":"Giant","Monstrosity":"Deep Speech","Plant":"Sylvan"};
 var MGC={"Aberration":["Deep Speech","Undercommon"],"Fiend":["Abyssal","Infernal"],"Ooze":["Deep Speech","Undercommon"],"Undead":["Abyssal","Infernal"]};
 var mgl=[{n:"Expert Strike",l:5,atkBonus:[{when:["weapon","unarmed"],atk:"INT",dmg:"INT"}]}];
 ["monsterhunter0_1","monsterhunter0_6","monsterhunter0_13"].forEach(function(key,i){
  Object.keys(MG).forEach(function(t){mgl.push({n:"Monster Grimoire",l:[1,6,13][i],when:{key:key,val:t},langs:[MG[t]]})});
  Object.keys(MGC).forEach(function(t){mgl.push({n:"Monster Grimoire",l:[1,6,13][i],when:{key:key,val:t},pick:[{k:"lg"+i+t.charAt(0),t:"multi",n:1,title:t+" language",list:MGC[t].map(function(x){return [x,""]})}]});
   MGC[t].forEach(function(lg){mgl.push({n:"Monster Grimoire",l:[1,6,13][i],when:{key:"gx-lg"+i+t.charAt(0)+"-cls-Monster Hunter",val:lg},langs:[lg]})})})});
 add("cls","Monster Hunter",mgl);

 /* Necromancer Lichdom: only after the 30 day rite, so a toggle (off by default) */
 add("cls","Necromancer",[{n:"Lichdom",l:20,toggle:{id:"lichdom",label:"Lichdom rite done",default:false},sense:[["Truesight",120,"Truesight 120 ft from Lichdom"]],imm:["Necrotic","Poison"],condImm:["Exhaustion","Poisoned"]}]);

 /* Paladin 11 Radiant Strikes: +1d8 Radiant on Melee weapon and Unarmed Strike hits */
 add("cls","Paladin",[{n:"Radiant Strikes",l:11,atkDice:[{when:"melee",d:"1d8",t:"Radiant",note:"Melee weapon"},{when:"unarmed",d:"1d8",t:"Radiant"}]}]);

 /* Ranger 18 Feral Senses: Blindsight 30 ft */
 add("cls","Ranger",[{n:"Feral Senses",l:18,senseAdd:[["Blindsight",30,"Blindsight 30 ft from Feral Senses"]]}]);

 /* Investigator. Supernatural Resolve: Advantage on saves against spells and other magical effects (lost while Incapacitated). (Enigma Arcane already has native limited-use rows, checked on the sheet, so nothing is added for it) */
 add("cls","Investigator",[
  {n:"Supernatural Resolve",l:18,advOn:["saves against spells and other magical effects (not while Incapacitated)"]}
 ]);

 /* Jaeger: Piercing Gaze gives Darkvision 60 (120 if you already have it); from level 7 it is permanent, Eternal Watch keeps the gaze on */
 add("cls","Jaeger",[{n:"Piercing Gaze",l:7,darkNone:60,darkHave:{to:120}}]);

 /* Warden 18 Sentinel's Soul, All-Seeing: Blindsight 30 ft (+30 if you already have it) */
 add("cls","Warden",[{n:"Sentinel's Soul",l:18,when:{key:"soul",val:"All-Seeing"},senseAdd:[["Blindsight",30,"Blindsight 30 ft from All-Seeing"]]}]);

 /* Vagabond Secret (pick vagabond0_1): the options that change the sheet. Faction Agent (skill, Expertise, tool, language), False Identity and Cursed stay text */
 var VK="vagabond0_1";
 add("cls","Vagabond",[
  {n:"Secret",when:{key:VK,val:"Avenger"},init:"CON",min:1,atkDice:[{when:"weapon",d:"1d8",t:"same type as the attack",note:"Avenger: against creatures you picked"},{when:"unarmed",d:"1d8",t:"same type as the attack"}]},
  {n:"Secret",when:{key:VK,val:"Dying"},saveNote:["Advantage on Death Saving Throws"]},
  {n:"Secret",when:{key:VK,val:"Fugitive"},speedAdd:5},
  {n:"Secret",when:{key:VK,val:"Heretic"},skillProf:["Arcana","Religion"],spCls:"@abpick",pick:[{k:"ab",t:"multi",n:1,title:"Spellcasting ability for the Warlock cantrips",list:A3},{k:"c",t:"cantrip",cls:"Warlock",n:2,title:"Two Warlock cantrips"}]},
  {n:"Secret",when:{key:VK,val:"Monstrous"},darkNone:60,darkHave:{add:60}},
  {n:"Secret",when:{key:VK,val:"Nobility"},skillProf:["History","Persuasion"]}
 ]);
 /* Warmage Arcane Initiation (pick warmage0_1): two cantrips and a skill. Self-Taught: the skill is a free choice */
 var WK="warmage0_1",WI=[["Adventurer","Mage Hand,Ray of Frost","Perception"],["Arcane Event","Acid Splash,Message","Insight"],["Circus Performer","Minor Illusion,Starry Wisp","Acrobatics"],["Mercenary","Mending,True Strike","Athletics"],["Self-Taught","Fire Bolt,Light",""],["Survivalist","Druidcraft,Shillelagh","Survival"],["Temple Initiate","Sacred Flame,Spare the Dying","Religion"],["Tower Apprentice","Prestidigitation,Shocking Grasp","Arcana"]];
 add("cls","Warmage",WI.map(function(r){var e={n:"Arcane Initiation",when:{key:WK,val:r[0]},spells:[[1,r[1]]],spCls:"Warmage"};if(r[2])e.skillProf=[r[2]];else e.pick=[{k:"sk",t:"skills",n:1,title:"Self-Taught skill"}];return e}));
 /* Witch's Curse (pick witch0_1): static results of each curse. Hollow and Infested are play-time only */
 var CK="witch0_1";
 add("cls","Witch",[
  {n:"Witch's Curse",when:{key:CK,val:"Burned"},res:["Fire"],spells:[[1,"Produce Flame"]],spCls:"Witch"},
  {n:"Witch's Curse",when:{key:CK,val:"Drowned"},mv:{swim:"speed"}},
  {n:"Witch's Curse",when:{key:CK,val:"Feral"},skillProf:["Survival"],acBase:[13,"full"],cond:"noBody"},
  {n:"Witch's Curse",when:{key:CK,val:"Hideous"},skillProf:["Intimidation"]},
  {n:"Witch's Curse",when:{key:CK,val:"Loveless"},condImm:["Charmed"]},
  {n:"Witch's Curse",when:{key:CK,val:"Possessed"},prepAdd:[[1,1],[3,2],[5,3]],spCls:"Witch"},
  {n:"Witch's Curse",when:{key:CK,val:"Starving"},res:["Poison"],advOn:["saves to avoid or end the Poisoned condition"]},
  {n:"Witch's Curse",when:{key:CK,val:"Visions"},init:"CHA",min:1},
  {n:"Witch's Curse",when:{key:CK,val:"Whispers"},defs:[["Note","Telepathy 60 ft"]]}
 ]);

 /* Summoner 3 Conjuration Expert: two extra slots for Conjuration spells only, as limited-use rows. Slot levels by Summoner level: 3-4 level 1 and 2, 5-6 2 and 3, 7-8 3 and 4, 9-10 4 and 5, 11-12 5 and 6, 13-14 6 and 7, 15-16 7 and 8, 17+ 8 and 9 */
 add("cls","Summoner",[{n:"Conjuration Expert",l:3,lu:[
  {n:"Conjuration Expert slot (lower)",max:1,reset:"long",tag:"Conjuration spells only. Level 1 at Summoner 3-4, then 2, 3, 4, 5, 6, 7, 8 at Summoner 5, 7, 9, 11, 13, 15, 17"},
  {n:"Conjuration Expert slot (higher)",max:1,reset:"long",tag:"Conjuration spells only. Level 2 at Summoner 3-4, then 3, 4, 5, 6, 7, 8, 9 at Summoner 5, 7, 9, 11, 13, 15, 17"}]}]);

 /* ===== 2. Feats ===== */
 function addF(n,list){add("feat",n,list)}
 var ELE={Air:"Lightning",Earth:"Bludgeoning",Fire:"Fire",Water:"Cold"};
 var ELIST=Object.keys(ELE).map(function(k){return [k,ELE[k]+" resistance"]});
 function eleRes(key,label,parentKey,parentVal){/* a second, third or final element: pick (shown while the boon is chosen) plus the Resistance of each element */
  var r=[{n:label,when:{key:parentKey,val:parentVal},pick:[{k:key,t:"multi",n:1,title:label+" element",list:ELIST}]}];
  Object.keys(ELE).forEach(function(e){r.push({n:label+" ("+e+")",when:{key:key,val:e},res:[ELE[e]]})});return r}
 var ASK=[["Strength",""],["Dexterity",""],["Constitution",""],["Intelligence",""],["Wisdom",""],["Charisma",""]];

 /* Unarmed Strike with Dexterity (Aberrant Spawn, Beastperson, Cyberfiend: "use Dexterity instead of Strength") */
 ["Aberrant Spawn","Beastperson","Cyberfiend"].forEach(function(n){addF(n,[{n:"Dexterity Unarmed Strike",atkAb:{kind:"unarmed",ab:"DEX"}}])});
 addF("Adamantine Clan",[{n:"Adamantine Skin",acBase:[10,"full","CON"],cond:"noBody"}]);
 addF("Android",[{n:"Technical Expertise",pick:[{k:"sk",t:"multi",n:1,title:"Skill",list:[["Data",""],["Piloting",""],["Technology",""]]}]},
  {n:"Technical Expertise",when:{key:"sk",val:"Data"},skillProf:["Data"]},{n:"Technical Expertise",when:{key:"sk",val:"Piloting"},skillProf:["Piloting"]},{n:"Technical Expertise",when:{key:"sk",val:"Technology"},skillProf:["Technology"]}]);
 addF("Aquanaut",[{n:"Finned",mv:{swim:"speed"}}]);
 addF("Aquatic Adaptation",[{n:"Natural Swimmer",mv:{swim:"speed"}}]);
 /* Arcane Warrior: two Wizard cantrips. The ability is its own pick (the native pick above it records the same choice for the text) */
 addF("Arcane Warrior",[{n:"Cantrips",spCls:"@abpick",pick:[{k:"ab",t:"multi",n:1,title:"Spellcasting ability for the cantrips",list:A3},{k:"c",t:"cantrip",cls:"Wizard",n:2,title:"Two Wizard cantrips"}]}]);
 addF("Blind Fighting",[{n:"Blindsight",senseAdd:[["Blindsight",10,"Blindsight 10 ft from Blind Fighting"]]}]);
 addF("Boon of Perfect Flight",[{n:"Flying",mv:{fly:40}}]);
 addF("Boon of Truesight",[{n:"Truesight",senseAdd:[["Truesight",60,"Truesight 60 ft from Boon of Truesight"]]}]);
 addF("Changeling Metamorphosis",[{n:"Hardened Skin",acAdd:1}]);
 addF("DD&D: Artifactor",[{n:"Additional Attunement",attune:4}]);
 addF("Familiar Keeper",[{n:"Find Familiar",lu:{n:"Find Familiar (free cast)",max:1,reset:"long",tag:"Cast without a slot or Material components"}}]);
 addF("Field Medic",[{n:"Field Healing",lu:{n:"Field Healing: Cure Wounds",max:{f:"pb/2",min:1},reset:"long",tag:"Cast Cure Wounds with no slot (half your Proficiency Bonus, rounded down)"}}]);
 addF("Forest Sage",[{n:"Dual Mind",skillAb:[["Animal Handling","INT"],["Arcana","WIS"],["Nature","WIS"],["Survival","INT"]]}]);
 addF("Green-Skin",[{n:"Natural Armor",acBase:[13,"full"],cond:"noBody"}]);
 addF("Ironwood Dryad",[{n:"Barkflesh",acBase:[15,""],cond:"noBody"}]);
 addF("Grue",[{n:"Swirl of Shadows",l:5,lu:{n:"Swirl of Shadows: Invisibility",max:1,reset:"long",tag:"Invisibility on yourself in Dim Light or Darkness"}}]);
 addF("Heavy Gunner",[{n:"Strong Attacks",atkAb:{kind:"ranged",ab:"STR",opt:1,note:"Heavy Gunner: for a Ranged weapon with the Heavy or Two-Handed property you can use Strength instead of Dexterity"}}]);
 addF("Porterling",[{n:"Flexible",advOn:["checks to end the Grappled condition or to escape nonmagical restraints"]}]);
 addF("Vampire Hunter",[{n:"Adroit Escape",advOn:["checks to escape nonmagical restraints or the Grappled condition"]}]);
 addF("Precognitive",[{n:"Augury",lu:{n:"Augury (free cast)",max:1,reset:"long",tag:"No slot and no components"}}]);
 addF("Proto-Man",[{n:"Primal Toughness",hpFlat:1,hpLvl:1}]);
 addF("Psionic-Awakened",[{n:"Unseen Servant",l:3,lu:{n:"Unseen Servant (free cast)",max:1,reset:"long"}},{n:"Levitate",l:5,lu:{n:"Levitate (free cast)",max:1,reset:"long"}}]);
 ["Pyromaniac","Pyromaniac (Dark Matter)"].forEach(function(n){addF(n,[{n:"Firestarter Magic",lu:[{n:"Burning Hands (free cast)",max:1,reset:"long"},{n:"Scorching Ray (free cast)",max:1,reset:"long"}]}])});
 addF("Technopath",[{n:"Technical Difficulties",l:3,lu:{n:"Technical Difficulties (free cast)",max:1,reset:"long"}},{n:"Circuit Breaker",l:5,lu:{n:"Circuit Breaker (free cast)",max:1,reset:"long"}}]);
 addF("Plantmender",[{n:"Growth Spell",lu:{n:"Growth Spell (Barkskin or Spike Growth)",max:1,reset:"long",tag:"Cast one of them with no slot"}},
  {n:"Plant Memory",lu:{n:"Plant Memory",max:{f:"2*mod:WIS",min:2},reset:"long",tag:"Twice your Wisdom modifier, minimum 1"}}]);
 addF("Sangromantic Initiate",[{n:"Sanguine Potency",lu:{n:"Sanguine Potency (d12 pool)",max:2,reset:"long",pool:1,die:"d12",tag:"Spend instead of Hit Point Dice on Sangromancy spells"}}]);
 addF("Simian",[{n:"Climb Speed",mv:{climb:"speed"}}]);
 addF("Tavern Brawler (2014)",[{n:"Unarmed Strike",unarmed:{die:"1d4"}}]);
 addF("Telekinetic",[{n:"Minor Telekinesis",spells:[[1,"Mage Hand"]],spCls:"@asi"}]);
 addF("Wood Elf Magic",[{n:"Druid cantrip",spCls:"@sub:WIS",pick:[{k:"c",t:"cantrip",cls:"Druid",n:1,title:"One Druid cantrip"}]}]);
 ["Ring-Bound","Ring-bound"].forEach(function(n){addF(n,[{n:"Ring Ward",advOn:["saves against transmutation spells"]}])});
 addF("Transmuted Anatomy",[{n:"Resilient Anatomy",advOn:["saves against effects that force you to shape-shift against your will"]}]);
 addF("Watchers",[{n:"Incessant Watchers",saveNote:["Disadvantage on saving throws against the Scrying spell"]}]);
 addF("Touch of Death",[{n:"Flaw",saveNote:["Disadvantage on Death Saving Throws"]}]);
 addF("Showman",[{n:"Showman",skillPE:["Performance"]}]);
 addF("Showman (Dark Matter)",[{n:"Showman",skillPE:["Performance"]}]);
 addF("Reptiloid",[{n:"Reptilian Resistance",pick:[{k:"rr",t:"multi",n:1,title:"Resistance",list:[["Acid",""],["Fire",""],["Poison",""]]}]},
  {n:"Reptilian Resistance (Acid)",when:{key:"rr",val:"Acid"},res:["Acid"]},{n:"Reptilian Resistance (Fire)",when:{key:"rr",val:"Fire"},res:["Fire"]},{n:"Reptilian Resistance (Poison)",when:{key:"rr",val:"Poison"},res:["Poison"]}]);
 addF("Shadowsteel Adept",[{n:"Shadowsteel's Bite",toggle:{id:"shadowsteel-focus",label:"Holding your Shadowsteel Focus",default:false},spAtk:1,spDc:1,defs:[["Note","Shadowsteel Weapon: if the Focus is also a weapon it has +1 to attack and damage rolls"]]}]);

 /* Transformation feats. Uses "equal to your Transformation Stage" are shown for the stage of the feat that grants the boon. A stage feat cannot read the boon pick of another stage feat, so the growth of a stage 1 boon at later stages is not added */
 var DSD={saveNote:["Disadvantage on Death Saving Throws"]};
 addF("Ooze Transformation: Stage 1",[{n:"Ooze Form",lu:{n:"Ooze Form",max:{f:"pb+1"},reset:"long",tag:"Proficiency Bonus plus your Transformation Stage"}}]);
 addF("Ooze Transformation: Stage 2",[{n:"Sluggish",speedAdd:-5},{n:"Ooze Form",lu:{n:"Ooze Form: extra use (Stage 2)",max:1,reset:"long",tag:"One more use per Transformation Stage"}},
  {n:"Elastic Limbs",when:{key:"trOoze2",val:"Elastic Limbs"},mv:{climb:"speed"}},
  {n:"Viscous Durability",when:{key:"trOoze2",val:"Viscous Durability"},imm:["Acid"],condImm:["Frightened"],pick:[{k:"vd",t:"multi",n:1,title:"Resistance",list:[["Cold",""],["Fire",""],["Lightning",""]]}]},
  {n:"Viscous Durability (Cold)",when:{key:"vd",val:"Cold"},res:["Cold"]},{n:"Viscous Durability (Fire)",when:{key:"vd",val:"Fire"},res:["Fire"]},{n:"Viscous Durability (Lightning)",when:{key:"vd",val:"Lightning"},res:["Lightning"]}]);
 addF("Ooze Transformation: Stage 3",[{n:"Sluggish",speedAdd:-5},{n:"Ooze Form",lu:{n:"Ooze Form: extra use (Stage 3)",max:1,reset:"long",tag:"One more use per Transformation Stage"}},
  {n:"Physical Deterioration",vul:["Radiant"],saveNote:["Disadvantage on Dexterity saving throws (and Dexterity ability checks)"]}]);
 addF("Ooze Transformation: Stage 4",[{n:"Sluggish",speedAdd:-5},{n:"Ooze Form",lu:{n:"Ooze Form: extra use (Stage 4)",max:1,reset:"long",tag:"One more use per Transformation Stage"}},
  {n:"Legion of Slime",when:{key:"trOoze4",val:"Legion of Slime"},lu:{n:"Legion of Slime",max:1,reset:"long"}}]);
 addF("Primordial Transformation: Stage 1",[Object.assign({n:"Planar Binding"},DSD)]);
 addF("Primordial Transformation: Stage 2",[
  {n:"Elemental Surge",when:{key:"trPrimordial2",val:"Elemental Surge"},lu:{n:"Elemental Surge",max:"mod:CON",reset:"long"}}
 ].concat(eleRes("el2","Dual Nature","trPrimordial2","Dual Nature")));
 addF("Primordial Transformation: Stage 3",eleRes("el3","Master of Many","trPrimordial3","Master of Many").concat([
  {n:"Primeval Body",when:{key:"trPrimordial3",val:"Primeval Body"},pick:[{k:"pbd",t:"multi",n:1,title:"Damage type",list:[["Bludgeoning",""],["Cold",""],["Fire",""],["Lightning",""]]}]}
 ],["Bludgeoning","Cold","Fire","Lightning"].map(function(t){return {n:"Primeval Body ("+t+")",when:{key:"pbd",val:t},resToImm:[t]}})));
 addF("Primordial Transformation: Stage 4",[
  {n:"Elemental Mastery",when:{key:"trPrimordial4",val:"Elemental Mastery"},lu:{n:"Elemental Mastery",max:"mod:CON",reset:"long"}}
 ].concat(eleRes("el4","Elemental Mastery","trPrimordial4","Elemental Mastery")));
 addF("Seraph Transformation: Stage 1",[Object.assign({n:"Fallen Seraph"},DSD),
  {n:"Angelic Wings",when:{key:"trSeraph1",val:"Angelic Wings"},lu:{n:"Angelic Wings",max:1,reset:"short",tag:"Equal to your Transformation Stage"}},
  {n:"Holy Strikes",when:{key:"trSeraph1",val:"Holy Strikes"},lu:{n:"Holy Strikes",max:{f:"pb+1"},reset:"short",tag:"Proficiency Bonus plus your Transformation Stage"}}]);
 addF("Seraph Transformation: Stage 2",[
  {n:"Divine Clemency",when:{key:"trSeraph2",val:"Divine Clemency"},lu:{n:"Divine Clemency",max:2,reset:"long",tag:"Equal to your Transformation Stage"}},
  {n:"Sacred Retribution",when:{key:"trSeraph2",val:"Sacred Retribution"},lu:{n:"Sacred Retribution",max:2,reset:"long",tag:"Equal to your Transformation Stage"}}]);
 addF("Seraph Transformation: Stage 3",[{n:"Bow of Celestial Judgement",when:{key:"trSeraph3",val:"Bow of Celestial Judgement"},lu:{n:"Bow of Celestial Judgement",max:3,reset:"long",tag:"Equal to your Transformation Stage"}}]);
 addF("Specter Transformation: Stage 1",[Object.assign({n:"Haunted Mind"},DSD),
  {n:"Ghastly Touch",when:{key:"trSpecter1",val:"Ghastly Touch"},lu:{n:"Ghastly Touch",max:{f:"pb+1"},reset:"short",tag:"Proficiency Bonus plus your Transformation Stage"}},
  {n:"Incorporeal Movement",when:{key:"trSpecter1",val:"Incorporeal Movement"},lu:{n:"Incorporeal Movement",max:"pb",reset:"long"}}]);
 addF("Specter Transformation: Stage 2",[{n:"Fading Vitality",defs:[["Note","Whenever you regain Hit Points you regain only half as many, rounded down"]]},
  {n:"Ethereal Phasing",when:{key:"trSpecter2",val:"Ethereal Phasing"},lu:{n:"Ethereal Phasing (Blink)",max:2,reset:"long",tag:"Equal to your Transformation Stage"}},
  {n:"Haunting Flight",when:{key:"trSpecter2",val:"Haunting Flight"},mv:{fly:"speed"}}]);
 addF("Specter Transformation: Stage 3",[
  {n:"Paralyzing Touch",when:{key:"trSpecter3",val:"Paralyzing Touch"},lu:{n:"Paralyzing Touch",max:3,reset:"short",tag:"Equal to your Transformation Stage"}},
  {n:"Draining Flight",when:{key:"trSpecter3",val:"Draining Flight"},mv:{fly:"speed2"}}]);
 addF("Specter Transformation: Stage 4",[
  {n:"Call of Unmaking",when:{key:"trSpecter4",val:"Call of Unmaking"},lu:{n:"Call of Unmaking",max:1,reset:"long"}},
  {n:"Possession",when:{key:"trSpecter4",val:"Possession"},lu:{n:"Possession",max:1,reset:"short"}}]);
 addF("Shadowsteel Ghoul Transformation: Stage 1",[{n:"Shadowsteel Curser",when:{key:"trShadowsteelGhoul1",val:"Shadowsteel Curser"},defs:[["Note","Shadowsteel curses: casting time halved and the saving throw DC rises by 1"]]},
  {n:"Flaw",pick:[{k:"lose",t:"multi",n:1,title:"Ability score you lose 2 points in",list:ASK}]}].concat([["Strength","STR"],["Dexterity","DEX"],["Constitution","CON"],["Intelligence","INT"],["Wisdom","WIS"],["Charisma","CHA"]].map(function(x){return {n:"Flaw ("+x[0]+")",when:{key:"lose",val:x[0]},abDown:[[x[1],-2,1]]}})));
 addF("Shadowsteel Ghoul Transformation: Stage 2",[{n:"Magic Resistance",when:{key:"trShadowsteelGhoul2",val:"Magic Resistance"},advOn:["saves against spells"]},
  {n:"Shadowsteel Absorption",when:{key:"trShadowsteelGhoul2",val:"Shadowsteel Absorption"},acAdd:1,cond:"noBody"},
  {n:"Shadowsteel Weapon Master",when:{key:"trShadowsteelGhoul2",val:"Shadowsteel Weapon Master"},defs:[["Note","The Shadowsteel Weapon deals +4 damage"]]},
  {n:"Flaw",defs:[["Note","Disadvantage on all Charisma ability checks"]]}]);
 addF("Shadowsteel Ghoul Transformation: Stage 3",[{n:"Healing Resistance",defs:[["Note","Whenever you regain Hit Points you regain only half as many (Long Rest still restores all)"]]}]);
 addF("Shadowsteel Ghoul Transformation: Stage 4",[{n:"Shadowsteel Arcane Vessel",when:{key:"trShadowsteelGhoul4",val:"Shadowsteel Arcane Vessel"},lu:{n:"Shadowsteel Arcane Vessel",max:"pb",reset:"long"}}]);
 addF("Vampire Transformation: Stage 2",[
  {n:"Eyes of the Night",when:{key:"trVampire2",val:"Eyes of the Night"},darkNone:60,darkHave:{add:60}},
  {n:"Grave-Touched Soul",when:{key:"trVampire2",val:"Grave-Touched Soul"},resToImm:["Necrotic"]},
  {n:"Inhuman Reflexes",when:{key:"trVampire2",val:"Inhuman Reflexes"},advOn:["Dexterity saving throws"]},
  {n:"Undead Resilience",when:{key:"trVampire2",val:"Undead Resilience"},lu:{n:"Undead Resilience",max:1,reset:"long"}}]);
 addF("Vampire Transformation: Stage 3",[
  {n:"Mist Form",when:{key:"trVampire3",val:"Mist Form"},lu:{n:"Mist Form (Gaseous Form)",max:3,reset:"long",tag:"Equal to your Vampire Transformation Stage"}},
  {n:"Sangromancy Specialist",when:{key:"trVampire3",val:"Sangromancy Specialist"},lu:{n:"Sangromancy Hit Dice (d12)",max:3,reset:"long",pool:1,die:"d12",tag:"One d12 per Vampire Transformation Stage, for Sangromancy spells"}}]);
 addF("Vampire Transformation: Stage 4",[
  {n:"Final Fzeg Bloodline",when:{key:"trVampire4",val:"Final Fzeg Bloodline"},abUp:[["STR",2,20]],speedAdd:10,res:["Bludgeoning","Piercing","Slashing"],defs:[["Note","Final Fzeg resistance is ignored by magic weapons and silvered weapons"]]},
  {n:"Final Soman Bloodline",when:{key:"trVampire4",val:"Final Soman Bloodline"},abUp:[["STR",1,20],["DEX",1,20]]},
  {n:"Final Strigoi Bloodline",when:{key:"trVampire4",val:"Final Strigoi Bloodline"},abUp:[["DEX",2,20]],lu:[{n:"Misty Step (Final Strigoi)",max:4,reset:"long"},{n:"Final Strigoi summon",max:1,reset:"short"}]}]);
 /* Rune Knowledge (pick rk) and Script Carver (pick sc): the always-on Benefit of each rune or glyph that changes a sheet number. Conditional benefits stay in the pick text */
 addF("Rune Knowledge",[Object.assign({n:"Algiz",when:{key:"rk",val:"Algiz"}},{init:1})]);
 addF("Rune Knowledge",[Object.assign({n:"Berkanan",when:{key:"rk",val:"Berkanan"}},{skillBonus:[["Persuasion",1]]})]);
 addF("Rune Knowledge",[Object.assign({n:"Eiwaz",when:{key:"rk",val:"Eiwaz"}},{skillProf:["Arcana"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Ingwaz",when:{key:"rk",val:"Ingwaz"}},{skillProf:["History"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Jera",when:{key:"rk",val:"Jera"}},{skillProf:["Nature"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Kaunen",when:{key:"rk",val:"Kaunen"}},{darkNone:30})]);
 addF("Rune Knowledge",[Object.assign({n:"Laukaz",when:{key:"rk",val:"Laukaz"}},{langs:["Primordial"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Naudiz",when:{key:"rk",val:"Naudiz"}},{lu:{n:"Naudiz: Spare the Dying",max:1,reset:"long",tag:"Once per day"}})]);
 addF("Rune Knowledge",[Object.assign({n:"Nyk\u00f6ping",when:{key:"rk",val:"Nyk\u00f6ping"}},{skillProf:["Survival"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Otalan",when:{key:"rk",val:"Otalan"}},{skillProf:["Persuasion"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Raido",when:{key:"rk",val:"Raido"}},{speedAdd:5})]);
 addF("Rune Knowledge",[Object.assign({n:"Sowilo",when:{key:"rk",val:"Sowilo"}},{condImm:["Blinded"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Tewaz",when:{key:"rk",val:"Tewaz"}},{advOn:["saves against the Frightened condition"]})]);
 addF("Rune Knowledge",[Object.assign({n:"Turisaz",when:{key:"rk",val:"Turisaz"}},{langs:["Giant"]})]);
 addF("Script Carver",[Object.assign({n:"Dress the Air with the Cloying and the Fair",when:{key:"sc",val:"Dress the Air with the Cloying and the Fair"}},{skillBonus:[["Persuasion",1]]})]);
 addF("Script Carver",[Object.assign({n:"Flourish in Death as in Life",when:{key:"sc",val:"Flourish in Death as in Life"}},{saveBonusAb:[["CON",1]]})]);
 addF("Script Carver",[Object.assign({n:"Fly as the Falcon, Howl as the Wolf",when:{key:"sc",val:"Fly as the Falcon, Howl as the Wolf"}},{skillBonus:[["Survival",1]]})]);
 addF("Script Carver",[Object.assign({n:"Gifts Taken From the Silver Coffer",when:{key:"sc",val:"Gifts Taken From the Silver Coffer"}},{skillBonus:[["Investigation",1]]})]);
 addF("Script Carver",[Object.assign({n:"Grasping Arms of Balance",when:{key:"sc",val:"Grasping Arms of Balance"}},{skillBonus:[["Investigation",1]]})]);
 addF("Script Carver",[Object.assign({n:"He Hath Repulsed the Fiends",when:{key:"sc",val:"He Hath Repulsed the Fiends"}},{acBase:[10,"full","WIS"],cond:"noArmor"})]);
 addF("Script Carver",[Object.assign({n:"On the Day of the Destruction of the Fiends",when:{key:"sc",val:"On the Day of the Destruction of the Fiends"}},{skillBonus:[["Intimidation",1]]})]);
 addF("Script Carver",[Object.assign({n:"Open the Hidden Springs and Unbolt the Shrine",when:{key:"sc",val:"Open the Hidden Springs and Unbolt the Shrine"}},{skillBonus:[["Sleight of Hand",1]]})]);
 addF("Script Carver",[Object.assign({n:"Savor the Divine Company of the Gods",when:{key:"sc",val:"Savor the Divine Company of the Gods"}},{hpLvl:1})]);
 addF("Script Carver",[Object.assign({n:"Stand Above All",when:{key:"sc",val:"Stand Above All"}},{advOn:["Charisma saving throws"]})]);
 addF("Script Carver",[Object.assign({n:"Stars and Birds Perceive All",when:{key:"sc",val:"Stars and Birds Perceive All"}},{skillBonus:[["Perception",1]]})]);
 addF("Script Carver",[Object.assign({n:"The Jackal Moves on Tirelessly",when:{key:"sc",val:"The Jackal Moves on Tirelessly"}},{saveNote:["+1 to saving throws against exhaustion"]})]);
 addF("Script Carver",[Object.assign({n:"Watchful Eyes See What Is Hidden",when:{key:"sc",val:"Watchful Eyes See What Is Hidden"}},{skillBonus:[["Insight",1]]})]);
 addF("Script Carver",[Object.assign({n:"With the Sight and Talons of the Hawk",when:{key:"sc",val:"With the Sight and Talons of the Hawk"}},{init:1})]);
 addF("Script Carver",[{n:"The Gods' Company is Like Light",when:{key:"sc",val:"The Gods' Company is Like Light"},pick:[{k:"lg",t:"lang",n:1,title:"Additional language"}]}]);
 addF("Script Carver",[{n:"Drink Deep of the River's Power",when:{key:"sc",val:"Drink Deep of the River's Power"},spCls:"@sub:INT",pick:[{k:"c",t:"cantrip",cls:"Wizard",n:1,title:"One Wizard cantrip"}]}]);

 /* ===== 3. Items (Acquisitions Incorporated devices) =====
    The old row fx {save:1} counted +1 to every saving throw. The text gives +1 to one ability's saves only, so the row fx is dropped (FXO) and a saveBonusAb entry takes its place */
 function oneSave(item,ab,extra){window.FXO[item]={fx:null};add("item",item,[Object.assign({n:item,saveBonusAb:[[ab,1]]},extra||{})])}
 oneSave("Chronolometer","INT",{pick:[{k:"lg",t:"lang",n:1,title:"A language you do not know"}]});
 oneSave("Dimensional Loop","STR",{darkNone:60,darkHave:{add:30}});
 oneSave("Far Gear","CHA",{advOn:["Charisma (Intimidation) checks"]});
 oneSave("Rotor of Return","CON");
 oneSave("Timepiece of Travel","DEX");
 oneSave("Wheel of Stars","WIS");
 })();
