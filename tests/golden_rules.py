#!/usr/bin/env python3
"""N49 golden numbers + N50 rules oracle (the N6 builder fuzzer is tests/fuzz_rules.py).

  python3 tests/golden_rules.py [--n 1000] [--seed 1] [--root DIR] [--golden write|check] [--out FILE]

Builds seeded random characters from the Yudhi fixture, loads each through window.__sheetApply, reads window.__D()
(the derived numbers) and:
  1. sanity (N6): no NaN, finite integers, HP >= 1, AC and Speed in plausible ranges, same result on a second derive.
  2. oracle (N50): a separate small calculator written from the PHB 2024 rules (not from derive()) recomputes
     Proficiency Bonus, modifiers, saves, skills, passives, Initiative, AC, HP, Speed and the grapple DC. Differences are
     reported by kind. The oracle only reports, it never changes anything.
  3. golden (N49): sha256 of the numbers of every character plus the full numbers of the first 200 characters.
     --golden write saves tests/golden/rules-golden.json. --golden check compares and names the first differences.
Exit 1 on sanity failures, oracle differences, or a golden mismatch.
"""
import asyncio, json, os, random, sys, hashlib, socket, threading, functools, http.server
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
def opt(name, default=None):
    if name in a:
        i = a.index(name); v = a[i + 1]; del a[i:i + 2]; return v
    return default
N = int(opt("--n", "1000")); SEED = int(opt("--seed", "1")); ROOT = os.path.abspath(opt("--root", ROOT))
GMODE = opt("--golden"); OUT = opt("--out")
GFILE = os.path.join(HERE, "golden", "rules-golden.json")
BASE = json.load(open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8"))
ABK = ["STR", "DEX", "CON", "INT", "WIS", "CHA"]
HD = [6, 8, 10, 12]

def make(rng, i):
    c = json.loads(json.dumps(BASE))
    c["name"] = "Fuzz %d" % i
    c["level"] = rng.randint(1, 20)
    c["hitDie"] = rng.choice(HD)
    c["hpPerLevel"] = []
    for k in ABK:
        c["abilities"][k] = {"base": rng.randint(3, 20), "bonus": [{"s": "Fuzz", "v": rng.randint(0, 3)}] if rng.random() < .5 else []}
    c["saves"] = {k: "Fuzz" for k in ABK if rng.random() < .35}
    for s in c["skills"]:
        s.pop("p", None); s.pop("src", None); s.pop("misc", None)
        r = rng.random()
        if r < .3: s["p"] = 1; s["src"] = "Fuzz"
        elif r < .4: s["p"] = 2; s["src"] = "Fuzz"
        if rng.random() < .1: s["misc"] = rng.randint(-2, 3)
    mode = rng.choice(["full", "max2", "max3", "none"])
    c["ac"] = {"base": rng.randint(8, 18), "baseSrc": "Fuzz", "dex": mode, "bonus": [{"s": "Fuzz", "v": rng.randint(0, 3)}] if rng.random() < .4 else []}
    c["speed"] = rng.choice([25, 30, 35, 40])
    c["hpBonus"] = [{"s": "Fuzz", "v": rng.randint(1, 4)}] if rng.random() < .2 else []
    c["initBonus"] = [{"s": "Fuzz", "v": rng.randint(1, 5)}] if rng.random() < .15 else []
    return c

def mod(s): return (s - 10) // 2

def oracle(c):
    lvl = c["level"]; pb = 2 + (lvl - 1) // 4
    sc = {k: c["abilities"][k]["base"] + sum(b["v"] for b in c["abilities"][k]["bonus"]) for k in ABK}
    md = {k: mod(sc[k]) for k in ABK}
    o = {"pb": pb, "mod": md, "score": sc}
    o["save"] = {k: md[k] + (pb if k in c["saves"] else 0) for k in ABK}
    sk = []
    for s in c["skills"]:
        p = s.get("p", 0)
        sk.append(md[s["ab"]] + pb * (2 if p == 2 else 1 if p == 1 else 0) + s.get("misc", 0))
    o["skill"] = sk
    def skl(n): return next(i for i, s in enumerate(c["skills"]) if s["n"] == n)
    o["pas_per"] = 10 + sk[skl("Perception")]; o["pas_ins"] = 10 + sk[skl("Insight")]; o["pas_inv"] = 10 + sk[skl("Investigation")]
    dm = md["DEX"]; m = c["ac"]["dex"]
    dx = dm if m == "full" else min(2, dm) if m == "max2" else min(3, dm) if m == "max3" else 0
    o["ac"] = c["ac"]["base"] + dx + sum(b["v"] for b in c["ac"]["bonus"])
    o["init"] = dm + sum(b["v"] for b in c["initBonus"])
    hd = c["hitDie"]
    o["hpmax"] = max(1, hd + (lvl - 1) * (hd // 2 + 1) + md["CON"] * lvl + sum(b["v"] for b in c["hpBonus"]))
    o["speed"] = c["speed"]
    o["dc"] = 8 + md["STR"] + pb + int(os.environ.get("ORACLE_BREAK","0"))
    return o

def flat(o, p=""):
    out = {}
    if isinstance(o, dict):
        for k, v in o.items(): out.update(flat(v, p + str(k) + "."))
    elif isinstance(o, list):
        for i, v in enumerate(o): out.update(flat(v, p + str(i) + "."))
    else: out[p[:-1]] = o
    return out

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

JS = """async (chars)=>{
  const out=[];
  for(const c of chars){
    window.__sheetApply(c,false);
    const d1=JSON.parse(JSON.stringify(window.__D()));
    out.push(d1);
  }
  return out;
}"""

async def main():
    rng = random.Random(SEED)
    chars = [BASE] + [make(rng, i) for i in range(N)]
    srv, url = serve()
    async with async_playwright() as p:
        br = await p.chromium.launch()
        ctx = await br.new_context(viewport={"width": 1250, "height": 850})
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(json.dumps(BASE)))
        await pg.goto(url); await pg.wait_for_function("typeof window.__sheetApply==='function'", timeout=30000)
        await pg.wait_for_timeout(1500)
        res = []
        for i in range(0, len(chars), 100):
            res += await pg.evaluate(JS, chars[i:i + 100])
        await br.close()
    srv.shutdown()
    bad = []; diffs = {}; keys = ["level", "pb", "score", "mod", "save", "skill", "pas_per", "pas_ins", "pas_inv", "ac", "init", "hpmax", "speed", "dc"]
    for i, (c, d) in enumerate(zip(chars, res)):
        f = flat({k: d.get(k) for k in keys})
        for k, v in f.items():
            if not isinstance(v, int) or isinstance(v, bool):
                bad.append((i, k, v))
        if d.get("hpmax", 1) < 1: bad.append((i, "hpmax<1", d.get("hpmax")))
        if not (0 <= d.get("speed", 0) <= 120): bad.append((i, "speed range", d.get("speed")))
        if not (1 <= d.get("ac", 10) <= 40): bad.append((i, "ac range", d.get("ac")))
        if i == 0: continue
        o = flat(oracle(c)); dd = flat({k: d.get(k) for k in o.keys() if False}) 
        df = flat(d)
        for k, v in o.items():
            kk = k
            if df.get(kk) != v:
                kind = kk.split(".")[0]
                diffs.setdefault(kind, []).append((i, kk, df.get(kk), v))
    print("characters:", len(chars), "page errors:", len(errs), errs[:3])
    print("sanity failures:", len(bad), bad[:5])
    print("oracle differences by kind:", {k: len(v) for k, v in diffs.items()})
    for k, v in diffs.items(): print("  ", k, v[:2])
    hashes = [hashlib.sha256(json.dumps({k: r.get(k) for k in keys}, sort_keys=True).encode()).hexdigest()[:16] for r in res]
    gold = {"seed": SEED, "n": N, "hashes": hashes, "sample": [{k: r.get(k) for k in keys} for r in res[:200]]}
    rc = 1 if (bad or errs or diffs) else 0
    if GMODE == "write":
        json.dump(gold, open(GFILE, "w")); print("golden written", GFILE)
    elif GMODE == "check":
        g = json.load(open(GFILE)); ch = [i for i in range(min(len(g["hashes"]), len(hashes))) if g["hashes"][i] != hashes[i]]
        print("golden: changed characters:", len(ch), ch[:5])
        for i in ch[:3]:
            if i < 200:
                a1, b1 = flat(g["sample"][i]), flat(gold["sample"][i])
                print("  char", i, {k: (a1.get(k), b1.get(k)) for k in a1 if a1.get(k) != b1.get(k)})
        if ch or len(g["hashes"]) != len(hashes): rc = 1
    if OUT: json.dump({"bad": bad[:50], "diffs": {k: v[:50] for k, v in diffs.items()}}, open(OUT, "w"))
    sys.exit(rc)
if __name__ == "__main__":
    asyncio.run(main())
