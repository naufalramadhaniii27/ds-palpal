/* PDFX canvas: the only file that calls the pdf-lib drawing API. Everything else hands it lines and shapes */
import {PX_ACC} from "./01-data-style.js";
export class PxCanvas {
  constructor(lib, fonts){ this.L = lib; this.F = fonts; }
  rgb(c){ return this.L.rgb(c[0],c[1],c[2]); }
  text(page, x, y, t, f, s, c){ if(t) page.drawText(t,{x:x, y:y, size:s, font:this.F[f], color:this.rgb(c)}); }
  line(page, x0, y0, x1, y1, th, c){ page.drawLine({start:{x:x0,y:y0}, end:{x:x1,y:y1}, thickness:th, color:this.rgb(c)}); }
  dot(page, x, y, r, c){ page.drawCircle({x:x, y:y, size:r, color:this.rgb(c)}); }
  shape(page, s, x, y, h){
    if(s.rect){ page.drawRectangle({x:x+s.x, y:y-0.2, width:s.w, height:h+0.4, color:this.rgb(s.c)});
      if(s.bar) page.drawRectangle({x:x+s.x, y:y-0.2, width:1.6, height:h+0.4, color:this.rgb(PX_ACC)}); return; }
    this.line(page, x+s.x, y+h*0.5, x+s.x+s.w, y+h*0.5, s.t||0.6, s.c); }
  /* draws typeset lines from the top y down; returns the y under the last line */
  lines(page, ls, x, ytop){ let y = ytop;
    ls.forEach((l) =>{ y -= l[0];
      l[1].forEach((s) =>{ if(s.rect||s.rule) this.shape(page,s,x,y,l[0]); else this.text(page, x+s[0], y+l[0]*0.22, s[1].replace(/ +$/,""), s[2], s[3], s[4]); }); });
    return y; }
}
