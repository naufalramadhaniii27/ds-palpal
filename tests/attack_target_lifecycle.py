#!/usr/bin/env python3
"""Target context, typed damage rolls, reload and ownership through real controls.

python3 tests/attack_target_lifecycle.py [artifact-directory]
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
            results=pg.evaluate("""async()=>{await __bldNeed();const checks=[];
              function test(n,v){checks.push([n,!!v])}
              function build(item,target){let b=__bldQuickFor('Fighter',4);b.inv=[{n:item,q:1,eq:true,att:true},{n:'Longsword',q:1,eq:true}];return __bldSheetFor(b,{},target||{})}
              function row(c,n){return c.attacks.find(a=>a.n===n)}
              for(const type of ['Humanoid','Celestial']){const c=build('Ebonbane',{type});test('Ebonbane '+type,row(c,'Ebonbane').xdice[0].d==='3d6');test('separate weapon '+type,!row(c,'Longsword').xdice);const d=__deriveFor(c);test('typed packets '+type,d.atk[1].damageParts.length===2&&d.atk[1].damageParts[1].type==='Necrotic')}
              for(const type of ['','Object','Undead'])test('Ebonbane excluded '+type,!row(build('Ebonbane',{type}),'Ebonbane').xdice);
              for(const [target,count] of [[{},0],[{type:'Creature',alignment:'Good'},1],[{type:'Creature',hp:1,maxHp:10},1],[{type:'Creature',alignment:'Good',hp:1,maxHp:10},2],[{type:'Object',alignment:'Good',hp:1,maxHp:10},0],[{type:'Creature',hp:10,maxHp:10},0],[{type:'Creature',hp:0,maxHp:10},1]])test('Ranseur '+JSON.stringify(target),(row(build('Ranseur of Torture',target),'Ranseur of Torture').xdice||[]).length===count);
              test('Kas Undead',row(build('Sword of Kas',{type:'Undead'}),'Sword of Kas').xdice[0].t==='Slashing');
              test('Kas other',!row(build('Sword of Kas',{type:'Humanoid'}),'Sword of Kas').xdice);
              test('Kas critical',row(build('Sword of Kas',{}),'Sword of Kas').critRange===19);
              for(const [tags,bonus,dice] of [[[],1,1],[['cult-enemy'],2,2]]){let c=build('Dragontooth Dagger',{tags}),a=row(c,'Dragontooth Dagger');test('Dagger bonus '+tags,a.misc===bonus&&a.dmgBonus===bonus);test('Dagger dice '+tags,a.xdice.length===dice);test('Dagger packets '+tags,__deriveFor(c).atk[1].damageParts.length===2)}
              for(const [t,yes] of [[{type:'Creature',alignment:'Good'},true],[{type:'Object',alignment:'Good'},false],[{type:'Creature',alignment:'Evil'},false]])test('Tower '+JSON.stringify(t),!!row(build('Wrought-Iron Tower',t),'Wrought-Iron Tower').xdice===yes);
              let b=__bldQuickFor('Fighter',4);b.name='Attack target lifecycle';b.cid='';b.inv=[{n:'Ebonbane',q:1,eq:true,att:true}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));__bldSync('Ebonbane',b.name,{q:1});return checks;}""")
            for name,ok in results:check(str(w)+' '+name,ok,True)
            select=pg.locator('[data-atarget="type"]')
            check(str(w)+' target control visible',select.is_visible(),True)
            select.select_option('Humanoid')
            pg.wait_for_function("()=>!!(__sheetState().C.attacks.find(a=>a.n==='Ebonbane').xdice)")
            check(str(w)+' stored target',pg.evaluate("()=>__sheetState().attackTarget.type"),'Humanoid')
            pg.wait_for_function('()=>!!window.__miRoll')
            rolls=pg.evaluate("""()=>{const saved=crypto.getRandomValues;crypto.getRandomValues=a=>{a.fill(0);return a};try{const el=document.querySelector('[data-bd="ad-1"]'),parts=JSON.parse(el.getAttribute('data-damage-parts')),expr=parts.map(x=>x.expr).join('+');const normal=__miRoll.roll({dmg:expr,damageParts:parts},'','Target test');const crit=__miRoll.roll({dmg:expr,damageParts:parts},'crit','Target critical test');const clamped=__miRoll.roll({dmg:'1d4-9+1d6',damageParts:[{expr:'1d4-9',type:'Slashing'},{expr:'1d6',type:'Fire'}]},'','Clamp test');crypto.getRandomValues=a=>{a.fill(18);return a};const expanded=__miRoll.roll({bon:3,critAt:19},'','Expanded critical');return {normal,crit,clamped,expanded}}finally{crypto.getRandomValues=saved}}""")
            check(str(w)+' damage types preserved',[x['type'] for x in rolls['normal']['damageParts']],['Slashing','Necrotic'])
            check(str(w)+' critical doubles rider dice',len(rolls['crit']['damageParts'][1]['dice']),6)
            check(str(w)+' critical flat bonus unchanged',rolls['crit']['v']-rolls['normal']['v'],4)
            check(str(w)+' per type minimum',rolls['clamped']['v'],1)
            check(str(w)+' expanded critical natural',rolls['expanded']['nat'],19)
            check(str(w)+' expanded critical recognized',rolls['expanded']['critical'],True)
            check(str(w)+' 19 remains a d20',rolls['expanded']['k'],'d20')
            pg.locator('[data-bd="ad-1"]').click()
            pg.locator('.mi-roll [data-mr=""]').click()
            pg.wait_for_function("()=>!!document.querySelector('.mi-rres').__r")
            check(str(w)+' damage button typed result',pg.evaluate("()=>document.querySelector('.mi-rres').__r.damageParts.map(x=>x.type)"),['Slashing','Necrotic'])
            pg.locator('.mi-roll [data-mr="crit"]').click()
            check(str(w)+' critical button rider dice',pg.evaluate("()=>document.querySelector('.mi-rres').__r.damageParts[1].dice.length"),6)
            pg.locator('.mi-roll [data-mrself]').click()
            pg.locator('[data-mrin]').fill('12')
            pg.locator('[data-mrok]').click()
            check(str(w)+' manual mixed damage types',pg.evaluate("()=>document.querySelector('.mi-rres').__r.dt"),'Slashing + Necrotic')
            check(str(w)+' manual mixed damage total',pg.evaluate("()=>document.querySelector('.mi-rres').__r.v"),12)
            pg.locator('#sheet [data-close]').click()
            select.select_option('Object')
            pg.wait_for_function("()=>!__sheetState().C.attacks.find(a=>a.n==='Ebonbane').xdice")
            pg.reload();pg.wait_for_function('()=>!!window.__deferDone')
            check(str(w)+' persisted target',pg.evaluate("()=>__sheetState().attackTarget.type"),'Object')
            pg.locator('[data-hview]').first.click()
            pg.locator('[data-atarget="type"]').select_option('Humanoid')
            pg.wait_for_function("()=>!!__sheetState().C.attacks.find(a=>a.n==='Ebonbane').xdice")
            check(str(w)+' reload controls rebuild target',pg.evaluate("()=>__sheetState().attackTarget.type"),'Humanoid')
            check(str(w)+' page errors',errors,[])
            if OUT:
                pg.locator('.fxt-target').scroll_into_view_if_needed()
                pg.screenshot(path=str(OUT/('attack-target-%s.png'%w)),full_page=True)
                pg.locator('[data-bd="ad-1"]').scroll_into_view_if_needed()
                pg.screenshot(path=str(OUT/('attack-damage-%s.png'%w)),full_page=True)
            isolated=pg.evaluate("""()=>{const b=__bldTestB();b.name='Different target owner';b.cid='different-target-owner';return !__bldSheetFor(b).attacks.find(a=>a.n==='Ebonbane').xdice}""")
            check(str(w)+' target does not leak to another character',isolated,True)
            pg.evaluate("""()=>{let b=__bldQuickFor('Fighter',4);b.name='Attack target lifecycle';b.cid='';b.inv=[{n:'Ranseur of Torture',q:1,eq:true}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));}""")
            pg.locator('[data-atarget="type"]').select_option('Creature')
            pg.locator('[data-atarget="alignment"]').select_option('Good')
            pg.locator('[data-atarget="hp"]').fill('1')
            pg.locator('[data-atarget="hp"]').press('Tab')
            pg.locator('[data-atarget="maxHp"]').fill('10')
            pg.locator('[data-atarget="maxHp"]').press('Tab')
            pg.wait_for_function("()=>__sheetState().C.attacks[1].xdice.length===2")
            cell=pg.locator('[data-bd="ad-1"]');cell.scroll_into_view_if_needed()
            check(str(w)+' long mixed damage fits cell',cell.evaluate('(el)=>el.scrollWidth<=el.clientWidth+1'),True)
            if OUT:pg.screenshot(path=str(OUT/('attack-ranseur-%s.png'%w)),full_page=True)
            for item,target,dtype,normal_dice in [('Mace of Disruption','Fiend','Radiant',2),('Azuredge','Undead','Radiant',2),('Flayer Slayer','Aberration','Slashing',2)]:
                pg.evaluate("""item=>{const b=__bldQuickFor('Fighter',4);b.name='U23 target lifecycle';b.cid='';b.inv=[{n:item,q:1,eq:true,attuned:true},{n:'Longsword',q:1,eq:true}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));__bldSync(item,b.name,{q:1})}""",item)
                pg.locator('[data-atarget="type"]').select_option(target)
                pg.wait_for_function("()=>!!__sheetState().C.attacks[1].xdice")
                pg.locator('[data-bd="ad-1"]').click();pg.locator('.mi-roll [data-mr=""]').click()
                result=pg.evaluate("()=>document.querySelector('.mi-rres').__r.damageParts")
                part=next(x for x in result if x['type']==dtype)
                check(str(w)+' '+item+' normal typed dice',len(part['dice']),normal_dice)
                pg.locator('.mi-roll [data-mr="crit"]').click()
                result=pg.evaluate("()=>document.querySelector('.mi-rres').__r.damageParts")
                check(str(w)+' '+item+' critical typed dice',len(next(x for x in result if x['type']==dtype)['dice']),normal_dice*2)
                check(str(w)+' '+item+' separate weapon',pg.evaluate("()=>!__sheetState().C.attacks[2].xdice"),True)
                pg.locator('#sheet [data-close]').click();pg.locator('[data-atarget="type"]').select_option('Humanoid')
                check(str(w)+' '+item+' wrong target removed',pg.evaluate("()=>!__sheetState().C.attacks[1].xdice"),True)
            pg.evaluate("""()=>{const b=__bldQuickFor('Fighter',4);b.name='U23 light lifecycle';b.cid='';b.inv=[{n:'Lightbringer',q:1,eq:true}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));__bldSync('Lightbringer',b.name,{q:1})}""")
            pg.locator('[data-atarget="type"]').select_option('Undead')
            check(str(w)+' unlit Lightbringer no rider',pg.evaluate("()=>!__sheetState().C.attacks[1].xdice"),True)
            pg.locator('[data-fxt="lightbringer-glow"]').click();pg.wait_for_function("()=>!!__sheetState().C.attacks[1].xdice")
            pg.locator('[data-bd="ad-1"]').click();pg.locator('.mi-roll [data-mr="crit"]').click()
            check(str(w)+' glowing Lightbringer critical',pg.evaluate("()=>document.querySelector('.mi-rres').__r.damageParts.find(p=>p.type==='Radiant').dice.length"),2)
            pg.locator('#sheet [data-close]').click();pg.locator('[data-atarget="type"]').select_option('Fiend')
            check(str(w)+' glowing Lightbringer wrong target',pg.evaluate("()=>!__sheetState().C.attacks[1].xdice"),True)
            pg.locator('[data-atarget="type"]').select_option('Undead')
            # Wait for the real debounced state AND sheet writes before reload.
            pg.wait_for_function("""()=>{const s=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}'),c=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}');return s.fxT&&s.fxT['lightbringer-glow']===true&&s.attackTarget.type==='Undead'&&c.name==='U23 light lifecycle'&&!!c.attacks[1].xdice}""",timeout=10000)
            pg.reload();pg.wait_for_function('()=>!!window.__deferDone')
            pg.locator('[data-hview]').first.click()
            check(str(w)+' glow and target survive reload',pg.evaluate("()=>__sheetState().fxT['lightbringer-glow']===true&&__sheetState().attackTarget.type==='Undead'&&!!__sheetState().C.attacks[1].xdice"),True)
            pg.locator('[data-fxt="lightbringer-glow"]').click();pg.wait_for_function("()=>!__sheetState().C.attacks[1].xdice")
            check(str(w)+' stop glowing after cold reload',pg.evaluate("()=>__sheetState().fxT['lightbringer-glow']===false"),True)
            check(str(w)+' no new rider page errors',errors,[])
            ctx.close()
        browser.close()
finally:
    srv.shutdown()
failed=[x for x in checks if not x['ok']]
print('%s checks, %s failed'%(len(checks),len(failed)))
sys.exit(bool(failed))
