#!/usr/bin/env python3
"""Load and builder timings. python3 tests/measure.py [OUT.json] [--root DIR] [--runs N]
Per viewport (390x844, 1250x850) and CPU (1x, 4x through CDP throttling): DOMContentLoaded, first contentful paint,
'ready' (first frame after the app has drawn Home or the sheet and the main thread is free), when the builder code
finished loading (__deferDone), first Build tap until the builder shows its form, the same tap again once everything is loaded (build_warm), first Search typing until results show (includes the 120 ms typing pause of the app).
--only "1250x850 cpu4x" runs one case. Starts from the Yudhi fixture after one View, so Home and the sheet have a character."""
import asyncio, json, os, sys, statistics, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
RUNS = 3
ONLY = None
if "--only" in a: i = a.index("--only"); ONLY = a[i+1]; del a[i:i+2]
if "--runs" in a: i = a.index("--runs"); RUNS = int(a[i+1]); del a[i:i+2]
OUT = a[0] if a else os.path.join(HERE, "out", "measure.json")
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

READY = """()=>new Promise(r=>{var t0=performance.now();function vis(){var h=document.getElementById('homeV');
  var s=document.querySelector('.id-name,h1');return (h&&h.offsetParent&&h.querySelector('[data-hview],.hcard'))||(s&&s.offsetParent)}
  (function w(){ if(vis()){ requestAnimationFrame(()=>setTimeout(()=>r(performance.now()),0)); } else setTimeout(w,16); })();})"""

async def one(b, base, W, H, cpu, setup_state):
    ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block")
    pg = await ctx.new_page(); pg.set_default_timeout(60000)
    errs = []; pg.on("pageerror", lambda e: errs.append(str(e)))
    await pg.goto(base); await pg.wait_for_timeout(800)
    await pg.evaluate("s=>{localStorage.clear();sessionStorage.clear();for(var k in s) localStorage.setItem(k,s[k]);}", setup_state)
    cdp = await ctx.new_cdp_session(pg)
    await cdp.send("Emulation.setCPUThrottlingRate", {"rate": cpu})
    await pg.reload(wait_until="commit")
    ready = await pg.evaluate(READY)
    r = {"ready": ready}
    # first Build tap right after ready
    t = await pg.evaluate("""()=>new Promise(res=>{var t0=performance.now(); var b=document.getElementById('bldBtn');
       if(!b){res(null);return} b.click();
       (function w(){var d=document.getElementById('bld'), body=document.getElementById('body');
         if(d&&!d.hidden&&body&&body.children.length){requestAnimationFrame(()=>res(performance.now()-t0))} else setTimeout(w,5)})();
       setTimeout(()=>res({timeout:1,bld:!document.getElementById('bld').hidden,body:(document.getElementById('body')||{children:[]}).children.length,dd:window.__deferDone||0,ask:!!document.querySelector('.ask,.exp[role=dialog]'),home:!!(document.getElementById('homeV')||{}).offsetParent}),30000)})""")
    r["build_first"] = t
    r["defer_done"] = await pg.evaluate("window.__deferDone||null")
    # builder opened again once everything is loaded: close it, wait, open (the cost of opening alone)
    await pg.wait_for_function("window.__deferDone", timeout=60000)
    await pg.evaluate("()=>{var c=document.getElementById('b-close'); if(c) c.click()}"); await pg.wait_for_timeout(1500)
    r["build_warm"] = await pg.evaluate("""()=>new Promise(res=>{if(!document.getElementById('bld').hidden){res(null);return} var t0=performance.now(); document.getElementById('bldBtn').click();
       (function w(){var d=document.getElementById('bld'), body=document.getElementById('body');
         if(d&&!d.hidden&&body&&body.children.length){requestAnimationFrame(()=>setTimeout(()=>res(performance.now()-t0),0))} else setTimeout(w,5)})();
       setTimeout(()=>res(-1),20000)})""")
    nav = await pg.evaluate("""()=>{var n=performance.getEntriesByType('navigation')[0];var f=performance.getEntriesByName('first-contentful-paint')[0];
       return {dcl:n.domContentLoadedEventEnd, fcp:f?f.startTime:null}}""")
    r["dcl"] = nav["dcl"]; r["fcp"] = nav["fcp"]
    await ctx.close()
    r["errors"] = errs
    return r

async def search_first(b, base, W, H, cpu, setup_state):
    ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block")
    pg = await ctx.new_page(); pg.set_default_timeout(60000)
    await pg.goto(base); await pg.wait_for_timeout(800)
    await pg.evaluate("s=>{localStorage.clear();sessionStorage.clear();for(var k in s) localStorage.setItem(k,s[k]);}", setup_state)
    cdp = await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate", {"rate": cpu})
    await pg.reload(wait_until="commit"); await pg.evaluate(READY)
    t = await pg.evaluate("""()=>new Promise(res=>{var b=document.getElementById('srchBtn'); if(!b){res(null);return}
       b.click();
       (function w(){var i=document.getElementById('gsQ');
         if(i&&i.offsetParent){ var body=document.getElementById('sheetBody'), t0=performance.now(), mo=new MutationObserver(function(){ mo.disconnect();
             requestAnimationFrame(()=>setTimeout(()=>res(performance.now()-t0),0)); });
           mo.observe(body,{childList:true,subtree:true,characterData:true});
           i.focus(); i.value='fire'; i.dispatchEvent(new Event('input',{bubbles:true})); } else setTimeout(w,5)})();
       setTimeout(()=>res(-1),30000)})""")
    await ctx.close(); return t

async def main():
    srv, base = serve()
    out = {"root": ROOT, "runs": RUNS, "results": {}}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # state: Yudhi seen once (roster made), the sheet is the start screen
        ctx = await b.new_context(viewport={"width": 1250, "height": 850}, service_workers="block"); pg = await ctx.new_page()
        await pg.goto(base); await pg.wait_for_timeout(1000)
        await pg.evaluate("v=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
        await pg.reload(); await pg.wait_for_timeout(3000)
        await pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); await pg.wait_for_timeout(2500)
        state = await pg.evaluate("()=>{var o={};for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);o[k]=localStorage.getItem(k)}return o}")
        await ctx.close()
        for vp, W, H in [("390x844", 390, 844), ("1250x850", 1250, 850)]:
            for cpu in (1, 4):
                if ONLY and ONLY != "%s cpu%dx" % (vp, cpu): continue
                rs = [await one(b, base, W, H, cpu, state) for _ in range(RUNS)]
                ss = [await search_first(b, base, W, H, cpu, state) for _ in range(RUNS)]
                key = "%s cpu%dx" % (vp, cpu)
                med = {k: round(statistics.median([x[k] for x in rs if x[k] is not None]), 0) if any(x[k] is not None for x in rs) else None
                       for k in ("dcl", "fcp", "ready", "build_first", "build_warm", "defer_done")}
                med["search_first"] = round(statistics.median([x for x in ss if x is not None]), 0) if any(x is not None for x in ss) else None
                med["errors"] = sum(len(x["errors"]) for x in rs)
                out["results"][key] = {"median": med, "raw": rs, "search_raw": ss}
                print(key, json.dumps(med))
        await b.close()
    srv.shutdown()
    os.makedirs(os.path.dirname(os.path.abspath(OUT)), exist_ok=True)
    json.dump(out, open(OUT, "w"), indent=1)

asyncio.run(main())
