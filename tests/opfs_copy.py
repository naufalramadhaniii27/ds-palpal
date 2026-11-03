#!/usr/bin/env python3
"""N48: OPFS copy. python3 tests/opfs_copy.py
1 the copy is written after a change, 2 after IndexedDB and localStorage are cleared (CDP, file systems kept) the app offers the copy,
3 Restore Copy brings the characters back, 4 a fresh start with Not Now keeps the old copy as cs-copy-prev.json and nothing is
overwritten before the answer, 5 no copy and no data: no offer."""
import json, os, sys, socket, threading, functools, http.server
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); R = os.path.dirname(HERE)
BASE = json.load(open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8"))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=R)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
bad = []
def chk(c, m):
    print(("ok   " if c else "FAIL ") + m)
    if not c: bad.append(m)
def boot(pg, url):
    pg.goto(url); pg.wait_for_function("()=>!!window.__deferDone", timeout=90000); pg.wait_for_timeout(1500)
srv, url = serve()
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={"width": 390, "height": 844}); pg = ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    # 5 no data and no copy: no offer
    boot(pg, url)
    chk(pg.evaluate("()=>window.__opfs&&window.__opfs.can()"), "OPFS writable is supported here")
    chk(pg.evaluate("()=>!window.__opfs.hold()") and pg.locator(".ask").count() == 0, "fresh start without a copy: no offer, no hold")
    # 1 write after data exists
    pg.evaluate("(c)=>{__store.setItem('yudhi-kelapa-build-v3',c);__store.setItem('yudhi-kelapa-sheet-v1',c)}", json.dumps(BASE))
    pg.evaluate("()=>__store.flush()"); pg.wait_for_timeout(300)
    chk(pg.evaluate("()=>window.__opfs.write()"), "copy written")
    cp = pg.evaluate("()=>window.__opfs.read().then(o=>o&&Object.keys(o.keys))")
    chk(cp and "yudhi-kelapa-sheet-v1" in cp, "copy holds the sheet key (%s keys)" % (len(cp) if cp else 0))
    # trailing write after a change (store flush event)
    pg.evaluate("()=>{__store.setItem('cs-test-key','x1')}")
    for _ in range(36):
        if pg.evaluate("()=>window.__opfs.read().then(o=>o&&o.keys['cs-test-key'])") == "x1": break
        pg.wait_for_timeout(1000)
    chk(pg.evaluate("()=>window.__opfs.read().then(o=>o&&o.keys['cs-test-key'])") == "x1", "a change reaches the copy within 30 s of the last write")
    # 2 wipe IndexedDB and localStorage only
    cdp = ctx.new_cdp_session(pg); origin = url.rsplit("/", 1)[0]
    cdp.send("Storage.clearDataForOrigin", {"origin": origin, "storageTypes": "indexeddb,local_storage"})
    pg.goto("about:blank"); boot(pg, url)
    pg.wait_for_selector(".ask", timeout=20000)
    txt = pg.inner_text(".ask p")
    chk("copy from" in txt and "Restore" in pg.inner_text(".ask"), "offer shown: " + txt[:90])
    chk(pg.evaluate("()=>window.__opfs.hold()"), "writes are held while the offer is open")
    # 4 decline keeps the old copy as prev
    pg.click(".ask [data-alt]"); pg.wait_for_timeout(800)
    chk(pg.evaluate("()=>window.__opfs.prev().then(t=>!!t&&t.indexOf('yudhi-kelapa-sheet-v1')>0)"), "Not Now keeps the old copy as cs-copy-prev.json")
    chk(pg.evaluate("()=>!window.__opfs.hold()"), "hold released after Not Now")
    # 3 wipe again, accept
    cdp.send("Storage.clearDataForOrigin", {"origin": origin, "storageTypes": "indexeddb,local_storage"})
    # restore the main copy first (the decline path did not remove it; write may have replaced it with empty? it must not)
    chk(pg.evaluate("()=>window.__opfs.read().then(o=>!!o)"), "main copy still readable after the decline")
    pg.goto("about:blank"); boot(pg, url); pg.wait_for_selector(".ask", timeout=20000)
    pg.click(".ask [data-yes]"); pg.wait_for_timeout(500)
    pg.wait_for_function("()=>!!window.__deferDone", timeout=90000); pg.wait_for_timeout(2000)
    got = pg.evaluate("()=>[__store.getItem('yudhi-kelapa-sheet-v1')?JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).name:null, __store.getItem('cs-test-key')]")
    chk(got[0] == BASE.get("name") and got[1] == "x1", "Restore Copy brings the data back: %s" % got)
    chk(pg.locator(".ask").count() == 0, "no second offer after the restore")
    chk(not errs, "no page errors %s" % errs[:2])
    b.close()
srv.shutdown()
print("opfs_copy: %d failed" % len(bad)); sys.exit(1 if bad else 0)
