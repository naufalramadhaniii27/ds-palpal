#!/usr/bin/env python3
"""Third party items (TDCSR): rows exist while the book is on, effects reach the sheet.
  python3 tests/tp_items.py [--root DIR]   Exit 0 only when every check passes. 390x844 and 1250x850."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a:
    i = a.index("--root"); ROOT = os.path.abspath(a[i + 1]); del a[i:i + 2]
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
SPELLS = json.load(open(os.path.join(HERE, "fixtures", "tp-spells.json"), encoding="utf-8"))
async def main():
    srv, url = serve(); errs = []
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.__bldHasSpell", timeout=60000)
            for book, rows in SPELLS.items():
                o = await pg.evaluate("""(a)=>{var o={};[true,false].forEach(function(on){var b=window.__bldTestB();b.cls='Wizard';b.sub='';b.level=9;b.src=Object.assign({},b.src||{});b.src[a.id]=on;window.__bldTestSet(b);o[on]=a.rows.map(function(r){return window.__bldHasSpell(r[0])});window.__bldTestSet(null)});
                  o.full=a.rows.map(function(r){return (SPELL_FULL[r[0]]||'').length>40||!window.__bldHasSpell(r[0])});return o}""", {"id": book, "rows": rows})
                miss_on = [r[0] for r, v in zip(rows, o["true"]) if not v]
                on_off = [r[0] for r, v in zip(rows, o["false"]) if v]
                check("%s %s: %d spells offered while the book is on" % (tag, book, len(rows)), not miss_on, "missing " + str(miss_on)[:300])
                check("%s %s: no spell offered while the book is off" % (tag, book), not on_off, "leaking " + str(on_off)[:300])
    srv.shutdown()
    check("no page errors", not errs, str(errs)[:300])
    print("%d checks, %d failed" % (len(res), res.count(False)))
asyncio.run(main()); sys.exit(0 if all(res) else 1)
