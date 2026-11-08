/* PDFX: engine export PDF character sheet (D&D 5e 2014 dan 2024).
 * Lapis renderer: model cetak -> PDF. Tidak membaca state app, tidak menulis storage.
 * Butuh: PDFLib (@cantoo/pdf-lib) dan fontkit (@pdf-lib/fontkit) di global, atau dioper lewat opts.
 * API: PDFX.render(model, assets, opts) -> Promise<Uint8Array>
 *   assets = { tpl: {"2014": bytes, "2024": bytes}, map: tplmap.json, fonts: {Regular, Medium, SemiBold, Bold, Italic: bytes} }
 * Skema model: lihat PDFX-MODEL.md.
 */
(function (root) {
  "use strict";
  var W = 612, H = 792;
  var INK = [0.10, 0.10, 0.11], GRAY = [0.42, 0.43, 0.45], ACC = [0.55, 0.11, 0.09], LIGHT = [0.8, 0.8, 0.82], TINT = [0.975, 0.945, 0.935];
  var NB = " ";

  function PDFX(lib, fontkit) { this.L = lib; this.fk = fontkit; }

  // ---------- teks kaya ----------
  var TOK = /(\*\*.+?\*\*|(?<![A-Za-z0-9])_[^_\n]+?_(?![A-Za-z0-9])|\{\{.+?\}\}|\^\^.+?\^\^)/;
  function runs(par, size, base) {
    base = base || "Regular";
    var out = [];
    par.split(TOK).forEach(function (p) {
      if (!p) return;
      if (p.slice(0, 2) === "**" && p.slice(-2) === "**") out.push([p.slice(2, -2), "Bold", size, INK]);
      else if (p.slice(0, 2) === "{{") out.push([p.slice(2, -2), "Regular", size * 0.86, GRAY]);
      else if (p.slice(0, 2) === "^^") out.push([p.slice(2, -2), "SemiBold", size * 0.8, GRAY]);
      else if (p.length > 2 && p[0] === "_" && p[p.length - 1] === "_") out.push([p.slice(1, -1), "Italic", size, GRAY]);
      else out.push([p, base, size, INK]);
    });
    return out;
  }

  PDFX.prototype.w = function (t, f, s) { return this.F[f].widthOfTextAtSize(t, s); };

  // kata = grup potongan tanpa spasi di antaranya, tidak dipisah antar baris
  PDFX.prototype.wrapRuns = function (rl, width, lh) {
    var self = this, groups = [], lines = [];
    rl.forEach(function (r) {
      var t = r[0];
      if (t[0] === " " && groups.length) {
        var g = groups[groups.length - 1], last = g[g.length - 1];
        if (!/ $/.test(last[0])) g[g.length - 1] = [last[0] + " ", last[1], last[2], last[3]];
      }
      var re = /[^ ]+ */g, m, i = 0;
      while ((m = re.exec(t))) {
        var piece = [m[0], r[1], r[2], r[3]];
        var lastG = groups[groups.length - 1];
        if (i === 0 && t[0] !== " " && lastG && !/ $/.test(lastG[lastG.length - 1][0])) lastG.push(piece);
        else groups.push([piece]);
        i++;
      }
    });
    var cur = [], x = 0;
    groups.forEach(function (g) {
      var wd = 0;
      g.forEach(function (p, k) { wd += k < g.length - 1 ? self.w(p[0], p[1], p[2]) : self.w(p[0].replace(/ +$/, ""), p[1], p[2]); });
      if (cur.length && x + wd > width) { lines.push([lh, cur]); cur = []; x = 0; }
      g.forEach(function (p) { cur.push([x, p[0].split(NB).join(" "), p[1], p[2], p[3]]); x += self.w(p[0], p[1], p[2]); });
    });
    if (cur.length) lines.push([lh, cur]);
    return lines;
  };

  PDFX.prototype.layout = function (pars, width, size) {
    var self = this, lines = [];
    pars.forEach(function (p) {
      if (p === "") { lines.push([size * 0.55, []]); return; }
      if (p.slice(0, 2) === "# ") {
        var hs = size * 1.08;
        if (lines.length) lines.push([size * 0.45, []]);
        lines.push([hs * 1.3, [[0, p.slice(2).toUpperCase(), "Bold", hs, ACC]]]);
        return;
      }
      lines.push.apply(lines, self.wrapRuns(runs(p, size), width, size * 1.24));
    });
    return lines;
  };

  // ---------- gambar ----------
  PDFX.prototype.put = function (page, x, y, t, f, s, c) {
    if (!t) return;
    var L = this.L;
    page.drawText(t, { x: x, y: y, size: s, font: this.F[f], color: L.rgb(c[0], c[1], c[2]) });
  };
  PDFX.prototype.drawLines = function (page, ls, x, ytop) {
    var self = this, y = ytop, L = this.L;
    ls.forEach(function (l) {
      y -= l[0];
      l[1].forEach(function (s) {
        if (s.rect) {
          page.drawRectangle({ x: x + s.x, y: y - 0.2, width: s.w, height: l[0] + 0.4, color: L.rgb(s.c[0], s.c[1], s.c[2]) });
          if (s.bar) page.drawRectangle({ x: x + s.x, y: y - 0.2, width: 1.6, height: l[0] + 0.4, color: L.rgb(ACC[0], ACC[1], ACC[2]) });
          return;
        }
        if (s.rule) {
          page.drawLine({ start: { x: x + s.x, y: y + l[0] * 0.5 }, end: { x: x + s.x + s.w, y: y + l[0] * 0.5 },
                          thickness: s.t || 0.6, color: L.rgb(s.c[0], s.c[1], s.c[2]) });
        } else self.put(page, x + s[0], y + l[0] * 0.22, s[1].replace(/ +$/, ""), s[2], s[3], s[4]);
      });
    });
    return y;
  };

  // kotak template
  PDFX.prototype.rect = function (name) {
    var r = this.map[name];
    if (!r) throw new Error("PDFX: field tidak ada di template: " + name);
    return { p: this.pages[r[0]], x0: r[1], y0: r[2], x1: r[3], y1: r[4] };
  };
  PDFX.prototype.one = function (name, text, f, s, align, pad, vfrac) {
    if (text == null || text === "") return;
    text = String(text); f = f || "SemiBold"; s = s || 10; pad = pad == null ? 2 : pad; vfrac = vfrac == null ? 0.5 : vfrac;
    var r = this.rect(name), w = r.x1 - r.x0 - 2 * pad;
    while (this.w(text, f, s) > w && s > 5) s -= 0.25;
    var tw = this.w(text, f, s);
    var x = align === "center" ? r.x0 + (r.x1 - r.x0 - tw) / 2 : r.x0 + pad;
    this.put(r.p, x, r.y0 + (r.y1 - r.y0) * vfrac - s * 0.36, text, f, s, INK);
  };
  PDFX.prototype.unit = function (name, num, unit, s) {
    if (!num) return;
    var r = this.rect(name), a = this.w(num, "Bold", s), b = unit ? this.w(" " + unit, "Medium", s * 0.45) : 0;
    var x = r.x0 + (r.x1 - r.x0 - a - b) / 2, y = r.y0 + (r.y1 - r.y0) / 2 - s * 0.36;
    this.put(r.p, x, y, num, "Bold", s, INK);
    if (unit) this.put(r.p, x + a, y, " " + unit, "Medium", s * 0.45, GRAY);
  };
  PDFX.prototype.box = function (name, pars, s, smin, pad) {
    if (!pars || !pars.length) return;
    s = s || 7.8; smin = smin || 6.2; pad = pad == null ? 3 : pad;
    var r = this.rect(name), w = r.x1 - r.x0 - 2 * pad, h = r.y1 - r.y0 - 2 * pad, ls, tot;
    for (;;) {
      ls = this.layout(pars, w, s); tot = ls.reduce(function (a, l) { return a + l[0]; }, 0);
      if (tot <= h || s <= smin) break;
      s -= 0.2;
    }
    if (tot > h) {
      // potong baris yang tidak muat dan catat untuk dipindah ke lampiran
      var keep = [], acc = 0;
      for (var i = 0; i < ls.length; i++) { if (acc + ls[i][0] > h - s * 1.3) break; keep.push(ls[i]); acc += ls[i][0]; }
      keep.push([s * 1.24, [[0, "(continued in Features & Traits)", "Italic", s * 0.9, GRAY]]]);
      ls = keep; this.overflow.push(name);
    }
    this.drawLines(r.p, ls, r.x0 + pad, r.y1 - pad);
  };
  PDFX.prototype.dot = function (name) {
    var r = this.rect(name), L = this.L;
    r.p.drawCircle({ x: (r.x0 + r.x1) / 2, y: (r.y0 + r.y1) / 2, size: 2.1, color: L.rgb(INK[0], INK[1], INK[2]) });
  };

  // ---------- halaman 1 sampai 3 (template) ----------
  var SKILLS = ["Acrobatics", "Animal", "Arcana", "Athletics", "Deception ", "History ", "Insight", "Intimidation",
    "Investigation ", "Medicine", "Nature", "Perception ", "Performance", "Persuasion", "Religion",
    "SleightofHand", "Stealth ", "Survival"];
  var SKILL_NAMES = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation",
    "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion",
    "Sleight of Hand", "Stealth", "Survival"];
  var SAVES = ["ST Strength", "ST Dexterity", "ST Constitution", "ST Intelligence", "ST Wisdom", "ST Charisma"];
  var SAVE_CB = ["Check Box 11", "Check Box 18", "Check Box 19", "Check Box 20", "Check Box 21", "Check Box 22"];
  var ABS = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  var WPN = [["Wpn Name", "Wpn1 AtkBonus", "Wpn1 Damage"], ["Wpn Name 2", "Wpn2 AtkBonus ", "Wpn2 Damage "],
             ["Wpn Name 3", "Wpn3 AtkBonus  ", "Wpn3 Damage "]];
  var DEATH_OK = ["Check Box 12", "Check Box 13", "Check Box 14"], DEATH_FAIL = ["Check Box 15", "Check Box 16", "Check Box 17"];

  PDFX.prototype.page1 = function (D) {
    var self = this;
    this.one("CharacterName", D.name, "Bold", 18, "left", 7);
    [["ClassLevel", D.classLevel], ["Background", D.background], ["PlayerName", D.slot3], ["Race ", D.species],
     ["Alignment", D.alignment], ["XP", D.xp]].forEach(function (a) { self.one(a[0], a[1], "SemiBold", 10.5, "left", 2, 0.42); });
    ABS.forEach(function (ab) {
      var a = D.abilities[ab] || ["", ""];
      self.one(ab, String(a[0]), "Bold", 20, "center");
      self.one({ DEX: "DEXmod ", CHA: "CHamod" }[ab] || ab + "mod", a[1], "SemiBold", 10, "center", 0);
    });
    this.one("ProfBonus", D.prof, "Bold", 12.5, "center", 0);
    this.one("Inspiration", D.inspiration, "Bold", 12.5, "center", 0);
    this.one("AC", D.ac, "Bold", 19, "center", 0, 0.55);
    this.one("Initiative", D.initiative, "Bold", 19, "center", 0, 0.55);
    var sp = String(D.speed || "").match(/^(\d+)\s*(.*)$/);
    if (sp) this.unit("Speed", sp[1], sp[2] || "ft", 18); else this.one("Speed", D.speed, "Bold", 12, "center", 0);
    this.one("HPMax", D.hpMax, "SemiBold", 10, "left", 2, 0.45);
    this.one("HPCurrent", D.hpCurrent, "Bold", 24, "center");
    this.one("HPTemp", D.hpTemp, "Bold", 20, "center");
    this.one("HDTotal", D.hitDiceTotal, "SemiBold", 8.5, "left", 2, 0.45);
    this.one("HD", D.hitDice, "Bold", 14, "center");
    this.one("Passive", D.passive, "Bold", 12.5, "center", 0);
    (D.deathSaves || [0, 0]).forEach(function (n, k) {
      for (var i = 0; i < Math.min(3, n); i++) self.dot((k ? DEATH_FAIL : DEATH_OK)[i]);
    });
    SAVES.forEach(function (f, i) {
      var s = (D.saves || [])[i] || {};
      self.one(f, s.v, s.prof ? "Bold" : "Regular", 7.6, "center", 0);
      if (s.prof) self.dot(SAVE_CB[i]);
    });
    SKILLS.forEach(function (f, i) {
      var s = (D.skills || {})[SKILL_NAMES[i]] || {};
      self.one(f, s.v, s.prof ? "Bold" : "Regular", 7.6, "center", 0);
      if (s.prof) self.dot("Check Box " + (23 + i));
    });
    (D.weapons || []).slice(0, 3).forEach(function (w, i) {
      self.one(WPN[i][0], w[0], "SemiBold", 8.6);
      self.one(WPN[i][1], w[1], "Bold", 9.5, "center", 0);
      self.one(WPN[i][2], w[2], "Regular", 8);
    });
    var extra = (D.weapons || []).slice(3).map(function (w) { return "**" + w[0] + "** " + w[1] + ", " + w[2]; });
    this.box("AttacksSpellcasting", extra.concat(D.attackNotes || []), 7.6);
    ["CP", "SP", "EP", "GP", "PP"].forEach(function (c) { self.one(c, (D.coins || {})[c], "Bold", 10.5, "center", 0); });
    var b = D.boxes || {};
    this.box("PersonalityTraits ", b.topA, 7.5); this.box("Ideals", b.topB, 7.5);
    this.box("Bonds", b.topC, 7.5); this.box("Flaws", b.topD, 7.5);
    this.box("ProficienciesLang", D.proficiencies, 7.8);
    this.box("Equipment", D.equipment, 7.8);
    this.box("Features and Traits", D.features, 7.8);
  };

  PDFX.prototype.page2 = function (D) {
    var self = this;
    this.one("CharacterName 2", D.name, "Bold", 18, "left", 7);
    ["Age", "Height", "Weight", "Eyes", "Skin", "Hair"].forEach(function (f) {
      self.one(f, (D.looks || {})[f.toLowerCase()], "SemiBold", 10.5, "left", 2, 0.42);
    });
    this.one("FactionName", D.factionName, "Bold", 10, "center");
    this.box("Allies", D.allies, 7.8);
    this.box("Backstory", D.backstory, 7.8);
    this.box("Feat+Traits", D.moreFeatures, 7.8);
    this.box("Treasure", D.treasure, 7.8);
  };

  PDFX.prototype.page3 = function (D) {
    var S = D.spellcasting; if (!S) return;
    var self = this, SM = this.smap;
    this.one("Spellcasting Class 2", S.className, "Bold", 14, "center");
    this.one("SpellcastingAbility 2", S.ability, "Bold", 15, "center", 0);
    this.one("SpellSaveDC  2", S.dc, "Bold", 17, "center", 0);
    this.one("SpellAtkBonus 2", S.attack, "Bold", 17, "center", 0);
    Object.keys(S.slots || {}).forEach(function (lvl) {
      var sl = S.slots[lvl]; if (!SM.slots[lvl]) return;
      self.one(SM.slots[lvl][0], String(sl.total != null ? sl.total : sl), "Bold", 12, "center", 0);
      if (sl.used) self.one(SM.slots[lvl][1], String(sl.used), "Bold", 12, "center", 0);
    });
    var over = [];
    (S.levels || []).forEach(function (L) {
      var rows = SM[String(L.level)] || [];
      var many = L.spells.length > rows.length;
      L.spells.forEach(function (sp, i) {
        if (i >= rows.length) { over.push(sp.name); return; }
        if (many && i === rows.length - 1) {
          var rr = self.rect(rows[i][0]);
          self.put(rr.p, rr.x0 + 2, rr.y0 + 2.4, "+" + (L.spells.length - i) + " more, see Spell Descriptions", "Italic", 7.6, GRAY);
          over.push(sp.name); return;
        }
        var fld = rows[i][0], cb = rows[i][1], r = self.rect(fld), y = r.y0 + 2.4;
        var maxW = r.x1 - r.x0 - 4, s = 8.6, tagW = sp.tag ? self.w("  " + sp.tag, "Regular", 6.6) : 0;
        while (self.w(sp.name, "Medium", s) + tagW > maxW && s > 6) s -= 0.2;
        self.put(r.p, r.x0 + 2, y, sp.name, "Medium", s, INK);
        if (sp.tag && self.w(sp.name, "Medium", s) + tagW <= maxW)
          self.put(r.p, r.x0 + 2 + self.w(sp.name + "  ", "Medium", s), y, sp.tag, "Regular", 6.6, GRAY);
        if (sp.prepared && cb) self.dot(cb);
      });
    });
    if (over.length) this.overflow.push("spells:" + over.join(", "));
  };

  // ---------- halaman lampiran: dua kolom ----------
  function Flow(x, D, sub) {
    this.x = x; this.D = D; this.sub = sub; this.M = 36; this.G = 18;
    this.CW = (W - 2 * this.M - this.G) / 2; this.TOP = H - 70; this.BOT = 44;
    this.n = 0; this.page = null; this.col = 0; this.y = this.TOP; this.head = null; this.pending = null;
  }
  Flow.prototype.x0 = function () { return this.M + this.col * (this.CW + this.G); };
  Flow.prototype.newPage = function (title, strip) {
    if (this.page) this.close();
    if (title) this.title = title;
    if (strip != null) this.strip = strip;
    this.page = this.x.doc.addPage([W, H]); this.n++; this.col = 0; this.y = this.TOP;
    this.titles = [this.title]; this.strips = [this.strip || ""];
  };
  Flow.prototype.close = function () {
    var x = this.x, p = this.page, M = this.M, L = x.L;
    var t = this.titles.join("  •  ");
    var right = this.D.name + "  •  " + this.sub;
    var room = W - 2 * M - Math.max(x.w(right, "Medium", 8.5), x.w(this.strips[0], "Regular", 7.6)) - 14, fs = 17;
    while (x.w(t, "Bold", fs) > room && fs > 9) fs -= 0.5;
    x.put(p, M, H - 52, t, "Bold", fs, ACC);
    x.put(p, W - M - x.w(right, "Medium", 8.5), H - 45, right, "Medium", 8.5, GRAY);
    x.put(p, W - M - x.w(this.strips[0], "Regular", 7.6), H - 56, this.strips[0], "Regular", 7.6, GRAY);
    p.drawLine({ start: { x: M, y: H - 64 }, end: { x: W - M, y: H - 64 }, thickness: 1.1, color: L.rgb(ACC[0], ACC[1], ACC[2]) });
    var mid = M + this.CW + this.G / 2;
    p.drawLine({ start: { x: mid, y: this.BOT + 6 }, end: { x: mid, y: this.TOP + 8 }, thickness: 0.5, color: L.rgb(LIGHT[0], LIGHT[1], LIGHT[2]) });
    var foot = this.D.name + "  •  " + this.titles.map(function (s) { return s.charAt(0) + s.slice(1).toLowerCase(); }).join(" & ") + "  •  Page " + (this.x.base + this.n);
    x.put(p, (W - x.w(foot, "Regular", 6.5)) / 2, 26, foot, "Regular", 6.5, GRAY);
    this.page = null;
  };
  Flow.prototype.part = function (title, strip) {
    this.head = null; this.pending = null;
    if (!this.page) { this.newPage(title, strip); return; }
    if (this.col === 0) { this.col = 1; this.y = this.TOP; }
    else if (this.y - this.BOT < 260) { this.newPage(title, strip); return; }
    this.titles.push(title); this.title = title;
    this.y -= 4;
    this.x.put(this.page, this.x0(), this.y - 13, title, "Bold", 13, ACC); this.y -= 19;
    this.x.put(this.page, this.x0(), this.y - 8, strip, "Regular", 7, GRAY); this.y -= 12;
  };
  Flow.prototype.heading = function (text) {
    var L = this.x.L;
    this.y -= 14;
    this.x.put(this.page, this.x0(), this.y, text, "Bold", 8.4, ACC);
    this.page.drawLine({ start: { x: this.x0(), y: this.y - 3.5 }, end: { x: this.x0() + this.CW, y: this.y - 3.5 },
                         thickness: 0.7, color: L.rgb(ACC[0], ACC[1], ACC[2]) });
    this.y -= 8;
  };
  Flow.prototype.next = function () {
    if (this.col === 0) { this.col = 1; this.y = this.TOP; } else this.newPage();
    if (this.head) this.heading(this.head + "  (CONTINUED)");
  };
  Flow.prototype.section = function (head, label) { this.head = null; this.pending = [head, label || head]; };
  Flow.prototype.block = function (lines, gap) {
    gap = gap == null ? 9 : gap;
    var h = lines.reduce(function (a, l) { return a + l[0]; }, 0) + gap, extra = this.pending ? 22 : 0;
    var colH = this.TOP - this.BOT - 30;
    if (this.y - h - extra < this.BOT && h <= colH) this.next();
    if (this.pending) {
      if (this.y - 22 - 40 < this.BOT) this.next();
      this.heading(this.pending[0]); this.head = this.pending[1]; this.pending = null;
    }
    var self = this;
    // blok lebih tinggi dari satu kolom: pecah per baris
    lines.forEach(function (l) {
      if (self.y - l[0] < self.BOT) self.next();
      self.y = self.x.drawLines(self.page, [l], self.x0(), self.y);
    });
    this.y -= gap;
  };

  PDFX.prototype.titleLines = function (name, tag) {
    var segs = [[0, name, "Bold", 10.5, INK]];
    if (tag) segs.push([this.w(name + "   ", "Bold", 10.5), String(tag).toUpperCase(), "SemiBold", 6.4, ACC]);
    return [[13.5, segs]];
  };
  // blok "IN SHORT": latar tipis dengan garis aksen di kiri
  PDFX.prototype.summaryLines = function (text, CW) {
    if (!text) return [];
    var bg = { rect: true, bar: true, x: 0, w: CW, c: TINT };
    var ls = this.wrapRuns(runs("^^IN" + NB + "SHORT^^ " + text, 7.9, "Medium"), CW - 12, 10.4);
    var out = [[3, [bg]]];
    ls.forEach(function (l) { out.push([l[0], [bg].concat(l[1].map(function (g) { return [g[0] + 7, g[1], g[2], g[3], g[4]]; }))]); });
    out.push([3, [bg]]);
    return out;
  };
  PDFX.prototype.spellBlock = function (sp, CW) {
    var out = this.titleLines(sp.name, sp.tag);
    if (sp.line) out.push([10, [[0, sp.line, "Italic", 7.6, GRAY]]]);
    out.push([2.5, []]);
    if (sp.summary) { out = out.concat(this.summaryLines(sp.summary, CW)); if ((sp.text || []).length) out.push([4, []]); }
    out = out.concat(this.layout(sp.text || [], CW, 7.7));
    if (sp.details && sp.details.length) {
      out.push([3.5, []]);
      var dp = sp.details.filter(function (d) { return d[1]; }).map(function (d) {
        return "^^" + d[0].toUpperCase().split(" ").join(NB) + "^^" + NB + String(d[1]).split(" ").join(NB);
      }).join("   •   ");
      out = out.concat(this.wrapRuns(runs(dp, 7.3, "Medium"), CW, 10.2));
    }
    return out;
  };
  PDFX.prototype.featureBlock = function (f, CW) {
    var out = this.titleLines(f.name, f.tag).concat([[1.5, []]]);
    if (f.summary) { out = out.concat(this.summaryLines(f.summary, CW)); if ((f.text || []).length) out.push([4, []]); }
    return out.concat(this.layout(f.text || [], CW, 7.7));
  };
  // kartu stat block creature
  PDFX.prototype.creatureBlock = function (c, CW) {
    var self = this, out = [];
    out.push([3, [{ rule: true, x: 0, w: CW, t: 1.6, c: ACC }]]);
    out = out.concat(this.titleLines(c.name, c.tag));
    if (c.meta) out.push([10, [[0, c.meta, "Italic", 7.6, GRAY]]]);
    if (c.summary) { out.push([3, []]); out = out.concat(this.summaryLines(c.summary, CW)); out.push([2, []]); }
    out.push([5, [{ rule: true, x: 0, w: CW, t: 0.6, c: ACC }]]);
    (c.stats || []).forEach(function (s) { out = out.concat(self.wrapRuns(runs("**" + s[0] + "** " + s[1], 7.8), CW, 10.4)); });
    if (c.abilities) {
      out.push([5, [{ rule: true, x: 0, w: CW, t: 0.6, c: ACC }]]);
      var cw = CW / 6, head = [], val = [];
      ABS.forEach(function (ab, i) {
        var a = c.abilities[ab] || ["", ""], cx = i * cw + cw / 2;
        head.push([cx - self.w(ab, "Bold", 7) / 2, ab, "Bold", 7, ACC]);
        var t = a[0] + " (" + a[1] + ")";
        val.push([cx - self.w(t, "Medium", 8) / 2, t, "Medium", 8, INK]);
      });
      out.push([10, head], [11, val]);
      out.push([5, [{ rule: true, x: 0, w: CW, t: 0.6, c: ACC }]]);
    }
    (c.lines || []).forEach(function (s) { out = out.concat(self.wrapRuns(runs("**" + s[0] + "** " + s[1], 7.6), CW, 10)); });
    (c.sections || []).forEach(function (sec) {
      out.push([4, []]);
      out.push([12, [[0, sec[0].toUpperCase(), "Bold", 8.2, ACC]]]);
      out.push([4, [{ rule: true, x: 0, w: CW, t: 0.4, c: ACC }]]);
      sec[1].forEach(function (e) {
        out = out.concat(self.wrapRuns(runs("**" + e[0] + ".** " + e[1], 7.7), CW, 9.6));
        out.push([2.5, []]);
      });
    });
    out.push([3, [{ rule: true, x: 0, w: CW, t: 1.6, c: ACC }]]);
    return out;
  };

  PDFX.prototype.appendix = function (D) {
    var self = this, sub = D.classLevel + " (" + D.edition + " rules)";
    var F = new Flow(this, D, sub), S = D.spellcasting;
    if (S && (S.levels || []).some(function (l) { return l.spells.length; })) {
      F.part("SPELL DESCRIPTIONS", "Spellcasting " + S.ability + "   •   Spell Save DC " + S.dc + "   •   Spell Attack " + S.attack);
      S.levels.forEach(function (L) {
        if (!L.spells.length) return;
        var head = L.level === 0 ? "CANTRIPS" : "LEVEL " + L.level + (L.slots != null ? "   •   " + L.slots + " SLOTS" : "");
        F.section(head, head.split("   ")[0]);
        L.spells.forEach(function (sp) { F.block(self.spellBlock(sp, F.CW)); });
      });
    }
    if ((D.appendix || []).length) {
      F.part("FEATURES & TRAITS", "Full rules text for every feature, trait, feat and item on this sheet");
      D.appendix.forEach(function (g) {
        F.section(g[0].toUpperCase());
        g[1].forEach(function (f) { F.block(self.featureBlock(f, F.CW), 8); });
      });
    }
    if ((D.creatures || []).length) {
      F.part("COMPANIONS & SUMMONS", "Stat blocks calculated for this character");
      F.section("CREATURES");
      D.creatures.forEach(function (c) { F.block(self.creatureBlock(c, F.CW), 12); });
    }
    if (F.page) F.close();
  };

  // ---------- utama ----------
  PDFX.prototype.render = async function (D, assets, opts) {
    opts = opts || {};
    var L = this.L, ed = D.edition === "2014" ? "2014" : "2024";
    this.doc = await L.PDFDocument.load(assets.tpl[ed]);
    this.doc.registerFontkit(this.fk);
    this.F = {};
    for (var k of ["Regular", "Medium", "SemiBold", "Bold", "Italic"])
      this.F[k] = await this.doc.embedFont(assets.fonts[k], { subset: false });
    this.map = assets.map[ed]; this.smap = assets.map.spells; this.overflow = [];
    // buang semua field form: hasil akhir digambar langsung
    var form = this.doc.getForm();
    form.getFields().forEach(function (f) { try { form.removeField(f); } catch (e) {} });
    this.pages = this.doc.getPages();
    this.page1(D); this.page2(D); this.page3(D);
    // karakter tanpa spell: halaman spell kosong dibuang
    var hasSpells = D.spellcasting && (D.spellcasting.levels || []).some(function (l) { return l.spells.length; });
    if (!hasSpells) this.doc.removePage(2);
    this.base = this.doc.getPageCount();
    this.appendix(D);
    this.doc.setTitle(D.name + " - " + D.classLevel + " (" + ed + ")");
    this.doc.setCreator("Character Sheet Builder");
    var bytes = await this.doc.save({ useObjectStreams: true });
    return { bytes: bytes, overflow: this.overflow, pages: this.doc.getPageCount() };
  };

  var api = {
    version: "1.0.0",
    render: function (model, assets, opts) {
      opts = opts || {};
      var lib = opts.PDFLib || root.PDFLib, fk = opts.fontkit || root.fontkit;
      if (!lib || !fk) return Promise.reject(new Error("PDFX: PDFLib atau fontkit belum dimuat"));
      return new PDFX(lib, fk).render(model, assets, opts);
    }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.PDFX = api;
})(typeof self !== "undefined" ? self : this);
