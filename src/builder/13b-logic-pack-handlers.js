import {registerPackStep} from "./13a-logic-pack-registry.js";
/* Pack steps (contract in 13a-logic-pack-registry.js): the rebuild of the rule tables that applyPacks() does, one step per table.
   Order inside a phase is the order the old single function had. Locals are short names on purpose: the tables are not read by their global names. */
const wipe=function(o){Object.keys(o).forEach((k) =>{delete o[k]})};
/* ---------- phase reset: every table back to the base snapshot (BASE, taken by snap() before the first change) ---------- */
registerPackStep({id:"reset-species",phase:"reset",order:10,about:"SPECIES back to the base; a character that uses a MoM species keeps the source on, MoM species are dropped when it is off",uses:["T.B","T.BASE","T.SPECIES"],writes:["T.SPECIES","T.B"],
 run:function(ctx){const Bx=ctx.T.B,Sx=ctx.T.SPECIES,sp=JSON.parse(ctx.T.BASE.sp);wipe(Sx);Object.assign(Sx,sp);
  if(sp[Bx.species]&&sp[Bx.species].hb==="MoM")Bx.src.mom=true;/* v38 p13: a character that uses a MoM species keeps the source on */
  if(!Bx.src.mom)Object.keys(Sx).forEach((k) =>{if(Sx[k].hb==="MoM")delete Sx[k]})}});
registerPackStep({id:"reset-backgrounds",phase:"reset",order:20,about:"BACKGROUNDS back to the base",uses:["T.BASE","T.BACKGROUNDS"],writes:["T.BACKGROUNDS"],
 run:function(ctx){const o=ctx.T.BACKGROUNDS;wipe(o);Object.assign(o,JSON.parse(ctx.T.BASE.bg))}});
registerPackStep({id:"reset-feats",phase:"reset",order:30,about:"FEATS back to the base",uses:["T.BASE","T.FEATS"],writes:["T.FEATS"],
 run:function(ctx){const o=ctx.T.FEATS;wipe(o);Object.assign(o,JSON.parse(ctx.T.BASE.ft))}});
registerPackStep({id:"reset-subclasses",phase:"reset",order:40,about:"the subclass lists of every class back to the base (a class of a third party book that has none gets an empty list)",uses:["T.BASE","T.CLASSES"],writes:["T.CLASSES"],
 run:function(ctx){const Cx=ctx.T.CLASSES,subs=JSON.parse(ctx.T.BASE.subs);Object.keys(Cx).forEach((c) =>{Cx[c].subs=Cx[c].tp&&!subs[c]?{}:subs[c]})}});
registerPackStep({id:"reset-class-features",phase:"reset",order:50,about:"the class feature lists back to the base",uses:["T.BASE","T.CLASSES"],writes:["T.CLASSES"],
 run:function(ctx){const Cx=ctx.T.CLASSES,cf0=JSON.parse(ctx.T.BASE.cf);Object.keys(Cx).forEach((c) =>{if(cf0[c])Cx[c].f=cf0[c]})/* P4: a class of a third party book is not in the base snapshot, it keeps its own features */}});
registerPackStep({id:"reset-pack-class-features",phase:"reset",order:60,about:"the full texts that a pack added to CF_FULL are removed",uses:["T.CF_FULL","T.PACK_CF"],writes:["T.CF_FULL","T.PACK_CF"],
 run:function(ctx){const F=ctx.T.CF_FULL,pk=ctx.T.PACK_CF;pk.forEach((k) =>{delete F[k]});pk.length=0}});
registerPackStep({id:"reset-price",phase:"reset",order:70,about:"PRICE back to the base",uses:["T.BASE","T.PRICE"],writes:["T.PRICE"],
 run:function(ctx){const o=ctx.T.PRICE,pr0=JSON.parse(ctx.T.BASE.price);wipe(o);Object.assign(o,pr0)/* v20 RD24 */}});
registerPackStep({id:"reset-auto-spells",phase:"reset",order:80,about:"AUTO (always prepared spells by subclass) back to the base",uses:["T.BASE","T.AUTO"],writes:["T.AUTO"],
 run:function(ctx){const o=ctx.T.AUTO,au=JSON.parse(ctx.T.BASE.auto);wipe(o);Object.assign(o,au)}});
registerPackStep({id:"reset-2014-switches",phase:"reset",order:90,about:"the 2014 switch state of the feat, equipment and magic item tables is cleared (the post steps set it again)",uses:["q.dm14Reset"],writes:[],
 run:function(ctx){ctx.q.dm14Reset()}});
registerPackStep({id:"reset-magic-items",phase:"reset",order:100,about:"DMGI from the base when the DMG source is on (v93: DMGI is rebuilt here), then the lookup table DMAP and its aliases",uses:["T.B","T.BASE","T.DMGI","T.DMAP","q.dmapAlias"],writes:["T.DMGI","T.DMAP"],
 run:function(ctx){const G=ctx.T.DMGI,M=ctx.T.DMAP;G.length=0;if(ctx.T.B.src.dmg!==false)ctx.T.BASE.dmgi.forEach((x) =>{G.push(x)});
  wipe(M);G.forEach((x) =>{M[x[0]]=x});ctx.q.dmapAlias()/* V16-1 */}});
/* ---------- phase pack: what one enabled pack adds ---------- */
registerPackStep({id:"pack-species",phase:"pack",order:10,about:"species of a pack",uses:["T.SPECIES"],writes:["T.SPECIES"],
 run:function(ctx){const p=ctx.p,o=ctx.T.SPECIES;Object.keys(p.species||{}).forEach((k) =>{const s=p.species[k];o[k]={size:s.size||"Medium",speed:+s.speed||30,dark:+s.dark||0,traits:s.traits||[],featPick:s.featPick,skillPick:s.skillPick,lin:s.lin,linFx:s.linFx,linText:s.linText,opts:s.opts,skills:s.skills,asiFlex:s.asiFlex,hb:p.name}})}});
registerPackStep({id:"pack-subclasses",phase:"pack",order:20,about:"subclasses of a pack, for the classes that exist",uses:["T.CLASSES"],writes:["T.CLASSES"],
 run:function(ctx){const p=ctx.p,Cx=ctx.T.CLASSES;Object.keys(p.subclasses||{}).forEach((c) =>{if(!Cx[c])return;Object.keys(p.subclasses[c]).forEach((s) =>{Cx[c].subs[s]=p.subclasses[c][s]})})}});
registerPackStep({id:"pack-feats",phase:"pack",order:30,about:"feats of a pack (category General unless the pack says otherwise)",uses:["T.FEATS"],writes:["T.FEATS"],
 run:function(ctx){const p=ctx.p,o=ctx.T.FEATS;Object.keys(p.feats||{}).forEach((k) =>{o[k]=Object.assign({cat:"G"},p.feats[k],{hb:p.name})})}});
registerPackStep({id:"pack-backgrounds",phase:"pack",order:40,about:"backgrounds of a pack",uses:["T.BACKGROUNDS"],writes:["T.BACKGROUNDS"],
 run:function(ctx){const p=ctx.p,o=ctx.T.BACKGROUNDS;Object.keys(p.backgrounds||{}).forEach((k) =>{o[k]=p.backgrounds[k]})}});
registerPackStep({id:"pack-auto-spells",phase:"pack",order:50,about:"always prepared spells of a pack",uses:["T.AUTO"],writes:["T.AUTO"],
 run:function(ctx){const p=ctx.p,o=ctx.T.AUTO;Object.keys(p.autoSpells||{}).forEach((k) =>{o[k]=p.autoSpells[k]})}});
registerPackStep({id:"pack-magic-items",phase:"pack",order:60,about:"magic items of a pack: list, lookup and price",uses:["T.DMGI","T.DMAP","T.PRICE"],writes:["T.DMGI","T.DMAP","T.PRICE"],
 run:function(ctx){const p=ctx.p,G=ctx.T.DMGI,M=ctx.T.DMAP,P=ctx.T.PRICE;(p.items||[]).forEach((x) =>{G.push(x);M[x[0]]=x;if(x[5]&&x[5].cost!=null)P[x[0]]=x[5].cost})}});
/* v20 RD24: class features of a pack (Bonus Class Features), at their level, with full text */
registerPackStep({id:"pack-class-features",phase:"pack",order:70,about:"class features of a pack (a core feature of the same name wins), with the full text in CF_FULL",uses:["T.CLASSES","T.CF_FULL","T.PACK_CF"],writes:["T.CLASSES","T.CF_FULL","T.PACK_CF"],
 run:function(ctx){const p=ctx.p,Cx=ctx.T.CLASSES,F=ctx.T.CF_FULL,pk=ctx.T.PACK_CF;
  Object.keys(p.clsFeat||{}).forEach((c) =>{if(!Cx[c])return;p.clsFeat[c].forEach((f) =>{const k=c+"|"+f[1];if(Cx[c].f.some((x) =>{return x[1]===f[1]}))return;/* a core feature of that name wins */
   Cx[c].f=Cx[c].f.concat([f]).sort((x,y) =>{return x[0]-y[0]});if(F[k]==null||pk.indexOf(k)>=0){F[k]=(f[3]&&f[3].full)||f[2];pk.push(k)}})})}});
/* ---------- phase post: gates of the optional books, the 2014 switch, fallbacks ---------- */
/* v56 EFotA: the class, species and feats exist only while the source is on. A character that uses any of them keeps the source on. */
const efaUsed=function(B,Sx,Bg,q){const R14=q.r14();
 return !R14&&(B.cls==="Artificer"||(B.mc||[]).some((m) =>{return m.cls==="Artificer"}))||!R14&&(Sx[B.species]&&Sx[B.species].hb==="EFotA")||(Bg[B.bg]&&Bg[B.bg].hb==="EFotA")||(function(){const js=JSON.stringify(B.ch||{});return (q.efaNames().feats||[]).some((n) =>{return js.indexOf('"'+n+'"')>=0})})()};
registerPackStep({id:"gate-efa-source",phase:"post",order:10,about:"Eberron: Forge of the Artificer is on while the 2024 rules are used and the character needs it",uses:["T.B","T.SPECIES","T.BACKGROUNDS","q.efaCls","q.efaNames","q.r14"],writes:["T.B"],
 run:function(ctx){const q=ctx.q,B=ctx.T.B;if(!q.efaCls())return;const us=efaUsed(B,ctx.T.SPECIES,ctx.T.BACKGROUNDS,q);if(q.r14())B.src.efa=false;if(us)B.src.efa=true}});
registerPackStep({id:"gate-efa-off",phase:"post",order:11,about:"source off: its species, feats, backgrounds and the Artificer class are removed",uses:["T.B","T.SPECIES","T.FEATS","T.BACKGROUNDS","T.CLASSES","q.efaCls"],writes:["T.SPECIES","T.FEATS","T.BACKGROUNDS","T.CLASSES"],
 run:function(ctx){const T=ctx.T;if(!ctx.q.efaCls()||T.B.src.efa)return;
  [T.SPECIES,T.FEATS,T.BACKGROUNDS].forEach((o) =>{Object.keys(o).forEach((k) =>{if(o[k].hb==="EFotA")delete o[k]})});
  if(!(T.CLASSES.Artificer&&T.CLASSES.Artificer.a14))delete T.CLASSES.Artificer}});
registerPackStep({id:"gate-efa-on",phase:"post",order:12,about:"source on: the Artificer class joins the class list, in alphabetical order",uses:["T.B","T.CLASSES","q.efaCls"],writes:["T.CLASSES"],
 run:function(ctx){const Cx=ctx.T.CLASSES,q=ctx.q;if(!q.efaCls()||!ctx.T.B.src.efa)return;
  if(!Cx.Artificer||Cx.Artificer.a14){const all=Object.keys(Cx).map((k) =>{return [k,Cx[k]]});all.push(["Artificer",q.efaCls()]);all.sort((a,b) =>{return a[0]<b[0]?-1:1});wipe(Cx);all.forEach((r) =>{Cx[r[0]]=r[1]})}}});
/* the gates and switches of other files are services; the order is the old one: wxGate, 2014 class rules, spells, equipment, magic items, glossary */
registerPackStep({id:"gate-wx",phase:"post",order:20,about:"v62: WotC sources",uses:["q.wxGate"],writes:[],run:function(ctx){ctx.q.wxGate()}});
registerPackStep({id:"switch-2014-classes",phase:"post",order:30,about:"v85 v86: class rules of the 2014 switch",uses:["q.cls14Apply"],writes:[],run:function(ctx){ctx.q.cls14Apply()}});
registerPackStep({id:"switch-2014-spells",phase:"post",order:40,about:"v92: spell table of the 2014 switch",uses:["q.sp14Set","q.r14"],writes:[],run:function(ctx){ctx.q.sp14Set(ctx.q.r14(),true)}});
registerPackStep({id:"switch-2014-equipment",phase:"post",order:50,about:"equipment table of the 2014 switch",uses:["q.eq14Set","q.r14"],writes:[],run:function(ctx){ctx.q.eq14Set(ctx.q.r14(),true)}});
registerPackStep({id:"switch-2014-magic-items",phase:"post",order:60,about:"v93: magic item table of the 2014 switch",uses:["q.dm14Set","q.r14"],writes:[],run:function(ctx){ctx.q.dm14Set(ctx.q.r14(),true)}});
registerPackStep({id:"switch-2014-glossary",phase:"post",order:70,about:"v94: glossary of the 2014 switch",uses:["q.gl14","q.r14"],writes:[],run:function(ctx){ctx.q.gl14(ctx.q.r14())}});
registerPackStep({id:"fallback-species",phase:"post",order:80,about:"a species that no longer exists becomes Human",uses:["T.B","T.SPECIES"],writes:["T.B"],
 run:function(ctx){const B=ctx.T.B;if(!ctx.T.SPECIES[B.species]&&B.species!=="Custom")B.species="Human"}});
registerPackStep({id:"fallback-background",phase:"post",order:90,about:"a background that no longer exists becomes Soldier",uses:["T.B","T.BACKGROUNDS"],writes:["T.B"],
 run:function(ctx){const B=ctx.T.B;if(!ctx.T.BACKGROUNDS[B.bg])B.bg="Soldier"}});
registerPackStep({id:"fallback-subclass",phase:"post",order:100,about:"a subclass that no longer exists is cleared",uses:["T.B","q.CL"],writes:["T.B"],
 run:function(ctx){const B=ctx.T.B,c=ctx.q.CL();if(!c)return;/* class pack not loaded (yet): keep the pick, never crash */if(B.sub&&B.sub!=="__custom"&&!(c.subs||{})[B.sub])B.sub=""}});
