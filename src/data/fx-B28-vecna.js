DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};GX.sub=GX.sub||{};
/* fx data batch B28: one Artisan's Tools pick of Circle of Preservation, Poison immunity and Initiative advantage of the Eye and Hand of Vecna (only when attuned to both: shared toggle), and the timed Frightened immunity of Liquid Courage. */
(function(){
var P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
["Eye of Vecna","Hand of Vecna"].forEach(function(n){P(n,{n:"Poison Immunity",toggle:{id:"b28-vecna-both",label:"Attuned to both the Eye and the Hand of Vecna"},imm:["Poison"],condImm:["Poisoned"],initAdv:true})});
var T=function(k,l,n,title){GX.sub[k]=(GX.sub[k]||[]).concat([{l:l,n:n+" (tool)",pick:[{k:"tool",t:"tool",n:1,cats:["art"],title:title}]}])};
T("Circle of Preservation",3,"Student of Preservation","Student of Preservation tool");
P("Liquid Courage",{n:"Liquid Courage (immunity)",toggle:{id:"b28-liquid-courage",label:"Liquid Courage: active (10 minutes)"},condImm:["Frightened"]});
})();
