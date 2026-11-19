#!/usr/bin/env python3
"""peek: show one entry of the big data files by name, pretty printed.

Many files in src/data and src/builder hold a whole table on one line
(07-data-2014-spells.js is one line of 431 KB, q07-bestiary.js one of 4.9 MB).
grep on them prints the whole line. peek finds the name and prints only the
JSON value that holds it.

Usage:
  python3 tools/peek.py "Fireball"                  every entry named Fireball
  python3 tools/peek.py "Fireball" -f 07-data       only files whose path contains 07-data
  python3 tools/peek.py "ring of prot" -i           case-insensitive substring of the name
  python3 tools/peek.py "Fireball" --where          only list file:line:column of each hit
  python3 tools/peek.py --keys src/builder/07-data-2014-spells.js
                                                    top-level keys of each table in a file

A hit is either a key ("Fireball":{...}) or a name value ("n":"Fireball").
For a key the value after the colon is printed. For a name value the smallest
object or array around it is printed. Text that is not JSON (hand-written JS)
falls back to a short window of text around the hit.

Read only. Never writes a file.
"""
import argparse
import glob
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_GLOBS = ["src/data/**/*.js", "src/builder/*.js", "src/app/*.js", "src/learn/*.js", "src/tg/*.js"]
DEC = json.JSONDecoder()
NAME_KEYS = ("n", "name", "nm", "title", "t")


def files(only):
    out = []
    for g in DEFAULT_GLOBS:
        out.extend(glob.glob(os.path.join(ROOT, g), recursive=True))
    out = sorted(set(out))
    if only:
        out = [f for f in out if any(o in os.path.relpath(f, ROOT) for o in only)]
    return out


def decode_at(text, pos):
    try:
        val, end = DEC.raw_decode(text, pos)
        return val, end
    except ValueError:
        return None, None


def enclosing(text, start, stop, tries=400):
    """Smallest JSON object or array that starts before start and ends after stop."""
    i = start
    for _ in range(tries):
        a = text.rfind("{", 0, i)
        b = text.rfind("[", 0, i)
        i = max(a, b)
        if i < 0:
            return None
        val, end = decode_at(text, i)
        if val is not None and end >= stop:
            return val
    return None


TABLE_RE = re.compile(r'(?:var|let|const)\s+(\w+)\s*=\s*|(\w+(?:\.\w+)*)\s*=\s*(?=[\[{])')


def dict_spans(text, pos):
    """Spans (key, start, end) of the members of the JSON object at pos."""
    out = []
    i = pos + 1
    n = len(text)
    while i < n:
        while i < n and text[i] in " \t\r\n,":
            i += 1
        if i >= n or text[i] != '"':
            break
        key, i = DEC.raw_decode(text, i)
        while text[i] in " \t\r\n:":
            i += 1
        start = i
        try:
            _, i = DEC.raw_decode(text, i)
        except ValueError:
            break
        out.append((key, start, i))
    return out


_tables = {}


def tables(path, text):
    """Large JSON tables in a file: (label, start, end, member spans)."""
    if path in _tables:
        return _tables[path]
    out = []
    for m in TABLE_RE.finditer(text):
        if text[m.end():m.end() + 1] not in "{[":
            continue
        val, end = decode_at(text, m.end())
        if val is None or end - m.end() < 2000:
            continue
        spans = dict_spans(text, m.end()) if isinstance(val, dict) else []
        out.append((m.group(1) or m.group(2), m.end(), end, spans))
    _tables[path] = out
    return out


def where_in(path, text, pos):
    for label, a, b, spans in tables(path, text):
        if a <= pos < b:
            for k, s, e in spans:
                if s <= pos < e:
                    return label + "." + k
            return label
    return ""


def short(val, width):
    s = json.dumps(val, ensure_ascii=False, indent=1)
    if width and len(s) > width:
        s = s[:width] + "\n... (%d more chars, use --width 0 for all)" % (len(s) - width)
    return s


def line_col(text, pos):
    line = text.count("\n", 0, pos) + 1
    col = pos - (text.rfind("\n", 0, pos) + 1) + 1
    return line, col


def find(name, ci, exact):
    flags = re.I if ci else 0
    body = re.escape(name) if exact else r'[^"\\]*' + re.escape(name) + r'[^"\\]*'
    return re.compile(r'"(' + body + r')"(\s*:)?', flags)


def cmd_find(a):
    pat = find(a.name, a.i, not a.i)
    hits = 0
    for f in files(a.f):
        try:
            text = open(f, encoding="utf-8").read()
        except (UnicodeDecodeError, OSError):
            continue
        rel = os.path.relpath(f, ROOT)
        for m in pat.finditer(text):
            is_key = bool(m.group(2))
            if not is_key:
                before = text[max(0, m.start() - 12):m.start()]
                km = re.search(r'"(\w+)"\s*:\s*$', before)
                if not km or km.group(1) not in NAME_KEYS:
                    continue
            hits += 1
            line, col = line_col(text, m.start())
            kind = "key" if is_key else "name"
            tbl = where_in(f, text, m.start())
            print("== %s:%d:%d  %s %s%s" % (rel, line, col, kind, m.group(1), ("  in " + tbl) if tbl else ""))
            if not a.where:
                val = decode_at(text, m.end())[0] if is_key else enclosing(text, m.start(), m.end())
                if val is None:
                    lo, hi = max(0, m.start() - 200), min(len(text), m.end() + 600)
                    print("(not JSON, raw text)\n" + text[lo:hi])
                else:
                    print(short(val, a.width))
            if hits >= a.max:
                print("-- stopped at %d hits (--max)" % a.max)
                return 0
    if not hits:
        print("no hit for %r" % a.name, file=sys.stderr)
        return 1
    return 0


def cmd_keys(path):
    text = open(path, encoding="utf-8").read()
    n = 0
    for m in re.finditer(r'(?:var|let|const)\s+(\w+)\s*=\s*|(\w+(?:\.\w+)*)\s*=\s*(?=[\[{])', text):
        val, end = decode_at(text, m.end())
        if val is None or end - m.end() < 2000:
            continue
        n += 1
        label = m.group(1) or m.group(2)
        if isinstance(val, dict):
            ks = list(val.keys())
            print("%s: object, %d keys" % (label, len(ks)))
            for k in ks[:60]:
                v = val[k]
                size = len(v) if isinstance(v, (dict, list)) else ""
                print("  %s %s" % (k, size))
            if len(ks) > 60:
                print("  ... %d more" % (len(ks) - 60))
        elif isinstance(val, list):
            print("%s: array, %d items" % (label, len(val)))
            first = val[0] if val else None
            if isinstance(first, dict):
                print("  item keys: " + ", ".join(first.keys()))
    if not n:
        print("no large JSON table found in " + path, file=sys.stderr)
        return 1
    return 0


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("name", nargs="?")
    p.add_argument("-f", action="append", help="only files whose path contains this text (repeatable)")
    p.add_argument("-i", action="store_true", help="case-insensitive substring match")
    p.add_argument("--where", action="store_true", help="list hits only")
    p.add_argument("--max", type=int, default=20, help="stop after this many hits (default 20)")
    p.add_argument("--width", type=int, default=4000, help="cut each printed entry at this many chars (0 = no cut)")
    p.add_argument("--keys", metavar="FILE", help="list the top-level keys of the tables in FILE")
    a = p.parse_args()
    if a.keys:
        return cmd_keys(a.keys)
    if not a.name:
        p.error("give a name or --keys FILE")
    return cmd_find(a)


if __name__ == "__main__":
    sys.exit(main())
