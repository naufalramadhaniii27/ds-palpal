#!/usr/bin/env python3
"""Review round 3c fixes on the computed sheet: Wretched Curse Hulking HP (2024), Sanguine Vigor HP (2024 Sangromancer, 2014 School of Sangromancy),
Lunar Embodiment free spell gone at Sorcerer 6 (Waxing and Waning), Steel Shepherd Technomancy ability picked.
  python3 tests/review_r3c.py [-v]"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const mk=(cls,sub,lv,ch,rs)=>{const b=window.__bldFuzz({sp:'Human',bg:'Soldier',rs:rs||'2024',src:all,cls,sub,lv,arr:[14,14,14,14,14,14],b2:0,b1:0}).b;
 Object.assign(b.ch,ch||{});const C=window.__bldSheetFor(b,{});window.__sheetApply(C,false);return {C,D:JSON.parse(JSON.stringify(window.__D()))}};
const J=x=>JSON.stringify(x);
const H={wcurse:['Hulking']};
for(const l of [3,20]){const a=mk('Sorcerer','Wretched Bloodline Sorcery',l,{wcurse:['Nocturnal']}),b=mk('Sorcerer','Wretched Bloodline Sorcery',l,H);eq('Hulking 2024 HP at '+l,l-2,b.D.hpmax-a.D.hpmax)}
for(const l of [5,6,20]){const a=mk('Wizard','School of Evocation',l),b=mk('Wizard','Sangromancer',l);eq('Sanguine Vigor 2024 HP at '+l,l<6?0:l,b.D.hpmax-a.D.hpmax)}
for(const l of [5,6,20]){const a=mk('Wizard','School of Evocation',l,{},'2014'),b=mk('Wizard','School of Sangromancy',l,{},'2014');eq('Sanguine Vigor 2014 HP at '+l,l<6?0:6+l,b.D.hpmax-a.D.hpmax)}
eq('Lunar Embodiment free spell at 3',true,J(mk('Sorcerer','Lunar Sorcery',3,{},'2014').C).includes('Lunar Embodiment free spell'));
{const s=J(mk('Sorcerer','Lunar Sorcery',6,{},'2014').C);eq('Lunar Embodiment free spell gone at 6',false,/"n":"Lunar Embodiment free spell"[^}]*"max":[1-9]/.test(s));eq('Waxing and Waning at 6',true,s.includes('Waxing and Waning: free spells'))}
for(const a of ['INT','CHA']){const s=J(mk('Warden','Steel Shepherd',3,{'gx-ab-sub-Steel Shepherd':[a]}).C);eq('Steel Shepherd Technomancy '+a,true,s.includes('Machine Code (Technomancy, '+a+')'));eq('Steel Shepherd not WIS with '+a,false,s.includes('Machine Code (Technomancy, WIS)'))}
return o}"""

bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'")
    rows = pg.evaluate(JS); br.close()
for lab, want, got in rows:
    ok = want == got; bad += not ok
    if not ok or "-v" in sys.argv: print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("review r3c: %d checks, %d failed" % (len(rows), bad))
sys.exit(1 if bad else 0)
