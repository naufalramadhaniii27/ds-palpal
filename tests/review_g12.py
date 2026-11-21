#!/usr/bin/env python3
"""Review g12 fixes in src/data/fx-L4.js, read on the computed sheet: edition-only item effects (ed) and spells that ITEM_SPELLS already gives.
python3 tests/review_g12.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (rules, item, regex on the sheet JSON, expected: True = at least one match, False = none, int = exact count). Fighter 19, Human, Soldier.
CASES = [
    ("2024", "Helm of Telepathy", r'"n":"Telepathy","v":30', True),
    ("2014", "Helm of Telepathy", r'"n":"Telepathy","v":30', False),
    ("2024", "Necklace of Adaptation", r'"t":"Advantage on saving throws to resist or shake off the Poisoned', True),
    ("2014", "Necklace of Adaptation", r'"t":"Advantage on saving throws to resist or shake off the Poisoned', False),
    ("2014", "Necklace of Adaptation", r'"t":"Advantage on saving throws against harmful gases and vapors', True),
    ("2024", "Necklace of Adaptation", r'"t":"Advantage on saving throws against harmful gases and vapors', False),
    ("2024", "Eyes of Minute Seeing", r'"n":"Darkvision","v":1,', True),
    ("2014", "Eyes of Minute Seeing", r'"n":"Darkvision","v":1,', False),
    ("2014", "Eyes of Minute Seeing", r'Advantage on Intelligence \(Investigation\) checks to examine', True),
    ("2024", "Fin Symbiote", r'"t":"Advantage on Constitution saving throws', True),
    ("2014", "Fin Symbiote", r'"t":"Advantage on Constitution saving throws', False),
    ("2024", "Finger Picks", r'\["Thieves\' Tools","Finger Picks', True),
    ("2014", "Finger Picks", r'\["Thieves\' Tools","Finger Picks', False),
    ("2014", "Finger Picks", r'\+2 to ability checks with Thieves\' Tools', True),
    ("2024", "Hat of Disguise", r'"n":"Disguise Self","l":1,', 1),
    ("2024", "Flamefriend Lantern", r'"n":"Produce Flame","l":0,', 1),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[{n:item,q:1,eq:true}];return t};
 const r=cases.map(([rs,item,rx])=>{try{return (JSON.stringify(window.__bldSheetFor(mk(rs,item),{})).match(new RegExp(rx,'g'))||[]).length}catch(e){return 'CRASH '+e}});
 /* Iron Fangs: the Bite bonus is only in the 2024-rules book (tghg); a Fighter has no Bite row, so read the entry */
 r.push(((GX.item||{})['Iron Fangs']||[]).filter(e=>e.atkBonus).map(e=>e.ed||'both').join());return r}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [list(c[:3]) for c in CASES])
    for c, got in zip(CASES + [("2024", "Iron Fangs", "atkBonus entry ed", "2024")], res):
        exp = c[3]
        ok = (got == exp) if isinstance(exp, (int, str)) and not isinstance(exp, bool) else (isinstance(got, int) and (got > 0) == exp)
        n += 1; bad += not ok
        print("%s %s %s %s: %s" % ("ok  " if ok else "FAIL", c[0], c[1], c[2], "" if ok else "got %s, expected %s" % (got, exp)))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
