DataEnv.slot.GX=DataEnv.slot.GX||{};GX.feat=GX.feat||{};
/* fx data batch B15: AC bonuses of feats (a toggle where the bonus needs a play state). */
(function(){
var F=function(n,e){(GX.feat[n]=GX.feat[n]||[]).push(e)};
F("Stoneborn",{n:"Stoneborn (Stony Skin)",acAdd:1});
F("Exomorph",{n:"Exomorph (full Hit Points)",toggle:{id:"exomorph-full",label:"At full Hit Points"},acAdd:2});
F("Revenant Blade",{n:"Revenant Blade (two hands)",toggle:{id:"revenant-two-hands",label:"Holding a double-bladed scimitar in two hands"},acAdd:1});
})();
