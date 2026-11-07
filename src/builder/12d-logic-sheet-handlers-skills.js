import {ABK,mod} from "./01-logic-core-helpers.js";
import {allSkillNames,featDef,skillAb,subGrantRow} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
/* Sheet handlers, part 2 (contract in 12a-logic-sheet-registry.js): skill proficiencies and bonuses (phase "skills"), languages (phase "lang").
   l.prof {skill: source text}, l.exp {skill: source of Expertise}, l.pplus [[skill, entry]] (skillProfPlus: +1 when already proficient), l.lg [language]. */
defineLocals({prof:"object",exp:"object",pplus:"array",lg:"array"});
/* a skill proficiency is kept once, the first source wins */
function addProf(prof,n,s){if(n&&!prof[n])prof[n]=s}
/* a bonus to the misc column of a skill row, with its source text */
function addMisc(s,v,txt){s.misc=(s.misc||0)+v;s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+txt}
registerSheetGroup({id:"skills-init",group:"skills",phase:"skills",order:5,reads:[],writes:["l.prof","l.exp","l.pplus"],run:function(ctx){ctx.l.prof={};ctx.l.exp={};ctx.l.pplus=[];return ctx.patch()}});
registerSheetGroup({id:"skill-background",group:"skills",phase:"skills",order:10,reads:["i.B","i.bg","i.SRC"],writes:["l.prof"],
 run:function(ctx){const I=ctx.i,prof=ctx.l.prof;if(I.bg)I.bg.sk.forEach((n) =>{addProf(prof,n,I.B.bg+" background ("+I.SRC+")")});return ctx.patch()}});
/* picks of type skills (and exp: Expertise only) */
registerSheetGroup({id:"skill-choices",group:"skills",phase:"skills",order:20,reads:["i.B","i.CH"],writes:["l.prof","l.exp"],
 run:function(ctx){const B=ctx.i.B,prof=ctx.l.prof,exp=ctx.l.exp;ctx.i.CH.forEach((ch) =>{const v=B.ch[ch.key];if(ch.t==="skills"&&Array.isArray(v))v.forEach((n) =>{addProf(prof,n,ch.title+", "+ch.src);if(ch.ex)exp[n]=ch.feature+" ("+ch.src+")"/* v63 */});if(ch.t==="exp"&&Array.isArray(v))v.forEach((n) =>{exp[n]=ch.src})});return ctx.patch()}});
registerSheetGroup({id:"skill-subgrant",group:"skills",phase:"skills",order:30,reads:["i.B","i.L","i.SG"],writes:["l.prof"],
 run:function(ctx){const I=ctx.i,SG=I.SG,prof=ctx.l.prof;if(SG&&SG.skills)SG.skills.forEach((q) =>{if(I.L>=q[0])addProf(prof,q[1],I.B.sub+" "+q[0])});return ctx.patch()}});
registerSheetGroup({id:"skill-species",group:"skills",phase:"skills",order:40,reads:["i.B","i.sp","i.SRC"],writes:["l.prof"],
 run:function(ctx){const I=ctx.i,sp=I.sp,prof=ctx.l.prof;if(sp&&sp.skills)sp.skills.forEach((n) =>{addProf(prof,n,I.B.species+" ("+(sp.hb||I.SRC)+")")});return ctx.patch()}});
/* v32 RL49: Keen Mind, Observant: proficiency, or Expertise when you have it already */
registerSheetGroup({id:"skill-pe-choices",group:"skills",phase:"skills",order:50,reads:["i.B","i.CH"],writes:["l.prof","l.exp"],
 run:function(ctx){const B=ctx.i.B,prof=ctx.l.prof,exp=ctx.l.exp;ctx.i.CH.forEach((ch) =>{const v=B.ch[ch.key];if(ch.t==="pe"&&Array.isArray(v))v.forEach((n) =>{if(prof[n])exp[n]=ch.feature+" ("+ch.src+")";else addProf(prof,n,ch.title+", "+ch.src)})});return ctx.patch()}});
/* Boon of Skill: every skill */
registerSheetGroup({id:"skill-feat-all",group:"skills",phase:"skills",order:60,reads:["i.feats"],writes:["l.prof"],
 run:function(ctx){const prof=ctx.l.prof;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.allSk)allSkillNames().forEach((n) =>{addProf(prof,n,f.n+" ("+f.s+")")})});return ctx.patch()}});
/* v62: FEATS[].fx.skills and exp, and the same of third party subclasses */
registerSheetGroup({id:"skill-feat-fx",group:"skills",phase:"skills",order:70,reads:["i.feats","q.xfxSkills"],writes:["l.prof","l.exp"],
 run:function(ctx){const prof=ctx.l.prof,exp=ctx.l.exp;ctx.q.xfxSkills(ctx.i.feats,function(n,s){addProf(prof,n,s)},prof,exp);return ctx.patch()}});
/* fx engine v2: skillProf */
registerSheetGroup({id:"fx-skill-prof",group:"skills",phase:"skills",order:80,reads:["i.G"],writes:["l.prof"],
 run:function(ctx){const prof=ctx.l.prof;ctx.i.G.forEach((e) =>{(e.skillProf||[]).forEach((n) =>{addProf(prof,n,e.lbl)})});return ctx.patch()}});
/* v32: subclass skill grants of every class part */
registerSheetGroup({id:"skill-subgrant-parts",group:"skills",phase:"skills",order:90,reads:["i.parts"],writes:["l.prof"],
 run:function(ctx){const prof=ctx.l.prof;ctx.i.parts.forEach((q) =>{const g=subGrantRow(q.sub);if(g&&g.skills)g.skills.forEach((s) =>{if(q.lv>=s[0])addProf(prof,s[1],g.f+" ("+q.sub+" "+s[0]+")")})});return ctx.patch()}});
/* fx engine v2: Expertise needs the proficiency. skillPE = proficiency, or Expertise when already proficient (Red Sisterhood, Strigoi). skillProfPlus = proficiency, or +1 to checks (Ioun stones) */
registerSheetGroup({id:"fx-skill-expert",group:"skills",phase:"skills",order:100,reads:["i.G"],writes:["l.prof","l.exp","l.pplus"],
 run:function(ctx){const prof=ctx.l.prof,exp=ctx.l.exp,pplus=ctx.l.pplus,G=ctx.i.G;
  G.forEach((e) =>{(e.skillExpert||[]).forEach((n) =>{if(prof[n])exp[n]=e.lbl})});
  G.forEach((e) =>{(e.skillPE||[]).forEach((n) =>{if(prof[n])exp[n]=e.lbl;else addProf(prof,n,e.lbl)})});
  G.forEach((e) =>{(e.skillProfPlus||[]).forEach((n) =>{if(prof[n])pplus.push([n,e]);else addProf(prof,n,e.lbl)})});return ctx.patch()}});
/* the 18 core skill rows, then the skills of homebrew packs */
registerSheetGroup({id:"skill-rows",group:"skills",phase:"skills",order:110,reads:["i.packSkills","l.prof","l.exp"],writes:["C.skills"],
 run:function(ctx){const prof=ctx.l.prof,exp=ctx.l.exp,C=ctx.C;
  allSkillNames().forEach((n) =>{const o={n:n,ab:skillAb(n)};if(prof[n]){o.p=1;o.src=prof[n]}if(exp[n]){o.p=2;o.src=(prof[n]||"")+"; Expertise from "+exp[n]}C.skills.push(o)});
  ctx.i.packSkills.forEach((s) =>{const o={n:s.n,ab:s.ab,hb:1};if(s.d)o.hbd=s.d;if(prof[s.n]){o.p=1;o.src=prof[s.n]}C.skills.push(o)});return ctx.patch()}});
/* fx engine v4: extra skills outside the 18 core ones (Technology, Data). A row is added only when an entry names the skill (skillProf, skillExpert, skillPE, skillBonus, skillAb) or a pick gave proficiency, so ordinary sheets are unchanged. i.xsk is the registry window.XSK {name:{ab,d}}; the two defaults below are used when it is missing. The row is flagged hb like a pack skill */
registerSheetGroup({id:"extra-skills",group:"skills",phase:"skills",order:120,reads:["i.G","i.xsk","l.prof","l.exp"],writes:["C.skills"],
 run:function(ctx){const prof=ctx.l.prof,exp=ctx.l.exp,C=ctx.C,XS=Object.assign({Technology:{ab:"INT",d:"Technology (Dark Matter)"},Data:{ab:"INT",d:"Data (Dark Matter)"}},ctx.i.xsk),want={};
  ctx.i.G.forEach((e) =>{["skillProf","skillExpert","skillPE"].forEach((f) =>{(e[f]||[]).forEach((n) =>{want[n]=1})});(e.skillBonus||[]).forEach((r) =>{want[r[0]]=1});(e.skillAb||[]).forEach((r) =>{want[r[0]]=1})});
  Object.keys(prof).concat(Object.keys(want)).forEach((n) =>{if(!XS[n]||C.skills.some((s) =>{return s.n===n}))return;const o={n:n,ab:XS[n].ab,hb:1};if(XS[n].d)o.hbd=XS[n].d;if(prof[n]){o.p=1;o.src=prof[n]}if(exp[n]&&prof[n]){o.p=2;o.src=prof[n]+"; Expertise from "+exp[n]}C.skills.push(o)});return ctx.patch()}});
/* v35 p07: Jack of All Trades, half the Proficiency Bonus on checks without proficiency */
registerSheetRule({id:"bard-2-jack",group:"skills",about:"Bard 2: Jack of All Trades",phase:"skills",order:130,reads:["i.pb","q.clsLv"],writes:["C.skills"],
 run:function(ctx){const pb=ctx.i.pb,C=ctx.C;if(ctx.q.clsLv("Bard")>=2&&Math.floor(pb/2))C.skills.forEach((s) =>{if(!s.p)addMisc(s,Math.floor(pb/2),"Jack of All Trades (PHB-2024, Bard 2)")});return ctx.patch()}});
/* v63: third party subclass skill bonus (skb) */
registerSheetGroup({id:"skill-sub-bonus",group:"skills",phase:"skills",order:140,reads:["i.a","q.xfxPost"],writes:["C.skills"],
 run:function(ctx){const C=ctx.C;ctx.q.xfxPost(C,ctx.i.a);return ctx.patch()}});
/* fx engine v2, v4, v5, batch E: skillBonus, chkBonus, skillBonusNp, chkBonusNp, skillAb */
/* [field, which skills a row hits]. skillBonusNp and chkBonusNp (fx engine v5): only skills without proficiency (Logic Unit, Remarkable Athlete: value "halfPbUp") */
const SB_ROWS=[["skillBonus",function(s,r){return r[0]==="*"||s.n===r[0]}],["chkBonus",function(s,r){return s.ab===r[0]}],["skillBonusNp",function(s,r){return !s.p&&(r[0]==="*"||s.n===r[0])}],["chkBonusNp",function(s,r){return !s.p&&s.ab===r[0]}]];
function sbSkillAb(C,a,e){/* fx batch E: skillAb [[skill, ability]] uses that ability's modifier for the skill when higher (shown as a misc bonus) */(e.skillAb||[]).forEach((r) =>{C.skills.forEach((s) =>{if(s.n===r[0]&&a.sc[r[1]]!=null&&a.sc[s.ab]!=null){const d=mod(a.sc[r[1]])-mod(a.sc[s.ab]);if(d>0)addMisc(s,d,e.lbl+" ("+r[1]+" modifier instead of "+s.ab+") +"+d)}})})}
function sbOne(C,a,fxv,e){const add=function(s,v){if(!v)return;addMisc(s,v,e.lbl+" "+(v>0?"+":"")+v)};
  const rv=function(r){let v=fxv(r[1],e);if(r[2]!=null&&v<r[2])v=r[2];return v};
  SB_ROWS.forEach(function(t){(e[t[0]]||[]).forEach((r) =>{C.skills.forEach((s) =>{if(t[1](s,r))add(s,rv(r))})})});sbSkillAb(C,a,e)}
registerSheetGroup({id:"fx-skill-bonus",group:"skills",phase:"skills",order:150,reads:["i.G","i.a","q.fxv"],writes:["C.skills"],
 run:function(ctx){const C=ctx.C,a=ctx.i.a,fxv=ctx.q.fxv;ctx.i.G.forEach((e) =>{sbOne(C,a,fxv,e)});return ctx.patch()}});
/* fx engine v2: skillProfPlus on a skill the character already has: +1 to its checks */
registerSheetGroup({id:"fx-skill-plus",group:"skills",phase:"skills",order:160,reads:["l.pplus"],writes:["C.skills"],
 run:function(ctx){const C=ctx.C;ctx.l.pplus.forEach((r) =>{C.skills.forEach((s) =>{if(s.n===r[0])addMisc(s,1,r[1].lbl+" +1")})});return ctx.patch()}});
/* ---------- languages ---------- */
/* Common, the 2014 species and background languages, the chosen ones */
registerSheetGroup({id:"lang-base",group:"languages",phase:"lang",order:10,reads:["i.r14","q.spX","q.bgX","q.langKeys","i.B"],writes:["l.lg"],
 run:function(ctx){const lg=["Common"],B=ctx.i.B,Q=ctx.q;if(ctx.i.r14){const sl0=Q.spX(),bl0=Q.bgX();((sl0&&sl0.lgf)||[]).concat((bl0&&bl0.lgf)||[]).forEach((x) =>{if(lg.indexOf(x)<0)lg.push(x)})}Q.langKeys().forEach((k) =>{(B.ch[k]||[]).forEach((x) =>{if(lg.indexOf(x)<0)lg.push(x)})});ctx.l.lg=lg;return ctx.patch()}});
/* M10: any class part gives its secret language */
registerSheetRule({id:"druid-druidic",group:"languages",about:"Druid: Druidic",phase:"lang",order:20,reads:["q.clsLv"],writes:["l.lg"],
 run:function(ctx){const lg=ctx.l.lg;if(ctx.q.clsLv("Druid")&&lg.indexOf("Druidic")<0)lg.push("Druidic");return ctx.patch()}});
registerSheetRule({id:"rogue-thieves-cant",group:"languages",about:"Rogue: Thieves' Cant",phase:"lang",order:30,reads:["q.clsLv"],writes:["l.lg"],
 run:function(ctx){const lg=ctx.l.lg;if(ctx.q.clsLv("Rogue")&&lg.indexOf("Thieves' Cant")<0)lg.push("Thieves' Cant");return ctx.patch()}});
/* v62: feat languages, background and subclass languages, then the list goes on the sheet */
registerSheetGroup({id:"lang-finish",group:"languages",phase:"lang",order:40,reads:["l.lg","q.xfxLang"],writes:["l.lg","C.lang"],
 run:function(ctx){const lg=ctx.l.lg;ctx.q.xfxLang(lg);ctx.C.lang=lg;return ctx.patch()}});
