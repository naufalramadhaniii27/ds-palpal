/* ================= PORTRAIT ================= */
function syncPortrait(){ var p=$("#photo"), pc=$("#phCls"); if(pc){ var ck=icoCls(C.clsLabel||C.cls||""); pc.innerHTML=(ck&&typeof ICO==="object"&&ICO&&ICO[ck])?ico(ck):""; pc.hidden=!pc.innerHTML; }/* v30 B4 */ if(S.portrait){ p.style.backgroundImage='url("'+S.portrait+'")'; p.classList.add("has"); } else { p.style.backgroundImage=""; p.classList.remove("has"); } }
$("#photo").addEventListener("click",function(){ $("#avFile").click(); });
$("#avFile").addEventListener("change",function(){
  var f=this.files&&this.files[0]; if(!f) return;
  var r=new FileReader();
  r.onload=function(){ var img=new Image();
    img.onload=function(){ var W=320,H=400, c=document.createElement("canvas"); c.width=W; c.height=H; var ratio=W/H, sw=img.width, sh=img.height, sx=0, sy=0;
      if(sw/sh>ratio){ sw=sh*ratio; sx=(img.width-sw)/2; } else { sh=sw/ratio; sy=(img.height-sh)/4; }
      c.getContext("2d").drawImage(img,sx,sy,sw,sh,0,0,W,H); try{ S.portrait=c.toDataURL("image/jpeg",.86); }catch(e){ S.portrait=""; } save(); syncPortrait(); toast("Portrait updated"); };
    img.onerror=function(){ toast("This image can't be read. Choose a JPG or PNG file."); }; img.src=r.result; };
  r.readAsDataURL(f); this.value="";
});

/* ================= TABS + PAGER ================= */
var mq = window.matchMedia("(max-width:759px)");
var PAGES = ["p-main","p-skills","p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"];/* v23 */
var activeTab = "p-actions";
function setTab(id, focus, instant){
  if(!instant&&!setTab.vt&&setTab.morph&&document.startViewTransition&&!mq.matches&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches)&&id!==activeTab){ setTab.vt=1; var vt=document.startViewTransition(function(){ setTab(id,focus,true); }); vt.finished.then(function(){ setTab.vt=0; },function(){ setTab.vt=0; }); return; }/* v29: smooth morph between tabs */
  activeTab=id;
  $$("#tabs .tab").forEach(function(t){ var on=t.getAttribute("data-tab")===id; t.setAttribute("aria-selected",on); t.tabIndex=on?0:-1; if(on&&focus) t.focus(); });
  ["p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"].forEach(function(p){ var el=document.getElementById(p), on=p===id;
    if(!mq.matches){ if(on&&el.hidden){ el.hidden=false; el.classList.remove("enter"); void el.offsetWidth; el.classList.add("enter"); } else if(!on){ el.hidden=true; } } });
  moveTabInd(instant); var ts=$('#tabs .tab[aria-selected="true"]'), tb=$("#tabs"); if(ts&&tb&&tb.scrollWidth>tb.clientWidth){ var l=ts.offsetLeft, r=l+ts.offsetWidth; if(l<tb.scrollLeft) tb.scrollLeft=Math.max(0,l-16); else if(r>tb.scrollLeft+tb.clientWidth) tb.scrollLeft=r-tb.clientWidth+16; }/* v23: seven tabs */
}
var tabX=0, tabW=100;
function paintInd(){ $("#tabInd").style.transform="translateX("+tabX+"px) scaleX("+(tabW/100)+")"; }
function moveTabInd(instant){ var t=$('#tabs .tab[aria-selected="true"]'); if(!t||!t.offsetWidth) return; var x=t.offsetLeft+10, w=t.offsetWidth-20;
  spring("tabX", x, function(v){ tabX=v; paintInd(); }, {k:300, zeta:.86, instant:instant}); spring("tabW", w, function(v){ tabW=v; paintInd(); }, {k:300, zeta:.86, instant:instant}); }
$("#tabs").addEventListener("click",function(e){ var t=e.target.closest(".tab"); if(t) setTab(t.getAttribute("data-tab")); });
$("#tabs").addEventListener("keydown",function(e){ var tabs=$$("#tabs .tab"), i=tabs.findIndex(function(t){return t.getAttribute("aria-selected")==="true"});
  if(e.key==="ArrowRight"||e.key==="ArrowLeft"){ e.preventDefault(); var n=(i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length; setTab(tabs[n].getAttribute("data-tab"),true); } });
document.addEventListener("click",function(e){ var t=e.target.closest("[data-ieqs],[data-idel],[data-invman]"); if(!t) return; if(t.dataset.invman){ if(window.__bldEquip) window.__bldEquip(); return; } if(t.dataset.ieqs){ e.stopPropagation(); var nm=t.dataset.ieqs; var ai=invAt(nm,t.dataset.iix); if(ai&&ai.att&&!eqOn(ai)&&attCount()>=attMaxC()){ toast("You can attune to at most "+attMaxC()+" magic items. Unattune one first."); if(typeof closeSheet==="function"&&t.closest("#sheet")) closeSheet(); return; }/* M18 */ if(viaBld(nm)) bldGuard(function(){ window.__bldToggleEq(nm,occOf(invAt(nm,t.dataset.iix))); }); else { var it=invAt(nm,t.dataset.iix); if(it){ var lk=eqLinked(it), ne=!eqOn(it), fx=null, acd=false;
  /* RU29: armor or Shield on a hand-filled sheet: AC from the builder, no dialog. Manual entries stay */
  if(!lk&&window.__bldArmor){ try{ fx=window.__bldArmor({C:JSON.parse(JSON.stringify(C)),lang:S.lang},nm,ne); }catch(er){ fx=null; } }
  it.eq=ne; if(fx) acd=armorFx(fx,it); else bldSync(nm,{eq:it.eq,occ:occOf(it)}); saveC(); renderAll();
  toast(lk?(it.eq?"Equipped. Its attack is back on the Actions tab.":"Unequipped. Its attack is hidden from the Actions tab."):acd?((it.eq?"Equipped. ":"Unequipped. ")+"Armor Class is now "+D.ac+"."):(it.eq?"Equipped. Open Build and Apply to recalculate AC and attacks.":"Unequipped. Open Build and Apply to recalculate AC and attacks.")); } } if(typeof closeSheet==="function"&&t.closest("#sheet")) closeSheet(); return; } if(t.dataset.idel){ if(t.dataset.sure!=="1"){ t.dataset.sure="1"; t.textContent="TAP AGAIN TO DELETE"; return; } if(viaBld(t.dataset.idel)){ var dn=t.dataset.idel; bldGuard(function(){ undoMark("Delete "+dn); window.__bldRemove(dn,occOf(invAt(dn,t.dataset.iix))); toastU("Deleted "+dn+"."); }); } else { undoMark("Delete "+t.dataset.idel); var dIt=invAt(t.dataset.idel,t.dataset.iix); bldSync(t.dataset.idel,{del:1,occ:occOf(dIt)}); C.inv=(C.inv||[]).filter(function(x){return x!==dIt}); if(dIt&&ctOf(dIt.n)&&!C.inv.some(function(x){ return invKey(x)===invKey(dIt); })) C.inv.forEach(function(x){ if(x.in===invKey(dIt)) delete x.in; });/* v32 RU134 */ saveC(); renderAll(); toastU("Deleted "+t.dataset.idel+"."); } if(typeof closeSheet==="function") closeSheet(); } }, true);
/* Qty Apply: hand-filled sheet writes C.inv[].q, builder sheet goes through __bldSetQty (B.inv), then the popup redraws in place. */
function iqSync(box){ var r=box.closest(".iqty-r"), a=r&&r.querySelector("[data-iqa]"), v=parseInt(box.value,10); if(a) a.disabled=isNaN(v)||v<0||v===+box.getAttribute("data-iqv"); }
document.addEventListener("click",function(e){ var b=e.target.closest("[data-iqd],[data-iqa]"); if(!b||!b.closest("#sheet")) return; e.stopPropagation(); var box=b.closest(".iqty-r").querySelector(".iqi");
  if(b.dataset.iqd){ var v=parseInt(box.value,10); box.value=Math.max(0,(isNaN(v)?0:v)+(+b.dataset.iqd)); iqSync(box); return; }
  if(b.disabled) return; var nm=b.dataset.iqa, q=Math.max(0,parseInt(box.value,10)||0);
  var bix=b.dataset.iix, fin=function(){ var ix=(bix!=null&&C.inv&&C.inv[+bix]&&(C.inv[+bix].key||C.inv[+bix].n)===nm)?+bix:(C.inv||[]).findIndex(function(x){return (x.key||x.n)===nm}); if(ix>=0){ var r=infoHTML("it:"+ix); $("#sheetBody").innerHTML=r.h; if(navStack.length) navStack[navStack.length-1]={type:"info",spec:"it:"+ix}; }
    toast("Quantity set to "+q); };
  if(viaBld(nm)&&window.__bldSetQty){ bldGuard(function(){ window.__bldSetQty(nm,q,occOf(invAt(nm,bix))); fin(); }); return; } /* N1 */
  var it=invAt(nm,bix); if(!it) return; it.q=q; bldSync(nm,{q:q,occ:occOf(it)}); saveC(); renderAll(); fin(); },true);
document.addEventListener("input",function(e){ if(e.target.classList&&e.target.classList.contains("iqi")) iqSync(e.target); });
/* m6: typed points left for a pool resource */
document.addEventListener("change",function(e){ var t=e.target; if(!(t.classList&&t.classList.contains("pli"))) return; var k=t.getAttribute("data-k"), r=(D.res||[]).filter(function(q){return q.k===k})[0]; if(!r) return; var lf=clamp(Math.round(num(t.value,r.max-used(k,r.max))),0,r.max); S.used[k]=r.max-lf; save(); syncLU(); t.value=lf; });
document.addEventListener("keydown",function(e){ if(e.key==="Enter"&&e.target.classList&&e.target.classList.contains("iqi")){ e.preventDefault(); var a=e.target.closest(".iqty-r").querySelector("[data-iqa]"); if(a&&!a.disabled) a.click(); } });
$("#invBody").addEventListener("click",function(e){ var b=e.target.closest("[data-invf]"); if(!b) return; invF=b.getAttribute("data-invf"); renderInv(); });
$("#actBody").addEventListener("click",function(e){ var b=e.target.closest("[data-actf]"); if(!b) return; actF=b.getAttribute("data-actf"); renderActions(); });
$("#featBody").addEventListener("input",function(e){ var t=e.target; if(t.id!=="featQ") return; featQ=t.value; var pos=t.selectionStart; renderFeat(); var qq=document.getElementById("featQ"); if(qq){ qq.focus(); qq.setSelectionRange(pos,pos);} });
$("#featBody").addEventListener("click",function(e){ var b=e.target.closest("[data-featf]"); if(!b) return; featF=b.getAttribute("data-featf"); renderFeat(); });
$("#spBody").addEventListener("click",function(e){ var b=e.target.closest("[data-spf]"); if(!b) return; e.stopPropagation(); spF=b.getAttribute("data-spf"); renderSpells(); });
$("#spBody").addEventListener("input",function(e){ var t=e.target; if(t.id!=="spQ") return; spQ=t.value; var pos=t.selectionStart; renderSpells(); var qq=document.getElementById("spQ"); if(qq){ qq.focus(); qq.setSelectionRange(pos,pos);} });
var pager=$("#pager"), bInd=$("#bInd"), navBtns=$$("#bnav button"), curPage=0, raf=0;
function onPagerScroll(){ if(raf) return; raf=requestAnimationFrame(function(){ raf=0; if(!mq.matches) return; var w=pager.clientWidth||1, f=pager.scrollLeft/w; bIndSet(f*100);/* v31 p11 */
  var idx=clamp(Math.round(f),0,PAGES.length-1); if(idx!==curPage){ curPage=idx; navBtns.forEach(function(b,i){ b.classList.toggle("on",i===idx); if(i===idx) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); }); navShow(idx); pCur(idx); }/* v31 p13 */ }); }
/* v23: the bottom bar scrolls sideways (9 pages); keep the current button in view */
function navShow(i){ var bn=document.querySelector(".bnav"), b=navBtns[i]; if(!bn||!b) return; var l=b.offsetLeft, r=l+b.offsetWidth; if(l<bn.scrollLeft+8) bn.scrollTo({left:Math.max(0,l-24),behavior:REDUCE?"auto":"smooth"}); else if(r>bn.scrollLeft+bn.clientWidth-8) bn.scrollTo({left:r-bn.clientWidth+24,behavior:REDUCE?"auto":"smooth"}); }
pager.addEventListener("scroll",onPagerScroll,{passive:true});
function goPage(i,smooth){ if(!mq.matches) return; pager.scrollTo({left:i*pager.clientWidth, behavior:(smooth&&!REDUCE)?"smooth":"auto"}); }
navBtns.forEach(function(b){ b.addEventListener("click",function(){ var i=+b.getAttribute("data-go"); if(i===curPage){ document.getElementById(PAGES[i]).scrollTo({top:0,behavior:REDUCE?"auto":"smooth"}); } goPage(i,true); }); });
$("#hpChip").addEventListener("click",function(){ goPage(0,true); });
function onMode(){ if(mq.matches){ ["p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"].forEach(function(p){ document.getElementById(p).hidden=false; }); requestAnimationFrame(function(){ goPage(curPage,false); onPagerScroll(); }); } else { setTab(activeTab,false,true); } }
if(mq.addEventListener) mq.addEventListener("change",onMode); else if(mq.addListener) mq.addListener(onMode);
var rT=null;
window.addEventListener("resize",function(){ clearTimeout(rT); rT=setTimeout(function(){ if(mq.matches) goPage(curPage,false); else moveTabInd(true); },80); });

function spEffect(sp){var m=/(\d+d\d+(?:\s*\+\s*\d+)?)\s+([A-Z][a-z]+)/.exec(sp.sum||"");if(m)return m[1]+" "+m[2];var c=/\b(Blinded|Charmed|Frightened|Incapacitated|Invisible|Paralyzed|Poisoned|Prone|Restrained|Stunned|Unconscious)\b/.exec(sp.sum||"");return c?c[1]:"Utility"}
/* ================= RD19 SPELL DATA (damage, area, material) ================= */
/* Icons: damage types and area shapes, drawn as small inline SVG (D3: like D&D Beyond) */
var DT_ICON={Fire:"M12 2c1 4 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 1 3 3 3 0-3-1-5 0-7z",Cold:"M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17M9 4l3 2 3-2M9 20l3-2 3 2",
 Lightning:"M13 2L4 14h7l-1 8 9-12h-7z",Acid:"M12 2s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z",Poison:"M12 3a6 6 0 1 0 0 12a6 6 0 0 0 0-12zM6 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4zM17 17a2.5 2.5 0 1 0 0 5a2.5 2.5 0 0 0 0-5z",
 Necrotic:"M12 3a7 7 0 0 0-7 7v4l2 2v4h10v-4l2-2v-4a7 7 0 0 0-7-7zM9 10.5h1M14 10.5h1M10 20v-3M14 20v-3",Radiant:"M12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM12 1v4M12 19v4M1 12h4M19 12h4M4.2 4.2l2.8 2.8M17 17l2.8 2.8M4.2 19.8L7 17M17 7l2.8-2.8",
 Psychic:"M12 12a2 2 0 1 1 2-2a4 4 0 1 1-4-4a6 6 0 1 1-6 6",Force:"M12 2l2.5 7 7.5 3-7.5 3-2.5 7-2.5-7L2 12l7.5-3z",Thunder:"M3 10v4M7 7v10M11 4v16M15 7v10M19 10v4",
 Bludgeoning:"M3 7h11v6H3zM14 9h3M17 6v8M8 13v8",Piercing:"M4 20L20 4M20 4h-7M20 4v7",Slashing:"M4 20L18 6l2-2-1 5-1 1M4 20l-1-3M4 20l3 1",Healing:"M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.5A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z"};
var AR_ICON={Sphere:"M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18zM3 12c3 3.5 15 3.5 18 0",Cube:"M12 2l9 5v10l-9 5-9-5V7zM12 12l9-5M12 12v10M12 12L3 7",Cone:"M3 12l18-9v18zM21 3c-2 3-2 15 0 18",
 Cylinder:"M5 6c0-2.7 14-2.7 14 0v12c0 2.7-14 2.7-14 0zM5 6c0 2.7 14 2.7 14 0",Line:"M2 12h20M2 9v6M22 9v6",Emanation:"M12 9a3 3 0 1 0 0 6a3 3 0 0 0 0-6zM12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18",Square:"M4 4h16v16H4zM4 12h16M12 4v16"};/* v19 RD21 */
function svgI(d,cls,title){ return '<svg class="'+cls+'" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="'+esc(title)+'"><title>'+esc(title)+'</title><path d="'+d+'"/></svg>'; }
function dtIcon(t){ var L=String(t||"").split("|"); return (L.length>2&&typeof ICO!=="undefined"?svgI(ICO["dmg-choice"],"dti dt-choice","Choice of damage type: "+L.join(", ")):"")+L.map(function(x){ return DT_ICON[x]?svgI(DT_ICON[x],"dti dt-"+x.toLowerCase(),x):""; }).join(""); }/* v24 RU73 s */
function arIcon(s){ return AR_ICON[s]?svgI(AR_ICON[s],"ari",s):""; }
function dTxt(t){ var a=String(t||"").split("|"); return a.length>2?a.slice(0,-1).join(", ")+", or "+a[a.length-1]:a.join(" or "); }
/* dice helpers: "8d6" + 2 x "1d6" = "10d6"; different dice are added as a second term */
function dAdd(a,b,k){ if(!k||!b) return a; var ma=/^(\d+)d(\d+)([+-]\d+)?$/.exec(a), mb=/^(\d+)d(\d+)$/.exec(b);
  if(ma&&mb&&ma[2]===mb[2]) return (+ma[1]+(+mb[1])*k)+"d"+ma[2]+(ma[3]||""); if(/^\d+$/.test(a)&&/^\d+$/.test(b)) return String(+a+(+b)*k);
  return a+" + "+(mb?(+mb[1])*k+"d"+mb[2]:(+b)*k); }
function dMul(a,t){ var m=/^(\d+)d(\d+)([+-]\d+)?$/.exec(a); return m&&t>1?(m[1]*t)+"d"+m[2]+(m[3]||""):a; }
function dPlus(a,v){ if(!v) return a; var m=/^(.*?)([+-]\d+)$/.exec(a); if(m&&/d/.test(m[1])) return m[1]+sg(+m[2]+v); return a+sg(v); }
/* spCalc: numbers of one spell at slot level lv (default: the spell level) and character level cl. fx from C.spells[] (builder) or SPELL_FX by name */
function spFx(x){ return x&&(x.fx||(typeof SPELL_FX!=="undefined"&&SPELL_FX[x.n])||null); }
function spCalc(x,lv,cl,smod){ var f=spFx(x); if(!f) return null; var L=x.l||0; lv=Math.max(L,lv||L); var ex=L?Math.max(0,lv-(f.upAt||L)):0, tier=cl>=17?4:cl>=11?3:cl>=5?2:1;
  var bon=(spDb(x)).reduce(function(s,b){ return s+(+b.v||0); },0);
  var parts=(f.dmg||[]).map(function(p,i){ var d=p[0]; if(f.cs&&!L) d=dMul(d,tier); if(p[2]&&ex) d=dAdd(d,p[2],ex); if(p[4]&&smod!=null) d=dPlus(d,smod); if(i===0&&bon) d=dPlus(d,bon);
    var t=p[1]; if(x.tx&&String(t).split("|").indexOf(x.tx)<0) t=t+"|"+x.tx; return {d:d,t:t,lab:p[3]||""}; });
  if(f.upx&&ex){ var um=/^(\d+)d(\d+)$/.exec(f.upx[0]); if(um) parts.push({d:(um[1]*ex)+"d"+um[2],t:f.upx[1],lab:f.upx[2]||""}); }/* v19 RD21 */
  var heal=null; if(f.heal){ heal=dAdd(f.heal[0],f.heal[2],ex); if(f.heal[1]&&smod!=null) heal=dPlus(heal,smod); (x.hb||[]).forEach(function(b){ heal=dPlus(heal,(+b.v||0)+(b.lv?lv:0)); }); }
  var n=f.beam?tier:f.cnt?(+f.cnt[0]+(+f.cnt[2]||0)*ex):0, unit=f.beam?"beam":f.cnt?f.cnt[1]:"";
  var up=L&&(!!f.upx||(f.dmg||[]).some(function(p){return p[2];})||(f.cnt&&f.cnt[2])||(f.heal&&f.heal[2]));
  return {parts:parts,heal:heal,n:n,unit:unit,lv:lv,up:!!up,area:f.area||null,bon:spDb(x).concat((x.hb||[]).map(function(b){ return {v:(+b.v||0)+(b.lv?lv:0),s:b.s+" (healing)"}; }))}; }
/* sheets applied before v15 have no db: Eldritch Blast takes the modifier its Actions row already adds (Agonizing Blast) */
function spDb(x){ if(x.db) return x.db; if(x.fx||x.n!=="Eldritch Blast"||typeof C==="undefined") return []; var a=(C.attacks||[]).filter(function(q){return q.n===x.n&&!q.nomod;})[0]; return a&&D.mod?[{v:D.mod[a.ab]||0,s:"Agonizing Blast"}]:[]; }
function spAreaTxt(a){ if(!a) return ""; return a[1]+" ft."+(a[0]==="Line"&&a[2]?" x "+a[2]+" ft.":a[0]==="Cylinder"&&a[2]?" x "+a[2]+" ft.":""); }
function spRangeH(r,x){ var f=spFx(x), a=f&&f.area; return esc(String(r||"").replace(/ ft$/," ft."))+(a?'<span class="spar">/'+esc(spAreaTxt(a))+arIcon(a[0])+'</span>':''); }
function spCompH(cmp,x){ var f=spFx(x), m=(x&&x.mat)||(f&&f.mat); return esc(cmp)+(m&&/M/.test(cmp)?' <span class="spmat">('+esc(m)+')</span>':''); }
/* Effect cell: count x first damage part with icon, or healing, or the old text summary */
function spEffH(x,lv){ var c=spCalc(x,lv,D.level,scOf(x).mod); if(c&&c.parts.length){ var p=c.parts[0]; return '<span class="speff">'+(c.n>1?c.n+'× ':'')+esc(p.d)+dtIcon(p.t)+'</span>'; }
  if(c&&c.heal) return '<span class="speff">'+esc(c.heal)+dtIcon("Healing")+'</span>'; return esc(spEffect(x)); }
/* RU35 no. 2: a Warlock spell is cast with a Pact Magic slot, so its row uses the Pact slot level (Mystic Arcanum keeps its own level) */
function spPact(x){ var sc=C.spellcasting||{}; if(!x.l||!sc.pact) return false; if(x.pact!=null) return !!x.pact; if(/Long Rest|At will/.test(x.use||"")) return false; if(C.cls==="Warlock"&&!/\//.test(C.clsLabel||"")) return true; return /^(Warlock|.* Patron)$/.test(String(x.src||""))&&/Warlock/.test(C.clsLabel||""); }/* v31 p95 */
/* v22: the group a spell is shown in. Pact Magic only: spells cast with a Pact slot sit at the Pact slot level */
function spGrpLv(x){ var sc=C.spellcasting||{}; if(x.itc&&x.itc.lv&&!Array.isArray(x.itc.c)) return x.itc.lv; if(!x.l||!sc.pact) return x.l; return spPact(x)?spRowLv(x):x.l; }/* v36 p01: pact spells sit at the Pact level also with other slots */
function spPactLv(){ var p=(C.spellcasting||{}).pact; if(!p) return 0; if(+p.lvl) return +p.lvl; var r=(D.res||[]).filter(function(q){return q.k==="pact"})[0], m=r&&/level (\d)/.exec(r.n||""); return m?+m[1]:0; }/* v36 p01 */
function spRowLv(x){ if(x.itc&&x.itc.lv&&!Array.isArray(x.itc.c)) return x.itc.lv; return spPact(x)?Math.max(x.l,spPactLv()||x.l):x.l; }
/* v15 Checker: the Lvl control stays inside the slots the character can use. Pact Magic: the Pact level only. Mystic Arcanum and once-per-rest casts: the spell level */
function spLvRange(x){ var sc=C.spellcasting||{}; if(!x.l) return [0,0]; if(spPact(x)){ var p=Math.max(x.l,spPactLv()||x.l); return [p,p]; } if(/Long Rest|At will/.test(x.use||"")) return [x.l,x.l]; var mx=(sc.slots||[]).length; return [x.l,Math.max(x.l,mx||9)]; }
var spLvSel={};
function spFxBlock(x,key){ var sc=scOf(x), rg=spLvRange(x), lv=clamp(spLvSel[x.n]!=null?spLvSel[x.n]:spRowLv(x),rg[0],rg[1]), c=spCalc(x,lv,D.level,sc.mod); if(!c||(!c.parts.length&&!c.heal&&!c.n)) return "";
  var h='<div class="info-h">'+(c.parts.length?"Damage":"Effect")+'</div><div class="spfx">';
  if(c.up&&rg[1]>rg[0]) h+='<div class="splv"><button type="button" class="btn press" data-splv="-1" data-spn="'+esc(x.n)+'" data-spb="'+rg[0]+'" data-spt="'+rg[1]+'" aria-label="Lower spell level"'+(c.lv<=rg[0]?' disabled':'')+'>−</button><span>Lvl <b>'+c.lv+'</b></span><button type="button" class="btn press" data-splv="1" data-spn="'+esc(x.n)+'" data-spb="'+rg[0]+'" data-spt="'+rg[1]+'" aria-label="Higher spell level"'+(c.lv>=rg[1]?' disabled':'')+'>+</button></div>';
  else if(x.l) h+='<p class="spfl splvs">Slot level <b>'+c.lv+'</b>'+(spPact(x)?' (Pact Magic)':'')+'</p>';
  if(c.n) h+='<p class="spfl"><b>'+c.n+' '+esc(c.unit)+(c.n>1?'s':'')+'</b>'+(x.l?'':' at character level '+D.level)+', each:</p>';
  c.parts.forEach(function(p){ h+='<p class="spfl">'+dtIcon(p.t)+'<b>'+esc(p.d)+'</b> '+esc(dTxt(p.t))+' damage'+(p.lab?' <span class="muted">('+esc(p.lab)+')</span>':'')+'</p>'; });
  if(c.heal) h+='<p class="spfl">'+dtIcon("Healing")+'<b>'+esc(c.heal)+'</b> Hit Points regained</p>';
  if(c.bon.length) h+='<p class="spfl muted">Includes '+c.bon.map(function(b){ return sg(b.v)+" from "+esc(b.s); }).join(", ")+'.</p>';
  if(!x.l&&spFx(x).cs) h+='<p class="spfl muted">Cantrip dice at character level '+D.level+'.</p>';
  return h+'</div>'; }
document.addEventListener("click",function(e){ var b=e.target.closest("[data-splv]"); if(!b) return; e.stopPropagation(); e.preventDefault();
  var n=b.getAttribute("data-spn"), base=+b.getAttribute("data-spb"), x=(C.spells||[]).filter(function(q){return q.n===n})[0]; if(!x) return;
  var cur=spLvSel[n]!=null?spLvSel[n]:spRowLv(x); spLvSel[n]=clamp(cur+(+b.getAttribute("data-splv")),base,+b.getAttribute("data-spt")||9); refreshEntry(); },true);
window.__spCalc=spCalc; window.__spRangeH=spRangeH; window.__spCompH=spCompH; window.__dtIcon=dtIcon; window.__dTxt=dTxt;
/* ================= v17 ================= */
/* RU40: every Limited Use row of a feature (several rows can belong to one feature, f = feature or item name) */
function resOf(name){ return (D.res||[]).filter(function(q){ return q.n===name||q.f===name; }); }
/* v36 p10: usage pips in the card head (the same .bx boxes), the reset line only when the sentence does not already say it */
function resPips(rl){ var p=rl.filter(function(r){ return !r.pool; }); return p.length?'<span class="hpips">'+p.map(function(r){ return (p.length>1?'<small class="hpl">'+esc(r.n)+'</small>':'')+'<span class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>'; }).join("")+'</span>':''; }
function resTail(rl,so){ var rest=so&&(so.m||[]).some(function(x){ return /Rest/.test(x); }); return rl.map(function(r){ if(so&&!r.pool) return rest?'':'<div class="fres">'+resetTxt(r)+'</div>'; return resBoxes([r]); }).join(""); }
function manCost(rl){ var r=rl.filter(function(q){ return !q.pool; })[0]; if(!r) return ""; var left=r.max-used(r.k,r.max); return '<div class="sum-m"><span class="supd" data-k="'+r.k+'">'+ico("ui-dice","sum-i")+'<span>1 '+esc(String(r.n).replace(/Dice$/,"Die"))+'. <b>'+left+'</b> left</span></span></div>'; }
function resBoxes(rl){ return rl.map(function(r){ return '<div class="fuse">'+(rl.length>1||r.n!==r.f?esc(r.n)+': ':'')+(r.pool?'Points:':'Used:')+'</div><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div><div class="fres">'+resetTxt(r)+'</div>'; }).join(""); }
function itemRes(it){ var rl=resOf(it.n); return rl.length?'<div class="fsub ires">'+resBoxes(rl)+rl.map(chMaxH).join("")+'</div>':''; }
function resetTxt(r){ return {short:"Resets on a Short or Long Rest",short1:"One use back on a Short Rest, all on a Long Rest",long:"Resets on a Long Rest",none:"Does not reset on a rest"}[r.reset]||""; }
/* RU35 no. 4: icon of the kind of attack */
var AK_ICON={melee:"M14 3h7v7L10 21l-7-7zM6 14l4 4",ranged:"M4 20L20 4M13 4h7v7M5 13c3 0 6 3 6 6",spell:"M12 2l2 6 6 2-6 2-2 6-2-6-6-2 6-2zM19 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1z",unarmed:"M7 11V7a2 2 0 0 1 4 0v4M11 9V6a2 2 0 0 1 4 0v5M15 9a2 2 0 0 1 4 0v4a7 7 0 0 1-7 7h-1a6 6 0 0 1-6-6v-2a2 2 0 0 1 4 0",feature:"M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z"};
function atkKind(a){ if(/Unarmed/.test(a.n)) return "unarmed"; if(/^Cantrip/.test(a.sub||"")) return "spell"; if(/thrown/i.test(a.n)||/^\d+\/\d+/.test(String(a.range||"").trim())) return "ranged"; return "melee"; }
function akIcon(k){ return svgI(AK_ICON[k],"aki ak-"+k,{melee:"Melee attack",ranged:"Ranged attack",spell:"Spell attack",unarmed:"Unarmed Strike",feature:"Feature"}[k]); }
function tyIcon(t){ var h=dtIcon(String(t||"").replace(/ or |, /g,"|")); return h||(t?svgI(AK_ICON.melee,"dti dt-weapon",String(t)):""); }
/* RU35 no. 1: slot boxes in the heading of each spell level (Pact Magic slots where Pact spells are listed) */
function spSlotsH(l,rows){ if(!l) return ""; var o="", r=(D.res||[]).filter(function(q){return q.k==="s"+l})[0], pr=(D.res||[]).filter(function(q){return q.k==="pact"})[0];
  if(r) o+='<span class="spsl"><small>SLOTS</small>'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</span>';
  if(pr&&rows.some(function(p){return spPact(p[0])})) o+='<span class="spsl"><small>PACT</small>'+boxes(used(pr.k,pr.max),pr.max,pr.k,pr.n)+'</span>';
  return o?'<span class="spslw">'+o+'</span>':""; }
/* RU35 no. 7: Speed and Defenses, always shown */
function renderSpeedDef(){ var e=document.getElementById("speeds"); if(e){ var sp=Object.assign({},C.speeds||{}); if(D.cf&&D.cf.fly&&!sp.fly) sp.fly=D.cf.fly;/* v22 */ var rows='<div class="sense"><span class="bonus">'+D.speed+'</span><span>Walking, ft</span></div>';
    ["fly","swim","climb","burrow"].forEach(function(k){ var x=sp[k]; if(!x) return; var v=x.v==="walk"?D.speed:(D.cf&&D.cf.speed0.length?0:exSpd(num(x.v,0))); rows+='<div class="sense"><span class="bonus">'+v+'</span><span>'+{fly:"Fly",swim:"Swim",climb:"Climb",burrow:"Burrow"}[k]+', ft<small class="muted"> '+esc(x.s||"")+'</small></span></div>'; });
    if(!["fly","swim","climb","burrow"].some(function(k){return sp[k]})) rows+='<p class="muted dnone">No other speeds</p>'; e.innerHTML=rows; }
  var f=document.getElementById("defs"); if(f){ var L=(C.defenses||[]).concat(D.cf?D.cf.res:[]),/* v22 */ g=function(t){ return L.filter(function(d){return d.t===t}); };
    var sec=function(t,lbl,none){ var x=g(t); return '<h3 class="defh">'+lbl+'</h3>'+(x.length?x.map(function(d){return '<div class="defl"><b>'+esc(d.v)+'</b><small>'+esc(d.s)+'</small></div>'}).join(""):'<p class="muted dnone">'+none+'</p>'); };
    var oth=L.filter(function(d){return ["Resistance","Immunity","Vulnerability"].indexOf(d.t)<0});
    f.innerHTML=sec("Resistance","Resistances","No Resistances")+sec("Immunity","Immunities","No Immunities")+sec("Vulnerability","Vulnerabilities","No Vulnerabilities")+(oth.length?'<h3 class="defh">Other</h3>'+oth.map(function(d){return '<div class="defl"><b>'+esc(d.t)+'</b> '+esc(d.v)+'<small>'+esc(d.s)+'</small></div>'}).join(""):""); } }
/* RU35 no. 6: notes under Saving Throws */
function saveNotesH(){ var n=(C.saveNotes||[]), b=(C.saveBonus||[]); if(!n.length&&!b.length) return ""; return '<div class="snotes">'+b.map(function(x){return '<p><b>'+sg(num(x.v))+'</b> to all saving throws <small>'+esc(x.s)+'</small></p>'}).join("")+n.map(function(x){return '<p>'+esc(x.t)+' <small>'+esc(x.s)+'</small></p>'}).join("")+'</div>'; }
/* RU35 no. 8: containers. An item with "in" sits inside that container item. A magic container (CONTAINERS[2] set) has a fixed weight, its contents do not count */
function ctOf(n){ var b=String(n||"").replace(/ \(.*\)$/,""); return (typeof CONTAINERS!=="undefined"?CONTAINERS:[]).filter(function(c){ return c[0]===n||c[0]===b; })[0]||null; }
function invKey(i){ return i.key||i.n; }
