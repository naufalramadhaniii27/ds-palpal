// Structural and content regression: run with node tests/pdf_template.mjs.
import fs from "node:fs";
process.on("uncaughtException", error => { console.error(error.message); process.exit(1); });
import path from "node:path";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require = createRequire(import.meta.url);
const PDFLib = require("../vendor/pdf/pdf-lib-1.17.1.min.js");
const fontkit = require("../vendor/pdf/fontkit-1.1.1.min.js");
const source = fs.readFileSync(new URL("../src/app/lib/pdf-template.js", import.meta.url), "utf8");
const {fillTemplate, templateValues} = await import("data:text/javascript;base64," + Buffer.from(source).toString("base64"));
const read = name => fs.readFileSync(new URL("../vendor/pdf/" + name, import.meta.url));
const layout = JSON.parse(read("5e-character-sheet-fields.json"));
const fixture = JSON.parse(fs.readFileSync(new URL("fixtures/yudhi-v3.json", import.meta.url)));
const c = fixture.C || fixture;
const ab = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
const model = {
  c: {...c, name:"Template Test - Élodie", saves:{STR:true}, skills:[{n:"Arcana",p:2}], spellcasting:{slots:[4,3]}},
  s:{hp:17,tmp:3,ds:[2,1],used:{s1:2},insp:true,notes:{session:"LAST_NOTE_SENTINEL\n".repeat(250)}},
  d:{pb:3,score:Object.fromEntries(ab.map(k=>[k,14])),mod:Object.fromEntries(ab.map(k=>[k,2])),save:Object.fromEntries(ab.map(k=>[k,5])),skill:[8],ac:17,init:2,speed:30,hpmax:35,level:5,pas_per:12,res:[{k:"s1",max:4}]},
  classLabel:"Wizard 5",coins:{gp:123},features:"Feature sentinel. ".repeat(700), equipment:"Rope\nStaff",proficiencies:"Common, Elvish",
  attacks:[{name:"Staff",hit:5,damage:"1d6+2 bludgeoning"}],
  spellcasting:{label:"Wizard",ability:"INT",dc:13,attack:"+5"},
  spells:Array.from({length:30},(_,i)=>({name:"Spell "+i,level:1,prepared:i%2===0})).concat({name:"Fire Bolt",level:0},{name:"Wish",level:9})
};
const mapped = templateValues(model,layout);
assert.equal(mapped.values.STR,"14"); assert.equal(mapped.values.STRmod,"+2");
assert.equal(mapped.values["SlotsRemaining 19"],"2");
assert.equal(mapped.values["Spells 1015"],"Spell 0");
assert.equal(mapped.values["Spells 1014"],"Fire Bolt");
assert.equal(mapped.values["Spells 10108"],"Wish");
assert.equal(mapped.checks["Check Box 11"],true);
assert.equal(mapped.checks["Check Box 25"],true);
assert.equal(mapped.checks["Check Box 12"],true);
assert.equal(mapped.checks["Check Box 14"],false);
const bytes = await fillTemplate(PDFLib,fontkit,read("5e-character-sheet-fillable.pdf"),layout,read("archivo-narrow.ttf"),model);
const out = path.resolve("tests/out/pdf-template"); fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,"template-filled.pdf"),bytes);
const loaded = await PDFLib.PDFDocument.load(bytes), form = loaded.getForm();
assert.equal(form.getTextField("CharacterName").getText(),model.c.name);
assert.equal(form.getTextField("HPCurrent").getText(),"17");
assert.equal(form.getTextField("GP").getText(),"123");
assert.equal(form.getTextField("SlotsRemaining 19").getText(),"2");
assert(form.getCheckBox("Check Box 11").isChecked());
assert(!form.getCheckBox("Check Box 14").isChecked());
assert(loaded.getPageCount()>3);
const text=form.getFields().filter(f=>f instanceof PDFLib.PDFTextField).map(f=>f.getText()||"").join("\n");
assert.equal((text.match(/LAST_NOTE_SENTINEL/g)||[]).length,250);
assert.equal((text.match(/\bFeature\b/g)||[]).length,700);
assert.equal((text.match(/\bsentinel\./g)||[]).length,700);
for(let i=0;i<30;i++) assert(text.includes("Spell "+i));
for(const f of form.getFields()) if(f instanceof PDFLib.PDFTextField) {
  for(const w of f.acroField.getWidgets()) assert(w.dict.get(PDFLib.PDFName.of("AP")),f.getName()+" has no appearance");
}
console.log("Template mapping, editable fields, checkboxes, spells, overflow and appearances: passed ("+loaded.getPageCount()+" pages)");
