# Research script (2026-10-30). Run: APP_ROOT=<folder with index.html> python3 FILE.py. Measures only, never changes the app.
import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT",".")
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); pg=await b.new_page(viewport={"width":390,"height":844})
        await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(1000)
        tests=["Rage: once = 1 per rest","Javascript: a language","Spell slots: one = 1st level","Note on = 5","Plain note"]
        r=await pg.evaluate("""(ts)=>ts.map(t=>{var d=document.createElement('div'); d.innerHTML='<p>'+t+'</p>'; return [t,d.textContent]})""",tests)
        for t,o in r: print(("OK     " if t==o else "MANGLED"),repr(t),"->",repr(o))
        await b.close()
    srv.shutdown()
asyncio.run(main())
