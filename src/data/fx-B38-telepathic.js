DataEnv.slot.GX=DataEnv.slot.GX||{};GX.feat=GX.feat||{};
/* fx data batch B38 (hand written): Telepathic always prepares Detect Thoughts, cast with the ability the feat raised. The once per Long Rest counter already exists. */
(function(){
["Telepathic","Telepathic (2014)"].forEach(function(n){GX.feat[n]=(GX.feat[n]||[]).concat([{n:"Detect Thoughts (spell)",spells:[[1,"Detect Thoughts"]],spCls:"@asi"}])});
})();
