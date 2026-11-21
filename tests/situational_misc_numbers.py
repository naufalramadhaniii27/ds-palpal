#!/usr/bin/env python3
"""Sheet numbers of the feat, item and species switches in src/data/fx-B61-situational-misc.js (situational rules that were mech_scan by_design).
A switch gives its number only while it is on; a worn graft or amulet counts while equipped.  python3 tests/situational_misc_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item, feat, species, toggle id or None, check, expected). Fighter 19, STR 10 DEX 14 CON 14, no armor (AC 12 bare).
# check: ac / init / speed = the number with the item, feat or species, minus the same build without it; acT = total AC; adv / res = text on the sheet
H = "Human (2014)"
CASES = [
    ("Chitinous Shell on: AC +2", "2014", None, "Aberrant Horror Transformation: Level 1", None, "b61-chitinous-shell", "ac", 2),
    ("Chitinous Shell on: Speed -10", "2014", None, "Aberrant Horror Transformation: Level 1", None, "b61-chitinous-shell", "speed", -10),
    ("Chitinous Shell off", "2014", None, "Aberrant Horror Transformation: Level 1", None, None, "ac", 0),
    ("Deathbound on", "2024", None, "Deathbound", None, "b61-last-breath", "adv", "Death Saving Throws"),
    ("Deathbound off", "2024", None, "Deathbound", None, None, "adv", "missing"),
    ("Golem Upgrade plating on: AC 18", "2014", None, "Golem Upgrade", None, "b61-golem-plating", "acT", 18),
    ("Golem Upgrade plating off", "2014", None, "Golem Upgrade", None, None, "acT", 12),
    ("Enhanced Phylactery on: 15 + Dex", "2014", None, "Lich Transformation: Level 3", None, "b61-enhanced-phylactery", "acT", 17),
    ("Enhanced Phylactery off", "2014", None, "Lich Transformation: Level 3", None, None, "acT", 12),
    ("Lycanthrope hybrid on: 10 + Con + Dex", "2014", None, "Lycanthrope Transformation: Level 1", None, "b61-lycan-hybrid", "acT", 14),
    ("Lycanthrope hybrid off", "2014", None, "Lycanthrope Transformation: Level 1", None, None, "acT", 12),
    ("Tauran Rush on", "2014", None, "Tauran", None, "b61-tauran-rush", "speed", 10),
    ("Tauran Rush off", "2014", None, "Tauran", None, None, "speed", 0),
    ("Esquire's Rowels on", "2024", "Esquire's Rowels", None, None, "b61-esquire-rowels", "init", 1),
    ("Esquire's Rowels off", "2024", "Esquire's Rowels", None, None, None, "init", 0),
    ("Adamantine Plating: AC 17", "2014", "Adamantine Plating", None, None, None, "acT", 17),
    ("Mithral Plating: 14 + Dex", "2014", "Mithral Plating", None, None, None, "acT", 16),
    ("Mithral Plating: Lightning", "2014", "Mithral Plating", None, None, None, "res", "Lightning"),
    ("Spiked Plating: 14 + Dex (max 2)", "2014", "Spiked Plating", None, None, None, "acT", 16),
    ("Personal Shield Emitter: 13 + Dex", "2014", "Personal Shield Emitter", None, None, None, "acT", 15),
    ("Beasthide shifted on", "2014", None, None, "Shifter (Beasthide)", "shifter-shifted", "ac", 1),
    ("Beasthide shifted off", "2014", None, None, "Shifter (Beasthide)", None, "ac", 0),
    ("Swiftstride shifted on", "2014", None, None, "Shifter (Swiftstride)", "shifter-shifted", "speed", 10),
    ("Swiftstride shifted off", "2014", None, None, "Shifter (Swiftstride)", None, "speed", 0),
    ("Feast of Blood on: Speed", "2014", None, None, "Vampire (Ixalan)", "b61-feast-of-blood", "speed", 10),
    ("Feast of Blood on: Advantage", "2014", None, None, "Vampire (Ixalan)", "b61-feast-of-blood", "adv", "Strength and Dexterity checks"),
    ("Feast of Blood off", "2014", None, None, "Vampire (Ixalan)", None, "speed", 0),
    ("Studied Insight on", "2024", None, None, "Uncorrupted Derro", "b61-studied-insight", "adv", "Initiative"),
    ("Studied Insight off", "2024", None, None, "Uncorrupted Derro", None, "adv", "missing"),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item,feat,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true}]:[];if(sp)t.species=sp;
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}});return t};
 const ac=C=>C.ac.base+(C.ac.dex==='full'||C.ac.dex==='max2'?2:0)+C.ac.bonus.reduce((s,x)=>s+x.v,0),ini=C=>(C.initBonus||[]).reduce((s,x)=>s+x.v,0);
 const txt=C=>JSON.stringify(C);
 return cases.map(([lab,rs,item,feat,sp,tg,k,exp])=>{try{const fx=tg?{[tg]:true}:{},A=window.__bldSheetFor(mk(rs,null,null,null),fx),Z=window.__bldSheetFor(mk(rs,item,feat,sp),fx);
  if(k==='ac')return ac(Z)-ac(A);if(k==='acT')return ac(Z);if(k==='init')return ini(Z)-ini(A);if(k==='speed')return Z.speed-A.speed;
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
