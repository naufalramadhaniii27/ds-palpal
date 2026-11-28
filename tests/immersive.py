"""Immersive (design brief stages 2 and 3) at 390x844 on the Yudhi fixture, then a level 5 Wizard.
The Immersive Off choice persists over a reload and stops the effects; reduced motion stops the animations;
the theme follows prefers-color-scheme; the accent follows the class; an HP drop adds the red edge pulse and a buzz;
spell slots are crystals (rotated diamonds) and a used slot is dimmed grey.   python3 tests/immersive.py"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
# a file:// reload can start a new sessionStorage (new renderer), so a localStorage mark also stops a second seed
SEED = "(v=>{window.__vib=[];try{navigator.vibrate=p=>{window.__vib.push(p);return true}}catch(e){}try{if(sessionStorage.getItem('s')||localStorage.getItem('__seed'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('__seed','1');localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(d) + ")"
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
def open_sheet(pg):
    pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(2500)
    pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); pg.wait_for_timeout(1500)
ANIM = "()=>({photo:getComputedStyle(document.getElementById('photo')).animationName, art:getComputedStyle(document.getElementById('clsArt')).animationName})"
def damage(pg, n):
    pg.evaluate("n=>{const a=document.getElementById('hpAmt'); a.value=n; a.dispatchEvent(new Event('input',{bubbles:true}))}", str(n))
    pg.click("#dmgBtn"); pg.wait_for_timeout(150)
    return pg.evaluate("()=>({hit:document.documentElement.classList.contains('imm-hit'), vib:window.__vib.length})")
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    def ctx(**kw):
        c = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, **kw); c.add_init_script(SEED); pg = c.new_page(); pg.on("pageerror", lambda e: errs.append(str(e))); return c, pg
    # theme follows the phone
    lum = {}
    for cs in ("dark", "light"):
        c, pg = ctx(color_scheme=cs); open_sheet(pg)
        lum[cs] = pg.evaluate("()=>{const m=getComputedStyle(document.body).backgroundColor.match(/\\d+/g).map(Number); return [m[0]+m[1]+m[2], document.documentElement.getAttribute('data-theme')]}"); c.close()
    check("theme follows prefers-color-scheme (light page brighter)", lum["light"][0] > lum["dark"][0] + 200 and lum["light"][1] == "light" and lum["dark"][1] == "dark", lum)
    # reduced motion
    c, pg = ctx(reduced_motion="reduce"); open_sheet(pg); a = pg.evaluate(ANIM)
    check("reduced motion: no portrait breathing, no background drift", a["photo"] == "none" and "immDrift" not in a["art"], a); c.close()
    c, pg = ctx(); open_sheet(pg)
    a = pg.evaluate(ANIM); check("Immersive on: portrait breathes, class art drifts", a["photo"] == "immBreath" and "immDrift" in a["art"], a)
    h = damage(pg, 3); check("HP drop adds the red edge pulse and a buzz", h["hit"] and h["vib"] >= 1, h)
    pg.wait_for_timeout(1000); check("edge pulse clears", not pg.evaluate("()=>document.documentElement.classList.contains('imm-hit')"))
    acc1 = pg.evaluate("()=>getComputedStyle(document.documentElement).getPropertyValue('--pl-rgb').trim()")
    # Immersive Off through the Settings button handler, then reload
    pg.evaluate("()=>{const x=document.createElement('button'); x.setAttribute('data-mifx','off'); document.body.appendChild(x); x.click(); x.remove()}")
    pg.wait_for_function("()=>localStorage.getItem('mi-fx')==='off'"); pg.wait_for_timeout(1500)
    pg.reload(); pg.wait_for_timeout(2500); pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); pg.wait_for_timeout(1500)
    off = pg.evaluate("()=>({cls:document.documentElement.classList.contains('mi-off'), st:window.__store.getItem('mi-fx')})")
    check("Immersive Off persists over a reload", off["cls"] and off["st"] == "off", off)
    a = pg.evaluate(ANIM); check("Immersive Off: no breathing, no drift", a["photo"] == "none" and "immDrift" not in a["art"], a)
    pg.evaluate("()=>{window.__vib.length=0}"); h = damage(pg, 2); check("Immersive Off: no edge pulse on HP drop", not h["hit"], h)
    pg.evaluate("()=>{const x=document.createElement('button'); x.setAttribute('data-mifx','full'); document.body.appendChild(x); x.click(); x.remove()}")
    # Wizard: accent and slots
    pg.evaluate("()=>window.__bldNeed&&window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__sheetApply==='function'", timeout=120000)
    pg.evaluate("""()=>{const all={};(window.WX.src||[]).forEach(x=>all[x.id]=true);
      const b=window.__bldFuzz({sp:'Human',bg:'Sage',rs:'2024',src:all,cls:'Wizard',lv:5,arr:[8,14,14,16,10,10],b2:0,b1:0}).b; window.__sheetApply(window.__bldSheetFor(b,{}),false)}"""); pg.wait_for_timeout(1500)
    acc2 = pg.evaluate("()=>[document.documentElement.getAttribute('data-mi-cls'), getComputedStyle(document.documentElement).getPropertyValue('--pl-rgb').trim()]")
    check("accent follows the class (Fighter to Wizard)", acc2[0] == "wizard" and acc2[1] and acc2[1] != acc1, [acc1, acc2])
    pg.click("[data-go='3']"); pg.wait_for_timeout(1200)
    SL = "()=>[...document.querySelectorAll('.spsl .bx')].filter(e=>e.offsetParent).map(e=>{const s=getComputedStyle(e,'::before'); return {u:e.getAttribute('aria-pressed')==='true', t:s.transform, f:s.filter, o:+s.opacity}})"
    s0 = pg.evaluate(SL); check("spell slots drawn as crystals that glow", s0 and all(x["t"] != "none" for x in s0) and "drop-shadow" in s0[0]["f"], s0[:2])
    pg.evaluate("()=>[...document.querySelectorAll('.spsl .bx')].find(e=>e.offsetParent).click()"); pg.wait_for_timeout(400)
    s1 = pg.evaluate(SL); u = [x for x in s1 if x["u"]]
    check("a used slot turns dim and grey", u and "grayscale" in u[0]["f"] and u[0]["o"] < 0.8, s1[:2])
    c.close(); b.close()
check("no page errors", not errs, errs[:3])
print("immersive: %d/%d" % (sum(R), len(R))); sys.exit(0 if all(R) else 1)
