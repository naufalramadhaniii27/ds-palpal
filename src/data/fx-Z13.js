DataEnv.declare("__fxZ13");
/* Consumed typed resistance, optional paid weapon damage and a Dragon rider.
   Dragon-Kindled Edge retains its existing language and daily-use entry. */
(function(){
 if(DataEnv.slot.__fxZ13)return;DataEnv.slot.__fxZ13=1;
 DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
 function add(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 add("Potion of Acid Resistance",{"n":"Potion of Acid Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-acid","label":"Acid resistance potion effect (1 hour)","default":false},"res":["Acid"]});
 add("Potion of Cold Resistance",{"n":"Potion of Cold Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-cold","label":"Cold resistance potion effect (1 hour)","default":false},"res":["Cold"]});
 add("Potion of Fire Resistance",{"n":"Potion of Fire Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-fire","label":"Fire resistance potion effect (1 hour)","default":false},"res":["Fire"]});
 add("Potion of Force Resistance",{"n":"Potion of Force Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-force","label":"Force resistance potion effect (1 hour)","default":false},"res":["Force"]});
 add("Potion of Lightning Resistance",{"n":"Potion of Lightning Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-lightning","label":"Lightning resistance potion effect (1 hour)","default":false},"res":["Lightning"]});
 add("Potion of Necrotic Resistance",{"n":"Potion of Necrotic Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-necrotic","label":"Necrotic resistance potion effect (1 hour)","default":false},"res":["Necrotic"]});
 add("Potion of Poison Resistance",{"n":"Potion of Poison Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-poison","label":"Poison resistance potion effect (1 hour)","default":false},"res":["Poison"]});
 add("Potion of Psychic Resistance",{"n":"Potion of Psychic Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-psychic","label":"Psychic resistance potion effect (1 hour)","default":false},"res":["Psychic"]});
 add("Potion of Radiant Resistance",{"n":"Potion of Radiant Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-radiant","label":"Radiant resistance potion effect (1 hour)","default":false},"res":["Radiant"]});
 add("Potion of Thunder Resistance",{"n":"Potion of Thunder Resistance","consume":{"duration":"1 hour"},"toggle":{"id":"consumed-resistance-thunder","label":"Thunder resistance potion effect (1 hour)","default":false},"res":["Thunder"]});
 add("Rogue Card",{"n":"Rogue Card","atkSpendDice":[{"when":"weapon","n":"Rogue Card damage","d":"6d6","type":"Force","maxCost":1,"resource":{"kind":"charges"}}]});
 add("Dragon-Kindled Edge",{"n":"Dragon-Kindled Edge","langs":["Draconic"],"lu":{"n":"Dragon-Kindled Edge: Lesser Draconic Resistance","max":1,"reset":"dawn"}});
 add("Dragon-Kindled Edge",{"n":"Dragon-Kindled Edge","target":{"types":["Dragon"]},"atkDice":[{"when":"Dragon-Kindled Edge","d":"2d6","typeFrom":"weapon","roll":true}]});
})();
