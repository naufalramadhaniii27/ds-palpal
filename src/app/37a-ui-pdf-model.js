/* Responsibility: the print model for the PDF export (vendor/pdf/pdfx-1.0.0.js draws it on the sheet template).
   Reads the sheet only (C, S, D and the sheet's own display helpers). Writes nothing and keeps no state.
   Every entry gets a short line the player understands at once, plus the full rules text when there is more to say.
   Model schema: reports/pdfx-model.md */
import {ABK,ABN} from "./02-data-default-character.js";
import {gName} from "./03-data-glossary.js";
import {C,DEF,S,__set_C,__set_S,clsLv} from "./04-logic-storage.js";
import {atkOn,eqOn,num,senseList,sg} from "./05-logic-helpers.js";
import {D,__set_D,derive,fill} from "./06-logic-derivation.js";
import {env} from "./00-env.js";
import {langText} from "./08-ui-render-sheet-and-actions.js";
import {coinsNow} from "./23c-ui-coins.js";
import {ordL,scOf} from "./23e-ui-spells-dc.js";
import {cuNm} from "./26-ui-customize.js";
import {crEnv,crExpr,crList,crOf,crStat,crText} from "./29b-ui-creatures-extras.js";

const PX_SKILLS = ["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"];
const PX_DOT = " • ";

/* ---------- text ---------- */
function pxUnEsc(t){ return String(t==null?"":t).replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&"); }
/* sheet text to print markup: {dc} filled, [[link|label]] to label, no HTML */
function pxPlain(t){ return pxUnEsc(fill(t)).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,l) =>{ return l||k; }).replace(/<[^>]+>/g,""); }
function pxPars(t){ return pxPlain(t).split(/\n+/).map((p) =>{ return p.trim(); }).filter(Boolean); }
function pxLine(t){ return pxPlain(t).replace(/\s*\n+\s*/g," ").trim(); }
function pxKey(t){ return pxPlain(t).replace(/[^a-z0-9]+/gi,"").toLowerCase(); }
/* first sentences of a long text, about 170 characters */
function pxBrief(t){ const p=pxLine(t).replace(/\*\*/g,""); if(p.length<=230) return p;
  let out=""; p.split(/(?<=[.!?])\s+/).some((x) =>{ if(out&&(out+" "+x).length>170) return true; out=(out?out+" ":"")+x; return out.length>=70; });
  return out.length>200 ? out.slice(0,190).replace(/\s+\S*$/,"")+"…" : out; }
/* short line plus full text; the full part is left out when it would only repeat the short line */
const PX_NOT_PICK = /^(Prerequisites?|Repeatable|Your choice|At your level|Uses?|Level \d+|Note)$/i;
/* a list of picks written as "**Name.** text" paragraphs (maneuvers, invocations, metamagic): the names */
function pxLabels(t){ const L=[]; pxPlain(t).split(/\n+/).forEach((p) =>{ const m=/^\s*\*\*([^*\n]{1,60}?)\.\*\*/.exec(p); if(m&&!PX_NOT_PICK.test(m[1])) L.push(m[1]); }); return L; }
function pxTwo(short,full){ const sp=pxLine(short), lab=pxLabels(short);
  if(lab.length>1&&!full) return {summary:lab.length+" picks: "+lab.join(", ")+".", text:pxPars(short)};
  if(full&&pxKey(full)!==pxKey(short)&&pxPlain(full).length>sp.length*1.1) return {summary:sp.length>260?pxBrief(sp):sp, text:pxPars(full)};
  if(sp.length>230) return {summary:pxBrief(sp), text:pxPars(short)};
  return {summary:sp, text:[]}; }
function pxPick(M,keys){ if(!M) return ""; for(const k of keys){ if(M[k]) return M[k]; } return ""; }
/* full rules text of a feature from the 2024 data (feat, subclass or class feature) */
function pxFull(g,n){ if(C.rs==="2014") return "";
  const gg=String(g.g||""), base=String(n).split(":")[0].trim();
  if(/^Feats?\b/.test(gg)) return pxPick(typeof FEAT_FULL==="undefined"?null:FEAT_FULL,[n,base,String(n).replace(/\s*\(.*\)$/,"")]);
  const m=/Subclass: (.+)$|\(multiclass \d+\): (.+)$/.exec(gg);
  if(m) return pxPick(typeof SUB_FULL==="undefined"?null:SUB_FULL,[(m[1]||m[2])+"|"+n,(m[1]||m[2])+"|"+base]);
  const cls=gg.split(/[ (]/)[0]; return pxPick(typeof CF_FULL==="undefined"?null:CF_FULL,[cls+"|"+n,cls+"|"+base]); }

/* ---------- page 1 ---------- */
function pxAbilities(){ const o={}; ABK.forEach((k) =>{ o[k]=[String(D.score[k]),sg(D.mod[k])]; }); return o; }
function pxSaves(){ return ABK.map((k) =>{ return {v:sg(num(D.save[k],0)), prof:!!(C.saves&&C.saves[k])}; }); }
function pxSkills(){ const o={}; (C.skills||[]).forEach((s,i) =>{ if(PX_SKILLS.indexOf(s.n)>=0) o[s.n]={v:sg(num(D.skill[i],0)), prof:num(s.p,0)>0}; }); return o; }
function pxHitDice(){ const R=(D.res||[]).filter((r) =>{ return r.k==="hd"||/^hd-d/.test(r.k); });
  if(!R.length) return [D.level+"d"+(C.hitDie||""),String(D.level)];
  const tot=R.map((r) =>{ const d=/d(\d+)/.exec(r.k+" "+(r.n||"")); return r.max+(d?"d"+d[1]:""); }).join(" + ");
  return [tot,String(R.reduce((t,r) =>{ return t+Math.max(0,r.max-num((S.used||{})[r.k],0)); },0))]; }
function pxWeapons(){ return (C.attacks||[]).map((a,i) =>{ return [a,i]; }).filter((x) =>{ return atkOn(x[0]); }).map((x) =>{
  const a=x[0], d=D.atk[x[1]]||{}; return {n:cuNm("a:"+a.n,a.n), hit:d.dc!=null?"DC "+d.dc:sg(num(d.hit,0)), dmg:String(d.dmg||"")+(a.type?" "+a.type:""), a:a}; }); }
function pxAtkNotes(W){ return W.filter((w) =>{ return w.a.m||w.a.note||w.a.range; }).map((w) =>{
  return "**"+w.n+".** "+[w.a.range,w.a.note].filter(Boolean).join(". ")+(w.a.m?" {{Mastery: "+w.a.m+"}}":""); }); }
function pxCoins(){ const c=coinsNow(), o={}; ["cp","sp","ep","gp","pp"].forEach((k) =>{ if(c[k]) o[k.toUpperCase()]=String(c[k]); }); return o; }
function pxProfs(ed){ const p=C.profs||{}, sv=ABK.filter((k) =>{ return C.saves&&C.saves[k]; }).map((k) =>{ return ABN[k]; });
  const sk=(C.skills||[]).filter((s) =>{ return num(s.p,0)>0; }).map((s) =>{ return s.n+(num(s.p,0)>1?" (expertise)":""); });
  return [(ed==="2014"?"**Armor.** ":"**Armor Training.** ")+(p.armor||"None"),"**Weapons.** "+(p.weapons||"None"),"**Tools.** "+(p.tools||"None"),
    "**Saving Throws.** "+(sv.join(", ")||"None"),"**Skills.** "+(sk.join(", ")||"None"),"","**Senses.** "+pxSenses(),"**Languages.** "+pxUnEsc(langText())]; }
/* Darkvision and the other senses from the builder, then Passive Perception */
function pxSenses(){ const L=[]; if(num(C.darkvision,0)) L.push("Darkvision "+num(C.darkvision,0)+" ft");
  senseList().forEach((x) =>{ L.push(pxPlain(x[0].n)+(num(x[0].v,0)?" "+num(x[0].v,0)+" ft":"")); });
  return L.join(", ")||"None"; }
function pxInvLine(i){ const q=num(i.q,1), on=eqOn(i); return (i.att?"**"+i.n+"**":i.n)+(q>1?" ×"+q:"")+(i.att&&on?" {{attuned}}":on?" {{worn}}":""); }
function pxGroupNames(re){ const out=[]; (C.features||[]).filter((g) =>{ return re.test(String(g.g||"")); }).forEach((g) =>{ (g.items||[]).forEach((f) =>{ out.push(cuNm("f:"+f.n,f.n)); }); }); return out; }
function pxDefenses(){ const L=(C.defenses||[]).concat(D.cf&&D.cf.res?D.cf.res:[]), by={};
  L.forEach((d) =>{ if(d&&d.t) (by[d.t]=by[d.t]||[]).push(String(d.v)); });
  return Object.keys(by).map((t) =>{ return "**"+t+".** "+by[t].filter((v,i,a) =>{ return a.indexOf(v)===i; }).join(", "); }); }
/* the four boxes top right: 2024 species traits, feats, weapon mastery, defenses. 2014 personality, ideals, bonds, flaws */
function pxBoxes(ed,W){ const n=S.notes||{}, b=(x) =>{ return "**"+x+"**"; };
  if(ed==="2014") return {topA:pxPars(n.personality||""), topB:pxPars(n.ideal||""), topC:pxPars(n.bond||""), topD:pxPars(n.flaw||"")};
  return {topA:pxGroupNames(/^(Species|Race)\b/).map(b), topB:pxGroupNames(/^Feats?\b/).map(b),
    topC:W.filter((w) =>{ return w.a.m; }).map((w) =>{ return "**"+w.n+".** "+w.a.m; }), topD:pxDefenses()}; }
/* class features box: each group with its feature names; the full text is in the appendix */
function pxFeatureNames(){ const out=[]; (C.features||[]).forEach((g) =>{ const it=(g.items||[]).map((f) =>{ return cuNm("f:"+f.n,f.n); }); if(it.length) out.push("# "+gName(g.g),it.join("  •  ")); });
  out.push("{{Short and full text of each feature in Features & Traits.}}"); return out; }

/* ---------- page 2 ---------- */
function pxLimited(){ return (D.res||[]).filter((r) =>{ return !(r.k==="hd"||/^hd-d/.test(r.k)||r.k==="pact"||/^s\d$/.test(r.k)); })
  .map((r) =>{ const back=PX_RESET[r.reset]||(r.reset==="none"&&r.tag?pxLine(r.tag):"");
    return "**"+pxPlain(r.n)+".** "+r.max+(r.pool?" points":+r.max===1?" use":" uses")+(r.die?" (d"+r.die+")":"")+(back?" {{"+back+"}}":""); }); }
/* when the uses come back, in the words the player reads at the table */
const PX_RESET = {long:"back on a Long Rest", short:"back on a Short or Long Rest", short1:"all back on a Long Rest, 1 back on a Short Rest", dawn:"back at dawn", dusk:"back at dusk"};
function pxMagicItems(){ return (C.inv||[]).filter((i) =>{ return i.d&&(i.att||i.rar||/magic|\+\d/i.test(i.n+" "+(i.t||""))); }); }
function pxTreasure(){ const att=(C.inv||[]).filter((i) =>{ return i.att; });
  const head=att.length?["**Attuned** {{"+Math.min(3,att.filter(eqOn).length)+" of 3}}. "+att.map((i) =>{ return i.n; }).join(", ")]:[];
  return head.concat(pxMagicItems().map((i) =>{ return "**"+i.n+".** "+pxBrief(i.d); })); }
/* Character tab fields (S.notes.ch_*): six on the template line, gender and faith go to the backstory box */
function pxLooks(n){ const o={}; ["age","height","weight","eyes","skin","hair"].forEach((k) =>{ const v=pxLine(n["ch_"+k]||""); if(v) o[k]=v; }); return o; }
function pxAllies(n){ const sec=[["Organizations",n.org],["Allies",n.allies],["Enemies",n.enemies]].filter((x) =>{ return String(x[1]||"").trim(); });
  if(sec.length===1&&sec[0][0]==="Allies") return pxPars(n.allies);
  return sec.reduce((out,x,i) =>{ return out.concat(i?[""]:[],["# "+x[0]],pxPars(x[1])); },[]); }
function pxNotesTail(n){ const who=[["Gender",n.ch_gender],["Faith",n.ch_faith]].filter((x) =>{ return String(x[1]||"").trim(); }).map((x) =>{ return "**"+x[0]+".** "+pxLine(x[1]); });
  const ses=pxPars(n.session||""); return (who.length?["","# Details"].concat(who):[]).concat(ses.length?["","# Notes"].concat(ses):[]); }
function pxBackstory(ed){ return pxBackstoryMain(ed).concat(pxNotesTail(S.notes||{})); }
function pxBackstoryMain(ed){ const n=S.notes||{}, out=pxPars(n.backstory||"");
  const pers=[["Personality",n.personality],["Ideals",n.ideal],["Bonds",n.bond],["Flaws",n.flaw],["Appearance",n.appearance]].filter((x) =>{ return String(x[1]||"").trim(); });
  if(ed==="2024"&&pers.length) return out.concat(["","# Personality"],pers.map((x) =>{ return "**"+x[0]+".** "+pxLine(x[1]); }));
  if(ed==="2014"&&String(n.appearance||"").trim()) return out.concat(["","# Appearance",pxLine(n.appearance)]);
  return out; }

/* ---------- spells ---------- */
function pxSlots(){ const sc=C.spellcasting||{}, o={}, U=S.used||{};
  (sc.slots||[]).forEach((n,k) =>{ if(n>0) o[k+1]={total:n, used:num(U["s"+(k+1)],0)}; });
  if(sc.pact&&+sc.pact.lvl){ const p=+sc.pact.lvl, r=(D.res||[]).filter((q) =>{ return q.k==="pact"; })[0];
    o[p]={total:(o[p]?o[p].total:0)+num(sc.pact.n||(r&&r.max),0), used:num(U.pact,0)}; }
  return o; }
function pxSpellTag(x){ const use=String(x.use||""), sc=C.spellcasting||{};
  if(/Always/.test(use)) return "Always";
  if(/Long Rest|Short Rest|At will/.test(use)) return use;
  if(x.src&&(Array.isArray(sc.by)&&sc.by.length>1||x.src!==C.cls)) return x.src;
  return ""; }
function pxSpellLine(x,lv,ed){ const sch=String(x.sch||"");
  const head=!lv?sch+" cantrip":ed==="2014"?ordL(lv).replace(" Level","-level ")+sch.toLowerCase():ordL(lv).replace(" Level"," level ")+sch;
  return head+(x.conc?"  •  Concentration":"")+(x.rit?"  •  Ritual":""); }
function pxSpellText(x){ const same=x.full&&x.sum&&pxKey(x.full)===pxKey(x.sum);
  const summary=x.full&&x.sum&&!same?pxLine(x.sum):pxBrief(x.sum||x.full||"");
  const body=same&&pxPlain(x.full).length<=230?[]:pxPars(x.full||x.sum||"");
  return {summary:summary, text:body.map((p) =>{ return p.replace(/^(Higher-level slot:|Cantrip upgrade:|Using a Higher-Level Spell Slot\.|At Higher Levels\.)/,"**$1**"); })}; }
function pxSpellDetails(x,ed){ const s=scOf(x)||{}, use=String(x.use||"");
  const hd=x.sv==="ATK"?"Spell attack "+sg(num(s.atk,0)):x.sv?x.sv+" save, DC "+s.dc:"None";
  return [["Casting Time",String(x.ct||"")+(x.rit&&ed!=="2014"?" or Ritual":"")],["Range",x.r||""],["Components",String(x.cmp||"")+(x.mat?" ("+x.mat+")":"")],
    ["Duration",(x.conc?"Concentration, ":"")+(x.dur||"")],[x.sv?"Attack/Save":"Save",hd],["Source",String(x.src||"")+(use?" ("+use+")":"")]]; }
function pxSpell(x,lv,ed){ const t=pxSpellText(x);
  return {name:cuNm("s:"+x.n,x.n), tag:pxSpellTag(x), prepared:lv>0&&/Prepared|Always/.test(String(x.use||"")), line:pxSpellLine(x,lv,ed),
    summary:t.summary, text:t.text, details:pxSpellDetails(x,ed)}; }
function pxSpells(ed){ const L=(C.spells||[]).slice(); if(!L.length) return null;
  const sc=C.spellcasting||{}, main=scOf(null)||{}, by={}, slots=pxSlots();
  L.forEach((x) =>{ const lv=num(x.l,0); (by[lv]=by[lv]||[]).push(x); });
  const levels=Object.keys(by).map(Number).sort((a,b) =>{ return a-b; }).map((lv) =>{
    return {level:lv, slots:slots[lv]?slots[lv].total:null, spells:by[lv].sort((a,b) =>{ return a.n<b.n?-1:1; }).map((x) =>{ return pxSpell(x,lv,ed); })}; });
  const own=[...new Set(L.map((x) =>{ return String(x.src||"").split(" (")[0]; }).filter(Boolean))];
  const cls=Array.isArray(sc.by)&&sc.by.length>1?sc.by.map((b) =>{ return b.n; }).join(" / "):own.length&&own.indexOf(C.cls)<0?own.join(" / "):(sc.n||C.cls||"");/* a Fighter with only a species cantrip: "Aasimar" */
  return {className:cls, ability:main.ab||sc.ab||"", dc:main.dc!=null?String(main.dc):"", attack:main.atk!=null?sg(main.atk):"", slots:slots, levels:levels}; }

/* ---------- creatures ---------- */
function pxCrStats(o,env){ const st=[["AC",crExpr(o.ac,env)],["HP",crExpr(o.hp,env)+(o.hd?" ("+crExpr(o.hd,env)+")":"")],["Speed",o.speed||"—"]];
  if(o.init) st.push(["Initiative",o.init]);
  if(o.cr&&o.cr!=="None") st.push(["CR",o.cr+(o.xp?" (XP "+o.xp+")":"")]);
  return st; }
function pxCrAbil(o){ const ab={}; ABK.forEach((k) =>{ const s=o.ab&&o.ab[k]; ab[k]=s==null?["—",""]:[String(s),sg(Math.floor((s-10)/2))]; }); return ab; }
function pxCrLines(o,env){ const T=(s) =>{ return pxLine(crText(s,env)); };
  const sv=o.saves&&Object.keys(o.saves).length?Object.keys(o.saves).map((k) =>{ return k+" "+crText(o.saves[k],env); }).join(", "):"";
  const L=[["Saving Throws",sv],["Skills",o.skills],["Vulnerabilities",o.vuln],["Resistances",o.res],["Immunities",o.imm],["Gear",o.gear],["Senses",o.senses],["Languages",o.lang]];
  if(o.pb) L.push(["Proficiency Bonus",sg(+crExpr(o.pb,env)||0)]);
  if(o.initNote) L.push(["Turn",o.initNote]);
  return L.filter((x) =>{ return x[1]; }).map((x) =>{ return [x[0],T(x[1])]; }); }
function pxCrSections(o,env){ return [["traits","Traits"],["actions","Actions"],["bonus","Bonus Actions"],["reactions","Reactions"]]
  .map((p) =>{ return [p[1],(o[p[0]]||[]).map((a) =>{ return [pxLine(a[0]),pxLine(crText(a[1],env))]; })]; }).filter((p) =>{ return p[1].length; }); }
/* one line: size and type, AC, HP, speed and the main action with its numbers */
function pxCrSummary(o,env){ const a0=(o.actions||[])[0], at=a0?pxLine(crText(a0[1],env)):"";
  const hit=/Attack Roll:\s*([+−-]\d+)/.exec(at)||/([+−-]\d+) to hit/.exec(at), dm=/(?:Hit|Damage(?: on a hit)?):\s*([^.]+)/.exec(at);
  const act=a0?" Main action: "+pxLine(a0[0])+(hit||dm?" ("+[hit&&hit[1],dm&&dm[1].trim()].filter(Boolean).join(", ")+")":"")+".":"";
  return ((o.size||"")+" "+(o.type||"")).trim()+". AC "+crExpr(o.ac,env)+", HP "+crExpr(o.hp,env)+", Speed "+String(o.speed||"-").replace(/\.$/,"")+"."+act; }
function pxCreature(e){ const c=crOf(e.n); if(!c) return null; const env=crEnv(e.ctx,c), o=crStat(c,e.ctx);
  return {name:e.n, tag:e.why+(env.SL?PX_DOT+"Level "+env.SL:""), meta:((o.size||"")+" "+(o.type||"")).trim()+(o.al?", "+o.al:""),
    summary:pxCrSummary(o,env), stats:pxCrStats(o,env), abilities:pxCrAbil(o), lines:pxCrLines(o,env), sections:pxCrSections(o,env)}; }
function pxCreatures(){ let L=[]; try{ L=crList(); }catch(e){ return []; } return L.map(pxCreature).filter(Boolean); }

/* ---------- appendix ---------- */
function pxAppendix(){ const out=(C.features||[]).map((g) =>{ return [gName(g.g),(g.items||[]).map((f) =>{ return Object.assign({name:cuNm("f:"+f.n,f.n), tag:f.s||""},pxTwo(f.d,pxFull(g,f.n))); })]; }).filter((g) =>{ return g[1].length; });
  const mi=pxMagicItems(); if(mi.length) out.push(["Magic Items",mi.map((i) =>{ return Object.assign({name:i.n, tag:[i.rar,i.att?"Attunement":""].filter(Boolean).join(PX_DOT)},pxTwo(i.d,"")); })]);
  const hb=(C.actions||[]).filter((a) =>{ return a.hb; }); if(hb.length) out.push(["Other Rules",hb.map((a) =>{ return Object.assign({name:a.n, tag:""},pxTwo(a.d,"")); })]);
  return out; }

/* ---------- the whole model ---------- */
function pxHeader(ed){ return {edition:ed, name:C.name||"Character", classLevel:ed==="2014"&&C.sub?clsLv()+" ("+C.sub+")":clsLv(), background:C.bg||"",
  slot3:ed==="2024"?(C.sub||""):"", species:(C.species||"")+(ed==="2024"&&C.size?" ("+C.size+")":""), alignment:S.align||"", xp:S.xp!=null?String(S.xp):""}; }
function pxCombat(){ const hd=pxHitDice(); return {abilities:pxAbilities(), prof:sg(D.pb), inspiration:S.insp?"1":"", ac:String(D.ac), initiative:sg(D.init), speed:D.speed+" ft",
  hpMax:String(D.hpmax), hpCurrent:String(S.hp==null?D.hpmax:S.hp), hpTemp:S.tmp?String(S.tmp):"", hitDiceTotal:hd[0], hitDice:hd[1],
  deathSaves:Array.isArray(S.ds)?S.ds:[0,0], passive:String(D.pas_per), saves:pxSaves(), skills:pxSkills()}; }
export function pdfModel(){ const ed=C.rs==="2014"?"2014":"2024", W=pxWeapons(), n=S.notes||{}, lim=pxLimited();
  return Object.assign(pxHeader(ed),pxCombat(),{
    weapons:W.map((w) =>{ return [w.n,w.hit,w.dmg]; }), attackNotes:pxAtkNotes(W), coins:pxCoins(), boxes:pxBoxes(ed,W),
    proficiencies:pxProfs(ed), equipment:(C.inv||[]).map(pxInvLine), features:pxFeatureNames(),
    looks:pxLooks(n), portrait:pxPortrait(), factionName:"", allies:pxAllies(n), backstory:pxBackstory(ed),
    moreFeatures:pxMore(ed,lim), treasure:pxTreasure(),
    spellcasting:pxSpells(ed), appendix:pxAppendix(), creatures:pxCreatures()}); }

/* page 2 box: limited uses, and on the 2014 sheet (no defenses box) the defenses too */
function pxMore(ed,lim){ const d=ed==="2014"?pxDefenses():[], out=lim.length?["# Limited Use"].concat(lim):[];
  return d.length?out.concat(out.length?[""]:[],["# Defenses & Conditions"],d):out; }
/* the token picture (S.portrait, a JPEG data URL) for the Character Appearance box; other formats are left out */
function pxPortrait(){ const p=String(S.portrait||""); return /^data:image\/(jpe?g|png);base64,/i.test(p)?p:""; }

/* test hook (tests/pdfx_sweep.py): the print model of another character, without saving it. The open sheet is restored */
env.__pdfModelFor=function(c){ const C0=C, S0=S, D0=D; let out=null;
  try{ __set_C(structuredClone(c)); __set_S(structuredClone(DEF)); derive(); out=pdfModel(); }catch(e){ out={err:String(e&&e.stack||e)}; }
  __set_C(C0); __set_S(S0); __set_D(D0); try{ derive(); }catch(e){} return out; };
