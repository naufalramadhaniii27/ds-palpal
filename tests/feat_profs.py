#!/usr/bin/env python3
"""Fixed proficiencies of feats (0.0.85): a feat row may carry armor, weapons and tools; Piloting is a Dark Matter skill like Technology and Data.
Before, these feats listed the proficiency in their text only.  python3 tests/feat_profs.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CASES = [("Gambler", "All gaming sets"), ("Gambler (2014)", "All gaming sets"), ("Homebrewer", "Alchemist's Supplies"), ("Coalition War Training", "Standard Carbine"),
         ("Depth Module", "Trident"), ("Scaleguard", "Shields"), ("Ace Pilot (2014)", "Piloting"), ("Smuggler (DM14)", "Piloting")]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    res = pg.evaluate("""(L)=>{const src={phb14:true,dmg14:true,vss14:true,dm14:true};const b1=window.__bldFuzz({sp:'Human (2014)',bg:'Acolyte (2014)',rs:'2014',src,cls:'Wizard',sub:'',lv:8,arr:[15,14,13,12,10,8],b2:0,b1:0}).b;
      return L.map(([n,want])=>{const b=structuredClone(b1);b.ch.feat4={feat:n};const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);
        return [n,want,JSON.stringify(C.profs)+C.skills.filter(s=>s.p).map(s=>s.n).join(',')]})}""", CASES)
    for n, want, got in res:
        ok = want.lower() in got.lower(); bad += not ok
        print("%s %s gives %s%s" % ("ok  " if ok else "FAIL", n, want, "" if ok else " (sheet: %s)" % got[:200]))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
