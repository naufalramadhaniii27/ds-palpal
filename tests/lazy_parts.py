"""Fase 2.2: part q7 (monster rows) is lazy. Single file and hosting form (dist/): after the page is ready the rows are not loaded, QREFS.monster is a getter;
the first read (Library search, QLIVE test hook) loads them once; the sheet and builder still work; the dist form also works offline with the lazy file in the cache."""
import functools, http.server, json, os, socket, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); DIST = tempfile.mkdtemp()
subprocess.run([sys.executable, os.path.join(ROOT, "tools", "split_dist.py"), os.path.join(ROOT, "index.html"), os.path.join(ROOT, "sw.js"), DIST], check=True, capture_output=True)
for n in os.listdir(ROOT):
    if n in (".git", "index.html", "sw.js", "p", "dist", ".wrangler", "node_modules", "fonts"): continue
    if not os.path.exists(os.path.join(DIST, n)): os.symlink(os.path.join(ROOT, n), os.path.join(DIST, n))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=DIST)); threading.Thread(target=srv.serve_forever, daemon=True).start()
d = json.load(open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8"))
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(json.dumps(d)) + ")"
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:200]))
STATE = "()=>{var d=Object.getOwnPropertyDescriptor(window.QREFS,'monster');return d?(d.get?'lazy':'loaded:'+d.value.length):'none'}"
with sync_playwright() as p:
    b = p.chromium.launch()
    for form, url in (("single file", "file://" + os.path.join(ROOT, "index.html")), ("dist", "http://127.0.0.1:%d/index.html" % port)):
        for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            ctx = b.new_context(viewport={"width": w, "height": h}); ctx.add_init_script(SEED); pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
            t = form + " " + vp
            pg.goto(url); pg.wait_for_function("()=>!!window.__deferDone", timeout=60000); pg.wait_for_timeout(4000)
            check(t + " monster rows not loaded after the page is ready", pg.evaluate(STATE) == "lazy", pg.evaluate(STATE))
            check(t + " lazy script still in the page", pg.evaluate("()=>!!document.querySelector('script[data-lazy][data-defer=q7]')"))
            q = pg.evaluate("()=>window.__libFind&&window.__libFind('Animated Coffin')")
            check(t + " Library finds a monster", q and any("Animated Coffin" in x for x in q), q)
            st = pg.evaluate(STATE); check(t + " rows loaded after the first read", st.startswith("loaded:") and int(st.split(":")[1]) > 300, st)
            check(t + " lazy script gone after it ran", not pg.evaluate("()=>!!document.querySelector('script[data-lazy][data-defer=q7]')"))
            ql = pg.evaluate("()=>Object.keys(window.__bldQLive?window.__bldQLive():{})")
            check(t + " QLIVE lists monster", "monster" in ql, ql)
            check(t + " sheet shows the character", pg.evaluate("()=>document.body.innerText.length")>200)
            check(t + " no page errors", not errs, errs); ctx.close()
    ctx = b.new_context(viewport={"width": 390, "height": 844}); ctx.add_init_script(SEED); pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://127.0.0.1:%d/index.html" % port); pg.wait_for_function("()=>!!window.__deferDone", timeout=60000); pg.wait_for_timeout(1500)
    pg.wait_for_function("async()=>{for(var k of await caches.keys()){var c=await caches.open(k);if((await c.keys()).some(r=>/p\\/q7\\./.test(r.url)))return true}return false}", timeout=60000)
    check("dist: service worker stored the lazy file", True)
    ctx.set_offline(True); pg.reload(); pg.wait_for_function("()=>!!window.__deferDone", timeout=60000); pg.wait_for_timeout(6000)
    q = pg.evaluate("()=>window.__libFind&&window.__libFind('Animated Coffin')")
    check("dist offline: Library finds a monster", q and any("Animated Coffin" in x for x in q), q)
    check("dist offline: no page errors", not errs, errs)
    b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
