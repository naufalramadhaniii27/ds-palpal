#!/usr/bin/env python3
"""Duplicate effect check for the fx data files.

Loads every data/fx-*.js file of src/manifest.json in manifest order (node vm, no browser) and records which file adds or changes
each name in GX.cls, GX.sub, GX.species, GX.bg, GX.feat, GX.item and FXO. The same name defined by more than one file for the same
kind fails, unless tests/fx_overlap_allow.json lists it with the files, the effect fields they share and a reason (a documented override or disjoint effects).
Reason: entries from two files are both applied by gfx(), so an additive field (acAdd, saveBonus, hpFlat, darkAdd, ...) defined
twice counts twice.

  python3 tests/fx_overlap.py            check
  python3 tests/fx_overlap.py --list     print every overlap with the effect fields shared between files
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
ALLOW = os.path.join(ROOT, 'tests', 'fx_overlap_allow.json')
META = {'n', 'l', 'when', 'pick', 'pickLv', 'toggle', 'cond', 'yc', 'opt', 'AUTO', 'idx', 'kind', 'owner'}


def fx_files():
    m = json.load(open(os.path.join(SRC, 'manifest.json')))
    out = []

    def walk(x):
        if isinstance(x, dict):
            for v in x.values():
                walk(v)
        elif isinstance(x, list):
            for v in x:
                walk(v)
        elif isinstance(x, str) and re.search(r'(^|/)data/fx-[^/]*\.js$', x):
            out.append(x)
    walk(m)
    return out


def load():
    fl = [os.path.join(SRC, f) for f in fx_files()]
    r = subprocess.run(['node', os.path.join(ROOT, 'tests', 'fx_overlap_loader.js'), json.dumps(fl)], capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[:2000])
        sys.exit(2)
    return json.loads(r.stdout)


def eff_keys(entries):
    ks = set()
    for e in entries:
        if isinstance(e, dict):
            ks |= {k for k in e if k not in META}
    return ks


def main():
    import itertools
    data = load()
    allow = json.load(open(ALLOW)) if os.path.exists(ALLOW) else {}
    bad = []
    over = {k: v for k, v in data['owners'].items() if len(v) > 1}
    for k, files in sorted(over.items()):
        det = data['detail'][k]
        shared = set()
        for a, b in itertools.combinations(files, 2):
            shared |= eff_keys(det[a]) & eff_keys(det[b])
        al = allow.get(k)
        ok = bool(al) and bool(al.get('reason')) and set(files) <= set(al.get('files', [])) and shared <= set(al.get('shared', []))
        if '--list' in sys.argv:
            print('%s %-50s %s shared=%s' % ('ok ' if ok else 'BAD', k, files, sorted(shared)))
        if not ok:
            bad.append((k, files, sorted(shared)))
    for k in [k for k in allow if k not in over]:
        print('note: allowlist entry no longer needed: ' + k)
    for f, e in data['errors'].items():
        print('load error in %s: %s' % (f, e))
        bad.append((f, [], []))
    if bad:
        for k, files, sh in bad:
            print('OVERLAP %s defined by %s%s' % (k, ', '.join(files), ('  (shared effect fields: %s)' % ', '.join(sh)) if sh else ''))
        print('fx_overlap FAIL: %d problem(s). Remove the duplicate, or add the name to tests/fx_overlap_allow.json with files, shared fields and a reason.' % len(bad))
        sys.exit(1)
    print('fx_overlap OK: %d names in %d fx files, %d documented overlaps' % (len(data['owners']), len(fx_files()), len(over)))


main()
