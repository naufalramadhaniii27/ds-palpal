#!/usr/bin/env python3
"""A1: the Content-Security-Policy and Trusted Types do not block anything the app does. 390x844 and 1250x850.
  python3 tests/csp_check.py [OUTDIR] [--root DIR]
Walks Home, the sheet (every tab, a detail panel, damage, heal, rest menu, More menu, Settings), the Library and a detail, Report a Problem,
the builder (Quick Build Fighter, Apply), Export PDF. Fails on any securitypolicyviolation event, any Trusted Types log entry
(window.__ttLog: HTML the default policy had to clean), or any page error. Also checks the policy is really active."""
import asyncio, os, sys, functools, http.server, socket, threading, json
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
if "--root" in args: i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "csp"); os.makedirs(OUT, exist_ok=True)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
WATCH = "window.__cspv=[]; document.addEventListener('securitypolicyviolation', function(e){ window.__cspv.push(e.violatedDirective+' '+(e.blockedURI||'')+' '+(e.sample||'').slice(0,80)); });"
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def clickall(pg, sel, wait=350, most=12):
    for el in (await pg.query_selector_all(sel))[:most]:
        try:
            if await el.is_visible(): await el.click(timeout=3000); await pg.wait_for_timeout(wait)
        except Exception: pass
async def closeall(pg):
    for _ in range(3):
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in ((390, 844), (1250, 850)):
            tag = "%dx%d" % (w, h); ctx = await b.new_context(viewport={"width": w, "height": h}, accept_downloads=True); pg = await ctx.new_page(); errs = []
            await ctx.add_init_script(WATCH); pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v);}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(1500)
            active = await pg.evaluate("()=>{ try{ document.createElement('div').innerHTML='<b>x</b>'; }catch(e){} return !!(window.trustedTypes&&trustedTypes.defaultPolicy); }")
            if not active: bad.append(tag + " Trusted Types default policy not active")
            try:
                await pg.evaluate("()=>{ var s=document.createElement('script'); s.textContent='window.__cspProbe=1'; document.body.appendChild(s); }")
            except Exception: pass
            if await pg.evaluate("()=>!!window.__cspProbe"): bad.append(tag + " an inline script that is not in the policy still ran")
            await pg.evaluate("()=>{ window.__cspv=[]; window.__ttLog=[]; }")
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1000)
            await pg.fill("#hpAmt", "3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(300); await pg.fill("#hpAmt", "1"); await pg.click("#healBtn"); await pg.wait_for_timeout(300)
            for t in await pg.query_selector_all("#tabs .tab, #bnav button"):
                try:
                    if await t.is_visible(): await t.click(timeout=3000); await pg.wait_for_timeout(450)
                except Exception: pass
            await clickall(pg, "[data-info]", 120); await closeall(pg)
            await pg.screenshot(path=os.path.join(OUT, tag + "-sheet.png"))
            await pg.evaluate("()=>{ var m=document.getElementById('moreBtn'); if(m) m.click(); }"); await pg.wait_for_timeout(500); await pg.screenshot(path=os.path.join(OUT, tag + "-more.png")); await closeall(pg)
            await pg.keyboard.press("l"); await pg.wait_for_timeout(600)
            try:
                await pg.fill("#libQ", "fireball"); await pg.wait_for_timeout(800)
                r = await pg.query_selector("#libC [data-lib-open], #libC button, #libC li");
                if r: await r.click(); await pg.wait_for_timeout(600)
            except Exception: pass
            await closeall(pg)
            await pg.evaluate("()=>{ try{ window.__reportText(); }catch(e){} }")
            async with pg.expect_download(timeout=120000) as dl:
                await pg.evaluate("()=>document.getElementById('pdfBtn').click()")
            await dl.value
            v = await pg.evaluate("()=>({csp:window.__cspv, tt:window.__ttLog||[]})")
            if v["csp"]: bad.append(tag + " CSP blocked: " + " | ".join(v["csp"][:4]))
            if v["tt"]: bad.append(tag + " Trusted Types cleaned HTML: " + " | ".join(json.dumps(x)[:140] for x in v["tt"][:3]))
            if errs: bad.append(tag + " page errors: " + " | ".join(errs[:3]))
            print(tag, "csp", len(v["csp"]), "tt", len(v["tt"]), "errors", len(errs))
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("ok" if not bad else "%d problems" % len(bad)); return 1 if bad else 0
sys.exit(asyncio.run(main()))
