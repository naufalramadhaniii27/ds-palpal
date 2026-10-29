#!/usr/bin/env python3
"""N6 rules fuzzer. Builds many random legal 2024 characters through the real builder, derives the sheet, and checks invariants.

  python3 tests/fuzz_rules.py [OUTDIR] [--root DIR] [--n 500] [--seed 1]

Each character: random class, species, background (+2/+1 split), standard array order, level 1 to 20, subclass from level 3.
Remaining choices are filled the Quick Build way (__bldFuzz). The sheet is derived without saving (__deriveFor).
Hard checks (fail the run): builder or sheet error, NaN or "undefined" in the sheet object or derived numbers, level and Proficiency Bonus,
ability modifier = floor((score - 10) / 2), score 1 to 30, AC from 10 plus any negative DEX, CON and WIS modifiers (unarmored) up to 30, Hit Point maximum at least the level and at most 20 per level + 30,
same picks give the same sheet (determinism), the build turned into a sheet again gives the same sheet (round trip).
Soft findings (reported, not failing): rule issues the builder itself lists, choices the Quick Build fill left open.
Writes OUTDIR/fuzz.json. Exit code 0 only when there is no hard failure."""
import asyncio, json, os, sys, random, functools, http.server, socket, threading
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]
ROOT = os.path.dirname(HERE)
def opt(name, default):
    global args
    if name in args:
        i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    return default
ROOT = os.path.abspath(opt("--root", ROOT)); N = int(opt("--n", "500")); SEED = int(opt("--seed", "1"))
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "fuzz"); os.makedirs(OUT, exist_ok=True)

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

CHECK = r"""(o)=>{
  var r=window.__bldFuzz(o); if(!r||r.err) return {err:'builder: '+(r&&r.err)};
  var d=window.__deriveFor(r.c); if(!d||d.err) return {err:'sheet: '+(d&&d.err)};
  var again=window.__bldFuzz(o), back=window.__bldSheetFor(r.b);
  var J=JSON.stringify, bad=[];
  var txt=J(r.c)+J(d); if(/NaN/.test(txt)) bad.push('NaN in sheet or derived'); if(/"undefined"|undefined\b/.test(J(r.c))) bad.push('undefined in sheet object');
  if(d.level!==o.lv) bad.push('level '+d.level+' != '+o.lv);
  if(d.pb!==2+Math.floor((o.lv-1)/4)) bad.push('pb '+d.pb);
  ['STR','DEX','CON','INT','WIS','CHA'].forEach(function(k){ var s=d.score&&d.score[k], m=d.mod&&d.mod[k];
    if(typeof s!=='number'||s<1||s>30) bad.push('score '+k+' '+s);
    else if(m!==Math.floor((s-10)/2)) bad.push('mod '+k+' '+m+' for '+s); });
  var lowAc=10+Math.min(0,(d.mod&&d.mod.DEX)||0)+Math.min(0,(d.mod&&d.mod.CON)||0)+Math.min(0,(d.mod&&d.mod.WIS)||0); if(!(d.ac>=lowAc&&d.ac<=30)) bad.push('ac '+d.ac);
  if(!(d.hpmax>=o.lv&&d.hpmax<=o.lv*20+30)) bad.push('hpmax '+d.hpmax);
  if(!again||again.err||J(again.c)!==J(r.c)) bad.push('not deterministic');
  if(!back||J(back)!==J(r.c)) bad.push('round trip differs');
  return {bad:bad, ri:r.ri, un:r.un, sum:{ac:d.ac,hp:d.hpmax,dc:d.dc,sub:r.b.sub}};
}"""

async def main():
    srv, url = serve(); rng = random.Random(SEED); res = []; errs = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={"width": 1250, "height": 850})
        pg.on("pageerror", lambda e: errs.append(str(e)))
        await pg.goto(url); await pg.evaluate("()=>{localStorage.clear()}"); await pg.reload()
        await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
        await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__deriveFor", timeout=60000)
        L = await pg.evaluate("()=>window.__bldLists()")
        for i in range(N):
            cls = rng.choice(L["cls"]); arr = L["arr"][:]; rng.shuffle(arr); lv = rng.randint(1, 20)
            subs = L["subs"].get(cls) or []
            o = {"cls": cls, "sp": rng.choice(L["sp"]), "bg": rng.choice(L["bg"]), "arr": arr, "b2": rng.randrange(3), "b1": rng.randrange(2),
                 "lv": lv, "sub": rng.choice(subs) if subs else ""}
            r = await pg.evaluate(CHECK, o); r["o"] = o; res.append(r)
        await b.close()
    srv.shutdown()
    hard = [r for r in res if r.get("err") or r.get("bad")]
    ri = {}; un = {}
    for r in res:
        for x in r.get("ri") or []: ri[x[:120]] = ri.get(x[:120], 0) + 1
        if r.get("un"): un[r["un"]] = un.get(r["un"], 0) + 1
    rep = {"n": N, "seed": SEED, "hard": len(hard), "page_errors": errs[:20], "hard_cases": hard[:50],
           "rule_issues": sorted(ri.items(), key=lambda x: -x[1])[:40], "unfinished": sorted(un.items(), key=lambda x: -x[1])[:20],
           "classes": len(L["cls"]), "species": len(L["sp"]), "backgrounds": len(L["bg"])}
    json.dump(rep, open(os.path.join(OUT, "fuzz.json"), "w"), indent=1)
    print("%d characters, %d hard failures, %d page errors, %d kinds of rule issues, %d kinds of open choices" % (N, len(hard), len(errs), len(ri), len(un)))
    for h in hard[:8]: print("FAIL", json.dumps(h.get("o")), h.get("err") or h.get("bad"))
    return 1 if hard or errs else 0
sys.exit(asyncio.run(main()))
