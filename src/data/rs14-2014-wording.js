DataEnv.declare("__bldRs","__rsTerm");

/* v82: wording of the 2014 rules. Species becomes Race, Heroic Inspiration becomes Inspiration. The builder follows the edition of the build, the sheet follows the edition of the character. */
(function(){var MAP=[[/\bSpecies\b/g,"Race"],[/\bspecies\b/g,"race"],[/\bSPECIES\b/g,"RACE"],[/Heroic Inspiration/g,"Inspiration"],[/heroic inspiration/g,"inspiration"],[/Hit Point Dice/g,"Hit Dice"],[/Hit Point Die\b/g,"Hit Die"],[/HIT POINT DICE/g,"HIT DICE"]];
 function fix(t){var o=t;MAP.forEach(function(m){o=o.replace(m[0],m[1])});return o}
 function act(){var b=document.getElementById("bld");if(b&&!b.hidden)return !!(DataEnv.slot.__bldRs&&DataEnv.slot.__bldRs());return document.documentElement.getAttribute("data-rs")==="2014"}
 function walk(n){if(n.nodeType===3){var o=fix(n.nodeValue);if(o!==n.nodeValue)n.nodeValue=o;return}if(n.nodeType!==1)return;var g=n.tagName;if(g==="SCRIPT"||g==="STYLE"||g==="TEXTAREA"||g==="INPUT"||g==="SELECT"&&false)return;if(n.hasAttribute&&n.hasAttribute("data-keep"))return;/* v95: the edition buttons keep their own words */
  ["title","aria-label","placeholder"].forEach(function(a){var v=n.getAttribute&&n.getAttribute(a);if(v){var o=fix(v);if(o!==v)n.setAttribute(a,o)}});for(var c=n.firstChild;c;c=c.nextSibling)walk(c)}
 DataEnv.slot.__rsTerm=function(){if(act())walk(document.body)};
 var busy=false;new MutationObserver(function(ms){if(busy||!act())return;busy=true;try{ms.forEach(function(m){if(m.type==="characterData")walk(m.target);else m.addedNodes.forEach(walk)})}finally{busy=false}}).observe(document.body,{childList:true,subtree:true,characterData:true});
 document.addEventListener("click",function(){setTimeout(DataEnv.slot.__rsTerm,0)},true);
})();
