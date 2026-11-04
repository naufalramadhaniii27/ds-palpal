/* fx data ledger fix L8 (shards 20 and 21: Eberron, Tomb of Annihilation gifts, Tales from the Yawning Portal, Grim Hollow, Hither Hallow, Kibbles and Deep Magic, Spelljammer-like tsdm, tsgs, tsgeh items).
   Every entry states a fixed rule of the item text. Schema: SOURCE-NOTES.md ("fx schema", "fx engine v4", "fx batch L8").
   Three tables are used:
   - window.GX.item[name]: fx engine entries (equipped, attuned when needed). Order of loading: this file comes after fx-H-audit, so rows that already got an entry there are skipped (has()).
   - window.FXO[name]: replaces a wrong old row fx (Jetpack fly, Cogwork Wings fly, Necronomicon Ex Corvis ability score).
   - ITEM_SPELLS[name]: spells an item lets you cast (cost 0 = at will). Spells from Guidance, Ray of Frost, Druidcraft, Find Familiar and Shield were already there.
   - Row data of the tp and wotc item tables (window.WXI): only base, wp (own weapon rows) and nothing else are added where the item has no attack row yet (patch()).
   Not modelled (needs engine fields, see reports/ledger-skipped-L8.md): damage type of a weapon row, blaster mods that target one chosen blaster, tool Expertise, bonus only without proficiency, Channel Divinity extra use, Darkvision removal, auto-added inventory items, one extra attack on top of Extra Attack. */
window.GX=window.GX||{};GX.item=GX.item||{};window.FXO=window.FXO||{};
(function(){
 var G=GX.item;
 function A(n,e){(G[n]=G[n]||[]).push(e)}
 /* has(name,key): another file (fx-H-audit) already gave this item that key */
 function has(n,k){return (G[n]||[]).some(function(e){return e&&e[k]!=null})}
 function rows(n){var o=[];Object.keys(window.WXI||{}).forEach(function(id){(window.WXI[id]||[]).forEach(function(r){if(r&&r[0]===n)o.push(r)})});return o}
 function patch(n,m){rows(n).forEach(function(r){r[5]=Object.assign({},r[5]||{},m)})}
 function own(n,wp){patch(n,{wp:wp});window.WXWP=(window.WXWP||[]).concat([n])}
 function sp(n,list){if(typeof ITEM_SPELLS==="undefined")return;var o=ITEM_SPELLS[n]=ITEM_SPELLS[n]||{sp:[]};list.forEach(function(q){if(!o.sp.some(function(x){return x[0]===q[0]}))o.sp.push(q)})}
 var AB6=["STR","DEX","CON","INT","WIS","CHA"];
 function ab(v){return AB6.map(function(a){return [a,v]})}
 var LV135=[[5,1],[11,2],[17,3]];

 /* ---- Exploring Eberron (tee24) ---- */
 A("Jora Charm",{n:"Jora Charm",saveNote:["When you roll a 9 or lower on a Death Saving Throw, treat it as a 10"],defs:[["Note","Each Hit Point Die you roll to heal yourself restores twice the normal Hit Points"]]});
 A("Medi Spectacles",{n:"Medi Spectacles",darkNone:1,advOn:["Intelligence (Investigation) checks to examine something within 1 ft"]});
 /* granted weapons: own attack rows */
 own("Throwing Scarab",{d:"1d4",t:"Piercing",cat:"S",k:"M",p:"Finesse, Light, Thrown (range 20/60)",m:"",w:0,r:"20/60",xw:1});
 A("Throwing Scarab",{n:"Throwing Scarab",weapons:["Throwing Scarab"],atkDice:[{when:"Throwing Scarab",d:"1d4",t:"Acid"}],atkBonus:[{when:"Throwing Scarab",note:"Counts as a magical weapon. Use it for each attack of the Attack action. It dissolves after the attack."}]});
 own("Tongueworm",{d:"1d4",t:"Piercing",cat:"S",k:"M",p:"Finesse",m:"",w:0,xw:1});
 A("Tongueworm",{n:"Tongueworm",weapons:["Tongueworm"],atkBonus:[{when:"Tongueworm",note:"Bonus Action Unarmed Strike with Strength or Dexterity. The 1d4 Piercing replaces the normal damage and the ability modifier is added. On a hit the target makes a DC 13 Constitution save or is Poisoned until the start of your next turn."}]});

 /* ---- Tales from the Yawning Portal (tftyp) and Tomb of Annihilation (toa) ---- */
 A("Bracelet of Rock Magic",{n:"Bracelet of Rock Magic",condImm:["Petrified"],lu:[{n:"Flesh to Stone (bracelet casts)",max:3,reset:"none",tag:"Then only Stone Shape"},{n:"Stone Shape (bracelet casts)",max:13,reset:"none",tag:"After the 13th the bracelet loses its magic"}]});
 A("Flame Tongue Shortsword of Greed",{n:"Ablaze",toggle:{id:"flame-tongue-greed-ablaze",label:"Flame Tongue Shortsword of Greed is ablaze",default:false},atkDice:[{when:"Flame Tongue Shortsword of Greed",d:"2d6",t:"fire"}]});
 A("Macuahuitl",{n:"Macuahuitl",atkDice:[{when:"Macuahuitl",d:"2d6",t:"damage to a creature of the plant type"}]});

 A("Waythe",{n:"Waythe",atkDice:[{when:"Waythe",d:"2d6",t:"slashing damage to a creature of the giant type (it also makes a DC 15 Strength save or falls Prone)"}]});
 A("Charm of the Crystal Heart",{n:"Charm of the Crystal Heart",toggle:{id:"crystal-heart-charm",label:"Charm of the Crystal Heart active (10 days)",default:false},imm:["Piercing damage from nonmagical attacks","Slashing damage from nonmagical attacks"],vul:["Bludgeoning"]});
 A("Shagambi",{n:"Shagambi",extraAttack:2,defs:[["Note","Shagambi: one extra attack when you take the Attack action (on top of any Extra Attack you have)"]]});

 /* ---- Grim Hollow (tghg) ---- */
 /* the old row counted Hide Armor 12 + 2 with Dex capped at +2; the text gives AC 14 + Dexterity modifier, nothing else */
 A("Pigskin Armor",{n:"Pigskin Armor",acBase:[12,"full"],acOver:true});
 A("Dämglesvir (Adept)",{n:"Dämglesvir (Adept)",lu:{n:"Dämglesvir: sweeping strike",max:"pb",reset:"long"}});
 A("Dämglesvir (Master)",{n:"Dämglesvir (Master)",lu:[{n:"Dämglesvir: sweeping strike",max:"pb",reset:"long"},{n:"Dämglesvir: slay (100 HP or less)",max:1,reset:"long"}]});
 /* Full Moon Extract: the Strength 19 of the old row stays (taken = equipped), the advantage only counts while the 1 hour effect is on */
 A("Full Moon Extract",{n:"Full Moon Extract",toggle:{id:"full-moon-extract",label:"Full Moon Extract active (1 hour)",default:false},advOn:["Strength checks","Strength saving throws"]});
/* fx-int: the curse, advantages and Command Reaction use of Indorius's Crown are in fx-L4 */
 A("Sun Shades",{n:"Sun Shades",defs:[["Note","The goggles block your Darkvision while worn (ignore any Darkvision shown)"]]});
 /* tiered artifacts: Ulmyr's Eye */

 /* ---- Hither Hallow (thhw) ---- */
 /* the old rows say "Sorcerer, warlock or wizard" in lower case, so only a Sorcerer passed the attunement check */
 ["Corvum","Gallus","Luma","Raptor","Strig"].forEach(function(r){patch(r+" Feather Robe",{by:"Sorcerer, Warlock or Wizard"})});/* fx-int: the abPick of the five Feather Robes is defined in fx-L3, fx-L4 and fx-L5 */
 if(!has("Crown of Daffodils","chkBonus"))A("Crown of Daffodils",{n:"Crown of Daffodils",chkBonus:ab(1),init:1});
 window.FXO["Necronomicon Ex Corvis"]={fx:null};
 A("The Thorn of Kren",{n:"The Thorn of Kren",advOn:["Wisdom (Perception) checks","Wisdom (Survival) checks"],unarmed:{die:"1d8",t:"Piercing"},atkBonus:[{when:["unarmed","natural"],atk:2,dmg:2,note:"Vicious Nature: does not stack with other magic item bonuses. The Bite can be used as a Bonus Action each turn."}]});

 /* ---- Kibbles and Deep Magic (tkdm) ---- */
 A("Golden Elixir",{n:"Golden Elixir",toggle:{id:"golden-elixir",label:"Golden Elixir drunk",default:false},imm:["Poison","All natural and magical diseases"],condImm:["Poisoned"]});
 A("Necronomicon",{n:"Necronomicon",abUp:[["INT",2,24]],abDown:[["WIS",-2,3]],langs:["Void Speech"],lu:{n:"Necronomicon: Dominate Monster",max:1,reset:"dawn"}});
 A("Scalehide Cream",{n:"Scalehide Cream",toggle:{id:"scalehide-cream",label:"Scalehide Cream scales (1 hour)",default:false},acBase:[15,"","CON"]});

 /* ---- tsdm ---- */
 var LSW=["Ancestral Laser Sword","Ancestral Laser Sword (Laser Sword)","Ancestral Laser Sword (Laser Greatsword)"];
 patch("Ancestral Laser Sword",{base:["Laser Sword","Laser Greatsword"]});
 A("Ancestral Laser Sword",{n:"Upgraded Magic Item",atkBonus:[{when:LSW,atk:LV135,dmg:LV135}]});
 patch("Axe of the Mother Tree",{base:["Battleaxe","Greataxe"]});
 A("Axe of the Mother Tree",{n:"Upgraded Magic Item",atkBonus:[{when:["Axe of the Mother Tree","Axe of the Mother Tree (Battleaxe)","Axe of the Mother Tree (Greataxe)"],atk:LV135,dmg:LV135}]});
 A("Bounty Hunter's Vest",{n:"Tactical Nanofiber Vest",acBase:[12,"full"],acOver:true});
 A("Golem Arms",{n:"Golem Arms",advOn:["Strength checks","Strength saving throws"],defs:[["Note","Reach is 5 ft greater on Melee weapon attacks and Unarmed Strikes"]]});
 A("Hacker Hands",{n:"Hacker Hands",lu:{n:"Hacker Hands: hacking reroll",max:1,reset:"long"}});
 window.FXO["Jetpack"]={fx:null};
 A("Overdrive Module",{n:"Overdrive Module",lu:{n:"Overdrive Module",max:1,reset:"long"}});
 A("Personality Module",{n:"Personality Module",pick:[{k:"sk",t:"skills",n:2,title:"Skills of the module"},{k:"lg",t:"lang",n:2,title:"Languages of the module"}]});
 A("Un's Codex",{n:"Magic Resistance",toggle:{id:"un-codex-magic-res",label:"Un's Codex: Magic Resistance unlocked",default:false},advOn:["saves against spells and other magical effects"]});
 sp("Finger Gun Glove",[["Finger Guns",0]]);

 /* ---- tsgeh and tsgs ---- */
 A("Arcane Mirror",{n:"Arcane Mirror",lu:{n:"Arcane Mirror: Shield",max:1,reset:"short",tag:"Short or Long Rest"}});
 patch("Battlechef's Splendid Saucepan",{base:["Mace"]});
 A("Battlechef's Splendid Saucepan",{n:"Battlechef's Splendid Saucepan",atkBonus:[{when:"Battlechef's Splendid Saucepan",atk:1,dmg:1}],atkDice:[{when:"Battlechef's Splendid Saucepan",d:"1d4",t:"thunder to a target in metal armor or made of metal or stone"}]});
 A("Battlechef's Splendid Saucepan",{n:"Worn as a helmet",toggle:{id:"saucepan-helmet",label:"Saucepan worn as a helmet",default:false},acAdd:1,cond:"noHeavy"});
 A("Bloodscryer Oculus",{n:"Bloodscryer Oculus",advOn:["sight-based Wisdom (Perception) checks"],lu:[{n:"Oculus: Hunter's Mark",max:1,reset:"dawn"},{n:"Oculus: Locate Creature",max:1,reset:"dawn"},{n:"Oculus: Scrying",max:1,reset:"dawn"}]});
 A("Brambleheart Quiver",{n:"Brambleheart Quiver",lu:{n:"Brambleheart Quiver: thorned Arrows",max:4,reset:"dawn",tag:"1d3 + 1 regrow at dawn"},atkBonus:[{when:"ranged",note:"Thorned Arrows from the Brambleheart Quiver: +2 to attack and damage rolls."}]});
 /* Couatl Herald items: the Fly Speed needs three of them attuned. It is a sheet switch because the attuned count is not read here */
 ["Fang","Guard","Lash","Mantle","Radiance","Reach","Scales"].forEach(function(k){A("Couatl Herald's "+k,{n:"Flight of the Couatls",toggle:{id:"couatl-flight",label:"Attuned to three Couatl Herald items (Fly Speed)",default:false},mv:{fly:30}})});
 A("Crown of Deep Winter",{n:"Crown of Deep Winter",lu:{n:"Crown of Deep Winter: Frozen Burst",max:1,reset:"short",tag:"Short or Long Rest"}});
 A("Dragon Tamer Lance",{n:"Dragon Tamer Lance",langs:["Draconic"],lu:{n:"Dragon Tamer Lance: Find Steed",max:1,reset:"dawn"}});
 A("Dragon-Kindled Edge",{n:"Dragon-Kindled Edge",langs:["Draconic"],lu:{n:"Dragon-Kindled Edge: Lesser Draconic Resistance",max:1,reset:"dawn"}});
 A("Festerwood's Light",{n:"Festerwood's Light",imm:["Magical contagions"],lu:{n:"Festerwood's Light: spore burst",max:1,reset:"dusk"}});
 sp("Festerwood's Light",[["Dancing Lights",0]]);
 A("Galea of the Soulfire Phoenix",{n:"Galea of the Soulfire Phoenix",lu:[{n:"Galea: Ignite",max:1,reset:"dawn"},{n:"Galea: From the Ashes",max:1,reset:"none",tag:"Then wait 2 days"}]});
 sp("Hand of the Master",[["Mage Hand",0]]);
 sp("Hat Trick",[["Prestidigitation",0]]);
 sp("Fireweaver Gloves",[["Produce Flame",0]]);
 if(!has("Ionbreaker, the Tempest's Reach","mv"))A("Ionbreaker, the Tempest's Reach",{n:"Zephyr Step",mv:{fly:"speed"}});
 A("Lightning Pylons",{n:"Lightning Pylons",lu:{n:"Lightning Pylons: rods",max:3,reset:"none",tag:"A spent charge returns after 12 hours"}});
 A("Memento of the Shapeless",{n:"Memento of the Shapeless",lu:{n:"Memento: Pseudopod",max:1,reset:"none",tag:"Usable again after 12 hours"}});
 patch("Bird of a Feather (Uncommon)",{ch:[1,"1","1d4 hours","Unusable for 1d4 hours after each use"]});
})();
