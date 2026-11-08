import {bindLive,clsOfG,coinStrip,coinsNow,ctCap,ctLoad,ctOf,cuNm,fch,featNums,featSpL,foldP,ico,invKey,invWeight,itemW,jrnH,lateGet,noteSec,pgGuess,renderDesc,resBoxes,resOf,setOf,srcPg} from "./00a-reg-late-ports.js";/* Responsibility: the Inventory, Features and Notes pages. Split out of the former single file 08 in SOLID stage 9 (S); runs in the same order as before. */
import {NOTE_FIELDS,gName} from "./03-data-glossary.js";import {C} from "./04-logic-storage.js";import {$,attMaxC,eqOn,esc,fmtW,num} from "./05-logic-helpers.js";import {D,fill,richP} from "./06-logic-derivation.js";import {env} from "./00-env.js";import {aylH,aylSplit,shortX,sumH,sumParse,sumPill,sumText} from "./08b-ui-render-summaries-actions.js";bindLive("esArt",{get:function(){return esArt;}});bindLive("renderInv",{get:function(){return renderInv;}});
bindLive("renderNotes",{get:function(){return renderNotes;}});
export var invF="all";
export function renderInv(){
  const _renderInvStep1=renderInvStep1();
  const {L, head, keep}=_renderInvStep1;
  let {fil}=_renderInvStep1;
  const {row, inCt}=renderInvStep2(L);
  let {attH, body}=renderInvStep3(L, row);
  ({body, fil, attH}=renderInvStep4(L, head, fil, attH, body, inCt, keep, row));
}
function renderInvStep1(){
  (C.inv||[]).forEach((i) =>{ if(i.type==null&&env.__itemMeta){ const mt=env.__itemMeta(i.n); if(mt){ i.type=mt.type; if(i.cost==null) i.cost=mt.cost; i.equippable=mt.equippable; i.html=i.html||mt.html; if(mt.att) i.att=1; if(mt.equippable) i.gear=1; } else i.type="Gear"; } });
  /* RU35 no. 8: weight counts container rules (a magic container weighs the same full or empty) */
  const L=C.inv||[], total=invWeight(), enc=setOf("enc")==="off"?"WEIGHT NOT TRACKED":total>D.carry?"ENCUMBERED":"UNENCUMBERED", cz=coinsNow();
  const head='<div class="ihero"><div class="iwt" role="button" tabindex="0" data-info="g:Carrying Capacity" aria-description="Opens Carrying Capacity"><b>'+fmtW(total)+'</b> <small>lb.</small> <span>'+enc+'</span></div>'+coinStrip(cz)+'<button type="button" class="ibtn ibshop" data-invshop="1">'+ico("coin-gp","ibt")+'Shop: Add or Buy Gear</button>'+(L.length?'<button type="button" class="ibtn" data-invman="1">'+ico("tab-inventory","ibt")+'Manage Inventory</button>':'')+'</div>';/* v31 RU123, C6 */
  let fil='<div class="ifil">'+[["all","All"],["equip","Equipment"],["att","Attunement"],["other","Other Possessions"]].map((f) =>{return '<button type="button" class="ifb'+(invF===f[0]?' on':'')+'" data-invf="'+f[0]+'">'+f[1]+'</button>'}).join('')+'</div>';
  const keep=function(i){ if(invF==="equip")return i.gear; if(invF==="att")return i.att; if(invF==="other")return !(i.gear||i.att); return true; };
  return /** @type {any} */ ({L, head, fil, keep});
}
function renderInvStep2(L){
  const row=function(i,ix,sub){ const q=num(i.q,1), w=num(i.w,0), rc=i.rar?' r-'+i.rar.toLowerCase().replace(/\s+/g,''):'', ct=ctOf(i.n), ww=ct&&ct[2]!=null?ct[2]:w;
    return '<div class="irow'+(sub?' isub':'')+'"><span class="iact">'+(i.equippable?'<button type="button" class="ichk'+(eqOn(i)?' on':'')+'" data-ieqs="'+esc(i.key||i.n)+'" data-iix="'+ix+'" aria-label="Toggle '+esc(i.n)+'"></button>':'<span class="muted">--</span>')+'</span><button type="button" class="iname" data-info="it:'+ix+'"><b class="'+rc+'">'+(env.__artIc?env.__artIc("item",i.n):"")+esc(cuNm("i:"+invKey(i),i.n))+'</b><small>'+esc((i.type||"Gear").toUpperCase())+(i.rar?' \u2022 '+esc(i.rar.toUpperCase()):'')+(ct?' \u2022 CONTAINER':'')+(i.mw?' \u2022 MASTERWORK':'')+'</small><span>'+(ww?fmtW(ww)+' lb.':'--')+'</span></button><span class="iq">'+q+'</span><span class="ic">'+(i.cost!=null?i.cost:'--')+'</span></div>'; };
  const byK={}; L.forEach((i) =>{ byK[invKey(i)]=i; });
  const inCt=function(i){ const p=i.in&&byK[i.in]; return p&&p!==i&&ctOf(p.n)?p:null; };
  return /** @type {any} */ ({row, inCt});
}
function renderInvStep3(L, row){
  const att=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return p[0].att&&eqOn(p[0]); }), need=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return p[0].att&&!eqOn(p[0]); });
  let attH="";
  if(L.some((i) =>{return i.att})&&(invF==="all"||invF==="att")){
    const aM=attMaxC(); attH='<div class="ieq"><b>Attuned Items</b><span>'+Math.min(aM,att.length)+'/'+aM+'</span></div><div class="islots">'+[0,1,2,3].slice(0,aM).map((n) =>{ const p=att[n]; return p?'<button type="button" class="islot on" data-info="it:'+p[1]+'"><b>'+esc(p[0].n)+'</b></button>':'<span class="islot">Empty slot</span>'; }).join("")+'</div>'+
      (att.length>aM?'<div class="caution">\u26a0 You are attuned to more than '+aM+' magic items. Only the first '+aM+' in the list work. Unattune the others.</div>':'');
    if(invF==="att") attH+='<div class="ieq"><b>Items Requiring Attunement</b><span>'+need.length+'</span></div>'+(need.length?'<div class="ihead"><span></span><span>Weight</span><span>Qty</span><span>Cost (GP)</span></div>'+need.map((p) =>{return row(p[0],p[1])}).join(""):'<p class="muted dnone">Every item that needs attunement is attuned.</p>');
  }
  let body="";
  return /** @type {any} */ ({attH, body});
}
function renderInvStep4(L, head, fil, attH, body, inCt, keep, row){
  if(invF!=="att"){
    const main=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return !inCt(p[0])&&keep(p[0]); });
    body='<div class="ieq"><b>Equipment ('+L.filter((i) =>{return !inCt(i)}).length+')</b><span>'+fmtW(L.filter((i) =>{return !inCt(i)}).reduce((t,i) =>{return t+itemW(i)},0))+' lb.</span></div><div class="ihead"><span></span><span>Weight</span><span>Qty</span><span>Cost (GP)</span></div>'+main.map((p) =>{return row(p[0],p[1])}).join("");
    L.forEach((c,cx) =>{ const ct=ctOf(c.n); if(!ct) return; const inner=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return inCt(p[0])===c; }); if(!inner.length) return;
      const ld=ctLoad(c), cap=ctCap(c,ct), sh=inner.filter((p) =>{return keep(p[0])});
      const ck=invKey(c), op=!lateGet("ctShut")[ck];/* v32 RU134: a container section opens and closes */
      body+='<button type="button" class="ieq ict" data-ctog="'+esc(ck)+'" aria-expanded="'+op+'" aria-label="'+esc(cuNm("i:"+ck,c.n))+', '+inner.length+' item'+(inner.length>1?'s':'')+', '+(op?'close':'open')+'"><b>'+esc(cuNm("i:"+ck,c.n))+'</b><span class="ictn">'+inner.length+' item'+(inner.length>1?'s':'')+'</span><span class="ictw'+(cap&&ld>cap?' over':'')+'">'+fmtW(ld)+(cap?' / '+cap:'')+' lb.'+(ct[2]!=null?' \u2022 counts as '+fmtW(ct[2])+' lb.':'')+'</span>'+CHEV+'</button>'+(cap&&ld>cap?'<div class="caution">\u26a0 Over capacity. This container holds up to '+cap+' lb.</div>':'')+(op?sh.map((p) =>{return row(p[0],p[1],1)}).join(""):''); });
  }
  if(!L.length){ fil=""; attH=""; body='<div class="empty-note empty-st">'+esArt("chest")+'<b>No items yet</b><span>Buy or add weapons, armor, and gear. Your coins stay above.</span><button type="button" class="btn pri press" data-invman="1">'+ico("tab-inventory","ibt")+'Manage Inventory</button></div>'; }/* v31 C6 */
  $("#invBody").innerHTML=head+fil+attH+body+(C.equipNote?'<p class="next inote">'+ico("item-gear")+'<span>'+esc(C.equipNote).replace(/\. (?=[A-Z])/g,".<br>")+'</span></p>':'')/* v33 p05 (F2) */;
  return /** @type {any} */ ({body, fil, attH});
}
export var CHEV='<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
export var featQ="",featF="all";
function featCat(g){ if(/^Species/.test(g)) return "species"; if(/^Feats/.test(g)) return "feats"; if(/^Background/.test(g)) return "bg"; return "class"; }
function actChip(t){ return /\bBonus Action\b/.test(t)?"1 Bonus Action":/\bReaction\b/.test(t)?"1 Reaction":/\bMagic action\b|\bas an action\b|\bUtilize action\b/i.test(t)?"1 Action":""; }
export function renderFeat(){
  const _renderFeatStep1=renderFeatStep1();
  const {q, groups, head, order}=_renderFeatStep1;
  let {h}=_renderFeatStep1;
  order.forEach((o) =>{
    if(featF!=="all"&&featF!==o[0]) return;
    const body=groups.map((g, gi) => renderFeatFn1(o, q, g, gi)).join("");
    if(body) h+='<h3 class="fcat">'+o[1]+(o[0]==="feats"&&C.cls?'<button type="button" class="btn press fmanb" data-bldgo="class">Manage Feats</button>':'')+'</h3>'+body;/* v23 RU38 no. 4 */
  });
  ({h}=renderFeatStep2(h, head));
}
function renderFeatFn1(o, q, g,gi){ if(featCat(g.g)!==o[0]) return "";
      const items=(g.items||[]).map((f,fi) =>{
        const txt=f.full||f.d||"", hay=(f.n+" "+(f.d||"")+" "+(f.full||"")).toLowerCase(); if(q&&hay.indexOf(q)<0) return ""; const cs=renderFeatFn1Part1(f, g), so=q?null:sumParse(cs.t);/* v35 p15, p17 */
        const rl=resOf(f.n), r=rl[0], chip=actChip(txt);
        const from=(/^Feats/.test(g.g)&&f.s)?'<div class="ffrom">From <b>'+esc((f.s.match(/\(([^)]+)\)\s*$/)||[0,f.s])[1].replace(/,? ?Versatile/,""))+'</b> <span class="fsrc">\u2022 '+esc(srcPg(f.s.split(",")[0],pgGuess(g,f)))+'</span></div>':'';
        return renderFeatFn1Part2(gi, fi, f, from, g, so, q, cs, chip, r, rl);
      }).join("");
      if(!items) return "";
      if(g.g==="Eldritch Invocations") return '<div class="fnest">'+items+'</div>';
      return (o[0]==="class"?'<h3 class="fgh">'+esc(gName(g.g))+'</h3>':'')+items;
    }
function renderFeatFn1Part1(f, g){ return (aylSplit(shortX(f.n,g.g)||f.d||f.full||"",clsOfG(g.g))); }
function renderFeatFn1Part2(gi, fi, f, from, g, so, q, cs, chip, r, rl){ return ('<div class="fitem"><h4><button type="button" class="tx" data-info="f:'+gi+'.'+fi+'">'+esc(f.n)+'</button>'+(from?'':'<span class="fsrc"> \u2022 '+esc(srcPg(f.s,pgGuess(g,f)))+'</span>')+sumPill(so&&so.p)+'</h4>'+from+(so?sumH(so,clsOfG(g.g)):f.full&&!q?sumText(cs.t,clsOfG(g.g)):foldP(fch(featNums(richP(fill(cs.t)),clsOfG(g.g))),"f:"+gi+"."+fi,cs.t,!!q||!!f.full||!!shortX(f.n,g.g)))+aylH(cs.a,clsOfG(g.g))+featSpL(g,f)+
          ((chip||r)?'<div class="fsub">'+(chip?'<div><b>'+esc(f.n)+'</b> <span class="muted">('+chip+')</span></div>':'')+(r?resBoxes(rl):'')+'</div>':'')+'</div>'); }
function renderFeatStep1(){
  const q=featQ.toLowerCase(), groups=(C.features||[]);
  const head='<div class="fsearch"><input id="featQ" type="search" placeholder="Search in Features" value="'+esc(featQ)+'"></div><div class="ifil">'+[["all","All"],["class","Class Features"],["species","Species Traits"],["feats","Feats"],["bg","Background"]].map((f) =>{return '<button type="button" class="ifb'+(featF===f[0]?' on':'')+'" data-featf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
  let order=[["class","Class Features"],["species","Species Traits"],["feats","Feats"],["bg","Background"]], h="";
  return /** @type {any} */ ({q, groups, head, order, h});
}
function renderFeatStep2(h, head){
  if(!h) h='<p class="empty-note">No features match your search.</p>';
  $("#featBody").innerHTML=head+h;
  return /** @type {any} */ ({h});
}
export function renderNotes(){/* v23 RU36 no. 9, RU38 no. 5: Notes like D&D Beyond. Background and Characteristics are on the Description tab */
  const nf=function(k){ return NOTE_FIELDS.filter((f) =>{ return f.k===k; })[0]; };
  let html='<h3 class="noteh">Notes</h3><div class="nsecs">'+lateGet("NOTE_MORE").map(noteSec).join("")+noteSec(nf("backstory"))+noteSec({k:"other",l:"Other",h:"Anything else worth keeping",rows:3})+noteSec(nf("session"))+'</div>';/* v31 B9 */
  html += jrnH();/* v22 RU70 */
  html += '<div class="saved">Saved on this device as you type.</div>';
  $("#notesBody").innerHTML = html; renderDesc();
}
/* T3 item 17: small original illustrations for empty states. Lines in the muted color, sparks in the accent color. Drawn once, no image files */
export function esArt(k){ const V={chest:"items",book:"spells",paw:"creatures",hero:"characters"}[k], R=env.__ART&&env.__ART.vig&&env.__ART.vig.empty;
  if(V&&R&&R.indexOf(V)>=0&&(function(){try{return __store.getItem("mi-clsart")!=="off"}catch(e){return true}})()) return '<img class="es-art es-img" src="img/vig/empty/'+V+'.avif" width="128" height="128" alt="" decoding="async" loading="lazy">';
  const A={
  chest:'<path d="M18 46h60v28a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z"/><path d="M18 46V38a14 14 0 0 1 14-14h32a14 14 0 0 1 14 14v8"/><path d="M18 56h60"/><rect x="42" y="50" width="12" height="14" rx="2"/><circle cx="48" cy="57" r="1.6" class="es-f"/>',
  book:'<path d="M48 30c-8-6-20-7-30-4v40c10-3 22-2 30 4 8-6 20-7 30-4V26c-10-3-22-2-30 4z"/><path d="M48 30v40"/><path d="M26 38c6-1 11 0 16 2M26 48c6-1 11 0 16 2M54 40c5-2 10-3 16-2M54 50c5-2 10-3 16-2"/>',
  paw:'<ellipse cx="48" cy="62" rx="15" ry="12"/><ellipse cx="29" cy="46" rx="6" ry="8" transform="rotate(-18 29 46)"/><ellipse cx="42" cy="34" rx="6" ry="8.5" transform="rotate(-6 42 34)"/><ellipse cx="55" cy="34" rx="6" ry="8.5" transform="rotate(6 55 34)"/><ellipse cx="68" cy="46" rx="6" ry="8" transform="rotate(18 68 46)"/>',
  hero:'<path d="M48 14 22 24v22c0 17 11 29 26 36 15-7 26-19 26-36V24z"/><path d="M48 36v24M36 48h24"/>'}[k]||"";
  const sp='<path class="es-sp" d="M80 16v10M75 21h10M16 70v8M12 74h8"/>';
  return '<svg class="es-art es-'+k+'" viewBox="0 0 96 96" width="96" height="96" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+A+sp+'</svg>'; }
export function __set_invF(v){ return invF=v; }
export function __set_renderInv(v){ return renderInv=v; }
export function __set_featQ(v){ return featQ=v; }
export function __set_featF(v){ return featF=v; }
export function __set_renderFeat(v){ return renderFeat=v; }
export function __set_renderNotes(v){ return renderNotes=v; }
