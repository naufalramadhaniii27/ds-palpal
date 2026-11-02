import {ABN} from "./02-data-default-character.js";
import {FROZEN} from "./04-logic-storage.js";
import {esc,sg} from "./05-logic-helpers.js";
import {B,D} from "./06-logic-derivation.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"nmHTML",{get:function(){return nmHTML;},set:function(v){nmHTML=v;},configurable:true});
/* T11 N19 number map: which numbers feed a number, and which other numbers move with it. Made from the breakdowns (B) the sheet
   already keeps for every number, so it can never disagree with the sheet. An ability modifier or the Proficiency Bonus is a hub:
   tapping it shows every number that uses it, around a small diagram. Any other number shows what it is built from and what shares
   those parts. Every number in the map is a button that opens its own breakdown. */
function nmSrc(label){ const l=String(label||""); if(/^Proficiency Bonus$/.test(l)) return "pb"; for(const k in ABN) if(l===ABN[k]+" modifier") return "ab-"+k; return null; }
function nmInputs(key){ const b=B[key]; if(!b) return []; const out=[]; (b.parts||[]).forEach((p) =>{ const s=nmSrc(p.l); if(s&&B[s]&&out.indexOf(s)<0) out.push(s); }); return out; }
function nmUsers(src){ return Object.keys(B).filter((k) =>{ return k!==src&&nmInputs(k).indexOf(src)>=0; }); }
function nmName(k){ const b=B[k]; if(!b) return k; let t=String(b.t||k).replace(/\s*\(.*\)$/,"").replace(/: attack roll$/," attack"); if(/^ab-/.test(k)) t=ABN[k.slice(3)]+" modifier"; return t; }
function nmVal(k){ const b=B[k]; if(!b) return ""; if(/^ab-/.test(k)) return sg(D.mod[k.slice(3)]); return String(b.total); }
function nmChip(k){ return '<button type="button" class="nm-c" data-bd="'+esc(k)+'"><span>'+esc(nmName(k))+'</span><b>'+esc(nmVal(k))+'</b></button>'; }
/* a hub and its spokes, at most 12 around it */
function nmSVG(hub,users){ const U=users.slice(0,12), n=U.length; if(!n) return ""; const W=320, H=220, cx=W/2, cy=H/2, R=86;
  let s='<svg class="nm-g" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(nmName(hub))+' feeds '+n+' numbers">';
  U.forEach((k,i) =>{ const a=-Math.PI/2+i*2*Math.PI/n, x=cx+R*Math.cos(a)*1.35, y=cy+R*Math.sin(a); s+='<line x1="'+cx+'" y1="'+cy+'" x2="'+x.toFixed(1)+'" y2="'+y.toFixed(1)+'"/>'; });
  U.forEach((k,i) =>{ const a=-Math.PI/2+i*2*Math.PI/n, x=cx+R*Math.cos(a)*1.35, y=cy+R*Math.sin(a); s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="15" class="u"/><text x="'+x.toFixed(1)+'" y="'+(y+4).toFixed(1)+'" text-anchor="middle">'+esc(nmVal(k))+'</text>'; });
  return s+'<circle cx="'+cx+'" cy="'+cy+'" r="24" class="h"/><text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" class="ht">'+esc(nmVal(hub))+'</text></svg>'; }
function nmHTML(key){ if(!B[key]||FROZEN) return ""; const hub=/^ab-|^pb$/.test(key);
  if(hub){ const us=nmUsers(key); if(!us.length) return ""; return '<details class="nm" open><summary>Number map</summary><p class="bk-f">'+esc(nmName(key))+' goes into '+us.length+' number'+(us.length===1?'':'s')+'. Change it and all of them move.</p>'+nmSVG(key,us)+'<div class="nm-l">'+us.map(nmChip).join("")+'</div></details>'; }
  const ins=nmInputs(key); if(!ins.length) return "";
  return '<details class="nm"><summary>Number map</summary><p class="bk-f">Built from:</p><div class="nm-l">'+ins.map(nmChip).join("")+'</div>'+ins.map((s) =>{ const o=nmUsers(s).filter((k) =>{ return k!==key; }); return o.length?'<p class="bk-f">'+esc(nmName(s))+' also moves:</p><div class="nm-l">'+o.slice(0,10).map(nmChip).join("")+(o.length>10?'<span class="nm-more">and '+(o.length-10)+' more</span>':'')+'</div>':''; }).join("")+'</details>'; }
window.__numberMap=function(k){ return {inputs:nmInputs(k),users:nmUsers(k)}; };
