import asyncio, functools, http.server, socket, threading, sys
from playwright.async_api import async_playwright
RATE=float(sys.argv[1]) if len(sys.argv)>1 else 4
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory="/tmp/claude-0/out")); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open("/home/claude/dnd-sheet/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page()
        await pg.goto("http://127.0.0.1:%d/dnd-sheet-fps-test.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("#fpsGo",timeout=30000); await pg.wait_for_timeout(2500)
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":RATE})
        await pg.evaluate("document.getElementById('fpsWarm').checked=%s"%("true" if __import__("sys").argv[2:3]==["warm"] else "false")); await pg.tap("#fpsGo",timeout=5000)
        await pg.wait_for_function("document.getElementById('fpsOut').textContent.includes('Done. A smooth')",timeout=180000)
        print(await pg.inner_text("#fpsOut")); await b.close()
asyncio.run(main())
