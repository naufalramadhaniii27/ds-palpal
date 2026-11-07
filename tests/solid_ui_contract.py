#!/usr/bin/env python3
"""Contract test for the UI registries of the sheet (SOLID stage 3, O and L). See the contract text in src/app/06a-logic-ui-registry.js.
Static checks (no browser): the sheet files reach the page only through env (no window.NAME outside the browser API list), every window name used through env is declared in 00-env.js.
Browser checks, on a loaded sheet (Yudhi fixture), for each registry DETAIL, ENTRY, PALWORD, CTXSRC:
  1. every registered entry has the required fields and the agreed signature (arity)
  2. no entry function reads window (the function source has no `window`)
  3. every entry answers the agreed shape when it is called (detail cards and sheet entries with a real probe and with a missing key, command words, long-press sources)
  4. O: a NEW entry registered from outside is used by the dispatcher with no other edit (a detail card opens, a command word shows in Search, a long-press menu opens)
Run: python3 tests/solid_ui_contract.py [--root DIR]"""
import os, re, sys, json, glob, socket, threading, http.server, functools
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if '--root' in a: ROOT = os.path.abspath(a[a.index('--root') + 1])
BROWSER = set('addEventListener removeEventListener matchMedia innerWidth innerHeight scrollY scrollX scrollTo scrollBy getSelection open location history navigator requestAnimationFrame cancelAnimationFrame setTimeout clearTimeout setInterval clearInterval fetch showSaveFilePicker screen visualViewport devicePixelRatio dispatchEvent document print close focus getComputedStyle Notification crypto indexedDB performance localStorage sessionStorage BroadcastChannel IntersectionObserver ResizeObserver MutationObserver PerformanceObserver Image CSS isSecureContext opener parent top self BarcodeDetector CompressionStream DecompressionStream documentPictureInPicture launchQueue scheduler claude'.split())
fails = []; n = 0
def chk(name, ok, info=''):
    global n
    n += 1
    if not ok: fails.append('%s %s' % (name, info)); print('FAIL', name, info)

# 1. static: window access
def code_of(t):
    t = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
    return re.sub(r'(^|[^:])//[^\n]*', r'\1', t)
envsrc = open(os.path.join(ROOT, 'src/app/00-env.js'), encoding='utf-8').read()
bound = set(re.findall(r'"([A-Za-z_$][\w$]*)"', envsrc))
used = set()
for f in sorted(glob.glob(os.path.join(ROOT, 'src/app/*.js'))):
    b = os.path.basename(f)
    if b.endswith('env.js'): continue
    t = code_of(open(f, encoding='utf-8').read())
    for m in re.finditer(r'\bwindow\.([A-Za-z_$][\w$]*)', t):
        if m.group(1) not in BROWSER: chk('static %s window.%s' % (b, m.group(1)), False, 'use env.%s' % m.group(1))
    pre = 'PGE' if b.startswith('29') else 'env'   # file 29 has local variables named env (the creature spell environment): it imports env as PGE
    for m in re.finditer(r'(?<![\w.\-/$])' + pre + r'\.([A-Za-z_$][\w$]*)', t): used.add(m.group(1))
chk('static: window access of the sheet only through env', True)
chk('static: every env name used is declared in 00-env.js', not (used - bound), str(sorted(used - bound)[:10]))
chk('static: registry module has no window', 'window' not in code_of(open(os.path.join(ROOT, 'src/app/06a-logic-ui-registry.js'), encoding='utf-8').read()).replace('env.__uiReg', ''))

from playwright.sync_api import sync_playwright
YUDHI = open(os.path.join(HERE, 'fixtures', 'yudhi-v3.json'), encoding='utf-8').read()
def serve():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return 'http://127.0.0.1:%d/index.html' % port
PROBE = r"""()=>{
  const R=window.__uiReg, out={reg:{}, err:[]};
  const fnsrc=(f)=>String(f);
  for(const name of Object.keys(R)){
    const r=R[name]; out.reg[name]={keys:r.keys(), req:r.req, items:[]};
    r.keys().forEach(k=>{ const e=r.get(k); const o={k:k, fields:{}, src:{}}; Object.keys(r.req).forEach(f=>{ o.fields[f]=typeof e[f]; if(typeof e[f]==='function'){ o.src[f]=/\bwindow\s*(\.[A-Za-z_$]|\[)/.test(fnsrc(e[f])); o['len_'+f]=e[f].length } }); out.reg[name].items.push(o) });
  }
  const shape=(v,keys)=>v&&typeof v==='object'&&keys.every(k=>typeof v[k]==='string');
  /* DETAIL */
  const P={sp:'0',spn:'Fireball',mi:'x',lib:'spell|Fireball',g:'Dash',cr:'none|x',xd:'0',spx:'',f:'0.0',grp:'0',w:'0',it:'0'};
  out.detail={};
  R.detail.keys().forEach(k=>{ const e=R.detail.get(k); const r1={};
    for(const [lab,key] of [['probe',P[k]!==undefined?P[k]:'0'],['missing','99999|zz']]){ try{ const v=e.render(key); r1[lab]=shape(v,['t','h']) }catch(x){ r1[lab]='THROW '+String(x).slice(0,60) } }
    try{ if(e.self) r1.self=typeof e.self(P[k]!==undefined?P[k]:'0') }catch(x){ r1.self='THROW '+String(x).slice(0,60) }
    out.detail[k]=r1 });
  /* ENTRY */
  out.entry={};
  const EP={bd:{type:'bd',key:'ac'},cond:{type:'cond'},combat:{type:'combat'},spman:{type:'spman'},search:{type:'search'},cuq:{type:'cuq',key:'x'},cust:{type:'cust',key:'x',n:'x'}};
  R.entry.keys().forEach(k=>{ try{ const v=R.entry.get(k).content(EP[k]||{type:k}); out.entry[k]=shape(v,['t','h','m']) }catch(x){ out.entry[k]='THROW '+String(x).slice(0,60) } });
  /* PALWORD */
  out.pal={words:0, bad:[]};
  R.palword.keys().forEach(k=>{ try{ const W=R.palword.get(k).words(); if(!Array.isArray(W)){ out.pal.bad.push(k+': words() is not an array'); return }
    W.forEach(w=>{ out.pal.words++; if(!Array.isArray(w.k)||!w.k.length||!w.k.every(x=>typeof x==='string')) out.pal.bad.push(k+': k'); if(typeof w.f!=='function'||w.f.length!==0){ out.pal.bad.push(k+': f'); return }
      try{ const c=w.f(); if(!(c&&typeof c.i==='string'&&typeof c.t==='string'&&(typeof c.run==='function'||typeof c.fill==='string'))) out.pal.bad.push(k+'/'+w.k[0]+': command shape') }catch(x){ out.pal.bad.push(k+'/'+w.k[0]+': THROW '+String(x).slice(0,60)) } }) }catch(x){ out.pal.bad.push(k+': THROW '+String(x).slice(0,60)) } });
  /* CTXSRC */
  out.ctx={bad:[]};
  R.ctxsrc.keys().forEach(k=>{ const e=R.ctxsrc.get(k); try{ document.querySelector(e.sel) }catch(x){ out.ctx.bad.push(k+': selector') } });
  /* OVERLAY */
  out.ov={bad:[]};
  R.overlay.keys().forEach(k=>{ try{ const v=R.overlay.get(k).top(); if(!(v===null||typeof v==='function')) out.ov.bad.push(k+': top() is not function or null') }catch(x){ out.ov.bad.push(k+': THROW '+String(x).slice(0,60)) } });
  return out }"""

with sync_playwright() as p:
    base = serve(); b = p.chromium.launch()
    ctx = b.new_context(viewport={'width': 1250, 'height': 850}, service_workers='block'); pg = ctx.new_page(); pg.set_default_timeout(120000)
    errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    ctx.add_init_script("(function(){try{ if(sessionStorage.getItem('__seeded')) return; sessionStorage.setItem('__seeded','1'); localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', %s) }catch(e){} })()" % json.dumps(YUDHI))
    pg.goto(base); pg.wait_for_function("()=>!!window.__deferDone", timeout=180000); pg.wait_for_timeout(2500)
    pg.evaluate("()=>{var b=document.querySelector('[data-hview]'); if(b) b.click()}"); pg.wait_for_timeout(2500)
    o = pg.evaluate(PROBE)
    exp = {'detail': ['spn', 'mi', 'lib', 'g', 'cr', 'xd', 'sp', 'spx', 'f', 'grp', 'w', 'it'], 'entry': ['bd', 'cond', 'combat', 'spman', 'search', 'cuq', 'cust'], 'ctxsrc': ['inventory-row', 'spell-row', 'feature-item', 'action-row'], 'panel': ['p-main', 'p-skills', 'p-actions', 'p-spells', 'p-inv', 'p-feat', 'p-desc', 'p-notes', 'p-ext'], 'overlay': ['context-menu', 'ask', 'training-ground', 'learn', 'builder', 'hp-quick-menu', 'backup-window', 'sheet', 'home'], 'searchgrp': ['spells', 'attacks', 'inventory', 'features', 'rules', 'other-spells']}
    for name, keys in exp.items():
        chk('%s: expected entries are registered' % name, [k for k in keys if k not in o['reg'][name]['keys']] == [], str(o['reg'][name]['keys']))
    chk('palword: providers registered', len(o['reg']['palword']['keys']) >= 26, str(o['reg']['palword']['keys']))
    for name, r in o['reg'].items():
        for it in r['items']:
            for f, t in it['fields'].items():
                want = r['req'][f]; opt = want.endswith('?'); want = want.rstrip('?')
                chk('%s/%s field %s' % (name, it['k'], f), t == ('function' if want == 'function' else 'object' if want == 'array' else want) or (opt and t == 'undefined'), t)
            for f, s in it['src'].items(): chk('%s/%s %s does not read window' % (name, it['k'], f), not s)
            for f in r['req']:
                if 'len_' + f in it and f in ('render', 'content', 'build', 'self'): chk('%s/%s %s takes one argument' % (name, it['k'], f), it['len_' + f] == 1, str(it['len_' + f]))
            if 'len_words' in it: chk('%s/%s words takes no argument' % (name, it['k']), it['len_words'] == 0)
    for k, r1 in o['detail'].items():
        chk('detail/%s answers {t,h} for a probe' % k, r1.get('probe') is True, str(r1))
        chk('detail/%s answers {t,h} for a missing key' % k, r1.get('missing') is True, str(r1))
        if 'self' in r1: chk('detail/%s self answers a string' % k, r1['self'] == 'string', str(r1))
    for k, v in o['entry'].items(): chk('entry/%s answers {t,h,m}' % k, v is True, str(v))
    chk('palword: every word has k and f() answers {i,t,run} (%d words)' % o['pal']['words'], not o['pal']['bad'], str(o['pal']['bad'][:5]))
    chk('overlay: top() answers a function or null for every layer', not o['ov']['bad'], str(o['ov']['bad']))
    chk('ctxsrc: selectors are valid', not o['ctx']['bad'], str(o['ctx']['bad']))
    # O: new entries from outside, no other edit
    pg.evaluate("""()=>{ const R=window.__uiReg;
      R.detail.add('zz-card',{render:function(k){ return {t:'ZZ title '+k,h:'<p class="info-d">ZZ body '+k+'</p>'} }});
      R.palword.add('zz-cmd',{words:function(){ return [{k:['zzcommand'],f:function(){ return {i:'ui-info',t:'ZZ command',s:'added by the test',run:function(){}} }}] }});
      R.ctxsrc.add('zz-ctx',{sel:'#zzctx',build:function(el){ return {t:'ZZ menu',L:[['ZZ item','ui-info',function(){}]],el:el} }});
      R.searchgrp.add('zz-grp',{build:function(x){ return ['ZZ group',[['sp:0','ZZ row','added by the test','tab-spells']]] }});
      const d=document.createElement('button'); d.id='zzctx'; d.setAttribute('data-info','zz-card:7'); d.textContent='zz'; document.body.appendChild(d) }""")
    pg.evaluate("()=>document.getElementById('zzctx').click()"); pg.wait_for_timeout(800)
    chk('O: a new detail card opens through data-info with no dispatcher edit', pg.evaluate("()=>/ZZ body 7/.test((document.getElementById('sheetBody')||{}).innerHTML||'')"))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    pg.evaluate("()=>document.getElementById('srchBtn').click()"); pg.wait_for_timeout(600); pg.keyboard.type('zzcommand'); pg.wait_for_timeout(800)
    chk('O: a new command word shows in Search with no dispatcher edit', pg.evaluate("()=>/ZZ command/.test((document.getElementById('sheetBody')||{}).innerHTML||'')"))
    pg.keyboard.press('Control+a'); pg.keyboard.type('Fire'); pg.wait_for_timeout(800)
    chk('O: a new search group shows in Search with no dispatcher edit', pg.evaluate("()=>/ZZ group \\(1\\)/.test((document.getElementById('sheetBody')||{}).innerHTML||'')"))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    pg.evaluate("()=>{ const e=document.getElementById('zzctx'); e.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:20,clientY:20})) }"); pg.wait_for_timeout(500)
    chk('O: a new long-press source opens its menu with no dispatcher edit', pg.evaluate("()=>/ZZ item/.test((document.getElementById('ctxm')||{}).innerHTML||'')"))
    chk('no page errors', not errs, '; '.join(errs[:3]))
    b.close()
print('solid_ui_contract: %d checks, %d failed' % (n, len(fails)))
sys.exit(1 if fails else 0)
