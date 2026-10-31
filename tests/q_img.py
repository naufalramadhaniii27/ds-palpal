#!/usr/bin/env python3
"""Stages S and T: Library detail shows lore and an image that really loads.
  python3 tests/q_img.py"""
import asyncio, json, os, re, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    so = socket.socket(); so.bind(("127.0.0.1", 0)); port = so.getsockname()[1]; so.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d" % port
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
async def main():
    srv, base = serve(); errs = []
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(base + "/index.html"); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.QIMG&&!!window.__libHtml&&!!window.QREFS&&!!window.QREFS.monster", timeout=90000)
            # monsters with art and token
            r = await pg.evaluate("""()=>{ var b=window.__bldTestB(); b.src=Object.assign({},b.src||{}); (window.WX.src||[]).forEach(function(s){b.src[s.id]=true}); window.__bldQLive(b); var m=window.QLIVE.monster; var a=m.filter(function(x){return x.im&&x.im.indexOf('/tokens/')<0})[0], t=m.filter(function(x){return x.im&&x.im.indexOf('/tokens/')>0})[0];
              return {a:a&&a.n, t:t&&t.n, ha:a&&window.__libHtml('monster',a.n), ht:t&&window.__libHtml('monster',t.n), sp:window.__libHtml('species','Aasimar'), it:Object.keys(window.QIMG.item).length}; }""")
            for key, lab in (("ha", "art"), ("ht", "token")):
                h = r[key] or ""; m = re.search(r'src="(data/img/[^"]+)"', h)
                check("%s monster %s image tag" % (tag, lab), bool(m), h[:120])
                if m:
                    resp = await pg.request.get(base + "/" + m.group(1)); check("%s monster %s file loads (%d bytes)" % (tag, lab, len(await resp.body())), resp.status == 200)
            check(tag + " species Aasimar has lore", "Lore" in (r["sp"] or ""))
            check(tag + " item image index %d" % r["it"], r["it"] > 400)
            check(tag + " no page errors", not errs, str(errs[:2]))
            await ctx.close()
        await br.close()
    srv.shutdown(); print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(1 if False in res else 0)
asyncio.run(main())
