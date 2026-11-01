#!/usr/bin/env python3
"""Which entries of the app already have a 5etools picture. Writes OUT.json: {kind: {slug: 1 if a 5etools picture exists else 0}}.
Codex art is only installed for entries without one (rule from the owner, 2026-11-01). Run from the repo root, needs Playwright."""
import asyncio, json, sys
from playwright.async_api import async_playwright
FIX = open("tests/fixtures/yudhi-v3.json").read()
JS = """()=>{function slug(n){return String(n||"").toLowerCase().replace(/['\\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}
var idx=window.__libIndex(), res={};
function has5(c,n){var im=null; if(window.QREFS&&window.QREFS[c]) window.QREFS[c].forEach(function(q){ if(q.n===n&&q.im) im=q.im; }); if(!im&&window.QIMG&&window.QIMG[c]) im=window.QIMG[c][n]||null; return !!im}
var cats={item:['item','gear'],spell:['spell'],feat:['feat'],feature:['feature'],rule:['rule'],facility:['facility'],creature:['creature','monster'],species:['species'],bg:['bg'],sub:['sub'],class:['class'],opt:['opt'],optfeat:['optfeat'],language:['language']};
Object.keys(cats).forEach(function(k){var o={};idx.forEach(function(r){ if(cats[k].indexOf(r[0])<0) return; var s=slug(r[1]); if(!(s in o)) o[s]=0; if(has5(r[0],r[1])) o[s]=1; }); res[k]=o}); return res}"""
async def main(out):
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await (await b.new_context(viewport={"width": 390, "height": 844})).new_page()
        await pg.goto("file://" + __import__("os").path.abspath("index.html")); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}", FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_timeout(1500)
        await pg.evaluate("()=>window.__app.libOpen()"); await pg.wait_for_timeout(3000)
        r = await pg.evaluate(JS); json.dump(r, open(out, "w")); await b.close()
asyncio.run(main(sys.argv[1]))
