#!/usr/bin/env python3
"""Quick Build must give a build the builder's own rule check accepts: every class and subclass of both rule sets at levels 3, 5, 10, 17, 20.
Also the Arcane Trickster cantrip count (3 at level 3, 4 at 10, counting Mage Hand). Before 0.0.85 Quick Build gave an Arcane Trickster one cantrip
too many and a 2014 Arcane Trickster spells from the wrong schools.  python3 tests/quickbuild_rules.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(1800000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    r = pg.evaluate("""()=>{const out=[];let n=0;const base=rs=>rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true}}:{sp:'Human',bg:'Soldier'};
      for(const rs of ['2024','2014']) for(const cls of Object.keys(window.CLASSES||{})){let subs=Object.keys((CLASSES[cls]||{}).subs||{});if(rs==='2024')subs=subs.filter(s=>!/\\(2014\\)/.test(s));if(!subs.length)subs=[''];
        for(const sub of subs) for(const lv of [3,5,10,17,20]){const r=window.__bldFuzz(Object.assign({cls,sub,lv,rs,arr:[15,14,13,12,10,8],b2:0,b1:0},base(rs)));n++;
          if(!r||r.err){out.push(rs+' '+cls+'/'+sub+' '+lv+': '+String(r&&r.err).slice(0,120));continue}r.ri.forEach(m=>out.push(rs+' '+cls+'/'+(sub||'-')+' '+lv+': '+String(m).slice(0,160)))}}
      const ct={};for(const [rs,sub] of [['2024','Arcane Trickster'],['2014','Arcane Trickster (2014)']])for(const lv of [3,10]){const r=window.__bldFuzz(Object.assign({cls:'Rogue',sub,lv,rs,arr:[15,14,13,12,10,8],b2:0,b1:0},base(rs)));ct[rs+' '+lv]=(r.c.spells||[]).filter(s=>s.l===0).length}
      return {n,out,ct}}""")
    for m in r["out"][:40]: print("FAIL", m)
    bad += len(r["out"])
    print("%s Quick Build: %d builds, %d rule issues" % ("ok  " if not r["out"] else "FAIL", r["n"], len(r["out"])))
    for k, want in (("2024 3", 3), ("2024 10", 4), ("2014 3", 3), ("2014 10", 4)):
        ok = r["ct"][k] == want; bad += not ok; print("%s Arcane Trickster %s: %d cantrips (want %d)" % ("ok  " if ok else "FAIL", k, r["ct"][k], want))
    br.close()
print("%d failed" % bad); sys.exit(1 if bad else 0)
