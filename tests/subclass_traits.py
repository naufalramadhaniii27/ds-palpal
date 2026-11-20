#!/usr/bin/env python3
"""Fixed subclass traits added in 0.0.85 from tools/sheet_gaps.py (Tome of Heroes, 2014 rules; World of Warcraft class features, 2024 rules): each shows from its level, not before.
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
TOH = ("2014", {"phb14": True, "dmg14": True, "ttoh": True})
CASES = [c + TOH for c in CASES] + [(c + ("2024", {"twow": True})) for c in [  # World of Warcraft class features (fx-A-class-species.js)
    ("Shaman", "", 20, "C.abilities.STR.bonus.concat(C.abilities.CON.bonus).filter(b=>/Primal Champion/.test(b.s)).length", 2),
    ("Shaman", "", 19, "C.abilities.STR.bonus.filter(b=>/Primal Champion/.test(b.s)).length", 0),
    ("Demon Hunter", "Demon Hunter", 18, "((C.senses||[]).find(s=>s.n==='Truesight')||{}).v||0", 30),
    ("Demon Hunter", "Demon Hunter", 17, "((C.senses||[]).find(s=>s.n==='Truesight')||{}).v||0", 0)]]
B14 = lambda b: ("2014", {"phb14": True, "dmg14": True, b: True})
CASES += [  # small third-party 2014 books (fx-F-sub.js, fx-L12.js)
    ("Cleric", "Sun Above Domain", 3, "/Laser Sword/.test(C.profs.weapons)?1:0", 1) + B14("tdm14"), ("Cleric", "Sun Above Domain", 2, "/Laser Sword/.test(C.profs.weapons)?1:0", 0) + B14("tdm14"),
    ("Fighter", "Living Crucible (2014)", 3, "((C.toolExp||[]).find(t=>t.n===\"Alchemist's Supplies\")||{}).v||0", 4) + B14("tgh14p"),
    ("Ranger", "Green Reaper (2014)", 3, "((C.toolExp||[]).find(t=>t.n===\"Poisoner's Kit\")||{}).v||0", 4) + B14("tgh14p"),
    ("Warlock", "The Predator", 3, "(C.skills.find(s=>s.n==='Survival')||{}).p||0", 2) + B14("thhw"), ("Warlock", "The Predator", 2, "(C.skills.find(s=>s.n==='Survival')||{}).p||0", 0) + B14("thhw")]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    res = pg.evaluate("""(L)=>L.map(([cls,sub,lv,ex,rs,src])=>{const o={sp:rs==='2014'?'Human (2014)':'Human',bg:rs==='2014'?'Acolyte (2014)':'Acolyte',src,rs,cls,sub,lv,arr:[15,14,13,12,10,8],b2:0,b1:0};
      window.__bldFuzz(Object.assign({},o,{lv:1}));const r=window.__bldFuzz(o);return (new Function('C','return '+ex))(r.c)})""", [c[:4] + c[5:] for c in CASES])
    for (cls, sub, lv, ex, want, _, _), got in zip(CASES, res):
        ok = got == want; bad += not ok
        print("%s %s %s %d: %s = %s (want %s)" % ("ok  " if ok else "FAIL", cls, sub, lv, ex[:40], got, want))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
