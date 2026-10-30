set -e
cd /home/claude/dnd-sheet
cp src/app/45-dev-fps-probe.js /tmp/claude-0/probe.new
python3 - <<'PY'
p="/home/claude/dnd-sheet/src/app/45-dev-fps-probe.js"; s=open(p,encoding="utf8").read()
old='if(!/(^|[#&])fps($|&)/.test(location.hash)) return;'
assert old in s
open(p,"w",encoding="utf8").write(s.replace(old,'/* always on in this test copy */'))
PY
python3 build.py | tail -1; cp index.html /tmp/claude-0/out/dnd-sheet-fps-test.html
cp /tmp/claude-0/probe.new src/app/45-dev-fps-probe.js; python3 build.py | tail -1
