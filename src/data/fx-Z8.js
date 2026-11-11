DataEnv.declare("__fxZ8");
/* Explicit staff weapon profiles and optional damage paid from their own resource. */
(function(){
 if(DataEnv.slot.__fxZ8)return;DataEnv.slot.__fxZ8=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 var F=DataEnv.slot.FXO=DataEnv.slot.FXO||{};
 ["Staff of Striking","Staff of Thunder and Lightning","Staff of Withering","Staff of Power"].forEach(function(n){F[n]=Object.assign({},F[n]||{},{base:["Quarterstaff"]})});
 function add(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 var striking="Staff of Striking",thunder="Staff of Thunder and Lightning";
 add(striking,{n:striking,atkSpendDice:[{when:striking,n:"Power Strike",d:"1d6",type:"Force",maxCost:3,perCost:true,resource:{kind:"charges"}}]});
 add(thunder,{n:thunder,lu:["Lightning","Thunder","Thunder and Lightning","Lightning Strike","Thunderclap"].map(function(x){return {n:x+" (Staff of Thunder and Lightning)",max:1,reset:"dawn"}}),atkSpendDice:[{when:thunder,n:"Lightning",d:"2d6",type:"Lightning",maxCost:1,resource:{kind:"use",name:"Lightning (Staff of Thunder and Lightning)"}}]});
})();
