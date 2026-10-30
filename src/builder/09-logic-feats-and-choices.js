/* 2014: the ability scores come from the race. sp.asi is fixed ({STR:2}), sp.asiPick {n,v,ex} lets the player choose n scores (choice key rasi) */
function raceBonus(){var o={};if(!R14())return o;var sp=spX();if(!sp)return o;function ad(k,v){if(k&&ABK.indexOf(k)>=0)o[k]=(o[k]||0)+v}if(sp.asi)Object.keys(sp.asi).forEach(function(k){ad(k,sp.asi[k])});var ch=B.ch||{};if(sp.asiPick)(ch.rasi||[]).slice(0,sp.asiPick.n).forEach(function(k){if((sp.asiPick.ex||[]).indexOf(k)<0)ad(k,sp.asiPick.v||1)});if(sp.asiFlex){if(ch.rasim==="+1, +1, +1")(ch.rasi||[]).slice(0,3).forEach(function(k){ad(k,1)});else{var t2=(ch.rasi||[])[0];ad(t2,2);(ch.rasi1||[]).slice(0,1).forEach(function(k){if(k!==t2)ad(k,1)})}}return o}
function asiLevels(){var c=CL(),a=R14()?[4,8,12,16,19].concat(c.asiX||[]):[4,8,12,16].concat(c.asiX||[]);/* 2014: level 19 is a normal improvement, no Epic Boon */return a.filter(function(x,i){return a.indexOf(x)===i}).sort(function(x,y){return x-y})}
function featChosen(exceptKey){var out=[];Object.keys(B.ch).forEach(function(k){if(k===exceptKey)return;var v=B.ch[k];if(v&&typeof v==="object"&&v.feat)out.push(v.feat);if(k==="spfeat"&&v)out.push(v)});var bg=bgX();if(bg&&!R14())out.push(bgFeatN(bg));return out}
function allFeats(){var f=[];var bg=bgX();if(bg&&!R14())f.push({n:bgFeatN(bg),s:"Origin feat ("+B.bg+")"});if(!R14()&&B.ch.spfeat&&spHasFeat())f.push({n:B.ch.spfeat,s:"Origin feat ("+B.species+", Versatile)"});
choices(true).forEach(function(c){var v=B.ch[c.key];if(c.t==="feat"&&v&&v.feat)f.push({n:v.feat,s:c.src,asi:v,key:c.key});if(c.t==="fs"&&v)f.push({n:v,s:c.src});if(c.t==="ofeat"&&c.inv&&v)f.push({n:v,s:"Origin feat (Lessons of the First Ones)",key:c.key})});
 f.slice().forEach(function(x){var F=FEATS[x.n];if(F&&F.fi){var v=B.ch[F.fi+"-"+(x.key||x.s)];if(Array.isArray(v)&&v[0]&&FEATS[v[0]])f.push({n:v[0],s:x.n})}});/* v69: Fighting Initiate (2014) */
 return f}
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
  Object.keys(o.w).forEach(function(n){var r=o.w[n];if(B.src[id]){if(!WEAPONS[n]){WEAPONS[n]=Object.assign({},r.o);PRICE[n]=r.c;if(r.t)ITEMDESC[n]=r.t}}else if(WEAPONS[n]&&(WEAPONS[n].nm||WEAPONS[n].tp===id)){delete WEAPONS[n];delete PRICE[n];delete ITEMDESC[n]}});
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
function wxGate(){var W=window.WX;if(!W)return;wxXsp(W);wxItems();wxSpecies();wxBackgrounds();wxGear();wxWeapons();wxOpts();wxClasses();var js="";try{var c=Object.assign({},B);delete c.src;delete c.packs;js=JSON.stringify(c)}catch(e){}
 W.src.forEach(function(s){var q=function(n){return js.indexOf('"'+n+'"')>=0};if(s.feats.some(q)||s.spells.some(q)||(s.subs||[]).some(function(n){return B.sub===n||(B.mc||[]).some(function(m){return m.sub===n})}))B.src[s.id]=true;/* P4: a subclass name such as Medium also appears as a size, so only the chosen subclasses count */
  if(!B.src[s.id]){s.feats.forEach(function(n){delete FEATS[n]});wxRows(s,false)}else wxRows(s,true)});(window.WXE||[]).forEach(function(e){var c=CLASSES[e.cls];if(!c)return;c.pickSub=c.pickSub||{};if(!e.base)e.base=(c.pickSub[e.sub]||[]).slice();c.pickSub[e.sub]=B.src[e.src]?e.base.concat(e.pick):e.base.slice()});/* P5: a book adds upgrade picks to a subclass of the app (EXT) while it is on */
 (window.WXS||[]).forEach(function(x){[x.cls].concat(x.alt||[]).forEach(function(cn){var c=CLASSES[cn];if(!c)return;if(B.src[x.src]){c.subs=c.subs||{};if(!c.subs[x.name])c.subs[x.name]=x.arr;if(x.pick&&x.pick.length){c.pickSub=c.pickSub||{};c.pickSub[x.name]=x.pick}}else if(c.subs)delete c.subs[x.name]})})}
/* P4: classes of third party books (window.WXC) are in CLASSES only while the book is on or the build uses the class. Sorted like the other classes */
function wxClasses(){var W=window.WXC;if(!W)return;var used={};used[B.cls]=1;(B.mc||[]).forEach(function(m){used[m.cls]=1});
 Object.keys(W).forEach(function(n){var e=W[n],on=!!(B.src&&B.src[e.book])||!!used[n]||(window.WXS||[]).some(function(x){return B.src&&B.src[x.src]&&([x.cls].concat(x.alt||[]).indexOf(n)>=0)});/* P5: a book that adds subclasses to a class of another third party book brings that class along */if(used[n]&&B.src)B.src[e.book]=true;
  if(on&&!CLASSES[n]){var o=JSON.parse(JSON.stringify(e.rec));cls14Inject(n,o)}else if(!on&&CLASSES[n]&&CLASSES[n].tp===e.book)delete CLASSES[n]})}
/* extra spell lists from chosen Dragonmark feats (Spells of the Mark). Reads B only, so it is safe inside casterParts */
function dmXl(){var o=[],L=window.DM_LIST;if(!L)return o;Object.keys(B.ch||{}).forEach(function(k){var v=B.ch[k],n=v&&typeof v==="object"&&!Array.isArray(v)?v.feat:(k==="spfeat"?v:null);if(n&&L[n]&&o.indexOf(n)<0)o.push(n)});return o}
function featSpells(){var out=[];allFeats().forEach(function(f){var q=FT_SP[f.n];if(!q||!f.key)return;out.push({n:q[0],f:f.n,k:"@ft:"+f.key});var v=B.ch["ft:"+f.key];if(Array.isArray(v)&&v[0])out.push({n:v[0],f:f.n,k:"@ft:"+f.key})});return out}
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
