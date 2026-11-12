#!/usr/bin/env python3
"""Coverage gate for imported books. Counts, per book tag and kind, what the build could not import
(missing, no overlay text, wrong edition, reference only). Missing counts may only go down.

  HB_DIR=/path/to/collection python3 tools/audit_coverage.py --run [--update] [books,comma]
      builds the books in memory, writes reports/coverage-gaps.json, and with --update also tests/coverage_baseline.json
  python3 tools/audit_coverage.py --check
      CI mode, needs no source files. Reads the committed reports/coverage-gaps.json and compares it to the baseline.
      Fails when a count rises or a book in the baseline has no report.
Rows of kind assumption/engine are known engine limits and are listed but never block."""
import json, os, sys, collections
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
REP = os.path.join(ROOT, "reports", "coverage-gaps.json"); BASE = os.path.join(ROOT, "tests", "coverage_baseline.json")
INFO = {"assumption", "engine"}


def run(books):
    os.environ["TP_ONLY"] = ",".join(books)
    sys.path.insert(0, HERE)
    import tp_build
    tp_build.build()
    out = collections.defaultdict(lambda: collections.Counter()); names = collections.defaultdict(list)
    for tag, kind, item, note in tp_build.GAP:
        out[tag][kind] += 1; names[tag + "|" + kind].append(str(item)[:80])
    return {t: dict(c) for t, c in out.items()}, {k: sorted(v) for k, v in names.items()}


def main():
    a = sys.argv[1:]
    if "--run" in a:
        books = [x for x in a if not x.startswith("--")] or ["tvss14"]
        counts, names = run(books[0].split(","))
        json.dump({"counts": counts, "names": names}, open(REP, "w", encoding="utf-8"), indent=1, ensure_ascii=False, sort_keys=True)
        print("wrote", REP)
        if "--update" in a:
            json.dump({"counts": counts}, open(BASE, "w", encoding="utf-8"), indent=1, sort_keys=True); print("wrote", BASE)
        return 0
    if not os.path.exists(BASE): print("no baseline, nothing to check"); return 0
    base = json.load(open(BASE))["counts"]
    if not os.path.exists(REP): print("FAIL: reports/coverage-gaps.json missing"); return 1
    cur = json.load(open(REP))["counts"]; bad = 0
    for tag, kinds in base.items():
        if tag not in cur: print("FAIL: no report for", tag); bad = 1; continue
        for k, n in cur[tag].items():
            if k in INFO: continue
            if n > kinds.get(k, 0): print("FAIL: %s %s rose from %d to %d" % (tag, k, kinds.get(k, 0), n)); bad = 1
    print("coverage gate %s" % ("FAIL" if bad else "OK"), {t: {k: v for k, v in c.items() if k not in INFO} for t, c in cur.items() if t in base})
    return bad


sys.exit(main())
