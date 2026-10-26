/* v32 RL51 actsFor */
/* C.acts: one entry per action a feature gives, from ACTS (audited to PHB 2024). k = action|bonus|reaction|other, n = label, f = feature name, g = group,
   u = Limited Use name, d = the part of the text named n ("**n.** ..."), it = magic item key. g.ak lists the feature names of a group the table covers
   (the sheet then uses only C.acts for them; other names keep the old text rule) */
function actsFor(C){var out=[],T=typeof ACTS!=="undefined"?ACTS:{},lin=String((B.ch||{}).lin||"");
 var esc=function(x){return String(x).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")};
 var sec=function(t,lab){var m=new RegExp("\\*\\*"+esc(lab)+"\\.\\*\\*\\s*([\\s\\S]*?)(?=\\s*\\*\\*[^*\\n]{1,80}?\\.\\*\\*|$)").exec(String(t||""));return m?m[1].trim():null};
 var keys=function(gg,n){var mm=/^(\w+) \(multiclass \d+\)(?:: (.+))?$/.exec(gg);
  if(gg==="Feats")return ["feat|"+n];if(/^Species: /.test(gg))return ["sp|"+B.species+"|"+n];if(gg===B.cls)return ["cls|"+B.cls+"|"+n];
  if(B.sub&&gg===B.cls+" Subclass: "+B.sub)return ["sub|"+B.sub+"|"+n];if(mm)return ["cls|"+mm[1]+"|"+n].concat(mm[2]?["sub|"+mm[2]+"|"+n]:[]);
  if(gg==="Eldritch Invocations")return ["inv|"+n];if(gg==="Metamagic Options")return ["meta|"+n];return []};
 var put=function(q,it,gg,lab0,txt){var k=q[0],lab=q[1]||lab0,e={k:k,n:lab,f:it.n,g:gg};if(q[3]&&lin.indexOf(q[3])!==0)return;if(q[2])e.u=q[2];
  if(txt!=null)e.d=txt;else if(q[1]&&q[1]!==it.n){var d=sec(it.full||it.d,q[1]);if(d)e.d=d}out.push(e)};
 (C.features||[]).forEach(function(g){var gg=g.g,ak=[];(g.items||[]).forEach(function(it){
   if(it.n==="Maneuvers known"){ak.push(it.n);var re=/\*\*([^*\n]{1,60}?)\.\*\*/g,m;while((m=re.exec(String(it.d||"")))){var L0=T["man|"+m[1]];if(L0)L0.forEach(function(q){put(q,it,gg,m[1],sec(it.d,m[1]))})}return}
   var L=null;keys(gg,it.n).some(function(k){if(T[k]){L=T[k];return true}return false});if(!L)return;ak.push(it.n);L.forEach(function(q){put(q,it,gg,it.n)})});
  if(ak.length)g.ak=ak;else delete g.ak});
 /* magic items in use (attunement within the limit), from the item text: Magic action, Bonus Action, Reaction */
 var att=0,am=attMax();(B.inv||[]).forEach(function(x){if(!x.eq)return;var d=DMAP[x.n];if(!d)return;if(d[3]){if(att>=am||!byOk(d[5]&&d[5].by))return;att++}
  var t=String(d[4]||""),ss=t.split(/(?<=[.!?])\s+/);[["action",/\b(Magic|Utilize) action\b/],["bonus",/\bBonus Action\b/],["reaction",/\bReaction\b/]].forEach(function(p){var mine=ss.filter(function(z){return p[1].test(z)&&!/\b(A|The) (hag|creature|target|monster)\b(?:(?!\byou\b)[^.])*\b(can take|takes)\b/.test(z)});if(!mine.length)return;/* v32 p39 */
   out.push({k:p[0],n:x.n,it:x.n,d:mine.join(" ")})})});
 return out}
/* Attack rows a feature gives: Polearm Master Pole Strike (PHB 2024 p. 205), Soulknife Psychic Blades (p. 136), Circle of the Stars Archer (p. 89) */
function actAtk(C,a,feats){var L=C.attacks||(C.attacks=[]),add=[];
 if(feats.some(function(f){return f.n==="Polearm Master"}))L.forEach(function(r){if(r.act||/ \(thrown\)$/.test(r.n)||r.n==="Unarmed Strike")return;var b=baseOf(r.n).b,w=WEAPONS[b];
  if(!w||w.k!=="M"||!(b==="Quarterstaff"||b==="Spear"||(/Heavy/.test(w.p)&&/Reach/.test(w.p))))return;
  add.push({n:"Pole Strike",sub:r.n+" • Bonus Action",ab:r.ab,prof:r.prof,die:"1d4",dieSrc:"Polearm Master: Pole Strike ("+SRC+"), the other end of the "+b,misc:r.misc,miscSrc:r.miscSrc,dmgBonus:r.dmgBonus,
   type:"Bludgeoning",range:/Reach/.test(w.p)?"10 ft":"5 ft",m:r.m,note:"Bonus Action, right after you take the Attack action and attack with this weapon.",act:"bonus",of:r.n})});
 var pn=add.filter(function(r){return r.n==="Pole Strike"});if(pn.length>1)pn.forEach(function(r){r.n="Pole Strike ("+r.of+")"});/* one name per row when two weapons carry it */
 var sk=subAt("Rogue","Soulknife");if(sk>=3){var fab=a.sc.DEX>a.sc.STR?"DEX":"STR",src="Psychic Blades ("+SRC+", Soulknife 3)";
  add.push({n:"Psychic Blade",sub:"Finesse, Thrown (60/120) • Soulknife",ab:fab,prof:true,die:"1d6",dieSrc:src,type:"Psychic",range:"5 ft, 60/120 ft",m:"Vex",note:"Formed in a free hand when you take the Attack action or make an Opportunity Attack. It vanishes after the attack."});
  add.push({n:"Psychic Blade (Bonus Action)",sub:"Bonus Action • Finesse, Thrown (60/120)",ab:fab,prof:true,die:"1d4",dieSrc:src,type:"Psychic",range:"5 ft, 60/120 ft",m:"Vex",note:"After you attack with a Psychic Blade on your turn, if your other hand is free.",act:"bonus"})}
 var st=subAt("Druid","Circle of the Stars");if(st>=3){var sb=spItemB("atk","Druid");
  add.push({n:"Starry Form: Archer",sub:"Bonus Action • Archer form • ranged spell attack",ab:"WIS",prof:true,die:st>=10?"2d8":"1d8",dieSrc:"Starry Form: Archer ("+SRC+", Circle of the Stars 3"+(st>=10?"; Twinkling Constellations, level 10":"")+")",misc:sb||undefined,miscSrc:sb?spItemSrc("Druid").join(", "):undefined,
   type:"Radiant",range:"60 ft",m:"",note:"While the Archer form lasts: when you take the form, and as a Bonus Action on later turns.",act:"bonus"})}
 if(C.xdmg){C.xdmg=C.xdmg.filter(function(x){return !(x.n==="Psychic Blades"&&sk>=3)&&!(x.n==="Starry Form: Archer"&&st>=3)});if(!C.xdmg.length)delete C.xdmg}
 add.forEach(function(r){L.push(r)})}
/* ---------- sources & homebrew packs ---------- */
var PACK_TEMPLATE={id:"my-homebrew",name:"My Homebrew",desc:"Short description",species:{"Example Folk":{size:"Medium",speed:30,dark:60,traits:[["Trait Name","What it does."]]}},subclasses:{"Rogue":{"Example Archetype":[[3,"Feature","What it does."]]}},feats:{"Example Feat":{cat:"G",pre:"Level 4+",asi:["STR","DEX"],d:"What it does."}},backgrounds:{"Example Background":{ab:["STR","DEX","CON"],feat:"Alert",sk:["Athletics","Stealth"],tool:"Thieves' Tools",eq:"Dagger, 15 GP",gp:15}},skills:{"Example Skill":"INT"},items:[["Example Ring","Ring","Rare",1,"What it does."]]};
var BASE=null;
var PACK_CF=[];/* v20 RD24: CF_FULL keys a pack added */
function snap(){if(!BASE){eq14Set(false);dm14Set(false)}if(!BASE)BASE={cf:JSON.stringify(Object.keys(CLASSES).reduce(function(o,c){o[c]=CLASSES[c].f;return o},{})),price:JSON.stringify(PRICE),sp:JSON.stringify(SPECIES),bg:JSON.stringify(BACKGROUNDS),ft:JSON.stringify(FEATS),subs:JSON.stringify(Object.keys(CLASSES).reduce(function(o,c){o[c]=CLASSES[c].subs;return o},{})),dmgi:DMGI.slice(),auto:JSON.stringify(AUTO)}}
function allPacks(){return Object.keys(HB_BUILTIN).map(function(k){return HB_BUILTIN[k]}).concat(B.packs||[])}
function enabledPacks(){B.src=B.src||{core:true,dmg:true};return allPacks().filter(function(p){return B.src[p.id]})}
window.__setSrc=function(k,v){B.src=B.src||{core:true,dmg:true};B.src[k]=!!v;applyPacks()};window.__hasItem=function(n){return !!DMAP[n]};window.__hasSp=function(n){return !!SPECIES[n]};window.__hasBg=function(n){return !!BACKGROUNDS[n]};window.__hasGear=function(n){return GEAR.some(function(g){return g[0]===n})};window.__spellNames=function(){return SPELLS.map(function(x){return x[0]})};window.__hasAny=function(n){return !!(DMAP[n]||ARMOR[n]||WEAPONS[n]||GEAR.some(function(g){return g[0]===n})||POTIONS.some(function(q){return q[0]===n}))};/* v75: for tests *//* v65: for tests *//* v38 p13: for tests */
function applyPacks(){B.src=B.src||{core:true,dmg:true};snap();var sp=JSON.parse(BASE.sp),bg=JSON.parse(BASE.bg),ft=JSON.parse(BASE.ft),subs=JSON.parse(BASE.subs);
 Object.keys(SPECIES).forEach(function(k){delete SPECIES[k]});Object.assign(SPECIES,sp);
 if(sp[B.species]&&sp[B.species].hb==="MoM")B.src.mom=true;/* v38 p13: a character that uses a MoM species keeps the source on */
 if(!B.src.mom)Object.keys(SPECIES).forEach(function(k){if(SPECIES[k].hb==="MoM")delete SPECIES[k]});
 Object.keys(BACKGROUNDS).forEach(function(k){delete BACKGROUNDS[k]});Object.assign(BACKGROUNDS,bg);
 Object.keys(FEATS).forEach(function(k){delete FEATS[k]});Object.assign(FEATS,ft);
 Object.keys(CLASSES).forEach(function(c){CLASSES[c].subs=subs[c]});var cf0=JSON.parse(BASE.cf);Object.keys(CLASSES).forEach(function(c){CLASSES[c].f=cf0[c]});PACK_CF.forEach(function(k){delete CF_FULL[k]});PACK_CF=[];var pr0=JSON.parse(BASE.price);Object.keys(PRICE).forEach(function(k){delete PRICE[k]});Object.assign(PRICE,pr0);/* v20 RD24 */var au=JSON.parse(BASE.auto);Object.keys(AUTO).forEach(function(k){delete AUTO[k]});Object.assign(AUTO,au); DM14ON=false;DM14S=null;DM14M=null;/* v93: DMGI is rebuilt below */ DMGI.length=0;if(B.src.dmg!==false)BASE.dmgi.forEach(function(x){DMGI.push(x)});
 Object.keys(DMAP).forEach(function(k){delete DMAP[k]});DMGI.forEach(function(x){DMAP[x[0]]=x});dmapAlias();/* V16-1 */
 enabledPacks().forEach(function(p){
  Object.keys(p.species||{}).forEach(function(k){var s=p.species[k];SPECIES[k]={size:s.size||"Medium",speed:+s.speed||30,dark:+s.dark||0,traits:s.traits||[],featPick:s.featPick,skillPick:s.skillPick,lin:s.lin,linFx:s.linFx,linText:s.linText,opts:s.opts,skills:s.skills,hb:p.name}});
  Object.keys(p.subclasses||{}).forEach(function(c){if(!CLASSES[c])return;Object.keys(p.subclasses[c]).forEach(function(s){CLASSES[c].subs[s]=p.subclasses[c][s]})});
  Object.keys(p.feats||{}).forEach(function(k){FEATS[k]=Object.assign({cat:"G"},p.feats[k],{hb:p.name})});
  Object.keys(p.backgrounds||{}).forEach(function(k){BACKGROUNDS[k]=p.backgrounds[k]});
  Object.keys(p.autoSpells||{}).forEach(function(k){AUTO[k]=p.autoSpells[k]});
  (p.items||[]).forEach(function(x){DMGI.push(x);DMAP[x[0]]=x;if(x[5]&&x[5].cost!=null)PRICE[x[0]]=x[5].cost});
  /* v20 RD24: class features of a pack (Bonus Class Features), at their level, with full text */
  Object.keys(p.clsFeat||{}).forEach(function(c){if(!CLASSES[c])return;p.clsFeat[c].forEach(function(f){var k=c+"|"+f[1];if(CLASSES[c].f.some(function(x){return x[1]===f[1]}))return;/* a core feature of that name wins */
   CLASSES[c].f=CLASSES[c].f.concat([f]).sort(function(x,y){return x[0]-y[0]});if(CF_FULL[k]==null||PACK_CF.indexOf(k)>=0){CF_FULL[k]=(f[3]&&f[3].full)||f[2];PACK_CF.push(k)}})})});
 efaGate();/* v56: Eberron: Forge of the Artificer */ wxGate();/* v62: WotC sources */cls14Apply();/* v85 v86 */sp14Set(R14(),true);/* v92 */eq14Set(R14(),true);dm14Set(R14(),true);/* v93 */window.__gl14&&window.__gl14(R14());/* v94 */
 if(!SPECIES[B.species]&&B.species!=="Custom")B.species="Human";if(!BACKGROUNDS[B.bg])B.bg="Soldier";if(B.sub&&B.sub!=="__custom"&&!CL().subs[B.sub])B.sub=""}
/* v56 EFotA: the class, species and feats exist only while the source is on. A character that uses any of them keeps the source on. */
function efaGate(){if(!window.EFA_CLS)return;var us=!R14()&&(B.cls==="Artificer"||(B.mc||[]).some(function(m){return m.cls==="Artificer"}))||!R14()&&(SPECIES[B.species]&&SPECIES[B.species].hb==="EFotA")||(BACKGROUNDS[B.bg]&&BACKGROUNDS[B.bg].hb==="EFotA")||(function(){var js=JSON.stringify(B.ch||{});return (window.EFA_NAMES.feats||[]).some(function(n){return js.indexOf('"'+n+'"')>=0})})(); if(R14())B.src.efa=false;if(us)B.src.efa=true;
 if(!B.src.efa){Object.keys(SPECIES).forEach(function(k){if(SPECIES[k].hb==="EFotA")delete SPECIES[k]});Object.keys(FEATS).forEach(function(k){if(FEATS[k].hb==="EFotA")delete FEATS[k]});Object.keys(BACKGROUNDS).forEach(function(k){if(BACKGROUNDS[k].hb==="EFotA")delete BACKGROUNDS[k]});if(!(CLASSES.Artificer&&CLASSES.Artificer.a14))delete CLASSES.Artificer;return}
 if(!CLASSES.Artificer||CLASSES.Artificer.a14){var all=Object.keys(CLASSES).map(function(k){return [k,CLASSES[k]]});all.push(["Artificer",window.EFA_CLS]);all.sort(function(a,b){return a[0]<b[0]?-1:1});Object.keys(CLASSES).forEach(function(k){delete CLASSES[k]});all.forEach(function(r){CLASSES[r[0]]=r[1]})}}
function packSkills(){var o=[];enabledPacks().forEach(function(p){Object.keys(p.skills||{}).forEach(function(k){o.push({n:k,ab:p.skills[k],src:p.name,d:(p.skillD||{})[k]||""})})});return o}
function subGrant(sub){var g=null,G0=typeof SUB_GRANT!=="undefined"&&SUB_GRANT[sub];if(G0&&(G0.armor||G0.weapons))g={armor:G0.armor,weapons:G0.weapons,f:G0.f};/* v58: armor and weapons of built-in subclasses (EFotA). Tools and skills have their own paths */enabledPacks().forEach(function(p){if(p.subGrants&&p.subGrants[sub])g=p.subGrants[sub]});return g}
function subChoicesFor(sub){var o=[];enabledPacks().forEach(function(p){(p.subChoices&&p.subChoices[sub]||[]).forEach(function(c){o.push(c)})});return o}
function spOptFx(){var sp=spX(),fx={};if(!sp)return fx;Object.keys(sp.fx||{}).forEach(function(k){fx[k]=sp.fx[k]});/* v36 p21: fixed species effects */if(sp.opts)(B.ch.spopt||[]).forEach(function(n){var o=sp.opts.list.filter(function(x){return x[0]===n})[0];if(o)Object.keys(o[2]).forEach(function(k){fx[k]=o[2][k]})});
 if(sp.linFx&&B.ch.lin)Object.keys(sp.linFx).forEach(function(k){if(B.ch.lin.indexOf(k)===0)Object.assign(fx,sp.linFx[k])});return fx}
function spHasFeat(){var sp=spX();return !!(sp&&(sp.featPick||spOptFx().feat))}
/* always-prepared spells. Tables AUTO, LAND, CLS_AUTO, SP_AUTO are in db4.js (M17) */
/* M9: k = source key for the spellcasting ability (class name, "@species", "@spcan"), see spellAb() */
function autoSpells(){var L=B.level,out=[];function add(tab,src,lv,k){var LL=lv||L;(tab||[]).forEach(function(r){if(r[0]<=LL)r[1].split(",").forEach(function(n){if(!out.some(function(o){return o.n===n}))out.push({n:n,src:src,k:k,g:r[0]})/* v21 M1: level the spell is gained at */})})}
 add(CLS_AUTO[B.cls],B.cls,0,B.cls);if(B.sub&&B.sub!=="__custom")add(AUTO[B.sub],B.sub,0,B.cls);
 if(B.sub==="Circle of the Land"&&B.ch.land)add(LAND[B.ch.land],"Circle of the Land ("+B.ch.land+")",0,B.cls);
 /* v32 RL49: Circle of the Land as a multiclass, Magical Discoveries (College of Lore 6), High Elf cantrip */
 MCL().forEach(function(m,i){var ld=B.ch["m"+i+":land"];if(m.sub==="Circle of the Land"&&ld&&LAND[ld])add(LAND[ld],"Circle of the Land ("+ld+")",m.lv,m.cls)});
 clsParts().forEach(function(q,i){if(q.sub==="Illusionist"&&q.lv>=3)(B.ch[(q.mc?"m"+(i-1)+":":"")+"p3illcan"]||[]).forEach(function(n){add([[1,n]],"Improved Illusions",q.lv,q.cls)})});
 clsParts().forEach(function(q,i){if(q.sub==="College of Lore"&&q.lv>=6)(B.ch[(q.mc?"m"+(i-1)+":":"")+"p6disc"]||[]).forEach(function(n){add([[1,n]],"Magical Discoveries",q.lv,q.cls)})});
 sbAuto(add);/* v63 */
 var S=un("species")?null:SP_AUTO[B.species];if(S){var k=Object.keys(S).filter(function(k){return k===""||(B.ch.lin||"").indexOf(k)===0})[0];if(k!=null)add(S[k],B.species+(k?" ("+k+")":""),TL(),"@species")}/* M5 (RL9): species spells use the character level (PHB 2024 p. 190, 197) */
 MCL().forEach(function(m){add(CLS_AUTO[m.cls],m.cls,m.lv,m.cls);if(m.sub)add(AUTO[m.sub],m.sub,m.lv,m.cls)});
 (B.ch.spcan||[]).forEach(function(n){add([[1,n]],B.species+" ("+(spOptFx().cantripLabel||"Limited Spellcaster")+")",0,"@spcan")});
 (B.ch.bwc||[]).forEach(function(n){add([[1,n]],B.ch["fs"+CL().fs]||"Fighting Style",0,B.cls)});
 MCL().forEach(function(m,i){(B.ch["m"+i+":bwc"]||[]).forEach(function(n){add([[1,n]],B.ch["m"+i+":fs"]||"Fighting Style",m.lv,m.cls)})});/* v32 RL49 no. 42 */(B.ch.tomeC||[]).concat(B.ch.tomeR||[]).forEach(function(n){add([[1,n]],"Pact of the Tome",0,"Warlock")});
 var hc=(B.ch.hecan||[])[0],hs=spX();if(hc&&hs&&hs.linCan)out.forEach(function(o){if(o.k==="@species"&&o.n===hs.linCan[Object.keys(hs.linCan)[0]].def)o.n=hc});
 return out}
function miFeats(){return allFeats().filter(function(f){return /^Magic Initiate \((?!2014)/.test(f.n)}).map(function(f,i){return {key:"mi"+i,cls:/\((\w+)\)/.exec(f.n)[1],src:f.s}})}
/* ---------- multiclass, HP, shop ---------- */
function MCL(){return (B.mc||[]).filter(function(m){return CLASSES[m.cls]})}
function TL(){return B.level+MCL().reduce(function(t,m){return t+m.lv},0)}
/* M10: every B.ch key that holds languages: lang, langRogue, langRanger, and m<i>:langRogue / m<i>:langRanger for a multiclass */
function langKeys(){return ["lang","langRogue","langRanger"].concat(Object.keys(B.ch||{}).filter(function(k){return /^m\d+:lang(Rogue|Ranger)$/.test(k)||/^(m\d+:)?p\d+(lang|slang)\w*$/.test(k)}))}/* v63: subclass language picks */
function mcReqFail(cls){var a=abil().sc;return MC_REQ[cls].filter(function(g){return !g.some(function(k){return a[k]>=13})}).map(function(g){return g.join(" or ")+" 13"}).join(", ")}
function mcChoices(){var out=[];MCL().forEach(function(m,i){var c=CLASSES[m.cls],p="m"+i+":",src=function(l){return SRC+", "+m.cls+" "+l+" (multiclass)"};
 var g=MC_GRANT[m.cls];if(g.sk)out.push({key:p+"sk",mc:i,lvl:1,t:"skills",n:1,from:g.skFrom==="any"?ALLSK:c.sk.from,title:m.cls+" multiclass skill",src:src(1)});
 if(g.toolPick)out.push({key:p+"tool",mc:i,lvl:1,t:"tool",n:g.toolPick.n,cats:g.toolPick.cats,title:m.cls+" multiclass tool",src:src(1),feature:"Multiclass Proficiencies"});/* v32 RL49 */
 if(c.wm&&!R14())out.push({key:p+"wm",mc:i,lvl:1,t:"wm",n:c.wm[m.lv-1],melee:m.cls==="Barbarian"?1:0,title:m.cls+" Weapon Mastery",src:src(1),feature:"Weapon Mastery"});/* v32 RL49 no. 39 */
 if(c.fs&&m.lv>=c.fs){out.push({key:p+"fs",mc:i,lvl:c.fs,t:"fs",cls:m.cls,xopt:1,title:"Fighting Style",src:src(c.fs),feature:"Fighting Style"});
  var fv=B.ch[p+"fs"];if(fv==="Blessed Warrior"||fv==="Druidic Warrior"){var cl2=fv==="Blessed Warrior"?"Cleric":"Druid";out.push({key:p+"bwc",mc:i,lvl:c.fs,t:"multi",n:2,list:SPELLS.filter(function(x){return !x[1]&&x[3].indexOf(cl2)>=0}).map(function(x){return [x[0],x[11]]}),title:fv+" cantrips",src:src(c.fs),feature:"Fighting Style"})}}/* v32 RL49 no. 42 */
 (c.pick||[]).forEach(function(q){if(m.lv>=q.l){var o=pk(q,m.cls+" "+q.l,m.cls);if(!o)return;o.key=p+o.key;o.mc=i;if(o.list===INVOCATIONS)o.lvCap=m.lv;/* v32: level of this class */if(o.t==="skills"||o.t==="exp")o.src=src(q.l);out.push(o)}});/* v32 RL49 no. 40: Primal Knowledge too */
 /* M10: Rogue 1 (Thieves' Cant: one more language) and Ranger 2 (Deft Explorer: two languages) also as a multiclass */
 if(m.cls==="Rogue"&&!R14())out.push({key:p+"langRogue",mc:i,lvl:1,t:"lang",n:1,from:LANGS,title:"Extra language",src:src(1),feature:"Thieves' Cant"});
 if(m.cls==="Ranger"&&m.lv>=2&&!R14())out.push({key:p+"langRanger",mc:i,lvl:2,t:"lang",n:2,from:LANGS,title:"Languages",src:src(2),feature:"Deft Explorer"}); if(m.lv>=subLv(m.cls))out.push({key:p+"sub",mc:i,lvl:subLv(m.cls),t:"mcsub",title:subLbl(m.cls),src:src(subLv(m.cls))});
 var ps=c.pickSub&&c.pickSub[m.sub];(ps||[]).forEach(function(q){var el=pEff(m.cls,m.sub,q);if(m.lv>=el){var o=pk(q,m.sub+" "+el,m.cls,m.sub);if(!o)return;o.lvl=el;o.key=p+o.key;o.mc=i;out.push(o)}});
 if(m.sub)subChoicesFor(m.sub).forEach(function(q){if(m.lv>=q.l)out.push(q.kind==="opt"?{key:p+"sc"+q.k,mc:i,lvl:q.l,t:"multi",n:q.n,list:q.list,title:q.title,src:m.sub+" "+q.l,feature:q.feature}:{key:p+"sc"+q.k,mc:i,lvl:q.l,t:"skills",n:q.n,from:q.from,title:q.title,src:m.sub+" "+q.l,feature:q.feature})});/* v20 M2 */
 [4,8,12,16].concat(c.asiX||[]).forEach(function(l){if(m.lv>=l)out.push({key:p+"feat"+l,mc:i,lvl:l,t:"feat",cat:"G",title:"Ability Score Improvement or feat",src:SRC+", General Feat ("+m.cls+" "+l+")"})});
 if(m.lv>=19)out.push({key:p+"feat19",mc:i,lvl:19,t:"feat",cat:"E",title:"Epic Boon",src:SRC+", Epic Boon ("+m.cls+" 19)"})});
 return out}
function rollAvg(hd){return hd/2+1}
function hpCalc(){var a=abil(),cm=mod(a.sc.CON),c=CL(),list=[],L=B.level;B.hpr=B.hpr||{};
 function push(cls,hd,lv){var key=cls+lv,r=B.hpMode==="roll"?+B.hpr[key]:0;var v=(r>=1&&r<=hd)?r:rollAvg(hd);list.push({c:cls+" "+lv,v:v,r:B.hpMode==="roll"&&r>=1&&r<=hd?1:0,n:"d"+hd,key:key,hd:hd})}
 for(var l=2;l<=L;l++)push(B.cls,c.hd,l);
 MCL().forEach(function(m){for(var l=1;l<=m.lv;l++)push(m.cls,CLASSES[m.cls].hd,l)});
 var tl=TL(),bonus=toSheetHpBonus(),max=c.hd+list.reduce(function(t,e){return t+e.v},0)+cm*tl+bonus;
 return {max:Math.max(1,max),list:list}}
/* M4 (RL10): one list of HP bonuses, read by hpCalc() (total) and toSheet() (C.hpBonus). Draconic Resilience counts the Sorcerer level in any
   class: +3 at Sorcerer 3 and +1 for each later Sorcerer level, so the bonus equals the Sorcerer level (PHB 2024 p. 148) */
/* M17: read from data. SPECIES.hpPerLevel (+hpName), CLASSES.*.hpSub[sub] {v per class level, from level l}, FEATS.hp (per level) and hpFlat */
function hpBonusList(){var o=[],L=TL(),spx=SPECIES[B.species];if(spx&&spx.hpPerLevel)o.push({s:(spx.hpName||B.species)+" ("+(spx.hb||SRC)+")",v:spx.hpPerLevel*L});
 [[B.cls,B.sub,B.level,0]].concat(MCL().map(function(m){return [m.cls,m.sub,m.lv,1]})).forEach(function(q){var h=(CLASSES[q[0]].hpSub||{})[q[1]];if(h&&q[2]>=h.l)o.push({s:h.n+" ("+SRC+(q[3]?", "+q[0]+" "+q[2]+", multiclass":"")+")",v:h.v*q[2]})});
 allFeats().forEach(function(f){var F=FEATS[f.n];if(F&&F.hp)o.push({s:f.n+" feat ("+f.s+")",v:F.hp*L});if(F&&F.hpFlat)o.push({s:f.n,v:F.hpFlat})});return o}
function toSheetHpBonus(){return hpBonusList().reduce(function(t,x){return t+x.v},0)}
function casterLv(cls,sub,lv){var c=CLASSES[cls];if(c.caster==="full")return lv;if(c.caster==="half")return R14()&&!c.a14?Math.floor(lv/2):Math.ceil(lv/2);/* v92: 2014 Paladin and Ranger count half their levels rounded down */if(isThird3(sub))return Math.floor(lv/3);return 0}
function slotsAll(){var parts=[{cls:B.cls,sub:B.sub,lv:B.level}].concat(MCL().map(function(m){return {cls:m.cls,sub:m.sub,lv:m.lv}}));
 var pact=null,cast=parts.filter(function(p){return p.cls!=="Warlock"&&casterLv(p.cls,p.sub,p.lv)>0});
 parts.forEach(function(p){if(p.cls==="Warlock"){var q=PACT[p.lv-1];pact={n:q[0],lvl:q[1]}}});
 var slots=null;
 if(cast.length===1){var p=cast[0],c=CLASSES[p.cls];slots=c.caster==="full"?SLOTS_FULL[p.lv-1]:c.caster==="half"?SLOTS_FULL[Math.ceil(p.lv/2)-1]:p.lv>=3?SLOTS_FULL[Math.ceil(p.lv/3)-1]:null}
 else if(cast.length>1){var s=cast.reduce(function(t,p){return t+casterLv(p.cls,p.sub,p.lv)},0);slots=s>0?SLOTS_FULL[Math.min(20,s)-1]:null}
 return {slots:slots,pact:pact}}
function mcResMax(r,a,L){if(Array.isArray(r.max))return r.max[L-1];if(r.max&&r.max.f)return luMax(r.max,L,a,pbOf(TL()));if(r.max==="lvl")return L<2&&r.min2?0:L;if(r.max==="lvl5")return L*5;/* m6 */if(typeof r.max==="string"&&r.max.indexOf("mod:")===0)return Math.max(1,mod(a.sc[r.max.slice(4)]));return r.max}
/* shop: gp prices */
function gpBase(){var bg=bgX(),t=clsKitText();return (B.eqC==="none"||un("eqC")||un("cls")?0:/^\d+ GP$/.test(t)?parseInt(t):kitGP(t))+(bg&&B.eqB!=="none"&&!un("eqB")?(B.eqB==="A"?bg.gp:50):0)}/* V14-5: nothing before it is chosen */
function spent(){return (B.buy||[]).reduce(function(t,x){return t+(x.p||0)*(x.q||1)},0)}

function eqIdx(){var o=CLASSES[B.cls].eq,i="ABC".indexOf(B.eqC||"A");return i>=0&&i<o.length?i:0}
function clsKitText(){var c=CLASSES[B.cls];return R14()&&c.eqg&&eqIdx()===0?eq14Text():c.eq[eqIdx()]}
/* v93: the 2014 class kit is a set of "(a) or (b)" lines. B.eqG holds the letter of each line (first by default), B.eqP the weapon or instrument picked for "any martial weapon" and the like */
function eq14Pick(it,gi,ii,j){var lst=EQ14D.l[it[0].slice(1)],v=(B.eqP||{})[gi+"_"+ii+"_"+j];return lst.indexOf(v)>=0?v:lst[0]}
function eq14Key(grp,gi){var k=(B.eqG||[])[gi];return grp._?"_":(k&&grp[k]?k:"a")}
function eq14Text(){var c=CLASSES[B.cls],g=c&&c.eqg;if(!g)return c.eq[0];var agg=[];
 g.g.forEach(function(grp,gi){grp[eq14Key(grp,gi)].forEach(function(it,ii){for(var j=0;j<(it[0].charAt(0)==="@"?it[1]:1);j++){var n=it[0].charAt(0)==="@"?eq14Pick(it,gi,ii,j):it[0],q=it[0].charAt(0)==="@"?1:it[1],f=agg.filter(function(a){return a[0]===n})[0];if(f)f[1]+=q;else agg.push([n,q])}})});
 return agg.map(function(a){return a[1]>1?a[1]+" "+a[0]:a[0]}).join(", ")}
var EQ14W={wm:"martial weapon",ws:"simple weapon",wmm:"martial melee weapon",wsm:"simple melee weapon",im:"musical instrument"};
function eq14Lbl(items){return items.map(function(it){var n=it[0];if(n.charAt(0)==="@"){var w=EQ14W[n.slice(1)];return it[1]>1?"two "+w+"s":"any "+w}return it[1]>1?it[1]+" "+n+"s":n}).join(", ")}
function clsKitText0(){var i=B.eqC;B.eqC="A";var t=clsKitText();B.eqC=i;return t}
function eq14UI(){var c=B.cls&&CLASSES[B.cls],g=c&&c.eqg;if(!R14()||!g||un("cls")||B.eqC==="none"||B.eqC==="B")return "";
 var h='<h3 class="eqh">Your Kit, Line by Line</h3><div class="eqbox eqg14">';
 g.g.forEach(function(grp,gi){var cur=eq14Key(grp,gi),ks=["a","b","c"].filter(function(k){return grp[k]});
  if(grp._)h+='<p class="fd">'+esc(eq14Lbl(grp._))+'</p>';
  else h+='<div class="eqln">'+ks.map(function(k,i){return (i?'<p class="or">OR</p>':'')+'<button type="button" class="eqo'+(cur===k?" on":"")+'" data-eqg="'+gi+'" data-v="'+k+'"><span class="bcb"></span>('+k+') '+esc(eq14Lbl(grp[k])+(grp[k+"n"]?" ("+grp[k+"n"]+")":""))+'</button>'}).join("")+'</div>';
  grp[cur].forEach(function(it,ii){if(it[0].charAt(0)!=="@")return;for(var j=0;j<it[1];j++){var lst=EQ14D.l[it[0].slice(1)],v=eq14Pick(it,gi,ii,j);h+='<label class="eqp"><span>'+esc(EQ14W[it[0].slice(1)].replace(/^./,function(x){return x.toUpperCase()}))+(it[1]>1?" "+(j+1):"")+'</span><select class="dd" data-eqp="'+gi+"_"+ii+"_"+j+'" aria-label="'+esc(EQ14W[it[0].slice(1)])+'">'+lst.map(function(n){return '<option'+(n===v?" selected":"")+'>'+esc(n)+'</option>'}).join("")+'</select></label>'}})});
 return h+'</div>'}

var SING={"Daggers":"Dagger","Javelins":"Javelin","Handaxes":"Handaxe","Arrows":"Arrows","Bolts":"Bolts","Pouches":"Pouch","Costumes":"Costume","Flasks":"Flask","Torches":"Torch","Ink Pens":"Ink Pen","Vials":"Vial","Candles":"Candle","Glass Bottles":"Glass Bottle"};
function parseKit(t,src){var out=[];if(!t||/^\d+ GP$/.test(t))return out;t.split(/,\s*/).forEach(function(p){p=p.trim();if(!p||/^\d+ GP$/.test(p))return;
 var m=/^(\d+)\s+(.+)$/.exec(p),q=1,n=p;if(m&&!/^\d+ Arrows|^\d+ Bolts/.test(p)){q=+m[1];n=m[2]}
 if(/^20 Arrows$/.test(p)){n="Arrows (20)";q=1}if(/^20 Bolts$/.test(p)){n="Bolts (20)";q=1}
 n=SING[n]||n;out.push({n:n,q:q,src:src})});return out}
function kitItems(){var bg=BACKGROUNDS[B.bg],k=B.eqC==="none"||un("eqC")||un("cls")?[]:parseKit(clsKitText(),B.cls+" kit");/* RU30: no kit before it is chosen */if(bg&&B.eqB==="A"&&!un("eqB")&&!un("bg"))k=k.concat(parseKit(bg.eq,B.bg+" kit"));return k}
