#!/usr/bin/env python3
"""Safe release of approved Codex art (Q3, Q4) to main without clashing with other work.
  python3 tools/art_codex_release.py ART_TASKS_CHECKOUT
Run from any checkout of the repo. It works in its own worktree (/home/claude/artrel, branch art-release) so no other branch or
worktree is touched, and it never force pushes.
1. Start from the newest origin/main.
2. tools/art_codex_q.py installs only approved art, never overwrites art it did not write itself.
3. The change must stay inside the installer's own paths (art folders, manifest, generated files). Anything else stops the release.
4. Build and tests: scenarios (390x844 and 1250x850), art_install, detail_img, build --check.
5. Fetch again. If main moved, start over from step 1 on the new main (the install is repeated, so the other work stays intact).
6. Push as a fast-forward only. A rejected push also starts over. Three attempts at most.
Exit 0 = pushed or nothing to install. Exit 1 = stopped, reason printed, nothing pushed."""
import os, subprocess, sys
AT = os.path.abspath(sys.argv[1])
REPO = subprocess.run(["git", "rev-parse", "--path-format=absolute", "--git-common-dir"], capture_output=True, text=True, check=True).stdout.strip()
REPO = os.path.dirname(REPO) if REPO.endswith("/.git") else REPO
WT = "/home/claude/artrel"
AUTHOR = ["-c", "user.name=Claude", "-c", "user.email=noreply@anthropic.com"]
def sh(*a, cwd=WT, ok=True, t=1800):
    r = subprocess.run(list(a), cwd=cwd, capture_output=True, text=True, timeout=t)
    if ok and r.returncode: print("FAILED:", " ".join(a), "\n", (r.stdout + r.stderr)[-1500:]); sys.exit(1)
    return r
def attempt():
    sh("git", "fetch", "-q", "origin", "main", cwd=REPO)
    if not os.path.exists(os.path.join(WT, ".git")): sh("git", "worktree", "add", "-q", "-B", "art-release", WT, "origin/main", cwd=REPO)
    sh("git", "checkout", "-q", "-B", "art-release", "origin/main"); sh("git", "reset", "-q", "--hard", "origin/main"); sh("git", "clean", "-qfd", "img", "src")
    nm = os.path.join(WT, "tools/build/node_modules")
    if not os.path.exists(nm): sh("npm", "ci", "--silent", "--prefix", "tools/build", t=900)   # esbuild for build.py
    base = sh("git", "rev-parse", "HEAD").stdout.strip()
    print(sh("python3", "tools/art_codex_q.py", AT).stdout.strip())
    if not sh("git", "status", "--porcelain").stdout.strip(): print("nothing to install"); return "done"
    allowed = sh("python3", "tools/art_codex_q.py", AT, "--paths").stdout.split()
    sh("python3", "build.py")
    changed = [l[3:] for l in sh("git", "status", "--porcelain", "-uall").stdout.splitlines()]
    bad = [c for c in changed if not any(c == a or c.startswith(a) for a in allowed)]
    if bad: print("STOP: change outside the art paths:", bad[:10]); sys.exit(1)
    for t in ["tests/scenarios.py", "tests/art_install.py", "tests/detail_img.py"]:
        r = sh("python3", t, ok=False); tail = (r.stdout + r.stderr).strip().splitlines()[-1:] or [""]
        print(t, tail[0])
        if r.returncode or "failed" in tail[0] and " 0 failed" not in tail[0] or ("SCORE" in tail[0] and "SCORE 100" not in tail[0]): print("STOP: test failed"); sys.exit(1)
    sh("python3", "build.py", "--check")
    n = sum(1 for c in changed if c.startswith(("img/hd/mon/", "img/hd/icon/")))
    sh("git", "add", "-A"); sh("git", *AUTHOR, "commit", "-qm", "Art: %d approved Codex pictures (Q3, Q4) via tools/art_codex_release.py\n\nCo-Authored-By: Claude <noreply@anthropic.com>" % n)
    sh("git", "fetch", "-q", "origin", "main", cwd=REPO)
    if sh("git", "rev-parse", "origin/main").stdout.strip() != base: print("main moved, starting over on the new main"); return "again"
    r = sh("git", "push", "origin", "HEAD:main", ok=False)        # plain push = fast-forward only
    if r.returncode: print("push rejected, starting over"); return "again"
    print("pushed", sh("git", "rev-parse", "--short", "HEAD").stdout.strip()); return "done"
for i in range(3):
    if attempt() == "done": sys.exit(0)
print("STOP: main kept moving, nothing pushed"); sys.exit(1)
