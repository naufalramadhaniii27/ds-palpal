/* PDFX sheet pages 1 to 3. Each painter fills one part of the template from the model. New parts are added with pxAddPainter,
   the render loop does not change (open for extension). ctx = {F: PxFields, M: model, ed: "2014"|"2024", cont: [], note} */
import {PX_ABS,PX_MOD_FIELD,PX_SKILLS,PX_SKILL_DOT,PX_SAVES,PX_SAVE_DOT,PX_DEATH_DOT,PX_WEAPON_ROWS,PX_COINS,PX_HEADER,PX_STATS,PX_LOOKS,PX_BOXES,PX_BOXES_P2,PX_SPELL_HEAD} from "./05-data-sheet-fields.js";
import {PX_GRAY,PX_INK} from "./01-data-style.js";
export const PX_PAINTERS = [];
export function pxAddPainter(id, fn){ PX_PAINTERS.push({id:id, fn:fn}); }
function pxGet(M, path){ return path.split(".").reduce((o,k) =>{ return o==null ? o : o[k]; }, M); }
/* a box; what does not fit goes to the continuation page under the box pxTitle */
function pxBoxTo(ctx, spec, pars){ const rest = ctx.F.box(spec[1], pars||pxGet(ctx.M,spec[0]), spec[2], ctx.note);
  if(rest.length) ctx.cont.push([ctx.ed==="2014" ? spec[4] : spec[3], rest]); }

pxAddPainter("header", (ctx) =>{ const F = ctx.F, M = ctx.M;
  F.one("CharacterName", M.name, "Bold", 18, "left", 7);
  PX_HEADER.forEach((h) =>{ F.one(h[1], M[h[0]], "SemiBold", 10.5, "left", 2, 0.42); }); });
pxAddPainter("abilities", (ctx) =>{ const F = ctx.F, A = ctx.M.abilities||{};
  PX_ABS.forEach((k) =>{ const a = A[k]||["",""]; F.one(k, String(a[0]), "Bold", 20, "center"); F.one(PX_MOD_FIELD[k], a[1], "SemiBold", 10, "center", 0); }); });
pxAddPainter("stats", (ctx) =>{ const F = ctx.F, M = ctx.M;
  PX_STATS.forEach((s) =>{ F.one(s[1], M[s[0]], s[2], s[3], s[4], s[5], s[6]); });
  const sp = /^(\d+)\s*(.*)$/.exec(String(M.speed||""));
  if(sp) F.unit("Speed", sp[1], sp[2]||"ft", 18); else F.one("Speed", M.speed, "Bold", 12, "center", 0);
  (M.deathSaves||[0,0]).forEach((n,k) =>{ for(let i = 0; i<Math.min(3,n); i++) F.dot(PX_DEATH_DOT[k][i]); }); });
pxAddPainter("saves-skills", (ctx) =>{ const F = ctx.F, M = ctx.M;
  PX_SAVES.forEach((f,i) =>{ const s = (M.saves||[])[i]||{}; F.one(f, s.v, s.prof?"Bold":"Regular", 7.6, "center", 0); if(s.prof) F.dot(PX_SAVE_DOT[i]); });
  PX_SKILLS.forEach((sk,i) =>{ const s = (M.skills||{})[sk[0]]||{}; F.one(sk[1], s.v, s.prof?"Bold":"Regular", 7.6, "center", 0); if(s.prof) F.dot(PX_SKILL_DOT(i)); }); });
/* three weapon rows; more weapons go into the notes box under them */
pxAddPainter("weapons", (ctx) =>{ const F = ctx.F, W = ctx.M.weapons||[];
  W.slice(0,3).forEach((w,i) =>{ F.one(PX_WEAPON_ROWS[i][0], w[0], "SemiBold", 8.6); F.one(PX_WEAPON_ROWS[i][1], w[1], "Bold", 9.5, "center", 0); F.one(PX_WEAPON_ROWS[i][2], w[2], "Regular", 8); });
  const extra = W.slice(3).map((w) =>{ return "**"+w[0]+"** "+w[1]+", "+w[2]; });
  pxBoxTo(ctx, ["attackNotes","AttacksSpellcasting",7.6,"Weapons & Damage Cantrips","Attacks & Spellcasting"], extra.concat(ctx.M.attackNotes||[])); });
pxAddPainter("coins-boxes", (ctx) =>{ PX_COINS.forEach((c) =>{ ctx.F.one(c, (ctx.M.coins||{})[c], "Bold", 10.5, "center", 0); }); PX_BOXES.forEach((b) =>{ pxBoxTo(ctx,b); }); });
pxAddPainter("page2", (ctx) =>{ const F = ctx.F, M = ctx.M;
  F.one("CharacterName 2", M.name, "Bold", 18, "left", 7);
  PX_LOOKS.forEach((l) =>{ F.one(l[1], (M.looks||{})[l[0]], "SemiBold", 10.5, "left", 2, 0.42); });
  F.one("FactionName", M.factionName, "Bold", 10, "center");
  PX_BOXES_P2.forEach((b) =>{ pxBoxTo(ctx,b); }); });
/* one spell row: name, a small gray tag after it when it fits, the prepared dot */
function pxSpellRow(ctx, fld, cb, sp){ const F = ctx.F, T = F.T, r = F.rect(fld), y = r.y0+2.4, maxW = r.x1-r.x0-4;
  const tagW = sp.tag ? T.width("  "+sp.tag,"Regular",6.6) : 0; let s = 8.6;
  while(T.width(sp.name,"Medium",s)+tagW>maxW&&s>6) s -= 0.2;
  F.cv.text(r.p, r.x0+2, y, sp.name, "Medium", s, PX_INK);
  if(sp.tag&&T.width(sp.name,"Medium",s)+tagW<=maxW) F.cv.text(r.p, r.x0+2+T.width(sp.name+"  ","Medium",s), y, sp.tag, "Regular", 6.6, PX_GRAY);
  if(sp.prepared&&cb) F.dot(cb); }
function pxSpellLevel(ctx, L){ const rows = ctx.smap[String(L.level)]||[], many = L.spells.length>rows.length;
  L.spells.forEach((sp,i) =>{ if(i>=rows.length) return;
    if(many&&i===rows.length-1){ const r = ctx.F.rect(rows[i][0]); ctx.F.cv.text(r.p, r.x0+2, r.y0+2.4, "+"+(L.spells.length-i)+" more, see Spell Descriptions", "Italic", 7.6, PX_GRAY); return; }
    pxSpellRow(ctx, rows[i][0], rows[i][1], sp); });
  if(many) ctx.over.push(L.level); }
pxAddPainter("page3", (ctx) =>{ const S = ctx.M.spellcasting; if(!S) return;
  PX_SPELL_HEAD.forEach((h) =>{ ctx.F.one(h[1], S[h[0]], "Bold", h[2], "center", h[3]); });
  Object.keys(S.slots||{}).forEach((lv) =>{ const sl = S.slots[lv], row = ctx.smap.slots[lv]; if(!row) return;
    ctx.F.one(row[0], String(sl.total), "Bold", 12, "center", 0); if(sl.used) ctx.F.one(row[1], String(sl.used), "Bold", 12, "center", 0); });
  (S.levels||[]).forEach((L) =>{ pxSpellLevel(ctx, L); }); });
