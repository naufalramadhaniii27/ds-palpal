#!/usr/bin/env python3
"""quick: run the tests for one area at once, in parallel, with one summary.

Usage:
  python3 tests/quick.py engine            build check, then the engine tests
  python3 tests/quick.py engine sheet      several areas
  python3 tests/quick.py --changed         pick the areas from the files changed against origin/main
  python3 tests/quick.py --list            show the areas and their tests
  python3 tests/quick.py engine --no-build skip python3 build.py --check
  python3 tests/quick.py --changed --dry   show what --changed would run
  python3 tests/quick.py engine -j 2       at most 2 tests at the same time (default: number of cores, max 4)

Each test writes its full output to tests/out/quick/NAME.log (ignored by git).
Exit 1 when any test fails. This is a fast local check, not a replacement
for CI: CI (.github/workflows/tests.yml) still runs the full lists.
"""
import argparse
import concurrent.futures as cf
import os
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PY = sys.executable
LOG = os.path.join(ROOT, "tests", "out", "quick")

# area -> list of (name, command). Commands run from the repo root.
AREAS = {
    "engine": [
        ("fx_engine", [PY, "tests/fx_engine.py"]),
        ("golden_rules", [PY, "tests/golden_rules.py"]),
        ("feat_numbers", [PY, "tests/feat_numbers.py"]),
        ("background_numbers", [PY, "tests/background_numbers.py"]),
        ("species_numbers", [PY, "tests/species_numbers.py"]),
        ("core_numbers", [PY, "tests/core_numbers.py"]),
        ("multiclass_numbers", [PY, "tests/multiclass_numbers.py"]),
        ("levelup_numbers", [PY, "tests/levelup_numbers.py"]),
        ("sense_mastery_numbers", [PY, "tests/sense_mastery_numbers.py"]),
        ("state_numbers", [PY, "tests/state_numbers.py"]),
        ("rest_numbers", [PY, "tests/rest_numbers.py"]),
        ("bladesong_numbers", [PY, "tests/bladesong_numbers.py"]),
        ("sub_gap_numbers", [PY, "tests/sub_gap_numbers.py"]),
        ("situational_cls_numbers", [PY, "tests/situational_cls_numbers.py"]),
        ("weapon_items", [PY, "tests/weapon_items.py"]),
        ("armor_items", [PY, "tests/armor_items.py"]),
        ("golden_builds", [PY, "tests/golden_builds.py"]),
        ("invariants_quick", [PY, "tests/invariants.py", "--quick"]),
        ("fx_overlap", [PY, "tests/fx_overlap.py"]),
        ("fx_names_exist", [PY, "tests/fx_names_exist.py"]),
        ("xdmg_edition", [PY, "tests/xdmg_edition.py"]),
        ("xdmg14", [PY, "tests/xdmg14.py"]),
        ("gaps14", [PY, "tests/gaps14.py"]),
        ("expertise_picks", [PY, "tests/expertise_picks.py"]),
        ("item_fx_once", [PY, "tests/item_fx_once.py"]),
        ("species_fx", [PY, "tests/species_fx.py"]),
        ("feat_profs", [PY, "tests/feat_profs.py"]),
        ("quickbuild_rules", [PY, "tests/quickbuild_rules.py"]),
        ("subclass_editions", [PY, "tests/subclass_editions.py"]),
        ("vss14_traits", [PY, "tests/vss14_traits.py"]),
        ("class_resources", [PY, "tests/class_resources.py"]),
        ("spell_numbers", [PY, "tests/spell_numbers.py"]),
        ("spell_damage", [PY, "tests/spell_damage.py"]),
        ("subclass_resources", [PY, "tests/subclass_resources.py"]),
        ("subclass_resources14", [PY, "tests/subclass_resources14.py"]),
        ("subclass_resources_tp", [PY, "tests/subclass_resources_tp.py"]),
        ("subclass_traits", [PY, "tests/subclass_traits.py"]),
        ("builder_cost", [PY, "tests/builder_cost.py"]),
        ("audit_sweep", [PY, "tools/audit_char.py", "--sweep"]),
    ],
    "sheet": [
        ("solid_contract", [PY, "tests/solid_contract.py"]),
        ("audit_selftest", [PY, "tools/audit_char.py", "--selftest"]),
        ("audit_sweep", [PY, "tools/audit_char.py", "--sweep"]),
        ("golden_builds", [PY, "tests/golden_builds.py"]),
    ],
    "modules": [
        ("names_lint", [PY, "tests/names_lint.py"]),
        ("guard_all", [PY, "tests/guard_all.py", "--enforce"]),
        ("tsc_gate", [PY, "tools/tsc_gate.py"]),
    ],
    "items": [
        ("coverage_gate", [PY, "tests/coverage_gate.py"]),
        ("mech_scan", [PY, "tests/mech_scan.py"]),
        ("item_numbers_more", [PY, "tests/item_numbers_more.py"]),
        ("itemfeat_gap_numbers", [PY, "tests/itemfeat_gap_numbers.py"]),
        ("situational_misc_numbers", [PY, "tests/situational_misc_numbers.py"]),
        ("speedzero_numbers", [PY, "tests/speedzero_numbers.py"]),
        ("picks_numbers", [PY, "tests/picks_numbers.py"]),
        ("review_fix_b", [PY, "tests/review_fix_b.py"]),
        ("review_fix_d", [PY, "tests/review_fix_d.py"]),
        ("review_g02", [PY, "tests/review_g02.py"]),
        ("review_g04", [PY, "tests/review_g04.py"]),
        ("review_g12", [PY, "tests/review_g12.py"]),
        ("review_g16", [PY, "tests/review_g16.py"]),
        ("review_g03", [PY, "tests/review_g03.py"]),
        ("review_g14", [PY, "tests/review_g14.py"]),
        ("review_g13", [PY, "tests/review_g13.py"]),
        ("review_g15", [PY, "tests/review_g15.py"]),
        ("review_g11", [PY, "tests/review_g11.py"]),
        ("hpmul_numbers", [PY, "tests/hpmul_numbers.py"]),
        ("review_fix_c", [PY, "tests/review_fix_c.py"]),
        ("fx_engine", [PY, "tests/fx_engine.py"]),
    ],
    "ui": [
        ("builder_cost", [PY, "tests/builder_cost.py"]),
        ("html_gate", [PY, "tools/html_gate.py"]),
        ("scenarios", [PY, "tests/scenarios.py"]),
    ],
    "pdf": [
        ("pdfx_export", [PY, "tests/pdfx_export.py"]),
        ("pdf_numbers", [PY, "tests/pdf_numbers.py"]),
    ],
}

# path prefix -> areas, first match wins. Used by --changed.
PATHS = [
    ("src/data/fx-", ["engine", "items"]),
    ("src/builder/12", ["sheet", "engine"]),
    ("src/builder/10", ["engine"]),
    ("src/builder/11", ["engine"]),
    ("src/builder/03-", ["engine", "items"]),
    ("src/builder/", ["engine"]),
    ("src/pdf/", ["pdf"]),
    ("src/css/", ["ui"]),
    ("src/html/", ["ui"]),
    ("src/fx/", ["ui"]),
    ("src/app/", ["ui"]),
    ("src/data/", ["items"]),
    ("src/manifest.json", ["modules"]),
    ("tools/gen_", ["engine", "items"]),
]


def changed_areas():
    try:
        base = subprocess.run(["git", "merge-base", "HEAD", "origin/main"], cwd=ROOT,
                              capture_output=True, text=True, check=True).stdout.strip()
    except subprocess.CalledProcessError:
        base = "HEAD"
    out = subprocess.run(["git", "diff", "--name-only", base], cwd=ROOT, capture_output=True, text=True).stdout
    out += subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], cwd=ROOT,
                          capture_output=True, text=True).stdout
    areas = []
    for path in out.split():
        for prefix, ar in PATHS:
            if path.startswith(prefix):
                for a in ar:
                    if a not in areas:
                        areas.append(a)
                break
        if path.startswith("src/") and path.endswith(".js") and "modules" not in areas:
            new = subprocess.run(["git", "diff", "--diff-filter=A", "--name-only", base, "--", path], cwd=ROOT,
                                 capture_output=True, text=True).stdout.strip()
            if new or path in subprocess.run(["git", "ls-files", "--others", "--exclude-standard"], cwd=ROOT,
                                             capture_output=True, text=True).stdout.split():
                areas.append("modules")
    return areas


def run(name, cmd):
    t = time.time()
    path = os.path.join(LOG, name + ".log")
    with open(path, "w") as f:
        r = subprocess.run(cmd, cwd=ROOT, stdout=f, stderr=subprocess.STDOUT)
    last = ""
    try:
        lines = [l.strip() for l in open(path, errors="replace") if l.strip()]
        last = lines[-1][:110] if lines else ""
    except OSError:
        pass
    return name, r.returncode, time.time() - t, last, path


def main():
    p = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    p.add_argument("areas", nargs="*")
    p.add_argument("--changed", action="store_true")
    p.add_argument("--list", action="store_true")
    p.add_argument("--no-build", action="store_true")
    p.add_argument("--dry", action="store_true", help="show what would run, run nothing")
    p.add_argument("-j", type=int, default=min(4, os.cpu_count() or 1))
    a = p.parse_args()

    if a.list:
        for k, tests in AREAS.items():
            print("%-8s %s" % (k, ", ".join(n for n, _ in tests)))
        return 0
    areas = list(a.areas)
    if a.changed:
        areas += [x for x in changed_areas() if x not in areas]
        print("changed areas: " + (", ".join(areas) or "none"))
    bad = [x for x in areas if x not in AREAS]
    if bad:
        p.error("unknown area %s (see --list)" % ", ".join(bad))
    if not areas:
        print("nothing to run. Give an area or --changed. Areas: " + ", ".join(AREAS))
        return 0

    if a.dry:
        names = []
        for ar in areas:
            names += [n for n, _ in AREAS[ar] if n not in names]
        print("would run: " + ("" if a.no_build else "build_check, ") + ", ".join(names))
        return 0
    os.makedirs(LOG, exist_ok=True)
    t0 = time.time()
    if not a.no_build:
        name, rc, secs, last, path = run("build_check", [PY, "build.py", "--check"])
        print("%-18s %-4s %5.0fs  %s" % (name, "ok" if rc == 0 else "FAIL", secs, last))
        if rc != 0:
            print("build is out of sync or lint failed. Run python3 build.py first. Log: " + os.path.relpath(path, ROOT))
            return 1

    jobs, seen = [], set()
    for ar in areas:
        for name, cmd in AREAS[ar]:
            if name not in seen:
                seen.add(name)
                jobs.append((name, cmd))
    # longest first, so the slow ones start early
    order = ["invariants_quick", "golden_builds", "scenarios", "pdfx_export", "fx_engine", "golden_rules"]
    jobs.sort(key=lambda j: order.index(j[0]) if j[0] in order else len(order))

    fails = 0
    with cf.ThreadPoolExecutor(max_workers=max(1, a.j)) as ex:
        for fut in cf.as_completed([ex.submit(run, n, c) for n, c in jobs]):
            name, rc, secs, last, path = fut.result()
            ok = rc == 0
            fails += not ok
            print("%-18s %-4s %5.0fs  %s" % (name, "ok" if ok else "FAIL", secs, last), flush=True)
            if not ok:
                print("%18s log: %s" % ("", os.path.relpath(path, ROOT)), flush=True)
    print("%d tests, %d failed, %.0fs" % (len(jobs), fails, time.time() - t0))
    return 1 if fails else 0


if __name__ == "__main__":
    sys.exit(main())
