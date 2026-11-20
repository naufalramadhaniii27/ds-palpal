#!/usr/bin/env python3
"""Species traits added in 0.0.85 from tools/sheet_gaps.py species: horns as Unarmed Strikes (1d6) and the Vect's Embedded Armor (base AC 13 + Dex,
armor worn over it may be used instead).  python3 tests/species_fx.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    R = pg.evaluate("""()=>{const all={};(window.WX&&WX.src||[]).forEach(x=>all[x.id]=true);
      const mk=(sp,cls,inv)=>{const r=window.__bldFuzz({sp,bg:'Soldier',rs:'2024',src:all,cls,sub:'',lv:5,arr:[15,14,13,12,10,8],b2:0,b1:0});const b=structuredClone(r.b);b.src=all;if(inv)b.inv=inv;
        const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
      const o={};for(const n of ['Bhain Kwai Minotaur','Boghaid Minotaur','Tauren','Minotaur (Amonkhet)']){const u=mk(n,'Fighter').attacks.find(a=>a.n==='Unarmed Strike');o[n]=u?u.die+' '+u.type:'none'}
      o.vect0=mk('Vect','Wizard',[]).ac;o.vectL=mk('Vect','Wizard',[{n:'Leather Armor',q:1,eq:true}]).ac;o.vectP=mk('Vect','Wizard',[{n:'Plate Armor',q:1,eq:true}]).ac;return o}""")
    for n, t in (("Bhain Kwai Minotaur", "1d6 Piercing"), ("Boghaid Minotaur", "1d6 Piercing"), ("Tauren", "1d6 Piercing"), ("Minotaur (Amonkhet)", "1d6 Bludgeoning")):
        ok = R[n] == t; bad += not ok; print("%s %s Unarmed Strike %s (want %s)" % ("ok  " if ok else "FAIL", n, R[n], t))
    for k, base, lab in (("vect0", 13, "no armor: 13 + Dex"), ("vectL", 13, "Leather worn: Embedded Armor is better"), ("vectP", 18, "Plate worn: Plate is better")):
        ok = R[k]["base"] == base; bad += not ok; print("%s Vect %s (base %s, %s)" % ("ok  " if ok else "FAIL", lab, R[k]["base"], R[k]["baseSrc"]))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
