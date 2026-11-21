DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B56 (hand written): more conditional extra damage on weapons, as notes on the weapon's own attack row. They depend on a condition or on spent charges, so they are not added to the damage total. */
(function(){
function R(n,d,t,w){(GX.item[n]=GX.item[n]||[]).push({n:n+" (extra damage)",atkDice:[{when:n,d:d,t:t+" "+w}]})}
R("Eldritch Staff","1d8","Lightning","for each charge spent on a melee hit (up to 3 charges)");
/* Cabal's Ruin is a cloak with no attack row of its own: the rider goes on every attack row, all three states repeat the Dormant text */
["Dormant","Awakened","Exalted"].forEach(function(st){var n="Cabal's Ruin ("+st+")";(GX.item[n]=GX.item[n]||[]).push({n:n+" (extra damage)",atkDice:[{when:"any",d:"1d6",t:"Lightning for each charge spent on a hit"}]})});
R("Lightbringer","1d6","Radiant","against Undead while the mace glows");
R("Quiver of Energy","1d6","of the quiver's damage type","first hit each turn with its ammunition");
R("Treant's Bane","2d6","of the weapon's type","against a plant creature");
GX.item["Battlebrew Maul"]=(GX.item["Battlebrew Maul"]||[]).concat([{n:"Battlebrew Maul (extra damage)",atkDice:[{when:"Battlebrew Maul",d:"2d6",t:"Acid",crit:1}]}]);
GX.item["Wings"]=(GX.item["Wings"]||[]).concat([{n:"Wings (flight time)",lu:{n:"Wings: flight minutes",max:10,reset:"short",tag:"10 minutes total, regained on a short or long rest"}}]);
})();
