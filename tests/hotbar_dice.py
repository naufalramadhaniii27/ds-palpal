"""Brief stage 5 at 390x844 on the Yudhi fixture: the attack hotbar mirrors the attack rows and a tap rolls (attack, then the damage
card); the 3D die shows with Immersive on and not with Immersive Off; the quick-action button opens Rest and Level Up; the hotbar,
the button and the roll-history badge do not overlap the HP/AC bar or each other; targets are at least 44px.
SHOTS=dir also saves screenshots.   python3 tests/hotbar_dice.py"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.environ.get("SHOTS")
d = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def seed(fx): return "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);localStorage.setItem('mi-fx','%s')}catch(e){}})(%s)" % (fx, json.dumps(d))
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
def shot(pg, n):
    if SH: os.makedirs(SH, exist_ok=True); pg.screenshot(path=os.path.join(SH, n + ".png"))
RECT = "s=>{const e=document.querySelector(s); if(!e||!e.offsetParent&&getComputedStyle(e).position!=='fixed') return null; const r=e.getBoundingClientRect(); return r.width?{t:r.top,b:r.bottom,l:r.left,r:r.right,w:r.width,h:r.height}:null}"
def over(a, b): return a and b and a["l"] < b["r"] and b["l"] < a["r"] and a["t"] < b["b"] and b["t"] < a["b"]
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]); errs = []; home = []
    def open_sheet(fx):
        c = b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2); c.add_init_script(seed(fx)); pg = c.new_page(); pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(2500)
        home.append(pg.evaluate("()=>[!document.querySelector('#homeV').hidden, (()=>{const f=document.querySelector('.qfab-b'), r=f.getBoundingClientRect(); return r.width&&f.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))?'shown':'none'})(), (()=>{const x=document.querySelector('.xhot'); if(x.hidden) return false; const r=x.getBoundingClientRect(); return x.contains(document.elementFromPoint(r.left+30,r.top+r.height/2))})()]"))
        pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); pg.wait_for_timeout(1200)
        pg.click("[data-go='2']"); pg.wait_for_timeout(900); return c, pg
    c, pg = open_sheet("full")
    check("Home: no hotbar, no quick-action button", home[0][0] and home[0][1] == "none" and not home[0][2], home)
    n = pg.evaluate("()=>[...document.querySelectorAll('#actBody .arow')].filter(r=>r.querySelector('.abox[data-bd^=\"ah-\"]')).length")
    items = pg.evaluate("()=>[...document.querySelectorAll('.xhot .xhot-i')].map(b=>({t:b.textContent, h:b.getBoundingClientRect().height, w:b.getBoundingClientRect().width, l:b.getAttribute('aria-label')}))")
    check("hotbar shows the main attacks", n > 0 and len(items) == min(n, 10) and "Unarmed" in items[0]["t"] and "+7" in items[0]["t"], [n, items[:2]])
    check("hotbar buttons are 44px targets with a label", all(x["h"] >= 44 and x["w"] >= 44 and x["l"].startswith("Roll ") for x in items), items[:2])
    check("hotbar scrolls sideways when full", pg.evaluate("()=>{const e=document.querySelector('.xhot'); return getComputedStyle(e).overflowX==='auto' && getComputedStyle(e).flexWrap==='nowrap'}"))
    hb, vb, fab, rhb = (pg.evaluate(RECT, s) for s in (".xhot", "#vbar", ".qfab-b", ".mi-rhb"))
    check("hotbar sits on the HP/AC bar, not over it", hb and vb and abs(hb["b"] - vb["t"]) <= 1, [hb, vb])
    check("quick-action button docked beside the hotbar, above the HP/AC bar", fab and not over(fab, hb) and fab["t"] >= hb["t"] - 2 and fab["b"] <= vb["t"] and fab["w"] >= 44, [fab, hb])
    check("page padded under the hotbar", pg.evaluate("()=>parseFloat(getComputedStyle(document.querySelector('#p-actions')).paddingBottom)>=150"))
    shot(pg, "actions-hotbar")
    pg.click(".xhot .xhot-i[data-xhot='1']"); pg.wait_for_timeout(450)
    die = pg.evaluate("()=>!!document.querySelector('#diceTray.on')"); shot(pg, "die-mid-roll")
    check("Immersive on: tapping an attack throws the 3D die", die)
    pg.wait_for_function("()=>/Dagger: attack roll/.test(window.__store.getItem(window.__miRollKey())||'')", timeout=8000)
    if pg.evaluate("()=>JSON.parse(window.__store.getItem(window.__miRollKey()))[0].k") != "nat1":  # a natural 1 offers no damage
        pg.wait_for_function("()=>document.getElementById('sheet').classList.contains('on')", timeout=8000)
    else: pg.evaluate("()=>document.querySelector('#actBody .abox[data-bd=\"ad-1\"]').click()")
    pg.wait_for_timeout(300)
    t = pg.evaluate("()=>[document.querySelector('#sheet').innerText.slice(0,200), (window.__store.getItem(window.__miRollKey())||'')]")
    check("the roll lands in the history and the damage card is offered", "Dagger: attack roll" in t[1] and "1d8+5" in t[0], t)
    shot(pg, "die-landed")
    pg.keyboard.press("Escape"); pg.evaluate("()=>document.querySelectorAll('#sheet.on .xbtn').forEach(x=>x.click())"); pg.wait_for_timeout(500)
    rhb = pg.evaluate(RECT, ".mi-rhb"); fab = pg.evaluate(RECT, ".qfab-b")
    check("roll-history badge clear of the hotbar and the quick-action button", rhb and not over(rhb, hb) and not over(rhb, fab), [rhb, hb, fab])
    pg.click(".qfab-b"); pg.wait_for_timeout(300)
    m = pg.evaluate("()=>({exp:document.querySelector('.qfab-b').getAttribute('aria-expanded'), btn:[...document.querySelectorAll('.qfab-m button')].map(b=>[b.textContent,b.getBoundingClientRect().height]), foc:document.activeElement.textContent})")
    check("quick actions open with Rest and Level Up, focus moves in", m["exp"] == "true" and [x[0] for x in m["btn"]] == ["Rest", "Level Up"] and all(x[1] >= 44 for x in m["btn"]) and m["foc"] == "Rest", m)
    check("open menu: the roll-history badge steps aside", pg.evaluate("()=>getComputedStyle(document.querySelector('.mi-rhb')).opacity")=="0")
    shot(pg, "fab-open")
    pg.click(".qfab-m [data-rest]"); pg.wait_for_timeout(600)
    check("Rest opens the existing rest choice", pg.evaluate("()=>[document.getElementById('sheet').className, !!document.querySelector('#sheet #restDlg'), document.getElementById('sheet').innerText.slice(0,120)]").__getitem__(1))
    pg.evaluate("()=>document.querySelectorAll('#sheet.on .xbtn').forEach(x=>x.click())"); pg.wait_for_timeout(500)
    pg.click(".qfab-b"); pg.click(".qfab-m [data-lvup]")
    check("Level Up opens the builder", pg.wait_for_function("()=>{const b=document.getElementById('bld'); return b && !b.hidden}", timeout=120000) is not None)
    c.close()
    c, pg = open_sheet("off")
    pg.click(".xhot .xhot-i[data-xhot='1']"); pg.wait_for_timeout(450)
    check("Immersive Off: no 3D die, result at once", not pg.evaluate("()=>!!document.querySelector('#diceTray.on')") and "Dagger: attack roll" in (pg.evaluate("()=>window.__store.getItem(window.__miRollKey())") or ""))
    c.close(); b.close()
check("no page errors", not errs, errs[:3])
print("hotbar_dice: %d/%d" % (sum(R), len(R))); sys.exit(0 if all(R) else 1)
