"""N44: unit test of src/app/lib/html.js in a bare page (no app). Prints SCORE n = passed checks / total * 100 on the last line."""
import os, subprocess, sys, tempfile
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ES = os.path.join(ROOT, "tools", "build", "node_modules", ".bin", "esbuild")
out = os.path.join(tempfile.mkdtemp(), "h.js")
subprocess.run([ES, os.path.join(ROOT, "src/app/lib/html.js"), "--bundle", "--format=iife", "--global-name=H", "--outfile=" + out, "--log-level=error"], check=True)
CASES = r"""
const {html, raw, render} = H; const R = [];
const ok = (n, c) => R.push([n, !!c]);
const box = () => { const d = document.createElement("div"); document.body.append(d); return d; };
let d = box();
render(html`<b>${"<img src=x onerror=alert(1)>"}</b>`, d);
ok("text hole is escaped", d.querySelector("img") === null && d.textContent.includes("<img"));
d = box(); render(html`<p class="a ${'x" onclick="y'} b">t</p>`, d);
ok("attr hole cannot add attributes", !d.firstChild.hasAttribute("onclick") && d.firstChild.className === 'a x" onclick="y b');
d = box(); render(html`<a href="${"javascript:alert(1)"}">l</a>`, d);
ok("javascript: href refused", d.firstChild.getAttribute("href") === "about:blank");
d = box(); let thrown = false; try { render(html`<i ${' onclick="x()"'}>t</i>`, d); } catch (e) { thrown = true; }
ok("on* in attribute list refused", thrown);
d = box(); render(html`<input ${' type="checkbox" checked'}>`, d);
ok("attribute list sets names", d.firstChild.type === "checkbox" && d.firstChild.hasAttribute("checked"));
d = box(); render(html`<ul>${[1, 2, 3].map(i => html`<li>${i}</li>`)}</ul>`, d);
ok("array of templates", d.querySelectorAll("li").length === 3 && d.textContent === "123");
d = box(); render(html`<span>${raw("<em>x</em>")}</span>`, d);
ok("raw markup", d.querySelector("em") !== null);
d = box(); render(html`<span>${null}|${false}|${0}</span>`, d);
ok("null and false draw nothing, 0 draws 0", d.textContent === "||0");
d = box(); const mk = n => html`<p id="p">${n}</p>`;
render(mk(1), d); const p1 = d.firstChild; const t1 = p1.firstChild; render(mk(2), d);
ok("same template keeps nodes", d.firstChild === p1 && d.textContent === "2");
d = box(); render(mk(1), d); d.innerHTML = "<i>other</i>"; render(mk(2), d);
ok("outside overwrite is redrawn", d.querySelector("p") !== null && d.textContent === "2");
d = box(); render(html`${"only text"}`, d); render(html`${"only text"}`, d);
ok("text-only template twice", d.textContent === "only text");
d = box(); render(raw("<b>a</b>"), d); render(raw("<i>b</i>"), d);
ok("render of a lone raw() redraws", d.querySelector("i") !== null && d.querySelector("b") === null);
d = box(); render("<b>x</b>", d); ok("render of a lone string is text", d.querySelector("b") === null && d.textContent === "<b>x</b>");
d = box(); render([html`<i>1</i>`, html`<i>2</i>`], d); ok("render of an array", d.querySelectorAll("i").length === 2);
d = box(); const ml = n => html`<ul>${Array.from({length: n}, (_, i) => html`<li>${i}</li>`)}</ul>`;
render(ml(3), d); const li0 = d.querySelector("li"); render(ml(5), d);
ok("list grows, first item kept", d.querySelectorAll("li").length === 5 && d.querySelector("li") === li0);
render(ml(1), d); ok("list shrinks", d.querySelectorAll("li").length === 1 && d.textContent === "0");
d = box(); render(html`<button ?disabled="${true}">a</button>`, d);
ok("boolean attribute on", d.firstChild.hasAttribute("disabled"));
render(html`<button ?disabled="${true}">a</button>`, d);
d = box(); const bb = v => html`<button ?disabled="${v}">a</button>`; render(bb(true), d); render(bb(false), d);
ok("boolean attribute off", !d.firstChild.hasAttribute("disabled"));
d = box(); render(html`<textarea>${"<b>x</b>"}</textarea>`, d);
ok("textarea value is text", d.firstChild.value === "<b>x</b>");
d = box(); render(html`<p>${html`<i>a</i>`}${html`<i>b</i>`}</p>`, d);
ok("nested templates", d.querySelectorAll("i").length === 2);
d = box(); const sw = k => k ? html`<b>x</b>` : html`<i>y</i>`; render(html`<p>${sw(true)}</p>`, d);
const q = x => html`<p>${x}</p>`; render(q(sw(true)), d); render(q(sw(false)), d);
ok("switch between templates", d.querySelector("i") !== null && d.querySelector("b") === null);
d = box(); render(html`<p title="${'a&b "q"'}">${'a&b "q"'}</p>`, d);
ok("special characters stay text", d.firstChild.title === 'a&b "q"' && d.textContent === 'a&b "q"');
return R;
"""
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(); pg.set_content("<body></body>")
    pg.add_script_tag(path=out)
    res = pg.evaluate("(() => {" + CASES + "})()")
    b.close()
n = 0
for name, ok in res:
    print(("ok   " if ok else "FAIL ") + name); n += ok
print("SCORE %d" % round(100 * n / len(res)))
