#!/usr/bin/env python3
"""Read only. List what an agent has to write for one Q category.
  python3 tools/q/todo.py reward <chunk> <of>      entries of chunk (1 based) with the plain source text
  python3 tools/q/todo.py reward count"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import qbuild
cat = sys.argv[1]; todo = qbuild.todo(cat)
if sys.argv[2] == "count": print(len(todo)); sys.exit()
i, n = int(sys.argv[2]), int(sys.argv[3]); size = -(-len(todo) // n)
for e in todo[(i - 1) * size: i * size]:
    print("## %s|%s" % (e["name"], e["source"].upper())); print("type:", e.get("type", ""), " page:", e.get("page", "")); 
    if e.get("additionalSpells"): print("spells:", e["additionalSpells"])
    print(e["_text"]); print()
