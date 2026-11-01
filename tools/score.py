#!/usr/bin/env python3
"""One command for the 9.8 score (Fase 0.1, N43).
  python3 tools/score.py [--quick] [--only SECTION[,SECTION]] [--no-tests] [--no-perf] [--json OUT] [--md] [--history] [--compare PREV.json]
Reads tools/score-targets.json. A section is one of the ten rubric parts. Each measure has a baseline (base), a target and a direction.
Credit of a measure is 0 at base and 1 at target (linear, clamped), booleans are 0 or 1, a measure whose tool does not exist yet has credit 0.
Section score = floor + (10 - floor) * mean(credit), where floor is the baseline score of the section. So the baseline run reproduces the baseline table
and a section reaches 10 only when every measure reaches its target.
Measure kinds in the targets file:
  {"count": NAME}                built-in count of the source tree (see COUNTS)
  {"bytes": NAME}                from tests/perf_budget.py output (index.html size, split first download)
  {"perf": "KEY.metric"}         from tests/perf_budget.py output, KEY is for instance "390x844 cpu4x"
  {"test": NAME}                 tests/NAME.py (or .js/.mjs) must exit 0. Missing file = not built yet = credit 0
  {"cmd": "...", "parse": "last"} a command whose last stdout line is "SCORE <number>". Missing script = credit 0
  {"file": PATH}                 credit 1 when the file exists
--quick runs the counts and bytes only (seconds). Without --no-tests every listed test runs once, one after the other.
CI uses --compare PREV.json: a measure marked "gate" that gets worse than in PREV fails the run (exit 1)."""
import json, os, re, subprocess, sys, time, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TARGETS = json.load(open(os.path.join(ROOT, "tools", "score-targets.json"), encoding="utf-8"))
a = sys.argv[1:]
def opt(name, val=False):
    if name in a:
        i = a.index(name)
        if val:
            v = a[i + 1]; del a[i:i + 2]; return v
        del a[i]; return True
    return None
os.environ.setdefault("AXE_JS", "/home/claude/axe-tool/node_modules/axe-core/axe.min.js")
QUICK = opt("--quick"); NOTESTS = opt("--no-tests") or QUICK; NOPERF = opt("--no-perf") or QUICK
ONLY = (opt("--only", True) or "").split(",") if "--only" in a else None
OUT = opt("--json", True) or os.path.join(ROOT, "reports", "skor-9-8.json")
PREV = opt("--compare", True); MD = opt("--md"); HIST = opt("--history")


def sh(cmd, timeout=900):
    t = time.time()
    try:
        r = subprocess.run(cmd, shell=True, cwd=ROOT, capture_output=True, text=True, timeout=timeout)
        return r.returncode, r.stdout, r.stderr, time.time() - t
    except subprocess.TimeoutExpired:
        return 124, "", "timeout", time.time() - t


def files(pattern, skip=()):
    out = []
    for p in glob.glob(os.path.join(ROOT, pattern), recursive=True):
        if os.path.isfile(p) and not any(s in p for s in skip): out.append(p)
    return out


def read(p):
    try: return open(p, encoding="utf-8", errors="replace").read()
    except OSError: return ""


# ---- built-in counts of the source tree ------------------------------------------------------------------------
def src_js(): return [p for p in files("src/**/*.js") if "/src/data/" not in p and "/vendor/" not in p]
def count_lines_over(n):
    c = 0
    for p in src_js():
        for ln in read(p).split("\n"):
            if len(ln) > n: c += 1
    return c
def count_re(rx, paths=None):
    r = re.compile(rx); c = 0
    for p in (paths if paths is not None else src_js()): c += len(r.findall(read(p)))
    return c
def css_files(): return files("src/css/**/*.css")
def css_patch_files():
    return len([p for p in css_files() if re.search(r"patch|(^|[-_])v\d+", os.path.basename(p))])
def innerhtml_outside_lib():
    rx = re.compile(r"\.innerHTML\s*=|insertAdjacentHTML|\.outerHTML\s*=")
    return sum(len(rx.findall(read(p))) for p in src_js() if not p.endswith("lib/html.js"))
COUNTS = {
    "css_files": lambda: len(css_files()),
    "css_patch_files": css_patch_files,
    "important": lambda: sum(read(p).count("!important") for p in css_files()),
    "js_files": lambda: len(src_js()),
    "lines_over_300": lambda: count_lines_over(300),
    "lines_over_2000": lambda: count_lines_over(2000),
    "var_decl": lambda: count_re(r"\bvar\s"),
    "function_kw": lambda: count_re(r"\bfunction\s*\("),
    "then_calls": lambda: count_re(r"\.then\("),
    "innerhtml_outside_lib": innerhtml_outside_lib,
    "esc_calls": lambda: count_re(r"\besc\("),
    "navstack": lambda: count_re(r"\bnavStack\b"),
    "syncget": lambda: count_re(r"\bsyncGet\b"),
    "exec_command": lambda: count_re(r"execCommand\("),
    "json_clone": lambda: count_re(r"JSON\.parse\(JSON\.stringify"),
    "mutation_observer": lambda: count_re(r"new MutationObserver"),
    "confirm_alert": lambda: count_re(r"(?<![\w.])(confirm|alert)\("),
    "dialog_elements": lambda: count_re(r"<dialog\b|createElement\(.dialog."),
    "abort_controllers": lambda: count_re(r"new AbortController"),
    "intl_uses": lambda: count_re(r"\bIntl\."),
    "tests_files": lambda: len(files("tests/*.py") + files("tests/*.js") + files("tests/*.mjs")),
    "light_dark": lambda: sum(read(p).count("light-dark(") for p in css_files()),
    "build_check_fail": lambda: 0 if sh("python3 build.py --check", 900)[0] == 0 else 1,
    "ci_jobs": lambda: len(re.findall(r"^  [a-z][\w-]*:\s*$", read(os.path.join(ROOT, ".github", "workflows", "tests.yml")).split("jobs:")[-1], re.M)),
    "ci_tests": lambda: len(set(re.findall(r"(?:tests|tools)/([\w]+)\.(?:py|js|mjs)", read(os.path.join(ROOT, ".github", "workflows", "tests.yml"))))) + len(set(re.findall(r"\b(names_lint|csp_check|scenarios|golden_rules|version_label|split_dist|overflow_scan|overlap_scan|tidy|blank_new|flow_home_sheet|storage_idb|self_heal|tg_ui|tg_n2|g4_play|rb_fast|dice_lite|builder_draft|builder_4d6|learn_links|number_map)\b", read(os.path.join(ROOT, ".github", "workflows", "tests.yml"))))),
    "perf_in_ci": lambda: 1 if "perf_budget" in read(os.path.join(ROOT, ".github", "workflows", "tests.yml")) else 0,
    "font_data_uri_kb": lambda: round(sum(len(m) for p in css_files() for m in re.findall(r"url\(data:font[^)]*\)", read(p))) / 1024),
}


def run_test(name):
    for d, ext, runner in [(d, e, r) for d in ("tests", "tools") for e, r in ((".py", "python3"), (".js", "node"), (".mjs", "node"))]:
        p = os.path.join(ROOT, d, name + ext)
        if os.path.isfile(p):
            args = os.path.expandvars(TARGETS.get("test_args", {}).get(name, ""))
            rc, so, se, dt = sh("%s %s/%s%s %s" % (runner, d, name, ext, args), timeout=TARGETS.get("test_timeout", 1500))
            return {"ok": rc == 0, "rc": rc, "secs": round(dt, 1), "tail": (so + se).strip().split("\n")[-1][:160]}
    return None


def measure(m, ctx):
    """Return (value, note). value None means the measure cannot be taken yet."""
    if "count" in m: return COUNTS[m["count"]](), ""
    if "bytes" in m:
        v = (ctx.get("perf") or {}).get("bytes", {}).get(m["bytes"]); return v, "" if v is not None else "no perf run"
    if "perf" in m:
        key, met = m["perf"].rsplit(".", 1); v = (ctx.get("perf") or {}).get(key, {}).get(met); return v, "" if v is not None else "no perf run"
    if "file" in m: return (1 if os.path.exists(os.path.join(ROOT, m["file"])) else 0), ""
    if "test" in m:
        if NOTESTS: return None, "skipped"
        r = ctx["tests"].get(m["test"])
        if r is None: return None, "test file missing"
        return (1 if r["ok"] else 0), "%s in %ss" % ("pass" if r["ok"] else "FAIL", r["secs"])
    if "cmd" in m:
        script = m["cmd"].split()[1] if len(m["cmd"].split()) > 1 else ""
        if script and not os.path.exists(os.path.join(ROOT, script)): return None, "tool missing"
        if NOTESTS: return None, "skipped"
        rc, so, se, dt = sh(m["cmd"], timeout=TARGETS.get("test_timeout", 1500))
        line = [l for l in so.strip().split("\n") if l.startswith("SCORE ")]
        if not line: return None, "no SCORE line (rc %d)" % rc
        return float(line[-1].split()[1]), "%ss" % round(dt)
    if "manual" in m: return None, "manual measure (Fase 10)"
    return None, "unknown kind"


def credit(m, v):
    if v is None: return 0.0
    base, tgt = m.get("base"), m.get("target")
    if m.get("bool") or base is None or tgt is None: return 1.0 if v >= (tgt if tgt is not None else 1) else 0.0
    if base == tgt: return 1.0 if v == tgt else 0.0
    return max(0.0, min(1.0, (v - base) / (tgt - base)))


def main():
    ctx = {"tests": {}, "perf": None}
    t0 = time.time()
    if not NOTESTS:
        names = []
        for sec in TARGETS["sections"]:
            for m in sec["measures"]:
                if "test" in m and m["test"] not in names: names.append(m["test"])
        for n in names:
            ctx["tests"][n] = run_test(n)
            r = ctx["tests"][n]; print("  test %-18s %s" % (n, "missing" if r is None else ("ok  %ss" % r["secs"] if r["ok"] else "FAIL %ss %s" % (r["secs"], r["tail"]))), flush=True)
    needs_perf = any(("perf" in m or "bytes" in m) for s in TARGETS["sections"] for m in s["measures"])
    if needs_perf and not NOPERF:
        rc, so, se, dt = sh("python3 tests/perf_budget.py tests/out/score_perf.json --runs %d" % TARGETS.get("perf_runs", 3), timeout=3000)
        try: ctx["perf"] = json.load(open(os.path.join(ROOT, "tests", "out", "score_perf.json")))
        except Exception: ctx["perf"] = None
    elif needs_perf and QUICK:
        # bytes only: cheap
        sys.path.insert(0, os.path.join(ROOT, "tests"))
        import gzip, brotli
        raw = open(os.path.join(ROOT, "index.html"), "rb").read()
        ctx["perf"] = {"bytes": {"bytes_raw": len(raw), "bytes_gzip": len(gzip.compress(raw, 6)), "bytes_brotli": len(brotli.compress(raw, quality=11))}}
    res = {"commit": sh("git rev-parse --short HEAD")[1].strip(), "branch": sh("git rev-parse --abbrev-ref HEAD")[1].strip(), "date": time.strftime("%Y-%m-%d %H:%M"),
           "mode": "quick" if QUICK else "full", "sections": {}}
    tot = []
    for sec in TARGETS["sections"]:
        if ONLY and sec["id"] not in ONLY: continue
        rows = []; cr = []
        for m in sec["measures"]:
            v, note = measure(m, ctx); c = credit(m, v); cr.append(c)
            rows.append({"id": m["id"], "value": v, "base": m.get("base"), "target": m.get("target"), "credit": round(c, 2), "gate": bool(m.get("gate")), "note": note})
        score = sec["floor"] + (10 - sec["floor"]) * (sum(cr) / len(cr))
        res["sections"][sec["id"]] = {"name": sec["name"], "floor": sec["floor"], "score": round(score, 2), "measures": rows}
        tot.append(score)
    res["average"] = round(sum(tot) / len(tot), 2) if tot else None
    res["secs"] = round(time.time() - t0)
    os.makedirs(os.path.dirname(OUT), exist_ok=True); json.dump(res, open(OUT, "w"), indent=1, ensure_ascii=False)
    if MD: print(render_md(res))
    else:
        for sid, s in res["sections"].items(): print("%-12s %5.2f  (floor %s)" % (sid, s["score"], s["floor"]))
        print("average", res["average"], "  in", res["secs"], "s")
    rc = 0
    if PREV and os.path.exists(PREV):
        prev = json.load(open(PREV)); bad = []
        for sid, s in res["sections"].items():
            pm = {m["id"]: m for m in prev.get("sections", {}).get(sid, {}).get("measures", [])}
            for m in s["measures"]:
                p = pm.get(m["id"])
                if not (m["gate"] and p and p["value"] is not None and m["value"] is not None): continue
                worse = (m["value"] > p["value"]) if (m["target"] is not None and m["base"] is not None and m["target"] < m["base"]) else (m["value"] < p["value"])
                if worse: bad.append("%s.%s %s -> %s" % (sid, m["id"], p["value"], m["value"]))
        for b in bad: print("WORSE:", b)
        rc = 1 if bad else 0
    sys.exit(rc)


def render_md(res):
    L = ["Score " + res["date"] + "  commit " + res["commit"] + "  branch " + res["branch"] + "  mode " + res["mode"] + "  average " + str(res["average"]), ""]
    for sid, s in res["sections"].items():
        L.append("%s: %.2f" % (s["name"], s["score"]))
        for m in s["measures"]: L.append("  %-28s value %-10s base %-8s target %-8s credit %s %s" % (m["id"], m["value"], m["base"], m["target"], m["credit"], m["note"]))
    return "\n".join(L)


if __name__ == "__main__": main()
