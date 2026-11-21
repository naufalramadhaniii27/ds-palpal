#!/usr/bin/env python3
"""Review round 3b fixes on the computed sheet: Aberrant Spawn Dex unarmed only for the 2024 (DM24) feat, Kaunen rune note,
Ranger Roving only in 2024 and from one source, Knight Errant Chivalrous Oath asks for its skills once.  python3 tests/review_r3b.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = """()=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,lv,feat,ch)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[];
  t.ch=Object.assign({},t.ch,feat?{feat4:{feat,a1:'STR',a2:'CON'}}:{},ch||{});return t};
 const S=t=>window.__bldSheetFor(t,{}),ua=C=>(C.attacks.find(a=>a.n==='Unarmed Strike')||{}).ab;
 const climbs=C=>(JSON.stringify(C).match(/Climb/g)||[]).length;
 const r={};
 r.spawn14=ua(S(mk('2014','Fighter',4,'Aberrant Spawn')));
 r.spawn24=ua(S(mk('2024','Fighter',4,'Aberrant Spawn')));
 r.kaunen=/Kaunen rune: if you already have darkvision/.test(JSON.stringify(S(mk('2024','Fighter',4,'Rune Knowledge',{'gx-rk-feat-feat4':'Kaunen'}))));
 r.rov14=climbs(S(mk('2014','Ranger',6)));r.rov24=climbs(S(mk('2024','Ranger',6)))>0;
 r.rovGX=(GX.cls.Ranger||[]).some(e=>/Roving/.test(e.n));
 r.kePick=(GX.sub['Knight Errant']||[]).some(e=>/Chivalrous/.test(e.n)&&!!e.pick);
 return r}"""
# spawn24: with both books loaded FEATS keeps the tvss14 (Strength) record; book_gate_numbers covers the tsdm Dex case
EXP = {"spawn14": "STR", "spawn24": "STR", "kaunen": True, "rov14": 0, "rov24": True, "rovGX": False, "kePick": False}
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(180000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("typeof window.__bldFuzz==='function'"); pg.wait_for_function("window.__deferDone", timeout=180000)
    got = pg.evaluate(JS); br.close()
bad = 0
for k, v in EXP.items():
    ok = got.get(k) == v; bad += not ok
    print("%s %s: %s" % ("ok  " if ok else "FAIL", k, "" if ok else "got %r, expected %r" % (got.get(k), v)))
print("%d checked, %d failed" % (len(EXP), bad)); sys.exit(1 if bad else 0)
