# Ledger bin L1 (shards 00 to 03): not fixed

Keys the engine cannot express yet. Each line gives the key and the field the engine would need. Nothing was hacked around them.

## Needs a new engine field
| Key | Needed |
|---|---|
| class Craftsman Masterwork Weapon | atkBonus filter for a weapon row flagged mw (the inventory flag exists for armor only), +1/+2/+3/+4 by class level |
| class Investigator Ritualist | grimoire pick with a Ritual flag filter and a count of 4 plus 2 per level (cantrip pick has no ritual filter) |
| feat Quicksmithing, Ritual Caster (2014) | spell pick filtered by the Ritual tag (and by a chosen class list) |
| feat Spell Sniper (2014), Fey Pact | cantrip pick filtered by "needs an attack roll" or by two schools (pick takes one school only) |
| feat Chronomancy Initiate, Gun-Mage Adept | spell pick filtered by a spell tag (Chronomancy, Firearm), count equal to Proficiency Bonus |
| feat Focused Fighting, Focused Hunter | extra point in the Adrenaline Points pool of another class feature (lu cannot add to a pool owned by another entry) |
| feat Lilliputian | size set DOWN to Tiny (size field only raises) |
| feat Infernal Bulwark | acBase ability taken from the ability the feat raised ("@asi" is only understood by spCls) |
| feat The Firm: Contractor | weapon damage dice replacement (1d4 Simple weapon deals 2d4) |
| feat Two-Weapon Fighting | off-hand attack modifier |
| feat Reptiloid Acid Spit, Vampire Transformation Stage 1 (Fanged Bite, Claw), Shadowsteel Ghoul Stage 3 (Cursed Claw) | natural attack row from a gx entry (rows exist only from FEATS[].attacks) |
| feat Shadowsteel Ghoul Stage 2 Shadowsteel Caster | lu max from the best of Intelligence, Wisdom, Charisma |
| feat Seraph / Specter / Ooze / Vampire stage feats | a stage feat cannot read the boon pick made in another stage feat slot (when.any exists only on claude/w-fixmiss). Uses that grow by one per later stage are shown at the value of the stage that grants the boon; Ooze Form grows through extra rows |
| feat Fey Transformation Stage 4, Star and Shadow Reader | already written in fx-H-audit.js on claude/w-fixmiss (needs when.any). Not duplicated here |
| feat Forest Sage (two spells), Familiar Keeper-like picks of one spell from a list | spell pick without a class list |

## Verified as already carried (spec said MISS)
These keys were checked against real sheet output (Wizard 8, feat at level 4) and changed nothing, so no data was written: Abjuration/Conjuration/Divination/Enchantment/Evocation/Illusion/Necromancy/Transmutation Adept (all five spells are prepared; the slot-level gate is not applied, a known approximation), Cartomancer, Chef, Chef (2014), Clown, Cold Caster, Durable (saveNotes), Emerald Enclave Fledgling, Field Medic cantrip, Flamewoken, Gathered Whispers, Gunner, Heavily Armored (both), Heavy Armor Master (note), Latent Psionics, Light Bringer, Lightly Armored (both), Living Shadow, Mark of Making, Scribing, Shadow and Storm, Martial Weapon Training, Plantmender cantrips, Psionic-Awakened and Technopath and Pyromaniac spells, Rune Shaper, S.S. St. Vincent: Archon, Tavern Brawler (2024), Telekinetic (2014), The Tower: Agent, Touch of Death cantrip, Unarmed Fighting, War Caster, Wood Elf Magic free casts, Magic Initiate (cantrips come from the native B.pk picks).

## Fixed proficiency fields do not reach the sheet
gfx entries with `weapons`, `armor` or `tools` only fill `C.profSrc` (the source list). `C.profs`, which the attack rows read, is not changed (checked on the sheet: Cannoneer, Gambler, Coalition stay unchanged). The pick type `weapon` is the only gx path that writes `C.profs.weapons`. So:
| Key | Handling |
|---|---|
| feat Advanced Weapon Proficiency (FS) and (G), Cannoneer, Gambler (Dark Matter), Syndicate Spy, Sepulcher Knight: Deputy | the native FEATS field (`weapons` or `tools`) was added in tp05, tp06, tp13 (smallest edit, listed in the report) |
| feat The Coalition: Recruit | needs `C.profs` write for `armor`, `weapons` from a gx entry (only the Athletics option would work) |
| item Travel Alchemical Kit | needs `C.profs.tools` write from a gx item entry |
