# Skipped ledger rows, all bins (L1 to L13)

Collected from `reports/ledger-skipped-L1.md` through `L13.md` on claude/fx-int. Rows are grouped by the engine field they would need, largest group first. Grouping is by keyword on the text of each row, so a row can belong to two groups and sits in the first matching one. Each row keeps its bin so the original file has the detail. Nothing here was hacked around in data.

## Summary

| Rank | Engine field or change | Rows |
|---|---|---|
| 1 | Attack row granted by an item or feature (natural or granted weapon row) | 23 |
| 2 | Spell pick or spell list with a tag, ritual, school, attack or book filter (`bookAdd`, per-feature tables) | 21 |
| 3 | Weapon dice, damage type or property override (`dmgType`, `finesse`, dice replacement) | 15 |
| 4 | Resource pool changes (`luBump`, pool owned by another feature, `cdAdd`, per-level offset, spell slot) | 13 |
| 5 | Armor and AC special cases (base without row, armor training, ability from a feat) | 12 |
| 6 | `toolExpert` / Expertise as an alternative (tool Expertise, double proficiency on a tool) | 10 |
| 7 | Attack-count, mastery and off-hand (`wmAdd`, Two-Weapon Fighting) | 8 |
| 8 | Exhaustion, curse and condition lock | 8 |
| 9 | Speed, reach, size or movement changes (`speedMul` as toggle, size down, reach) | 6 |
| 10 | Item grants and item-count conditions (inventory items from a pick, set bonus of attuned items) | 6 |
| 11 | Check, save and passive special cases (`saveProf`, `passBonus`, reroll, minimum) | 4 |
| 12 | Species swap, form or stat replacement | 3 |
| 13 | Other single cases (no shared engine field) | 23 |
| | Notes with no engine need (informational) | 57 |
| | Total rows read | 209 |

## 1. Attack row granted by an item or feature (natural or granted weapon row) (23)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | class Craftsman Masterwork Weapon | atkBonus filter for a weapon row flagged mw (the inventory flag exists for armor only), +1/+2/+3/+4 by class level |
| L1 | feat Reptiloid Acid Spit, Vampire Transformation Stage 1 (Fanged Bite, Claw), Shadowsteel Ghoul Stage 3 (Cursed Claw) | natural attack row from a gx entry (rows exist only from FEATS[].attacks) |
| L2 | Boomerang Shield, Arcane Propulsion Arm, Battlechef's Splendid Saucepan (Mace +1 and 1d4 Thunder), Warrior's Passkey (longsword form, +1, 1d10 Force) | Saucepan: helmet +1 AC toggle. Passkey: toggle with a Defenses note / `attackRow {n,ab,die,type,range,prof,bonus}` : an attack row for an item whose base is not a weapon, or only in a form |
| L3 | Boomerang Shield, Claws of the Umber Hulk | attack row granted by an item (range, die, type, shield proficiency) |
| L3 | Bounty Hunter Enforcer | weapon damage type override on a weapon row |
| L4 | Flensing Claws (Small, Medium, Large, Huge) | granted attack row (and a damage die; the row text has none, the books/ folder is absent) / not done |
| L4 | Gurt's Greataxe | weapon dice replacement (3d12) / note on the attack row only, die stays 1d12 |
| L4 | Frozen Dagger | weapon damage type override (Cold) / note on the attack row only, type stays Piercing |
| L5 | Silver Eagle Weapon | weapon dice replacement (`dieSet:"2d6"`) and a base weapon choice (the row has no `base`, so there is no attack row) / nothing |
| L5 | Staff of the Adder (Snake Head), Spiked Shield (Shield Bash), Storm Sickle (Wind Blade), Starmetal Shield (Shooting Star) | extra attack row from an item (`attackRow:{n,ab,die,type,range}`) / text; Storm Sickle gets the lightning rider and Sickle proficiency |
| L5 | Snicker-Snack, Spirit Pike, Storm Sickle, Staff of the Sorcerer King, Sword of Resonance | fx `weapons` must also reach the attack-row proficiency test (`weapons` local in `12-logic-export-to-sheet.js` is built before the fx pass, only `C.profSrc` is updated) / the proficiency is listed under Weapons, the attack row still shows no Proficiency Bonus. Snicker-Snack `atkAb` CHA works |
| L5 | Splitter (+1 each part when split), Starmetal Solar Axe fissioned (two attacks) | per-form attack rows / +1 AC when split, Solar Axe rider by form |
| L6 | item\ | egw\ / Infiltrator's Key (Awakened, Exalted) / attack row for a form-changing item / The +1 attack and damage only applies while the key is a dagger. The key has no weapon row, so the wrong static +atk/+dmg was dropped (FXO null) and the dagger form stays text. |
| L6 | item\ | dmg\ / Wand of Orcus / `base:["Mace"]` on the item row / The row has no base weapon, so no attack row exists. The extra 2d12 necrotic shows as a Defenses note instead of on an attack row. |
| L6 | item\ | dmg\ / Thornpiercer, Voltedge / same (no base weapon row) / Extra damage dice appear as a Defenses note. |
| L7 | item\ | pota\ / Claws of the Umber Hulk / baris serangan baru dari item (Claws 1d8 slashing, proficient, STR) / Hanya burrow 20 yang terhitung |
| L8 | Light Drinker (MISMATCH, Cold), Bounty Hunter Enforcer (Bludgeoning), Ether Spear (Force), Frozen Dagger (Cold), Harp of Valor (Thunder arrows) | `atkType:{when,t}`: damage type replacement on a weapon row |
| L8 | Brambleheart Quiver (+2 on the thorned Arrows) | arrows are not attack rows, a note is shown |
| L9 | species Bugbear (2014) Long-Limbed | reach multiplier on melee attack rows |
| L10 | - | Captain/Experiment X Mutations: needs new natural attack rows (Acid Spit, Adamantine Claws). |
| L11 | sub\ | Monk/Way of the Sun Soul\ / Radiant Sun Bolt / a field that adds a new attack row |
| L12 | sub\ | Rogue/Cyber Ninja\ / Cyber Katana / grant of a weapon row with +1/+2/+3 attack and damage by level and Vex outside the mastery limit (no Cyber Katana item exists in the data) |
| L12 | sub\ | Vagabond/Experiment X\ / Mutations / natural attack rows from a choice (Acid Spit dice by character level, Adamantine Claws scimitar stats +1/+2/+3) |

## 2. Spell pick or spell list with a tag, ritual, school, attack or book filter (`bookAdd`, per-feature tables) (21)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | class Investigator Ritualist | grimoire pick with a Ritual flag filter and a count of 4 plus 2 per level (cantrip pick has no ritual filter) |
| L1 | feat Quicksmithing, Ritual Caster (2014) | spell pick filtered by the Ritual tag (and by a chosen class list) |
| L1 | feat Spell Sniper (2014), Fey Pact | cantrip pick filtered by "needs an attack roll" or by two schools (pick takes one school only) |
| L1 | feat Chronomancy Initiate, Gun-Mage Adept | spell pick filtered by a spell tag (Chronomancy, Firearm), count equal to Proficiency Bonus |
| L1 | feat Forest Sage (two spells), Familiar Keeper-like picks of one spell from a list | spell pick without a class list |
| L3 | Cantrip Module | cantrip pick from three class lists, ability pick per install |
| L4 | Libram of Souls and Flesh | item spellbook list (`spListAdd` works for non-item sources only; `spells` would make them always prepared) / not done |
| L5 | Planecaller's Codex, Protective Verses | `bookAdd:[spells]` for items (spells in a spellbook the Wizard may prepare from, not always prepared) / charges only |
| L6 | item\ | dmg\ / Thayan Spell Tattoo / spell pick over a level range (1 to 3) and a fixed DC 13 / +5 for non-casters / Done as three optional single-spell picks (one per level). The non-caster DC 13 / attack +5 is not modeled. |
| L8 | Cantrip Module | cantrip pick from the Cleric, Druid or Wizard list with a chosen ability |
| L8 | Finger Gun Glove | the Finger Guns cantrip has no row in the spell table, so no spell can be shown |
| L10 | - | Bard/College of Calligraphy Manuscript, College of Chronology (both) Chronomancy pick: ritual spells from any list, tag filter. Needed: spell pick by ritual/tag across lists. |
| L11 | sub\ | Monster Hunter/Occultist Guild\ / Occult Knowledge / pick filter for Ritual-tag spells from several lists |
| L11 | sub\ | Investigator/Archivist\ / Thesis / per-thesis spell tables are not in the repo (no books/ folder) |
| L11 | sub\ | Monk/Way of the Kensei (partial) / weapon picks done (2 at 3, one each at 6, 11, 17) but no melee/ranged or Heavy/Special filter, and "counts as Monk weapon" is not computed |
| L12 | sub\ | Vagabond/Gourmand\ / Fine Cuisine / ritual-only spell grant (`spells` would mark Gentle Repose always prepared) |
| L13 | sub\ | Wizard/Bladesinging\ / Training in War and Song (one-handed melee weapon pick) / `pick t:"weapon"` filter for one-handed melee (no Two-Handed, melee only). Today the weapon pick lists every Simple/Martial weapon. |
| L13 | sub\ | Wizard/Chronomancer\ / Chronomancy Savant / `pickSub k:"sav"` filter by spell tag (Chronomancy) instead of school. Empty AUTO names stay and are ignored by autoSpells. |
| L13 | sub\ | Wizard/Sangromancer\ / Sangromancy Savant / Same, tag Sangromancy, plus "counts as Wizard spells". |
| L13 | sub\ | Wizard/Protomancer\ / Proto-Magic / Same, tag Protospell. |
| L13 | sub\ | Wizard/Protomancer\ / Proto-Master / `lu max` equal to the number of prepared Protospell spells. |

## 3. Weapon dice, damage type or property override (`dmgType`, `finesse`, dice replacement) (15)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | feat The Firm: Contractor | weapon damage dice replacement (1d4 Simple weapon deals 2d4) |
| L2 | Ranseur of Torture, Scourge of Shadow (3d4 slashing), True-Ice Shards (Rapier and Dagger), Ruby Rod of Asmodeus (all damage necrotic) | Row note says the dice or type are replaced. Crit 18-20 and the other numbers are counted / `dieReplace {when,d,t}` (weapon dice and damage type replacement, "weapon dice replacement" in the w-eng Skipped list) |
| L2 | Lucent Destroyer | Dancing Lights and a row note / damage type replacement (Radiant instead of Piercing) |
| L4 | Lucent Destroyer | damage type override (Radiant) and no loading / only the Dancing Lights cantrip added |
| L4 | Monstrous Weapon | slashing die by tier; the table is not in the row text / not done |
| L5 | Ranseur of Torture (2d10 piercing) | weapon dice replacement / +3 and a note on the Pike row |
| L5 | Scourge of Shadow (3d4 slashing) | weapon dice replacement / +3 and a note on the Whip row |
| L5 | Sun Blade, Sunsword | weapon profile override (`dmgType:"Radiant"`, `finesse:1`) / +2 and a note on the Longsword row |
| L5 | Sword of Resonance | `finesse` override and an Instrument proficiency name / Longsword proficiency listed only |
| L7 | item\ | skt\ / Gurt's Greataxe / ganti dadu senjata (3d12 slashing, +2d12 vs human) / Baris hanya +1 atk/dmg. Dadu dasar greataxe 1d12 tetap salah |
| L7 | item\ | pota\ / Windvane / tambah properti senjata (finesse) / Bahasa Auran dan 1d6 lightning sudah dikerjakan, finesse belum |
| L9 | item tsgs Silver Eagle Weapon | weapon dice replacement (2d6 instead of normal dice) |
| L9 | item wdh Oversized Longbow | weapon dice replacement (2d6 + STR) |
| L9 | item tvss Monstrous Weapon | tier table for the Slashing die is "in the book", not in the repo. atkAb and a note written |
| L13 | sub\ | Wizard/Dragon Mage\ / Invoke Dragon Tail (Str and Dex save proficiency, Str checks with INT) / Save proficiency field and an ability replacement for saves and checks. Grappled immunity is done, the rest is a Defenses note under the toggle. |

## 4. Resource pool changes (`luBump`, pool owned by another feature, `cdAdd`, per-level offset, spell slot) (13)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | feat Focused Fighting, Focused Hunter | extra point in the Adrenaline Points pool of another class feature (lu cannot add to a pool owned by another entry) |
| L1 | feat Shadowsteel Ghoul Stage 2 Shadowsteel Caster | lu max from the best of Intelligence, Wisdom, Charisma |
| L1 | feat Seraph / Specter / Ooze / Vampire stage feats | a stage feat cannot read the boon pick made in another stage feat slot (when.any exists only on claude/w-fixmiss). Uses that grow by one per later stage are shown at the value of the stage that grants the boon; Ooze Form grows through extra rows |
| L2 | Boon of High Magic | none / `slotAdd {lvl:9,n:1}` (a 9th level slot if you already have one) |
| L2 | Blessed Reliquary (extra Channel Divinity use) | Advantage vs Undead saves, a Note, a Turn Undead use row / `cdAdd:1` (extra use of every Channel Divinity feature) |
| L3 | Boon of High Magic | extra spell slot of a level the character already has |
| L8 | Blessed Reliquary | `luBump:{match:"Channel Divinity",add:1}`: +1 max on an existing class resource |
| L10 | - | Alchemist/Dynamo Engineer Spell Dynamos, Barbarian/Path of Spellfury Spellcasting (slots, prepared), Dancer/Dramaturge Spellcasting (slots, prepared; cantrips done): table is only in the book (no books/ in repo). Needed: subclass known/slot tables. |
| L11 | sub\ | Fighter/Living Crucible\ / Compound Creator and Living Cauldron / lu max with a per-level offset plus a modifier (1+CON, 3+CON at 7, 5+CON at 18). `{f}` cannot step by level |
| L11 | sub\ | Jaeger/Heretic Chapter\ / Heretic Magic and sub\ / Investigator/Occultist\ / Pact Magic / subclass Pact Magic progression (pact slots, slot level, prepared counts) |
| L11 | sub\ | Jaeger/Marauder Chapter\ / Path of Gore, Salvation Chapter\ / Art of Salvation, Sanguine Chapter\ / Vital Consumption / Jaeger Finishers and Adrenaline Arts have no pick model (class text only); DC choice INT or CON |
| L12 | sub\ | Ranger/Big Game Hunter\ / Improved Bolas / lu max that changes formula at a class level (WIS mod, then WIS + DEX mod from level 7), plus a save DC note with doubled PB |
| L13 | sub\ | Wizard/Universalist\ / Arcane Excellence / Extra spell slot at highest level (max 7): a `slotAdd` field. |

## 5. Armor and AC special cases (base without row, armor training, ability from a feat) (12)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | feat Infernal Bulwark | acBase ability taken from the ability the feat raised ("@asi" is only understood by spCls) |
| L1 | feat The Coalition: Recruit | needs `C.profs` write for `armor`, `weapons` from a gx entry (only the Athletics option would work) |
| L2 | Serpent Scale Armor | Dex uncapped through `acBase [14,"full"] acOver`; the no Stealth disadvantage is a Defenses note / `noStealthDis:true` (armor Stealth Disadvantage off) |
| L3 | Bounty Hunter's Vest | armor base row without a DMGI base plus alternate Initiative |
| L3 | Elven Chain | armor training only for the item |
| L4 | Mithral Armor | armor flag override (no Strength requirement, no Stealth disadvantage) / not done |
| L6 | item\ | dmg\ / Wooden Chain of the Unbroken Circle / `acAdd` with an ability cap (for example `acAddMax:2`) / Text: AC bonus equal to the Wisdom modifier, maximum +2. `acAdd:"WIS"` has no cap and would overcount above WIS 14. |
| L8 | Pigskin Armor (MISMATCH, light category) | armor category override. AC is fixed (12 + full Dex via `acBase`+`acOver`), but proficiency still follows Medium |
| L9 | item tsgs Wooden Chain of the Unbroken Circle | `acAdd` with a cap (WIS modifier, max +2). Only Medium armor training written |
| L9 | species Manikin Integrated Gold Plating (Sentinel, Tormentor) | AC ability cap (Strength max +3 / +2). Infiltrator and Sentinel Dex path (acDexMax 2) written |
| L11 | sub\ | Jaeger/Absolute Chapter\ / Unencumbered Movement / cond "Light or no armor and no Shield" (lightNone + noShield) |
| L11 | sub\ | Jaeger/Marauder Chapter\ / Unbreakable (AC part) / acArmAb with a cap (CON max +2). HP part done (hpLvl 1) |

## 6. `toolExpert` / Expertise as an alternative (tool Expertise, double proficiency on a tool) (10)

| Bin | Key | Needed or state |
|---|---|---|
| L4 | Finger Picks | tool Expertise / proficiency done, double bonus is a note |
| L5 | Seafarer's Jacket | Expertise when already proficient with the tool (`toolExpert`) / proficiency listed |
| L8 | Finger Picks (double PB on Thieves' Tools checks) | tool Expertise |
| L9 | species Child of Seth Verbal Culture | Expertise alternative to two skill proficiencies |
| L9 | species Dwarf (Kaladesh) Artisan's Expertise | `toolExpert` (doubled PB on tool checks). Only a Defenses note written |
| L9 | item tsgs Seafarer's Jacket | `toolExpert` for "Expertise if you already had it". Proficiency and a note written |
| L11 | sub\ | Monk/Way of the Cobalt Soul\ / Mystical Erudition (3 rows) / Expertise as alternative to a proficiency |
| L12 | Tool Expertise (Green Reaper Toxic Tradecraft, Runetagger Impressionist) | `toolExpert`. Tool proficiency is added, Expertise is a Defenses note |
| L13 | sub\ | Wizard/Ring Warden\ / Master Metalsmith (double PB on the chosen tool) / Tool Expertise field (skillExpert is skills only). The ring choice is recorded as a pick. |
| L13 | sub\ | Wizard/Alkemancer\ / Skilled Alchemist (doubled PB on Alchemist's Supplies, PB damage with alchemical weapons) / Tool Expertise and a damage rider for alchemical items. Proficiency with the supplies is done (SUB_GRANT). |

## 7. Attack-count, mastery and off-hand (`wmAdd`, Two-Weapon Fighting) (8)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | feat Two-Weapon Fighting | off-hand attack modifier |
| L2 | Ioun Stone, Mastery | none / `pbAdd:1` (Proficiency Bonus +1) |
| L4 | Ioun Stone (mastery), Ioun Stone, Mastery | Proficiency Bonus +1 (`pbAdd`) / not done |
| L5 | Shagambi | `extraAttackAdd:1` (relative) / `extraAttack:2` text, only when the class has no Extra Attack |
| L8 | Blaster Mod +1/+2/+3, Dragonfire Break, Vari-Blaster, Blaster for Dummies (proficiency/mastery) | atkBonus `when:"@pick:<k>"` (a bonus that targets one chosen blaster row), plus a weapon proficiency pick |
| L8 | Shagambi, Obo'laka | extra attack on top of Extra Attack, and `attuneAdd` (+1 on the real limit). Shagambi shows a note, Obo'laka sets the limit to 4 |
| L9 | species Githyanki (2014) Decadent Mastery | exclusive skill-or-tool choice (tool part stays "add by hand") |
| L10 | - | Alchemist/Mutagenist Mutagens, Mutated Blood; Artificer/Mutagenist Body Modifications, Extra Attack, Tools of the Trade; Cleric/Angelic Scribe Angelic Wrath: sub name shared with another class (GX.sub is keyed by sub name only). Needed: class-qualified sub entries (`ofCls`). |

## 8. Exhaustion, curse and condition lock (8)

| Bin | Key | Needed or state |
|---|---|---|
| L2 | Belt of Dwarvenkind (not in the verdict) | Dwarvish added / species condition: Darkvision 60 and Poison resistance only for non dwarves |
| L3 | Broken Vow | exhaustion lock |
| L3 | Dämglesvir (Master) curse beyond Con saves | HP max reduction per hit (play state) |
| L5 | Plaguebane Mask | conditional resistance (poison from contagions) / advantage note only |
| L8 | Sun Shades (blocks Darkvision) | `darkOff:true` (a note is shown instead) |
| L11 | sub\ | Fighter/Cavalier\ / Bonus Proficiency / alternative choice (skill or language): the old skill pick is unconditional in WXS |
| L11 | sub\ | Jaeger/Heretic Chapter\ / Occult Arts / invocation pick with prerequisites tied to Warlock levels |
| L12 | sub\ | Warlock/The Celestial\ / Radiant Soul / the CHA rider is hard-coded for `Celestial Patron` in 09-logic-feats-and-choices.js |

## 9. Speed, reach, size or movement changes (`speedMul` as toggle, size down, reach) (6)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | feat Lilliputian | size set DOWN to Tiny (size field only raises) |
| L2 | Blaster Mod (Extended Barrel) | none / `rangeMul:2` (reach and range multiplier) |
| L3 | Boots of Speed | speedMul (exists only on claude/w-fixmiss) as a toggle |
| L4 | Golem Arms | reach increase / Strength advantage added, reach not |
| L9 | species Dhakaani Guul'dar (Bugbear) Long-Limbed | reach multiplier |
| L11 | sub\ | Necromancer/Blood Ascendant\ / Nosferatu / walking Speed doubled needs speedMul (exists only on claude/w-fixmiss, fx-H-audit). Climb Speed done as mv speed2 |

## 10. Item grants and item-count conditions (inventory items from a pick, set bonus of attuned items) (6)

| Bin | Key | Needed or state |
|---|---|---|
| L3 | Couatl Herald's Fang, Guard, Lash, Mantle, Radiance, Reach, Scales | set bonus: fly 30 when attuned to three such items (item count condition) |
| L3 | Embedded Weapon | weapon pick that becomes an item |
| L3 | Exo-Frame | grant of two Battlefist items (proficiency is added) |
| L4 | Girdle of Traveling Alchemy | item grant list / tracked as 7 dawn resources instead of inventory items |
| L8 | Girdle of Traveling Alchemy | auto-added inventory items (counts are tracked as `lu` rows instead) |
| L8 | Exo-Frame (two Battlefists) | auto-added inventory items (proficiency is granted) |

## 11. Check, save and passive special cases (`saveProf`, `passBonus`, reroll, minimum) (4)

| Bin | Key | Needed or state |
|---|---|---|
| L11 | sub\ | Fighter/Champion (2014)\ / Remarkable Athlete (skills part) / skillBonus for non-proficient STR/DEX/CON skills (half PB rounded up). Initiative is done with class-level steps (exact for single class only) |
| L12 | sub\ | Ranger/Vermin Lord\ / Filth and Fortitude / `saveProf:[ab]` (fixed saving throw proficiency without a pick). Poison immunity stays the old note |
| L12 | sub\ | Rogue/Highway Rider\ / True Grit / `saveProf:["CON"]` (same) |
| L12 | sub\ | Warmage/Coalition Arcanist\ / Tactical Uplink / `passBonus` (passive Perception only) |

## 12. Species swap, form or stat replacement (3)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | feat Fey Transformation Stage 4, Star and Shadow Reader | already written in fx-H-audit.js on claude/w-fixmiss (needs when.any). Not duplicated here |
| L3 | Concentration Module | concentration save ability swap |
| L3 | Draconic Rebirth | species swap |

## 13. Other single cases (no shared engine field) (23)

| Bin | Key | Needed or state |
|---|---|---|
| L1 | feat Advanced Weapon Proficiency (FS) and (G), Cannoneer, Gambler (Dark Matter), Syndicate Spy, Sepulcher Knight: Deputy | the native FEATS field (`weapons` or `tools`) was added in tp05, tp06, tp13 (smallest edit, listed in the report) |
| L1 | item Travel Alchemical Kit | needs `C.profs.tools` write from a gx item entry |
| L2 | Wyrmreaver Gauntlets (per rest resistance choice) | Extra 1d6 Force on unarmed hits / pick that gives a Resistance (`res` from a pick) |
| L3 | Dark Gift of Savnok | Mind Blank effects beyond Psychic and Charmed are text notes only |
| L4 | Galepierce Weapon | range multiplier; the row also has no base weapon / not done |
| L4 | Logic Unit | half Proficiency Bonus on Intelligence checks of skills without proficiency (needs a per-skill proficiency test) / language and cantrip done, bonus not |
| L4 | Fin Symbiote | +2 to Aberrant Horror Boon DCs (needs the feature name used by `dcAdd`) / advantage on Constitution saves done, DC text only |
| L5 | Niko's Mace | spell cast from charges with a fixed attack bonus (+9) / old `atk:9` dropped, text only |
| L5 | Obo'laka | `attuneAdd:1` (relative) / `attune:4`; a Thief 13 host would be 5 |
| L5 | Orb of Skoraeus | bonus for concentration saves only (`concBonus`) / note under Saving Throws |
| L6 | item\ | dmg\ / Travel Alchemical Kit, item\ / dmg\ / Thornpiercer, item\ / dmg\ / Thunderous Flail, item\ / egw\ / Infiltrator's Key (all tiers), Living Gloves (Thieves' Tools option) / sheet side reading of fx `tools` and `weapons` / SOURCE-NOTES lists both fields, but only `langs` is consumed (`C.profs` i |
| L6 | item\ | dmg\ / Grimoire Infinitus (all tiers) / none / `prepAdd` is written (+1, +2, +3 Wizard prepared spells) and shows in the Builder spell count only. The sheet C has no field to golden-test it. |
| L8 | Logic Unit (half PB on Intelligence checks without proficiency) | `chkBonus` that skips proficient skills (like Jack of All Trades) |
| L8 | Arcane Carbine spellDc | checked in `C.spellcasting`, see report |
| L9 | species Aven (Ibis-Headed) Kefnet's Blessing | `chkBonus` variant for checks without Proficiency Bonus (non-proficient only) |
| L9 | - | Cervan "no lgf": lgf exists but only counts under 2014 rules, fx langs still needed (written). |
| L10 | - | Barbarian/Path of the Battlemind Unbreakable Mind: fixed saving throw proficiency from a subclass. Needed: `saves` field. |
| L10 | - | Bard/College of Cyberwave Wave Synth: no item data. Needed: item row. |
| L12 | sub\ | Vagabond/Mage Brand\ / Spellbranding / the Mage Brand Spellcasting table (prepared level 1+ spells) is not in the data |
| L12 | sub\ | Rogue/Soulknife (2014)\ / Psychic Blades / `actAtk` only matches `Soulknife`, not `Soulknife (2014)` (engine code) |
| L13 | sub\ | Wizard/Universalist\ / Universal Savant / `sav` pick without school (any Wizard spell level 2 or lower). |
| L13 | sub\ | Wizard/Daemonologist\ / Stolen Secrets / Eldritch Invocation pick (list from the invocation data, with their effects and Wizard level as prerequisite). |
| L13 | sub\ | Wizard/Materializer\ / Arcane Artisan (bonus cantrip when Mending is known) / `cond:"minending"` in the pickSub handler (only `minill` exists, 10-logic-v17-additions.js). |

## Informational notes (no engine need)

These rows only record a decision or a check. They are kept so the per-bin files can be retired later.

- L2: Abjurer's Gilder: the text says Shield is always prepared "if it is in your spellbook". The sheet cannot read the spellbook, so Shield is always prepared for a Wizard.
- L2: Amulet of the Inferno: Fire Bolt and Produce Flame use the casting ability, or the best of INT, WIS, CHA for a non caster (text: INT).
- L2: Arcane Carbine: only `spDc` added. The spell attack bonus was already in the row (adding it again doubled it, found by probe).
- L2: Amulet of the Inferno: the row already had spell attack and DC +3, so the file adds no `spAtk`/`spDc`.
- L2: Dragonkin Weapon: the extra dice go on every melee row (the item names no base weapon). Axe of the Mother Tree, Ancestral Laser Sword: the level bonus goes on rows named by the weapon kinds in the text, not on one single weapon.
- L2: Blaster Mods: count on the blasters in the list at the top of the file (no host is named by the mod).
- L2: Bird of a Feather (Uncommon): `ch` reset changed in `tp12-tsgs.js` to `"1d4 hours"` (smallest data edit, the FXO table cannot change `ch`).
- L2: Deck of Wonder, Deck of Many More Things: already `fx:null` in `fx-D-item.js`. The ledger read the raw row. Verified by a golden build.
- L2: Adamantine Armor: already a Defenses note in `16-logic-feature-numbers.js`. Verified by a golden build.
- L2: Black Dragon Mask, Blue Dragon Mask (shard 06): left to the bin that owns `item|misc14|*Dragon Mask` (same item name, a second entry would double Darkvision and the Resistance to Immunity upgrade).
- L7: Teeth of Dahlver-Nar: sudah di-FXO null di `fx-D-item.js` (ledger membaca baris mentah). Tidak ada perubahan.
- L7: Gift Devotee: spec menyebut nama spell umum. Spell dan kemampuan dibaca dari teks tiap gift (mis. Nylea's Votary = Speak with Animals, Purphoros's Devotee = Shield of Faith, Thassa's Devotee = Fog Cloud).
- L7: Hazirawn: keadaan tanpa attunement (+1 dan 1d6) tidak dimodelkan, equip item attunement dihitung attuned.
- L7: Keranos's Devotee: 1d6 lightning hanya pool pemakaian (sekali per giliran), bukan atkDice.
- L7: Crawling Gauntlet: teks tidak menyebut kemampuan casting Mage Hand, dipakai Intelligence.
- L8: Guidance (Ulmyr's Eye), Ray of Frost (Borealus), Druidcraft (Petal Dancer Ward), Find Familiar (Omenbringer's Mantle) were already carried through `ITEM_SPELLS`. The reviewers only looked at fx.
- L8: Necronomicon Ex Corvis: the text gives no cap of 22, the old row had one. Followed the text.
- L8: Blessed Reliquary, Corvum and other Feather Robes: the old `by` text was lower case, so only Sorcerers could attune. Patched.
- L8: Bloodscryer Oculus: the old row already adds 60 ft to Darkvision, so no new entry.
- L8: Gift rows (Kubazan and the others) count only while equipped in the inventory.
- L9: Lorwyn Elf: spells already in SP_AUTO. Corvum Talons: row exists. Harengon Hare-Trigger: init already carried.
- L9: Avia-Ra Zealous: text has no use limit, the LU row was removed.
- L9: Kalashtar: Githzerai save note scoped by owner.
- L10: Bard/College of Swords Fighting Style: pick restricted to Dueling and Two-Weapon Fighting, off-hand modifier.
- L10: Captain/Star-Spangled Banner Patriotism: `wmAdd`.
- L10: Captain/Knight Errant skills, Captain/Rōnin Infamy: the record-only pick key is not stored in the data (no pick entry found), so no `when` key to read.
- L10: Cleric/Darkness Domain Shadow Shield: max HP based pool (`hp/4` token).
- L10: Artificer/Maverick Arcane Prototype cantrip pick across 3 lists: approximated with `cantAdd` + `spListAdd` (whole Cleric and Wizard lists become selectable, more permissive than the book).
- L10: Bard/Adventurers: only Fighter, Ranger, Monk talents done.
- L10: Barbarian/Path of the Abomination: already in fx-G (ledger was from an older base). Not changed.
- L10: Glacier Permafrost: text says "no armor" (Shield allowed), used `cond:"noBody"`, not `noArmor`.
- L10: Speed Domain Quickness of the Gods lu: `mod:WIS` already has minimum 1 in `luMax`; no change.
- L10: Moon Domain Empowered Cantrips: minimum 1 not expressible in `atkBonus`; Potent Spellcasting / Empowered Cantrips use `atkBonus when:"spell"` (all spell attack rows).
- L10: Storm Herald, Knowledge Domain, Courtiers', Road, Mountain Domain `when` entries are untested by golden (pick key paths).
- L11: Burden of Revolution Aura of Tenacity and Trapper Guild Ambusher's Advantage, Dead Mist Acolyte Dead Mist Lord, Death Knight Imperator: already in fx-B1 / fx-F on this base. The ledger rows were stale. No change.
- L11: Couatl Calm Mind: spec said `imm`; conditions use `condImm` (`imm` is for damage types).
- L11: Detective Interrogator's Instinct is level 10 in the text.
- L11: Nightwatcher: WXS senses (Darkvision 60) would double with darkAdd; the `senses` item was removed from the tp05-tghp.js row (only edit of an original data row).
- L11: Circle of the Sea Stormborn: the unconditional Resistance (16-logic-feature-numbers.js) and the Fly note (12-logic-export-to-sheet.js) were removed; both now come from the toggle `wrath-of-the-sea` (default off). Saved sheets show no Stormborn Resistance until the toggle is on.
- L11: Steelsinger Defense is `acAdd:1` when armor is worn (no feat is added). Heavy Frame uses cond noShield only (also +2 with no armor). Entropy acBase takes WIS modifier without the minimum +1.
- L11: Prescient Knight, Occultist Guild, Warrior of the Mystic Arts use THIRD_SUBS (their slot and known tables equal the Eldritch Knight table). School limits of Prescient Knight are not enforced. Mystic Arts still has the fx-B2 cantrip pick as well as the third-caster cantrip count, so the cantrip UI ma
- L11: Item grants (Overdrive Module, Starshield Hardsuit, Flashbang, Invisibomb, grafts) are single-option picks: the player must tick them.
- L11: Merge note: fx-H-audit (claude/w-fixmiss) also adds Heavenborne-style fly (Limited Flight) and Pharaoh Magic Resistance; check duplicates when merged.
- L12: Oath of the Sun, Incandescent Strikes is a level 15 feature (spec said 11).
- L12: Oath of the Giving Grave, Undying Sentinel is level 20 (spec said 15).
- L12: Phantom, Tokens of the Departed is level 9 (spec said 3).
- L12: Big Game Hunter, Improved Special Shots: the existing lu array already doubles PB from level 11 (8 uses at PB 4). Nothing to fix.
- L12: Data and Technology skills do exist (XSK, engine v4), so Nanite Magic and Digital Nomad get real skill rows.
- L12: Aristocratic Enchantment bonus spell is written "Hideous Laughter" in the text and is the spell Tasha's Hideous Laughter.
- L12: Waxing and Waning: the new lu row (3 uses) may overlap with the Lunar Embodiment free spell row of level 3. The text is ambiguous, both rows are kept.
- L12: Parasite Patron, Symbiotic Sentinel is also added by `fx-H-audit.js` on branch w-fixmiss. If both merge, drop one entry.
- L12: `tp05-tghp.js`: Apocalypse Sorcery Bear Witness old `fx` lost its always-on `res`/`condImm` (now a toggle in fx-L12). First Vampire Nocturnal Predator old `senses` removed (now `darkNone`/`darkHave`, since the old set-if-greater rule contradicts the text).
- L12: MISMATCH rows (Astral Griffon auto, Frozen One, Genie Lord, Sibyl auto, Jinx Points, Steal Luck) are overridden by changing the global `AUTO` and `LU_X` rows from fx-L12.js. No source file edit.
- L13: War Magic Tactical Wit: Initiative +INT was already counted (engine showed it before this batch). No entry added.
- L13: Familiar Master Servitor's Agility is level 6 in the data, not 10. Pawn Storm and Covert Magic level 7, Deathseeker and Turquoise Efficiency level 6, Doomsayer Power from Darkness level 14.
- L13: Mystic Strategist: 2d6 at 3, 3 at 7, 3d8 at 13, 4 at 19 (array as in House of Kings). Bishop Spellcasting table checked against Valda's Spire of Secrets p.154: identical to the 2024 Eldritch Knight table.
- L13: Sangromancer Sanguine Vigor: hpLvl:1 gives the Wizard level in total (6 at level 6), matches the text.
