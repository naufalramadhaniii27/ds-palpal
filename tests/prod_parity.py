#!/usr/bin/env python3
"""Production parity: the hosting form (tools/split_dist.py) served over http with the exact _headers rules and a real service worker,
against the single file over file://. 390x844 touch, dark, ddb skin, Yudhi fixture. Checks: no CSP or Trusted Types violation, no page
error, no console error, and the text of every tab is the same in both.   python3 tests/prod_parity.py [--out DIR]"""
import difflib, functools, http.server, json, os, socket, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
OUT = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else None


def rules():
    """_headers as [(pattern, [(name, value)], [removed names])], in file order (Cloudflare Pages applies every matching block)."""
    R = []
    for ln in open(os.path.join(ROOT, "_headers"), encoding="utf-8"):
        if not ln.strip() or ln.lstrip().startswith("#"): continue
        if not ln[0].isspace(): R.append((ln.strip(), [], [])); continue
        s = ln.strip()
        if s.startswith("!"): R[-1][2].append(s[1:].strip().lower())
        else: k, v = s.split(":", 1); R[-1][1].append((k.strip(), v.strip()))
    return R


def match(pat, path):
    return path == pat or (pat.endswith("*") and path.startswith(pat[:-1]))


def serve(d):
    R = rules(); s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def end_headers(self):
            p = self.path.split("?")[0]; h = {}
            for pat, add, rm in R:
                if not match(pat, p): continue
                for k in rm: h = {a: b for a, b in h.items() if a.lower() != k}
                for k, v in add:
                    old = next((a for a in h if a.lower() == k.lower()), None)
                    h[old or k] = (h[old] + ", " + v) if old else v
            for k, v in h.items(): self.send_header(k, v)
            super().end_headers()
    class S(http.server.ThreadingHTTPServer):
        def handle_error(self, *a): pass
    srv = S(("127.0.0.1", port), functools.partial(Q, directory=d)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/" % port


def site():
    d = tempfile.mkdtemp(prefix="prod-site-")
    r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "split_dist.py"), os.path.join(ROOT, "index.html"), os.path.join(ROOT, "sw.js"), d], capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stdout + r.stderr)
    for n in ("manifest.webmanifest", "_headers", "img", "icons", "vendor", "data"):
        if os.path.exists(os.path.join(ROOT, n)): os.symlink(os.path.join(ROOT, n), os.path.join(d, n))
    return d


LISTEN = """(()=>{window.__viol=[];document.addEventListener('securitypolicyviolation',e=>window.__viol.push(e.violatedDirective+' '+(e.blockedURI||'')+' '+(e.sample||'').slice(0,80)+' @'+(e.sourceFile||'').split('/').pop()+':'+e.lineNumber));})()"""
CHARS = [a for i, a in enumerate(sys.argv) if i and sys.argv[i - 1] == "--char"] or [os.path.join(HERE, "fixtures", "yudhi-v3.json")]
def seed(f):
    return "if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3'," + json.dumps(open(f, encoding="utf-8").read()) + ");sessionStorage.setItem('__s','1')}"
# Pact Magic boxes in view: tapping one marks it, tapping again clears it, and the boxes never sit on top of each other
PACT = """async()=>{const vis=()=>[...document.querySelectorAll('.bx[data-k="pact"]')].filter(b=>{const r=b.getBoundingClientRect();return r.width&&r.left>=0&&r.right<=392});
 const a=vis(); if(!a.length) return null; const R=a.map(b=>b.getBoundingClientRect()), lap=R.some((r,i)=>R.some((q,j)=>j>i&&r.left<q.right-1&&q.left<r.right-1&&r.top<q.bottom-1&&q.top<r.bottom-1));
 const S=()=>window.__sheetState().S, u0=+(S().used.pact||0), w=t=>new Promise(r=>setTimeout(r,t));
 a[u0<a.length?u0:a.length-1].click(); await w(400); const u1=+(S().used.pact||0), on1=vis().filter(b=>b.getAttribute('aria-pressed')==='true').length;
 vis()[u1-1].click(); await w(400); const u2=+(S().used.pact||0); return {n:a.length,lap,u0,u1,on1,u2,dup:vis().length-a.length}}"""
DUMP = """()=>{const p=[...document.querySelectorAll('#p-main,#p-skills,.detail>.panels>.panel')].find(p=>p.offsetParent&&Math.abs(p.getBoundingClientRect().left)<50);
 return p?(p.id||'')+'\\n'+p.innerText.replace(/[ \\t]+/g,' ').trim():'(no panel)'}"""


def run(b, url, sw, f):
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True, color_scheme="dark", service_workers=sw)
    c.add_init_script(LISTEN); c.add_init_script(seed(f)); c.route("**/api/**", lambda r: r.fulfill(status=401, body="{}", content_type="application/json")); pg = c.new_page(); log = {"err": [], "con": []}
    pg.on("pageerror", lambda e: log["err"].append(str(e)[:300]))
    pg.on("response", lambda r: log["con"].append("HTTP %d %s" % (r.status, r.url)) if r.status >= 400 and "/api/" not in r.url else None)
    pg.on("console", lambda m: log["con"].append(m.text[:300]) if m.type == "error" and "/api/" not in m.text and "status of 401" not in m.text and not (sw == "block" and ("CORS" in m.text or "ERR_FAILED" in m.text)) else None)  # file:// cannot fetch images (CORS), not a hosted problem
    pg.goto(url); pg.wait_for_timeout(2500)
    if sw == "allow": pg.reload(); pg.wait_for_timeout(2500)  # second load goes through the service worker
    pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); pg.wait_for_timeout(1500)
    tabs = {}
    for g in range(9):
        pg.evaluate("g=>{const e=document.querySelector('[data-go=\"'+g+'\"]'); e&&e.click()}", str(g)); pg.wait_for_timeout(700)
        tabs[g] = pg.evaluate(DUMP); log.setdefault("pact", {})[g] = pg.evaluate(PACT)
        if OUT: pg.screenshot(path=os.path.join(OUT, "%s-%s-tab%d.png" % (os.path.basename(f)[:-5], "http" if sw == "allow" else "file", g)))
    log["viol"] = pg.evaluate("()=>window.__viol"); log["tt"] = pg.evaluate("()=>window.__ttLog||[]")
    log["sw"] = pg.evaluate("()=>!!(navigator.serviceWorker&&navigator.serviceWorker.controller)") if sw == "allow" else None
    c.close(); return tabs, log


R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:1500]))
if OUT: os.makedirs(OUT, exist_ok=True)
url = serve(site())
with sync_playwright() as p:
    b = p.chromium.launch()
    for f in CHARS:
        n = os.path.basename(f)[:-5] + " "
        ft, fl = run(b, "file://" + os.path.join(ROOT, "index.html"), "block", f)
        ht, hl = run(b, url + "index.html", "allow", f)
        check(n + "hosted: service worker controls the page", hl["sw"], hl["sw"])
        for k, L in (("file", fl), ("hosted", hl)):
            check(n + k + ": no CSP or Trusted Types violation", not L["viol"], L["viol"])
            check(n + k + ": nothing stripped by the Trusted Types policy", not L["tt"], L["tt"])
            check(n + k + ": no page error", not L["err"], L["err"])
            check(n + k + ": no console error", not L["con"], L["con"])
            for g, q in L["pact"].items():
                if q: check(n + k + " tab %d: Pact slot boxes toggle, no overlap, no duplicates" % g, not q["lap"] and not q["dup"] and q["u1"] == q["u0"] + 1 and q["on1"] == q["u1"] and q["u2"] == q["u1"] - 1, q)
        for g in range(9):
            d = list(difflib.unified_diff(ft[g].splitlines(), ht[g].splitlines(), "file", "hosted", n=0, lineterm=""))
            check(n + "tab %d: same text on file:// and hosted" % g, not d, "\n".join(d[:40]))
    b.close()
print("prod_parity: %d/%d" % (sum(R), len(R))); sys.exit(0 if all(R) else 1)
