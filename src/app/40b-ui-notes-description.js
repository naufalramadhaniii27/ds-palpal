import {env} from "./00-env.js";/* Responsibility: notes sections and the Description page. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env (none used here). Shared names with other modules come from the imports below, late names through __R. */
import {NOTE_FIELDS} from "./03-data-glossary.js";
import {C,S} from "./04-logic-storage.js";
import {$,esc,rich} from "./05-logic-helpers.js";
import {__set_renderNotes,campName,renderNotes} from "./08-ui-render-sheet-and-actions.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {CHAR_FIELDS} from "./29-ui-ddb-look.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"noteSec",{get:function(){return noteSec;},set:function(v){noteSec=v;},configurable:true});
Object.defineProperty(__R,"renderDesc",{get:function(){return renderDesc;},set:function(v){renderDesc=v;},configurable:true});
/* ===== v31 p06 notes (B9, C8) ===== */
const NOTE_ICO={org:"ui-flag",allies:"ui-users",enemies:"sk-intimidation",backstory:"ui-book",other:"ui-pen",session:"tab-notes"};
function noteSec(f){ return '<section class="nsec"><label class="nsec-h" for="n-'+f.k+'">'+ico(NOTE_ICO[f.k]||"tab-notes","nsec-i")+'<span><b>'+f.l+'</b><small>'+esc(f.h)+'</small></span></label><textarea id="n-'+f.k+'" class="nsec-t grow" data-note="'+f.k+'" rows="2" placeholder="Write here">'+esc(S.notes[f.k]||"")+'</textarea></section>'; }
/* boxes grow with their text; browsers without field-sizing get the height from JavaScript */
const GROW_CSS=!!(env.CSS&&CSS.supports&&CSS.supports("field-sizing","content"));
function growOne(t){ if(GROW_CSS||!t||!t.isConnected) return; t.style.height="auto"; t.style.height=(t.scrollHeight+2)+"px"; }
function growAll(root){ if(GROW_CSS) return; Array.prototype.forEach.call((root||document).querySelectorAll("textarea.grow"),growOne); }
document.addEventListener("input",(e) =>{ if(e.target&&e.target.classList&&e.target.classList.contains("grow")) growOne(e.target); });
__set_renderNotes((function(f){ return function(){ const r=f.apply(this,arguments); requestAnimationFrame(() =>{ growAll(document.getElementById("notesBody")); growAll(document.getElementById("descBody")); }); return r; }; })(renderNotes));
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("#tabs .tab,#bnav button"); if(t) setTimeout(() =>{ growAll(document); },80); });
/* ===== v31 p07 description (B10, C8) ===== */
let DESC_MORE=false;
/* one field: the label above, the value as plain text until tapped. Same ids and data attributes as before (n-camp, n-align, n-ch_*, n-<note>, data-lang) */
function dField(id,lbl,val,attr,ta,ph){ const v=String(val||""); return '<div class="dfield'+(v.trim()?'':' empty')+(ta?' long':'')+'"><label for="'+id+'">'+lbl+'</label>'+
  (ta?'<textarea id="'+id+'" class="dval grow" '+attr+' rows="1" placeholder="'+esc(ph||"Tap to write")+'">'+esc(v)+'</textarea>':'<input id="'+id+'" class="dval field" '+attr+' value="'+esc(v)+'" placeholder="'+esc(ph||"Tap to write")+'" autocomplete="off">')+'</div>'; }
function renderDesc(){ const el=$("#descBody"); if(!el) return;
  const bgG=(C.features||[]).filter((g) =>{return /^Background/.test(g.g)})[0], miss=[], keep=function(v,name){ const e=!String(v||"").trim(); if(e) miss.push(name); return !e||DESC_MORE; };
  let h='<div class="dsec dcamp camp-f">'+dField("n-camp","Campaign",campName(),"",false,"Campaign name")+'<p class="dhint">Optional. Shown under your name, and My Characters can group by it.</p></div>';/* v30 RU133 */
  h+='<h3 class="noteh">'+ico("src-background")+'Background'+(C.bg?': '+esc(C.bg):'')+'</h3>'+(bgG?bgG.items.map((it) =>{return '<p class="bgl"><b>'+esc(it.n)+'.</b> '+rich(String(it.d).replace(/\*\*Your choice\.\*\*\s*/,""))+'</p>'}).join(''):'<p class="muted">No background chosen yet.</p>');
  const lg=[0,1,2].map((i) =>{ const v=S.lang[i]||""; if(i>0&&!keep(v,"Language "+(i+1))) return ""; return dField("n-lang"+i,i===0?"Language 1":"Language "+(i+1),v,'data-lang="'+i+'" aria-label="Language '+(i+1)+'"',false,i===0?"Common":"Language "+(i+1)); }).join("");
  h+='<h3 class="noteh">'+ico("ui-book")+'Languages</h3><p class="dhint">Common plus two of your choice. Rare or setting languages need DM approval.</p><div class="dgrid">'+lg+'</div>';
  const ch=(keep(S.align,"Alignment")?dField("n-align","Alignment",S.align||"","",false,"Optional in the 2024 rules"):"")+CHAR_FIELDS.map((f) =>{ const v=S.notes[f[0]]||""; return keep(v,f[1])?dField("n-"+f[0],f[1],v,'data-note="'+f[0]+'"',false):""; }).join("");
  h+='<h3 class="noteh">Characteristics</h3><div class="dgrid">'+ch+'<div class="dfield ro"><span class="dlbl">Size</span><p class="chsz">'+esc(C.size||"Medium")+'</p></div></div>';
  const pe=NOTE_FIELDS.filter((f) =>{ return /^(personality|ideal|bond|flaw|appearance)$/.test(f.k); }).map((f) =>{ const v=S.notes[f.k]||""; return keep(v,f.l)?dField("n-"+f.k,f.l,v,'data-note="'+f.k+'"',true,f.h):""; }).join("");
  if(pe) h+='<h3 class="noteh">'+ico("tab-description")+'Personality</h3><div class="dlist">'+pe+'</div>';
  if(miss.length) h+='<button type="button" class="dmore press" data-dmore="1" aria-expanded="'+DESC_MORE+'">'+ico(DESC_MORE?"ui-chev-d":"ui-plus","dmi")+'<span><b>'+(DESC_MORE?'Hide empty details':'Add details')+'</b><small>'+esc(miss.join(", "))+'</small></span></button>';
  h+='<div class="saved">Saved on this device as you type.</div>';
  el.innerHTML=h; requestAnimationFrame(() =>{ growAll(el); }); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-dmore]"); if(!b) return; e.preventDefault(); DESC_MORE=!DESC_MORE; renderDesc();
  if(DESC_MORE){ const f=document.querySelector("#descBody .dfield.empty .dval"); if(f) try{ f.focus({preventScroll:false}); }catch(er){} } });
