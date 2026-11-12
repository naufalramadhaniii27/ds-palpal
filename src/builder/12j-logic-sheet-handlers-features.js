import {chJoin} from "./01-logic-core-helpers.js";
import {cfFullText,full14,classDef,featDef,maneuverRows,masteryText,subFullText,toolOneName,weaponDef} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
/* Sheet handlers, part 8 (contract in 12a-logic-sheet-registry.js): the feature cards (phase "features"): species, class (one handler per class
   feature text rule, in the loop "class-feature-text"), subclass, multiclass, feats, background. Also what the old code derived on the way:
   defenses, item advantage, extra speeds and item senses.
   l.cf the class feature cards built so far, l.cfrow the card being built for the feature in ctx.p. */
defineLocals({cf:"array",cfrow:"object?"});
registerSheetGroup({id:"features-init",group:"features",phase:"features",order:5,reads:[],writes:["C.features"],run:function(ctx){ctx.C.features=[];return ctx.patch()}});
/* species traits, the Size choice (RU34), the chosen lineage (v36 p21) */
registerSheetGroup({id:"species-features",group:"features",phase:"features",order:10,reads:["i.B","i.sp","i.custom","i.spName","i.a","i.TLv","i.SRC","q.spTraitText","q.htText","q.spLinTrait","q.calcNote"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,B=I.B,sp=I.sp,Q=ctx.q,SRC=I.SRC;
  const spItems=I.custom?[{n:"Homebrew species",s:"Homebrew",d:"Fill in the traits from your setting."}]:sp.traits.map((t) =>{return Object.assign({n:t[0],s:(sp.hb||SRC)+", "+B.species,d:Q.spTraitText(sp,t)},full14(B.rs,"Species: "+B.species,t[0]))});
  if(!I.custom&&/or/.test(sp.size))spItems.push({n:"Size",s:(sp.hb||SRC)+", "+B.species,d:"You can be Medium or Small, chosen when you create the character. **Your choice.** "+(B.size||"Medium")+(Q.htText(B.species,B.size||"Medium")?", "+Q.htText(B.species,B.size||"Medium"):"")+"."});
  if(B.ch.lin&&!(sp&&sp.lin&&(Q.spLinTrait(sp)||sp.traits.some((t) =>{return /ancestr|lineage|legacy/i.test(t[1])}))))spItems.push({n:"Chosen: "+B.ch.lin,s:(sp&&sp.hb||SRC)+", "+B.species,d:(sp&&sp.hb&&sp.linText&&sp.linText[B.ch.lin])||"Your lineage or ancestry choice."});
  spItems.forEach((it) =>{it.d+=Q.calcNote(it.n,B.cls,I.TLv,I.a)});ctx.C.features.push({g:"Species: "+I.spName,items:spItems});return ctx.patch()}});
registerSheetGroup({id:"defenses-base",group:"defenses",phase:"features",order:20,reads:["i.a","q.defenses"],writes:["C.defenses"],run:function(ctx){ctx.C.defenses=ctx.q.defenses(ctx.i.a);return ctx.patch()}});
/* v65: Advantage from items on Initiative and skills, read by cfx. Advantage on saves goes to the saving throw notes */
registerSheetGroup({id:"item-advantage",group:"defenses",phase:"features",order:30,reads:["i.AFX"],writes:["C.itemAdv","C.saveNotes"],
 run:function(ctx){const C=ctx.C;C.itemAdv=[];ctx.i.AFX.forEach((q) =>{(q.fx.adv||[]).forEach((k) =>{if(!/sav(e|ing)|Concentration/i.test(k))C.itemAdv.push({k:k,s:q.n});else{C.saveNotes=C.saveNotes||[];C.saveNotes.push({t:"Advantage on "+(/^advantage/i.test(k)?k.replace(/^advantage\s*(on\s*)?/i,""):k),s:q.n})}})});return ctx.patch()}});
/* v101: item darkvision. Robe of Eyes sets 120. Goggles of Night and the Axe of the Dwarvish Lords give the range, or add it to Darkvision you already have */
registerSheetGroup({id:"item-darkvision",group:"senses",phase:"features",order:40,reads:["i.AFX"],writes:["C.darkvision","C.darkSrc"],
 run:function(ctx){const C=ctx.C;ctx.i.AFX.forEach((q) =>{const f=q.fx;if(f.dark){const dv=+f.dark||0;if(/^Robe of Eyes/.test(q.n))C.darkvision=Math.max(C.darkvision||0,dv);else C.darkvision=(C.darkvision||0)+dv;C.darkSrc=(C.darkSrc?C.darkSrc+", ":"")+q.n}});return ctx.patch()}});
/* RU35 no. 7, v76: Resistances, Immunities and Vulnerabilities from magic items in use */
registerSheetGroup({id:"item-defenses",group:"defenses",phase:"features",order:41,reads:["i.AFX"],writes:["C.defenses"],
 run:function(ctx){const C=ctx.C;ctx.i.AFX.forEach((q) =>{const f=q.fx;(f.res||[]).forEach((t) =>{C.defenses.push({t:"Resistance",v:t,s:q.n})});(f.imm||[]).forEach((t) =>{C.defenses.push({t:"Immunity",v:t,s:q.n})});(f.condImm||[]).forEach((t) =>{C.defenses.push({t:"Immunity",v:t+" (condition)",s:q.n})});(f.vul||[]).forEach((t) =>{C.defenses.push({t:"Vulnerability",v:t,s:q.n})})});return ctx.patch()}});
registerSheetGroup({id:"item-speeds",group:"speed",phase:"features",order:42,reads:["i.AFX"],writes:["C.speeds"],
 run:function(ctx){const C=ctx.C;ctx.i.AFX.forEach((q) =>{const f=q.fx;["fly","swim","climb","burrow"].forEach((k) =>{if(f[k]){C.speeds=C.speeds||{};const v=f[k]==="walk"?"walk":+f[k];C.speeds[k]={v:v,s:q.n}}})});return ctx.patch()}});
/* V17-4: speeds from class features. An extra speed equal to your walking speed is listed once, the first source wins */
function extraSpeed(C,k,s){C.speeds=C.speeds||{};if(!C.speeds[k])C.speeds[k]={v:"walk",s:s}}
registerSheetRule({id:"ranger-6-roving-speeds",group:"speed",about:"Ranger 6: Roving, Climb and Swim Speed (2024 only)",phase:"features",order:50,reads:["i.r14","q.clsLv"],writes:["C.speeds"],
 run:function(ctx){const C=ctx.C;if(ctx.q.clsLv("Ranger")>=6&&!ctx.i.r14){extraSpeed(C,"climb","Roving (Ranger 6)");extraSpeed(C,"swim","Roving (Ranger 6)")}return ctx.patch()}});
registerSheetRule({id:"thief-3-climb",group:"speed",about:"Rogue Thief 3: Second-Story Work, Climb Speed",phase:"features",order:51,reads:["q.subAt"],writes:["C.speeds"],
 run:function(ctx){if(ctx.q.subAt("Rogue","Thief")>=3)extraSpeed(ctx.C,"climb","Second-Story Work (Thief 3)");return ctx.patch()}});
registerSheetGroup({id:"item-gift-of-the-depths",group:"speed",phase:"features",order:52,reads:["q.invList"],writes:["C.speeds"],
 run:function(ctx){if(ctx.q.invList().indexOf("Gift of the Depths")>=0)extraSpeed(ctx.C,"swim","Gift of the Depths");return ctx.patch()}});
registerSheetRule({id:"circle-of-the-sea-6-swim",group:"speed",about:"Druid Circle of the Sea 6: Aquatic Affinity, Swim Speed",phase:"features",order:53,reads:["q.subAt"],writes:["C.speeds"],
 run:function(ctx){if(ctx.q.subAt("Druid","Circle of the Sea")>=6)extraSpeed(ctx.C,"swim","Aquatic Affinity (Circle of the Sea 6)");return ctx.patch()}});
registerSheetRule({id:"wild-heart-6-aspect-speeds",group:"speed",about:"Barbarian Path of the Wild Heart 6: Aspect of the Wilds (Panther: Climb, Salmon: Swim)",phase:"features",order:54,reads:["q.subAt","q.chOf"],writes:["C.speeds"],
 run:function(ctx){const C=ctx.C,Q=ctx.q;if(Q.subAt("Barbarian","Path of the Wild Heart")>=6){const aw=Q.chOf("Barbarian","p6opt");if(aw==="Panther")extraSpeed(C,"climb","Aspect of the Wilds (Panther)");else if(aw==="Salmon")extraSpeed(C,"swim","Aspect of the Wilds (Salmon)");else if(!aw){extraSpeed(C,"climb","Aspect of the Wilds, if you chose Panther");extraSpeed(C,"swim","Aspect of the Wilds, if you chose Salmon")}}return ctx.patch()}});/* v32 RL49 no. 31 */
registerSheetRule({id:"aasimar-3-wings",group:"speed",about:"Aasimar: Celestial Revelation, Heavenly Wings, Fly Speed while transformed (level 3)",phase:"features",order:55,reads:["i.B","i.TLv","q.spX"],writes:["C.speeds"],
 run:function(ctx){const I=ctx.i;if(ctx.q.spX()&&I.B.species==="Aasimar"&&I.TLv>=3)extraSpeed(ctx.C,"fly","Celestial Revelation, Heavenly Wings, while transformed");return ctx.patch()}});
/* ---------- class feature cards: one pass per feature (loop "class-feature-text"), each rule edits the text of its own feature ---------- */
const CF={scope:"each",over:"i.cfList",loop:"class-feature-text"};
registerSheetGroup({id:"class-features-init",group:"features",phase:"features",order:60,reads:[],writes:["l.cf"],run:function(ctx){ctx.l.cf=[];return ctx.patch()}});
registerSheetGroup(Object.assign({},CF,{id:"class-feature-base",group:"features",phase:"features",order:61,reads:[],writes:["l.cfrow"],
 run:function(ctx){const x=ctx.p;ctx.l.cfrow={d:x[2],fx:""};return ctx.patch()}}));
/* the Fighting Style the character chose: its text replaces the generic one, and its full text goes on the card */
registerSheetRule(Object.assign({},CF,{id:"fighting-style-text",group:"features",about:"Fighting Style feature: shows the chosen style",phase:"features",order:62,reads:["i.B","i.c","l.cfrow"],writes:["l.cfrow"],
 run:function(ctx){const x=ctx.p,B=ctx.i.B,r=ctx.l.cfrow,fsv=B.ch["fs"+ctx.i.c.fs],FSF=fsv?featDef(fsv):null;if(x[1]==="Fighting Style"&&fsv)r.d="You chose **"+fsv+"**. "+(FSF?FSF.d:"This Fighting Style is not in your active sources. Pick it again in the builder.");r.fx=(x[1]==="Fighting Style"&&FSF)?FSF.full:"";return ctx.patch()}}));
registerSheetRule(Object.assign({},CF,{id:"weapon-mastery-text",group:"features",about:"Weapon Mastery feature: lists the chosen masteries",phase:"features",order:63,reads:["i.wmSet","l.cfrow"],writes:["l.cfrow"],
 run:function(ctx){const x=ctx.p,wmSet=ctx.i.wmSet;if(x[1]==="Weapon Mastery"&&wmSet.length)ctx.l.cfrow.d="Masteries: "+wmSet.map((n) =>{return n+" ("+weaponDef(n).m+")"}).join(", ")+". Swap one on a Long Rest.";return ctx.patch()}}));
registerSheetRule(Object.assign({},CF,{id:"divine-primal-order-text",group:"features",about:"Divine Order and Primal Order: shows the chosen order",phase:"features",order:64,reads:["i.B","l.cfrow"],writes:["l.cfrow"],
 run:function(ctx){const x=ctx.p,B=ctx.i.B;if(x[1]==="Divine Order"&&B.ch.p1opt||x[1]==="Primal Order"&&B.ch.p1opt)ctx.l.cfrow.d="You chose **"+B.ch.p1opt+"**. "+ctx.l.cfrow.d;return ctx.patch()}}));
registerSheetRule(Object.assign({},CF,{id:"blessed-strikes-fury-text",group:"features",about:"Blessed Strikes and Elemental Fury: shows the chosen option",phase:"features",order:65,reads:["i.B","l.cfrow"],writes:["l.cfrow"],
 run:function(ctx){const x=ctx.p,B=ctx.i.B;if(x[1]==="Blessed Strikes"&&B.ch.p7opt||x[1]==="Elemental Fury"&&B.ch.p7opt)ctx.l.cfrow.d="You chose **"+B.ch.p7opt+"**. "+ctx.l.cfrow.d;return ctx.patch()}}));
registerSheetRule(Object.assign({},CF,{id:"eldritch-invocations-text",group:"features",about:"Warlock Eldritch Invocations: lists the known invocations",phase:"features",order:66,reads:["i.B","l.cfrow"],writes:["l.cfrow"],
 run:function(ctx){const x=ctx.p,iv=chJoin(ctx.i.B.ch,/invocation$/);if(x[1]==="Eldritch Invocations"&&iv.length)ctx.l.cfrow.d="Known: "+iv.join(", ")+". "+ctx.l.cfrow.d;return ctx.patch()}}));
registerSheetRule(Object.assign({},CF,{id:"metamagic-text",group:"features",about:"Sorcerer Metamagic: lists the known options",phase:"features",order:67,reads:["i.B","l.cfrow"],writes:["l.cfrow"],
 run:function(ctx){const x=ctx.p,mm=chJoin(ctx.i.B.ch,/metamagic$/);if(x[1]==="Metamagic"&&mm.length)ctx.l.cfrow.d="Known: "+mm.join(", ")+". "+ctx.l.cfrow.d;return ctx.patch()}}));
/* the choices that belong to the feature (ycOf), the level note (calcNote), the full text; the card goes in l.cf unless it is a subclass, Ability Score or Epic Boon marker */
registerSheetGroup(Object.assign({},CF,{id:"class-feature-card",group:"features",phase:"features",order:68,reads:["i.B","i.c","i.L","i.a","i.CH","i.SRC","l.cfrow","q.ycOf","q.calcNote"],writes:["l.cf"],
 run:function(ctx){const x=ctx.p,I=ctx.i,B=I.B,Q=ctx.q,r=ctx.l.cfrow,L=I.L,a=I.a;let d=r.d;d+=Q.ycOf(I.CH,x[1],undefined);/* v32 */d+=Q.calcNote(x[1],B.cls,L,a);
  const o={n:x[1],s:(x[3]&&x[3].hb?x[3].hb:I.SRC)+", "+B.cls+" "+x[0],d:d,full:r.fx||(cfFullText(B.cls+"|"+x[1])?cfFullText(B.cls+"|"+x[1])+Q.ycOf(I.CH,x[1],undefined)+Q.calcNote(x[1],B.cls,L,a):"")};
  if(!/Subclass$|Ability Score|Epic Boon/.test(o.n))ctx.l.cf.push(o);return ctx.patch()}}));
/* a class table column named like a feature (Warden Interrupt) joins that feature, else the sheet got a second card and a second action */
registerSheetGroup({id:"class-table-columns",group:"features",phase:"features",order:70,reads:["i.B","i.c","i.L","i.SRC","l.cf"],writes:["l.cf"],
 run:function(ctx){const I=ctx.i,L=I.L,cf=ctx.l.cf,tr=I.c.track;if(tr)Object.keys(tr).forEach((k) =>{if(!tr[k][L-1])return;const tx="At level "+L+": "+tr[k][L-1]+".",ex=cf.filter((y) =>{return y.n===k})[0];if(ex){if(ex.d.indexOf(tx)<0)ex.d+=" "+tx}else cf.push({n:k,s:I.SRC+", "+I.B.cls+" table",d:tx})});return ctx.patch()}});
registerSheetGroup({id:"class-spell-slots-card",group:"features",phase:"features",order:71,reads:["i.B","i.mcl","i.slotsFor","i.SRC","l.cf"],writes:["l.cf"],
 run:function(ctx){const I=ctx.i,sl=I.slotsFor,cf=ctx.l.cf;if(sl&&!I.mcl.length)cf.push({n:"Spell Slots",s:I.SRC+", "+I.B.cls,d:sl.pact?sl.pact+" Pact slots at level "+sl.lvl+".":sl.map((n,i) =>{return "L"+(i+1)+": "+n}).join(", ")});return ctx.patch()}});
registerSheetGroup({id:"class-features-group",group:"features",phase:"features",order:72,reads:["i.B","l.cf"],writes:["C.features"],
 run:function(ctx){ctx.C.features.push({g:ctx.i.B.cls,items:ctx.l.cf});return ctx.patch()}});
/* subclass features (up to the level) with the chosen Maneuvers (Battle Master) and the next unlock; a homebrew subclass gets a stub card */
registerSheetGroup({id:"subclass-features",group:"features",phase:"features",order:80,reads:["i.B","i.c","i.L","i.a","i.CH","i.SRC","i.subName","q.ycOf","q.calcNote"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,B=I.B,c=I.c,L=I.L,a=I.a,Q=ctx.q,SRC=I.SRC,CHT=I.CH,C=ctx.C;
  if(B.sub&&B.sub!=="__custom"){const sf=c.subs[B.sub].filter((x) =>{return x[0]<=L}).map((x) =>{return {n:x[1],s:SRC+", "+B.sub+" "+x[0],d:x[2]+Q.ycOf(CHT,x[1],undefined)+Q.calcNote(x[1],B.cls,L,a),full:subFullText(B.sub+"|"+x[1])?subFullText(B.sub+"|"+x[1])+Q.ycOf(CHT,x[1],undefined)+Q.calcNote(x[1],B.cls,L,a):""}});
   const man=chJoin(B.ch,/maneuver$/);if(man.length)sf.push({n:"Maneuvers known",s:SRC+", Battle Master",d:man.map((n) =>{const m=maneuverRows().filter((x) =>{return x[0]===n})[0];return "**"+n+".** "+(m?m[1]:"")}).join("\n\n")});
   const nx=c.subs[B.sub].filter((x) =>{return x[0]>L})[0];
   C.features.push({g:B.cls+" Subclass: "+B.sub,items:sf,next:nx?B.cls+" level "+nx[0]+" unlocks "+nx[1]+".":""})}
  else if(B.sub==="__custom")C.features.push({g:B.cls+" Subclass: "+I.subName,items:[{n:"Homebrew subclass",s:"Homebrew",d:"Add the subclass features from your setting."}]});return ctx.patch()}});
/* M10: multiclass features get the level note (calcNote with the class level) and the full text, like the main class */
registerSheetGroup({id:"multiclass-features",group:"features",phase:"features",order:90,reads:["i.a","i.mcl","i.CH","i.SRC","q.calcNote","q.ycOf"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,a=I.a,Q=ctx.q,SRC=I.SRC,CHT=I.CH,C=ctx.C;
  I.mcl.forEach((m,mi) =>{const mc=classDef(m.cls),seen={},it=[],mk=function(x,s,full){const cn=Q.calcNote(x[1],m.cls,m.lv,a);return {n:x[1],s:(x[3]&&x[3].hb?x[3].hb:SRC)+", "+s+" "+x[0],d:x[2]+Q.ycOf(CHT,x[1],mi)+cn,full:full?full+Q.ycOf(CHT,x[1],mi)+cn:""}};
   mc.f.forEach((x) =>{if(x[0]<=m.lv&&!/Subclass$|Ability Score|Epic Boon/.test(x[1])){const o=mk(x,m.cls,cfFullText(m.cls+"|"+x[1]));if(seen[x[1]]!=null&&x[1]!=="Expertise"){it[seen[x[1]]]=o;return}seen[x[1]]=it.length;it.push(o)}});
   if(m.sub&&mc.subs[m.sub])mc.subs[m.sub].forEach((x) =>{if(x[0]<=m.lv)it.push(mk(x,m.sub,subFullText(m.sub+"|"+x[1])))});
   C.features.push({g:m.cls+" (multiclass "+m.lv+")"+(m.sub?": "+m.sub:""),items:it})});return ctx.patch()}});
registerSheetGroup({id:"class-label",group:"features",phase:"features",order:100,reads:["i.B","i.L","i.mcl"],writes:["C.clsLabel","C.cls"],
 run:function(ctx){const I=ctx.i,B=I.B,C=ctx.C;if(I.mcl.length){C.clsLabel=[B.cls+" "+I.L].concat(I.mcl.map((m) =>{return m.cls+" "+m.lv})).join(" / ");C.cls=B.cls}return ctx.patch()}});
/* 2014 rules: a Fighting Style is a class feature, not a feat. It replaces the class's "Fighting Style" entry as "Fighting Style: <name>", worded as the class book words it. Returns the feats it moved */
function fsToClass(ctx,I,B,SRC){
  const r14=B.rs==="2014", fsOut=r14?I.feats.filter((f) =>{ return f.fs; }):[];
  if(fsOut.length){ const cg=ctx.C.features.filter((g) =>{ return g.g===B.cls; })[0];
    fsOut.forEach((f) =>{ const F=featDef(f.n)||{}, base=cg&&cg.items.filter((x) =>{ return x.n==="Fighting Style"; })[0];
      const m=base&&new RegExp("\\*\\*"+f.n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"\\.\\*\\*\\s*([\\s\\S]*?)(?=\\s*\\*\\*[^*\\n]{1,60}?\\.\\*\\*|$)").exec(String((typeof cfFullText==="function"&&cfFullText(B.cls+"|Fighting Style"))||base.full||base.d||""));
      const txt=m?m[1].trim():(F.full||F.d||""), it={n:"Fighting Style: "+f.n,s:base?base.s:(f.s.indexOf(SRC)===0?f.s:SRC+", "+f.s),d:m?txt:(F.d||""),full:txt};
      if(base) cg.items.splice(cg.items.indexOf(base),1,it); else if(cg) cg.items.push(it); }); }
  return fsOut; }
registerSheetGroup({id:"feat-features",group:"features",phase:"features",order:110,reads:["i.B","i.feats","i.CH","i.SRC"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,B=I.B,SRC=I.SRC;
  const fsOut=fsToClass(ctx,I,B,SRC);
  ctx.C.features.push({g:"Feats",items:I.feats.filter((f) =>{ return fsOut.indexOf(f)<0; }).map((f) =>{const F=featDef(f.n)||{};let ex="";if(f.asi){const v=f.asi;if(F.asi2)ex=v.a1===v.a2?" "+v.a1+" +2.":" "+v.a1+" +1, "+v.a2+" +1.";else if(v.a1)ex=" "+v.a1+" +1.";if(F.dt&&v.dt)ex+=" Damage type: "+v.dt+"."}const fk2=f.key||f.s;I.CH.forEach((q) =>{const pv=B.ch[q.key];if(q.fk===fk2&&Array.isArray(pv)&&pv.length)ex+=" "+q.title.replace(/^.*?: /,"").replace(/^./,(ch) =>{return ch.toUpperCase()})+": "+pv.join(", ")+"."});/* v32 RL49 */
   return {n:f.n,s:f.s.indexOf(SRC)===0?f.s:SRC+", "+f.s/* m4 (RL20): no "PHB-2024, PHB-2024" */,d:(F.d||"")+ex,full:F.full?F.full+(ex?" **Your choice.**"+ex:""):""}})});return ctx.patch()}});/* v19: the chosen increase and damage type also under the full text */
registerSheetGroup({id:"background-features",group:"features",phase:"features",order:120,reads:["i.B","i.bg","i.SRC"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,B=I.B,bg=I.bg,SRC=I.SRC;if(!bg)return null;
  ctx.C.features.push({g:"Background: "+B.bg,items:[{n:"Ability Scores",s:SRC+", "+B.bg,d:B.bgMode==="111"?bg.ab.join(" +1, ")+" +1.":(B.bg2||"?")+" +2, "+(B.bg1||"?")+" +1."},{n:"Proficiencies",s:SRC+", "+B.bg,d:"Skills: "+bg.sk.concat(Array.isArray(B.ch.bgsk)?B.ch.bgsk:[]).join(" and ")+(bg.skPick&&!(Array.isArray(B.ch.bgsk)&&B.ch.bgsk.length)?" (+"+bg.skPick.n+" of your choice, not chosen yet)":"")+". Tool: "+(bg.toolPick?((B.ch.bgTool||[]).join(", ")||"not chosen yet")+" ("+toolOneName(bg.toolPick.cats[0])+", your pick)":bg.tool)+"."},{n:"Equipment",s:SRC+", "+B.bg,d:"Option A: "+bg.eq+"."}].concat((bg.bf||[]).map((f) =>{return Object.assign({n:f[0],s:SRC+", "+B.bg,d:f[1]},full14(B.rs,"Background: "+B.bg,f[0]))}))});return ctx.patch()}});
