#!/usr/bin/env python3
"""Disease immunity on the sheet Defenses for the features in src/data/fx-B62-disease.js and Plague Doctor Breathe It In (fx-B61-situational-cls.js).
python3 tests/disease_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, cls, sub, feat, species, expected): "Disease" when an Immunity row says Disease, else "missing". Level 19.
CASES = [
    ("Android feat", "2014", "Fighter", "", "Android (2014)", None, "Disease"),
    ("Marionette Geppettin Construct Anatomy", "2014", "Fighter", "", None, "Marionette Geppettin", "Disease"),
    ("Vect Construct Anatomy", "2014", "Fighter", "", None, "Vect (DM14)", "Disease"),
    ("Plague Doctor Breathe It In", "2014", "Wizard", "Plague Doctor (2014)", None, None, "Disease"),
    ("Human Fighter: none", "2014", "Fighter", "", None, None, "missing"),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,feat,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub,lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[];if(sp)t.species=sp;
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}});return t};
 return cases.map(([lab,rs,cls,sub,feat,sp])=>{try{const Z=window.__bldSheetFor(mk(rs,cls,sub,feat,sp),{});
  return /Immunity[^\\]]{0,80}Disease/.test(JSON.stringify(Z.defenses))?'Disease':'missing'}catch(e){return 'CRASH '+e}})}"""
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
        ok = got == c[6]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[6])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
