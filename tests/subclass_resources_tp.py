#!/usr/bin/env python3
"""Third-party subclass numbers on the computed sheet (the non-WotC books, WX.src entries with tp). One browser session.
  python3 tests/subclass_resources_tp.py [--root DIR]
Rows whose max is a formula (ability modifier, Proficiency Bonus, level) are checked with two or three ability arrays, plus
damage dice and speed the feature text states. Arrays in STR..CHA order (Human, Soldier, no Quick Build bonus):
  A = 15 14 13 12 10 8, B = 10 12 14 16 18 20, C = 8 10 20 12 14 16
Exit 1 on any difference."""
import asyncio, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); a = sys.argv[1:]
if "--root" in a: ROOT = os.path.abspath(a[a.index("--root") + 1])

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); p = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", p), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return "http://127.0.0.1:%d/index.html" % p

ARR = {"A": [15, 14, 13, 12, 10, 8], "B": [10, 12, 14, 16, 18, 20], "C": [8, 10, 20, 12, 14, 16]}
# (book id, class, subclass, level, array, kind, row, expected)  kind: res = c.res max, xd = c.xdmg dice, speed = c.speed
CASES = [
    ("tghp", "Warlock", "The Coven", 3, "A", "res", "Hag's Eye (Hex)", 1), ("tghp", "Warlock", "The Coven", 3, "B", "res", "Hag's Eye (Hex)", 5),
    ("tghp", "Warlock", "The Coven", 6, "C", "res", "Hag's Guile", 3), ("tghp", "Warlock", "The Coven", 10, "B", "res", "Hag's Eye (Bestow Curse)", 1),
    ("tsgs", "Monk", "Warrior of the Celestial", 14, "B", "res", "Celestial Emissary: Radiant strike", 4),
    ("tsgs", "Monk", "Warrior of the Celestial", 20, "A", "res", "Celestial Emissary: Radiant strike", 2),
    ("ttoh", "Fighter", "Chaplain", 20, "A", "res", "Rally Point", 6), ("ttoh", "Fighter", "Radiant Pikeman", 20, "B", "res", "The Sun's Protection", 3),
    ("tvss", "Investigator", "Antiquarian", 14, "A", "res", "Soul Jar charges", 5),
    ("tvss14", "Gunslinger (2014)", "Storm Gunner", 6, "A", "speed", "", 30), ("tvss14", "Gunslinger (2014)", "Storm Gunner", 10, "A", "speed", "", 40),
    ("tvss14", "Gunslinger (2014)", "Storm Gunner", 20, "B", "speed", "", 40),
    ("tvss14", "Paladin", "Oath of Winter", 20, "A", "xd", "Divine Smite", "2d8"),
]
JS = """([cs])=>cs.map(([book,cls,sub,lv,arr,kind,n])=>{try{const q=((window.WX&&WX.src)||[]).filter(s=>s.id===book)[0];if(!q)return 'no book '+book;
 const rs=/14$/.test(q.tag||'')?'2014':'2024',src={};src[q.id]=true;if(rs==='2014'){src.phb14=true;src.dmg14=true}
 const r=window.__bldFuzz({sp:rs==='2014'?'Human (2014)':'Human',bg:rs==='2014'?'Soldier (2014)':'Soldier',rs,src,cls,sub,lv,arr,b2:0,b1:0});
 if(!r||r.err)return 'err '+(r&&r.err);const c=r.c;if(kind==='speed')return c.speed;
 const x=(kind==='res'?c.res:c.xdmg||[]).filter(q=>q.n==n)[0];return x?(kind==='res'?x.max:x.dmg):null}catch(e){return 'err '+e}})"""
PROBE = """()=>{((window.WX&&WX.src)||[]).filter(q=>q.tp&&(q.classes||[]).length).forEach(q=>{const rs=/14$/.test(q.tag||'')?'2014':'2024',src={};src[q.id]=true;
 try{window.__bldFuzz({sp:rs==='2014'?'Human (2014)':'Human',bg:rs==='2014'?'Soldier (2014)':'Soldier',rs,src,cls:q.classes[0],sub:'',lv:1,arr:[15,14,13,12,10,8],b2:0,b1:0})}catch(e){}});return 1}"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page()
        await pg.goto(serve()); await pg.wait_for_function("()=>!!window.__bldFuzz", timeout=120000)
        await pg.evaluate("()=>window.__bldNeed().then(()=>1)"); await pg.evaluate(PROBE)
        got = await pg.evaluate(JS, [[[bk, c, s, l, ARR[k], kd, n] for bk, c, s, l, k, kd, n, _ in CASES]]); await b.close()
    bad = [(c, g) for c, g in zip(CASES, got) if g != c[7]]
    for c, g in bad: print("WRONG %s %s / %s lv %d arr %s: %s %s = %s, expected %s" % (c[0], c[1], c[2], c[3], c[4], c[5], c[6], g, c[7]))
    print("subclass_resources_tp: %d values checked, %d wrong" % (len(CASES), len(bad))); sys.exit(1 if bad else 0)

asyncio.run(main())
