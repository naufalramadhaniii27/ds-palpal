#!/usr/bin/env python3
"""Review r4 edition gates: Book of Exalted Deeds and Armor of Invulnerability (fx-B32), Draconic Flight and Large Form (fx-Z2).
python3 tests/review_r4.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item, species, toggle id or None, regex on defenses/moves/speeds (not feature text), expected match). Fighter 19.
CASES = [
    ("Exalted Deeds 2024 Psychic", "2024", "Book of Exalted Deeds", None, None, r"Resistance[^\]]{0,80}Psychic", True),
    ("Exalted Deeds 2014 no Psychic", "2014", "Book of Exalted Deeds", None, None, r"Resistance[^\]]{0,80}Psychic", False),
    ("Invulnerability 2024 B/P/S", "2024", "Armor of Invulnerability", None, "b32-armor-of-invulnerability", r"Immunity[^\]]{0,80}Bludgeoning", True),
    ("Invulnerability 2014 no B/P/S", "2014", "Armor of Invulnerability", None, "b32-armor-of-invulnerability", r"Immunity[^\]]{0,80}Bludgeoning", False),
    ("Invulnerability 2014 nonmagical", "2014", "Armor of Invulnerability", None, "b32-armor-of-invulnerability", r"Immunity[^\]]{0,80}Nonmagical damage", True),
    ("Dragonborn 2024 flight", "2024", None, "Dragonborn", "draconic-flight", r'"fly"', True),
    ("Dragonborn 2014 no flight", "2014", None, "Dragonborn", "draconic-flight", r'"fly"', False),
    ("Goliath 2024 Large Form", "2024", None, "Goliath", "large-form", r"Advantage on [^\"]{0,40}Strength checks", True),
    ("Goliath 2014 no Large Form", "2014", None, "Goliath", "large-form", r"Advantage on [^\"]{0,40}Strength checks", False),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true,att:true}]:[];if(sp)t.species=sp;return t};
 return cases.map(([lab,rs,item,sp,tg,rx])=>{try{const Z=window.__bldSheetFor(mk(rs,item,sp),tg?{[tg]:true}:{});
  return new RegExp(rx).test(JSON.stringify([Z.defenses,Z.res,Z.imm,Z.moves,Z.speeds,Z.adv]))}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[6]; n += 1; bad += not ok
        print("%s %s: %s" % ("ok  " if ok else "FAIL", c[0], "" if ok else "got %s, expected %s" % (got, c[6])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
