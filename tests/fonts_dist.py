"""M15: the hosting form (dist/) has fonts as files. Checks: no font data URI left in index.html, the two preloaded fonts load first, all font files
are stored by the service worker, fonts still load offline."""
import functools, http.server, os, socket, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); DIST = tempfile.mkdtemp()
subprocess.run([sys.executable, os.path.join(ROOT, "tools", "split_dist.py"), os.path.join(ROOT, "index.html"), os.path.join(ROOT, "sw.js"), DIST], check=True, capture_output=True)
for n in os.listdir(ROOT):  # links to everything else in the repo (icons, manifest, data), as tests/split_dist.py does
    if n in (".git", "index.html", "sw.js", "p", "dist", ".wrangler", "node_modules", "fonts"): continue
    if not os.path.exists(os.path.join(DIST, n)): os.symlink(os.path.join(ROOT, n), os.path.join(DIST, n))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=DIST)); threading.Thread(target=srv.serve_forever, daemon=True).start()
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:200]))
html = open(os.path.join(DIST, "index.html"), encoding="utf-8").read()
nfiles = len([f for f in os.listdir(os.path.join(DIST, "fonts")) if f.endswith(".woff2")])
check("no font data URI in index.html", "data:font" not in html)
check("22 font files in dist/fonts", nfiles == 22, nfiles)
check("index.html under 2 MB", len(html.encode("utf-8")) < 2 * 1024 * 1024, len(html))
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); reqs = []; errs = []
    pg.on("request", lambda r: reqs.append(r.url.split("/")[-1]) if "woff2" in r.url else None); pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:%d/index.html" % port); pg.wait_for_timeout(4000)
    check("first two font requests are the preloaded Roboto 400 and 500", len(reqs) >= 2 and reqs[0].startswith("Roboto-400") and reqs[1].startswith("Roboto-500"), reqs[:3])
    loaded = pg.evaluate("[...document.fonts].filter(f=>f.status==='loaded').length")
    check("fonts loaded online", loaded >= 5, loaded)
    pg.wait_for_function("async()=>{var n=0;for(var k of await caches.keys()){var c=await caches.open(k);n+=(await c.keys()).filter(r=>/woff2/.test(r.url)).length}return n>=22}", timeout=30000)
    check("service worker stored all font files", True)
    ctx.set_offline(True); pg.reload(); pg.wait_for_timeout(3000)
    check("fonts load offline", pg.evaluate("[...document.fonts].filter(f=>f.status==='loaded').length") >= 5)
    check("no page errors", not errs, errs)
    b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
