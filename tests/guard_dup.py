#!/usr/bin/env python3
"""Guard DRY: duplicated code.
 1 token block detector: blocks of 12 or more consecutive normalized lines that appear twice (in one file or in two) in code files (src/app, builder, fx, learn, tg, boot; not src/data).
   Normalization: comments and strings kept as in source but whitespace collapsed, lines shorter than 6 characters (a lone } or ]) skipped. A block is reported once, as the maximal run.
   Violation: a maximal block whose first-window hash is not in tests/guard_baseline/guard_dup.json.
 2 tests/dup_check.py (the browser test: no action or feature card twice per class and level). Only with --browser (guard_all passes it when time allows); it needs Chromium and index.html.
Run: python3 tests/guard_dup.py [--root DIR] [--browser] [--min N] [--enforce | --strict] [--update-baseline]
--update-baseline is for deliberate use only (after review), never to hide a new duplicate."""
import re, sys, subprocess
from guard_lib import *
o = parse_args('guard_dup')
MIN = int(o['rest'][o['rest'].index('--min') + 1]) if '--min' in o['rest'] else 12
lines = []  # (file, lineno, normalized)
for f in manifest_files(o['root']):
    if f.startswith('data/'): continue
    raw = read(o['root'], f); c = stripped(o['root'], f).split('\n'); rl = raw.split('\n')
    for i, (cl, r) in enumerate(zip(c, rl)):
        n = re.sub(r'\s+', ' ', r).strip()
        if len(cl.strip()) < 6 or not cl.strip(): continue  # code is empty or tiny (comment, lone brace)
        lines.append((f, i + 1, n))
H = [hashlib.md5('\n'.join(l[2] for l in lines[i:i + MIN]).encode()).hexdigest() if i + MIN <= len(lines) else None for i in range(len(lines))]
# windows must not cross a file boundary
for i in range(len(lines) - MIN + 1):
    if lines[i][0] != lines[i + MIN - 1][0]: H[i] = None
pos = {}
for i, h in enumerate(H):
    if h: pos.setdefault(h, []).append(i)
dups = {h: p for h, p in pos.items() if len(p) > 1}
# merge consecutive windows into maximal blocks
blocks = []; seen = set()
for h in sorted(dups, key=lambda h: dups[h][0]):
    p0 = dups[h][0]
    if p0 in seen: continue
    ps = dups[h]; ext = 0
    while all(q + ext + 1 < len(H) and H[q + ext + 1] and H[q + ext + 1] in dups for q in ps[:2]) and H[ps[0] + ext + 1] == H[ps[1] + ext + 1] or False:
        ext += 1
        if ext > 4000: break
    # also mark windows covered so a run is reported once
    for k in range(ext + 1):
        for q in ps: seen.add(q + k)
    blocks.append({'hash': h, 'len': MIN + ext, 'at': ['%s:%d' % (lines[q][0], lines[q][1]) for q in ps][:4], 'n': len(ps)})
cur = {b['hash']: b for b in blocks}
if o['update']:
    save_baseline('guard_dup', sorted(cur)); print('baseline written: %d duplicate blocks' % len(cur)); sys.exit(0)
bl = set(load_baseline('guard_dup') or [])
new = [b for b in blocks if b['hash'] not in bl]
print('guard_dup: %d lines of code scanned, %d duplicate block(s) of %d+ lines (largest first), %d new' % (len(lines), len(blocks), MIN, len(new)))
for b in sorted(blocks, key=lambda b: -b['len'])[:(None if o['verbose'] else 12)]:
    print('   %4d lines x%d  %s %s' % (b['len'], b['n'], ' | '.join(b['at']), '' if b['hash'] in bl else 'NEW'))
bad = 0
if '--browser' in o['rest']:
    r = subprocess.run([sys.executable, os.path.join(HERE, 'dup_check.py'), '--root', o['root']], capture_output=True, text=True, timeout=300)
    print('  dup_check.py:', (r.stdout.strip().splitlines() or ['(no output)'])[-1], '(exit %d)' % r.returncode); bad = 1 if r.returncode else 0
sys.exit(finish(o, 'guard_dup', len(blocks) + bad, len(new) + bad, {'blocks': len(blocks)}))
