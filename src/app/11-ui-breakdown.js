import {ABN} from "./02-data-default-character.js";
import {GLOSS} from "./03-data-glossary.js";
import {C} from "./04-logic-storage.js";
import {esc,sg} from "./05-logic-helpers.js";
import {B} from "./06-logic-derivation.js";
import {__R} from "./00-reg.js";
import { html, raw as rawHtml } from "./lib/html.js";
/* ================= BREAKDOWN ================= */
function bdAbout(key){
  let m=key.match(/^(ab|save|sk|ah|ad)-(.+)$/), spec=null, label="";
  if(m){ if(m[1]==="ab"){ spec="g:"+ABN[m[2]]; label=ABN[m[2]]; } else if(m[1]==="save"){ spec="g:Saving Throw"; label="a saving throw"; }
    else if(m[1]==="sk"){ const sk=C.skills[+m[2]]; if(sk&&GLOSS[sk.n]){ spec="g:"+sk.n; label=sk.n; } }
    else { spec="w:"+m[2]; label="this attack"; } }
  else { const map={ac:"Armor Class",init:"Initiative",speed:"Speed",pb:"Proficiency Bonus",hp:"Hit Points",carry:"Carrying Capacity",dc:"Grapple",dark:"Darkvision","pas-per":"Passive Perception","pas-ins":"Insight","pas-inv":"Investigation"}; if(map[key]){ spec="g:"+map[key]; label=map[key]; } }
  return spec ? html`<p class="bk-about"><button type="button" class="lk" data-info="${spec}">What is ${label}?</button></p>` : '';
}
window.__miInfo=function(s){ try{ return __R.infoHTML(s); }catch(e){ return null; } }; window.__miBd=function(k){ try{ return B[k]||null; }catch(e){ return null; } };
/* T11 G4 N10 odds: the exact chance to reach common targets with this bonus, plain, with Advantage and with Disadvantage.
   Checks and saves: d20 + bonus at or above the DC (2024: a 1 or 20 on a check or save is not automatic).
   Attacks: a natural 20 always hits and a natural 1 always misses. Shown as whole percents, worked out, not estimated */
function oddsP(bon,t,atk){ let need=t-bon, p=(21-need)/20; if(atk){ p=Math.min(19,Math.max(1,21-need))/20; } return Math.max(0,Math.min(1,p)); }
function oddsHTML(key){ const b=B[key]; if(!b) return ""; const atk=/^ah-/.test(key); if(!/^(save-|sk-|ab-|ah-)/.test(key)&&key!=="init") return "";
  const bon=parseInt(String(b.total).replace("\u2212","-"),10); if(!isFinite(bon)||key==="init") return "";
  const T=atk?[12,15,18]:[10,15,20], pc=function(x){ return Math.round(x*100)+"%"; };
  const rows=T.map((t) =>{ const p=oddsP(bon,t,atk); return html`<tr><th scope="row">${rawHtml(atk?"AC ":"DC ")}${rawHtml(t)}</th><td>${rawHtml(pc(p))}</td><td>${rawHtml(pc(1-(1-p)*(1-p)))}</td><td>${rawHtml(pc(p*p))}</td></tr>`; }).join("");
  return html`<div class="odds"><b class="odds-h">${rawHtml(atk?"Chance to hit":"Chance to succeed")}</b><table><thead><tr><th scope="col"><span class="vh">Target</span></th><th scope="col">Plain</th><th scope="col">Advantage</th><th scope="col">Disadvantage</th></tr></thead><tbody>${rawHtml(rows)}</tbody></table></div>`; }
export function bdHTML(key){
  const b=B[key]; if(!b) return "";
  const rows=b.parts.map((p) =>{
    const v = p.raw ? esc(p.v) : sg(p.v);
    const cls = p.raw ? "" : (p.v<0?" neg":(p.v===0?" zero":""));
    return html`<div class="bk-r"><b>${p.l}</b>${p.note ? html`<small>${p.note}</small>` : ''}<span class="v${cls}">${rawHtml(v)}</span></div>`;
  }).join("");
  return html`<div class="bk">${rawHtml(rows)}</div><div class="bk-t"><span>${rawHtml(b.totalLabel||"Total")}</span><b>${b.total}</b></div>${b.f ? html`<p class="bk-f">${rawHtml(b.f)}</p>` : ''}${rawHtml(oddsHTML(key))}${rawHtml(typeof __R.nmHTML==="function"?__R.nmHTML(key):"")}${key==="hp" ? html`${rawHtml(__R.hpModH())}<p class="bk-btns"><button type="button" class="btn press" data-status="1">Copy status for chat</button><button type="button" class="btn press" data-future="1">Levels up to 20</button></p>` : ''}${key==="pb" ? html`<p><button type="button" class="btn press" data-future="1">Levels up to 20</button></p>` : ''}${rawHtml(bdAbout(key))}${/^sense-/.test(key) ? html`<p class="bk-f" style="color:var(--faint)">Set by the builder. Change it there, then Apply.</p>` : __R.cuqOf(key) ? html`<p class="bk-f" style="color:var(--faint)">To set your own number, turn on Edit mode and tap it.</p>` : html`<p class="bk-f" style="color:var(--faint)">Change any of these in Edit.</p>`}`;
}
function showBD(key){ if(!B[key]) return; __R.showEntry({type:"bd",key:key},false); }

