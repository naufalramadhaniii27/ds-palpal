# Ledger bin 2 (shards 04, 05, 06): rows not fully fixed

Data file: `src/data/fx-L2.js`. Key = ledger key. "Needed" = the engine field that does not exist.

## Skipped (engine field missing)

| Key (name) | Done in the file | Needed |
|---|---|---|
| Ranseur of Torture, Scourge of Shadow (3d4 slashing), True-Ice Shards (Rapier and Dagger), Ruby Rod of Asmodeus (all damage necrotic) | Row note says the dice or type are replaced. Crit 18-20 and the other numbers are counted | `dieReplace {when,d,t}` (weapon dice and damage type replacement, "weapon dice replacement" in the w-eng Skipped list) |
| Lucent Destroyer | Dancing Lights and a row note | damage type replacement (Radiant instead of Piercing) |
| Boomerang Shield, Arcane Propulsion Arm, Battlechef's Splendid Saucepan (Mace +1 and 1d4 Thunder), Warrior's Passkey (longsword form, +1, 1d10 Force) | Saucepan: helmet +1 AC toggle. Passkey: toggle with a Defenses note | `attackRow {n,ab,die,type,range,prof,bonus}` : an attack row for an item whose base is not a weapon, or only in a form |
| Blaster Mod (Extended Barrel) | none | `rangeMul:2` (reach and range multiplier) |
| Ioun Stone, Mastery | none | `pbAdd:1` (Proficiency Bonus +1) |
| Boon of High Magic | none | `slotAdd {lvl:9,n:1}` (a 9th level slot if you already have one) |
| Serpent Scale Armor | Dex uncapped through `acBase [14,"full"] acOver`; the no Stealth disadvantage is a Defenses note | `noStealthDis:true` (armor Stealth Disadvantage off) |
| Wyrmreaver Gauntlets (per rest resistance choice) | Extra 1d6 Force on unarmed hits | pick that gives a Resistance (`res` from a pick) |
| Blessed Reliquary (extra Channel Divinity use) | Advantage vs Undead saves, a Note, a Turn Undead use row | `cdAdd:1` (extra use of every Channel Divinity feature) |
| Belt of Dwarvenkind (not in the verdict) | Dwarvish added | species condition: Darkvision 60 and Poison resistance only for non dwarves |

## Judgement calls

- Abjurer's Gilder: the text says Shield is always prepared "if it is in your spellbook". The sheet cannot read the spellbook, so Shield is always prepared for a Wizard.
- Amulet of the Inferno: Fire Bolt and Produce Flame use the casting ability, or the best of INT, WIS, CHA for a non caster (text: INT).
- Arcane Carbine: only `spDc` added. The spell attack bonus was already in the row (adding it again doubled it, found by probe).
- Amulet of the Inferno: the row already had spell attack and DC +3, so the file adds no `spAtk`/`spDc`.
- Dragonkin Weapon: the extra dice go on every melee row (the item names no base weapon). Axe of the Mother Tree, Ancestral Laser Sword: the level bonus goes on rows named by the weapon kinds in the text, not on one single weapon.
- Blaster Mods: count on the blasters in the list at the top of the file (no host is named by the mod).
- Bird of a Feather (Uncommon): `ch` reset changed in `tp12-tsgs.js` to `"1d4 hours"` (smallest data edit, the FXO table cannot change `ch`).
- Deck of Wonder, Deck of Many More Things: already `fx:null` in `fx-D-item.js`. The ledger read the raw row. Verified by a golden build.
- Adamantine Armor: already a Defenses note in `16-logic-feature-numbers.js`. Verified by a golden build.
- Black Dragon Mask, Blue Dragon Mask (shard 06): left to the bin that owns `item|misc14|*Dragon Mask` (same item name, a second entry would double Darkvision and the Resistance to Immunity upgrade).

## Item names that other bins also list (merge note)

Both bins write `GX.item[name]` entries for the same name, so effects that add (dice, AC, Darkvision, HP, skill bonus) would count twice if both files load. Keep one entry per name when merging. Overlap with bin 3: Boomerang Shield, Boon of High Magic, Boon of Magic Resistance, Boon of Perfect Health, Boon of Resilience, Boon of Undetectability, Boon of the Fire Soul, Boon of the Stormborn, Budding Blossom Rod, Canian Fork, Charm of Many Tongues, Chattering Staff of Skulls, the seven Dark Gifts, Delver's Claws. Bin 4: Fate Cutter Shears, the three Fragments, Grave Reaper, Hammer of Runic Focus, Helm of Perfect Potential, Infernal Amulet, Infernal Plate Armor, both Ioun Stones, Lash of Immolation, Lucent Destroyer, Moon Card. Bin 5: Nimbus Coronet, Obsidian Flint Dragon Plate, the Staffs of Skulls, Orb of Skoraeus, Ranseur of Torture, the four elemental Rings, Ring of Red Fury, Rogue's Mantle, Ruidium Shield, Scourge of Shadow, Serpent Scale Armor, Serpent's Fang, Shield of the Blazing Dreadnought, Shield of the Hidden Lord, Spell Duelist's Trophy, Stonebreaker's Breastplate, Stonky's ring, Sun Staff, Sword of Zariel. Bin 6: Amethyst Lodestone, Arcane Propulsion Arm, Ascendant Dragon-Touched Focus, Belashyrra's Beholder Crown, the Blades of Broken Mirrors, Bloodaxe, War Horn of Valor, Watchful Helm, Wyrmreaver Gauntlets, the Dragonhide Belts. Bin 7: Akmon, Athreos's Devotee, Banner of the Krig Rune, Barrier Tattoos, Blessing of Dumathoin, Dragon Masks. Bin 8: the Dragonkin Weapons, Abjurer's Gilder, Ancestral Laser Sword, Arcane Carbine, Arcane Resonator, Arcanist's Bowstaff, Armor of Zombie Flesh, Astral Sea Piercer, Axe of the Mother Tree, Ballistic Sledge, Battlechef items, Big Bertha, Bird of a Feather, Blaster Mods, Blaster for Dummies, Blessed Reliquary, Bloodscryer Oculus. Bin 9: Blast Scepter.
