#!/usr/bin/env python3
"""Cinder Coat resolves melee delivery per hit, including dual and unknown attacks.
Use --casters-only for the focused armor-trained Wizard cases in both editions.
"""
import functools,http.server,threading,json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
CASTERS_ONLY='--casters-only' in sys.argv
ARGS=[a for a in sys.argv[1:] if a!='--casters-only']
OUT=Path(ARGS[0]) if ARGS else None
if OUT:OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start();checks=[]
def check(name,got,want):
 checks.append(got==want);print(('ok ' if got==want else 'FAIL ')+name,repr(got),flush=True)
def ready(page):
 page.wait_for_function('()=>!!window.__deferDone');page.locator('[data-hview]').first.click();page.wait_for_function('()=>!!window.__miRoll');page.evaluate('async()=>{await __bldNeed();crypto.getRandomValues=a=>{a.fill(5);return a}}');page.evaluate("""()=>{window.__kindRolls=[];window.__kindDelay=false;window.__kindPending=null;const old=__miRoll.roll;__miRoll.roll=(x,m,n,cb)=>old(x,m,n,r=>{__kindRolls.push({input:x,mode:m,result:r});const done=()=>{if(cb)cb(r)};if(__kindDelay)__kindPending=done;else done()})}""")
def install(page,cls='Fighter',edition='2024',spells=None,sub='',pole=False):
 return page.evaluate("""o=>{const b=__bldQuickFor(o.cls,4);b.src=Object.fromEntries(WX.src.map(s=>[s.id,true]));b.rs=o.edition;b.sub=o.sub;b.sp=o.spells||[];if(o.cls==='Wizard'){b.ch=b.ch||{};b.ch.feat4={feat:o.edition==='2014'?'Lightly Armored (2014)':'Lightly Armored',a1:'DEX'}}if(o.pole){b.ch=b.ch||{};b.ch.feat4={feat:'Polearm Master',a1:'STR'}}b.name='Attack delivery lifecycle';b.cid='';b.inv=[{n:'Cinder Coat',q:1,eq:true,attuned:true},...['Longsword','Dagger','Longsword, +1','Longbow','Quarterstaff'].map(n=>({n,q:1,eq:true}))];__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));__bldSync('Cinder Coat',b.name,{q:1});return __sheetState().C.inv[0].chargeKey}""",dict(cls=cls,edition=edition,spells=spells,sub=sub,pole=pole))
def target(page,kind='Creature',hp='5',maximum='10'):
 page.locator('[data-atarget="type"]').select_option(kind)
 for key,value in [('hp',hp),('maxHp',maximum)]:page.locator('[data-atarget="%s"]'%key).fill(value);page.locator('[data-atarget="%s"]'%key).press('Tab')
 page.wait_for_function("""({kind,hp,maximum})=>{const t=__sheetState().attackTarget||{};return t.type===kind&&String(t.hp==null?'':t.hp)===hp&&String(t.maxHp==null?'':t.maxHp)===maximum}""",arg=dict(kind=kind,hp=hp,maximum=maximum))
def rows(page):return page.evaluate('()=>__sheetState().C.attacks')
def index(page,name):return page.evaluate('name=>__sheetState().C.attacks.findIndex(a=>a.n===name)',name)
def open_bonus(page,name):
 if page.locator('#recov').count():raise AssertionError(page.locator('#recov .recm').text_content())
 page.locator('[data-ard="%s"]'%index(page,name)).first.click()
def close(page):page.locator('#sheet [data-close]').click()
def used(page,key):return page.evaluate("""key=>new Set([...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key&&x.getAttribute('aria-pressed')==='true').map(x=>x.getAttribute('data-i'))).size""",key)
def set_used(page,key,value,redraw=True):
 page.evaluate("""({key,value})=>{const bs=[...document.querySelectorAll('#actBody .bx')].filter(x=>x.getAttribute('data-k')===key),at=i=>bs.find(x=>+x.getAttribute('data-i')===i);if(value)at(value-1).click();else {at(0).click();if(at(0).getAttribute('aria-pressed')==='true')at(0).click()}}""",dict(key=key,value=value))
 if redraw:page.evaluate('()=>__sheetRerender()')
def roll(page,prefix,key,critical=False):
 before=used(page,key);count=page.evaluate('()=>__kindRolls.length');page.locator('[data-ard-mode]').select_option('critical' if critical else 'normal');page.locator('[data-ard-roll]').click();page.wait_for_function('n=>__kindRolls.length===n+1',arg=count);r=page.evaluate('()=>__kindRolls.at(-1)');check(prefix+' actual Fire dice',len(r['result']['d'].split(']')[0].lstrip('[').split(', ')),2 if critical else 1);check(prefix+' actual Fire total',(r['result']['dt'],r['result']['v']),('Fire',12 if critical else 6));check(prefix+' exact charge',used(page,key),before+1)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for width,height in [(390,844),(1250,850)]:
   ctx=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',service_workers='block');page=ctx.new_page();page.set_default_timeout(180000);errors=[];page.on('pageerror',lambda e:(errors.append(str(e)),print('PAGE ERROR',str(e),flush=True)));fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text();ctx.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");");page.goto('http://127.0.0.1:%s/index.html'%srv.server_port);ready(page);prefix=str(width)+' '
   if not CASTERS_ONLY:
    key=install(page);target(page);set_used(page,key,0)
    set_used(page,key,3,redraw=False);check(prefix+' manual exhaustion disables action',page.locator('[data-ard="%s"]'%index(page,'Dagger')).first.is_disabled(),True)
    set_used(page,key,2,redraw=False);check(prefix+' manual recovery enables action',page.locator('[data-ard="%s"]'%index(page,'Dagger')).first.is_enabled(),True);set_used(page,key,0)
    check(prefix+' known ranged has no Cinder',[(a['n'],bool(a.get('spendDice'))) for a in rows(page) if a['n']=='Longbow'],[('Longbow',False)])
    for name in ['Unarmed Strike','Longsword']:
     for critical in [False,True]:
      set_used(page,key,0);open_bonus(page,name);check(prefix+name+' single mode automatic',page.locator('[data-ard-kind]').input_value(),'melee');check(prefix+name+' single enabled',page.locator('[data-ard-roll]').is_enabled(),True);roll(page,prefix+name+(' critical' if critical else ' normal'),key,critical);close(page)
    for name,expected in [('Dagger',['melee','ranged']),('Longsword, +1',[])]:
     a=next(a for a in rows(page) if a['n']==name);check(prefix+name+' declared metadata',a['spendDice'][0]['attackKinds'],expected);set_used(page,key,0);open_bonus(page,name);check(prefix+name+' blank requires declaration',page.locator('[data-ard-kind]').input_value(),'');check(prefix+name+' default blocks',page.locator('[data-ard-roll]').is_disabled(),True);page.locator('[data-ard-kind]').select_option('ranged');check(prefix+name+' ranged blocks',page.locator('[data-ard-roll]').is_disabled(),True);page.evaluate('()=>{const b=document.querySelector("[data-ard-roll]");b.disabled=false;b.click()}');check(prefix+name+' forged ranged still no cost',used(page,key),0);page.locator('[data-ard-kind]').select_option('melee');roll(page,prefix+name+' declared melee',key);close(page);open_bonus(page,name);check(prefix+name+' reopened declaration blank',page.locator('[data-ard-kind]').input_value(),'');close(page)
    set_used(page,key,2);open_bonus(page,'Dagger');page.locator('[data-ard-kind]').select_option('melee');page.evaluate('()=>{__kindDelay=true}');roll(page,prefix+' last charge delayed',key,True);check(prefix+' pending actual callback',page.evaluate('()=>typeof __kindPending'),'function');page.evaluate('()=>{const s=document.querySelector("[data-ard-kind]");s.value="ranged";s.dispatchEvent(new Event("change",{bubbles:true}))}');check(prefix+' spent declaration immutable',page.locator('[data-ard-kind]').input_value(),'melee');page.evaluate('()=>{__kindDelay=false;__kindPending();__kindPending=null}');check(prefix+' last charge callback finishes','Resource spent.' in page.locator('[data-ard-result]').text_content(),True)
    if OUT:page.screenshot(path=str(OUT/('kind-dual-last-charge-'+str(width)+'.png')))
    close(page);page.evaluate("()=>__openRest('long')");page.locator('[data-rchg="%s"]'%key).fill('1');page.locator('[data-slide-go="long"] .slidec-h').press('Enter');page.wait_for_function('()=>!document.querySelector("#sheet.on #restDlg")');check(prefix+' dawn rolled recovery partial',used(page,key),2);check(prefix+' recovered resource enables action',page.locator('[data-ard="%s"]'%index(page,'Dagger')).first.is_enabled(),True)
    open_bonus(page,'Dagger');page.locator('[data-ard-kind]').select_option('melee');target(page,hp='10');count=page.evaluate('()=>__kindRolls.length');page.locator('[data-ard-roll]').click();check(prefix+' stale full HP prevents cost',used(page,key),2);check(prefix+' stale full HP prevents roll',page.evaluate('()=>__kindRolls.length'),count);close(page)
    for kind,hp,maximum in [('Creature','10','10'),('Object','5','10'),('','5','10'),('Creature','5','')]:
     target(page,kind,hp,maximum);check(prefix+' ineligible target '+str((kind,hp,maximum)),any(a.get('spendDice') for a in rows(page)),False)
    target(page);set_used(page,key,0);open_bonus(page,'Dagger');page.locator('[data-ard-kind]').select_option('melee');roll(page,prefix+' declaration before reload',key);close(page);page.wait_for_function("""key=>{const s=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1')||'{}'),b=JSON.parse(localStorage.getItem('phb24-builder-v1')||'{}'),c=JSON.parse(localStorage.getItem('yudhi-kelapa-build-v3')||'{}');return s.used[key]===1&&s.attackTarget.hp===5&&b.name==='Attack delivery lifecycle'&&c.name===b.name}""",arg=key);check(prefix+' no persisted per-hit declaration',page.evaluate("()=>{const s=JSON.parse(localStorage.getItem('yudhi-kelapa-sheet-v1'));return !('attackKind' in s)&&!('attackKinds' in s)}"),True);page.reload();ready(page);open_bonus(page,'Dagger');check(prefix+' cold reload requires fresh declaration',page.locator('[data-ard-kind]').input_value(),'');close(page)
   for edition in ['2024','2014']:
    key=install(page,'Wizard',edition,['Shocking Grasp','Chill Touch','Fire Bolt']);check(prefix+edition+' Wizard trained for Cinder Coat',page.evaluate("()=>__sheetState().C.profs.armor.includes('Light')"),True);target(page);set_used(page,key,0)
    for name,active in [('Shocking Grasp',True),('Chill Touch',edition=='2024'),('Fire Bolt',False)]:
     a=next(a for a in rows(page) if a['n']==name);check(prefix+edition+' '+name+' reviewed delivery',bool(a.get('spendDice')),active)
     if active:
      set_used(page,key,0);open_bonus(page,name);check(prefix+edition+' '+name+' automatic melee',page.locator('[data-ard-kind]').input_value(),'melee');roll(page,prefix+edition+' '+name,key);close(page)
   if not CASTERS_ONLY:
    key=install(page,'Druid','2024',['Thorn Whip']);target(page);set_used(page,key,0);a=next(a for a in rows(page) if a['n']=='Thorn Whip');check(prefix+' Thorn Whip retains 30ft',a['range'],'30 ft');open_bonus(page,'Thorn Whip');check(prefix+' 30ft spell still melee',page.locator('[data-ard-kind]').input_value(),'melee');roll(page,prefix+' Thorn Whip',key,True);close(page)
    key=install(page,pole=True);target(page);set_used(page,key,0);pole=next(a for a in rows(page) if a['n'].startswith('Pole Strike'));check(prefix+' Pole Strike melee metadata',pole['spendDice'][0]['attackKinds'],['melee']);open_bonus(page,pole['n']);roll(page,prefix+' Pole Strike',key);close(page)
    key=install(page,'Rogue',sub='Soulknife');target(page);set_used(page,key,0)
    for name in ['Psychic Blade','Psychic Blade (Bonus Action)']:
     a=next(a for a in rows(page) if a['n']==name);check(prefix+name+' both deliveries',a['spendDice'][0]['attackKinds'],['melee','ranged']);set_used(page,key,0);open_bonus(page,name);check(prefix+name+' requires per-hit choice',page.locator('[data-ard-kind]').input_value(),'');page.locator('[data-ard-kind]').select_option('melee');roll(page,prefix+name,key);close(page)
   check(prefix+' page errors',errors,[]);ctx.close()
  browser.close()
finally:srv.shutdown()
print(f'{sum(checks)}/{len(checks)} attack kind checks passed');raise SystemExit(0 if all(checks) else 1)
