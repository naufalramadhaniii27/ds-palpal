#!/usr/bin/env python3
"""Fase 1.4 saved data from older versions opens in the current build.  python3 tests/migrate_all.py [--viewport WxH] [--only VER]
For each stored app version (APP_VER 102 to 113, one commit per number, listed in MIGRATE below), the page of that commit (index.html from git) opens Yudhi, takes 3 damage and is closed.
Everything it stored in localStorage is copied into a fresh browser, the current index.html opens it, and the numbers on the sheet and the roster are compared with the current build
that started from the same fixture and took the same damage. Pass: no recovery screen, no page error, same sheet text, same roster names.
Commits come from git history, so a shallow clone cannot run this (the script says so and exits 0 with a note)."""
import asyncio, json, os, subprocess, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); A = sys.argv[1:]; sys.argv = [sys.argv[0]]
ONLY = int(A[A.index("--only") + 1]) if "--only" in A else None; VP = A[A.index("--viewport") + 1] if "--viewport" in A else None
exec(open(os.path.join(HERE, "style_snapshot.py")).read().split("def diff(")[0])
def serve_dir(d):
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=d)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port


MIGRATE = {102: "05448188", 103: "23d923cd", 104: "e2e4da91", 105: "8060f744", 106: "af50dad4", 107: "c465d85b", 108: "1bf9a522", 109: "f29e758d", 110: "55b10ac5", 111: "6b67ed8b", 112: "1145c6e9", 113: "57d48d70"}
SEED = "if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3'," + json.dumps(FIX) + ");localStorage.setItem('mi-fx','off');sessionStorage.setItem('__s','1')}"
FP = """()=>{var t=(document.getElementById('app')||document.body).innerText.replace(/\\s+/g,' ');var r=null;try{r=Object.keys(JSON.parse(__store.getItem('cs-roster-v1')).chars).length}catch(e){}return {t:t.slice(0,4000),roster:r}}"""


def git_html(c, d):
    r = subprocess.run(["git", "show", "%s:index.html" % c], cwd=ROOT, capture_output=True)
    if r.returncode or len(r.stdout) < 1000: return False
    open(os.path.join(d, "index.html"), "wb").write(r.stdout); return True


async def play(b, url, w, h, seed_js, keys=None):
    ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)[:150]))
    await pg.add_init_script(seed_js); await pg.goto(url); await pg.wait_for_selector("[data-hview]", state="attached", timeout=40000); await pg.wait_for_timeout(1500)
    return ctx, pg, errs


async def main():
    if subprocess.run(["git", "rev-parse", "--is-shallow-repository"], cwd=ROOT, capture_output=True, text=True).stdout.strip() == "true":
        print("migrate_all: shallow clone, history not available, skipped"); return
    bad = []; vps = [(390, 844), (1250, 850)]
    if VP: vps = [tuple(int(x) for x in VP.split("x"))]
    srv, cur = serve()
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in vps:
            vp = "%dx%d" % (w, h)
            # baseline: the current build, same fixture, same damage
            ctx, pg, e0 = await play(b, cur, w, h, SEED); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.fill("#hpAmt", "3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(1200)
            base = await pg.evaluate(FP); await ctx.close()
            if os.environ.get("MIG_SHOW"): print(vp, "baseline", base["roster"], base["t"][:200])
            for ver, c in MIGRATE.items():
                if ONLY and ver != ONLY: continue
                d = tempfile.mkdtemp(prefix="mig%d-" % ver)
                if not git_html(c, d): bad.append("%s APP_VER %d: no index.html at %s" % (vp, ver, c)); continue
                s2, old = serve_dir(d)
                try:
                    ctx, pg, e1 = await play(b, old, w, h, SEED)
                    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible", timeout=30000); await pg.fill("#hpAmt", "3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(1500)
                    await pg.evaluate("()=>(window.__store&&window.__store.flush?window.__store.flush():0)")
                    data = await pg.evaluate("()=>{var o={},s=window.__store||localStorage;for(var i=0;i<s.length;i++){var k=s.key(i);o[k]=s.getItem(k)}return o}"); await ctx.close()
                    ctx, pg, e2 = await play(b, cur, w, h, "if(!sessionStorage.getItem('__s')){localStorage.clear();var d=%s;for(var k in d)localStorage.setItem(k,d[k]);sessionStorage.setItem('__s','1')}" % json.dumps(data))
                    rec = await pg.evaluate("()=>!!document.getElementById('recov')&&document.getElementById('recov').offsetParent!==null")
                    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible", timeout=30000); await pg.wait_for_timeout(1200)
                    fp = await pg.evaluate(FP); await ctx.close()
                    why = []
                    if rec: why.append("recovery screen")
                    if e2: why.append("page errors %s" % e2[:2])
                    if fp["roster"] != base["roster"]: why.append("roster %s vs %s" % (fp["roster"], base["roster"]))
                    if fp["t"] != base["t"]:
                        i = next((i for i in range(min(len(fp["t"]), len(base["t"]))) if fp["t"][i] != base["t"][i]), 0)
                        why.append("sheet text differs near: ...%s | now ...%s" % (base["t"][max(0, i - 20):i + 40], fp["t"][max(0, i - 20):i + 40]))
                    if why: bad.append("%s APP_VER %d (%s): %s" % (vp, ver, c, "; ".join(why)))
                    else: print(vp, "APP_VER", ver, "ok")
                except Exception as e:
                    bad.append("%s APP_VER %d (%s): %s" % (vp, ver, c, str(e)[:160]))
                s2.shutdown()
        await b.close()
    for x in bad: print("FAIL", x)
    print("migrate_all:", "%d problems" % len(bad) if bad else "all versions open"); print("SCORE %d" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
