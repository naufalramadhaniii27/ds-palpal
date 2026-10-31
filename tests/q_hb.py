#!/usr/bin/env python3
"""Stage R: homebrew library. Sources list is searchable, a source loads its file when switched on, rows show in QLIVE, and stay hidden when off.
  python3 tests/q_hb.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
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
            await pg.wait_for_function("()=>!!window.HBIDX&&!!window.__bldQLive", timeout=90000)
            n = await pg.evaluate("()=>window.HBIDX.length")
            check("%s homebrew sources listed (%d)" % (tag, n), n > 900)
            sid = await pg.evaluate("()=>{var s=window.HBIDX.filter(function(x){return /BB1000S|1000/i.test(x.tag+x.name)})[0]||window.HBIDX[0];return s.id}")
            off = await pg.evaluate("(i)=>{var b=window.__bldTestB();b.src=Object.assign({},b.src||{});b.src[i]=false;return (window.__bldQLive(b).homebrew||[]).length}", sid)
            check(tag + " rows hidden when off", off == 0, str(off))
            await pg.evaluate("(i)=>{var b=window.__bldTestB();b.src=Object.assign({},b.src||{});b.src[i]=true;window.__bldQLive(b);}", sid)
            await pg.wait_for_function("()=>window.QREFS&&window.QREFS.homebrew&&window.QREFS.homebrew.length>0", timeout=30000)
            on = await pg.evaluate("(i)=>{var b=window.__bldTestB();b.src=Object.assign({},b.src||{});b.src[i]=true;return (window.__bldQLive(b).homebrew||[]).length}", sid)
            check(tag + " source loads and shows rows (%d)" % on, on > 0, str(on))
            off2 = await pg.evaluate("(i)=>{var b=window.__bldTestB();b.src=Object.assign({},b.src||{});b.src[i]=false;return (window.__bldQLive(b).homebrew||[]).length}", sid)
            check(tag + " hidden again when switched off", off2 == 0, str(off2))
            check(tag + " no page errors", not errs, str(errs[:2]))
            await ctx.close()
        await br.close()
    srv.shutdown(); print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(1 if False in res else 0)
asyncio.run(main())
