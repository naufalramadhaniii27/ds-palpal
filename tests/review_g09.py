#!/usr/bin/env python3
"""Sheet checks of the review g09 fixes in src/data/fx-L10.js and fx-L11.js.
Tempest Stormborn fly only with the outdoors switch, Ruin Incarnate AC 17 + Wis (minimum +1), Ocean Domain Darkvision 60 or +30,
Adrenaline Junkie falling immunity once.  python3 tests/review_g09.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, class, subclass, level, scores, species or None, toggle id or None, check, expected)
W10, W16 = [10, 10, 10, 10, 10, 10], [10, 10, 10, 10, 16, 10]
CASES = [
    ("Tempest Stormborn off: no fly", "2014", "Cleric", "Tempest Domain", 17, W10, None, None, "fly", 0),
    ("Tempest Stormborn outdoors: fly = speed", "2014", "Cleric", "Tempest Domain", 17, W10, None, "tempest-outdoors", "fly", 30),
    ("Ruin Incarnate Wis +0: AC 18", "2024", "Druid", "Circle of Entropy", 3, W10, None, "ruin-incarnate", "ac", 18),
    ("Ruin Incarnate Wis +3: AC 20", "2024", "Druid", "Circle of Entropy", 3, W16, None, "ruin-incarnate", "ac", 20),
    ("Ruin Incarnate off: AC 10", "2024", "Druid", "Circle of Entropy", 3, W10, None, None, "ac", 10),
    ("Ocean no Darkvision: 60", "2014", "Cleric", "Ocean Domain", 6, W10, None, None, "dark", 60),
    ("Ocean source listed once", "2014", "Cleric", "Ocean Domain", 6, W10, None, None, "darkSrc", 1),
    ("Ocean Drow 120: 150", "2024", "Cleric", "Ocean Domain", 6, W10, "Elf", None, "dark", 150),
    ("Adrenaline Junkie falling once", "2024", "Vagabond", "Adrenaline Junkie", 6, W10, None, None, "fall", 1),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,lv,arr,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};if(sp)o.sp=sp;
  const b=window.__bldFuzz(Object.assign({rs,cls,sub,lv,arr,b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[];return t};
 const ac=C=>C.ac.base+C.ac.bonus.reduce((s,x)=>s+x.v,0);
 return cases.map(([lab,rs,cls,sub,lv,arr,sp,tg,k])=>{try{const Z=window.__bldSheetFor(mk(rs,cls,sub,lv,arr,sp),tg?{[tg]:true}:{});
  if(k==='fly'){const m=(Z.moves||[]).filter(x=>x.m==='fly')[0];return m?m.v:0}
  if(k==='ac')return ac(Z);if(k==='dark')return Z.darkvision;
  if(k==='darkSrc')return (String(Z.darkSrc).match(/At Home in the Waves/g)||[]).length;
  if(k==='fall')return (JSON.stringify(Z).match(/(Falling damage|falls) of 60 f/g)||[]).length;return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(180000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("typeof window.__bldFuzz==='function'")
    pg.wait_for_function("window.__deferDone", timeout=180000)
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[9]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[9])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
