#!/usr/bin/env python3
"""Class table numbers on the computed sheet, 13 core classes (Artificer: EFotA 2024, TCE 2014), levels 1 to 20, both rule sets.
  python3 tests/class_resources.py [--root DIR]
Builds every class at every level with window.__bldFuzz (Human, Soldier, array 15 14 13 12 10 8 in STR..CHA order, so CHA, WIS, INT
modifiers are small and fixed) and compares with tables written here from the 2024 PHB / EFotA and the 2014 PHB / TCE:
resource maxima (c.res), class table columns (Rage Damage, Inspiration Die, Martial Arts Die, Infusions), spell slots, pact slots,
Sneak Attack (xdmg), Superiority Dice, speed, prepared or known spells and cantrips. Exit 1 on any difference."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return "http://127.0.0.1:%d/index.html" % p

SUB = {"2024": {"Barbarian": "Path of the Berserker", "Bard": "College of Dance", "Cleric": "Life Domain", "Druid": "Circle of the Land",
                "Fighter": "Battle Master", "Monk": "Warrior of Mercy", "Paladin": "Oath of Devotion", "Ranger": "Beast Master",
                "Rogue": "Arcane Trickster", "Sorcerer": "Aberrant Sorcery", "Warlock": "Archfey Patron", "Wizard": "Abjurer", "Artificer": "Alchemist"},
       "2014": {"Barbarian": "Path of the Berserker (2014)", "Bard": "College of Lore (2014)", "Cleric": "Knowledge Domain (2014)",
                "Druid": "Circle of the Land (2014)", "Fighter": "Battle Master (2014)", "Monk": "Way of Shadow", "Paladin": "Oath of Devotion (2014)",
                "Ranger": "Beast Master (2014)", "Rogue": "Arcane Trickster (2014)", "Sorcerer": "Draconic Bloodline", "Warlock": "The Archfey (2014)",
                "Wizard": "School of Abjuration", "Artificer": "Alchemist"}}

JS = """(o)=>{const out=[];for(const [rs,cls,sub] of o){const a=rs=='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true,tce:true}}:{sp:'Human',bg:'Soldier',src:{efa:true}};
 for(let lv=1;lv<=20;lv++){let r;try{r=window.__bldFuzz(Object.assign(a,{rs,cls,sub,lv,arr:[15,14,13,12,10,8],b2:0,b1:0}))}catch(e){r={err:String(e)}}
  if(r.err){out.push({rs,cls,lv,err:String(r.err)});continue}const c=r.c,sc=c.spellcasting||{},res={},tab={},u={};
  (c.res||[]).forEach(x=>{res[x.n]=x.max});
  (c.features||[]).forEach(g=>(g.items||[]).forEach(i=>{if(/table/.test(i.s||''))tab[i.n]=(i.d||'').replace(/^At level \\d+: /,'').replace(/\\.$/,'');
   const m=/Superiority Dice \\((d\\d+)\\)/.exec(i.d||'');if(m)tab.SupDie=m[1]}));
  (c.spells||[]).forEach(s=>{const k=(s.l?'L:':'C:')+s.use;u[k]=(u[k]||0)+1});
  const sn=(c.xdmg||[]).filter(x=>x.n=='Sneak Attack')[0];
  out.push({rs,cls,lv,res,tab,u,slots:sc.slots||[],pact:sc.pact||null,speed:c.speed,sneak:sn?sn.dmg:null})}}return out}"""

def T(*runs):  # T((n, v), ...) -> per-level list: value v from level n on
    o = [None] * 20
    for n, v in runs:
        for i in range(n - 1, 20): o[i] = v
    return o

FULL = [[2], [3], [4, 2], [4, 3], [4, 3, 2], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 2], [4, 3, 3, 3, 1], [4, 3, 3, 3, 2], [4, 3, 3, 3, 2, 1], [4, 3, 3, 3, 2, 1],
        [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 2, 1, 1, 1, 1],
        [4, 3, 3, 3, 3, 1, 1, 1, 1], [4, 3, 3, 3, 3, 2, 1, 1, 1], [4, 3, 3, 3, 3, 2, 2, 1, 1]]
def half(lv, at1): return FULL[(lv + 1) // 2 - 1] if (lv >= 2 or at1) else []  # 2024 Paladin/Ranger and Artificer cast at level 1
def third(lv): return [[], [], [2], [3], [3], [3], [4, 2], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1]][lv - 1]
PACT = [(1, 1), (2, 1), (2, 2), (2, 2), (2, 3), (2, 3), (2, 4), (2, 4), (2, 5), (2, 5), (3, 5), (3, 5), (3, 5), (3, 5), (3, 5), (3, 5), (4, 5), (4, 5), (4, 5), (4, 5)]
P24 = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22]  # 2024 Bard, Cleric, Druid, Wizard 1-15 (Wizard differs later)
PH = [2, 3, 4, 5, 6, 6, 7, 7, 9, 9, 10, 10, 11, 11, 12, 12, 14, 14, 15, 15]  # 2024 Paladin, Ranger, Artificer
WL = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15]  # Warlock (both), 2014 known
AT = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]  # Arcane Trickster (both)
SNEAK = ["%dd6" % ((l + 1) // 2) for l in range(1, 21)]
MA24 = T((1, "d6"), (5, "d8"), (11, "d10"), (17, "d12")); MA14 = T((1, "d4"), (5, "d6"), (11, "d8"), (17, "d10"))
UM = [30 if l < 2 else 40 if l < 6 else 45 if l < 10 else 50 if l < 14 else 55 if l < 18 else 60 for l in range(1, 21)]
RAGE = T((1, 2), (3, 3), (6, 4), (12, 5), (17, 6)); RDMG = T((1, "2"), (9, "3"), (16, "4"))
BI = T((1, "d6"), (5, "d8"), (10, "d10"), (15, "d12"))
SUP = T((3, 4), (7, 5), (15, 6)); SUPD = T((3, "d8"), (10, "d10"), (18, "d12"))
IND = T((9, 1), (13, 2), (17, 3)); AS = T((2, 1), (17, 2))

def expect(rs, cls, lv):
    """{key: value}; key 'res:Name' (None = must be absent), 'tab:Col', 'slots', 'pact', 'speed', 'sneak', 'prep', 'can'"""
    i = lv - 1; e = {"speed": 30}; R = lambda n, v: e.__setitem__("res:" + n, v)
    n24 = rs == "2024"
    if cls == "Barbarian":
        R("Rage", None if (not n24 and lv == 20) else RAGE[i]); e["tab:Rage Damage"] = RDMG[i]; e["speed"] = 40 if lv >= 5 else 30
    elif cls == "Bard":
        R("Bardic Inspiration", 1); e["tab:Inspiration Die"] = BI[i]; e["slots"] = FULL[i]; e["can"] = 2 if lv < 4 else 3 if lv < 10 else 4
        e["prep"] = P24[i] if n24 else [4, 5, 6, 7, 8, 11, 12, 13, 14, 16, 17, 17, 18, 20, 21, 21, 22, 24, 24, 24][i]  # 2014: Lore +2 at 6
    elif cls == "Cleric":
        R("Channel Divinity", None if lv < 2 else (T((2, 2), (6, 3), (18, 4)) if n24 else T((2, 1), (6, 2), (18, 3)))[i])
        R("Divine Intervention", 1 if lv >= 10 else None); e["slots"] = FULL[i]; e["can"] = 3 if lv < 4 else 4 if lv < 10 else 5
        e["prep"] = P24[i] if n24 else lv  # 2014: Wis mod 0 + level
    elif cls == "Druid":
        R("Wild Shape", None if lv < 2 or (not n24 and lv == 20) else (T((2, 2), (6, 3), (17, 4))[i] if n24 else 2))
        e["slots"] = FULL[i]; e["can"] = 2 if lv < 4 else 3 if lv < 10 else 4; e["prep"] = P24[i] if n24 else lv
    elif cls == "Fighter":
        R("Second Wind", T((1, 2), (4, 3), (10, 4))[i] if n24 else 1); R("Action Surge", AS[i]); R("Indomitable", IND[i])
        R("Superiority Dice", SUP[i]); e["tab:SupDie"] = SUPD[i]
    elif cls == "Monk":
        R("Focus Points" if n24 else "Ki Points", lv if lv >= 2 else None); e["tab:Martial Arts Die"] = (MA24 if n24 else MA14)[i]; e["speed"] = UM[i]
    elif cls == "Paladin":
        R("Lay on Hands", 5 * lv); e["slots"] = half(lv, n24)
        R("Channel Divinity", None if lv < 3 else (T((3, 2), (11, 3))[i] if n24 else 1))
        e["prep"] = PH[i] if n24 else (0 if lv < 2 else max(1, lv // 2 - 1))  # 2014: Cha mod -1 + half level, min 1
    elif cls == "Ranger":
        e["slots"] = half(lv, n24); e["speed"] = 40 if n24 and lv >= 6 else 30
        if n24: R("Favored Enemy", T((1, 2), (5, 3), (9, 4), (13, 5), (17, 6))[i]); e["prep"] = PH[i]
        else: e["prep"] = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11][i]
    elif cls == "Rogue":
        e["sneak"] = SNEAK[i]; e["slots"] = third(lv); e["prep"] = AT[i]; e["can"] = 0 if lv < 3 else 2 if lv < 10 else 3  # + Mage Hand
    elif cls == "Sorcerer":
        R("Sorcery Points", lv if lv >= 2 else None); e["slots"] = FULL[i]; e["can"] = 4 if lv < 4 else 5 if lv < 10 else 6
        if n24: R("Innate Sorcery", 2); e["prep"] = [2, 4, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 17, 18, 18, 19, 20, 21, 22][i]
        else: e["prep"] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15][i]
    elif cls == "Warlock":
        n, l = PACT[i]; e["pact"] = {"n": n, "lvl": l}; R("Pact Slots (level %d)" % l, n); e["prep"] = WL[i]; e["can"] = 2 if lv < 4 else 3 if lv < 10 else 4
        if n24: R("Magical Cunning", 1 if lv >= 2 else None)
    elif cls == "Wizard":
        R("Arcane Recovery", 1); e["slots"] = FULL[i]; e["can"] = 3 if lv < 4 else 4 if lv < 10 else 5
        e["prep"] = [4, 5, 6, 7, 9, 10, 11, 12, 14, 15, 16, 16, 17, 18, 19, 21, 22, 23, 24, 25][i] if n24 else lv + 1  # 2014: Int mod 1 + level
        R("Arcane Ward", (2 * lv + 1) if lv >= (3 if n24 else 2) else None)  # Abjuration: 2 x Wizard level + Int mod (1)
    elif cls == "Artificer":
        e["slots"] = half(lv, True); e["can"] = 2 if lv < 10 else 3 if lv < 14 else 4
        if n24:
            R("Tinker's Magic", 1); e["prep"] = PH[i]
            e["tab:Plans Known"] = T((2, "4"), (6, "5"), (10, "6"), (14, "7"), (18, "8"))[i]; e["tab:Magic Items"] = T((2, "2"), (6, "3"), (10, "4"), (14, "5"), (18, "6"))[i]
        else:
            e["prep"] = max(1, 1 + lv // 2); R("Flash of Genius", 1 if lv >= 7 else None); R("Spell-Storing Item", 2 if lv >= 11 else None)
            e["tab:Infusions Known"] = T((2, "4"), (6, "6"), (10, "8"), (14, "10"), (18, "12"))[i]; e["tab:Infused Items"] = T((2, "2"), (6, "3"), (10, "4"), (14, "5"), (18, "6"))[i]
    return e

def got(r, k):
    if k.startswith("res:"): return r["res"].get(k[4:])
    if k.startswith("tab:"): return r["tab"].get(k[4:])
    if k == "prep": return r["u"].get("L:Prepared", 0)
    if k == "can": return r["u"].get("C:Cantrip", 0)
    return r.get(k)

async def main():
    url = serve(); jobs = [[rs, c, s] for rs in ("2024", "2014") for c, s in SUB[rs].items()]
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        await pg.goto(url); await pg.wait_for_function("()=>!!window.__bldFuzz", timeout=120000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        rows = await pg.evaluate(JS, jobs); await b.close()
    bad = []; n = 0
    for r in rows:
        if "err" in r: bad.append("%s %s %d: build error %s" % (r["rs"], r["cls"], r["lv"], r["err"])); continue
        for k, v in expect(r["rs"], r["cls"], r["lv"]).items():
            n += 1; g = got(r, k)
            if g != v: bad.append("%s %s %d %s: expected %r got %r" % (r["rs"], r["cls"], r["lv"], k, v, g))
    print("class_resources: %d builds, %d values checked, %d wrong" % (len(rows), n, len(bad)))
    for x in bad[:60]: print("  " + x)
    sys.exit(1 if bad or len(rows) != len(jobs) * 20 else 0)

asyncio.run(main())
