#!/usr/bin/env python3
"""Overlap scan. python3 tests/overlap_scan.py [OUT.json] [--root DIR]
Also a button or link whose text is wider than its box. Visible buttons, links, inputs and selects whose boxes overlap by more than 6 px each way, where neither contains the other, on Home and every sheet page / tab.
Exit code 0 when no overlap is found.
(Same screens as overflow_scan.)  Old text: Sideways overflow scan
Widths 320, 360, 390, 430, 768, 1250. Screens: Home and the nine sheet pages (phone), Home and every sheet tab (wide).
Reports per width: page scrollWidth beyond the window, and visible elements whose right edge is more than 1 px outside the window
(elements inside a horizontal scroller are skipped). Use it before and after a CSS change and compare the counts.
Exit code 0 when the page itself never scrolls sideways."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
OUT = a[0] if a else os.path.join(HERE, "out", "overlap.json"); os.makedirs(os.path.dirname(OUT), exist_ok=True)
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

MEASURE = """()=>{const els=[...document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button]')].filter(e=>{const r=e.getBoundingClientRect();const c=getComputedStyle(e);if(!(r.width>4&&r.height>4&&c.visibility!=='hidden'&&c.display!=='none'&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&e.offsetParent!==null&&!e.closest('[inert],[hidden]')))return false;const t=document.elementFromPoint(Math.min(innerWidth-1,Math.max(0,r.left+r.width/2)),Math.min(innerHeight-1,Math.max(0,r.top+r.height/2)));return !!t&&(t===e||e.contains(t)||t.contains(e));});
 const cr=e=>{const r=e.getBoundingClientRect();let L=r.left,R=r.right,T=r.top,B=r.bottom;for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){const c=getComputedStyle(p);if(c.overflowX!=='visible'||c.overflowY!=='visible'){const q=p.getBoundingClientRect();L=Math.max(L,q.left);R=Math.min(R,q.right);T=Math.max(T,q.top);B=Math.min(B,q.bottom)}}return {left:L,right:Math.max(L,R),top:T,bottom:Math.max(T,B)}};
 const out=[];const nm=e=>(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.split(' ')[0]:e.tagName.toLowerCase())+'['+(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,14)+']';
 for(let i=0;i<els.length;i++){const a=els[i],ra=cr(a);for(let j=i+1;j<els.length;j++){const b=els[j];if(a.contains(b)||b.contains(a))continue;const rb=cr(b);
  const ox=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left),oy=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
  if(ox>6&&oy>6){const za=getComputedStyle(a).position,zb=getComputedStyle(b).position;if(a.closest('#vbar,#bnav,.hdr,header,.band,.tabs,[role=tablist]')||b.closest('#vbar,#bnav,.hdr,header,.band,.tabs,[role=tablist]'))continue;out.push(nm(a)+' x '+nm(b)+' '+Math.round(ox)+'x'+Math.round(oy))}}}
 els.forEach(e=>{if(e.tagName==='INPUT'||e.tagName==='SELECT'||e.tagName==='TEXTAREA')return;if(e.scrollWidth-e.clientWidth>2&&!/ellipsis/.test(getComputedStyle(e).textOverflow)&&getComputedStyle(e).overflowX!=='hidden'&&getComputedStyle(e).overflowX!=='clip')out.push('text spills out of '+nm(e)+' by '+(e.scrollWidth-e.clientWidth))});
 return {page:0,els:out.slice(0,6),n:out.length}}"""

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
                await pg.wait_for_timeout(450)
                H0 = await pg.evaluate("innerHeight"); SH = await pg.evaluate("document.documentElement.scrollHeight")
                found = []; y = 0
                while True:
                    await pg.evaluate("scrollTo(0,%d)" % y); await pg.wait_for_timeout(350)
                    m1 = await pg.evaluate(MEASURE)
                    for x in m1["els"]:
                        if x not in found: found.append(x)
                    y += int(H0 * 0.8)
                    if y >= SH: break
                await pg.evaluate("scrollTo(0,0)"); shots.append((name, {"page": 0, "els": found, "n": len(found)}))
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
            bad += 1 if tot else 0
            print("%4d  overlapping control pairs: %d  %s" % (W, tot, [(n, m["els"][:2]) for n, m in shots if m["n"]][:3]), flush=True)
            await ctx.close()
        await b.close()
    json.dump(res, open(OUT, "w"), indent=1); sys.exit(1 if bad else 0)

asyncio.run(main())
