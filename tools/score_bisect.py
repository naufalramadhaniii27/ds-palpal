#!/usr/bin/env python3
"""Find the commit that made a measure worse (N43).  python3 tools/score_bisect.py PREV.json CMP.txt
CMP.txt is the output of `tools/score.py --compare PREV.json`: lines "WORSE: section.measure OLD -> NEW".
For each worse measure it runs `git bisect run python3 tools/score.py --probe section.measure --limit OLD` between the commit of PREV.json and HEAD
and prints the first bad commit. The working tree is restored afterwards. Exit code 0 always: the caller decides how to fail."""
import json, re, subprocess, sys
prev = json.load(open(sys.argv[1])); good = prev.get("commit", ""); lines = open(sys.argv[2]).read().split("\n")
def git(*a): return subprocess.run(["git"] + list(a), capture_output=True, text=True)
head = git("rev-parse", "HEAD").stdout.strip()
if not good or git("cat-file", "-t", good).stdout.strip() != "commit": good = git("rev-parse", "HEAD~10").stdout.strip()
for ln in lines:
    m = re.match(r"WORSE: (\S+) (\S+) -> (\S+)", ln)
    if not m: continue
    spec, old, new = m.groups()
    git("bisect", "reset"); git("bisect", "start", head, good)
    r = subprocess.run(["git", "bisect", "run", "python3", "tools/score.py", "--probe", spec, "--limit", old], capture_output=True, text=True)
    first = re.search(r"([0-9a-f]{40}) is the first bad commit", r.stdout)
    info = git("log", "-1", "--format=%h %an %s", first.group(1)).stdout.strip() if first else "not found"
    print("%s went from %s to %s. First bad commit: %s" % (spec, old, new, info))
    git("bisect", "reset")
