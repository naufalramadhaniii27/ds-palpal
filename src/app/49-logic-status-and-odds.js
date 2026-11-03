import {STD_CONDS} from "./02-data-default-character.js";
import {GLOSS} from "./03-data-glossary.js";
import {C,S,__set_C,save} from "./04-logic-storage.js";
import {ask,clamp,esc,num,sg,toast} from "./05-logic-helpers.js";
import {B,D,__set_B,__set_D,derive} from "./06-logic-derivation.js";
import {renderConds} from "./10-ui-conditions.js";
import {__set_navStack,navStack,openSheet} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {zPack} from "./15-logic-roster-backup-files-snapshots.js";
import {impText} from "./16-logic-import-chat-text-and-build-files.js";
import {PAGES,goPage,mq,setTab} from "./21-ui-tabs-pager.js";
import {concOf} from "./32-logic-play-undo-actions.js";
import {levelUp} from "./34-ui-situations.js";
import {lintList} from "./40-ui-segments-notes-swipe-motion-panels.js";
import {CU0,__set_CU0} from "./41-ui-edit-mode.js";
import {QRG} from "./42-logic-pwa-qr-icons-wallet.js";
import {__R} from "./00-reg.js";
import { html, render as drawHtml, raw as rawHtml } from "./lib/html.js";
Object.defineProperty(__R,"askHTML",{get:function(){return askHTML;},set:function(v){askHTML=v;},configurable:true});
Object.defineProperty(__R,"dnaRead",{get:function(){return dnaRead;},set:function(v){dnaRead=v;},configurable:true});
Object.defineProperty(__R,"futureOpen",{get:function(){return futureOpen;},set:function(v){futureOpen=v;},configurable:true});
Object.defineProperty(__R,"recapOpen",{get:function(){return recapOpen;},set:function(v){recapOpen=v;},configurable:true});
Object.defineProperty(__R,"statusCopy",{get:function(){return statusCopy;},set:function(v){statusCopy=v;},configurable:true});
Object.defineProperty(__R,"statusLine",{get:function(){return statusLine;},set:function(v){statusLine=v;},configurable:true});
Object.defineProperty(__R,"statusText",{get:function(){return statusText;},set:function(v){statusText=v;},configurable:true});
/* T11 G4 N17 status for a group chat: one short line to paste in WhatsApp or Discord.
   "Yudhi Kelapa (Fighter 4) | HP 32/44 +5 temp | AC 18 | Concentrating: Bless | Poisoned, Exhaustion 1"
   Pasting the line back in Import says what it is, it is not taken for a character (16 impText). */
function statusText(){ if(!C||!D) return ""; const hp=clamp(num(S.hp,0),0,D.hpmax), tp=Math.max(0,num(S.tmp,0)), out=[];
  out.push((C.name||"Character")+(C.clsLabel||C.cls?" ("+(C.clsLabel||(C.cls+" "+(C.level||1)))+")":""));
  out.push("HP "+hp+"/"+D.hpmax+(tp?" +"+tp+" temp":"")); out.push("AC "+D.ac);
  const co=typeof concOf==="function"?concOf():null; if(co) out.push("Concentrating: "+co.n);
  const cs=[]; STD_CONDS.forEach((k) =>{ if(S.cond&&S.cond[k]) cs.push(k); }); if(S.exh) cs.push("Exhaustion "+S.exh); if(cs.length) out.push(cs.join(", "));
  if(hp===0){ const d=S.ds||[0,0]; out.push("Death saves "+d[0]+" success, "+d[1]+" failure"); }
  if(S.insp) out.push("Heroic Inspiration");
  return out.join(" | "); }
function statusCopy(){ const t=statusText(); if(!t) return; const done=function(){ toast("Status copied: "+t); };
  try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(t).then(done,() =>{ statusShow(t); }); return; } }catch(e){} statusShow(t); }
function statusShow(t){ __set_navStack([]); openSheet("Status for chat",'<p class="bk-f">Copy this line and paste it in your group chat.</p><textarea class="st-txt" readonly rows="3">'+esc(t)+'</textarea>',"status"); const a=document.querySelector("#sheetBody .st-txt"); if(a){ a.focus(); a.select(); } }
function statusLine(t){ return /^[^|\n]{1,120}\| HP \d+\/\d+/.test(String(t||"").trim()); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-status]"); if(!b) return; statusCopy(); });
/* T11 G4 N9 rules check while playing. The builder checks a character while it is made (ruleIssues), this looks at the sheet in play.
   Each finding has a plain reason and, where one exists, a fix button. Shown as one small chip in the Conditions row when something is found.
   Rules: PHB 2024 Equipment (heavy armor Strength), Rules Glossary (Unconscious at 0 Hit Points, Exhaustion 6), magic items (attunement limit). */


function lintOpen(){ const l=lintList(); __set_navStack([]); openSheet("Rules check",l.length?l.map((q) =>{ return html`<div class="lint-r"><b>${q.t}</b><p>${q.x}</p>${q.fix ? html`<button type="button" class="btn press" data-lfix="${q.fix}">${q.fl}</button>` : ''}</div>`; }).join(""):'<p class="bk-f">Nothing to look at. The sheet follows the rules it can check.</p>',"lint"); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-lint],[data-lfix]"); if(!b) return;
  if(b.hasAttribute("data-lint")){ lintOpen(); return; }
  const f=b.getAttribute("data-lfix"); closeSheet();
  if(f==="unc"){ S.cond.Unconscious=true; save(); renderConds(); toast("Unconscious added."); }
  else if(f==="exh"){ S.exh=5; save(); renderConds(); toast("Exhaustion is 5 now."); }
  else if(f==="inv"){ const k=PAGES.indexOf("p-inv"); if(mq.matches&&k>=0) goPage(k,true); else setTab("p-inv",true,true); } });
/* T11 G4 N4 session recap, without AI and offline. Made from the journal of the character (mi-jr-<name>, fx 18): the last session is the run of
   entries with no gap longer than 4 hours. Totals: damage taken, healing, spells cast, rolls with natural 20s and 1s, conditions, rests, levels,
   coins, Concentration saves. The card can be kept as a picture (canvas, PNG), shared where the device can share files */
function recapData(){ const J=window.__miJournal; if(!J) return null; const all=J.all(); if(!all.length) return null;
  const ses=[all[0]]; for(let i=1;i<all.length;i++){ if(ses[ses.length-1].t-all[i].t>4*3600e3) break; ses.push(all[i]); }
  const o={from:ses[ses.length-1].t,to:ses[0].t,n:ses.length,dmg:0,heal:0,cast:{},rolls:0,n20:0,n1:0,cond:[],rest:[],level:0,coin:0,cs:0,cb:0,fights:0};
  ses.forEach((e) =>{ let x=String(e.x||""), m;
    if((e.k==="dmg"||e.k==="hurt")&&(m=/Took (\d+)/.exec(x))) o.dmg+=+m[1]; else if(e.k==="heal"&&(m=/(\d+)/.exec(x))) o.heal+=+m[1];
    else if(e.k==="cast"){ const s=x.replace(/^Cast /,""); o.cast[s]=(o.cast[s]||0)+1; }
    else if(e.k==="roll"){ o.rolls++; if(/natural 20/.test(x)) o.n20++; if(/natural 1\)/.test(x)) o.n1++; }
    else if(e.k==="cond"&&/^Became /.test(x)){ const c=x.slice(7); if(o.cond.indexOf(c)<0) o.cond.push(c); }
    else if(e.k==="rest") o.rest.push(x); else if(e.k==="level") o.level++; else if(e.k==="combat") o.fights++;
    else if(e.k==="coin"&&(m=/([+-]?\d+(\.\d+)?)/.exec(x))) o.coin+=+m[1];
    else if(e.k==="conc"){ if(/held/.test(x)) o.cs++; else o.cb++; } });
  o.coin=Math.round(o.coin*100)/100; return o; }
function recapRows(o){ const r=[], sp=Object.keys(o.cast);
  if(o.fights) r.push(["Fights",String(o.fights)]); if(o.dmg) r.push(["Damage taken",String(o.dmg)]); if(o.heal) r.push(["Healing",String(o.heal)]);
  if(sp.length) r.push(["Spells cast",sp.map((k) =>{ return k+(o.cast[k]>1?" x"+o.cast[k]:""); }).join(", ")]);
  if(o.rolls) r.push(["Rolls",o.rolls+(o.n20?", natural 20: "+o.n20:"")+(o.n1?", natural 1: "+o.n1:"")]);
  if(o.cs||o.cb) r.push(["Concentration saves",o.cs+" held, "+o.cb+" broken"]); if(o.cond.length) r.push(["Conditions",o.cond.join(", ")]);
  if(o.rest.length) r.push(["Rests",o.rest.join(", ")]); if(o.level) r.push(["Level ups",String(o.level)]); if(o.coin) r.push(["Coins",(o.coin>0?"+":"")+o.coin+" gp"]);
  return r; }
function recapWhen(o){ try{ const f={weekday:"short",day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}; return new Date(o.from).toLocaleString(undefined,f)+" to "+new Date(o.to).toLocaleTimeString(undefined,{hour:"2-digit",minute:"2-digit"}); }catch(e){ return ""; } }
function recapOpen(){ const o=recapData(); __set_navStack([]);
  if(!o){ openSheet("Session recap",'<p class="bk-f">Nothing written yet. Rolls, damage, healing, spells and rests are written in the journal as you play, and the recap is made from them.</p>',"recap"); return; }
  const rows=recapRows(o);
  openSheet("Session recap",'<div class="rcp"><p class="rcp-w">'+esc((C&&C.name)||"Character")+'. '+esc(recapWhen(o))+'</p>'+(rows.length?'<dl>'+rows.map((x) =>{ return html`<dt>${x[0]}</dt><dd>${x[1]}</dd>`; }).join("")+'</dl>':'<p class="bk-f">This session has '+o.n+' journal lines and nothing to add up yet.</p>')+'</div><p><button type="button" class="btn press" data-recapimg="1">Save as picture</button></p>',"recap"); }
/* the card as a PNG: plain canvas text, the theme colours of the sheet */
function recapPic(){ const o=recapData(); if(!o) return; const rows=recapRows(o), W=1080, pad=72, lh=46, cv=document.createElement("canvas"), x=cv.getContext("2d"); if(!x) return;
  const lines=[]; x.font="40px system-ui, sans-serif"; rows.forEach((r) =>{ let words=r[1].split(" "), cur=""; const out=[]; words.forEach((w) =>{ const t=cur?cur+" "+w:w; if(x.measureText(t).width>W-2*pad-40&&cur){ out.push(cur); cur=w; } else cur=t; }); if(cur) out.push(cur); lines.push([r[0],out]); });
  const H=pad*2+160+lines.reduce((a,l) =>{ return a+40+l[1].length*lh+24; },0); cv.width=W; cv.height=Math.max(H,600);
  const cs=getComputedStyle(document.body), bg=cs.backgroundColor||"#1b1d22", fg=cs.color||"#f2efe8"; x.fillStyle=bg; x.fillRect(0,0,W,cv.height); x.fillStyle=fg;
  x.font="bold 60px Georgia, serif"; x.fillText((C&&C.name)||"Character",pad,pad+50); x.globalAlpha=.75; x.font="34px system-ui, sans-serif"; x.fillText("Session recap. "+recapWhen(o),pad,pad+110); x.globalAlpha=1;
  let y=pad+190; lines.forEach((l) =>{ x.globalAlpha=.7; x.font="600 30px system-ui, sans-serif"; x.fillText(l[0].toUpperCase(),pad,y); x.globalAlpha=1; y+=46; x.font="40px system-ui, sans-serif"; l[1].forEach((t) =>{ x.fillText(t,pad,y); y+=lh; }); y+=24; });
  const name=((C&&C.name)||"character").replace(/[^\w-]+/g,"-")+"-session.png";
  cv.toBlob((b) =>{ if(!b) return; try{ const f=new File([b],name,{type:"image/png"}); if(navigator.canShare&&navigator.canShare({files:[f]})){ navigator.share({files:[f],title:"Session recap"}).catch(() =>{}); return; } }catch(e){}
    const u=URL.createObjectURL(b), a=document.createElement("a"); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); toast("Picture saved: "+name); },"image/png"); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-recapimg],[data-recap]"); if(!b) return; if(b.hasAttribute("data-recap")) recapOpen(); else recapPic(); });
window.__recapOpen=recapOpen; window.__recapData=recapData;
/* T11 G4 N15 ask the rules, without AI and offline. A hand-written table of intents maps the words of a question to Library rule entries.
   The answer is a short line written for this app and the rule entries to read in full. It never makes up an answer:
   a question that matches no intent gets the normal Library search only. Rules: PHB 2024 Playing the Game and Rules Glossary */
const ASK=[
 [/\bhid(e|ing)\b|\bstealth\b|\bsneak/,"Take the Hide action: make a Dexterity (Stealth) check, DC 15, while out of sight or behind cover. On a success you have the Invisible condition until you make noise, attack, or are found.",["Hide","Invisible","Stealth"]],
 [/attack (twice|two times|more than once)|extra attack|two attacks|attack again/,"One Attack action is one attack. Extra Attack from your class lets you attack more times with the same action. A Light weapon also gives one more attack as a Bonus Action.",["Attack","Light","Bonus Action"]],
 [/\bgrap+l/,"Grapple is an Unarmed Strike option. The target makes a Strength or Dexterity save against 8 + your Strength modifier + Proficiency Bonus. On a failure it has the Grappled condition.",["Grapple","Grappled","Unarmed Strike"]],
 [/\bshove|push (someone|a creature|an enemy)|knock .*prone/,"Shove is an Unarmed Strike option: on a failed save the target is pushed 5 feet or falls Prone.",["Shove","Prone","Unarmed Strike"]],
 [/\b(0|zero) (hp|hit points)|\bdying\b|death sav/,"At 0 Hit Points you fall Unconscious and make a Death Saving Throw at the start of each turn: 10 or higher is a success. Three successes make you stable, three failures end your character. A 20 brings you back with 1 Hit Point.",["Death Saving Throw","Unconscious","Hit Points"]],
 [/\bcrit|critical|natural 20|nat 20/,"A 20 on the d20 of an attack is a Critical Hit: roll the damage dice twice and add the modifier once.",["Attack","Advantage"]],
 [/advantage|disadvantage|roll two d20/,"With Advantage roll two d20 and keep the higher. With Disadvantage keep the lower. Having both cancels them out, however many sources you have.",["Advantage","Disadvantage"]],
 [/opportunity attack|leave (their|its|his|her) reach|run away|move away from/,"When a foe you can see leaves your reach, you can use your Reaction for one melee attack against it. The Disengage action stops this for the rest of the turn.",["Opportunity Attack","Disengage","Reaction"]],
 [/\breact(ion)?\b/,"You get one Reaction per round, back at the start of your turn. Opportunity Attacks and spells like Shield use it.",["Reaction","Opportunity Attack"]],
 [/bonus action/,"You only get a Bonus Action when a feature, spell or weapon gives you one, and only one per turn.",["Bonus Action"]],
 [/short rest/,"A Short Rest is 1 hour. You can spend Hit Point Dice to heal, and some features come back.",["Short Rest","Hit Point Dice"]],
 [/long rest|sleep/,"A Long Rest is 8 hours. You regain all Hit Points, all spent Hit Point Dice, and most features. Exhaustion goes down by 1.",["Long Rest","Exhaustion"]],
 [/\bheal|hit point dice|hit dice/,"Outside magic, you heal by spending Hit Point Dice during a Short Rest, or fully on a Long Rest. A Healer's Kit can stabilize a dying creature.",["Hit Point Dice","Short Rest","Long Rest"]],
 [/temporary hit points|temp hp/,"Temporary Hit Points are lost first and do not add up: when you get new ones, keep the higher number.",["Temporary Hit Points"]],
 [/concentrat/,"Some spells need Concentration. You can hold one at a time. Taking damage makes you roll a Constitution save, DC 10 or half the damage, whichever is higher. Being Incapacitated ends it.",["Saving Throw","Incapacitated","Constitution"]],
 [/initiative|who goes first|turn order/,"At the start of a fight everyone rolls Initiative, a Dexterity check. The highest goes first.",["Initiative","Dexterity"]],
 [/\bdash\b|move (twice|double|faster)|run\b/,"The Dash action gives you extra movement equal to your Speed for this turn.",["Dash","Speed"]],
 [/\bdodge\b/,"The Dodge action makes attacks against you roll with Disadvantage and gives you Advantage on Dexterity saves until your next turn.",["Dodge","Disadvantage"]],
 [/\bhelp\b/,"The Help action gives a friend Advantage on one check, or on an attack against a foe within 5 feet of you.",["Help","Advantage"]],
 [/\bready\b|wait for/,"The Ready action sets a trigger and an action. When the trigger happens you act with your Reaction.",["Ready","Reaction"]],
 [/difficult terrain|rough ground/,"Each foot of movement in Difficult Terrain costs 1 extra foot.",["Speed"]],
 [/\bprone\b|stand up|get up/,"Standing up from Prone costs half your Speed. While Prone, melee attacks within 5 feet have Advantage against you.",["Prone","Speed"]],
 [/two weapons|dual wield|off.hand/,"After attacking with a Light weapon, you can attack with another Light weapon as a Bonus Action. You do not add your ability modifier to that damage unless it is negative.",["Light","Bonus Action","Nick"]],
 [/armor class|\bac\b/,"Armor Class is the number an attack roll must reach to hit you. Armor, a Shield and some features raise it.",["Armor Class"]],
 [/saving throw|\bsave\b/,"A saving throw is a d20 plus the ability modifier, plus your Proficiency Bonus if you are proficient in that save, against a DC set by the effect.",["Saving Throw","Proficiency Bonus"]],
 [/carry|how much weight|encumb/,"You can carry 15 times your Strength score in pounds. Size changes it.",["Carrying Capacity","Strength"]],
 [/inspiration/,"Heroic Inspiration lets you reroll one die right after you roll it. You can only have one at a time.",["Heroic Inspiration"]],
 [/exhaust/,"Each Exhaustion level takes 2 from every d20 Test and 5 feet from your Speed. A Long Rest removes one level. Level 6 is death.",["Exhaustion","Long Rest"]],
 [/darkvision|see in the dark/,"Darkvision lets you see in dim light as if bright, and in darkness as if dim, within its range. You do not see colours in darkness.",["Darkvision"]],
 [/invisible|can.t see (me|them|it)/,"An Invisible creature has Advantage on its attacks, and attacks against it have Disadvantage, unless the other side can see it some other way.",["Invisible","Advantage"]],
 [/frighten|scared|fear/,"Frightened: Disadvantage on checks and attacks while the source is in sight, and you cannot willingly move closer to it.",["Frightened"]],
 [/poison/,"Poisoned: Disadvantage on attack rolls and ability checks.",["Poisoned"]]];
function askLike(q){ return /\?$/.test(q)||/^(how|can|what|when|why|do|does|is|are|should|who|which|where|if) /.test(q); }
function askAnswer(q){ q=String(q||"").trim().toLowerCase(); if(q.length<6||!askLike(q)) return null; for(let i=0;i<ASK.length;i++) if(ASK[i][0].test(q)) return {a:ASK[i][1],r:ASK[i][2].filter((k) =>{ return GLOSS[k]; })}; return null; }
function askHTML(q){ const o=askAnswer(q); if(!o) return ""; return '<div class="qa"><b class="qa-h">Short answer</b><p>'+esc(o.a)+'</p>'+(o.r.length?'<div class="qa-r">'+o.r.map((k) =>{ return html`<button type="button" class="lib-chip" data-lib-open="rule|${k}">${k}</button>`; }).join("")+'</div>':'')+'</div>'; }
/* T11 G4 N11 Build DNA: the builder choices only (B), gzip (CompressionStream, T8) and base64url, in a link "#build=...".
   Opening the link asks first, then builds the character with the builder like an imported build (16 impBuild). Nothing is sent anywhere:
   the code lives in the part of the address after #, which browsers do not send to the server */
function dnaLink(){ let b=window.__bldForSheet?window.__bldForSheet():null; if(!b||!b.cls) return Promise.reject(new Error("Pick a class first."));
  b=structuredClone(b); delete b.cid; delete b._app;
  return zPack(JSON.stringify({kind:"build",B:b})).then((z) =>{ const code=z.slice(8).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); return location.origin+location.pathname+"#build="+code; }); }
function dnaRead(code){ let b=String(code||"").replace(/-/g,"+").replace(/_/g,"/"); while(b.length%4) b+="="; return "DND24Z1:"+b; }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-dna]"); if(!b) return; e.preventDefault(); const how=b.getAttribute("data-dna");
  dnaLink().then((u) =>{ const bt=(window.__bldToast&&!document.getElementById("bld").hidden)?window.__bldToast:toast;
    if(how==="share"&&navigator.share){ navigator.share({title:"D&D build",url:u}).catch(() =>{}); return; }
    if(how==="qr"){ let box=b.parentNode&&b.parentNode.parentNode&&b.parentNode.parentNode.querySelector(".dna-qr"); if(!box){ box=document.createElement("div"); box.className="dna-qr"; b.parentNode.insertAdjacentElement("afterend",box); }
      let q=null; try{ q=QRG.make(u,"L",40); }catch(er){ q=null; } drawHtml(q ? html`${rawHtml(QRG.svg(q,"Build link code"))}<p class="fd bhint">Scan it with Open Character, Scan a code, on the other phone.</p>` : html`<p class="fd bhint">The link is too long for one code. Use Copy or Share.</p>`, box); return; }
    const done=function(){ bt("Build link copied ("+u.length+" characters)."); };
    try{ if(navigator.clipboard&&navigator.clipboard.writeText){ navigator.clipboard.writeText(u).then(done,() =>{ bt("Copy did not work here. Use Share instead."); }); return; } }catch(er){} bt("Copy is not available here."); },
    (er) =>{ (window.__bldToast||toast)(er.message||"The link could not be made."); }); });
/* a shared link opened: wait for the builder data, ask, then import */
function dnaCheck(){ const m=/^#build=([A-Za-z0-9_-]{20,})$/.exec(location.hash||""); if(!m) return; const code=m[1];
  try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){}
  let tries=0; (function wait(){ if(window.__bldNeed) try{ window.__bldNeed(); }catch(e){} if(!window.__bldSheetFor||!window.__bldNorm){ if(++tries<80) setTimeout(wait,250); else toast("The builder did not load, so the shared build cannot be opened."); return; }
    ask("Open the build someone shared with you? It is added as a new character. Your other characters stay as they are.","Open Build",() =>{ impText(dnaRead(code)); }); })(); }
dnaCheck(); addEventListener("hashchange",dnaCheck);/* a link pasted into a tab where the app is already open */
/* T11 G4 N5 future sheet: the character from its level now up to 20, from the same builder and the same derivation as the sheet.
   Only the choices already made count: new choices at later levels (Ability Score Improvements, feats, spells, subclass) are not guessed.
   Hit Points use the fixed value per level. Lines for Hit Points, Armor Class, best attack bonus and spell save DC, and the highest spell slot */
function futureData(){ if(!window.__bldSheetFor) return null; const b=window.__bldForSheet?window.__bldForSheet():null; if(!b||!b.cls) return null;
  const tot=D.level, main=+b.level||1, out=[], keepC=C, keepD=D, keepB=B, keepCU=typeof CU0!=="undefined"?CU0:null;
  try{ for(let L=tot;L<=20;L++){ const nb=structuredClone(b); nb.level=Math.max(1,main+(L-tot)); let c2=null; try{ c2=window.__bldSheetFor(nb); }catch(e){ c2=null; } if(!c2) continue;
      __set_C(c2); derive(); var best=-99; (D.atk||[]).forEach((a) =>{ if(a&&isFinite(a.hit)) best=Math.max(best,a.hit); });
      var sl=((c2.spellcasting||{}).slots||[]), top=0; sl.forEach((n,i) =>{ if(+n>0) top=i+1; });
      out.push({l:L,hp:D.hpmax,ac:D.ac,atk:best>-99?best:null,dc:c2.spellcasting?D.dc:null,slot:top,pb:D.pb}); } }
  finally{ __set_C(keepC); __set_D(keepD); __set_B(keepB); if(keepCU) __set_CU0(keepCU); }
  return out; }
function futureSVG(rows,key,label){ const pts=rows.filter((r) =>{ return r[key]!=null; }); if(pts.length<2) return "";
  let W=320, H=120, px=28, py=14, lo=Math.min.apply(null,pts.map((r) =>{ return r[key]; })), hi=Math.max.apply(null,pts.map((r) =>{ return r[key]; })); if(hi===lo) hi=lo+1;
  const x=function(l){ return px+(l-pts[0].l)/(pts[pts.length-1].l-pts[0].l||1)*(W-2*px); }, y=function(v){ return H-py-(v-lo)/(hi-lo)*(H-2*py); };
  const d=pts.map((r,i) =>{ return (i?"L":"M")+x(r.l).toFixed(1)+" "+y(r[key]).toFixed(1); }).join("");
  return '<figure class="fut-g"><figcaption><b>'+esc(label)+'</b><span>'+pts[0][key]+' now, '+pts[pts.length-1][key]+' at level '+pts[pts.length-1].l+'</span></figcaption><svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(label)+' from level '+pts[0].l+' to '+pts[pts.length-1].l+'"><path d="'+d+'" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>'+
    pts.filter((r,i) =>{ return i===0||i===pts.length-1||r.l%4===0; }).map((r) =>{ return html`<circle cx="${x(r.l).toFixed(1)}" cy="${y(r[key]).toFixed(1)}" r="3.5" fill="currentColor"/><text x="${x(r.l).toFixed(1)}" y="${H-1}" text-anchor="middle">${rawHtml(r.l)}</text>`; }).join("")+'</svg></figure>'; }
function futureOpen(){ __set_navStack([]); const go=function(){ const rows=futureData();
    if(!rows||rows.length<2){ openSheet("Future sheet",'<p class="bk-f">'+(D.level>=20?"Level 20 is the highest level.":"Open the builder once so the future sheet can use your choices.")+'</p>',"future"); return; }
    const t='<table class="fut-t"><thead><tr><th scope="col">Level</th><th scope="col">HP</th><th scope="col">AC</th><th scope="col">Attack</th>'+(rows[0].dc!=null?'<th scope="col">Spell DC</th><th scope="col">Top slot</th>':'')+'</tr></thead><tbody>'+rows.map((r) =>{ return '<tr'+(r.l===D.level?' class="now"':'')+'><th scope="row">'+r.l+'</th><td>'+r.hp+'</td><td>'+r.ac+'</td><td>'+(r.atk!=null?sg(r.atk):"")+'</td>'+(rows[0].dc!=null?'<td>'+(r.dc!=null?r.dc:"")+'</td><td>'+(r.slot||"")+'</td>':'')+'</tr>'; }).join("")+'</tbody></table>';
    openSheet("Future sheet",'<p class="bk-f">Your character from level '+D.level+' to 20 with the choices made so far. Choices at new levels (ability scores, feats, spells) are not guessed, so the real numbers can be higher.</p><div class="fut">'+futureSVG(rows,"hp","Hit Points")+futureSVG(rows,"atk","Best attack bonus")+(rows[0].dc!=null?futureSVG(rows,"dc","Spell save DC"):"")+'</div><div class="fut-tw">'+t+'</div><p class="bk-btns"><button type="button" class="btn press" data-futlv="1">Plan the next level</button><button type="button" class="btn press" data-rbopen="1">Find a build for a goal</button></p>',"future"); };
  if(window.__bldSheetFor) go(); else { if(window.__bldNeed) try{ window.__bldNeed(); }catch(e){} let n=0; (function w(){ if(window.__bldSheetFor) go(); else if(++n<60) setTimeout(w,200); else toast("The builder did not load."); })(); } }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-futlv],[data-future]"); if(!b) return; if(b.hasAttribute("data-future")){ futureOpen(); return; } closeSheet(); if(typeof levelUp==="function") levelUp(); });
/* T11 G4 D2 roll from more places: a death save and Hit Point Dice roll with the same dice as the rest of the sheet (3D when Motion allows),
   and the result goes through the same buttons and boxes as a number typed by hand, so the rules code stays one path */
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-dsroll],[data-hdroll]"); if(!b||!window.__miRoll||!window.__miRoll.roll) return; e.preventDefault(); if(b.__busy) return; b.__busy=1;
  if(b.hasAttribute("data-dsroll")){ const L=(D.cf&&D.cf.ds)||[], a=L.some((x) =>{ return x.t==="ADV"; }), d=L.some((x) =>{ return x.t==="DIS"; }), mode=a&&!d?"adv":d&&!a?"dis":"";
    window.__miRoll.roll({bon:0},mode,"Death Saving Throw",(r) =>{ b.__busy=0; const n=r.nat, k=n===20?"20":n===1?"1":n>=10?"s":"f"; setTimeout(() =>{ const t=document.querySelector('#dsGuide [data-dsr="'+k+'"]'); if(t) t.click(); },r.three?900:300); }); return; }
  const k=b.getAttribute("data-hdroll"), i=b.getAttribute("data-hdi"), die=+b.getAttribute("data-die")||8;
  window.__miRoll.roll({dmg:"1d"+die},"","Hit Point Die",(r) =>{ b.__busy=0; const inp=document.querySelector('#restDlg [data-hdv="'+k+'"][data-hdi="'+i+'"]'); if(!inp) return; inp.value=String(r.v); inp.dispatchEvent(new Event("input",{bubbles:true})); }); });
