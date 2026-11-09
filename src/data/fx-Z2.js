DataEnv.declare("__fxZ2");
/* fx data Z2 (zero miss 2, reports/zero-miss-2.md): sentences of the classes SPEED, RESOURCE and PROF that the sheet did not count.
   Speed forms (wings, Rage flight, a Dash rider) are toggles like the other play states of fx engine v3b: the number appears on the sheet only while the
   state is on (S.fxT). Fixed numbers stay constant, "speed" and "speed2" follow the Speed of the sheet.
   Resource row (lu) and Divine Strike (atkDice, a note on the weapon rows, not added to the damage total). The once per Long Rest rows of Draconic Flight and Large Form already exist.
   Readings and sources: reports/rules-notes.md, section "Zero miss 2". */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};GX.sub=GX.sub||{};GX.species=GX.species||{};GX.feat=GX.feat||{};GX.cls=GX.cls||{};
(function(){
 if(DataEnv.slot.__fxZ2)return;DataEnv.slot.__fxZ2=1;
 function put(t,n,e){(GX[t][n]=GX[t][n]||[]).push(e)}
 function S(n,e){put("sub",n,e)}
 function SP(n,e){put("species",n,e)}
 function F(n,e){put("feat",n,e)}
 function C(n,e){put("cls",n,e)}
 /* ---- SPEED: forms that give a Speed or a movement mode ---- */
 S("Path of the Wild Heart",{n:"Power of the Wilds (Falcon)",l:14,toggle:{id:"wild-falcon",label:"Raging with the Falcon spirit"},cond:"noBody",mv:{fly:"speed"}});
 S("Draconic Sorcery",{n:"Dragon Wings",l:14,toggle:{id:"dragon-wings",label:"Dragon Wings out"},mv:{fly:60}});
 S("Draconic Bloodline",{n:"Dragon Wings",l:14,toggle:{id:"dragon-wings",label:"Dragon Wings out"},mv:{fly:"speed"}});
 S("Divine Soul",{n:"Otherworldly Wings",l:14,toggle:{id:"otherworldly-wings",label:"Spectral wings out"},mv:{fly:30}});
 S("Aberrant Sorcery",{n:"Revelation in Flesh (aquatic)",l:6,toggle:{id:"flesh-aquatic",label:"Revelation in Flesh: aquatic form"},mv:{swim:"speed2"},defs:[["Note","You can breathe underwater"]]});
 S("Aberrant Sorcery",{n:"Revelation in Flesh (flight)",l:6,toggle:{id:"flesh-flight",label:"Revelation in Flesh: flight"},mv:{fly:"speed"},defs:[["Note","You can hover"]]});
 S("Oath of Vengeance",{n:"Avenging Angel",l:20,toggle:{id:"avenging-angel",label:"Avenging Angel active"},mv:{fly:60},defs:[["Note","You can hover"]]});
 S("Oath of Vengeance (2014)",{n:"Avenging Angel",l:20,toggle:{id:"avenging-angel",label:"Avenging Angel active"},mv:{fly:60}});
 S("Psi Warrior",{n:"Telekinetic Adept (Psi-Powered Leap)",l:11,toggle:{id:"psi-leap",label:"Psi-Powered Leap (until the end of the turn)"},mv:{fly:"speed2"}});
 S("Gloom Stalker",{n:"Dread Ambusher (Speed)",l:3,toggle:{id:"dread-ambusher",label:"First turn of the combat"},speedAdd:10});
 S("Gloom Stalker (2014)",{n:"Dread Ambusher (Speed)",l:3,toggle:{id:"dread-ambusher",label:"First turn of the combat"},speedAdd:10});
 S("Warrior of the Elements",{n:"Elemental Epitome (Step of the Wind)",l:17,toggle:{id:"epitome-step",label:"Step of the Wind used this turn"},speedAdd:20});
 S("Circle of the Stars",{n:"Twinkling Constellations (Dragon)",l:10,toggle:{id:"stars-dragon",label:"Dragon is the active constellation"},mv:{fly:20},defs:[["Note","You can hover"]]});
 F("Charger",{n:"Charger (Dash)",toggle:{id:"charger-dash",label:"Taking the Dash action"},speedAdd:10});
 SP("Dragonborn",{n:"Draconic Flight",l:5,toggle:{id:"draconic-flight",label:"Spectral wings out (10 minutes)"},mv:{fly:"speed"}});
 SP("Goliath",{n:"Large Form",l:5,toggle:{id:"large-form",label:"Large Form (10 minutes)"},speedAdd:10,advOn:["Strength checks"]});
 /* ---- RESOURCE ---- */
 /* Relentless Rage: the Constitution save DC starts at 10 and rises by 5 for every use since the last rest. One pip per use, so the DC to roll is 10 + 5 x pips already spent. */
 C("Barbarian",{n:"Relentless Rage",l:11,lu:[{n:"Relentless Rage",max:4,reset:"short",tag:"Con save DC 10, +5 for each use since a rest (tick one per use)"}]});
 /* Divine Strike (Cleric domains, 8th level): once per turn on a weapon hit, 1d8, a second 1d8 from level 14. The extra die is a note on the weapon rows. */
 function DS(sub,type){
  S(sub,{n:"Divine Strike",l:8,atkDice:[{when:"weapon",d:"1d8",t:type,note:"Divine Strike, once per turn"}]});
  S(sub,{n:"Divine Strike",l:14,atkDice:[{when:"weapon",d:"1d8",t:type,note:"Improved Divine Strike (a second 1d8, 2d8 in all), once per turn"}]})}
 DS("Life Domain (2014)","Radiant");
 DS("Nature Domain","Cold, Fire, or Lightning (your choice)");
 DS("Tempest Domain","Thunder");
 DS("Trickery Domain (2014)","Poison");
 DS("War Domain (2014)","of the weapon's type");
 DS("Death Domain","Necrotic");
 DS("Order Domain","Psychic");
 DS("Twilight Domain","Radiant");
 DS("Forge Domain","Fire");
 /* Blood Domain already had the 1d8 (fx-N1.js), the second die at 14 was missing */
 S("Blood Domain",{n:"Divine Strike",l:14,atkDice:[{when:"weapon",d:"1d8",t:"Necrotic",note:"Improved Divine Strike (a second 1d8, 2d8 in all), once per turn"}]});
})();
