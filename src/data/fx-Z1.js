DataEnv.declare("__fxZ1");
/* fx data Z1 (zero miss 1, reports/zero-miss-1.md): DMG 2024 magic weapons whose on-hit extra damage had no record, so the attack row said nothing.
   Each row is an atkDice note on the weapon's own attack row (when = the item name; variants such as "Flame Tongue (Rapier)" match through
   the item name, 12l pickRowsOf). The dice are not added to the row's damage total: they are conditional (creature type, a d20 of 20, ranged
   hits, a burning blade), the note says when they apply. Readings and sources: reports/rules-notes.md, section "Zero miss 1: DMG 2024 weapons". */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
(function(){
 if(DataEnv.slot.__fxZ1)return;DataEnv.slot.__fxZ1=1;
 function I(n,e){e.n=e.n||n;(GX.item[n]=GX.item[n]||[]).push(e)}
 function R(n,d,t,ed){const e={n:n,atkDice:[{when:n,d:d,t:t}]};if(ed)e.ed=ed;I(n,e)}
 /* ed: the DMG 2014 row (DM14.ov, 09c dm14Set) reads differently, so each edition gets its own note (review fix D) */
 R("Axe of the Dwarvish Lords","20","Slashing when the d20 shows a 20 (against a creature)","2024");
 R("Axe of the Dwarvish Lords","14","Slashing when you roll a 20 (Sword of Sharpness; roll another d20, on a 20 you lop off a limb)","2014");
 R("Axe of the Dwarvish Lords","1d8","Force on a ranged hit (2d8 against a Giant)","2024");
 R("Axe of the Dwarvish Lords","1d8","on a ranged hit (2d8 against a giant; Dwarven Thrower)","2014");
 R("Dragon Slayer","3d6","of the weapon's type, against a Dragon");
 R("Dwarven Thrower","1d8","Force on a ranged hit (2d8 against a Giant)","2024");
 R("Dwarven Thrower","1d8","on a ranged hit (2d8 against a giant)","2014");
 R("Executioner's Axe","2d6","Slashing against a Humanoid, and you gain that many Temporary Hit Points","2024");
 R("Flame Tongue","2d6","Fire while the weapon is burning (Bonus Action to light it)");
 R("Giant Slayer","2d6","of the weapon's type, against a Giant");
 R("Holy Avenger","2d10","Radiant against a Fiend or an Undead");
 R("Mace of Disruption","2d6","Radiant against a Fiend or an Undead");
 R("Mace of Smiting","7","Bludgeoning when the d20 shows a 20 (14 against a Construct)");
 R("Oathbow","3d6","Piercing against your sworn enemy");
 R("Staff of Thunder and Lightning","2d6","Lightning on a melee hit, once per dawn (Lightning property)");
 R("Sun Blade","1d8","Radiant against an Undead");
 R("Sword of Kas","2d10","Slashing against an Undead");
 R("Sword of Life Stealing","15","Necrotic when the d20 shows a 20, not against a Construct or an Undead; you gain that many Temporary Hit Points","2024");
 R("Sword of Life Stealing","10","Necrotic when you roll a 20, not against a construct or an undead; you also gain 10 temporary hit points","2014");
 R("Vorpal Sword","30","Slashing when the d20 shows a 20 and the target keeps its head (no head, Slashing Immunity, too large, or Legendary Resistance spent)","2024");
 R("Vorpal Sword","6d8","Slashing when you roll a 20 and the target keeps its head (no head, slashing immunity, legendary actions, or too big)","2014");
 R("Wave","21","Necrotic when the d20 shows a 20","2024");
 R("Wave","half its hit point maximum","Necrotic on a critical hit","2014");
 R("Whelm","1d8","Force on a ranged hit (4d8 against a Giant, an Elemental, or a Construct)","2024");
 R("Whelm","1d8","Bludgeoning on a ranged hit (2d8 against a giant)","2014");
})();
