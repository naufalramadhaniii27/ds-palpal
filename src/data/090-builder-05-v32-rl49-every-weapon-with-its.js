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

/* ---------- derivation ---------- */
function abil(){
 var sc={},src={};ABK.forEach(function(k){sc[k]=+B.base[k]||10;src[k]=[]});
 var bg=bgX();  var rb=raceBonus();Object.keys(rb).forEach(function(k){if(src[k])src[k].push({s:B.species+" (race)",v:rb[k]})});if(bg&&!R14()){if(B.bgMode==="111")bg.ab.forEach(function(k){src[k].push({s:B.bg+" background ("+SRC+")",v:1})});
  else{if(B.bg2&&bg.ab.indexOf(B.bg2)>=0)src[B.bg2].push({s:B.bg+" background ("+SRC+")",v:2});if(B.bg1&&B.bg1!==B.bg2&&bg.ab.indexOf(B.bg1)>=0)src[B.bg1].push({s:B.bg+" background ("+SRC+")",v:1})}/* v22 P1: only the background's abilities (PHB 2024) */}
 allFeats().forEach(function(f){var v=f.asi;if(!v)return;var F=FEATS[f.n];if(!F)return;
  asiOf(f,F).forEach(function(q){src[q[0]].push({s:f.n+(F.asi2?"":" feat")+", "+f.s,v:q[1]})})});/* v19 RL46 (9): only abilities on the feat's list */
 if(B.level>=20&&B.cls==="Barbarian"){src.STR.push({s:"Primal Champion ("+SRC+", Barbarian 20)",v:4});src.CON.push({s:"Primal Champion ("+SRC+", Barbarian 20)",v:4})} if(B.level>=20&&B.cls==="Monk"&&!R14()){src.DEX.push({s:"Body and Mind ("+SRC+", Monk 20)",v:4});src.WIS.push({s:"Body and Mind ("+SRC+", Monk 20)",v:4})}
 ABK.forEach(function(k){var boon=0,cap=20;src[k].forEach(function(b){if(/^Boon of/.test(b.s))boon+=b.v;else sc[k]+=b.v});
  if(B.level>=20&&((B.cls==="Barbarian"&&(k==="STR"||k==="CON"))||(B.cls==="Monk"&&!R14()&&(k==="DEX"||k==="WIS"))))cap=R14()?24:25;
  if(sc[k]>cap&&+B.base[k]<=cap){src[k].push({s:"Capped at "+cap+" (score maximum)",v:cap-sc[k],cap:1});sc[k]=cap}
  if(boon){sc[k]=Math.min(30,sc[k]+boon)}});
 var AFX=activeFx();AFX.forEach(function(q){var f=q.fx;if(f.abil){var k=f.abil[0],nv=Math.min(f.abil[2]||30,sc[k]+f.abil[1]);if(nv>sc[k]){src[k].push({s:q.n+" (magic item, +"+f.abil[1]+", maximum "+(f.abil[2]||30)+")",v:nv-sc[k]});sc[k]=nv}}});
 AFX.forEach(function(q){var f=q.fx;/* V16-4: increases first, then "becomes" */
  var s=f.setsc;if(s&&sc[s[0]]<s[1]){src[s[0]].push({s:q.n+" (magic item, sets score to "+s[1]+")",v:s[1]-sc[s[0]]});sc[s[0]]=s[1]}});/* M18: DMGI fx (setsc as the old SETSC table, abil for Ioun Stones and similar) */
 return {sc:sc,src:src}}
function slotsFor(){var c=CL(),L=B.level,t=c.caster;
 if(t==="full")return SLOTS_FULL[L-1];if(t==="half")return SLOTS_FULL[Math.ceil(L/2)-1];
 if(t==="pact"){var p=PACT[L-1];return {pact:p[0],lvl:p[1]}}
 if(isThird3(B.sub)&&L>=3)return SLOTS_FULL[Math.ceil(L/3)-1];return null}
function resMax(r,a){var L=B.level;if(Array.isArray(r.max))return r.max[L-1];if(r.max&&r.max.f)return luMax(r.max,L,a,pbOf(TL()));if(r.max==="lvl")return L<2&&r.min2?0:L;if(r.max==="lvl5")return L*5;
 if(typeof r.max==="string"&&r.max.indexOf("mod:")===0)return Math.max(1,mod(a.sc[r.max.slice(4)]));return r.max}
/* M10: features of any class at its own level (classFeatures() = main class). clsParts(): main class first, then multiclass */
function featsOf(cls,L){var c=CLASSES[cls],seen={},out=[];c.f.forEach(function(x){if(x[0]<=L){var k=x[1];if(seen[k]!=null&&x[1]!=="Expertise"&&x[1]!=="Improved Brutal Strike"){out[seen[k]]=x;return}seen[k]=out.length;out.push(x)}});return out}
function classFeatures(){return featsOf(B.cls,B.level)}
function clsParts(){return [{cls:B.cls,sub:B.sub,lv:B.level,mc:0}].concat(MCL().map(function(m){return {cls:m.cls,sub:m.sub,lv:m.lv,mc:1}}))}
/* M9: spellcasting classes in order (main class first): {cls, sub, lv, mc, list (spell list class), ab} */
function isThird3(x){return x==="Eldritch Knight"||x==="Arcane Trickster"||x==="Eldritch Knight (2014)"||x==="Arcane Trickster (2014)"}
function casterParts(){return clsParts().map(function(q){var c=CLASSES[q.cls],third=isThird3(q.sub)&&q.lv>=3;if(!c.caster&&!third)return null;return {cls:q.cls,sub:q.sub,lv:q.lv,mc:q.mc,list:c.caster?q.cls:"Wizard",ab:c.caster?c.cast:"INT",xl:(R14()&&q.cls==="Bard"?xl14(q.sub,q.lv):(c.xlists&&q.lv>=c.xlists.l?c.xlists.lists:[])).concat(dmXl())/* v32: Magical Secrets */}}).filter(Boolean)}
/* M9: chosen spells per caster class. B.sp = first caster class (old builds), B.spm[cls] = other classes. A B.sp spell that is not on the first
   class list but is on another caster class list belongs to that class (read only, B is not changed) */
var SPX=null;function spRec(n){if(!SPX){SPX={};SPELLS.forEach(function(x){SPX[x[0]]=x})}return SPX[n]}
function spLists(){var cp=casterParts(),out={};cp.forEach(function(p){out[p.cls]=[]});if(!cp.length)return out;
 (B.sp||[]).forEach(function(n){var x=spRec(n),to=cp[0];if(x&&x[3].indexOf(to.list)<0&&!(to.xl||[]).some(function(l){return x[3].indexOf(l)>=0})){var o=cp.filter(function(p){return x[3].indexOf(p.list)>=0})[0];if(o)to=o}if(out[to.cls].indexOf(n)<0)out[to.cls].push(n)});
 Object.keys(B.spm||{}).forEach(function(k){if(out[k])(B.spm[k]||[]).forEach(function(n){if(out[k].indexOf(n)<0)out[k].push(n)})});return out}
/* M9: add or remove a spell for one caster class (UI calls this) */
function spToggle(n,cls){var cp=casterParts(),first=cp.length?cp[0].cls:B.cls;B.sp=B.sp||[];cls=cls||first;var L=spLists();
 if((L[cls]||[]).indexOf(n)>=0){var a=(B.spm||{})[cls]||[],i=a.indexOf(n);if(i>=0){a.splice(i,1);if(!a.length)delete B.spm[cls]}else{var j=B.sp.indexOf(n);if(j>=0)B.sp.splice(j,1)}return}
 if(cls===first)B.sp.push(n);else{B.spm=B.spm||{};(B.spm[cls]=B.spm[cls]||[]).push(n)}}
/* RL35 2b: species spell ability. SPECIES.spAb "choose" = B.ch.spab (Intelligence, Wisdom, Charisma), or a fixed key ("CHA"). null = not chosen */
function spAbility(){var sp=SPECIES[B.species];if(!sp||!sp.spAb)return null;if(sp.spAb==="choose")return {Intelligence:"INT",Wisdom:"WIS",Charisma:"CHA"}[B.ch.spab]||null;return sp.spAb}
/* M9: ability for a spell source. key: class name, "@species", "@spcan" (Limited Spellcaster), "@mi:<B.pk key>" (Magic Initiate) */
function spellAb(key,sc){var cp=casterParts(),cast=cp.length?cp[0].ab:null;sc=sc||abil().sc;
 if(key==="@species")return spAbility()||cast||["INT","WIS","CHA"].reduce(function(b,k){return sc[k]>sc[b]?k:b},"INT");
 if(key==="@spcan")return spOptFx().spAb||"CHA";if(/^@sub:/.test(key))return key.slice(5)||"CHA";/* v63 */
 if(key==="@dmcon")return "CON";if(/^@dm:/.test(key)){var dv=B.ch["dab-"+key.slice(4)],wa=wxAb(key.slice(4));if(wa)return wa;return (Array.isArray(dv)&&dv[0])||"INT"}/* v58 */
 if(/^@mi:/.test(key)){var v=(B.pk||{})[key.slice(4)];return (v&&v.ab)||"WIS"}
 if(/^@ft:/.test(key)){var ff=allFeats().filter(function(x){return x.key===key.slice(4)})[0];return (ff&&ff.asi&&ff.asi.a1)||"CHA"}/* v21 i3: the ability the feat raised */
 var p=cp.filter(function(q){return q.cls===key})[0];if(p)return p.ab;var c=CLASSES[key];if(c&&c.cast)return c.cast;return cast||"CHA"}
function clsLv(cls){var p=clsParts().filter(function(q){return q.cls===cls})[0];return p?p.lv:0}

/* ---------- resource keys (L2) ---------- */
/* Keys no longer depend on the order of CLASSES.*.res. New key = prefix + name slug, e.g. "r-second-wind",
   "m-cleric-channel-divinity". The sheet saves uses per key (S.used), so keepResKeys() reuses the key the sheet
   already has for the same resource (same name and tag first, then same name): old builds keep "r0", "m0r1", "sw". No stored data is migrated. */
function slugK(t){return String(t||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"")}
function resKey(pre,n,list){var b=pre+slugK(n),k=b,i=2;while(list.some(function(x){return x.k===k}))k=b+"-"+(i++);return k}
function keepResKeys(C){try{var st=window.__sheetState&&window.__sheetState(),P=st&&st.C;
 if(!P||P.name!==C.name||!Array.isArray(P.res)||!Array.isArray(C.res))return;
 var mine=function(k){return /^[rm]-/.test(k)},fixed={},took={},inh=[],used={};
 C.res.forEach(function(r){if(!mine(r.k))fixed[r.k]=1});
 [1,0].forEach(function(ex){C.res.forEach(function(r,i){if(!mine(r.k)||inh[i])return;
  var q=P.res.filter(function(q){return q&&q.k&&q.n===r.n&&!took[q.k]&&!fixed[q.k]&&(!ex||q.tag===r.tag)})[0];if(q){took[q.k]=1;inh[i]=q.k}})});
 C.res.forEach(function(r,i){if(inh[i])used[inh[i]]=1;else if(!mine(r.k))used[r.k]=1});
 var keep=[];C.res.forEach(function(r,i){if(mine(r.k)&&!inh[i]&&!used[r.k]){used[r.k]=1;keep[i]=1}});
 C.res.forEach(function(r,i){if(!mine(r.k)||keep[i])return;if(inh[i]){r.k=inh[i];return}var b=r.k,k=b,n=2;while(used[k])k=b+"-"+(n++);r.k=k;used[k]=1})}catch(e){}}

/* ---------- manual sheet entries (M3 / RL12) ---------- */
/* Apply replaces the whole C, so sheet entries the builder never produces are lost: manual attacks ("Improvised Weapon") and manual resources
   (Yudhi's "Healer's Kit"). manualLost(P, C) lists them: entries of the current sheet C (P) that are not builder-made and have no same-name entry in the
   new C. Builder-made attack = Unarmed Strike, a WEAPONS row (also "Alias (Weapon)" and "Weapon (thrown)"), or a SPELLS cantrip. Builder-made resource =
   a name in any CLASSES res/resSub, Luck Points, Hit Dice, Pact Slots, Spell Slots. Read only. Errors are swallowed (empty lists). */
function manualLost(P,C){var out={attacks:[],res:[]};try{if(!P||!C)return out;
 var SM={};SPELLS.forEach(function(x){SM[x[0]]=1});
 var isWep=function(n){n=String(n||"");if(WEAPONS[baseOf(n).b])return true;var t=/^(.+) \(thrown\)$/.exec(n);if(t&&WEAPONS[baseOf(t[1]).b])return true;var pm=/\(([^)]+)\)/.exec(n);return !!(pm&&WEAPONS[pm[1]])};
 var newA={};(C.attacks||[]).forEach(function(a){if(a&&a.n)newA[a.n]=1});
 (P.attacks||[]).forEach(function(a){if(!a||!a.n||newA[a.n])return;if(a.n==="Unarmed Strike"||isWep(a.n)||SM[a.n])return;out.attacks.push(a.n)});
 var known={"Luck Points":1,"Hit Dice":1};Object.keys(CLASSES).forEach(function(c){var k=CLASSES[c];(k.res||[]).forEach(function(r){known[r.n]=1});Object.keys(k.resSub||{}).forEach(function(s){(k.resSub[s]||[]).forEach(function(r){known[r.n]=1})})});
 var newR={};(C.res||[]).forEach(function(r){if(r&&r.n)newR[r.n]=1});
 (P.res||[]).forEach(function(r){if(!r||!r.n||newR[r.n])return;if(known[r.n]||/^(Pact Slots|Spell Slots)/.test(r.n))return;out.res.push(r.n)})}catch(e){}return out}

/* RL31: attack row that the sheet shows for a weapon (same die, ability, bonuses). Inside toSheet() the rows built so far are used (ATKC, set
   before the inventory and cleared after it). Outside toSheet() a fresh toSheet() runs. Inside a __inTS guard without ATKC (__itemMeta for an
   old manual sheet): null, so the caller keeps its own numbers and toSheet() is never re-entered */
var ATKC=null;
function atkRowFor(n){var L=ATKC;if(!L){if(window.__inTS)return null;L=toSheet().attacks}for(var i=0;i<L.length;i++)if(L[i].n===n)return L[i];return null}
/* ---------- export to sheet (v3) ---------- */
var ACM=[];/* v27 i2: AC methods of the last toSheet, for the builder */
function toSheet(){
 var c=CL(),L=B.level,TLv=TL(),a=abil(),pb=pbOf(TLv),sp=SPECIES[B.species],custom=B.species==="Custom";
 var spName=custom?(B.cSpecies.name||"Custom species"):B.species;
 var subName=B.sub==="__custom"?(B.cSub||"Homebrew subclass"):B.sub;
 var bg=BACKGROUNDS[B.bg],feats=allFeats();
 var C={v:3,bv:window.__appVer||0,/* v27 RU28: the app version whose builder made this sheet */name:B.name,species:spName+(B.ch.lin?" ("+B.ch.lin.split(" (")[0]+")":""),cls:B.cls,sub:subName||"",bg:B.bg,size:custom?B.cSpecies.size:(sp.size.indexOf("or")>0?(B.size||"Medium"):sp.size),office:"",cardNo:"",level:TLv,hitDie:c.hd,hpPerLevel:hpCalc().list.map(function(e){return {v:e.v,c:e.c,r:e.r,n:e.n}}),abilities:{},rolledNote:"Built with PHB 2024 Builder",saves:{},skills:[],initBonus:[],hpBonus:[],grappler:false};
 ABK.forEach(function(k){C.abilities[k]={base:+B.base[k]||10,bonus:a.src[k].map(function(b){return {s:b.s,v:b.v}})}});
 c.saves.forEach(function(k){C.saves[k]=B.cls+" class ("+SRC+")"});
 if(sp&&sp.saveProf&&!custom)sp.saveProf.forEach(function(k){if(!C.saves[k])C.saves[k]=B.species+" ("+(sp.hb||SRC)+")"});/* v74: species saving throw proficiency (Keldon Human) */
 /* M10: also from a multiclass Monk 14 or Rogue 15 */
 clsParts().forEach(function(q){var mt=q.mc?", multiclass":"";if(q.cls==="Monk"&&q.lv>=14)ABK.forEach(function(k){if(!C.saves[k])C.saves[k]=(R14()?"Diamond Soul":"Disciplined Survivor")+" ("+SRC+", Monk 14"+mt+")"});
  if(q.cls==="Ranger"&&subAt("Ranger","Gloom Stalker")>=7){var imc={Intelligence:"INT",Charisma:"CHA"}[chOf("Ranger","p7opt")],im=!wisElse()&&!C.saves.WIS?"WIS":imc&&!C.saves[imc]?imc:["WIS","INT","CHA"].filter(function(k){return !C.saves[k]})[0];/* v32 RL49 no. 30: the chosen save. Not chosen yet: the first free one, as before */if(im)C.saves[im]="Iron Mind ("+SRC+", Gloom Stalker 7"+mt+")"}/* V17-5 */
  if(q.cls==="Rogue"&&q.lv>=15){(R14()?["WIS"]:["WIS","CHA"]).forEach(function(k){if(!C.saves[k])C.saves[k]="Slippery Mind ("+SRC+", Rogue 15"+mt+")"})}});
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.saveFromAsi&&f.asi&&f.asi.a1)C.saves[f.asi.a1]=f.n+" feat ("+f.s+")"});/* M17: FEATS.saveFromAsi */
 var prof={},exp={};
 function p(n,s){if(n&&!prof[n])prof[n]=s}
 if(bg)bg.sk.forEach(function(n){p(n,B.bg+" background ("+SRC+")")});
 var CHT0=choices();CHT0.forEach(function(ch){var v=B.ch[ch.key];if(ch.t==="skills"&&Array.isArray(v))v.forEach(function(n){p(n,ch.title+", "+ch.src);if(ch.ex)exp[n]=ch.feature+" ("+ch.src+")"/* v63 */});if(ch.t==="exp"&&Array.isArray(v))v.forEach(function(n){exp[n]=ch.src})});
 var SG=subGrant(B.sub);if(SG&&SG.skills)SG.skills.forEach(function(q){if(L>=q[0])p(q[1],B.sub+" "+q[0])});
 if(sp&&sp.skills)sp.skills.forEach(function(n){p(n,B.species+" ("+(sp.hb||SRC)+")")});
 /* v32 RL49: Keen Mind, Observant: proficiency, or Expertise when you have it already. Boon of Skill: every skill */
 CHT0.forEach(function(ch){var v=B.ch[ch.key];if(ch.t==="pe"&&Array.isArray(v))v.forEach(function(n){if(prof[n])exp[n]=ch.feature+" ("+ch.src+")";else p(n,ch.title+", "+ch.src)})});
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.allSk)ALLSK.forEach(function(n){p(n,f.n+" ("+f.s+")")})});XFX.skills(feats,p,prof,exp);/* v62 */
 clsParts().forEach(function(q){var g=typeof SUB_GRANT!=="undefined"&&SUB_GRANT[q.sub];if(g&&g.skills)g.skills.forEach(function(s){if(q.lv>=s[0])p(s[1],g.f+" ("+q.sub+" "+s[0]+")")})});/* v32 */
 ALLSK.forEach(function(n){var o={n:n,ab:SKILLS[n]};if(prof[n]){o.p=1;o.src=prof[n]}if(exp[n]){o.p=2;o.src=(prof[n]||"")+"; Expertise from "+exp[n]}C.skills.push(o)});
 packSkills().forEach(function(s){var o={n:s.n,ab:s.ab,hb:1};if(s.d)o.hbd=s.d;if(prof[s.n]){o.p=1;o.src=prof[s.n]}C.skills.push(o)});
 if(clsLv("Bard")>=2&&Math.floor(pb/2))C.skills.forEach(function(s){if(!s.p){s.misc=(s.misc||0)+Math.floor(pb/2);s.miscSrc=(s.miscSrc?s.miscSrc+"; ":"")+"Jack of All Trades (PHB-2024, Bard 2)"}});/* v35 p07 */XFX.post(C,a);/* v63 */
 var lg=["Common"];if(R14()){var sl0=spX(),bl0=bgX();((sl0&&sl0.lgf)||[]).concat((bl0&&bl0.lgf)||[]).forEach(function(x){if(lg.indexOf(x)<0)lg.push(x)})}langKeys().forEach(function(k){(B.ch[k]||[]).forEach(function(x){if(lg.indexOf(x)<0)lg.push(x)})});if(clsLv("Druid")&&lg.indexOf("Druidic")<0)lg.push("Druidic");if(clsLv("Rogue")&&lg.indexOf("Thieves' Cant")<0)lg.push("Thieves' Cant");XFX.lang(lg);C.lang=lg;/* M10: any class. v62: feat languages */
 /* armor */
 var EA=effArmor(),ESH=effShield(),EW=effWeps(),KIT=kitItems(),EAp=baseOf(EA).p,ar=ARMOR[baseOf(EA).b];
 /* M13: a pact weapon that is not in the inventory is conjured in your hand, so it counts as an active weapon */
 var pactW=pactWeapon(),pactWw=pactW&&WEAPONS[baseOf(pactW).b];if(pactWw&&pactWw.k==="M"&&EW.indexOf(pactW)<0&&!ensureInv().some(function(x){return x.n===pactW}))EW=EW.concat([pactW]);else if(!(pactWw&&pactWw.k==="M"))pactW="";
 /* M6 (RL7): Martial Arts (die, Dexterous Attacks) and Unarmored Movement work only with no armor and no Shield (PHB 2024 p. 101-102).
    RL35 1b: Martial Arts also needs "unarmed or only Monk weapons": an active weapon that is not Simple Melee or Martial Melee Light turns it off.
    Unarmored Movement keeps the armor and Shield check only. M10: Monk level from the main class or a multiclass */
 /* M4 (RL10): Draconic Resilience AC also from a multiclass Sorcerer level 3+. Same place in the AC order as before.
    M17: read from data. CLASSES.*.ua (Unarmored Defense of the main class) and CLASSES.*.acSub[sub] (main class first, then multiclass) */
 var uaM=c.ua&&(c.ua.shield||!ESH)?c.ua:null,acS=null,uaX=null;MCL().forEach(function(m){var u=CLASSES[m.cls].ua;if(u&&(u.shield||!ESH)&&m.lv>=u.l&&!uaX)uaX={u:u,cls:m.cls}});/* M10: multiclass Unarmored Defense, after the old order */[[B.cls,B.sub,L,0]].concat(MCL().map(function(m){return [m.cls,m.sub,m.lv,1]})).forEach(function(q){var s=(CLASSES[q[0]].acSub||{})[q[1]];if(s&&q[2]>=s.l&&!acS)acS={s:s,cls:q[0],lv:q[2],mc:q[3]}});
 var monkLv=clsLv("Monk"),umOn=monkLv>0&&!ar&&!ESH,monkW=function(w,nm){return monkRule(w,nm)};
 var maOn=umOn&&!EW.some(function(n){var w=WEAPONS[baseOf(n).b];return w&&!monkW(w,baseOf(n).b)}),maDie=monkLv?CLASSES.Monk.track["Martial Arts Die"][monkLv-1].replace("d","1d"):"";
 ACM=[];/* v27 i2 */
 if(ar){var mam=null;feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.med3&&ar.cat==="Medium")mam=F});/* v69: Medium Armor Master */var adx=ar.dex;if(mam&&adx==="max2"&&(mam.med3===1||a.sc.DEX>=mam.med3))adx="max3";
  C.ac={base:ar.ac,baseSrc:EA+", "+ar.cat+" armor ("+SRC+")",dex:adx,bonus:[]};if(ar.dis&&!(mam&&mam.medStealth))C.skills.forEach(function(s){if(s.n==="Stealth")s.dis=EA})}
 else{var acC=[];/* v27 i2: the ways to set AC without armor, in the old rule order. B.acMode picks one, empty = the first */if(uaM)acC.push({k:"ua",ac:{base:10,baseSrc:uaM.n+" ("+SRC+", "+B.cls+" "+uaM.l+")",dex:"full",bonus:[{s:ABN[uaM.ab]+" modifier ("+uaM.n+")",v:mod(a.sc[uaM.ab])}]}});
 if(acS)acC.push({k:"acs",ac:{base:acS.s.base||10,baseSrc:acS.s.n+" ("+SRC+(acS.mc?", "+acS.cls+" "+acS.lv+", multiclass":"")+")",dex:"full",bonus:acS.s.ab?[{s:ABN[acS.s.ab]+" modifier ("+acS.s.n+")",v:mod(a.sc[acS.s.ab])}]:[]}});
 if(uaX)acC.push({k:"uax",ac:{base:10,baseSrc:uaX.u.n+" ("+SRC+", "+uaX.cls+" "+uaX.u.l+", multiclass)",dex:"full",bonus:[{s:ABN[uaX.u.ab]+" modifier ("+uaX.u.n+")",v:mod(a.sc[uaX.u.ab])}]}});
 if(sp&&sp.natAc&&!custom)acC.push({k:"nat",ac:{base:sp.natAc.base,baseSrc:"Natural Armor ("+B.species+", "+(sp.hb||SRC)+")",dex:"",bonus:sp.natAc.ab?[{s:ABN[sp.natAc.ab]+" modifier (Natural Armor)",v:mod(a.sc[sp.natAc.ab])}]:[]}});/* v36 p21 */
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.unarmoredAC)acC.push({k:"ft"+f.n,ac:{base:F.unarmoredAC,baseSrc:f.n+" ("+f.s+")",dex:"full",bonus:[]}})});/* v69 */
 acC.push({k:"none",ac:{base:10,baseSrc:"Unarmored",dex:"full",bonus:[]}});var dmA=mod(a.sc.DEX);ACM=acC.map(function(x){return {k:x.k,n:x.ac.baseSrc.replace(" ("+SRC+")","").replace("("+SRC+", ","("),v:x.ac.base+(x.ac.dex==="full"?dmA:0)+x.ac.bonus.reduce(function(t,b){return t+b.v},0)}});
  var pkA=acC.filter(function(x){return x.k===B.acMode})[0];C.ac=JSON.parse(JSON.stringify((pkA||acC[0]).ac));if(pkA&&pkA!==acC[0])C.ac.baseSrc+=", chosen in the builder"}
 /* v19 RL42: Robe of the Archmagi with no armor on: base AC 15 + Dex, used when it beats the base from above */
 if(!ar)activeFx().forEach(function(q){var f=q.fx;if(!f.acBase)return;var cur=C.ac.base+C.ac.bonus.reduce(function(t,b){return t+b.v},0);if(f.acBase>cur)C.ac={base:f.acBase,baseSrc:q.n+" (no armor)",dex:"full",bonus:[]}});
 activeFx().forEach(function(q){if(q.fx.ac&&!q.arm&&q.t!=="Armor")C.ac.bonus.push({s:q.n+" (magic item"+(DMAP[q.n][3]?", attuned":"")+")",v:q.fx.ac})});/* M18 */
 var sbn=[];activeFx().forEach(function(q){if(q.fx.save)sbn.push({s:q.n+" (magic item"+(DMAP[q.n][3]?", attuned":"")+")",v:q.fx.save})});var pal=clsLv("Paladin");if(pal>=6)sbn.push({s:"Aura of Protection (Paladin "+pal+")",v:Math.max(1,mod(a.sc.CHA))});/* RU35 no. 6: you are inside your own aura */
 if(sbn.length)C.saveBonus=sbn;/* M18: new optional C.saveBonus [{s,v}], all saving throws */
 if(attMax()!==3)C.attMax=attMax();/* v19 RL43: optional, missing = 3 */
 (B.inv||[]).forEach(function(x){if(!x.eq)return;if(x.n==="Bracers of Defense"&&!EA&&!ESH)C.ac.bonus.push({s:"Bracers of Defense (no armor or Shield)",v:2})});
 if(ESH)C.ac.bonus.push({s:ESH+" ("+SRC+")",v:2+baseOf(ESH).p});if(EAp)C.ac.bonus.push({s:EA+" (magic bonus)",v:EAp});
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.dwAC&&!ESH&&EW.filter(function(n){var w=WEAPONS[baseOf(n).b];return w&&w.k==="M"}).length>=2)C.ac.bonus.push({s:f.n+" (melee weapon in each hand)",v:1})});/* v69 */
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.ac&&ar)C.ac.bonus.push({s:(F.cat==="F"?"Fighting Style: ":"")+f.n+" ("+f.s+")",v:F.ac})});/* M17: FEATS.ac (with armor) */
 if(sp&&sp.acBonus&&!custom)C.ac.bonus.push({s:sp.acBonus.s,v:sp.acBonus.v});
 {var SFa=spOptFx();if(SFa.acBonus&&!custom&&L>=(SFa.acBonus.l||1))C.ac.bonus.push({s:SFa.acBonus.s,v:SFa.acBonus.v})}/* v74: AC bonus from a species option (Simic Hybrid Carapace) *//* v58: species bonus to AC (Warforged Integrated Protection) */
 /* speed and senses */
 var SFX2=spOptFx(),spd=custom?+B.cSpecies.speed:(SFX2.speedSet||sp.speed),spSrc=spName+" ("+(custom?"homebrew":(sp.hb||SRC))+")";if(SFX2.speed){spd+=SFX2.speed;spSrc+=", +"+SFX2.speed+" Quick"}
 if(clsLv("Barbarian")>=5&&!(ar&&ar.cat==="Heavy")){spd+=10;spSrc+=", +10 Fast Movement"}
 if(umOn&&monkLv>=2){var um=CLASSES.Monk.track["Unarmored Movement"][monkLv-1];spd+=parseInt(um);spSrc+=", "+um+" Unarmored Movement"}
 if(clsLv("Ranger")>=6&&!R14()&&!(ar&&ar.cat==="Heavy")){spd+=10;spSrc+=", +10 Roving"}/* M8 (RL8): not in Heavy armor (PHB 2024 p. 121) */
 clsParts().forEach(function(q){if(q.sub==="Oath of Glory (2014)"&&q.lv>=7){spd+=10;spSrc+=", +10 Aura of Alacrity"}if(q.sub==="Scout"&&q.cls==="Rogue"&&q.lv>=9){spd+=10;spSrc+=", +10 Superior Mobility"}});/* v71 */
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.speed){spd+=F.speed;spSrc+=", +"+F.speed+" "+f.n}});/* M17: FEATS.speed */
 /* M11 (RL8): armor with a Strength score in the armor table cuts Speed by 10 ft when the wearer's Strength is lower (PHB 2024 p. 219) */
 if(ar&&ar.str&&a.sc.STR<ar.str){spd=Math.max(0,spd-10);spSrc+=", \u221210 "+EA+" (needs Str "+ar.str+", yours is "+a.sc.STR+")"}
 C.speed=spd;C.speedSrc=spSrc;if(R14())C.rs="2014";/* v82 */
 var dk=custom?+B.cSpecies.dark:Math.max(sp.dark||0,SFX2.dark||0);/* RL36 d, M17: Drow Darkvision 120 and Wood Elf Speed 35 come from SPECIES.Elf.linFx (spOptFx) */
 /* m4 (RL20): name the source that gives Darkvision: species or pack, plus the pack option or lineage when that raised it */
 var dkOpt="";if(!custom&&(SFX2.dark||0)>(sp.dark||0)){(B.ch.spopt||[]).forEach(function(n){var o=sp.opts&&sp.opts.list.filter(function(x){return x[0]===n})[0];if(o&&o[2].dark&&!dkOpt)dkOpt=n});if(!dkOpt&&sp.linFx&&B.ch.lin)dkOpt=B.ch.lin.split(" (")[0]}
 C.darkvision=dk;C.darkSrc=dk?spName+(dkOpt?", "+dkOpt:"")+" ("+(custom?"homebrew":(sp.hb||SRC))+")":"";
 if(subAt("Barbarian","Path of the Wild Heart")>=6&&chOf("Barbarian","p6opt")==="Owl"){C.darkvision=dk?dk+60:60;C.darkSrc=(C.darkSrc?C.darkSrc+", +60 ":"")+"Aspect of the Wilds (Owl)"}/* v32 RL49 no. 31 */
 /* HP and init */
 C.hpBonus=hpBonusList();/* M4 (RL10): same list as hpCalc() */
 clsParts().forEach(function(q){if((q.sub==="Gloom Stalker"||q.sub==="Gloom Stalker (2014)")&&q.lv>=3&&!C.initBonus.some(function(x){return /^Dread Ambusher/.test(x.s)}))C.initBonus.push({s:"Dread Ambusher: Wisdom modifier (PHB-2024, Gloom Stalker 3)",v:mod(a.sc.WIS)})});/* v35 p06 */clsParts().forEach(function(q){if(q.sub==="Swashbuckler"&&q.cls==="Rogue"&&q.lv>=3&&!C.initBonus.some(function(x){return /^Rakish Audacity/.test(x.s)}))C.initBonus.push({s:"Rakish Audacity (Swashbuckler 3): Charisma modifier",v:mod(a.sc.CHA)})});/* v71 */clsParts().forEach(function(q){if(q.sub==="War Magic"&&q.cls==="Wizard"&&q.lv>=3&&!C.initBonus.some(function(x){return /^Tactical Wit/.test(x.s)}))C.initBonus.push({s:"Tactical Wit (War Magic): Intelligence modifier",v:mod(a.sc.INT)})})
