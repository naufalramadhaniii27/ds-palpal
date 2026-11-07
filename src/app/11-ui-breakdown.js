import {cuqOf,hpModH,infoHTML,lateGet,nmHTML,showEntry} from "./00a-reg-late-ports.js";import {ABN} from "./02-data-default-character.js";
import {GLOSS} from "./03-data-glossary.js";
import {C} from "./04-logic-storage.js";
import {esc,sg} from "./05-logic-helpers.js";
import {B} from "./06-logic-derivation.js";
import {env} from "./00-env.js";
/* ================= BREAKDOWN ================= */
function bdAbout(key){
  let m=key.match(/^(ab|save|sk|ah|ad)-(.+)$/), spec=null, label="";
  if(m){ if(m[1]==="ab"){ spec="g:"+ABN[m[2]]; label=ABN[m[2]]; } else if(m[1]==="save"){ spec="g:Saving Throw"; label="a saving throw"; }
    else if(m[1]==="sk"){ const sk=C.skills[+m[2]]; if(sk&&GLOSS[sk.n]){ spec="g:"+sk.n; label=sk.n; } }
    else { spec="w:"+m[2]; label="this attack"; } }
  else { const map={ac:"Armor Class",init:"Initiative",speed:"Speed",pb:"Proficiency Bonus",hp:"Hit Points",carry:"Carrying Capacity",dc:"Grapple",dark:"Darkvision","pas-per":"Passive Perception","pas-ins":"Insight","pas-inv":"Investigation"}; if(map[key]){ spec="g:"+map[key]; label=map[key]; } }
  return spec ? '<p class="bk-about"><button type="button" class="lk" data-info="'+esc(spec)+'">What is '+esc(label)+'?</button></p>' : '';
}
env.__miInfo=function(s){ try{ return infoHTML(s); }catch(e){ return null; } }; env.__miBd=function(k){ try{ return B[k]||null; }catch(e){ return null; } };
/* T11 G4 N10 odds: the exact chance to reach common targets with this bonus, plain, with Advantage and with Disadvantage.
   Checks and saves: d20 + bonus at or above the DC (2024: a 1 or 20 on a check or save is not automatic).
   Attacks: a natural 20 always hits and a natural 1 always misses. Shown as whole percents, worked out, not estimated */
function oddsP(bon,t,atk){ let need=t-bon, p=(21-need)/20; if(atk){ p=Math.min(19,Math.max(1,21-need))/20; } return Math.max(0,Math.min(1,p)); }
function oddsHTML(key){ const b=B[key]; if(!b) return ""; const atk=/^ah-/.test(key); if(!/^(save-|sk-|ab-|ah-)/.test(key)&&key!=="init") return "";
  const bon=parseInt(String(b.total).replace("\u2212","-"),10); if(!isFinite(bon)||key==="init") return "";
  const T=atk?[12,15,18]:[10,15,20], pc=function(x){ return Math.round(x*100)+"%"; };
  const rows=T.map((t) =>{ const p=oddsP(bon,t,atk); return '<tr><th scope="row">'+(atk?"AC ":"DC ")+t+'</th><td>'+pc(p)+'</td><td>'+pc(1-(1-p)*(1-p))+'</td><td>'+pc(p*p)+'</td></tr>'; }).join("");
  return '<div class="odds"><b class="odds-h">'+(atk?"Chance to hit":"Chance to succeed")+'</b><table><thead><tr><th scope="col"><span class="vh">Target</span></th><th scope="col">Plain</th><th scope="col">Advantage</th><th scope="col">Disadvantage</th></tr></thead><tbody>'+rows+'</tbody></table></div>'; }
export function bdHTML(key){
  const b=B[key]; if(!b) return "";
  const rows=b.parts.map((p) =>{
    const v = p.raw ? esc(p.v) : sg(p.v);
    const cls = p.raw ? "" : (p.v<0?" neg":(p.v===0?" zero":""));
    return '<div class="bk-r"><b>'+esc(p.l)+'</b>'+(p.note?'<small>'+esc(p.note)+'</small>':'')+'<span class="v'+cls+'">'+v+'</span></div>';
  }).join("");
  return '<div class="bk">'+rows+'</div><div class="bk-t"><span>'+(b.totalLabel||"Total")+'</span><b>'+esc(b.total)+'</b></div>'+(b.f?'<p class="bk-f">'+b.f+'</p>':'')+oddsHTML(key)+(typeof lateGet("nmHTML")==="function"?nmHTML(key):"")+(key==="hp"?hpModH()+'<p class="bk-btns"><button type="button" class="btn press" data-status="1">Copy status for chat</button><button type="button" class="btn press" data-future="1">Levels up to 20</button></p>':'')+(key==="pb"?'<p><button type="button" class="btn press" data-future="1">Levels up to 20</button></p>':'')+bdAbout(key)+
    (/^sense-/.test(key)?'<p class="bk-f" style="color:var(--faint)">Set by the builder. Change it there, then Apply.</p>':(cuqOf(key)?'<p class="bk-f" style="color:var(--faint)">To set your own number, turn on Edit mode and tap it.</p>':'<p class="bk-f" style="color:var(--faint)">Change any of these in Edit.</p>'));
}
function showBD(key){ if(!B[key]) return; showEntry({type:"bd",key:key},false); }

