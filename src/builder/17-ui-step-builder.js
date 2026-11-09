import {bindLive,lateGet,spCmpB,spDmgB,spRngB} from "./01b-logic-late-ports.js";import {genv} from "./00-env.js";
import {esc} from "./01-logic-core-helpers.js";
import {bgX,spX} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {fs14List,sdn,subLbl} from "./08-logic-2014-rules.js";
import {allFeats,choiceLvl,choices,featChosen,featViol,grantTools,saveTaken,scoreAt,spClsJ} from "./09-logic-feats-and-choices.js";
import {invList,optAny} from "./10-logic-v17-additions.js";
import {abil,casterParts,clsLv} from "./11-logic-derivation.js";
import {toSheet} from "./12-logic-export-to-sheet.js";
import {allPacks,packSkills} from "./13-logic-sources-and-packs.js";
import {MCL,langKeys} from "./14-logic-multiclass-hp-shop.js";
bindLive("STEPS",{get:function(){return STEPS;}});bindLive("__set_openCards",{get:function(){return __set_openCards;}});bindLive("__set_pickCls",{get:function(){return __set_pickCls;}});bindLive("__set_pickSp",{get:function(){return __set_pickSp;}});bindLive("__set_step",{get:function(){return __set_step;}});bindLive("ask",{get:function(){return ask;}});bindLive("openCards",{get:function(){return openCards;}});bindLive("pickCls",{get:function(){return pickCls;}});bindLive("pickSp",{get:function(){return pickSp;}});bindLive("step",{get:function(){return step;}});
bindLive("preFail",{get:function(){return preFail;}});
/* ================= UI: step builder ================= */
export var STEPS=[["home","Home"],["class","Class"],["bg","Background"],["species","Species"],["abil","Abilities"],["equip","Equipment"],["next","What's Next"],["rules","Rules"]];
/* v33 p02 (C13): step icons, line icons from the sheet set (ICO) */
export var STEP_ICO={home:"step-home","class":"step-class",bg:"step-background",species:"step-species",abil:"step-abilities",equip:"step-equipment",next:"step-next",rules:"ui-book"};
export function bI(k,c){const I=genv.__ICO;return (I&&I[k]&&genv.__ico)?genv.__ico(k,"bi"+(c?" "+c:"")):""}
export var step="class",openCards={},pickCls=false,pickSp=false;
genv.__bldAsk=function(m,o,c){ return ask(m,o,c); };/* v35 p01: test hook */export function ask(msg,ok,cb){const w=document.createElement("div"),prev=document.activeElement;w.className="exp";w.setAttribute("role","dialog");w.setAttribute("aria-modal","true");w.innerHTML='<div class="expb"><p class="fd" style="font-size:16px">'+esc(msg)+'</p><div class="row"><button type="button" data-no="1">Cancel</button><button type="button" class="pri" data-yes="1">'+esc(ok)+'</button></div></div>';(document.getElementById("bld")||document.body).appendChild(w);if(genv.__topLayer)genv.__topLayer(w);/* T11 A5 */
 function close(){w.remove();document.removeEventListener("keydown",onKey,true);if(prev&&prev.focus)try{prev.focus({preventScroll:true})}catch(e){}}function onKey(e){if(e.key==="Escape"){e.stopPropagation();close()}}/* v19 V19-5 */
 document.addEventListener("keydown",onKey,true);const y=w.querySelector("[data-yes]");if(y)y.focus({preventScroll:true});
 w.addEventListener("click",(e) =>{const b=e.target.closest("button");if(e.target===w||(b&&b.dataset.no)){close();return}if(b&&b.dataset.yes){close();cb()}})}
export function fmtGp(p){return p>=1?p+' GP':p>=0.1?Math.round(p*10)+' SP':Math.round(p*100)+' CP'}
export function ord(n){const s=["th","st","nd","rd"],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0])}
export function profSkills(){let s=[],bg=bgX();if(bg)s=s.concat(bg.sk);choices().forEach((c) =>{if(c.t==="skills"&&Array.isArray(B.ch[c.key]))s=s.concat(B.ch[c.key])});return s.filter((x,i) =>{return s.indexOf(x)===i&&(SKILLS[x]||packSkills().some((p) =>{return p.n===x}))})}
/* v32 RL49: tools the character has from somewhere else (name -> source), for the overlap mark on tool chips */
function toolTaken(key){const o={},c=CL(),bg=bgX(),add=function(t,s){String(t||"").split(/,\s*/).forEach((n) =>{if(n&&!o[n])o[n]=s})};
 if(!c.toolPick)add(c.tools,B.cls);if(bg&&!bg.toolPick)add(bg.tool,B.bg+" background");grantTools().forEach((q) =>{add(q[0],q[1])});MCL().forEach((m) =>{const g=MC_GRANT[m.cls]||{};if(!g.toolPick)add(g.tools,m.cls)});
 choices().forEach((x) =>{if(x.key===key)return;const v=B.ch[x.key];if(Array.isArray(v)&&(x.t==="tool"||(x.t==="skills"&&x.tools)))v.forEach((n) =>{if(!SKILLS[n]&&!o[n])o[n]=x.feature||x.title})});return o}
function toolChips(c,cats){const v=B.ch[c.key]||[],tk=toolTaken(c.key);return cats.map((k) =>{return '<p class="wgrp">'+esc(TOOL_CAT[k])+'</p><div class="chips">'+TOOLS[k].map((n) =>{const on=v.indexOf(n)>=0,cl=!on&&tk[n];
  return '<button type="button" class="chip'+(on?" on":"")+(cl?" clash":"")+'" data-ck="'+c.key+'" data-n="'+c.n+'" data-v="'+esc(n)+'"'+(cl?' data-clash="'+esc(cl)+'"':"")+'>'+(cl?"\u26a0 ":"")+esc(n)+(cl?" ("+esc(cl)+")":"")+'</button>'}).join("")+'</div>'}).join("")}
function featOptsList(c){const taken=featChosen(c.key),hasFS=(CL().fs&&B.level>=CL().fs)||MCL().some((m) =>{const f=CLASSES[m.cls].fs;return f&&m.lv>=f});/* v19 idea: Fighting Style from a multiclass too */
 return Object.keys(FEATS).filter((n) =>{const F=FEATS[n];if(c.t==="ofeat")return F.cat==="O";/* v19 RL46: Origin feats allowed at an ASI level */if(F.cat==="E"&&c.cat!=="E")return false;if(F.cat==="F"&&!hasFS)return false;return F.rep||taken.indexOf(n)<0||(B.ch[c.key]&&B.ch[c.key].feat===n)})}
let LINKRX=null,LINKMAP={};
function buildLinks(){const names=[];SPELLS.forEach((x) =>{const e=esc(x[0]);LINKMAP[e.toLowerCase()]=["sp",x[0]];names.push(e)});Object.keys(FEATS).forEach((n) =>{const e=esc(n);if(n.length>4&&!LINKMAP[e.toLowerCase()]){LINKMAP[e.toLowerCase()]=["ft",n];names.push(e)}});
 names.sort((a,b) =>{return b.length-a.length});LINKRX=new RegExp("\\b("+names.map((n) =>{return n.replace(/[.*+?^${}()|[\]\\\/]/g,"\\$&")}).join("|")+")\\b","g")}
function linkText(h){if(!LINKRX)buildLinks();return h.replace(/(<[^>]+>)|([^<]+)/g,(m,tag,txt) =>{if(tag)return tag;return txt.replace(LINKRX,(n,p1,off,s) =>{const k=LINKMAP[n.toLowerCase()];if(!k)return n;const pre=s.slice(Math.max(0,off-9),off);if(n==="Light"&&/(Dim|Bright) $/.test(pre))return n;if(n==="Darkness"&&/(\bor|\bin|magical|\bof) $/.test(pre))return n;/* V14-7 */if(k[0]==="ft"&&!/^[A-Z]/.test(n))return n;return '<button type="button" class="lnk" data-lnk="'+k[0]+'|'+esc(k[1])+'">'+n+'</button>'})})}
function xb(h){return genv.__xl&&genv.__xl.xlink?genv.__xl.xlink(h,null,"b"):h}
export function rt(t){return xb(linkText(esc(t).replace(/\*\*(.+?)\*\*/g,"<strong>$1</strong>")))}
/* full texts: bold labels start a new line */
/* full text of a magic item: real paragraphs, and "Roll 01-10: ..." lines as a d100 table */
export function mfullH(t){let L=rtp(t).split(/\n+/),h="",tb=[];function fl(){if(tb.length){h+='<div class="mroll" role="table">'+tb.join("")+'</div>';tb=[]}}L.forEach((x) =>{x=x.trim();if(!x)return;const m=/^(?:<strong>)?(?:Roll\s+)?(\d{1,3}(?:\s*[-\u2013]\s*\d{1,3})?)(?::|\.)?(?:<\/strong>)?\s*:?\s+(.+)$/.exec(x);if(m&&(/^(?:<strong>)?Roll/.test(x)||tb.length)){tb.push('<div class="mroll-r" role="row"><b role="cell">'+m[1].replace(/\s*[-\u2013]\s*/,"\u2013")+'</b><span role="cell">'+m[2]+'</span></div>')}else{fl();h+='<p>'+x+'</p>'}});fl();return h}
export function rtp(t){return rt(t).replace(/ <strong>/g,"<br><strong>")}
/* v20 RD25: setting page of a pack (Public Lore), paragraphs split on blank lines */
export function showLore(id){const p=allPacks().filter((x) =>{return x.id===id})[0];if(!p||!p.lore)return;const w=document.createElement("div"),prev=document.activeElement;w.className="exp";w.setAttribute("role","dialog");w.setAttribute("aria-modal","true");w.setAttribute("aria-labelledby","loreT");/* v20 M4 */
 w.innerHTML='<div class="expb lore"><div class="row lorex"><button type="button" data-no="1">Close</button></div><h3 class="rh" id="loreT">'+esc(p.name.replace(/ \(Homebrew\)$/,""))+': '+esc(p.loreLabel||"Public Lore")+'</h3>'+p.lore.map((x) =>{return '<h4>'+esc(x.title)+'</h4>'+String(x.text).split(/\n\n+/).map((t) =>{return '<p class="fd">'+rt(t)+'</p>'}).join("")}).join("")+'<div class="row"><button type="button" class="pri" data-no="1">Close</button></div></div>';
 (document.getElementById("bld")||document.body).appendChild(w);function close(){w.remove();document.removeEventListener("keydown",onKey,true);if(prev&&prev.focus)try{prev.focus({preventScroll:true})}catch(er){}}function onKey(e){if(e.key==="Escape"){e.stopPropagation();close()}}
 document.addEventListener("keydown",onKey,true);const cb=w.querySelector("[data-no]");if(cb)cb.focus({preventScroll:true});w.addEventListener("click",(e) =>{if(e.target===w||e.target.closest("[data-no]"))close()})}
genv.__bldRef=function(k,n){return showRef(k,n)};/* test hook */
/* showRef steps (SOLID s16): the HTML of one reference card, null when there is nothing to show */
function srXl(kind,name){try{const inf=genv.__xl.info(kind+":"+name);const ih=String(inf.h).replace(/<button type="button" class="lk xl" data-info="(cr|mi|spn|lib|g):([^"]*)"/g,(m,k,n) =>{return '<button type="button" class="lnk" data-lnk="'+(k==="spn"?"sp":k==="g"?"lib":k)+'|'+(k==="g"?"rule|":"")+n+'"'}).replace(/<button\b[^>]*data-info="[^"]*"[^>]*>([\s\S]*?)<\/button>/g,"$1");return '<h3 class="rh">'+esc(inf.t||name)+'</h3><div class="xref">'+ih+'</div>'}catch(er){return null}}
function srSpell(name){const x=lateGet("SMAP")[name];if(!x)return null;return '<h3 class="rh">'+esc(x[0])+'</h3><p class="fd"><i>'+(x[1]?ord(x[1])+" level ":"")+esc(x[2])+(x[1]?"":" cantrip")+'</i>'+(x[8]?' \u2022 Concentration':'')+(x[9]?' \u2022 Ritual':'')+'</p><p class="fd">'+rtp(SPELL_FULL[x[0]]||x[11]||"")+'</p><div class="sdet"><span><b>Casting Time</b>'+esc(x[4])+(x[9]?" or Ritual":"")+'</span><span><b>Range</b>'+spRngB(x)+'</span><span><b>Components</b>'+spCmpB(x)+'</span><span><b>Duration</b>'+(x[8]?"Concentration, ":"")+esc(x[7])+'</span>'+spDmgB(x)+'<span><b>'+(x[10]==="ATK"?"Attack":"Save")+'</b>'+(x[10]==="ATK"?"Spell attack roll":x[10]?x[10]+" saving throw":"None")+'</span><span class="w"><b>Classes</b>'+esc(spClsJ(x))+'</span></div>'}
function srFeat(name){const F=FEATS[name];if(!F)return null;return '<h3 class="rh">'+esc(name)+'</h3><p class="fd"><i>'+({O:"Origin feat",G:"General feat",F:"Fighting Style feat",E:"Epic Boon",X:"Fighting Style option"}[F.cat]||"Feat")+(F.pre?' \u2022 '+esc(F.pre):'')+'</i></p><p class="fd">'+rtp(F.full||F.d)+'</p>'}
export function showRef(kind,name){let h="";if(kind==="cr"||kind==="mi"||kind==="lib")h=srXl(kind,name);else if(kind==="sp")h=srSpell(name);
 else h=srFeat(name);if(h===null)return;
 const w=document.createElement("div");w.className="exp";w.innerHTML='<div class="expb">'+h+'<div class="row"><button type="button" class="pri" data-no="1">Close</button></div></div>';(document.getElementById("bld")||document.body).appendChild(w);
 w.addEventListener("click",(e) =>{if(e.target===w||e.target.closest("[data-no]"))w.remove()})}

/* accordion card */
export function card(id,title,meta,body,opts){opts=opts||{};const open=!!openCards[id];
 return '<div class="acc'+(opts.todo?" todo":"")+(open?" open":"")+'" data-acc="'+esc(id)+'">'+(opts.todo?'<span class="bang">!</span>':'')+
  '<button type="button" class="acc-h" data-tog="'+esc(id)+'"><span class="acc-t"><b>'+esc(title)+'</b>'+(meta?'<small>'+esc(meta)+'</small>':'')+'</span><svg class="bchev" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>'+
  '<div class="acc-b"'+(open?'':' hidden')+'>'+body+'</div></div>'}
export function metaOf(nChoice,lvl){const a=[];if(nChoice)a.push(nChoice+" Choice"+(nChoice>1?"s":""));if(lvl)a.push(ord(lvl)+" level");return a.join(" \u2022 ")}

/* choice widgets */
function skillSrcOther(n,key){const bg=bgX();if(bg&&bg.sk.indexOf(n)>=0)return B.bg+" background";const s=choices().filter((c) =>{return c.key!==key&&c.t==="skills"&&(B.ch[c.key]||[]).indexOf(n)>=0})[0];return s?s.title.replace(/ skill.*$/,""):""}
function skillSrc(n){const bg=bgX();if(bg&&bg.sk.indexOf(n)>=0)return B.bg;const s=choices().filter((c) =>{return c.t==="skills"&&(B.ch[c.key]||[]).indexOf(n)>=0})[0];return s?s.title.replace(/ skill.*$/,""):"have"}
/* chips steps (SOLID s16): one chip, the texts of the picked entries. v = the picked values */
function chItem(c,v,it){var n=Array.isArray(it)?it[0]:it,lb=it&&it.lab;if(lb)return '<button type="button" class="chip clash'+(v.indexOf(it.n)>=0?" on":"")+'" data-ck="'+c.key+'" data-n="'+c.n+'" data-v="'+esc(it.n)+'" data-clash="'+esc(lb)+'">\u26a0 '+esc(it.n)+' ('+esc(lb)+')</button>';var n=Array.isArray(it)?it[0]:it,d=Array.isArray(it)?it[1]:"",lk=Array.isArray(it)&&((it[2]&&it[2]>(c.lvCap||B.level))||(it[3]&&invList().indexOf(it[3])<0&&v.indexOf(n)<0))/* RD18: another invocation required */,on=v.indexOf(n)>=0;
 return '<button type="button" class="chip'+(on?" on":"")+'" data-ck="'+c.key+'" data-n="'+c.n+'" data-v="'+esc(n)+'"'+(lk?" disabled":"")+(d?' title="'+esc(String(d).replace(/\*\*/g,""))+'"':'')+'>'+esc(n)+'</button>'}
function chPicked(c,v){return '<div class="picked">'+v.map((n) =>{const m=c.list.filter((x) =>{return x[0]===n})[0];return m?'<p><b>'+esc(n)+'.</b> '+rtp(m[1])+'</p>'+(m[3]&&c.list===INVOCATIONS&&invList().indexOf(m[3])<0?'<div class="caution">\u26a0 '+esc(n)+' needs the '+esc(m[3])+' invocation. Choose it, or swap '+esc(n)+' for another invocation.</div>':''):''}).join("")+'</div>'}
function chips(c,items){const v=B.ch[c.key]||[];if(!items.length){const why=/\(([^)]+)\)$/.exec(c.title||"");return '<p class="fd bhint" data-cko="'+c.key+'">Nothing to choose from yet'+(why?': '+esc(why[1]):'')+'.</p>'}/* v32: empty list still names the choice */return '<p class="pick">Choose '+(c.opt?'up to ':'')+c.n+' ('+v.length+'/'+c.n+')</p><div class="chips">'+items.map((it) =>{return chItem(c,v,it)}).join("")+'</div>'+
 (c.list&&v.length?chPicked(c,v):'')}/* RU33: spell and feat names in the picked text open their popup */
/* RU13: a saved Fighting Style or Origin feat can be missing from FEATS (its source is off, or it was renamed).
   Keep the saved value in B.ch, show it as a disabled selected option, and explain instead of reading FEATS[v].full. */
function missOpt(v){return v&&!FEATS[v]?'<option value="'+esc(v)+'" selected disabled>'+esc(v)+' (not available)</option>':""}
function featInfo(v){const F=FEATS[v];return '<p class="fd">'+(F?rtp(F.full||F.d):"This option is not in your active sources. Turn its source back on in Home, or choose another one.")+'</p>'}
/* RU14: Dueling toggle under a chosen feat whose data has meleeDmg1h (Dueling). Writes B.duelMode "auto" (default), "on" or "off"
   through the data-b change handler (setB, then save). Logic reads it in toSheet; no rule is computed here. */
function duelCtl(v){const F=v&&FEATS[v];if(!F||!F.meleeDmg1h)return "";const m=B.duelMode==="on"||B.duelMode==="off"?B.duelMode:"auto",n="+"+F.meleeDmg1h+" damage";
 return '<label class="one">'+esc(v)+' bonus<select class="dd" data-b="duelMode">'+[["auto","Auto"],["on","Always on"],["off","Off"]].map((o) =>{return '<option value="'+o[0]+'"'+(m===o[0]?" selected":"")+'>'+o[1]+'</option>'}).join("")+'</select></label>'+
  '<p class="fd">'+{auto:"Auto: "+n+" while a one-handed melee weapon is your only active weapon. A Shield is fine.",on:"Always on: "+n+" with every one-handed melee weapon, even when another weapon is active.",off:"Off: the sheet never adds this damage."}[m]+'</p>'}
function cbFeatSel(c,fv){
  return '<select class="dd" data-fk="'+c.key+'" data-fp="feat"><option value="">- Choose a Feat -</option>'+featOptsList(c).map((n) =>{const X=FEATS[n],why=fv.feat===n?"":preFail(n,c.lvl,c.key),red=redundant(n);return '<option value="'+esc(n)+'"'+(fv.feat===n?" selected":"")+(why?" disabled":"")+'>'+(why?"\u2716 ":red?"\u26a0 ":"")+esc(n)+(X.cat==="F"?" (Fighting Style)":X.cat==="E"?" (Epic Boon)":"")+(why?" \u2014 needs "+why:red?" \u2014 "+red:"")+'</option>'}).join("")+'</select>';
}
function cbFeatInfo(c,fv,F){
 var h="";h+='<p class="fd">'+(F.pre?'<i>Prerequisite: '+esc(F.pre)+'.</i><br>':'')+rtp(F.full||F.d)+'</p>'+duelCtl(fv.feat);
   /* v19 RL46: options that would break a rule are disabled with the reason: past 20 at this level, a saving throw Resilient cannot take */
   const sAt=scoreAt(c.lvl,c.key),svT=F.saveFromAsi?saveTaken(c.key):[],why1=function(o){if(svT.indexOf(o)>=0)return "saving throw proficiency already";if(sAt[o]>=20&&!/^Boon of/.test(fv.feat))return "already 20";return ""};
   if(F.asi2)h+='<div class="two"><label>+1 to'+fsel(c.key,"a1",A6,fv.a1,why1)+'</label><label>+1 to (same = +2)'+fsel(c.key,"a2",A6,fv.a2,(o) =>{return why1(o)||(o===fv.a1&&sAt[o]>=19?"would go past 20":"")})+'</label></div>';
   else if(F.asi)h+='<label class="one">Ability Score Increase (+1)'+fsel(c.key,"a1",F.asi,fv.a1,why1)+'</label>';
   if(F.dt){const dtT=[];allFeats().forEach((g) =>{if(g.n===fv.feat&&g.key!==c.key&&g.asi&&g.asi.dt)dtT.push(g.asi.dt)});h+='<label class="one">Damage type (Energy Mastery)'+fsel(c.key,"dt",F.dt,fv.dt,(o) =>{return dtT.indexOf(o)>=0?"taken by your other "+fv.feat:""})+'</label>'}
   featViol().filter((x) =>{return x.k===c.key}).forEach((x) =>{h+='<div class="caution">\u26a0 '+esc(x.m)+'.</div>'})
 return h}
/* choiceBody(): one builder of the control html per pick type (c.t), called with (c, current value). SOLID stage 13C */
const CB_TYPES={
 text:function(c,v){const tv=typeof v==="string"?v:"";return '<input type="text" class="btx" data-chtx="'+esc(c.key)+'" value="'+esc(tv)+'" maxlength="160" autocomplete="off" autocapitalize="words" spellcheck="false" aria-label="'+esc(c.title||"Your choice")+'" placeholder="Type here">'+(c.opt?'<p class="fd bhint">Optional. You can leave this empty.</p>':'')}/* fx v3a: free text pick, string in B.ch */,
 lang:function(c,v){let tk=[];langKeys().forEach((k) =>{if(k!==c.key)tk=tk.concat(B.ch[k]||[])});if(clsLv("Druid"))tk.push("Druidic");if(clsLv("Rogue"))tk.push("Thieves' Cant");if(R14()){const sq=spX(),bq=bgX();tk=tk.concat((sq&&sq.lgf)||[]).concat((bq&&bq.lgf)||[])}return chips(c,c.from.filter((x) =>{return tk.indexOf(x[0])<0}))+'<p class="fd bhint">You always know Common. Rare languages need your DM\'s approval.</p>'},
 skills:function(c,v){const mine=v||[];const cl=(c.from||ALLSK).map((n) =>{const s=skillSrcOther(n,c.key);return s?{n:n,lab:s}:n});const dup=mine.map((n) =>{const s=skillSrcOther(n,c.key);return s?n+' (also from '+s+')':''}).filter(Boolean);
  if(c.tools)return chips(c,cl).replace('<p class="pick">','<p class="wgrp">Skills</p><p class="pick">')+toolChips(c,["art","music","game","other"])+(dup.length?'<div class="caution">\u26a0 Overlap: '+esc(dup.join(", "))+'.</div>':"");/* v32 RL49: Skilled, any mix of skills and tools */
  return chips(c,cl)+(dup.length?'<div class="caution">\u26a0 Overlap: '+esc(dup.join(', '))+'. A skill proficiency doesn\'t stack, so this pick is wasted. Choose a different skill.</div>':'')},
 exp:function(c,v){return chips(c,c.from||profSkills());},
 pe:function(c,v){const pk0=profSkills(),pv=v||[];return chips(c,c.from)+'<p class="fd bhint">Proficiency, or Expertise if you already have it.'+(pv.length?" "+pv.map((n) =>{return esc(n)+": "+(pk0.indexOf(n)>=0?"Expertise":"proficiency")}).join(", ")+".":"")+'</p>'}/* v32 RL49 no. 12, 13 */,
 tool:function(c,v){const tv=B.ch[c.key]||[];return '<p class="pick">Choose '+c.n+' ('+tv.length+'/'+c.n+')</p>'+toolChips(c,c.cats)}/* v32 RL49 */,
 wm:function(c,v){const sel=v||[],G=[["S","M","Simple Melee"],["S","R","Simple Ranged"],["M","M","Martial Melee"],["M","R","Martial Ranged"]];
  var h='<p class="pick">Choose '+c.n+' ('+sel.length+'/'+c.n+')</p>';
  G.forEach((g) =>{const ns=Object.keys(WEAPONS).filter((n) =>{const w=WEAPONS[n];return !w.xw&&!w.nm&&w.cat===g[0]&&w.k===g[1]&&(!c.melee||w.k==="M")}).sort();/* v32: Barbarian melee only, also as a multiclass */if(!ns.length)return;
   h+='<p class="wgrp">'+g[2]+'</p><div class="chips">'+ns.map((n) =>{const on=sel.indexOf(n)>=0;return '<button type="button" class="chip'+(on?" on":"")+'" data-ck="'+c.key+'" data-n="'+c.n+'" data-v="'+esc(n)+'" title="'+esc(WEAPONS[n].m+": "+MASTERY[WEAPONS[n].m])+'">'+esc(n)+' <small>'+WEAPONS[n].m+'</small></button>'}).join("")+'</div>'});
  return h+(sel.length?'<div class="picked">'+sel.map((n) =>{return '<p><b>'+n+' ('+WEAPONS[n].m+').</b> '+MASTERY[WEAPONS[n].m]+'</p>'}).join("")+'</div>':'')},
 multi:function(c,v){return chips(c,c.list);},
 fs:function(c,v){return '<select class="dd" data-ch="'+c.key+'"><option value="">- Choose a Fighting Style -</option>'+missOpt(v)+(R14()?fs14List(c.cls||B.cls):Object.keys(FEATS).filter((n) =>{return FEATS[n].cat==="F"||(FEATS[n].cat==="X"&&c.xopt&&FEATS[n].cls===(c.cls||B.cls))}))/* v32: a multiclass Paladin or Ranger too */.map((n) =>{return '<option'+(v===n?" selected":"")+'>'+n+'</option>'}).join("")+'</select>'+(v?featInfo(v):'')+duelCtl(v);},
 opt:function(c,v){return '<div class="radios">'+OPTS[c.list].map((o) =>{return '<button type="button" class="rad'+(v===o[0]?" on":"")+'" data-ch1="'+c.key+'" data-v="'+esc(o[0])+'"><b>'+esc(o[0])+'</b><span>'+esc(o[1])+'</span></button>'}).join("")+'</div>';},
 lin:function(c,v){return '<select class="dd" data-ch="'+c.key+'"><option value="">- Choose -</option>'+SPECIES[B.species].lin.opts.map((o) =>{return '<option'+(v===o?" selected":"")+'>'+esc(o)+'</option>'}).join("")+'</select>';},
 bgfp:function(c,v){return '<select class="dd" data-ch="'+c.key+'">'+c.opts.map((n) =>{return '<option'+((B.ch[c.key]||c.def)===n?" selected":"")+'>'+esc(n)+'</option>'}).join("")+'</select>';/* v67 */},
 ofeat:function(c,v){return '<select class="dd" data-ch="'+c.key+'"><option value="">- Choose an Origin Feat -</option>'+missOpt(v)+featOptsList(c).map((n) =>{return '<option'+(v===n?" selected":"")+'>'+n+'</option>'}).join("")+'</select>'+(v?featInfo(v):'');},
 sub:function(c,v){const subs=Object.keys(CL().subs);return '<select class="dd" data-subsel="1"><option value="">- Choose a '+subLbl(B.cls)+' -</option>'+subs.map((s) =>{return '<option value="'+esc(s)+'"'+(B.sub===s?" selected":"")+'>'+esc(sdn(s))+'</option>'}).join("")+'<option value="__custom"'+(B.sub==="__custom"?" selected":"")+'>Homebrew subclass</option></select>'+
  (B.sub==="__custom"?'<input class="btx" data-b="cSub" placeholder="Subclass name" value="'+esc(B.cSub)+'">':'')+(B.sub&&B.sub!=="__custom"?'<p class="fd">'+esc(CL().subs[B.sub].map((f) =>{return f[1]+" ("+ord(f[0])+")"}).join(", "))+'.</p>':'')},
 feat:function(c,v){const fv=v||{},F=fv.feat&&FEATS[fv.feat];
  var h=cbFeatSel(c,fv);
  if(F&&redundant(fv.feat))h+='<div class="caution">\u26a0 '+esc(fv.feat)+': '+esc(redundant(fv.feat))+'. You only get the ability score increase from it.</div>';
  if(F)h+=cbFeatInfo(c,fv,F);
  return h}
};
export function choiceBody(c){const v=B.ch[c.key];
 if(Object.prototype.hasOwnProperty.call(CB_TYPES,c.t))return CB_TYPES[c.t](c,v);
 return ""}
function redundant(n){const p=toSheet().profs,ar=p.armor,wp=p.weapons;
 if(n==="Lightly Armored"&&/Light/.test(ar)&&/Shield/.test(ar))return "you already have Light armor and Shield training";
 if(n==="Moderately Armored"&&/Medium/.test(ar))return "you already have Medium armor training";
 if(n==="Heavily Armored"&&/Heavy/.test(ar))return "you already have Heavy armor training";
 if(n==="Martial Weapon Training"&&/Martial(?! with)/.test(wp))return "you already have Martial weapon proficiency";
 return ""}
/* v19 RL46 (6): with a choice key, ability prerequisites use the scores at that level (scoreAt), not the final scores */
/* v69: species prerequisite of 2014 feats. A token matches the species name or its lineage as a whole word; "Small" matches a Small species */
function spMatch(L){const sp=SPECIES[B.species]||{},lab=(B.species||"")+" "+((B.ch&&B.ch.lin)||"");return L.some((t) =>{if(t==="Small")return sp.size==="Small"||(/Small/.test(sp.size||"")&&B.size==="Small");return new RegExp("(^|[^A-Za-z])"+t.replace(/-/g,"[- ]?")+"([^A-Za-z]|$)","i").test(lab)})}
let WRC={k:null,v:""};function weaponNow(){let k="";try{k=JSON.stringify(B)}catch(e){}if(!k||WRC.k!==k)WRC={k:k,v:toSheet().profs.weapons};return WRC.v}
/* preFail steps (SOLID s16): each adds the unmet parts of one kind of prerequisite to miss. F = the feat, p = its prerequisite text */
function pfNeeds(F,key,miss){
 if(F.needs){const hv=featChosen(key||null);const okn=F.needs==="*D"?hv.some((x) =>{return FEATS[x]&&FEATS[x].cat==="D"}):hv.indexOf(F.needs)>=0;if(!okn)miss.push(F.needs==="*D"?"a Dragonmark feat":F.needs+" feat")}/* v60 */
 if(F.preSp&&!spMatch(F.preSp))miss.push(F.preSp.indexOf("Small")>=0?"a Small species":F.preSp.slice(0,2).join(" or "));/* v69: species prerequisite of 2014 feats */}
function pfAbil(p,a,miss){
 const am=/((?:Str|Dex|Con|Int|Wis|Cha)(?:,? (?:or )?(?:Str|Dex|Con|Int|Wis|Cha))*) 13\+/.exec(p);
 if(am){const ks=am[1].match(/Str|Dex|Con|Int|Wis|Cha/g).map((x) =>{return x.toUpperCase()});if(!ks.some((k) =>{return a[k]>=13}))miss.push(ks.join(" or ")+" 13")}}
function pfCast(p,F,miss){
 if(/Spellcasting/.test(p)&&!casterParts().length&&!(F.preBg&&B.bg===F.preBg))miss.push("Spellcasting");
 if(/Martial weapon proficiency/.test(p)&&!(F.preBg&&B.bg===F.preBg)&&!/Martial/.test(weaponNow()))miss.push("Martial weapon proficiency");/* v69 *//* M9: any spellcasting class, also a multiclass */}
function pfArmor(p,prof,miss){
 if(/Light Armor training/.test(p)&&!/Light/.test(prof))miss.push("Light armor training");
 if(/Medium Armor training/.test(p)&&!/Medium/.test(prof))miss.push("Medium armor training");
 if(/Heavy Armor training/.test(p)&&!/Heavy/.test(prof))miss.push("Heavy armor training");
 if(/Shield training/.test(p)&&!/Shield/.test(prof))miss.push("Shield training");}
function preFail(n,lvl,key){const F=FEATS[n];if(!F||!F.pre)return "";const p=F.pre,a=key?scoreAt(lvl,key):abil().sc,miss=[];
 const m=/Level (\d+)\+/.exec(p);if(m&&lvl<+m[1])miss.push("level "+m[1]);
 pfNeeds(F,key,miss);
 pfAbil(p,a,miss);
 pfCast(p,F,miss);
 const prof=key?armorAt(lvl,key):toSheet().profs.armor;/* v19 V19-3 */
 pfArmor(p,prof,miss);
 return miss.join(", ")}
/* v19 V19-3: armor training at a choice level: armor from feats taken at that level or later is left out, unless the class, a multiclass, or a class option gives it too */
let ARC={k:null,v:""};/* v19 Checker round 2 idea: one toSheet() per state of B */
function armorNow(){let k="";try{k=JSON.stringify(B)}catch(e){}if(!k||ARC.k!==k)ARC={k:k,v:toSheet().profs.armor};return ARC.v}
/* armorAt step (SOLID s16): another source (class, multiclass, feature) gives the armor training a */
function aaOther(a,c){return (c.armor||"").indexOf(a)>=0||MCL().some((m) =>{return ((MC_GRANT[m.cls]||{}).armor||"").indexOf(a)>=0})||(a==="Heavy"&&optAny("Protector"))||(a==="Medium"&&(B.ch.p1opt==="Warden"||(B.sub==="College of Valor"&&B.level>=3)))||(a==="Shields"&&B.sub==="College of Valor"&&B.level>=3)}
function armorAt(lvl,key){let lv=choiceLvl(),late={},keep={},A=armorNow(),c=CL(),AF=allFeats(),me=AF.findIndex((f) =>{return f.key===key});
 AF.forEach((f,i) =>{const F=FEATS[f.n];if(!F||!F.armor)return;const l=lv[f.key]||1,lt=f.key===key||l>lvl||(l===lvl&&(me<0||i>me));F.armor.split(/,\s*/).forEach((a) =>{(lt?late:keep)[a]=1})});
 Object.keys(late).forEach((a) =>{if(keep[a])return;const other=aaOther(a,c);
  if(!other)A=A.split(/,\s*/).filter((x) =>{return x!==a}).join(", ")});return A}
function fsel(k,p,opts,v,dis){return '<select class="dd" data-fk="'+k+'" data-fp="'+p+'"><option value="">- Choose -</option>'+opts.map((o) =>{const w=dis&&v!==o?dis(o):"";return '<option value="'+o+'"'+(v===o?" selected":"")+(w?" disabled":"")+'>'+o+(w?" ("+w+")":"")+'</option>'}).join("")+'</select>'}
export function nC(c){return c.n||1}



export function __set_step(v){ return step=v; }
export function __set_openCards(v){ return openCards=v; }
export function __set_pickCls(v){ return pickCls=v; }
export function __set_pickSp(v){ return pickSp=v; }
