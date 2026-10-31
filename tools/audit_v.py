#!/usr/bin/env python3
"""Stage V audit: items whose text states a mechanical effect that the sheet engine reads, but have no fx. Reports counts per pattern.
  python3 tools/audit_v.py"""
import asyncio, json, os, re, socket, threading, functools, http.server
from playwright.async_api import async_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAT = {"AC bonus": r"\+\d+ bonus to (?:your )?(?:AC|Armor Class)|\bAC (?:equals|is) ", "Save advantage": r"advantage on (?:\w+ )?saving throws?", "Resistance": r"resistance to \w+ damage|you have resistance", "Immunity": r"immun(?:e|ity) to", "Speed": r"(?:flying|swimming|climbing) speed|speed (?:increases|of \d+)", "Darkvision": r"darkvision", "Ability score": r"(?:Strength|Dexterity|Constitution|Intelligence|Wisdom|Charisma) (?:score )?(?:increases|becomes|is \d+)", "Attack bonus": r"\+\d+ bonus to attack"}
def serve():
    so = socket.socket(); so.bind(("127.0.0.1", 0)); port = so.getsockname()[1]; so.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def main():
    srv, url = serve()
    async with async_playwright() as p:
        br = await p.chromium.launch(); pg = await (await br.new_context()).new_page()
        await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
        await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>!!window.WXI&&!!window.__deferDone", timeout=90000)
        rows = await pg.evaluate("()=>{var o=[];Object.keys(window.WXI).forEach(function(s){window.WXI[s].forEach(function(r){o.push([s,r[0],r[4]||'',r[5]&&r[5].fx?1:0,r[5]&&r[5].ch?1:0])})});return o}")
        await br.close()
    srv.shutdown()
    tot = len(rows); res = {k: [0, 0, []] for k in PAT}
    for s, n, t, fx, ch in rows:
        for k, pat in PAT.items():
            if re.search(pat, t, re.I):
                res[k][0] += 1
                if not fx: res[k][1] += 1; res[k][2].append("%s|%s" % (n, s))
    print("item rows", tot, "with fx", sum(1 for r in rows if r[3]))
    for k, (a, b, l) in res.items(): print("%-16s text mentions %4d, without fx %4d  %s" % (k, a, b, l[:3]))
    json.dump({k: v[2] for k, v in res.items()}, open(os.path.join(ROOT, "reports", "v-items-without-fx.json"), "w"), ensure_ascii=False, indent=0)
asyncio.run(main())