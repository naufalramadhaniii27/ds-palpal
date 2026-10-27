#!/usr/bin/env python3
"""Interaction timing (INP-style) on the sheet. python3 tests/inp.py [OUT.json] [--root DIR] [--runs N] [--only "390x844 cpu1x"]
Starts from the Yudhi fixture, opens the sheet with View, then runs each action RUNS times and reads the Event Timing API
(click and pointerup entries, duration = input delay + handler + next paint, 8 ms steps). Reports the median and worst per action.
Actions: damage, heal, tab switches (all seven), open a detail panel, temp HP step, rest menu.
Headless Chromium has no GPU, so paint cost is lower than on a phone. Treat the numbers as a floor and compare runs, not devices."""
import asyncio, json, os, sys, statistics, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
RUNS = 5
ONLY = None
if "--only" in a: i = a.index("--only"); ONLY = a[i+1]; del a[i:i+2]
if "--runs" in a: i = a.index("--runs"); RUNS = int(a[i+1]); del a[i:i+2]
OUT = a[0] if a else os.path.join(HERE, "out", "inp.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
CASES = [("390x844", 390, 844, 1), ("390x844", 390, 844, 4), ("1250x850", 1250, 850, 1), ("1250x850", 1250, 850, 4)]
TABS = ["p-actions", "p-spells", "p-inv", "p-feat", "p-desc", "p-notes", "p-ext"]


def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port


OBS = """()=>{window.__ev=[];try{new PerformanceObserver(l=>{l.getEntries().forEach(e=>window.__ev.push({n:e.name,d:e.duration,s:e.startTime,p:e.processingEnd-e.processingStart,i:e.processingStart-e.startTime}))}).observe({type:'event',buffered:false,durationThreshold:16})}catch(e){}}"""


async def act(pg, fn):
    """Run one interaction and return the longest click/pointerup/keydown duration it produced."""
    await pg.evaluate("()=>{window.__ev.length=0}")
    await fn()
    await pg.wait_for_timeout(450)
    ev = await pg.evaluate("()=>window.__ev.filter(e=>e.n==='click'||e.n==='pointerup'||e.n==='keydown'||e.n==='pointerdown').map(e=>e.d)")
    return max(ev) if ev else 0


async def run_case(b, base, name, W, H, cpu):
    ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=(W < 600), is_mobile=False)
    pg = await ctx.new_page(); pg.set_default_timeout(8000)
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))  # seeded before the page runs: a reload lets the old page write its own roster back on unload
    await pg.goto(base); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(2000)
    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1800)
    await pg.evaluate(OBS)
    cdp = await ctx.new_cdp_session(pg)
    await cdp.send("Emulation.setCPUThrottlingRate", {"rate": cpu})
    res = {}

    async def damage():
        await pg.fill("#hpAmt", "3"); await pg.click("#dmgBtn")
    async def heal():
        await pg.fill("#hpAmt", "3"); await pg.click("#healBtn")
    async def tmp():
        await pg.click("[data-tmp='1']")
    async def panel():
        await pg.click(".hp-h [data-info]"); await pg.wait_for_timeout(500)
        await pg.keyboard.press("Escape")
    async def rest():
        await pg.click("[data-rest='menu']"); await pg.wait_for_timeout(500)
        await pg.keyboard.press("Escape")

    plan = [("damage", damage), ("heal", heal), ("temp HP step", tmp), ("detail panel", panel), ("rest menu", rest)]
    for label, fn in plan:
        vals = []
        for _ in range(RUNS):
            try:
                vals.append(await act(pg, fn))
            except Exception as e:
                vals.append(-1); errs.append("%s: %s" % (label, str(e)[:120]))
            await pg.wait_for_timeout(300)
        res[label] = vals
    tabvals = []
    for rep in range(RUNS):
        for t in TABS + ["p-actions"]:
            async def go(t=t):
                # the tab bar is hidden at phone width, the bottom bar [data-go] switches pages there
                sel = "[data-tab='%s']" % t
                if not await pg.evaluate("s=>{var e=document.querySelector(s);return !!(e&&e.offsetParent)}", sel):
                    sel = "[data-go='%d']" % (TABS.index(t) + 2)  # data-go 0 Main, 1 Skills, 2 Actions ... 8 Extras
                await pg.click(sel)
            try:
                tabvals.append(await act(pg, go))
            except Exception as e:
                tabvals.append(-1); errs.append("tab %s: %s" % (t, str(e)[:120]))
    res["tab switch"] = tabvals
    await ctx.close()
    return res, errs


async def main():
    srv, base = serve(); out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, W, H, cpu in CASES:
            key = "%s cpu%dx" % (name, cpu)
            if ONLY and ONLY != key: continue
            res, errs = await run_case(b, base, name, W, H, cpu)
            out[key] = {"actions": {k: {"median": statistics.median([x for x in v if x >= 0] or [-1]), "worst": max(v) if v else -1, "n": len(v), "raw": v} for k, v in res.items()}, "errors": errs}
            print("\n" + key)
            for k, v in out[key]["actions"].items():
                print("  %-14s median %5.0f ms   worst %5.0f ms   (n=%d)" % (k, v["median"], v["worst"], v["n"]))
            if errs: print("  errors:", errs[:4])
        await b.close()
    json.dump(out, open(OUT, "w"), indent=1)
    print("\nwrote", OUT)

asyncio.run(main())
