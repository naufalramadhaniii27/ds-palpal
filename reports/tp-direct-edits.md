# Direct edits of generated data files (tp*.js and item rows) on claude/fx-int

`tools/tp_build.py` builds `src/data/tp*.js` from JSON sources that are not in the repo. Until they come back, these files are edited by hand. If the generator is restored, apply these changes again in its sources or the next regeneration will remove them. Diff base: merge-base of claude/w-eng and main (7d220d19) against claude/fx-int.

| File | Change | Bin |
|---|---|---|
| tp01-tdcsr.js | Sword charge rows: Faerie Fire, See Invisibility (and Fly at DC 17) use `2` / `3` uses, one use per spell | L1 to L13 (item charges) |
| tp03-tvss.js | feat row: `skills:["Performance"]` removed from the fx of one feat (Cha 13+ feat, skill is a pick now). Warden: `fs:1` and the Sentinel's Stand pick. Classes with weapon mastery: `fs` and `wm` tables added (multiclass reqs unchanged). Class fx for Fast Movement (speed +10 at 3, not in heavy armor) and Tactical Insight note | audit, L12 |
| tp04-tee24.js | Keeper of History: `skills:["History","Performance"]` removed from the fx object (granted by a pick now). Perfect Weapon: `res:["Psychic"]` removed (conditional, now in fx data) | L10/L11 |
| tp05-tghp.js | Bear Witness: always-on `res:["Force"]` and `condImm:["Frightened"]` removed, note says they apply only while Innate Sorcery is active (toggle in fx-L12). Ever Vigilant and Nocturnal Predator: `senses` Darkvision 60 removed (darkvision is added by the fx data, it would double). Feats: `weapons:"Advanced"` for Advanced Weapon Proficiency (FS) and (G), Syndicate Spy `tools`. Class row: `fs:2`, Lair Sense fx | L1, L11, L12 |
| tp06-tsgeh.js | feat `weapons:"Cannons"` (Cannoneer). Class row: `fs:2`, `wm` table | L1 |
| tp08-tghg.js | item base armor changed from Hide to Studded Leather | L8/L9 |
| tp10-tssm.js | Shared Resilience: fx note for proficiency in all saves within 30 ft of the Eidolon | audit |
| tp12-tsgs.js | Bird of a Feather (Uncommon): charge reset text `1d4 hours` instead of `dawn` | L2 |
| tp13-tsdm.js | feats: `tools` for Gambler (Dark Matter), `weapons:"Repeater"`; Cha 13+ feat `skills` removed; class row `wm` table | L1, L12 |
| tp15-thhw.js | Luma item: `base:["Club"]` added | L8 |
| wotc11-magic-items-2014.js | Charge rows of Iggwilv-style items edited from 1 to the real counts (2/3/4 uses per dawn, one per spell/effect, arrows per dusk) | L4, L5, L7 |

How merges were done: a three-way merge of one-line files cannot be done by git. Each conflicting line was merged by token (a script took the base, the fx-int side and the branch side, applied the branch edit on top of ours, and asserted the edit anchored once). The same-spot edits kept the fx-int value.
