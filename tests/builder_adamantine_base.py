#!/usr/bin/env python3
"""Adamantine Armor in the builder: pick a base (Plate Armor), the picker stays, the name becomes Adamantine Armor (Plate Armor), and after Apply the sheet AC is the base AC plus Dex plus Defense (Yudhi: 18+0+1=19). 390x844."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
Y=open(ROOT+'/tests/fixtures/yudhi-v3.json',encoding='utf-8').read()
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*x): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},service_workers="block")
    await ctx.add_init_script("if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);sessionStorage.setItem('__s','1')}"%json.dumps(Y))
    pg=await ctx.new_page(); pg.set_default_timeout(20000); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.wait_for_selector("[data-hview]",state="attached"); await pg.wait_for_timeout(1500)
    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(800)
    await pg.evaluate("document.getElementById('bldBtn').click()"); await pg.wait_for_selector("#bld:not([hidden])"); await pg.wait_for_timeout(2500)
    await pg.evaluate("document.querySelector(\"#bld [data-step='equip']\").click()"); await pg.wait_for_selector("[data-tog2=add]")
    await pg.evaluate("document.querySelector('#bld [data-tog2=add]').click()"); await pg.fill("#invq","Adamantine Armor"); await pg.wait_for_timeout(900)
    print(await pg.evaluate("[...document.querySelectorAll('#bld [data-tog]')].filter(e=>/Adamantine/.test(e.textContent)).map(e=>e.getAttribute('data-tog')+'|'+e.className)"))
    print(await pg.evaluate("(function(){var r=[...document.querySelectorAll('#bld .itn')].filter(e=>/Adamantine Armor/.test(e.textContent))[0];if(r){r.click();return 'clicked'}return 'none'})()"))
    await pg.wait_for_timeout(700)
    print(await pg.evaluate("[...document.querySelectorAll('#bld [data-iadd],#bld [data-add],#bld button')].filter(e=>/Adamantine/.test(e.getAttribute('data-iadd')||e.getAttribute('data-add')||'')).map(e=>e.outerHTML.slice(0,160))"))
    print(await pg.evaluate("(function(){var a=[...document.querySelectorAll('#bld [data-iadd]')].find(e=>/^Adamantine Armor/.test(e.getAttribute('data-iadd')));if(a){a.click();return 'added'}return 'noadd'})()")); await pg.wait_for_timeout(700)
    print(await pg.evaluate("[...document.querySelectorAll('#bld [data-tog]')].filter(e=>/Adamantine/.test(e.textContent)||/Adamantine/.test(e.getAttribute('data-tog'))).map(e=>e.getAttribute('data-tog')+'|'+e.className)"))
    print(await pg.evaluate("(function(){var r=[...document.querySelectorAll('#bld [data-tog]')].filter(e=>/^inv|^it/.test(e.getAttribute('data-tog'))&&/Adamantine/.test(e.closest('div,li')?e.closest('div,li').textContent:''));if(r[0]){r[0].click();return 'opened '+r[0].getAttribute('data-tog')}return 'noopen'})()")); await pg.wait_for_timeout(600)
    print(await pg.evaluate("(function(){var s=document.querySelector('#bld select[data-ibase]');return s?[...s.options].map(o=>o.value).join(','):'no base select'})()"))
    OPEN="(function(){var r=[...document.querySelectorAll('#bld [data-tog]')].filter(e=>/^inv/.test(e.getAttribute('data-tog'))&&/Adamantine/.test(e.textContent));if(r[0]&&!document.querySelector('#bld select[data-ibase]'))r[0].click();var s=document.querySelector('#bld select[data-ibase]');return (s?'select='+s.value:'select gone')+' | '+[...document.querySelectorAll('#bld .itn')].filter(e=>/Adamantine/.test(e.textContent)).map(e=>e.textContent.trim().slice(0,60)).join(';')})()"
    for v in ('Half Plate Armor','Plate Armor','Half Plate Armor'):
        print(await pg.evaluate("(function(v){var s=document.querySelector('#bld select[data-ibase]');if(!s)return 'noselect';s.value=v;s.dispatchEvent(new Event('change',{bubbles:true}));return 'set'})(%s)"%json.dumps(v))); await pg.wait_for_timeout(500)
        print(v,'->',await pg.evaluate(OPEN)); await pg.wait_for_timeout(300)
    AC="(function(){var a=document.getElementById('vbAcV')||document.getElementById('ppAc');return a?a.textContent.trim():'noac'})()"
    print('AC before equip',await pg.evaluate(AC))
    print(await pg.evaluate("(function(){var r=[...document.querySelectorAll('#bld [data-ieq]')];var t=r.find(e=>/Adamantine/.test((e.closest('.itm,.irow,div')||{}).textContent||'')&&!e.classList.contains('on'));return 'eqbtns '+r.length})()"))
    print(await pg.evaluate("(function(){var d=document.querySelector('#bld select[data-ibase]');var box=d.closest('.itemrow,.irow,.itm,li,div[class*=item]')||d.parentElement.parentElement;var b=box.querySelector('[data-ieq]');if(b){b.click();return 'equipped '+b.textContent}return 'nobtn'})()")); await pg.wait_for_timeout(800)
    print('AC after equip',await pg.evaluate(AC))
    print(await pg.evaluate("(function(){var b=[...document.querySelectorAll('#bld [data-ieq]')].find(e=>/^Chain Mail/.test((e.closest('[class*=itm],[class*=irow],li')||e.parentElement).textContent.trim()));if(b){b.click();return 'chain unequipped'}return 'nochain'})()")); await pg.wait_for_timeout(800)
    print('AC adamantine half plate only',await pg.evaluate(AC))
    print(await pg.evaluate("(function(){var t=document.body.textContent;var m=/Dexterity[^0-9+-]{0,40}([+-]?\\d+)/.exec(t);return m?m[0].slice(0,60):'nodex'})()"))
    V,EXP='Plate Armor',19
    await pg.evaluate("(function(v){var s=document.querySelector('#bld select[data-ibase]');if(!s){var r=[...document.querySelectorAll('#bld [data-tog]')].filter(e=>/^inv/.test(e.getAttribute('data-tog'))&&/Adamantine/.test(e.textContent));r[0].click();s=document.querySelector('#bld select[data-ibase]')}s.value=v;s.dispatchEvent(new Event('change',{bubbles:true}))})(%s)"%json.dumps(V)); await pg.wait_for_timeout(700)
    await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(2500)
    for _ in range(3):
        y=await pg.query_selector(".ask [data-yes], .exp [data-yes]")
        if not y: break
        await y.click(); await pg.wait_for_timeout(800)
    ac=await pg.evaluate(AC); ok=str(EXP)==ac and not errs; print('%s  sheet AC %s, expect %d, errors %s'%('ok  ' if ok else 'FAIL',ac,EXP,errs)); global RC; RC=0 if ok else 1
RC=1
asyncio.run(main()); srv.shutdown(); sys.exit(RC)
