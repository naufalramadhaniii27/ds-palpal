#!/usr/bin/env python3
"""Review fix C: 2024-only class features stay off 2014 builds, same-named feats and subclasses of two books keep their own effects, Plantmender minimum.
python3 tests/review_fix_c.py"""
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, class, subclass, level, feat, WIS, check, text, expected). check "has": text is in the sheet JSON; "sp": the spell is on the sheet; "lu": max of the limited use named text
CASES = [
    ("2014 Paladin 11: no Radiant Strikes", "2014", "Paladin", "", 11, None, 15, "has", "Radiant Strikes", False),
    ("2014 Paladin 11: Improved Divine Smite melee", "2014", "Paladin", "", 11, None, 15, "has", "Improved Divine Smite (Paladin 11)", True),
    ("2024 Paladin 11: Radiant Strikes", "2024", "Paladin", "", 11, None, 15, "has", "Radiant Strikes (Paladin 11)", True),
    ("2014 Ranger 18: no Feral Senses Blindsight", "2014", "Ranger", "", 18, None, 15, "has", "Blindsight 30 ft from Feral Senses", False),
    ("2024 Ranger 18: Feral Senses Blindsight", "2024", "Ranger", "", 18, None, 15, "has", "Blindsight 30 ft from Feral Senses", True),
    ("2014 Bard 20: no Power Word Heal", "2014", "Bard", "", 20, None, 15, "has", "Words of Creation", False),
    ("2024 Bard 20: Words of Creation", "2024", "Bard", "", 20, None, 15, "has", "Words of Creation", True),
    ("2014 Druid 1: no Speak with Animals from Druidic", "2014", "Druid", "", 1, None, 15, "sp", "Speak with Animals", False),
    ("2024 Druid 1: Speak with Animals from Druidic", "2024", "Druid", "", 1, None, 15, "sp", "Speak with Animals", True),
    ("2014 Proto-Man (VSS14): no DM24 Primal Toughness", "2014", "Fighter", "", 4, "Proto-Man", 15, "has", "Primal Toughness", False),
    ("2024 Proto-Man (DM24): Primal Toughness", "2024", "Fighter", "", 4, "Proto-Man", 15, "has", "Primal Toughness", True),
    ("2014 Precognitive (VSS14): no DM24 Augury", "2014", "Fighter", "", 4, "Precognitive", 15, "has", "Augury (free cast)", False),
    ("2014 Grue (VSS14): no DM24 Swirl of Shadows", "2014", "Fighter", "", 8, "Grue", 15, "has", "Swirl of Shadows", False),
    ("2024 Reptiloid (DM24): Reptilian Resistance", "2024", "Fighter", "", 4, "Reptiloid", 15, "has", "Reptilian Resistance (Fire)", True),
    ("2014 Reptiloid (VSS14): no DM24 Reptilian Resistance", "2014", "Fighter", "", 4, "Reptiloid", 15, "has", "Reptilian Resistance (Fire)", False),
    ("Artificer Reanimator 20 (rhw): no tvss Patchwork Golem", "2024", "Artificer", "Reanimator", 20, None, 15, "has", "Patchwork Golem", False),
    ("Necromancer Reanimator 20 (tvss): Patchwork Golem", "2024", "Necromancer", "Reanimator", 20, None, 15, "has", "Patchwork Golem", True),
    ("Wizard Plague Doctor 3 (tghp): no tvss Physician", "2024", "Wizard", "Plague Doctor", 3, None, 15, "has", "Physician (Plague Doctor", False),
    ("Vagabond Plague Doctor 3 (tvss): Physician", "2024", "Vagabond", "Plague Doctor", 3, None, 15, "has", "Physician (Plague Doctor", True),
    ("Plantmender at WIS 8: Plant Memory 1", "2024", "Fighter", "", 4, "Plantmender", 8, "lu", "Plant Memory", 1),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,lv,feat,wis)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub,lv,arr:[15,14,14,10,wis,10],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[];
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'},rr:['Fire']});/* rr: the Reptiloid (DM24) resistance pick */return t};
 return cases.map(([lab,rs,cls,sub,lv,feat,wis,k,txt])=>{try{const B=mk(rs,cls,sub,lv,feat,wis),C=window.__bldSheetFor(B,{}),J=JSON.stringify(C);
  if(k==='has')return J.indexOf(txt)>=0;
  if(k==='sp')return (C.spells||[]).some(s=>s.n===txt);
  if(k==='lu'){const m=new RegExp('"n":"'+txt+'"[^}]*?"max":(\\\\d+)').exec(J)||new RegExp('"max":(\\\\d+)[^}]*?"n":"'+txt+'"').exec(J);return m?+m[1]:'missing'}return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [list(c[:9]) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[9]; n += 1; bad += not ok
        print("%s %s: %s" % ("ok  " if ok else "FAIL", c[0], "" if ok else "got %s, expected %s" % (got, c[9])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
