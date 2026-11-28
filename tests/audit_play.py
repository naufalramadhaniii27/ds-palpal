"""Player audit at 390x844 (touch, dark) on the Yudhi fixture: with the attack hotbar docked, every tab scrolled to the end shows its
last control above the hotbar (nothing stuck under the strip), the HP card's Heal, Damage and Temporary HP stay tappable from the
Main tab and from the HP sheet, and no page error.   python3 tests/audit_play.py"""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
SEED = "(v=>{try{if(localStorage.getItem('__seed'))return;localStorage.clear();localStorage.setItem('__seed','1');localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(d) + ")"
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
HIT = """ids=>ids.map(id=>{const e=document.getElementById(id); if(!e) return id+':missing'; const r=e.getBoundingClientRect(); const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2); return t&&(e.contains(t)||t.contains(e))?'ok':id+':'+(t&&(t.id||t.className))})"""
# the panel on screen, scrolled to its end: the lowest visible control must end above the hotbar
END = """()=>{const p=[...document.querySelectorAll('#p-main,#p-skills,.detail>.panels>.panel')].find(p=>p.offsetParent&&Math.abs(p.getBoundingClientRect().left)<50);
  const sc=[p,document.scrollingElement].find(s=>s&&s.scrollHeight>s.clientHeight+2)||p; sc.scrollTop=sc.scrollHeight;
  const hb=document.querySelector('.xhot').getBoundingClientRect().top; let low=null;
  p.querySelectorAll('button,input,select,.abox').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width&&r.height&&getComputedStyle(e).visibility!=='hidden'&&(!low||r.bottom>low.b)) low={b:r.bottom,n:(e.id||e.className)+' '+(e.textContent||'').trim().slice(0,20)}});
  return {id:p.id, hb:Math.round(hb), low:low&&Math.round(low.b), n:low&&low.n}}"""
<<<<<<< HEAD
# the page CSP requires Trusted Types, so Function() and eval() throw on the hosting form (formulas read 0 or NaN)
import re, glob
ev = [f for f in glob.glob(os.path.join(ROOT, "src", "**", "*.js"), recursive=True) if "/data/" not in f and re.search(r"(?<![\w.])(Function|eval)\(", open(f, encoding="utf-8").read())]
check("no Function() or eval() in src (blocked by Trusted Types)", not ev, ev)
=======
>>>>>>> bba3d2b5f (Hotbar: pad the tabs by the measured hotbar height (--hb-b), so a taller strip (larger text) never covers the last controls; tests/audit_play.py in quick ui)
with sync_playwright() as p:
    b = p.chromium.launch(); errs = []
    c = b.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True, color_scheme="dark"); c.add_init_script(SEED); pg = c.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(2500)
    pg.click("[data-hview]"); pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); pg.wait_for_timeout(1200)
    for g in range(9):
        pg.evaluate("g=>document.querySelector('[data-go=\"'+g+'\"]').click()", str(g)); pg.wait_for_timeout(500)
        e = pg.evaluate(END); pg.wait_for_timeout(200); e = pg.evaluate(END)
        check("tab %d (%s): last control above the hotbar" % (g, e["id"]), e["low"] is None or e["low"] <= e["hb"], e)
    pg.evaluate("()=>document.querySelector('[data-go=\"0\"]').click()"); pg.wait_for_timeout(400)
    pg.click("#vbHp"); pg.wait_for_timeout(1000)
    h = pg.evaluate(HIT, ["healBtn", "dmgBtn", "hpAmt", "tmpV"]); check("Main: Heal, Damage, amount and Temporary HP tappable", all(x == "ok" for x in h), h)
    pg.evaluate("()=>document.querySelector('[data-go=\"2\"]').click()"); pg.wait_for_timeout(500)
    pg.click("#vbHp"); pg.wait_for_timeout(1000)
    h = pg.evaluate(HIT, ["healBtn", "dmgBtn", "hpAmt", "tmpV"]); check("HP sheet: Heal, Damage, amount and Temporary HP tappable", all(x == "ok" for x in h), h)
    check("no page errors", not errs, errs)
    b.close()
print("audit_play: %d/%d" % (sum(R), len(R))); sys.exit(0 if all(R) else 1)
