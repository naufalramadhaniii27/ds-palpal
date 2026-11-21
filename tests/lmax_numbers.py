#!/usr/bin/env python3
"""lMax gate: a lower-level row stops once a higher-level row of the same feature replaces its number ("becomes", "the range is").
python3 tests/lmax_numbers.py   (LMDUMP=1 prints the sheet parts instead)"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, class, subclass, level, check, expected). dice = Frigid Explorer extra dice on the weapon rows; dv = Darkvision ranges on the sheet
CASES = [
    ("Winter Walker 10: Frigid Explorer 1d4 only", "2024", "Ranger", "Winter Walker", 10, "dice", ["1d4"]),
    ("Winter Walker 11: Frigid Explorer 1d6 only", "2024", "Ranger", "Winter Walker", 11, "dice", ["1d6"]),
    ("Night Domain 5: Darkvision 60", "2014", "Cleric", "Night Domain", 5, "dv", [60]),
    ("Night Domain 6: Darkvision 120 only", "2014", "Cleric", "Night Domain", 6, "dv", [120]),
]
JS = """([cases,dump])=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,lv)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.sub=sub;return t};
 return cases.map(([lab,rs,cls,sub,lv,k,exp])=>{try{const S=window.__bldSheetFor(mk(rs,cls,sub,lv),{}),got=new Set();
  if(dump)return JSON.stringify({dv:S.darkvision,se:S.senses,at:S.attacks}).slice(0,3000);
  if(k==='dice')(S.attacks||[]).forEach(a=>(a.xdice||[]).forEach(x=>{if(/Frigid Explorer/.test(x.s))got.add(x.d)}));
  else if(k==='dv'){(S.senses||[]).forEach(y=>{if(y.n==='Darkvision')got.add(y.v)});if(S.darkvision)got.add(+S.darkvision)}
  return [...got].sort()}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [[list(c) for c in CASES], bool(os.environ.get("LMDUMP"))])
    for c, got in zip(CASES, res):
        ok = got == c[6]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[6])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
