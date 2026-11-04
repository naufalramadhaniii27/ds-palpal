/* fx data batch B1: subclass effects that the mechanics scan found as REAL gaps.
   Registry GX.sub[subclass] = list of fx entries (schema: SOURCE-NOTES.md, "fx schema"). */
window.GX=window.GX||{};GX.sub=GX.sub||{};
(function(){
 var S=GX.sub,add=function(n,e){S[n]=(S[n]||[]).concat(e)};
 add("Xenoalchemist",[{n:"Xenobiology",l:3,advOn:["ability checks to identify or research monsters"],pick:[{k:"skill",t:"skills",n:1,from:["Arcana","Nature","Medicine"],title:"Xenobiology skill"}]}]);
 add("Path of the Dad",[{n:"Paternal Proficiencies",l:3,pick:[{k:"tools",t:"tool",n:2,cats:["art"],title:"Two sets of Artisan's Tools"}]}]);
 add("Path of the Fractured",[
  {n:"Mask of Civility",l:3,pick:[
   {k:"skill",t:"skills",n:1,from:["Arcana","History","Investigation","Medicine","Nature","Persuasion","Religion"],title:"Mask of Civility skill"},
   {k:"mode",t:"multi",n:1,list:[["Artisan's Tools","Gain one set of Artisan's Tools."],["Language","Learn one language."]],title:"Mask of Civility extra: tool or language"}]},
  {n:"Mask of Civility",l:3,when:{key:"gx-mode-sub-Path of the Fractured",val:"Artisan's Tools"},pick:[{k:"tool",t:"tool",n:1,cats:["art"],title:"Mask of Civility tool"}]},
  {n:"Mask of Civility",l:3,when:{key:"gx-mode-sub-Path of the Fractured",val:"Language"},pick:[{k:"lang",t:"lang",n:1,title:"Mask of Civility language"}]}]);
 add("Path of the Slasher",[{n:"Mark of the Slasher",l:3,pick:[{k:"skill",t:"skills",n:1,from:["Athletics","Intimidation","Stealth"],title:"Mark of the Slasher skill"}]}]);
 add("College of Adventurers",[{n:"Well-Rounded",l:6,pick:[
  {k:"skill",t:"skills",n:1,title:"Well-Rounded skill"},
  {k:"tool",t:"tool",n:1,cats:["art"],title:"Well-Rounded Artisan's Tools"},
  {k:"lang",t:"lang",n:1,title:"Well-Rounded language"}]}]);
 add("College of Birdsong",[{n:"Feathered Friends",l:3,spCls:"Bard",spells:[[3,"Speak with Animals"]]}]);
 add("College of Choreography",[{n:"Fast Movement",l:3,speed:[[3,10],[6,15],[14,20]]}]);
 add("College of Dance",[{n:"Dazzling Footwork",l:3,acBase:[10,"full","CHA"],cond:"noArmor"}]);
 add("College of Requiems",[{n:"Chilling Melody",l:3,spCls:"Bard",pick:[{k:"cantrips",t:"cantrip",n:2,school:"Necromancy",title:"Two Necromancy cantrips"}]}]);
 add("Troubadour",[{n:"Folk Musician",l:3,skillProf:["Performance"],skillExpert:["Performance"],pick:[{k:"instr",t:"tool",n:2,cats:["music"],title:"Two Musical Instruments"}]}]);
 add("Yellow Sign",[{n:"Eldritch Herald",l:3,advOn:["saves to avoid or end the Charmed and Frightened conditions"]}]);
 add("Arcane Maesters' Guild",[{n:"Arcane Apprenticeship",l:3,spCls:"@sub:INT",spells:[[3,"True Strike"]],pick:[{k:"cantrips",t:"cantrip",n:2,cls:"Wizard",title:"Two Wizard cantrips"}]}]);
 add("Armigers' Guild",[{n:"Tower Shield",l:3,shAc:[[3,1]]}]);
 add("Marionettist",[{n:"Familiar Doll",l:3,spCls:"@sub:CHA",spells:[[3,"Find Familiar"]]}]);
 add("Champion",[{n:"Remarkable Athlete",l:3,initAdv:true}]);
 add("Vow of the Martyr",[{n:"Martyr's Endurance",l:3,hpLvl:1}]);
 add("Kid Sleuth",[{n:"Animal Sidekick",l:3,spCls:"@sub:INT",spells:[[3,"Find Familiar"]]}]);
 add("Burden of Revolution",[{n:"Aura of Tenacity",l:6,init:"WIS",min:1}]);
/* Record-only choices (the sheet stores the pick; the effect itself is not counted): mutations, thesis, Manifest Blow */
 add("Experiment X",[
  {n:"Mutations",l:3,pick:[{k:"mutation",t:"multi",n:1,title:"Mutation",list:[["Acid Spit","Ranged acid attack in place of one attack, 60 ft."],["Adamantine Claws","Retractable claws that use Scimitar statistics and grow better with level."],["Extra Limbs","A second pair of arms that can hold gear and do Somatic components."]]}]},
  {n:"Arcane Mutation",l:6,pick:[{k:"arcane",t:"multi",n:1,title:"Arcane Mutation",list:[["Invisibility","Cast Invisibility on yourself using a Battle Die."],["Spider Climb","Cast Spider Climb on yourself using a Battle Die."],["Telepathy","30-ft telepathy and Detect Thoughts using a Battle Die."]]}]},
  {n:"Apex Mutation",l:14,pick:[{k:"apex",t:"multi",n:1,title:"Apex Mutation",list:[["Accelerated Metabolism","Cast Haste on yourself using 3 Battle Dice."],["Energy Blast","8d8 area blast with a chosen energy type."],["Monstrous Transformation","Shape-shift into a Monstrosity with Strength and Dexterity 24."]]}]}]);
 add("Archivist",[{n:"Thesis",l:3,pick:[{k:"thesis",t:"multi",n:1,title:"Thesis subject",list:[["Corpus",""],["Mentis",""],["Mortis",""],["Oculus",""]]}]}]);
 add("Warrior of the Living Weapon",[{n:"Manifest Blow",l:6,pick:[{k:"blow",t:"multi",n:1,title:"Manifest Blow option",list:[["Forged Heart","Extra damage of one Martial Arts die once per turn on an Unarmed Strike hit."],["Nightmare Shroud","Magic action, 2 Focus Points: 30-ft Emanation Wisdom save for Psychic damage and Frightened."],["Traveler's Blade","Damage and Grapple on one hit, always a free hand to Grapple."],["Weretouched","Spend Focus Points for extra damage on a second Unarmed Strike hit."]]}]}]);
})();
