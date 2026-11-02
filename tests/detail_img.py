"""Also covers the N44 template sites that draw on the sheet: playbar icons, condition chips, death save pips, speeds.
Detail panel picture (sheet card): the 5etools picture comes first, then the Codex icon, then the generic one.
Checks at 390x844 and 1250x850: Background Soldier and an inventory Potion of Healing use data/img/*.webp, Size uses img/icon/size/medium."""
import json, os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
d = json.load(open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8")); d["inv"].append({"n": "Potion of Healing", "q": 2, "w": 0.5})
SEED = "(v=>{try{if(sessionStorage.getItem('s'))return;sessionStorage.setItem('s','1');localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}catch(e){}})(" + json.dumps(json.dumps(d)) + ")"
R = []
def check(n, ok, info=""): R.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("" if ok else "  " + str(info)[:200]))
with sync_playwright() as p:
    b = p.chromium.launch()
    for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
        ctx = b.new_context(viewport={"width": w, "height": h}); ctx.add_init_script(SEED); pg = ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(3500)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()"); pg.wait_for_timeout(3500)
        pg.evaluate("()=>{var b=[...document.querySelectorAll('button')].find(x=>/^continue$/i.test(x.textContent.trim())&&x.offsetParent);b&&b.click()}"); pg.wait_for_timeout(2500)
        def wm(): return pg.evaluate("()=>{var w=document.getElementById('shWm');return w?w.innerHTML:''}")
        def closeit(): pg.evaluate("()=>{var c=document.getElementById('sheetClose');c&&c.click()}"); pg.wait_for_timeout(500)
        ic = pg.evaluate("()=>['vbHpI','vbConc','vbInsp','vbCondI'].map(i=>(document.getElementById(i)||{innerHTML:''}).innerHTML.length)")
        check(vp + " playbar icons drawn", all(n > 50 for n in ic), ic)
        check(vp + " death save pips drawn", pg.evaluate("()=>document.querySelectorAll('#dsS .pip').length+document.querySelectorAll('#dsF .pip').length") == 6)
        check(vp + " speeds drawn", "Walking" in (pg.evaluate("()=>(document.getElementById('speeds')||{}).textContent") or ""))
        pg.evaluate("()=>{var b=document.getElementById('condOpen');b&&b.click()}"); pg.wait_for_timeout(800)
        pg.evaluate("()=>{var e=[...document.querySelectorAll('#sheetBody button,#sheetBody .chip,#sheetBody label')].find(x=>/^poisoned/i.test(x.textContent.trim()));e&&e.click()}"); pg.wait_for_timeout(600); closeit()
        check(vp + " condition chip drawn after adding Poisoned", "Poisoned" in pg.evaluate("()=>[...document.querySelectorAll('#conds .chip')].map(x=>x.textContent.trim()).join('|')"))
        for t in ("Soldier", "Medium"):
            pg.evaluate("t=>{var e=[...document.querySelectorAll('button.tx,.tx')].find(x=>x.textContent.trim().startsWith(t)&&x.offsetParent);e&&e.click()}", t); pg.wait_for_timeout(1200)
            h1 = wm()
            if t == "Soldier": check(vp + " Background Soldier uses the 5etools picture", "data/img/backgrounds/XPHB/Soldier.webp" in h1, h1[:120])
            else: check(vp + " Size uses the Codex size icon", "img/icon/size/medium" in h1, h1[:120])
            closeit()
        pg.evaluate("()=>document.getElementById('t-inv').click()"); pg.wait_for_timeout(1200)
        pg.evaluate("()=>{var e=[...document.querySelectorAll('#p-inv .iname')].find(x=>/Potion of Healing/.test(x.textContent));e&&e.click()}"); pg.wait_for_timeout(1200)
        h1 = wm(); check(vp + " Potion of Healing uses the 5etools picture", "data/img/items/XDMG/Potion%20of%20Healing.webp" in h1, h1[:120])
        check(vp + " no page errors", not errs, errs); ctx.close()
    b.close()
print("SCORE %d" % round(100 * sum(R) / len(R))); sys.exit(0 if all(R) else 1)
