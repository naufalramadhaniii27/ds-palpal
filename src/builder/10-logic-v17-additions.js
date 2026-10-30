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
  else if(e.src==="bg"){if(B.bg!==e.owner)return;lv=TLv}/* tp: a background that tracks a use */
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
/* v32 RL49: every weapon with its mastery unlocked: class Weapon Mastery (main and multiclass), Masterful (species), Weapon Master feat */
function wmAll(){var o=[],ks=Object.keys(B.ch||{}).filter(function(k){return /^(m\d+:)?wm$|^spwep$|^wmf-/.test(k)&&Array.isArray(B.ch[k])});
 ks.sort(function(a,b){var r=function(k){return k==="wm"?0:k==="spwep"?1:2};return r(a)-r(b)});ks.forEach(function(k){B.ch[k].forEach(function(n){if(o.indexOf(n)<0)o.push(n)})});return o}
/* v32: a Divine Order or Primal Order option of any Cleric or Druid part */
function optAny(v){if(B.ch.p1opt===v)return true;return MCL().some(function(m,i){return B.ch["m"+i+":p1opt"]===v})}
function pactWeapon(){return invList().indexOf("Pact of the Blade")>=0?((B.ch.pactWep||[])[0]||""):""}
function pactList(){var o=[],seen={};ensureInv().forEach(function(x){var w=WEAPONS[baseOf(x.n).b];if(w&&w.k==="M"&&!seen[x.n]){seen[x.n]=1;o.push([x.n,"In your inventory"+(x.eq?"":" (not active)")+": "+w.d+" "+w.t])}});
 Object.keys(WEAPONS).forEach(function(n){var w=WEAPONS[n];if(w.k==="M"&&!seen[n]){seen[n]=1;o.push([n,"Conjured in your hand: "+w.d+" "+w.t])}});return o}
/* v32: cls = the class that owns the choice (its skill list), sub = its subclass. p.key replaces the key "p"+level+kind, p.feature names the feature card */
/* v35 p19: options already chosen at another level of the same kind (maneuver, metamagic) leave this list; this key's own picks stay */
function pkOthers(key,re){var mine=B.ch[key]||[],o={};Object.keys(B.ch||{}).forEach(function(k){if(k!==key&&re.test(k)&&Array.isArray(B.ch[k]))B.ch[k].forEach(function(n){if(mine.indexOf(n)<0)o[n]=1})});return o}
function pk(p,src,cls,sub){var o={key:p.key||("p"+p.l+p.k),lvl:p.l,src:SRC+", "+src};if(p.feature)o.feature=p.feature;
 if(p.k==="skill")return Object.assign(o,{t:"skills",n:p.n,from:p.from==="all"?ALLSK:p.from||(CLASSES[cls]||CL()).sk.from,title:p.title||"Extra class skill",ex:p.ex?1:0});
 if(p.k==="expertise")return Object.assign(o,{t:"exp",n:p.n,from:p.from,title:"Expertise",feature:p.feature||"Expertise"});
 if(p.yc)o.yc=1;if(p.ytx)o.ytx=1;var plv=clsLv(cls||B.cls)||B.level;
 if(p.cond==="wis"&&!wisElse())return null;
 if(p.cond==="minill"&&((spLists()[cls||B.cls])||[]).indexOf("Minor Illusion")<0)return null;/* Improved Illusions: only when Minor Illusion is known already */
 if(p.k==="lang")return Object.assign(o,{t:"lang",n:p.n||1,from:LANGS,title:p.title||"Language"});/* v63 */
 if(p.k==="cantrip")return Object.assign(o,{t:"multi",n:p.n||1,list:SPELLS.filter(function(x){if(x[1])return false;if(p.only)return p.only.indexOf(x[0])>=0;return x[3].indexOf(p.list)>=0&&(p.incl||x[0]!=="Minor Illusion")}).map(function(x){return [x[0],x[11]]}),title:p.title});/* v63: only = a fixed list, incl = Minor Illusion allowed *//* Iron Mind: a choice only when Wisdom saves come from elsewhere */
 if(p.k==="tool")return Object.assign(o,{t:"tool",n:p.n,cats:p.cats,title:p.title||"Tool"});
 if(p.k==="plans"){/* v58: Replicate Magic Item plans (EFotA). A plan table opens at its Artificer level, so a level 6 pick reads tables 2 and 6 */
  var pt=window.EFA_PLANS||{},pm=pkOthers(o.key,/plans$/),pl=[];Object.keys(pt).map(Number).sort(function(a,b){return a-b}).forEach(function(tl){if(tl>p.l)return;pt[tl].forEach(function(r){if(pm[r[0]])return;pl.push([r[0],"Plan from the level "+tl+" table."+(r[1]===1?" Needs attunement.":r[1]===2?" Choose the item with your DM.":"")])})});
  return Object.assign(o,{t:"multi",n:p.n,list:pl,title:p.title||"Magic item plans"})}
 if(p.k==="spells"){var smx=slotMaxOf(cls,plv);return Object.assign(o,{t:"multi",n:p.n,list:SPELLS.filter(function(x){return x[1]<=smx&&p.lists.some(function(l){return x[3].indexOf(l)>=0})}).map(function(x){return [x[0],(x[1]?"Level "+x[1]:"Cantrip")+" ("+x[3].filter(function(l){return p.lists.indexOf(l)>=0}).join(", ")+"). "+x[11]]}),title:p.title})}
 if(p.k==="forms"){var fl=wsList(plv);return Object.assign(o,{t:"multi",n:plv>=8?8:plv>=4?6:4,list:fl,title:p.title})}
 if(p.k==="sav"){var smx2=Math.max(2,slotMaxOf(cls,plv));return Object.assign(o,{t:"multi",n:2+Math.max(0,smx2-2),list:SPELLS.filter(function(x){return x[1]>=1&&x[1]<=smx2&&x[2]===p.school&&x[3].indexOf("Wizard")>=0}).map(function(x){return [x[0],"Level "+x[1]+". "+x[11]]}),title:p.title})}
 if(p.k==="book"){var bl=bookOf().filter(function(n){var x=spRec(n);return x&&x[1]===p.lv&&(!p.act||/^Action/.test(x[4]))});return Object.assign(o,{t:"multi",n:p.n,list:bl.map(function(n){return [n,spRec(n)[11]]}),title:p.title+(bl.length?"":" (add a fitting spell to your spellbook first)")})}
 if(p.k==="bond"){var bw=[];(B.inv||[]).forEach(function(x){var b=baseOf(x.n).b;if(WEAPONS[b]&&!bw.some(function(y){return y[0]===x.n}))bw.push([x.n,"In your inventory. "+itemType(b)+", "+WEAPONS[b].d+" "+WEAPONS[b].t+"."])});Object.keys(WEAPONS).forEach(function(n){if(!bw.some(function(y){return y[0]===n}))bw.push([n,itemType(n)+", "+WEAPONS[n].d+" "+WEAPONS[n].t+"."])});return Object.assign(o,{t:"multi",n:p.n,opt:1,list:bw,title:p.title})}/* v32 War Bond */
 if(p.k==="mlist"){var ex=pkOthers(o.key,new RegExp(p.excl+"$"));return Object.assign(o,{t:"multi",n:p.n,list:(OPTS[p.list]||[]).filter(function(x){return !ex[x[0]]&&(!x[2]||x[2]<=plv)}).map(function(x){return [x[0],x[1]]}),title:p.title})}/* v64: pick from an OPTS list, no repeats across levels. v81: x[2] is the class level an option needs */
 if(p.k==="opt")return Object.assign(o,{t:"opt",list:p.list,title:p.title||p.list});
 if(p.k==="fs")return Object.assign(o,{t:"fs",title:"Additional Fighting Style"});
 if(p.k==="maneuver"){var mx=pkOthers(o.key,/maneuver$/);return Object.assign(o,{t:"multi",n:p.n,list:MANEUVERS.filter(function(x){return !mx[x[0]]}),title:"Maneuvers",feature:"Combat Superiority"})}
 if(p.k==="metamagic"){var mm=pkOthers(o.key,/metamagic$/);return Object.assign(o,{t:"multi",n:p.n,list:METAMAGIC.filter(function(x){return !mm[x[0]]}),title:"Metamagic",feature:"Metamagic"})} if(p.k==="invocation")return Object.assign(o,{t:"multi",n:p.n,list:INVOCATIONS,title:"Eldritch Invocations",minLvl:1});
 if(p.k==="pact")return Object.assign(o,{t:"multi",n:1,list:PACTB14,title:"Pact Boon",feature:"Pact Boon"});/* v90 */
 return o}
/* v32 RL49: helpers of the new choices */
function slotMaxOf(cls,lv){var t=(CLASSES[cls]||{}).caster;if(t==="full")return SLOTS_FULL[lv-1].length;if(t==="half")return (lv>=2||(CLASSES[cls]||{}).efa||(CLASSES[cls]||{}).a14)?SLOTS_FULL[Math.ceil(lv/2)-1].length:0;if(t==="pact")return PACT[lv-1][1];return 0}
/* Wisdom saving throw proficiency from anything but Iron Mind (main class, Monk 14, Rogue 15, Resilient). Reads B only (no choices(), no recursion) */
function wisElse(){if((CL().saves||[]).indexOf("WIS")>=0)return true;if(clsParts().some(function(q){return (q.cls==="Monk"&&q.lv>=14)||(q.cls==="Rogue"&&q.lv>=15)}))return true;
 return Object.keys(B.ch||{}).some(function(k){var v=B.ch[k];return v&&typeof v==="object"&&v.feat==="Resilient"&&v.a1==="WIS"})}
/* Wild Shape: Beast forms the Druid can learn at this Druid level (Circle of the Moon: its own levels), from CREATURES */
function wsList(lv){var moon=subAt("Druid","Circle of the Moon")>=3;return ((typeof CREATURES!=="undefined"&&CREATURES.creatures)||[]).filter(function(x){var w=x.ws;if(!w)return false;return (w.lv!=null&&lv>=w.lv)||(moon&&w.moonLv!=null&&lv>=w.moonLv)}).map(function(x){return [x.n,"CR "+x.cr+". Speed "+x.speed+"."]})}
/* Wizard spellbook: B.pk.book (level 1+ spells added by the player) plus prepared Wizard spells (a prepared spell is always in the book) and Savant spells */
function wizLv(){return clsLv("Wizard")}
function savVals(){var o=[];clsParts().forEach(function(q,i){if(q.cls!=="Wizard")return;var v=B.ch[(q.mc?"m"+(i-1)+":":"")+"p3sav"];if(Array.isArray(v))o=o.concat(v)});return o}
function bookOwn(){if(!wizLv())return [];var o=[],sv=savVals(),ad=function(n){var x=spRec(n);if(x&&x[1]&&o.indexOf(n)<0&&sv.indexOf(n)<0)o.push(n)};((B.pk||{}).book||[]).forEach(ad);(spLists().Wizard||[]).forEach(ad);return o}
function bookOf(){var o=bookOwn().slice();savVals().forEach(function(n){if(o.indexOf(n)<0)o.push(n)});return o}
function bookNeed(){var l=wizLv();return l?6+2*(l-1):0}
/* invocations that hold a choice. mc: the multiclass index of the Warlock part (RL50), lvl: the Warlock level the invocation was taken at */
function wlMc(){if(B.cls==="Warlock")return undefined;var i;MCL().forEach(function(m,j){if(m.cls==="Warlock")i=j});return i}
function invLvl(n){var lv=99;Object.keys(B.ch||{}).forEach(function(k){var m=/^(?:m\d+:)?p(\d+)invocation$/.exec(k);if(m&&(B.ch[k]||[]).indexOf(n)>=0)lv=Math.min(lv,+m[1])});return lv===99?1:lv}
function wlCantrips(){var o=[];((spLists().Warlock)||[]).concat(B.ch.tomeC||[]).forEach(function(n){var x=spRec(n);if(x&&!x[1]&&o.indexOf(n)<0)o.push(n)});return o}
function invPicks(){var out=[],iv=invList(),wl=clsLv("Warlock");if(!wl||typeof INV_PICK==="undefined")return out;var mc=wlMc(),can=wlCantrips(),src=function(n){return SRC+", "+n+" (Warlock "+invLvl(n)+(mc!=null?", multiclass":"")+")"};
 Object.keys(INV_PICK).forEach(function(n){var q=INV_PICK[n],cnt=iv.filter(function(x){return x===n}).length;if(!cnt)return;
  if(q.feat){for(var j=1;j<=cnt;j++){var o=Object.assign({key:q.key+j,lvl:invLvl(n),t:"ofeat",title:n+": Origin feat"+(cnt>1?" "+j:""),src:src(n),feature:"Eldritch Invocations",inv:n},mc!=null?{mc:mc}:{});out.push(o)}return}
  var L2=can.filter(function(c){var x=spRec(c),fx=typeof SPELL_FX!=="undefined"&&SPELL_FX[c];if(q.dmg&&!(fx&&fx.dmg))return false;if(q.atk&&x[10]!=="ATK")return false;if(q.rng){var r=/(\d+) f/.exec(x[5]||"");if(!r||+r[1]<q.rng)return false}return true});
  out.push(Object.assign({key:q.key,lvl:invLvl(n),t:"multi",n:cnt,list:L2.map(function(c){return [c,spRec(c)[11]]}),title:n+": cantrip"+(cnt>1?"s":"")+(L2.length?"":" (learn a fitting Warlock cantrip first)"),src:src(n),feature:"Eldritch Invocations",inv:n},mc!=null?{mc:mc}:{}))});return out}
/* Agonizing Blast: the chosen cantrips. Not chosen yet: Eldritch Blast, as before v32 (the choice stays marked as open) */
function agOn(n){var v=B.ch.invab;if(Array.isArray(v)&&v.length)return v.indexOf(n)>=0;return n==="Eldritch Blast"&&invList().indexOf("Agonizing Blast")>=0}
/* the values of choices with yc (shown as "Your choice." under the feature on the sheet). mc: multiclass index or undefined */
function ycOf(CH,feature,mc){var o=[],tx=[];CH.forEach(function(c){if(!c.yc||c.feature!==feature||c.mc!==mc)return;var v=B.ch[c.key];if(Array.isArray(v)){o=o.concat(v);if(c.ytx&&Array.isArray(c.list))v.forEach(function(n){var r=c.list.filter(function(x){return x[0]===n})[0];if(r&&r[1])tx.push("**"+n+".** "+r[1])})}else if(v&&typeof v==="string")o.push(v)});/* v81: ytx adds the text of each chosen option before the choice line */return o.length?(tx.length?" "+tx.join(" "):"")+" **Your choice.** "+o.join(", ")+".":""}
function isDone(c){var v=B.ch[c.key];if(c.def&&v==null)return true;if(c.opt)return v==null||(Array.isArray(v)&&v.length<=c.n);/* v32: optional choice (War Bond) *//* v32: a default counts as chosen */
 if(c.t==="skills"||c.t==="exp"||c.t==="multi"||c.t==="wm"||c.t==="lang"||c.t==="tool"||c.t==="pe")return Array.isArray(v)&&v.length===c.n;
 if(c.t==="sub")return !!B.sub;
 if(c.t==="mcsub")return !!(B.mc[c.mc]&&B.mc[c.mc].sub);
 if(c.t==="feat"){if(!v||!v.feat)return false;var F=FEATS[v.feat];if(!F)return false;/* M12: feat missing from FEATS (pack off, renamed) */if(F.dt&&!v.dt)return false;/* v19 RL46 (4) */if(F.asi2)return !!(v.a1&&v.a2);if(F.asi)return !!v.a1;return true}
 if((c.t==="fs"||c.t==="ofeat")&&!FEATS[v])return false;/* RL28: saved feat missing from FEATS, card shows "(not available)" */
 return !!v}

