#!/usr/bin/env python3
"""Numbers WotC feats put on the computed sheet, 2024 rules (PHB 2024 origin, general, fighting style, epic boon) and 2014 rules
(PHB 2014, Xanathar's, Tasha's). One browser session, Fighter builds through window.__bldFuzz.  python3 tests/feat_numbers.py
Also: every feat with an ability increase adds it once (PHB 2024 feats, PHB 2014 / XGE / TCE feats), ASI caps at 20, Epic Boons go past 20."""
import os, re, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def feats14():  # feat names and ability lists of the PHB 2014, Tasha's and Xanathar's feat rows (src/data/wotc07-feats-2014.js)
    line = open(os.path.join(ROOT, "src/data/wotc07-feats-2014.js"), encoding="utf-8").read().split("\n")[3]
    D = json.loads(re.sub(r"^var D=", "", line).rstrip().rstrip(";"))
    return {f: {"asi": D["feats"][f].get("asi"), "asi2": D["feats"][f].get("asi2")} for s in D["src"] if s["id"] in ("phb14", "tce", "xge") for f in s["feats"]}

JS = r"""(F14)=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const sheet=b=>{const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
const R14=['Human (2014)','Soldier (2014)'],R24=['Human','Soldier'];
const mk=(rs,lv,arr)=>{const r=rs==='2014'?R14:R24;const b=window.__bldFuzz({sp:r[0],bg:r[1],rs,src:all,cls:'Fighter',sub:'',lv,arr:arr||[15,14,13,12,10,8],b2:0,b1:0}).b;if(rs==='2024')b.ch.spfeat='Crafter';return b};
const one=(b0,feat,a1,mod,a2)=>{const b=structuredClone(b0);b.ch.feat4={feat,a1,a2};if(mod)mod(b);return sheet(b)};
const scale=b=>{b.inv.forEach(x=>{if(/Mail|Shield|Armor|Plate|Leather/.test(x.n))x.eq=false});b.inv.push({n:'Scale Mail',q:1,eq:true})};
const unarm=b=>{b.inv.forEach(x=>{if(/Mail|Shield|Armor|Plate|Leather/.test(x.n))x.eq=false})};
const sum=a=>a.reduce((x,y)=>x+y.v,0),score=(C,k)=>C.abilities[k].base+sum(C.abilities[k].bonus);
const res=(C,n)=>((C.res||[]).find(x=>x.n===n||x.k===n)||{}).max,sense=(C,n)=>((C.senses||[]).find(x=>x.n===n)||{}).v;
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const pb=l=>2+Math.floor((l-1)/4);
for(const lv of [1,4,5,9,13,17]){const b=mk('2024',lv);
 b.ch.spfeat='Alert';eq('2024 Alert init L'+lv,pb(lv),sum(sheet(b).initBonus));
 b.ch.spfeat='Lucky';eq('2024 Lucky points L'+lv,pb(lv),res(sheet(b),'luck'));
 b.ch.spfeat='Tough';eq('2024 Tough HP L'+lv,2*lv,sum(sheet(b).hpBonus))}
const b24=mk('2024',8),d24=mk('2024',8,[10,16,13,12,15,8]);
eq('2024 Speedy speed',40,one(b24,'Speedy','DEX').speed);
eq('2024 Boon of Speed speed',60,one(b24,'Boon of Speed','DEX').speed);
eq('2024 Boon of Fortitude HP',40,sum(one(b24,'Boon of Fortitude','CON').hpBonus));
eq('2024 Resilient WIS save',true,!!one(b24,'Resilient','WIS').saves.WIS);
eq('2024 Chef treats = PB',3,res(one(b24,'Chef','CON'),'Bolstering Treats'));
eq('2024 Observant no passive bonus',0,(one(b24,'Observant','WIS').pasBon||[]).length);
eq('2024 Medium Armor Master Dex max',"max3",one(d24,'Medium Armor Master','DEX',scale).ac.dex);
eq('2024 Tavern Brawler unarmed die',"1d4",(one(b24,'Tavern Brawler','STR').attacks.find(a=>a.n==='Unarmed Strike')||{}).die);
eq('2024 Athlete climb',30,((one(b24,'Athlete','STR').moves||[]).find(m=>m.m==='climb')||{}).v);
eq('2024 Skulker blindsight',10,sense(one(b24,'Skulker','DEX'),'Blindsight'));
eq('2024 Boon of Truesight',60,sense(one(b24,'Boon of Truesight','WIS'),'Truesight'));
eq('2024 Boon of Recovery pool',10,res(one(b24,'Boon of Recovery','CON'),'Recover Vitality'));
eq('2024 Archery +2',2,(one(b24,'Archery').attacks.find(a=>a.n==='Shortbow')||{}).misc);
const s19=structuredClone(b24);s19.base.STR=19;
eq('2024 ASI cap 20',20,score(one(s19,'Ability Score Improvement','STR',null,'STR'),'STR'));
const s20=structuredClone(b24);s20.base.STR=20;s20.bgMode='111';
eq('2024 Epic Boon past 20',score(sheet(structuredClone(s20)),'STR')+1,score(one(s20,'Boon of Combat Prowess','STR'),'STR'));
const b14=mk('2014',8),d14=mk('2014',8,[10,16,13,12,15,8]);
for(const lv of [4,8,17]){const b=mk('2014',lv);eq('2014 Alert init L'+lv,5,sum(one(b,'Alert (2014)').initBonus));
 eq('2014 Lucky points L'+lv,3,res(one(b,'Lucky (2014)'),'luck'));eq('2014 Tough HP L'+lv,2*lv,sum(one(b,'Tough (2014)').hpBonus))}
eq('2014 Mobile speed',40,one(b14,'Mobile').speed);
eq('2014 Observant passives',"per5,inv5",(one(b14,'Observant (2014)','WIS').pasBon||[]).map(x=>x.k+x.v).join(','));
eq('2014 Heavy Armor Master reduce 3',true,one(b14,'Heavy Armor Master (2014)','STR').defenses.some(d=>/reduced by 3/.test(d.v)));
eq('2014 Medium Armor Master Dex max',"max3",one(d14,'Medium Armor Master (2014)',null,scale).ac.dex);
const dh=one(d14,'Dragon Hide','CON',unarm).ac;eq('2014 Dragon Hide AC',"13 full",dh.base+' '+dh.dex);
eq('2014 Squat Nimbleness speed',35,one(b14,'Squat Nimbleness','DEX').speed);
eq('2014 Dual Wielder AC toggle',true,(one(b14,'Dual Wielder (2014)').fxToggles||[]).some(t=>t.id==='dual-defense'));
eq('2014 Resilient WIS save',true,!!one(b14,'Resilient (2014)','WIS').saves.WIS);
eq('2014 Metamagic Adept points',2,res(one(b14,'Metamagic Adept'),'Sorcery Points (Metamagic Adept)'));
eq('2014 Infernal Constitution resist',"Cold,Poison",one(b14,'Infernal Constitution','CON').defenses.filter(d=>d.t==='Resistance').map(d=>d.v).join(','));
/* every increase applied once */
for(const [rs,F] of [['2024',window.FEATS],['2014',F14]]){const b0=mk(rs,8,[10,10,10,10,10,10]);const C0=sheet(structuredClone(b0));let t0=0;for(const k in C0.abilities)t0+=score(C0,k);
 let n=0,bad=[];for(const f of Object.keys(F)){const D=F[f];if(!D.asi&&!D.asi2)continue;const a=(D.asi||['STR'])[0];const C=one(b0,f,a,null,D.asi2?a:undefined);let t=0;for(const k in C.abilities)t+=score(C,k);n++;if(t-t0!==(D.asi2?2:1))bad.push(f+' '+(t-t0))}
 eq(rs+' ability increase once ('+n+' feats)',"",bad.join('; '))}
return o}"""

bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'")
    rows = pg.evaluate(JS, feats14()); br.close()
for lab, want, got in rows:
    ok = want == got; bad += not ok
    print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("feat_numbers: %d values, %d wrong" % (len(rows), bad)); sys.exit(1 if bad or not rows else 0)
