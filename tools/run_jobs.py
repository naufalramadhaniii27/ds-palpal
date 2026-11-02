#!/usr/bin/env python3
"""Run the CI jobs of .github/workflows/tests.yml one test at a time, on this machine.  python3 tools/run_jobs.py [A] [B] [C] [--also NAME,NAME] [--retry]
Same lists as the workflow. Tests run one after the other: parallel runs make animation and loading tests fragile.
--retry runs a failed test once more alone before it counts as failed. Prints one line per test and a summary, exit 1 when any test failed."""
import os, subprocess, sys, time
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOBS = {
 "A": [("build.py", "--check"), ("tests/tg_engine.js", "300"), ("tests/api_dev_guard.mjs", ""), ("tests/names_lint.py", ""), ("tools/tsc_gate.py", ""), ("tools/html_gate.py", ""), ("tests/csp_check.py", ""), ("tests/scenarios.py", ""), ("tests/golden_rules.py", ""), ("tests/version_label.py", ""), ("tests/split_dist.py", ""), ("tests/perf_budget.py", "tests/out/perf.json --fast --runs 3 --check tests/perf-budget.json")],
 "B": [(f"tests/{t}.py", "") for t in "fonts_dist lazy_parts overflow_scan overlap_scan tidy blank_new flow_home_sheet storage_idb self_heal fail_modes".split()] + [("tests/chaos_storage.py", "--seeds 50"), ("tests/migrate_all.py", "")],
 "C": [(f"tests/{t}.py", "") for t in "detail_img tg_ui tg_n2 g4_play rb_fast dice_lite builder_draft builder_4d6 learn_links number_map".split()] + [("tools/run_cloud_sync.sh", ""), ("tools/run_cloud_sync.sh", "tests/err_report.py")],
}
a = sys.argv[1:]; retry = "--retry" in a
if retry: a.remove("--retry")
extra = []
if "--also" in a: i = a.index("--also"); extra = [(f"tests/{n}.py", "") for n in a[i + 1].split(",")]; del a[i:i + 2]
sel = [x for x in a if x in JOBS] or list(JOBS)
todo = [(j, f, g) for j in sel for f, g in JOBS[j]] + [("X", f, g) for f, g in extra]
bad = []; t0 = time.time()
def run(f, g):
    runner = "node" if f.endswith((".js", ".mjs")) else "bash" if f.endswith(".sh") else "python3"; t = time.time()
    r = subprocess.run("%s %s %s" % (runner, f, g), shell=True, cwd=ROOT, capture_output=True, text=True, timeout=2400)
    return r.returncode, time.time() - t, (r.stdout + r.stderr).strip().split("\n")[-1][:150]
for j, f, g in todo:
    try: rc, dt, tail = run(f, g)
    except subprocess.TimeoutExpired: rc, dt, tail = 124, 2400, "timeout"
    if rc and retry:
        print("  retry %s alone" % f, flush=True); rc, dt, tail = run(f, g)
    print("%s %-4s %-34s %5.0fs  %s" % ("ok  " if rc == 0 else "FAIL", j, f, dt, "" if rc == 0 else tail), flush=True)
    if rc: bad.append(f)
print("%d tests, %d failed, %.0f s" % (len(todo), len(bad), time.time() - t0)); sys.exit(1 if bad else 0)
