"""Continue on Home early (deferred data still loading) and late: once the loader and the transition are gone, the sheet must be final.
  Before 0.0.85 an early tap drew stand-ins (GEAR, --) that changed 0.7 s later. Uses dist/ (sh tools/pages_dist.sh), CPU 4x."""
import asyncio, functools, http.server, threading, socket, sys
from playwright.async_api import async_playwright
import os
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.join(os.path.dirname(HERE),"dist")
Y=open(os.path.join(HERE,"fixtures","yudhi-v3.json")).read()
s=socket.socket(); s.bind(("127.0.0.1",0)); P=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",P),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
W="""()=>{const t0=performance.now();window.__L=[];function f(){const h=document.documentElement, sv=document.getElementById('sheetV')||document.querySelector('main'), hv=document.getElementById('homeV');
 const txt=(document.body.innerText||'').length, tabs=document.querySelectorAll('#tabs .tab').length;
 window.__L.push([Math.round(performance.now()-t0),document.getElementById('busy').classList.contains('on')?'B':'-',h.classList.contains('vt-go')?'VT':'-',hv&&!hv.hidden?'H':'-',tabs,Math.round(txt/100)]); if(__L.length<500) requestAnimationFrame(f)} f()}"""
async def main(wait):
  async with async_playwright() as p:
    br=await p.chromium.launch(); ctx=await br.new_context(viewport={"width":390,"height":844},service_workers="block"); pg=await ctx.new_page()
    await pg.goto("http://127.0.0.1:%d/index.html"%P); await pg.wait_for_timeout(800)
    await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",Y); await pg.reload(); await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); await pg.wait_for_timeout(2500)
    c=await ctx.new_cdp_session(pg); await c.send("Emulation.setCPUThrottlingRate",{"rate":4})
    await pg.reload(); await pg.wait_for_timeout(wait)
    await pg.evaluate(W); await pg.evaluate("()=>{var b=document.querySelector('#homeV [data-hview]'); b.click()}"); await pg.wait_for_timeout(5000)
    L=await pg.evaluate("()=>window.__L"); await br.close(); return L
def check(L):
    # after the loader and the transition are gone, the sheet text must not change any more
    shown=[r for r in L if r[1]=='-' and r[2]=='-' and r[3]=='-']
    if not shown: return "sheet never shown"
    if len(set(r[5] for r in shown))>1: return "sheet changed after the loader was gone: %s" % sorted(set(r[5] for r in shown))
    return None
bad=0
for w in (1500, 6000):
    e=check(asyncio.run(main(w)))
    print(("FAIL " if e else "ok   ")+"Continue %d ms after load%s" % (w, ": "+e if e else "")); bad+=bool(e)
srv.shutdown(); sys.exit(1 if bad else 0)
