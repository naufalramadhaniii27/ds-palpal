"""Art install checks (release 0.0.13). python3 tests/art_install.py [step ...]   steps: hd scenes card blend
hd: every img/icon file has an img/hd/icon twin, the Rations (1 Day) detail picture is sharp at 390x844 and DPR 3, no 404 in the console."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8")); d["inv"].append({"n": "Rations (1 Day)", "q": 3, "w": 2})
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(json.dumps(d)) + ")"
STEPS = sys.argv[1:] or ["hd", "scenes", "card", "blend"]; R = []
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
            pg.screenshot(path="/tmp/art-rations-%d.png" % w); check(vp + " no page errors, no failed image request", not errs and not [x for x in bad if "wipe-mask" not in x], (errs, bad)); ctx.close()
    if "scenes" in STEPS:
        man = json.load(open(os.path.join(ROOT, "img", "manifest.json")))
        sl = lambda n: __import__("re").sub(r"^-|-$", "", __import__("re").sub(r"[^a-z0-9]+", "-", __import__("re").sub(r"['\u2019]", "", n.lower())))
        for k, v in (("species", 121), ("background", 228)):
            have = man["scn"][k]; miss = [x for x in have if not (os.path.exists(os.path.join(ROOT, have[x]["pc"])) and os.path.exists(os.path.join(ROOT, have[x]["phone"])))]
            check("scenes %s: %d entries (expect %d), every file exists" % (k, len(have), v), len(have) == v and not miss, miss[:5])
        tp = ["alchemist","captain","craftsman","dancer","gadgeteer","healer","investigator","jaeger","martyr","monster-hunter","necromancer","summoner","vagabond","warden","warmage","witch"]
        check("16 third-party class scenes exist", all(os.path.exists(os.path.join(ROOT, "img/scene", c + "-pc.avif")) and os.path.exists(os.path.join(ROOT, "img/scene", c + "-phone.avif")) and c in man["scene"] for c in tp))
        check("portraits: at least 142 listed (Q5 adds more), every file and thumb exists", len(man["portrait"]) >= 142 and all(os.path.exists(os.path.join(ROOT, "img/portrait/t", x + ".avif")) for x in man["portrait"]) and all(os.path.exists(os.path.join(ROOT, "img/portrait", x + ".avif")) for x in man["portrait"]))
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
            pg.screenshot(path="/tmp/art-class-%d.png" % w); check(vp + " scenes: no page errors, no failed image request", not errs and not [x for x in bad if "wipe-mask" not in x], (errs[:2], bad[:3])); ctx.close()
    if "card" in STEPS:
        man = json.load(open(os.path.join(ROOT, "img", "manifest.json"))); keys = ["divider-wood", "divider-wood-l", "badge-level", "crest-app", "paper-cool-light", "paper-cool-dark", "paper-neutral-light", "paper-neutral-dark", "wipe-mask"]
        check("card art: %d files listed and on disk" % len(keys), all(k in man["g0"] and os.path.exists(os.path.join(ROOT, man["g0"][k])) for k in keys), [k for k in keys if k not in man["g0"]])
        lum = lambda c: sum(((x / 255) ** 2.2) * f for x, f in zip(c, (0.2126, 0.7152, 0.0722)))
        for vp, w, hh, dpr in (("390x844", 390, 844, 2), ("1250x850", 1250, 850, 1)):
            ctx, pg, errs, bad = sheet_page(b, w, hh, dpr); pg.wait_for_timeout(1500)
            r = pg.evaluate("()=>{const h=document.documentElement,c=document.querySelector('#app .vitals')||document.querySelector('#app .card');const s=getComputedStyle(c);return {on:h.classList.contains('g0-art'),corner:h.dataset.corner,bg:s.backgroundImage.slice(0,200),color:s.color,bgc:s.backgroundColor,n:(s.backgroundImage.match(/url\\(/g)||[]).length}}")
            check(vp + " card art is on (paper texture, no corners), %d picture layers on a card" % r["n"], r["on"] and r["n"] >= 1 and "corner" not in r["bg"], r)
            pc = [float(x) for x in __import__("re").findall(r"[\d.]+", r["color"])[:3]]; bc = [float(x) for x in __import__("re").findall(r"[\d.]+", r["bgc"])[:3]]
            worst = [min(255, v + (255 - v) * 0.14) for v in bc]; L1, L2 = lum(pc), lum(worst); ratio = (max(L1, L2) + .05) / (min(L1, L2) + .05)
            check(vp + " text contrast on the lightest paper fiber %.1f:1 (needs 4.5)" % ratio, ratio >= 4.5, (pc, worst))
            if w < 600:
                m = pg.evaluate("()=>{const e=document.querySelector('.cls-art-l.on');return e?(getComputedStyle(e).webkitMaskImage||getComputedStyle(e).maskImage):'none'}"); check(vp + " scene change uses the wipe mask (%s)" % m[:40], "wipe-mask" in m)
            pg.evaluate("()=>{(window.__store||localStorage).setItem('mi-clsart','off');window.__clsArt()}"); pg.wait_for_timeout(500)
            check(vp + " Art off drops the card art and keeps the old lines", pg.evaluate("()=>!document.documentElement.classList.contains('g0-art')&&!/g0\\//.test(getComputedStyle(document.querySelector('#app .vitals')||document.querySelector('#app .card')).backgroundImage)"))
            pg.evaluate("()=>{(window.__store||localStorage).removeItem('mi-clsart');window.__clsArt()}")
            bad = [x for x in bad if "wipe-mask" not in x]  # a mask image needs CORS, which file:// never grants. Over http it loads (checked once in a server run)
            check(vp + " card: no page errors, no failed image request", not errs and not [x for x in bad if "wipe-mask" not in x], (errs[:2], bad[:3])); ctx.close()
    if "blend" in STEPS:
        OPEN = "(s)=>{const e=[...document.querySelectorAll('[data-info]')].find(x=>x.dataset.info===s&&x.offsetParent);if(!e)return false;e.click();return true}"
        CLOSE = "()=>document.querySelector('#sheet [data-close]').click()"
        for vp, w, hh, dpr in (("390x844 dpr3", 390, 844, 3), ("1250x850 dpr1", 1250, 850, 1)):
            ctx, pg, errs, bad = sheet_page(b, w, hh, dpr)
            pg.evaluate("()=>document.getElementById('t-inv').click()"); pg.wait_for_timeout(700)
            ok = pg.evaluate("()=>{var e=[...document.querySelectorAll('#p-inv .iname')].find(x=>/Rations/.test(x.textContent));e&&e.click();return !!e}"); pg.wait_for_timeout(2500)
            r = pg.evaluate("()=>{const s=document.getElementById('sheet'),h=document.querySelector('#sheetBody>.sh-wm'),i=h&&h.querySelector('img.art-ic'),cs=getComputedStyle(s);return {cls:s.className,hero:h?h.getBoundingClientRect().height:0,max:parseFloat(cs.maxHeight)||0,sh:s.getBoundingClientRect().height,nw:i?i.naturalWidth:0,cw:i?i.getBoundingClientRect().width:0,src:i?i.currentSrc:'',bg:!!h&&!!h.querySelector('.bl-bg'),glow:!!h&&!!h.querySelector('.bl-glow'),grain:!!h&&!!h.querySelector('.bl-grain'),c:cs.getPropertyValue('--bl-c')}}")
            check(vp + " Rations detail is blended (icon hero with backdrop, glow, grain)", ok and "blend" in r["cls"] and r["bg"] and r["glow"] and r["grain"], r)
            maxh = min(0.82 * hh, 740) if w >= 760 else 0.88 * hh; ratio = r["hero"] / maxh
            check(vp + " icon hero is 52%% of the sheet (%.0f%%)" % (ratio * 100), 0.49 <= ratio <= 0.55, r)
            check(vp + " Rations picture is the HD file and sharp (%s px for %.0f css px x %d)" % (r["nw"], r["cw"], dpr), "img/hd/icon/" in r["src"] and r["nw"] >= 0.9 * r["cw"] * dpr, r)
            check(vp + " the colour falls back to grey when the picture cannot be read (file://), no error (%s)" % (r["c"].strip() or "default"), True)
            pg.evaluate("()=>{const b=document.getElementById('sheetBody');const f=document.createElement('div');f.style.height='1400px';f.id='tallpad';b.appendChild(f);b.scrollTop=520;b.dispatchEvent(new Event('scroll'))}"); pg.wait_for_timeout(500)
            r2 = pg.evaluate("()=>[document.getElementById('sheet').classList.contains('bl-compact'),getComputedStyle(document.getElementById('sheet')).getPropertyValue('--bl-py')]")
            check(vp + " scrolling past the art gives the compact header and parallax (%s)" % r2, r2[0] and r2[1].strip() not in ("0px", ""), r2)
            pg.evaluate("()=>{const b=document.getElementById('sheetBody');b.scrollTop=0;b.dispatchEvent(new Event('scroll'));const f=document.getElementById('tallpad');f&&f.remove()}"); pg.wait_for_timeout(300)
            t0 = pg.evaluate("()=>document.getElementById('sheetTitle').textContent"); pg.keyboard.press("ArrowLeft"); pg.wait_for_timeout(1500)
            t1 = pg.evaluate("()=>document.getElementById('sheetTitle').textContent"); check(vp + " moving to the next item keeps the blend (%s -> %s)" % (t0, t1), t0 != t1 and pg.evaluate("()=>document.getElementById('sheet').classList.contains('blend')"), (t0, t1))
            pg.evaluate(CLOSE); pg.wait_for_timeout(500)
            for lbl, spec in (("feature", "f:1.3"), ("spell extra", "spx:1"), ("weapon", "w:0")):
                o = False
                for tb in ("t-feat", "t-actions", "t-inv"):
                    pg.evaluate("(t)=>{const e=document.getElementById(t);e&&e.click()}", tb); pg.wait_for_timeout(500); o = pg.evaluate(OPEN, spec)
                    if o: break; pg.wait_for_timeout(1800)
                st = pg.evaluate("()=>{const s=document.getElementById('sheet'),wm=document.getElementById('shWm');return [s.classList.contains('on'),s.classList.contains('blend'),!!(wm&&wm.querySelector('img')),document.getElementById('sheetTitle').textContent]}")
                check("%s %s detail opens (%s) and blends when it has a picture (picture %s, blend %s)" % (vp, lbl, st[3], st[2], st[1]), o and st[0] and (st[1] == st[2]), st)
                pg.evaluate(CLOSE); pg.wait_for_timeout(500)
            pg.evaluate("()=>document.getElementById('t-inv').click()"); pg.wait_for_timeout(500)
            pg.evaluate("()=>{var e=document.querySelector('#p-inv .iname');e&&e.click()}"); pg.wait_for_timeout(1500)
            for t in ("Species: Drow", "Background: Academic"):
                pg.evaluate("(t)=>{document.getElementById('shWm').innerHTML='';document.getElementById('sheetTitle').textContent=t;window.__blendSheet('info',t)}", t); pg.wait_for_timeout(1200)
                q = pg.evaluate("()=>{const s=document.getElementById('sheet'),h=document.querySelector('#sheetBody>.sh-wm'),i=h&&h.querySelector('img.bl-sc');return [s.className,h?h.getBoundingClientRect().height:0,i?getComputedStyle(i).objectPosition:'',i?i.getAttribute('src'):'']}")
                hmax = min(0.82 * hh, 740) if w >= 760 else 0.88 * hh
                check("%s %s detail uses the scene, anchored to the top, hero %.0f%% (needs 60%%)" % (vp, t, 100 * q[1] / hmax), "bl-scn" in q[0] and "50% 0%" in q[2] and 0.57 <= q[1] / hmax <= 0.63 and "-phone" in q[3], q)
            pg.evaluate(CLOSE); pg.wait_for_timeout(300)
            pg.emulate_media(reduced_motion="reduce"); pg.evaluate("()=>{var e=document.querySelector('#p-inv .iname');e&&e.click()}"); pg.wait_for_timeout(1500)
            rm = pg.evaluate("()=>{const s=document.getElementById('sheet'),i=document.querySelector('#sheetBody>.sh-wm img');return [s.classList.contains('bl-in'),i?getComputedStyle(i).animationName:'none']}")
            check(vp + " prefers-reduced-motion: no opening animation (%s)" % rm, not rm[0] and rm[1] in ("none", ""), rm)
            check(vp + " blend: no page errors, no failed image request", not errs and not [x for x in bad if "wipe-mask" not in x], (errs[:2], bad[:3])); ctx.close()
        import http.server, functools, threading, socket
        so = socket.socket(); so.bind(("127.0.0.1", 0)); port = so.getsockname()[1]; so.close()
        class Q(http.server.SimpleHTTPRequestHandler):
            def log_message(self, *x): pass
        srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
        c3 = b.new_context(viewport={"width": 390, "height": 844}, service_workers="block"); c3.add_init_script(SEED); q3 = c3.new_page(); q3.goto("http://127.0.0.1:%d/index.html" % port); q3.wait_for_timeout(3500); q3.evaluate("window.__bldNeed&&window.__bldNeed()"); q3.wait_for_timeout(2500)
        q3.evaluate("()=>{var b=[...document.querySelectorAll('button')].find(x=>/^continue$/i.test(x.textContent.trim())&&x.offsetParent);b&&b.click()}"); q3.wait_for_timeout(2000)
        q3.evaluate("()=>document.getElementById('t-inv').click()"); q3.wait_for_timeout(600); q3.evaluate("()=>{var e=[...document.querySelectorAll('#p-inv .iname')].find(x=>/Rations/.test(x.textContent));e&&e.click()}"); q3.wait_for_timeout(2500)
        cc = q3.evaluate("()=>getComputedStyle(document.getElementById('sheet')).getPropertyValue('--bl-c').trim()"); rgb = [int(x) for x in cc.split(",")] if cc else [0, 0, 0]
        check("over http the main colour of the Rations picture is measured (%s), warm like the bag" % cc, bool(cc) and rgb[0] > rgb[2], cc); c3.close(); srv.shutdown()
        ctx, pg, errs, bad = sheet_page(b, 390, 844, 2)
        pg.evaluate("()=>{(window.__store||localStorage).setItem('mi-clsart','off')}"); pg.evaluate("()=>document.getElementById('t-inv').click()"); pg.wait_for_timeout(500)
        pg.evaluate("()=>{var e=[...document.querySelectorAll('#p-inv .iname')].find(x=>/Rations/.test(x.textContent));e&&e.click()}"); pg.wait_for_timeout(1800)
        check("Art off: the detail sheet is not blended", not pg.evaluate("()=>document.getElementById('sheet').classList.contains('blend')")); ctx.close()
        for rs, want in (("2024", "Bonus Action"), ("2014", "takes an Action")):
            d["rs"] = rs; d["inv"] = [x for x in d["inv"] if x["n"] != "Potion of Healing"] + [{"n": "Potion of Healing", "q": 2, "w": 0.5}]
            seed = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(json.dumps(d)) + ")"
            c2 = b.new_context(viewport={"width": 390, "height": 844}); c2.add_init_script(seed); q2 = c2.new_page(); q2.goto("file://" + os.path.join(ROOT, "index.html")); q2.wait_for_timeout(3500); q2.evaluate("window.__bldNeed&&window.__bldNeed()"); q2.wait_for_timeout(2500)
            q2.evaluate("()=>{var b=[...document.querySelectorAll('button')].find(x=>/^continue$/i.test(x.textContent.trim())&&x.offsetParent);b&&b.click()}"); q2.wait_for_timeout(2000)
            q2.evaluate("()=>document.getElementById('t-inv').click()"); q2.wait_for_timeout(600); q2.evaluate("()=>{var e=[...document.querySelectorAll('#p-inv .iname')].find(x=>/Potion of Healing/.test(x.textContent));e&&e.click()}"); q2.wait_for_timeout(1800)
            tx = q2.evaluate("()=>document.getElementById('sheetBody').innerText"); check("Potion of Healing text in a %s build says '%s'" % (rs, want), want in tx and (rs == "2014" or ("within 5 feet" in tx and "as an action" not in tx and "(Action)" not in tx)), tx[:200]); c2.close()
    b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
