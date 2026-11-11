import {bindLive,renderAll} from "./00a-reg-late-ports.js";import {C,S,save} from "./04-logic-storage.js";import {esc,toast} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {used} from "./08-ui-render-sheet-and-actions.js";import {featAll} from "./08b-ui-render-summaries-actions.js";import {refreshEntry} from "./12-ui-bottom-sheet-modal.js";import {akIcon,atkKind,tyIcon} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {hasFeat,lvOf} from "./32b-logic-play-concentration-casting.js";import {toastU,undoMark} from "./32-logic-play-undo-actions.js";import {modeOn} from "./33-logic-play-rage-conditions.js";import {env} from "./00-env.js";
import {advanceTurnDamageGeneration,divineStrikeDescriptorProblems} from "../data/lib/turn-damage.js";
import {invalidateTurnDamageState} from "./lib/turn-damage-runtime.js";
bindLive("sitAtk",{get:function(){return sitAtk;}});
bindLive("sitCardH",{get:function(){return sitCardH;}});
bindLive("sitDiceRows",{get:function(){return sitDiceRows;}});
bindLive("sitNum",{get:function(){return sitNum;}});
bindLive("sitReset",{get:function(){return sitReset;}});
const SIT=[
 /* in combat */
 {k:"divine-strike",f:["Divine Strike","Blessed Strikes"],n:"Divine Strike",g:"c",t:"used",rs:"turn",s:"Extra-damage rolls mark this allowance Used automatically. You can record or correct a physical-table roll here. New turn restores the allowance."},
 {k:"reckless",f:["Reckless Attack"],n:"Reckless Attack",g:"c",t:"on",rs:"turn",s:"Advantage on your Strength attacks. Attacks against you have Advantage too.",e:{atk:[{t:"ADV",m:"str"}]}},
 {k:"brutal",f:["Brutal Strike","Improved Brutal Strike"],n:"Brutal Strike",g:"c",t:"used",rs:"turn",s:function(){ return sitOn("reckless")?"Give up Advantage on one Strength attack for extra damage.":"Needs Reckless Attack. Give up Advantage for extra damage."; },dice:function(){ if(!sitOn("reckless")) return null; return {dmg:lvOf("Barbarian")>=17?"2d10":"1d10",type:"Weapon type"}; }},
 {k:"sneak",f:["Sneak Attack"],n:"Sneak Attack",g:"c",t:"used",rs:"turn",s:"Once per turn, with Advantage or an ally next to the target. Finesse or ranged weapon.",dice:function(){ return {dmg:Math.max(1,Math.ceil(lvOf("Rogue")/2))+"d6",type:"Weapon type"}; }},
 {k:"studied",f:["Studied Attacks"],n:"Studied Attacks",g:"c",t:"on",rs:"turn",s:"After a miss, your next attack on that target has Advantage.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"eldstrike",f:["Eldritch Strike"],n:"Eldritch Strike",g:"c",t:"on",rs:"turn",s:"After a weapon hit, that target has Disadvantage on its next save against your spell."},
 {k:"ambush",f:["Magical Ambush"],n:"Magical Ambush",g:"c",t:"on",rs:"turn",s:"Hidden or Invisible as you cast: the target has Disadvantage on saves against that spell this turn."},
 {k:"hex",f:["Eldritch Hex"],n:"Eldritch Hex",g:"c",t:"on",rs:"",s:function(st){ return "Hexed target has Disadvantage on "+(st.v.hex||"STR")+" saves."; },o:["STR","DEX","CON","INT","WIS","CHA"]},
 {k:"preciseh",f:["Precise Hunter"],n:"Precise Hunter",g:"c",t:"on",rs:"",s:"Advantage on attacks against the creature your Hunter's Mark is on.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"ancestral",f:["Ancestral Protectors"],n:"Ancestral Protectors",g:"c",t:"on",rs:"turn",rage:1,s:"Raging: the first creature you hit has Disadvantage on attacks against anyone but you."},
 {k:"totemic",f:["Totemic Attunement"],n:"Totemic Attunement",g:"c",t:"on",rs:"",rage:1,pick:"Totemic Attunement",o:["Bear","Eagle","Elk","Tiger","Wolf"],oe:{Eagle:{fly:1}},so:{Bear:"Raging: nearby hostile creatures have Disadvantage on attacks against others.",Eagle:"Raging: Fly Speed equal to your Speed. You fall if you end your turn in the air.",Elk:"Raging: bonus action to run through a creature's space. It may fall Prone and take damage.",Tiger:"Raging: after a 20 ft straight run, bonus action for one more melee attack.",Wolf:"Raging: bonus action to knock a creature you hit Prone."}},
 {k:"powerwilds",f:["Power of the Wilds"],n:"Power of the Wilds",g:"c",t:"on",rs:"",rage:1,o:["Falcon","Lion","Ram"],oe:{Falcon:{fly:1,bare:1}},so:{Falcon:"Raging, no armor: Fly Speed equal to your Speed.",Lion:"Raging: nearby enemies have Disadvantage on attacks against others.",Ram:"Raging: a melee hit can knock a Large or smaller creature Prone."}},
 {k:"rapid",f:["Rapid Strike"],n:"Rapid Strike",g:"c",t:"used",rs:"turn",s:"Give up Advantage on an attack to make one extra weapon attack."},
 {k:"strikefear",f:["Strike Fear"],n:"Terrify",g:"c",t:"on",rs:"",s:"Target is Frightened by your Terrify: Advantage on attacks against it.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"duplicity",f:["Improved Duplicity"],n:"Shared Distraction",g:"c",t:"on",rs:"",s:"Attacking within 5 ft of your illusion: Advantage for you and your allies.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"feast",f:["Feast of Blood"],n:"Feast of Blood",g:"c",t:"on",rs:"short",s:"For 1 minute: +10 ft Speed, Advantage on Strength and Dexterity checks and saves.",e:{spd:10,chkAb:{STR:"ADV",DEX:"ADV"},save:{STR:"ADV",DEX:"ADV"}}},
 {k:"focused",f:["Focused Strike"],n:"Focused Strike",g:"c",t:"on",rs:"turn",s:"After Stunning Strike, the target has Disadvantage on saves against your spells."},
 {k:"bloodshed",f:["Boon of Bloodshed"],n:"Boon of Bloodshed",g:"c",t:"on",rs:"turn",s:"You dropped an enemy: Advantage on your next attack.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"bloodx",f:["Boon of Bloodshed"],n:"Bloodied Damage",g:"c",t:"used",rs:"turn",s:"While Bloodied: extra damage equal to your Proficiency Bonus once per turn.",dice:function(){ return S.hp>0&&D.hpmax&&S.hp<=Math.floor(D.hpmax/2)?{dmg:String(D.pb||2),type:"Weapon type"}:null; }},
 {k:"tokens",f:["Tokens of the Departed"],n:"Soul Trinket",g:"c",t:"on",rs:"",s:"Holding a soul trinket: Advantage on Death Saving Throws and Constitution saves.",e:{ds:"ADV",save:{CON:"ADV"}}},
 {k:"lunar",f:["Lunar Empowerment"],n:"Lunar Phase",g:"c",t:"on",rs:"",o:["Full Moon","New Moon","Crescent Moon"],oe:{"Full Moon":{skill:{Investigation:"ADV",Perception:"ADV"}},"New Moon":{skill:{Stealth:"ADV"}},"Crescent Moon":{res:["Necrotic","Radiant"]}},so:{"Full Moon":"Advantage on Investigation and Perception in the light you shed.","New Moon":"Advantage on Stealth. Attacks against you are at Disadvantage in total darkness.","Crescent Moon":"Resistance to Necrotic and Radiant damage."}},
 {k:"ever",f:["Ever-Ready Shot"],n:"Ever-Ready Shot",g:"c",t:"act",rs:"",lab:"Rolled Initiative",rx:/Arcane Shot/i,s:"On Initiative with no Arcane Shot uses left, regain one."},
 {k:"relent",f:["Relentless"],n:"Relentless",g:"c",t:"act",rs:"",lab:"Rolled Initiative",rx:/Superiority/i,s:"On Initiative with no Superiority Dice left, regain one."},
 {k:"tireless",f:["Tireless Spirit"],n:"Tireless Spirit",g:"c",t:"act",rs:"",lab:"Rolled Initiative",rx:/Fighting Spirit/i,s:"On Initiative with no Fighting Spirit uses left, regain one."},
 {k:"drawdeath",f:["Death's Friend"],n:"Draw of Death",g:"c",t:"act",rs:"",lab:"Rolled Initiative",rx:/Soul|Trinket/i,s:"On Initiative with no soul trinket, gain one. Wails from the Grave can hit both targets."},
 {k:"drunk",f:["Drunkard's Luck"],n:"Drunkard's Luck",g:"c",t:"act",rs:"",lab:"Spend 2 Focus",spend:2,rx:/Focus/i,s:"Spend 2 Focus Points to cancel Disadvantage on a check, attack or save."},
 {k:"surge",f:["Wild Magic Surge"],n:"Wild Magic Surge",g:"c",t:"act",rs:"turn",lab:"Roll d20",roll:"surge",s:function(st){ return st.v.surge_r||"After a spell slot spell, roll a d20. On a 20, roll on the surge table."; }},
 {k:"spirits",f:["Spirits from Beyond"],n:"Spirits from Beyond",g:"c",t:"act",rs:"",lab:"Roll spirit",roll:"spirit",s:function(st){ return st.v.spirit_r||"Roll your Bardic Inspiration die to call a random spirit."; }},
 /* situational */
 {k:"sunlight",f:["Sunlight Sensitivity"],n:"Sunlight Sensitivity",g:"s",t:"on",rs:"",s:"You or your target in direct sunlight: Disadvantage on attacks and sight-based Perception.",e:{atk:[{t:"DIS",m:"all"}],skill:{Perception:"DIS"}}},
 {k:"pack",f:["Pack Tactics"],n:"Pack Tactics",g:"s",t:"on",rs:"",s:"An ally within 5 ft of the target: Advantage on your attack.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"stonecam",f:["Stone Camouflage"],n:"Stone Camouflage",g:"s",t:"on",rs:"",s:"In rocky terrain: Advantage on Stealth to hide.",e:{skill:{Stealth:"ADV"}}},
 {k:"lavastep",f:["Lavastep Grit"],n:"Lavastep Grit",g:"s",t:"on",rs:"",s:"In rocky or underground places: Advantage on Stealth to hide.",e:{skill:{Stealth:"ADV"}}},
 {k:"speech",f:["Speech of Beast and Leaf"],n:"Speech of Beast and Leaf",g:"s",t:"on",rs:"",s:"Influencing Beasts or Plants: Advantage on Charisma checks.",e:{chkAb:{CHA:"ADV"}}},
 {k:"dupl",f:["Expert Duplication","Expert Forgery"],n:"Expert Duplication",g:"s",t:"on",rs:"",s:"Copying writing or craftwork: Advantage on the checks.",e:{chk:"ADV"}},
 {k:"ambusher",f:["Ambusher"],n:"Ambusher",g:"s",t:"on",rs:"",s:"First round of combat, target surprised: Advantage on attacks.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"impostor",f:["Impostor"],n:"Impostor",g:"s",t:"on",rs:"",s:"A wary creature doubts your disguise: Advantage on Deception.",e:{skill:{Deception:"ADV"}}},
 {k:"steady",f:["Steady Eye"],n:"Steady Eye",g:"s",t:"on",rs:"turn",s:"Moved no more than half your Speed: Advantage on Perception and Investigation.",e:{skill:{Perception:"ADV",Investigation:"ADV"}}},
 {k:"supsneak",f:["Supreme Sneak"],n:"Supreme Sneak",g:"s",t:"on",rs:"turn",s:"Moved no more than half your Speed: Advantage on Stealth.",e:{skill:{Stealth:"ADV"}}},
 {k:"keensmell",f:["Keen Smell"],n:"Keen Smell",g:"s",t:"on",rs:"",s:"Checks that involve smell: Advantage on Perception, Survival and Investigation.",e:{skill:{Perception:"ADV",Survival:"ADV",Investigation:"ADV"}}},
 {k:"labyrinth",f:["Labyrinthine Recall"],n:"Labyrinthine Recall",g:"s",t:"on",rs:"",s:"Navigating or tracking: Advantage on Survival.",e:{skill:{Survival:"ADV"}}},
 {k:"amorph",f:["Amorphous"],n:"Amorphous",g:"s",t:"on",rs:"",s:"Starting or escaping a grapple: Advantage on the check.",e:{skill:{Athletics:"ADV",Acrobatics:"ADV"}}},
 {k:"shiftfeat",f:["Shifting Feature"],n:"Shifting Feature",g:"s",t:"on",rs:"short",s:"While shifted: +1 AC. Shifting also gives 1d6 temporary Hit Points.",e:{ac:1}},
 {k:"actor",f:["Actor","Actor (2014)"],n:"Actor",g:"s",t:"on",rs:"",s:"Posing as someone else: Advantage on Deception and Performance.",e:{skill:{Deception:"ADV",Performance:"ADV"}}},
 {k:"grappler",f:["Grappler","Grappler (2014)"],n:"Grappler",g:"s",t:"on",rs:"",s:"Target is grappled by you: Advantage on attacks against it.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"mounted",f:["Mounted Combatant","Mounted Combatant (2014)"],n:"Mounted Combatant",g:"s",t:"on",rs:"",s:"Mounted, target smaller and unmounted: Advantage on attacks.",e:{atk:[{t:"ADV",m:"all"}]}},
 {k:"orders",f:["Order's Resilience"],n:"Order's Resilience",g:"s",t:"on",rs:"",s:"An ally within 5 ft: you both have Advantage on Strength saves.",e:{save:{STR:"ADV"}}},
 {k:"protect",f:["Protection"],n:"Protection",g:"s",t:"used",rs:"turn",s:"Reaction with a Shield: Disadvantage on an attack against a nearby ally."},
 {k:"crusher",f:["Crusher","Crusher (2014)"],n:"Crusher Push",g:"s",t:"used",rs:"turn",s:"Bludgeoning hit: move the target 5 ft, once per turn."},
 {k:"slasher",f:["Slasher","Slasher (2014)"],n:"Slasher Hamstring",g:"s",t:"used",rs:"turn",s:"Slashing hit: cut the target's Speed by 10 ft, once per turn."},
 {k:"lordsal",f:["Lords' Alliance Agent"],n:"Lords' Alliance Agent",g:"s",t:"used",rs:"turn",s:"On a Critical Hit: give a nearby ally Heroic Inspiration."},
 {k:"deftac",f:["Defensive Tactics"],n:"Defensive Tactics",g:"s",t:"on",rs:"turn",pick:"Defensive Tactics",o:["Escape the Horde","Multiattack Defense","Steel Will"],oe:{"Multiattack Defense":{ac:4}},so:{"Escape the Horde":"Opportunity Attacks against you have Disadvantage.","Multiattack Defense":"A creature hit you: +4 AC against its later attacks this turn.","Steel Will":"Advantage on saves against being Frightened."}},
 /* reminders */
 {k:"versatile",f:["Versatile Trickster"],n:"Versatile Trickster",g:"r",t:"rem",s:"Cunning Strike Trip also trips a creature near your Mage Hand."},
 {k:"banneret",f:["Team Tactics"],n:"Team Tactics",g:"r",t:"rem",s:"After Group Recovery, chosen allies have Advantage on D20 Tests."},
 {k:"runecarver",f:["Rune Carver"],n:"Rune Carver",g:"r",t:"rem",s:function(){ const l=lvOf("Fighter"); return "Runes known: "+(l>=15?5:l>=10?4:l>=7?3:2)+". Inscribe one object per rune after a Long Rest."; }},
 {k:"companion",f:["Ranger's Companion"],n:"Ranger's Companion",g:"r",t:"rem",s:function(){ return "Companion adds +"+D.pb+" to AC, attacks, damage and proficient saves. Hit Points: "+Math.max(1,4*lvOf("Ranger"))+" or its normal maximum, if higher."; }},
 {k:"reflexes",f:["Thief's Reflexes"],n:"Thief's Reflexes",g:"r",t:"rem",s:"Round 1: a second turn at your Initiative minus 10. Not when surprised."},
 {k:"saddle",f:["Born to the Saddle"],n:"Born to the Saddle",g:"r",t:"rem",s:"Advantage on saves to avoid falling off your mount."},
 {k:"spite",f:["Spite"],n:"Spite",g:"r",t:"rem"},
 {k:"timber",f:["Timberwalk"],n:"Timberwalk",g:"r",t:"rem",s:"Tracking you is harder. Plants and undergrowth cost no extra movement."},
 {k:"potent",f:["Potent Stone"],n:"Potent Stone",g:"r",t:"rem",s:"Transmuter's Stone holds two benefits. Mighty Build and Tremorsense are new options."},
 {k:"crossbow",f:["Crossbow Expert","Crossbow Expert (2014)"],n:"Crossbow Expert",g:"r",t:"rem",s:"Crossbows lose Loading. An enemy within 5 ft does not give Disadvantage."},
 {k:"elven",f:["Elven Accuracy"],n:"Elven Accuracy",g:"r",t:"rem",s:"Advantage on a Dexterity, Intelligence, Wisdom or Charisma attack: reroll one die."},
 {k:"harper",f:["Harper Teamwork"],n:"Harper Teamwork",g:"r",t:"rem",s:"Help on an attack also gives the enemy Disadvantage on its first save."},
 {k:"sharp",f:["Sharpshooter","Sharpshooter (2014)"],n:"Sharpshooter",g:"r",t:"rem",s:"Ranged attacks ignore cover, long-range Disadvantage and melee-range Disadvantage."},
 {k:"skulk14",f:["Skulker (2014)"],n:"Skulker",g:"r",t:"rem",s:"Hide when lightly obscured. Missing from hiding keeps you hidden."},
 {k:"spellsn",f:["Spell Sniper"],n:"Spell Sniper",g:"r",t:"rem",s:"Spell attacks ignore cover and melee-range Disadvantage."},
 {k:"streetj",f:["Street Justice"],n:"Street Justice",g:"r",t:"rem",s:"Allies have Advantage on attacks against creatures you grapple."},
 {k:"tyro",f:["Tyro of the Gauntlet"],n:"Tyro of the Gauntlet",g:"r",t:"rem",s:"Reaction: stop a nearby ally from being pushed or pulled."},
 {k:"zhent",f:["Zhentarim Ruffian"],n:"Zhentarim Ruffian",g:"r",t:"rem",s:"Opportunity Attack: roll damage twice. Spend Heroic Inspiration for group Initiative Advantage."}
];
/* the spirit table (Spirits from Beyond) and the surge table (Wild Magic Sorcery), written in short form. {d} = your Bardic Inspiration die */
const SIT_SPIRIT=["Beloved: the target heals {d} + Charisma modifier.","Sharpshooter: the target takes Force damage of {d} + Charisma modifier.","Avenger: until the end of your next turn, creatures that hit the target in melee take {d} Force damage.","Renegade: the target can use a Reaction to teleport up to 30 ft.","Fortune Teller: the target has Advantage on D20 Tests until the start of your next turn.","Wayfarer: the target gains {d} + Bard level temporary Hit Points and +10 ft Speed while they last.","Trickster: Wisdom save or {d} twice in Psychic damage and Charmed. Half damage on a save.","Shade: the target turns Invisible until its next turn ends or it acts. Nearby creatures may be Blinded.","Arsonist: Dexterity save or {d} four times in Fire damage. Half on a save.","Coward: Wisdom save or Frightened in a 30 ft Emanation. Speed is halved.","Brute: Strength save or {d} three times in Thunder damage and Prone in a 30 ft Emanation.","Priest: the target heals {d} twice and ends one condition on itself."];
const SIT_SURGE=["Roll on this table at the start of each of your turns for a minute. Skip this result on later rolls.", "For a minute you see invisible creatures that are in your line of sight.", "A DM-controlled modron appears within 5 feet and leaves after a minute.", "You cast Fireball (level 3) centered on yourself.", "You cast Magic Missile as a level 5 spell.", "Roll a d10. Your height changes by that many inches: shrink on odd, grow on even.", "You cast Confusion centered on yourself.", "For a minute you regain 5 Hit Points at the start of each of your turns.", "A beard of feathers grows and stays until you sneeze, which blows the feathers off.", "You cast Grease centered on yourself.", "For a minute, creatures have Disadvantage on saves against the next save-forcing spell you cast.", "Your skin turns bright blue until Remove Curse ends it.", "For a minute an eye on your forehead gives you Advantage on sight-based Perception checks.", "For a minute, your spells that take an action take a Bonus Action instead.", "You teleport up to 60 feet to an empty space you can see.", "You go to the Astral Plane until the end of your next turn, then return to your space or the nearest empty one.", "The next damaging spell you cast within a minute deals maximum damage.", "Roll a d10. Your age changes by that many years: younger on odd (minimum 1), older on even.", "1d6 flumphs appear within 60 feet, DM-controlled and frightened of you. They vanish after a minute.", "You regain 2d10 Hit Points.", "You become a potted plant until the start of your next turn. You are Incapacitated with Vulnerability to all damage. If you drop to 0 Hit Points the pot breaks and you return to normal.", "For a minute you can teleport up to 20 feet as a Bonus Action on each of your turns.", "You cast Levitate on yourself.", "A DM-controlled unicorn appears within 5 feet and leaves after a minute.", "You cannot speak for a minute. Pink bubbles come out when you try.", "For a minute a spectral shield gives you +2 AC and immunity to Magic Missile.", "You cannot get drunk from alcohol for 5d6 days.", "Your hair falls out and regrows within 24 hours.", "For a minute, loose flammable objects you touch (not worn or carried by others) catch fire.", "You regain your lowest-level expended spell slot.", "For a minute you must shout whenever you speak.", "You cast Fog Cloud centered on yourself.", "Up to three creatures you choose within 30 feet take 4d10 Lightning damage.", "You are Frightened of the nearest creature until the end of your next turn.", "Each creature within 30 feet turns Invisible for a minute. It ends for a creature when it attacks or casts a spell.", "You have Resistance to all damage for a minute.", "A random creature within 60 feet is Poisoned for 1d4 hours.", "For a minute you shed bright light in 30 feet. A creature that ends its turn within 5 feet is Blinded until the end of its next turn.", "You cast Polymorph on yourself. If you fail the save, you become a sheep for the duration.", "For a minute illusory butterflies and petals drift within 10 feet of you.", "You can take one extra action right now.", "Each creature within 30 feet takes 1d10 Necrotic damage, and you regain Hit Points equal to the total dealt.", "You cast Mirror Image.", "You cast Fly on a random creature within 60 feet.", "You turn Invisible for a minute and make no sound. It ends if you attack or cast a spell.", "If you die within a minute, you return to life as if by Reincarnate.", "Your size grows by one category for a minute.", "You and every creature within 30 feet have Vulnerability to Piercing damage for a minute.", "Faint ethereal music surrounds you for a minute.", "You regain all expended Sorcery Points."];/* v102: the full d100 table, two numbers per row */
function sitRead(){ const s=S&&S.sit; return s&&typeof s==="object"?{on:s.on||{},used:s.used||{},v:s.v||{}}:{on:{},used:{},v:{}}; }
function sitSt(){ if(!S.sit||typeof S.sit!=="object") S.sit={}; const s=S.sit; if(!s.on) s.on={}; if(!s.used) s.used={}; if(!s.v) s.v={}; return s; }
function sitRow(k){ return SIT.filter((r) =>{ return r.k===k; })[0]; }
let SIT_FORCE=false;
function sitDivineStrikeAvailable(){const descriptor=C.divineStrike;if(divineStrikeDescriptorProblems(descriptor).length)return false;const source=descriptor.source;return (C.rs===undefined?"2024":C.rs)===source.edition&&Number.isFinite(C.level)&&C.level>=source.level&&(source.pre!==""||C.cls==="Cleric")}
function sitHave(r){if(r.k==="divine-strike")return sitDivineStrikeAvailable();return SIT_FORCE||r.f.some(hasFeat); }
env.__sit={table:SIT,force:function(v){ SIT_FORCE=!!v; renderAll(); },n:function(){ return SIT.length; }};/* test hook */
function sitPick(n){ let o=null; (C.features||[]).forEach((g) =>{ (g.items||[]).forEach((f) =>{ if(f.n!==n) return; const m=/\*\*Your choice\.\*\*\s*([^\n*]+)/.exec(String(f.d||f.full||"")); if(m) o=m[1].trim().replace(/\.$/,""); }); }); return o; }
function sitOpts(r){ if(!r.o) return null; if(r.pick){ const p=sitPick(r.pick); if(p){ const m=r.o.filter((x) =>{ return p.toLowerCase().indexOf(x.toLowerCase())===0||x.toLowerCase().indexOf(p.toLowerCase())===0; }); if(m.length) return m; } } return r.o; }
function sitOpt(r,st){ const L=sitOpts(r); if(!L) return null; const v=(st||sitRead()).v[r.k]; return L.indexOf(v)>=0?v:L[0]; }
function sitOn(k,st){ const r=sitRow(k); if(!r||!sitHave(r)) return false; st=st||sitRead(); if(!st.on[k]) return false; return !(r.rage&&!modeOn("rage")); }
function sitEff(r,st){ let e=Object.assign({},r.e||{}); const o=sitOpt(r,st); if(o&&r.oe&&r.oe[o]) e=Object.assign(e,r.oe[o]); if(e.bare&&e.fly&&sitArmored()) delete e.fly; return e; }
function sitArmored(){ return /, (Light|Medium|Heavy) armor \(/.test((C.ac&&C.ac.baseSrc)||""); }/* v102: body armor worn, read from the AC source */
function sitSum(r,st){ const o=sitOpt(r,st); if(o&&r.so&&r.so[o]){ let t=r.so[o]; if(r.oe&&r.oe[o]&&r.oe[o].bare&&sitArmored()) t+=" You wear armor now, so there is no Fly Speed."; return t; } const s=typeof r.s==="function"?r.s(st):r.s; if(s) return s; let T=""; (C.features||[]).forEach((g) =>{ (g.items||[]).forEach((f) =>{ if(!T&&r.f.indexOf(f.n)>=0) T=String(f.d||f.full||"").replace(/[*_]/g,"").replace(/\s+/g," ").trim(); }); }); return T.length>110?T.slice(0,107)+"...":T||"See the feature text."; }
/* numbers that change AC or Speed. kind = "ac" | "spd" */
function sitNum(kind){ const st=sitRead(), out=[]; SIT.forEach((r) =>{ if(r.t!=="on"||!sitOn(r.k,st)) return; const e=sitEff(r,st); if(e[kind]) out.push({v:e[kind],s:r.n}); }); return out; }
/* turned-on rows add their tags to the numbers. Called at the end of cfx() */
export function sitFx(o){ const st=sitRead(); o.atkS=[]; o.dice=[]; SIT.forEach((r) =>{ if(!sitHave(r)) return;
    if(r.t==="on"&&sitOn(r.k,st)){ const e=sitEff(r,st);
      (e.atk||[]).forEach((x) =>{ o.atkS.push({t:x.t,s:r.n,m:x.m}); });
      Object.keys(e.skill||{}).forEach((k) =>{ (o.skill[k]=o.skill[k]||[]).push({t:e.skill[k],s:r.n}); });
      if(e.chk) o.chk.push({t:e.chk,s:r.n});
      Object.keys(e.chkAb||{}).forEach((k) =>{ (o.chkAb[k]=o.chkAb[k]||[]).push({t:e.chkAb[k],s:r.n}); });
      Object.keys(e.save||{}).forEach((k) =>{ (o.save[k]=o.save[k]||[]).push({t:e.save[k],s:r.n}); });
      if(e.ds) o.ds.push({t:e.ds,s:r.n}); if(e.init) o.init.push({t:e.init,s:r.n});
      (e.res||[]).forEach((t) =>{ o.res.push({t:"Resistance",v:t,s:r.n}); });
      if(e.fly&&!o.fly) o.fly={v:"walk",s:r.n}; }
    if(r.dice){ const d=r.dice(); if(d) o.dice.push({k:r.k,n:r.n+" damage",dmg:d.dmg,type:d.type,used:!!st.used[r.k]}); } }); }
/* the tags on one attack row: the common ones, plus the situation tags that fit this weapon */
export function sitAtk(a){ const f=D.cf||{}, base=(f.atk||[]).slice(), k=atkKind(a); (f.atkS||[]).forEach((x) =>{ const ok=x.m==="all"||(x.m==="str"&&a.ab==="STR"&&k!=="spell")||(x.m==="melee"&&(k==="melee"||k==="unarmed"))||(x.m==="ranged"&&k==="ranged"); if(ok) base.push(x); }); return base; }
export function sitReset(kind){invalidateTurnDamageState(S);const advanced=advanceTurnDamageGeneration(S.sit);if(advanced.ok)S.sit=advanced.sit;const s=S.sit; if(!s) return false; let ch=false, rank={turn:1,short:2,long:3}[kind]||3;
  SIT.forEach((r) =>{ const need=r.rs==="turn"?1:r.rs==="short"?2:3; if(rank<need) return; if(s.on&&s.on[r.k]){ delete s.on[r.k]; ch=true; } if(s.used&&s.used[r.k]){ delete s.used[r.k]; ch=true; } if(s.v&&s.v[r.k+"_r"]&&need<=rank){ delete s.v[r.k+"_r"]; ch=true; } });
  return ch; }
function sitFind(r){ let fa=featAll(), x=null; r.f.forEach((n) =>{ if(!x) x=fa.filter((q) =>{ return q.f.n===n; })[0]; }); return x; }
function sitOpenG(g){ const st=sitRead(); return SIT_OPEN[g]!=null?SIT_OPEN[g]:(g==="c"||SIT.some((r) =>{ return r.g===g&&r.t==="on"&&st.on[r.k]&&sitHave(r); })); }
var SIT_OPEN={};
function sitRowH(r,st){ let on=r.t==="on"&&sitOn(r.k,st), used=r.t==="used"&&!!st.used[r.k], fx=sitFind(r), nm=fx?'<button type="button" class="tx sit-n" data-info="f:'+fx.gi+'.'+fx.fi+'">'+esc(r.n)+'</button>':'<b class="sit-n">'+esc(r.n)+'</b>', ctl="";
  if(r.t==="on") ctl='<button type="button" class="sit-sw press'+(on?' on':'')+'" role="switch" aria-checked="'+on+'" aria-label="'+esc(r.n)+'" data-sit="on:'+r.k+'"><i></i></button>';
  else if(r.t==="used") ctl='<button type="button" class="sit-ck press'+(used?' on':'')+'" aria-pressed="'+used+'" data-sit="used:'+r.k+'">'+(used?"Used":"Ready")+'</button>';
  else if(r.t==="act") ctl='<button type="button" class="btn sm sit-ac press" data-sit="act:'+r.k+'">'+esc(r.lab)+'</button>';
  const oo=r.t==="on"&&on&&sitOpts(r), ov=oo?sitOpt(r,st):null;
  const opts=oo&&oo.length>1?'<div class="sit-o" role="group" aria-label="'+esc(r.n)+' option">'+oo.map((x) =>{ return '<button type="button" class="chip press'+(x===ov?' on':'')+'" aria-pressed="'+(x===ov)+'" data-sit="opt:'+r.k+':'+esc(x)+'">'+esc(x)+'</button>'; }).join("")+'</div>':'';
  const need=r.rage&&!modeOn("rage")?'<small class="sit-need">Needs Rage</small>':'';
  return '<div class="sit-r'+(on||used?' on':'')+(r.t==="rem"?' rem':'')+'" data-k="'+r.k+'"><div class="sit-m">'+nm+'<span class="sit-s">'+esc(sitSum(r,st))+'</span>'+need+'</div>'+ctl+opts+'</div>'; }
function sitCardH(){ const st=sitRead(), rows=SIT.filter(sitHave); if(!rows.length) return ""; const act=rows.filter((r) =>{ return r.t==="on"&&sitOn(r.k,st); }).length;
  const G=[["c","In combat"],["s","Situational"],["r","Reminders"]];
  let h='<div class="sit" id="sit"><h3 class="fcat">Situations <span class="apa">'+(act?'• '+act+' on':'')+'</span><button type="button" class="btn sm sit-nt press" data-sit="turn">New turn</button></h3>';
  G.forEach((g) =>{ const L=rows.filter((r) =>{ return r.g===g[0]; }); if(!L.length) return; const op=sitOpenG(g[0]), n=L.filter((r) =>{ return (r.t==="on"&&sitOn(r.k,st))||(r.t==="used"&&st.used[r.k]); }).length;
    h+='<button type="button" class="sit-gh press" aria-expanded="'+op+'" data-sit="grp:'+g[0]+'"><span>'+g[1]+'</span><small>'+L.length+(n?' • '+n+' active':'')+'</small><i aria-hidden="true"></i></button>'+(op?'<div class="sit-l">'+L.map((r) =>{ return sitRowH(r,st); }).join("")+'</div>':''); });
  return h+'</div>'; }
export function sitCombatH(){ const st=sitRead(), rows=SIT.filter((r) =>{ return sitHave(r)&&r.g==="c"&&r.t!=="rem"; }).filter((r) =>{ return r.t!=="on"||!r.rage||modeOn("rage"); }); if(!rows.length) return "";
  return '<div class="conds cbc sit-q">'+rows.map((r) =>{ const on=r.t==="on"?sitOn(r.k,st):r.t==="used"?!!st.used[r.k]:false;
    return '<button type="button" class="chip mode'+(on?' on':'')+' press" '+(r.t==="act"?'':'aria-pressed="'+on+'" ')+'data-sit="'+(r.t==="on"?'on':r.t==="used"?'used':'act')+':'+r.k+'">'+esc(r.n)+(r.t==="used"&&on?' (used)':'')+'</button>'; }).join("")+'<button type="button" class="chip add press" data-sit="turn">New turn</button></div>'; }
function sitDiceRows(){ return ((D.cf||{}).dice||[]).map((x) =>{ return '<div class="arow xd sit-d"><div class="an">'+akIcon("feature")+'<b class="tx">'+esc(x.n)+'</b><small>ONCE PER TURN</small><span class="arng">--</span></div><span class="abox"><button type="button" class="sit-ck press'+(x.used?' on':'')+'" aria-pressed="'+x.used+'" data-sit="used:'+x.k+'">'+(x.used?"Used":"Ready")+'</button></span><span class="abox wide">'+esc(x.dmg)+tyIcon(x.type)+'<small>'+esc(x.type)+'</small></span></div>'; }).join(""); }
function sitActiveLine(){ const st=sitRead(), L=SIT.filter((r) =>{ return r.t==="on"&&sitOn(r.k,st); }).map((r) =>{ const o=sitOpt(r,st); return r.n+(o&&r.o&&r.o.length>1?" ("+o+")":""); }); return L.length?'<p class="sit-act">Active: '+esc(L.join(", "))+'</p>':""; }
function sitRoll(r,st){ const d=function(n){ return 1+Math.floor(Math.random()*n); };
  if(r.roll==="surge"){ const a=d(20); if(a<20){ st.v.surge_r="Rolled "+a+": no surge."; } else { const b=d(100), i=Math.min(SIT_SURGE.length-1,Math.floor((b-1)/2)); st.v.surge_r="Rolled 20. Surge "+b+": "+SIT_SURGE[i]; } st.used[r.k]=1; return st.v.surge_r; }
  if(r.roll==="spirit"){ const bd=lvOf("Bard")>=15?12:lvOf("Bard")>=10?10:lvOf("Bard")>=5?8:6, n=d(bd), t=SIT_SPIRIT[Math.min(SIT_SPIRIT.length,n)-1].replace(/\{d\}/g,"d"+bd); st.v.spirit_r="d"+bd+" rolled "+n+". "+t; return st.v.spirit_r; } return ""; }
function sitDo(spec){
 const _sitDo2Step1=sitDo2Step1(spec);
 const {p, kind, k, r}=_sitDo2Step1;
 let {st}=_sitDo2Step1;
  if(kind==="grp"){ SIT_OPEN[k]=!sitOpenG(k); renderAll(); return; }
  if(kind==="turn"){ undoMark("New turn"); const c=sitReset("turn"); save(); renderAll(); toastU(c?"New turn. Per-turn items are cleared.":"New turn. Nothing to clear."); return; }
  if(!r) return;
 ({st}=sitDo2Step2(st));
  if(kind==="on"){ sitDoOn(p, k, r, st); return; }
  if(kind==="used"){ sitDoUsed(p, k, r, st); return; }
  if(kind==="opt"){ sitDoOpt(p, k, r, st); return; }
  if(kind==="act"){ sitDoAct(p, k, r, st); return; } }
export function beginSituationTurn(){sitDo("turn")}
function sitDoOn(p, k, r, st){ if(!st.on[k]){ if(r.rage&&!modeOn("rage")){ toast("Turn on Rage first."); return; } undoMark(r.n); st.on[k]=1; const L=sitOpts(r); if(L&&!st.v[k]) st.v[k]=L[0]; } else { undoMark("End "+r.n); delete st.on[k]; } save(); renderAll(); refreshEntry(); toastU(r.n+(st.on[k]?" is on.":" is off.")); return; 
}
function sitDoUsed(p, k, r, st){if(k==="divine-strike")invalidateTurnDamageState(S);undoMark(r.n); if(st.used[k]) delete st.used[k]; else st.used[k]=1; save(); renderAll(); toastU(r.n+(st.used[k]?" used.":" ready again.")); return;
}
function sitDoOpt(p, k, r, st){ undoMark(r.n); st.v[k]=p.slice(2).join(":"); save(); renderAll(); return; 
}
function sitDoAct(p, k, r, st){ if(r.roll){ undoMark(r.n); const t=sitRoll(r,st); save(); renderAll(); toastU(t); return; }
    const res=(D.res||[]).filter((q) =>{ return r.rx.test(q.n); })[0]; if(!res){ toast("No matching resource on this sheet."); return; } const left=res.max-used(res.k,res.max);
    if(r.spend){ if(left<r.spend){ toast("Not enough "+res.n+": "+left+" left."); return; } undoMark(r.n); S.used[res.k]=used(res.k,res.max)+r.spend; save(); renderAll(); toastU(res.n+": spent "+r.spend+". Disadvantage canceled."); return; }
    if(left>0){ toast("You still have "+left+" "+res.n+". Nothing to regain."); return; } undoMark(r.n); S.used[res.k]=Math.max(0,res.max-1); save(); renderAll(); toastU(res.n+": regained 1."); 
}
function sitDo2Step1(spec){
 const _sitDoStep1=sitDoStep1(spec);
 const {p, kind, k, r}=_sitDoStep1;
 let {st}=_sitDoStep1;
  return /** @type {any} */ ({p, kind, k, r, st});
}
function sitDo2Step2(st){
 ({st}=sitDoStep2(st));
  return /** @type {any} */ ({st});
}
function sitDoStep1(spec){
let p=String(spec).split(":"), kind=p[0], k=p[1], r=sitRow(k), st;
  return /** @type {any} */ ({p, kind, k, r, st});
}
function sitDoStep2(st){
st=sitSt();
  return /** @type {any} */ ({st});
}
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-sit]"); if(!b) return; e.preventDefault(); e.stopPropagation(); sitDo(b.getAttribute("data-sit")); });
