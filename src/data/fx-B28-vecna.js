DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};GX.sub=GX.sub||{};
/* fx data batch B28: one Artisan's Tools pick of four subclass features, Poison immunity and Initiative advantage of the Eye and Hand of Vecna, and the timed Frightened immunity of Liquid Courage. */
(function(){
var P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
["Eye of Vecna","Hand of Vecna"].forEach(function(n){P(n,{n:"Poison Immunity",imm:["Poison"],condImm:["Poisoned"],initAdv:true})});
var T=function(k,l,n,title){GX.sub[k]=(GX.sub[k]||[]).concat([{l:l,n:n+" (tool)",pick:[{k:"tool",t:"tool",n:1,cats:["art"],title:title}]}])};
T("Knowledge Domain",3,"Blessings of Knowledge","Blessings of Knowledge tool");
T("Circle of Preservation",3,"Student of Preservation","Student of Preservation tool");
T("Battle Master (2014)",3,"Student of War","Student of War tool");
T("Reanimator",3,"Reanimator's Skill Set","Reanimator's Skill Set tool");
GX.sub["College of Lore"]=(GX.sub["College of Lore"]||[]).concat([{l:3,n:"Bonus Proficiencies (skills)",pick:[{k:"skill",t:"skills",n:3,from:["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"],title:"Bonus Proficiencies skills"}]}]);
P("Liquid Courage",{n:"Liquid Courage (immunity)",toggle:{id:"b28-liquid-courage",label:"Liquid Courage: active (10 minutes)"},condImm:["Frightened"]});
})();
