#!/usr/bin/env python3
"""Zero miss, targeted effect tests (reports/zero-miss-1.md).

  python3 tests/zero_miss_fx.py [--root DIR] [--only NAME] [--base DIR]

Each case builds a minimal character through the builder hooks (window.__bldTestB, window.__bldSheetFor), once WITH the feature and once
WITHOUT it (the `drop` choices removed or replaced). Two checks per case:
  1. the values in `expect` (JS expressions over C, the sheet of the build with the feature) equal the expected value;
  2. every flattened path of C that differs between the two builds matches one of the `allow` regexes. Nothing else may change.
  3. with --base DIR (a checkout of origin/main): the same build on the old code may differ only in `base_allow` (or `allow`) paths.
Cases with `tog` (a map of fx toggle ids that are ON, zero miss 2) are compared with the same build with every toggle off.
`window.__zmB` holds the builder state of the case, so an expression may call window.__bldChoiceList(window.__zmB).
Cases without `drop` and `tog` (magic items) are checked by 1 and 3 only. Exit 1 on any failure. One browser page for all cases (about 30 s)."""
import json, os, re, sys, socket, threading, functools, http.server

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if "--root" in sys.argv: ROOT = os.path.abspath(sys.argv[sys.argv.index("--root") + 1])
ONLY = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
BASE = os.path.abspath(sys.argv[sys.argv.index("--base") + 1]) if "--base" in sys.argv else None  # another checkout (origin/main) to diff against

WL = {"STR": 10, "DEX": 12, "CON": 14, "INT": 10, "WIS": 10, "CHA": 18}
BLADE24 = ["Pact of the Blade", "Lifedrinker", "Thirsting Blade", "Eldritch Smite", "Devouring Blade"]
LS = [{"n": "Longsword", "q": 1, "eq": True}]
ATK = r"^attacks\.1\."  # the Longsword row (row 0 is the Unarmed Strike)

CASES = [
    # ---------------- Warlock, Pact of the Blade (2024, PHB p. 155-156)
    dict(name="2024 pact damage type Radiant", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"], "pactDmg": ["Radiant"]}, inv=LS, base=WL),
         drop={"pactDmg": None},
         expect=[("C.attacks[1].type", "Radiant"), ("C.attacks[1].ab", "CHA"), ("/Spellcasting Focus/.test(C.attacks[1].note)", True)],
         allow=[ATK + r"(type|note)$"], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 pact weapon without a type pick keeps the weapon type", b=dict(cls="Warlock", level=3, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": [], "pactWep": None},
         expect=[("C.attacks[1].type", "Slashing"), ("C.attacks[1].sub", "Versatile (1d10) • Pact Weapon")],
         allow=[ATK, r"^features\.", r"^profs\.weapons", r"^profSrc\.weapons", r"^acts", r"^actions\.", r"^xdmg", r"^inv\.0\.html$"], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 Eldritch Smite 6d8 at Warlock 12 (slot level 5)", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": ["Pact of the Blade", "Lifedrinker", "Thirsting Blade", "Devouring Blade"]},
         expect=[("C.xdmg.find(x=>x.n==='Eldritch Smite').dmg", "6d8"), ("C.xdmg.find(x=>x.n==='Eldritch Smite').type", "Force")],
         allow=[r"^xdmg\.", r"^features\."], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 Lifedrinker 1d6 and the Hit Point Die heal 1d8+2", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": ["Pact of the Blade", "Eldritch Smite", "Thirsting Blade", "Devouring Blade"]},
         expect=[("C.xdmg.find(x=>x.n==='Lifedrinker').dmg", "1d6"), ("/regain 1d8\\+2 Hit Points/.test(C.xdmg.find(x=>x.n==='Lifedrinker').note)", True)],
         allow=[r"^xdmg\.", r"^features\."], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 Devouring Blade: Attack action says three attacks, once", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": ["Pact of the Blade", "Lifedrinker", "Eldritch Smite"]},
         expect=[("C.actions[0].d.indexOf('Make three attacks')", 0), ("(C.actions[0].d.match(/Make one attack/g)||[]).length", 0)],
         allow=[r"^actions\.0\.d$", r"^features\."], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    # ---------------- Warlock 2014 (PHB 2014 p. 107-108, XGE p. 56-57)
    dict(name="2014 pact weapon uses Strength, no Charisma without Hex Warrior", b=dict(rs="2014", cls="Warlock", level=12, ch={"p3invocation": ["Pact of the Blade"], "pactWep": ["Longsword"]}, inv=LS, base=dict(WL, STR=16)),
         drop={"p3invocation": []},
         expect=[("C.attacks[1].ab", "STR"), ("/Necrotic/.test(C.attacks[1].note)", False)],
         allow=[ATK, r"^features\.", r"^profs\.weapons", r"^profSrc\.weapons", r"^acts", r"^actions\.", r"^inv\.0\.html$"], base_allow=[ATK + r"(ab|note|misc|miscSrc|dmgBonus)$", r"^inv\.0\.html$", r"^xdmg"]),
    dict(name="2014 Hexblade: Hex Warrior lets the pact weapon use Charisma", b=dict(rs="2014", cls="Warlock", sub="The Hexblade", level=12, ch={"p3invocation": ["Pact of the Blade"], "pactWep": ["Longsword"]}, inv=LS, base=dict(WL, STR=16)),
         expect=[("C.attacks[1].ab", "CHA"), ("/Hex Warrior/.test(C.attacks[1].note)", True)],
         base_allow=[ATK + r"note$"]),
    dict(name="2014 Improved Pact Weapon +1 to hit and damage", b=dict(rs="2014", cls="Warlock", level=12, ch={"p3invocation": ["Pact of the Blade"], "p2invocation": ["Improved Pact Weapon"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"p2invocation": []},
         expect=[("C.attacks[1].misc", 1), ("C.attacks[1].dmgBonus", 1)],
         allow=[ATK + r"(misc|miscSrc|dmgBonus|note)$", r"^features\.", r"^inv\.0\.html$"], base_allow=[ATK + r"(ab|note|misc|miscSrc|dmgBonus)$", r"^inv\.0\.html$", r"^xdmg"]),
    dict(name="2014 Lifedrinker = Charisma modifier Necrotic", b=dict(rs="2014", cls="Warlock", level=12, ch={"p3invocation": ["Pact of the Blade"], "p12invocation": ["Lifedrinker"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"p12invocation": []},
         expect=[("C.xdmg.find(x=>x.n==='Lifedrinker').dmg", "4"), ("C.xdmg.find(x=>x.n==='Lifedrinker').type", "Necrotic")],
         allow=[r"^xdmg", r"^features\."], base_allow=[ATK + r"(ab|note|misc|miscSrc|dmgBonus)$", r"^inv\.0\.html$", r"^xdmg"]),
    # ---------------- negative examples (a similar sentence or build that must NOT be covered)
    dict(name="NEG a second weapon next to the pact weapon keeps its own type and no pact note", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"], "pactDmg": ["Radiant"]}, inv=LS + [{"n": "Dagger", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks.find(a=>a.n==='Dagger').type", "Piercing"), ("/Pact of the Blade/.test(C.attacks.find(a=>a.n==='Dagger').note)", False), ("C.attacks.find(a=>a.n==='Longsword').type", "Radiant")],
         base_allow=[r"^attacks\.\d+\.(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="NEG 2014 Lifedrinker change does not touch a 2024 Lifedrinker", b=dict(cls="Warlock", level=9, ch={"invocation": ["Pact of the Blade", "Lifedrinker"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         expect=[("C.xdmg.find(x=>x.n==='Lifedrinker').dmg", "1d6")],
         base_allow=[ATK + r"note$", r"^xdmg\.\d+\.note$"]),
    dict(name="NEG a plain magic weapon (Longsword, +1) gets no DMG rider note", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Longsword, +1", "q": 1, "eq": True}], base=WL),
         expect=[("/Extra damage/.test(C.attacks[1].note||'')", False)], base_allow=[]),
    dict(name="NEG Dwarven Thrower not attuned (not a Dwarf): no note", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Dwarven Thrower", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks.some(a=>/Force on a ranged hit/.test(a.note||''))", False)], base_allow=[]),
    # ---------------- property: item variants x a feature that names the item (Pact of the Blade first)
    dict(name="VAR pact weapon Longsword, +1: pact row, Radiant, +1 kept", b=dict(cls="Warlock", level=5, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Longsword, +1"], "pactDmg": ["Radiant"]}, inv=[{"n": "Longsword, +1", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks[1].type", "Radiant"), ("C.attacks[1].misc", 1), ("C.attacks[1].dmgBonus", 1), ("/Pact Weapon/.test(C.attacks[1].sub)", True)],
         base_allow=[ATK + r"(note|type)$"]),
    dict(name="VAR pact weapon Longsword, Masterwork: attack bonus only, pact row", b=dict(cls="Warlock", level=5, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Longsword, Masterwork"]}, inv=[{"n": "Longsword, Masterwork", "q": 1, "eq": True}], base=WL),
         expect=[("/Pact Weapon/.test(C.attacks[1].sub)", True), ("C.attacks[1].ab", "CHA")],
         base_allow=[ATK + r"(note|type)$"]),
    dict(name="VAR pact weapon Flame Tongue (Longsword): pact row and the item rider together", b=dict(cls="Warlock", level=5, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Flame Tongue (Longsword)"], "pactDmg": ["Psychic"]}, inv=[{"n": "Flame Tongue (Longsword)", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks[1].type", "Psychic"), ("/\\+2d6 Fire while the weapon is burning/.test(C.attacks[1].note)", True)],
         base_allow=[ATK + r"(note|type|xdice\.)"]),
    dict(name="VAR 2014 Improved Pact Weapon adds nothing to a +1 weapon", b=dict(rs="2014", cls="Warlock", level=5, ch={"p3invocation": ["Pact of the Blade"], "p2invocation": ["Improved Pact Weapon"], "pactWep": ["Longsword, +1"]}, inv=[{"n": "Longsword, +1", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks[1].misc", 1), ("C.attacks[1].dmgBonus", 1)],
         base_allow=[ATK + r"(ab|note)$", r"^inv\.0\.html$"]),
    # ---------------- DMG 2024 weapons: on-hit extra damage notes (src/data/fx-Z1.js)
    dict(name="Holy Avenger: 2d10 Radiant against a Fiend or an Undead", b=dict(cls="Paladin", level=5, ch={}, inv=[{"n": "Holy Avenger", "q": 1, "eq": True}], base=WL),
         expect=[("/Extra damage: \\+2d10 Radiant/.test(C.attacks.find(a=>/Holy Avenger/.test(a.n)).note)", True)],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Flame Tongue variant row (Rapier) gets the 2d6 Fire note", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Flame Tongue (Rapier)", "q": 1, "eq": True}], base=WL),
         expect=[("/\\+2d6 Fire while the weapon is burning/.test(C.attacks.find(a=>/Flame Tongue/.test(a.n)).note)", True)],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Sun Blade: 1d8 Radiant against an Undead, Radiant and Finesse kept", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Sun Blade", "q": 1, "eq": True}], base=WL),
         expect=[("/\\+1d8 Radiant/.test(C.attacks[1].note)", True), ("C.attacks[1].type", "Radiant")],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Dwarven Thrower: both rows (melee and thrown) get the ranged note", b=dict(cls="Fighter", level=5, ch={}, extra={"species": "Dwarf"}, inv=[{"n": "Dwarven Thrower", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks.filter(a=>/Dwarven Thrower/.test(a.n)&&/Force on a ranged hit/.test(a.note)).length>=1", True)],
         base_allow=[r"^attacks\.\d+\.(note|xdice\.)"]),
]

# ---------------- zero miss 2 (reports/zero-miss-2.md): SPEED toggles, RESOURCE rows, Divine Strike, duplicate skill picks
SPD = [r"^features\.0\.items\.1\.d$", r"^speedSrc$", r"^speed$", r"^moves\.", r"^fxToggles\.\d+\.on$", r"^defenses"]  # what turning a speed toggle on may change
SP_BASE = [r"^features\.0\.items\.1\.d$", r"^speedSrc$", r"^speed$", r"^moves\.", r"^fxToggles", r"^defenses"]  # vs origin/main: the toggle does not exist there, so the list of toggles differs too
MV = "JSON.stringify((C.moves||[]).map(x=>x.m+':'+x.v))"
SRCS = {"core": True, "dmg": True}


def spd(name, b, tog, expect, **kw):
    return dict(name=name, b=b, tog=tog, expect=expect, allow=SPD, base_allow=kw.pop("base_allow", SP_BASE), **kw)


NOSP = {"unset": {}}  # species effects are off in the test builder (B.unset.species), turn them on
CASES += [
    # ---------------- SPEED (forms that give a movement mode or more Speed)
    spd("Z2 Wild Heart 14, Power of the Wilds (Falcon): Fly Speed equal to Speed while raging, no armor", dict(cls="Barbarian", level=14, sub="Path of the Wild Heart", base=WL), {"wild-falcon": True},
        [(MV, '["fly:40"]')], base_allow=SP_BASE + [r"^res\."]),
    spd("NEG Z2 Falcon flight needs no armor: Plate Armor worn, no Fly Speed", dict(cls="Barbarian", level=14, sub="Path of the Wild Heart", base=WL, inv=[{"n": "Plate Armor", "q": 1, "eq": True}]), {"wild-falcon": True},
        [(MV, "[]")], base_allow=SP_BASE + [r"^res\."]),
    spd("Z2 Draconic Sorcery 14, Dragon Wings: Fly Speed 60 ft", dict(cls="Sorcerer", level=14, sub="Draconic Sorcery", base=WL), {"dragon-wings": True}, [(MV, '["fly:60"]')]),
    spd("NEG Z5 Aberrant Sorcery 6 has no Revelation in Flesh yet (level 14)", dict(cls="Sorcerer", level=6, sub="Aberrant Sorcery", base=WL), {"flesh-aquatic": True, "flesh-flight": True}, [(MV, "[]")]),
    spd("Z2 Aberrant Sorcery 14, Revelation in Flesh aquatic: Swim Speed twice your Speed", dict(cls="Sorcerer", level=14, sub="Aberrant Sorcery", base=WL), {"flesh-aquatic": True}, [(MV, '["swim:60"]')]),
    spd("Z2 Aberrant Sorcery 14, Revelation in Flesh flight: Fly Speed equals Speed", dict(cls="Sorcerer", level=14, sub="Aberrant Sorcery", base=WL), {"flesh-flight": True}, [(MV, '["fly:30"]')]),
    spd("Z2 Oath of Vengeance 20 (2024), Avenging Angel: Fly Speed 60 ft", dict(cls="Paladin", level=20, sub="Oath of Vengeance", base=WL), {"avenging-angel": True}, [(MV, '["fly:60"]')]),
    spd("Z2 Oath of Vengeance 20 (2014), Avenging Angel: Fly Speed 60 ft", dict(rs="2014", cls="Paladin", level=20, sub="Oath of Vengeance (2014)", base=WL), {"avenging-angel": True}, [(MV, '["fly:60"]')]),
    spd("Z2 Psi Warrior 7, Telekinetic Adept: Fly Speed twice your Speed", dict(cls="Fighter", level=7, sub="Psi Warrior", base=WL), {"psi-leap": True}, [(MV, '["fly:60"]')]),
    spd("NEG Z2 Psi Warrior 6 has no Psi-Powered Leap yet (Telekinetic Adept is level 7)", dict(cls="Fighter", level=6, sub="Psi Warrior", base=WL), {"psi-leap": True}, [(MV, "[]")]),
    spd("Z2 Gloom Stalker 3, Dread Ambusher: Speed 10 ft higher on the first turn", dict(cls="Ranger", level=3, sub="Gloom Stalker", base=WL), {"dread-ambusher": True},
        [("C.speed", 40), ("/\\+10 Dread Ambusher/.test(C.speedSrc)", True)]),
    spd("Z2 Warrior of the Elements 17, Elemental Epitome: Step of the Wind adds 20 ft", dict(cls="Monk", level=17, sub="Warrior of the Elements", base=WL), {"epitome-step": True},
        [("/\\+20 Elemental Epitome/.test(C.speedSrc)", True)]),
    spd("Z2 Circle of the Stars 10, Dragon constellation: Fly Speed 20 ft", dict(cls="Druid", level=10, sub="Circle of the Stars", base=WL), {"stars-dragon": True}, [(MV, '["fly:20"]')]),
    spd("Z2 Charger feat: Dash adds 10 ft Speed", dict(cls="Fighter", level=4, ch={"feat4": {"feat": "Charger", "a1": "STR"}}, base=WL), {"charger-dash": True},
        [("C.speed", 40), ("/\\+10 Charger/.test(C.speedSrc)", True)]),
    spd("Z2 Dragonborn 5, Draconic Flight: Fly Speed equals Speed", dict(cls="Fighter", level=5, extra=dict({"species": "Dragonborn"}, **NOSP), base=WL), {"draconic-flight": True},
        [(MV, '["fly:30"]'), ("C.res.filter(r=>r.n==='Draconic Flight').length>=1", True)]),
    spd("Z2 Goliath 5, Large Form: Speed +10 ft", dict(cls="Fighter", level=5, extra=dict({"species": "Goliath"}, **NOSP), base=WL), {"large-form": True},
        [("C.speed", 45), ("/\\+10 Large Form/.test(C.speedSrc)", True)]),
    spd("NEG Z2 Goliath 4 has no Large Form yet", dict(cls="Fighter", level=4, extra=dict({"species": "Goliath"}, **NOSP), base=WL), {"large-form": True},
        [("C.speed", 35), ("(C.fxToggles||[]).some(t=>t.id==='large-form')", False)]),
    spd("Z2 Divine Soul 14 (2014), Otherworldly Wings: Fly Speed 30 ft", dict(rs="2014", cls="Sorcerer", level=14, sub="Divine Soul", base=WL), {"otherworldly-wings": True}, [(MV, '["fly:30"]')]),
    spd("Z2 Draconic Bloodline 14 (2014), Dragon Wings: Fly Speed equals Speed", dict(rs="2014", cls="Sorcerer", level=14, sub="Draconic Bloodline", base=WL), {"dragon-wings": True}, [(MV, '["fly:30"]')]),
    # ---------------- RESOURCE
    dict(name="Z2 Relentless Rage: the DC rises by 5 for each use (one pip per use)", b=dict(cls="Barbarian", level=11, base=WL),
         expect=[("C.res.filter(r=>r.n==='Relentless Rage').map(r=>r.max)", [4]), ("/\\+5 for each use/.test(C.res.find(r=>r.n==='Relentless Rage').tag)", True)],
         base_allow=[r"^res\.\d+\.", r"^res\.\d+$"]),
    dict(name="Z2 Relentless Rage: the DC goes back to 10 after a Short or Long Rest", b=dict(cls="Barbarian", level=11, base=WL),
         expect=[("C.res.find(r=>r.n==='Relentless Rage').reset", "short"), ("/DC 10/.test(C.res.find(r=>r.n==='Relentless Rage').tag)", True)],
         base_allow=[r"^res\.\d+\.", r"^res\.\d+$"]),
    dict(name="NEG Z2 no Relentless Rage row before Barbarian 11", b=dict(cls="Barbarian", level=10, base=WL), expect=[("C.res.some(r=>r.n==='Relentless Rage')", False)], base_allow=[]),
]

DS_ROWS = [("Life Domain (2014)", "2014", "Radiant"), ("Nature Domain", None, "Cold, Fire, or Lightning \\(your choice\\)"), ("Tempest Domain", None, "Thunder"),
           ("Trickery Domain (2014)", "2014", "Poison"), ("War Domain (2014)", "2014", "of the weapon's type"), ("Death Domain", None, "Necrotic"), ("Order Domain", None, "Psychic"),
           ("Twilight Domain", None, "Radiant"), ("Forge Domain", None, "Fire")]
for sub, rs, typ in DS_ROWS:
    bb = dict(rs="2014", cls="Cleric", level=8, sub=sub, inv=LS, base=WL, src=dict(SRCS, tce=True, xge=True, dmg14=True))
    if rs: bb["rs"] = rs
    CASES.append(dict(name="Z2 %s Divine Strike: +1d8 once per turn on a weapon hit" % sub, b=bb,
                      expect=[("C.divineStrike.rule.dice", "1d8"), ("C.divineStrike.source.owner", sub), ("(C.attacks.find(a=>a.n==='Longsword').xdice||[]).length", 0)],
                      base_allow=[ATK + r"(note|xdice\.)"]))
CASES.append(dict(name="Z2 Life Domain 14 (2014) Divine Strike: a second 1d8 (2d8 in all)", b=dict(rs="2014", cls="Cleric", level=14, sub="Life Domain (2014)", inv=LS, base=WL),
                  expect=[("C.divineStrike.rule.dice", "2d8"), ("(C.attacks.find(a=>a.n==='Longsword').xdice||[]).length", 0)], base_allow=[ATK + r"(note|xdice\.)"]))
CASES.append(dict(name="Z2 Blood Domain 14 Divine Strike: the second 1d8 was missing", b=dict(rs="2014", cls="Cleric", level=14, sub="Blood Domain", inv=LS, base=WL, src=dict(SRCS, tdcsr=True)),
                  expect=[("C.divineStrike.rule.dice", "2d8"), ("(C.attacks.find(a=>a.n==='Longsword').xdice||[]).length", 0)], base_allow=[ATK + r"(note|xdice\.)"]))
CASES.append(dict(name="NEG Z2 Divine Strike is not there before level 8", b=dict(cls="Cleric", level=7, sub="Tempest Domain", inv=LS, base=WL),
                  expect=[("(C.attacks.find(a=>a.n==='Longsword').xdice||[]).length", 0)], base_allow=[]))

# a skill the book gives once was granted twice: a builder pick and a second fx pick (fx-N1.js) for the same sentence. One skill pick must remain.
SKP = "window.__bldChoiceList(window.__zmB).filter(c=>/^(p3skil|gx-skill-|sq-|skill-|ic-)/.test(c.key)).length"
GXSK = "window.__bldChoiceList(window.__zmB).filter(c=>/^gx-sk-/.test(c.key)).length"
SRC_ALL = dict(SRCS, tce=True, xge=True, tkdm=True, tghp=True, tsgs=True, tvss=True, egw=True, efa=True, tee24=True, tdcsr=True)
for sub, cls, lvl, ch2 in [("Nature Domain", "Cleric", 3, "p3skilnaturedo"), ("Order Domain", "Cleric", 3, "p3skilorderdom"), ("Peace Domain", "Cleric", 3, "p3skilpeacedom"), ("Cavalier", "Fighter", 3, "p3skilcavalier"),
                           ("Samurai", "Fighter", 3, "p3skilsamurai"), ("Apocalypse Domain", "Cleric", 3, "gx-skill-sub-Apocalypse Domain"), ("Darkness Domain", "Cleric", 3, "gx-skill-sub-Darkness Domain"),
                           ("Mountain Domain", "Cleric", 3, "gx-skill-sub-Mountain Domain"), ("Travel Domain", "Cleric", 3, "gx-skill-sub-Travel Domain")]:
    CASES.append(dict(name="Z2 %s: one skill pick, not two" % sub, b=dict(cls=cls, level=lvl, sub=sub, base=WL, src=SRC_ALL),
                      expect=[(SKP, 1), (GXSK, 0)], base_allow=[]))
for feat, key in [("Squat Nimbleness", "sq-feat4"), ("Inspirational Caster", "ic-feat4")]:
    CASES.append(dict(name="Z2 %s feat: one skill pick, not two" % feat, b=dict(cls="Fighter", level=4, base=WL, src=SRC_ALL, ch={"feat4": {"feat": feat, "a1": "STR"}}),
                      expect=[(SKP, 1), (GXSK, 0)], base_allow=[]))
CASES.append(dict(name="Z2 an old save with both Samurai picks keeps one skill from Samurai", b=dict(cls="Fighter", level=3, sub="Samurai", base=WL, src=SRC_ALL, ch={"p3skilsamurai": ["History"], "gx-sk-sub-Samurai": ["Insight"]}),
                  expect=[("C.skills.filter(s=>s.p&&/Samurai/.test(s.src||'')).map(s=>s.n).join()", "History")], base_allow=[r"^skills\.\d+\."]))


# ---------------- zero miss 3 (reports/zm3.md): ADV, RES and SPELL sentences filled in src/data/fx-Z3.js. Toggle cases compare the build with the toggle on against the same build with every toggle off.
DEFA = [r"^fxToggles\.\d+\.on$", r"^defenses", r"^saveNotes", r"^spellcasting", r"^features\.\d+\.items\.\d+\.d$"]  # what a toggle may change
DEFB = [r"^fxToggles", r"^defenses", r"^saveNotes", r"^spellcasting", r"^features\.", r"^res\.", r"^attacks\.", r"^spells\."]  # vs origin/main
WLC = dict(WL)


def DL(src):  # the defenses lines of one source
    return "C.defenses.filter(d=>d.s.indexOf(%r)===0)" % src


def RS(src):  # the resistances of one source, as a list
    return "%s.filter(d=>d.t==='Resistance').map(d=>d.v).join()" % DL(src)


def NT(src, rx):  # a Note of one source matches
    return "%s.some(d=>d.t==='Note'&&/%s/.test(d.v))" % (DL(src), rx)


def z3(name, b, expect, tog=None, **kw):
    c = dict(name=name, b=b, expect=expect, base_allow=DEFB, **kw)
    if tog:
        c["tog"] = tog; c.setdefault("allow", DEFA)
    return c


EXC = lambda xs: ",".join(t for t in ["Acid", "Bludgeoning", "Cold", "Fire", "Force", "Lightning", "Necrotic", "Piercing", "Poison", "Psychic", "Radiant", "Slashing", "Thunder"] if t not in xs)
CASES += [
    z3("Z3 Bard 7 (2024) Countercharm: a reroll of a failed Charmed or Frightened save with Advantage", dict(cls="Bard", level=7, base=WL), [(NT("Countercharm", "reroll"), True), (NT("Countercharm", "Advantage"), True)]),
    z3("NEG Z3 no Countercharm line at Bard 6", dict(cls="Bard", level=6, base=WL), [(DL("Countercharm") + ".length", 0)]),
    z3("NEG Z3 the 2014 Bard has no 2024 Countercharm line", dict(rs="2014", cls="Bard", level=7, base=WL), [(DL("Countercharm") + ".length", 0)]),
    z3("Z3 Rogue 18 Elusive: attack rolls against you can't have Advantage", dict(cls="Rogue", level=18, base=WL), [(NT("Elusive", "can't have Advantage"), True)]),
    z3("NEG Z3 no Elusive line at Rogue 17", dict(cls="Rogue", level=17, base=WL), [(DL("Elusive") + ".length", 0)]),
    z3("Z3 Innate Sorcery: the spell save DC of Sorcerer spells goes up by 1", dict(cls="Sorcerer", level=5, base=WL), [("C.spellcasting.dc", 16)], tog={"innate-sorcery": True}),
    z3("Z3 Innate Sorcery: Advantage on attack rolls for Sorcerer spells", dict(cls="Sorcerer", level=5, base=WL), [(NT("Innate Sorcery", "Advantage on attack rolls for Sorcerer spells"), True)], tog={"innate-sorcery": True}),
    z3("NEG Z3 the 2014 Sorcerer has no Innate Sorcery toggle", dict(rs="2014", cls="Sorcerer", level=5, base=WL), [("(C.fxToggles||[]).some(t=>t.id==='innate-sorcery')", False)]),
    z3("Z3 Monk 18 Superior Defense: Resistance to every damage type except Force", dict(cls="Monk", level=18, base=WL), [(RS("Superior Defense"), EXC(["Force"]))], tog={"superior-defense": True}),
    z3("NEG Z3 no Superior Defense toggle at Monk 17", dict(cls="Monk", level=17, base=WL), [("(C.fxToggles||[]).some(t=>t.id==='superior-defense')", False)]),
    z3("Z3 Warlock 20 Eldritch Master: Magical Cunning restores every Pact Magic slot", dict(cls="Warlock", level=20, base=WL), [(NT("Eldritch Master", "restores every expended Pact Magic slot"), True)]),
    z3("Z3 Wild Heart 3, Rage of the Wilds Bear: Resistance to all but Force, Necrotic, Psychic, Radiant", dict(cls="Barbarian", level=3, sub="Path of the Wild Heart", base=WL), [(RS("Rage of the Wilds (Bear)"), EXC(["Force", "Necrotic", "Psychic", "Radiant"]))], tog={"wild-bear": True}),
    z3("Z3 Wild Heart 3, Rage of the Wilds Wolf: allies attack with Advantage near you", dict(cls="Barbarian", level=3, sub="Path of the Wild Heart", base=WL), [(NT("Rage of the Wilds (Wolf)", "allies make attack rolls with Advantage"), True)], tog={"wild-wolf": True}),
    z3("Z3 Trickery 3, Blessing of the Trickster: Advantage on Dexterity (Stealth) checks", dict(cls="Cleric", level=3, sub="Trickery Domain", base=WL), [(NT("Blessing of the Trickster", "Advantage on Dexterity \\(Stealth\\) checks"), True)], tog={"trickster-blessing": True}),
    z3("Z3 Trickery 3, Invoke Duplicity Distract: Advantage on attack rolls against the creature", dict(cls="Cleric", level=3, sub="Trickery Domain", base=WL), [(NT("Invoke Duplicity", "Advantage on attack rolls against a creature"), True)], tog={"invoke-duplicity": True}),
    z3("Z3 Moon 10, Moonlight Step: your next attack roll has Advantage", dict(cls="Druid", level=10, sub="Circle of the Moon", base=WL), [(NT("Moonlight Step", "next attack roll"), True)], tog={"moonlight-step": True}),
    z3("Z3 Stars 14, Full of Stars: Resistance to Slashing, Piercing, Bludgeoning", dict(cls="Druid", level=14, sub="Circle of the Stars", base=WL), [(RS("Full of Stars"), "Bludgeoning,Piercing,Slashing")], tog={"starry-form": True}),
    z3("Z3 Shadow 6, Shadow Step: the next melee attack has Advantage", dict(cls="Monk", level=6, sub="Warrior of Shadow", base=WL), [(NT("Shadow Step", "next melee attack"), True)], tog={"shadow-step": True}),
    z3("Z3 Elements 17, Elemental Epitome: the picked type (Fire) is resisted", dict(cls="Monk", level=17, sub="Warrior of the Elements", base=WL, ch={"gx-epitome-sub-Warrior of the Elements": ["Fire"]}), [(RS("Elemental Epitome"), "Fire")], tog={"elem-attune": True}, allow=DEFA + [r"^moves\.", r"^speedSrc$"]),
    z3("Z3 Elements 17, Elemental Epitome: switching the pick (Thunder) changes the resisted type", dict(cls="Monk", level=17, sub="Warrior of the Elements", base=WL, ch={"gx-epitome-sub-Warrior of the Elements": ["Thunder"]}), [(RS("Elemental Epitome"), "Thunder")], tog={"elem-attune": True}, allow=DEFA + [r"^moves\.", r"^speedSrc$"]),
    z3("Z3 Glory 3, Peerless Athlete: Advantage on Acrobatics and Athletics checks", dict(cls="Paladin", level=3, sub="Oath of Glory", base=WL), [(NT("Peerless Athlete", "Advantage on Dexterity \\(Acrobatics\\) and Strength \\(Athletics\\)"), True)], tog={"peerless-athlete": True}),
    z3("Z3 Vengeance 3, Vow of Enmity: Advantage on attack rolls against the creature", dict(cls="Paladin", level=3, sub="Oath of Vengeance", base=WL), [(NT("Vow of Enmity", "Advantage on attack rolls against the creature"), True)], tog={"vow-of-enmity": True}),
    z3("Z3 Ancients 20, Elder Champion Diminish Defiance: enemies save with Disadvantage against your spells", dict(cls="Paladin", level=20, sub="Oath of the Ancients", base=WL), [(NT("Elder Champion", "Disadvantage on saves against your spells"), True)], tog={"elder-champion": True}),
    z3("Z3 Ancients 20, Elder Champion Regeneration: 10 Hit Points at the start of each turn", dict(cls="Paladin", level=20, sub="Oath of the Ancients", base=WL), [(NT("Elder Champion", "regain 10 Hit Points"), True)], tog={"elder-champion": True}),
    z3("Z3 Ancients 20, Elder Champion Swift Spells: action spells as a Bonus Action", dict(cls="Paladin", level=20, sub="Oath of the Ancients", base=WL), [(NT("Elder Champion", "cast with a Bonus Action"), True)], tog={"elder-champion": True}),
    z3("Z3 Ancients 20, Elder Champion: a level 5 slot restores the use (tag of the row)", dict(cls="Paladin", level=20, sub="Oath of the Ancients", base=WL), [("C.res.find(r=>r.n==='Elder Champion').tag", "Bonus Action, or a level 5 slot")]),
    z3("Z3 Vengeance 20, Avenging Angel: a level 5 slot restores the use (tag of the row)", dict(cls="Paladin", level=20, sub="Oath of Vengeance", base=WL), [("C.res.find(r=>r.n==='Avenging Angel').tag", "Bonus Action, or a level 5 slot")]),
    z3("Z3 Devotion 20, Holy Nimbus: a level 5 slot restores the use (tag of the row)", dict(cls="Paladin", level=20, sub="Oath of Devotion", base=WL), [("C.res.find(r=>r.n==='Holy Nimbus').tag", "Bonus Action, or a level 5 slot")]),
    z3("Z3 Glory 20, Living Legend: a level 5 slot restores the use (tag of the row)", dict(cls="Paladin", level=20, sub="Oath of Glory", base=WL), [("C.res.find(r=>r.n==='Living Legend').tag", "Bonus Action, or a level 5 slot")]),
    z3("Z3 Fiend 14, Hurl Through Hell: a Pact Magic slot restores the use (tag of the row)", dict(cls="Warlock", level=14, sub="Fiend Patron", base=WL), [("C.res.find(r=>r.n==='Hurl Through Hell').tag", "On hit, or a Pact slot")]),
    z3("Z3 Archfey 10, Beguiling Defenses: a Pact Magic slot restores the use (tag of the row)", dict(cls="Warlock", level=10, sub="Archfey Patron", base=WL), [("C.res.find(r=>r.n==='Beguiling Defenses').tag", "Reaction, or a Pact slot")]),
    z3("Z3 Hunter 15, Superior Hunter's Defense: Reaction Resistance to the damage just taken", dict(cls="Ranger", level=15, sub="Hunter", base=WL), [(NT("Superior Hunter's Defense", "Resistance to that damage"), True)]),
    z3("NEG Z3 no Superior Hunter's Defense line at Ranger 14", dict(cls="Ranger", level=14, sub="Hunter", base=WL), [(DL("Superior Hunter's Defense") + ".length", 0)]),
    z3("Z3 Clockwork 14, Trance of Order: attack rolls against you can't benefit from Advantage", dict(cls="Sorcerer", level=14, sub="Clockwork Sorcery", base=WL), [(NT("Trance of Order", "can't benefit from Advantage"), True)], tog={"trance-of-order": True}),
    z3("Z3 Clockwork 14, Trance of Order: a d20 result of 9 or lower counts as 10", dict(cls="Sorcerer", level=14, sub="Clockwork Sorcery", base=WL), [(NT("Trance of Order", "9 or lower as a 10"), True)], tog={"trance-of-order": True}),
    z3("Z3 Wild Magic 3, Tides of Chaos: Advantage on a single D20 Test", dict(cls="Sorcerer", level=3, sub="Wild Magic Sorcery", base=WL), [(NT("Tides of Chaos", "Advantage on a single D20 Test"), True)], tog={"tides-of-chaos": True}),
    z3("Z3 Great Old One 6, Clairvoyant Combatant: Advantage on your attacks against the bonded creature", dict(cls="Warlock", level=6, sub="Great Old One Patron", base=WL), [(NT("Clairvoyant Combatant", "Advantage on attack rolls against the bonded creature"), True)], tog={"clairvoyant-combatant": True}),
    z3("Z3 Great Old One 6, Clairvoyant Combatant: the bonded creature attacks you with Disadvantage", dict(cls="Warlock", level=6, sub="Great Old One Patron", base=WL), [(NT("Clairvoyant Combatant", "Disadvantage on attack rolls against you"), True)], tog={"clairvoyant-combatant": True}),
    z3("Z3 Great Old One 6, Clairvoyant Combatant: a Pact Magic slot restores the use early", dict(cls="Warlock", level=6, sub="Great Old One Patron", base=WL), [(NT("Clairvoyant Combatant", "expending a Pact Magic slot"), True)], tog={"clairvoyant-combatant": True}),
    z3("Z3 Crusher feat Enhanced Critical: Advantage against a creature after a Bludgeoning critical", dict(cls="Fighter", level=4, base=WL, ch={"feat4": {"feat": "Crusher", "a1": "STR"}}), [(NT("Crusher", "Advantage until the start of your next turn"), True)]),
    z3("Z3 Boon of Spell Recall Free Casting: roll 1d4 when you use a slot of level 1 to 4", dict(cls="Fighter", level=19, base=WL, ch={"feat19": {"feat": "Boon of Spell Recall", "a1": "INT"}}), [(NT("Boon of Spell Recall", "roll 1d4"), True)]),
    z3("Z3 Boon of the Night Spirit Shadowy Form: Resistance to all but Psychic and Radiant", dict(cls="Fighter", level=19, base=WL, ch={"feat19": {"feat": "Boon of the Night Spirit", "a1": "STR"}}), [(RS("Boon of the Night Spirit"), EXC(["Psychic", "Radiant"]))], tog={"shadowy-form": True}),
    z3("Z3 Rogue 3 Steady Aim: Advantage on your next attack roll this turn", dict(cls="Rogue", level=3, base=WL), [(NT("Steady Aim", "Advantage on your next attack roll"), True)], tog={"steady-aim": True}),
    z3("Z3 Rogue 3 Steady Aim: your Speed drops to 0 for the rest of the turn", dict(cls="Rogue", level=3, base=WL), [(NT("Steady Aim", "Speed is 0"), True)], tog={"steady-aim": True}),
    z3("NEG Z3 the 2014 Rogue has no Steady Aim toggle", dict(rs="2014", cls="Rogue", level=3, base=WL), [("(C.fxToggles||[]).some(t=>t.id==='steady-aim')", False)]),
    z3("Z3 Zealot 10, Zealous Presence: ten creatures have Advantage on attack rolls and saves", dict(cls="Barbarian", level=10, sub="Path of the Zealot", base=WL), [(NT("Zealous Presence", "Advantage on attack rolls and saving throws"), True)], tog={"zealous-presence": True}),
    z3("Z3 Champion 18, Survivor Defy Death: Advantage on Death Saving Throws", dict(cls="Fighter", level=18, sub="Champion", base=WL), [("C.saveNotes.some(n=>/Advantage on Death Saving Throws/.test(n.t))", True)]),
    z3("Z3 Champion 18, Survivor Defy Death: a Death Saving Throw of 18 to 20 counts as a 20", dict(cls="Fighter", level=18, sub="Champion", base=WL), [(NT("Survivor", "18 to 20 counts as a 20"), True)]),
    z3("Z3 Glory 20, Living Legend Charismatic: Advantage on Charisma checks", dict(cls="Paladin", level=20, sub="Oath of Glory", base=WL), [(NT("Living Legend", "Advantage on Charisma checks"), True)], tog={"living-legend": True}),
    z3("Z3 Glory 20, Living Legend Saving Throw Reroll: reroll a failed save", dict(cls="Paladin", level=20, sub="Oath of Glory", base=WL), [(NT("Living Legend", "reroll it and keep the new result"), True)], tog={"living-legend": True}),
    z3("Z3 Glory 20, Living Legend Unerring Strike: turn a missed weapon attack into a hit", dict(cls="Paladin", level=20, sub="Oath of Glory", base=WL), [(NT("Living Legend", "turned into a hit"), True)], tog={"living-legend": True}),
    z3("Z3 Vengeance 20, Avenging Angel Frightful Aura: attack rolls against the Frightened enemy have Advantage", dict(cls="Paladin", level=20, sub="Oath of Vengeance", base=WL), [(NT("Avenging Angel (Frightful Aura)", "attack rolls against it have Advantage"), True)], tog={"avenging-angel": True}, allow=DEFA + [r"^moves\.", r"^speedSrc$", r"^speed$"]),
    # kept behind a pick: the measure builds the default option, so these two sentences are checked here
    z3("Z3 Improved Blessed Strikes, Potent Spellcasting option: Temporary Hit Points equal to twice your Wisdom modifier", dict(cls="Cleric", level=14, base=WL, ch={"p7opt": "Potent Spellcasting"}), [(NT("Improved Blessed Strikes", "twice your Wisdom modifier"), True)]),
]


# ---------------- zero miss 4 (reports/zm4.md): DICE, AC, SPEED and D20 sentences filled in src/data/fx-Z4.js and in the row tags of LU_X. Same helpers as zero miss 3.
def RT(name):  # the tag of a resource row
    return "C.res.find(r=>r.n===%r).tag" % name


CASES += [
    z3("Z4 Paladin 2 (2024) Paladin's Smite: Divine Smite deals 2d8 Radiant, +1d8 against Fiend or Undead, +1d8 per slot level above 1", dict(cls="Paladin", level=2, base=WL), [(NT("Paladin's Smite", "2d8 Radiant damage, plus 1d8 against a Fiend or an Undead, plus 1d8 for each spell slot level above 1"), True)]),
    z3("NEG Z4 no Paladin's Smite line at Paladin 1", dict(cls="Paladin", level=1, base=WL), [(DL("Paladin's Smite") + ".length", 0)]),
    z3("NEG Z4 the 2014 Paladin has no Paladin's Smite line", dict(rs="2014", cls="Paladin", level=2, base=WL), [(DL("Paladin's Smite") + ".length", 0)]),
    z3("Z4 Ranger 20 (2024) Foe Slayer: Hunter's Mark uses a d10", dict(cls="Ranger", level=20, base=WL), [(NT("Foe Slayer", "d10 for its damage die instead of a d6"), True)]),
    z3("NEG Z4 no Foe Slayer line at Ranger 19", dict(cls="Ranger", level=19, base=WL), [(DL("Foe Slayer") + ".length", 0)]),
    z3("NEG Z4 the 2014 Ranger has no 2024 Foe Slayer line", dict(rs="2014", cls="Ranger", level=20, base=WL), [(DL("Foe Slayer") + ".length", 0)]),
    z3("Z4 Ranger 10 (2024) Tireless: 1d8 plus Wisdom modifier Temporary Hit Points", dict(cls="Ranger", level=10, base=WL), [(NT("Tireless", "1d8 and add your Wisdom modifier"), True)]),
    z3("Z4 Ranger 10 (2024) Tireless: a Short Rest lowers Exhaustion by 1", dict(cls="Ranger", level=10, base=WL), [(NT("Tireless", "Short Rest you finish lowers your Exhaustion level by 1"), True)]),
    z3("Z4 Ranger 10 (2024) Tireless: the row tag names the dice", dict(cls="Ranger", level=10, base=WL), [(RT("Tireless: Temporary Hit Points"), "Magic action, 1d8 + WIS Temp HP")]),
    z3("NEG Z4 no Tireless line at Ranger 9", dict(cls="Ranger", level=9, base=WL), [(DL("Tireless") + ".length", 0)]),
    z3("Z4 Rogue 7 Reliable Talent: a d20 of 9 or lower counts as 10 on a proficient check", dict(cls="Rogue", level=7, base=WL), [(NT("Reliable Talent", "9 or lower counts as a 10"), True)]),
    z3("Z4 Rogue 11 (2014) Reliable Talent: the same line in the 2014 build, at level 11", dict(rs="2014", cls="Rogue", level=11, base=WL), [(NT("Reliable Talent", "9 or lower counts as a 10"), True)]),
    z3("NEG Z5 Rogue 7 (2014) has no Reliable Talent line (level 11 in 2014)", dict(rs="2014", cls="Rogue", level=7, base=WL), [(DL("Reliable Talent") + ".length", 0)]),
    z3("NEG Z5 Rogue 10 (2014) has no Reliable Talent line", dict(rs="2014", cls="Rogue", level=10, base=WL), [(DL("Reliable Talent") + ".length", 0)]),
    z3("NEG Z4 no Reliable Talent line at Rogue 6", dict(cls="Rogue", level=6, base=WL), [(DL("Reliable Talent") + ".length", 0)]),
    z3("Z4 Valor 3 Combat Inspiration, Defense: the die is added to the Armor Class of the creature that holds it", dict(cls="Bard", level=3, sub="College of Valor", base=WL), [(NT("Combat Inspiration (Defense)", "add the result to its Armor Class against that attack"), True)]),
    z3("Z4 Valor 3 Combat Inspiration, Offense: the die is added to the damage of an attack that hit", dict(cls="Bard", level=3, sub="College of Valor", base=WL), [(NT("Combat Inspiration (Offense)", "add the result to the damage"), True)]),
    z3("Z4 Glory 3 Inspiring Smite: 2d8 plus Paladin level Temporary Hit Points shared within 30 ft", dict(cls="Paladin", level=3, sub="Oath of Glory", base=WL), [(NT("Inspiring Smite", "roll 2d8 and add your Paladin level"), True)]),
    z3("Z4 Glory 15 Glorious Defense: the row tag names the Charisma bonus to Armor Class", dict(cls="Paladin", level=15, sub="Oath of Glory", base=WL), [(RT("Glorious Defense"), "Reaction, +CHA to AC (min +1)")]),
    z3("Z4 Wild Magic 6 Bend Luck: 1d4 added to or subtracted from another creature's d20", dict(cls="Sorcerer", level=6, sub="Wild Magic Sorcery", base=WL), [(NT("Bend Luck", "roll 1d4 and add it to or subtract it from that roll"), True)]),
    z3("NEG Z4 no Bend Luck line at Wild Magic 5", dict(cls="Sorcerer", level=5, sub="Wild Magic Sorcery", base=WL), [(DL("Bend Luck") + ".length", 0)]),
    z3("Z4 Evoker 14 Overchannel: 2d12 Necrotic per spell level on the second use, plus 1d12 per further use", dict(cls="Wizard", level=14, sub="Evoker", base=WL), [(NT("Overchannel", "2d12 Necrotic damage per spell level"), True), (NT("Overchannel", "raises it by 1d12 per spell level"), True)]),
    z3("Z4 Evoker 14 Overchannel: the row tag says maximum damage", dict(cls="Wizard", level=14, sub="Evoker", base=WL), [(RT("Overchannel"), "Damage spell, maximum damage")]),
    z3("Z4 Stars 6 Cosmic Omen: the row tag names the 1d6", dict(cls="Druid", level=6, sub="Circle of the Stars", base=WL), [(RT("Cosmic Omen"), "Reaction, add or subtract 1d6")]),
    z3("Z4 Stars 3 Starry Form, Dragon: a d20 of 9 or lower counts as 10 on Intelligence, Wisdom and Concentration rolls", dict(cls="Druid", level=3, sub="Circle of the Stars", base=WL), [(NT("Starry Form (Dragon)", "Intelligence checks, Wisdom checks, and Constitution saves to keep Concentration: a d20 roll of 9 or lower counts as a 10"), True)], tog={"stars-dragon": True}),
    z3("NEG Z4 Stars 3 Starry Form, Dragon: the line is absent while the toggle is off", dict(cls="Druid", level=3, sub="Circle of the Stars", base=WL), [(DL("Starry Form (Dragon)") + ".length", 0)]),
    z3("NEG Z4 Stars 10: the Dragon toggle is listed once although two entries carry it", dict(cls="Druid", level=10, sub="Circle of the Stars", base=WL), [("(C.fxToggles||[]).filter(t=>t.id==='stars-dragon').length", 1)]),
    z3("Z4 Archfey 3 Steps of the Fey: the row tag names the 1d10 Temporary Hit Points", dict(cls="Warlock", level=3, sub="Archfey Patron", base=WL), [(RT("Steps of the Fey: Misty Step"), "Free spell, Refreshing Step 1d10 Temp HP")]),
    z3("Z4 Fiend 6 Dark One's Own Luck: the row tag names the d10", dict(cls="Warlock", level=6, sub="Fiend Patron", base=WL), [(RT("Dark One's Own Luck"), "Check or save, add 1d10")]),
    z3("Z4 Grappler feat Fast Wrestler: moving a Grappled creature does not halve Speed", dict(cls="Fighter", level=4, base=WL, ch={"feat4": {"feat": "Grappler", "a1": "STR"}}), [(NT("Grappler", "does not halve your Speed"), True)]),
    z3("Z4 Chef feat Replenishing Meal: an extra 1d8 Hit Points from Hit Point Dice after the meal", dict(cls="Fighter", level=4, base=WL, ch={"feat4": {"feat": "Chef", "a1": "CON"}}), [(NT("Chef", "extra 1d8 Hit Points"), True)]),
    z3("Z4 Interception feat: the Reaction lowers the damage by 1d10 plus Proficiency Bonus", dict(cls="Fighter", level=4, base=WL, ch={"feat4": {"feat": "Interception", "a1": "STR"}}), [(NT("Interception", "reduce that damage by 1d10 plus your Proficiency Bonus"), True)]),
    z3("Z4 Boon of Fate Improve Fate: the row tag names the 2d4", dict(cls="Fighter", level=19, base=WL, ch={"feat19": {"feat": "Boon of Fate", "a1": "STR"}}), [(RT("Improve Fate") + ".indexOf('On D20 Test, add or subtract 2d4')", 0)]),
]


# ---- zero miss 4, part 2: the 2014 rules (reports/zm4.md). Builds with rs="2014"; the NEG cases check that the 2024 build does not get the 2014 line (ed:"2014").
SRC14 = dict(SRCS, dmg14=True)
ACA = DEFA + [r"^ac\."]
FT14 = lambda f, a="STR", lv=4: dict(rs="2014", cls="Fighter", level=lv, base=WL, ch={"feat4": {"feat": f, "a1": a}})
CASES += [
    z3("Z4 14 Bard 6 Countercharm: Advantage on saves against Frightened or Charmed for you and allies", dict(rs="2014", cls="Bard", level=6, base=WL), [(NT("Countercharm", "Advantage on saving throws against being Frightened or Charmed"), True)], tog={"countercharm": True}),
    z3("NEG Z4 14 the 2024 Bard has no 2014 Countercharm toggle", dict(cls="Bard", level=7, base=WL), [("(C.fxToggles||[]).some(t=>t.id==='countercharm')", False)]),
    z3("NEG Z4 14 no Countercharm toggle at Bard 5 (2014)", dict(rs="2014", cls="Bard", level=5, base=WL), [("(C.fxToggles||[]).some(t=>t.id==='countercharm')", False)]),
    z3("Z4 14 Bard 2 Song of Rest: an extra d6 for Hit Dice spent on a Short Rest", dict(rs="2014", cls="Bard", level=2, base=WL), [(NT("Song of Rest", "extra d6 Hit Points \\(d8 from level 9, d10 from level 13, d12 from level 17\\)"), True)]),
    z3("NEG Z4 14 the 2024 Bard has no Song of Rest line", dict(cls="Bard", level=2, base=WL), [(DL("Song of Rest") + ".length", 0)]),
    z3("Z4 14 Paladin 2 Divine Smite: 2d8 Radiant, +1d8 per slot level, +1d8 against Undead or Fiend", dict(rs="2014", cls="Paladin", level=2, base=WL), [(NT("Divine Smite", "2d8 Radiant damage for a level 1 slot, plus 1d8 per slot level above 1 \\(5d8 at most\\), plus 1d8 against an Undead or a Fiend \\(6d8 at most\\)"), True)]),
    z3("NEG Z4 14 the 2024 Paladin has no 2014 Divine Smite line", dict(cls="Paladin", level=2, base=WL), [(DL("Divine Smite") + ".length", 0)]),
    z3("Z4 14 Ranger 1 Favored Enemy: Advantage on Survival tracking and Intelligence recall checks", dict(rs="2014", cls="Ranger", level=1, base=WL), [(NT("Favored Enemy", "Advantage on Wisdom \\(Survival\\) checks to track your favored enemies"), True)]),
    z3("NEG Z4 14 the 2024 Ranger has no 2014 Favored Enemy line", dict(cls="Ranger", level=1, base=WL), [(DL("Favored Enemy") + ".length", 0)]),
    z3("Z4 14 Ranger 8 Land's Stride: Advantage on saves against magical plants that impede movement", dict(rs="2014", cls="Ranger", level=8, base=WL), [(NT("Land's Stride", "Advantage on saving throws against plants magically created"), True)]),
    z3("Z4 14 Monk 18 Empty Body: Resistance to all damage except Force", dict(rs="2014", cls="Monk", level=18, base=WL), [(RS("Empty Body"), EXC(["Force"]))], tog={"empty-body": True}),
    z3("Z4 14 Monk 18 Empty Body: Invisible, and 8 ki points cast Astral Projection", dict(rs="2014", cls="Monk", level=18, base=WL), [(NT("Empty Body", "8 ki points cast Astral Projection"), True)], tog={"empty-body": True}),
    z3("NEG Z4 14 the 2024 Monk has no Empty Body toggle", dict(cls="Monk", level=18, base=WL), [("(C.fxToggles||[]).some(t=>t.id==='empty-body')", False)]),
    z3("Z4 14 Totem Warrior 3, Wolf spirit: friends have Advantage on melee attacks near you", dict(rs="2014", cls="Barbarian", level=3, sub="Path of the Totem Warrior", base=WL, ch={"p3tot14": ["Wolf"]}), [(NT("Totem Spirit (Wolf)", "Advantage on melee attack rolls"), True)]),
    z3("NEG Z4 14 Totem Warrior 3, Bear spirit: no Wolf line", dict(rs="2014", cls="Barbarian", level=3, sub="Path of the Totem Warrior", base=WL, ch={"p3tot14": ["Bear"]}), [(DL("Totem Spirit (Wolf)") + ".length", 0)]),
    z3("Z4 14 Totem Warrior 6, Bear aspect: Advantage on Strength checks to push, pull, lift, break", dict(rs="2014", cls="Barbarian", level=6, sub="Path of the Totem Warrior", base=WL, ch={"p6tot14": ["Bear"]}), [(NT("Aspect of the Beast (Bear)", "Advantage on Strength checks to push, pull, lift, or break objects"), True)]),
    spd("Z4 14 Totem Warrior 14, Eagle attunement: Fly Speed equal to Speed while Raging", dict(rs="2014", cls="Barbarian", level=14, sub="Path of the Totem Warrior", base=WL, ch={"p14tot14": ["Eagle"]}), {"totem-eagle": True}, [(MV, '["fly:40"]')], base_allow=SP_BASE + [r"^res\."]),
    z3("Z4 14 Valor 3 Combat Inspiration: the die adds to damage or to Armor Class", dict(rs="2014", cls="Bard", level=3, sub="College of Valor (2014)", base=WL), [(NT("Combat Inspiration", "add the die to its Armor Class against that attack"), True)]),
    z3("Z4 14 Knowledge Domain 2 Knowledge of the Ages: proficiency with a skill or tool for 10 minutes", dict(rs="2014", cls="Cleric", level=2, sub="Knowledge Domain (2014)", base=WL), [(NT("Channel Divinity: Knowledge of the Ages", "you are proficient with it for 10 minutes"), True)]),
    z3("Z4 14 Life Domain 2 Preserve Life: a pool of five times Cleric level Hit Points", dict(rs="2014", cls="Cleric", level=2, sub="Life Domain (2014)", base=WL), [(NT("Channel Divinity: Preserve Life", "pool of Hit Points equal to 5 times your Cleric level"), True)]),
    z3("NEG Z5 Nature Domain 5 has no Dampen Elements yet (level 6)", dict(rs="2014", cls="Cleric", level=5, sub="Nature Domain", base=WL), [(DL("Dampen Elements") + ".length", 0)]),
    z3("Z4 14 Nature Domain 6 Dampen Elements: Reaction Resistance for you or a creature within 30 ft", dict(rs="2014", cls="Cleric", level=6, sub="Nature Domain", base=WL), [(NT("Dampen Elements", "gains Resistance to that instance of damage"), True)]),
    z3("Z4 14 Tempest Domain 1 Wrath of the Storm: 2d8 Lightning or Thunder", dict(rs="2014", cls="Cleric", level=1, sub="Tempest Domain", base=WL), [(NT("Wrath of the Storm", "2d8 Lightning or Thunder damage"), True)]),
    z3("NEG Z4 14 the 2024 Tempest Domain has no 2014 Wrath of the Storm line", dict(cls="Cleric", level=3, sub="Tempest Domain", base=WL), [(DL("Wrath of the Storm") + ".length", 0)]),
    z3("Z4 14 Trickery 1 Blessing of the Trickster: Advantage on Stealth checks", dict(rs="2014", cls="Cleric", level=1, sub="Trickery Domain (2014)", base=WL), [(NT("Blessing of the Trickster", "Advantage on Dexterity \\(Stealth\\) checks"), True)], tog={"trickster-blessing": True}),
    z3("Z4 14 Trickery 2 Invoke Duplicity: Advantage on attacks against a creature that sees the illusion", dict(rs="2014", cls="Cleric", level=2, sub="Trickery Domain (2014)", base=WL), [(NT("Channel Divinity: Invoke Duplicity", "Advantage on attack rolls against a creature"), True)], tog={"invoke-duplicity": True}),
    z3("Z4 14 Moon 2 Combat Wild Shape: spend a slot for 1d8 Hit Points per slot level", dict(rs="2014", cls="Druid", level=2, sub="Circle of the Moon (2014)", base=WL), [(NT("Combat Wild Shape", "regain 1d8 Hit Points per level of the slot"), True)]),
    z3("Z4 14 Way of Shadow 6 Shadow Step: Advantage on the first melee attack", dict(rs="2014", cls="Monk", level=6, sub="Way of Shadow", base=WL), [(NT("Shadow Step", "first melee attack"), True)], tog={"shadow-step": True}),
    z3("Z4 14 Devotion 20 Holy Nimbus: Advantage on saves against spells of Fiends and Undead", dict(rs="2014", cls="Paladin", level=20, sub="Oath of Devotion (2014)", base=WL), [(NT("Holy Nimbus", "Advantage on saving throws against spells cast by Fiends and Undead"), True)], tog={"holy-nimbus": True}),
    z3("Z4 14 Vengeance 20 Avenging Angel: attacks against a Frightened creature have Advantage", dict(rs="2014", cls="Paladin", level=20, sub="Oath of Vengeance (2014)", base=WL), [(NT("Avenging Angel (Frightened foes)", "Attack rolls against a creature Frightened by your aura have Advantage"), True)], tog={"avenging-angel": True}, allow=DEFA + [r"^moves\.", r"^speedSrc$"]),
    z3("Z4 14 Vengeance 3 Vow of Enmity: Advantage on attacks against the creature", dict(rs="2014", cls="Paladin", level=3, sub="Oath of Vengeance (2014)", base=WL), [(NT("Channel Divinity: Vow of Enmity", "Advantage on attack rolls against the creature you swore"), True)], tog={"vow-of-enmity": True}),
    z3("Z4 14 Oathbreaker 20 Dread Lord: 4d10 Psychic aura and the 3d10 Necrotic shadow attack", dict(rs="2014", cls="Paladin", level=20, sub="Oathbreaker", base=WL, src=SRC14), [(NT("Dread Lord", "4d10 Psychic damage when it starts its turn in the aura"), True), (NT("Dread Lord", "3d10 plus your Charisma modifier Necrotic"), True)], tog={"dread-lord": True}),
    z3("Z4 14 Oathbreaker 15 has no Dread Lord yet (level 20 feature)", dict(rs="2014", cls="Paladin", level=15, sub="Oathbreaker", base=WL, src=SRC14), [(NT("Dread Lord", "4d10 Psychic damage when it starts its turn in the aura"), False)], tog={"dread-lord": True}),
    dict(name="Z4 14 Hunter 3 Colossus Slayer: +1d8 once per turn on a weapon hit", b=dict(rs="2014", cls="Ranger", level=3, sub="Hunter (2014)", inv=LS, base=WL, ch={"p3hunt14a": ["Colossus Slayer"]}),
         expect=[("C.attacks.find(a=>a.n==='Longsword').xdice.map(x=>x.d).join()", "1d8"), ("/Colossus Slayer/.test(C.attacks.find(a=>a.n==='Longsword').note)", True)], base_allow=[ATK + r"(note|xdice\.)"]),
    dict(name="NEG Z4 14 Hunter 3 Giant Killer pick: no Colossus Slayer dice", b=dict(rs="2014", cls="Ranger", level=3, sub="Hunter (2014)", inv=LS, base=WL, ch={"p3hunt14a": ["Giant Killer"]}),
         expect=[("(C.attacks.find(a=>a.n==='Longsword').xdice||[]).length", 0)], base_allow=[ATK + r"(note|xdice\.)"]),
    z3("Z4 14 Hunter 7 Defensive Tactics, Escape the Horde: Opportunity Attacks against you have Disadvantage", dict(rs="2014", cls="Ranger", level=7, sub="Hunter (2014)", base=WL, ch={"p7hunt14b": ["Escape the Horde"]}), [(NT("Defensive Tactics (Escape the Horde)", "Opportunity Attacks against you have Disadvantage"), True)]),
    z3("Z4 14 Hunter 7 Defensive Tactics, Multiattack Defense: +4 AC against later attacks of a creature that hit you", dict(rs="2014", cls="Ranger", level=7, sub="Hunter (2014)", base=WL, ch={"p7hunt14b": ["Multiattack Defense"]}), [(NT("Defensive Tactics (Multiattack Defense)", "\\+4 AC against its later attacks this turn"), True)]),
    z3("Z4 14 Hunter 7 Defensive Tactics, Steel Will (fx-L12, no second line from Z4): Advantage on saves against Frightened", dict(rs="2014", cls="Ranger", level=7, sub="Hunter (2014)", base=WL, ch={"p7hunt14b": ["Steel Will"]}), [(NT("Steel Will", "Advantage on saves against being Frightened"), True)]),
    z3("Z4 14 Arcane Trickster 13 Versatile Trickster: Advantage on attacks against the creature near Mage Hand", dict(rs="2014", cls="Rogue", level=13, sub="Arcane Trickster (2014)", base=WL), [(NT("Versatile Trickster", "Advantage on attack rolls against the creature you designated"), True)], tog={"versatile-trickster": True}),
    z3("Z4 14 Assassin 3 Assassinate: Advantage against creatures that have not acted, hits on surprised are critical", dict(rs="2014", cls="Rogue", level=3, sub="Assassin (2014)", base=WL), [(NT("Assassinate", "Advantage on attack rolls against any creature that has not taken a turn"), True), (NT("Assassinate", "Critical Hit"), True)]),
    z3("Z4 14 Draconic Bloodline 6 Elemental Affinity: Charisma to damage, 1 sorcery point for Resistance", dict(rs="2014", cls="Sorcerer", level=6, sub="Draconic Bloodline", base=WL), [(NT("Elemental Affinity", "spend 1 sorcery point for Resistance to that type for 1 hour"), True)]),
    z3("NEG Z5 Wild Magic (2014) 5 has no Bend Luck yet (level 6)", dict(rs="2014", cls="Sorcerer", level=5, sub="Wild Magic", base=WL), [(DL("Bend Luck") + ".length", 0)]),
    z3("Z4 14 Wild Magic 6 Bend Luck: 1d4 for 2 sorcery points", dict(rs="2014", cls="Sorcerer", level=6, sub="Wild Magic", base=WL), [(NT("Bend Luck", "2 sorcery points.*1d4"), True)]),
    z3("Z4 14 Fiend 14 Hurl Through Hell: 10d10 Psychic damage", dict(rs="2014", cls="Warlock", level=14, sub="The Fiend (2014)", base=WL), [(NT("Hurl Through Hell", "10d10 Psychic damage"), True)]),
    z3("NEG Z5 Great Old One (2014) 5 has no Entropic Ward yet (level 6)", dict(rs="2014", cls="Warlock", level=5, sub="The Great Old One (2014)", base=WL), [(DL("Entropic Ward") + ".length", 0)]),
    z3("Z4 14 Great Old One 6 Entropic Ward: Disadvantage on the attack, Advantage on your next one if it misses", dict(rs="2014", cls="Warlock", level=6, sub="The Great Old One (2014)", base=WL), [(NT("Entropic Ward", "impose Disadvantage"), True), (NT("Entropic Ward", "Advantage on your next attack roll against a creature"), True)]),
    z3("Z4 14 Abjuration 2 Arcane Ward: Hit Point maximum twice Wizard level plus Intelligence modifier", dict(rs="2014", cls="Wizard", level=2, sub="School of Abjuration", base=WL), [(NT("Arcane Ward", "Hit Point maximum: twice your Wizard level plus your Intelligence modifier"), True)]),
    z3("Z4 14 Evocation 14 Overchannel: maximum damage, 2d12 Necrotic per spell level after the first use", dict(rs="2014", cls="Wizard", level=14, sub="School of Evocation", base=WL), [(NT("Overchannel", "2d12 Necrotic damage per spell level, plus 1d12"), True)]),
    z3("Z4 14 Alert feat: no Advantage for hidden attackers, not Surprised", dict(FT14("Alert (2014)")), [(NT("Alert", "do not gain Advantage on attack rolls against you just because they are hidden"), True)]),
    z3("Z4 14 Defensive Duelist feat: Reaction adds Proficiency Bonus to AC", dict(FT14("Defensive Duelist (2014)", "DEX")), [(NT("Defensive Duelist", "add your Proficiency Bonus to your AC against that attack"), True)]),
    z3("Z4 14 Healer feat: 1d6 + 4 Hit Points plus Hit Dice", dict(FT14("Healer (2014)")), [(NT("Healer", "1d6 \\+ 4 Hit Points plus its number of Hit Dice"), True)]),
    z3("Z4 14 Polearm Master feat: Butt Strike 1d4 Bludgeoning", dict(FT14("Polearm Master (2014)")), [(NT("Polearm Master", "1d4 Bludgeoning damage"), True)]),
    z3("Z4 14 Dual Wielder feat: +1 AC while wielding a melee weapon in each hand", dict(FT14("Dual Wielder (2014)")), [("C.ac.bonus.some(b=>/Dual Wielder/.test(b.s)&&b.v===1)", True)], tog={"dual-defense": True}, allow=ACA),
    z3("NEG Z4 14 Dual Wielder feat: no AC bonus while the toggle is off", dict(FT14("Dual Wielder (2014)")), [("C.ac.bonus.some(b=>/Dual Wielder/.test(b.s))", False)]),
]

# ---------------- uncovered-1 (reports/uncovered-1.md): features the SHEET computes in code (tests/clause_gate_code.json). Each name starts with the "test" field of the entry.
# `lo` is the same character without the feature (one level lower, or the heavy armor that switches it off): only the paths in `allow` may differ between the two.
# what a level-up (or a subclass pick) may change besides the declared path: the feature texts, resource rows, Hit Points, spell lists and DCs, other defense lines and notes of the same class
U1_LV = [r"^features\.", r"^actions\.", r"^acts", r"^res\.", r"^hp", r"^hitDice", r"^level", r"^xdmg", r"^spellcasting", r"^slots", r"^spells", r"^dcSrc", r"^dcAb", r"^fxToggles", r"^defenses", r"^saveNotes", r"^saveBonus", r"^darkSrc"]
U1_ARM = [r"^features\.", r"^acts", r"^actions\.", r"^ac\.", r"^inv\b", r"^attacks\.", r"^abilities\.STR\.base$", r"^skills\.\d+\.dis$", r"^dcSrc", r"^dcAb", r"^profs?\b"]  # heavy armor on or off
HEAVY = [{"n": "Chain Mail", "q": 1, "eq": True}]
STR16 = dict(WL, STR=16)


def u1(name, b, expect, lo=None, allow=None, **kw):
    c = dict(name=name, b=b, expect=expect, base_allow=[r".*"], **kw)
    if lo is not None:
        c["lo"] = lo; c["allow"] = allow or U1_LV
    return c


def lv(b, n, **kw):  # the same build with another level (and other fields)
    return dict(b, level=n, **kw)


MV2 = "JSON.stringify((C.moves||[]).map(x=>x.m+':'+x.v))"
SV = "Object.keys(C.saves).sort().join()"
IMMU = lambda src, rx: "C.defenses.some(d=>d.s===%r&&d.t==='Immunity'&&/%s/.test(d.v))" % (src, rx)
RESU = lambda src, rx: "C.defenses.some(d=>d.s===%r&&d.t==='Resistance'&&/%s/.test(d.v))" % (src, rx)
B5 = dict(cls="Barbarian", level=5, base=WL)
M2 = dict(cls="Monk", level=2, base=WL)
R6 = dict(cls="Ranger", level=6, base=WL)
CASES += [
    u1("U1 Barbarian 5 Fast Movement: Speed 10 ft higher, not in Heavy armor", B5, [("C.speed", 40), ("/\\+10 Fast Movement/.test(C.speedSrc)", True)], lo=dict(B5, base=STR16, inv=HEAVY), allow=U1_ARM + [r"^speed"]),
    u1("NEG U1 Barbarian 4 has no Fast Movement yet", lv(B5, 4), [("C.speed", 30), ("/Fast Movement/.test(C.speedSrc)", False)]),
    u1("U1 Monk 2 Unarmored Movement: +10 ft, +15 at level 6", M2, [("C.speed", 40), ("/\\+10 ft Unarmored Movement/.test(C.speedSrc)", True)], lo=dict(M2, inv=[{"n": "Leather Armor", "q": 1, "eq": True}]), allow=U1_ARM + [r"^speed"]),
    u1("U1 Monk 6 Unarmored Movement: +15 ft", lv(M2, 6), [("C.speed", 45)]),
    u1("NEG U1 Monk 1 has no Unarmored Movement", lv(M2, 1), [("C.speed", 30)]),
    u1("U1 Ranger 6 Roving: Speed +10 ft, Climb and Swim equal to Speed", R6, [("C.speed", 40), (MV2, '["climb:40","swim:40"]')], lo=dict(R6, base=STR16, inv=HEAVY), allow=U1_ARM + [r"^speed", r"^moves\."]),
    u1("NEG U1 Ranger 5 has no Roving", lv(R6, 5), [("C.speed", 30), (MV2, "[]")]),
    u1("U1 Paladin 6 Aura of Protection: Charisma modifier to saves", dict(cls="Paladin", level=6, base=WL), [("C.saveBonus.map(x=>x.v).join()", "4"), ("/Aura of Protection/.test(C.saveBonus[0].s)", True)], lo=dict(cls="Paladin", level=5, base=WL), allow=U1_LV),
    u1("U1 Paladin 6 Aura of Protection: at least +1 with Charisma 8", dict(cls="Paladin", level=6, base=dict(WL, CHA=8)), [("C.saveBonus.map(x=>x.v).join()", "1")]),
    u1("NEG U1 Paladin 5 has no Aura of Protection", dict(cls="Paladin", level=5, base=WL), [("(C.saveBonus||[]).length", 0)]),
    u1("U1 Paladin 10 Aura of Courage: Immunity to Frightened", dict(cls="Paladin", level=10, base=WL), [(IMMU("Paladin 10", "Frightened"), True)], lo=dict(cls="Paladin", level=9, base=WL)),
    u1("NEG U1 Paladin 9 has no Aura of Courage", dict(cls="Paladin", level=9, base=WL), [(IMMU("Paladin 10", "Frightened"), False)]),
    u1("U1 Monk 14 Disciplined Survivor: proficiency in every saving throw, a reroll note", dict(cls="Monk", level=14, base=WL), [(SV, "CHA,CON,DEX,INT,STR,WIS"), ("C.saveNotes.some(n=>n.s==='Disciplined Survivor'&&/Spend 1 Focus Point to reroll/.test(n.t))", True)], lo=dict(cls="Monk", level=13, base=WL), allow=U1_LV + [r"^saves\.(CHA|CON|INT|WIS)$", r"^speed"]),
    u1("NEG U1 Monk 13 has only the two class saves", dict(cls="Monk", level=13, base=WL), [(SV, "DEX,STR")]),
    u1("U1 Rogue 15 Slippery Mind: Wisdom and Charisma saves", dict(cls="Rogue", level=15, base=WL), [(SV, "CHA,DEX,INT,WIS")], lo=dict(cls="Rogue", level=14, base=WL), allow=U1_LV + [r"^saves\.(CHA|WIS)$"]),
    u1("NEG U1 Rogue 14 has only Dexterity and Intelligence saves", dict(cls="Rogue", level=14, base=WL), [(SV, "DEX,INT")]),
    u1("U1 Bard 2 Jack of All Trades: half the Proficiency Bonus (1) on skills without proficiency", dict(cls="Bard", level=2, base=WL), [("C.skills.filter(s=>!s.p&&s.misc===1&&/Jack of All Trades/.test(s.miscSrc)).length>10", True), ("C.skills.filter(s=>s.p&&/Jack of All Trades/.test(s.miscSrc||'')).length", 0)], lo=dict(cls="Bard", level=1, base=WL), allow=U1_LV + [r"^skills\.\d+\.misc"]),
    u1("NEG U1 Bard 1 has no Jack of All Trades", dict(cls="Bard", level=1, base=WL), [("C.skills.filter(s=>/Jack of All Trades/.test(s.miscSrc||'')).length", 0)]),
    u1("U1 Valor 3 Martial Training: Medium armor, Shields, Martial weapons", dict(cls="Bard", level=3, sub="College of Valor", base=WL), [("C.profs.armor", "Light, Medium, Shields"), ("C.profs.weapons", "Simple, Martial")], lo=dict(cls="Bard", level=3, sub="College of Lore", base=WL), allow=U1_LV + [r"^sub$", r"^profs\.(armor|weapons)$", r"^profSrc\.(armor|weapons)"]),
    u1("NEG U1 Lore 3 keeps Light armor and Simple weapons", dict(cls="Bard", level=3, sub="College of Lore", base=WL), [("C.profs.armor", "Light"), ("C.profs.weapons", "Simple")]),
    u1("U1 Gloom Stalker 7 Iron Mind: Wisdom saving throws", dict(cls="Ranger", level=7, sub="Gloom Stalker", base=WL), [(SV, "DEX,STR,WIS")], lo=dict(cls="Ranger", level=6, sub="Gloom Stalker", base=WL), allow=U1_LV + [r"^saves\.WIS$", r"^moves\.", r"^speedSrc$"]),
    u1("NEG U1 Gloom Stalker 6 has no Wisdom save", dict(cls="Ranger", level=6, sub="Gloom Stalker", base=WL), [(SV, "DEX,STR")]),
    u1("U1 Gloom Stalker 3 Dread Ambusher: Wisdom modifier to Initiative", dict(cls="Ranger", level=3, sub="Gloom Stalker", base=WL), [("C.initBonus.some(x=>/Dread Ambusher: Wisdom modifier/.test(x.s))", True)], lo=dict(cls="Ranger", level=3, sub="Hunter", base=WL), allow=U1_LV + [r"^sub$", r"^initBonus", r"^darkvision"]),
    u1("NEG U1 Hunter 3 has no Dread Ambusher Initiative", dict(cls="Ranger", level=3, sub="Hunter", base=WL), [("(C.initBonus||[]).length", 0)]),
]
for (nm, cl, sb, L, src, rx, kind, extra) in [
    ("Berserker 6 Mindless Rage", "Barbarian", "Path of the Berserker", 6, "Mindless Rage", "Charmed, Frightened", "I", {}),
    ("Great Old One 10 Thought Shield", "Warlock", "Great Old One Patron", 10, "Thought Shield", "^Psychic$", "R", {}),
    ("Psi Warrior 10 Guarded Mind", "Fighter", "Psi Warrior", 10, "Guarded Mind", "^Psychic$", "R", {}),
    ("Ancients 7 Aura of Warding", "Paladin", "Oath of the Ancients", 7, "Aura of Warding", "^Necrotic, Psychic, Radiant$", "R", {}),
    ("War 17 Avatar of Battle", "Cleric", "War Domain", 17, "Avatar of Battle", "^Bludgeoning, Piercing, Slashing$", "R", {}),
    ("Celestial 6 Radiant Soul", "Warlock", "Celestial Patron", 6, "Radiant Soul", "^Radiant$", "R", {}),
    ("Archfey 10 Beguiling Defenses", "Warlock", "Archfey Patron", 10, "Beguiling Defenses", "^Charmed$", "I", {}),
    ("Fiend 10 Fiendish Resilience", "Warlock", "Fiend Patron", 10, "Fiendish Resilience", "^Cold$", "R", {"p10opt": "Cold"}),
]:
    bh = dict(cls=cl, level=L, sub=sb, base=WL, ch=extra)
    chk = (IMMU if kind == "I" else RESU)(src, rx)
    CASES += [u1("U1 " + nm + ": " + ("Immunity" if kind == "I" else "Resistance"), bh, [(chk, True)], lo=lv(bh, L - 1), allow=U1_LV),
              u1("NEG U1 " + nm + " one level earlier has no such line", lv(bh, L - 1), [(chk, False)])]
LAND = dict(cls="Druid", level=10, sub="Circle of the Land", base=WL, ch={"land": "Arid"})
CASES += [
    u1("U1 Land 10 Nature's Ward: Immunity to Poisoned and Resistance to the land type (Arid: Fire)", LAND, [(IMMU("Nature's Ward", "Poisoned"), True), (RESU("Nature's Ward (Arid)", "^Fire$"), True)], lo=lv(LAND, 9), allow=U1_LV),
    u1("U1 Land 10 Nature's Ward: Polar land gives Cold", dict(LAND, ch={"land": "Polar"}), [(RESU("Nature's Ward (Polar)", "^Cold$"), True)]),
    u1("NEG U1 Land 9 has no Nature's Ward", lv(LAND, 9), [(IMMU("Nature's Ward", "Poisoned"), False)]),
]

# the feat fx dict (FEATS[n].fx: senses, res, ...) is read by the sheet; the build with the feat against the same build without it
FTA = [r"^abilities\.\w+\.bonus", r"^features\.", r"^feats", r"^acts", r"^actions\.", r"^hp", r"^profSrc", r"^defenses", r"^saveNotes", r"^asi", r"^picks", r"^level"]
CASES += [
    dict(name="U2 Skulker feat: Blindsight 10 ft", b=dict(cls="Fighter", level=4, ch={"feat4": {"feat": "Skulker", "a1": "DEX"}}, base=WL), drop={"feat4": None},
         expect=[("C.senses.map(x=>x.n+':'+x.v).join()", "Blindsight:10")], allow=FTA + [r"^senses\."], base_allow=[r".*"]),
    dict(name="NEG U2 Alert feat has no Blindsight", b=dict(cls="Fighter", level=4, ch={"feat4": {"feat": "Alert", "a1": "DEX"}}, base=WL),
         expect=[("(C.senses||[]).length", 0)], base_allow=[r".*"]),
    dict(name="U2 Dungeon Delver (2014) feat: Resistance to trap damage", b=dict(rs="2014", cls="Fighter", level=4, ch={"feat4": {"feat": "Dungeon Delver", "a1": "DEX"}}, base=WL), drop={"feat4": None},
         expect=[(RESU("Dungeon Delver", "Damage dealt by traps"), True)], allow=FTA + [r"^abilities", r"^skills"], base_allow=[r".*"]),
    dict(name="U2 Chef feat: proficiency with Cook's Utensils", b=dict(cls="Fighter", level=4, ch={"feat4": {"feat": "Chef", "a1": "CON"}}, base=WL), drop={"feat4": None},
         expect=[("C.profs.tools", "Cook's Utensils")], allow=FTA + [r"^profs\.tools$", r"^res\."], base_allow=[r".*"]),
    dict(name="U2 Martial Weapon Training feat: Martial weapons for a Wizard", b=dict(cls="Wizard", level=4, ch={"feat4": {"feat": "Martial Weapon Training", "a1": "STR"}}, base=WL), drop={"feat4": None},
         expect=[("C.profs.weapons", "Simple, Martial")], allow=FTA + [r"^profs\.weapons$"], base_allow=[r".*"]),
    dict(name="U2 Tavern Brawler feat: proficiency with improvised weapons", b=dict(cls="Wizard", level=4, ch={"feat4": {"feat": "Tavern Brawler", "a1": "STR"}}, base=WL), drop={"feat4": None},
         expect=[("/Improvised/.test(C.profs.weapons)", True)], allow=FTA + [r"^profs\.weapons$", r"^attacks\.0\.(die|dieSrc)$"], base_allow=[r".*"]),
    dict(name="NEG U2 a Wizard without Martial Weapon Training has Simple weapons only", b=dict(cls="Wizard", level=4, base=WL), expect=[("C.profs.weapons", "Simple")], base_allow=[r".*"]),
    dict(name="NEG U2 Dungeon Delver (2014) not taken: no trap Resistance", b=dict(rs="2014", cls="Fighter", level=4, base=WL),
         expect=[(RESU("Dungeon Delver", "Damage dealt by traps"), False)], base_allow=[r".*"]),
]

# uncovered-2 box 1: feats and subclass features the sheet computes in code, and SUB_GRANT rows; each with the build without the feature
MED_ARM = [{"n": "Scale Mail", "q": 1, "eq": True}]
D16 = dict(WL, DEX=16)
SK = lambda n, f: "(C.skills.find(s=>s.n===%r)||{}).%s" % (n, f)
F4 = lambda feat, a1, **kw: dict(kw, ch=dict(kw.pop("ch", {}), feat4={"feat": feat, "a1": a1}))
HPB = "C.hpBonus.map(x=>x.v).join()"
CASES += [
    dict(name="U3 Tough feat: Hit Point maximum 2 per character level (level 4)", b=dict(cls="Fighter", level=4, base=WL, **F4("Tough", "CON")), drop={"feat4": None},
         expect=[(HPB, "8")], allow=FTA, base_allow=[r".*"]),
    dict(name="U3 Tough feat: and 2 more with each level (level 8)", b=dict(cls="Fighter", level=8, base=WL, **F4("Tough", "CON")), drop={"feat4": None},
         expect=[(HPB, "16")], allow=FTA + [r"^spellcasting", r"^hitDice"], base_allow=[r".*"]),
    dict(name="NEG U3 Alert feat gives no Hit Point bonus", b=dict(cls="Fighter", level=4, base=WL, **F4("Alert", "DEX")), expect=[("C.hpBonus.length", 0)], base_allow=[r".*"]),
    dict(name="U3 Medium Armor Master feat: Dexterity limit 3 in Medium armor with Dexterity 16", b=dict(cls="Fighter", level=4, base=D16, inv=MED_ARM, **F4("Medium Armor Master", "DEX")), drop={"feat4": None},
         expect=[("C.ac.dex", "max3")], allow=FTA + [r"^ac\.dex$", r"^abilities", r"^skills\.\d+\.dis$", r"^attacks\.", r"^pasBon"], base_allow=[r".*"]),
    dict(name="NEG U3 Medium Armor Master feat with Dexterity 15 keeps the limit 2", b=dict(cls="Fighter", level=4, base=dict(WL, DEX=14), inv=MED_ARM, **F4("Medium Armor Master", "DEX")), expect=[("C.ac.dex", "max2")], base_allow=[r".*"]),
    dict(name="U3 Medium Armor Master (2014) feat: Dexterity limit 3 and no Stealth Disadvantage", b=dict(rs="2014", cls="Fighter", level=4, base=WL, inv=MED_ARM, **F4("Medium Armor Master (2014)", "DEX")), drop={"feat4": None},
         expect=[("C.ac.dex", "max3"), (SK("Stealth", "dis") + "||false", False)], allow=FTA + [r"^ac\.dex$", r"^abilities", r"^skills\.\d+\.dis$", r"^attacks\.", r"^pasBon"], base_allow=[r".*"]),
    dict(name="U3 Observant feat: proficiency in the picked skill", b=dict(cls="Fighter", level=4, base=WL, **F4("Observant", "WIS", ch={"ob-feat4": ["Perception"]})), drop={"feat4": None, "ob-feat4": None},
         expect=[(SK("Perception", "p"), 1)], allow=FTA + [r"^skills\.\d+\.(p|src)$", r"^pasBon", r"^abilities"], base_allow=[r".*"]),
    dict(name="U3 Observant feat: Expertise when the skill is already proficient", b=dict(cls="Fighter", level=4, base=WL, extra={"bg": "Acolyte"}, **F4("Observant", "WIS", ch={"ob-feat4": ["Insight"]})), drop={"feat4": None, "ob-feat4": None},
         expect=[(SK("Insight", "p"), 2)], allow=FTA + [r"^skills\.\d+\.(p|src)$", r"^pasBon", r"^abilities"], base_allow=[r".*"]),
    dict(name="U3 Keen Mind feat: proficiency in the picked skill", b=dict(cls="Wizard", level=4, base=WL, **F4("Keen Mind", "INT", ch={"kn-feat4": ["Nature"]})), drop={"feat4": None, "kn-feat4": None},
         expect=[(SK("Nature", "p") + ">=1", True)], allow=FTA + [r"^skills\.\d+\.(p|src)$", r"^pasBon", r"^abilities", r"^spellcasting", r"^dcSrc"], base_allow=[r".*"]),
    dict(name="U3 Resilient feat: proficiency in the saving throws of the chosen ability", b=dict(cls="Fighter", level=4, base=WL, **F4("Resilient", "WIS")), drop={"feat4": None},
         expect=[(SV, "CON,STR,WIS")], allow=FTA + [r"^saves\.WIS$"], base_allow=[r".*"]),
    dict(name="NEG U3 a Fighter without Resilient has Strength and Constitution saves only", b=dict(cls="Fighter", level=4, base=WL), expect=[(SV, "CON,STR")], base_allow=[r".*"]),
    dict(name="U3 Resilient (2014) feat: proficiency in the saving throws of the chosen ability", b=dict(rs="2014", cls="Fighter", level=4, base=WL, **F4("Resilient (2014)", "WIS")), drop={"feat4": None},
         expect=[(SV, "CON,STR,WIS")], allow=FTA + [r"^saves\.WIS$"], base_allow=[r".*"]),
    dict(name="U3 Tavern Brawler (2014) feat: proficiency with improvised weapons", b=dict(rs="2014", cls="Wizard", level=4, base=WL, **F4("Tavern Brawler (2014)", "STR")), drop={"feat4": None},
         expect=[("/Improvised/.test(C.profs.weapons)", True)], allow=FTA + [r"^profs\.weapons$", r"^attacks\.0\.(die|dieSrc)$"], base_allow=[r".*"]),
]
UFA = "C.attacks.find(a=>a.n==='Unarmed Strike')"
CASES += [
    dict(name="U3 Unarmed Fighting feat: Unarmed Strike 1d8 with nothing held", b=dict(cls="Fighter", level=1, base=WL, ch={"fs1": "Unarmed Fighting"}), drop={"fs1": None},
         expect=[(UFA + ".die", "1d8")], allow=FTA + [r"^attacks\.0\.(die|dieSrc)$", r"^features\.", r"^res\."], base_allow=[r".*"]),
    dict(name="U3 Unarmed Fighting feat: 1d6 while holding a weapon", b=dict(cls="Fighter", level=1, base=WL, ch={"fs1": "Unarmed Fighting"}, inv=[{"n": "Longsword", "q": 1, "eq": True}]), drop={"fs1": None},
         expect=[(UFA + ".die", "1d6")], allow=FTA + [r"^attacks\.0\.(die|dieSrc)$", r"^features\.", r"^res\."], base_allow=[r".*"]),
    dict(name="NEG U3 Fighter without Unarmed Fighting: Unarmed Strike deals 1", b=dict(cls="Fighter", level=1, base=WL), expect=[(UFA + ".die", "1")], base_allow=[r".*"]),
]
SDM = "(C.res.find(r=>r.n==='Superiority Dice')||{}).max"
BM = lambda L: dict(cls="Fighter", level=L, sub="Battle Master", base=WL)
CASES += [
    u1("U3 Battle Master 3 Combat Superiority: four Superiority Dice, d8", BM(3), [(SDM, 4), ("JSON.stringify(C).includes('4 Superiority Dice (d8)')", True)], lo=dict(cls="Fighter", level=3, sub="Champion", base=WL), allow=U1_LV + [r"^sub$", r"^res\.", r"^attacks\.", r"^dc"]),
    u1("U3 Battle Master 7 and 15 Combat Superiority: one more die at 7, another at 15", BM(7), [(SDM, 5)], lo=BM(6), allow=U1_LV + [r"^res\."]),
    u1("U3 Battle Master 7 and 15 Combat Superiority: six dice at 15", BM(15), [(SDM, 6), ("JSON.stringify(C).includes('6 Superiority Dice (d10)')", True)], lo=BM(14), allow=U1_LV + [r"^res\."]),
    u1("U3 Battle Master 18 Combat Superiority: the die becomes d12", BM(18), [("JSON.stringify(C).includes('6 Superiority Dice (d12)')", True)], lo=BM(17), allow=U1_LV + [r"^res\."]),
    u1("NEG U3 Battle Master 6 still has four Superiority Dice", BM(6), [(SDM, 4)]),
]
U3_INIT = U1_LV + [r"^initBonus", r"^sub$", r"^darkvision", r"^darkSrc", r"^speed", r"^moves", r"^saveBonus"]
for (nm, b, rx) in [
    ("Gloom Stalker (2014) 3 Dread Ambusher", dict(rs="2014", cls="Ranger", level=3, sub="Gloom Stalker (2014)", base=WL), "Dread Ambusher"),
    ("Swashbuckler 3 Rakish Audacity", dict(cls="Rogue", level=3, sub="Swashbuckler", base=WL), "Rakish Audacity"),
    ("War Magic 3 Tactical Wit", dict(cls="Wizard", level=3, sub="War Magic", base=WL), "Tactical Wit"),
    ("Chronurgy 3 Temporal Awareness", dict(cls="Wizard", level=3, sub="Chronurgy Magic", base=WL), "Temporal Awareness"),
    ("Watchers 7 Aura of the Sentinel", dict(cls="Paladin", level=7, sub="Oath of the Watchers", base=WL), "Aura of the Sentinel"),
]:
    L = b["level"]
    CASES += [u1("U3 " + nm + ": a line in the Initiative bonuses", b, [("C.initBonus.some(x=>/^%s/.test(x.s))" % rx, True)], lo=lv(b, L - 1), allow=U3_INIT),
              u1("NEG U3 " + nm + " one level earlier has no such line", lv(b, L - 1), [("C.initBonus.some(x=>/^%s/.test(x.s))" % rx, False)])]
GL14 = dict(rs="2014", cls="Paladin", level=7, sub="Oath of Glory (2014)", base=WL)
CASES += [
    u1("U3 Glory (2014) 7 Aura of Alacrity: Speed 10 ft higher", GL14, [("C.speed", 40), ("/\\+10 Aura of Alacrity/.test(C.speedSrc)", True)], lo=lv(GL14, 6), allow=U1_LV + [r"^speed", r"^saveBonus"]),
    u1("NEG U3 Glory (2014) 6 has Speed 30", lv(GL14, 6), [("C.speed", 30)]),
]
# SUB_GRANT rows (armor, weapons, tools, skills of a subclass feature): the sheet adds them at the row's level
GR = [("Hexblade 3 Hex Warrior (2014): Medium armor, Shields, Martial weapons", dict(rs="2014", cls="Warlock", level=3, sub="The Hexblade", base=WL), [("/Medium armor/.test(C.profs.armor)&&/Shields/.test(C.profs.armor)", True), ("/Martial/.test(C.profs.weapons)", True)]),
      ("Assassin 3 Assassin's Tools: Disguise Kit and Poisoner's Kit", dict(cls="Rogue", level=3, sub="Assassin", base=WL), [("/Disguise Kit/.test(C.profs.tools)&&/Poisoner's Kit/.test(C.profs.tools)", True)]),
      ("Mercy 3 Implements of Mercy: Insight, Medicine and the Herbalism Kit", dict(cls="Monk", level=3, sub="Way of Mercy", base=WL), [(SK("Insight", "p"), 1), (SK("Medicine", "p"), 1), ("/Herbalism Kit/.test(C.profs.tools)", True)])]
for nm, b, ex in GR:
    L = b["level"]
    CASES += [u1("U3 " + nm, b, ex, lo=lv(b, L - 1), allow=U1_LV + [r"^profs", r"^profSrc", r"^skills\.\d+\.(p|src)$", r"^sub$", r"^subSrc", r"^saves\.", r"^attacks\.", r"^ac\.", r"^unarmed"]),
              u1("NEG U3 " + nm.split(":")[0] + " one level earlier has no grant", lv(b, L - 1), [(e, not w) if isinstance(w, bool) else (e, 0 if w == 1 else w) for e, w in ex if isinstance(w, bool)] or [("1", 1)])]
for (nm, cl, sb, L, src, rx, kind, extra) in [
    ("Psi Warrior (2014) 10 Guarded Mind", "Fighter", "Psi Warrior (2014)", 10, "Guarded Mind", "^Psychic$", "R", {}),
    ("Great Old One (2014) 10 Thought Shield", "Warlock", "The Great Old One (2014)", 10, "Thought Shield", "^Psychic$", "R", {}),
    ("Archfey (2014) 10 Beguiling Defenses", "Warlock", "The Archfey (2014)", 10, "Beguiling Defenses", "^Charmed$", "I", {}),
    ("Fiend (2014) 10 Fiendish Resilience", "Warlock", "The Fiend (2014)", 10, "Fiendish Resilience", "^Cold$", "R", {"p10opt": "Cold"}),
    ("Land (2014) 10 Nature's Ward", "Druid", "Circle of the Land (2014)", 10, "Nature's Ward", "^Poison$", "I", {"land": "Arid"}),
]:
    bh = dict(rs="2014", cls=cl, level=L, sub=sb, base=WL, ch=extra)
    chk = (IMMU if kind == "I" else RESU)(src, rx)
    CASES += [u1("U3 " + nm + ": " + ("Immunity" if kind == "I" else "Resistance"), bh, [(chk, True)], lo=lv(bh, L - 1), allow=U1_LV),
              u1("NEG U3 " + nm + " one level earlier has no such line", lv(bh, L - 1), [(chk, False)])]

# uncovered-2 box 3: Extra Attack of third party classes and subclasses (src/data/fx-Z3.js): the Attack action says "Make two attacks" from the row level, one level lower it says "Make one attack"
EA_AT = "C.actions[0].d.replace(/\\. With an.*/,'')"
EA_LV = U1_LV + [r"^actions\.0\.d$", r"^sub$", r"^saves\.", r"^unarmed", r"^profs", r"^speed", r"^moves", r"^initBonus", r"^dc", r"^attacks\.", r"^res\.", r"^pasBon", r"^profSrc", r"^ac\."]
for (nm, b, L) in [
    ("Warden", dict(cls="Warden", base=WL), 5), ("Dancer", dict(cls="Dancer", base=WL), 5), ("Gadgeteer", dict(cls="Gadgeteer", base=WL), 5), ("Craftsman", dict(cls="Craftsman", base=WL), 5),
    ("Jaeger", dict(cls="Jaeger", base=WL), 5), ("Martyr", dict(cls="Martyr", base=WL), 5), ("Monster Hunter", dict(cls="Monster Hunter", base=WL), 11), ("Vagabond", dict(cls="Vagabond", base=WL), 5),
    ("Mutagenist", dict(cls="Artificer", sub="Mutagenist", base=WL), 5), ("College of Valor", dict(cls="Bard", sub="College of Valor", base=WL), 6),
    ("College of Valor (2014)", dict(rs="2014", cls="Bard", sub="College of Valor (2014)", base=WL), 6), ("College of Swords", dict(cls="Bard", sub="College of Swords", base=WL), 6),
    ("Star-Spangled Banner", dict(cls="Captain", sub="Star-Spangled Banner", base=WL), 6), ("Black Rider", dict(cls="Necromancer", sub="Black Rider", base=WL), 6),
    ("Death Knight", dict(cls="Necromancer", sub="Death Knight", base=WL), 6), ("Lumimancer", dict(cls="Wizard", sub="Lumimancer", base=WL), 6),
]:
    bh = dict(b, level=L)
    CASES += [u1("U4 %s %d Extra Attack: the Attack action makes two attacks" % (nm, L), bh, [("/^Make two attacks \\(Extra Attack \\(%s %d\\)\\)/.test(C.actions[0].d)" % (re.escape(nm), L), True)], lo=lv(bh, L - 1), allow=EA_LV),
              u1("NEG U4 %s %d is one level before Extra Attack: one attack" % (nm, L - 1), lv(bh, L - 1), [(EA_AT, "Make one attack")])]
CASES += [u1("NEG U4 Fighter 5 keeps the old text rule per Extra Attack", dict(cls="Fighter", level=5, base=WL), [(EA_AT, "Make one attack per Extra Attack")]),
          u1("NEG U4 Fighter 5 and Bard (Valor) 6 multiclass: the attack count is not summed", dict(cls="Fighter", level=5, base=WL, extra={"mc": [{"cls": "Bard", "sub": "College of Valor", "lv": 6}]}), [("/Make (two|three) attacks.*Make/.test(C.actions[0].d)", False)])]

# U5: WXS.fx payloads already consumed by XFX. Removing only that payload
# keeps the build identical except for its defense rows. Rule values above the
# threshold were read from src/data, independently of the gate atom extractor.
for cl, sb, level, feature, field, kind, types in [('Alchemist', 'Ooze Rancher', 3, 'Ooze Resilience', 'res', 'Resistance', ['Acid']), ('Barbarian', 'Path of the Frostrager', 3, 'Cold Resistance', 'res', 'Resistance', ['Cold']), ('Barbarian', 'Path of the Glacier', 3, 'Permafrost', 'res', 'Resistance', ['Cold']), ('Cleric', 'Forge Domain', 6, 'Soul of the Forge', 'res', 'Resistance', ['Fire']), ('Cleric', 'Forge Domain', 17, 'Saint of Forge and Fire', 'imm', 'Immunity', ['Fire']), ('Cleric', 'Apocalypse Domain', 17, 'Herald of the Apocalypse', 'res', 'Resistance', ['Acid', 'Fire', 'Poison']), ('Cleric', 'Beer Domain', 17, 'Fire in the Belly', 'res', 'Resistance', ['Cold', 'Poison', 'Psychic']), ('Dancer', 'Danseur Macabre', 3, 'Ghoulish Calling', 'res', 'Resistance', ['Necrotic']), ('Dancer', 'Fire Dancer', 3, 'Flame Twirling', 'res', 'Resistance', ['Fire']), ('Fighter', 'Living Crucible', 15, 'Toxin Transmutation', 'res', 'Resistance', ['Poison']), ('Ranger', 'Winter Walker', 3, 'Frigid Explorer', 'res', 'Resistance', ['Cold']), ('Sorcerer', 'Pyromancer (PSK)', 6, 'Fire in the Veins', 'res', 'Resistance', ['Fire']), ('Sorcerer', 'Pyromancer (PSK)', 18, 'Fiery Soul', 'imm', 'Immunity', ['Fire']), ('Sorcerer', 'Storm Sorcery', 6, 'Heart of the Storm', 'res', 'Resistance', ['Lightning', 'Thunder']), ('Sorcerer', 'Haunted Sorcery', 6, 'Deathly Pallor', 'res', 'Resistance', ['Necrotic']), ('Sorcerer', 'Frost Sorcery', 6, 'Cold-Hearted', 'res', 'Resistance', ['Cold']), ('Sorcerer', 'Boreal Bloodline', 6, 'Gelid Form', 'res', 'Resistance', ['Cold']), ('Warden', 'Diabolist', 3, "Devil's Advocate", 'res', 'Resistance', ['Fire']), ('Warden', 'Godsworn', 3, 'Divine Mandate', 'res', 'Resistance', ['Radiant']), ('Warden', 'Nightgaunt', 3, 'Grave Keeper', 'res', 'Resistance', ['Necrotic']), ('Warden', 'Rimekeeper', 3, 'Polar Acclimation', 'res', 'Resistance', ['Cold']), ('Warlock', 'Undead Patron', 10, 'Necrotic Husk', 'res', 'Resistance', ['Necrotic']), ('Warlock', 'The Fathomless', 6, 'Oceanic Soul', 'res', 'Resistance', ['Cold']), ('Warlock', 'The Celestial', 6, 'Radiant Soul', 'res', 'Resistance', ['Radiant']), ('Warlock', 'Astral Griffon Patron', 10, 'Extradimensional Mastery', 'res', 'Resistance', ['Force']), ('Wizard', 'Necromancer', 3, 'Necromancy Spellbook', 'res', 'Resistance', ['Necrotic'])]:
    b = dict(cls=cl, sub=sb, level=level, base=WL)
    checks = [("C.defenses.filter(d=>d.s===%r&&d.t===%r&&d.v===%r).length" % (feature, kind, t), 1) for t in types]
    CASES.append(dict(name="Z3 U5 WXS " + sb + " " + feature, b=b, expect=checks, withoutWx=[sb, feature, [field]], allow=[r"^defenses(?:\.|$)"], base_allow=[]))
    CASES.append(dict(name="NEG U5 WXS " + sb + " below " + feature, b=dict(b, level=level-1), expect=[("C.defenses.some(d=>d.s===%r&&d.t===%r)" % (feature, kind), False)], base_allow=[]))

# Z5 switches: exact state comparisons and independent lower-level negatives.
Z5_SWITCHES = [
    ("Warden", "Storm Sentinel", 17, "stormlord", "Stormlord", [("Math.max(...(C.moves||[]).filter(x=>x.m==='fly').map(x=>x.v))", 60), ("(C.moves||[]).filter(x=>x.m==='fly'&&x.v===60).length", 1)], [r"^moves(?:\.|$)", r"^speedSrc$"]),
    ("Warden", "Rimekeeper", 17, "hoarfrost-herald", "Hoarfrost Herald", [("C.defenses.filter(x=>x.t==='Immunity'&&x.v==='Cold').length", 1)], [r"^defenses(?:\.|$)"]),
    ("Ranger", "Winter Walker", 15, "frozen-haunt", "Frozen Haunt", [("C.defenses.filter(x=>x.t==='Immunity'&&x.v==='Cold').length", 1), ("['Grappled','Prone','Restrained'].every(c=>C.defenses.some(x=>x.t==='Immunity'&&x.v===c+' (condition)'))", True)], [r"^defenses(?:\.|$)"]),
    ("Investigator", "Infernum", 6, "infernal-blindsight", "Infernal Bargain", [("(C.senses||[]).find(x=>x.n==='Blindsight').v", 30), ("/Blinded beyond this range/.test((C.senses||[]).find(x=>x.n==='Blindsight').d)", True)], [r"^senses(?:\.|$)"]),
    ("Warden", "Diabolist", 6, "soul-broker-speed", "Soul Broker", [("C.speed", 45), ("(C.speedSrc.match(/15 Soul Broker/g)||[]).length", 1)], [r"^speed$", r"^speedSrc$", r"^features\.0\.items\.1\.d$"]),
    ("Wizard", "Diviner", 10, "third-eye-darkvision", "The Third Eye", [("C.darkvision", 120)], [r"^darkvision$", r"^darkSrc$"]),
]
for cl, sb, level, tid, feature, ex, fields in Z5_SWITCHES:
    b = dict(cls=cl, sub=sb, level=level, base=WL)
    CASES.append(dict(name="Z3 U5 toggle " + sb + " " + feature, b=b, tog={tid: True}, expect=ex, allow=fields+[r"^fxToggles\.\d+\.on$"], base_allow=fields+[r"^fxToggles(?:\.|$)"]))
    CASES.append(dict(name="NEG U5 toggle " + sb + " below " + feature, b=dict(b, level=level-1), tog={tid: True}, expect=[("(C.fxToggles||[]).some(x=>x.id===%r)" % tid, False)], allow=[], base_allow=[]))
    CASES.append(dict(name="NEG U5 toggle " + sb + " inactive " + feature, b=b, expect=[("(C.fxToggles||[]).find(x=>x.id===%r).on" % tid, False)], base_allow=fields+[r"^fxToggles(?:\.|$)"]))

# Z5 advantage patterns, each source and minimum level checked against its full rule text.
for spec in [{'cl': 'Alchemist', 'sb': 'Mutagenist', 'e': {'n': 'Advanced Mutation', 'l': 10, 'advOn': ['checks and saves to avoid or end the Grappled and Restrained conditions'], 'toggle': {'id': 'mutation-hyperelastic', 'label': 'Hyperelastic mutation active', 'default': False}, 'reach': [{'when': 'melee', 'add': 5}]}, 'sid': 'sub|Alchemist/Mutagenist|Advanced Mutation#4'}, {'cl': 'Captain', 'sb': 'Feylost', 'e': {'n': 'Fey Moods', 'l': 3, 'advOn': ['Dexterity checks and saving throws'], 'toggle': {'id': 'fey-mood-paranoid', 'label': 'Fey Mood active while Bloodied: Paranoid result', 'default': False}}, 'sid': 'sub|Captain/Feylost|Fey Moods#14'}, {'cl': 'Captain', 'sb': 'Feylost', 'e': {'n': 'Fey Moods', 'l': 3, 'advOn': ['Intelligence, Wisdom, and Charisma saving throws'], 'toggle': {'id': 'fey-mood-serene', 'label': 'Fey Mood active while Bloodied: Serene result', 'default': False}}, 'sid': 'sub|Captain/Feylost|Fey Moods#16'}, {'cl': 'Captain', 'sb': 'Siegeball Jersey', 'e': {'n': 'Sports Fanatic', 'l': 3, 'advOn': ['ability checks to recall information about a sport, its teams, and its players']}, 'sid': 'sub|Captain/Siegeball Jersey|Sports Fanatic#4'}, {'cl': 'Cleric', 'sb': 'Justice Domain', 'e': {'n': 'Holy Denunciation', 'l': 17, 'advOn': ['Wisdom and Charisma checks about justice, judgment, and law, up to and including execution for crimes'], 'toggle': {'id': 'holy-denunciation', 'label': 'Holy Denunciation authority active', 'default': False}}, 'sid': 'sub|Cleric/Justice Domain|Holy Denunciation#3'}, {'cl': 'Dancer', 'sb': 'Mime', 'e': {'n': 'Pantomime [Dance Style]', 'l': 3, 'advOn': ['the first melee attack roll you make on each of your turns'], 'toggle': {'id': 'pantomime', 'label': 'Pantomime dance active', 'default': False}}, 'sid': 'sub|Dancer/Mime|Pantomime [Dance Style]#2'}, {'cl': 'Druid', 'sb': 'Circle of Configuration', 'e': {'n': 'Mecha Configuration', 'l': 14, 'advOn': ['Strength checks and saves'], 'toggle': {'id': 'mecha-configuration', 'label': 'Mecha Configuration active (10 minutes)', 'default': False}, 'size': 'Large', 'atkDice': [{'when': ['melee', 'unarmed'], 'd': '1d6', 't': 'Force', 'note': 'Mecha Slam, while configured'}]}, 'sid': 'sub|Druid/Circle of Configuration|Mecha Configuration#5'}, {'cl': 'Fighter', 'sb': 'Rune Knight', 'e': {'n': "Giant's Might", 'l': 3, 'advOn': ['Strength checks and Strength saving throws'], 'toggle': {'id': 'giants-might', 'label': "Giant's Might active (1 minute)", 'default': False}, 'size': 'Large', 'atkDice': [{'when': ['weapon', 'unarmed'], 'd': '1d6', 't': "of the attack's type", 'note': "Giant's Might: one hit on each of your turns"}]}, 'sid': "sub|Fighter/Rune Knight|Giant's Might#3"}, {'cl': 'Monk', 'sb': 'Warrior of Gravity', 'e': {'n': 'Plunging Strike', 'l': 6, 'advOn': ['any Unarmed Strike you make while falling']}, 'sid': 'sub|Monk/Warrior of Gravity|Plunging Strike#1'}, {'cl': 'Monster Hunter', 'sb': 'Occultist Guild', 'e': {'n': 'Arcane Interference', 'l': 3, 'advOn': ['saving throws against spells cast by creature types in your Monster Grimoire']}, 'sid': 'sub|Monster Hunter/Occultist Guild|Arcane Interference#1'}, {'cl': 'Paladin', 'sb': 'Oath of Glory (2014)', 'e': {'n': 'Living Legend', 'l': 20, 'advOn': ['all Charisma checks'], 'toggle': {'id': 'living-legend-2014', 'label': 'Living Legend active (1 minute)', 'default': False}, 'ed': '2014'}, 'sid': 'sub|Paladin/Oath of Glory (2014)|Living Legend#2'}, {'cl': 'Paladin', 'sb': 'Oath of Thunder', 'e': {'n': 'Child of the Storm', 'l': 20, 'advOn': ['Dexterity (Stealth) checks and Initiative rolls'], 'toggle': {'id': 'child-of-the-storm', 'label': 'Child of the Storm active (1 hour)', 'default': False}, 'initAdv': True}, 'sid': 'sub|Paladin/Oath of Thunder|Child of the Storm#3'}, {'cl': 'Ranger', 'sb': 'Bounty Hunter', 'e': {'n': 'Threat Assessment', 'l': 7, 'advOn': ["saving throws against effects caused by the creature marked by your Hunter's Mark"]}, 'sid': 'sub|Ranger/Bounty Hunter|Threat Assessment#1'}, {'cl': 'Rogue', 'sb': 'Thief (2014)', 'e': {'n': 'Supreme Sneak', 'l': 9, 'advOn': ['a Dexterity (Stealth) check if you move no more than half your Speed on the same turn'], 'toggle': {'id': 'supreme-sneak', 'label': 'Moved no more than half Speed this turn', 'default': False}, 'ed': '2014'}, 'sid': 'sub|Rogue/Thief (2014)|Supreme Sneak#1'}, {'cl': 'Rogue', 'sb': 'Inquisitive', 'e': {'n': 'Steady Eye', 'l': 9, 'advOn': ['Wisdom (Perception) and Intelligence (Investigation) checks if you move no more than half your Speed on the same turn'], 'toggle': {'id': 'steady-eye', 'label': 'Moved no more than half Speed this turn', 'default': False}}, 'sid': 'sub|Rogue/Inquisitive|Steady Eye#1'}, {'cl': 'Warlock', 'sb': 'The Predator', 'e': {'n': 'Form of the Beast', 'l': 3, 'advOn': ['Stealth, Perception and Survival checks to stalk or track prey'], 'toggle': {'id': 'predator-form', 'label': 'Form of the Beast active', 'default': False}}, 'sid': 'sub|Warlock/The Predator|Form of the Beast#3'}, {'cl': 'Wizard', 'sb': 'Transmuter', 'e': {'n': 'Wondrous Alteration', 'l': 3, 'advOn': ['Charisma (Deception) checks'], 'toggle': {'id': 'alter-appearance', 'label': 'Alter Self: Change Appearance active', 'default': False}}, 'sid': 'sub|Wizard/Transmuter|Wondrous Alteration#7'}, {'cl': 'Wizard', 'sb': 'Doomsayer', 'e': {'n': 'Merciless Onslaught', 'l': 10, 'advOn': ['spell attack rolls against Frightened or Poisoned creatures']}, 'sid': 'sub|Wizard/Doomsayer|Merciless Onslaught#1'}, {'cl': 'Wizard', 'sb': 'Dragon Mage', 'e': {'n': 'Invoke Dragon Wings', 'l': 10, 'advOn': ['spell attack rolls'], 'toggle': {'id': 'dragon-wings', 'label': 'Dragon Wings active', 'default': False}}, 'sid': 'sub|Wizard/Dragon Mage|Invoke Dragon Wings#5'}]:
    e, sb, cl = spec["e"], spec["sb"], spec["cl"]
    b = dict(cls=cl, sub=sb, level=e["l"], base=WL, rs=e.get("ed", "2024"))
    checks = [("C.defenses.filter(x=>x.t==='Note'&&x.v===%r).length" % ("Advantage on "+v), 1) for v in e["advOn"]]
    fields = [r"^defenses(?:\.|$)", r"^saveNotes(?:\.|$)"]
    if sb in ("Rune Knight", "Circle of Configuration"): fields += [r"^size$", r"^attacks\.0\.(note|xdice.*)$"]
    if sb == "Mutagenist": fields += [r"^attacks\.0\.(note|range)$"]
    if sb == "Dragon Mage": fields += [r"^moves(?:\.|$)", r"^speed$", r"^speedSrc$", r"^features\.0\.items\.1\.d$"]
    case = dict(name="Z3 U5 advantage "+sb+" "+e["n"]+" "+str(len(CASES)), b=b, expect=checks, allow=fields+[r"^fxToggles\.\d+\.on$"], base_allow=fields+[r"^fxToggles(?:\.|$)"])
    if e.get("toggle"): case["tog"]={e["toggle"]["id"]:True}
    else: case["withoutGx"]=[sb,e["n"],e["advOn"][0]]
    CASES.append(case)
    CASES.append(dict(name="NEG U5 advantage "+sb+" below "+e["n"]+" "+str(len(CASES)), b=dict(b,level=e["l"]-1), tog=case.get("tog",{}), expect=[(ex,0) for ex,_ in checks], allow=[], base_allow=[]))

# U6 existing feat picks and defense handlers.
CASES += [{'name': 'Z3 U6 computed Echoing Soul',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Echoing Soul', 'a1': 'CON'}, 'sk-feat4': ['Arcana', 'Stealth']}},
  'drop': {'feat4': None},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", True), ("(C.skills.find(s=>s.n==='Stealth')||{}).p>=1", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Echoing Soul',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", False), ("(C.skills.find(s=>s.n==='Stealth')||{}).p>=1", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Symbiotic Being',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Symbiotic Being', 'a1': 'CON'}, 'sk-feat4': ['Arcana']}},
  'drop': {'feat4': None},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses',
            '^res(?:\\.|$)'],
  'base_allow': []},
 {'name': 'NEG U6 computed Symbiotic Being',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Actor (2014)',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Actor (2014)', 'a1': 'CHA'}},
        'rs': '2014'},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Actor (2014)'&&/Advantage.*Deception.*Performance/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Actor (2014)',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {},
        'rs': '2014'},
  'expect': [("C.defenses.some(x=>x.s==='Actor (2014)'&&/Advantage.*Deception.*Performance/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Dungeon Delver',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Dungeon Delver', 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Dungeon Delver'&&/Advantage.*saves against traps/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Dungeon Delver',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Dungeon Delver'&&/Advantage.*saves against traps/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Skill Expert (2014)',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Skill Expert (2014)', 'a1': 'STR'}, 'se-feat4': ['Arcana']},
        'rs': '2014'},
  'drop': {'feat4': None},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Skill Expert (2014)',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {},
        'rs': '2014'},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Squat Nimbleness',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Squat Nimbleness', 'a1': 'STR'}, 'sq-feat4': ['Acrobatics']}},
  'drop': {'feat4': None},
  'expect': [("(C.skills.find(s=>s.n==='Acrobatics')||{}).p>=1", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses',
            '^speed$',
            '^speedSrc$'],
  'base_allow': []},
 {'name': 'NEG U6 computed Squat Nimbleness',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("(C.skills.find(s=>s.n==='Acrobatics')||{}).p>=1", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Quicksmithing',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Quicksmithing', 'a1': 'CON'}, 'tl-feat4': ["Smith's Tools"]}},
  'drop': {'feat4': None},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Quicksmithing',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Gambler',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Gambler', 'a1': 'CHA'}, 'tl-feat4': ['Dice Set', 'Dragonchess Set']}},
  'drop': {'feat4': None},
  'expect': [("C.profs.tools.includes('Dice Set')", True), ("C.profs.tools.includes('Dragonchess Set')", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Gambler',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.profs.tools.includes('Dice Set')", False), ("C.profs.tools.includes('Dragonchess Set')", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Aereni Expertise',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Aereni Expertise', 'a1': 'CON'}, 'sk-feat4': ['Arcana']}},
  'drop': {'feat4': None},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Aereni Expertise',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("(C.skills.find(s=>s.n==='Arcana')||{}).p>=1", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Aereni Half-Life',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Aereni Half-Life', 'a1': 'INT'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Aereni Half-Life'&&/Death Saving Throws/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Aereni Half-Life',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Aereni Half-Life'&&/Death Saving Throws/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Envoy Specialist',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Envoy Specialist', 'a1': 'CON'}, 'tl-feat4': ["Smith's Tools"]}},
  'drop': {'feat4': None},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Envoy Specialist',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Blood Hound',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Blood Hound', 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Blood Hound'&&/sound or smell/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Blood Hound',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Blood Hound'&&/sound or smell/i.test(x.v))", False)],
  'base_allow': []},
 {'name': "Z3 U6 computed Free Sword Mercenary's Will",
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': "Free Sword Mercenary's Will", 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [('C.defenses.some(x=>x.s==="Free Sword Mercenary\'s Will"&&/would apply a condition/i.test(x.v))', True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': "NEG U6 computed Free Sword Mercenary's Will",
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [('C.defenses.some(x=>x.s==="Free Sword Mercenary\'s Will"&&/would apply a condition/i.test(x.v))', False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Iron Gut',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Iron Gut', 'a1': 'STR'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Iron Gut'&&/Poisoned.*Survival/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses',
            '^res(?:\\.|$)'],
  'base_allow': []},
 {'name': 'NEG U6 computed Iron Gut',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Iron Gut'&&/Poisoned.*Survival/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Aberrant Spawn',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Aberrant Spawn', 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Aberrant Spawn'&&/Charmed.*read your thoughts/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Aberrant Spawn',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Aberrant Spawn'&&/Charmed.*read your thoughts/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Beastperson',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Beastperson', 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Beastperson'&&/Dexterity saves while Bloodied/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Beastperson',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Beastperson'&&/Dexterity saves while Bloodied/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Green-Skin',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Green-Skin', 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Green-Skin'&&/Saves to avoid or end Poisoned/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Green-Skin',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Green-Skin'&&/Saves to avoid or end Poisoned/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Industrious',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Industrious', 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Industrious'&&/Saves to avoid Exhaustion/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses',
            '^res(?:\\.|$)'],
  'base_allow': []},
 {'name': 'NEG U6 computed Industrious',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Industrious'&&/Saves to avoid Exhaustion/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Proto-Man',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Proto-Man', 'a1': 'CON'}}},
  'drop': {'feat4': None},
  'expect': [("C.defenses.some(x=>x.s==='Proto-Man'&&/Saves to avoid or end Frightened/i.test(x.v))", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Proto-Man',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("C.defenses.some(x=>x.s==='Proto-Man'&&/Saves to avoid or end Frightened/i.test(x.v))", False)],
  'base_allow': []},
 {'name': 'Z3 U6 computed Inspirational Caster',
  'b': {'cls': 'Fighter',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'ch': {'feat4': {'feat': 'Inspirational Caster', 'a1': 'CON'}, 'ic-feat4': ['Persuasion']}},
  'drop': {'feat4': None},
  'expect': [("(C.skills.find(s=>s.n==='Persuasion')||{}).p>=1", True)],
  'allow': ['^abilities\\.\\w+\\.bonus',
            '^features\\.',
            '^acts',
            '^actions\\.',
            '^hp',
            '^profSrc',
            '^defenses',
            '^saveNotes',
            '^skills\\.',
            '^profs\\.',
            '^lang',
            '^attacks\\.',
            '^ac\\.',
            '^dark',
            '^senses'],
  'base_allow': []},
 {'name': 'NEG U6 computed Inspirational Caster',
  'b': {'cls': 'Fighter', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'ch': {}},
  'expect': [("(C.skills.find(s=>s.n==='Persuasion')||{}).p>=1", False)],
  'base_allow': []}]

# U7 real feat effects that previously existed only as descriptive labels.
for name, ex in [
    ("Syndicate Spy", [("['Disguise Kit','Forgery Kit',\"Thieves' Tools\"].every(n=>C.profs.tools.includes(n))", True)]),
    ("Ace Pilot", [("((C.skills.find(s=>s.n==='Piloting')||{}).p||0)", 1)]),
    ("Gambler (Dark Matter)", [("C.defenses.some(x=>x.v==='Advantage on ability checks made for games of chance')", True)]),
    ("Lakshay: Oni", [("C.defenses.some(x=>x.v==='Advantage on Dexterity (Piloting) checks while operating a Battleframe')", True)]),
    ("Ley-Bound", [("C.defenses.some(x=>x.v==='Advantage on Wisdom (Survival) checks to track overland or forage for food and water')", True)]),
]:
    b=dict(cls="Fighter",level=4,base=WL,ch={"feat4":{"feat":name,"a1":"CHA"}})
    CASES.append(dict(name="Z3 U7 feat "+name,b=b,drop={"feat4":None},expect=ex,allow=FTA+[r"^skills\.",r"^profs\.",r"^attacks\.",r"^lang",r"^res\."],base_allow=FTA+[r"^skills\.",r"^profs\.",r"^attacks\.",r"^lang",r"^res\."]))
    CASES.append(dict(name="NEG U7 feat "+name,b=dict(b,ch={}),expect=[(expr,False if isinstance(want,bool) else 0) for expr,want in ex],base_allow=[]))

# U8 item powers. EQ and attunement gates are provided by the real item row.
for name, tid, fly in [("Mythallar Cloak","mythallar-cloak",30),("Ring of Spacewalking","zero-gravity",30),("Spacewalkers","zero-gravity",30)]:
    inv=[{"n":name,"q":1,"eq":True}]
    b=dict(cls="Wizard",level=4,base=WL,inv=inv)
    ex=[("Math.max(...(C.moves||[]).filter(x=>x.m==='fly').map(x=>x.v))",fly)]
    if name=="Mythallar Cloak": ex += [("C.attacks[0].xdice.filter(x=>x.d==='1d4'&&x.t==='Radiant').length",1),("C.res.find(x=>x.n==='Mythallar Cloak').max",10)]
    allowed=[r"^moves(?:\.|$)",r"^speedSrc$",r"^defenses(?:\.|$)",r"^attacks\.\d+\.(note|xdice.*)$",r"^fxToggles\.\d+\.on$"]
    CASES.append(dict(name="Z3 U8 item "+name,b=b,tog={tid:True},expect=ex,allow=allowed,base_allow=allowed+[r"^fxToggles(?:\.|$)"]))
    CASES.append(dict(name="NEG U8 unequipped "+name,b=dict(b,inv=[dict(inv[0],eq=False)]),tog={tid:True},expect=[("(C.moves||[]).some(x=>x.m==='fly')",False)],allow=[],base_allow=[]))
    CASES.append(dict(name="NEG U8 inactive "+name,b=b,expect=[("(C.moves||[]).some(x=>x.m==='fly')",False)],base_allow=[r"^fxToggles(?:\.|$)"]))
# Three earlier attuned items exhaust the slots. The cloak must not leak a switch or flight.
CASES.append(dict(name="NEG U8 Mythallar Cloak beyond attunement limit",b=dict(cls="Wizard",level=4,base=WL,inv=[{"n":n,"q":1,"eq":True} for n in ["Ring of Protection","Cloak of Protection","Amulet of Health","Mythallar Cloak"]]),tog={"mythallar-cloak":True},expect=[("(C.moves||[]).some(x=>x.m==='fly')",False)],allow=[],base_allow=[]))

# Phase 3 weaponGroups: an actual ranged group, not every weapon with a range.
GM_B=dict(cls="Wizard",level=4,base=WL,ch={"feat4":{"feat":"Gun-Mage Adept","a1":"DEX"}},inv=[{"n":n,"q":1,"eq":True} for n in ["Longbow","Longsword","Trident"]])
GM_FIELDS=[r"^profs\.weapons$",r"^profSrc\.weapons(?:\.|$)",r"^attacks\.\d+\.prof$"]
CASES += [
    dict(name="Z3 U9 ranged martial proficiency",b=GM_B,withoutGx=["Gun-Mage Adept","Ranged Weapon Proficiency",None,"feat"],expect=[("C.attacks.find(x=>x.n==='Longbow').prof",True),("C.attacks.find(x=>x.n==='Longsword').prof",False),("C.attacks.filter(x=>/Trident/.test(x.n)).every(x=>!x.prof)",True),("C.profs.weapons.includes('Ranged weapons (martial)')",True)],allow=GM_FIELDS,base_allow=GM_FIELDS),
    dict(name="NEG U9 no feat no ranged martial proficiency",b=dict(GM_B,ch={}),expect=[("C.attacks.find(x=>x.n==='Longbow').prof",False)],base_allow=[]),
    dict(name="NEG U9 below feat level",b=dict(GM_B,level=3),expect=[("C.attacks.find(x=>x.n==='Longbow').prof",False)],base_allow=[]),
    dict(name="NEG U9 2014 does not get 2024-only grant",b=dict(GM_B,rs="2014"),expect=[("C.attacks.find(x=>x.n==='Longbow').prof",False)],base_allow=[]),
]

# Audit correction: the same subclass name on another class must not acquire the effect.
CASES.append(dict(name="NEG U10 Artificer Mutagenist has no Alchemist Hyperelastic mutation",b=dict(cls="Artificer",sub="Mutagenist",level=10,base=WL),tog={"mutation-hyperelastic":True},expect=[("(C.fxToggles||[]).some(x=>x.id==='mutation-hyperelastic')",False),("C.attacks[0].range","5 ft")],allow=[],base_allow=[]))

CASES += [
    dict(name="Z3 U10 Alchemist mutation uses its own multiclass source level",b=dict(cls="Artificer",sub="Mutagenist",level=10,base=WL,extra={"src":{"core":True,"dmg":True,"efa":True,"tvss":True},"mc":[{"cls":"Alchemist","sub":"Mutagenist","lv":10}]}),tog={"mutation-hyperelastic":True},expect=[("C.attacks[0].range","10 ft")],allow=[r"^attacks\.0\.(range|note)$",r"^defenses(?:\.|$)",r"^saveNotes(?:\.|$)",r"^fxToggles\.\d+\.on$"],base_allow=[]),
    dict(name="NEG U10 Alchemist 9 does not borrow Artificer 10 for the mutation",b=dict(cls="Artificer",sub="Mutagenist",level=10,base=WL,extra={"src":{"core":True,"dmg":True,"efa":True,"tvss":True},"mc":[{"cls":"Alchemist","sub":"Mutagenist","lv":9}]}),tog={"mutation-hyperelastic":True},expect=[("(C.fxToggles||[]).some(x=>x.id==='mutation-hyperelastic')",False)],allow=[],base_allow=[]),
]

# U11 existing native grants, removed at the record level for the difference.
CASES += [{'name': 'Z3 U11 native sub|Cleric/Life Domain (2014)|Bonus Proficiency#1',
  'b': {'cls': 'Cleric',
        'sub': 'Life Domain (2014)',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.armor.includes('Heavy')", True)],
  'expectWithout': [("C.profs.armor.includes('Heavy')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['Life Domain (2014)', ['armor']]},
 {'name': 'Z3 U11 native sub|Cleric/Nature Domain|Bonus Proficiency#1',
  'b': {'cls': 'Cleric',
        'sub': 'Nature Domain',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.armor.includes('Heavy')", True)],
  'expectWithout': [("C.profs.armor.includes('Heavy')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['Nature Domain', ['armor']]},
 {'name': 'Z3 U11 native sub|Cleric/Tempest Domain|Bonus Proficiencies#1',
  'b': {'cls': 'Cleric',
        'sub': 'Tempest Domain',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.armor.includes('Heavy')", True), ("C.profs.weapons.includes('Martial')", True)],
  'expectWithout': [("C.profs.armor.includes('Heavy')", False), ("C.profs.weapons.includes('Martial')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['Tempest Domain', ['armor', 'weapons']]},
 {'name': 'Z3 U11 native sub|Cleric/War Domain (2014)|Bonus Proficiencies#1',
  'b': {'cls': 'Cleric',
        'sub': 'War Domain (2014)',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.armor.includes('Heavy')", True), ("C.profs.weapons.includes('Martial')", True)],
  'expectWithout': [("C.profs.armor.includes('Heavy')", False), ("C.profs.weapons.includes('Martial')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['War Domain (2014)', ['armor', 'weapons']]},
 {'name': 'Z3 U11 native sub|Cleric/Death Domain|Bonus Proficiency#1',
  'b': {'cls': 'Cleric',
        'sub': 'Death Domain',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.weapons.includes('Martial')", True)],
  'expectWithout': [("C.profs.weapons.includes('Martial')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['Death Domain', ['weapons']]},
 {'name': 'Z3 U11 native sub|Cleric/Solidarity Domain (PSA)|Bonus Proficiency#1',
  'b': {'cls': 'Cleric',
        'sub': 'Solidarity Domain (PSA)',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.armor.includes('Heavy')", True)],
  'expectWithout': [("C.profs.armor.includes('Heavy')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['Solidarity Domain (PSA)', ['armor']]},
 {'name': 'Z3 U11 native sub|Cleric/Strength Domain (PSA)|Bonus Proficiency#1',
  'b': {'cls': 'Cleric',
        'sub': 'Strength Domain (PSA)',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.armor.includes('Heavy')", True)],
  'expectWithout': [("C.profs.armor.includes('Heavy')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['Strength Domain (PSA)', ['armor']]},
 {'name': 'Z3 U11 native sub|Cleric/Zeal Domain (PSA)|Bonus Proficiencies#1',
  'b': {'cls': 'Cleric',
        'sub': 'Zeal Domain (PSA)',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.profs.armor.includes('Heavy')", True), ("C.profs.weapons.includes('Martial')", True)],
  'expectWithout': [("C.profs.armor.includes('Heavy')", False), ("C.profs.weapons.includes('Martial')", False)],
  'allow': ['^profs\\.(armor|weapons)$', '^profSrc\\.(armor|weapons)(?:\\.|$)'],
  'base_allow': [],
  'withoutGrant': ['Zeal Domain (PSA)', ['armor', 'weapons']]},
 {'name': 'Z3 U11 native sub|Cleric/Dragon Domain|Bonus Proficiency#1',
  'b': {'cls': 'Cleric',
        'sub': 'Dragon Domain',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(s=>s.n==='Arcana')||{}).p||0)", 2)],
  'expectWithout': [("((C.skills.find(s=>s.n==='Arcana')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$'],
  'base_allow': [],
  'withoutWx': ['Dragon Domain', 'Bonus Proficiency', ['skills', 'exp']]},
 {'name': 'Z3 U11 native sub|Cleric/Prophecy Domain|It Was Foretold#1',
  'b': {'cls': 'Cleric',
        'sub': 'Prophecy Domain',
        'level': 17,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.defenses.some(d=>d.s==='It Was Foretold'&&/Advantage.*Dexterity.*Perception.*Insight/i.test(d.v))", True)],
  'expectWithout': [("C.defenses.some(d=>d.s==='It Was Foretold'&&/Advantage.*Dexterity.*Perception.*Insight/i.test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ['Prophecy Domain', 'It Was Foretold', ['notes']]},
 {'name': 'Z3 U11 native sub|Cleric/Time Domain|Prescient Glimpses#1',
  'b': {'cls': 'Cleric',
        'sub': 'Time Domain',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(s=>s.n==='Insight')||{}).p||0)", 2), ("((C.skills.find(s=>s.n==='Perception')||{}).p||0)", 2)],
  'expectWithout': [("((C.skills.find(s=>s.n==='Insight')||{}).p||0)", 0),
                    ("((C.skills.find(s=>s.n==='Perception')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$'],
  'base_allow': [],
  'withoutWx': ['Time Domain', 'Prescient Glimpses', ['skills', 'exp']]},
 {'name': "Z3 U11 native sub|Craftsman/Trappers' Guild|Danger Sense#1",
  'b': {'cls': 'Craftsman',
        'sub': "Trappers' Guild",
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.defenses.some(d=>d.s==='Danger Sense'&&/Advantage.*Dexterity saving throws.*Incapacitated/i.test(d.v))", True)],
  'expectWithout': [("C.defenses.some(d=>d.s==='Danger Sense'&&/Advantage.*Dexterity saving throws.*Incapacitated/i.test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ["Trappers' Guild", 'Danger Sense', ['notes']]},
 {'name': "Z3 U11 native sub|Druid/Circle of the Land (2014)|Land's Stride#3",
  'b': {'cls': 'Druid',
        'sub': 'Circle of the Land (2014)',
        'level': 6,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [('C.defenses.some(d=>d.s==="Land\'s Stride"&&/Advantage.*saves against magical plants/i.test(d.v))', True)],
  'expectWithout': [('C.defenses.some(d=>d.s==="Land\'s Stride"&&/Advantage.*saves against magical plants/i.test(d.v))', False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ['Circle of the Land (2014)', "Land's Stride", ['notes']]},
 {'name': 'Z3 U11 native sub|Paladin/Oath of the Crown|Unyielding Spirit#1',
  'b': {'cls': 'Paladin',
        'sub': 'Oath of the Crown',
        'level': 15,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.defenses.some(d=>d.s==='Unyielding Spirit'&&/Advantage.*Paralyzed.*Stunned/i.test(d.v))", True)],
  'expectWithout': [("C.defenses.some(d=>d.s==='Unyielding Spirit'&&/Advantage.*Paralyzed.*Stunned/i.test(d.v))", False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ['Oath of the Crown', 'Unyielding Spirit', ['notes']]},
 {'name': 'Z3 U11 native sub|Ranger/Fey Wanderer (2014)|Beguiling Twist#1',
  'b': {'cls': 'Ranger',
        'sub': 'Fey Wanderer (2014)',
        'level': 7,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.defenses.some(d=>d.s==='Beguiling Twist'&&/Advantage.*Charmed.*Frightened/i.test(d.v))", True)],
  'expectWithout': [("C.defenses.some(d=>d.s==='Beguiling Twist'&&/Advantage.*Charmed.*Frightened/i.test(d.v))", False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ['Fey Wanderer (2014)', 'Beguiling Twist', ['notes']]},
 {'name': 'Z3 U11 native sub|Rogue/Scout|Ambush Master#1',
  'b': {'cls': 'Rogue', 'sub': 'Scout', 'level': 13, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.defenses.some(d=>d.s==='Ambush Master'&&/Advantage on Initiative rolls/i.test(d.v))", True)],
  'expectWithout': [("C.defenses.some(d=>d.s==='Ambush Master'&&/Advantage on Initiative rolls/i.test(d.v))", False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ['Scout', 'Ambush Master', ['notes']]},
 {'name': 'Z3 U11 native sub|Warlock/The Undying|Among the Dead#2',
  'b': {'cls': 'Warlock',
        'sub': 'The Undying',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.defenses.some(d=>d.s==='Among the Dead'&&/Advantage on saves against disease/i.test(d.v))", True)],
  'expectWithout': [("C.defenses.some(d=>d.s==='Among the Dead'&&/Advantage on saves against disease/i.test(d.v))", False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ['The Undying', 'Among the Dead', ['notes']]},
 {'name': 'Z3 U11 native sub|Wizard/School of Abjuration|Spell Resistance#1',
  'b': {'cls': 'Wizard',
        'sub': 'School of Abjuration',
        'level': 14,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'rs': '2014'},
  'expect': [("C.defenses.some(d=>d.s==='Spell Resistance'&&/Advantage on saves against spells/i.test(d.v))", True)],
  'expectWithout': [("C.defenses.some(d=>d.s==='Spell Resistance'&&/Advantage on saves against spells/i.test(d.v))", False)],
  'allow': ['^defenses(?:\\.|$)'],
  'base_allow': [],
  'withoutWx': ['School of Abjuration', 'Spell Resistance', ['notes']]},
 {'name': 'Z3 U11 native sub|Wizard/Blood Mage|Bonus Proficiency#1',
  'b': {'cls': 'Wizard',
        'sub': 'Blood Mage',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(s=>s.n==='Medicine')||{}).p||0)", 1)],
  'expectWithout': [("((C.skills.find(s=>s.n==='Medicine')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$'],
  'base_allow': [],
  'withoutWx': ['Blood Mage', 'Blood Savant', ['skills', 'exp']]},
 {'name': 'Z3 U11 native sub|Wizard/White Necromancer|Lore of Life and Death#1',
  'b': {'cls': 'Wizard',
        'sub': 'White Necromancer',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(s=>s.n==='Medicine')||{}).p||0)", 2), ("((C.skills.find(s=>s.n==='Religion')||{}).p||0)", 1)],
  'expectWithout': [("((C.skills.find(s=>s.n==='Medicine')||{}).p||0)", 0),
                    ("((C.skills.find(s=>s.n==='Religion')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$'],
  'base_allow': [],
  'withoutWx': ['White Necromancer', 'Lore of Life and Death', ['skills', 'exp']],
  'withoutGxFields': ['sub', 'White Necromancer', 'Lore of Life and Death', ['skillProf', 'skillExpert']]},
 {'name': 'Z3 U11 native sub|Wizard/Blood Magic (Deep Magic)|Bonus Proficiency#1',
  'b': {'cls': 'Wizard',
        'sub': 'Blood Magic (Deep Magic)',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(s=>s.n==='Medicine')||{}).p||0)", 1)],
  'expectWithout': [("((C.skills.find(s=>s.n==='Medicine')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$'],
  'base_allow': [],
  'withoutWx': ['Blood Magic (Deep Magic)', 'Blood Savant', ['skills', 'exp']]},
 {'name': 'NEG U11 Cleric without legacy subclass has no Heavy training',
  'b': {'cls': 'Cleric', 'level': 1, 'rs': '2014', 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.profs.armor.includes('Heavy')", False)],
  'base_allow': []}]

# U12 selected grants already supported by the builder.
CASES += [{'name': "Z3 U12 computed class|Warden|Sentinel's Stand#4",
  'b': {'cls': 'Warden',
        'level': 1,
        'ch': {'stand': ['Stalwart Spirit'], 'standSave': ['Dexterity']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'stand': ['Tower Shield'], 'standSave': None},
  'expect': [('!!C.saves.DEX', True)],
  'allow': ['^saves\\.DEX$', '^features\\.'],
  'base_allow': []},
 {'name': "NEG U12 computed class|Warden|Sentinel's Stand#4",
  'b': {'cls': 'Warden', 'level': 1, 'ch': {}, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [('!!C.saves.DEX', False)],
  'base_allow': []},
 {'name': 'Z3 U12 computed feat|Battlecaster|Battlecaster#6',
  'b': {'cls': 'Wizard',
        'level': 4,
        'ch': {'feat4': {'feat': 'Battlecaster', 'a1': 'INT'}, 'gx-wp-feat-feat4': ['Longsword']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'feat4': None, 'gx-wp-feat-feat4': None},
  'expect': [("C.profs.weapons.includes('Longsword')", True)],
  'allow': ['^profs\\.weapons$', '^profSrc\\.weapons(?:\\.|$)', '^features\\.', '^acts', '^actions\\.'],
  'base_allow': []},
 {'name': 'NEG U12 computed feat|Battlecaster|Battlecaster#6',
  'b': {'cls': 'Wizard', 'level': 4, 'ch': {}, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.profs.weapons.includes('Longsword')", False)],
  'base_allow': []},
 {'name': 'Z3 U12 computed feat|Woodwise|Woodwise#2',
  'b': {'cls': 'Wizard',
        'level': 4,
        'ch': {'feat4': {'feat': 'Woodwise', 'a1': 'WIS'}, 'gx-sk-feat-feat4': ['Survival']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'feat4': None, 'gx-sk-feat-feat4': None},
  'expect': [("((C.skills.find(x=>x.n==='Survival')||{}).p||0)", 1)],
  'allow': ['^skills\\.\\d+\\.(p|src)$', '^features\\.', '^acts', '^actions\\.'],
  'base_allow': []},
 {'name': 'NEG U12 computed feat|Woodwise|Woodwise#2',
  'b': {'cls': 'Wizard', 'level': 4, 'ch': {}, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(x=>x.n==='Survival')||{}).p||0)", 0)],
  'base_allow': []}]

# U14 independent consumable lifetimes, including an empty inventory.
CASES += [{'name': 'Z3 U14 consumed Climbing stock 1',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Climbing', 'q': 1, 'eq': False}]},
  'tog': {'consumed-climbing': True},
  'expect': [("(C.fxToggles||[]).find(x=>x.id==='consumed-climbing').consume.duration", '1 hour'),
             ("(C.moves||[]).filter(x=>x.m==='climb').map(x=>x.v)", [30])],
  'allow': ['^moves(?:\\.|$)', '^speedSrc$', '^fxToggles(?:\\.|$)', '^defenses(?:\\.|$)']},
 {'name': 'Z3 U14 consumed Climbing stock 0',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-climbing': True},
  'expect': [("(C.fxToggles||[]).find(x=>x.id==='consumed-climbing').consume.duration", '1 hour'),
             ("(C.moves||[]).filter(x=>x.m==='climb').map(x=>x.v)", [30])],
  'allow': ['^moves(?:\\.|$)', '^speedSrc$', '^fxToggles(?:\\.|$)', '^defenses(?:\\.|$)']},
 {'name': 'NEG U14 inactive Climbing stock 1',
  'b': {'cls': 'Wizard', 'level': 4, 'inv': [{'n': 'Potion of Climbing', 'q': 1, 'eq': False}]},
  'expect': [("(C.moves||[]).some(x=>x.m==='climb')", False),
             ("(C.defenses||[]).some(x=>/consumed item/.test(x.s||''))", False)]},
 {'name': 'NEG U14 inactive Climbing stock 0',
  'b': {'cls': 'Wizard', 'level': 4, 'inv': [{'n': 'Potion of Climbing', 'q': 0, 'eq': False}]},
  'expect': [("(C.moves||[]).some(x=>x.m==='climb')", False),
             ("(C.defenses||[]).some(x=>/consumed item/.test(x.s||''))", False)]},
 {'name': 'Z3 U14 consumed Flying stock 1',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Flying', 'q': 1, 'eq': False}]},
  'tog': {'consumed-flying': True},
  'expect': [("(C.fxToggles||[]).find(x=>x.id==='consumed-flying').consume.duration", '1 hour'),
             ("(C.moves||[]).filter(x=>x.m==='fly').map(x=>x.v)", [30])],
  'allow': ['^moves(?:\\.|$)', '^speedSrc$', '^fxToggles(?:\\.|$)', '^defenses(?:\\.|$)']},
 {'name': 'Z3 U14 consumed Flying stock 0',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-flying': True},
  'expect': [("(C.fxToggles||[]).find(x=>x.id==='consumed-flying').consume.duration", '1 hour'),
             ("(C.moves||[]).filter(x=>x.m==='fly').map(x=>x.v)", [30])],
  'allow': ['^moves(?:\\.|$)', '^speedSrc$', '^fxToggles(?:\\.|$)', '^defenses(?:\\.|$)']},
 {'name': 'NEG U14 inactive Flying stock 1',
  'b': {'cls': 'Wizard', 'level': 4, 'inv': [{'n': 'Potion of Flying', 'q': 1, 'eq': False}]},
  'expect': [("(C.moves||[]).some(x=>x.m==='fly')", False), ("(C.defenses||[]).some(x=>/consumed item/.test(x.s||''))", False)]},
 {'name': 'NEG U14 inactive Flying stock 0',
  'b': {'cls': 'Wizard', 'level': 4, 'inv': [{'n': 'Potion of Flying', 'q': 0, 'eq': False}]},
  'expect': [("(C.moves||[]).some(x=>x.m==='fly')", False), ("(C.defenses||[]).some(x=>/consumed item/.test(x.s||''))", False)]},
 {'name': 'Z3 U14 consumed Invulnerability stock 1',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Invulnerability', 'q': 1, 'eq': False}]},
  'tog': {'consumed-invulnerability': True},
  'expect': [("(C.fxToggles||[]).find(x=>x.id==='consumed-invulnerability').consume.duration", '1 minute'),
             ("C.defenses.filter(x=>x.t==='Resistance').map(x=>x.v).join(' ').includes('Force')", True)],
  'allow': ['^moves(?:\\.|$)', '^speedSrc$', '^fxToggles(?:\\.|$)', '^defenses(?:\\.|$)']},
 {'name': 'Z3 U14 consumed Invulnerability stock 0',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-invulnerability': True},
  'expect': [("(C.fxToggles||[]).find(x=>x.id==='consumed-invulnerability').consume.duration", '1 minute'),
             ("C.defenses.filter(x=>x.t==='Resistance').map(x=>x.v).join(' ').includes('Force')", True)],
  'allow': ['^moves(?:\\.|$)', '^speedSrc$', '^fxToggles(?:\\.|$)', '^defenses(?:\\.|$)']},
 {'name': 'NEG U14 inactive Invulnerability stock 1',
  'b': {'cls': 'Wizard', 'level': 4, 'inv': [{'n': 'Potion of Invulnerability', 'q': 1, 'eq': False}]},
  'expect': [("(C.moves||[]).some(x=>x.m==='fly')", False), ("(C.defenses||[]).some(x=>/consumed item/.test(x.s||''))", False)]},
 {'name': 'NEG U14 inactive Invulnerability stock 0',
  'b': {'cls': 'Wizard', 'level': 4, 'inv': [{'n': 'Potion of Invulnerability', 'q': 0, 'eq': False}]},
  'expect': [("(C.moves||[]).some(x=>x.m==='fly')", False), ("(C.defenses||[]).some(x=>/consumed item/.test(x.s||''))", False)]}]

CASES += [dict(c, name=c["name"]+" 2014", b=dict(c["b"], rs="2014")) for c in CASES if "U14" in c["name"]]

# U15 reuses the consumed-effect source for ability settings and damage riders.
CASES += [{'name': 'Z3 U15 Potion of Giant Strength (cloud)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (cloud)', 'q': 2, 'eq': True}]},
  'tog': {'consumed-giant-cloud': True},
  'allow': ['^abilities\\.STR(?:\\.|$)', '^attacks\\.', '^fxToggles\\.'],
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 27)]},
 {'name': 'NEG U15 Potion of Giant Strength (cloud)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (cloud)', 'q': 2, 'eq': True}]},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 10)]},
 {'name': 'NEG U15 higher Strength cloud',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 30, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-giant-cloud': True},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 30)],
  'allow': ['^fxToggles(?:\\.|$)']},
 {'name': 'Z3 U15 Potion of Giant Strength (fire)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (fire)', 'q': 2, 'eq': True}]},
  'tog': {'consumed-giant-fire': True},
  'allow': ['^abilities\\.STR(?:\\.|$)', '^attacks\\.', '^fxToggles\\.'],
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 25)]},
 {'name': 'NEG U15 Potion of Giant Strength (fire)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (fire)', 'q': 2, 'eq': True}]},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 10)]},
 {'name': 'NEG U15 higher Strength fire',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 30, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-giant-fire': True},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 30)],
  'allow': ['^fxToggles(?:\\.|$)']},
 {'name': 'Z3 U15 Potion of Giant Strength (frost)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (frost)', 'q': 2, 'eq': True}]},
  'tog': {'consumed-giant-frost': True},
  'allow': ['^abilities\\.STR(?:\\.|$)', '^attacks\\.', '^fxToggles\\.'],
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 23)]},
 {'name': 'NEG U15 Potion of Giant Strength (frost)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (frost)', 'q': 2, 'eq': True}]},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 10)]},
 {'name': 'NEG U15 higher Strength frost',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 30, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-giant-frost': True},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 30)],
  'allow': ['^fxToggles(?:\\.|$)']},
 {'name': 'Z3 U15 Potion of Giant Strength (hill)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (hill)', 'q': 2, 'eq': True}]},
  'tog': {'consumed-giant-hill': True},
  'allow': ['^abilities\\.STR(?:\\.|$)', '^attacks\\.', '^fxToggles\\.'],
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 21)]},
 {'name': 'NEG U15 Potion of Giant Strength (hill)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (hill)', 'q': 2, 'eq': True}]},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 10)]},
 {'name': 'NEG U15 higher Strength hill',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 30, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-giant-hill': True},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 30)],
  'allow': ['^fxToggles(?:\\.|$)']},
 {'name': 'Z3 U15 Potion of Giant Strength (stone)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (stone)', 'q': 2, 'eq': True}]},
  'tog': {'consumed-giant-stone': True},
  'allow': ['^abilities\\.STR(?:\\.|$)', '^attacks\\.', '^fxToggles\\.'],
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 23)]},
 {'name': 'NEG U15 Potion of Giant Strength (stone)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (stone)', 'q': 2, 'eq': True}]},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 10)]},
 {'name': 'NEG U15 higher Strength stone',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 30, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-giant-stone': True},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 30)],
  'allow': ['^fxToggles(?:\\.|$)']},
 {'name': 'Z3 U15 Potion of Giant Strength (storm)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (storm)', 'q': 2, 'eq': True}]},
  'tog': {'consumed-giant-storm': True},
  'allow': ['^abilities\\.STR(?:\\.|$)', '^attacks\\.', '^fxToggles\\.'],
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 29)]},
 {'name': 'NEG U15 Potion of Giant Strength (storm)',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Giant Strength (storm)', 'q': 2, 'eq': True}]},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 10)]},
 {'name': 'NEG U15 higher Strength storm',
  'b': {'cls': 'Wizard', 'level': 4, 'base': {'STR': 30, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'inv': []},
  'tog': {'consumed-giant-storm': True},
  'expect': [('(C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0))', 30)],
  'allow': ['^fxToggles(?:\\.|$)']},
 {'name': 'Z3 U15 Pugilism',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Pugilism', 'q': 1, 'eq': False}, {'n': 'Longsword', 'q': 1, 'eq': True}]},
  'tog': {'consumed-pugilism': True},
  'allow': ['^attacks\\.0\\.(note|xdice)(?:\\.|$)', '^fxToggles\\.'],
  'expect': [("(C.attacks[0].xdice||[]).filter(x=>x.d==='1d6'&&x.t==='Force').length", 1),
             ('(C.attacks[1].xdice||[]).length', 0)]},
 {'name': 'NEG U15 Pugilism',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Potion of Pugilism', 'q': 1, 'eq': False}, {'n': 'Longsword', 'q': 1, 'eq': True}]},
  'expect': [("(C.attacks[0].xdice||[]).filter(x=>x.d==='1d6'&&x.t==='Force').length", 0),
             ('(C.attacks[1].xdice||[]).length', 0)]}]

CASES += [dict(name="Z3 U14 flight follows changed Speed after consumption", b=dict(cls="Monk",level=2,base=WL,inv=[]), tog={"consumed-flying":True}, expect=[("C.speed",40),("C.moves.find(x=>x.m==='fly').v",40)], allow=[r"^moves(?:\.|$)",r"^speedSrc$",r"^fxToggles(?:\.|$)",r"^defenses(?:\.|$)"]),
 dict(name="Z3 U15 multiple bottles and strength settings never stack", b=dict(cls="Wizard",level=4,base=WL,inv=[dict(n="Potion of Giant Strength (hill)",q=3,eq=True),dict(n="Potion of Giant Strength (cloud)",q=2,eq=True)]),tog={"consumed-giant-hill":True,"consumed-giant-cloud":True},expect=[("C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0)",27),("C.fxToggles.filter(x=>x.on).length",2)],allow=[r"^abilities\.STR(?:\.|$)",r"^attacks\.",r"^fxToggles\."])]

# Legacy cleric grants start at level 1, independently of merged feature rows.
CASES += [dict(c, name=c["name"]+" legacy level 1", b=dict(c["b"],level=1)) for c in CASES if c["name"].startswith("Z3 U11") and "withoutGrant" in c]

# Item cross-reference indexes warm lazily on the first Giant Strength description.
for c in CASES:
    if "U15" in c["name"]:
        c["warm"] = True

# U16 existing tool and skill picks.
CASES += [{'name': 'Z3 U16 native pick sub|Barbarian/Path of Heavy Metal|Rocker#1',
  'b': {'cls': 'Barbarian',
        'sub': 'Path of Heavy Metal',
        'level': 3,
        'ch': {'gx-inst-sub-Path of Heavy Metal': ['Lute', 'Flute', 'Lyre']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-inst-sub-Path of Heavy Metal': None},
  'expect': [("C.profs.tools.includes('Lute')", True),
             ("C.profs.tools.includes('Flute')", True),
             ("C.profs.tools.includes('Lyre')", True)],
  'expectWithout': [("C.profs.tools.includes('Lute')", False),
                    ("C.profs.tools.includes('Flute')", False),
                    ("C.profs.tools.includes('Lyre')", False)],
  'allow': ['^profs\\.tools$', '^profSrc\\.tools(?:\\.|$)', '^features\\.']},
 {'name': 'NEG U16 below level Path of Heavy Metal',
  'b': {'cls': 'Barbarian',
        'sub': 'Path of Heavy Metal',
        'level': 2,
        'ch': {'gx-inst-sub-Path of Heavy Metal': ['Lute', 'Flute', 'Lyre']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.profs.tools.includes('Lute')", False)]},
 {'name': 'Z3 U16 native pick sub|Bard/College of Entropy|Bonus Proficiencies#1',
  'b': {'cls': 'Bard',
        'sub': 'College of Entropy',
        'level': 3,
        'ch': {'gx-game-sub-College of Entropy': ['Dice Set']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-game-sub-College of Entropy': None},
  'expect': [("C.profs.tools.includes('Dice Set')", True),
             ("((C.skills.find(x=>x.n==='Acrobatics')||{}).p||0)", 1),
             ("((C.skills.find(x=>x.n==='Athletics')||{}).p||0)", 1)],
  'expectWithout': [("C.profs.tools.includes('Dice Set')", False),
                    ("((C.skills.find(x=>x.n==='Acrobatics')||{}).p||0)", 0),
                    ("((C.skills.find(x=>x.n==='Athletics')||{}).p||0)", 0)],
  'allow': ['^profs\\.tools$', '^profSrc\\.tools(?:\\.|$)', '^features\\.', '^skills\\.\\d+\\.(p|src)$'],
  'withoutWx': ['College of Entropy', 'Bonus Proficiencies', ['skills']]},
 {'name': 'NEG U16 below level College of Entropy',
  'b': {'cls': 'Bard',
        'sub': 'College of Entropy',
        'level': 2,
        'ch': {'gx-game-sub-College of Entropy': ['Dice Set']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.profs.tools.includes('Dice Set')", False)]},
 {'name': 'Z3 U16 native pick sub|Bard/Entropy|Bonus Proficiencies#1',
  'b': {'cls': 'Bard',
        'sub': 'Entropy',
        'level': 3,
        'ch': {'gx-game-sub-Entropy': ['Dice Set']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-game-sub-Entropy': None},
  'expect': [("C.profs.tools.includes('Dice Set')", True),
             ("((C.skills.find(x=>x.n==='Acrobatics')||{}).p||0)", 1),
             ("((C.skills.find(x=>x.n==='Athletics')||{}).p||0)", 1)],
  'expectWithout': [("C.profs.tools.includes('Dice Set')", False),
                    ("((C.skills.find(x=>x.n==='Acrobatics')||{}).p||0)", 0),
                    ("((C.skills.find(x=>x.n==='Athletics')||{}).p||0)", 0)],
  'allow': ['^profs\\.tools$', '^profSrc\\.tools(?:\\.|$)', '^features\\.', '^skills\\.\\d+\\.(p|src)$'],
  'withoutWx': ['Entropy', 'Bonus Proficiencies', ['skills']]},
 {'name': 'NEG U16 below level Entropy',
  'b': {'cls': 'Bard',
        'sub': 'Entropy',
        'level': 2,
        'ch': {'gx-game-sub-Entropy': ['Dice Set']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("C.profs.tools.includes('Dice Set')", False)]},
 {'name': 'Z3 U16 native pick sub|Dancer/Mime|Silent Routine#4',
  'b': {'cls': 'Dancer',
        'sub': 'Mime',
        'level': 3,
        'ch': {'gx-sk-sub-Mime': ['Stealth']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-sk-sub-Mime': None},
  'expect': [("((C.skills.find(x=>x.n==='Stealth')||{}).p||0)", 1)],
  'expectWithout': [("((C.skills.find(x=>x.n==='Stealth')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$', '^features\\.']},
 {'name': 'NEG U16 below level Mime',
  'b': {'cls': 'Dancer',
        'sub': 'Mime',
        'level': 2,
        'ch': {'gx-sk-sub-Mime': ['Stealth']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(x=>x.n==='Stealth')||{}).p||0)", 0)]},
 {'name': 'Z3 U16 native pick sub|Warmage/House of Bishops|Arcane Study#1',
  'b': {'cls': 'Warmage',
        'sub': 'House of Bishops',
        'level': 3,
        'ch': {'gx-sk-sub-House of Bishops': ['Arcana', 'History']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-sk-sub-House of Bishops': None},
  'expect': [("((C.skills.find(x=>x.n==='Arcana')||{}).p||0)", 1), ("((C.skills.find(x=>x.n==='History')||{}).p||0)", 1)],
  'expectWithout': [("((C.skills.find(x=>x.n==='Arcana')||{}).p||0)", 0), ("((C.skills.find(x=>x.n==='History')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$', '^features\\.']},
 {'name': 'NEG U16 below level House of Bishops',
  'b': {'cls': 'Warmage',
        'sub': 'House of Bishops',
        'level': 2,
        'ch': {'gx-sk-sub-House of Bishops': ['Arcana', 'History']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(x=>x.n==='Arcana')||{}).p||0)", 0)]},
 {'name': 'Z3 U16 native pick sub|Wizard/Materializer|Arcane Artisan#5',
  'b': {'cls': 'Wizard',
        'sub': 'Materializer',
        'level': 3,
        'ch': {'gx-t-sub-Materializer': ["Smith's Tools", "Weaver's Tools", "Woodcarver's Tools"]},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-t-sub-Materializer': None},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', True),
             ('C.profs.tools.includes("Weaver\'s Tools")', True),
             ('C.profs.tools.includes("Woodcarver\'s Tools")', True)],
  'expectWithout': [('C.profs.tools.includes("Smith\'s Tools")', False),
                    ('C.profs.tools.includes("Weaver\'s Tools")', False),
                    ('C.profs.tools.includes("Woodcarver\'s Tools")', False)],
  'allow': ['^profs\\.tools$', '^profSrc\\.tools(?:\\.|$)', '^features\\.']},
 {'name': 'NEG U16 below level Materializer',
  'b': {'cls': 'Wizard',
        'sub': 'Materializer',
        'level': 2,
        'ch': {'gx-t-sub-Materializer': ["Smith's Tools", "Weaver's Tools", "Woodcarver's Tools"]},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', False)]},
 {'name': 'Z3 U16 native pick sub|Wizard/Master of Fiends|Fiendish Presence#1',
  'b': {'cls': 'Wizard',
        'sub': 'Master of Fiends',
        'level': 3,
        'ch': {'gx-fp-sub-Master of Fiends': ['Persuasion']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-fp-sub-Master of Fiends': None},
  'expect': [("((C.skills.find(x=>x.n==='Persuasion')||{}).p||0)", 1)],
  'expectWithout': [("((C.skills.find(x=>x.n==='Persuasion')||{}).p||0)", 0)],
  'allow': ['^skills\\.\\d+\\.(p|src)$', '^features\\.']},
 {'name': 'NEG U16 below level Master of Fiends',
  'b': {'cls': 'Wizard',
        'sub': 'Master of Fiends',
        'level': 2,
        'ch': {'gx-fp-sub-Master of Fiends': ['Persuasion']},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [("((C.skills.find(x=>x.n==='Persuasion')||{}).p||0)", 0)]},
 {'name': 'Z3 U16 native pick sub|Wizard/Ring Warden|Bonus Proficiency#1',
  'b': {'cls': 'Wizard',
        'sub': 'Ring Warden',
        'level': 3,
        'ch': {'gx-rwtool-sub-Ring Warden': ["Smith's Tools"]},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'drop': {'gx-rwtool-sub-Ring Warden': None},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', True)],
  'expectWithout': [('C.profs.tools.includes("Smith\'s Tools")', False)],
  'allow': ['^profs\\.tools$', '^profSrc\\.tools(?:\\.|$)', '^features\\.']},
 {'name': 'NEG U16 below level Ring Warden',
  'b': {'cls': 'Wizard',
        'sub': 'Ring Warden',
        'level': 2,
        'ch': {'gx-rwtool-sub-Ring Warden': ["Smith's Tools"]},
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [('C.profs.tools.includes("Smith\'s Tools")', False)]}]

for c in CASES:
    if "U16" in c["name"] and "Entropy" in c["name"]:
        c["b"]["extra"] = {"bg":"Acolyte"}
        if "allow" in c:
            c["allow"].append(r"^skills\.\d+\.(misc|miscSrc)$")

# U17 scoped benefits and small source-level extensions.
CASES += [{'name': 'Z3 U17 Jaeger Seasoned Survivor',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Jaeger', 'level': 4},
  'expect': [("C.defenses.some(d=>d.s.includes('Seasoned Survivor')&&new RegExp('secret passages.*markings.*blood "
              "stains','i').test(d.v))",
              True)],
  'withoutGxFields': ['cls', 'Jaeger', 'Seasoned Survivor', ['advOn']],
  'expectWithout': [("C.defenses.some(d=>d.s.includes('Seasoned Survivor')&&new RegExp('secret passages.*markings.*blood "
                     "stains','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U17 Jaeger below source level',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Jaeger', 'level': 3},
  'expect': [("C.defenses.some(d=>d.s.includes('Seasoned Survivor')&&new RegExp('secret passages.*markings.*blood "
              "stains','i').test(d.v))",
              False)]},
 {'name': 'Z3 U17 AI choice count 1',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 1},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 1)]},
 {'name': 'Z3 U17 AI choice count 4',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 4},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 1)]},
 {'name': 'Z3 U17 AI choice count 5',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 5},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 2)]},
 {'name': 'Z3 U17 AI choice count 8',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 8},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 2)]},
 {'name': 'Z3 U17 AI choice count 9',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 9},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 3)]},
 {'name': 'Z3 U17 AI choice count 11',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 11},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 3)]},
 {'name': 'Z3 U17 AI choice count 12',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 12},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 4)]},
 {'name': 'Z3 U17 AI choice count 16',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 16},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 4)]},
 {'name': 'Z3 U17 AI choice count 17',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 17},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 5)]},
 {'name': 'Z3 U17 AI choice count 20',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 20},
  'expect': [("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer').n", 5)]},
 {'name': 'Z3 U17 AI selected skill Advantage only',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Gadgeteer',
        'level': 1,
        'ch': {'gx-ai-cls-Gadgeteer': ['Technology']}},
  'expect': [("C.defenses.some(d=>d.s.includes('AI Companion')&&new RegExp('Intelligence \\\\(Technology\\\\) "
              "checks','i').test(d.v))",
              True),
             ("C.skills.some(x=>x.n==='Technology'&&x.p>0)", False)],
  'drop': {'gx-ai-cls-Gadgeteer': None},
  'expectWithout': [("C.defenses.some(d=>d.s.includes('AI Companion')&&new RegExp('Intelligence \\\\(Technology\\\\) "
                     "checks','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U17 AI no selected skill',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Gadgeteer', 'level': 1},
  'expect': [("C.defenses.some(d=>d.s.includes('AI Companion')&&new RegExp('Intelligence \\\\(Technology\\\\) "
              "checks','i').test(d.v))",
              False)]},
 {'name': 'Z3 U17 AI multiclass uses own level and suffix',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 14,
        'extra': {'mc': [{'cls': 'Gadgeteer', 'lv': 1, 'sub': ''}]},
        'ch': {'gx-ai-cls-Gadgeteer-m0': ['Technology']}},
  'expect': [("C.defenses.some(d=>d.s.includes('AI Companion')&&new RegExp('Intelligence \\\\(Technology\\\\) "
              "checks','i').test(d.v))",
              True),
             ("__bldChoiceList(__zmB).find(x=>x.key==='gx-ai-cls-Gadgeteer-m0').n", 1)],
  'drop': {'gx-ai-cls-Gadgeteer-m0': None},
  'expectWithout': [("C.defenses.some(d=>d.s.includes('AI Companion')&&new RegExp('Intelligence \\\\(Technology\\\\) "
                     "checks','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'Z3 U17 Samurai new Wisdom',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Fighter',
        'sub': 'Samurai',
        'level': 7,
        'ch': {}},
  'expect': [('!!C.saves.WIS', True), ('!!C.saves.INT', False)],
  'withoutGxFields': ['sub', 'Samurai', 'Elegant Courtier', ['savePE']],
  'expectWithout': [('!!C.saves.WIS', False)],
  'allow': ['^saves\\.(WIS|INT)$']},
 {'name': 'Z3 U17 Samurai alternate ignored without prior Wisdom',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Fighter',
        'sub': 'Samurai',
        'level': 7,
        'ch': {'gx-courtier-save-sub-Samurai': ['Intelligence']}},
  'expect': [('!!C.saves.WIS', True), ('!!C.saves.INT', False)],
  'withoutGxFields': ['sub', 'Samurai', 'Elegant Courtier', ['savePE']],
  'expectWithout': [('!!C.saves.WIS', False)],
  'allow': ['^saves\\.(WIS|INT)$']},
 {'name': 'Z3 U17 Samurai Resilient replacement',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Fighter',
        'sub': 'Samurai',
        'level': 7,
        'ch': {'gx-courtier-save-sub-Samurai': ['Intelligence'], 'feat4': {'feat': 'Resilient', 'a1': 'WIS'}}},
  'expect': [('!!C.saves.INT', True), ('!!C.saves.INT', True)],
  'withoutGxFields': ['sub', 'Samurai', 'Elegant Courtier', ['savePE']],
  'expectWithout': [('!!C.saves.INT', False)],
  'allow': ['^saves\\.(WIS|INT)$']},
 {'name': 'NEG U17 Samurai below source level',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Fighter',
        'sub': 'Samurai',
        'level': 6,
        'ch': {'gx-courtier-save-sub-Samurai': ['Intelligence']}},
  'expect': [('!!C.saves.WIS', False), ('!!C.saves.INT', False)]},
 {'name': 'Z3 U17 Samurai multiclass replacement',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Cleric',
        'level': 1,
        'extra': {'mc': [{'cls': 'Fighter', 'sub': 'Samurai', 'lv': 7}]},
        'ch': {'gx-courtier-save-sub-Samurai-m0': ['Intelligence']}},
  'expect': [('!!C.saves.INT', True), ("C.saves.WIS.includes('Cleric')", True)],
  'withoutGxFields': ['sub', 'Samurai', 'Elegant Courtier', ['savePE']],
  'expectWithout': [('!!C.saves.INT', False)],
  'allow': ['^saves\\.INT$']},
 {'name': 'NEG U17 Samurai cannot borrow primary levels',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Cleric',
        'level': 14,
        'extra': {'mc': [{'cls': 'Fighter', 'sub': 'Samurai', 'lv': 6}]},
        'ch': {'gx-courtier-save-sub-Samurai-m0': ['Intelligence']}},
  'expect': [('!!C.saves.INT', False)]},
 {'name': 'Z3 U17 property filtered Steel Magic',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Witch',
        'sub': 'Steel Magic',
        'level': 3,
        'inv': [{'n': 'Rapier', 'q': 1, 'eq': True},
                {'n': 'Hand Crossbow', 'q': 1, 'eq': True},
                {'n': 'Greatsword', 'q': 1, 'eq': True},
                {'n': 'Longbow', 'q': 1, 'eq': True},
                {'n': 'Lance', 'q': 1, 'eq': True}]},
  'expect': [("C.attacks.find(x=>x.n==='Rapier').prof", True),
             ("C.attacks.find(x=>x.n==='Hand Crossbow').prof", True),
             ("C.attacks.find(x=>x.n==='Greatsword').prof", False),
             ("C.attacks.find(x=>x.n==='Longbow').prof", False),
             ("C.attacks.find(x=>x.n==='Lance').prof", True)],
  'withoutGxFields': ['sub', 'Steel Magic', 'Martial Training', ['weaponGroups']],
  'expectWithout': [("C.attacks.find(x=>x.n==='Rapier').prof", False),
                    ("C.attacks.find(x=>x.n==='Hand Crossbow').prof", False),
                    ("C.attacks.find(x=>x.n==='Lance').prof", False)],
  'allow': ['^profs\\.weapons$', '^profSrc\\.weapons(?:\\.|$)', '^attacks\\.\\d+\\.prof$']},
 {'name': 'NEG U17 property filtered below level Steel Magic',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Witch',
        'sub': 'Steel Magic',
        'level': 2,
        'inv': [{'n': 'Rapier', 'q': 1, 'eq': True},
                {'n': 'Hand Crossbow', 'q': 1, 'eq': True},
                {'n': 'Greatsword', 'q': 1, 'eq': True},
                {'n': 'Longbow', 'q': 1, 'eq': True},
                {'n': 'Lance', 'q': 1, 'eq': True}]},
  'expect': [("C.attacks.find(x=>x.n==='Rapier').prof", False)]},
 {'name': 'Z3 U17 property filtered Lumimancer',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'sub': 'Lumimancer',
        'level': 3,
        'inv': [{'n': 'Rapier', 'q': 1, 'eq': True},
                {'n': 'Hand Crossbow', 'q': 1, 'eq': True},
                {'n': 'Greatsword', 'q': 1, 'eq': True},
                {'n': 'Longbow', 'q': 1, 'eq': True},
                {'n': 'Lance', 'q': 1, 'eq': True}]},
  'expect': [("C.attacks.find(x=>x.n==='Rapier').prof", True),
             ("C.attacks.find(x=>x.n==='Hand Crossbow').prof", False),
             ("C.attacks.find(x=>x.n==='Greatsword').prof", False),
             ("C.attacks.find(x=>x.n==='Longbow').prof", False),
             ("C.attacks.find(x=>x.n==='Lance').prof", False)],
  'withoutGxFields': ['sub', 'Lumimancer', 'Martial Training', ['weaponGroups']],
  'expectWithout': [("C.attacks.find(x=>x.n==='Rapier').prof", False)],
  'allow': ['^profs\\.weapons$', '^profSrc\\.weapons(?:\\.|$)', '^attacks\\.\\d+\\.prof$']},
 {'name': 'NEG U17 property filtered below level Lumimancer',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'sub': 'Lumimancer',
        'level': 2,
        'inv': [{'n': 'Rapier', 'q': 1, 'eq': True},
                {'n': 'Hand Crossbow', 'q': 1, 'eq': True},
                {'n': 'Greatsword', 'q': 1, 'eq': True},
                {'n': 'Longbow', 'q': 1, 'eq': True},
                {'n': 'Lance', 'q': 1, 'eq': True}]},
  'expect': [("C.attacks.find(x=>x.n==='Rapier').prof", False)]},
 {'name': 'Z3 U17 Pawn martial promotion',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Warmage',
        'sub': 'House of Pawns',
        'level': 3},
  'expect': [("C.profs.weapons.includes('Martial')", True),
             ("C.profs.armor.includes('Medium')&&C.profs.armor.includes('Shields')", True)],
  'tog': {'pawn-martial-training': True},
  'allow': ['^profs\\.(weapons|armor)$', '^profSrc\\.(weapons|armor)(?:\\.|$)', '^fxToggles\\.']},
 {'name': 'NEG U17 Pawn inactive promotion',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Warmage',
        'sub': 'House of Pawns',
        'level': 3},
  'expect': [("C.profs.weapons.includes('Martial')", False),
             ("C.profs.armor.includes('Medium')&&C.profs.armor.includes('Shields')", False)]},
 {'name': 'NEG U17 Pawn below source level',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Warmage',
        'sub': 'House of Pawns',
        'level': 2},
  'expect': [("C.profs.weapons.includes('Martial')", False)],
  'tog': {'pawn-martial-training': True},
  'allow': []},
 {'name': 'Z3 U17 metamorphosis Darkvision',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'ch': {'feat4': {'feat': 'Changeling Metamorphosis', 'a1': 'DEX'}},
        'extra': {'species': 'Human'}},
  'expect': [('C.darkvision', 60)],
  'tog': {'metamorph-darkvision': True},
  'allow': ['^darkvision$', '^darkSrc$', '^fxToggles\\.']},
 {'name': 'NEG U17 metamorphosis option inactive',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'ch': {'feat4': {'feat': 'Changeling Metamorphosis', 'a1': 'DEX'}},
        'extra': {'species': 'Human'}},
  'expect': [('C.darkvision', 0)]},
 {'name': "Z3 U17 item Baba Yaga's Mortar and Pestle",
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': "Baba Yaga's Mortar and Pestle", 'q': 1, 'eq': True}]},
  'expect': [('C.defenses.some(d=>d.s.includes("Baba Yaga\'s Mortar and Pestle")&&new RegExp(\'artifact as '
              "Alchemist.*Poisoner','i').test(d.v))",
              True)],
  'withoutGxFields': ['item', "Baba Yaga's Mortar and Pestle", "Baba Yaga's Mortar and Pestle", ['advOn']],
  'expectWithout': [('C.defenses.some(d=>d.s.includes("Baba Yaga\'s Mortar and Pestle")&&new RegExp(\'artifact as '
                     "Alchemist.*Poisoner','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': "NEG U17 item absent Baba Yaga's Mortar and Pestle",
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [('C.defenses.some(d=>d.s.includes("Baba Yaga\'s Mortar and Pestle")&&new RegExp(\'artifact as '
              "Alchemist.*Poisoner','i').test(d.v))",
              False)]},
 {'name': "Z3 U17 item Ephara's Votary",
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': "Ephara's Votary", 'q': 1, 'eq': True}]},
  'expect': [('C.defenses.some(d=>d.s.includes("Ephara\'s Votary")&&new RegExp(\'Persuasion.*city.*piety.*10\',\'i\').test(d.v))',
              True)],
  'withoutGxFields': ['item', "Ephara's Votary", "Ephara's Votary", ['advOn']],
  'expectWithout': [('C.defenses.some(d=>d.s.includes("Ephara\'s Votary")&&new '
                     "RegExp('Persuasion.*city.*piety.*10','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': "NEG U17 item absent Ephara's Votary",
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [('C.defenses.some(d=>d.s.includes("Ephara\'s Votary")&&new RegExp(\'Persuasion.*city.*piety.*10\',\'i\').test(d.v))',
              False)]},
 {'name': 'Z3 U17 item Eyes of the Impossible',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Eyes of the Impossible', 'q': 1, 'eq': True}]},
  'expect': [("C.defenses.some(d=>d.s.includes('Eyes of the Impossible')&&new RegExp('Persuasion.*evil "
              "creatures','i').test(d.v))",
              True)],
  'withoutGxFields': ['item', 'Eyes of the Impossible', 'Eyes of the Impossible', ['advOn']],
  'expectWithout': [("C.defenses.some(d=>d.s.includes('Eyes of the Impossible')&&new RegExp('Persuasion.*evil "
                     "creatures','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U17 item absent Eyes of the Impossible',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [("C.defenses.some(d=>d.s.includes('Eyes of the Impossible')&&new RegExp('Persuasion.*evil "
              "creatures','i').test(d.v))",
              False)]},
 {'name': "Z3 U17 item Habbakuk's Blessing",
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': "Habbakuk's Blessing", 'q': 1, 'eq': True}]},
  'expect': [('C.defenses.some(d=>d.s.includes("Habbakuk\'s Blessing")&&new RegExp(\'Survival.*Wash.*chasms\',\'i\').test(d.v))',
              True)],
  'withoutGxFields': ['item', "Habbakuk's Blessing", "Habbakuk's Blessing", ['advOn']],
  'expectWithout': [('C.defenses.some(d=>d.s.includes("Habbakuk\'s Blessing")&&new '
                     "RegExp('Survival.*Wash.*chasms','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': "NEG U17 item absent Habbakuk's Blessing",
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [('C.defenses.some(d=>d.s.includes("Habbakuk\'s Blessing")&&new RegExp(\'Survival.*Wash.*chasms\',\'i\').test(d.v))',
              False)]},
 {'name': 'Z3 U17 item Ring of Veracity',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Ring of Veracity', 'q': 1, 'eq': True}]},
  'expect': [("C.defenses.some(d=>d.s.includes('Ring of Veracity')&&new RegExp('Insight.*Search action','i').test(d.v))", True)],
  'withoutGxFields': ['item', 'Ring of Veracity', 'Ring of Veracity', ['advOn']],
  'expectWithout': [("C.defenses.some(d=>d.s.includes('Ring of Veracity')&&new RegExp('Insight.*Search action','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U17 item absent Ring of Veracity',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [("C.defenses.some(d=>d.s.includes('Ring of Veracity')&&new RegExp('Insight.*Search action','i').test(d.v))",
              False)]},
 {'name': 'Z3 U17 item Bolt',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Bolt', 'q': 1, 'eq': True}]},
  'expect': [("C.defenses.some(d=>d.s.includes('Bolt')&&new RegExp('ranged attack rolls made with Bolt.*metal','i').test(d.v))",
              True)],
  'withoutGxFields': ['item', 'Bolt', 'Bolt', ['advOn']],
  'expectWithout': [("C.defenses.some(d=>d.s.includes('Bolt')&&new RegExp('ranged attack rolls made with "
                     "Bolt.*metal','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U17 item absent Bolt',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [("C.defenses.some(d=>d.s.includes('Bolt')&&new RegExp('ranged attack rolls made with Bolt.*metal','i').test(d.v))",
              False)]},
 {'name': 'Z3 U17 item Catnip Amulet',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Catnip Amulet', 'q': 1, 'eq': True}]},
  'expect': [("C.defenses.some(d=>d.s.includes('Catnip Amulet')&&new RegExp('Tiny domestic cats.*Animal "
              "Handling','i').test(d.v))",
              True)],
  'withoutGxFields': ['item', 'Catnip Amulet', 'Catnip Amulet', ['advOn']],
  'expectWithout': [("C.defenses.some(d=>d.s.includes('Catnip Amulet')&&new RegExp('Tiny domestic cats.*Animal "
                     "Handling','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U17 item absent Catnip Amulet',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [("C.defenses.some(d=>d.s.includes('Catnip Amulet')&&new RegExp('Tiny domestic cats.*Animal "
              "Handling','i').test(d.v))",
              False)]},
 {'name': 'Z3 U17 item Sharkrazor Mantle',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Sharkrazor Mantle', 'q': 1, 'eq': True}]},
  'expect': [("C.defenses.some(d=>d.s.includes('Sharkrazor Mantle')&&new RegExp('Perception or Survival.*missing Hit "
              "Points','i').test(d.v))",
              True)],
  'withoutGxFields': ['item', 'Sharkrazor Mantle', 'Sharkrazor Mantle', ['advOn']],
  'expectWithout': [("C.defenses.some(d=>d.s.includes('Sharkrazor Mantle')&&new RegExp('Perception or Survival.*missing Hit "
                     "Points','i').test(d.v))",
                     False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U17 item absent Sharkrazor Mantle',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [("C.defenses.some(d=>d.s.includes('Sharkrazor Mantle')&&new RegExp('Perception or Survival.*missing Hit "
              "Points','i').test(d.v))",
              False)]},
 {'name': 'Z3 U17 belt non-dwarf benefits',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Human'}},
  'expect': [('C.darkvision', 60),
             ("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", True),
             ("C.defenses.some(d=>d.t==='Resistance'&&d.v==='Poison'&&d.s.includes('Belt of Dwarvenkind'))", True)],
  'withoutGxFields': ['item', 'Belt of Dwarvenkind', 'Non-dwarf benefits', ['darkTo', 'res', 'advOn']],
  'expectWithout': [('C.darkvision', 0),
                    ("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False)],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)', '^darkvision$', '^darkSrc$']},
 {'name': 'NEG U17 belt excluded Dwarf',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Dwarf'},
        'rs': '2024'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'NEG U17 belt excluded Hill Dwarf',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Hill Dwarf'},
        'rs': '2014'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'NEG U17 belt excluded Mountain Dwarf',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Mountain Dwarf'},
        'rs': '2014'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'NEG U17 belt excluded Duergar (2014)',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Duergar (2014)'},
        'rs': '2014'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'NEG U17 belt excluded Dwarf (Mark of Warding)',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Dwarf (Mark of Warding)'},
        'rs': '2024'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'NEG U17 belt excluded Dwarf (Kaladesh)',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Dwarf (Kaladesh)'},
        'rs': '2024'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'NEG U17 belt excluded Dwarf (Grim Hollow)',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Dwarf (Grim Hollow)'},
        'rs': '2024'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'NEG U17 belt excluded Deep One Dwarf',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Belt of Dwarvenkind', 'q': 1, 'eq': True}],
        'extra': {'species': 'Deep One Dwarf'},
        'rs': '2024'},
  'expect': [("C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&new RegExp('Poisoned','i').test(d.v))", False),
             ("C.darkSrc.includes('Belt of Dwarvenkind')", False)]},
 {'name': 'Z3 U17 Gamma complete spell saves',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Gamma Pendant', 'q': 1, 'eq': True}]},
  'expect': [("C.defenses.some(d=>d.s.includes('Complete pendant')&&new RegExp('saving throws against spells','i').test(d.v))",
              True)],
  'tog': {'gamma-complete': True},
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)', '^fxToggles\\.']},
 {'name': 'NEG U17 Gamma incomplete no spell save benefit',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Gamma Pendant', 'q': 1, 'eq': True}]},
  'expect': [("C.defenses.some(d=>d.s.includes('Complete pendant')&&new RegExp('saving throws against spells','i').test(d.v))",
              False)]},
 {'name': 'Z3 U17 learned travel kit present',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Travel Alchemical Kit', 'q': 1, 'eq': False}]},
  'expect': [('C.profs.tools.includes("Poisoner\'s Kit")', True)],
  'tog': {'travel-kit-training': True},
  'allow': ['^profs\\.tools$', '^profSrc\\.tools(?:\\.|$)', '^fxToggles(?:\\.|$)']},
 {'name': 'NEG U17 travel kit training not learned True',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'cls': 'Wizard',
        'level': 4,
        'inv': [{'n': 'Travel Alchemical Kit', 'q': 1, 'eq': False}]},
  'expect': [('C.profs.tools.includes("Poisoner\'s Kit")', False)]},
 {'name': 'Z3 U17 learned travel kit removed',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [('C.profs.tools.includes("Poisoner\'s Kit")', True)],
  'tog': {'travel-kit-training': True},
  'allow': ['^profs\\.tools$', '^profSrc\\.tools(?:\\.|$)', '^fxToggles(?:\\.|$)']},
 {'name': 'NEG U17 travel kit training not learned False',
  'b': {'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}, 'cls': 'Wizard', 'level': 4, 'inv': []},
  'expect': [('C.profs.tools.includes("Poisoner\'s Kit")', False)]}]

for c in CASES:
    if c["name"] == "Z3 U17 property filtered Steel Magic":
        c["expect"] = [(e, False if "Lance" in e else v) for e,v in c["expect"]]
        c["expect"].append(("C.profs.armor.includes('Medium')&&C.profs.armor.includes('Shields')",True))
        c["expectWithout"] = [(e,v) for e,v in c["expectWithout"] if "Lance" not in e]

# U18 native item benefits and the second Detective advantage clause.
CASES += [{'name': 'Z3 U18 Detective deliberate lies',
  'b': {'cls': 'Investigator',
        'sub': 'Detective',
        'level': 10,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [('C.defenses.some(x=>x.s.includes("Interrogator\'s Instinct")&&/deliberate lie/.test(x.v))', True)],
  'expectWithout': [('C.defenses.some(x=>x.s.includes("Interrogator\'s Instinct")&&/deliberate lie/.test(x.v))', False)],
  'withoutGxFields': ['sub', 'Detective', "Interrogator's Instinct", ['advOn']],
  'allow': ['^defenses(?:\\.|$)', '^saveNotes(?:\\.|$)']},
 {'name': 'NEG U18 Detective below source level',
  'b': {'cls': 'Investigator',
        'sub': 'Detective',
        'level': 9,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18}},
  'expect': [('C.defenses.some(x=>x.s.includes("Interrogator\'s Instinct")&&/deliberate lie/.test(x.v))', False)]},
 {'name': 'Z3 U18 Charm of Many Tongues',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Charm of Many Tongues', 'q': 1, 'eq': True}],
        'extra': {'bg': 'Acolyte'}},
  'expect': [("((C.skills.find(x=>x.n==='Deception')||{}).p||0)", 2), ("((C.skills.find(x=>x.n==='Persuasion')||{}).p||0)", 2)],
  'expectWithout': [("((C.skills.find(x=>x.n==='Deception')||{}).p||0)", 0),
                    ("((C.skills.find(x=>x.n==='Persuasion')||{}).p||0)", 0)],
  'withoutGxFields': ['item', 'Charm of Many Tongues', 'Charm of Many Tongues', ['skillProf', 'skillExpert']],
  'allow': ['^skills\\.\\d+\\.(p|src)$']},
 {'name': 'NEG U18 no language charm no double skills',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'extra': {'bg': 'Acolyte'}},
  'expect': [("((C.skills.find(x=>x.n==='Deception')||{}).p||0)", 0), ("((C.skills.find(x=>x.n==='Persuasion')||{}).p||0)", 0)]},
 {'name': 'Z3 U18 Angelic Wings native movement',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Angelic Wings', 'q': 1, 'eq': True}]},
  'lo': {'cls': 'Wizard',
         'level': 4,
         'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
         'inv': [{'n': 'Angelic Wings', 'q': 1, 'eq': False}]},
  'expect': [('C.speeds.fly.v', 'walk'), ('C.speed', 30)],
  'expectWithout': [('!!(C.speeds&&C.speeds.fly)', False)],
  'allow': ['^speeds(?:\\.|$)', '^inv\\.0\\.eq$']},
 {'name': 'NEG U18 Angelic Wings not worn',
  'b': {'cls': 'Wizard',
        'level': 4,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Angelic Wings', 'q': 1, 'eq': False}]},
  'expect': [('!!(C.speeds&&C.speeds.fly)', False)]}]


# U19 qualified Advantage changes no HP/Speed, and save replacement takes one choice.
CASES += [dict(name="Z3 U19 Vampire Slayer resilience",b=dict(cls="Ranger",sub="Vampire Slayer",level=7,base=WL,ch={"gx-dt-sub-Vampire Slayer":["Ranger's Resilience"]}),withoutGxFields=["sub","Vampire Slayer","Ranger's Resilience",["advOn"]],expect=[("C.defenses.some(d=>/paralysis and effects that lower your Hit Point maximum/.test(d.v))",True)],expectWithout=[("C.defenses.some(d=>/paralysis and effects that lower your Hit Point maximum/.test(d.v))",False)],allow=[r"^defenses(?:\.|$)",r"^saveNotes(?:\.|$)"]),
 dict(name="NEG U19 Vampire Slayer different defensive tactic",b=dict(cls="Ranger",sub="Vampire Slayer",level=7,base=WL,ch={"gx-dt-sub-Vampire Slayer":["Steel Will"]}),expect=[("C.defenses.some(d=>/paralysis and effects that lower your Hit Point maximum/.test(d.v))",False)]),
 dict(name="NEG U19 Samurai wrong source class",b=dict(cls="Monk",sub="Samurai",level=7,base=WL),expect=[("!!C.saves.WIS",False)]),
 dict(name="Z3 U19 Samurai one replacement only",b=dict(cls="Fighter",sub="Samurai",level=7,base=WL,ch={"feat4":{"feat":"Resilient","a1":"WIS"},"gx-courtier-save-sub-Samurai":["Intelligence","Charisma"]}),expect=[("!!C.saves.INT",True),("!!C.saves.CHA",False)]),
 dict(name="NEG U19 Metamorphosis below feat level",b=dict(cls="Wizard",level=3,base=WL,ch={"feat4":{"feat":"Changeling Metamorphosis","a1":"DEX"}}),tog={"metamorph-darkvision":True},expect=[("C.darkvision",0)],allow=[])]

# U19 Performance proof for the narrowed data atom.
CASES += [{'name': 'Z3 U19 Rocker Performance STR 18',
  'b': {'cls': 'Barbarian',
        'sub': 'Path of Heavy Metal',
        'level': 3,
        'base': {'STR': 18, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'extra': {'bg': 'Acolyte'}},
  'withoutGxFields': ['sub', 'Path of Heavy Metal', 'Rocker', ['skillBonus']],
  'expect': [("C.skills.find(x=>x.n==='Performance').misc", 4), ("C.skills.find(x=>x.n==='Performance').p", 1)],
  'expectWithout': [("C.skills.find(x=>x.n==='Performance').misc||0", 0)],
  'allow': ['^skills\\.\\d+\\.(misc|miscSrc)$']},
 {'name': 'Z3 U19 Rocker Performance STR 8',
  'b': {'cls': 'Barbarian',
        'sub': 'Path of Heavy Metal',
        'level': 3,
        'base': {'STR': 8, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'extra': {'bg': 'Acolyte'}},
  'withoutGxFields': ['sub', 'Path of Heavy Metal', 'Rocker', ['skillBonus']],
  'expect': [("C.skills.find(x=>x.n==='Performance').misc", 1), ("C.skills.find(x=>x.n==='Performance').p", 1)],
  'expectWithout': [("C.skills.find(x=>x.n==='Performance').misc||0", 0)],
  'allow': ['^skills\\.\\d+\\.(misc|miscSrc)$']}]

# U19 independent property and minimum-level controls.
CASES += [{'name': 'Z3 U19 non-heavy Two-Handed Steel Magic',
  'b': {'cls': 'Witch',
        'sub': 'Steel Magic',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Double Laser Sword', 'q': 1, 'eq': True}],
        'extra': {'src': {'core': True, 'dmg': True, 'tvss': True, 'tsgs': True, 'tsdm': True}}},
  'expect': [("C.attacks.find(x=>x.n==='Double Laser Sword').prof", True)]},
 {'name': 'Z3 U19 non-heavy Two-Handed Lumimancer',
  'b': {'cls': 'Wizard',
        'sub': 'Lumimancer',
        'level': 3,
        'base': {'STR': 10, 'DEX': 12, 'CON': 14, 'INT': 10, 'WIS': 10, 'CHA': 18},
        'inv': [{'n': 'Double Laser Sword', 'q': 1, 'eq': True}],
        'extra': {'src': {'core': True, 'dmg': True, 'tvss': True, 'tsgs': True, 'tsdm': True}}},
  'expect': [("C.attacks.find(x=>x.n==='Double Laser Sword').prof", False)]},
 {'name': 'NEG U19 Rocker Performance below source level',
  'b': {'cls': 'Barbarian', 'sub': 'Path of Heavy Metal', 'level': 2, 'extra': {'bg': 'Acolyte'}},
  'expect': [("C.skills.find(x=>x.n==='Performance').p||0", 0), ("C.skills.find(x=>x.n==='Performance').misc||0", 0)]}]

# Use a character that actually satisfies the feat's species prerequisite.
for c in CASES:
    if "U17 metamorphosis" in c["name"] or "U19 Metamorphosis" in c["name"]:
        c["b"]["extra"] = dict(c["b"].get("extra",{}),species="Changeling (EFotA)")
        c["expect"].append(("C.species.startsWith('Changeling')",True))


# The belt's social benefit is independent of the ancestry exclusion branch.
BELT_FRIEND = "C.defenses.some(d=>d.s.includes('Belt of Dwarvenkind')&&/Persuasion.*dwarves or duergar/.test(d.v))"
for c in CASES:
    if c["name"].startswith("NEG U17 belt excluded "):
        c["expect"].append((BELT_FRIEND,True))
CASES += [dict(name="Z3 U19 belt social benefit",b=dict(cls="Wizard",level=4,base=WL,inv=[dict(n="Belt of Dwarvenkind",q=1,eq=True)]),withoutGxFields=["item","Belt of Dwarvenkind","Friend of Dwarvenkind",["advOn"]],expect=[(BELT_FRIEND,True)],expectWithout=[(BELT_FRIEND,False)],allow=[r"^defenses(?:\.|$)",r"^saveNotes(?:\.|$)"]),
 dict(name="NEG U19 belt social benefit while unequipped",b=dict(cls="Wizard",level=4,base=WL,inv=[dict(n="Belt of Dwarvenkind",q=1,eq=False)]),expect=[(BELT_FRIEND,False)])]

# Former advisory-note checks now exercise an explicit, matching target.
for c in CASES:
    if c["name"].startswith("Holy Avenger: "):c["target"]={"type":"Fiend"}
    if c["name"].startswith("Sun Blade: "):c["target"]={"type":"Undead"}

# Target context grants only verified riders, scoped to the matching weapon.
for item, target, dice, dtype in [
    ("Ebonbane", {"type":"Humanoid"}, "3d6", "Necrotic"),
    ("Ebonbane", {"type":"Celestial"}, "3d6", "Necrotic"),
    ("Wrought-Iron Tower", {"type":"Creature","alignment":"Good"}, "3d6", "Fire"),
    ("Sword of Kas", {"type":"Undead"}, "2d10", "Slashing"),
    ("Holy Avenger", {"type":"Fiend"}, "2d10", "Radiant"),
    ("Holy Avenger", {"type":"Undead"}, "2d10", "Radiant"),
    ("Sun Blade", {"type":"Undead"}, "1d8", "Radiant"),
]:
    expr="C.attacks.find(a=>a.n===%s)"%json.dumps(item)
    CASES.append(dict(name="Z3 U20 target "+item+" "+json.dumps(target),b=dict(cls="Paladin" if item=="Holy Avenger" else "Fighter",level=4,inv=[dict(n=item,q=1,eq=True),dict(n="Longsword",q=1,eq=True)]),target=target,
        expect=[(expr+".xdice[0].d",dice),(expr+".xdice[0].t",dtype),(expr+".xdice[0].roll",True),(expr+".xdice.length",1),("!!C.attacks.find(a=>a.n==='Longsword').xdice",False)]))
for item in ["Ebonbane","Wrought-Iron Tower","Sword of Kas"]:
    for target in [{},{"type":"Object"}]:
        CASES.append(dict(name="NEG U20 unknown or object "+item+json.dumps(target),b=dict(cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True)]),target=target,
            expect=[("!!C.attacks.find(a=>a.n===%s).xdice"%json.dumps(item),False)]))

CASES += [
 dict(name="Z3 U20 computed Sword of Kas critical and Undead",b=dict(cls="Fighter",level=4,inv=[dict(n="Sword of Kas",q=1,eq=True)]),target={"type":"Undead"},
      withoutGxFields=["item","Sword of Kas","Spirit of Kas",["atkBonus"]],expectWithout=[("C.attacks[1].critRange||20",20)],allow=[r"^attacks\.1\.(note|critRange)$"],
      expect=[("C.attacks[1].critRange",19),("C.attacks[1].xdice[0].d","2d10"),("__deriveFor(C).atk[1].damageParts[0].expr.includes('2d10')",True)]),
 dict(name="Z3 U20 computed Dragontooth Dagger potency",b=dict(cls="Fighter",level=4,inv=[dict(n="Dragontooth Dagger",q=1,eq=True)]),target={"tags":["cult-enemy"]},
      withoutGxFields=["item","Dragontooth Dagger","Draconic Potency",["atkBonus","atkDice"]],expectWithout=[("C.attacks[1].misc",1),("C.attacks[1].xdice.length",1)],allow=[r"^attacks\.1\."],
      expect=[("C.attacks[1].misc",2),("C.attacks[1].dmgBonus",2),("__deriveFor(C).atk[1].damageParts.find(p=>p.type==='Acid').expr","1d6+1d6")]),
 dict(name="NEG U20 Dragontooth without enemy tag",b=dict(cls="Fighter",level=4,inv=[dict(n="Dragontooth Dagger",q=1,eq=True)]),target={},
      expect=[("C.attacks[1].misc",1),("C.attacks[1].dmgBonus",1),("__deriveFor(C).atk[1].damageParts.find(p=>p.type==='Acid').expr","1d6")]),
]

for variant in ["Holy Avenger (Longsword)","Holy Avenger (Rapier)","Holy Avenger (Greatsword)"]:
 for target,active in [({"type":"Fiend"},True),({"type":"Humanoid"},False)]:
    expr="C.attacks.find(a=>a.n===%s)"%json.dumps(variant)
    CASES.append(dict(name=("Z3" if active else "NEG")+" U20 Holy Avenger variant "+variant+json.dumps(target),b=dict(cls="Paladin",level=4,inv=[dict(n=variant,q=1,eq=True)]),target=target,expect=[("!!"+expr+".xdice",active)]+([(expr+".xdice[0].roll",True)] if active else [])))

# U21: actual rolled packets for an independent consumed benefit and a typed
# reference that follows the weapon's final attack damage type.
for removed in [False,True]:
    inv=[] if removed else [dict(n="Potion of Pugilism",q=1,eq=False)]
    CASES.append(dict(name="Z3 U21 rolled Pugilism "+str(removed),b=dict(cls="Fighter",level=4,inv=inv),tog={"consumed-pugilism":True},
        expect=[("C.attacks[0].xdice[0].roll",True),("__deriveFor(C).atk[0].damageParts.find(p=>p.type==='Force').expr","1d6")],
        allow=[r"^attacks\.0\.(note|xdice)",r"^fxToggles(?:\.|$)"]))
CASES.append(dict(name="NEG U21 Pugilism not consumed",b=dict(cls="Fighter",level=4,inv=[dict(n="Potion of Pugilism",q=1,eq=False)]),tog={"consumed-pugilism":False},expect=[("!!C.attacks[0].xdice",False),("!!__deriveFor(C).atk[0].damageParts",False)],allow=[]))
for variant,type_ in [("Dragon Slayer","Slashing"),("Dragon Slayer (Rapier)","Piercing"),("Dragon Slayer (Longbow)","Piercing"),("Dragon Slayer (Spear)","Piercing")]:
    expr="C.attacks.find(a=>a.n===%s)"%repr(variant)
    for target,active in [({"type":"Dragon"},True),({},False),({"type":"Object"},False),({"type":"Fey"},False)]:
        checks=[("!!"+expr+".xdice",active),("!!C.attacks.find(a=>a.n==='Longsword').xdice",False)]
        if active:checks += [(expr+".xdice[0].typeFrom","weapon"),("__deriveFor(C).atk[1].damageParts.length",1),("__deriveFor(C).atk[1].damageParts[0].type",type_),("__deriveFor(C).atk[1].damageParts[0].expr.endsWith('+3d6')",True)]
        CASES.append(dict(name=("Z3" if active else "NEG")+" U21 weapon damage reference "+variant+str(target),b=dict(cls="Fighter",level=4,inv=[dict(n=variant,q=1,eq=True),dict(n="Longsword",q=1,eq=True)]),target=target,expect=checks))
for type_ in ["Necrotic","Psychic","Radiant"]:
    CASES.append(dict(name="Z3 U21 pact Dragon Slayer "+type_,b=dict(cls="Warlock",level=4,ch={"invocation":["Pact of the Blade"],"pactWep":["Dragon Slayer"],"pactDmg":[type_]},inv=[dict(n="Dragon Slayer",q=1,eq=True)]),target={"type":"Dragon"},
        expect=[("C.attacks[1].type",type_),("__deriveFor(C).atk[1].damageParts.length",1),("__deriveFor(C).atk[1].damageParts[0].type",type_),("__deriveFor(C).atk[1].damageParts[0].expr.endsWith('+3d6')",True)]))

CASES.append(dict(name="Z3 U21 2014 pact preserves normal Dragon Slayer type",b=dict(rs="2014",cls="Warlock",level=4,ch={"p3invocation":["Pact of the Blade"],"pactWep":["Dragon Slayer"],"pactDmg":["Radiant"]},inv=[dict(n="Dragon Slayer",q=1,eq=True)]),target={"type":"Dragon"},expect=[("C.attacks[1].type","Slashing"),("__deriveFor(C).atk[1].damageParts[0].type","Slashing")]))

CASES += [
 dict(name="Z3 U21 two Dragon Slayer variants stay local",b=dict(cls="Fighter",level=4,inv=[dict(n="Dragon Slayer (Longsword)",q=1,eq=True),dict(n="Dragon Slayer (Rapier)",q=1,eq=True)]),target={"type":"Dragon"},expect=[("C.attacks[1].xdice.length",1),("C.attacks[2].xdice.length",1),("C.attacks[1].xdice[0].s.includes('(Longsword)')",True),("C.attacks[2].xdice[0].s.includes('(Rapier)')",True)]),
 dict(name="Z3 U21 duplicate Dragon Slayer is one rider",b=dict(cls="Fighter",level=4,inv=[dict(n="Dragon Slayer",q=1,eq=True),dict(n="Dragon Slayer",q=1,eq=True)]),target={"type":"Dragon"},expect=[("C.attacks[1].xdice.length",1),("C.attacks[1].misc",1)]),
 dict(name="Z3 U21 duplicate Dragontooth potency does not stack",b=dict(cls="Fighter",level=4,inv=[dict(n="Dragontooth Dagger",q=1,eq=True),dict(n="Dragontooth Dagger",q=1,eq=True)]),target={"tags":["cult-enemy"]},expect=[("C.attacks[1].misc",2),("C.attacks[1].dmgBonus",2),("C.attacks[1].xdice.length",2),("__deriveFor(C).atk[1].damageParts.find(p=>p.type==='Acid').expr","1d6+1d6")]),
]

# U22: explicit attunement is independent from equipping; legacy rows migrate.
for item,bonus,die in [("Hazirawn",2,"2d6"),("Wand of Orcus",3,"2d12"),("Ruby Rod of Asmodeus",2,"2d12")]:
    for attuned in [False,True,None]:
        row=dict(n=item,q=1,eq=True)
        if attuned is not None: row["attuned"]=attuned
        active=attuned is not False
        checks=[("C.inv[0].attuned",active),("C.inv[0].attunedActive",active),("C.attacks[1].misc",bonus if active else 1 if item=="Hazirawn" else 0)]
        if active or item=="Hazirawn":checks.append(("C.attacks[1].xdice[0].d",die if active else "1d6"))
        else:checks.append(("!!C.attacks[1].xdice",False))
        CASES.append(dict(name="Z3 U22 "+item+" attuned "+str(attuned),b=dict(cls="Fighter",level=4,inv=[row]),target={"type":"Creature","alignment":"Good"},expect=checks))
for target in [{}, {"type":"Object","alignment":"Good"}, {"type":"Creature","alignment":"Evil"}]:
    CASES.append(dict(name="NEG U22 Ruby Rod target "+str(target),b=dict(cls="Fighter",level=4,inv=[dict(n="Ruby Rod of Asmodeus",q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),target=target,expect=[("C.attacks[1].type","Necrotic"),("!!C.attacks[1].xdice",False),("C.attacks[2].type","Slashing"),("!!C.attacks[2].xdice",False)]))
for cls,active in [("Cleric",False),("Wizard",True)]:
    CASES.append(dict(name=("Z3" if active else "NEG")+" U22 Magi spell eligibility "+cls,b=dict(cls=cls,level=4,inv=[dict(n="Staff of the Magi",q=1,eq=True,attuned=True)]),expect=[("C.inv[0].attunedActive",active),("C.spells.some(s=>s.src==='Staff of the Magi')",active)]))
CASES.append(dict(name="Z3 U22 import preserves exhausted stock and explicit states",b=dict(cls="Fighter",level=4),expect=[("JSON.stringify(__bldNorm({cls:'Fighter',level:4,inv:[{n:'Hazirawn',q:0,eq:false,attuned:true}]}).b.inv.map(x=>[x.q,x.eq,x.attuned]))","[[0,false,true]]")]))
for item in ["Sun Blade","Duskcrusher"]:
    CASES.append(dict(name="NEG U22 unattuned hilt "+item,b=dict(cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=False)]),expect=[("C.attacks.some(a=>a.n==="+repr(item)+")",False)]))

# U23: actual target-qualified riders; a light mode is a separate prerequisite.
for item,types,die,dtype,bonus in [("Mace of Disruption",["Fiend","Undead"],"2d6","Radiant",0),("Azuredge",["Fiend","Undead"],"2d6","Radiant",3),("Flayer Slayer",["Aberration"],"1d12","Slashing",1)]:
    for type_ in ["","Object","Humanoid","Fiend","Undead","Aberration"]:
        active=type_ in types
        checks=[("!!C.attacks[1].xdice",active),("C.attacks[1].misc",bonus),("!!C.attacks[2].xdice",False),("!!__deriveFor(C).atk[1].damageParts",active)]
        if active:checks += [("C.attacks[1].xdice[0].d",die),("C.attacks[1].xdice[0].t",dtype),("C.attacks[1].xdice[0].roll",True)]
        CASES.append(dict(name=("Z3" if active else "NEG")+" U23 "+item+" target "+type_,b=dict(cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),target={"type":type_},expect=checks))
    CASES.append(dict(name="NEG U23 unattuned "+item,b=dict(cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=False)]),target={"type":types[0]},expect=[("!!C.attacks[1].xdice",False),("C.attacks[1].misc",0)]))
    CASES.append(dict(name="NEG U23 exhausted "+item,b=dict(cls="Fighter",level=4,inv=[dict(n=item,q=0,eq=True,attuned=True)]),target={"type":types[0]},expect=[("C.attacks.length",1)]))
for type_ in ["","Object","Undead","Fiend"]:
    for on in [False,True]:
        active=on and type_=="Undead"
        CASES.append(dict(name=("Z3" if active else "NEG")+" U23 Lightbringer glow "+str(on)+" "+type_,b=dict(cls="Fighter",level=4,inv=[dict(n="Lightbringer",q=1,eq=True),dict(n="Longsword",q=1,eq=True)]),target={"type":type_},tog={"lightbringer-glow":on},expect=[("!!C.attacks[1].xdice",active),("C.attacks[1].misc",1),("!!C.attacks[2].xdice",False)],allow=[r"^attacks\.1\.xdice\.\d+\.(d|t|s|roll)$",r"^attacks\.1\.note$",r"^fxToggles\.0\.on$"]))
CASES.append(dict(name="NEG U23 Lightbringer stowed while glowing",b=dict(cls="Fighter",level=4,inv=[dict(n="Lightbringer",q=1,eq=False)]),target={"type":"Undead"},tog={"lightbringer-glow":True},expect=[("C.attacks.length",1)],allow=[]))

# U24: critical dice upgrade before doubling, with separate attacker damage.
for rs in ["2024","2014"]:
    for attuned in [False,True]:
        for target in [{},{"type":"Creature","alignment":"Good"},{"type":"Object","alignment":"Good"},{"type":"Creature","alignment":"Evil"}]:
            good=target.get("type")=="Creature" and target.get("alignment")=="Good"
            checks=[("C.attacks[1].die","3d4"),("C.attacks[1].critDie","3d6"),("C.attacks[1].critRange",18),("C.attacks[1].misc",3),("C.attacks[1].ab","CHA" if attuned else "STR"),("!!C.attacks[1].selfDamage",not attuned),("!!C.attacks[1].xdice",good),("!!C.attacks[2].critDie",False),("!!C.attacks[2].selfDamage",False),("!!C.attacks[2].xdice",False),("__deriveFor(C).init===__deriveFor(C).mod.DEX+"+("__deriveFor(C).mod.CHA" if attuned else "0"),True),("__deriveFor(C).atk[1].damageParts[0].critExpr.startsWith('3d6')",True)]
            if good:checks += [("C.attacks[1].xdice[0].d","4d4"),("C.attacks[1].xdice[0].critD","4d6"),("__deriveFor(C).atk[1].damageParts[1].critExpr","4d6")]
            if not attuned:checks += [("C.attacks[1].selfDamage[0].normal","2d4"),("C.attacks[1].selfDamage[0].critical","2d6"),("C.attacks[1].selfDamage[0].bypassDefenses",True)]
            CASES.append(dict(name="Z3 U24 Scourge "+rs+" attuned "+str(attuned)+str(target),b=dict(rs=rs,cls="Fighter",level=4,base={"STR":15,"DEX":14,"CON":13,"INT":12,"WIS":10,"CHA":18},inv=[dict(n="Scourge of Shadow",q=1,eq=True,attuned=attuned),dict(n="Longsword",q=1,eq=True)]),target=target,expect=checks))
for q,eq in [(0,True),(1,False)]:
    CASES.append(dict(name="NEG U24 Scourge unavailable "+str((q,eq)),b=dict(cls="Fighter",level=4,inv=[dict(n="Scourge of Shadow",q=q,eq=eq,attuned=False)]),target={"type":"Creature","alignment":"Good"},expect=[("C.attacks.length",1)]))
CASES.append(dict(name="Z3 U24 duplicate Scourge one self packet",b=dict(cls="Fighter",level=4,inv=[dict(n="Scourge of Shadow",q=1,eq=True,attuned=False),dict(n="Scourge of Shadow",q=1,eq=True,attuned=False)]),target={"type":"Creature","alignment":"Good"},expect=[("C.attacks[1].selfDamage.length",1),("C.attacks[1].xdice.length",1),("C.attacks[1].misc",3)]))
CASES.append(dict(name="Z3 U24 stowed attunement retains Fast Reflexes",b=dict(cls="Fighter",level=4,base={"STR":15,"DEX":14,"CON":13,"INT":12,"WIS":10,"CHA":18},inv=[dict(n="Scourge of Shadow",q=1,eq=False,attuned=True)]),expect=[("C.attacks.length",1),("C.inv[0].attunedActive",True),("__deriveFor(C).init===__deriveFor(C).mod.DEX+__deriveFor(C).mod.CHA",True)]))

for damage_type in ["Necrotic","Psychic","Radiant"]:
    CASES.append(dict(name="Z3 U24 Pact Scourge retains "+damage_type,b=dict(cls="Warlock",level=4,base=WL,ch={"invocation":["Pact of the Blade"],"pactWep":["Scourge of Shadow"],"pactDmg":[damage_type]},inv=[dict(n="Scourge of Shadow",q=1,eq=True,attuned=False)]),target={"type":"Creature","alignment":"Good"},expect=[("C.attacks[1].type",damage_type),("C.attacks[1].ab","CHA"),("C.attacks[1].critDie","3d6"),("C.attacks[1].xdice[0].t","Necrotic"),("C.attacks[1].selfDamage[0].critical","2d6"),("__deriveFor(C).atk[1].damageParts[0].type",damage_type)]))
# U25: native staff weapon profiles and damage committed to a source resource.
U25_STAVES=[("Staff of Striking",3,"Fighter"),("Staff of Thunder and Lightning",2,"Fighter"),("Staff of Withering",0,"Cleric"),("Staff of Power",2,"Wizard")]
for rs in ["2024","2014"]:
    for item,bonus,cls in U25_STAVES:
        for attuned in [False,True]:
            active=attuned
            a="C.attacks.find(a=>a.n==="+json.dumps(item)+")"
            checks=[(a+".die","1d6"),(a+".type","Bludgeoning"),(a+".misc",bonus if active else 0),(a+".dmgBonus",bonus if active else 0),("C.inv[0].attunedActive",active),("!!C.attacks.find(a=>a.n==='Longsword').spendDice",False),("!!"+a+".xdice",False)]
            spend=active and item in ["Staff of Striking","Staff of Thunder and Lightning"]
            checks.append(("!!"+a+".spendDice",spend))
            if spend:
                z=a+".spendDice[0]"
                checks += [(a+".spendDice.length",1),(z+".type","Force" if item=="Staff of Striking" else "Lightning"),(z+".d","1d6" if item=="Staff of Striking" else "2d6"),(z+".maxCost",3 if item=="Staff of Striking" else 1),("!!"+z+".perCost",item=="Staff of Striking"),(z+".item",item),(z+".requiresAttunement",True),("C.res.some(r=>r.k==="+z+".poolKey&&r.f==="+json.dumps(item)+")",True)]
                if item=="Staff of Striking":checks += [(z+".poolKey===C.inv[0].chargeKey",True),("C.res.find(r=>r.k==="+z+".poolKey).max",10)]
                else:checks += [("C.res.find(r=>r.k==="+z+".poolKey).n","Lightning (Staff of Thunder and Lightning)"),("C.res.find(r=>r.k==="+z+".poolKey).max",1),("C.res.filter(r=>r.f==='Staff of Thunder and Lightning'&&!r.item).length",5)]
            CASES.append(dict(name="Z3 U25 resource native "+item+" "+rs+" attuned "+str(attuned),b=dict(rs=rs,cls=cls,level=4,inv=[dict(n=item,q=1,eq=True,attuned=attuned),dict(n="Longsword",q=1,eq=True)]),expect=checks))
        for q,eq in [(0,True),(1,False)]:
            CASES.append(dict(name="NEG U25 resource unavailable "+item+" "+rs+str((q,eq)),b=dict(rs=rs,cls=cls,level=4,inv=[dict(n=item,q=q,eq=eq,attuned=True),dict(n="Longsword",q=1,eq=True)]),expect=[("C.attacks.some(a=>a.n==="+json.dumps(item)+")",False),("C.attacks.some(a=>a.spendDice)",False),("C.attacks.find(a=>a.n==='Longsword').misc",0)]))
    for item in ["Staff of Striking","Staff of Thunder and Lightning"]:
        CASES.append(dict(name="Z3 U25 resource differential "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),withoutGxFields=["item",item,item,["atkSpendDice"]],expect=[("C.attacks[1].spendDice.length",1),("!!C.attacks[2].spendDice",False)],expectWithout=[("!!C.attacks[1].spendDice",False)],allow=[r"^attacks\.1\.spendDice\.0\.(n|when|d|type|maxCost|perCost|poolKey|item|requiresAttunement|s|chargeKey)$",r"^attacks\.1\.spendDice\.0\.resource\.(kind|name)$"]))
    CASES.append(dict(name="NEG U25 resource Power requires eligible caster "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n="Staff of Power",q=1,eq=True,attuned=True)]),expect=[("C.inv[0].attunedActive",False),("C.attacks[1].misc",0),("C.attacks[1].dmgBonus",0),("(C.spells||[]).some(s=>s.src==='Staff of Power')",False),("!!C.attacks[1].spendDice",False)]))
    for item in ["Staff of Striking","Staff of Thunder and Lightning"]:
        checks=[("C.attacks[1].spendDice.length",1),("C.inv[0].attunedActive",False),("C.inv[1].attunedActive",True),("C.attacks[1].misc",3 if item=="Staff of Striking" else 2)]
        if item=="Staff of Striking":checks += [("C.attacks[1].spendDice[0].poolKey===C.inv[1].chargeKey",True),("C.attacks[1].spendDice[0].poolKey===C.inv[0].chargeKey",False)]
        CASES.append(dict(name="Z3 U25 resource duplicate active second copy "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=False),dict(n=item,q=1,eq=True,attuned=True)]),expect=checks))

# Pole Strike inherits the staff source without granting its optional damage to
# an unrelated weapon or changing the butt-end weapon dice.
for item in ["Staff of Striking","Staff of Thunder and Lightning"]:
    for attuned in [False,True]:
        a="C.attacks.find(a=>a.of==="+json.dumps(item)+")"
        checks=[(a+".n","Pole Strike"),(a+".die","1d4"),(a+".type","Bludgeoning"),("!!"+a+".spendDice",attuned),("!!C.attacks.find(a=>a.n==='Longsword').spendDice",False)]
        if attuned:checks += [(a+".spendDice.length",1),(a+".spendDice[0].item",item),(a+".spendDice[0].poolKey===C.attacks.find(a=>a.n==="+json.dumps(item)+").spendDice[0].poolKey",True)]
        CASES.append(dict(name=("Z3" if attuned else "NEG")+" U25 resource Pole Strike "+item+" attuned "+str(attuned),b=dict(cls="Fighter",level=4,ch={"feat4":{"feat":"Polearm Master","a1":"STR"}},inv=[dict(n=item,q=1,eq=True,attuned=attuned),dict(n="Longsword",q=1,eq=True)]),expect=checks))
CASES.append(dict(name="Z3 U25 resource two Pole Strikes retain their own pools",b=dict(cls="Fighter",level=4,ch={"feat4":{"feat":"Polearm Master","a1":"STR"}},inv=[dict(n="Staff of Striking",q=1,eq=True,attuned=True),dict(n="Staff of Thunder and Lightning",q=1,eq=True,attuned=True)]),expect=[("C.attacks.filter(a=>a.of).length",2),("C.attacks.filter(a=>a.of).every(a=>a.spendDice.length===1&&a.spendDice[0].item===a.of)",True),("new Set(C.attacks.filter(a=>a.of).map(a=>a.spendDice[0].poolKey)).size",2)]))

# U26: execute charged weapon damage and typed target-qualified riders.
for rs in ["2024","2014"]:
    for item,die,dtype,limit,needs_attune,bonus in [("Eldritch Staff","1d8","Lightning",3,True,1),("Cinnabar Rapier","1d4","Poison",10,False,0)]:
        for attuned in [False,True]:
            active=attuned or not needs_attune
            a="C.attacks.find(a=>a.n==="+json.dumps(item)+")"
            checks=[(a+".die","1d6" if needs_attune else "1d8"),(a+".type","Bludgeoning" if needs_attune else "Piercing"),(a+".misc",bonus if active else 0),(a+".dmgBonus",bonus if active else 0),("!!"+a+".spendDice",active),("!!"+a+".xdice",False),("!!C.attacks.find(a=>a.n==='Longsword').spendDice",False)]
            if active:
                z=a+".spendDice[0]"
                checks += [(a+".spendDice.length",1),(z+".d",die),(z+".type",dtype),(z+".maxCost",limit),(z+".perCost",True),(z+".requiresAttunement",needs_attune),(z+".item",item),(z+".poolKey===C.inv[0].chargeKey",True),(z+".chargeKey===C.inv[0].chargeKey",True),("C.res.find(r=>r.k==="+z+".poolKey).max",10)]
            CASES.append(dict(name="Z3 U26 charged "+item+" "+rs+" attuned "+str(attuned),b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=attuned),dict(n="Longsword",q=1,eq=True)]),expect=checks))
        CASES.append(dict(name="Z3 U26 charged differential "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),withoutGxFields=["item",item,item,["atkSpendDice"]],expect=[("C.attacks[1].spendDice.length",1)],expectWithout=[("!!C.attacks[1].spendDice",False)],allow=[r"^attacks\.1\.spendDice\.0\.(n|when|d|type|maxCost|perCost|poolKey|item|requiresAttunement|s|chargeKey)$",r"^attacks\.1\.spendDice\.0\.resource\.kind$"]))
    for item,target_type,die,dtype,needs_attune,bonus in [("Ruinblade","Undead","1d8","Force",True,2),("Dragon Thighbone Club","Dragon","2d8","Bludgeoning",False,0)]:
        for attuned in [False,True]:
            for target in [{},{"type":"Object"},{"type":"Structure"},{"type":"Creature"},{"type":"Humanoid"},{"type":target_type}]:
                active=(attuned or not needs_attune) and target.get("type")==target_type
                a="C.attacks.find(a=>a.n==="+json.dumps(item)+")"
                checks=[("!!"+a+".xdice",active),(a+".misc",bonus if attuned or not needs_attune else 0),("!!C.attacks.find(a=>a.n==='Longsword').xdice",False),("!!C.attacks.find(a=>a.n==='Longsword').spendDice",False),("!!__deriveFor(C).atk[1].damageParts",active)]
                if active:
                    checks += [(a+".xdice.length",1),(a+".xdice[0].d",die),(a+".xdice[0].t",dtype),(a+".xdice[0].roll",True),("__deriveFor(C).atk[1].damageParts.find(p=>p.type==="+json.dumps(dtype)+").expr"+(".endsWith('+"+die+"')" if dtype=="Bludgeoning" else ""),True if dtype=="Bludgeoning" else die)]
                CASES.append(dict(name=("Z3" if active else "NEG")+" U26 target "+item+" "+rs+" attuned "+str(attuned)+str(target),b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=attuned),dict(n="Longsword",q=1,eq=True)]),target=target,expect=checks))
        CASES.append(dict(name="Z3 U26 target differential "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),target={"type":target_type},withoutGxFields=["item",item,item,["atkDice"]],expect=[("C.attacks[1].xdice[0].d",die)],expectWithout=[("!!C.attacks[1].xdice",False)],allow=[r"^attacks\.1\.xdice\.0\.(d|t|s|roll)$",r"^attacks\.1\.note$"]))
    for item in ["Eldritch Staff","Cinnabar Rapier","Ruinblade","Dragon Thighbone Club"]:
        for q,eq in [(0,True),(1,False)]:
            CASES.append(dict(name="NEG U26 unavailable "+item+" "+rs+str((q,eq)),b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=q,eq=eq,attuned=True),dict(n="Longsword",q=1,eq=True)]),target={"type":"Undead" if item=="Ruinblade" else "Dragon"},expect=[("C.attacks.some(a=>a.n==="+json.dumps(item)+")",False),("C.attacks.some(a=>a.spendDice||a.xdice)",False),("C.attacks.find(a=>a.n==='Longsword').misc",0)]))
    CASES.append(dict(name="Z3 U26 Cinnabar duplicate source pools stay separate "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n="Cinnabar Rapier",q=1,eq=True),dict(n="Cinnabar Rapier",q=1,eq=True)]),expect=[("C.attacks[1].spendDice.length",2),("new Set(C.attacks[1].spendDice.map(r=>r.poolKey)).size",2),("C.attacks[1].spendDice.every(r=>C.inv.some(i=>i.chargeKey===r.poolKey))",True)]))
    CASES.append(dict(name="Z3 U26 Eldritch active second copy uses its pool "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n="Eldritch Staff",q=1,eq=True,attuned=False),dict(n="Eldritch Staff",q=1,eq=True,attuned=True)]),expect=[("C.attacks[1].spendDice.length",1),("C.attacks[1].spendDice[0].poolKey===C.inv[1].chargeKey",True),("C.attacks[1].spendDice[0].poolKey===C.inv[0].chargeKey",False)]))

# U27: wearable charge damage and target-material weapon damage.
U27_SPEND_ALLOW=[r"^attacks\.[0-3]\.spendDice\.0\.(n|when|d|type|maxCost|perCost|poolKey|item|requiresAttunement|s|chargeKey)$",r"^attacks\.[0-3]\.spendDice\.0\.resource\.kind$"]
U27_INV_WEAPONS=[dict(n="Longsword",q=1,eq=True),dict(n="Longbow",q=1,eq=True)]
for rs in ["2024","2014"]:
    for stage,maximum,regain in [("Dormant",4,"1d4"),("Awakened",6,"1d4+2"),("Exalted",10,"1d6+4")]:
        item="Cabal's Ruin ("+stage+")"
        for attuned in [False,True]:
            checks=[("C.attacks.length",4),("['Unarmed Strike','Longsword','Longbow','Fire Bolt'].every(n=>C.attacks.some(a=>a.n===n))",True),("C.inv[0].attunedActive",attuned),("C.attacks.every(a=>!a.xdice)",True),("C.attacks.every(a=>!a.misc)",True),("C.ac.bonus.some(x=>String(x.s||'').includes("+json.dumps(item)+"))",False),("C.attacks.every(a=>!!a.spendDice==="+str(attuned).lower()+")",True)]
            if attuned:checks += [("C.attacks.every(a=>a.spendDice.length===1)",True),("C.attacks.every(a=>{let z=a.spendDice[0];return z.item==="+json.dumps(item)+"&&z.d==='1d6'&&z.type==='Lightning'&&z.maxCost==="+str(maximum)+"&&z.perCost===true&&z.requiresAttunement===true&&z.poolKey===C.inv[0].chargeKey&&z.chargeKey===z.poolKey})",True),("C.res.find(r=>r.k===C.inv[0].chargeKey).max",maximum),("C.res.find(r=>r.k===C.inv[0].chargeKey).rg",regain),("C.res.find(r=>r.k===C.inv[0].chargeKey).when","dawn")]
            CASES.append(dict(name="Z3 U27 Cabal "+stage+" "+rs+" attuned "+str(attuned),b=dict(rs=rs,cls="Wizard",level=4,extra={"species":"Human","sp":["Fire Bolt"]},inv=[dict(n=item,q=1,eq=True,attuned=attuned)]+U27_INV_WEAPONS),expect=checks))
        CASES.append(dict(name="Z3 U27 Cabal differential "+stage+" "+rs,b=dict(rs=rs,cls="Wizard",level=4,extra={"species":"Human","sp":["Fire Bolt"]},inv=[dict(n=item,q=1,eq=True,attuned=True)]+U27_INV_WEAPONS),withoutGxFields=["item",item,item,["atkSpendDice"]],expect=[("C.attacks.length",4),("C.attacks.every(a=>a.spendDice.length===1)",True)],expectWithout=[("C.attacks.some(a=>a.spendDice)",False)],allow=U27_SPEND_ALLOW))
        for q,eq in [(0,True),(1,False)]:
            CASES.append(dict(name="NEG U27 Cabal unavailable "+stage+" "+rs+str((q,eq)),b=dict(rs=rs,cls="Wizard",level=4,extra={"species":"Human","sp":["Fire Bolt"]},inv=[dict(n=item,q=q,eq=eq,attuned=True)]+U27_INV_WEAPONS),expect=[("C.attacks.length",4),("C.attacks.some(a=>a.spendDice||a.xdice)",False)]))
        CASES.append(dict(name="Z3 U27 Cabal duplicate second copy active "+stage+" "+rs,b=dict(rs=rs,cls="Wizard",level=4,extra={"species":"Human","sp":["Fire Bolt"]},inv=[dict(n=item,q=1,eq=True,attuned=False),dict(n=item,q=1,eq=True,attuned=True)]+U27_INV_WEAPONS),expect=[("C.inv[0].attunedActive",False),("C.inv[1].attunedActive",True),("C.attacks.length",4),("C.attacks.every(a=>a.spendDice.length===1&&a.spendDice[0].poolKey===C.inv[1].chargeKey&&a.spendDice[0].poolKey!==C.inv[0].chargeKey)",True)]))
    for item,tag,dtype,die,base_die,bonus in [("Direstone Dwarven Pick","stone-creature-or-object","Piercing","1d8","1d8",2),("Battlechef's Splendid Saucepan","metal-armor-or-metal-or-stone","Thunder","1d4","1d6",1)]:
        for species in (["Dwarf","Human"] if item=="Direstone Dwarven Pick" else ["Human"]):
            eligible=species=="Dwarf" or item!="Direstone Dwarven Pick"
            for target in [{}]+[{"type":t,"tags":tags} for t in ["Creature","Object","Structure"] for tags in [[],["unrelated-material"],[tag]]]:
                active=eligible and tag in target.get("tags",[])
                checks=[("C.attacks[1].die",base_die),("C.attacks[1].misc",bonus if eligible else 0),("C.attacks[1].dmgBonus",bonus if eligible else 0),("!!C.attacks[1].xdice",active),("!!C.attacks[2].xdice",False)]
                if item=="Direstone Dwarven Pick":checks.append(("C.inv[0].attunedActive",eligible))
                if active:checks += [("C.attacks[1].xdice.length",1),("C.attacks[1].xdice[0].d",die),("C.attacks[1].xdice[0].t",dtype),("C.attacks[1].xdice[0].roll",True),("__deriveFor(C).atk[1].damageParts.find(p=>p.type==="+json.dumps(dtype)+").expr"+(".endsWith('+"+die+"')" if dtype=="Piercing" else ""),True if dtype=="Piercing" else die)]
                CASES.append(dict(name=("Z3" if active else "NEG")+" U27 material "+item+" "+rs+" "+species+str(target),b=dict(rs=rs,cls="Fighter",level=4,extra={"species":species},inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),target=target,expect=checks))
        CASES.append(dict(name="Z3 U27 material differential "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,extra={"species":"Dwarf" if item=="Direstone Dwarven Pick" else "Human"},inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),target={"type":"Creature","tags":[tag]},withoutGxFields=["item",item,item,["atkDice"]],expect=[("C.attacks[1].xdice[0].d",die),("C.attacks[1].misc",bonus)],expectWithout=[("!!C.attacks[1].xdice",False),("C.attacks[1].misc",bonus)],allow=[r"^attacks\.1\.xdice\.0\.(d|t|s|roll)$",r"^attacks\.1\.note$"]))
        for q,eq in [(0,True),(1,False)]:
            CASES.append(dict(name="NEG U27 material unavailable "+item+" "+rs+str((q,eq)),b=dict(rs=rs,cls="Fighter",level=4,extra={"species":"Dwarf" if item=="Direstone Dwarven Pick" else "Human"},inv=[dict(n=item,q=q,eq=eq,attuned=True),dict(n="Longsword",q=1,eq=True)]),target={"type":"Creature","tags":[tag]},expect=[("C.attacks.length",2),("C.attacks.some(a=>a.xdice)",False),("C.attacks.find(a=>a.n==='Longsword').misc",0)]))

# U28: source-qualified melee attacks; declared modes do not come from range.
U28_TARGET={"type":"Creature","hp":4,"maxHp":10}
U28_COAT=dict(n="Cinder Coat",q=1,eq=True,attuned=True)
U28_AC="C.ac.bonus.filter(x=>String(x.s||'').includes('Cinder Coat')).reduce((n,x)=>n+x.v,0)"
U28_SPEND_ALLOW=[r"^attacks\.\d+\.spendDice\.0\.(n|when|d|type|maxCost|perCost|poolKey|item|requiresAttunement|s|chargeKey|attackKind)$",r"^attacks\.\d+\.spendDice\.0\.resource\.kind$",r"^attacks\.\d+\.spendDice\.0\.attackKinds(?:\.[01])?$"]
def u28row(name):return "C.attacks.find(a=>a.n==="+json.dumps(name)+")"
def u28case(name,b,checks,target=U28_TARGET):CASES.append(dict(name=name,b=b,target=target,expect=checks))
for rs in ["2024","2014"]:
    inv=[U28_COAT]+[dict(n=n,q=1,eq=True) for n in ["Longsword","Longbow","Dagger"]]
    checks=[(U28_AC,2),("C.res.find(r=>r.k===C.inv[0].chargeKey).max",3),("C.res.find(r=>r.k===C.inv[0].chargeKey).rg","1d3"),("C.res.find(r=>r.k===C.inv[0].chargeKey).when","dawn"),("!!"+u28row("Longbow")+".spendDice",False)]
    for name,kinds in [("Unarmed Strike",["melee"]),("Longsword",["melee"]),("Dagger",["melee","ranged"])]:
        a=u28row(name);z=a+".spendDice[0]"
        checks += [(a+".spendDice.length",1),(z+".attackKind","melee"),(z+".attackKinds",kinds),(z+".d","1d10"),(z+".type","Fire"),(z+".maxCost",1),(z+".poolKey===C.inv[0].chargeKey",True),(z+".requiresAttunement",True),("!!"+a+".xdice",False)]
    u28case("Z3 U28 Cinder native modes "+rs,dict(rs=rs,cls="Fighter",level=4,inv=inv),checks)
    u28case("Z3 U28 Cinder creature type qualifies "+rs,dict(rs=rs,cls="Fighter",level=4,inv=inv),[("C.attacks[0].spendDice[0].type","Fire"),("!!"+u28row("Longbow")+".spendDice",False)],{"type":"Construct","hp":4,"maxHp":10})
    u28case("Z3 U28 Cinder second copy uses its own pool "+rs,dict(rs=rs,cls="Fighter",level=4,inv=[dict(n="Cinder Coat",q=1,eq=True,attuned=False),U28_COAT,dict(n="Longsword",q=1,eq=True)]),[("C.inv[0].attunedActive",False),("C.inv[1].attunedActive",True),("C.attacks[0].spendDice.length",1),("C.attacks[0].spendDice[0].poolKey===C.inv[1].chargeKey",True),("C.attacks[0].spendDice[0].poolKey===C.inv[0].chargeKey",False)])
    CASES.append(dict(name="Z3 U28 Cinder field differential "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=inv),target=U28_TARGET,withoutGxFields=["item","Cinder Coat","Cinder Coat",["atkSpendDice"]],expect=[("C.attacks[0].spendDice[0].d","1d10"),(U28_AC,2)],expectWithout=[("C.attacks.some(a=>a.spendDice)",False),(U28_AC,2)],allow=U28_SPEND_ALLOW))
    for target in [{},{"type":"Creature"},{"type":"Creature","hp":4},{"type":"Creature","maxHp":10},{"hp":4,"maxHp":10},{"type":"Creature","hp":10,"maxHp":10},{"type":"Object","hp":4,"maxHp":10},{"type":"Structure","hp":4,"maxHp":10}]:
        u28case("NEG U28 Cinder target "+rs+str(target),dict(rs=rs,cls="Fighter",level=4,inv=inv),[("C.attacks.some(a=>a.spendDice)",False),(U28_AC,2)],target)
    for q,eq,attuned in [(1,True,False),(1,False,True),(0,True,True)]:
        u28case("NEG U28 Cinder source unavailable "+rs+str((q,eq,attuned)),dict(rs=rs,cls="Fighter",level=4,inv=[dict(n="Cinder Coat",q=q,eq=eq,attuned=attuned),dict(n="Longsword",q=1,eq=True)]),[("C.attacks.some(a=>a.spendDice)",False),(U28_AC,0)])
    u28case("Z3 U28 Cinder spell melee modes "+rs,dict(rs=rs,cls="Wizard",level=4,ch={"feat4":{"feat":"Lightly Armored (2014)" if rs=="2014" else "Lightly Armored","a1":"DEX"}},extra={"sp":["Shocking Grasp","Fire Bolt","Chill Touch"]},inv=[U28_COAT]),[("C.profs.armor.includes('Light')",True),(u28row("Shocking Grasp")+".spendDice[0].attackKinds",["melee"]),("!!"+u28row("Fire Bolt")+".spendDice",False),("!!"+u28row("Chill Touch")+".spendDice",rs=="2024")]+([(u28row("Chill Touch")+".spendDice[0].attackKinds",["melee"])] if rs=="2024" else []))
    u28case("Z3 U28 Cinder Thorn Whip range does not imply ranged "+rs,dict(rs=rs,cls="Druid",level=4,extra={"sp":["Thorn Whip"]},inv=[U28_COAT]),[(u28row("Thorn Whip")+".range","30 ft"),(u28row("Thorn Whip")+".spendDice[0].attackKinds",["melee"])])
    u28case("Z3 U28 Cinder explicit thrown row excluded "+rs,dict(rs=rs,cls="Fighter",level=4,ch={"fs1":"Thrown Weapon Fighting"},inv=[U28_COAT,dict(n="Spear",q=1,eq=True)]),[("C.attacks.some(a=>a.n==='Spear (thrown)')",True),("!!"+u28row("Spear (thrown)")+".spendDice",False),(u28row("Spear")+".spendDice[0].attackKinds",["melee","ranged"])])
    u28case("Z3 U28 Cinder unreviewed natural requires declared mode "+rs,dict(rs=rs,cls="Fighter",level=4,extra={"species":"Dhampir"},inv=[U28_COAT]),[(u28row("Vampiric Bite")+".sub","Natural weapon"),(u28row("Vampiric Bite")+".spendDice[0].attackKinds",[]),(u28row("Vampiric Bite")+".spendDice[0].attackKind","melee")])
u28case("Z3 U28 Cinder Pole Strike is melee",dict(cls="Fighter",level=4,ch={"feat4":{"feat":"Polearm Master","a1":"STR"}},inv=[U28_COAT,dict(n="Quarterstaff",q=1,eq=True)]),[("C.attacks.find(a=>a.of==='Quarterstaff').n","Pole Strike"),("C.attacks.find(a=>a.of==='Quarterstaff').spendDice[0].attackKinds",["melee"])])
u28case("Z3 U28 Cinder Psychic Blade both modes require choice",dict(cls="Rogue",sub="Soulknife",level=4,inv=[U28_COAT]),[(u28row("Psychic Blade")+".spendDice[0].attackKinds",["melee","ranged"]),(u28row("Psychic Blade (Bonus Action)")+".spendDice[0].attackKinds",["melee","ranged"])])
u28case("NEG U28 Cinder Archer is ranged",dict(cls="Druid",sub="Circle of the Stars",level=4,inv=[U28_COAT]),[("C.attacks.some(a=>a.n==='Starry Form: Archer')",True),("!!"+u28row("Starry Form: Archer")+".spendDice",False)])

# Resource effects run after feature-generated attacks; each row gets its own mode.
u28case("Z3 U28 Cinder Spear Pole Strike refreshes parent mode",dict(cls="Fighter",level=4,ch={"feat4":{"feat":"Polearm Master","a1":"STR"}},inv=[U28_COAT,dict(n="Spear",q=1,eq=True)]),[(u28row("Spear")+".spendDice[0].attackKinds",["melee","ranged"]),("C.attacks.find(a=>a.of==='Spear').spendDice[0].attackKinds",["melee"]),("C.attacks.find(a=>a.of==='Spear').spendDice[0].poolKey==="+u28row("Spear")+".spendDice[0].poolKey",True)])
u28case("Z3 U28 Cabal includes both generated Psychic Blades",dict(cls="Rogue",sub="Soulknife",level=4,inv=[dict(n="Cabal's Ruin (Dormant)",q=1,eq=True,attuned=True)]),[("C.attacks.some(a=>a.n==='Psychic Blade')",True),("C.attacks.some(a=>a.n==='Psychic Blade (Bonus Action)')",True),("C.attacks.every(a=>a.spendDice.length===1&&a.spendDice[0].item===\"Cabal's Ruin (Dormant)\"&&a.spendDice[0].poolKey===C.inv[0].chargeKey)",True)])
u28case("Z3 U28 Cabal includes generated ranged Archer",dict(cls="Druid",sub="Circle of the Stars",level=4,inv=[dict(n="Cabal's Ruin (Dormant)",q=1,eq=True,attuned=True)]),[("C.attacks.some(a=>a.n==='Starry Form: Archer')",True),(u28row("Starry Form: Archer")+".spendDice.length",1),(u28row("Starry Form: Archer")+".spendDice[0].poolKey===C.inv[0].chargeKey",True),(u28row("Starry Form: Archer")+".spendDice[0].d","1d6")])

# Older positive rider fixtures require a materialized blade. Make that state
# explicit; dedicated U29 migration cases separately exercise legacy version0.
for c in CASES:
    if c["name"]=="Sun Blade: 1d8 Radiant against an Undead, Radiant and Finesse kept" or c["name"].startswith("Z3 U20 target Sun Blade "):
        c["b"].setdefault("extra",{})["inventoryFormV"]=1
        next(it for it in c["b"]["inv"] if it["n"]=="Sun Blade")["form"]={"v":1,"active":True,"radius":15}

# U29: independent physical forms and executable Radiant damage.
U29_WEAPONS=["Sun Blade","Sunsword","Dawnbringer","Duskcrusher"]
U29_BASE={"STR":10,"DEX":18,"CON":14,"INT":12,"WIS":10,"CHA":8}
def u29inv(item,active=True,attuned=True,eq=True,q=1):return dict(n=item,q=q,eq=eq,attuned=attuned,form={"v":1,"active":active,"radius":15})
def u29row(item):return "C.attacks.find(a=>a.n==="+json.dumps(item)+")"
for rs in ["2024","2014"]:
    for item in U29_WEAPONS:
        for active in [False,True]:
            for target in [{},{"type":"Object"},{"type":"Humanoid"},{"type":"Undead"}]:
                rider=active and target.get("type")=="Undead"
                a=u29row(item)
                checks=[("C.inv[0].attunedActive",True),("C.inv[0].form.active",active),("C.inv[0].formUsable",active),("C.attacks.some(a=>a.n==="+json.dumps(item)+")",active),("!!C.attacks.find(a=>a.n==='Longsword').xdice",False)]
                if active:
                    checks += [(a+".type","Radiant"),(a+".die","1d8"),(a+".misc",2),(a+".dmgBonus",2),(a+".ab","STR" if item=="Duskcrusher" else "DEX"),(a+".prof",True),("!!"+a+".xdice",rider)]
                    if rider:checks += [(a+".xdice.length",1),(a+".xdice[0].d","1d8"),(a+".xdice[0].t","Radiant"),(a+".xdice[0].roll",True),("__deriveFor(C).atk[1].damageParts.length",1),("__deriveFor(C).atk[1].damageParts[0].type","Radiant"),("__deriveFor(C).atk[1].damageParts[0].expr.split('+').sort()",["1d8","1d8","2" if item=="Duskcrusher" else "6"])]
                else:checks.append(("(C.defenses||[]).some(d=>String(d.s||'').includes("+json.dumps(item)+")&&/Extra damage|1d8/.test(d.v||''))",False))
                CASES.append(dict(name=("Z3" if active else "NEG")+" U29 form "+item+" "+rs+" active "+str(active)+str(target),b=dict(rs=rs,cls="Fighter",level=4,base=U29_BASE,extra={"inventoryFormV":1},inv=[u29inv(item,active),dict(n="Longsword",q=1,eq=True)]),target=target,expect=checks))
        for attuned,eq,q in [(False,True,1),(True,False,1),(True,True,0)]:
            CASES.append(dict(name="NEG U29 form unavailable "+item+" "+rs+str((attuned,eq,q)),b=dict(rs=rs,cls="Fighter",level=4,base=U29_BASE,extra={"inventoryFormV":1},inv=[u29inv(item,attuned=attuned,eq=eq,q=q),dict(n="Longsword",q=1,eq=True)]),target={"type":"Undead"},expect=[("C.inv[0].formUsable",False),("C.attacks.some(a=>a.n==="+json.dumps(item)+")",False),("!!C.attacks.find(a=>a.n==='Longsword').xdice",False)]))
        CASES.append(dict(name="Z3 U29 rider differential "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,base=U29_BASE,extra={"inventoryFormV":1},inv=[u29inv(item),dict(n="Longsword",q=1,eq=True)]),target={"type":"Undead"},withoutGxFields=["item",item,item,["atkDice"]],expect=[(u29row(item)+".xdice.length",1),(u29row(item)+".type","Radiant")],expectWithout=[("!!"+u29row(item)+".xdice",False),(u29row(item)+".type","Radiant")],allow=[r"^attacks\.1\.xdice\.0\.(d|t|s|roll)$",r"^attacks\.1\.note$"]))
        CASES.append(dict(name="Z3 U29 legacy wielded form migration "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,base=U29_BASE,extra={"inventoryFormV":0},inv=[dict(n=item,q=1,eq=True,attuned=True)]),target={"type":"Undead"},expect=[("C.inv[0].form.active",True),("C.inv[0].formUsable",True),(u29row(item)+".xdice.length",1)]))
        CASES.append(dict(name="NEG U29 modern missing form starts inactive "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,extra={"inventoryFormV":1},inv=[dict(n=item,q=1,eq=True,attuned=True)]),target={"type":"Undead"},expect=[("C.inv[0].form.active",False),("C.attacks.some(a=>a.n==="+json.dumps(item)+")",False)]))
for item in ["Sun Blade","Sunsword","Dawnbringer"]:
    for cls,prof in [("Monk",True),("Wizard",False)]:
        name=("Z3 U29 Shortsword-only proficiency " if prof else "NEG U29 neither weapon proficiency ")+item
        CASES.append(dict(name=name,b=dict(cls=cls,level=4,base=U29_BASE,extra={"inventoryFormV":1},inv=[u29inv(item),dict(n="Longsword",q=1,eq=True),dict(n="Shortsword",q=1,eq=True)]),target={"type":"Undead"},expect=[(u29row(item)+".prof",prof),(u29row("Shortsword")+".prof",prof),(u29row("Longsword")+".prof",False),(u29row(item)+".ab","DEX"),(u29row(item)+".sub.includes('Finesse')",True),("("+u29row(item)+".sub.match(/Finesse/g)||[]).length",1)]))
    CASES.append(dict(name="Z3 U29 Longsword-only proficiency "+item,b=dict(rs="2014",cls="Wizard",level=4,base=U29_BASE,ch={"feat4":{"feat":"Weapon Master (2014)","a1":"DEX"},"wp-feat4":["Longsword","Warhammer","Battleaxe","Trident"]},extra={"inventoryFormV":1},inv=[u29inv(item),dict(n="Longsword",q=1,eq=True),dict(n="Shortsword",q=1,eq=True)]),target={"type":"Undead"},expect=[(u29row(item)+".prof",True),(u29row("Longsword")+".prof",True),(u29row("Shortsword")+".prof",False)]))

# Pact damage is chosen after the native Radiant form profile, while each
# Undead rider retains its own Radiant type. The bystander weapon is independent.
for item in U29_WEAPONS:
    for chosen in ["Necrotic","Psychic","Radiant"]:
        a=u29row(item)
        CASES.append(dict(name="Z3 U29 Pact final damage "+item+" "+chosen,b=dict(cls="Warlock",level=4,base=WL,ch={"invocation":["Pact of the Blade"],"pactWep":[item],"pactDmg":[chosen]},extra={"inventoryFormV":1},inv=[u29inv(item),dict(n="Longsword",q=1,eq=True)]),target={"type":"Undead"},expect=[(a+".type",chosen),(a+".ab","CHA"),(a+".xdice.length",1),(a+".xdice[0].t","Radiant"),(a+".xdice[0].d","1d8"),(a+".xdice[0].roll",True),("__deriveFor(C).atk[1].damageParts.length",1 if chosen=="Radiant" else 2),("__deriveFor(C).atk[1].damageParts.some(p=>p.type==='Radiant'&&p.expr.includes('1d8'))",True),(u29row("Longsword")+".type","Slashing"),("!!"+u29row("Longsword")+".xdice",False)]))
    CASES.append(dict(name="Z3 U29 Pact without damage choice retains Radiant "+item,b=dict(cls="Warlock",level=4,base=WL,ch={"invocation":["Pact of the Blade"],"pactWep":[item]},extra={"inventoryFormV":1},inv=[u29inv(item)]),target={"type":"Undead"},expect=[(u29row(item)+".type","Radiant"),(u29row(item)+".xdice[0].t","Radiant")]))
    CASES.append(dict(name="Z3 U29 2014 Pact ignores damage choice "+item,b=dict(rs="2014",cls="Warlock",level=4,base=WL,ch={"p3invocation":["Pact of the Blade"],"pactWep":[item],"pactDmg":["Necrotic"]},extra={"inventoryFormV":1},inv=[u29inv(item)]),target={"type":"Undead"},expect=[(u29row(item)+".type","Radiant"),(u29row(item)+".xdice[0].t","Radiant")]))
for rs in ["2024","2014"]:
    for active in [False,True]:
        # Keep item spell metadata and counters while the form is off. Casting
        # availability is checked by the production casting UI, not row deletion.
        checks=[("C.spells.find(s=>s.n==='Lesser Restoration'&&s.src==='Cleric').ct","Bonus Action" if rs=="2024" else "Action"),("C.spells.find(s=>s.n==='Lesser Restoration'&&s.src==='Dawnbringer').ct","Action"),("C.inv[0].formUsable",active)]
        CASES.append(dict(name="Z3 U29 Dawnbringer restoration action source "+rs+" active "+str(active),b=dict(rs=rs,cls="Cleric",level=4,extra={"inventoryFormV":1,"sp":["Lesser Restoration"]},inv=[u29inv("Dawnbringer",active)]),expect=checks))

# U30: consumed typed resistance and resource-coupled own-weapon riders.
U30_POTION_ALLOW=[r'^defenses$',r'^defenses\.\d+\.(t|v|s)$',r'^fxToggles$',r'^fxToggles\.\d+\.(id|label|on|src)$',r'^fxToggles\.\d+\.consume\.(item|duration)$']
for rs in ['2024','2014']:
    for type_ in ['Acid','Cold','Fire','Force','Lightning','Necrotic','Poison','Psychic','Radiant','Thunder']:
        name='Potion of '+type_+' Resistance';id_='consumed-resistance-'+type_.lower();find="(C.fxToggles||[]).find(x=>x.id==="+json.dumps(id_)+")"
        for q,on in [(1,False),(1,True),(0,True),(0,False),(2,True)]:
            checks=[("(C.defenses||[]).filter(x=>x.t==='Resistance'&&/consumed item/.test(x.s||'')).length",1 if on else 0),("(C.defenses||[]).some(x=>x.t==='Resistance'&&x.v==="+json.dumps(type_)+")",on),('C.inv[0].q',q)]
            if on or q>0:checks += [(find+'.on',on),(find+'.consume.duration','1 hour'),(find+'.consume.item',name)]
            else:checks += [('!!'+find,False)]
            CASES.append(dict(name=('Z3' if on else 'NEG')+' U30 typed resistance '+name+' '+rs+str((q,on)),b=dict(rs=rs,cls='Fighter',level=4,inv=[dict(n=name,q=q,eq=False)]),tog={id_:on},expect=checks,allow=U30_POTION_ALLOW))
        CASES.append(dict(name='Z3 U30 removed bottle resistance '+name+' '+rs,b=dict(rs=rs,cls='Fighter',level=4,inv=[]),tog={id_:True},expect=[("(C.defenses||[]).some(x=>x.t==='Resistance'&&x.v==="+json.dumps(type_)+")",True),(find+'.on',True),(find+'.consume.duration','1 hour'),('C.inv.length',0)],allow=U30_POTION_ALLOW))

CASES += [{'name': 'Z3 U30 Rogue Card eligibility 2024(1, True)', 'b': {'rs': '2024', 'cls': 'Wizard', 'level': 4, 'extra': {'species': 'Human', 'sp': ['Fire Bolt']}, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'expect': [["C.attacks.some(a=>a.n==='Unarmed Strike'&&a.spendDice)", False], ["C.attacks.some(a=>a.n==='Fire Bolt'&&a.spendDice)", False], ['C.attacks.filter(a=>a.spendDice).length', 2], ["C.attacks.filter(a=>a.spendDice).every(a=>{const z=a.spendDice[0];return z.item==='Rogue Card'&&z.d==='6d6'&&z.type==='Force'&&z.maxCost===1&&!z.requiresAttunement&&z.poolKey===C.inv[0].chargeKey&&z.chargeKey===z.poolKey})", True], ['C.res.find(r=>r.k===C.inv[0].chargeKey).max', 1], ['C.res.find(r=>r.k===C.inv[0].chargeKey).reset', 'long']]}, {'name': 'Z3 U30 Rogue Card eligibility 2024(0, True)', 'b': {'rs': '2024', 'cls': 'Wizard', 'level': 4, 'extra': {'species': 'Human', 'sp': ['Fire Bolt']}, 'inv': [{'n': 'Rogue Card', 'q': 0, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'expect': [["C.attacks.some(a=>a.n==='Unarmed Strike'&&a.spendDice)", False], ["C.attacks.some(a=>a.n==='Fire Bolt'&&a.spendDice)", False], ['C.attacks.filter(a=>a.spendDice).length', 0]]}, {'name': 'Z3 U30 Rogue Card eligibility 2024(1, False)', 'b': {'rs': '2024', 'cls': 'Wizard', 'level': 4, 'extra': {'species': 'Human', 'sp': ['Fire Bolt']}, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': False}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'expect': [["C.attacks.some(a=>a.n==='Unarmed Strike'&&a.spendDice)", False], ["C.attacks.some(a=>a.n==='Fire Bolt'&&a.spendDice)", False], ['C.attacks.filter(a=>a.spendDice).length', 0]]}, {'name': 'Z3 U30 Rogue Card differential 2024', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'withoutGxFields': ['item', 'Rogue Card', 'Rogue Card', ['atkSpendDice']], 'expect': [['C.attacks.filter(a=>a.spendDice).length', 2]], 'expectWithout': [['C.attacks.some(a=>a.spendDice)', False]], 'allow': ['^attacks\\.[12]\\.spendDice\\.0\\.(n|when|d|type|maxCost|poolKey|item|requiresAttunement|s|chargeKey)$', '^attacks\\.[12]\\.spendDice\\.0\\.resource\\.kind$']}, {'name': 'Z3 U30 Rogue Card duplicate only held pool 2024', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': False}, {'n': 'Rogue Card', 'q': 1, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'expect': [['C.attacks[1].spendDice.length', 1], ['C.attacks[1].spendDice[0].poolKey===C.inv[1].chargeKey', True], ['C.attacks[1].spendDice[0].poolKey===C.inv[0].chargeKey', False]]}, {'name': 'Z3 U30 Dragon-Kindled target 2024True', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': ''}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'Z3 U30 Dragon-Kindled target 2024TrueCreature', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Creature'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'Z3 U30 Dragon-Kindled target 2024FalseDragon', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': False}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 0]]}, {'name': 'Z3 U30 Dragon-Kindled target 2024TrueDragon', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", True], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice.length", 1], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice[0].d", '2d6'], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice[0].typeFrom", 'weapon'], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice[0].roll", True], ["__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==='Dragon-Kindled Edge')].damageParts.length", 1]]}, {'name': 'Z3 U30 Dragon-Kindled target 2024TrueUndead', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Undead'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'Z3 U30 Dragon-Kindled target 2024TrueObject', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Object'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'NEG U30 target unavailable Dragon-Kindled Edge2024(0, True)', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'base': {'STR': 17}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 0, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [['C.attacks.some(a=>a.xdice)', False]]}, {'name': 'NEG U30 target unavailable Dragon-Kindled Edge2024(1, False)', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'base': {'STR': 17}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': False, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [['C.attacks.some(a=>a.xdice)', False]]}, {'name': 'Z3 U30 target differential Dragon-Kindled Edge2024', 'b': {'rs': '2024', 'cls': 'Fighter', 'level': 4, 'base': {'STR': 17}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}]}, 'target': {'type': 'Dragon'}, 'withoutGxFields': ['item', 'Dragon-Kindled Edge', 'Dragon-Kindled Edge', ['atkDice']], 'expect': [['C.attacks[1].xdice.length', 1]], 'expectWithout': [['!!C.attacks[1].xdice', False]], 'allow': ['^attacks\\.1\\.xdice\\.0\\.(d|t|s|roll|typeFrom)$', '^attacks\\.1\\.note$']}, {'name': 'Z3 U30 Rogue Card eligibility 2014(1, True)', 'b': {'rs': '2014', 'cls': 'Wizard', 'level': 4, 'extra': {'species': 'Human', 'sp': ['Fire Bolt']}, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'expect': [["C.attacks.some(a=>a.n==='Unarmed Strike'&&a.spendDice)", False], ["C.attacks.some(a=>a.n==='Fire Bolt'&&a.spendDice)", False], ['C.attacks.filter(a=>a.spendDice).length', 2], ["C.attacks.filter(a=>a.spendDice).every(a=>{const z=a.spendDice[0];return z.item==='Rogue Card'&&z.d==='6d6'&&z.type==='Force'&&z.maxCost===1&&!z.requiresAttunement&&z.poolKey===C.inv[0].chargeKey&&z.chargeKey===z.poolKey})", True], ['C.res.find(r=>r.k===C.inv[0].chargeKey).max', 1], ['C.res.find(r=>r.k===C.inv[0].chargeKey).reset', 'long']]}, {'name': 'Z3 U30 Rogue Card eligibility 2014(0, True)', 'b': {'rs': '2014', 'cls': 'Wizard', 'level': 4, 'extra': {'species': 'Human', 'sp': ['Fire Bolt']}, 'inv': [{'n': 'Rogue Card', 'q': 0, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'expect': [["C.attacks.some(a=>a.n==='Unarmed Strike'&&a.spendDice)", False], ["C.attacks.some(a=>a.n==='Fire Bolt'&&a.spendDice)", False], ['C.attacks.filter(a=>a.spendDice).length', 0]]}, {'name': 'Z3 U30 Rogue Card eligibility 2014(1, False)', 'b': {'rs': '2014', 'cls': 'Wizard', 'level': 4, 'extra': {'species': 'Human', 'sp': ['Fire Bolt']}, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': False}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'expect': [["C.attacks.some(a=>a.n==='Unarmed Strike'&&a.spendDice)", False], ["C.attacks.some(a=>a.n==='Fire Bolt'&&a.spendDice)", False], ['C.attacks.filter(a=>a.spendDice).length', 0]]}, {'name': 'Z3 U30 Rogue Card differential 2014', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}, {'n': 'Longbow', 'q': 1, 'eq': True}]}, 'withoutGxFields': ['item', 'Rogue Card', 'Rogue Card', ['atkSpendDice']], 'expect': [['C.attacks.filter(a=>a.spendDice).length', 2]], 'expectWithout': [['C.attacks.some(a=>a.spendDice)', False]], 'allow': ['^attacks\\.[12]\\.spendDice\\.0\\.(n|when|d|type|maxCost|poolKey|item|requiresAttunement|s|chargeKey)$', '^attacks\\.[12]\\.spendDice\\.0\\.resource\\.kind$']}, {'name': 'Z3 U30 Rogue Card duplicate only held pool 2014', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Rogue Card', 'q': 1, 'eq': False}, {'n': 'Rogue Card', 'q': 1, 'eq': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'expect': [['C.attacks[1].spendDice.length', 1], ['C.attacks[1].spendDice[0].poolKey===C.inv[1].chargeKey', True], ['C.attacks[1].spendDice[0].poolKey===C.inv[0].chargeKey', False]]}, {'name': 'Z3 U30 Dragon-Kindled target 2014True', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': ''}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'Z3 U30 Dragon-Kindled target 2014TrueCreature', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Creature'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'Z3 U30 Dragon-Kindled target 2014FalseDragon', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': False}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 0]]}, {'name': 'Z3 U30 Dragon-Kindled target 2014TrueDragon', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", True], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice.length", 1], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice[0].d", '2d6'], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice[0].typeFrom", 'weapon'], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice[0].roll", True], ["__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==='Dragon-Kindled Edge')].damageParts.length", 1]]}, {'name': 'Z3 U30 Dragon-Kindled target 2014TrueUndead', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Undead'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'Z3 U30 Dragon-Kindled target 2014TrueObject', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Object'}, 'expect': [["!!C.attacks.find(a=>a.n==='Dragon-Kindled Edge').xdice", False], ["C.attacks.find(a=>a.n==='Longsword').misc", 0], ["!!C.attacks.find(a=>a.n==='Longsword').xdice", False], ["C.attacks.find(a=>a.n==='Dragon-Kindled Edge').misc", 3]]}, {'name': 'NEG U30 target unavailable Dragon-Kindled Edge2014(0, True)', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'base': {'STR': 17}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 0, 'eq': True, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [['C.attacks.some(a=>a.xdice)', False]]}, {'name': 'NEG U30 target unavailable Dragon-Kindled Edge2014(1, False)', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'base': {'STR': 17}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': False, 'attuned': True}, {'n': 'Longsword', 'q': 1, 'eq': True}]}, 'target': {'type': 'Dragon'}, 'expect': [['C.attacks.some(a=>a.xdice)', False]]}, {'name': 'Z3 U30 target differential Dragon-Kindled Edge2014', 'b': {'rs': '2014', 'cls': 'Fighter', 'level': 4, 'base': {'STR': 17}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}]}, 'target': {'type': 'Dragon'}, 'withoutGxFields': ['item', 'Dragon-Kindled Edge', 'Dragon-Kindled Edge', ['atkDice']], 'expect': [['C.attacks[1].xdice.length', 1]], 'expectWithout': [['!!C.attacks[1].xdice', False]], 'allow': ['^attacks\\.1\\.xdice\\.0\\.(d|t|s|roll|typeFrom)$', '^attacks\\.1\\.note$']}, {'name': 'Z3 U30 target Pact Dragon-Kindled EdgeNecrotic', 'b': {'cls': 'Warlock', 'level': 4, 'base': {'STR': 17, 'CHA': 18}, 'ch': {'invocation': ['Pact of the Blade'], 'pactWep': ['Dragon-Kindled Edge'], 'pactDmg': ['Necrotic']}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}]}, 'target': {'type': 'Dragon'}, 'expect': [['C.attacks.find(a=>a.n==="Dragon-Kindled Edge").type', 'Necrotic'], ['C.attacks.find(a=>a.n==="Dragon-Kindled Edge").xdice.length', 1], ['__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==="Dragon-Kindled Edge")].damageParts.length', 1], ['__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==="Dragon-Kindled Edge")].damageParts.at(-1).type', 'Necrotic']]}, {'name': 'Z3 U30 target Pact Dragon-Kindled EdgePsychic', 'b': {'cls': 'Warlock', 'level': 4, 'base': {'STR': 17, 'CHA': 18}, 'ch': {'invocation': ['Pact of the Blade'], 'pactWep': ['Dragon-Kindled Edge'], 'pactDmg': ['Psychic']}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}]}, 'target': {'type': 'Dragon'}, 'expect': [['C.attacks.find(a=>a.n==="Dragon-Kindled Edge").type', 'Psychic'], ['C.attacks.find(a=>a.n==="Dragon-Kindled Edge").xdice.length', 1], ['__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==="Dragon-Kindled Edge")].damageParts.length', 1], ['__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==="Dragon-Kindled Edge")].damageParts.at(-1).type', 'Psychic']]}, {'name': 'Z3 U30 target Pact Dragon-Kindled EdgeRadiant', 'b': {'cls': 'Warlock', 'level': 4, 'base': {'STR': 17, 'CHA': 18}, 'ch': {'invocation': ['Pact of the Blade'], 'pactWep': ['Dragon-Kindled Edge'], 'pactDmg': ['Radiant']}, 'inv': [{'n': 'Dragon-Kindled Edge', 'q': 1, 'eq': True, 'attuned': True}]}, 'target': {'type': 'Dragon'}, 'expect': [['C.attacks.find(a=>a.n==="Dragon-Kindled Edge").type', 'Radiant'], ['C.attacks.find(a=>a.n==="Dragon-Kindled Edge").xdice.length', 1], ['__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==="Dragon-Kindled Edge")].damageParts.length', 1], ['__deriveFor(C).atk[C.attacks.findIndex(a=>a.n==="Dragon-Kindled Edge")].damageParts.at(-1).type', 'Radiant']]}]


# Rogue Card follows the reviewed generated Simple Melee weapon producers.
for rs in ["2024","2014"]:
    CASES.append(dict(name="Z3 U30 Rogue Card generated Soulknife "+rs,b=dict(rs=rs,cls="Rogue",sub="Soulknife",level=4,inv=[dict(n="Rogue Card",q=1,eq=True)]),expect=[("C.attacks.filter(a=>['Psychic Blade','Psychic Blade (Bonus Action)'].includes(a.n)).length",2 if rs=="2024" else 0),("C.attacks.filter(a=>['Psychic Blade','Psychic Blade (Bonus Action)'].includes(a.n)).every(a=>a.spendDice.length===1&&a.spendDice[0].poolKey===C.inv[0].chargeKey)",True),("!!C.attacks.find(a=>a.n==='Unarmed Strike').spendDice",False)]))
    CASES.append(dict(name="NEG U30 Rogue Card Archer spell "+rs,b=dict(rs=rs,cls="Druid",sub="Circle of the Stars",level=4,extra={"sp":["Thorn Whip"]},inv=[dict(n="Rogue Card",q=1,eq=True)]),expect=[("C.attacks.filter(a=>a.n==='Starry Form: Archer').length",1 if rs=="2024" else 0),("C.attacks.filter(a=>a.n==='Starry Form: Archer'||a.n==='Thorn Whip'||a.n==='Unarmed Strike').every(a=>!a.spendDice)",True)]))
    CASES.append(dict(name="Z3 U30 Rogue Card Pole Strike "+rs,b=dict(rs=rs,cls="Fighter",level=4,ch={"feat4":{"feat":"Polearm Master","a1":"STR"}},inv=[dict(n="Rogue Card",q=1,eq=True),dict(n="Quarterstaff",q=1,eq=True)]),expect=[("C.attacks.filter(a=>a.of==='Quarterstaff').length",1),("C.attacks.filter(a=>a.of==='Quarterstaff').every(a=>a.spendDice.length===1&&a.spendDice[0].poolKey===C.inv[0].chargeKey)",True)]))

# U31: final Strength gates wielding only; spells, daily uses and anvil work
# remain independent. Iron Raze keeps its fixed Bludgeoning damage type.
U31_ROOT="Forgemaster's Might"
U31_ANVIL="Advantage on Smith's Tools checks to craft or repair an object using the hammer head as an anvil"
def u31name(base):return U31_ROOT+" ("+base+")"
def u31row(item):return "C.attacks.find(a=>a.n==="+json.dumps(item)+")"
def u31extra(rs):return {"species":"High Elf" if rs=="2014" else "Human"}
def u31independent():return [("C.spells.filter(s=>s.n==='Mending'&&s.src.includes(\"Forgemaster's Might\")).length",1)]+[("C.res.filter(r=>r.n==="+json.dumps(n+" (Forgemaster's Might)")+").length",1) for n in ["Creation","Fabricate"]]
for rs in ["2024","2014"]:
    for base in ["Maul","Warhammer"]:
        item=u31name(base)
        for strength in [16,17,18]:
            for target in ["Construct","Structure","Object","Dragon"]:
                wield=strength>=17;rider=wield and target in ["Construct","Structure"]
                a=u31row(item)
                checks=[("C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0)",strength),("C.attacks.some(a=>a.n==="+json.dumps(item)+")",wield),("!!"+u31row("Longsword")+".xdice",False),(u31row("Longsword")+".misc",0)]+u31independent()
                if wield:
                    checks += [(a+".misc",2),(a+".dmgBonus",2),(a+".type","Bludgeoning"),("!!"+a+".xdice",rider)]
                    if rider:checks += [(a+".xdice.length",1),(a+".xdice[0].d","2d8"),(a+".xdice[0].t","Bludgeoning"),(a+".xdice[0].roll",True)]
                else:checks.append(("(C.defenses||[]).some(d=>String(d.s||'').includes(\"Forgemaster's Might\")&&/Extra damage|2d8/.test(d.v||''))",False))
                CASES.append(dict(name=("Z3" if wield else "NEG")+" U31 Forge minimum Strength "+base+" "+rs+" STR"+str(strength)+" "+target,b=dict(rs=rs,cls="Fighter",level=4,base={"STR":strength},extra=u31extra(rs),inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Longsword",q=1,eq=True)]),target={"type":target},expect=checks))
        CASES.append(dict(name="Z3 U31 Forge Iron Raze differential "+base+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,base={"STR":17},extra=u31extra(rs),inv=[dict(n=item,q=1,eq=True,attuned=True)]),target={"type":"Construct"},withoutGxFields=["item",U31_ROOT,U31_ROOT,["atkDice"]],expect=[("C.attacks[1].xdice[0].d","2d8")],expectWithout=[("!!C.attacks[1].xdice",False)],allow=[r"^attacks\.1\.xdice\.0\.(d|t|s|roll)$",r"^attacks\.1\.note$"]))
        for strength in [16,17]:
            for chosen in ["Necrotic","Psychic","Radiant"]:
                checks=[("C.attacks.some(a=>a.n==="+json.dumps(item)+")",strength>=17)]+u31independent()
                if strength>=17:checks += [(u31row(item)+".type",chosen),(u31row(item)+".ab","CHA"),(u31row(item)+".xdice[0].t","Bludgeoning"),("__deriveFor(C).atk[1].damageParts.find(p=>p.type==='Bludgeoning').expr","2d8")]
                CASES.append(dict(name=("Z3" if strength>=17 else "NEG")+" U31 Forge high Charisma Pact "+base+" "+rs+" STR"+str(strength)+chosen,b=dict(rs=rs,cls="Warlock",level=4,base={"STR":strength,"CHA":20},extra=u31extra(rs),ch={"p3invocation" if rs=="2014" else "invocation":["Pact of the Blade"],"pactWep":[item],"pactDmg":[chosen]},inv=[dict(n=item,q=1,eq=True,attuned=True)]),target={"type":"Construct"},expect=checks if rs=="2024" else checks[:1]+u31independent()+([(u31row(item)+".type","Bludgeoning"),(u31row(item)+".xdice[0].t","Bludgeoning")] if strength>=17 else [])))
        for mode,base_strength,ch,boost in [("feat",15,{"feat4":{"feat":"Ability Score Improvement","a1":"STR","a2":"STR"}},[]),("gauntlets",8,{},[dict(n="Gauntlets of Ogre Power",q=1,eq=True,attuned=True)])]:
            final=17 if mode=="feat" else 19
            CASES.append(dict(name="Z3 U31 Forge final Strength from "+mode+" "+base+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,base={"STR":base_strength},extra=u31extra(rs),ch=ch,inv=[dict(n=item,q=1,eq=True,attuned=True)]+boost),target={"type":"Construct"},expect=[("C.abilities.STR.base+C.abilities.STR.bonus.reduce((n,x)=>n+x.v,0)",final),(u31row(item)+".xdice[0].d","2d8")]))
        potion=dict(rs=rs,cls="Fighter",level=4,base={"STR":8},extra=u31extra(rs),inv=[dict(n=item,q=1,eq=True,attuned=True),dict(n="Potion of Giant Strength (hill)",q=1,eq=False)])
        # The nested sheet call tests the consumed-state input without granting
        # broad diff exceptions for unrelated inventory presentation fields.
        CASES.append(dict(name="Z3 U31 Forge consumed final Strength "+base+" "+rs,b=potion,expect=[("C.attacks.some(a=>a.n==="+json.dumps(item)+")",False),("(()=>{const c=__bldSheetFor(structuredClone(__zmB),{'consumed-giant-hill':true},{type:'Construct'});return c.abilities.STR.base+c.abilities.STR.bonus.reduce((n,x)=>n+x.v,0)===21&&c.attacks.some(a=>a.n==="+json.dumps(item)+"&&a.xdice[0].d==='2d8')})()",True)]))
    for strength in [16,17]:
        for on in [False,True]:
            CASES.append(dict(name="Z3 U31 Forge anvil state "+rs+" STR"+str(strength)+str(on),b=dict(rs=rs,cls="Fighter",level=4,base={"STR":strength},extra=u31extra(rs),inv=[dict(n=U31_ROOT,q=1,eq=True,attuned=True)]),tog={"forge-anvil":on},expect=[("(C.defenses||[]).filter(d=>d.v==="+json.dumps(U31_ANVIL)+").length",1 if on else 0)]+u31independent(),allow=[r"^defenses(?:\.|$)",r"^fxToggles\.0\.on$"]))
    for q,eq,attuned in [(0,True,True),(1,True,False),(1,False,True)]:
        CASES.append(dict(name="NEG U31 Forge anvil source unavailable "+rs+str((q,eq,attuned)),b=dict(rs=rs,cls="Fighter",level=4,base={"STR":16},extra=u31extra(rs),inv=[dict(n=U31_ROOT,q=q,eq=eq,attuned=attuned)]),tog={"forge-anvil":True},expect=[("(C.defenses||[]).some(d=>d.v==="+json.dumps(U31_ANVIL)+")",False)],allow=[]))

# U32: Forge grants Mending while attuned, including when stowed or below the
# wielding minimum. Its repair capability is separate from a source of knowledge.
for rs in ["2024","2014"]:
    for base in ["Maul","Warhammer"]:
        item=u31name(base)
        for cls in ["Fighter","Wizard"]:
            independent=cls=="Wizard"
            for q,eq,attuned in [(1,True,True),(1,False,True),(0,True,True),(1,True,False),(1,False,False)]:
                grant=q>0 and attuned;known=grant or independent
                extra=u31extra(rs)
                if independent:extra=dict(extra,sp=["Mending"])
                rows="(C.spells||[]).filter(s=>s.n==='Mending')"
                checks=[(rows+".length>0",known),("C.attacks.some(a=>a.n==="+json.dumps(item)+")",False),(rows+".every(s=>!s.itc)",True),("C.res.filter(r=>r.n===\"Creation (Forgemaster's Might)\").length",1 if grant and eq else 0),("C.res.filter(r=>r.n===\"Fabricate (Forgemaster's Might)\").length",1 if grant and eq else 0)]
                if known:
                    checks += [(rows+".every(s=>s.objectRepair.spell==='Mending'&&s.objectRepair.maxBreakFeet==="+str(5 if grant else 1)+")",True)]
                    if grant:checks += [(rows+".some(s=>s.objectRepair.sources.some(x=>x.item==="+json.dumps(item)+"&&x.maxBreakFeet===5&&x.requiresAttunement===true&&x.itemState==='attuned'&&x.grantsKnowledge===true))",True)]
                    if independent:checks += [(rows+".some(s=>s.objectRepair.baseKnown===true)",True)]
                CASES.append(dict(name=("Z3" if grant else "NEG")+" U32 Forge Mending lifetime "+base+" "+rs+" "+cls+str((q,eq,attuned)),b=dict(rs=rs,cls=cls,level=4,base={"STR":16},extra=extra,inv=[dict(n=item,q=q,eq=eq,attuned=attuned)]),expect=checks))
        for eq in [False,True]:
            CASES.append(dict(name="Z3 U32 Forge repair cap differential "+base+" "+rs+" equipped "+str(eq),b=dict(rs=rs,cls="Fighter",level=4,base={"STR":16},extra=u31extra(rs),inv=[dict(n=item,q=1,eq=eq,attuned=True)]),withoutGxFields=["item",U31_ROOT,U31_ROOT,["objectRepair"]],expect=[("C.spells.find(s=>s.n==='Mending').objectRepair.maxBreakFeet",5)],expectWithout=[("C.spells.find(s=>s.n==='Mending').objectRepair.maxBreakFeet",1)],allow=[r"^spells\.\d+\.objectRepair\.maxBreakFeet$",r"^spells\.\d+\.objectRepair\.sources\.\d+\.maxBreakFeet$"]))

# U33: native tool forms expose a scoped item capability, never global training.
U33_ITEMS=["Manifold Tool","+1 All-Purpose Tool","+2 All-Purpose Tool","+3 All-Purpose Tool"]
U33_TOOLS=["Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools","Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools"]
for item in U33_ITEMS:
    cls="Fighter" if item=="Manifold Tool" else "Artificer"
    vector="(()=>{const names="+json.dumps(U33_TOOLS)+";return names.every(tool=>{const b=structuredClone(__zmB);b.inv[0].toolForm={v:1,tool,opaque:'keep'};const c=__bldSheetFor(b);return c.inv[0].toolForm.tool===tool&&c.inv[0].toolForm.opaque==='keep'&&c.inv[0].toolFormInfo.available===true&&c.inv[0].toolFormInfo.toolFormUsable===true&&JSON.stringify(c.profs.tools)===JSON.stringify(C.profs.tools)&&JSON.stringify(c.profSrc.tools)===JSON.stringify(C.profSrc.tools)&&JSON.stringify(c.res)===JSON.stringify(C.res)&&JSON.stringify(c.spellcasting)===JSON.stringify(C.spellcasting)})})()"
    CASES.append(dict(name="Z3 U33 native tool capability "+item,b=dict(cls=cls,level=4,inv=[dict(n=item,q=1,eq=False,attuned=True,toolForm={"v":1,"tool":None,"opaque":"keep"})]),expect=[("C.inv[0].toolForm.tool",None),("C.inv[0].toolForm.opaque","keep"),("C.inv[0].attunedActive",True),("C.inv[0].toolFormInfo.available",True),("C.inv[0].toolFormInfo.toolFormUsable",True),("C.inv[0].toolFormInfo.action","Magic" if item=="Manifold Tool" else "Action"),(vector,True)]))
for rs in ["2024","2014"]:
    for item,cls,q,eq,attuned,active in [("Manifold Tool","Wizard",1,False,True,True),("Manifold Tool","Fighter",0,True,True,False),("Manifold Tool","Fighter",1,True,False,False),("+1 All-Purpose Tool","Wizard",1,True,True,False),("+2 All-Purpose Tool","Artificer",1,False,True,True),("+3 All-Purpose Tool","Artificer",0,True,True,False),("+3 All-Purpose Tool","Artificer",1,True,False,False)]:
        CASES.append(dict(name=("Z3" if active else "NEG")+" U33 tool eligibility "+item+" "+rs+str((cls,q,eq,attuned)),b=dict(rs=rs,cls=cls,level=4,inv=[dict(n=item,q=q,eq=eq,attuned=attuned,toolForm={"v":1,"tool":"Smith's Tools"})]),expect=[("C.inv[0].toolForm.tool","Smith's Tools"),("C.inv[0].toolFormInfo.available",active),("C.inv[0].toolFormInfo.toolFormUsable",active),("C.profs.tools.includes(\"Smith's Tools\")",False)]))
    CASES.append(dict(name="NEG U33 tool capacity "+rs,b=dict(rs=rs,cls="Wizard",level=4,inv=[dict(n=n,q=1,eq=True,attuned=True) for n in ["Ring of Protection","Cloak of Protection","Amulet of Health"]]+[dict(n="Manifold Tool",q=1,eq=False,attuned=True,toolForm={"v":1,"tool":"Smith's Tools"})]),expect=[("C.inv[3].attunedActive",False),("C.inv[3].toolFormInfo.available",False),("C.inv[3].toolForm.tool","Smith's Tools")]))
    for level in [5,6]:
        expected=rs=="2014" and level==6
        CASES.append(dict(name=("Z3" if expected else "NEG")+" U33 typed tool expertise "+rs+" level"+str(level),b=dict(rs=rs,cls="Artificer",level=level,inv=[dict(n="Manifold Tool",q=1,eq=False,attuned=True,toolForm={"v":1,"tool":None})]),expect=[("(C.toolCheckRules||[]).filter(r=>r.kind==='proficient-tool-expertise').length",1 if expected else 0)]+([("C.toolCheckRules.find(r=>r.kind==='proficient-tool-expertise').source","Artificer: Tool Expertise"),("C.toolCheckRules.find(r=>r.kind==='proficient-tool-expertise').edition","2014")] if expected else [])))
CASES.append(dict(name="Z3 U33 missing tool state migrates to Basic",b=dict(cls="Fighter",level=4,inv=[dict(n="Manifold Tool",q=1,eq=False,attuned=True)]),expect=[("C.inv[0].toolForm.v",1),("C.inv[0].toolForm.tool",None),("C.inv[0].toolFormInfo.available",True),("C.profs.tools.includes(\"Smith's Tools\")",False)]))
for state in [{"v":9,"tool":"Smith's Tools","opaque":{"keep":True}},{"v":1,"tool":"Thieves' Tools","opaque":"keep"}]:
    CASES.append(dict(name="NEG U33 unsupported tool state "+str(state),b=dict(cls="Fighter",level=4,inv=[dict(n="Manifold Tool",q=1,eq=False,attuned=True,toolForm=state)]),expect=[("C.inv[0].toolForm",state),("C.inv[0].toolFormInfo.available",False),("C.inv[0].toolFormInfo.toolFormUsable",False)]))
CASES.append(dict(name="Z3 U33 two tool copies preserve independent forms",b=dict(cls="Fighter",level=4,inv=[dict(n="Manifold Tool",q=1,eq=False,attuned=True,toolForm={"v":1,"tool":"Smith's Tools"}),dict(n="Manifold Tool",q=1,eq=False,attuned=False,toolForm={"v":1,"tool":"Carpenter's Tools"})]),expect=[("C.inv[0].toolForm.tool","Smith's Tools"),("C.inv[1].toolForm.tool","Carpenter's Tools"),("C.inv[0].toolFormInfo.available",True),("C.inv[1].toolFormInfo.available",False),("C.profs.tools.includes(\"Smith's Tools\")",False),("C.profs.tools.includes(\"Carpenter's Tools\")",False)]))

# U34: carpets expose owned vehicle state; actor flight and other character rules stay independent.
U34_PROFILES=[("3x5",3,5,200,80),("4x6",4,6,400,60),("5x7",5,7,600,40),("6x9",6,9,800,30)]
U34_ITEMS=[("Carpet of Flying",None,"Magic")]+[("Carpet of Flying, "+str(w)+" ft. × "+str(h)+" ft.",size,"Action") for size,w,h,cap,fly in U34_PROFILES]
for rs in ["2024","2014"]:
    for item,size,action in U34_ITEMS:
        # Compare real builder outputs with the same owned carpet inactive, active,
        # unequipped, and absent. This is not a global Fly Speed grant.
        vector="(()=>{const fields=['speed','speedSrc','speeds','moves','profs','profSrc','res','spellcasting'];const b=structuredClone(__zmB);b.inv=[];const baseline=__bldSheetFor(b);return [false,true].every(active=>[false,true].every(eq=>{const next=structuredClone(__zmB);next.inv[0].eq=eq;next.inv[0].vehicle={v:1,active,size:"+json.dumps(size or "3x5")+",opaque:{keep:true}};const c=__bldSheetFor(next);return c.inv[0].vehicle.active===active&&c.inv[0].vehicle.opaque.keep===true&&c.inv[0].vehicleInfo.available===true&&c.inv[0].vehicleInfo.action==="+json.dumps(action)+"&&fields.every(k=>JSON.stringify(c[k])===JSON.stringify(baseline[k]))&&!c.inv[0].att&&!c.inv[0].attunedActive}))})()"
        CASES.append(dict(name="Z3 U34 native carpet profile "+item+" "+rs,b=dict(rs=rs,cls="Fighter",level=4,inv=[dict(n=item,q=1,eq=False,attuned=False)]),expect=[("C.inv[0].vehicle",{"v":1,"active":False,"size":size}),("C.inv[0].vehicleInfo.available",True),("C.inv[0].vehicleInfo.action",action),("C.inv[0].vehicleInfo.vehicleMeta.size",size),("C.inv[0].vehicleInfo.vehicleMeta.commandFeet",30),(vector,True)]))
for q,eq,available,reason in [(1,False,True,""),(1,True,True,""),(0,False,False,"source-unavailable"),(2,False,False,"split-required")]:
    CASES.append(dict(name=("Z3" if available else "NEG")+" U34 active carpet quantity and stow "+str((q,eq)),b=dict(cls="Fighter",level=4,inv=[dict(n="Carpet of Flying, 3 ft. × 5 ft.",q=q,eq=eq,attuned=False,vehicle={"v":1,"active":True,"size":"3x5","opaque":{"keep":True}})]),expect=[("C.inv[0].vehicle.active",True),("C.inv[0].vehicle.opaque",{"keep":True}),("C.inv[0].vehicleInfo.available",available),("C.inv[0].vehicleInfo.reason",reason),("C.inv[0].vehicleInfo.splitAvailable",q==2)]))
for state,reason in [({"v":9,"active":True,"size":"3x5","opaque":{"keep":True}},"unsupported-state"),({"v":1,"active":True,"size":"4x6","opaque":"keep"},"size-mismatch")]:
    CASES.append(dict(name="NEG U34 unsupported carpet state "+str(state),b=dict(cls="Fighter",level=4,inv=[dict(n="Carpet of Flying, 3 ft. × 5 ft.",q=1,eq=False,vehicle=state)]),expect=[("C.inv[0].vehicle",state),("C.inv[0].vehicleInfo.available",False),("C.inv[0].vehicleInfo.reason",reason)]))
CASES.append(dict(name="Z3 U34 two carpet copies retain distinct state",b=dict(cls="Fighter",level=4,inv=[dict(n="Carpet of Flying",q=1,eq=False,vehicle={"v":1,"active":True,"size":"3x5","opaque":"first"}),dict(n="Carpet of Flying",q=1,eq=False,vehicle={"v":1,"active":False,"size":"6x9","opaque":"second"})]),expect=[("C.inv.map(x=>x.vehicle)",[{"v":1,"active":True,"size":"3x5","opaque":"first"},{"v":1,"active":False,"size":"6x9","opaque":"second"}]),("C.inv.every(x=>x.vehicleInfo.available)",True),("!!(C.speeds&&C.speeds.fly)",False),("(C.moves||[]).some(x=>x.m==='fly')",False)]))
CASES.append(dict(name="NEG U34 ordinary Bedroll is not a carpet vehicle",b=dict(cls="Fighter",level=4,inv=[dict(n="Bedroll",q=1,eq=False)]),expect=[("!!C.inv[0].vehicleInfo",False),("!!C.inv[0].vehicle",False),("!!(C.speeds&&C.speeds.fly)",False)]))

# U35: All-Purpose Tool spell bonuses retain Artificer source identity even when both casters use INT.
U35_POTENCIES=[1,2,3]
for rs in ["2024","2014"]:
    for potency in U35_POTENCIES:
        item="+"+str(potency)+" All-Purpose Tool"
        for main,other in [("Artificer","Wizard"),("Wizard","Artificer")]:
            spells={"Artificer":["Ray of Frost","Faerie Fire"],"Wizard":["Fire Bolt","Burning Hands"]}
            vector="(()=>{const b=structuredClone(__zmB);b.inv=[];const base=__bldSheetFor(b);const channel=(c,k)=>(c.spellcasting.by||[]).find(x=>x.k===k)||c.spellcasting;return [[1,true,true],[1,false,true],[1,true,false],[0,true,true]].every(([q,eq,attuned])=>{const next=structuredClone(__zmB);Object.assign(next.inv[0],{q,eq,attuned});const c=__bldSheetFor(next),bonus=q&&eq&&attuned?"+str(potency)+":0;return channel(c,'Artificer').atk-base.spellcasting.atk===bonus&&channel(c,'Artificer').dc-base.spellcasting.dc===bonus&&channel(c,'Wizard').atk-base.spellcasting.atk===0&&channel(c,'Wizard').dc-base.spellcasting.dc===0&&JSON.stringify(c.saves)===JSON.stringify(base.saves)&&JSON.stringify(c.saveBonus)===JSON.stringify(base.saveBonus)&&JSON.stringify(c.saveNotes)===JSON.stringify(base.saveNotes)&&c.attacks.find(x=>x.n==='Ray of Frost').misc=== (bonus||undefined)&&!c.attacks.find(x=>x.n==='Fire Bolt').misc})})()"
            CASES.append(dict(name="Z3 U35 All-Purpose class spell channels "+item+" "+rs+" "+main+" first",b=dict(rs=rs,cls=main,level=2,base=dict(WL,INT=18),extra={"mc":[{"cls":other,"lv":2}],"sp":spells[main],"spm":{other:spells[other]}},inv=[dict(n=item,q=1,eq=True,attuned=True)]),expect=[("C.spellcasting.by.map(x=>x.k).sort()",["Artificer","Wizard"]),("C.spellcasting.by.find(x=>x.k==='Artificer').ab","INT"),("C.spellcasting.by.find(x=>x.k==='Wizard').ab","INT"),("C.spellcasting.by.find(x=>x.k==='Artificer').atk-C.spellcasting.by.find(x=>x.k==='Wizard').atk",potency),("C.spellcasting.by.find(x=>x.k==='Artificer').dc-C.spellcasting.by.find(x=>x.k==='Wizard').dc",potency),("C.spells.find(x=>x.n==='Ray of Frost').sourceKey","Artificer"),("C.spells.find(x=>x.n==='Fire Bolt').sourceKey","Wizard"),("C.spells.find(x=>x.n==='Faerie Fire').sourceKey","Artificer"),("C.spells.find(x=>x.n==='Burning Hands').sourceKey","Wizard"),("C.attacks.find(x=>x.n==='Ray of Frost').sourceKey","Artificer"),("C.attacks.find(x=>x.n==='Fire Bolt').sourceKey","Wizard"),("C.attacks.find(x=>x.n==='Ray of Frost').misc",potency),("!!C.attacks.find(x=>x.n==='Fire Bolt').misc",False),(vector,True)]))
        unchanged="(()=>{const b=structuredClone(__zmB);b.inv=[];const c=__bldSheetFor(b);return ['spellcasting','saves','saveBonus','saveNotes'].every(k=>JSON.stringify(c[k])===JSON.stringify(C[k]))&&C.inv[0].attunedActive===false})()"
        CASES.append(dict(name="NEG U35 All-Purpose no non-Artificer bonus "+item+" "+rs,b=dict(rs=rs,cls="Wizard",level=4,base=dict(WL,INT=18),extra={"sp":["Fire Bolt","Burning Hands"]},inv=[dict(n=item,q=1,eq=True,attuned=True)]),expect=[(unchanged,True),("!!C.attacks.find(x=>x.n==='Fire Bolt').misc",False)]))

# Refresh the real rule-link index with the case's source packs installed.
# U36: explicit actor game-time snapshots exercise the actual spell handlers.
def u36_temporal(item, elapsed=0, spell="Eldritch Blast", starts=(0,)):
    return dict(v=1,elapsedSeconds=elapsed,nextGrantId=len(starts)+1,grants=[dict(id="tc-"+str(i+1),sourceId="ap-1",item=item,spell=spell,startedAt=start,expiresAt=start+28800) for i,start in enumerate(starts)])

for rs in ["2014","2024"]:
    for potency in [1,2,3]:
        item="+"+str(potency)+" All-Purpose Tool"
        build=dict(rs=rs,cls="Artificer",level=4,base=dict(WL,INT=18),extra={"sp":["Ray of Frost"]},inv=[dict(n=item,q=1,eq=True,attuned=True)])
        for elapsed in [0,28799,28800]:
            live=elapsed<28800
            expect=[("C.spells.filter(s=>s.n==='Eldritch Blast').length",int(live)),("C.attacks.filter(a=>a.n==='Eldritch Blast').length",int(live)),("C.spells.some(s=>s.n==='Ray of Frost')",True)]
            if live:
                expect += [("C.spells.find(s=>s.n==='Eldritch Blast').sourceKey","Artificer"),("C.spells.find(s=>s.n==='Eldritch Blast').ab","INT"),("C.spells.find(s=>s.n==='Eldritch Blast').use","Temporary cantrip"),("C.spells.find(s=>s.n==='Eldritch Blast').temporaryCantrip.grantIds",["tc-1"]),("C.attacks.find(s=>s.n==='Eldritch Blast').misc",potency)]
            CASES.append(dict(name="Z3 U36 temporary cantrip "+item+" "+rs+" elapsed "+str(elapsed),b=build,temporal=u36_temporal(item,elapsed),expect=expect))
    item="+1 All-Purpose Tool"
    for elapsed,ids in [(3600,["tc-1","tc-2"]),(28800,["tc-2"]),(32400,[])]:
        CASES.append(dict(name="Z3 U36 overlapping permission "+rs+" elapsed "+str(elapsed),b=dict(rs=rs,cls="Wizard",level=4,base=dict(WL,INT=18),extra={"sp":["Fire Bolt"]}),temporal=u36_temporal(item,elapsed,starts=(0,3600)),expect=[("C.spells.filter(s=>s.n==='Eldritch Blast').length",int(bool(ids))),("(C.spells.find(s=>s.n==='Eldritch Blast')?.temporaryCantrip.grantIds)||[]",ids),("C.spells.some(s=>s.n==='Fire Bolt')",True)]))
    for spell in ["Magic Missile","Definitely not a cantrip"]:
        CASES.append(dict(name="NEG U36 invalid native cantrip "+rs+" "+spell,b=dict(rs=rs,cls="Artificer",level=4),temporal=u36_temporal(item,spell=spell),expect=[("C.spells.some(s=>s.temporaryCantrip)",False)]))

# U37 profiles are native vehicle statistics, never actor movement benefits.
U37_PROFILES={
    "Broom of Flying":dict(activation="Magic",normalCapacityLb=200,maxCapacityLb=400,flyFeet=50,loadedFlyFeet=30,requiresAttunement=True,spokenDirections=False,endsOnGetOff=True),
    "Bobbing Lily Pad":dict(activation=None,normalCapacityLb=300,maxCapacityLb=600,walkFeet=20,flyFeet=20,swimFeet=20,loadedFlyFeet=10,requiresAttunement=True,spokenDirections=True,swimSurfaceOnly=True),
}
for item,profile in U37_PROFILES.items():
    for rs in ["2014","2024"]:
        expected_profile=dict(profile)
        if item=="Broom of Flying" and rs=="2014":expected_profile.update(activation="Command word",requiresAttunement=False,endsOnGetOff=False)
        requires_attunement=expected_profile["requiresAttunement"]
        row=dict(n=item,q=1,eq=False,attuned=True)
        if item=="Broom of Flying":row["vehicle"]=dict(v=1,active=True,size=None)
        vector="(()=>{const baseline=structuredClone(__zmB);baseline.inv=[];const base=__bldSheetFor(baseline);const fields=['speed','speedSrc','speeds','moves','hp','res','profs','profSrc'];return [[1,false,true],[1,true,true],[1,false,false],[0,false,true],[2,false,true]].every(([q,eq,attuned])=>{const b=structuredClone(__zmB);Object.assign(b.inv[0],{q,eq,attuned});const c=__bldSheetFor(b);return c.inv[0].riddenVehicleInfo.available===!!(q===1&&("+("attuned" if requires_attunement else "true")+"))&&fields.every(k=>JSON.stringify(c[k])===JSON.stringify(base[k]))"+("&&c.inv[0].vehicle.active===true" if item=="Broom of Flying" else "&&c.inv[0].vehicle===undefined")+"})})()"
        CASES.append(dict(name="Z3 U37 native ridden vehicle "+item+" "+rs,b=dict(rs=rs,cls="Artificer",level=4,inv=[row]),expect=[("C.inv[0].riddenVehicleInfo.vehicleMeta",expected_profile),("C.inv[0].riddenVehicleInfo.nativeEdition",rs),("C.inv[0].riddenVehicleInfo.available",True),("!!C.inv[0].attunedActive",requires_attunement),(vector,True)]))
        if item=="Broom of Flying":
            inactive=dict(row,vehicle=dict(v=1,active=False,size=None))
            CASES.append(dict(name="Z3 U37 Broom active record difference "+rs,b=dict(rs=rs,cls="Artificer",level=4,inv=[row]),lo=dict(rs=rs,cls="Artificer",level=4,inv=[inactive]),expect=[("C.inv[0].vehicle.active",True),("C.inv[0].riddenVehicleInfo.endAvailable",True)],expectWithout=[("C.inv[0].vehicle.active",False)],allow=[r"^inv\.0\.(vehicle|riddenVehicleInfo)\."]))
for rs in ["2014","2024"]:
    future=dict(v=2,opaque={"preserve":True})
    CASES.append(dict(name="NEG U37 future Broom state preserved "+rs,b=dict(rs=rs,cls="Artificer",level=4,inv=[dict(n="Broom of Flying",q=1,eq=False,attuned=True,vehicle=future)]),expect=[("C.inv[0].vehicle",future),("C.inv[0].riddenVehicleInfo.available",False),("C.inv[0].riddenVehicleInfo.activationAvailable",False),("C.inv[0].riddenVehicleInfo.endAvailable",False)]))
for item in ["Carpet of Flying","Wings of Flying","Ornithopter of Flying"]:
    CASES.append(dict(name="NEG U37 unrelated ridden vehicle "+item,b=dict(rs="2024",cls="Artificer",level=4,inv=[dict(n=item,q=1,eq=False,attuned=True)]),expect=[("C.inv[0].riddenVehicleInfo===undefined",True)]))

# U38 oracle reads actual native feature objects, including separately named milestones.
U38_NATIVE={}
for filename in ["wotc09-subclasses-2014.js","tp14-tkdm.js","tp01-tdcsr.js","tp15-thhw.js"]:
    native_text=open(os.path.join(ROOT,"src","data",filename),encoding="utf-8").read()
    native_match=re.search(r"\bvar D\s*=",native_text)
    native_rows=json.JSONDecoder().raw_decode(native_text[native_match.end():])[0]
    for native in native_rows:
        owner=native.get("name","");text=native.get("full",{}).get(owner+"|Divine Strike","")
        if native.get("cls")!="Cleric" or "1d8" not in text:continue
        milestones=[(a[0],a[1],native.get("full",{}).get(owner+"|"+a[1],a[2])) for a in native.get("arr",[]) if a[1].startswith("Divine Strike")]
        upgrade=any("2d8" in feature for level,title,feature in milestones)
        weapon=bool(re.search(r"same type|weapon's type",text,re.I))
        types=re.findall(r"\b(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder)\b",text,re.I)
        U38_NATIVE[owner]=dict(sourceFile=filename,turn="own" if re.search(r"\byour turns?\b",text) else "any",creatureOnly="hit a creature" in text,upgrade=upgrade,typeFrom="weapon" if weapon else None,types=[x.title() for x in types],milestones=milestones)
assert len(U38_NATIVE)==31 and all(profile["upgrade"] for profile in U38_NATIVE.values())
U38_NO_AUTO="C.attacks.every(a=>!(a.xdice||[]).some(d=>/Divine Strike|Blessed Strikes/.test(d.note||''))&&!/Extra damage:.*(?:Divine Strike|Blessed Strikes)/.test(a.note||''))"
for owner,native in U38_NATIVE.items():
    for level in [7,8,13,14]:
        expect=[(U38_NO_AUTO,True)]
        if level<8:expect.append(("C.divineStrike===undefined",True))
        else:
            rule=dict(v=1,key="divine-strike",source=owner,feature="Divine Strike",turn=native["turn"],dice="2d8" if level>=14 else "1d8",creatureOnly=native["creatureOnly"])
            if native["typeFrom"]:rule["typeFrom"]="weapon"
            else:rule["types"]=native["types"]
            expect += [("C.divineStrike.rule",rule),("C.divineStrike.source",dict(kind="sub",owner=owner,classKey="Cleric",level=level,pre="",edition="2014"))]
        CASES.append(dict(name="Z3 U38 native Divine Strike "+owner+" level "+str(level),b=dict(rs="2014",cls="Cleric",sub=owner,level=level,base=dict(WL,WIS=18),inv=LS),expect=expect))
    for choice in ["Divine Strike","Potent Spellcasting"]:
        expect=[(U38_NO_AUTO,True)]
        if choice=="Divine Strike":expect += [("C.divineStrike.rule",dict(v=1,key="divine-strike",source="Cleric",feature="Blessed Strikes",turn="own",dice="2d8",creatureOnly=True,types=["Necrotic","Radiant"])),("C.divineStrike.source.kind","cls"),("C.divineStrike.source.owner","Cleric")]
        else:expect += [("C.divineStrike===undefined",True),("(C.spells.find(s=>s.n==='Sacred Flame').db||[]).reduce((n,x)=>n+x.v,0)",4),("(C.spells.find(s=>s.n==='Sacred Flame').db||[]).length",1)]
        CASES.append(dict(name="Z3 U38 current override "+owner+" "+choice,b=dict(rs="2024",cls="Cleric",sub=owner,level=14,base=dict(WL,WIS=18),ch={"p7opt":choice},extra={"sp":["Sacred Flame"]},inv=LS),expect=expect))
for level in [6,7,13,14]:
    for choice in ["Divine Strike",["Divine Strike"],["Divine Strike","Potent Spellcasting"],["Divine Strike","Divine Strike"],[]]:
        present=level>=7 and (choice=="Divine Strike" or choice==["Divine Strike"])
        expect=[("!!C.divineStrike",present),(U38_NO_AUTO,True)]
        if present:expect += [("C.divineStrike.rule.dice","2d8" if level>=14 else "1d8"),("C.divineStrike.rule.key","divine-strike")]
        CASES.append(dict(name="Z3 U38 selected current choice "+str(level)+" "+json.dumps(choice),b=dict(rs="2024",cls="Cleric",level=level,ch={"p7opt":choice},inv=LS),expect=expect))
for rs in ["2014","2024"]:
    for level in [6,7,8,13,14]:
        threshold=8 if rs=="2014" else 7;present=level>=threshold
        CASES.append(dict(name="Z3 U38 multiclass Cleric own level "+rs+" "+str(level),b=dict(rs=rs,cls="Fighter",level=6,extra={"mc":[dict(cls="Cleric",sub="Tempest Domain",lv=level)]},ch={"m0:p7opt":"Divine Strike"},inv=LS),expect=[("!!C.divineStrike",present),("C.divineStrike?.source.level||null",level if present else None),("C.divineStrike?.source.pre||null","m0:" if present else None),("C.divineStrike?.rule.dice||null",("2d8" if level>=14 else "1d8") if present else None),(U38_NO_AUTO,True)]))
for owner in ["Grave Domain (2014)","Peace Domain"]:
    for rs in ["2014","2024"]:
        CASES.append(dict(name="Z3 U38 legacy Potent compatibility "+owner+" "+rs,b=dict(rs=rs,cls="Cleric",sub=owner,level=14,ch={"p7opt":"Potent Spellcasting"} if rs=="2024" else {},base=dict(WL,WIS=18),extra={"sp":["Sacred Flame"]},inv=LS),expect=[("C.divineStrike===undefined",True),("(C.spells.find(s=>s.n==='Sacred Flame').db||[]).reduce((n,x)=>n+x.v,0)",4 if rs=="2024" else 0),("(C.spells.find(s=>s.n==='Sacred Flame').db||[]).length",1 if rs=="2024" else 0),(U38_NO_AUTO,True)]))
for owner in ["Cat Domain","Knowledge Domain (2014)"]:
    CASES.append(dict(name="NEG U38 no native weapon rider "+owner,b=dict(rs="2014",cls="Cleric",sub=owner,level=20,inv=LS),expect=[("C.divineStrike===undefined",True),(U38_NO_AUTO,True)]))

# __bldSheetFor restores its caller's packs, so a timer after a disposable build
# can warm the wrong index. Keep the case packs installed for both compared
# builds, then restore the exact previous fixture. HTML comparison stays strict;
# warming does not permit any additional changed paths.
for c in CASES:
    if c["name"] in ["Z3 U15 Potion of Giant Strength (fire)","Z3 U17 Gamma complete spell saves"] or ("U23 Lightbringer" in c["name"]) or c["name"] in ["Z3 U29 rider differential Duskcrusher 2024","Z3 U29 rider differential Dawnbringer 2024","Z3 U26 target differential Ruinblade 2024"]:c["warm"]=True

JS = r"""async (cases)=>{ if(window.__bldNeed) await window.__bldNeed();
 const flat=(o,p,out)=>{ if(o&&typeof o==='object'){ const ks=Object.keys(o); if(!ks.length) out[p]=JSON.stringify(o); ks.forEach(k=>flat(o[k],p?p+'.'+k:k,out)) } else out[p]=o; return out };
 const mk=(s,drop)=>{ const b=window.__bldTestB(); if(s.rs==='2014'){ b.rs='2014'; b.species='Human (2014)'; b.bg='Acolyte (2014)' }
   b.cls=s.cls; b.sub=s.sub||''; b.level=s.level; b.name='ZM'; b.ch=Object.assign({},s.ch); if(drop) for(const k in drop){ if(drop[k]===null) delete b.ch[k]; else b.ch[k]=drop[k] }
   b.inv=JSON.parse(JSON.stringify(s.inv||[])); b.weps=(s.inv||[]).map(x=>x.n); b.base=Object.assign({},b.base||{},s.base||{}); if(s.extra) Object.assign(b,s.extra); return b };
 const withoutWx=c=>{ const [sub,feature,keys]=c.withoutWx;
   const w=(window.WXS||[]).find(x=>x.name===sub&&x.cls===c.b.cls);
   if(!w) throw new Error('missing WXS '+sub);
   const rows=w.fx.filter(r=>r[1]===feature), old=rows.map(r=>r[2]);
   try{ rows.forEach(r=>{r[2]=Object.fromEntries(Object.entries(r[2]).filter(([k])=>!keys.includes(k)))}); return window.__bldSheetFor(mk(c.b,c.drop)) }
   finally{rows.forEach((r,i)=>{r[2]=old[i]})} };
 const withoutGx=c=>{const [sub,name,line,kind='sub']=c.withoutGx, table=window.GX[kind], old=table[sub];
   try{table[sub]=old.filter(e=>!(e.n===name&&(!line||(e.advOn||[]).includes(line))));return window.__bldSheetFor(mk(c.b))}
   finally{table[sub]=old} };
 const withoutGrant=c=>{const [sub,fields]=c.withoutGrant, table=window.SUB_GRANT||window.DataEnv.get('SUB_GRANT'), row=table[sub], old=fields.map(k=>row[k]);
   try{fields.forEach(k=>{delete row[k]});return c.withoutWx?withoutWx(c):window.__bldSheetFor(mk(c.b))}
   finally{fields.forEach((k,i)=>{row[k]=old[i]})} };
 const withoutGxFields=c=>{const [kind,owner,name,fields]=c.withoutGxFields,table=window.GX[kind],old=table[owner];
   try{table[owner]=old.map(e=>e.n===name?Object.fromEntries(Object.entries(e).filter(([k])=>!fields.includes(k))):e);return c.withoutWx?withoutWx(c):window.__bldSheetFor(mk(c.b),undefined,c.target)}
   finally{table[owner]=old} };
 const res=[],evaluators=new Map();
 // Compile before timer waits: CSP permits debugger evaluation, not dynamic code
 // created from a later timer callback. The page policy itself stays unchanged.
 cases.forEach(c=>[...c.expect,...(c.expectWithout||[])].forEach(([ex])=>{if(!evaluators.has(ex))evaluators.set(ex,new Function('C','return ('+ex+')'))}));
 for(const c of cases){ const r={name:c.name,fail:[]},warmBefore=c.warm?window.__bldTestB():null;
  try{ if(c.warm){window.__bldTestSet(mk(c.b));if(!window.__xl||typeof window.__xl.idx!=='function')throw new Error('missing rule-link index refresh hook');await new Promise(resolve=>setTimeout(resolve,260));window.__xl.idx()} const B0=mk(c.b); window.__zmB=B0; const C=window.__bldSheetFor(B0,c.tog||undefined,c.target,Object.prototype.hasOwnProperty.call(c,"temporal")?{temporaryCantrips:c.temporal}:undefined), C0=c.withoutGxFields?withoutGxFields(c):c.withoutGrant?withoutGrant(c):c.withoutGx?withoutGx(c):c.withoutWx?withoutWx(c):c.drop?window.__bldSheetFor(mk(c.b,c.drop)):(c.lo?window.__bldSheetFor(mk(c.lo)):(c.tog?window.__bldSheetFor(mk(c.b)):null));
   for(const [ex,want] of c.expect){ let got; try{ got=evaluators.get(ex)(C) }catch(e){ got='ERR '+e.message } if(JSON.stringify(got)!==JSON.stringify(want)) r.fail.push(ex+' = '+JSON.stringify(got)+', want '+JSON.stringify(want)) }
   for(const [ex,want] of c.expectWithout||[]){let got;try{got=evaluators.get(ex)(C0)}catch(e){got='ERR '+e.message}if(JSON.stringify(got)!==JSON.stringify(want))r.fail.push('without record: '+ex+' = '+JSON.stringify(got)+', want '+JSON.stringify(want))}
   r.flat=flat(C,'',{}); if(!c.drop&&!c.tog&&!c.lo&&!c.withoutWx&&!c.withoutGx&&!c.withoutGrant&&!c.withoutGxFields){ res.push(r); continue }
   const A=r.flat, Z=flat(C0,'',{}), rx=c.allow.map(s=>new RegExp(s)); const ch=[...new Set([...Object.keys(A),...Object.keys(Z)])].filter(k=>A[k]!==Z[k]);
   r.changed=ch.length; ch.filter(k=>!rx.some(x=>x.test(k))).slice(0,8).forEach(k=>r.fail.push('path changed outside allow: '+k+' '+JSON.stringify(Z[k])+' -> '+JSON.stringify(A[k])));
  }catch(e){ r.fail.push('ERR '+String(e.stack||e).slice(0,300)) }
  finally{if(warmBefore){window.__bldTestSet(null);if(JSON.stringify(window.__bldTestB())!==JSON.stringify(warmBefore))r.fail.push('rule-link warmup changed the previous build fixture')}}
  res.push(r) }
 return res }"""


def run(root, cases, errs):
    from playwright.sync_api import sync_playwright
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=root))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(service_workers="block").new_page(); pg.set_default_timeout(180000)
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.goto("http://127.0.0.1:%d/index.html" % port); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(2000)
        res = pg.evaluate(JS, cases); b.close()
    srv.shutdown()
    return res


def code_entries_have_cases():
    """Every entry of tests/clause_gate_code.json names a case here (the sheet change that makes the gate trust the code)."""
    try:
        ents = json.load(open(os.path.join(HERE, "clause_gate_code.json"), encoding="utf-8"))["entries"]
    except Exception as e:
        return ["cannot read clause_gate_code.json: %s" % e]
    names = [c["name"] for c in CASES]
    return ["clause_gate_code.json entry %s names the case %r, no case starts with it" % (e["id"], e["test"]) for e in ents if not any(n.startswith(e["test"]) for n in names)]


def main():
    cases = [c for c in CASES if not ONLY or ONLY in c["name"]]
    errs = []
    missing = code_entries_have_cases()
    for m in missing:
        print("FAIL", m)
    res = run(ROOT, cases, errs)
    if BASE:  # same build on the base checkout: only the paths in base_allow (or allow) may differ
        old = run(BASE, cases, [])
        for c, r, o in zip(cases, res, old):
            rx = [re.compile(x) for x in (c.get("base_allow") or c.get("allow") or [])]
            A, Z = r.get("flat") or {}, o.get("flat") or {}
            ch = [k for k in set(A) | set(Z) if A.get(k) != Z.get(k)]
            r["vsBase"] = len(ch)
            for k in sorted(ch):
                if not any(x.search(k) for x in rx):
                    r["fail"].append("vs base, path changed outside allow: %s %r -> %r" % (k, Z.get(k), A.get(k)))
                    if len(r["fail"]) > 8: break
    bad = 0
    for r in res:
        print(("ok  " if not r["fail"] else "FAIL"), r["name"], "(%s paths changed without the feature%s)" % (r.get("changed", "-"), ", %d vs base" % r["vsBase"] if "vsBase" in r else ""))
        for f in r["fail"]:
            print("      ", f)
        bad += bool(r["fail"])
    if errs:
        print("page errors:", errs[:3])
    print("%d cases, %d failed" % (len(res), bad))
    return 1 if bad or errs or missing else 0


if __name__ == "__main__":
    sys.exit(main())
