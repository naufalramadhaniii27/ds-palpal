/* fx data, ledger fix bin 9 (shards 22, 23, 24): items from tsgs/tvss/wdh/wbtw/wdmm/vrgr and species from tee24/tsgeh/tsdd/tsdm/thhw/erlw/wotc.
   Registry window.GX (SOURCE-NOTES.md "fx schema", "fx engine v4"). Texts re-read from the item and species rows in the repo before each entry.
   Overrides of old data (kept out of the original files):
   - window.FXO[item] replaces the old row fx (Splitter, Starmetal Shield, Monstrous Hide, Nocturnal Eyes, Badge of the Watch, Shield of the Uven Rune).
   - window.WXSP[book][species] fields patched in place (movesNote, lgn, linFx), LU_X / SAVE_NOTES / SP_AUTO rows fixed by name. This file loads after every book block (hbpack).
   Not modelled (engine has no field, see reports/ledger-skipped-L9.md): weapon dice replacement, reach, Expertise alternatives, tool Expertise, AC modifier caps, Kefnet's Blessing (half Proficiency only on checks without it). */
window.GX=window.GX||{};GX.item=GX.item||{};GX.species=GX.species||{};
window.FXO=window.FXO||{};
(function(){
 var W=window;
 function addI(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 function addS(n,e){GX.species[n]=(GX.species[n]||[]).concat(e)}
 var AB=["STR","DEX","CON","INT","WIS","CHA"];

 /* ---------- Items ---------- */
 addI("Seafarer's Jacket",{n:"Seafarer's Jacket",tools:["Navigator's Tools"],defs:[["Note","Expertise with Navigator's Tools if you already had proficiency with them"]]});
 addI("Shadow Drinker",{n:"Shadow Drinker (Curse)",vul:["Radiant"]});
 addI("Shaedenstaff",{n:"Shaedenstaff",advOn:["saves against mental stress effects"]});
 addI("Signet Rings of the Fey Court",{n:"Signet Rings of the Fey Court",spCls:"@species",spells:[[0,"Druidcraft"]],defs:[["Note","Elf's Trance (gained if you lack it)"]]});
 addI("Sling of the Tiny Giant",{n:"Sling of the Tiny Giant",atkDice:[{when:"Sling of the Tiny Giant",d:"1d4",t:"Force"}],atkBonus:[{when:"Sling of the Tiny Giant",note:"The extra Force damage is 1d4 per size category the target is larger than you, up to 3d4."}]});
 /* Splitter: the +1 AC is only for the split form (Handaxe and Quarterstaff in separate hands) */
 W.FXO["Splitter"]={fx:{atk:3,dmg:3}};
 addI("Squasher",{n:"Squasher",atkAb:{kind:"Squasher",ab:"WIS",opt:1,note:"Squasher: a Druid wielding it can use Wisdom instead of Strength for the melee attack and damage rolls"}});
 /* Staff of the Four Seasons: the season is picked, the extra 1d8 is of that season's type (while the staff has a charge) */
 var SEA=[["Spring","Radiant"],["Summer","Fire"],["Autumn","Necrotic"],["Winter","Cold"]],SK="gx-sea-item-Staff of the Four Seasons";
 addI("Staff of the Four Seasons",{n:"Staff of the Four Seasons",pick:[{k:"sea",t:"multi",n:1,title:"Current season",list:SEA.map(function(s){return [s[0],""]})}]});
 SEA.forEach(function(s){addI("Staff of the Four Seasons",{n:"Staff of the Four Seasons ("+s[0]+")",when:{key:SK,val:s[0]},atkDice:[{when:"Staff of the Four Seasons",d:"1d8",t:s[1]}],atkBonus:[{when:"Staff of the Four Seasons",note:"The extra damage needs at least 1 charge."}]})});
 addI("Staff of the Reverent Warrior",{n:"Staff of the Reverent Warrior",spCls:"@species",spells:[[0,"True Strike"]]});
 /* Starmetal Shield: +1 AC instead of the normal Shield bonus (+2), so the net change from the base Shield row is -1 */
 W.FXO["Starmetal Shield"]={fx:{ac:-1}};
 addI("Starmetal Shield",{n:"Starmetal Shield",defs:[["Note","The shield gives +3 AC against attacks made with a metal weapon or projectile"]]});
 addI("Storm Thrower Harpoon",{n:"Storm Thrower Harpoon",atkDice:[{when:"Storm Thrower Harpoon (thrown)",d:"1d8",t:"Lightning"}]});
 addI("Stormstruck Staff",{n:"Stormstruck Staff",atkDice:[{when:"Stormstruck Staff",d:"1",t:"Lightning"}],atkBonus:[{when:"Stormstruck Staff",note:"The extra Lightning damage becomes 1d6 while the crystal glows."}]});
 addI("Tectonic Gauntlets",{n:"Tectonic Gauntlets (Curse)",speedAdd:-5,abDown:[["INT",-4,7]],unarmed:{die:"1d8",t:"Bludgeoning"}});
 addI("The Rose Basket",{n:"The Rose Basket",atkDice:[{when:"The Rose Basket",d:"1d8",t:"Radiant"}],atkBonus:[{when:"The Rose Basket",note:"The extra Radiant damage is only against a Fey or a shape-shifted creature."}]});
 addI("Thornpiercer",{n:"Thornpiercer",weapons:["Dagger","Shortsword","Rapier","Whip"],atkDice:[{when:"Thornpiercer",d:"1d4",t:"Piercing"}]});
 addI("Thunderous Flail",{n:"Thunderous Flail",atkDice:[{when:"Thunderous Flail",d:"1d6",t:"Lightning"}],atkBonus:[{when:"Thunderous Flail",note:"The extra Lightning damage is for the first target you hit each turn and needs at least 1 charge."}]});
 addI("Visage of Delight and Disaster",{n:"Visage of Delight and Disaster",lu:{n:"Bardic Inspiration (Visage)",max:2,reset:"short",tag:"d10 dice",die:"d10"}});
 addI("Voltedge",{n:"Voltedge",atkDice:[{when:"Voltedge",d:"1d6",t:"Lightning"}]});
 addI("Wooden Chain of the Unbroken Circle",{n:"Wooden Chain of the Unbroken Circle",armor:["Medium"]});
 /* tvss grafts */
 addI("Burrowing Adaptation",{n:"Burrowing Adaptation",mv:{burrow:"speedHalf"}});
 addI("Heavy Legs",{n:"Heavy Legs",carryBump:true});
 W.FXO["Monstrous Hide"]={fx:null};
 addI("Monstrous Hide",{n:"Monstrous Hide",acBase:[13,"full"],acOver:true});
 addI("Monstrous Weapon",{n:"Monstrous Weapon",atkAb:{kind:"unarmed",ab:"DEX"},defs:[["Note","Unarmed Strike can deal Slashing damage by tier (tier table is in the book)"]]});
 W.FXO["Nocturnal Eyes"]={fx:null};
 addI("Nocturnal Eyes",{n:"Nocturnal Eyes",darkTo:60});
 /* other books */
 addI("Nepenthe",{n:"Nepenthe",atkDice:[{when:"Nepenthe",d:"2d10",t:"Radiant"}],atkBonus:[{when:"Nepenthe",note:"The extra Radiant damage is only against a fiend or an undead."}],advOn:["saves against spells and other magical effects (you and friendly creatures in the aura while you hold the drawn sword: 10 ft, 30 ft at Paladin 17)"]});
 addI("Witchlight Vane",{n:"Witchlight Vane",atkDice:[{when:"Witchlight Vane",d:"1d8",t:"Radiant"}],vul:["Lightning"],condImm:["Blinded","Deafened","Petrified","Stunned"]});
 addI("Woodcutter's Axe",{n:"Woodcutter's Axe",atkDice:[{when:"Woodcutter's Axe",d:"2d6",t:"Slashing"}],atkBonus:[{when:"Woodcutter's Axe",note:"The extra Slashing damage is only against a plant or a wooden object that is not worn or carried."}]});
 addI("Azuredge",{n:"Azuredge",atkDice:[{when:"Azuredge",d:"2d6",t:"Radiant"}],atkBonus:[{when:"Azuredge",note:"The extra Radiant damage is only against a fiend or an undead."}]});
 W.FXO["Badge of the Watch"]={fx:null};
 addI("Badge of the Watch",{n:"Badge of the Watch",acAdd:2,cond:"noShield"});
 addI("Blast Scepter",{n:"Blast Scepter",res:["Fire","Lightning"]});
 addI("Dagger of Blindsight",{n:"Dagger of Blindsight",sense:[["Blindsight",30,""]]});
 W.FXO["Shield of the Uven Rune"]={fx:{imm:["Cold"]}};
 addI("Vanrak's Mithral Shirt",{n:"Vanrak's Mithral Shirt",darkTo:60});

 /* ---------- Species ---------- */
 var LIN_NOTE_ARMOR="not while wearing Medium or Heavy armor";
 addS("Aasimar (Fernian)",{n:"Fernian Resistance",res:["Fire","Necrotic"]});
 addS("Aasimar (Mabaran)",{n:"Celestial Resistance",res:["Necrotic","Radiant"]});
 addS("Accursed (Steinhardt)",{n:"Eldritch Endurance",res:["Necrotic"]});
 addS("Ankylier",{n:"Bonus Languages",langs:["Archosauric"]});
 addS("Ankylier",{n:"Metalworker",tools:["Smith's Tools"],armor:["Medium"]});
 addS("Ankylier",{n:"Musclebound",carryBump:true});
 addS("Autognome",{n:"Mechanical Nature",defs:[["Immunity","Disease"]]});
 addS("Avia-Ra",{n:"Avian Eyes",advOn:["saving throws to avoid or end the Blinded condition"]});
 addS("Centaur (2014)",{n:"Equine Build",carryBump:true});
 addS("Cervan",{n:"Languages",langs:["Birdfolk","Cervan"]});
 addS("Child of Seth",{n:"Bonus Languages",langs:["Archosauric"],pick:[{k:"lang",t:"lang",n:1,title:"One other language"}]});
 addS("Child of Seth",{n:"Global Migrators",skillProf:["Athletics"]});
 addS("Corvum",{n:"Languages",langs:["Birdfolk"],defs:[["Note","You understand Auran but cannot speak it naturally"]]});
 addS("Cursed-Blood",{n:"Vigilant",init:"pb",noSurprise:true});
 var TF="Cursed-Blood: Together Forever";
 addS("Cursed-Blood",{n:"Together Forever (Watchful Twin 3)",l:3,when:{key:"lin",val:"Watchful Twin"},lu:{n:TF+": Detect Magic",max:1,reset:"long",tag:"1/Long Rest spell"}});
 addS("Cursed-Blood",{n:"Together Forever (Watchful Twin 5)",l:5,when:{key:"lin",val:"Watchful Twin"},lu:{n:TF+": See Invisibility",max:1,reset:"long",tag:"1/Long Rest spell"}});
 addS("Cursed-Blood",{n:"Together Forever (Spirit Twin 3)",l:3,when:{key:"lin",val:"Spirit Twin"},lu:{n:TF+": turn a Critical Hit into a normal hit",max:1,reset:"short",tag:"Short or Long Rest"}});
 addS("Deep One Dwarf",{n:"Otherworldly Resistance",res:["Cold"],advOn:["saving throws to avoid or end the Poisoned condition"]});
 addS("Demidritch",{n:"Astral Sight",advOn:["saving throws against the Blinded condition"]});
 addS("Demidritch",{n:"Shard of Infinity",res:["Cold"]});
 addS("Dhakaani Ghaal'dar (Hobgoblin)",{n:"Discipline",advOn:["saving throws to avoid or end the Charmed condition"]});
 addS("Dhakaani Golin'dar (Goblin)",{n:"Discipline",advOn:["saving throws to avoid or end the Charmed condition"]});
 addS("Dwarf (Kaladesh)",{n:"Artisan's Expertise",defs:[["Note","Your Proficiency Bonus is doubled on checks with the two Artisan's Tools you chose"]]});
 var MARKS={
  "Dwarf (Mark of Warding)":["Alarm","Armor of Agathys","Arcane Lock","Knock","Glyph of Warding","Magic Circle","Leomund's Secret Chest","Mordenkainen's Faithful Hound","Antilife Shell"],
  "Elf (Mark of Shadow)":["Disguise Self","Silent Image","Darkness","Pass without Trace","Clairvoyance","Major Image","Greater Invisibility","Hallucinatory Terrain","Mislead"],
  "Gnome (Mark of Scribing)":["Comprehend Languages","Illusory Script","Animal Messenger","Silence","Sending","Tongues","Arcane Eye","Confusion","Dream"],
  "Half-Elf (Mark of Detection)":["Detect Evil and Good","Detect Poison and Disease","Detect Thoughts","Find Traps","Clairvoyance","Nondetection","Arcane Eye","Divination","Legend Lore"],
  "Half-Elf (Mark of Storm)":["Feather Fall","Fog Cloud","Gust of Wind","Levitate","Sleet Storm","Wind Wall","Conjure Minor Elementals","Control Water","Conjure Elemental"],
  "Half-Orc (Mark of Finding)":["Faerie Fire","Longstrider","Locate Animals or Plants","Locate Object","Clairvoyance","Speak with Plants","Divination","Locate Creature","Commune with Nature"],
  "Halfling (Mark of Healing)":["Cure Wounds","Healing Word","Lesser Restoration","Prayer of Healing","Aura of Vitality","Mass Healing Word","Aura of Purity","Aura of Life","Greater Restoration"],
  "Halfling (Mark of Hospitality)":["Goodberry","Sleep","Aid","Calm Emotions","Create Food and Water","Leomund's Tiny Hut","Aura of Purity","Mordenkainen's Private Sanctum","Hallow"],
  "Human (Mark of Finding)":["Faerie Fire","Longstrider","Locate Animals or Plants","Locate Object","Clairvoyance","Speak with Plants","Divination","Locate Creature","Commune with Nature"],
  "Human (Mark of Handling)":["Animal Friendship","Speak with Animals","Beast Sense","Calm Emotions","Beacon of Hope","Conjure Animals","Aura of Life","Dominate Beast","Awaken"],
  "Human (Mark of Making)":["Identify","Tenser's Floating Disk","Continual Flame","Magic Weapon","Conjure Barrage","Elemental Weapon","Fabricate","Stone Shape","Creation"],
  "Human (Mark of Passage)":["Expeditious Retreat","Jump","Misty Step","Pass without Trace","Blink","Phantom Steed","Dimension Door","Freedom of Movement","Teleportation Circle"],
  "Human (Mark of Sentinel)":["Compelled Duel","Shield of Faith","Warding Bond","Zone of Truth","Counterspell","Protection from Energy","Death Ward","Guardian of Faith","Bigby's Hand"]};
 Object.keys(MARKS).forEach(function(k){addS(k,{n:"Spells of the Mark",spListAdd:{spells:MARKS[k]}})});
 /* Feathren: the Feline ancestry spell at level 3 (the opts rows had an empty fx) */
 [["Detect Evil and Good",["Lion","Panther","Saber-Toothed Tiger"]],["Detect Poison and Disease",["Cheetah","Serval","Tiger"]],["Detect Magic",["Jaguar","Lynx","Snow Leopard"]]].forEach(function(g){
  g[1].forEach(function(c){addS("Feathren",{n:"Feline Ancestry ("+c+")",l:3,when:{key:"spopt",val:c},spCls:"@species",spells:[[3,g[0]]]})})});
 addS("Gallus",{n:"Languages",langs:["Birdfolk"],defs:[["Note","You understand Auran but cannot speak it naturally"]]});
 addS("Giff",{n:"Hippo Build",advOn:["Strength checks","Strength saving throws"],carryBump:true});
 addS("Hedge",{n:"Curl Up",toggle:{id:"hedge-curl",label:"Curled up (base AC 19)",default:false},acBase:[19,""],cond:"noBody"});
 addS("Jeholrak",{n:"Cutthroat Society",advOn:["Dexterity (Sleight of Hand) checks"]});
 addS("Kalamer Landwalker (Merfolk)",{n:"Blessing of the Sea (landwalker form)",toggle:{id:"kalamer-landwalker",label:"Landwalker form (Speed +20 ft, no Swim Speed)",default:false},speedAdd:20,defs:[["Note","Swim Speed is 0 in landwalker form"]]});
 addS("Kuo-Toa",{n:"Otherworldly Perception",sense:[["Otherworldly Perception",30,"You sense any invisible creature, or one on the Ethereal Plane, within 30 ft"]]});
 addS("Limukin",{n:"Bonus Languages",langs:["Archosauric"]});
 addS("Limukin",{n:"Innate Toxicology",res:["Poison"],advOn:["checks and saves to avoid or end the Poisoned condition"]});
 addS("Luma",{n:"Resilience (Sable)",when:{key:"lin",val:"Sable"},res:["Poison"],advOn:["saves against poison"]});
 addS("Raptor",{n:"Agile (Mistral)",when:{key:"lin",val:"Mistral"},skillProf:["Acrobatics"]});
 addS("Strig",{n:"Imposing (Stout)",when:{key:"lin",val:"Stout"},skillProf:["Intimidation"]});
 addS("Strig",{n:"Survivor (Swift)",when:{key:"lin",val:"Swift"},skillProf:["Survival"]});
 addS("Luma",{n:"Center of Attention (Sera)",when:{key:"lin",val:"Sera"},skillProf:["Performance"]});
 addS("Manikin",{n:"Born to Serve",defs:[["Note","Disadvantage on Wisdom (Insight) checks"]]});
 addS("Manikin",{n:"Integrated Gold Plating (Infiltrator)",when:{key:"lin",val:"Infiltrator"},acBase:[11,"full"],acOver:true,advOn:["Dexterity (Stealth) checks"]});
 addS("Manikin",{n:"Integrated Gold Plating (Sentinel)",when:{key:"lin",val:"Sentinel"},acBase:[13,"full"],acDexMax:2,acOver:true});
 addS("Manikin",{n:"Integrated Gold Plating (Tormentor)",when:{key:"lin",val:"Tormentor"},defs:[["Note","Disadvantage on Dexterity (Stealth) checks"]]});
 addS("Manyhorn",{n:"Bonus Languages",langs:["Archosauric"]});
 addS("Manyhorn",{n:"Head Crest",skillProf:["Intimidation"]});
 addS("Manyhorn",{n:"Musclebound",carryBump:true});
 addS("Mapach",{n:"Resilience",advOn:["saves against poison"]});
 addS("Nautilid",{n:"Armored Suit",toggle:{id:"nautilid-suit",label:"Wearing the Aqua Suit",default:false},acBase:[13,"full"],acOver:true});
 addS("Nautilid",{n:"Fire Resistance",toggle:{id:"nautilid-suit",label:"Wearing the Aqua Suit",default:false},res:["Fire"]});
 addS("Pallid Elf",{n:"Incisive Sense",advOn:["Intelligence (Investigation) and Wisdom (Insight) checks"]});
 addS("Pluvenn",{n:"Bonus Languages",langs:["Archosauric"]});
 addS("Reborn (VRGR)",{n:"Deathless Nature",advOn:["Death Saving Throws"]});
 addS("Reborn",{n:"Escaped Death",advOn:["Death Saving Throws"]});
 addS("Scourgeborne",{n:"Eldritch Curse",defs:[["Immunity","Spells that change your form (such as Alter Self and Polymorph)"]]});
 addS("Shifter (Beasthide)",{n:"Shifting Feature",toggle:{id:"shifter-shifted",label:"Shifted (+1 AC)",default:false},acAdd:1});
 addS("Shifter (Swiftstride)",{n:"Shifting Feature",toggle:{id:"shifter-shifted",label:"Shifted (+10 ft Speed)",default:false},speedAdd:10});
 addS("Skathári",{n:"Natural Armor",acBase:[13,"full"]});
 addS("Tortle (2014)",{n:"Shell Defense",toggle:{id:"tortle-shell",label:"In your shell (Shell Defense)",default:false},acAdd:4,advOn:["Strength and Constitution saves"],defs:[["Note","In the shell: Prone, Speed 0, Disadvantage on Dexterity saves, no Reactions"]]});
 addS("Vect",{n:"Inflexible Mind",advOn:["saves to avoid or end the Charmed condition"]});
 addS("Vect",{n:"Thermalsight",sense:[["Thermalsight",60,""]]});
 addS("Vulpin",{n:"Evasive",saveBonusAb:[["DEX","INT"]]});
 addS("Warforged (2014)",{n:"Constructed Resilience",defs:[["Immunity","Disease"]]});
 addS("Wrothian",{n:"Psychic Resistance",res:["Psychic"]});

 /* ---------- Patches to book data (in place, this file loads after the books) ---------- */
 function sp(book,name){return window.WXSP&&WXSP[book]&&WXSP[book][name]}
 var s;
 if((s=sp("dmg14","Aarakocra (Monster)"))&&s.fx)s.fx.movesNote=LIN_NOTE_ARMOR;
 if((s=sp("tsdd","Child of Seth"))&&s.fx)s.fx.movesNote="20 ft while wearing Medium or Heavy armor";
 if((s=sp("tsgeh","Cursed-Blood"))&&s.fx)s.fx.movesNote=LIN_NOTE_ARMOR;
 if((s=sp("dmg14","Eladrin Elf")))s.lgn=1;
 /* Iggwilv's Cauldron: it has no charge pool (the ch row was the wand it can make); its properties are once-per-dawn uses written in the text */
 if(window.WXI)Object.keys(WXI).forEach(function(b){(WXI[b]||[]).forEach(function(r){if(r[0]==="Iggwilv's Cauldron"&&r[5]&&r[5].ch)delete r[5].ch})});
 /* Accursed (Steinhardt): spell table and Limited Use rows were keyed to "Accursed" */
 if(typeof SP_AUTO!=="undefined"&&SP_AUTO["Accursed"]&&!SP_AUTO["Accursed (Steinhardt)"])SP_AUTO["Accursed (Steinhardt)"]=SP_AUTO["Accursed"];
 if(typeof LU_X!=="undefined")LU_X.forEach(function(e){if(e.src==="species"&&e.owner==="Accursed"&&e.feature==="Legacy of a Thousand Young")e.owner="Accursed (Steinhardt)"});
 /* Avia-Ra Zealous: the text has no use limit */
 if(typeof LU_X!=="undefined"){for(var i=LU_X.length-1;i>=0;i--){var e=LU_X[i];if(e.src==="species"&&e.owner==="Avia-Ra"&&e.feature==="Zealous")LU_X.splice(i,1)}}
 /* Kalashtar: the Githzerai save note was matched by trait name only */
 if(typeof SAVE_NOTES!=="undefined")SAVE_NOTES.forEach(function(r){if(r[0]==="trait"&&r[1]==="Mental Discipline"&&r.length<4)r[3]="Githzerai (2014)"});
})();
