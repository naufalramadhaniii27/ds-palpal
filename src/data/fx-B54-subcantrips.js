DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B54 (hand written): subclass features that give named spells. Star Map also has free Guiding Bolt casts equal to your Proficiency Bonus. */
(function(){
var S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)};
S("College of Spirits",[{n:"Guiding Whispers (spell)",l:3,spCls:"Bard",spells:[[3,"Guidance"]]}]);
["Circle of the Stars","Circle of Stars"].forEach(function(k){S(k,[{n:"Star Map (spells)",l:3,spCls:"Druid",spells:[[3,"Guidance,Guiding Bolt"]],lu:{n:"Star Map: Guiding Bolt",max:"pb",reset:"long"}}])});
})();
