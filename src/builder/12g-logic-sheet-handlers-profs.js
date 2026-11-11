import {featDef,mcGrantRow} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
/* Sheet handlers, part 5 (contract in 12a-logic-sheet-registry.js): armor, weapon and tool proficiencies (phase "profs").
   DRY: the old toSheet() listed every proficiency source twice, once to build the text C.profs and once to build the source list C.profSrc. Now each
   source handler adds ROWS to l.profList once, and "prof-finish" derives both results. A row is {k: "armor"|"weapons"|"tools", t: text (may hold a
   comma list), s: the source shown in C.profSrc, a: place in the text, b: place in the source list, nn: 1 = a text of "None" is dropped from C.profs}.
   The old two passes did not list the sources in the same order (a pact weapon and Masterful weapons last in the source list, species before
   multiclass there), so a and b keep both orders. l.weapons is the weapon text before the picks of "prof-gx-weapon-picks". */
defineLocals({profList:"array",weapons:"string",weaponGroups:"array"});
/* v32 RL49: a tool "of your choice" in the data (toolPick) is replaced by the tools chosen in the builder (none chosen: nothing) */
function tp(B,txt,pick,key){if(!pick)return txt;const v=B.ch[key];return Array.isArray(v)?v.join(", "):""}
/* names of a text into a source list, each name once (the first source wins), without "None" and without the Masterful and Pact Weapon notes */
function addSrc(list,str,s){String(str||"").split(/,\s*/).forEach((n) =>{n=n.replace(/ \((Masterful|Pact Weapon)\)$/,"");if(!n||n==="None"||list.some((x) =>{return x[0]===n}))return;list.push([n,s])})}
function row(k,t,s,a,b,nn){return {k:k,t:t,s:s,a:a,b:b,nn:nn?1:0}}
/* a source that grants armor, weapons and tools by the same three fields */
function rowsOf(rows,g,s,a,b){if(!g)return;["armor","weapons","tools"].forEach((k) =>{if(g[k])rows.push(row(k,g[k],s,a,b))})}
registerSheetGroup({id:"prof-init",group:"proficiencies",phase:"profs",order:5,reads:[],writes:["l.profList"],run:function(ctx){ctx.l.profList=[];return ctx.patch()}});
registerSheetGroup({id:"prof-class-background",group:"proficiencies",phase:"profs",order:10,reads:["i.B","i.c","i.bg","q.bgTl"],writes:["l.profList"],
 run:function(ctx){const I=ctx.i,B=I.B,c=I.c,rows=ctx.l.profList,tpf=function(t,p,k){return tp(B,t,p,k)};
  rows.push(row("armor",c.armor,B.cls,10,10));rows.push(row("weapons",c.weapons,B.cls,10,10));
  rows.push(row("tools",tpf(c.tools,c.toolPick,"clsTool"),B.cls,10,10,1));/* v95: a background with no tool says "None", which is no tool */if(I.bg)rows.push(row("tools",ctx.q.bgTl(I.bg,tpf),B.bg,10,10,1));return ctx.patch()}});
registerSheetGroup({id:"prof-subclass-grant",group:"proficiencies",phase:"profs",order:20,reads:["i.B","i.L","i.SG"],writes:["l.profList"],
 run:function(ctx){const I=ctx.i,SG=I.SG,rows=ctx.l.profList;["armor","weapons","tools"].forEach((k) =>{if(SG&&SG[k])SG[k].forEach((q) =>{if(I.L>=q[0])rows.push(row(k,q[1],I.B.sub,20,20))})});return ctx.patch()}});
registerSheetGroup({id:"prof-species-masterful",group:"proficiencies",phase:"profs",order:30,reads:["i.B"],writes:["l.profList"],
 run:function(ctx){const rows=ctx.l.profList;(ctx.i.B.ch.spwep||[]).forEach((n) =>{rows.push(row("weapons",n+" (Masterful)","Masterful",30,80))});return ctx.patch()}});
/* M13 */
registerSheetRule({id:"warlock-pact-weapon-prof",group:"proficiencies",about:"Warlock, Pact of the Blade: proficiency with the bonded weapon",phase:"profs",order:31,reads:["l.pactW","q.baseOf"],writes:["l.profList"],
 run:function(ctx){const pactW=ctx.l.pactW;if(pactW)ctx.l.profList.push(row("weapons",ctx.q.baseOf(pactW).b+" (Pact Weapon)","Pact of the Blade",31,81));return ctx.patch()}});
/* v32: Divine Order Protector (multiclass Cleric too), Primal Order Warden, College of Valor */
registerSheetRule({id:"cleric-protector-profs",group:"proficiencies",about:"Cleric Divine Order, Protector: Heavy armor and Martial weapons",phase:"profs",order:40,reads:["q.optAny"],writes:["l.profList"],
 run:function(ctx){if(ctx.q.optAny("Protector")){const rows=ctx.l.profList;rows.push(row("armor","Heavy","Protector",40,30));rows.push(row("weapons","Martial","Protector",40,30))}return ctx.patch()}});
registerSheetRule({id:"druid-warden-profs",group:"proficiencies",about:"Druid Primal Order, Warden: Medium armor and Martial weapons",phase:"profs",order:41,reads:["q.optAny"],writes:["l.profList"],
 run:function(ctx){if(ctx.q.optAny("Warden")){const rows=ctx.l.profList;rows.push(row("armor","Medium","Warden",41,31));rows.push(row("weapons","Martial","Warden",41,31))}return ctx.patch()}});
registerSheetRule({id:"bard-valor-3-profs",group:"proficiencies",about:"Bard College of Valor 3: Medium armor, Shields and Martial weapons",phase:"profs",order:42,reads:["i.B","i.L"],writes:["l.profList"],
 run:function(ctx){const B=ctx.i.B,rows=ctx.l.profList;if(B.sub==="College of Valor"&&ctx.i.L>=3){rows.push(row("armor","Medium, Shields",B.sub,42,32));rows.push(row("weapons","Martial",B.sub,42,32))}return ctx.patch()}});
/* v69: FEATS armor, weapons, and the weapons a feat lets you pick (wpPick). Tavern Brawler: improvised weapons */
registerSheetGroup({id:"prof-feats",group:"proficiencies",phase:"profs",order:50,reads:["i.B","i.feats"],writes:["l.profList"],
 run:function(ctx){const B=ctx.i.B,rows=ctx.l.profList;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.armor)rows.push(row("armor",F.armor,f.n,50,40));if(F&&F.weapons)rows.push(row("weapons",F.weapons,f.n,50,40));if(/^Tavern Brawler/.test(f.n))rows.push(row("weapons","Improvised",f.n,50,40));
  if(F&&F.wpPick){const wv=B.ch[F.wpPick+"-"+(f.key||f.s)];if(Array.isArray(wv))wv.forEach((n) =>{rows.push(row("weapons",n,f.n,50,40))})}});return ctx.patch()}});
registerSheetGroup({id:"prof-multiclass",group:"proficiencies",phase:"profs",order:60,reads:["i.B","i.mcl"],writes:["l.profList"],
 run:function(ctx){const B=ctx.i.B,rows=ctx.l.profList;ctx.i.mcl.forEach((m,mi) =>{const g=mcGrantRow(m.cls)||{},s=m.cls+" (multiclass)";if(g.armor)rows.push(row("armor",g.armor,s,60,60));if(g.weapons)rows.push(row("weapons",g.weapons,s,60,60));const gt=tp(B,g.tools,g.toolPick,"m"+mi+":tool");if(gt)rows.push(row("tools",gt,s,60,60))});return ctx.patch()}});
registerSheetGroup({id:"prof-species-weapon-pick",group:"proficiencies",phase:"profs",order:70,reads:["i.B","i.sp","i.custom","i.SRC"],writes:["l.profList"],
 run:function(ctx){const I=ctx.i,sp=I.sp,rows=ctx.l.profList;if(sp&&sp.wpPick&&!I.custom)(I.B.ch.spwp||[]).forEach((n) =>{rows.push(row("weapons",n,I.B.species+" ("+(sp.hb||I.SRC)+")",70,50))});return ctx.patch()}});
/* v74: species proficiencies (2014 species) */
registerSheetGroup({id:"prof-species",group:"proficiencies",phase:"profs",order:71,reads:["i.B","i.sp","i.custom","i.SRC"],writes:["l.profList"],
 run:function(ctx){const I=ctx.i,sp=I.sp;if(sp&&sp.profs&&!I.custom)rowsOf(ctx.l.profList,sp.profs,I.B.species+" ("+(sp.hb||I.SRC)+")",71,51);return ctx.patch()}});
registerSheetGroup({id:"prof-tool-choices",group:"proficiencies",phase:"profs",order:80,reads:["i.XT"],writes:["l.profList"],
 run:function(ctx){const rows=ctx.l.profList;ctx.i.XT.forEach((q) =>{rows.push(row("tools",q[0],q[1],80,70))});return ctx.patch()}});
/* fx armor, weapons, tools: counted in C.profs (and so in the proficiency of the attack rows and the armor check), not only listed in profSrc (fx engine v2) */
registerSheetGroup({id:"fx-profs",group:"proficiencies",phase:"profs",order:90,reads:["i.G"],writes:["l.profList"],
 run:function(ctx){const rows=ctx.l.profList;ctx.i.G.forEach((e) =>{["armor","weapons","tools"].forEach((k) =>{(e[k]||[]).forEach((n) =>{rows.push(row(k,n,e.lbl,90,71))})})});return ctx.patch()}});
/* C.profs (text, each name once) and C.profSrc (name and where it comes from, v23 RU36 no. 7), both from the rows */
/* Restricted groups are kept out of the legacy "Martial" text matcher. The
   attack-row handler compares the actual weapon category and attack kind. */
registerSheetGroup({id:"fx-weapon-groups",group:"proficiencies",phase:"profs",order:91,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk"],writes:["l.profList","l.weaponGroups"],
 run:function(ctx){const I=ctx.i;ctx.l.weaponGroups=[];I.G.forEach((e) =>{
  if(!ctx.q.fxOk(e,I.ar,I.ESH,I.EA))return;
  (e.weaponGroups||[]).forEach((g) =>{if(!/^[SM]$/.test(g.cat)||!/^[MR]$/.test(g.k))return;
   const excluded=Array.isArray(g.not)?g.not:[];ctx.l.weaponGroups.push({cat:g.cat,k:g.k,not:excluded});
   const label=(g.k==="R"?"Ranged":"Melee")+" weapons ("+(g.cat==="M"?"martial":"simple")+")"+(excluded.length?" without "+excluded.join(" and "):"");
   ctx.l.profList.push(row("weapons",label,e.lbl,91,72))})});return ctx.patch()}});
registerSheetGroup({id:"prof-finish",group:"proficiencies",phase:"profs",order:100,reads:["l.profList"],writes:["C.profs","C.profSrc","l.weapons"],
 run:function(ctx){const rows=ctx.l.profList,C=ctx.C,KS=["armor","weapons","tools"],txt={},PS={armor:[],weapons:[],tools:[]};
  KS.forEach((k) =>{const mine=rows.filter((r) =>{return r.k===k});
   txt[k]=mine.filter((r) =>{return !(r.nn&&(!r.t||r.t==="None"))}).sort((x,y) =>{return x.a-y.a}).map((r) =>{return String(r.t||"")}).join(", ").split(/,\s*/).filter((x,i,a) =>{return x&&a.indexOf(x)===i});
   mine.sort((x,y) =>{return x.b-y.b}).forEach((r) =>{addSrc(PS[k],r.t,r.s)})});
  C.profs={armor:txt.armor.join(", ")||"None",weapons:txt.weapons.join(", "),tools:txt.tools.join(", ")||"None"};ctx.l.weapons=C.profs.weapons;C.profSrc=PS;return ctx.patch()}});
/* fx engine v2: weapon proficiency picks */
registerSheetGroup({id:"prof-gx-weapon-picks",group:"proficiencies",phase:"profs",order:110,reads:["i.B","q.gxPicks"],writes:["C.profs","C.profSrc"],
 run:function(ctx){const B=ctx.i.B,C=ctx.C,PS=C.profSrc;ctx.q.gxPicks().forEach((o) =>{if(!o.gxw)return;(B.ch[o.key]||[]).forEach((n) =>{addSrc(PS.weapons,n,o.src);if((","+C.profs.weapons+",").replace(/, /g,",").indexOf(","+n+",")<0)C.profs.weapons+=(C.profs.weapons?", ":"")+n})});return ctx.patch()}});
