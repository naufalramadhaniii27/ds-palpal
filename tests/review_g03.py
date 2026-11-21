#!/usr/bin/env python3
"""Sheet checks of the review g03 fixes in fx-B28 (Vecna, tool and skill picks), B29 (Ebon Blade srLu), B33 (Mandrake, horns), B36 (Alchemist, Antiquarian), B37 (slotConv 2024 only).
python3 tests/review_g03.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, class, subclass, level, species, item, toggle id or None, check, arg, expected)
# check: imm = arg in the immunities; speed; horns = number of attack rows named Horns or with 1d6 unarmed; spell = arg in the sheet spells;
# sr = refill slot level of pool arg; cv = slot conversion of pool feature arg ('' none); txt = arg in the sheet JSON
CASES = [
    ("Eye of Vecna alone: no Poison immunity", "2024", "Fighter", "", 5, None, "Eye of Vecna", None, "imm", "Poison", False),
    ("Eye of Vecna, both attuned: Poison immunity", "2024", "Fighter", "", 5, None, "Eye of Vecna", "b28-vecna-both", "imm", "Poison", True),
    ("Spring Mandrake: Speed 35", "2014", "Fighter", "", 5, "Spring Mandrake", None, None, "speed", None, 35),
    ("Bhain Kwai Minotaur: one horns row", "2024", "Fighter", "", 5, "Bhain Kwai Minotaur", None, None, "horns", None, 1),
    ("Minotaur (Amonkhet): one horns row", "2014", "Fighter", "", 5, "Minotaur (Amonkhet)", None, None, "horns", None, 1),
    ("Alchemist 2014: no Tasha's Bubbling Cauldron", "2014", "Artificer", "Alchemist", 15, None, None, None, "spell", "Tasha's Bubbling Cauldron", False),
    ("Antiquarian: Fireball from Arcane Relics", "2024", "Investigator", "Antiquarian", 6, None, None, None, "spell", "Fireball", True),
    ("Ebon Blade: Aspect refilled by a level 5 slot", "2024", "Death Knight", "Oath of the Ebon Blade", 20, None, None, None, "sr", "Aspect of the Horsemen", 5),
    ("Druid 2014: no Wild Resurgence chips", "2014", "Druid", "", 20, None, None, None, "txt", "ws:", False),
    ("Druid 2024: Wild Resurgence chips", "2024", "Druid", "", 20, None, None, None, "txt", "ws:", True),
    ("Bard 2014: no Font of Inspiration chips", "2014", "Bard", "", 5, None, None, None, "txt", "bi:", False),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,lv,sp,item)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub,lv,arr:[15,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true,att:true}]:[];if(sp)t.species=sp;return t};
 return cases.map(([lab,rs,cls,sub,lv,sp,item,tg,k,arg,exp])=>{try{const Z=window.__bldSheetFor(mk(rs,cls,sub,lv,sp,item),tg?{[tg]:true}:{}),j=JSON.stringify(Z);
  if(k==='imm')return new RegExp('Immun[^\\\\]]{0,120}'+arg).test(JSON.stringify([Z.defenses,Z.imm]));
  if(k==='speed')return Z.speed;
  if(k==='horns')return (Z.attacks||[]).filter(a=>/Horn/.test(a.n||'')||(/Unarmed/.test(a.n||'')&&/1d6/.test(JSON.stringify(a)))).length;
  if(k==='spell')return j.indexOf(arg)>=0;
  if(k==='sr'){const r=(Z.res||[]).find(r=>r.f===arg||r.n===arg);return r?r.sr:'no pool'}
  if(k==='txt')return j.indexOf('"cv":"'+arg)>=0;return 'bad check'}catch(e){return 'CRASH '+e}})}"""
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
        ok = got == c[10]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[10])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
