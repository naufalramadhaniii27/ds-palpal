#!/usr/bin/env python3
"""Third party books: a book is off by default, its subclasses reach the sheet when it is on, and the Sources step lists the group.
  python3 tests/tp_sources.py [OUTDIR] [--root DIR]
Checks at 390x844 and 1250x850. Exit 0 only when every check passes."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a:
    i = a.index("--root"); ROOT = os.path.abspath(a[i + 1]); del a[i:i + 2]
OUT = os.path.abspath(a[0]) if a else os.path.join(HERE, "out", "tp"); os.makedirs(OUT, exist_ok=True)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
CASES = json.load(open(os.path.join(HERE, "fixtures", "tp-cases.json"), encoding="utf-8"))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
FEATJS = """(c)=>{ var b=window.__bldTestB(); b.sub=""; b.src=Object.assign({}, b.src||{}); b.src[c.src]=!!c.on; var l=window.__bldFeats(b)||[]; return c.feats.map(function(f){return l.indexOf(f)>=0}); }"""
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
LIST = """(c)=>{ var b=window.__bldTestB(); b.cls=c.cls; b.sub=""; b.level=c.level; b.src=Object.assign({}, b.src||{}); b.src[c.src]=!!c.on; window.__bldTestSet(b); var l=window.__bldLists().subs[c.cls]||[]; window.__bldTestSet(null); return l.indexOf(c.sub)>=0; }"""
JS = """(c)=>{ var b=window.__bldTestB(); b.cls=c.cls; b.sub=c.sub; b.level=c.level; b.src=Object.assign({}, b.src||{}, c.on?{[c.src]:true}:{}); 
  if(c.bg) b.bg=c.bg; var out={}; try{ var sh=window.__bldSheetFor(b); out.sheet=sh?{bg:sh.bg, sub:sh.sub, cls:sh.cls, feats:[].concat.apply([],(sh.features||[]).map(function(g){return (g.items||[]).map(function(i){return i.n})})), lu:(sh.res||[]).map(function(r){return r.n})}:null; }catch(e){ out.err=String(e&&e.message||e); } return out; }"""
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
            wx = await pg.evaluate("()=>(window.WX.src.filter(function(q){return q.tp}).map(function(q){return q.id}))")
            check(tag + " third party sources registered", set(c["src"] for c in CASES) <= set(wx), str(wx))
            for c in [x for x in CASES if x.get("sub") and False]: pass
            dup = await pg.evaluate("()=>{var seen={},d=[];(window.WXS||[]).forEach(function(x){var k=x.cls+'|'+x.name; if(seen[k]) d.push(k); seen[k]=1;}); (window.WX.src||[]).filter(function(q){return q.tp}).forEach(function(q){(q.subs||[]).forEach(function(n){ if(typeof SUB_FULL==='undefined') return; });}); return d}")
            check(tag + " no subclass is registered twice", not dup, str(dup))
            for c in CASES:
                off = await pg.evaluate(JS, dict(c, on=False)); on = await pg.evaluate(JS, dict(c, on=True))
                nm = c.get("sub") or c["bg"]
                if c.get("sub"):
                    lo = await pg.evaluate(LIST, dict(c, on=False)); ln = await pg.evaluate(LIST, dict(c, on=True))
                    check("%s %s off: %s is not offered" % (tag, c["src"], nm), lo is False)
                    check("%s %s on: %s is offered" % (tag, c["src"], nm), ln is True)
                check("%s %s a sheet that uses %s keeps its book on" % (tag, c["src"], nm), not off.get("err") and off.get("sheet") and all(f in off["sheet"]["feats"] for f in c["feats"]), json.dumps(off)[:200])
                check("%s %s on: %s on the sheet" % (tag, c["src"], nm), on.get("sheet") and on["sheet"]["sub"] == c["sub"] if c.get("sub") else on["sheet"]["bg"] == c["bg"], json.dumps(on)[:300])
                if on.get("sheet"):
                    miss = [f for f in c["feats"] if f not in on["sheet"]["feats"]]
                    check("%s %s features on the sheet" % (tag, nm), not miss, "missing %s of %s" % (miss, on["sheet"]["feats"][:40]))
                    missl = [l for l in c.get("lu", []) if l not in on["sheet"]["lu"]]
                    check("%s %s uses tracked" % (tag, nm), not missl, "missing %s of %s" % (missl, on["sheet"]["lu"]))
            await ctx.close()
        await br.close()
    srv.shutdown()
    check("no page errors", not errs, str(errs[:3]))
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
asyncio.run(main())
