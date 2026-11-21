#!/usr/bin/env python3
"""Sheet checks of the review g13 fixes in src/data/fx-L5.js (and the 2014 Scarab of Protection row). Star Metal Ring, Straitjacket and Shoulder Cannon are book-gated (fromBk), not by ed: tests/book_gate_numbers.py has both books.  python3 tests/review_g13.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item, toggle id or None, check, arg, expected). Fighter 19, INT 15, all sources on.
# has: text on the sheet (item html left out) with the item and not without it; ac: AC with the item minus without; row: [misc, dmgBonus] of the item's attack row
TRK = 'x-shoulder-cannon","n":"Shoulder Cannon","tag":"back at dawn'
CASES = [
    ("Nightbringer 4d4 radiant without evil switch", "2014", "Nightbringer", None, "has", '"d":"4d4","t":"radiant"', True),
    ("Ring of Spell Turning: only-you spells", "2014", "Ring of Spell Turning", None, "has", "spells that target only you", True),
    ("Ring of Spell Turning: any spell", "2024", "Ring of Spell Turning", None, "has", "target only you", False),
    ("Robe of Eyes: no Truesight", "2014", "Robe of Eyes", None, "has", "Truesight", False),
    ("Robe of Eyes: Ethereal note", "2014", "Robe of Eyes", None, "has", "into the Ethereal Plane, out to 120", True),
    ("Robe of Eyes: Truesight", "2024", "Robe of Eyes", None, "has", "Truesight", True),
    ("Star Metal Ring: magical", "2014", "Star Metal Ring", None, "has", "Counts as magical", True),
    ("Star Metal Ring: Force", "2024", "Star Metal Ring", None, "has", '"type":"Force"', True),
    ("Straitjacket: INT to AC", "2024", "Straitjacket", None, "ac", None, 2),
    ("Shoulder Cannon: dawn tracker", "2024", "Shoulder Cannon", None, "has", TRK, True),
    ("Splitter joined: +3", "2024", "Splitter", None, "row", "Splitter", [3, 3]),
    ("Splitter split: +1", "2024", "Splitter", "splitter-split", "row", "Splitter", [1, 1]),
    ("Scarab of Protection: no AC", "2014", "Scarab of Protection", None, "ac", None, 0),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true}]:[];return t};
 const ac=C=>C.ac.base+(C.ac.dex==='full'||C.ac.dex==='max2'?2:0)+C.ac.bonus.reduce((s,x)=>s+x.v,0);
 const txt=C=>JSON.stringify(C,(k,v)=>k==='html'?undefined:v);
 return cases.map(([lab,rs,item,tg,k,arg])=>{try{const fx=tg?{[tg]:true}:{},A=window.__bldSheetFor(mk(rs,null),fx),Z=window.__bldSheetFor(mk(rs,item),fx);
  if(k==='ac')return ac(Z)-ac(A);
  if(k==='has')return txt(Z).indexOf(arg)>=0&&txt(A).indexOf(arg)<0;
  if(k==='row'){const r=(Z.attacks||[]).find(x=>x.n===arg);return r?[r.misc||0,r.dmgBonus||0]:'no row'}return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[6]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[6])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
