#!/usr/bin/env python3
"""Guard D (dependency inversion): bare window.* reads and writes outside the env modules.
Counts every `window` use (window.X, window[...]) per src JS file, split into reads and writes, after comments and strings are blanked.
Env modules are found by name (any file called *env.js, today src/builder/00-env.js, later the UI one) and are exempt: that is the one place that may know window.
Violation: a file whose count is above its baseline (a new file has baseline 0). Baseline: tests/guard_baseline/guard_window.json.
Run: python3 tests/guard_window.py [--root DIR] [--verbose] [--enforce | --strict] [--update-baseline]
--update-baseline rewrites the baseline: use it DELIBERATELY after review (when a stage lowered the counts, to lock the gain), never to hide a new violation."""
import re, sys
from guard_lib import *
o = parse_args('guard_window')
R = re.compile(r'\bwindow\b(?:\s*\.\s*([A-Za-z_$][\w$]*)|\s*\[)?')
cur = {}; detail = {}; exempt = []
for f in manifest_files(o['root']):
    if is_env(f): exempt.append(f); continue
    code = stripped(o['root'], f); rd = wr = 0; names = {}
    for m in R.finditer(code):
        tail = code[m.end():m.end() + 6]; w = re.match(r'\s*(=(?!=)|\+=|-=|\|\|=|\?\?=|&&=)', tail)
        wr += 1 if w else 0; rd += 0 if w else 1
        nm = m.group(1) or '[]'; names[nm] = names.get(nm, 0) + 1
    if rd + wr: cur[f] = {'reads': rd, 'writes': wr, 'total': rd + wr}; detail[f] = names
base = load_baseline('guard_window')
if o['update']:
    save_baseline('guard_window', {f: v['total'] for f, v in cur.items()}); print('baseline written: %d files, %d uses' % (len(cur), sum(v['total'] for v in cur.values()))); sys.exit(0)
bl = (base or {})
viol = []; new = []
for f, v in sorted(cur.items(), key=lambda kv: -kv[1]['total']):
    viol.append(f)
    if v['total'] > bl.get(f, 0): new.append(f)
tot = sum(v['total'] for v in cur.values())
print('guard_window: env modules (exempt): %s' % (', '.join(exempt) or 'none'))
print('guard_window: %d files use window, %d uses (reads %d, writes %d)' % (len(cur), tot, sum(v['reads'] for v in cur.values()), sum(v['writes'] for v in cur.values())))
lim = None if o['verbose'] else 15
for f in (viol if lim is None else viol[:lim]):
    v = cur[f]; top = ', '.join('%s x%d' % kv for kv in sorted(detail[f].items(), key=lambda kv: -kv[1])[:4])
    print('  %-62s r%-3d w%-3d base %-3s %s  [%s]' % (f, v['reads'], v['writes'], bl.get(f, 0), 'NEW/UP' if f in new else '', top))
if lim and len(viol) > lim: print('  ... %d more files (use --verbose)' % (len(viol) - lim))
for f in new: print('NEW window use: %s %d -> %d (was %d)' % (f, 0, cur[f]['total'], bl.get(f, 0)))
sys.exit(finish(o, 'guard_window', tot, len(new), {'files': len(cur), 'uses': tot, 'new_files': new}))
