/* fx batch D (items): effects that the item text states but the sheet did not count, plus wrong effects removed.
   Two tables, both read by the fx engine (03-logic-magic-item-effects.js, 11-logic-derivation.js):
   - window.FXO[item]: replaces the old DMGI row fx (fx:null drops it). Used where a row counted something the item does not give while worn.
   - window.GX.item[item]: fx engine v2 entries (equipped, and attuned when the item needs it). Same schema as every other source (SOURCE-NOTES.md, "fx schema").
   Values were checked against the item text of each row. */
(function(){
 var W=window;W.FXO=W.FXO||{};W.GX=W.GX||{};var G=W.GX.item=W.GX.item||{};
 function add(n,e){(G[n]=G[n]||[]).push(e)}
 /* Wrong effects. These items only act through a table roll or a one-time card result, so nothing is added to the sheet while carried. */
 W.FXO["Deck of Wonder"]={fx:null};            /* row had +1 attack and damage, +1 saves and resistance to ten types: all are random card results */
 W.FXO["Deck of Many More Things"]={fx:null};  /* row had Fire vulnerability and a climb speed: both come from single cards */
 W.FXO["Teeth of Dahlver-Nar"]={fx:null};      /* row had +2 AC and fly 30: both come from single teeth rolled on a table */
 W.FXO["Shield of Yggdrasil"]={fx:{ac:1}};     /* "+1 AC on top of a normal Shield" (row counted +3) */

 /* Soulbind Chains: +N to spell attack rolls and to the save DCs of Summoner spells */
 [1,2,3].forEach(function(n){add("+"+n+" Soulbind Chains",{n:"Soulbind Chains",spAtk:n,spDc:n,spCls:"Summoner"})});

 /* Hit Point maximum rises by 1 per level while attuned */
 add("Berserker Axe",{n:"Berserker Axe",hpLvl:1});
 add("Tloques' Berserker Battleaxe",{n:"Tloques' Berserker Battleaxe",hpLvl:1});

 /* Dragon Masks: Draconic Majesty, add the Charisma modifier to AC while wearing no armor */
 ["Black","Blue","Green","Red","White"].forEach(function(c){add(c+" Dragon Mask",{n:"Draconic Majesty",acAdd:"CHA",cond:"noBody"})});

 /* Harkon's Bite: +1 to ability checks (the +1 to saves is already in the row). Counted on every skill, by its ability */
 add("Harkon's Bite",{n:"Harkon's Bite",chkBonus:[["STR",1],["DEX",1],["CON",1],["INT",1],["WIS",1],["CHA",1]]});

 /* Movement and initiative */
 add("Greaves of Dendallen",{n:"Greaves of Dendallen",mv:{climb:"speed"}});
 add("Sprinting Legs",{n:"Sprinting Legs",speedAdd:10});
 add("Wayfarer's Boots",{n:"Wayfarer's Boots",speedAdd:10,advOn:["Wisdom (Survival) checks"]});
 add("Scorpion Armor",{n:"Scorpion Armor",init:5});
 add("Shield of the Silver Dragon",{n:"Shield of the Silver Dragon",init:2});

 /* Ioun stones of knowledge: proficiency in the skill, or +1 to its checks when already proficient */
 add("Ioun Stone, Historical Knowledge",{n:"Ioun Stone, Historical Knowledge",skillProfPlus:["History"]});
 add("Ioun Stone, Natural Knowledge",{n:"Ioun Stone, Natural Knowledge",skillProfPlus:["Nature"]});
 add("Ioun Stone, Religious Knowledge",{n:"Ioun Stone, Religious Knowledge",skillProfPlus:["Religion"]});

 /* Arcanist's Bestiary: one skill of Arcana, History, Nature or Religion while attuned */
 add("Arcanist's Bestiary",{n:"Extensive Knowledge",pick:[{k:"sk",t:"skills",n:1,title:"Skill",from:["Arcana","History","Nature","Religion"]}]});

 /* Armor-like items without a base armor row */
 add("Exo-Frame",{n:"Exo-Frame",acBase:[18,""],acOver:true,advOn:["Strength checks","Strength saving throws"]});
 add("Titan Armor",{n:"Titan Armor",acBase:[17,""],acOver:true});
 add("Spellwoven Robe",{n:"Spellwoven Robe",acBase:[10,"","cast"]});
})();
