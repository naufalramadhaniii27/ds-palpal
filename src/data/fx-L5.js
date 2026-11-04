/* fx data L5 (ledger fixes, shards 12 to 14: items Necronomicon to Sword of Zariel). Registry pattern as fx-D-item.js: window.FXO[item] replaces the old row fx, window.GX.item[item] adds engine entries (SOURCE-NOTES.md, "fx schema" and "fx engine v4").
   Every entry was written from the item text, not from the reviewer spec alone. Where the text and the spec differ the text won (reports/ledger-fixes-L5.md).
   Entries carry _L5:1 so loading this file twice, or after another file that added the same entry by name, never counts a bonus twice.
   Switches (toggle): states that need an action, a place or a decision at the table (hood up, cloud form, ruidium rage, evil alignment, a slain elemental).
   Text only on purpose or not possible yet: reports/ledger-skipped-L5.md. */
window.GX=window.GX||{};GX.item=GX.item||{};GX.cls=GX.cls||{};window.FXO=window.FXO||{};
(function(){
 function add(n,e){e._L5=1;var L=GX.item[n]=(GX.item[n]||[]);L.push(e)}
 /* drop entries of an earlier load of this file, and other-file entries of the same effect that this file replaces (opts.n + key) */
 var NAMES={};
 function reg(n){NAMES[n]=1}
 var AB6=["STR","DEX","CON","INT","WIS","CHA"];
 function adv(n,t){reg(n);add(n,{n:n,advOn:t})}
 function resPick(n,types,title,k){reg(n);k=k||"rt";add(n,{n:n,pick:[{k:k,t:"multi",n:1,title:title,list:types.map(function(t){return [t,""]})}]});
  types.forEach(function(t){add(n,{n:n,when:{key:"gx-"+k+"-item-"+n,val:t},res:[t]})})}
 var T6=["Acid","Cold","Fire","Lightning","Poison","Thunder"];
 var T10=["Acid","Cold","Fire","Force","Lightning","Necrotic","Poison","Psychic","Radiant","Thunder"];
 var DV=function(n){reg(n);add(n,{n:n,darkNone:60,darkHave:{add:60}})};
 var RIDER=function(n,d,t,note){reg(n);add(n,{n:n,atkDice:[{when:n,d:d,t:t,note:note}]})};

 /* ---------- shard 12 ---------- */
 W("Necronomicon Ex Corvis",null);add("Necronomicon Ex Corvis",{n:"Abyssal Secrets",abUp:[["INT",2,30]],abDown:[["WIS",-1,1]]});
 add("Nether Scroll of Azumar",{n:"Nether Scroll of Azumar",abUp:[["INT",2,22]],advOn:["saving throws against spells and other magical effects"]});
 W("Netherese Ring of Protection",{ac:1,save:1});
 /* Nightbringer: the immunity is one chosen type, and every benefit needs an evil alignment */
 W("Nightbringer",{atk:3,dmg:3});
 (function(n){var tg={id:"nightbringer-evil",label:"Evil alignment (Nightbringer benefits)"};
  add(n,{n:n,toggle:tg,condImm:["Charmed","Frightened"],darkNone:60,darkHave:{add:60},atkDice:[{when:"Nightbringer",d:"4d4",t:"radiant"}],pick:[{k:"imm",t:"multi",n:1,title:"Damage immunity (choose when you attune)",list:["Acid","Cold","Fire","Lightning","Poison"].map(function(t){return [t,""]})}]});
  ["Acid","Cold","Fire","Lightning","Poison"].forEach(function(t){add(n,{n:n,toggle:tg,when:{key:"gx-imm-item-"+n,val:t},imm:[t]})})})("Nightbringer");
 W("Niko's Mace",null);
 W("Nimbus Coronet",null);
 add("Nimbus Coronet",{n:"Cloud form",toggle:{id:"nimbus-cloud",label:"Cloud form (1 minute)"},mv:{fly:60},res:["Bludgeoning","Piercing","Slashing"]});
 add("Nimbus Coronet",{n:"Nimbus Coronet",defs:[["Note","You take no damage from falling"]]});
 add("Nylea's Devotee",{n:"Nylea's Devotee",lu:{n:"Hunter's Mark (Nylea's Devotee)",max:"mod:WIS",reset:"long"}});
 add("Nylea's Votary",{n:"Nylea's Votary",lu:{n:"Speak with Animals (Nylea's Votary)",max:"mod:WIS",reset:"long"},advOn:["saving throws against the Poisoned condition"]});
 add("Oathbound Ring",{n:"Oathbound Ring",def:["Resistance","Bludgeoning, Piercing and Slashing damage from nonmagical attacks"]});
 add("Obo'laka",{n:"Obo'laka",attune:4});
 add("Obsidian Flint Dragon Plate",{n:"Obsidian Flint Dragon Plate",res:["Poison"],advOn:["ability checks and saving throws made to avoid or end the Grappled condition on you"]});
 add("Ominous Staff of Skulls",{n:"Chill Touch (staff)",spells:[[1,"Chill Touch"]]});
 add("Orb of Damara",{n:"Flight",mv:{fly:60},defs:[["Note","You can hover while flying"]]});
 add("Orb of Skoraeus",{n:"Orb of Skoraeus",saveNote:["+2 bonus to Constitution saving throws to maintain concentration"],darkTo:120,defs:[["Note","Divine Sight: you see normally in magical and nonmagical darkness to 120 feet"]]});
 W("Orb of the Veil",null);add("Orb of the Veil",{n:"Orb of the Veil",abUp:[["WIS",2,22]],darkNone:60,darkHave:{add:60},advOn:["Wisdom checks to find hidden doors and paths"]});
 W("Orcsplitter",{atk:2,dmg:2,condImm:["Frightened"]});
 add("Ouroboros Rapier",{n:"Ouroboros Rapier",atkBonus:[{when:"Ouroboros Rapier",note:"Each 8 rolled on a damage die adds 1d8 Poison damage."}]});
 add("Papazotl",{n:"Papazotl",advOn:["Wisdom checks"],noSurprise:true,defs:[["Note","You never take damage from falling"]]});
 W("Pariah's Shield",null);
 (function(n){add(n,{n:n,pick:[{k:"al",t:"multi",n:1,title:"Allies within 5 feet of you",list:[["2 or 3 allies (+1 AC)",""],["4 or 5 allies (+2 AC)",""],["6 or more allies (+3 AC)",""]]}]});
  [["2 or 3 allies (+1 AC)",1],["4 or 5 allies (+2 AC)",2],["6 or more allies (+3 AC)",3]].forEach(function(r){add(n,{n:n,when:{key:"gx-al-item-"+n,val:r[0]},acAdd:r[1]})})})("Pariah's Shield");
 add("Pendant of Thieves' Sight",{n:"Pendant of Thieves' Sight",langs:["Thieves' Cant"]});
 add("Pendant of the Tempered Fury",{n:"Pendant of the Tempered Fury",cond:"noArmor",defs:[["Reduction","Bludgeoning, Piercing and Slashing damage you take is reduced by 3 (no armor and no Shield)"]]});
 add("Peregrine Mask",{n:"Peregrine Mask",initAdv:true});
 add("Periapt of Health",{n:"Periapt of Health",advOn:["saving throws to avoid the Poisoned condition or to shake it off"]});
 add("Petal Dancer Ward",{n:"Druidcraft (cloak)",spells:[[1,"Druidcraft"]]});
 add("Pharika's Devotee",{n:"Pharika's Devotee",lu:{n:"Ray of Sickness (Pharika's Devotee)",max:"mod:WIS",reset:"long"}});
 add("Pharika's Disciple",{n:"Pharika's Disciple",lu:{n:"Pharika's Disciple: heal or weaken",max:"mod:WIS",reset:"long"}});
 add("Pharika's Votary",{n:"Pharika's Votary",advOn:["saving throws against being poisoned"],def:["Immunity","Disease"]});
 add("Phenax's Devotee",{n:"Phenax's Devotee",lu:{n:"Disguise Self (Phenax's Devotee)",max:"mod:CHA",reset:"long"}});
 add("Pigskin Armor",{n:"Pigskin Armor",defs:[["Note","Counts as light armor"]]});
 (function(){var tg={id:"cloak-hood-up",label:"Cloak hood up"};
  ["Piwafwi (Cloak of Elvenkind)","Piwafwi of Fire Resistance"].forEach(function(n){add(n,{n:"Hood up",toggle:tg,advOn:["Dexterity (Stealth) checks made to hide"],defs:[["Note","Wisdom (Perception) checks to see you have Disadvantage (hood up)"]]})});
  add("Piwafwi of Fire Resistance",{n:"Piwafwi of Fire Resistance",res:["Fire"]})})();
 add("Plaguebane Mask",{n:"Plaguebane Mask",advOn:["saves to avoid or end the Poisoned condition and airborne magical contagions"]});
 W("Platinum Scarf",null);
 W("Potion of Glacial Resistance",null);add("Potion of Glacial Resistance",{n:"Glacial Resistance",toggle:{id:"glacial-potion",label:"Potion active (1 hour)"},res:["Cold"]});
 add("Powered Armor",{n:"Powered Armor",saveNote:["Advantage on death saving throws"]});
 add("Pulverizing Staff of Skulls",{n:"Chill Touch (staff)",spells:[[1,"Chill Touch"]]});
 add("Purity Spear",{n:"Purity Spear",advOn:["Constitution and Wisdom saving throws against spells and other magical effects"]});
 add("Purphoros's Devotee",{n:"Purphoros's Devotee",lu:{n:"Shield of Faith (Purphoros's Devotee)",max:"mod:INT",reset:"long"},spells:[[1,"Mending"]],spCls:"@sub:INT"});
 add("Purphoros's Votary",{n:"Purphoros's Votary",advOn:["saving throws against being knocked prone"]});
 add("Ranseur of Torture",{n:"Ranseur of Torture",atkBonus:[{when:"Ranseur of Torture",note:"The pike deals 2d10 piercing damage instead of its regular damage. A good creature takes an extra 1d10 necrotic. A creature below full Hit Points takes an extra 1d10 piercing."}]});
 add("Raptor Feather Robe",{n:"Raptor Feather Robe",abPick:{k:"a",from:["INT","CHA"],set:22}});

 /* ---------- shard 13 ---------- */
 add("Red Claw's Regalia",{n:"Red Claw's Regalia",abUp:[["CON",2,22]],advOn:["Constitution saving throws"]});
 RIDER("Red Wizard Blade","3d12","Necrotic","Melee hit with the dagger");
 resPick("Resistance Plating",T6,"Damage type (picked by the GM or rolled)");
 resPick("Resistance Suture",T6,"Damage type the donor was immune to");
 resPick("Ring of Resistance",T10,"Damage type (the gemstone)");
 /* Rings of Elemental Command: the language and the base trait are always on, the traits after helping slay an elemental are a switch */
 (function(){var R={Air:{lang:"Auran",base:{},slain:{res:["Lightning"],mv:{fly:"speed"},defs:[["Note","You can hover"]]}},
   Earth:{lang:"Terran",base:{},slain:{res:["Acid"]}},
   Fire:{lang:"Ignan",base:{res:["Fire"]},slain:{imm:["Fire"]}},
   Water:{lang:"Aquan",base:{},slain:{mv:{swim:"speed"},defs:[["Note","You can breathe underwater"]]}}};
  Object.keys(R).forEach(function(p){var n="Ring of "+p+" Elemental Command",r=R[p];
   if(p==="Fire")W(n,null);else if(p==="Air"||p==="Earth")W(n,null);
   add(n,Object.assign({n:n,langs:[r.lang]},r.base));
   add(n,Object.assign({n:"Slain "+p.toLowerCase()+" elemental",toggle:{id:"ring-"+p.toLowerCase()+"-slain",label:"You helped slay "+(p==="Air"||p==="Earth"?"an":"a")+" "+p.toLowerCase()+" elemental"}},r.slain))});
  /* the generic ring: the DM picks the plane */
  var n="Ring of Elemental Command",K="gx-pl-item-"+n;
  add(n,{n:n,pick:[{k:"pl",t:"multi",n:1,title:"Plane the ring is tied to",list:["Air","Earth","Fire","Water"].map(function(t){return [t,""]})}]});
  add(n,{n:"Elemental Focus (Air)",when:{key:K,val:"Air"},res:["Lightning"],mv:{fly:"speed"},langs:["Auran"],defs:[["Note","You can hover"]]});
  add(n,{n:"Elemental Focus (Earth)",when:{key:K,val:"Earth"},res:["Acid"],langs:["Terran"]});
  add(n,{n:"Elemental Focus (Fire)",when:{key:K,val:"Fire"},imm:["Fire"],langs:["Ignan"]});
  add(n,{n:"Elemental Focus (Water)",when:{key:K,val:"Water"},mv:{swim:60},langs:["Aquan"],defs:[["Note","You can breathe underwater"]]})})();
 add("Ring of Djinni Summoning",{n:"Ring of Djinni Summoning",lu:{n:"Call a Djinni",max:1,reset:"long",tag:"back after 24 hours"}});
 W("Ring of Red Fury",{swim:"walk"});
 add("Ring of Red Fury",{n:"Ruidium Rage",toggle:{id:"ruidium-rage",label:"Ruidium Rage (1 minute)"},condImm:["Paralyzed","Restrained"],advOn:["Strength checks and Strength saving throws"]});
 (function(n){var T=["Aberration","Celestial","Dragon","Elemental","Fey","Fiend","Undead"];
  add(n,{n:n,pick:[{k:"ct",t:"multi",n:1,title:"Creature type (choose when you attune)",list:T.map(function(t){return [t,""]})}]});
  T.forEach(function(t){add(n,{n:n,when:{key:"gx-ct-item-"+n,val:t},advOn:["saves against being Charmed or Frightened by a "+t]})})})("Ring of Seething");
 adv("Ring of Spell Turning",["saving throws against spells"]);
 add("Robe of Eyes",{n:"Robe of Eyes",sense:[["Truesight",120,""]],advOn:["Wisdom (Perception) checks that rely on sight"]});
 adv("Robe of the Archmagi",["saving throws against spells and other magical effects"]);
 adv("Rod of Wild Dominion",["Wisdom (Animal Handling) and Wisdom (Survival) checks"]);
 /* fx-int: Rogue's Mantle is already defined in fx-L2 */
 W("Ruidium Shield",{res:["Psychic"],swim:"walk"});
 adv("Scarab of Protection",["saving throws against spells"]);
 [1,2,3].forEach(function(v){var n="Scholar's Cap +"+v;reg(n);add(n,{n:n,saveBonusAb:[["INT",v]],chkBonus:[["INT",v]]})});
 W("Second Skin",null);add("Second Skin",{n:"Second Skin",acBase:[14,"full"],acOver:true});
 add("Septum Ring of the Great Minotaur",{n:"Septum Ring of the Great Minotaur",abUp:[["STR",2,22]],advOn:["Strength checks"],carryBump:true});
 RIDER("Serpent's Fang","1d10","Poison","Hit with the sword");
 W("Shaarat'doovol, the Blade of Truth",{atk:3,dmg:3});
 add("Shaarat'doovol, the Blade of Truth",{n:"Unyielding Duty",toggle:{id:"shaarat-favors",label:"The blade favors you"},sense:[["Truesight",90,""]],res:["Psychic"],condImm:["Charmed","Frightened"]});
 adv("Shadow Ward",["Dexterity (Stealth) checks"]);
 add("Shadowfell Brand Tattoo",{n:"Shadow Essence",darkNone:60,darkHave:{add:60},advOn:["Dexterity (Stealth) checks"]});
 W("Shard of Xeluan",{spellAtk:1,abil:["STR",4,22]});
 add("Shield Emitter",{n:"Shield Emitter",lu:{n:"Shield Emitter",max:1,reset:"dawn"}});
 add("Shield Module",{n:"Shield Module",lu:{n:"Shield (Shield Module)",max:1,reset:"long"},spells:[[1,"Shield"]]});
 W("Shield of the Blazing Dreadnought",null);
 add("Shield of the Blazing Dreadnought",{n:"Blazing Soul",toggle:{id:"dreadnought-active",label:"Shield active (1 minute)"},imm:["Fire"]});
 add("Shield of the Hidden Lord",{n:"Shield of the Hidden Lord",res:["Fire"]});
 W("Shield of the Uven Rune",{imm:["Cold"]});
 add("Shoulder Cannon",{n:"Shoulder Cannon",lu:{n:"Shoulder Cannon",max:1,reset:"dawn"}});
 add("Shroud of Ending",{n:"Blessings of Tyton",saveNote:["Advantage on death saving throws and on saves against effects that would kill you outright"],def:["Immunity","Disease"],defs:[["Note","You see in darkness as if it were bright light"]]});

 /* ---------- shard 14 ---------- */
 ["Awakened","Dormant","Exalted"].forEach(function(s){var n="Silken Spite ("+s+")";reg(n);
  add(n,{n:"Silken Spite",langs:["Abyssal","Elvish","Undercommon"],darkNone:60,darkHave:{add:60}});
  if(s!=="Dormant")add(n,{n:"Silken Spite spells",lu:["Cloudkill","Darkness","Levitate","Web"].map(function(x){return {n:x+" (Silken Spite)",max:1,reset:"long",tag:"save DC "+(s==="Exalted"?17:15)}})})});
 add("Silver Eagle Weapon",{n:"Silver Eagle Weapon",atkBonus:[{when:"Silver Eagle Weapon",note:"It deals 2d6 damage on a hit instead of its normal dice. A Critical Hit does not double the dice."}]});
 add("Sirensong Silencer",{n:"Sirensong Silencer",toggle:{id:"sirensong-on",label:"Ear cuff put on",default:true},advOn:["saves to avoid or end the Charmed condition"]});
 add("Slumbering Scaled Ornament",{n:"Slumbering Scaled Ornament",advOn:["saving throws to avoid being charmed or frightened or to end those conditions"]});
 add("Snicker-Snack",{n:"Snicker-Snack",weapons:["Greatsword"],atkAb:{kind:"Snicker-Snack",ab:"CHA"}});
 RIDER("Snuff","1d6","Psychic","Hit with the sickle");
 add("Sorting Beast",{n:"Sorting Beast",lu:{n:"Identify (Sorting Beast)",max:1,reset:"dawn"}});
 add("Spell Duelist's Trophy",{n:"Mage Hand (trophy)",spells:[[1,"Mage Hand"]]});
 add("Spellguard Shield",{n:"Spellguard Shield",toggle:{id:"spellguard-held",label:"Holding the Spellguard Shield",default:true},advOn:["saving throws against spells and other magical effects"],defs:[["Note","Spell attack rolls against you have Disadvantage"]]});
 RIDER("Spider Staff","1d6","Poison","Weapon hit with the staff");
 add("Spirit Pike",{n:"Spirit Pike",weapons:["Pike"]});
 W("Splitter",{atk:3,dmg:3});add("Splitter",{n:"Split Splitter",toggle:{id:"splitter-split",label:"Split into Handaxe and Quarterstaff (one in each hand)"},acAdd:1});
 GX.cls.Druid=(GX.cls.Druid||[]).filter(function(e){return !e._L5});GX.cls.Druid.push({_L5:1,n:"Squasher",atkAb:{kind:"Squasher",ab:"WIS"}});
 add("Staff of Thunder and Lightning",{n:"Staff of Thunder and Lightning",lu:["Lightning","Thunder","Thunder and Lightning","Lightning Strike","Thunderclap"].map(function(x){return {n:x+" (Staff of Thunder and Lightning)",max:1,reset:"dawn"}})});
 add("Staff of the Forgotten One",{n:"Staff of the Forgotten One",skillExpert:["Arcana","History"],atkDice:[{when:"Staff of the Forgotten One",d:"3d6",t:"Necrotic",note:"Hit with the staff"}]});
 adv("Staff of the Magi",["saving throws against spells"]);
 add("Staff of the Sorcerer King",{n:"Staff of the Sorcerer King",weapons:["Spear"],advOn:["saving throws against spells that target only you"]});
 add("Star Metal Ring",{n:"Star Metal Ring",unarmed:{t:"Force",magic:true}});
 RIDER("Starbreaker","1d4","Radiant","Hit with the morningstar");
 W("Starmetal Shield",{ac:-1});
 (function(n){add(n,{n:n,pick:[{k:"md",t:"multi",n:1,title:"Form of the axe",list:[["Fused (Greataxe)",""],["Fissioned (two Battleaxes)",""]]}]});
  add(n,{n:n,when:{key:"gx-md-item-"+n,val:"Fused (Greataxe)"},atkDice:[{when:n,d:"2d6",t:"Fire",note:"Fused axe hit"}]});
  add(n,{n:n,when:{key:"gx-md-item-"+n,val:"Fissioned (two Battleaxes)"},atkDice:[{when:n,d:"1d6",t:"Cold",note:"Fissioned axe hit (each Battleaxe)"}]})})("Starmetal Solar Axe");
 RIDER("Starmetal Striker","1d4","Cold","Hit with the hammer");
 add("Stone of Ill Luck",{n:"Stone of Ill Luck",chkBonus:AB6.map(function(a){return [a,-2]}),init:-2});
 add("Stonebreaker's Breastplate",{n:"Stonebreaker's Breastplate",condImm:["Prone"]});
 add("Stonemaker War Pick",{n:"Stonemaker War Pick",lu:{n:"Petrification charges (roll 1d6 + 1 when found)",max:7,reset:"none"}});
 adv("Stonespeaker Crystal",["Intelligence (Investigation) checks"]);
 add("Storm Sickle",{n:"Storm Sickle",weapons:["Sickle"],atkDice:[{when:"Storm Sickle",d:"1d4",t:"Lightning",note:"Hit with the sickle"}]});
 add("Straitjacket",{n:"Straitjacket",acAdd:"INT",cond:"noArmor",defs:[["Note","Disadvantage on weapon and Unarmed Strike attack rolls while wearing it"]]});
 add("Strig Feather Robe",{n:"Strig Feather Robe",abPick:{k:"a",from:["INT","CHA"],set:22}});
 add("Sun Blade",{n:"Sun Blade",atkBonus:[{when:"Sun Blade",note:"Deals Radiant damage instead of Slashing. Finesse."}]});
 add("Sunsword",{n:"Sunsword",atkBonus:[{when:"Sunsword",note:"Deals Radiant damage instead of Slashing. Finesse."}]});
 RIDER("Sun Staff","1d8","Fire","Hit with the staff");
 add("Sword of Kas",{n:"Spirit of Kas",initDie:"1d10",atkBonus:[{when:"Sword of Kas",crit:19}]});
 add("Sword of Resonance",{n:"Sword of Resonance",weapons:["Longsword"]});
 add("Sword of Zariel",{n:"Sword of Zariel",langs:["Celestial"],mv:{fly:90},sense:[["Truesight",60,""]],defs:[["Note","You can hover"]]});

 /* ---------- old row fx replaced (FXO) ---------- */
 function W(n,fx){FXO[n]={fx:fx};reg(n)}
 /* Rows in the data whose charges changed are edited in the data file (reports/ledger-fixes-L5.md): Staff of Ruling, Star Razor (Awakened, Exalted), Stonemaker War Pick, Pigskin Armor. */

 /* a second load, or an entry added by name elsewhere: keep exactly one copy of each entry written here */
 Object.keys(GX.item).forEach(function(n){var seen=[],out=[];GX.item[n].forEach(function(e){if(e&&e._L5){var k=JSON.stringify(e);if(seen.indexOf(k)>=0)return;seen.push(k)}out.push(e)});GX.item[n]=out});
 /* fx-int: Stone of Good Luck lives in fx-H-audit.js only (the L5 copy and its filter are removed) */
})();
