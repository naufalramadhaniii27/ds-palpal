import {pluvennGrappleclawsProblems,pluvennUnarmedRole} from '../data/lib/pluvenn-grappleclaws.js';
import {dieAvg,weaponFormMetadata,weaponRowAllowed} from "./01-logic-core-helpers.js";
import {featDef,masteryText,weaponDef} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
import {defineLocals} from "./12b-logic-sheet-schema.js";
/* Sheet handlers, part 6 (contract in 12a-logic-sheet-registry.js): attack rows (phase "attacks"): the Unarmed Strike row, then one row per active
   weapon. The weapon rows are built by a loop of handlers (scope "each" over l.EW, loop "weapon-rows"): each handler adds its part to l.wrow, the row
   being built for the weapon in ctx.p, and the last ones push it. A weapon that is not in the weapon table has no l.wrow and the rest skip it.
   l.ud / l.udSrc the Unarmed Strike die and its source, l.maOff active weapons that are not Monk weapons, l.fsb / l.fss Fighting Style bonuses and
   their source text, l.duelOn Dueling applies, l.hasGWF / l.hasTWF the two styles that only add a note. */
defineLocals({ud:"string",udSrc:"string",maOff:"array",fsb:"object",fss:"object",duelOn:"boolean",hasGWF:"boolean",hasTWF:"boolean",wrow:"object?"});
/* A conjured Pact fallback must meet the same native wield minimum before
   Monk, dual-wield and fighting-style state reads the active weapon list. */
registerSheetGroup({id:"weapon-wield-minimum",group:"gear",phase:"gear",order:15,reads:["i.wieldScores","l.EW","q.baseOf"],writes:["l.EW"],
 run:function(ctx){ctx.l.EW=ctx.l.EW.filter(name=>weaponRowAllowed(ctx.q.baseOf(name).mi||name,ctx.i.wieldScores));return ctx.patch()}});
registerSheetGroup({id:"attacks-init",group:"attacks",phase:"attacks",order:5,reads:[],writes:["C.attacks"],run:function(ctx){ctx.C.attacks=[];return ctx.patch()}});
registerSheetGroup({id:"unarmed-base",group:"unarmed",phase:"attacks",order:10,reads:["i.SRC"],writes:["l.ud","l.udSrc"],run:function(ctx){ctx.l.ud="1";ctx.l.udSrc="Unarmed Strike ("+ctx.i.SRC+")";return ctx.patch()}});
registerSheetRule({id:"monk-martial-arts-die",group:"unarmed",about:"Monk: the Unarmed Strike uses the Martial Arts die",phase:"attacks",order:11,reads:["i.SRC","l.maOn","l.maDie"],writes:["l.ud","l.udSrc"],
 run:function(ctx){const l=ctx.l;if(l.maOn){l.ud=l.maDie;l.udSrc="Martial Arts ("+ctx.i.SRC+", Monk)"}return ctx.patch()}});
/* m2 (RL18): Unarmed Fighting d8 when no weapon and no Shield is active, else d6. The larger of this and Martial Arts is used. Tavern Brawler: d4 when nothing better */
registerSheetGroup({id:"feat-unarmed-die",group:"unarmed",phase:"attacks",order:20,reads:["i.feats","i.ESH","l.EW"],writes:["l.ud","l.udSrc"],
 run:function(ctx){const l=ctx.l,I=ctx.i;I.feats.forEach((f) =>{if(f.n==="Unarmed Fighting"){const uf=(l.EW.length||I.ESH)?"1d6":"1d8";if(dieAvg(uf)>dieAvg(l.ud)){l.ud=uf;l.udSrc="Unarmed Fighting ("+f.s+")"+(uf==="1d8"?": d8, no weapon or Shield held":": d6 while holding a weapon or Shield")}}else if(f.n==="Tavern Brawler"&&l.ud==="1"){l.ud="1d4";l.udSrc="Tavern Brawler ("+f.s+")"}});return ctx.patch()}});
registerSheetGroup({id:"subclass-unarmed",group:"unarmed",phase:"attacks",order:30,reads:["i.B","i.L","i.SG","i.ESH"],writes:["l.ud","l.udSrc"],
 run:function(ctx){const I=ctx.i,l=ctx.l,SG2=I.SG;if(SG2&&SG2.unarmed){SG2.unarmed.forEach((q) =>{if(I.L>=q[0]){l.ud=I.ESH?q[2]:q[1];l.udSrc=I.B.sub+" "+q[0]+(I.ESH?" (holding a Shield)":"")}})}return ctx.patch()}});
/* RL35 3a: Unarmed Fighting d8 on a Monk keeps Dexterous Attacks (Dex). RL35 4b (RL34): Grapple and Shove DC may use Dex too, written as C.dcAb */
registerSheetRule({id:"monk-dexterous-attacks",group:"unarmed",about:"Monk: Dexterous Attacks, Grapple and Shove DC may use Dexterity",phase:"attacks",order:40,reads:["i.a","i.SRC","l.maOn"],writes:["C.dcAb","C.dcSrc"],
 run:function(ctx){const I=ctx.i,C=ctx.C;if(ctx.l.maOn&&I.a.sc.DEX>I.a.sc.STR){C.dcAb="DEX";C.dcSrc="Martial Arts: Dexterous Attacks ("+I.SRC+", Monk)"}return ctx.patch()}});
/* RL35 1b: say why Martial Arts is off */
registerSheetRule({id:"monk-martial-arts-off",group:"unarmed",about:"Monk: Martial Arts is off while a non-Monk weapon is active",phase:"attacks",order:50,reads:["l.umOn","l.maOn","l.EW","q.baseOf","q.monkRule"],writes:["l.maOff"],
 run:function(ctx){const l=ctx.l,Q=ctx.q;l.maOff=l.umOn&&!l.maOn?l.EW.filter((n) =>{const w=weaponDef(Q.baseOf(n).b);return w&&!Q.monkRule(w,Q.baseOf(n).b)}):[];return ctx.patch()}});
registerSheetGroup({id:"unarmed-strike-row",group:"unarmed",phase:"attacks",order:60,reads:["i.a","i.B","i.SRC","l.maOn","l.ud","l.udSrc","l.maOff","C.pluvennGrappleclaws"],writes:["C.attacks"],
 run:function(ctx){const I=ctx.i,l=ctx.l,a=I.a,maOff=l.maOff;ctx.C.attacks.push({...(!pluvennGrappleclawsProblems(ctx.C.pluvennGrappleclaws).length?{pluvennUnarmed:pluvennUnarmedRole('unarmed-strike')}:{}) ,n:"Unarmed Strike",sub:"",ab:l.maOn&&a.sc.DEX>a.sc.STR?"DEX":"STR",prof:true,die:l.ud,dieSrc:l.udSrc,type:"Bludgeoning",range:"5 ft",m:"",note:(maOff.length?"Martial Arts is off while "+maOff.join(" and ")+(maOff.length>1?" are":" is")+" active (not a Monk weapon). Unequip "+(maOff.length>1?"them":"it")+" to use Martial Arts. ":"")+(I.B&&I.B.rs==="2014"?"":"Damage, Grapple, or Shove.")});return ctx.patch()}});
/* C3: Fighting Style bonuses come from FEATS fields (Archery rngHit, Dueling meleeDmg1h, Thrown Weapon Fighting thrownDmg), PHB 2024 p. 209-210.
   They are written as named sources in misc/miscSrc/dmgBonus; the sheet adds them up. Dueling auto rule: exactly one active weapon, melee, not Two-Handed
   (a Shield is allowed). B.duelMode "on" applies Dueling to every one-handed melee weapon, "off" never; missing or "auto" = the rule */
registerSheetGroup({id:"fighting-style-state",group:"fightingStyles",phase:"attacks",order:70,reads:["i.B","i.feats","l.EW","q.baseOf"],writes:["l.fsb","l.fss","l.duelOn","l.hasGWF","l.hasTWF"],
 run:function(ctx){const I=ctx.i,l=ctx.l,B=I.B,FSB={},FSS={},FSseen={},EW=l.EW;
  I.feats.forEach((f) =>{const F=featDef(f.n);if(!F||FSseen[f.n])return;FSseen[f.n]=1;["rngHit","meleeDmg1h","thrownDmg"].forEach((k) =>{if(F[k]){FSB[k]=(FSB[k]||0)+F[k];FSS[k]=(FSS[k]?FSS[k]+"; ":"")+"Fighting Style: "+f.n+" ("+f.s+")"}})});
  const duelW=weaponDef(ctx.q.baseOf(EW[0]||"").b),duelAuto=EW.length===1&&!!duelW&&duelW.k==="M"&&!/Two-Handed/.test(duelW.p);
  l.fsb=FSB;l.fss=FSS;l.duelOn=!!FSB.meleeDmg1h&&(B.duelMode==="on"||(B.duelMode!=="off"&&duelAuto));
  l.hasGWF=I.feats.some((f) =>{return f.n==="Great Weapon Fighting"});l.hasTWF=I.feats.some((f) =>{return f.n==="Two-Weapon Fighting"});return ctx.patch()}});
/* ---------- one row per active weapon: the loop "weapon-rows" ---------- */
const EACH={scope:"each",over:"l.EW",loop:"weapon-rows"};
registerSheetGroup(Object.assign({},EACH,{id:"weapon-row-base",group:"weaponRows",phase:"attacks",order:100,reads:["i.a","i.wieldScores","i.SRC","i.AFX","i.B","q.baseOf","q.itemMagicBonus"],writes:["l.wrow"],
 run:function(ctx){const n=ctx.p,a=ctx.i.a,declared=ctx.q.baseOf(n),BO=Object.assign({},declared,{p:ctx.q.itemMagicBonus(n,declared,ctx.i.AFX)}),native=weaponDef(BO.b),formMeta=weaponFormMetadata(BO.mi||n,ctx.i.B.rs==="2014"?"2014":"2024"),w=native&&formMeta?Object.assign({},native,{t:formMeta.damageType,p:formMeta.finesse?(native.p?native.p+", ":"")+"Finesse":native.p}):native;if(!w||!weaponRowAllowed(BO.mi||n,ctx.i.wieldScores)){ctx.l.wrow=undefined;return ctx.patch()}
  let ab="STR";if(w.k==="R")ab="DEX";else if(/Finesse/.test(w.p))ab=a.sc.DEX>a.sc.STR?"DEX":"STR";
  ctx.l.wrow={n:n,BO:BO,w:w,formMeta:formMeta,ab:ab,isPact:false,pr:false,m:"",flow:false,die:w.d,dieSrc:BO.b+" ("+ctx.i.SRC+")",hit:0,dmg:0,srcs:[],note:"",thrown:false,oneH:false};return ctx.patch()}}));
/* M7: a Monk weapon (Simple, or Martial with Light) may use Dexterity */
registerSheetRule(Object.assign({},EACH,{id:"monk-weapon-ability",group:"weaponRows",about:"Monk: Martial Arts lets a Monk weapon use Dexterity",phase:"attacks",order:110,reads:["i.a","l.maOn"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const w=r.w,a=ctx.i.a;if(ctx.l.maOn&&w.k!=="R"&&(w.cat==="S"||/Light/.test(w.p)))r.ab=a.sc.DEX>a.sc.STR?"DEX":"STR";return ctx.patch()}}));
/* M13: only the bonded weapon, Charisma when it is at least as high */
/* zero-miss-1: 2014 Pact of the Blade has no Charisma rule; the Hexblade's Hex Warrior (XGE 2014) extends Charisma to every pact weapon */
registerSheetRule(Object.assign({},EACH,{id:"pact-blade-ability",group:"weaponRows",about:"Warlock, Pact of the Blade: the bonded weapon may use Charisma (2014: only with Hex Warrior)",phase:"attacks",order:120,reads:["i.a","i.r14","i.B","l.pactW"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const pactW=ctx.l.pactW,a=ctx.i.a;r.isPact=!!pactW&&ctx.p===pactW;const chaOk=!ctx.i.r14||/Hexblade/.test(ctx.i.B.sub||"");if(r.isPact&&chaOk&&a.sc.CHA>=a.sc[r.ab])r.ab="CHA";return ctx.patch()}}));
function formWeaponProficient(Q,weapons,groups,name,w){return !!w&&(weapons.indexOf(name+" (Masterful)")>=0||Q.wpNamed(weapons,name)||/Simple/.test(weapons)&&w.cat==="S"||/Martial(?! with)/.test(weapons)&&w.cat==="M"||(/Finesse or Light/.test(weapons)&&w.cat==="M"&&/Finesse|Light/.test(w.p))||(/Light property/.test(weapons)&&/Light/.test(w.p))||groups.some((g) =>{return g.cat===w.cat&&g.k===w.k&&!(g.not||[]).some((p) =>String(w.p||"").split(/,\s*/).some((x) =>x.replace(/\s*\(.*\)$/,"")===p))}))}
registerSheetGroup(Object.assign({},EACH,{id:"weapon-row-proficiency",group:"weaponRows",phase:"attacks",order:130,reads:["l.weapons","l.weaponGroups","q.wpNamed"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const weapons=ctx.l.weapons,groups=ctx.l.weaponGroups,Q=ctx.q;
  r.pr=!!(r.isPact||formWeaponProficient(Q,weapons,groups,r.BO.b,r.w)||(r.formMeta&&r.formMeta.proficiencyAny||[]).some(name=>formWeaponProficient(Q,weapons,groups,name,weaponDef(name))));return ctx.patch()}}));
registerSheetGroup(Object.assign({},EACH,{id:"weapon-row-mastery",group:"weaponRows",phase:"attacks",order:140,reads:["i.wmSet"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;r.m=ctx.i.wmSet.indexOf(r.BO.b)>=0?r.w.m:"";return ctx.patch()}}));
/* a subclass whose weapons use the Unarmed Strike die (SUB_GRANT flowing) */
registerSheetRule(Object.assign({},EACH,{id:"flowing-blades",group:"weaponRows",about:"Subclass Flowing Blades (level 3): listed weapons use the Unarmed Strike die",phase:"attacks",order:150,reads:["i.B","i.L","i.SG","l.ud"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const I=ctx.i,SG2=I.SG;r.flow=!!(SG2&&I.L>=3&&(SG2.flowing||[]).indexOf(r.BO.b)>=0);if(r.flow){r.die=ctx.l.ud;r.dieSrc=I.B.sub+", Flowing Blades (base "+r.w.d+")"}return ctx.patch()}}));
/* M7 (RL7): Monk weapon (Simple Melee, Martial Melee with Light) uses the Martial Arts die when it is larger (owner decision) */
registerSheetRule(Object.assign({},EACH,{id:"monk-weapon-die",group:"weaponRows",about:"Monk: a Monk weapon uses the Martial Arts die when it is larger",phase:"attacks",order:160,reads:["i.SRC","l.maOn","l.maDie","l.monkLv"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const l=ctx.l,w=r.w;if(l.maOn&&!r.flow&&w.k==="M"&&(w.cat==="S"||/Light/.test(w.p))&&dieAvg(l.maDie)>dieAvg(r.die)){r.dieSrc="Martial Arts die ("+ctx.i.SRC+", Monk "+l.monkLv+"), base "+r.BO.b+" "+r.die;r.die=l.maDie}return ctx.patch()}}));
/* magic bonus of the weapon (a +N weapon, a Masterwork weapon), the mastery text, riders of named weapons (tp) */
registerSheetGroup(Object.assign({},EACH,{id:"weapon-row-magic",group:"weaponRows",phase:"attacks",order:170,reads:[ "q.dmapRow"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const n=ctx.p,BO=r.BO,w=r.w,m=r.m;r.hit=BO.p;r.dmg=BO.mw?0:BO.p;r.srcs=BO.p?[n+(BO.mw?" (Masterwork, attack rolls only)":" (magic weapon)")]:[];r.note=(BO.p&&!BO.mw?"Add +"+BO.p+" to damage rolls. ":"")+(m?masteryText(m):"");r.thrown=/Thrown/.test(w.p);r.oneH=w.k==="M"&&!/Two-Handed/.test(w.p);
  {const d=ctx.q.dmapRow(n),XD=d&&d[5]&&d[5].xd;if(XD&&XD.length)r.note+=(r.note?" ":"")+"Extra damage: "+XD.join("; ")+"."}return ctx.patch()}}));
registerSheetGroup(Object.assign({},EACH,{id:"style-archery",group:"fightingStyles",phase:"attacks",order:180,reads:["l.fsb","l.fss"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const FSB=ctx.l.fsb,FSS=ctx.l.fss;if(r.w.k==="R"&&FSB.rngHit){r.hit+=FSB.rngHit;r.srcs.push(FSS.rngHit+": +"+FSB.rngHit+" to hit with Ranged weapons")}return ctx.patch()}}));
registerSheetGroup(Object.assign({},EACH,{id:"style-thrown-weapon",group:"fightingStyles",phase:"attacks",order:190,reads:["l.fsb","l.fss"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const FSB=ctx.l.fsb,FSS=ctx.l.fss;if(r.w.k==="R"&&r.thrown&&FSB.thrownDmg){r.dmg+=FSB.thrownDmg;r.srcs.push(FSS.thrownDmg+": +"+FSB.thrownDmg+" damage, Thrown weapon")}return ctx.patch()}}));
registerSheetGroup(Object.assign({},EACH,{id:"style-dueling",group:"fightingStyles",phase:"attacks",order:200,reads:["i.B","l.fsb","l.fss","l.duelOn"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const FSB=ctx.l.fsb,FSS=ctx.l.fss,B=ctx.i.B;
  if(r.oneH&&ctx.l.duelOn){r.dmg+=FSB.meleeDmg1h;r.srcs.push(FSS.meleeDmg1h+": +"+FSB.meleeDmg1h+" damage, one melee weapon and no other weapon");r.note="Dueling: +"+FSB.meleeDmg1h+" damage while this is your only weapon (a Shield is fine). "+r.note}
  else if(r.oneH&&FSB.meleeDmg1h&&B.duelMode!=="off")r.note="Dueling not applied: another weapon is active. To apply it anyway, set Dueling bonus to Always on under your Dueling choice in the builder. "+r.note;/* RL30 */return ctx.patch()}}));
registerSheetGroup(Object.assign({},EACH,{id:"style-great-weapon",group:"fightingStyles",phase:"attacks",order:210,reads:["l.hasGWF"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;if(ctx.l.hasGWF&&r.w.k==="M"&&/Two-Handed|Versatile/.test(r.w.p))r.note+=(r.note?" ":"")+"Great Weapon Fighting: with two hands, treat a 1 or 2 on a damage die as a 3.";return ctx.patch()}}));
registerSheetGroup(Object.assign({},EACH,{id:"style-two-weapon",group:"fightingStyles",phase:"attacks",order:220,reads:["l.hasTWF"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;if(ctx.l.hasTWF&&/Light/.test(r.w.p))r.note+=(r.note?" ":"")+"Two-Weapon Fighting: add your ability modifier to the damage of the extra Light weapon attack.";return ctx.patch()}}));
/* zero-miss-1: Improved Pact Weapon (XGE 2014): +1 to attack and damage rolls unless the weapon already has a magic bonus */
registerSheetRule(Object.assign({},EACH,{id:"improved-pact-weapon-2014",group:"weaponRows",about:"Warlock 2014 invocation Improved Pact Weapon: +1 attack and damage on a pact weapon without a magic bonus",phase:"attacks",order:175,reads:["i.r14","i.invs"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r||!r.isPact||!ctx.i.r14||ctx.i.invs.indexOf("Improved Pact Weapon")<0||r.BO.p)return null;r.hit+=1;r.dmg+=1;r.srcs.push("Improved Pact Weapon: +1 to hit and damage");return ctx.patch()}}));
/* zero-miss-1: the pact weapon note per edition. 2024 (PHB p. 156): Charisma, Spellcasting Focus, damage type Necrotic, Psychic or Radiant by choice (B.ch.pactDmg).
   2014 (PHB p. 108): proficient, magical for resistance; Improved Pact Weapon makes it a focus; Hex Warrior gives Charisma */
const PACT_TY=["Necrotic","Psychic","Radiant"];
registerSheetRule(Object.assign({},EACH,{id:"pact-blade-note",group:"weaponRows",about:"Warlock, Pact of the Blade: the bonded weapon note",phase:"attacks",order:230,reads:["i.r14","i.invs","i.B"],writes:["l.wrow"],
 run:function(ctx){const r=ctx.l.wrow;if(!r||!r.isPact)return null;const I=ctx.i,cha=r.ab==="CHA"?"uses Charisma":"you can use Charisma",pick=((I.B.ch||{}).pactDmg||[])[0]||"";
  if(I.r14)r.note="Pact weapon: magical for overcoming resistance"+(r.ab==="CHA"?"; uses Charisma (Hex Warrior)":"")+(I.invs.indexOf("Improved Pact Weapon")>=0?"; your Spellcasting Focus":"")+". "+r.note;
  else r.note="Pact of the Blade: "+cha+"; your Spellcasting Focus. Damage type "+(PACT_TY.indexOf(pick)>=0?pick+" (your choice; "+r.w.t+" or "+PACT_TY.filter((t) =>{return t!==pick}).join(" or ")+" also allowed)":r.w.t+" (or Necrotic, Psychic, or Radiant: pick one in the builder)")+". "+r.note;return ctx.patch()}}));
registerSheetGroup(Object.assign({},EACH,{id:"weapon-row-push",group:"weaponRows",phase:"attacks",order:240,reads:["l.wrow"],writes:["C.attacks"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const w=r.w;
  ctx.C.attacks.push({n:ctx.p,sub:r.isPact?(w.p?w.p+" • ":"")+"Pact Weapon":w.p,ab:r.ab,prof:!!r.pr,die:r.die,dieSrc:r.dieSrc,misc:r.hit,miscSrc:r.srcs.join("; "),dmgBonus:r.dmg,type:w.t,range:w.r?(w.k==="M"?"5 ft, "+w.r+" ft":w.r+" ft"):(/Reach \(20/.test(w.p)?"20 ft":/Reach/.test(w.p)?"10 ft":"5 ft"),m:r.m,note:r.note});return ctx.patch()}}));
/* zero-miss-1: the chosen pact damage type (2024) becomes the damage type of the pact weapon row */
registerSheetRule(Object.assign({},EACH,{id:"pact-blade-damage-type",group:"weaponRows",about:"Warlock 2024, Pact of the Blade: chosen damage type (Necrotic, Psychic, Radiant) on the pact weapon row",phase:"attacks",order:245,reads:["i.r14","i.B","l.wrow"],writes:["C.attacks"],
 run:function(ctx){const r=ctx.l.wrow,C=ctx.C,pick=((ctx.i.B.ch||{}).pactDmg||[])[0]||"",last=C.attacks[C.attacks.length-1];if(!r||!r.isPact||ctx.i.r14||PACT_TY.indexOf(pick)<0||!last||last.n!==ctx.p)return null;last.type=pick;return ctx.patch()}}));
/* Thrown Weapon Fighting: a melee weapon with Thrown gets a second row for the throw. Same ability (PHB 2024, Thrown property). The melee row keeps no thrown bonus */
registerSheetGroup(Object.assign({},EACH,{id:"weapon-row-thrown",group:"fightingStyles",phase:"attacks",order:250,reads:["l.wrow","l.fsb","l.fss"],writes:["C.attacks"],
 run:function(ctx){const r=ctx.l.wrow;if(!r)return null;const w=r.w,BO=r.BO,FSB=ctx.l.fsb,FSS=ctx.l.fss,n=ctx.p;
  if(w.k==="M"&&r.thrown&&FSB.thrownDmg){const ts=BO.p?[n+(BO.mw?" (Masterwork)":" (magic weapon)")]:[];ts.push(FSS.thrownDmg+": +"+FSB.thrownDmg+" damage, Thrown weapon");
   ctx.C.attacks.push({n:n+" (thrown)",sub:w.p+" • ranged attack",ab:r.ab,prof:!!r.pr,die:r.die,dieSrc:r.dieSrc,misc:BO.p,miscSrc:ts.join("; "),dmgBonus:(BO.mw?0:BO.p)+FSB.thrownDmg,type:w.t,range:w.r+" ft",m:r.m,note:"Thrown Weapon Fighting: +"+FSB.thrownDmg+" damage when you throw it. "+(BO.p&&!BO.mw?"Add +"+BO.p+" to damage rolls. ":"")+(r.m?masteryText(r.m):"")})}return ctx.patch()}}));
