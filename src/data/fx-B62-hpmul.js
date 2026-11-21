DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};
/* fx data batch B62 (hand written, from the text): hpMul multiplies the Hit Point maximum after every other source (14 hpBonusList, app 06 deriveHpDcCarry). */
GX.item["Potion of Giant Size"]=(GX.item["Potion of Giant Size"]||[]).concat([{n:"Potion of Giant Size (Hit Points)",toggle:{id:"b62-potion-of-giant-size",label:"Potion of Giant Size drunk (24 hours): Hit Point maximum doubled"},hpMul:2}]);
