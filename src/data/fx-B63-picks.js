DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};GX.feat=GX.feat||{};
/* fx data batch B63 (hand written): by_design features in tests/mech_baseline.json that are a lasting skill, tool, language or cantrip pick.
   Each is a builder pick so the choice shows on the sheet. Numbers and lists are from the feature text. */
(function(){
var S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)},F=function(k,e){GX.feat[k]=(GX.feat[k]||[]).concat(e)};
/* Mask of Civility (3): one skill from the list, plus one Artisan's Tools or one language */
S("Path of the Fractured (2014)",[{n:"Mask of Civility",l:3,pick:[
  {k:"skill",t:"skills",n:1,from:["Arcana","History","Investigation","Medicine","Nature","Persuasion","Religion"],title:"Mask of Civility skill"},
  {k:"mode",t:"multi",n:1,list:[["Artisan's Tools","Gain one set of Artisan's Tools."],["Language","Learn one language."]],title:"Mask of Civility extra: tool or language"}]},
 {n:"Mask of Civility",l:3,when:{key:"gx-mode-sub-Path of the Fractured (2014)",val:"Artisan's Tools"},pick:[{k:"tool",t:"tool",n:1,cats:["art"],title:"Mask of Civility tool"}]},
 {n:"Mask of Civility",l:3,when:{key:"gx-mode-sub-Path of the Fractured (2014)",val:"Language"},pick:[{k:"lang",t:"lang",n:1,title:"Mask of Civility language"}]}]);
/* Well-Rounded (6): one Artisan's Tools, one skill, one language */
S("College of Adventurers (2014)",[{n:"Well-Rounded",l:6,pick:[
 {k:"skill",t:"skills",n:1,title:"Well-Rounded skill"},
 {k:"tool",t:"tool",n:1,cats:["art"],title:"Well-Rounded Artisan's Tools"},
 {k:"lang",t:"lang",n:1,title:"Well-Rounded language"}]}]);
/* Tall Tales (3): one skill from Deception, Intimidation, Performance, Persuasion */
S("Way of Pride",[{n:"Tall Tales",l:3,pick:[{k:"skill",t:"skills",n:1,from:["Deception","Intimidation","Performance","Persuasion"],title:"Tall Tales skill"}]}]);
/* Bonus Proficiencies (3): one skill the GM picks */
S("College of the Mad God (2014)",[{n:"Bonus Proficiencies",l:3,pick:[{k:"skill",t:"skills",n:1,title:"Bonus Proficiencies skill (GM picks)"}]}]);
/* Devastation Initiate (3): two Wizard cantrips, cleric spells, not counted against cantrips known */
S("Destruction Domain",[{n:"Devastation Initiate",l:3,spCls:"Cleric",pick:[{k:"cantrips",t:"cantrip",n:2,cls:"Wizard",title:"Two Wizard cantrips"}]}]);
/* Unpredictable Inspiration (3): any one cantrip as a cleric spell, and one skill */
S("Eldritch Domain (2014)",[{n:"Unpredictable Inspiration",l:3,spCls:"Cleric",pick:[{k:"cantrip",t:"cantrip",n:1,title:"Any cantrip"},{k:"skill",t:"skills",n:1,title:"Unpredictable Inspiration skill"}]}]);
/* Seraph Level 1 Angelic Wings (2014): a fly speed equal to your speed */
F("Seraph Transformation: Level 1",[{n:"Angelic Wings",mv:{fly:"speed"}}]);
/* Fiend Stage 4 Abyssal Resistance: Immunity to the Fiendish Soul type (Stage 1 feat), Resistance to the other two of Acid, Cold, Fire */
var E3=["Acid","Cold","Fire"];
E3.forEach(function(t){F("Fiend Transformation: Stage 4",[{n:"Abyssal Resistance: "+t,when:{key:"trFiend4",val:"Abyssal Resistance",and:{key:"fr",any:1,val:t}},imm:[t],res:E3.filter(function(x){return x!==t})}])});
})();
