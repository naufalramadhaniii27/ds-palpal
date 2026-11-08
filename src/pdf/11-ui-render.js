/* PDFX render: model + assets -> PDF bytes. Only wires the parts together; what is drawn lives in the painters and the appendix parts */
import {PX_FONTS} from "./01-data-style.js";
import {PxTypesetter} from "./03-logic-typeset.js";
import {PxCanvas} from "./04-ui-canvas.js";
import {PxFields} from "./06-ui-fields.js";
import {PX_PAINTERS} from "./07-ui-sheet-pages.js";
import {PxFlow} from "./08-ui-flow.js";
import {PX_PARTS} from "./10-ui-appendix.js";
async function pxOpenDoc(lib, fontkit, assets, ed){ const doc = await lib.PDFDocument.load(assets.tpl[ed]); doc.registerFontkit(fontkit);
  const fonts = {}; for(const k of PX_FONTS) fonts[k] = await doc.embedFont(assets.fonts[k], {subset:false});
  const form = doc.getForm(); form.getFields().forEach((f) =>{ try{ form.removeField(f); }catch(e){} });/* the sheet is drawn, the form fields go */
  return {doc:doc, fonts:fonts}; }
function pxHasSpells(M){ return !!M.spellcasting&&(M.spellcasting.levels||[]).some((l) =>{ return l.spells.length; }); }
/* solid:orchestrator renderPdf */
export async function renderPdf(M, assets, libs){
  const ed = M.edition==="2014" ? "2014" : "2024", o = await pxOpenDoc(libs.PDFLib, libs.fontkit, assets, ed);
  const cv = new PxCanvas(libs.PDFLib, o.fonts), T = new PxTypesetter((t,f,s) =>{ return o.fonts[f].widthOfTextAtSize(t,s); });
  const F = new PxFields(cv, T, assets.map[ed], o.doc.getPages());
  const ctx = {F:F, M:M, ed:ed, cont:[], over:[], smap:assets.map.spells, note:"Continued after the sheet (Continued from the Sheet)"};
  PX_PAINTERS.forEach((p) =>{ p.fn(ctx); });
  if(!pxHasSpells(M)) o.doc.removePage(2);
  const flow = new PxFlow(o.doc, cv, T, M, M.classLevel+" ("+ed+" rules)", o.doc.getPageCount());
  PX_PARTS.forEach((p) =>{ if(!p.when(M,ctx)) return; flow.part(p.title, p.strip(M)); p.fill(flow, M, ctx); });
  flow.finish();
  o.doc.setTitle(M.name+" - "+M.classLevel+" ("+ed+")"); o.doc.setCreator("Character Sheet Builder");
  const bytes = await o.doc.save({useObjectStreams:true});
  return {bytes:bytes, pages:o.doc.getPageCount(), overflow:ctx.cont.map((c) =>{ return c[0]; }).concat(ctx.over.map((l) =>{ return "spells:"+l; }))};
}
