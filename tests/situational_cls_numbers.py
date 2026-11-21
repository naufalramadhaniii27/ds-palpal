#!/usr/bin/env python3
"""Situational class and subclass numbers (src/data/fx-B61-situational-cls.js) on the computed sheet (window.__D after __sheetApply, and the sheet C).
  python3 tests/situational_cls_numbers.py [-v]
Each case builds the class or subclass with and without its switch (S.fxT) or pick (ch key gx-<k>-<kind>-<owner>) and checks the number the feature
text gives: AC, Speed, Fly/Climb/Swim Speed, Initiative Advantage, Resistance, save and skill proficiency, HP. Exit 1 on any difference."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const mk=(cls,sub,lv,ch,tg)=>{const b=window.__bldFuzz({sp:'Human',bg:'Soldier',rs:'2024',src:all,cls,sub,lv,arr:[14,14,14,14,14,14],b2:0,b1:0}).b;
 Object.assign(b.ch,ch||{});const C=window.__bldSheetFor(b,tg||{});window.__sheetApply(C,false);return {C,D:JSON.parse(JSON.stringify(window.__D()))}};
const defs=(C,t,re)=>(C.defenses||[]).some(d=>d.t===t&&re.test(d.v));
const fly=C=>{const m=/Fly[^0-9]{0,40}(\d+)/i.exec(JSON.stringify(C.speedSrc||'')+' '+JSON.stringify(C.speed));return m?+m[1]:0};
const sk=(C,n)=>((C.skills||[]).find(s=>s.n===n)||{}).p||0;
const iadv=C=>(C.defenses||[]).some(d=>/Initiative/i.test(d.v));
const res=(C,t)=>defs(C,'Resistance',new RegExp(t));
const adv=(C,re)=>(C.defenses||[]).some(d=>re.test(d.v));
const mv=(C,k)=>{const m=new RegExp(k+'[^0-9]{0,40}(\\d+)','i').exec(JSON.stringify(C.speedSrc||'')+' '+JSON.stringify(C.speed)+' '+JSON.stringify(C.moves||''));return m?+m[1]:0};
const sv=C=>Object.keys(C.saves||{}).filter(k=>(C.saves||{})[k]).length;
const OF=(c,s,l,id,f,want0,want1)=>{const a=mk(c,s,l),b=mk(c,s,l,{},{[id]:true});eq((s||c)+' '+id+' off',want0(a),f(a));eq((s||c)+' '+id+' on',want1(a),f(b))};
// Shared Resilience: all six saves while the Eidolon is within 30 ft
{const a=mk('Summoner','',15),b=mk('Summoner','',15,{},{'b61-eidolon-30':true});eq('Shared Resilience off <6 saves',true,sv(a.C)<6);eq('Shared Resilience on 6 saves',6,sv(b.C))}
// Craftsman: Armor Enchantment Resistance pick, Winged switch, Customize Armor picks
{const r=mk('Craftsman','',13,{'gx-armench-cls-Craftsman':'Fire'});eq('Armor Enchantment Fire',true,res(r.C,'Fire'));eq('Armor Enchantment no Cold',false,res(r.C,'Cold'))}
OF('Craftsman','',13,'b61-winged',x=>mv(x.C,'Fly'),()=>0,a=>a.D.speed);
{const r=mk('Craftsman','',6,{'gx-custarm-cls-Craftsman':'Climbing'});eq('Customize Armor Climb = Speed',r.D.speed,mv(r.C,'Climb'))}
{const r=mk('Craftsman','',6,{'gx-custarm-cls-Craftsman':'Diving'});eq('Customize Armor Swim = Speed',r.D.speed,mv(r.C,'Swim'))}
// raging Resistance
OF('Barbarian','Path of the Elements',10,'rage',x=>res(x.C,'Lightning'),()=>false,()=>true);
OF('Barbarian','Path of the Dreadnought (2014)',3,'b61-variant-res',x=>res(x.C,'Radiant'),()=>false,()=>true);
OF('Barbarian','Path of the Wrecker (2014)',3,'b61-variant-res',x=>res(x.C,'Necrotic'),()=>false,()=>true);
OF('Barbarian','Path of the Dragon',10,'b61-dragon-hide',x=>x.D.ac,a=>a.D.ac,a=>a.D.ac+2);
OF('Barbarian','Path of the Dragon',10,'b61-dragon-wings',x=>mv(x.C,'Fly'),()=>0,()=>30);
// Fly Speed switches
for(const [c,s,l,id,f] of [['Druid','Circle of the Wyrm',6,'b61-wyrm'],['Fighter','Mage Hand Magus',15,'b61-handglide'],['Monk','Way of the Dragon',6,'b61-take-flight'],['Paladin','Oath of the Sepulcher',7,'b61-zero-g'],['Cleric','Wind Domain',3,'b61-grasp-wind'],['Sorcerer','Emotion Lord',6,'b61-bliss']])
 OF(c,s,l,id,x=>mv(x.C,'Fly'),()=>0,a=>a.D.speed);
OF('Psion','Psykinetic',6,'b61-trance',x=>mv(x.C,'Fly'),()=>0,()=>20);
// Initiative Advantage
OF('Fighter','Dungeoneer',3,'b61-kick-door',x=>iadv(x.C),()=>false,()=>true);
for(const [c,s,l] of [['Fighter','Pugilist (ToH)',18],['Paladin','Oath of the Guardian',7],['Warlock','The Parasite',6]])eq(s+' Initiative Advantage',true,iadv(mk(c,s,l).C));
eq('Symbiotic Sentinel Charmed saves',true,adv(mk('Warlock','The Parasite',6).C,/Advantage on saves against being Charmed/));
// Speed and AC switches
OF('Monk','Warrior of Mystic Brews',3,'b61-mystic-drunken',x=>x.D.speed,a=>a.D.speed,a=>a.D.speed+10);
OF('Fighter','Timeblade',10,'b61-chronal-shield',x=>x.D.ac,a=>a.D.ac,a=>a.D.ac+4);
OF('Rogue','Temporal Trickster',13,'b61-time-dilation',x=>x.D.ac,a=>a.D.ac,a=>a.D.ac+2);
OF('Rogue','Temporal Trickster',13,'b61-time-dilation',x=>JSON.stringify(x.C.saveBonus||[]).includes('"ab":"DEX"'),()=>false,()=>true);
OF('Psion','Metamorph',6,'b61-flesh-weaver',x=>x.D.ac,a=>a.D.ac,a=>a.D.ac+2);
OF('Psion','Metamorph',10,'b61-flexibility',x=>x.D.ac,a=>a.D.ac,a=>a.D.ac+2);
{const k={'gx-stony-sub-Metamorph':'Thunder'},a=mk('Psion','Metamorph',10,k),b=mk('Psion','Metamorph',10,k,{'b61-stony':true});eq('Stony Epidermis off',false,res(a.C,'Thunder'));eq('Stony Epidermis Thunder',true,res(b.C,'Thunder'));eq('Stony Epidermis Concentration',true,adv(b.C,/Concentration/))}
OF('Psion','Telepath',6,'b61-bulwark-mind',x=>res(x.C,'Psychic'),()=>false,()=>true);
OF('Monk','Way of the Still Waters',11,'b61-still-calm',x=>res(x.C,'Fire'),()=>false,()=>true);
OF('Monk','Way of the Still Waters',11,'b61-still-turb',x=>res(x.C,'Cold'),()=>false,()=>true);
// always on
eq('Plague Doctor Medicine proficiency',1,sk(mk('Wizard','Plague Doctor (2014)',3).C,'Medicine'));
eq('Breathe It In Poisoned saves',true,adv(mk('Wizard','Plague Doctor (2014)',10).C,/Advantage on saves against being Poisoned/));
eq('Plaguetouched Bulwark',true,adv(mk('Paladin','Oath of the Plaguetouched',15).C,/undead effects/));
// picks
{const a=mk('Wizard','Familiar Master (2014)',6),b=mk('Wizard','Familiar Master (2014)',6,{"gx-servgift-sub-Familiar Master (2014)":'Lizard'});eq("Servitor's Gift none",false,res(a.C,'Poison'));eq("Servitor's Gift Lizard Poison",true,res(b.C,'Poison'))}
{const a=mk('Wizard','Familiar Master (2014)',14),b=mk('Wizard','Familiar Master (2014)',14,{"gx-servgreat-sub-Familiar Master (2014)":'Construct'});eq("Servitor's Greater Gift Construct AC +1",a.D.ac+1,b.D.ac)}
{const a=mk('Sorcerer','Wretched Bloodline',3),b=mk('Sorcerer','Wretched Bloodline',3,{'gx-wcurse-sub-Wretched Bloodline':'Hulking'});eq('Wretched Curse Hulking HP +4 (1 plus 1 per level)',a.D.hpmax+4,b.D.hpmax)}
{const r=mk('Sorcerer','Wretched Bloodline',3,{'gx-wcurse-sub-Wretched Bloodline':'Plaguebearer'});eq('Wretched Curse Plaguebearer Necrotic',true,res(r.C,'Necrotic'))}
{const r=mk('Ranger','Snake Speaker',3,{'gx-scaly-sub-Snake Speaker':'Serpentine Movement'});eq('Scaly Transition Climb 30',30,mv(r.C,'Climb'))}
{const r=mk('Warlock','Ancient Dragons',3,{'gx-wyrmbless-sub-Ancient Dragons':'Aquatic Affinity'});eq('Wyrmling Blessing Swim = Speed',r.D.speed,mv(r.C,'Swim'))}
{const a=mk('Warlock','Animal Lords',10),b=mk('Warlock','Animal Lords',10,{'gx-primal-sub-Animal Lords':'Swift'}),c=mk('Warlock','Animal Lords',10,{'gx-primal-sub-Animal Lords':'Thick Hide'});eq('Primal Mastery Swift +10',a.D.speed+10,b.D.speed);eq('Primal Mastery Thick Hide +1 AC',a.D.ac+1,c.D.ac)}
{const a=mk('Sorcerer','Wastelander',3),b=mk('Sorcerer','Wastelander',3,{'gx-alien-sub-Wastelander':'Digitigrade Legs'});eq('Alien Alteration Digitigrade +10',a.D.speed+10,b.D.speed)}
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
print("situational class numbers: %d checks, %d failed" % (len(rows), bad))
sys.exit(1 if bad else 0)
