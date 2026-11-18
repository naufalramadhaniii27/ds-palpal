/* B51: Strixhaven primers. Study one at the end of a long rest and pick one 1st-level spell from two class lists (cl). The cast resets on a long rest. */
(function(){var C={"Lorehold Primer":["Cleric","Wizard"],"Prismari Primer":["Bard","Sorcerer"],"Quandrix Primer":["Druid","Wizard"],"Silverquill Primer":["Bard","Cleric"],"Witherbloom Primer":["Druid","Wizard"]};
if(typeof ITEM_PICK==="undefined")return;Object.keys(C).forEach(function(n){ITEM_PICK[n]={lo:1,hi:1,cl:C[n],once:1,reset:"long"}})})();
