#!/usr/bin/env python3
"""Response times of the main taps, from the tap to the next painted frame.
  python3 tests/resp_budget.py [--root DIR] [--cpu N] [--limit MS]     default: dist/ (the hosted form, build it with sh tools/pages_dist.sh), CPU 4x, limit 1000 ms
Two moments: "early" right after the page is ready (deferred data may still be loading) and "loaded" after __deferDone.
Taps: every sheet tab, every bottom bar button, Search with a word, Build, each builder step, closing the builder.
Prints every tap with its time and exits 1 when one is over the limit. Report tool for tasks: CPU throttling makes it slow and noisy, so it is not in CI."""
import asyncio, functools, http.server, json, os, socket, sys, threading
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); a = sys.argv[1:]
ROOT = os.path.abspath(a[a.index("--root") + 1]) if "--root" in a else os.path.join(os.path.dirname(HERE), "dist")
CPU = int(a[a.index("--cpu") + 1]) if "--cpu" in a else 4
LIMIT = int(a[a.index("--limit") + 1]) if "--limit" in a else 1000
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

# tap the element, then wait until the DOM changed and a frame was painted (or 50 ms of no change after a frame)
TAP = """(sel)=>new Promise(res=>{const el=document.querySelector(sel); if(!el||!el.offsetParent){res(null);return}
  let done=false, t0=performance.now(); const fin=()=>{if(done)return; done=true; mo.disconnect(); res(Math.round(performance.now()-t0))};
  const mo=new MutationObserver(()=>{requestAnimationFrame(()=>setTimeout(fin,0))}); mo.observe(document.body,{childList:true,subtree:true,attributes:true,characterData:true});
  el.click(); requestAnimationFrame(()=>setTimeout(()=>setTimeout(fin,50),0)); setTimeout(fin,15000)})"""
SEARCH = """()=>new Promise(res=>{const i=document.getElementById('gsQ'); if(!i||!i.offsetParent){res(null);return}
  const t0=performance.now(), seen=()=>/Fireball/.test(document.getElementById('sheetBody').innerText||'');
  const mo=new MutationObserver(()=>{if(!seen())return; mo.disconnect(); requestAnimationFrame(()=>setTimeout(()=>res(Math.round(performance.now()-t0-120)),0))});
  mo.observe(document.body,{childList:true,subtree:true,characterData:true}); i.focus(); i.value='fire'; i.dispatchEvent(new Event('input',{bubbles:true}));
  setTimeout(()=>{mo.disconnect();res(15000)},15000)})"""   # until a result (Fireball) is on screen, minus the 120 ms typing pause of the app
# the library search button under the quick results: until the result list changes and the page is quiet for 100 ms
LIB = """()=>new Promise(res=>{const b=Array.from(document.querySelectorAll('button')).find(x=>/Search the whole library/.test(x.textContent)&&x.offsetParent); if(!b){res(null);return}
  const t0=performance.now(); let last=0, done=false; const fin=()=>{if(done)return; done=true; mo.disconnect(); res(Math.round(last-t0))};
  const mo=new MutationObserver(()=>{last=performance.now(); clearTimeout(q); q=setTimeout(()=>requestAnimationFrame(()=>{last=Math.max(last,performance.now()-100);fin()}),100)}); let q;
  mo.observe(document.body,{childList:true,subtree:true,characterData:true}); b.click(); setTimeout(fin,15000)})"""
LIST = """()=>({tabs:Array.from(document.querySelectorAll('#tabs .tab')).filter(b=>b.offsetParent).map((b,i)=>'#tabs .tab:nth-of-type('+(i+1)+')'),
  bnav:Array.from(document.querySelectorAll('#bnav button')).filter(b=>b.offsetParent).map((b,i)=>'#bnav button:nth-of-type('+(i+1)+')')})"""

async def run(b, base, moment):
    ctx = await b.new_context(viewport={"width": 390, "height": 844}, service_workers="block")
    pg = await ctx.new_page(); pg.set_default_timeout(90000)
    await pg.goto(base); await pg.wait_for_timeout(800)
    await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
    await pg.reload(); await pg.wait_for_timeout(2500)
    await pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); await pg.wait_for_timeout(2000)
    cdp = await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate", {"rate": CPU})
    await pg.reload(wait_until="load")
    for _ in range(300):
        if await pg.evaluate("()=>!!document.getElementById('tabs')&&!!document.querySelector('#tabs .tab')"): break
        await pg.wait_for_timeout(50)
    if moment == "loaded":
        for _ in range(600):
            if await pg.evaluate("()=>!!window.__deferDone"): break
            await pg.wait_for_timeout(100)
        await pg.wait_for_timeout(500)
    out = []
    L = await pg.evaluate(LIST)
    for sel in L["tabs"]:
        name = await pg.evaluate("s=>(document.querySelector(s).textContent||'').trim().slice(0,20)", sel)
        out.append(("tab " + name, await pg.evaluate(TAP, sel)))
    for sel in L["bnav"]:
        name = await pg.evaluate("s=>(document.querySelector(s).getAttribute('aria-label')||document.querySelector(s).textContent||'').trim().slice(0,20)", sel)
        out.append(("bottom " + name, await pg.evaluate(TAP, sel)))
        await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
    out.append(("open Search", await pg.evaluate(TAP, "#srchBtn")))
    out.append(("type in Search", await pg.evaluate(SEARCH)))
    await pg.wait_for_timeout(3000)   # the player reads the quick results, then asks the library (first library search of the page)
    out.append(("first library search, after 3 s", await pg.evaluate(LIB)))
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
    await pg.evaluate(TAP, "#srchBtn"); await pg.evaluate(SEARCH)
    out.append(("next library search, at once", await pg.evaluate(LIB)))
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(400)
    out.append(("open Build", await pg.evaluate(TAP, "#bldBtn")))
    steps = await pg.evaluate("()=>Array.from(document.querySelectorAll('#bld [data-step]')).map(b=>b.getAttribute('data-step'))")
    for st in steps:
        out.append(("builder step " + st, await pg.evaluate(TAP, '#bld [data-step="%s"]' % st)))
    out.append(("close Build", await pg.evaluate(TAP, "#b-close")))
    await ctx.close()
    return out

async def main():
    if not os.path.isfile(os.path.join(ROOT, "index.html")):
        print("no %s/index.html: run sh tools/pages_dist.sh first" % ROOT); return 2
    srv, base = serve(); over = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for moment in ("early", "loaded"):
            for name, ms in await run(b, base, moment):
                flag = "" if ms is None else (" OVER" if ms > LIMIT else "")
                if flag: over.append((moment, name, ms))
                print("%-7s %-28s %s%s" % (moment, name, "not shown" if ms is None else "%d ms" % ms, flag))
        await b.close()
    srv.shutdown()
    print("CPU %dx, limit %d ms: %d over" % (CPU, LIMIT, len(over)))
    return 1 if over else 0

sys.exit(asyncio.run(main()))
