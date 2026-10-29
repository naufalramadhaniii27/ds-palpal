#!/usr/bin/env python3
"""T11 U52: the tour on the character's own sheet.
  python3 tests/tour_flow.py [--shots DIR]
390x844 and 1250x850: Home shows one New here? card (Learn and Tour); the tour points at HP, Armor Class, a skill (waits for the tap),
the Roll button (waits for the roll), the tabs, Rest and More; the roll is taken back at the end (journal and roll history as before);
the card then becomes the Learn band. Back closes the tour. Without a character the tour points at Create. Settings starts it again."""
import asyncio, json, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
SHOTS = args[args.index("--shots") + 1] if "--shots" in args else None
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
TS = "()=>window.__tour&&window.__tour.state().i"
SAVED = "()=>{ var o={}; for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); if(/^mi-jr-/.test(k)) o[k]=localStorage.getItem(k); } o.rolls=sessionStorage.getItem('mi-rolls'); return JSON.stringify(o); }"
async def main():
    srv, url = serve(); bad = []
    if SHOTS: os.makedirs(SHOTS, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await pg.wait_for_selector("#htour", state="visible", timeout=30000); await pg.wait_for_timeout(1500)
            card = await pg.evaluate("()=>({learn:!!document.querySelector('#htour [data-hlearn]'), tour:!!document.querySelector('#htour [data-tour=\"go\"]'), band:!!document.getElementById('hlearnB')})")
            if not (card["learn"] and card["tour"] and not card["band"]): bad.append(vp + " Home card " + json.dumps(card))
            before = await pg.evaluate(SAVED)
            await pg.click('#htour [data-tour="go"]'); await pg.wait_for_selector("#lrnSpot", state="visible", timeout=15000)
            seen = []
            for n in range(12):
                await pg.wait_for_timeout(700); i = await pg.evaluate(TS)
                if i is None or i < 0: break
                seen.append(i)
                if SHOTS and n < 9: await pg.screenshot(path=os.path.join(SHOTS, "tour-%s-%d.png" % (vp, i)))
                r = await pg.evaluate("()=>{ var r=document.getElementById('spotR'), c=document.getElementById('lrnSpot'); if(!r||!c) return null; var a=r.getBoundingClientRect(), b=c.getBoundingClientRect(); return {w:a.width,h:a.height,cy:b.top,cb:b.bottom,cl:b.left,cr:b.right,vw:innerWidth,vh:innerHeight}; }")
                if not r or r["w"] < 10 or r["cl"] < 0 or r["cr"] > r["vw"] + 1 or r["cy"] < 0 or r["cb"] > r["vh"] + 1: bad.append("%s step %d spotlight %s" % (vp, i, json.dumps(r)))
                if i == 2:  # tap the real number, the tour must move on by itself
                    await pg.evaluate("()=>{ var e=window.__spot.find('skill:Athletics'); e.click(); }"); await pg.wait_for_function("()=>window.__tour.state().i===3", timeout=8000); continue
                if i == 3:
                    await pg.evaluate("()=>document.querySelector('#sheet [data-mr]').click()"); await pg.wait_for_function("()=>window.__tour.state().i===4", timeout=15000); continue
                if i == 6:
                    await pg.click('#lrnSpot [data-tour="skip"]'); break
                await pg.click('#lrnSpot [data-tour="next"]')
            if seen != [0, 1, 2, 3, 4, 5, 6]: bad.append(vp + " steps seen " + str(seen))
            await pg.wait_for_timeout(500)
            after = await pg.evaluate(SAVED)
            if after != before: bad.append(vp + " the tour roll was not taken back: " + after[:200] + " / " + before[:200])
            st = await pg.evaluate("()=>({done:JSON.parse(localStorage.getItem('cs-ui-tour')||'{}').done, spot:!!document.getElementById('lrnSpot')})")
            if not st["done"] or st["spot"]: bad.append(vp + " end state " + json.dumps(st))
            # Settings starts it again, Back closes it
            await pg.evaluate("()=>document.getElementById('themeBtn').click()"); await pg.wait_for_selector('#sheet [data-tour="go"]', state="visible", timeout=8000)
            await pg.click('#sheet [data-tour="go"]'); await pg.wait_for_selector("#lrnSpot", state="visible", timeout=8000); await pg.wait_for_timeout(600)
            await pg.go_back(); await pg.wait_for_timeout(700)
            if await pg.evaluate("()=>!!document.getElementById('lrnSpot')||window.__tour.state().i>=0"): bad.append(vp + " Back did not close the tour")
            await pg.evaluate("()=>window.__app.showHome()"); await pg.wait_for_timeout(500)
            if not await pg.evaluate("()=>!!document.getElementById('hlearnB')&&!document.getElementById('htour')"): bad.append(vp + " Home did not switch to the Learn band")
            for e in errs: bad.append(vp + " " + e[:200])
            await ctx.close()
            # no character: the tour points at Create
            ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page()
            await pg.goto(url); await pg.evaluate("()=>{localStorage.clear(); localStorage.setItem('mi-fx','off');}"); await pg.reload()
            await pg.wait_for_selector("#htour", state="visible", timeout=30000); await pg.wait_for_timeout(1200)
            await pg.click('#htour [data-tour="go"]'); await pg.wait_for_selector("#lrnSpot", state="visible", timeout=15000)
            on = await pg.evaluate("()=>{ var r=document.getElementById('spotR').getBoundingClientRect(), c=document.querySelector('#homeV .hcreate').getBoundingClientRect(); return Math.abs(r.left+6-c.left)<3&&Math.abs(r.top+6-c.top)<3; }")
            if not on: bad.append(vp + " new person: spotlight not on Create")
            if SHOTS: await pg.screenshot(path=os.path.join(SHOTS, "tour-%s-new.png" % vp))
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("tour_flow:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
