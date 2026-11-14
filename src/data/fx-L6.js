/* fx batch L6: ledger verdicts for items (shards 15, 16, 17). Registry pattern as fx-H-audit: window.GX.item[name], window.FXO[name].
   Loads after fx-D-item.js (same "fxd" block) so FXO here replaces the row fx where the old row counted a one-use, timed or random effect as permanent.
   Spec notes (the ledger specs were wrong or incomplete in these places, the item text wins):
   - Vanrak's Mithral Shirt, Helm of Underwater Action, Belashyrra's Crown, Danoth's Visor: plain "darkvision / see in darkness out to N feet" with no stacking clause, so darkTo (not darkAdd).
   - Timepiece of Travel, Emerald Pen, Calimemnon Crystal, Draconic Familiar, Echo of Dragonsight, Thassa's Devotee, Ulmyr's Eye, Yuan-Ti Transformation, Charm spells: the spells are already in ITEM_SPELLS (itsp / wotc11), only the numbers and uses were missing.
   - Weapon of Warning: the row already has fx.adv Initiative (C.itemAdv), nothing to add.
   - Teeth of Dahlver-Nar: fx-D-item.js already drops the row fx (FXO null).
   - Ruin's Wake: the extra piercing is 1d8 (Dormant) and 2d8 (Awakened, Exalted).
   - Mace of the Black Crown: poison Resistance starts at Awakened, fire at Exalted (the row had both from Dormant).
   - Wooden Chain of the Unbroken Circle needs a capped AC ability bonus: see reports/ledger-skipped-L6.md. */
DataEnv.slot.GX=DataEnv.slot.GX||{};GX.item=GX.item||{};DataEnv.slot.FXO=DataEnv.slot.FXO||{};
(function(){
 function add(n,e){(GX.item[n]=GX.item[n]||[]).push(e)}
 function tiers(base,f){["Dormant","Awakened","Exalted"].forEach(function(t,i){var e=f(i,t);if(e)[].concat(e).forEach(function(x){if(x.n===base)x.n=base+" ("+t+")";add(base+" ("+t+")",x)})})}
 function sp(n,list,dc){if(typeof ITEM_SPELLS==="undefined")return;var o=ITEM_SPELLS[n]=ITEM_SPELLS[n]||{sp:[]};list.forEach(function(s){if(!o.sp.some(function(q){return q[0]===s[0]}))o.sp.push(s)});if(dc&&o.dc==null)o.dc=dc}
 var AB=["STR","DEX","CON","INT","WIS","CHA"];
 var SLASH=["Handaxe","Sickle","Battleaxe","Glaive","Greataxe","Greatsword","Halberd","Longsword","Scimitar","Whip"];

 /* ---- Languages ---- */
 function lang(n,l,extra){add(n,Object.assign({n:n,langs:l},extra||{}))}
 lang("Tinderstrike",["Ignan"],{atkDice:[{when:"Tinderstrike",d:"2d6",t:"fire"}]});
 lang("Windvane",["Auran"],{atkDice:[{when:"Windvane",d:"1d6",t:"lightning"}]});
 tiers("The Bloody End",function(){return {n:"The Bloody End",langs:["Infernal"],advOn:["Charisma (Intimidation) checks while holding it"]}});
 lang("Tongue of the Dragon",["Draconic"]);
 tiers("Will of the Talon",function(){return {n:"Will of the Talon",langs:["Draconic","Infernal"]}});
 tiers("Blade of Broken Mirrors",function(){return {n:"Blade of Broken Mirrors",langs:["Abyssal"]}});
 tiers("Grovelthrash",function(){return {n:"Grovelthrash",langs:["Abyssal","Infernal"],advOn:["Wisdom (Insight) checks to discern a lie spoken in a language you understand"]}});
 tiers("Lash of Shadows",function(){return {n:"Lash of Shadows",langs:["Abyssal","Draconic"]}});
 tiers("Ruin's Wake",function(i,t){return {n:"Ruin's Wake",langs:["Abyssal","Orc"],atkDice:[{when:"Ruin's Wake ("+t+")",d:i?"2d8":"1d8",t:"piercing"}]}});
 add("Ioun Stone, Language Knowledge",{n:"Ioun Stone, Language Knowledge",pick:[{k:"l",t:"lang",n:1,title:"One extra language (your DM picks it)"}]});

 /* ---- Senses ---- */
 tiers("Verminshroud",function(){return {n:"Verminshroud",darkAdd:60,advOn:["Wisdom (Perception) checks that rely on smell"]}});
 tiers("Wreath of the Prism",function(){return {n:"Wreath of the Prism",darkAdd:60}});
 add("Thermalsight Eyes",{n:"Thermalsight Eyes",sense:[["Thermalsight",30,""]]});

 /* ---- Advantage and condition notes ---- */
 add("Thassa's Disciple",{n:"Thassa's Disciple",advOn:["saving throws against being Charmed or Restrained"]});
 add("Traction Spikes",{n:"Traction Spikes",advOn:["saving throws to avoid the Prone condition"],defs:[["Note","You ignore Difficult Terrain"]]});
 add("Ventilating Lungs",{n:"Ventilating Lungs",advOn:["saving throws against harmful gases (cloudkill, stinking cloud, inhaled poisons, gaseous breath weapons)"]});
 FXO["The Thorn of Kren"]={fx:null};
 FXO["Amethyst Lodestone"]={fx:null};
 add("The Codicil of White",{n:"The Codicil of White",res:["Cold"]});
 add("Yuan-Ti Pureblood Transformation",{n:"Yuan-Ti Pureblood Transformation",advOn:["saving throws against spells and other magical effects"]});
 tiers("Grimoire Infinitus",function(i){var e={n:"Grimoire Infinitus",prepAdd:i+1,spCls:"Wizard"};if(i===1||i===2)e.advOn=["saving throws against spells and magical effects"];return e});
 ["Aspirant","Adept","Master"].forEach(function(t,i){var n="Ulmyr's Eye ("+t+")";
  add(n,{n:"Ulmyr's Eye",defs:[["Note","Curse: Disadvantage on Wisdom (Perception) and Intelligence (Investigation) checks"]]});
  if(i)add(n,{n:"Ulmyr's Eye: Reaction",lu:{n:"Ulmyr's Eye: give Advantage or Disadvantage",max:"pb",reset:"long"}})});
 ["Slumbering","Stirring","Wakened","Ascendant"].forEach(function(t){add(t+" Dragon-Touched Focus",{n:"Dragon-Touched Focus",initAdv:true})});
 add("Weapon of Warning",{n:"Weapon of Warning",defs:[["Note","You and allies within 30 feet have Advantage on Initiative rolls while you are attuned and it is within reach"]]});

 /* ---- Skills, tools, weapons ---- */
 var GK="gx-gl-item-Living Gloves";
 add("Thayan Spell Tattoo",{n:"Thayan Spell Tattoo",pick:[1,2,3].map(function(l){return {k:"s"+l,t:"cantrip",lvl:l,n:1,opt:1,title:"Tattoo spell, level "+l+" (fill only the level of your tattoo)"}})});

 /* ---- Ability scores, saves, AC ---- */
 add("Tome of Clear Thought",{n:"Tome of Clear Thought"});
 add("Tome of Leadership and Influence",{n:"Tome of Leadership and Influence"});
 add("Tome of Understanding",{n:"Tome of Understanding"});
 add("Unkh",{n:"Unkh",abSet:[["CON",23]]});
 FXO["Ioun Stone of Vitality"]={fx:null};
 FXO["Tasha's Creeping Keelboat"]={fx:null};
 FXO["The Infernal Machine of Lum the Mad"]={fx:null};
 FXO["Platinum Scarf"]={fx:null};add("Platinum Scarf",{n:"Platinum Scarf",lu:{n:"Platinum Scarf scales",max:3,reset:"dawn"}});
 FXO["Toadstool Toddy"]={fx:null};add("Toadstool Toddy",{n:"Toadstool Toddy",toggle:{id:"toadstool-toddy",label:"Toadstool Toddy active (1 hour)"},imm:["Fire","Cold"]});
 FXO["Wingwear"]={fx:null};add("Wingwear",{n:"Wingwear",toggle:{id:"wingwear-glide",label:"Gliding on Wingwear (flying speed 30 ft until you land)"},mv:{fly:30}});
 FXO["Infiltrator's Key (Dormant)"]={fx:null};FXO["Infiltrator's Key (Awakened)"]={fx:null};FXO["Infiltrator's Key (Exalted)"]={fx:null};
 [1,2,3].forEach(function(n,i){var t=["Dormant","Awakened","Exalted"][i];
  FXO["Hide of the Feral Guardian ("+t+")"]={fx:{ac:n}};
  add("Hide of the Feral Guardian ("+t+")",{n:"Hide of the Feral Guardian",toggle:{id:"feral-guardian-transformed",label:"Transformed by an effect that replaces your statistics (+"+n+" melee attack and damage)"},atkBonus:[{when:["melee","unarmed","natural"],atk:n,dmg:n}]});
  add("Mace of the Black Crown ("+t+")",{n:"Mace of the Black Crown",langs:["Infernal"]});
  add("Mace of the Black Crown ("+t+")",{n:"Mace of the Black Crown: Ablaze",toggle:{id:"black-crown-ablaze",label:"Mace ablaze (bonus action, extra "+n+"d6 fire)"},atkDice:[{when:"Mace of the Black Crown ("+t+")",d:n+"d6",t:"fire"}]})});
 FXO["Mace of the Black Crown (Dormant)"]={fx:{atk:1,dmg:1}};
 FXO["Mace of the Black Crown (Awakened)"]={fx:{atk:2,dmg:2,res:["Poison"]}};

 /* ---- Movement ---- */
 add("Calimemnon Crystal",{n:"Calimemnon Crystal",mv:{fly:30}});

 /* ---- Extra damage ---- */
 add("Wand of Orcus",{n:"Wand of Orcus",atkDice:[{when:"Wand of Orcus",d:"2d12",t:"necrotic",roll:true}]});
 /* Vicious Weapon: the base-weapon aliases are separate inventory names */
 ["Vicious Weapon"].concat(["Longsword","Battleaxe","Blowgun","Club","Dagger","Dart","Flail","Glaive","Greataxe","Greatclub","Greatsword","Halberd","Hand Crossbow","Handaxe","Heavy Crossbow","Javelin","Lance","Light Crossbow","Light Hammer","Longbow","Mace","Maul","Morningstar","Musket","Pike","Pistol","Quarterstaff","Rapier","Scimitar","Shortbow","Shortsword","Sickle","Sling","Spear","Trident","War Pick","Warhammer","Whip"].map(function(b){return "Vicious Weapon ("+b+")"})).forEach(function(n){add(n,{n:n,atkDice:[{when:n,d:"2d6",t:"(same type as the weapon)"}]})});

 /* ---- Limited use ---- */
 add("Tankard of Plenty",{n:"Tankard of Plenty",lu:{n:"Tankard of Plenty",max:3,reset:"dawn"}});
 add("Thassa's Devotee",{n:"Thassa's Devotee",lu:{n:"Fog Cloud (Thassa's Devotee)",max:"mod:INT",reset:"long"}});
 add("Orc Stone",{n:"Orc Stone",lu:{n:"Orc Stone",max:3,reset:"none",tag:"Turns to dust after the third use"}});
 add("Yuan-Ti Pureblood Transformation",{n:"Yuan-Ti Pureblood Transformation"});
 add("Yuan-Ti Pureblood Transformation",{n:"Yuan-Ti Pureblood Transformation",l:3,lu:{n:"Suggestion (Yuan-ti)",max:1,reset:"long"}});
})();
