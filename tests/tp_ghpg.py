#!/usr/bin/env python3
"""Grim Hollow Player's Guide 2024 (tghp): species, backgrounds, feats, spells and items follow the book switch, and a sheet builds for each.
  python3 tests/tp_ee24.py [--root DIR]"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "tools", "tp", "overlay"))
import tghp_species as S, tghp_bg as B, tghp_feat as F, tghp_spell as P, tghp_item as I
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
LISTS = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tghp:c.on}); window.__bldTestSet(b);
  var o={sp:Object.keys(SPECIES), bg:Object.keys(BACKGROUNDS), ft:Object.keys(FEATS), spells:c.spells.filter(function(n){return window.__bldHasSpell(n)})}; window.__bldTestSet(null); return o; }"""
SHEET = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tghp:true}); if(c.sp) b.sp=c.sp; if(c.bg) b.bg=c.bg; if(c.item){ b.inv=(b.inv||[]).concat([{n:c.item,q:1,eq:true}]); }
  var out={err:0}; try{ var sh=window.__bldSheetFor(b); out.ok=!!sh; out.sp=sh&&sh.species; out.bg=sh&&sh.bg; out.inv=(sh&&sh.inv||[]).length; }catch(e){ out.err=String(e&&e.message||e) } return out; }"""
CLS = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tghp:true}); b.cls="Monster Hunter"; b.level=c.lv; b.sub=c.lv>=3?"Carver Guild":""; var out={err:0}; try{ var sh=window.__bldSheetFor(b); out.ok=!!sh; out.cls=sh&&sh.cls; }catch(e){ out.err=String(e&&e.message||e) } return out; }"""
CLSLIST = """(on)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tghp:on}); window.__bldTestSet(b); var r=Object.keys(CLASSES).indexOf("Monster Hunter")>=0; window.__bldTestSet(null); return r; }"""
async def main():
    srv, url = serve(); errs = []
    spn = list(S.SPECIES); bgn = list(B.BG); ftn = list(F.FEATS); spl = list(P.TEXT); itn = [r[0] for r in I.ITEMS] + [g[0] for g in I.GEAR][:40]
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
            await pg.evaluate(LISTS, {"on": False, "spells": spl + [n + " (Grim Hollow)" for n in spl]})
            off = await pg.evaluate(LISTS, {"on": False, "spells": spl + [n + " (Grim Hollow)" for n in spl]}); on = await pg.evaluate(LISTS, {"on": True, "spells": spl + [n + " (Grim Hollow)" for n in spl]})
            check(tag + " book registered", "tghp" in await pg.evaluate("()=>window.WX.src.map(function(q){return q.id})"))
            def act(L, n): return (n + " (%s)") % "Grim Hollow" if ((n + " (%s)") % "Grim Hollow") in L else n
            spn = [act(on["sp"], n) for n in spn]; bgn = [act(on["bg"], n) for n in bgn]; ftn = [act(on["ft"], n) for n in ftn]; spl = [act(on["spells"], n) for n in spl]
            for k, names, lab in (("sp", spn, "species"), ("bg", bgn, "backgrounds"), ("ft", ftn, "feats"), ("spells", spl, "spells")):
                lo = [n for n in names if n in off[k]]; mi = [n for n in names if n not in on[k]]
                check("%s off: no %s offered" % (tag, lab), not lo, str(lo)); check("%s on: every %s offered" % (tag, lab), not mi, str(mi))
            for n in spn:
                o = await pg.evaluate(SHEET, {"sp": n}); check("%s sheet builds with species %s" % (tag, n), o["err"] == 0 and o["ok"], str(o))
            for n in bgn:
                o = await pg.evaluate(SHEET, {"bg": n}); check("%s sheet builds with background %s" % (tag, n), o["err"] == 0 and o["ok"], str(o))
            for lv in (1, 5, 20):
                o = await pg.evaluate(CLS, {"lv": lv}); check("%s sheet builds with Monster Hunter level %d" % (tag, lv), o["err"] == 0 and o["ok"] and o["cls"] == "Monster Hunter", str(o))
            offc = await pg.evaluate(CLSLIST, False); onc = await pg.evaluate(CLSLIST, True)
            check(tag + " Monster Hunter is off while the book is off", offc is False); check(tag + " Monster Hunter is offered when the book is on", onc is True)
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
