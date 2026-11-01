#!/usr/bin/env python3
"""Compare the single-file page and the split page (tools/split_dist.py) on a slow network.
  python3 tests/measure_split.py SINGLE_DIR SPLIT_DIR [kbps] [rtt_ms] [cpu]      default 1600 kbps, 150 ms, CPU x1 (a common "Slow 4G" test profile)
The server compresses text with gzip like the host does. Every run starts with an empty cache and no service worker. Prints the median of 3 runs:
first contentful paint, time until all deferred parts ran (__deferDone), and the bytes received (compressed)."""
import asyncio, functools, gzip, http.server, os, socket, statistics, sys, threading
from playwright.async_api import async_playwright
def serve(directory):
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close(); cache = {}
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def do_GET(self):
            p = self.translate_path(self.path.split("?")[0])
            if os.path.isdir(p): p = os.path.join(p, "index.html")
            if not (os.path.isfile(p) and p.endswith((".html", ".js", ".json", ".css"))): return super().do_GET()
            if p not in cache:
                with open(p, "rb") as f: cache[p] = gzip.compress(f.read(), 6)
            body = cache[p]; self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8" if p.endswith(".html") else "text/javascript; charset=utf-8" if p.endswith(".js") else "application/json")
            self.send_header("Content-Encoding", "gzip"); self.send_header("Content-Length", str(len(body))); self.send_header("Cache-Control", "no-store"); self.end_headers(); self.wfile.write(body)
    class S(http.server.ThreadingHTTPServer):
        def handle_error(self, *a): pass
    srv = S(("127.0.0.1", port), functools.partial(Q, directory=directory)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def one(b, url, kbps, rtt, cpu):
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, service_workers="block"); pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg)
    await cdp.send("Network.enable"); await cdp.send("Network.emulateNetworkConditions", {"offline": False, "latency": rtt, "downloadThroughput": kbps * 125, "uploadThroughput": kbps * 125})
    if cpu > 1: await cdp.send("Emulation.setCPUThrottlingRate", {"rate": cpu})
    got = [0]; cdp.on("Network.loadingFinished", lambda e: got.__setitem__(0, got[0] + int(e.get("encodedDataLength", 0))))
    await pg.goto(url, wait_until="commit"); await pg.wait_for_function("()=>performance.getEntriesByName('first-contentful-paint').length>0", timeout=240000, polling=200)
    fcp = await pg.evaluate("()=>performance.getEntriesByName('first-contentful-paint')[0].startTime")
    await pg.wait_for_function("()=>!!window.__deferDone", timeout=240000, polling=200); done = await pg.evaluate("()=>window.__deferDone")
    await ctx.close(); return fcp / 1000, done / 1000, got[0] / 1048576
async def main():
    a = sys.argv[1:]; kbps = int(a[2]) if len(a) > 2 else 1600; rtt = int(a[3]) if len(a) > 3 else 150; cpu = int(a[4]) if len(a) > 4 else 1
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for name, d in (("single file", a[0]), ("split", a[1])):
            srv, url = serve(os.path.abspath(d)); r = [await one(b, url, kbps, rtt, cpu) for _ in range(3)]; srv.shutdown()
            m = lambda i: statistics.median(x[i] for x in r)
            print("%-12s first paint %5.1f s | all parts ran %5.1f s | received %5.2f MiB" % (name, m(0), m(1), m(2)))
        await b.close()
asyncio.run(main())
