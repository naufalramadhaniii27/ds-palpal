/* B46: four more items that cast named spells. Each spell is cast once until the next dawn (the Crown of Horns Teleport waits 7 days, so it is left to the item text). dc is the item's save DC */
(function(){
if(typeof ITEM_SPELLS==='undefined')return;
function D(n){return [n,0,0,0,"dawn"]}
ITEM_SPELLS["Book of Vile Darkness"]={dc:18,sp:[D("Animate Dead"),D("Circle of Death"),D("Dominate Monster"),D("Finger of Death")]};
ITEM_SPELLS["Blackrazor"]={sp:[D("Haste")]};
ITEM_SPELLS["Whelm"]={sp:[D("Detect Evil and Good"),D("Locate Object")]};
var c=ITEM_SPELLS["Crown of Horns"];if(c){c.dc=18;c.sp=[D("Power Word Kill"),["Teleport",0]]}
})();
