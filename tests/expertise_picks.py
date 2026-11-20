#!/usr/bin/env python3
"""Expertise picks: Quick Build never gives Expertise twice to one skill, and the rule check flags a build that does.
Before 0.0.85 Quick Build gave a Rogue 6 or Bard 9 the same two skills at both Expertise levels (2 Expertise instead of 4).  python3 tests/expertise_picks.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = {"sp": "Human", "bg": "Soldier", "rs": "2024", "sub": "", "arr": [15, 14, 13, 12, 10, 8], "b2": 0, "b1": 0}
CASES = [("Rogue", 1, 2), ("Rogue", 6, 4), ("Bard", 2, 2), ("Bard", 9, 4)]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldIssuesFor==='function'"): break
        pg.wait_for_timeout(100)
    for cls, lv, want in CASES:
        r = pg.evaluate("o=>{const r=window.__bldFuzz(o);return {n:r.c.skills.filter(s=>s.p==2).length,ri:r.ri}}", dict(BASE, cls=cls, lv=lv))
        ok = r["n"] == want and not r["ri"]; bad += not ok
        print("%s Quick Build %s %d: %d Expertise skills (want %d)%s" % ("ok  " if ok else "FAIL", cls, lv, r["n"], want, "" if not r["ri"] else ", issues %s" % r["ri"]))
    msg = pg.evaluate("""()=>{const b=window.__bldFuzz({sp:'Human',bg:'Soldier',rs:'2024',sub:'',arr:[15,14,13,12,10,8],b2:0,b1:0,cls:'Rogue',lv:6}).b;
      b.ch.p6expertise=[b.ch.p1expertise[0],b.ch.p6expertise[1]];return window.__bldIssuesFor(b)}""")
    ok = any("already has Expertise" in m for m in msg); bad += not ok
    print("%s rule check flags a repeated Expertise pick: %s" % ("ok  " if ok else "FAIL", msg))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
