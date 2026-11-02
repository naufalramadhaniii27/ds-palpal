import {ABK,ABN,esc,mod,pbOf,sg} from "./01-logic-core-helpers.js";
import {bgX} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {R14} from "./05-logic-choice-model-ruleset.js";
import {chOf,choices,dmXl,featViol,hbSpellPicks,scoreAt,spClsJ} from "./09-logic-feats-and-choices.js";
import {bookNeed,bookOf,bookOwn,savVals} from "./10-logic-v17-additions.js";
import {abil,casterParts,clsLv,clsParts,isThird3,spLists,spellAb} from "./11-logic-derivation.js";
import {BASE,autoSpells,miFeats} from "./13-logic-sources-and-packs.js";
import {MCL,TL,mcReqFail,slotsAll} from "./14-logic-multiclass-hp-shop.js";
import {bI,card,openCards,ord,rtp} from "./17-ui-step-builder.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"SMAP",{get:function(){return SMAP;},set:function(v){SMAP=v;},configurable:true});
Object.defineProperty(__R,"spCmpB",{get:function(){return spCmpB;},set:function(v){spCmpB=v;},configurable:true});
Object.defineProperty(__R,"spDmgB",{get:function(){return spDmgB;},set:function(v){spDmgB=v;},configurable:true});
Object.defineProperty(__R,"spRngB",{get:function(){return spRngB;},set:function(v){spRngB=v;},configurable:true});
Object.defineProperty(__R,"xl14",{get:function(){return xl14;},set:function(v){xl14=v;},configurable:true});
/* ---------- spells ---------- */
export var clsTab="feat",spLv="all",spQ="",SMAP={};SPELLS.forEach((x) =>{SMAP[x[0]]=x});
/* v92: 2014 Magical Secrets. A Bard takes spells from any class list at level 10 (Lore: from level 6) */
function xl14(sub,L){if(!(L>=10||(L>=6&&sub==="College of Lore (2014)")))return [];const o=["Cleric","Druid","Paladin","Ranger","Sorcerer","Warlock","Wizard"];if(B.src&&B.src.tce)o.push("Artificer");return o}
function spInfoOne(cls,sub,L){let c=CLASSES[cls],third=isThird3(sub)&&L>=3,kn=0;
 if(!c.caster&&!c.nslot&&!third)return null;let ct=0,pr=0;
 if(third){ct=(/^Arcane Trickster/.test(sub)?3:2)+(L>=10?1:0);pr=THIRD[L-3];if(R14())kn=1}
 else{const cc=CANT[cls];ct=cc?cc.slice(1).reduce((a,l) =>{return a+(L>=l?1:0)},cc[0]):0;/* P4: a list of any length */if(cls==="Sorcerer")ct=4+(L>=4?1:0)+(L>=10?1:0);pr=PREP[cls]?PREP[cls][L-1]:0;
  if(R14()){if((cls==="Paladin"||cls==="Ranger")&&L<2)return null;const q14=pr14(cls,L,mod(abil().sc[c.cast]));if(q14){pr=q14.pr;kn=q14.kn}if(cls==="Bard"&&L>=6&&sub==="College of Lore (2014)")pr+=2}/* v92: Additional Magical Secrets do not count against the spells known */}
 return {smax:c.smax?c.smax[L-1]:0,list:third?"Wizard":cls,xl:(R14()&&cls==="Bard"?xl14(sub,L):(c.xlists&&L>=c.xlists.l?c.xlists.lists:[])).concat(dmXl()),ab:third?"INT":c.cast,ct:ct,pr:pr,kn:kn}}
export function spInfo(){const parts=[spInfoOne(B.cls,B.sub,B.level)].concat(MCL().map((m) =>{return spInfoOne(m.cls,m.sub,m.lv)})).filter(Boolean);
 if(!parts.length)return null;let ct=0,pr=0,lists=[];parts.forEach((p) =>{ct+=p.ct;pr+=p.pr;[p.list].concat(p.xl||[]).forEach((l) =>{if(lists.indexOf(l)<0)lists.push(l)})});/* v32: Magical Secrets */
 clsParts().forEach((q) =>{const po=chOf(q.cls,"p1opt");if((q.cls==="Cleric"&&po==="Thaumaturge")||(q.cls==="Druid"&&po==="Magician"))ct++});/* v32 RL49 no. 45: per class part */
 let SA=slotsAll(),max=Math.max(SA.slots?SA.slots.length:0,SA.pact?SA.pact.lvl:0);parts.forEach((p) =>{if(p.smax>max)max=p.smax});/* P4: casters without slots */
 const ab=parts[0].ab,a=abil(),dc=8+pbOf(TL())+mod(a.sc[ab]);
 const sl=SA.slots&&SA.pact?null:SA.pact?{pact:SA.pact.n,lvl:SA.pact.lvl}:SA.slots;
 return {list:lists[0],lists:lists,ab:ab,ct:ct,pr:pr,kn:parts.length===1?(parts[0].kn||0):0,max:max,dc:dc,atk:dc-8,sl:sl,SA:SA}}
function spX2(x){return {n:x[0],l:x[1],fx:typeof SPELL_FX!=="undefined"?SPELL_FX[x[0]]:null}}
/* RD19: builder damage line at the spell level and the character level, Range/Area, material */
function spDmgB(x){const c=window.__spCalc&&window.__spCalc(spX2(x),x[1],TL(),null);if(!c||(!c.parts.length&&!c.heal))return "";return '<span class="w"><b>'+(c.parts.length?"Damage":"Healing")+'</b>'+(c.n>1?c.n+' '+c.unit+'s, each ':'')+c.parts.map((p) =>{return esc(p.d)+' '+esc(window.__dTxt(p.t))+window.__dtIcon(p.t)+(p.lab?' ('+esc(p.lab)+')':'')}).join(" + ")+(c.heal?esc(c.heal)+(SPELL_FX[x[0]].heal[1]?' + your spellcasting modifier':'')+window.__dtIcon("Healing"):'')+'</span>'}
function spRngB(x){return window.__spRangeH?window.__spRangeH(x[5],spX2(x)):esc(x[5])}
function spCmpB(x){return window.__spCompH?window.__spCompH(x[6],spX2(x)):esc(x[6])}
function spRow(x,mine,full,I){const id="sp"+x[0],open=!!openCards[id];
 const meta=(x[1]?ord(x[1])+" Level":"Cantrip")+(x[8]?" \u2022 Concentration":"")+(x[9]?" \u2022 Ritual":"");
 const right=x[10]==="ATK"?'<span class="bsv"><small>TO<br>HIT</small><b>'+sg(I.atk)+'</b></span>':x[10]?'<span class="bsv"><small>'+x[10]+'</small><b>'+I.dc+'</b></span>':'';
 const btn=mine?'<button type="button" class="sbtn rm unp" data-sp="'+esc(x[0])+'">'+(x[1]&&!(I&&I.kn)?"Unprepare":"Unlearn")+'</button>':'<button type="button" class="sbtn" data-sp="'+esc(x[0])+'"'+(full?' aria-disabled="true" data-full="'+(x[1]?"p":"c")+'"':"")+'>'+(x[1]&&!(I&&I.kn)?"Prepare":"Learn")+'</button>';/* v32 p90 */
 return '<div class="scard'+(open?" open":"")+'"><button type="button" class="sh" data-tog="'+esc(id)+'" aria-expanded="'+open+'">'+bI("school-"+String(x[2]||"").toLowerCase())+'<span class="snm"><b>'+esc(x[0])+(x[8]?'<i class="cd">C</i>':'')+(x[9]?'<i class="cd r">R</i>':'')+'</b><small>'+esc(meta)+'</small></span>'+right+'</button>'+btn+
  '<button type="button" class="schev" data-tog="'+esc(id)+'" aria-label="Details"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button>'+
  (open?'<div class="sdet">'+((SPELL_FULL[x[0]]||x[11])?'<p class="ssum">'+rtp(SPELL_FULL[x[0]]||x[11])+'</p>':'')+'<span><b>Casting Time</b>'+esc(x[4])+(x[9]?" or Ritual":"")+'</span><span><b>Range</b>'+spRngB(x)+'</span><span><b>Components</b>'+spCmpB(x)+'</span><span><b>Duration</b>'+(x[8]?"Concentration, ":"")+esc(x[7])+'</span>'+spDmgB(x)+'<span><b>School</b>'+esc(x[2])+'</span><span><b>'+(x[10]==="ATK"?"Attack":"Save")+'</b>'+(x[10]==="ATK"?"Spell attack "+sg(I.atk):x[10]?x[10]+" save, DC "+I.dc:"None")+'</span><span class="w"><b>Classes</b>'+esc(spClsJ(x))+'</span>'+(mine?'<button type="button" class="sbtn rm" data-sp="'+esc(x[0])+'">Remove</button>':'')+'</div>':'')+'</div>'}
function spSec(title,count,rows){return '<div class="sech"><b>'+title+'</b>'+(count!=null?' <span>('+count+')</span>':'')+'</div>'+rows}
function pickRows(list,taken,full,I,key){return list.map((x) =>{const on=taken.indexOf(x[0])>=0;return spRow(x,false,full&&!on,I).replace('data-sp="'+esc(x[0])+'"','data-pk="'+key+'" data-v="'+esc(x[0])+'"').replace(/>(Prepare|Learn)</,on?'>Chosen<':'>$1<').replace('class="sbtn"',on?'class="sbtn on"':'class="sbtn"')}).join("")}
/* M9: one spell section per spellcasting class (PHB 2024 p. 44: each class prepares as if single-classed, with its own ability).
   One caster class: same layout as before. Two or more: a tab per class; DC, counts, list, highest spell level per class.
   Always prepared and Magic Initiate rows show the DC of their own ability (spellAb) */
export var spCls="";
function abInfo(ab){const sc=abil().sc,pb=pbOf(TL()),m=mod(sc[ab]);return {ab:ab,dc:8+pb+m,atk:pb+m}}
/* v92: 2014 Eldritch Knight and Arcane Trickster learn most spells from two schools. The spells gained at levels 3, 8, 14 and 20 can come from any school */
function sch14Info(cls,sub,lv,mine){if(!R14()||!isThird3(sub)||lv<3)return null;const sch=cls==="Fighter"?["Abjuration","Evocation"]:["Enchantment","Illusion"];
 return {sch:sch,free:[3,8,14,20].filter((l) =>{return l<=lv}).length,off:mine.filter((x) =>{return x[1]&&sch.indexOf(x[2])<0}).length}}
export function spInfoPart(p){const o=spInfoOne(p.cls,p.sub,p.lv);if(!o)return null;const po=chOf(p.cls,"p1opt");if((p.cls==="Cleric"&&po==="Thaumaturge")||(p.cls==="Druid"&&po==="Magician"))o.ct++;/* v32 RL49 no. 45 */const t=CLASSES[p.cls].caster;
 if(!t&&CLASSES[p.cls].nslot){o.max=o.smax}else
 o.max=t==="pact"?PACT[p.lv-1][1]:(t==="full"?SLOTS_FULL[p.lv-1]:t==="half"?SLOTS_FULL[Math.ceil(p.lv/2)-1]:SLOTS_FULL[Math.ceil(p.lv/3)-1]).length;
 const x=abInfo(o.ab);o.dc=x.dc;o.atk=x.atk;o.lists=[o.list].concat(o.xl||[]);o.cls=p.cls;return o}
export function renderSpells(){let I=spInfo(),h="",auto=autoSpells(),mis=miFeats();B.sp=B.sp||[];B.pk=B.pk||{};
 const CP=casterParts(),multi=CP.length>1,P=multi?(CP.filter((p) =>{return p.cls===spCls})[0]||CP[0]):null,K=multi?spInfoPart(P):I,SLs=multi?spLists():null,RJ=function(k){return abInfo(spellAb(k))};
 if(!I&&!auto.length&&!mis.length)return '<p class="fd">'+B.cls+(B.sub?" ("+B.sub+")":"")+' has no Spellcasting at level '+B.level+'.'+(B.cls==="Fighter"||B.cls==="Rogue"?' Eldritch Knight or Arcane Trickster gets spells from level 3.':'')+'</p>';
 if(multi)h+='<div class="subtabs">'+CP.map((p) =>{return '<button type="button" class="'+(p===P?"on":"")+'" data-spcls="'+esc(p.cls)+'">'+esc(p.cls)+'</button>'}).join("")+'</div><p class="fd bhint">Each class prepares and casts with its own ability.</p>';
 if(I){h+='<div class="spstat"><div><b>'+K.dc+'</b><span>Save DC</span></div><div><b>'+sg(K.atk)+'</b><span>Spell Attack</span></div><div><b>'+K.ab+'</b><span>Ability</span></div></div>';
  if(I.SA.slots)h+='<p class="slots">Spell Slots: '+I.SA.slots.map((n,i) =>{return ord(i+1)+' \u00d7'+n}).join(", ")+'</p>';if(I.SA.pact)h+='<p class="slots">Pact Slots: '+I.SA.pact.n+' \u00d7 level '+I.SA.pact.lvl+'</p>'}
 if(B.sub==="Circle of the Land")h+=card("land","Circle of the Land: Land Type",B.ch.land||"1 Choice",'<div class="radios h">'+Object.keys(LAND).map((k) =>{return '<button type="button" class="rad'+(B.ch.land===k?" on":"")+'" data-ch1="land" data-v="'+k+'"><b>'+k+'</b></button>'}).join("")+'</div><p class="fd bhint">You can change it after each Long Rest.</p>',{todo:!B.ch.land});
 if(auto.length)h+=spSec("Always Prepared",auto.length,auto.map((a) =>{const x=SMAP[a.n];return x?spRow(x,true,false,RJ(a.k)).replace(/<button type="button" class="sbtn rm"[^>]*>(Remove|Unprepare|Unlearn)<\/button>/g,'').replace('<small>','<small>'+esc(a.src)+' \u2022 '):''}).join(""));
 if(clsLv("Warlock")>=11){const wl=clsLv("Warlock"),ma=[[11,6],[13,7],[15,8],[17,9]].filter((r) =>{return wl>=r[0]});
  h+=spSec("Mystic Arcanum",ma.length,ma.map((r) =>{const k="ma"+r[1],v=B.pk[k],opts=SPELLS.filter((x) =>{return x[1]===r[1]&&x[3].indexOf("Warlock")>=0});
   return card(k,"Level "+r[1]+" Arcanum",(v||"1 Choice")+" \u2022 "+ord(r[0])+" level",'<p class="fd bhint">Cast once per Long Rest without a slot.</p><select class="dd" data-pksel="'+k+'"><option value="">- Choose a level '+r[1]+' Warlock spell -</option>'+opts.map((x) =>{return '<option'+(v===x[0]?" selected":"")+'>'+esc(x[0])+'</option>'}).join("")+'</select>',{todo:!v})}).join(""))}
 mis.forEach((m) =>{const v=B.pk[m.key]||{c:[],s:[]},list=SPELLS.filter((x) =>{return x[3].indexOf(m.cls)>=0&&x[1]<=1}),MJ=RJ("@mi:"+m.key);
  const body='<p class="fd">Two '+m.cls+' cantrips and one level 1 '+m.cls+' spell. Cast the level 1 spell once per Long Rest free, or with your slots. Pick Int, Wis, or Cha as the spellcasting ability.</p><select class="dd" data-miab="'+m.key+'">'+["INT","WIS","CHA"].map((k) =>{return '<option'+((v.ab||"WIS")===k?" selected":"")+'>'+k+'</option>'}).join("")+'</select>'+
   '<h4>Cantrips ('+v.c.length+'/2)</h4>'+pickRows(list.filter((x) =>{return !x[1]}),v.c,v.c.length>=2,MJ,m.key+":c")+'<h4>Level 1 spell ('+v.s.length+'/1)</h4>'+pickRows(list.filter((x) =>{return x[1]===1}),v.s,v.s.length>=1,MJ,m.key+":s");
  h+=card(m.key,"Magic Initiate ("+m.cls+")",m.src+" \u2022 "+(v.c.length+v.s.length)+"/3 chosen",body,{todo:v.c.length<2||v.s.length<1})});
 if(!I)return h;
 const taken=multi?(SLs[P.cls]||[]):B.sp,mine=taken.map((n) =>{return SMAP[n]}).filter(Boolean),an=auto.map((a) =>{return a.n});
 let nc=mine.filter((x) =>{return !x[1]}).length,np=mine.filter((x) =>{return x[1]}).length,t="";
 t+=spSec((multi?P.cls+" ":"")+(K.kn?"Spells Known":"Prepared Spells"),mine.length,mine.length?mine.sort((p,q) =>{return p[1]-q[1]||(p[0]<q[0]?-1:1)}).map((x) =>{return spRow(x,true,false,K)}).join(""):'<p class="fd bhint">No spells yet. Add them below.</p>');
 t+='<div class="sech"><b>Add Spells</b></div><p class="cnt'+(nc!==K.ct||np!==K.pr?' short':'')+'">Cantrips: '+nc+' / '+K.ct+(nc<K.ct?' <em>('+(K.ct-nc)+' to choose)</em>':nc>K.ct?' <em>('+(nc-K.ct)+' too many)</em>':'')+'<br>'+(K.kn?"Spells Known":"Prepared Spells")+': '+np+' / '+K.pr+(np<K.pr?' <em>('+(K.pr-np)+' to choose)</em>':np>K.pr?' <em>('+(np-K.pr)+' too many)</em>':'')+'</p>';
 const s14=sch14Info(multi?P.cls:B.cls,multi?P.sub:B.sub,multi?P.lv:B.level,mine);if(s14)t=t.replace(/<\/p>$/,'<br>Other schools: '+s14.off+' / '+s14.free+' <em>(all others must be '+s14.sch.join(" or ")+')</em>'+(s14.off>s14.free?' <em>('+(s14.off-s14.free)+' too many)</em>':'')+'</p>');
 t+='<p class="flab">Filter</p><input class="btx" id="spq" type="search" placeholder="Enter Spell Name" value="'+esc(spQ)+'">';
 const mx=multi?K.max:I.max;t+='<p class="flab">Filter By Spell Level</p><div class="lvbox">';for(let i=0;i<=mx;i++)t+='<button type="button" class="lvb'+(String(spLv)===String(i)?" on":"")+'" data-splv="'+i+'" aria-label="'+(i===0?"Level 0 spells (cantrips)":"Level "+i+" spells")+'">'+(i===0?"0":i+'<sup>'+ord(i).slice(-2).toUpperCase()+'</sup>')+'</button>';t+='</div>';
 const wz=(multi?P.cls:(CP[0]||{}).cls)==="Wizard",bk=wz?bookOf():null;/* v32 RL49 no. 34: a Wizard prepares level 1+ spells from the spellbook */
 if(wz)t=bookCard(mx)+t;
 const q=spQ.toLowerCase(),av=SPELLS.filter((x) =>{return K.lists.some((l) =>{return x[3].indexOf(l)>=0})&&x[1]<=mx&&taken.indexOf(x[0])<0&&an.indexOf(x[0])<0&&(spLv==="all"||String(x[1])===String(spLv))&&(!q||x[0].toLowerCase().indexOf(q)>=0)});
 if(bk)t+='<p class="fd bhint">Preparing a spell also writes it in your spellbook while there is room.</p>';
 const bfull=bk&&bookOwn().length>=bookNeed();
 t+=av.map((x) =>{let r=spRow(x,false,x[1]?np>=K.pr:nc>=K.ct,K);if(bfull&&x[1]&&bk.indexOf(x[0])<0)r=r.replace('data-sp="'+esc(x[0])+'">','data-sp="'+esc(x[0])+'" aria-disabled="true" data-full="b">');return r}).join("");/* v32: book full */
 if(multi)t=t.replace(/data-sp="/g,'data-spc="'+esc(P.cls)+'" data-sp="');
 return h+t}
/* v32 RL49 no. 34: Wizard spellbook card. Chips per spell level (level 1 to mx). Prepared spells are in the book (Unprepare them to take them out),
   Savant spells are added free (changed in Class Features). Full book: a toast, nothing changes */
function bookCard(mx){let own=bookOwn(),need=bookNeed(),sv=savVals(),pr=spLists().Wizard||[],lv=[],h="";for(let i=1;i<=mx;i++)lv.push(i);
 h+='<p class="fd bhint">Six level 1 spells to start, two more each Wizard level (of a level you have slots for). You prepare from it.'+(sv.length?" Savant spells are added free.":"")+'</p><p class="pick">Choose '+need+' ('+own.length+'/'+need+')</p>';
 lv.forEach((l) =>{const L=SPELLS.filter((x) =>{return x[1]===l&&x[3].indexOf("Wizard")>=0});h+='<p class="wgrp">Level '+l+'</p><div class="chips">'+L.map((x) =>{const n=x[0],s=sv.indexOf(n)>=0,on=own.indexOf(n)>=0||s,p2=pr.indexOf(n)>=0;
  return '<button type="button" class="chip'+(on?" on":"")+'" data-book="'+esc(n)+'"'+(s?' data-bsav="1"':p2?' data-bprep="1"':"")+' title="'+esc(x[11])+'">'+esc(n)+(s?" <small>Savant</small>":p2?" <small>Prepared</small>":"")+'</button>'}).join("")+'</div>'});
 return card("book","Spellbook",own.length+" / "+need+" spells",h,{todo:own.length<need})}
/* v19 RU47, RL45, RL46: what is still short (open) or wrong (bad). Items {step, tab, open, m} */
export function plural(n,w){return n+" "+w+(n===1?"":"s")}
export function spellCounts(){const out=[],I=spInfo(),CP=casterParts(),multi=CP.length>1,SLs=multi?spLists():null;
 if(I)(multi?CP:[null]).forEach((P) =>{const K=P?spInfoPart(P):I;if(!K)return;const taken=P?(SLs[P.cls]||[]):(B.sp||[]),mine=taken.map((n) =>{return SMAP[n]}).filter(Boolean),who=P?P.cls+": ":"";
  const nc=mine.filter((x) =>{return !x[1]}).length,np=mine.filter((x) =>{return x[1]}).length;
  if(nc<K.ct)out.push({step:"class",tab:"spell",open:1,m:who+plural(K.ct-nc,"cantrip")+" not chosen yet"});else if(nc>K.ct)out.push({step:"class",tab:"spell",m:who+plural(nc-K.ct,"cantrip")+" more than allowed ("+K.ct+")"});  const s14=sch14Info(P?P.cls:B.cls,P?P.sub:B.sub,P?P.lv:B.level,mine);if(s14&&s14.off>s14.free)out.push({step:"class",tab:"spell",m:who+plural(s14.off-s14.free,"spell")+" outside "+s14.sch.join(" and ")+" (only "+s14.free+" allowed)"});
  if(np<K.pr)out.push({step:"class",tab:"spell",open:1,m:who+plural(K.pr-np,K.kn?"known spell":"prepared spell")+" not chosen yet"});else if(np>K.pr)out.push({step:"class",tab:"spell",m:who+plural(np-K.pr,K.kn?"known spell":"prepared spell")+" more than allowed ("+K.pr+")"})});
 miFeats().forEach((m) =>{const v=(B.pk||{})[m.key]||{c:[],s:[]},a=Math.max(0,2-v.c.length),b=Math.max(0,1-v.s.length);if(a||b)out.push({step:"class",tab:"spell",open:1,m:"Magic Initiate ("+m.cls+"): "+[a?plural(a,"cantrip"):"",b?"1 level 1 spell":""].filter(Boolean).join(" and ")+" not chosen yet"})});
 const wl=clsLv("Warlock");[[11,6],[13,7],[15,8],[17,9]].forEach((r) =>{if(wl>=r[0]&&!(B.pk||{})["ma"+r[1]])out.push({step:"class",tab:"spell",open:1,key:"ma"+r[1],f:"Mystic Arcanum",m:"Mystic Arcanum: level "+r[1]+" spell not chosen yet"})});
 const bo=bookOwn().length,bn=bookNeed();if(bn&&bo<bn)out.push({step:"class",tab:"spell",open:1,key:"book",f:"Spellcasting",n:bn,m:"Wizard spellbook: "+plural(bn-bo,"spell")+" not chosen yet"});else if(bn&&bo>bn)out.push({step:"class",tab:"spell",m:"Wizard spellbook: "+plural(bo-bn,"spell")+" more than allowed ("+bn+")"});/* v32 RL49 no. 34 */
 return out}
function stepOfKey(k){if(/^[a-z0-9]+-Origin feat \(/.test(k)||k==="Origin feat ("+B.bg+")")return /Versatile/.test(k)?"species":"bg";if(k==="spfeat"||/Versatile/.test(k))return "species";if(k==="bgTool"||k==="bgfeatc"||k==="bgsk")return "bg";return "class"}
/* v32 RL49: the builder step that holds a choice (its card and its badge) */
export function choiceStep(c){const k=c.key;if(c.fk){if(c.fk==="Origin feat ("+B.bg+")")return "bg";if(/Versatile\)$/.test(c.fk))return "species"}if(k==="bgTool"||k==="bgfeatc"||k==="bgsk")return "bg";
 if(k==="lang"||k==="lin"||k==="rasi"||k==="rasi1"||k==="rasim"||k==="spab"||k==="spsk"||k==="sptool"||k==="spfeat"||k==="hecan"||/^sp(opt|sk2|can|wep|wp)$/.test(k))return "species";return "class"}
/* v19 idea: one result per state of B (render asked about ten times) */
let RIC={k:null,v:null};
export function ruleIssues(){let k="";try{k=JSON.stringify(B)}catch(e){}if(k&&RIC.k===k)return RIC.v.slice();const v=ruleIssues0();RIC={k:k,v:v};return v.slice()}
/* v19 V19-6: subclasses from homebrew packs that are on, after the core list of the Subclass feature */
export function hbSubs(cls){let base=[];if(typeof BASE==="undefined"||!BASE)return "";try{base=Object.keys(JSON.parse(BASE.subs)[cls]||{})}catch(e){}const x=Object.keys((CLASSES[cls]||{}).subs||{}).filter((n) =>{return base.indexOf(n)<0});return x.length?" Homebrew subclasses from your sources: "+x.join(", ")+".":""}
function ruleIssues0(){const out=spellCounts();
 const bgo=bgX();if(bgo&&!R14()&&B.bgMode!=="111")[["bg2","+2"],["bg1","+1"]].forEach((q) =>{const k=B[q[0]];if(k&&bgo.ab.indexOf(k)<0)out.push({step:"bg",m:B.bg+" can raise "+bgo.ab.join(", ")+", not "+k+". The "+q[1]+" is not counted"})});/* v22 P1 */
 hbSpellPicks().forEach((o) =>{const v=B.ch[o.key];if(Array.isArray(v)&&v[0]&&!o.list.some((x) =>{return x[0]===v[0]}))out.push({step:"class",m:o.feature+": "+v[0]+" no longer fits this choice, so the sheet leaves it out. Choose again"})});/* v20 N1 */
 choices().forEach((c) =>{const v=B.ch[c.key];if(c.n&&Array.isArray(v)&&v.length>c.n)out.push({step:stepOfKey(c.key),m:c.title+(c.lvl>1?" (level "+c.lvl+")":"")+": "+v.length+" chosen, only "+c.n+" allowed"})});
 const s0=scoreAt(1,"");ABK.forEach((k) =>{if(s0[k]>20)out.push({step:"abil",m:ABN[k]+" is "+s0[k]+" after the background increase, but 20 is the maximum. The extra points are not counted"})});/* v19 idea */
 featViol().forEach((x) =>{out.push({step:stepOfKey(x.k),m:x.m})});
 /* RL45: PHB 2024 Multiclassing, Prerequisites: 13 in the primary ability of the class you have and of the new class. Caution only (the DM can waive it) */
 const mf=mcReqFail(B.cls);MCL().forEach((m) =>{const w=[mf?B.cls+" needs "+mf:"",mcReqFail(m.cls)?m.cls+" needs "+mcReqFail(m.cls):""].filter(Boolean).join(", ");if(w)out.push({step:"class",m:"Multiclass prerequisite not met: "+w})});
 return out}
export function issueText(L){return L.map((x) =>{return x.m}).join(". ")}

export function __set_clsTab(v){ return clsTab=v; }
export function __set_spLv(v){ return spLv=v; }
export function __set_spQ(v){ return spQ=v; }
export function __set_spCls(v){ return spCls=v; }
