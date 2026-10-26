/* ================= HELPERS ================= */
function $(s,r){return (r||document).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
function esc(t){return String(t==null?"":t).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function rich(t){ return esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,function(m,k,l){ var key=k.replace(/&#39;/g,"'").replace(/&amp;/g,"&"); if(GLOSS[key]||(LIBR&&LIB_RULES[key])) return '<button type="button" class="lk" data-info="g:'+esc(key)+'">'+(l||k)+'</button>'; var fsp=featSpec(key); return fsp?'<button type="button" class="lk" data-info="'+fsp+'">'+(l||k)+'</button>':(l||k); }); }
function sg(n){return (n>=0?"+":"\u2212")+Math.abs(n)}
function num(v,d){ var n=parseFloat(v); return isNaN(n)?(d||0):n; }
function clamp(n,a,b){return Math.max(a,Math.min(b,n))}
function fmtW(n){return (Math.round(n*10)/10).toString()}
function mod(s){return Math.floor((s-10)/2)}
var toastT=null;
function toast(msg){ var t=$("#toast"); t.classList.remove("act"); var tk=typeof toastKind==="function"?toastKind(msg):"ok"; t.innerHTML=(typeof ico==="function"?ico("toast-"+tk,"tico"):"")+'<span>'+esc(msg)+'</span>'; t.setAttribute("data-kind",tk);/* v24 RU73 q */ t.classList.add("on"); clearTimeout(toastT); toastT=setTimeout(function(){t.classList.remove("on")},2400); }
/* ask(): dialog konfirmasi DOM versi sheet. Pengganti confirm(), yang diblokir di artifact. Tanda tangan sama dengan ask() di builder: ask(pesan, labelOk, cb). Cancel, klik di luar kotak, atau Escape menutup tanpa memanggil cb. */
function ask(msg,ok,cb,alt){ var w=document.createElement("div"); w.className="ask"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true");/* v18: alt = [label, callback] adds a third choice */
  w.innerHTML='<div class="askb"><p'+(/\n/.test(msg)?' class="askl"':'')+'>'+esc(msg)+'</p><div class="askr'+(alt?' ask3':'')+'"><button type="button" class="btn press" data-no="1">Cancel</button>'+(alt?'<button type="button" class="btn press" data-alt="1">'+esc(alt[0])+'</button>':'')+'<button type="button" class="btn pri press" data-yes="1">'+esc(ok)+'</button></div></div>';
  var prev=document.activeElement;
  function close(){ w.remove(); document.removeEventListener("keydown",onKey,true); if(prev&&prev.focus) try{prev.focus({preventScroll:true})}catch(e){} }
  function onKey(e){ if(e.key==="Escape"){ e.stopPropagation(); close(); } }
  w.addEventListener("click",function(e){ var b=e.target.closest("button"); if(e.target===w||(b&&b.dataset.no)){ close(); return; } if(b&&b.dataset.yes){ close(); cb(); } if(b&&b.dataset.alt&&alt){ close(); alt[1](); } });
  document.addEventListener("keydown",onKey,true);
  document.body.appendChild(w); var y=w.querySelector("[data-yes]"); if(y) y.focus({preventScroll:true}); }

/* Equip link: an inventory item and the attack rows named "<item>" or "<item> (thrown)" share one equip state.
   A linked item with no saved eq (hand-filled sheets) counts as equipped. An unequipped item hides its attack rows. */
function eqInvOf(n){ n=String(n||""); var inv=C.inv||[], f=function(b){ return inv.filter(function(i){ return (i.key||i.n)===b||i.n===b; })[0]||null; }; return f(n)||(/ \(thrown\)$/.test(n)?f(n.replace(/ \(thrown\)$/,"")):null); }
function eqLinked(i){ var ks=[i.key||i.n,i.n]; return (C.attacks||[]).some(function(a){ return ks.some(function(k){ return a.n===k||a.n===k+" (thrown)"; }); }); }
function eqOn(i){ return i.eq==null?eqLinked(i):!!i.eq; }
/* Qty control in the item popup, like D&D Beyond: - and + change the box, Apply saves. 0 keeps the item. */
function qtyCtl(it,ix){ var q=num(it.q,1); return '<div class="iqty"><small>Qty</small><div class="iqty-r"><button type="button" class="iqb btn press" data-iqd="-1" aria-label="Decrease quantity">\u2212</button><input class="iqi" type="number" inputmode="numeric" min="0" step="1" value="'+q+'" data-iqv="'+q+'" aria-label="Quantity"><button type="button" class="iqb btn press" data-iqd="1" aria-label="Increase quantity">+</button><button type="button" class="iqa btn press" data-iqa="'+esc(it.key||it.n)+'"'+(ix!=null?' data-iix="'+ix+'"':'')+' disabled>Apply</button></div></div>'; }
function atkOn(a){ if(a&&a.of){ var o=eqInvOf(a.of); if(o&&!eqOn(o)) return false; } var i=eqInvOf(a.n); return !i||eqOn(i); }/* v32 RL51: a row a weapon carries (Pole Strike) follows that weapon */
/* RU22: index of the attack row named like the item ("Dagger", "Celurit (Sickle)", "Longsword, +1"), or -1. The "(thrown)" row is not used */
/* RU17/RU18: an inventory action goes through the builder hooks only for items the builder made (toSheet() writes "key" on every item; the sheet never does).
   A hand-filled sheet whose character also has a builder save keeps its own C: the hooks would replace the whole sheet with toSheet() and drop
   hand-written attacks, resources and actions without the Apply warning. */
/* RU29: copy the armor result of the builder to a hand-filled sheet. Only when the build agreed with the sheet before the change (same AC).
   Speed and Stealth disadvantage follow the same rule, each on its own. Returns true if AC was copied */
/* M18: attuned magic items on this sheet */
function attMaxC(){ return +C.attMax||3; }/* v19 RL43 */
function attCount(){ return (C.inv||[]).filter(function(i){ return i.att&&eqOn(i); }).length; }
function armorFx(fx,it){ var j=JSON.stringify; if(!fx||j(C.ac)!==j(fx.b0.ac)) return false;
  C.ac=JSON.parse(j(fx.b1.ac));
  /* M18: saving throw bonus and ability scores from magic items follow too, when the sheet still has the builder's values */
  if(fx.b0.sb&&j(C.saveBonus||[])===j(fx.b0.sb)){ if(fx.b1.sb.length) C.saveBonus=JSON.parse(j(fx.b1.sb)); else delete C.saveBonus; }
  if(fx.b0.ab&&C.abilities) ABK.forEach(function(k){ if(j(C.abilities[k])===j(fx.b0.ab[k])) C.abilities[k]=JSON.parse(j(fx.b1.ab[k])); });
  /* V13-2: keep the hand-written Speed source while armor changes Speed, put it back when Speed returns to that value */
  if(C.speed===fx.b0.speed&&fx.b1.speed!==fx.b0.speed){ if(!C.speedSrc0) C.speedSrc0={v:C.speed,s:C.speedSrc||""}; C.speed=fx.b1.speed;
    if(C.speedSrc0.v===C.speed){ C.speedSrc=C.speedSrc0.s; delete C.speedSrc0; } else C.speedSrc=fx.b1.speedSrc; }
  var sk=(C.skills||[]).filter(function(k){return k.n==="Stealth"})[0]; if(sk&&(sk.dis||"")===fx.b0.stealth){ if(fx.b1.stealth) sk.dis=fx.b1.stealth; else delete sk.dis; }
  (C.inv||[]).forEach(function(x){ if(x!==it&&fx.off.indexOf(x.key||x.n)>=0) x.eq=false; });
  return true; }
function viaBld(nm){ var it=(C.inv||[]).filter(function(x){return (x.key||x.n)===nm})[0]; return !!(it&&it.key&&window.__bldHas&&window.__bldHas(nm,C.name)); }
/* N2: hand-filled sheet path also updates the saved build of the same character (B.inv only), so a later Apply keeps the change */
function bldSync(nm,ch){ try{ if(window.__bldSync) window.__bldSync(nm,C.name,ch); }catch(e){} }
/* N1: a builder-made sheet that differs from the builder (Edit changes, or builder changes not applied yet) asks before an Inventory action rebuilds it.
   No difference (sheet just applied): no dialog. Cancel: nothing changes */
function bldGuard(go){ var d=[]; try{ if(window.__bldDiff) d=window.__bldDiff(C)||[]; }catch(e){ d=[]; } if(!d.length){ go(); return; }
  ask("The sheet and the builder differ. "+d.join(". ")+". Changing this item rebuilds the sheet from the builder, so these sheet entries are replaced. Cancel keeps the sheet as it is.","Continue",go); }
/* RU17-3: the item an Inventory button points at. data-iix (index in C.inv) wins when that item still has the name, else the first item with the name */
function invAt(nm,ix){ var L=C.inv||[], it=(ix!=null&&ix!==""&&L[+ix]&&(L[+ix].key||L[+ix].n)===nm)?L[+ix]:null; return it||L.filter(function(x){return (x.key||x.n)===nm})[0]||null; }
function itemAtkIx(it){ var ks=[it.key||it.n,it.n], L=C.attacks||[]; for(var i=0;i<L.length;i++){ if(ks.indexOf(L[i].n)>=0) return i; } return -1; }
/* RU22: item detail html with Damage and Proficient taken from the sheet attack row, so the popup matches the Actions tab.
   Hand-filled sheets get this html from the builder (__itemMeta), which knows nothing about the sheet. Display only, C.inv is not changed */
function itemHtml(it){ var h=String(it.html||""), ix=itemAtkIx(it), d=ix>=0?D.atk[ix]:null; if(!d||h.indexOf("<dt>Damage</dt>")<0) return h;
  return h.replace(/(<dt>Damage<\/dt><dd>)[^<]*(<\/dd>)/, function(m,a,b){ return a+esc(d.dmg)+b; }).replace(/(<dt>Proficient<\/dt><dd>)[^<]*(<\/dd>)/, function(m,a,b){ return a+(C.attacks[ix].prof?"Yes":"No")+b; })
    /* N5: chosen mastery follows the sheet attack row (m is set only for a chosen mastery) */
    .replace(/<p class="mst">(?:\u2605 )?(<b>Mastery: [^<]*<\/b>)(?: <small>\(not one of your chosen masteries\)<\/small>)?/, function(m,b){ var on=!!C.attacks[ix].m; return '<p class="mst">'+(on?"\u2605 ":"")+b+(on?"":' <small>(not one of your chosen masteries)</small>'); }); }
/* Hand-written "Attack with X and Y" actions hide when a linked weapon they name is unequipped ("Celurit (Sickle)" also matches "Celurit"). */
/* RU17-2: the action names are split on "," and "and", and an item matches a whole name (or its short form without the parentheses) */
function actOn(a){ var m=/^Attack with (.+)$/.exec(a.n||""); if(!m) return true; var ns=m[1].split(/\s*,\s*|\s+and\s+/).map(function(s){return s.trim()}).filter(Boolean), sh=function(s){return s.replace(/\s*\(.*\)$/,"")};
  return !(C.inv||[]).some(function(i){ if(!eqLinked(i)||eqOn(i)) return false; var nm=i.key||i.n; return ns.some(function(x){ return x===nm||x===i.n||sh(x)===sh(nm)||(sh(nm)&&x===sh(nm)); }); }); }
/* RU19: [[sense, index in C.senses]] for entries with a name. C.senses is optional (sheets made before v9 have none) */
function senseList(){ return (Array.isArray(C.senses)?C.senses:[]).map(function(s,i){return [s,i]}).filter(function(x){return x[0]&&x[0].n}); }
