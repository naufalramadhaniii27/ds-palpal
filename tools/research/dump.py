import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"
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
        b=await pw.chromium.launch(); pg=await b.new_page()
        await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(1500)
        out=await pg.evaluate("()=>{var c=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')); var d=window.__deriveFor(c); return {c:c,d:d}}")
        json.dump(out,open("yudhi-dump.json","w"))
        d=out["d"]; print(list(d.keys())); print(json.dumps(d["atk"])[:600]); print(json.dumps(d["save"]),json.dumps(d["speed"]),d["init"],d["dc"],json.dumps(d["carry"])[:100],json.dumps(d["res"])[:100])
        await b.close()
    srv.shutdown()
asyncio.run(main())
