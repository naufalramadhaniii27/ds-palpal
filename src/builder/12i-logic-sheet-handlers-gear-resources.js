import {armorDef,classDef,featDef,priceOf,weaponDef} from "./00-env.js";
import {registerSheetGroup,registerSheetRule} from "./12a-logic-sheet-registry.js";
/* Sheet handlers, part 7 (contract in 12a-logic-sheet-registry.js): the inventory rows (phase "inventory"), resources (phase "resources") and
   the action cards that do not come from spells (phase "actions"). */
/* ---------- inventory ---------- */
function invDesc(Q,x,it,bn,rr){if(armorDef(bn)){const A=armorDef(bn);it.d="AC "+A.ac+(A.dex==="max2"?" + Dex (max 2)":A.dex==="full"?" + Dex":"")+(A.str?". Requires Str "+A.str:"")+(A.dis?". Disadvantage on Stealth.":".")}else if(bn==="Shield")it.d="+"+(2+Q.baseOf(x.n).p)+" AC.";else if(x.desc)it.d=x.desc;else if(x.src&&!weaponDef(bn))it.d="From "+x.src;if(rr)it.d=rr+" magic item. "+(it.d||"");}
function invExtra(Q,x,it){try{it.type=Q.typeOfItem(x.n,x);it.cost=priceOf(x.n)!=null?priceOf(x.n):Q.itemCost(Q.baseOf(Q.kitTool(x)||x.n).b);/* v20 M1 */const h=Q.itemHtml(x.n,x);if(h)it.html=h.html;const d2=Q.dmapRow(x.n);it.equippable=Q.equippable(x.n)||!!(d2&&d2[1]!=="Potion")}catch(e){}}
function invTattoo(x,it){if(Object.prototype.hasOwnProperty.call(x,"studyBook")){it.studyBook=structuredClone(x.studyBook);if(Object.prototype.hasOwnProperty.call(x,"key"))it.key=structuredClone(x.key)}if(Object.prototype.hasOwnProperty.call(x,"slotRecovery")){it.slotRecovery=structuredClone(x.slotRecovery);if(Object.prototype.hasOwnProperty.call(x,"key"))it.key=structuredClone(x.key)}if(Object.prototype.hasOwnProperty.call(x,"storedSpells")){it.storedSpells=structuredClone(x.storedSpells);if(Object.prototype.hasOwnProperty.call(x,"key"))it.key=structuredClone(x.key)}if(Object.prototype.hasOwnProperty.call(x,"spellGem"))it.spellGem=structuredClone(x.spellGem);if(Object.prototype.hasOwnProperty.call(x,"tattoo"))it.tattoo=structuredClone(x.tattoo)}
function invBorrowedSource(Q,x,it,state){if(Q.allPurposeLegacy())return;if(Object.prototype.hasOwnProperty.call(x,"borrowedCantripSource"))it.borrowedCantripSource=structuredClone(x.borrowedCantripSource);const borrowed=Q.itemBorrowedCantripInfoForRow(x,state);if(borrowed.borrowedCantripMeta)it.borrowedCantripInfo=borrowed}
function invRiddenVehicle(Q,x,it,state,edition){const profile=Q.itemRiddenVehicleInfoForRow(x,state,edition);if(profile)it.riddenVehicleInfo=profile}
function invAttunement(x,it,dm,state){if(typeof x.attuned==="boolean")it.attuned=x.attuned;if(dm&&dm[3]||state&&state.optional){if(dm&&dm[3])it.att=1;if(state&&state.optional)it.attOptional=1;it.attunedActive=!!(state&&state.attuned);if(state&&state.reason)it.attuneReason=state.reason}}
function invRow(Q,x,state,version,edition,scores){const it={n:Q.kitTool(x)||x.n,key:x.n,q:Q.qOf(x),w:Q.itemW(Q.kitTool(x)||x.n)/* v32 p21 */,eq:!!x.eq};if(Q.itemWEst(x.n))it.west=1;/* v27 RD20 */const bn=Q.baseOf(x.n).b,rr=Q.rarityOf(x),dm=Q.dmapRow(x.n);
   invAttunement(x,it,dm,state);if(x.mw)it.mw=true;/* Masterwork flag of the row (cond mwArmor) */if(rr)it.rar=rr;if(Q.equippable(x.n))it.gear="equip";if(x.in)it.in=x.in;/* RU35 no. 8 */
   invDesc(Q,x,it,bn,rr);invTattoo(x,it);
   invExtra(Q,x,it);if(Object.prototype.hasOwnProperty.call(x,"form"))it.form=structuredClone(x.form);const form=Q.itemFormInfoForRow(x,state,version,edition);if(form.formMeta){it.formMeta=form.formMeta;it.formUsable=form.formUsable;it.formLight=form.formLight}const wield=Q.itemWieldInfoForRow(x,scores);if(wield.rule)it.wieldInfo=wield;if(Object.prototype.hasOwnProperty.call(x,"toolForm"))it.toolForm=structuredClone(x.toolForm);const tool=Q.itemToolFormInfoForRow(x,state);if(tool.toolFormMeta)it.toolFormInfo=tool;invBorrowedSource(Q,x,it,state);if(Object.prototype.hasOwnProperty.call(x,"vehicle"))it.vehicle=structuredClone(x.vehicle);const vehicle=Q.itemVehicleInfoForRow(x);if(vehicle.vehicleMeta)it.vehicleInfo=vehicle;invRiddenVehicle(Q,x,it,state,edition);return it}
/* one row per item. Item texts are built by the service q.withItemContext (it sets the attack rows and the proficiencies that the item text reads and clears
   them afterwards) and q.itemHtml (the detail text, built once, never inside itself) */
registerSheetGroup({id:"inventory-rows",group:"inventory",phase:"inventory",order:10,reads:["i.ATT","i.B","i.wieldScores","q.itemFormInfoForRow","q.itemWieldInfoForRow","q.itemToolFormInfoForRow","q.itemVehicleInfoForRow","q.itemRiddenVehicleInfoForRow","q.itemBorrowedCantripInfoForRow","q.allPurposeLegacy","C.attacks","C.profs","q.withItemContext","q.ensureInv","q.kitTool","q.qOf","q.itemW","q.itemWEst","q.baseOf","q.rarityOf","q.dmapRow","q.equippable","q.typeOfItem","q.itemCost","q.itemHtml"],writes:["C.inv","C.inventoryFormV","C.allPurposeSources","C.tattooSources","C.spellGemSources","C.slotRecoverySources","C.studyBookSources"],
 run:function(ctx){const Q=ctx.q,C=ctx.C;
  C.inv=Q.withItemContext(ctx.C.attacks,ctx.C.profs,function(){return Q.ensureInv().map(function(x,i){return invRow(Q,x,ctx.i.ATT.rows[i],ctx.i.B.inventoryFormV,ctx.i.B.rs,ctx.i.wieldScores)})});C.inventoryFormV=structuredClone(ctx.i.B.inventoryFormV);if(Object.prototype.hasOwnProperty.call(ctx.i.B,"studyBookSources"))C.studyBookSources=structuredClone(ctx.i.B.studyBookSources);if(Object.prototype.hasOwnProperty.call(ctx.i.B,"slotRecoverySources"))C.slotRecoverySources=structuredClone(ctx.i.B.slotRecoverySources);if(Object.prototype.hasOwnProperty.call(ctx.i.B,"spellGemSources"))C.spellGemSources=structuredClone(ctx.i.B.spellGemSources);if(Object.prototype.hasOwnProperty.call(ctx.i.B,"tattooSources"))C.tattooSources=structuredClone(ctx.i.B.tattooSources);if(!Q.allPurposeLegacy()&&Object.prototype.hasOwnProperty.call(ctx.i.B,"allPurposeSources"))C.allPurposeSources=structuredClone(ctx.i.B.allPurposeSources);return ctx.patch()}});
registerSheetGroup({id:"gold",group:"inventory",phase:"inventory",order:20,reads:["q.gpNow"],writes:["C.gp"],run:function(ctx){ctx.C.gp=ctx.q.gpNow();return ctx.patch()}});
/* m4 (RL20): "none" = no starting package (items set by hand or imported from the sheet), not option A or 50 GP */
registerSheetGroup({id:"equipment-note",group:"inventory",phase:"inventory",order:30,reads:["i.B","i.bg","q.eqIdx","q.clsKitText"],writes:["C.equipNote"],
 run:function(ctx){const B=ctx.i.B,bg=ctx.i.bg,Q=ctx.q;ctx.C.equipNote=(B.eqC==="none"?B.cls+" starting equipment: none (items added by hand)":B.cls+" option "+"ABC"[Q.eqIdx()]+": "+Q.clsKitText())+". "+(B.eqB==="none"?B.bg+" starting equipment: none (items added by hand)":B.bg+" option "+B.eqB+": "+(B.eqB==="A"&&bg?bg.eq:"50 GP"))+".";return ctx.patch()}});
/* ---------- resources ---------- */
registerSheetGroup({id:"res-init",group:"resources",phase:"resources",order:5,reads:[],writes:["C.res"],run:function(ctx){ctx.C.res=[];return ctx.patch()}});
/* class resources (and the ones of the chosen subclass). m6: a pool of points (Lay on Hands) */
registerSheetGroup({id:"res-class",group:"resources",phase:"resources",order:10,reads:["i.B","i.c","i.L","i.a","q.resMax","q.resKey"],writes:["C.res"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C,c=I.c,B=I.B,rs=(c.res||[]).concat((c.resSub&&c.resSub[B.sub])||[]);
  rs.forEach((r) =>{const m=Q.resMax(r,I.a);if(m>0){const o={k:Q.resKey("r-",r.n,C.res),n:r.n,tag:r.tag,max:m,reset:(r.short5&&I.L>=5)?"short":r.reset};if(r.pool)o.pool=1;C.res.push(o)}});return ctx.patch()}});
/* M17: FEATS.res */
registerSheetGroup({id:"res-feat-luck",group:"resources",phase:"resources",order:20,reads:["i.feats","i.pb"],writes:["C.res"],
 run:function(ctx){const C=ctx.C,pb=ctx.i.pb;ctx.i.feats.forEach((f) =>{const F=featDef(f.n);if(F&&(F.res==="luck"||F.luckN))C.res.push({k:"luck",n:"Luck Points",tag:f.n,max:F.luckN||pb,reset:"long",f:f.n})});return ctx.patch()}});
/* RU40: limited use rows of the LU_X table (feats, species, backgrounds, class and subclass features, magic items) */
registerSheetGroup({id:"res-limited-use",group:"resources",phase:"resources",order:30,reads:["i.a","i.pb","i.feats","q.luRows"],writes:["C.res"],
 run:function(ctx){ctx.q.luRows(ctx.C,ctx.i.a,ctx.i.pb,ctx.i.feats);return ctx.patch()}});
/* N4 (RL39): Hit Dice per die type (PHB 2024 p. 44). One class: as before. Multiclass: one row per die, main class die keeps key "hd" */
registerSheetGroup({id:"res-hit-dice",group:"resources",phase:"resources",order:40,reads:["i.mcl","i.parts"],writes:["C.res"],
 run:function(ctx){const I=ctx.i,C=ctx.C;
  if(!I.mcl.length)C.res.push({k:"hd",n:"Hit Dice",tag:"",max:0,reset:"long",auto:"level"});
  else{const hdc={},hdo=[];I.parts.forEach((q) =>{const d=classDef(q.cls).hd;if(hdc[d]==null){hdc[d]=0;hdo.push(d)}hdc[d]+=q.lv});hdo.forEach((d,i) =>{C.res.push({k:i?"hd-d"+d:"hd",n:"Hit Dice",tag:"",max:hdc[d],reset:"long",die:d})})}return ctx.patch()}});
registerSheetGroup({id:"res-multiclass",group:"resources",phase:"resources",order:50,reads:["i.a","i.mcl","q.mcResMax","q.resKey","q.slugK"],writes:["C.res"],
 run:function(ctx){const I=ctx.i,Q=ctx.q,C=ctx.C;I.mcl.forEach((m) =>{const mc=classDef(m.cls);(mc.res||[]).concat((mc.resSub&&mc.resSub[m.sub])||[]).forEach((r) =>{const mx=Q.mcResMax(r,I.a,m.lv);if(mx>0){const o={k:Q.resKey("m-"+Q.slugK(m.cls)+"-",r.n,C.res),n:r.n,tag:r.tag+" ("+m.cls+")",max:mx,reset:(r.short5&&m.lv>=5)?"short":r.reset};if(r.pool)o.pool=1;C.res.push(o)}})});return ctx.patch()}});
/* V17-8: the feature a counter belongs to, also for multiclass rows */
registerSheetGroup({id:"res-feature-names",group:"resources",phase:"resources",order:60,reads:[],writes:["C.res"],
 run:function(ctx){const RESF={"Ki Points":"Ki","Sorcery Points":"Font of Magic","Focus Points":"Monk's Focus","Superiority Dice":"Combat Superiority","Psionic Energy Dice":"Psionic Power"};ctx.C.res.forEach((r) =>{if(!r.f&&RESF[r.n])r.f=RESF[r.n]});return ctx.patch()}});
registerSheetGroup({id:"res-spell-slots",group:"resources",phase:"resources",order:70,reads:["q.slotsAll"],writes:["C.res"],
 run:function(ctx){const SA=ctx.q.slotsAll(),C=ctx.C;if(SA.pact)C.res.push({k:"pact",n:"Pact Slots (level "+SA.pact.lvl+")",tag:"Short Rest",max:SA.pact.n,reset:"short"});
  if(SA.slots)SA.slots.forEach((n,i) =>{C.res.push({k:"s"+(i+1),n:"Spell Slots, level "+(i+1),tag:"Long Rest",max:n,reset:"long"})});return ctx.patch()}});
/* a counter keeps the key it had on the open sheet (so used points stay used) */
registerSheetGroup({id:"res-keep-keys",group:"resources",phase:"resources",order:80,reads:["C.name","q.keepResKeys"],writes:["C.res"],run:function(ctx){ctx.q.keepResKeys(ctx.C);return ctx.patch()}});
/* Bind native charge counters only after keepResKeys has finalized their keys.
   This is derived metadata; inventory inputs and persisted counter keys stay unchanged. */
registerSheetGroup({id:"res-inventory-charge-keys",group:"resources",phase:"resources",order:85,reads:["C.res","C.inv"],writes:["C.inv"],
 run:function(ctx){const C=ctx.C;(C.res||[]).forEach(function(r){if(!r.item||!Number.isInteger(r.invIndex)||r.invIndex<0)return;const it=(C.inv||[])[r.invIndex];if(it&&(it.key||it.n)===r.f)it.chargeKey=r.k});return ctx.patch()}});
/* ---------- actions ---------- */
registerSheetGroup({id:"actions-base",group:"actions",phase:"actions",order:10,reads:["i.parts"],writes:["C.actions"],
 run:function(ctx){ctx.C.actions=[{c:"Actions",n:"Attack",t:"Weapon or Unarmed",d:"Make one attack"+(ctx.i.parts.some((q) =>{return q.lv>=5&&/Fighter|Barbarian|Monk|Paladin|Ranger/.test(q.cls)})?" per Extra Attack":"")+". With an [[Unarmed Strike]], choose Damage, [[Grapple]] (DC {dc}), or [[Shove]] (DC {dc})."},
  {c:"Actions",n:"Dash, Disengage, Dodge, Help, Hide, Influence, Magic, Ready, Search, Study, Utilize",t:"Standard",d:"Available to every creature."},
  {c:"Reactions",n:"Opportunity Attack",t:"Reaction",d:"When a creature you can see leaves your reach, make one melee attack against it."}];return ctx.patch()}});
/* M10: Bonus Action and Reaction features of every class part */
registerSheetGroup({id:"actions-class-features",group:"actions",phase:"actions",order:20,reads:["i.parts","q.featsOf"],writes:["C.actions"],
 run:function(ctx){const C=ctx.C;ctx.i.parts.forEach((q) =>{ctx.q.featsOf(q.cls,q.lv).forEach((x) =>{if(/^Bonus Action/.test(x[2]))C.actions.push({c:"Bonus Actions",n:x[1],t:q.cls+" "+x[0],d:x[2]});else if(/^Reaction/.test(x[2]))C.actions.push({c:"Reactions",n:x[1],t:q.cls+" "+x[0],d:x[2]})})});return ctx.patch()}});
/* v16: magic ammunition adds to the attack rows of the weapons that fire it */
registerSheetGroup({id:"magic-ammunition",group:"actions",phase:"actions",order:30,reads:["i.B","q.dmapRow","q.baseOf"],writes:["C.attacks"],
 run:function(ctx){const C=ctx.C,Q=ctx.q;(ctx.i.B.inv||[]).forEach((x) =>{const m=/^(Arrow|Bolt|Firearm Bullet|Needle|Sling Bullet), \+(\d)$/.exec(x.n);if(!m||!x.eq||!Q.dmapRow(x.n))return;const use={Arrow:/bow$/i,Bolt:/Crossbow/,"Firearm Bullet":/Musket|Pistol/,Needle:/Blowgun/,"Sling Bullet":/^Sling/}[m[1]];
  C.attacks.forEach((t) =>{const bn=Q.baseOf(t.n).b;if(weaponDef(bn)&&weaponDef(bn).k==="R"&&use.test(bn))t.note="With "+x.n+": +"+m[2]+" to attack and damage rolls. "+(t.note||"")})});return ctx.patch()}});
/* M18: Wraps of Unarmed Power and Wraps of Dyamak add to the Unarmed Strike row */
registerSheetGroup({id:"item-unarmed-wraps",group:"actions",phase:"actions",order:40,reads:["i.AFX"],writes:["C.attacks"],
 run:function(ctx){const C=ctx.C;ctx.i.AFX.forEach((q) =>{if(/^(Wraps of Unarmed Power|Wraps of Dyamak)/.test(q.n)&&(q.fx.atk||q.fx.dmg)){const u=C.attacks.filter((t) =>{return t.n==="Unarmed Strike"})[0];if(u){u.misc=(u.misc||0)+(q.fx.atk||0);u.miscSrc=(u.miscSrc?u.miscSrc+", ":"")+q.n;u.dmgBonus=(u.dmgBonus||0)+(q.fx.dmg||0)}}});return ctx.patch()}});
/* RU35 no. 5, 6: saving throw notes and damage rows of features */
registerSheetGroup({id:"save-notes-damage-rows",group:"actions",phase:"actions",order:50,reads:["i.a","i.pb","i.feats","q.saveNotesOf","q.xdmgRows"],writes:["C.saveNotes","C.xdmg"],
 run:function(ctx){const I=ctx.i,C=ctx.C,sno=ctx.q.saveNotesOf(I.feats);if(sno.length)C.saveNotes=sno;const xd=ctx.q.xdmgRows(I.a,I.pb);if(xd.length)C.xdmg=xd;return ctx.patch()}});
/* zero-miss-1: Pact of the Blade damage rows per edition. 2024 Lifedrinker (PHB p. 156): the Hit Point Die heal as a number. 2014 Lifedrinker (XGE p. 57):
   extra Necrotic damage equal to the Charisma modifier (minimum 1), not 1d6; 2014 Eldritch Smite spends a warlock (Pact Magic) slot */
registerSheetRule({id:"pact-blade-damage-rows",group:"actions",about:"Warlock invocations Lifedrinker and Eldritch Smite: numbers per rules edition",phase:"actions",order:51,reads:["i.a","i.r14","i.c","i.parts","C.xdmg"],writes:["C.xdmg"],
 run:function(ctx){const I=ctx.i,C=ctx.C;if(!C.xdmg)return null;const m=(k) =>{return Math.floor((I.a.sc[k]-10)/2)},con=m("CON"),hd=I.parts.length<2&&I.c&&I.c.hd?"1d"+I.c.hd:"the die roll";
  C.xdmg.forEach((x) =>{if(x.sub!=="Eldritch Invocation")return;
   if(x.n==="Lifedrinker"&&I.r14){x.dmg=String(Math.max(1,m("CHA")));x.type="Necrotic";x.note="When your pact weapon hits a creature: extra Necrotic damage equal to your Charisma modifier (at least 1)."}
   else if(x.n==="Lifedrinker")x.note="Once per turn when your pact weapon hits, choose the type. You can also spend one Hit Point Die: regain "+hd+(con?(con>0?"+":"")+con:"")+" Hit Points (at least 1).";
   else if(x.n==="Eldritch Smite"&&I.r14)x.note="Once per turn when your pact weapon hits: spend a warlock spell slot for 1d8 plus 1d8 per level of the slot. You can knock a Huge or smaller target Prone."});return ctx.patch()}});
