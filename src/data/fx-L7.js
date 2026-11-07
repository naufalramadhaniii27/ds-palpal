/* fx ledger bin 7 (items): fixes for ledger verdicts MISS and MISMATCH of shards 18 and 19 (magic items from the 2014 books, Theros gifts, Tal'Dorei, Eberron).
   Schema: SOURCE-NOTES.md, "fx schema" and "fx engine v4". Each row was checked against the item text in the data rows (wotc11-magic-items-2014.js, q01-reward.js, tp01-tdcsr.js, tp04-tee24.js).
   Two tables, same as fx-D-item.js:
   - window.FXO[item]: replaces the old row fx (null drops it). Used where the old fx counted something the item does not give, or counted it all the time.
   - window.GX.item[item]: fx engine entries (item equipped, and attuned when it needs it).
   Equipping an item is what turns its effects on, so a use pool made with lu shows while the item is marked equipped.
   Not done here (engine has no field, see reports/ledger-skipped-L7.md): weapon dice replacement (Gurt's Greataxe), a weapon row added by an item (Claws of the Umber Hulk), a weapon property added by an item (Windvane finesse).
   Teeth of Dahlver-Nar was already fixed by FXO in fx-D-item.js (the ledger read the raw row). */
(function(){
 var W=DataEnv.slot;W.FXO=W.FXO||{};W.GX=W.GX||{};var G=W.GX.item=W.GX.item||{};
 function add(n,e){(G[n]=G[n]||[]).push(e)}
 function ov(n,fx){W.FXO[n]={fx:fx}}
 var A2=function(s){return [s,""]};

 /* ---- Saving throws and ability checks ---- */
 /* Ioun Stone of Self-Preservation: +1 to Intelligence saving throws only (the row counted +1 to every save) */
 /* Supreme Intellect: +1 to Intelligence checks, counted on every Intelligence skill */
 /* Leather Golem Armor: +1 AC; the +1 to saves is only against spells and other magical effects, so it is a note, not a flat save bonus */
 /* Netherese Ring of Protection: +1 AC and saves; the +4 is only to avoid dropping or being disarmed of the held item */
 ov("Netherese Ring of Protection",{ac:1,save:1});
 add("Netherese Ring of Protection",{n:"Netherese Ring of Protection",saveNote:["+4 bonus to saves and checks made to avoid dropping or being disarmed of an item held in the ring hand"]});
 /* Powered Armor: advantage on death saves (AC +1 and Strength 18 are in the row) */

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
 add("Breastplate of Kamvuul Norek",{n:"Breastplate of Kamvuul Norek",advOn:["saving throws against spells and other magical effects"],defs:[["Note","A Critical Hit against you becomes a normal hit"]]});
 ["Rare","Uncommon","Very Rare"].forEach(function(r){var n="Coat of Many Eyes ("+r+")";
  add(n,{n:"Coat of Many Eyes",advOn:["sight-based Wisdom (Perception) checks"]});
  if(r!=="Uncommon")add(n,{n:"Coat of Many Eyes ("+r+")",sense:[["See Invisible",120,"Invisible creatures and objects within 120 ft"]]})});

 /* ---- Extra damage dice on a hit, languages and senses of weapons ---- */
 function dice(n,d,t,note){add(n,{n:n,atkDice:[{when:n,d:d,t:t,note:note}]})}
 dice("Dragontooth Dagger","1d6","acid");
 add("Dragontooth Dagger",{n:"Draconic Potency",atkBonus:[{when:"Dragontooth Dagger",note:"Against enemies of the Cult of the Dragon the bonus to attack and damage is +2 and the extra acid is 2d6."}]});
/* attuned value; equipping an attunement item counts as attuned */
 dice("Dekella, Bident of Thassa","2d10","cold");
 dice("Mastix, Whip of Erebos","2d8","necrotic");
 add("Mastix, Whip of Erebos",{n:"Whip of the Dead",atkBonus:[{when:"Mastix, Whip of Erebos",note:"You regain hit points equal to half the necrotic damage dealt."}]});
 /* Ephixis: crit on 19-20 (the note on the bow row) */
 /* Insignia of Claws: +1 attack and damage with unarmed strikes and natural weapons only (the row counted +1 on every attack) */
 /* Shard of Xeluan: the Strength increase stops at 22 (the row stopped at 20) */
 ov("Shard of Xeluan",{spellAtk:1,abil:["STR",4,22]});
 /* fx-int: Nightbringer (immunity pick, evil toggle, darkvision) is defined in fx-L5; its 4d4 radiant is added there */
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
 [["Dormant",1],["Awakened",2],["Exalted",3]].forEach(function(c){var n="Star Razor ("+c[0]+")";
  ov(n,null);
  add(n,{n:"Star Razor",toggle:{id:"star-razor-glow",label:"Star Razor glowing"},atkBonus:[{when:n,atk:c[1],dmg:c[1]}],res:["Radiant"]})});

 /* ---- Armor Class: Barrier Tattoo (no armor, a Shield is allowed) ---- */

 /* ---- Spells, cantrips, unarmed strike, truesight ---- */
 add("Crystalline Chronicle",{n:"Crystalline Chronicle",spCls:"@sub:INT",spells:[[0,"Mage Hand,Mind Sliver,Message"]]});
 /* Crawling Gauntlet: no casting ability is named for Mage Hand, Intelligence is used (the cantrip has no attack or save) */
 add("Crawling Gauntlet",{n:"Crawling Gauntlet",unarmed:{die:"1d6",t:"Slashing",force:1},spCls:"@sub:INT",spells:[[0,"Mage Hand"]]});

 /* ---- Use pools ---- */
 add("Mythallar Bracelet",{n:"Mythallar Bracelet",lu:{n:"Mythallar beads",max:3,reset:"none",tag:"Each bead is used up. The bracelet loses its magic after the third"}});

 /* ---- Theros gifts ---- */
 /* Champion gifts: +2 to one of two scores, and the cap for that score rises by 2 (22) */
 /* fx-int: Champion of Affliction ... the Sun are defined in an earlier fx file (same abPick) */
 /* Devotee gifts: the spell can be cast a number of times equal to the ability modifier (minimum 1) per Long Rest. Spell and ability read from each gift text. */
 [["Klothys's Devotee","WIS","Command"],["Kruphix's Devotee","INT","Detect Magic"],["Mogis's Devotee","CON","Wrathful Smite"]].forEach(function(c){
  add(c[0],{n:c[0],lu:{n:c[2],max:"mod:"+c[1],reset:"long",tag:c[0]}})});
 add("Kruphix's Devotee",{n:"Kruphix's Devotee",spCls:"@sub:INT",spells:[[0,"Mage Hand"]]});
 /* Votary and Disciple gifts: passive advantage and immunity */
 add("Heliod's Disciple",{n:"Heliod's Disciple",advOn:["saving throws against being Blinded"]});
 add("Iroas's Votary",{n:"Iroas's Votary",advOn:["saving throws against being Frightened"]});
 add("Karametra's Votary",{n:"Karametra's Votary",advOn:["saving throws against being Poisoned"]});
 add("Klothys's Votary",{n:"Klothys's Votary",advOn:["saving throws against being Charmed"]});
 add("Kruphix's Votary",{n:"Kruphix's Votary",advOn:["saving throws against being Charmed"]});
 add("Mogis's Disciple",{n:"Mogis's Disciple",advOn:["saving throws against being Charmed","saving throws against being Frightened"]});
 add("Klothys's Disciple",{n:"Klothys's Disciple",noSurprise:"Cannot be surprised while you are not incapacitated"});
 add("Blessing of Dumathoin",{n:"Blessing of Dumathoin",darkTo:60,defs:[["Note","If you already had Darkvision, you can see color in the dark"]]});
})();
