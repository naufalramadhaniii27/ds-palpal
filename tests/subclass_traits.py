#!/usr/bin/env python3
"""Fixed subclass traits added in 0.0.85 from tools/sheet_gaps.py (Tome of Heroes, 2014 rules): each shows from its level, not before.
python3 tests/subclass_traits.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASES = [  # class, subclass, level, check (JS on C), want
    ("Cleric", "Shadow Domain (ToH)", 3, "C.darkvision", 60), ("Cleric", "Shadow Domain (ToH)", 3, "(C.skills.find(s=>s.n==='Stealth')||{}).p||0", 1),
    ("Cleric", "Shadow Domain (ToH)", 2, "C.darkvision", 0), ("Rogue", "Dawn Blade", 3, "C.darkvision", 60),
    ("Rogue", "Smuggler", 17, "C.speed", 40), ("Rogue", "Smuggler", 16, "C.speed", 30),
    ("Rogue", "Smuggler", 17, "(C.defenses||[]).filter(d=>/Initiative/.test(d.v)).length", 1),
    ("Fighter", "Buccaneer", 3, "/Gunsmith's Tools/.test(C.profs.tools)&&/Vehicles \\(Water\\)/.test(C.profs.tools)?1:0", 1)]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    res = pg.evaluate("""(L)=>L.map(([cls,sub,lv,ex])=>{const o={sp:'Human (2014)',bg:'Acolyte (2014)',src:{phb14:true,dmg14:true,ttoh:true},rs:'2014',cls,sub,lv,arr:[15,14,13,12,10,8],b2:0,b1:0};
      window.__bldFuzz(Object.assign({},o,{lv:1}));const r=window.__bldFuzz(o);return (new Function('C','return '+ex))(r.c)})""", [c[:4] for c in CASES])
    for (cls, sub, lv, ex, want), got in zip(CASES, res):
        ok = got == want; bad += not ok
        print("%s %s %s %d: %s = %s (want %s)" % ("ok  " if ok else "FAIL", cls, sub, lv, ex[:40], got, want))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
