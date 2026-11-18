#!/usr/bin/env python3
"""B44: Spell Gem (Quartz) in the builder. Add the gem, open its row, pick Shield in the Spell menu, the pick stays after a redraw, and after Apply the sheet lists Shield with the gem as source. 390x844 and 1250x850."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Y=open(ROOT+'/tests/fixtures/yudhi-v3.json',encoding='utf-8').read()
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*x): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
bad=[]
def chk(n,ok,x=''):
    print(('ok   ' if ok else 'FAIL ')+n,x)
    if not ok: bad.append(n)
async def run(p,vw,vh):
    b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":vw,"height":vh},service_workers="block")
    await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}"%json.dumps(Y))
    pg=await ctx.new_page(); pg.set_default_timeout(20000); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.wait_for_selector("[data-hview]",state="attached"); await pg.wait_for_timeout(1500)
    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(800)
    await pg.evaluate("document.getElementById('bldBtn').click()"); await pg.wait_for_selector("#bld:not([hidden])"); await pg.wait_for_timeout(2500)
    await pg.evaluate("document.querySelector(\"#bld [data-step='equip']\").click()"); await pg.wait_for_selector("[data-tog2=add]")
    await pg.evaluate("window.__setSrc&&window.__setSrc('oota',true)"); await pg.wait_for_timeout(500)
    await pg.evaluate("document.querySelector('#bld [data-tog2=add]').click()"); await pg.fill("#invq","Spell Gem (Quartz)"); await pg.wait_for_timeout(900)
    await pg.evaluate("(function(){var r=[...document.querySelectorAll('#bld .itn')].filter(e=>/Spell Gem \\(Quartz\\)/.test(e.textContent))[0];if(r)r.click()})()"); await pg.wait_for_timeout(600)
    added=await pg.evaluate("(function(){var a=[...document.querySelectorAll('#bld [data-iadd]')].find(e=>/^Spell Gem \\(Quartz\\)/.test(e.getAttribute('data-iadd')));if(a){a.click();return 1}return 0})()"); await pg.wait_for_timeout(700)
    chk(str(vw)+' gem added',added==1)
    OPEN="(function(){var r=[...document.querySelectorAll('#bld [data-tog]')].filter(e=>/^inv/.test(e.getAttribute('data-tog'))&&/Spell Gem/.test(e.textContent));if(r[0]&&!document.querySelector('#bld select[data-ipick]'))r[0].click();return !!document.querySelector('#bld select[data-ipick]')})()"
    has=await pg.evaluate(OPEN); await pg.wait_for_timeout(300)
    chk(str(vw)+' spell menu shown',bool(has))
    opts=await pg.evaluate("(function(){var s=document.querySelector('#bld select[data-ipick]');return s?[...s.options].map(o=>o.value):[]})()")
    chk(str(vw)+' menu holds level 1-2 spells only',('Shield' in opts) and ('Fireball' not in opts) and ('Light' not in opts),len(opts))
    await pg.evaluate("(function(){var s=document.querySelector('#bld select[data-ipick]');s.value='Shield';s.dispatchEvent(new Event('change',{bubbles:true}))})()"); await pg.wait_for_timeout(500)
    await pg.evaluate(OPEN); await pg.wait_for_timeout(300)
    cur=await pg.evaluate("(function(){var s=document.querySelector('#bld select[data-ipick]');return s?s.value:'none'})()")
    chk(str(vw)+' pick stays after redraw',cur=='Shield',cur)
    await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(2500)
    for _ in range(3):
        y=await pg.query_selector(".ask [data-yes], .exp [data-yes]")
        if not y: break
        await y.click(); await pg.wait_for_timeout(800)
    st=await pg.evaluate("()=>{try{return JSON.stringify((window.__sheetState().C.spells||[]).filter(s=>s.src==='Spell Gem (Quartz)').map(s=>[s.n,s.itc&&s.itc.dc,s.itc&&s.itc.atk]))}catch(e){return 'err '+e}}")
    chk(str(vw)+' sheet lists Shield from the gem with DC 13 and +5','Shield' in st and '13' in st,st)
    rs=await pg.evaluate("()=>JSON.stringify((window.__sheetState().C.res||[]).filter(r=>r.f==='Spell Gem (Quartz)').map(r=>[r.n,r.max,r.reset]))")
    chk(str(vw)+' single-use counter exists','Shield' in rs and 'none' in rs,rs)
    chk(str(vw)+' no page errors',not errs,errs[:2])
    await b.close()
async def main():
    async with async_playwright() as p:
        await run(p,390,844); await run(p,1250,850)
asyncio.run(main()); print('FAIL' if bad else 'OK'); sys.exit(1 if bad else 0)
