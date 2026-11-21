DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B54 (hand written): subclass features that give named spells. Star Map also has free Guiding Bolt casts equal to your Proficiency Bonus. */
(function(){
var S=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat(e)};
S("College of Spirits",[{n:"Guiding Whispers (spell)",l:3,spCls:"Bard",spells:[[3,"Guidance"]]}]);
/* free Guiding Bolt casts: PB in TCE (Circle of Stars), WIS mod in 2024 (Circle of the Stars, LU_X row) */
S("Circle of Stars",[{n:"Star Map (free Guiding Bolt)",l:2,lu:{n:"Star Map: Guiding Bolt",max:"pb",reset:"long"}}]);
})();
