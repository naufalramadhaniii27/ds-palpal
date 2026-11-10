#!/usr/bin/env python3
"""Drink, end, reload and remove consumed items through the real sheet controls.

python3 tests/consumable_lifecycle.py [artifact-directory]
"""
import functools
import http.server
import json
import os
from pathlib import Path
import sys
import threading
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(sys.argv[1]) if len(sys.argv) > 1 else None
if OUT:
    OUT.mkdir(parents=True, exist_ok=True)

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=str(ROOT)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
checks = []
def check(name, got, want):
    checks.append(dict(name=name, got=got, want=want, ok=got == want))
    print(('ok  ' if got == want else 'FAIL'), name, repr(got), flush=True)

try:
    with sync_playwright() as p:
        browser = p.chromium.launch()
        for w, h in [(390, 844), (1250, 850)]:
            ctx = browser.new_context(viewport=dict(width=w, height=h), service_workers='block')
            pg = ctx.new_page()
            pg.set_default_timeout(180000)
            errors = []
            pg.on('pageerror', lambda e: errors.append(str(e)))
            fixture = (ROOT / 'tests/fixtures/yudhi-v3.json').read_text()
            ctx.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");")
            pg.goto('http://127.0.0.1:%s/index.html' % srv.server_port)
            pg.wait_for_function('()=>!!window.__deferDone')
            pg.locator('[data-hview]').first.click()
            pg.evaluate('''async()=>{await __bldNeed();const b=__bldQuickFor('Wizard',4);
                b.name='Consumable lifecycle';b.cid='';b.inv=[{n:'Potion of Flying',q:2,eq:false}];
                __bldTestSet(b);__sheetSoft(__bldSheetFor(b));}''')
            prefix = '%sx%s ' % (w, h)
            button = '[data-fxt="consumed-flying"]'
            fly = "()=>!!(__sheetState().C.moves||[]).find(x=>x.m==='fly'&&x.v===__sheetState().C.speed)"
            qty = "()=>+(__bldTestB().inv.find(x=>x.n==='Potion of Flying')||{}).q"
            check(prefix+'inactive before drinking', pg.evaluate(fly), False)
            check(prefix+'Drink control', pg.locator(button).inner_text().startswith('Drink:'), True)
            pg.locator(button).click()
            check(prefix+'exactly one bottle spent', pg.evaluate(qty), 1)
            check(prefix+'flight activated', pg.evaluate(fly), True)
            check(prefix+'Fly appears in the speed panel', 'Fly, ft' in pg.locator('#speeds').inner_text(), True)
            pg.evaluate("()=>{const c=structuredClone(__sheetState().C);c.speeds={fly:{v:60,s:'Other flight'}};__sheetSoft(c)}")
            check(prefix+'stronger legacy flight wins', pg.locator('#speeds .sense').filter(has_text='Fly, ft').inner_text().startswith('60'), True)
            pg.evaluate("()=>{const c=structuredClone(__sheetState().C);delete c.speeds;c.moves.push({m:'fly',v:20,s:'Slow'},{m:'fly',v:50,s:'Fast'});__sheetSoft(c)}")
            check(prefix+'several sources render one mode', pg.locator('#speeds .sense').filter(has_text='Fly, ft').count(), 1)
            check(prefix+'greatest new flight wins', pg.locator('#speeds .sense').filter(has_text='Fly, ft').locator('.bonus').inner_text(), '50')
            pg.evaluate('()=>__bldFxToggle(null)')
            check(prefix+'duplicate activation refused', pg.evaluate("()=>__bldConsume('consumed-flying')"), False)
            check(prefix+'duplicate does not spend', pg.evaluate(qty), 1)
            pg.locator(button).click()
            check(prefix+'ending removes flight', pg.evaluate(fly), False)
            check(prefix+'Fly leaves the speed panel', 'Fly, ft' in pg.locator('#speeds').inner_text(), False)
            check(prefix+'ending does not refund', pg.evaluate(qty), 1)
            pg.locator(button).click()
            check(prefix+'last bottle spent', pg.evaluate(qty), 0)
            check(prefix+'zero stock flight remains', pg.evaluate(fly), True)
            pg.evaluate('()=>__sheetApply(__bldSheetFor(__bldTestB()),false)')
            check(prefix+'Apply preserves consumed flight', pg.evaluate(fly), True)
            check(prefix+'inventory row can be removed', pg.evaluate("()=>__bldSync('Potion of Flying',__sheetState().C.name,{del:1})"), True)
            pg.evaluate('()=>__bldFxToggle(null)')
            check(prefix+'no row flight remains', pg.evaluate(fly), True)
            pg.wait_for_timeout(700)
            pg.reload()
            pg.wait_for_function('()=>!!window.__deferDone')
            pg.locator('[data-hview]').first.click()
            pg.evaluate('async()=>{await __bldNeed()}')
            check(prefix+'reload preserves active state', pg.evaluate("()=>__sheetState().fxT['consumed-flying']"), True)
            check(prefix+'reload preserves flight', pg.evaluate(fly), True)
            check(prefix+'reload keeps inventory empty', pg.evaluate("()=>__bldTestB().inv.some(x=>x.n==='Potion of Flying')"), False)
            if OUT:
                pg.locator(button).scroll_into_view_if_needed()
                pg.screenshot(path=str(OUT / (prefix.strip()+'-active.png')), full_page=True)
            pg.locator(button).click()
            check(prefix+'end after reload removes flight', pg.evaluate(fly), False)
            check(prefix+'empty inactive control disappears', pg.locator(button).count(), 0)
            check(prefix+'cannot drink nonexistent stock', pg.evaluate("()=>__bldConsume('consumed-flying')"), False)
            check(prefix+'unknown consumable refused', pg.evaluate("()=>__bldConsume('missing-effect')"), False)
            pg.wait_for_timeout(700)
            if OUT:
                storage = pg.evaluate('()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))')
                (OUT / (prefix.strip()+'-storage.json')).write_text(json.dumps(storage, indent=2))
            check(prefix+'no page errors', errors, [])
            ctx.close()
        browser.close()
finally:
    srv.shutdown()
if OUT:
    (OUT / 'result.json').write_text(json.dumps(checks, indent=2))
failed = sum(not c['ok'] for c in checks)
print('%s checks, %s failed' % (len(checks), failed))
sys.exit(bool(failed))
