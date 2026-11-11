#!/usr/bin/env python3
"""Scourge critical dice and separate, explicit self-damage application."""
import functools,http.server,threading,json,sys
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=Path(sys.argv[1]) if len(sys.argv)>1 else None
if OUT:OUT.mkdir(parents=True,exist_ok=True)
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start();checks=[]
def check(name,v,w):
 ok=v==w;checks.append(ok);print(('ok ' if ok else 'FAIL ')+name,repr(v),flush=True)
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for width,height in [(390,844),(1250,850)]:
   page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce');page.set_default_timeout(180000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text();page.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");")
   page.goto('http://127.0.0.1:%s/index.html'%srv.server_port);page.wait_for_function('()=>!!window.__deferDone');page.locator('[data-hview]').first.click();page.wait_for_function('()=>!!window.__miRoll')
   rows=page.evaluate('''async()=>{await __bldNeed();const out=[],test=(n,v)=>out.push([n,!!v]);function build(attuned,target,eq=true,q=1){const b=__bldQuickFor('Fighter',4);b.base.CHA=18;b.inv=[{n:'Scourge of Shadow',q,eq,attuned},{n:'Longsword',q:1,eq:true}];return __bldSheetFor(b,{},target)}
    for(const on of [false,true]){const c=build(on,{type:'Creature',alignment:'Good'}),a=c.attacks[1],d=__deriveFor(c);test('base '+on,a.die==='3d4'&&a.critDie==='3d6'&&a.misc===3&&a.critRange===18);test('ability '+on,a.ab===(on?'CHA':'STR'));test('rider '+on,a.xdice[0].d==='4d4'&&a.xdice[0].critD==='4d6');test('self separate '+on,!!a.selfDamage===!on&&!c.attacks[2].selfDamage&&!c.attacks[2].xdice);test('critical packet '+on,d.atk[1].damageParts[0].critExpr.startsWith('3d6')&&d.atk[1].damageParts[1].critExpr==='4d6')}
    for(const t of [{},{type:'Object',alignment:'Good'},{type:'Creature',alignment:'Evil'}])test('target '+JSON.stringify(t),!build(false,t).attacks[1].xdice);
    const stowed=build(true,{},false);test('stowed initiative retained',__deriveFor(stowed).init===__deriveFor(build(true,{})).init&&stowed.inv[0].attunedActive);test('stowed no weapon',!stowed.attacks.some(a=>a.n==='Scourge of Shadow'));test('empty no weapon',!build(false,{},true,0).attacks.some(a=>a.n==='Scourge of Shadow'));
    const b=__bldQuickFor('Fighter',4);b.base.CHA=18;b.name='Critical lifecycle';b.cid='';b.inv=[{n:'Scourge of Shadow',q:1,eq:true,attuned:false},{n:'Longsword',q:1,eq:true}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b,{},{}));__bldSync('Scourge of Shadow',b.name,{q:1});return out}''')
   for n,v in rows:check(str(width)+' '+n,v,True)
   page.locator('[data-atarget="type"]').select_option('Creature');page.locator('[data-atarget="alignment"]').select_option('Good');page.wait_for_function('()=>!!__sheetState().C.attacks[1].xdice')
   page.evaluate('()=>{window.__criticalRng=crypto.getRandomValues;crypto.getRandomValues=a=>{a.fill(5);return a}}')
   page.locator('.abox[data-bd="ad-1"]').click();page.locator('.mi-roll [data-mr=""]').click();normal=page.evaluate('()=>document.querySelector(".mi-rres").__r');page.locator('.mi-roll [data-mr="crit"]').click();crit=page.evaluate('()=>document.querySelector(".mi-rres").__r')
   check(str(width)+' normal dice counts',[len(x['dice']) for x in normal['damageParts']],[3,4]);check(str(width)+' critical dice counts',[len(x['dice']) for x in crit['damageParts']],[6,8]);check(str(width)+' upgraded critical faces',all(v==6 for x in crit['damageParts'] for v in x['dice']),True);check(str(width)+' critical flat preserved',crit['v']-normal['v'],70);check(str(width)+' actual critical expression',crit['damageParts'][1]['expr'],'8d6');page.locator('#sheet [data-close]').click()
   page.evaluate('()=>{crypto.getRandomValues=a=>{a.fill(17);return a}}');page.locator('.abox[data-bd="ah-1"]').click();page.locator('.mi-roll [data-mr=""]').click();check(str(width)+' natural18 recognized',page.evaluate('()=>{const r=document.querySelector(".mi-rres").__r;return r.nat===18&&r.critical===true}'),True);page.locator('#sheet [data-close]').click()
   page.evaluate('()=>{crypto.getRandomValues=a=>{a.fill(0);return a}}');page.locator('.abox[data-bd="ah-1"]').click();page.locator('.mi-roll [data-mr=""]').click();check(str(width)+' missed attack still resolves self damage',page.evaluate('()=>document.querySelector(".mi-rres").__r.nat'),1);page.locator('#sheet [data-close]').click()
   page.evaluate('()=>{const c=structuredClone(__sheetState().C);c.defenses.push({t:"Resistance",v:"Necrotic",s:"Test defense"},{t:"Immunity",v:"Necrotic",s:"Test defense"});__sheetSoft(c)}');check(str(width)+' explicit defense bypass policy',page.evaluate('()=>__sheetState().C.attacks[1].selfDamage[0].bypassDefenses&&__sheetState().C.defenses.some(x=>x.t==="Immunity"&&x.v==="Necrotic")'),True)
   page.evaluate('()=>{crypto.getRandomValues=a=>{a.fill(5);return a};document.getElementById("hpAmt").value=999;document.getElementById("healBtn").click();document.getElementById("hpAmt").value=5;document.querySelector("[data-tmpset]").click()}');initial=page.locator('#hpChipV').inner_text();page.locator('[data-asd="1"]').click();check(str(width)+' opening does not hurt',page.locator('#hpChipV').inner_text(),initial);check(str(width)+' owns its roll controls',page.locator('#sheet .mi-roll').count(),0)
   page.locator('[data-asd-roll]').click();page.wait_for_function('()=>!document.querySelector("[data-asd-apply]").disabled');check(str(width)+' normal self roll',page.locator('[data-asd-value]').input_value(),'4');check(str(width)+' rolling does not hurt',page.locator('#hpChipV').inner_text(),initial)
   if OUT:page.screenshot(path=str(OUT/('self-normal-%s.png'%width)))
   page.locator('[data-asd-apply]').click();after=page.locator('#hpChipV').inner_text();check(str(width)+' tempHP absorbs first',after,initial.split('+')[0]+'+1');page.evaluate('()=>document.querySelector("[data-asd-apply]").click()');check(str(width)+' apply once',page.locator('#hpChipV').inner_text(),after);page.locator('#sheet [data-close]').click()
   page.locator('[data-asd="1"]').click();page.locator('[data-asd-mode]').select_option('critical');page.locator('[data-asd-roll]').click();page.wait_for_function('()=>!document.querySelector("[data-asd-apply]").disabled');check(str(width)+' critical self not doubled',page.locator('[data-asd-value]').input_value(),'12')
   if OUT:page.screenshot(path=str(OUT/('self-critical-%s.png'%width)))
   page.locator('[data-asd-apply]').click();check(str(width)+' self damage HP applied',page.locator('#hpChipV').inner_text(),str(int(initial.split('+')[0])-11));page.locator('#sheet [data-close]').click()
   page.locator('[data-asd="1"]').click();page.locator('[data-asd-value]').fill('2');hp=page.locator('#hpChipV').inner_text();page.evaluate('()=>__bldSetAttuned("Scourge of Shadow",__sheetState().C.name,true,0)');page.locator('[data-asd-apply]').click();check(str(width)+' stale attunement blocks apply',page.locator('#hpChipV').inner_text(),hp);page.locator('#sheet [data-close]').click();check(str(width)+' attuned no self control',page.locator('[data-asd="1"]').count(),0)
   page.evaluate('()=>__bldSetAttuned("Scourge of Shadow",__sheetState().C.name,false,0)');page.locator('[data-asd="1"]').click();page.locator('[data-asd-value]').fill('2');hp=page.locator('#hpChipV').inner_text();page.evaluate('()=>{const c=structuredClone(__sheetState().C);c.name="Different backlash owner";__sheetSoft(c)}');page.locator('[data-asd-apply]').click();check(str(width)+' changed owner blocks apply',page.locator('#hpChipV').inner_text(),hp);page.locator('#sheet [data-close]').click()
   page.evaluate('()=>{const c=structuredClone(__sheetState().C);c.name="Critical lifecycle";__sheetSoft(c)}');page.locator('[data-asd="1"]').click();page.locator('[data-asd-value]').fill('2');page.evaluate('()=>__bldToggleEq("Scourge of Shadow",0)');page.locator('[data-asd-apply]').click();check(str(width)+' stowed source blocks apply',page.locator('#hpChipV').inner_text(),hp);page.locator('#sheet [data-close]').click()
   page.evaluate('()=>{crypto.getRandomValues=window.__criticalRng}');check(str(width)+' page errors',errors,[]);page.close()
  browser.close()
finally:srv.shutdown()
print(f'{sum(checks)}/{len(checks)} critical checks passed');raise SystemExit(0 if all(checks) else 1)
