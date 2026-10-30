#!/usr/bin/env python3
"""Artificer Expansion Pack 2024 (tsae) and Grim Hollow Campaign Guide 2024 (tghg).
New Artificer subclasses follow the book switch, the upgrade picks reach the subclasses of the app only while the book is on, and every Campaign Guide item builds a sheet.
  python3 tests/tp_aep_ghcg.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "tools", "tp", "overlay"))
import tsae_sub as A, tsae_spell as AP, tghg_item as G
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
LISTS = """(c)=>{ var b=window.__bldTestB(); b.cls="Artificer"; b.level=20; b.sub=""; b.src=Object.assign({}, b.src||{}, {tsae:c.on}); window.__bldTestSet(b);
  var o={subs:Object.keys(CLASSES.Artificer.subs||{}), pk:{}, spells:c.spells.filter(function(n){return window.__bldHasSpell(n)})};
  c.ext.forEach(function(s){o.pk[s]=((CLASSES.Artificer.pickSub||{})[s]||[]).length}); window.__bldTestSet(null); return o; }"""
SHEET = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tsae:true,tghg:true}); b.cls="Artificer"; b.level=c.lv; b.sub=c.sub||"";
  if(c.item){ b.inv=(b.inv||[]).concat([{n:c.item,q:1,eq:true}]); } var out={err:0}; try{ var sh=window.__bldSheetFor(b); out.ok=!!sh; out.sub=sh&&sh.sub; }catch(e){ out.err=String(e&&e.message||e) } return out; }"""
async def main():
    srv, url = serve(); errs = []
    new = list(A.SUB); ext = sorted(set(e["sub"] for e in A.EXT)); spl = list(AP.TEXT); itn = [r[0] for r in G.ITEMS]
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.WX", timeout=60000)
            q = {"spells": spl, "ext": ext}
            await pg.evaluate(LISTS, dict(q, on=False))
            off = await pg.evaluate(LISTS, dict(q, on=False)); on = await pg.evaluate(LISTS, dict(q, on=True))
            check(tag + " off: no new Artificer subclass offered", not [n for n in new if n in off["subs"]], str(off["subs"]))
            check(tag + " on: every new Artificer subclass offered", not [n for n in new if n not in on["subs"]], str(on["subs"]))
            check(tag + " off: no spell offered", not off["spells"], str(off["spells"][:3])); check(tag + " on: every spell offered", len(on["spells"]) == len(spl), str(len(on["spells"])))
            for s in ext: check("%s upgrade picks reach %s only while the book is on" % (tag, s), on["pk"][s] > off["pk"][s], "%s vs %s" % (on["pk"][s], off["pk"][s]))
            for n in new:
                o = await pg.evaluate(SHEET, {"lv": 20, "sub": n}); check("%s sheet builds with %s" % (tag, n), o["err"] == 0 and o["ok"] and o["sub"] == n, str(o))
            bad = []
            for n in itn:
                o = await pg.evaluate(SHEET, {"lv": 5, "item": n})
                if o["err"] != 0 or not o["ok"]: bad.append((n, o["err"]))
            check("%s sheet builds with each of %d Campaign Guide items" % (tag, len(itn)), not bad, str(bad[:5]))
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:3]))
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
asyncio.run(main())
