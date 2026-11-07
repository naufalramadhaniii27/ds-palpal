/* fx batch E: remaining feat effects (fx engine v2, window.GX.feat). Loaded after fx-C-feat.js. New fields: senseAdd (not Darkvision), darkAdd, darkTo, skillPE, skillAb, abCut (SOURCE-NOTES.md, "fx schema", batch E).
   Entries of C that rules text shows to be incomplete are replaced here by name (rep), so fx-C-feat.js stays untouched.
   Text only (conditional or activated, nothing static for the sheet): Hag Form Fey type and Hideous Appearance, Green Hag voice mimicry, Red Hag form lock, Ooze Form manifest and Slimy Mien,
   Primordial Elemental Affinity riders (Air advantage, Earth temp HP, Fire damage, Water healing), Specter and Vampire Fanged Bite / Claw / Ghastly Touch / Incorporeal Movement, Vampire curse flaws,
   Multiscale Improved Breath Weapon (+1d10), Contractor Backstabber (1d4 to 2d4), Resolution Quick Strike, Worthless From the Ashes (score increases at 4, 8, 12, 16, 19 need a choice each time). */
(function(){
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.feat=GX.feat||{};
function rep(feat,names,list){GX.feat[feat]=(GX.feat[feat]||[]).filter(function(e){return names.indexOf(e.n)<0}).concat(list)}
var HAG="Hag Transformation: Stage 1";
rep(HAG,["The Red Sisterhood"],[
  {n:"The Green Sisterhood",when:{key:"trHag1",val:"The Green Sisterhood"},darkAdd:60,def:["Breathing","Can breathe air and water"]},
  {n:"The Red Sisterhood",when:{key:"trHag1",val:"The Red Sisterhood"},darkTo:60,skillPE:["Deception","Persuasion"]},
  {n:"The Sea Sisterhood: senses",when:{key:"trHag1",val:"The Sea Sisterhood"},darkTo:60,def:["Breathing","Can breathe air and water"]}]);
rep("Ooze Transformation: Stage 1",["Ooze Form"],[{n:"Ooze Form",senseAdd:[["Blindsight",30,"Adds 30 feet to Blindsight you already have, else 30 feet"]]}]);
rep("Vampire Transformation: Stage 1",["Strigoi Bloodline"],[{n:"Strigoi Bloodline",when:{key:"trVampire1",val:"Strigoi Bloodline"},abUp:[["DEX",2,20]],skillPE:["Stealth"]}]);
rep("Worthless",[],[{n:"Worthless",abCut:{total:72,each:1}}]);
var SK=["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"];
rep("Technical",[],[{n:"Mind Over Matter",pick:[{k:"mom",t:"multi",n:1,title:"Mind Over Matter skill (swap it at each level)",list:SK.map(function(s){return [s,""]})}]}].concat(SK.map(function(s){return {n:"Mind Over Matter: "+s,when:{key:"mom",val:s},skillAb:[[s,"INT"]]}})));
/* fx engine v3a: "if you already have" rules, extra damage dice */
rep("Specter Transformation: Stage 1",["Spectral Form"],[{n:"Spectral Form",resToImm:["Necrotic"]}]);/* Resistance to Necrotic damage, or Immunity if you already had that Resistance */
rep(HAG,["The Sea Sisterhood"],[{n:"The Sea Sisterhood",when:{key:"trHag1",val:"The Sea Sisterhood"},mv:{swim:"speed"},speedAddIf:{swim:10}}]);/* Swim Speed equal to your Speed (or +10 feet if you already have one) */
rep("Multiscale",[],[{n:"Improved Breath Weapon",atkDice:[{when:"Breath Weapon",d:"1d10",t:"damage of the type set by your Draconic Ancestry",note:"Breath Weapon (Improved Breath Weapon)"}]}]);/* no attack row for the Breath Weapon, so a Defenses note */
})();
