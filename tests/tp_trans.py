#!/usr/bin/env python3
"""Grim Hollow Transformation feats: the stage pick is offered and both the fixed and the chosen Boon reach the sheet.  python3 tests/tp_trans.py"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright
import http.server, threading, functools, socket
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*x): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open(ROOT+'/tests/fixtures/yudhi-v3.json',encoding='utf-8').read()
JS="""()=>{var b=window.__bldTestB();b.src=Object.assign({},b.src||{},{tghp:true});b.level=8;b.ch=Object.assign({},b.ch||{});b.ch.feat4={feat:"Vampire Transformation: Stage 1"};b.ch["trVampire1-feat4"]=["Soman Bloodline"];
 var out={};try{window.__bldTestSet(b);var cs=window.__bldChoiceList?window.__bldChoiceList(b):[];out.keys=(cs||[]).map(function(c){return c.key}).filter(function(k){return /Vampire|trV/.test(k)});var sh=window.__bldSheetFor(b);out.feat=JSON.stringify(sh.features||[]).indexOf("Soman Bloodline")>=0;out.has=JSON.stringify(sh.features||[]).indexOf("Fanged Bite")>=0}catch(e){out.err=String(e)}return out}"""
async def main():
    srv,url=serve()
    async with async_playwright() as p:
        br=await p.chromium.launch(); pg=await (await br.new_context(viewport={"width":390,"height":844})).new_page()
        await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)"%json.dumps(FIX))
        await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone",timeout=60000)
        await pg.evaluate("()=>{if(window.__bldNeed)window.__bldNeed()}"); await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.WX",timeout=60000)
        await pg.evaluate(JS); r=await pg.evaluate(JS); await br.close()
    ok = r.get("keys")==["trVampire1-feat4"] and r.get("feat") and r.get("has") and not r.get("err")
    print("ok  " if ok else "FAIL", "Vampire stage 1 feat: pick offered, chosen Boon and fixed Boon on the sheet", r)
    sys.exit(0 if ok else 1)
asyncio.run(main())
