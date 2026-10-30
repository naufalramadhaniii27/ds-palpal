#!/usr/bin/env python3
"""Q1 rewards (hadiah): every reward follows its source switch, builds a sheet, and fixed effects reach the sheet.
  python3 tests/q_reward.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server, re
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
s = open(os.path.join(ROOT, "src", "data", "q01-reward.js"), encoding="utf-8").read()
IT = json.loads(s[s.index("var IT=") + 7: s.index(", ISP=")])
def serve():
    so = socket.socket(); so.bind(("127.0.0.1", 0)); port = so.getsockname()[1]; so.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
ITEMS = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}); b.src[c.id]=c.on; return window.__bldItems(b); }"""
SHEET = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}); b.src[c.id]=true; b.inv=(b.inv||[]).concat([{n:c.item,q:1,eq:true,at:true}]);
  var out={err:0}; try{ var sh=window.__bldSheetFor(b); out.ok=!!sh; out.def=sh&&sh.defenses||[]; out.abs=sh&&sh.abilities||null; out.sc=sh&&sh.abilities&&sh.abilities.sc||null; out.dark=sh&&sh.darkvision||0; }catch(e){ out.err=String(e&&e.message||e) } return out; }"""
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
            await pg.wait_for_function("()=>!!window.__bldItems&&!!window.WX", timeout=60000)
            for sid, rows in IT.items():
                names = [r[0] for r in rows]
                if sid in ("dmg", "core"):
                    on = await pg.evaluate(ITEMS, {"id": sid, "on": True}); mi = [n for n in names if n not in on]
                    check("%s %s on: every reward offered (%d)" % (tag, sid, len(names)), not mi, str(mi[:4])); continue
                off = await pg.evaluate(ITEMS, {"id": sid, "on": False}); on = await pg.evaluate(ITEMS, {"id": sid, "on": True})
                lo = [n for n in names if n in off]; mi = [n for n in names if n not in on]
                check("%s %s off: no reward offered" % (tag, sid), not lo, str(lo[:4]))
                check("%s %s on: every reward offered (%d)" % (tag, sid, len(names)), not mi, str(mi[:4]))
            bad = []
            for sid, rows in IT.items():
                for r in rows:
                    o = await pg.evaluate(SHEET, {"id": sid, "item": r[0]})
                    if o["err"] != 0 or not o["ok"]: bad.append((r[0], o["err"]))
            check("%s sheet builds with each of %d rewards" % (tag, sum(len(v) for v in IT.values())), not bad, str(bad[:4]))
            base = await pg.evaluate(SHEET, {"id": "cos", "item": "Dark Gift of Zantras, the Kingmaker"})
            ref = await pg.evaluate("()=>{ var b=window.__bldTestB(); var sh=window.__bldSheetFor(b); return {abs: sh.abilities}; }")
            check("%s Zantras adds a CHA bonus" % tag, len(base["abs"]["CHA"]["bonus"]) > len(ref["abs"]["CHA"]["bonus"]), "%s vs %s" % (base["abs"]["CHA"], ref["abs"]["CHA"]))
            d = await pg.evaluate(SHEET, {"id": "dmg14", "item": "Boon of the Stormborn"})
            check("%s Stormborn adds Lightning and Thunder immunity" % tag, sum(1 for x in d["def"] if x.get("v") in ("Lightning", "Thunder")) == 2, str(d["def"])[:200])
            d = await pg.evaluate(SHEET, {"id": "efa", "item": "Charm of Khyber"})
            check("%s Charm of Khyber gives Darkvision 120" % tag, d["dark"] >= 120, str(d["dark"]))
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:3]))
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
asyncio.run(main())
