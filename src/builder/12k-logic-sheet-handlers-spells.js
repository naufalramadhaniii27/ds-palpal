import {mod,chJoin,mendingRepairSpec,repairSpecProblems,spellChannel,spellChannelsDiffer} from "./01-logic-core-helpers.js";
import {featDef,invocationRows,invPickRow,invSpellRow,itemSpellRow,metamagicRows,spellFullText} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
/* Sheet handlers, part 9 (contract in 12a-logic-sheet-registry.js): spells (phase "spells"). The spell list is built by several SOURCE handlers, each one
   adds rows to l.spList with the helper addS (dedupe key l.spSeen, the ability per source l.bysrc). Then "spell-sheet" writes C.spells and C.spellcasting.
   l.sp = {SA, CPs, castAb, ab, scm, mainSc, sdc, satk, spl, SLs, mis, miK}: slots, caster parts, the main casting ability, its modifier, the main class,
   Spell Save DC and attack bonus, always prepared spells, class spell lists, Magic Initiate feats and keys. */
defineLocals({sp:"object",spList:"array",spSeen:"object",bysrc:"array"});
const SRCR=["i.a","i.SM","l.sp","l.spList","l.spSeen","l.bysrc","q.spellAb","q.spFxTo","q.spClsJ"],SRCW=["l.spList","l.spSeen","l.bysrc"];
/* adds one spell row (once for the same spell, use and source key). The ability of the row is the one of its source key */
function mergeRepairKnowledge(row,origin){if(row.n!=="Mending")return;const info=row._repairKnowledge||(row._repairKnowledge={baseKnown:false,sources:[]});if(!origin){info.baseKnown=true;return}info.baseKnown=info.baseKnown||!!origin.baseKnown;(origin.sources||[]).forEach(source=>{if(!info.sources.some(x=>JSON.stringify(x)===JSON.stringify(source)))info.sources.push(structuredClone(source))})}
function adder(ctx){const I=ctx.i,Q=ctx.q,l=ctx.l,SM=I.SM,a=I.a;
 return function(n,use,src,k,origin,ability){const x=SM[n],kk=k||"",seen=n+use+"|"+kk;if(!x)return;if(l.spSeen[seen]){mergeRepairKnowledge(l.spSeen[seen],origin);return}l.spSeen[seen]=1;const sab=ability||(k?Q.spellAb(k,a.sc):l.sp.ab);if(!l.bysrc.some((b) =>{return b.k===kk}))l.bysrc.push({k:kk,n:/^@/.test(kk)?src:kk,ab:sab});
  const o={n:n,l:x[1],sch:x[2],ct:x[4],r:x[5],cmp:x[6],dur:x[7],conc:x[8],rit:x[9],sv:x[10],sum:x[11]||"",full:spellFullText(n)||"",cls:Q.spClsJ(x),use:use,src:src,_ab:sab,_sourceKey:kk};Q.spFxTo(o,kk,a);if(kk==="Warlock"&&x[1]&&!/Long Rest|At will/.test(use))o.pact=1;/* RU35 no. 2: cast with a Pact Magic slot */mergeRepairKnowledge(o,origin);l.spSeen[seen]=o;l.spList.push(o)}}
/* M9: every spell has a source key (class, "@species", "@spcan", "@mi:<key>") and that source's ability (spellAb). C.spellcasting keeps the main
   ability (first caster class, else Magic Initiate, else species). C.spellcasting.by and C.spells source keys are written when abilities or source-specific attack/DC numbers differ */
registerSheetGroup({id:"spell-context",group:"spells",phase:"spells",order:10,reads:["i.B","i.a","i.pb","q.slotsAll","q.casterParts","q.spLists","q.miFeats","q.autoSpells","q.spellAb","q.dmSpells","q.featSpells","q.spItemB"],writes:["l.sp"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,B=I.B,a=I.a,pb=I.pb;
  const SA=Q.slotsAll(),CPs=Q.casterParts(),castAb=CPs.length?CPs[0].ab:null,SLs=Q.spLists(),mis=Q.miFeats(),miK=Object.keys(B.pk||{}).filter((k) =>{return /^mi/.test(k)});
  const spl=Q.autoSpells(),spAbE=Q.spellAb("@species",a.sc);
  const ab=castAb||(miK.length?Q.spellAb("@mi:"+miK[0],a.sc):null)||(spl.some((q) =>{return q.k==="@species"})?spAbE:null)||(spl.some((q) =>{return q.k==="@spcan"})?Q.spellAb("@spcan",a.sc):null)||(spl.some((q) =>{return /^@sub:/.test(q.k)})?Q.spellAb(spl.filter((q) =>{return /^@sub:/.test(q.k)})[0].k,a.sc):null)||(function(){const q=Q.dmSpells()[0]||Q.featSpells()[0];return q&&q.k?Q.spellAb(q.k,a.sc):null})()/* feat spells with their own ability (Field Medic: Wisdom) on a non-caster */||"CHA",scm=mod(a.sc[ab]),mainSc=CPs.length?CPs[0].cls:"";
  ctx.l.sp={SA:SA,CPs:CPs,castAb:castAb,ab:ab,scm:scm,mainSc:mainSc,sdc:8+pb+scm+Q.spItemB("dc",mainSc),satk:pb+scm+Q.spItemB("atk",mainSc),spl:spl,SLs:SLs,mis:mis,miK:miK};/* v19 RL42 */return ctx.patch()}});
registerSheetGroup({id:"spell-list-init",group:"spells",phase:"spells",order:20,reads:["l.sp"],writes:SRCW,
 run:function(ctx){const l=ctx.l;l.spList=[];l.spSeen={};l.bysrc=[];l.sp.CPs.forEach((p) =>{if(!l.bysrc.some((b) =>{return b.k===p.cls}))l.bysrc.push({k:p.cls,n:p.cls,ab:p.ab})});return ctx.patch()}});
/* always prepared spells (class, subclass, species, feats). v21 M1: the level a species spell is gained at */
registerSheetGroup({id:"spells-always-prepared",group:"spells",phase:"spells",order:30,reads:SRCR,writes:SRCW,
 run:function(ctx){const l=ctx.l,addS=adder(ctx);l.sp.spl.forEach((q) =>{addS(q.n,"Always prepared",q.src,q.k,q.repairKnowledge);if(q.k==="@species"&&q.g>1){const o=l.spList.filter((s) =>{return s.n===q.n})[0];if(o)o.gain=q.g}});return ctx.patch()}});
registerSheetGroup({id:"spells-feat",group:"spells",phase:"spells",order:31,reads:SRCR.concat(["q.featSpells"]),writes:SRCW,
 run:function(ctx){const addS=adder(ctx);ctx.q.featSpells().forEach((q) =>{addS(q.n,"1/Long Rest free",q.f,q.k)});return ctx.patch()}});/* v21 i3 */
registerSheetGroup({id:"spells-dragonmark",group:"spells",phase:"spells",order:32,reads:SRCR.concat(["q.dmSpells"]),writes:SRCW,
 run:function(ctx){const addS=adder(ctx);ctx.q.dmSpells().forEach((q) =>{addS(q.n,q.use,q.f,q.k)});return ctx.patch()}});/* v58: Dragonmark feats */
registerSheetGroup({id:"spells-rc-picks",group:"spells",phase:"spells",order:33,reads:SRCR.concat(["i.B","i.CH"]),writes:SRCW,
 run:function(ctx){const B=ctx.i.B,addS=adder(ctx);ctx.i.CH.forEach((q) =>{const v=B.ch[q.key];if(/^rc-/.test(q.key)&&Array.isArray(v))v.slice(0,q.n).forEach((n) =>{addS(n,"Always prepared",q.feature,"@ft:"+q.fk)})});return ctx.patch()}});/* v32 RL49 no. 16 */
/* the class spell lists, once; a spell that is Always prepared from the class is not added again (v22) */
registerSheetGroup({id:"spells-class-lists",group:"spells",phase:"spells",order:34,reads:SRCR.concat(["i.SM"]),writes:SRCW,
 run:function(ctx){const l=ctx.l,SM=ctx.i.SM,addS=adder(ctx),sp=l.sp;sp.CPs.forEach((p) =>{(sp.SLs[p.cls]||[]).forEach((n) =>{if(l.spList.some((s) =>{return s.n===n&&s.use==="Always prepared"&&sp.spl.some((q) =>{return q.n===n&&q.k===p.cls})}))return;addS(n,SM[n]&&!SM[n][1]?"Cantrip":"Prepared",p.cls,p.cls)})});return ctx.patch()}});
/* Mystic Arcanum (Warlock) and Magic Initiate spells of B.pk, in the order of the keys. v23 M2: which Magic Initiate feat */
registerSheetGroup({id:"spells-arcanum-initiate",group:"spells",phase:"spells",order:35,reads:SRCR.concat(["i.B"]),writes:SRCW,
 run:function(ctx){const l=ctx.l,B=ctx.i.B,addS=adder(ctx),mis=l.sp.mis,pk=B.pk||{};
  Object.keys(pk).forEach((k) =>{const mn=(mis.filter((m) =>{return m.key===k})[0]||{}).cls,ms="Magic Initiate"+(mn?" ("+mn+")":"");if(/^ma/.test(k)&&pk[k])addS(pk[k],"1/Long Rest","Mystic Arcanum","Warlock");
   if(/^mi/.test(k)){const mi0=l.spList.length;(pk[k].c||[]).forEach((n) =>{addS(n,"Cantrip","Magic Initiate","@mi:"+k)});(pk[k].s||[]).forEach((n) =>{addS(n,"1/Long Rest free","Magic Initiate","@mi:"+k)});l.spList.slice(mi0).forEach((o) =>{o.mi=ms});l.bysrc.forEach((b) =>{if(b.k==="@mi:"+k)b.n=ms})}});return ctx.patch()}});
/* M17: INV_SPELLS, spells that an Eldritch Invocation grants */
registerSheetGroup({id:"spells-invocations",group:"spells",phase:"spells",order:36,reads:SRCR.concat(["i.invs"]),writes:SRCW,
 run:function(ctx){const addS=adder(ctx);ctx.i.invs.forEach((n) =>{const q=invSpellRow(n);if(q)addS(typeof q==="string"?q:q[0],typeof q==="string"?"At will":q[1],n,"Warlock")});return ctx.patch()}});
/* v20 RD24: spells of homebrew packs */
registerSheetGroup({id:"spells-packs",group:"spells",phase:"spells",order:37,reads:SRCR.concat(["i.B","q.enabledPacks","q.clsLv","q.hbPickOk"]),writes:SRCW,
 run:function(ctx){const B=ctx.i.B,Q=ctx.q,addS=adder(ctx);Q.enabledPacks().forEach((p) =>{Object.keys(p.clsSpells||{}).forEach((c) =>{(p.clsSpells[c]||[]).forEach((q) =>{if(Q.clsLv(c)>=q[0])addS(q[1],q[2],q[3],c)})});
  Object.keys(p.spellPick||{}).forEach((c) =>{const q=p.spellPick[c],v=B.ch[q.key];if(Q.clsLv(c)>=q.l&&Array.isArray(v)&&v[0]&&Q.hbPickOk(q.key,v[0]))addS(v[0],q.use,q.feature,c)})});return ctx.patch()}});
registerSheetRule({id:"warlock-9-contact-other-plane",group:"spells",about:"Warlock 9: Contact Patron, Contact Other Plane once per Long Rest (2024 only)",phase:"spells",order:38,reads:SRCR.concat(["i.r14","q.clsLv"]),writes:SRCW,
 run:function(ctx){const addS=adder(ctx);if(ctx.q.clsLv("Warlock")>=9&&!ctx.i.r14)addS("Contact Other Plane","1/Long Rest free","Contact Patron","Warlock");return ctx.patch()}});
/* v32 RL49 no. 36, 37: Spell Mastery and Signature Spells of the Wizard picks. M10: multiclass Wizard too */
registerSheetRule({id:"wizard-18-20-mastery-signature",group:"spells",about:"Wizard 18 and 20: Spell Mastery spells (at will) and Signature Spells (once per Short Rest)",phase:"spells",order:39,reads:SRCR.concat(["i.B","i.CH"]),writes:SRCW,
 run:function(ctx){const B=ctx.i.B,addS=adder(ctx);ctx.i.CH.forEach((q) =>{const v=B.ch[q.key];if(!Array.isArray(v)||!/^(m\d+:)?p(18sm[12]|20sig)$/.test(q.key))return;v.forEach((n) =>{if(q.list.some((x) =>{return x[0]===n}))addS(n,/sig$/.test(q.key)?"1/Short Rest free":"At will",q.feature,"Wizard")})});return ctx.patch()}});
/* A committed casting window is actor-owned: removing the item or class does not erase its native eight-hour permission. */
registerSheetGroup({id:"spells-temporary-cantrips",group:"spells",phase:"spells",order:39.5,reads:SRCR.concat(["i.temporaryCantrips"]),writes:SRCW,
 run:function(ctx){const descriptors=ctx.i.temporaryCantrips;if(!Array.isArray(descriptors)||!descriptors.length)return null;const addS=adder(ctx),l=ctx.l;
  descriptors.forEach(descriptor=>{if(!descriptor||descriptor.l!==0||descriptor.sourceKey!=="Artificer"||descriptor.ability!=="INT"||!descriptor.temporaryCantrip)return;
   const marker=structuredClone(descriptor.temporaryCantrip),origin={baseKnown:false,sources:[{kind:"temporary-cantrip",grantIds:marker.grantIds,maxBreakFeet:1,grantsKnowledge:true}]};
   addS(descriptor.n,"Temporary cantrip","All-Purpose Tool (8 hours)","Artificer",origin,"INT");const row=l.spSeen[descriptor.n+"Temporary cantrip|Artificer"];if(row&&typeof row==="object")row.temporaryCantrip=marker;
  });const channel=l.bysrc.find(source=>source.k==="Artificer");if(channel&&l.spList.some(row=>row.temporaryCantrip))channel.ab="INT";return ctx.patch()}});
registerSheetGroup({id:"spells-sort",group:"spells",phase:"spells",order:40,reads:["l.spList"],writes:["l.spList"],
 run:function(ctx){ctx.l.spList.sort((p,q) =>{return p.l-q.l||(p.n<q.n?-1:1)});return ctx.patch()}});
/* m14 (RL17): a caster class (castAb) writes C.spellcasting even with no spell chosen yet; C.spells is then [] */
registerSheetGroup({id:"spell-sheet",group:"spells",phase:"spells",order:50,reads:["i.a","i.pb","l.sp","l.spList","l.bysrc","q.spItemSrc","q.spItemB"],writes:["C.spells","C.spellcasting"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C,sp=I.a&&ctx.l.sp,list=ctx.l.spList,a=I.a,pb=I.pb;if(!(list.length||sp.castAb))return null;
  C.spells=list.map((s) =>{return Object.assign({},s)});C.spellcasting={ab:sp.ab,dc:sp.sdc,atk:sp.satk,mod:sp.scm,slots:sp.SA.slots||[],pact:sp.SA.pact||null};
  const channels=ctx.l.bysrc.map(b=>spellChannel(b,a.sc,pb,{atk:Q.spItemB("atk",b.k),dc:Q.spItemB("dc",b.k)})).filter(Boolean);
  const isrc=Q.spItemSrc(sp.mainSc);if(isrc.length)C.spellcasting.items=isrc;/* v19 RL42: names of the items in the numbers */
  if(spellChannelsDiffer(channels)||list.some(row=>row.temporaryCantrip)){C.spellcasting.by=channels;C.spells.forEach((s) =>{s.ab=s._ab;s.sourceKey=s._sourceKey})}return ctx.patch()}});
registerSheetGroup({id:"spell-casting-time-actions",group:"spells",phase:"spells",order:60,reads:["C.spells"],writes:["C.actions"],
 run:function(ctx){const C=ctx.C;if(!ctx.C.spells)return null;const list=C.spells,bonusN=list.filter((s) =>{return /^Bonus Action/.test(s.ct)}).map((s) =>{return s.n}),reN=list.filter((s) =>{return /^Reaction/.test(s.ct)}).map((s) =>{return s.n});
  if(bonusN.length)C.actions.push({c:"Bonus Actions",n:"Spells",t:"Bonus Action casting time",d:bonusN.join(", ")+". See the Spells tab."});
  if(reN.length)C.actions.push({c:"Reactions",n:"Spells",t:"Reaction casting time",d:reN.join(", ")+". See the Spells tab."});return ctx.patch()}});
function cantripRange(B,Q,s){const sp=(B.ch.invspear||[]).indexOf(s.n)>=0&&/^(\d+) ft$/.exec(s.r||"");return sp?(+sp[1]+30*Q.clsLv("Warlock"))+" ft (Eldritch Spear)":s.r}
function cantripNote(B,s,ag,ab){return ((B.ch.invrepel||[]).indexOf(s.n)>=0?"Repelling Blast: on a hit, push a Large or smaller target up to 10 ft away. ":"")+(ag?"Agonizing Blast adds your "+(s._ab||ab)+" modifier. ":(s.db||[]).map((b) =>{return b.s+" adds "+(b.v<0?"":"+")+b.v+". "}).join(""))+s.sum}
function cantripRow(C,Q,B,s,ab,tier){if(s.l||s.sv!=="ATK")return;const P=s.fx&&s.fx.dmg&&s.fx.dmg[0],pm=P&&/^(\d+)d(\d+)$/.exec(P[0]),m=pm?[0,pm[1],pm[2],P[1].split("|").join(" or ")]:/(\d+)d(\d+)\s+([A-Z][a-z]+)/.exec(s.sum);if(!m)return;/* RD19 */const eb=s.n==="Eldritch Blast",cnt=eb?1:(+m[1])*tier,ag=Q.agOn(s.n);
   C.attacks.push({n:s.n,sub:"Cantrip"+(eb?" \u2022 "+tier+" beam"+(tier>1?"s":""):""),ab:s._ab||ab,prof:true,die:cnt+"d"+m[2],dieSrc:s.n+(eb?"":" (scales with level)"),nomod:!(ag||(s.db&&s.db.length)),/* v15: Potent Spellcasting, Empowered Evocation add the modifier, as Agonizing Blast */type:m[3],range:cantripRange(B,Q,s),m:"",misc:Q.spItemB("atk",s._sourceKey)||undefined,miscSrc:Q.spItemB("atk",s._sourceKey)?Q.spItemSrc(s._sourceKey).join(", "):undefined,note:cantripNote(B,s,ag,ab)});if(Object.prototype.hasOwnProperty.call(s,"sourceKey"))C.attacks[C.attacks.length-1].sourceKey=s.sourceKey;if(s.temporaryCantrip)C.attacks[C.attacks.length-1].temporaryCantrip=structuredClone(s.temporaryCantrip)
}
/* Eldritch Blast beams, Eldritch Spear range, Repelling Blast and Agonizing Blast are read inside the row (the Warlock invocation choices) */
registerSheetGroup({id:"cantrip-attack-rows",group:"spells",phase:"spells",order:70,reads:["i.B","i.TLv","l.sp","C.spells","q.agOn","q.clsLv","q.spItemB","q.spItemSrc"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,B=I.B,C=ctx.C,sp=ctx.l.sp,ab=sp.ab;if(!ctx.C.spells)return null;const TLv=I.TLv,tier=TLv>=17?4:TLv>=11?3:TLv>=5?2:1;
  ctx.C.spells.forEach((s) =>{cantripRow(C,Q,B,s,ab,tier)});return ctx.patch()}});
registerSheetGroup({id:"spell-strip-ability",group:"spells",phase:"spells",order:80,reads:[],writes:["C.spells"],
 run:function(ctx){(ctx.C.spells||[]).forEach((s) =>{delete s._ab;delete s._sourceKey});return ctx.patch()}});
/* v58: spells that magic items let you cast (ITEM_SPELLS). use is "At will" when free, else "Item" and itc says what it costs */
/* Dawnbringer's native blade-touch action overrides the spell's edition timing. */
function itemSpellCastingTime(itemName,spellName,spellTime){return itemName==="Dawnbringer"&&spellName==="Lesser Restoration"?"Action":spellTime}
registerSheetGroup({id:"item-spells",group:"spells",phase:"spells",order:90,reads:["i.a","i.SM","i.ATT","q.ensureInv","q.dmapRow","q.spFxTo","q.itemInUse","q.qOf"],writes:["C.spells"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C,SM=I.SM,a=I.a,ISL=[];
  Q.ensureInv().forEach((x,ix) =>{const it=itemSpellRow(x.n);if(!it||!itemSpellAvailable(I,Q,x,ix))return;
   it.sp.forEach((q) =>{const sp=SM[q[0]];if(!sp)return;const cost=q[1],pl=q[3],src=x.n+(pl?" ("+pl+")":"");if(ISL.some((y) =>{return y.n===q[0]&&y.src===src}))return;
    const lv=typeof q[2]==="number"&&q[2]?q[2]:sp[1];
    const o={n:q[0],l:sp[1],sch:sp[2],ct:itemSpellCastingTime(x.n,q[0],sp[4]),r:sp[5],cmp:sp[6],dur:sp[7],conc:sp[8],rit:sp[9],sv:sp[10],sum:sp[11]||"",full:spellFullText(q[0])||"",cls:sp[3].filter((c) =>{return c.indexOf("fx:")!==0}).join(", "),use:cost===0?"At will":"Item",src:src,itc:{it:x.n,c:cost,lv:lv}};
    if(it.dc!=null)o.itc.dc=it.dc;if(it.atk!=null)o.itc.atk=it.atk;Q.spFxTo(o,"",a);mergeRepairKnowledge(o,{baseKnown:false,sources:[{item:x.n,maxBreakFeet:1,requiresAttunement:!!(Q.dmapRow(x.n)&&Q.dmapRow(x.n)[3]),itemState:"wielded",grantsKnowledge:true}]});ISL.push(o)})});
  if(ISL.length){C.spells=(C.spells||[]).concat(ISL);C.spells.sort((p,q) =>{return p.l-q.l||(p.n<q.n?-1:p.n>q.n?1:0)})}return ctx.patch()}});
/* v21 M2: Mystic Arcanum and Contact Patron, once per Long Rest without a slot. v23 m1-r3: the shared "Mystic Arcanum" row only counts the arcana that have no own row yet */
/* Repair capability is derived independently of attack eligibility and never grants a spell row. */
function repairEffectSource(e,spec){return {item:e.owner,maxBreakFeet:spec.maxBreakFeet,requiresAttunement:e.itemState==="attuned",itemState:e.itemState||"wielded",grantsKnowledge:false}}
function repairSourcesFor(G){const out=[];(G||[]).forEach(e=>{if(e.kind!=="item")return;(e.objectRepair||[]).forEach(spec=>{if(!repairSpecProblems(spec).length)out.push(repairEffectSource(e,spec))})});return out}
function finishRepairProfile(row,overrides){if(row.n!=="Mending")return;const knowledge=row._repairKnowledge||{baseKnown:true,sources:[]},sources=structuredClone(knowledge.sources);overrides.forEach(source=>{const existing=sources.find(x=>x.item===source.item&&x.itemState===source.itemState);if(existing)existing.maxBreakFeet=Math.max(existing.maxBreakFeet,source.maxBreakFeet);else sources.push(source)});const profile=mendingRepairSpec(sources.map(source=>({spell:"Mending",maxBreakFeet:source.maxBreakFeet})));row.objectRepair=Object.assign(profile,{baseKnown:knowledge.baseKnown,sources});delete row._repairKnowledge}
registerSheetGroup({id:"spell-object-repair",group:"spells",phase:"spells",order:95,reads:["i.G","C.spells","C.inv"],writes:["C.spells","C.objectRepairSources"],run:function(ctx){const sources=repairSourcesFor(ctx.i.G);if(sources.length)ctx.C.objectRepairSources=structuredClone(sources);(ctx.C.spells||[]).forEach(row=>finishRepairProfile(row,sources));return ctx.patch()}});
registerSheetRule({id:"warlock-arcanum-patron-counters",group:"spells",about:"Warlock: Mystic Arcanum and Contact Patron spells get their own once-per-Long-Rest counters",phase:"spells",order:100,reads:["C.spells","q.resKey"],writes:["C.res"],
 run:function(ctx){const C=ctx.C,Q=ctx.q,spells=ctx.C.spells;const maN=(spells||[]).filter((s) =>{return s.src==="Mystic Arcanum"}).length;if(maN)C.res=C.res.filter((r) =>{if(r.n==="Mystic Arcanum"&&+r.max>=1){r.max=+r.max-maN;return r.max>0}return true});/* m1-r4: the arcana not chosen yet keep a shared row */
  (spells||[]).forEach((s) =>{const one=s.src==="Contact Patron"&&C.res.filter((r) =>{return r.n===s.src&&+r.max===1})[0];if(one){one.n=s.src+": "+s.n;one.f=one.f||s.src;return}/* v23 m3-r2: one counter, named after the spell */if(/^(Mystic Arcanum|Contact Patron)$/.test(s.src)&&!C.res.some((r) =>{return r.f===s.src&&r.n.indexOf(s.n)>=0}))C.res.push({k:Q.resKey("x-",s.src+" "+s.n,C.res),n:s.src+": "+s.n,tag:"1/Long Rest spell",max:1,reset:"long",f:s.src})});return ctx.patch()}});
/* RD18 */
registerSheetGroup({id:"metamagic-features",group:"features",phase:"spells",order:110,reads:["i.B","i.SRC"],writes:["C.features"],
 run:function(ctx){const mmk=chJoin(ctx.i.B.ch,/metamagic$/);if(mmk.length)ctx.C.features.push({g:"Metamagic Options",items:mmk.map((n) =>{const o=metamagicRows().filter((x) =>{return x[0]===n})[0];return {n:n,s:ctx.i.SRC+", Sorcerer",d:o?o[1]:""}})});return ctx.patch()}});
registerSheetGroup({id:"invocation-features",group:"features",phase:"spells",order:120,reads:["i.B","i.SRC","i.invs","q.pactInvocation"],writes:["C.features"],
 run:function(ctx){const I=ctx.i,B=I.B,invs=I.invs;if(invs.length){let lfoN=0;ctx.C.features.push({g:"Eldritch Invocations",items:invs.map((n) =>{const o=invocationRows().filter((x) =>{return x[0]===n})[0]||ctx.q.pactInvocation(n),q=invPickRow(n);let y="";
  if(q&&q.feat){lfoN++;y=B.ch[q.key+lfoN]||""}else if(q)y=(B.ch[q.key]||[]).join(", ");return {n:n,s:I.SRC+", Warlock",d:(o?o[1]:"")+(y?" **Your choice.** "+y+".":"")}})})}return ctx.patch()}});/* v32 RL49 */
/* m3 (RL19): Devil's Sight is its own sense, not Darkvision (PHB 2024 p. 155). New optional field C.senses [{n, v (ft), s, d}] */
registerSheetRule({id:"devils-sight",group:"senses",about:"Warlock invocation Devil's Sight: a sense of 120 ft",phase:"spells",order:130,reads:["i.invs","i.SRC","C.senses"],writes:["C.senses"],
 run:function(ctx){const I=ctx.i,C=ctx.C;if(I.invs.indexOf("Devil's Sight")>=0)C.senses=(C.senses||[]).concat([{n:"Devil's Sight",v:120,s:"Eldritch Invocation ("+I.SRC+", Warlock)",d:"You see normally in Dim Light and in Darkness, magical or not, out to 120 ft."}]);return ctx.patch()}});
/* M13: Pact of the Blade is applied to the chosen weapon only, in the attack rows. Thirsting Blade and Devouring Blade change the Attack action text */
registerSheetRule({id:"thirsting-devouring-blade",group:"actions",about:"Warlock invocations Thirsting Blade and Devouring Blade: more attacks with the pact weapon",phase:"spells",order:140,reads:["i.invs"],writes:["C.actions"],
 run:function(ctx){const invs=ctx.i.invs,C=ctx.C;if(invs.indexOf("Thirsting Blade")>=0||invs.indexOf("Devouring Blade")>=0)C.actions[0].d="Make "+(invs.indexOf("Devouring Blade")>=0?"three":"two")+" attacks with your pact weapon (Thirsting Blade), or one attack otherwise. "+C.actions[0].d.replace(/^Make one attack\. /,"");/* zero-miss-1: the plain "Make one attack." was said twice */return ctx.patch()}});

function itemSpellAvailable(I,Q,x,ix){const d=Q.dmapRow(x.n);return !!d&&Q.qOf(x)>0&&(!d[3]||Q.itemInUse(x,I.ATT.rows[ix]))}
