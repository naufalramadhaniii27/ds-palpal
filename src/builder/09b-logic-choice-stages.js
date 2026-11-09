/* choices() in stages (SOLID stage 13C). The owner of choicesBuild; builder/09 keeps choices() as a thin wrapper that calls it through the late port. */
import {bindLive,clsLv,invLvl,invPicks,mcChoices,pactList,pk,spHasFeat,subChoicesFor,wlMc} from "./01b-logic-late-ports.js";import {ABK,ABN,SRC} from "./01-logic-core-helpers.js";
import {bgX,spX} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14} from "./05-logic-choice-model-ruleset.js";
import {pEff,subLbl,subLv} from "./08-logic-2014-rules.js";
import {asiLevels,featPicks,featSpellPicks,gxPicks,hbSpellPicks} from "./09-logic-feats-and-choices.js";
import {spOptFx,fxList} from "./01b-logic-late-ports.js";
import {gx} from "./00-env.js";
bindLive("choicesBuild",{get:function(){return choicesBuild;}});
/* choices() in stages, in the same order as before. Each stage adds its picks with add(); the stages share only the values passed in. */
function chBase(add,c){
 add({key:"clsk",lvl:1,t:"skills",n:c.sk.n,from:c.sk.from,title:"Class skills",src:SRC+", "+B.cls+" 1"});
 if(c.toolPick)add({key:"clsTool",lvl:1,t:"tool",n:c.toolPick.n,cats:c.toolPick.cats,title:B.cls+" tools",src:SRC+", "+B.cls+" 1",feature:"Core "+B.cls+" Traits"});/* v32 RL49 */
}
function chBg(add,bgt){
 if(bgt&&bgt.toolPick)add({key:"bgTool",lvl:1,t:"tool",n:bgt.toolPick.n,cats:bgt.toolPick.cats,title:B.bg+" tool",src:SRC+", "+B.bg+" background",feature:"Tool Proficiency"});
 if(bgt&&bgt.skPick)add({key:"bgsk",lvl:1,t:"skills",n:bgt.skPick.n,from:bgt.skPick.from==="all"?ALLSK:bgt.skPick.from,title:B.bg+" skill",src:SRC+", "+B.bg+" background",feature:"Skill Proficiency"});/* v70 */
 if(!R14()&&bgt&&bgt["featOpts"])add({key:"bgfeatc",lvl:1,t:"bgfp",def:bgt.feat,opts:bgt["featOpts"],title:B.bg+" feat (default "+bgt.feat+")",src:SRC+", "+B.bg+" background",feature:"Origin Feat"});/* v67 */
}
function chSpLin(add,sp){
 if(sp&&sp.lin)add({key:"lin",lvl:1,t:"lin",title:sp.lin.label,src:B.species});
 if(sp&&sp.linCan&&B.ch.lin){const lcq=sp.linCan[Object.keys(sp.linCan).filter((k) =>{return B.ch.lin.indexOf(k)===0})[0]];if(lcq)add({key:"hecan",lvl:1,t:"multi",n:1,def:[lcq.def],list:SPELLS.filter((x) =>{return !x[1]&&x[3].indexOf(lcq.list)>=0}).map((x) =>{return [x[0],x[11]]}),title:"Lineage cantrip (default "+lcq.def+")",src:B.species,feature:sp.lin.label})}/* v32 RL49 no. 43 */
}
function chSpR14(add,sp){
 if(R14()&&sp&&sp.asiFlex){const rm=B.ch.rasim||"+2 and +1",abl=ABK.map((k) =>{return [k,ABN[k]]});add({key:"rasim",lvl:1,t:"opt",list:"Race Ability Mode",title:"Ability score increase pattern",src:B.species,feature:"Ability Score Increase"});if(rm==="+1, +1, +1")add({key:"rasi",lvl:1,t:"multi",n:3,list:abl,title:"Ability +1 (three scores)",src:B.species,feature:"Ability Score Increase"});else{add({key:"rasi",lvl:1,t:"multi",n:1,list:abl,title:"Ability +2",src:B.species,feature:"Ability Score Increase"});add({key:"rasi1",lvl:1,t:"multi",n:1,list:abl.filter((x) =>{return (B.ch.rasi||[])[0]!==x[0]}),title:"Ability +1",src:B.species,feature:"Ability Score Increase"})}}/* v83 */
 if(R14()&&sp&&sp.asiPick)add({key:"rasi",lvl:1,t:"multi",n:sp.asiPick.n,list:ABK.filter((k) =>{return (sp.asiPick.ex||[]).indexOf(k)<0}).map((k) =>{return [k,ABN[k]]}),title:"Ability score increases",src:B.species,feature:"Ability Score Increase"});/* v82: 2014 race choice */
 if(sp&&sp.spAb==="choose")add({key:"spab",lvl:1,t:"opt",list:"Species Spellcasting Ability",title:"Species spellcasting ability",src:B.species,feature:sp.spAbTrait});/* RL35 2b, v38 p15 */
}
function chSpPicks(add,sp){
 if(sp&&sp.skillPick)add({key:"spsk",lvl:1,t:"skills",n:sp.skillPick.n,from:sp.skillPick.from,title:sp.skillPick.label+" skill",src:B.species,feature:sp.skillPick.label});
 if(sp&&sp.toolPick)add({key:"sptool",lvl:1,t:"tool",n:sp.toolPick.n,cats:sp.toolPick.cats,title:sp.toolPick.label+" tool",src:B.species,feature:sp.toolPick.label});/* v58: EFotA species with a tool of your choice (Warforged) */
 if(sp&&sp.opts)add({key:"spopt",lvl:1,t:"multi",n:sp.opts.n,list:sp.opts.list.map((x) =>{return [x[0],x[1]]}),title:sp.opts.label,src:B.species});
}
function chSpFx(add,sp,SFX){
 if(!R14()&&spHasFeat())add({key:"spfeat",lvl:1,t:"ofeat",title:"Versatile: Origin feat",src:B.species,feature:"Versatile"});
 if(SFX.skills)add({key:"spsk2",lvl:1,t:"skills",n:SFX.skills,from:ALLSK,title:"Skillful skills",src:B.species});
 if(SFX.cantrip)add({key:"spcan",lvl:1,t:"multi",n:1,list:SPELLS.filter((x) =>{return !x[1]&&x[3].indexOf(SFX.cantrip)>=0}).map((x) =>{return [x[0],x[11]]}),title:SFX.cantripLabel||"Limited Spellcaster cantrip",src:B.species});
 if(sp&&sp.wpPick)add({key:"spwp",lvl:1,t:"multi",n:sp.wpPick.n,list:Object.keys(WEAPONS).filter((n) =>{return WEAPONS[n].cat===sp.wpPick.cat&&!WEAPONS[n].xw&&!WEAPONS[n].nm}).map((n) =>{return [n,WEAPONS[n].m+": "+MASTERY[WEAPONS[n].m]]}),title:sp.wpPick.label+" weapons",src:B.species,feature:sp.wpPick.label});/* v74: species with a weapon choice (Hobgoblin) */
 if(SFX.weapon)add({key:"spwep",lvl:1,t:"multi",n:1,list:wmKeys().map((n) =>{return [n,WEAPONS[n].m+": "+MASTERY[WEAPONS[n].m]]}),title:"Masterful weapon",src:B.species});
}
function chSubFs(add,c,L){
 subChoicesFor(B.sub).forEach((q) =>{if(L>=q.l)add(q.kind==="opt"?{key:"sc"+q.k,lvl:q.l,t:"multi",n:q.n,list:q.list,title:q.title,src:B.sub+" "+q.l,feature:q.feature}:{key:"sc"+q.k,lvl:q.l,t:"skills",n:q.n,from:q.from,title:q.title,src:B.sub+" "+q.l,feature:q.feature})});
 if(gx().sub&&B.sub)(gx().sub[B.sub]||[]).forEach((e) =>{if(e.fsPick&&L>=(e.l||1))add({key:"sfs"+(e.l||1),lvl:e.l||1,t:"fs",cls:B.cls,xopt:1,title:"Fighting Style",src:B.sub+" "+(e.l||1),feature:e.n||"Fighting Style"})});/* fx engine v2: fsPick = a Fighting Style feat choice from a subclass */
}
function chClass(add,c,L){
 if(c.wm&&!R14())add({key:"wm",lvl:1,t:"wm",n:c.wm[L-1],melee:B.cls==="Barbarian"?1:0,title:"Weapon Mastery",src:SRC+", "+B.cls,feature:"Weapon Mastery"});
 if(c.fs&&L>=c.fs)add({key:"fs"+c.fs,lvl:c.fs,t:"fs",cls:B.cls,xopt:1,title:"Fighting Style",src:SRC+", "+B.cls+" "+c.fs,feature:"Fighting Style"});
 (c.pick||[]).forEach((p) =>{if(L>=p.l){const o1=pk(p,B.cls+" "+p.l,B.cls);if(o1)add(o1)}}); if(L>=subLv(B.cls))add({key:"sub",lvl:subLv(B.cls),t:"sub",title:subLbl(B.cls),src:B.cls+" "+subLv(B.cls)});
 const ps=c.pickSub&&c.pickSub[B.sub];(ps||[]).forEach((p) =>{const el=pEff(B.cls,B.sub,p);if(L>=el){const o2=pk(p,B.sub+" "+el,B.cls,B.sub);if(o2){o2.lvl=el;add(o2)}}});
 asiLevels().forEach((l) =>{if(L>=l)add({key:"feat"+l,lvl:l,t:"feat",cat:"G",title:"Ability Score Improvement or feat",src:SRC+", General Feat ("+B.cls+" "+l+")"})});
 if(L>=19&&!R14())add({key:"feat19",lvl:19,t:"feat",cat:"E",title:"Epic Boon",src:SRC+", Epic Boon ("+B.cls+" 19)"});
}
function chFsv(add,c){
 const fsv=c.fs?B.ch["fs"+c.fs]:null;
 if(fsv==="Blessed Warrior"||fsv==="Druidic Warrior"){const cl=fsv==="Blessed Warrior"?"Cleric":"Druid";add({key:"bwc",lvl:c.fs,t:"multi",n:2,list:SPELLS.filter((x) =>{return !x[1]&&x[3].indexOf(cl)>=0}).map((x) =>{return [x[0],x[11]]}),title:fsv+" cantrips",src:SRC+", "+B.cls+" "+c.fs,feature:"Fighting Style"})}
}
function chTome(add,invs,wx){
 if(clsLv("Warlock")&&invs.indexOf("Pact of the Tome")>=0){add(wx({key:"tomeC",t:"multi",n:3,list:SPELLS.filter((x) =>{return !x[1]}).map((x) =>{return [x[0],x[11]]}),title:"Book of Shadows: 3 cantrips"},"Pact of the Tome"));
  if(!R14())add(wx({key:"tomeR",t:"multi",n:2,list:SPELLS.filter((x) =>{return x[1]===1&&x[9]}).map((x) =>{return [x[0],x[11]]}),title:"Book of Shadows: 2 level 1 Rituals"},"Pact of the Tome"))}
 if(R14()&&clsLv("Warlock")&&invs.indexOf("Pact of the Tome")>=0&&invs.indexOf("Book of Ancient Secrets")>=0)add(wx({key:"tomeR",t:"multi",n:2,list:SPELLS.filter((x) =>{return x[1]===1&&x[9]}).map((x) =>{return [x[0],x[11]]}),title:"Book of Ancient Secrets: 2 level 1 Rituals"},"Book of Ancient Secrets"));/* v90: 2014 rituals come from the invocation */
}
function chWarlock(add){
 let invs=[];Object.keys(B.ch).forEach((k) =>{if(/invocation$/.test(k))invs=invs.concat(B.ch[k]||[])});
 const wmc=wlMc(),wx=function(o,n){o.lvl=invLvl(n);o.feature="Eldritch Invocations";o.inv=n;o.src=SRC+", "+n+" (Warlock "+o.lvl+(wmc!=null?", multiclass":"")+")";if(wmc!=null)o.mc=wmc;return o};/* v32 RL50: card of the Warlock part */
 chTome(add,invs,wx);
 invPicks().forEach(add);/* v32 RL49 no. 19 to 22 */
 if(invs.indexOf("Pact of the Blade")>=0)add(wx({key:"pactWep",t:"multi",n:1,list:pactList(),title:"Pact of the Blade: pact weapon"},"Pact of the Blade"));/* M13 */
 if(!R14()&&invs.indexOf("Pact of the Blade")>=0)add(wx({key:"pactDmg",t:"multi",n:1,opt:1,list:[["Necrotic","Pact weapon hits deal Necrotic damage instead of the weapon's type."],["Psychic","Pact weapon hits deal Psychic damage instead of the weapon's type."],["Radiant","Pact weapon hits deal Radiant damage instead of the weapon's type."]],title:"Pact of the Blade: damage type (optional, leave empty for the weapon's own type)"},"Pact of the Blade"));/* zero-miss-1 */
}
function chLang(add,c,L,sp,bgt){
 if(R14()){const lgn=((sp&&sp.lgn)||0)+(B.species==="Custom"?1:0)+((bgt&&bgt.lgn)||0);/* v99: a custom 2014 race gets one language of your choice next to Common */if(lgn>0)add({key:"lang",lvl:1,t:"lang",n:lgn,from:LANGS,title:"Languages",src:(sp?B.species:"Race")+(bgt&&bgt.lgn?", "+B.bg+" background":""),feature:"Languages"})}else add({key:"lang",lvl:1,t:"lang",n:2,from:LANGS,title:"Languages",src:SRC+", Character Origins",feature:"Languages"});/* v84 */
 if(B.cls==="Rogue"&&!R14())add({key:"langRogue",lvl:1,t:"lang",n:1,from:LANGS,title:"Extra language",src:SRC+", Rogue 1",feature:"Thieves' Cant"});
 if(B.cls==="Ranger"&&L>=2&&!R14())add({key:"langRanger",lvl:2,t:"lang",n:2,from:LANGS,title:"Languages",src:SRC+", Ranger 2",feature:"Deft Explorer"});
}
function chFxPicks(add,out,noFeat){
 if(!noFeat){gxPicks().forEach(add);featPicks().forEach(add);/* fx engine v6: wmAdd N = N more Weapon Mastery weapons (the first class slot "wm"; with no class mastery, a new slot) */let wa=0;fxList().forEach((e) =>{if(typeof e.wmAdd==="number")wa+=e.wmAdd});if(wa>0&&!R14()){const w0=out.filter((o) =>{return o.key==="wm"})[0];if(w0)w0.n+=wa;else add({key:"wm",lvl:1,t:"wm",n:wa,melee:0,title:"Weapon Mastery",src:SRC+", extra mastery",feature:"Weapon Mastery"})}}/* gxPicks reads gfx, which reads allFeats, which calls choices(true): so gx picks are skipped there *//* M17: FEATS.skills. v32 RL49: FEATS.pick */
}
export function choicesBuild(noFeat){
 const c=CL(),L=B.level,out=[];
 function add(o){out.push(o)}
 chBase(add,c);
 const bgt=bgX();chBg(add,bgt);
 const sp=spX();
 chSpLin(add,sp);chSpR14(add,sp);chSpPicks(add,sp);
 const SFX=spOptFx();chSpFx(add,sp,SFX);
 chSubFs(add,c,L);chClass(add,c,L);chFsv(add,c);chWarlock(add);chLang(add,c,L,sp,bgt);
 chFxPicks(add,out,noFeat);
 mcChoices().forEach((o) =>{out.push(o)});
 hbSpellPicks().forEach((o) =>{out.push(o)});/* v20 RD24 */
 if(!noFeat)featSpellPicks().forEach((o) =>{out.push(o)});/* v21 i3 */
 return out.sort((a,b) =>{return a.lvl-b.lvl});
}
