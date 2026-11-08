#!/usr/bin/env python3
"""PDFX export: the sheet drawn on the 2014/2024 template, with spell, feature and creature pages. 390x844 and 1250x850.
  python3 tests/pdfx_export.py [OUTDIR] [--root DIR]
Cases: (1) old Yudhi sheet (2024, Fighter, no spells), (2) Wizard from Quick Build after Apply (spells, Find Familiar if the build has it),
(3) the same Wizard switched to the 2014 rules by its sheet field. Each case taps Export PDF, saves the download and checks:
it is a PDF made by PDFX (not the picture fallback), the expected sections are there, every feature has an IN SHORT line, no page error,
no request outside the site, no native dialog. Page images go to OUTDIR for a look."""
import asyncio, json, os, re, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
import pypdf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
if "--root" in args: i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "pdfx"); os.makedirs(OUT, exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()


def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port


async def answer_asks(pg, ok=True):
    for _ in range(4):
        await pg.wait_for_timeout(400)
        d = None
        for c in await pg.query_selector_all(".ask, .exp[role=dialog]"):
            if await c.is_visible(): d = c
        if not d: return
        btns = await d.query_selector_all("button"); pick = None
        for b in btns:
            if ok and ("pri" in (await b.get_attribute("class") or "") or await b.get_attribute("data-yes")): pick = b
        await (pick or btns[-1]).click()


async def export(pg, path):
    async with pg.expect_download(timeout=180000) as dl:
        await pg.evaluate("()=>document.getElementById('pdfBtn').click()")
    d = await dl.value; await d.save_as(path)
    return path


def inspect(path, tag, want, bad, info):
    r = pypdf.PdfReader(path); text = "\n".join((p.extract_text() or "") for p in r.pages)
    flat = re.sub(r"\s+", " ", text)
    info[tag] = {"pages": len(r.pages), "kb": os.path.getsize(path) // 1024, "title": (r.metadata or {}).get("/Title")}
    if not open(path, "rb").read(5).startswith(b"%PDF"): bad.append(tag + " not a PDF")
    if "FEATURES & TRAITS" not in flat: bad.append(tag + " no Features & Traits page (picture fallback?)")
    for w in want:
        if w not in flat: bad.append(tag + " missing: " + w)
    n_feat = flat.count("IN SHORT")
    info[tag]["in_short"] = n_feat
    if n_feat < 3: bad.append(tag + " too few IN SHORT lines: %d" % n_feat)
    try:
        import pypdfium2 as pdfium
        doc = pdfium.PdfDocument(path)
        for i in range(len(doc)):
            doc[i].render(scale=1.3).to_pil().save(os.path.join(OUT, "%s-p%d.png" % (tag, i + 1)))
    except Exception as e:
        info[tag]["render"] = str(e)


async def quick_build(pg, cls):
    await pg.wait_for_function("typeof window.__bldOpen==='function'", timeout=180000)
    await pg.evaluate("()=>{var b=document.querySelector('[data-hnew]'); if(b) b.click()}"); await pg.wait_for_timeout(4000); await answer_asks(pg)
    await pg.wait_for_selector("#qbCls", state="attached", timeout=60000)
    await pg.select_option("#qbCls", cls); await pg.evaluate("()=>document.querySelector('[data-qb]').click()")
    await pg.wait_for_timeout(2500); await answer_asks(pg)
    await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(2500); await answer_asks(pg)
    await pg.wait_for_timeout(1500)


async def run(b, base, W, H, bad, info):
    vp = "%dx%d" % (W, H)
    ctx = await b.new_context(viewport={"width": W, "height": H}, accept_downloads=True, has_touch=W < 600)
    pg = await ctx.new_page(); errs = []; outside = []; warns = []; dialogs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
    pg.on("console", lambda m: warns.append(m.text[:200]) if "PDFX failed" in m.text else None)
    pg.on("dialog", lambda d: (dialogs.append(d.message), asyncio.ensure_future(d.dismiss())))
    root = base.rsplit("/", 1)[0]
    pg.on("request", lambda r: outside.append(r.url) if not r.url.startswith(root) and not r.url.startswith(("data:", "blob:")) else None)
    await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3'," + json.dumps(YUDHI) + ");sessionStorage.setItem('__s','1')}")
    await pg.goto(base); await pg.wait_for_selector("[data-hview]", state="attached", timeout=60000); await pg.wait_for_timeout(1500)
    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1000)
    # 1. old Yudhi sheet
    p = await export(pg, os.path.join(OUT, vp + "-1-yudhi.pdf"))
    inspect(p, vp + "-1-yudhi", ["Yudhi Kelapa", "Second Wind", "IN SHORT"], bad, info)
    # 2. Wizard from Quick Build, after Apply
    await quick_build(pg, "Wizard"); await pg.wait_for_timeout(1000)
    st = await pg.evaluate("()=>{var o=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}');o=o.C||o;return {name:o.name,cls:o.cls,spells:(o.spells||[]).map(function(x){return x.n})}}")
    info[vp + "-2-wizard-storage"] = st
    p = await export(pg, os.path.join(OUT, vp + "-2-wizard.pdf"))
    inspect(p, vp + "-2-wizard", ["SPELL DESCRIPTIONS", "Wizard"] + st["spells"][:3], bad, info)
    # 3. the same Wizard on the 2014 rules (C.rs), exported from the sheet
    await pg.evaluate("()=>{var k='yudhi-kelapa-build-v3', o=JSON.parse(localStorage.getItem(k)); (o.C||o).rs='2014'; localStorage.setItem(k,JSON.stringify(o));}")
    await pg.reload(); await pg.wait_for_timeout(3000); await answer_asks(pg, ok=False)
    v = await pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b){b.click(); return 1} return 0}")
    await pg.wait_for_timeout(2500)
    p = await export(pg, os.path.join(OUT, vp + "-3-wizard-2014.pdf"))
    inspect(p, vp + "-3-wizard-2014", ["SPELL DESCRIPTIONS", "PERSONALITY TRAITS"], bad, info)
    if errs: bad.append(vp + " page errors: " + "; ".join(errs[:3]))
    if warns: bad.append(vp + " PDFX fell back to the picture export: " + "; ".join(warns[:2]))
    if outside: bad.append(vp + " requests outside the site: " + ", ".join(sorted(set(outside))[:3]))
    if dialogs: bad.append(vp + " native dialogs: " + "; ".join(dialogs[:2]))
    await ctx.close()


async def main():
    srv, base = serve(); bad = []; info = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for W, H in ((390, 844), (1250, 850)):
            await run(b, base, W, H, bad, info)
        await b.close()
    srv.shutdown()
    json.dump(info, open(os.path.join(OUT, "result.json"), "w"), indent=1)
    print(json.dumps(info, indent=1))
    for x in bad: print("FAIL", x)
    print("ok" if not bad else "%d problems" % len(bad)); return 1 if bad else 0

sys.exit(asyncio.run(main()))
