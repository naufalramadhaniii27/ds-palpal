#!/usr/bin/env python3
"""Book choice (inv row bk, feat choice bk): when two enabled books share an item or feat name, the player's pick of a book decides the record
and the fromBk gate. Each fromBk pair with bk set to each book gets that book's effect; without bk the result is today's (first loaded item row,
last loaded feat record). Same checks as tests/book_gate_numbers.py, all books on, both rule sets.
python3 tests/book_choice_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (rules, item, feat, bk, toggle, check, expected). bk None = old save. Fighter 19, STR 10 DEX 14 CON 14 INT 15, no armor (AC 12 bare)
CASES = []
for rs in ("2024", "2014"):
    st = 15 if rs == "2014" else 14
    CASES += [
        (rs, "Star Metal Ring", None, None, None, "unarmedType", "Force"),
        (rs, "Star Metal Ring", None, "tghg", None, "unarmedType", "Force"),
        (rs, "Star Metal Ring", None, "tgh14p", None, "unarmedType", "Bludgeoning"),
        (rs, "Straitjacket", None, None, None, "acT", st),
        (rs, "Straitjacket", None, "tghg", None, "acT", st),
        (rs, "Straitjacket", None, "tgh14p", None, "acT", 12),
        (rs, "Fin Symbiote", None, None, None, "has:Advantage on Constitution saving throws", True),
        (rs, "Fin Symbiote", None, "tghg", None, "has:Advantage on Constitution saving throws", True),
        (rs, "Fin Symbiote", None, "tgh14p", None, "has:Advantage on Constitution saving throws", False),
        (rs, "Toadstool Toddy", None, None, "toadstool-toddy", "has:Fire", True),
        (rs, "Toadstool Toddy", None, "tghg", "toadstool-toddy", "has:Fire", True),
        (rs, "Toadstool Toddy", None, "tgh14p", "toadstool-toddy", "has:Fire", False),
        (rs, "Finger Picks", None, None, None, "has:Thieves' Tools", True),
        (rs, "Finger Picks", None, "tsdm", None, "has:Thieves' Tools", True),
        (rs, "Finger Picks", None, "tdm14", None, "has:Finger Picks: +2", True),
        (rs, "Shoulder Cannon", None, None, None, "res:Shoulder Cannon", 1),
        (rs, "Shoulder Cannon", None, "tsdm", None, "res:Shoulder Cannon", 1),
        (rs, "Shoulder Cannon", None, "tdm14", None, "res:Shoulder Cannon", 0),
        (rs, None, "Aberrant Spawn", None, None, "unarmedAb", "STR"),  # old save: FEATS keeps the tvss14 record
        (rs, None, "Aberrant Spawn", "tvss14", None, "unarmedAb", "STR"),
        (rs, None, "Aberrant Spawn", "tsdm", None, "unarmedAb", "DEX"),
    ]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item,feat,bk)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[Object.assign({n:item,q:1,eq:true},bk?{bk}:{})]:[];
  if(feat)t.ch=Object.assign({},t.ch,{feat4:Object.assign({feat,a1:'STR',a2:'CON'},bk?{bk}:{})});return t};
 const ac=C=>C.ac.base+(C.ac.dex==='full'||C.ac.dex==='max2'?2:0)+C.ac.bonus.reduce((s,x)=>s+x.v,0),cnt=(s,w)=>s.split(w).length-1;
 return cases.map(([rs,item,feat,bk,tg,k,exp])=>{try{const fx=tg?{[tg]:true}:{},A=window.__bldSheetFor(mk(rs,null,null,null),fx),Z=window.__bldSheetFor(mk(rs,item,feat,bk),fx);
  const u=Z.attacks.find(a=>a.n==='Unarmed Strike')||{};
  if(k==='unarmedType')return u.type;if(k==='unarmedAb')return JSON.stringify(Z).indexOf('Aberrant Spawn')<0?'no feat':u.ab;if(k==='acT')return ac(Z);
  if(k.startsWith('has:')){const w=k.slice(4);return cnt(JSON.stringify(Z),w)>cnt(JSON.stringify(A),w)}
  if(k.startsWith('res:')){const w=k.slice(4);return (Z.res||[]).filter(r=>JSON.stringify(r).indexOf(w)>=0&&/"max":1\\b/.test(JSON.stringify(r))).length}return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(180000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("typeof window.__bldFuzz==='function'"); pg.wait_for_function("window.__deferDone")
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[6]; n += 1; bad += not ok
        print("%s %s %s bk=%s %s: %s" % ("ok  " if ok else "FAIL", c[0], c[1] or c[2], c[3], c[5], "" if ok else "got %s, expected %s" % (got, c[6])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
