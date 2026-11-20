#!/usr/bin/env python3
"""Numbers WotC species put on the computed sheet at levels 1, 3, 5, 11, 17: 2024 rules (PHB 2024, Monsters of the Multiverse) and
2014 rules (PHB 2014, Volo's, Tome of Foes, Fizban's, Wildemount, Eberron, Ravnica, Elemental Evil, Tortle Package).
Speed, other speeds, darkvision, AC, HP bonus, limited uses, damage rows, species spells, and the "At your level" note of a trait.
One browser session, Fighter builds through window.__bldFuzz.  python3 tests/species_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

JS = r"""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);all.mom=true;all.efa=true;
const mk=(sp,rs,lv,ch)=>{const b=window.__bldFuzz({sp,bg:rs==='2014'?'Soldier (2014)':'Soldier',rs,src:all,cls:'Fighter',sub:'',lv,arr:[15,14,13,12,10,8],b2:0,b1:0}).b;b.src=all;if(ch)b.ch=Object.assign({},b.ch,ch);
 b.inv.forEach(x=>{if(/Mail|Shield|Armor|Plate|Leather/.test(x.n))x.eq=false});const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
const sum=a=>(a||[]).reduce((x,y)=>x+y.v,0),pb=l=>2+Math.floor((l-1)/4);
const res=(C,n)=>{const r=(C.res||[]).find(x=>x.own&&x.n===n);return r?r.max+'/'+r.reset:'none'};
const xd=(C,n)=>{const r=(C.xdmg||[]).find(x=>x.n===n);return r?r.dmg+(r.dc?' DC'+r.dc:''):'none'};
const att=(C,n)=>{const r=(C.attacks||[]).find(x=>x.n===n);return r?r.die+' '+r.type:'none'};
const spd=(C,k)=>{const s=(C.speeds||{})[k];return s?(s.v!=null?s.v:s):'none'};
const note=(C,n)=>{const g=(C.features||[]).find(f=>/^Species/.test(f.g));const i=g&&g.items.find(x=>x.n===n);if(!i)return 'no trait';const p=i.d.split('**At your level:** ');return p[1]?p[1].replace(/\.$/,''):'no note'};
const spl=C=>(C.spells||[]).map(s=>s.n||s.name);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const LV=[1,3,5,11,17],d10=l=>(l>=17?4:l>=11?3:l>=5?2:1)+'d10',d6=l=>(l>=16?5:l>=11?4:l>=6?3:2)+'d6';
for(const lv of LV){const L='L'+lv;let C;
 C=mk('Dragonborn','2024',lv);eq('2024 Dragonborn breath '+L,d10(lv)+' DC'+(8+pb(lv)+1),xd(C,'Breath Weapon'));eq('2024 Dragonborn breath uses '+L,pb(lv)+'/long',res(C,'Breath Weapon'));
  eq('2024 Dragonborn flight '+L,lv>=5?'1/long':'none',res(C,'Draconic Flight'));eq('2024 Dragonborn darkvision '+L,60,C.darkvision);
 C=mk('Aasimar','2024',lv);eq('2024 Aasimar revelation '+L,lv>=3?String(pb(lv)):'none',(xd(C,'Celestial Revelation')));eq('2024 Aasimar Healing Hands '+L,pb(lv)+'d4 Hit Points',note(C,'Healing Hands'));
 C=mk('Goliath','2024',lv);eq('2024 Goliath speed '+L,35,C.speed);eq('2024 Goliath ancestry uses '+L,pb(lv)+'/long',res(C,'Giant Ancestry'));eq('2024 Goliath Large Form '+L,lv>=5?'1/long':'none',res(C,'Large Form'));
 C=mk('Dwarf','2024',lv);eq('2024 Dwarf HP '+L,lv,sum(C.hpBonus));eq('2024 Dwarf darkvision+speed '+L,'120 30',C.darkvision+' '+C.speed);eq('2024 Dwarf Stonecunning '+L,pb(lv)+'/long',res(C,'Stonecunning'));
 C=mk('Orc','2024',lv);eq('2024 Orc Adrenaline Rush '+L,pb(lv)+'/short',res(C,'Adrenaline Rush'));eq('2024 Orc Relentless '+L,'1/long',res(C,'Relentless Endurance'));eq('2024 Orc darkvision '+L,120,C.darkvision);
 C=mk('Tiefling','2024',lv);const ts=spl(C);eq('2024 Tiefling spells '+L,lv>=5?'3,5':lv>=3?'3':'',[ts.includes('Ray of Sickness')?'3':'',ts.includes('Hold Person')?'5':''].filter(Boolean).join(','));
 C=mk('Elf','2024',lv);const es=spl(C);eq('2024 Drow darkvision '+L,120,C.darkvision);eq('2024 Drow spells '+L,lv>=5?3:lv>=3?2:1,['Dancing Lights','Faerie Fire','Darkness'].filter(n=>es.includes(n)).length);
 C=mk('Shifter','2024',lv);eq('2024 Shifter Shifting '+L,pb(lv)+' uses per Long Rest, '+2*pb(lv)+' Temporary Hit Points each time',note(C,'Shifting'));
 C=mk('Dragonborn (Metallic)','2014',lv);eq('Fizban Dragonborn breath '+L,'Dexterity save DC '+(8+pb(lv)+1)+', '+d10(lv)+', '+pb(lv)+' uses',note(C,'Breath Weapon'));eq('Fizban Dragonborn uses '+L,pb(lv)+'/long',res(C,'Breath Weapon'));
 C=mk('Dragonborn (2014)','2014',lv);eq('PHB14 Dragonborn breath '+L,'Save DC '+(8+pb(lv)+1)+', '+d6(lv)+', 1 use per Short Rest',note(C,'Breath Weapon'));eq('PHB14 Dragonborn uses '+L,'1/short',res(C,'Breath Weapon'));eq('PHB14 Dragonborn darkvision '+L,0,C.darkvision);eq('PHB14 Dragonborn breath row '+L,d6(lv)+' DC'+(8+pb(lv)+1),xd(C,'Breath Weapon'));
 C=mk('Draconblood Dragonborn','2014',lv);eq('EGW Draconblood breath dice '+L,d6(lv),(note(C,'Breath Weapon').match(/\d+d6/)||['none'])[0]);eq('EGW Draconblood breath row '+L,d6(lv),(xd(C,'Breath Weapon').split(' ')[0]));
 C=mk('Ravenite Dragonborn','2014',lv);eq('EGW Ravenite breath row '+L,d6(lv),(xd(C,'Breath Weapon').split(' ')[0]));
 C=mk('Aasimar (Protector)','2014',lv);eq('VGM Aasimar Healing Hands '+L,lv+' Hit Points',note(C,'Healing Hands'));
 C=mk('Shifter (Beasthide)','2014',lv);eq('ERLW Beasthide Shifting '+L,'1 use per Short Rest, '+(lv+2)+' + 1d6 Temporary Hit Points',note(C,'Shifting'));
 C=mk('Hill Dwarf','2014',lv);eq('PHB14 Hill Dwarf HP '+L,lv,sum(C.hpBonus));eq('PHB14 Hill Dwarf darkvision+speed '+L,'60 25',C.darkvision+' '+C.speed);
 C=mk('Tiefling (2014)','2014',lv);const t14=spl(C);eq('PHB14 Tiefling spells '+L,lv>=5?'3,5':lv>=3?'3':'',[t14.includes('Hellish Rebuke')?'3':'',t14.includes('Darkness')?'5':''].filter(Boolean).join(','));
 C=mk('Goliath (2014)','2014',lv);eq('VGM Goliath Stone\'s Endurance '+L,'1/short',res(C,"Stone's Endurance"))}
const bw=(sp,rs,lin)=>{const C=mk(sp,rs,5,{lin}),r=(C.xdmg||[]).filter(x=>x.n==='Breath Weapon');return r.map(x=>x.dmg+' '+x.type+' '+x.save).join(';')};
eq('PHB14 Dragonborn Red breath','2d6 Fire DEX',bw('Dragonborn (2014)','2014','Red (Fire)'));eq('PHB14 Dragonborn Blue breath','2d6 Lightning DEX',bw('Dragonborn (2014)','2014','Blue (Lightning)'));
eq('PHB14 Dragonborn White breath','2d6 Cold CON',bw('Dragonborn (2014)','2014','White (Cold)'));eq('PHB14 Dragonborn Green breath','2d6 Poison CON',bw('Dragonborn (2014)','2014','Green (Poison)'));
eq('EGW Ravenite Silver breath','2d6 Cold CON',bw('Ravenite Dragonborn','2014','Silver (Cold)'));
let C=mk('Wood Elf','2014',5);eq('PHB14 Wood Elf speed',35,C.speed);
C=mk('Drow','2014',5);eq('PHB14 Drow darkvision',120,C.darkvision);
C=mk('Deep Gnome','2024',5);eq('MotM Deep Gnome darkvision',120,C.darkvision);
C=mk('Deep Gnome (2014)','2014',5);eq('MTF Deep Gnome darkvision',120,C.darkvision);
C=mk('Tabaxi','2024',5);eq('MotM Tabaxi climb + claws',"30 1d6 Slashing",spd(C,'climb')+' '+att(C,"Cat's Claws"));
C=mk('Tabaxi (2014)','2014',5);eq('VGM Tabaxi climb',20,spd(C,'climb'));
C=mk('Aarakocra','2024',5);eq('MotM Aarakocra fly + talons',"30 1d6 Slashing",spd(C,'fly')+' '+att(C,'Talons'));
C=mk('Aarakocra (2014)','2014',5);eq('EEPC Aarakocra speed/fly','25 50',C.speed+' '+spd(C,'fly'));
C=mk('Lizardfolk','2024',5);eq('MotM Lizardfolk AC base, bite',"13 1d6 Slashing",C.ac.base+' '+att(C,'Bite'));
C=mk('Lizardfolk (2014)','2014',5);eq('VGM Lizardfolk AC base',13,C.ac.base);
C=mk('Tortle','2024',5);eq('MotM Tortle AC',17,C.ac.base);
C=mk('Tortle (2014)','2014',5);eq('TTP Tortle AC',17,C.ac.base);
C=mk('Warforged (2014)','2014',5);eq('ERLW Warforged AC +1',1,sum(C.ac.bonus));
C=mk('Loxodon','2014',5);eq('GGR Loxodon AC base',12,C.ac.base);
C=mk('Centaur','2024',5);eq('MotM Centaur speed + hooves','40 1d6 Bludgeoning',C.speed+' '+att(C,'Hooves'));
C=mk('Minotaur','2024',5);eq('MotM Minotaur horns','1d6 Piercing',att(C,'Horns'));
for(const [sp,n,w] of [['Minotaur (2014)','Horns','1d6 Piercing'],['Tabaxi (2014)',"Cat's Claws",'1d4 Slashing'],['Lizardfolk (2014)','Bite','1d6 Piercing'],['Centaur (2014)','Hooves','1d4 Bludgeoning'],['Aarakocra (2014)','Talons','1d4 Slashing'],['Tortle (2014)','Claws','1d4 Slashing'],['Leonin','Claws','1d4 Slashing'],['Satyr (2014)','Ram','1d4 Bludgeoning']]){C=mk(sp,'2014',5);eq('2014 '+sp+' '+n,w,att(C,n))}
C=mk('Githyanki','2024',5);eq('MotM Githyanki spells L5',3,['Mage Hand','Jump','Misty Step'].filter(n=>spl(C).includes(n)).length);
C=mk('Firbolg (2014)','2014',5);eq('VGM Firbolg Hidden Step','1/short',res(C,'Hidden Step'));
C=mk('Orc (MoM)','2024',5);eq('MotM Orc Adrenaline Rush',pb(5)+'/long',res(C,'Adrenaline Rush'));
return o}"""

bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(600000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'")
    rows = pg.evaluate(JS); br.close()
for lab, want, got in rows:
    ok = want == got; bad += not ok
    if not ok: print("FAIL %s: expected %r got %r" % (lab, want, got))
print("species_numbers: %d values, %d wrong" % (len(rows), bad)); sys.exit(1 if bad or not rows else 0)
