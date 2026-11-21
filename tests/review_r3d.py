#!/usr/bin/env python3
"""Review round 3d fixes on the computed sheet.
1. Divine Strike rider (src/data/fx-B11-riders.js): level 8 = 1d8, level 14 = 2d8 in all (the level-14 row adds 1d8, not 2d8), for every subclass that has it.
2. Scarab of Protection summary: no AC bonus (neither edition's text has one).  python3 tests/review_r3d.py"""
import os, re, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad = n = 0
def chk(lab, ok, got=""):
    global bad, n
    n += 1; bad += not ok
    print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": got %s" % got))
s = open(os.path.join(ROOT, "src/builder/02-data-magic-item-summaries.js"), encoding="utf8").read()
m = re.search(r'"Scarab of Protection":"([^"]*)"', s)
chk("Scarab of Protection summary has no AC bonus", bool(m) and "AC" not in m.group(1), m and m.group(1))
JS = """()=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const subs=Object.keys(GX.sub).filter(k=>(GX.sub[k]||[]).some(e=>e.n==='Divine Strike (rider 14)'));
 const dice=(sub,lv)=>{for(const rs of ['2014','2024']){const o=rs==='2014'?{sp:'Human (2014)',bg:'Acolyte (2014)'}:{sp:'Human',bg:'Acolyte'};
   const b=window.__bldFuzz(Object.assign({rs,cls:'Cleric',sub,lv,arr:[14,10,14,10,15,10],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
   const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[{n:'Mace',q:1,eq:true}];
   const C=window.__bldSheetFor(t,{});let got=null;JSON.stringify(C,(k,v)=>{if(k==='xdice'&&got===null&&Array.isArray(v))got=v.filter(x=>/Divine Strike/.test(x.s||'')).reduce((a,x)=>a+(+(/^(\\d+)d8$/.exec(x.d)||[0,99])[1]),0);return v});
   if(got!==null)return got}return 'no weapon row with the rider'};
 return subs.map(s=>{try{return [s,dice(s,8),dice(s,14)]}catch(e){return [s,'CRASH '+e,'']}})}"""
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS)
    chk("Divine Strike subclasses found", len(res) >= 5, len(res))
    for sub, d8, d14 in res:
        chk("%s Divine Strike level 8 = 1d8, level 14 = 2d8" % sub, d8 == 1 and d14 == 2, "%s / %s d8" % (d8, d14))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
