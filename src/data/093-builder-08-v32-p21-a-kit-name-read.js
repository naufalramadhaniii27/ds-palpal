/* v32 p21: a kit name read as a GEAR item and a count: "Parchment (10 sheets)" [Parchment, 10], "Book (prayers)" [Book, 1], "Hooded Lantern" [Lantern, Hooded, 1]. null: not gear */
var GEAR_AL={"Hooded Lantern":"Lantern, Hooded","Bullseye Lantern":"Lantern, Bullseye","Iron Pot":"Pot, Iron","Iron Spikes":"Spikes, Iron","Glass Bottle":"Bottle, Glass","Portable Ram":"Ram, Portable"};
function gearKey(n){var g=function(k){return GEAR.filter(function(x){return x[0]===k})[0]};if(GEAR_AL[n])return [g(GEAR_AL[n]),1];var m=/^(.+?) \((\d+) (?:sheets|flasks|days?)\)$/.exec(n);if(m){var b=m[1]==="Oil"?"Oil (flask)":m[1]==="Rations"?"Rations (1 day)":m[1];if(g(b))return [g(b),+m[2]]}
 var f=/^(Book|Arcane Focus|Druidic Focus|Holy Symbol|Costume) \(([^()]+)\)$/.exec(n);if(f&&!WEAPONS[f[2]]&&g(f[1]))return [g(f[1]),1];return null}
function itemW(n){var n0=n;n=baseOf(n).b;if(WEAPONS[n])return WEAPONS[n].w;if(ARMOR[n])return ARMOR[n].w;if(n==="Shield")return 6;var g=GEAR.filter(function(x){return x[0]===n})[0];if(g)return g[2];var gk=gearKey(n);if(gk)return gk[0][2]*gk[1];/* v32 p21 */var m=DMAP[n0]||DMAP[n];return m?magicW(m):0}
function itemWEst(n){var b=baseOf(n).b;if(WEAPONS[b]||ARMOR[b]||b==="Shield"||GEAR.some(function(x){return x[0]===b})||gearKey(b))return false;var m=DMAP[n]||DMAP[b];return !!m&&magicW(m,1)===1}
/* v27 RD20: magic item weight. The text of the item ("weighs 5 pounds"), else the name, else the type (MAGIC_WN, MAGIC_WT in db4.js). est: not from the DMG */
function magicW(m,est){var x=/\bweighs (\d+(?:\.\d+)?) pounds?\b/.exec(String(m[4]||""));if(x)return est?0:+x[1];if(typeof MAGIC_WN==="undefined")return 0;var e=MAGIC_WN.filter(function(r){return new RegExp(r[0],"i").test(m[0])})[0];if(est)return 1;return e?e[1]:(MAGIC_WT[m[1]]!=null?MAGIC_WT[m[1]]:0)}
function itemCost(n){if(PRICE[n]!=null)return PRICE[n];var g=GEAR.filter(function(x){return x[0]===n})[0];if(!g){var gk=gearKey(n);return gk?Math.round(gk[0][1]*gk[1]*100)/100:null}/* v32 p21 */return g[1]}
function equippable(n){n=baseOf(n).b;return !!(WEAPONS[n]||ARMOR[n]||n==="Shield")}
/* D1: Monk weapon (PHB Martial Arts): Simple Melee, or Martial Melee with the Light property */
/* v89: 2014 weapon lists name the weapons (Longswords, Hand Crossbows). A token matches a weapon by its singular name */
function wpNamed(list,n){return String(list||"").split(/,\s*/).some(function(t){t=t.replace(/\s*\(.*$/,"");return t===n||t.replace(/s$/,"")===n||(t==="Quarterstaffs"&&n==="Quarterstaff")})}
function monkRule(w,nm){if(!w||w.k!=="M")return false;if(R14())return nm==="Shortsword"||(w.cat==="S"&&!/Two-Handed|Heavy/.test(w.p||""));return w.cat==="S"||/Light/.test(w.p)}
function monkWep(n){var w=WEAPONS[baseOf(n).b];return !!w&&monkRule(w,baseOf(n).b)}
/* v32 RU134: the items of one pack. The container is named after the pack ("Backpack (Explorer's Pack)"), with a number when that name is taken in L */
function packOut(p,L){var P=PACKS[p];if(!P)return [];var nm=P[0]+" ("+p+")",k=2,has=function(n){return (L||[]).some(function(y){return y.n===n})};while(has(nm))nm=P[0]+" ("+p+" "+(k++)+")";
 return [{n:nm,q:1,eq:false}].concat(P[1].map(function(x){return {n:x[0],q:x[1],eq:false,in:nm}}))}
function rebuildKit(unpack){B.inv=(B.inv||[]).filter(function(x){return !x.kit});var hasArmor=B.inv.some(function(x){return ARMOR[x.n]&&x.eq});
 kitItems().forEach(function(x){if(unpack&&PACKS[x.n]){for(var pk2=0;pk2<(x.q||1);pk2++)packOut(x.n,B.inv).forEach(function(y){y.src=x.src;y.kit=1;B.inv.push(y)});return}/* v32 RU134 */var eq=equippable(x.n);if(ARMOR[x.n]){eq=!hasArmor;hasArmor=true}/* D1: a Monk does not start holding a non-Monk weapon */if(eq&&B.cls==="Monk"&&WEAPONS[baseOf(x.n).b]&&!monkWep(x.n))eq=false;B.inv.push({n:x.n,q:x.q,eq:eq,src:x.src,kit:1})})}
function normInv(){(B.inv||[]).forEach(function(x){if(x.alias&&/^Spell Scroll \(/.test(x.alias)){x.n=x.alias;delete x.alias;x.eq=false;return}if(x.alias||/^Spell Scroll \(/.test(x.n))return;var bn=baseOf(x.n).b;if(WEAPONS[bn]||ARMOR[bn]||bn==="Shield"||DMAP[x.n]||itemCost(bn)!=null)return;var pm=/\(([^)]+)\)/.exec(x.n);if(pm&&(WEAPONS[pm[1]]||ARMOR[pm[1]]||itemCost(pm[1])!=null)){x.alias=x.n;x.n=pm[1];if(WEAPONS[pm[1]])x.eq=true}})}
function ensureInv(){normInv();if(!B.inv){B.inv=[];if(B.armor)B.inv.push({n:B.armor,q:1,eq:true});if(B.shield)B.inv.push({n:"Shield",q:1,eq:true});(B.weps||[]).forEach(function(n){B.inv.push({n:n,q:1,eq:true})});(B.buy||[]).forEach(function(x){if(!B.inv.some(function(y){return y.n===x.n}))B.inv.push({n:x.n,q:x.q||1,eq:equippable(x.n)})});rebuildKit()}return B.inv}
function effArmor(){var a=ensureInv().filter(function(x){return ARMOR[baseOf(x.n).b]&&x.eq})[0];return a?a.n:""}
function effShield(){var s=ensureInv().filter(function(x){return baseOf(x.n).b==="Shield"&&x.eq})[0];return s?s.n:""}
function effWeps(){var w=[];ensureInv().forEach(function(x){if(WEAPONS[baseOf(x.n).b]&&x.eq&&w.indexOf(x.n)<0)w.push(x.n)});return w}
function gpNow(){return B.gpOverride!=null&&B.gpOverride!==""?+B.gpOverride:gpBase()}

/* Item quantity. Missing = 1. 0 is kept (used-up ammunition stays in the inventory). */
function qOf(x){var n=parseFloat(x&&x.q);return isNaN(n)?1:Math.max(0,n)}
/* V16-1: a named magic weapon or armor (DMGI[5].base) resolves to its base item and its bonus (fx.ac for armor and shields, fx.atk for weapons) */
function baseOf(n){var pq=/^(Backpack|Chest) \(([^()]+'s Pack)(?: \d+)?\)$/.exec(n);if(pq&&typeof PACKS!=="undefined"&&PACKS[pq[2]])return {b:pq[1],p:0};/* v32 RU134 */var m=/^(.+), \+(\d)$/.exec(n);if(m)return {b:m[1],p:+m[2]};var mw=/^(.+), Masterwork(?: \(\d+\))?$/.exec(n);if(mw&&!(typeof DMAP!=="undefined"&&DMAP[n])&&WEAPONS[mw[1]])return {b:mw[1],p:0};/* v20 M6 */var d=typeof DMAP!=="undefined"&&DMAP[n],mb=d&&d[5]&&d[5].base;if(mb){var o=n!==d[0]&&/^(.*) \(([^()]+)\)$/.exec(n),b=o&&mb.indexOf(o[2])>=0?o[2]:mb[0],f=d[5].fx||{};return {b:b,p:(ARMOR[b]||b==="Shield")?(f.ac||0):(f.atk||0),mi:d[0],mw:!!f.mw}}/* v20 RD24: mw = Masterwork, attack only */return {b:n,p:0}}
function rarityOf(x){if(x.rar)return x.rar;var dm=DMAP[x.n];if(dm)return dm[2]==="Varies"||dm[2]==="Not magic"?"":dm[2];var o=baseOf(x.n);if(o.p){if(WEAPONS[o.b])return RAR_W[o.p];if(ARMOR[o.b])return RAR_A[o.p];if(o.b==="Shield")return RAR_S[o.p]}var p=POTIONS.filter(function(q){return q[0]===x.n})[0];if(p)return p[1];var sc=scrollOf(x.n);if(sc)return sc.rar;return ""}
function rarCls(r){return r?"r-"+r.toLowerCase().replace(/\s+/g,""):""}

function scrollOf(n){var m=/^Spell Scroll \((.+)\)$/.exec(n);if(!m)return null;var s=SPELLS.filter(function(x){return x[0]===m[1]})[0];if(!s)return null;var t=SCROLL_T[s[1]];return {sp:s,rar:t[1],dc:t[2],atk:t[3]}}
var dbCat="Classes",dbQ="";
function dbItems(){var o=[],keep=dbCat;if(dbQ){var all=[];["Classes","Subclasses","Species","Backgrounds","Feats","Weapons","Armor","Options"].forEach(function(c){dbCat=c;all=all.concat(dbItems0())});dbCat=keep;var q=dbQ.toLowerCase();return all.filter(function(i){return (i.t+" "+i.m+" "+i.d+" "+i.x.join(" ")).toLowerCase().indexOf(q)>=0})}return dbItems0()}
function dbItems0(){var o=[];
 if(dbCat==="Classes")Object.keys(CLASSES).forEach(function(n){var c=CLASSES[n];o.push({t:n,m:"d"+c.hd+" \u00b7 "+c.prim+" \u00b7 Saves "+c.saves.join(", "),d:"Armor: "+(c.armor||"none")+". Weapons: "+c.weapons+". Skills: choose "+c.sk.n+(c.caster?". Caster: "+c.caster+" ("+c.cast+")":"")+".",x:c.f.map(function(f){return "L"+f[0]+" "+f[1]+": "+f[2]})})});
 if(dbCat==="Subclasses")Object.keys(CLASSES).forEach(function(n){Object.keys(CLASSES[n].subs).forEach(function(s){o.push({t:s,m:n,d:"",x:CLASSES[n].subs[s].map(function(f){return "L"+f[0]+" "+f[1]+": "+f[2]})})})});
 if(dbCat==="Species")Object.keys(SPECIES).forEach(function(n){var s=SPECIES[n];o.push({t:n,m:s.size+" \u00b7 "+s.speed+" ft"+(s.dark?" \u00b7 Darkvision "+s.dark:""),d:s.lin?s.lin.label+": "+s.lin.opts.join("; ")+".":"",x:s.traits.map(function(t){return t[0]+": "+t[1]})})});
 if(dbCat==="Backgrounds")Object.keys(BACKGROUNDS).forEach(function(n){var b=BACKGROUNDS[n];o.push({t:n,m:b.ab.join(", ")+" \u00b7 "+b.feat,d:"Skills: "+b.sk.join(", ")+". Tool: "+b.tool+". Gear: "+b.eq+".",x:[]})});
 if(dbCat==="Feats")Object.keys(FEATS).forEach(function(n){var f=FEATS[n];o.push({t:n,m:({O:"Origin",G:"General",F:"Fighting Style",E:"Epic Boon",X:"Fighting Style option"}[f.cat]||"Feat")+(f.pre?" \u00b7 "+f.pre:"")+(f.asi?" \u00b7 +1 "+f.asi.join("/"):""),d:(f.full||f.d).replace(/\*\*/g,""),x:[]})});
 if(dbCat==="Weapons")wpKeys().forEach(function(n){var w=WEAPONS[n];o.push({t:n,m:(w.cat==="S"?"Simple":"Martial")+" "+(w.k==="M"?"Melee":"Ranged")+" \u00b7 "+w.d+" "+w.t,d:(w.p||"No properties")+(w.r?". Range "+w.r:"")+((w.nm||!w.m)?"":". Mastery: "+w.m+", "+MASTERY[w.m]),x:[]})});
 if(dbCat==="Armor")Object.keys(ARMOR).forEach(function(n){var r=ARMOR[n];o.push({t:n,m:r.cat+" \u00b7 AC "+r.ac+(r.dex==="full"?" + Dex":r.dex==="max2"?" + Dex (max 2)":""),d:(r.str?"Str "+r.str+". ":"")+(r.dis?"Stealth Disadvantage. ":"")+r.w+" lb.",x:[]})});
 if(dbCat==="Options"){MANEUVERS.forEach(function(m){o.push({t:m[0],m:"Battle Master Maneuver",d:m[1].replace(/\*\*/g,""),x:[]})});METAMAGIC.forEach(function(m){o.push({t:m[0],m:"Metamagic",d:m[1].replace(/\*\*/g,""),x:[]})});INVOCATIONS.forEach(function(m){o.push({t:m[0],m:"Eldritch Invocation"+(m[2]>1?" \u00b7 Warlock "+m[2]+"+":"")+(m[3]?" \u00b7 "+m[3]:""),d:m[1].replace(/\*\*/g,""),x:[]})});Object.keys(OPTS).forEach(function(k){OPTS[k].forEach(function(m){o.push({t:m[0],m:k,d:m[1],x:[]})})})}
 return o}
/* ---------- import current sheet into builder ---------- */
/* L4: multiclass from the sheet label ("Fighter 4 / Rogue 1") and the "<Class> (multiclass N): <Subclass>" feature groups */
function mcFromSheet(C,main){var parts=String(C.clsLabel||"").split(" / ").map(function(p){var m=/^([A-Za-z]+)\s+(\d+)$/.exec(p.trim());return m?{cls:m[1],lv:+m[2]}:null});
 if(parts.length<2||!parts[0]||parts[0].cls!==main)return [];
 var subs={};(C.features||[]).forEach(function(g){var m=/^([A-Za-z]+) \(multiclass \d+\)(?:: (.+))?$/.exec(g.g||"");if(m)subs[m[1]]=m[2]||""});
 var out=[];parts.slice(1).forEach(function(p){if(!p||!CLASSES[p.cls]||p.cls===main||out.some(function(x){return x.cls===p.cls}))return;out.push({cls:p.cls,lv:Math.max(1,Math.min(20,p.lv)),sub:subs[p.cls]||""})});
 return out}
function fromSheet(st){var C=st.C,nb=clone(BLANK),miss=[];nb.name=C.name||"Character";if(C.rs==="2014"){nb.rs="2014";nb.bgMode="111"}/* v82 */nb.src=clone(B.src||{core:true,dmg:true});if((B.duelMode==="on"||B.duelMode==="off")&&B.name===C.name)nb.duelMode=B.duelMode;/* RL29: C does not store it. RL36 a: only for the same character */
 var spFull=String(C.species||""),sp=spFull.split(" (")[0],spRest=spFull.slice(sp.length);
 /* v74: species names may hold brackets ("Dragonborn (2014)", "Aasimar (Protector)"). Take the longest known name, the rest is the lineage */
 (function(){var best="";function chk(k){if(k&&k.length>best.length&&(spFull===k||spFull.indexOf(k+" (")===0))best=k}
  Object.keys(SPECIES).forEach(chk);if(window.WXSP)Object.keys(WXSP).forEach(function(id){Object.keys(WXSP[id]).forEach(chk)});allPacks().forEach(function(pk){if(pk.species)Object.keys(pk.species).forEach(chk)});
  if(best){sp=best;spRest=spFull.slice(best.length)}})();
 if(!SPECIES[sp]){allPacks().forEach(function(p){if(p.species&&p.species[sp])nb.src[p.id]=true})}
 /* v67: a species, background or subclass of a WotC source keeps its source on when the sheet is read back */
 if(window.WXSP)Object.keys(WXSP).forEach(function(id){if(WXSP[id][sp])nb.src[id]=true});if(window.WXBG)Object.keys(WXBG).forEach(function(id){if(WXBG[id][C.bg])nb.src[id]=true});if(window.WXS)WXS.forEach(function(x){if(x.name===C.sub&&x.cls===C.cls)nb.src[x.src]=true});/* v81: an option of the WotC class lists that the sheet shows keeps its source on */if(window.WXO){var fj=JSON.stringify(C.features||[]);Object.keys(WXO).forEach(function(id){var g=WXO[id];[].concat(g.inv||[],g.man||[],g.rn||[]).forEach(function(r){if(fj.indexOf('"n":"'+r[0]+'"')>=0||fj.indexOf("**"+r[0]+".**")>=0)nb.src[id]=true})})}/* v81: an instrument proficiency of the sheet keeps its source on */if(window.WXG)Object.keys(WXG).forEach(function(id){WXG[id].forEach(function(r){if(r[3]==="Musical Instrument"&&((C.profSrc||{}).tools||[]).some(function(q){return q[0]===r[0]}))nb.src[id]=true})});
 B=nb;applyPacks();
 if(SPECIES[sp]){B.species=sp;if(SPECIES[sp].opts){var so=[];(C.features||[]).forEach(function(g){(g.items||[]).forEach(function(f){SPECIES[sp].opts.list.forEach(function(o){if(f.n===o[0]&&so.indexOf(o[0])<0)so.push(o[0])})})});if(so.length)B.ch.spopt=so.slice(0,SPECIES[sp].opts.n)}var lm=/\(([^)]+)\)/.exec(spRest);if(lm&&SPECIES[sp].lin){var o=SPECIES[sp].lin.opts.filter(function(x){return x.indexOf(lm[1])===0})[0];if(o)B.ch.lin=o}/* v82: 2014 race ability picks come back from the race bonus on the sheet */if(C.rs==="2014"&&SPECIES[sp].asiFlex&&C.abilities){var f2=[],f1=[];Object.keys(C.abilities).forEach(function(k){var a=C.abilities[k],t=0;((a&&a.bonus)||[]).forEach(function(x){if(x.s===sp+" (race)")t+=x.v});if(t===2)f2.push(k);else if(t===1)f1.push(k)});if(f2.length===1&&f1.length===1){B.ch.rasi=f2;B.ch.rasi1=f1}else if(f1.length===3){B.ch.rasim="+1, +1, +1";B.ch.rasi=f1}}if(C.rs==="2014"&&SPECIES[sp].asiPick&&C.abilities){var rp=[];Object.keys(C.abilities).forEach(function(k){var a=C.abilities[k];if(a&&(a.bonus||[]).some(function(x){return x.s===sp+" (race)"})&&!(SPECIES[sp].asi&&SPECIES[sp].asi[k])&&rp.indexOf(k)<0)rp.push(k)});if(rp.length)B.ch.rasi=rp.slice(0,SPECIES[sp].asiPick.n)}}
 else{B.species="Custom";B.cSpecies={name:sp||"Custom",speed:+C.speed||30,dark:+C.darkvision||0,size:C.size||"Medium"};miss.push("species")}
 if(C.size)B.size=C.size;
 var cls=(C.cls||"").split(" ")[0];if(CLASSES[cls])B.cls=cls;else miss.push("class");
 /* L4: C.level is the total level. Split it with the sheet label "Fighter 4 / Rogue 1". The total stays authoritative */
 var tot=Math.max(1,Math.min(20,+C.level||1)),mcl=mcFromSheet(C,B.cls),ml=mcl.reduce(function(t,m){return t+m.lv},0);
 if(mcl.length&&tot-ml>=1){B.level=tot-ml;B.mc=mcl}else B.level=tot;
 if(C.sub){if(!CL().subs[C.sub])allPacks().forEach(function(p){if(p.subclasses&&p.subclasses[B.cls]&&p.subclasses[B.cls][C.sub]){B.src[p.id]=true}});applyPacks();if(CL().subs[C.sub])B.sub=C.sub;else{B.sub="__custom";B.cSub=C.sub}}
 if(B.mc){B.mc.forEach(function(m){if(m.sub&&!CLASSES[m.cls].subs[m.sub])allPacks().forEach(function(p){if(p.subclasses&&p.subclasses[m.cls]&&p.subclasses[m.cls][m.sub])B.src[p.id]=true})});
  applyPacks();B.mc.forEach(function(m){if(m.sub&&!CLASSES[m.cls].subs[m.sub]){m.sub="";miss.push("multiclass subclass")}})}
 if(!BACKGROUNDS[C.bg]&&window.WXBG)Object.keys(WXBG).forEach(function(id){if(WXBG[id][C.bg]){B.src[id]=true;BACKGROUNDS[C.bg]=WXBG[id][C.bg]}});/* v67 */
 if(BACKGROUNDS[C.bg])B.bg=C.bg;else miss.push("background");
 ABK.forEach(function(k){var a=(C.abilities||{})[k];if(a)B.base[k]=+a.base||10});
 var bgb=[];ABK.forEach(function(k){((C.abilities[k]||{}).bonus||[]).forEach(function(b){if(B.bg&&b.s.indexOf(B.bg)===0)bgb.push([k,+b.v])})});
 if(C.rs==="2014")B.bgMode="111";else if(bgb.length===3)B.bgMode="111";else{B.bgMode="21";bgb.forEach(function(x){if(x[1]===2)B.bg2=x[0];if(x[1]===1)B.bg1=x[0]})}
 var feats=[];(C.features||[]).forEach(function(g){(g.items||[]).forEach(function(f){feats.push({g:g.g,n:f.n,s:f.s||"",d:f.d||""})})});
 feats.forEach(function(f){var fs=/^Fighting Style:\s*(.+)$/.exec(f.n);if(fs&&FEATS[fs[1].trim()])B.ch["fs"+(CL().fs||1)]=fs[1].trim();var yc=/You chose \*\*([^*]+)\*\*/.exec(f.d);if(f.n==="Fighting Style"&&yc&&FEATS[yc[1]])B.ch["fs"+(CL().fs||1)]=yc[1];
  if(f.n==="Weapon Mastery"){var w=[];Object.keys(WEAPONS).forEach(function(n){if(new RegExp("\\b"+n.replace(/[-]/g,"\\-")+"\\b").test(f.d))w.push(n)});if(w.length)B.ch.wm=w.slice(0,(CL().wm||[])[B.level-1]||w.length)}});
 var okLv=asiLevels().concat([19]);feats.filter(function(f){return /^Feats/.test(f.g)}).forEach(function(f){var FD=FEATS[f.n];if(!FD)return;var lv=/(?:Fighter|Barbarian|Bard|Cleric|Druid|Monk|Paladin|Ranger|Rogue|Sorcerer|Warlock|Wizard)\s+(\d+)/.exec(f.s);
  /* L5: the Fighting Style row (cat F/X) has source "<Class> <fs>" (level 1 or 2). That is not an ASI slot. Only levels in asiLevels() or 19 may become a featN key. A category F feat taken in an ASI slot (Fighter 4: Archery) is still read */
  if(lv&&(FD.cat==="F"||FD.cat==="X")&&okLv.indexOf(+lv[1])<0)return;
  if(/Origin/i.test(f.s)&&BACKGROUNDS[B.bg]&&(BACKGROUNDS[B.bg].feat===f.n||((BACKGROUNDS[B.bg].featOpts||[]).indexOf(f.n)>=0&&f.s.indexOf(B.bg)>=0))){if(BACKGROUNDS[B.bg].feat!==f.n)B.ch.bgfeatc=f.n;return}/* v67 */
  if(/Origin/i.test(f.s)){B.ch.spfeat=f.n;return}
  if(lv){var o={feat:f.n};ABK.forEach(function(k){((C.abilities[k]||{}).bonus||[]).forEach(function(b){if(b.s.indexOf(f.n)===0){if(!o.a1)o.a1=k;else o.a2=k;if(+b.v===2){o.a1=k;o.a2=k}}})});if(FEATS[f.n].asi&&!FEATS[f.n].asi2&&o.a2)delete o.a2;B.ch["feat"+lv[1]]=o}});
 (C.skills||[]).forEach(function(s){if(s.p&&/Cunning Eye/i.test(s.src||""))B.ch.sccunning=[s.n]});
 var ck=[];(C.skills||[]).forEach(function(s){if(s.p&&/class skill/i.test(s.src||""))ck.push(s.n)});if(ck.length)B.ch.clsk=ck;
 /* v70: the skill and tool picks of a 2014 background are read back from the sheet */
 (function(){var bx=BACKGROUNDS[B.bg];if(!bx)return;if(bx.skPick){var bs=[];(C.skills||[]).forEach(function(q){if(q.p&&String(q.src||"").indexOf(B.bg+" skill")===0)bs.push(q.n)});if(bs.length)B.ch.bgsk=bs.slice(0,bx.skPick.n)}
  if(bx.toolPick){var all=[];bx.toolPick.cats.forEach(function(k){all=all.concat(TOOLS[k]||[])});var fx=(bx.toolFix||"").split(/,\s*/),bt=[];((C.profSrc||{}).tools||[]).forEach(function(q){if(q[1]===B.bg&&all.indexOf(q[0])>=0&&fx.indexOf(q[0])<0)bt.push(q[0])});if(bt.length)B.ch.bgTool=bt.slice(0,bx.toolPick.n)}})();
 /* v81: the tool pick of the class (Bard instruments, Monk tool) comes back from the proficiency sources of the sheet */
  (function(){var tp=CL().toolPick;if(!tp)return;var all=[];tp.cats.forEach(function(k){all=all.concat(TOOLS[k]||[])});var ct=[];((C.profSrc||{}).tools||[]).forEach(function(q){if(q[1]===B.cls&&all.indexOf(q[0])>=0&&ct.indexOf(q[0])<0)ct.push(q[0])});if(ct.length)B.ch.clsTool=ct.slice(0,tp.n)})();
  B.inv=(C.inv||[]).map(function(x){var n=x.n,al=null;if(!(WEAPONS[baseOf(n).b]||ARMOR[baseOf(n).b]||n==="Shield"||DMAP[n]||itemCost(n)!=null||itemCost(baseOf(n).b)!=null)){/* v32 RU134 */var pm=/\(([^)]+)\)/.exec(n);if(pm&&(WEAPONS[pm[1]]||ARMOR[pm[1]]||itemCost(pm[1])!=null)){al=n;n=pm[1]}}var o={n:n,q:qOf(x),eq:!!x.eq||!!WEAPONS[baseOf(n).b]};if(al)o.alias=al;if(x.in)o.in=x.in;/* v32 RU134 */return o});B.eqC="none";B.eqB="none";B.gpOverride=C.gp!=null?C.gp:null;
 var lg=(st.lang||C.lang||[]).filter(function(x){return x&&x!=="Common"&&x!=="Druidic"&&x!=="Thieves' Cant"});if(lg.length)B.ch.lang=lg.slice(0,C.rs==="2014"?9:2);
 applyPacks();if(C.rs==="2014"&&B.ch.lang){var sx=SPECIES[B.species],bx=BACKGROUNDS[B.bg],fxl=((sx&&sx.lgf)||[]).concat((bx&&bx.lgf)||[]),nn=((sx&&sx.lgn)||0)+((bx&&bx.lgn)||0);B.ch.lang=B.ch.lang.filter(function(x){return fxl.indexOf(x)<0}).slice(0,nn);if(!B.ch.lang.length)delete B.ch.lang}/* v84 */
 /* v79: the choices of the subclass (Hunter's Prey, Land Type, maneuvers, War Bond, Evocation Savant and so on) come back from the sheet. The feature text holds them after "Your choice." */
 (function(){var cs=[];try{cs=choices()}catch(e){return}
  var by={},rd=function(f){var d=f.d||"",m=/\*\*Your choice\.\*\*\s*([^\n]*?)\.(?:\s|$)/.exec(d);/* the names end at the first full stop. Text such as "At your level" may follow */return m?m[1].split(/,\s*/).map(function(x){return x.replace(/\.$/,"").trim()}).filter(Boolean):[]};
  var fs=[];(C.features||[]).forEach(function(g){(g.items||[]).forEach(function(f){if(f.s)fs.push(f)})});
  /* Eldritch Invocations: the names of the group "Eldritch Invocations" fill the invocation picks in order */
  (function(){var iv=[];(C.features||[]).forEach(function(g){if(g.g==="Eldritch Invocations")(g.items||[]).forEach(function(f){if(iv.indexOf(f.n)<0&&INVOCATIONS.some(function(r){return r[0]===f.n}))iv.push(f.n)})});if(!iv.length)return;var i=0;
   cs.forEach(function(c){if(c.t!=="multi"||c.list!==INVOCATIONS||c.mc!=null)return;var part=iv.slice(i,i+(c.n||1));i+=part.length;if(part.length)B.ch[c.key]=part})})();
  cs.forEach(function(c){var sb=c.mc!=null?(B.mc&&B.mc[c.mc]||{}).sub:B.sub;if(!sb||sb==="__custom"||!c.src||c.src.indexOf(sb)<0||/^(m\d+:)?sc/.test(c.key))return;if(c.t!=="multi"&&c.t!=="opt"&&c.t!=="skills"&&c.t!=="tool")return;
   var pool=c.list&&typeof c.list!=="string"?c.list.map(function(x){return Array.isArray(x)?x[0]:x}):c.list?(OPTS[c.list]||[]).map(function(x){return x[0]}):(c.from||[]).map(function(x){return Array.isArray(x)?x[0]:x});if(c.t==="tool"){pool=[];(c.cats||[]).forEach(function(k){pool=pool.concat(TOOLS[k]||[])})}if(!pool.length)return;
   var got=[];
   if(c.t==="tool"){var al=[];(c.cats||[]).forEach(function(k){al=al.concat(TOOLS[k]||[])});((C.profSrc||{}).tools||[]).forEach(function(q){if((q[1]===c.feature||q[1]===c.title)&&al.indexOf(q[0])>=0&&got.indexOf(q[0])<0)got.push(q[0])})}
   else if(c.t==="skills"){var tg=sb+" "+c.lvl;(C.skills||[]).forEach(function(k){if(k.p&&(k.src||"").indexOf(tg)>=0&&pool.indexOf(k.n)>=0)got.push(k.n)})}
   else{var fk=/maneuver$/.test(c.key)?"Maneuvers known":c.feature,f=fs.filter(function(x){return x.n===fk&&x.s.indexOf(sb)>=0})[0];if(!f&&c.t!=="opt")return;if(!f)f={d:""};
    if(fk==="Maneuvers known"){var mm=[],re=/\*\*([^*]+?)\.\*\*/g,q;while((q=re.exec(f.d||"")))mm.push(q[1]);got=mm.filter(function(n){return pool.indexOf(n)>=0})}else got=rd(f).filter(function(n){return pool.indexOf(n)>=0})}
   if(!got.length&&c.t==="opt"){var tg2=sb+" "+c.lvl;(C.defenses||[]).forEach(function(d){if((d.s||"").indexOf(tg2)>=0)(d.v||[]).forEach(function(v){if(pool.indexOf(v)>=0&&got.indexOf(v)<0)got.push(v)})})}/* the pick shows only as a resistance (Elemental Affinity) */
   var tk=c.t+":"+(c.mc!=null?c.mc+":":"")+(c.feature||c.key);by[tk]=by[tk]||{g:got,i:0};var part=c.t==="skills"?got:by[tk].g.slice(by[tk].i,by[tk].i+(c.n||1));by[tk].i+=part.length;
   var seen=[];Object.keys(B.ch).forEach(function(k){if(k!==c.key&&/maneuver$/.test(k)===/maneuver$/.test(c.key)&&Array.isArray(B.ch[k]))seen=seen.concat(B.ch[k])});
   part=part.filter(function(n){return seen.indexOf(n)<0});if(part.length)B.ch[c.key]=part.slice(0,c.n||1)})})();
 /* v79: the spells chosen in Manage Spells (use Prepared or Cantrip, source = the class) come back as builder picks, so Apply keeps them */
 (function(){var cp=[];try{cp=casterParts()}catch(e){}if(!cp.length)return;var first=cp[0].cls,have={};B.sp=[];delete B.spm;
  (C.spells||[]).forEach(function(x){if(!/^(Prepared|Cantrip)$/.test(x.use||""))return;var cl=x.src;if(!cp.some(function(p){return p.cls===cl}))return;var k=cl+"|"+x.n;if(have[k])return;have[k]=1;
   if(cl===first)B.sp.push(x.n);else{B.spm=B.spm||{};(B.spm[cl]=B.spm[cl]||[]).push(x.n)}});
  /* the source of a picked spell must be on before its row can be found */
  try{wxGate()}catch(e){}SPX=null;
  B.sp=B.sp.filter(function(n){return !!spRec(n)});if(B.spm)Object.keys(B.spm).forEach(function(c){B.spm[c]=B.spm[c].filter(function(n){return !!spRec(n)});if(!B.spm[c].length)delete B.spm[c]})})();
 return miss}
/* ---------- level-based numbers for feature text ---------- */
function calcNote(name,cls,L,a){var pb=pbOf(TL()),m=function(k){return mod(a.sc[k])},c=CLASSES[cls],dc=function(k){return 8+pb+m(k)};
 /* uses come from the resource with this name, not from its position in res/resSub (L2). Missing resource: no note, never a wrong number */
 var rv=function(n,sub){var l=sub?((c.resSub||{})[sub]||[]):(c.res||[]),r=l.filter(function(x){return x.n===n})[0];if(!r)throw new Error("no resource "+n);return mcResMax(r,a,L)};
 var T={
  "Rage":function(){return rv("Rage")+" uses per Long Rest, +"+c.track["Rage Damage"][L-1]+" Rage Damage"},
  "Bardic Inspiration":function(){return Math.max(1,m("CHA"))+" uses, die "+c.track["Inspiration Die"][L-1]},
  "Second Wind":function(){return rv("Second Wind")+" uses, heals 1d10 + "+L},
  "Arcane Shot":function(){return "Arcane Shot Die "+(L>=18?"d12":L>=15?"d10":L>=10?"d8":"d6")+", "+Math.max(1,m("INT"))+" uses, save DC "+dc("INT")},/* v64 */
  "Action Surge":function(){return (L>=17?2:1)+" use"+(L>=17?"s":"")+" per Short Rest"},
  "Indomitable":function(){return (L>=17?3:L>=13?2:1)+" uses, bonus +"+L},
  "Channel Divinity":function(){var r=(c.res||[]).filter(function(x){return x.n==="Channel Divinity"})[0];return r?r.max[L-1]+" uses":""},
  "Wild Shape":function(){return rv("Wild Shape")+" uses, max CR "+(L>=8?"1":L>=4?"1/2":"1/4")},
  "Martial Arts":function(){return "Martial Arts die "+c.track["Martial Arts Die"][L-1]},
  "Monk's Focus":function(){return L+" Focus Points, save DC "+dc("WIS")},
  "Stunning Strike":function(){return "Constitution save DC "+dc("WIS")},
  "Sneak Attack":function(){return c.track["Sneak Attack"][L-1]},
  "Lay on Hands":function(){return "Pool of "+(5*L)+" Hit Points"},
  "Aura of Protection":function(){return "+"+Math.max(1,m("CHA"))+" to saves, "+(L>=18?30:10)+"-foot aura"},
  "Favored Enemy":function(){return rv("Favored Enemy")+" free Hunter's Mark casts"},
  "Font of Magic":function(){return L+" Sorcery Points"},
  "Arcane Recovery":function(){return "Recover up to "+Math.ceil(L/2)+" levels of slots"},
  "Magical Cunning":function(){var p=PACT[L-1];return "Regain up to "+Math.ceil(p[0]/2)+" Pact slot"+(Math.ceil(p[0]/2)>1?"s":"")},
  "Awakened Mind":function(){return "Range "+Math.max(1,m("CHA"))+" mile"+(Math.max(1,m("CHA"))>1?"s":"")+", lasts "+L+" minutes"},
  "Clairvoyant Combatant":function(){return "Wisdom save DC "+dc("CHA")},
  "Combat Superiority":function(){return rv("Superiority Dice","Battle Master")+" Superiority Dice ("+(L>=18?"d12":L>=10?"d10":"d8")+"), save DC "+(8+pb+Math.max(m("STR"),m("DEX")))},
  "Psionic Power":function(){return rv("Psionic Energy Dice","Psi Warrior")+" Psionic Energy Dice"},
  "Breath Weapon":function(){return "Dexterity save DC "+(8+pb+m("CON"))+", "+(L>=17?4:L>=11?3:L>=5?2:1)+"d10, "+pb+" uses"},
  "Healing Hands":function(){return pb+"d4 Hit Points"},
  "Relentless Rage":function(){return "Drops to "+(2*L)+" Hit Points on success"},
  "Divine Intervention":function(){return "Once per Long Rest"},
  "Mystic Arcanum":function(){return L>=17?"Level 6, 7, 8, 9 spells":L>=15?"Level 6, 7, 8 spells":L>=13?"Level 6, 7 spells":"Level 6 spell"}};  var T14={
   "Rage":function(){return (L>=20?"Unlimited uses":rv("Rage")+" uses per Long Rest")+", +"+c.track["Rage Damage"][L-1]+" Rage Damage"},
   "Indomitable":function(){return "Reroll a failed save, "+rv("Indomitable")+" use"+(rv("Indomitable")>1?"s":"")+" per Long Rest, you must keep the new roll"},  "Ki":function(){return L+" ki points, ki save DC "+dc("WIS")},
   "Divine Sense":function(){return Math.max(1,1+m("CHA"))+" uses per Long Rest"},
   "Cleansing Touch":function(){return Math.max(1,m("CHA"))+" uses per Long Rest"},
   "Wild Shape":function(){var lim=L>=8?"CR 1":L>=4?"CR 1/2, no flying speed":"CR 1/4, no flying or swimming speed";return (L>=20?"Unlimited uses":rv("Wild Shape")+" uses per Short Rest")+", "+lim+", lasts "+Math.floor(L/2)+" hour"+(Math.floor(L/2)>1?"s":"")},
   "Divine Intervention":function(){return L>=20?"Succeeds automatically":"Succeeds on a d100 roll of "+L+" or lower, then 7 days before you can try again"},
   "Relentless Rage":function(){return "At 0 Hit Points while raging, Con save DC 10 (+5 per use until a rest). On success you drop to 1 Hit Point instead"}
  };
  var f=(R14()&&T14[name])||T[name];if(!f)return "";try{var s=f();return s?" **At your level:** "+s+".":""}catch(e){return ""}}
function defenses(a){var o=[],L=B.level,sp=SPECIES[B.species];function add(t,v,s){o.push({t:t,v:v,s:s})}
 (un("species")?[]:DEF_SP[B.species]||[]).forEach(function(x){add(x[0],x[1],B.species)});
 var lin=B.ch.lin||"";if(B.species==="Dragonborn"&&lin){var mm=/\(([A-Za-z]+)\)/.exec(lin);if(mm)add("Resistance",mm[1],"Dragonborn ("+lin.split(" ")[0]+")")}
 if(sp&&sp.linRes&&lin){var lk=Object.keys(sp.linRes).filter(function(k){return lin.indexOf(k)===0})[0];if(lk)add("Resistance",sp.linRes[lk],B.species+" ("+lk+")")}/* v66: species whose lineage picks one resistance (Reborn) */
 if(B.species==="Tiefling"&&lin){var tt={Abyssal:"Poison",Chthonic:"Necrotic",Infernal:"Fire"}[lin.split(" ")[0]];if(tt)add("Resistance",tt,"Tiefling ("+lin.split(" ")[0]+")")}
 function cl(cls,lv,sub){if(cls==="Barbarian")add("Resistance","Bludgeoning, Piercing, Slashing (while raging)","Rage");
  if(cls==="Paladin"&&lv>=10)add("Immunity","Frightened (Aura of Courage)","Paladin 10");  if(cls==="Monk"&&lv>=10&&!R14())add("Note","Ends Charmed, Frightened, or Poisoned at the end of your turn","Self-Restoration");
   if(R14()&&cls==="Monk"&&lv>=10){add("Immunity","Disease","Purity of Body");add("Immunity","Poisoned","Purity of Body")}
   if(R14()&&cls==="Paladin"&&lv>=3)add("Immunity","Disease","Divine Health");
  if(sub==="Path of the Berserker"&&lv>=6)add("Immunity","Charmed, Frightened (while raging)","Mindless Rage");
  if(sub==="Life Domain"&&false)add("","","");
  if(sub==="Great Old One Patron"&&lv>=10)add("Resistance","Psychic","Thought Shield");
  if(sub==="Psi Warrior"&&lv>=10)add("Resistance","Psychic","Guarded Mind");
  if(sub==="Aberrant Sorcery"&&lv>=6)add("Resistance","Psychic","Psychic Defenses");
  if(sub==="Oath of the Ancients"&&lv>=7)add("Resistance","Necrotic, Psychic, Radiant","Aura of Warding");
  if(sub==="War Domain"&&lv>=17)add("Resistance","Bludgeoning, Piercing, Slashing","Avatar of Battle");
  if(sub==="Celestial Patron"&&lv>=6)add("Resistance","Radiant","Radiant Soul");
  if(sub==="Archfey Patron"&&lv>=10)add("Immunity","Charmed","Beguiling Defenses");
  if(sub==="Circle of the Sea"&&lv>=10)add("Resistance","Cold, Lightning, Thunder","Stormborn");
  if(sub==="Circle of the Land"&&lv>=10)add("Immunity","Poisoned","Nature's Ward")}
 cl(B.cls,L,B.sub);MCL().forEach(function(m){cl(m.cls,m.lv,m.sub)});
 /* v32 RL49 no. 38: a homebrew subclass choice with dres (Calon Arang: Immunity) adds each chosen type */
 clsParts().forEach(function(q,i){if(!q.sub)return;subChoicesFor(q.sub).forEach(function(c){if(!c.dres||q.lv<c.l)return;var v=B.ch[(q.mc?"m"+(i-1)+":":"")+"sc"+c.k];if(Array.isArray(v))v.forEach(function(t){add(c.dres,t,c.feature)})})});
 /* v32 RL49 no. 32: Fiendish Resilience type. Nature's Ward resistance of the land type (Circle of the Land 10) */
 clsParts().forEach(function(q,i){var pre=q.mc?"m"+(i-1)+":":"";if((q.sub==="Fiend Patron"||q.sub==="The Fiend (2014)")&&q.lv>=10&&B.ch[pre+"p10opt"])add("Resistance",B.ch[pre+"p10opt"],"Fiendish Resilience");
  var lt=B.ch[pre+"land"],lr={Arid:"Fire",Polar:"Cold",Temperate:"Lightning",Tropical:"Poison"}[lt];if(q.sub==="Circle of the Land"&&q.lv>=10&&lr)add("Resistance",lr,"Nature's Ward ("+lt+")")});
 (B.inv||[]).forEach(function(x){if(!x.eq)return;if(x.n==="Ring of Resistance")add("Resistance","One type (set by the ring)","Ring of Resistance");if(/^Mithral|^Adamantine Armor/.test(x.n)&&/Adamantine/.test(x.n))add("Note","Critical Hits against you become normal hits","Adamantine Armor")});
 var eat=eaType();if(eat)add("Resistance",eat,"Elemental Affinity (Draconic Sorcery 6)");/* v19 RL41 */
 allFeats().forEach(function(f){if(f.n==="Boon of Energy Resistance"){var bt=B.ch["ber-"+(f.key||f.s)];if(Array.isArray(bt)&&bt.length)bt.forEach(function(t){add("Resistance",t,"Boon of Energy Resistance")});else add("Resistance","Two damage types, not chosen yet","Boon of Energy Resistance")}/* v32 RL49 no. 18 */if(f.n==="Heavy Armor Master")add("Note","Reduce Bludgeoning, Piercing, Slashing damage by your Proficiency Bonus in Heavy armor","Heavy Armor Master")});
 XFX.def(add);/* v62 */
 /* m5 (RL21): one line per type and value, sources joined in order. Class resources (Channel Divinity) are not touched */
 var out=[],at={};o.forEach(function(x){var k=x.t+"|"+x.v;if(at[k]==null){at[k]=out.length;out.push({t:x.t,v:x.v,s:x.s})}else if((", "+out[at[k]].s+", ").indexOf(", "+x.s+", ")<0)out[at[k]].s+=", "+x.s});
 return out}
