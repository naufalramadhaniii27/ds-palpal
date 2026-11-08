/* Library, part d: hidden pages, search, list, key handling, open (split from 27b, SOLID stage 12) */
import {bindLive,icoSp,lateGet,lateSet} from "./00a-reg-late-ports.js";import {GLOSS} from "./03-data-glossary.js";import {C} from "./04-logic-storage.js";import {esc,toast} from "./05-logic-helpers.js";import {sheetIco,wmClass,wmHd} from "./12-ui-bottom-sheet-modal.js";import {closeSheet} from "./13b-ui-detail-spell-targets-render.js";import {ico,icoCls} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {env} from "./00-env.js";import {fzD,fzMax,fzScore} from "./27-ui-party-search-commands-library.js";import {LIB,LIB_CATS,LIB_RULES,__set_libDetail,libAddBtn,libBook,libCat,libDetail,libFeatBlock,libIndex,libReady} from "./27b-ui-library.js";
bindLive("libOpen",{get:function(){return libOpen;}});
function libRecent(add){ let a=[]; try{ a=JSON.parse(__store.getItem("cs-lib-recent")||"[]"); if(!Array.isArray(a)) a=[]; }catch(er){ a=[]; } if(add){ a=[add].concat(a.filter((x) =>{ return x!==add; })).slice(0,8); try{ __store.setItem("cs-lib-recent",JSON.stringify(a)); }catch(er){} } return a; }
function libHi(n,q){ const i=q?n.toLowerCase().indexOf(q):-1; return i<0?esc(n):esc(n.slice(0,i))+'<mark>'+esc(n.slice(i,i+q.length))+'</mark>'+esc(n.slice(i+q.length)); }
const LIB_ICO={spell:"spell",gear:"item",item:"item",feat:"feat",feature:"feature",facility:"facility",rule:"rule",opt:"opt",optfeat:"optfeat",language:"language",vehicle:"vehicle",object:"object"};
/* Codex icons by entry kind */
const LIB_CATIC={sub:"subclass",bg:"background",opt:"option",homebrew:"homebrew"};
function libCatIc(c){ const A=env.__ART, k=LIB_CATIC[c]||c; try{ if(!A||!A.icon||!A.icon.cat||A.icon.cat.indexOf(k)<0||localStorage.getItem("mi-clsart")==="off") return ""; }catch(er){ return ""; } return '<img class="art-ic" src="img/icon/cat/'+k+'.avif" alt="" loading="lazy" decoding="async">'; }
function libRow(e,q,showCat){ const ct=libCat(e.c); return '<button type="button" class="lib-r" data-lib-open="'+esc(e.c+"|"+e.k)+'"><span class="lib-ri">'+((env.__artIc&&LIB_ICO[e.c]&&env.__artIc(LIB_ICO[e.c],e.n))||libCatIc(e.c)||ico(ct[2],"gs-ri")||"")+'</span><span class="lib-rt"><b>'+libHi(e.n,q)+'</b><small>'+esc(e.s)+(function(){ const b=libBook(e); return b&&String(e.s).toUpperCase().indexOf(b)<0?(e.s?' • ':'')+esc(b):''; })()+'</small></span>'+(showCat?'<span class="lib-rc">'+esc(ct[1].replace(/ and .*/,"").replace(/s$/,""))+'</span>':'')+'</button>'; }
function libInv(){ if(LIB.inv||!LIB.idx) return; const inv={}, voc=[];
  LIB.idx.forEach((e,i) =>{ const seen={}; (e.n.toLowerCase()+" "+e.s.toLowerCase()+" "+e.t).split(/[^a-z0-9']+/).forEach((w) =>{ if(w.length<4||w.length>24||seen[w]) return; seen[w]=1; if(!inv[w]){ inv[w]=[]; voc.push(w); } inv[w].push(i); }); }); LIB.inv=inv; LIB.voc=voc; LIB.fz={}; }
/* typo help for a word of 4 letters or more: the entries that hold a word within one or two edits of it */
function libFz(t){ if(LIB.fz[t]) return LIB.fz[t]; let m=fzMax(t), set={}, voc=LIB.voc, k, w, d; for(k=0;k<voc.length;k++){ w=voc[k]; if(Math.abs(w.length-t.length)>m) continue; d=fzD(t,w,m); if(d<=m) LIB.inv[w].forEach((i) =>{ set[i]=1; }); } LIB.fz[t]=set; return set; }
function libSearch(){
 const {q, toks}=libSearchStep1(); if(q.length<2||!LIB.idx) return;
 libSearchStep2();
  LIB.idx.forEach((e, i) => libSearchFn1(q, toks, e, i));
  libSearchStep3(); }
function libSearchFn1(q, toks, e,i){ let v=fzScore(q,e.n); if(e.c==="homebrew"&&v>=3) v=-1;/* a homebrew name must contain the query: no typo matches among 43,000 rows */ if(e.p&&(v<0||v>1.5)&&e.p.indexOf(q)>=0) v=/^Class /.test(e.s)?1.3:/^Subclass /.test(e.s)?1.4:/^(Race|Species|Background|Feat) /.test(e.s)?1.5:1.7;/* the pack or publisher holds the query: Valda, Mage Hand Press */ if(v<0){ const hay=(e.n+" "+e.s).toLowerCase(); if(toks.length>1&&toks.every((t) =>{ return hay.indexOf(t)>=0; })) v=3; else if(toks.every((t) =>{ return e.t.indexOf(t)>=0||hay.indexOf(t)>=0; })) v=7; else if(e.c!=="homebrew"&&toks.every((t) =>{ return e.t.indexOf(t)>=0||hay.indexOf(t)>=0||(t.length>=4&&libFz(t)[i]); })) v=8; } if(v>=0) LIB.res.push([v,e]); }
function libSearchStep1(){
const q=LIB.q.trim().toLowerCase().replace(/\s+/g," "), toks=q.split(" ").filter(Boolean); LIB.res=[];
  return /** @type {any} */ ({q, toks});
}
function libSearchStep2(){
libInv();
}
function libSearchStep3(){
  const ci=function(c){ for(let i=0;i<LIB_CATS.length;i++) if(LIB_CATS[i][0]===c) return i; return 99; };
  LIB.res.sort((a,b) =>{ return a[0]-b[0]||a[1].n.length-b[1].n.length||ci(a[1].c)-ci(b[1].c)||(a[1].n<b[1].n?-1:1); });
}
function libCounts(){ const n={}, q=LIB.q.trim(); if(q.length>=2) LIB.res.forEach((r) =>{ n[r[1].c]=(n[r[1].c]||0)+1; }); else (LIB.idx||[]).forEach((e) =>{ n[e.c]=(n[e.c]||0)+1; }); return n; }
function libChips(){ let n=libCounts(), tot=0, q=LIB.q.trim().length>=2, h; Object.keys(n).forEach((k) =>{ tot+=n[k]; });
  h='<button type="button" class="lib-chip'+(LIB.cat==="all"?' on':'')+'" data-lib-cat="all">All <small>'+tot+'</small></button>';
  LIB_CATS.forEach((c) =>{ if(!n[c[0]]) return; h+='<button type="button" class="lib-chip'+(LIB.cat===c[0]?' on':'')+'" data-lib-cat="'+c[0]+'">'+esc(c[1])+' <small>'+n[c[0]]+'</small></button>'; }); return h; }
function libListHTML(){ let q=LIB.q.trim().toLowerCase().replace(/\s+/g," "), h="", i;
  if(!LIB.idx) return '<p class="info-d lib-empty">Loading the library.</p>';
  if(q.length<2){
    if(LIB.cat!=="all"){ const L=LIB.idx.filter((e) =>{ return e.c===LIB.cat; }).sort((a,b) =>{ return a.n<b.n?-1:1; }); return libFlat(L.map((e) =>{ return [0,e]; }),"",L.length); }
    const rc=libRecent().map((id) =>{ let p=id.indexOf("|"), c=id.slice(0,p), k=id.slice(p+1), f=null; LIB.idx.forEach((e) =>{ if(e.c===c&&e.k===k) f=e; }); return f; }).filter(Boolean);
    if(rc.length) h+='<div class="info-h">Recent</div><div class="lib-l">'+rc.map((e) =>{ return libRow(e,"",true); }).join("")+'</div>';
    const n=libCounts(); h+='<div class="info-h">Browse</div><div class="lib-tiles">'+LIB_CATS.filter((c) =>{ return n[c[0]]; }).map((c) =>{ return '<button type="button" class="lib-tile" data-lib-cat="'+c[0]+'">'+(ico(c[2],"gs-ri")||"")+'<b>'+esc(c[1])+'</b><small>'+n[c[0]]+'</small></button>'; }).join("")+'</div>';
    return h+'<p class="bk-f">Type at least two letters. Try a spell, an item, a feat, a rule, or a word from a description.</p>'; }
  const ah=typeof lateGet("askHTML")==="function"?lateGet("askHTML")(LIB.q):"";/* T11 N15: a question gets a short answer from the intent table first */
  if(!LIB.res.length) return ah||'<p class="info-d lib-empty">Nothing found for "'+esc(LIB.q.trim())+'".</p>';
  h=ah;
  if(LIB.cat!=="all"){ const F=LIB.res.filter((r) =>{ return r[1].c===LIB.cat; }); return ah+libFlat(F,q,F.length); }
  const GR=[]; LIB_CATS.forEach((c,ci) =>{ const F=LIB.res.filter((r) =>{ return r[1].c===c[0]; }); if(F.length) GR.push([F[0][0],ci,c,F]); }); GR.sort((x,y) =>{ return x[0]-y[0]||x[1]-y[1]; });/* the group with the best name match comes first */
  GR.forEach((g) =>{ const c=g[2], F=g[3]; h+='<div class="info-h">'+esc(c[1])+' ('+F.length+')</div><div class="lib-l">'+F.slice(0,5).map((r) =>{ return libRow(r[1],q,false); }).join("")+'</div>'+(F.length>5?'<button type="button" class="lib-more" data-lib-cat="'+c[0]+'">Show all '+F.length+' in '+esc(c[1])+'</button>':''); });
  return h; }
function libFlat(R,q,n){ return '<div class="lib-l">'+R.slice(0,LIB.lim).map((r) =>{ return libRow(r[1],q,false); }).join("")+'</div>'+(n>LIB.lim?'<button type="button" class="lib-more" data-lib-more="1">Show '+Math.min(60,n-LIB.lim)+' more of '+n+'</button>':''); }
function libDom(){ let w=document.getElementById("lib"); if(w) return w; w=document.createElement("div"); w.id="lib"; w.className="lib"; w.setAttribute("role","dialog"); w.setAttribute("aria-label","Library"); w.tabIndex=-1;
  w.innerHTML='<div class="lib-h" id="libH"><button type="button" class="lib-x" data-lib-x="back" aria-label="Back" hidden><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg></button><div class="lib-tt"><b id="libT">Library</b><small id="libS"></small></div><button type="button" class="lib-x" data-lib-x="close" aria-label="Close library">'+ico("ui-close")+'</button></div><div class="lib-q"><input id="libQ" type="search" placeholder="Search spells, items, feats, rules" aria-label="Search the library" autocomplete="off" spellcheck="false" enterkeyhint="search"></div><div class="lib-c" id="libC"></div><div class="lib-bd" id="libBd"></div>';
  document.body.appendChild(w); libWire(w); return w; }
function libWm(w,d){ let m=document.getElementById("libWm"); if(!m){ m=document.createElement("span"); m.id="libWm"; m.className="sh-wm"; m.setAttribute("aria-hidden","true"); w.insertBefore(m,document.getElementById("libBd")); }
  let h="";
  if(d&&d.id){ const p=d.id.indexOf("|"), c=d.id.slice(0,p), k=d.id.slice(p+1);
    try{ if(c==="sub"){ let own=null; Object.keys(CLASSES).forEach((cn) =>{ if((CLASSES[cn].subs||{})[k]) own=cn; }); h=(own&&env.__artSub&&env.__artSub(own,k,320))||ico("src-class"); }
    else if(c==="class") h=wmClass(k)||ico(icoCls(k)||"src-class");
    else if(c==="species") h=ico(icoSp(k)||"sp-custom");
    else if(c==="bg") h=ico("src-background");
    else h=sheetIco(d.t); }catch(er){ h=""; } }
  m.innerHTML=wmHd(h); }
/* a failing icon or helper must never leave the result list blank: retry with plain rows */
function libSafe(){ try{ return libListHTML(); }catch(er){ try{ console.error("lib list",er); const a=lateGet("askHTML"); lateSet("askHTML",null); const ai=env.__artIc; env.__artIc=null; try{ return libListHTML(); } finally{ lateSet("askHTML",a); env.__artIc=ai; } }catch(e2){ return '<p class="info-d lib-empty">This list could not be drawn. Close the Library and open it again.</p>'; } } }
function libPaint(){ const w=document.getElementById("lib"); if(!w) return; const d=LIB.cur, bk=w.querySelector('[data-lib-x="back"]'), bd=document.getElementById("libBd");
  bk.hidden=!d; document.getElementById("libT").textContent=d?d.t:"Library"; document.getElementById("libS").textContent=d?d.sub:((C&&C.rs==="2014")?"Rules 2014":"Rules 2024");
  w.classList.toggle("det",!!d);
  libWm(w,d);/* T10: the entry's icon as a faint watermark */
  if(d){ const wm0=document.getElementById("libWm"); bd.innerHTML='<div class="lib-dt">'+d.h+'</div>'; if(wm0) bd.insertBefore(wm0,bd.firstChild); bd.scrollTop=0; return; }
  document.getElementById("libC").innerHTML=LIB.idx?libChips():""; bd.innerHTML=libSafe(); bd.scrollTop=LIB.scroll||0; LIB.sel=0; libMark(); }
function libMark(){ let rs=document.querySelectorAll("#libBd .lib-r"), i; for(i=0;i<rs.length;i++) rs[i].classList.toggle("sel",i===LIB.sel&&!LIB.cur); }
function libGo(spec,push){ let p=spec.indexOf("|"), c=spec.slice(0,p), k=spec.slice(p+1), d=null; try{ d=libDetail(c,k); }catch(er){ d=null; } if(!d){ toast("That entry is not available."); return; } d.h+=libAddBtn(c,k);
  if(push!==false&&LIB.cur) LIB.hist.push(LIB.cur); else if(push!==false) { const bd=document.getElementById("libBd"); LIB.scroll=bd?bd.scrollTop:0; }
  LIB.cur=d; d.id=spec; libRecent(spec); libPaint(); }
function libBack(){ if(LIB.hist.length){ LIB.cur=LIB.hist.pop(); } else LIB.cur=null; libPaint(); }
function libClose(){ const w=document.getElementById("lib"); if(!w) return; w.classList.remove("on"); LIB.on=0; setTimeout(() =>{ if(!LIB.on&&w.parentNode) w.hidden=true; },220); document.removeEventListener("keydown",libKey,true); }
function libInput(v){ LIB.q=v; LIB.lim=60; if(LIB.cur){ LIB.cur=null; LIB.hist=[]; } libSearch(); LIB.scroll=0; libPaint(); }
function libKey(e){ const w=document.getElementById("lib"); if(!w||!LIB.on) return; const inLib=w.contains(e.target);
  if(e.key==="Escape"&&(inLib||document.activeElement===document.body)){ e.preventDefault(); e.stopPropagation(); libClose(); return; }
  if(!inLib) return; const rs=document.querySelectorAll("#libBd .lib-r");
  if(!LIB.cur&&(e.key==="ArrowDown"||e.key==="ArrowUp")&&rs.length){ e.preventDefault(); LIB.sel=Math.max(0,Math.min(rs.length-1,LIB.sel+(e.key==="ArrowDown"?1:-1))); libMark(); const el=rs[LIB.sel]; if(el&&el.scrollIntoView) el.scrollIntoView({block:"nearest"}); return; }
  if(e.key==="Enter"&&!LIB.cur&&e.target.id==="libQ"&&rs.length){ e.preventDefault(); const b=rs[Math.min(LIB.sel,rs.length-1)]; if(b) libGo(b.getAttribute("data-lib-open")); return; }
  libKeyStep1(e); }
function libKeyStep1(e){
  if(e.key==="Backspace"&&LIB.cur&&e.target.id!=="libQ"){ e.preventDefault(); libBack(); }
}
function libWire(w){ let drag=null;
  libWireStep1(w);
  w.addEventListener("input",(e) =>{ if(e.target.id==="libQ") libInput(e.target.value); });
  const h=w.querySelector("#libH");
  h.addEventListener("pointerdown",(e) =>{ if(e.button>0||e.target.closest("button")||env.innerWidth<760) return; const r=w.getBoundingClientRect(); drag={x:e.clientX-r.left,y:e.clientY-r.top,id:e.pointerId}; try{ h.setPointerCapture(e.pointerId); }catch(er){} w.classList.add("mv"); });
  h.addEventListener("pointermove",(e) =>{ if(!drag||e.pointerId!==drag.id) return; const W=w.offsetWidth, H=w.offsetHeight, x=Math.max(8-W+120,Math.min(env.innerWidth-120,e.clientX-drag.x)), y=Math.max(0,Math.min(env.innerHeight-48,e.clientY-drag.y)); w.style.left=x+"px"; w.style.top=y+"px"; w.style.right="auto"; w.style.bottom="auto"; });
  const end=function(e){ if(!drag) return; drag=null; w.classList.remove("mv"); try{ __store.setItem("cs-lib-pos",JSON.stringify([parseInt(w.style.left,10),parseInt(w.style.top,10)])); }catch(er){} };
  h.addEventListener("pointerup",end); h.addEventListener("pointercancel",end); }
function libWireStep1(w){
  w.addEventListener("click",(e) =>{ const b=e.target.closest("button"), a=e.target.closest("[data-info]");
    if(a&&!b){ const sp=a.getAttribute("data-info"), m=/^(g|spn|cr):(.+)$/.exec(sp); e.stopPropagation(); e.preventDefault(); if(m) libGo((m[1]==="g"?"rule":m[1]==="spn"?"spell":"creature")+"|"+m[2].split("|")[0]); return; }
    if(a&&b&&b.hasAttribute("data-info")){ const sp2=b.getAttribute("data-info"), m2=/^(g|spn|cr):(.+)$/.exec(sp2); e.stopPropagation(); e.preventDefault(); if(m2) libGo((m2[1]==="g"?"rule":m2[1]==="spn"?"spell":"creature")+"|"+m2[2].split("|")[0]); return; }
    if(!b) return; const x=b.getAttribute("data-lib-x"), o=b.getAttribute("data-lib-open"), c=b.getAttribute("data-lib-cat");
    if(x==="close"){ libClose(); return; } if(x==="back"){ libBack(); return; }
    if(o){ libGo(o); return; }
    if(c){ LIB.cat=c; LIB.lim=60; LIB.scroll=0; libPaint(); return; }
    if(b.hasAttribute("data-lib-more")){ LIB.lim+=60; const bd=document.getElementById("libBd"), st=bd.scrollTop; bd.innerHTML=libSafe(); bd.scrollTop=st; libMark(); } });
}
export function libOpen(o){ o=o||{}; const w=libDom(), first=!LIB.idx;
  try{ if(typeof closeSheet==="function"&&document.getElementById("sheet")&&document.getElementById("sheet").classList.contains("on")&&o.fromSearch) closeSheet(); }catch(er){}
  const hv=document.getElementById("homeV"); w.style.zIndex=hv&&!hv.hidden?"60":"";
  w.hidden=false; LIB.on=1; if(o.q!=null){ LIB.q=o.q; LIB.cur=null; LIB.hist=[]; LIB.cat="all"; }
  const {qi}=libOpenStep1(w);
  const go=function(){ LIB.idx=libIndex(); LIB.inv=null; libSearch(); libPaint(); if(o.spec) libGo(o.spec,false); };
  if(LIB.idx){ libSearch(); libPaint(); if(o.spec) libGo(o.spec,false); } else { LIB.tries=0; const t=function(){ if(libReady()||LIB.tries>150){ go(); return; } LIB.tries++; setTimeout(t,80); }; try{ if(env.__bldNeed) env.__bldNeed(); }catch(er){} t(); }
  setTimeout(() =>{ try{ qi.focus({preventScroll:true}); if(env.innerWidth>=760) qi.select(); }catch(er){} },60); }
function libOpenStep1(w){
  if(env.innerWidth>=760&&!w.style.left){ let p=null; try{ p=JSON.parse(__store.getItem("cs-lib-pos")||"null"); }catch(er){} if(p&&p.length===2&&p[0]>-400&&p[0]<env.innerWidth-100&&p[1]>=0&&p[1]<env.innerHeight-50){ w.style.left=p[0]+"px"; w.style.top=p[1]+"px"; } else { w.style.left=Math.max(12,env.innerWidth-w.offsetWidth-28)+"px"; w.style.top="84px"; } w.style.right="auto"; }
  requestAnimationFrame(() =>{ w.classList.add("on"); });
  document.removeEventListener("keydown",libKey,true); document.addEventListener("keydown",libKey,true);
  const qi=document.getElementById("libQ"); qi.value=LIB.q; libPaint();
  return /** @type {any} */ ({qi});
}
const libDetail0=libDetail;
__set_libDetail(function(c,k){
 const {r}=libDetailStep1(c, k);
 libDetailStep2(r, c, k); return r; });
function libDetailStep1(c, k){
const r=libDetail0(c,k); if(r&&env.FLUFF&&env.FLUFF[c]){ const t=env.FLUFF[c][k]||env.FLUFF[c][r.t]; if(t) r.h+=libFeatBlock("Lore",t); }
  return /** @type {any} */ ({r});
}
function libDetailStep2(r, c, k){
if(r){ let im=null; if(env.QREFS&&env.QREFS[c]){ env.QREFS[c].forEach((q) =>{ if(q.n===k&&q.im) im=q.im; }); } if(!im&&env.QIMG&&env.QIMG[c]){ im=env.QIMG[c][k]||env.QIMG[c][r.t]||null; if(!im){ const qn=function(z){ return String(z||"").toLowerCase().replace(/[^a-z0-9]/g,""); }; env.__qimN=env.__qimN||{}; if(!env.__qimN[c]){ const mp={}; Object.keys(env.QIMG[c]).forEach((z) =>{ mp[qn(z)]=env.QIMG[c][z]; }); env.__qimN[c]=mp; } im=env.__qimN[c][qn(k)]||env.__qimN[c][qn(r.t)]||null; } } if(im) r.h='<img class="lib-im'+(im.indexOf("/tokens/")>0?' tok':'')+'" loading="lazy" decoding="async" alt="" src="data/img/'+encodeURI(im)+'.webp">'+r.h; }
}
env.__libHtml=function(c,k){ const d=libDetail(c,k); return d?d.h:null; };
/* test hook */
env.__linkKnown=function(k){ return GLOSS[k]?2:(LIB_RULES[k]?1:0); };
/* test hook (tests/invariants.py): does a [[link]] key have a glossary or rules entry */
env.__libIndex=function(){ const i=LIB.idx||libIndex(); return i.map((e) =>{ return [e.c,e.n,e.k]; }); };
/* test hook */
env.__libIdx=function(){ return LIB.idx; };
env.__libStats=function(){ if(!LIB.idx){ LIB.idx=libIndex(); LIB.inv=null; } libInv(); let po=0, tl=0; Object.keys(LIB.inv).forEach((w) =>{ po+=LIB.inv[w].length; }); let pl=0, n2=0; LIB.idx.forEach((e) =>{ tl+=e.t.length; pl+=(e.p||"").length; n2+=e.n.length+e.s.length; }); return {entries:LIB.idx.length,words:LIB.voc.length,postings:po,tchars:tl,pchars:pl,nschars:n2}; };
/* test hook: sizes of the Library index */
env.__libFind=function(q){ if(!LIB.idx){ LIB.idx=libIndex(); LIB.inv=null; } const o=LIB.q; LIB.q=q; libSearch(); const r=LIB.res.slice(0,6).map((x) =>{ return x[1].n+" ("+x[0]+")"; }); LIB.q=o; return r; };
/* v101: test hook */
env.__libScan=function(){ const idx=LIB.idx||libIndex(), res={}, box=document.createElement("div"), pats={tag:/\{@|\{=|\{#|\{\//,undef:/\bundefined\b|\[object|\bNaN\b/,esc:/&(amp|lt|gt|quot);|<\/?[a-z]+[ >]/i,dollar:/\$\{/,dbl:/\.\.(?!\.)|,,|\( ?\)|\[ ?\]/,empty:/^\s*$/}; idx.forEach((e) =>{ if(e.c==="homebrew") return; let d=null; try{ d=libDetail(e.c,e.k); }catch(er){ return; } if(!d||!d.h) return; box.innerHTML=d.h; const t=box.textContent||""; Object.keys(pats).forEach((k) =>{ if(pats[k].test(t)){ const r=res[k+"|"+e.c]=res[k+"|"+e.c]||{n:0,s:[]}; r.n++; if(r.s.length<4){ const m=pats[k].exec(t); r.s.push(e.n+" :: "+t.slice(Math.max(0,m.index-30),m.index+50).replace(/\s+/g," ")); } } }); }); return res; };
/* test hook: scans detail text for leftover markup */
env.__libAudit=function(){ const idx=LIB.idx||libIndex(), bad=[], cnt={}; idx.forEach((e) =>{ cnt[e.c]=(cnt[e.c]||0)+1; if(e.c==="homebrew") return; let d=null; try{ d=libDetail(e.c,e.k); }catch(er){ bad.push([e.c,e.k,String(er).slice(0,80)]); return; } if(!d||!d.t||!d.h||d.h.length<20) bad.push([e.c,e.k,"empty"]); }); return {n:idx.length,cnt:cnt,bad:bad.slice(0,20),nbad:bad.length}; };
/* v101: test hook, opens every entry once */
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-lib]"); if(!b) return; e.preventDefault(); const v=b.getAttribute("data-lib"); libOpen(v?{q:v,fromSearch:1}:{}); });
