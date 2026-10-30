#!/usr/bin/env python3
"""Exploring Eberron 2024 (tee24): species, backgrounds, feats, spells and items follow the book switch, and a sheet builds for each.
  python3 tests/tp_ee24.py [--root DIR]"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "tools", "tp", "overlay"))
import tee24_species as S, tee24_bg as B, tee24_feat as F, tee24_spell as P, tee24_item as I
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
LISTS = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tee24:c.on}); window.__bldTestSet(b);
  var o={sp:Object.keys(SPECIES), bg:Object.keys(BACKGROUNDS), ft:Object.keys(FEATS), spells:c.spells.filter(function(n){return window.__bldHasSpell(n)})}; window.__bldTestSet(null); return o; }"""
SHEET = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tee24:true}); if(c.sp) b.sp=c.sp; if(c.bg) b.bg=c.bg; if(c.item){ b.inv=(b.inv||[]).concat([{n:c.item,q:1,eq:true}]); }
  var out={err:0}; try{ var sh=window.__bldSheetFor(b); out.ok=!!sh; out.sp=sh&&sh.species; out.bg=sh&&sh.bg; out.inv=(sh&&sh.inv||[]).length; }catch(e){ out.err=String(e&&e.message||e) } return out; }"""
async def main():
    srv, url = serve(); errs = []
    spn = list(S.SPECIES); bgn = list(B.BG); ftn = list(F.FEATS); spl = list(P.TEXT); itn = [r[0] for r in I.ITEMS]
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
            await pg.evaluate(LISTS, {"on": False, "spells": spl})
            off = await pg.evaluate(LISTS, {"on": False, "spells": spl}); on = await pg.evaluate(LISTS, {"on": True, "spells": spl})
            check(tag + " book registered", "tee24" in await pg.evaluate("()=>window.WX.src.map(function(q){return q.id})"))
            for k, names, lab in (("sp", spn, "species"), ("bg", bgn, "backgrounds"), ("ft", ftn, "feats"), ("spells", spl, "spells")):
                lo = [n for n in names if n in off[k]]; mi = [n for n in names if n not in on[k]]
                check("%s off: no %s offered" % (tag, lab), not lo, str(lo)); check("%s on: every %s offered" % (tag, lab), not mi, str(mi))
            for n in spn:
                o = await pg.evaluate(SHEET, {"sp": n}); check("%s sheet builds with species %s" % (tag, n), o["err"] == 0 and o["ok"], str(o))
            for n in bgn:
                o = await pg.evaluate(SHEET, {"bg": n}); check("%s sheet builds with background %s" % (tag, n), o["err"] == 0 and o["ok"], str(o))
            bad = []
            for n in itn:
                o = await pg.evaluate(SHEET, {"item": n})
                if o["err"] != 0 or not o["ok"]: bad.append((n, o["err"]))
            check("%s sheet builds with each of %d items" % (tag, len(itn)), not bad, str(bad[:5]))
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:3]))
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
asyncio.run(main())
