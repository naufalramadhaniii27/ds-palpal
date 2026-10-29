#!/usr/bin/env python3
"""T11 D1: build the dice (dice-box 1.1.4 on BabylonJS 9.32.1 and Havok 1.3.14) from src/dice into vendor/dice.
  python3 tools/dice_build.py
Needs: npm ci --prefix tools/build. Output: dice-box.js (ES module, loaded with import() on the first roll), dice-physics.js and
dice-offscreen.js (module workers), chunk files, havok/HavokPhysics.wasm, themes/default, licenses."""
import os, shutil, subprocess, sys, glob
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
NM = os.path.join(HERE, "build", "node_modules"); ES = os.path.join(NM, ".bin", "esbuild")
SRC = os.path.join(ROOT, "src", "dice"); OUT = os.path.join(ROOT, "vendor", "dice")
def run(args):
    r = subprocess.run([ES] + args, cwd=ROOT, capture_output=True, text=True, env=dict(os.environ, NODE_PATH=NM))
    if r.returncode: sys.exit(r.stderr[-3000:])
    if r.stderr.strip(): print(r.stderr[-1500:])
def main():
    for f in glob.glob(os.path.join(OUT, "*.js")): os.remove(f)
    os.makedirs(OUT, exist_ok=True)
    common = ["--bundle", "--format=esm", "--minify", "--target=es2022", "--legal-comments=none", "--log-level=warning", "--charset=utf8"]
    env_paths = ["--resolve-extensions=.js,.mjs"]
    run([os.path.join(SRC, "entry.js"), "--splitting", "--outdir=" + OUT, "--entry-names=dice-box", "--chunk-names=dice-[hash]"] + common + env_paths)
    run([os.path.join(SRC, "components", "physics.worker.js"), "--outfile=" + os.path.join(OUT, "dice-physics.js")] + common + env_paths)
    run([os.path.join(SRC, "components", "offscreenCanvas.worker.js"), "--outfile=" + os.path.join(OUT, "dice-offscreen.js")] + common + env_paths)
    os.makedirs(os.path.join(OUT, "havok"), exist_ok=True)
    shutil.copy(os.path.join(NM, "@babylonjs", "havok", "lib", "esm", "HavokPhysics.wasm"), os.path.join(OUT, "havok", "HavokPhysics.wasm"))
    if os.path.isdir(os.path.join(OUT, "themes")): shutil.rmtree(os.path.join(OUT, "themes"))
    shutil.copytree(os.path.join(SRC, "themes"), os.path.join(OUT, "themes"))
    shutil.copy(os.path.join(SRC, "LICENSE-dice-box.txt"), OUT)
    shutil.copy(os.path.join(NM, "@babylonjs", "havok", "LICENSE.md") if os.path.exists(os.path.join(NM, "@babylonjs", "havok", "LICENSE.md")) else os.path.join(NM, "@babylonjs", "havok", "LICENSE"), os.path.join(OUT, "LICENSE-havok.txt"))
    shutil.copy(os.path.join(NM, "@babylonjs", "core", "license.md") if os.path.exists(os.path.join(NM, "@babylonjs", "core", "license.md")) else os.path.join(NM, "@babylonjs", "core", "LICENSE.md"), os.path.join(OUT, "LICENSE-babylonjs.txt"))
    tot = 0
    for f in sorted(glob.glob(os.path.join(OUT, "**", "*"), recursive=True)):
        if os.path.isfile(f): tot += os.path.getsize(f)
    print("vendor/dice", tot, "bytes")
main()
