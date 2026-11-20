#!/usr/bin/env python3
"""What WotC backgrounds put on the computed sheet. One browser session, Fighter builds through window.__bldFuzz.
  python3 tests/background_numbers.py
2024 (PHB 2024, 16 backgrounds): the three ability scores, +2/+1 (every pair) or +1/+1/+1 applied once and capped at 20, the
Origin feat and its effect (Alert initiative, Tough HP, Lucky points, Magic Initiate spells, Skilled/Crafter/Musician picks,
Tavern Brawler unarmed die), 2 skills, the tool, equipment option A (items and gold) or B (50 GP).
2014 (PHB, SCAG and other WotC books): skills, tools, number of languages, feature name, no ability increase.
Overlap: a background skill that a class or species also gives is proficiency once, never Expertise."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# PHB 2024: abilities, feat, skills, tool (a pick names its category), option A gold
P24 = {
 "Acolyte": ["INT,WIS,CHA", "Magic Initiate (Cleric)", "Insight,Religion", "Calligrapher's Supplies", 8],
 "Artisan": ["STR,DEX,INT", "Crafter", "Investigation,Persuasion", "art", 32],
 "Charlatan": ["DEX,CON,CHA", "Skilled", "Deception,Sleight of Hand", "Forgery Kit", 15],
 "Criminal": ["DEX,CON,INT", "Alert", "Sleight of Hand,Stealth", "Thieves' Tools", 16],
 "Entertainer": ["STR,DEX,CHA", "Musician", "Acrobatics,Performance", "music", 11],
 "Farmer": ["STR,CON,WIS", "Tough", "Animal Handling,Nature", "Carpenter's Tools", 30],
 "Guard": ["STR,INT,WIS", "Alert", "Athletics,Perception", "game", 12],
 "Guide": ["DEX,CON,WIS", "Magic Initiate (Druid)", "Stealth,Survival", "Cartographer's Tools", 3],
 "Hermit": ["CON,WIS,CHA", "Healer", "Medicine,Religion", "Herbalism Kit", 16],
 "Merchant": ["CON,INT,CHA", "Lucky", "Animal Handling,Persuasion", "Navigator's Tools", 22],
 "Noble": ["STR,INT,CHA", "Skilled", "History,Persuasion", "game", 29],
 "Sage": ["CON,INT,WIS", "Magic Initiate (Wizard)", "Arcana,History", "Calligrapher's Supplies", 8],
 "Sailor": ["STR,DEX,WIS", "Tavern Brawler", "Acrobatics,Perception", "Navigator's Tools", 20],
 "Scribe": ["DEX,INT,WIS", "Skilled", "Investigation,Perception", "Calligrapher's Supplies", 23],
 "Soldier": ["STR,DEX,CON", "Savage Attacker", "Athletics,Intimidation", "game", 14],
 "Wayfarer": ["DEX,WIS,CHA", "Lucky", "Insight,Stealth", "Thieves' Tools", 16],
}
# 2014: skills (n:list = pick n), tools (fixed names; '+1' = one picked tool), languages, feature
P14 = {
 "Acolyte (2014)": ["Insight,Religion", "", 2, "Shelter of the Faithful"],
 "Charlatan (2014)": ["Deception,Sleight of Hand", "Disguise Kit,Forgery Kit", 0, "False Identity"],
 "Criminal (2014)": ["Deception,Stealth", "Thieves' Tools+1", 0, "Criminal Contact"],
 "Entertainer (2014)": ["Acrobatics,Performance", "Disguise Kit+1", 0, "By Popular Demand"],
 "Folk Hero": ["Animal Handling,Survival", "Vehicles (Land)+1", 0, "Rustic Hospitality"],
 "Guild Artisan": ["Insight,Persuasion", "+1", 1, "Guild Membership"],
 "Hermit (2014)": ["Medicine,Religion", "Herbalism Kit", 1, "Discovery"],
 "Noble (2014)": ["History,Persuasion", "+1", 1, "Position of Privilege"],
 "Outlander": ["Athletics,Survival", "+1", 1, "Wanderer"],
 "Sage (2014)": ["Arcana,History", "", 2, "Researcher"],
 "Sailor (2014)": ["Athletics,Perception", "Navigator's Tools,Vehicles (Water)", 0, "Ship's Passage"],
 "Soldier (2014)": ["Athletics,Intimidation", "Vehicles (Land)+1", 0, "Military Rank"],
 "Urchin": ["Sleight of Hand,Stealth", "Disguise Kit,Thieves' Tools", 0, "City Secrets"],
 "Variant Criminal (Spy)": ["Deception,Stealth", "Thieves' Tools+1", 0, "Spy Contact"],
 "Variant Guild Artisan (Guild Merchant)": ["Insight,Persuasion", "+1", 1, "Guild Membership"],
 "Variant Noble (Knight)": ["History,Persuasion", "+1", 1, "Retainers"],
 "Variant Sailor (Pirate)": ["Athletics,Perception", "Navigator's Tools,Vehicles (Water)", 0, "Bad Reputation"],
 "City Watch": ["Athletics,Insight", "", 2, "Watcher's Eye"],
 "Clan Crafter": ["History,Insight", "+1", 1, "Respect of the Stout Folk"],
 "Cloistered Scholar": ["History,1:Arcana/Nature/Religion", "", 2, "Library Access"],
 "Courtier": ["Insight,Persuasion", "", 2, "Court Functionary"],
 "Faction Agent": ["Insight,1:*", "", 2, "Safe Haven"],
 "Far Traveler": ["Insight,Perception", "+1", 1, "All Eyes on You"],
 "Inheritor": ["Survival,1:Arcana/History/Religion", "+1", 1, "Inheritance"],
 "Knight of the Order": ["Persuasion,1:Arcana/History/Nature/Religion", "+1", 1, "Knightly Regard"],
 "Mercenary Veteran": ["Athletics,Persuasion", "Vehicles (Land)+1", 0, "Mercenary Life"],
 "Urban Bounty Hunter": ["2:Deception/Insight/Persuasion/Stealth", "+2", 0, "Ear to the Ground"],
 "Uthgardt Tribe Member": ["Athletics,Survival", "+1", 1, "Uthgardt Heritage"],
 "Waterdhavian Noble": ["History,Persuasion", "+1", 1, "Kept in Style"],
 "Baldur's Gate Acolyte": ["Insight,Religion", "", 2, "Shelter of the Faithful"],
 "Baldur's Gate Guild Artisan": ["Insight,Persuasion", "+1", 1, "Guild Membership"],
 "Baldur's Gate Hermit": ["Medicine,Religion", "Herbalism Kit", 1, "Discovery"],
 "Baldur's Gate Noble": ["History,Persuasion", "+1", 1, "Patriar"],
 "Baldur's Gate Outlander": ["Athletics,Survival", "+1", 1, "Wanderer"],
 "Baldur's Gate Sage": ["Arcana,History", "", 2, "Researcher"],
 "Baldur's Gate Urchin": ["Sleight of Hand,Stealth", "Disguise Kit,Thieves' Tools", 0, "City Secrets"],
 "Cobalt Scholar (Sage)": ["Arcana,History", "", 2, "Researcher"],
 "Luxonborn (Acolyte)": ["Insight,Religion", "", 2, "Shelter of the Faithful"],
 "Volstrucker Agent": ["Deception,Stealth", "Poisoner's Kit", 1, "Shadow Network"],
 "Anthropologist": ["Insight,Religion", "", 2, "Adept Linguist"],
 "Archaeologist (2014)": ["History,Survival", "+1", 1, "Historical Knowledge"],
 "Haunted One (2014)": ["2:Arcana/Investigation/Religion/Survival", "", 2, "Heart of Darkness"],
 "Investigator (2014)": ["2:Insight/Investigation/Perception", "Disguise Kit,Thieves' Tools", 0, "Official Inquiry"],
 "Azorius Functionary": ["Insight,Intimidation", "", 2, "Legal Authority"],
 "Simic Scientist": ["Arcana,Medicine", "", 2, "Researcher"],
 "Golgari Agent": ["Nature,Survival", "Poisoner's Kit", 1, "Undercity Paths"],
 "Lorehold Student": ["History,Religion", "", 2, "Lorehold Initiate"],
 "Witherbloom Student": ["Nature,Survival", "Herbalism Kit", 1, "Witherbloom Initiate"],
 "Athlete": ["Acrobatics,Athletics", "Vehicles (Land)", 1, "Echoes of Victory"],
 "Marine": ["Athletics,Survival", "Vehicles (Water),Vehicles (Land)", 0, "Steady"],
 "Wildspacer": ["Athletics,Survival", "Navigator's Tools,Vehicles (Space)", 0, "Wildspace Adaptation"],
}

JS = r"""([P24,P14])=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const o=[],eq=(lab,want,got)=>o.push([lab,want,got]);
const fz=(rs,bg,sp,b2,b1,arr)=>window.__bldFuzz({sp:sp||(rs==='2014'?'Lightfoot Halfling':'Human'),bg,rs,src:all,cls:'Fighter',sub:'',lv:1,arr:arr||[15,14,13,12,10,8],b2:b2||0,b1:b1||0});
const sheet=b=>{const t=window.__bldTestB();Object.assign(t,b);delete t.unset;return window.__bldSheetFor(t)};
const sum=a=>(a||[]).reduce((x,y)=>x+y.v,0);
const bgBonus=(C,bg)=>{const r={};for(const k in C.abilities){const v=sum(C.abilities[k].bonus.filter(x=>x.s.indexOf(bg+' background')===0));if(v)r[k]=v}return Object.keys(r).sort().map(k=>k+r[k]).join(',')};
const bgSk=(C,bg)=>C.skills.filter(s=>s.p&&((s.src||'').indexOf(bg+' background')===0||(s.src||'').endsWith(', '+bg+' background'))).map(s=>s.n).sort().join(',');
const tools=C=>(C.profs.tools||'').split(', ').filter(x=>x&&x!=='None');
for(const bg in P24){const [ab,feat,sk,tool,gp]=P24[bg];const D=window.BACKGROUNDS[bg];
 eq('2024 '+bg+' abilities',ab,(D.ab||[]).join(','));
 /* every +2/+1 pair and +1/+1/+1 */
 for(let b2=0;b2<3;b2++)for(let b1=0;b1<2;b1++){const r=fz('2024',bg,null,b2,b1);const a=D.ab,x2=a[b2%3],x1=a[(b2+1+(b1%2))%3];
  eq('2024 '+bg+' +2 '+x2+' +1 '+x1,[x2+'2',x1+'1'].sort().join(','),bgBonus(r.c,bg))}
 const r=fz('2024',bg),b=r.b,C=r.c;
 {const t=structuredClone(b);t.bgMode='111';eq('2024 '+bg+' +1/+1/+1',D.ab.slice().sort().map(k=>k+'1').join(','),bgBonus(sheet(t),bg))}
 {const t=structuredClone(b);t.base[t.bg2]=19;const S=sheet(t);eq('2024 '+bg+' cap 20',20,S.abilities[t.bg2].base+sum(S.abilities[t.bg2].bonus))}
 eq('2024 '+bg+' feat',feat,D.feat);
 eq('2024 '+bg+' feat on sheet',true,(C.features||[]).some(g=>g.g==='Feats'&&g.items.some(i=>i.n===feat)));
 const fs='Origin feat ('+bg+')',fromF=a=>(a||[]).filter(x=>(x.s||x.src||'').indexOf(fs)>=0);
 if(feat==='Alert')eq('2024 '+bg+' Alert init',2,sum(fromF(C.initBonus)));
 if(feat==='Tough')eq('2024 '+bg+' Tough HP',2,sum(fromF(C.hpBonus)));
 if(feat==='Lucky')eq('2024 '+bg+' Lucky points',2,((C.res||[]).find(x=>x.k==='luck'||x.n==='luck')||{}).max);
 if(/^Magic Initiate/.test(feat)){const m=(C.spells||[]).filter(s=>/Magic Initiate/.test(s.src||s.s||''));eq('2024 '+bg+' Magic Initiate spells','2 cantrips, 1 level 1',m.filter(s=>!s.l).length+' cantrips, '+m.filter(s=>s.l===1).length+' level 1')}
 if(feat==='Skilled')eq('2024 '+bg+' Skilled picks',3,(b.ch['skl-'+fs]||[]).length);
 if(feat==='Crafter'||feat==='Musician')eq('2024 '+bg+' '+feat+' tools',3,(b.ch['tl-'+fs]||[]).filter(x=>tools(C).includes(x)).length);
 if(feat==='Tavern Brawler')eq('2024 '+bg+' unarmed die','1d4',((C.attacks||[]).find(a=>a.n==='Unarmed Strike')||{}).die);
 eq('2024 '+bg+' skills',sk,bgSk(C,bg));
 const T=tools(C),want=/^(art|music|game)$/.test(tool)?(b.ch.bgTool||[])[0]:tool;
 eq('2024 '+bg+' tool',true,!!want&&T.includes(want)&&(tool!==want?(window.TOOLS||{})[tool]?window.TOOLS[tool].includes(want):true:true));
 eq('2024 '+bg+' option A gold',4+gp,C.gp);
 const first=D.eq.split(', ')[0].replace(/^\d+ /,'').replace(/s$/,'');
 eq('2024 '+bg+' option A items',true,C.inv.some(x=>x.n.indexOf(first)===0||(first==='Gaming Set'||first==='Musical Instrument'||first==="Artisan's Tool")));
 {const t=structuredClone(b);t.eqB='B';eq('2024 '+bg+' option B gold',54,sheet(t).gp)}
 eq('2024 '+bg+' no rule issues','',r.ri.join('; ')+r.un)}
/* 2014 */
for(const bg in P14){const [sk,tl,ln,ft]=P14[bg];const r=fz('2014',bg);if(r.err){eq('2014 '+bg+' builds','',r.err.slice(0,200));continue}const C=r.c;
 let ab=0;for(const k in C.abilities)ab+=sum(C.abilities[k].bonus.filter(x=>!/\(race\)/.test(x.s)));eq('2014 '+bg+' no ability increase',0,ab);
 const got=bgSk(C,bg).split(',').filter(Boolean);let ok=true,n=0;
 sk.split(',').forEach(p=>{const m=p.match(/^(\d):(.*)$/);if(!m){n++;ok=ok&&got.includes(p)}else{const k=+m[1],L=m[2]==='*'?null:m[2].split('/');n+=k;ok=ok&&got.filter(g=>!sk.split(',').includes(g)).every(g=>!L||L.includes(g))}});
 eq('2014 '+bg+' skills '+sk,true,ok&&got.length===n);
 const T=tools(C),fx=tl.replace(/\+\d$/,'').split(',').filter(Boolean),pk=+((tl.match(/\+(\d)$/)||[0,0])[1]);
 eq('2014 '+bg+' tools '+(tl||'none'),fx.length+pk,fx.every(x=>T.includes(x))?T.length:-1);
 eq('2014 '+bg+' languages',ln,(C.lang||[]).filter(x=>x!=='Common'&&x!=='Halfling').length);
 const g=(C.features||[]).find(f=>f.g==='Background: '+bg);eq('2014 '+bg+' feature',true,!!g&&g.items.some(i=>i.n===ft));
 eq('2014 '+bg+' no rule issues','',r.ri.join('; ')+r.un)}
/* overlap: a skill from the background and from the class or species is proficiency once, not Expertise */
const pOf=(C,n)=>(C.skills.find(s=>s.n===n)||{}).p||0;
{const r=fz('2014','Soldier (2014)','Human (2014)');const b=r.b;b.ch.clsk=['Athletics','Perception'];const C=sheet(b);eq('2014 overlap class+background Athletics proficiency once',1,pOf(C,'Athletics'))}
{const r=fz('2014','Acolyte (2014)','Hill Dwarf');eq('2014 Quick Build languages skip one the species knows (Hill Dwarf + Acolyte)',4,new Set(r.c.lang||[]).size)}
{const r=fz('2014','Soldier (2014)','Half-Orc');eq('2014 overlap species+background Intimidation proficiency once',1,pOf(r.c,'Intimidation'))}
{const r=fz('2024','Soldier');const b=r.b;b.ch.clsk=['Athletics','Perception'];b.ch.spsk=['Intimidation'];const C=sheet(b);
 eq('2024 overlap class+background Athletics proficiency once',1,pOf(C,'Athletics'));eq('2024 overlap species+background Intimidation proficiency once',1,pOf(C,'Intimidation'))}
return o}"""

bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'")
    rows = pg.evaluate(JS, [P24, P14]); br.close()
for lab, want, got in rows:
    ok = want == got; bad += not ok
    print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("background_numbers: %d values, %d wrong" % (len(rows), bad)); sys.exit(1 if bad or not rows else 0)
