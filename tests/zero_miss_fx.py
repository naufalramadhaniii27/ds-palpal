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
    spd("Z2 Aberrant Sorcery 6, Revelation in Flesh aquatic: Swim Speed twice your Speed", dict(cls="Sorcerer", level=6, sub="Aberrant Sorcery", base=WL), {"flesh-aquatic": True}, [(MV, '["swim:60"]')]),
    spd("Z2 Aberrant Sorcery 6, Revelation in Flesh flight: Fly Speed equals Speed", dict(cls="Sorcerer", level=6, sub="Aberrant Sorcery", base=WL), {"flesh-flight": True}, [(MV, '["fly:30"]')]),
    spd("Z2 Oath of Vengeance 20 (2024), Avenging Angel: Fly Speed 60 ft", dict(cls="Paladin", level=20, sub="Oath of Vengeance", base=WL), {"avenging-angel": True}, [(MV, '["fly:60"]')]),
    spd("Z2 Oath of Vengeance 20 (2014), Avenging Angel: Fly Speed 60 ft", dict(rs="2014", cls="Paladin", level=20, sub="Oath of Vengeance (2014)", base=WL), {"avenging-angel": True}, [(MV, '["fly:60"]')]),
    spd("Z2 Psi Warrior 11, Telekinetic Adept: Fly Speed twice your Speed", dict(cls="Fighter", level=11, sub="Psi Warrior", base=WL), {"psi-leap": True}, [(MV, '["fly:60"]')]),
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

JS = r"""async (cases)=>{ if(window.__bldNeed) await window.__bldNeed();
 const flat=(o,p,out)=>{ if(o&&typeof o==='object'){ const ks=Object.keys(o); if(!ks.length) out[p]=JSON.stringify(o); ks.forEach(k=>flat(o[k],p?p+'.'+k:k,out)) } else out[p]=o; return out };
 const mk=(s,drop)=>{ const b=window.__bldTestB(); if(s.rs==='2014'){ b.rs='2014'; b.species='Human (2014)'; b.bg='Acolyte (2014)' }
   b.cls=s.cls; b.sub=s.sub||''; b.level=s.level; b.name='ZM'; b.ch=Object.assign({},s.ch); if(drop) for(const k in drop){ if(drop[k]===null) delete b.ch[k]; else b.ch[k]=drop[k] }
   b.inv=JSON.parse(JSON.stringify(s.inv||[])); b.weps=(s.inv||[]).map(x=>x.n); b.base=Object.assign({},b.base||{},s.base||{}); if(s.extra) Object.assign(b,s.extra); return b };
 const res=[];
 for(const c of cases){ const r={name:c.name,fail:[]};
  try{ const B0=mk(c.b); window.__zmB=B0; const C=window.__bldSheetFor(B0,c.tog||undefined), C0=c.drop?window.__bldSheetFor(mk(c.b,c.drop)):(c.tog?window.__bldSheetFor(mk(c.b)):null);
   for(const [ex,want] of c.expect){ let got; try{ got=(new Function('C','return ('+ex+')'))(C) }catch(e){ got='ERR '+e.message } if(JSON.stringify(got)!==JSON.stringify(want)) r.fail.push(ex+' = '+JSON.stringify(got)+', want '+JSON.stringify(want)) }
   r.flat=flat(C,'',{}); if(!c.drop&&!c.tog){ res.push(r); continue }
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


def main():
    cases = [c for c in CASES if not ONLY or ONLY in c["name"]]
    errs = []
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
    return 1 if bad or errs else 0


if __name__ == "__main__":
    sys.exit(main())
