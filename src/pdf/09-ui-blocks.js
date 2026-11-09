/* PDFX blocks: an entry of the appendix as typeset lines. One builder per kind in PX_BLOCKS; a new kind is one more entry */
import {PX_INK,PX_GRAY,PX_ACC,PX_TINT,PX_NB,PX_SIZE} from "./01-data-style.js";
import {pxRuns} from "./02-logic-markup.js";
function pxTitle(T, name, tag){ const segs = [[0,name,"Bold",10.5,PX_INK]];
  if(tag) segs.push([T.width(name+"   ","Bold",10.5), String(tag).toUpperCase(), "SemiBold", 6.4, PX_ACC]);
  return [[13.5,segs]]; }
/* IN SHORT: the line the player reads first, on a light band with an accent bar */
export function pxSummary(T, text, CW){ if(!text) return [];
  const bg = {rect:true, bar:true, x:0, w:CW, c:PX_TINT}, out = [[3,[bg]]];
  T.wrap(pxRuns("^^IN"+PX_NB+"SHORT^^ "+text, PX_SIZE.summary, "Medium"), CW-12, 10.4).forEach((l) =>{ out.push([l[0],[bg].concat(l[1].map((g) =>{ return [g[0]+7,g[1],g[2],g[3],g[4]]; }))]); });
  out.push([3,[bg]]); return out; }
function pxShortFull(T, e, CW){ let out = pxSummary(T, e.summary, CW); if(out.length&&(e.text||[]).length) out.push([4,[]]); return out.concat(T.layout(e.text||[],CW,PX_SIZE.body)); }
function pxDetails(T, det, CW){ const dp = (det||[]).filter((d) =>{ return d[1]; }).map((d) =>{
  return "^^"+d[0].toUpperCase().split(" ").join(PX_NB)+"^^"+PX_NB+String(d[1]).split(" ").join(PX_NB); }).join("   •   ");
  return dp ? [[3.5,[]]].concat(T.wrap(pxRuns(dp,7.3,"Medium"),CW,10.2)) : []; }
function pxRule(CW, t){ return [t>1?3:5, [{rule:true, x:0, w:CW, t:t, c:PX_ACC}]]; }
function pxAbilityRows(T, ab, CW){ const cw = CW/6, head = [], val = [];
  ["STR","DEX","CON","INT","WIS","CHA"].forEach((k,i) =>{ const a = ab[k]||["",""], cx = i*cw+cw/2, t = a[0]+" ("+a[1]+")";
    head.push([cx-T.width(k,"Bold",7)/2, k, "Bold", 7, PX_ACC]); val.push([cx-T.width(t,"Medium",8)/2, t, "Medium", 8, PX_INK]); });
  return [pxRule(CW,0.6),[10,head],[11,val],pxRule(CW,0.6)]; }
function pxPairs(T, list, size, lh, CW){ let out = []; (list||[]).forEach((s) =>{ out = out.concat(T.wrap(pxRuns("**"+s[0]+"** "+s[1],size),CW,lh)); }); return out; }
function pxSections(T, secs, CW){ let out = [];
  (secs||[]).forEach((sec) =>{ out.push([4,[]],[12,[[0,sec[0].toUpperCase(),"Bold",8.2,PX_ACC]]],[4,[{rule:true,x:0,w:CW,t:0.4,c:PX_ACC}]]);
    sec[1].forEach((e) =>{ out = out.concat(T.wrap(pxRuns("**"+e[0]+".** "+e[1],7.7),CW,9.6)); out.push([2.5,[]]); }); });
  return out; }
export const PX_BLOCKS = {
  spell(T, sp, CW){ return pxTitle(T,sp.name,sp.tag).concat(sp.line?[[10,[[0,sp.line,"Italic",7.6,PX_GRAY]]]]:[], [[2.5,[]]], pxShortFull(T,sp,CW), pxDetails(T,sp.details,CW)); },
  feature(T, f, CW){ return pxTitle(T,f.name,f.tag).concat([[1.5,[]]], pxShortFull(T,f,CW)); },
  text(T, f, CW){ return T.layout(f.text||[], CW, PX_SIZE.body); },
  creature(T, c, CW){ return [pxRule(CW,1.6)].concat(pxTitle(T,c.name,c.tag), c.meta?[[10,[[0,c.meta,"Italic",7.6,PX_GRAY]]]]:[],
      c.summary?[[3,[]]].concat(pxSummary(T,c.summary,CW),[[2,[]]]):[], [pxRule(CW,0.6)], pxPairs(T,c.stats,7.8,10.4,CW),
      c.abilities?pxAbilityRows(T,c.abilities,CW):[], pxPairs(T,c.lines,7.6,10,CW), pxSections(T,c.sections,CW), [pxRule(CW,1.6)]); }
};
