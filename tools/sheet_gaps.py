#!/usr/bin/env python3
"""sheet_gaps: which clause-gate UNCOVERED sentences are also missing from the real sheet.

The clause gate reads the data tables, so it misses rules the sheet derivation handles in code (saveNotes, skills misc, ability bonuses).
This tool builds each class and subclass at level 20 with Quick Build choices, and keeps an uncovered sentence
only when its feature name appears nowhere in the sheet's mechanical fields (everything except the feature text list and the inventory).
What is left is a real gap candidate, still to be read by a person.

  python3 tools/sheet_gaps.py [BOOK]        BOOK = a clause-gate book tag (default core). Uses the cached tables at tests/out/cg.json
                                            (made on first run, about 75 s).
  python3 tools/sheet_gaps.py item          magic items: a level 10 Fighter wears the item (equipped; a variant name such as "(Plate)" is used
                                            when the plain name is not an item), and the item name must show in the mechanical fields of a level 10 Fighter, Wizard or Cleric.
Read only."""
import json, os, re, subprocess, sys
from collections import defaultdict
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BOOK = sys.argv[1] if len(sys.argv) > 1 else "core"
CACHE = os.path.join(ROOT, "tests", "out", "cg.json")
os.makedirs(os.path.dirname(CACHE), exist_ok=True)
cmd = [sys.executable, "tests/clause_gate.py", "--no-write", "--list", BOOK] + (["--data", CACHE] if os.path.exists(CACHE) else ["--save-data", CACHE])
out = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True).stdout
if BOOK == "item":
    items = defaultdict(list); book = {}
    for line in out.splitlines():
        m = re.match(r"\[item\|([^|]+)\|([^#\]]+?)#\d+\] K=([^|]*)\| ([^|]*)\| (.*)", line)
        if m: items[m.group(2).strip()].append((m.group(3).strip(), m.group(5))); book[m.group(2).strip()] = m.group(1)
    # a 2014 book's item is read under 2014 rules (the edition gate turns it off under 2024), every book on
    ITEM = """([names,r14])=>{window.__ik=window.__ik||window.__bldData().dmgi.map(x=>x[0]);const keys=window.__ik;
      if(!window.__gb){window.__gb={};for(const rs of ['2024','2014'])for(const cls of ['Fighter','Wizard','Cleric']){const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true}}:{sp:'Human',bg:'Soldier'};
        const r=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv:10,arr:[15,14,13,12,10,8],b2:0,b1:0},o));const b=r.b;b.src=Object.assign({},b.src);(window.WX&&WX.src||[]).forEach(x=>b.src[x.id]=true);window.__gb[rs+cls]=b}}
      return names.map(n=>{const k=keys.indexOf(n)>=0?n:keys.find(x=>x.indexOf(n+' (')===0);if(!k)return [n,null,''];let all='';
      for(const cls of ['Fighter','Wizard','Cleric']){const b=structuredClone(window.__gb[(r14[n]?'2014':'2024')+cls]);b.inv=[{n:k,q:1,eq:true}];const t=window.__bldTestB();Object.assign(t,b);delete t.unset;let C;try{C=window.__bldSheetFor(t)}catch(e){return [n,k,'CRASH '+String(e).slice(0,160)]}
      const o=Object.assign({},C);delete o.features;delete o.inv;delete o.equipNote;all+=JSON.stringify(o)}return [n,k,all]})}"""
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(600000)
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
        for _ in range(600):
            if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
            pg.wait_for_timeout(100)
        names = sorted(items); res = []
        r14 = {n: 1 for n in names if str(book.get(n, "")).endswith("14")}
        for i in range(0, len(names), 50): res += pg.evaluate(ITEM, [names[i:i + 50], r14])
        br.close()
    gone = [n for n, k, s in res if k and s and not s.startswith("CRASH") and n not in s and k not in s]
    nokey = [n for n, k, s in res if not k]
    for n, k, s in res:
        if s.startswith("CRASH"): print("CRASH when worn: %s (%s): %s" % (n, k, s[6:]))
    print("item: %d items with uncovered sentences, %d leave no trace on the sheet when worn, %d are not in the item table (DMAP)" % (len(names), len(gone), len(nokey)))
    for n in gone:
        print("== " + n)
        for K, t in items[n]: print("   [%s] %s" % (K, t[:200]))
    sys.exit(0)
if BOOK == "feat":
    ft = defaultdict(list)
    for line in out.splitlines():
        m = re.match(r"\[feat\|([^|]+)\|([^#\]]+?)(?:~\d+)?#\d+\] K=([^|]*)\| ([^|]*)\| (.*)", line)
        if m: ft[m.group(1).strip()].append((m.group(3).strip(), m.group(5)))
    FT = """(names)=>{const all={};(window.WX&&WX.src||[]).forEach(x=>all[x.id]=true);
      if(!window.__fb){window.__fb={};for(const rs of ['2024','2014'])for(const cls of ['Fighter','Wizard']){const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:Object.assign({phb14:true,dmg14:true},all)}:{sp:'Human',bg:'Soldier',src:all};
        window.__fb[rs+cls]=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv:8,arr:[15,14,13,12,10,8],b2:0,b1:0},o)).b}}
      return names.map(n=>{let txt='',took=0;for(const rs of ['2024','2014'])for(const cls of ['Fighter','Wizard']){const b0=structuredClone(window.__fb[rs+cls]);b0.ch=Object.assign({},b0.ch,{feat4:{feat:n}});
        /* the feat's own ability increase (a1): the first ability that makes the choice complete */
        for(const a of ['','STR','DEX','CON','INT','WIS','CHA']){if(a)b0.ch.feat4={feat:n,a1:a};const c=window.__bldChoiceList(b0).find(x=>x.key==='feat4');if(!c||c.done)break}
        const b=window.__bldFillFor(b0)||b0;const t=window.__bldTestB();Object.assign(t,b);delete t.unset;let C;try{C=window.__bldSheetFor(t)}catch(e){txt+='CRASH '+e;continue}
        if(!JSON.stringify(C.features).includes(n))continue;took++;const o=Object.assign({},C);delete o.features;delete o.inv;delete o.equipNote;txt+=JSON.stringify(o)}return [n,took,txt]})}"""
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(900000)
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
        for _ in range(600):
            if pg.evaluate("()=>typeof window.__bldFillFor==='function'"): break
            pg.wait_for_timeout(100)
        names = sorted(ft); res = []
        for i in range(0, len(names), 30): res += pg.evaluate(FT, names[i:i + 30])
        br.close()
    gone = [n for n, took, txt in res if took and n not in txt]
    crash = [n for n, took, txt in res if "CRASH" in txt]
    nott = [n for n, took, txt in res if not took]
    print("feat: %d feats with uncovered sentences, %d leave no trace on the sheet, %d crash, %d could not be taken at level 4" % (len(names), len(gone), len(crash), len(nott)))
    for n in crash: print("CRASH", n)
    for n in gone:
        print("== " + n)
        for K, t in ft[n][:3]: print("   [%s] %s" % (K, t[:200]))
    sys.exit(0)
if BOOK == "species":
    sp = defaultdict(list)
    for line in out.splitlines():
        m = re.match(r"\[species\|([^|]+)\|([^#\]]+?)(?:~\d+)?#\d+\] K=([^|]*)\| ([^|]*)\| (.*)", line)
        if m: sp[m.group(1).strip()].append((m.group(2).strip(), m.group(3).strip(), m.group(5)))
    SP = """(names)=>{const all={};(window.WX&&WX.src||[]).forEach(x=>all[x.id]=true);return names.map(n=>{let txt='';
      for(const rs of ['2024','2014']){const o=rs==='2014'?{bg:'Soldier (2014)',src:Object.assign({phb14:true,dmg14:true},all)}:{bg:'Soldier',src:all};
        for(const lv of [5,20]){let r;try{r=window.__bldFuzz(Object.assign({rs,sp:n,cls:'Fighter',sub:'',lv,arr:[15,14,13,12,10,8],b2:0,b1:0},o))}catch(e){continue}
          if(!r||!r.c||r.b.species!==n)continue;const c=Object.assign({},r.c);delete c.features;delete c.inv;delete c.equipNote;txt+=JSON.stringify(c)}}return [n,txt]})}"""
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(600000)
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
        for _ in range(600):
            if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
            pg.wait_for_timeout(100)
        names = sorted(sp); res = []
        for i in range(0, len(names), 40): res += pg.evaluate(SP, names[i:i + 40])
        br.close()
    gaps = defaultdict(list); nob = []
    for n, txt in res:
        if not txt: nob.append(n); continue
        for trait, K, t in sp[n]:
            if trait not in txt: gaps[n + " | " + trait].append((K, t))
    print("species: %d species with uncovered sentences, %d traits leave no trace on a level 5 or 20 sheet, %d species could not be built" % (len(names), len(gaps), len(nob)))
    if nob: print("not built:", ", ".join(nob[:40]))
    for k in sorted(gaps):
        print("== " + k)
        for K, t in gaps[k][:3]: print("   [%s] %s" % (K, t[:200]))
    sys.exit(0)
rows = []
for line in out.splitlines():
    m = re.match(r"\[(class|sub)\|([^|]+)\|([^#\]]+?)(?:~\d+)?#\d+\] K=([^|]*)\| ([^|]*)\| (.*)", line)
    if m: rows.append(m.groups())
builds = {}
for kind, owner, feat, K, why, text in rows:
    cls, sub = (owner.split("/", 1) + [""])[:2]
    builds[(cls, sub)] = 1
R14 = BOOK.endswith("14")
BASE = {"sp": "Human (2014)", "bg": "Soldier (2014)", "rs": "2014", "src": {"phb14": True, "dmg14": True}} if R14 else {"sp": "Human", "bg": "Soldier", "rs": "2024"}
# Quick Build fills the choices (Expertise, Fighting Style, a resistance type), so a rule that needs a choice is on the sheet
SHEET = """([b])=>{const r=window.__bldFuzz(b);if(!r||!r.c)return "";const o=Object.assign({},r.c);delete o.features;delete o.inv;delete o.equipNote;return JSON.stringify(o)}"""
mech = {}
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    for cls, sub in builds:
        try: mech[(cls, sub)] = pg.evaluate(SHEET, [dict(BASE, cls=cls, sub=sub, lv=20, arr=[15, 14, 13, 12, 10, 8], b2=0, b1=0)])
        except Exception as e: mech[(cls, sub)] = ""
    br.close()
gaps = defaultdict(list)
for kind, owner, feat, K, why, text in rows:
    cls, sub = (owner.split("/", 1) + [""])[:2]
    s = mech.get((cls, sub), "")
    if s and feat.strip() not in s:
        gaps[owner + " | " + feat.strip()].append((K.strip(), text))
n = sum(len(v) for v in gaps.values())
print("%s: %d uncovered class/subclass sentences, %d in %d features have no trace on the level 20 sheet" % (BOOK, len(rows), n, len(gaps)))
for k in sorted(gaps):
    print("== " + k)
    for K, t in gaps[k]: print("   [%s] %s" % (K, t[:220]))
