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
         expect=[("/Extra damage: \\+2d10 Radiant against a Fiend or an Undead/.test(C.attacks.find(a=>/Holy Avenger/.test(a.n)).note)", True)],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Flame Tongue variant row (Rapier) gets the 2d6 Fire note", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Flame Tongue (Rapier)", "q": 1, "eq": True}], base=WL),
         expect=[("/\\+2d6 Fire while the weapon is burning/.test(C.attacks.find(a=>/Flame Tongue/.test(a.n)).note)", True)],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Sun Blade: 1d8 Radiant against an Undead, Radiant and Finesse kept", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Sun Blade", "q": 1, "eq": True}], base=WL),
         expect=[("/\\+1d8 Radiant against an Undead/.test(C.attacks[1].note)", True), ("C.attacks[1].type", "Radiant")],
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
    bb = dict(cls="Cleric", level=8, sub=sub, inv=LS, base=WL, src=dict(SRCS, tce=True, xge=True, dmg14=True))
    if rs: bb["rs"] = rs
    CASES.append(dict(name="Z2 %s Divine Strike: +1d8 once per turn on a weapon hit" % sub, b=bb,
                      expect=[("/Extra damage: \\+1d8 %s/.test(C.attacks.find(a=>a.n==='Longsword').note)" % typ, True), ("C.attacks.find(a=>a.n==='Longsword').xdice.length", 1)],
                      base_allow=[ATK + r"(note|xdice\.)"]))
CASES.append(dict(name="Z2 Life Domain 14 (2014) Divine Strike: a second 1d8 (2d8 in all)", b=dict(rs="2014", cls="Cleric", level=14, sub="Life Domain (2014)", inv=LS, base=WL),
                  expect=[("C.attacks.find(a=>a.n==='Longsword').xdice.map(x=>x.d).join()", "1d8,1d8")], base_allow=[ATK + r"(note|xdice\.)"]))
CASES.append(dict(name="Z2 Blood Domain 14 Divine Strike: the second 1d8 was missing", b=dict(cls="Cleric", level=14, sub="Blood Domain", inv=LS, base=WL, src=dict(SRCS, tdcsr=True)),
                  expect=[("C.attacks.find(a=>a.n==='Longsword').xdice.map(x=>x.d).join()", "1d8,1d8")], base_allow=[ATK + r"(note|xdice\.)"]))
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
    dict(name="NEG U2 Dungeon Delver (2014) not taken: no trap Resistance", b=dict(rs="2014", cls="Fighter", level=4, base=WL),
         expect=[(RESU("Dungeon Delver", "Damage dealt by traps"), False)], base_allow=[r".*"]),
]

JS = r"""async (cases)=>{ if(window.__bldNeed) await window.__bldNeed();
 const flat=(o,p,out)=>{ if(o&&typeof o==='object'){ const ks=Object.keys(o); if(!ks.length) out[p]=JSON.stringify(o); ks.forEach(k=>flat(o[k],p?p+'.'+k:k,out)) } else out[p]=o; return out };
 const mk=(s,drop)=>{ const b=window.__bldTestB(); if(s.rs==='2014'){ b.rs='2014'; b.species='Human (2014)'; b.bg='Acolyte (2014)' }
   b.cls=s.cls; b.sub=s.sub||''; b.level=s.level; b.name='ZM'; b.ch=Object.assign({},s.ch); if(drop) for(const k in drop){ if(drop[k]===null) delete b.ch[k]; else b.ch[k]=drop[k] }
   b.inv=JSON.parse(JSON.stringify(s.inv||[])); b.weps=(s.inv||[]).map(x=>x.n); b.base=Object.assign({},b.base||{},s.base||{}); if(s.extra) Object.assign(b,s.extra); return b };
 const res=[];
 for(const c of cases){ const r={name:c.name,fail:[]};
  try{ const B0=mk(c.b); window.__zmB=B0; const C=window.__bldSheetFor(B0,c.tog||undefined), C0=c.drop?window.__bldSheetFor(mk(c.b,c.drop)):(c.lo?window.__bldSheetFor(mk(c.lo)):(c.tog?window.__bldSheetFor(mk(c.b)):null));
   for(const [ex,want] of c.expect){ let got; try{ got=(new Function('C','return ('+ex+')'))(C) }catch(e){ got='ERR '+e.message } if(JSON.stringify(got)!==JSON.stringify(want)) r.fail.push(ex+' = '+JSON.stringify(got)+', want '+JSON.stringify(want)) }
   r.flat=flat(C,'',{}); if(!c.drop&&!c.tog&&!c.lo){ res.push(r); continue }
   const A=r.flat, Z=flat(C0,'',{}), rx=c.allow.map(s=>new RegExp(s)); const ch=[...new Set([...Object.keys(A),...Object.keys(Z)])].filter(k=>A[k]!==Z[k]);
   r.changed=ch.length; ch.filter(k=>!rx.some(x=>x.test(k))).slice(0,8).forEach(k=>r.fail.push('path changed outside allow: '+k+' '+JSON.stringify(Z[k])+' -> '+JSON.stringify(A[k])));
  }catch(e){ r.fail.push('ERR '+String(e.stack||e).slice(0,300)) }
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
