#!/usr/bin/env python3
"""Items whose AC or save bonus once came from two places. Before 0.0.85 five items crashed the sheet when worn (fx-B14 ac:1 as a number,
the AC handler wanted an array), and the sheet would have counted their bonus twice; five Feather Robes counted +1 to saves twice.
Each item must give its bonus once and the sheet must not throw.  python3 tests/item_fx_once.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AC = {"Knifewing Cape": 1, "Orrery of the Wanderer": 1, "Ingot of the Skold Rune": 1, "Jewel of Three Prayers (Awakened)": 2, "Jewel of Three Prayers (Exalted)": 3, "Ring of Protection": 1}
SAVE = ["Corvum Feather Robe", "Gallus Feather Robe", "Luma Feather Robe", "Raptor Feather Robe", "Strig Feather Robe"]
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    res = pg.evaluate("""(names)=>{const base=window.__bldFuzz({sp:'Human',bg:'Soldier',rs:'2024',sub:'',arr:[15,14,13,12,10,8],b2:0,b1:0,cls:'Wizard',lv:10}).b;
      base.src=Object.assign({},base.src);(window.WX&&WX.src||[]).forEach(x=>base.src[x.id]=true);
      return names.map(n=>{const b=structuredClone(base);b.inv=[{n:n,q:1,eq:true}];const t=window.__bldTestB();Object.assign(t,b);delete t.unset;
        try{const C=window.__bldSheetFor(t);const f=a=>(a||[]).filter(x=>String(x.s).indexOf(n)>=0).map(x=>x.v);return [n,f(C.ac.bonus),f(C.saveBonus)]}catch(e){return [n,'CRASH '+e,null]}})}""", list(AC) + SAVE)
    for n, ac, sv in res:
        if isinstance(ac, str): ok = False; got = ac
        elif n in AC: ok = ac == [AC[n]]; got = "AC %s" % ac
        else: ok = sv == [1]; got = "save %s" % sv
        bad += not ok
        print("%s %s: %s" % ("ok  " if ok else "FAIL", n, got))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
