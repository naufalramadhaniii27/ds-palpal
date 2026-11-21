DataEnv.slot.GX=DataEnv.slot.GX||{};GX.feat=GX.feat||{};
/* fx data batch B48 (hand written): the spells the Wild Talent feats (Biokinesis to Psykineticist) and the 2014 Fey Touched and Shadow Touched keep prepared. Technopath and Psionic-Awakened get theirs from the book's can and free lists (tp13-tsdm). The ability pick is the one the feat text names (Intelligence, Wisdom or Charisma). The once per Long Rest counter of each free leveled cast is added below. */
(function(){
var P=function(k,e){GX.feat[k]=(GX.feat[k]||[]).concat([e])};
var AB=[{k:"ab",t:"multi",n:1,title:"Spellcasting ability",list:[["INT",""],["WIS",""],["CHA",""]]}];
P("Biokinesis",{n:"Biokinesis (spells)",spells:[[1, "Spare the Dying,Healing Word"], [3, "Arcane Vigor"]],spCls:"@abpick",pick:AB});
P("Clairsentience",{n:"Clairsentience (spells)",spells:[[1, "Guidance,Detect Evil and Good"], [3, "See Invisibility"]],spCls:"@abpick",pick:AB});
P("Empath",{n:"Empath (spells)",spells:[[1, "Charm Person"], [3, "Calm Emotions"]],spCls:"@abpick",pick:AB});
P("Flesh Morpher",{n:"Flesh Morpher (spells)",spells:[[1, "Longstrider"], [3, "Alter Self"]],spCls:"@abpick",pick:AB});
P("Mind Whisperer",{n:"Mind Whisperer (spells)",spells:[[1, "Mind Sliver,Dissonant Whispers"]],spCls:"@abpick",pick:AB});
P("Psi Trickster",{n:"Psi Trickster (spells)",spells:[[1, "Minor Illusion,Disguise Self"]],spCls:"@abpick",pick:AB});
P("Psykineticist",{n:"Psykineticist (spells)",spells:[[1, "Telekinetic Fling,Thunderwave"]],spCls:"@abpick",pick:AB});
/* the free cast of each leveled spell is once per Long Rest */
[["Biokinesis","Healing Word",1],["Biokinesis","Arcane Vigor",3],["Clairsentience","Detect Evil and Good",1],["Clairsentience","See Invisibility",3],["Empath","Charm Person",1],["Empath","Calm Emotions",3],["Flesh Morpher","Longstrider",1],["Flesh Morpher","Alter Self",3],["Mind Whisperer","Dissonant Whispers",1],["Psi Trickster","Disguise Self",1],["Psykineticist","Thunderwave",1]].forEach(function(z){P(z[0],{n:z[1]+" (free cast)",l:z[2],lu:{n:z[1]+" (free cast)",max:1,reset:"long"}})});
P("Fey Touched (2014)",{n:"Misty Step (spell)",spells:[[1,"Misty Step"]],spCls:"@asi"});
P("Shadow Touched (2014)",{n:"Invisibility (spell)",spells:[[1,"Invisibility"]],spCls:"@asi"});
})();
