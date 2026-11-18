DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B53 (hand written): items that give Advantage on Initiative rolls and Perception or Intimidation checks. initAdv puts the Advantage on the Initiative line of the sheet. */
(function(){
var P=function(k,e){GX.item[k]=(GX.item[k]||[]).concat([e])};
var per=function(n){return {n:n+" (awareness)",initAdv:true,defs:[["Advantage",n+": Advantage on Wisdom (Perception) checks"]]}};
["Ioun Stone (awareness)","Rod of Alertness","Sentinel Shield"].forEach(function(n){P(n,per(n))});
["Wave","Weapon of Warning"].forEach(function(n){P(n,{n:n+" (initiative)",initAdv:true})});
["Chattering Staff of Skulls","Ominous Staff of Skulls","Pulverizing Staff of Skulls"].forEach(function(n){P(n,{n:n+" (intimidation)",defs:[["Advantage",n+": Advantage on Charisma (Intimidation) checks while holding the staff"]]})});
})();
