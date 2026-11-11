"""Native pending domain saves survive navigation before their debounce expires."""
import functools,http.server,json,threading
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent.parent
class Quiet(http.server.SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(Quiet,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
checks=0
def check(value,expected):
 global checks
 assert value==expected,(value,expected)
 checks+=1
def close():
 if page.locator('#sheet.on [data-close]').count():page.locator('#sheet.on [data-close]').click()
def fact(key):page.locator('[data-tattoo-fact="'+key+'"]').check()
def next_reload():
 # Native key handler and reload share one JS task: the 150/200ms saves cannot run first.
 page.evaluate("""()=>{const snapshot=()=>{const x=__sheetState();return {live:{insp:x.state.insp,body:x.state.spellwroughtTattoos||null,q:x.C.inv[0]?.q},public:{S:JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}'),C:JSON.parse(__store.getItem('yudhi-kelapa-build-v3')||'{}')}}};addEventListener('pagehide',()=>localStorage.setItem('native-save-pagehide',JSON.stringify(snapshot())),{once:true});document.dispatchEvent(new KeyboardEvent('keydown',{key:'y',ctrlKey:true,bubbles:true}));localStorage.setItem('native-save-before-reload',JSON.stringify(snapshot()));location.reload()}""")
 page.wait_for_load_state('domcontentloaded');page.wait_for_function('()=>!!window.__deferDone')
 home=page.locator('[data-hview]')
 if home.count()and home.first.is_visible():home.first.click()
 return page.evaluate("""()=>({before:JSON.parse(localStorage.getItem('native-save-before-reload')),pagehide:JSON.parse(localStorage.getItem('native-save-pagehide')),S:__sheetState().state,C:__sheetState().C})""")
try:
 with sync_playwright()as p:
  browser=p.chromium.launch()
  for width,height in [(390,844),(1250,850)]:
   context=browser.new_context(viewport={'width':width,'height':height},reduced_motion='reduce',service_workers='block')
   fixture=(ROOT/'tests/fixtures/yudhi-v3.json').read_text()
   context.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3'))localStorage.setItem('yudhi-kelapa-build-v3',"+json.dumps(fixture)+");if(!localStorage.getItem('yudhi-kelapa-sheet-v1'))localStorage.setItem('yudhi-kelapa-sheet-v1',JSON.stringify({cust:{}}));")
   page=context.new_page();page.set_default_timeout(30000);page.goto('http://127.0.0.1:%d/index.html'%server.server_port);page.wait_for_function('()=>!!window.__deferDone')
   home=page.locator('[data-hview]')
   if home.count()and home.first.is_visible():home.first.click()
   page.wait_for_timeout(500)
   page.evaluate("()=>{document.querySelector('#insp').click();document.dispatchEvent(new KeyboardEvent('keydown',{key:'z',ctrlKey:true,bubbles:true}))}")
   page.wait_for_function("()=>JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).insp===__sheetState().state.insp")
   ordinary=next_reload();check(ordinary['before']['live']['insp'],True);check(ordinary['before']['public']['S']['insp'],False);check(ordinary['pagehide']['public']['S']['insp'],True);check(ordinary['S']['insp'],True)
   page.evaluate('async()=>await __bldNeed()')
   page.evaluate("""()=>{const b=__bldQuickFor('Fighter',5);b.name='Native pending-save tattoo';b.cid=__sheetId();b.rs='2024';b.src={core:true,dmg:true,phb:true,phb14:true,tce:true};b.inv=[{n:'Spellwrought Tattoo (1st Level)',q:1}];__bldTestSet(b);__sheetSoft(__bldSheetFor(b))}""")
   if width<760:page.locator('#bnav [data-go="4"]').click()
   else:page.locator('#tabs [data-tab="p-inv"]').click()
   page.locator('#invBody .iname[data-info="it:0"]').click();page.locator('[data-tattoo-needle-open="0"]').click();page.locator('[data-tattoo-needle-op="adopt"]').click();page.locator('[data-tattoo-needle-spell]').select_option('Cure Wounds');fact('unusedNeedleDeclared');page.locator('[data-tattoo-needle-op="configure"]').click();fact('needleAgainstSkin');fact('commandWord');page.locator('[data-tattoo-needle-op="apply"]').click();page.locator('[data-tattoo-body-root]').wait_for(state='visible')
   source=page.evaluate('()=>__sheetState().state.spellwroughtTattoos.tattoos[0].sourceId');close();page.keyboard.press('Control+z')
   page.wait_for_function("()=>!JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')).spellwroughtTattoos&&JSON.parse(__store.getItem('yudhi-kelapa-build-v3')).inv[0].q===1")
   tattoo=next_reload();check(tattoo['before']['live']['body']['tattoos'][0]['sourceId'],source);check(tattoo['before']['public']['S'].get('spellwroughtTattoos'),None);check(tattoo['before']['public']['C']['inv'][0]['q'],1);check(tattoo['pagehide']['public']['S']['spellwroughtTattoos']['tattoos'][0]['sourceId'],source);check(tattoo['pagehide']['public']['C']['inv'][0]['q'],0);check(tattoo['S']['spellwroughtTattoos']['tattoos'][0]['sourceId'],source);check(len(tattoo['S']['spellwroughtTattoos']['tattoos']),1);check(tattoo['C']['inv'][0]['q'],0)
   print(width,'native immediate Inspiration and tattoo Undo/Redo reload PASS',flush=True);context.close()
  browser.close()
finally:server.shutdown()
print(checks,'native immediate pending-save reload assertions PASS')
