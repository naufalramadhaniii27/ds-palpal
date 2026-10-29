#!/usr/bin/env python3
"""A3: PDF export builds a real PDF from this site's own libraries (no CDN), at 390x844 and 1250x850.
  python3 tests/pdf_export.py [OUTDIR] [--root DIR]
Opens Yudhi, taps Export PDF, waits for the download, checks it starts with %PDF, has pages, and that no request left the local server."""
import asyncio, os, sys, functools, http.server, socket, threading, re
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
if "--root" in args: i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "pdf"); os.makedirs(OUT, exist_ok=True)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in ((390, 844), (1250, 850)):
            ctx = await b.new_context(viewport={"width": w, "height": h}, accept_downloads=True); pg = await ctx.new_page(); errs = []; outside = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            pg.on("request", lambda r: outside.append(r.url) if not r.url.startswith(url.rsplit("/", 1)[0]) and not r.url.startswith(("data:", "blob:")) else None)
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v);}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(1200); await pg.click("[data-hview]")
            await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1000)
            async with pg.expect_download(timeout=120000) as dl:
                await pg.evaluate("()=>document.getElementById('pdfBtn').click()")
            d = await dl.value; p = os.path.join(OUT, "%dx%d.pdf" % (w, h)); await d.save_as(p)
            data = open(p, "rb").read(); pages = len(re.findall(rb"/Type\s*/Page[^s]", data))
            tag = "%dx%d" % (w, h); print(tag, "pdf bytes", len(data), "pages", pages)
            if not data.startswith(b"%PDF"): bad.append(tag + " not a PDF")
            if pages < 1: bad.append(tag + " no pages")
            if errs: bad.append(tag + " page errors: " + "; ".join(errs[:3]))
            if outside: bad.append(tag + " requests outside the site: " + ", ".join(sorted(set(outside))[:3]))
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("ok" if not bad else "%d problems" % len(bad)); return 1 if bad else 0
sys.exit(asyncio.run(main()))
