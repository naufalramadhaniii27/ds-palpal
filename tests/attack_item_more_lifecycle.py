#!/usr/bin/env python3
"""Actual typed weapon rolls and paid Eldritch/Cinnabar extra damage."""
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
 page.wait_for_function('()=>!!window.__deferDone');page.locator('[data-hview]').first.click();page.wait_for_function('()=>!!window.__miRoll');page.evaluate('async()=>{await __bldNeed();crypto.getRandomValues=a=>{a.fill(5);return a}}')
def install(page,name):
 return page.evaluate("""name=>{const b=__bldQuickFor('Fighter',4);b.src=Object.fromEntries(WX.src.map(s=>[s.id,true]));b.name='More weapon lifecycles';b.cid='';b.inv=[{n:name,q:1,eq:true,attuned:true},{n:'Longsword',q:1,eq:true},{n:'Staff of Withering',q:1,eq:true,attuned:false}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));__bldSync(name,b.name,{q:1});const c=__sheetState().C;return c.attacks.findIndex(a=>a.n===name)}""",name)
def close(page):page.locator('#sheet [data-close]').click()
def used(page,key):
 return page.evaluate("""key=>new Set([...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key&&x.getAttribute('aria-pressed')==='true').map(x=>x.getAttribute('data-i'))).size""",key)
def set_used(page,key,value):
 page.evaluate("""({key,value})=>{const boxes=[...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key),at=i=>boxes.find(x=>+x.getAttribute('data-i')===i);if(value)at(value-1).click();else {at(0).click();if(at(0).getAttribute('aria-pressed')==='true')at(0).click()}}""",dict(key=key,value=value))
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for width,height in [(390,844),(1250,850)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',service_workers='block');page=ctx.new_page();page.set_default_timeout(180000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text();ctx.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");")
   page.goto('http://127.0.0.1:%s/index.html'%srv.server_port);ready(page);prefix=str(width)+' '
   for name,target,dtype,extra_count in [('Ruinblade','Undead','Force',1),('Dragon Thighbone Club','Dragon','Bludgeoning',2)]:
    index=install(page,name)
    for wrong in ['', 'Object', 'Fiend']:
     page.locator('[data-atarget="type"]').select_option(wrong);page.wait_for_function("""({name})=>!(__sheetState().C.attacks.find(a=>a.n===name).xdice||[]).some(x=>x.roll)""",arg=dict(name=name));check(prefix+name+' no rider '+repr(wrong),page.locator('[data-bd="ad-%s"]'%index).get_attribute('data-damage-parts'),None)
    page.locator('[data-atarget="type"]').select_option(target);page.wait_for_function("""name=>(__sheetState().C.attacks.find(a=>a.n===name).xdice||[]).some(x=>x.roll)""",arg=name)
    parts=json.loads(page.locator('[data-bd="ad-%s"]'%index).get_attribute('data-damage-parts'));check(prefix+name+' typed packet exists',any(x['type']==dtype for x in parts),True);other=page.evaluate("()=>__sheetState().C.attacks.findIndex(a=>a.n==='Longsword')");check(prefix+name+' unrelated weapon unchanged',page.locator('[data-bd="ad-%s"]'%other).get_attribute('data-damage-parts'),None)
    page.locator('[data-bd="ad-%s"]'%index).click();page.locator('.mi-roll [data-mr=""]').click();normal=page.evaluate('()=>document.querySelector(".mi-rres").__r');page.locator('.mi-roll [data-mr="crit"]').click();critical=page.evaluate('()=>document.querySelector(".mi-rres").__r');n=next(x for x in normal['damageParts'] if x['type']==dtype);c=next(x for x in critical['damageParts'] if x['type']==dtype)
    expected=extra_count+(1 if name=='Dragon Thighbone Club' else 0);check(prefix+name+' actual normal dice',len(n['dice']),expected);check(prefix+name+' actual critical dice',len(c['dice']),2*expected);check(prefix+name+' all actual d8 faces',[*n['dice'],*c['dice']],[6]*(3*expected));check(prefix+name+' typed totals preserved',normal['v'],sum(x['value'] for x in normal['damageParts']));check(prefix+name+' critical flat preserved',critical['v']-normal['v'],sum(sum(x['dice']) for x in normal['damageParts']))
    if OUT:page.screenshot(path=str(OUT/('more-target-%s-%s.png'%(name.replace(' ','-'),width))))
    close(page)
    page.wait_for_function("""({name,target})=>{const c=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}'),b=JSON.parse(localStorage.getItem('phb24-builder-v1')||'{}'),s=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}');return c.name==='More weapon lifecycles'&&b.inv[0].n===name&&c.inv[0].key===name&&s.attackTarget&&s.attackTarget.type===target}""",arg=dict(name=name,target=target));page.reload();ready(page);check(prefix+name+' cold target retained',page.evaluate('()=>__sheetState().attackTarget.type'),target);check(prefix+name+' cold rolled rider retained',page.evaluate("""name=>(__sheetState().C.attacks.find(a=>a.n===name).xdice||[]).some(x=>x.roll)""",name),True)
   page.evaluate("""()=>{window.__moreRolls=[];const old=__miRoll.roll;__miRoll.roll=(x,m,n,cb)=>old(x,m,n,r=>{__moreRolls.push({input:x,mode:m,result:r});cb(r)})}""")
   for name,faces,dtype,costs in [('Eldritch Staff',8,'Lightning',[1,3]),('Cinnabar Rapier',4,'Poison',[1,10])]:
    index=install(page,name);spec=page.evaluate("""name=>__sheetState().C.attacks.find(a=>a.n===name).spendDice[0]""",name);key=spec['poolKey'];other=page.evaluate("()=>__sheetState().C.res.find(r=>r.item&&r.f==='Staff of Withering').k");set_used(page,other,0);check(prefix+name+' native pool bound',page.evaluate("""({name,key})=>__sheetState().C.inv.find(x=>x.key===name).chargeKey===key""",dict(name=name,key=key)),True);check(prefix+name+' no automatic dice',page.locator('[data-bd="ad-%s"]'%index).get_attribute('data-damage-parts'),None)
    for i,cost in enumerate(costs):
     set_used(page,key,0);page.evaluate('()=>__sheetRerender()');page.locator('[data-ard="%s"]'%index).first.click();check(prefix+name+' open does not spend',used(page,key),0);page.locator('[data-ard-cost]').select_option(str(cost));page.locator('[data-ard-mode]').select_option('critical' if i else 'normal');count=page.evaluate('()=>__moreRolls.length');page.locator('[data-ard-roll]').click();page.wait_for_function('n=>__moreRolls.length===n+1',arg=count);r=page.evaluate('()=>__moreRolls.at(-1)');dice_count=cost*(2 if i else 1);check(prefix+name+' actual expression '+str(cost),r['input']['dmg'],str(cost)+'d'+str(faces));check(prefix+name+' actual type '+str(cost),r['result']['dt'],dtype);check(prefix+name+' actual dice count '+str(cost),len(r['result']['d'].split(']')[0].lstrip('[').split(', ')),dice_count);check(prefix+name+' actual total '+str(cost),r['result']['v'],(6 if faces==8 else 2)*dice_count);check(prefix+name+' exact charge cost '+str(cost),used(page,key),cost);check(prefix+name+' unrelated pool unchanged',used(page,other),0)
     if OUT:page.screenshot(path=str(OUT/('more-charge-%s-%s-%s.png'%(name.replace(' ','-'),cost,width))))
     close(page);check(prefix+name+' closing no refund',used(page,key),cost)
    set_used(page,key,0);page.evaluate('()=>__sheetRerender()');page.locator('[data-ard="%s"]'%index).first.click();page.locator('[data-ard-cost]').select_option(str(costs[-1]));set_used(page,key,10);count=page.evaluate('()=>__moreRolls.length');page.locator('[data-ard-roll]').click();check(prefix+name+' exhausted pending popup no overdraw',used(page,key),10);check(prefix+name+' exhausted no roll',page.evaluate('()=>__moreRolls.length'),count);close(page);page.evaluate('()=>__sheetRerender()');check(prefix+name+' depleted disabled',page.locator('[data-ard="%s"]'%index).first.is_disabled(),True)
   check(prefix+'page errors',errors,[]);ctx.close()
  browser.close()
finally:srv.shutdown()
print(f'{sum(checks)}/{len(checks)} more-item checks passed');raise SystemExit(0 if all(checks) else 1)
