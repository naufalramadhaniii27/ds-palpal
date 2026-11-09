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
    z3("Z4 Rogue 7 (2014) Reliable Talent: the same line in the 2014 build", dict(rs="2014", cls="Rogue", level=7, base=WL), [(NT("Reliable Talent", "9 or lower counts as a 10"), True)]),
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
