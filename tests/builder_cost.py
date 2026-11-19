#!/usr/bin/env python3
"""Builder cost: how many times the sheet is computed (toSheet) when the builder opens and when each of its steps is shown.
Counts, not milliseconds, so the result is the same on every machine. 0.0.80 ran toSheet once per feat option when the
builder opened (the 3.7 s lag on a slow phone). Limits are in tests/builder-cost.json; the test fails when a count goes over.
  python3 tests/builder_cost.py [--root DIR] [--write]     --write saves the current counts plus 5 as the limits (only on purpose)"""
import json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])
LIMITS = os.path.join(HERE, "builder-cost.json")
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()

OPEN = """()=>new Promise(res=>{document.getElementById('bldBtn').click();
 (function w(){var d=document.getElementById('bld'),b=document.getElementById('body');
  if(d&&!d.hidden&&b&&b.children.length) requestAnimationFrame(()=>setTimeout(res,0)); else setTimeout(w,10)})()})"""
STEPS = "()=>Array.from(document.querySelectorAll('#bld [data-step]')).map(b=>b.getAttribute('data-step'))"


def main():
    got = {}
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(viewport={"width": 1250, "height": 850}); pg.set_default_timeout(120000)
        errs = []; pg.on("pageerror", lambda e: errs.append(str(e)) if "Transition was skipped" not in str(e) else None)  # fast step clicks skip view transitions, not an app error
        pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(800)
        pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
        pg.reload(); pg.wait_for_timeout(1500)
        pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); pg.wait_for_timeout(1000)
        pg.evaluate("()=>window.__bldNeed()")
        for _ in range(600):
            if pg.evaluate("()=>typeof window.__bldSheetRuns==='function'"): break
            pg.wait_for_timeout(100)
        n0 = pg.evaluate("()=>window.__bldSheetRuns()")
        pg.evaluate(OPEN)
        got["open"] = pg.evaluate("()=>window.__bldSheetRuns()") - n0
        for st in pg.evaluate(STEPS):
            n0 = pg.evaluate("()=>window.__bldSheetRuns()")
            pg.evaluate("s=>{var b=document.querySelector('#bld [data-step=\"'+s+'\"]'); if(b) b.click()}", st)
            pg.wait_for_timeout(150)
            got["step " + st] = pg.evaluate("()=>window.__bldSheetRuns()") - n0
        br.close()
    print(json.dumps(got))
    if errs:
        print("page errors:", errs[:3]); return 1
    if "--write" in a:
        json.dump({k: v + 5 for k, v in got.items()}, open(LIMITS, "w"), indent=1)  # +5: a step can render once or twice more by timing; the 0.0.80 bug was +60; print("limits written to", LIMITS); return 0
    lim = json.load(open(LIMITS)); bad = []
    for k, v in got.items():
        if k not in lim: bad.append("%s: %d (no limit yet, run --write on purpose)" % (k, v))
        elif v > lim[k]: bad.append("%s: %d toSheet runs, limit %d" % (k, v, lim[k]))
    for k in lim:
        if k not in got: bad.append("%s: step not found" % k)
    if bad:
        print("builder_cost FAIL"); [print("  -", b) for b in bad]; return 1
    print("builder_cost OK: %d screens within limits" % len(got)); return 0


sys.exit(main())
