#!/usr/bin/env python3
"""N32: run the 74 screens of tests/style_snapshot.py with the part trace on, and write reports/trace.json (a list, one entry per run).
  python3 tests/trace_screens.py          Then: python3 tools/split_plan.py"""
import os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = dict(os.environ, CS_TRACE=os.path.join(ROOT, "reports", "trace.json"))
r = subprocess.run([sys.executable, os.path.join(ROOT, "tests", "style_snapshot.py"), os.path.join(ROOT, "reports", "trace-snap.json"), "--variants"], env=env)
if os.path.exists(os.path.join(ROOT, "reports", "trace-snap.json")): os.remove(os.path.join(ROOT, "reports", "trace-snap.json"))
sys.exit(r.returncode)
