#!/usr/bin/env python3
"""Each pick in src/data/fx-B63-picks.js (lasting skill, tool, language or cantrip choices that were mech_scan by_design) shows on the sheet,
and only when the pick is made. Also Seraph Level 1 Angelic Wings and Fiend Stage 4 Abyssal Resistance.  python3 tests/picks_numbers.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FR, CV, AD, MG = "Path of the Fractured (2014)", "College of Adventurers (2014)", "Way of Pride", "College of the Mad God (2014)"
DD, ED, F1, F4 = "Destruction Domain", "Eldritch Domain (2014)", "Fiend Transformation: Stage 1", "Fiend Transformation: Stage 4"
g = lambda k, s: "gx-%s-sub-%s" % (k, s)
# (label, rules, class, subclass, feats {slot: feat}, picks {ch key: value}, check, expected). check: skill = proficient in it;
# lang / tools / spells / fly / imm / res = the text is in that part of the sheet. The same build without the picks must not have it.
CASES = [
    ("Mask of Civility skill", "2014", "Barbarian", FR, {}, {g("skill", FR): ["Medicine"]}, "skill", "Medicine"),
    ("Mask of Civility language", "2014", "Barbarian", FR, {}, {g("mode", FR): ["Language"], g("lang", FR): ["Draconic"]}, "lang", "Draconic"),
    ("Mask of Civility tool", "2014", "Barbarian", FR, {}, {g("mode", FR): ["Artisan's Tools"], g("tool", FR): ["Smith's Tools"]}, "tools", "Smith's Tools"),
    ("Well-Rounded skill", "2014", "Bard", CV, {}, {g("skill", CV): ["Nature"]}, "skill", "Nature"),
    ("Well-Rounded tool", "2014", "Bard", CV, {}, {g("tool", CV): ["Smith's Tools"]}, "tools", "Smith's Tools"),
    ("Well-Rounded language", "2014", "Bard", CV, {}, {g("lang", CV): ["Draconic"]}, "lang", "Draconic"),
    ("Tall Tales skill", "2014", "Monk", AD, {}, {g("skill", AD): ["Persuasion"]}, "skill", "Persuasion"),
    ("Mad God Bonus Proficiencies", "2014", "Bard", MG, {}, {g("skill", MG): ["Survival"]}, "skill", "Survival"),
    ("Devastation Initiate cantrips", "2014", "Cleric", DD, {}, {g("cantrips", DD): ["Fire Bolt", "Ray of Frost"]}, "spells", "Ray of Frost"),
    ("Unpredictable Inspiration cantrip", "2014", "Cleric", ED, {}, {g("cantrip", ED): ["Eldritch Blast"]}, "spells", "Eldritch Blast"),
    ("Unpredictable Inspiration skill", "2014", "Cleric", ED, {}, {g("skill", ED): ["Arcana"]}, "skill", "Arcana"),
    ("Whispers of the Dead tool (2014)", "2014", "Rogue", "Phantom (2014)", {}, {g("wtool", "Phantom (2014)"): ["Smith's Tools"]}, "tools", "Smith's Tools"),
    ("Whispers of the Dead tool", "2024", "Rogue", "Phantom", {}, {g("wtool", "Phantom"): ["Smith's Tools"]}, "tools", "Smith's Tools"),
    ("Angelic Wings fly speed", "2014", "Fighter", "", {"feat4": "Seraph Transformation: Level 1"}, {}, "fly", "fly"),
    ("Abyssal Resistance: Fire immunity", "2024", "Fighter", "", {"feat4": F1, "feat8": F4},
     {"gx-fr-feat-feat4": ["Fire"], "trFiend4-feat8": ["Abyssal Resistance"]}, "imm", "Fire"),
    ("Abyssal Resistance: Cold resistance", "2024", "Fighter", "", {"feat4": F1, "feat8": F4},
     {"gx-fr-feat-feat4": ["Fire"], "trFiend4-feat8": ["Abyssal Resistance"]}, "res", "Cold"),
]
JS = """(cases)=>{const all={};(WX.src||[]).forEach(x=>all[x.id]=true);
 const mk=(rs,cls,sub,feats,ch)=>{const o=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)'}:{sp:'Human',bg:'Soldier'};
  const b=window.__bldFuzz(Object.assign({rs,cls,sub,lv:19,arr:[10,14,14,15,15,15],b2:0,b1:0},o)).b;b.src=Object.assign({},b.src,all);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;t.ch=Object.assign({},t.ch,ch);
  Object.keys(feats).forEach(s=>{t.ch[s]={feat:feats[s],a1:'STR',a2:'CON'}});return t};
 const has=(C,k,v)=>{if(k==='skill')return (C.skills||[]).some(s=>s.n===v&&s.p);
  const part=k==='lang'?C.lang:k==='tools'?(C.profs||{}).tools:k==='spells'?C.spells:k==='fly'?[C.speedSrc,C.mv,C.speeds]:k==='imm'?[C.imm,C.defenses]:[C.res,C.defenses];
  const s=JSON.stringify(part||'');return k==='imm'?new RegExp('Immun[^\\\\]]{0,80}'+v).test(s)||(C.imm||[]).indexOf(v)>=0:k==='res'?new RegExp('Resist[^\\\\]]{0,80}'+v).test(s)||(C.res||[]).indexOf(v)>=0:new RegExp(v,'i').test(s)};
 return cases.map(([lab,rs,cls,sub,feats,ch,k,v])=>{try{const Z=window.__bldSheetFor(mk(rs,cls,sub,feats,ch),{}),
  A=window.__bldSheetFor(mk(rs,cls,sub,k==='fly'?{}:feats,{}),{});return has(Z,k,v)&&!has(A,k,v)?v:'missing (with '+has(Z,k,v)+', without '+has(A,k,v)+')'}catch(e){return 'CRASH '+e}})}"""
bad = n = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    pg.wait_for_function("window.__deferDone", timeout=120000)  # GX entries of the deferred blocks are in
    res = pg.evaluate(JS, [list(c) for c in CASES])
    for c, got in zip(CASES, res):
        ok = got == c[7]; n += 1; bad += not ok
        print("%s %s %s: %s" % ("ok  " if ok else "FAIL", c[1], c[0], "" if ok else "got %s, expected %s" % (got, c[7])))
    br.close()
print("%d checked, %d failed" % (n, bad)); sys.exit(1 if bad else 0)
