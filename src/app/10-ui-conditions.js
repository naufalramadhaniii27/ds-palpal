import {normalizeTarget,TARGET_TYPES,TARGET_ALIGNMENTS} from "../data/lib/attack-target.js";
import {bindLive,concAuto,concChip,concHead,ico,lateGet,lintChip,modeAuto,modeChips,modeClean,renderAll,undoMark} from "./00a-reg-late-ports.js";import {HB_CONDS,HB_SRC,STD_CONDS} from "./02-data-default-character.js";
import {GLOSS,exHelp,exTxt,x14} from "./03-data-glossary.js";
import {C,S,save} from "./04-logic-storage.js";
import {$,esc} from "./05-logic-helpers.js";
import {vbSync} from "./09-ui-hit-points-playbar-death-saves.js";

import {html,raw,render} from "./lib/html.js";import {env} from "./00-env.js";
bindLive("activeConds",{get:function(){return activeConds;}});
bindLive("renderConds",{get:function(){return renderConds;}});
/* ================= CONDITIONS ================= */
export function activeConds(){
  const list=[];
  STD_CONDS.forEach((c) =>{ if(S.cond[c]) list.push({k:c}); });
  HB_CONDS.forEach((c) =>{ if(S.cond[c.k]) list.push({k:c.k,hb:true,extra:c.stack?(" ×"+S.burn):(c.num&&S.jinx?" ("+esc(S.jinx)+")":"")}); });
  return list;
}
export function renderConds(){
  const list=activeConds();
  concAuto();/* v21 RU50 */ modeClean(); modeAuto();/* v22 M2, m3 */
  const any=list.length||S.exh;/* v30 B3, RU84: a titled row; Exhaustion is a chip too; empty is a clear Add condition button */
  const ex=(c) =>raw(c.extra||"");/* extra is already escaped text, other callers add it to strings */
  render(html`<span class="cond-l">Conditions</span>${raw(typeof lateGet("lintChip")==="function"?lintChip():"")}${raw(modeChips())}${raw(concChip())}${S.exh?html`<button type="button" class="chip on exh-c press" data-info="g:Exhaustion">Exhaustion ${S.exh}</button>`:null}${list.map((c) =>html`<button type="button" class="chip on cnd press${c.hb?" hb":""}" data-info="${"g:"+c.k}">${raw(env.__artIc?env.__artIc("condition",c.k):"")}${c.k}${ex(c)}</button>`)}<button type="button" class="chip add press" id="condOpen">${any?"Edit":"Add condition"}</button>${S.exh?html`<button type="button" class="exh-note tx" data-info="g:Exhaustion">Exhaustion ${S.exh}: ${exTxt(S.exh)}</button>`:null}`,$("#conds")); concHead(); renderFxT(); vbSync();
}
export function condHTML(){
  let h = '<div class="exh"><div><b><button type="button" class="tx" data-info="g:Exhaustion">Exhaustion</button></b><small>'+exHelp()+'</small></div><span class="stepper"><button type="button" data-exh="-1" aria-label="Decrease">−</button><output>'+S.exh+'</output><button type="button" data-exh="1" aria-label="Increase">+</button></span></div>';
  /* v30 B12: icon cards that light up when active. The name toggles, the i button opens the rule */
  function card(k,d,hb,extra){ const on=!!S.cond[k]; return '<div class="cc'+(on?' on':'')+(extra?' wide':'')+'"><button type="button" class="tog cc-b press" data-c="'+k+'" aria-pressed="'+on+'">'+ico("cond-"+k.toLowerCase())+'<span class="cc-n">'+k+'</span>'+(hb?'<span class="flag hb">HB</span>':'')+'<span class="cc-s" aria-hidden="true">'+ico("ui-check")+'</span></button><button type="button" class="cc-i press" data-info="g:'+k+'" aria-label="About '+k+'" title="About '+k+'">'+ico("ui-info")+'</button>'+(extra||'')+'</div>'; }
  h += '<span class="src" style="margin-bottom:8px">'+(x14()?"PHB-2014, Appendix A":"PHB-2024, Rules Glossary")+'</span><p class="cc-help">Tap a condition to turn it on or off. The i button shows its rules.</p>';
  h += '<div class="ccg">'+STD_CONDS.map((c) =>{ return card(c,GLOSS[c].d,false); }).join("")+'</div>';
  h += '<span class="src" style="margin:12px 0 8px">'+HB_SRC+'</span>';
  h += '<div class="ccg">'+HB_CONDS.map((c) =>{
    let ex="";
    if(c.stack) ex='<div class="hbx">Stacks <span class="stepper"><button type="button" data-burn="-1" aria-label="Remove a stack">−</button><output>'+S.burn+'</output><button type="button" data-burn="1" aria-label="Add a stack">+</button></span></div>';
    if(c.num) ex='<div class="hbx"><label for="jinxN">Recorded number</label><input id="jinxN" class="jin" type="number" min="1" max="20" inputmode="numeric" value="'+esc(S.jinx)+'"></div>';
    return card(c.k,c.d,true,ex);
  }).join("")+'</div>';
  return h;
}

/* FX toggles UI: "Active effects" row. C.fxToggles = [{id,label,on,src}] comes from the Logic side, state lives in S.fxT (missing = defaults) */
export function fxList(){ const L=(C&&C.fxToggles)||(lateGet("D")&&lateGet("D").fxToggles)||[]; const T=(S&&S.fxT)||{}; return Array.isArray(L)?L.filter((t) =>t&&t.id).map((t) =>Object.assign({},t,{on:T[t.id]!=null?!!T[t.id]:!!t.on})):[]; }
function targetOptions(values,value){return '<option value="">Unknown</option>'+values.map((v) =>'<option value="'+esc(v)+'"'+(v===value?' selected':'')+'>'+esc(v==="Creature"?'Creature (type unknown)':v)+'</option>').join("")}
function attackTargetHTML(rows){const t=normalizeTarget(S.attackTarget),tags=[];
 rows.forEach((r) =>{const p=r.target;if(p.tag&&!tags.some((x) =>x.id===p.tag))tags.push({id:p.tag,label:p.tagLabel})});
 return '<fieldset class="fxt-target"><legend>Current attack target</legend><p>Conditional attack bonuses use these details. Leave unknown details blank.</p><div class="fxt-target-grid">'+
 '<label>Target type<select data-atarget="type" aria-label="Target type">'+targetOptions(TARGET_TYPES,t.type)+'</select></label>'+
 '<label>Alignment<select data-atarget="alignment" aria-label="Target alignment">'+targetOptions(TARGET_ALIGNMENTS,t.alignment)+'</select></label>'+
 '<label>Current HP<input type="number" min="0" step="1" data-atarget="hp" aria-label="Target current HP" value="'+(t.hp==null?'':t.hp)+'"></label>'+
 '<label>Maximum HP<input type="number" min="1" step="1" data-atarget="maxHp" aria-label="Target maximum HP" value="'+(t.maxHp==null?'':t.maxHp)+'"></label></div>'+
 tags.map((x) =>'<label class="fxt-target-tag"><input type="checkbox" data-atarget="tag" data-atarget-tag="'+esc(x.id)+'"'+(t.tags.includes(x.id)?' checked':'')+'>'+esc(x.label)+'</label>').join("")+'</fieldset>'}
export function renderFxT(){const el=$("#fxT");if(!el)return;const L=fxList(),targets=(C&&C.fxTargets)||[];
 if(!L.length&&!targets.length){el.hidden=true;el.innerHTML="";return}el.hidden=false;
 el.innerHTML=(L.length?'<span class="cond-l" id="fxTl">Active effects</span><div class="fxt-g" role="group" aria-labelledby="fxTl">'+L.map((t) =>'<button type="button" role="switch" class="fxchip press'+(t.on?' on':'')+'" aria-checked="'+(!!t.on)+'" data-fxt="'+esc(t.id)+'"><i class="fxchip-k" aria-hidden="true"></i><span class="fxchip-t"><b>'+esc(t.consume?(t.on?'End: ':'Drink: ')+t.label:t.label)+'</b>'+(t.src?'<small>'+esc(t.src)+'</small>':'')+'</span></button>').join("")+'</div>':'')+(targets.length?attackTargetHTML(targets):"")}
document.addEventListener("click",async(e) =>{ const b=e.target.closest&&e.target.closest("[data-fxt]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  const id=b.getAttribute("data-fxt"),state=S;if(!env.__bldFxToggle&&env.__bldNeed)await env.__bldNeed();if(S!==state)return;
  const t=fxList().filter((x) =>x.id===id)[0]; if(!t) return; const nv=!t.on;
  if(t.consume&&nv){undoMark("Drink "+t.consume.item);if(!env.__bldConsume||!env.__bldConsume(id))return;S.fxT=S.fxT||{};S.fxT[id]=true;save();renderAll();return;}
  undoMark((nv?"Turn on ":"Turn off ")+t.label); S.fxT=S.fxT&&typeof S.fxT==="object"?S.fxT:{}; S.fxT[id]=nv; save(); try{ if(env.__bldFxToggle) env.__bldFxToggle(id,nv); }catch(_){ } renderAll();
  const nb=document.querySelector('[data-fxt="'+id.replace(/"/g,'\\"')+'"]'); if(nb) nb.focus({preventScroll:true}); },true);

document.addEventListener("change",async(e) =>{const el=e.target.closest&&e.target.closest("[data-atarget]");if(!el)return;
 const key=el.getAttribute("data-atarget"),tag=el.getAttribute("data-atarget-tag"),value=el.value,checked=el.checked,state=S;
 if(!["type","alignment","hp","maxHp","tag"].includes(key))return;
 if(!env.__bldFxToggle&&env.__bldNeed)await env.__bldNeed();if(S!==state)return;
 undoMark("Change attack target");const t=normalizeTarget(S.attackTarget);
 if(key==="tag"){t.tags=t.tags.filter((x) =>x!==tag);if(checked)t.tags.push(tag)}else t[key]=value;
 S.attackTarget=normalizeTarget(t);save();if(env.__bldFxToggle)env.__bldFxToggle(null);renderAll();
 const fresh=Array.from(document.querySelectorAll("[data-atarget]")).find((x) =>x.getAttribute("data-atarget")===key&&x.getAttribute("data-atarget-tag")===tag);if(fresh)fresh.focus({preventScroll:true});
},true);
