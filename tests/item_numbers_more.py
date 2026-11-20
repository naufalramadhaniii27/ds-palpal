#!/usr/bin/env python3
"""Sheet numbers of WotC magic items outside the DMG (Tasha's, Fizban's, Book of Many Things, MToF and others), rules 2024 and 2014, one browser session.
- A spell attack or DC bonus that the text gives to the spells of one class (fx spellCls, "Druid|Ranger" = either) counts only for that class:
  Arcane Grimoire on a Wizard 6 / Cleric 4 raises the Wizard numbers, not the Cleric ones. Before, every caster class got it.
- An item that a class must attune to gives nothing to another class (Arcane Grimoire on a Sorcerer).
- "a creature that has psionic ability" names no class: with the Psion book on, the Greater Silver Sword gave nothing (the class test matched "psion" inside "psionic").
- Wraps of Unarmed Prowess (fx ua) add to the Unarmed Strike row.  python3 tests/item_numbers_more.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, class, multiclass or None, item, check, expected); check: sp = [DC, attack] change of the main caster, by = {class: [DC, attack]} change, ua = [attack, damage] of the Unarmed Strike
CASES = [
    ("Arcane Grimoire +2 on a Wizard", "Wizard", None, "+2 Arcane Grimoire", "sp", [2, 2]),
    ("Arcane Grimoire +2 on a Sorcerer (not attuned)", "Sorcerer", None, "+2 Arcane Grimoire", "sp", [0, 0]),
    ("Arcane Grimoire +2: Wizard spells only", "Wizard", ["Cleric", 4], "+2 Arcane Grimoire", "by", {"Wizard": [2, 2], "Cleric": [0, 0]}),
    ("Amulet of the Devout +2: all spells", "Cleric", ["Wizard", 4], "+2 Amulet of the Devout", "by", {"Wizard": [2, 2], "Cleric": [2, 2]}),
    ("Moon Sickle +1 on a Druid", "Druid", None, "+1 Moon Sickle", "sp", [1, 1]),
    ("Moon Sickle +1 on a Ranger", "Ranger", None, "+1 Moon Sickle", "sp", [1, 1]),
    ("Rhythm-Maker's Drum +3 on a Bard", "Bard", None, "+3 Rhythm-Maker's Drum", "sp", [3, 3]),
    ("Bloodwell Vial +2 on a Sorcerer", "Sorcerer", None, "+2 Bloodwell Vial", "sp", [2, 2]),
    ("All-Purpose Tool +1 on an Artificer", "Artificer", None, "+1 All-Purpose Tool", "sp", [1, 1]),
    ("Reveler's Concertina on a Bard: DC +2 only", "Bard", None, "Reveler's Concertina", "sp", [2, 0]),
    ("Wraps of Unarmed Prowess +2", "Monk", None, "+2 Wraps of Unarmed Prowess", "ua", [2, 2]),
    ("Greater Silver Sword +3 (Psion book on)", "Fighter", None, "Greater Silver Sword", "gs", [3, True]),
    ("Dragonhide Belt +2: Focus or ki DC +2", "Monk", None, "+2 Dragonhide Belt", "dc", 2),
]
JS = """([rs,cases])=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(cls,mc)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv:mc?6:10,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;
  b.src=Object.assign({},b.src,all);if(mc)b.mc=[{cls:mc[0],sub:'',lv:mc[1]}];return b};
 const one=(b0,n)=>{const b=structuredClone(b0);b.inv=n?[{n,q:1,eq:true}]:[];const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
 const ua=C=>{const u=C.attacks.find(a=>a.n==='Unarmed Strike');return [u.misc||0,u.dmgBonus||0]};
 return cases.map(([lab,cls,mc,item,k])=>{try{const b=mk(cls,mc),A=one(b,null),Z=one(b,item);
  if(k==='sp')return [Z.spellcasting.dc-A.spellcasting.dc,Z.spellcasting.atk-A.spellcasting.atk];
  if(k==='by'){const o={};(Z.spellcasting.by||[]).forEach((x,i)=>{const y=A.spellcasting.by[i];o[x.n.indexOf(mc[0])>=0?mc[0]:cls]=[x.dc-y.dc,x.atk-y.atk]});return o}
  if(k==='dc'){const d=C=>+(JSON.stringify(C).match(/Focus Points, save DC (\\d+)|ki save DC: (\\d+)|save DC (\\d+)/)||[]).slice(1).find(x=>x);return d(Z)-d(A)}
  if(k==='ua')return [ua(Z)[0]-ua(A)[0],ua(Z)[1]-ua(A)[1]];
  const w=Z.attacks.find(a=>a.n===item);return [w&&w.misc||0,JSON.stringify(Z.defenses).indexOf('Psychic')>=0]}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    for rs in ("2024", "2014"):
        res = pg.evaluate(JS, [rs, [list(c[:5]) for c in CASES]])
        for c, got in zip(CASES, res):
            ok = got == c[5]; n += 1; bad += not ok
            print("%s %s %s: %s" % ("ok  " if ok else "FAIL", rs, c[0], "" if ok else "got %s, expected %s" % (got, c[5])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
