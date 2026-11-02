#!/usr/bin/env python3
"""N46 type gate.  python3 tools/tsc_gate.py [--update] [--list]
Runs tsc (tools/build/node_modules/typescript, version locked in tools/build/package.json) with jsconfig.json over the module folders (src/app, builder, learn, tg).
Errors are counted per file and compared with tools/ts-baseline.json:
  a file listed with 0, or not listed, must stay at 0 (a new error fails the run)
  a file with a number may go down but not up (the ratchet; the number falls as files are cleaned, and --update writes the new numbers)
One kind of message is not counted: TS2630 on a line with Object.defineProperty(__R, ...). That line is the module hook that lets other modules replace an imported function (ESM step), by design.
Last stdout line: SCORE <errors left>, the sum over all files, so tools/score.py can measure it. Exit 1 when a file got worse."""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); os.chdir(ROOT)
tsc = os.path.join(ROOT, "tools", "build", "node_modules", "typescript", "bin", "tsc")
r = subprocess.run(["node", tsc, "-p", "jsconfig.json"], capture_output=True, text=True)
counts = {}; lines = {}
for ln in r.stdout.splitlines():
    m = re.match(r"^(src/[^()]+)\((\d+),(\d+)\): error (TS\d+): (.*)", ln)
    if not m: continue
    f, row, col, code, msg = m.group(1), int(m.group(2)), int(m.group(3)), m.group(4), m.group(5)
    if code == "TS2630":
        try:
            if "defineProperty(" in open(f, encoding="utf-8").read().split("\n")[row - 1]: continue
        except Exception: pass
    counts[f] = counts.get(f, 0) + 1; lines.setdefault(f, []).append("%s(%d,%d) %s %s" % (f, row, col, code, msg[:110]))
base_path = os.path.join(ROOT, "tools", "ts-baseline.json")
base = json.load(open(base_path)) if os.path.exists(base_path) else {}
allf = [os.path.join(d, x) for d in ("src/app", "src/builder", "src/learn", "src/tg") for x in sorted(os.listdir(d)) if x.endswith(".js")]
if "--update" in sys.argv:
    base = {f: counts.get(f, 0) for f in allf if counts.get(f, 0)}; json.dump(base, open(base_path, "w"), indent=1); print("baseline written:", sum(counts.values()), "errors in", len(counts), "files")
bad = [(f, counts.get(f, 0), base.get(f, 0)) for f in allf if counts.get(f, 0) > base.get(f, 0)]
if "--list" in sys.argv:
    for f in sorted(lines): print("\n".join(lines[f]))
clean = sum(1 for f in allf if not counts.get(f, 0))
print("tsc_gate: %d files, %d clean (%.0f percent), %d errors left" % (len(allf), clean, 100.0 * clean / len(allf), sum(counts.values())))
for f, n, b in bad: print("WORSE", f, "now", n, "baseline", b)
print("SCORE %d" % sum(counts.values())); sys.exit(1 if bad else 0)
