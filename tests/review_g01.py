#!/usr/bin/env python3
"""Review g01 fixes on the computed sheet: no doubled feat cantrip (B17 vs DM_SP), no doubled or conditional item Resistance (B13),
Freerunner Momentum 2d6 from level 11 (B11), Gamma Pendant 2024 Advantage only when complete (B10), Lance rider shown once (B12).
python3 tests/review_g01.py"""
import os, sys, re, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(c)=>{const rs=c.rs,o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:c.cls||'Fighter',sub:'',lv:c.lv||8,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=c.item?[{n:c.item,q:1,eq:true}]:[];if(c.sub)t.sub=c.sub;
  if(c.feat)t.ch=Object.assign({},t.ch,{feat4:{feat:c.feat,a1:'STR',a2:'CON'}});return t};
 return cases.map(c=>{try{const C=window.__bldSheetFor(mk(c),c.tg?{[c.tg]:true}:{});
  return JSON.stringify({spells:(C.spells||[]).map(s=>s.n),def:C.defenses||[],res:C.res||[],atk:(C.attacks||C.weapons||[]).map(r=>({n:r.n,note:r.note||'',xd:r.xdice||[]})),all:JSON.stringify(C)})}catch(e){return 'CRASH '+e}})}"""
def spell_n(name): return lambda S: sum(1 for s in S["spells"] if s == name)
def res_n(typ): return lambda S: len(re.findall(r'Resistance[^\]]{0,80}' + typ, json.dumps([S["def"], S["res"]])))
def adv(S): return "Advantage on saves against spells" in S["all"]
def mom(S): return sum(1 for d in S["def"] if d.get("s", "").startswith("Momentum (rider")) + max([sum(1 for x in r["xd"] if x.get("s", "").startswith("Momentum")) for r in S["atk"]] or [0])  # a d6 per row; no weapon row = a Note under Defenses
def lance(S): return max([r["note"].count("1d12") for r in S["atk"] if "Lance" in r["n"]] or [-1])
# (label, case, check, expected)
CASES = [
    ("Arcane Artist: Minor Illusion once", dict(rs="2024", feat="Arcane Artist"), spell_n("Minor Illusion"), 1),
    ("Child of the Sun: Faerie Fire once", dict(rs="2024", feat="Child of the Sun"), spell_n("Faerie Fire"), 1),
    ("Arachne keeps Poison Spray", dict(rs="2024", feat="Arachne"), spell_n("Poison Spray"), 1),
    ("Borealus: Fire Resistance once", dict(rs="2024", item="Borealus"), res_n("Fire"), 1),
    ("Brooch of Shielding: Force once", dict(rs="2024", item="Brooch of Shielding"), res_n("Force"), 1),
    ("Psionic Piercing: no Psychic", dict(rs="2024", item="Psionic Piercing"), res_n("Psychic"), 0),
    ("Gazing Hydrangea: no Psychic", dict(rs="2024", item="Gazing Hydrangea"), res_n("Psychic"), 0),
    ("Kwark's Planter: no Fire", dict(rs="2024", item="Kwark's Wondrous Kernels, Planter"), res_n("Fire"), 0),
    ("Freerunner 10: Momentum 1d6", dict(rs="2024", cls="Ranger", sub="Freerunner", lv=10), mom, 1),
    ("Freerunner 11: Momentum 2d6", dict(rs="2024", cls="Ranger", sub="Freerunner", lv=11), mom, 2),
    ("Gamma Pendant 2024 incomplete: no Advantage", dict(rs="2024", item="Gamma Pendant"), adv, False),
    ("Gamma Pendant 2024 complete: Advantage", dict(rs="2024", item="Gamma Pendant", tg="gamma-pendant-complete"), adv, True),
    ("Gamma Pendant 2014: Advantage", dict(rs="2014", item="Gamma Pendant"), adv, True),
    ("Lance of the Hungering Dead: 1d12 once", dict(rs="2024", item="Lance of the Hungering Dead"), lance, 1),
]
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    out = pg.evaluate(JS, [c[1] for c in CASES])
    for c, raw in zip(CASES, out):
        got = raw if raw.startswith("CRASH") else c[2](json.loads(raw))
        ok = got == c[3]; n += 1; bad += not ok
        print("%s %s%s" % ("ok  " if ok else "FAIL", c[0], "" if ok else ": got %s, expected %s" % (got, c[3])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
