#!/usr/bin/env python3
"""Extra-damage notes of the DMG weapons in src/data/fx-Z1.js, per edition (review fix D).
2024 numbers follow the DMGI rows, 2014 numbers the DM14.ov rows (src/data/dmgi-magic-items-dmg2024.js).  python3 tests/review_fix_d.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (item in inventory, dwarf?, {edition: sorted extra dice "d|type" on the item's attack rows; None = the item is not in that edition})
CASES = [
    ("Sword of Life Stealing (Longsword)", 0, {"2024": ["15|Necrotic"], "2014": ["10|Necrotic"]}),
    ("Vorpal Sword (Longsword)", 0, {"2024": ["30|Slashing"], "2014": ["6d8|Slashing"]}),
    ("Wave", 0, {"2024": ["21|Necrotic"], "2014": ["half its hit point maximum|Necrotic"]}),
    ("Whelm", 1, {"2024": ["1d8|Force"], "2014": ["1d8|Bludgeoning"]}),
    ("Axe of the Dwarvish Lords", 1, {"2024": ["1d8|Force", "20|Slashing"], "2014": ["14|Slashing", "1d8|on"]}),
    ("Dwarven Thrower", 1, {"2024": ["1d8|Force"], "2014": ["1d8|on"]}),
    ("Executioner's Axe (Greataxe)", 0, {"2024": ["2d6|Slashing"], "2014": None}),
]
JS = """([rs,cases])=>cases.map(([item,dw])=>{try{const o=rs==='2014'?{sp:dw?'Mountain Dwarf':'Human (2014)',bg:'Soldier (2014)'}:{sp:dw?'Dwarf':'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:5,arr:[15,14,13,12,10,8],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src);(WX.src||[]).forEach(x=>b.src[x.id]=true);
  b.inv=[{n:item,q:1,eq:true}];const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);
  const rows=C.attacks.filter(a=>a.n.indexOf(item.split(' (')[0])===0);if(!rows.length)return null;
  const s={};rows.forEach(r=>(r.xdice||[]).forEach(x=>{s[x.d+'|'+String(x.t).split(' ')[0]]=1}));return Object.keys(s).sort()}catch(e){return 'CRASH '+e}})"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    for rs in ("2024", "2014"):
        res = pg.evaluate(JS, [rs, [[c[0], c[1]] for c in CASES]])
        for c, got in zip(CASES, res):
            exp = c[2][rs]; ok = got == exp; n += 1; bad += not ok
            print("%s %s %s: %s" % ("ok  " if ok else "FAIL", rs, c[0], got if ok else "got %s, expected %s" % (got, exp)))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
