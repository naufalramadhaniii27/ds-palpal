DataEnv.slot.GX=DataEnv.slot.GX||{};GX.species=GX.species||{};
/* fx data batch B50 (hand written): the Darakhul heritage traits Powerful Jaw (the bite is an Unarmed Strike, 1d4 Piercing) and Undead Vitality (dormant for 6 hours a day, with Disadvantage on Perception checks while dormant). Same twelve heritages in the text. */
(function(){
["Derro","Dragonborn","Drow","Dwarf","Elf/Shadow Fey","Gnome","Halfling","Human and Half-Elf","Kobold","Ravenfolk","Tiefling","Trollkin"].forEach(function(h){var k=h+" Heritage";GX.species[k]=(GX.species[k]||[]).concat([
 {n:"Powerful Jaw",unarmed:{die:"1d4",t:"Piercing"},defs:[["Note","Powerful Jaw: your bite is a natural weapon for Unarmed Strikes. It deals 1d4 plus your Strength modifier Piercing damage instead of Bludgeoning"]]},
 {n:"Undead Vitality",defs:[["Disadvantage","Undead Vitality: while you are dormant (6 hours a day instead of sleeping), Disadvantage on Perception checks"]]}])})
})();
