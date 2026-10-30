#!/usr/bin/env python3
"""T11 Learn F3: screenshots of the real builder with numbered points, for "How the builder works" in Forge Your Hero.
  python3 tools/learn_shots.py            (after python3 build.py)
A new character is made in the app, the builder is opened on each step, and a phone (390x844) and a PC (1250x850) picture is taken.
The point positions are read from the real elements (percent of the picture), so they follow the layout. A point whose element is not
found stops the tool with an error (the Checker rule of the plan). Output: img/learn/shots/<step>-phone.avif, <step>-pc.avif and
img/learn/shots/shots.json. The words of each point live in src/learn/45-data-learn.js (LEARN.shots), in English and Indonesian."""
import asyncio, json, os, sys, functools, http.server, socket, threading, io
from playwright.async_api import async_playwright
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); OUT = os.path.join(ROOT, "img", "learn", "shots")
# step: [(point id, CSS selector of the element the point marks)]
STEPS = {
  "class": [("steps", "#steps"), ("pick", "#body .pcard, #body .pickrow, #body .acc"), ("next", "#next")],
  "abil": [("method", "#body select[data-method]"), ("hex", "#body .abhex"), ("left", "#body .pts")],
  "next": [("apply", "#b-toSheet"), ("ready", "#body h2, #body .ttl"), ("prev", "#prev")],
}
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
        def guess_type(self, p): return "application/wasm" if p.endswith(".wasm") else super().guess_type(p)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def main():
    os.makedirs(OUT, exist_ok=True); srv, url = serve(); out = {}
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for tag, w, h in (("phone", 390, 844), ("pc", 1250, 850)):
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=2, service_workers="block"); pg = await ctx.new_page()
            await pg.goto(url); await pg.evaluate("()=>{ localStorage.clear(); localStorage.setItem('mi-fx','off'); }"); await pg.reload()
            await pg.wait_for_selector("[data-hnew]", state="attached", timeout=30000)
            await pg.evaluate("()=>document.querySelector('[data-hnew]').click()"); await pg.wait_for_timeout(5000)
            # a filled-in build reads better than an empty one: Fighter, Human, Soldier, the same as Quick Build
            await pg.evaluate("()=>{ var s=document.getElementById('qbCls'); if(s){ s.value='Fighter'; s.dispatchEvent(new Event('change',{bubbles:true})); } var q=document.querySelector('[data-qb]'); if(q) q.click(); }"); await pg.wait_for_timeout(1500)
            for step, pts in STEPS.items():
                await pg.evaluate("s=>{ var b=document.querySelector('#steps [data-step=\"'+s+'\"]'); if(b) b.click(); }", step); await pg.wait_for_timeout(1200)
                if step == "abil":  # Point Buy shows the points-left counter the point explains
                    await pg.evaluate("()=>{ var m=document.querySelector('#body select[data-method]'); if(m&&m.value!=='point'){ m.value='point'; m.dispatchEvent(new Event('change',{bubbles:true})); } }"); await pg.wait_for_timeout(800)
                # Learn pictures carry no blood: the class and species scene art of the builder is left out of the screenshot
                await pg.add_style_tag(content="#bld .bld-hero{display:none!important} #bld,#bld *{background-image:none!important}"); await pg.wait_for_timeout(200)
                await pg.evaluate("()=>{ var t=document.getElementById('btoast'); if(t) t.classList.remove('on'); window.scrollTo(0,0); var m=document.querySelector('#bld main'); if(m) m.scrollTop=0; }"); await pg.wait_for_timeout(300)
                dots = []
                for pid, sel in pts:
                    r = await pg.evaluate("""s=>{ var e=[...document.querySelectorAll(s)].find(x=>{ var r=x.getBoundingClientRect(); return r.width>0&&r.height>0&&r.top<innerHeight&&r.bottom>0; }); if(!e) return null; var r=e.getBoundingClientRect(); return {x:(r.left+Math.min(r.width,48)/2+4)/innerWidth*100, y:(r.top+Math.min(r.height,48)/2+2)/innerHeight*100}; }""", sel)
                    if not r: sys.exit("learn_shots: %s %s: no element for point %s (%s)" % (tag, step, pid, sel))
                    dots.append({"id": pid, "x": round(r["x"], 1), "y": round(r["y"], 1)})
                png = await pg.screenshot(); im = Image.open(io.BytesIO(png)).convert("RGB")
                dst = os.path.join(OUT, "%s-%s.avif" % (step, tag)); im.save(dst, "AVIF", quality=58, speed=6)
                out.setdefault(step, {})[tag] = {"w": w, "h": h, "dots": dots}
                print(tag, step, os.path.getsize(dst) // 1024, "KB", dots)
            await ctx.close()
        await b.close()
    srv.shutdown()
    json.dump(out, open(os.path.join(OUT, "shots.json"), "w"), indent=1)
asyncio.run(main())
