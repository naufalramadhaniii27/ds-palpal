DataEnv.declare("__fxZ1");
/* fx data Z1 (zero miss 1, reports/zero-miss-1.md): DMG 2024 magic weapons whose on-hit extra damage had no record, so the attack row said nothing.
   Each row is an atkDice note on the weapon's own attack row (when = the item name; variants such as "Flame Tongue (Rapier)" match through
   the item name, 12l pickRowsOf). The dice are not added to the row's damage total: they are conditional (creature type, a d20 of 20, ranged
   hits, a burning blade), the note says when they apply. Readings and sources: reports/rules-notes.md, section "Zero miss 1: DMG 2024 weapons". */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
(function(){
 if(DataEnv.slot.__fxZ1)return;DataEnv.slot.__fxZ1=1;
 function I(n,e){e.n=e.n||n;(GX.item[n]=GX.item[n]||[]).push(e)}
 function R(n,d,t){I(n,{n:n,atkDice:[{when:n,d:d,t:t}]})}
 R("Axe of the Dwarvish Lords","20","Slashing when the d20 shows a 20 (against a creature)");
 R("Axe of the Dwarvish Lords","1d8","Force on a ranged hit (2d8 against a Giant)");
 R("Dragon Slayer","3d6","of the weapon's type, against a Dragon");
 R("Dwarven Thrower","1d8","Force on a ranged hit (2d8 against a Giant)");
 R("Executioner's Axe","2d6","Slashing against a Humanoid, and you gain that many Temporary Hit Points");
 R("Flame Tongue","2d6","Fire while the weapon is burning (Bonus Action to light it)");
 /* Holy Avenger and all its weapon variants use the typed target entries in fx-L4. */
 R("Mace of Smiting","7","Bludgeoning when the d20 shows a 20 (14 against a Construct)");
 R("Staff of Thunder and Lightning","2d6","Lightning on a melee hit, once per dawn (Lightning property)");
 I("Sun Blade",{target:{types:["Undead"]},atkDice:[{when:"Sun Blade",d:"1d8",t:"Radiant",roll:true}]});
 I("Sword of Kas",{target:{types:["Undead"]},atkDice:[{when:"Sword of Kas",d:"2d10",t:"Slashing",roll:true}]});
 R("Sword of Life Stealing","15","Necrotic when the d20 shows a 20, not against a Construct or an Undead; you gain that many Temporary Hit Points");
 R("Vorpal Sword","30","Slashing when the d20 shows a 20 and the target keeps its head (no head, Slashing Immunity, too large, or Legendary Resistance spent)");
 R("Wave","21","Necrotic when the d20 shows a 20");
 R("Whelm","1d8","Force on a ranged hit (4d8 against a Giant, an Elemental, or a Construct)");
})();
