#!/usr/bin/env python3
"""Core numbers on the computed sheet (window.__D after __sheetApply), 2024 and 2014 rules, one browser session.
  python3 tests/core_numbers.py
Max HP (every class at levels 1, 5, 20 with Con 8, 14, 18; fixed average per level; multiclass dice), unarmored AC
(Unarmored Defense, Draconic Resilience; two Unarmored Defenses never stack, main class by default, the other by choice), armor Dex caps, heavy armor Strength speed penalty and Stealth
disadvantage, saving throws and armor/weapon proficiencies for a multiclass, Initiative, Passive Perception, Proficiency
Bonus by total level. Exit 1 on any difference."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const HD={Barbarian:12,Fighter:10,Paladin:10,Ranger:10,Bard:8,Cleric:8,Druid:8,Monk:8,Rogue:8,Warlock:8,Artificer:8,Sorcerer:6,Wizard:6};
const R={'2014':['Human (2014)','Soldier (2014)'],'2024':['Human','Soldier']};
const mk=(rs,cls,lv,arr,sub)=>{const b=window.__bldFuzz({sp:R[rs][0],bg:R[rs][1],rs,src:all,cls,sub:sub||'',lv,arr,b2:0,b1:0}).b;if(rs==='2024')b.ch.spfeat='Crafter';return b};
const calc=b=>{const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);window.__sheetApply(C,false);return {C,D:JSON.parse(JSON.stringify(window.__D()))}};
const sum=a=>(a||[]).reduce((x,y)=>x+y.v,0),avg=d=>d/2+1;
const strip=b=>{b.inv.forEach(x=>{if(/Mail|Shield|Armor|Plate|Leather|Hide|Breastplate|Splint/.test(x.n))x.eq=false})};
const wear=(b,...n)=>{strip(b);n.forEach(x=>b.inv.push({n:x,q:1,eq:true}))};
for(const rs of ['2024','2014']){
 /* Max HP */
 for(const cls in HD){if(rs==='2014'&&cls==='Artificer')continue;for(const lv of [1,5,20])for(const con of [8,14,18]){
  const {C,D}=calc(mk(rs,cls,lv,[15,14,con,12,10,8])),m=D.mod.CON,d=HD[cls];
  let w=Math.max(1,d+m);for(let l=2;l<=lv;l++)w+=Math.max(1,avg(d)+m);w+=sum(C.hpBonus);
  eq(rs+' HP '+cls+' L'+lv+' Con'+con,w,D.hpmax);
  eq(rs+' PB '+cls+' L'+lv,2+Math.floor((lv-1)/4),D.pb)}}
 /* multiclass HP, PB, saves, proficiencies: Wizard main + one level of another class */
 const MCA=rs==='2024'?{Barbarian:'Shields',Bard:'Light',Cleric:'Light, Medium, Shields',Druid:'Light, Shields',Fighter:'Light, Medium, Shields',Monk:'None',Paladin:'Light, Medium, Shields',Ranger:'Light, Medium, Shields',Rogue:'Light',Sorcerer:'None',Warlock:'Light',Wizard:''}
  :{Barbarian:'Shields',Bard:'Light',Cleric:'Light, Medium, Shields',Druid:'Light, Medium, Shields',Fighter:'Light, Medium, Shields',Monk:'None',Paladin:'Light, Medium, Shields',Ranger:'Light, Medium, Shields',Rogue:'Light',Sorcerer:'None',Warlock:'Light',Wizard:''};
 const MCW=rs==='2024'?['Barbarian','Fighter','Paladin','Ranger']:['Barbarian','Fighter','Paladin','Ranger'];
 for(const x in MCA){if(x==='Wizard')continue;const b=mk(rs,'Wizard',4,[10,14,14,13,13,13]);b.mc=[{cls:x,sub:'',lv:1}];
  const {C,D}=calc(b),m=D.mod.CON;
  eq(rs+' MC Wizard4/'+x+'1 HP',6+3*4+avg(HD[x])+5*m+sum(C.hpBonus),D.hpmax);
  eq(rs+' MC Wizard4/'+x+'1 PB',3,D.pb);
  eq(rs+' MC Wizard4/'+x+'1 saves','INT,WIS',Object.keys(C.saves||{}).sort().join(','));
  eq(rs+' MC Wizard4/'+x+'1 armor',MCA[x],(C.profs||{}).armor||'');
  eq(rs+' MC Wizard4/'+x+'1 martial',MCW.includes(x),/Martial/.test((C.profs||{}).weapons||''))}
 {const b=mk(rs,'Fighter',5,[15,14,14,12,10,8]);b.mc=[{cls:'Wizard',sub:'',lv:3},{cls:'Rogue',sub:'',lv:1}];const {C,D}=calc(b);
  eq(rs+' MC Fighter5/Wizard3/Rogue1 HP',10+4*6+3*4+5+9*D.mod.CON+sum(C.hpBonus),D.hpmax);eq(rs+' MC Fighter5/Wizard3/Rogue1 PB',4,D.pb);
  eq(rs+' MC Fighter5/Wizard3/Rogue1 saves','CON,STR',Object.keys(C.saves||{}).sort().join(','))}
 {const b=mk(rs,'Wizard',12,[10,14,14,13,13,13]);b.mc=[{cls:'Cleric',sub:'',lv:1}];eq(rs+' MC PB at total 13',5,calc(b).D.pb)}
 /* AC */
 const ac=(cls,arr,sub,f,lv)=>{const b=mk(rs,cls,lv||3,arr,sub);strip(b);if(f)f(b);return calc(b)};
 const md=(D,k)=>D.mod[k];
 {const {D}=ac('Wizard',[10,16,13,14,12,8]);eq(rs+' AC unarmored',10+md(D,'DEX'),D.ac);eq(rs+' Init',md(D,'DEX'),D.init)}
 {const {D}=ac('Barbarian',[15,14,16,8,12,8]);eq(rs+' AC Barbarian Unarmored Defense',10+md(D,'DEX')+md(D,'CON'),D.ac)}
 {const {D}=ac('Barbarian',[15,14,16,8,12,8],'',b=>b.inv.push({n:'Shield',q:1,eq:true}));eq(rs+' AC Barbarian UD + shield',12+md(D,'DEX')+md(D,'CON'),D.ac)}
 {const {D}=ac('Monk',[10,16,13,8,16,8],'',null,3);eq(rs+' AC Monk Unarmored Defense',10+md(D,'DEX')+md(D,'WIS'),D.ac)}
 {const {D}=ac('Monk',[10,16,13,8,16,8],'',b=>b.inv.push({n:'Shield',q:1,eq:true}));eq(rs+' AC Monk with shield loses UD',12+md(D,'DEX'),D.ac)}
 {const sub=rs==='2024'?'Draconic Sorcery':'Draconic Bloodline';const {D}=ac('Sorcerer',[8,14,13,10,10,16],sub);eq(rs+' AC Draconic Resilience',13+md(D,'DEX'),D.ac)}
 {const b=mk(rs,'Barbarian',3,[15,16,12,8,16,8]);strip(b);b.mc=[{cls:'Monk',sub:'',lv:1}];const {D}=calc(b);
  eq(rs+' AC Barbarian/Monk automatic = main class',10+md(D,'DEX')+md(D,'CON'),D.ac);/* design (golden mc_g1): one Unarmored Defense applies, the player picks */
  b.acMode='uax';eq(rs+' AC Barbarian/Monk pick Monk',10+md(D,'DEX')+md(D,'WIS'),calc(b).D.ac)}
 {const b=mk(rs,'Barbarian',3,[15,16,16,8,12,8]);strip(b);b.mc=[{cls:'Monk',sub:'',lv:1}];const {D}=calc(b);
  eq(rs+' AC Barbarian/Monk no stacking',10+md(D,'DEX')+md(D,'CON'),D.ac)}
 /* armor */
 const F=(arr,...n)=>{const b=mk(rs,'Paladin',1,arr);/* level 1: no Fighting Style yet */wear(b,...n);return calc(b)};
 {const {D}=F([15,18,13,10,10,8],'Studded Leather Armor');eq(rs+' AC light armor',12+md(D,'DEX'),D.ac)}
 {const {D}=F([15,18,13,10,10,8],'Breastplate');eq(rs+' AC medium armor Dex max 2',14+Math.min(2,md(D,'DEX')),D.ac)}
 {const {D}=F([15,18,13,10,10,8],'Half Plate Armor','Shield');eq(rs+' AC medium + shield',17+Math.min(2,md(D,'DEX')),D.ac)}
 {const {C,D}=F([15,18,13,10,10,8],'Plate Armor');eq(rs+' AC heavy armor no Dex',18,D.ac);
  eq(rs+' plate Str ok speed',D.score.STR>=15?30:20,D.speed)}
 {const {C,D}=F([16,10,13,10,10,8],'Chain Mail');eq(rs+' chain mail Str ok speed',30,D.speed);
  eq(rs+' chain mail Stealth disadvantage',true,!!((C.skills||[]).find(s=>s.n==='Stealth')||{}).dis)}
 {const b=mk(rs,'Paladin',1,[8,14,13,12,12,8]);wear(b,'Chain Mail');const {C,D}=calc(b);eq(rs+' chain mail Str below 13 speed',D.score.STR>=13?30:20,D.speed)}
 /* passive Perception */
 {const {C,D}=calc(mk(rs,'Fighter',5,[15,14,13,12,16,8]));const i=C.skills.findIndex(s=>s.n==='Perception');eq(rs+' Passive Perception',10+D.skill[i],D.pas_per)}
}
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
print("core_numbers: %d values, %d wrong" % (len(rows), bad)); sys.exit(1 if bad or not rows else 0)
