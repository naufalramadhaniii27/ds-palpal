#!/usr/bin/env python3
"""T11 N14: effects that fit the device.

  python3 tests/fx_tier.py

1. Strong device, nothing saved: tier full, no mi-lite.
2. Weak device (2 cores, 2 GB), nothing saved: tier "lite (this device)", html has mi-lite, MI.full() false, mi-fx stays unsaved.
3. Weak device with mi-fx=full saved: the saved choice wins (full, no mi-lite).
4. Weak device, then the person picks full in Settings (MI.set): full wins at once.
Exit 1 on any failure."""
import asyncio, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
WEAK = "Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>2}); Object.defineProperty(navigator,'deviceMemory',{get:()=>2});"
STRONG = "Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8}); Object.defineProperty(navigator,'deviceMemory',{get:()=>8});"
STATE = "()=>({tier:window.__MI.tier(), lite:document.documentElement.classList.contains('mi-lite'), full:window.__MI.full(), saved:localStorage.getItem('mi-fx')})"
async def case(b, url, init, saved, after=None):
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, service_workers="block"); await ctx.add_init_script(init); pg = await ctx.new_page()
    await pg.goto(url); await pg.evaluate("s=>{ localStorage.clear(); if(s) localStorage.setItem('mi-fx',s); }", saved); await pg.reload()
    await pg.wait_for_function("()=>window.__MI&&typeof window.__MI.tier==='function'", timeout=30000); await pg.wait_for_timeout(2500)
    if after: await pg.evaluate(after)
    st = await pg.evaluate(STATE); await ctx.close(); return st
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        checks = [("strong, nothing saved", STRONG, None, None, lambda s: s["tier"] == "full" and not s["lite"] and s["full"]),
                  ("weak, nothing saved", WEAK, None, None, lambda s: s["tier"] == "lite (this device)" and s["lite"] and not s["full"] and s["saved"] is None),
                  ("weak, full saved", WEAK, "full", None, lambda s: s["tier"] == "full" and not s["lite"]),
                  ("weak, picks full", WEAK, None, "()=>window.__MI.set('mode','full')", lambda s: s["tier"] == "full" and not s["lite"] and s["saved"] == "full")]
        for name, init, saved, after, ok in checks:
            s = await case(b, url, init, saved, after); good = ok(s); print("ok  " if good else "FAIL", name, s)
            if not good: bad.append(name)
        await b.close()
    srv.shutdown(); print("fx_tier:", "ok" if not bad else "%d failures" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
