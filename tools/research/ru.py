import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500)
        cdp=await ctx.new_cdp_session(pg); await cdp.send("DOM.enable"); await cdp.send("CSS.enable"); await cdp.send("CSS.startRuleUsageTracking")
        await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1000)
        for t in await pg.query_selector_all("#bnav button"):
            try: await t.click(timeout=1000)
            except Exception: pass
            await pg.wait_for_timeout(250)
        await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(600); await pg.click("#healBtn"); await pg.wait_for_timeout(600)
        r=await cdp.send("CSS.stopRuleUsageTracking"); ru=r["ruleUsage"]
        used=sum(1 for x in ru if x["used"]); tot=len(ru)
        sizes={}
        for x in ru: sizes.setdefault(x["styleSheetId"],[0,0]); sizes[x["styleSheetId"]][0]+=1; sizes[x["styleSheetId"]][1]+=x["used"]
        print("rules total",tot,"used",used,"unused",tot-used,"| per sheet",sizes)
        await b.close()
asyncio.run(main())
