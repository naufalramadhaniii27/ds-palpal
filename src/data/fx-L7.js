/* fx ledger bin 7 (items): fixes for ledger verdicts MISS and MISMATCH of shards 18 and 19 (magic items from the 2014 books, Theros gifts, Tal'Dorei, Eberron).
   Schema: SOURCE-NOTES.md, "fx schema" and "fx engine v4". Each row was checked against the item text in the data rows (wotc11-magic-items-2014.js, q01-reward.js, tp01-tdcsr.js, tp04-tee24.js).
   Two tables, same as fx-D-item.js:
   - window.FXO[item]: replaces the old row fx (null drops it). Used where the old fx counted something the item does not give, or counted it all the time.
   - window.GX.item[item]: fx engine entries (item equipped, and attuned when it needs it).
   Equipping an item is what turns its effects on, so a use pool made with lu shows while the item is marked equipped.
   Not done here (engine has no field, see reports/ledger-skipped-L7.md): weapon dice replacement (Gurt's Greataxe), a weapon row added by an item (Claws of the Umber Hulk), a weapon property added by an item (Windvane finesse).
   Teeth of Dahlver-Nar was already fixed by FXO in fx-D-item.js (the ledger read the raw row). */
(function(){
 var W=window;W.FXO=W.FXO||{};W.GX=W.GX||{};var G=W.GX.item=W.GX.item||{};
 function add(n,e){(G[n]=G[n]||[]).push(e)}
 function ov(n,fx){W.FXO[n]={fx:fx}}
 var A2=function(s){return [s,""]};

 /* ---- Saving throws and ability checks ---- */
 /* Ioun Stone of Self-Preservation: +1 to Intelligence saving throws only (the row counted +1 to every save) */
 ov("Ioun Stone, Self-Preservation",null);
 add("Ioun Stone, Self-Preservation",{n:"Ioun Stone, Self-Preservation",saveBonusAb:[["INT",1]]});
 /* Supreme Intellect: +1 to Intelligence checks, counted on every Intelligence skill */
 add("Ioun Stone, Supreme Intellect",{n:"Ioun Stone, Supreme Intellect",chkBonus:[["INT",1]]});
 /* Leather Golem Armor: +1 AC; the +1 to saves is only against spells and other magical effects, so it is a note, not a flat save bonus */
 ov("Leather Golem Armor",{ac:1,res:["Lightning"]});
 add("Leather Golem Armor",{n:"Leather Golem Armor",saveNote:["+1 bonus to saving throws against spells and other magical effects"]});
 /* Netherese Ring of Protection: +1 AC and saves; the +4 is only to avoid dropping or being disarmed of the held item */
 ov("Netherese Ring of Protection",{ac:1,save:1});
 add("Netherese Ring of Protection",{n:"Netherese Ring of Protection",saveNote:["+4 bonus to saves and checks made to avoid dropping or being disarmed of an item held in the ring hand"]});
 /* Powered Armor: advantage on death saves (AC +1 and Strength 18 are in the row) */
 add("Powered Armor",{n:"Powered Armor",advOn:["death saving throws"]});

 /* ---- Dragon masks: Dragon Tongue, Dragon Sight, Legendary Resistance, Damage Absorption ---- */
 /* Damage Absorption: Resistance, or Immunity when you already have Resistance from another source (resToImm). The old row res is dropped, else the mask would upgrade its own resistance. */
 [["Black","Acid"],["Blue","Lightning"],["Green","Poison"],["Red","Fire"],["White","Cold"]].forEach(function(c){
  var n=c[0]+" Dragon Mask";ov(n,null);
  add(n,{n:"Damage Absorption",resToImm:[c[1]]});
  add(n,{n:"Dragon Sight",darkAdd:60});
  add(n,{n:"Dragon Tongue",langs:["Draconic"]});
  add(n,{n:"Legendary Resistance",lu:{n:"Legendary Resistance",max:1,reset:"dawn"}})});
 /* Mask of the Dragon Queen: Damage Absorption of all five masks (plain resistance, nothing else of the five to upgrade it) and five Legendary Resistance */
 add("Mask of the Dragon Queen",{n:"Damage Absorption",res:["Acid","Cold","Fire","Lightning","Poison"]});
 add("Mask of the Dragon Queen",{n:"Legendary Resistance",lu:{n:"Legendary Resistance",max:5,reset:"dawn"}});

 /* ---- Advantage on saves, checks and passive notes ---- */
 add("Greater Silver Sword",{n:"Greater Silver Sword",advOn:["Intelligence saving throws","Wisdom saving throws","Charisma saving throws"]});
 add("Mindguard Crown",{n:"Mindguard Crown",advOn:["Intelligence saving throws","Wisdom saving throws","Charisma saving throws"]});
 add("Dragonguard",{n:"Dragonguard",advOn:["saving throws against the breath weapons of Dragons"]});
 add("Lost Crown of Besilmer",{n:"Lost Crown of Besilmer",advOn:["saving throws against effects that would charm you"]});
 add("Bracers of Celerity",{n:"Bracers of Celerity",speedAdd:10,speedAddIf:{fly:10,swim:10,climb:10,burrow:10},advOn:["saving throws to avoid or end the Paralyzed or Restrained condition on yourself"]});
 add("Stonespeaker Crystal",{n:"Stonespeaker Crystal",advOn:["Intelligence (Investigation) checks"]});
 add("Piwafwi of Fire Resistance",{n:"Piwafwi of Fire Resistance",res:["Fire"]});
 add("Breastplate of Kamvuul Norek",{n:"Breastplate of Kamvuul Norek",advOn:["saving throws against spells and other magical effects"],defs:[["Note","A Critical Hit against you becomes a normal hit"]]});
 add("Cloak of Shadows",{n:"Cloak of Shadows",advOn:["Dexterity (Stealth) checks"],defs:[["Note","A creature making a Wisdom (Perception) check to notice you has Disadvantage"]]});
 ["Rare","Uncommon","Very Rare"].forEach(function(r){var n="Coat of Many Eyes ("+r+")";
  add(n,{n:"Coat of Many Eyes",advOn:["sight-based Wisdom (Perception) checks"]});
  if(r!=="Uncommon")add(n,{n:"Coat of Many Eyes ("+r+")",sense:[["See Invisible",120,"Invisible creatures and objects within 120 ft"]]})});
 add("Shadowfell Brand Tattoo",{n:"Shadow Essence",darkTo:60,advOn:["Dexterity (Stealth) checks"]});

 /* ---- Extra damage dice on a hit, languages and senses of weapons ---- */
 function dice(n,d,t,note){add(n,{n:n,atkDice:[{when:n,d:d,t:t,note:note}]})}
 dice("Dragontooth Dagger","1d6","acid");
 add("Dragontooth Dagger",{n:"Draconic Potency",atkBonus:[{when:"Dragontooth Dagger",note:"Against enemies of the Cult of the Dragon the bonus to attack and damage is +2 and the extra acid is 2d6."}]});
 ov("Hazirawn",{atk:2,dmg:2});        /* attuned value; equipping an attunement item counts as attuned */
 dice("Hazirawn","2d6","necrotic");
 dice("Red Wizard Blade","3d12","necrotic","Extra damage on a melee hit: 3d12 necrotic");
 dice("Akmon, Hammer of Purphoros","3d10","fire");
 add("Akmon, Hammer of Purphoros",{n:"Reforged",tools:["Smith's Tools"],advOn:["ability checks made using Smith's Tools"]});
 dice("Dekella, Bident of Thassa","2d10","cold");
 dice("Khrusor, Spear of Heliod","2d8","radiant");
 dice("Mastix, Whip of Erebos","2d8","necrotic");
 add("Mastix, Whip of Erebos",{n:"Whip of the Dead",atkBonus:[{when:"Mastix, Whip of Erebos",note:"You regain hit points equal to half the necrotic damage dealt."}]});
 dice("Devotee's Censer","1d8","radiant");
 dice("Spider Staff","1d6","poison","Extra damage on a weapon hit: 1d6 poison");
 dice("Drown","1d8","cold");
 add("Drown",{n:"Water Mastery",langs:["Aquan"]});
 dice("Ironfang","1d8","thunder");
 add("Ironfang",{n:"Earth Mastery",langs:["Terran"],sense:[["Tremorsense",60,""]]});
 dice("Tinderstrike","2d6","fire");
 add("Tinderstrike",{n:"Fire Mastery",langs:["Ignan"]});
 dice("Windvane","1d6","lightning");
 add("Windvane",{n:"Air Mastery",langs:["Auran"]});
 /* Ephixis: crit on 19-20 (the note on the bow row) */
 add("Ephixis, Bow of Nylea",{n:"Bow of the Wild",atkBonus:[{when:"Ephixis, Bow of Nylea",crit:19,note:"No disadvantage at long range."}]});
 /* Insignia of Claws: +1 attack and damage with unarmed strikes and natural weapons only (the row counted +1 on every attack) */
 ov("Insignia of Claws",null);
 add("Insignia of Claws",{n:"Insignia of Claws",atkBonus:[{when:["unarmed","natural"],atk:1,dmg:1,note:"Magical (Insignia of Claws)."}]});
 /* Shard of Xeluan: the Strength increase stops at 22 (the row stopped at 20) */
 ov("Shard of Xeluan",{spellAtk:1,abil:["STR",4,22]});
 /* Nightbringer: one damage immunity picked when attuning (the row gave all five); 4d4 radiant on a hit; darkvision +60 (evil only, like the condition immunities already in the row) */
 ov("Nightbringer",{atk:3,dmg:3,condImm:["Charmed","Frightened"]});
 add("Nightbringer",{n:"Nightbringer",atkDice:[{when:"Nightbringer",d:"4d4",t:"radiant"}],darkAdd:60,
  pick:[{k:"imm",t:"multi",n:1,title:"Damage immunity (choose when you attune)",list:["Acid","Cold","Fire","Lightning","Poison"].map(A2)}]});
 ["Acid","Cold","Fire","Lightning","Poison"].forEach(function(t){
  add("Nightbringer",{n:"Blessing of the Dragon Queen",when:{key:"gx-imm-item-Nightbringer",val:t},imm:[t]})});
 /* Orcsplitter: cannot be frightened while not incapacitated. Incapacitated itself is not an immunity */
 ov("Orcsplitter",{atk:2,dmg:2,condImm:["Frightened"]});
 /* Graz'tchar: the 120 ft darkvision belongs to the sentient sword, not to the wielder */
 ov("Graz'tchar, the Decadent End",{atk:3,dmg:3});
 /* Niko's Mace: +9 is the spell attack of Summon Celestial cast from the mace, not a bonus to mace attacks */
 ov("Niko's Mace",null);
 /* Items whose bonus belongs to a vehicle, a place or ammunition, not to the carrier */
 ov("Tasha's Creeping Keelboat",null);
 ov("Flying Chariot",null);
 ov("Banner of the Krig Rune",null);
 ov("Sling Bullets of Althemone",null);

 /* ---- Toggles: effects that only run while the power is active ---- */
 ov("Wingwear",null);
 add("Wingwear",{n:"Wingwear",toggle:{id:"wingwear-fly",label:"Wingwear gliding (Fly 30 ft)"},mv:{fly:30}});
 ov("Ghost Step Tattoo",null);
 add("Ghost Step Tattoo",{n:"Ghostly Form",toggle:{id:"ghost-step",label:"Ghostly Form (incorporeal)"},condImm:["Grappled","Restrained"],
  defs:[["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical attacks (while incorporeal)"]]});
 [["Dormant",1],["Awakened",2],["Exalted",3]].forEach(function(c){var n="Star Razor ("+c[0]+")";
  ov(n,null);
  add(n,{n:"Star Razor",toggle:{id:"star-razor-glow",label:"Star Razor glowing"},atkBonus:[{when:n,atk:c[1],dmg:c[1]}],res:["Radiant"]})});

 /* ---- Armor Class: Barrier Tattoo (no armor, a Shield is allowed) ---- */
 add("Barrier Tattoo (Large)",{n:"Protection",acBase:[18,""],cond:"noBody"});
 add("Barrier Tattoo (Medium)",{n:"Protection",acBase:[15,"full"],acDexMax:2,cond:"noBody"});
 add("Barrier Tattoo (Small)",{n:"Protection",acBase:[12,"full"],cond:"noBody"});

 /* ---- Spells, cantrips, unarmed strike, truesight ---- */
 add("Crystalline Chronicle",{n:"Crystalline Chronicle",spCls:"@sub:INT",spells:[[0,"Mage Hand,Mind Sliver,Message"]]});
 add("Flamefriend Lantern",{n:"Flamefriend Lantern",spCls:"@sub:WIS",spells:[[0,"Produce Flame"]]});
 /* Crawling Gauntlet: no casting ability is named for Mage Hand, Intelligence is used (the cantrip has no attack or save) */
 add("Crawling Gauntlet",{n:"Crawling Gauntlet",unarmed:{die:"1d6",t:"Slashing"},spCls:"@sub:INT",spells:[[0,"Mage Hand"]]});
 add("Circlet of Barbed Vision (Exalted)",{n:"Exalted",sense:[["Truesight",60,""]]});

 /* ---- Use pools ---- */
 add("Tankard of Plenty",{n:"Tankard of Plenty",lu:{n:"Tankard of Plenty",max:3,reset:"dawn"}});
 add("Mythallar Bracelet",{n:"Mythallar Bracelet",lu:{n:"Mythallar beads",max:3,reset:"none",tag:"Each bead is used up. The bracelet loses its magic after the third"}});

 /* ---- Theros gifts ---- */
 /* Champion gifts: +2 to one of two scores, and the cap for that score rises by 2 (22) */
 [["Affliction","DEX","WIS"],["Deception","DEX","CHA"],["Destiny","STR","WIS"],["Harvests","CON","WIS"],["Horizons","CON","INT"],["Slaughter","STR","CON"],["Storms","INT","WIS"],
  ["Victory","STR","CHA"],["the Dead","CON","WIS"],["the Forge","STR","INT"],["the Hunt","DEX","WIS"],["the Passage","INT","WIS"],["the Polis","INT","CHA"],["the Sea","DEX","INT"],["the Sun","STR","WIS"]].forEach(function(c){
  var n="Champion of "+c[0];add(n,{n:n,abPick:{k:"a",from:[c[1],c[2]],up:2,max:22,title:"Raise one score by 2 (cap 22)"}})});
 /* Devotee gifts: the spell can be cast a number of times equal to the ability modifier (minimum 1) per Long Rest. Spell and ability read from each gift text. */
 [["Athreos's Devotee","WIS","Gentle Repose"],["Ephara's Devotee","INT","Comprehend Languages"],["Erebos's Devotee","WIS","Bane"],["Heliod's Devotee","WIS","Bless"],
  ["Iroas's Devotee","CHA","Compelled Duel"],["Klothys's Devotee","WIS","Command"],["Kruphix's Devotee","INT","Detect Magic"],["Mogis's Devotee","CON","Wrathful Smite"],
  ["Nylea's Devotee","WIS","Hunter's Mark"],["Pharika's Devotee","WIS","Ray of Sickness"],["Phenax's Devotee","CHA","Disguise Self"],["Purphoros's Devotee","INT","Shield of Faith"],
  ["Thassa's Devotee","INT","Fog Cloud"],["Nylea's Votary","WIS","Speak with Animals"]].forEach(function(c){
  add(c[0],{n:c[0],lu:{n:c[2],max:"mod:"+c[1],reset:"long",tag:c[0]}})});
 add("Keranos's Devotee",{n:"Keranos's Devotee",lu:{n:"Keranos's lightning",max:"mod:INT",reset:"long",tag:"Extra 1d6 lightning once per turn on a weapon hit"}});
 add("Pharika's Disciple",{n:"Pharika's Disciple",lu:{n:"Pharika's touch",max:"mod:WIS",reset:"long",tag:"Heal 1d8 + WIS and end a disease or poison, or halve its weapon damage"}});
 add("Kruphix's Devotee",{n:"Kruphix's Devotee",spCls:"@sub:INT",spells:[[0,"Mage Hand"]]});
 add("Purphoros's Devotee",{n:"Purphoros's Devotee",spCls:"@sub:INT",spells:[[0,"Mending"]]});
 /* Votary and Disciple gifts: passive advantage and immunity */
 add("Heliod's Disciple",{n:"Heliod's Disciple",advOn:["saving throws against being Blinded"]});
 add("Iroas's Votary",{n:"Iroas's Votary",advOn:["saving throws against being Frightened"]});
 add("Karametra's Votary",{n:"Karametra's Votary",advOn:["saving throws against being Poisoned"]});
 add("Klothys's Votary",{n:"Klothys's Votary",advOn:["saving throws against being Charmed"]});
 add("Kruphix's Votary",{n:"Kruphix's Votary",advOn:["saving throws against being Charmed"]});
 add("Nylea's Votary",{n:"Nylea's Votary",advOn:["saving throws against being Poisoned"]});
 add("Pharika's Votary",{n:"Pharika's Votary",advOn:["saving throws against being Poisoned"],defs:[["Immunity","Disease"]]});
 add("Purphoros's Votary",{n:"Purphoros's Votary",advOn:["saving throws against being knocked Prone"]});
 add("Mogis's Disciple",{n:"Mogis's Disciple",advOn:["saving throws against being Charmed","saving throws against being Frightened"]});
 add("Thassa's Disciple",{n:"Thassa's Disciple",advOn:["saving throws against being Charmed","saving throws against being Restrained"]});
 add("Klothys's Disciple",{n:"Klothys's Disciple",noSurprise:"Cannot be surprised while you are not incapacitated"});
 add("Blessing of Dumathoin",{n:"Blessing of Dumathoin",darkTo:60,defs:[["Note","If you already had Darkvision, you can see color in the dark"]]});
})();
