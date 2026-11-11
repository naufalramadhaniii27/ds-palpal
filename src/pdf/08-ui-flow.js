/* PDFX appendix flow: two columns, a page header that names every part on the page, and headings repeated as (CONTINUED) */
import {PX_PAGE,PX_ACC,PX_GRAY,PX_LIGHT} from "./01-data-style.js";
export class PxFlow {
  constructor(doc, canvas, typeset, model, sub, firstNo){
    this.doc = doc; this.cv = canvas; this.T = typeset; this.M = model; this.sub = sub; this.no0 = firstNo;
    this.Mg = 36; this.G = 18; this.CW = (PX_PAGE.W-2*this.Mg-this.G)/2; this.TOP = PX_PAGE.H-70; this.BOT = 44;
    this.n = 0; this.page = null; this.col = 0; this.y = this.TOP; this.head = null; this.pending = null; }
  x0(){ return this.Mg+this.col*(this.CW+this.G); }
  newPage(pxTitle, strip){ if(this.page) this.close();
    if(pxTitle) this.title = pxTitle; if(strip!=null) this.strip = strip;
    this.page = this.doc.addPage([PX_PAGE.W,PX_PAGE.H]); this.n++; this.col = 0; this.y = this.TOP; this.titles = [this.title]; this.strips = [this.strip||""]; }
  titleSize(t, right){ const room = PX_PAGE.W-2*this.Mg-Math.max(this.T.width(right,"Medium",8.5), this.T.width(this.strips[0],"Regular",7.6))-14; let fs = 17;
    while(this.T.width(t,"Bold",fs)>room&&fs>9) fs -= 0.5; return fs; }
  close(){ const p = this.page, cv = this.cv, M = this.Mg, W = PX_PAGE.W, H = PX_PAGE.H, t = this.titles.join("  •  "), right = this.M.name+"  •  "+this.sub;
    cv.text(p, M, H-52, t, "Bold", this.titleSize(t,right), PX_ACC);
    cv.text(p, W-M-this.T.width(right,"Medium",8.5), H-45, right, "Medium", 8.5, PX_GRAY);
    cv.text(p, W-M-this.T.width(this.strips[0],"Regular",7.6), H-56, this.strips[0], "Regular", 7.6, PX_GRAY);
    cv.line(p, M, H-64, W-M, H-64, 1.1, PX_ACC);
    const mid = M+this.CW+this.G/2; cv.line(p, mid, this.BOT+6, mid, this.TOP+8, 0.5, PX_LIGHT);
    const foot = this.M.name+"  •  "+this.titles.map((s) =>{ return s.charAt(0)+s.slice(1).toLowerCase(); }).join(" & ")+"  •  Page "+(this.no0+this.n);
    cv.text(p, (W-this.T.width(foot,"Regular",6.5))/2, 26, foot, "Regular", 6.5, PX_GRAY);
    this.page = null; }
  /* a new part goes on in the empty right column, or under the last one when there is room, else on a new page */
  part(pxTitle, strip){ this.head = null; this.pending = null;
    if(!this.page){ this.newPage(pxTitle, strip); return; }
    if(this.col===0){ this.col = 1; this.y = this.TOP; }
    else if(this.y-this.BOT<260){ this.newPage(pxTitle, strip); return; }
    this.titles.push(pxTitle); this.title = pxTitle; this.y -= 4;
    this.cv.text(this.page, this.x0(), this.y-13, pxTitle, "Bold", 13, PX_ACC); this.y -= 19;
    this.cv.text(this.page, this.x0(), this.y-8, strip, "Regular", 7, PX_GRAY); this.y -= 12; }
  /* a long section title wraps by words so it never runs into the next column */
  heading(text){ const rows = []; let cur = "";
    String(text).split(" ").forEach((w) =>{ const nx = cur ? cur+" "+w : w;
      if(cur&&this.T.width(nx,"Bold",8.4)>this.CW){ rows.push(cur); cur = w; } else cur = nx; });
    if(cur) rows.push(cur);
    rows.forEach((r,i) =>{ this.y -= i ? 10 : 14; this.cv.text(this.page, this.x0(), this.y, r, "Bold", 8.4, PX_ACC); });
    this.cv.line(this.page, this.x0(), this.y-3.5, this.x0()+this.CW, this.y-3.5, 0.7, PX_ACC); this.y -= 8; }
  next(){ if(this.col===0){ this.col = 1; this.y = this.TOP; } else this.newPage(); if(this.head) this.heading(this.head+"  (CONTINUED)"); }
  section(head, label){ this.head = null; this.pending = [head, label||head]; }
  /* a block is kept in one column when it fits one; a longer block breaks between lines */
  block(lines, gap){ gap = gap==null ? 9 : gap;
    const h = this.T.height(lines)+gap, extra = this.pending ? 22 : 0;
    if(this.y-h-extra<this.BOT&&h<=this.TOP-this.BOT-30) this.next();
    if(this.pending){ if(this.y-62<this.BOT) this.next(); this.heading(this.pending[0]); this.head = this.pending[1]; this.pending = null; }
    lines.forEach((l) =>{ if(this.y-l[0]<this.BOT) this.next(); this.y = this.cv.lines(this.page, [l], this.x0(), this.y); });
    this.y -= gap; }
  finish(){ if(this.page) this.close(); }
}
