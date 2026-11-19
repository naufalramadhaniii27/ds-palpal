DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B59 (hand written): effect immunities granted by items while worn or carried, as Immunity lines on the sheet. */
(function(){
var I=function(n,t){(GX.item[n]=GX.item[n]||[]).push({n:n+" (immunity)",defs:[["Immunity",n+": "+t]]})};
I("Ring of Nightmares","Immune to spells and abilities that disturb your sleep or cause nightmares");
I("Charm of the Snow Walker","Immune to the effects of extreme cold (no protection from Cold damage)");
I("Boon of Immortality","Immune to any effect that would age you, and you can't die of old age");
I("Reliquary of Dawn","Immune to the effects of Eventide");
I("Reliquary of Twilight","Immune to the effects of Morningtide");
})();
