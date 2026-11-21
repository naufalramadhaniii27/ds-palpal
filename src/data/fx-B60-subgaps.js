DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B60 (hand written): subclass features from tests/mech_baseline.json "gaps" whose text gives the character a number.
   A state (Rage roll, a boon, a stone held, the stars read) is a switch on the sheet; a choice that lasts until changed is a pick. Numbers are from the feature text. */
(function(){
var S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)};
var T=function(id,label){return {id:id,label:label}};
var SK=["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"];
var L=function(a){return a.map(function(x){return [x,""]})};
/* one skill of your choice with proficiency and Expertise: pick k, one entry per skill */
var PE=function(sub,l,n,k){var key="gx-"+k+"-sub-"+sub;return SK.map(function(s){return {n:n+": "+s,l:l,when:{key:key,val:s},skillProf:[s],skillExpert:[s]}})};
var ALLDMG=["Acid","Bludgeoning","Cold","Fire","Force","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder"];

/* Blast Shield: after a rest choose Acid, Cold, Fire, Lightning or Thunder, Resistance until changed */
var BS=["Acid","Cold","Fire","Lightning","Thunder"];
S("Mad Bomber",[{n:"Blast Shield",l:10,pick:[{k:"blast",t:"multi",n:1,title:"Blast Shield damage type",list:L(BS)}]}].concat(BS.map(function(t){return {n:"Blast Shield: "+t,l:10,when:{key:"gx-blast-sub-Mad Bomber",val:t},res:[t]}})));
/* Wild Surge roll 6 Protective Lights: +1 AC until the Rage ends */
S("Path of Wild Magic",[{n:"Wild Surge (Protective Lights)",l:3,toggle:T("b60-wild-lights","Wild Surge 6, Protective Lights: +1 AC"),acAdd:1}]);
/* Lone Wolf, Outnumbered, Not Outmatched: Advantage on Initiative when enemies outnumber allies */
var LW=[{n:"Lone Wolf (Outnumbered)",l:3,toggle:T("b60-lone-wolf","Enemies outnumber allies: Advantage on Initiative"),initAdv:true}];
S("Path of the Drifter",LW);
S("Rōnin",[Object.assign({},LW[0],{l:6})]);
/* Birdsong: Fly Speed equal to your Speed after a Bonus Action Bardic Inspiration */
S("College of Birdsong",[{n:"Birdsong (speed)",l:3,toggle:T("b60-birdsong","Birdsong: Fly Speed equal to Speed"),mv:{fly:"speed"}}]);
/* Outer Knowledge: proficiency and Expertise in one skill the GM picks each Long Rest */
S("College of the Mad God",[{n:"Outer Knowledge",l:3,pick:[{k:"outer",t:"multi",n:1,title:"Outer Knowledge skill (chosen by the GM)",list:L(SK)}]}].concat(PE("College of the Mad God",3,"Outer Knowledge","outer")));
/* Ethereal Moonwalk: while Moonwalk is active, Fly Speed equal to Speed and Resistance to all damage */
S("Moonwalker",[{n:"Ethereal Moonwalk",l:14,toggle:T("b19-moonwalk","Moonwalk: no Heavy armor, on your turn"),res:ALLDMG}]);
/* Warding Essence: two damage types, two conditions, or one of each; Resistance and Advantage on saves against the condition */
var WD=["Acid","Cold","Fire","Lightning","Poison","Thunder"],WC=["Blinded","Deafened","Charmed","Frightened","Poisoned","Prone","Restrained"],WK="gx-ward-sub-Vow of the Protector";
S("Vow of the Protector",[{n:"Warding Essence",l:6,pick:[{k:"ward",t:"multi",n:2,title:"Warding Essence: two damage types or conditions",list:L(WD.concat(WC))}]}]
 .concat(WD.map(function(t){return {n:"Warding Essence: "+t,l:6,when:{key:WK,val:t},res:[t]}}))
 .concat(WC.map(function(c){return {n:"Warding Essence: "+c,l:6,when:{key:WK,val:c},advOn:["saves to avoid or end the "+c+" condition"]}})));
/* Connect the Dots: one skill after a rest, proficiency and Expertise */
S("Conspiracy Theorist",[{n:"Connect the Dots",l:10,pick:[{k:"dots",t:"multi",n:1,title:"Connect the Dots skill",list:L(SK)}]}].concat(PE("Conspiracy Theorist",10,"Connect the Dots","dots")));
/* Medium Trinkets, Lucent Mirror: Fly Speed 10 feet for 1 minute */
S("Medium",[{n:"Trinkets (Lucent Mirror)",l:3,toggle:T("b60-lucent-mirror","Lucent Mirror: Fly Speed 10 ft"),mv:{fly:10}}]);
/* Drunken Technique: Speed +10 feet after Flurry of Blows */
S("Way of the Drunken Master",[{n:"Drunken Technique (speed)",l:3,toggle:T("b60-drunken","Flurry of Blows this turn: Speed +10 ft"),speedAdd:10}]);
/* Whispers of the Dead: one skill or tool proficiency you lack */
["Phantom","Phantom (2014)"].forEach(function(s){S(s,[{n:"Whispers of the Dead",l:3,pick:[{k:"whisper",t:"skills",n:1,title:"Whispers of the Dead skill (or note a tool)"}]}])});
/* Wild Magic Surge 49-52: spectral shield, +2 AC for 1 minute */
S("Wild Magic Sorcery",[{n:"Wild Magic Surge (49-52)",l:3,toggle:T("b60-surge-shield","Wild Magic Surge 49-52: +2 AC"),acAdd:2}]);
/* Soul Broker: one boon for 10 minutes. Speed +15 ft, or proficiency and Expertise in one skill */
var SB="gx-soul-sub-Diabolist";
S("Diabolist",[{n:"Soul Broker",l:6,pick:[{k:"soul",t:"multi",n:1,title:"Soul Broker boon",list:L(["Energy Resistance","Fortitude","Truesight","Skill","Speed"])}]},
 {n:"Soul Broker: Speed",l:6,when:{key:SB,val:"Speed"},speedAdd:15},
 {n:"Soul Broker: Skill",l:6,when:{key:SB,val:"Skill"},pick:[{k:"soulsk",t:"multi",n:1,title:"Soul Broker skill",list:L(SK)}]}]
 .concat(PE("Diabolist",6,"Soul Broker skill","soulsk")));
/* Promotion: Martial Training gives Martial weapons, Medium armor and Shields until changed */
var PK="gx-promo-sub-House of Pawns";
S("House of Pawns",[{n:"Promotion",l:3,pick:[{k:"promo",t:"multi",n:1,title:"Promotion benefit",list:L(["Adaptive Magic","Martial Training"])}]},
 {n:"Promotion: Martial Training",l:3,when:{key:PK,val:"Martial Training"},weapons:["Martial"],armor:["Medium","Shield"]}]);
/* Omen of Warning: Advantage on up to two Initiative rolls for 24 hours */
["Illuminator","School of Illumination"].forEach(function(s){S(s,[{n:"Omen of Warning",l:3,toggle:T("b60-omen","Omen of Warning read: Advantage on Initiative"),initAdv:true}])});
/* Somnambulist: Unconscious with 1 HP or more, Speed is halved */
S("Somnomancer",[{n:"Somnambulist",l:3,toggle:T("b60-somnambulist","Asleep (Somnambulist): Speed halved"),speedMul:0.5}]);
/* Transmuter's Stone: the holder has proficiency in Constitution saves; the Speed benefit adds 10 feet */
var TS="gx-tstone-sub-Transmuter",TT=T("b60-tstone","Holding your Transmuter's Stone");
S("Transmuter",[{n:"Transmuter's Stone",l:3,pick:[{k:"tstone",t:"multi",n:1,title:"Transmuter's Stone benefit",list:L(["Darkvision","Resistance","Speed"])}]},
 {n:"Transmuter's Stone (held)",l:3,toggle:TT,saveProf:["CON"]},
 {n:"Transmuter's Stone: Speed",l:3,toggle:TT,when:{key:TS,val:"Speed"},speedAdd:10}]);
})();
