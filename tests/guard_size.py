#!/usr/bin/env python3
"""Guard S (single responsibility): line and branch budgets per file and per function.
Budgets (offender when above): file > 300 lines, function > 60 lines, function > 20 branches. Branches = if, else-if, case, for, while, catch, ?:, && and || (comments and strings blanked).
A function counts with its inner functions (the whole span). Code files only (src/app, builder, fx, learn, tg, boot), not src/data (tables).
Violation: an offender that is not in the baseline, or an offender that grew (lines or branches). Baseline: tests/guard_baseline/guard_size.json.
Run: python3 tests/guard_size.py [--root DIR] [--top N] [--enforce | --strict] [--update-baseline]
--update-baseline is for deliberate use only (after review, or to lock a gain), never to hide growth."""
import re, sys
from guard_lib import *
o = parse_args('guard_size')
FL, FNL, FNB = 300, 60, 20
TOP = int(o['rest'][o['rest'].index('--top') + 1]) if '--top' in o['rest'] else 20
BR = re.compile(r'\bif\b|\bcase\b|\bfor\b|\bwhile\b|\bcatch\b|&&|\|\||\?(?![.?:])')
files = {}; funcs = {}
for f in manifest_files(o['root']):
    if f.startswith('data/'): continue
    c = stripped(o['root'], f); files[f] = c.count('\n') + 1
    fn = find_functions(c); keys = unique_keys(['%s::%s' % (f, x[0]) for x in fn])
    for k, x in zip(keys, fn):
        funcs[k] = {'lines': x[2] - x[1] + 1, 'branches': len(BR.findall(c[x[3]:x[4]])), 'at': x[1]}
cur = {'files': {f: n for f, n in files.items() if n > FL},
       'funcs': {k: [v['lines'], v['branches']] for k, v in funcs.items() if v['lines'] > FNL or v['branches'] > FNB}}
if o['update']:
    save_baseline('guard_size', cur); print('baseline written: %d files, %d functions over budget' % (len(cur['files']), len(cur['funcs']))); sys.exit(0)
bl = load_baseline('guard_size') or {'files': {}, 'funcs': {}}
new = []
for f, n in cur['files'].items():
    if n > bl['files'].get(f, 0) and (f not in bl['files'] or n > bl['files'][f]): new.append('file %s %d lines (baseline %s)' % (f, n, bl['files'].get(f, '-')))
for k, (l, b) in cur['funcs'].items():
    ol, ob = bl['funcs'].get(k, [0, 0])
    if l > ol and l > FNL or b > ob and b > FNB: new.append('function %s %d lines %d branches (baseline %s)' % (k, l, b, bl['funcs'].get(k, '-')))
print('guard_size: budgets file %d lines, function %d lines or %d branches. Over budget: %d files, %d functions (of %d functions)' % (FL, FNL, FNB, len(cur['files']), len(cur['funcs']), len(funcs)))
print('  top %d largest functions (lines, branches):' % TOP)
for k, v in sorted(funcs.items(), key=lambda kv: -kv[1]['lines'])[:TOP]: print('   %5d %4d  %s (line %d)' % (v['lines'], v['branches'], k, v['at']))
print('  top 5 largest files:'); 
for f, n in sorted(files.items(), key=lambda kv: -kv[1])[:5]: print('   %5d  %s' % (n, f))
for m in new: print('NEW/GROWN:', m)
sys.exit(finish(o, 'guard_size', len(cur['files']) + len(cur['funcs']), len(new), {'files_over': len(cur['files']), 'funcs_over': len(cur['funcs'])}))
