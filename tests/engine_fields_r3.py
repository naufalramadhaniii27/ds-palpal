#!/usr/bin/env python3
"""Engine fields round 3: atkDice crit:1 (natural 20 only, row xcrit), forCls on Mutagenist, Shadowsteel Master behind a switch,
darkvision order (plain darkTo/darkNone before darkAdd/darkHave; Keenness adds 60 to an existing Darkvision).  python3 tests/engine_fields_r3.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, cls, sub, lv, item, feat, species, toggle, check, expected)
# check: crit / dice = extra dice on the item's attack row (xcrit / xdice); climb; dark; necro = "2d8" Necrotic on a weapon row
CASES = [
    ("Vicious Weapon 2014: crit only", "2014", "Fighter", "", 5, "Vicious Weapon (Longsword)", None, None, None, "crit", "2d6"),
    ("Vicious Weapon 2014: not on every hit", "2014", "Fighter", "", 5, "Vicious Weapon (Longsword)", None, None, None, "dice", ""),
    ("Vicious Weapon 2024: every hit", "2024", "Fighter", "", 5, "Vicious Weapon (Longsword)", None, None, None, "dice", "2d6"),
    ("Vorpal Sword 2024: crit only", "2024", "Fighter", "", 5, "Vorpal Sword", None, None, None, "crit", "30"),
    ("Mutagenist Alchemist 10: climb", "2024", "Alchemist", "Mutagenist", 10, None, None, None, "b19-mutagen-climb", "climb", True),
    ("Mutagenist Artificer 10: no climb", "2024", "Artificer", "Mutagenist", 10, None, None, None, "b19-mutagen-climb", "climb", False),
    ("Shadowsteel off", "2024", "Fighter", "", 5, "Longsword", "Shadowsteel Master", None, None, "necro", False),
    ("Shadowsteel on", "2024", "Fighter", "", 5, "Longsword", "Shadowsteel Master", None, "b24-shadowsteel-focus", "necro", True),
    ("Keenness, no Darkvision: 60", "2014", "Fighter", "", 5, None, "Keenness of the Stone Giant", "Human (2014)", None, "dark", 60),
    ("Keenness, Darkvision 60: 120", "2014", "Fighter", "", 5, None, "Keenness of the Stone Giant", "Hill Dwarf", None, "dark", 120),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,lv,item,feat,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub,lv,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true}]:[];if(sp)t.species=sp;
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}});return t};
 return cases.map(([lab,rs,cls,sub,lv,item,feat,sp,tg,k,exp])=>{try{const Z=window.__bldSheetFor(mk(rs,cls,sub,lv,item,feat,sp),tg?{[tg]:true}:{});
  const row=(Z.attacks||[]).find(r=>item&&r.n.indexOf(item.replace(/ \\(.*/,''))===0)||{};
  if(k==='crit')return (row.xcrit||[]).map(x=>x.d).join(',');if(k==='dice')return (row.xdice||[]).map(x=>x.d).join(',');
  if(k==='climb')return /Advanced Mutation \\(speed\\)/.test(JSON.stringify(Z));
  if(k==='dark')return Z.darkvision===exp?exp:[Z.darkvision,Z.darkSrc,Z.species||''].join('|');
  if(k==='necro')return (Z.attacks||[]).some(r=>(r.xdice||[]).some(x=>x.d==='2d8'&&/Necrotic/.test(x.t)));return 'bad check'}catch(e){return 'CRASH '+e}})}"""
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
