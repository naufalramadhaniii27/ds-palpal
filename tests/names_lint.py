#!/usr/bin/env python3
"""Names check per script block (tools/lint_names.js), plus the backup reminder handlers (they once sat outside the app closure and threw ReferenceError).
  python3 tests/names_lint.py   Needs: npm ci --prefix tools/build"""
import json, os, subprocess, sys, asyncio, http.server, threading, functools, socket
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
out = "/tmp/names-lint.json"
r = subprocess.run(["node", os.path.join(ROOT, "tools", "lint_names.js"), "--json", out], capture_output=True, text=True)
check("lint_names runs", r.returncode == 0, r.stderr[:200])
d = json.load(open(out))
check("every script block parses", not [x for x in d if x.get("parseError")], str([x["first"] for x in d if x.get("parseError")]))
ALLOW = {"__miT", "TGE"}  # guarded by a property check (window.__miT?) or exported by the engine file (root.TGE)
bad = sorted({n[0] for x in d for n in (x.get("reallyUndefined") or []) if n[0] not in ALLOW})
check("no name is used without a declaration", not bad, str(bad))
async def main():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto("http://127.0.0.1:%d/index.html" % port); await pg.wait_for_timeout(3000)
        await pg.evaluate("""()=>{var i=document.createElement('input');i.setAttribute('data-chfrem','1');i.value='7';document.body.appendChild(i);i.dispatchEvent(new Event('change',{bubbles:true}));
          var c=document.createElement('input');c.type='checkbox';c.setAttribute('data-chfauto','1');document.body.appendChild(c);c.dispatchEvent(new Event('change',{bubbles:true}))}""")
        await pg.wait_for_timeout(500)
        v = await pg.evaluate("()=>{var o=JSON.parse(localStorage.getItem('cs-ui-remind')||'null');return o}")
        await b.close()
    check("backup reminder settings save without error", not errs and v and v.get("days") == 7 and "auto" in v, "%s %s" % (errs[:2], v))
asyncio.run(main())
print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
