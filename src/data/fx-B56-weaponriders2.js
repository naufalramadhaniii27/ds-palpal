DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B56 (hand written): more conditional extra damage on weapons, as notes on the weapon's own attack row. They depend on a condition or on spent charges, so they are not added to the damage total. */
(function(){
function R(n,d,t,w){(GX.item[n]=GX.item[n]||[]).push({n:n+" (extra damage)",atkDice:[{when:n,d:d,t:t+" "+w}]})}
R("Eldritch Staff","1d8","Lightning","for each charge spent on a melee hit (up to 3 charges)");
R("Cabal's Ruin (Dormant)","1d6","Lightning","for each charge spent on a hit");
R("Lightbringer","1d6","Radiant","against Undead while the mace glows");
R("Quiver of Energy","1d6","of the quiver's damage type","first hit each turn with its ammunition");
R("Treant's Bane","2d6","of the weapon's type","against a plant creature");
R("Battlebrew Maul","2d6","Acid","on a natural 20 to hit");
GX.item["Wings"]=(GX.item["Wings"]||[]).concat([{n:"Wings (flight time)",lu:{n:"Wings: flight minutes",max:10,reset:"short",tag:"10 minutes total, regained on a short or long rest"}}]);
})();
