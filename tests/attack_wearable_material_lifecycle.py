#!/usr/bin/env python3
"""Wearable damage on every attack kind and explicit target-material controls."""
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
 page.evaluate("""()=>{window.__wearRolls=[];const old=__miRoll.roll;__miRoll.roll=(x,m,n,cb)=>old(x,m,n,r=>{__wearRolls.push({input:x,mode:m,result:r});if(cb)cb(r)})}""")
def install(page,name,species='Human',wizard=False):
 return page.evaluate("""({name,species,wizard})=>{const b=__bldQuickFor(wizard?'Wizard':'Fighter',4);b.src=Object.fromEntries(WX.src.map(s=>[s.id,true]));b.species=species;if(wizard)b.sp=['Fire Bolt'];b.name='Wearable and material lifecycle';b.cid='';b.inv=[{n:name,q:1,eq:true,attuned:true},{n:'Longsword',q:1,eq:true}];if(wizard)b.inv.push({n:'Longbow',q:1,eq:true});__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));__bldSync(name,b.name,{q:1});return __sheetState().C.attacks.map(a=>a.n)}""",dict(name=name,species=species,wizard=wizard))
def close(page):page.locator('#sheet [data-close]').click()
def used(page,key):return page.evaluate("""key=>new Set([...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key&&x.getAttribute('aria-pressed')==='true').map(x=>x.getAttribute('data-i'))).size""",key)
def set_used(page,key,value):page.evaluate("""({key,value})=>{const bs=[...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key),at=i=>bs.find(x=>+x.getAttribute('data-i')===i);if(value)at(value-1).click();else {at(0).click();if(at(0).getAttribute('aria-pressed')==='true')at(0).click()}}""",dict(key=key,value=value))
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for width,height in [(390,844),(1250,850)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',service_workers='block');page=ctx.new_page();page.set_default_timeout(180000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)));fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text();ctx.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");");page.goto('http://127.0.0.1:%s/index.html'%srv.server_port);ready(page);prefix=str(width)+' '
   for stage,maximum in [('Dormant',4),('Awakened',6),('Exalted',10)]:
    name="Cabal's Ruin ("+stage+")";names=install(page,name,wizard=True);key=page.evaluate('()=>__sheetState().C.inv[0].chargeKey');set_used(page,key,0)
    check(prefix+stage+' all attack kinds share cloak pool',page.evaluate("""key=>__sheetState().C.attacks.every(a=>a.spendDice.length===1&&a.spendDice[0].poolKey===key&&a.spendDice[0].item===__sheetState().C.inv[0].key)""",key),True)
    check(prefix+stage+' ordinary stats unaffected',page.evaluate("""()=>{const b=structuredClone(__bldTestB()),a=__sheetState().C.attacks.map(({spendDice,...r})=>r);b.inv[0].attuned=false;return JSON.stringify(a)===JSON.stringify(__bldSheetFor(b,{},{}).attacks)}"""),True)
    for attack,cost,critical in [('Unarmed Strike',1,False),('Longbow',1,False),('Fire Bolt',1,False),('Fire Bolt',maximum,True)]:
     if critical:set_used(page,key,0);page.evaluate('()=>__sheetRerender()')
     index=names.index(attack);before=used(page,key);page.locator('[data-ard="%s"]'%index).first.click();check(prefix+stage+' generic attack wording','After this attack hits, spend the selected resource and roll its extra damage.' in page.locator('[data-ard-box]').text_content(),True);page.locator('[data-ard-cost]').select_option(str(cost));page.locator('[data-ard-mode]').select_option('critical' if critical else 'normal');count=page.evaluate('()=>__wearRolls.length');page.locator('[data-ard-roll]').click();page.wait_for_function('n=>__wearRolls.length===n+1',arg=count);r=page.evaluate('()=>__wearRolls.at(-1)');check(prefix+stage+' '+attack+' actual dice '+str(cost),len(r['result']['d'].split(']')[0].lstrip('[').split(', ')),cost*(2 if critical else 1));check(prefix+stage+' '+attack+' Lightning total '+str(cost),(r['result']['dt'],r['result']['v']),('Lightning',6*cost*(2 if critical else 1)));check(prefix+stage+' '+attack+' exact same-pool cost '+str(cost),used(page,key),before+cost)
     if OUT and critical:page.screenshot(path=str(OUT/('wearable-'+stage+'-'+str(width)+'.png')))
     close(page)
    check(prefix+stage+' all attack controls depleted',page.locator('[data-ard]:not([disabled])').count(),0)
    for mode in ['attunement','stowed']:
     if mode=='stowed':page.evaluate('''name=>__bldSetAttuned(name,__sheetState().C.name,true,0)''',name)
     set_used(page,key,0);page.evaluate('()=>__sheetRerender()');page.locator('[data-ard="%s"]'%names.index('Fire Bolt')).first.click()
     if mode=='attunement':page.evaluate('''name=>__bldSetAttuned(name,__sheetState().C.name,false,0)''',name)
     else:page.evaluate('name=>__bldToggleEq(name,0)',name)
     count=page.evaluate('()=>__wearRolls.length');page.locator('[data-ard-roll]').click();check(prefix+stage+' stale '+mode+' prevents roll',page.evaluate('()=>__wearRolls.length'),count);close(page);check(prefix+stage+' '+mode+' removes all paid controls',page.locator('[data-ard]').count(),0)
   for name,species,tag,dtype,normal_dice in [('Direstone Dwarven Pick','Dwarf','stone-creature-or-object','Piercing',2),("Battlechef's Splendid Saucepan",'Human','metal-armor-or-metal-or-stone','Thunder',1)]:
    names=install(page,name,species);index=names.index(name);sel='[data-atarget="tag"][data-atarget-tag="'+tag+'"]';page.locator('[data-atarget="type"]').select_option('Object');check(prefix+name+' unmarked no rider',page.locator('[data-bd="ad-%s"]'%index).get_attribute('data-damage-parts'),None);page.locator(sel).check();page.wait_for_function("""name=>(__sheetState().C.attacks.find(a=>a.n===name).xdice||[]).some(x=>x.roll)""",arg=name);check(prefix+name+' unrelated sword unchanged',page.locator('[data-bd="ad-%s"]'%names.index('Longsword')).get_attribute('data-damage-parts'),None)
    page.locator('[data-bd="ad-%s"]'%index).click();page.locator('.mi-roll [data-mr=""]').click();normal=page.evaluate('()=>document.querySelector(".mi-rres").__r');page.locator('.mi-roll [data-mr="crit"]').click();crit=page.evaluate('()=>document.querySelector(".mi-rres").__r');n=next(x for x in normal['damageParts'] if x['type']==dtype);c=next(x for x in crit['damageParts'] if x['type']==dtype);check(prefix+name+' actual normal typed dice',len(n['dice']),normal_dice);check(prefix+name+' actual critical typed dice',len(c['dice']),normal_dice*2);check(prefix+name+' actual typed values',(n['value'],c['value']),(17,29) if dtype=='Piercing' else (2,4));check(prefix+name+' summed typed totals',crit['v'],sum(x['value'] for x in crit['damageParts']))
    if OUT:page.screenshot(path=str(OUT/('material-'+('pick' if species=='Dwarf' else 'saucepan')+'-'+str(width)+'.png')))
    close(page);page.wait_for_function("""({name,tag})=>{const c=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}'),b=JSON.parse(localStorage.getItem('phb24-builder-v1')||'{}'),s=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}');return c.inv[0].key===name&&b.inv[0].n===name&&(s.attackTarget.tags||[]).includes(tag)}""",arg=dict(name=name,tag=tag));page.reload();ready(page);check(prefix+name+' material checkbox cold retained',page.locator(sel).is_checked(),True);check(prefix+name+' typed rider cold retained',page.evaluate("""name=>(__sheetState().C.attacks.find(a=>a.n===name).xdice||[]).some(x=>x.roll)""",name),True);page.locator(sel).uncheck();page.wait_for_function("""name=>!(__sheetState().C.attacks.find(a=>a.n===name).xdice||[]).some(x=>x.roll)""",arg=name);check(prefix+name+' clearing material removes packet',page.locator('[data-bd="ad-%s"]'%index).get_attribute('data-damage-parts'),None)
   rows=page.evaluate("""()=>{const out=[];function build(species){const b=__bldQuickFor('Fighter',4);b.src=Object.fromEntries(WX.src.map(s=>[s.id,true]));b.species=species;b.inv=[{n:'Direstone Dwarven Pick',q:1,eq:true,attuned:true}];return __bldSheetFor(b,{}, {tags:['stone-creature-or-object']})}for(const species of ['Human','Dwarf']){const c=build(species),a=c.attacks.find(a=>a.n==='Direstone Dwarven Pick');out.push([species+' eligibility',c.inv[0].attunedActive=== (species==='Dwarf')&&a.misc===(species==='Dwarf'?2:0)&&!!a.xdice===(species==='Dwarf')])}const b=__bldQuickFor('Fighter',4);b.src=Object.fromEntries(WX.src.map(s=>[s.id,true]));b.inv=[{n:"Battlechef's Splendid Saucepan",q:1,eq:true,attuned:false}];const off=__bldSheetFor(b,{'saucepan-helmet':false},{}),on=__bldSheetFor(b,{'saucepan-helmet':true},{});out.push(['helmet +1 without heavy armor',__deriveFor(on).ac===__deriveFor(off).ac+1]);out.push(['helmet preserves +1 weapon',on.attacks.find(a=>a.n==="Battlechef's Splendid Saucepan").misc===1]);return out}""")
   for label,value in rows:check(prefix+label,value,True)
   check(prefix+'page errors',errors,[]);ctx.close()
  browser.close()
finally:srv.shutdown()
print(f'{sum(checks)}/{len(checks)} wearable/material checks passed');raise SystemExit(0 if all(checks) else 1)
