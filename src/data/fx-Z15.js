DataEnv.declare("__fxZ15");
/* All-Purpose Tool bonuses apply only to Artificer spell attacks and save DCs. */
(function(){
 if(DataEnv.slot.__fxZ15)return;DataEnv.slot.__fxZ15=1;
 var F=DataEnv.slot.FXO=DataEnv.slot.FXO||{};
 [1,2,3].forEach(function(p){var n="+"+p+" All-Purpose Tool";F[n]=Object.assign({},F[n]||{},{fx:Object.assign({},(F[n]||{}).fx||{},{spellAtk:p,spellDc:p,spellCls:"Artificer"})})});
})();
