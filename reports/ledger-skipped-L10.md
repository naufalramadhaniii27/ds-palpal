# Ledger L10 (shards 25 to 28): rows not fixed

Fixed in `src/data/fx-L10.js` (data only). Two small edits in `src/data/tp04-tee24.js`: removed the unconditional `res:["Psychic"]` from Forge Adept Perfect Weapon (now gated by the ghaal'shaarat toggle) and `skills` from Dirge Singer Keeper of History (now `skillPE`, otherwise Expertise was granted at once). LU_X rows for Twisting Redirection, Parry and Riposte, Misty Waltz set to `short1`; `AUTO["Greenleaf College"]` emptied and replaced by `spListAdd`.

## Skipped (key: needed)
- Alchemist/Mutagenist Mutagens, Mutated Blood; Artificer/Mutagenist Body Modifications, Extra Attack, Tools of the Trade; Cleric/Angelic Scribe Angelic Wrath: sub name shared with another class (GX.sub is keyed by sub name only). Needed: class-qualified sub entries (`ofCls`).
- Alchemist/Dynamo Engineer Spell Dynamos, Barbarian/Path of Spellfury Spellcasting (slots, prepared), Dancer/Dramaturge Spellcasting (slots, prepared; cantrips done): table is only in the book (no books/ in repo). Needed: subclass known/slot tables.
- Barbarian/Path of the Battlemind Unbreakable Mind: fixed saving throw proficiency from a subclass. Needed: `saves` field.
- Bard/College of Swords Fighting Style: pick restricted to Dueling and Two-Weapon Fighting, off-hand modifier.
- Bard/College of Calligraphy Manuscript, College of Chronology (both) Chronomancy pick: ritual spells from any list, tag filter. Needed: spell pick by ritual/tag across lists.
- Bard/College of Cyberwave Wave Synth: no item data. Needed: item row.
- Captain/Experiment X Mutations: needs new natural attack rows (Acid Spit, Adamantine Claws).
- Captain/Star-Spangled Banner Patriotism: `wmAdd`.
- Captain/Knight Errant skills, Captain/Rōnin Infamy: the record-only pick key is not stored in the data (no pick entry found), so no `when` key to read.
- Cleric/Darkness Domain Shadow Shield: max HP based pool (`hp/4` token).
- Artificer/Maverick Arcane Prototype cantrip pick across 3 lists: approximated with `cantAdd` + `spListAdd` (whole Cleric and Wizard lists become selectable, more permissive than the book).
- Bard/Adventurers: only Fighter, Ranger, Monk talents done.
- Barbarian/Path of the Abomination: already in fx-G (ledger was from an older base). Not changed.

## Spec differences
- Glacier Permafrost: text says "no armor" (Shield allowed), used `cond:"noBody"`, not `noArmor`.
- Speed Domain Quickness of the Gods lu: `mod:WIS` already has minimum 1 in `luMax`; no change.
- Moon Domain Empowered Cantrips: minimum 1 not expressible in `atkBonus`; Potent Spellcasting / Empowered Cantrips use `atkBonus when:"spell"` (all spell attack rows).
- Storm Herald, Knowledge Domain, Courtiers', Road, Mountain Domain `when` entries are untested by golden (pick key paths).
