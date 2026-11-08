#!/usr/bin/env python3
"""Recorder for the SOLID refactor of src/fx (reports/solid-s13c-analysis.md). The effect packs are visual, so golden tests and the DOM snapshot do not cover them.
This test records what the effect code DOES, deterministically, and hashes it, so that a refactor of src/fx can be proved identical.
Scenarios (as solid_ui_snapshot): (A) old Yudhi sheet from tests/fixtures, (B) a golden build applied as the active sheet, (C) a new character made from Home.
Viewports 390x844 and 1250x850. Effects are ON (no reduced motion). Math.random is seeded again at the start of every step.
Per step it records a trace of the calls the page makes, taken by wrappers that an init script puts on the browser API (the wrappers pass every call through unchanged):
  L/R addEventListener/removeEventListener (target, type, capture/passive/once), A Element.animate (target, keyframes, options), T setTimeout/setInterval (kind, delay),
  O Mutation/Intersection/Resize observer observe (target, options), N node insert and remove (appendChild, insertBefore, removeChild, remove, append, prepend, insertAdjacentHTML, replaceWith),
  C createElement (tag), G canvas getContext, S audio contexts, K classList add/remove/toggle (target, tokens), P setAttribute/removeAttribute and style.setProperty (target, name, value),
  (requestAnimationFrame and requestIdleCallback are only noted as used, not hashed: their count depends on frame timing).
Per step the hashes are: ord (the trace in order), set (the trace as a sorted list with counts), dom (the page DOM, the same normalisation as solid_ui_snapshot, plus the text of every style element and the class and style of html and body),
win (the sorted window property names), lis (listener count per target kind and type, live: added minus removed).
Run: python3 tests/solid_fx_snapshot.py OUT.json [--root DIR] [--vp 390|1250] [--scen ABC]
     python3 tests/solid_fx_snapshot.py --diff A.json B.json [--stable-with A2.json] [--ignore-ord]    (reports which steps and which hash kinds differ; A2 = a second run of tree A: pairs on which A and A2 disagree are skipped; --ignore-ord compares only set, dom, win, lis)
Stability (measured on main, two runs): about 93 percent of the (step, hash kind) pairs are equal in both runs; the others are timing races (class art layers in scenario C, the builder step, counts of observers) and are skipped with --stable-with
Not part of CI: it records and compares, it asserts nothing. Run it twice on the same tree to prove it is stable, then compare a refactored tree with main."""
import json, os, sys, re, gzip, hashlib, socket, threading, http.server, functools
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if '--diff' in sys.argv:
    i = sys.argv.index('--diff'); a = json.load(open(sys.argv[i + 1])); b = json.load(open(sys.argv[i + 2]))
    kinds = ['set', 'dom', 'win', 'lis'] if '--ignore-ord' in sys.argv else ['ord', 'set', 'dom', 'win', 'lis']
    ref = json.load(open(sys.argv[sys.argv.index('--stable-with') + 1])) if '--stable-with' in sys.argv else None   # a second run of tree A: only the (step, hash kind) pairs that both runs of A agree on are compared
    bad = []
    for k in sorted(set(a['h']) | set(b['h'])):
        x, y = a['h'].get(k) or {}, b['h'].get(k) or {}
        d = [q for q in kinds if x.get(q) != y.get(q) and (ref is None or (ref['h'].get(k) or {}).get(q) == x.get(q))]
        if d: bad.append((k, d))
    print('steps', len(a['h']), len(b['h']), 'total', a['total'], b['total'], 'DIFFERENT: %d' % len(bad) if bad else 'IDENTICAL')
    for k, d in bad[:40]: print('  ', k, ','.join(d))
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
DUMP = os.environ.get('FXSNAP_DUMP')
OUT = args[0]
YUDHI = open(os.path.join(HERE, 'fixtures', 'yudhi-v3.json'), encoding='utf-8').read()
VIEWPORTS = [('390x844', 390, 844), ('1250x850', 1250, 850)]
GOLD = 'b1_bard_dance3_unarmored.json'
TABS = ['p-actions', 'p-spells', 'p-inv', 'p-feat', 'p-desc', 'p-notes', 'p-ext']

INIT = r"""(function(){
 if(window.__fxRec) return;
 var T=[], LIVE={}, on=true, seed=1;
 function rnd(){ seed|=0; seed=seed+0x6D2B79F5|0; var t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }
 Math.random=rnd;
 function d(n){ try{
   if(n===window) return 'win'; if(n===document) return 'doc'; if(!n) return 'null';
   if(n.nodeType===1){ var c=n.getAttribute&&n.getAttribute('class'); return n.tagName+(n.id?'#'+n.id:'')+(c?'.'+String(c).trim().replace(/\s+/g,'.').slice(0,80):''); }
   if(n.nodeType===3) return '#text'; if(n.nodeType===11) return '#frag'; if(n.nodeType===9) return 'doc';
   return Object.prototype.toString.call(n).slice(8,-1); }catch(e){ return '?'; } }
 function kind(n){ try{ if(n===window) return 'win'; if(n===document) return 'doc'; if(n&&n.nodeType===1) return n.tagName; return Object.prototype.toString.call(n).slice(8,-1); }catch(e){ return '?'; } }
 function rec(s){ if(on) T.push(s); }
 function opt(o){ if(o===undefined||o===null) return ''; if(typeof o==='boolean') return o?'c':''; return (o.capture?'c':'')+(o.passive?'p':'')+(o.once?'o':''); }
 function wrap(proto,name,fn){ var o=proto&&proto[name]; if(typeof o!=='function') return; proto[name]=function(){ try{ fn.call(this,arguments); }catch(e){} return o.apply(this,arguments); }; try{ Object.defineProperty(proto[name],'name',{value:name}); }catch(e){} }
 wrap(EventTarget.prototype,'addEventListener',function(a){ rec('L '+d(this)+' '+a[0]+' '+opt(a[2])); if(on){ var k=kind(this)+' '+a[0]; LIVE[k]=(LIVE[k]||0)+1; } });
 wrap(EventTarget.prototype,'removeEventListener',function(a){ rec('R '+d(this)+' '+a[0]+' '+opt(a[2])); if(on){ var k=kind(this)+' '+a[0]; LIVE[k]=(LIVE[k]||0)-1; } });
 wrap(Element.prototype,'animate',function(a){ rec('A '+d(this)+' '+JSON.stringify(a[0])+' '+JSON.stringify(a[1])); });
 var st=window.setTimeout, si=window.setInterval;
 window.setTimeout=function(f,ms){ rec('T t '+(+ms||0)); return st.apply(window,arguments); };
 window.setInterval=function(f,ms){ rec('T i '+(+ms||0)); return si.apply(window,arguments); };
 var raf=window.requestAnimationFrame; window.requestAnimationFrame=function(){ if(on&&!T.__f){ T.__f=1; } return raf.apply(window,arguments); };
 if(window.requestIdleCallback){ var ric=window.requestIdleCallback; window.requestIdleCallback=function(){ if(on&&!T.__i){ T.__i=1; } return ric.apply(window,arguments); }; }
 [['MutationObserver','M'],['IntersectionObserver','I'],['ResizeObserver','Z']].forEach(function(p){ var C=window[p[0]]; if(C&&C.prototype) wrap(C.prototype,'observe',function(a){ rec('O '+p[1]+' '+d(a[0])+' '+JSON.stringify(a[1]||null)); }); });
 ['appendChild','insertBefore','removeChild','replaceChild'].forEach(function(n){ wrap(Node.prototype,n,function(a){ rec('N '+n+' '+d(this)+' < '+d(a[0])); }); });
 ['remove','append','prepend','replaceWith','before','after'].forEach(function(n){ wrap(Element.prototype,n,function(a){ rec('N '+n+' '+d(this)+' < '+Array.prototype.map.call(a,d).join(',')); }); });
 wrap(Element.prototype,'insertAdjacentHTML',function(a){ rec('N iah '+d(this)+' '+a[0]+' '+String(a[1]).length); });
 wrap(Document.prototype,'createElement',function(a){ rec('C '+a[0]); });
 wrap(HTMLCanvasElement.prototype,'getContext',function(a){ rec('G '+a[0]); });
 ['AudioContext','webkitAudioContext'].forEach(function(n){ var A=window[n]; if(!A) return; window[n]=function(){ rec('S '+n); return new A(...arguments); }; window[n].prototype=A.prototype; });
 wrap(Element.prototype,'setAttribute',function(a){ if(a[0]==='class'||a[0]==='style') return; rec('P '+d(this)+' '+a[0]+'='+String(a[1]).slice(0,60)); });
 wrap(Element.prototype,'removeAttribute',function(a){ rec('P '+d(this)+' -'+a[0]); });
 wrap(CSSStyleDeclaration.prototype,'setProperty',function(a){ rec('Y '+a[0]); });
 window.__fxRec={ start:function(s){ T=[]; LIVE=LIVE; seed=s||1; on=true; }, stop:function(){ on=false; },
   take:function(){ var o={t:T.slice(), f:!!T.__f, i:!!T.__i, live:Object.assign({},LIVE)}; return o; }, reset:function(s){ T.length=0; T.__f=0; T.__i=0; seed=s||1; } };
 window.__fxRec.on=function(v){ on=v; }; window.__fxRec.mark=function(n){ T.push('M '+n); }; window.__fxRec.note=function(n){ T.push('E '+n); }; window.__fxRec.seed=function(s){ seed=s; };
})();"""

NORM = r"""()=>{
  const skip={SCRIPT:1,NOSCRIPT:1,TEMPLATE:1,LINK:1};
  const ser=(n)=>{
    if(n.nodeType===3) return n.nodeValue.replace(/\s+/g,' ');
    if(n.nodeType!==1||skip[n.tagName]) return '';
    if(n.matches&&n.matches('button.lnk[data-lnk]')) return Array.from(n.childNodes).map(ser).join('');
    let a=Array.from(n.attributes).map(x=>x.name+'='+x.value).sort().join(' ');
    let h='<'+n.tagName+' '+a+'>';
    if(n.tagName==='INPUT'||n.tagName==='TEXTAREA'||n.tagName==='SELECT') h+='[v='+n.value+']';
    if(n.tagName==='STYLE') h+=n.textContent.replace(/\s+/g,' ');
    if(n.id==='homeV'&&n.hasAttribute('hidden')) return h+'</'+n.tagName+'>';
    let kids=Array.from(n.childNodes).map(ser); if(n.tagName==='BODY') kids.sort();
    h+=kids.join('');
    return h+'</'+n.tagName+'>';
  };
  let t=ser(document.documentElement);
  t=t.replace(/(?<![0-9])1[6-9]\d{11}(?![0-9])/g,'TS').replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[.\dZ+:-]*/g,'ISO');
  t=t.replace(/<svg [^>]*class=ico [^>]*>.*?<\/svg>/g,'').replace(/ data-ico=1/g,'').replace(/<([A-Za-z0-9]+) >/g,'<$1>').replace(/\b(just now|\d+ (min|hr|h|d|s|sec|day|days|hour|hours)\.? ago)\b/g,'AGO').replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?/g,'DT');
  t=t.replace(/'sha256-[A-Za-z0-9+\/=]+'/g,"'HASH'");
  t=t.replace(/<DIV [^>]*class="?cls-art-l[^>]*>/g,'<DIV cls-art-l>').replace(/(<I [^>]*class=mi-crest) style=[^>]*>/g,'$1>').replace(/ mi-lite\b/g,'').replace(/ loading=\w+/g,'').replace(/translate\([^)]*\)/g,'translate(P)').replace(/>\s+</g,'><').replace(/\s+/g,' ');/* loading: set when an image comes into view (timing). translate: the tab notch is placed with a one pixel difference between runs */
  return t }"""

STRICT = 'LROANCGS'
def count_lines(xs):
    c = {}
    for x in xs: c[x] = c.get(x, 0) + 1
    return '\n'.join(sorted('%s x%d' % kv for kv in c.items()))
def digest(t, mode):
    """ord: the order inside each class of calls (R, A; and L, O when not in the boot step: the boot interleaves listener registrations by timing).
    set: the calls with counts (L R O A N C G S), plus the distinct timer delays and attribute writes (T, P, Y: their count depends on frame timing; P d= is the tab notch path, drawn frame by frame).
    In the boot step ('home') only the distinct set of N C G S A is used, because the deferred loader and the observers race."""
    import re
    boot = mode == 'boot'
    t = [x for x in t if x and not (x[0] == 'T' and int(x.split()[2]) < 100)]   # short timers (retries, polling) come and go with timing
    if boot: t = [x for x in t if not (x[0] == 'O' and re.search(r'#(bld|steps)\b', x)) and 'SCRIPT' not in x]   # the builder and the deferred scripts attach at their own pace
    cls = lambda k: [x for x in t if x[0] == k]
    boot = mode == 'boot'
    ordh = sha('|'.join('\n'.join(cls(k)) for k in ('RA' if boot else 'LROA'))) if mode != 'loose' else ''
    if boot or mode == 'loose':
        s = count_lines(cls('L') + cls('R')) + '\n--\n' + '\n'.join(sorted(set(x for x in t if x[0] in 'ONCGSA')))
        if mode == 'loose': s = '\n'.join(sorted(set(x for x in t if x[0] in 'LROANCGSTY' and not re.match(r'P \S+ d=', x))))
    else:
        loose = sorted(set(x for x in t if x[0] in 'TPY' and not re.match(r'P \S+ d=', x)))
        s = count_lines([x for x in t if x[0] in STRICT]) + '\n--\n' + '\n'.join(loose)
    return ordh, sha(s)

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
        ctx = b.new_context(viewport={'width': W, 'height': H}, service_workers='block')
        ctx.add_init_script(INIT); ctx.add_init_script(seed_js(seed))
        pg = ctx.new_page(); pg.set_default_timeout(120000)
        pg.on('pageerror', lambda e: errs.append(vp + ' ' + str(e)[:200]))
        def asks(ok=False):
            for _ in range(3):
                pg.evaluate("(ok)=>{var b=document.querySelector('#askOk,#askBox .ok,[data-ask-ok]'); if(!ok){var c=document.querySelector('#askNo,#askBox .no,[data-ask-no]'); if(c){c.click();return}} if(b&&ok) b.click()}", ok)
                pg.wait_for_timeout(150)
        def settle():
            dom = pg.evaluate(NORM)
            for _ in range(20):
                pg.wait_for_timeout(500); d2 = pg.evaluate(NORM)
                if d2 == dom: break
                dom = d2
            return dom
        def begin(): pg.evaluate("()=>{window.__fxRec.reset(1); window.__fxRec.on(true)}")
        def snap(name):
            pg.wait_for_timeout(2600)   # the longest effect ends (setTimeout 2300 and the like)
            dom = settle()
            rec = pg.evaluate("()=>{window.__fxRec.on(false); const r=window.__fxRec.take(); const w=Object.keys(window).sort().join(','); return {t:r.t,f:r.f,i:r.i,live:r.live,w:w}}")
            t = rec['t']; ordh, sethash = digest(t, 'boot' if name == 'home' else 'loose' if re.search(r'hover|scroll|builder', name) else 'strict')
            live = sorted('%s %d' % (k, v) for k, v in rec['live'].items() if v)
            if DUMP:
                os.makedirs(DUMP, exist_ok=True); n = ('%s %s %s' % (vp, tag, name)).replace(' ', '_')
                open(os.path.join(DUMP, n + '.trace.txt'), 'w').write('\n'.join(t)); open(os.path.join(DUMP, n + '.live.txt'), 'w').write('\n'.join(live)); gzip.open(os.path.join(DUMP, n + '.dom.txt.gz'), 'wt').write(dom)
            h['%s %s %s' % (vp, tag, name)] = {'ord': ordh, 'set': sethash, 'dom': sha(dom), 'win': sha(rec['w']), 'lis': sha('\n'.join(live)), 'n': len(t)}
        def ready():
            pg.wait_for_function("()=>!!window.__deferDone", timeout=180000)
            pg.evaluate("()=>window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=180000)
            pg.wait_for_timeout(2500)
        def click(sel, nth=0):
            return pg.evaluate("([s,n])=>{var e=document.querySelectorAll(s)[n]; if(!e) return false; e.click(); return true}", [sel, nth])
        def esc():
            pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
            pg.evaluate("()=>{ var c=document.querySelector('#sheet.on #sheetClose,#sheet.on [data-close]'); if(c) c.click(); var l=document.querySelector('#lib.on [data-libclose],#lib.on .lib-x'); if(l) l.click() }"); pg.wait_for_timeout(400)
        def hooks(t0):
            # the fx hooks that the sheet and the builder call (window.__mi*, __dice3d), each with several argument sets, one trace segment per hook
            begin()
            names = pg.evaluate("""async ()=>{ const names=Object.keys(window).filter(k=>/^__mi|^__dice3d$|^__fx/.test(k)&&!/Reload|Music|Pref/.test(k)&&typeof window[k]==='function').sort();
              const sets=[()=>[200,300],()=>[document.querySelector('.card')||document.body],()=>['Test',200,300],()=>[20],()=>[200,300,'#fc0',70],()=>[]];
              for(const n of names){ window.__fxRec.seed(7); window.__fxRec.mark(n);
                for(const mk of sets){ try{ const r=window[n].apply(window,mk()); if(r&&typeof r.then==='function') r.catch(()=>{}) }catch(e){ window.__fxRec.note(String(e).slice(0,40)) } }
                window.__fxRec.mark('~'); await new Promise(r=>setTimeout(r,60)) }
              return names }""")
            pg.wait_for_timeout(2600); settle()
            t = pg.evaluate("()=>{window.__fxRec.on(false); return window.__fxRec.take().t}")
            seg = {}; cur = '_'
            for x in t:
                if x.startswith('M '): cur = x[2:]; seg.setdefault(cur, [])
                elif cur != '~' and cur != '_': seg.setdefault(cur, []).append(x)
            for n, xs in seg.items():
                if n == '~': continue
                h['%s %s hook %s' % (vp, t0, n)] = {'set': digest(xs, 'loose')[1], }
            h['%s %s hooks all' % (vp, t0)] = {'names': sha(','.join(names))}
        def inter(t0):
            begin(); snap('%s sheet' % t0)
            for t in TABS:
                begin(); click('.tab[data-tab="%s"]' % t); snap('%s tab %s' % (t0, t))
            click('.tab[data-tab="p-actions"]'); pg.wait_for_timeout(500)
            begin(); pg.mouse.move(W // 2, H // 3); pg.mouse.move(W // 2 + 40, H // 3 + 30, steps=4); pg.mouse.move(W // 3, H // 2, steps=4); snap('%s hover' % t0)
            begin(); pg.evaluate("()=>window.scrollTo(0,400)"); pg.wait_for_timeout(300); pg.evaluate("()=>window.scrollTo(0,0)"); snap('%s scroll' % t0)
            begin(); click('[data-hpadd]', 0); snap('%s hp0' % t0)
            begin(); click('[data-hpadd]', 1); snap('%s hp1' % t0)
            begin(); click('[data-ck]', 0); snap('%s check0' % t0)
            begin(); click('[data-ck]', 1); snap('%s check1' % t0)
            begin(); click('[data-mi-dice]'); snap('%s dice' % t0); esc()
            begin(); click('[data-bd]', 0); snap('%s breakdown' % t0); esc()
            for tab, nm in (('p-spells', 'spell'), ('p-feat', 'feat'), ('p-inv', 'item'), ('p-actions', 'action')):
                click('.tab[data-tab="%s"]' % tab); pg.wait_for_timeout(300)
                begin(); pg.evaluate("(t)=>{var e=document.querySelector('#'+t+' [data-info]'); if(e) e.click()}", tab); snap('%s detail %s' % (t0, nm)); esc()
            begin(); click('#srchBtn'); snap('%s search' % t0); esc()
            begin(); click('#libBtn'); snap('%s library' % t0); esc()
            begin(); click('#themeBtn'); snap('%s theme' % t0); esc()
            begin(); click('#healBtn'); snap('%s heal' % t0); esc()
            begin(); pg.evaluate("()=>{var e=document.querySelector('[data-rest],#restBtn,[data-open-rest]'); if(e) e.click()}"); snap('%s rest' % t0); asks(False); esc()
            hooks(t0)
        try:
            pg.goto(base); ready(); asks(False)
            steps(pg, snap, inter, click, asks, begin)
        finally:
            ctx.close()

    def stepA(pg, snap, inter, click, asks, begin):
        try: pg.wait_for_selector('#homeV .hwrap', state='attached', timeout=30000)
        except Exception: pass
        snap('home')
        begin(); click('[data-hview]'); pg.wait_for_timeout(2500)
        inter('A')
    def stepB(pg, snap, inter, click, asks, begin):
        snap('home')
        begin(); click('[data-hview]'); pg.wait_for_timeout(2500)
        inter('B')
    def stepC(pg, snap, inter, click, asks, begin):
        snap('home')
        pg.wait_for_function("typeof window.__bldOpen==='function'", timeout=180000)
        begin(); pg.evaluate("""()=>{ var b=Array.from(document.querySelectorAll('#homeV button, #homeV a')).find(x=>/Create a Character/.test(x.textContent)); if(b) b.click() }""")
        pg.wait_for_timeout(4000); asks(True); snap('builder')
        begin()
        try:
            pg.select_option('#qbCls', 'Fighter'); click('[data-qb]'); pg.wait_for_timeout(2500); asks(True)
            click('#b-toSheet'); pg.wait_for_timeout(3500); asks(True)
        except Exception as ex:
            errs.append('C flow ' + str(ex)[:120])
        inter('C')

    if 'A' in SCEN: scenario('A', YUDHI, stepA)
    if 'B' in SCEN:
        cache = os.environ.get('FXSNAP_C_CACHE')
        if cache and os.path.exists(cache): C = open(cache).read()
        else:
            g = json.load(open(os.path.join(HERE, 'golden', 'builds', GOLD))); e = (g if isinstance(g, list) else [g])[0]
            ctx = b.new_context(viewport={'width': W, 'height': H}, service_workers='block'); pg = ctx.new_page(); pg.set_default_timeout(180000)
            pg.goto(base); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(4000)
            C = pg.evaluate("async (a)=>{ if(window.__bldNeed) await window.__bldNeed(); return JSON.stringify(window.__bldSheetFor(a[0],a[1])) }", [e['build'], e.get('fxT')])
            ctx.close()
            if cache: open(cache, 'w').write(C)
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
    print('fx snapshot %d steps, total %s, page errors %d' % (len(h), tot, len(errs)))
    for e in errs[:5]: print('  ', e)
main()
