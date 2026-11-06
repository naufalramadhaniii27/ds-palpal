/* fx batch C: feat effects through the fx engine v2 registry (window.GX.feat). Schema: SOURCE-NOTES.md, "fx schema".
   A feat entry reads its own picks with when:{key,val} (gx pick k, or the native FEATS pick key). Picks made here are stored as gx-<k>-feat-<slot>.
   spCls "@asi" = ability the feat raised, "@abpick" = ability chosen with pick k "ab". Rows for limited uses go to LU_X (max "mod:@asi" or "mod:@ab" use the same two abilities). */
(function(){
window.GX=window.GX||{};GX.feat=GX.feat||{};
var ABL=[["INT",""],["WIS",""],["CHA",""]];
function res(key,label,map){return Object.keys(map).map(function(v){return {n:label+": "+v,when:{key:key,val:v},res:[map[v]]}})}
var F={
"Athlete":[{n:"Climb Speed",mv:{climb:"speed"}}],
"Battlecaster":[{n:"Weapon Training",pick:[{k:"wp",t:"weapon",n:1,title:"Weapon proficiency (simple or martial)"}]}],
"Blessed Warrior":[{n:"Blessed Warrior cantrips",spCls:"Paladin",pick:[{k:"c",t:"cantrip",n:2,cls:"Cleric",title:"Two Cleric cantrips"}]}],
"Druidic Warrior":[{n:"Druidic Warrior cantrips",spCls:"Ranger",pick:[{k:"c",t:"cantrip",n:2,cls:"Druid",title:"Two Druid cantrips"}]}],
"Clairvoyant Warrior":[{n:"Combat Foresight",spCls:"@abpick",pick:[
  {k:"ab",t:"multi",n:1,title:"Spellcasting ability",list:ABL},
  {k:"sp",t:"cantrip",lvl:1,school:"Divination",ct:"Reaction|Bonus",n:1,title:"1st-level divination spell (reaction or bonus action)"}]}],
"Technical":[{n:"Cantrip Device",spCls:"@abpick",pick:[
  {k:"ab",t:"multi",n:1,title:"Spellcasting ability",list:ABL},
  {k:"sp",t:"cantrip",cls:"Wizard",nodmg:1,n:1,title:"Wizard cantrip that deals no damage"}]}],
"Quori Bond":[/* the native pick pkq1 already adds the spell; here only the 1d4 skill bonus */
  {n:"Du'ulora",when:{key:"pkq1",val:"Crown of Madness"},def:["Skill bonus","Add 1d4 to Intimidation checks"]},
  {n:"Hashataq",when:{key:"pkq1",val:"Suggestion"},def:["Skill bonus","Add 1d4 to Persuasion checks"]},
  {n:"Kalaraq",when:{key:"pkq1",val:"Mind Spike"},def:["Skill bonus","Add 1d4 to Perception checks"]},
  {n:"Tsucora",when:{key:"pkq1",val:"Shatter"},def:["Skill bonus","Add 1d4 to Intimidation checks"]}],
"Silver-Tongued":[{n:"Polyglot",pick:[{k:"lg",t:"lang",n:3,title:"Three languages"}]}],
"The Firm: Contractor":[{n:"Expertise",pick:[{k:"ex",t:"exp",n:1,title:"Expertise in a skill you know"}]}],
"Resolution of the Syndicate":[{n:"Resilient",hpLvl:1}],
"Multiscale":[{n:"Dual Ancestry",pick:[{k:"anc2",t:"multi",n:1,title:"Second Draconic Ancestry",list:[["Black","Acid"],["Blue","Lightning"],["Brass","Fire"],["Bronze","Lightning"],["Copper","Acid"],["Gold","Fire"],["Green","Poison"],["Red","Fire"],["Silver","Cold"],["White","Cold"]]}]}]
  .concat(res("anc2","Dual Ancestry",{Black:"Acid",Blue:"Lightning",Brass:"Fire",Bronze:"Lightning",Copper:"Acid",Gold:"Fire",Green:"Poison",Red:"Fire",Silver:"Cold",White:"Cold"})),
"Seraph Transformation: Stage 1":[{n:"Celestial Form",res:["Radiant"]}],
"Specter Transformation: Stage 1":[{n:"Spectral Form",res:["Necrotic"]}],
"Fiend Transformation: Stage 1":[{n:"Fiendish Soul",advOn:["Charisma (Deception) checks"],pick:[{k:"fr",t:"multi",n:1,title:"Fiendish Soul resistance",list:[["Acid",""],["Cold",""],["Fire",""]]}]}]
  .concat(res("fr","Fiendish Soul",{Acid:"Acid",Cold:"Cold",Fire:"Fire"})),
"Hag Transformation: Stage 1":[{n:"Hag Form",acBase:[13,"full"],cond:"noBody",saveFrom:"hs",pick:[{k:"hs",t:"multi",n:1,title:"Saving throw proficiency",list:[["Strength",""],["Intelligence",""],["Charisma",""]]}]},
  {n:"The Sea Sisterhood",when:{key:"trHag1",val:"The Sea Sisterhood"},mv:{swim:"speed"}},
  {n:"The Red Sisterhood",when:{key:"trHag1",val:"The Red Sisterhood"},skillProf:["Deception","Persuasion"]}],
"Ooze Transformation: Stage 1":[{n:"Ooze Form",sense:[["Blindsight",30,"Blindsight 30 ft. from Ooze Form"]]},{n:"Sluggish",speedAdd:-5}],
"Primordial Transformation: Stage 1":[{n:"Primordial Form",abUp:[["CON",1,20]]},
  {n:"Elemental Affinity",pick:[{k:"el",t:"multi",n:1,title:"Element",list:[["Air","Lightning resistance"],["Earth","Bludgeoning resistance"],["Fire","Fire resistance"],["Water","Cold resistance"]]}]}]
  .concat(res("el","Elemental Affinity",{Air:"Lightning",Earth:"Bludgeoning",Fire:"Fire",Water:"Cold"})),
"Vampire Transformation: Stage 1":[
  {n:"Fzeg Bloodline",when:{key:"trVampire1",val:"Fzeg Bloodline"},abUp:[["STR",2,20]],speedAdd:10},
  {n:"Soman Bloodline",when:{key:"trVampire1",val:"Soman Bloodline"},abUp:[["STR",1,19],["DEX",1,19]],mv:{climb:"speed"}},
  {n:"Strigoi Bloodline",when:{key:"trVampire1",val:"Strigoi Bloodline"},abUp:[["DEX",2,20]],skillProf:["Stealth"]}]
};
Object.keys(F).forEach(function(n){GX.feat[n]=(GX.feat[n]||[]).concat(F[n])});
if(typeof LU_X!=="undefined"){[
{"src":"feat","owner":"Spell Subterfuge","feature":"Shrouding Spells","n":"Shrouding Spells","lvl":1,"max":"mod:@asi","reset":"long","tag":"Dash and Hide as a Bonus Action after casting a spell"},
{"src":"feat","owner":"Clairvoyant Warrior","feature":"Combat Foresight","n":"Combat Foresight spell","lvl":1,"max":"mod:@ab","reset":"long","tag":"Cast the chosen spell without a slot"},
{"src":"feat","owner":"Quori Bond","feature":"Quori Lineage","n":"Quori Bond spell","lvl":1,"max":1,"reset":"long","tag":"Cast the lineage spell without a slot"},
{"src":"feat","owner":"Superior Shifting","feature":"Shifter Recovery","n":"Shifting: extra use","lvl":1,"max":1,"reset":"long","tag":"One more use of Shifting. Regain 1 on a Short Rest"}
].forEach(function(e){LU_X.push(e)})}
})();
