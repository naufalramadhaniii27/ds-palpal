#!/usr/bin/env python3
"""Armor Class of magic armor and Shields, rules 2024 and 2014, one browser session.  python3 tests/armor_items.py
Level 5 Human Fighter (Fighting Style Defense from the fuzz build), Dex 14. The +N of armor or a Shield that needs attunement
(Dragon Scale Mail, Efreeti Chain, Demon Armor, Shield of the Cavalier) counts only while attuned: a 4th attunement item gets none.
Armor that needs no attunement (+N armor, Dwarven Plate, Elven Chain) keeps its bonus. The armor's own base AC always counts."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILL = ["Boots of Speed", "Cloak of Displacement", "Amulet of Health"]  # three attunement items with no AC
# (label, inventory, AC, text in the AC sources or "")
CASES = [
    ("Plate", ["Plate Armor"], 19, ""),
    ("Plate +1", ["Plate Armor, +1"], 20, ""),
    ("Plate +1, 3 attuned", FILL + ["Plate Armor, +1"], 20, ""),
    ("Dwarven Plate", ["Dwarven Plate"], 21, ""),
    ("Dwarven Plate, 3 attuned", FILL + ["Dwarven Plate"], 21, ""),
    ("Elven Chain, 3 attuned", FILL + ["Elven Chain"], 17, ""),
    ("Armor of Invulnerability", ["Armor of Invulnerability"], 19, ""),
    ("Plate Armor of Etherealness", ["Plate Armor of Etherealness"], 19, ""),
    ("Armor of Resistance", ["Armor of Resistance"], 17, ""),
    ("Dragon Scale Mail", ["Dragon Scale Mail"], 18, "magic bonus"),
    ("Dragon Scale Mail, 4th", FILL + ["Dragon Scale Mail"], 17, "not attuned"),
    ("Efreeti Chain", ["Efreeti Chain"], 20, ""),
    ("Efreeti Chain, 4th", FILL + ["Efreeti Chain"], 17, "not attuned"),
    ("Demon Armor", ["Demon Armor"], 20, ""),
    ("Demon Armor, 4th", FILL + ["Demon Armor"], 19, "not attuned"),
    ("Shield", ["Shield"], 14, ""),
    ("Shield +2, 3 attuned", FILL + ["Shield, +2"], 16, ""),
    ("Animated Shield", ["Animated Shield"], 14, ""),
    ("Sentinel Shield", ["Sentinel Shield"], 14, ""),
    ("Spellguard Shield, 4th", FILL + ["Spellguard Shield"], 14, ""),
    ("Shield of the Cavalier", ["Shield of the Cavalier"], 16, ""),
    ("Shield of the Cavalier, 4th", FILL + ["Shield of the Cavalier"], 14, "not attuned"),
    ("Plate + Cavalier, 3 attuned", FILL[:2] + ["Plate Armor, +1", "Shield of the Cavalier"], 24, ""),
]
JS = """([rs,cases])=>{const md=s=>Math.floor((s-10)/2);
  return cases.map(([lab,inv])=>{try{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true}}:{sp:'Human',bg:'Soldier'};
    const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:5,arr:[15,14,13,12,10,8],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src);
    b.inv=inv.map(n=>({n,q:1,eq:true}));const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t),A=C.abilities.DEX,dx=md(A.base+A.bonus.reduce((a,x)=>a+x.v,0)),ac=C.ac;
    return [ac.base+(ac.dex==='full'?dx:ac.dex==='max2'?Math.min(2,dx):0)+ac.bonus.reduce((a,x)=>a+x.v,0),[ac.baseSrc].concat(ac.bonus.map(x=>x.s+' '+x.v)).join('; ')]}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    for rs in ("2024", "2014"):
        res = pg.evaluate(JS, [rs, [[c[0], c[1]] for c in CASES]])
        for c, got in zip(CASES, res):
            ok = isinstance(got, list) and got[0] == c[2] and c[3].lower() in got[1].lower()
            n += 1; bad += not ok
            print("%s %s %s: %s" % ("ok  " if ok else "FAIL", rs, c[0], "" if ok else "%s, expected AC %s %r" % (got, c[2], c[3])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
