#!/usr/bin/env python3
"""N40 storage chaos with seeds.  python3 tests/chaos_storage.py [--seeds N] [--from A] [--seed S] [--clean] [--viewport 390x844|1250x850]
For each seed: open Yudhi's sheet, switch failures on (tests/lib/chaos.js: IndexedDB put errors, aborted transactions, localStorage quota errors, bad network),
run a random list of sheet actions (damage, heal, temp HP), switch failures off, do one clean action, close the tab at once and open it again.
Invariants: (1) every key the app held is the same after the new open, nothing from the roster is lost; (2) a failed save shows the warning bar (#saveWarn)
and a clean save removes it; (3) no page error besides the injected ones. A broken seed is written to reports/chaos-gagal.json with its steps:
python3 tests/chaos_storage.py --seed 137 repeats the same failures and the same actions. 50 seeds run in CI on every push, 500 at night."""
import asyncio, json, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); A = sys.argv[1:]; sys.argv = [sys.argv[0]]
def arg(n, d=None, cast=str):
    return cast(A[A.index(n) + 1]) if n in A else d
N = arg("--seeds", 50, int); FROM = arg("--from", 1, int); ONE = arg("--seed", None, int); CLEAN = "--clean" in A; VP = arg("--viewport", None)
exec(open(os.path.join(HERE, "style_snapshot.py")).read().split("def diff(")[0])
CH = open(os.path.join(HERE, "lib", "chaos.js"), encoding="utf-8").read()
OBS = """(function(){window.__last='';window.addEventListener('cs-store-fail',function(){window.__last='fail'});window.addEventListener('cs-store-ok',function(){window.__last='ok'})})()"""
KNOWN = [287]  # seeds that found a bug once (287: the mirror mark was not written again, an old IndexedDB copy won). They run first every time
# cs-rcpt-v1 is written by a timer a few seconds after start (src/app/46) and rebuilt at every start. A tab closed in that window may lose it. CI seeds 13 and 29 hit this once (2026-11-02), not reproduced in 12 local runs
VOLATILE = ("cs-store-v1", "cs-rcpt-v1")
VOLATILE_PREFIX = ("cs-tm-",)


def dd(a, b, path=""):
    """paths where two JSON texts differ (strings that hold JSON are opened too); timestamps named t, at, ts, saved, updated, modified are ignored"""
    def load(x):
        try: return json.loads(x) if isinstance(x, str) and x[:1] in "{[" else x
        except Exception: return x
    a, b = load(a), load(b); out = []
    if isinstance(a, dict) and isinstance(b, dict):
        for k in sorted(set(a) | set(b)):
            if k in ("t", "at", "ts", "saved", "updated", "modified", "lastOpen", "opened") : continue
            if k not in a or k not in b: out.append("%s/%s missing" % (path, k))
            else: out += dd(a[k], b[k], path + "/" + k)
    elif isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b): out.append("%s length %d->%d" % (path, len(a), len(b)))
        else:
            for i, (x, y) in enumerate(zip(a, b)): out += dd(x, y, "%s[%d]" % (path, i))
    elif a != b: out.append("%s: %s -> %s" % (path, str(a)[:30], str(b)[:30]))
    return out


def strip(k, v):
    """the roster copy of the open character is folded in when the character is switched (rSnap), the live data is in the sheet and build keys, so only its presence is compared"""
    if k != "cs-roster-v1": return v
    try:
        r = json.loads(v); a = r.get("active")
        if a in r.get("chars", {}): r["chars"][a] = {"present": 1}
        return json.dumps(r)
    except Exception: return v


def plan(seed):
    r = random.Random(seed * 7919 + 13); steps = []
    for _ in range(r.randint(3, 9)):
        steps.append({"a": r.choice(["damage", "heal", "damage", "heal", "temp"]), "n": r.randint(1, 9), "wait": r.choice([0, 0, 30, 120, 400])})
    return steps


async def act(pg, s):
    if s["a"] == "temp": await pg.click("[data-tmp='1']")
    else:
        await pg.fill("#hpAmt", str(s["n"])); await pg.click("#dmgBtn" if s["a"] == "damage" else "#healBtn")
    if s["wait"]: await pg.wait_for_timeout(s["wait"])


async def one(b, url, seed, w, h):
    steps = plan(seed); out = {"seed": seed, "viewport": "%dx%d" % (w, h), "steps": steps, "problems": []}
    ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block")
    try:
        pg = await ctx.new_page(); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)) if "chaos" not in str(e) and "QuotaExceeded" not in str(e) else None)
        probs = "{seed:%d%s}" % (seed, ",put:0,abort:0,ls:0,fetchFail:0,fetchSlow:0" if CLEAN else "")
        await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3'," + json.dumps(FIX) + ");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}")
        await pg.add_init_script("window.__CHAOS=" + probs + ";\n" + CH)
        await pg.add_init_script(OBS)
        await pg.goto(url); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>{window.__chaosOn=1}")
        for s in steps:
            try: await act(pg, s)
            except Exception as e: out["problems"].append("action %s failed: %s" % (s["a"], str(e)[:100]))
        await pg.wait_for_timeout(400)
        st = await pg.evaluate("()=>[window.__last,!!document.getElementById('saveWarn')]")
        if st[0] == "fail" and not st[1]: out["problems"].append("the last save failed and the warning bar is not shown")
        dirty = seed % 2 == 1  # odd seeds close the tab right after the last clean change, without waiting for the store to flush (pagehide must do it)
        await pg.evaluate("()=>{window.__chaosOn=0}")
        await act(pg, {"a": "damage", "n": 1, "wait": 0})
        if dirty:
            try: await pg.wait_for_function("()=>!__store.failed().includes('yudhi-kelapa-sheet-v1')", timeout=3000)
            except Exception: out["problems"].append("the clean save of the sheet did not reach the store")
        else:
            await pg.evaluate("()=>window.__store.flush()"); await pg.wait_for_timeout(300)
            if await pg.evaluate("()=>!!document.getElementById('saveWarn')"): out["problems"].append("warning bar still shown after a clean save")
        out["dirty"] = dirty
        out["chaos_events"] = await pg.evaluate("()=>(window.__chaosLog||[]).length")
        if ONE is not None: print("steps", steps, "\nchaos log", await pg.evaluate("()=>window.__chaosLog"), "\nmark", await pg.evaluate("()=>localStorage.getItem('cs-store-v1')"), "failed keys", await pg.evaluate("()=>__store.failed()"))
        snap = await pg.evaluate("()=>{var o={};for(var i=0;i<__store.length;i++){var k=__store.key(i);o[k]=__store.getItem(k)}return o}")
        if ONE is not None: print("pg1 before close", await pg.evaluate("()=>[JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}').hp, JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}').hp, localStorage.getItem('cs-store-v1'), __store.failed()]"))
        await pg.close()  # tab closes right after the last change
        pg2 = await ctx.new_page(); pg2.on("pageerror", lambda e: errs.append(str(e)))
        await pg2.goto(url); await pg2.wait_for_function("()=>!!window.__gateDone", timeout=40000); await pg2.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg2.wait_for_timeout(800)
        if await pg2.evaluate("()=>!!document.getElementById('recov')&&document.getElementById('recov').offsetParent!==null"): out["problems"].append("recovery screen after reopen")
        if ONE is not None:
            print("pg2 ls", await pg2.evaluate("()=>[JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}').hp, JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}').hp, localStorage.getItem('cs-store-v1'), __store.mode(), __store.failed()]"))
        now = await pg2.evaluate("()=>{var o={};for(var i=0;i<__store.length;i++){var k=__store.key(i);o[k]=__store.getItem(k)}return o}")
        for k, v in snap.items():
            if k in VOLATILE or k.startswith(VOLATILE_PREFIX): continue
            if k not in now: out["problems"].append("key lost: " + k)
            elif now[k] != v:
                d = dd(strip(k, v), strip(k, now[k]))
                if d: out["problems"].append("key changed: %s %s" % (k, d[:3]))
        if errs: out["problems"].append("page errors: " + "; ".join(errs[:2])[:200])
    except Exception as e:
        out["problems"].append("run error: " + str(e)[:200])
    await ctx.close(); return out


async def main():
    srv, url = serve(); bad = []; seeds = [ONE] if ONE is not None else KNOWN + list(range(FROM, FROM + N))
    vps = [(390, 844), (1250, 850)]
    if VP: vps = [tuple(int(x) for x in VP.split("x"))]
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); ev = 0
        for i, sd in enumerate(seeds):
            w, h = vps[i % len(vps)]
            r = await one(b, url, sd, w, h); ev += r.get("chaos_events", 0)
            if r["problems"]:
                bad.append(r); print("seed %d FAIL %s" % (sd, r["problems"][:2]), flush=True)
            elif ONE is not None or i % 10 == 9: print("seed %d ok (%d seeds so far, %d failures injected)" % (sd, i + 1, ev), flush=True)
        await b.close()
    p = os.path.join(ROOT, "reports", "chaos-gagal.json")
    if bad: json.dump(bad, open(p, "w"), indent=1)
    elif os.path.exists(p) and ONE is None and not CLEAN: os.remove(p)
    print("chaos_storage: %d seeds, %d failed, %d failures injected" % (len(seeds), len(bad), ev)); print("SCORE %d" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
