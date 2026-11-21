#!/usr/bin/env python3
"""Review g14 fixes on the computed sheet (fx-L6, fx-L8).
Vicious Weapon (2014 build): the 2d6 is natural-20 only, so it is an xcrit rider (atkDice crit:1) and no extra hit dice (2024: 2d6 every hit, golden fx_L6_bib_vicious_longsword). Overdrive Module: one use pool (tsdm row, Long Rest), not a row pool plus a GX pool.
python3 tests/review_g14.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = """()=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const b=window.__bldFuzz({rs:'2014',cls:'Fighter',sub:'',lv:5,arr:[15,14,14,10,10,10],b2:0,b1:0,sp:'Human (2014)',bg:'Soldier (2014)'}).b;b.src=Object.assign({},b.src,all);
 const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[{n:'Overdrive Module',q:1,eq:true},{n:'Vicious Weapon (Longsword)',q:1,eq:true}];
 const C=window.__bldSheetFor(t,{});const vw=(C.attacks||[]).filter(a=>/Vicious/.test(a.n));
 const pools=[];JSON.stringify(C,(k,v)=>{if(v&&typeof v==='object'&&v.n==='Overdrive Module'&&v.max!=null)pools.push(v.reset);return v});
 return {vwRows:vw.length,vwDice:vw.some(a=>(a.xdice||[]).some(x=>x.d==='2d6')),vwNote:vw.some(a=>(a.xcrit||[]).some(x=>x.d==='2d6')),pools:pools.join(',')}}"""
EXP = {"vwRows": 1, "vwDice": False, "vwNote": True, "pools": "long"}
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("typeof window.__bldFuzz==='function'", timeout=120000)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    got = pg.evaluate(JS); br.close()
bad = 0
for k, v in EXP.items():
    ok = got.get(k) == v; bad += not ok
    print("%s %s: %s" % ("ok  " if ok else "FAIL", k, got.get(k) if ok else "got %r, expected %r" % (got.get(k), v)))
print("%d checked, %d failed" % (len(EXP), bad)); sys.exit(1 if bad else 0)
