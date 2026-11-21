#!/usr/bin/env python3
"""Review g15/g07 fixes on the computed sheet: Staff of the Adder by edition, Wooden Chain gives no general Medium armor training,
Pharaoh and Blood Ascendant level 20 ride the Necromancer lichdom toggle.  python3 tests/review_g15.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# 2014 Staff of the Adder needs attunement by a Cleric, Druid or Warlock, so a Druid holds it
# (label, rules, class, subclass, item, toggle on, check, expected)
CASES = [
    ("Staff of the Adder 2014: STR row, no unconditional Poison", "2014", "Druid", "", "Staff of the Adder", False, "adder", "STR|none"),
    ("Staff of the Adder 2024: WIS row, +3d6 Poison", "2024", "Wizard", "", "Staff of the Adder", False, "adder", "WIS|3d6"),
    ("Wooden Chain: no Medium armor training", "2024", "Wizard", "", "Wooden Chain of the Unbroken Circle", False, "medium", False),
    ("Pharaoh lichdom off: no Magic Resistance", "2024", "Necromancer", "Pharaoh", None, False, "magres", False),
    ("Pharaoh lichdom on: Magic Resistance", "2024", "Necromancer", "Pharaoh", None, True, "magres", True),
    ("Blood Ascendant lichdom off: no climb", "2024", "Necromancer", "Blood Ascendant", None, False, "climb", False),
    ("Blood Ascendant lichdom on: climb", "2024", "Necromancer", "Blood Ascendant", None, True, "climb", True),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,item)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub,lv:20,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true}]:[];return t};
 return cases.map(([lab,rs,cls,sub,item,on,k])=>{try{const C=window.__bldSheetFor(mk(rs,cls,sub,item),on?{lichdom:true}:{}),j=JSON.stringify(C);
  if(k==='adder'){const r=C.attacks.find(x=>/Snake Head/.test(x.n));return r?r.ab+'|'+((r.xdice||[]).map(x=>x.d).join(',')||'none'):'no row'}
  if(k==='medium')return /Medium/.test(String(C.profs.armor));
  if(k==='magres')return /magical effects/.test(JSON.stringify(C.saveNotes||[]));
  if(k==='climb')return /climb/i.test(JSON.stringify([C.speeds,C.mv,C.speedNote,C.speedExtra]))||/"climb"/i.test(j);return 'bad check'}catch(e){return 'CRASH '+e}})}"""
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
        ok = got == c[7]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[7])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
