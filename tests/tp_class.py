#!/usr/bin/env python3
"""Classes of third party books (window.WXC): present only while the book is on or the build uses the class, the sheet builds at levels 1, 5, 9 and 20,
every class feature has text, the picks of optional features are offered.
  python3 tests/tp_class.py [--root DIR]   Exit 0 only when every check passes. 390x844 and 1250x850."""
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
JS = """()=>{var out={};Object.keys(window.WXC||{}).forEach(function(cn){var e=WXC[cn],o={};
  var T=window.__bldTestB;
  var b=T();b.cls='Fighter';b.sub='';b.level=5;b.mc=[];b.src=Object.assign({},b.src||{});b.src[e.book]=false;window.__bldTestSet(b);o.offGone=!CLASSES[cn];
  b=T();b.cls='Fighter';b.src[e.book]=true;window.__bldTestSet(b);o.onListed=!!CLASSES[cn];
  o.empty=(e.rec.f||[]).filter(function(x){return !x[2]}).map(function(x){return x[0]+' '+x[1]});
  o.lv={};[1,5,9,20].forEach(function(L){b=T();b.cls=cn;b.sub='';b.level=L;b.src[e.book]=true;try{window.__bldTestSet(b);var s=window.__bldSheetFor(T());o.lv[L]=(s&&s.cls===cn&&s.level===L)?'ok':'bad sheet';
     var cl=window.__bldChoiceList(T());o['picks'+L]=cl.filter(function(c){return c.feature&&(e.rec.pick||[]).some(function(p){return p.key===c.key})}).length}catch(x){o.lv[L]='ERR '+x.message}});
  var xs=(window.WXS||[]).filter(function(x){return x.cls===cn||(x.alt||[]).indexOf(cn)>=0}).map(function(x){return x.name});
  b=T();b.cls=cn;b.sub='';b.level=20;b.src[e.book]=true;window.__bldTestSet(b);var have=Object.keys((CLASSES[cn]||{}).subs||{});
  o.subsMissing=xs.filter(function(n){return have.indexOf(n)<0});o.nsubs=xs.length;o.subErr=[];
  xs.forEach(function(n){try{var q=T();q.cls=cn;q.sub=n;q.level=20;q.src[e.book]=true;window.__bldTestSet(q);var s=window.__bldSheetFor(T());if(!s||s.sub!==n)o.subErr.push(n+' bad')}catch(x){o.subErr.push(n+' '+x.message)}});
  b=T();b.cls=cn;b.sub='';b.level=3;b.src[e.book]=false;window.__bldTestSet(b);o.usedKeepsOn=!!CLASSES[cn]&&!!T().src[e.book];
  o.nopick=(e.rec.pick||[]).filter(function(p){return !p.list||!p.list.length}).length;
  window.__bldTestSet(null);out[cn]=o});return out}"""
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
            await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.WXC", timeout=60000)
            r = await pg.evaluate(JS)
            check("%s: classes registered" % tag, len(r) > 0, str(list(r)))
            for cn, o in r.items():
                check("%s %s: absent while the book is off" % (tag, cn), o["offGone"])
                check("%s %s: listed while the book is on" % (tag, cn), o["onListed"])
                check("%s %s: sheet builds at levels 1, 5, 9, 20" % (tag, cn), all(v == "ok" for v in o["lv"].values()), str(o["lv"]))
                check("%s %s: every class feature has text" % (tag, cn), not o["empty"], str(o["empty"])[:200])
                check("%s %s: %d subclasses offered" % (tag, cn, o["nsubs"]), not o["subsMissing"], str(o["subsMissing"])[:200])
                check("%s %s: sheet builds with each subclass at level 20" % (tag, cn), not o["subErr"], str(o["subErr"])[:300])
                check("%s %s: a build that uses the class keeps it" % (tag, cn), o["usedKeepsOn"])
                check("%s %s: optional feature picks have options" % (tag, cn), o["nopick"] == 0)
    srv.shutdown()
    check("no page errors", not errs, str(errs)[:300])
    print("%d checks, %d failed" % (len(res), res.count(False)))
asyncio.run(main()); sys.exit(0 if all(res) else 1)
