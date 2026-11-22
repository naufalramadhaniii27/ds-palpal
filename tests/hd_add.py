#!/usr/bin/env python3
"""hdAdd: Pandaren Inner Peace adds 1 Hit Point per Hit Point Die on a Short Rest (C.hdAdd); a Human gets 0.
python3 tests/hd_add.py"""
import sys
import os
from playwright.sync_api import sync_playwright
R=__import__("os").path.dirname(__import__("os").path.dirname(__import__("os").path.abspath(__file__)))
JS="""()=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(sp)=>{const b=window.__bldFuzz({rs:'2024',cls:'Monk',sub:'',lv:1,arr:[10,14,14,15,15,15],b2:0,b1:0,sp:'Human',bg:'Soldier'}).b;b.src=Object.assign({},b.src,all);const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.species=sp;return t};
 return ['Pandaren','Human'].map(sp=>{const Z=window.__bldSheetFor(mk(sp),{});return [sp,Z.hdAdd||0,Z.hdAddSrc||'']})}"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://"+R+"/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'"); pg.wait_for_function("window.__deferDone")
    res=pg.evaluate(JS); b.close()
ok=res==[["Pandaren",1,"Inner Peace (Pandaren)"],["Human",0,""]]
print(res); print("hd_add:", "ok" if ok else "FAIL"); sys.exit(0 if ok else 1)
