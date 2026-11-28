#!/usr/bin/env python3
"""Images present: the art the app draws is there, in the single file (index.html) and in the hosting form (dist: tools/split_dist.py output).
ddb skin, phone 390x844 dark and light, laptop 1250x850 dark, Yudhi fixture. Screens: Home, every sheet tab, detail cards (feat, spell, item,
species, class, background, subclass), Library search, builder steps. Fails on:
  an image request that answers 400 or more, or fails
  a visible <img> that did not decode (naturalWidth 0)
  sheet tabs: no class scene layer on, or the layer is see-through (opacity under 0.05) or still masked to the 6% wipe start
  builder: no step scene; Library: no category icon on the results; Home: no inn scene
Desktop 1560x900: the identity card pictures of a Human Fighter 6 Battle Master decode; a chip whose picture request fails shows no broken glyph.
Also: dist index.html under 2097152 bytes.   python3 tests/images_present.py [local|dist|noimg]"""
import functools, http.server, json, os, socket, subprocess, sys, tempfile, threading
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
Y = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))


def dist_site(skip=()):
    d = tempfile.mkdtemp(prefix="img-dist-")
    r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "split_dist.py"), os.path.join(ROOT, "index.html"), os.path.join(ROOT, "sw.js"), d], capture_output=True, text=True)
    if r.returncode: raise SystemExit(r.stdout + r.stderr)
    for n in ("img", "icons", "vendor", "data", "manifest.webmanifest"):  # what tools/pages_dist.sh copies next to the split page
        if n not in skip: os.symlink(os.path.join(ROOT, n), os.path.join(d, n))
    return d


def serve(d):
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    class S(http.server.ThreadingHTTPServer):
        def handle_error(self, *a): pass
    srv = S(("127.0.0.1", port), functools.partial(Q, directory=d)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/" % port


BROKEN = r"""()=>{const v=e=>{const r=e.getBoundingClientRect();return r.width>1&&r.height>1&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(e).visibility!=='hidden'};
 return [...document.images].filter(i=>v(i)&&i.complete&&!i.naturalWidth&&i.getAttribute('src')).map(i=>i.getAttribute('src').slice(0,80))}"""
SCENE = r"""()=>{const l=[...document.querySelectorAll('.cls-art-l.on')];if(!l.length)return 'no layer on';const e=l[0],c=getComputedStyle(e);
 if(!/url\(/.test(c.backgroundImage))return 'no picture';if(+c.opacity<0.05||c.display==='none'||c.visibility==='hidden')return 'hidden '+c.opacity;
 if(c.maskImage&&c.maskImage!=='none'&&/^6%/.test(c.maskSize))return 'masked '+c.maskSize;return ''}"""
SETTLE = "()=>new Promise(r=>{const a=document.getAnimations().filter(x=>x.effect&&x.effect.getComputedTiming().iterations!==Infinity);Promise.all(a.map(x=>x.finished.catch(()=>0))).then(()=>r(1));setTimeout(()=>r(0),1200)})"


def run(b, base, form, W, H, th):
    tag = "%s %dx%d %s" % (form, W, H, th); bad = []
    c = b.new_context(viewport={"width": W, "height": H}, service_workers="block", color_scheme=th, has_touch=W < 600)
    c.add_init_script(("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);localStorage.setItem('yudhi-kelapa-sheet-v1',%s);sessionStorage.setItem('__s','1')}")
                      % (json.dumps(Y), json.dumps(json.dumps({"skin": "ddb", "theme": th}))))
    pg = c.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
    img = lambda u: "/api/" not in u and (any(x in u for x in ("/img/", "/icons/")) or u.split("?")[0].rsplit(".", 1)[-1] in ("avif", "webp", "png", "jpg", "jpeg", "svg", "gif"))
    pg.on("response", lambda r: bad.append("HTTP %d %s" % (r.status, r.url[-70:])) if r.status >= 400 and img(r.url) else None)
    pg.on("requestfailed", lambda r: bad.append("failed " + r.url[-70:]) if img(r.url) else None)
    def look(where):
        pg.evaluate(SETTLE); pg.wait_for_timeout(300)
        x = pg.evaluate(BROKEN)
        if x: bad.append(where + " broken <img>: " + ", ".join(x[:3]))
    pg.goto(base + "index.html"); pg.wait_for_timeout(2500)
    if W < 600 and not pg.evaluate("()=>/url\\(/.test(getComputedStyle(document.getElementById('homeV'),'::before').backgroundImage)"): bad.append("home: no inn scene")
    look("home")
    pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=60000); pg.wait_for_timeout(1500)
    for i, t in [(1, "p-skills"), (2, "p-actions"), (3, "p-spells"), (4, "p-inv"), (5, "p-feat"), (6, "p-desc"), (7, "p-notes"), (8, "p-ext")]:
        if W < 600: pg.click("[data-go='%d']" % i)
        elif t != "p-skills": pg.click("[data-tab='%s']" % t)
        pg.wait_for_timeout(700); look(t)
        s = pg.evaluate(SCENE)
        if s: bad.append(t + " class scene: " + s)
    for info in ("lib:feat|Sentinel", "lib:spell|Fireball", "lib:item|Longsword", "lib:species|Elf", "lib:class|Monk", "lib:background|Sage", "lib:subclass|Champion"):
        pg.evaluate("i=>{const b=document.createElement('button');b.setAttribute('data-info',i);b.id='tb';document.getElementById('dmgBtn').after(b);b.click()}", info)
        pg.wait_for_timeout(900); look("card " + info)
        if not pg.evaluate("()=>!!document.querySelector('#sheet.on .sh-wm img, #sheet.on .bl-bg, #sheet.on.sh-scn')"): bad.append("card " + info + ": no art")
        pg.evaluate("()=>{document.querySelector('#sheet [data-close]')?.click();document.getElementById('tb')?.remove()}"); pg.wait_for_timeout(400)
    pg.evaluate("()=>window.__app.libOpen()"); pg.wait_for_selector("#libQ", state="visible", timeout=15000); pg.fill("#libQ", "shield"); pg.wait_for_timeout(1500); look("library")
    if not pg.evaluate("()=>[...document.querySelectorAll('#lib img.art-ic')].some(i=>i.naturalWidth>0)"): bad.append("library: no category icon")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(500)
    pg.evaluate("()=>window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=60000)
    pg.evaluate("window.__bldOpen()"); pg.wait_for_timeout(1200)
    for st in ("class", "species", "bg", "abil"):
        pg.evaluate("s=>document.querySelector('#steps [data-step='+s+']').click()", st); pg.wait_for_timeout(1000); look("builder " + st)
        if not pg.evaluate("()=>{const e=document.querySelector('#bld .bld-art.on');return !!e&&/img\\//.test(e.style.getPropertyValue(innerWidth>=760?'--ca-pc':'--ca-ph'))}"): bad.append("builder " + st + ": no step scene")
    if errs: bad.append("page errors: %s" % errs[:2])
    check(tag + ": every image there", not bad, bad[:6])
    c.close()


IDIMG = "()=>[...document.querySelectorAll('.idcard img')].filter(i=>i.offsetParent).map(i=>[i.getAttribute('src'),i.complete,i.naturalWidth])"


def idcard(b, base, form, block=None):
    """Desktop 1560x900, ddb dark: a Human Fighter 6 Battle Master, Soldier. Every visible <img> in the identity card decoded (naturalWidth > 0),
    and Species, Class and Subclass carry a picture. With block (a URL part), that request fails: the chip then shows no broken-image glyph."""
    c = b.new_context(viewport={"width": 1560, "height": 900}, service_workers="block", color_scheme="dark")
    c.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);localStorage.setItem('yudhi-kelapa-sheet-v1',%s);sessionStorage.setItem('__s','1')}"
                      % (json.dumps(Y), json.dumps(json.dumps({"skin": "ddb", "theme": "dark"}))))
    if block: c.route("**/*" + block, lambda r: r.abort())
    pg = c.new_page(); pg.goto(base + "index.html"); pg.wait_for_timeout(2500)
    pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=60000); pg.wait_for_timeout(1000)
    pg.evaluate("()=>window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'", timeout=120000)
    pg.evaluate("""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);const b=window.__bldFuzz({sp:'Human',bg:'Soldier',rs:'2024',src:all,cls:'Fighter',sub:'Battle Master',lv:6,arr:[16,14,14,10,10,8],b2:0,b1:0}).b;
      window.__sheetApply(window.__bldSheetFor(b,{}),false)}"""); pg.wait_for_timeout(2000); pg.evaluate(SETTLE)
    L = pg.evaluate(IDIMG); bad = [x[0] for x in L if not x[2]]
    if block:
        check("%s 1560x900: identity chip whose picture fails shows no broken image (%s)" % (form, block), not bad and not any(block in (x[0] or "") for x in L), L)
    else:
        dd = pg.evaluate("()=>[...document.querySelectorAll('#idF dd')].filter(d=>/Human|Fighter|Battle Master/.test(d.textContent)).map(d=>!!d.querySelector('img'))")
        check("%s 1560x900: identity card pictures decode for a Human Fighter Battle Master" % form, L and not bad and len(dd) == 3 and all(dd), [bad, dd, L])
    c.close()


def main():
    forms = sys.argv[1:] or ["local", "dist"]
    with sync_playwright() as p:
        b = p.chromium.launch()
        for form in forms:
            d = ROOT
            if form == "noimg":  # self-check: dist without img/ must fail
                base = serve(dist_site(("img",))); n0 = len(R); run(b, base, form, 390, 844, "dark"); R[n0:] = [not x for x in R[n0:]]
                print("     (noimg must fail: counted as a pass when it does)"); continue
            if form == "dist":
                d = dist_site(); n = os.path.getsize(os.path.join(d, "index.html"))
                check("dist index.html under 2097152 bytes (%d)" % n, n < 2097152, n)
            base = serve(d)
            for W, H, th in [(390, 844, "dark"), (390, 844, "light"), (1250, 850, "dark")]:
                run(b, base, form, W, H, th)
            idcard(b, base, form)
            if form == "local": idcard(b, base, form, "img/emblem/fighter.avif")
        b.close()
    print("%d of %d checks pass" % (sum(R), len(R)))
    return 0 if all(R) else 1


sys.exit(main())
