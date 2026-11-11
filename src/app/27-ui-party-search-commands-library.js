import {bindLive,cheatOpen,exhTo,futureOpen,goTab,lateGet,levelUp,rbOpen,rcptShow,recapOpen,redoNow,renderAll,statusCopy,statusText,tmOpen,toastU,undoLbl,undoMark,undoNow,wdOpen} from "./00a-reg-late-ports.js";import {HB_CONDS,STD_CONDS} from "./02-data-default-character.js";
import {GLOSS,exTxt} from "./03-data-glossary.js";
import {C,CKEY,DEF,FROZEN,KEY,S,__set_C,__set_S,clone,clsLv,save} from "./04-logic-storage.js";
import {$,$$,ask,atkOn,temporarySpellOn,clamp,esc,num,sg,toast} from "./05-logic-helpers.js";
import {D,derive} from "./06-logic-derivation.js";
import {featAll} from "./08b-ui-render-summaries-actions.js";
import {__set_navStack,openSheet,sheet,sheetMode,showEntry} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet,closeSheetIfOn} from "./13b-ui-detail-spell-targets-render.js";
import {BKEY,RKEY,rEnsure,rSave} from "./14-ui-editor.js";
import {cOf,zUnpack} from "./15c-logic-file-state-compress.js";import {learnGo,rSnap,tgGo} from "./15-logic-roster-backup-files-snapshots.js";
import {chCheck,jsonLoose} from "./16-logic-import-chat-text-and-build-files.js";
import {mq} from "./21-ui-tabs-pager.js";
import {ico,icoItem} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {invKey} from "./23b-ui-items-containers.js";import {openRest} from "./23d-ui-rest.js";import {ordL,scAdj} from "./23e-ui-spells-dc.js";
import {spClsJ} from "./24-ui-manage-spells.js";
import {cuNm} from "./26-ui-customize.js";

import {PALWORD,PANEL,SEARCHGRP} from "./06a-logic-ui-registry.js";
bindLive("bkpCamp",{get:function(){return bkpCamp;}});
bindLive("campKeep",{get:function(){return campKeep;}});
bindLive("campSel",{get:function(){return campSel;}});
bindLive("gsHTML",{get:function(){return gsHTML;}});
bindLive("gsMark",{get:function(){return gsMark;}});
bindLive("homeCamp",{get:function(){return homeCamp;},set:function(v){homeCamp=v;}});
bindLive("partyOpen",{get:function(){return partyOpen;}});
/* ================= v27: PARTY, CAMPAIGNS, SEARCH, SPELL CARDS, REPORT, FOUNDRY, PINNED SKILLS, OLD SHEET NOTICE ================= */
/* RU60, RU69: summary of a character from its saved sheet and play state. derive() runs on that data, then on the open character again */
function sumOf(Cc,Ss){ let c0=C,s0=S,out=null; if(!Cc||!Cc.abilities) return null;
  try{ __set_C(Cc); __set_S(Object.assign(clone(DEF),Ss||{})); ["cond","notes","used"].forEach((k) =>{ if(typeof S[k]!=="object"||!S[k]) S[k]={}; }); derive(); const sc=scAdj(C.spellcasting||{});
    out={n:C.name||"Character", cl:(C.species?String(C.species).split(" (")[0]+" ":"")+clsLv(), ac:D.ac, hp:S.hp==null?D.hpmax:clamp(num(S.hp,D.hpmax),0,D.hpmax), mx:D.hpmax, tmp:num(S.tmp,0), pp:D.pas_per, dc:sc&&sc.dc?sc.dc:null,
      cond:Object.keys(S.cond||{}).filter((k) =>{ return S.cond[k]; }), exh:num(S.exh,0), camp:String(typeof S.camp==="string"?S.camp:(C.office||"")).trim()}; }
  catch(e){ out=null; } __set_C(c0); __set_S(s0); try{ derive(); }catch(e){} return out; }
export function rC(id,r){ try{ return id===r.active?clone(C):JSON.parse((r.chars[id]||{}).C||"null"); }catch(e){ return null; } }
export function rS(id,r){ try{ return id===r.active?clone(S):JSON.parse((r.chars[id]||{}).S||"null"); }catch(e){ return null; } }
/* RU64: campaigns come from the Campaign field of each sheet (C.office) */
var homeCamp="";
function campOf(id,r){ const s=rS(id,r); if(s&&typeof s.camp==="string") return s.camp.trim(); const c=rC(id,r); return String(c&&c.office||"").trim(); }
/* v30 RU133: S.camp first */
function campList(r){ const o=[]; Object.keys(r.chars).forEach((id) =>{ if(r.chars[id].ph) return; const c=campOf(id,r); if(c&&o.indexOf(c)<0) o.push(c); }); return o.sort((a,b) =>{ return a.localeCompare(b); }); }
function campSel(r){ const L=campList(r); if(!L.length){ homeCamp=""; return ""; } if(homeCamp&&homeCamp!=="-"&&L.indexOf(homeCamp)<0) homeCamp="";
  return '<label class="hsort hcampf"><span>Campaign</span><select id="homeCamp"><option value="">All</option>'+L.map((c) =>{ return '<option value="'+esc(c)+'"'+(homeCamp===c?" selected":"")+'>'+esc(c)+'</option>'; }).join("")+'<option value="-"'+(homeCamp==="-"?" selected":"")+'>No campaign</option></select></label>'; }
function campKeep(id,r){ if(!homeCamp) return true; const c=campOf(id,r); return homeCamp==="-"?!c:c===homeCamp; }
/* the backup of one campaign: the roster holds only its characters, the open slots hold the first of them */
function bkpCamp(d){ if(!homeCamp) return d; let r=null; try{ r=JSON.parse(d[RKEY]); }catch(e){ r=null; } if(!r||!r.chars) return d;
  Object.keys(r.chars).forEach((id) =>{ if(!campKeep(id,r)) delete r.chars[id]; }); const ids=Object.keys(r.chars); if(!ids.length) return d;
  if(!r.chars[r.active]){ r.active=ids[0]; const e=r.chars[r.active]; d[CKEY]=e.C==null?null:e.C; d[KEY]=e.S==null?null:e.S; d[BKEY]=e.B==null?null:e.B; d[BKEY+"-bak"]=null; }
  d[RKEY]=JSON.stringify(r); return d; }
function partyRows(){ const r=rSnap(rEnsure()), out=[];
  Object.keys(r.chars).forEach((id) =>{ if(r.chars[id].ph||!campKeep(id,r)) return; const s=sumOf(rC(id,r),rS(id,r)); if(s){ s.id=id; out.push(s); } });
  (r.party||[]).forEach((p,i) =>{ let Cc=null,Ss=null; try{ Cc=JSON.parse(p.C); Ss=p.S?JSON.parse(p.S):{}; }catch(e){} const s=sumOf(Cc,Ss); if(s){ s.ext=i; s.t=p.t; out.push(s); } });
  return out; }
function partyCard(s){ const hpPct=s.mx?Math.round(100*s.hp/s.mx):0;
  return '<div class="pcard'+(s.ext!=null?' ext':'')+'"><div class="pc-h"><b>'+esc(s.n)+'</b><small>'+esc(s.cl)+(s.camp?' • '+esc(s.camp):'')+(s.ext!=null?' • from a file':'')+'</small></div>'+
    '<div class="pc-k"><span><small>AC</small><b>'+s.ac+'</b></span><span><small>HP</small><b>'+s.hp+'/'+s.mx+(s.tmp?' <i>+'+s.tmp+'</i>':'')+'</b></span><span><small>Passive Perc.</small><b>'+s.pp+'</b></span><span><small>Spell DC</small><b>'+(s.dc||"—")+'</b></span></div>'+
    '<div class="pc-bar"><i style="width:'+hpPct+'%"></i></div><p class="pc-c">'+(s.cond.length||s.exh?esc(s.cond.join(", ")+(s.exh?(s.cond.length?", ":"")+"Exhaustion "+s.exh:"")):'No conditions')+'</p>'+
    (s.ext!=null?'<div class="bkpr"><button type="button" class="btn press" data-pdel="'+s.ext+'">Remove from Party</button></div>':'')+'</div>'; }
function partyOpen(){ const old=document.getElementById("party"); if(old) old.remove(); const w=document.createElement("div"); w.id="party"; w.className="bkp"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","partyT");
  const draw=function(){ const L=partyRows();
    w.innerHTML='<div class="bkpb pwide"><div class="bkph"><b id="partyT">Party'+(homeCamp&&homeCamp!=="-"?': '+esc(homeCamp):'')+'</b><button type="button" class="bkpx" data-pty="close" aria-label="Close">×</button></div>'+
      '<p class="muted">Armor Class, Hit Points, Passive Perception, Spell DC, and conditions as last saved. '+(homeCamp?'Only the campaign picked on My Characters. ':'')+'A DM can add a player\'s character file: it is shown here only and does not change your characters.</p>'+
      (L.length?'<div class="pgrid">'+L.map(partyCard).join("")+'</div>':'<p class="hempty">No characters to show.</p>')+
      '<div class="bkpr"><label class="btn pri press bkpf">Add a Player\'s File<input type="file" id="partyFile" hidden></label></div></div>';
    const f=w.querySelector("#partyFile"); if(f) f.addEventListener("change",() =>{ const fl=f.files&&f.files[0]; if(!fl) return; const rd=new FileReader(); rd.onload=function(){ partyAdd(String(rd.result||""),draw); f.value=""; }; rd.onerror=function(){ toast("This file could not be read."); }; rd.readAsText(fl); }); };
  draw(); document.body.appendChild(w);
  const esc1=function(e){ if(e.key==="Escape"&&!document.querySelector(".ask")){ w.remove(); document.removeEventListener("keydown",esc1,true); } }; document.addEventListener("keydown",esc1,true);
  w.addEventListener("click",(e) =>{ if(e.target===w){ w.remove(); return; } const b=e.target.closest("[data-pty],[data-pdel]"); if(!b) return;
    if(b.dataset.pty==="close"){ w.remove(); return; }
    if(b.dataset.pdel!=null){ const r=rEnsure(), i=+b.dataset.pdel, nm=((r.party||[])[i]||{}).n||"this character"; ask("Remove "+nm+" from the party list? Your own characters do not change.","Remove",() =>{ r.party.splice(i,1); if(!r.party.length) delete r.party; rSave(r); draw(); }); } }); }
function partyAdd(txt,done){ zUnpack(txt).then((t) =>{ const o=jsonLoose(t); if(!o||o.kind!=="character"){ toast("Choose a character file (.bs) made with Save Character."); return; } const err=chCheck(o); if(err){ toast(err); return; }
  const r=rEnsure(), nm=o.name||cOf(o.C).name||"Character"; r.party=r.party||[]; const same=r.party.filter((p) =>{ return p.C===o.C; })[0]; if(same){ toast(nm+" is already in the party list."); return; }
  r.party.push({n:nm,C:o.C,S:o.S==null?null:o.S,t:Date.now()}); if(!rSave(r)) return; toast("Added "+nm+" to the party list."); done(); },(e) =>{ toast((e&&e.message)||"This file could not be unpacked."); }); }
/* RU66: search the sheet. Spells, items, attacks, features, and rules. Results open the same popups as the tabs */
export var gsQ="";
/* v30 p07 RU131: search that forgives typos. OSA distance (a swap of two letters counts as one) on each word, the start of each word, and the whole name */
export function fzD(a,b,max){ const la=a.length, lb=b.length; if(Math.abs(la-lb)>max) return max+1; let p2=null, p1=[], i, j; for(j=0;j<=lb;j++) p1[j]=j;
  for(i=1;i<=la;i++){ let cur=[i], low=i; for(j=1;j<=lb;j++){ let c=a.charCodeAt(i-1)===b.charCodeAt(j-1)?0:1, v=Math.min(p1[j]+1,cur[j-1]+1,p1[j-1]+c);
      if(p2&&i>1&&j>1&&a.charCodeAt(i-1)===b.charCodeAt(j-2)&&a.charCodeAt(i-2)===b.charCodeAt(j-1)) v=Math.min(v,p2[j-2]+1); cur[j]=v; if(v<low) low=v; }
    if(low>max) return max+1; p2=p1; p1=cur; } return p1[lb]; }
export function fzMax(q){ return q.length<4?0:q.length<8?1:2; }
/* 0 starts with q, 1 a word starts with q, 2 q inside, 3+ typo distance, -1 no match */
export function fzScore(q,s){ s=String(s||"").toLowerCase(); if(!s||!q) return -1; const i=s.indexOf(q); if(i>=0) return i===0?0:/[^a-z0-9]/.test(s.charAt(i-1))?1:2;
  const m=fzMax(q); if(!m) return -1; let w=s.split(/[^a-z0-9']+/).filter((x) =>{ return x.length>=3; }), n=q.split(" ").length, best=m+1, c=[s.replace(/[^a-z0-9' ]+/g," ").replace(/\s+/g," ").trim()];
  if(n>1){ for(let k=0;k+n<=w.length;k++) c.push(w.slice(k,k+n).join(" ")); } else c=c.concat(w);
  for(let j=0;j<c.length&&best>0;j++){ let x=c[j], d=fzD(q,x,m); if(x.length>q.length) d=Math.min(d,fzD(q,x.slice(0,q.length),m)); if(d<best) best=d; }
  return best<=m?3+best:-1; }
export var gsSel=0, PAL=[], gsShown=null;
/* Search result groups (SOLID stage 9, O): one entry per group in SEARCHGRP, in the order the groups show. gsHTML only asks each entry for its rows. */
SEARCHGRP.add("spells",{build:function(x){ const pick=x.pick, sc=x.sc; const sp=pick((C.spells||[]).map((x,i) =>{ return [x,i]; }).filter(p=>temporarySpellOn(p[0])),(p) =>{ return sc([p[0].n,cuNm("s:"+p[0].n,"")],[p[0].sum]); }); return sp.length?["Your Spells",sp.slice(0,30).map((p) =>{ return ['sp:'+p[1],cuNm("s:"+p[0].n,p[0].n),(p[0].l?ordL(p[0].l):"Cantrip")+" • "+(p[0].use||""),"school-"+String(p[0].sch||"").toLowerCase()]; })]:null; }});
SEARCHGRP.add("attacks",{build:function(x){ const pick=x.pick, sc=x.sc; const at=pick((C.attacks||[]).map((a,i) =>{ return [a,i]; }).filter((p) =>{ return atkOn(p[0]); }),(p) =>{ return sc([p[0].n,cuNm("a:"+p[0].n,"")]); }); return at.length?["Attacks",at.map((p) =>{ return ['w:'+p[1],cuNm("a:"+p[0].n,p[0].n),sg(D.atk[p[1]].hit)+" to hit, "+D.atk[p[1]].dmg,"act-attack"]; })]:null; }});
SEARCHGRP.add("inventory",{build:function(x){ const pick=x.pick, sc=x.sc; const iv=pick((C.inv||[]).map((x,i) =>{ return [x,i]; }),(p) =>{ return sc([p[0].n,cuNm("i:"+invKey(p[0]),"")]); }); return iv.length?["Inventory",iv.slice(0,30).map((p) =>{ return ['it:'+p[1],cuNm("i:"+invKey(p[0]),p[0].n),(p[0].type||"Item")+(num(p[0].q,1)>1?" ×"+num(p[0].q,1):""),typeof icoItem==="function"?icoItem(p[0]):"tab-inventory"]; })]:null; }});
SEARCHGRP.add("features",{build:function(x){ const pick=x.pick, sc=x.sc; const ft=pick(featAll(),(x) =>{ return sc([x.f.n],[x.t]); }); return ft.length?["Features and Traits",ft.slice(0,30).map((x) =>{ return ['f:'+x.gi+'.'+x.fi,x.f.n,x.g,"ui-feature"]; })]:null; }});
SEARCHGRP.add("rules",{build:function(x){ const pick=x.pick, sc=x.sc; const gl=pick(Object.keys(GLOSS).sort(),(k) =>{ return sc([k]); }); return gl.length?["Rules and Conditions",gl.slice(0,30).map((k) =>{ return ['g:'+k,k,GLOSS[k].c||"Rule",lateGet("ICO")["cond-"+k.toLowerCase()]?"cond-"+k.toLowerCase():"ui-book"]; })]:null; }});
SEARCHGRP.add("other-spells",{build:function(x){ const pick=x.pick, sc=x.sc; const mine=(C.spells||[]).filter(temporarySpellOn).map((x) =>{ return x.n; }), al=typeof SPELLS==="undefined"?[]:pick(SPELLS.filter((x) =>{ return mine.indexOf(x[0])<0; }),(x) =>{ return sc([x[0]]); }); return al.length?["Other Spells",al.slice(0,30).map((x) =>{ return ['spn:'+x[0],x[0],(x[1]?ordL(x[1]):"Cantrip")+" • "+spClsJ(x),"tab-spells"]; })]:null; }});
/* solid:orchestrator gsHTML */
function gsHTML(){ const q=gsQ.trim().toLowerCase().replace(/\s+/g," "), h='<input class="sp-q" id="gsQ" type="search" placeholder="Search, or type: dmg 7, heal 5" aria-label="Search the sheet or type a command" autocomplete="off" enterkeyhint="go" spellcheck="false" value="'+esc(gsQ)+'">';
  gsShown=gsQ; PAL=palCmds(q); gsSel=0; const cm=PAL.length?'<div class="gs-cl" aria-label="Commands">'+PAL.map(palRow).join("")+'</div>':'';
  if(q.length<2) return h+cm+(PAL.length?'':palHelp());
  const hit=function(s){ return String(s||"").toLowerCase().indexOf(q)>=0; }, G=[];
  /* best score of the names, 6 when only the longer text has it, -1 none. Rows keep their order inside one score */
  const sc=function(names,texts){ let b=-1; names.forEach((n) =>{ const v=fzScore(q,n); if(v>=0&&(b<0||v<b)) b=v; }); if(b<0&&(texts||[]).some(hit)) b=6; return b; };
  const pick=function(list,f){ const o=[]; list.forEach((x,i) =>{ const v=f(x); if(v>=0) o.push([v,i,x]); }); o.sort((a,b) =>{ return a[0]-b[0]||a[1]-b[1]; }); return o.map((r) =>{ return r[2]; }); };
  const ctx={q:q,sc:sc,pick:pick}; SEARCHGRP.list().forEach((g) =>{ const r=g.build(ctx); if(r) G.push(r); });
  const LK='<button type="button" class="btn sm press gs-lib" data-lib="'+esc(gsQ.trim())+'">Search the whole library for "'+esc(gsQ.trim())+'"</button>';
  if(!G.length) return h+cm+(PAL.length?'':'<p class="info-d">Nothing found for "'+esc(gsQ.trim())+'" in your sheet.</p>')+LK;
  return h+cm+G.map((g) =>{ return '<div class="info-h">'+esc(g[0])+' ('+g[1].length+')</div><div class="gs-l">'+g[1].map((r) =>{ return '<button type="button" class="gs-r" data-info="'+esc(r[0])+'"><b>'+(r[3]?(ico(r[3],"gs-ri")||ico("ui-book","gs-ri")):'')+esc(r[1])+'</b><small>'+esc(r[2])+'</small></button>'; }).join("")+'</div>'; }).join("")+LK; }
/* v30 p07 RU130: commands. Each gives an icon, a title, a preview of what changes, and run() */
function palNeed(k){ const o={dmg:["hp-damage","Damage","dmg "],heal:["hp-heal","Heal","heal "],temp:["hp-temp","Temporary Hit Points","temp "],exh:["cond-exhaustion","Exhaustion","exhaustion "]}[k];
  return {i:o[0],t:o[1],s:k==="exh"?"Now "+num(S.exh,0)+". Type a level from 0 to 6, for example exhaustion 2":"Type an amount, for example "+o[2]+(k==="heal"?"5":k==="temp"?"8":"7"),fill:o[2]}; }
function palHp(k,n){ closeSheetIfOn(); const inp=$("#hpAmt"); if(!inp) return; inp.value=String(n); const b=k==="heal"?$("#healBtn"):k==="dmg"?$("#dmgBtn"):$("[data-tmpset]"); if(b) b.click(); }
function palDmg(n){ if(!n) return palNeed("dmg"); const hp=num(S.hp,0), tp=num(S.tmp,0), ft=Math.min(tp,n), h2=Math.max(0,hp-(n-ft));
  return {i:"hp-damage",t:"Take "+n+" damage",s:"Hit Points "+hp+" to "+h2+(ft?", Temporary "+tp+" to "+(tp-ft):"")+(h2===0&&hp>0?". Death Saving Throws start":""),run:function(){ palHp("dmg",n); }}; }
function palHeal(n){ if(!n) return palNeed("heal"); const hp=num(S.hp,0), h2=Math.min(D.hpmax,hp+n);
  return {i:"hp-heal",t:"Heal "+n,s:"Hit Points "+hp+" to "+h2+(h2===D.hpmax?" (maximum)":""),run:function(){ palHp("heal",n); }}; }
function palTemp(n){ if(!n) return palNeed("temp"); const tp=num(S.tmp,0);
  return {i:"hp-temp",t:"Temporary Hit Points "+n,s:"Temporary "+tp+" to "+n+(tp>n?". They do not add up, the new number replaces the old":""),run:function(){ palHp("temp",n); }}; }
function palExh(n){ n=clamp(n,0,6); const e0=num(S.exh,0);
  return {i:"cond-exhaustion",t:"Exhaustion "+n,s:"Now "+e0+". "+(n===6?"Level 6: your character dies":n?exTxt(n):"No penalty"),run:function(){ closeSheetIfOn(); undoMark("Exhaustion"); exhTo(n,true); toastU(S.exh===6?"Exhaustion 6: your character dies.":"Exhaustion "+S.exh+"."); }}; }
export function condSet(k,on){ closeSheetIfOn(); undoMark((on?"Add ":"Remove ")+k); if(on) S.cond[k]=true; else delete S.cond[k]; save(); renderAll(); toastU(k+(on?" is on.":" is off.")); }
function palCond(k){ const on=!S.cond[k]; return {i:"cond-"+k.toLowerCase(),t:(on?"Turn on ":"Turn off ")+k,s:"Condition, now "+(on?"off":"on"),run:function(){ condSet(k,on); }}; }
function palVerb(h){ let V={dmg:["dmg","damage","dam","d","hit","hurt","-"],heal:["heal","h","hp","+","healing","cure"],temp:["temp","tmp","thp","temporary","temp hp","temporary hp","temporary hit points"],exh:["exh","exhaustion","exhausted","exhaust"]}, r="";
  Object.keys(V).forEach((k) =>{ if(!r&&V[k].indexOf(h)>=0) r=k; }); if(r||h.length<4) return r;
  Object.keys(V).forEach((k) =>{ if(!r&&V[k].some((w) =>{ return w.length>=4&&fzScore(h,w)>=0; })) r=k; }); return r; }
PALWORD.add("damage", {words:function(){ return [
  {k:["damage","dmg"],f:function(){ return palNeed("dmg"); }}]; }});
PALWORD.add("heal", {words:function(){ return [
  {k:["heal","healing"],f:function(){ return palNeed("heal"); }}]; }});
PALWORD.add("temp", {words:function(){ return [
  {k:["temp","temporary hit points","thp"],f:function(){ return palNeed("temp"); }}]; }});
PALWORD.add("short rest", {words:function(){ return [
  {k:["short rest","rest short"],f:function(){ return {i:"rest-short",t:"Short Rest",s:"Opens the Short Rest window. Nothing changes until you take the rest",run:function(){ openRest("short"); }}; }}]; }});
PALWORD.add("long rest", {words:function(){ return [
  {k:["long rest","rest long"],f:function(){ return {i:"rest-long",t:"Long Rest",s:"Opens the Long Rest window. Nothing changes until you take the rest",run:function(){ openRest("long"); }}; }}]; }});
PALWORD.add("rest", {words:function(){ return [
  {k:["rest"],f:function(){ return {i:"rest-short",t:"Rest",s:"Choose a Short Rest or a Long Rest",run:function(){ openRest("menu"); }}; }}]; }});
PALWORD.add("inspiration", {words:function(){ return [
  {k:["inspiration","heroic inspiration"],f:function(){ return {i:"ui-star",t:S.insp?"Spend Heroic Inspiration":"Gain Heroic Inspiration",s:"Heroic Inspiration, now "+(S.insp?"ready":"none"),run:function(){ closeSheetIfOn(); const b=$("#insp"); if(b) b.click(); toastU(S.insp?"Heroic Inspiration is ready.":"Heroic Inspiration spent."); }}; }}]; }});
PALWORD.add("level up", {words:function(){ return [
  {k:["level up","levelup"],f:function(){ return {i:"ui-levelup",t:"Level Up",s:D.level>=20?"Level 20 is the highest level":"Opens the builder at level "+(D.level+1),run:function(){ closeSheetIfOn(); levelUp(); }}; }}]; }});
PALWORD.add("conditions", {words:function(){ return [
  {k:["conditions","condition"],f:function(){ return {i:"cond-poisoned",t:"Conditions",s:"Open the Conditions list",run:function(){ showEntry({type:"cond"},false); }}; }}]; }});
PALWORD.add("exhaustion", {words:function(){ return [
  {k:["exhaustion"],f:function(){ return palNeed("exh"); }}]; }});
PALWORD.add("history", {words:function(){ return [
  {k:["history","time machine","go back","versions"],f:function(){ return {i:"ui-undo",t:"History",s:"Your character at earlier moments",run:function(){ tmOpen(); }}; }}]; }});
PALWORD.add("training ground", {words:function(){ return [
  {k:["training ground","train","practice fight","combat practice","monsters"],f:function(){ return {i:"ui-shield",t:"Training Ground",s:"Practice fights against monsters",run:function(){ closeSheetIfOn(); tgGo(); }}; }}]; }});
PALWORD.add("which die", {words:function(){ return [
  {k:["which die","what do i roll","dice"],f:function(){ return {i:"ui-dice",t:"Which die do I roll?",s:"The die and bonus for what you are doing",run:function(){ wdOpen(); }}; }}]; }});
PALWORD.add("cheat sheet", {words:function(){ return [
  {k:["cheat sheet","table","rules summary"],f:function(){ return {i:"ui-book",t:"Table cheat sheet",s:"Your turn, the actions and your numbers on one page",run:function(){ cheatOpen(); }}; }}]; }});
PALWORD.add("find a build", {words:function(){ return [
  {k:["find a build","reverse builder","optimize","goal"],f:function(){ return {i:"ui-search",t:"Find a build",s:"Set goals like Armor Class 18, get builds that reach them",run:function(){ rbOpen(); }}; }}]; }});
PALWORD.add("future", {words:function(){ return [
  {k:["future","future sheet","plan","level 20"],f:function(){ return {i:"ui-levelup",t:"Future sheet",s:"Hit Points, attacks and spells up to level 20",run:function(){ futureOpen(); }}; }}]; }});
PALWORD.add("recap", {words:function(){ return [
  {k:["recap","session recap","session","summary"],f:function(){ return {i:"ui-book",t:"Session recap",s:"Damage, healing, spells and rolls of the last session",run:function(){ recapOpen(); }}; }}]; }});
PALWORD.add("status", {words:function(){ return [
  {k:["status","copy status","chat status"],f:function(){ return {i:"ui-copy",t:"Copy status for chat",s:statusText().slice(0,80),run:function(){ closeSheetIfOn(); statusCopy(); }}; }}]; }});
PALWORD.add("what changed", {words:function(){ return [
  {k:["what changed","changes","update"],f:function(){ return {i:"ui-info",t:"What changed",s:"Numbers changed by the last update",run:function(){ rcptShow(); }}; }}]; }});
PALWORD.add("tour", {words:function(){ return [
  {k:["tour","help","guide"],f:function(){ return {i:"ui-info",t:"Tour the app",s:"A short tour on your own sheet",run:function(){ closeSheetIfOn(); learnGo({place:"apptour"}); }}; }}]; }});
PALWORD.add("learn", {words:function(){ return [
  {k:["learn","learn to play","rules","tutorial","belajar"],f:function(){ return {i:"ui-book",t:"Learn to play",s:"Hoot's Training Grounds: D&D by playing",run:function(){ closeSheetIfOn(); learnGo(); }}; }}]; }});
PALWORD.add("settings", {words:function(){ return [
  {k:["settings","options"],f:function(){ return {i:"ui-gear",t:"Settings",s:"Appearance, rules, and display",run:function(){ const b=$("#themeBtn"); if(b) b.click(); }}; }}]; }});
PALWORD.add("undo", {words:function(){ return [
  {k:["undo"],f:function(){ return {i:"ui-undo",t:"Undo",s:typeof lateGet("undoLbl")==="function"&&undoLbl()?"Undo "+undoLbl():"Take back the last change",run:function(){ closeSheetIfOn(); undoNow(); }}; }}]; }});
PALWORD.add("redo", {words:function(){ return [
  {k:["redo"],f:function(){ return {i:"ui-redo",t:"Redo",s:"Do again what Undo took back",run:function(){ closeSheetIfOn(); if(typeof lateGet("redoNow")==="function") redoNow(); }}; }}]; }});
PALWORD.add("tabs", {words:function(){ const W=[]; PANEL.keys().forEach((id,ix) =>{ const t=PANEL.get(id); W.push({k:t.words,f:function(){ return {i:t.icon,t:"Go to "+t.label,s:"Open the "+t.label+" page",run:function(){ closeSheetIfOn(); goTab(ix,t.tab||null); }}; }}); }); return W; }});
PALWORD.add("condition-toggles", {words:function(){ const W=[]; STD_CONDS.concat(HB_CONDS.map((c) =>{ return c.k; })).forEach((k) =>{ W.push({k:[k.toLowerCase()],f:function(){ return palCond(k); }}); }); return W; }});
/* solid:orchestrator palWords */
function palWords(){ const W=[]; PALWORD.list().forEach((p) =>{ p.words().forEach((w) =>{ W.push(w); }); }); return W; }
export function palCmds(q){ if(!q||FROZEN||!D||!D.hpmax) return []; const m=/^(.*?)\s*([+-]?\d{1,4})$/.exec(q);
  if(m){ const hd=m[1].trim(), n=Math.abs(parseInt(m[2],10)), sg0=/^[+-]/.test(m[2])?m[2].charAt(0):"";
    if(!hd) return [sg0==="+"?null:palDmg(n),sg0==="-"?null:palHeal(n)].filter((x) =>{ return x&&x.run; });
    const v=palVerb(hd); return v==="dmg"?[palDmg(n)]:v==="heal"?[palHeal(n)]:v==="temp"?[palTemp(n)]:v==="exh"?[palExh(n)]:[]; }
  if(q.length<2) return [];
 const {L}=palCmdsStep1(q); return L.slice(0,4).map((x) =>{ return x[2].f(); }); }
function palCmdsStep1(q){
const L=[];
  palWords().forEach((c) =>{ let b=-1; c.k.forEach((k) =>{ const v=k===q?0:k.indexOf(q)===0?1:k.indexOf(" "+q)>0&&q.length>=3?2:q.length>=4?fzScore(q,k):-1; if(v>=0&&(b<0||v<b)) b=v; }); if(b>=0) L.push([b,L.length,c]); });
  L.sort((a,b) =>{ return a[0]-b[0]||a[1]-b[1]; });
  return /** @type {any} */ ({L});
}
function palRow(c,i){ return '<button type="button" class="gs-c press" id="gsc'+i+'" data-cmd="'+i+'">'+(ico(c.i,"gs-ci")||ico("ui-chev-r","gs-ci"))+'<span class="gs-ct"><b>'+esc(c.t)+'</b><small>'+esc(c.s||"")+'</small></span><kbd class="gs-k" aria-hidden="true">'+(c.fill?"Tab":"Enter")+'</kbd></button>'; }
function palHelp(){ const ex=[["dmg 7","hp-damage"],["heal 5","hp-heal"],["temp 8","hp-temp"],["short rest","rest-short"],["poisoned","cond-poisoned"],["exhaustion 2","cond-exhaustion"],["spells","tab-spells"]], mac=/Mac|iPhone|iPad/.test(navigator.platform||"");
  return '<p class="info-d gs-hint">Search spells, items, features, and rules, or type a command.'+(mq.matches?'':' '+(mac?'Cmd+K':'Ctrl+K')+' or / opens this. Arrow keys choose, Enter runs.')+'</p><div class="gs-ex" aria-label="Examples">'+ex.map((x) =>{ return '<button type="button" class="chip gs-x press" data-gsfill="'+esc(x[0])+'">'+ico(x[1])+'<span>'+esc(x[0])+'</span></button>'; }).join("")+'</div>'; }
export function gsRows(){ return $$("#sheetBody .gs-c, #sheetBody .gs-r"); }
export function gsMark(scroll){ const L=gsRows(); if(gsSel>=L.length) gsSel=0; L.forEach((r,i) =>{ r.classList.toggle("sel",i===gsSel); }); if(scroll&&L[gsSel]) try{ L[gsSel].scrollIntoView({block:"nearest"}); }catch(er){} }
export function palFill(v){ const q=$("#gsQ"); if(!q) return; q.value=v; gsQ=v; clearTimeout(lateGet("gsT")); gsRefresh(); q.focus(); try{ q.setSelectionRange(v.length,v.length); }catch(er){} }
export function gsSync(){ const q=$("#gsQ"); if(q&&q.value!==gsShown){ clearTimeout(lateGet("gsT")); gsQ=q.value; gsRefresh(); } }
export function openSearch(){ __set_navStack([{type:"search"}]); openSheet("Search", gsHTML(), "search", true); gsMark(); setTimeout(() =>{ const q=$("#gsQ"); if(q){ q.focus(); try{ q.select(); }catch(er){} } },120); }
export function gsRefresh(){ if(sheetMode!=="search") return; const b=$("#sheetBody"), q=$("#gsQ"); if(!b) return; if(!q){ b.innerHTML=gsHTML(); return; }
  const t=document.createElement("div"); t.innerHTML=gsHTML(); const ni=t.querySelector("#gsQ"); if(ni) ni.remove();
  while(q.nextSibling) q.nextSibling.remove(); const f=document.createDocumentFragment(); while(t.firstChild) f.appendChild(t.firstChild); b.appendChild(f); gsMark(); }
export function __set_gsQ(v){ return gsQ=v; }
export function __set_gsSel(v){ return gsSel=v; }

