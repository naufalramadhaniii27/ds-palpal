#!/usr/bin/env python3
"""Subclass gap numbers (src/data/fx-B60-subgaps.js) on the computed sheet (window.__D after __sheetApply, and the sheet C).
  python3 tests/sub_gap_numbers.py [-v]
Each case builds the subclass with and without its switch (S.fxT) or pick (ch key gx-<k>-sub-<Sub>) and checks the number the feature
text gives: AC, Speed, Fly Speed, Initiative Advantage, Resistance, save and skill proficiency, weapon training. Exit 1 on any difference."""
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
// Blast Shield (Mad Bomber 10): Resistance to the chosen type
for(const t of ['Fire','Thunder']){const r=mk('Alchemist','Mad Bomber',10,{'gx-blast-sub-Mad Bomber':t});eq('Blast Shield '+t,true,defs(r.C,'Resistance',new RegExp(t)))}
// AC switches
{const a=mk('Barbarian','Path of Wild Magic',3),b=mk('Barbarian','Path of Wild Magic',3,{},{'b60-wild-lights':true});eq('Wild Surge Protective Lights AC +1',a.D.ac+1,b.D.ac)}
{const a=mk('Sorcerer','Wild Magic Sorcery',3),b=mk('Sorcerer','Wild Magic Sorcery',3,{},{'b60-surge-shield':true});eq('Wild Magic Surge 49-52 AC +2',a.D.ac+2,b.D.ac)}
// Initiative Advantage switches
for(const [c,s,l,id] of [['Barbarian','Path of the Drifter',3,'b60-lone-wolf'],['Captain','Rōnin',6,'b60-lone-wolf'],['Vagabond','Rōnin',6,'b60-lone-wolf'],['Wizard','Illuminator',3,'b60-omen'],['Wizard','School of Illumination',3,'b60-omen']]){
 const a=mk(c,s,l),b=mk(c,s,l,{},{[id]:true});eq(s+' Initiative Advantage off',false,iadv(a.C));eq(s+' Initiative Advantage on',true,iadv(b.C))}
// Fly Speed switches
{const b=mk('Bard','College of Birdsong',3,{},{'b60-birdsong':true});eq('Birdsong Fly = Speed',b.D.speed,fly(b.C))}
{const a=mk('Investigator','Medium',3),b=mk('Investigator','Medium',3,{},{'b60-lucent-mirror':true});eq('Lucent Mirror Fly off',0,fly(a.C));eq('Lucent Mirror Fly 10',10,fly(b.C))}
// Speed switches
{const a=mk('Monk','Way of the Drunken Master',3),b=mk('Monk','Way of the Drunken Master',3,{},{'b60-drunken':true});eq('Drunken Technique Speed +10',a.D.speed+10,b.D.speed)}
{const a=mk('Wizard','Somnomancer',3),b=mk('Wizard','Somnomancer',3,{},{'b60-somnambulist':true});eq('Somnambulist Speed halved',Math.floor(a.D.speed/2),b.D.speed)}
// Ethereal Moonwalk (14): Resistance to all damage while Moonwalk is on
{const a=mk('Dancer','Moonwalker',14),b=mk('Dancer','Moonwalker',14,{},{'b19-moonwalk':true});eq('Ethereal Moonwalk off',false,defs(a.C,'Resistance',/Psychic/));eq('Ethereal Moonwalk Psychic resistance',true,defs(b.C,'Resistance',/Psychic/))}
// Warding Essence (6): one damage type and one condition
{const r=mk('Healer','Vow of the Protector',6,{'gx-ward-sub-Vow of the Protector':['Fire','Frightened']});eq('Warding Essence Fire',true,defs(r.C,'Resistance',/Fire/));eq('Warding Essence Frightened',true,defs(r.C,'Note',/Advantage on saves[^.]*Frightened/));eq('Warding Essence no Cold',false,defs(r.C,'Resistance',/Cold/))}
// proficiency and Expertise in a chosen skill
{const r=mk('Investigator','Conspiracy Theorist',10,{'gx-dots-sub-Conspiracy Theorist':'Nature'});eq('Connect the Dots Nature Expertise',2,sk(r.C,'Nature'))}
{const r=mk('Bard','College of the Mad God',3,{'gx-outer-sub-College of the Mad God':'Nature'});eq('Outer Knowledge Nature Expertise',2,sk(r.C,'Nature'))}
{const r=mk('Warden','Diabolist',6,{'gx-soul-sub-Diabolist':'Skill','gx-soulsk-sub-Diabolist':'Nature'});eq('Soul Broker skill Nature Expertise',2,sk(r.C,'Nature'))}
{const a=mk('Warden','Diabolist',6),b=mk('Warden','Diabolist',6,{'gx-soul-sub-Diabolist':'Speed'});eq('Soul Broker Speed +15',a.D.speed+15,b.D.speed)}
// Promotion Martial Training: Martial weapons
{const a=mk('Warmage','House of Pawns',3),b=mk('Warmage','House of Pawns',3,{'gx-promo-sub-House of Pawns':'Martial Training'});eq('Promotion Martial off',false,/Martial/.test(JSON.stringify(a.C.profs)));eq('Promotion Martial on',true,/Martial/.test(JSON.stringify(b.C.profs)))}
// Transmuter's Stone: held = CON save proficiency; Speed benefit +10 while held
{const a=mk('Wizard','Transmuter',3,{'gx-tstone-sub-Transmuter':'Speed'}),b=mk('Wizard','Transmuter',3,{'gx-tstone-sub-Transmuter':'Speed'},{'b60-tstone':true});
 eq("Transmuter's Stone not held: no CON save",false,!!(a.C.saves||{}).CON);eq("Transmuter's Stone held: CON save",true,!!(b.C.saves||{}).CON);eq("Transmuter's Stone Speed +10",a.D.speed+10,b.D.speed)}
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
print("sub gap numbers: %d checks, %d failed" % (len(rows), bad))
sys.exit(1 if bad else 0)
