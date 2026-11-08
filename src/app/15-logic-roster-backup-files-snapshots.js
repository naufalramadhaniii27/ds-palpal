import {bindLive,campKeep,campSel,ico,icoCls,lateGet,lateSet,libOpen,partyOpen,pwaInstH,reportOpen,tourBanner,wnBanner,wnOpen,dataUri,esArt,rEnsure,rSave} from "./00a-reg-late-ports.js";import {LOGO_IMG} from "./01-logic-boot-flags-builder-loader.js";import {APP_DATE,APP_LABEL,APP_VER,C,CKEY,FROZEN,KEY,S,SAVE_FAIL,__set_S_RAW,cSaveT,clsLv,lsGet,lsSave,lsSet,saveT} from "./04-logic-storage.js";import {ask,esc,toast} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {env} from "./00-env.js";import {bkpOpen} from "./15b-logic-backup.js";import {askPersist,chRaw,fileMark,fileStale,homeInfo,persistShow,rawHash} from "./15c-logic-file-state-compress.js";import {BIN_OPEN,chfOpen,snBack,snTake} from "./15d-logic-snapshots-character-files.js";
bindLive("showHome",{get:function(){return showHome;}});
export function rPh(r){ return Object.keys((r||{}).chars||{}).filter((id) =>{ return r.chars[id].ph; }); }
/* v18 RL47: the roster entry keeps its other fields (created, file marks, fields of newer versions). B, C, S come from memory, so a full storage cannot put an old copy in the roster */
export function rSnap(r){if(FROZEN)return r;clearTimeout(cSaveT);clearTimeout(saveT);lsSave(CKEY,C);if(lsSave(KEY,S))__set_S_RAW(JSON.stringify(S));const o=r.chars[r.active]||{};o.name=C.name;o.sub=(C.species||"")+" "+clsLv();o.B=lsGet(lateGet("BKEY"));o.C=JSON.stringify(C);o.S=JSON.stringify(S);o.t=Date.now();r.chars[r.active]=o;rSave(r);return r}
/* V18-1: switching characters must never lose the open one. Stop when the roster (which holds the open character's latest copy) cannot be saved.
   The shared slots are written one by one, and put back as they were if storage runs out half way */
export function rLoad(r,id,openB){const t=r.chars[id],prev=r.active;if(!t||FROZEN)return false;r.active=id;rPh(r).forEach((k) =>{ if(k!==id) delete r.chars[k]; });/* v24 p08 */
 if(!rSave(r)||SAVE_FAIL){r.active=prev;toast("Storage is full, so the character was not switched and nothing was lost. Back up, then make room.");return false}
 let old=[[CKEY,lsGet(CKEY)],[KEY,lsGet(KEY)],[lateGet("BKEY"),lsGet(lateGet("BKEY"))]],nv=[[CKEY,t.C||null],[KEY,t.S||null],[lateGet("BKEY"),t.B||null]],ok=true;
 nv.forEach((p) =>{if(!ok)return;if(p[1]==null){try{__store.removeItem(p[0])}catch(e){}}else if(!lsSet(p[0],p[1]))ok=false});
 if(!ok){old.forEach((p) =>{try{if(p[1]==null)__store.removeItem(p[0]);else __store.setItem(p[0],p[1])}catch(e){}});r.active=prev;rSave(r);toast("Storage is full, so the character was not switched and nothing was lost. Back up, then make room.");return false}
 if(openB)try{__store.setItem("cs-new","1")}catch(e){}__miReload();return true}
function charInfo(id,r){
const _charInfoStep1=charInfoStep1(r, id);
const {c}=_charInfoStep1;
let {Cc, Ss}=_charInfoStep1;return {id:id,name:Cc.name||c.name||"Unnamed",level:+Cc.level||1,species:(Cc.species||"").split(" (")[0],cls:Cc.cls||"",sub:Cc.sub||"",label:Cc.clsLabel||"",camp:(typeof Ss.camp==="string"?Ss.camp.trim():Cc.office)||"",por:(/^(data:image\/|blob:|https?:)/.test(Ss.portrait||"")?Ss.portrait:""),color:Ss.color||"forest",sym:Ss.sym||"star",created:c.created||c.t||0}}
function charInfoStep1(r, id){
let c=r.chars[id]||{},Cc=null,Ss=null;try{Cc=id===r.active?C:JSON.parse(c.C||"null")}catch(e){}try{Ss=id===r.active?S:JSON.parse(c.S||"null")}catch(e){}
 Cc=Cc||{};Ss=Ss||{};const lv=Cc.clsLabel||((Cc.cls||"")+" "+(Cc.level||1));
  return /** @type {any} */ ({c, Cc, Ss});
}
let homeQ="",homeSort="created";
/* T3: the Home hero, "Continue your adventure", for the character that is open now. Hidden while a search is typed */
function homeHero(){ const r=rEnsure(), id=r.active&&r.chars[r.active]&&!r.chars[r.active].ph?r.active:Object.keys(r.chars).filter((k) =>{ return !r.chars[k].ph; })[0]; if(!id) return "";
  const x=charInfo(id,r), p=lateGet("PALS")[x.color]||lateGet("PALS").forest, line=x.label?("Level "+x.level+" | "+x.species+" | "+x.label):("Level "+x.level+" | "+x.species+" | "+x.cls+(x.sub?"/"+x.sub:"")),
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
function homeSil(x){ const ck=(typeof lateGet("icoCls")==="function")?icoCls(x.label||x.cls):"", ci=ck&&typeof lateGet("ICO")==="object"&&lateGet("ICO")&&lateGet("ICO")[ck]?ico(ck,"hpor-ci"):"";
  return '<svg class="hpor-sil" viewBox="0 0 100 125" aria-hidden="true"><path d="M50 16c-13.5 0-23 10.5-23 25 0 8.6 3.6 16.2 9.4 21C22.6 66.8 13 78 10.5 94L9 125h82l-1.5-31C87 78 77.4 66.8 63.6 62c5.8-4.8 9.4-12.4 9.4-21 0-14.5-9.5-25-23-25z"/></svg>'+(ci?'<span class="hpor-c" title="'+esc(x.cls||"")+'">'+ci+'</span>':''); }
const HCMD=[["Create a Character","create new character","[data-hnew]"],["Open a character from a file","open import file","[data-hbk=open]"],["Back up characters","back up backup export save","[data-hbk=out]"],["Restore from a backup","restore backup import","[data-hbk=in]"],["Open the party","party group","[data-hparty]"],["Settings","settings storage backup details gear","[data-hbk=info]"]];
function hcmdList(){ const a=HCMD.slice(); if(typeof lateGet("PWA_EV")!=="undefined"&&lateGet("PWA_EV")) a.push(["Install the app","install app pwa home screen",".happ [data-pwainst]"]); return a; }
function homeLibBtn(){const q=homeQ.trim();return q.length>=2&&typeof lateGet("libOpen")==="function"?'<button type="button" class="hbk hcmd" data-hlib="'+esc(q)+'"><span class="hbt">Search the library for "'+esc(q.length>24?q.slice(0,24)+"...":q)+'"</span></button>':""}
function homeCmds(){const q=homeQ.trim().toLowerCase();if(!q)return "";let m=hcmdList().filter((c) =>{return (c[0]+" "+c[1]).toLowerCase().indexOf(q)>=0});if(!m.length)m=[];
 return '<div class="hcmds" role="group" aria-label="Commands">'+m.map((c) =>{return '<button type="button" class="hbk hcmd" data-hcmd="'+c[2]+'"><span class="hbt">'+esc(c[0])+'</span></button>'}).join("")+homeLibBtn()+'</div>'}
export function homeCards(noSnap){return homeCmds()+homeCards1(noSnap)}
function homeCards1(noSnap){
const _homeCards1Step1=homeCards1Step1(noSnap);
const {r}=_homeCards1Step1;
let {list}=_homeCards1Step1;
 if(!list.length&&!homeQ) return '<div class="hempty hempty-art">'+esArt("hero")+'<p>No characters yet. Press <b>Create a Character</b> to build one, or <b>Open Character</b> to add one from a file.</p></div>';/* v24 p08 */
({list}=homeCards1Step2(list));
 return list.map((x) =>{const p=lateGet("PALS")[x.color]||lateGet("PALS").forest;const bg='background:linear-gradient(90deg,'+p[1]+' 0%,'+p[2]+' 100%)';
  const line=x.label?("Level "+x.level+" | "+x.species+" | "+x.label):("Level "+x.level+" | "+x.species+" | "+x.cls+(x.sub?"/"+x.sub:""));
  const fm=fileMark(x.id),uns=fileStale(fm,!!fm&&fm.h!==rawHash(chRaw(x.id,r)));/* v33 p10 */
  return '<div class="hcard"><div class="hcard-top" style="'+bg+'"><span class="hwm" style="background-image:'+dataUri(x.sym,"#ffffff",.9)+'"></span><span class="hpor'+(x.por?' has':'')+'" style="'+(x.por?'background-image:url('+x.por+')':'')+'">'+(x.por?'':homeSil(x))+'</span><div class="hname"><b>'+esc(x.name)+'</b><span>'+esc(line)+'</span>'+(uns?'<button type="button" class="hunsv" data-hfile="'+x.id+'" aria-label="File out of date. Open the file options">File out of date</button>':'')/* v32 p92 */+'</div>'+(x.camp?'<button type="button" class="hcamp'+(lateGet("homeCamp")===x.camp?' on':'')+'" data-hcampf="'+esc(x.camp)+'" aria-pressed="'+(lateGet("homeCamp")===x.camp)+'" aria-label="'+(lateGet("homeCamp")===x.camp?'Show all campaigns':'Show only the campaign '+esc(x.camp))+'">'+((typeof lateGet("ICO")==="object"&&lateGet("ICO"))?ico("ui-flag","hcamp-i"):'')+'Campaign: <i>'+esc(x.camp)+'</i>'+((typeof lateGet("ICO")==="object"&&lateGet("ICO"))?ico(lateGet("homeCamp")===x.camp?"ui-close":"ui-filter","hcamp-f"):'')+'</button>':'')+'</div><div class="hact">'+(r.chars[x.id]&&r.chars[x.id].practice?'<div class="hprac"><span>Practice hero from Learn</span><button type="button" data-hkeep="'+x.id+'">Keep</button><button type="button" data-hdisc="'+x.id+'">Discard</button></div>':'')+'<button type="button" data-hview="'+x.id+'">View</button><button type="button" data-hedit="'+x.id+'">Edit</button><button type="button" data-hfile="'+x.id+'">File</button><button type="button" class="del holdc" data-hdel="'+x.id+'" title="Hold to delete"><span class="holdc-fill"></span><span class="holdc-label">Delete</span></button></div></div>'}).join("")||'<p class="hempty">No characters match your search.</p>'}
function homeCards1Step1(noSnap){
let r=noSnap?rEnsure():rSnap(rEnsure()),list=Object.keys(r.chars).filter((id) =>{return !r.chars[id].ph&&campKeep(id,r)})/* v27 RU64 */.map((id) =>{return charInfo(id,r)});
  return /** @type {any} */ ({r, list});
}
function homeCards1Step2(list){
const q=homeQ.toLowerCase();
 if(q)list=list.filter((x) =>{return (x.name+" "+x.level+" "+x.species+" "+x.cls+" "+x.sub+" "+x.camp).toLowerCase().indexOf(q)>=0});
 list.sort((a,b) =>{if(homeSort==="name")return a.name.localeCompare(b.name);if(homeSort==="level")return b.level-a.level;if(homeSort==="newest")return b.created-a.created;return a.created-b.created});
  return /** @type {any} */ ({list});
}
/* T11 Learn: the band on Home that opens Hoot's Training Grounds (src/learn, loaded with the deferred parts). Its words follow the
   language chosen in Learn (cs-learn-v1). After the first stop it shows how many of the five first stops are done */
export function learnBand(){ let o={}; try{ o=JSON.parse(lsGet("cs-learn-v1")||"{}")||{}; }catch(e){ o={}; } const id=o.lang==="id", dn=o.done&&typeof o.done==="object"?o.done:{}, d=["tavern","rooftops","forest","campsite","market"].filter((k) =>{ return dn[k]; }).length;
  const t=d?(id?"Tempat Latihan Hoot":"Hoot's Training Grounds"):(id?"Baru di sini?":"New here?"), s=d?(d+" / 5"):(id?"Kenali aplikasi dan belajar main D&D dalam 15 menit.":"Tour the app and learn to play D&D in 15 minutes."), b=d?(id?"Lanjut belajar":"Keep learning"):(id?"Belajar main":"Learn to play");
  return '<div class="hlearn" id="hlearnB"><span class="lrn-hoot"><img src="img/vig/empty/spells.avif" alt="" loading="lazy" decoding="async"></span><span><b>'+esc(t)+'</b><small>'+esc(s)+'</small></span><button type="button" class="btn pri press" data-hlearn="1">'+esc(b)+'</button></div>'; }
/* G7: the Training Ground band on Home, under the Learn band */
function tgBand(){ return '<div class="hlearn htg" id="htgB"><span class="lrn-hoot htg-i">'+((typeof lateGet("ICO")==="object"&&lateGet("ICO"))?ico("ui-shield"):"")+'</span><span><b>Training Ground</b><small>Try your character against monsters. Your sheet never changes.</small></span><button type="button" class="btn press" data-tgopen="1">Train</button></div>'; }
export function tgGo(){ const go=() =>{ if(env.__tgOpen) env.__tgOpen(); else toast("The Training Ground is still loading. Try again in a moment."); }; if(!env.__tgOpen&&env.__bldNeed) Promise.resolve(env.__bldNeed()).then(go,go); else go(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-tgopen]"); if(!b) return; e.preventDefault(); tgGo(); });
export function learnGo(o){ const go=() =>{ if(env.__learnOpen) env.__learnOpen(o); }; if(!env.__learnOpen&&env.__bldNeed) Promise.resolve(env.__bldNeed()).then(go,go); else go(); }
export function showHome(){let w=document.getElementById("homeV");if(!w){w=document.createElement("div");w.id="homeV";w.setAttribute("role","region");w.setAttribute("aria-label","My Characters");document.body.appendChild(w);
  w.addEventListener("click",(e) =>{const l=e.target.closest&&e.target.closest("[data-hlib]");if(l){libOpen({q:l.getAttribute("data-hlib")});return}const c=e.target.closest&&e.target.closest("[data-hcmd]");if(!c)return;const t=w.querySelector(".hbtns "+c.getAttribute("data-hcmd"))||w.querySelector(c.getAttribute("data-hcmd"));if(t)t.click()});
  w.addEventListener("keydown",(e) =>{if(e.target.id==="homeQ"&&e.key==="Enter"){const c=w.querySelector(".hcmd");if(c){e.preventDefault();c.click()}}});
  w.addEventListener("input",(e) =>{if(e.target.id==="homeQ"){homeQ=e.target.value;const hh=document.getElementById("hxHero");if(hh)hh.hidden=!!homeQ;document.getElementById("hgrid").innerHTML=homeCards()}});
  w.addEventListener("change",(e) =>{if(e.target.id==="homeCamp"){lateSet("homeCamp",e.target.value);document.getElementById("hgrid").innerHTML=homeCards();return}/* v27 RU64 */if(e.target.id==="homeSort"){homeSort=e.target.value;document.getElementById("hgrid").innerHTML=homeCards()}});
  w.addEventListener("click",(e) =>{const b=e.target.closest("button");if(!b)return;const d=b.dataset,r=rEnsure();
   if(d.hview){if(d.hview===r.active){w.hidden=true;document.body.style.overflow="";return}rSnap(r);sessionStorage.setItem("cs-skip","1");rLoad(r,d.hview,false);return}
   if(d.hedit){if(d.hedit===r.active){w.hidden=true;document.body.style.overflow="";if(env.__bldOpen)env.__bldOpen();return}rSnap(r);sessionStorage.setItem("cs-skip","1");try{__store.setItem("cs-edit","1")}catch(er){}if(rLoad(r,d.hedit,false)===false)try{__store.removeItem("cs-edit")}catch(er){}return}
   if(d.hkeep){const kp=r.chars[d.hkeep];if(kp){delete kp.practice;rSave(r);document.getElementById("hgrid").innerHTML=homeCards(true);toast("Kept. It is a normal character now.")}return}
   if(d.hdisc){const dc=d.hdisc;if(Object.keys(r.chars).length<2){toast("You need at least one character");return}ask("Discard the practice hero "+((r.chars[dc]||{}).name||"")+"? A copy stays in Snapshots for a while, so it can come back.","Discard",() =>{const r2=rSnap(rEnsure());snTake(dc,"Before Discard",r2);const was=dc===r2.active;delete r2.chars[dc];rSave(r2);if(was){sessionStorage.setItem("cs-skip","0");rLoad(r2,Object.keys(r2.chars)[0],false);return}document.getElementById("hgrid").innerHTML=homeCards(true);toast("Practice hero discarded.")});return}
   if(d.hdel){if(Object.keys(r.chars).length<2){toast("You need at least one character");return}if(b.dataset.sure!=="1"&&b.dataset.heldDone!=="1"){b.dataset.sure="1";const bl=b.querySelector(".holdc-label");if(bl)bl.textContent="Tap again";else b.textContent="Tap again";return}snTake(d.hdel,"Before Delete",rSnap(r));const was=d.hdel===r.active;delete r.chars[d.hdel];rSave(r);if(was){sessionStorage.setItem("cs-skip","0");rLoad(r,Object.keys(r.chars)[0],false);return}document.getElementById("hgrid").innerHTML=homeCards();const hi=document.getElementById("hinfo");if(hi)hi.innerHTML=homeInfo();persistShow();const hs=document.querySelector("#homeV .hslots b");if(hs)hs.textContent=Object.keys(r.chars).length;return}
   if(d.hcampf!=null){lateSet("homeCamp",lateGet("homeCamp")===d.hcampf?"":d.hcampf);const hc=document.getElementById("homeCamp");if(hc)hc.value=lateGet("homeCamp");document.getElementById("hgrid").innerHTML=homeCards();return}/* v32 p28 RU133 */
   if(d.hlearn){learnGo();return}/* T11 Learn */if(d.hparty){partyOpen();return}if(d.hrep){reportOpen();return}/* v27 RU60, RU71 */
   if(d.hbk){bkpOpen(d.hbk);return}/* v14 Backup/Restore, v18 Open Character */
   if(d.hfile){chfOpen(d.hfile);return}/* v18 RU67 */
   if(d.hwn){if(d.hwn==="ok"){try{__store.setItem("cs-ui-ver",String(APP_VER))}catch(er){}lateSet("WN_SHOW",false);const bn=document.getElementById("hwnB");if(bn)bn.remove();return}wnOpen();return}/* v18 RU59 */
   if(d.hpers){askPersist();return}
   if(d.hall){const hg=document.getElementById("hgrid");if(hg)hg.scrollIntoView({behavior:(env.__MI&&env.__MI.rm&&env.__MI.rm())?"auto":"smooth",block:"start"});return}
   if(d.hbin){lateSet("BIN_OPEN",!BIN_OPEN);const hb=document.getElementById("hinfo");if(hb)hb.innerHTML=homeInfo();return}
   if(d.hback){snBack(d.hback);return}/* v18: bring back a deleted character from its newest snapshot */
   if(d.hnew){rSnap(r);const nid="c"+Date.now();r.chars[nid]={name:"New Character",created:Date.now(),t:Date.now()};try{if(sessionStorage.getItem("cs-forge"))r.chars[nid].practice=1}catch(e){}/* T11 Learn F3: a hero from Forge Your Hero is a practice hero until kept */try{sessionStorage.setItem("cs-skip","1")}catch(e){}rLoad(r,nid,true);return}})}
 const {n}=showHomeStep1();
 w.innerHTML='<div class="hwrap"><div class="hhead"><h1>My Characters</h1><div class="hbtns" role="toolbar" aria-label="Character actions"><button type="button" class="hcreate" data-hnew="1"><span class="hbt">Create<span class="hbz"> a Character</span></span></button><button type="button" class="hbk" data-hbk="open"><span class="hbt">Open<span class="hbz"> Character</span></span></button><button type="button" class="hbk" data-hbk="out"><span class="hbt">Back Up</span></button><button type="button" class="hbk" data-hbk="in"><span class="hbt">Restore</span></button><button type="button" class="hbk" data-hparty="1"><span class="hbt">Party</span></button><button type="button" class="hbk hic" data-hbk="info" aria-label="Settings: backup and storage"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button></div></div><p class="hslots">Characters: <b>'+n+'</b></p>'+wnBanner()+tourBanner()+'<div id="hinfo">'+homeInfo()+'</div>'+homeHero()+learnBand()+tgBand()+'<div class="hbar"><label class="hsearch"><span>Search</span><input id="homeQ" type="search" placeholder="Name, level, class, species, campaign" aria-label="Search by name, level, class, species, or campaign" value="'+esc(homeQ)+'"></label><label class="hsort"><span>Sort By</span><select id="homeSort">'+[["created","Created: Oldest"],["newest","Created: Newest"],["name","Name"],["level","Level"]].map((o) =>{return '<option value="'+o[0]+'"'+(homeSort===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></label>'+campSel(rEnsure())+'</div><div class="hgrid" id="hgrid">'+homeCards()+'</div><p class="happ">'+'<img class="happ-i" src="'+LOGO_IMG+'" width="32" height="32" alt="">'+'<b>D&amp;D Sheet</b>'+pwaInstH()+'</p><p class="hcredit">Designed by Palpale</p><p class="hver">Version '+APP_LABEL+' ('+APP_DATE+') <button type="button" class="hlink" data-hwn="all">What\'s new</button> <button type="button" class="hlink" data-hrep="1">Report a problem</button></p></div>';
 showHomeStep2();
 w.hidden=false;
showHomeStep3();}
function showHomeStep1(){
 const n=Object.keys(rEnsure().chars).length-rPh(rEnsure()).length;
  return /** @type {any} */ ({n});
}
function showHomeStep2(){
 setTimeout(() =>{ const hi=document.getElementById("hinfo"); if(hi) hi.innerHTML=homeInfo(); persistShow(); },0);
}
function showHomeStep3(){
document.body.style.overflow="hidden"
}
