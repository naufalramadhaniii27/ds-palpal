#!/usr/bin/env node
/* T11 Learn U43 and U48: the plain-language gate. build.py runs it, and a broken rule stops the build.
   node tools/learn_lint.js src/learn/45-data-learn.js [--stats]
   Every text pair {en, id}: both present, at most 2 sentences, English sentences at most 14 words and Indonesian at most 12,
   no stiff Indonesian words (rencana-kerja-learn.md, U28), no "Anda", the same numbers in both languages, glossary keys that exist.
   Averages over all text: English at most 10 words per sentence, Indonesian at most 9. */
var fs = require("fs"), path = process.argv[2], stats = process.argv.indexOf("--stats") > 0;
var src = fs.readFileSync(path, "utf8"); var LEARN = (new Function(src + "\nreturn LEARN;"))();
var STIFF = ["apabila", "jika", "merupakan", "tersebut", "dapat", "memiliki", "melakukan", "sehingga", "namun", "mengenai", "terlebih dahulu", "yakni", "yaitu", "maka", "anda"];
var MAX = { en: 14, id: 12 }, AVG = { en: 10, id: 9 }, bad = [], tot = { en: [0, 0], id: [0, 0] }, pairs = 0;
function plain(s) { return s.replace(/\[\[(\w+)\|([^\]]+)\]\]/g, "$2").replace(/["“”]/g, ""); }
function sentences(s) { return plain(s).split(/(?<=[.!?])\s+/).map(function (x) { return x.trim(); }).filter(Boolean); }
function words(s) { return s.split(/\s+/).filter(function (w) { return /[\p{L}\p{N}]/u.test(w); }).length; }
function nums(s) { return (plain(s).match(/[+-]?\d+/g) || []).map(function (n) { return n.replace("+", ""); }).sort().join(","); }
function check(o, where) {
  pairs++;
  ["en", "id"].forEach(function (l) {
    var s = o[l]; if (typeof s !== "string" || !s.trim()) { bad.push(where + ": " + l + " missing"); return; }
    var ss = sentences(s); if (ss.length > 2) bad.push(where + " " + l + ": " + ss.length + " sentences: " + s);
    ss.forEach(function (x) { var n = words(x); tot[l][0] += n; tot[l][1]++; if (n > MAX[l]) bad.push(where + " " + l + ": " + n + " words: " + x); });
    (s.match(/\[\[(\w+)\|/g) || []).forEach(function (m) { var k = m.slice(2, -1); if (!LEARN.terms[k]) bad.push(where + ": unknown glossary key " + k); });
  });
  if (typeof o.id === "string") { var low = " " + plain(o.id).toLowerCase().replace(/[^\p{L}\s-]/gu, " ") + " ";
    STIFF.forEach(function (w) { if (low.indexOf(" " + w + " ") >= 0) bad.push(where + " id: stiff word \"" + w + "\": " + o.id); }); }
  if (typeof o.en === "string" && typeof o.id === "string" && nums(o.en) !== nums(o.id)) bad.push(where + ": numbers differ: " + o.en + " | " + o.id);
}
function walk(v, where) {
  if (!v || typeof v !== "object") return;
  if (Array.isArray(v)) { v.forEach(function (x, i) { walk(x, where + "[" + i + "]"); }); return; }
  if ("en" in v) { check(v, where); return; }  /* a stop has an id field too, a text always has en */
  Object.keys(v).forEach(function (k) { walk(v[k], where + "." + k); });
}
walk(LEARN, "LEARN");
["en", "id"].forEach(function (l) { var a = tot[l][0] / Math.max(1, tot[l][1]); if (a > AVG[l]) bad.push("average " + l + " " + a.toFixed(1) + " words per sentence, limit " + AVG[l]); if (stats) console.log(l, "sentences", tot[l][1], "average words", a.toFixed(1)); });
if (stats) console.log("text pairs", pairs);
if (bad.length) { console.error("learn_lint: " + bad.length + " problems"); bad.forEach(function (b) { console.error("  " + b); }); process.exit(1); }
console.log("learn_lint: ok, " + pairs + " text pairs");
