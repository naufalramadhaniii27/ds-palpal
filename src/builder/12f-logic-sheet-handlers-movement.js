import {mod} from "./01-logic-core-helpers.js";
import {classDef,featDef} from "./00-env.js";
import {runFxPhase} from "./10a-logic-fx-registry.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
/* Sheet handlers, part 4 (contract in 12a-logic-sheet-registry.js): Speed (phase "speed"), Darkvision (phase "senses"), Initiative (phase "init").
   l.spd Speed so far, l.spSrc the text that says where it comes from. The per-entry groups of stage 1 (11c-logic-fx-handlers-sheet.js, registry "sheet")
   run inside the handlers "fx-speed", "fx-speed-mul", "fx-darkvision" and "fx-init" below. */
defineLocals({spd:"number",spSrc:"string"});
/* more Speed from a source: the number and the text that names it */
function addSpeed(l,n,txt){l.spd+=n;l.spSrc+=txt}
/* the context the stage 1 sheet handlers read: ok (armor condition), val (value rule), spd (Speed so far), dark (Darkvision so far) */
function fxCtx(ctx,get){const I=ctx.i,Q=ctx.q;return {ok:function(e){return Q.fxOk(e,I.ar,I.ESH,I.EA)},val:Q.fxv,get spd(){return get.spd()},get dark(){return get.dark()}}}
/* ---------- Speed ---------- */
registerSheetGroup({id:"species-speed",group:"speed",phase:"speed",order:10,reads:["i.B","i.sp","i.custom","i.spName","i.SFX","i.SRC"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const I=ctx.i,l=ctx.l,SFX2=I.SFX,sp=I.sp;l.spd=I.custom?+I.B.cSpecies.speed:(SFX2.speedSet||sp.speed);l.spSrc=I.spName+" ("+(I.custom?"homebrew":(sp.hb||I.SRC))+")";if(SFX2.speed)addSpeed(l,SFX2.speed,", +"+SFX2.speed+" Quick");return ctx.patch()}});
registerSheetRule({id:"barbarian-5-fast-movement",group:"speed",about:"Barbarian 5: Fast Movement, +10 ft unless in Heavy armor",phase:"speed",order:20,reads:["i.ar","q.clsLv"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const ar=ctx.i.ar;if(ctx.q.clsLv("Barbarian")>=5&&!(ar&&ar.cat==="Heavy"))addSpeed(ctx.l,10,", +10 Fast Movement");return ctx.patch()}});
registerSheetRule({id:"monk-2-unarmored-movement",group:"speed",about:"Monk 2: Unarmored Movement, the Speed bonus of the class table while unarmored",phase:"speed",order:30,reads:["l.umOn","l.monkLv"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const l=ctx.l;if(l.umOn&&l.monkLv>=2){const um=classDef("Monk").track["Unarmored Movement"][l.monkLv-1];addSpeed(l,parseInt(um),", "+um+" Unarmored Movement")}return ctx.patch()}});
registerSheetRule({id:"ranger-6-roving",group:"speed",about:"Ranger 6: Roving, +10 ft unless in Heavy armor (2024 only)",phase:"speed",order:40,reads:["i.ar","i.r14","q.clsLv"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const ar=ctx.i.ar;if(ctx.q.clsLv("Ranger")>=6&&!ctx.i.r14&&!(ar&&ar.cat==="Heavy"))addSpeed(ctx.l,10,", +10 Roving");return ctx.patch()}});/* M8 (RL8): not in Heavy armor (PHB 2024 p. 121) */
/* generic: class fx.speed [[class level, feet]], speedAdd, speedSet, cond noHeavy or noArmor */
registerSheetGroup({id:"fx-speed",group:"speed",phase:"speed",order:50,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","q.fxv"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const l=ctx.l;runFxPhase("sheet","speed",ctx.i.G,fxCtx(ctx,{spd:function(){return l.spd}}),function(p){if(p.spd!=null)l.spd=p.spd;if(p.srcAdd)l.spSrc+=p.srcAdd});return ctx.patch()}});
/* v71 */
registerSheetRule({id:"oath-of-glory-2014-7-alacrity",group:"speed",about:"Oath of Glory (2014) 7: Aura of Alacrity, +10 ft",phase:"speed",order:60,scope:"part",loop:"speed-parts-glory",reads:[],writes:["l.spd","l.spSrc"],
 run:function(ctx){const q=ctx.p;if(q.sub==="Oath of Glory (2014)"&&q.lv>=7)addSpeed(ctx.l,10,", +10 Aura of Alacrity");return ctx.patch()}});
registerSheetRule({id:"rogue-scout-9-mobility",group:"speed",about:"Rogue Scout 9: Superior Mobility, +10 ft",phase:"speed",order:61,scope:"part",loop:"speed-parts-glory",reads:[],writes:["l.spd","l.spSrc"],
 run:function(ctx){const q=ctx.p;if(q.sub==="Scout"&&q.cls==="Rogue"&&q.lv>=9)addSpeed(ctx.l,10,", +10 Superior Mobility");return ctx.patch()}});
/* M17: FEATS.speed */
registerSheetGroup({id:"feat-speed",group:"speed",phase:"speed",order:70,reads:["i.feats"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const l=ctx.l;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.speed)addSpeed(l,F.speed,", +"+F.speed+" "+f.n)});return ctx.patch()}});
/* M11 (RL8): armor with a Strength score in the armor table cuts Speed by 10 ft when the wearer's Strength is lower (PHB 2024 p. 219) */
registerSheetGroup({id:"armor-strength-cut",group:"speed",phase:"speed",order:80,reads:["i.ar","i.EA","i.a"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const I=ctx.i,l=ctx.l,ar=I.ar;if(ar&&ar.str&&I.a.sc.STR<ar.str){l.spd=Math.max(0,l.spd-10);l.spSrc+=", −10 "+I.EA+" (needs Str "+ar.str+", yours is "+I.a.sc.STR+")"}return ctx.patch()}});
/* fx batch H: speedMul = Speed multiplied (Nosferatu: doubled). After the additions and the armor cut, before mv "speed" is read */
registerSheetGroup({id:"fx-speed-mul",group:"speed",phase:"speed",order:90,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","q.fxv"],writes:["l.spd","l.spSrc"],
 run:function(ctx){const l=ctx.l;runFxPhase("sheet","speed-mul",ctx.i.G,fxCtx(ctx,{spd:function(){return l.spd}}),function(p){if(p.spd!=null)l.spd=p.spd;if(p.srcAdd)l.spSrc+=p.srcAdd});return ctx.patch()}});
/* fx engine v2: mv {climb,swim,fly}: "speed" or feet. Sheet shows it in speedSrc, C.moves is optional.
   fx engine v4: mv value "speed2" = double your Speed, "speedHalf" = half your Speed (rounded down), next to "speed" and feet. fx v3a: a key in speedAddIf is handled in the late pass */
registerSheetGroup({id:"fx-mv",group:"speed",phase:"speed",order:100,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","l.spd"],writes:["l.spSrc","C.moves"],
 run:function(ctx){const I=ctx.i,l=ctx.l,C=ctx.C,spd=l.spd;I.G.forEach((e) =>{if(!e.mv||!ctx.q.fxOk(e,I.ar,I.ESH,I.EA))return;Object.keys(e.mv).forEach((m) =>{if(e.speedAddIf&&e.speedAddIf[m]!=null)return;
  const v=e.mv[m],mvn=v==="speed"?spd:v==="speed2"?spd*2:v==="speedHalf"?Math.floor(spd/2):+v,t=v==="speed"?"equal to your Speed ("+spd+" ft)":v==="speed2"?"double your Speed ("+mvn+" ft)":v==="speedHalf"?"half your Speed ("+mvn+" ft)":(v+" ft");
  l.spSrc+=", "+m.charAt(0).toUpperCase()+m.slice(1)+" Speed "+t+" ("+e.lbl+")";(C.moves=C.moves||[]).push({m:m,v:mvn,s:e.lbl})})});return ctx.patch()}});
/* the result on the sheet. v82: the 2014 book */
registerSheetGroup({id:"speed-sheet",group:"speed",phase:"speed",order:110,reads:["i.r14","l.spd","l.spSrc"],writes:["C.speed","C.speedSrc","C.rs"],
 run:function(ctx){const C=ctx.C;C.speed=ctx.l.spd;C.speedSrc=ctx.l.spSrc;if(ctx.i.r14)C.rs="2014";return ctx.patch()}});
/* ---------- Darkvision ---------- */
/* RL36 d, M17: Drow Darkvision 120 and Wood Elf Speed 35 come from SPECIES.Elf.linFx (spOptFx).
   m4 (RL20): name the source that gives Darkvision: species or pack, plus the pack option or lineage when that raised it */
registerSheetGroup({id:"species-darkvision",group:"senses",phase:"senses",order:10,reads:["i.B","i.sp","i.custom","i.spName","i.SFX","i.SRC"],writes:["C.darkvision","C.darkSrc"],
 run:function(ctx){const I=ctx.i,B=I.B,sp=I.sp,SFX2=I.SFX,C=ctx.C,custom=I.custom,dk=custom?+B.cSpecies.dark:Math.max(sp.dark||0,SFX2.dark||0);
  let dkOpt="";if(!custom&&(SFX2.dark||0)>(sp.dark||0)){(B.ch.spopt||[]).forEach((n) =>{const o=sp.opts&&sp.opts.list.filter((x) =>{return x[0]===n})[0];if(o&&o[2].dark&&!dkOpt)dkOpt=n});if(!dkOpt&&sp.linFx&&B.ch.lin)dkOpt=B.ch.lin.split(" (")[0]}
  C.darkvision=dk;C.darkSrc=dk?I.spName+(dkOpt?", "+dkOpt:"")+" ("+(custom?"homebrew":(sp.hb||I.SRC))+")":"";return ctx.patch()}});
/* v32 RL49 no. 31 (the species Darkvision is on the sheet at this point) */
registerSheetRule({id:"wild-heart-6-owl",group:"senses",about:"Barbarian Path of the Wild Heart 6: Aspect of the Wilds (Owl), Darkvision 60 ft more",phase:"senses",order:20,reads:["q.subAt","q.chOf","C.darkvision","C.darkSrc"],writes:["C.darkvision","C.darkSrc"],
 run:function(ctx){const C=ctx.C,Q=ctx.q;if(Q.subAt("Barbarian","Path of the Wild Heart")>=6&&Q.chOf("Barbarian","p6opt")==="Owl"){const dk=C.darkvision;C.darkvision=dk?dk+60:60;C.darkSrc=(C.darkSrc?C.darkSrc+", +60 ":"")+"Aspect of the Wilds (Owl)"}return ctx.patch()}});
/* fx batch E and v4: darkAdd, darkTo, darkNone, darkHave */
registerSheetGroup({id:"fx-darkvision",group:"senses",phase:"senses",order:30,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","q.fxv","C.darkvision","C.darkSrc"],writes:["C.darkvision","C.darkSrc"],
 run:function(ctx){const C=ctx.C;runFxPhase("sheet","darkvision",ctx.i.G,fxCtx(ctx,{spd:function(){return 0},dark:function(){return {vision:C.darkvision,src:C.darkSrc}}}),function(p){if(p.dark){C.darkvision=p.dark.vision;C.darkSrc=p.dark.src}});return ctx.patch()}});
/* ---------- Initiative ---------- */
/* an Initiative bonus that is added once, whatever the number of class parts that name it. `re` finds the line of the bonus already on the sheet */
function initOnce(C,re,row){if(!C.initBonus.some((x) =>{return re.test(x.s)}))C.initBonus.push(row)}
registerSheetGroup({id:"hp-bonus",group:"hitPoints",phase:"init",order:10,reads:["q.hpBonusList"],writes:["C.hpBonus"],
 run:function(ctx){ctx.C.hpBonus=ctx.q.hpBonusList();return ctx.patch()}});/* M4 (RL10): same list as hpCalc() */
registerSheetRule({id:"gloom-stalker-3-ambusher",group:"initiative",about:"Gloom Stalker 3: Dread Ambusher, Wisdom modifier to Initiative",phase:"init",order:20,scope:"part",loop:"init-gloom",reads:["i.a"],writes:["C.initBonus"],
 run:function(ctx){const q=ctx.p,C=ctx.C;if((q.sub==="Gloom Stalker"||q.sub==="Gloom Stalker (2014)")&&q.lv>=3)initOnce(C,/^Dread Ambusher/,{s:"Dread Ambusher: Wisdom modifier (PHB-2024, Gloom Stalker 3)",v:mod(ctx.i.a.sc.WIS)});return ctx.patch()}});/* v35 p06 */
registerSheetRule({id:"swashbuckler-3-audacity",group:"initiative",about:"Rogue Swashbuckler 3: Rakish Audacity, Charisma modifier to Initiative",phase:"init",order:30,scope:"part",loop:"init-swash",reads:["i.a"],writes:["C.initBonus"],
 run:function(ctx){const q=ctx.p,C=ctx.C;if(q.sub==="Swashbuckler"&&q.cls==="Rogue"&&q.lv>=3)initOnce(C,/^Rakish Audacity/,{s:"Rakish Audacity (Swashbuckler 3): Charisma modifier",v:mod(ctx.i.a.sc.CHA)});return ctx.patch()}});/* v71 */
registerSheetRule({id:"war-magic-3-tactical-wit",group:"initiative",about:"Wizard War Magic 3: Tactical Wit, Intelligence modifier to Initiative",phase:"init",order:40,scope:"part",loop:"init-warmagic",reads:["i.a"],writes:["C.initBonus"],
 run:function(ctx){const q=ctx.p,C=ctx.C;if(q.sub==="War Magic"&&q.cls==="Wizard"&&q.lv>=3)initOnce(C,/^Tactical Wit/,{s:"Tactical Wit (War Magic): Intelligence modifier",v:mod(ctx.i.a.sc.INT)});return ctx.patch()}});
/* generic: class fx.init = number or ability key */
registerSheetGroup({id:"fx-init",group:"initiative",phase:"init",order:50,reads:["i.G","i.ar","i.ESH","i.EA","q.fxOk","q.fxv"],writes:["C.initBonus"],
 run:function(ctx){const C=ctx.C;runFxPhase("sheet","init",ctx.i.G,fxCtx(ctx,{spd:function(){return 0},dark:function(){return {}}}),function(p){(p.initBonus||[]).forEach((x) =>{C.initBonus.push(x)})});return ctx.patch()}});
registerSheetRule({id:"chronurgy-3-temporal-awareness",group:"initiative",about:"Wizard Chronurgy Magic 3: Temporal Awareness, Intelligence modifier to Initiative",phase:"init",order:60,scope:"part",loop:"init-chrono",reads:["i.a"],writes:["C.initBonus"],
 run:function(ctx){const q=ctx.p,C=ctx.C;if(q.sub==="Chronurgy Magic"&&q.cls==="Wizard"&&q.lv>=3)initOnce(C,/^Temporal Awareness/,{s:"Temporal Awareness (Chronurgy Magic): Intelligence modifier",v:mod(ctx.i.a.sc.INT)});return ctx.patch()}});/* v73 */
registerSheetRule({id:"watchers-7-sentinel",group:"initiative",about:"Oath of the Watchers 7: Aura of the Sentinel, Proficiency Bonus to Initiative",phase:"init",order:70,scope:"part",loop:"init-watchers",reads:["i.pb"],writes:["C.initBonus"],
 run:function(ctx){const q=ctx.p,C=ctx.C;if(q.sub==="Oath of the Watchers"&&q.lv>=7)initOnce(C,/^Aura of the Sentinel/,{s:"Aura of the Sentinel (Oath of the Watchers 7): Proficiency Bonus",v:ctx.i.pb});return ctx.patch()}});/* v71 */
/* M17: FEATS.init (a number or "pb"), FEATS.pas (passive bonuses), FEATS.grappler */
registerSheetGroup({id:"feat-init",group:"initiative",phase:"init",order:80,reads:["i.feats","i.pb"],writes:["C.initBonus"],
 run:function(ctx){const pb=ctx.i.pb,C=ctx.C;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.init==="pb")C.initBonus.push({s:f.n+" feat ("+f.s+")",v:pb});else if(F&&typeof F.init==="number")C.initBonus.push({s:f.n+" feat ("+f.s+")",v:F.init})});return ctx.patch()}});
registerSheetGroup({id:"feat-passive-bonus",group:"passives",phase:"init",order:81,reads:["i.feats"],writes:["C.pasBon"],
 run:function(ctx){const C=ctx.C;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.pas){C.pasBon=C.pasBon||[];Object.keys(F.pas).forEach((k) =>{C.pasBon.push({k:k,v:F.pas[k],s:f.n+" feat ("+f.s+")"})})}});return ctx.patch()}});/* v69 */
registerSheetGroup({id:"feat-grappler",group:"grapple",phase:"init",order:82,reads:["i.feats"],writes:["C.grappler"],
 run:function(ctx){const C=ctx.C;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&F.grappler)C.grappler=true});return ctx.patch()}});
/* v56: Harengon adds PB to Initiative */
registerSheetRule({id:"harengon-hare-trigger",group:"initiative",about:"Harengon: Hare-Trigger, Proficiency Bonus to Initiative",phase:"init",order:90,reads:["i.pb","q.spX"],writes:["C.initBonus"],
 run:function(ctx){const sx=ctx.q.spX(),C=ctx.C;if(sx&&(sx.traits||[]).some((t) =>{return t[0]==="Hare-Trigger"}))initOnce(C,/^Hare-Trigger/,{s:"Hare-Trigger (Harengon): Proficiency Bonus",v:ctx.i.pb});return ctx.patch()}});
