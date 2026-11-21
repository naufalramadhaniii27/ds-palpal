#!/usr/bin/env python3
"""Book choice survives export and import: a feat two books share keeps its book (ch.featN.bk) after toSheet then fromSheet (window.__bldRound).
python3 tests/book_choice_round.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (rules, feat, bk set before export, bk expected after import)
CASES = [(rs, "Aberrant Spawn", bk, bk) for rs in ("2024", "2014") for bk in ("tsdm", "tvss14")]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 return cases.map(([rs,feat,bk])=>{try{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[];t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON',bk}});
  const r=window.__bldRound(window.__bldSheetFor(t,{}));const k=Object.keys(r.ch).find(k=>r.ch[k]&&r.ch[k].feat===feat);
  return k?(r.ch[k].bk||'none'):'missing'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>!!window.__bldRound&&!!window.__bldSheetFor&&!!window.__bldFuzz", timeout=120000)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [list(c[:3]) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[3]; n += 1; bad += not ok
        print("%s %s %s bk=%s: %s" % ("ok  " if ok else "FAIL", c[0], c[1], c[2], "" if ok else "got %s, expected %s" % (got, c[3])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
