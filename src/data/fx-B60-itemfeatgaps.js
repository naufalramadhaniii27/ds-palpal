DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};GX.feat=GX.feat||{};
/* fx data batch B60 (hand written, from the text): item and feat effects that hold only in a play state, so each is a switch with the number the text gives. */
(function(){
var I=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])},F=function(k,e){GX.feat[k]=(GX.feat[k]||[]).concat([e])};
I("Karametra's Devotee",{n:"Karametra's Devotee (protection)",toggle:{id:"b60-karametra",label:"Karametra's protection invoked (1 minute): AC +1"},acAdd:1});
I("Kruphix's Disciple",{n:"Kruphix's Disciple (ranged)",toggle:{id:"b60-kruphix",label:"Mage Hand within 5 ft, against a ranged attack: AC +2"},acAdd:2});
I("Mageplate Cap",{n:"Mageplate Cap (Mage Armor)",toggle:{id:"b60-mageplate",label:"Mage Armor from the cap: base AC 15 + Dex"},acBase:15});
I("Switch",{n:"Switch (bark)",toggle:{id:"b60-switch-bark",label:"Covered in bark (second Wild Shape use): AC at least 17"},acBase:[17,""],acOver:true});
I("War Standard of Battlecries",{n:"War Standard of Battlecries (initiative)",toggle:{id:"b60-war-standard",label:"Within 15 ft of the extended standard at the start of combat: Initiative +3"},init:3});
F("Convincing Inquisitor",{n:"Zealous Insight",toggle:{id:"b60-zealous-insight",label:"Insight caught this creature's lie (1 hour): Advantage on Initiative"},initAdv:true});
F("Zhentarim Ruffian",{n:"Family First",toggle:{id:"b60-family-first",label:"Heroic Inspiration spent on Initiative: Advantage"},initAdv:true});
F("Mobile Combatant",{n:"Slippery",toggle:{id:"b60-slippery",label:"Took the Attack action this turn: Speed +10 ft"},speedAdd:10});
})();
