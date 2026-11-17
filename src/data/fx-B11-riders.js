DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B11: weapon damage riders of subclasses (shown as a note on the weapon rows, not added to the damage total). */
(function(){
var S=GX.sub,add=function(n,e){S[n]=(S[n]||[]).concat(e)};
var ds=function(n,t){add(n,[{n:"Divine Strike (rider)",l:8,atkDice:[{when:"weapon",d:"1d8",t:t,note:"Divine Strike, once per turn"}]},{n:"Divine Strike (rider 14)",l:14,atkDice:[{when:"weapon",d:"2d8",t:t,note:"Divine Strike, 2d8 in all, once per turn"}]}])};
ds("Dragon Domain","Fire");ds("Hunger Domain","Necrotic");ds("Lust Domain","Psychic");ds("Vermin Domain","Poison");ds("Zeal Domain (PSA)","weapon type");
add("Bounty Hunter",[{n:"Cornered Quarry (rider)",l:3,atkDice:[{when:"weapon",d:"1d8",t:"weapon type",note:"Cornered Quarry, once per turn, when no ally of the target is within 5 ft"}]}]);
add("Freerunner",[{n:"Momentum (rider)",l:3,atkDice:[{when:"weapon",d:"1d6",t:"extra",note:"Momentum, next weapon attack after moving through a hostile space, leaving reach or moving 15 ft"}]}]);
})();
