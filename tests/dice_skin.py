#!/usr/bin/env python3
"""Dice colours (src/fx/25-dice3d.js palettes, buttons in src/fx/16c-z-pack-dice-roller.js).
  python3 tests/dice_skin.py [OUT]
1. The panel has Galaxy, Ocean, Ember and Custom. Galaxy is the default. A tap stores the choice (mi-dsk) and it survives a reload.
2. Custom colour: 400 colours (all the extremes too) must give a number colour with contrast >= 4.5 against the body and >= 7 against the ring.
3. Pixels: a d20 is thrown in each set and in custom white, black, grey, yellow and magenta. The canvas must hold enough pixels of the number
   colour (at least 60, the groove walls take part of the number) and some of the ring colour, so a number can be read on every colour. Screenshots go to OUT (default tests/out). 1250x850, 390x844."""
import asyncio, json, os, random, sys
HERE = os.path.dirname(os.path.abspath(__file__)); OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "out"); sys.argv = [sys.argv[0]]
os.makedirs(OUT, exist_ok=True)
__file__ = os.path.join(HERE, "style_snapshot.py"); exec(open(__file__).read().split("def diff(")[0])
PIX = """async(sk)=>{ window.__dice3d.skin(sk); var r=window.__dice3d.res(), hx=function(h){var n=parseInt(h.slice(1),16);return [n>>16&255,n>>8&255,n&255]}, ink=hx(r.ink), hal=hx(r.hal);
  await window.__dice3d.roll([20],[7]); var cv=document.querySelector('#diceTray canvas'), gl=cv.getContext('webgl')||cv.getContext('experimental-webgl'), w=cv.width, h=cv.height, b=new Uint8Array(w*h*4);
  gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,b); var ni=0, nh=0, nt=0, near=function(i,c,t){ return Math.abs(b[i]-c[0])<=t&&Math.abs(b[i+1]-c[1])<=t&&Math.abs(b[i+2]-c[2])<=t };
  for(var i=0;i<b.length;i+=4){ if(b[i+3]<250) continue; nt++; if(near(i,ink,90)) ni++; else if(near(i,hal,70)) nh++; } return {ink:ni,ring:nh,die:nt,r:r}; }"""
CONTRAST = """()=>{ var bad=[], d=window.__dice3d, hex=function(n){return '#'+('000000'+n.toString(16)).slice(-6)}, L=['#000000','#ffffff','#808080','#777777','#898989','#ff0000','#00ff00','#0000ff','#ffff00','#00ffff','#ff00ff','#7a3fd0'];
  for(var i=0;i<388;i++) L.push(hex(Math.floor(Math.random()*16777216)));
  L.forEach(function(c){ var r=d.res('custom:'+c), a=d.ratio(r.ink,r.c1), b=d.ratio(r.ink,r.hal); if(a<4.5||b<7) bad.push(c+' body '+a.toFixed(2)+' ring '+b.toFixed(2)); });
  ['galaxy','ocean','ember'].forEach(function(k){ var r=d.res(k); if(d.ratio(r.ink,r.hal)<7) bad.push(k+' ring '+d.ratio(r.ink,r.hal).toFixed(2)); }); return {n:L.length,bad:bad.slice(0,8)}; }"""
async def main():
    srv, url = serve(); bad = []
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])
        for w, h in [(1250, 850), (390, 844)]:
            tag = "%dx%d" % (w, h)
            ctx = await b.new_context(viewport={"width": w, "height": h}, service_workers="block"); pg = await ctx.new_page(); errs = []
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(FIX)+");sessionStorage.setItem('__s','1')}"); await pg.goto(url)
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(800)
            if not await pg.is_visible("#diceBtn"): await pg.click("#moreBtn"); await pg.wait_for_timeout(300)
            await pg.click("#diceBtn"); await pg.wait_for_selector(".mi-dp.on", timeout=5000); await pg.wait_for_timeout(450)
            # 1. buttons, default, choice kept
            names = await pg.evaluate("()=>[].map.call(document.querySelectorAll('.mi-dsw'),b=>b.textContent.replace(/^20/,''))")
            if names != ["Galaxy", "Ocean", "Ember", "Custom"]: bad.append(tag + " colour buttons " + json.dumps(names))
            if await pg.evaluate("()=>window.__dice3d.skin()") != "galaxy" or await pg.get_attribute('button[data-dsk="galaxy"]', "aria-pressed") != "true": bad.append(tag + " default is not Galaxy")
            await pg.click('button[data-dsk="ocean"]')
            st = await pg.evaluate("()=>({k:__store.getItem('mi-dsk'),p:document.querySelector('button[data-dsk=ocean]').getAttribute('aria-pressed'),g:document.querySelector('button[data-dsk=galaxy]').getAttribute('aria-pressed')})")
            if st != {"k": "ocean", "p": "true", "g": "false"}: bad.append(tag + " tap on Ocean " + json.dumps(st))
            await pg.evaluate("()=>{var i=document.querySelector('[data-dsc]'); i.value='#ffffff'; i.dispatchEvent(new Event('input',{bubbles:true}))}")
            st = await pg.evaluate("()=>({k:__store.getItem('mi-dsk'),c:document.querySelector('.mi-dswc').getAttribute('aria-pressed')||document.querySelector('.mi-dswc').classList.contains('on')})")
            if st["k"] != "custom:#ffffff" or not st["c"]: bad.append(tag + " custom colour " + json.dumps(st))
            await pg.reload(); await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(600)
            if await pg.evaluate("()=>window.__dice3d.skin()") != "custom:#ffffff": bad.append(tag + " colour not kept after reload")
            # 2. contrast of the number colour for 400 colours
            c = await pg.evaluate(CONTRAST)
            if c["bad"]: bad.append(tag + " contrast " + json.dumps(c))
            print(tag, "contrast over", c["n"], "colours:", "ok" if not c["bad"] else "FAIL")
            # 3. pixels of the number colour and the ring on every set (3D only where WebGL runs)
            if await pg.evaluate("()=>{try{return !!document.createElement('canvas').getContext('webgl')}catch(e){return false}}"):
                for sk in ["galaxy", "ocean", "ember", "custom:#ffffff", "custom:#000000", "custom:#808080", "custom:#ffd400", "custom:#ff00ff"]:
                    r = await pg.evaluate(PIX, sk); print(tag, sk, "ink px", r["ink"], "ring px", r["ring"], "die px", r["die"])
                    if r["die"] < 800 or r["ink"] < 60 or r["ring"] < 10: bad.append(tag + " " + sk + " number not readable " + json.dumps({k: r[k] for k in ("ink", "ring", "die")}))
                    await pg.screenshot(path=os.path.join(OUT, "skin_%s_%s.png" % (sk.replace(":#", "_"), tag))); await pg.wait_for_timeout(2000)
            else: print(tag, "no WebGL here: pixel part skipped")
            for e in errs: bad.append(tag + " " + e[:200])
            await ctx.close()
        await b.close()
    srv.shutdown()
    for x in bad: print("FAIL", x)
    print("dice_skin:", "ok" if not bad else "%d problems" % len(bad)); sys.exit(1 if bad else 0)
asyncio.run(main())
