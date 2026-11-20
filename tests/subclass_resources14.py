#!/usr/bin/env python3
"""2014 subclass limited uses on the computed sheet (rule set 2014, WotC books). One browser session.
  python3 tests/subclass_resources14.py [--root DIR]
Rows whose max is a formula (ability modifier, Proficiency Bonus, level) are checked with two ability arrays, so a fixed max
(the old Arcane Ward bug: max 1 instead of 2 x Wizard level + Int mod) shows as a difference. Arrays in STR..CHA order, Human +1 to all:
  A = 15 14 13 12 10 8  -> mods +3 +2 +2 +1 +0 -1
  B = 10 12 14 16 18 20 -> mods +0 +1 +2 +3 +4 +5
  C = 8 10 20 12 14 16  -> mods -1 +0 +5 +1 +2 +3
Exit 1 on any difference."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return "http://127.0.0.1:%d/index.html" % p

ARR = {"A": [15, 14, 13, 12, 10, 8], "B": [10, 12, 14, 16, 18, 20], "C": [8, 10, 20, 12, 14, 16]}
# (class, subclass, level, array, row, max)
CASES = [
    ("Wizard", "School of Abjuration", 3, "A", "Arcane Ward", 7), ("Wizard", "School of Abjuration", 20, "B", "Arcane Ward", 43),
    ("Wizard", "School of Divination", 3, "A", "Portent dice", 2), ("Wizard", "School of Divination", 14, "A", "Portent dice", 3),
    ("Wizard", "War Magic", 20, "B", "Power Surges", 3), ("Wizard", "Chronurgy Magic", 20, "B", "Momentary Stasis", 3),
    ("Wizard", "Graviturgy Magic", 20, "B", "Violent Attraction", 3), ("Wizard", "Bladesinging", 20, "A", "Bladesong", 6),
    ("Cleric", "Light Domain (2014)", 3, "A", "Warding Flare", 1), ("Cleric", "Light Domain (2014)", 20, "B", "Warding Flare", 4),
    ("Cleric", "Tempest Domain", 20, "B", "Wrath of the Storm", 4), ("Cleric", "War Domain (2014)", 20, "B", "War Priest", 4),
    ("Cleric", "Grave Domain (2014)", 20, "B", "Eyes of the Grave", 4), ("Cleric", "Order Domain", 20, "B", "Embodiment of the Law", 4),
    ("Cleric", "Peace Domain", 20, "A", "Emboldening Bond", 6), ("Druid", "Circle of Spores", 20, "B", "Fungal Infestation", 4),
    ("Druid", "Circle of Dreams", 20, "B", "Hidden Paths", 4), ("Druid", "Circle of Dreams", 10, "A", "Balm of the Summer Court (d6)", 10),
    ("Bard", "College of Eloquence", 20, "B", "Infectious Inspiration", 5), ("Paladin", "Oath of Glory (2014)", 20, "B", "Glorious Defense", 5),
    ("Ranger", "Fey Wanderer (2014)", 20, "B", "Misty Step (free)", 4), ("Ranger", "Monster Slayer", 20, "B", "Hunter's Sense", 4),
    ("Rogue", "Inquisitive", 20, "B", "Unerring Eye", 4), ("Rogue", "Soulknife (2014)", 20, "A", "Psionic Energy Dice", 12),
    ("Fighter", "Psi Warrior (2014)", 3, "A", "Psionic Energy Dice", 4), ("Fighter", "Battle Master (2014)", 15, "A", "Superiority Dice", 6),
    ("Fighter", "Cavalier", 20, "A", "Unwavering Mark (strikes)", 3), ("Fighter", "Cavalier", 20, "C", "Warding Maneuver", 5),
    ("Fighter", "Echo Knight", 20, "C", "Unleash Incarnation", 5), ("Fighter", "Echo Knight", 20, "C", "Reclaim Potential", 5),
    ("Fighter", "Samurai", 20, "A", "Fighting Spirit", 3), ("Fighter", "Rune Knight", 20, "A", "Giant's Might", 6),
    ("Warlock", "The Celestial", 3, "A", "Healing Light (d6 pool)", 4), ("Warlock", "The Celestial", 20, "A", "Healing Light (d6 pool)", 21),
    ("Barbarian", "Path of Wild Magic", 20, "A", "Magic Awareness", 6), ("Sorcerer", "Clockwork Soul", 20, "A", "Restore Balance", 6),
]
SRC = {k: True for k in ["phb14", "dmg14", "xge", "tce", "scag", "egw", "ftd", "vrgr", "psa", "psk", "dsotdq", "bgg"]}
JS = """([cs,src])=>cs.map(([cls,sub,lv,arr,n])=>{try{const r=window.__bldFuzz({sp:'Human (2014)',bg:'Soldier (2014)',rs:'2014',src,cls,sub,lv,arr,b2:0,b1:0});
 if(!r||r.err)return 'err '+(r&&r.err);const x=(r.c.res||[]).filter(q=>q.n==n)[0];return x?x.max:null}catch(e){return 'err '+e}})"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(serve()); await pg.wait_for_function("()=>!!window.__bldFuzz", timeout=120000)
        await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        got = await pg.evaluate(JS, [[[c, s, l, ARR[k], n] for c, s, l, k, n, _ in CASES], SRC]); await b.close()
    bad = [(c, g) for c, g in zip(CASES, got) if g != c[5]]
    for c, g in bad: print("WRONG %s / %s lv %d arr %s: %s = %s, expected %s" % (c[0], c[1], c[2], c[3], c[4], g, c[5]))
    print("subclass_resources14: %d values checked, %d wrong" % (len(CASES), len(bad))); sys.exit(1 if bad else 0)

asyncio.run(main())
