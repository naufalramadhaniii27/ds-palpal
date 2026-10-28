#!/usr/bin/env python3
"""T10 tidy checks. python3 tests/tidy.py
Home title is visible on one line, the empty portrait silhouette is light, Record skin Temporary HP has contrast 4.5 or more,
the inventory buttons in Record are light, the edge fade classes appear on the tab row (wide) and the bottom bar (phone),
the ability hover card does not glue the DIS flag to a skill name. Exit code 0 when every check passes."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
RES = []
def check(n, ok, info=""): RES.append(bool(ok)); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:200] if not ok else ""))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return "http://127.0.0.1:%d/index.html" % port
LUM = """c=>{const m=c.match(/[\\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])}"""
async def open_sheet(pg):
    await pg.goto(BASE); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(1500)
async def main():
    global BASE; BASE = serve()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in [(1250, 850), (390, 844)]:
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}" % json.dumps(YUDHI))
            pg = await ctx.new_page(); pg.set_default_timeout(15000); await open_sheet(pg); await pg.wait_for_timeout(2500)
            h = await pg.evaluate("()=>{const t=document.querySelector('#homeV .hhead h1'),c=getComputedStyle(t),r=t.getBoundingClientRect();return {col:c.color,clip:c.backgroundClip,h:r.height,fs:parseFloat(c.fontSize)}}")
            check("%d home title visible, one line" % W, h["col"] != "rgba(0, 0, 0, 0)" and h["h"] < h["fs"] * 1.8, h)
            sil = await pg.evaluate("()=>{const s=document.querySelector('#homeV .hhpor svg.hpor-sil');return s?getComputedStyle(s).fill:null}")
            check("%d hero silhouette is light" % W, sil and sil.startswith("rgba(255, 255, 255") , sil)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="attached"); await pg.wait_for_timeout(3500)
            edge = await pg.evaluate("()=>{const e=document.querySelector(%s);return e?[e.className,getComputedStyle(e).maskImage!=='none']:null}" % json.dumps("#tabs" if W > 700 else ".bnav"))
            check("%d scrolling row has the edge fade" % W, edge and edge[1], edge)
            if W > 700:
                await pg.evaluate("()=>{var s=document.querySelector('#saves [data-bd=\"ab-DEX\"],[data-bd=\"ab-DEX\"]');window.__t=s}")
                feeds = await pg.evaluate("()=>{var r=[...document.querySelectorAll('#skills .row')].filter(r=>r.querySelector('.flag'))[0];return r?r.querySelector('.nm').textContent.trim():null}")
                await pg.hover("[data-bd='ab-DEX']"); await pg.wait_for_timeout(900)
                txt = await pg.evaluate("()=>{var e=document.querySelector('.mi-hc,#miHover,.mi-hov');return e?e.textContent:document.body.innerText.slice(0,0)}")
                check("wide ability card shows and has no glued DIS", "feeds" in (txt or "") and "Stealth" in (txt or "") and "StealthDIS" not in txt, txt)
                await pg.evaluate("document.getElementById('themeBtn').click()"); await pg.wait_for_timeout(600)
                await pg.evaluate("()=>{var f=t=>[...document.querySelectorAll('button')].filter(x=>x.offsetParent&&x.textContent.trim().indexOf(t)===0)[0];f('Character Record').click();f('Light').click()}"); await pg.wait_for_timeout(400)
                await pg.evaluate("()=>{var x=document.querySelector('[aria-label=Close],.sx');x&&x.click()}"); await pg.wait_for_timeout(700)
                rows = await pg.evaluate("""()=>{const L=%s;const rat=(a,b)=>{a=L(a);b=L(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
                  const t=document.querySelector('.hp-tmpc .tmp-l'),bg=getComputedStyle(document.body).backgroundColor;
                  const panel=getComputedStyle(document.querySelector('.hp-tmpc')).backgroundColor;
                  return {tmp:t?rat(getComputedStyle(t).color,'rgb(248, 249, 244)'):0}}""" % LUM)
                check("record light: Temporary HP contrast >= 4.5", rows["tmp"] >= 4.5, rows)
                await pg.click("[data-tab='p-inv']"); await pg.wait_for_timeout(700)
                ib = await pg.evaluate("()=>{const e=document.querySelector('.ihero .ibtn');return e?getComputedStyle(e).backgroundColor:null}")
                check("record light: inventory button is light", ib and sum(map(float, __import__('re').findall(r'[\d.]+', ib)[:3])) > 600, ib)
            await ctx.close()
        await b.close()
    print("%d checks, %d failed" % (len(RES), RES.count(False))); sys.exit(1 if False in RES else 0)
asyncio.run(main())
