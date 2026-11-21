DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B42 (hand written): Divine Strike of more Cleric domains, same rows as B11 (a note on the weapon rows, 1d8 from level 8, 2d8 from level 14). Travel Domain is Kobold Press (Lightning), Travel Domain (2014) is Valda's Spire (Force). */
(function(){
var S=GX.sub,add=function(n,e){S[n]=(S[n]||[]).concat(e)};
var ds=function(n,t){add(n,[{n:"Divine Strike (rider)",l:8,atkDice:[{when:"weapon",d:"1d8",t:t,note:"Divine Strike, once per turn"}]},{n:"Divine Strike (rider 14)",l:14,atkDice:[{when:"weapon",d:"2d8",t:t,note:"Divine Strike, 2d8 in all, once per turn"}]}])};
var d14=function(n,t){add(n,[{n:"Divine Strike (rider 14)",l:14,atkDice:[{when:"weapon",d:"2d8",t:t,note:"Divine Strike, 2d8 in all, once per turn"}]}])};
ds("Solidarity Domain (PSA)","weapon type");ds("Strength Domain (PSA)","weapon type");ds("Hunting Domain","weapon type");ds("Labyrinth Domain","weapon type");ds("Prophecy Domain","weapon type");ds("Speed Domain","weapon type");ds("Rum Domain","weapon type");ds("Hunt Domain","weapon type");
ds("Moon Domain (Deep Magic)","Cold");ds("Travel Domain","Lightning");ds("Travel Domain (2014)","Force");ds("Pestilence Domain (2014)","Poison");ds("Inquisition Domain (2014)","Force");
d14("Apocalypse Domain","Necrotic");d14("Beer Domain","Radiant");d14("Darkness Domain","Necrotic");d14("Justice Domain","Radiant");
})();
