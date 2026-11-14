import {captureNativeActorIdentity,captureNativeActorFrame} from './lib/native-actor-frame.js';
import {endTattooEffect as endTattooBodyEffect} from '../data/lib/spellwrought-tattoo.js';
import {bindLive,cmbCast,cmbRe,lateGet,featAll,syncLU,used,renderConds,refreshEntry,showEntry,spPactLv,spRowLv,renderSpells,syncHP,renderAll} from "./00a-reg-late-ports.js";/* Responsibility: class levels, concentration and casting a spell (slots, upcast, quick cast). Split out of the former single file 32 in SOLID stage 9 (S); runs in the same order as before. */
import {C,S,save} from "./04-logic-storage.js";import {ask,esc,num,sg,toast} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {UNDO,toastU,undoMark} from "./32-logic-play-undo-actions.js";import {modeOn} from "./33-logic-play-rage-conditions.js";
import {attActive,eqOn} from "./05-logic-helpers.js";
import {occOf} from "./00a-reg-late-ports.js";
import {env} from "./00-env.js";
import {weaponFormMetadata,weaponFormUsable} from "../data/lib/weapon-form.js";
import {resolveObjectRepairProfile,evaluateRepairRequest} from "./lib/object-repair-runtime.js";
import {temporaryCantripStatus} from "./lib/temporary-cantrip-guard.js";
import {interventionPaymentAllowed} from "./32f-logic-divine-intervention.js";
bindLive("clsLvls",{get:function(){return clsLvls;}});
bindLive("concAuto",{get:function(){return concAuto;}});
bindLive("concCheck",{get:function(){return concCheck;}});
bindLive("concChip",{get:function(){return concChip;}});
bindLive("concEnd",{get:function(){return concEnd;}});
bindLive("concHead",{get:function(){return concHead;}});
bindLive("concOf",{get:function(){return concOf;}});
bindLive("hasFeat",{get:function(){return hasFeat;}});
bindLive("spCastH",{get:function(){return spCastH;}});
bindLive("spIx",{get:function(){return spIx;}});
bindLive("requestObjectRepairCast",{get:function(){return requestObjectRepairCast;}});
export function clsLvls(){ let o={}, t=String(C.clsLabel||""), m, re=/([A-Z][A-Za-z']+(?: [A-Z][A-Za-z']+)*) (\d+)/g; while((m=re.exec(t))) o[m[1]]=+m[2]; if(!Object.keys(o).length&&C.cls) o[C.cls]=D.level; return o; }
/* a reskin class counts under the class it copies (C.clsInh), so Rage, Aura and weapon mastery hooks keyed by the parent name also work for it */
export function lvOf(c){ const o=clsLvls(), ih=C.clsInh||{}; let t=o[c]||0; Object.keys(o).forEach((k) =>{ if(k!==c&&ih[k]===c) t+=o[k]; }); return t; }
export function hasFeat(n){ return featAll().some((x) =>{ return x.f.n===n; }); }

/* ---------- RU50 Concentration ---------- */
export var INCAP=["Incapacitated","Paralyzed","Petrified","Stunned","Unconscious"];
export function concOf(){ return S.conc&&S.conc.n?S.conc:null; }
function concSet(x,lv){ const o=concOf();if(o)endTaggedTattooConcentration(o);const m=(o&&o.n!==x.n)?"Concentration on "+o.n+" ended. ":""; S.conc={n:x.n,l:lv||x.l||0}; return m+"Concentrating on "+x.n+"."; }
export function concEnd(why,guard){if(guard&&!guard())return "";const o=concOf();if(!o)return "";endTaggedTattooConcentration(o);if(guard&&!guard())return "";delete S.conc;const post=guard?captureNativeActorFrame({allowCharacterClone:true}):null;if(o.n==="Shield of Faith")setTimeout(()=>{if(post&&!post())return;try{renderAll()}catch(error){}},0);return "Concentration on "+o.n+" ended"+(why?" ("+why+")":"")+"."}
export function setTattooConcentration(spell,sourceId,castId){S.conc={n:spell.n,l:spell.l,tattoo:{v:1,sourceId,castId}}}
function endTaggedTattooConcentration(concentration){const tag=concentration&&concentration.tattoo;if(!tag||tag.v!==1)return;const body=S.spellwroughtTattoos;if(!body||!Array.isArray(body.tattoos)||!body.tattoos.some(row=>row.sourceId===tag.sourceId&&row.castId===tag.castId&&row.phase==='active'))return;const ended=endTattooBodyEffect(body,tag.castId,{actualSpellEnded:true});if(ended.ok&&'body' in ended)S.spellwroughtTattoos=ended.body}
function concNotes(){ const n=[]; if(hasFeat("War Caster")) n.push("War Caster gives Advantage"); if(hasFeat("Eldritch Mind")) n.push("Eldritch Mind gives Advantage"); if(hasFeat("Bladesong")) n.push("while Bladesong is active, add your Intelligence modifier"); return n; }
function concDC(d){ return Math.min(30,Math.max(10,Math.floor(d/2))); }
function concentrationPromptCurrent(guard,original){return !guard||guard()&&concOf()===original}
function loseDamageConcentration(guard,original){
 if(!concentrationPromptCurrent(guard,original))return;const owner=guard?captureNativeActorIdentity():null,m=concEnd(undefined,owner);if(owner&&!owner())return;const post=guard?captureNativeActorFrame({allowCharacterClone:true}):null;
 save();if(post&&!post())return;renderConds();if(post&&!post())return;refreshEntry();if(post&&!post())return;if(UNDO)UNDO.A=null;toastU(m);
}
export function concCheck(d,guard){const o=concOf();if(!o||!(d>0)||guard&&!guard())return;const dc=concDC(d),nt=concNotes();
 ask("Concentration on "+o.n+": make a Constitution saving throw, DC "+dc+" (10 or half the damage, whichever is higher, up to 30). Your bonus is "+sg(D.save.CON)+"."+(nt.length?" "+nt.join(". ")+".":""),"Kept It",()=>{if(concentrationPromptCurrent(guard,o))toastU("Still concentrating on "+o.n+".")},['Lost It',()=>loseDamageConcentration(guard,o)]);
}
/* Undo also brings Concentration back; guarded HP prompts cannot affect another actor. */
/* a condition that includes Incapacitated, or 0 Hit Points, ends Concentration */
function concAuto(){ const o=concOf(); if(!o) return; const why=S.hp===0?"0 Hit Points":INCAP.filter((k) =>{ return S.cond[k]; })[0]; if(!why) return; const m=concEnd(why); save(); toast(m); }
function spIx(n){ return (C.spells||[]).findIndex((x) =>{ return x.n===n; }); }
export function concChip(){ const o=concOf(); if(!o) return ""; const i=spIx(o.n);
  return '<button type="button" class="chip on conc press"'+(i>=0?' data-info="sp:'+i+'"':'')+'>Concentrating: '+esc(o.n)+'</button><button type="button" class="chip conc-x press" data-concend="1" aria-label="End Concentration on '+esc(o.n)+'">✕</button>'; }
/* header: a line under the name (phone: .mini, computer: .office) */
function concHead(){ const o=concOf(); [".band .mini",".band .office > div"].forEach((sel,j) =>{ const m=document.querySelector(sel); if(!m) return; let b=m.querySelector(".conch");
  if(!o){ if(b) b.remove(); return; } if(!b){ b=document.createElement("button"); b.type="button"; b.className="conch press"; if(!j) b.id="concH"; m.appendChild(b); }
  const i=spIx(o.n); if(i>=0) b.setAttribute("data-info","sp:"+i); else b.removeAttribute("data-info"); b.innerHTML='<i aria-hidden="true">C</i>'+esc(o.n); b.setAttribute("aria-label","Concentrating on "+o.n+". Open the spell"); b.title="Concentrating on "+o.n; }); }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-concend],[data-concon]"); if(!t) return; e.preventDefault(); e.stopPropagation();
  if(t.hasAttribute("data-concend")){ const m=concEnd(); save(); renderConds(); refreshEntry(); if(m) toast(m); return; }
  const x=(C.spells||[])[+t.getAttribute("data-concon")]; if(!x) return;if(["fixedSpellSource","tattooSource","gemSpellcasting","storedSpellcasting","storedSpellSlotLevel"].some(key=>Object.prototype.hasOwnProperty.call(x,key))){toast("Use this source’s own controls to cast or resolve its original spell.");return}if(Object.prototype.hasOwnProperty.call(x,"temporaryCantrip")&&!temporaryCantripStatus(x,S.temporaryCantrips).allowed){toast("This temporary cantrip is no longer available.");return} const m2=concSet(x,lateGet("spLvSel")[x.n]!=null?lateGet("spLvSel")[x.n]:spRowLv(x)); save(); renderConds(); refreshEntry(); toast(m2); },true);

/* ---------- RU49 Cast and Use ---------- */
export function slotLeft(k){ const r=(D.res||[]).filter((q) =>{ return q.k===k; })[0]; return r?{r:r,left:(C.divineIntervention||S.interventionRecovery)&&!interventionPaymentAllowed(k)?0:r.max-used(r.k,r.max)}:null; }
function reWord(n){ return new RegExp("(^|[^A-Za-z])"+String(n).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"([^A-Za-z]|$)"); }
/* Limited Use rows that pay for a free cast of x (species, feat, or feature rows: same source, or the spell named in the row) */
function spUses(x){ if(!x.l) return [];
 const _spUsesStep1=spUsesStep1(x);
 const {ex}=_spUsesStep1;
 let {rows}=_spUsesStep1; if(ex.length) return ex;
  rows=rows.filter((r) =>{ return !(C.spells||[]).some((s) =>{ return s.n!==x.n&&reWord(s.n).test(r.n); }); });/* v21 N1: a row named after another spell is not this one */
  const lr=rows.filter((r) =>{ return /level (\d+) spell/.test(r.n); }); if(!lr.length) return rows; const want=x.gain||x.l, m=lr.filter((r) =>{ return +(/level (\d+) spell/.exec(r.n)[1])===want; });
  return m.length?m.concat(rows.filter((r) =>{ return !/level (\d+) spell/.test(r.n); })):rows; }
function spUsesStep1(x){
const src=String(x.src||""), rw=reWord(x.n);
  let rows=(D.res||[]).filter((r) =>{ if(/^s\d$|^pact$|^hd/.test(r.k)||r.item) return false; const f=r.f||"", own=r.own||"";
    const same=!!src&&((f&&(f===src||src.indexOf(f)===0||f.indexOf(src)===0))||(own&&src.indexOf(own)===0));
    return rw.test(r.n)||(same&&(f===src||/\bspell\b|Arcanum/i.test(r.n))); });
  /* v21 M1: a row naming the spell wins. Otherwise a "level N spell" row: N is the character level the species spell came at, or the spell level for a feat */
  const ex=rows.filter((r) =>{ return rw.test(r.n); });
  return /** @type {any} */ ({rows, ex});
}
export function spAtWill(x){ return !x.l||/At will/i.test(x.use||""); }
function spFormRequired(x){return !!x.itc&&((x.itc.it==="Dawnbringer"&&x.n==="Lesser Restoration")||(x.itc.it==="Duskcrusher"&&x.n==="Sunbeam"))}
function spFormItem(x,r){const items=(C.inv||[]).filter(it=>(it.key||it.n)===x.itc.it),bound=items.find(it=>it.chargeKey===r.k);if(bound)return bound;if(Number.isInteger(r.invIndex)){const it=(C.inv||[])[r.invIndex];return it&&(it.key||it.n)===x.itc.it&&(!it.chargeKey||it.chargeKey===r.k)?it:null}return items.length===1&&!items[0].chargeKey?items[0]:null}
function spFormReady(x,r){if(!spFormRequired(x))return true;const it=spFormItem(x,r);if(!it)return false;const formDefinition=weaponFormMetadata(x.itc.it,C.rs==="2014"?"2014":"2024");if(!weaponFormUsable(it,formDefinition,{equipped:eqOn(it),quantity:num(it.q,1),attuned:attActive(it)},C.inventoryFormV))return false;if(!it.key||typeof env.__bldFormInfo!=="function")return true;const info=env.__bldFormInfo(x.itc.it,C.name,occOf(it));return !!info&&info.formUsable===true}
function spItemOpts(x){const pools=(D.res||[]).filter(q=>q.item&&q.f===x.itc.it),form=spFormRequired(x);return (form?pools:pools.slice(0,1)).flatMap(r=>{const opts=spItemPoolOpts(x,r);if(form&&pools.length>1){const it=spFormItem(x,r);opts.forEach(q=>{q.lab+=' (copy '+(occOf(it)+1)+')'})}return opts})}
function spItemPoolOpts(x,r){ const c=x.itc, o=[]; if(!spFormReady(x,r)) return o; const left=r.max-used(r.k,r.max), lv0=c.lv;
  if(Array.isArray(c.c)){ for(let n=c.c[0];n<=c.c[1];n++){ const L=lv0+n-c.c[0]; o.push({k:r.k,lv:L,lab:c.it+", "+n+" charge"+(n>1?"s":"")+" (level "+L+")",left:left,free:1,need:n}); } }
  else o.push({k:r.k,lv:lv0,lab:c.it+", "+c.c+" charge"+(c.c===1?"":"s"),left:left,free:1,need:c.c});
  return o; }
export function qOk(q){ return q.left>=(q.need||1); }
export function ckOf(q){ return q.k+(q.need>1?"|"+q.need:""); }
/* Martyr (VSS24) Hit Point Spellcasting: a level 1+ Martyr spell costs one Spell Use plus Radiant damage by the slot level built
   (5, 10, 20, 30, 40). Merciful Healing (Burden of Mercy) makes its own spells free of the damage. The highest level is Max Spell Levels */
const MARTYR_HP=[0,5,10,20,30,40];
function martyrFeat(n){ return (C.features||[]).some((g) =>{ return (g.items||[]).some((i) =>{ return i.n===n; }); }); }
export function martyrMax(){ let m=0; (C.features||[]).forEach((g) =>{ (g.items||[]).forEach((i) =>{ if(i.n==="Max Spell Levels"){ const r=/:\s*(\d)/.exec(i.d||""); if(r) m=+r[1]; } }); }); return m; }
export function martyrCost(x,lv){ if(/Burden of Mercy/.test(String(x.src||""))&&martyrFeat("Merciful Healing")) return 0; return MARTYR_HP[lv]||0; }
function martyrOpts(x){ const o=[]; if(C.cls!=="Martyr"||!x.l||x.itc) return o; if(!/^(Martyr|Burden of)/.test(String(x.src||""))) return o;
  const r=slotLeft("r-spell-uses"), mx=martyrMax(); if(!r||!mx) return o;
  for(let L=x.l;L<=mx;L++){ const hp=martyrCost(x,L); o.push({k:"r-spell-uses",lv:L,lab:"Spell Use, level "+L+(hp?" ("+hp+" Radiant to you)":" (no damage, Merciful Healing)"),left:r.left,free:1}); }
  return o; }
export function spCastOpts(x){ const o=[], sc=C.spellcasting||{}; if(spAtWill(x)) return o; if(x.itc) return spItemOpts(x);
  const mo=martyrOpts(x); if(mo.length) return mo;
  for(let L=x.l;L<=9;L++){ const s=slotLeft("s"+L); if(s) o.push({k:"s"+L,lv:L,lab:"level "+L+" slot",left:s.left}); }
  const p=slotLeft("pact"); if(p&&sc.pact&&spPactLv()>=x.l) o.push({k:"pact",lv:spPactLv(),lab:"Pact slot (level "+spPactLv()+")",left:p.left});
  spUses(x).forEach((r) =>{ o.push({k:r.k,lv:x.l,lab:r.n,left:r.max-used(r.k,r.max),free:1}); });
  return o; }
const spStepSel={};
function spStepIx(i,sl){ let v=spStepSel[i]; if(v==null||v<0||v>=sl.length){ v=0; for(let k=0;k<sl.length;k++){ if(sl[k].left>0){ v=k; break; } } spStepSel[i]=v; } return v; }
function spCastH(x,i){if(x&&['fixedSpellSource','tattooSource','gemSpellcasting','storedSpellcasting','storedSpellSlotLevel'].some(key=>Object.prototype.hasOwnProperty.call(x,key)))return '<div class="info-d">Use this source’s own controls for its current casting permission or original cast receipt. Imported source rows cannot be cast from the ordinary spell card.</div>';let h='<div class="info-h">Cast</div><div class="spcast">', o=spCastOpts(x);
  if(spAtWill(x)) h+='<button type="button" class="btn pri press" data-cast="'+i+'" data-ck="">Cast <small>'+(x.l?'at will':'cantrip, no slot')+'</small></button>';
  else { const qb=function(q){ return '<button type="button" class="btn press'+(qOk(q)?'':' off')+'" data-cast="'+i+'" data-ck="'+esc(ckOf(q))+'" data-cl="'+q.lv+'"'+(qOk(q)?'':' disabled')+'>'+esc(q.free?"Use "+q.lab:"Cast with a "+q.lab)+' <small>'+q.left+' left</small></button>'; };
    /* v49: with two or more slot levels, one stepper picks the level and one Cast button casts */
    const sl=o.filter((q) =>{ return !q.free; }), fr=o.filter((q) =>{ return q.free; });
    if(sl.length>=2){ const si=spStepIx(i,sl), sq=sl[si];
      h+='<div class="spstep"><button type="button" class="spstep-b press" data-sstep="'+i+'|-1" aria-label="Lower slot level"'+(si<=0?' disabled':'')+'>\u2212</button><div class="spstep-v"><small>Slot</small><b>'+esc(sq.lab)+'</b><i>'+sq.left+' left</i></div><button type="button" class="spstep-b press" data-sstep="'+i+'|1" aria-label="Higher slot level"'+(si>=sl.length-1?' disabled':'')+'>+</button></div>'+qb(sq).replace('btn press','btn pri press'); fr.forEach((q) =>{ h+=qb(q); }); }
    else o.forEach((q) =>{ h+=qb(q); });
    if(!o.length) h+='<p class="muted">No spell slots or uses for this spell yet.</p>'; else if(!o.some(qOk)) h+='<p class="muted">Nothing left to cast it with. A rest restores slots and uses.</p>'; }
  if(x.rit&&x.l) h+='<button type="button" class="btn press" data-cast="'+i+'" data-ck="rit">Cast as a Ritual <small>no slot, 10 minutes longer</small></button>';
  if(x.conc){ const c=concOf(); h+=(c&&c.n===x.n)?'<button type="button" class="btn press" data-concend="1">End Concentration</button>':'<button type="button" class="btn press" data-concon="'+i+'">Concentrate on this spell</button>'; }
  return h+'</div>'+(x.conc?'<p class="muted spcn">Concentration spell. Casting it ends any other spell you concentrate on.</p>':''); }
function spFormCommitAllowed(x,k,nd){if(!spFormRequired(x)||spItemOpts(x).some(q=>q.k===k&&(q.need||1)===nd))return true;toast("Hold "+x.itc.it+" with its radiant "+(x.itc.it==="Duskcrusher"?"head":"blade")+" active to cast "+x.n+".");return false}
function spCastPayment(k){if(k&&k.indexOf("|")>0){const parts=k.split("|");return {k:parts[0],nd:+parts[1]||1}}return {k,nd:1}}
const repairSessions=new WeakSet(),repairCasts=new WeakSet();
export function currentRepairProfile(index){return resolveObjectRepairProfile(C,(C.spells||[])[index],S)}
export function createObjectRepairSession(index,root){const spell=(C.spells||[])[index];if(!spell||spell.n!=="Mending"||!root)return null;const session={index,root,character:C,state:S,owner:C.name,spellSignature:JSON.stringify(spell),profileSignature:currentRepairProfile(index).signature,committed:false};repairSessions.add(session);return session}
function repairRequestCurrent(request){const view=request.session;if(!repairSessions.has(view)||view.committed||view.character!==C||view.state!==S||view.owner!==C.name||!view.root.isConnected)return {ok:false,reason:"stale-cast"};const spell=(C.spells||[])[view.index],profile=currentRepairProfile(view.index);if(JSON.stringify(spell)!==view.spellSignature||profile.signature!==view.profileSignature)return {ok:false,reason:"stale-source"};return evaluateRepairRequest(profile,request.target,request.declarations,modeOn("rage"))}
export function requestObjectRepairCast(options){if(!options||!options.session)return {ok:false,reason:"stale-cast"};const request={session:options.session,target:structuredClone(options.target),declarations:structuredClone(options.declarations),onCommitted:options.onCommitted};const result=repairRequestCurrent(request);if(!result.ok)return result;repairCasts.add(request);try{castDo(request.session.index,"",0,false,request)}finally{repairCasts.delete(request)}return request.certificate||request.failure||{ok:false,reason:"cast-refused"}}
function spRepairCastAllowed(index,k,lv,spell,request){if(spell.n!=="Mending")return true;if(!repairCasts.has(request)){const open=lateGet("openObjectRepair");if(typeof open==="function")open(index,k,lv);else toast("Repair controls are still loading. Try again.");return false}const result=repairRequestCurrent(request);request.result=result;if(!result.ok)request.failure=result;return result.ok}
function spRepairCommitted(request){if(!repairCasts.has(request))return;request.session.committed=true;request.certificate={ok:true,committed:true,result:request.result,owner:C.name,index:request.session.index,character:C,state:S};if(typeof request.onCommitted==="function")request.onCommitted(request.certificate)}
const temporalCasts=new WeakSet();
function temporaryCastContext(index,spell){const status=temporaryCantripStatus(spell,S.temporaryCantrips);if(!status.allowed)return null;const view={character:C,state:S,cid:C.cid,id:C.id,name:C.name,index,spell,root:typeof document.querySelector==="function"?document.querySelector("#sheet.on"):null,signature:JSON.stringify(spell),permission:status.signature};temporalCasts.add(view);return view}
function temporaryCastCurrent(view,index,spell){return temporalCasts.has(view)&&(!view.root||view.root.isConnected&&view.root.classList.contains("on"))&&view.character===C&&view.state===S&&view.cid===C.cid&&view.id===C.id&&view.name===C.name&&view.index===index&&view.spell===spell&&view.signature===JSON.stringify(spell)&&temporaryCantripStatus(spell,S.temporaryCantrips).allowed&&temporaryCantripStatus(spell,S.temporaryCantrips).signature===view.permission}
function temporaryCastAllowed(view,index,spell){return !view||temporaryCastCurrent(view,index,spell)}
export function castDo(i,k,lv,ok,repair,temporal){const spell=(C.spells||[])[i];if(!spell)return;if(["fixedSpellSource","tattooSource","gemSpellcasting","storedSpellcasting","storedSpellSlotLevel"].some(key=>Object.prototype.hasOwnProperty.call(spell,key))){toast("Use this source’s own controls to cast or resolve its original spell.");return}if(temporal||Object.prototype.hasOwnProperty.call(spell,"temporaryCantrip")){temporal=temporal||temporaryCastContext(i,spell);if(!temporal||!temporaryCastCurrent(temporal,i,spell)){toast("This temporary cantrip changed or expired. Open its current spell card.");return}}castCurrentSpell(i,k,lv,ok,repair,temporal)}
function castPaymentMessage(x,k,lv,s,nd,msg){
  if(s){ S.used[k]=num(S.used[k],0)+nd; if(k==="pact"){ msg+=" with a Pact slot"; lateGet("spLvSel")[x.n]=+lv; } else if(/^s\d$/.test(k)){ msg+=" with a level "+k.slice(1)+" slot"; lateGet("spLvSel")[x.n]=+lv; } else { msg+=" ("+s.r.n+(nd>1?", "+nd+" charges":"")+")"; if(x.itc) lateGet("spLvSel")[x.n]=+lv; } }
  else if(k==="rit") msg+=" as a Ritual";
  return msg;
}
function castMartyrPayment(x,k,lv,s,nd,msg){
  if(k==="r-spell-uses"&&C.cls==="Martyr"){ const hp=martyrCost(x,+lv||x.l); if(hp){ S.hp=Math.max(0,num(S.hp,0)-hp); msg+=", level "+(+lv||x.l)+", you take "+hp+" Radiant (not from Temporary Hit Points)"; try{ syncHP(); }catch(er){} } else msg+=", level "+(+lv||x.l)+", no damage"; lateGet("spLvSel")[x.n]=+lv||x.l; }
  return msg;
}
function castMagicWeapon(x,k,lv,s,nd,msg){
  if(x.n==="Magic Weapon"){ const w=(C.attacks||[]).filter((a) =>{ return a.n!=="Unarmed Strike"&&!/^Cantrip/.test(a.sub||"")&&/^\d+ ft$|^5 ft/.test(a.range||"5 ft"); })[0]||(C.attacks||[]).filter((a) =>{ return a.n!=="Unarmed Strike"; })[0]; if(w){ S.mw={w:w.n,l:+lv||x.l}; msg+=". "+w.n+" gets +"+((+lv||x.l)>=6?3:(+lv||x.l)>=4?2:1)+" to attack and damage until you rest"; } }
  return msg;
}
function castCurrentSpell(i,k,lv,ok,repair,temporal){ const x=(C.spells||[])[i]; if(!x) return; const payment=spCastPayment(k);k=payment.k;let s=null,nd=payment.nd;
  if(!spRepairCastAllowed(i,k,lv,x,repair))return;
  if(!spFormCommitAllowed(x,k,nd))return;
  if(!ok&&modeOn("rage")){ ask("You are raging, and Rage stops you from casting spells. Cast "+x.n+" anyway?","Cast",() =>{ castDo(i,k,lv,true,repair,temporal); }); return; }/* v22 i4 */
  if(k&&k!=="rit"){ s=slotLeft(k); if(!s||s.left<nd){ toast("Nothing left to cast "+x.n+" with. A rest restores slots and uses."); return; } }
  if(!temporaryCastAllowed(temporal,i,x))return;undoMark("Cast "+x.n); let msg="Cast "+x.n;
  msg=castPaymentMessage(x,k,lv,s,nd,msg);msg=castMartyrPayment(x,k,lv,s,nd,msg);msg=castMagicWeapon(x,k,lv,s,nd,msg);
  msg+="."; if(x.conc) msg+=" "+concSet(x,+lv||x.l);
  save(); if(x.n==="Magic Weapon"||x.conc||k==="r-spell-uses"){ try{ renderAll(); }catch(er){} } syncLU(); renderSpells(); renderConds(); refreshEntry(); toastU(msg); try{ cmbCast(x.n); save(); cmbRe(); }catch(er){} spRepairCommitted(repair); }
/* the CAST or USE badge in the Spells list: one way to cast it, cast now. Several (slot levels, Pact, free use): open the spell to choose */
export function quickCast(i){ const x=(C.spells||[])[i]; if(!x) return; if(spAtWill(x)){ castDo(i,"",0); return; }
  const o=spCastOpts(x), av=o.filter(qOk);
  if(av.length===1&&!x.rit){ castDo(i,ckOf(av[0]),av[0].lv); return; }
  if(!av.length&&!x.rit){ toast("Nothing left to cast "+x.n+" with. A rest restores slots and uses."); return; }
  showEntry({type:"info",spec:"sp:"+i},false); }
document.addEventListener("click",(e) =>{ const st=e.target.closest&&e.target.closest("[data-sstep]"); if(st&&!st.disabled){ e.preventDefault(); e.stopPropagation(); const pp=st.getAttribute("data-sstep").split("|"), ii=+pp[0]; spStepSel[ii]=(spStepSel[ii]||0)+(+pp[1]); showEntry({type:"info",spec:"sp:"+ii},false); return; }
  const q=e.target.closest&&e.target.closest("[data-qcast]"); if(q){ e.preventDefault(); e.stopPropagation(); quickCast(+q.getAttribute("data-qcast")); return; }
  const b=e.target.closest&&e.target.closest("[data-cast]"); if(!b||b.disabled) return; e.preventDefault(); e.stopPropagation(); castDo(+b.getAttribute("data-cast"),b.getAttribute("data-ck")||"",+b.getAttribute("data-cl")||0); },true);

export function gemNativeSourcePaymentOptions(spell){if(!spell||["fixedSpellSource","tattooSource","gemSpellcasting","storedSpellcasting","storedSpellSlotLevel"].some(key=>Object.prototype.hasOwnProperty.call(spell,key)))return [];if(spAtWill(spell))return [{key:'',level:spell.l,available:true,amount:0,label:spell.l?'At will':'Cantrip',remaining:null}];return spCastOpts(spell).map(option=>({key:ckOf(option),level:option.lv,available:qOk(option),amount:option.need||1,label:option.lab,remaining:option.left}))}
export function gemNativeSourcePaymentReady(spell,key,level){if(!spell)return false;const parsed=spCastPayment(key);return gemNativeSourcePaymentOptions(spell).some(option=>option.key===key&&option.level===level&&option.available)&&spFormCommitAllowed(spell,parsed.k,parsed.nd)}
