/* PDFX appendix parts, in order. Each part says when it shows and how it fills the flow; a new part is one more pxAddPart */
import {PX_BLOCKS} from "./09-ui-blocks.js";
import {PX_INK,PX_GRAY} from "./01-data-style.js";
export const PX_PARTS = [];
export function pxAddPart(p){ PX_PARTS.push(p); }
/* Play Tracker: fields the player overwrites at the table with only the PDF in hand (conditions, exhaustion, uses left, attuned items, notes) */
function pxTrackRow(F, P, label, sub, name, value, h, opt){ opt = opt||{};
  if(F.y-h-(opt.above?20:6)<F.BOT) F.next();
  if(opt.above){ const x0 = F.x0(); F.cv.text(F.page, x0, F.y-9, label, "SemiBold", 8.2, PX_INK);
    if(sub) F.cv.text(F.page, x0+F.T.width(label+"  ","SemiBold",8.2), F.y-9, sub, "Regular", 6.6, PX_GRAY);
    F.y -= 13; opt = Object.assign({}, opt, {full:true}); }
  const x = F.x0(), y = F.y-h;
  if(opt.full){ P.addField(F.page, name, x, y, F.CW, h, value, opt); F.y = y-6; return; }
  const lw = opt.lw||(F.CW*0.72), room = lw-6;
  /* label and note shrink to stay clear of the box */
  let ls = 8.2, ss = 6.6; while(F.T.width(label,"SemiBold",ls)>room&&ls>6) ls -= 0.2; while(sub&&F.T.width(sub,"Regular",ss)>room&&ss>5) ss -= 0.2;
  F.cv.text(F.page, x, y+h/2+(sub?1.5:-2.8), label, "SemiBold", ls, PX_INK);
  if(sub) F.cv.text(F.page, x, y+h/2-7, sub, "Regular", ss, PX_GRAY);
  P.addField(F.page, name, x+lw, y, F.CW-lw, h, value, opt);
  F.y = y-6; }
pxAddPart({id:"tracker", when:(M,ctx) =>{ return !!M.tracker&&!!ctx.F.form; }, title:"PLAY TRACKER", strip:() =>{ return "Type over these boxes during the session"; },
  fill:(F,M,ctx) =>{ const P = ctx.F, T = M.tracker;
    F.section("CONDITIONS"); F.block([[0.1,[]]],0);
    pxTrackRow(F, P, "Conditions", "Blinded, Charmed, Prone, and the like", "Tracker Conditions", T.conditions, 18, {above:true, size:8.5});
    pxTrackRow(F, P, "Exhaustion level", "0 to 6", "Tracker Exhaustion", String(T.exhaustion||0), 18, {center:true, size:10});
    if(T.uses.length){ F.section("USES LEFT"); F.block([[0.1,[]]],0);
      T.uses.forEach((u,i) =>{ pxTrackRow(F, P, u.n, u.max+" "+(u.max===1&&u.unit==="uses"?"use":u.unit)+(u.back?", "+u.back:""), "Tracker Use "+(i+1), String(u.left), 20, {center:true, size:10}); }); }
    F.section("ATTUNED ITEMS"); F.block([[0.1,[]]],0);
    [0,1,2].forEach((i) =>{ pxTrackRow(F, P, "Item "+(i+1), "", "Tracker Attuned "+(i+1), T.attuned[i]||"", 16, {lw:F.CW*0.22, size:8.5}); });
    F.section("SESSION NOTES"); F.block([[0.1,[]]],0);
    pxTrackRow(F, P, "", "", "Tracker Notes", "", 150, {full:true, multi:true, size:8.5}); }});
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
