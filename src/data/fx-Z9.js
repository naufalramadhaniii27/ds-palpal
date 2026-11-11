DataEnv.declare("__fxZ9");
/* Charged on-hit damage and typed target riders from the item source text. */
(function(){
 if(DataEnv.slot.__fxZ9)return;DataEnv.slot.__fxZ9=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 function add(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 var eldritch="Eldritch Staff",cinnabar="Cinnabar Rapier";
 add(eldritch,{n:eldritch,atkSpendDice:[{when:eldritch,n:"Eldritch Attack",d:"1d8",type:"Lightning",maxCost:3,perCost:true,resource:{kind:"charges"}}]});
 add(cinnabar,{n:cinnabar,atkSpendDice:[{when:cinnabar,n:"Poison Damage",d:"1d4",type:"Poison",maxCost:10,perCost:true,resource:{kind:"charges"}}]});
 add("Ruinblade",{n:"Ruinblade",target:{types:["Undead"]},atkDice:[{when:"Ruinblade",d:"1d8",t:"Force",roll:true}]});
 add("Dragon Thighbone Club",{n:"Dragon Thighbone Club",target:{types:["Dragon"]},atkDice:[{when:"Dragon Thighbone Club",d:"2d8",t:"Bludgeoning",roll:true}]});
})();
