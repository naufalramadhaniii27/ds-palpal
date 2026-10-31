#!/usr/bin/env python3
"""T3: Library entries without an image, per category (all sources on). Writes reports/t3-noimage.json and prints counts.
  python3 tools/audit_t3.py"""
import asyncio, json, os, socket, threading, functools, http.server
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def serve():
    so = socket.socket(); so.bind(("127.0.0.1", 0)); port = so.getsockname()[1]; so.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def main():
    srv, url = serve()
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await (await br.new_context()).new_page()
        await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
        await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>!!window.QIMG&&!!window.__libIndex&&!!window.QREFS&&!!window.QREFS.monster", timeout=90000)
        r = await pg.evaluate("""()=>{ var out={}; Object.keys(window.QREFS).forEach(function(c){ if(c==='homebrew') return; var o=out[c]=[0,0,[]]; window.QREFS[c].forEach(function(q){ o[0]++; if(!q.im){ o[1]++; o[2].push(q.n) } }) });
          var idx=window.__libIndex(); idx.forEach(function(e){ var c=e[0]; if(window.QREFS[c]||!window.QIMG[c]) return; var o=out[c]=out[c]||[0,0,[]]; o[0]++; if(!window.QIMG[c][e[2]]){ o[1]++; o[2].push(e[1]) } }); return out; }""")
        await br.close()
    srv.shutdown()
    json.dump({k: v[2] for k, v in r.items()}, open(os.path.join(ROOT, "reports", "t3-noimage.json"), "w"), ensure_ascii=False)
    for k, v in sorted(r.items(), key=lambda x: -x[1][1]): print("%-10s total %5d  no image %5d" % (k, v[0], v[1]))
asyncio.run(main())
