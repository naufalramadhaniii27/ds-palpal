"""Builder dialogs and panels at 390x844 (Yudhi fixture): Quick Build, homebrew sources, Level Up, change class, Fighting Style,
the level 4 feat, class spells tab, a rules link, background feat and tool, change species, languages, shop (Add Items), coins,
an item, the build code, Rules > Feats. The builder CSS comes with the builder part (manifest "css", build.py css_inject), so:
  - every dialog opens and the builder part CSS is in the page exactly once, also after the builder is closed and opened again;
  - with --base OTHER.html (a build where the builder CSS was still in the first paint, for example `git show ae74c4b03:index.html`
    saved in the repo root), every dialog screenshot is compared pixel for pixel and must be identical.
python3 tests/builder_dialogs.py [--base before.html]"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a = sys.argv[1:]; BASE = a[a.index("--base") + 1] if "--base" in a else None
Y = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
OPEN = """()=>new Promise(res=>{document.getElementById('bldBtn').click();
 (function w(){var d=document.getElementById('bld'),b=document.getElementById('body');
  if(d&&!d.hidden&&b&&b.children.length) requestAnimationFrame(()=>setTimeout(res,0)); else setTimeout(w,10)})()})"""
SC = [("quickbuild", "home", "[data-qb]"), ("homebrew", "home", "/homebrew/i"), ("levelup", "class", "#bld .top [data-lvup]"),
      ("chgclass", "class", "[data-chgcls]"), ("fstyle", "class", "/^Fighting Style/"), ("asifeat", "class", "/Ability Score I/"),
      ("clsspells", "class", "[data-ctab]:nth-of-type(2)"), ("lnkpop", "class", "[data-lnk]"), ("bgfeat", "bg", "/^Savage Attacker/"),
      ("bgtool", "bg", "/^Tool Proficiency/"), ("chgsp", "species", "[data-chgsp]"), ("lang", "species", "/^Languages/"),
      ("shop", "equip", "/^Add Items/"), ("coins", "equip", "/^Currency/"), ("item", "equip", "/^Chain Mail/"), ("dna", "next", "/Show as code/"),
      ("rulesfeats", "rules", "/^Feats$/")]
CLICK = r"""s=>{ const root=document.getElementById('bld'); let el=null;
  if(s.startsWith('/')){ const m=/^\/(.*)\/([a-z]*)$/.exec(s), re=new RegExp(m[1],m[2]); el=[...root.querySelectorAll('button,[role=button],summary')].find(b=>b.offsetParent&&re.test(b.textContent.trim())); }
  else el=[...document.querySelectorAll(s)].find(b=>b.offsetParent);
  if(!el) return false; el.scrollIntoView({block:'center'}); el.click(); return true; }"""
def run(page):
    shots = {}
    with sync_playwright() as p:
        br = p.chromium.launch(); pg = br.new_page(viewport={"width": 390, "height": 844}); pg.emulate_media(reduced_motion="reduce"); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)) if "Transition was skipped" not in str(e) else None)
        pg.goto("file://" + os.path.join(ROOT, page)); pg.wait_for_timeout(800)
        pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", Y); pg.reload(); pg.wait_for_timeout(2500)
        pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); pg.wait_for_timeout(1000)
        pg.evaluate("()=>window.__bldNeed()"); pg.wait_for_function("()=>typeof window.__bldSheetRuns==='function'", timeout=120000)
        pg.evaluate(OPEN); pg.wait_for_timeout(1200)
        for nm, st, sel in SC:
            pg.evaluate("s=>{var b=document.querySelector('#bld [data-step=\"'+s+'\"]'); if(b) b.click()}", st); pg.wait_for_timeout(900)
            ok = pg.evaluate(CLICK, sel); pg.wait_for_timeout(1100)
            shots[nm] = pg.screenshot() if ok else None
            pg.keyboard.press("Escape"); pg.wait_for_timeout(300)
            pg.evaluate("()=>{document.querySelectorAll('.ask [data-close],#sheet.on [data-close]').forEach(b=>b.click())}"); pg.wait_for_timeout(300)
        css = pg.evaluate("()=>document.querySelectorAll('style[data-part-css]').length")
        pg.evaluate("()=>{const x=document.querySelector('#bld .top [aria-label^=\"Close\"], #bld .top .bx-close, #bld [data-bclose]'); if(x) x.click()}"); pg.wait_for_timeout(600)
        pg.evaluate(OPEN); pg.wait_for_timeout(800)
        css2 = pg.evaluate("()=>document.querySelectorAll('style[data-part-css]').length")
        br.close()
    return shots, css, css2, errs
shots, css, css2, errs = run("index.html")
for nm, st, sel in SC: check("builder dialog opens: " + nm, shots.get(nm) is not None)
check("builder part CSS in the page once", css == 1 and css2 == 1, (css, css2))
check("no page errors", not errs, errs)
if BASE:
    from PIL import Image, ImageChops
    import io
    base, _, _, _ = run(BASE)
    for nm, _, _ in SC:
        if shots.get(nm) is None or base.get(nm) is None: continue
        d = ImageChops.difference(Image.open(io.BytesIO(shots[nm])).convert("RGB"), Image.open(io.BytesIO(base[nm])).convert("RGB"))
        check("same pixels as the base build: " + nm, d.getbbox() is None, d.getbbox())
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
