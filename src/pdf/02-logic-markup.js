/* PDFX markup to styled pxRuns. **bold**, _italic gray_, {{small gray}}, ^^LABEL^^. Pure: no fonts, no pdf-lib */
import {PX_INK,PX_GRAY} from "./01-data-style.js";
const PX_TOK = /(\*\*.+?\*\*|(?<![A-Za-z0-9])_[^_\n]+?_(?![A-Za-z0-9])|\{\{.+?\}\}|\^\^.+?\^\^)/;
const PX_KINDS = [
  {t:(p) =>{ return p.slice(0,2)==="**"&&p.slice(-2)==="**"; }, r:(p,s) =>{ return [p.slice(2,-2),"Bold",s,PX_INK]; }},
  {t:(p) =>{ return p.slice(0,2)==="{{"; }, r:(p,s) =>{ return [p.slice(2,-2),"Regular",s*0.86,PX_GRAY]; }},
  {t:(p) =>{ return p.slice(0,2)==="^^"; }, r:(p,s) =>{ return [p.slice(2,-2),"SemiBold",s*0.8,PX_GRAY]; }},
  {t:(p) =>{ return p.length>2&&p[0]==="_"&&p[p.length-1]==="_"; }, r:(p,s) =>{ return [p.slice(1,-1),"Italic",s,PX_GRAY]; }}
];
/* one paragraph to runs: [text, style, size, color] */
export function pxRuns(par, size, base){
  const out = [];
  String(par).split(PX_TOK).forEach((p) =>{ if(!p) return; const k = PX_KINDS.find((x) =>{ return x.t(p); }); out.push(k ? k.r(p,size) : [p, base||"Regular", size, PX_INK]); });
  return out;
}
export function pxIsHeading(p){ return String(p).slice(0,2)==="# "; }
