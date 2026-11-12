import {bindLive,cuK,cuNum,featSpec,ico,lateGet,toastKind,xlink} from "./00a-reg-late-ports.js";import {ABK} from "./02-data-default-character.js";
import {GLOSS} from "./03-data-glossary.js";
import {C,S} from "./04-logic-storage.js";
import {temporaryCantripStatus} from "./lib/temporary-cantrip-guard.js";
import {env} from "./00-env.js";
import {weaponFormMetadata,weaponFormUsable} from "../data/lib/weapon-form.js";
import {nativeWieldMinimum,evaluateWieldMinimum,explainWieldMinimum} from "../data/lib/wield-minimum.js";
bindLive("ask",{get:function(){return ask;}});
bindLive("esc",{get:function(){return esc;}});
bindLive("num",{get:function(){return num;}});
bindLive("toast",{get:function(){return toast;}});
/* ================= HELPERS ================= */
export function $(s,r){return (r||document).querySelector(s)}
export function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
export function sheetRootActive(root){if(!root||!root.isConnected)return false;const container=typeof root.closest==="function"?root.closest("#sheet"):null;return !container||!!(container.classList&&container.classList.contains("on"))}
export function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,(c) =>{return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
export function rich(t){ return xl_(esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,l) =>{ const key=k.replace(/&#39;/g,"'").replace(/&amp;/g,"&"); if(GLOSS[key]||(lateGet("LIBR")&&lateGet("LIB_RULES")[key])) return '<button type="button" class="lk" data-info="g:'+esc(key)+'">'+(l||k)+'</button>'; const fsp=featSpec(key); return fsp?'<button type="button" class="lk" data-info="'+fsp+'">'+(l||k)+'</button>':(l||k); })); }
function xl_(h){ return typeof lateGet("xlink")==="function"?xlink(h):h; }
export function sg(n){return (n>=0?"+":"\u2212")+Math.abs(n)}
export function num(v,d){ const n=parseFloat(v); return isNaN(n)?(d||0):n; }
export function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
export function fmtW(n){return (Math.round(n*10)/10).toString()}
export function mod(s){return Math.floor((s-10)/2)}
export var toastT=null;
export function hpWord(n){ return n===1?"Hit Point":"Hit Points"; }

export function toastPic(msg){ if(!env.__artVig) return ""; const m=String(msg||""), id=/^Download started|^Backup text copied/.test(m)?"backup-done":/not a character|can't be read|newer version of the app|code is not a character/.test(m)?"import-failed":/^New version ready/.test(m)?"update":""; return id?env.__artVig("state",id,28):""; }
export function toast(msg){ const t=$("#toast"); t.classList.remove("act"); const tk=typeof lateGet("toastKind")==="function"?toastKind(msg):"ok"; t.innerHTML=(toastPic(msg)||(typeof lateGet("ico")==="function"?ico("toast-"+tk,"tico"):""))+'<span>'+esc(msg)+'</span>'; t.setAttribute("data-kind",tk);/* v24 RU73 q */ t.classList.add("on"); topLayer(t); clearTimeout(toastT); toastT=setTimeout(() =>{t.classList.remove("on")},2400); } env.__toast=toast;/* test hook */
/* ask(): dialog konfirmasi DOM versi sheet. Pengganti confirm(), yang diblokir di artifact. Tanda tangan sama dengan ask() di builder: ask(pesan, labelOk, cb). Cancel, klik di luar kotak, atau Escape menutup tanpa memanggil cb. */
/* T11 A5: the top layer. Dialogs and the toast open as manual popovers, so they sit above every z-index (sheet panels, the dice tray,
   effects) without a z-index race. A manual popover never closes by itself, Escape and clicks stay with the caller. Browsers without
   popovers keep the old fixed position and z-index. The look stays the same: the popover defaults of the browser are reset in 02-hero.css */
function topLayer(el){ try{ if(el&&el.showPopover&&el.isConnected){ if(!el.hasAttribute("popover")) el.setAttribute("popover","manual"); if(el.matches(":popover-open")) el.hidePopover(); el.showPopover(); } }catch(e){} return el; }
env.__topLayer=topLayer;
export function ask(msg,ok,cb,alt){ const w=document.createElement("div"); w.className="ask"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true");/* v18: alt = [label, callback] adds a third choice */
  w.innerHTML='<div class="askb"><p'+(/\n/.test(msg)?' class="askl"':'')+'>'+esc(msg)+'</p><div class="askr'+(alt?' ask3':'')+'"><button type="button" class="btn press" data-no="1">Cancel</button>'+(alt?'<button type="button" class="btn press" data-alt="1">'+esc(alt[0])+'</button>':'')+'<button type="button" class="btn pri press" data-yes="1">'+esc(ok)+'</button></div></div>';
  const prev=document.activeElement;
  function close(){ w.remove(); document.removeEventListener("keydown",onKey,true); if(prev&&prev.focus) try{prev.focus({preventScroll:true})}catch(e){} }
  function onKey(e){ if(e.key==="Escape"){ e.stopPropagation(); close(); } }
  w.addEventListener("click",(e) =>{ const b=e.target.closest("button"); if(e.target===w||(b&&b.dataset.no)){ close(); return; } if(b&&b.dataset.yes){ close(); cb(); } if(b&&b.dataset.alt&&alt){ close(); alt[1](); } });
  document.addEventListener("keydown",onKey,true);
  document.body.appendChild(w); topLayer(w); const y=w.querySelector("[data-yes]"); if(y) y.focus({preventScroll:true}); }

/* Equip link: an inventory item and the attack rows named "<item>" or "<item> (thrown)" share one equip state.
   A linked item with no saved eq (hand-filled sheets) counts as equipped. An unequipped item hides its attack rows. */
export function eqInvOf(n){ n=String(n||""); const inv=C.inv||[], f=function(b){ return inv.filter((i) =>{ return (i.key||i.n)===b||i.n===b; })[0]||null; }; return f(n)||(/ \(thrown\)$/.test(n)?f(n.replace(/ \(thrown\)$/,"")):null); }
export function eqLinked(i){ const ks=[i.key||i.n,i.n]; return (C.attacks||[]).some((a) =>{ return ks.some((k) =>{ return a.n===k||a.n===k+" (thrown)"; }); }); }
export function eqOn(i){ return i.eq==null?eqLinked(i):!!i.eq; }
/* Qty control in the item popup, like D&D Beyond: - and + change the box, Apply saves. 0 keeps the item. */
export function qtyCtl(it,ix){ const q=num(it.q,1); return '<div class="iqty"><small>Qty</small><div class="iqty-r"><button type="button" class="iqb btn press" data-iqd="-1" aria-label="Decrease quantity">\u2212</button><input class="iqi" type="number" inputmode="numeric" min="0" step="1" value="'+q+'" data-iqv="'+q+'" aria-label="Quantity"><button type="button" class="iqb btn press" data-iqd="1" aria-label="Increase quantity">+</button><button type="button" class="iqa btn press" data-iqa="'+esc(it.key||it.n)+'"'+(ix!=null?' data-iix="'+ix+'"':'')+' disabled>Apply</button></div></div>'; }
/* Cached attacks can predate the builder's next rebuild. Read raw forms here;
   a deduplicated weapon row remains usable while any matching copy is usable. */
function formAttackOn(name){const key=String(name||"").replace(/ \(thrown\)$/,"");const items=(C.inv||[]).filter(it=>((it.key||it.n)===key||it.n===key)&&weaponFormMetadata(it.key||it.n,C.rs==="2014"?"2014":"2024"));if(!items.length)return null;return items.some(it=>weaponFormUsable(it,weaponFormMetadata(it.key||it.n,C.rs==="2014"?"2014":"2024"),{equipped:eqOn(it),quantity:num(it.q,1),attuned:attActive(it)},C.inventoryFormV))}
/* The current actor's Customize score overlay is read without cuApply's CU0 writes. */
export function currentAbilityScores(){const scores={};ABK.forEach(k=>{const ability=C.abilities&&C.abilities[k]||{base:10,bonus:[]};let score=num(ability.base,10)+(ability.bonus||[]).reduce((total,b)=>total+num(b.v),0);const custom=cuK("n:ab-"+k);if(custom){const bonus=cuNum(custom.b),override=cuNum(custom.o);if(bonus)score+=bonus;if(override!=null)score=override}scores[k]=score});return scores}
export function weaponWieldInfo(it){const rule=nativeWieldMinimum(it&&(it.key||it.n));if(!rule)return {rule:null,allowed:true,unmet:[],text:""};const currentScores=currentAbilityScores(),result=evaluateWieldMinimum(rule,currentScores);return Object.assign({rule,currentScores,text:explainWieldMinimum(result)},result)}
function wieldAttackOn(name){const key=String(name||"").replace(/ \(thrown\)$/,"");const items=(C.inv||[]).filter(it=>((it.key||it.n)===key||it.n===key)&&nativeWieldMinimum(it.key||it.n));if(!items.length)return null;return items.some(it=>eqOn(it)&&num(it.q,1)>0&&weaponWieldInfo(it).allowed)}
function carriedAttackOn(name){const wield=wieldAttackOn(name);if(wield!==null)return wield;const form=formAttackOn(name);if(form!==null)return form;const it=eqInvOf(name);return !it||eqOn(it)}
export function temporarySpellOn(row){return temporaryCantripStatus(row,S.temporaryCantrips).allowed}
export function atkOn(a){if(!temporarySpellOn(a))return false;if(a&&a.of&&!carriedAttackOn(a.of))return false;return carriedAttackOn(a.n)}/* v32 RL51: a row a weapon carries (Pole Strike) follows that weapon */
/* RU22: index of the attack row named like the item ("Dagger", "Celurit (Sickle)", "Longsword, +1"), or -1. The "(thrown)" row is not used */
/* RU17/RU18: an inventory action goes through the builder hooks only for items the builder made (toSheet() writes "key" on every item; the sheet never does).
   A hand-filled sheet whose character also has a builder save keeps its own C: the hooks would replace the whole sheet with toSheet() and drop
   hand-written attacks, resources and actions without the Apply warning. */
/* RU29: copy the armor result of the builder to a hand-filled sheet. Only when the build agreed with the sheet before the change (same AC).
   Speed and Stealth disadvantage follow the same rule, each on its own. Returns true if AC was copied */
/* M18: attuned magic items on this sheet */
export function attMaxC(){const n=+C.attMax;return Number.isFinite(n)&&n>0?Math.floor(n):3}/* v19 RL43 */
export function attOn(i){if(i.attOptional)return i.attuned===true;return !!i.att&&(typeof i.attuned==="boolean"?i.attuned:eqOn(i))}
export function attActive(i){return !!(i.att||i.attOptional)&&num(i.q,1)>0&&(typeof i.attunedActive==="boolean"?i.attunedActive:attOn(i))}
export function attCount(){return (C.inv||[]).filter((i)=>attActive(i)&&num(i.q,1)>0).length}
export function armorFx(fx,it){ const j=JSON.stringify; if(!fx||j(C.ac)!==j(fx.b0.ac)) return false;
  armorFxStep1(j, fx);
  armorFxStep2(it, fx);
  return true; }
function armorFxStep1(j, fx){
  C.ac=JSON.parse(j(fx.b1.ac));
  /* M18: saving throw bonus and ability scores from magic items follow too, when the sheet still has the builder's values */
  if(fx.b0.sb&&j(C.saveBonus||[])===j(fx.b0.sb)){ if(fx.b1.sb.length) C.saveBonus=JSON.parse(j(fx.b1.sb)); else delete C.saveBonus; }
  if(fx.b0.ab&&C.abilities) ABK.forEach((k) =>{ if(j(C.abilities[k])===j(fx.b0.ab[k])) C.abilities[k]=JSON.parse(j(fx.b1.ab[k])); });
  /* V13-2: keep the hand-written Speed source while armor changes Speed, put it back when Speed returns to that value */
  if(C.speed===fx.b0.speed&&fx.b1.speed!==fx.b0.speed){ if(!C.speedSrc0) C.speedSrc0={v:C.speed,s:C.speedSrc||""}; C.speed=fx.b1.speed;
    if(C.speedSrc0.v===C.speed){ C.speedSrc=C.speedSrc0.s; delete C.speedSrc0; } else C.speedSrc=fx.b1.speedSrc; }
  const sk=(C.skills||[]).filter((k) =>{return k.n==="Stealth"})[0]; if(sk&&(sk.dis||"")===fx.b0.stealth){ if(fx.b1.stealth) sk.dis=fx.b1.stealth; else delete sk.dis; }
}
function armorFxStep2(it, fx){
  (C.inv||[]).forEach((x) =>{ if(x!==it&&fx.off.indexOf(x.key||x.n)>=0) x.eq=false; });
}
export function viaBld(nm){ const it=(C.inv||[]).filter((x) =>{return (x.key||x.n)===nm})[0]; return !!(it&&it.key&&env.__bldHas&&env.__bldHas(nm,C.name)); }
/* N2: hand-filled sheet path also updates the saved build of the same character (B.inv only), so a later Apply keeps the change */
export function bldSync(nm,ch){ try{ if(env.__bldSync) env.__bldSync(nm,C.name,ch); }catch(e){} }
/* N1: a builder-made sheet that differs from the builder (Edit changes, or builder changes not applied yet) asks before an Inventory action rebuilds it.
   No difference (sheet just applied): no dialog. Cancel: nothing changes */
export function bldGuard(go){ let d=[]; try{ if(env.__bldDiff) d=env.__bldDiff(C)||[]; }catch(e){ d=[]; } if(!d.length){ go(); return; }
  ask("The sheet and the builder differ. "+d.join(". ")+". Changing this item rebuilds the sheet from the builder, so these sheet entries are replaced. Cancel keeps the sheet as it is.","Continue",go); }
/* RU17-3: the item an Inventory button points at. data-iix (index in C.inv) wins when that item still has the name, else the first item with the name */
export function invAt(nm,ix){ const L=C.inv||[], it=(ix!=null&&ix!==""&&L[+ix]&&(L[+ix].key||L[+ix].n)===nm)?L[+ix]:null; return it||L.filter((x) =>{return (x.key||x.n)===nm})[0]||null; }
function itemAtkIx(it){ const ks=[it.key||it.n,it.n], L=C.attacks||[]; for(let i=0;i<L.length;i++){ if(ks.indexOf(L[i].n)>=0) return i; } return -1; }
/* RU22: item detail html with Damage and Proficient taken from the sheet attack row, so the popup matches the Actions tab.
   Hand-filled sheets get this html from the builder (__itemMeta), which knows nothing about the sheet. Display only, C.inv is not changed */
function formItemTypeHtml(it,h,ix){const row=(C.attacks||[])[ix];if(!row||!row.type||!weaponFormMetadata(it.key||it.n,C.rs==="2014"?"2014":"2024"))return h;return h.replace(/(<dt>Damage Type<\/dt><dd>)[^<]*(<\/dd>)/,(m,a,b)=>a+esc(row.type)+b)}
export function itemHtml(it){ const ix=itemAtkIx(it),h=formItemTypeHtml(it,String(it.html||""),ix),d=ix>=0?lateGet("D").atk[ix]:null; if(!d||h.indexOf("<dt>Damage</dt>")<0) return h;
  return h.replace(/(<dt>Damage<\/dt><dd>)[^<]*(<\/dd>)/, (m,a,b) =>{ return a+esc(d.dmg)+b; }).replace(/(<dt>Proficient<\/dt><dd>)[^<]*(<\/dd>)/, (m,a,b) =>{ return a+(C.attacks[ix].prof?"Yes":"No")+b; })
    /* N5: chosen mastery follows the sheet attack row (m is set only for a chosen mastery) */
    .replace(/<p class="mst">(?:\u2605 )?(<b>Mastery: [^<]*<\/b>)(?: <small>\(not one of your chosen masteries\)<\/small>)?/, (m,b) =>{ const on=!!C.attacks[ix].m; return '<p class="mst">'+(on?"\u2605 ":"")+b+(on?"":' <small>(not one of your chosen masteries)</small>'); }); }
/* Hand-written "Attack with X and Y" actions hide when a linked weapon they name is unequipped ("Celurit (Sickle)" also matches "Celurit"). */
/* RU17-2: the action names are split on "," and "and", and an item matches a whole name (or its short form without the parentheses) */
export function actOn(a){ const m=/^Attack with (.+)$/.exec(a.n||""); if(!m) return true; const ns=m[1].split(/\s*,\s*|\s+and\s+/).map((s) =>{return s.trim()}).filter(Boolean), sh=function(s){return s.replace(/\s*\(.*\)$/,"")};
  return !(C.inv||[]).some((i) =>{ if(!eqLinked(i)||eqOn(i)) return false; const nm=i.key||i.n; return ns.some((x) =>{ return x===nm||x===i.n||sh(x)===sh(nm)||(sh(nm)&&x===sh(nm)); }); }); }
/* RU19: [[sense, index in C.senses]] for entries with a name. C.senses is optional (sheets made before v9 have none) */
export function senseList(){ return (Array.isArray(C.senses)?C.senses:[]).map((s,i) =>{return [s,i]}).filter((x) =>{return x[0]&&x[0].n}); }

export function __set_toastT(v){ return toastT=v; }
