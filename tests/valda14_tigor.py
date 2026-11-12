#!/usr/bin/env python3
"""Acceptance test Tigor (Valda 2014). python3 tests/valda14_tigor.py [OUTDIR] [--root DIR]
Tigor, level 5, 2014 rules: Warden (2014) of Valda's Spire of Secrets, Stoneheart Defender, Warforged (ERLW), Soldier, Shield of the Silver Dragon.
Built the way the builder builds (__bldSheetFor), applied to the sheet (__sheetApply), then checked on the sheet: abilities, HP 54, AC 21,
Warden's Grasp on = AC 23 (and off again on New turn), Initiative +2, saves, skills, Warden's Resolve below half HP, localStorage, screenshots at
390x844 and 1250x850, and the PDF export (2014 template) rendered page by page to PNG. Needs only the app files, the book is turned on by the build."""
import asyncio, os, re, sys, json, socket, threading, functools, http.server
from playwright.async_api import async_playwright
import pypdf
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
if "--root" in args: i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
OUT = os.path.abspath(args[0]) if args else os.path.join(HERE, "out", "valda14"); os.makedirs(OUT, exist_ok=True)

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

BUILD = """()=>{const b=window.__bldTestB(); Object.assign(b,{name:"Tigor",rs:"2014",cls:"Warden (2014)",sub:"Stoneheart Defender (2014)",level:5,species:"Warforged (2014)",bg:"Soldier (2014)",bgMode:"111",method:"point",
 base:{STR:15,DEX:10,CON:14,INT:8,WIS:14,CHA:10},arr:{},src:{core:true,dmg:true,phb14:true,dmg14:true,tvss14:true,erlw:true,cos:true},eqC:"A",eqG:["","c","b","a"],eqP:{"0_1_0":"Battleaxe","2_0_0":"Javelin"},
 ch:{clsk:["Perception","Survival"],spsk:["Insight"],sptool:["Smith's Tools"],bgTool:["Dice Set"],rasi:["STR"],stand14:["Armor Proficiency"],lang:["Dwarvish"],fs2:"Protection",feat4:{feat:"Ability Score Improvement",a1:"CON",a2:"CON"}},
 inv:[{n:"Battleaxe",q:1,eq:true,src:"Warden kit",kit:1},{n:"Chain Mail",q:1,eq:true,src:"Warden kit",kit:1},{n:"Javelin",q:5,eq:true,src:"Warden kit",kit:1},{n:"Backpack (Dungeoneer's Pack)",q:1,eq:false,src:"Warden kit",kit:1},{n:"Shield of the Silver Dragon",q:1,eq:true}]});
 delete b.unset; window.__tig=window.__bldSheetFor(b); return !!window.__tig; }"""
AC = "()=>{const L=[...document.querySelectorAll('.tile.ac .v')];const e=L.filter(x=>x.offsetParent)[0]||L[0];return e?+(e.getAttribute('data-miv')||e.getAttribute('aria-label')||e.textContent.trim()):null}"
INIT = "()=>document.body.innerText.replace(/\\s+/g,' ')"

async def hp(pg, btn):
    await pg.evaluate("b=>{const i=document.getElementById('hpAmt');i.value='30';i.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector(b).click()}", btn)

# Tigor's identity, as agreed with the player: cheerful, trusts people fast, sent to find out why the world is falling apart
IDENT = {
    "personality": "Greets everyone like an old friend. Hums marching songs when it gets quiet.\nTakes people at their word. Usually that works out.",
    "ideal": "Protection. If somebody has to take the hit, it should be me.",
    "bond": "My old commander gave me one order: find out why the world is falling apart. I'm not going back without an answer.",
    "flaw": "I trust people way too fast. A smile and a sad story, and I'm in.",
    "backstory": "Tigor was built for the war. A shield with legs. Then the war ended, and he didn't know what to do with himself.\n"
        "So he stayed in uniform anyway. He fixed fences, hauled supplies, and made friends with anyone who would talk to him.\n"
        "Lately things keep breaking. Towns go quiet, roads vanish, and monsters show up where they never used to. "
        "His old commander called him in and told him straight: go find out what's going on. He said yes before she finished the sentence.\n"
        "He's no scout and he's not sneaky about it. He walks in, says hi, and stands between the trouble and whoever's behind him.",
}

async def run(b, url, W, H, bad, keep):
    vp = "%dx%d" % (W, H)
    ctx = await b.new_context(viewport={"width": W, "height": H}, accept_downloads=True, has_touch=W < 600)
    pg = await ctx.new_page(); errs = []; pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
    await pg.goto(url); await pg.evaluate("()=>localStorage.clear()"); await pg.reload()
    await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__sheetApply", timeout=120000)
    await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
    if not await pg.evaluate(BUILD): bad.append(vp + " no sheet from the builder"); return
    c = await pg.evaluate("()=>{const c=window.__tig;const ab={};Object.keys(c.abilities).forEach(k=>{const a=c.abilities[k];ab[k]=a.base+(a.bonus||[]).reduce((t,x)=>t+x.v,0)});return {ab:ab,sk:Object.values(c.skills||{}).filter(s=>s.p||s.e).map(s=>s.n).sort(),res:(c.defenses||[]).map(d=>d.t+':'+d.v),acts:(c.acts||[]).map(a=>a.k+':'+a.n)}}")
    if c["ab"] != {"STR": 16, "DEX": 10, "CON": 18, "INT": 8, "WIS": 14, "CHA": 10}: bad.append(vp + " abilities " + str(c["ab"]))
    if c["sk"] != ["Athletics", "Insight", "Intimidation", "Perception", "Survival"]: bad.append(vp + " skills " + str(c["sk"]))
    if "Resistance:Poison" not in c["res"]: bad.append(vp + " no poison resistance")
    for a in ("bonus:Warden's Grasp", "bonus:Warden's Mark", "action:Font of Life", "reaction:Protection"):
        if a not in c["acts"]: bad.append(vp + " action missing: " + a)
    await pg.evaluate("()=>window.__sheetApply(window.__tig,'')"); await pg.wait_for_timeout(2500)
    await pg.evaluate("(o)=>Object.keys(o).forEach(k=>window.__sheetIdentSet(k,o[k]))", IDENT)
    # the player's portrait, uploaded the way the sheet does it
    await pg.set_input_files("#avFile", os.path.join(os.path.dirname(os.path.abspath(__file__)), "fixtures", "tigor-portrait.jpg"))
    await pg.wait_for_function("()=>/^data:image\\/jpeg/.test(window.__sheetPortrait()||'')", timeout=15000)
    await pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b&&document.getElementById('homeV')&&document.getElementById('homeV').offsetParent) b.click()}"); await pg.wait_for_timeout(2500)
    txt = await pg.evaluate(INIT)
    if "/ 54" not in txt: bad.append(vp + " HP max is not 54")
    if "Initiative +2" not in txt: bad.append(vp + " Initiative is not +2")
    if "Warden (2014) 5" not in txt or "Stoneheart Defender" not in txt: bad.append(vp + " class line")
    ac = await pg.evaluate(AC)
    if ac != 21: bad.append(vp + " AC %s, expected 21" % ac)
    await pg.screenshot(path=os.path.join(OUT, vp + "-1-sheet.png"))
    sw = '[data-sit="on:grasp14"]'
    await pg.evaluate("()=>document.querySelector('%s').click()" % sw.replace("'", "\\'")); await pg.wait_for_timeout(1800)
    ac = await pg.evaluate(AC)
    if ac != 23: bad.append(vp + " AC with Warden's Grasp %s, expected 23" % ac)
    await pg.screenshot(path=os.path.join(OUT, vp + "-2-grasp.png"))
    await pg.evaluate("()=>document.querySelector('[data-sit=\"turn\"]').click()"); await pg.wait_for_timeout(1800)
    if await pg.evaluate(AC) != 21: bad.append(vp + " AC did not return to 21 on New turn")
    await hp(pg, "#dmgBtn"); await pg.wait_for_timeout(1500)
    row = await pg.evaluate("()=>{const r=document.querySelector('.sit-r[data-k=\"resolve14\"]');return r?r.innerText.replace(/\\s+/g,' '):''}")
    if "Active" not in row: bad.append(vp + " Warden's Resolve not active below half HP: " + row[:80])
    dtxt = await pg.evaluate(INIT)
    if not re.search(r"Resistance.{0,40}Bludgeoning", dtxt): bad.append(vp + " no bludgeoning resistance shown below half HP")
    await hp(pg, "#healBtn"); await pg.wait_for_timeout(1200)
    row = await pg.evaluate("()=>{const r=document.querySelector('.sit-r[data-k=\"resolve14\"]');return r?r.innerText.replace(/\\s+/g,' '):''}")
    if "Off" not in row: bad.append(vp + " Warden's Resolve still active at full HP")
    ls = await pg.evaluate("()=>{let o='';for(let i=0;i<localStorage.length;i++){const v=localStorage.getItem(localStorage.key(i))||'';if(v.indexOf('Warden (2014)')>=0)o+=localStorage.key(i)+';'}return o}")
    if not ls: bad.append(vp + " class not found in localStorage")
    await pg.screenshot(path=os.path.join(OUT, vp + "-3-end.png"))
    if W > 600:
        async with pg.expect_download(timeout=240000) as dl:
            await pg.evaluate("()=>document.getElementById('pdfBtn').click()")
        d = await dl.value; path = os.path.join(OUT, "tigor.pdf"); await d.save_as(path); keep.append(path)
        rd = pypdf.PdfReader(path)  # page 1 values live in form fields, so their values count as text too
        fv = " ".join(str(f.get("/V") or "") for f in (rd.get_fields() or {}).values())
        t = re.sub(r"\s+", " ", " ".join((p.extract_text() or "") for p in rd.pages) + " " + fv)
        for w in ("Tigor", "Warden", "Stoneheart", "Warforged", "Roots of Rock", "Sentinel's Stand", "Armor Proficiency", "old friend", "A shield with legs", "way too fast"):
            if w not in t: bad.append("PDF lacks " + w)
    if errs: bad.append(vp + " page errors: " + str(errs[:2]))

async def main():
    srv, url = serve(); bad = []; keep = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (1250, 850)): await run(b, url, W, H, bad, keep)
        await b.close()
    print("\n".join(bad) if bad else "OK Tigor, both viewports"); print("out:", OUT); sys.exit(1 if bad else 0)
asyncio.run(main())
