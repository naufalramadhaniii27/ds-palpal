#!/usr/bin/env python3
"""Training Ground combatant = computed sheet, rules 2024 and 2014, one browser session.  python3 tests/tg_numbers.py [-v]
Each character is built by the builder (__bldFuzz, Human Soldier unless named), applied to the sheet, then turned into a Training Ground
player character (window.__app.tgPcFor, src/app/52-tg-bridge.js) and into a combatant (TGE.fromSheet, src/tg/20-engine.js, run in Node).
Checked against the sheet: AC, Hit Point maximum, Initiative, Speed, saves, every attack row (bonus, damage dice, damage type), spell
save DC and spell attack. Checked against the rules (fixed numbers below): attacks per Attack action (Extra Attack and Thirsting Blade never
add up), cantrip dice by character level, Eldritch Blast beams, damage Resistances, a 2014 Dragonborn Breath Weapon as a save action.
Riders the Training Ground does not run (Sneak Attack, Divine Smite, Rage damage, weapon riders such as Flame Tongue) stay out. Exit 1 on any difference."""
import json, os, subprocess, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILL = ["Boots of Speed", "Cloak of Displacement", "Amulet of Health"]
# [label, rs, class, level, subclass, multiclass [(cls, sub, lv)], species or "", inventory or None, expect]
# expect: apa (attacks per Attack action), res (damage Resistances), ac, row {attack row: [hit, dice]}, spell {cantrip: dice at level 0}, save {name: [dc, sv, dice]}
J = [
 ["Fighter 5 +1 sword, shield", "2024", "Fighter", 5, "Champion", [], "", ["Longsword, +1", "Shield", "Chain Mail"], dict(apa=2, res=[])],
 ["Fighter 11", "2014", "Fighter", 11, "Champion (2014)", [], "", None, dict(apa=3)],
 ["Fighter 5 Dragon Scale Mail 4th", "2024", "Fighter", 5, "Champion", [], "", FILL + ["Dragon Scale Mail"], dict(apa=2, res=[])],
 ["Monk 5", "2024", "Monk", 5, "Warrior of the Open Hand", [], "", None, dict(apa=2, row={"Unarmed Strike": [6, "1d8+3"]})],
 ["Monk 5", "2014", "Monk", 5, "Way of Shadow", [], "", None, dict(apa=2, row={"Unarmed Strike": [6, "1d6+3"]})],
 ["Barbarian 5", "2024", "Barbarian", 5, "Path of the Berserker", [], "", None, dict(apa=2, ac=13)],
 ["Barbarian 3", "2014", "Barbarian", 3, "Path of the Berserker (2014)", [], "", None, dict(apa=1)],
 ["Rogue 5", "2024", "Rogue", 5, "Thief", [], "", None, dict(apa=1)],
 ["Rogue 3", "2014", "Rogue", 3, "Thief (2014)", [], "", None, dict(apa=1)],
 ["Paladin 5 Holy Avenger", "2024", "Paladin", 5, "Oath of Devotion", [], "", ["Holy Avenger (Longsword)", "Plate Armor"], dict(apa=2, row={"Holy Avenger (Longsword)": [9, "1d8+6"]})],
 ["Paladin 5 Dragonborn", "2014", "Paladin", 5, "Oath of Devotion (2014)", [], "Dragonborn (2014)", ["Flame Tongue (Longsword)", "Shield, +1", "Plate Armor"], dict(apa=2, res=["Acid"], save={"Breath Weapon": [12, "dex", "2d6"]})],
 ["Warlock 5 Agonizing", "2024", "Warlock", 5, "Fiend Patron", [], "", None, dict(apa=1, ag=1, eb=2, arr=[8, 14, 13, 12, 10, 15])],
 ["Warlock 5", "2014", "Warlock", 5, "The Fiend (2014)", [], "", None, dict(apa=1, ag=1, eb=2, arr=[8, 14, 13, 12, 10, 15])],
 ["Wizard 5", "2024", "Wizard", 5, "Evoker", [], "", None, dict(apa=1, spell={"Fire Bolt": "2d10"})],
 ["Cleric 5", "2014", "Cleric", 5, "Life Domain (2014)", [], "", None, dict(apa=1, spell={"Sacred Flame": "2d8"})],
 ["Fighter 5 / Warlock 5", "2024", "Fighter", 5, "Champion", [("Warlock", "Fiend Patron", 5)], "", None, dict(apa=2)],
 ["Fighter 5 / Ranger 5", "2014", "Fighter", 5, "Champion (2014)", [("Ranger", "Hunter (2014)", 5)], "", None, dict(apa=2)],
 ["Wizard 1 / Cleric 4", "2024", "Wizard", 1, "", [("Cleric", "Life Domain", 4)], "", None, dict(apa=1, spell={"Fire Bolt": "2d10"})],
]

JS = r"""(J)=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
const R={'2014':['Human (2014)','Soldier (2014)'],'2024':['Human','Soldier']};
return J.map(([lab,rs,cls,lv,sub,mc,sp,inv,e])=>{try{const b=window.__bldFuzz({sp:sp||R[rs][0],bg:R[rs][1],rs,src:all,cls,sub,lv,arr:e.arr||[15,14,13,12,10,8],b2:0,b1:0}).b;if(!b)return {err:'no build'};
 if(rs==='2024')b.ch.spfeat='Crafter';b.mc=mc.map(([c,s,l])=>({cls:c,sub:s,lv:l}));if(inv)b.inv=inv.map(n=>({n,q:1,eq:true}));
 if(e.ag){const k=Object.keys(b.ch).filter(k=>/invocation$/.test(k)&&Array.isArray(b.ch[k])&&b.ch[k].length)[0];if(k&&b.ch[k].indexOf('Agonizing Blast')<0)b.ch[k][0]='Agonizing Blast';b.ch.invab=['Eldritch Blast'];}
 const t=window.__bldTestB();Object.assign(t,b);delete t.unset;const C=window.__bldSheetFor(t);window.__sheetApply(C,false);const D=JSON.parse(JSON.stringify(window.__D()));
 const sc=C.spellcasting?(window.__scAdj?window.__scAdj(C.spellcasting):C.spellcasting):null;
 return {D:{ac:D.ac,hp:D.hpmax,init:D.init,speed:D.speed,save:D.save,atk:D.atk,mod:D.mod},att:(C.attacks||[]).map(a=>({n:a.n,type:a.type,sub:a.sub||''})),sc,def:C.defenses||[],xdmg:C.xdmg||[],pc:window.__app.tgPcFor(C)}}catch(x){return {err:String(x&&x.stack||x)}}})}"""

with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(300000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'&&window.__app&&typeof window.__app.tgPcFor==='function'")
    out = pg.evaluate(JS, J); br.close()

# the combatant itself: the engine's fromSheet in Node (the same module the page loads)
node = "const T=require(process.argv[1]);let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{console.log(JSON.stringify(JSON.parse(s).map(p=>p?T.fromSheet(p,'pc',[0,0]):null)))})"
units = json.loads(subprocess.run(["node", "-e", node, os.path.join(ROOT, "src/tg/20-engine.js")], input=json.dumps([g.get("pc") for g in out]), capture_output=True, text=True, check=True).stdout)

def dice(s): return ((__import__("re").match(r"[\dd+-]+", str(s).replace("−", "-").replace(" ", "")) or [""])[0]).rstrip("+-")
rows, bad, n = [], 0, 0
for j, g, u in zip(J, out, units):
    lab = "%s %s" % (j[1], j[0]); e = j[8]
    if "err" in g or not g.get("pc"): rows.append((lab + " build", "ok", g.get("err", "no Training Ground character"))); continue
    D, pc = g["D"], g["pc"]
    rows += [(lab + " AC", D["ac"], u["ac"]), (lab + " HP max", D["hp"], u["max"]), (lab + " HP now", D["hp"], u["hp"]), (lab + " Initiative", D["init"], u["ini"]),
             (lab + " Speed", int(str(D["speed"]).split()[0]), u["sp"]["walk"])]
    for k, v in (D["save"] or {}).items(): rows.append((lab + " save " + k, v, u["sv"][k.lower()]))
    acts = {a["n"]: a for a in u["acts"]}
    for a, d in zip(g["att"], D["atk"] or []):
        if not d or d.get("hit") is None: continue
        t = acts.get(a["n"]); want = [d["hit"], dice(d["dmg"]), a["type"].split(" ")[0].split(",")[0]]
        rows.append((lab + " row " + a["n"], want, t and [t["hit"], t["dmg"][0][1], t["dmg"][0][2]]))
        if a["n"] in e.get("row", {}): rows.append((lab + " rules " + a["n"], e["row"][a["n"]], t and [t["hit"], t["dmg"][0][1]]))
        if a["n"] == "Eldritch Blast" and "eb" in e:
            bm = [x for x in u["acts"] if x.get("k") == "multi" and x["ma"][0][0] == "Eldritch Blast"]
            rows.append((lab + " Eldritch Blast beams", e["eb"], bm and bm[0]["ma"][0][1]))
            rows.append((lab + " Agonizing Blast", "1d10%+d" % D["mod"]["CHA"], t and t["dmg"][0][1]))
    multi = [a for a in u["acts"] if a.get("k") == "multi" and a["n"].startswith("Attack (")]
    rows.append((lab + " attacks per Attack action", e.get("apa", 1), multi[0]["ma"][0][1] if multi else 1))
    if multi: rows.append((lab + " Attack lists every weapon", sorted(a["n"] for a, d in zip(g["att"], D["atk"] or []) if d and d.get("hit") is not None and not a["sub"].startswith("Cantrip")), sorted(multi[0]["ma"][0][0].split("|"))))
    if g["sc"]:
        rows.append((lab + " spell save DC", g["sc"]["dc"], u["sdc"])); rows.append((lab + " spell attack", g["sc"]["atk"], u["satk"]))
    for k, v in e.get("spell", {}).items():
        s = [x for x in u["spells"] if x["n"] == k]; rows.append((lab + " cantrip " + k, v, s and s[0]["by"]["0"][0][1].split("+")[0]))
    if "res" in e: rows.append((lab + " Resistance", e["res"], sorted(x.capitalize() for x in u["res"].split(" | ") if x)))
    for k, v in e.get("save", {}).items():
        a = acts.get(k); rows.append((lab + " save action " + k, v, a and [a["dc"], a["sv"], a["dmg"][0][1]]))
    if "ac" in e: rows.append((lab + " rules AC", e["ac"], u["ac"]))
for lab, want, got in rows:
    ok = want == got; bad += not ok; n += 1
    if not ok or "-v" in sys.argv: print(("ok   " if ok else "DIFF ") + lab + ": sheet/rules " + json.dumps(want) + ", Training Ground " + json.dumps(got))
print("tg_numbers: %d characters, %d checks, %d differences" % (len(J), n, bad))
sys.exit(1 if bad else 0)
