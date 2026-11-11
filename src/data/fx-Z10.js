DataEnv.declare("__fxZ10");
/* Wearable charge riders and weapon damage qualified by target material. */
(function(){
 if(DataEnv.slot.__fxZ10)return;DataEnv.slot.__fxZ10=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 function add(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 [["Dormant",4],["Awakened",6],["Exalted",10]].forEach(function(q){var n="Cabal's Ruin ("+q[0]+")";add(n,{n:n,atkSpendDice:[{when:"any",n:"Lightning Damage (one target)",d:"1d6",type:"Lightning",maxCost:q[1],perCost:true,resource:{kind:"charges"}}]})});
 add("Direstone Dwarven Pick",{n:"Direstone Dwarven Pick",target:{tag:"stone-creature-or-object",tagLabel:"Target is a stone creature or a stone object"},atkDice:[{when:"Direstone Dwarven Pick",d:"1d8",t:"Piercing",roll:true}]});
 add("Battlechef's Splendid Saucepan",{n:"Battlechef's Splendid Saucepan",atkBonus:[{when:"Battlechef's Splendid Saucepan",atk:1,dmg:1}]});
 add("Battlechef's Splendid Saucepan",{n:"Worn as a helmet",toggle:{id:"saucepan-helmet",label:"Saucepan worn as a helmet",default:false},acAdd:1,cond:"noHeavy"});
 add("Battlechef's Splendid Saucepan",{n:"Battlechef's Splendid Saucepan",target:{tag:"metal-armor-or-metal-or-stone",tagLabel:"Target wears metal armor or is made of metal or stone"},atkDice:[{when:"Battlechef's Splendid Saucepan",d:"1d4",t:"Thunder",roll:true}]});
})();
