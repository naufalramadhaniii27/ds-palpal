/* fx data batch H: misses found by the cross audit of tests/mech_baseline.json "gaps" (reports/audit-silang-situasional-20261104.md, sample of 80, and the audit of the other 177 keys, reports/audit-sisa-177-20261104.md).
   Every entry states a fixed rule that needs no action, trigger or choice at the table. Schema: SOURCE-NOTES.md, "fx schema" and "fx batch H".
   New engine bits used here: speedMul (Speed multiplied, Nosferatu) and when.any (read a pick made in another feat slot, Fey Stage 4 reads the Court of Stage 1).
   Text only on purpose:
   - Oath of Redemption Emissary of Redemption: the Resistance is on, but it ends against each creature you attack, cast a spell on or damage until a Long Rest. The sheet does not track targets, so the row says so in words.
   - Heavenborne and Storm Wings: the Fly Speed is a fixed rule, shown as a move. That you fall if you end the turn aloft (Heavenborne) or that it lasts until the end of the turn (Storm Wings) is play and stays in the feature text.
   - Zephyr Step hover (max 20 ft above the ground), Mummy Lord Whirlwind of Sand, Nosferatu Regeneration and the sunlight rules: timed or place based. */
window.GX=window.GX||{};GX.item=GX.item||{};GX.sub=GX.sub||{};GX.feat=GX.feat||{};
(function(){
 function addI(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 function addS(n,e){GX.sub[n]=(GX.sub[n]||[]).concat(e)}
 function addF(n,e){GX.feat[n]=(GX.feat[n]||[]).concat(e)}
 var AB6=["STR","DEX","CON","INT","WIS","CHA"].map(function(a){return [a,1]});
 /* Items. Ionbreaker is one row in the DMG and in Tales from the Stormheart (same name): Fly Speed equal to Speed. */
 addI("Ionbreaker, the Tempest's Reach",{n:"Zephyr Step",mv:{fly:"speed"}});
 /* +1 to ability checks, counted on every skill by its ability. The +1 to saves is the old row fx (save:1). Initiative is a Dexterity check. */
 addI("Crown of Daffodils",{n:"Crown of Daffodils",chkBonus:AB6,init:1});
 addI("Stone of Good Luck",{n:"Stone of Good Luck",chkBonus:AB6,init:1});
 /* Subclasses */
 addS("Pharaoh",{n:"Magic Resistance",l:20,advOn:["saves against spells and other magical effects"]});
 addS("Oath of Redemption",{n:"Emissary of Redemption",l:20,def:["Resistance","All damage dealt by other creatures (ends against a creature once you attack it, cast a spell on it or deal it damage, until you finish a Long Rest)"]});
 addS("Storm Sentinel",{n:"Storm Wings",l:6,mv:{fly:"speed"}});
 addS("The Parasite Patron",{n:"Symbiotic Sentinel",l:6,initAdv:true,advOn:["saves to avoid or end the Charmed and Frightened conditions"],defs:[["Note","You cannot be surprised"]]});
 addS("Blood Ascendant",{n:"Nosferatu",l:20,speedMul:2,mv:{climb:"speed"}});
 /* Feats */
 addF("Lycanthrope Transformation: Stage 2",{n:"Silver Sensitivity",def:["Vulnerability","Bludgeoning, Piercing and Slashing damage from silvered weapons (no Resistance to it)"]});
 addF("Star and Shadow Reader",{n:"Star Sight",darkAdd:15});
 [["Spring","Necrotic"],["Summer","Cold"],["Autumn","Radiant"],["Winter","Fire"]].forEach(function(c){
  addF("Fey Transformation: Stage 4",{n:"Seasonally Affected ("+c[0]+")",when:{key:"trFey1",any:1,val:"Servant of the "+c[0]+" Court"},vul:[c[1]]})});
})();
