#!/usr/bin/env python3
"""Short Rest and Long Rest on the live sheet (window.__sheetRest after __sheetApply), 2024 and 2014 rules, one browser session.
  python3 tests/rest_numbers.py [-v]
Checks the reset of class counters whose reset changed between editions (Channel Divinity, Bardic Inspiration, Wild Shape,
Second Wind, Rage, Ki/Focus, Pact slots, Arcane Recovery, Sorcery Points, Lay on Hands), then spends everything and rests:
Short Rest refills short rows, one use of short1 rows, srN uses (2014 Sorcerous Restoration), leaves HP, Hit Dice, Exhaustion;
Long Rest refills every row, Hit Dice all back (2024) or half the total, at least 1 (2014), HP to max, Temporary HP 0, Exhaustion -1.
Exit 1 on any difference."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const R={'2014':['Human (2014)','Soldier (2014)'],'2024':['Human','Soldier']};
const mk=(rs,cls,lv)=>{const b=window.__bldFuzz({sp:R[rs][0],bg:R[rs][1],rs,src:all,cls,sub:'',lv,arr:[15,14,14,12,14,15],b2:0,b1:0}).b;if(rs==='2024')b.ch.spfeat='Crafter';
 const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);window.__sheetApply(C,false);return window.__sheetRes()};
/* expected reset by edition: [name, class, reset below 5, reset from 5] */
const EXP={'2024':[['Channel Divinity','Cleric','short1','short1'],['Bardic Inspiration','Bard','long','short'],['Wild Shape','Druid','short1','short1'],['Second Wind','Fighter','short1','short1'],
  ['Rage','Barbarian','short1','short1'],['Focus Points','Monk','short','short'],['Pact Slots','Warlock','short','short'],['Arcane Recovery','Wizard','long','long'],['Sorcery Points','Sorcerer','long','long'],['Lay on Hands','Paladin','long','long']],
 '2014':[['Channel Divinity','Cleric','short','short'],['Bardic Inspiration','Bard','long','short'],['Wild Shape','Druid','short','short'],['Second Wind','Fighter','short','short'],
  ['Rage','Barbarian','long','long'],['Ki Points','Monk','short','short'],['Pact Slots','Warlock','short','short'],['Arcane Recovery','Wizard','long','long'],['Sorcery Points','Sorcerer','long','long'],['Lay on Hands','Paladin','long','long']]};
for(const rs of ['2024','2014']){
 for(const [n,cls,r4,r5] of EXP[rs])for(const lv of [3,5]){const r=mk(rs,cls,lv).find(x=>x.n.indexOf(n)===0);eq(rs+' '+cls+lv+' '+n+' reset',lv<5?r4:r5,r&&r.reset)}
 eq(rs+' Sorcerer20 Sorcerous Restoration on Short Rest',rs==='2014'?4:0,(mk(rs,'Sorcerer',20).find(x=>x.n==='Sorcery Points')||{}).srN||0);
 for(const [cls,lv] of [['Fighter',5],['Cleric',11],['Druid',5],['Barbarian',5],['Bard',3],['Bard',5],['Warlock',5],['Monk',5],['Paladin',5],['Sorcerer',20],['Wizard',5],['Fighter',1]])for(const kind of ['short','long']){
  const res=mk(rs,cls,lv),S=window.__sheetState().S,hpm=window.__D().hpmax,tag=rs+' '+cls+lv+' '+kind+' ';
  S.used={};res.forEach(r=>S.used[r.k]=r.max);S.hp=1;S.tmp=5;S.exh=2;
  window.__sheetRest(kind);const u=window.__sheetState().S.used,hdT=res.filter(r=>/^hd/.test(r.k)).reduce((t,r)=>t+r.max,0);
  res.forEach(r=>{let w=r.max;
   if(kind==='short'){if(r.reset==='short')w=0;else if(r.reset==='short1')w=r.max-1;else if(r.srN)w=r.max-r.srN}
   else if(/^hd/.test(r.k))w=rs==='2014'?Math.max(0,r.max-Math.max(1,Math.floor(hdT/2))):0;
   else if(r.reset!=='none')w=0;
   eq(tag+r.n,w,+(u[r.k]||0))});
  const S2=window.__sheetState().S;eq(tag+'hp',kind==='long'?hpm:1,S2.hp);eq(tag+'temp hp',kind==='long'?0:5,S2.tmp);eq(tag+'exhaustion',kind==='long'?1:2,S2.exh)}
}
return o}"""

bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetRest==='function'")
    rows = pg.evaluate(JS); br.close()
for lab, want, got in rows:
    ok = want == got; bad += not ok
    if not ok or "-v" in sys.argv: print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("rest_numbers: %d checked, %d failed" % (len(rows), bad))
sys.exit(1 if bad else 0)
