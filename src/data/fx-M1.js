DataEnv.declare("__fxM1");
/* fx data M1 (engine wave 2, fx engine v5): rows of reports/ledger-skipped-all.md that the new fields unlock.
   Fields used (SOURCE-NOTES.md, "fx engine v5"): dieReplace, reach, acCap, toolPE / toolExpert (entries edited in place in fx-L4, fx-L9, fx-L12), chkBonusNp, saveProf, attackRow, pbAdd, slotAdd, exhLock.
   Tables: window.GX.item / sub / species / feat. Items count only while equipped (and attuned when needed).
   Stale note-only entries for the same rows were removed from fx-L2, fx-L4, fx-L5, fx-L8 (Gurt's Greataxe, Frozen Dagger, Sun Blade, Sunsword) or shortened (Ranseur of Torture, Scourge of Shadow, Lucent Destroyer), so nothing is shown twice. Still skipped: reports/ledger-skipped-all.md. */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};GX.sub=GX.sub||{};GX.species=GX.species||{};GX.feat=GX.feat||{};
(function(){
 if(DataEnv.slot.__fxM1)return;DataEnv.slot.__fxM1=1;
 function put(t,n,e){(GX[t][n]=GX[t][n]||[]).push(e)}
 function I(n,e){e.n=e.n||n;put("item",n,e)}
 function S(n,e){put("sub",n,e)}
 function SP(n,e){put("species",n,e)}

 /* ---- weapon dice, damage type and Finesse replaced on the weapon row (the row is named after the item) ---- */
 I("Gurt's Greataxe",{dieReplace:[{when:"Gurt's Greataxe",d:"3d12"}],atkDice:[{when:"Gurt's Greataxe",d:"2d12",t:"Slashing",note:"Extra damage if the target is human"}]});
 I("Frozen Dagger",{dieReplace:[{when:"Frozen Dagger",t:"Cold"}]});
 I("Ranseur of Torture",{dieReplace:[{when:"Ranseur of Torture",d:"2d10"}]});
 I("Scourge of Shadow",{n:"Scourge of Shadow: damage",dieReplace:[{when:"Scourge of Shadow",d:"3d4",t:"Slashing"}]});
 I("Sun Blade",{dieReplace:[{when:"Sun Blade",t:"Radiant",finesse:true}]});
 I("Sunsword",{dieReplace:[{when:"Sunsword",t:"Radiant",finesse:true}]});
 I("Sword of Resonance",{n:"Sword of Resonance: Finesse",dieReplace:[{when:"Sword of Resonance",finesse:true}]});
 I("Windvane",{n:"Windvane: Finesse",dieReplace:[{when:"Windvane",finesse:true}]});
 I("Lucent Destroyer",{n:"Lucent Destroyer: damage",dieReplace:[{when:"Lucent Destroyer",t:"Radiant"}]});
 I("Bounty Hunter Enforcer",{dieReplace:[{when:"Bounty Hunter Enforcer",t:"Bludgeoning"}]});
 I("Ether Spear",{n:"Ether Spear: damage",dieReplace:[{when:"Ether Spear",t:"Force"}]});
 I("Light Drinker",{n:"Light Drinker: damage",dieReplace:[{when:"Light Drinker",t:"Cold"}]});
 I("Oversized Longbow",{dieReplace:[{when:"Oversized Longbow",d:"2d6",note:"The bow deals 2d6 plus your Strength modifier. Only a Medium or larger creature with Strength 18 or higher can use it."}]});
 /* The Firm: Contractor, Backstabber: a Simple weapon that deals 1d4 deals 2d4 */
 put("feat","The Firm: Contractor",{n:"Backstabber",dieReplace:[{when:"weapon",cat:"S",from:"1d4",d:"2d4"}]});

 /* ---- reach ---- */
 I("Golem Arms",{n:"Golem Arms: reach",reach:[{when:["melee","unarmed"],add:5}]});
 SP("Bugbear (2014)",{n:"Long-Limbed",reach:[{when:"melee",add:5}]});
 SP("Dhakaani Guul'dar (Bugbear)",{n:"Long-Limbed",reach:[{when:"melee",add:5}]});

 /* ---- AC with a cap ---- */
 I("Wooden Chain of the Unbroken Circle",{n:"Wooden Chain: AC",acAdd:"WIS",acCap:2});
 SP("Manikin",{n:"Integrated Gold Plating (Sentinel, Strength)",when:{key:"lin",val:"Sentinel"},acBase:[13,"","STR"],acCap:3,acOver:true});
 SP("Manikin",{n:"Integrated Gold Plating (Tormentor)",when:{key:"lin",val:"Tormentor"},acBase:[16,"","STR"],acCap:2,acOver:true});
 S("Marauder Chapter",{n:"Unbreakable (AC)",l:3,cond:"medium",acArmAb:"CON",acCap:2});

 /* ---- bonus only on skills without proficiency ---- */
 I("Logic Unit",{n:"Logic Unit: Intelligence checks",chkBonusNp:[["INT","halfPb"]]});
 SP("Aven (Ibis-Headed)",{n:"Kefnet's Blessing",chkBonusNp:[["INT","halfPb"]]});
 S("Champion (2014)",{n:"Remarkable Athlete (checks)",l:7,chkBonusNp:[["STR","halfPbUp"],["DEX","halfPbUp"],["CON","halfPbUp"]]});

 /* ---- fixed saving throw proficiency ---- */
 S("Vermin Lord",{n:"Filth and Fortitude (save)",l:7,saveProf:["CON"]});
 S("Highway Rider",{n:"True Grit (save)",l:13,saveProf:["CON"]});
 S("Path of the Battlemind",{n:"Unbreakable Mind",l:10,saveProf:["INT","WIS"]});

 /* ---- attack rows granted by an item ---- */
 I("Spiked Shield",{n:"Spiked Shield: Shield Bash",attackRow:[{n:"Shield Bash (Spiked Shield)",ab:"STR",die:"2d6",type:"Piercing",prof:true,sub:"Spiked Shield"}]});
 I("Storm Sickle",{n:"Storm Sickle: Wind Blade",attackRow:[{n:"Wind Blade (Storm Sickle)",ab:"STR",die:"1d4",type:"Slashing",range:"20/60 ft",prof:true,sub:"Storm Sickle",xd:[{d:"1d4",t:"Lightning"}]}]});
 I("Boomerang Shield",{n:"Boomerang Shield: throw",attackRow:[{n:"Boomerang Shield (thrown)",ab:"best",die:"1d6",type:"Slashing",range:"20/60 ft",prof:"armor:Shields",sub:"Boomerang Shield"}]});
 I("Starmetal Shield",{n:"Starmetal Shield: Shooting Star",attackRow:[{n:"Shooting Star (Starmetal Shield)",ab:"best",die:"2d8",type:"Slashing",range:"30 ft",prof:true,k:"R",sub:"Starmetal Shield"}]});
 I("Staff of the Adder",{n:"Staff of the Adder: snake head",attackRow:[{n:"Snake Head (Staff of the Adder)",ab:"WIS",die:"1d6",type:"Piercing",prof:true,sub:"Staff of the Adder",xd:[{d:"3d6",t:"Poison"}]}]});
 I("Claws of the Umber Hulk",{n:"Claws of the Umber Hulk: claw",attackRow:[{n:"Claw (Claws of the Umber Hulk)",ab:"STR",die:"1d8",type:"Slashing",prof:true,sub:"Claws of the Umber Hulk"}]});

 /* ---- Proficiency Bonus +1 ---- */
 I("Ioun Stone (mastery)",{n:"Ioun Stone of Mastery",pbAdd:1});
 I("Ioun Stone, Mastery",{n:"Ioun Stone of Mastery",pbAdd:1});

 /* ---- extra spell slots ---- */
 I("Boon of High Magic",{slotAdd:[{lvl:9,ifHave:1}]});
 S("Universalist",{n:"Arcane Excellence (slot)",l:3,slotAdd:[{lvl:"high",max:7}]});

 /* ---- Exhaustion that cannot be removed ---- */
 I("Broken Vow",{exhLock:3});
})();
