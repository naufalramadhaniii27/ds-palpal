#!/usr/bin/env python3
"""fromBk book gate (10b gate-book): an item or feat that two books share by name gets only the effects of the book its record came from.
Page "first": the book loaded first owns the row (tghg, tsdm; DMAP keeps the first). Page "second": those rows are taken out of WXI before the first
build, so the second book's row (tgh14p, tdm14) joins DMAP. Both rule sets: the gate is by book, not ed.
python3 tests/book_gate_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DROP = {"tghg": ["Star Metal Ring", "Straitjacket", "Fin Symbiote", "Toadstool Toddy"], "tsdm": ["Finger Picks", "Shoulder Cannon"]}
# (page, rules, item, feat, toggle, check, expected). Fighter 19, STR 10 DEX 14 CON 14 INT 15, no armor (AC 12 bare)
CASES = []
for rs in ("2024", "2014"):
    CASES += [
        ("first", rs, "Star Metal Ring", None, None, "unarmedType", "Force"),
        ("second", rs, "Star Metal Ring", None, None, "unarmedType", "Bludgeoning"),
        ("first", rs, "Straitjacket", None, None, "acT", 15 if rs == "2014" else 14),  # INT 15, 16 with the 2014 Human +1
        ("second", rs, "Straitjacket", None, None, "acT", 12),
        ("first", rs, "Fin Symbiote", None, None, "has:Advantage on Constitution saving throws", True),
        ("second", rs, "Fin Symbiote", None, None, "has:Advantage on Constitution saving throws", False),
        ("first", rs, "Toadstool Toddy", None, "toadstool-toddy", "has:Fire", True),
        ("second", rs, "Toadstool Toddy", None, "toadstool-toddy", "has:Fire", False),
        ("first", rs, "Finger Picks", None, None, "has:Thieves' Tools", True),
        ("second", rs, "Finger Picks", None, None, "has:Finger Picks: +2", True),
        ("first", rs, "Shoulder Cannon", None, None, "res:Shoulder Cannon", 1),
        ("second", rs, "Shoulder Cannon", None, None, "res:Shoulder Cannon", 0),
        ("first", rs, None, "Aberrant Spawn", None, "unarmedAb", "STR"),  # FEATS keeps the tvss14 record (loaded last, VSS14): Strength tentacle. The tsdm record is not reachable while both books load
    ]
JS = """([cases,drop])=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 if(drop){Object.keys(drop).forEach(id=>{WXI[id]=WXI[id].filter(r=>drop[id].indexOf(r[0])<0)})}
 const mk=(rs,item,feat)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true}]:[];
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}});return t};
 const ac=C=>C.ac.base+(C.ac.dex==='full'||C.ac.dex==='max2'?2:0)+C.ac.bonus.reduce((s,x)=>s+x.v,0),cnt=(s,w)=>s.split(w).length-1;
 return cases.map(([pg,rs,item,feat,tg,k,exp])=>{try{const fx=tg?{[tg]:true}:{},A=window.__bldSheetFor(mk(rs,null,null),fx),Z=window.__bldSheetFor(mk(rs,item,feat),fx);
  const u=Z.attacks.find(a=>a.n==='Unarmed Strike')||{};
  if(k==='unarmedType')return u.type;if(k==='unarmedAb')return JSON.stringify(Z).indexOf('Aberrant Spawn')<0?'no feat':u.ab;if(k==='acT')return ac(Z);
  if(k.startsWith('has:')){const w=k.slice(4);return cnt(JSON.stringify(Z),w)>cnt(JSON.stringify(A),w)}
  if(k.startsWith('res:')){const w=k.slice(4);return (Z.res||[]).filter(r=>JSON.stringify(r).indexOf(w)>=0&&/"max":1\\b/.test(JSON.stringify(r))).length}return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch()
    for page in ("first", "second"):
        pg = br.new_page(); pg.set_default_timeout(180000)
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
        pg.wait_for_function("typeof window.__bldFuzz==='function'"); pg.wait_for_function("window.__deferDone")
        cs = [c for c in CASES if c[0] == page]
        res = pg.evaluate(JS, [[list(c) for c in cs], DROP if page == "second" else None])
        for c, got in zip(cs, res):
            ok = got == c[6]; n += 1; bad += not ok
            print("%s %s %s %s %s: %s" % ("ok  " if ok else "FAIL", page, c[1], c[2] or c[3], c[5], "" if ok else "got %s, expected %s" % (got, c[6])))
        pg.close()
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
