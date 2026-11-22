"""Builder game look at 390x844 (Yudhi fixture): the step strip, the live character preview (#bhud) that follows a pick,
and 44px tap targets on the step strip, the top buttons and the Prev/Next bar.
python3 tests/builder_look.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Y = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:300]))
HUD = "()=>{const h=document.getElementById('bhud');return h&&!h.hidden?h.textContent:null}"
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(viewport={"width": 390, "height": 844}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)) if "Transition was skipped" not in str(e) else None)
    pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(800)
    pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", Y); pg.reload(); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); pg.wait_for_timeout(800)
    pg.evaluate("()=>window.__bldNeed()"); pg.wait_for_function("()=>typeof window.__bldSheetRuns==='function'", timeout=120000)
    pg.evaluate("()=>document.getElementById('bldBtn').click()"); pg.wait_for_timeout(1500)
    pg.evaluate("()=>document.querySelector('#bld [data-step=\"class\"]').click()"); pg.wait_for_timeout(800)
    st = pg.evaluate("()=>[document.querySelectorAll('#steps .st').length, !!document.querySelector('#steps .st[aria-current=step][data-step=class]')]")
    check("step strip has every step and marks the current one", st[0] >= 6 and st[1], st)
    t = pg.evaluate(HUD)
    check("preview shows name, class, level, HP, AC and scores", t and "Yudhi" in t and "Level 4" in t and "HP" in t and "AC" in t and "STR" in t and "CHA" in t, t)
    pg.evaluate("()=>{const s=document.querySelector('#body select[data-lvsel]');s.value='5';s.dispatchEvent(new Event('change',{bubbles:true}))}")
    pg.wait_for_timeout(800)
    t2 = pg.evaluate(HUD)
    check("preview follows a pick (level 4 to 5)", t2 and "Level 5" in t2 and t2 != t, t2)
    small = pg.evaluate("""()=>[...document.querySelectorAll('#steps .st,#bld .top button,#bld .foot button')].filter(b=>b.offsetParent)
      .map(b=>{const r=b.getBoundingClientRect();return [b.id||b.className,Math.round(r.width),Math.round(r.height)]}).filter(x=>x[1]<44||x[2]<44)""")
    check("step strip, top buttons and Prev/Next are at least 44px", not small, small)
    pg.evaluate("()=>document.querySelector('#bld [data-step=\"home\"]').click()"); pg.wait_for_timeout(500)
    check("preview hidden on Home (Name lives there)", pg.evaluate(HUD) is None)
    check("no page errors", not errs, errs)
    br.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
