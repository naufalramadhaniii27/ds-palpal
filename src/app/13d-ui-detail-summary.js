/* Detail card summary block (dcSum): one line, big number row, chips, bullets from the bold sub-headings. Used by spell, feat and feature cards */
import {esc} from "./05-logic-helpers.js";
function sumPlain(t){ return String(t||"").replace(/<[^>]*>/g,"").replace(/\{@\w+ ([^|}]*)[^}]*\}/g,"$1").replace(/\*+/g,"").replace(/\s+/g," ").trim(); }
function sumCut(s,n){ s=String(s||""); if(s.length<=n) return s; const c=s.slice(0,n), k=c.lastIndexOf(" "); return (k>n*.6?c.slice(0,k):c).replace(/[,;:]$/,"")+"…"; }
export function sumFirst(t,n){ const s=sumPlain(t).split(/(?<=[.!?])\s+(?=[A-Z])/)[0]||""; return sumCut(s,n||150); }
/* [[heading, first sentence]] from "**Heading.** text" blocks, at most 4 */
export function sumPts(t){ const out=[], re=/\*\*([^*]{2,40}?)\.?\*\*\s*([^]*?)(?=\*\*[^*]{2,40}?\*\*|$)/g; let m; while((m=re.exec(String(t||"")))&&out.length<4){ const b=sumFirst(m[2],96); if(b) out.push([sumPlain(m[1]).replace(/[.:]$/,""),b]); } return out; }
/* the line when the data has no short summary: the first sentence that is not the Ability Score Increase block */
export function sumLine(t){ const s=String(t||""), parts=s.split(/\*\*[^*]{2,40}?\*\*/), heads=s.match(/\*\*[^*]{2,40}?\*\*/g)||[];
  for(let i=0;i<parts.length;i++){ if(i>0&&/Ability Score/i.test(heads[i-1]||"")) continue; const f=sumFirst(parts[i]); if(f) return f; } return ""; }
/* nums: [[label, html, extra class]]; chips: [[text, class]]; pts: [[head, text]] */
export function dcSum(line,nums,chips,pts){ nums=(nums||[]).filter((c) =>{ return c&&c[1]; }); chips=(chips||[]).filter(Boolean); pts=pts||[];
  if(!line&&!nums.length&&!chips.length&&!pts.length) return "";
  return '<section class="dsum" aria-label="Summary">'+(line?'<p class="dsum-l">'+esc(line)+'</p>':'')+
    (nums.length?'<dl class="dsum-n">'+nums.map((c) =>{ return '<div class="dsum-c'+(c[2]?' '+c[2]:'')+'"><dt>'+esc(c[0])+'</dt><dd>'+c[1]+'</dd></div>'; }).join("")+'</dl>':'')+
    (chips.length?'<ul class="dsum-ch" aria-label="Tags">'+chips.map((c) =>{ return '<li class="dsum-t'+(c[1]?' '+c[1]:'')+'">'+esc(c[0])+'</li>'; }).join("")+'</ul>':'')+
    (pts.length?'<ul class="dsum-p">'+pts.map((p) =>{ return '<li><b>'+esc(p[0])+'</b> '+esc(p[1])+'</li>'; }).join("")+'</ul>':'')+
    '</section><h3 class="info-h dsum-dh">Detail</h3>'; }
/* feats and features: the line (data summary or first sentence) and the bullets */
export function featSumH(full,d,chips){ return dcSum(d?sumCut(sumPlain(d),180):sumLine(full),[],chips,sumPts(full)); }
/* a sheet feature: the data summary when there is full text, else the first sentence */
export function fSumH(f){ return featSumH(f.full||f.d,f.full?f.d:"",[]); }
