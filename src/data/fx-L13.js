/* fx data batch L13: ledger fixes for Warmage houses, Witch subclasses and Wizard subclasses (ledger shards 36 and 37). Schema: SOURCE-NOTES.md, "fx schema", "fx engine v3b", "fx engine v4".
   Loaded last in the hbpack block, so it runs after the tp*, wotc* and db* data and can correct their rows by name:
   - AUTO[sub] (always prepared lists) is replaced where the feature text differs: House of Knights, Gingerbread Magic, Sky Magic, Leyline Magic (one terrain at a time, so its spells come from a pick).
   - SUB_GRANT[sub] carries weapon and armor training of subclasses that had only a note (Kings, Knights, Steel Magic, Lumimancer).
   - LU_X rows are corrected in place (Mystic Strategist Battle Dice, Rooks Covert Magic split into five rows).
   - window.THIRD_SUBS: House of Bishops casts like a third caster (the Bishop Spellcasting table in Valda's Spire of Secrets p.154 equals the 2024 Eldritch Knight table: slots 2 at 3 up to 4/3/3/1 at 19, prepared 3 at 3 up to 13 at 20; Wizard list, Intelligence).
   Toggles: bladesong (Bladesinger, Bladesinging), conc (War Magic Durable Magic), dragon-mask/heart/wings/tail, fam-climb/fam-swim, feed-on-life.
   Spec differences (code and text win): Familiar Master Servitor's Agility is level 6 in the data, not 10. Pawn Storm and Covert Magic are level 7. Deathseeker and Turquoise Efficiency are level 6. Doomsayer Power from Darkness is level 14.
   Not done here (engine fields missing): reports/ledger-skipped-L13.md. */
window.GX=window.GX||{};GX.sub=GX.sub||{};
(function(){
 function add(k,list){GX.sub[k]=(GX.sub[k]||[]).concat(list)}
 var G=function(n){return typeof window[n]!=="undefined"?window[n]:null};
 function wxs(sub,cls){return (window.WXS||[]).filter(function(x){return x.name===sub&&x.cls===cls})}
 function luFind(owner,feature){return (typeof LU_X!=="undefined"?LU_X:[]).filter(function(e){return e.owner===owner&&e.feature===feature})}
 /* ---------- Warmage ---------- */
 window.THIRD_SUBS=window.THIRD_SUBS||{};
 window.THIRD_SUBS["House of Bishops"]={list:"Wizard",ab:"INT",cant:0};
 add("House of Bishops",[{l:3,n:"Spellcasting",defs:[["Note","Warmage Edge also improves damage rolls of level 1+ Wizard spells as if they were cantrips (Magic Missile: one dart only)"]]}]);
 add("House of Cards",[{l:3,n:"Bluff",skillBonus:[["Deception","INT",1]]}]);
 add("House of Pawns",[{l:7,n:"Pawn Storm",init:"INT",min:1}]);
 add("House of Lancers",[
  {l:3,n:"Hand-to-Hand Arcana",atkAb:{kind:"unarmed",ab:"INT"},unarmed:{die:[[3,"1d6"],[5,"1d8"],[11,"1d10"],[17,"1d12"]],t:"Bludgeoning"}},
  {l:3,n:"Unarmored Defense",acDexAb:"INT",cond:"noArmor"}]);
 /* Mystical Armament: Force Buckler plus one of four blade cantrips (the old auto list was copied from another subclass) */
 if(typeof AUTO!=="undefined")AUTO["House of Knights"]=[[3,"Force Buckler"]];
 var BL=["Arc Blade","Burning Blade","Frigid Blade","True Strike"];
 add("House of Knights",[{l:3,n:"Mystical Armament",pick:[{k:"bl",t:"multi",n:1,title:"Martial Cantrips: one more cantrip",list:BL.map(function(n){return [n,""]})}]}].concat(BL.map(function(n){
  return {l:3,n:"Mystical Armament ("+n+")",when:{key:"gx-bl-sub-House of Knights",val:n},spCls:"@sub:INT",spells:[[3,n]]}})));
 if(typeof SUB_GRANT!=="undefined"){
  SUB_GRANT["House of Kings"]={f:"Martial Training",armor:[[3,"Medium, Shields"]],weapons:[[3,"Martial"]]};
  SUB_GRANT["House of Knights"]={f:"Martial Training",armor:[[3,"Medium, Heavy, Shields"]],weapons:[[3,"Martial"]]};
  SUB_GRANT["Steel Magic"]={f:"Martial Training",armor:[[3,"Medium, Shields"]],weapons:[[3,"Martial without Heavy"]]};
  SUB_GRANT["Lumimancer"]={f:"Martial Training",weapons:[[3,"Martial Melee without Two-Handed or Heavy"]]}}
 /* Covert Magic: five spells, each once per Long Rest (Arcane Surge restores them all) */
 (function(){var CM=["Feather Fall","Invisibility","Knock","Silence","Spider Climb"];
  if(typeof LU_X!=="undefined"){luFind("House of Rooks","Covert Magic").forEach(function(e){LU_X.splice(LU_X.indexOf(e),1)})}
  add("House of Rooks",[{l:7,n:"Covert Magic",lu:CM.map(function(s){return {n:"Covert Magic: "+s,max:1,reset:"long",tag:"Free cast, no Verbal"+(s==="Knock"?", silent":"")}})}]);
  wxs("House of Rooks","Warmage").forEach(function(x){x.sfree=(x.sfree||[]).concat(CM.map(function(s){return [7,s,"INT","1/Long Rest free, no Verbal component (Arcane Surge restores)"]}))})})();
 /* ---------- Witch ---------- */
 add("Blood Magic",[{l:6,n:"Deathseeker",sense:[["Deathseeker",60,"Creatures missing Hit Points, even Invisible ones"]],advOn:["ability checks to track creatures you or your familiar damaged in the last 24 hours"]}]);
 add("Blue Magic",[{l:6,n:"Turquoise Efficiency",advOn:["saves against any spell you have prepared"]}]);
 if(typeof AUTO!=="undefined"){
  AUTO["Gingerbread Magic"]=[[3,"Arcane Lock,Enhance Ability,Hex: Sweet Tooth,Tasha's Hideous Laughter,Sleep"],[5,"Create Food and Water,Leomund's Tiny Hut"],[7,"Confusion,Hallucinatory Terrain"],[9,"Animate Objects,Dream"]];
  AUTO["Sky Magic"]=[[3,"Feather Fall,Fog Cloud,Gust of Wind,Message,Misty Step"],[5,"Call Lightning,Fly"],[7,"Hallucinatory Terrain,Ice Storm"],[9,"Cloudkill,Commune With Nature"]]}
 add("Sky Magic",[{l:3,n:"Cushioned Fall",defs:[["Note","Feather Fall can be cast on yourself with no spell slot"]]}]);
 wxs("Lunar Magic","Witch").forEach(function(x){(x.fx||[]).forEach(function(r){if(r[1]==="Moonsight"&&r[2].senses)r[2].senses=[["Darkvision",60,"",60]]})});/* 4th item: feet added when Darkvision exists already */
 add("Steel Magic",[{l:6,n:"Extra Attack",extraAttack:2}]);
 add("Technicolor Magic",[{l:3,n:"Animal Friends",skillBonus:[["Animal Handling","CHA",1]]}]);
 /* ---------- Wizard ---------- */
 add("Abjurer",[{l:10,n:"Spell Breaker",spCls:"Wizard",spells:[[10,"Counterspell,Dispel Magic"]]}]);
 if(typeof SUB_GRANT!=="undefined")SUB_GRANT["Alkemancer"]={f:"Skilled Alchemist",tools:[[3,"Alchemist's Supplies"]]};/* fx tools only fill the source list, SUB_GRANT also fills the proficiency text. Doubled Proficiency Bonus and the damage rider: see reports/ledger-skipped-L13.md */
 add("Angelic Scribe",[{l:14,n:"Angelic Wrath",spCls:"Wizard",spells:[[14,"Conjure Celestial"]]}]);
 /* Bladesong */
 var BS={id:"bladesong",label:"Bladesong"};
 add("Bladesinger",[
  {l:3,n:"Bladesong",toggle:BS,acAdd:"INT",min:1,speedAdd:10,cond:"noArmor",advOn:["Dexterity (Acrobatics) checks"]},
  {l:6,n:"Extra Attack",extraAttack:2}]);
 add("Bladesinging",[
  {l:3,n:"Bladesong",toggle:BS,acAdd:"INT",min:1,speedAdd:10,cond:"noMedHeavy",advOn:["Dexterity (Acrobatics) checks"]},
  {l:6,n:"Extra Attack",extraAttack:2},
  {l:14,n:"Song of Victory",toggle:BS,min:1,atkBonus:[{when:"melee",dmg:"INT"}]}]);
 wxs("Bladesinging","Wizard").forEach(function(x){x.fx=(x.fx||[]).filter(function(r){return r[1]!=="Bladesong"})});/* the always-on note is now the toggle */
 add("Doomsayer",[{l:14,n:"Power from Darkness",atkBonus:[{when:"spell",crit:19}]}]);
 /* Dragon Mage invocations */
 add("Dragon Mage",[
  {l:3,n:"Invoke Dragon Mask",toggle:{id:"dragon-mask",label:"Dragon Mask"},acAdd:"INT",min:1,advOn:["Wisdom (Perception) checks","Charisma (Intimidation) checks"]},
  {l:6,n:"Invoke Dragon Heart",toggle:{id:"dragon-heart",label:"Dragon Heart"},min:1,saveBonusAb:[["WIS","INT"],["CHA","INT"]]},
  {l:10,n:"Invoke Dragon Wings",toggle:{id:"dragon-wings",label:"Dragon Wings"},speedAdd:10,mv:{fly:"speed"},res:["Bludgeoning","Piercing","Slashing"],defs:[["Note","Resistance applies to nonmagical attacks only"]]},
  {l:14,n:"Invoke Dragon Tail",toggle:{id:"dragon-tail",label:"Dragon Tail"},condImm:["Grappled"],defs:[["Note","Dragon Tail: proficiency in Strength and Dexterity saves and Strength checks, using Intelligence in place of the normal modifier"]]}]);
 wxs("Dragon Mage","Wizard").forEach(function(x){x.fx=(x.fx||[]).filter(function(r){return r[1]!=="Invoke Dragon Wings"})});
 /* Elementalist: focus language (pick elem_focus is stored as B.ch.elem_focus) */
 var EF={Air:["Auran","Primordial"],Earth:["Terran","Primordial"],Fire:["Ignan","Primordial"],Water:["Aquan","Primordial"]};
 add("Elementalist",Object.keys(EF).map(function(el){return {l:3,n:"Elemental Savant ("+el+")",when:{key:"elem_focus",val:el},pick:[{k:"fl"+el,t:"lang",n:1,from:EF[el],title:"Focus language ("+el+")"}]}}));
 /* Familiar Master: only while the familiar has that special Speed */
 add("Familiar Master",[
  {l:6,n:"Servitor's Agility (Climb)",toggle:{id:"fam-climb",label:"Familiar has a Climb Speed"},mv:{climb:"speed"}},
  {l:6,n:"Servitor's Agility (Swim)",toggle:{id:"fam-swim",label:"Familiar has a Swim Speed"},mv:{swim:"speed"},defs:[["Note","You breathe underwater"]]}]);
 add("Illusionist",[{l:6,n:"Phantasmal Creatures",spCls:"Wizard",spells:[[6,"Summon Beast,Summon Fey"]]}]);
 /* Leyline Magic: one attunement at a time. Spells come from the terrain pick (table "Leyline Spells") */
 (function(){var TR={Arctic:[[3,"Grease,Hold Person"],[5,"Slow"],[7,"Ice Storm"],[9,"Cone of Cold"]],Coast:[[3,"Thunderwave,Mirror Image"],[5,"Call Lightning"],[7,"Control Water"],[9,"Conjure Elemental"]],Desert:[[3,"Color Spray,Blur"],[5,"Daylight"],[7,"Blight"],[9,"Seeming"]],Forest:[[3,"Entangle,Barkskin"],[5,"Conjure Animals"],[7,"Shape Plants"],[9,"Tree Stride"]],Grassland:[[3,"Elevated Sight,Gust of Wind"],[5,"Wind Wall"],[7,"Freedom of Movement"],[9,"Commune With Nature"]],Mountain:[[3,"Fog Cloud,Silence"],[5,"Sleet Storm"],[7,"Stoneskin"],[9,"Wall of Stone"]],Swamp:[[3,"Veil of Dusk,Spike Growth"],[5,"Stinking Cloud"],[7,"Giant Insect"],[9,"Insect Plague"]]};
  if(typeof AUTO!=="undefined")delete AUTO["Leyline Magic"];
  add("Leyline Magic",[{l:3,n:"Natural Attunement",pick:[{k:"ley",t:"multi",n:1,title:"Attuned leyline (one at a time, change when you prepare spells)",list:Object.keys(TR).map(function(t){return [t,""]})}],
   },{l:14,n:"Thrum of the Land",lu:[{n:"Thrum of the Land (level 6+ spell)",max:1,reset:"long",tag:"Level 6+ spell"}]}].concat(Object.keys(TR).map(function(t){
   return {l:3,n:"Natural Attunement ("+t+")",when:{key:"gx-ley-sub-Leyline Magic",val:t},spCls:"Wizard",spells:TR[t]}})))})();
 add("Master of Fiends",[
  {l:3,n:"Fiendish Presence",pick:[{k:"fp",t:"skills",n:1,from:["Deception","Intimidation","Persuasion"],title:"Fiendish Presence skill"}]},
  {l:10,n:"Planar Defense",advOn:["saves against spells and abilities of Celestials and Fiends that Charm, Frighten, Paralyze, Restrain, Stun or possess you"]}]);
 luFind("Mystic Strategist","Battle Tactics").forEach(function(e){e.max=[0,0,2,2,2,2,3,3,3,3,3,3,3,3,3,3,3,3,4,4];e.tag="Battle Dice (d6, d8 from level 13)"});
 add("Necromancer",[{l:3,n:"Necromancy Spellbook",spCls:"Wizard",spells:[[3,"Find Familiar"]]}]);
 add("Necrophage",[
  {l:3,n:"Undead Familiar",spCls:"Wizard",spells:[[3,"Find Familiar"]]},
  {l:14,n:"Feed on Life",toggle:{id:"feed-on-life",label:"Feed on Life active (until Long Rest)"},imm:["Poison","Necrotic"],condImm:["Poisoned"],defs:[["Note","Immune to disease; no air, food, drink or sleep needed; Hit Point maximum cannot be reduced"]]}]);
 add("Order of Scribes",[{l:3,n:"Awakened Spellbook",lu:[{n:"Awakened Spellbook: ritual cast",max:1,reset:"long",tag:"Wizard spell as a ritual, normal casting time"}]}]);
 add("Ring Warden",[
  {l:3,n:"Bonus Proficiency",pick:[{k:"rwtool",t:"tool",n:1,from:["Smith's Tools","Jeweler's Tools"],title:"Bonus Proficiency"}]},
  {l:6,n:"Master Metalsmith",pick:[{k:"ring",t:"multi",n:1,yc:1,title:"Master Metalsmith: ring you can craft",list:["Ring of Jumping","Ring of Mind Shielding","Ring of Protection","Ring of the Ram","Ring of Regeneration","Ring of Resistance"].map(function(r){return [r,""]})}]}]);
 add("Sangromancer",[
  {l:3,n:"Full-Blooded",lu:[{n:"Sangromancy Dice",max:{f:"lvl+1"},reset:"long",die:"d12",tag:"Short Rest returns one"}]},
  {l:6,n:"Sanguine Vigor",hpLvl:1}]);
 add("School of Evocation",[{l:14,n:"Overchannel",lu:[{n:"Overchannel",max:1,reset:"long",tag:"First use free"}]}]);
 if(window.CLASSES&&CLASSES.Wizard){var ps=CLASSES.Wizard.pickSub=CLASSES.Wizard.pickSub||{};
  if(!(ps["School of Illusion"]||[]).some(function(p){return p.key==="p3illcan2"}))ps["School of Illusion"]=(ps["School of Illusion"]||[]).concat([{l:3,k:"cantrip",key:"p3illcan2",cond:"minill",list:"Wizard",n:1,feature:"Improved Minor Illusion",title:"Improved Minor Illusion: a Wizard cantrip (you knew Minor Illusion already)",yc:1}])}
 wxs("School of Illusion","Wizard").forEach(function(x){if(!(x.cantrips||[]).some(function(c){return c[0]==="p3illcan2"}))x.cantrips=(x.cantrips||[]).concat([["p3illcan2","Improved Minor Illusion",3]])});/* the picked cantrip joins the list through sbAuto (WXS.cantrips) */
 add("School of Transmutation",[{l:14,n:"Master Transmuter",lu:[{n:"Master Transmuter",max:1,reset:"long",tag:"Action"}]}]);
 add("Timekeeper",[
  {l:3,n:"Temporal Points",lu:[{n:"Temporal Points",max:"lvl",reset:"long",tag:"Reaction or Bonus Action"}]},
  {l:10,n:"Hastened",spCls:"Wizard",spells:[[10,"Haste"]]}]);
 add("War Magic",[
  {l:10,n:"Durable Magic",toggle:{id:"conc",label:"Concentrating on a spell"},acAdd:2,saveBonus:2}]);
 wxs("War Magic","Wizard").forEach(function(x){x.fx=(x.fx||[]).filter(function(r){return r[1]!=="Durable Magic"})});
 add("White Necromancer",[
  {l:3,n:"Lore of Life and Death",skillExpert:["Medicine"],spCls:"Wizard",spells:[[3,"Spare the Dying"]]},
  {l:6,n:"White Necromancy",spCls:"Wizard",spells:[[6,"Animate Dead"],[11,"Create Undead"]]},
  {l:10,n:"Life Bond",spCls:"Wizard",spells:[[10,"Warding Bond"]]}]);
})();
