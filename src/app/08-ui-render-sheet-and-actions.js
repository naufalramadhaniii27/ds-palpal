import {ABK,ABN} from "./02-data-default-character.js";
import {GLOSS,NOTE_FIELDS,SL14,athI,gName,x14,x14n} from "./03-data-glossary.js";
import {C,S,clsLv} from "./04-logic-storage.js";
import {$,$$,actOn,atkOn,attMaxC,clamp,eqInvOf,eqOn,esc,fmtW,num,rich,senseList,sg} from "./05-logic-helpers.js";
import {D,fill,richP} from "./06-logic-derivation.js";
import {renderStamp} from "./07-ui-theme-contrast-spring.js";
import {__R} from "./00-reg.js";
import { html, render as drawHtml, raw as rawHtml } from "./lib/html.js";
Object.defineProperty(__R,"renderNotes",{get:function(){return renderNotes;},set:function(v){renderNotes=v;},configurable:true});
Object.defineProperty(__R,"used",{get:function(){return used;},set:function(v){used=v;},configurable:true});
/* ================= RENDER ================= */
export function campName(){ const v=(S&&typeof S.camp==="string")?S.camp:((C&&C.office)||""); return String(v).trim(); }/* v30 RU133 */
/* T1: the hidden empty place of a first public visit (ph) holds the sample build, so the tab keeps the page title until a real character is open */
const TITLE0=document.title;
function phOpen(){ try{ const r=JSON.parse(__store.getItem("cs-roster-v1")); if(!r||!r.chars) return !!window.__publicFresh; const a=r.chars[r.active]; return !!(a&&a.ph); }catch(e){ return false; } }
export function renderIdentity(){
  document.title = phOpen() ? TITLE0 : C.name+" | "+C.species+" "+clsLv();
  const cpn=campName(), mcp=$("#miniCamp"), icp=$("#idCamp"); if(mcp) mcp.textContent=cpn; if(icp){ icp.hidden=false; drawHtml(cpn ? html`${rawHtml(__R.ico("ui-flag"))}<span>${cpn}</span>` : html`<button type="button" class="camp-add" data-campadd="1">${rawHtml(__R.ico("ui-flag"))}<span>Add campaign</span></button>`, icp);/* T10: an empty campaign offers itself */ }
  $("#officeName").textContent = cpn || C.office || "Character Record"; $("#officeSub").textContent = C.name+" \u2022 "+clsLv(); renderStamp();
  $("#miniName").textContent = C.name;
  $("#miniSub").textContent = C.species+" "+clsLv();
  drawHtml(html`<b>${(C.office||"Character Record").toUpperCase()}</b><span>${rawHtml(C.cardNo?'No. '+esc(C.cardNo):'Level '+D.level)}</span>`, $("#idTop"));
  $("#idName").textContent = C.name;
  const f=[["Species",C.species,__R.grpSpec("species")],["Class",clsLv(),__R.grpSpec("class")],[(x14()&&SL14[String(C.cls||"").split(/[\s/,]/)[0]])||"Subclass",C.sub,__R.grpSpec("sub")],["Background",C.bg,__R.grpSpec("bg")],["Size",C.size,"g:Size"]];
  drawHtml(f.filter((x) =>{return x[1]}).map((x) =>{const em=idArt(x[0],x[1]);/* every chip gets a Codex picture, or none does */ return '<dt>'+x[0]+'</dt><dd'+(em?' data-ico="1"':'')+'>'+em+(x[2]?'<button type="button" class="tx" data-info="'+esc(x[2])+'">'+esc(x[1])+'</button>':esc(x[1]))+'</dd>'}), $("#idF"));
  drawHtml(html`<button type="button" class="bd" data-bd="pb" style="border-radius:6px;padding:0 4px">${"Proficiency "+sg(D.pb)}</button>`, $("#pbAside"));
  __R.xpBox();/* v22 RU63 */
}
function idArt(lbl,val){ const A=window.__ART; if(!A||!A.icon||(window.__idNoArt&&window.__idNoArt())) return ""; const sl=function(n){ return String(n||"").toLowerCase().replace(/['\u2019]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); }, cls=String(C.cls||"").split(/[\s\/,]/)[0];
  const im=function(u){ return '<img class="art-sub" src="'+u+'.avif" width="24" height="24" alt="" decoding="async">'; }, has=function(c,k){ return A.icon[c]&&A.icon[c].indexOf(k)>=0; };
  if(lbl==="Class"){ const ck=cls.toLowerCase(); if(A.emblem&&A.emblem[ck]) return im("img/emblem/"+ck); return has("cat","class")?im("img/icon/cat/class"):""; }
  if(lbl==="Species"){ const k=sl(val); return has("species",k)?im("img/icon/species/"+k):has("species","custom")?im("img/icon/species/custom"):""; }
  if(lbl==="Background"){ const b=sl(val); return has("background",b)?im("img/icon/background/"+b):has("background","custom")?im("img/icon/background/custom"):""; }
  if(lbl==="Size"){ const z=sl(val); return has("size",z)?im("img/icon/size/"+z):""; }
  const e=window.__artSub?window.__artSub(cls,val,24):""; return e||(has("cat","subclass")?im("img/icon/cat/subclass"):""); }
export function renderAbilities(){
  const SC=__R.setOf("ab")==="score";/* v25 RU38 no. 6: score on top */
  $("#abil").innerHTML = ABK.map((k) =>{
    const key = !!(C.saves && C.saves[k]);
    return html`<button type="button" class="ab bd${key?' key':''}" data-bd="ab-${k}" title="${ABN[k]}"><span class="k">${rawHtml(ABN[k])}</span><span class="ks" aria-hidden="true">${rawHtml(k)}</span><span class="m">${rawHtml(SC?D.score[k]:sg(D.mod[k]))}</span><span class="s">${rawHtml(SC?sg(D.mod[k]):D.score[k])}</span><span class="sv">Save ${rawHtml(sg(D.save[k]))}${rawHtml(key?' \u2022':'')}</span></button>`;
  }).join("");
}
export function renderTiles(){
  const shield = '<svg viewBox="0 0 76 84" fill="none" aria-hidden="true"><path d="M38 3 71 14v25c0 21-14 36-33 42C19 75 5 60 5 39V14z" stroke="currentColor" stroke-width="2"/><path d="M38 9 65 18v21c0 17-11 30-27 35C22 69 11 56 11 39V18z" stroke="currentColor" stroke-width="1" opacity=".5"/></svg>';
  setTimeout(() =>{ const tl=$("#tiles"); if(!tl) return; let pe=document.getElementById("pinsBox"); if(!pe){ pe=document.createElement("div"); pe.id="pinsBox"; tl.parentNode.insertBefore(pe,tl.nextSibling); } drawHtml(rawHtml(__R.pinnedH()), pe);
    let on=document.getElementById("oldNote"), pm=document.getElementById("p-main"); if(!on&&pm){ on=document.createElement("div"); on.id="oldNote"; pm.insertBefore(on,pm.firstChild); } if(on) drawHtml(rawHtml(__R.oldNoteH()), on); },0);/* v27 RU35 no. 9, RU28 */
  drawHtml(html`<button type="button" class="tile ac bd" data-bd="ac">${rawHtml(shield)}<span class="k">Armor Class</span><span class="v">${rawHtml(D.ac)}</span></button><button type="button" class="tile bd" data-bd="init"><span class="k">Initiative</span><span class="v">${rawHtml(sg(D.init))}</span><span class="n">Dexterity${rawHtml(__R.cfFlags((__R.CF0().chk||[]).concat(__R.CF0().init||[])))}</span></button><button type="button" class="tile bd" data-bd="speed"><span class="k">Speed</span><span class="v">${rawHtml(D.speed)}<small>ft</small></span><span class="n">Walking</span></button><button type="button" class="tile bd" data-bd="pb"><span class="k">Proficiency</span><span class="v">${rawHtml(sg(D.pb))}</span><span class="n">Bonus</span></button>${rawHtml(x14()&&athI()>=0?'<button type="button" class="tile bd" data-bd="sk-'+athI()+'"><span class="k">Grapple</span><span class="v">'+sg(D.skill[athI()])+'</span><span class="n">Athletics, contested</span></button>':'<button type="button" class="tile bd" data-bd="dc"><span class="k">Grapple DC</span><span class="v">'+D.dc+'</span><span class="n">Strength or Dexterity save</span></button>')}<button type="button" class="tile insp press" id="insp" aria-pressed="${rawHtml(S.insp)}"><span class="ib" role="button" aria-label="About Heroic Inspiration" data-info="g:Heroic Inspiration">i</span><span class="k">Heroic Inspiration</span><span class="gem"></span><span class="n" id="inspN">${rawHtml(S.insp?"Ready":"None")}</span></button>`, $("#tiles"));
}
export function renderSkillsPage(){
  $("#saves").innerHTML = ABK.map((k) =>{
    const on=!!(C.saves&&C.saves[k]);
    return html`<div class="row${on?' pr':''}"><span class="dot${on?' on':''}"></span><span class="nm"><button type="button" class="tx" data-info="g:${ABN[k]}">${rawHtml(k)}</button>${rawHtml(__R.cfFlags(__R.cfSave(k)))}</span><button type="button" class="bonus bd" data-bd="save-${k}">${rawHtml(sg(D.save[k]))}</button></div>`;
  }).join("")+__R.saveNotesH();
  __R.renderSpeedDef();/* RU35 no. 7 */
  drawHtml(html`<div class="sense"><button type="button" class="bonus bd" data-bd="pas-per">${rawHtml(D.pas_per)}</button><button type="button" class="tx" data-info="g:Passive Perception">Passive Perception</button></div><div class="sense"><button type="button" class="bonus bd" data-bd="pas-ins">${rawHtml(D.pas_ins)}</button><button type="button" class="tx" data-info="g:Insight">Passive Insight</button></div><div class="sense"><button type="button" class="bonus bd" data-bd="pas-inv">${rawHtml(D.pas_inv)}</button><button type="button" class="tx" data-info="g:Investigation">Passive Investigation</button></div>${rawHtml(num(C.darkvision,0)?'<div class="sense"><button type="button" class="bonus bd" data-bd="dark">'+num(C.darkvision)+'</button><button type="button" class="tx" data-info="g:Darkvision">Darkvision, ft</button></div>':'')}${rawHtml(senseList().map((x) =>{ const s=x[0]; return html`<div class="sense"><button type="button" class="bonus bd" data-bd="sense-${x[1]}">${rawHtml(num(s.v,0))}</button><button type="button" class="tx" data-bd="sense-${x[1]}">${s.n}, ft</button></div>`; }).join(""))}`, $("#senses")); /* RU19 */
  drawHtml(rawHtml(__R.profsH()), $("#profs"));/* v23 RU36 no. 7 */
  $("#skills").innerHTML = C.skills.map((s,i) =>{
    const p=num(s.p,0);
    const flag = __R.cfFlags(__R.cfSkill(s))+(s.dis ? '<span class="flag" title="Disadvantage">DIS</span>' : (s.hb ? '<span class="flag hb" title="Retromistika Playtest, Skills">HB</span>' : ""));
    return html`<div class="row${p?' pr':''}"><button type="button" class="pinb${__R.pinOn(s.n)?' on':''}" data-pin="${s.n}" aria-pressed="${__R.pinOn(s.n)}" aria-label="Pin ${s.n} to the Main tab"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3h6l-1 6 4 3v2H6v-2l4-3z"/><path d="M12 14v7"/></svg></button><span class="dot${p?' on':''}"${p===2?' style="box-shadow:0 0 0 2px var(--panel),0 0 0 3.5px var(--stamp)"':''}></span><span class="ab3">${rawHtml(s.ab)}</span><span class="nm">${GLOSS[s.n] ? html`<button type="button" class="tx" data-info="g:${s.n}">${s.n}</button>` : rawHtml(esc(s.n))}${rawHtml(flag)}</span><button type="button" class="bonus bd" data-bd="sk-${i}">${rawHtml(sg(D.skill[i]))}</button></div>`;
  }).join("");
  syncLang();
}
function langList(){ return S.lang.filter((x) =>{return x && x.trim()}); }
export function langText(){ const l = langList(); return l.length? l.map(esc).join(", ") : "Common"; }
export function syncLang(){ const el=$("#langLine"); if(el) drawHtml(rawHtml(langText() + (langList().length<3 ? ' <span style="color:var(--faint)">('+(3-langList().length)+' open)</span>' : "")), el); }

/* m6: a pool resource (Lay on Hands, max 5 x level) shows the points left with - and + instead of one box per point */
export function boxes(used,max,key,lbl,pool){ if(pool) return html`<span class="pool"><button type="button" class="plb" data-k="${key}" data-pd="-1" aria-label="${lbl}: spend 1">−</button><input class="pli" type="number" inputmode="numeric" min="0" max="${max}" step="1" value="${max-used}" data-k="${key}" aria-label="${lbl}: points left"><button type="button" class="plb" data-k="${key}" data-pd="1" aria-label="${lbl}: restore 1">+</button><small>of ${rawHtml(max)}</small></span>`;
  let h=""; for(let i=0;i<max;i++) h+='<button type="button" class="bx" aria-pressed="'+(i<used)+'" data-k="'+key+'" data-i="'+i+'" aria-label="'+esc(lbl)+' '+(i+1)+'"></button>'; return h; }
export function used(k,max){ const u=num(S.used[k],0); return clamp(u,0,max); }
function luSub(r){
  const left=r.max-used(r.k,r.max);
  /* RU27: Hit Dice rows always count, also with one die */
  if(r.max===1&&!/^hd(-d\d+)?$/.test(r.k)) return left ? "Ready" : r.reset==="none" ? "Expended" : "Expended until a "+(r.reset==="long"?"Long Rest":"Short or Long Rest");
  return left+" of "+r.max+" left";
}
export var actF="all";
function shortX(n,g){ return (/^(Maneuvers known|Eldritch Invocations|Metamagic Options)$/.test(g||"")||n==="Paladin's Smite")&&MAN_SUM[n]?MAN_SUM[n]:""; }/* v41 p10 */
export function featAll(){ const o=[]; (C.features||[]).forEach((g,gi) =>{ (g.items||[]).forEach((f,fi) =>{ o.push({g:g.g,gi:gi,fi:fi,f:f,t:f.full||f.d||""}); }); }); return o; }
/* v35 p15 (RU129): card text is the short version, the popup has the full text. "At your level" is its own line */
/* v35 p15: numbers in short texts. "(DC 8 + PB + STR)", "(spell save DC)", "(DC 8 + PB + the ability you raised)" and "+ Fighter level" become the character's numbers */
function sumNums(t,cl){ const sc=__R.scCls(cl), lv=__R.clsLvls(), M=D.mod||{}, S0=t;
  t=t.replace(/\(DC 8 \+ PB \+ (STR|DEX|CON|INT|WIS|CHA)(?: or (STR|DEX|CON|INT|WIS|CHA))?\)/g,(m,a,b) =>{ return "DC "+(8+D.pb+Math.max(M[a]||0,b?(M[b]||0):-99)); });
  t=t.replace(/\(DC 8 \+ PB \+ the ability you raised\)/g,(m) =>{ const r=/\b(STR|DEX|CON|INT|WIS|CHA) \+[12]\b/.exec(S0); return r?"DC "+(8+D.pb+(M[r[1]]||0)):m; });
  t=t.replace(/\(spell save DC\)/g,(m) =>{ return sc&&sc.dc?"DC "+sc.dc:m; });
  t=t.replace(/\(Superiority Die\)/g,() =>{ const f=lv.Fighter||D.level; return "1d"+(f>=18?12:f>=10?10:8); });/* v35 p18 */
  return t.replace(/\+ (Barbarian|Bard|Cleric|Druid|Fighter|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard) level\b/g,(m,c) =>{ return lv[c]?"+ "+lv[c]:m; }); }
export function aylSplit(t,cl){ t=sumNums(String(t||""),cl); const m=/\s*\*\*At your level:\*\*\s*([^]*?)\s*$/.exec(t); return m?{t:t.slice(0,m.index).replace(/\s+$/,""),a:m[1].replace(/\.$/,"")}:{t:t,a:""}; }
/* v35 p17 (RU129, card design): short text becomes number blocks. Label on top, big number below, Fail and Success chips, footer.
   Numbers come from the computed short text (sumNums) and from spCalc for spells. Classes .sum, .sum-p, .sum-ks, .sum-k, .sum-l, .sum-n, .sum-o, .sum-m stay stable for later skins */
const SUM_PILL={"Action":"time-action","Bonus Action":"time-bonus","Reaction":"time-reaction","On hit":"ui-target"};
const SUM_COND=["Blinded","Charmed","Deafened","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious"];
const SUM_DT="Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder";
function sumParse(t){ let s=String(t||""), o={p:"",k:[],o:[],m:[],yc:"",rest:""}, m;
  const yi=s.search(/\s*\*\*Your choice\.\*\*/); if(yi>=0){ o.yc=s.slice(yi).trim(); s=s.slice(0,yi); } const s0=s;
  m=/(^|\.\s+)(Bonus Action|Reaction|Magic action|Action)\b(:?)\s*/.exec(s); if(m){ o.p=m[2]==="Magic action"?"Action":m[2]; if(m[3]) s=s.slice(0,m.index+m[1].length)+s.slice(m.index+m[0].length); }
  if(!o.p&&/\bhit\b[^.]*\b(spend|Target)\b|\bafter a melee hit\b|\bSneak Attack hit\b|\bon a [^.]*\bhit\b/i.test(s)) o.p="On hit";
  m=new RegExp("Target (STR|DEX|CON|INT|WIS|CHA) save DC (\\d+)\\. Fail: ([^.]*)\\.(?: Success: ([^.]*)\\.)?").exec(s);
  if(m){ let fail=m[3], dm=new RegExp("^(\\d+d\\d+(?: ?\\+ ?\\d+)?) (?:damage of your ancestry type|("+SUM_DT+")(?: damage)?)(.*)$").exec(fail);
    if(dm){ o.k.push({l:"Damage",n:dm[1].replace(/ /g,""),t:dm[2]||"ancestry type"}); fail="full damage"+dm[3]; }
    o.k.unshift({l:"Save",n:m[1]+" "+m[2],ab:m[1]}); o.o.push({f:1,t:fail}); if(m[4]) o.o.push({f:0,t:m[4]}); s=s.replace(m[0],""); }
  m=/\bheal (\d+d\d+(?: ?\+ ?\d+)?)\.?/i.exec(s); if(m){ o.k.push({l:"Heal",n:m[1].replace(/ /g,"")}); s=s.replace(m[0],""); }
  o.s0=s0;
  const sen=s.split(/(?<=\.)\s+/).map((x) =>{ return x.trim(); }).filter((x) =>{ return x&&x!=="."; }), keep=[];
  sen.forEach((x) =>{ const dm=/^Damage (\+?\d+d\d+)\s*(.*)$/.exec(x);
    if(dm){ o.k.unshift({l:"Damage",n:dm[1]}); const tl=dm[2].replace(/\.$/,"").replace(/^[,;:]\s*/,"").trim(); if(tl) keep.push(tl.replace(/^./,(c) =>{ return c.toUpperCase(); })+"."); return; }
    if(/^(Short Rest|Long Rest|Once per (Long|Short)|Uses equal|Large or smaller|Medium or smaller|Huge or smaller|Weapon or Unarmed Strike|Melee, weapon)/.test(x)) o.m.push(x.replace(/\.$/,"")); else keep.push(x); });
  if(!o.k.length) return null;
  o.rest=keep.join(" ").replace(/^[,:;]\s*/,"").replace(/^./,(c) =>{ return c.toUpperCase(); });
  if(!/[A-Za-z]{3}/.test(o.rest)) o.rest=s0.split(/(?<=\.)\s+/).filter((x) =>{ return !/^(Short Rest|Long Rest|Once per (Long|Short)|Uses equal)/.test(x.trim()); }).join(" ").trim();/* the short sentence is never empty */
  return o; }
/* card short sentence: 14 px, main text color, up to 3 lines, no Show more (the popup has the full text). Your choice stays visible under it */
function sumText(t,cl){ let s=String(t||""), yi=s.search(/\s*\*\*Your choice\.\*\*/), yc=yi>=0?s.slice(yi).trim():""; if(yi>=0) s=s.slice(0,yi);
  return '<p class="sum-d sum-c">'+__R.featNums(richP(fill(s)),cl)+'</p>'+(yc?'<p class="sum-d">'+__R.fch(richP(fill(yc)))+'</p>':''); }
function sumPill(p){ return p ? html`<span class="sum-p">${rawHtml(__R.ico(SUM_PILL[p]||"act-action","sum-i"))}<span>${p}</span></span>` : ""; }
function sumLab(k){ const i=k.l==="Damage"?(k.t&&__R.DT_ICON[k.t]?__R.dtIcon(k.t):__R.ico("ui-dice","sum-i")):k.l==="Save"?__R.ico("ab-"+String(k.ab||"str").toLowerCase(),"sum-i"):k.l==="Heal"?__R.ico("hp-heal","sum-i sum-heal"):k.l==="To hit"?__R.ico("ui-target","sum-i"):__R.ico("ui-range","sum-i");
  return html`<small class="sum-l">${rawHtml(i)}<span>${k.l}</span></small>`; }
function sumFoot(x){ const k=/Short Rest/.test(x)?"rest-short":/Long Rest/.test(x)?"rest-long":/Mastery/.test(x)?"item-weapon":/\barea\b|Sphere|Cone|Cube|Line|Cylinder|Emanation/.test(x)?"ui-area":/smaller|larger/.test(x)?"ui-users":/Weapon|weapon|Unarmed/.test(x)?"item-weapon":/\bft\b|feet|Touch|Self|mile/.test(x)?"ui-range":"ui-info"; return '<span>'+__R.ico(k,"sum-i")+'<span>'+esc(x)+'</span></span>'; }
function sumChip(c){ const cd=SUM_COND.filter((n) =>{ return new RegExp("\\b"+n+"\\b").test(c.t); })[0];
  return '<span class="sum-'+(c.f?'f':'s')+'">'+__R.ico(c.f?(cd?"cond-"+cd.toLowerCase():"hp-damage"):"ui-shield","sum-i")+'<b>'+(c.f?"Fail":"Success")+'</b> '+esc(c.t)+'</span>'; }
/* v36 p11: cards that stand for an attack read To hit and Damage from the attack rows (C.attacks, D.atk) */
function fatkRows(f){ const o=[]; (C.attacks||[]).forEach((a,i) =>{ if(!atkOn(a)||!D.atk[i]) return; if(f(a)) o.push({a:a,d:D.atk[i]}); }); return o; }
const FATK={
 "Pole Strike":{p:"Bonus Action",s:"After the Attack action, hit with the other end of your polearm.",f:function(a){ return /^Pole Strike/.test(a.n); }},
 "Reactive Strike":{p:"Reaction",s:"A creature enters your reach. Make one melee attack against it.",f:function(a){ const of=(C.attacks||[]).filter((r) =>{ return /^Pole Strike/.test(r.n); }).map((r) =>{ return r.of; }); return of.indexOf(a.n)>=0; }},
 "Push":{p:"",s:"When an Unarmed Strike hits during the Attack action, you also push the target 5 ft. Once per turn.",f:function(a){ return a.n==="Unarmed Strike"; }},
 "Enhanced Dual Wielding":{p:"Bonus Action",s:"After attacking with a Light weapon, attack again with a different one-handed melee weapon. No ability modifier on damage unless it is negative.",nomod:1,f:function(a){ return a.n!=="Unarmed Strike"&&!a.act&&__R.atkKind(a)==="melee"&&!/Two-Handed/.test(a.sub||""); }},
 "Charge Attack":{p:"",s:"Move 10 ft straight at a target, then hit it with a melee attack in the Attack action. Add 1d8 damage, or push it up to 10 ft. Once per turn.",k:[{l:"Damage",n:"+1d8"}],m:["Or push the target 10 ft (size up to one larger than you)"]},
 "Flurry of Blows":{p:"Bonus Action",s:"Spend 1 Focus Point to make two Unarmed Strikes.",s14:"Spend 1 ki point to make two Unarmed Strikes.",f:function(a){ return a.n==="Unarmed Strike"; }},
 "Bonus Unarmed Strike":{p:"Bonus Action",s:"After the Attack action with a Monk weapon or Unarmed Strike, make one Unarmed Strike.",f:function(a){ return a.n==="Unarmed Strike"; }}
};
function fatkSum(n){ const F=FATK[n]; if(!F) return null; const rows=F.f?fatkRows(F.f):[], o={p:F.p||"",k:(F.k||[]).slice(),o:[],m:(F.m||[]).slice(),yc:"",rest:(C.rs==="2014"&&F.s14)||F.s,r:[]};
  const dm=function(r){ const t=String(r.d.dmg); return F.nomod?t.replace(/\+\d+$/,""):t; };
  if(rows.length===1){ const r=rows[0]; o.k.unshift({l:"To hit",n:sg(r.d.hit),t:r.a.of||r.a.n},{l:"Damage",n:dm(r),t:r.a.type||""}); }
  else if(rows.length>1) o.r=rows.slice(0,4).map((r) =>{ return {w:r.a.of||r.a.n,h:sg(r.d.hit),d:dm(r),t:r.a.type||""}; });
  return o; }
function sumRows(rs){ return '<div class="sum-rows">'+rs.map((r) =>{ return html`<div class="sum-row"><span class="sum-rn">${r.w}</span><span class="sum-rc"><small>To hit</small><b>${r.h}</b></span><span class="sum-rc"><small>Damage</small><b>${r.d}</b>${rawHtml(__R.tyIcon(r.t))}</span></div>`; }).join("")+'</div>'; }
function sumH(o,cl,yc){ return '<div class="sum">'+(o.rest?'<p class="sum-d sum-c">'+__R.featNums(richP(fill(o.rest)),cl)+'</p>':'')+'<div class="sum-ks">'+o.k.map((k) =>{ return html`<div class="sum-k">${rawHtml(sumLab(k))}<span class="sum-n">${k.n}${k.t ? html`<em class="sum-t">${k.t}</em>` : ''}</span></div>`; }).join("")+'</div>'+(o.r&&o.r.length?sumRows(o.r):'')+
  (o.o.length?'<div class="sum-o">'+o.o.map(sumChip).join("")+'</div>':'')+
  (o.m.length?'<div class="sum-m">'+o.m.map(sumFoot).join("")+'</div>':'')+(o.yc?'<p class="sum-d">'+__R.fch(richP(fill(o.yc)))+'</p>':'')+'</div>'; }
/* spell popup: the same blocks from spCalc and the spell row numbers */
export function spSum(x){ const sc=__R.scOf(x), rg=__R.spLvRange(x), lv=clamp(__R.spLvSel[x.n]!=null?__R.spLvSel[x.n]:__R.spRowLv(x),rg[0],rg[1]), c=__R.spCalc(x,lv,D.level,sc.mod), o={p:"",k:[],o:[],m:[]}, full=String(x.full||x.sum||"");
  o.p=/^Bonus/.test(x.ct)?"Bonus Action":/^Reaction/.test(x.ct)?"Reaction":/^Action/.test(x.ct)?"Action":"";
  if(x.sv==="ATK") o.k.push({l:"To hit",n:sg(sc.atk)}); else if(x.sv) o.k.push({l:"Save",n:x.sv+" "+sc.dc,ab:x.sv});
  if(c&&c.parts.length){ const p=c.parts[0], ty=String(p.t).split("|"); o.k.push({l:"Damage",n:(c.n>1?c.n+"× ":"")+p.d,t:ty.length>1?"choice":__R.dTxt(ty[0])}); }
  else if(c&&c.heal) o.k.push({l:"Heal",n:c.heal});
  if(!o.k.length) return "";
  if(x.sv&&x.sv!=="ATK"){ const cd=SUM_COND.filter((n) =>{ return new RegExp("\\b(has|have|gains?) the "+n+" condition|\\b"+n+" condition").test(full); })[0];
    if(c&&c.parts.length) o.o.push({f:1,t:"full damage"+(cd?", "+cd:"")}); else if(cd) o.o.push({f:1,t:cd});
    if(/half as much damage|half damage/i.test(full)) o.o.push({f:0,t:"half damage"}); }
  if(x.r) o.m.push(String(x.r).replace(/ ft$/," ft")); const fx=__R.spFx(x); if(fx&&fx.area) o.m.push(fx.area[0]+" "+__R.spAreaTxt(fx.area).replace(/\.$/,""));
  return html`<div class="sum-sp">${rawHtml(sumPill(o.p))}${rawHtml(sumH(o,""))}</div>`; }

export function aylH(a,cls){ return a?'<p class="fayl"><strong>At your level:</strong> '+__R.featNums(rich(fill(a)),cls)+'.</p>':""; }
function actKind(t){ if(/\bas a Bonus Action\b|^As a Bonus Action|\bBonus Action to\b|\bBonus Action\b,? (?:you|choose)/i.test(t)) return "bonus"; if(/\btake a Reaction\b|\bas a Reaction\b|\bReaction\b to /.test(t)) return "reaction"; if(/\bAs a Magic action\b|\bas a Magic action\b|\bAs an action\b/i.test(t)) return "action"; if(/\bOnce per turn when you hit\b|when you hit a creature/i.test(t)) return "action"; return ""; }
function actItem(x,chip){ const rl=__R.resOf(x.f.n), r=rl[0], cs=aylSplit(shortX(x.f.n,x.g)||x.f.d||x.t,__R.clsOfG(x.g)), so=fatkSum(x.f.n)||sumParse(cs.t);/* v35 p17, v36 p11 */
  return html`<div class="aitem"><h4><button type="button" class="tx" data-info="f:${x.gi}.${x.fi}">${x.f.n}</button>${so&&so.p ? rawHtml(sumPill(so.p)) : chip ? html` <span class="muted">(${rawHtml(chip)})</span>` : ''}${rawHtml(so&&r?__R.resPips(rl):'')}</h4>${rawHtml(so?sumH(so,__R.clsOfG(x.g))+aylH(cs.a,__R.clsOfG(x.g)):'')}${rawHtml(so?'':(function(){ return x.f.full?sumText(cs.t,__R.clsOfG(x.g))+aylH(cs.a,__R.clsOfG(x.g)):__R.foldP(richP(fill(cs.t)),"a:"+x.gi+"."+x.fi,cs.t,!!x.f.full||!!shortX(x.f.n,x.g))+aylH(cs.a,__R.clsOfG(x.g)); })())}${rawHtml(r?__R.resTail(rl,so):'')}</div>`; }
export function spellsBy(re){ return (C.spells||[]).map((x,i) =>{return [x,i]}).filter((p) =>{return re.test(p[0].ct)}); }
function spLine(ps){ return ps.length?'<h4 class="asub">Spells</h4><div class="aline">'+ps.map((p) =>{const x=p[0];return html`<button type="button" class="tx" data-info="sp:${p[1]}"><i>${x.n}</i></button>${x.conc ? html` <span class="ctag">C</span>` : ''}${x.rit ? html` <span class="ctag rit">R</span>` : ''} <small class="muted">(${rawHtml(x.l?__R.ordL(x.l).replace(" Level","").toUpperCase():"CANTRIP")})</small>`}).join("<br>")+'</div>':''; }
function combat(list){ if(x14()) list=list.filter((n) =>{ return n!=="Influence"&&n!=="Study"; }).map(x14n);/* v94: 2014 has no Influence or Study action */ const ln=list.map((n,i) =>{return html`<span class="acx">${GLOSS[n] ? html`<button type="button" class="tx" data-info="g:${n}">${rawHtml(n)}</button>` : rawHtml(n)}${rawHtml(i<list.length-1?',':'')}</span>`}).join(" ");/* v35 p09 *//* v31 C4: a long list folds */
  if(list.length<=3) return '<div class="acomb short"><h4 class="asub">'+__R.ico("act-free","aci")+'Actions in Combat</h4><div class="aline noico">'+ln+'</div></div>';
  const op=!!__R.FOPEN.combat; return '<div class="acomb'+(op?' open':'')+'"><button type="button" class="acomb-t press" data-fmore="combat" aria-expanded="'+op+'">'+__R.ico("act-free","aci")+'<span class="acw"><span class="asub">Actions in Combat</span><small>'+list.length+' actions anyone can take</small></span>'+__R.ico("ui-chev-d","fmi")+'</button><div class="aline noico"'+(op?'':' hidden')+'>'+ln+'</div></div>'; }
/* v32 RL51: actions from C.acts (feats, features, species, invocations, maneuvers, magic items). A feature named in its group's ak list uses only
   C.acts; other features (old sheets, hand-added ones) keep the old text rule. Attack rows with act "bonus" or "reaction" show in that part */
function actFeat(g,n){ let r=null; featAll().some((x) =>{ if(x.f.n===n&&(g==null||x.g===g)){ r=x; return true; } return false; }); return r; }
const CMAP={"Actions":"action","Bonus Actions":"bonus","Reactions":"reaction","Other":"other"};
/* v35 p18 (user decision, option A): an On Hit group under Actions. It holds effects used when an attack hits, with no action of their own.
   The book text decides: the first sentences name a hit as the trigger and no Bonus Action, Reaction, or Magic action cost */
const ONHIT_RX=/\b(after your attack roll[^.]{0,60}\bhits\b|after you hit\b|when(?:ever)? you hit\b|if you hit\b|(?:if|when|whenever|each time) (?:an|your|the|that) [^.]{0,90}?\bhits\b|the attack hits\b|whenever your Sneak Attack deals damage)/i;
const ONHIT_NO=/\b(?:take|takes|as|use|using) a (?:Bonus Action|Reaction|Magic action)\b|\bYou can take a Bonus Action\b|\bas part of the Attack action\b|\battack roll misses\b|\bmisses you\b/i;
function actHit(t){ const s=String(t||"").replace(/\*\*[^*]{1,60}\*\*\s*/g,"").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,a,b) =>{ return b||a; }), sen=s.split(/(?<=\.)\s+/), f2=sen.slice(0,2).join(" ");
  return ONHIT_RX.test(f2)&&!ONHIT_NO.test(sen[0]||""); }
/* short texts for maneuvers used on a hit (own words, PHB 2024). "(Superiority Die)" becomes the die for the Fighter level */
var MAN_SUM={"Paladin's Smite":"Bonus Action: right after you hit with a melee weapon or an Unarmed Strike, cast Divine Smite. Damage 2d8 Radiant. Add 1d8 against a Fiend or an Undead, and 1d8 per slot level above 1. Free once per Long Rest, then it needs a slot.","Bait and Switch":"Swap places with a willing creature within 5 ft (uses 5 ft of your movement, no Opportunity Attacks). Roll the die. You or that creature adds the result to AC until your next turn starts.","Commander's Strike":"Give up one attack in the Attack action. A willing ally that sees or hears you attacks once with its Reaction and adds the die to damage on a hit. Damage +(Superiority Die).","Feinting Attack":"Bonus Action: feint at a creature within 5 ft. Your next attack roll against it this turn has Advantage, and a hit adds the die to damage. Damage +(Superiority Die).","Lunging Attack":"Bonus Action: take the Dash action. This turn, a melee hit in the Attack action right after moving 5 ft or more in a straight line adds the die. Damage +(Superiority Die).","Rally":"Bonus Action: an ally within 30 ft that sees or hears you gains Temporary Hit Points equal to the die roll plus half your Fighter level (round down).","Riposte":"Reaction: when a creature misses you with a melee attack, strike back with a melee attack and add the die to damage on a hit. Damage +(Superiority Die).","Agonizing Blast":"Level 2+. Pick a Warlock damage cantrip you know. Add your Charisma modifier to its damage. Repeatable with a different cantrip.","Eldritch Smite":"Level 5+, Pact of the Blade. When your pact weapon hits, once per turn, expend a Pact Magic slot: +1d8 Force plus 1d8 per slot level. Huge or smaller: you can knock it Prone.","Eldritch Spear":"Level 2+. Pick a Warlock damage cantrip with range 10 ft or more. Add 30 ft of range per Warlock level. Repeatable with a different cantrip.","Fiendish Vigor":"Level 2+. Cast False Life on yourself with no slot. Skip the roll and take the highest Temporary Hit Points the die can give.","Gaze of Two Minds":"Level 5+. Bonus Action: touch a willing creature and perceive through its senses until the end of your next turn. Renew each turn with a Bonus Action. You gain its special senses. Within 60 ft you can cast spells from its space.","Gift of the Depths":"Level 5+. Your Speed is also your Swim Speed, and you breathe underwater. Cast Water Breathing once per Long Rest with no slot.","Gift of the Protectors":"Level 9+, Pact of the Tome. Creatures can sign your Book of Shadows page, up to your Charisma modifier (min 1). A signer dropped to 0 HP (not killed outright) stays at 1 HP. Once per Long Rest. A Magic action erases a name.","Investment of the Chain Master":"Level 5+, Pact of the Chain. Your Find Familiar familiar gets a 40 ft Fly or Swim Speed, a Bonus Action to command Attack, Necrotic or Radiant damage, your spell save DC, and a Reaction to give it Resistance to damage it takes.","Lessons of the First Ones":"Level 2+. Gain one Origin feat of your choice. Repeatable with a different feat.","Lifedrinker":"Level 9+, Pact of the Blade. When your pact weapon hits, once per turn: +1d6 Necrotic, Psychic, or Radiant. You can also spend a Hit Point Die and regain HP equal to the roll plus Constitution modifier (min 1).","Pact of the Blade":"Bonus Action: conjure a pact weapon (any Simple or Martial Melee weapon) or bond with a magic weapon. You are proficient with it, it is a Spellcasting Focus, and you can use Charisma for its attack and damage. Damage can be Necrotic, Psychic, or Radiant.","Pact of the Chain":"Know Find Familiar and cast it as a Magic action with no slot, with special forms such as Imp, Pseudodragon, Quasit, Sprite, or Venomous Snake. Give up one of your attacks so the familiar attacks with its Reaction.","Pact of the Tome":"After a Short or Long Rest, conjure a Book of Shadows with three cantrips and two level 1 Ritual spells from any class list. They are prepared Warlock spells for you. The book is your Spellcasting Focus.","Repelling Blast":"Level 2+. Pick a Warlock cantrip that needs an attack roll. When it hits a Large or smaller creature, push it up to 10 ft straight away from you. Repeatable with a different cantrip.","Thirsting Blade":"Level 5+, Pact of the Blade. Extra Attack with your pact weapon: two attacks per Attack action.","Careful Spell":"Cost: 1 Sorcery Point. When a spell forces saves, pick up to your Charisma modifier (min 1) creatures. They succeed automatically, and take no damage if they would take half on a success.","Empowered Spell":"Cost: 1 Sorcery Point. Reroll up to your Charisma modifier (min 1) of a spell's damage dice and use the new rolls. Works with another Metamagic option on the same spell.","Extended Spell":"Cost: 1 Sorcery Point. Double the duration of a spell that lasts 1 minute or longer, up to 24 hours. You have Advantage on saves to keep Concentration on it.","Quickened Spell":"Cost: 2 Sorcery Points. Cast a spell with an Action casting time as a Bonus Action. Not if you already cast a level 1+ spell this turn, and no level 1+ spell after it this turn.","Seeking Spell":"Cost: 1 Sorcery Point. Reroll a missed spell attack roll and use the new d20. Works with another Metamagic option on the same spell.","Subtle Spell":"Cost: 1 Sorcery Point. Cast a spell with no Verbal, Somatic, or Material components. Material components that are consumed or have a cost are still required.","Trip Attack":"Add the die to damage and try to knock the target down. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: Prone. Large or smaller. Weapon or Unarmed Strike.",
 "Pushing Attack":"Add the die to damage and drive the target back. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: pushed up to 15 ft away. Large or smaller. Weapon or Unarmed Strike.",
 "Disarming Attack":"Add the die to damage and try to disarm the target. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: drops one held object you choose.",
 "Goading Attack":"Add the die to damage and goad the target into attacking you until the end of your next turn. Damage +(Superiority Die). Target WIS save (DC 8 + PB + STR or DEX). Fail: Disadvantage vs others.",
 "Menacing Attack":"Add the die to damage and try to frighten the target. Damage +(Superiority Die). Target WIS save (DC 8 + PB + STR or DEX). Fail: Frightened until the end of your next turn.",
 "Distracting Strike":"Add the die to damage and leave the target open. Damage +(Superiority Die). The next attack roll by someone else against it before your next turn has Advantage.",
 "Maneuvering Attack":"Add the die to damage and move an ally. Damage +(Superiority Die). A willing ally who sees or hears you uses its Reaction to move up to half its Speed without provoking the target.",
 "Sweeping Attack":"Hit a second creature within your reach and 5 ft of the first target, if the original roll would hit it. Damage (Superiority Die), same damage type. Melee, weapon or Unarmed Strike."};

export function actSplit(feats){ const kinds={action:[],onhit:[],bonus:[],reaction:[],other:[]}, ak={}, ents=Array.isArray(C.acts)?C.acts:[];
  (C.features||[]).forEach((g) =>{ (Array.isArray(g.ak)?g.ak:[]).forEach((n) =>{ ak[g.g+"|"+n]=1; }); });
  feats.forEach((x) =>{ if(/^Background/.test(x.g)) return; const hasRes=__R.resOf(x.f.n).length>0;
    if(ak[x.g+"|"+x.f.n]){ const mine=ents.filter((e) =>{ return !e.it&&e.f===x.f.n&&e.g===x.g; }); mine.forEach((e) =>{ if(kinds[e.k]) kinds[e.k].push({e:e,x:x}); }); if(!mine.length&&hasRes) kinds.other.push({x:x}); return; }
    const hw=(C.actions||[]).filter((a) =>{ return a.n===x.f.n&&CMAP[a.c]; })[0]; if(hw){ kinds[CMAP[hw.c]].push({x:x}); return; }/* a hand-written entry of the same name sets the category */
    const k=actKind(x.t); if(k) kinds[k].push({x:x}); else if(hasRes) kinds.other.push({x:x}); });
  ents.forEach((e) =>{ if(!e.it||!kinds[e.k]) return; const i=eqInvOf(e.it); if(i&&!eqOn(i)) return; kinds[e.k].push({e:e}); });
  /* v35 p18: On Hit. Effects already listed under Action or Other move when their text says a hit triggers them; class, subclass, species and
     feat features with no group yet join when the text says the same */
  ["action","other"].forEach((k) =>{ kinds[k]=kinds[k].filter((o) =>{ if(o.e&&o.e.it) return true; const t=o.e?(o.e.d!=null?o.e.d:(o.x?o.x.t:"")):o.x.t; if(actHit(t)){ kinds.onhit.push(o); return false; } return true; }); });
  const seen={}; ["action","onhit","bonus","reaction","other"].forEach((k) =>{ kinds[k].forEach((o) =>{ if(o.x) seen[o.x.gi+"."+o.x.fi]=1; }); });
  feats.forEach((x) =>{ if(/^Background/.test(x.g)||seen[x.gi+"."+x.fi]||ak[x.g+"|"+x.f.n]) return; if(actHit(x.t)) kinds.onhit.push({x:x}); });
  return kinds; }
function actEnt(e,x,chip){ const rl=__R.resOf(e.it?e.n:e.f); if(e.u) __R.resOf(e.u).forEach((r) =>{ if(!rl.some((q) =>{ return q.k===r.k; })) rl.push(r); });
  if(e.it){ const ix=(C.inv||[]).findIndex((i) =>{ return (i.key||i.n)===e.it; });
    return html`<div class="aitem" data-act="${e.k}"><h4>${ix>=0 ? html`<button type="button" class="tx" data-info="it:${ix}">${e.n}</button>` : rawHtml(esc(e.n))} <span class="muted">(Magic item)</span></h4>${rawHtml(e.d?__R.foldP(rich(fill(e.d)),"ai:"+e.k+":"+e.n,e.d):'')}${rawHtml(rl.length?__R.resBoxes(rl):'')}</div>`; }
  let t=e.d!=null?e.d:(x?(x.f.d||x.t):""), same=e.n===e.f, ay="", sx=0; if(e.d==null&&x){ const cs=aylSplit(t,__R.clsOfG(x.g)); t=cs.t; ay=aylH(cs.a,__R.clsOfG(x.g)); }/* v35 p15 */ let so=(e.d==null&&x)?sumParse(t):null;/* v35 p17 */ if(x&&(e.f==="Maneuvers known"||shortX(e.n,x.g))&&MAN_SUM[e.n]){ t=aylSplit(MAN_SUM[e.n],__R.clsOfG(x.g)).t; so=sumParse(t); sx=1; }/* v35 p18 */ if(x&&FATK[e.n]) so=fatkSum(e.n);/* v36 p11 */
  return html`<div class="aitem" data-act="${e.k}"><h4>${x ? html`<button type="button" class="tx" data-info="f:${x.gi}.${x.fi}">${e.n}</button>` : rawHtml(esc(e.n))}${!same ? e.f==="Maneuvers known" ? '' : html` <span class="muted">(${e.f})</span>` : chip&&!(so&&so.p) ? html` <span class="muted">(${rawHtml(chip)})</span>` : ''}${rawHtml(sumPill(so&&so.p))}${rawHtml(so&&rl.length&&e.f!=="Maneuvers known"?__R.resPips(rl):'')}</h4>${rawHtml(so?sumH(so,__R.clsOfG(x.g)):(e.d==null&&x&&x.f.full)?sumText(t,__R.clsOfG(x.g)):__R.foldP(richP(fill(t)),same&&x?"a:"+x.gi+"."+x.fi:"ae:"+e.f+":"+e.n,t,!!(sx||(e.d==null&&x&&x.f.full))))}${rawHtml(ay)}${rawHtml(e.f==="Maneuvers known"&&rl.length?__R.manCost(rl):(rl.length?__R.resTail(rl,so):''))}</div>`; }
export function actOne(o,chip){ return o.e?actEnt(o.e,o.x,chip):actItem(o.x,chip); }
/* hand-written C.actions entries of a category (the editor offers all four). Entries that repeat a feature, the Opportunity Attack line, or the spell list are left out */
const ACT_STD=["Attack","Dash","Disengage","Dodge","Grapple","Help","Hide","Improvise","Influence","Magic","Ready","Search","Shove","Study","Utilize","Opportunity Attack","Two-Weapon Fighting","Interact with an Object"];
function actStdList(a){ const p=String(a.n||"").split(/\s*,\s*/); return p.length>1&&p.every((x) =>{ return ACT_STD.indexOf(x)>=0; }); }/* v35 p09: shown in Actions in Combat */
function actPlain(c,feats){ return (C.actions||[]).filter((a) =>{ return (a.c||"")===c&&actOn(a)&&!actStdList(a)&&!feats.some((x) =>{return x.f.n===a.n})&&!(c==="Reactions"&&a.n==="Opportunity Attack")&&!(a.n==="Spells"&&/casting time$/.test(a.t||"")); }).map((a) =>{return html`<div class="aitem"><h4>${a.n}</h4>${rawHtml(__R.foldP(rich(fill(a.d)),"c:"+a.n,a.d))}</div>`}).join(""); }
export function renderActions(){
  const feats=featAll(), kinds=actSplit(feats);
  let apa=1; feats.forEach((x) =>{ if(x.f.n==="Extra Attack") apa=Math.max(apa,2); if(x.f.n==="Two Extra Attacks") apa=Math.max(apa,3); if(x.f.n==="Three Extra Attacks") apa=Math.max(apa,4); if(x.f.n==="Extra Attack (2)") apa=Math.max(apa,3); if(x.f.n==="Extra Attack (3)") apa=Math.max(apa,4); if(x.f.n==="Thirsting Blade") apa=Math.max(apa,2); if(x.f.n==="Devouring Blade") apa=Math.max(apa,3); });
  const aprIco=function(t){ return __R.ico(/Ammunition/i.test(t)?"item-ammo":/Two-Handed|Versatile/i.test(t)?"ui-hand":/Reach|Thrown/i.test(t)?"ui-range":/Heavy/i.test(t)?"ui-weight":/Bonus Action/i.test(t)?"time-bonus":/Loading/i.test(t)?"ui-pause":/Finesse|Light/i.test(t)?"item-weapon":"ui-info","apr-i"); };/* v36 p12 */
  const aprChips=function(a){ const L=String(a.sub||"").split(/\s*[,\u2022]\s*/).filter(Boolean).map((t) =>{ return html`<span class="apc">${rawHtml(aprIco(t))}<span>${t}</span></span>`; }); if(a.m) L.push(html`<span class="apc ap-m">${rawHtml(__R.ico("item-weapon","apr-i"))}<span>Mastery: ${a.m}</span></span>`); const amq=__R.ammoBonus(a); if(amq) L.push(amq.on ? html`<span class="apc ap-m"><span>${rawHtml(sg(amq.on.n))} ammo</span></span>` : (S.ammoAct||{})[amq.kd]==="none" ? html`<span class="apc"><span>No magic ammo</span></span>` : html`<span class="apc ap-w"><span>Pick ammo</span></span>`);/* v102 */ return L.length ? html`<span class="apr">${rawHtml(L.join(""))}</span>` : ""; };
  const atkRow=function(a,i){ const d=D.atk[i];
    return html`<div class="arow"${a.act?' data-act="'+esc(a.act)+'"':''}><div class="an">${rawHtml(__R.akIcon(__R.atkKind(a)))}<button type="button" class="tx" data-info="w:${i}">${__R.cuNm("a:"+a.n,a.n)}</button>${rawHtml(aprChips(a))}${rawHtml(__R.cfFlags(__R.sitAtk(a)))}<span class="arng">${rawHtml(__R.ico("ui-range","apr-i"))}${a.range||"--"}</span></div><button type="button" class="abox bd" data-bd="ah-${i}">${rawHtml(sg(d.hit))}</button><button type="button" class="abox wide bd" data-bd="ad-${i}">${d.dmg}<small>${rawHtml(__R.tyIcon(a.type))}${a.type||""}</small></button></div>`; };
  const rowsOf=function(act){ return (C.attacks||[]).map((a,i) =>{ if(!atkOn(a)) return ""; if(act!=="*"&&(a.act||"")!==act) return ""; return atkRow(a,i); }).join(""); };
  const AH='<div class="ahead"><span>Range</span><span>Hit/DC</span><span>Damage</span></div>';
  const rows=rowsOf(actF==="attack"?"*":"")+
    (C.xdmg||[]).map((x,i) =>{ return html`<div class="arow xd"><div class="an">${rawHtml(__R.akIcon("feature"))}<button type="button" class="tx" data-info="xd:${i}">${String(x.n).replace(/ \([^)]*\)$/,"")}</button>${/ \([^)]*\)$/.test(x.n) ? html`<span class="muted anp">${/ (\([^)]*\))$/.exec(x.n)[1]}</span>` : ''}<small>${String(x.sub||"").toUpperCase().slice(0,40)}</small><span class="arng">--</span></div><span class="abox">${x.save ? html`${x.save}<small>${rawHtml(x.dc)}</small>` : '--'}</span><span class="abox wide">${x.dmg}${rawHtml(__R.tyIcon(x.type))}<small>${x.type}</small></span></div>`; }).join("");/* RU35 no. 5 */
  const tabs='<div class="ifil">'+[["all","All"],["attack","Attack"],["action","Action"],["onhit","On Hit"],["bonus","Bonus Action"],["reaction","Reaction"],["other","Other"],["limited","Limited Use"]].map((f) =>{return html`<button type="button" class="ifb${actF===f[0]?' on':''}" data-actf="${f[0]}">${rawHtml(f[1])}</button>`}).join("")+'</div>';
  const show=function(k){return actF==="all"||actF===k};
  let h=tabs, bRows=rowsOf("bonus"), rRows=rowsOf("reaction");
  h+=__R.noActH();/* v22 RU53 */
  if(show("attack")||show("action")) h+=__R.sitCardH();/* v103 */
  if(show("attack")||show("action")) h+='<h3 class="fcat">Actions <span class="apa">• Attacks per Action: '+apa+'</span></h3>'+AH+rows+__R.saveCantripRows()+__R.modeXdRows()+__R.sitDiceRows();/* v22 RU43, RU56 */
  if(show("action")) h+=combat(["Attack","Dash","Disengage","Dodge","Grapple","Help","Hide","Improvise","Influence","Magic","Ready","Search","Shove","Study","Utilize"])+kinds.action.map((o) =>{return actOne(o,"")}).join("")+actPlain("Actions",feats);
  if(show("onhit")&&kinds.onhit.length) h+='<h3 class="fcat fcat-onhit">On Hit</h3><div class="aonhit">'+kinds.onhit.map((o) =>{return actOne(o,"")}).join("")+'</div>';/* v35 p18 */
  if(show("bonus")) h+='<h3 class="fcat">Bonus Actions</h3>'+(bRows?AH+bRows:'')+((C.attacks||[]).some((a) =>{return atkOn(a)&&/Light/.test(a.sub||"")})?combat(["Two-Weapon Fighting"]):'')+spLine(spellsBy(/^Bonus/))+kinds.bonus.map((o) =>{return actOne(o,"1 Bonus Action")}).join("")+actPlain("Bonus Actions",feats);
  if(show("reaction")) h+='<h3 class="fcat">Reactions</h3>'+(rRows?AH+rRows:'')+combat(["Opportunity Attack"])+spLine(spellsBy(/^Reaction/))+kinds.reaction.map((o) =>{return actOne(o,"1 Reaction")}).join("")+actPlain("Reactions",feats);
  if(show("other")) h+='<h3 class="fcat">Other</h3>'+combat(["Interact with an Object"])+spLine(spellsBy(/minute|hour|Ritual/i))+kinds.other.map((o) =>{return actOne(o,"Special")}).join("")+actPlain("Other",feats);
  if(show("limited")||actF==="all") h+=(D.res.length?'<h3 class="fcat">Limited Use</h3><div class="lu" id="lu">'+D.res.map((r) =>{ const rsp=__R.resSpec(r); return html`<div class="rs"><div class="rs-h"><b>${rsp ? html`<button type="button" class="tx" data-info="${rsp}">${r.n}</button>` : rawHtml(esc(r.n))}</b><span>${r.tag}</span></div><div class="boxes">${rawHtml(boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool))}</div><div class="sub" id="sub-${r.k}">${rawHtml(luSub(r))}</div></div>`; }).join("")+'</div><div class="rests"><button class="btn press" type="button" data-rest="short">Short Rest</button><button class="btn press" type="button" data-rest="long">Long Rest</button></div>':'');
  drawHtml(rawHtml(h), $("#actBody"));
}
export function syncLU(){
  D.res.forEach((r) =>{
    /* RU39: each box knows its own position (data-i). #lu sits inside #actBody, so a running index over the three areas was wrong */
    $$('#lu .bx[data-k="'+r.k+'"], #featBody .bx[data-k="'+r.k+'"], #actBody .bx[data-k="'+r.k+'"], #spBody .bx[data-k="'+r.k+'"], #sheetBody .bx[data-k="'+r.k+'"]').forEach((b) =>{ b.setAttribute("aria-pressed", (+b.getAttribute("data-i"))<used(r.k,r.max)); });
    const el=document.getElementById("sub-"+r.k); if(el) el.textContent=luSub(r); $$('.supd[data-k="'+r.k+'"] b').forEach((b) =>{ b.textContent=r.max-used(r.k,r.max); });/* v36 p10 */
    if(r.pool) $$('.pli[data-k="'+r.k+'"]').forEach((x) =>{ if(document.activeElement!==x) x.value=r.max-used(r.k,r.max); });
  });
}
export var invF="all";
export function renderInv(){
  (C.inv||[]).forEach((i) =>{ if(i.type==null&&window.__itemMeta){ const mt=window.__itemMeta(i.n); if(mt){ i.type=mt.type; if(i.cost==null) i.cost=mt.cost; i.equippable=mt.equippable; i.html=i.html||mt.html; if(mt.att) i.att=1; if(mt.equippable) i.gear=1; } else i.type="Gear"; } });
  /* RU35 no. 8: weight counts container rules (a magic container weighs the same full or empty) */
  const L=C.inv||[], total=__R.invWeight(), enc=__R.setOf("enc")==="off"?"WEIGHT NOT TRACKED":total>D.carry?"ENCUMBERED":"UNENCUMBERED", cz=__R.coinsNow();
  const head='<div class="ihero"><div class="iwt" role="button" tabindex="0" data-info="g:Carrying Capacity" aria-description="Opens Carrying Capacity"><b>'+fmtW(total)+'</b> <small>lb.</small> <span>'+enc+'</span></div>'+__R.coinStrip(cz)+'<button type="button" class="ibtn ibshop" data-invshop="1">'+__R.ico("coin-gp","ibt")+'Shop: Add or Buy Gear</button>'+(L.length?'<button type="button" class="ibtn" data-invman="1">'+__R.ico("tab-inventory","ibt")+'Manage Inventory</button>':'')+'</div>';/* v31 RU123, C6 */
  let fil='<div class="ifil">'+[["all","All"],["equip","Equipment"],["att","Attunement"],["other","Other Possessions"]].map((f) =>{return html`<button type="button" class="ifb${invF===f[0]?' on':''}" data-invf="${f[0]}">${rawHtml(f[1])}</button>`}).join('')+'</div>';
  const keep=function(i){ if(invF==="equip")return i.gear; if(invF==="att")return i.att; if(invF==="other")return !(i.gear||i.att); return true; };
  const row=function(i,ix,sub){ const q=num(i.q,1), w=num(i.w,0), rc=i.rar?' r-'+i.rar.toLowerCase().replace(/\s+/g,''):'', ct=__R.ctOf(i.n), ww=ct&&ct[2]!=null?ct[2]:w;
    return '<div class="irow'+(sub?' isub':'')+'"><span class="iact">'+(i.equippable?'<button type="button" class="ichk'+(eqOn(i)?' on':'')+'" data-ieqs="'+esc(i.key||i.n)+'" data-iix="'+ix+'" aria-label="Toggle '+esc(i.n)+'"></button>':'<span class="muted">--</span>')+'</span><button type="button" class="iname" data-info="it:'+ix+'"><b class="'+rc+'">'+(window.__artIc?window.__artIc("item",i.n):"")+esc(__R.cuNm("i:"+__R.invKey(i),i.n))+'</b><small>'+esc((i.type||"Gear").toUpperCase())+(i.rar?' \u2022 '+esc(i.rar.toUpperCase()):'')+(ct?' \u2022 CONTAINER':'')+'</small><span>'+(ww?fmtW(ww)+' lb.':'--')+'</span></button><span class="iq">'+q+'</span><span class="ic">'+(i.cost!=null?i.cost:'--')+'</span></div>'; };
  const byK={}; L.forEach((i) =>{ byK[__R.invKey(i)]=i; });
  const inCt=function(i){ const p=i.in&&byK[i.in]; return p&&p!==i&&__R.ctOf(p.n)?p:null; };
  const att=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return p[0].att&&eqOn(p[0]); }), need=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return p[0].att&&!eqOn(p[0]); });
  let attH="";
  if(L.some((i) =>{return i.att})&&(invF==="all"||invF==="att")){
    const aM=attMaxC(); attH='<div class="ieq"><b>Attuned Items</b><span>'+Math.min(aM,att.length)+'/'+aM+'</span></div><div class="islots">'+[0,1,2,3].slice(0,aM).map((n) =>{ const p=att[n]; return p ? html`<button type="button" class="islot on" data-info="it:${p[1]}"><b>${p[0].n}</b></button>` : html`<span class="islot">Empty slot</span>`; }).join("")+'</div>'+
      (att.length>aM?'<div class="caution">\u26a0 You are attuned to more than '+aM+' magic items. Only the first '+aM+' in the list work. Unattune the others.</div>':'');
    if(invF==="att") attH+='<div class="ieq"><b>Items Requiring Attunement</b><span>'+need.length+'</span></div>'+(need.length?'<div class="ihead"><span></span><span>Weight</span><span>Qty</span><span>Cost (GP)</span></div>'+need.map((p) =>{return row(p[0],p[1])}).join(""):'<p class="muted dnone">Every item that needs attunement is attuned.</p>');
  }
  let body="";
  if(invF!=="att"){
    const main=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return !inCt(p[0])&&keep(p[0]); });
    body='<div class="ieq"><b>Equipment ('+L.filter((i) =>{return !inCt(i)}).length+')</b><span>'+fmtW(L.filter((i) =>{return !inCt(i)}).reduce((t,i) =>{return t+__R.itemW(i)},0))+' lb.</span></div><div class="ihead"><span></span><span>Weight</span><span>Qty</span><span>Cost (GP)</span></div>'+main.map((p) =>{return row(p[0],p[1])}).join("");
    L.forEach((c,cx) =>{ const ct=__R.ctOf(c.n); if(!ct) return; const inner=L.map((i,ix) =>{return [i,ix]}).filter((p) =>{ return inCt(p[0])===c; }); if(!inner.length) return;
      const ld=__R.ctLoad(c), cap=__R.ctCap(c,ct), sh=inner.filter((p) =>{return keep(p[0])});
      const ck=__R.invKey(c), op=!__R.ctShut[ck];/* v32 RU134: a container section opens and closes */
      body+='<button type="button" class="ieq ict" data-ctog="'+esc(ck)+'" aria-expanded="'+op+'" aria-label="'+esc(__R.cuNm("i:"+ck,c.n))+', '+inner.length+' item'+(inner.length>1?'s':'')+', '+(op?'close':'open')+'"><b>'+esc(__R.cuNm("i:"+ck,c.n))+'</b><span class="ictn">'+inner.length+' item'+(inner.length>1?'s':'')+'</span><span class="ictw'+(cap&&ld>cap?' over':'')+'">'+fmtW(ld)+(cap?' / '+cap:'')+' lb.'+(ct[2]!=null?' \u2022 counts as '+fmtW(ct[2])+' lb.':'')+'</span>'+CHEV+'</button>'+(cap&&ld>cap?'<div class="caution">\u26a0 Over capacity. This container holds up to '+cap+' lb.</div>':'')+(op?sh.map((p) =>{return row(p[0],p[1],1)}).join(""):''); });
  }
  if(!L.length){ fil=""; attH=""; body='<div class="empty-note empty-st">'+esArt("chest")+'<b>No items yet</b><span>Buy or add weapons, armor, and gear. Your coins stay above.</span><button type="button" class="btn pri press" data-invman="1">'+__R.ico("tab-inventory","ibt")+'Manage Inventory</button></div>'; }/* v31 C6 */
  drawHtml(rawHtml(head+fil+attH+body+(C.equipNote?'<p class="next inote">'+__R.ico("item-gear")+'<span>'+esc(C.equipNote).replace(/\. (?=[A-Z])/g,".<br>")+'</span></p>':'')), $("#invBody"))/* v33 p05 (F2) */;
}
export var CHEV='<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
export var featQ="",featF="all";
function featCat(g){ if(/^Species/.test(g)) return "species"; if(/^Feats/.test(g)) return "feats"; if(/^Background/.test(g)) return "bg"; return "class"; }
function actChip(t){ return /\bBonus Action\b/.test(t)?"1 Bonus Action":/\bReaction\b/.test(t)?"1 Reaction":/\bMagic action\b|\bas an action\b|\bUtilize action\b/i.test(t)?"1 Action":""; }
export function renderFeat(){
  const q=featQ.toLowerCase(), groups=(C.features||[]);
  const head='<div class="fsearch"><input id="featQ" type="search" placeholder="Search in Features" value="'+esc(featQ)+'"></div><div class="ifil">'+[["all","All"],["class","Class Features"],["species","Species Traits"],["feats","Feats"],["bg","Background"]].map((f) =>{return html`<button type="button" class="ifb${featF===f[0]?' on':''}" data-featf="${f[0]}">${rawHtml(f[1])}</button>`}).join("")+'</div>';
  let order=[["class","Class Features"],["species","Species Traits"],["feats","Feats"],["bg","Background"]], h="";
  order.forEach((o) =>{
    if(featF!=="all"&&featF!==o[0]) return;
    const body=groups.map((g,gi) =>{ if(featCat(g.g)!==o[0]) return "";
      const items=(g.items||[]).map((f,fi) =>{
        const txt=f.full||f.d||"", hay=(f.n+" "+(f.d||"")+" "+(f.full||"")).toLowerCase(); if(q&&hay.indexOf(q)<0) return ""; const cs=aylSplit(shortX(f.n,g.g)||f.d||f.full||"",__R.clsOfG(g.g)), so=q?null:sumParse(cs.t);/* v35 p15, p17 */
        const rl=__R.resOf(f.n), r=rl[0], chip=actChip(txt);
        const from=(/^Feats/.test(g.g)&&f.s)?'<div class="ffrom">From <b>'+esc((f.s.match(/\(([^)]+)\)\s*$/)||[0,f.s])[1].replace(/,? ?Versatile/,""))+'</b> <span class="fsrc">\u2022 '+esc(__R.srcPg(f.s.split(",")[0],__R.pgGuess(g,f)))+'</span></div>':'';
        return html`<div class="fitem"><h4><button type="button" class="tx" data-info="f:${gi}.${fi}">${f.n}</button>${from ? '' : html`<span class="fsrc"> • ${__R.srcPg(f.s,__R.pgGuess(g,f))}</span>`}${rawHtml(sumPill(so&&so.p))}</h4>${rawHtml(from)}${rawHtml(so?sumH(so,__R.clsOfG(g.g)):f.full&&!q?sumText(cs.t,__R.clsOfG(g.g)):__R.foldP(__R.fch(__R.featNums(richP(fill(cs.t)),__R.clsOfG(g.g))),"f:"+gi+"."+fi,cs.t,!!q||!!f.full||!!shortX(f.n,g.g)))}${rawHtml(aylH(cs.a,__R.clsOfG(g.g)))}${rawHtml(__R.featSpL(g,f))}${chip||r ? html`<div class="fsub">${chip ? html`<div><b>${f.n}</b> <span class="muted">(${rawHtml(chip)})</span></div>` : ''}${rawHtml(r?__R.resBoxes(rl):'')}</div>` : ''}</div>`;
      }).join("");
      if(!items) return "";
      if(g.g==="Eldritch Invocations") return html`<div class="fnest">${rawHtml(items)}</div>`;
      return (o[0]==="class"?'<h3 class="fgh">'+esc(gName(g.g))+'</h3>':'')+items;
    }).join("");
    if(body) h+='<h3 class="fcat">'+o[1]+(o[0]==="feats"&&C.cls?'<button type="button" class="btn press fmanb" data-bldgo="class">Manage Feats</button>':'')+'</h3>'+body;/* v23 RU38 no. 4 */
  });
  if(!h) h='<p class="empty-note">No features match your search.</p>';
  drawHtml(rawHtml(head+h), $("#featBody"));
}
export function renderNotes(){/* v23 RU36 no. 9, RU38 no. 5: Notes like D&D Beyond. Background and Characteristics are on the Description tab */
  const nf=function(k){ return NOTE_FIELDS.filter((f) =>{ return f.k===k; })[0]; };
  let html='<h3 class="noteh">Notes</h3><div class="nsecs">'+__R.NOTE_MORE.map(__R.noteSec).join("")+__R.noteSec(nf("backstory"))+__R.noteSec({k:"other",l:"Other",h:"Anything else worth keeping",rows:3})+__R.noteSec(nf("session"))+'</div>';/* v31 B9 */
  html += __R.jrnH();/* v22 RU70 */
  html += '<div class="saved">Saved on this device as you type.</div>';
  drawHtml(rawHtml(html), $("#notesBody")); __R.renderDesc();
}
/* T3 item 17: small original illustrations for empty states. Lines in the muted color, sparks in the accent color. Drawn once, no image files */
export function esArt(k){ const V={chest:"items",book:"spells",paw:"creatures",hero:"characters"}[k], R=window.__ART&&window.__ART.vig&&window.__ART.vig.empty;
  if(V&&R&&R.indexOf(V)>=0&&(function(){try{return __store.getItem("mi-clsart")!=="off"}catch(e){return true}})()) return html`<img class="es-art es-img" src="img/vig/empty/${V}.avif" width="128" height="128" alt="" decoding="async" loading="lazy">`;
  const A={
  chest:'<path d="M18 46h60v28a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z"/><path d="M18 46V38a14 14 0 0 1 14-14h32a14 14 0 0 1 14 14v8"/><path d="M18 56h60"/><rect x="42" y="50" width="12" height="14" rx="2"/><circle cx="48" cy="57" r="1.6" class="es-f"/>',
  book:'<path d="M48 30c-8-6-20-7-30-4v40c10-3 22-2 30 4 8-6 20-7 30-4V26c-10-3-22-2-30 4z"/><path d="M48 30v40"/><path d="M26 38c6-1 11 0 16 2M26 48c6-1 11 0 16 2M54 40c5-2 10-3 16-2M54 50c5-2 10-3 16-2"/>',
  paw:'<ellipse cx="48" cy="62" rx="15" ry="12"/><ellipse cx="29" cy="46" rx="6" ry="8" transform="rotate(-18 29 46)"/><ellipse cx="42" cy="34" rx="6" ry="8.5" transform="rotate(-6 42 34)"/><ellipse cx="55" cy="34" rx="6" ry="8.5" transform="rotate(6 55 34)"/><ellipse cx="68" cy="46" rx="6" ry="8" transform="rotate(18 68 46)"/>',
  hero:'<path d="M48 14 22 24v22c0 17 11 29 26 36 15-7 26-19 26-36V24z"/><path d="M48 36v24M36 48h24"/>'}[k]||"";
  const sp='<path class="es-sp" d="M80 16v10M75 21h10M16 70v8M12 74h8"/>';
  return html`<svg class="es-art es-${k}" viewBox="0 0 96 96" width="96" height="96" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${rawHtml(A)}${rawHtml(sp)}</svg>`; }

export function __set_renderAbilities(v){ return renderAbilities=v; }
export function __set_renderTiles(v){ return renderTiles=v; }
export function __set_renderSkillsPage(v){ return renderSkillsPage=v; }
export function __set_actF(v){ return actF=v; }
export function __set_renderActions(v){ return renderActions=v; }
export function __set_invF(v){ return invF=v; }
export function __set_renderInv(v){ return renderInv=v; }
export function __set_featQ(v){ return featQ=v; }
export function __set_featF(v){ return featF=v; }
export function __set_renderFeat(v){ return renderFeat=v; }
export function __set_renderNotes(v){ return renderNotes=v; }
