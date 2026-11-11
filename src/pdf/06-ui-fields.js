/* PDFX fields: fills one field of the template. A text box that does not fit returns the paragraphs it could not show,
   so nothing is lost: the caller sends them to the continuation page */
import {PX_INK,PX_GRAY,PX_SIZE,PX_LIGHT,PX_TINT} from "./01-data-style.js";
export class PxFields {
  constructor(canvas, typeset, map, pages, form, lib){ this.cv = canvas; this.T = typeset; this.map = map; this.pages = pages; this.form = form; this.L = lib; this.used = new Set(); }
  /* a play field the player edits in the PDF: the value goes into the form field (centred, bold), not onto the page.
     Without the field (old template) it is drawn like any other value */
  live(name, text, f, s, align, pad, vfrac){ let tf = null;
    try{ tf = this.form&&this.form.getTextField(name); }catch(e){ tf = null; }
    if(!tf){ this.one(name, text, f, s, align, pad, vfrac); return; }
    tf.setText(text==null ? "" : String(text)); try{ tf.setFontSize(Math.min(s,14)); }catch(e){}
    try{ tf.setAlignment(this.L.TextAlignment.Center); }catch(e){} }
  /* a play checkbox (death saves): ticked or not, still clickable */
  liveCheck(name, on){ let cb = null; try{ cb = this.form&&this.form.getCheckBox(name); }catch(e){ cb = null; }
    if(!cb){ if(on) this.dot(name); return; } this.used.add(name); if(on) cb.check(); else cb.uncheck(); }
  /* a new small checkbox (prepared mark for the second spell on a shared row) */
  addCheck(page, name, x, y, sz, on){ if(!this.form) return; let cb; try{ cb = this.form.createCheckBox(name); }catch(e){ return; }
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
  liveDone(font){ if(!this.form) return; try{ this.form.updateFieldAppearances(font); }catch(e){}
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
    const tw = this.T.width(text,f,s), x = align==="center" ? r.x0+(r.x1-r.x0-tw)/2 : r.x0+pad;
    this.cv.text(r.p, x, r.y0+(r.y1-r.y0)*(vfrac==null?0.5:vfrac)-s*0.36, text, f, s, PX_INK); }
  /* a picture inside a field; pad keeps it off the border, bottom keeps the box title free */
  picture(name, img, pad, bottom){ if(!img) return; const r = this.rect(name); pad = pad==null ? 4 : pad; bottom = bottom==null ? pad : bottom;
    this.cv.image(r.p, img, r.x0+pad, r.y0+bottom, r.x1-r.x0-2*pad, r.y1-r.y0-pad-bottom); }
  /* a number with a small unit after it, centred: "30 ft" */
  unit(name, num, unit, s){ if(!num) return;
    const r = this.rect(name), a = this.T.width(num,"Bold",s), b = unit ? this.T.width(" "+unit,"Medium",s*0.45) : 0;
    const x = r.x0+(r.x1-r.x0-a-b)/2, y = r.y0+(r.y1-r.y0)/2-s*0.36;
    this.cv.text(r.p, x, y, num, "Bold", s, PX_INK); if(unit) this.cv.text(r.p, x+a, y, " "+unit, "Medium", s*0.45, PX_GRAY); }
  dot(name){ const r = this.rect(name); this.cv.dot(r.p, (r.x0+r.x1)/2, (r.y0+r.y1)/2, 2.1, PX_INK); }
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
  box(name, pars, s, note){
    if(!pars||!pars.length) return [];
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
