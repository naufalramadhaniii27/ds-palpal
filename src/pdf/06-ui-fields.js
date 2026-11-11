/* PDFX fields: fills one field of the template. A text box that does not fit returns the paragraphs it could not show,
   so nothing is lost: the caller sends them to the continuation page */
import {pxRuns} from "./02-logic-markup.js";
import {PX_INK,PX_GRAY,PX_SIZE,PX_LIGHT,PX_TINT} from "./01-data-style.js";
export class PxFields {
  constructor(canvas, typeset, map, pages, form, lib, editPages){ this.cv = canvas; this.T = typeset; this.map = map; this.pages = pages; this.form = form; this.L = lib; this.used = new Set();
    this.editPages = new Set(editPages||[]); }
  /* the form field behind a template box, only on a page the player edits (page 1) */
  editable(name, kind){ if(!this.form) return null; const r = this.map[name]; if(!r||!this.editPages.has(r[0])) return null;
    try{ return kind==="check" ? this.form.getCheckBox(name) : this.form.getTextField(name); }catch(e){ return null; } }
  /* a value written into a form field with the same font, size and alignment it would have when drawn */
  setField(tf, text, f, s, align, multi){ const fn = this.cv.F[f]||this.cv.F.Medium, c = PX_INK; this.used.add(tf.getName());
    if(multi) try{ tf.enableMultiline(); }catch(e){}
    try{ tf.disableRichFormatting&&tf.disableRichFormatting(); }catch(e){}
    tf.setText(text==null ? "" : String(text));
    try{ tf.setAlignment(align==="center" ? this.L.TextAlignment.Center : this.L.TextAlignment.Left); }catch(e){}
    try{ tf.acroField.setDefaultAppearance("/"+fn.name+" "+(+s).toFixed(2)+" Tf "+c[0]+" "+c[1]+" "+c[2]+" rg"); }catch(e){}
    /* no template fill behind the value: the page looks the same as a drawn one */
    try{ tf.acroField.getWidgets().forEach((w) =>{ const mk = w.dict.lookup(this.L.PDFName.of("MK")); if(mk&&mk.delete) mk.delete(this.L.PDFName.of("BG")); }); }catch(e){}
    try{ tf.updateAppearances(fn); }catch(e){} }
  /* a box's markup as plain lines a form field can hold: headings in capitals, no bold or italic marks */
  plain(pars){ return (pars||[]).filter((p) =>{ return p!==""; }).map((p) =>{ return /^# /.test(p) ? p.slice(2).toUpperCase() : pxRuns(p.replace(/\{\{(.+?)\}\}/g,"($1)"),1).map((r) =>{ return r[0]; }).join("").replace(/\u00a0/g," "); }); }
  /* a play field the player edits in the PDF: the value goes into the form field (centred, bold), not onto the page.
     Without the field (old template) it is drawn like any other value */
  live(name, text, f, s, align, pad, vfrac){ let tf = null;
    try{ tf = this.form&&this.form.getTextField(name); }catch(e){ tf = null; }
    if(!tf){ this.one(name, text, f, s, align, pad, vfrac); return; }
    this.setField(tf, text, f, Math.min(s,14), "center"); }
  /* a play checkbox (death saves): ticked or not, still clickable */
  liveCheck(name, on){ let cb = null; try{ cb = this.form&&this.form.getCheckBox(name); }catch(e){ cb = null; }
    if(!cb){ if(on) this.drawDot(name); return; } this.used.add(name); if(on) cb.check(); else cb.uncheck(); }
  /* a new small checkbox (prepared mark for the second spell on a shared row) */
  addCheck(page, name, x, y, sz, on){ if(!this.form) return; let cb; try{ cb = this.form.createCheckBox(name); }catch(e){ return; } (this.made = this.made||new Set()).add(name);
    cb.addToPage(page, {x:x, y:y, width:sz, height:sz, borderColor:this.cv.rgb(PX_GRAY), borderWidth:0.5, backgroundColor:this.cv.rgb([1,1,1])});
    if(on) cb.check(); }
  /* a new form field drawn by the appendix (Play Tracker): a light box the player types in */
  addField(page, name, x, y, w, h, value, opt){ opt = opt||{}; if(!this.form) return null;
    let tf; try{ tf = this.form.createTextField(name); }catch(e){ return null; }
    if(opt.multi) tf.enableMultiline();
    tf.addToPage(page, {x:x, y:y, width:w, height:h, font:this.cv.F[opt.font||"Medium"], textColor:this.cv.rgb(PX_INK),
      borderColor:this.cv.rgb(PX_LIGHT), borderWidth:0.6, backgroundColor:this.cv.rgb(PX_TINT)});
    tf.setText(value==null ? "" : String(value));
    const fn = this.cv.F[opt.font||"Medium"], c = PX_INK;
    try{ tf.acroField.setDefaultAppearance("/"+fn.name+" "+(opt.size||9)+" Tf "+c[0]+" "+c[1]+" "+c[2]+" rg"); }catch(e){ try{ tf.setFontSize(opt.size||9); }catch(e2){} }
    if(opt.center) try{ tf.setAlignment(this.L.TextAlignment.Center); }catch(e){}
    try{ tf.updateAppearances(fn); }catch(e){}
    return tf; }
  /* the field fonts go into the form resources too, so a viewer that redraws a field after an edit finds the font its DA names */
  /* a ticked box shows a solid dot like a drawn sheet (pdf-lib draws a small check mark otherwise) */
  dotLook(){ const L = this.L, made = this.made||new Set(); this.form.getFields().forEach((cb) =>{ if(!(cb instanceof L.PDFCheckBox)||made.has(cb.getName())) return;
    cb.acroField.getWidgets().forEach((w) =>{ try{ const r = w.getRectangle(), cx = r.width/2, cy = r.height/2, k = Math.min(r.width,r.height)*0.37, c = k*0.5523, ink = PX_INK;
      const ops = ink.join(" ")+" rg "+(cx+k)+" "+cy+" m "+(cx+k)+" "+(cy+c)+" "+(cx+c)+" "+(cy+k)+" "+cx+" "+(cy+k)+" c "+(cx-c)+" "+(cy+k)+" "+(cx-k)+" "+(cy+c)+" "+(cx-k)+" "+cy+" c "
        +(cx-k)+" "+(cy-c)+" "+(cx-c)+" "+(cy-k)+" "+cx+" "+(cy-k)+" c "+(cx+c)+" "+(cy-k)+" "+(cx+k)+" "+(cy-c)+" "+(cx+k)+" "+cy+" c f";
      const ctx = w.dict.context, on = w.getOnValue&&w.getOnValue(); if(!on) return;
      const st = ctx.stream(ops, {Type:"XObject", Subtype:"Form", BBox:[0,0,r.width,r.height]}), ap = w.dict.lookup(L.PDFName.of("AP")); if(!ap) return;
      const nd = ap.lookup(L.PDFName.of("N")); if(nd&&nd.set) nd.set(on, ctx.register(st));
      const dd = ap.lookup(L.PDFName.of("D")); if(dd&&dd.set) dd.set(on, ctx.register(ctx.stream(ops, {Type:"XObject", Subtype:"Form", BBox:[0,0,r.width,r.height]})));
    }catch(e){} }); }); }
  liveDone(font){ if(!this.form) return; try{ this.form.updateFieldAppearances(font); }catch(e){} this.dotLook();
    /* every field now carries its own look; a viewer must not redraw them in its own font */
    try{ this.form.acroForm.dict.set(this.L.PDFName.of("NeedAppearances"), this.L.PDFBool.False); }catch(e){}
    try{ const L = this.L, af = this.form.acroForm.dict, ctx = af.context;
      let dr = af.lookup(L.PDFName.of("DR")); if(!dr){ dr = ctx.obj({}); af.set(L.PDFName.of("DR"), dr); }
      let fd = dr.lookup(L.PDFName.of("Font")); if(!fd){ fd = ctx.obj({}); dr.set(L.PDFName.of("Font"), fd); }
      Object.keys(this.cv.F).forEach((k) =>{ const f = this.cv.F[k]; if(f&&f.ref&&f.name) fd.set(L.PDFName.of(f.name), f.ref); });
    }catch(e){} }
  rect(name){ const r = this.map[name]; if(!r) throw new Error("PDFX: no field "+name); return {p:this.pages[r[0]], x0:r[1], y0:r[2], x1:r[3], y1:r[4]}; }
  one(name, text, f, s, align, pad, vfrac){
    if(text==null||text==="") return;
    text = String(text); pad = pad==null ? 2 : pad;
    const r = this.rect(name), w = r.x1-r.x0-2*pad;
    while(this.T.width(text,f,s)>w&&s>5) s -= 0.25;
    const tf = this.editable(name); if(tf){ this.setField(tf, text, f, s, align); return; }
    const tw = this.T.width(text,f,s), x = align==="center" ? r.x0+(r.x1-r.x0-tw)/2 : r.x0+pad;
    this.cv.text(r.p, x, r.y0+(r.y1-r.y0)*(vfrac==null?0.5:vfrac)-s*0.36, text, f, s, PX_INK); }
  /* a picture inside a field; pad keeps it off the border, bottom keeps the box title free */
  picture(name, img, pad, bottom){ if(!img) return; const r = this.rect(name); pad = pad==null ? 4 : pad; bottom = bottom==null ? pad : bottom;
    this.cv.image(r.p, img, r.x0+pad, r.y0+bottom, r.x1-r.x0-2*pad, r.y1-r.y0-pad-bottom); }
  /* a number with a small unit after it, centred: "30 ft" */
  unit(name, num, unit, s){ if(!num) return;
    const tf = this.editable(name); if(tf){ this.setField(tf, num+(unit?" "+unit:""), "Bold", s*0.8, "center"); return; }
    const r = this.rect(name), a = this.T.width(num,"Bold",s), b = unit ? this.T.width(" "+unit,"Medium",s*0.45) : 0;
    const x = r.x0+(r.x1-r.x0-a-b)/2, y = r.y0+(r.y1-r.y0)/2-s*0.36;
    this.cv.text(r.p, x, y, num, "Bold", s, PX_INK); if(unit) this.cv.text(r.p, x+a, y, " "+unit, "Medium", s*0.45, PX_GRAY); }
  dot(name){ const cb = this.editable(name, "check"); if(cb){ this.used.add(name); cb.check(); return; } this.drawDot(name); }
  drawDot(name){ const r = this.rect(name); this.cv.dot(r.p, (r.x0+r.x1)/2, (r.y0+r.y1)/2, 2.1, PX_INK); }
  fit(pars, w, h, s, smin){ let ls;
    for(;;){ ls = this.T.layout(pars,w,s); if(this.T.height(ls)<=h||s<=smin) return {ls:ls, s:s}; s -= 0.2; } }
  /* whole paragraphs that fit above the note line; a lone heading at the end moves on with its text */
  split(pars, w, h, s){ let k = pars.length;
    while(k>0&&this.T.height(this.T.layout(pars.slice(0,k),w,s))>h) k--;
    const keep = pars.slice(0,k), rest = pars.slice(k);
    while(keep.length&&(/^# /.test(keep[keep.length-1])||keep[keep.length-1]==="")) rest.unshift(keep.pop());
    return {keep:keep, rest:rest}; }
  /* one long paragraph: the lines that fit, the rest as plain text */
  splitLines(pars, w, h, s){ const ls = this.T.layout([pars[0]],w,s), keep = []; let acc = 0;
    while(keep.length<ls.length&&acc+ls[keep.length][0]<=h){ acc += ls[keep.length][0]; keep.push(ls[keep.length]); }
    const tail = ls.slice(keep.length).map((l) =>{ return l[1].map((g) =>{ return g[1]; }).join(""); }).join(" ").trim();
    return {lines:keep, rest:(tail?[tail]:[]).concat(pars.slice(1))}; }
  /* a list of short lines (one name or item per line) packed into one flowing paragraph with dots between, or null when it is not such a list */
  packed(pars){ const L = pars.filter((p) =>{ return p!==""; });
    if(L.length<3||L.some((p) =>{ return /^# /.test(p)||p.length>140; })) return null;
    return [L.join("  •  ")]; }
  /* a box on page 1: plain text in a multiline field; what does not fit still goes to the continuation page */
  editBox(tf, name, pars, s, note){ const pad = 2.5, r = this.rect(name), w = r.x1-r.x0-2*pad, h = (r.y1-r.y0-2*pad)*0.9, P = this.plain(pars);
    const f = this.fit(P,w,h,s,PX_SIZE.boxMin);
    if(this.T.height(f.ls)<=h){ this.setField(tf, P.join("\n"), "Regular", f.s, "left", true); return []; }
    const pk = this.packed(pars);
    if(pk){ const q = this.plain(pk), g = this.fit(q,w,h,s,PX_SIZE.boxMin); if(this.T.height(g.ls)<=h){ this.setField(tf, q.join("\n"), "Regular", g.s, "left", true); return []; } }
    const nl = f.s*PX_SIZE.line; let k = P.length;
    while(k>0&&this.T.height(this.T.layout(P.slice(0,k),w,f.s))>h-nl) k--;
    while(k>0&&/^# /.test(pars.filter((p) =>{ return p!==""; })[k-1])) k--;
    const src = pars.filter((p) =>{ return p!==""; });
    if(!k){ const ls = this.T.layout([P[0]],w,f.s); let acc = 0, n = 0; while(n<ls.length&&acc+ls[n][0]<=h-nl){ acc += ls[n][0]; n++; }
      const txt = (l) =>{ return l[1].map((g) =>{ return g[1]; }).join(""); }, head = ls.slice(0,n).map(txt).join(" ").trim(), tail = ls.slice(n).map(txt).join(" ").trim();
      this.setField(tf, head+"\n"+note, "Regular", f.s, "left", true); return (tail?[tail]:[]).concat(src.slice(1)); }
    this.setField(tf, P.slice(0,k).concat([note]).join("\n"), "Regular", f.s, "left", true);
    return src.slice(k); }
  box(name, pars, s, note){
    if(!pars||!pars.length) return [];
    const tf = this.editable(name); if(tf) return this.editBox(tf, name, pars, s, note);
    const pad = 3, r = this.rect(name), w = r.x1-r.x0-2*pad, h = r.y1-r.y0-2*pad, f = this.fit(pars,w,h,s,PX_SIZE.boxMin);
    if(this.T.height(f.ls)<=h){ this.cv.lines(r.p, f.ls, r.x0+pad, r.y1-pad); return []; }
    /* a list that does not fit line by line often fits packed; when even that does not fit, the line by line list goes on to the continuation page */
    const pk = this.packed(pars);
    if(pk){ const g = this.fit(pk,w,h,s,PX_SIZE.boxMin); if(this.T.height(g.ls)<=h){ this.cv.lines(r.p, g.ls, r.x0+pad, r.y1-pad); return []; } }
    const nl = f.s*PX_SIZE.line, sp = this.split(pars,w,h-nl,f.s);
    const out = sp.keep.length ? {lines:this.T.layout(sp.keep,w,f.s), rest:sp.rest} : this.splitLines(pars,w,h-nl,f.s);
    this.cv.lines(r.p, out.lines.concat([[nl,[[0,note,"Italic",f.s*0.9,PX_GRAY]]]]), r.x0+pad, r.y1-pad);
    return out.rest; }
}
