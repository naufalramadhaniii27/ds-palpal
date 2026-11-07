/* Fill the supplied AcroForm. No screenshots, remote services, or character uploads. */
const ASSETS = "vendor/pdf/";
let assetsPromise;
function script(src, globalName) {
  if (window[globalName]) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const el = document.createElement("script"); el.src = ASSETS + src;
    el.onload = resolve; el.onerror = () => { el.remove(); reject(new Error("Cannot load PDF library")); };
    document.head.appendChild(el);
  });
}
async function asset(name, json = false) {
  const response = await fetch(ASSETS + name);
  if (!response.ok) throw new Error("Cannot load PDF template asset: " + name);
  return json ? response.json() : response.arrayBuffer();
}
function assets() {
  if (!assetsPromise) assetsPromise = Promise.all([
    script("pdf-lib-1.17.1.min.js", "PDFLib"), script("fontkit-1.1.1.min.js", "fontkit"),
    asset("5e-character-sheet-fillable.pdf"), asset("5e-character-sheet-fields.json", true), asset("archivo-narrow.ttf")
  ]).catch(error => { assetsPromise = null; throw error; });
  return assetsPromise;
}
const signed = n => (Number(n) >= 0 ? "+" : "") + Number(n || 0);
const join = rows => rows.filter(Boolean).join("\n");
export function templateValues(model, layout) {
  const {c, s, d} = model, notes = s.notes || {}, values = {}, checks = {}, extra = [];
  const put = (key, value) => { values[key] = String(value == null ? "" : value); };
  const section = (title, text) => { if (text) extra.push({title, text: String(text)}); };
  put("CharacterName", c.name); put("CharacterName 2", c.name); put("ClassLevel", model.classLabel);
  put("Race ", c.species); put("Background", c.bg); put("Alignment", s.align);
  put("PlayerName", c.playerName || s.playerName); put("XP", c.xp == null ? s.xp : c.xp);
  put("Inspiration", s.insp ? "Yes" : ""); put("ProfBonus", signed(d.pb)); put("AC", d.ac);
  put("Initiative", signed(d.init)); put("Speed", d.speed + " ft"); put("HPMax", d.hpmax);
  put("HPCurrent", s.hp == null ? d.hpmax : s.hp); put("HPTemp", s.tmp || "");
  const abilities = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
  const names = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
  const modFields = ["STRmod", "DEXmod ", "CONmod", "INTmod", "WISmod", "CHamod"];
  abilities.forEach((ab, i) => {
    put(ab, d.score[ab]); put(modFields[i], signed(d.mod[ab])); put("ST " + names[i], signed(d.save[ab]));
    checks["Check Box " + (i ? 17 + i : 11)] = !!(c.saves || {})[ab];
  });
  const skills = ["Acrobatics", "Animal", "Arcana", "Athletics", "Deception ", "History ", "Insight", "Intimidation", "Investigation ", "Medicine", "Nature", "Perception ", "Performance", "Persuasion", "Religion", "SleightofHand", "Stealth ", "Survival"];
  const skillNames = ["Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation", "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival"];
  skillNames.forEach((name, i) => {
    const ix = (c.skills || []).findIndex(x => x.n === name), skill = (c.skills || [])[ix];
    if (ix >= 0) put(skills[i], signed(d.skill[ix]));
    checks["Check Box " + (23 + i)] = !!(skill && skill.p);
    if (skill && Number(skill.p) > 1) section("Expertise", name);
  });
  for (let i = 0; i < 3; i++) {
    checks["Check Box " + (12 + i)] = i < ((s.ds || [])[0] || 0);
    checks["Check Box " + (15 + i)] = i < ((s.ds || [])[1] || 0);
  }
  const hd = (d.res || []).filter(r => r.auto === "level" || r.k === "hd" || /^hd[-:]/.test(r.k));
  put("HDTotal", hd.length ? hd.map(r => r.max + "d" + (r.die || c.hitDie)).join(" + ") : d.level + "d" + c.hitDie);
  put("HD", hd.length ? hd.map(r => Math.max(0, r.max - ((s.used || {})[r.k] || 0)) + "d" + (r.die || c.hitDie)).join(" + ") : "");
  put("Passive", d.pas_per);
  put("PersonalityTraits ", notes.personality); put("Ideals", notes.ideal); put("Bonds", notes.bond); put("Flaws", notes.flaw);
  put("Backstory", notes.backstory); put("Allies", notes.allies); put("Treasure", notes.treasure);
  put("Feat+Traits", notes.appearance); put("FactionName", notes.faction);
  ["Age", "Height", "Weight", "Eyes", "Skin", "Hair"].forEach(key => put(key, notes["ch_" + key.toLowerCase()] || notes[key.toLowerCase()] || c[key.toLowerCase()]));
  put("ProficienciesLang", model.proficiencies);
  const attacks = model.attacks || [];
  attacks.slice(0, 3).forEach((a, i) => {
    put(["Wpn Name", "Wpn Name 2", "Wpn Name 3"][i], a.name);
    put(["Wpn1 AtkBonus", "Wpn2 AtkBonus ", "Wpn3 AtkBonus  "][i], signed(a.hit));
    put(["Wpn1 Damage", "Wpn2 Damage ", "Wpn3 Damage "][i], a.damage);
  });
  put("AttacksSpellcasting", join(attacks.map(a => a.name + ": " + [a.range, a.note].filter(Boolean).join("; "))));
  if (attacks.length > 3) section("Additional attacks", join(attacks.slice(3).map(a => a.name + " | " + signed(a.hit) + " | " + a.damage + " | " + (a.range || ""))));
  put("Equipment", model.equipment); put("Features and Traits", model.features);
  Object.entries(model.coins || {}).forEach(([key, value]) => put(key.toUpperCase(), value));
  section("Session notes", notes.session); section("Resources and conditions", model.resources);
  section("Additional character details", model.details);
  const sc = model.spellcasting || {};
  put("Spellcasting Class 2", sc.label); put("SpellcastingAbility 2", sc.ability);
  put("SpellSaveDC  2", sc.dc); put("SpellAtkBonus 2", sc.attack);
  const slots = layout.filter(x => /^SlotsTotal /.test(x.name));
  slots.sort((a, b) => a.rect[0] - b.rect[0] || b.rect[1] - a.rect[1]);
  const spellRows = Array.from({length: 10}, () => []);
  layout.filter(x => /^Spells /.test(x.name)).forEach(row => {
    let level = 0;
    slots.forEach((slot, i) => {
      if (Math.abs(row.rect[0] - slot.rect[0]) < 30 && row.rect[1] < slot.rect[1]) level = i + 1;
    });
    spellRows[level].push(row);
  });
  spellRows.forEach(rows => rows.sort((a, b) => b.rect[1] - a.rect[1]));
  slots.forEach((slot, i) => {
    const resource = (d.res || []).find(r => r.k === "s" + (i + 1));
    put(slot.name, resource ? resource.max : ((c.spellcasting || {}).slots || [])[i] || "");
    // The template's field is named Remaining but the printed label is SLOTS EXPENDED.
    put(slot.name.replace("Total", "Remaining"), resource ? Math.min(resource.max, (s.used || {})[resource.k] || 0) : "");
  });
  spellRows.forEach((rows, level) => {
    const spells = (model.spells || []).filter(x => Number(x.level || 0) === level);
    spells.forEach((spell, i) => {
      if (rows[i]) {
        put(rows[i].name, spell.name);
        const rect = rows[i].rect;
        const check = layout.find(x => x.page === 2 && x.type === "/Btn" && Math.abs(x.rect[1] - rect[1]) < 6 && x.rect[0] < rect[0] && rect[0] - x.rect[0] < 20);
        if (check) checks[check.name] = spell.prepared !== false;
      } else section("Additional level " + level + " spells", spell.name);
    });
  });
  section("Spell details", join((model.spells || []).map(x => x.details)));
  return {values, checks, extra};
}

/* Split by glyphs as well as words: long URLs and unbroken notes cannot escape a field. */
export function wrapText(text, font, size, width) {
  const lines = [];
  for (const paragraph of String(text).replace(/\r\n?/g, "\n").split("\n")) {
    let line = "";
    for (const word of paragraph.split(/(\s+)/)) {
      if (font.widthOfTextAtSize(line + word, size) <= width) { line += word; continue; }
      if (line.trim()) { lines.push(line.trimEnd()); line = ""; }
      for (const char of word.trimStart()) {
        if (line && font.widthOfTextAtSize(line + char, size) > width) { lines.push(line); line = ""; }
        line += char;
      }
    }
    lines.push(line.trimEnd());
  }
  return lines;
}

export async function fillTemplate(PDFLib, fontkit, template, layout, fontBytes, model) {
  const pdf = await PDFLib.PDFDocument.load(template);
  pdf.registerFontkit(fontkit);
  const font = await pdf.embedFont(fontBytes, {subset: false});
  const form = pdf.getForm(), {values, checks, extra} = templateValues(model, layout);
  // Remove the template's Acrobat import-image JavaScript actions. Keep fields editable.
  for (const page of pdf.getPages()) {
    const annots = page.node.Annots();
    if (annots) for (let i = 0; i < annots.size(); i++) {
      const obj = pdf.context.lookup(annots.get(i)); obj.delete(PDFLib.PDFName.of("A")); obj.delete(PDFLib.PDFName.of("AA"));
    }
  }
  pdf.catalog.delete(PDFLib.PDFName.of("OpenAction"));
  for (const field of form.getFields()) {
    field.acroField.dict.delete(PDFLib.PDFName.of("AA"));
    if (field instanceof PDFLib.PDFCheckBox) {
      checks[field.getName()] ? field.check() : field.uncheck();
      // The printed form already has circles; widget backgrounds/borders would cover them.
      const on = field.acroField.getOnValue().decodeText();
      for (const widget of field.acroField.getWidgets()) {
        const {width:w,height:h} = widget.getRectangle(), cx=w/2, cy=h/2, r=Math.min(w,h)*.28, k=r*.55228475;
        const ink=`q 0 g ${cx+r} ${cy} m ${cx+r} ${cy+k} ${cx+k} ${cy+r} ${cx} ${cy+r} c ${cx-k} ${cy+r} ${cx-r} ${cy+k} ${cx-r} ${cy} c ${cx-r} ${cy-k} ${cx-k} ${cy-r} ${cx} ${cy-r} c ${cx+k} ${cy-r} ${cx+r} ${cy-k} ${cx+r} ${cy} c f Q`;
        const appearance = content => pdf.context.register(pdf.context.flateStream(content,{Type:"XObject",Subtype:"Form",BBox:[0,0,w,h],Resources:{}}));
        widget.dict.set(PDFLib.PDFName.of("AP"),pdf.context.obj({N:{[on]:appearance(ink),Off:appearance("")}}));
      }
      form.markFieldAsClean(field.ref);
      continue;
    }
    if (!(field instanceof PDFLib.PDFTextField)) continue;
    const name = field.getName(), text = values[name] || "", spec = layout.find(x => x.name === name);
    const width = spec.rect[2] - spec.rect[0] - 5, height = spec.rect[3] - spec.rect[1] - 4;
    const multi = height > 32 && !/^(HPCurrent|HPTemp|STR|DEX|CON|INT|WIS|CHA|AC|Speed|Initiative|HD)$/.test(name);
    let size = multi ? 9 : Math.min(11, Math.max(8, height / 1.2)), lines = wrapText(text, font, size, width);
    if (multi) field.enableMultiline(); else field.disableMultiline();
    while (size > 7 && (multi ? lines.length * font.heightAtSize(size) * 1.2 > height : lines.length > 1)) {
      size -= .5; lines = wrapText(text, font, size, width);
    }
    const capacity = multi ? Math.max(1, Math.floor(height / (font.heightAtSize(size) * 1.2))) : 1;
    let visible = lines.slice(0, capacity).join(multi ? "\n" : " ");
    if (lines.length > capacity) {
      extra.push({title: name.trim() + " (continued)", text: lines.slice(capacity).join("\n")});
      // Reserve a complete line for a continuation marker, never hide overflow in a scrolling box.
      if (multi && capacity > 1) {
        extra[extra.length - 1].text = lines.slice(capacity - 1).join("\n");
        visible = lines.slice(0, capacity - 1).concat("(continued on additional pages)").join("\n");
      }
    }
    field.removeMaxLength();
    if (!field.acroField.getDefaultAppearance()) field.acroField.setDefaultAppearance("0 g /Helv 10 Tf");
    field.setFontSize(size); field.setText(visible); field.disableScrolling();
  }
  if (model.portrait) {
    try {
      const image = await pdf.embedPng(model.portrait);
      const spec = layout.find(x => x.name === "CHARACTER IMAGE"), r = spec.rect;
      const scale = Math.min((r[2] - r[0]) / image.width, (r[3] - r[1]) / image.height);
      pdf.getPages()[spec.page].drawImage(image, {x:r[0] + (r[2]-r[0]-image.width*scale)/2, y:r[1] + (r[3]-r[1]-image.height*scale)/2, width:image.width*scale, height:image.height*scale});
    } catch (error) { extra.push({title:"Portrait", text:"Portrait could not be embedded."}); }
  }
  let page, y, index = 0;
  function newPage() {
    page = pdf.addPage([612, 792]); y = 718;
    page.drawText("Character sheet - continued", {x:36,y:755,size:16,font});
    page.drawText(String(model.c.name || "Character"), {x:36,y:737,size:10,font});
  }
  for (const entry of extra) {
    let lines = wrapText(entry.title + "\n" + entry.text, font, 10, 530);
    while (lines.length) {
      if (!page || y < 85) newPage();
      const leading = font.heightAtSize(10) * 1.2;
      const count = Math.min(lines.length, Math.max(1, Math.floor((y - 66) / leading)));
      const chunk = lines.splice(0, count), h = chunk.length * leading + 12;
      const field = form.createTextField("Continuation " + (++index)); field.enableMultiline();
      field.setText(chunk.join("\n"));
      field.addToPage(page, {x:36,y:y-h,width:540,height:h,borderWidth:0,font});
      field.setFontSize(10);
      y -= h + 12;
    }
  }
  const pages = pdf.getPages();
  pages.slice(3).forEach((p, i) => p.drawText("Page " + (i + 4) + " of " + pages.length, {x:490,y:25,size:9,font}));
  form.updateFieldAppearances(font);
  pdf.setTitle((model.c.name || "Character") + " - Character Sheet");
  return pdf.save();
}

export async function templatePdf(model) {
  const loaded = await assets();
  const bytes = await fillTemplate(window.PDFLib, window.fontkit, loaded[2], loaded[3], loaded[4], model);
  return new Blob([bytes], {type:"application/pdf"});
}
