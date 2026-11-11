#!/usr/bin/env python3
"""Attunement migration and independent item use through builder public hooks."""
import functools,http.server,threading,json
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=srv.serve_forever,daemon=True).start()
checks=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for width,height in [(390,844),(1250,850)]:
   page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce');page.set_default_timeout(180000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text();page.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");")
   page.goto('http://127.0.0.1:%s/index.html'%srv.server_port);page.wait_for_function('()=>!!window.__deferDone')
   rows=page.evaluate('''async()=>{await __bldNeed();const out=[],test=(n,v)=>out.push([n,!!v]);
    function build(name,attuned,eq=true,q=1){const b=__bldQuickFor('Fighter',4);b.inv=[{n:name,q,eq}];if(attuned!==null)b.inv[0].attuned=attuned;return __bldSheetFor(b,{}, {type:'Creature',alignment:'Good'})}
    for(const [name,bonus,die] of [['Hazirawn',2,'2d6'],['Wand of Orcus',3,'2d12'],['Ruby Rod of Asmodeus',2,'2d12']]){
     const on=build(name,true),off=build(name,false),a=on.attacks.find(x=>x.n===name),z=off.attacks.find(x=>x.n===name);
     test(name+' attuned bonus',a.misc===bonus);test(name+' attuned rider',a.xdice.some(x=>x.d===die&&x.roll));test(name+' independent raw state',off.inv[0].attuned===false&&off.inv[0].eq===true);test(name+' legacy migration',build(name,null).inv[0].attuned===true);
     test(name+' stowed slot retained',build(name,true,false).inv[0].attunedActive===true);test(name+' stowed no attack',!build(name,true,false).attacks.some(x=>x.n===name));test(name+' zero quantity inactive',build(name,true,true,0).inv[0].attunedActive===false);test(name+' zero quantity no attack',!build(name,true,true,0).attacks.some(x=>x.n===name));
     if(name==='Hazirawn')test('Hazirawn unattuned benefit',z.misc===1&&z.xdice[0].d==='1d6');else test(name+' unattuned physical weapon',z.misc===0&&!z.xdice);
    }
    for(const name of ['Sun Blade','Duskcrusher']){test(name+' unattuned hilt no attack',!build(name,false).attacks.some(x=>x.n===name));test(name+' attuned weapon available',build(name,true).attacks.some(x=>x.n===name))}
    let b=__bldQuickFor('Fighter',4);b.inv=['Hazirawn','Wand of Orcus','Ruby Rod of Asmodeus','Sun Blade'].map(n=>({n,q:1,eq:true,attuned:true}));let c=__bldSheetFor(b,{},{});test('three slots enforced',c.inv.filter(x=>x.attunedActive).length===3&&c.inv[3].attuneReason==='limit');
    b.inv[0].eq=false;c=__bldSheetFor(b,{},{});test('stowing does not free slot',c.inv[0].attunedActive&&c.inv[3].attuneReason==='limit');b.inv[0].attuned=false;c=__bldSheetFor(b,{},{});test('ending attunement frees slot',c.inv[3].attunedActive);
    b.inv=[{n:'Holy Avenger (Longsword)',q:1,eq:true,attuned:true}];c=__bldSheetFor(b,{},{});test('class prerequisite enforced',!c.inv[0].attunedActive&&c.inv[0].attuneReason==='requirements');return out}''')
   for name,ok in rows:checks.append(ok);print(('ok ' if ok else 'FAIL ')+str(width)+' '+name,flush=True)
   page.wait_for_function('()=>!!window.__pdfModelFor')
   pdf=page.evaluate("""()=>{const b=__bldQuickFor('Fighter',4);b.inv=[{n:'Hazirawn',q:1,eq:false,attuned:true}];const stowed=__pdfModelFor(__bldSheetFor(b));b.inv[0].eq=true;b.inv[0].attuned=false;const unattuned=__pdfModelFor(__bldSheetFor(b));return [stowed.equipment,unattuned.equipment]}""")
   ok='{{attuned}}' in pdf[0][0] and '{{attuned}}' not in pdf[1][0];checks.append(ok);print('PDF independent attunement',width,ok,flush=True)
   page.locator('[data-hview]').first.click(timeout=10000)
   page.evaluate("""()=>{const b=__bldQuickFor('Fighter',4);b.name='Attunement controls';b.cid='';b.inv=[{n:'Hazirawn',q:1,eq:true,attuned:false}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b));__bldSync('Hazirawn',b.name,{q:1});document.querySelector('[data-info=\"it:0\"]').click()}""")
   switch=page.locator('[data-iatts="Hazirawn"]');switch.click()
   page.wait_for_function("()=>__sheetState().C.inv[0].attuned===true",timeout=10000)
   ok=page.evaluate("()=>__sheetState().C.attacks.find(a=>a.n==='Hazirawn').misc===2");checks.append(ok);print('UI attune bonus',width,ok,flush=True)
   page.evaluate("()=>document.querySelector('[data-info=\"it:0\"]').click()")
   page.locator('#sheet [data-ieqs="Hazirawn"]').click()
   page.wait_for_function("()=>__sheetState().C.inv[0].eq===false")
   ok=page.evaluate("()=>__sheetState().C.inv[0].attuned===true&&__sheetState().C.inv[0].attunedActive===true&&!__sheetState().C.attacks.some(a=>a.n==='Hazirawn')");checks.append(ok);print('UI stowed attunement retained',width,ok,flush=True)
   page.evaluate("()=>document.querySelector('[data-info=\"it:0\"]').click()")
   page.locator('#sheet [data-ieqs="Hazirawn"]').click();page.wait_for_function("()=>__sheetState().C.inv[0].eq===true")
   page.evaluate("()=>document.querySelector('[data-info=\"it:0\"]').click()")
   page.locator('[data-iatts="Hazirawn"]').click();page.wait_for_function("()=>__sheetState().C.inv[0].attuned===false")
   ok=page.evaluate("()=>__sheetState().C.attacks.find(a=>a.n==='Hazirawn').misc===1");checks.append(ok);print('UI end attunement bonus',width,ok,flush=True)
   page.reload();page.wait_for_function('()=>!!window.__deferDone')
   ok=page.evaluate("()=>__sheetState().C.inv[0].attuned===false");checks.append(ok);print('UI reload preserves state',width,ok,flush=True)
   checks.append(not errors);print('page errors',errors,flush=True);page.close()
  browser.close()
finally:srv.shutdown()
print(f'{sum(checks)}/{len(checks)} attunement checks passed');raise SystemExit(0 if all(checks) else 1)
