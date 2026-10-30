#!/usr/bin/env python3
"""T11 A5: computed styles of the overlays (ask dialog on the sheet, ask over Home, toast, builder ask), to prove that moving them
to the top layer keeps them looking the same. Also records which element is on top at the centre of each overlay.

  python3 tests/overlay_snapshot.py OUT.json [--root DIR]
  python3 tests/style_snapshot.py --diff A.json B.json      compare two runs"""
import asyncio, json, os, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
spec = importlib.util.spec_from_file_location("ss", os.path.join(HERE, "style_snapshot.py"))
args = sys.argv[1:]; sys.argv = [sys.argv[0], "--diff", os.devnull, os.devnull]  # load the helpers without running them
src = open(os.path.join(HERE, "style_snapshot.py"), encoding="utf-8").read().split("def diff(")[0]
G = {"__file__": os.path.join(HERE, "style_snapshot.py"), "__name__": "ss"}; sys.argv = [sys.argv[0]] + args; exec(src, G)
SNAP, PROPS, FIX, serve = G["SNAP"], G["PROPS"], G["FIX"], G["serve"]
from playwright.async_api import async_playwright
SUB = """([sel,props,snap])=>{ var root=document.querySelector(sel); if(!root) return {missing:sel}; var all=(new Function('return '+snap))()(props), out={};
  Object.keys(all).forEach(function(k){ out[k]=all[k]; });
  var keep={}; var r=root.getBoundingClientRect(); var top=document.elementFromPoint(r.left+r.width/2, r.top+Math.min(r.height/2,20));
  keep._top={on:top?(root.contains(top)?'overlay':top.tagName+'#'+top.id+'.'+top.className):'none'};
  for(var k in out){ if(k.indexOf(sel.replace(/^[.#]/,''))>=0) keep[k]=out[k]; } return keep; }"""
async def main(path):
    srv, url = serve(); res = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            vp = "%dx%d" % (w, h)
            ctx = await b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce", service_workers="block"); pg = await ctx.new_page()
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_function("()=>typeof window.__ask==='function'", timeout=30000); await pg.wait_for_timeout(1500)
            await pg.evaluate("()=>window.__ask('Delete this character?\\nIt cannot be undone.','Delete',function(){})"); await pg.wait_for_timeout(500)
            res[vp + " ask home"] = await pg.evaluate(SUB, [".ask", PROPS, SNAP]); await pg.keyboard.press("Escape")
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1000)
            await pg.evaluate("()=>window.__ask('Reset all spell slots?','Reset',function(){},['Only level 1',function(){}])"); await pg.wait_for_timeout(500)
            res[vp + " ask sheet"] = await pg.evaluate(SUB, [".ask", PROPS, SNAP]); await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>window.__toast('Saved to your device')"); await pg.wait_for_timeout(500)
            res[vp + " toast"] = await pg.evaluate(SUB, ["#toast", PROPS, SNAP]); await pg.wait_for_timeout(2600)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
            await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(800)
            await pg.evaluate("()=>window.__bldAsk('Start over with a new character?','Start over',function(){})"); await pg.wait_for_timeout(500)
            res[vp + " builder ask"] = await pg.evaluate(SUB, [".exp", PROPS, SNAP])
            await ctx.close()
        await b.close()
    srv.shutdown(); json.dump(res, open(path, "w"))
    for k, v in res.items(): print(k, len(v), "elements, on top:", v.get("_top"))
asyncio.run(main(os.path.abspath(args[0])))
