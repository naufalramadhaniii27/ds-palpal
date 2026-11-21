#!/usr/bin/env python3
"""Sheet checks for the review g02 fixes (fx-B19, B20, B21, B23, B24): edition splits, level gates, switches and darkvision rules.
python3 tests/review_g02.py"""
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
# (label, rules, class, subclass, level, item, feat, species, toggle id or None, check, expected)
# check: fly / dark = number on the sheet; sense:<name> = range or 0; imm / vul / condImm = name present (True/False);
#        dice:<d> = attack rows carry that rider die; save = WIS save proficient; res:<type> = resistance present
CASES = [
    ("Plaguebringer: Poison immune without a switch", "2014", "Paladin", "Oath of Pestilence (2014)", 20, None, None, None, None, "imm:Poison", True),
    ("Plaguebringer: Poisoned immune without a switch", "2014", "Paladin", "Oath of Pestilence (2014)", 20, None, None, None, None, "condImm:Poisoned", True),
    ("Plaguebringer: Necrotic resistance still there", "2014", "Paladin", "Oath of Pestilence (2014)", 20, None, None, None, None, "res:Necrotic", True),
    ("Sleet: Fire vulnerability", "2024", "Sorcerer", "Boreal Bloodline", 14, None, None, None, "b20-sleet", "vul:Fire", True),
    ("Sleet: no magical BPS resistance", "2024", "Sorcerer", "Boreal Bloodline", 14, None, None, None, "b20-sleet", "res:Slashing", False),
    ("Shadow Pact: +30 over Darkvision 60", "2024", "Fighter", "", 19, None, "Shadow Pact", "Elf", None, "dark", 90),
    ("Shadow Pact: 60 without Darkvision", "2024", "Fighter", "", 19, None, "Shadow Pact", "Human", None, "dark", 60),
    ("Metamorphosis Darkvision off", "2024", "Fighter", "", 19, None, "Changeling Metamorphosis", "Human", None, "dark", 0),
    ("Metamorphosis Darkvision on", "2024", "Fighter", "", 19, None, "Changeling Metamorphosis", "Human", "b21-metamorph-dark", "dark", 60),
    ("Infernal Bargain off", "2024", "Investigator", "Infernum", 6, None, None, None, None, "sense:Blindsight", 0),
    ("Infernal Bargain on", "2024", "Investigator", "Infernum", 6, None, None, None, "b21-infernal-blindsight", "sense:Blindsight", 30),
    ("Polar Strikes 1d4 at 10", "2024", "Ranger", "Winter Walker", 10, None, None, None, None, "dice:1d6", False),
    ("Polar Strikes 1d6 at 11", "2024", "Ranger", "Winter Walker", 11, None, None, None, None, "dice:1d6", True),
    ("Samurai 2014 WIS save (base fx)", "2014", "Fighter", "Samurai", 7, None, None, None, None, "save", True),
    ("Gloom Stalker 2014 WIS save (base fx)", "2014", "Ranger", "Gloom Stalker (2014)", 7, None, None, None, None, "save", True),
    ("Winged Boots 2024: Fly 30", "2024", "Fighter", "", 19, "Winged Boots", None, "Human", "b19-winged-boots", "fly", 30),
    ("Winged Boots 2014: Fly = Speed (Monk 19, Speed 60)", "2014", "Monk", "", 19, "Winged Boots", None, None, "b19-winged-boots", "fly", 60),
    ("Ring of Spacewalking 2024: Fly = Speed", "2024", "Fighter", "", 19, "Ring of Spacewalking", None, "Human", "b19-spacering", "fly", 30),
    ("Ring of Spacewalking 2014: Fly 15", "2014", "Fighter", "", 19, "Ring of Spacewalking", None, "Human (2014)", "b19-spacering", "fly", 15),
    ("Draconic Flight below level 5", "2024", "Fighter", "", 4, None, None, "Dracthyr", "b19-draconic-flight", "fly", 0),
    ("Draconic Flight at level 5", "2024", "Fighter", "", 5, None, None, "Dracthyr", "b19-draconic-flight", "fly", 30),
]
JS = r"""(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,lv,item,feat,sp)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub:'',lv,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=item?[{n:item,q:1,eq:true,att:true}]:[];if(sp)t.species=sp;if(sub)t.sub=sub;
  if(feat)t.ch=Object.assign({},t.ch,{feat4:{feat,a1:'STR',a2:'CON'}});return t};
 const J=x=>JSON.stringify(x||'');
 return cases.map(([lab,rs,cls,sub,lv,item,feat,sp,tg,k,exp])=>{try{const C=window.__bldSheetFor(mk(rs,cls,sub,lv,item,feat,sp),tg?{[tg]:true}:{});
  const [kk,arg]=k.split(':');if(window.__g02dump)return JSON.stringify({sp:C.speeds,dv:C.darkvision,se:C.senses,df:C.defenses,res:C.res,sv:C.saves,ss:C.speedSrc,spd:C.speed,at:(C.attacks||[]).map(a=>JSON.stringify(a)).join('|').slice(0,600)});
  if(kk==='fly'){const m=/[Ff]ly[^0-9"]{0,30}(\d+)/.exec(J(C.speedSrc));return m?+m[1]:0}
  if(kk==='dark')return +(C.darkvision||C.dark||0);
  if(kk==='sense'){const s=(C.senses||[]).filter(y=>y.n===arg)[0];return s?s.v:0}
  const D=(t,v)=>(C.defenses||[]).some(x=>x.t===t&&x.v===v)||(t==='Resistance'&&J(C.res).indexOf('"'+v+'"')>=0);
  if(kk==='imm')return D('Immunity',arg);
  if(kk==='vul')return D('Vulnerability',arg);
  if(kk==='condImm')return D('Immunity',arg+' (condition)');
  if(kk==='res')return D('Resistance',arg);
  if(kk==='dice')return J(C.defenses).indexOf('Frigid Explorer, '+arg)>=0;
  if(kk==='save')return !!(C.saves||{}).WIS;
  if(kk==='keys')return Object.keys(C).join(',');
  return 'bad check'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(400000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    if '--dump' in sys.argv: pg.evaluate('()=>{window.__g02dump=1}')
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[10]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[10])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
