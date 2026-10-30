#!/usr/bin/env python3
"""T11 Learn: axe scan and tap size on the Learn screens (map, a guess step, the d20 roll, the grid, the glossary card, the final card).
  python3 tests/learn_a11y.py AXE_JS        (axe-core/axe.min.js)
390x844 and 1250x850. Exit 1 on any axe violation (serious or critical) or a Learn control under 44 px."""
import asyncio, json, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); AXE = open(sys.argv[1], encoding="utf-8").read()
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
SCAN = """async()=>{ var r=await axe.run(document.getElementById('learn'),{resultTypes:['violations']}); var v=r.violations.filter(x=>x.impact==='serious'||x.impact==='critical').map(x=>x.id+' ('+x.nodes.length+') '+x.nodes.slice(0,2).map(n=>n.target.join(' ')).join(' | '));
  var small=[...document.querySelectorAll('#learn button')].filter(b=>{ var r=b.getBoundingClientRect(); return r.width>0&&r.height>0&&!b.classList.contains('lrn-term')&&(r.width<44||r.height<44); }).map(b=>(b.className||b.tagName)+' '+Math.round(b.getBoundingClientRect().width)+'x'+Math.round(b.getBoundingClientRect().height));
  return {v:v,small:small}; }"""
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block", bypass_csp=True, reduced_motion="reduce"); pg = await ctx.new_page()
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hlearn]", state="attached", timeout=30000); await pg.add_script_tag(content=AXE)
            async def scan(name):
                await pg.wait_for_timeout(400); r = await pg.evaluate(SCAN); print("%dx%d %-10s violations: %s  small: %s" % (w, h, name, r["v"] or 0, r["small"] or 0))
                for x in r["v"]: bad.append("%dx%d %s %s" % (w, h, name, x))
                for x in r["small"]: bad.append("%dx%d %s small %s" % (w, h, name, x))
            await pg.click("[data-hlearn]"); await scan("map")
            await pg.click('#lrnB [data-lgo="2"]'); await scan("guess")
            await pg.click("#lrnB [data-lg]"); await pg.click("#lrnB [data-lterm]"); await scan("glossary")
            await pg.click('#lrnPop [data-l="pop"]'); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await scan("roll")
            while (await pg.evaluate("()=>window.__learnState().view")) != "map": await pg.click('#learn [data-l="back"]'); await pg.wait_for_timeout(200)
            await pg.click('#lrnB [data-lgo="3"]'); await pg.click("#lrnB [data-lg]"); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await pg.click("#lrnNext"); await scan("grid")
            # F3 How the builder works: the picture loads, 3 numbered points, a tap makes Hoot explain that point
            while (await pg.evaluate("()=>window.__learnState().view")) != "map": await pg.click('#learn [data-l="back"]'); await pg.wait_for_timeout(200)
            await pg.evaluate("()=>{ var b=[...document.querySelectorAll('#lrnB [data-lgo]')].find(x=>/Forge|Pahlawan/.test(x.textContent)); b.click(); }"); await pg.wait_for_selector("#lrnB .lrn-shot img", timeout=10000); await pg.wait_for_timeout(600)
            sh = await pg.evaluate("()=>({n:document.querySelectorAll('#lrnB .lrn-pt').length, ok:document.querySelector('#lrnB .lrn-shot img').naturalWidth>0})")
            if sh["n"] != 3 or not sh["ok"]: bad.append("%dx%d shots %s" % (w, h, json.dumps(sh)))
            await pg.click('#lrnB [data-ldot="pick"]'); await pg.wait_for_timeout(300)
            if "choice" not in await pg.evaluate("()=>document.getElementById('lrnSay').textContent"): bad.append("%dx%d dot did not explain" % (w, h))
            await scan("shots")
            # G7 Training Ground setup and field (same axe rules, on #tg)
            await pg.click('#learn [data-l="close"]'); await pg.wait_for_timeout(300); await pg.evaluate("()=>window.__app.showHome()")
            await pg.click("#htgB [data-tgopen]"); await pg.wait_for_selector("#tg .tg-foe", timeout=30000)
            r = await pg.evaluate(SCAN.replace("getElementById('learn')", "getElementById('tg')").replace("#learn button", "#tg button")); print("%dx%d tg-setup violations: %s small: %s" % (w, h, r["v"] or 0, r["small"] or 0)); bad.extend(["%dx%d tg-setup %s" % (w, h, x) for x in r["v"] + r["small"]])
            await pg.click('[data-tgf="goblin-warrior"][data-d="1"]') if await pg.query_selector('[data-tgf="goblin-warrior"]') else await pg.click('#tg [data-tgf][data-d="1"]')
            await pg.click('[data-tg="enter"]'); await pg.wait_for_selector("#tgCv"); await pg.wait_for_timeout(300)
            r = await pg.evaluate(SCAN.replace("getElementById('learn')", "getElementById('tg')").replace("#learn button", "#tg button")); print("%dx%d tg-field violations: %s small: %s" % (w, h, r["v"] or 0, r["small"] or 0)); bad.extend(["%dx%d tg-field %s" % (w, h, x) for x in r["v"] + r["small"]])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("learn_a11y:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
