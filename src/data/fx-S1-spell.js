DataEnv.slot.GX=DataEnv.slot.GX||{};GX.spell=GX.spell||{};
/* fx data S1: effects of spells the character has picked (GX.spell[name], source "spells" in builder/11b). Hand written.
   Shillelagh, toggle "shillelagh". Club or Quarterstaff rows: spellcasting ability for attack and damage, the damage die becomes a d8.
   2024 (PHB 2024): damage Force or the weapon's normal type; die d10 at level 5, d12 at 11, 2d6 at 17. 2014 (PHB): d8 at every level, the weapon becomes magical. */
(function(){
 var T={id:"shillelagh",label:"Shillelagh"},W=["Club","Quarterstaff"];
 GX.spell["Shillelagh"]=[
  {n:"Shillelagh",ed:"2024",toggle:T,atkAb:{kind:W,ab:"spell"},dieReplace:[{when:W,d:[[1,"1d8"],[5,"1d10"],[11,"1d12"],[17,"2d6"]],t:"Force or Bludgeoning"}]},
  {n:"Shillelagh",ed:"2014",toggle:T,atkAb:{kind:W,ab:"spell"},dieReplace:[{when:W,d:"1d8",note:"Counts as magical (Shillelagh)."}]}];
})();
