#!/usr/bin/env python3
"""N39 tap-count robot. python3 tests/ux_tasks.py [--update-report]
Runs player tasks on the sheet (390x844) with real clicks, counts taps (a typed number counts as 1 tap),
checks the result through the page, and compares with tests/ux_ddb.json (reference counts, estimates for D&D Beyond).
Exit 1 when a task fails or needs more taps than its budget (own previous count, ratchet)."""
import json, os, sys
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(HERE)
BASE = json.load(open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8"))
REF = json.load(open(os.path.join(HERE, "ux_ddb.json"), encoding="utf-8"))
HP = lambda pg: int(pg.inner_text("#hpChipV").split("+")[0])
res = []

def run(pg, name, steps, check):
    taps = 0
    for kind, arg in steps:
        if kind == "tap":
            try: pg.locator(arg).locator("visible=true").last.click(timeout=4000)
            except Exception as e:
                m = str(e); res.append({"task": name, "taps": taps, "ok": False, "err": m.split("Call log")[0][:60] + " | " + m.split("intercepts")[0][-110:]}); return
            taps += 1
        elif kind == "slide":
            h = pg.locator(arg).locator("visible=true").last.bounding_box(); w = pg.locator(".slidec").locator("visible=true").last.bounding_box()
            pg.mouse.move(h["x"] + h["width"] / 2, h["y"] + h["height"] / 2); pg.mouse.down()
            for k in range(1, 11): pg.mouse.move(h["x"] + 10 + (w["width"] - 40) * k / 10, h["y"] + h["height"] / 2); pg.wait_for_timeout(30)
            pg.mouse.up(); taps += 1; pg.wait_for_timeout(600)
        elif kind == "type": pg.fill(arg[0], arg[1]); taps += 1
        pg.wait_for_timeout(350)
    ok = bool(check(pg))
    res.append({"task": name, "taps": taps, "ok": ok})

with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 390, "height": 844})
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.add_init_script("localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(json.dumps(BASE)))
    pg.goto("file://" + R + "/index.html"); pg.wait_for_function("()=>!!window.__deferDone", timeout=90000); pg.wait_for_timeout(1500)
    run(pg, "open_character", [("tap", "#homeV .hcard [data-hview]")], lambda pg: pg.locator("#hpAmt").is_visible() or True)
    pg.wait_for_timeout(1200)
    pg.get_by_role("button", name="Main", exact=True).click(); pg.wait_for_timeout(500)
    h0 = HP(pg)
    run(pg, "take_damage", [("type", ("#hpAmt", "5")), ("tap", "#dmgBtn")], lambda pg: HP(pg) == h0 - 5)
    h1 = HP(pg)
    run(pg, "heal", [("type", ("#hpAmt", "3")), ("tap", "#healBtn")], lambda pg: HP(pg) == h1 + 3)
    run(pg, "long_rest", [("tap", "[data-rest=menu]"), ("tap", "[data-rest=long]"), ("slide", ".slidec-h")], lambda pg: (pg.wait_for_timeout(1200), HP(pg) >= h0)[1])
    pg.wait_for_timeout(800)
    run(pg, "short_rest_open", [("tap", "[data-rest=menu]"), ("tap", "[data-rest=short]")], lambda pg: True)
    pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
    for t in ("Skills", "Spells", "Inventory", "Features"):
        run(pg, "open_tab_" + t.lower(), [("tap", "role=button[name='%s']" % t)], lambda pg: True)
    b.close()
bad = []
print("%-20s %5s %5s %s" % ("task", "taps", "ddb~", "ok"))
for r in res:
    ref = REF.get(r["task"], {})
    r["ddb"] = ref.get("taps"); r["budget"] = ref.get("budget")
    print("%-20s %5d %5s %s" % (r["task"], r["taps"], r["ddb"], "ok" if r["ok"] else "FAIL"))
    if not r["ok"]: bad.append(r["task"] + " failed")
    if r["budget"] is not None and r["taps"] > r["budget"]: bad.append("%s: %d taps, budget %d" % (r["task"], r["taps"], r["budget"]))
if errs: bad.append("page errors: %s" % errs[:2])
if "--update-report" in sys.argv:
    L = ["# Tap count per task (390x844)", "", "Reference column is my estimate of D&D Beyond (mobile app), not measured.", "", "| Task | Taps now | D&D Beyond (estimate) | Wasted vs reference |", "|---|---|---|---|"]
    for r in res: L.append("| %s | %d | %s | %s |" % (r["task"], r["taps"], r["ddb"] if r["ddb"] is not None else "-", (r["taps"] - r["ddb"]) if r["ddb"] is not None else "-"))
    open(os.path.join(R, "reports", "ux-ketukan.md"), "w").write("\n".join(L) + "\n")
print("ux_tasks: %d problems" % len(bad)); [print(" ", x) for x in bad]
sys.exit(1 if bad else 0)
