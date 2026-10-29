#!/usr/bin/env python3
"""N18: play back a problem report step by step.

  python3 tests/replay_report.py REPORT.json [OUTDIR] [--root DIR] [--vp 390x844]
  python3 tests/replay_report.py --self [OUTDIR]     (makes a report in the app, plays it back, checks it, at 390x844 and 1250x850)

The report (Report a Problem, Copy Report) carries "trail": the play state, sheet and build before the first of the last 10 actions,
and the state after each action. Playback writes those into localStorage (sheet state, sheet, builder keys), reloads, takes a screenshot
per step and lists page errors. With --self the final played-back state must equal the state the app had when the report was made."""
import asyncio, json, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
args = sys.argv[1:]
def opt(name, default):
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
ROOT = os.path.abspath(opt("--root", ROOT)); VP = opt("--vp", "390x844")
SELF = "--self" in args
if SELF: args.remove("--self")
REPORT = None if SELF else args.pop(0)
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "replay"); os.makedirs(OUT, exist_ok=True)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
KEY, CKEY, BKEY = "yudhi-kelapa-sheet-v1", "yudhi-kelapa-build-v3", "phb24-builder-v1"

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

async def open_sheet(pg):
    await pg.wait_for_timeout(900)
    await pg.evaluate("()=>{var h=document.getElementById('homeV'); if(h&&!h.hidden){ var v=h.querySelector('[data-hview]'); if(v) v.click(); }}")
    await pg.wait_for_timeout(700)

async def play(b, url, rep, vp, tag):
    w, h = map(int, vp.split("x")); errs = []
    ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await ctx.new_page()
    pg.on("pageerror", lambda e: errs.append(str(e)))
    tr = rep.get("trail") or {}
    if not tr.get("steps"): raise SystemExit("report has no trail")
    await pg.goto(url); cur = {KEY: tr["start"].get("state"), CKEY: tr["start"].get("sheet"), BKEY: tr["start"].get("build")}
    async def put():
        await pg.evaluate("o=>{localStorage.clear(); Object.keys(o).forEach(function(k){ if(o[k]!=null) localStorage.setItem(k, JSON.stringify(o[k])); });}", cur)
        await pg.reload(); await open_sheet(pg)
    await put(); await pg.screenshot(path=os.path.join(OUT, "%s-%s-00-start.png" % (tag, vp)))
    for i, st in enumerate(tr["steps"], 1):
        if st.get("state") is not None: cur[KEY] = st["state"]
        if st.get("sheet") is not None: cur[CKEY] = st["sheet"]
        if st.get("build") is not None: cur[BKEY] = st["build"]
        await put(); await pg.screenshot(path=os.path.join(OUT, "%s-%s-%02d.png" % (tag, vp, i)))
        print("step %d  %s  %s" % (i, st.get("t", ""), st.get("l", "")))
    final = await pg.evaluate("k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}", KEY)
    await ctx.close(); return final, errs

async def make_report(b, url, vp):
    w, h = map(int, vp.split("x")); ctx = await b.new_context(viewport={"width": w, "height": h}); pg = await ctx.new_page()
    await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v);}", FIX)
    await pg.reload(); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(1500)
    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1200)
    # three actions through the app's own controls: damage, healing, Heroic Inspiration
    done = []
    await pg.fill("#hpAmt", "5"); await pg.click("#dmgBtn"); done.append("damage 5"); await pg.wait_for_timeout(500)
    await pg.fill("#hpAmt", "2"); await pg.click("#healBtn"); done.append("heal 2"); await pg.wait_for_timeout(500)
    if await pg.query_selector("#insp"):
        await pg.click("#insp"); done.append("Heroic Inspiration"); await pg.wait_for_timeout(500)
    await pg.wait_for_timeout(600)
    rep = json.loads(await pg.evaluate("()=>window.__reportText()"))
    want = await pg.evaluate("k=>JSON.parse(localStorage.getItem(k))", KEY)
    await ctx.close(); return rep, want, done

async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        if SELF:
            for vp in ("390x844", "1250x850"):
                rep, want, done = await make_report(b, url, vp)
                json.dump(rep, open(os.path.join(OUT, "report-%s.json" % vp), "w"), indent=1)
                steps = len((rep.get("trail") or {}).get("steps") or [])
                print(vp, "actions done:", done, "steps in report:", steps)
                if steps < 1: bad.append(vp + " report has no steps"); continue
                final, errs = await play(b, url, rep, vp, "self")
                strip = lambda o: {k: v for k, v in (o or {}).items() if k not in ("portrait", "notes", "journal", "_t", "t", "saved")}
                if strip(final) != strip(want):
                    diff = [k for k in set(strip(final)) | set(strip(want)) if strip(final).get(k) != strip(want).get(k)]
                    bad.append(vp + " final state differs: " + ",".join(sorted(diff))[:200])
                if errs: bad.append(vp + " page errors: " + "; ".join(errs[:3]))
        else:
            rep = json.load(open(REPORT, encoding="utf-8")); final, errs = await play(b, url, rep, VP, "replay")
            if errs: bad.append("page errors: " + "; ".join(errs[:3]))
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("ok" if not bad else "%d problems" % len(bad)); return 1 if bad else 0
sys.exit(asyncio.run(main()))
