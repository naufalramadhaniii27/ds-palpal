#!/usr/bin/env python3
"""Three required scenarios (old Yudhi sheet, after Apply from the builder, new character) at 390x844 and 1250x850.

  python3 tests/scenarios.py [OUTDIR] [--root DIR]

Serves DIR (default: the repo root) on a local port, runs Chromium headless through Playwright, and writes to OUTDIR
(default: tests/out): screenshots, storage-<viewport>-<scenario>.json (localStorage after each scenario) and result.json.
Exit code 0 only when every check passes, there is no page error, and no native dialog (alert/confirm) opened.
"""
import asyncio, json, os, re, socket, sys, threading, functools, http.server
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:]]
ROOT = os.path.dirname(HERE)
if "--root" in args:
    i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
VIEWPORTS = [("390x844", 390, 844), ("1250x850", 1250, 850)]


def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a):
            pass
    h = functools.partial(Quiet, directory=ROOT)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port


async def answer_asks(pg, log, ok=True):
    """Answer the app's own ask() dialogs (sheet: div.ask, builder: div.exp[role=dialog]). ok=True picks the primary button."""
    for _ in range(4):
        await pg.wait_for_timeout(400)
        d = None
        for cand in await pg.query_selector_all(".ask, .exp[role=dialog]"):
            if await cand.is_visible():
                d = cand
        if not d:
            return
        txt = (await d.inner_text()).strip().replace("\n", " ")[:160]
        btns = await d.query_selector_all("button")
        pick = None
        for b in btns:
            cls = await b.get_attribute("class") or ""
            if ok and ("pri" in cls or await b.get_attribute("data-yes")):
                pick = b
        pick = pick or btns[-1]
        log.append("ask: %s -> %s" % (txt, (await pick.inner_text()).strip()))
        await pick.click()


async def js_click(pg, sel):
    return await pg.evaluate("s=>{var e=document.querySelector(s); if(!e) return false; e.click(); return true}", sel)


async def click_text(pg, scope_sel, text):
    return await pg.evaluate("""([s,t])=>{var r=document.querySelector(s)||document;
      var b=Array.from(r.querySelectorAll('button,a')).filter(x=>x.offsetParent&&x.textContent.trim().toLowerCase()===t.toLowerCase())[0];
      if(!b) return false; b.click(); return true}""", [scope_sel, text])


async def storage(pg):
    return await pg.evaluate("()=>{var o={}; for(var i=0;i<(window.__store||localStorage).length;i++){var k=(window.__store||localStorage).key(i); o[k]=(window.__store||localStorage).getItem(k);} return o}")


async def sheet_numbers(pg):
    return await pg.evaluate("""()=>{var t=s=>{var e=document.querySelector(s); return e?e.textContent.replace(/\\s+/g,' ').trim():null};
      var C=null; try{C=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3'))}catch(e){}
      var R=null; try{R=JSON.parse(localStorage.getItem('cs-roster-v1'))}catch(e){}
      return {title:document.title, name:C&&C.name, cls:C&&C.cls, level:C&&C.level,
        roster:R&&R.chars?Object.keys(R.chars).length:null,
        home:!!(document.getElementById('homeV')&&document.getElementById('homeV').offsetParent),
        builderOpen:!!(document.getElementById('bld')&&!document.getElementById('bld').hidden)}}""")


async def visible_text_has(pg, pat):
    t = await pg.evaluate("document.body.innerText")
    return bool(re.search(pat, t))


async def run_viewport(b, base, vp, W, H, res):
    ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block")
    pg = await ctx.new_page(); pg.set_default_timeout(120000)
    errs, dialogs, log = [], [], []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.on("dialog", lambda d: (dialogs.append(d.type + ": " + d.message), asyncio.ensure_future(d.dismiss())))
    checks = []
    def chk(name, ok, info=""):
        checks.append({"vp": vp, "check": name, "ok": bool(ok), "info": info})

    # 1. old Yudhi sheet: a device that has only the v3 sheet key from before the roster
    await pg.goto(base); await pg.wait_for_timeout(1500)
    await pg.evaluate("v=>{localStorage.clear(); sessionStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v)}", YUDHI)
    await pg.reload(); await pg.wait_for_timeout(3500)
    await answer_asks(pg, log, ok=False)
    chk("s1 Yudhi card on Home", await visible_text_has(pg, r"Yudhi Kelapa"))
    viewed = await pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(!b) return false; b.click(); return true}")
    await pg.wait_for_timeout(2500)
    await pg.screenshot(path=os.path.join(OUT, "%s-s1-yudhi.png" % vp))
    n = await sheet_numbers(pg)
    chk("s1 View opens the sheet", viewed and not n["home"], json.dumps(n))
    chk("s1 Yudhi numbers (Fighter 4, AC 17, HP 40)", n["name"] == "Yudhi Kelapa" and n["level"] == 4
        and await visible_text_has(pg, r"Armor Class\s*17") and await visible_text_has(pg, r"\b40\b"))
    st1 = await storage(pg); json.dump(st1, open(os.path.join(OUT, "storage-%s-s1.json" % vp), "w"), indent=1, sort_keys=True)

    # 2. Build, then Apply to Sheet. SCEN_WAIT_BUILD=ms waits first (to compare runs where the builder finished loading in the background)
    if os.environ.get("SCEN_WAIT_BUILD"): await pg.wait_for_timeout(int(os.environ["SCEN_WAIT_BUILD"]))
    # the builder loads in the background: wait until its code is there (no fixed guess, slow machines and parallel runs need longer)
    await pg.wait_for_function("typeof window.__bldOpen==='function'", timeout=180000)
    await js_click(pg, "#bldBtn"); await pg.wait_for_timeout(4000)
    await answer_asks(pg, log)
    n = await sheet_numbers(pg)
    for _ in range(40):  # the builder may open late under load; the assert below is unchanged
        if n["builderOpen"]: break
        await pg.wait_for_timeout(1000); await answer_asks(pg, log); n = await sheet_numbers(pg)
    chk("s2 builder opens", n["builderOpen"], json.dumps(n))
    await pg.screenshot(path=os.path.join(OUT, "%s-s2-builder.png" % vp))
    await js_click(pg, "#b-toSheet"); await pg.wait_for_timeout(2500)
    await answer_asks(pg, log)
    await pg.wait_for_timeout(1500)
    n = await sheet_numbers(pg)
    await pg.screenshot(path=os.path.join(OUT, "%s-s2-applied.png" % vp))
    st2 = await storage(pg); json.dump(st2, open(os.path.join(OUT, "storage-%s-s2.json" % vp), "w"), indent=1, sort_keys=True)
    chk("s2 Apply closes the builder and keeps Yudhi", not n["builderOpen"] and n["name"] == "Yudhi Kelapa", json.dumps(n))
    chk("s2 build saved (phb24-builder-v1)", "phb24-builder-v1" in st2)
    chk("s2 sheet after Apply: AC 17, HP 40", await visible_text_has(pg, r"Armor Class\s*17") and await visible_text_has(pg, r"\b40\b"))

    # 3. new character from Home
    await js_click(pg, "#rosterBtn"); await pg.wait_for_timeout(2000)
    await answer_asks(pg, log, ok=False)
    created = await click_text(pg, "#homeV", "Create a Character")
    await pg.wait_for_timeout(5000)
    await answer_asks(pg, log)
    n = await sheet_numbers(pg)
    for _ in range(40):  # the builder may open late under load; the assert below is unchanged
        if n["builderOpen"]: break
        await pg.wait_for_timeout(1000); await answer_asks(pg, log); n = await sheet_numbers(pg)
    chk("s3 Create a Character opens the builder", created and n["builderOpen"], json.dumps(n))
    await pg.select_option("#qbCls", "Fighter")
    await js_click(pg, "[data-qb]"); await pg.wait_for_timeout(2500)
    await answer_asks(pg, log)
    await pg.screenshot(path=os.path.join(OUT, "%s-s3-builder.png" % vp))
    await js_click(pg, "#b-toSheet"); await pg.wait_for_timeout(2500)
    await answer_asks(pg, log)
    await pg.wait_for_timeout(1500)
    n = await sheet_numbers(pg)
    await pg.screenshot(path=os.path.join(OUT, "%s-s3-applied.png" % vp))
    st3 = await storage(pg); json.dump(st3, open(os.path.join(OUT, "storage-%s-s3.json" % vp), "w"), indent=1, sort_keys=True)
    chk("s3 new character on the sheet, roster has 2", not n["builderOpen"] and n["roster"] == 2 and n["name"] != "Yudhi Kelapa", json.dumps(n))
    r = json.loads(st3.get("cs-roster-v1") or "{}")
    names = sorted(v.get("name", "?") for v in (r.get("chars") or {}).values() if isinstance(v, dict))
    chk("s3 Yudhi still in the roster", "Yudhi Kelapa" in names, json.dumps(names))

    chk("no page errors", not errs, "; ".join(errs[:5]))
    chk("no native dialogs", not dialogs, "; ".join(dialogs[:5]))
    res["checks"] += checks; res["log"][vp] = log
    await ctx.close()


async def main():
    srv, base = serve()
    res = {"root": ROOT, "checks": [], "log": {}}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vp, W, H in VIEWPORTS:
            await run_viewport(b, base, vp, W, H, res)
        await b.close()
    srv.shutdown()
    bad = [c for c in res["checks"] if not c["ok"]]
    json.dump(res, open(os.path.join(OUT, "result.json"), "w"), indent=1)
    for c in res["checks"]:
        print("%-4s %-9s %s %s" % ("ok" if c["ok"] else "FAIL", c["vp"], c["check"], "" if c["ok"] else c["info"]))
    print("%d checks, %d failed" % (len(res["checks"]), len(bad)))
    return 1 if bad else 0

sys.exit(asyncio.run(main()))
