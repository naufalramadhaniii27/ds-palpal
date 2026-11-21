#!/usr/bin/env python3
"""Review g11 fixes in src/data/fx-L2.js and fx-L3.js, checked on the computed sheet.
Rings of Elemental Command give their extra properties only with the "slew/helped slay" switch; edition-gated rows
(Blackrazor, Axe of the Dwarvish Lords, Armor of Zombie Flesh, Book of Vile Darkness); item cantrips listed once.
python3 tests/review_g11.py   (DUMP=1 prints the sheet of the first case)"""
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item, toggle id or None, check, arg, expected)
# check: has = regex found in the sheet JSON, acT = total AC, acB = AC base, sense = name in C.senses, spn = times a spell name is listed in C.spells
CASES = [
    ("Fire ring off: Fire resistance", "2014", "Ring of Fire Elemental Command", None, "has", "res:Fire", True),
    ("Fire ring off: no Fire immunity", "2014", "Ring of Fire Elemental Command", None, "has", "imm:Fire", False),
    ("Fire ring slain: Fire immunity", "2014", "Ring of Fire Elemental Command", "fire-elemental-slain", "has", "imm:Fire", True),
    ("Air ring off: no Lightning resistance", "2014", "Ring of Air Elemental Command", None, "has", "res:Lightning", False),
    ("Air ring slain: Lightning resistance", "2014", "Ring of Air Elemental Command", "air-elemental-slain", "has", "res:Lightning", True),
    ("Air ring slain: fly speed", "2014", "Ring of Air Elemental Command", "air-elemental-slain", "fly", "", 30),
    ("Air ring off: no fly speed", "2014", "Ring of Air Elemental Command", None, "fly", "", 0),
    ("Earth ring off: no Acid resistance", "2014", "Ring of Earth Elemental Command", None, "has", "res:Acid", False),
    ("Earth ring slain: Acid resistance", "2014", "Ring of Earth Elemental Command", "earth-elemental-slain", "has", "res:Acid", True),
    ("Water ring slain: swim speed", "2014", "Ring of Water Elemental Command", "water-elemental-slain", "swim", "", 30),
    ("Water ring off: no swim speed", "2014", "Ring of Water Elemental Command", None, "swim", "", 0),
    ("Zombie Flesh 2014: 16 + Dex", "2014", "Armor of Zombie Flesh", None, "acB", "", 16),
    ("Zombie Flesh 2024: 14 + Dex", "2024", "Armor of Zombie Flesh", None, "acB", "", 14),
    ("Blackrazor 2014: no Blindsight", "2014", "Blackrazor", None, "sense", "Blindsight", False),
    ("Blackrazor 2024: Blindsight", "2024", "Blackrazor", None, "sense", "Blindsight", True),
    ("Axe 2014 not dwarf: no Mason's Tools", "2014", "Axe of the Dwarvish Lords", None, "has", "Mason's Tools", False),
    ("Axe 2014 dwarf: Mason's Tools", "2014", "Axe of the Dwarvish Lords", "axe-dwarf", "has", "Mason's Tools", True),
    ("Axe 2024: Mason's Tools", "2024", "Axe of the Dwarvish Lords", None, "has", "Mason's Tools", True),
    ("Vile Darkness 2014: no Exhaustion immunity", "2014", "Book of Vile Darkness", "book-vile-studied", "has", "imm:Exhaustion \\(condition", False),
    ("Vile Darkness 2024 unstudied: Exhaustion immunity", "2024", "Book of Vile Darkness", "!book-vile-studied", "has", "imm:Exhaustion \\(condition", True),
    ("Lucent Destroyer: Dancing Lights once", "2014", "Lucent Destroyer", None, "spn", "Dancing Lights", 1),
    ("Budding Blossom Rod: Druidcraft once", "2024", "Budding Blossom Rod", None, "spn", "Druidcraft", 1),
    ("Diamond Staff: Light once", "2024", "Diamond Staff", None, "spn", "Light", 1),
    ("Amulet of the Inferno: Fire Bolt once", "2014", "Amulet of the Inferno", None, "spn", "Fire Bolt", 1),
]
JS = """([cases,dump])=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls:'Fighter',sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true,att:true}]:[];return t};
 const ac=C=>C.ac.base+(C.ac.dex==='full'||C.ac.dex==='max2'?2:0)+C.ac.bonus.reduce((s,x)=>s+x.v,0);
 const flat=C=>(C.defenses||[]).map(x=>(/^Resist/.test(x.t)?'res:':/^Immun/.test(x.t)?'imm:':x.t+':')+x.v).join('|')+'|'+JSON.stringify(C);
 const mv=(C,k)=>{const m=new RegExp((k==='fly'?'Fly':'Swim')+' Speed[^(]*\\\\((\\\\d+) ft').exec(C.speedSrc||'');return m?+m[1]:0};
 if(dump){const C=window.__bldSheetFor(mk('2024','Blackrazor'),{});return [JSON.stringify(C).replace(/<[^>]*>/g,'').match(/.{0,80}Blindsight.{0,60}/g)]}
 return cases.map(([lab,rs,item,tg,k,arg,exp])=>{try{const fx={};if(tg){if(tg[0]==='!')fx[tg.slice(1)]=false;else fx[tg]=true}
  const C=window.__bldSheetFor(mk(rs,item),fx);
  if(k==='sense')return (C.senses||[]).some(x=>x.n===arg);if(k==='has')return new RegExp(arg).test(flat(C));if(k==='acT')return ac(C);if(k==='acB')return C.ac.base;if(k==='fly'||k==='swim')return mv(C,k);
  if(k==='spn')return (C.spells||[]).filter(s=>s.n===arg).length;return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    res = pg.evaluate(JS, [[list(c) for c in CASES], bool(os.environ.get("DUMP"))])
    if os.environ.get("DUMP"): print(res[0]); sys.exit(0)
    for c, got in zip(CASES, res):
        ok = got == c[6]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[6])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
