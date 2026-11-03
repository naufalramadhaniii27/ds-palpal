#!/usr/bin/env python3
"""Split build (tools/split_dist.py): the same app from a page of about 1 MB gzip plus 34 part files.
390x844 and 1250x850, with the old Yudhi sheet. Checks:
  1 the sheet opens, every part runs in order, __deferDone is set, no page error, no CSP violation, each part is fetched once
  2 the window holds the same names as the single-file build (nothing lost, nothing added)
  3 __bldNeed() right after the gate, while the part files are slow, returns a Promise at once and makes the builder ready when it ends
  4 a part file that was changed on the way is refused by the CSP hash (nothing from it runs)
  5 offline: after the service worker stored the parts, a reload without network opens the sheet and the builder
Also prints the byte counts. Exit 1 on any failure.   python3 tests/split_dist.py"""
import asyncio, functools, http.server, json, os, re, socket, subprocess, sys, tempfile, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()


def make_site(d):
    """A copy of the site in d: the split index.html, sw.js and p/, and links to everything else in the repo."""
    r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "split_dist.py"), os.path.join(ROOT, "index.html"), os.path.join(ROOT, "sw.js"), d], capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stdout + r.stderr)
    print(r.stdout.strip())
    for n in os.listdir(ROOT):
        if n in (".git", "index.html", "sw.js", "p", "dist", ".wrangler", "node_modules"): continue
        t = os.path.join(d, n)
        if not os.path.exists(t): os.symlink(os.path.join(ROOT, n), t)


def serve(directory):
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(http.server.ThreadingHTTPServer):
        def handle_error(self, *a): pass  # a page that closes during a download is not a failure
    srv = S(("127.0.0.1", port), functools.partial(Q, directory=directory))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/" % port


async def fresh(b, w, h, url, sw="block"):
    ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers=sw); pg = await ctx.new_page(); log = {"err": [], "csp": [], "parts": []}
    pg.on("pageerror", lambda e: log["err"].append(str(e)))
    pg.on("console", lambda m: log["csp"].append(m.text[:160]) if ("Content Security Policy" in m.text or "Trusted Type" in m.text) else None)
    pg.on("request", lambda r: log["parts"].append(r.url) if "/p/" in r.url and r.url.endswith(".js") else None)
    await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3'," + json.dumps(FIX) + ");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"); await pg.goto(url + "index.html")
    return ctx, pg, log


async def done(pg, t=60000):
    await pg.wait_for_function("()=>!!window.__deferDone", timeout=t)


async def main():
    bad = []; tmp = tempfile.mkdtemp(prefix="split-site-"); make_site(tmp)
    srv, url = serve(tmp); srv1, url1 = serve(ROOT)
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        names1 = None
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h)
            # 1 and 2: cold load, then the same names as the single file
            ctx, pg, log = await fresh(b, w, h, url); log["parts"].clear(); await pg.reload(); await done(pg)
            left = await pg.evaluate("()=>document.querySelectorAll('script[type=\"text/x-defer\"]:not([data-lazy])').length")
            if left: bad.append("%s %d parts still waiting" % (vp, left))
            names = await pg.evaluate("()=>Object.getOwnPropertyNames(window).filter(k=>!/^(webkit|on)/.test(k)).sort().join('|')")
            if log["err"]: bad.append("%s page errors: %s" % (vp, log["err"][:2]))
            if log["csp"]: bad.append("%s CSP or Trusted Types messages: %s" % (vp, log["csp"][:2]))
            urls = [u for u in log["parts"]]
            if len(urls) != len(set(urls)) or len(set(urls)) != 34: bad.append("%s part requests: %d, different: %d (want 34 and 34)" % (vp, len(urls), len(set(urls))))
            if not await pg.evaluate("()=>typeof window.__bldOpen==='function'"): bad.append(vp + " the builder did not load")
            await ctx.close()
            ctx1, pg1, log1 = await fresh(b, w, h, url1); await pg1.reload(); await done(pg1)
            names1 = await pg1.evaluate("()=>Object.getOwnPropertyNames(window).filter(k=>!/^(webkit|on)/.test(k)).sort().join('|')")
            await ctx1.close()
            if names != names1:
                a, c = set(names.split("|")), set(names1.split("|"))
                bad.append("%s window names differ. only split: %s. only single: %s" % (vp, sorted(a - c)[:8], sorted(c - a)[:8]))
            else:
                print(vp, "ok: 35 parts (one lazy), %d window names equal to the single file" % len(names.split("|")))
            # 3: __bldNeed while the files are slow (M7: a Promise, no synchronous request)
            ctx, pg, log = await fresh(b, w, h, url)
            async def slow(route):
                await asyncio.sleep(1.2); await route.continue_()
            await pg.route(re.compile(r"/p/.*\.js$"), slow)
            await pg.reload(); await pg.wait_for_function("()=>!!window.__gateDone", timeout=30000)
            t0 = await pg.evaluate("()=>{ var t=performance.now(); var p=window.__bldNeed(); window.__needT=performance.now()-t; return [typeof (p&&p.then), typeof window.__bldOpen]; }")
            r = await pg.evaluate("()=>window.__bldNeed().then(()=>[typeof window.__bldOpen, !!window.__deferDone])")
            if t0 != ["function", "undefined"]: bad.append("%s __bldNeed should give a Promise and not block, gave %s" % (vp, t0))
            nt = await pg.evaluate("()=>window.__needT")
            if nt > 100: bad.append("%s __bldNeed blocked for %d ms" % (vp, nt))
            if r != ["function", True]: bad.append("%s __bldNeed with slow files gave %s" % (vp, r))
            else: print(vp, "ok: __bldNeed gives a Promise, does not block (%d ms), the builder is ready when it ends" % nt)
            await ctx.close()
            # 4: a changed part file
            ctx, pg, log = await fresh(b, w, h, url)
            async def tamper(route):
                resp = await route.fetch(); body = await resp.text()
                await route.fulfill(response=resp, body=body + "\n;window.__tamper=1;")
            await pg.route(re.compile(r"/p/db1\.[0-9a-f]+\.js$"), tamper)
            await pg.reload(); await pg.wait_for_timeout(6000)
            t = await pg.evaluate("()=>window.__tamper")
            if t: bad.append(vp + " a changed part ran")
            elif not log["csp"]: bad.append(vp + " a changed part was not reported by the CSP")
            else: print(vp, "ok: a changed part is refused (CSP hash)")
            await ctx.close()
        # 5: offline, one viewport (the service worker is the same)
        ctx, pg, log = await fresh(b, 390, 844, url, sw="allow"); await pg.reload(); await done(pg)
        await pg.evaluate("()=>navigator.serviceWorker.ready.then(()=>1)")
        n = 0
        for _ in range(120):
            n = await pg.evaluate("async()=>{ var ks=await caches.keys(), c=0; for(var k of ks){ var q=await caches.open(k); c+=(await q.keys()).filter(r=>/\\/p\\/.*\\.js$/.test(r.url)).length; } return c; }")
            if n >= 34: break
            await pg.wait_for_timeout(500)
        if n < 35: bad.append("service worker stored %d of 35 parts" % n)
        await pg.reload(); await pg.wait_for_timeout(1500)
        ctl = await pg.evaluate("()=>!!navigator.serviceWorker.controller")
        if not ctl: bad.append("page not controlled by the service worker")
        await ctx.set_offline(True)
        await pg.reload(); await done(pg, 60000)
        ok = await pg.evaluate("()=>[typeof window.__bldOpen, !!document.querySelector('#saves, [data-hview]')]")
        if ok[0] != "function": bad.append("offline: the builder did not load")
        else: print("390x844 ok: offline reload opens the sheet and the builder (%s)" % ok)
        await ctx.close(); await b.close()
    srv.shutdown(); srv1.shutdown()
    if bad:
        print("FAILED:"); [print(" -", x) for x in bad]; return 1
    print("split_dist: all checks pass"); return 0

sys.exit(asyncio.run(main()))
