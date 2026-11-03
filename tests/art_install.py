"""Art install checks (release 0.0.13). python3 tests/art_install.py [step ...]   steps: hd
hd: every img/icon file has an img/hd/icon twin, the Rations (1 Day) detail picture is sharp at 390x844 and DPR 3, no 404 in the console."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8")); d["inv"].append({"n": "Rations (1 Day)", "q": 3, "w": 2})
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(json.dumps(d)) + ")"
STEPS = sys.argv[1:] or ["hd"]; R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
def tree(top):
    return {os.path.relpath(os.path.join(a, f), os.path.join(ROOT, top)) for a, _, fs in os.walk(os.path.join(ROOT, top)) for f in fs if f.endswith(".avif")}
def sheet_page(b, w, h, dpr):
    ctx = b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr); ctx.add_init_script(SEED); pg = ctx.new_page()
    errs, bad = [], []; pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("response", lambda r: bad.append(r.url[-80:]) if r.status >= 400 else None)
    pg.on("requestfailed", lambda r: bad.append("fail " + r.url[-80:]) if "img/" in r.url else None)
    pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(3500); pg.evaluate("window.__bldNeed&&window.__bldNeed()"); pg.wait_for_timeout(3000)
    pg.evaluate("()=>{var b=[...document.querySelectorAll('button')].find(x=>/^continue$/i.test(x.textContent.trim())&&x.offsetParent);b&&b.click()}"); pg.wait_for_timeout(2500)
    return ctx, pg, errs, bad
with sync_playwright() as p:
    b = p.chromium.launch()
    if "hd" in STEPS:
        a, h = tree("img/icon"), tree("img/hd/icon"); check("every icon has an HD twin (%d of %d)" % (len(a & h), len(a)), a <= h, sorted(a - h)[:5])
        for vp, w, hh, dpr in (("390x844 dpr3", 390, 844, 3), ("1250x850 dpr2", 1250, 850, 2)):
            ctx, pg, errs, bad = sheet_page(b, w, hh, dpr)
            pg.evaluate("()=>document.getElementById('t-inv').click()"); pg.wait_for_timeout(1200)
            pg.evaluate("()=>{var e=[...document.querySelectorAll('#p-inv .iname')].find(x=>/Rations/.test(x.textContent));e&&e.click()}"); pg.wait_for_timeout(2500)
            m = pg.evaluate("()=>{var w=document.getElementById('shWm');if(!w)return null;return [...w.querySelectorAll('img')].map(i=>({src:i.currentSrc||i.src,nw:i.naturalWidth,cw:i.getBoundingClientRect().width}))}")
            check(vp + " Rations detail draws a picture", m, m)
            if m: check(vp + " Rations picture is the HD file", "img/hd/icon/" in m[0]["src"], m[0]); check(vp + " Rations natural width covers displayed width x DPR (%s)" % m[0], m[0]["nw"] >= m[0]["cw"] * dpr * 0.9, m[0])
            pg.screenshot(path="/tmp/art-rations-%d.png" % w); check(vp + " no page errors, no failed image request", not errs and not bad, (errs, bad)); ctx.close()
    b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
