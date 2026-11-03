#!/usr/bin/env node
/* N44 helper: from the functions that html_codemod2 would make return a template, keep those whose every use is safe when the result is a
   template instead of a string. Safe: operand of +, argument of rawHtml/drawHtml/esc/String, template literal hole, right side of += or innerHTML =,
   a return value (then the enclosing function joins the check). Anything else (.length, a test, an argument to other code, a reference without a call) is unsafe.
   A name counts as unsafe when any use of that name anywhere is unsafe (names are matched by text, so ambiguous names drop out).
   node tools/html_safe_names.js CANDIDATES.json FILE... > safe.json   (the reasons go to stderr) */
const fs = require("fs"), path = require("path");
const acorn = require(path.join(__dirname, "build/node_modules/acorn"));
const [cand, ...files] = process.argv.slice(2);
let allow = new Set(JSON.parse(fs.readFileSync(cand, "utf8"))), why = {};
const trees = files.map(f => ({ f, src: fs.readFileSync(f, "utf8"), ast: acorn.parse(fs.readFileSync(f, "utf8"), { ecmaVersion: "latest", sourceType: "module", locations: true }) }));
const nameOfFn = (n, parent) => n.type === "FunctionDeclaration" && n.id ? n.id.name : (parent && parent.type === "VariableDeclarator" && parent.id.type === "Identifier") ? parent.id.name : (parent && parent.type === "Property" && parent.key.name) ? parent.key.name : (parent && parent.type === "AssignmentExpression" && parent.left.type === "MemberExpression" && parent.left.property.name) ? parent.left.property.name : "";
const SAFE_CALLEES = new Set(["rawHtml", "drawHtml", "esc", "String", "raw", "html", "render"]);
function scan() {
  const bad = {}, extra = new Set();
  for (const { f, ast } of trees) {
    const stack = [];
    const visit = (n, parent, up) => {
      if (!n || typeof n.type !== "string") return;
      const isFn = /Function/.test(n.type); if (isFn) stack.push(nameOfFn(n, parent) || "");
      /* a use of an allowed name? */
      let nm = null, callNode = null;
      if (n.type === "CallExpression") { const c = n.callee; nm = c.type === "Identifier" ? c.name : (c.type === "MemberExpression" && !c.computed) ? c.property.name : null; callNode = n; }
      else if (n.type === "Identifier" && allow.has(n.name) && !(parent && ((parent.type === "CallExpression" && parent.callee === n) || (parent.type === "FunctionDeclaration" && parent.id === n) || (parent.type === "MemberExpression" && parent.property === n && !parent.computed) || (parent.type === "VariableDeclarator" && parent.id === n) || (parent.type === "Property" && parent.key === n && !parent.computed) || (parent.type === "ImportSpecifier") || (parent.type === "ExportSpecifier") || (parent.type === "AssignmentExpression" && parent.left === n) || (parent.type === "AssignmentExpression" && parent.left.type === "MemberExpression" && parent.left.property === n)))) { bad[n.name] = (bad[n.name] || f + ":" + n.loc.start.line + " used as a value"); }
      else if (n.type === "MemberExpression" && !n.computed && allow.has(n.property.name) && !(parent && parent.type === "CallExpression" && parent.callee === n) && !(parent && parent.type === "AssignmentExpression" && parent.left === n)) { bad[n.property.name] = (bad[n.property.name] || f + ":" + n.loc.start.line + " member used as a value"); }
      if (callNode && nm && allow.has(nm)) {
        const p = up[up.length - 1], pp = up[up.length - 2];
        let ok = false;
        if (p) {
          if (p.type === "BinaryExpression" && p.operator === "+") ok = true;
          else if (p.type === "TemplateLiteral") ok = true;
          else if (p.type === "AssignmentExpression" && (p.operator === "+=" || (p.operator === "=" && p.left.type === "MemberExpression" && p.left.property && p.left.property.name === "innerHTML")) && p.right === n) ok = true;
          else if (p.type === "CallExpression" && p.arguments.includes(n) && ((p.callee.type === "Identifier" && SAFE_CALLEES.has(p.callee.name)))) ok = true;
          else if (p.type === "ReturnStatement" || (p.type === "ArrowFunctionExpression" && p.body === n)) { const en = stack.slice().reverse().find(x => x) || ""; if (en) extra.add(en); ok = true; if (!en) ok = false; }
          else if (p.type === "ConditionalExpression" && (p.consequent === n || p.alternate === n)) { /* value of a conditional: look one level up */ const q = pp; ok = !!q && ((q.type === "BinaryExpression" && q.operator === "+") || (q.type === "CallExpression" && q.callee.type === "Identifier" && SAFE_CALLEES.has(q.callee.name)) || (q.type === "AssignmentExpression" && q.operator === "+=") || q.type === "ReturnStatement"); if (q && q.type === "ReturnStatement") { const en = stack.slice().reverse().find(x => x) || ""; if (en) extra.add(en); else ok = false; } }
          else if (p.type === "ExpressionStatement") ok = true; /* result unused */
        }
        if (!ok) bad[nm] = (bad[nm] || f + ":" + n.loc.start.line + " " + (p ? p.type : "?"));
      }
      for (const k in n) { const v = n[k]; if (Array.isArray(v)) v.forEach(x => x && typeof x.type === "string" && visit(x, n, up.concat([n]))); else if (v && typeof v.type === "string") visit(v, n, up.concat([n])); }
      if (isFn) stack.pop();
    };
    visit(ast, null, []);
  }
  return { bad, extra };
}
/* propagate: a function that returns an allowed function's result must itself be safe at every use */
for (let round = 0; round < 12; round++) {
  const { bad, extra } = scan(); let changed = false;
  Object.keys(bad).forEach(k => { if (allow.has(k)) { allow.delete(k); why[k] = bad[k]; changed = true; } });
  extra.forEach(e => { if (!allow.has(e) && !why[e]) { allow.add(e); changed = true; } });
  if (!changed) break;
}
console.error("safe " + allow.size + ", unsafe " + Object.keys(why).length);
fs.writeFileSync("/tmp/unsafe-names.json", JSON.stringify(why, null, 1));
console.log(JSON.stringify([...allow]));
