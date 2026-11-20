#!/usr/bin/env python3
"""2014 damage rows (CLS14[cls].fdmg) on the computed sheet: each 2014 class and subclass row shows under rule set 2014 with the
right dice, and never under 2024. Before this a 2014 build showed only Sneak Attack.  python3 tests/xdmg14.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B14 = {"sp": "Human (2014)", "bg": "Soldier (2014)", "rs": "2014", "src": {"phb14": True, "dmg14": True}}
B24 = {"sp": "Human", "bg": "Soldier", "rs": "2024"}
# array 15 14 13 12 10 8 + Human (2014) +1: STR+3 DEX+2 CON+2 INT+1 WIS+0 CHA-1
CASES = [  # (build, rows that must be there, rows that must not)
    (dict(B14, cls="Paladin", lv=2), ["Divine Smite 2d8"], ["Improved Divine Smite", "Radiant Strikes"]),
    (dict(B14, cls="Paladin", lv=11), ["Divine Smite 2d8", "Improved Divine Smite 1d8"], ["Radiant Strikes"]),
    (dict(B14, cls="Paladin", sub="Oath of Devotion (2014)", lv=20), ["Holy Nimbus 10"], []),
    (dict(B14, cls="Monk", lv=4), ["Martial Arts 1d4"], []),
    (dict(B14, cls="Monk", lv=17), ["Martial Arts 1d10"], []),
    (dict(B14, cls="Monk", sub="Way of the Open Hand", lv=17), ["Quivering Palm 10d6 CON 14"], []),
    (dict(B14, cls="Monk", sub="Way of Mercy", lv=5), ["Hand of Harm 1d6+0"], []),
    (dict(B14, cls="Cleric", sub="Life Domain (2014)", lv=7), [], ["Divine Strike"]),
    (dict(B14, cls="Cleric", sub="Life Domain (2014)", lv=8), ["Divine Strike 1d8"], []),
    (dict(B14, cls="Cleric", sub="Tempest Domain", lv=14), ["Divine Strike 2d8", "Wrath of the Storm 2d8 DEX 13"], []),
    (dict(B14, cls="Cleric", sub="Light Domain (2014)", lv=5), ["Radiance of the Dawn 2d10+5 CON 11"], ["Divine Strike"]),
    (dict(B14, cls="Cleric", sub="Death Domain", lv=6), ["Touch of Death 17"], []),
    (dict(B14, cls="Barbarian", sub="Path of the Zealot (2014)", lv=9), ["Divine Fury 1d6+4"], ["Brutal Strike"]),
    (dict(B14, cls="Fighter", sub="Psi Warrior (2014)", lv=11), ["Psionic Strike 1d10+1"], []),
    (dict(B14, cls="Ranger", sub="Hunter (2014)", lv=3), ["Colossus Slayer 1d8"], []),
    (dict(B14, cls="Ranger", sub="Gloom Stalker (2014)", lv=3), ["Dread Ambusher 1d8"], ["Dreadful Strike "]),
    (dict(B14, cls="Ranger", sub="Horizon Walker", lv=11), ["Planar Warrior 2d8"], []),
    (dict(B14, cls="Ranger", sub="Monster Slayer", lv=3), ["Slayer's Prey 1d6"], []),
    (dict(B14, cls="Rogue", sub="Soulknife (2014)", lv=3), ["Sneak Attack 2d6", "Psychic Blades 1d6"], []),
    (dict(B14, cls="Warlock", sub="The Hexblade", lv=5), ["Hexblade's Curse 3"], []),
    (dict(B14, cls="Warlock", sub="The Fiend (2014)", lv=14), ["Hurl Through Hell 10d10"], []),
    (dict(B14, cls="Sorcerer", sub="Draconic Bloodline", lv=6), ["Elemental Affinity -1"], []),
    (dict(B14, cls="Wizard", sub="School of Evocation", lv=10), ["Empowered Evocation 1"], []),
    (dict(B14, cls="Druid", sub="Circle of Stars", lv=10), ["Starry Form: Archer 2d8+0"], []),
    # 2024: no 2014 row
    (dict(B24, cls="Paladin", lv=11), ["Radiant Strikes 1d8"], ["Divine Smite", "Improved Divine Smite"]),
    (dict(B24, cls="Monk", lv=5), [], ["Martial Arts"]),
    (dict(B24, cls="Cleric", lv=8), [], ["Wrath of the Storm", "Touch of Death"]),
]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    for o, want, deny in CASES:
        o = dict({"sub": ""}, **o, arr=[15, 14, 13, 12, 10, 8], b2=0, b1=0)
        rows = pg.evaluate("o=>{const r=window.__bldFuzz(o);return r&&r.c?(r.c.xdmg||[]).map(x=>(x.n+' '+x.dmg+' '+x.save+' '+(x.dc==null?'':x.dc)).replace(/ +/g,' ').trim()):['ERR '+(r&&r.err)]}", o)
        miss = [w for w in want if not any(r == w or r.startswith(w + " ") for r in rows)]
        extra = [d for d in deny if any(r.startswith(d) for r in rows)]
        ok = not miss and not extra; bad += not ok
        print("%s %s %s %s %d%s" % ("ok  " if ok else "FAIL", o["rs"], o["cls"], o["sub"], o["lv"], "" if ok else " missing %s, unwanted %s, rows %s" % (miss, extra, rows)))
    br.close()
print("%d cases, %d failed" % (len(CASES), bad)); sys.exit(1 if bad else 0)
