#!/usr/bin/env python3
"""DOM snapshot for the SOLID stage 3 refactor of the sheet UI (reports/solid-s3-analysis.md).
Scenarios: (A) old Yudhi sheet from tests/fixtures, (B) a golden build applied as the active sheet, (C) a new character made from Home.
Viewports 390x844 and 1250x850. Per scenario: every main tab, then the main overlays (search/commands, library, more menu, detail card, rest, theme, edit mode).
Each step hashes the normalized DOM (scripts, styles and link tags dropped, attributes sorted, timestamps and the cross link buttons normalized) and the normalized localStorage.
Run: python3 tests/solid_ui_snapshot.py OUT.json [--root DIR] [--vp 390|1250] ; compare: python3 tests/solid_ui_snapshot.py --diff A.json B.json
Not part of CI (it only records, it asserts nothing): it is the proof tool that a UI refactor changed no output."""
import json, os, sys, re, hashlib, socket, threading, http.server, functools
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if '--diff' in sys.argv:
    i = sys.argv.index('--diff'); a = json.load(open(sys.argv[i + 1])); b = json.load(open(sys.argv[i + 2]))
    bad = [k for k in sorted(set(a['h']) | set(b['h'])) if a['h'].get(k) != b['h'].get(k)]
    print('steps', len(a['h']), len(b['h']), 'total', a['total'], b['total'], 'DIFFERENT: %d' % len(bad) if bad else 'IDENTICAL')
    for k in bad[:30]: print('  ', k)
    sys.exit(1 if bad else 0)
from playwright.sync_api import sync_playwright
args = sys.argv[1:]
if '--root' in args:
    i = args.index('--root'); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
ONLY = None
if '--vp' in args:
    i = args.index('--vp'); ONLY = args[i + 1]; del args[i:i + 2]
SCEN = 'ABC'
if '--scen' in args:
    i = args.index('--scen'); SCEN = args[i + 1]; del args[i:i + 2]
DUMP = os.environ.get('SNAP_DUMP')
OUT = args[0]
YUDHI = open(os.path.join(HERE, 'fixtures', 'yudhi-v3.json'), encoding='utf-8').read()
VIEWPORTS = [('390x844', 390, 844), ('1250x850', 1250, 850)]
GOLD = 'b1_bard_dance3_unarmored.json'
TABS = ['p-actions', 'p-spells', 'p-inv', 'p-feat', 'p-desc', 'p-notes', 'p-ext']

NORM = r"""()=>{
  const skip={SCRIPT:1,STYLE:1,LINK:1,NOSCRIPT:1,TEMPLATE:1};
  const ser=(n)=>{
    if(n.nodeType===3) return n.nodeValue.replace(/\s+/g,' ');
    if(n.nodeType!==1||skip[n.tagName]) return '';
    if(n.matches&&n.matches('button.lnk[data-lnk]')) return Array.from(n.childNodes).map(ser).join('');
    let a=Array.from(n.attributes).map(x=>x.name+'='+x.value).sort().join(' ');
    let h='<'+n.tagName+' '+a+'>';
    if(n.tagName==='INPUT'||n.tagName==='TEXTAREA'||n.tagName==='SELECT') h+='[v='+n.value+']';
    if(n.id==='homeV'&&n.hasAttribute('hidden')) return h+'</'+n.tagName+'>';/* Home is built when it is first shown; its content while hidden depends on timing */
    let kids=Array.from(n.childNodes).map(ser); if(n.tagName==='BODY') kids.sort();/* parts added to the page later (builder, Home) land in a different order from run to run */
    h+=kids.join('');
    return h+'</'+n.tagName+'>';
  };
  let t=ser(document.documentElement);
  t=t.replace(/(?<![0-9])1[6-9]\d{11}(?![0-9])/g,'TS').replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[.\dZ+:-]*/g,'ISO');
  t=t.replace(/<svg [^>]*class=ico [^>]*>.*?<\/svg>/g,'').replace(/ data-ico=1/g,'').replace(/\b(just now|\d+ (min|hr|h|d|s|sec|day|days|hour|hours)\.? ago)\b/g,'AGO').replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?/g,'DT');/* icons are added in idle time (timing), relative and clock times move */
  t=t.replace(/ mi-lite\b/g,'').replace(/>\s+</g,'><').replace(/\s+/g,' ');/* mi-lite: a load dependent perf mode */
  return t }"""
STORE = r"""()=>{ const o={}; for(let i=0;i<localStorage.length;i++){ const k=localStorage.key(i); o[k]=localStorage.getItem(k) }
  const bad=/^(__seeded|cs-snap|cs-undo|mi-|cs-log|cs-recent|cs-lib-recent|cs-tl|cs-tm|cs-time)/;
  const r={}; Object.keys(o).sort().forEach(k=>{ if(bad.test(k)) return; r[k.replace(/(?<![0-9])1[6-9]\d{11}(?![0-9])/g,'TS')]=o[k].replace(/(?<![0-9])1[6-9]\d{11}(?![0-9])/g,'TS').replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[.\dZ+:-]*/g,'ISO') });
  return JSON.stringify(r) }"""

def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, 'http://127.0.0.1:%d/index.html' % port

def sha(t): return hashlib.sha256(t.encode()).hexdigest()[:16]

def seed_js(v):
    return "(function(){try{ if(sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded','1'); localStorage.clear(); %s }catch(e){} })()" % (("localStorage.setItem('yudhi-kelapa-build-v3', %s);" % json.dumps(v)) if v else "")

def run(b, base, vp, W, H, h, errs):
    def scenario(tag, seed, steps):
        ctx = b.new_context(viewport={'width': W, 'height': H}, service_workers='block', reduced_motion='reduce')
        ctx.add_init_script(seed_js(seed))
        pg = ctx.new_page(); pg.set_default_timeout(120000)
        pg.on('pageerror', lambda e: errs.append(vp + ' ' + str(e)[:200]))
        def asks(ok=False):
            for _ in range(3):
                pg.evaluate("(ok)=>{var b=document.querySelector('#askOk,#askBox .ok,[data-ask-ok]'); if(!ok){var c=document.querySelector('#askNo,#askBox .no,[data-ask-no]'); if(c){c.click();return}} if(b&&ok) b.click()}", ok)
                pg.wait_for_timeout(150)
        def snap(name):
            pg.wait_for_timeout(700)
            dom = pg.evaluate(NORM)
            for _ in range(20):  # wait until the page is quiet: two reads 500 ms apart are equal (layout checks and loads settle under load)
                pg.wait_for_timeout(500); d2 = pg.evaluate(NORM)
                if d2 == dom: break
                dom = d2
            if DUMP:
                os.makedirs(DUMP, exist_ok=True); open(os.path.join(DUMP, ('%s %s dom' % (vp, name)).replace(' ', '_') + '.txt'), 'w').write(dom)
            h['%s %s dom' % (vp, name)] = sha(dom)
            st = pg.evaluate(STORE)
            if DUMP: open(os.path.join(DUMP, ('%s %s store' % (vp, name)).replace(' ', '_') + '.json'), 'w').write(st)
            h['%s %s store' % (vp, name)] = sha(st)
        def ready():
            pg.wait_for_function("()=>!!window.__deferDone", timeout=180000)
            pg.evaluate("()=>window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=180000)  # the builder shell is added to the page when it loads: wait so the order of the page parts is the same in every run
            pg.wait_for_timeout(2500)
        def click(sel):
            return pg.evaluate("(s)=>{var e=document.querySelector(s); if(!e) return false; e.click(); return true}", sel)
        def tabs(t0):
            for t in TABS:
                click('.tab[data-tab="%s"]' % t); snap('%s tab %s' % (t0, t))
            click('.tab[data-tab="p-actions"]'); pg.wait_for_timeout(300)
        def esc():
            pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
            pg.evaluate("()=>{ var c=document.querySelector('#sheet.on #sheetClose,#sheet.on [data-close]'); if(c) c.click(); var l=document.querySelector('#lib.on [data-libclose],#lib.on .lib-x'); if(l) l.click() }"); pg.wait_for_timeout(400)
        def overlays(t0):
            click('#srchBtn'); snap('%s ov search' % t0)
            pg.keyboard.type('dmg 7'); snap('%s ov palette dmg7' % t0)
            pg.evaluate("()=>{var q=document.getElementById('gsQ'); if(q){q.value='fire'; q.dispatchEvent(new Event('input',{bubbles:true}))}}"); snap('%s ov search fire' % t0); esc()
            click('#libBtn'); snap('%s ov library' % t0)
            pg.keyboard.type('fireball'); snap('%s ov library fireball' % t0); esc()
            click('#moreBtn'); snap('%s ov more' % t0); esc()
            click('#themeBtn'); snap('%s ov theme' % t0); esc()
            click('#editBtn'); snap('%s ov edit' % t0); click('#editBtn'); pg.wait_for_timeout(400)
            click('#healBtn'); snap('%s ov heal' % t0); esc()
            for tab, nm in (('p-spells', 'spell'), ('p-feat', 'feat'), ('p-inv', 'item'), ('p-actions', 'action')):
                click('.tab[data-tab="%s"]' % tab); pg.wait_for_timeout(300)
                pg.evaluate("(t)=>{var e=document.querySelector('#'+t+' [data-info]'); if(e) e.click()}", tab); snap('%s ov detail %s' % (t0, nm)); esc()
            pg.evaluate("()=>{var e=document.querySelector('[data-bd]'); if(e) e.click()}"); snap('%s ov breakdown' % t0); esc()
            pg.evaluate("()=>{var e=document.querySelector('[data-rest],#restBtn,[data-open-rest]'); if(e) e.click()}"); snap('%s ov rest' % t0); asks(False); esc()
        try:
            pg.goto(base); ready(); asks(False)
            steps(pg, snap, tabs, overlays, click, asks)
        finally:
            ctx.close()

    def stepA(pg, snap, tabs, overlays, click, asks):
        try: pg.wait_for_selector('#homeV .hwrap', state='attached', timeout=30000)
        except Exception: pass
        snap('A home'); click('[data-hview]'); pg.wait_for_timeout(2500)
        snap('A sheet'); tabs('A'); overlays('A')
    def stepB(pg, snap, tabs, overlays, click, asks):
        click('[data-hview]'); pg.wait_for_timeout(2500)
        snap('B sheet'); tabs('B'); overlays('B')
    def stepC(pg, snap, tabs, overlays, click, asks):
        pg.wait_for_function("typeof window.__bldOpen==='function'", timeout=180000)
        pg.evaluate("""()=>{ var b=Array.from(document.querySelectorAll('#homeV button, #homeV a')).find(x=>/Create a Character/.test(x.textContent)); if(b) b.click() }""")
        pg.wait_for_timeout(4000); asks(True)
        try:
            pg.select_option('#qbCls', 'Fighter'); click('[data-qb]'); pg.wait_for_timeout(2500); asks(True)
            click('#b-toSheet'); pg.wait_for_timeout(3500); asks(True)
        except Exception as ex:
            errs.append('C flow ' + str(ex)[:120])
        snap('C sheet'); tabs('C'); overlays('C')

    if 'A' in SCEN: scenario('A', YUDHI, stepA)
    if 'B' in SCEN:
        g = json.load(open(os.path.join(HERE, 'golden', 'builds', GOLD))); e = (g if isinstance(g, list) else [g])[0]
        ctx = b.new_context(viewport={'width': W, 'height': H}, service_workers='block'); pg = ctx.new_page(); pg.set_default_timeout(180000)
        pg.goto(base); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(1500)
        C = pg.evaluate("async (a)=>{ if(window.__bldNeed) await window.__bldNeed(); return JSON.stringify(window.__bldSheetFor(a[0],a[1])) }", [e['build'], e.get('fxT')])
        ctx.close()
        scenario('B', C, stepB)
    if 'C' in SCEN: scenario('C', None, stepC)

def main():
    h = {}; errs = []
    srv, base = serve()
    with sync_playwright() as p:
        b = p.chromium.launch()
        for vp, W, H in VIEWPORTS:
            if ONLY and ONLY not in vp: continue
            run(b, base, vp, W, H, h, errs)
        b.close()
    tot = sha(json.dumps(h, sort_keys=True))
    json.dump({'total': tot, 'h': h, 'errors': errs}, open(OUT, 'w'), indent=0)
    print('snapshot %d steps, total %s, page errors %d' % (len(h), tot, len(errs)))
    for e in errs[:5]: print('  ', e)
main()
