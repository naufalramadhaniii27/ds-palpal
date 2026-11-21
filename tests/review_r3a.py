#!/usr/bin/env python3
"""Review round 3a fixes on the computed sheet: fx-B7 (fly only while Galactic Knight / Faerzress Form is on, Brewer's Supplies, no doubled
feat speeds or Rock Gnome tools) and fx-B26 (feat spells that D.dm / E.dmSp already grant are listed once).  python3 tests/review_r3a.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, class, subclass, feat, species, toggle id or None, check, arg, expected)
# check: move = number of moves rows of kind arg; tool = arg in the tools line (1/0); spell = number of spell rows named arg
CASES = [
    ("Galactic Knight off: no fly", "2024", "Paladin", "Oath of the Gamma Knight", None, None, None, "move", "fly", 0),
    ("Galactic Knight on: fly", "2024", "Paladin", "Oath of the Gamma Knight", None, None, "b7-galactic-knight", "move", "fly", 1),
    ("Faerzress Form off: no fly", "2024", "Sorcerer", "Faerzress Sorcery", None, None, None, "move", "fly", 0),
    ("Faerzress Form on: fly", "2024", "Sorcerer", "Faerzress Sorcery", None, None, "b20-faerzress", "move", "fly", 1),
    ("Strengthened Wings: one fly row", "2014", "Fighter", "", "Strengthened Wings", None, None, "move", "fly", 1),
    ("Aquatic: one swim row", "2014", "Fighter", "", "Aquatic", None, None, "move", "swim", 1),
    ("Child of the Sea: one swim row", "2024", "Fighter", "", "Child of the Sea (WoW)", None, None, "move", "swim", 1),
    ("Rock Gnome: Tinker's Tools", "2014", "Fighter", "", None, "Rock Gnome", None, "tool", "Tinker's Tools", 1),
    ("Warrior of Mystic Brews: Brewer's Supplies", "2024", "Monk", "Warrior of Mystic Brews", None, None, None, "tool", "Brewer's Supplies", 1),
    ("Warrior of Intoxication: Brewer's Supplies", "2024", "Monk", "Warrior of Intoxication", None, None, None, "tool", "Brewer's Supplies", 1),
    ("Familiar Friend: Find Familiar once", "2024", "Fighter", "", "Familiar Friend", None, None, "spell", "Find Familiar", 1),
    ("Second Skin: Alter Self once", "2024", "Fighter", "", "Second Skin", None, None, "spell", "Alter Self", 1),
    ("Mark of Making: Mending once", "2024", "Fighter", "", "Mark of Making", None, None, "spell", "Mending", 1),
    ("Mark of Making: Magic Weapon once", "2024", "Fighter", "", "Mark of Making", None, None, "spell", "Magic Weapon", 1),
    ("Mark of Shadow: Minor Illusion once", "2024", "Fighter", "", "Mark of Shadow", None, None, "spell", "Minor Illusion", 1),
    ("Mark of Shadow: Invisibility once", "2024", "Fighter", "", "Mark of Shadow", None, None, "spell", "Invisibility", 1),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,feat,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv:20,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[];if(sp)t.species=sp;if(sub)t.sub=sub;
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}});return t};
 return cases.map(([lab,rs,cls,sub,feat,sp,tg,k,arg])=>{try{const C=window.__bldSheetFor(mk(rs,cls,sub,feat,sp),tg?{[tg]:true}:{});
  if(sub&&C.sub!==sub)return 'subclass not set';
  if(k==='move')return (C.moves||[]).filter(m=>m.m===arg).length;
  if(k==='tool')return String((C.profs||{}).tools||'').split(/, */).includes(arg)?1:0;
  if(k==='spell')return (C.spells||[]).filter(s=>s.n===arg).length;return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)  # GX entries of the deferred blocks are in
    res = pg.evaluate(JS, [list(c[:9]) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[9]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[9])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
