/* PDFX typesetting: pxRuns to lines that fit a width. Depends on a measure function only (no pdf-lib), so it can be tested alone.
   A line is [height, segments]; a segment is [x, text, style, size, color] or a shape {rect|pxRule}. */
import {pxRuns,pxIsHeading} from "./02-logic-markup.js";
import {PX_ACC,PX_NB,PX_SIZE} from "./01-data-style.js";
export class PxTypesetter {
  constructor(measure){ this.m = measure; }
  width(t,f,s){ return this.m(t,f,s); }
  /* words joined by no space (a label and its value) stay on one line */
  groups(rl){ const G = [];
    rl.forEach((r) =>{ const t = r[0];
      if(t[0]===" "&&G.length){ const g = G[G.length-1], l = g[g.length-1]; if(!/ $/.test(l[0])) g[g.length-1] = [l[0]+" ",l[1],l[2],l[3]]; }
      const re = /[^ ]+ */g; let m, i = 0;
      while((m = re.exec(t))){ const pc = [m[0],r[1],r[2],r[3]], last = G[G.length-1];
        if(i===0&&t[0]!==" "&&last&&!/ $/.test(last[last.length-1][0])) last.push(pc); else G.push([pc]); i++; } });
    return G; }
  groupWidth(g){ let w = 0; g.forEach((p,k) =>{ w += this.m(k<g.length-1 ? p[0] : p[0].replace(/ +$/,""), p[1], p[2]); }); return w; }
  wrap(rl, width, lh){ const lines = []; let cur = [], x = 0;
    this.groups(rl).forEach((g) =>{ const wd = this.groupWidth(g);
      if(cur.length&&x+wd>width){ lines.push([lh,cur]); cur = []; x = 0; }
      g.forEach((p) =>{ cur.push([x, p[0].split(PX_NB).join(" "), p[1], p[2], p[3]]); x += this.m(p[0],p[1],p[2]); }); });
    if(cur.length) lines.push([lh,cur]);
    return lines; }
  /* a heading wider than the box wraps by words instead of running past the edge */
  heading(p, size, first, width){ const hs = size*1.08, out = first ? [] : [[size*0.45,[]]], t = p.slice(2).toUpperCase();
    if(!(width>0)||this.m(t,"Bold",hs)<=width){ out.push([hs*1.3,[[0,t,"Bold",hs,PX_ACC]]]); return out; }
    let cur = "";
    t.split(" ").forEach((w) =>{ const nx = cur ? cur+" "+w : w;
      if(cur&&this.m(nx,"Bold",hs)>width){ out.push([hs*1.3,[[0,cur,"Bold",hs,PX_ACC]]]); cur = w; } else cur = nx; });
    if(cur) out.push([hs*1.3,[[0,cur,"Bold",hs,PX_ACC]]]);
    return out; }
  layout(pars, width, size){ let lines = [];
    (pars||[]).forEach((p) =>{
      if(p===""){ lines.push([size*0.55,[]]); return; }
      if(pxIsHeading(p)){ lines = lines.concat(this.heading(p,size,!lines.length,width)); return; }
      lines = lines.concat(this.wrap(pxRuns(p,size),width,size*PX_SIZE.line)); });
    return lines; }
  height(lines){ return lines.reduce((t,l) =>{ return t+l[0]; },0); }
}
