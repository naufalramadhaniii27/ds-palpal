/* PDFX appendix parts, in order. Each part says when it shows and how it fills the flow; a new part is one more pxAddPart */
import {PX_BLOCKS} from "./09-ui-blocks.js";
export const PX_PARTS = [];
export function pxAddPart(p){ PX_PARTS.push(p); }
pxAddPart({id:"continued", when:(M,ctx) =>{ return ctx.cont.length>0; }, title:"CONTINUED FROM THE SHEET", strip:() =>{ return "What did not fit in the boxes on the first pages"; },
  fill:(F,M,ctx) =>{ ctx.cont.forEach((c) =>{ F.section(c[0].toUpperCase()); F.block(PX_BLOCKS.text(F.T,{text:c[1]},F.CW),8); }); }});
pxAddPart({id:"spells", when:(M) =>{ return !!M.spellcasting&&(M.spellcasting.levels||[]).some((l) =>{ return l.spells.length; }); }, title:"SPELL DESCRIPTIONS",
  strip:(M) =>{ const S = M.spellcasting; return "Spellcasting "+S.ability+"   •   Spell Save DC "+S.dc+"   •   Spell Attack "+S.attack; },
  fill:(F,M) =>{ M.spellcasting.levels.forEach((L) =>{ if(!L.spells.length) return;
    const head = L.level===0 ? "CANTRIPS" : "LEVEL "+L.level+(L.slots!=null?"   •   "+L.slots+" SLOTS":"");
    F.section(head, head.split("   ")[0]); L.spells.forEach((sp) =>{ F.block(PX_BLOCKS.spell(F.T,sp,F.CW)); }); }); }});
pxAddPart({id:"features", when:(M) =>{ return (M.appendix||[]).length>0; }, title:"FEATURES & TRAITS", strip:() =>{ return "Short and full rules text for every feature, trait, feat and item on this sheet"; },
  fill:(F,M) =>{ M.appendix.forEach((g) =>{ F.section(g[0].toUpperCase()); g[1].forEach((f) =>{ F.block(PX_BLOCKS.feature(F.T,f,F.CW),8); }); }); }});
pxAddPart({id:"creatures", when:(M) =>{ return (M.creatures||[]).length>0; }, title:"COMPANIONS & SUMMONS", strip:() =>{ return "Stat blocks calculated for this character"; },
  fill:(F,M) =>{ F.section("CREATURES"); M.creatures.forEach((c) =>{ F.block(PX_BLOCKS.creature(F.T,c,F.CW),12); }); }});
