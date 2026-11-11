#!/usr/bin/env python3
"""Real weapon resource controls, source lifetimes, and saved expenditure."""
import functools,http.server,threading,json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[1]) if len(sys.argv)>1 else None
if OUT:OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start();checks=[]
def check(name,got,want):
 checks.append(got==want);print(('ok ' if got==want else 'FAIL ')+name,repr(got),flush=True)
def ready(page):
 page.wait_for_function('()=>!!window.__deferDone');page.locator('[data-hview]').first.click();page.evaluate('async()=>{await __bldNeed()}');page.wait_for_function('()=>!!window.__miRoll')
 page.evaluate("""()=>{window.__ardRolls=[];const old=__miRoll.roll;__miRoll.roll=(x,m,n,cb)=>old(x,m,n,r=>{__ardRolls.push({input:x,mode:m,result:r});cb(r)});crypto.getRandomValues=a=>{a.fill(5);return a}}""")
def install(page,name):
 page.evaluate("""name=>{const b=__bldQuickFor('Wizard',4);b.name='Weapon resource lifecycle';b.cid='';b.inv=[{n:name,q:1,eq:true,attuned:true},{n:'Staff of Withering',q:1,eq:true,attuned:false},{n:'Longsword',q:1,eq:true}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b));__bldSync(name,b.name,{q:1})}""",name)
 return page.evaluate("""name=>{const c=__sheetState().C,a=c.attacks.find(x=>x.n===name);return {index:c.attacks.indexOf(a),spec:a.spendDice[0],resources:c.res}}""",name)
def used(page,key):
 return page.evaluate("""key=>new Set([...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key&&x.getAttribute('aria-pressed')==='true').map(x=>x.getAttribute('data-i'))).size""",key)
def set_used(page,key,value):
 page.evaluate("""({key,value})=>{const boxes=[...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key),at=i=>boxes.find(x=>+x.getAttribute('data-i')===i);if(value)at(value-1).click();else {at(0).click();if(at(0).getAttribute('aria-pressed')==='true')at(0).click()}}""",dict(key=key,value=value))
def open_bonus(page,index):page.locator('[data-ard="%s"]'%index).first.click()
def close(page):page.locator('#sheet [data-close]').click()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for width,height in [(390,844),(1250,850)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',service_workers='block');page=context.new_page();page.set_default_timeout(180000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text();context.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");")
   page.goto('http://127.0.0.1:%s/index.html'%srv.server_port);ready(page);prefix=str(width)+' '
   rows=page.evaluate("""()=>{const out=[],test=(n,v)=>out.push([n,!!v]);function build(n,on,cls='Wizard',eq=true,q=1){const b=__bldQuickFor(cls,4);b.inv=[{n,q,eq,attuned:on},{n:'Longsword',q:1,eq:true}];return __bldSheetFor(b)}
    for(const [name,bonus] of [['Staff of Striking',3],['Staff of Thunder and Lightning',2],['Staff of Withering',0],['Staff of Power',2]])for(const on of [false,true]){const c=build(name,on),a=c.attacks.find(x=>x.n===name),other=c.attacks.find(x=>x.n==='Longsword');test(name+' physical profile '+on,!!a&&a.die==='1d6');test(name+' bonus '+on,a&&a.misc===(on?bonus:0));test(name+' no automatic rider '+on,a&&!a.xdice);test(name+' no leakage '+on,other&&!other.spendDice&&!other.xdice&&other.misc===0);if(name==='Staff of Striking'||name==='Staff of Thunder and Lightning')test(name+' spend eligibility '+on,!!(a&&a.spendDice)===on);test(name+' stowed no weapon '+on,!build(name,on,'Wizard',false).attacks.some(x=>x.n===name));test(name+' zero no weapon '+on,!build(name,on,'Wizard',true,0).attacks.some(x=>x.n===name));const resource=c.res.find(x=>x.item&&x.f===name);if(resource)test(name+' native pool binding '+on,resource.invIndex===0&&c.inv[0].chargeKey===resource.k)}
    const c=build('Staff of Power',true,'Fighter');test('Power caster prerequisite',!c.inv[0].attunedActive&&c.attacks.find(x=>x.n==='Staff of Power').misc===0);
    const b=__bldQuickFor('Wizard',4);b.inv=[{n:'Staff of Striking',q:1,eq:true,attuned:false},{n:'Staff of Striking',q:1,eq:true,attuned:true}];const d=__bldSheetFor(b),a=d.attacks.find(x=>x.n==='Staff of Striking');test('duplicate binds active copy only',a.spendDice.length===1&&a.spendDice[0].poolKey===d.inv[1].chargeKey&&d.inv[0].chargeKey!==d.inv[1].chargeKey);return out}""")
   for name,value in rows:check(prefix+name,value,True)
   f=install(page,'Staff of Striking');index=f['index'];key=f['spec']['poolKey'];other=next(r['k'] for r in f['resources'] if r.get('item') and r['f']=='Staff of Withering');set_used(page,key,0);set_used(page,other,0);hp=page.locator('#hpChipV').inner_text()
   for cost,critical in [(1,False),(2,False),(3,False),(2,True)]:
    before=used(page,key);open_bonus(page,index);check(prefix+'popup owns controls',page.locator('#sheet .mi-roll').count(),0);check(prefix+'open does not spend',used(page,key),before);page.locator('[data-ard-cost]').select_option(str(cost));page.locator('[data-ard-mode]').select_option('critical' if critical else 'normal');count=page.evaluate('()=>__ardRolls.length');page.locator('[data-ard-roll]').click();page.wait_for_function('n=>__ardRolls.length===n+1',arg=count);r=page.evaluate('()=>__ardRolls.at(-1)');check(prefix+'roll expression '+str((cost,critical)),r['input']['dmg'],str(cost)+'d6');check(prefix+'actual dice count '+str((cost,critical)),len(r['result']['d'].split(']')[0].lstrip('[').split(', ')),cost*(2 if critical else 1));check(prefix+'actual roll '+str((cost,critical)),r['result']['v'],6*cost*(2 if critical else 1));check(prefix+'exact cost '+str((cost,critical)),used(page,key),before+cost);check(prefix+'other pool untouched',used(page,other),0);page.evaluate('()=>document.querySelector("[data-ard-roll]").click()');check(prefix+'double click spends once',used(page,key),before+cost)
    if OUT:page.screenshot(path=str(OUT/('resource-%s-%s-%s.png'%(width,cost,critical))))
    close(page);check(prefix+'closing never refunds',used(page,key),before+cost)
   check(prefix+'extra damage does not change own HP',page.locator('#hpChipV').inner_text(),hp);open_bonus(page,index);check(prefix+'cost bounded to remaining',page.locator('[data-ard-cost] option').evaluate_all('(xs)=>xs.map(x=>x.value)'),['1','2']);close(page)
   set_used(page,key,0);open_bonus(page,index);page.locator('[data-ard-cost]').select_option('3');set_used(page,key,8);count=page.evaluate('()=>__ardRolls.length');page.locator('[data-ard-roll]').click();check(prefix+'insufficient blocks overdraft',used(page,key),8);check(prefix+'insufficient does not roll',page.evaluate('()=>__ardRolls.length'),count);close(page)
   set_used(page,key,10);page.evaluate('()=>__sheetRerender()');check(prefix+'empty disabled',page.locator('[data-ard="%s"]'%index).first.is_disabled(),True);check(prefix+'empty still has normal weapon',page.evaluate("()=>__sheetState().C.attacks.some(x=>x.n==='Staff of Striking')"),True);set_used(page,key,0);page.evaluate('()=>__sheetRerender()')
   for stale in ['attunement','owner','stowed']:
    f=install(page,'Staff of Striking');index=f['index'];key=f['spec']['poolKey'];set_used(page,key,0);open_bonus(page,index)
    if stale=='attunement':page.evaluate("()=>__bldSetAttuned('Staff of Striking',__sheetState().C.name,false,0)")
    elif stale=='owner':page.evaluate("()=>{const c=structuredClone(__sheetState().C);c.name='Other resource owner';__sheetSoft(c)}")
    else:page.evaluate("()=>__bldToggleEq('Staff of Striking',0)")
    count=page.evaluate('()=>__ardRolls.length');page.locator('[data-ard-roll]').click();check(prefix+stale+' stale refuses spend',used(page,key),0);check(prefix+stale+' stale refuses roll',page.evaluate('()=>__ardRolls.length'),count);close(page)
   f=install(page,'Staff of Striking');index=f['index'];key=f['spec']['poolKey'];set_used(page,key,0);open_bonus(page,index);page.locator('[data-ard-cost]').select_option('3');page.locator('[data-ard-roll]').click();page.wait_for_function("()=>document.querySelector('[data-ard-result]').textContent.includes('Resource spent.')");close(page)
   page.wait_for_function("""key=>{const c=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}'),b=JSON.parse(localStorage.getItem('phb24-builder-v1')||'{}'),s=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}');return c.name==='Weapon resource lifecycle'&&b.name===c.name&&s.used&&s.used[key]===3}""",arg=key)
   page.reload();ready(page);check(prefix+'reload keeps charge spent',used(page,key),3);check(prefix+'reload keeps binding',page.evaluate("()=>{const c=__sheetState().C;return c.inv[0].chargeKey===c.attacks.find(x=>x.n==='Staff of Striking').spendDice[0].poolKey}"),True)
   f=install(page,'Staff of Thunder and Lightning');index=f['index'];key=f['spec']['poolKey'];daily=[r['k'] for r in f['resources'] if r.get('f')=='Staff of Thunder and Lightning']
   for k in daily:set_used(page,k,0)
   open_bonus(page,index);page.locator('[data-ard-roll]').click();page.wait_for_function("()=>document.querySelector('[data-ard-result]').textContent.includes('Resource spent.')");check(prefix+'Lightning rolls 2d6',page.evaluate('()=>__ardRolls.at(-1).input.dmg'),'2d6');check(prefix+'Lightning spends only own daily use',{k:used(page,k) for k in daily},{k:int(k==key) for k in daily});close(page);check(prefix+'Lightning exhausted disabled',page.locator('[data-ard="%s"]'%index).first.is_disabled(),True);check(prefix+'Lightning remains optional',page.evaluate("()=>!__sheetState().C.attacks.find(x=>x.n==='Staff of Thunder and Lightning').xdice"),True);check(prefix+'page errors',errors,[])
   if OUT:(OUT/('resource-storage-%s.json'%width)).write_text(json.dumps(page.evaluate('()=>Object.fromEntries(Object.keys(localStorage).map(k=>[k,localStorage.getItem(k)]))'),indent=2))
   context.close()
  browser.close()
finally:srv.shutdown()
print(f'{sum(checks)}/{len(checks)} resource damage checks passed');raise SystemExit(0 if all(checks) else 1)
