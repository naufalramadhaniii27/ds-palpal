/* v36 p11: cards that stand for an attack read To hit and Damage from the attack rows (C.attacks, D.atk) */
function fatkRows(f){ var o=[]; (C.attacks||[]).forEach(function(a,i){ if(!atkOn(a)||!D.atk[i]) return; if(f(a)) o.push({a:a,d:D.atk[i]}); }); return o; }
var FATK={
 "Pole Strike":{p:"Bonus Action",s:"After the Attack action, hit with the other end of your polearm.",f:function(a){ return /^Pole Strike/.test(a.n); }},
 "Reactive Strike":{p:"Reaction",s:"A creature enters your reach. Make one melee attack against it.",f:function(a){ var of=(C.attacks||[]).filter(function(r){ return /^Pole Strike/.test(r.n); }).map(function(r){ return r.of; }); return of.indexOf(a.n)>=0; }},
 "Push":{p:"",s:"When an Unarmed Strike hits during the Attack action, you also push the target 5 ft. Once per turn.",f:function(a){ return a.n==="Unarmed Strike"; }},
 "Enhanced Dual Wielding":{p:"Bonus Action",s:"After attacking with a Light weapon, attack again with a different one-handed melee weapon. No ability modifier on damage unless it is negative.",nomod:1,f:function(a){ return a.n!=="Unarmed Strike"&&!a.act&&atkKind(a)==="melee"&&!/Two-Handed/.test(a.sub||""); }},
 "Charge Attack":{p:"",s:"Move 10 ft straight at a target, then hit it with a melee attack in the Attack action. Add 1d8 damage, or push it up to 10 ft. Once per turn.",k:[{l:"Damage",n:"+1d8"}],m:["Or push the target 10 ft (size up to one larger than you)"]},
 "Flurry of Blows":{p:"Bonus Action",s:"Spend 1 Focus Point to make two Unarmed Strikes.",s14:"Spend 1 ki point to make two Unarmed Strikes.",f:function(a){ return a.n==="Unarmed Strike"; }},
 "Bonus Unarmed Strike":{p:"Bonus Action",s:"After the Attack action with a Monk weapon or Unarmed Strike, make one Unarmed Strike.",f:function(a){ return a.n==="Unarmed Strike"; }}
};
function fatkSum(n){ var F=FATK[n]; if(!F) return null; var rows=F.f?fatkRows(F.f):[], o={p:F.p||"",k:(F.k||[]).slice(),o:[],m:(F.m||[]).slice(),yc:"",rest:(C.rs==="2014"&&F.s14)||F.s,r:[]};
  var dm=function(r){ var t=String(r.d.dmg); return F.nomod?t.replace(/\+\d+$/,""):t; };
  if(rows.length===1){ var r=rows[0]; o.k.unshift({l:"To hit",n:sg(r.d.hit),t:r.a.of||r.a.n},{l:"Damage",n:dm(r),t:r.a.type||""}); }
  else if(rows.length>1) o.r=rows.slice(0,4).map(function(r){ return {w:r.a.of||r.a.n,h:sg(r.d.hit),d:dm(r),t:r.a.type||""}; });
  return o; }
function sumRows(rs){ return '<div class="sum-rows">'+rs.map(function(r){ return '<div class="sum-row"><span class="sum-rn">'+esc(r.w)+'</span><span class="sum-rc"><small>To hit</small><b>'+esc(r.h)+'</b></span><span class="sum-rc"><small>Damage</small><b>'+esc(r.d)+'</b>'+tyIcon(r.t)+'</span></div>'; }).join("")+'</div>'; }
function sumH(o,cl,yc){ return '<div class="sum">'+(o.rest?'<p class="sum-d sum-c">'+featNums(richP(fill(o.rest)),cl)+'</p>':'')+'<div class="sum-ks">'+o.k.map(function(k){ return '<div class="sum-k">'+sumLab(k)+'<span class="sum-n">'+esc(k.n)+(k.t?'<em class="sum-t">'+esc(k.t)+'</em>':'')+'</span></div>'; }).join("")+'</div>'+(o.r&&o.r.length?sumRows(o.r):'')+
  (o.o.length?'<div class="sum-o">'+o.o.map(sumChip).join("")+'</div>':'')+
  (o.m.length?'<div class="sum-m">'+o.m.map(sumFoot).join("")+'</div>':'')+(o.yc?'<p class="sum-d">'+fch(richP(fill(o.yc)))+'</p>':'')+'</div>'; }
/* spell popup: the same blocks from spCalc and the spell row numbers */
function spSum(x){ var sc=scOf(x), rg=spLvRange(x), lv=clamp(spLvSel[x.n]!=null?spLvSel[x.n]:spRowLv(x),rg[0],rg[1]), c=spCalc(x,lv,D.level,sc.mod), o={p:"",k:[],o:[],m:[]}, full=String(x.full||x.sum||"");
  o.p=/^Bonus/.test(x.ct)?"Bonus Action":/^Reaction/.test(x.ct)?"Reaction":/^Action/.test(x.ct)?"Action":"";
  if(x.sv==="ATK") o.k.push({l:"To hit",n:sg(sc.atk)}); else if(x.sv) o.k.push({l:"Save",n:x.sv+" "+sc.dc,ab:x.sv});
  if(c&&c.parts.length){ var p=c.parts[0], ty=String(p.t).split("|"); o.k.push({l:"Damage",n:(c.n>1?c.n+"× ":"")+p.d,t:ty.length>1?"choice":dTxt(ty[0])}); }
  else if(c&&c.heal) o.k.push({l:"Heal",n:c.heal});
  if(!o.k.length) return "";
  if(x.sv&&x.sv!=="ATK"){ var cd=SUM_COND.filter(function(n){ return new RegExp("\\b(has|have|gains?) the "+n+" condition|\\b"+n+" condition").test(full); })[0];
    if(c&&c.parts.length) o.o.push({f:1,t:"full damage"+(cd?", "+cd:"")}); else if(cd) o.o.push({f:1,t:cd});
    if(/half as much damage|half damage/i.test(full)) o.o.push({f:0,t:"half damage"}); }
  if(x.r) o.m.push(String(x.r).replace(/ ft$/," ft")); var fx=spFx(x); if(fx&&fx.area) o.m.push(fx.area[0]+" "+spAreaTxt(fx.area).replace(/\.$/,""));
  return '<div class="sum-sp">'+sumPill(o.p)+sumH(o,"")+'</div>'; }

function aylH(a,cls){ return a?'<p class="fayl"><strong>At your level:</strong> '+featNums(rich(fill(a)),cls)+'.</p>':""; }
function actKind(t){ if(/\bas a Bonus Action\b|^As a Bonus Action|\bBonus Action to\b|\bBonus Action\b,? (?:you|choose)/i.test(t)) return "bonus"; if(/\btake a Reaction\b|\bas a Reaction\b|\bReaction\b to /.test(t)) return "reaction"; if(/\bAs a Magic action\b|\bas a Magic action\b|\bAs an action\b/i.test(t)) return "action"; if(/\bOnce per turn when you hit\b|when you hit a creature/i.test(t)) return "action"; return ""; }
function actItem(x,chip){ var rl=resOf(x.f.n), r=rl[0], cs=aylSplit(shortX(x.f.n,x.g)||x.f.d||x.t,clsOfG(x.g)), so=fatkSum(x.f.n)||sumParse(cs.t);/* v35 p17, v36 p11 */
  return '<div class="aitem"><h4><button type="button" class="tx" data-info="f:'+x.gi+'.'+x.fi+'">'+esc(x.f.n)+'</button>'+(so&&so.p?sumPill(so.p):(chip?' <span class="muted">('+chip+')</span>':''))+(so&&r?resPips(rl):'')+'</h4>'+(so?sumH(so,clsOfG(x.g))+aylH(cs.a,clsOfG(x.g)):'')+(so?'':(function(){ return x.f.full?sumText(cs.t,clsOfG(x.g))+aylH(cs.a,clsOfG(x.g)):foldP(richP(fill(cs.t)),"a:"+x.gi+"."+x.fi,cs.t,!!x.f.full||!!shortX(x.f.n,x.g))+aylH(cs.a,clsOfG(x.g)); })())+(r?resTail(rl,so):'')+'</div>'; }
function spellsBy(re){ return (C.spells||[]).map(function(x,i){return [x,i]}).filter(function(p){return re.test(p[0].ct)}); }
function spLine(ps){ return ps.length?'<h4 class="asub">Spells</h4><div class="aline">'+ps.map(function(p){var x=p[0];return '<button type="button" class="tx" data-info="sp:'+p[1]+'"><i>'+esc(x.n)+'</i></button>'+(x.conc?' <span class="ctag">C</span>':'')+(x.rit?' <span class="ctag rit">R</span>':'')+' <small class="muted">('+(x.l?ordL(x.l).replace(" Level","").toUpperCase():"CANTRIP")+')</small>'}).join("<br>")+'</div>':''; }
function combat(list){ if(x14()) list=list.filter(function(n){ return n!=="Influence"&&n!=="Study"; }).map(x14n);/* v94: 2014 has no Influence or Study action */ var ln=list.map(function(n,i){return '<span class="acx">'+(GLOSS[n]?'<button type="button" class="tx" data-info="g:'+n+'">'+n+'</button>':n)+(i<list.length-1?',':'')+'</span>'}).join(" ");/* v35 p09 *//* v31 C4: a long list folds */
  if(list.length<=3) return '<div class="acomb short"><h4 class="asub">'+ico("act-free","aci")+'Actions in Combat</h4><div class="aline noico">'+ln+'</div></div>';
  var op=!!FOPEN.combat; return '<div class="acomb'+(op?' open':'')+'"><button type="button" class="acomb-t press" data-fmore="combat" aria-expanded="'+op+'">'+ico("act-free","aci")+'<span class="acw"><span class="asub">Actions in Combat</span><small>'+list.length+' actions anyone can take</small></span>'+ico("ui-chev-d","fmi")+'</button><div class="aline noico"'+(op?'':' hidden')+'>'+ln+'</div></div>'; }
/* v32 RL51: actions from C.acts (feats, features, species, invocations, maneuvers, magic items). A feature named in its group's ak list uses only
   C.acts; other features (old sheets, hand-added ones) keep the old text rule. Attack rows with act "bonus" or "reaction" show in that part */
function actFeat(g,n){ var r=null; featAll().some(function(x){ if(x.f.n===n&&(g==null||x.g===g)){ r=x; return true; } return false; }); return r; }
var CMAP={"Actions":"action","Bonus Actions":"bonus","Reactions":"reaction","Other":"other"};
/* v35 p18 (user decision, option A): an On Hit group under Actions. It holds effects used when an attack hits, with no action of their own.
   The book text decides: the first sentences name a hit as the trigger and no Bonus Action, Reaction, or Magic action cost */
var ONHIT_RX=/\b(after your attack roll[^.]{0,60}\bhits\b|after you hit\b|when(?:ever)? you hit\b|if you hit\b|(?:if|when|whenever|each time) (?:an|your|the|that) [^.]{0,90}?\bhits\b|the attack hits\b|whenever your Sneak Attack deals damage)/i;
var ONHIT_NO=/\b(?:take|takes|as|use|using) a (?:Bonus Action|Reaction|Magic action)\b|\bYou can take a Bonus Action\b|\bas part of the Attack action\b|\battack roll misses\b|\bmisses you\b/i;
function actHit(t){ var s=String(t||"").replace(/\*\*[^*]{1,60}\*\*\s*/g,"").replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,function(m,a,b){ return b||a; }), sen=s.split(/(?<=\.)\s+/), f2=sen.slice(0,2).join(" ");
  return ONHIT_RX.test(f2)&&!ONHIT_NO.test(sen[0]||""); }
/* short texts for maneuvers used on a hit (own words, PHB 2024). "(Superiority Die)" becomes the die for the Fighter level */
var MAN_SUM={"Paladin's Smite":"Bonus Action: right after you hit with a melee weapon or an Unarmed Strike, cast Divine Smite. Damage 2d8 Radiant. Add 1d8 against a Fiend or an Undead, and 1d8 per slot level above 1. Free once per Long Rest, then it needs a slot.","Bait and Switch":"Swap places with a willing creature within 5 ft (uses 5 ft of your movement, no Opportunity Attacks). Roll the die. You or that creature adds the result to AC until your next turn starts.","Commander's Strike":"Give up one attack in the Attack action. A willing ally that sees or hears you attacks once with its Reaction and adds the die to damage on a hit. Damage +(Superiority Die).","Feinting Attack":"Bonus Action: feint at a creature within 5 ft. Your next attack roll against it this turn has Advantage, and a hit adds the die to damage. Damage +(Superiority Die).","Lunging Attack":"Bonus Action: take the Dash action. This turn, a melee hit in the Attack action right after moving 5 ft or more in a straight line adds the die. Damage +(Superiority Die).","Rally":"Bonus Action: an ally within 30 ft that sees or hears you gains Temporary Hit Points equal to the die roll plus half your Fighter level (round down).","Riposte":"Reaction: when a creature misses you with a melee attack, strike back with a melee attack and add the die to damage on a hit. Damage +(Superiority Die).","Agonizing Blast":"Level 2+. Pick a Warlock damage cantrip you know. Add your Charisma modifier to its damage. Repeatable with a different cantrip.","Eldritch Smite":"Level 5+, Pact of the Blade. When your pact weapon hits, once per turn, expend a Pact Magic slot: +1d8 Force plus 1d8 per slot level. Huge or smaller: you can knock it Prone.","Eldritch Spear":"Level 2+. Pick a Warlock damage cantrip with range 10 ft or more. Add 30 ft of range per Warlock level. Repeatable with a different cantrip.","Fiendish Vigor":"Level 2+. Cast False Life on yourself with no slot. Skip the roll and take the highest Temporary Hit Points the die can give.","Gaze of Two Minds":"Level 5+. Bonus Action: touch a willing creature and perceive through its senses until the end of your next turn. Renew each turn with a Bonus Action. You gain its special senses. Within 60 ft you can cast spells from its space.","Gift of the Depths":"Level 5+. Your Speed is also your Swim Speed, and you breathe underwater. Cast Water Breathing once per Long Rest with no slot.","Gift of the Protectors":"Level 9+, Pact of the Tome. Creatures can sign your Book of Shadows page, up to your Charisma modifier (min 1). A signer dropped to 0 HP (not killed outright) stays at 1 HP. Once per Long Rest. A Magic action erases a name.","Investment of the Chain Master":"Level 5+, Pact of the Chain. Your Find Familiar familiar gets a 40 ft Fly or Swim Speed, a Bonus Action to command Attack, Necrotic or Radiant damage, your spell save DC, and a Reaction to give it Resistance to damage it takes.","Lessons of the First Ones":"Level 2+. Gain one Origin feat of your choice. Repeatable with a different feat.","Lifedrinker":"Level 9+, Pact of the Blade. When your pact weapon hits, once per turn: +1d6 Necrotic, Psychic, or Radiant. You can also spend a Hit Point Die and regain HP equal to the roll plus Constitution modifier (min 1).","Pact of the Blade":"Bonus Action: conjure a pact weapon (any Simple or Martial Melee weapon) or bond with a magic weapon. You are proficient with it, it is a Spellcasting Focus, and you can use Charisma for its attack and damage. Damage can be Necrotic, Psychic, or Radiant.","Pact of the Chain":"Know Find Familiar and cast it as a Magic action with no slot, with special forms such as Imp, Pseudodragon, Quasit, Sprite, or Venomous Snake. Give up one of your attacks so the familiar attacks with its Reaction.","Pact of the Tome":"After a Short or Long Rest, conjure a Book of Shadows with three cantrips and two level 1 Ritual spells from any class list. They are prepared Warlock spells for you. The book is your Spellcasting Focus.","Repelling Blast":"Level 2+. Pick a Warlock cantrip that needs an attack roll. When it hits a Large or smaller creature, push it up to 10 ft straight away from you. Repeatable with a different cantrip.","Thirsting Blade":"Level 5+, Pact of the Blade. Extra Attack with your pact weapon: two attacks per Attack action.","Careful Spell":"Cost: 1 Sorcery Point. When a spell forces saves, pick up to your Charisma modifier (min 1) creatures. They succeed automatically, and take no damage if they would take half on a success.","Empowered Spell":"Cost: 1 Sorcery Point. Reroll up to your Charisma modifier (min 1) of a spell's damage dice and use the new rolls. Works with another Metamagic option on the same spell.","Extended Spell":"Cost: 1 Sorcery Point. Double the duration of a spell that lasts 1 minute or longer, up to 24 hours. You have Advantage on saves to keep Concentration on it.","Quickened Spell":"Cost: 2 Sorcery Points. Cast a spell with an Action casting time as a Bonus Action. Not if you already cast a level 1+ spell this turn, and no level 1+ spell after it this turn.","Seeking Spell":"Cost: 1 Sorcery Point. Reroll a missed spell attack roll and use the new d20. Works with another Metamagic option on the same spell.","Subtle Spell":"Cost: 1 Sorcery Point. Cast a spell with no Verbal, Somatic, or Material components. Material components that are consumed or have a cost are still required.","Trip Attack":"Add the die to damage and try to knock the target down. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: Prone. Large or smaller. Weapon or Unarmed Strike.",
 "Pushing Attack":"Add the die to damage and drive the target back. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: pushed up to 15 ft away. Large or smaller. Weapon or Unarmed Strike.",
 "Disarming Attack":"Add the die to damage and try to disarm the target. Damage +(Superiority Die). Target STR save (DC 8 + PB + STR or DEX). Fail: drops one held object you choose.",
 "Goading Attack":"Add the die to damage and goad the target into attacking you until the end of your next turn. Damage +(Superiority Die). Target WIS save (DC 8 + PB + STR or DEX). Fail: Disadvantage vs others.",
 "Menacing Attack":"Add the die to damage and try to frighten the target. Damage +(Superiority Die). Target WIS save (DC 8 + PB + STR or DEX). Fail: Frightened until the end of your next turn.",
 "Distracting Strike":"Add the die to damage and leave the target open. Damage +(Superiority Die). The next attack roll by someone else against it before your next turn has Advantage.",
 "Maneuvering Attack":"Add the die to damage and move an ally. Damage +(Superiority Die). A willing ally who sees or hears you uses its Reaction to move up to half its Speed without provoking the target.",
 "Sweeping Attack":"Hit a second creature within your reach and 5 ft of the first target, if the original roll would hit it. Damage (Superiority Die), same damage type. Melee, weapon or Unarmed Strike."};

function actSplit(feats){ var kinds={action:[],onhit:[],bonus:[],reaction:[],other:[]}, ak={}, ents=Array.isArray(C.acts)?C.acts:[];
  (C.features||[]).forEach(function(g){ (Array.isArray(g.ak)?g.ak:[]).forEach(function(n){ ak[g.g+"|"+n]=1; }); });
  feats.forEach(function(x){ if(/^Background/.test(x.g)) return; var hasRes=resOf(x.f.n).length>0;
    if(ak[x.g+"|"+x.f.n]){ var mine=ents.filter(function(e){ return !e.it&&e.f===x.f.n&&e.g===x.g; }); mine.forEach(function(e){ if(kinds[e.k]) kinds[e.k].push({e:e,x:x}); }); if(!mine.length&&hasRes) kinds.other.push({x:x}); return; }
    var hw=(C.actions||[]).filter(function(a){ return a.n===x.f.n&&CMAP[a.c]; })[0]; if(hw){ kinds[CMAP[hw.c]].push({x:x}); return; }/* a hand-written entry of the same name sets the category */
    var k=actKind(x.t); if(k) kinds[k].push({x:x}); else if(hasRes) kinds.other.push({x:x}); });
  ents.forEach(function(e){ if(!e.it||!kinds[e.k]) return; var i=eqInvOf(e.it); if(i&&!eqOn(i)) return; kinds[e.k].push({e:e}); });
  /* v35 p18: On Hit. Effects already listed under Action or Other move when their text says a hit triggers them; class, subclass, species and
     feat features with no group yet join when the text says the same */
  ["action","other"].forEach(function(k){ kinds[k]=kinds[k].filter(function(o){ if(o.e&&o.e.it) return true; var t=o.e?(o.e.d!=null?o.e.d:(o.x?o.x.t:"")):o.x.t; if(actHit(t)){ kinds.onhit.push(o); return false; } return true; }); });
  var seen={}; ["action","onhit","bonus","reaction","other"].forEach(function(k){ kinds[k].forEach(function(o){ if(o.x) seen[o.x.gi+"."+o.x.fi]=1; }); });
  feats.forEach(function(x){ if(/^Background/.test(x.g)||seen[x.gi+"."+x.fi]||ak[x.g+"|"+x.f.n]) return; if(actHit(x.t)) kinds.onhit.push({x:x}); });
  return kinds; }
function actEnt(e,x,chip){ var rl=resOf(e.it?e.n:e.f); if(e.u) resOf(e.u).forEach(function(r){ if(!rl.some(function(q){ return q.k===r.k; })) rl.push(r); });
  if(e.it){ var ix=(C.inv||[]).findIndex(function(i){ return (i.key||i.n)===e.it; });
    return '<div class="aitem" data-act="'+e.k+'"><h4>'+(ix>=0?'<button type="button" class="tx" data-info="it:'+ix+'">'+esc(e.n)+'</button>':esc(e.n))+' <span class="muted">(Magic item)</span></h4>'+(e.d?foldP(rich(fill(e.d)),"ai:"+e.k+":"+e.n,e.d):'')+(rl.length?resBoxes(rl):'')+'</div>'; }
  var t=e.d!=null?e.d:(x?(x.f.d||x.t):""), same=e.n===e.f, ay="", sx=0; if(e.d==null&&x){ var cs=aylSplit(t,clsOfG(x.g)); t=cs.t; ay=aylH(cs.a,clsOfG(x.g)); }/* v35 p15 */ var so=(e.d==null&&x)?sumParse(t):null;/* v35 p17 */ if(x&&(e.f==="Maneuvers known"||shortX(e.n,x.g))&&MAN_SUM[e.n]){ t=aylSplit(MAN_SUM[e.n],clsOfG(x.g)).t; so=sumParse(t); sx=1; }/* v35 p18 */ if(x&&FATK[e.n]) so=fatkSum(e.n);/* v36 p11 */
  return '<div class="aitem" data-act="'+e.k+'"><h4>'+(x?'<button type="button" class="tx" data-info="f:'+x.gi+'.'+x.fi+'">'+esc(e.n)+'</button>':esc(e.n))+(!same?(e.f==="Maneuvers known"?'':' <span class="muted">('+esc(e.f)+')</span>'):(chip&&!(so&&so.p)?' <span class="muted">('+chip+')</span>':''))+sumPill(so&&so.p)+(so&&rl.length&&e.f!=="Maneuvers known"?resPips(rl):'')+'</h4>'+(so?sumH(so,clsOfG(x.g)):(e.d==null&&x&&x.f.full)?sumText(t,clsOfG(x.g)):foldP(richP(fill(t)),same&&x?"a:"+x.gi+"."+x.fi:"ae:"+e.f+":"+e.n,t,!!(sx||(e.d==null&&x&&x.f.full))))+ay+(e.f==="Maneuvers known"&&rl.length?manCost(rl):(rl.length?resTail(rl,so):''))+'</div>'; }
function actOne(o,chip){ return o.e?actEnt(o.e,o.x,chip):actItem(o.x,chip); }
/* hand-written C.actions entries of a category (the editor offers all four). Entries that repeat a feature, the Opportunity Attack line, or the spell list are left out */
var ACT_STD=["Attack","Dash","Disengage","Dodge","Grapple","Help","Hide","Improvise","Influence","Magic","Ready","Search","Shove","Study","Utilize","Opportunity Attack","Two-Weapon Fighting","Interact with an Object"];
function actStdList(a){ var p=String(a.n||"").split(/\s*,\s*/); return p.length>1&&p.every(function(x){ return ACT_STD.indexOf(x)>=0; }); }/* v35 p09: shown in Actions in Combat */
function actPlain(c,feats){ return (C.actions||[]).filter(function(a){ return (a.c||"")===c&&actOn(a)&&!actStdList(a)&&!feats.some(function(x){return x.f.n===a.n})&&!(c==="Reactions"&&a.n==="Opportunity Attack")&&!(a.n==="Spells"&&/casting time$/.test(a.t||"")); }).map(function(a){return '<div class="aitem"><h4>'+esc(a.n)+'</h4>'+foldP(rich(fill(a.d)),"c:"+a.n,a.d)+'</div>'}).join(""); }
function renderActions(){
  var feats=featAll(), kinds=actSplit(feats);
  var apa=1; feats.forEach(function(x){ if(x.f.n==="Extra Attack") apa=Math.max(apa,2); if(x.f.n==="Two Extra Attacks") apa=Math.max(apa,3); if(x.f.n==="Three Extra Attacks") apa=Math.max(apa,4); if(x.f.n==="Extra Attack (2)") apa=Math.max(apa,3); if(x.f.n==="Extra Attack (3)") apa=Math.max(apa,4); if(x.f.n==="Thirsting Blade") apa=Math.max(apa,2); if(x.f.n==="Devouring Blade") apa=Math.max(apa,3); });
  var aprIco=function(t){ return ico(/Ammunition/i.test(t)?"item-ammo":/Two-Handed|Versatile/i.test(t)?"ui-hand":/Reach|Thrown/i.test(t)?"ui-range":/Heavy/i.test(t)?"ui-weight":/Bonus Action/i.test(t)?"time-bonus":/Loading/i.test(t)?"ui-pause":/Finesse|Light/i.test(t)?"item-weapon":"ui-info","apr-i"); };/* v36 p12 */
  var aprChips=function(a){ var L=String(a.sub||"").split(/\s*[,\u2022]\s*/).filter(Boolean).map(function(t){ return '<span class="apc">'+aprIco(t)+'<span>'+esc(t)+'</span></span>'; }); if(a.m) L.push('<span class="apc ap-m">'+ico("item-weapon","apr-i")+'<span>Mastery: '+esc(a.m)+'</span></span>'); var amq=ammoBonus(a); if(amq) L.push(amq.on?'<span class="apc ap-m"><span>'+sg(amq.on.n)+' ammo</span></span>':((S.ammoAct||{})[amq.kd]==="none"?'<span class="apc"><span>No magic ammo</span></span>':'<span class="apc ap-w"><span>Pick ammo</span></span>'));/* v102 */ return L.length?'<span class="apr">'+L.join("")+'</span>':""; };
  var atkRow=function(a,i){ var d=D.atk[i];
    return '<div class="arow"'+(a.act?' data-act="'+esc(a.act)+'"':'')+'><div class="an">'+akIcon(atkKind(a))+'<button type="button" class="tx" data-info="w:'+i+'">'+esc(cuNm("a:"+a.n,a.n))+'</button>'+aprChips(a)+cfFlags(sitAtk(a))+'<span class="arng">'+ico("ui-range","apr-i")+esc(a.range||"--")+'</span></div><button type="button" class="abox bd" data-bd="ah-'+i+'">'+sg(d.hit)+'</button><button type="button" class="abox wide bd" data-bd="ad-'+i+'">'+esc(d.dmg)+'<small>'+tyIcon(a.type)+esc(a.type||"")+'</small></button></div>'; };
  var rowsOf=function(act){ return (C.attacks||[]).map(function(a,i){ if(!atkOn(a)) return ""; if(act!=="*"&&(a.act||"")!==act) return ""; return atkRow(a,i); }).join(""); };
  var AH='<div class="ahead"><span>Range</span><span>Hit/DC</span><span>Damage</span></div>';
  var rows=rowsOf(actF==="attack"?"*":"")+
    (C.xdmg||[]).map(function(x,i){ return '<div class="arow xd"><div class="an">'+akIcon("feature")+'<button type="button" class="tx" data-info="xd:'+i+'">'+esc(String(x.n).replace(/ \([^)]*\)$/,""))+'</button>'+(/ \([^)]*\)$/.test(x.n)?'<span class="muted anp">'+esc(/ (\([^)]*\))$/.exec(x.n)[1])+'</span>':'')+'<small>'+esc(String(x.sub||"").toUpperCase().slice(0,40))+'</small><span class="arng">--</span></div><span class="abox">'+(x.save?esc(x.save)+'<small>'+x.dc+'</small>':'--')+'</span><span class="abox wide">'+esc(x.dmg)+tyIcon(x.type)+'<small>'+esc(x.type)+'</small></span></div>'; }).join("");/* RU35 no. 5 */
  var tabs='<div class="ifil">'+[["all","All"],["attack","Attack"],["action","Action"],["onhit","On Hit"],["bonus","Bonus Action"],["reaction","Reaction"],["other","Other"],["limited","Limited Use"]].map(function(f){return '<button type="button" class="ifb'+(actF===f[0]?' on':'')+'" data-actf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
  var show=function(k){return actF==="all"||actF===k};
  var h=tabs, bRows=rowsOf("bonus"), rRows=rowsOf("reaction");
  h+=noActH();/* v22 RU53 */
  if(show("attack")||show("action")) h+=sitCardH();/* v103 */
  if(show("attack")||show("action")) h+='<h3 class="fcat">Actions <span class="apa">• Attacks per Action: '+apa+'</span></h3>'+AH+rows+saveCantripRows()+modeXdRows()+sitDiceRows();/* v22 RU43, RU56 */
  if(show("action")) h+=combat(["Attack","Dash","Disengage","Dodge","Grapple","Help","Hide","Improvise","Influence","Magic","Ready","Search","Shove","Study","Utilize"])+kinds.action.map(function(o){return actOne(o,"")}).join("")+actPlain("Actions",feats);
  if(show("onhit")&&kinds.onhit.length) h+='<h3 class="fcat fcat-onhit">On Hit</h3><div class="aonhit">'+kinds.onhit.map(function(o){return actOne(o,"")}).join("")+'</div>';/* v35 p18 */
  if(show("bonus")) h+='<h3 class="fcat">Bonus Actions</h3>'+(bRows?AH+bRows:'')+((C.attacks||[]).some(function(a){return atkOn(a)&&/Light/.test(a.sub||"")})?combat(["Two-Weapon Fighting"]):'')+spLine(spellsBy(/^Bonus/))+kinds.bonus.map(function(o){return actOne(o,"1 Bonus Action")}).join("")+actPlain("Bonus Actions",feats);
  if(show("reaction")) h+='<h3 class="fcat">Reactions</h3>'+(rRows?AH+rRows:'')+combat(["Opportunity Attack"])+spLine(spellsBy(/^Reaction/))+kinds.reaction.map(function(o){return actOne(o,"1 Reaction")}).join("")+actPlain("Reactions",feats);
  if(show("other")) h+='<h3 class="fcat">Other</h3>'+combat(["Interact with an Object"])+spLine(spellsBy(/minute|hour|Ritual/i))+kinds.other.map(function(o){return actOne(o,"Special")}).join("")+actPlain("Other",feats);
  if(show("limited")||actF==="all") h+=(D.res.length?'<h3 class="fcat">Limited Use</h3><div class="lu" id="lu">'+D.res.map(function(r){ var rsp=resSpec(r); return '<div class="rs"><div class="rs-h"><b>'+(rsp?'<button type="button" class="tx" data-info="'+esc(rsp)+'">'+esc(r.n)+'</button>':esc(r.n))+'</b><span>'+esc(r.tag)+'</span></div><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div><div class="sub" id="sub-'+r.k+'">'+luSub(r)+'</div></div>'; }).join("")+'</div><div class="rests"><button class="btn press" type="button" data-rest="short">Short Rest</button><button class="btn press" type="button" data-rest="long">Long Rest</button></div>':'');
  $("#actBody").innerHTML=h;
}
function syncLU(){
  D.res.forEach(function(r){
    /* RU39: each box knows its own position (data-i). #lu sits inside #actBody, so a running index over the three areas was wrong */
    $$('#lu .bx[data-k="'+r.k+'"], #featBody .bx[data-k="'+r.k+'"], #actBody .bx[data-k="'+r.k+'"], #spBody .bx[data-k="'+r.k+'"], #sheetBody .bx[data-k="'+r.k+'"]').forEach(function(b){ b.setAttribute("aria-pressed", (+b.getAttribute("data-i"))<used(r.k,r.max)); });
    var el=document.getElementById("sub-"+r.k); if(el) el.textContent=luSub(r); $$('.supd[data-k="'+r.k+'"] b').forEach(function(b){ b.textContent=r.max-used(r.k,r.max); });/* v36 p10 */
    if(r.pool) $$('.pli[data-k="'+r.k+'"]').forEach(function(x){ if(document.activeElement!==x) x.value=r.max-used(r.k,r.max); });
  });
}
var invF="all";
function renderInv(){
  (C.inv||[]).forEach(function(i){ if(i.type==null&&window.__itemMeta){ var mt=window.__itemMeta(i.n); if(mt){ i.type=mt.type; if(i.cost==null) i.cost=mt.cost; i.equippable=mt.equippable; i.html=i.html||mt.html; if(mt.att) i.att=1; if(mt.equippable) i.gear=1; } else i.type="Gear"; } });
  /* RU35 no. 8: weight counts container rules (a magic container weighs the same full or empty) */
  var L=C.inv||[], total=invWeight(), enc=setOf("enc")==="off"?"WEIGHT NOT TRACKED":total>D.carry?"ENCUMBERED":"UNENCUMBERED", cz=coinsNow();
  var head='<div class="ihero"><div class="iwt" role="button" tabindex="0" data-info="g:Carrying Capacity" aria-label="Weight carried, open Carrying Capacity"><b>'+fmtW(total)+'</b> <small>lb.</small><span>'+enc+'</span></div>'+coinStrip(cz)+(L.length?'<button type="button" class="ibtn" data-invman="1">'+ico("tab-inventory","ibt")+'Manage Inventory</button>':'')+'</div>';/* v31 RU123, C6 */
  var fil='<div class="ifil">'+[["all","All"],["equip","Equipment"],["att","Attunement"],["other","Other Possessions"]].map(function(f){return '<button type="button" class="ifb'+(invF===f[0]?' on':'')+'" data-invf="'+f[0]+'">'+f[1]+'</button>'}).join('')+'</div>';
  var keep=function(i){ if(invF==="equip")return i.gear; if(invF==="att")return i.att; if(invF==="other")return !(i.gear||i.att); return true; };
  var row=function(i,ix,sub){ var q=num(i.q,1), w=num(i.w,0), rc=i.rar?' r-'+i.rar.toLowerCase().replace(/\s+/g,''):'', ct=ctOf(i.n), ww=ct&&ct[2]!=null?ct[2]:w;
    return '<div class="irow'+(sub?' isub':'')+'"><span class="iact">'+(i.equippable?'<button type="button" class="ichk'+(eqOn(i)?' on':'')+'" data-ieqs="'+esc(i.key||i.n)+'" data-iix="'+ix+'" aria-label="Toggle '+esc(i.n)+'"></button>':'<span class="muted">--</span>')+'</span><button type="button" class="iname" data-info="it:'+ix+'"><b class="'+rc+'">'+esc(cuNm("i:"+invKey(i),i.n))+'</b><small>'+esc((i.type||"Gear").toUpperCase())+(i.rar?' \u2022 '+esc(i.rar.toUpperCase()):'')+(ct?' \u2022 CONTAINER':'')+'</small><span>'+(ww?fmtW(ww)+' lb.':'--')+'</span></button><span class="iq">'+q+'</span><span class="ic">'+(i.cost!=null?i.cost:'--')+'</span></div>'; };
  var byK={}; L.forEach(function(i){ byK[invKey(i)]=i; });
  var inCt=function(i){ var p=i.in&&byK[i.in]; return p&&p!==i&&ctOf(p.n)?p:null; };
  var att=L.map(function(i,ix){return [i,ix]}).filter(function(p){ return p[0].att&&eqOn(p[0]); }), need=L.map(function(i,ix){return [i,ix]}).filter(function(p){ return p[0].att&&!eqOn(p[0]); });
  var attH="";
  if(L.some(function(i){return i.att})&&(invF==="all"||invF==="att")){
    var aM=attMaxC(); attH='<div class="ieq"><b>Attuned Items</b><span>'+Math.min(aM,att.length)+'/'+aM+'</span></div><div class="islots">'+[0,1,2,3].slice(0,aM).map(function(n){ var p=att[n]; return p?'<button type="button" class="islot on" data-info="it:'+p[1]+'"><b>'+esc(p[0].n)+'</b></button>':'<span class="islot">Empty slot</span>'; }).join("")+'</div>'+
      (att.length>aM?'<div class="caution">\u26a0 You are attuned to more than '+aM+' magic items. Only the first '+aM+' in the list work. Unattune the others.</div>':'');
    if(invF==="att") attH+='<div class="ieq"><b>Items Requiring Attunement</b><span>'+need.length+'</span></div>'+(need.length?'<div class="ihead"><span></span><span>Weight</span><span>Qty</span><span>Cost (GP)</span></div>'+need.map(function(p){return row(p[0],p[1])}).join(""):'<p class="muted dnone">Every item that needs attunement is attuned.</p>');
  }
  var body="";
  if(invF!=="att"){
    var main=L.map(function(i,ix){return [i,ix]}).filter(function(p){ return !inCt(p[0])&&keep(p[0]); });
    body='<div class="ieq"><b>Equipment ('+L.filter(function(i){return !inCt(i)}).length+')</b><span>'+fmtW(L.filter(function(i){return !inCt(i)}).reduce(function(t,i){return t+itemW(i)},0))+' lb.</span></div><div class="ihead"><span></span><span>Weight</span><span>Qty</span><span>Cost (GP)</span></div>'+main.map(function(p){return row(p[0],p[1])}).join("");
    L.forEach(function(c,cx){ var ct=ctOf(c.n); if(!ct) return; var inner=L.map(function(i,ix){return [i,ix]}).filter(function(p){ return inCt(p[0])===c; }); if(!inner.length) return;
      var ld=ctLoad(c), cap=ctCap(c,ct), sh=inner.filter(function(p){return keep(p[0])});
      var ck=invKey(c), op=!ctShut[ck];/* v32 RU134: a container section opens and closes */
      body+='<button type="button" class="ieq ict" data-ctog="'+esc(ck)+'" aria-expanded="'+op+'" aria-label="'+esc(cuNm("i:"+ck,c.n))+', '+inner.length+' item'+(inner.length>1?'s':'')+', '+(op?'close':'open')+'"><b>'+esc(cuNm("i:"+ck,c.n))+'</b><span class="ictn">'+inner.length+' item'+(inner.length>1?'s':'')+'</span><span class="ictw'+(cap&&ld>cap?' over':'')+'">'+fmtW(ld)+(cap?' / '+cap:'')+' lb.'+(ct[2]!=null?' \u2022 counts as '+fmtW(ct[2])+' lb.':'')+'</span>'+CHEV+'</button>'+(cap&&ld>cap?'<div class="caution">\u26a0 Over capacity. This container holds up to '+cap+' lb.</div>':'')+(op?sh.map(function(p){return row(p[0],p[1],1)}).join(""):''); });
  }
  if(!L.length){ fil=""; attH=""; body='<div class="empty-note empty-st">'+ico("tab-inventory","es-i")+'<b>No items yet</b><span>Buy or add weapons, armor, and gear. Your coins stay above.</span><button type="button" class="btn pri press" data-invman="1">'+ico("tab-inventory","ibt")+'Manage Inventory</button></div>'; }/* v31 C6 */
  $("#invBody").innerHTML=head+fil+attH+body+(C.equipNote?'<p class="next inote">'+ico("item-gear")+'<span>'+esc(C.equipNote).replace(/\. (?=[A-Z])/g,".<br>")+'</span></p>':'')/* v33 p05 (F2) */;
}
var CHEV='<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
var featQ="",featF="all";
function featCat(g){ if(/^Species/.test(g)) return "species"; if(/^Feats/.test(g)) return "feats"; if(/^Background/.test(g)) return "bg"; return "class"; }
function actChip(t){ return /\bBonus Action\b/.test(t)?"1 Bonus Action":/\bReaction\b/.test(t)?"1 Reaction":/\bMagic action\b|\bas an action\b|\bUtilize action\b/i.test(t)?"1 Action":""; }
function renderFeat(){
  var q=featQ.toLowerCase(), groups=(C.features||[]);
  var head='<div class="fsearch"><input id="featQ" type="search" placeholder="Search in Features" value="'+esc(featQ)+'"></div><div class="ifil">'+[["all","All"],["class","Class Features"],["species","Species Traits"],["feats","Feats"],["bg","Background"]].map(function(f){return '<button type="button" class="ifb'+(featF===f[0]?' on':'')+'" data-featf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
  var order=[["class","Class Features"],["species","Species Traits"],["feats","Feats"],["bg","Background"]], h="";
  order.forEach(function(o){
    if(featF!=="all"&&featF!==o[0]) return;
    var body=groups.map(function(g,gi){ if(featCat(g.g)!==o[0]) return "";
      var items=(g.items||[]).map(function(f,fi){
        var txt=f.full||f.d||"", hay=(f.n+" "+(f.d||"")+" "+(f.full||"")).toLowerCase(); if(q&&hay.indexOf(q)<0) return ""; var cs=aylSplit(shortX(f.n,g.g)||f.d||f.full||"",clsOfG(g.g)), so=q?null:sumParse(cs.t);/* v35 p15, p17 */
        var rl=resOf(f.n), r=rl[0], chip=actChip(txt);
        var from=(/^Feats/.test(g.g)&&f.s)?'<div class="ffrom">From <b>'+esc((f.s.match(/\(([^)]+)\)\s*$/)||[0,f.s])[1].replace(/,? ?Versatile/,""))+'</b> <span class="fsrc">\u2022 '+esc(srcPg(f.s.split(",")[0],pgGuess(g,f)))+'</span></div>':'';
        return '<div class="fitem"><h4><button type="button" class="tx" data-info="f:'+gi+'.'+fi+'">'+esc(f.n)+'</button>'+(from?'':'<span class="fsrc"> \u2022 '+esc(srcPg(f.s,pgGuess(g,f)))+'</span>')+sumPill(so&&so.p)+'</h4>'+from+(so?sumH(so,clsOfG(g.g)):f.full&&!q?sumText(cs.t,clsOfG(g.g)):foldP(fch(featNums(richP(fill(cs.t)),clsOfG(g.g))),"f:"+gi+"."+fi,cs.t,!!q||!!f.full||!!shortX(f.n,g.g)))+aylH(cs.a,clsOfG(g.g))+featSpL(g,f)+
          ((chip||r)?'<div class="fsub">'+(chip?'<div><b>'+esc(f.n)+'</b> <span class="muted">('+chip+')</span></div>':'')+(r?resBoxes(rl):'')+'</div>':'')+'</div>';
      }).join("");
      if(!items) return "";
      if(g.g==="Eldritch Invocations") return '<div class="fnest">'+items+'</div>';
      return (o[0]==="class"?'<h3 class="fgh">'+esc(gName(g.g))+'</h3>':'')+items;
    }).join("");
    if(body) h+='<h3 class="fcat">'+o[1]+(o[0]==="feats"&&C.cls?'<button type="button" class="btn press fmanb" data-bldgo="class">Manage Feats</button>':'')+'</h3>'+body;/* v23 RU38 no. 4 */
  });
  if(!h) h='<p class="empty-note">No features match your search.</p>';
  $("#featBody").innerHTML=head+h;
}
function renderNotes(){/* v23 RU36 no. 9, RU38 no. 5: Notes like D&D Beyond. Background and Characteristics are on the Description tab */
  var nf=function(k){ return NOTE_FIELDS.filter(function(f){ return f.k===k; })[0]; };
  var html='<h3 class="noteh">Notes</h3><div class="nsecs">'+NOTE_MORE.map(noteSec).join("")+noteSec(nf("backstory"))+noteSec({k:"other",l:"Other",h:"Anything else worth keeping",rows:3})+noteSec(nf("session"))+'</div>';/* v31 B9 */
  html += jrnH();/* v22 RU70 */
  html += '<div class="saved">Saved on this device as you type.</div>';
  $("#notesBody").innerHTML = html; renderDesc();
}

