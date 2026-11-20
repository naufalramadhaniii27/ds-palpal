#!/usr/bin/env python3
"""Spell damage numbers the sheet shows, 2024 and 2014, in one browser session.
  python3 tests/spell_damage.py [--root DIR]
Checks the Spells tab numbers (window.__spCalc, the function the spell rows and the damage panel use, with the character level and
the casting modifier the sheet passes) and the cantrip attack rows (C.attacks):
  - cantrip dice by CHARACTER level 1/5/11/17, also multiclass (Fire Bolt, Ray of Frost, Chill Touch, Toll the Dead, Mind Sliver, Sacred Flame,
    Vicious Mockery, Produce Flame, Starry Wisp, Shillelagh, Booming Blade and Green-Flame Blade riders, Eldritch Blast beams)
  - Agonizing Blast, Potent Spellcasting (2024 Blessed Strikes / Elemental Fury, 2014 domains), Empowered Evocation (both editions)
  - leveled spells at their level and one slot higher (Magic Missile, Guiding Bolt, Scorching Ray, Fireball, Inflict Wounds, Hex, Hunter's Mark, Foe Slayer)
  - the cantrip row ability, and C.spellcasting.dc/.atk = 8 + PB + mod / PB + mod of the casting class (multiclass: C.spellcasting.by)
Fixed build: Human, Soldier, array STR 8 DEX 14 CON 13 INT 12 WIS 10 CHA 15 unless a case says otherwise. Exit 1 on any difference."""
import os, sys, json
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])

T = lambda lv: 4 if lv >= 17 else 3 if lv >= 11 else 2 if lv >= 5 else 1
WIS = [8, 14, 13, 12, 15, 10]; INT = [8, 14, 13, 15, 10, 12]
# case: (rule set, class, subclass, level, options, {spell: [expected parts at its level] or (parts, count, parts one slot up, count up)},
#        {attack row: (die, adds modifier, flat bonus)}). "m" in a part = the casting modifier of that spell
CASES = []
for lv in (1, 5, 11, 17):
    t = T(lv); g = "%dd8" % (t - 1)
    CASES.append(("2024", "Wizard", "", lv, {}, {"Fire Bolt": ["%dd10 Fire" % t], "Ray of Frost": ["%dd8 Cold" % t], "Chill Touch": ["%dd10 Necrotic" % t],
        "Toll the Dead": ["%dd8 Necrotic" % t, "%dd12 Necrotic" % t], "Mind Sliver": ["%dd6 Psychic" % t],
        "Booming Blade": ([g + " Thunder"] if t > 1 else []) + ["%dd8 Thunder" % t], "Green-Flame Blade": ([g + " Fire", g + "+m Fire"] if t > 1 else ["m Fire"])},
        {"Fire Bolt": ("%dd10" % t, 0, 0), "Ray of Frost": ("%dd8" % t, 0, 0), "Chill Touch": ("%dd10" % t, 0, 0), "Booming Blade": None, "Green-Flame Blade": None}))
    CASES.append(("2014", "Wizard", "", lv, {}, {"Fire Bolt": ["%dd10 Fire" % t], "Ray of Frost": ["%dd8 Cold" % t], "Chill Touch": ["%dd8 Necrotic" % t],
        "Toll the Dead": ["%dd8 Necrotic" % t, "%dd12 Necrotic" % t], "Booming Blade": ([g + " Thunder"] if t > 1 else []) + ["%dd8 Thunder" % t]},
        {"Fire Bolt": ("%dd10" % t, 0, 0), "Chill Touch": ("%dd8" % t, 0, 0), "Booming Blade": None}))
    CASES.append(("2024", "Druid", "", lv, {"arr": WIS, "ch": {"p7opt": "Primal Strike"}}, {"Shillelagh": ["%s+m Force|Bludgeoning" % ["1d8", "1d10", "1d12", "2d6"][t - 1]],
        "Produce Flame": ["%dd8 Fire" % t], "Starry Wisp": ["%dd8 Radiant" % t]}, {"Produce Flame": ("%dd8" % t, 0, 0), "Starry Wisp": ("%dd8" % t, 0, 0)}))
    CASES.append(("2014", "Druid", "", lv, {"arr": WIS}, {"Shillelagh": ["1d8+m Bludgeoning"], "Produce Flame": ["%dd8 Fire" % t]}, {"Produce Flame": ("%dd8" % t, 0, 0)}))
    CASES.append(("2024", "Cleric", "", lv, {"arr": WIS, "ch": {"p7opt": "Divine Strike"}}, {"Sacred Flame": ["%dd8 Radiant" % t]}, {}))
    CASES.append(("2024", "Bard", "", lv, {}, {"Vicious Mockery": ["%dd6 Psychic" % t]}, {}))
    CASES.append(("2014", "Bard", "", lv, {}, {"Vicious Mockery": ["%dd4 Psychic" % t]}, {}))
for lv in (2, 5, 11, 17):
    for rs in ("2024", "2014"):
        CASES.append((rs, "Warlock", "", lv, {"ch": {"invab": ["Eldritch Blast"], "p2invocation": ["Agonizing Blast", "Repelling Blast"]}},
                      {"Eldritch Blast": (["1d10+m Force"], T(lv), None, None)}, {"Eldritch Blast": ("1d10", 1, 0, T(lv))}))
        CASES.append((rs, "Warlock", "", lv, {"ch": {"invab": [], "p2invocation": ["Repelling Blast", "Devil's Sight"]}}, {"Eldritch Blast": (["1d10 Force"], T(lv), None, None)}, {"Eldritch Blast": ("1d10", 0, 0, T(lv))}))
# multiclass: cantrip dice follow the character level, each class casts with its own ability
CASES += [
    ("2024", "Fighter", "", 4, {"mc": [{"cls": "Wizard", "lv": 1, "sub": ""}]}, {"Fire Bolt": ["2d10 Fire"]}, {"Fire Bolt": ("2d10", 0, 0)}),
    ("2014", "Fighter", "", 10, {"mc": [{"cls": "Wizard", "lv": 1, "sub": ""}]}, {"Fire Bolt": ["3d10 Fire"]}, {"Fire Bolt": ("3d10", 0, 0)}),
    ("2024", "Cleric", "", 3, {"arr": WIS, "mc": [{"cls": "Sorcerer", "lv": 2, "sub": ""}]}, {"Sacred Flame": ["2d8 Radiant"], "Fire Bolt": ["2d10 Fire"]}, {"Fire Bolt": ("2d10", 0, 0)}),
    ("2014", "Warlock", "", 2, {"mc": [{"cls": "Wizard", "lv": 3, "sub": ""}], "ch": {"invab": ["Eldritch Blast"], "p2invocation": ["Agonizing Blast", "Repelling Blast"]}},
     {"Eldritch Blast": (["1d10+m Force"], 2, None, None), "Fire Bolt": ["2d10 Fire"]}, {"Eldritch Blast": ("1d10", 1, 0, 2), "Fire Bolt": ("2d10", 0, 0)}),
    # Potent Spellcasting and Empowered Evocation
    ("2024", "Cleric", "", 7, {"arr": WIS, "ch": {"p7opt": "Potent Spellcasting"}}, {"Sacred Flame": ["2d8+m Radiant"], "Toll the Dead": ["2d8+m Necrotic", "2d12+m Necrotic"]}, {}),
    ("2024", "Druid", "", 7, {"arr": WIS, "ch": {"p7opt": "Potent Spellcasting"}}, {"Produce Flame": ["2d8+m Fire"]}, {"Produce Flame": ("2d8", 0, "m")}),
    ("2014", "Cleric", "Grave Domain (2014)", 8, {"arr": WIS}, {"Sacred Flame": ["2d8+m Radiant"], "Toll the Dead": ["2d8+m Necrotic", "2d12+m Necrotic"]}, {}),
    ("2014", "Cleric", "Grave Domain (2014)", 7, {"arr": WIS}, {"Sacred Flame": ["2d8 Radiant"]}, {}),
    ("2024", "Wizard", "Evoker", 10, {"arr": INT}, {"Fire Bolt": ["2d10+m Fire"], "Fireball": (["8d6+m Fire"], 0, ["9d6+m Fire"], 0), "Ray of Frost": ["2d8+m Cold"]}, {"Fire Bolt": ("2d10", 1, 0)}),
    ("2014", "Wizard", "School of Evocation", 10, {"arr": INT}, {"Fire Bolt": ["2d10+m Fire"], "Fireball": (["8d6+m Fire"], 0, ["9d6+m Fire"], 0)}, {"Fire Bolt": ("2d10", 1, 0)}),
    ("2014", "Wizard", "School of Evocation", 9, {"arr": INT}, {"Fire Bolt": ["2d10 Fire"]}, {"Fire Bolt": ("2d10", 0, 0)}),
    # leveled spells: base and one slot higher
    ("2024", "Wizard", "", 5, {}, {"Magic Missile": (["1d4+1 Force"], 3, ["1d4+1 Force"], 4), "Scorching Ray": (["2d6 Fire"], 3, ["2d6 Fire"], 4), "Fireball": (["8d6 Fire"], 0, ["9d6 Fire"], 0)}, {}),
    ("2014", "Wizard", "", 5, {}, {"Magic Missile": (["1d4+1 Force"], 3, ["1d4+1 Force"], 4), "Scorching Ray": (["2d6 Fire"], 3, ["2d6 Fire"], 4), "Fireball": (["8d6 Fire"], 0, ["9d6 Fire"], 0)}, {}),
    ("2024", "Cleric", "", 3, {"arr": WIS}, {"Guiding Bolt": (["4d6 Radiant"], 0, ["5d6 Radiant"], 0), "Inflict Wounds": (["2d10 Necrotic"], 0, ["3d10 Necrotic"], 0)}, {}),
    ("2014", "Cleric", "", 3, {"arr": WIS}, {"Guiding Bolt": (["4d6 Radiant"], 0, ["5d6 Radiant"], 0), "Inflict Wounds": (["3d10 Necrotic"], 0, ["4d10 Necrotic"], 0)}, {}),
    ("2024", "Warlock", "", 3, {}, {"Hex": ["1d6 Necrotic"]}, {}), ("2014", "Warlock", "", 3, {}, {"Hex": ["1d6 Necrotic"]}, {}),
    ("2024", "Ranger", "", 19, {"arr": WIS}, {"Hunter's Mark": ["1d6 Force"]}, {}), ("2024", "Ranger", "", 20, {"arr": WIS}, {"Hunter's Mark": ["1d10 Force"]}, {}),
    ("2014", "Ranger", "", 20, {"arr": WIS}, {"Hunter's Mark": ["1d6 Weapon"]}, {}),
    # 2014 Potent Spellcasting reaches only Cleric cantrips: a Wizard cantrip row of a Cleric/Wizard gets no Wis (2024 Potent the same)
    ("2014", "Cleric", "Grave Domain (2014)", 8, {"arr": WIS, "mc": [{"cls": "Wizard", "lv": 2, "sub": ""}]}, {"Sacred Flame": ["2d8+m Radiant"], "Fire Bolt": ["2d10 Fire"]}, {"Fire Bolt": ("2d10", 0, 0)}),
    ("2024", "Cleric", "", 7, {"arr": WIS, "ch": {"p7opt": "Potent Spellcasting"}, "mc": [{"cls": "Wizard", "lv": 2, "sub": ""}]}, {"Sacred Flame": ["2d8+m Radiant"], "Fire Bolt": ["2d10 Fire"]}, {"Fire Bolt": ("2d10", 0, 0)}),
]
# Shillelagh toggle (fx toggle "shillelagh"): Club and Quarterstaff rows (die, ability, type). Off, or without the spell, the rows stay as they are
SH = lambda d, ab, t: {"Club": (d, ab, t), "Quarterstaff": (d, ab, t)}
for lv in (1, 5, 11, 17):
    CASES.append(("2024", "Druid", "", lv, {"arr": WIS, "tg": {"shillelagh": True}, "wrow": SH(["1d8", "1d10", "1d12", "2d6"][T(lv) - 1], "WIS", "Force or Bludgeoning")}, {"Shillelagh": None}, {}))
    CASES.append(("2014", "Druid", "", lv, {"arr": WIS, "tg": {"shillelagh": True}, "wrow": SH("1d8", "WIS", "Bludgeoning"), "magic": 1}, {"Shillelagh": None}, {}))
for rs in ("2024", "2014"):
    CASES.append((rs, "Druid", "", 5, {"arr": WIS, "tg": {"shillelagh": False}, "wrow": {"Club": ("1d4", "STR", "Bludgeoning"), "Quarterstaff": ("1d6", "STR", "Bludgeoning")}}, {"Shillelagh": None}, {}))
    CASES.append((rs, "Druid", "", 5, {"arr": WIS, "tg": {"shillelagh": True}, "wrow": {"Club": ("1d4", "STR", "Bludgeoning")}}, {"Produce Flame": None}, {}))

JS = """(cases)=>{const md=s=>Math.floor((s-10)/2);return cases.map(([rs,cls,sub,lv,o,sps,rows])=>{try{
  const e=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true,tce:true,xge:true,scag:true}}:{sp:'Human',bg:'Soldier',src:{tce:true,xge:true,scag:true}};
  const b=window.__bldFuzz({rs,cls,sub,lv,arr:o.arr||[8,14,13,12,10,15],b2:0,b1:0,sp:e.sp,bg:e.bg,src:e.src}).b;b.src=Object.assign({},b.src,e.src);
  if(o.ch)b.ch=Object.assign({},b.ch,o.ch);if(o.mc)b.mc=o.mc;b.sp=Object.keys(sps);
  const t=window.__bldTestB();Object.assign(t,b);delete t.unset;if(o.wrow){t.inv=(b.inv||[]).map(x=>Object.assign({},x,{eq:false}));Object.keys(o.wrow).forEach(n=>t.inv.push({n,q:1,eq:true}))}
  const C=window.__bldSheetFor(t,o.tg),sc=C.spellcasting||{},pb=Math.ceil(C.level/4)+1;
  const M={};Object.keys(C.abilities).forEach(k=>{const A=C.abilities[k];M[k]=md(A.base+(A.bonus||[]).reduce((s,x)=>s+x.v,0))});
  const by=sc.by||[{ab:sc.ab,dc:sc.dc,atk:sc.atk}],sp={};
  (C.spells||[]).forEach(s=>{if(!(s.n in sps))return;const ab=s.ab||sc.ab,f=lv2=>{const c=window.__spCalc(s,lv2,C.level,M[ab]);return c?[c.parts.map(p=>p.d+' '+p.t),c.n]:[[],0]};
   sp[s.n]={ab,m:M[ab],at:f(s.l),up:s.l?f(s.l+1):null}});
  const at={};C.attacks.forEach(r=>{if(r.n in rows)at[r.n]={die:r.die,nomod:!!r.nomod,b:r.dmgBonus||0,ab:r.ab,m:M[r.ab],sub:r.sub||''}});
  const wr={};C.attacks.forEach(r=>{if(o.wrow&&r.n in o.wrow)wr[r.n]={v:[r.die,r.ab,r.type],mg:/magical/.test(r.note||'')}});
  return {lvl:C.level,pb,M,by,sp,at,wr}}catch(err){return {err:String(err.stack||err)}}})}"""

def fill(parts, m): return [p.replace("+m", "%+d" % m if m else "").replace("m ", "%d " % m) if "m" in p.split(" ")[0] else p for p in parts]

def main():
    bad = []; n = 0
    def chk(lab, want, got):
        nonlocal n; n += 1
        if want != got: bad.append("%s: expected %r got %r" % (lab, want, got))
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(120000)
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
        for _ in range(600):
            if pg.evaluate("()=>typeof window.__bldFuzz==='function'&&typeof window.__spCalc==='function'"): break
            pg.wait_for_timeout(100)
        res = pg.evaluate(JS, [list(c) for c in CASES]); br.close()
    for c, r in zip(CASES, res):
        rs, cls, sub, lv, o, sps, rows = c; tag = "%s %s%s %d%s" % (rs, cls, " " + sub if sub else "", lv, " +" + "/".join("%s %d" % (m["cls"], m["lv"]) for m in o.get("mc", [])) if o.get("mc") else "")
        if "err" in r: bad.append(tag + ": build error " + r["err"][:300]); continue
        for b in r["by"]:  # the casting numbers the rows use
            m = r["M"][b["ab"]]; chk(tag + " DC " + b["ab"], 8 + r["pb"] + m, b["dc"]); chk(tag + " attack " + b["ab"], r["pb"] + m, b["atk"])
        for name, want in o.get("wrow", {}).items():
            w = r["wr"].get(name)
            if not w: bad.append("%s %s: no attack row" % (tag, name)); continue
            chk(tag + " " + name + " row (die, ability, type)" + (" toggle " + str(o["tg"]) if "tg" in o else ""), list(want), w["v"])
            if "magic" in o: chk(tag + " " + name + " magical", True, w["mg"])
        for name, want in sps.items():
            if want is None: continue
            s = r["sp"].get(name)
            if not s: bad.append("%s %s: not on the spell list" % (tag, name)); continue
            w = want if isinstance(want, tuple) else (want, None, None, None)
            chk(tag + " " + name, fill(w[0], s["m"]), s["at"][0])
            if w[1] is not None: chk(tag + " " + name + " count", w[1], s["at"][1])
            if w[2] is not None: chk(tag + " " + name + " one slot higher", fill(w[2], s["m"]), s["up"][0])
            if w[3] is not None: chk(tag + " " + name + " count one slot higher", w[3], s["up"][1])
        for name, want in rows.items():
            a = r["at"].get(name)
            if want is None: chk(tag + " " + name + " attack row", None, a and a["die"]); continue
            if not a: bad.append("%s %s: no attack row" % (tag, name)); continue
            sab = (r["sp"].get(name) or {}).get("ab")
            chk(tag + " " + name + " row ability", sab, a["ab"])
            mb = a["m"] if want[2] == "m" else want[2]
            chk(tag + " " + name + " row damage", (want[0], a["m"] if want[1] else 0, mb), (a["die"], 0 if a["nomod"] else a["m"], a["b"]))
            if len(want) > 3: chk(tag + " " + name + " beams", "%d beam" % want[3], (a["sub"].split("• ")[1:] or [""])[0].rstrip("s"))
    print("spell_damage: %d builds, %d values checked, %d wrong" % (len(CASES), n, len(bad)))
    for x in bad[:80]: print("  " + x)
    sys.exit(1 if bad else 0)

main()
