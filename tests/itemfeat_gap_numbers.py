#!/usr/bin/env python3
"""Sheet numbers of item and feat effects that were mech_scan gaps (tests/mech_baseline.json) and now have data (src/data/fx-B60-itemfeatgaps.js,
the Greater Mark of Storm entry in fx-B19, feat resK / resBy). A switch effect gives its number only while the switch is on.  python3 tests/itemfeat_gap_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, item or None, feat or None, extra picks, toggle id or None, check, expected). Fighter 19 (item 'Class|Name' = that class), STR 10 DEX 14, no armor (AC 12 bare).
# check: ac / init / speed = the number with the item or feat, minus the same build without it; acT = total AC; adv / fly / res = text found on the sheet
CASES = []
for rs in ("2024", "2014"):
    CASES += [
        ("Karametra's Devotee on", rs, "Karametra's Devotee", None, None, "b60-karametra", "ac", 1),
        ("Karametra's Devotee off", rs, "Karametra's Devotee", None, None, None, "ac", 0),
        ("Kruphix's Disciple on", rs, "Kruphix's Disciple", None, None, "b60-kruphix", "ac", 2),
        ("Kruphix's Disciple off", rs, "Kruphix's Disciple", None, None, None, "ac", 0),
        ("Mageplate Cap on (Wizard): 15 + Dex", rs, "Wizard|Mageplate Cap", None, None, "b60-mageplate", "acT", 17),
        ("Mageplate Cap off (Wizard)", rs, "Wizard|Mageplate Cap", None, None, None, "acT", 12),
        ("Switch bark on (Druid): AC 17", rs, "Druid|Switch", None, None, "b60-switch-bark", "acT", 17),
        ("Switch bark off (Druid)", rs, "Druid|Switch", None, None, None, "acT", 12),
        ("War Standard on", rs, "War Standard of Battlecries", None, None, "b60-war-standard", "init", 3),
        ("War Standard off", rs, "War Standard of Battlecries", None, None, None, "init", 0),
    ]
CASES += [
    ("Mobile Combatant on", "2024", None, "Mobile Combatant", None, "b60-slippery", "speed", 10),
    ("Mobile Combatant off", "2024", None, "Mobile Combatant", None, None, "speed", 0),
    ("Zhentarim Ruffian on", "2024", None, "Zhentarim Ruffian", None, "b60-family-first", "adv", True),
    ("Zhentarim Ruffian off", "2024", None, "Zhentarim Ruffian", None, None, "adv", False),
    ("Convincing Inquisitor on", "2024", None, "Convincing Inquisitor", None, "b60-zealous-insight", "adv", True),
    ("Convincing Inquisitor off", "2024", None, "Convincing Inquisitor", None, None, "adv", False),
    ("Greater Mark of Storm on: Fly 60", "2024", None, "Greater Mark of Storm", None, "b19-mark-storm", "fly", True),
    ("Greater Mark of Storm off", "2024", None, "Greater Mark of Storm", None, None, "fly", False),
    ("Dragonscarred Fire", "2024", None, "Dragonscarred", {"rs-feat4": ["Fire"]}, None, "res", "Fire"),
    ("Scion of the Outer Planes, Good: Radiant", "2024", None, "Scion of the Outer Planes", {"pl-feat4": ["Good Outer Plane"]}, None, "res", "Radiant"),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,item,feat,ch)=>{const cls=item&&item.indexOf('|')>0?item.split('|')[0]:'Fighter';if(cls!=='Fighter')item=item.split('|')[1];const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true}]:[];
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}},ch||{});return t};
 const ac=C=>C.ac.base+(C.ac.dex==='full'?2:0)+C.ac.bonus.reduce((s,x)=>s+x.v,0),ini=C=>(C.initBonus||[]).reduce((s,x)=>s+x.v,0);
 const txt=C=>JSON.stringify([C.defenses,C.res,C.speed,C.speedSrc]);
 return cases.map(([lab,rs,item,feat,ch,tg,k,exp])=>{try{const fx=tg?{[tg]:true}:{},A=window.__bldSheetFor(mk(rs,item&&item.indexOf('|')>0?item.split('|')[0]+'|':null,null,null),fx),Z=window.__bldSheetFor(mk(rs,item,feat,ch),fx);
  if(k==='ac')return ac(Z)-ac(A);if(k==='acT')return ac(Z);if(k==='init')return ini(Z)-ini(A);if(k==='speed')return Z.speed-A.speed;
  if(k==='adv')return /Advantage on Initiative/.test(txt(Z));if(k==='fly')return /[Ff]ly[^"]{0,20}60/.test(txt(Z));
  if(k==='res')return new RegExp('Resistance[^\\\\]]{0,80}'+exp).test(txt(Z))&&!new RegExp('Resistance[^\\\\]]{0,80}'+exp).test(txt(A))?exp:'missing';return 'bad check'}catch(e){return 'CRASH '+e}})}"""
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
