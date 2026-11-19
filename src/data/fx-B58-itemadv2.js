DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B58 (hand written): conditional Advantage granted by items, as Advantage lines on the sheet (the condition is in the line). */
(function(){
var A=function(n,t){(GX.item[n]=GX.item[n]||[]).push({n:n+" (advantage)",defs:[["Advantage",n+": "+t]]})};
A("Bob","Advantage on Strength (Athletics) checks made to swim");
A("Ephara's Votary","Advantage on Charisma (Persuasion) checks while in a city");
A("Goggles of Object Reading","Advantage on Intelligence (Arcana) checks to reveal information about a creature or object you can see");
A("Mask of Dendallen","Advantage on Constitution saves to keep Concentration on those spells");
A("Ectoplasmic Whip","Advantage on attack rolls with it against non-Undead creatures");
A("Bolt","Advantage on ranged attacks with it against a metal target or a creature in metal armor");
A("Defias Leather","Advantage on Dexterity (Stealth) checks to hide against stone objects and structures");
A("Ankh of Anubis","Advantage on attack rolls, ability checks and saving throws while you have 10 Hit Points or fewer");
A("Ghost Suit","Advantage on Dexterity (Stealth) checks for the Hide action if you moved 15 ft or less on your turn");
A("Rope of Climbing","Advantage on ability checks made to climb with the rope");
A("Candle of Invocation","Advantage on D20 Tests while you are inside the candle's light");
})();
