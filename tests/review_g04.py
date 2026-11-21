#!/usr/bin/env python3
"""Review g04 fixes on the computed sheet: Cabal's Ruin rider on all three states (cloak, so on every attack row),
Candle of Invocation Advantage split by edition (2014 needs matching alignment).  python3 tests/review_g04.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item, regex that must be in the sheet JSON, or with a leading "!" must not be)
CASES = [
    ("Cabal's Ruin (Dormant) rider", "2014", "Cabal's Ruin (Dormant)", "1d6 Lightning for each charge"),
    ("Cabal's Ruin (Awakened) rider", "2014", "Cabal's Ruin (Awakened)", "1d6 Lightning for each charge"),
    ("Cabal's Ruin (Exalted) rider", "2024", "Cabal's Ruin (Exalted)", "1d6 Lightning for each charge"),
    ("Candle 2014 alignment", "2014", "Candle of Invocation", "Candle of Invocation: Advantage on attack rolls[^\"]*alignment matches"),
    ("Candle 2014 no D20 Tests line", "2014", "Candle of Invocation", "!Candle of Invocation: Advantage on D20 Tests"),
    ("Candle 2024 D20 Tests", "2024", "Candle of Invocation", "Candle of Invocation: Advantage on D20 Tests"),
    ("Candle 2024 no alignment line", "2024", "Candle of Invocation", "!alignment matches the candle"),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:5,arr:[15,14,14,10,10,10],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[{n:'Longsword',q:1,eq:true}].concat(item?[{n:item,q:1,eq:true,att:true}]:[]);return t};
 return cases.map(([lab,rs,item,re])=>{try{const neg=re[0]==='!',rx=new RegExp(neg?re.slice(1):re);
  const Z=JSON.stringify(window.__bldSheetFor(mk(rs,item),{})),A=JSON.stringify(window.__bldSheetFor(mk(rs,null),{}));
  return neg?!rx.test(Z):(rx.test(Z)&&!rx.test(A))}catch(e){return 'CRASH '+e}})}"""
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got is True; bad += not ok
        print("%s %s %s%s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else ": got %s" % got))
    br.close()
print("%d checked, %d failed" % (len(CASES), bad)); sys.exit(1 if bad else 0)
