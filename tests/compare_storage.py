#!/usr/bin/env python3
"""Compare the localStorage dumps of two scenario runs: python3 tests/compare_storage.py RUN_A RUN_B
Time stamps (13-digit numbers, ids built from them, ISO dates) and snapshot hashes are masked, everything else must match."""
import glob, json, os, re, sys
MASK = [(re.compile(r'\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z'), 'ISO'), (re.compile(r'1[6-9]\d{11}'), 'T'),
        (re.compile(r'"h":"[0-9a-z]{4,}"'), '"h":"HASH"')]  # snapshot hash, made from content that holds time stamps
def norm(v):
    if isinstance(v, str):
        for r, t in MASK:
            v = r.sub(t, v)
        return v
    return v
a, b = sys.argv[1], sys.argv[2]
bad = 0; n = 0
for fa in sorted(glob.glob(os.path.join(a, "storage-*.json"))):
    fb = os.path.join(b, os.path.basename(fa)); n += 1
    A = {norm(k): norm(v) for k, v in json.load(open(fa)).items()}
    B = {norm(k): norm(v) for k, v in json.load(open(fb)).items()}
    if A != B:
        bad += 1
        print("DIFFERENT", os.path.basename(fa), sorted(set(A) ^ set(B)), [k for k in A if k in B and A[k] != B[k]])
    else:
        print("same", os.path.basename(fa), len(A), "keys")
print("%d files, %d different" % (n, bad))
sys.exit(1 if bad else 0)
