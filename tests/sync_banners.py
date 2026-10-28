#!/usr/bin/env python3
"""Risk banners of cloud backup: changes not backed up for more than 3 days, cloud space 90 percent full. Each once a day, closable.
  BASE=http://localhost:8788 python3 tests/sync_banners.py   (local Pages server as in cloud_sync.py)"""
import asyncio, os, sys
from playwright.async_api import async_playwright
BASE = os.environ.get("BASE", "http://localhost:8788").rstrip("/")
HERE = os.path.dirname(os.path.abspath(__file__))
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
RES = []; ERRS = []
def check(n, ok, info=""): RES.append((n, bool(ok))); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:200] if not ok else ""))
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            ctx = await b.new_context(viewport={"width": w, "height": h}, extra_http_headers={"x-dev-user": "ban%s@test.dev" % w})
            pg = await ctx.new_page(); pg.on("pageerror", lambda e: ERRS.append(str(e)))
            await pg.goto(BASE + "/index.html"); await pg.wait_for_timeout(1000)
            await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", YUDHI)
            await pg.reload(); await pg.wait_for_function("()=>window.__sync&&__sync.on&&!__sync.busy", timeout=30000)
            check(vp + " no banner normally", not await pg.query_selector("#syBan"))
            await pg.evaluate("()=>{var q=JSON.parse(__store.getItem('cs-sync-v1'));q.ok=Date.now()-4*864e5;__store.setItem('cs-sync-v1',JSON.stringify(q));var o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1'));o.notes={x:1};__store.setItem('yudhi-kelapa-sheet-v1',JSON.stringify(o));__syncBanners()}")
            txt = await pg.evaluate("()=>{var b=document.getElementById('syBan');return b?b.innerText:''}")
            check(vp + " banner after 3 days without backup", "more than 3 days" in txt, txt)
            await pg.screenshot(path=os.path.join(HERE, "out", "sync_banner_%s.png" % vp))
            await pg.click("#syBan button"); await pg.evaluate("()=>__syncBanners()")
            check(vp + " closed banner stays away today", not await pg.query_selector("#syBan"))
            await pg.evaluate("()=>{__sync.me.bytes=__sync.me.limits.bytes*0.95;__syncBanners()}")
            txt = await pg.evaluate("()=>{var b=document.getElementById('syBan');return b?b.innerText:''}")
            check(vp + " banner at 90 percent of cloud space", "95% full" in txt, txt)
            await ctx.close()
        await b.close()
    check("no page errors", not ERRS, ERRS[:3])
    bad = [r for r in RES if not r[1]]; print("%d checks, %d failed" % (len(RES), len(bad))); return 1 if bad else 0
sys.exit(asyncio.run(main()))
