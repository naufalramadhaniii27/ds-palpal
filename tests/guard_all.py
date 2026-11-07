#!/usr/bin/env python3
"""Runs the five SOLID guards one after the other (never in parallel) and prints one summary table.
  guard_window (D)  guard_dispatch (O)  guard_deps (D, I)  guard_size (S)  guard_dup (DRY)
Default is REPORT MODE: exit 0 whatever is found. --enforce: exit 1 if any guard has a NEW violation against tests/guard_baseline/. --strict: exit 1 on any violation.
--browser also runs tests/dup_check.py through guard_dup (needs Chromium, about 10 seconds). --root DIR checks another tree. Extra flags are passed to every guard.
--update-baseline is passed through as well: use it DELIBERATELY, after review. Without the browser it runs in a few seconds."""
import json, os, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
G = [('guard_window', 'D'), ('guard_dispatch', 'O'), ('guard_deps', 'D,I'), ('guard_size', 'S'), ('guard_dup', 'DRY')]
args = sys.argv[1:]; upd = '--update-baseline' in args
rows = []; code = 0; t00 = time.time()
for g, pr in G:
    t0 = time.time(); a = [sys.executable, os.path.join(HERE, g + '.py'), '--json'] + [x for x in args if x != '--detail']
    if g != 'guard_dup': a = [x for x in a if x != '--browser']
    r = subprocess.run(a, capture_output=True, text=True)
    js = None
    for ln in r.stdout.splitlines():
        if ln.startswith('GUARD_JSON '): js = json.loads(ln[11:])
    if '--detail' in args: print(r.stdout.split('GUARD_JSON')[0].rstrip() + '\n')
    rows.append((g, pr, js, r.returncode, time.time() - t0, r.stderr.strip()[-300:])); code = max(code, r.returncode)
print('\n%-16s %-4s %9s %6s %6s' % ('guard', 'SOLID', 'violations', 'new', 'secs'))
for g, pr, js, rc, dt, err in rows:
    print('%-16s %-4s %9s %6s %6.1f%s' % (g, pr, js['total'] if js else '?', js['new'] if js else '?', dt, '' if js or upd else '  CRASH ' + err))
print('total %.1fs, exit %d' % (time.time() - t00, code))
sys.exit(code if all(r[2] or upd for r in rows) else 1)
