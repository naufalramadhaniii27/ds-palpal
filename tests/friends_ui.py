#!/usr/bin/env python3
"""Friends in the app, two people on a local Pages server with D1 (x-dev-user header, ACCESS_TEAM empty).

  wrangler pages dev --port 8788 --binding DEV_USER=a@test.dev --binding ACCESS_TEAM=
  BASE=http://localhost:8788 python3 tests/friends_ui.py [OUTDIR]

Flow at 390x844 and 1250x850: profile, share a character with all friends, find by friend code, follow and follow back, dot on Friends,
profile grid, view only (nothing saved), request a copy, approve, the copy arrives, block. Exit code 0 only when every check passes."""
import asyncio, json, os, sys, time
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__))
BASE = os.environ.get("BASE", "http://localhost:8788").rstrip("/")
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(HERE, "out", "friends_ui"); os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
RES = []; ERRS = []
def check(n, ok, info=""): RES.append((n, bool(ok))); print(("ok   " if ok else "FAIL ") + n + ("  " + str(info)[:300] if not ok else ""))

async def ready(pg):
    for i in range(6):
        try:
            await pg.wait_for_load_state("load")
            await pg.wait_for_function("()=>window.__sync&&__sync.on&&!__sync.busy&&!__sync.again", timeout=20000)
            await pg.wait_for_timeout(600); return
        except Exception as e:
            if i > 3: raise
            await pg.wait_for_timeout(500)

async def person(b, vp, w, h, email, sheet):
    ctx = await b.new_context(viewport={"width": w, "height": h}, extra_http_headers={"x-dev-user": email})
    pg = await ctx.new_page(); pg.on("pageerror", lambda e: ERRS.append(email + ": " + str(e)))
    pg.on("dialog", lambda d: (ERRS.append("native dialog " + d.message), asyncio.ensure_future(d.dismiss())))
    await pg.goto(BASE + "/index.html"); await pg.wait_for_timeout(1200)
    if sheet:
        await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", sheet)
        await pg.evaluate("()=>new Promise(r=>{var q=indexedDB.deleteDatabase('dnd-sheet');q.onsuccess=q.onerror=q.onblocked=()=>r()})")
        await pg.reload()
    await ready(pg)
    await pg.evaluate("()=>{var h=document.getElementById('homeV'); if(!h||h.hidden){ var b=document.querySelector('[data-hall],#rosterBtn'); if(b) b.click(); }}"); await pg.wait_for_timeout(800)
    return ctx, pg

async def tab(pg, t):
    await pg.click('.fr-dlg [data-frtab="%s"]' % t); await pg.wait_for_timeout(900)

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for vp, w, h in (("390x844", 390, 844), ("1250x850", 1250, 850)):
            tag = vp.split("x")[0] + str(int(time.time()) % 100000)
            A, pa = await person(b, vp, w, h, "ann%s@test.dev" % tag, YUDHI)
            B, pb = await person(b, vp, w, h, "ben%s@test.dev" % tag, None)
            check(vp + " Friends button on Home", await pa.evaluate("()=>!!document.querySelector('#homeV .fr-b')"))
            await pa.click("#homeV .fr-b"); await pa.wait_for_selector(".fr-dlg .fr-code")
            code = await pa.inner_text(".fr-dlg .fr-code")
            await pa.fill('.fr-dlg [name=name]', "Ann"); await pa.fill('.fr-dlg [name=username]', "ann" + tag); await pa.click('.fr-dlg [data-frform=me] button[type=submit]'); await pa.wait_for_timeout(1200)
            check(vp + " profile saved", "@ann" + tag in await pa.inner_text(".fr-dlg"))
            await pa.screenshot(path=os.path.join(OUT, vp + "-A-profile.png"))
            await tab(pa, "sharing"); await pa.click(".fr-dlg [data-frshare]"); await pa.wait_for_selector('.fr-dlg [name=vis][value=profile]')
            await pa.check('.fr-dlg [name=vis][value=profile]'); await pa.check('.fr-dlg [name=pin]')
            await pa.screenshot(path=os.path.join(OUT, vp + "-A-share.png"))
            await pa.click('.fr-dlg [data-frform=share] button[type=submit]'); await pa.wait_for_timeout(1000)
            check(vp + " character on profile", "All friends" in await pa.inner_text(".fr-dlg"))
            # B finds A by code and follows
            await pb.click("#homeV .fr-b"); await pb.wait_for_selector(".fr-dlg .fr-code"); await tab(pb, "friends")
            await pb.fill(".fr-dlg [name=q]", code); await pb.click(".fr-dlg [data-frform=find] button"); await pb.wait_for_selector(".fr-dlg [data-frfollow]")
            check(vp + " find by friend code shows Ann, no grid yet", "Ann" in await pb.inner_text(".fr-dlg") and not await pb.query_selector(".fr-dlg .fr-card"))
            await pb.click(".fr-dlg [data-frfollow]"); await pb.wait_for_timeout(1000)
            # A sees the dot after the app starts again, then follows back
            await pa.reload(); await ready(pa)
            await pa.evaluate("()=>{var h=document.getElementById('homeV'); if(!h||h.hidden){ var b=document.querySelector('[data-hall],#rosterBtn'); if(b) b.click(); }}"); await pa.wait_for_timeout(800)
            check(vp + " dot on Friends for a new follower", await pa.evaluate("()=>{var d=document.querySelector('#homeV .fr-b .fr-dot');return !!d&&!d.hidden}"))
            await pa.click("#homeV .fr-b"); await pa.wait_for_selector(".fr-dlg"); await tab(pa, "friends")
            await pa.click(".fr-dlg [data-frfollow]"); await pa.wait_for_timeout(1200)
            check(vp + " friends after follow back", "Friends (1)" in await pa.inner_text(".fr-dlg"))
            await pa.click(".fr-dlg [data-frx]")
            # B opens Ann's profile: grid, view only
            await tab(pb, "friends"); await pb.click(".fr-dlg [data-frprof]"); await pb.wait_for_selector(".fr-dlg .fr-card")
            await pb.screenshot(path=os.path.join(OUT, vp + "-B-profile.png"))
            before = await pb.evaluate("()=>[__store.getItem('yudhi-kelapa-build-v3'),__store.getItem('cs-roster-v1')]")
            await pb.click(".fr-dlg .fr-card"); await pb.wait_for_selector("#frBar")
            txt = await pb.evaluate("()=>document.body.innerText")
            check(vp + " view only shows the friend's character", "Yudhi Kelapa" in txt and "view only" in txt)
            await pb.wait_for_timeout(1500); await pb.screenshot(path=os.path.join(OUT, vp + "-B-view.png"))
            after = await pb.evaluate("()=>[__store.getItem('yudhi-kelapa-build-v3'),__store.getItem('cs-roster-v1')]")
            check(vp + " view only saves nothing", before == after)
            await pb.click("#frBar [data-frask]"); await pb.wait_for_selector(".fr-askd textarea")
            await pb.fill(".fr-askd textarea", "May I?"); await pb.click(".fr-askd [data-y]"); await pb.wait_for_timeout(1000)
            check(vp + " copy requested", await pb.evaluate("()=>document.querySelector('#frBar [data-frask]').disabled"))
            await pb.click("#frBar [data-frclose]"); await pb.wait_for_timeout(1500); await ready(pb)
            check(vp + " Close brings back own sheet", not await pb.evaluate("()=>!!document.getElementById('frBar')") and before[0] == await pb.evaluate("()=>__store.getItem('yudhi-kelapa-build-v3')"))
            # A approves
            await pa.click("#homeV .fr-b"); await pa.wait_for_selector(".fr-dlg"); await tab(pa, "requests")
            check(vp + " request with message", "May I?" in await pa.inner_text(".fr-dlg"))
            await pa.screenshot(path=os.path.join(OUT, vp + "-A-requests.png"))
            await pa.click(".fr-dlg [data-frok]"); await pa.wait_for_selector(".ask [data-yes]"); await pa.click(".ask [data-yes]"); await pa.wait_for_timeout(1200)
            # the copy arrives on B with the next sync
            await pb.evaluate("()=>__syncRun('show')"); await pb.wait_for_timeout(2500); await ready(pb)
            names = await pb.evaluate("()=>{try{var r=JSON.parse(__store.getItem('cs-roster-v1'));return Object.keys(r.chars).filter(k=>!r.chars[k].ph).map(k=>r.chars[k].name)}catch(e){return []}}")
            check(vp + " approved copy arrives on B", "Yudhi Kelapa" in names, names)
            # block
            await pb.evaluate("()=>{var h=document.getElementById('homeV'); if(!h||h.hidden){ var b=document.querySelector('[data-hall],#rosterBtn'); if(b) b.click(); }}"); await pb.wait_for_timeout(800)
            await pb.click("#homeV .fr-b"); await pb.wait_for_selector(".fr-dlg"); await tab(pb, "friends"); await pb.click(".fr-dlg [data-frprof]"); await pb.wait_for_selector(".fr-dlg [data-frblock]")
            await pb.click(".fr-dlg [data-frblock]"); await pb.click(".ask [data-yes]"); await pb.wait_for_timeout(1200)
            check(vp + " block removes the friend", "Friends (0)" in await pb.inner_text(".fr-dlg") and "Blocked" in await pb.inner_text(".fr-dlg"))
            check(vp + " no Admin tab for a normal person", not await pb.query_selector('.fr-dlg [data-frtab="admin"]'))
            await A.close(); await B.close()
        await b.close()
    check("no page errors", not ERRS, ERRS[:3])
    bad = [r for r in RES if not r[1]]; print("%d checks, %d failed" % (len(RES), len(bad))); return 1 if bad else 0
sys.exit(asyncio.run(main()))
