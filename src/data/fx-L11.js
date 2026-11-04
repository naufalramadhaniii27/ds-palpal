/* fx data ledger bin L11 (shards 29, 30, 31): subclass rows the ledger marked MISS, MISS_TOGGLE or MISMATCH. Schema: SOURCE-NOTES.md, "fx engine v4".
   Own file, registry pattern of fx-H-audit.js: window.GX.sub[name]. Loaded in the hbpack block after the tp files, so it may also correct data they registered (LU_X, AUTO).
   Rule texts were re-read in the tp and wotc09 rows before writing; where the ledger spec differed, the text won (reports/ledger-skipped-L11.md lists them).
   Toggles: ids blood-moon, ruin-incarnate, wrath-of-the-sea, bloodied, elem-attune, perfect-form, astral-awakened, impulse-frame, hide-armor. */
window.GX=window.GX||{};GX.sub=GX.sub||{};window.THIRD_SUBS=window.THIRD_SUBS||{};
(function(){
 function A(n,e){GX.sub[n]=(GX.sub[n]||[]).concat(e)}
 var BL={id:"bloodied",label:"Bloodied"},BM={id:"blood-moon",label:"Blood Moon active"};
 var MONKW=["Club","Dagger","Handaxe","Javelin","Light Hammer","Mace","Quarterstaff","Sickle","Spear","Shortsword"];
 /* Dancer */
 A("Moonwalker",[{n:"Zero-G Kicks",l:3,spCls:"@sub:CHA",spells:[[3,"Feather Fall"]]},{n:"Slick Moves",l:10,spCls:"@sub:CHA",spells:[[10,"Freedom of Movement"]]}]);
 A("Shadow Dancer",[{n:"Nocturnal",l:3,skillBonus:[["Stealth","CHA",1]],darkAdd:60}]);
 A("Steelsinger",[{n:"Steelsong Discipline",l:3,skillBonus:[["Athletics","CHA",1]],weapons:["Martial"],armor:["Medium","Shields"],acAdd:1,cond:"armor"}]);
 /* Druid */
 A("Circle of Blood",[{n:"Rite of the Blood Moon",l:3,toggle:BM,speedAdd:10},{n:"Blood Lust",l:10,toggle:BM,res:["Bludgeoning","Piercing","Slashing"]}]);
 A("Circle of Configuration",[{n:"Machine Code",l:3,langs:["Machine Code"],spCls:"Druid",spells:[[3,"Technomancy"]]}]);
 A("Circle of Entropy",[{n:"Ruin Incarnate",l:3,toggle:{id:"ruin-incarnate",label:"Ruin Incarnate active"},acBase:[17,"","WIS"],acOver:true}]);
 A("Circle of Owls",[{n:"Bonus Proficiency",l:3,pick:[{k:"owlskill",t:"skills",n:1,from:["Deception","Stealth"],title:"Bonus Proficiency"}]}]);
 A("Circle of Roses",[{n:"Bonus Proficiency",l:3,pick:[{k:"rosesskill",t:"skills",n:1,from:["Deception","Intimidation","Persuasion"],title:"Bonus Proficiency"}]},
  {n:"Circle Spells",l:3,spCls:"Druid",spells:[[3,"Friends"]]},
  {n:"Lingering Perfume",l:14,advOn:["saves against being Charmed or Frightened"],def:["Immunity","harmful gases and vapors"]}]);
 A("Circle of the Sea",[{n:"Stormborn",l:10,toggle:{id:"wrath-of-the-sea",label:"Wrath of the Sea active"},mv:{fly:"speed"},res:["Cold","Lightning","Thunder"]}]);
 A("Circle of the Unbroken",[{n:"Nature Armor",l:14,acBase:[17,""],acOver:true}]);
 /* Fighter */
 A("Champion (2014)",[{n:"Remarkable Athlete",l:7,init:[[7,2],[13,3]]}]);
 A("Couatl Herald",[{n:"Calm Mind",l:10,condImm:["Charmed","Frightened"]},{n:"Peacebringer",l:7,spCls:"@sub:CHA",spells:[[7,"Calm Emotions,Sanctuary"]]}]);
 A("Cybernetic",[{n:"Hyperdrive",l:10,pick:[{k:"overdrive",t:"item",n:1,yc:1,title:"Overdrive Module graft (no Internal slot)",list:[["Overdrive Module","Rare graft, takes no Internal graft slot."]]}]}]);
 A("Living Crucible",[{n:"Student of Alchemy",l:3,tools:["Alchemist's Supplies"]}]);
 A("Nightwatcher",[{n:"Ever Vigilant",l:3,initAdv:true,advOn:["Wisdom (Perception) checks"],darkAdd:60}]);
 THIRD_SUBS["Prescient Knight"]={list:"Wizard",ab:"INT",cant:2};
 A("Psi Warrior",[{n:"Telekinetic Master",l:18,spCls:"@sub:INT",spells:[[18,"Telekinesis"]]}]);
 A("Psi Warrior (2014)",[{n:"Telekinetic Master",l:18,lu:{n:"Telekinetic Master",max:1,reset:"long",tag:"Telekinesis, also back by spending a Psionic Energy die"}}]);
 A("Samurai",[{n:"Elegant Courtier",l:7,skillBonus:[["Persuasion","WIS"]]}]);
 A("Scofflaw",[{n:"Brutal Brawler",l:3,weapons:["Improvised weapons"]}]);
 A("Space Marine",[
  {n:"Impulse Frame",l:3,pick:[{k:"hardsuit",t:"item",n:1,yc:1,title:"Starshield Hardsuit (Splint Armor)",list:[["Starshield Hardsuit","Your Impulse Frame."]]}]},
  {n:"Heavy Frame",l:10,when:{key:"tsdmframe",val:"Heavy Frame"},acAdd:2,cond:"noShield",advOn:["Strength checks","Strength saving throws"]},
  {n:"Skirmish Frame",l:10,when:{key:"tsdmframe",val:"Skirmish Frame"},speedAdd:10},
  {n:"Wraith Frame",l:10,when:{key:"tsdmframe",val:"Wraith Frame"},def:["Note","Heavy armor gives you no Disadvantage on Stealth checks"]}]);
 /* Gadgeteer */
 A("Cyber Surgeon",[{n:"Skilled Surgeon",l:3,skillBonus:[["Medicine","INT",1]]}]);
 A("Hologrammer",[{n:"Dazzling Devices",l:6,pick:[{k:"dd",t:"item",n:2,yc:1,title:"Free Gadgets (do not count against your Gadgets)",list:[["Flashbang",""],["Invisibomb",""]]}]}]);
 A("Mastermaker",[
  {n:"Advanced Construct Grafts",l:3,pick:[{k:"acg",t:"item",n:2,yc:1,title:"Two Common or Uncommon Construct grafts",list:[["Arm Cannon","Arms slot graft."],["Shield Module","Internal slot graft."]]}]},
  {n:"Engineered Identity",l:6,pick:[{k:"ei",t:"item",n:2,yc:1,title:"Android Skin and Voice Changer (no graft slots used)",list:[["Android Skin","External graft."],["Voice Changer","Head graft."]]}]},
  {n:"Construct Perfection",l:14,abUp:[["INT",2,22]]},
  {n:"Reconfigure",l:3,abPick:{k:"recon",from:["STR","DEX","CHA","WIS"],up:2,max:20,title:"Reconfigure: +2 to one score (change after a rest)"}}]);
 A("Quantum Mechanic",[{n:"Temporal Relativism",l:3,spCls:"@sub:INT",spells:[[3,"Moment to Think"]]}]);
 /* Healer */
 A("Vow of the Siphon",[{n:"Siphon Spells",l:3,spListAdd:{cls:"Healer",from:"Wizard",school:"Necromancy"}}]);
 /* Investigator */
 A("Antiquarian",[{n:"Artifact Hoarder",l:3,lu:{n:"Artifact Hoarder: extra Trinkets use",max:1,reset:"long",tag:"One extra use of Trinkets"}}]);
 A("Conspiracy Theorist",[{n:"Paranoid Instincts",l:3,initAdv:true}]);
 A("Decommissioner",[{n:"System Cracker",l:3,skillProf:["Data"],pick:[{k:"syscrack",t:"skills",n:1,from:["Insight","Investigation","Technology"],title:"System Cracker: one more skill"}]}]);
 A("Detective",[{n:"Interrogator's Instinct",l:10,advOn:["ability checks to discern an illusion","ability checks to tell whether you hear a deliberate lie"]}]);
 A("Exterminator",[{n:"Silvered Shield",l:3,armor:["Medium","Shields"],acArmAb:"INT",cond:"medium"}]);
 A("Infernum",[{n:"Fiendish Familiar",l:3,spCls:"@sub:INT",spells:[[3,"Find Familiar"]]},{n:"Binding Contract",l:10,spCls:"@sub:INT",spells:[[10,"Geas"]]}]);
 A("Inquisitor",[{n:"Exorcist's Doctrines",l:3,spCls:"@sub:INT",spells:[[3,"Consecrated Armor"]]}]);
 A("Medium",[{n:"Fortelling",l:3,lu:{n:"Foretelling rolls",max:2,reset:"long",tag:"Two d20s recorded after a Long Rest"}}]);
 A("Spy",[{n:"Bravado",l:3,skillBonus:[["Deception","INT",1],["Persuasion","INT",1]]}]);
 /* Jaeger */
 A("Sanguine Chapter",[{n:"Blood Frenzy",l:17,toggle:BL,speedAdd:20}]);
 A("Marauder Chapter",[{n:"Unbreakable",l:3,hpLvl:1}]);
 /* Martyr */
 A("Burden of Ascension",[{n:"Olympic Agility",l:6,mv:{climb:"speed",swim:"speed"}}]);
 A("Burden of Awakening",[{n:"Psionic Awakening",l:3,spCls:"@sub:WIS",spells:[[3,"Mage Hand"]]}]);
 A("Burden of Fame",[{n:"Celebrity",l:3,skillBonus:[["Performance","WIS",1]]}]);
 A("Burden of Levity",[{n:"Ne'er-Do-Well",l:3,skillBonus:[["Deception","WIS",1]]}]);
 A("Burden of Odyssey",[{n:"Voyager's Agility",l:3,speedAdd:10}]);
 A("Burden of Truth",[{n:"Compelling Message",l:3,skillBonus:[["Persuasion","WIS",1]]},{n:"Seer",l:6,sense:[["Blindsight",30,""]]}]);
 A("Burden of Tyranny",[{n:"Diabolic Presence",l:3,skillBonus:[["Intimidation","WIS",1]]}]);
 A("Burden of the End",[{n:"Mystical Wisdom",l:3,skillBonus:[["Arcana","WIS",1]]}]);
 /* Monk */
 A("Warrior of Pride",[{n:"Assertive Attacker",l:3,toggle:BL,atkBonus:[{when:["unarmed"].concat(MONKW),dmg:"WIS",note:"Assertive Attacker (Bloodied)"}]}]);
 A("Warrior of Shadow",[{n:"Shadow Arts",l:3,darkAdd:60,spCls:"@sub:WIS",spells:[[3,"Minor Illusion"]]}]);
 A("Warrior of the Celestial",[{n:"Celestial Emissary",l:11,spCls:"@sub:WIS",spells:[[11,"Dream,Scrying"]]},
  {n:"Heavenborne",l:17,mv:{fly:"speed"},atkDice:[{when:"unarmed",d:"1d4",t:"Radiant",note:"Soul Strike"}]}]);
 A("Warrior of the Elements",[{n:"Manipulate Elements",l:3,spCls:"@sub:WIS",spells:[[3,"Elementalism"]]},
  {n:"Stride of the Elements",l:11,toggle:{id:"elem-attune",label:"Elemental Attunement active"},mv:{fly:"speed",swim:"speed"}}]);
 A("Warrior of the Living Weapon",[{n:"Perfect Form",l:17,toggle:{id:"perfect-form",label:"Perfect Form active"},acAdd:2}]);
 A("Way of the Astral Self",[{n:"Awakened Astral Self",l:17,toggle:{id:"astral-awakened",label:"Awakened Astral Self active"},acAdd:2}]);
 A("Way of the Kensei",[{n:"Path of the Kensei",l:3,pick:[{k:"kw",t:"weapon",n:2,title:"Kensei weapons: one melee and one ranged type"}],
  pickLv:[6,11,17].map(function(L){return {lv:L,k:"kw"+L,t:"weapon",n:1,title:"Kensei weapon, level "+L}})}]);
 /* Monster Hunter */
 A("Carver Guild",[{n:"Equipped for Battle",l:3,armor:["Heavy"]}]);
 A("Devourer Guild",[{n:"Transmuting Metabolism",l:3,lu:{n:"Transmuting Metabolism",max:{f:"1+mod:INT",min:1},reset:"long",tag:"Bonus Action"}}]);
 A("Occultist Guild",[{n:"Magical Aegis",l:15,spCls:"@sub:INT",spells:[[15,"Counterspell"]]}]);
 THIRD_SUBS["Occultist Guild"]={list:"Wizard",ab:"INT",cant:2};
 var HT={id:"hide-armor",label:"Wearing your Monster-Hide Armor",default:true},MH="gx-mh-sub-Trapper Guild",RT="gx-mhr-sub-Trapper Guild";
 A("Trapper Guild",[
  {n:"Monster-Hide Armor",l:15,pick:[{k:"mh",t:"multi",n:2,title:"Two armor modifications",list:[["Damage Resistance","Resistance to two damage types."],["Elemental Charge",""],["Hardened Defense","+2 AC."],["Phase Leap",""],["Regeneration",""],["Stealthy",""]]}]},
  {n:"Hardened Defense",l:15,when:{key:MH,val:"Hardened Defense"},toggle:HT,acAdd:2,cond:"armor"},
  {n:"Damage Resistance",l:15,when:{key:MH,val:"Damage Resistance"},pick:[{k:"mhr",t:"multi",n:2,title:"Two resistance types",list:["Acid","Cold","Fire","Lightning","Poison","Thunder"].map(function(t){return [t,""]})}]}
 ].concat(["Acid","Cold","Fire","Lightning","Poison","Thunder"].map(function(t){return {n:"Damage Resistance ("+t+")",l:15,when:{key:RT,val:t},toggle:HT,res:[t]}})));
 THIRD_SUBS["Warrior of the Mystic Arts"]={list:"Sorcerer",ab:"WIS",cant:2};
 /* Necromancer */
 var ARM={armor:["Light","Medium","Shields"],acArmAb:"INT",cond:"armor"};
 A("Black Rider",[Object.assign({n:"Corpse Cavalry",l:3},ARM),{n:"Dullahan",l:20,sense:[["Blindsight",120,"while you carry your skull jar"]],res:["Bludgeoning","Piercing","Slashing"]}]);
 A("Death Knight",[Object.assign({n:"Combat Research",l:3},ARM)]);
 A("Crone",[{n:"Witch's Cauldron",l:6,lu:{n:"Witch's Cauldron potions held",max:"mod:INT",reset:"long",tag:"Potions go inert after a Long Rest"}}]);
 A("Necrodancer",[{n:"Footloose",l:3,skillBonus:[["Acrobatics","INT",1],["Performance","INT",1]],weapons:["Martial weapons with Finesse or Ranged"]},{n:"Thriller",l:20,abUp:[["DEX",4,25],["CHA",4,25]]}]);
 A("Overlord",[{n:"Despotic Discourse",l:6,skillBonus:[["Deception","INT",1],["Intimidation","INT",1],["Persuasion","INT",1]]}]);
 A("Pale Master",[{n:"Chilling Disposition",l:6,skillBonus:[["Intimidation","INT",1]]},{n:"Archlich",l:20,advOn:["saves against spells and other magical effects"]}]);
 /* Data corrections (MISMATCH rows) */
 try{(LU_X||[]).forEach(function(e){if(e.owner==="Cyber Surgeon"&&e.feature==="Bio-Serum")e.reset="short1"})}catch(e){}
 try{
  var d=AUTO["Burden of Discord"];if(d)d.forEach(function(r){if(r[0]===3)r[1]=r[1].replace("Tasha's Tasha's","Tasha's")});
  var g=AUTO["Vow of the Augmenter"];if(g)g.forEach(function(r){if(r[0]===3&&r[1].indexOf("Enhance Ability")<0)r[1]=r[1].replace("Buff,","Buff,Enhance Ability,")});
  var p=AUTO["Vow of the Protector"];if(p&&!p.some(function(r){return r[0]===3}))p.unshift([3,"Aid,Prayer of Healing,Sanctuary,Shield"]);
 }catch(e){}
})();
