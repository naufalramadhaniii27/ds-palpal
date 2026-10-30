#!/usr/bin/env python3
"""Healer (tshl), Summoner (tssm), Dr Dhrolin's Dinosaurs (tsdd), Griffon's Saddlebag (tsgs), Dark Matter (tsdm), all 2024:
species, backgrounds, feats, spells follow the book switch, items build a sheet, classes appear with the book.
  python3 tests/tp_p5g.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server, importlib
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(ROOT, "tools", "tp", "overlay")); sys.path.insert(0, os.path.join(ROOT, "tools"))
import tp_build
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
def load(pre, kind, attr):
    try: return getattr(importlib.import_module("%s_%s" % (pre, kind)), attr)
    except Exception: return {}
BOOKS = [b for b in tp_build.BOOKS if b["id"] in ("tshl", "tssm", "tsdd", "tsgs", "tsdm")]
LISTS = """(c)=>{ var b=window.__bldTestB(); var s={}; s[c.id]=c.on; b.src=Object.assign({}, b.src||{}, s); window.__bldTestSet(b);
  var o={sp:Object.keys(SPECIES), bg:Object.keys(BACKGROUNDS), ft:Object.keys(FEATS), spells:c.spells.filter(function(n){return window.__bldHasSpell(n)}), cls:Object.keys(window.CLASSES||{})}; window.__bldTestSet(null); return o; }"""
SHEET = """(c)=>{ var b=window.__bldTestB(); var s={}; s[c.id]=true; b.src=Object.assign({}, b.src||{}, s); if(c.sp) b.sp=c.sp; if(c.bg) b.bg=c.bg; if(c.item){ b.inv=(b.inv||[]).concat([{n:c.item,q:1,eq:true}]); }
  var out={err:0}; try{ var sh=window.__bldSheetFor(b); out.ok=!!sh; }catch(e){ out.err=String(e&&e.message||e) } return out; }"""
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
            await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.WX", timeout=60000)
            reg = await pg.evaluate("()=>window.WX.src.map(function(q){return q.id})")
            for bk in BOOKS:
                pre = bk["id"]; al = bk.get("alias")
                names = {"sp": list(load(pre, "species", "SPECIES")), "bg": list(load(pre, "bg", "BG")), "ft": list(load(pre, "feat", "FEATS")), "spells": list(load(pre, "spell", "TEXT"))}
                itn = [r[0] for r in load(pre, "item", "ITEMS")] if isinstance(load(pre, "item", "ITEMS"), list) else []
                cand = lambda L: L + ([n + " (%s)" % al for n in L] if al else [])
                q = {"id": pre, "spells": cand(names["spells"])}
                await pg.evaluate(LISTS, dict(q, on=False))
                off = await pg.evaluate(LISTS, dict(q, on=False)); on = await pg.evaluate(LISTS, dict(q, on=True))
                check("%s %s book registered" % (tag, pre), pre in reg)
                def act(L, n): return (n + " (%s)" % al) if al and (n + " (%s)" % al) in L else n
                fin = {k: [act(on[k], n) for n in v] for k, v in names.items()}
                for k, lab in (("sp", "species"), ("bg", "backgrounds"), ("ft", "feats"), ("spells", "spells")):
                    lo = [n for n in fin[k] if n in off[k] and n not in names[k] or (n in off[k] and al and n.endswith(" (%s)" % al))]
                    mi = [n for n in fin[k] if n not in on[k]]
                    check("%s %s off: no %s offered (%d)" % (tag, pre, lab, len(fin[k])), not lo, str(lo[:4])); check("%s %s on: every %s offered" % (tag, pre, lab), not mi, str(mi[:4]))
                for c in bk.get("cls", []):
                    nm = c.title().replace("_", " ")
                    check("%s %s class %s absent while off and present while on" % (tag, pre, nm), nm not in off["cls"] and nm in on["cls"], "off=%s on=%s" % (nm in off["cls"], nm in on["cls"]))
                for n in fin["sp"]:
                    o = await pg.evaluate(SHEET, {"id": pre, "sp": n}); check("%s %s sheet builds with species %s" % (tag, pre, n), o["err"] == 0 and o["ok"], str(o))
                for n in fin["bg"]:
                    o = await pg.evaluate(SHEET, {"id": pre, "bg": n}); check("%s %s sheet builds with background %s" % (tag, pre, n), o["err"] == 0 and o["ok"], str(o))
                bad = []
                for n in itn:
                    o = await pg.evaluate(SHEET, {"id": pre, "item": n})
                    if o["err"] != 0 or not o["ok"]: bad.append((n, o["err"]))
                check("%s %s sheet builds with each of %d items" % (tag, pre, len(itn)), not bad, str(bad[:5]))
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:3]))
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
asyncio.run(main())
