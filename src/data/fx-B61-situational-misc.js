DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};GX.feat=GX.feat||{};GX.species=GX.species||{};
/* fx data batch B61 (hand written, from the text): feat, item and species rules from tests/mech_baseline.json "by_design" that give the character a fixed
   number in a play state. A state is a switch on the sheet; a worn graft or amulet counts while equipped. Numbers are from the feature text. */
(function(){
var I=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])},F=function(k,e){GX.feat[k]=(GX.feat[k]||[]).concat([e])},S=function(k,e){GX.species[k]=(GX.species[k]||[]).concat([e])};
F("Aberrant Horror Transformation: Level 1",{n:"Aberrant Horror Transformation: Level 1 (Chitinous Shell)",toggle:{id:"b61-chitinous-shell",label:"Chitinous Shell grown (1 minute, no heavy armor): AC +2, Speed -10 ft"},acAdd:2,speedAdd:-10,cond:"noHeavy"});
F("Deathbound",{n:"Deathbound (One Last Breath)",toggle:{id:"b61-last-breath",label:"Two Death Saving Throw failures: Advantage on Death Saving Throws"},advOn:["Death Saving Throws"]});
F("Golem Upgrade",{n:"Golem Upgrade (Plating)",toggle:{id:"b61-golem-plating",label:"Adamantine or Juggernaut Plating installed: AC 18"},acBase:[18,""],acOver:true});
F("Lich Transformation: Level 3",{n:"Lich Transformation: Level 3 (Enhanced Phylactery)",toggle:{id:"b61-enhanced-phylactery",label:"Enhanced Phylactery boon, no armor: base AC 15 + Dex"},acBase:[15,"full"],cond:"noBody"});
F("Lycanthrope Transformation: Level 1",{n:"Lycanthrope Transformation: Level 1 (Hybrid Transformation)",toggle:{id:"b61-lycan-hybrid",label:"Hybrid form, no armor or shield: AC 10 + Con + Dex"},acBase:[10,"full","CON"],cond:"noArmor"});
F("Tauran",{n:"Tauran (Rush)",toggle:{id:"b61-tauran-rush",label:"Moving only in a straight line this turn: Speed +10 ft"},speedAdd:10});
I("Esquire's Rowels",{n:"Esquire's Rowels (riding)",toggle:{id:"b61-esquire-rowels",label:"Riding a mount: Initiative +1"},init:1});
I("Adamantine Plating",{n:"Adamantine Plating",acBase:[17,""],acOver:true});
I("Mithral Plating",{n:"Mithral Plating",acBase:[14,"full"],acOver:true,res:["Lightning"]});
I("Spiked Plating",{n:"Spiked Plating",acBase:[14,"full"],acDexMax:2,acOver:true});
I("Personal Shield Emitter",{n:"Personal Shield Emitter",acBase:[13,"full"]});
S("Vampire (Ixalan)",{n:"Feast of Blood",toggle:{id:"b61-feast-of-blood",label:"Drained blood (1 minute): Speed +10 ft, Advantage on Strength and Dexterity checks and saves"},speedAdd:10,advOn:["Strength and Dexterity checks and saving throws"]});
S("Uncorrupted Derro",{n:"Studied Insight",toggle:{id:"b61-studied-insight",label:"Studied this creature for 1 minute (1 hour): Advantage on Initiative against it"},initAdv:true});
})();
