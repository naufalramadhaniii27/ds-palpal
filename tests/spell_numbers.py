#!/usr/bin/env python3
"""Spellcasting numbers on the computed sheet that tests/class_resources.py does not cover, levels 1 to 20, 2024 and 2014.
  python3 tests/spell_numbers.py [--root DIR] [--dump CLS]
class_resources.py already checks slots, pact slots, prepared or known counts and cantrip counts of the 13 core classes
(and Arcane Trickster). This adds, in one browser session:
  - C.spellcasting.ab (class ability), .dc = 8 + PB + mod, .atk = PB + mod, .mod, for every caster and third-caster subclass
  - Eldritch Knight (both editions): third-caster slots, spells known, cantrips (2 at 3, 3 at 10)
  - Warlock Mystic Arcanum: 1/2/3/4 arcana at 11/13/15/17 (shared counter while none is chosen), none before 11
  - no spellcasting block numbers before the class casts (2014 Paladin/Ranger level 1, third-casters 1-2)
Same fixed build as class_resources.py (Human, Soldier, array 15 14 13 12 10 8). Exit 1 on any difference."""
import asyncio, os, sys, socket, threading, functools, http.server, json
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])
DUMP = a[a.index("--dump") + 1] if "--dump" in a else None

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return "http://127.0.0.1:%d/index.html" % p

# (class, subclass, ability, first casting level) per rule set
CAST = {"2024": [("Bard", "College of Dance", "CHA", 1), ("Cleric", "Life Domain", "WIS", 1), ("Druid", "Circle of the Land", "WIS", 1),
                 ("Paladin", "Oath of Devotion", "CHA", 1), ("Ranger", "Beast Master", "WIS", 1), ("Sorcerer", "Aberrant Sorcery", "CHA", 1),
                 ("Warlock", "Archfey Patron", "CHA", 1), ("Wizard", "Abjurer", "INT", 1), ("Artificer", "Alchemist", "INT", 1),
                 ("Rogue", "Arcane Trickster", "INT", 3), ("Fighter", "Eldritch Knight", "INT", 3)],
        "2014": [("Bard", "College of Lore (2014)", "CHA", 1), ("Cleric", "Knowledge Domain (2014)", "WIS", 1), ("Druid", "Circle of the Land (2014)", "WIS", 1),
                 ("Paladin", "Oath of Devotion (2014)", "CHA", 2), ("Ranger", "Beast Master (2014)", "WIS", 2), ("Sorcerer", "Draconic Bloodline", "CHA", 1),
                 ("Warlock", "The Archfey (2014)", "CHA", 1), ("Wizard", "School of Abjuration", "INT", 1), ("Artificer", "Alchemist", "INT", 1),
                 ("Rogue", "Arcane Trickster (2014)", "INT", 3), ("Fighter", "Eldritch Knight (2014)", "INT", 3)]}

JS = """(o)=>{const out=[];for(const [rs,cls,sub] of o){const a=rs=='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true,tce:true}}:{sp:'Human',bg:'Soldier',src:{efa:true}};
 for(let lv=1;lv<=20;lv++){let r;try{r=window.__bldFuzz(Object.assign(a,{rs,cls,sub,lv,arr:[15,14,13,12,10,8],b2:0,b1:0}))}catch(e){r={err:String(e)}}
  if(r.err){out.push({rs,cls,lv,err:String(r.err)});continue}const c=r.c,u={},res={};
  (c.res||[]).forEach(x=>{res[x.n]=x.max});(c.spells||[]).forEach(s=>{const k=(s.l?'L:':'C:')+s.use;u[k]=(u[k]||0)+1});
  const ma=(c.spells||[]).filter(s=>s.src=='Mystic Arcanum').length+(+res['Mystic Arcanum']||0);
  out.push({rs,cls,lv,sc:c.spellcasting||{},ab:c.abilities,pb:c.pb!=null?c.pb:c.prof,u,ma,
   dump:o.length==1?{keys:Object.keys(c),res,sp:(c.spells||[]).map(s=>[s.n,s.l,s.use,s.src])}:null})}}return out}"""

FULL3 = [[], [], [2], [3], [3], [3], [4, 2], [4, 2], [4, 2], [4, 3], [4, 3], [4, 3], [4, 3, 2], [4, 3, 2], [4, 3, 2], [4, 3, 3], [4, 3, 3], [4, 3, 3], [4, 3, 3, 1], [4, 3, 3, 1]]
EK = [0, 0, 3, 4, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 11, 11, 12, 13]  # Eldritch Knight spells known, PHB 2014 and 2024

def mod(v): return (v - 10) // 2

def score(abil, k):
    v = abil[k]; return v["base"] + sum(x["v"] for x in v.get("bonus") or [])

async def main():
    url = serve(); jobs = [[rs, c, s] for rs in CAST for c, s, _, _ in CAST[rs] if not DUMP or c == DUMP][: (1 if DUMP else None)]
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(url); await pg.wait_for_function("()=>!!window.__bldFuzz", timeout=120000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        rows = await pg.evaluate(JS, jobs); await b.close()
    if DUMP:
        for r in rows: print(json.dumps({k: r[k] for k in r if k != "ab"} | {"ab": r.get("ab")})[:2500])
        return
    meta = {(rs, c): (ab, first) for rs in CAST for c, _, ab, first in CAST[rs]}
    bad = []; n = 0
    def chk(r, k, v, g):
        nonlocal n; n += 1
        if g != v: bad.append("%s %s %d %s: expected %r got %r" % (r["rs"], r["cls"], r["lv"], k, v, g))
    for r in rows:
        if "err" in r: bad.append("%s %s %d: build error %s" % (r["rs"], r["cls"], r["lv"], r["err"])); continue
        ab, first = meta[(r["rs"], r["cls"])]; sc = r["sc"]; lv = r["lv"]; pb = 2 + (lv - 1) // 4
        if lv < first:
            chk(r, "slots", [], sc.get("slots") or []); continue
        m = mod(score(r["ab"], ab))
        chk(r, "ab", ab, sc.get("ab")); chk(r, "mod", m, sc.get("mod")); chk(r, "dc", 8 + pb + m, sc.get("dc")); chk(r, "atk", pb + m, sc.get("atk"))
        if r["cls"] == "Fighter":
            chk(r, "slots", FULL3[lv - 1], sc.get("slots")); chk(r, "known", EK[lv - 1], r["u"].get("L:Prepared", 0))
            chk(r, "cantrips", 2 if lv < 10 else 3, r["u"].get("C:Cantrip", 0))
        if r["cls"] == "Warlock":
            chk(r, "arcana", 0 if lv < 11 else 1 if lv < 13 else 2 if lv < 15 else 3 if lv < 17 else 4, r["ma"])
    print("spell_numbers: %d builds, %d values checked, %d wrong" % (len(rows), n, len(bad)))
    for x in bad[:80]: print("  " + x)
    sys.exit(1 if bad or len(rows) != len(jobs) * 20 else 0)

asyncio.run(main())
