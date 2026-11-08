#!/usr/bin/env python3
"""2014 Ranger's Companion picker. python3 tests/companion_2014.py [OUTDIR] [--root DIR]
A Beast Master (2014) at level 7 built by the real builder and applied to the sheet. Extras lists every eligible beast with a note;
the Wolf card has "Make this my companion"; after the tap only the Wolf is listed, the pick is in localStorage (S.comp14), it stays after
Apply again, the PDF lists only the Wolf with the companion numbers (AC 15, HP 28). "Change" lists them all again. 390x844 and 1250x850."""
import asyncio, os, re, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
import pypdf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
if "--root" in args: i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "companion14"); os.makedirs(OUT, exist_ok=True)

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

BUILD = """()=>{ const L=window.__bldLists('2014'), sub=L.subs.Ranger.filter(s=>/Beast Master/.test(s))[0];
  const r=window.__bldFuzz({cls:'Ranger',sub:sub,lv:7,sp:L.sp[0],bg:L.bg[0],arr:L.arr,b2:0,b1:0,rs:'2014',src:L.src});
  window.__c14=r.c; window.__b14=r.b; return sub; }"""
STORE = "()=>{ for(let i=0;i<localStorage.length;i++){ const v=localStorage.getItem(localStorage.key(i))||''; const m=/\"comp14\":\"([^\"]*)\"/.exec(v); if(m) return m[1]; } return null; }"
ROWS = "()=>[...document.querySelectorAll('#extBody .crr')].map(b=>(b.getAttribute('data-info')||'')).filter(x=>/\\|bm14$/.test(x)).map(x=>x.slice(3).split('|')[0])"

async def run(b, url, W, H, bad):
    vp = "%dx%d" % (W, H)
    ctx = await b.new_context(viewport={"width": W, "height": H}, accept_downloads=True, has_touch=W < 600)
    pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
    await pg.goto(url); await pg.evaluate("()=>localStorage.clear()"); await pg.reload()
    await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__sheetApply", timeout=120000)
    await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
    await pg.evaluate("()=>document.querySelector('[data-hnew]').click()"); await pg.wait_for_selector("#qbCls", state="attached", timeout=60000); await pg.wait_for_timeout(800)
    await pg.select_option("#qbCls", "Ranger"); await pg.evaluate("()=>document.querySelector('[data-qb]').click()"); await pg.wait_for_timeout(1800)
    await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>document.getElementById('b-close').click()"); await pg.wait_for_selector("#dmgBtn", state="visible", timeout=60000)
    await pg.wait_for_function("()=>!!window.__bldFuzz", timeout=60000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)"); await pg.evaluate(BUILD)
    await pg.evaluate("()=>window.__sheetApply(window.__c14,'')"); await pg.wait_for_timeout(1500)  # the same call the Apply button makes
    await pg.evaluate("()=>document.querySelector(\"[data-tab='p-ext']\").click()"); await pg.wait_for_timeout(1000)
    rows = await pg.evaluate(ROWS); note = await pg.evaluate("()=>(document.querySelector('#extBody')||{}).innerText||''")
    if len(rows) < 20 or "Wolf" not in rows: bad.append(vp + " before the pick: %d beasts listed" % len(rows))
    if "choose one Beast" not in note: bad.append(vp + " no picker note")
    await (await pg.query_selector("#extBody")).screenshot(path=os.path.join(OUT, vp + "-1-list.png"))
    await pg.evaluate("()=>document.querySelector('#extBody .crr[data-info=\"cr:Wolf|bm14\"]').click()"); await pg.wait_for_timeout(900)
    await pg.screenshot(path=os.path.join(OUT, vp + "-2-card.png"))
    if not await pg.evaluate("()=>!!document.querySelector('[data-crc14=\"Wolf\"]')"): bad.append(vp + " no Make this my companion button on the Wolf card")
    await pg.evaluate("()=>document.querySelector('[data-crc14=\"Wolf\"]').click()"); await pg.wait_for_timeout(900)
    st = await pg.evaluate(STORE)
    if st != "Wolf": bad.append(vp + " pick not saved (comp14=%r)" % st)
    await pg.keyboard.press("Escape"); await pg.wait_for_timeout(500)
    rows = await pg.evaluate(ROWS)
    if rows != ["Wolf"]: bad.append(vp + " after the pick the list is %s" % rows[:5])
    await (await pg.query_selector("#extBody")).screenshot(path=os.path.join(OUT, vp + "-3-picked.png"))
    await pg.evaluate("()=>window.__sheetApply(window.__c14,'')"); await pg.wait_for_timeout(1200)
    if await pg.evaluate(STORE) != "Wolf": bad.append(vp + " pick lost after Apply")
    async with pg.expect_download(timeout=180000) as dl:
        await pg.evaluate("()=>document.getElementById('pdfBtn').click()")
    d = await dl.value; path = os.path.join(OUT, vp + ".pdf"); await d.save_as(path)
    t = re.sub(r"\s+", " ", " ".join((p.extract_text() or "") for p in pypdf.PdfReader(path).pages))
    part = t[t.find("COMPANIONS & SUMMONS"):] if "COMPANIONS & SUMMONS" in t else ""
    if "Wolf" not in part or "Giant Badger" in part: bad.append(vp + " PDF companion part is not just the Wolf")
    if "AC 15" not in part.replace("AC  ", "AC ") or "HP 28" not in part.replace("HP  ", "HP "): bad.append(vp + " PDF Wolf numbers: " + part[:160])
    await pg.evaluate("()=>document.querySelector(\"[data-tab='p-ext']\").click()"); await pg.wait_for_timeout(600)
    await pg.evaluate("()=>document.querySelector('#extBody [data-crc14=\"\"]').click()"); await pg.wait_for_timeout(800)
    if len(await pg.evaluate(ROWS)) < 20 or await pg.evaluate(STORE): bad.append(vp + " Change did not bring the full list back")
    if errs: bad.append(vp + " page errors: " + "; ".join(errs[:3]))
    await ctx.close()

async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for W, H in ((390, 844), (1250, 850)): await run(b, url, W, H, bad)
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("ok" if not bad else "%d problems" % len(bad)); return 1 if bad else 0

sys.exit(asyncio.run(main()))
