DataEnv.declare("__fxZ5","XSK");
/* Uncovered 3: temporary benefits use switches and the existing typed fields.
   Amounts, source levels and options come from the app's own feature text.
   Existing WXS defense notes are retained as conditional descriptions. */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};GX.feat=GX.feat||{};GX.cls=GX.cls||{};
(function(){
 if(DataEnv.slot.__fxZ5)return;DataEnv.slot.__fxZ5=1;
 DataEnv.slot.XSK=DataEnv.slot.XSK||{};
 DataEnv.slot.XSK.Piloting=DataEnv.slot.XSK.Piloting||{ab:"DEX",d:"Operating a vehicle or Battleframe"};
 function S(n,e){(GX.sub[n]=GX.sub[n]||[]).push(e)}
 S("Storm Sentinel",{n:"Stormlord",l:17,toggle:{id:"stormlord",label:"Stormlord active (1 minute)",default:false},mv:{fly:60}});
 S("Rimekeeper",{n:"Hoarfrost Herald",l:17,toggle:{id:"hoarfrost-herald",label:"Hoarfrost Herald active (1 minute)",default:false},imm:["Cold"]});
 S("Winter Walker",{n:"Frozen Haunt",l:15,toggle:{id:"frozen-haunt",label:"Frozen Haunt active with Hunter's Mark",default:false},imm:["Cold"],condImm:["Grappled","Prone","Restrained"]});
 S("Infernum",{n:"Infernal Bargain (Blindsight and Blindness)",l:6,toggle:{id:"infernal-blindsight",label:"Infernal Bargain: Blindsight and Blindness",default:false},sense:[["Blindsight",30,"You are Blinded beyond this range"]]});
 S("Diabolist",{n:"Soul Broker (Speed)",l:6,toggle:{id:"soul-broker-speed",label:"Soul Broker: Speed boon active (10 minutes)",default:false},speedAdd:15});
 S("Diviner",{n:"The Third Eye (Darkvision)",l:10,toggle:{id:"third-eye-darkvision",label:"The Third Eye: Darkvision selected until a rest",default:false},darkTo:120});
 /* Advantage: passive knowledge or save rules, and explicit active states. */
 S("Mutagenist",{"n":"Advanced Mutation","l":10,"classOnly":"Alchemist","advOn":["checks and saves to avoid or end the Grappled and Restrained conditions"],"toggle":{"id":"mutation-hyperelastic","label":"Hyperelastic mutation active","default":false},"reach":[{"when":["melee","unarmed"],"add":5}]});
 S("Feylost",{"n":"Fey Moods","l":3,"advOn":["Dexterity checks and saving throws"],"toggle":{"id":"fey-mood-paranoid","label":"Fey Mood active while Bloodied: Paranoid result","default":false}});
 S("Feylost",{"n":"Fey Moods","l":3,"advOn":["Intelligence, Wisdom, and Charisma saving throws"],"toggle":{"id":"fey-mood-serene","label":"Fey Mood active while Bloodied: Serene result","default":false}});
 S("Siegeball Jersey",{"n":"Sports Fanatic","l":3,"advOn":["ability checks to recall information about a sport, its teams, and its players"]});
 S("Justice Domain",{"n":"Holy Denunciation","l":17,"advOn":["Wisdom and Charisma checks about justice, judgment, and law, up to and including execution for crimes"],"toggle":{"id":"holy-denunciation","label":"Holy Denunciation authority active","default":false}});
 S("Mime",{"n":"Pantomime [Dance Style]","l":3,"advOn":["the first melee attack roll you make on each of your turns"],"toggle":{"id":"pantomime","label":"Pantomime dance active","default":false}});
 S("Circle of Configuration",{"n":"Mecha Configuration","l":14,"advOn":["Strength checks and saves"],"toggle":{"id":"mecha-configuration","label":"Mecha Configuration active (10 minutes)","default":false},"size":"Large","atkDice":[{"when":["melee","unarmed"],"d":"1d6","t":"Force","note":"Mecha Slam, while configured"}]});
 S("Rune Knight",{"n":"Giant's Might","l":3,"advOn":["Strength checks and Strength saving throws"],"toggle":{"id":"giants-might","label":"Giant's Might active (1 minute)","default":false},"size":"Large"});
 S("Warrior of Gravity",{"n":"Plunging Strike","l":6,"advOn":["any Unarmed Strike you make while falling"]});
 S("Occultist Guild",{"n":"Arcane Interference","l":3,"advOn":["saving throws against spells cast by creature types in your Monster Grimoire"]});
 S("Oath of Glory (2014)",{"n":"Living Legend","l":20,"advOn":["all Charisma checks"],"toggle":{"id":"living-legend-2014","label":"Living Legend active (1 minute)","default":false},"ed":"2014"});
 S("Oath of Thunder",{"n":"Child of the Storm","l":20,"advOn":["Dexterity (Stealth) checks and Initiative rolls"],"toggle":{"id":"child-of-the-storm","label":"Child of the Storm active (1 hour)","default":false},"initAdv":true});
 S("Bounty Hunter",{"n":"Threat Assessment","l":7,"advOn":["saving throws against effects caused by the creature marked by your Hunter's Mark"]});
 S("Thief (2014)",{"n":"Supreme Sneak","l":9,"advOn":["a Dexterity (Stealth) check if you move no more than half your Speed on the same turn"],"toggle":{"id":"supreme-sneak","label":"Moved no more than half Speed this turn","default":false},"ed":"2014"});
 S("Inquisitive",{"n":"Steady Eye","l":9,"advOn":["Wisdom (Perception) and Intelligence (Investigation) checks if you move no more than half your Speed on the same turn"],"toggle":{"id":"steady-eye","label":"Moved no more than half Speed this turn","default":false}});
 S("The Predator",{"n":"Form of the Beast","l":3,"advOn":["Stealth, Perception and Survival checks to stalk or track prey"],"toggle":{"id":"predator-form","label":"Form of the Beast active","default":false}});
 S("Transmuter",{"n":"Wondrous Alteration","l":3,"advOn":["Charisma (Deception) checks"],"toggle":{"id":"alter-appearance","label":"Alter Self: Change Appearance active","default":false}});
 S("Doomsayer",{"n":"Merciless Onslaught","l":10,"advOn":["spell attack rolls against Frightened or Poisoned creatures"]});
 S("Dragon Mage",{"n":"Invoke Dragon Wings","l":10,"advOn":["spell attack rolls"],"toggle":{"id":"dragon-wings","label":"Dragon Wings active","default":false}});
 /* Feat grants: typed proficiencies replace purely descriptive tool/skill labels. */
 (GX.feat["Syndicate Spy"]=GX.feat["Syndicate Spy"]||[]).push({"n":"Tool Training","tools":["Thieves' Tools","Disguise Kit","Forgery Kit"]});
 (GX.feat["Ace Pilot"]=GX.feat["Ace Pilot"]||[]).push({"n":"Expert Pilot","skillPE":["Piloting"]});
 (GX.feat["Gambler (Dark Matter)"]=GX.feat["Gambler (Dark Matter)"]||[]).push({"n":"Gaming Sets","advOn":["ability checks made for games of chance"]});
 (GX.feat["Lakshay: Oni"]=GX.feat["Lakshay: Oni"]||[]).push({"n":"Battleframe Pilot","advOn":["Dexterity (Piloting) checks while operating a Battleframe"]});
 (GX.feat["Ley-Bound"]=GX.feat["Ley-Bound"]||[]).push({"n":"Wilderness Lore","advOn":["Wisdom (Survival) checks to track overland or forage for food and water"]});
 /* Item rows supply their existing attunement requirements and charge pools. */
 GX.item=GX.item||{};
 function I(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 I("Mythallar Cloak",{"n":"Mythallar Cloak","toggle":{"id":"mythallar-cloak","label":"Mythallar Cloak active (1 minute, 1 charge)","default":false},"mv":{"fly":30},"atkDice":[{"when":"any","d":"1d4","t":"Radiant","note":"One damaging hit on each of your turns while the cloak is active"}],"defs":[["Note","Flight from the cloak allows hovering. Ending the power in the air can cause a fall."]]});
 I("Ring of Spacewalking",{"n":"Zero-gravity flight","toggle":{"id":"zero-gravity","label":"In zero gravity","default":false},"mv":{"fly":"speed"}});
 I("Spacewalkers",{"n":"Zero-gravity flight","toggle":{"id":"zero-gravity","label":"In zero gravity","default":false},"mv":{"fly":"speed"}});
 (GX.feat["Gun-Mage Adept"]=GX.feat["Gun-Mage Adept"]||[]).push({n:"Ranged Weapon Proficiency",l:4,ed:"2024",weaponGroups:[{cat:"M",k:"R"}]});
})();
