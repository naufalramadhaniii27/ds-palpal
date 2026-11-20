#!/usr/bin/env python3
"""Damage rows (FDMG) per rule set: a 2014 class shows no 2024-only class row, and the 2024 Rogue shows Cunning Strike with the right DC.
Before 0.0.84 a 2014 Cleric listed Divine Spark and Sear Undead, and no Rogue showed a Cunning Strike DC.  python3 tests/xdmg_edition.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B14 = {"sp": "Human (2014)", "bg": "Soldier (2014)", "rs": "2014", "src": {"phb14": True, "dmg14": True}}
B24 = {"sp": "Human", "bg": "Soldier", "rs": "2024"}
CASES = [  # (build, rows that must be there, rows that must not)
    (dict(B14, cls="Cleric", lv=5), [], ["Divine Spark", "Sear Undead"]),
    (dict(B14, cls="Rogue", lv=14), ["Sneak Attack 7d6"], ["Cunning Strike", "Devious Strikes"]),
    (dict(B14, cls="Barbarian", lv=9), [], ["Brutal Strike"]),
    (dict(B24, cls="Cleric", lv=5), ["Divine Spark 1d8", "Sear Undead 1d8"], []),
    (dict(B24, cls="Rogue", lv=4), ["Sneak Attack 2d6"], ["Cunning Strike"]),
    (dict(B24, cls="Rogue", lv=5), ["Cunning Strike (Poison) -1d6 CON 13", "Cunning Strike (Trip) -1d6 DEX 13", "Cunning Strike (Withdraw) -1d6"], ["Devious Strikes"]),
    (dict(B24, cls="Rogue", lv=14), ["Devious Strikes (Knock Out) -6d6 CON 15", "Devious Strikes (Obscure) -3d6 DEX 15"], []),
]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    for o, want, deny in CASES:
        o = dict(o, sub="", arr=[15, 14, 13, 12, 10, 8], b2=0, b1=0)
        rows = pg.evaluate("o=>{const r=window.__bldFuzz(o);return r&&r.c?(r.c.xdmg||[]).map(x=>(x.n+' '+x.dmg+' '+x.save+' '+(x.dc==null?'':x.dc)).replace(/ +/g,' ').trim()):['ERR '+(r&&r.err)]}", o)
        miss = [w for w in want if not any(r.startswith(w) for r in rows)]
        extra = [d for d in deny if any(r.startswith(d) for r in rows)]
        ok = not miss and not extra; bad += not ok
        print("%s %s %s %d%s" % ("ok  " if ok else "FAIL", o["rs"], o["cls"], o["lv"], "" if ok else " missing %s, unwanted %s, rows %s" % (miss, extra, rows)))
    br.close()
print("%d cases, %d failed" % (len(CASES), bad)); sys.exit(1 if bad else 0)
