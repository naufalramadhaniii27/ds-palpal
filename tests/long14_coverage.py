"""Every 2014 species trait and background feature that has own-wording long text in the data files must resolve through the builder hook.
Run: python3 tests/long14_coverage.py   Exit 1 when a text in the data files is never reached by an app species or background."""
import asyncio, json, re, functools, http.server, socket, threading, sys, os
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % p
JS = """()=>{ const d=window.__bldData(); const hit=new Set(); let sp=0,bg=0,spAll=0,bgAll=0;
 for(const [k,v] of Object.entries(d.species)){ for(const t of (v.traits||[])){ spAll++; const x=window.__bldLong14('Species: '+k,t[0]); if(x){sp++; hit.add('S|'+k.replace(/ \\(2014\\)$/,'')+'|'+t[0]);} } }
 for(const [k,v] of Object.entries(d.bgs)){ for(const f of (v.bf||[])){ bgAll++; const x=window.__bldLong14('Background: '+k,f[0]); if(x){bg++; hit.add('B|'+k.replace(/ \\(2014\\)$/,'')+'|'+f[0]);} } }
 return {sp:sp,bg:bg,spAll:spAll,bgAll:bgAll,hit:[...hit]}; }"""
def expected():
    s = open(os.path.join(ROOT, "src/builder/06a-data-2014-long-text-more.js"), encoding="utf-8").read()
    out = set()
    for name, kind in (("MORE14_SPECIES", "S"), ("MORE14_BACKGROUND", "B")):
        i = s.index("export const " + name + " = ") + len("export const " + name + " = "); d = 0
        for j, ch in enumerate(s[i:], i):
            if ch == "{": d += 1
            elif ch == "}":
                d -= 1
                if d == 0: break
        o = json.loads(s[i:j + 1])
        if kind == "S":
            for sp, t in o.items():
                for n in t: out.add("S|%s|%s" % (sp, n))
        else:
            for k in o: a, n = k.split("|"); out.add("B|%s|%s" % (a, n))
    return out
async def main():
    srv, url = serve()
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page()
        await pg.goto(url); await pg.evaluate("()=>localStorage.clear()"); await pg.reload()
        await pg.wait_for_function("()=>window.__bldNeed", timeout=60000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        await pg.wait_for_function("()=>!!window.__bldData&&!!window.__bldLong14", timeout=120000)
        r = await pg.evaluate(JS); await b.close()
    srv.shutdown()
    miss = sorted(expected() - set(r["hit"]))
    print("species traits with long text %d of %d, background features %d of %d" % (r["sp"], r["spAll"], r["bg"], r["bgAll"]))
    print("unreached texts in data files: %d" % len(miss))
    for m in miss[:40]: print("  ", m)
    sys.exit(1 if miss else 0)
asyncio.run(main())
