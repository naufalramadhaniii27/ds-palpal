/* v103 Situations */
/* ===== v103: Situations. Features that depend on the moment (a turn, a place, an ally) get a toggle, a used box or a roll button.
   One table (SIT) drives everything. t: on = switch that changes tags and numbers, used = once-per-turn box, act = button, rem = one-line reminder.
   rs = when it clears on its own: turn (New turn), short (Short Rest), long (Long Rest), "" (long rest only). State lives in S.sit = {on:{}, used:{}, v:{}}. ===== */
var SIT=[
 /* in combat */
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
 {k:"runecarver",f:["Rune Carver"],n:"Rune Carver",g:"r",t:"rem",s:function(){ var l=lvOf("Fighter"); return "Runes known: "+(l>=15?5:l>=10?4:l>=7?3:2)+". Inscribe one object per rune after a Long Rest."; }},
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
var SIT_SPIRIT=["Beloved: the target heals {d} + Charisma modifier.","Sharpshooter: the target takes Force damage of {d} + Charisma modifier.","Avenger: until the end of your next turn, creatures that hit the target in melee take {d} Force damage.","Renegade: the target can use a Reaction to teleport up to 30 ft.","Fortune Teller: the target has Advantage on D20 Tests until the start of your next turn.","Wayfarer: the target gains {d} + Bard level temporary Hit Points and +10 ft Speed while they last.","Trickster: Wisdom save or {d} twice in Psychic damage and Charmed. Half damage on a save.","Shade: the target turns Invisible until its next turn ends or it acts. Nearby creatures may be Blinded.","Arsonist: Dexterity save or {d} four times in Fire damage. Half on a save.","Coward: Wisdom save or Frightened in a 30 ft Emanation. Speed is halved.","Brute: Strength save or {d} three times in Thunder damage and Prone in a 30 ft Emanation.","Priest: the target heals {d} twice and ends one condition on itself."];
var SIT_SURGE=["Roll on this table at the start of each of your turns for a minute. Skip this result on later rolls.", "For a minute you see invisible creatures that are in your line of sight.", "A DM-controlled modron appears within 5 feet and leaves after a minute.", "You cast Fireball (level 3) centered on yourself.", "You cast Magic Missile as a level 5 spell.", "Roll a d10. Your height changes by that many inches: shrink on odd, grow on even.", "You cast Confusion centered on yourself.", "For a minute you regain 5 Hit Points at the start of each of your turns.", "A beard of feathers grows and stays until you sneeze, which blows the feathers off.", "You cast Grease centered on yourself.", "For a minute, creatures have Disadvantage on saves against the next save-forcing spell you cast.", "Your skin turns bright blue until Remove Curse ends it.", "For a minute an eye on your forehead gives you Advantage on sight-based Perception checks.", "For a minute, your spells that take an action take a Bonus Action instead.", "You teleport up to 60 feet to an empty space you can see.", "You go to the Astral Plane until the end of your next turn, then return to your space or the nearest empty one.", "The next damaging spell you cast within a minute deals maximum damage.", "Roll a d10. Your age changes by that many years: younger on odd (minimum 1), older on even.", "1d6 flumphs appear within 60 feet, DM-controlled and frightened of you. They vanish after a minute.", "You regain 2d10 Hit Points.", "You become a potted plant until the start of your next turn. You are Incapacitated with Vulnerability to all damage. If you drop to 0 Hit Points the pot breaks and you return to normal.", "For a minute you can teleport up to 20 feet as a Bonus Action on each of your turns.", "You cast Levitate on yourself.", "A DM-controlled unicorn appears within 5 feet and leaves after a minute.", "You cannot speak for a minute. Pink bubbles come out when you try.", "For a minute a spectral shield gives you +2 AC and immunity to Magic Missile.", "You cannot get drunk from alcohol for 5d6 days.", "Your hair falls out and regrows within 24 hours.", "For a minute, loose flammable objects you touch (not worn or carried by others) catch fire.", "You regain your lowest-level expended spell slot.", "For a minute you must shout whenever you speak.", "You cast Fog Cloud centered on yourself.", "Up to three creatures you choose within 30 feet take 4d10 Lightning damage.", "You are Frightened of the nearest creature until the end of your next turn.", "Each creature within 30 feet turns Invisible for a minute. It ends for a creature when it attacks or casts a spell.", "You have Resistance to all damage for a minute.", "A random creature within 60 feet is Poisoned for 1d4 hours.", "For a minute you shed bright light in 30 feet. A creature that ends its turn within 5 feet is Blinded until the end of its next turn.", "You cast Polymorph on yourself. If you fail the save, you become a sheep for the duration.", "For a minute illusory butterflies and petals drift within 10 feet of you.", "You can take one extra action right now.", "Each creature within 30 feet takes 1d10 Necrotic damage, and you regain Hit Points equal to the total dealt.", "You cast Mirror Image.", "You cast Fly on a random creature within 60 feet.", "You turn Invisible for a minute and make no sound. It ends if you attack or cast a spell.", "If you die within a minute, you return to life as if by Reincarnate.", "Your size grows by one category for a minute.", "You and every creature within 30 feet have Vulnerability to Piercing damage for a minute.", "Faint ethereal music surrounds you for a minute.", "You regain all expended Sorcery Points."];/* v102: the full d100 table, two numbers per row */
function sitRead(){ var s=S&&S.sit; return s&&typeof s==="object"?{on:s.on||{},used:s.used||{},v:s.v||{}}:{on:{},used:{},v:{}}; }
function sitSt(){ if(!S.sit||typeof S.sit!=="object") S.sit={}; var s=S.sit; if(!s.on) s.on={}; if(!s.used) s.used={}; if(!s.v) s.v={}; return s; }
function sitRow(k){ return SIT.filter(function(r){ return r.k===k; })[0]; }
var SIT_FORCE=false;
function sitHave(r){ return SIT_FORCE||r.f.some(hasFeat); }
window.__sit={table:SIT,force:function(v){ SIT_FORCE=!!v; renderAll(); },n:function(){ return SIT.length; }};/* test hook */
function sitPick(n){ var o=null; (C.features||[]).forEach(function(g){ (g.items||[]).forEach(function(f){ if(f.n!==n) return; var m=/\*\*Your choice\.\*\*\s*([^\n*]+)/.exec(String(f.d||f.full||"")); if(m) o=m[1].trim().replace(/\.$/,""); }); }); return o; }
function sitOpts(r){ if(!r.o) return null; if(r.pick){ var p=sitPick(r.pick); if(p){ var m=r.o.filter(function(x){ return p.toLowerCase().indexOf(x.toLowerCase())===0||x.toLowerCase().indexOf(p.toLowerCase())===0; }); if(m.length) return m; } } return r.o; }
function sitOpt(r,st){ var L=sitOpts(r); if(!L) return null; var v=(st||sitRead()).v[r.k]; return L.indexOf(v)>=0?v:L[0]; }
function sitOn(k,st){ var r=sitRow(k); if(!r||!sitHave(r)) return false; st=st||sitRead(); if(!st.on[k]) return false; return !(r.rage&&!modeOn("rage")); }
function sitEff(r,st){ var e=Object.assign({},r.e||{}); var o=sitOpt(r,st); if(o&&r.oe&&r.oe[o]) e=Object.assign(e,r.oe[o]); if(e.bare&&e.fly&&sitArmored()) delete e.fly; return e; }
function sitArmored(){ return /, (Light|Medium|Heavy) armor \(/.test((C.ac&&C.ac.baseSrc)||""); }/* v102: body armor worn, read from the AC source */
function sitSum(r,st){ var o=sitOpt(r,st); if(o&&r.so&&r.so[o]){ var t=r.so[o]; if(r.oe&&r.oe[o]&&r.oe[o].bare&&sitArmored()) t+=" You wear armor now, so there is no Fly Speed."; return t; } var s=typeof r.s==="function"?r.s(st):r.s; if(s) return s; var T=""; (C.features||[]).forEach(function(g){ (g.items||[]).forEach(function(f){ if(!T&&r.f.indexOf(f.n)>=0) T=String(f.d||f.full||"").replace(/[*_]/g,"").replace(/\s+/g," ").trim(); }); }); return T.length>110?T.slice(0,107)+"...":T||"See the feature text."; }
/* numbers that change AC or Speed. kind = "ac" | "spd" */
function sitNum(kind){ var st=sitRead(), out=[]; SIT.forEach(function(r){ if(r.t!=="on"||!sitOn(r.k,st)) return; var e=sitEff(r,st); if(e[kind]) out.push({v:e[kind],s:r.n}); }); return out; }
/* turned-on rows add their tags to the numbers. Called at the end of cfx() */
function sitFx(o){ var st=sitRead(); o.atkS=[]; o.dice=[]; SIT.forEach(function(r){ if(!sitHave(r)) return;
    if(r.t==="on"&&sitOn(r.k,st)){ var e=sitEff(r,st);
      (e.atk||[]).forEach(function(x){ o.atkS.push({t:x.t,s:r.n,m:x.m}); });
      Object.keys(e.skill||{}).forEach(function(k){ (o.skill[k]=o.skill[k]||[]).push({t:e.skill[k],s:r.n}); });
      if(e.chk) o.chk.push({t:e.chk,s:r.n});
      Object.keys(e.chkAb||{}).forEach(function(k){ (o.chkAb[k]=o.chkAb[k]||[]).push({t:e.chkAb[k],s:r.n}); });
      Object.keys(e.save||{}).forEach(function(k){ (o.save[k]=o.save[k]||[]).push({t:e.save[k],s:r.n}); });
      if(e.ds) o.ds.push({t:e.ds,s:r.n}); if(e.init) o.init.push({t:e.init,s:r.n});
      (e.res||[]).forEach(function(t){ o.res.push({t:"Resistance",v:t,s:r.n}); });
      if(e.fly&&!o.fly) o.fly={v:"walk",s:r.n}; }
    if(r.dice){ var d=r.dice(); if(d) o.dice.push({k:r.k,n:r.n+" damage",dmg:d.dmg,type:d.type,used:!!st.used[r.k]}); } }); }
/* the tags on one attack row: the common ones, plus the situation tags that fit this weapon */
function sitAtk(a){ var f=D.cf||{}, base=(f.atk||[]).slice(), k=atkKind(a); (f.atkS||[]).forEach(function(x){ var ok=x.m==="all"||(x.m==="str"&&a.ab==="STR"&&k!=="spell")||(x.m==="melee"&&(k==="melee"||k==="unarmed"))||(x.m==="ranged"&&k==="ranged"); if(ok) base.push(x); }); return base; }
function sitReset(kind){ var s=S.sit; if(!s) return false; var ch=false, rank={turn:1,short:2,long:3}[kind]||3;
  SIT.forEach(function(r){ var need=r.rs==="turn"?1:r.rs==="short"?2:3; if(rank<need) return; if(s.on&&s.on[r.k]){ delete s.on[r.k]; ch=true; } if(s.used&&s.used[r.k]){ delete s.used[r.k]; ch=true; } if(s.v&&s.v[r.k+"_r"]&&need<=rank){ delete s.v[r.k+"_r"]; ch=true; } });
  return ch; }
function sitFind(r){ var fa=featAll(), x=null; r.f.forEach(function(n){ if(!x) x=fa.filter(function(q){ return q.f.n===n; })[0]; }); return x; }
function sitOpenG(g){ var st=sitRead(); return SIT_OPEN[g]!=null?SIT_OPEN[g]:(g==="c"||SIT.some(function(r){ return r.g===g&&r.t==="on"&&st.on[r.k]&&sitHave(r); })); }
var SIT_OPEN={};
function sitRowH(r,st){ var on=r.t==="on"&&sitOn(r.k,st), used=r.t==="used"&&!!st.used[r.k], fx=sitFind(r), nm=fx?'<button type="button" class="tx sit-n" data-info="f:'+fx.gi+'.'+fx.fi+'">'+esc(r.n)+'</button>':'<b class="sit-n">'+esc(r.n)+'</b>', ctl="";
  if(r.t==="on") ctl='<button type="button" class="sit-sw press'+(on?' on':'')+'" role="switch" aria-checked="'+on+'" aria-label="'+esc(r.n)+'" data-sit="on:'+r.k+'"><i></i></button>';
  else if(r.t==="used") ctl='<button type="button" class="sit-ck press'+(used?' on':'')+'" aria-pressed="'+used+'" data-sit="used:'+r.k+'">'+(used?"Used":"Ready")+'</button>';
  else if(r.t==="act") ctl='<button type="button" class="btn sm sit-ac press" data-sit="act:'+r.k+'">'+esc(r.lab)+'</button>';
  var oo=r.t==="on"&&on&&sitOpts(r), ov=oo?sitOpt(r,st):null;
  var opts=oo&&oo.length>1?'<div class="sit-o" role="group" aria-label="'+esc(r.n)+' option">'+oo.map(function(x){ return '<button type="button" class="chip press'+(x===ov?' on':'')+'" aria-pressed="'+(x===ov)+'" data-sit="opt:'+r.k+':'+esc(x)+'">'+esc(x)+'</button>'; }).join("")+'</div>':'';
  var need=r.rage&&!modeOn("rage")?'<small class="sit-need">Needs Rage</small>':'';
  return '<div class="sit-r'+(on||used?' on':'')+(r.t==="rem"?' rem':'')+'" data-k="'+r.k+'"><div class="sit-m">'+nm+'<span class="sit-s">'+esc(sitSum(r,st))+'</span>'+need+'</div>'+ctl+opts+'</div>'; }
function sitCardH(){ var st=sitRead(), rows=SIT.filter(sitHave); if(!rows.length) return ""; var act=rows.filter(function(r){ return r.t==="on"&&sitOn(r.k,st); }).length;
  var G=[["c","In combat"],["s","Situational"],["r","Reminders"]];
  var h='<div class="sit" id="sit"><h3 class="fcat">Situations <span class="apa">'+(act?'• '+act+' on':'')+'</span><button type="button" class="btn sm sit-nt press" data-sit="turn">New turn</button></h3>';
  G.forEach(function(g){ var L=rows.filter(function(r){ return r.g===g[0]; }); if(!L.length) return; var op=sitOpenG(g[0]), n=L.filter(function(r){ return (r.t==="on"&&sitOn(r.k,st))||(r.t==="used"&&st.used[r.k]); }).length;
    h+='<button type="button" class="sit-gh press" aria-expanded="'+op+'" data-sit="grp:'+g[0]+'"><span>'+g[1]+'</span><small>'+L.length+(n?' • '+n+' active':'')+'</small><i aria-hidden="true"></i></button>'+(op?'<div class="sit-l">'+L.map(function(r){ return sitRowH(r,st); }).join("")+'</div>':''); });
  return h+'</div>'; }
function sitCombatH(){ var st=sitRead(), rows=SIT.filter(function(r){ return sitHave(r)&&r.g==="c"&&r.t!=="rem"; }).filter(function(r){ return r.t!=="on"||!r.rage||modeOn("rage"); }); if(!rows.length) return "";
  return '<div class="conds cbc sit-q">'+rows.map(function(r){ var on=r.t==="on"?sitOn(r.k,st):r.t==="used"?!!st.used[r.k]:false;
    return '<button type="button" class="chip mode'+(on?' on':'')+' press" '+(r.t==="act"?'':'aria-pressed="'+on+'" ')+'data-sit="'+(r.t==="on"?'on':r.t==="used"?'used':'act')+':'+r.k+'">'+esc(r.n)+(r.t==="used"&&on?' (used)':'')+'</button>'; }).join("")+'<button type="button" class="chip add press" data-sit="turn">New turn</button></div>'; }
function sitDiceRows(){ return ((D.cf||{}).dice||[]).map(function(x){ return '<div class="arow xd sit-d"><div class="an">'+akIcon("feature")+'<b class="tx">'+esc(x.n)+'</b><small>ONCE PER TURN</small><span class="arng">--</span></div><span class="abox"><button type="button" class="sit-ck press'+(x.used?' on':'')+'" aria-pressed="'+x.used+'" data-sit="used:'+x.k+'">'+(x.used?"Used":"Ready")+'</button></span><span class="abox wide">'+esc(x.dmg)+tyIcon(x.type)+'<small>'+esc(x.type)+'</small></span></div>'; }).join(""); }
function sitActiveLine(){ var st=sitRead(), L=SIT.filter(function(r){ return r.t==="on"&&sitOn(r.k,st); }).map(function(r){ var o=sitOpt(r,st); return r.n+(o&&r.o&&r.o.length>1?" ("+o+")":""); }); return L.length?'<p class="sit-act">Active: '+esc(L.join(", "))+'</p>':""; }
function sitRoll(r,st){ var d=function(n){ return 1+Math.floor(Math.random()*n); };
  if(r.roll==="surge"){ var a=d(20); if(a<20){ st.v.surge_r="Rolled "+a+": no surge."; } else { var b=d(100), i=Math.min(SIT_SURGE.length-1,Math.floor((b-1)/2)); st.v.surge_r="Rolled 20. Surge "+b+": "+SIT_SURGE[i]; } st.used[r.k]=1; return st.v.surge_r; }
  if(r.roll==="spirit"){ var bd=lvOf("Bard")>=15?12:lvOf("Bard")>=10?10:lvOf("Bard")>=5?8:6, n=d(bd), t=SIT_SPIRIT[Math.min(SIT_SPIRIT.length,n)-1].replace(/\{d\}/g,"d"+bd); st.v.spirit_r="d"+bd+" rolled "+n+". "+t; return st.v.spirit_r; } return ""; }
function sitDo(spec){ var p=String(spec).split(":"), kind=p[0], k=p[1], r=sitRow(k), st;
  if(kind==="grp"){ SIT_OPEN[k]=!sitOpenG(k); renderAll(); return; }
  if(kind==="turn"){ undoMark("New turn"); var c=sitReset("turn"); save(); renderAll(); toastU(c?"New turn. Per-turn items are cleared.":"New turn. Nothing to clear."); return; }
  if(!r) return; st=sitSt();
  if(kind==="on"){ if(!st.on[k]){ if(r.rage&&!modeOn("rage")){ toast("Turn on Rage first."); return; } undoMark(r.n); st.on[k]=1; var L=sitOpts(r); if(L&&!st.v[k]) st.v[k]=L[0]; } else { undoMark("End "+r.n); delete st.on[k]; } save(); renderAll(); refreshEntry(); toastU(r.n+(st.on[k]?" is on.":" is off.")); return; }
  if(kind==="used"){ undoMark(r.n); if(st.used[k]) delete st.used[k]; else st.used[k]=1; save(); renderAll(); toastU(r.n+(st.used[k]?" used.":" ready again.")); return; }
  if(kind==="opt"){ undoMark(r.n); st.v[k]=p.slice(2).join(":"); save(); renderAll(); return; }
  if(kind==="act"){ if(r.roll){ undoMark(r.n); var t=sitRoll(r,st); save(); renderAll(); toastU(t); return; }
    var res=(D.res||[]).filter(function(q){ return r.rx.test(q.n); })[0]; if(!res){ toast("No matching resource on this sheet."); return; } var left=res.max-used(res.k,res.max);
    if(r.spend){ if(left<r.spend){ toast("Not enough "+res.n+": "+left+" left."); return; } undoMark(r.n); S.used[res.k]=used(res.k,res.max)+r.spend; save(); renderAll(); toastU(res.n+": spent "+r.spend+". Disadvantage canceled."); return; }
    if(left>0){ toast("You still have "+left+" "+res.n+". Nothing to regain."); return; } undoMark(r.n); S.used[res.k]=Math.max(0,res.max-1); save(); renderAll(); toastU(res.n+": regained 1."); } }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-sit]"); if(!b) return; e.preventDefault(); e.stopPropagation(); sitDo(b.getAttribute("data-sit")); });

function cfx(){ var o={atk:[],chk:[],chkAb:{},skill:{},save:{},speed0:[],noAct:[],res:[],fly:null,xd:[],dmgStr:0,atkW:0,init:[],ds:[]}, c=Object.assign({},S.cond||{});
  if(c.Petrified) delete c.Poisoned;/* v22 m2: Petrified gives Immunity to the Poisoned condition */
  if(c.Invisible) o.init.push({t:"ADV",s:"Invisible when you roll Initiative"}); INCAP.forEach(function(k){ if(c[k]) o.init.push({t:"DIS",s:k+" when you roll Initiative"}); });/* v22 m1 */
  function add(a,t,s){ a.push({t:t,s:s}); } function sv(ab,t,s){ (o.save[ab]=o.save[ab]||[]).push({t:t,s:s}); }  var inc=INCAP.some(function(k){ return c[k]; });
  var exL=num(S.exh,0), xr2=x14();/* v94: Exhaustion, 2014: level 1 Disadvantage on ability checks, level 3 on attack rolls and saving throws */
  if(xr2&&exL>=1){ add(o.chk,"DIS","Exhaustion level "+exL); add(o.init,"DIS","Exhaustion level "+exL+" (Initiative is an ability check)"); }
  if(xr2&&exL>=3){ add(o.atk,"DIS","Exhaustion level "+exL); ABK.forEach(function(k){ sv(k,"DIS","Exhaustion level "+exL); }); }
  PADV.forEach(function(r){ if(!hasFeat(r.f)) return; if(/\(2014\)$/.test(C.sub||"")&&(r.f==="Remarkable Athlete"||r.f==="Survivor"||r.f==="Assassinate")) return;/* v72: 2014 versions of these features give no Advantage */ var src=r.f+(r.note?" ("+r.note+")":"");
    if(r.init) add(o.init,"ADV",src);
    (r.skill||[]).forEach(function(k){ (o.skill[k]=o.skill[k]||[]).push({t:"ADV",s:src}); });
    if(!(r.noIncap&&inc)) (r.save||[]).forEach(function(k){ sv(k,"ADV",src); });
    if(r.ds) add(o.ds,"ADV",src); if(r.dsd) add(o.ds,"DIS",src); });
  (C.itemAdv||[]).forEach(function(r){ if(r.k==="Initiative") add(o.init,"ADV",r.s); else (o.skill[r.k]=o.skill[r.k]||[]).push({t:"ADV",s:r.s}); });/* v65: magic items */
  if(c.Blinded) add(o.atk,"DIS","Blinded");
  if(c.Frightened){ add(o.atk,"DIS","Frightened, while the source of fear is in sight"); add(o.chk,"DIS","Frightened, while the source of fear is in sight"); }
  if(c.Grappled){ if(!xr2) add(o.atk,"DIS","Grappled, against anyone other than the grappler"); o.speed0.push("Grappled"); }
  if(c.Invisible) add(o.atk,"ADV","Invisible, against creatures that cannot see you");
  if(c.Poisoned){ add(o.atk,"DIS","Poisoned"); add(o.chk,"DIS","Poisoned"); }
  if(c.Prone||c.Unconscious) add(o.atk,"DIS",c.Prone?"Prone":"Unconscious (Prone)");
  if(c.Restrained){ add(o.atk,"DIS","Restrained"); sv("DEX","DIS","Restrained"); o.speed0.push("Restrained"); }
  ["Paralyzed","Petrified","Stunned","Unconscious"].forEach(function(k){ if(!c[k]) return; sv("STR","FAIL",k); sv("DEX","FAIL",k); if(k!=="Stunned") o.speed0.push(k); });
  INCAP.forEach(function(k){ if(c[k]) o.noAct.push(k); });
  if(c.Petrified) o.res.push({t:"Resistance",v:"All damage",s:"Petrified"});
  if(modeOn("rage")){ o.dmgStr=rageDmg(); (o.chkAb.STR=[]).push({t:"ADV",s:"Rage"}); sv("STR","ADV","Rage"); if(!(C.defenses||[]).some(function(d){ return /while raging|\bRage\b/i.test(String(d.v)+" "+String(d.s)); })) ["Bludgeoning","Piercing","Slashing"].forEach(function(t){ o.res.push({t:"Resistance",v:t,s:"Rage"}); }); }
  if(modeOn("sacred")) o.atkW=Math.max(1,D.mod.CHA);
  if(modeOn("wings")) o.fly={v:"walk",s:"Heavenly Wings (Celestial Revelation)"};
  ["wings","radiance","shroud"].forEach(function(k){ if(modeOn(k)) o.xd.push({n:"Celestial Revelation",dmg:String(D.pb),type:k==="shroud"?"Necrotic":"Radiant",note:"Once on each of your turns, one target you damage with an attack or a spell takes this extra damage while the transformation lasts."+(k==="radiance"?" At the end of each of your turns, each creature within 10 feet takes "+D.pb+" Radiant damage.":k==="shroud"?" When you transform, creatures other than your allies within 10 feet make a Charisma save (DC "+(8+D.pb+D.mod.CHA)+") or have the Frightened condition until the end of your next turn.":"")}); });
  sitFx(o);/* v103 */
  return o; }
/* one tag per kind. Advantage and Disadvantage together cancel out */
function cfFlags(list){ list=list||[]; if(!list.length) return ""; var by={}; list.forEach(function(x){ (by[x.t]=by[x.t]||[]).push(x.s); });
  if(by.FAIL) return '<span class="flag cf fail" title="'+esc("Automatic failure: "+by.FAIL.join(", "))+'">FAIL</span>';
  if(by.ADV&&by.DIS) return '<span class="flag cf" title="'+esc("Advantage ("+by.ADV.join(", ")+") and Disadvantage ("+by.DIS.join(", ")+") cancel out")+'">ADV/DIS</span>';
  var t=by.ADV?"ADV":"DIS"; return '<span class="flag cf '+t.toLowerCase()+'" title="'+esc((t==="ADV"?"Advantage: ":"Disadvantage: ")+(by[t]||[]).join(", "))+'">'+t+'</span>'; }
function cfSkill(s){ var f=D.cf||{}; return (f.chk||[]).concat((f.chkAb||{})[s.ab]||[]).concat((f.skill||{})[s.n]||[]); }
function cfSave(k){ var f=D.cf||{}; return ((f.save||{})[k]||[]).slice(); }
function modeChips(){ var av=modesAvail(); if(!av.length) return ""; return av.map(function(m){ var on=modeOn(m.k); return '<button type="button" class="chip mode'+(on?' on':'')+' press" data-mode="'+m.k+'" aria-pressed="'+on+'">'+esc(m.n)+'</button>'; }).join(""); }
function modeUse(m){ return (D.res||[]).filter(function(r){ return m.use.test(r.n); })[0]; }
function modeToggle(k){ var m=MODES.filter(function(x){ return x.k===k; })[0]; if(!m) return; S.mode=S.mode||{};
  if(S.mode[k]){ undoMark("End "+m.n); delete S.mode[k]; save(); renderAll(); refreshEntry(); toastU(m.n+" ended."); return; }
  var go=function(useIt){ undoMark(m.n); var r=modeUse(m), msg=m.n+" is active.", wsT=null;
    if(m.g) MODES.forEach(function(x){ if(x.g===m.g&&x.k!==k) delete S.mode[x.k]; });
    S.mode[k]=1; if(useIt&&r){ S.used[r.k]=num(S.used[r.k],0)+1; msg+=" One use of "+r.n+" spent."; }
    if(k==="rage"&&concOf()) msg+=" "+concEnd("Rage");
    if(k==="wildshape"){ wsT=tmpFeat(hasFeat("Circle Forms")?"Circle Forms":"Wild Shape",""); if(wsT&&wsT.v&&!(S.tmp>0)){ S.tmp=wsT.v; msg+=" Temporary Hit Points: "+wsT.v+"."; wsT=null; } }
    save(); renderAll(); refreshEntry(); toastU(msg);
    if(wsT&&wsT.v) tmpApply(wsT.v,"Wild Shape",true); };/* v22 M5: one Undo for the whole action */
  var r=modeUse(m), grp=m.g&&MODES.some(function(x){ return x.g===m.g&&modeOn(x.k); });
  if(grp){ go(false); return; }
  if(k==="rage"&&(C.inv||[]).some(function(i){ return eqOn(i)&&HEAVY.test(i.n); })){ ask("You wear Heavy armor. Rage needs you out of Heavy armor. Turn it on anyway?","Turn On",function(){ go(!!r&&used(r.k,r.max)<r.max); }); return; }/* v22 m3 */
  if(r&&used(r.k,r.max)>=r.max){ ask("No "+r.n+" uses left. Turn on "+m.n+" anyway, without spending a use?","Turn On",function(){ go(false); }); return; }
  go(true); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-mode]"); if(!b) return; e.preventDefault(); e.stopPropagation(); modeToggle(b.getAttribute("data-mode")); },true);
function noActH(){ var f=D.cf||{}; return f.noAct&&f.noAct.length?'<div class="caution cfna">⚠ '+esc(f.noAct.join(", "))+': you cannot take actions, Bonus Actions, or Reactions.</div>':''; }

/* ---------- RU43: cantrips with a saving throw, as rows in Actions ---------- */
function saveCantripRows(){ return (C.spells||[]).map(function(x,i){ if(x.l||!x.sv||x.sv==="ATK") return ""; var sc=scOf(x);
  var cc=spCalc(x,0,D.level,sc.mod), ty=cc&&cc.parts.length?cc.parts[0].t:"";
  return '<div class="arow xd sv"><div class="an">'+svgI(AK_ICON.spell,"aki ak-spell","Spell, saving throw")+'<button type="button" class="tx" data-info="sp:'+i+'">'+esc(x.n)+'</button><small>CANTRIP \u2022 '+esc(x.sv)+' SAVE</small><span class="arng">'+spRangeH(x.r,x).replace(/ft\./g,"ft")+'</span></div><span class="abox">'+esc(x.sv)+'<small>'+sc.dc+'</small></span><span class="abox wide">'+spEffH(x,0)+(ty?'<small>'+esc(dTxt(ty))+'</small>':'')+'</span></div>'; }).join(""); }/* v22 m5 */
function modeXdRows(){ return ((D.cf||{}).xd||[]).map(function(x){ return '<div class="arow xd"><div class="an">'+akIcon("feature")+'<b class="tx">'+esc(x.n)+'</b><small>ACTIVE</small><span class="arng">--</span></div><span class="abox">--</span><span class="abox wide" title="'+esc(x.note)+'">'+esc(x.dmg)+tyIcon(x.type)+'<small>'+esc(x.type)+'</small></span></div>'; }).join(""); }

/* ---------- RU63 XP or milestones, RU52 Level Up ---------- */
var XPT=[0,300,900,2700,6500,14000,23000,34000,48000,64000,85000,100000,120000,140000,165000,195000,225000,265000,305000,355000];
function fmtN(n){ return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,","); }
function xpH(){ var lv=D.level, ms=S.lvMode==="milestone", xp=Math.max(0,Math.floor(num(S.xp,0))), next=lv<20?XPT[lv]:null, prev=XPT[lv-1]||0, ready=!ms&&next!=null&&xp>=next, pct=next?clamp((xp-prev)/(next-prev)*100,0,100):100;
  return '<div class="xph"><b>Level '+lv+'</b>'+(ms?'<span>Milestones</span>':'<span>XP '+fmtN(xp)+(next!=null?' / '+fmtN(next):'')+'</span>')+'</div>'+
   (ms?'':'<div class="xpbar" role="progressbar" aria-label="Experience toward the next level" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+Math.round(pct)+'"><i style="transform:scaleX('+(pct/100)+')"></i></div>')+
   '<div class="xpbtns"><button type="button" class="btn press xpb" data-xpopen="1">'+(ms?'Leveling':'Add XP')+'</button>'+(lv<20&&!ready?'<button type="button" class="btn press xpb" data-lvup="1">Level Up</button>':'')+'</div>'+/* v30 C3 */
   (ready?'<button type="button" class="btn pri press lvup" data-lvup="1">Level Up: you reached level '+(lv+1)+'</button>':''); }
function xpDlg(){ var ms=S.lvMode==="milestone"; return '<div id="xpDlg"><p class="info-d">'+(ms?'Your group levels up at story milestones. Use Level Up when the DM says so.':'Experience points: <b>'+fmtN(Math.floor(num(S.xp,0)))+'</b>. Level '+D.level+(D.level<20?', next level at '+fmtN(XPT[D.level])+' XP':'')+'.')+'</p>'+
  (ms?'':'<div class="xpadd"><input type="number" min="0" inputmode="numeric" data-xpamt="1" placeholder="XP" aria-label="Experience points"><button type="button" class="btn pri press" data-xpadd="1">Add</button><button type="button" class="btn press" data-xpadd="-1">Remove</button></div>')+
  '<label class="ck"><input type="checkbox" data-xpmode="1"'+(ms?' checked':'')+'> Level by milestones instead of XP</label>'+(D.level<20?'<button type="button" class="btn press lvup" data-lvup="1">Level Up</button>':'')+'</div>'; }
function xpBox(){ var f=$("#idF"); if(!f) return; var b=$("#xpBox"); if(!b){ b=document.createElement("div"); b.id="xpBox"; b.className="xpl"; f.parentNode.insertBefore(b,f.nextSibling); } b.innerHTML=xpH(); }
function levelUp(){ if(D.level>=20){ toast("Level 20 is the highest level."); return; } if(window.__bldLevelUp) window.__bldLevelUp(); else { var bb=$("#bldBtn"); if(bb) bb.click(); } }
document.addEventListener("change",function(e){ var t=e.target; if(!t.matches||!t.matches("[data-xpmode]")) return; S.lvMode=t.checked?"milestone":"xp"; save(); xpBox(); var b=$("#sheetBody"); if(b&&sheetMode==="xp") b.innerHTML=xpDlg(); });
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-xpopen],[data-xpadd],[data-lvup]"); if(!t||t.closest("#bld")) return;/* v22 p14: the builder's own Level Up */ e.preventDefault();
  if(t.hasAttribute("data-lvup")){ if(sheet.classList.contains("on")) closeSheet(); levelUp(); return; }
  if(t.hasAttribute("data-xpopen")){ navStack=[]; openSheet("Experience", xpDlg(), "xp"); return; }
  var inp=t.parentNode.querySelector("[data-xpamt]"), v=Math.floor(num(inp&&inp.value,0)); if(v<=0){ toast("Type an amount of XP first."); if(inp) inp.focus(); return; }
  undoMark(t.getAttribute("data-xpadd")==="1"?"Add XP":"Remove XP"); var before=Math.floor(num(S.xp,0)); S.xp=Math.max(0,before+(+t.getAttribute("data-xpadd"))*v); save(); xpBox(); var bd=$("#sheetBody"); if(bd&&sheetMode==="xp") bd.innerHTML=xpDlg();
  var nx=D.level<20?XPT[D.level]:null; toastU((S.xp>=before?"XP: "+fmtN(S.xp)+".":"XP: "+fmtN(S.xp)+".")+(nx!=null&&S.xp>=nx&&before<nx?" You reached level "+(D.level+1)+". Tap Level Up.":"")); });

/* ---------- RU70 session journal ---------- */
function today(){ var d=new Date(); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function jrnH(){ var L=Array.isArray(S.journal)?S.journal:[];
  return '<h3 class="noteh">'+ico("ui-book")+'Session Journal</h3><div class="jform"><div class="jrow"><label>Date<input type="date" id="j-date" value="'+today()+'"></label><label>Title<input id="j-title" placeholder="Session 12: The Sunken Gate"></label></div>'+
   '<label>What happened<textarea id="j-notes" rows="3"></textarea></label><div class="jrow"><label>Loot<input id="j-loot" placeholder="Items, coins"></label><label>XP<input type="number" min="0" inputmode="numeric" id="j-xp" placeholder="0"></label></div>'+
   '<label class="ck"><input type="checkbox" id="j-addxp" checked> Add this XP to your total</label><button type="button" class="btn pri press" data-jadd="1">Add Entry</button></div>'+
   (L.length?L.map(function(j){ return '<div class="jent"><div class="jh"><b>'+esc(j.ti||"Session")+'</b><span>'+esc(j.d||"")+(num(j.xp,0)?' • '+fmtN(num(j.xp,0))+' XP':'')+'</span><button type="button" class="lk" data-jdel="'+esc(j.id)+'" aria-label="Delete entry '+esc(j.ti||j.d||"")+'">Delete</button></div>'+(j.n?'<p>'+esc(j.n).replace(/\n/g,"<br>")+'</p>':'')+(j.loot?'<p class="muted">Loot: '+esc(j.loot)+'</p>':'')+'</div>'; }).join(""):'<p class="muted">No entries yet.</p>'); }
document.addEventListener("click",function(e){ var t=e.target.closest&&e.target.closest("[data-jadd],[data-jdel]"); if(!t) return; e.preventDefault();
  if(t.hasAttribute("data-jdel")){ var id=t.getAttribute("data-jdel"), j=(S.journal||[]).filter(function(x){ return x.id===id; })[0]; if(!j) return;
    ask("Delete the journal entry \""+(j.ti||j.d||"Session")+"\"?","Delete",function(){ undoMark("Delete journal entry"); S.journal=S.journal.filter(function(x){ return x.id!==id; }); save(); renderNotes(); toastU("Journal entry deleted."); }); return; }
  var g=function(id){ var el=document.getElementById(id); return el?el.value.trim():""; }, xp=Math.max(0,Math.floor(num(g("j-xp"),0)));
  if(!g("j-title")&&!g("j-notes")&&!g("j-loot")&&!xp){ toast("Write a title, notes, loot, or XP first."); return; }
  undoMark("Add journal entry"); S.journal=Array.isArray(S.journal)?S.journal:[]; S.journal.unshift({id:"j"+Date.now().toString(36),d:g("j-date"),ti:g("j-title"),n:g("j-notes"),loot:g("j-loot"),xp:xp});
  var ax=document.getElementById("j-addxp"); if(xp&&ax&&ax.checked) S.xp=Math.max(0,Math.floor(num(S.xp,0)))+xp; save(); renderNotes(); xpBox(); toastU("Journal entry added"+(xp&&ax&&ax.checked?", "+fmtN(xp)+" XP added":"")+"."); });

/* ---------- RU62 combat view: one screen ---------- */
function combatHTML(){ var h=combatHTML0().replace('</div>','</div>'+pinnedH()), c=cmbHTML(), m='<div class="info-h">Attacks</div>', i=h.indexOf(m); return i>=0?h.slice(0,i)+c+h.slice(i):h.replace(/<\/div>$/,c+'</div>'); }/* v27 RU35 no. 9: pinned skills on top */
function combatHTML0(){ var o=concOf(), atk=(C.attacks||[]).map(function(a,i){ if(!atkOn(a)) return ""; var d=D.atk[i]; return '<button type="button" class="cba" data-info="w:'+i+'"><b>'+esc(a.n)+'</b>'+cfFlags(sitAtk(a))+'<span>'+sg(d.hit)+'</span><span>'+esc(d.dmg)+' '+esc(a.type||"")+'</span></button>'; }).join("");
  var sl=(D.res||[]).filter(function(r){ return /^s\d$/.test(r.k)||r.k==="pact"; }), lu=(D.res||[]).filter(function(r){ return !/^s\d$|^pact$|^hd/.test(r.k); });
  return '<div id="cbv"><div class="cbh"><div><b>'+S.hp+'<small>/'+D.hpmax+'</small></b><span>HP'+(S.tmp?' +'+S.tmp+' temp':'')+'</span></div><div><b>'+D.ac+'</b><span>AC</span></div><div><b>'+sg(D.init)+'</b><span>Init</span></div><div><b>'+D.speed+'</b><span>Speed</span></div></div>'+
   '<div class="cbhp"><button type="button" class="btn heal press" data-cbhp="heal">Heal</button><input id="cbAmt" type="number" inputmode="numeric" min="0" placeholder="0" aria-label="Amount"><button type="button" class="btn dmg press" data-cbhp="dmg">Damage</button></div>'+
   (S.hp===0?'<p class="caution">0 Hit Points: make Death Saving Throws. Successes '+S.ds[0]+', failures '+S.ds[1]+'.</p>':'')+
   '<div class="conds cbc">'+modeChips()+(o?concChip():'')+activeConds().map(function(c){ return '<button type="button" class="chip on press'+(c.hb?' hb':'')+'" data-info="g:'+c.k+'">'+c.k+(c.extra||"")+'</button>'; }).join("")+'<button type="button" class="chip add press" data-condopen="1">Conditions</button></div>'+noActH()+sitCombatH()+
   (atk?'<div class="info-h">Attacks</div><div class="cbas">'+atk+'</div>':'')+
   (sl.length?'<div class="info-h">Spell Slots</div>'+sl.map(function(r){ return '<div class="cbr"><span>'+esc(r.k==="pact"?r.n:"Level "+r.k.slice(1))+'</span><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n)+'</div></div>'; }).join(""):'')+
   (lu.length?'<div class="info-h">Limited Use</div>'+lu.map(function(r){ return '<div class="cbr"><span>'+esc(r.n)+'</span><div class="boxes">'+boxes(used(r.k,r.max),r.max,r.k,r.n,r.pool)+'</div></div>'; }).join(""):'')+'</div>'; }

