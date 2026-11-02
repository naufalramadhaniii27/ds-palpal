#!/usr/bin/env python3
"""Fase 1.1 repeat every test of Job A to C.  python3 tools/flake_hunt.py [--runs 10] [--jobs A,B,C] [--only name,name] [--also name,name]
Each test runs RUNS times in a row, one at a time (never in parallel). A test that fails even once is flaky: the cause is fixed, the time-out is not raised.
Result: reports/flake.json (per test: runs, failures, last message) and a table on screen. Exit 1 when any test failed at least once.
Long: Job A to C take about 25 minutes per round, so 10 rounds are a night run (the 'nightly' job of the workflow runs it with --runs 3)."""
import json, os, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); sys.path.insert(0, os.path.join(ROOT, "tools"))
a = sys.argv[1:]
def opt(n, d): return a[a.index(n) + 1] if n in a else d
RUNS = int(opt("--runs", 10)); JOBS = opt("--jobs", "A,B,C").split(","); ONLY = [x for x in opt("--only", "").split(",") if x]; ALSO = [x for x in opt("--also", "").split(",") if x]
src = open(os.path.join(ROOT, "tools", "run_jobs.py"), encoding="utf-8").read()
ns = {}; exec(src.split("a = sys.argv[1:]")[0], {"__file__": os.path.join(ROOT, "tools", "run_jobs.py"), "__name__": "x"}, ns)
tests = [(j, f, g) for j in JOBS for f, g in ns["JOBS"][j]] + [("X", "tests/%s.py" % n, "") for n in ALSO]
tests = [t for t in tests if t[1] != "build.py" and (not ONLY or os.path.basename(t[1]).split(".")[0] in ONLY)]
res = {}
for j, f, g in tests:
    name = os.path.basename(f).split(".")[0] + ("_" + os.path.basename(g).split(".")[0] if g.endswith(".py") else ""); r = {"job": j, "runs": 0, "fail": 0, "last": ""}
    for i in range(RUNS):
        runner = "node" if f.endswith((".js", ".mjs")) else "bash" if f.endswith(".sh") else "python3"; t0 = time.time()
        p = subprocess.run("%s %s %s" % (runner, f, g), shell=True, cwd=ROOT, capture_output=True, text=True, timeout=2400)
        r["runs"] += 1
        if p.returncode: r["fail"] += 1; r["last"] = (p.stdout + p.stderr).strip().split("\n")[-1][:200]
    res[name] = r; print("%-4s %-22s %2d/%2d passed  %s" % (j, name, r["runs"] - r["fail"], r["runs"], r["last"]), flush=True)
os.makedirs(os.path.join(ROOT, "reports"), exist_ok=True); json.dump(res, open(os.path.join(ROOT, "reports", "flake.json"), "w"), indent=1)
bad = [k for k, v in res.items() if v["fail"]]
print("flake_hunt:", ("%d flaky: %s" % (len(bad), ", ".join(bad))) if bad else "every test passed every run"); print("SCORE %d" % len(bad)); sys.exit(1 if bad else 0)
