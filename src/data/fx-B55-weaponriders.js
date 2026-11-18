DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B55 (hand written): extra damage dice on weapons, as notes on the weapon's own attack row (atkDice with when = the item name). They are conditional, so they are not added to the damage total. */
(function(){
function R(n,d,t){(GX.item[n]=GX.item[n]||[]).push({n:n+" (extra damage)",atkDice:[{when:n,d:d,t:t}]})}
R("Ebonbane","3d6","Necrotic against a Celestial or a Humanoid");
R("Ruby Rod of Asmodeus","2d12","Necrotic against a good-aligned creature (all damage from the rod is Necrotic)");
})();
