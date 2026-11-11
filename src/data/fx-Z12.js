DataEnv.declare("__fxZ12");
/* Radiant weapon forms and their additional damage against Undead. */
(function(){
 if(DataEnv.slot.__fxZ12)return;DataEnv.slot.__fxZ12=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 function add(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 ["Dawnbringer","Duskcrusher"].forEach(function(n){add(n,{n:n,dieReplace:[{when:n,t:"Radiant"}]})});
 ["Sunsword","Dawnbringer","Duskcrusher"].forEach(function(n){add(n,{n:n,target:{types:["Undead"]},atkDice:[{when:n,d:"1d8",t:"Radiant",roll:true}]})});
})();
