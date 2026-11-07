"""Shared helpers for the SOLID stage 4 guards (tests/guard_*.py). No browser, no third party package. Not a test on its own.
Provides: file lists from src/manifest.json, a JS stripper (comments, strings, regex bodies blanked, template ${} kept), a function finder,
brace map, baseline load/save and the common CLI (--root DIR, --strict, --enforce, --update-baseline, --json).
Modes (same in all guards):
  default            REPORT MODE: print every violation and the ones that are new against the baseline, exit 0.
  --enforce          exit 1 only for violations NOT in the baseline (this is what CI uses once the other stages are merged).
  --strict           exit 1 on ANY violation, baseline ignored.
  --update-baseline  rewrite tests/guard_baseline/<guard>.json from the current tree. Use it DELIBERATELY (after review), never to silence a failure."""
import json, os, re, sys, hashlib
HERE = os.path.dirname(os.path.abspath(__file__)); REPO = os.path.dirname(HERE)
BASEDIR = os.path.join(HERE, 'guard_baseline')

def parse_args(guard):
    a = sys.argv[1:]; o = {'root': REPO, 'strict': '--strict' in a, 'enforce': '--enforce' in a or os.environ.get('GUARD_MODE') == 'enforce',
                           'update': '--update-baseline' in a, 'verbose': '--verbose' in a, 'quiet': '--quiet' in a, 'json': '--json' in a, 'rest': a}
    if '--root' in a: o['root'] = os.path.abspath(a[a.index('--root') + 1])
    o['guard'] = guard; return o

def manifest_files(root, kinds=('js',)):
    """Ordered list of src-relative files from the manifest (JS only by default)."""
    m = json.load(open(os.path.join(root, 'src', 'manifest.json'), encoding='utf-8')); out = []
    for e in m['entries']:
        for f in ([e['file']] if e.get('t') == 'file' else e.get('files', [])):
            if f.endswith('.js') and f not in out: out.append(f)
    return out

def read(root, f): return open(os.path.join(root, 'src', f), encoding='utf-8').read()

def is_env(f): return bool(re.search(r'(^|/)(\d+[a-z]?-)?([a-z0-9]+-)*env\.js$', f))

def layer(f):
    """data=0, logic=1, ui=2, None = not classified (reg, main, boot, env, bridge)."""
    d = f.split('/')[0]; b = os.path.basename(f)
    if d == 'data': return 0
    if d == 'boot': return None
    if d == 'fx': return 2
    if is_env(f) or b in ('00-reg.js', 'main.js') or 'bridge' in b: return None
    if re.search(r'(^|[0-9a-z]-)ui-|-ui-|-ui\.js', b) or re.search(r'\d+[a-z]?-ui', b): return 2
    if re.search(r'-logic-|-logic\.js|engine|sim', b): return 1
    if re.search(r'-data-|-data\.js', b): return 0
    return None

def strip_js(s):
    """Blank comments, string and regex bodies (length and newlines kept so offsets and lines stay valid). Template ${} code is kept."""
    out = []; i = 0; n = len(s); stack = []  # stack of template depths: brace counters inside ${
    prev = ''  # last significant char
    prevword = ''
    def blank(t): return re.sub(r'[^\n]', ' ', t)
    while i < n:
        c = s[i]
        if c == '/' and i + 1 < n and s[i + 1] == '/':
            j = s.find('\n', i); j = n if j < 0 else j; out.append(blank(s[i:j])); i = j; continue
        if c == '/' and i + 1 < n and s[i + 1] == '*':
            j = s.find('*/', i + 2); j = n if j < 0 else j + 2; out.append(blank(s[i:j])); i = j; continue
        if c in '"\'':
            j = i + 1
            while j < n and s[j] != c and s[j] != '\n':
                j += 2 if s[j] == '\\' else 1
            out.append(c + blank(s[i + 1:j]) + (c if j < n and s[j] == c else '')); i = j + 1; prev = c; prevword = ''; continue
        if c == '`':
            out.append('`'); i += 1
            while i < n and s[i] != '`':
                if s[i] == '\\': out.append('  '); i += 2; continue
                if s[i] == '$' and i + 1 < n and s[i + 1] == '{':
                    stack.append(1); out.append('${'); i += 2; break
                out.append(' ' if s[i] != '\n' else '\n'); i += 1
            else:
                out.append('`'); i += 1; prev = '`'; continue
            if stack and out[-1] == '${': prev = '{'; continue
            continue
        if stack:
            if c == '{': stack[-1] += 1
            elif c == '}':
                stack[-1] -= 1
                if stack[-1] == 0:  # back into the template text
                    stack.pop(); out.append('}'); i += 1
                    while i < n and s[i] != '`':
                        if s[i] == '\\': out.append('  '); i += 2; continue
                        if s[i] == '$' and i + 1 < n and s[i + 1] == '{':
                            stack.append(1); out.append('${'); i += 2; break
                        out.append(' ' if s[i] != '\n' else '\n'); i += 1
                    else:
                        out.append('`'); i += 1; prev = '`'
                    continue
        if c == '/':
            if prev in '' or prev in '(,=:[!&|?{};+-*%<>~^' or prevword in ('return', 'typeof', 'case', 'in', 'of', 'else', 'do'):
                j = i + 1; incls = False
                while j < n and s[j] != '\n':
                    if s[j] == '\\': j += 2; continue
                    if s[j] == '[': incls = True
                    elif s[j] == ']': incls = False
                    elif s[j] == '/' and not incls: break
                    j += 1
                if j < n and s[j] == '/':
                    k = j + 1
                    while k < n and s[k].isalpha(): k += 1
                    out.append('/' + blank(s[i + 1:j]) + '/' + s[j + 1:k]); i = k; prev = ')'; prevword = ''; continue
        if c.isalnum() or c in '_$':
            j = i
            while j < n and (s[j].isalnum() or s[j] in '_$'): j += 1
            prevword = s[i:j]; out.append(s[i:j]); i = j; prev = 'a'; continue
        out.append(c); i += 1
        if not c.isspace(): prev = c; prevword = ''
    return ''.join(out)

def brace_map(code):
    m = {}; st = []
    for i, c in enumerate(code):
        if c == '{': st.append(i)
        elif c == '}' and st: m[st.pop()] = i
    return m

def lineno(code, pos): return code.count('\n', 0, pos) + 1

def match_paren(code, i):
    d = 0
    for j in range(i, len(code)):
        c = code[j]
        if c == '(': d += 1
        elif c == ')':
            d -= 1
            if d == 0: return j
    return -1

FN_RE = re.compile(r'(?:\b([A-Za-z_$][\w$]*)\s*[:=]\s*(?:async\s+)?|\bexport\s+(?:default\s+)?(?:async\s+)?)?\bfunction\b\s*\*?\s*([A-Za-z_$][\w$]*)?\s*\(')
ARROW_RE = re.compile(r'(?:\b(?:const|let|var)\s+)?([A-Za-z_$][\w$.]*)\s*=\s*(?:async\s+)?(\([^()]*\)|[A-Za-z_$][\w$]*)\s*=>\s*\{')

def find_functions(code, bm=None):
    """[(name, start_line, end_line, start_pos, end_pos)] for function declarations/expressions with a block body and arrow functions with a block body."""
    bm = bm or brace_map(code); res = []
    for m in FN_RE.finditer(code):
        p = match_paren(code, m.end() - 1)
        if p < 0: continue
        j = p + 1
        while j < len(code) and code[j].isspace(): j += 1
        if j < len(code) and code[j] == '{' and j in bm:
            name = m.group(2) or m.group(1) or '(anon)'
            res.append((name, lineno(code, m.start()), lineno(code, bm[j]), m.start(), bm[j]))
    for m in ARROW_RE.finditer(code):
        j = m.end() - 1
        if j in bm: res.append((m.group(1), lineno(code, m.start()), lineno(code, bm[j]), m.start(), bm[j]))
    return sorted(res, key=lambda r: r[3])

def unique_keys(items):
    seen = {}; out = []
    for it in items:
        k = it; seen[k] = seen.get(k, 0) + 1
        out.append(k if seen[k] == 1 else '%s#%d' % (k, seen[k]))
    return out

def load_baseline(guard):
    p = os.path.join(BASEDIR, guard + '.json')
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else None

def save_baseline(guard, data):
    os.makedirs(BASEDIR, exist_ok=True)
    with open(os.path.join(BASEDIR, guard + '.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=1, sort_keys=True); f.write('\n')

def finish(o, name, total, new, summary):
    """Print the verdict line, honour the modes, return the exit code. summary is a dict for guard_all (stored in --json)."""
    mode = 'strict' if o['strict'] else 'enforce' if o['enforce'] else 'report'
    print('%s: %d violation(s) in total, %d new vs baseline [mode %s]' % (name, total, new, mode))
    if o.get('json'):
        print('GUARD_JSON ' + json.dumps(dict(summary, guard=name, total=total, new=new)))
    if o['strict']: return 1 if total else 0
    if o['enforce']: return 1 if new else 0
    return 0

CACHE = os.path.join(HERE, 'out', 'guard_cache')
def stripped(root, f):
    """strip_js(read(root, f)) with a disk cache keyed by the content hash (the guards share it, a warm run is fast)."""
    s = read(root, f); h = hashlib.sha1(s.encode('utf-8')).hexdigest()
    p = os.path.join(CACHE, h + '.txt')
    try: return open(p, encoding='utf-8').read()
    except OSError: pass
    c = strip_js(s)
    try: os.makedirs(CACHE, exist_ok=True); open(p, 'w', encoding='utf-8').write(c)
    except OSError: pass
    return c
