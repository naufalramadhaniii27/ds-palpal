/* v19 RL46: feat rules (PHB 2024, Feats chapter). choiceLvl(): level of each choice key. scoreAt(lvl,key): scores before the feat at that level is taken
   (base, background, increases from feats of lower levels, each score at most 20). asiOf(f,F): the increases a chosen feat really gives (only abilities on
   the feat's list, so old data or a typo cannot raise another score). featViol(): every rule the chosen feats break [{k (choice key or source), m}] */
/* v19 RL42: spell attack and save DC bonuses of active items. cls: only that class's spells (Rod of the Pact Keeper: Warlock) */
function spItemB(k,cls){return activeFx().reduce(function(t,q){var f=q.fx,v=k==="atk"?f.spellAtk:f.spellDc;if(!v||(f.spellCls&&f.spellCls!==cls))return t;return t+v},0)}
function spItemSrc(cls){return activeFx().filter(function(q){return (q.fx.spellAtk||q.fx.spellDc)&&(!q.fx.spellCls||q.fx.spellCls===cls)}).map(function(q){return q.n})}
/* v19 RL41: chosen Elemental Affinity type ("" without Draconic Sorcery 6) */
function chOf(cls,key){if(B.cls===cls)return B.ch[key];var i=-1;MCL().forEach(function(m,j){if(m.cls===cls)i=j});return i<0?undefined:B.ch["m"+i+":"+key]}
function eaType(){return subAt("Sorcerer","Draconic Sorcery")>=6?(chOf("Sorcerer","p6opt")||""):""}
/* v20 RD24: spell choices of a pack's class feature. List: level lv (or 1 to the class's highest slot level), class list, components */
function hbSpellPicks(){var out=[];enabledPacks().forEach(function(p){Object.keys(p.spellPick||{}).forEach(function(c){var q=p.spellPick[c],lv=clsLv(c);if(lv<q.l)return;
  var sa=q.slots?slotsAll():null,mx=q.slots?Math.max(sa.slots?sa.slots.length:0,sa.pact?sa.pact.lvl:0):q.lv;
  var prep=q.prep?((casterParts().length>1&&typeof spLists==="function")?(spLists()[c]||[]):(B.sp||[])):null;/* v20 I1 */
  var comp=q.comp.split(","),list=SPELLS.filter(function(x){return x[1]>=1&&(!prep||prep.indexOf(x[0])>=0)&&(q.slots?x[1]<=mx:x[1]===q.lv)&&(!q.list||x[3].indexOf(q.list)>=0)&&comp.every(function(k){return new RegExp("(^|, )"+k+"(,|$| )").test(x[6])})}).map(function(x){return [x[0],x[11]]});
  out.push({key:q.key,mc:c===B.cls?undefined:MCL().map(function(m){return m.cls}).indexOf(c),lvl:q.l,t:"multi",n:1,list:list,title:q.title+(list.length?"":q.prep?" (prepare a fitting spell first)":" (no spell fits yet)"),src:p.name+", "+c+" "+q.l,feature:q.feature})})});return out}/* v20 N2 */
/* v20 N1: a saved pick still fits the current list */
function hbPickOk(key,n){return hbSpellPicks().some(function(o){return o.key===key&&o.list.some(function(x){return x[0]===n})})}
/* v21 i3: Fey Touched and Shadow Touched (PHB 2024): a fixed spell plus one level 1 spell of two schools */
var FT_SP={"Fey Touched":["Misty Step",["Divination","Enchantment"]],"Shadow Touched":["Invisibility",["Illusion","Necromancy"]]};
function featSpellPicks(){var out=[];allFeats().forEach(function(f){var q=FT_SP[f.n];if(!q||!f.key)return;var lv=+((/feat(\d+)$/.exec(f.key)||[0,1])[1]);
  out.push({key:"ft:"+f.key,lvl:lv,t:"multi",n:1,list:SPELLS.filter(function(x){return x[1]===1&&q[1].indexOf(x[2])>=0}).map(function(x){return [x[0],x[11]]}),title:f.n+": level 1 "+q[1].join(" or ")+" spell",src:f.s,feature:f.n})});return out.concat(wxPicks())}/* v62 */
function spClsJ(x){ return x[3].filter(function(c){ return !/^(Mark of |Aberrant Dragonmark)/.test(c); }).join(", "); }
/* v58: Dragonmark feats (EFotA): free spells of the mark, known cantrip, Aberrant Dragonmark picks. Ability: the one chosen with the feat (Aberrant: Constitution) */
function dmSpells(){var out=[],D0=window.DM_SP;if(!D0)return out;var lvl=TL();allFeats().forEach(function(f){var d=D0[f.n];if(!d)return;var fk=f.key||f.s;
 if(d.siberys){var bs=B.ch["bsp-"+fk];if(Array.isArray(bs)&&bs[0])out.push({n:bs[0],use:"1/Short or Long Rest free",f:f.n,k:"@dm:"+fk});return}/* v60 */
 if(d.aberrant){var c=B.ch["abc-"+fk],l=B.ch["abl-"+fk];if(Array.isArray(c)&&c[0])out.push({n:c[0],use:"Cantrip",f:f.n,k:"@dmcon"});if(Array.isArray(l)&&l[0])out.push({n:l[0],use:"1/Long Rest free",f:f.n,k:"@dmcon"});return}
 var k="@dm:"+fk;(d.free||[]).forEach(function(r){if(lvl>=r[0])out.push({n:r[1],use:"1/Long Rest free",f:f.n,k:k})});(d.can||[]).forEach(function(n){out.push({n:n,use:"Cantrip",f:f.n,k:k})});(d.will||[]).forEach(function(n){out.push({n:n,use:"At will",f:f.n,k:k})});(d.ritual||[]).forEach(function(n){out.push({n:n,use:"Ritual only",f:f.n,k:k})});wxDm(out,f,d,fk)});/* v69 */return sbFree(out)}
/* v62: WotC sources (Heroes of Faerun, Astarion, Ravenloft, Lorwyn, Arcana Unleashed, D&D Beyond drops). Data is in the wotc1 block (window.WX) */
function wxCls(){return [B.cls].concat((B.mc||[]).map(function(m){return m.cls}))}
function wxMaxSlot(){var s=slotsAll(),m=s.slots?s.slots.length:0;if(s.pact&&s.pact.lvl>m)m=s.pact.lvl;return m}
function wxFeat(fk){return allFeats().filter(function(f){return (f.key||f.s)===fk})[0]}
function wxAb(fk){var f=wxFeat(fk),d=f&&window.DM_SP&&DM_SP[f.n];if(!d)return "";
 if(d.ab==="mi"){var m=miFeats()[0],v=m&&(B.pk||{})[m.key];return (v&&v.ab)||"INT"}
 if(d.ab==="asi")return (f.asi&&f.asi.a1)||"INT";
 if(/^(STR|DEX|CON|INT|WIS|CHA)$/.test(d.ab||""))return d.ab;/* v69 */
 if(d.ab==="cp"){var cv=(B.ch["cp-"+fk]||[])[0];return {Bard:"CHA",Cleric:"WIS",Druid:"WIS",Sorcerer:"CHA",Warlock:"CHA",Wizard:"INT"}[cv]||"INT"}
 if(d.abFrom){var g=allFeats().filter(function(x){return x.n===d.abFrom})[0],av=g&&B.ch["dab-"+(g.key||g.s)];return (Array.isArray(av)&&av[0])||"INT"}
 return ""}
function wxList(p,fn){var cls=p.cls||(p.dyn?wxCls():null);if(fn==="Magic Connoisseur"){var mi=miFeats().map(function(m){return m.cls});if(mi.length)cls=mi}
 return SPELLS.filter(function(x){var l=p.lv;if(l==="7"){if(x[1]<1||x[1]>7)return false}else if(x[1]!==l)return false;
  if(p.nm&&p.nm.indexOf(x[0])<0)return false;if(p.rit&&!x[9])return false;if(p.atk&&!/spell attack/i.test((typeof SPELL_FULL!=="undefined"&&SPELL_FULL[x[0]])||""))return false;/* v69 */
  if(cls&&!cls.some(function(c){return x[3].indexOf(c)>=0}))return false;if(p.sch&&p.sch.indexOf(x[2])<0)return false;if(p.time&&x[4]!==p.time)return false;return true}).map(function(x){return [x[0],x[11]]})}
function wxPicks(){var out=[],D0=window.DM_SP;if(!D0||!window.WX)return out;
 allFeats().forEach(function(f){var d=D0[f.n];if(!d||!(d.pk||d.dyn))return;var fk=f.key||f.s,lv=+((/feat(\d+)$/.exec(fk)||[0,1])[1]),pl=(d.pk||[]).slice();
  if(d.dyn){var sc=B.ch["sch-"+fk];if(Array.isArray(sc)&&sc[0])pl=pl.concat(d.dyn.map(function(p){return Object.assign({},p,{sch:[sc[0]],dyn:1})}))}
  pl.forEach(function(p){var q=p,bv="";if(p.by){bv=(B.ch[p.by+"-"+fk]||[])[0]||"";q=Object.assign({},p);if(p.names)q.nm=p.names[bv]||["__none"];else if(p.clsBy)q.cls=p.clsBy[bv]||["__none"];else q.cls=bv?[bv]:["__none"]}/* v69 */
   out.push({key:"pk"+p.k+"-"+fk,fk:fk,lvl:lv,t:"multi",n:1,list:wxList(q,f.n),title:f.n+": "+p.title+(p.by&&!bv?" (make the choice above first)":""),src:f.s,feature:f.n})})});return out}
function wxDm(out,f,d,fk){var k="@dm:"+fk,pick=function(p){var v=B.ch["pk"+p.k+"-"+fk];if(Array.isArray(v)&&v[0])out.push({n:v[0],use:p.use,f:f.n,k:k})};
 (d.prep||[]).forEach(function(r){out.push({n:r[1],use:"Always prepared",f:f.n,k:k})});
 if(d.prepS){var mx=wxMaxSlot();d.prepS.forEach(function(r){if(mx>=r[0])out.push({n:r[1],use:"Always prepared",f:f.n,k:k})})}
 (d.pk||[]).forEach(pick);
 if(d.dyn&&(B.ch["sch-"+fk]||[])[0])d.dyn.forEach(pick);
 if(d.runes){var rv=B.ch["rn-"+fk];if(Array.isArray(rv))rv.forEach(function(r){var sn=d.runes[r];if(sn)out.push({n:sn,use:"Rune: 1/Long Rest free",f:f.n,k:k})})}/* v69 */}
var XFX={
 skills:function(feats,p,prof,exp){feats.forEach(function(f){var F=FEATS[f.n],x=F&&F.fx;if(!x)return;(x.skills||[]).forEach(function(n){p(n,f.n+" ("+f.s+")")});(x.exp||[]).forEach(function(n){if(prof[n])exp[n]=f.n+" ("+f.s+")"})})},
 lang:function(lg){allFeats().forEach(function(f){var F=FEATS[f.n];if(!F)return;((F.fx||{}).langs||[]).forEach(function(n){if(lg.indexOf(n)<0)lg.push(n)});
  (F.pick||[]).forEach(function(q){if(q.t!=="lang")return;var v=B.ch[q.k+"-"+(f.key||f.s)];if(Array.isArray(v))v.forEach(function(n){if(lg.indexOf(n)<0)lg.push(n)})})})},
 senses:function(C){allFeats().forEach(function(f){var F=FEATS[f.n],x=F&&F.fx;if(!x||!x.senses)return;x.senses.forEach(function(r){
  if(r[0]==="Darkvision"){if(C.darkvision>0&&r[3])C.darkvision+=r[3];else C.darkvision=Math.max(C.darkvision||0,r[1]);C.darkSrc=(C.darkSrc?C.darkSrc+", ":"")+f.n;return}
  C.senses=(C.senses||[]).filter(function(y){return y.n!==r[0]||y.v>r[1]});if(!C.senses.some(function(y){return y.n===r[0]}))C.senses.push({n:r[0],v:r[1],s:f.n+" ("+f.s+")",d:r[2]||""})})})},
 def:function(add){allFeats().forEach(function(f){var F=FEATS[f.n];if(!F)return;var x=F.fx||{};
  (x.res||[]).forEach(function(t){add("Resistance",t,f.n)});(x.imm||[]).forEach(function(t){add("Immunity",t,f.n)});(x.cimm||[]).forEach(function(t){add("Immunity",t,f.n)});
  (x.notes||[]).forEach(function(r){add(r[0],r[1],f.n)});
  if(F.resK){var v=B.ch[F.resK+"-"+(f.key||f.s)];if(Array.isArray(v)&&v[0])add("Resistance",v[0],f.n)}
  if(F.resBy){var rv=B.ch[F.resBy.k+"-"+(f.key||f.s)];if(Array.isArray(rv)&&rv[0]&&F.resBy.map[rv[0]])add("Resistance",F.resBy.map[rv[0]],f.n)}})}};/* v69 */
/* v63: WotC subclasses. window.WXS holds each subclass's extra rules (fx, cantrip picks, optfx, skb, sfree) */
function sbWx(sub,cls){return (window.WXS||[]).filter(function(s){return s.name===sub&&(!cls||s.cls===cls)})[0]}
function sbEach(cb){clsParts().forEach(function(q,i){if(!q.sub)return;var x=sbWx(q.sub,q.cls);if(x)cb(x,q,q.mc?"m"+(i-1)+":":"")})}
function sbFx(cb){sbEach(function(x,q){x.fx.forEach(function(r){if(q.lv>=r[0])cb(r[2],r[1],q.sub)})})}
function sbAuto(add){sbEach(function(x,q,pre){
 (x.cantrips||[]).forEach(function(c){if(q.lv>=c[2])(B.ch[pre+c[0]]||[]).forEach(function(n){add([[1,n]],c[1],q.lv,CLASSES[q.cls].caster?q.cls:"@sub:"+(x.spab||""))})});
 if(x.optfx&&q.lv>=3){var v=B.ch[pre+x.optfx.key],o=v&&x.optfx.map[v];if(o){(o.can||[]).forEach(function(n){add([[1,n]],x.optlist+" ("+v+")",q.lv,"@sub:"+(x.optfx.ab||""))});if(o.spells)add(o.spells,x.optlist+" ("+v+")",q.lv,q.cls)}}})}
function sbFree(out){sbEach(function(x,q){(x.sfree||[]).forEach(function(r){if(q.lv>=r[0])out.push({n:r[1],use:r[3]||"1/Short or Long Rest free",f:x.name,k:"@sub:"+r[2]})})});return out}
(function(){var s0=XFX.skills,l0=XFX.lang,n0=XFX.senses,d0=XFX.def;
 XFX.skills=function(feats,p,prof,exp){s0(feats,p,prof,exp);sbFx(function(x,n,sub){(x.skills||[]).forEach(function(k){p(k,n+" ("+sub+")")});(x.exp||[]).forEach(function(k){if(prof[k])exp[k]=n+" ("+sub+")"})})};
 XFX.lang=function(lg){l0(lg);var bq=bgX();if(bq&&bq.langs)bq.langs.forEach(function(n){if(lg.indexOf(n)<0)lg.push(n)});sbFx(function(x){(x.langs||[]).forEach(function(n){if(lg.indexOf(n)<0)lg.push(n)})})};
 XFX.senses=function(C){n0(C);sbFx(function(x,n,sub){(x.senses||[]).forEach(function(r){
  if(r[0]==="Darkvision"){if(C.darkvision>0&&r[3])C.darkvision+=r[3];else C.darkvision=Math.max(C.darkvision||0,r[1]);C.darkSrc=(C.darkSrc?C.darkSrc+", ":"")+n;return}
  C.senses=(C.senses||[]).filter(function(y){return y.n!==r[0]||y.v>r[1]});if(!C.senses.some(function(y){return y.n===r[0]}))C.senses.push({n:r[0],v:r[1],s:n+" ("+sub+")",d:r[2]||""})})})};
 XFX.def=function(add){d0(add);sbFx(function(x,n){(x.res||[]).forEach(function(t){add("Resistance",t,n)});(x.imm||[]).forEach(function(t){add("Immunity",t,n)});(x.notes||[]).forEach(function(r){add(r[0],r[1],n)})});
  sbEach(function(x,q,pre){var o=x.optfx&&q.lv>=(x.optfx.rlv||3)&&x.optfx.map[B.ch[pre+x.optfx.key]];if(o&&o.res)o.res.forEach(function(t){add("Resistance",t,x.optlist+" ("+B.ch[pre+x.optfx.key]+")")})})};
 XFX.post=function(C,a){sbEach(function(x,q,pre){var b=x.skb;if(!b||q.lv<b.lvl)return;var v=B.ch[pre+b.key];if(!Array.isArray(v)||!v[0])return;var m=Math.max(b.min1||0,mod(a.sc[b.ab]));
  C.skills.forEach(function(s){if(s.n===v[0]&&m){s.misc=(s.misc||0)+m;s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+b.feature+" ("+q.sub+")"}})})}})();

/*SP14FN*/
/* v92: the 2014 version of every spell the app has (rows, full text, damage and area numbers, book page) laid over the base rows. SP14 holds the data. 2024-only spells leave the list. sp14Set(false) puts everything back */
var SP14S=null;
function sp14Cmp(a,b){return a[1]-b[1]||(a[0]<b[0]?-1:a[0]>b[0]?1:0)}
function sp14Set(on,tce){if(typeof SP14==="undefined"||typeof SMAP==="undefined")return;
 if(SP14S){SP14S.rows.forEach(function(o){for(var i=0;i<12;i++)o.x[i]=o.o[i]});
  Object.keys(SP14S.full).forEach(function(n){if(SP14S.full[n]===undefined)delete SPELL_FULL[n];else SPELL_FULL[n]=SP14S.full[n]});
  Object.keys(SP14S.fx).forEach(function(n){if(SP14S.fx[n]===undefined)delete SPELL_FX[n];else SPELL_FX[n]=SP14S.fx[n]});
  if(typeof BOOKPG!=="undefined"&&BOOKPG.phb&&BOOKPG.phb.spell)Object.keys(SP14S.pg).forEach(function(n){if(SP14S.pg[n]===undefined)delete BOOKPG.phb.spell[n];else BOOKPG.phb.spell[n]=SP14S.pg[n]});
  SP14S.hid.forEach(function(x){if(SPELLS.indexOf(x)<0){SPELLS.push(x);SMAP[x[0]]=x}});SP14S=null;SPELLS.sort(sp14Cmp)}
 if(!on)return;
 var S={rows:[],full:{},fx:{},pg:{},hid:[]},keepL=function(l){return /^(Mark of |Aberrant Dragonmark)/.test(l)};SP14S=S;
 var hasPg=typeof BOOKPG!=="undefined"&&BOOKPG.phb&&BOOKPG.phb.spell;
 Object.keys(SP14.ov).forEach(function(n){var x=SMAP[n];if(!x)return;var r=SP14.ov[n];S.rows.push({x:x,o:x.slice(0,12)});
  for(var i=1;i<12;i++)x[i]=r[i];
  var cl=r[3].slice();(SP14.cx[n]||[]).forEach(function(q){if(tce&&B.src&&B.src[q[1]]&&cl.indexOf(q[0])<0)cl.push(q[0])});cl.sort();(S.rows[S.rows.length-1].o[3]||[]).forEach(function(l){if(keepL(l)&&cl.indexOf(l)<0)cl.push(l)});x[3]=cl;
  S.full[n]=SPELL_FULL[n];SPELL_FULL[n]=SP14.full[n];
  S.fx[n]=SPELL_FX[n];var f=SP14.fx[n];if(f&&Object.keys(f).length)SPELL_FX[n]=f;else delete SPELL_FX[n];
  if(hasPg){S.pg[n]=BOOKPG.phb.spell[n];if(SP14.pg[n])BOOKPG.phb.spell[n]=SP14.pg[n];else delete BOOKPG.phb.spell[n]}});
 SP14.hide.forEach(function(n){var x=SMAP[n],i=x?SPELLS.indexOf(x):-1;if(i>=0){SPELLS.splice(i,1);delete SMAP[n];S.hid.push(x)}});
 SPELLS.sort(sp14Cmp)}
/* v93: 2014 equipment. eq14Set lays the 2014 weapons (no Weapon Mastery, Lance, Trident, Warhammer, War Pick, Net), equipment packs and armor words over the base tables. dm14Set swaps the 2024 Dungeon Master's Guide items for the 2014 ones (DM14.ov), and leaves out the 2024-only ones (DM14.hide) unless the character owns them. Both put everything back when off */
function eqGear(n){return GEAR.filter(function(g){return g[0]===n})[0]||null}
var EQ14S=null,EQ14SH=null,DM14ON=false,DM14S=null,DM14M=null;
function eq14Set(on,force){if(typeof EQ14D==="undefined"||typeof WEAPONS==="undefined"||typeof PACKS==="undefined"||typeof GEAR==="undefined")return;
 var S=EQ14S;if(S&&!force&&on)return;
 if(S){Object.keys(S.w).forEach(function(k){var o=WEAPONS[k];if(S.w[k]===null){delete WEAPONS[k];return}if(o){Object.keys(o).forEach(function(q){delete o[q]});Object.assign(o,S.w[k])}});
  Object.keys(S.pr).forEach(function(k){if(S.pr[k]===undefined)delete PRICE[k];else PRICE[k]=S.pr[k]});
  Object.keys(S.pk).forEach(function(k){PACKS[k]=S.pk[k]});
  Object.keys(S.id).forEach(function(k){if(S.id[k]===undefined)delete ITEMDESC[k];else ITEMDESC[k]=S.id[k]});
  Object.keys(S.gc).forEach(function(k){var g=eqGear(k);if(g){g[1]=S.gc[k][0];g[2]=S.gc[k][1]}});
  S.ga.forEach(function(g){var i=GEAR.indexOf(g);if(i>=0)GEAR.splice(i,1)});
  var GL=window.__GLOSS||{};Object.keys(S.gl).forEach(function(k){if(S.gl[k]===null)delete GL[k];else if(GL[k]){GL[k].d=S.gl[k];if(S.gs&&S.gs[k]!=null)GL[k].s=S.gs[k]}});
  ARMOR_GEN=S.ag;EQ14SH=null;EQ14S=null}
 if(!on)return;
 var T={w:{},pr:{},pk:{},id:{},gc:{},ga:[],gl:{},gs:{},ag:ARMOR_GEN};EQ14S=T;
 var cp=function(o){return JSON.parse(JSON.stringify(o))};
 Object.keys(WEAPONS).forEach(function(k){var o=WEAPONS[k];if(o.m!==undefined||EQ14D.w[k]){T.w[k]=cp(o);delete o.m}});
 Object.keys(EQ14D.w).forEach(function(k){var o=WEAPONS[k];if(o)Object.assign(o,EQ14D.w[k])});
 if(!WEAPONS.Net){T.w.Net=null;WEAPONS.Net=Object.assign({},EQ14D.net);T.pr.Net=PRICE.Net;PRICE.Net=EQ14D.pr.Net}
 Object.keys(EQ14D.packs).forEach(function(n){var q=EQ14D.packs[n];T.pk[n]=PACKS[n];PACKS[n]=[q[0],q[1]];T.id[n]=ITEMDESC[n];
  ITEMDESC[n]="Comes as a "+q[0].toLowerCase()+" with: "+q[1].map(function(x){return (x[1]>1?x[1]+" × ":"")+x[0]}).join(", ")+". Added to your inventory, it opens into the "+q[0].toLowerCase()+" and its items, each with its own quantity and weight.";
  var g=eqGear(n);if(g){T.gc[n]=[g[1],g[2]];g[1]=q[2];g[2]=q[3]}});
 EQ14D.gear.forEach(function(r){if(!eqGear(r[0])){var g=r.slice();GEAR.push(g);T.ga.push(g)}});
 var GL=window.__GLOSS||{};Object.keys(EQ14D.gloss).forEach(function(k){if(GL[k]){T.gl[k]=GL[k].d;T.gs[k]=GL[k].s;GL[k].d=EQ14D.gloss[k];GL[k].s=String(GL[k].s||"").replace("PHB-2024","PHB-2014")}else if(GL.Heavy){T.gl[k]=null;GL[k]={c:"Weapon property",s:String(GL.Heavy.s||"").replace("PHB-2024","PHB-2014"),d:EQ14D.gloss[k]}}});
 ARMOR_GEN=EQ14D.armorGen;EQ14SH=EQ14D.shield}
function dm14Set(on,force){if(typeof DM14==="undefined"||typeof DMGI==="undefined"||typeof DMAP==="undefined")return;
 if(!force&&on===DM14ON)return;
 if(DM14ON&&DM14S){DMGI.length=0;DM14S.forEach(function(x){DMGI.push(x)});Object.keys(DMAP).forEach(function(k){delete DMAP[k]});DMGI.forEach(function(x){DMAP[x[0]]=x});dmapAlias();
  if(DM14M&&typeof MAGIC_SUM!=="undefined")Object.keys(DM14M).forEach(function(k){MAGIC_SUM[k]=DM14M[k]})}
 DM14ON=false;DM14S=null;DM14M=null;
 if(!on)return;
 var own={};((typeof B!=="undefined"&&B&&B.inv)||[]).concat((typeof C!=="undefined"&&C&&C.inv)||[]).forEach(function(x){if(x&&x.n)own[x.n]=1});
 DM14S=DMGI.slice();var out=[],seen={};
 DMGI.forEach(function(x){var n=x[0];if(DM14.hide[n]&&!own[n])return;var o=DM14.ov[n];seen[n]=1;out.push(o||x)});
 Object.keys(DM14.ov).forEach(function(n){if(!seen[n])out.push(DM14.ov[n])});
 DMGI.length=0;out.forEach(function(x){DMGI.push(x)});Object.keys(DMAP).forEach(function(k){delete DMAP[k]});DMGI.forEach(function(x){DMAP[x[0]]=x});dmapAlias();
 if(typeof MAGIC_SUM!=="undefined"){DM14M={};Object.keys(DM14.ov).forEach(function(n){if(MAGIC_SUM[n]!==undefined){DM14M[n]=MAGIC_SUM[n];delete MAGIC_SUM[n]}})}
 DM14ON=true}
window.__sp14Set=function(on){sp14Set(on,false);eq14Set(on);dm14Set(on);window.__gl14&&window.__gl14(on)};
function wxRows(s,on){s.rows.forEach(function(x){var w=on||!!(x[14]&&x[14].some(function(id){return B.src&&B.src[id]}));var i=SPELLS.indexOf(x);if(w&&i<0){var j=0;while(j<SPELLS.length&&!(SPELLS[j][1]>x[1]||(SPELLS[j][1]===x[1]&&SPELLS[j][0]>x[0])))j++;SPELLS.splice(j,0,x);SMAP[x[0]]=x}else if(!w&&i>=0){SPELLS.splice(i,1);delete SMAP[x[0]]}})}
/* v65: magic items of the WotC sources. An item is in the list while its source is on. A character that owns one keeps the source on */
function wxItems(){var R=window.WXI;if(!R||typeof DMGI==='undefined')return;var own=(B.inv||[]).map(function(x){return x.n});
 Object.keys(R).forEach(function(id){var rows=R[id];if(!B.src[id]&&rows.some(function(r){return own.some(function(n){return n===r[0]||n.indexOf(r[0]+" (")===0})}))B.src[id]=true;
  if((B.src[id]||id==="dmg14"&&R14())&&B.src.dmg!==false)rows.forEach(function(r){if(!DMAP[r[0]]){DMGI.push(r);DMAP[r[0]]=r}})/* v93: in a 2014 build the Dungeon Master's Guide row brings its variant items too */});(window.WXWP||[]).forEach(function(n){var r=DMAP[n],w=r&&r[5]&&r[5].wp;if(own.indexOf(n)>=0){if(w&&!WEAPONS[n])WEAPONS[n]=Object.assign({},w)}else if(WEAPONS[n]&&WEAPONS[n].xw)delete WEAPONS[n]});dmapAlias()}
/* v66: species of the WotC sources. SPECIES is rebuilt on every applyPacks, so they are added again here. A character that uses one keeps the source on */
function wxSpecies(){var R=window.WXSP;if(!R)return;Object.keys(R).forEach(function(id){if(R[id][B.species])B.src[id]=true;if(B.src[id])Object.keys(R[id]).forEach(function(k){SPECIES[k]=R[id][k]})})}
/* v67: backgrounds of the WotC sources. BACKGROUNDS is rebuilt on every applyPacks, so they are added again here. A character that uses one keeps its source on */
function wxBackgrounds(){var R=window.WXBG;if(!R)return;var add=0;Object.keys(R).forEach(function(id){if(R[id][B.bg])B.src[id]=true;if(B.src[id])Object.keys(R[id]).forEach(function(k){if(!BACKGROUNDS[k]){BACKGROUNDS[k]=R[id][k];add=1}})});if(add){var o={};Object.keys(BACKGROUNDS).sort().forEach(function(k){o[k]=BACKGROUNDS[k]});Object.keys(BACKGROUNDS).forEach(function(k){delete BACKGROUNDS[k]});Object.assign(BACKGROUNDS,o)}}
/* v67: the Origin feat of a background. A background with featOpts lets you pick it (B.ch.bgfeatc), else bg.feat */
function bgTl(bg,tp){var t=tp(bg.tool,bg.toolPick,"bgTool");return bg.toolFix?(t?t+", ":"")+bg.toolFix:t}/* v70: a 2014 background can add fixed tools to its pick */
function bgFeatN(bg){bg=bg||bgX();if(!bg)return "";var v=B.ch.bgfeatc;return bg.featOpts&&typeof v==="string"&&bg.featOpts.indexOf(v)>=0?v:bg.feat}
/* v68: gear of the WotC sources (FRHoF clothing, mounts, wagon). GEAR is not rebuilt by applyPacks, so each row is added while its source is on and taken out when it is off. A character that owns one keeps the source on */
/* v78: weapons and armor of the 2014 books that the 2024 list lacks (WXW). They join WEAPONS or ARMOR while the source is on or the character owns one. nm = no weapon mastery, so the mastery lists skip them */
function wxWeapons(){var R=window.WXW;if(!R)return;var own=(B.inv||[]).map(function(x){return x.n});Object.keys(R).forEach(function(id){var o=R[id],all=Object.keys(o.w).concat(Object.keys(o.a));if(!B.src[id]&&all.some(function(n){return own.indexOf(n)>=0}))B.src[id]=true;
  Object.keys(o.w).forEach(function(n){var r=o.w[n];if(B.src[id]){if(!WEAPONS[n]){WEAPONS[n]=Object.assign({},r.o);PRICE[n]=r.c;if(r.t)ITEMDESC[n]=r.t}}else if(WEAPONS[n]&&WEAPONS[n].nm){delete WEAPONS[n];delete PRICE[n];delete ITEMDESC[n]}});
  Object.keys(o.a).forEach(function(n){var r=o.a[n];if(B.src[id]){if(!ARMOR[n]){ARMOR[n]=Object.assign({sx:1},r.o);PRICE[n]=r.c;if(r.t)ITEMDESC[n]=r.t}}else if(ARMOR[n]&&ARMOR[n].sx){delete ARMOR[n];delete PRICE[n];delete ITEMDESC[n]}})})}
function wxGear(){var R=window.WXG;if(!R)return;var own=(B.inv||[]).map(function(x){return x.n}),chj=JSON.stringify(B.ch||{});Object.keys(R).forEach(function(id){var rows=R[id];if(!B.src[id]&&rows.some(function(r){return own.indexOf(r[0])>=0||(r[3]==="Musical Instrument"&&chj.indexOf('"'+r[0]+'"')>=0)}))B.src[id]=true;/* v81: an instrument that a tool pick holds keeps its source on */rows.forEach(function(r){var i=GEAR.findIndex(function(g){return g[0]===r[0]});if(B.src[id]){if(i<0)GEAR.push([r[0],r[1],r[2]]);MOUNTT[r[0]]=r[3];ITEMDESC[r[0]]=r[4]}else if(i>=0){GEAR.splice(i,1);delete MOUNTT[r[0]];delete ITEMDESC[r[0]]}if(r[3]==="Musical Instrument"){var k=TOOLS.music.indexOf(r[0]);/* v81: the instruments of an on source join the Musical Instruments list of tool picks */if(B.src[id]&&k<0){TOOLS.music.push(r[0]);TOOLS.music.sort()}else if(!B.src[id]&&k>=0)TOOLS.music.splice(k,1)}})})}
/* v81: the class options of the WotC sources (invocations, maneuvers, runes, arcane shots, elemental disciplines) are in their lists while the source is on. An option that a character holds keeps the source on */
function wxOpts(){var R=window.WXO;if(!R||typeof INVOCATIONS==="undefined")return;var chj=JSON.stringify(B.ch||{});
 var put=function(arr,r,on){var i=-1;arr.forEach(function(x,j){if(x[0]===r[0])i=j});if(on&&i<0){arr.push(r);arr.sort(function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0})}else if(!on&&i>=0)arr.splice(i,1)};
 var LN={rn:"Runes"};
 Object.keys(R).forEach(function(id){var g=R[id],all=[].concat(g.inv||[],g.man||[],g.rn||[]);
  if(!B.src[id]&&all.some(function(r){return chj.indexOf('"'+r[0]+'"')>=0}))B.src[id]=true;var on=!!B.src[id];
  if(!R14())(g.inv||[]).forEach(function(r){put(INVOCATIONS,r,on)});(g.man||[]).forEach(function(r){put(MANEUVERS,r,on)});
  Object.keys(LN).forEach(function(k){(g[k]||[]).forEach(function(r){OPTS[LN[k]]=OPTS[LN[k]]||[];put(OPTS[LN[k]],r,on)})})})}
/* v100: spells of Xanathar's and Tasha's that the same book data holds under a later source (2025 and 2026 reprints). They also join the list while the older book is on, so a 2014 build has them */
var XSP14={xge:["Catnap","Enervation","Illusory Dragon","Invulnerability","Negative Energy Flood","Power Word Pain"],tce:["Blade of Disaster"]},XSP14_DONE=0;
function wxXsp(W){if(XSP14_DONE)return;XSP14_DONE=1;var all={};W.src.forEach(function(s){(s.rows||[]).forEach(function(r){if(!all[r[0]])all[r[0]]=r})});Object.keys(XSP14).forEach(function(id){XSP14[id].forEach(function(n){var r=all[n];if(!r)return;r[14]=r[14]||[];if(r[14].indexOf(id)<0)r[14].push(id)})})}
function wxGate(){var W=window.WX;if(!W)return;wxXsp(W);wxItems();wxSpecies();wxBackgrounds();wxGear();wxWeapons();wxOpts();var js="";try{var c=Object.assign({},B);delete c.src;delete c.packs;js=JSON.stringify(c)}catch(e){}
 W.src.forEach(function(s){var q=function(n){return js.indexOf('"'+n+'"')>=0};if(s.feats.some(q)||s.spells.some(q)||(s.subs||[]).some(q))B.src[s.id]=true;
  if(!B.src[s.id]){s.feats.forEach(function(n){delete FEATS[n]});wxRows(s,false)}else wxRows(s,true)});(window.WXS||[]).forEach(function(x){var c=CLASSES[x.cls];if(!c)return;if(B.src[x.src]){c.subs=c.subs||{};if(!c.subs[x.name])c.subs[x.name]=x.arr}else if(c.subs)delete c.subs[x.name]})}
/* extra spell lists from chosen Dragonmark feats (Spells of the Mark). Reads B only, so it is safe inside casterParts */
function dmXl(){var o=[],L=window.DM_LIST;if(!L)return o;Object.keys(B.ch||{}).forEach(function(k){var v=B.ch[k],n=v&&typeof v==="object"&&!Array.isArray(v)?v.feat:(k==="spfeat"?v:null);if(n&&L[n]&&o.indexOf(n)<0)o.push(n)});return o}
function featSpells(){var out=[];allFeats().forEach(function(f){var q=FT_SP[f.n];if(!q||!f.key)return;out.push({n:q[0],f:f.n,k:"@ft:"+f.key});var v=B.ch["ft:"+f.key];if(Array.isArray(v)&&v[0])out.push({n:v[0],f:f.n,k:"@ft:"+f.key})});return out}
