#!/usr/bin/env python3
"""Invariant sweep over the sheet data C that the builder makes (window.__bldFuzz, the Quick Build fill, then __deriveFor).
Found by the Warden Interrupt case (tests/dup_check.py): one bug of a kind was only found by chance, so this builds many sheets and
asserts rules that must hold for every one.

Builds (all sources on):  every class x level 1, 5, 10, 20 (no subclass);  every subclass at level 20 and at its first level;
every species and every background at level 1 and 10 (as a Fighter, which has no spells to hide behind).
Invariants per sheet: no duplicate action / feature / resource / attack / spell rows; every limited-use resource (C.res) and every action (C.acts)
belongs to a feature or item on the sheet; no feature card without text, none with "undefined", "NaN" or "[object"; no non-finite number
anywhere in C or in the derived sheet (AC, HP, speed, initiative, saves, skills, attack bonuses, spell DC); AC, HP and speed in range;
proficiency bonus matches the level; spell slots match the caster table; resource maximum >= 1; every [[link]] has a target; fxToggles ids unique.

Run: python3 tests/invariants.py [--root DIR] [--quick] [--json OUT]. Exit 1 on any violation. --quick runs every 8th build (for a fast look)."""
import json, os, sys, time, collections
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if '--root' in sys.argv: ROOT = os.path.abspath(sys.argv[sys.argv.index('--root') + 1])
QUICK = '--quick' in sys.argv
OUTJ = sys.argv[sys.argv.index('--json') + 1] if '--json' in sys.argv else None
ONLY = sys.argv[sys.argv.index('--only') + 1] if '--only' in sys.argv else None
SHARD = sys.argv[sys.argv.index('--shard') + 1] if '--shard' in sys.argv else None   # "i/n": run builds i, i+n, ... (the parent starts one process per core)
WORKERS = int(sys.argv[sys.argv.index('--workers') + 1]) if '--workers' in sys.argv else min(2, os.cpu_count() or 1)

CHECK = r"""(o)=>{
  const bad=[]; const V=(code,msg)=>bad.push([code,String(msg).slice(0,200)]);
  let r; try{ r=window.__bldFuzz(o); }catch(e){ return {bad:[['builder-error',String(e).slice(0,160)]]}; }
  if(!r||r.err) return {bad:[['builder-error',String(r&&r.err||'no result').split('\n')[0].slice(0,160)]]};
  const C=r.c; let d; try{ d=window.__deriveFor(C); }catch(e){ d={err:String(e)}; }
  if(!d||d.err) V('derive-error',String(d&&d.err||'').split('\n')[0]);
  const feats=[]; const names=new Set();
  (C.features||[]).forEach(g=>(g.items||[]).forEach(it=>{ feats.push([g.g,it]); names.add(String(it.n).toLowerCase()); }));
  const invN=(C.inv||[]).map(x=>String(x.n).toLowerCase());
  const spN=new Set((C.spells||[]).map(x=>String(x.n).toLowerCase())); const allTxt=feats.map(([g,it])=>(String(it.d)+' '+String(it.full)).toLowerCase()).join(' ');
  const known=n=>{ n=String(n||'').toLowerCase(); if(!n) return false; if(names.has(n)||spN.has(n)) return true; return invN.some(i=>i===n||i.indexOf(n)>=0||n.indexOf(i)>=0); };
  /* 1 duplicates */
  const dup=(code,list,keyf)=>{ const s={}; list.forEach(x=>{ const k=keyf(x); s[k]=(s[k]||0)+1; }); Object.keys(s).forEach(k=>{ if(s[k]>1) V(code,k+' x'+s[k]); }); };
  dup('dup-action',C.acts||[],a=>a.k+'|'+a.n+'|'+a.g);
  dup('dup-action-row',C.actions||[],a=>a.c+'|'+a.n);
  (C.features||[]).forEach(g=>dup('dup-feature',(g.items||[]).filter(i=>!(g.g==='Eldritch Invocations'&&/Repeatable/i.test(String(i.d)+String(i.full)))),i=>g.g+' / '+i.n+' @'+(i.s||'')));
  dup('dup-resource-key',C.res||[],x=>x.k);
  dup('dup-resource-name',C.res||[],x=>x.n+' ('+(x.f||'')+', '+x.reset+')');
  dup('dup-attack',C.attacks||[],a=>a.n+' '+(a.sub||''));
  dup('dup-spell',C.spells||[],s=>s.n+' ['+(s.src||'')+'; '+(s.use||'')+']');/* one row per grant (always prepared, at will, free cast) is fine */
  dup('dup-fxToggle',C.fxToggles||[],t=>t.id);
  dup('dup-defense',C.defenses||[],x=>x.t+'|'+x.v+'|'+x.s);
  dup('dup-savenote',C.saveNotes||[],x=>x.t+'|'+x.s);
  /* 2 resources and actions belong to the sheet */
  /* Data requests (reports/requests.md, 2026-11-04): limited uses whose owner feature has no card on the sheet. Listed so a new case still fails. */
  const KNOWN_DATA=new Set(['x-memento-mori','x-jolt-to-life','x-reanimated-companion','x-jinx-points','x-arcane-bloodletting','x-aura-of-war','x-empower-aura','x-improved-genius','x-pretty-sure-it-s-over-here','x-facilitated-revival-raise-dead','x-hemomantic-recovery','x-imbalance-humors','x-legacy-false-life','x-legacy-mirror-image']);
  const resN=new Set((C.res||[]).map(x=>String(x.n).toLowerCase())), resK=new Set((C.res||[]).map(x=>x.k));
  (C.res||[]).forEach(x=>{
    const a=x.f||x.own||x.n; if(!known(a)&&!known(x.n)&&allTxt.indexOf(String(x.n).toLowerCase())<0&&!feats.some(([g,it])=>String(x.n).toLowerCase().indexOf(String(it.n).toLowerCase())===0)&&!/^(hd|s\d|sp|pact)/.test(x.k)&&!KNOWN_DATA.has(x.k)) V('res-orphan',x.k+' "'+x.n+'" owner "'+(x.f||'')+'"');
    if(x.k!=='hd'&&!(typeof x.max==='number'&&isFinite(x.max)&&x.max>=1)) V('res-max',x.k+' max='+x.max);
  });
  (C.acts||[]).forEach(a=>{
    const f=a.f||a.n; if(!known(f)&&!known(a.n)) V('act-orphan',a.k+' "'+a.n+'" feature "'+(a.f||'')+'"');
  });
  /* 3 feature cards */
  feats.forEach(([g,it])=>{
    const t=String(it.d==null?'':it.d).trim(), ft=String(it.full==null?'':it.full).trim();
    if(!t&&!ft) V('feature-empty',g+' / '+it.n);
    if(/\bundefined\b|\bNaN\b|\[object/.test(t+' '+ft+' '+it.n+' '+(it.s||''))) V('feature-bad-text',g+' / '+it.n);
  });
  /* 4 numbers and text anywhere in C */
  const seen=new Set(); const links=new Set();
  (function walk(x,p){
    if(x==null){ return; }
    if(typeof x==='number'){ if(!isFinite(x)) V('nonfinite-C',p+'='+x); return; }
    if(typeof x==='string'){ if(/\bundefined\b|\bNaN\b|\[object/.test(x)&&p.indexOf('.html')<0) V('bad-text-C',p.replace(/\.\d+/g,'[]')+': '+x.slice(0,60)); let m; const re=/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/g; while((m=re.exec(x))) links.add(m[1].replace(/&#39;/g,"'")); return; }
    if(typeof x!=='object'||seen.has(x)) return; seen.add(x);
    for(const k in x){ if(x[k]===undefined){ if(!/^C\.attacks\.\d+\.(misc|miscSrc|dmgBonus)$/.test(p+'.'+k)) V('undefined-C',p+'.'+k); } else walk(x[k],p+'.'+k); }/* attack rows leave misc and dmgBonus open when there is nothing to add */
  })(C,'C');
  if(d&&!d.err){
    const seen2=new Set();
    (function walk(x,p){ if(x==null) return; if(typeof x==='number'){ if(!isFinite(x)) V('nonfinite-derived',p+'='+x); return; } if(typeof x!=='object'||seen2.has(x)) return; seen2.add(x);
      for(const k in x){ if(x[k]===undefined) V('undefined-derived',p+'.'+k); else walk(x[k],p+'.'+k); } })(d,'d');
    const isn=(v)=>typeof v==='number'&&isFinite(v);
    if(!isn(d.ac)||d.ac<5||d.ac>35) V('ac-range','ac '+d.ac);
    if(!isn(d.hpmax)||d.hpmax<o.lv||d.hpmax>o.lv*25+40) V('hp-range','hpmax '+d.hpmax+' at level '+o.lv);
    if(!isn(d.speed)||d.speed<=0||d.speed>150) V('speed-range','speed '+d.speed);
    if(!isn(d.init)) V('init-nan','init '+d.init);
    if(!isn(d.dc)) V('dc-nan','dc '+d.dc);
    const lvl=C.level, pb=2+Math.floor((lvl-1)/4);
    if(d.pb!==pb) V('pb-mismatch','pb '+d.pb+' at level '+lvl);
    if(lvl!==o.lv) V('level-mismatch','sheet level '+lvl+' wanted '+o.lv);
    ['STR','DEX','CON','INT','WIS','CHA'].forEach(k=>{ if(!isn(d.save&&d.save[k])) V('save-nan','save '+k+' '+(d.save&&d.save[k])); if(!isn(d.score&&d.score[k])||d.score[k]<1||d.score[k]>30) V('score-range','score '+k+' '+(d.score&&d.score[k])); });
    Object.keys(d.skill||{}).forEach(k=>{ if(!isn(d.skill[k])) V('skill-nan','skill '+k+' '+d.skill[k]); });
    Object.keys(d.atk||{}).forEach(k=>{ const v=d.atk[k]; if(typeof v==='number'&&!isn(v)) V('attack-nan','atk '+k); });
  }
  const sc=C.spellcasting||{};
  ['dc','atk','mod'].forEach(k=>{ if(sc[k]!=null&&!(typeof sc[k]==='number'&&isFinite(sc[k]))) V('spell-nan','spellcasting.'+k+'='+sc[k]); });
  if(!(typeof C.speed==='number'&&C.speed>0)) V('speed-C','C.speed '+C.speed);
  (C.attacks||[]).forEach(a=>{ ['misc','dmgBonus'].forEach(k=>{ if(a[k]!=null&&!(typeof a[k]==='number'&&isFinite(a[k]))) V('attack-nan',a.n+' '+k+'='+a[k]); }); });
  /* 5 spell slots vs the caster table */
  const FULL=[[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
  const ct=(window.__bldCasterOf&&window.__bldCasterOf(C.cls,C.sub))||o.caster||'';
  const slots=(sc.slots||[]).slice(), L=C.level; let exp=null;
  if(ct==='full') exp=FULL[L-1]; else if(ct==='half') exp=FULL[Math.ceil(L/2)-1]; else if(ct==='third') exp=L>=3?FULL[Math.ceil(L/3)-1]:[]; else if(ct==='pact'||ct==='none') exp=[];
  if(exp&&!(C.defenses||[]).some(function(d){return /^Extra spell slot/.test(d.v||'')})&&JSON.stringify(slots)!==JSON.stringify(exp)) V('slots-mismatch',C.cls+' ('+ct+') level '+L+': '+JSON.stringify(slots)+' expected '+JSON.stringify(exp));
  if(ct==='pact'&&!(sc.pact&&sc.pact.n>=1)&&!(sc.pact&&sc.pact[0]>=1)) V('slots-pact','pact '+JSON.stringify(sc.pact));
  /* 6 links */
  links.forEach(k=>{ if(!window.__linkKnown(k)&&!known(k)) V('link-unknown',k); });
  return {bad:bad, caster:ct};
}"""

def main():
    t0 = time.time(); res = []; errs = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1250, "height": 850}); pg.set_default_timeout(600000)
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.goto('file://' + os.path.join(ROOT, 'index.html')); pg.wait_for_timeout(1500)
        pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__deriveFor&&!!window.__bldData&&!!window.__linkKnown")
        D = pg.evaluate("()=>{const d=window.__bldData();const s={core:true,dmg:true,efa:true};(window.WX&&window.WX.src||[]).forEach(x=>{s[x.id]=true});"
                        "const cl={};Object.keys(d.classes).forEach(k=>{const c=d.classes[k];const subs={};Object.keys(c.subs||{}).forEach(n=>{const f=(c.subs[n]||[]).map(x=>x[0]).filter(x=>typeof x==='number');subs[n]=f.length?Math.min.apply(null,f):3});cl[k]={caster:c.caster||'',subs:subs}});"
                        "return {src:s,cl:cl,sp:Object.keys(d.species).filter(k=>!/\\(2014\\)$/.test(k)&&k!=='Custom'),bg:Object.keys(d.bgs).filter(k=>!/\\(2014\\)$/.test(k)&&(d.bgs[k].ab||[]).length===3)}}")
        thirds = pg.evaluate("()=>{const o={};['Eldritch Knight','Arcane Trickster'].forEach(k=>o[k]=1);return o}")
        src = D['src']; builds = []
        arr = [15, 14, 13, 12, 10, 8]
        def mk(cls, lv, sub='', sp='Human', bg='Acolyte', what=''):
            return {"cls": cls, "sp": sp, "bg": bg, "arr": arr, "b2": 0, "b1": 0, "lv": lv, "sub": sub, "src": src, "anySub": True, "what": what}
        for cls, c in D['cl'].items():
            for lv in (1, 5, 10, 20): builds.append(mk(cls, lv, what='%s L%d' % (cls, lv)))
            for sub, first in c['subs'].items():
                for lv in sorted({20, max(1, min(20, first))}): builds.append(mk(cls, lv, sub, what='%s/%s L%d' % (cls, sub, lv)))
        for sp in D['sp']:
            for lv in (1, 10): builds.append(mk('Fighter', lv, sp=sp, what='species %s L%d' % (sp, lv)))
        for bg in D['bg']:
            for lv in (1, 10): builds.append(mk('Fighter', lv, bg=bg, what='background %s L%d' % (bg, lv)))
        if QUICK: builds = builds[::8]
        if ONLY: keep = set(json.load(open(ONLY))); builds = [o for o in builds if o['what'] in keep]   # --only FILE.json: re-run the builds a former run listed
        if SHARD: si, sn = map(int, SHARD.split('/')); builds = builds[si::sn]
        print('invariants: %d builds%s' % (len(builds), ' (shard %s)' % SHARD if SHARD else ''), flush=True)
        for i, o in enumerate(builds):
            what = o.pop('what'); c = D['cl'][o['cls']]['caster']
            o['caster'] = 'third' if o['sub'] in thirds else (c if c in ('full', 'half', 'pact') else 'none')
            if o['caster'] == 'none' and o['sub'] and o['sub'] not in thirds: o['caster'] = ''   # a homebrew subclass may add casting: do not assume
            if not o['sub'] and c not in ('full', 'half', 'pact'): o['caster'] = 'none'
            try: r = pg.evaluate(CHECK, o)
            except Exception as e: r = {"bad": [['harness-error', str(e).split('\n')[0][:160]]]}
            for code, msg in r['bad']: res.append((code, msg, what))
            if (i + 1) % 300 == 0: print('  %d/%d  %.0fs' % (i + 1, len(builds), time.time() - t0), flush=True)
        b.close()
    groups = collections.OrderedDict()
    for code, msg, what in res: groups.setdefault(code, collections.OrderedDict()).setdefault(msg, []).append(what)
    n = len(builds); print('invariants %s (%d builds, %d violations in %d kinds, %d page errors, %.0fs)' % ('FAIL' if res else 'OK', n, len(res), len(groups), len(errs), time.time() - t0))
    for code, ms in groups.items():
        print('\n[%s] %d messages, %d hits' % (code, len(ms), sum(len(v) for v in ms.values())))
        for msg, w in list(ms.items())[:12]: print('   %s   <- %s%s' % (msg, ', '.join(w[:3]), ' (+%d)' % (len(w) - 3) if len(w) > 3 else ''))
        if len(ms) > 12: print('   ... %d more messages' % (len(ms) - 12))
    if errs: print('\npage errors:', errs[:5])
    if OUTJ: json.dump({c: {m: w for m, w in ms.items()} for c, ms in groups.items()}, open(OUTJ, 'w'), indent=1)
    sys.exit(1 if res else 0)
def parent():
    import subprocess, tempfile
    t0 = time.time(); tmp = tempfile.mkdtemp(); procs = []
    for i in range(WORKERS):
        out = os.path.join(tmp, 's%d.json' % i)
        cmd = [sys.executable, os.path.abspath(__file__), '--root', ROOT, '--shard', '%d/%d' % (i, WORKERS), '--json', out] + (['--quick'] if QUICK else []) + (['--only', ONLY] if ONLY else [])
        procs.append((subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True), out))
    groups = collections.OrderedDict(); total = 0; bad = 0
    for pr, out in procs:
        log = pr.communicate()[0]
        m = [l for l in log.splitlines() if l.startswith('invariants:')]
        if m: total += int(m[0].split()[1])
        if os.path.exists(out):
            for code, ms in json.load(open(out)).items():
                for msg, w in ms.items(): groups.setdefault(code, collections.OrderedDict()).setdefault(msg, []).extend(w)
        elif pr.returncode: bad += 1; print(log[-1500:])
    nv = sum(len(w) for ms in groups.values() for w in ms.values())
    print('invariants %s (%d builds, %d violations in %d kinds, %.0fs)' % ('FAIL' if nv or bad else 'OK', total, nv, len(groups), time.time() - t0))
    for code, ms in groups.items():
        print('\n[%s] %d messages, %d hits' % (code, len(ms), sum(len(v) for v in ms.values())))
        for msg, w in list(ms.items())[:12]: print('   %s   <- %s%s' % (msg, ', '.join(w[:3]), ' (+%d)' % (len(w) - 3) if len(w) > 3 else ''))
        if len(ms) > 12: print('   ... %d more messages' % (len(ms) - 12))
    if OUTJ: json.dump(groups, open(OUTJ, 'w'), indent=1)
    sys.exit(1 if nv or bad else 0)
if SHARD or WORKERS <= 1: main()
else: parent()
