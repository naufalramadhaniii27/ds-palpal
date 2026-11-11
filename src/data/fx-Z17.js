DataEnv.declare("__fxZ17");
/* Canonical Cleric capabilities; resource bindings and actual transactions are separate consumers. */
(function(){if(DataEnv.slot.__fxZ17)return;DataEnv.slot.__fxZ17=1;var G=DataEnv.slot.GX=DataEnv.slot.GX||{};G.cls=G.cls||{};G.sub=G.sub||{};
 ["Life Domain","Life Domain (2014)","Solidarity Domain (PSA)"].forEach(function(name){(G.sub[name]=G.sub[name]||[]).push({n:"Supreme Healing",l:17,classOnly:"Cleric",clericPower:{v:1,profile:"supreme-healing"}})});
 (G.sub["Order Domain"]=G.sub["Order Domain"]||[]).push({n:"Order's Wrath",l:17,classOnly:"Cleric",clericPower:{v:1,profile:"orders-wrath"}});
 (G.cls.Cleric=G.cls.Cleric||[]).push({n:"Divine Spark: Healing",l:2,ed:"2024",classOnly:"Cleric",clericPower:{v:1,profile:"divine-spark-heal"}},{n:"Divine Intervention",l:10,ed:"2024",classOnly:"Cleric",clericPower:{v:1,profile:"divine-intervention"}});
})();
