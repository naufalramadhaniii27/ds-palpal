#!/usr/bin/env python3
"""N35 metamorphic rules. python3 tests/metamorphic.py [--n 200] [--seed 1]
Applies a random character, then a changed copy, and checks the expected relation between the two derived
numbers (window.__D()). Rules follow PHB 2024 (ability modifier, Proficiency Bonus, Hit Points per level, AC with Dexterity cap).
Uses the helpers of tests/golden_rules.py (make, serve, BASE). Exit 1 on any broken rule."""
import asyncio, json, random, sys, os
sys.argv_saved = sys.argv[:]
A = sys.argv[1:]
def opt(n, d):
    if n in A: i = A.index(n); v = A[i + 1]; del A[i:i + 2]; return v
    return d
N = int(opt("--n", "200")); SEED = int(opt("--seed", "1"))
sys.argv = [sys.argv[0]]
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import golden_rules as G
from playwright.async_api import async_playwright
ABK = G.ABK

def mut(c, f):
    c2 = json.loads(json.dumps(c)); f(c2); return c2

def cases(rng, c):
    """yield (rule, changed_char, checker(d0, d1) -> error string or None)"""
    k = rng.choice(ABK)
    if c["abilities"][k]["base"] <= 18:
        def up(x): x["abilities"][k]["base"] += 2
        def ck(a, b):
            if b["mod"][k] != a["mod"][k] + 1: return "mod %s %s->%s" % (k, a["mod"][k], b["mod"][k])
            if b["save"][k] != a["save"][k] + 1: return "save %s" % k
            for i, s in enumerate(c["skills"]):
                dlt = b["skill"][str(i)] - a["skill"][str(i)]
                if dlt != (1 if s["ab"] == k else 0): return "skill %s %+d" % (s["n"], dlt)
            for o in ABK:
                if o != k and (b["mod"][o] != a["mod"][o] or b["save"][o] != a["save"][o]): return "other ability %s changed" % o
            if b["speed"] != a["speed"]: return "speed changed"
        yield "ability+2", mut(c, up), ck
    if c["level"] < 20:
        def lv(x): x["level"] += 1
        def ck(a, b):
            want = 1 if (c["level"] % 4 == 0) else 0
            if b["pb"] - a["pb"] != want: return "pb %s->%s at level %d" % (a["pb"], b["pb"], c["level"])
            if b["hpmax"] < a["hpmax"]: return "hpmax fell"
            if b["speed"] != a["speed"] or b["ac"] != a["ac"]: return "speed or ac changed"
        yield "level+1", mut(c, lv), ck
    def con(x): x["abilities"]["CON"]["base"] += 2
    if c["abilities"]["CON"]["base"] <= 18:
        def ck(a, b):
            if a["hpmax"] > 1 + c["level"] and b["hpmax"] - a["hpmax"] != c["level"] and a["mod"]["CON"] >= -4 and (b["hpmax"] != 1):
                return "hpmax %s->%s level %d" % (a["hpmax"], b["hpmax"], c["level"])
        yield "con+2", mut(c, con), ck
    np_ = [i for i, s in enumerate(c["skills"]) if not s.get("p")]
    if np_:
        i = rng.choice(np_)
        def pr(x): x["skills"][i]["p"] = 1; x["skills"][i]["src"] = "Fuzz"
        def ck(a, b):
            for j in range(len(c["skills"])):
                dlt = b["skill"][str(j)] - a["skill"][str(j)]
                if dlt != (a["pb"] if j == i else 0): return "skill %d %+d (pb %d)" % (j, dlt, a["pb"])
            if b["ac"] != a["ac"] or b["hpmax"] != a["hpmax"]: return "ac or hp changed"
        yield "skill proficiency", mut(c, pr), ck
    if c["ac"]["dex"] in ("full", "max2", "max3") and c["abilities"]["DEX"]["base"] <= 18:
        def dx(x): x["abilities"]["DEX"]["base"] += 2
        def ck(a, b):
            m = c["ac"]["dex"]; cap = {"full": 99, "max2": 2, "max3": 3}[m]
            want = min(cap, b["mod"]["DEX"]) - min(cap, a["mod"]["DEX"])
            if b["ac"] - a["ac"] != want: return "ac %s->%s mode %s" % (a["ac"], b["ac"], m)
            if b["init"] - a["init"] != 1: return "init %s->%s" % (a["init"], b["init"])
        yield "dex+2 ac", mut(c, dx), ck
    def noop(x): x["name"] = x["name"] + " b"
    yield "rename", mut(c, noop), lambda a, b: None if {k: v for k, v in a.items() if k != "name"} == {k: v for k, v in b.items() if k != "name"} else "derived numbers changed by a rename"

JS = """async (pairs)=>{const out=[];for(const c of pairs){window.__sheetApply(c,false);out.push(JSON.parse(JSON.stringify(window.__D())))}return out}"""

async def main():
    rng = random.Random(SEED); chars = [G.make(rng, i) for i in range(N)]
    plan = []
    for c in chars:
        for rule, c2, ck in cases(rng, c): plan.append((rule, c, c2, ck))
    flat = []
    for rule, c, c2, ck in plan: flat += [c, c2]
    srv, url = G.serve()
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await (await br.new_context(viewport={"width": 1250, "height": 850})).new_page()
        await pg.add_init_script("localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(json.dumps(G.BASE)))
        await pg.goto(url); await pg.wait_for_function("typeof window.__sheetApply==='function'", timeout=30000); await pg.wait_for_timeout(1500)
        res = []
        for i in range(0, len(flat), 100): res += await pg.evaluate(JS, flat[i:i + 100])
        await br.close()
    srv.shutdown()
    bad = {}; cnt = {}
    for j, (rule, c, c2, ck) in enumerate(plan):
        a, b = res[2 * j], res[2 * j + 1]
        cnt[rule] = cnt.get(rule, 0) + 1
        e = ck(a, b)
        if e: bad.setdefault(rule, []).append(e)
    for r, n in cnt.items(): print("%-18s %4d cases, %d broken" % (r, n, len(bad.get(r, []))))
    for r, l in bad.items(): print(" ", r, l[:3])
    print("metamorphic: %d broken" % sum(len(l) for l in bad.values()))
    sys.exit(1 if bad else 0)

asyncio.run(main())
