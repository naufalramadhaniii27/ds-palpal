"""M8: src/app/lib/clipboard.js copyText(). Three cases in node with a fake navigator: allowed, refused, no Clipboard API. No document.execCommand anywhere in src/."""
import os, re, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = r'''
import { copyText } from %s;
const box = () => ({ n: 0, focus() { this.f = 1; }, select() { this.n++; } });
let R = [];
const ck = (n, ok) => { R.push(ok); console.log((ok ? "ok   " : "FAIL ") + n); };
let written = null;
const nav = (v) => Object.defineProperty(globalThis, "navigator", { value: v, configurable: true });
nav({ clipboard: { writeText: async (t) => { written = t; } } });
let b = box(); ck("allowed: true, text written, box not selected", (await copyText("abc", b)) === true && written === "abc" && b.n === 0);
nav({ clipboard: { writeText: async () => { throw new Error("denied"); } } });
b = box(); ck("refused: false and the box is selected", (await copyText("abc", b)) === false && b.n === 1);
nav({});
b = box(); ck("no Clipboard API: false and the box is selected", (await copyText("abc", b)) === false && b.n === 1);
ck("no box: no error", (await copyText("abc")) === false);
process.exit(R.every(Boolean) ? 0 : 1);
''' % repr("file://" + os.path.join(ROOT, "src", "app", "lib", "clipboard.js"))
d = tempfile.mkdtemp(); p = os.path.join(d, "t.mjs"); open(p, "w").write(js)
r = subprocess.run(["node", p], capture_output=True, text=True); print(r.stdout, r.stderr[-300:])
left = subprocess.run(["grep", "-rn", "execCommand", os.path.join(ROOT, "src"), "--include=*.js", "--exclude-dir=data"], capture_output=True, text=True).stdout.strip()
ok = r.returncode == 0 and not left
print("execCommand left in src:", len(left.splitlines())); print("SCORE %d" % (100 if ok else 0)); sys.exit(0 if ok else 1)
