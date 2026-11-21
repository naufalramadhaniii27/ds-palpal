#!/usr/bin/env python3
"""Review fixes A: Stormlord level, negated Advantage notes dropped, switches on Stormgirdle, Superior Dread, Elemental Champion,
Endless Evolution, Wings and Broom of Flying.  python3 tests/review_fix_a.py"""
import os, sys, json
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = """()=>{const G=GX,r={};const one=(t,k,n)=>(t[k]||[]).filter(e=>e.n===n);
 r.storm=one(G.sub,'Storm Sentinel (2014)','Stormlord (speed)').map(e=>e.l);
 r.notes=['Boon of Communication','Lucky','Medium Armor Master (2014)'].map(k=>(G.feat[k]||[]).filter(e=>/\\(note\\)/.test(e.n)).length)
  .concat([['Burden of Fame','Starstruck (note)'],['Materializer','Material Enhancement (note)'],['Oath of Eternal Night','Channel Divinity (note)'],['Oath of Thunder','Child of the Storm (note)']].map(([k,n])=>one(G.sub,k,n).length));
 r.kept=(G.species['Drow']||[]).some(e=>e.n==='Sunlight Sensitivity');
 const tg=(t,k,n)=>one(t,k,n).map(e=>[e.toggle&&e.toggle.id,e.res||e.imm||e.mv]);
 r.dread=tg(G.sub,'Undead Patron','Superior Dread');r.champ=tg(G.sub,'Oath of the Elements','Elemental Champion');r.evo=tg(G.sub,'Circle of Mutation','Endless Evolution');
 r.girdle=(G.item['Stormgirdle (Dormant)']||[]).map(e=>[(e.toggle&&e.toggle.id)||null,e.res?'res':'imm']);
 r.wings=tg(G.item,'Wings of Flying','Wings of Flying (speed)');r.broom=tg(G.item,'Broom of Flying','Broom of Flying (speed)');
 const mk=item=>{const b=window.__bldFuzz({rs:'2024',cls:'Fighter',sub:'',lv:5,arr:[10,14,14,15,15,15],b2:0,b1:0,sp:'Human',bg:'Soldier'}).b;
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.inv=[{n:item,q:1,eq:true}];return t};
 const S=(item,fx)=>JSON.stringify(window.__bldSheetFor(mk(item),fx||{}));
 r.sheet={girdleOff:[/Resistance[^\\]]{0,80}Lightning/.test(S('Stormgirdle (Dormant)')),/Immun[^\\]]{0,80}Lightning/.test(S('Stormgirdle (Dormant)'))],
  girdleOn:/Immun[^\\]]{0,80}Lightning/.test(S('Stormgirdle (Dormant)',{'b32-storm-avatar':true})),
  wingsOff:/"m":"fly","v":60/.test(S('Wings of Flying')),wingsOn:/"m":"fly","v":60/.test(S('Wings of Flying',{'b39-wings-of-flying':true})),
  broomOff:/"m":"fly","v":50/.test(S('Broom of Flying')),broomOn:/"m":"fly","v":50/.test(S('Broom of Flying',{'b39-broom-of-flying':true}))};
 return r}"""
EXP = {"storm": [], "notes": [0] * 7, "kept": True,
       "dread": [["b20-dread-24", ["Bludgeoning", "Piercing", "Slashing"]]],
       "champ": [["b31-elemental-champion", ["Acid", "Cold", "Fire", "Lightning", "Thunder"]]],
       "evo": [["b31-endless-evolution", ["Bludgeoning", "Piercing", "Slashing"]]],
       "girdle": [[None, "res"], ["b32-storm-avatar", "imm"]],
       "wings": [["b39-wings-of-flying", {"fly": 60}]], "broom": [["b39-broom-of-flying", {"fly": 50}]],
       "sheet": {"girdleOff": [True, False], "girdleOn": True, "wingsOff": False, "wingsOn": True, "broomOff": False, "broomOn": True}}
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("typeof window.__bldFuzz==='function'", timeout=60000)
    pg.wait_for_function("window.__deferDone", timeout=120000)
    got = pg.evaluate(JS); br.close()
bad = 0
for k, v in EXP.items():
    if k == "sheet":
        for s, e in v.items():
            ok = got[k][s] == e; bad += not ok; print("%s sheet %s%s" % ("ok  " if ok else "FAIL", s, "" if ok else ": got %s" % got[k][s]))
        continue
    ok = got[k] == v; bad += not ok; print("%s %s%s" % ("ok  " if ok else "FAIL", k, "" if ok else ": got %s, expected %s" % (json.dumps(got[k]), json.dumps(v))))
print("%d failed" % bad); sys.exit(1 if bad else 0)
