#!/usr/bin/env python3
"""2014 gaps: Elemental Affinity row shows the Dragon Ancestor damage type, College of Spirits (2014) Spirit Session use,
Mithral and Adamantine Armor default to Chain Mail in both editions (2014 base list had Breastplate first and Hide).  python3 tests/gaps14.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = """([rs,o,ch,inv])=>{const e=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true,vrgr:true}}:{sp:'Human',bg:'Soldier'};
 const b=window.__bldFuzz(Object.assign({rs,sub:'',arr:[15,14,13,12,10,8],b2:0,b1:0},e,o)).b;b.src=Object.assign({},b.src);b.ch=Object.assign({},b.ch,ch);
 if(inv)b.inv=inv.map(n=>({n,q:1,eq:true}));const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);
 return {xd:(C.xdmg||[]).map(x=>x.n+'|'+x.type),res:(C.res||[]).map(x=>x.n+'|'+x.max),ac:C.ac.base+'|'+C.ac.baseSrc}}"""
CASES = [  # (rule set, build, choices, inventory, field, expected entry)
    ("2014", {"cls": "Sorcerer", "sub": "Draconic Bloodline", "lv": 6}, {"p3opt": "Red (Fire)"}, None, "xd", "Elemental Affinity|Fire"),
    ("2014", {"cls": "Sorcerer", "sub": "Draconic Bloodline", "lv": 6}, {"p3opt": "Blue (Lightning)"}, None, "xd", "Elemental Affinity|Lightning"),
    ("2014", {"cls": "Bard", "sub": "College of Spirits (2014)", "lv": 6}, {}, None, "res", "Spirit Session|1"),
    ("2014", {"cls": "Fighter", "lv": 5}, {}, ["Mithral Armor"], "ac", "16|Mithral Armor, Heavy armor (PHB-2014)"),
    ("2024", {"cls": "Fighter", "lv": 5}, {}, ["Mithral Armor"], "ac", "16|Mithral Armor, Heavy armor (PHB-2024)"),
    ("2014", {"cls": "Fighter", "lv": 5}, {}, ["Mithral Armor (Plate Armor)"], "ac", "18|Mithral Armor (Plate Armor), Heavy armor (PHB-2014)"),
    ("2014", {"cls": "Fighter", "lv": 5}, {}, ["Adamantine Armor"], "ac", "16|Adamantine Armor, Heavy armor (PHB-2014)"),
]
DENY = [("2014", {"cls": "Bard", "sub": "College of Spirits (2014)", "lv": 5}, {}, None, "res", "Spirit Session|")]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'")
    for neg, cs in ((False, CASES), (True, DENY)):
        for rs, o, ch, inv, f, want in cs:
            v = pg.evaluate(JS, [rs, o, ch, inv])[f]
            hit = (v == want) if f == "ac" else any(x.startswith(want) for x in v)
            ok = hit != neg; bad += not ok
            print("%s %s %s %s%s%s" % ("ok  " if ok else "FAIL", rs, o, "no " if neg else "", want, "" if ok else " got %s" % v))
    br.close()
print("gaps14: %d failed" % bad); sys.exit(1 if bad else 0)
