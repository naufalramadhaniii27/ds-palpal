import {bindLive,ico,lateGet,svgI} from "./00a-reg-late-ports.js";import {STD_CONDS} from "./02-data-default-character.js";import {GLOSS} from "./03-data-glossary.js";import {C} from "./04-logic-storage.js";import {$,esc} from "./05-logic-helpers.js";import {D,richP} from "./06-logic-derivation.js";import {env} from "./00-env.js";import {infoHTML} from "./00a-reg-late-ports.js";
bindLive("featSpec",{get:function(){return featSpec;}});
bindLive("grpSpec",{get:function(){return grpSpec;}});
bindLive("resSpec",{get:function(){return resSpec;}});
bindLive("xlink",{get:function(){return xlink;}});
/* ================= DETAIL (info) BUILDERS ================= */
export function meta(c,s){ return '<div class="info-meta">'+(c?'<span class="info-cat">'+esc(c)+'</span>':'')+(s?'<span class="src">'+esc(s)+'</span>':'')+'</div>'; }
export function tileBd(label,val,bd){ return '<button type="button" class="tile bd" data-bd="'+bd+'"><span class="k">'+label+'</span><span class="v" style="font-size:24px">'+val+'</span></button>'; }
export function tileH(label,html){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:15px">'+html+'</span></div>'; }
export function tileS(label,val){ return '<div class="tile"><span class="k">'+label+'</span><span class="v" style="font-size:'+(String(val).length>8?'15px':'24px')+'">'+esc(val)+'</span></div>'; }
function featSpec(name){ const fs=C.features||[]; for(let g=0;g<fs.length;g++){ const it=fs[g].items||[]; for(let f=0;f<it.length;f++){ if(it[f].n===name) return "f:"+g+"."+f; } } return null; }
function grpSpec(kind){
  const fs=C.features||[], want={species:/species/i, bg:/background/i}[kind];
  for(let g=0;g<fs.length;g++){ const n=fs[g].g||"";
    if(want && want.test(n)) return "grp:"+g;
    if(kind==="class" && C.cls && n.trim().toLowerCase()===C.cls.trim().toLowerCase()) return "grp:"+g;
    if(kind==="sub" && C.sub && n.toLowerCase().indexOf(C.sub.toLowerCase())>=0) return "grp:"+g; }
  return null;
}
function resSpec(r){ if(r.k==="hd"||r.n==="Hit Dice") return "g:Hit Point Dice"; if(GLOSS[r.n]) return "g:"+r.n; return featSpec(r.f||r.n)||featSpec(r.n); }
export function linkify(text){
  return esc(text).split(/(,\s*)/).map((part) =>{
    const raw=part.replace(/&#39;/g,"'"), base=raw.replace(/\s*\(.*\)\s*$/,"").trim();
    return GLOSS[base] ? '<button type="button" class="lk" data-info="g:'+esc(base)+'">'+part+'</button>' : part;
  }).join("");
}
/* x-link: names of anything that has an entry in the database (spells, creatures, magic items, feats, rules, glossary words, conditions, rests, skills, actions,
   weapons, armor, gear, species, classes, subclasses, backgrounds, options, languages) become links to their detail. One index, one matcher, used by every text.
   An index value is [type, key, level]. Level 0: always a link. Level 1: a link unless the word only starts a sentence ("Fighter levels"). Level 2: a common
   English word that is also a name (Light, Range, Speed, Help): a link only when the next word makes it a term ("Help action", "Light property"). */
let XL_IDX=null, XL_KEY="", XL_STOP={"The":1,"A":1,"An":1,"Each":1,"Any":1,"Your":1,"This":1,"That":1,"One":1,"If":1,"When":1,"While":1,"You":1,"It":1,"Its":1,"On":1,"In":1,"At":1,"As":1,"For":1,"With":1,"Once":1,"Until":1,"After":1,"Before":1,"Any":1,"No":1,"Choose":1,"Cast":1,"Casts":1,"Roll":1,"Both":1,"Either":1,"All":1,"Other":1,"Another":1,"Of":1};
const XL_FIRM={"Advantage":1,"Disadvantage":1,"Darkvision":1,"Initiative":1,"Exhaustion":1,"Dash":1,"Disengage":1,"Dodge":1,"Utilize":1,"Grapple":1,"Shove":1,"Blindsight":1,"Truesight":1,"Tremorsense":1};/* single words that are always the term */
const XL_GEARC=/(?:^|\s)(?:weapon|armor)$|^Gear|pack$|^Ammunition|^Gaming set/i;/* glossary gear words: a plain name, may start a sentence */
const XL_TRIG=/^ (?:actions?|propert(?:y|ies)|mastery|masteries|conditions?|rules?)\b/;/* the word after a level 2 name that makes it a term */
function xlRules(){ return typeof lateGet("LIB_RULES")!=="undefined"?lateGet("LIB_RULES"):{}; }
let XL_KT=0; const XL_DIRTY=/[\[('’]|[^\S ]|\s\s|^\s|\s$/;/* a name that needs cleaning; most do not */
function xlClean(n){ n=String(n); return /[\[(']|[^\S ]|\s\s|^\s|\s$/.test(n)?n.replace(/\s*[\[(].*$/,"").replace(/\s+/g," ").trim().replace(/'/g,"\u0001"):n; }/* the same cleaning, without making copies of a name that is already clean */
const XL_EMPTY=(function(){ const e={}; Object.defineProperty(e,"__f",{value:{}}); return e; })();/* before the data parts are all in, the index would be built twice; it stays empty and the page is linked once when the data is ready */
function xlIdx(){
  if(!env.__deferDone) return XL_EMPTY;
  const tn=Date.now(); if(XL_IDX&&tn-XL_KT<250) return XL_IDX;/* the check below walks every table: once in a quarter second is enough */
  const {crs, sp, mi, ftk, Q, rl, cl, spc, bgs, key}=xlIdxStep1(tn);
  if(XL_IDX&&key===XL_KEY) return XL_IDX;
  const {m, put}=xlIdxStep2(Q);
  xlIdxStep3(Q, bgs, spc, cl, rl, put, m);
  xlIdxStep4(ftk, sp, crs, mi, m, key, put);
  return m;
}
function xlIdxStep1(tn){
  XL_KT=tn;
  const crs=(typeof CREATURES!=="undefined"&&CREATURES.creatures)||[], sp=(typeof SPELLS!=="undefined"&&SPELLS)||[], mi=(typeof DMGI!=="undefined"&&DMGI)||[], ftk=typeof FEATS!=="undefined"?Object.keys(FEATS):[], Q=env.QREFS||{}, rl=xlRules(), cl=typeof CLASSES!=="undefined"?CLASSES:{}, spc=typeof SPECIES!=="undefined"?SPECIES:{}, bgs=typeof BACKGROUNDS!=="undefined"?BACKGROUNDS:{};
  let qn=0; ["rule","optfeat","facility","hazard","disease","vehicle","object","language","feature","sub"].forEach((q) =>{ qn+=(Q[q]||[]).length; });/* never "monster": it is a lazy getter that inflates 4,500 rows */
  const key=sp.length+"|"+mi.length+"|"+crs.length+"|"+ftk.length+"|"+Object.keys(GLOSS).length+"|"+Object.keys(rl).length+"|"+Object.keys(cl).length+"|"+Object.keys(spc).length+"|"+Object.keys(bgs).length+"|"+qn+"|"+(typeof GEAR!=="undefined"?GEAR.length:0)+"|"+(typeof WEAPONS!=="undefined"?Object.keys(WEAPONS).length:0)+"|"+(typeof ARMOR!=="undefined"?Object.keys(ARMOR).join(",").length:0)+"|"+(typeof WEAPONS!=="undefined"?Object.keys(WEAPONS).join(",").length:0);
  return /** @type {any} */ ({crs, sp, mi, ftk, Q, rl, cl, spc, bgs, key});
}
function xlIdxStep2(Q){
  const m={}, F={}, reg=function(n){ const sp=n.indexOf(" "); let c=1; for(let q=sp;q>0;q=n.indexOf(" ",q+1)) c++; const w=sp>0?n.slice(0,sp):n; if(!(F[w]>=c)) F[w]=c; };/* F: first word of each name, and how many words the longest name has */
  Object.defineProperty(m,"__f",{value:F});
  const put=function(n,k,lv,nm){ n=String(n||""); if(XL_DIRTY.test(n)) n=n.replace(/\s*[\[(].*$/,"").replace(/\s+/g," ").trim().replace(/'/g,"\u0001").replace(/’/g,"\u0001"); if(n.length<3||!/^[A-Z][A-Za-z0-9+\u0001 -]*$/.test(n)||/^(?:Tiny|Small|Medium|Large|Huge|Gargantuan)$/.test(n)) return; const multi=n.indexOf(" ")>0; if(nm&&!multi) return; lv=multi?0:(lv==null?1:lv); m[n]=[k[0],k[1],lv]; reg(n);
    if(lv<2&&!/s$/.test(n)&&!m[n+"s"]){ m[n+"s"]=[k[0],k[1],lv]; reg(n+"s"); } };/* plural: Long Rests, Saving Throws, Bonus Actions */
  const one=function(list,type,pre,lv){ list.forEach((n) =>{ put(n,[type,pre+n],lv); }); };
  /* lowest priority first, later puts replace earlier ones */
  (Q.facility||[]).forEach((r) =>{ put(r.n,["lib","facility|"+r.n],1); });
  ["hazard","disease","vehicle","object"].forEach((c) =>{ (Q[c]||[]).forEach((r) =>{ put(r.n,["lib",c+"|"+r.n],0,1); }); });
  (Q.optfeat||[]).forEach((r) =>{ put(r.n,["lib","optfeat|"+r.n],0,1); });
  (Q.feature||[]).forEach((r) =>{ put(r.n,["lib","feature|"+r.n],0,1); });
  return /** @type {any} */ ({m, put});
}
function xlIdxStep3(Q, bgs, spc, cl, rl, put, m){
  (Q.language||[]).forEach((r) =>{ if(r.n!=="Common") put(r.n,["lib","language|"+r.n],1); });
  if(typeof MANEUVERS!=="undefined") MANEUVERS.forEach((x) =>{ put(x[0],["lib","opt|man|"+x[0]],1); });
  if(typeof INVOCATIONS!=="undefined") INVOCATIONS.forEach((x) =>{ put(x[0],["lib","opt|inv|"+x[0]],1); });
  if(typeof METAMAGIC!=="undefined") METAMAGIC.forEach((x) =>{ put(x[0],["lib","opt|mm|"+x[0]],1); });
  if(typeof GEAR!=="undefined") GEAR.forEach((x) =>{ if(!/[(\[]/.test(x[0])) put(x[0],["lib","gear|"+x[0]],1); });
  Object.keys(bgs).forEach((n) =>{ put(n,["lib","bg|"+n],1); });
  Object.keys(spc).forEach((n) =>{ put(n,["lib","species|"+n],1); });
  Object.keys(cl).forEach((c) =>{ put(c,["lib","class|"+c],1); Object.keys(cl[c].subs||{}).forEach((s) =>{ put(s,["lib","sub|"+s],1); }); });
  (Q.sub||[]).forEach((r) =>{ put(r.n,["lib","sub|"+r.n],1); });
  Object.keys(GLOSS).forEach((n) =>{ const c=String(GLOSS[n].c||""), gear=XL_GEARC.test(c); put(n,["g",n],XL_FIRM[n]||/^Condition/.test(c)?0:/^Skill|^Ability/.test(c)||gear?1:2); });
  Object.keys(rl).forEach((n) =>{ const k0=xlClean(n); if(!(m[k0]&&m[k0][2]<2)) put(n,["lib","rule|"+n],2); });
  (Q.rule||[]).forEach((r) =>{ if(!m[xlClean(r.n)]) put(r.n,["lib","rule|"+r.n],0,1); });
  if(typeof WEAPONS!=="undefined") Object.keys(WEAPONS).forEach((n) =>{ put(n,["lib","gear|"+n],1); });
}
function xlIdxStep4(ftk, sp, crs, mi, m, key, put){
  if(typeof ARMOR!=="undefined") Object.keys(ARMOR).forEach((n) =>{ put(n,["lib","gear|"+n],1); });
  ftk.forEach((n) =>{ put(n,["lib","feat|"+n],1); });
  sp.forEach((x) =>{ const n0=String(x[0]), k0=XL_DIRTY.test(n0)?n0.replace(/\s+/g," ").trim().replace(/'/g,"\u0001"):n0, old=m[k0]; put(x[0],["spn",x[0]],1); if(old&&m[k0]&&m[k0][0]==="spn") m[k0][3]=old; });
  crs.forEach((c) =>{ put(c.n,["cr",c.n],1); });
  mi.forEach((r) =>{ if(r&&r[0]) put(r[0],["mi",r[0]],1); });
  const again=!!XL_KEY; XL_IDX=m; XL_KEY=key; if(again&&typeof xlQueue==="function"&&XL_OBS){ ["app","sheetBody"].forEach((i) =>{ const ap=document.getElementById(i); if(ap) xlQueue(ap); }); }/* the data changed (a source was switched): link the page again */
}
export let XL_SELF="", XL_CM=null, XL_CK=-1;
export function __set_XL_SELF(v){ return XL_SELF=v; }
/* the index plus the open character's own features: a feature name printed on its own card (Interrupt: Used:) opens that feature */
function xlMap(){
  const _xlMapStep1=xlMapStep1();
  const {m, fs}=_xlMapStep1;
  let {key}=_xlMapStep1;
  if(XL_CM&&XL_CM.__b===m&&XL_CK===key) return XL_CM;
  const {o}=xlMapStep2(m, fs, key); return o;
}
function xlMapStep1(){
  const m=xlIdx(), fs=C.features||[]; let key=(D&&D.res||[]).length;
  for(let i=0;i<fs.length;i++) key=(key*131+(fs[i].items||[]).length+1)%1000000007;/* a number, not a string: this runs on every text */
  return /** @type {any} */ ({m, fs, key});
}
function xlMapStep2(m, fs, key){
  const o=Object.create(m), F=Object.create(m.__f), reg=(n) =>{ const w=n.split(" ")[0], c=n.split(" ").length; if(!(F[w]>=c)) F[w]=c; }; Object.defineProperty(o,"__b",{value:m}); Object.defineProperty(o,"__f",{value:F});
  fs.forEach((g,gi) =>{ (g.items||[]).forEach((f,fi) =>{ const n=String(f.n||"").replace(/\s*[\[(].*$/,"").replace(/\s+/g," ").trim().replace(/['\u2019]/g,"\u0001"); if(n.length>2&&/^[A-Z][A-Za-z0-9+\u0001 -]*$/.test(n)&&!(n in o)) o[n]=["f",gi+"."+fi,n.indexOf(" ")>0?0:3]; reg(n); }); });
  (D&&D.res||[]).forEach((r) =>{ const n=String(r.n||"").replace(/\s+/g," ").trim().replace(/['\u2019]/g,"\u0001"); if(n.length<3||!/^[A-Z][A-Za-z0-9+\u0001 -]*$/.test(n)||(n in o)) return; let sp=null; try{ sp=resSpec(r); }catch(er){} if(sp){ const i=sp.indexOf(":"); o[n]=[sp.slice(0,i),sp.slice(i+1),n.indexOf(" ")>0?0:3]; reg(n); } });
  XL_CM=o; XL_CK=key;
  return /** @type {any} */ ({o});
}
/* the matcher: finds the names in one run of text. t holds apostrophes as \u0001. Returns [start,end,[type,key]] for each name, longest first, left to right */
function xlScan(t,atStart,selfK,mode,m){
  const _xlScan2Step1=xlScan2Step1(m, t);
  const {ta, tb, res, F, n0}=_xlScan2Step1;
  const {p}=_xlScan2Step1;
  xlScanTokens(t, n0, p, ta, tb);
  let {i}=xlScan2Step2();
  while(i<ta.length){
    const a=ta[i], ch=t.charAt(a); let hit=null, len=0;
    if(ch>="A"&&ch<="Z"){
      const mx=F?F[t.slice(a,tb[i])]:6;/* the longest name that starts with this word; none: nothing to look up */
      for(let L=Math.min(6,mx||0,ta.length-i);L>=1;L--){
        let ok=true; for(let j=i+1;j<i+L;j++){ if(t.slice(tb[j-1],ta[j])!==" "){ ok=false; break; } }
        if(!ok) continue;
        const ph=t.slice(a,tb[i+L-1]); let k=m[ph]; if(!k) continue;
        if(ph===selfK) break;
        if(L===1||ph.indexOf(" ")<0){
          k=xlScanGate(k, t, a, i, L, tb, atStart); if(k===null) break;
        }
        let kk=k; if(mode==="b"){ if(k[0]==="spn"||k[1].indexOf("feat|")===0) break;/* the builder links spells and feats itself */ if(k[0]==="g") kk=["lib","rule|"+k[1]]; }
        hit=kk; len=L; break;
      }
    }
    if(hit){ res.push([a,tb[i+len-1],hit]); i+=len; } else i++;
  }
  return res;
}
function xlScanTokens(t, n0, p, ta, tb){
  while(p<n0){
    let c=t.charCodeAt(p);
    if(xlScanPart1(c)){ const s0=p; p++; while(p<n0){ c=t.charCodeAt(p); if(xlScanPart2(c)) p++; else break; } ta.push(s0); tb.push(p); }
    else p++;
  }
}
function xlScanGate(k, t, a, i, L, tb, atStart){
          const e0=tb[i+L-1], pw=/([A-Za-z][A-Za-z\u0001-]*) $/.exec(t.slice(Math.max(0,a-30),a));
          if(xlScanPart3(pw)) return null;/* part of a longer proper name, such as "Gamma Knight" */
          if(xlScanPart4(k, t, e0, a)) k=k[3];/* a spell that shares its name with a rule word (Light, Slow, Darkness): the rule word unless a spell is meant */
          if(k[2]===3&&!/^[\s.,:;)]|^$/.test(t.slice(e0,e0+1))) return null;/* a one-word feature of this character: a link when it stands alone or before a colon */
          if(k[2]===2&&!XL_TRIG.test(t.slice(e0,e0+14))) return null;/* a common word: only a term when "action", "property" or "mastery" follows */
          if(xlScanPart5(k)){
            const bf=t.slice(0,a), ss=bf.trim()?/[.!?:]\s*$/.test(bf):atStart;/* a sentence start: leave it plain unless the whole text is the name */
            if(xlScanPart6(ss, t, e0)) return null;/* "Spear, Shortbow": the start of a list is a name */
            if(xlScanPart7(k, t, e0)) return null;/* followed by a capital: part of a longer name */
          }
          if(k[0]==="lib"&&k[1].indexOf("feat|")===0){ const sf=t.slice(0,a).split(/[.!?:]\s/).pop(); if(!/\bfeats?\b/i.test(sf)) return null; }
          if(k[0]==="spn"&&!/^: Used/.test(t.slice(e0,e0+7))){ const sent=t.slice(0,a).split(/[.!?:]\s/).pop(); if(!/\b(?:spells?|cast|casts|casting|cantrips?)\b/i.test(sent)) return null; }
          return k;
}
function xlScanPart1(c){ return ((c>=65&&c<=90)||(c>=97&&c<=122)||(c>=48&&c<=57)||c===43||c===1||c===0x2019||c===45); }
function xlScanPart2(c){ return ((c>=65&&c<=90)||(c>=97&&c<=122)||(c>=48&&c<=57)||c===43||c===1||c===0x2019||c===45); }
function xlScanPart3(pw){ return (pw&&/^[A-Z]/.test(pw[1])&&!XL_STOP[pw[1]]); }
function xlScanPart4(k, t, e0, a){ return (k[0]==="spn"&&k[3]&&!/^: Used/.test(t.slice(e0,e0+7))&&!/\b(?:spells?|cast|casts|casting|cantrips?)\b/i.test(t.slice(0,a).split(/[.!?:]\s/).pop())); }
function xlScanPart5(k){ return (k[2]===1&&k[0]!=="spn"&&k[1].indexOf("feat|")!==0); }
function xlScanPart6(ss, t, e0){ return (ss&&t.slice(e0).replace(/[\s.,:;)]+$/,"")!==""&&!/^\s*,\s+[A-Z]/.test(t.slice(e0,e0+40))); }
function xlScanPart7(k, t, e0){ return (k[0]==="lib"&&/^(?:gear|bg|class|sub|species)\|/.test(k[1])&&/^ [A-Z]/.test(t.slice(e0,e0+2))); }
function xlScan2Step1(m, t){
  const _xlScanStep1=xlScanStep1(m, t);
  const {ta, tb, res, F, n0}=_xlScanStep1;
  let {p}=_xlScanStep1;
  return /** @type {any} */ ({ta, tb, res, F, n0, p});
}
function xlScan2Step2(){
  let {i}=xlScanStep2();
  return /** @type {any} */ ({i});
}
function xlScanStep1(m, t){
  const ta=[], tb=[], res=[], F=m.__f, n0=t.length; let p=0;/* word starts and ends, found by character code: no match arrays are made */
  return /** @type {any} */ ({ta, tb, res, F, n0, p});
}
function xlScanStep2(){
  let i=0;
  return /** @type {any} */ ({i});
}
export function xlink(h,self,mode){
  self=self||XL_SELF; h=String(h==null?"":h); if(!h||h.indexOf("<")<0&&h.length<3) return h;
  const m=xlMap(), selfK=String(self||"").replace(/&#39;/g,"'").replace(/'/g,"\u0001"); let depth=0, first=true;
  return h.split(/(<[^>]+>)/).map((p) =>{
    if(p.charAt(0)==="<"){ if(/^<(button|a)[\s>]/i.test(p)) depth++; else if(/^<\/(button|a)>/i.test(p)) depth=Math.max(0,depth-1); return p; }
    if(depth||p.length<3) return p;
    const atStart=first; if(p.trim()) first=false;
    const t=p.replace(/&#39;/g,"\u0001"), ms=xlScan(t,atStart,selfK,mode,m);
    if(!ms.length) return t.replace(/\u0001/g,"&#39;");
    let out="", pos=0;
    ms.forEach((x) =>{ const hit=x[2], nm_=hit[1].replace(/&/g,"&amp;").replace(/"/g,"&quot;"); out+=t.slice(pos,x[0])+(mode==="b"?'<button type="button" class="lnk" data-lnk="'+hit[0]+'|'+nm_+'">':'<button type="button" class="lk xl" data-info="'+hit[0]+':'+nm_+'">')+t.slice(x[0],x[1])+'</button>'; pos=x[1]; });
    return (out+t.slice(pos)).replace(/\u0001/g,"&#39;");
  }).join("");
}
/* The same matcher on the page itself. Text that is printed by code that never calls xlink (class lists, skill lists, labels, "Used:" rows, detail tables)
   gets its links here. A mutation observer queues what the page adds; one pass links the names in the plain text nodes. It never touches text inside
   a button, link, input, heading or any element that already opens something, and it never changes a saved value. */
const XL_SKIP="a,button,input,textarea,select,option,script,style,svg,canvas,label,summary,h1,h2,h3,[contenteditable],[data-info],[data-bd],[data-lib-open],[data-lnk],[data-xl-off],[role=button],[role=tab],[role=menuitem],[role=option],[role=link],.fcat,#speeds,.toast,#toasts,.lk,.lnk,.ask,.swp";
let XL_Q=new Set(), XL_T=0, XL_OBS=null, XL_FORCE=0;
function xlDomRoot(el){ if(el.closest("#bld")) return "b"; if(el.closest("#sheetBody")) return "s"; if(el.closest("#libBd")) return "s"; if(el.closest("#app")) return "a"; return ""; }
function xlDom(el){
  const k=xlDomRoot(el); if(!k||(el.closest&&el.closest(XL_SKIP))) return 0;
  const m=k==="b"?xlIdx():xlMap(), mode=k==="b"?"b":undefined, ttl=k==="s"?(el.closest("#libBd")?($("#libT")||{}):($("#sheetTitle")||{})).textContent||"":"", selfK=String(ttl).replace(/'/g,"\u0001").replace(/’/g,"\u0001").trim();
  const W=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,{acceptNode:(n) =>{ const v=n.nodeValue; return v&&v.length>=3&&/[A-Z]/.test(v)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT; }}), nodes=[]; let n;
  while((n=W.nextNode())) nodes.push(n);
  let cnt=0;
  nodes.forEach((n) =>{ const pe=n.parentElement; if(!pe||pe.closest(XL_SKIP)) return;
    const t=n.nodeValue.replace(/['’]/g,"\u0001"), ms=xlScan(t,!n.previousSibling,selfK,mode,m); if(!ms.length) return;
    const fr=document.createDocumentFragment(); let pos=0;
    ms.forEach((x) =>{ const hit=x[2], b=document.createElement("button"); b.type="button"; if(mode==="b"){ b.className="lnk"; b.setAttribute("data-lnk",hit[0]+"|"+hit[1]); } else { b.className="lk xl"; b.setAttribute("data-info",hit[0]+":"+hit[1]); }
      if(x[0]>pos) fr.appendChild(document.createTextNode(n.nodeValue.slice(pos,x[0]))); b.textContent=n.nodeValue.slice(x[0],x[1]); fr.appendChild(b); pos=x[1]; cnt++; });
    if(pos<n.nodeValue.length) fr.appendChild(document.createTextNode(n.nodeValue.slice(pos)));
    n.parentNode.replaceChild(fr,n); });
  return cnt;
}
function xlFlush(){
  XL_T=0; if(!env.__deferDone&&!XL_FORCE){ XL_T=setTimeout(xlFlush,300); return; } if(!XL_FORCE){ const ap=document.getElementById("app"), hv=document.getElementById("homeV"); if(document.documentElement.classList.contains("st-wait")||(ap&&(!ap.offsetParent||(hv&&hv.offsetParent)))){ XL_T=setTimeout(xlFlush,700); return; } }/* Home is showing: the sheet is not drawn, so wait. The index is not built until a sheet is open */
  XL_FORCE=0; const q=Array.from(XL_Q); XL_Q=new Set(); if(!q.length) return;
  if(XL_OBS) XL_OBS.disconnect();/* our own edits must not queue again */
  try{ q.forEach((el) =>{ if(el.isConnected) xlDom(el); }); }catch(er){ try{ console.error("xl",er); }catch(e2){} }
  if(XL_OBS) XL_OBS.observe(document.body,{childList:true,subtree:true});
}
function xlQueue(el){ if(!el||el.nodeType!==1) return; XL_Q.add(el); if(!XL_T) XL_T=setTimeout(xlFlush,30); }
function xlStart(){
  if(XL_OBS||typeof MutationObserver==="undefined"||!document.body) return;
  XL_OBS=new MutationObserver((recs) =>{ for(let i=0;i<recs.length;i++){ const r=recs[i];
    for(let j=0;j<r.addedNodes.length;j++){ const a=r.addedNodes[j]; if(a.nodeType===1){ if(xlDomRoot(a)) xlQueue(a); } else if(a.nodeType===3&&r.target.nodeType===1&&xlDomRoot(r.target)) xlQueue(r.target); } } });
  XL_OBS.observe(document.body,{childList:true,subtree:true});
  ["#app","#sheetBody"].forEach((s) =>{ const e=document.querySelector(s); if(e) xlQueue(e); });
}
if(document.body) xlStart(); else document.addEventListener("DOMContentLoaded",xlStart);
document.addEventListener("bldready",() =>{ ["app","sheetBody"].forEach((i) =>{ const ap=document.getElementById(i); if(ap) xlQueue(ap); }); });/* the data is in: link what was drawn while the index was empty */
env.__xlDom=xlDom;env.__xlQ=function(){ return [XL_Q.size,XL_T,!!XL_OBS]; };env.__xlFlush=function(){ if(XL_T){ clearTimeout(XL_T); } XL_FORCE=1; xlFlush(); };/* test hook: link now */
env.__xl={xlink:xlink,info:function(k){return infoHTML(k)},idx:function(){ XL_KT=0; return xlIdx(); },rules:xlRules};/* test hook */
export function miHTML(n){
  const r=(typeof DMGI!=="undefined"?DMGI:[]).filter((x) =>{ return x[0]===n; })[0];
  if(!r) return {t:n, h:'<p class="info-d">Not found.</p>'};
  const h='<div class="dc dc-i">'+dcHead(ico("ui-hand","isch"),esc(r[1]+" • "+r[2]+(r[3]?" • Requires attunement":"")))+'</div><div class="idetail"><p class="info-d">'+kwChips(xlink(richP(r[4]),n))+'</p></div>';
  return {t:n, h:h};
}
export const NUM_MAP={"Armor Class":"ac","Initiative":"init","Speed":"speed","Proficiency Bonus":"pb","Hit Points":"hp","Carrying Capacity":"carry","Grapple":"dc","Shove":"dc","Passive Perception":"pas-per"};
/* v36 p14: one detail-card template (head, 4-cell strip, number blocks, body, At your level, use buttons, foot) */
const KW_LIST=["Temporary Hit Points","Opportunity Attack","Heroic Inspiration","Bonus Action","Hit Points","Short Rest","Long Rest","Saving Throw","Reaction","Advantage","Disadvantage","Concentration"].concat(STD_CONDS);
export function kwChips(html){ let seen={}, depth=0;
  return String(html).split(/(<[^>]+>)/).map((p) =>{
    if(p.charAt(0)==="<"){ if(/^<(button|a)[\s>]/i.test(p)) depth++; else if(/^<\/(button|a)>/i.test(p)) depth=Math.max(0,depth-1); return p; }
    if(depth||!p) return p;
    KW_LIST.forEach((k) =>{ if(seen[k]||!GLOSS[k]) return; const re=new RegExp("\\b"+k+"\\b"); if(re.test(p)){ seen[k]=1; p=p.replace(re,'\u0001'+k+'\u0002'); } });
    return p.replace(/\u0001([^\u0002]+)\u0002/g,(m,k) =>{ return '<button type="button" class="lk kw" data-info="g:'+esc(k)+'">'+esc(k)+'</button>'; }); }).join(""); }
export function fKind(f){ const k=Object.keys(ACTS).filter((q) =>{ return q.split("|").pop()===f.n; })[0], a=k&&ACTS[k][0]; return a?({action:"Action",bonus:"Bonus Action",reaction:"Reaction",other:"Special"}[a[0]]||"Special"):"Passive"; }
export function fKindIco(t){ return /^Bonus/.test(t)?"time-bonus":/^Reaction/.test(t)?"time-reaction":t==="Action"?"time-action":"time-long"; }
export function dcItem(html){ let P={}, h=String(html||"");
  h=h.replace(/<dt>([^<]+)<\/dt>\s*<dd>([\s\S]*?)<\/dd>/g,(m,k,v) =>{ P[k]=v; return m; });
  const pick=P["Armor Class"]!=null?[["Armor Class","AC","ui-shield"],["Strength","Strength","ab-str"],["Stealth","Stealth","ui-stealth"],["Cost","Cost","ui-cost"]]:P["Damage"]!=null?[["Damage","Damage","hp-damage"],["Damage Type","Type","item-weapon"],["Proficient","Proficient","ui-prof"],["Cost","Cost","ui-cost"]]:[["Weight","Weight","ui-weight"],["Cost","Cost","ui-cost"]];
  let cells=[], rest=h; pick.forEach((q) =>{ if(P[q[0]]==null) return; cells.push([q[2],q[1],P[q[0]],q[0]==="Damage Type"&&lateGet("DT_ICON")[String(P[q[0]]).replace(/<[^>]*>/g,"").trim().split(/[ ,]/)[0]]?svgI(lateGet("DT_ICON")[String(P[q[0]]).replace(/<[^>]*>/g,"").trim().split(/[ ,]/)[0]],"ico dc-ci",""):""]); const re=new RegExp("<dt>"+q[0]+"</dt>\\s*<dd>[\\s\\S]*?</dd>"); rest=rest.replace(re,""); });
  const kind=(/<i>([^<]{2,40})<\/i>/.exec(h)||[])[1]||"Item";
  rest=rest.replace(/<p>\s*<i>[^<]+<\/i>\s*<\/p>/,"");
  return {h:dcHead(ico(P["Armor Class"]!=null?"ui-shield":"ui-hand","isch"),esc(kind))+(cells.length?dcStrip(cells):""), rest:rest}; }
export function dcHead(badge,sub){ return '<div class="dc-head"><span class="dc-badge">'+badge+'</span><div class="dc-sub">'+sub+'</div></div>'; }
export function dcStrip(a,cls){ return '<div class="dc-strip'+(cls?' '+cls:'')+'">'+a.map((c) =>{ return '<div class="dc-cell"><span class="dc-ico">'+(c[3]||ico(c[0],"dc-ci"))+'</span><div class="dc-tx"><small>'+esc(c[1])+'</small><b>'+c[2]+'</b></div></div>'; }).join("")+'</div>'; }/* v38 p11 */
export function wCell(ik,lab,val,bd,raw){ const inner='<span class="dc-ico">'+(raw||ico(ik,"dc-ci"))+'</span><div class="dc-tx"><small>'+esc(lab)+'</small><b>'+val+'</b></div>'; return bd?'<button type="button" class="dc-cell bd" data-bd="'+bd+'">'+inner+'</button>':'<div class="dc-cell">'+inner+'</div>'; }/* v38 p14 */
export function dcFoot(l,r){ return '<div class="dc-foot"><b>'+l+'</b><span>'+r+'</span></div>'; }
