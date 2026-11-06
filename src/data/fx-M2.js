/* fx data M2 (engine wave 3, fx engine v6): rows of reports/ledger-skipped-all.md that the v6 fields unlock.
   Fields used (SOURCE-NOTES.md, "fx engine v6"): spell filters on picks (rit, schools, names, lvMin/lvMax, cls "@pick:k", spCls "@pick:k"), cdAdd, luBump, offHand, wmAdd, sizeSet, dieStep, grantItem, toggle AC (v3b field), toolExpert rows on the sheet.
   Tables: window.GX.item / sub / feat. Items count only while equipped (and attuned when needed). Still skipped: reports/ledger-m2.md. */
window.GX=window.GX||{};GX.item=GX.item||{};GX.sub=GX.sub||{};GX.feat=GX.feat||{};
(function(){
 if(window.__fxM2)return;window.__fxM2=1;
 function put(t,n,e){(GX[t][n]=GX[t][n]||[]).push(e)}
 function I(n,e){e.n=e.n||n;put("item",n,e)}
 function S(n,e){put("sub",n,e)}
 function F(n,e){put("feat",n,e)}
 var SIX=["Bard","Cleric","Druid","Sorcerer","Warlock","Wizard"];

 /* ---- resource pool of another feature: +1 use of every Channel Divinity feature; +1 Adrenaline Point ---- */
 I("Blessed Reliquary",{n:"Blessed Reliquary: Channel Divinity",cdAdd:1});
 F("Focused Fighting",{n:"Focused Fighting: Adrenaline Point",luBump:[{match:"Adrenaline Points",add:1}]});
 F("Focused Hunter",{n:"Focused Hunter: Adrenaline Point",luBump:[{match:"Adrenaline Points",add:1}]});

 /* ---- Two-Weapon Fighting: the off-hand attack adds the ability modifier to its damage (a row for each Light melee weapon) ---- */
 F("Two-Weapon Fighting",{n:"Two-Weapon Fighting: off-hand attack",offHand:true});

 /* ---- one more Weapon Mastery weapon ---- */
 S("Star-Spangled Banner",{n:"Patriotism: Second Amendment",l:3,wmAdd:1});
 S("Burden of Awakening",{n:"Mind Mastery",l:3,wmAdd:1});

 /* ---- size down and smaller weapons ---- */
 F("Lilliputian",{n:"Lilliputian: Tiny, miniature weapons",sizeSet:"Tiny",dieStep:[{when:"weapon",n:-1}]});

 /* ---- items that come with the item ---- */
 I("Exo-Frame",{n:"Exo-Frame: Integrated Battlefists",grantItem:[{n:"Battlefist",q:2}]});

 /* ---- spell picks with a filter ---- */
 F("Quicksmithing",{n:"Quicksmithing: mastered rituals",spCls:"@sub:INT",pick:[{k:"rit",t:"spell",n:2,lvl:1,rit:1,title:"Two 1st-level Ritual spells (any class list)"}]});
 F("Ritual Caster (2014)",{n:"Ritual book",spCls:"@pick:cp",defs:[["Note","Ritual Caster: the spells in your ritual book can be cast only as rituals"]],pick:[{k:"rb",t:"spell",n:2,lvl:1,rit:1,cls:"@pick:cp",clsAll:SIX,title:"Two 1st-level Ritual spells of your class"}]});
 F("Spell Sniper (2014)",{n:"Spell Sniper: attack cantrip",spCls:"@pick:cp",pick:[{k:"sc",t:"cantrip",n:1,cls:"@pick:cp",clsAll:SIX,names:["Chill Touch","Eldritch Blast","Fire Bolt","Primal Savagery","Produce Flame","Ray of Frost","Shocking Grasp","Thorn Whip"],title:"Cantrip that needs an attack roll"}]});
 F("Fey Pact",{n:"Fey Cantrips",abPick:{k:"ab",from:["INT","WIS","CHA"],title:"Fey Pact spellcasting ability"},spCls:"@abpick",pick:[{k:"fc",t:"cantrip",n:1,schools:["Divination","Enchantment"],title:"Divination or Enchantment cantrip"}]});
 F("Forest Sage",{n:"Forest Sage: two spells",spCls:"@asi",pick:[{k:"sp",t:"spell",n:2,lvMin:1,lvMax:"half",cls:["Druid","Wizard"],title:"Two spells from the Druid or Wizard list (up to half your level, rounded up)"}]});
 I("Cantrip Module",{n:"Cantrip Module: cantrip",abPick:{k:"ab",from:["INT","WIS","CHA"],title:"Cantrip Module spellcasting ability"},spCls:"@abpick",pick:[{k:"cm",t:"cantrip",n:1,cls:["Cleric","Druid","Wizard"],title:"Cantrip from the Cleric, Druid or Wizard list"}]});
 S("Occultist Guild",{n:"Occult Knowledge: ritual spells",l:10,spCls:"@sub:INT",pick:[{k:"ok",t:"spell",n:2,lvMin:1,lvMax:"half",rit:1,cls:["Cleric","Druid","Wizard"],title:"Two Ritual spells from the Cleric, Druid or Wizard list"}]});

 /* ---- AC that depends on a state (toggle in Active effects) ---- */
 S("Prescient Knight",{n:"Anticipatory Strike",l:15,toggle:{id:"anticipatory-strike",label:"After Action Surge (+2 AC)"},acAdd:2});
 S("Way of the Kensei",{n:"Agile Parry",l:3,toggle:{id:"agile-parry",label:"Agile Parry (+2 AC)"},acAdd:2});
 S("Freerunner",{n:"Evasive Fighter",l:7,toggle:{id:"evasive-fighter",label:"Freerunning technique used (+2 AC)"},acAdd:2});
 S("Path of the Slasher",{n:"Blood-Drunk",l:10,toggle:{id:"blood-drunk",label:"Blood-Drunk (AC and saves +Rage Damage)"},acAdd:"rage",saveBonus:"rage"});
 S("Circle of the Feathers",{n:"Avian Shape: Swift Glide",l:3,toggle:{id:"avian-shape",label:"Avian Shape active"},acAdd:2});
 S("Circle of the Feathers",{n:"Enchanted Wings: Evasive Movement",l:14,toggle:{id:"avian-shape",label:"Avian Shape active"},acAdd:2});
})();
