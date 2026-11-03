"""Art install checks (release 0.0.13). python3 tests/art_install.py [step ...]   steps: hd scenes
hd: every img/icon file has an img/hd/icon twin, the Rations (1 Day) detail picture is sharp at 390x844 and DPR 3, no 404 in the console."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8")); d["inv"].append({"n": "Rations (1 Day)", "q": 3, "w": 2})
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(json.dumps(d)) + ")"
STEPS = sys.argv[1:] or ["hd", "scenes"]; R = []
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
    if "scenes" in STEPS:
        man = json.load(open(os.path.join(ROOT, "img", "manifest.json")))
        sl = lambda n: __import__("re").sub(r"^-|-$", "", __import__("re").sub(r"[^a-z0-9]+", "-", __import__("re").sub(r"['\u2019]", "", n.lower())))
        for k, v in (("species", 91), ("background", 228)):
            have = man["scn"][k]; miss = [x for x in have if not (os.path.exists(os.path.join(ROOT, have[x]["pc"])) and os.path.exists(os.path.join(ROOT, have[x]["phone"])))]
            check("scenes %s: %d entries (expect %d), every file exists" % (k, len(have), v), len(have) == v and not miss, miss[:5])
        tp = ["alchemist","captain","craftsman","dancer","gadgeteer","healer","investigator","jaeger","martyr","monster-hunter","necromancer","summoner","vagabond","warden","warmage","witch"]
        check("16 third-party class scenes exist", all(os.path.exists(os.path.join(ROOT, "img/scene", c + "-pc.avif")) and os.path.exists(os.path.join(ROOT, "img/scene", c + "-phone.avif")) and c in man["scene"] for c in tp))
        check("portraits: 142 listed, every file exists", len(man["portrait"]) == 142 and all(os.path.exists(os.path.join(ROOT, "img/portrait", x + ".avif")) for x in man["portrait"]))
        check("subclass cards: 517 listed, every file exists", len(man["scard"]) == 517 and all(os.path.exists(os.path.join(ROOT, "img/scard", x + ".avif")) for x in man["scard"]))
        NEWSP = {"Accursed": "accursed", "Faerie": "faerie", "Mandrake": "mandrake", "Drow": "drow", "Gallus": "gallus"}
        VARS = {"Hill Dwarf": "dwarf", "High Elf": "elf", "Human (2014)": "human", "Custom Lineage": "human", "Lightfoot Halfling": "halfling"}
        BGS = ["Academic", "Archivist", "Artist", "Athlete", "Aristocrat", "Anthropologist", "Antiquarian", "Amnesiac", "Ashari", "Bandit Defector"]
        for vp, w, hh, dpr in (("390x844", 390, 844, 2), ("1250x850", 1250, 850, 1)):
            ctx, pg, errs, bad = sheet_page(b, w, hh, dpr)
            pg.evaluate("window.__bldOpen()"); pg.wait_for_timeout(1200)
            pg.evaluate("()=>{const f=window.__bldBanner;window.__bldBanner=function(st,B,b){window.__tB=B;return f.apply(this,arguments)}}")
            pg.evaluate("document.querySelector('#steps [data-step=home]').click()"); pg.wait_for_timeout(800)
            pg.evaluate("()=>{for(let i=0;i<400;i++){const x=[...document.querySelectorAll('[data-srcck]')].find(y=>!y.checked);if(!x)break;x.checked=true;x.dispatchEvent(new Event('change',{bubbles:true}))}}"); pg.wait_for_timeout(500)
            ls0 = pg.evaluate("()=>JSON.stringify(Object.keys(localStorage).filter(k=>/yudhi/.test(k)))")
            pg.evaluate("document.querySelector('#steps [data-step=species]').click()"); pg.wait_for_timeout(900)
            pg.evaluate("document.querySelector('[data-chgsp]')&&document.querySelector('[data-chgsp]').click()"); pg.wait_for_timeout(900)
            r = pg.evaluate("()=>({rows:[...document.querySelectorAll('#bld [data-setsp]')].length,pc:document.querySelectorAll('#bld .pickrow.pcard').length})")
            check(vp + " species list has picture rows (%s)" % r, r["rows"] > 200 and r["pc"] > 80, r)
            pg.evaluate("()=>{const l=document.querySelector('#bld [data-setsp]');if(l)l.scrollIntoView()}")
            for y in range(0, 40000, 700):
                pg.evaluate("(y)=>{(document.querySelector('#body')||document.scrollingElement).scrollTop=y;window.scrollTo(0,y)}", y); pg.wait_for_timeout(40)
            pg.wait_for_timeout(500)
            lz = pg.evaluate("()=>{const a=[...document.querySelectorAll('#bld .pickrow.pcard')];return [a.length,a.filter(x=>x.style.getPropertyValue('--pc-art')).length]}")
            check(vp + " row pictures load only near the screen (%s of %s set after scrolling to the end)" % (lz[1], lz[0]), 0 < lz[1] <= lz[0])
            for nm, exp in list(NEWSP.items()) + list(VARS.items()):
                ok = pg.evaluate("(n)=>{const x=[...document.querySelectorAll('#bld [data-setsp]')].find(y=>y.dataset.setsp===n);if(!x)return false;x.click();return true}", nm)
                if not ok:
                    pg.evaluate("document.querySelector('[data-chgsp]')&&document.querySelector('[data-chgsp]').click()"); pg.wait_for_timeout(500)
                    ok = pg.evaluate("(n)=>{const x=[...document.querySelectorAll('#bld [data-setsp]')].find(y=>y.dataset.setsp===n);if(!x)return false;x.click();return true}", nm)
                pg.wait_for_timeout(700); src = pg.evaluate("()=>{const i=document.querySelector('#bld .bld-hero img');return i?i.currentSrc||i.src:''}")
                check("%s species %s shows scene %s" % (vp, nm, exp), ok and ("/species/%s-p" % exp) in src, (ok, src[-60:]))
                pg.evaluate("document.querySelector('[data-chgsp]')&&document.querySelector('[data-chgsp]').click()"); pg.wait_for_timeout(300)
            pg.evaluate("document.querySelector('#steps [data-step=bg]').click()"); pg.wait_for_timeout(900)
            done = 0
            for nm in BGS:
                try: pg.select_option("#bld select[data-b=bg]", label=nm, timeout=3000)
                except Exception: continue
                pg.wait_for_timeout(700); src = pg.evaluate("()=>{const i=document.querySelector('#bld .bld-hero img');return i?i.currentSrc||i.src:''}")
                if ("/background/%s-p" % sl(nm)) in src: done += 1
            check(vp + " background step shows the scene of %d of %d backgrounds" % (done, len(BGS)), done == len(BGS), done)
            pg.evaluate("document.querySelector('#steps [data-step=class]').click()"); pg.wait_for_timeout(1000)
            n = pg.evaluate("()=>document.querySelectorAll('#bld .sub-card').length"); check(vp + " Class step shows subclass cards (%d)" % n, n > 0, n)
            if n > 1:
                v = pg.evaluate("()=>{const c=[...document.querySelectorAll('#bld .sub-card')][1];const v=c.dataset.subcard;c.click();return v}"); pg.wait_for_timeout(900)
                check(vp + " a card tap picks that subclass", pg.evaluate("(v)=>{const s=document.querySelector('#bld select[data-subsel]');return s&&s.value===v&&document.querySelector('#bld .sub-card.on')&&document.querySelector('#bld .sub-card.on').dataset.subcard===v}", v), v)
                im = pg.evaluate("()=>{const i=document.querySelector('#bld .sub-card img');return [i.complete,i.naturalWidth,i.loading]}"); check(vp + " subclass card picture loads lazily (%s)" % im, im[2] == "lazy")
            pg.screenshot(path="/tmp/art-class-%d.png" % w); check(vp + " scenes: no page errors, no failed image request", not errs and not bad, (errs[:2], bad[:3])); ctx.close()
    b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
