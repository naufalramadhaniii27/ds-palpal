#!/usr/bin/env python3
"""Review g16: Divine Strike (nine 2014 Cleric domains) and Colossus Slayer (Hunter 2014) come once, from the base fdmg row (sheet xdmg),
not a second time as a weapon-row note from fx-Z2.js / fx-Z4.js. Blood Domain keeps its fx note (it has no fdmg row).  python3 tests/review_g16.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOM = ["Life Domain (2014)", "Nature Domain", "Tempest Domain", "Trickery Domain (2014)", "War Domain (2014)", "Death Domain", "Order Domain", "Twilight Domain", "Forge Domain"]
# (label, class, subclass, level, choices, xdmg name, expected xdmg dice or None, note text, expected note count outside xdmg/features)
CASES = [("%s 14" % d, "Cleric", d, 14, {}, "Divine Strike", "2d8", "Divine Strike", 0) for d in DOM]
CASES += [("Life Domain (2014) 8", "Cleric", "Life Domain (2014)", 8, {}, "Divine Strike", "1d8", "Divine Strike", 0),
          ("Hunter (2014) Colossus Slayer", "Ranger", "Hunter (2014)", 5, {"p3hunt14a": "Colossus Slayer"}, "Colossus Slayer", "1d8", "Colossus Slayer, once per turn", 0),
          ("Hunter (2014) Horde Breaker", "Ranger", "Hunter (2014)", 5, {"p3hunt14a": "Horde Breaker"}, "Colossus Slayer", None, "Colossus Slayer, once per turn", 0)]
JS = """(cases)=>cases.map(([lab,cls,sub,lv,ch,xn,xd,nt,nc])=>{try{
 const b=window.__bldFuzz({rs:'2014',cls,sub,lv,sp:'Human (2014)',bg:'Soldier (2014)',arr:[10,14,14,15,15,15],b2:0,b1:0}).b;const all={};(WX.src||[]).forEach(x=>all[x.id]=true);b.src=Object.assign({},b.src,all);
 const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.ch=Object.assign({},t.ch||{},ch);t.inv=[{n:'Longsword',q:1,eq:true}];
 const S=window.__bldSheetFor(t,{}),x=(S.xdmg||[]).filter(r=>r.n===xn&&r.sub===sub).map(r=>r.dmg);
 const C=Object.assign({},S);delete C.xdmg;delete C.features;const s=JSON.stringify(C);let n=0,i=-1;while((i=s.indexOf(nt,i+1))>=0)n++;
 return [x.length?x.join('+'):null,n]}catch(e){return ['CRASH '+e,-1]}})"""
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(180000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("typeof window.__bldFuzz==='function'", timeout=180000)
    pg.wait_for_function("window.__deferDone", timeout=180000)
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, (xd, n) in zip(CASES, res):
        ok = xd == c[6] and n == c[8]; bad += not ok
        print("%s %s: xdmg %s, note x%d%s" % ("ok  " if ok else "FAIL", c[0], xd, n, "" if ok else " (expected %s, x%d)" % (c[6], c[8])))
    br.close()
print("%d checked, %d failed" % (len(CASES), bad)); sys.exit(1 if bad else 0)
