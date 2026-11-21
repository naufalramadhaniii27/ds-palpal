#!/usr/bin/env python3
"""Walking Speed of the item switches in src/data/fx-B62-speedzero.js (speedTo: Speed forced to 0 or a fixed lower number).
The switch gives its number only while it is on.  python3 tests/speedzero_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item, feat, species, toggle id or None, check, expected). Fighter 19, STR 10 DEX 14 CON 14, no armor (AC 12 bare).
# speedT = total Speed; check: ac / init / speed = the number with the item, feat or species, minus the same build without it; acT = total AC; adv / res = text on the sheet
H = "Human (2014)"
CASES = [
    ("Barricade Shield planted: Speed 0", "2024", "Barricade Shield", None, None, "b62-barricade", "speedT", 0),
    ("Barricade Shield off", "2024", "Barricade Shield", None, None, None, "speedT", 30),
    ("Doublet at 0 HP: Speed 0", "2024", "Doublet of Dramatic Demise", None, None, "b62-doublet", "speedT", 0),
    ("Doublet off", "2024", "Doublet of Dramatic Demise", None, None, None, "speedT", 30),
    ("Ring of Anchoring anchored: Speed 0", "2024", "Ring of Anchoring", None, None, "b62-anchoring", "speedT", 0),
    ("Ring of Anchoring off", "2024", "Ring of Anchoring", None, None, None, "speedT", 30),
    ("Sanctified Cannon shot: Speed 0", "2024", "Sanctified Cannon", None, None, "b62-cannon", "speedT", 0),
    ("Sanctified Cannon off", "2024", "Sanctified Cannon", None, None, None, "speedT", 30),
    ("Boots of the Hare curse: Speed 15", "2014", "Boots of the Hare", None, None, "b62-hare", "speedT", 15),
    ("Boots of the Hare curse off", "2014", "Boots of the Hare", None, None, None, "speedT", 30),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item,feat,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true}]:[];if(sp)t.species=sp;
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}});return t};
 const ac=C=>C.ac.base+(C.ac.dex==='full'||C.ac.dex==='max2'?2:0)+C.ac.bonus.reduce((s,x)=>s+x.v,0),ini=C=>(C.initBonus||[]).reduce((s,x)=>s+x.v,0);
 const txt=C=>JSON.stringify(C);
 return cases.map(([lab,rs,item,feat,sp,tg,k,exp])=>{try{const fx=tg?{[tg]:true}:{},A=window.__bldSheetFor(mk(rs,null,null,null),fx),Z=window.__bldSheetFor(mk(rs,item,feat,sp),fx);
  if(k==='ac')return ac(Z)-ac(A);if(k==='acT')return ac(Z);if(k==='init')return ini(Z)-ini(A);if(k==='speed')return Z.speed-A.speed;if(k==='speedT')return Z.speed;
  if(k==='adv'){const rx=new RegExp('Advantage on [^"]{0,40}'+exp);return rx.test(txt(Z))&&!rx.test(txt(A))?exp:'missing'}
  if(k==='res'){const rx=new RegExp('Resistance[^\\\\]]{0,80}'+exp);return rx.test(JSON.stringify([Z.defenses,Z.res]))&&!rx.test(JSON.stringify([A.defenses,A.res]))?exp:'missing'}return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)  # GX entries of the deferred blocks are in
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[7]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[7])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
