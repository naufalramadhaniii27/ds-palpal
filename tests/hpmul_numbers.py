#!/usr/bin/env python3
"""fx hpMul (src/data/fx-B62-hpmul.js): the Hit Point maximum on the computed sheet (window.__D after __sheetApply) with the switch on and off.
Fighter 5, Con 14, fixed average: 10 + 4 x 6 + 5 x 2 = 44.  python3 tests/hpmul_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item, toggle on, expected Hit Point maximum)
CASES = [
    ("no potion", "2024", None, False, 44),
    ("Potion of Giant Size, switch off", "2024", "Potion of Giant Size", False, 44),
    ("Potion of Giant Size, switch on: doubled", "2024", "Potion of Giant Size", True, 88),
    ("Potion of Giant Size 2014, switch on: doubled", "2014", "Potion of Giant Size", True, 88),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const R={'2014':['Human (2014)','Soldier (2014)'],'2024':['Human','Soldier']};
 return cases.map(([lab,rs,item,on])=>{try{const b=window.__bldFuzz({sp:R[rs][0],bg:R[rs][1],rs,src:all,cls:'Fighter',sub:'',lv:5,arr:[15,12,14,10,10,8],b2:0,b1:0}).b;
  if(rs==='2024')b.ch.spfeat='Crafter';const t=window.__bldTestB();Object.assign(t,b);delete t.unset;if(item)t.inv=(t.inv||[]).concat([{n:item,q:1,eq:true}]);
  const C=window.__bldSheetFor(t,on?{'b62-potion-of-giant-size':true}:{});window.__sheetApply(C,false);return window.__D().hpmax}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)  # GX entries of the deferred blocks are in
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[4]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[4])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
