#!/usr/bin/env python3
"""A CSP violation (blocked request to another site) is listed in the problem report. Runs at 390x844 and 1250x850. Exit 0 when it passes."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def main():
    srv, url = serve(); fails = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            ctx = await b.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(url); await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>{ try{ fetch('https://example.com/x').catch(function(){}); }catch(e){} }"); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{ var b=document.querySelector('[data-hrep]'); if(b) b.click(); else if(window.__reportOpen) window.__reportOpen(); }")
            await pg.wait_for_timeout(600)
            txt = await pg.evaluate("()=>{ var t=document.getElementById('repTxt'); return t?t.value:''; }")
            ok = "CSP blocked connect-src" in txt
            print("ok  " if ok else "FAIL", "%dx%d" % vp, "CSP violation in report" if ok else (json.dumps(json.loads(txt).get("errors")) if txt else "report did not open"))
            fails += 0 if ok else 1; await ctx.close()
        await b.close()
    srv.shutdown(); sys.exit(1 if fails else 0)
asyncio.run(main())
