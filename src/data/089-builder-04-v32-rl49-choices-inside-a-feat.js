/* v32 RL49: choices inside a feat. FEATS[n].skills (Skilled, skTools: tools too) and FEATS[n].pick [{k, t, n ("pb" = Proficiency Bonus), title, cats, from, list}].
   fk = the feat's own choice key (feat4, m0:feat8, lfo1) or its source ("Origin feat (Soldier)"). The builder shows these in the feat's card */
function toolAll(){var o=[];["art","music","game","other"].forEach(function(k){TOOLS[k].forEach(function(n){if(o.indexOf(n)<0)o.push(n)})});return o}
function featList(q){if(Array.isArray(q.list))return q.list;
 if(q.list==="maneuvers")return MANEUVERS.map(function(x){return [x[0],(typeof MAN_SUM!=="undefined"&&MAN_SUM[x[0]])||""]});/* v69 */
 if(q.list==="metamagic")return METAMAGIC.map(function(x){return [x[0],""]});
 if(q.list==="invocations"){var wl=wxCls().indexOf("Warlock")>=0;return INVOCATIONS.filter(function(x){return wl||!/\*\*Prerequisite\.\*\*/.test(x[1])}).map(function(x){return [x[0],""]})} if(q.list==="fstyle"&&R14())return fs14List(B.cls).map(function(n){return [n,""]});
 if(q.list==="fstyle")return ["Archery","Blind Fighting","Defense","Dueling","Great Weapon Fighting","Interception","Protection","Thrown Weapon Fighting","Two-Weapon Fighting","Unarmed Fighting"].filter(function(n){return FEATS[n]}).map(function(n){return [n,""]});
 if(q.list==="weapons")return wmKeys().map(function(n){return [n,""]});if(q.list==="ritual1")return SPELLS.filter(function(x){return x[1]===1&&x[9]}).map(function(x){return [x[0],x[11]]});return []}
function featPicks(){var out=[];allFeats().forEach(function(f){var F=FEATS[f.n];if(!F)return;var fk=f.key||f.s,m=/^m(\d+):/.exec(fk),mc=m?+m[1]:undefined,lv=+((/feat(\d+)$/.exec(fk)||[0,1])[1]);
  if(F.skills){var o0={key:"skl-"+fk,fk:fk,lvl:1,t:"skills",n:F.skills,from:ALLSK,title:f.n+" feat: "+F.skills+(F.skTools?" skills or tools":" skills"),src:f.s,feature:f.n};if(F.skTools)o0.tools=1;if(mc!=null)o0.mc=mc;out.push(o0)}
  (F.pick||[]).forEach(function(q){var o={key:q.k+"-"+fk,fk:fk,lvl:lv,t:q.t,n:q.n==="pb"?pbOf(TL()):q.n==="pb2"?Math.floor(pbOf(TL())/2):q.n,title:f.n+": "+q.title,src:f.s,feature:f.n};if(mc!=null)o.mc=mc;
   ["cats","dres"].forEach(function(k){if(q[k]!=null)o[k]=q[k]});if(q.from)o.from=q.from==="all"?ALLSK:q.from==="LANGS"?LANGS:q.from;if(q.list)o.list=featList(q);out.push(o)})});return out}
/* v32 RL49: tools from choices, other than the class, background, and multiclass tool (those replace the book text): [[name, source]] */
function toolChoices(CH){var o=[];(CH||choices()).forEach(function(c){var v=B.ch[c.key];if(!Array.isArray(v)||/^(clsTool|bgTool|m\d+:tool)$/.test(c.key))return;
  if(c.t==="tool")v.forEach(function(n){o.push([n,c.feature||c.title])});else if(c.t==="skills"&&c.tools)v.forEach(function(n){if(!SKILLS[n])o.push([n,c.feature||c.title])})});return o}
/* v32 RL49: fixed tools of subclasses (SUB_GRANT) and feats (FEATS.tools): [[name, source]] */
function grantTools(feats){var o=[];clsParts().forEach(function(q){var g=typeof SUB_GRANT!=="undefined"&&SUB_GRANT[q.sub];if(g&&g.tools)g.tools.forEach(function(s){if(q.lv>=s[0])o.push([s[1],g.f])})});
 (feats||allFeats()).forEach(function(f){var F=FEATS[f.n];if(F&&F.tools)o.push([F.tools,f.n])});return o}
/* v32: a starting-kit item with a generic tool name shows the tool chosen for that background or class ("Gaming Set" -> "Dice Set"). "" = none */
function kitTool(x){if(!x||!x.kit)return "";var g={"Gaming Set":["game"],"Musical Instrument":["music"],"Artisan's Tools":["art"],"Artisan's Tools or Musical Instrument":["art","music"]}[x.n];if(!g)return "";
 var v=x.src===B.bg+" kit"?B.ch.bgTool:x.src===B.cls+" kit"?B.ch.clsTool:null;return (v||[]).filter(function(n){return g.some(function(k){return TOOLS[k].indexOf(n)>=0})})[0]||""}
function choiceLvl(){var m={};choices(true).forEach(function(c){m[c.key]=c.lvl});return m}
function asiOf(f,F){var v=f.asi||{},o=[];if(!F)return o;if(F.asi2){if(v.a1&&A6.indexOf(v.a1)>=0)o.push([v.a1,v.a1===v.a2?2:1]);if(v.a2&&v.a2!==v.a1&&A6.indexOf(v.a2)>=0)o.push([v.a2,1])}else if(F.asi&&v.a1&&F.asi.indexOf(v.a1)>=0)o.push([v.a1,1]);return o}
function scoreAt(lvl,key){var sc={},lv=choiceLvl(),bg=bgX(),AF=allFeats(),me=AF.findIndex(function(f){return f.key===key});ABK.forEach(function(k){sc[k]=+B.base[k]||10});  var rb0=raceBonus();Object.keys(rb0).forEach(function(k){if(sc[k]!=null)sc[k]+=rb0[k]});if(bg&&!R14()){if(B.bgMode==="111")bg.ab.forEach(function(k){sc[k]++});else{if(B.bg2&&bg.ab.indexOf(B.bg2)>=0)sc[B.bg2]+=2;if(B.bg1&&B.bg1!==B.bg2&&bg.ab.indexOf(B.bg1)>=0)sc[B.bg1]++}}
 AF.forEach(function(f,i){if(!f.asi||!f.key||f.key===key||/^Boon of/.test(f.n))return;var l=lv[f.key]||1;if(l>lvl||(l===lvl&&(me<0||i>me)))return;/* v19 V19-2 */asiOf(f,FEATS[f.n]).forEach(function(p){sc[p[0]]=Math.min(20,sc[p[0]]+p[1])})});
 return sc}
/* saving throws a Resilient pick may not take: the main class's saves, and abilities other Resilient picks already took */
function saveTaken(key){var o=CL().saves.slice();allFeats().forEach(function(f){var F=FEATS[f.n];if(F&&F.saveFromAsi&&f.key!==key&&f.asi&&f.asi.a1&&o.indexOf(f.asi.a1)<0)o.push(f.asi.a1)});return o}
function featViol(){var out=[],seen={},lv=choiceLvl();
 allFeats().forEach(function(f){var F=FEATS[f.n];if(!F)return;var k=f.key||f.s,lvl=lv[f.key]||1,v=f.asi||{},s0=seen[f.n];
  if(s0&&!F.rep)out.push({k:k,m:/^Magic Initiate/.test(f.n)?f.n+" is taken twice. Magic Initiate can repeat only with a different spell list":f.n+" is taken twice, but it can be taken only once"});
  if(F.dt&&v.dt&&s0&&s0.indexOf(v.dt)>=0)out.push({k:k,m:f.n+" needs a different damage type each time. "+v.dt+" is taken already"});
  seen[f.n]=(s0||[]).concat(v.dt?[v.dt]:[]);
  if(F.asi&&!F.asi2&&v.a1&&F.asi.indexOf(v.a1)<0)out.push({k:k,m:f.n+" can raise only "+F.asi.join(", ")+", not "+v.a1+". The increase is not counted"});
  if(F.saveFromAsi&&v.a1&&saveTaken(f.key).indexOf(v.a1)>=0)out.push({k:k,m:f.n+" must use an ability without saving throw proficiency, and you already have it for "+v.a1});
  if(f.key&&!/^Boon of/.test(f.n)){var sc=scoreAt(lvl,f.key);asiOf(f,F).forEach(function(q){if(sc[q[0]]+q[1]>20)out.push({k:k,m:f.n+": "+q[0]+" is "+sc[q[0]]+" at level "+lvl+", so +"+q[1]+" would go past 20, the maximum"})})}
  if(f.key&&typeof preFail==="function"){var why=preFail(f.n,lvl,f.key);if(why)out.push({k:k,m:f.n+": its prerequisite is not met at level "+lvl+" (needs "+why+")"})}});
 return out}
function choices(noFeat){
 var c=CL(),L=B.level,out=[];
 function add(o){out.push(o)}
 add({key:"clsk",lvl:1,t:"skills",n:c.sk.n,from:c.sk.from,title:"Class skills",src:SRC+", "+B.cls+" 1"});
 if(c.toolPick)add({key:"clsTool",lvl:1,t:"tool",n:c.toolPick.n,cats:c.toolPick.cats,title:B.cls+" tools",src:SRC+", "+B.cls+" 1",feature:"Core "+B.cls+" Traits"});/* v32 RL49 */
 var bgt=bgX();if(bgt&&bgt.toolPick)add({key:"bgTool",lvl:1,t:"tool",n:bgt.toolPick.n,cats:bgt.toolPick.cats,title:B.bg+" tool",src:SRC+", "+B.bg+" background",feature:"Tool Proficiency"});
 if(bgt&&bgt.skPick)add({key:"bgsk",lvl:1,t:"skills",n:bgt.skPick.n,from:bgt.skPick.from==="all"?ALLSK:bgt.skPick.from,title:B.bg+" skill",src:SRC+", "+B.bg+" background",feature:"Skill Proficiency"});/* v70 */ if(!R14()&&bgt&&bgt.featOpts)add({key:"bgfeatc",lvl:1,t:"bgfp",def:bgt.feat,opts:bgt.featOpts,title:B.bg+" feat (default "+bgt.feat+")",src:SRC+", "+B.bg+" background",feature:"Origin Feat"});/* v67 */
 var sp=spX();
 if(sp&&sp.lin)add({key:"lin",lvl:1,t:"lin",title:sp.lin.label,src:B.species});
 if(sp&&sp.linCan&&B.ch.lin){var lcq=sp.linCan[Object.keys(sp.linCan).filter(function(k){return B.ch.lin.indexOf(k)===0})[0]];if(lcq)add({key:"hecan",lvl:1,t:"multi",n:1,def:[lcq.def],list:SPELLS.filter(function(x){return !x[1]&&x[3].indexOf(lcq.list)>=0}).map(function(x){return [x[0],x[11]]}),title:"Lineage cantrip (default "+lcq.def+")",src:B.species,feature:sp.lin.label})}/* v32 RL49 no. 43 */ if(R14()&&sp&&sp.asiFlex){var rm=B.ch.rasim||"+2 and +1",abl=ABK.map(function(k){return [k,ABN[k]]});add({key:"rasim",lvl:1,t:"opt",list:"Race Ability Mode",title:"Ability score increase pattern",src:B.species,feature:"Ability Score Increase"});if(rm==="+1, +1, +1")add({key:"rasi",lvl:1,t:"multi",n:3,list:abl,title:"Ability +1 (three scores)",src:B.species,feature:"Ability Score Increase"});else{add({key:"rasi",lvl:1,t:"multi",n:1,list:abl,title:"Ability +2",src:B.species,feature:"Ability Score Increase"});add({key:"rasi1",lvl:1,t:"multi",n:1,list:abl.filter(function(x){return (B.ch.rasi||[])[0]!==x[0]}),title:"Ability +1",src:B.species,feature:"Ability Score Increase"})}}/* v83 */ if(R14()&&sp&&sp.asiPick)add({key:"rasi",lvl:1,t:"multi",n:sp.asiPick.n,list:ABK.filter(function(k){return (sp.asiPick.ex||[]).indexOf(k)<0}).map(function(k){return [k,ABN[k]]}),title:"Ability score increases",src:B.species,feature:"Ability Score Increase"});/* v82: 2014 race choice */ if(sp&&sp.spAb==="choose")add({key:"spab",lvl:1,t:"opt",list:"Species Spellcasting Ability",title:"Species spellcasting ability",src:B.species,feature:sp.spAbTrait});/* RL35 2b, v38 p15 */
 if(sp&&sp.skillPick)add({key:"spsk",lvl:1,t:"skills",n:sp.skillPick.n,from:sp.skillPick.from,title:sp.skillPick.label+" skill",src:B.species,feature:sp.skillPick.label});
 if(sp&&sp.toolPick)add({key:"sptool",lvl:1,t:"tool",n:sp.toolPick.n,cats:sp.toolPick.cats,title:sp.toolPick.label+" tool",src:B.species,feature:sp.toolPick.label});/* v58: EFotA species with a tool of your choice (Warforged) */
 if(sp&&sp.opts)add({key:"spopt",lvl:1,t:"multi",n:sp.opts.n,list:sp.opts.list.map(function(x){return [x[0],x[1]]}),title:sp.opts.label,src:B.species});
 var SFX=spOptFx(); if(!R14()&&spHasFeat())add({key:"spfeat",lvl:1,t:"ofeat",title:"Versatile: Origin feat",src:B.species,feature:"Versatile"});
 if(SFX.skills)add({key:"spsk2",lvl:1,t:"skills",n:SFX.skills,from:ALLSK,title:"Skillful skills",src:B.species});
 if(SFX.cantrip)add({key:"spcan",lvl:1,t:"multi",n:1,list:SPELLS.filter(function(x){return !x[1]&&x[3].indexOf(SFX.cantrip)>=0}).map(function(x){return [x[0],x[11]]}),title:SFX.cantripLabel||"Limited Spellcaster cantrip",src:B.species});
 if(sp&&sp.wpPick)add({key:"spwp",lvl:1,t:"multi",n:sp.wpPick.n,list:Object.keys(WEAPONS).filter(function(n){return WEAPONS[n].cat===sp.wpPick.cat&&!WEAPONS[n].xw&&!WEAPONS[n].nm}).map(function(n){return [n,WEAPONS[n].m+": "+MASTERY[WEAPONS[n].m]]}),title:sp.wpPick.label+" weapons",src:B.species,feature:sp.wpPick.label});/* v74: species with a weapon choice (Hobgoblin) */
 if(SFX.weapon)add({key:"spwep",lvl:1,t:"multi",n:1,list:wmKeys().map(function(n){return [n,WEAPONS[n].m+": "+MASTERY[WEAPONS[n].m]]}),title:"Masterful weapon",src:B.species});
 subChoicesFor(B.sub).forEach(function(q){if(L>=q.l)add(q.kind==="opt"?{key:"sc"+q.k,lvl:q.l,t:"multi",n:q.n,list:q.list,title:q.title,src:B.sub+" "+q.l,feature:q.feature}:{key:"sc"+q.k,lvl:q.l,t:"skills",n:q.n,from:q.from,title:q.title,src:B.sub+" "+q.l,feature:q.feature})});
 if(c.wm&&!R14())add({key:"wm",lvl:1,t:"wm",n:c.wm[L-1],melee:B.cls==="Barbarian"?1:0,title:"Weapon Mastery",src:SRC+", "+B.cls,feature:"Weapon Mastery"});
 if(c.fs&&L>=c.fs)add({key:"fs"+c.fs,lvl:c.fs,t:"fs",cls:B.cls,xopt:1,title:"Fighting Style",src:SRC+", "+B.cls+" "+c.fs,feature:"Fighting Style"});
 (c.pick||[]).forEach(function(p){if(L>=p.l){var o1=pk(p,B.cls+" "+p.l,B.cls);if(o1)add(o1)}}); if(L>=subLv(B.cls))add({key:"sub",lvl:subLv(B.cls),t:"sub",title:subLbl(B.cls),src:B.cls+" "+subLv(B.cls)});
 var ps=c.pickSub&&c.pickSub[B.sub];(ps||[]).forEach(function(p){var el=pEff(B.cls,B.sub,p);if(L>=el){var o2=pk(p,B.sub+" "+el,B.cls,B.sub);if(o2){o2.lvl=el;add(o2)}}});
 asiLevels().forEach(function(l){if(L>=l)add({key:"feat"+l,lvl:l,t:"feat",cat:"G",title:"Ability Score Improvement or feat",src:SRC+", General Feat ("+B.cls+" "+l+")"})});
 if(L>=19&&!R14())add({key:"feat19",lvl:19,t:"feat",cat:"E",title:"Epic Boon",src:SRC+", Epic Boon ("+B.cls+" 19)"});
 var fsv=c.fs?B.ch["fs"+c.fs]:null;
 if(fsv==="Blessed Warrior"||fsv==="Druidic Warrior"){var cl=fsv==="Blessed Warrior"?"Cleric":"Druid";add({key:"bwc",lvl:c.fs,t:"multi",n:2,list:SPELLS.filter(function(x){return !x[1]&&x[3].indexOf(cl)>=0}).map(function(x){return [x[0],x[11]]}),title:fsv+" cantrips",src:SRC+", "+B.cls+" "+c.fs,feature:"Fighting Style"})}
 var invs=[];Object.keys(B.ch).forEach(function(k){if(/invocation$/.test(k))invs=invs.concat(B.ch[k]||[])});
 var wmc=wlMc(),wx=function(o,n){o.lvl=invLvl(n);o.feature="Eldritch Invocations";o.inv=n;o.src=SRC+", "+n+" (Warlock "+o.lvl+(wmc!=null?", multiclass":"")+")";if(wmc!=null)o.mc=wmc;return o};/* v32 RL50: card of the Warlock part */
 if(clsLv("Warlock")&&invs.indexOf("Pact of the Tome")>=0){add(wx({key:"tomeC",t:"multi",n:3,list:SPELLS.filter(function(x){return !x[1]}).map(function(x){return [x[0],x[11]]}),title:"Book of Shadows: 3 cantrips"},"Pact of the Tome"));
  if(!R14())add(wx({key:"tomeR",t:"multi",n:2,list:SPELLS.filter(function(x){return x[1]===1&&x[9]}).map(function(x){return [x[0],x[11]]}),title:"Book of Shadows: 2 level 1 Rituals"},"Pact of the Tome"))}
 if(R14()&&clsLv("Warlock")&&invs.indexOf("Pact of the Tome")>=0&&invs.indexOf("Book of Ancient Secrets")>=0)add(wx({key:"tomeR",t:"multi",n:2,list:SPELLS.filter(function(x){return x[1]===1&&x[9]}).map(function(x){return [x[0],x[11]]}),title:"Book of Ancient Secrets: 2 level 1 Rituals"},"Book of Ancient Secrets"));/* v90: 2014 rituals come from the invocation */
 invPicks().forEach(add);/* v32 RL49 no. 19 to 22 */
 if(invs.indexOf("Pact of the Blade")>=0)add(wx({key:"pactWep",t:"multi",n:1,list:pactList(),title:"Pact of the Blade: pact weapon"},"Pact of the Blade"));/* M13 */ if(R14()){var lgn=((sp&&sp.lgn)||0)+(B.species==="Custom"?1:0)+((bgt&&bgt.lgn)||0);/* v99: a custom 2014 race gets one language of your choice next to Common */if(lgn>0)add({key:"lang",lvl:1,t:"lang",n:lgn,from:LANGS,title:"Languages",src:(sp?B.species:"Race")+(bgt&&bgt.lgn?", "+B.bg+" background":""),feature:"Languages"})}else add({key:"lang",lvl:1,t:"lang",n:2,from:LANGS,title:"Languages",src:SRC+", Character Origins",feature:"Languages"});/* v84 */
 if(B.cls==="Rogue"&&!R14())add({key:"langRogue",lvl:1,t:"lang",n:1,from:LANGS,title:"Extra language",src:SRC+", Rogue 1",feature:"Thieves' Cant"});
 if(B.cls==="Ranger"&&L>=2&&!R14())add({key:"langRanger",lvl:2,t:"lang",n:2,from:LANGS,title:"Languages",src:SRC+", Ranger 2",feature:"Deft Explorer"});
 if(!noFeat)featPicks().forEach(add);/* M17: FEATS.skills. v32 RL49: FEATS.pick */
 mcChoices().forEach(function(o){out.push(o)});
 hbSpellPicks().forEach(function(o){out.push(o)});/* v20 RD24 */
 if(!noFeat)featSpellPicks().forEach(function(o){out.push(o)});/* v21 i3 */
 return out.sort(function(a,b){return a.lvl-b.lvl});
}
/* M13: weapon bonded by Pact of the Blade (any Warlock part), "" when the invocation is not taken or no weapon is chosen yet */
/* RU34: a species trait that holds a choice shows the chosen option (name and effect) under "Your choice", not only the list of options.
   Trait with several options (Retron Domesticated Ancestry): the text becomes the chosen options with their effects. No choice yet: book text */
function spTraitText(sp,t){var n=t[0],d=t[1],ch=B.ch||{},o=[];function L(a){return (a||[]).join(", ")}
 if(sp.linText&&sp.lin&&n===sp.lin.label&&ch.lin&&sp.linText[ch.lin])return sp.linText[ch.lin]+" **Your choice.** "+ch.lin+".";/* v20 RD25: only the chosen ancestry */
 if(sp.opts&&n===sp.opts.label&&(ch.spopt||[]).length){var r=(ch.spopt||[]).map(function(k){var x=sp.opts.list.filter(function(y){return y[0]===k})[0];if(!x)return "";var fx=x[2]||{},p="";
   if(fx.skills&&(ch.spsk2||[]).length)p="Skills: "+L(ch.spsk2)+".";if(fx.cantrip&&(ch.spcan||[]).length)p="Cantrip: "+L(ch.spcan)+".";if(fx.weapon&&(ch.spwep||[]).length)p="Weapon: "+L(ch.spwep)+".";if(fx.feat&&ch.spfeat)p="Origin feat: "+ch.spfeat+".";
   return "\n\n**"+k+".** "+x[1]+(p?" "+p:"")}).join("");
  return "You chose "+(ch.spopt.length>1?ch.spopt.length+" options":"one option")+" from this trait."+r+(ch.spopt.length<sp.opts.n?" **Still open.** Choose "+(sp.opts.n-ch.spopt.length)+" more in the builder.":"")}
 if(sp.skillPick&&n===sp.skillPick.label&&(ch.spsk||[]).length)o.push("Skill: "+L(ch.spsk)+".");
 if(sp.featPick&&n==="Versatile"&&ch.spfeat)o.push("Origin feat: "+ch.spfeat+".");
 if(sp.toolPick&&n===sp.toolPick.label&&(ch.sptool||[]).length)o.push("Tool: "+L(ch.sptool)+".");/* v74 */
 if(sp.wpPick&&n===sp.wpPick.label&&(ch.spwp||[]).length)o.push("Weapons: "+L(ch.spwp)+".");
 if(sp.fx&&sp.fx.cantripTrait===n&&(ch.spcan||[]).length)o.push("Cantrip: "+L(ch.spcan)+".");
 if(sp.lin&&n===sp.lin.label&&ch.lin){o.push(ch.lin+".");if(sp.spAb==="choose"&&ch.spab)o.push("Spellcasting ability: "+ch.spab+".")}
 if(sp.lin&&ch.lin&&!spLinTrait(sp)&&/ancestr|lineage|legacy/i.test(d))o.push(sp.lin.label+": "+ch.lin+".");/* V14-6: Dragonborn Breath Weapon, Damage Resistance */
 var open=(sp.skillPick&&n===sp.skillPick.label&&!(ch.spsk||[]).length)||(sp.featPick&&n==="Versatile"&&!ch.spfeat)||(sp.lin&&n===sp.lin.label&&!ch.lin)||(sp.opts&&n===sp.opts.label&&!(ch.spopt||[]).length)||(sp.toolPick&&n===sp.toolPick.label&&!(ch.sptool||[]).length)||(sp.wpPick&&n===sp.wpPick.label&&(ch.spwp||[]).length<sp.wpPick.n)||(sp.fx&&sp.fx.cantripTrait===n&&!(ch.spcan||[]).length);
 return o.length?d+" **Your choice.** "+o.join(" "):open?d+" **Still open.** Choose this in the builder.":d}
function linNote(sp){var sn=B.species;if(sn!=="Dragonborn"&&sn!=="Dragonborn (2014)")return "";var v=B.ch.lin||"",m=/^(\w+) \((\w+)\)$/.exec(v);
 if(!m)return '<p class="fd bhint">The dragon type sets the damage type of your Breath Weapon and of your Damage Resistance.</p>';
 var col=m[1],dt=m[2],r14=sn==="Dragonborn (2014)",line=["Black","Blue","Brass","Bronze","Copper"].indexOf(col)>=0,con=["Green","Silver","White"].indexOf(col)>=0,t;
 if(r14)t='<b>Breath Weapon:</b> '+(line?'5 by 30 ft line':'15 ft cone')+', '+(con?'Constitution':'Dexterity')+' save, '+dt+' damage. <b>Damage Resistance:</b> '+dt+'.';
 else t='<b>Breath Weapon:</b> 15 ft cone or 30 ft line, Dexterity save, '+dt+' damage. <b>Damage Resistance:</b> '+dt+'.';
 return '<p class="fd" id="linNote">'+t+' The sheet applies both for you.</p>';}/* v100: the ancestry choice showed no effect */
function spLinTrait(sp){return sp.traits.some(function(t){return t[0]===sp.lin.label})}
/* RD19: structured spell data on each C.spells entry (optional fields): fx (SPELL_FX without mat), mat (material text), db [{v,s}] flat damage
   bonus from features, tx alternative damage type from a feature. The sheet computes the dice at the chosen slot and character level */
function subAt(cls,sub){if(B.cls===cls&&B.sub===sub)return B.level;var m=MCL().filter(function(q){return q.cls===cls&&q.sub===sub})[0];return m?m.lv:0}
function spFxTo(o,k,a){var F=typeof SPELL_FX!=="undefined"&&SPELL_FX[o.n];if(!F)return;var f=clone(F);if(f.mat){o.mat=f.mat;delete f.mat}if(Object.keys(f).length)o.fx=f;
 var db=[],hb=[],ab=function(x){return mod(a.sc[x])},iv=invList(),ty=(f.dmg||[]).map(function(p){return p[1]}).join("|");
 if(f.dmg&&agOn(o.n))db.push({v:ab(spellAb(k||"Warlock",a.sc)||"CHA"),s:"Agonizing Blast"});
 var eat=eaType();if(f.dmg&&eat&&ty.split("|").indexOf(eat)>=0)db.push({v:ab("CHA"),s:"Elemental Affinity ("+eat+")"});/* v19 RL41 */
 if(f.dmg&&!o.l&&(k==="Cleric"||k==="Druid")&&clsLv(k)>=7&&(k===B.cls?B.ch.p7opt:B.ch["m"+MCL().map(function(m){return m.cls}).indexOf(k)+":p7opt"])==="Potent Spellcasting")db.push({v:ab("WIS"),s:"Potent Spellcasting"});
 if(f.dmg&&k==="Wizard"&&o.sch==="Evocation"&&subAt("Wizard","Evoker")>=10)db.push({v:ab("INT"),s:"Empowered Evocation, one damage roll"});
 if(f.dmg&&k==="Warlock"&&subAt("Warlock","Celestial Patron")>=6&&/Radiant|Fire/.test(ty))db.push({v:ab("CHA"),s:"Radiant Soul, one Radiant or Fire damage roll"});
 if(f.heal&&o.l&&subAt("Cleric","Life Domain")>=3)hb.push({v:2,lv:1,s:"Disciple of Life"});
 if(db.length)o.db=db;if(hb.length)o.hb=hb;if(f.dmg&&k==="Warlock"&&subAt("Warlock","Great Old One Patron")>=3)o.tx="Psychic"}
/* ---------- v17 ---------- */
/* RU40: class level that unlocks a subclass feature (subclass of the main class or a multiclass) */
function subClsOf(sub){var o=null;Object.keys(CLASSES).forEach(function(c){if(CLASSES[c].subs&&CLASSES[c].subs[sub])o=c});return o}
function luMax(m,lv,a,pb){if(typeof m==="number")return m;if(Array.isArray(m))return +m[lv-1]||0;if(m==="pb")return pb;if(m==="pb2")return 2*pb;if(m==="lvl")return lv;if(m==="half")return Math.floor(lv/2);
 if(typeof m==="string"&&m.indexOf("mod:")===0)return Math.max(1,mod(a.sc[m.slice(4)]));
 if(m&&m.f){var f=String(m.f).replace(/mod:([A-Z]{3})/g,function(_,k){return "("+mod(a.sc[k])+")"}).replace(/lvl/g,lv).replace(/pb/g,pb),v=0;if(/^[0-9+*\-\/() ]+$/.test(f)){try{v=Function("return ("+f+")")()}catch(e){v=0}}return Math.max(m.min||0,Math.floor(v))}return 0}
/* RU40: one Limited Use row per LU_X entry the character has, plus magic item charges. f = the feature or item that grants it (boxes show under it too) */
function luRows(C,a,pb,feats){var TLv=TL(),iv=invList();
 (typeof LU_X!=="undefined"?LU_X:[]).forEach(function(e){var lv=0;
  if(e.src==="feat"){if(!feats.some(function(f){return f.n===e.owner}))return;lv=TLv}
  else if(e.src==="species"){var sp=spX();if(!sp||B.species!==e.owner)return;if(/Speak with Animals/.test(e.n)&&(B.ch.lin||"").indexOf("Forest")!==0)return;if(e.opt&&(B.ch.spopt||[]).indexOf(e.opt)<0)return;lv=TLv}/* v74: e.opt, only when that species option is chosen */
  else if(e.src==="class"){lv=clsLv(e.owner);if(e.feature==="Eldritch Invocations"){var inv=e.n.split(":")[0];if(iv.indexOf(inv)<0)return}}
  else if(e.src==="sub"){var sc=subClsOf(e.owner);lv=sc?subAt(sc,e.owner):0}
  else if(e.src==="hbcls"){if(!(B.src||{})[e.pack])return;lv=clsLv(e.owner)}/* v20 RD24: a pack's class feature */
  if(!lv||lv<e.lvl)return;var m=luMax(e.max,lv,a,pb);if(!(m>0))return;
  var rs=e.reset==="dawn"?"long":e.reset==="init"?"short":e.reset;if(e.short6&&lv>=6)rs="short";
  var o={k:resKey("x-",e.n,C.res),n:e.n,tag:e.tag||"",max:m,reset:rs,f:e.feature};if(e.pool)o.pool=1;if((e.src==="species"||e.src==="feat")&&e.owner)o.own=e.owner;/* v21 RU49 */if(e.reset==="init")o.tag=(o.tag?o.tag+", ":"")+"also regained when you roll Initiative";if(e.die)o.tag=(o.tag?o.tag+", ":"")+e.die;C.res.push(o)});
 ensureInv().forEach(function(x){var d=DMAP[x.n],ch=d&&d[5]&&d[5].ch;if(!ch)return;if(d[3]&&!x.eq)return;var mx=+ch[0],dm=null;if(!(mx>0)){dm=diceTop(ch[0]);if(!(dm>0))return;mx=dm}/* v21 RU44: a starting number rolled on dice */var nev=ch[2]==="never"||String(ch[1])==="0",full=String(ch[1])==="all"||+ch[1]===mx,dym=/^([\dd]+) (days?|hours?)$/.exec(ch[2]);
  if(dym){C.res.push({k:resKey("i-",x.n,C.res),n:x.n,tag:"Each use is back after "+dym[1]+" "+dym[2]+". Tick it back when the time has passed."+(ch[3]?" "+ch[3]+".":""),max:mx,reset:"none",f:x.n,item:1});return}/* v56: Figurine of Wondrous Power and other items with a wait in days */
  var when={dawn:"at dawn",dusk:"at dusk",long:"on a Long Rest",short:"on a Short Rest"}[ch[2]]||ch[2];
  C.res.push({k:resKey("i-",x.n,C.res),n:x.n,tag:(nev?"Charges, not regained":full?"Charges, all back "+when:"Charges, regains "+ch[1]+" "+when+" (type the roll in the rest dialog)")+(ch[3]?". "+ch[3]:""),max:mx,reset:nev?"none":full?(ch[2]==="short"?"short":"long"):"none",f:x.n,item:1,rg:!nev&&!full?String(ch[1]):undefined,when:!nev&&!full?ch[2]:undefined,dmax:dm?String(ch[0]):undefined})});
 activeFx().forEach(function(q){var n=q.fx&&q.fx.arcRec;if(n)C.res.forEach(function(r){if(r.n==='Arcane Recovery'&&r.max<n){r.max=n;r.tag=(r.tag?r.tag+'. ':'')+q.n+': '+n+' uses between Long Rests'}})})/* v100: Grimoire Infinitus (Exalted) */}
/* v21 RU44: highest result of a dice expression such as "1d6+3" or "2d8+4" (0 when it is not one) */
function diceTop(t){var m=/^\s*(\d+)d(\d+)\s*(?:([+-])\s*(\d+))?\s*$/.exec(String(t||""));if(!m)return 0;return (+m[1])*(+m[2])+(m[3]==="-"?-1:1)*(+(m[4]||0))}
/* RU35 no. 5: features that add damage, as rows in Actions (C.xdmg [{n, sub, dmg, type, note, save, dc, src}]) */
function xdmgRows(a,pb){var out=[],TLv=TL(),iv=invList(),SA=slotsAll();
 (typeof FDMG!=="undefined"?FDMG:[]).forEach(function(r){var kind=r[0],own=r[1],lv=0;
  if(kind==="inv"){if(iv.indexOf(own)<0)return;lv=clsLv("Warlock")}
  else if(kind==="cls")lv=clsLv(own);
  else if(kind==="sub"){var sc=subClsOf(own);lv=sc?subAt(sc,own):0}
  else if(kind==="sp"){if(un("species")||B.species!==own)return;lv=TLv}
  if(!lv||lv<r[3])return;var g=r[10];if(g){var gp=g.split(":");if(/^p\d+opt$/.test(gp[0])&&B.ch[gp[0]]!==gp[1])return;if(gp[0]==="lin"&&(B.ch.lin||"").indexOf(gp[1])!==0)return}
  var dice=r[4]==="smite"?(SA.pact?(1+SA.pact.lvl)+"d8":""):r[4][lv-1]||"";if(!dice)return;
  dice=dice.replace(/^([A-Z]{3})d(\d+)/,function(_,k,dd){return Math.max(1,mod(a.sc[k]))+"d"+dd});if(r[9])dice+=(mod(a.sc[r[9]])<0?"":"+")+mod(a.sc[r[9]]);
  var ty=r[5];if(ty==="lin"){var mm=/\(([A-Za-z]+)\)/.exec(B.ch.lin||"");ty=mm?mm[1]:"ancestry type"}else if(ty==="weapon")ty="Weapon type";
  out.push({n:r[2],sub:kind==="inv"?"Eldritch Invocation":kind==="sp"?B.species:own,dmg:dice,type:ty.split("|").join(" or "),note:r[6],save:r[7]||"",dc:r[7]?8+mod(a.sc[r[8]])+pb:null,lv:lv})});
 return out}
/* RU35 no. 6: notes under Saving Throws (Advantage and bonuses from features, feats, species, items) */
function saveNotes(feats){var o=[],seen={},fn=feats.map(function(f){return f.n}),iv=invList(),sp=spX(),tr=sp?sp.traits.map(function(t){return t[0]}):[],cf=[];
 clsParts().forEach(function(q){featsOf(q.cls,q.lv).forEach(function(x){cf.push(x[1])});var s=q.sub||(q.cls===B.cls?B.sub:"");if(s&&CLASSES[q.cls].subs[s])CLASSES[q.cls].subs[s].forEach(function(x){if(x[0]<=q.lv)cf.push(x[1])})});
 (typeof SAVE_NOTES!=="undefined"?SAVE_NOTES:[]).forEach(function(s){if(!s[2]||seen[s[1]+s[2]])return;var has=s[0]==="feat"?fn.indexOf(s[1])>=0:s[0]==="inv"?iv.indexOf(s[1])>=0:s[0]==="trait"?tr.indexOf(s[1])>=0:cf.indexOf(s[1])>=0;if(has){seen[s[1]+s[2]]=1;o.push({t:s[2],s:s[1]})}});
 activeFx().forEach(function(q){(q.fx.adv||[]).forEach(function(k){if(/save|Concentration/i.test(k))o.push({t:"Advantage: "+k,s:q.n})})});
 return o}
function invList(){var iv=[];Object.keys(B.ch||{}).forEach(function(k){if(/invocation$/.test(k))iv=iv.concat(B.ch[k]||[])});return iv}
