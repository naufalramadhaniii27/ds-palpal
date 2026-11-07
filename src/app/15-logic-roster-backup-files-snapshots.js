import {copyText} from "./lib/clipboard.js";
import {LOGO_IMG} from "./01-logic-boot-flags-builder-loader.js";
import {APP_DATE,APP_LABEL,APP_VER,C,CKEY,FROZEN,KEY,S,SAVE_FAIL,SNKEY,S_RAW,__set_S_RAW,cSaveT,clsLv,fmtAgo,lsGet,lsSave,lsSet,saveT} from "./04-logic-storage.js";
import {ask,esc,toast} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {PALS,dataUri,uiGet} from "./07-ui-theme-contrast-spring.js";
import {esArt} from "./08c-ui-render-inventory-features-notes.js";
import {BKEY,RKEY,rEnsure,rGet,rSave,setOrDel} from "./14-ui-editor.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"SN_BAD",{get:function(){return SN_BAD;},set:function(v){SN_BAD=v;},configurable:true});
Object.defineProperty(__R,"bkpKeyOk",{get:function(){return bkpKeyOk;},set:function(v){bkpKeyOk=v;},configurable:true});
Object.defineProperty(__R,"bkpName",{get:function(){return bkpName;},set:function(v){bkpName=v;},configurable:true});
Object.defineProperty(__R,"bkpOpen",{get:function(){return bkpOpen;},set:function(v){bkpOpen=v;},configurable:true});
Object.defineProperty(__R,"fmtT",{get:function(){return fmtT;},set:function(v){fmtT=v;},configurable:true});
Object.defineProperty(__R,"healHTML",{get:function(){return healHTML;},set:function(v){healHTML=v;},configurable:true});
Object.defineProperty(__R,"healUse",{get:function(){return healUse;},set:function(v){healUse=v;},configurable:true});
Object.defineProperty(__R,"showHome",{get:function(){return showHome;},set:function(v){showHome=v;},configurable:true});
Object.defineProperty(__R,"snGet",{get:function(){return snGet;},set:function(v){snGet=v;},configurable:true});
Object.defineProperty(__R,"snTake",{get:function(){return snTake;},set:function(v){snTake=v;},configurable:true});
Object.defineProperty(__R,"uiSet",{get:function(){return uiSet;},set:function(v){uiSet=v;},configurable:true});
Object.defineProperty(__R,"updUnsaved",{get:function(){return updUnsaved;},set:function(v){updUnsaved=v;},configurable:true});
/* v24 p08: the hidden empty place of a first public visit */
export function rPh(r){ return Object.keys((r||{}).chars||{}).filter((id) =>{ return r.chars[id].ph; }); }
/* v18 RL47: the roster entry keeps its other fields (created, file marks, fields of newer versions). B, C, S come from memory, so a full storage cannot put an old copy in the roster */
export function rSnap(r){if(FROZEN)return r;clearTimeout(cSaveT);clearTimeout(saveT);lsSave(CKEY,C);if(lsSave(KEY,S))__set_S_RAW(JSON.stringify(S));const o=r.chars[r.active]||{};o.name=C.name;o.sub=(C.species||"")+" "+clsLv();o.B=lsGet(BKEY);o.C=JSON.stringify(C);o.S=JSON.stringify(S);o.t=Date.now();r.chars[r.active]=o;rSave(r);return r}
/* V18-1: switching characters must never lose the open one. Stop when the roster (which holds the open character's latest copy) cannot be saved.
   The shared slots are written one by one, and put back as they were if storage runs out half way */
export function rLoad(r,id,openB){const t=r.chars[id],prev=r.active;if(!t||FROZEN)return false;r.active=id;rPh(r).forEach((k) =>{ if(k!==id) delete r.chars[k]; });/* v24 p08 */
 if(!rSave(r)||SAVE_FAIL){r.active=prev;toast("Storage is full, so the character was not switched and nothing was lost. Back up, then make room.");return false}
 let old=[[CKEY,lsGet(CKEY)],[KEY,lsGet(KEY)],[BKEY,lsGet(BKEY)]],nv=[[CKEY,t.C||null],[KEY,t.S||null],[BKEY,t.B||null]],ok=true;
 nv.forEach((p) =>{if(!ok)return;if(p[1]==null){try{__store.removeItem(p[0])}catch(e){}}else if(!lsSet(p[0],p[1]))ok=false});
 if(!ok){old.forEach((p) =>{try{if(p[1]==null)__store.removeItem(p[0]);else __store.setItem(p[0],p[1])}catch(e){}});r.active=prev;rSave(r);toast("Storage is full, so the character was not switched and nothing was lost. Back up, then make room.");return false}
 if(openB)try{__store.setItem("cs-new","1")}catch(e){}__miReload();return true}
function charInfo(id,r){let c=r.chars[id]||{},Cc=null,Ss=null;try{Cc=id===r.active?C:JSON.parse(c.C||"null")}catch(e){}try{Ss=id===r.active?S:JSON.parse(c.S||"null")}catch(e){}
 Cc=Cc||{};Ss=Ss||{};const lv=Cc.clsLabel||((Cc.cls||"")+" "+(Cc.level||1));return {id:id,name:Cc.name||c.name||"Unnamed",level:+Cc.level||1,species:(Cc.species||"").split(" (")[0],cls:Cc.cls||"",sub:Cc.sub||"",label:Cc.clsLabel||"",camp:(typeof Ss.camp==="string"?Ss.camp.trim():Cc.office)||"",por:(/^(data:image\/|blob:|https?:)/.test(Ss.portrait||"")?Ss.portrait:""),color:Ss.color||"forest",sym:Ss.sym||"star",created:c.created||c.t||0}}
let homeQ="",homeSort="created";
/* T3: the Home hero, "Continue your adventure", for the character that is open now. Hidden while a search is typed */
function homeHero(){ const r=rEnsure(), id=r.active&&r.chars[r.active]&&!r.chars[r.active].ph?r.active:Object.keys(r.chars).filter((k) =>{ return !r.chars[k].ph; })[0]; if(!id) return "";
  const x=charInfo(id,r), p=PALS[x.color]||PALS.forest, line=x.label?("Level "+x.level+" | "+x.species+" | "+x.label):("Level "+x.level+" | "+x.species+" | "+x.cls+(x.sub?"/"+x.sub:"")),
    words=esc(x.name).split(/\s+/).map((w,i) =>{ return '<span class="hhw" style="--i:'+i+'"><span>'+w+'</span></span>'; }).join(" ");
  return '<section class="hhero" id="hxHero"'+(homeQ?' hidden':'')+' aria-labelledby="hxN" style="--hc1:'+p[1]+';--hc2:'+p[2]+'"><span class="hheb">Continue your adventure</span>'+
    '<span class="hhpor'+(x.por?' has':'')+'" style="'+(x.por?'background-image:url('+x.por+')':'')+'">'+(x.por?'':homeSil(x))+'</span>'+
    '<div class="hhtx"><h2 class="hhname" id="hxN">'+words+'</h2><p class="hhmeta">'+esc(line)+'</p>'+homeSum(id,r)+
    '<div class="hhbtn"><button type="button" class="hcreate hhgo" data-hview="'+id+'"><span class="hbt">Continue</span></button><button type="button" class="hbk" data-hall="1"><span class="hbt">All characters</span></button></div></div></section>'; }
/* T4 item 24: session summary under the hero name (HP, conditions, exhaustion, Inspiration). Only for the open character, the others have no derived Hit Point maximum */
function homeSum(id,r){ try{ if(id!==r.active||typeof D==="undefined"||!D||!D.hpmax||typeof S==="undefined"||!S) return "";
  const a=[], hp=+S.hp; if(!isNaN(hp)) a.push(['HP '+hp+' / '+D.hpmax, hp<=0?'bad':hp<D.hpmax/2?'warn':'']);
  const cn=Object.keys(S.cond||{}).filter((k) =>{ return S.cond[k]; }); if(cn.length) a.push([cn.slice(0,2).join(", ")+(cn.length>2?" +"+(cn.length-2):""),'warn']);
  if(+S.exh>0) a.push(['Exhaustion '+(+S.exh),'warn']); if(S.insp) a.push(['Inspiration','']);
  if(!a.length) return ""; return '<ul class="hhsum" aria-label="Where you left off">'+a.map((x) =>{ return '<li'+(x[1]?' class="'+x[1]+'"':'')+'>'+esc(x[0])+'</li>'; }).join("")+'</ul>'; }catch(er){ return ""; } }
/* v32 p28 C12: the class silhouette of the sheet portrait (v30) with the class icon, when a character has no portrait */
function homeSil(x){ const ck=(typeof __R.icoCls==="function")?__R.icoCls(x.label||x.cls):"", ci=ck&&typeof __R.ICO==="object"&&__R.ICO&&__R.ICO[ck]?__R.ico(ck,"hpor-ci"):"";
  return '<svg class="hpor-sil" viewBox="0 0 100 125" aria-hidden="true"><path d="M50 16c-13.5 0-23 10.5-23 25 0 8.6 3.6 16.2 9.4 21C22.6 66.8 13 78 10.5 94L9 125h82l-1.5-31C87 78 77.4 66.8 63.6 62c5.8-4.8 9.4-12.4 9.4-21 0-14.5-9.5-25-23-25z"/></svg>'+(ci?'<span class="hpor-c" title="'+esc(x.cls||"")+'">'+ci+'</span>':''); }
const HCMD=[["Create a Character","create new character","[data-hnew]"],["Open a character from a file","open import file","[data-hbk=open]"],["Back up characters","back up backup export save","[data-hbk=out]"],["Restore from a backup","restore backup import","[data-hbk=in]"],["Open the party","party group","[data-hparty]"],["Settings","settings storage backup details gear","[data-hbk=info]"]];
function hcmdList(){ const a=HCMD.slice(); if(typeof __R.PWA_EV!=="undefined"&&__R.PWA_EV) a.push(["Install the app","install app pwa home screen",".happ [data-pwainst]"]); return a; }
function homeLibBtn(){const q=homeQ.trim();return q.length>=2&&typeof __R.libOpen==="function"?'<button type="button" class="hbk hcmd" data-hlib="'+esc(q)+'"><span class="hbt">Search the library for "'+esc(q.length>24?q.slice(0,24)+"...":q)+'"</span></button>':""}
function homeCmds(){const q=homeQ.trim().toLowerCase();if(!q)return "";let m=hcmdList().filter((c) =>{return (c[0]+" "+c[1]).toLowerCase().indexOf(q)>=0});if(!m.length)m=[];
 return '<div class="hcmds" role="group" aria-label="Commands">'+m.map((c) =>{return '<button type="button" class="hbk hcmd" data-hcmd="'+c[2]+'"><span class="hbt">'+esc(c[0])+'</span></button>'}).join("")+homeLibBtn()+'</div>'}
export function homeCards(noSnap){return homeCmds()+homeCards1(noSnap)}
function homeCards1(noSnap){let r=noSnap?rEnsure():rSnap(rEnsure()),list=Object.keys(r.chars).filter((id) =>{return !r.chars[id].ph&&__R.campKeep(id,r)})/* v27 RU64 */.map((id) =>{return charInfo(id,r)});
 if(!list.length&&!homeQ) return '<div class="hempty hempty-art">'+esArt("hero")+'<p>No characters yet. Press <b>Create a Character</b> to build one, or <b>Open Character</b> to add one from a file.</p></div>';/* v24 p08 */const q=homeQ.toLowerCase();
 if(q)list=list.filter((x) =>{return (x.name+" "+x.level+" "+x.species+" "+x.cls+" "+x.sub+" "+x.camp).toLowerCase().indexOf(q)>=0});
 list.sort((a,b) =>{if(homeSort==="name")return a.name.localeCompare(b.name);if(homeSort==="level")return b.level-a.level;if(homeSort==="newest")return b.created-a.created;return a.created-b.created});
 return list.map((x) =>{const p=PALS[x.color]||PALS.forest;const bg='background:linear-gradient(90deg,'+p[1]+' 0%,'+p[2]+' 100%)';
  const line=x.label?("Level "+x.level+" | "+x.species+" | "+x.label):("Level "+x.level+" | "+x.species+" | "+x.cls+(x.sub?"/"+x.sub:""));
  const fm=fileMark(x.id),uns=fileStale(fm,!!fm&&fm.h!==rawHash(chRaw(x.id,r)));/* v33 p10 */
  return '<div class="hcard"><div class="hcard-top" style="'+bg+'"><span class="hwm" style="background-image:'+dataUri(x.sym,"#ffffff",.9)+'"></span><span class="hpor'+(x.por?' has':'')+'" style="'+(x.por?'background-image:url('+x.por+')':'')+'">'+(x.por?'':homeSil(x))+'</span><div class="hname"><b>'+esc(x.name)+'</b><span>'+esc(line)+'</span>'+(uns?'<button type="button" class="hunsv" data-hfile="'+x.id+'" aria-label="File out of date. Open the file options">File out of date</button>':'')/* v32 p92 */+'</div>'+(x.camp?'<button type="button" class="hcamp'+(__R.homeCamp===x.camp?' on':'')+'" data-hcampf="'+esc(x.camp)+'" aria-pressed="'+(__R.homeCamp===x.camp)+'" aria-label="'+(__R.homeCamp===x.camp?'Show all campaigns':'Show only the campaign '+esc(x.camp))+'">'+((typeof __R.ICO==="object"&&__R.ICO)?__R.ico("ui-flag","hcamp-i"):'')+'Campaign: <i>'+esc(x.camp)+'</i>'+((typeof __R.ICO==="object"&&__R.ICO)?__R.ico(__R.homeCamp===x.camp?"ui-close":"ui-filter","hcamp-f"):'')+'</button>':'')+'</div><div class="hact">'+(r.chars[x.id]&&r.chars[x.id].practice?'<div class="hprac"><span>Practice hero from Learn</span><button type="button" data-hkeep="'+x.id+'">Keep</button><button type="button" data-hdisc="'+x.id+'">Discard</button></div>':'')+'<button type="button" data-hview="'+x.id+'">View</button><button type="button" data-hedit="'+x.id+'">Edit</button><button type="button" data-hfile="'+x.id+'">File</button><button type="button" class="del holdc" data-hdel="'+x.id+'" title="Hold to delete"><span class="holdc-fill"></span><span class="holdc-label">Delete</span></button></div></div>'}).join("")||'<p class="hempty">No characters match your search.</p>'}
/* T11 Learn: the band on Home that opens Hoot's Training Grounds (src/learn, loaded with the deferred parts). Its words follow the
   language chosen in Learn (cs-learn-v1). After the first stop it shows how many of the five first stops are done */
export function learnBand(){ let o={}; try{ o=JSON.parse(lsGet("cs-learn-v1")||"{}")||{}; }catch(e){ o={}; } const id=o.lang==="id", dn=o.done&&typeof o.done==="object"?o.done:{}, d=["tavern","rooftops","forest","campsite","market"].filter((k) =>{ return dn[k]; }).length;
  const t=d?(id?"Tempat Latihan Hoot":"Hoot's Training Grounds"):(id?"Baru di sini?":"New here?"), s=d?(d+" / 5"):(id?"Kenali aplikasi dan belajar main D&D dalam 15 menit.":"Tour the app and learn to play D&D in 15 minutes."), b=d?(id?"Lanjut belajar":"Keep learning"):(id?"Belajar main":"Learn to play");
  return '<div class="hlearn" id="hlearnB"><span class="lrn-hoot"><img src="img/vig/empty/spells.avif" alt="" loading="lazy" decoding="async"></span><span><b>'+esc(t)+'</b><small>'+esc(s)+'</small></span><button type="button" class="btn pri press" data-hlearn="1">'+esc(b)+'</button></div>'; }
/* G7: the Training Ground band on Home, under the Learn band */
function tgBand(){ return '<div class="hlearn htg" id="htgB"><span class="lrn-hoot htg-i">'+((typeof __R.ICO==="object"&&__R.ICO)?__R.ico("ui-shield"):"")+'</span><span><b>Training Ground</b><small>Try your character against monsters. Your sheet never changes.</small></span><button type="button" class="btn press" data-tgopen="1">Train</button></div>'; }
export function tgGo(){ const go=() =>{ if(env.__tgOpen) env.__tgOpen(); else toast("The Training Ground is still loading. Try again in a moment."); }; if(!env.__tgOpen&&env.__bldNeed) Promise.resolve(env.__bldNeed()).then(go,go); else go(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-tgopen]"); if(!b) return; e.preventDefault(); tgGo(); });
export function learnGo(o){ const go=() =>{ if(env.__learnOpen) env.__learnOpen(o); }; if(!env.__learnOpen&&env.__bldNeed) Promise.resolve(env.__bldNeed()).then(go,go); else go(); }
export function showHome(){let w=document.getElementById("homeV");if(!w){w=document.createElement("div");w.id="homeV";w.setAttribute("role","region");w.setAttribute("aria-label","My Characters");document.body.appendChild(w);
  w.addEventListener("click",(e) =>{const l=e.target.closest&&e.target.closest("[data-hlib]");if(l){__R.libOpen({q:l.getAttribute("data-hlib")});return}const c=e.target.closest&&e.target.closest("[data-hcmd]");if(!c)return;const t=w.querySelector(".hbtns "+c.getAttribute("data-hcmd"))||w.querySelector(c.getAttribute("data-hcmd"));if(t)t.click()});
  w.addEventListener("keydown",(e) =>{if(e.target.id==="homeQ"&&e.key==="Enter"){const c=w.querySelector(".hcmd");if(c){e.preventDefault();c.click()}}});
  w.addEventListener("input",(e) =>{if(e.target.id==="homeQ"){homeQ=e.target.value;const hh=document.getElementById("hxHero");if(hh)hh.hidden=!!homeQ;document.getElementById("hgrid").innerHTML=homeCards()}});
  w.addEventListener("change",(e) =>{if(e.target.id==="homeCamp"){__R.homeCamp=e.target.value;document.getElementById("hgrid").innerHTML=homeCards();return}/* v27 RU64 */if(e.target.id==="homeSort"){homeSort=e.target.value;document.getElementById("hgrid").innerHTML=homeCards()}});
  w.addEventListener("click",(e) =>{const b=e.target.closest("button");if(!b)return;const d=b.dataset,r=rEnsure();
   if(d.hview){if(d.hview===r.active){w.hidden=true;document.body.style.overflow="";return}rSnap(r);sessionStorage.setItem("cs-skip","1");rLoad(r,d.hview,false);return}
   if(d.hedit){if(d.hedit===r.active){w.hidden=true;document.body.style.overflow="";if(env.__bldOpen)env.__bldOpen();return}rSnap(r);sessionStorage.setItem("cs-skip","1");try{__store.setItem("cs-edit","1")}catch(er){}if(rLoad(r,d.hedit,false)===false)try{__store.removeItem("cs-edit")}catch(er){}return}
   if(d.hkeep){const kp=r.chars[d.hkeep];if(kp){delete kp.practice;rSave(r);document.getElementById("hgrid").innerHTML=homeCards(true);toast("Kept. It is a normal character now.")}return}
   if(d.hdisc){const dc=d.hdisc;if(Object.keys(r.chars).length<2){toast("You need at least one character");return}ask("Discard the practice hero "+((r.chars[dc]||{}).name||"")+"? A copy stays in Snapshots for a while, so it can come back.","Discard",() =>{const r2=rSnap(rEnsure());snTake(dc,"Before Discard",r2);const was=dc===r2.active;delete r2.chars[dc];rSave(r2);if(was){sessionStorage.setItem("cs-skip","0");rLoad(r2,Object.keys(r2.chars)[0],false);return}document.getElementById("hgrid").innerHTML=homeCards(true);toast("Practice hero discarded.")});return}
   if(d.hdel){if(Object.keys(r.chars).length<2){toast("You need at least one character");return}if(b.dataset.sure!=="1"&&b.dataset.heldDone!=="1"){b.dataset.sure="1";const bl=b.querySelector(".holdc-label");if(bl)bl.textContent="Tap again";else b.textContent="Tap again";return}snTake(d.hdel,"Before Delete",rSnap(r));const was=d.hdel===r.active;delete r.chars[d.hdel];rSave(r);if(was){sessionStorage.setItem("cs-skip","0");rLoad(r,Object.keys(r.chars)[0],false);return}document.getElementById("hgrid").innerHTML=homeCards();const hi=document.getElementById("hinfo");if(hi)hi.innerHTML=homeInfo();persistShow();const hs=document.querySelector("#homeV .hslots b");if(hs)hs.textContent=Object.keys(r.chars).length;return}
   if(d.hcampf!=null){__R.homeCamp=__R.homeCamp===d.hcampf?"":d.hcampf;const hc=document.getElementById("homeCamp");if(hc)hc.value=__R.homeCamp;document.getElementById("hgrid").innerHTML=homeCards();return}/* v32 p28 RU133 */
   if(d.hlearn){learnGo();return}/* T11 Learn */if(d.hparty){__R.partyOpen();return}if(d.hrep){__R.reportOpen();return}/* v27 RU60, RU71 */
   if(d.hbk){bkpOpen(d.hbk);return}/* v14 Backup/Restore, v18 Open Character */
   if(d.hfile){chfOpen(d.hfile);return}/* v18 RU67 */
   if(d.hwn){if(d.hwn==="ok"){try{__store.setItem("cs-ui-ver",String(APP_VER))}catch(er){}__R.WN_SHOW=false;const bn=document.getElementById("hwnB");if(bn)bn.remove();return}__R.wnOpen();return}/* v18 RU59 */
   if(d.hpers){askPersist();return}
   if(d.hall){const hg=document.getElementById("hgrid");if(hg)hg.scrollIntoView({behavior:(env.__MI&&env.__MI.rm&&env.__MI.rm())?"auto":"smooth",block:"start"});return}
   if(d.hbin){BIN_OPEN=!BIN_OPEN;const hb=document.getElementById("hinfo");if(hb)hb.innerHTML=homeInfo();return}
   if(d.hback){snBack(d.hback);return}/* v18: bring back a deleted character from its newest snapshot */
   if(d.hnew){rSnap(r);const nid="c"+Date.now();r.chars[nid]={name:"New Character",created:Date.now(),t:Date.now()};try{if(sessionStorage.getItem("cs-forge"))r.chars[nid].practice=1}catch(e){}/* T11 Learn F3: a hero from Forge Your Hero is a practice hero until kept */try{sessionStorage.setItem("cs-skip","1")}catch(e){}rLoad(r,nid,true);return}})}
 const n=Object.keys(rEnsure().chars).length-rPh(rEnsure()).length;
 w.innerHTML='<div class="hwrap"><div class="hhead"><h1>My Characters</h1><div class="hbtns" role="toolbar" aria-label="Character actions"><button type="button" class="hcreate" data-hnew="1"><span class="hbt">Create<span class="hbz"> a Character</span></span></button><button type="button" class="hbk" data-hbk="open"><span class="hbt">Open<span class="hbz"> Character</span></span></button><button type="button" class="hbk" data-hbk="out"><span class="hbt">Back Up</span></button><button type="button" class="hbk" data-hbk="in"><span class="hbt">Restore</span></button><button type="button" class="hbk" data-hparty="1"><span class="hbt">Party</span></button><button type="button" class="hbk hic" data-hbk="info" aria-label="Settings: backup and storage"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></div></div><p class="hslots">Characters: <b>'+n+'</b></p>'+__R.wnBanner()+__R.tourBanner()+'<div id="hinfo">'+homeInfo()+'</div>'+homeHero()+learnBand()+tgBand()+'<div class="hbar"><label class="hsearch"><span>Search</span><input id="homeQ" type="search" placeholder="Name, level, class, species, campaign" aria-label="Search by name, level, class, species, or campaign" value="'+esc(homeQ)+'"></label><label class="hsort"><span>Sort By</span><select id="homeSort">'+[["created","Created: Oldest"],["newest","Created: Newest"],["name","Name"],["level","Level"]].map((o) =>{return '<option value="'+o[0]+'"'+(homeSort===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></label>'+__R.campSel(rEnsure())+'</div><div class="hgrid" id="hgrid">'+homeCards()+'</div><p class="happ">'+'<img class="happ-i" src="'+LOGO_IMG+'" width="32" height="32" alt="">'+'<b>D&amp;D Sheet</b>'+__R.pwaInstH()+'</p><p class="hcredit">Designed by Palpale</p><p class="hver">Version '+APP_LABEL+' ('+APP_DATE+') <button type="button" class="hlink" data-hwn="all">What\'s new</button> <button type="button" class="hlink" data-hrep="1">Report a problem</button></p></div>';
 setTimeout(() =>{ const hi=document.getElementById("hinfo"); if(hi) hi.innerHTML=homeInfo(); persistShow(); },0);
 w.hidden=false;document.body.style.overflow="hidden"}
/* v14 Backup/Restore. A backup holds every key of this app as stored (raw strings): the roster (cs-roster-v1, one entry per character with its
   build, sheet and state), the open character (yudhi-kelapa-build-v3 sheet, yudhi-kelapa-sheet-v1 state), the builder (phb24-builder-v1) and its
   one-slot backup (-bak). Keys added later with the same prefixes are picked up too. Restore asks first, then replaces exactly these keys */
const BKP_KEYS=["cs-roster-v1","phb24-builder-v1","phb24-builder-v1-bak","yudhi-kelapa-build-v3","yudhi-kelapa-sheet-v1"];
export function bkpKeyOk(k){ return BKP_KEYS.indexOf(k)>=0||/^(cs-roster-|cs-char-|phb24-|yudhi-kelapa-)/.test(k); }
function bkpKeys(){ const o=BKP_KEYS.slice(); try{ for(let i=0;i<__store.length;i++){ const k=__store.key(i); if(bkpKeyOk(k)&&o.indexOf(k)<0) o.push(k); } }catch(e){} return o; }
export function bkpMake(){ let rr=null; try{ rr=rSnap(rEnsure()); }catch(e){} let d={}; bkpKeys().forEach((k) =>{ let v=null; try{ v=__store.getItem(k); }catch(e){} d[k]=v; });
  /* v18 RU61: the open character comes from memory, so a backup made while storage is full still holds the latest changes */
  if(!FROZEN&&C&&S){ d[CKEY]=JSON.stringify(C); d[KEY]=JSON.stringify(S); if(rr&&rr.chars&&rr.chars[rr.active]){ const e=rr.chars[rr.active]; e.C=d[CKEY]; e.S=d[KEY]; e.B=d[BKEY]==null?null:d[BKEY]; d[RKEY]=JSON.stringify(rr); } }
  d=__R.bkpCamp(d);/* v27 RU64: one campaign */ let r=rGet()||{chars:{}}; try{ r=JSON.parse(d[RKEY])||r; }catch(e){} return {app:"dnd2024-sheet-builder",kind:"backup",version:1,appVer:APP_VER,created:new Date().toISOString(),characters:Object.keys(r.chars||{}).length,keys:d}; }
export function bkpCheck(o){ if(!o||typeof o!=="object"||o.kind!=="backup"||!o.keys||typeof o.keys!=="object"||Array.isArray(o.keys)) return "This is not a character backup from this app.";
  const ks=Object.keys(o.keys); if(!ks.length) return "The backup is empty.";
  for(let i=0;i<ks.length;i++){ const k=ks[i], v=o.keys[k]; if(!bkpKeyOk(k)) return "The backup has an entry this app does not use: "+k+".";
    if(v!==null&&typeof v!=="string") return "The backup entry "+k+" is damaged."; if(v!==null){ try{ JSON.parse(v); }catch(e){ return "The backup entry "+k+" is damaged."; } } }
  let r=o.keys["cs-roster-v1"]; if(r){ try{ r=JSON.parse(r); }catch(e){ r=null; } if(!r||!r.chars||typeof r.chars!=="object"||Array.isArray(r.chars)) return "The character list in the backup is damaged.";
    const ids=Object.keys(r.chars); for(let j=0;j<ids.length;j++){ const ch=r.chars[ids[j]]; if(!ch||typeof ch!=="object") return "A character in the backup is damaged.";
      const fs=["B","C","S"]; for(let q=0;q<3;q++){ const x=ch[fs[q]]; if(x!=null){ if(typeof x!=="string") return "Character "+(ch.name||ids[j])+" in the backup is damaged."; try{ const y=JSON.parse(x); if(y!==null&&typeof y!=="object") throw 0; if(fs[q]==="C"&&y&&!y.abilities&&y.name==null) throw 0; }catch(e){ return "Character "+(ch.name||ids[j])+" in the backup is damaged."; } } } }
    if(r.active!=null&&!r.chars[r.active]) return "The character list in the backup is damaged."; }
  return ""; }
export function bkpCount(o){ try{ return Object.keys(JSON.parse(o.keys["cs-roster-v1"]).chars).length; }catch(e){ return o.keys["yudhi-kelapa-build-v3"]?1:0; } }
export function bkpRestore(o){ const r0=rGet(); if(r0&&r0.chars) Object.keys(r0.chars).forEach((id) =>{ snTake(id,"Before Restore",r0); });/* v18 RU48 (d) */ clearTimeout(cSaveT); clearTimeout(saveT); const keys=bkpKeys(), old={}; keys.forEach((k) =>{ try{ old[k]=__store.getItem(k); }catch(e){ old[k]=null; } });
  try{ keys.forEach((k) =>{ if(!(k in o.keys)) __store.removeItem(k); }); Object.keys(o.keys).forEach((k) =>{ if(o.keys[k]==null) __store.removeItem(k); else __store.setItem(k,o.keys[k]); }); }
  catch(e){ keys.forEach((k) =>{ try{ if(old[k]==null) __store.removeItem(k); else __store.setItem(k,old[k]); }catch(e2){} }); toast("Restore failed: this device is out of storage space. Nothing was changed."); return; }/* V14-10: all or nothing */
  sessionStorage.setItem("cs-skip","0"); __miReload(); }
function bkpRead(txt){ __R.impText(txt); }
function bkpName(){ const d=new Date(), p=function(x){return (x<10?"0":"")+x}; return "dnd-characters-"+d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+".bs"; }
/* v22 RU79: files of this app (.bs) hold packed text. Without CompressionStream the plain text goes in */
function packOut(txt,cb){ zPack(txt).then(cb,() =>{ cb(txt); }); }
/* v14 Backup/Restore dialog. v18: Open Character (mode "open"), packed text, backup date, persistent storage request */
function bkpOpen(mode){ const old=document.getElementById("bkp"); if(old) old.remove(); const w=document.createElement("div"); w.id="bkp"; w.className="bkp"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true");
  const txt=mode==="out"?JSON.stringify(bkpMake()):"", n=mode==="out"?bkpCount(JSON.parse(txt)):0; if(mode==="out") askPersist();
  const ttl={out:"Back Up Characters","in":"Restore Characters",open:"Open Character",info:"Settings"}[mode]||"Restore Characters"; w.setAttribute("aria-labelledby","bkpT");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="bkpT">'+ttl+'</b><button type="button" class="bkpx" data-bkp="close" aria-label="Close">×</button></div>'+
   (mode==="info"?'<h3 class="bkpsec">Backup and Storage</h3>'+techInfo()+'<div class="bkpr"><button type="button" class="btn pri press" data-bkp="goout">Back Up</button><button type="button" class="btn press" data-bkp="goin">Restore</button></div>':mode==="out"?'<p>Save '+(__R.homeCamp?'the '+n+' character'+(n===1?'':'s')+(__R.homeCamp==="-"?' with no campaign':' of the campaign '+esc(__R.homeCamp)):(n===1?'your character':'all '+n+' characters'))+' on this device (builds, sheets, HP, notes, and themes) in one file. Keep it somewhere safe, then use Restore on any device to bring them back.</p>'+
     '<div class="bkpr"><button type="button" class="btn pri press" data-bkp="dl">Download File</button><button type="button" class="btn press" data-bkp="show">Show as Text</button></div>'+
     '<div class="bkpt" hidden><p class="muted">If the download does not start (some embedded viewers block files), copy this text and keep it in a note or chat. Restore accepts it as it is.</p><textarea id="bkpZ" readonly spellcheck="false">Packing...</textarea><div class="bkpr"><button type="button" class="btn press" data-bkp="copyz">Copy Packed Text</button></div>'+
     '<details class="bkpd"><summary>Plain text (longer, can be saved as a .json file)</summary><textarea id="bkpTxt" readonly spellcheck="false">'+esc(txt)+'</textarea><div class="bkpr"><button type="button" class="btn press" data-bkp="copy">Copy Text</button></div></details></div>'
   :(mode==="open"?'<p>Choose a character file (.bs, or an older .dnd24.json) made with Save Character, or a build file. The character is added to this device. The characters already here stay.</p>':'<p>Load a backup file made with Back Up, or a character file made with Save Character. You will choose whether to add the characters or replace the ones on this device.</p>')+
     '<div class="bkpr"><label class="btn pri press bkpf">Choose File<input type="file" id="bkpFile" hidden></label>'+(mode==="open"&&__R.qrCan()?'<button type="button" class="btn press" data-bkp="scan">'+__R.ico("ui-camera")+'<span>Scan Code</span></button>':'')+'</div>'+
     (mode==="open"&&!__R.qrCan()?'<p class="muted qr-no">'+__R.ico("ui-info")+'<span>Scanning a code from another device needs a browser that reads codes (Chrome on Android or a Mac). Here, paste the text instead: on the other device use File, Show as Text.</span></p>':'')+
     '<p class="muted">Or paste the text here (plain or packed):</p><textarea id="bkpIn" spellcheck="false" placeholder="Paste backup, character, or build text"></textarea><div class="bkpr"><button type="button" class="btn press" data-bkp="paste">'+(mode==="open"?'Open from Text':'Restore from Text')+'</button></div>')+'</div>';
  document.body.appendChild(w);
  const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);/* V14-11 */
  if(mode==="info") persistShow();
  let packed=null; if(mode==="out") zPack(txt).then((z) =>{ packed=z; const a=document.getElementById("bkpZ"); if(a) a.value=z; },() =>{ packed=txt; const a=document.getElementById("bkpZ"); if(a) a.value=txt; });
  const copy=function(t,el){ bkMark(); copyText(t,el).then((ok) =>{ toast(ok?"Backup text copied":"Select the text and copy it"); }); };
  w.addEventListener("click",(e) =>{ const b=e.target.closest("[data-bkp]"); if(e.target===w){ w.remove(); return; } if(!b) return; const a=b.getAttribute("data-bkp");
    if(a==="close"){ w.remove(); return; }
    if(a==="goout"||a==="goin"){ w.remove(); bkpOpen(a==="goout"?"out":"in"); return; }
    if(a==="dl"){ packOut(txt,(pt) =>{ dlFile(pt,bkpName(),(ok) =>{ if(ok){ bkMark(); toast("Download started: "+bkpName()+". No file? Use the text below."); } else toast("Download is blocked here. Use Show as Text."); }); }); w.querySelector(".bkpt").hidden=false; return; }
    if(a==="show"){ w.querySelector(".bkpt").hidden=false; bkMark(); const ta=document.getElementById("bkpZ"); ta.focus(); ta.select(); return; }
    if(a==="copy"){ copy(txt,document.getElementById("bkpTxt")); return; }
    if(a==="copyz"){ copy(packed||txt,document.getElementById("bkpZ")); return; }
    if(a==="scan"){ __R.qrScanOpen(); return; }/* v34 item 5 */
    if(a==="paste"){ const v=document.getElementById("bkpIn").value.trim(); if(!v){ toast("Paste the backup text first."); return; } __R.impText(v); return; } });
  const f=document.getElementById("bkpFile"); if(f) f.addEventListener("change",() =>{ const fl=f.files&&f.files[0]; if(!fl) return; const rd=new FileReader(); rd.onload=function(){ __R.impText(String(rd.result||"")); f.value=""; }; rd.onerror=function(){ toast("This file could not be read."); }; rd.readAsText(fl); });
}
/* ================= v18 RU67, RU48, RU42: character files, merge restore, snapshots, packed text ================= */
export function hashS(s){ let h=2166136261; s=String(s||""); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return (h>>>0).toString(36)+s.length.toString(36); }
export function rawHash(x){ return hashS((x.B||"")+"\u0001"+(x.C||"")+"\u0001"+(x.S||"")); }
/* the open character as it will be saved (memory is newer than storage for up to 200 ms) */
export function curRaw(){ [C,S].forEach((o) =>{ o._app=Math.max(+o._app||0,APP_VER); }); return {B:lsGet(BKEY),C:JSON.stringify(C),S:JSON.stringify(S)}; }
function chRaw(id,r){ r=r||rGet()||{chars:{}}; if(id===r.active&&!FROZEN) return curRaw(); const c=(r.chars||{})[id]||{}; return {B:c.B==null?null:c.B,C:c.C==null?null:c.C,S:c.S==null?null:c.S}; }

export function uiSet(k,o){ try{ __store.setItem(k,JSON.stringify(o)); }catch(e){} }
function fileMark(id){ return uiGet("cs-ui-files")[id]||null; }
/* v33 p10: the file mark is a reminder, not a duty. Days 0 = off */
function remindCfg(){ const o=uiGet("cs-ui-remind"); return {days:o.days==null?7:+o.days, auto:!!o.auto}; }
function fileStale(fm,changed){ const c=remindCfg(); return !!fm&&changed&&c.days>0&&(Date.now()-fm.t)>c.days*864e5; }
function fileAgo(fm){ const d=Math.floor((Date.now()-fm.t)/864e5); return d<1?"today":d===1?"1 day ago":d+" days ago"; }
let autoFT=null;
export function updUnsaved(){ const r=rGet(); if(!r||!r.chars||!r.active) return; const fm=fileMark(r.active), ch=!!fm&&fm.h!==rawHash(curRaw()), on=fileStale(fm,ch), b=document.getElementById("rosterBtn");
  if(ch&&remindCfg().auto&&typeof FH!=="undefined"&&FH[r.active]){ const aid=r.active; clearTimeout(autoFT); autoFT=setTimeout(() =>{ if(FH[aid]) chSave(aid); },2500); }/* v33 p10 */
  if(b){ b.classList.toggle("unsv",on); b.setAttribute("aria-label",on?"My characters. The character file is out of date":"My characters"); if(on) b.title="Changed since the last Save Character. Saved on this device"; else b.removeAttribute("title"); } }
export function fmtT(t){ const d=new Date(t), p=function(x){return (x<10?"0":"")+x}; return d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes()); }
export function dlFile(txt,nm,cb){ try{ const bl=new Blob([txt],{type:/\.bs$/.test(nm)?"application/octet-stream":"application/json"}), u=URL.createObjectURL(bl), l=document.createElement("a"); l.href=u; l.download=nm; document.body.appendChild(l); l.click(); l.remove(); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); cb(true); }catch(e){ cb(false); } }
export function newId(r){ let id; do{ id="c"+Date.now()+Math.floor(Math.random()*1000); }while(r.chars[id]); return id; }
export function fixCid(b,id){ if(b==null) return null; try{ const o=JSON.parse(b); if(o&&typeof o==="object"&&o.cid&&o.cid!==id){ o.cid=id; return JSON.stringify(o); } }catch(e){} return b; }
export function cOf(raw){ try{ return JSON.parse(raw)||{}; }catch(e){ return {}; } }
/* (e) packed text: gzip + base64 with a prefix. Plain JSON stays accepted everywhere */
export function zPack(s){ if(!env.CompressionStream) return Promise.reject(new Error("no CompressionStream"));
  return new Response(new Blob([s]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer().then((b) =>{ let u=new Uint8Array(b), t="", i; for(i=0;i<u.length;i+=32768) t+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return "DND24Z1:"+btoa(t); }); }
export function zUnpack(s){ s=String(s||"").trim(); if(s.indexOf("DND24Z1:")!==0) return Promise.resolve(s); if(!env.DecompressionStream) return Promise.reject(new Error("This browser cannot unpack packed text. Use the file instead."));
  try{ var b=atob(s.slice(8).replace(/\s+/g,"")), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); }catch(e){ return Promise.reject(new Error("This packed text is damaged.")); }
  return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text().catch(() =>{ throw new Error("This packed text is damaged."); }); }
/* (c) ask the browser to keep the app's storage (no prompt in most browsers) */
function askPersist(){ try{ if(navigator.storage&&navigator.storage.persist) navigator.storage.persisted().then((p) =>{ return p||navigator.storage.persist(); }).then(() =>{ persistShow(); },() =>{}); }catch(e){} }
function persistShow(){ const e=document.getElementById("hpers"); if(!e) return; try{ if(!navigator.storage||!navigator.storage.persisted){ e.innerHTML="not available in this browser"; return; } navigator.storage.persisted().then((p) =>{ e.innerHTML=p?"<b>Yes</b>":'No <button type="button" class="hlink" data-hpers="1">Ask the browser</button>'; },() =>{}); }catch(er){} }
/* (b) last backup on this device (cs-ui-bkp, not part of the backup itself) */
function allHash(r){ r=r||rGet()||{chars:{}}; return hashS(Object.keys(r.chars||{}).sort().map((id) =>{ return rawHash(chRaw(id,r)); }).join(",")); }
function bkMark(){ uiSet("cs-ui-bkp",{t:Date.now(),h:allHash()}); const hi=document.getElementById("hinfo"); if(hi) hi.innerHTML=homeInfo(), persistShow(); }
function lsUse(){ let n=0, por=0; try{ for(let i=0;i<__store.length;i++){ const k=__store.key(i), v=__store.getItem(k)||""; n+=k.length+v.length; } const r=rGet(); if(r&&r.chars) Object.keys(r.chars).forEach((id) =>{ por+=(cOf(id===r.active?JSON.stringify(S):r.chars[id].S).portrait||"").length; }); }catch(e){} return {n:n,por:por}; }
function bkState(){ const bk=uiGet("cs-ui-bkp"), r=rGet()||{chars:{}}, now=Date.now(), days=bk.t?Math.floor((now-bk.t)/864e5):0, ch=bk.t&&bk.h!==allHash(r);
  const old=Object.keys(r.chars||{}).some((id) =>{ return now-(r.chars[id].created||now)>3*864e5; }), warn=bk.t?(ch&&days>=7):old;
  /* T7: on IndexedDB the limit is the space the browser gives this site (navigator.storage.estimate), not about 5 MB */
  const u=lsUse(), idb=__store.mode&&__store.mode()==="idb", es=idb?__store.estimate:null, cap=es&&es.quota?es.quota:idb?0:5e6, used=es&&es.usage?Math.max(es.usage,u.n):u.n; u.cap=es&&es.quota?cap:0; u.idb=idb; u.used=used;
  if(idb&&!cap){ return {bk:bk,r:r,days:days,ch:ch,warn:warn,u:u,pct:0,full:false}; }/* the browser has not answered yet: no meter warning */
  const pct=Math.min(100,Math.round(used*100/cap)); return {bk:bk,r:r,days:days,ch:ch,warn:warn,u:u,pct:pct,full:pct>=80}; }
/* T3: backup and storage details live in the Settings dialog (bkpOpen "info"). Home shows only a short warning when the backup is old or storage is almost full */
function techInfo(){ const q=bkState(), bk=q.bk, u=q.u, pct=q.pct, full=q.full, mb=function(x){ return (x/1e6).toFixed(2)+" MB"; };
  return '<div class="hbkl'+(q.warn?' warn':'')+'"><span>Last backup: <b>'+(bk.t?fmtT(bk.t).slice(0,10)+' ('+(q.days?q.days+' day'+(q.days===1?'':'s')+' ago':'today')+')':'never')+'</b>'+(q.ch?' \u2022 changes since then':'')+'</span>'+
    (q.warn?'<span class="hbkw">'+(bk.t?'Back up again so the latest changes are safe.':'Back up your characters so they are safe if this browser\'s data is cleared.')+'</span>':'')+'</div>'+
    '<div class="hstor'+(full?' warn':'')+'"><span class="hmeter" aria-hidden="true"><span style="width:'+pct+'%"></span></span><span>Storage used on this device: <b>'+mb(u.used)+'</b> of '+(u.cap?'about '+(u.cap>=1e9?(u.cap/1e9).toFixed(1)+' GB':Math.round(u.cap/1e6)+' MB'):u.idb?'the space this browser allows':'about 5 MB')+' ('+pct+'%)'+(u.por>2e4?'. Portraits: '+mb(u.por):'')+'. Protected from automatic cleanup: <span id="hpers">...</span></span>'+
    (full?'<span class="hbkw">Storage is almost full. Back up, then remove portraits or characters you no longer need.</span>':'')+'</div>'+pwaNote(); }
/* T4 item 27: how to install the app. Hidden once it runs as an installed app */
function pwaNote(){ let st=false; try{ st=matchMedia("(display-mode: standalone)").matches||navigator.standalone===true; }catch(er){} if(st) return '<div class="hbkl"><span>This app is installed on your device.</span></div>';
  return '<div class="hbkl"><span>Install: '+((typeof __R.PWA_EV!=="undefined"&&__R.PWA_EV)?'press Install App on the Home screen, or use the Install command in the search.':'in Chrome or Edge use the install icon in the address bar. In Safari use Share, then Add to Home Screen.')+' An installed app opens faster and works offline.</span></div>'; }
function homeInfo(){ let q=bkState(), r=q.r, warnH="";
  if(q.warn||q.full) warnH='<div class="hbkl warn" role="status">'+(q.full&&env.__artVig?env.__artVig("state","storage-full",44):"")+'<span class="hbkw">'+(q.full?'Storage is almost full. Back up, then remove portraits or characters you no longer need.':(q.bk.t?'Your last backup is '+q.days+' days old and there are changes since then.':'You have no backup yet. Back up your characters so they are safe if this browser\'s data is cleared.'))+'</span><button type="button" class="hlink" data-hbk="out">Back Up</button><button type="button" class="hlink" data-hbk="info">Details</button></div>';
  return warnH+
    (function(){ const sn=snGet().chars, del=Object.keys(sn).filter((id) =>{ return !r.chars[id]&&sn[id]&&sn[id].length; }); if(!del.length) return "";
      del.sort((a,b) =>{ return (sn[b][0].t||0)-(sn[a][0].t||0); });
      const row=function(id){ const x=sn[id][0], c=cOf(x.C), sub=((c.species||"")+" "+(c.clsLabel||"")).trim();
        return '<li><span class="hdn"><b>'+esc(x.name||c.name||"Character")+'</b><small>'+(sub?esc(sub)+' \u2022 ':'')+'Deleted '+esc(fmtT(x.t).slice(0,10))+'</small></span><button type="button" class="hlink" data-hback="'+id+'">Bring Back</button></li>'; };
      return '<div class="hbin"><button type="button" class="hbinb press" data-hbin="1" aria-expanded="'+(BIN_OPEN?'true':'false')+'" aria-label="Recycle bin, '+del.length+' deleted character'+(del.length===1?'':'s')+'"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M6 6l1 14h10l1-14"/><path d="M10 10v6M14 10v6"/></svg><span class="hbinn">'+del.length+'</span></button>'+
        (BIN_OPEN?'<div class="hbkl hdel"><span class="hdelh">Deleted characters you can bring back:</span><ul>'+del.slice(0,5).map(row).join("")+'</ul>'+(del.length>5?'<details><summary>Show '+(del.length-5)+' older</summary><ul>'+del.slice(5).map(row).join("")+'</ul></details>':'')+'</div>':'')+'</div>'; })(); }
/* (d) snapshots: cs-snap-v1 = {chars:{id:[newest first, max 5]}}. Device only: not in Back Up, untouched by Restore, so a Restore can be undone.
   Portraits are left out (the current portrait is kept on restore). Total size is kept under SN_MAX characters by dropping the oldest */
const SN_MAX=900000;
var BIN_OPEN=false;
export var SN_BAD=false;
export function snGet(){ const raw=lsGet(SNKEY); try{ const o=JSON.parse(raw||"null"); if(o&&o.chars&&typeof o.chars==="object"){ SN_BAD=false; return o; } }catch(e){} SN_BAD=raw!=null; return {chars:{}}; }
function snDrop(o){ let best=null; Object.keys(o.chars).forEach((id) =>{ const L=o.chars[id]; if(L&&L.length){ const x=L[L.length-1]; if(!best||x.t<best.t) best={id:id,t:x.t}; } }); if(!best) return false; o.chars[best.id].pop(); if(!o.chars[best.id].length) delete o.chars[best.id]; return true; }
function snPut(o){ if(FROZEN||SN_BAD) return false;/* a damaged snapshot store is not overwritten */ o._app=Math.max(+o._app||0,APP_VER); for(let n=0;n<60;n++){ const s=JSON.stringify(o); if(s.length<=SN_MAX){ try{ __store.setItem(SNKEY,s); return true; }catch(e){} } if(!snDrop(o)) return false; } return false; }
/* T11 N25 self-healing storage: when the open character's sheet or play state cannot be read (BAD, recovery screen), the app looks for the
   newest copy that can: the localStorage mirror of IndexedDB (src/boot/store-gate.js), the roster's copy, then the snapshots (newest first).
   A copy counts when it reads as JSON of the known shape (sheet: v 3 with abilities, play state: an object). Writes are whole per key in both
   stores, so the shape test is the check that matters: no checksum is added and no stored data changes shape. Restoring asks first, keeps the
   unreadable text under cs-heal-v1, writes only the parts that were unreadable, and loads the app again */
function healOkC(raw){ try{ const p=JSON.parse(raw); return !!(p&&p.v===3&&p.abilities); }catch(e){ return false; } }
function healOkS(raw){ try{ const p=JSON.parse(raw); return !!(p&&typeof p==="object"&&!Array.isArray(p)); }catch(e){ return false; } }
function healFind(){ const curC=lsGet(CKEY), curS=lsGet(KEY), needC=curC!=null&&!healOkC(curC), needS=curS!=null&&!healOkS(curS); if(!needC&&!needS) return null;
  const L=[], add=function(src,t,c,st){ if(needC&&!healOkC(c)) return; if(!needC&&needS&&!healOkS(st)) return; L.push({src:src,t:t||0,C:needC?c:null,S:needS&&healOkS(st)?st:null}); };
  try{ add("the second copy on this device",0,localStorage.getItem(CKEY),localStorage.getItem(KEY)); }catch(e){}
  let r=null; try{ r=JSON.parse(lsGet(RKEY)||"null"); }catch(e){ r=null; } const e0=r&&r.chars&&r.active&&r.chars[r.active]; if(e0) add("the character list",e0.t,e0.C,e0.S);
  if(r&&r.active){ const o=snGet(); (o.chars[r.active]||[]).forEach((x) =>{ add("a snapshot ("+x.why+")",x.t,typeof x.C==="string"?x.C:JSON.stringify(x.C),x.S); }); }
  if(!L.length) return {needC:needC,needS:needS,none:1};
  const first=L[0].src.indexOf("second copy")===0?L[0]:null, rest=L.filter((x) =>{ return x!==first; }).sort((a,b) =>{ return b.t-a.t; });
  const pick=first||rest[0]; pick.needC=needC; pick.needS=needS; const c=cOf(pick.C||curC); pick.label=(c.name||"Character")+(c.cls?", "+(c.clsLabel||(c.cls+" "+(c.level||""))):"")+(pick.t?", saved "+fmtAgo(pick.t):""); return pick; }
function healHTML(){ let h=null; try{ h=healFind(); }catch(e){ h=null; } if(!h) return "";
  if(h.none) return '<p class="muted">No readable copy of this character was found on this device. Download a backup and keep it.</p>';
  return '<div class="rec-heal"><p><b>A readable copy was found</b> in '+esc(h.src)+': '+esc(h.label)+'.</p><div class="bkpr"><button type="button" class="btn pri press" data-rec="heal">Use This Copy</button></div></div>'; }
function healUse(){ const h=healFind(); if(!h||h.none){ toast("No readable copy was found"); return; }
  ask("Use the copy from "+h.src+" ("+h.label+")? The unreadable data is kept on this device (cs-heal-v1). Download Backup first if you want a file of it.","Use This Copy",() =>{
    try{ __store.setItem("cs-heal-v1",JSON.stringify({t:Date.now(),src:h.src,keys:(function(){ const k={}; k[CKEY]=lsGet(CKEY); k[KEY]=lsGet(KEY); return k; })()})); }catch(e){}
    try{ if(h.needC&&h.C) __store.setItem(CKEY,h.C); if(h.needS&&h.S) __store.setItem(KEY,h.S); else if(h.needS) __store.removeItem(KEY); }catch(e){ toast("Could not write the copy: storage is full"); return; }
    const go=function(){ sessionStorage.setItem("cs-skip","1"); __miReload(); }; if(__store.flush) __store.flush().then(go,go); else go(); }); }
env.__healFind=healFind;
export function snTake(id,why,r){ if(FROZEN||!id) return; r=r||rGet(); if(!r||!r.chars||!r.chars[id]) return; const x=chRaw(id,r); if(!x.C) return; let s=x.S;
  try{ const so=JSON.parse(s||"null"); if(so&&so.portrait){ so.portrait=""; s=JSON.stringify(so); } }catch(e){}
  const o=snGet(), L=o.chars[id]||[], h=rawHash({B:x.B,C:x.C,S:s}); if(L[0]&&L[0].h===h) return;
  L.unshift({t:Date.now(),why:why,cr:r.chars[id].created||null,name:cOf(x.C).name||r.chars[id].name||"",B:x.B,C:x.C,S:s,h:h}); o.chars[id]=L.slice(0,5); snPut(o); }
export function snRestore(id,i){ const o=snGet(), x=(o.chars[id]||[])[i]; if(!x) return;
  /* T11 G3 N13: for the open character, the numbers that the restore would change */
  let pv=""; try{ if(id===(rGet()||{}).active&&env.__rcptRestoreText) pv=env.__rcptRestoreText(typeof x.C==="string"?JSON.parse(x.C):x.C); }catch(er){ pv=""; }
  ask("Go back to the copy from "+fmtT(x.t)+" ("+x.why+")? The character as it is now is kept as a snapshot first, so you can undo this."+(pv?"\n\nNumbers that change:\n"+pv:""),"Restore Snapshot",() =>{ const r=rSnap(rEnsure()); snTake(id,"Before going back to a snapshot",r);
    let cur=chRaw(id,r), s=x.S; try{ const so=JSON.parse(s), co=cOf(cur.S); if(co.portrait){ so.portrait=co.portrait; s=JSON.stringify(so); } }catch(e){}
    const e=r.chars[id]; e.B=x.B; e.C=x.C; e.S=s; e.name=x.name||e.name; e.t=Date.now(); if(!rSave(r)) return;
    if(id===r.active){ clearTimeout(cSaveT); clearTimeout(saveT); setOrDel(BKEY,x.B); lsSet(CKEY,x.C); lsSet(KEY,s); sessionStorage.setItem("cs-skip","1"); __miReload(); return; }
    toast("Snapshot restored"); chfOpen(id); const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(); }); }
function snBack(id){ const r=rSnap(rEnsure()), x=(snGet().chars[id]||[])[0]; if(!x||r.chars[id]) return; const nm=x.name||cOf(x.C).name||"Character";
  ask("Bring back "+nm+" from the snapshot of "+fmtT(x.t)+"?","Bring Back",() =>{ r.chars[id]={name:nm,sub:(cOf(x.C).species||"")+" "+(cOf(x.C).clsLabel||""),B:fixCid(x.B,id),C:x.C,S:x.S,created:x.cr||Date.now(),t:Date.now()}; if(!rSave(r)) return; showHome(); toast(nm+" is back"); }); }
function chCopy(id){ const r=rSnap(rEnsure()), src=r.chars[id]; if(!src) return; const did=newId(r), cp=structuredClone(src);
  try{ const cc=JSON.parse(cp.C); cc.name=(cc.name||"Character")+" (copy)"; cp.C=JSON.stringify(cc); cp.name=cc.name; const bb=JSON.parse(cp.B||"null"); if(bb){ bb.name=cc.name; bb.cid=did; cp.B=JSON.stringify(bb); } }catch(er){}
  cp.created=Date.now(); cp.t=Date.now(); r.chars[did]=cp; if(!rSave(r)) return; const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); const hs=document.querySelector("#homeV .hslots b"); if(hs) hs.textContent=Object.keys(r.chars).length; toast("Copied: "+cp.name); }
/* RU67: character file */
export function chFile(id){ const r=rSnap(rEnsure()), c=r.chars[id]||{}, x=chRaw(id,r);
  return {app:"dnd2024-sheet-builder",kind:"character",format:1,appVer:APP_VER,saved:new Date().toISOString(),id:id,name:c.name||cOf(x.C).name||"",B:x.B,C:x.C,S:x.S}; }
export function chName(o){ return (String(o.name||"character").replace(/[^A-Za-z0-9 _-]+/g,"").trim().replace(/\s+/g,"-")||"character")+".bs"; }
var FH={};
export function chSave(id){ askPersist(); const o=chFile(id); packOut(JSON.stringify(o),(txt) =>{ chSave2(id,o,txt); }); }
function chSave2(id,o,txt){ const nm=chName(o);
  const mark=function(msg){ const f=uiGet("cs-ui-files"); f[id]={h:rawHash(o),t:Date.now()}; uiSet("cs-ui-files",f); updUnsaved(); toast(msg); if(document.getElementById("chf")) chfOpen(id); const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); };
  const dl=function(){ dlFile(txt,nm,(ok) =>{ if(ok) mark("Download started: "+nm); else { toast("Download is blocked here. Use Show as Text."); } }); };
  /* Chrome and Edge on a computer: write the same file again (File System Access API). Elsewhere every Save downloads a new file */
  if(env.showSaveFilePicker&&env.isSecureContext&&!/Mobi|Android/i.test(navigator.userAgent)){ const hp=FH[id]?Promise.resolve(FH[id]):env.showSaveFilePicker({suggestedName:nm,types:[{description:"Character file",accept:{"application/octet-stream":[".bs"]}}]});
    hp.then((h) =>{ FH[id]=h; return h.createWritable().then((w) =>{ return w.write(txt).then(() =>{ return w.close(); }); }).then(() =>{ mark("Saved to "+h.name); }); }).catch((e) =>{ if(e&&e.name==="AbortError") return; delete FH[id]; dl(); }); return; }
  dl(); }
function chfOpen(id){ const r=rGet()||{chars:{}}, c=r.chars[id]; if(!c) return; const old=document.getElementById("chf"); if(old) old.remove(); const w=document.createElement("div"); w.id="chf"; w.className="bkp"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","chfT");
  const fm=fileMark(id), chg=!!fm&&fm.h!==rawHash(chRaw(id,r)), uns=fileStale(fm,chg), rc=remindCfg(), L=snGet().chars[id]||[];/* v33 p10 */
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="chfT">'+esc(c.name||"Character")+'</b><button type="button" class="bkpx" data-chf="close" aria-label="Close">×</button></div>'+
   '<p>Save this character in its own file (.bs). The text inside is packed, so other apps cannot open it directly. Open Character on any device adds it back, next to the characters already there.</p>'+
   '<p class="muted">Last saved to a file: <b>'+(fm?fmtT(fm.t):'never')+'</b>'+(uns?' <span class="hunsv">File out of date</span>':'')+'</p>'+(uns?'<p class="hunsv-x">Your last file backup was '+fileAgo(fm)+' and the character changed since. Your progress is kept on this device automatically. Press Save Character to refresh the backup file.</p>':(chg?'<p class="muted">Changed since the last file save. Your progress is kept on this device automatically, so this is only a backup reminder.</p>':''))+
   '<div class="chfopt"><label for="chfRem">Backup reminder</label><select id="chfRem" data-chfrem="1"><option value="7"'+(rc.days===7?' selected':'')+'>After 7 days</option><option value="30"'+(rc.days===30?' selected':'')+'>After 30 days</option><option value="0"'+(rc.days===0?' selected':'')+'>Off</option></select>'+
   ((env.showSaveFilePicker&&!/Mobi|Android/i.test(navigator.userAgent))?'<label class="chfauto"><input type="checkbox" data-chfauto="1"'+(rc.auto?' checked':'')+'> Keep this file updated automatically (after you save it once in this window)</label>':'')+'</div>'+
   '<div class="bkpr"><button type="button" class="btn pri press" data-chf="save">Save Character</button><button type="button" class="btn press" data-chf="text">Show as Text</button></div>'+
   '<div class="bkpr"><button type="button" class="btn press" data-chf="send">'+__R.ico("ui-qr")+'<span>Send to Another Device</span></button></div>'+
   '<div class="bkpt" hidden><textarea id="chfTxt" readonly spellcheck="false">Packing...</textarea><div class="bkpr"><button type="button" class="btn press" data-chf="copy">Copy Text</button></div></div>'+
   '<h4 class="chfh">Other Apps</h4><p class="muted">A basic file for Foundry VTT (dnd5e system): ability scores, saves, skills, Hit Points, Armor Class, Speed, coins, class levels, and the names of items, spells, and features. In Foundry, right-click a character and choose Import Data.</p><div class="bkpr"><button type="button" class="btn press" data-chf="foundry">Export for Foundry VTT</button></div>'+
   '<h4 class="chfh">Snapshots</h4><p class="muted">The last 5 versions of this character, kept on this device. One is taken after each hour of play, before Apply from the builder, Restore, and Open Character, and once a day.</p>'+
   (SN_BAD?'<p class="hbkl warn">The snapshot list on this device is damaged, so new snapshots are not saved. It is left as it is. Back Up your characters to keep a safe copy.</p>':'')+(L.length?'<div class="snl">'+L.map((x,i) =>{ return '<div class="snr"><span><b>'+fmtT(x.t)+'</b><small>'+esc(x.why)+(x.name?' • '+esc(x.name)+' '+esc(cOf(x.C).clsLabel||((cOf(x.C).cls||"")+" "+(cOf(x.C).level||""))):'')+'</small></span><button type="button" class="btn press" data-snr="'+i+'">Restore</button></div>'; }).join("")+'</div>':'<p class="muted">No snapshots yet.</p>')+
   '<div class="bkpr"><button type="button" class="btn press" data-chf="snap">Take Snapshot Now</button><button type="button" class="btn press" data-chf="dup">Make a Copy</button></div></div>';
  document.body.appendChild(w);
  const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
  let txt=null;
  w.addEventListener("click",(e) =>{ if(e.target===w){ w.remove(); return; } const s=e.target.closest("[data-snr]"); if(s){ snRestore(id,+s.getAttribute("data-snr")); return; } const b=e.target.closest("[data-chf]"); if(!b) return; const a=b.getAttribute("data-chf");
    if(a==="close"){ w.remove(); return; }
    if(a==="save"){ chSave(id); return; }
    if(a==="dup"){ chCopy(id); w.remove(); return; }
    if(a==="foundry"){ __R.foundryOut(id); return; }/* v27 RU75 */
    if(a==="send"){ __R.qrSendOpen(id); return; }/* v34 item 5 */
    if(a==="text"){ const t=JSON.stringify(chFile(id)); w.querySelector(".bkpt").hidden=false; zPack(t).then((z) =>{ txt=z; },() =>{ txt=t; }).then(() =>{ const ta=document.getElementById("chfTxt"); if(ta){ ta.value=txt; ta.focus(); ta.select(); } }); return; }
    if(a==="copy"){ const ta=document.getElementById("chfTxt"); copyText(txt||ta.value,ta).then((ok) =>{ toast(ok?"Character text copied":"Select the text and copy it"); }); return; }
    if(a==="snap"&&SN_BAD){ toast("Snapshots cannot be saved: the snapshot list on this device is damaged"); return; }
    if(a==="snap"){ const rr=rSnap(rEnsure()), before=(snGet().chars[id]||[]).length; snTake(id,"Taken by hand",rr); toast((snGet().chars[id]||[]).length>before||before>=5?"Snapshot taken":"No changes since the last snapshot"); chfOpen(id); return; } }); }
/* import: backup or character file, plain or packed */
