#!/usr/bin/env python3
"""Valda's Spire 2014 subclass proficiencies added in 0.0.85 (reachable under the 2014 rules since the same release): Path of the Rage Mage
Arcana (and Constitution for it when higher), College of Masks (2014) Performance, from level 3.  python3 tests/vss14_traits.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    R = pg.evaluate("""()=>{const mk=(cls,sub,lv,arr)=>{const o={sp:'Human (2014)',bg:'Acolyte (2014)',src:{phb14:true,dmg14:true,tvss14:true},rs:'2014',cls,sub,lv,arr:arr||[15,14,13,12,10,8],b2:0,b1:0};
        window.__bldFuzz(Object.assign({},o,{lv:1}));return window.__bldFuzz(o).c};const sk=(C,n)=>C.skills.find(x=>x.n===n)||{};
      const a3=mk('Barbarian','Path of the Rage Mage',3,[15,10,14,8,12,13]),a2=mk('Barbarian','Path of the Rage Mage',2),m3=mk('Bard','College of Masks (2014)',3);
      return {a3p:sk(a3,'Arcana').p||0,a3m:sk(a3,'Arcana').misc||0,a2p:sk(a2,'Arcana').p||0,m3p:sk(m3,'Performance').p||0}}""")
    for lab, got, want in (("Rage Mage 3 Arcana proficiency", R["a3p"], 1), ("Rage Mage 3 Arcana uses Con (+3 over Int)", R["a3m"], 3),
                           ("Rage Mage 2 no Arcana yet", R["a2p"], 0), ("College of Masks 3 Performance", R["m3p"], 1)):
        ok = got == want; bad += not ok; print("%s %s: %s (want %s)" % ("ok  " if ok else "FAIL", lab, got, want))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
