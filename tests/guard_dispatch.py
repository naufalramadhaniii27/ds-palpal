#!/usr/bin/env python3
"""Guard O (open/closed): no per-kind or per-field branching inside orchestrators.
An orchestrator is a loop or function that only runs registered handlers (gfx0, abil, toSheet, the UI dispatchers). They are found by a marker comment:
  FUNCTION form   /* solid:orchestrator NAME */  placed directly before a function (declaration, `name=function`, or arrow with a block body)
  REGION form     /* solid:orchestrator-begin NAME */ ... /* solid:orchestrator-end NAME */
  OLD FORM        /*ORCH-BEGIN NAME ...*/ ... /*ORCH-END NAME*/   (stage 1 markers in 11-logic-derivation.js, accepted as is)
Violations inside an orchestrator body (comments and strings blanked, string literals counted from the raw text):
  switch      any switch statement
  chain       an if / else-if chain with 2 or more conditions that compare something to a string literal
  kindcmp     a comparison of kind, type, field, fld, phase, group, k, or .t / .g to a string literal, or a literal ===  such a name
  incl        ["a","b"].includes(kind-like name)
Baseline: tests/guard_baseline/guard_dispatch.json {file::NAME: count}. A new orchestrator starts at 0, a higher count is new.
Run: python3 tests/guard_dispatch.py [--root DIR] [--enforce | --strict] [--update-baseline]
--update-baseline is for deliberate use only (after review), never to hide a violation."""
import re, sys
from guard_lib import *
o = parse_args('guard_dispatch')
NAMES = r'(?:kind|type|field|fld|phase|group|k|\.t|\.g|src|source)'
CMP = re.compile(r'\b(?:kind|type|field|fld|phase|group|k)\b\s*[!=]==?\s*["\']|[\w$\]\)]\.(?:t|g|kind|type|field|phase|group)\b\s*[!=]==?\s*["\']|["\']\s*[!=]==?\s*(?:[\w$]+\.)?\b(?:kind|type|field|fld|phase|group|k)\b')
INCL = re.compile(r'\[\s*["\'][^\]]*\]\s*\.(?:includes|indexOf)\(\s*(?:[\w$]+\.)?(?:kind|type|field|fld|phase|group|k)\b')
def find_orch(root):
    res = []  # (file, name, start_pos, end_pos, kind)
    for f in manifest_files(root):
        raw = read(root, f)
        if not re.search(r'solid:orchestrator|ORCH-BEGIN', raw): continue
        for m in re.finditer(r'/\*\s*ORCH-BEGIN\s+(\w+)', raw):
            e = re.search(r'/\*\s*ORCH-END\s+' + re.escape(m.group(1)), raw[m.end():])
            if e: res.append((f, m.group(1), m.start(), m.end() + e.start(), 'region'))
        for m in re.finditer(r'/\*\s*solid:orchestrator-begin\s+(\w+)\s*\*/', raw):
            e = re.search(r'/\*\s*solid:orchestrator-end\s+' + re.escape(m.group(1)) + r'\s*\*/', raw[m.end():])
            if e: res.append((f, m.group(1), m.start(), m.end() + e.start(), 'region'))
            else: res.append((f, m.group(1), -1, -1, 'unclosed'))
        code = stripped(root, f); fns = None
        for m in re.finditer(r'/\*\s*solid:orchestrator\s+(\w+)\s*\*/', raw):
            fns = fns or find_functions(code)
            nxt = [x for x in fns if x[3] >= m.end()]
            if nxt: x = nxt[0]; res.append((f, m.group(1), x[3], x[4], 'function'))
            else: res.append((f, m.group(1), -1, -1, 'nofunction'))
    return res
cur = {}; lines = {}; problems = []
for f, name, a, b, kind in find_orch(o['root']):
    key = '%s::%s' % (f, name)
    if a < 0: problems.append('marker without a body: %s (%s)' % (key, kind)); continue
    raw = read(o['root'], f); code = stripped(o['root'], f); seg = code[a:b]
    # the stripper blanks strings, so the literal test runs on the raw text of the same span with comments removed
    rawseg = re.sub(r'/\*.*?\*/', lambda m: re.sub(r'[^\n]', ' ', m.group()), raw[a:b], flags=re.S)
    rawseg = re.sub(r'(?m)(?<![:\'"])//.*$', '', rawseg)
    hits = []
    for m in re.finditer(r'\bswitch\s*\(', seg): hits.append((lineno(raw, a + m.start()), 'switch'))
    for m in CMP.finditer(rawseg): hits.append((lineno(raw, a + m.start()), 'kindcmp'))
    for m in INCL.finditer(rawseg): hits.append((lineno(raw, a + m.start()), 'incl'))
    # chains: split on "else if", count conditions with a string literal compare
    for m in re.finditer(r'\bif\s*\(', rawseg):
        j = match_paren(rawseg, m.end() - 1)
        if j < 0: continue
        cnt = 0; pos = m.start()
        while True:
            cond = rawseg[pos:j + 1]
            if re.search(r'[!=]==?\s*["\']|["\']\s*[!=]==?', cond): cnt += 1
            nm = re.compile(r'\s*[^{};]*?(?:\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}|[^;{}]*;)\s*else\s+if\s*\(').match(rawseg, j + 1)
            if not nm: break
            pos = nm.end() - 3; j = match_paren(rawseg, nm.end() - 1)
            if j < 0: break
        if cnt >= 2: hits.append((lineno(raw, a + m.start()), 'chain'))
    hits = sorted(set(hits)); cur[key] = len(hits); lines[key] = hits
base = load_baseline('guard_dispatch')
if o['update']:
    save_baseline('guard_dispatch', cur); print('baseline written: %d orchestrators, %d violations' % (len(cur), sum(cur.values()))); sys.exit(0)
bl = base or {}; new = [k for k, v in cur.items() if v > bl.get(k, 0)]
print('guard_dispatch: %d orchestrator(s) found: %s' % (len(cur), ', '.join(sorted(cur)) or 'none (add the marker, see reports/solid-guards.md)'))
for k in sorted(cur):
    print('  %-55s %d violation(s) (baseline %s)%s' % (k, cur[k], bl.get(k, '-'), '  NEW/UP' if k in new else ''))
    for ln, t in lines[k]: print('      line %d %s' % (ln, t))
for p in problems: print('  PROBLEM', p)
tot = sum(cur.values()) + len(problems)
sys.exit(finish(o, 'guard_dispatch', tot, len(new) + len(problems), {'orchestrators': sorted(cur)}))
