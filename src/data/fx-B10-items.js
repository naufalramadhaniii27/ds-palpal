/* fx data batch B10: Advantage rules that magic items state plainly while carried (attuned where the item needs it). */
DataEnv.slot.GX=DataEnv.slot.GX||{};
(function(){
var G=DataEnv.slot.GX.item=DataEnv.slot.GX.item||{};
var add=function(n,e){e.n=n;(G[n]=G[n]||[]).push(e)};
add("Helm of Awareness",{"initAdv": true});
add("Ring of Truth Telling",{"defs": [["Advantage", "Ring of Truth Telling: Advantage on Wisdom (Insight) checks to tell whether someone is lying to you"]]});
add("Eyes of the Impossible",{"defs": [["Advantage", "Eyes of the Impossible: Advantage on Charisma (Persuasion) checks to deal with evil creatures"]]});
add("Ring of Veracity",{"defs": [["Advantage", "Ring of Veracity: Advantage on Wisdom (Insight) checks made with the Search action"]]});
add("Catnip Amulet",{"defs": [["Advantage", "Catnip Amulet: Advantage on ability checks to find or call Tiny domestic cats and on Wisdom (Animal Handling) checks to deal with them"]]});
add("Sharkrazor Mantle",{"defs": [["Advantage", "Sharkrazor Mantle: Advantage on Wisdom (Perception or Survival) checks to find or track a creature missing Hit Points"]]});
add("Gamma Pendant",{"defs": [["Advantage", "Gamma Pendant: Advantage on saves against spells"]]});
add("Necronomicon",{"defs": [["Advantage", "Necronomicon: Advantage on Charisma (Persuasion) checks against aberrations and on Charisma (Intimidation) checks against non-aberrations"]]});
})();
