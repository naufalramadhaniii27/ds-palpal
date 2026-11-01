#!/usr/bin/env python3
"""Performance budget (Fase 0.2 of the 9.8 plan).  python3 tests/perf_budget.py [OUT.json] [--runs N] [--fast] [--check BUDGET.json]
Medians of N runs (default 5) per condition: viewport 390x844 and 1250x850, CPU x1 and x4, Yudhi fixture, cold cache, service worker blocked.
  heap_home_mb      JS heap after Home is drawn and the main thread is free
  heap_tools_mb     JS heap after the builder and the Library were opened and the page went idle
  fcp / ready / defer_done / build_first / build_warm   from tests/measure.py (same definitions)
  sheet_open        View tap until the sheet is drawn
  lib_find_ms       window.__libFind('fireball') once the Library index is ready
  inp_*             Event Timing duration of the main actions, from tests/inp.py
  bytes_*           index.html raw, gzip -6 and brotli -q 11, and the first download of the split form (sheet part only)
--fast  only the stable measures (bytes and heap). Those are the ones a CI runner can gate on.
--check compare with a budget file. Entries are {"metric": ceiling}. A metric over its ceiling fails the run (exit 1).
Timing numbers on a shared runner move with the machine, so the budget file in the repo only gates bytes and heap. Timings are reported."""
import asyncio, brotli, functools, gzip, http.server, json, os, socket, statistics, subprocess, sys, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
RUNS = 5; FAST = False; CHECK = None
if "--runs" in a: i = a.index("--runs"); RUNS = int(a[i + 1]); del a[i:i + 2]
if "--fast" in a: a.remove("--fast"); FAST = True
if "--check" in a: i = a.index("--check"); CHECK = a[i + 1]; del a[i:i + 2]
OUT = a[0] if a else os.path.join(HERE, "out", "perf_budget.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
CASES = [("390x844", 390, 844), ("1250x850", 1250, 850)]
READY = """()=>new Promise(r=>{(function w(){var h=document.getElementById('homeV');var s=document.querySelector('.id-name,h1');
  if(((h&&h.offsetParent&&h.querySelector('[data-hview],.hcard'))||(s&&s.offsetParent))&&!document.documentElement.classList.contains('st-wait')){requestAnimationFrame(()=>setTimeout(()=>r(performance.now()),0))}else setTimeout(w,16)})()})"""


def serve(directory=ROOT):
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=directory))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port


def med(v):
    v = [x for x in v if x is not None and x >= 0]
    return round(statistics.median(v), 2) if v else None


async def heap_case(b, base, W, H, cpu):
    ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block"); pg = await ctx.new_page(); pg.set_default_timeout(120000)
    await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
    cdp = await ctx.new_cdp_session(pg)
    if cpu > 1: await cdp.send("Emulation.setCPUThrottlingRate", {"rate": cpu})
    await pg.goto(base, wait_until="commit"); await pg.evaluate(READY)
    await pg.wait_for_function("()=>!!window.__deferDone", timeout=180000); await pg.wait_for_timeout(1500)
    async def heap():
        await cdp.send("HeapProfiler.collectGarbage"); u = await cdp.send("Runtime.getHeapUsage"); return u["usedSize"] / 1048576
    raw = (await cdp.send("Runtime.getHeapUsage"))["usedSize"] / 1048576
    r = {"heap_home_raw_mb": raw, "heap_home_mb": await heap()}
    t = await pg.evaluate("""()=>new Promise(res=>{var b=document.querySelector('[data-hview]');if(!b){res(null);return}var t0=performance.now();b.click();
        (function w(){var s=document.querySelector('.id-name');if(s&&s.offsetParent){requestAnimationFrame(()=>res(performance.now()-t0))}else setTimeout(w,5)})();setTimeout(()=>res(-1),20000)})""")
    r["sheet_open"] = t
    try:
        await pg.evaluate("()=>{var b=document.getElementById('bldBtn'); if(b) b.click()}"); await pg.wait_for_timeout(2500)
        await pg.evaluate("()=>{var c=document.getElementById('b-close'); if(c) c.click()}"); await pg.wait_for_timeout(800)
        await pg.evaluate("()=>{var b=document.getElementById('libBtn'); if(b) b.click()}")
        await pg.wait_for_function("()=>!!window.__libFind&&!!window.QREFS&&!!window.QREFS.monster", timeout=240000); await pg.wait_for_timeout(1500)
        r["lib_find_ms"] = await pg.evaluate("()=>{window.__libFind('fireball');var t0=performance.now();window.__libFind('fireball');return performance.now()-t0}")
    except Exception as e:
        r["tools_error"] = str(e)[:100]
    await pg.wait_for_timeout(2000); r["heap_tools_mb"] = await heap()
    await ctx.close(); return r


def sizes():
    p = os.path.join(ROOT, "index.html"); raw = open(p, "rb").read()
    r = {"bytes_raw": len(raw), "bytes_gzip": len(gzip.compress(raw, 6)), "bytes_brotli": len(brotli.compress(raw, quality=11))}
    out = os.path.join(HERE, "out", "split-dist")
    try:
        subprocess.run(["rm", "-rf", out]); os.makedirs(out)
        for f in ("index.html", "sw.js"):
            subprocess.run(["cp", os.path.join(ROOT, f), out])
        subprocess.run([sys.executable, os.path.join(ROOT, "tools", "split_dist.py"), os.path.join(out, "index.html"), os.path.join(out, "sw.js"), out], check=True, capture_output=True)
        first = open(os.path.join(out, "index.html"), "rb").read()
        r["bytes_split_first_gzip"] = len(gzip.compress(first, 6)); r["bytes_split_first_brotli"] = len(brotli.compress(first, quality=11))
        r["bytes_split_parts_total"] = sum(os.path.getsize(os.path.join(out, "p", f)) for f in os.listdir(os.path.join(out, "p")))
    except Exception as e:
        r["split_error"] = str(e)[:100]
    return r


def run_script(name, args):
    out = os.path.join(HERE, "out", name + "_pb.json")
    subprocess.run([sys.executable, os.path.join(HERE, name + ".py"), out] + args, check=True, stdout=subprocess.DEVNULL)
    return json.load(open(out))


async def main():
    res = {"runs": RUNS, "bytes": sizes()}
    srv, base = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name, W, H in CASES:
            for cpu in (1, 4):
                key = "%s cpu%dx" % (name, cpu); rows = []
                for _ in range(RUNS):
                    try: rows.append(await heap_case(b, base, W, H, cpu))
                    except Exception as e: rows.append({"error": str(e)[:100]})
                res[key] = {k: med([r.get(k) for r in rows]) for k in ("heap_home_raw_mb", "heap_home_mb", "heap_tools_mb", "sheet_open", "lib_find_ms")}
                print(key, res[key], flush=True)
                if cpu == 1 and FAST: break
    srv.shutdown()
    if not FAST:
        m = run_script("measure", ["--runs", str(RUNS)])
        for k, v in m["results"].items():
            md = v.get("median", {}); res.setdefault(k, {}).update({x: md[x] for x in ("fcp", "ready", "defer_done", "build_first", "build_warm", "search_first") if x in md})
        i = run_script("inp", ["--runs", str(RUNS)])
        for k, v in i.items():
            if isinstance(v, dict) and "actions" in v:
                res.setdefault(k, {}).update({"inp_" + n.replace(" ", "_"): x["median"] for n, x in v["actions"].items()})
    json.dump(res, open(OUT, "w"), indent=1); print("wrote", OUT)
    if CHECK:
        bud = json.load(open(CHECK)); bad = []
        for k, lim in bud.items():
            if k == "bytes":
                for m, c in lim.items():
                    if res["bytes"].get(m) is not None and res["bytes"][m] > c: bad.append("bytes.%s %s > %s" % (m, res["bytes"][m], c))
            else:
                for m, c in lim.items():
                    v = (res.get(k) or {}).get(m)
                    if v is not None and v > c: bad.append("%s.%s %s > %s" % (k, m, v, c))
        for x in bad: print("OVER BUDGET:", x)
        print("budget:", "FAIL" if bad else "ok"); sys.exit(1 if bad else 0)

asyncio.run(main())
