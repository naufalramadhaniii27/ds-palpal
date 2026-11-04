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
 A("Deni Shield",{n:"Deni Shield",initAdv:true,advOn:["Wisdom (Perception) checks"]});
 A("Eyes of the Dragonne",{n:"Eyes of the Dragonne",advOn:["sight-based Wisdom (Perception) checks"]});
 A("Jora Charm",{n:"Jora Charm",saveNote:["When you roll a 9 or lower on a Death Saving Throw, treat it as a 10"],defs:[["Note","Each Hit Point Die you roll to heal yourself restores twice the normal Hit Points"]]});
 A("Medi Spectacles",{n:"Medi Spectacles",darkNone:1,advOn:["Intelligence (Investigation) checks to examine something within 1 ft"]});
 A("Rod of Wild Dominion",{n:"Handling",advOn:["Wisdom (Animal Handling) checks","Wisdom (Survival) checks"]});
 A("Shaarat'doovol, the Blade of Truth",{n:"Unyielding Duty",sense:[["Truesight",90,""]]});
 /* granted weapons: own attack rows */
 own("Throwing Scarab",{d:"1d4",t:"Piercing",cat:"S",k:"M",p:"Finesse, Light, Thrown (range 20/60)",m:"",w:0,r:"20/60",xw:1});
 A("Throwing Scarab",{n:"Throwing Scarab",weapons:["Throwing Scarab"],atkDice:[{when:"Throwing Scarab",d:"1d4",t:"Acid"}],atkBonus:[{when:"Throwing Scarab",note:"Counts as a magical weapon. Use it for each attack of the Attack action. It dissolves after the attack."}]});
 own("Tongueworm",{d:"1d4",t:"Piercing",cat:"S",k:"M",p:"Finesse",m:"",w:0,xw:1});
 A("Tongueworm",{n:"Tongueworm",weapons:["Tongueworm"],atkBonus:[{when:"Tongueworm",note:"Bonus Action Unarmed Strike with Strength or Dexterity. The 1d4 Piercing replaces the normal damage and the ability modifier is added. On a hit the target makes a DC 13 Constitution save or is Poisoned until the start of your next turn."}]});

 /* ---- Tales from the Yawning Portal (tftyp) and Tomb of Annihilation (toa) ---- */
 A("Bracelet of Rock Magic",{n:"Bracelet of Rock Magic",condImm:["Petrified"],lu:[{n:"Flesh to Stone (bracelet casts)",max:3,reset:"none",tag:"Then only Stone Shape"},{n:"Stone Shape (bracelet casts)",max:13,reset:"none",tag:"After the 13th the bracelet loses its magic"}]});
 A("Flame Tongue Shortsword of Greed",{n:"Ablaze",toggle:{id:"flame-tongue-greed-ablaze",label:"Flame Tongue Shortsword of Greed is ablaze",default:false},atkDice:[{when:"Flame Tongue Shortsword of Greed",d:"2d6",t:"fire"}]});
 A("Macuahuitl",{n:"Macuahuitl",atkDice:[{when:"Macuahuitl",d:"2d6",t:"damage to a creature of the plant type"}]});

 A("Stone of Ill Luck",{n:"Stone of Ill Luck",chkBonus:ab(-2),init:-2});
 A("Waythe",{n:"Waythe",atkDice:[{when:"Waythe",d:"2d6",t:"slashing damage to a creature of the giant type (it also makes a DC 15 Strength save or falls Prone)"}]});
 A("Draconic Longsword",{n:"Draconic Longsword",langs:["Draconic"]});
 A("Charm of the Crystal Heart",{n:"Charm of the Crystal Heart",toggle:{id:"crystal-heart-charm",label:"Charm of the Crystal Heart active (10 days)",default:false},imm:["Piercing damage from nonmagical attacks","Slashing damage from nonmagical attacks"],vul:["Bludgeoning"]});
 A("I'jin",{n:"I'jin",abSet:[["DEX",23]]});
 A("Kubazan",{n:"Kubazan",abSet:[["STR",23]]});
 A("Unkh",{n:"Unkh",abSet:[["CON",23]]});
 A("Nangnang",{n:"Nangnang",mv:{climb:"speed"}});
 A("Obo'laka",{n:"Obo'laka",attune:4});
 A("Papazotl",{n:"Papazotl",advOn:["Wisdom checks"],noSurprise:true,defs:[["Note","Never takes damage from falling"]]});
 A("Shagambi",{n:"Shagambi",extraAttack:2,defs:[["Note","Shagambi: one extra attack when you take the Attack action (on top of any Extra Attack you have)"]]});
 A("Staff of the Forgotten One",{n:"Staff of the Forgotten One",skillExpert:["Arcana","History"],atkDice:[{when:"Staff of the Forgotten One",d:"3d6",t:"necrotic"}]});
 A("Yuan-Ti Pureblood Transformation",{n:"Magic Resistance",advOn:["saves against spells and other magical effects"],lu:{n:"Suggestion (Innate Spellcasting)",max:1,reset:"long",tag:"From 3rd level"}});
 sp("Yuan-Ti Pureblood Transformation",[["Poison Spray",0],["Animal Friendship",0],["Suggestion",0]]);

 /* ---- Grim Hollow (tghg) ---- */
 /* the old row counted Hide Armor 12 + 2 with Dex capped at +2; the text gives AC 14 + Dexterity modifier, nothing else */
 [["Armor of Zombie Flesh"],["Second Skin"]].forEach(function(a){window.FXO[a[0]]={fx:null};A(a[0],{n:a[0],acBase:[14,"full"],acOver:true})});
 A("Pigskin Armor",{n:"Pigskin Armor",acBase:[12,"full"],acOver:true});
 A("Blessed Reliquary",{n:"Blessed Reliquary",advOn:["saving throws caused by Undead"],lu:{n:"Turn Undead: targets save with Disadvantage",max:1,reset:"long"}});
 A("Cap of Bravery",{n:"Cap of Bravery",advOn:["saves to avoid or end the Frightened condition (you and allies in a 30-ft Emanation)"]});
 A("Cloak of the Mausgeist",{n:"Cloak of the Mausgeist",advOn:["saves against spells and other magical effects","Wisdom (Perception) checks that rely on hearing"]});
 A("Cloak of the Stygian Bat",{n:"Cloak of the Stygian Bat",advOn:["Wisdom (Perception) checks that rely on hearing"]});
 A("Dämglesvir (Adept)",{n:"Dämglesvir (Adept)",lu:{n:"Dämglesvir: sweeping strike",max:"pb",reset:"long"}});
 A("Dämglesvir (Master)",{n:"Dämglesvir (Master)",lu:[{n:"Dämglesvir: sweeping strike",max:"pb",reset:"long"},{n:"Dämglesvir: slay (100 HP or less)",max:1,reset:"long"}]});
 A("Fin Symbiote",{n:"Fin Symbiote",advOn:["Constitution saving throws"]});
 /* Full Moon Extract: the Strength 19 of the old row stays (taken = equipped), the advantage only counts while the 1 hour effect is on */
 A("Full Moon Extract",{n:"Full Moon Extract",toggle:{id:"full-moon-extract",label:"Full Moon Extract active (1 hour)",default:false},advOn:["Strength checks","Strength saving throws"]});
 A("Hearthfire Breastplate (Aspirant)",{n:"Hearthfire Breastplate (Aspirant)",lu:{n:"Hearthfire: Shield",max:"pb",reset:"long"}});
 A("Hearthfire Breastplate (Adept)",{n:"Hearthfire Breastplate (Adept)",lu:[{n:"Hearthfire: Shield",max:"pb",reset:"long"},{n:"Hearthfire: Temporary Hit Points",max:"pb",reset:"long"}]});
 A("Hearthfire Breastplate (Master)",{n:"Hearthfire Breastplate (Master)",lu:[{n:"Hearthfire: Shield",max:"pb",reset:"long"},{n:"Hearthfire: Temporary Hit Points",max:"pb",reset:"long"},{n:"Hearthfire: damage Immunity reaction",max:1,reset:"long"}]});
 ["Aspirant","Adept","Master"].forEach(function(t){var n="Indorius's Crown ("+t+")";
  A(n,{n:n,advOn:["Charisma checks","Charisma saving throws"],defs:[["Note","Curse: Disadvantage on Wisdom (Insight) checks and Wisdom saving throws"]]});
  if(t!=="Aspirant")A(n,{n:n,lu:{n:"Crown: ally Reaction attack or spell",max:"pb",reset:"long"}});
  if(t==="Master")A(n,{n:n,defs:[["Note","After a Charisma check you can replace the roll with a 14"]],lu:{n:"Crown: Dominate Monster or Power Word Stun",max:1,reset:"long",tag:"After one, not both again"}})});
 A("Iron Fangs",{n:"Iron Fangs",atkBonus:[{when:"Bite",atk:2,dmg:2,note:"Iron Fangs: Force or Piercing damage, your choice."}]});
 A("Malleus Macabre",{n:"Malleus Macabre",atkBonus:[{when:"Malleus Macabre",crit:19,note:"Use 17-20 if you already have a wider range."}]});
 A("Star Metal Ring",{n:"Star Metal Ring",unarmed:{t:"Force",magic:1}});
 A("Straitjacket",{n:"Straitjacket",acBase:[10,"full","INT"],cond:"noArmor",defs:[["Note","Disadvantage on attack rolls with weapons and Unarmed Strikes"]]});
 A("Sun Shades",{n:"Sun Shades",defs:[["Note","The goggles block your Darkvision while worn (ignore any Darkvision shown)"]]});
 /* tiered artifacts: Ulmyr's Eye */
 A("Ulmyr's Eye (Adept)",{n:"Ulmyr's Eye (Adept)",lu:{n:"Ulmyr's Eye: Advantage or Disadvantage reaction",max:"pb",reset:"long"}});
 A("Ulmyr's Eye (Master)",{n:"Ulmyr's Eye (Master)",lu:[{n:"Ulmyr's Eye: Advantage or Disadvantage reaction",max:"pb",reset:"long"},{n:"Ulmyr's Eye: Foresight",max:1,reset:"long"}]});

 /* ---- Hither Hallow (thhw) ---- */
 window.FXO["Cogwork Wings"]={fx:null};
 A("Cogwork Wings",{n:"Cogwork Wings",pick:[{k:"w",t:"multi",n:1,title:"Total weight with gear worn and carried",list:[["Under 150 lb",""],["150 to 250 lb",""],["Over 250 lb",""]]}]});
 A("Cogwork Wings",{n:"Cogwork Wings",when:{key:"gx-w-item-Cogwork Wings",val:"Under 150 lb"},toggle:{id:"cogwork-wings",label:"Cogwork Wings flapping (1 hour total flight)",default:false},mv:{fly:60}});
 A("Cogwork Wings",{n:"Cogwork Wings",when:{key:"gx-w-item-Cogwork Wings",val:"150 to 250 lb"},toggle:{id:"cogwork-wings",label:"Cogwork Wings flapping (1 hour total flight)",default:false},mv:{fly:30}});
 /* the old rows say "Sorcerer, warlock or wizard" in lower case, so only a Sorcerer passed the attunement check */
 ["Corvum","Gallus","Luma","Raptor","Strig"].forEach(function(r){patch(r+" Feather Robe",{by:"Sorcerer, Warlock or Wizard"});A(r+" Feather Robe",{n:r+" Feather Robe",abPick:{k:"a",from:["INT","CHA"],set:22}})});
 if(!has("Crown of Daffodils","chkBonus"))A("Crown of Daffodils",{n:"Crown of Daffodils",chkBonus:ab(1),init:1});
 A("Fangs of Guile",{n:"Fangs of Guile",advOn:["Deception checks","Insight checks","Persuasion checks"]});
 patch("Marotte of Chance",{base:["Club"]});
 A("Marotte of Chance",{n:"Marotte of Chance",atkAb:{kind:"Marotte of Chance",ab:"CHA"}});
 window.FXO["Necronomicon Ex Corvis"]={fx:null};
 A("Necronomicon Ex Corvis",{n:"Abyssal Secrets",abUp:[["INT",2,30]],abDown:[["WIS",-1,1]]});
 A("Shroud of Ending",{n:"Blessings of Tyton",imm:["All diseases"],saveNote:["Advantage on death saving throws and on saves against effects that would kill you outright"],defs:[["Note","You see in darkness as if it were bright light"]]});
 A("The Thorn of Kren",{n:"The Thorn of Kren",advOn:["Wisdom (Perception) checks","Wisdom (Survival) checks"],unarmed:{die:"1d8",t:"Piercing"},atkBonus:[{when:["unarmed","natural"],atk:2,dmg:2,note:"Vicious Nature: does not stack with other magic item bonuses. The Bite can be used as a Bonus Action each turn."}]});

 /* ---- Kibbles and Deep Magic (tkdm) ---- */
 A("Girdle of Traveling Alchemy",{n:"Girdle of Traveling Alchemy",lu:[{n:"Girdle: Alchemist's Fire flasks",max:2,reset:"dawn"},{n:"Girdle: alchemist's ice flasks",max:2,reset:"dawn"},{n:"Girdle: Acid vials",max:2,reset:"dawn"},{n:"Girdle: swarm repellent jars",max:2,reset:"dawn"},{n:"Girdle: assassin's blood",max:1,reset:"dawn"},{n:"Girdle: potion of climbing",max:1,reset:"dawn"},{n:"Girdle: potion of healing",max:1,reset:"dawn"}]});
 A("Golden Elixir",{n:"Golden Elixir",toggle:{id:"golden-elixir",label:"Golden Elixir drunk",default:false},imm:["Poison","All natural and magical diseases"],condImm:["Poisoned"]});
 A("Iron Elixir",{n:"Iron Elixir",toggle:{id:"iron-elixir",label:"Iron Elixir drunk",default:false},res:["Bludgeoning","Piercing","Slashing"],speedAdd:-10,defs:[["Note","Damage threshold 5"],["Note","Disadvantage on Dexterity saving throws and Dexterity checks that nothing can cancel"]]});
 A("Necronomicon",{n:"Necronomicon",abUp:[["INT",2,24]],abDown:[["WIS",-2,3]],langs:["Void Speech"],lu:{n:"Necronomicon: Dominate Monster",max:1,reset:"dawn"}});
 A("Oathbound Ring",{n:"Oathbound Ring",res:["Bludgeoning from nonmagical attacks","Piercing from nonmagical attacks","Slashing from nonmagical attacks"]});
 A("Scalehide Cream",{n:"Scalehide Cream",toggle:{id:"scalehide-cream",label:"Scalehide Cream scales (1 hour)",default:false},acBase:[15,"","CON"]});

 /* ---- tsdm ---- */
 var LSW=["Ancestral Laser Sword","Ancestral Laser Sword (Laser Sword)","Ancestral Laser Sword (Laser Greatsword)"];
 patch("Ancestral Laser Sword",{base:["Laser Sword","Laser Greatsword"]});
 A("Ancestral Laser Sword",{n:"Upgraded Magic Item",atkBonus:[{when:LSW,atk:LV135,dmg:LV135}]});
 patch("Axe of the Mother Tree",{base:["Battleaxe","Greataxe"]});
 A("Axe of the Mother Tree",{n:"Upgraded Magic Item",atkBonus:[{when:["Axe of the Mother Tree","Axe of the Mother Tree (Battleaxe)","Axe of the Mother Tree (Greataxe)"],atk:LV135,dmg:LV135}]});
 ["Ballistic Sledge","Brass Repeater","Heretical Sunstaff of Ra","Justiciar's Gavel"].forEach(function(n){A(n,{n:"Upgraded Magic Item",atkBonus:[{when:n,atk:LV135,dmg:LV135}]})});
 [1,2,3].forEach(function(k){A("Arcane Carbine +"+k,{n:"Arcane Carbine",spDc:k})});
 A("Arcane Resonator",{n:"Arcane Resonator",attune:4});
 A("Blaster for Dummies",{n:"Blaster for Dummies",defs:[["Note","Proficient with the attuned Martial blaster and can use its mastery"]]});
 A("Bounty Hunter's Vest",{n:"Tactical Nanofiber Vest",acBase:[12,"full"],acOver:true});
 A("Embedded Armor",{n:"Embedded Armor",acBase:[13,"full"],acOver:true});
 A("Exo-Frame",{n:"Integrated Battlefists",weapons:["Battlefist"]});
 A("Finger Picks",{n:"Finger Picks",tools:["Thieves' Tools"]});
 A("Gamma Pendant",{n:"Incomplete",mv:{fly:"speed"}});
 A("Golem Arms",{n:"Golem Arms",advOn:["Strength checks","Strength saving throws"],defs:[["Note","Reach is 5 ft greater on Melee weapon attacks and Unarmed Strikes"]]});
 A("Hacker Hands",{n:"Hacker Hands",lu:{n:"Hacker Hands: hacking reroll",max:1,reset:"long"}});
 A("Heavy Legs",{n:"Heavy Legs",carryBump:true});
 window.FXO["Jetpack"]={fx:null};
 A("Jetpack",{n:"Jetpack",toggle:{id:"jetpack-fly",label:"Jetpack flight (10 minutes)",default:false},mv:{fly:"speed"}});
 A("Logic Unit",{n:"Logic Unit",langs:["Machine Code"]});
 A("Overdrive Module",{n:"Overdrive Module",lu:{n:"Overdrive Module",max:1,reset:"long"}});
 A("Personality Module",{n:"Personality Module",pick:[{k:"sk",t:"skills",n:2,title:"Skills of the module"},{k:"lg",t:"lang",n:2,title:"Languages of the module"}]});
 A("Resistance Plating",{n:"Resistance Plating",pick:[{k:"t",t:"multi",n:1,title:"Damage type",list:["Acid","Cold","Fire","Lightning","Poison","Thunder"].map(function(x){return [x,""]})}]});
 ["Acid","Cold","Fire","Lightning","Poison","Thunder"].forEach(function(t){A("Resistance Plating",{n:"Resistance Plating",when:{key:"gx-t-item-Resistance Plating",val:t},res:[t]})});
 A("Shield Emitter",{n:"Shield Emitter",lu:{n:"Shield Emitter",max:1,reset:"dawn"}});
 A("Shield Module",{n:"Shield Module",lu:{n:"Shield Module: Shield",max:1,reset:"long"}});
 A("Shoulder Cannon",{n:"Shoulder Cannon",lu:{n:"Shoulder Cannon",max:1,reset:"dawn"}});
 A("Sorting Beast",{n:"Sorting Beast",lu:{n:"Sorting Beast: Identify",max:1,reset:"dawn"}});
 A("Thermalsight Eyes",{n:"Thermalsight Eyes",sense:[["Thermalsight",30,""]]});
 A("Traction Spikes",{n:"Traction Spikes",advOn:["saves to avoid the Prone condition"]});
 A("Un's Codex",{n:"Magic Resistance",toggle:{id:"un-codex-magic-res",label:"Un's Codex: Magic Resistance unlocked",default:false},advOn:["saves against spells and other magical effects"]});
 sp("Finger Gun Glove",[["Finger Guns",0]]);
 sp("Logic Unit",[["Technomancy",0]]);
 sp("Shield Module",[["Shield",1]]);

 /* ---- tsgeh and tsgs ---- */
 ["Big Bertha","Moongold Ammunition","Moongold Weapon"].forEach(function(n){A(n,{n:"Moongold",advOn:["saves against the Frightened condition","saves against Madness"]})});
 [1,2,3].forEach(function(k){A("+"+k+" Dragonkin Weapon",{n:"Dragonkin Weapon",dcAdd:{"Breath Weapon":k}})});
 A("Abjurer's Gilder",{n:"Abjurer's Gilder",spells:[[1,"Shield"]],spCls:"Wizard"});
 A("Arcane Mirror",{n:"Arcane Mirror",lu:{n:"Arcane Mirror: Shield",max:1,reset:"short",tag:"Short or Long Rest"}});
 A("Arcanist's Bowstaff",{n:"Arcanist's Bowstaff",atkAb:{kind:"Arcanist's Bowstaff",ab:"INT"}});
 A("Astral Sea Piercer",{n:"Astral Sea Piercer",atkDice:[{when:"Astral Sea Piercer",d:"1d4",t:"force"}]});
 A("Battlechef Buckler",{n:"Battlechef Buckler",advOn:["saves against Fire damage"]});
 patch("Battlechef's Splendid Saucepan",{base:["Mace"]});
 A("Battlechef's Splendid Saucepan",{n:"Battlechef's Splendid Saucepan",atkBonus:[{when:"Battlechef's Splendid Saucepan",atk:1,dmg:1}],atkDice:[{when:"Battlechef's Splendid Saucepan",d:"1d4",t:"thunder to a target in metal armor or made of metal or stone"}]});
 A("Battlechef's Splendid Saucepan",{n:"Worn as a helmet",toggle:{id:"saucepan-helmet",label:"Saucepan worn as a helmet",default:false},acAdd:1,cond:"noHeavy"});
 A("Bloodscryer Oculus",{n:"Bloodscryer Oculus",advOn:["sight-based Wisdom (Perception) checks"],lu:[{n:"Oculus: Hunter's Mark",max:1,reset:"dawn"},{n:"Oculus: Locate Creature",max:1,reset:"dawn"},{n:"Oculus: Scrying",max:1,reset:"dawn"}]});
 A("Brambleheart Quiver",{n:"Brambleheart Quiver",lu:{n:"Brambleheart Quiver: thorned Arrows",max:4,reset:"dawn",tag:"1d3 + 1 regrow at dawn"},atkBonus:[{when:"ranged",note:"Thorned Arrows from the Brambleheart Quiver: +2 to attack and damage rolls."}]});
 A("Circlet of the Huntsman's Third Eye",{n:"Circlet of the Huntsman's Third Eye",advOn:["Wisdom (Survival) checks"]});
 /* Couatl Herald items: the Fly Speed needs three of them attuned. It is a sheet switch because the attuned count is not read here */
 ["Fang","Guard","Lash","Mantle","Radiance","Reach","Scales"].forEach(function(k){A("Couatl Herald's "+k,{n:"Flight of the Couatls",toggle:{id:"couatl-flight",label:"Attuned to three Couatl Herald items (Fly Speed)",default:false},mv:{fly:30}})});
 A("Couatl Herald's Mantle",{n:"Couatl Herald's Mantle",advOn:["saves to avoid or end the Poisoned condition","saves against magical contagions"]});
 A("Crown of Deep Winter",{n:"Crown of Deep Winter",lu:{n:"Crown of Deep Winter: Frozen Burst",max:1,reset:"short",tag:"Short or Long Rest"}});
 A("Dragon Tamer Lance",{n:"Dragon Tamer Lance",langs:["Draconic"],lu:{n:"Dragon Tamer Lance: Find Steed",max:1,reset:"dawn"}});
 A("Dragon's Call",{n:"Dragon's Call",langs:["Draconic"]});
 A("Dragon-Kindled Edge",{n:"Dragon-Kindled Edge",langs:["Draconic"],lu:{n:"Dragon-Kindled Edge: Lesser Draconic Resistance",max:1,reset:"dawn"}});
 A("Eye of Dendallen",{n:"Eye of Dendallen",darkNone:60,darkHave:{add:30}});
 sp("Eye of Dendallen",[["See Invisibility",0]]);
 A("Festerwood Logger",{n:"Festerwood Logger",atkDice:[{when:"Festerwood Logger",d:"1d4",t:"acid (maximized against plants, Plant creatures and wooden objects)"}]});
 A("Festerwood Vizard",{n:"Festerwood Vizard",sense:[["Blindsight",10,""]]});
 A("Festerwood's Light",{n:"Festerwood's Light",imm:["Magical contagions"],lu:{n:"Festerwood's Light: spore burst",max:1,reset:"dusk"}});
 sp("Festerwood's Light",[["Dancing Lights",0]]);
 A("Fife of Dragonsong",{n:"Fife of Dragonsong",tools:["Fife"],weapons:["Blowgun"]});
 A("Forgemaster's Might",{n:"Forgemaster's Might",advOn:["Smith's Tools checks to craft or repair an object using the hammer head as the anvil"],lu:[{n:"Forgemaster's Might: Creation",max:1,reset:"dawn"},{n:"Forgemaster's Might: Fabricate",max:1,reset:"dawn"}]});
 sp("Forgemaster's Might",[["Mending",0]]);
 A("Galea of the Soulfire Phoenix",{n:"Galea of the Soulfire Phoenix",lu:[{n:"Galea: Ignite",max:1,reset:"dawn"},{n:"Galea: From the Ashes",max:1,reset:"none",tag:"Then wait 2 days"}]});
 A("Glove of the Grim Fandango",{n:"Glove of the Grim Fandango",tools:["Musical Instruments (all)"]});
 A("Grip of Dendallen",{n:"Grip of Dendallen",unarmed:{die:"1d6",t:"Necrotic",force:1},lu:[{n:"Grip: Blight",max:1,reset:"dusk"},{n:"Grip: Contagion",max:1,reset:"dusk"},{n:"Grip: Vampiric Touch",max:1,reset:"dusk"}]});
 sp("Hand of the Master",[["Mage Hand",0]]);
 A("Harp of Valor",{n:"Harp of Valor",tools:["Harp"]});
 sp("Hat Trick",[["Prestidigitation",0]]);
 sp("Fireweaver Gloves",[["Produce Flame",0]]);
 A("Helm of Heroes",{n:"Helm of Heroes",acAdd:1,cond:"noBody"});
 A("Hurricane Lance",{n:"Hurricane Lance",lu:{n:"Hurricane Lance: Thunderwave",max:1,reset:"dawn"}});
 if(!has("Ionbreaker, the Tempest's Reach","mv"))A("Ionbreaker, the Tempest's Reach",{n:"Zephyr Step",mv:{fly:"speed"}});
 A("Ionbreaker, the Tempest's Reach",{n:"Ionbreaker",initDie:"1d10"});
 A("Liar's Lyre",{n:"Liar's Lyre",tools:["Lyre"]});
 A("Lightning Pylons",{n:"Lightning Pylons",lu:{n:"Lightning Pylons: rods",max:3,reset:"none",tag:"A spent charge returns after 12 hours"}});
 A("Memento of the Shapeless",{n:"Memento of the Shapeless",lu:{n:"Memento: Pseudopod",max:1,reset:"none",tag:"Usable again after 12 hours"}});
 A("Mockingblade",{n:"Mockingblade",weapons:["Shortsword"]});
 A("Moonswaddled Armor",{n:"Moonswaddled Armor",toggle:{id:"moonswaddled-night",label:"It is night (dusk to dawn)",default:false},acAdd:1});
 A("Pendant of Thieves' Sight",{n:"Pendant of Thieves' Sight",langs:["Thieves' Cant"]});
 A("Pendant of the Tempered Fury",{n:"Pendant of the Tempered Fury",def:["Note","Damage reduction 3 against Bludgeoning, Piercing and Slashing damage (with no armor and no Shield)"]});
 A("Plaguebane Mask",{n:"Plaguebane Mask",advOn:["saves to avoid or end the Poisoned condition","saves against airborne magical contagions"]});
 patch("Bird of a Feather (Uncommon)",{ch:[1,"1","1d4 hours","Unusable for 1d4 hours after each use"]});
})();
