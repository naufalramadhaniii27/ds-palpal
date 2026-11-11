#!/usr/bin/env python3
"""Consumed unarmed extra damage through the real roll and cold reload controls.

python3 tests/rolled_rider_lifecycle.py [artifact-directory]
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
        browser=p.chromium.launch()
        for w,h in [(390,844),(1250,850)]:
            ctx=browser.new_context(viewport=dict(width=w,height=h),service_workers='block',reduced_motion='reduce')
            pg=ctx.new_page();pg.set_default_timeout(180000)
            errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
            fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text()
            ctx.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");")
            pg.goto('http://127.0.0.1:%s/index.html'%srv.server_port)
            pg.wait_for_function('()=>!!window.__deferDone')
            pg.locator('[data-hview]').first.click()
            pg.evaluate("""async()=>{await __bldNeed();const b=__bldQuickFor('Fighter',4);b.name='Rolled potion lifecycle';b.cid='';b.inv=[{n:'Potion of Pugilism',q:1,eq:false},{n:'Longsword',q:1,eq:true}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b));__bldSync('Potion of Pugilism',b.name,{q:1});}""")
            prefix=str(w)+' '
            button=pg.locator('[data-fxt="consumed-pugilism"]')
            check(prefix+'inactive damage has no packets',pg.locator('[data-bd="ad-0"]').get_attribute('data-damage-parts'),None)
            button.click()
            pg.wait_for_function("()=>!!__sheetState().C.attacks[0].xdice")
            check(prefix+'bottle spent',pg.evaluate("()=>__bldTestB().inv.find(x=>x.n==='Potion of Pugilism').q"),0)
            parts=json.loads(pg.locator('[data-bd="ad-0"]').get_attribute('data-damage-parts'))
            check(prefix+'unarmed Force packet',parts[1]['type'],'Force')
            check(prefix+'separate weapon unchanged',pg.locator('[data-bd="ad-1"]').get_attribute('data-damage-parts'),None)
            pg.locator('[data-bd="ad-0"]').click()
            check(prefix+'roll expression includes flat base',pg.evaluate("()=>document.querySelector('.mi-roll').__spec.dmg"),'+'.join(x['expr'] for x in parts))
            pg.locator('.mi-roll [data-mr=""]').click()
            normal=pg.evaluate("()=>document.querySelector('.mi-rres').__r")
            check(prefix+'normal extra die rolled',len(normal['damageParts'][1]['dice']),1)
            check(prefix+'normal total retains both types',normal['v'],sum(x['value'] for x in normal['damageParts']))
            pg.locator('.mi-roll [data-mr="crit"]').click()
            critical=pg.evaluate("()=>document.querySelector('.mi-rres').__r")
            check(prefix+'critical doubles Force die',len(critical['damageParts'][1]['dice']),2)
            check(prefix+'critical leaves base flat unchanged',critical['damageParts'][0]['value'],normal['damageParts'][0]['value'])
            pg.locator('#sheet [data-close]').click()
            pg.wait_for_timeout(700)
            pg.reload();pg.wait_for_function('()=>!!window.__deferDone')
            pg.locator('[data-hview]').first.click()
            check(prefix+'reload keeps Force packet',json.loads(pg.locator('[data-bd="ad-0"]').get_attribute('data-damage-parts'))[1]['type'],'Force')
            # No explicit builder warm-up: ending a persisted effect must load it.
            pg.locator('[data-fxt="consumed-pugilism"]').click()
            pg.wait_for_function("()=>!__sheetState().C.attacks[0].xdice")
            check(prefix+'ending removes rolled packet',pg.locator('[data-bd="ad-0"]').get_attribute('data-damage-parts'),None)
            check(prefix+'ending does not refund',pg.evaluate("()=>__bldTestB().inv.find(x=>x.n==='Potion of Pugilism').q"),0)
            check(prefix+'ended empty control disappears',pg.locator('[data-fxt="consumed-pugilism"]').count(),0)
            check(prefix+'page errors',errors,[])
            if OUT:pg.screenshot(path=str(OUT/('rolled-potion-%s.png'%w)),full_page=True)
            ctx.close()
        browser.close()
finally:
    srv.shutdown()
failed=[x for x in checks if not x['ok']]
print('%s checks, %s failed'%(len(checks),len(failed)))
sys.exit(bool(failed))
