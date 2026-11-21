#!/usr/bin/env python3
"""2014 Divine Sense and Spell Mastery numbers.
  python3 tests/sense_mastery_numbers.py
Divine Sense: 1 + Charisma modifier per Long Rest with no minimum (PHB 2014 p. 84), so Cha 9 or lower gives no uses.
Cleansing Touch: Charisma modifier, minimum once (PHB 2014 p. 85).
Spell Mastery (PHB 2014 p. 118): a Quick Build Wizard 18 has a level 2 spell in its spellbook, and both mastery spells show At will.
Exit 1 on any difference."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = r"""()=>{const R=['Human (2014)','Soldier (2014)',{phb14:true,dmg14:true}],o={pal:{}};
let b=window.__bldFillFor(window.__bldFuzz({sp:R[0],bg:R[1],rs:'2014',src:R[2],cls:'Wizard',sub:'',lv:18,arr:[15,14,13,12,10,8],b2:0,b1:0}).b);
o.sm=window.__bldChoiceList(b).filter(c=>/^p18sm[12]$/.test(c.key)).map(c=>[c.key,(c.list||[]).length,(b.ch[c.key]||[]).length]);
o.free=(window.__bldSheetFor(b).spells||[]).filter(s=>/At will/.test(JSON.stringify(s))).map(s=>s.l);
for(const cha of [6,8,9,10,12,16]){const p=window.__bldFuzz({sp:R[0],bg:R[1],rs:'2014',src:R[2],cls:'Paladin',sub:'',lv:14,arr:[15,14,13,12,10,8],b2:0,b1:0}).b;
 p.method='manual';p.base={STR:15,DEX:10,CON:14,INT:10,WIS:10,CHA:cha};window.__sheetApply(window.__bldSheetFor(p),false);
 const r={};(window.__D().res||[]).forEach(x=>{if(/^(Divine Sense|Cleansing Touch)$/.test(x.n))r[x.n]=x.max});o.pal[cha]=r}
return o}"""
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__bldFillFor==='function'")
    o = pg.evaluate(JS); br.close()
bad = []
for cha, r in o["pal"].items():
    m = (int(cha) + 1 - 10) // 2  # Human (2014) gives +1 to every score
    ds, ct = max(0, 1 + m), max(1, m)
    if r.get("Divine Sense", 0) != ds: bad.append("Cha %s Divine Sense %s, expected %s" % (cha, r.get("Divine Sense", 0), ds))
    if r.get("Cleansing Touch") != ct: bad.append("Cha %s Cleansing Touch %s, expected %s" % (cha, r.get("Cleansing Touch"), ct))
for k, n, picked in o["sm"]:
    if not n or picked != 1: bad.append("%s: %d choices, %d picked" % (k, n, picked))
if sorted(o["free"]) != [1, 2]: bad.append("At will spell levels %s, expected [1, 2]" % o["free"])
for b in bad: print("FAIL", b)
print("sense_mastery_numbers: %d checks, %d failed" % (2 * len(o["pal"]) + 3, len(bad)))
sys.exit(1 if bad else 0)
