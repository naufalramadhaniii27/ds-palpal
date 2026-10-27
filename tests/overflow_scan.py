#!/usr/bin/env python3
"""Sideways overflow scan. python3 tests/overflow_scan.py [OUT.json] [--root DIR]
Widths 320, 360, 390, 430, 768, 1250. Screens: Home and the nine sheet pages (phone), Home and every sheet tab (wide).
Reports per width: page scrollWidth beyond the window, and visible elements whose right edge is more than 1 px outside the window
(elements inside a horizontal scroller are skipped). Use it before and after a CSS change and compare the counts.
Exit code 0 when the page itself never scrolls sideways."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
OUT = a[0] if a else os.path.join(HERE, "out", "overflow.json"); os.makedirs(os.path.dirname(OUT), exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
WIDTHS = [(320, 640), (360, 740), (390, 844), (430, 900), (768, 1024), (1250, 850)]
TABS = ["p-actions", "p-spells", "p-inv", "p-feat", "p-desc", "p-notes", "p-ext"]

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

MEASURE = """()=>{const W=innerWidth,out=[];const page=document.documentElement.scrollWidth-W;
 const inScroller=e=>{for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const c=getComputedStyle(p);if((c.overflowX==='auto'||c.overflowX==='scroll'||c.overflowX==='hidden')&&p.scrollWidth>p.clientWidth+1)return true;if(p.id==='pager')return true}return false};
 document.querySelectorAll('body *').forEach(e=>{if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;const r=e.getBoundingClientRect();if(r.width<2||r.height<2)return;
  if(r.right>W+1&&!inScroller(e)){out.push((e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:e.tagName.toLowerCase())+' +'+Math.round(r.right-W))}});
 return {page:page,els:out.slice(0,6),n:out.length}}"""

async def main():
    srv, base = serve(); res = {}; bad = 0
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in WIDTHS:
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = await ctx.new_page(); pg.set_default_timeout(12000)
            await pg.goto(base); await pg.wait_for_timeout(2200)
            shots = []
            async def one(name):
                await pg.wait_for_timeout(450); m = await pg.evaluate(MEASURE); shots.append((name, m))
            await one("home")
            try: await pg.wait_for_selector("[data-hview]", state="attached", timeout=12000)
            except Exception:
                await pg.reload(); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000)
            await pg.click("[data-hview]", timeout=30000); await pg.wait_for_selector("#dmgBtn", state="attached", timeout=30000); await pg.wait_for_timeout(1200)
            if W < 700:
                for i, nm in enumerate(["main", "skills", "actions", "spells", "inventory", "features", "description", "notes", "extras"]):
                    try: await pg.click("[data-go='%d']" % i); await one("sheet " + nm)
                    except Exception: shots.append(("sheet " + nm, {"page": -1, "els": ["skip"], "n": 0}))
            else:
                for t in TABS:
                    try: await pg.click("[data-tab='%s']" % t); await one("tab " + t)
                    except Exception: shots.append(("tab " + t, {"page": -1, "els": ["skip"], "n": 0}))
            pageover = [(n, m["page"]) for n, m in shots if m["page"] > 0]
            tot = sum(m["n"] for _, m in shots)
            res[str(W)] = {"page_overflow": pageover, "element_overflow": tot, "detail": {n: m["els"] for n, m in shots if m["n"]}}
            bad += 1 if pageover else 0
            print("%4d  page scrolls sideways on %d screens %s  | elements past the edge: %d" % (W, len(pageover), pageover[:3], tot), flush=True)
            await ctx.close()
        await b.close()
    json.dump(res, open(OUT, "w"), indent=1); sys.exit(1 if bad else 0)

asyncio.run(main())
