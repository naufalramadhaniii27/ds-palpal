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
 var AFX=activeFx();AFX.forEach(function(q){var f=q.fx;if(f.abil){var k=f.abil[0],nv=Math.min(f.abil[2]||30,sc[k]+f.abil[1]);if(f.abil[1]<0){nv=Math.max(1,sc[k]+f.abil[1]);if(nv<sc[k]){src[k].push({s:q.n+" (magic item, "+f.abil[1]+")",v:nv-sc[k]});sc[k]=nv}}else if(nv>sc[k]){src[k].push({s:q.n+" (magic item, +"+f.abil[1]+", maximum "+(f.abil[2]||30)+")",v:nv-sc[k]});sc[k]=nv}}});
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
function casterParts(){return clsParts().map(function(q){var c=CLASSES[q.cls],third=isThird3(q.sub)&&q.lv>=3;if(!c.caster&&!c.nslot&&!third)return null;return {cls:q.cls,sub:q.sub,lv:q.lv,mc:q.mc,list:c.caster?q.cls:"Wizard",ab:c.caster?c.cast:"INT",xl:(R14()&&q.cls==="Bard"?xl14(q.sub,q.lv):(c.xlists&&q.lv>=c.xlists.l?c.xlists.lists:[])).concat(dmXl())/* v32: Magical Secrets */}}).filter(Boolean)}
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
   (a "Healer's Kit" added by hand). manualLost(P, C) lists them: entries of the current sheet C (P) that are not builder-made and have no same-name entry in the
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
