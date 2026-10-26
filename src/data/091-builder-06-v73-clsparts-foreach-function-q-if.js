/* v73 */clsParts().forEach(function(q){if(q.sub==="Chronurgy Magic"&&q.cls==="Wizard"&&q.lv>=3&&!C.initBonus.some(function(x){return /^Temporal Awareness/.test(x.s)}))C.initBonus.push({s:"Temporal Awareness (Chronurgy Magic): Intelligence modifier",v:mod(a.sc.INT)})});/* v71 */clsParts().forEach(function(q){if(q.sub==="Oath of the Watchers"&&q.lv>=7&&!C.initBonus.some(function(x){return /^Aura of the Sentinel/.test(x.s)}))C.initBonus.push({s:"Aura of the Sentinel (Oath of the Watchers 7): Proficiency Bonus",v:pb})});/* v71 */feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.init==="pb")C.initBonus.push({s:f.n+" feat ("+f.s+")",v:pb});else if(F&&typeof F.init==="number")C.initBonus.push({s:f.n+" feat ("+f.s+")",v:F.init});if(F&&F.pas){C.pasBon=C.pasBon||[];Object.keys(F.pas).forEach(function(k){C.pasBon.push({k:k,v:F.pas[k],s:f.n+" feat ("+f.s+")"})})}/* v69 */if(F&&F.grappler)C.grappler=true});/* M17: FEATS.init, FEATS.grappler */
 (function(){var sx=spX();if(sx&&(sx.traits||[]).some(function(t){return t[0]==="Hare-Trigger"})&&!C.initBonus.some(function(x){return /^Hare-Trigger/.test(x.s)}))C.initBonus.push({s:"Hare-Trigger (Harengon): Proficiency Bonus",v:pb})})();/* v56: Harengon adds PB to Initiative */
 /* proficiencies */
 /* v32 RL49: a tool "of your choice" in the data (toolPick) is replaced by the tools chosen in the builder (none chosen: nothing) */
 var CHT=choices(),tp=function(txt,pick,key){if(!pick)return txt;var v=B.ch[key];return Array.isArray(v)?v.join(", "):""},XT=toolChoices(CHT).concat(grantTools(feats));
 var armor=c.armor,weapons=c.weapons,tools=[tp(c.tools,c.toolPick,"clsTool"),bg?bgTl(bg,tp):""].filter(function(x){return x&&x!=="None"});/* v95: a background with no tool says "None", which is no tool */
 if(SG&&SG.armor)SG.armor.forEach(function(q){if(L>=q[0])armor+=", "+q[1]});if(SG&&SG.weapons)SG.weapons.forEach(function(q){if(L>=q[0])weapons+=", "+q[1]});if(SG&&SG.tools)SG.tools.forEach(function(q){if(L>=q[0])tools.push(q[1])});(B.ch.spwep||[]).forEach(function(n){weapons+=", "+n+" (Masterful)"});if(pactW)weapons+=", "+baseOf(pactW).b+" (Pact Weapon)";/* M13 */
 if(optAny("Protector")){armor+=", Heavy";weapons+=", Martial"}/* v32: multiclass Cleric too */
 if(optAny("Warden")){armor+=", Medium";weapons+=", Martial"}
 if(B.sub==="College of Valor"&&L>=3){armor+=", Medium, Shields";weapons+=", Martial"}
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.armor)armor+=", "+F.armor;if(F&&F.weapons)weapons+=", "+F.weapons;if(/^Tavern Brawler/.test(f.n))weapons+=", Improvised";if(F&&F.wpPick){var wv=B.ch[F.wpPick+"-"+(f.key||f.s)];if(Array.isArray(wv))wv.forEach(function(n){weapons+=", "+n})}});/* v69 */
 MCL().forEach(function(m,mi){var g=MC_GRANT[m.cls];if(g.armor)armor+=(armor?", ":"")+g.armor;if(g.weapons)weapons+=", "+g.weapons;var gt=tp(g.tools,g.toolPick,"m"+mi+":tool");if(gt)tools.push(gt)});
 if(sp&&sp.wpPick&&!custom)(B.ch.spwp||[]).forEach(function(n){weapons+=", "+n});
 if(sp&&sp.profs&&!custom){if(sp.profs.armor)armor+=", "+sp.profs.armor;if(sp.profs.weapons)weapons+=", "+sp.profs.weapons;if(sp.profs.tools)tools.push(sp.profs.tools)}/* v74: species proficiencies (2014 species) */
 XT.forEach(function(q){tools.push(q[0])});
 armor=armor.split(/,\s*/).filter(function(x,i,a){return x&&a.indexOf(x)===i}).join(", ");weapons=weapons.split(/,\s*/).filter(function(x,i,a){return x&&a.indexOf(x)===i}).join(", ");
 tools=tools.join(", ").split(/,\s*/).filter(function(x,i,a){return x&&a.indexOf(x)===i});/* v32: each tool once */
 C.profs={armor:armor||"None",weapons:weapons,tools:tools.join(", ")||"None"};
 /* v23 RU36 no. 7: each proficiency with where it comes from */
 var PS={armor:[],weapons:[],tools:[]},ad=function(k,str,s){String(str||"").split(/,\s*/).forEach(function(n){n=n.replace(/ \((Masterful|Pact Weapon)\)$/,"");if(!n||n==="None"||PS[k].some(function(x){return x[0]===n}))return;PS[k].push([n,s])})};
 ad("armor",c.armor,B.cls);ad("weapons",c.weapons,B.cls);ad("tools",tp(c.tools,c.toolPick,"clsTool"),B.cls);if(bg)ad("tools",bgTl(bg,tp),B.bg);
 if(SG&&SG.armor)SG.armor.forEach(function(q){if(L>=q[0])ad("armor",q[1],B.sub)});if(SG&&SG.weapons)SG.weapons.forEach(function(q){if(L>=q[0])ad("weapons",q[1],B.sub)});if(SG&&SG.tools)SG.tools.forEach(function(q){if(L>=q[0])ad("tools",q[1],B.sub)});
 ["Protector","Warden"].forEach(function(o){if(optAny(o)){ad("armor",o==="Protector"?"Heavy":"Medium",o);ad("weapons","Martial",o)}});
 if(B.sub==="College of Valor"&&L>=3){ad("armor","Medium, Shields",B.sub);ad("weapons","Martial",B.sub)}
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.armor)ad("armor",F.armor,f.n);if(F&&F.weapons)ad("weapons",F.weapons,f.n);if(/^Tavern Brawler/.test(f.n))ad("weapons","Improvised",f.n);if(F&&F.wpPick){var wv=B.ch[F.wpPick+"-"+(f.key||f.s)];if(Array.isArray(wv))wv.forEach(function(n){ad("weapons",n,f.n)})}});/* v69 */
 if(sp&&sp.wpPick&&!custom)(B.ch.spwp||[]).forEach(function(n){ad("weapons",n,B.species+" ("+(sp.hb||SRC)+")")});
 if(sp&&sp.profs&&!custom){var spl=B.species+" ("+(sp.hb||SRC)+")";if(sp.profs.armor)ad("armor",sp.profs.armor,spl);if(sp.profs.weapons)ad("weapons",sp.profs.weapons,spl);if(sp.profs.tools)ad("tools",sp.profs.tools,spl)}/* v74 */
 MCL().forEach(function(m,mi){var g=MC_GRANT[m.cls];ad("armor",g.armor,m.cls+" (multiclass)");ad("weapons",g.weapons,m.cls+" (multiclass)");ad("tools",tp(g.tools,g.toolPick,"m"+mi+":tool"),m.cls+" (multiclass)")});
 XT.forEach(function(q){ad("tools",q[0],q[1])});
 (B.ch.spwep||[]).forEach(function(n){ad("weapons",n,"Masterful")});if(pactW)ad("weapons",baseOf(pactW).b,"Pact of the Blade");
 C.profSrc=PS;
 /* attacks */
 var wmSet=wmAll();C.attacks=[];/* v32 RL49: multiclass and Weapon Master too */
 var ud="1",udSrc="Unarmed Strike ("+SRC+")";
 if(maOn){ud=maDie;udSrc="Martial Arts ("+SRC+", Monk)"}
 feats.forEach(function(f){if(f.n==="Unarmed Fighting"){/* m2 (RL18): d8 when no weapon and no Shield is active, else d6. The larger of this and Martial Arts is used */var uf=(EW.length||ESH)?"1d6":"1d8";if(dieAvg(uf)>dieAvg(ud)){ud=uf;udSrc="Unarmed Fighting ("+f.s+")"+(uf==="1d8"?": d8, no weapon or Shield held":": d6 while holding a weapon or Shield")}}else if(f.n==="Tavern Brawler"&&ud==="1"){ud="1d4";udSrc="Tavern Brawler ("+f.s+")"}});
 var SG2=subGrant(B.sub);if(SG2&&SG2.unarmed){SG2.unarmed.forEach(function(q){if(L>=q[0]){ud=ESH?q[2]:q[1];udSrc=B.sub+" "+q[0]+(ESH?" (holding a Shield)":"")}})}
 /* RL35 3a: Unarmed Fighting d8 on a Monk keeps Dexterous Attacks (Dex). RL35 4b (RL34): Grapple and Shove DC may use Dex too, written as C.dcAb */
 if(maOn&&a.sc.DEX>a.sc.STR){C.dcAb="DEX";C.dcSrc="Martial Arts: Dexterous Attacks ("+SRC+", Monk)"}
 var maOff=umOn&&!maOn?EW.filter(function(n){var w=WEAPONS[baseOf(n).b];return w&&!monkW(w,baseOf(n).b)}):[];/* RL35 1b: say why Martial Arts is off */
 C.attacks.push({n:"Unarmed Strike",sub:"",ab:maOn&&a.sc.DEX>a.sc.STR?"DEX":"STR",prof:true,die:ud,dieSrc:udSrc,type:"Bludgeoning",range:"5 ft",m:"",note:(maOff.length?"Martial Arts is off while "+maOff.join(" and ")+(maOff.length>1?" are":" is")+" active (not a Monk weapon). Unequip "+(maOff.length>1?"them":"it")+" to use Martial Arts. ":"")+"Damage, Grapple, or Shove."});
 /* C3: Fighting Style bonuses come from FEATS fields (Archery rngHit, Dueling meleeDmg1h, Thrown Weapon Fighting thrownDmg), PHB 2024 p. 209-210.
    They are written as named sources in misc/miscSrc/dmgBonus; the sheet adds them up. Dueling auto rule: exactly one active weapon, melee, not Two-Handed
    (a Shield is allowed). B.duelMode "on" applies Dueling to every one-handed melee weapon, "off" never; missing or "auto" = the rule (toggle for UI/UX later). */
 var FSB={},FSS={},FSseen={};feats.forEach(function(f){var F=FEATS[f.n];if(!F||FSseen[f.n])return;FSseen[f.n]=1;["rngHit","meleeDmg1h","thrownDmg"].forEach(function(k){if(F[k]){FSB[k]=(FSB[k]||0)+F[k];FSS[k]=(FSS[k]?FSS[k]+"; ":"")+"Fighting Style: "+f.n+" ("+f.s+")"}})});
 var duelW=WEAPONS[baseOf(EW[0]||"").b],duelAuto=EW.length===1&&!!duelW&&duelW.k==="M"&&!/Two-Handed/.test(duelW.p);
 var duelOn=!!FSB.meleeDmg1h&&(B.duelMode==="on"||(B.duelMode!=="off"&&duelAuto));
 var hasGWF=feats.some(function(f){return f.n==="Great Weapon Fighting"}),hasTWF=feats.some(function(f){return f.n==="Two-Weapon Fighting"});
 EW.forEach(function(n){var BO=baseOf(n),w=WEAPONS[BO.b];if(!w)return;var ab="STR";
  if(w.k==="R")ab="DEX";else if(/Finesse/.test(w.p)||(maOn&&(w.cat==="S"||/Light/.test(w.p))))ab=a.sc.DEX>a.sc.STR?"DEX":"STR";
  var isPact=!!pactW&&n===pactW;if(isPact&&a.sc.CHA>=a.sc[ab])ab="CHA";/* M13: only the bonded weapon, Charisma when it is at least as high */
  var pr=isPact||weapons.indexOf(BO.b+" (Masterful)")>=0||wpNamed(weapons,BO.b)||/Simple/.test(weapons)&&w.cat==="S"||/Martial(?! with)/.test(weapons)&&w.cat==="M"||(/Finesse or Light/.test(weapons)&&w.cat==="M"&&/Finesse|Light/.test(w.p))||(/Light property/.test(weapons)&&/Light/.test(w.p));
  var m=wmSet.indexOf(BO.b)>=0?w.m:"";
  var flow=!!(SG2&&L>=3&&(SG2.flowing||[]).indexOf(BO.b)>=0),die=flow?ud:w.d,dieSrc=flow?B.sub+", Flowing Blades (base "+w.d+")":BO.b+" ("+SRC+")";
  /* M7 (RL7): Monk weapon (Simple Melee, Martial Melee with Light) uses the Martial Arts die when it is larger (owner decision) */
  if(maOn&&!flow&&w.k==="M"&&(w.cat==="S"||/Light/.test(w.p))&&dieAvg(maDie)>dieAvg(die)){dieSrc="Martial Arts die ("+SRC+", Monk "+monkLv+"), base "+BO.b+" "+die;die=maDie}
  var hit=BO.p,dmg=BO.mw?0:BO.p,srcs=BO.p?[n+(BO.mw?" (Masterwork, attack rolls only)":" (magic weapon)")]:[],note=(BO.p&&!BO.mw?"Add +"+BO.p+" to damage rolls. ":"")+(m?MASTERY[m]:""),thrown=/Thrown/.test(w.p),oneH=w.k==="M"&&!/Two-Handed/.test(w.p);
  if(w.k==="R"&&FSB.rngHit){hit+=FSB.rngHit;srcs.push(FSS.rngHit+": +"+FSB.rngHit+" to hit with Ranged weapons")}
  if(w.k==="R"&&thrown&&FSB.thrownDmg){dmg+=FSB.thrownDmg;srcs.push(FSS.thrownDmg+": +"+FSB.thrownDmg+" damage, Thrown weapon")}
  if(oneH&&duelOn){dmg+=FSB.meleeDmg1h;srcs.push(FSS.meleeDmg1h+": +"+FSB.meleeDmg1h+" damage, one melee weapon and no other weapon");note="Dueling: +"+FSB.meleeDmg1h+" damage while this is your only weapon (a Shield is fine). "+note}
  else if(oneH&&FSB.meleeDmg1h&&B.duelMode!=="off")note="Dueling not applied: another weapon is active. To apply it anyway, set Dueling bonus to Always on under your Dueling choice in the builder. "+note;/* RL30 */
  if(hasGWF&&w.k==="M"&&/Two-Handed|Versatile/.test(w.p))note+=(note?" ":"")+"Great Weapon Fighting: with two hands, treat a 1 or 2 on a damage die as a 3.";
  if(hasTWF&&/Light/.test(w.p))note+=(note?" ":"")+"Two-Weapon Fighting: add your ability modifier to the damage of the extra Light weapon attack.";
  if(isPact)note="Pact of the Blade: "+(ab==="CHA"?"uses Charisma":"you can use Charisma")+"; can deal Necrotic, Psychic, or Radiant damage. "+note;
  C.attacks.push({n:n,sub:isPact?(w.p?w.p+" \u2022 ":"")+"Pact Weapon":w.p,ab:ab,prof:!!pr,die:die,dieSrc:dieSrc,misc:hit,miscSrc:srcs.join("; "),dmgBonus:dmg,type:w.t,range:w.r?(w.k==="M"?"5 ft, "+w.r+" ft":w.r+" ft"):(/Reach/.test(w.p)?"10 ft":"5 ft"),m:m,note:note});
  /* Thrown Weapon Fighting: a melee weapon with Thrown gets a second row for the throw. Same ability (PHB 2024, Thrown property). The melee row keeps no thrown bonus */
  if(w.k==="M"&&thrown&&FSB.thrownDmg){var ts=BO.p?[n+(BO.mw?" (Masterwork)":" (magic weapon)")]:[];ts.push(FSS.thrownDmg+": +"+FSB.thrownDmg+" damage, Thrown weapon");
   C.attacks.push({n:n+" (thrown)",sub:w.p+" \u2022 ranged attack",ab:ab,prof:!!pr,die:die,dieSrc:dieSrc,misc:BO.p,miscSrc:ts.join("; "),dmgBonus:(BO.mw?0:BO.p)+FSB.thrownDmg,type:w.t,range:w.r+" ft",m:m,note:"Thrown Weapon Fighting: +"+FSB.thrownDmg+" damage when you throw it. "+(BO.p&&!BO.mw?"Add +"+BO.p+" to damage rolls. ":"")+(m?MASTERY[m]:"")})}
 });
 /* inventory */
 ATKC=C.attacks;/* RL31 */
 try{ if(C.profs)PROFC=C.profs; C.inv=ensureInv().map(function(x){var it={n:kitTool(x)||x.n,key:x.n,q:qOf(x),w:itemW(kitTool(x)||x.n)/* v32 p21 */,eq:!!x.eq},west=itemWEst(x.n)?(it.west=1):0/* v27 RD20 */,bn=baseOf(x.n).b,rr=rarityOf(x),dm=DMAP[x.n];if(dm&&dm[3]){it.att=1}if(rr)it.rar=rr;if(equippable(x.n))it.gear="equip";if(x.in)it.in=x.in;/* RU35 no. 8 */if(ARMOR[bn]){var A=ARMOR[bn];it.d="AC "+A.ac+(A.dex==="max2"?" + Dex (max 2)":A.dex==="full"?" + Dex":"")+(A.str?". Requires Str "+A.str:"")+(A.dis?". Disadvantage on Stealth.":".")}else if(bn==="Shield")it.d="+"+(2+baseOf(x.n).p)+" AC.";else if(x.desc)it.d=x.desc;else if(x.src&&!WEAPONS[bn])it.d="From "+x.src;if(rr)it.d=rr+" magic item. "+(it.d||"");try{it.type=itemType(x.n,x);it.cost=PRICE[x.n]!=null?PRICE[x.n]:itemCost(baseOf(kitTool(x)||x.n).b);/* v20 M1 */if(!window.__inTS){window.__inTS=1;try{it.html=itemDetail(x.n,x)}finally{window.__inTS=0}}it.equippable=equippable(x.n)||!!(DMAP[x.n]&&DMAP[x.n][1]!=="Potion")}catch(e){}return it});
 }finally{ ATKC=null; }/* RL36 b */
 C.gp=gpNow();
 /* m4 (RL20): "none" = no starting package (items set by hand or imported from the sheet), not option A or 50 GP */
 C.equipNote=(B.eqC==="none"?B.cls+" starting equipment: none (items added by hand)":B.cls+" option "+"ABC"[eqIdx()]+": "+clsKitText())+". "+(B.eqB==="none"?B.bg+" starting equipment: none (items added by hand)":B.bg+" option "+B.eqB+": "+(B.eqB==="A"&&bg?bg.eq:"50 GP"))+".";
 /* resources */
 C.res=[];var rs=(c.res||[]).concat((c.resSub&&c.resSub[B.sub])||[]);
 rs.forEach(function(r){var m=resMax(r,a);if(m>0){var o={k:resKey("r-",r.n,C.res),n:r.n,tag:r.tag,max:m,reset:(r.short5&&L>=5)?"short":r.reset};if(r.pool)o.pool=1;/* m6: a pool of points (Lay on Hands) */C.res.push(o)}});
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&(F.res==="luck"||F.luckN))C.res.push({k:"luck",n:"Luck Points",tag:f.n,max:F.luckN||pb,reset:"long",f:f.n})});
 luRows(C,a,pb,feats);/* RU40 *//* M17: FEATS.res */
 /* N4 (RL39): Hit Dice per die type (PHB 2024 p. 44). One class: as before. Multiclass: one row per die, main class die keeps key "hd" */
 if(!MCL().length)C.res.push({k:"hd",n:"Hit Dice",tag:"",max:0,reset:"long",auto:"level"});
 else{var hdc={},hdo=[];clsParts().forEach(function(q){var d=CLASSES[q.cls].hd;if(hdc[d]==null){hdc[d]=0;hdo.push(d)}hdc[d]+=q.lv});
  hdo.forEach(function(d,i){C.res.push({k:i?"hd-d"+d:"hd",n:"Hit Dice",tag:"",max:hdc[d],reset:"long",die:d})})}
 MCL().forEach(function(m,mi){var mc=CLASSES[m.cls];(mc.res||[]).concat((mc.resSub&&mc.resSub[m.sub])||[]).forEach(function(r){var mx=mcResMax(r,a,m.lv);if(mx>0){var o={k:resKey("m-"+slugK(m.cls)+"-",r.n,C.res),n:r.n,tag:r.tag+" ("+m.cls+")",max:mx,reset:(r.short5&&m.lv>=5)?"short":r.reset};if(r.pool)o.pool=1;C.res.push(o)}})});
 var RESF={"Ki Points":"Ki","Sorcery Points":"Font of Magic","Focus Points":"Monk's Focus","Superiority Dice":"Combat Superiority","Psionic Energy Dice":"Psionic Power"};C.res.forEach(function(r){if(!r.f&&RESF[r.n])r.f=RESF[r.n]});/* V17-8: also multiclass rows */
 var SA=slotsAll();
 if(SA.pact)C.res.push({k:"pact",n:"Pact Slots (level "+SA.pact.lvl+")",tag:"Short Rest",max:SA.pact.n,reset:"short"});
 if(SA.slots)SA.slots.forEach(function(n,i){C.res.push({k:"s"+(i+1),n:"Spell Slots, level "+(i+1),tag:"Long Rest",max:n,reset:"long"})});
 keepResKeys(C);
 /* actions */
 C.actions=[{c:"Actions",n:"Attack",t:"Weapon or Unarmed",d:"Make one attack"+(clsParts().some(function(q){return q.lv>=5&&/Fighter|Barbarian|Monk|Paladin|Ranger/.test(q.cls)})?" per Extra Attack":"")+". With an [[Unarmed Strike]], choose Damage, [[Grapple]] (DC {dc}), or [[Shove]] (DC {dc})."},
  {c:"Actions",n:"Dash, Disengage, Dodge, Help, Hide, Influence, Magic, Ready, Search, Study, Utilize",t:"Standard",d:"Available to every creature."},
  {c:"Reactions",n:"Opportunity Attack",t:"Reaction",d:"When a creature you can see leaves your reach, make one melee attack against it."}];
 clsParts().forEach(function(q){featsOf(q.cls,q.lv).forEach(function(x){if(/^Bonus Action/.test(x[2]))C.actions.push({c:"Bonus Actions",n:x[1],t:q.cls+" "+x[0],d:x[2]});else if(/^Reaction/.test(x[2]))C.actions.push({c:"Reactions",n:x[1],t:q.cls+" "+x[0],d:x[2]})})});/* M10: multiclass too */
 (B.inv||[]).forEach(function(x){var m=/^(Arrow|Bolt|Firearm Bullet|Needle|Sling Bullet), \+(\d)$/.exec(x.n);if(!m||!x.eq||!DMAP[x.n])return;var use={Arrow:/bow$/i,Bolt:/Crossbow/,"Firearm Bullet":/Musket|Pistol/,Needle:/Blowgun/,"Sling Bullet":/^Sling/}[m[1]];
  C.attacks.forEach(function(t){var bn=baseOf(t.n).b;if(WEAPONS[bn]&&WEAPONS[bn].k==="R"&&use.test(bn))t.note="With "+x.n+": +"+m[2]+" to attack and damage rolls. "+(t.note||"")})});/* v16: magic ammunition */
 activeFx().forEach(function(q){if(/^Wraps of Unarmed Power/.test(q.n)&&(q.fx.atk||q.fx.dmg)){var u=C.attacks.filter(function(t){return t.n==="Unarmed Strike"})[0];if(u){u.misc=(u.misc||0)+(q.fx.atk||0);u.miscSrc=(u.miscSrc?u.miscSrc+", ":"")+q.n;u.dmgBonus=(u.dmgBonus||0)+(q.fx.dmg||0)}}});/* M18 */
 var sno=saveNotes(feats);if(sno.length)C.saveNotes=sno;var xd=xdmgRows(a,pb);if(xd.length)C.xdmg=xd;/* RU35 no. 5, 6 */
 /* features */
 C.features=[];
 var spItems=custom?[{n:"Homebrew species",s:"Homebrew",d:"Fill in the traits from your setting."}]:sp.traits.map(function(t){return {n:t[0],s:(sp.hb||SRC)+", "+B.species,d:spTraitText(sp,t)}});
 if(!custom&&/or/.test(sp.size))spItems.push({n:"Size",s:(sp.hb||SRC)+", "+B.species,d:"You can be Medium or Small, chosen when you create the character. **Your choice.** "+(B.size||"Medium")+(htText(B.species,B.size||"Medium")?", "+htText(B.species,B.size||"Medium"):"")+"."});/* RU34 */
 if(B.ch.lin&&!(sp&&sp.lin&&(spLinTrait(sp)||sp.traits.some(function(t){return /ancestr|lineage|legacy/i.test(t[1])}))))spItems.push({n:"Chosen: "+B.ch.lin,s:(sp&&sp.hb||SRC)+", "+B.species,d:(sp&&sp.hb&&sp.linText&&sp.linText[B.ch.lin])||"Your lineage or ancestry choice."});/* v36 p21 */
 spItems.forEach(function(it){it.d+=calcNote(it.n,B.cls,TLv,a)});C.features.push({g:"Species: "+spName,items:spItems});
 C.defenses=defenses(a);
 /* RU35 no. 7: Resistances and Immunities from magic items in use, and extra speeds */
 C.itemAdv=[];activeFx().forEach(function(q){(q.fx.adv||[]).forEach(function(k){if(!/save|Concentration/i.test(k))C.itemAdv.push({k:k,s:q.n})})});/* v65: Advantage from items on Initiative and skills, read by cfx */
 activeFx().forEach(function(q){var f=q.fx;if(f.dark){var dv=+f.dark||0;/* v101: item darkvision. Robe of Eyes sets 120. Goggles of Night and the Axe of the Dwarvish Lords give the range, or add it to Darkvision you already have */if(/^Robe of Eyes/.test(q.n))C.darkvision=Math.max(C.darkvision||0,dv);else C.darkvision=(C.darkvision||0)+dv;C.darkSrc=(C.darkSrc?C.darkSrc+", ":"")+q.n}(f.res||[]).forEach(function(t){C.defenses.push({t:"Resistance",v:t,s:q.n})});(f.imm||[]).forEach(function(t){C.defenses.push({t:"Immunity",v:t,s:q.n})});(f.condImm||[]).forEach(function(t){C.defenses.push({t:"Immunity",v:t+" (condition)",s:q.n})});(f.vul||[]).forEach(function(t){C.defenses.push({t:"Vulnerability",v:t,s:q.n})});/* v76 */
  ["fly","swim","climb","burrow"].forEach(function(k){if(f[k]){C.speeds=C.speeds||{};var v=f[k]==="walk"?"walk":+f[k];C.speeds[k]={v:v,s:q.n}}})});
 (function(){var sp=function(k,s){C.speeds=C.speeds||{};if(!C.speeds[k])C.speeds[k]={v:"walk",s:s}};/* V17-4: speeds from class features */
  if(clsLv("Ranger")>=6&&!R14()){sp("climb","Roving (Ranger 6)");sp("swim","Roving (Ranger 6)")}
  if(subAt("Rogue","Thief")>=3)sp("climb","Second-Story Work (Thief 3)");
  if(invList().indexOf("Gift of the Depths")>=0)sp("swim","Gift of the Depths");
  if(subAt("Druid","Circle of the Sea")>=6)sp("swim","Aquatic Affinity (Circle of the Sea 6)");
  if(subAt("Druid","Circle of the Sea")>=10)sp("fly","Stormborn, while Wrath of the Sea is active");
  if(subAt("Barbarian","Path of the Wild Heart")>=6){var aw=chOf("Barbarian","p6opt");if(aw==="Panther")sp("climb","Aspect of the Wilds (Panther)");else if(aw==="Salmon")sp("swim","Aspect of the Wilds (Salmon)");else if(!aw){sp("climb","Aspect of the Wilds, if you chose Panther");sp("swim","Aspect of the Wilds, if you chose Salmon")}}/* v32 RL49 no. 31 */
  if(spX()&&B.species==="Aasimar"&&TL()>=3)sp("fly","Celestial Revelation, Heavenly Wings, while transformed")})();
 var cf=classFeatures().filter(function(x){return !(R14()&&x[1]==="Weapon Mastery")}).map(function(x){var d=x[2];
  var fsv=B.ch["fs"+c.fs],FSF=fsv?FEATS[fsv]:null;if(x[1]==="Fighting Style"&&fsv)d="You chose **"+fsv+"**. "+(FSF?FSF.d:"This Fighting Style is not in your active sources. Pick it again in the builder.");var fx=(x[1]==="Fighting Style"&&FSF)?FSF.full:"";
  if(x[1]==="Weapon Mastery"&&wmSet.length)d="Masteries: "+wmSet.map(function(n){return n+" ("+WEAPONS[n].m+")"}).join(", ")+". Swap one on a Long Rest.";
  if(x[1]==="Divine Order"&&B.ch.p1opt||x[1]==="Primal Order"&&B.ch.p1opt)d="You chose **"+B.ch.p1opt+"**. "+d;
  if(x[1]==="Blessed Strikes"&&B.ch.p7opt||x[1]==="Elemental Fury"&&B.ch.p7opt)d="You chose **"+B.ch.p7opt+"**. "+d;
  if(x[1]==="Eldritch Invocations"){var iv=[];Object.keys(B.ch).forEach(function(k){if(/invocation$/.test(k))iv=iv.concat(B.ch[k]||[])});if(iv.length)d="Known: "+iv.join(", ")+". "+d}
  if(x[1]==="Metamagic"){var mm=[];Object.keys(B.ch).forEach(function(k){if(/metamagic$/.test(k))mm=mm.concat(B.ch[k]||[])});if(mm.length)d="Known: "+mm.join(", ")+". "+d}
  d+=ycOf(CHT,x[1],undefined);/* v32 */d+=calcNote(x[1],B.cls,L,a);return {n:x[1],s:(x[3]&&x[3].hb?x[3].hb:SRC)+", "+B.cls+" "+x[0],d:d,full:fx||(CF_FULL[B.cls+"|"+x[1]]?CF_FULL[B.cls+"|"+x[1]]+ycOf(CHT,x[1],undefined)+calcNote(x[1],B.cls,L,a):"")}}).filter(function(x){return !/Subclass$|Ability Score|Epic Boon/.test(x.n)});
 var tr=c.track;if(tr)Object.keys(tr).forEach(function(k){if(tr[k][L-1])cf.push({n:k,s:SRC+", "+B.cls+" table",d:"At level "+L+": "+tr[k][L-1]+"."})});
 var sl=slotsFor();if(sl&&!MCL().length)cf.push({n:"Spell Slots",s:SRC+", "+B.cls,d:sl.pact?sl.pact+" Pact slots at level "+sl.lvl+".":sl.map(function(n,i){return "L"+(i+1)+": "+n}).join(", ")});
 C.features.push({g:B.cls,items:cf});
 if(B.sub&&B.sub!=="__custom"){var sf=c.subs[B.sub].filter(function(x){return x[0]<=L}).map(function(x){return {n:x[1],s:SRC+", "+B.sub+" "+x[0],d:x[2]+ycOf(CHT,x[1],undefined)+calcNote(x[1],B.cls,L,a),full:SUB_FULL[B.sub+"|"+x[1]]?SUB_FULL[B.sub+"|"+x[1]]+ycOf(CHT,x[1],undefined)+calcNote(x[1],B.cls,L,a):""}});
  var man=[];Object.keys(B.ch).forEach(function(k){if(/maneuver$/.test(k))man=man.concat(B.ch[k]||[])});if(man.length)sf.push({n:"Maneuvers known",s:SRC+", Battle Master",d:man.map(function(n){var m=MANEUVERS.filter(function(x){return x[0]===n})[0];return "**"+n+".** "+(m?m[1]:"")}).join("\n\n")});
  var nx=c.subs[B.sub].filter(function(x){return x[0]>L})[0];
  C.features.push({g:B.cls+" Subclass: "+B.sub,items:sf,next:nx?B.cls+" level "+nx[0]+" unlocks "+nx[1]+".":""})}
 else if(B.sub==="__custom")C.features.push({g:B.cls+" Subclass: "+subName,items:[{n:"Homebrew subclass",s:"Homebrew",d:"Add the subclass features from your setting."}]});
 /* M10: multiclass features get the level note (calcNote with the class level) and the full text, like the main class */
 MCL().forEach(function(m,mi){var mc=CLASSES[m.cls],seen={},it=[],mk=function(x,s,full){var cn=calcNote(x[1],m.cls,m.lv,a);return {n:x[1],s:(x[3]&&x[3].hb?x[3].hb:SRC)+", "+s+" "+x[0],d:x[2]+ycOf(CHT,x[1],mi)+cn,full:full?full+ycOf(CHT,x[1],mi)+cn:""}};mc.f.forEach(function(x){if(x[0]<=m.lv&&!/Subclass$|Ability Score|Epic Boon/.test(x[1])){var o=mk(x,m.cls,CF_FULL[m.cls+"|"+x[1]]);if(seen[x[1]]!=null&&x[1]!=="Expertise"){it[seen[x[1]]]=o;return}seen[x[1]]=it.length;it.push(o)}});
  if(m.sub&&mc.subs[m.sub])mc.subs[m.sub].forEach(function(x){if(x[0]<=m.lv)it.push(mk(x,m.sub,SUB_FULL[m.sub+"|"+x[1]]))});
  C.features.push({g:m.cls+" (multiclass "+m.lv+")"+(m.sub?": "+m.sub:""),items:it})});
 if(MCL().length){C.clsLabel=[B.cls+" "+L].concat(MCL().map(function(m){return m.cls+" "+m.lv})).join(" / ");C.cls=B.cls}
 C.features.push({g:"Feats",items:feats.map(function(f){var F=FEATS[f.n]||{};var ex="";if(f.asi){var v=f.asi;if(F.asi2)ex=v.a1===v.a2?" "+v.a1+" +2.":" "+v.a1+" +1, "+v.a2+" +1.";else if(v.a1)ex=" "+v.a1+" +1.";if(F.dt&&v.dt)ex+=" Damage type: "+v.dt+"."}var fk2=f.key||f.s;CHT0.forEach(function(q){var pv=B.ch[q.key];if(q.fk===fk2&&Array.isArray(pv)&&pv.length)ex+=" "+q.title.replace(/^.*?: /,"").replace(/^./,function(ch){return ch.toUpperCase()})+": "+pv.join(", ")+"."});/* v32 RL49 */return {n:f.n,s:f.s.indexOf(SRC)===0?f.s:SRC+", "+f.s/* m4 (RL20): no "PHB-2024, PHB-2024" */,d:(F.d||"")+ex,full:F.full?F.full+(ex?" **Your choice.**"+ex:""):""}})});/* v19: the chosen increase and damage type also under the full text */
 if(bg)C.features.push({g:"Background: "+B.bg,items:[{n:"Ability Scores",s:SRC+", "+B.bg,d:B.bgMode==="111"?bg.ab.join(" +1, ")+" +1.":(B.bg2||"?")+" +2, "+(B.bg1||"?")+" +1."},{n:"Proficiencies",s:SRC+", "+B.bg,d:"Skills: "+bg.sk.concat(Array.isArray(B.ch.bgsk)?B.ch.bgsk:[]).join(" and ")+(bg.skPick&&!(Array.isArray(B.ch.bgsk)&&B.ch.bgsk.length)?" (+"+bg.skPick.n+" of your choice, not chosen yet)":"")+". Tool: "+(bg.toolPick?((B.ch.bgTool||[]).join(", ")||"not chosen yet")+" ("+TOOL_ONE[bg.toolPick.cats[0]]+", your pick)":bg.tool)+"."},{n:"Equipment",s:SRC+", "+B.bg,d:"Option A: "+bg.eq+"."}].concat((bg.bf||[]).map(function(f){return {n:f[0],s:SRC+", "+B.bg,d:f[1]}}))});
 {var SM={};SPELLS.forEach(function(x){SM[x[0]]=x});
  var invs=[];Object.keys(B.ch).forEach(function(k){if(/invocation$/.test(k))invs=invs.concat(B.ch[k]||[])});
  /* M9: every spell has a source key (class, "@species", "@spcan", "@mi:<key>") and that source's ability (spellAb). C.spellcasting keeps the main
     ability (first caster class, else Magic Initiate, else species). C.spellcasting.by and C.spells[].ab are written only when 2+ abilities differ */
  var SA=slotsAll(),CPs=casterParts(),castAb=CPs.length?CPs[0].ab:null,SLs=spLists(),mis=miFeats(),miK=Object.keys(B.pk||{}).filter(function(k){return /^mi/.test(k)});
  var spl=(typeof autoSpells==="function"?autoSpells():[]),spAbE=spellAb("@species",a.sc);
  var ab=castAb||(miK.length?spellAb("@mi:"+miK[0],a.sc):null)||(spl.some(function(q){return q.k==="@species"})?spAbE:null)||(spl.some(function(q){return q.k==="@spcan"})?spellAb("@spcan",a.sc):null)||(spl.some(function(q){return /^@sub:/.test(q.k)})?spellAb(spl.filter(function(q){return /^@sub:/.test(q.k)})[0].k,a.sc):null)||"CHA",scm=mod(a.sc[ab]),mainSc=CPs.length?CPs[0].cls:"",sdc=8+pb+scm+spItemB("dc",mainSc),satk=pb+scm+spItemB("atk",mainSc);/* v19 RL42 */
  var list=[],seen={},bysrc=[];function addS(n,use,src,k){var x=SM[n],kk=k||"";if(!x||seen[n+use+"|"+kk])return;seen[n+use+"|"+kk]=1;var sab=k?spellAb(k,a.sc):ab;if(!bysrc.some(function(b){return b.k===kk}))bysrc.push({k:kk,n:/^@/.test(kk)?src:kk,ab:sab});
   var o={n:n,l:x[1],sch:x[2],ct:x[4],r:x[5],cmp:x[6],dur:x[7],conc:x[8],rit:x[9],sv:x[10],sum:x[11]||"",full:SPELL_FULL[n]||"",cls:spClsJ(x),use:use,src:src,_ab:sab};spFxTo(o,kk,a);if(kk==="Warlock"&&x[1]&&!/Long Rest|At will/.test(use))o.pact=1;/* RU35 no. 2: cast with a Pact Magic slot */list.push(o)}
  CPs.forEach(function(p){if(!bysrc.some(function(b){return b.k===p.cls}))bysrc.push({k:p.cls,n:p.cls,ab:p.ab})});
  spl.forEach(function(q){addS(q.n,"Always prepared",q.src,q.k);if(q.k==="@species"&&q.g>1){var o=list.filter(function(s){return s.n===q.n})[0];if(o)o.gain=q.g}});/* v21 M1 */
  featSpells().forEach(function(q){addS(q.n,"1/Long Rest free",q.f,q.k)});/* v21 i3 */
  dmSpells().forEach(function(q){addS(q.n,q.use,q.f,q.k)});/* v58: Dragonmark feats */
  CHT0.forEach(function(q){var v=B.ch[q.key];if(/^rc-/.test(q.key)&&Array.isArray(v))v.slice(0,q.n).forEach(function(n){addS(n,"Always prepared",q.feature,"@ft:"+q.fk)})});/* v32 RL49 no. 16 */
  CPs.forEach(function(p){(SLs[p.cls]||[]).forEach(function(n){if(list.some(function(s){return s.n===n&&s.use==="Always prepared"&&spl.some(function(q){return q.n===n&&q.k===p.cls})}))return;/* v22: once, as Always prepared */addS(n,SM[n]&&!SM[n][1]?"Cantrip":"Prepared",p.cls,p.cls)})});
  var pk=B.pk||{};Object.keys(pk).forEach(function(k){var mn=(mis.filter(function(m){return m.key===k})[0]||{}).cls,ms="Magic Initiate"+(mn?" ("+mn+")":"");if(/^ma/.test(k)&&pk[k])addS(pk[k],"1/Long Rest","Mystic Arcanum","Warlock");if(/^mi/.test(k)){var mi0=list.length;(pk[k].c||[]).forEach(function(n){addS(n,"Cantrip","Magic Initiate","@mi:"+k)});(pk[k].s||[]).forEach(function(n){addS(n,"1/Long Rest free","Magic Initiate","@mi:"+k)});list.slice(mi0).forEach(function(o){o.mi=ms});/* v23 M2: which Magic Initiate feat */bysrc.forEach(function(b){if(b.k==="@mi:"+k)b.n=ms})}});
  invs.forEach(function(n){var q=INV_SPELLS[n];if(q)addS(typeof q==="string"?q:q[0],typeof q==="string"?"At will":q[1],n,"Warlock")});
  enabledPacks().forEach(function(p){Object.keys(p.clsSpells||{}).forEach(function(c){(p.clsSpells[c]||[]).forEach(function(q){if(clsLv(c)>=q[0])addS(q[1],q[2],q[3],c)})});
   Object.keys(p.spellPick||{}).forEach(function(c){var q=p.spellPick[c],v=B.ch[q.key];if(clsLv(c)>=q.l&&Array.isArray(v)&&v[0]&&hbPickOk(q.key,v[0]))addS(v[0],q.use,q.feature,c)})});/* v20 RD24 *//* M17: INV_SPELLS in db4.js */
  if(clsLv("Warlock")>=9&&!R14())addS("Contact Other Plane","1/Long Rest free","Contact Patron","Warlock");
  CHT.forEach(function(q){var v=B.ch[q.key];if(!Array.isArray(v)||!/^(m\d+:)?p(18sm[12]|20sig)$/.test(q.key))return;v.forEach(function(n){if(q.list.some(function(x){return x[0]===n}))addS(n,/sig$/.test(q.key)?"1/Short Rest free":"At will",q.feature,"Wizard")})});/* v32 RL49 no. 36, 37 *//* M10: multiclass Warlock too */
  list.sort(function(p,q){return p.l-q.l||(p.n<q.n?-1:1)});
  /* m14 (RL17): a caster class (castAb) writes C.spellcasting even with no spell chosen yet; C.spells is then [] */
  if(list.length||castAb){C.spells=list;C.spellcasting={ab:ab,dc:sdc,atk:satk,mod:scm,slots:SA.slots||[],pact:SA.pact||null};
   var abs=[];bysrc.forEach(function(b){if(abs.indexOf(b.ab)<0)abs.push(b.ab)});
   var isrc=spItemSrc(mainSc);if(isrc.length)C.spellcasting.items=isrc;/* v19 RL42: names of the items in the numbers */
   if(abs.length>1){C.spellcasting.by=bysrc.map(function(b){var m2=mod(a.sc[b.ab]);return {n:b.n,ab:b.ab,mod:m2,dc:8+pb+m2+spItemB("dc",b.k),atk:pb+m2+spItemB("atk",b.k)}});list.forEach(function(s){s.ab=s._ab})}
   var bonusN=list.filter(function(s){return /^Bonus Action/.test(s.ct)}).map(function(s){return s.n}),reN=list.filter(function(s){return /^Reaction/.test(s.ct)}).map(function(s){return s.n});
   if(bonusN.length)C.actions.push({c:"Bonus Actions",n:"Spells",t:"Bonus Action casting time",d:bonusN.join(", ")+". See the Spells tab."});
   if(reN.length)C.actions.push({c:"Reactions",n:"Spells",t:"Reaction casting time",d:reN.join(", ")+". See the Spells tab."});
   var tier=TLv>=17?4:TLv>=11?3:TLv>=5?2:1;
   list.forEach(function(s){if(s.l||s.sv!=="ATK")return;var P=s.fx&&s.fx.dmg&&s.fx.dmg[0],pm=P&&/^(\d+)d(\d+)$/.exec(P[0]),m=pm?[0,pm[1],pm[2],P[1].split("|").join(" or ")]:/(\d+)d(\d+)\s+([A-Z][a-z]+)/.exec(s.sum);if(!m)return;/* RD19 */var eb=s.n==="Eldritch Blast",cnt=eb?1:(+m[1])*tier,ag=agOn(s.n);
    C.attacks.push({n:s.n,sub:"Cantrip"+(eb?" \u2022 "+tier+" beam"+(tier>1?"s":""):""),ab:s._ab||ab,prof:true,die:cnt+"d"+m[2],dieSrc:s.n+(eb?"":" (scales with level)"),nomod:!(ag||(s.db&&s.db.length)),/* v15: Potent Spellcasting, Empowered Evocation add the modifier, as Agonizing Blast */type:m[3],range:(function(){var sp=(B.ch.invspear||[]).indexOf(s.n)>=0&&/^(\d+) ft$/.exec(s.r||"");return sp?(+sp[1]+30*clsLv("Warlock"))+" ft (Eldritch Spear)":s.r})(),m:"",misc:spItemB("atk",s.src)||undefined,miscSrc:spItemB("atk",s.src)?spItemSrc(s.src).join(", "):undefined,note:((B.ch.invrepel||[]).indexOf(s.n)>=0?"Repelling Blast: on a hit, push a Large or smaller target up to 10 ft away. ":"")+(ag?"Agonizing Blast adds your "+(s._ab||ab)+" modifier. ":(s.db||[]).map(function(b){return b.s+" adds "+(b.v<0?"":"+")+b.v+". "}).join(""))+s.sum})});}
  (C.spells||[]).forEach(function(s){delete s._ab});
  /* v58: spells that magic items let you cast (ITEM_SPELLS). use is "At will" when free, else "Item" and itc says what it costs */
  if(typeof ITEM_SPELLS!=="undefined"){var ISL=[];ensureInv().forEach(function(x){var it=ITEM_SPELLS[x.n],d=DMAP[x.n];if(!it||!d)return;if(d[3]&&!x.eq)return;
   it.sp.forEach(function(q){var sp=SM[q[0]];if(!sp)return;var cost=q[1],vr=Array.isArray(cost),pl=q[3],src=x.n+(pl?" ("+pl+")":"");if(ISL.some(function(y){return y.n===q[0]&&y.src===src}))return;
    var lv=typeof q[2]==="number"&&q[2]?q[2]:sp[1];
    var o={n:q[0],l:sp[1],sch:sp[2],ct:sp[4],r:sp[5],cmp:sp[6],dur:sp[7],conc:sp[8],rit:sp[9],sv:sp[10],sum:sp[11]||"",full:SPELL_FULL[q[0]]||"",cls:sp[3].join(", "),use:cost===0?"At will":"Item",src:src,itc:{it:x.n,c:cost,lv:lv}};
    if(it.dc!=null)o.itc.dc=it.dc;if(it.atk!=null)o.itc.atk=it.atk;spFxTo(o,"",a);ISL.push(o)})});
   if(ISL.length){C.spells=(C.spells||[]).concat(ISL);C.spells.sort(function(p,q){return p.l-q.l||(p.n<q.n?-1:p.n>q.n?1:0)})}}
  /* v21 M2: Mystic Arcanum and Contact Patron, once per Long Rest without a slot. v23 m1-r3: the shared "Mystic Arcanum" row only counts the arcana that have no own row yet */
  var maN=(C.spells||[]).filter(function(s){return s.src==="Mystic Arcanum"}).length;if(maN)C.res=C.res.filter(function(r){if(r.n==="Mystic Arcanum"&&+r.max>=1){r.max=+r.max-maN;return r.max>0}return true});/* m1-r4: the arcana not chosen yet keep a shared row */
  (C.spells||[]).forEach(function(s){var one=s.src==="Contact Patron"&&C.res.filter(function(r){return r.n===s.src&&+r.max===1})[0];if(one){one.n=s.src+": "+s.n;one.f=one.f||s.src;return}/* v23 m3-r2: one counter, named after the spell */if(/^(Mystic Arcanum|Contact Patron)$/.test(s.src)&&!C.res.some(function(r){return r.f===s.src&&r.n.indexOf(s.n)>=0}))C.res.push({k:resKey("x-",s.src+" "+s.n,C.res),n:s.src+": "+s.n,tag:"1/Long Rest spell",max:1,reset:"long",f:s.src})});
  var mmk=[];Object.keys(B.ch).forEach(function(k){if(/metamagic$/.test(k))mmk=mmk.concat(B.ch[k]||[])});if(mmk.length)C.features.push({g:"Metamagic Options",items:mmk.map(function(n){var o=METAMAGIC.filter(function(x){return x[0]===n})[0];return {n:n,s:SRC+", Sorcerer",d:o?o[1]:""}})});/* RD18 */
  if(invs.length){var lfoN=0;C.features.push({g:"Eldritch Invocations",items:invs.map(function(n){var o=INVOCATIONS.filter(function(x){return x[0]===n})[0]||PACTB14.filter(function(x){return x[0]===n})[0],q=typeof INV_PICK!=="undefined"&&INV_PICK[n],y="";
   if(q&&q.feat){lfoN++;y=B.ch[q.key+lfoN]||""}else if(q)y=(B.ch[q.key]||[]).join(", ");return {n:n,s:SRC+", Warlock",d:(o?o[1]:"")+(y?" **Your choice.** "+y+".":"")}})})}/* v32 RL49 */
  /* m3 (RL19): Devil's Sight is its own sense, not Darkvision (PHB 2024 p. 155). New optional field C.senses [{n, v (ft), s, d}] */
  if(invs.indexOf("Devil's Sight")>=0)C.senses=(C.senses||[]).concat([{n:"Devil's Sight",v:120,s:"Eldritch Invocation ("+SRC+", Warlock)",d:"You see normally in Dim Light and in Darkness, magical or not, out to 120 ft."}]);
  /* M13: Pact of the Blade is applied to the chosen weapon only, in the attack loop above (before the inventory, RL36 c) */
  if(invs.indexOf("Thirsting Blade")>=0||invs.indexOf("Devouring Blade")>=0)C.actions[0].d="Make "+(invs.indexOf("Devouring Blade")>=0?"three":"two")+" attacks with your pact weapon (Thirsting Blade), or one attack otherwise. "+C.actions[0].d;
 }
 /* v20 RD25: senses and Fly Speed from a species choice (Retromistika Mistikan ancestries) */
 /* v32 RL49 no. 28, 33: chosen Wild Shape forms and Primal Companion, read by Extras (optional fields) */
 CHT.forEach(function(q){var v=B.ch[q.key];if(/^(m\d+:)?p2forms$/.test(q.key)&&Array.isArray(v)&&v.length)C.wsForms=v.slice();if(q.feature==="Primal Companion"&&typeof v==="string"&&v)C.companion=v});
 var SFq=spOptFx();(SFq.senses||[]).forEach(function(x){C.senses=(C.senses||[]).filter(function(y){return y.n!==x[0]});C.senses.push({n:x[0],v:x[1],s:x[2]+" ("+spName+")",d:x[3]||""})});
 XFX.senses(C);/* v62 */
 if(SFq.fly){C.speeds=C.speeds||{};C.speeds.fly={v:SFq.fly[0],s:SFq.fly[1]}}
 if(SFq.moves&&!custom&&sp){C.speeds=C.speeds||{};Object.keys(SFq.moves).forEach(function(k){C.speeds[k]={v:SFq.moves[k],s:spName+" ("+(sp.hb||SRC)+")"+(SFq.movesNote&&k==="fly"?", "+SFq.movesNote:"")}})}/* v36 p21 */
 feats.forEach(function(f){var F=FEATS[f.n];if(F&&F.attacks)F.attacks.forEach(function(q){C.attacks.push({n:q.n,sub:"Natural weapon",ab:q.ab||"STR",prof:true,die:q.die,dieSrc:q.n+" ("+f.n+")",type:q.type,range:"5 ft",m:"",note:""})})});/* v69 */
 if(sp&&!custom&&sp.attacks)sp.attacks.forEach(function(q){C.attacks.push({n:q.n,sub:"Natural weapon",ab:q.ab||"STR",prof:true,die:q.die,dieSrc:q.n+" ("+spName+", "+(sp.hb||SRC)+")",type:q.type,range:q.range||"5 ft",m:"",note:q.note||""})});/* v36 p21 */
 /* v20 RD25: Leyak Form Sharp Claws (The Leyak Queen 3): Simple melee, Finesse, Force. Grand Leyak (level 10) Deadly Claws: 1d10 */
 var lq=subAt("Warlock","The Leyak Queen");if(lq>=3){var dc=lq>=10&&((B.ch.scgrand||[]).indexOf("Deadly Claws")>=0||(MCL().some(function(m,i){return ((B.ch["m"+i+":scgrand"])||[]).indexOf("Deadly Claws")>=0}))),fab=a.sc.DEX>a.sc.STR?"DEX":"STR";
  C.attacks.push({n:"Sharp Claws",sub:"Leyak Form only \u2022 Finesse",ab:fab,prof:true,die:dc?"1d10":"1d8",dieSrc:dc?"Deadly Claws (Grand Leyak)":"Leyak Form (The Leyak Queen 3)",type:"Force",range:"5 ft",m:"",note:"Only while your Leyak Form is active. While it is, you can also make this attack as a Bonus Action."})}
 /* v20 RD24: Variant Combat Rules (Aurvidya): Combat Maneuver Roll */
 if(enabledPacks().some(function(p){return p.cmr})&&clsParts().some(function(q){return /^(Barbarian|Fighter|Monk|Paladin|Ranger|Rogue)$/.test(q.cls)})){var sm=mod(a.sc.STR),dm=mod(a.sc.DEX),rb=pb+Math.max(sm,dm);
  C.actions.push({c:"Actions",n:"Combat Maneuver Roll",hb:1,t:"Variant rule (Aurvidya)",d:"Instead of letting a target save against a nonmagical maneuver of a martial feature that calls for a Strength or Dexterity saving throw, roll d20 "+(rb<0?"\u2212"+(-rb):"+"+rb)+" (Proficiency Bonus plus your Strength or Dexterity modifier). It works if the total meets the target's DC: 8 + its Proficiency Bonus + its Strength modifier + its Dexterity modifier. Your own DC against such a roll is "+(8+pb+sm+dm)+"."})}
 /* v23 RU36 no. 2: entries D&D Beyond shows in Features: Core <Class> Traits, <Class> Subclass, Ability Score Improvement and Epic Boon with the feat taken,
    species Creature Type and Speed. The player's choice goes after "**Your choice.**" */
 (function(){var cg=C.features.filter(function(g){return g.g===B.cls})[0];if(!cg||!c)return;
  var lvOfIt=function(it){var m=/ (\d+)$/.exec(it.s||"");return m?+m[1]:0},put=function(it,lv){var i=0;while(i<cg.items.length&&(lvOfIt(cg.items[i])||0)<=lv)i++;cg.items.splice(i,0,it)};
  var ck=C.skills.filter(function(s){return s.p&&/^Class skills/.test(s.src||"")}).map(function(s){return s.n});
  var arm=String(c.armor||"").split(/,\s*/).filter(Boolean).map(function(x){return x==="Shields"?"Shields":x+" armor"}),wp=String(c.weapons||"").split(/,\s*/).filter(Boolean).map(function(x){return /^(Simple|Martial)$/.test(x)?x+" weapons":x});
  var core="**Primary Ability:** "+String(c.prim||"").split("/").map(function(k){return ABN[k]||k}).join(" or ")+". **Hit Point Die:** D"+c.hd+" per "+B.cls+" level. **Saving Throw Proficiencies:** "+(c.saves||[]).map(function(k){return ABN[k]}).join(" and ")+". **Skill Proficiencies:** Choose "+(c.sk&&c.sk.n||0)+(c.sk&&c.sk.from==="any"?" skills.":" from "+((c.sk&&c.sk.from)||[]).join(", ")+".")+(wp.length?" **Weapon Proficiencies:** "+wp.join(" and ")+".":"")+(c.tools?" **Tool Proficiencies:** "+c.tools+".":"")+(arm.length?" **Armor Training:** "+arm.join(", ")+".":" **Armor Training:** None.")+(function(){var y=ck.concat(c.toolPick?(B.ch.clsTool||[]):[]);return y.length?" **Your choice.** "+y.join(", ")+".":""})();
  cg.items.unshift({n:"Core "+B.cls+" Traits",s:SRC+", "+B.cls+" 1",d:core});
  if(B.sub&&B.sub!=="__custom"&&L>=subLv(B.cls))put({n:R14()?subLbl(B.cls):B.cls+" Subclass",s:SRC+", "+B.cls+" "+subLv(B.cls),d:"You gain "+(/^[AEIOU]/.test(B.cls)?"an ":"a ")+B.cls+" subclass of your choice. Its features come at the levels it lists. **Your choice.** "+sdn(B.sub)+"."},subLv(B.cls));
  allFeats().forEach(function(f){var m=new RegExp("\\("+B.cls+" (\\d+)\\)$").exec(f.s||"");if(!m)return;var F=FEATS[f.n]||{},lv=+m[1],ep=F.cat==="E",v=f.asi||{},ex=v.a1?(F.asi2?(v.a1===v.a2?v.a1+" +2":v.a1+" +1, "+v.a2+" +1"):v.a1+" +1"):"";
   put({n:ep?"Epic Boon":"Ability Score Improvement",s:SRC+", "+B.cls+" "+lv,d:ep?"You gain an Epic Boon feat or another feat of your choice for which you qualify. **Your choice.** "+f.n+(ex?" ("+ex+")":"")+".":"You gain the Ability Score Improvement feat or another feat of your choice for which you qualify. **Your choice.** "+f.n+(ex?" ("+ex+")":"")+"."},lv)});
  var sg0=C.features.filter(function(g){return /^Species: /.test(g.g)})[0];
  if(sg0&&!custom&&sp){sg0.items.unshift({n:"Speed",s:(sp.hb||SRC)+", "+B.species,d:"Your Speed is "+(C.speed||sp.speed)+" feet."});sg0.items.unshift({n:"Creature Type",s:(sp.hb||SRC)+", "+B.species,d:"You are a "+(sp.type||"Humanoid")+"."})}
  var bgG=C.features.filter(function(g){return /^Background: /.test(g.g)})[0];if(bgG&&R14())bgG.items=bgG.items.filter(function(i){return i.n!=="Ability Scores"});if(bgG&&bg&&!R14()&&B.bgMode!=="111"&&B.bg2){var it=bgG.items[0];if(it&&it.n==="Ability Scores")it.d="The background raises one of "+bg.ab.join(", ")+" by 2 and another by 1, or all three by 1. **Your choice.** "+ABN[B.bg2]+" +2"+(B.bg1?", "+ABN[B.bg1]+" +1":"")+"."}
 })();
 /* v32 RL51: actions from feats, features, species, invocations, maneuvers and magic items (ACTS in db4.js), and the attack rows they give */
 C.acts=actsFor(C);if(!C.acts.length)delete C.acts;actAtk(C,a,feats);
 /* v23 RU36 no. 1: printed page in the Player's Handbook or Dungeon Master's Guide (2024), BOOKPG in db4.js. Only for core entries */
 if(typeof BOOKPG!=="undefined"){var P=BOOKPG.phb,clsMin=function(cl){var o=P["class"][cl]||{},v=Object.keys(o).map(function(k){return o[k]});return v.length?Math.min.apply(null,v):null};
  C.features.forEach(function(g){var gg=g.g,mm=/^(\w+) \(multiclass \d+\)(?:: (.+))?$/.exec(gg);(g.items||[]).forEach(function(it){if(it.pg||!/^PHB-2024/.test(it.s||""))return;var n=it.n,pg=null;
   if(/^Species: /.test(gg)){var so=P.species[B.species];if(so)pg=so[n]||so._}
   else if(gg===B.cls||mm){var cl=mm?mm[1]:B.cls,co=P["class"][cl]||{},sb=mm&&mm[2]?P.subclass[cl+"|"+mm[2]]:null;pg=co[n]||co[n.split(":")[0]]||(sb&&sb[n])||(/^(Ability Score Improvement|Epic Boon)$/.test(n)?P.feat[n]:null)||((/^Core /.test(n)||n==="Spell Slots"||/ table$/.test(it.s||""))?clsMin(cl):null)}
   else if(gg.indexOf(B.cls+" Subclass: ")===0){var so2=P.subclass[B.cls+"|"+B.sub];if(so2)pg=so2[n]||so2._}
   else if(gg==="Feats")pg=P.feat[n];
   else if(/^Background: /.test(gg))pg=P.background[B.bg];
   else if(gg==="Eldritch Invocations")pg=P.invocation[n];
   else if(gg==="Metamagic Options")pg=(P["class"].Sorcerer||{}).Metamagic;
   if(pg)it.pg=pg})});
  (C.spells||[]).forEach(function(s){var p=P.spell[s.n];if(p&&!s.hb)s.pg=p});
  (C.inv||[]).forEach(function(x){var p=DMAP[x.n]&&BOOKPG.dmg.item[x.n];if(p)x.pg=p})}
 /* v33 p09: one entry per paragraph. A bold entry name that starts a sentence in the middle of a text starts a new paragraph (blank line). Your choice and Still open stay inline */
 (C.features||[]).forEach(function(g){(g.items||[]).forEach(function(f){if(typeof f.d==="string")f.d=fBlk(f.d);if(typeof f.full==="string")f.full=fBlk(f.full)})});
 if(R14())(function w(o){if(!o||typeof o!=="object")return;Object.keys(o).forEach(function(k){var v=o[k];if(typeof v==="string"){if(v.indexOf("PHB-2024")>=0)o[k]=v.replace(/PHB-2024/g,"PHB-2014")}else w(v)})})(C);/* v85: the book of the 2014 rules */
 return C}
function fBlk(t){return String(t).replace(/([.!?:)\]"]) \*\*(?!Your choice\.|Still open\.)([^*\n]{1,80}?\.)\*\* /g,"$1\n\n**$2** ")}
