#!/usr/bin/env python3
"""Multiclass feature interactions on the computed sheet, 2024 and 2014 rules, one browser session.
  python3 tests/multiclass_numbers.py [-v]
Main class b.level, others in b.mc. Checks: Proficiency Bonus by total level, one Hit Dice row per die size, class resources by
that class's own level (Rage, Focus/Ki, Sorcery Points, Lay on Hands, Wild Shape, Channel Divinity, Sneak Attack), class table
columns of a multiclass part (Inspiration Die, Martial Arts Die, Rage Damage), Pact Magic slots apart from Spellcasting slots
(Warlock levels not in the caster level), cantrips and prepared or known spells per class, cantrip damage by character level,
attacks per Attack action (Extra Attack and Thirsting Blade never stack). 2014 Channel Divinity from Cleric and Paladin is one
pool (PHB 2014 p. 164); 2024 keeps one row per class. Slot tables are in tests/class_resources.py. Exit 1 on any difference."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# [rs, main, lv, sub, [(cls, sub, lv)], expect]; expect keys: res {name: max} (None = absent), hd {die: n}, slots, pact [n, lvl],
# sp {cls: [cantrips, prepared/known]}, sneak, tab {column: value}, apa (attacks per Attack action), cdRows, fire (Fire Bolt dice)
J = [
 ["2024", "Paladin", 6, "Oath of Devotion", [("Sorcerer", "Draconic Sorcery", 6)], dict(res={"Lay on Hands": 30, "Sorcery Points": 6, "Channel Divinity": 2}, hd={10: 6, 6: 6}, slots=[4, 3, 3, 3, 1], pact=None, sp={"Paladin": [0, 6], "Sorcerer": [5, 10]}, apa=2)],
 ["2024", "Fighter", 2, "", [("Warlock", "Fiend Patron", 3), ("Rogue", "Thief", 3)], dict(hd={10: 2, 8: 6}, slots=[], pact=[2, 2], sneak="2d6", sp={"Warlock": [2, 4]}, apa=1)],
 ["2024", "Cleric", 1, "", [("Wizard", "Evoker", 9)], dict(hd={8: 1, 6: 9}, slots=[4, 3, 3, 3, 2], sp={"Cleric": [3, 4], "Wizard": [4, 14]}, fire="2d10")],
 ["2024", "Monk", 5, "Warrior of the Open Hand", [("Rogue", "Thief", 5)], dict(res={"Focus Points": 5}, hd={8: 10}, sneak="3d6", apa=2)],
 ["2024", "Barbarian", 5, "Path of the Berserker", [("Druid", "Circle of the Land", 5)], dict(res={"Rage": 3, "Wild Shape": 2}, hd={12: 5, 8: 5}, slots=[4, 3, 2], sp={"Druid": [3, 9]}, apa=2)],
 ["2024", "Bard", 6, "", [("Warlock", "Fiend Patron", 2)], dict(slots=[4, 3, 3], pact=[2, 1], sp={"Bard": [3, 10], "Warlock": [2, 3]}, tab={"Inspiration Die": "d8"})],
 ["2024", "Fighter", 5, "Champion", [("Paladin", "Oath of Devotion", 5)], dict(res={"Lay on Hands": 25}, apa=2)],
 ["2024", "Fighter", 11, "Champion", [("Wizard", "Evoker", 1)], dict(slots=[2], apa=3)],
 ["2024", "Fighter", 5, "Champion", [("Warlock", "Fiend Patron", 5)], dict(slots=[], pact=[2, 3], sp={"Warlock": [3, 6]}, apa=2)],
 ["2024", "Warlock", 2, "", [("Bard", "College of Lore", 10)], dict(slots=[4, 3, 3, 3, 2], pact=[2, 1], sp={"Warlock": [2, 3], "Bard": [4, 15]}, tab={"Inspiration Die": "d10"})],
 ["2024", "Rogue", 1, "", [("Monk", "Warrior of the Open Hand", 11)], dict(res={"Focus Points": 11}, sneak="1d6", tab={"Martial Arts Die": "d10"}, apa=2)],
 ["2024", "Wizard", 1, "", [("Barbarian", "Path of the Berserker", 6)], dict(res={"Rage": 4}, hd={6: 1, 12: 6}, slots=[2], tab={"Rage Damage": "2"})],
 ["2024", "Wizard", 1, "", [("Druid", "Circle of the Land", 6)], dict(res={"Wild Shape": 3}, slots=[4, 3, 3, 1], sp={"Wizard": [3, 4], "Druid": [3, 10]})],
 ["2024", "Ranger", 5, "Hunter", [("Rogue", "Thief", 5)], dict(res={"Favored Enemy": 3}, slots=[4, 2], sneak="3d6", sp={"Ranger": [0, 6]}, apa=2)],
 ["2024", "Wizard", 1, "", [("Cleric", "Life Domain", 2), ("Paladin", "Oath of Devotion", 3)], dict(hd={6: 1, 8: 2, 10: 3}, slots=[4, 3, 2], cdRows=2, res={"Lay on Hands": 15})],
 ["2024", "Wizard", 12, "Evoker", [("Cleric", "", 1)], dict(slots=[4, 3, 3, 3, 2, 1, 1], fire="3d10")],
 ["2014", "Paladin", 6, "Oath of Devotion (2014)", [("Sorcerer", "Draconic Bloodline", 6)], dict(res={"Lay on Hands": 30, "Sorcery Points": 6, "Channel Divinity": 1}, slots=[4, 3, 3, 3, 1], sp={"Paladin": [0, 2], "Sorcerer": [5, 7]}, apa=2)],
 ["2014", "Cleric", 6, "Life Domain (2014)", [("Paladin", "Oath of Devotion (2014)", 6)], dict(res={"Channel Divinity": 2, "Lay on Hands": 30}, cdRows=1, slots=[4, 3, 3, 3, 1])],
 ["2014", "Wizard", 1, "", [("Cleric", "Life Domain (2014)", 2), ("Paladin", "Oath of Devotion (2014)", 3)], dict(res={"Channel Divinity": 1, "Lay on Hands": 15}, cdRows=1, slots=[4, 3])],
 ["2014", "Paladin", 3, "Oath of Devotion (2014)", [("Cleric", "Life Domain (2014)", 6)], dict(res={"Channel Divinity": 2}, cdRows=1)],
 ["2014", "Fighter", 11, "Champion (2014)", [("Monk", "Way of Shadow", 3)], dict(res={"Ki Points": 3}, hd={10: 11, 8: 3}, apa=3)],
 ["2014", "Monk", 5, "Way of Shadow", [("Rogue", "Thief (2014)", 5)], dict(res={"Ki Points": 5}, hd={8: 10}, sneak="3d6", tab={"Martial Arts Die": "d6"})],
 ["2014", "Rogue", 1, "", [("Monk", "Way of Shadow", 11)], dict(res={"Ki Points": 11}, sneak="1d6", tab={"Martial Arts Die": "d8"})],
 ["2014", "Fighter", 2, "", [("Warlock", "The Fiend (2014)", 3), ("Rogue", "Thief (2014)", 3)], dict(slots=[], pact=[2, 2], sneak="2d6", sp={"Warlock": [2, 4]})],
 ["2014", "Cleric", 1, "Life Domain (2014)", [("Wizard", "School of Evocation", 9)], dict(slots=[4, 3, 3, 3, 2], sp={"Cleric": [3, 1], "Wizard": [4, 10]}, fire="2d10")],
 ["2014", "Barbarian", 5, "Path of the Berserker (2014)", [("Druid", "Circle of the Land (2014)", 5)], dict(res={"Rage": 3, "Wild Shape": 2}, slots=[4, 3, 2], sp={"Druid": [3, 5]})],
 ["2014", "Bard", 6, "College of Lore (2014)", [("Warlock", "The Fiend (2014)", 2)], dict(slots=[4, 3, 3], pact=[2, 1], sp={"Bard": [3, 11], "Warlock": [2, 3]}, tab={"Inspiration Die": "d8"})],
 ["2014", "Warlock", 2, "", [("Bard", "College of Lore (2014)", 10)], dict(slots=[4, 3, 3, 3, 2], pact=[2, 1], sp={"Warlock": [2, 3], "Bard": [4, 16]}, tab={"Inspiration Die": "d10"})],
 ["2014", "Wizard", 1, "", [("Barbarian", "Path of the Berserker (2014)", 9)], dict(res={"Rage": 4}, tab={"Rage Damage": "3"})],
 ["2014", "Ranger", 5, "Hunter (2014)", [("Rogue", "Thief (2014)", 5)], dict(slots=[4, 2], sneak="3d6", sp={"Ranger": [0, 4]}, apa=2)],
 ["2014", "Fighter", 1, "", [("Paladin", "Oath of Devotion (2014)", 6)], dict(res={"Lay on Hands": 30, "Channel Divinity": 1}, slots=[4, 2], sp={"Paladin": [0, 2]})],
]

JS = r"""(J)=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const R={'2014':['Human (2014)','Soldier (2014)'],'2024':['Human','Soldier']};
const APA={'Extra Attack':2,'Two Extra Attacks':3,'Three Extra Attacks':4,'Extra Attack (2)':3,'Extra Attack (3)':4,'Thirsting Blade':2,'Devouring Blade':3};
return J.map(([rs,cls,lv,sub,mc])=>{const b=window.__bldFuzz({sp:R[rs][0],bg:R[rs][1],rs,src:all,cls,sub,lv,arr:[15,14,13,12,10,8],b2:0,b1:0}).b;if(!b)return {err:'no build'};
 if(rs==='2024')b.ch.spfeat='Crafter';b.mc=mc.map(([c,s,l])=>({cls:c,sub:s,lv:l}));
 const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);window.__sheetApply(C,false);const D=JSON.parse(JSON.stringify(window.__D()));
 window.__bldTestSet(b);const sp={};window.__bldSpCnt().forEach(x=>{sp[x.cls]=[x.ct,x.pr]});window.__bldTestSet(null);
 const res={},hd={},tab={};let cdRows=0,apa=1;(C.res||[]).forEach(r=>{if(r.k==='hd'||/^Hit Dice/.test(r.n))hd[r.die]=(hd[r.die]||0)+r.max;else res[r.n]=r.max;if(r.n==='Channel Divinity')cdRows++});
 (C.features||[]).forEach(g=>(g.items||[]).forEach(i=>{if(/table$/.test(i.s||''))tab[i.n]=(i.d||'').replace(/^At level \d+: /,'').replace(/\.$/,'');if(APA[i.n])apa=Math.max(apa,APA[i.n])}));
 const sn=(C.xdmg||[]).find(x=>x.n==='Sneak Attack'),sc=C.spellcasting||{};let fire=null;try{const f=window.__spCalc({n:'Fire Bolt',l:0},0,D.level,0);fire=f&&f.parts[0]&&f.parts[0].d}catch(e){}
 return {pb:D.pb,lvl:D.level,res,hd,tab,cdRows,apa,sp,slots:sc.slots||[],pact:sc.pact?[sc.pact.n,sc.pact.lvl]:null,sneak:sn?sn.dmg:null,fire}})}"""

rows, bad = [], 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'&&typeof window.__bldSpCnt==='function'")
    out = pg.evaluate(JS, [j[:5] for j in J]); br.close()
for j, g in zip(J, out):
    rs, cls, lv, sub, mc, e = j; tl = lv + sum(m[2] for m in mc); lab = "%s %s%d/%s" % (rs, cls, lv, "/".join("%s%d" % (m[0], m[2]) for m in mc))
    if "err" in g: rows.append((lab + " build", "ok", g["err"])); continue
    rows.append((lab + " PB", 2 + (tl - 1) // 4, g["pb"]))
    for k, v in e.get("res", {}).items(): rows.append((lab + " res " + k, v, g["res"].get(k)))
    for k, v in e.get("hd", {}).items(): rows.append((lab + " Hit Dice d%d" % k, v, g["hd"].get(str(k))))
    rows.append((lab + " Hit Dice total", tl, sum(g["hd"].values())))
    for k, v in e.get("sp", {}).items(): rows.append((lab + " spells " + k + " [cantrips, prepared]", v, g["sp"].get(k)))
    for k, v in e.get("tab", {}).items(): rows.append((lab + " table " + k, v, g["tab"].get(k)))
    for k in ("slots", "pact", "sneak", "apa", "cdRows", "fire"):
        if k in e: rows.append((lab + " " + k, e[k], g[k]))
for lab, want, got in rows:
    ok = want == got; bad += not ok
    if not ok or "-v" in sys.argv: print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("multiclass_numbers: %d combos, %d values, %d wrong" % (len(J), len(rows), bad)); sys.exit(1 if bad or not rows else 0)
