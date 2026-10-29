import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseMonster, parseAction } from "./statblock-parse.mjs";

const file = process.argv[2];
if (!file) { console.log("usage: node statblock-parse.test.mjs bestiary-xmm.json"); process.exit(2); }
const all = JSON.parse(readFileSync(file, "utf8")).monster;

// fixed cases
const dragon = parseMonster(all.find((m) => m.name === "Adult Red Dragon"));
assert.equal(dragon.actions[0].kind, "multiattack");
assert.deepEqual(dragon.actions[0].attacks[0], { name: "Rend", count: 3 });
assert.equal(dragon.actions[1].kind, "attack");
assert.equal(dragon.actions[1].hit, 14);
assert.deepEqual(dragon.actions[1].damage.map((d) => d.dice), ["1d10 + 8", "2d4"]);
assert.equal(dragon.actions[2].kind, "save");
assert.equal(dragon.actions[2].dc, 21);
assert.equal(dragon.actions[2].halfOnSave, true);
assert.equal(parseAction({ name: "Odd", entries: ["It does a strange thing."] }).kind, "manual");

// coverage over the whole file, split by srd flag
const stat = { all: {}, srd: {} };
const bad = [];
for (const m of all) {
  const g = m.srd52 ? stat.srd : stat.all;
  const p = parseMonster(m);
  for (const part of [p.actions, p.bonus, p.reactions, p.legendary]) {
    for (const a of part) {
      g[a.kind] = (g[a.kind] || 0) + 1;
      if (a.kind === "attack") {
        assert.ok(Number.isFinite(a.hit) && a.damage.length > 0, m.name + " " + a.name);
        for (const d of a.damage) assert.match(d.dice, /^\d+d\d+( ?[+-] ?\d+)?$|^\d+$/, m.name + " dice " + d.dice);
      }
      if (a.kind === "save") assert.ok(a.dc > 0 && a.damage.length >= 0);
      if (a.kind === "manual" && bad.length < 12) bad.push(m.name + ": " + a.name);
    }
  }
}
const rate = (g) => { const t = Object.values(g).reduce((x, y) => x + y, 0); return [t, ((100 * (t - (g.manual || 0))) / t).toFixed(1)]; };
const srdAll = { ...stat.srd };
for (const k in stat.all) srdAll[k] = (srdAll[k] || 0) + stat.all[k];
console.log("SRD-flagged:", JSON.stringify(stat.srd), "read by machine %", rate(stat.srd)[1]);
console.log("Non-SRD:", JSON.stringify(stat.all), "read by machine %", rate(stat.all)[1]);
console.log("All 503:", JSON.stringify(srdAll), "read by machine %", rate(srdAll)[1]);
console.log("manual examples:", bad.join(" | "));
