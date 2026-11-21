DataEnv.slot.GX=DataEnv.slot.GX||{};GX.cls=GX.cls||{};GX.sub=GX.sub||{};
/* fx data batch B61 (hand written): class and subclass features from tests/mech_baseline.json "by_design" that give the character itself a fixed
   number in a play state (raging, a form, a frame, a familiar, a state turned on). A state is a switch on the sheet; a choice that lasts until a rest
   or until changed is an optional pick. Every number is from the feature text. */
(function(){
var C=function(k,e){GX.cls[k]=(GX.cls[k]||[]).concat(e)},S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)};
var T=function(id,label){return {id:id,label:label}},L=function(a){return a.map(function(x){return [x,""]})};
var RAGE=T("rage","Raging");
/* pick k of kind/owner with options; each option an entry {n:feature+": "+opt, when, ...fx} */
var P=function(kind,owner,feat,l,k,title,opts){var key="gx-"+k+"-"+kind+"-"+owner;
 return [{n:feat,l:l,pick:[{k:k,t:"multi",n:1,opt:1,title:title,list:L(Object.keys(opts))}]}].concat(Object.keys(opts).filter(function(o){return opts[o]}).map(function(o){return Object.assign({n:feat+": "+o,l:l,when:{key:key,val:o}},opts[o])}))};
var SAVES=["STR","DEX","CON","INT","WIS","CHA"];

/* Summoner Shared Resilience (15): within 30 feet of the Eidolon, proficiency in all saving throws */
C("Summoner",[{n:"Shared Resilience",l:15,toggle:T("b61-eidolon-30","Eidolon within 30 ft: proficiency in all saving throws"),saveProf:SAVES}]);
/* Craftsman Armor Enchantment (13): Resistance enchantment, one type; Winged: Fly Speed equal to Speed until the end of the turn */
C("Craftsman",P("cls","Craftsman","Armor Enchantment",13,"armench","Armor Enchantment: Resistance damage type",
 {Acid:{res:["Acid"]},Cold:{res:["Cold"]},Fire:{res:["Fire"]},Lightning:{res:["Lightning"]},Poison:{res:["Poison"]},Thunder:{res:["Thunder"]}})
 .concat([{n:"Armor Enchantment (Winged)",l:13,toggle:T("b61-winged","Winged armor, Bonus Action this turn: Fly Speed equal to Speed"),mv:{fly:"speed"}}]));
/* Craftsman Customize Armor (6): Climbing = Climb Speed equal to Speed; Diving = Swim Speed equal to Speed */
C("Craftsman",P("cls","Craftsman","Customize Armor",6,"custarm","Customize Armor option",
 {"Cast-Off":null,Climbing:{mv:{climb:"speed"}},Diving:{mv:{swim:"speed"}},Integrated:null,Sleek:null}));

/* raging: Resistance (Primordial Bond: Cold, Fire, Lightning; the GM variant for 2014 Dreadnought and Wrecker: Force, Necrotic, Radiant) */
S("Path of the Elements",[{n:"Primordial Bond",l:10,toggle:RAGE,res:["Cold","Fire","Lightning"]}]);
["Path of the Dreadnought (2014)","Path of the Wrecker (2014)"].forEach(function(s){S(s,[{n:"Variant Resistances",l:3,toggle:T("b61-variant-res","Raging, GM variant: Resistance to Force, Necrotic, Radiant"),res:["Force","Necrotic","Radiant"]}])});
/* Aspect of the Dragon (10): Dragon Hide AC +2, Dragon Wings Fly Speed 30 ft, chosen when you enter Rage */
S("Path of the Dragon",[{n:"Aspect of the Dragon (Dragon Hide)",l:10,toggle:T("b61-dragon-hide","Rage, Dragon Hide: AC +2"),acAdd:2},
 {n:"Aspect of the Dragon (Dragon Wings)",l:10,toggle:T("b61-dragon-wings","Rage, Dragon Wings: Fly Speed 30 ft"),mv:{fly:30}}]);

/* Fly Speed equal to Speed in a state */
S("Circle of the Wyrm",[{n:"Fangs And Flight",l:6,toggle:T("b61-wyrm","Transformed: Fly Speed equal to Speed"),mv:{fly:"speed"}}]);
S("Mage Hand Magus",[{n:"Handglide",l:15,toggle:T("b61-handglide","Two mage hands or a warhand within 5 ft: Fly Speed equal to Speed"),mv:{fly:"speed"}}]);
S("Way of the Dragon",[{n:"Take Flight",l:6,toggle:T("b61-take-flight","Dash with 1 Ki this turn: Fly Speed equal to Speed"),mv:{fly:"speed"}}]);
S("Oath of the Sepulcher",[{n:"Aura of Atmosphere",l:7,toggle:T("b61-zero-g","Zero gravity: Fly Speed equal to Speed"),mv:{fly:"speed"}}]);
S("Wind Domain",[{n:"Channel Divinity: Grasp Not the Wind",l:3,toggle:T("b61-grasp-wind","Grasp Not the Wind this turn: Fly Speed equal to Speed"),mv:{fly:"speed"}}]);
S("Emotion Lord",[{n:"Mood Swing (Moment of Bliss)",l:6,toggle:T("b61-bliss","Moment of Bliss this turn: Fly Speed equal to Speed"),mv:{fly:"speed"}}]);
S("Psykinetic",[{n:"Destructive Trance",l:6,toggle:T("b61-trance","Destructive Trance (10 minutes): Fly Speed 20 ft, hover"),mv:{fly:20}}]);

/* Initiative Advantage: Kick In The Door in a reckless entrance; always for Opportunistic Brawler, Aura of Awareness, Symbiotic Sentinel */
S("Dungeoneer",[{n:"Kick In The Door",l:3,toggle:T("b61-kick-door","Reckless entrance to start combat: Advantage on Initiative"),initAdv:true}]);
S("Pugilist (ToH)",[{n:"Opportunistic Brawler",l:18,initAdv:true}]);
S("Oath of the Guardian",[{n:"Aura of Awareness",l:7,initAdv:true}]);
S("The Parasite",[{n:"Symbiotic Sentinel",l:6,initAdv:true,advOn:["saves against being Charmed or Frightened"]}]);

/* Speed and AC in a state */
S("Warrior of Mystic Brews",[{n:"Drunken Technique",l:3,toggle:T("b61-mystic-drunken","Patient Defense this turn: Speed +10 ft"),speedAdd:10}]);
S("Timeblade",[{n:"Improved Temporal Strike (Chronal Shield)",l:10,toggle:T("b61-chronal-shield","Chronal Shield: Proficiency Bonus to AC"),acAdd:"pb"}]);
S("Temporal Trickster",[{n:"Time Dilation",l:13,toggle:T("b61-time-dilation","Cast a chronomancy spell: AC +2, Dexterity saves +2"),acAdd:2,saveBonusAb:[["DEX",2]]}]);
var ST=T("b61-stony","Mutable Form, Stony Epidermis: Advantage to keep Concentration, Resistance to the chosen type"),SD=["Acid","Bludgeoning","Cold","Fire","Lightning","Piercing","Poison","Slashing","Thunder"];
S("Metamorph",[{n:"Flesh Weaver",l:6,toggle:T("b61-flesh-weaver","Mutable Form with an extra die, Organic Defense: AC +2"),acAdd:2},
 {n:"Unnatural Flexibility",l:10,toggle:T("b61-flexibility","Mutable Form, Unnatural Flexibility: AC +2"),acAdd:2},
 {n:"Stony Epidermis",l:10,toggle:ST,advOn:["Constitution saves to keep Concentration"]}]
 .concat(P("sub","Metamorph","Stony Epidermis",10,"stony","Stony Epidermis damage type",SD.reduce(function(o,t){o[t]={toggle:ST,res:[t]};return o},{}))));
S("Telepath",[{n:"Bulwark Mind",l:6,toggle:T("b61-bulwark-mind","Bulwark Mind (10 minutes): Resistance to Psychic"),res:["Psychic"]}]);

/* Duality of Water (11): no Turbulence dice = Fire, Frightened; at least one = Cold, Charmed */
S("Way of the Still Waters",[{n:"Duality of Water (calm)",l:11,toggle:T("b61-still-calm","No Turbulence dice: Resistance to Fire"),res:["Fire"],advOn:["saves against being Frightened"]},
 {n:"Duality of Water (turbulent)",l:11,toggle:T("b61-still-turb","At least one Turbulence die: Resistance to Cold"),res:["Cold"],advOn:["saves against being Charmed"]}]);

/* always on, no state */
S("Oath of the Plaguetouched",[{n:"Bulwark Against Death and Disease",l:15,advOn:["saves against undead effects that reduce ability scores"]}]);
S("Plague Doctor (2014)",[{n:"Breathe It In",l:10,advOn:["saves against being Poisoned"],def:["Immunity","Disease"]},{n:"Potion Craft",l:3,skillProf:["Medicine"]}]);

/* a familiar's form or type, a curse, or a benefit picked after a rest: optional picks */
S("Familiar Master (2014)",P("sub","Familiar Master (2014)","Servitor's Gift",6,"servgift","Servitor's Gift: familiar form",
 {Bat:null,Cat:null,Crab:{acBase:[12,"DEX"],cond:"noArmor"},Frog:null,Hawk:{advOn:["sight-based Wisdom (Perception) checks"]},Lizard:{res:["Poison"]},Octopus:null,Owl:{darkTo:30},"Poisonous Snake":null,Quipper:{mv:{swim:30}},Rat:{advOn:["saves against poison and disease"]},Raven:null})
 .concat(P("sub","Familiar Master (2014)","Servitor's Greater Gift",14,"servgreat","Servitor's Greater Gift: familiar type",
 {Aberration:{res:["Psychic"]},Celestial:{res:["Radiant"]},Construct:{acAdd:1},Elemental:{langs:["Primordial"]},Fey:{advOn:["saves against being Charmed or Frightened"]},Fiend:null})));
S("Wretched Bloodline",P("sub","Wretched Bloodline","Wretched Curse",3,"wcurse","Wretched Curse",
 {Hulking:{hpLvl:1},Nocturnal:{darkTo:120},Plaguebearer:{res:["Necrotic"],def:["Immunity","Disease"]}}));
S("Snake Speaker",P("sub","Snake Speaker","Scaly Transition",3,"scaly","Scaly Transition feature (until your next rest)",
 {Bite:null,"Keen Smell":null,"Poison Resistance":{res:["Poison"]},Scales:{acBase:[13,"DEX"],cond:"noBody"},"Serpentine Movement":{mv:{climb:30,swim:30}}}));
S("Ancient Dragons",P("sub","Ancient Dragons","Wyrmling Blessing",3,"wyrmbless","Wyrmling Blessing (until your next rest)",
 {"Aquatic Affinity":{mv:{climb:"speed",swim:"speed"}},"Draconic Hunger":null,"Draconic Sight":{darkNone:60,darkHave:{add:30}},"Elemental Versatility":null}));
S("Animal Lords",P("sub","Animal Lords","Primal Mastery",10,"primal","Primal Mastery benefit (until your next rest)",
 {"Cat Eyes":{darkNone:60,darkHave:{add:30}},Chameleonic:{advOn:["Stealth checks"]},Fangs:null,"Hold Breath":null,"Keen Senses":null,Leap:null,Spry:{advOn:["Acrobatics checks"]},Swift:{speedAdd:10},"Thick Hide":{acAdd:1},"Webbed Limbs":{mv:{climb:20,swim:20}}}));
S("Wastelander",P("sub","Wastelander","Alien Alteration",3,"alien","Alien Alteration",
 {"Binary Mind":null,"Digitigrade Legs":{speedAdd:10},"Grasping Tentacle":null,"Prehensile Tail":null}));
})();
