
(function(){
"use strict";

/* v24 p08: true only in the public file (no sample character on a first visit) */
var PUBLIC_BUILD=true;
var PWA_BUILD=true;
/* v34 p04: the builder loads after the sheet is on screen. Any click, input, or key that may need it finishes loading first.
   Tabs, View on Home, the More menu, and scrolling do not wait */
(function(){ function need(e){ if(window.__deferDone||!window.__bldNeed) return; var t=e.target;
    if(e.type==="keydown"&&/^(Tab|Shift|Control|Alt|Meta|Arrow|Page|Home|End)/.test(e.key||"")) return;
    if(e.type==="click"&&t&&t.closest&&t.closest("#tabs .tab,#bnav button,#homeV [data-hview],#moreBtn,[data-close],#sheetBack")) return;
    if(e.type==="click"&&t&&t.click){/* v100: the first tap that needs the builder shows "Opening the builder" at once, then loads it and repeats the tap. Before, the screen stood still until the load ended */
      e.preventDefault(); e.stopImmediatePropagation();
      var bz=document.getElementById("busy"), sp=bz&&bz.querySelector("div span:last-child"), old=sp?sp.textContent:"";
      if(sp) sp.textContent="Opening the builder"; if(bz){ bz.style.transition="none"; bz.classList.add("on"); }
      var run=function(){ try{ window.__bldNeed(); }finally{ if(bz){ bz.classList.remove("on"); bz.style.transition=""; } if(sp) sp.textContent=old; } try{ t.click(); }catch(x){} };
      if(window.requestAnimationFrame) requestAnimationFrame(function(){ setTimeout(run,0); }); else setTimeout(run,30);
      return; }
    window.__bldNeed(); }
  ["click","input","change","keydown","submit"].forEach(function(n){ document.addEventListener(n,need,true); }); })();/* v34 RU82: true in the public build with manifest and sw.js */
var LOGO_IMG="data:image/webp;base64,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";/* v35 p12 *//* v34 RU83 */
/* ================= DEFAULT CHARACTER ================= */
var ABK = ["STR","DEX","CON","INT","WIS","CHA"];
var ABN = {STR:"Strength",DEX:"Dexterity",CON:"Constitution",INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"};
var DEFAULT = {
  v:3,
  name:"Yudhi Kelapa", species:"Retron", cls:"Fighter", sub:"Pencak Silat", bg:"Soldier", size:"Medium",
  office:"", cardNo:"",
  level:4, hitDie:10, hpPerLevel:[], 
  abilities:{
    STR:{base:17, bonus:[{s:"Soldier background (PHB-2024)",v:2},{s:"Grappler feat, Fighter 4 ASI (PHB-2024)",v:1}]},
    DEX:{base:13, bonus:[]},
    CON:{base:15, bonus:[{s:"Soldier background (PHB-2024)",v:1}]},
    INT:{base:11, bonus:[]},
    WIS:{base:13, bonus:[]},
    CHA:{base:11, bonus:[]}
  },
  rolledNote:"Avrae !randchar: 17, 15, 13, 13, 11, 11 (total 80)",
  saves:{STR:"Fighter class (PHB-2024)", CON:"Fighter class (PHB-2024)"},
  skills:[
    {n:"Acrobatics",ab:"DEX"},{n:"Animal Handling",ab:"WIS"},{n:"Arcana",ab:"INT"},
    {n:"Athletics",ab:"STR",p:1,src:"Soldier background (PHB-2024)"},
    {n:"Deception",ab:"CHA"},{n:"History",ab:"INT"},{n:"Insight",ab:"WIS"},
    {n:"Intimidation",ab:"CHA",p:1,src:"Soldier background (PHB-2024)"},
    {n:"Investigation",ab:"INT"},
    {n:"Medicine",ab:"WIS",p:1,src:"Pencak Silat, Cunning Eye (Retromistika Playtest)"},
    {n:"Nature",ab:"INT"},
    {n:"Perception",ab:"WIS",p:1,src:"Fighter class skill choice (PHB-2024)"},
    {n:"Performance",ab:"CHA"},{n:"Persuasion",ab:"CHA"},{n:"Religion",ab:"INT"},{n:"Sleight of Hand",ab:"DEX"},
    {n:"Stealth",ab:"DEX",dis:"Chain Mail"},
    {n:"Survival",ab:"WIS",p:1,src:"Fighter class skill choice (PHB-2024)"},
    {n:"Automotive",ab:"WIS",hb:1},{n:"Computer",ab:"INT",hb:1}
  ],
  ac:{base:16, baseSrc:"Chain Mail, Heavy armor (PHB-2024)", dex:"none", bonus:[{s:"Fighting Style: Defense (PHB-2024, Fighter 1)",v:1}]},
  speed:30, speedSrc:"Retron, Medium species (Retromistika Playtest)",
  darkvision:30, darkSrc:"Retron, Limited Darkvision (Retromistika Playtest)",
  initBonus:[],
  hpBonus:[],
  profs:{armor:"Light, Medium, Heavy, Shields", weapons:"Simple, Martial, Improvised", tools:"Dice Set"},
  grappler:true,
  attacks:[
    {n:"Unarmed Strike", sub:"Pencak Silat, no Shield", ab:"STR", prof:true, die:"1d8", dieSrc:"Pencak Silat, Unarmed Combatant (Retromistika Playtest)", type:"Bludgeoning", range:"5 ft", m:"", note:"Reroll 1s on the damage die. Can Grapple or push 5 ft on a hit."},
    {n:"Dagger", sub:"Finesse, Light, Thrown", ab:"STR", prof:true, die:"1d8", dieSrc:"Pencak Silat, Flowing Blades (base 1d4)", type:"Piercing", range:"5 ft, 20/60 ft", m:"Nick", note:"Flowing Blades sets the die to 1d8."},
    {n:"Celurit (Sickle)", sub:"Light", ab:"STR", prof:true, die:"1d8", dieSrc:"Pencak Silat, Flowing Blades (base 1d4)", type:"Slashing", range:"5 ft", m:"Nick", note:"Flowing Blades sets the die to 1d8."},
    {n:"Javelin", sub:"Thrown", ab:"STR", prof:true, die:"1d6", dieSrc:"Javelin (PHB-2024)", type:"Piercing", range:"5 ft, 30/120 ft", m:"Slow", note:"Target's Speed drops by 10 ft until the start of your next turn."},
    {n:"Spear", sub:"Thrown, Versatile (1d8)", ab:"STR", prof:true, die:"1d6", dieSrc:"Spear (PHB-2024)", type:"Piercing", range:"5 ft, 20/60 ft", m:"", note:"Two hands: 1d8+5."},
    {n:"Shortbow", sub:"Ammunition, Two-Handed", ab:"DEX", prof:true, die:"1d6", dieSrc:"Shortbow (PHB-2024)", type:"Piercing", range:"80/320 ft", m:"Vex", note:"Advantage on your next attack against the same target."},
    {n:"Improvised Weapon", sub:"Tavern Brawler", ab:"STR", prof:true, die:"1d4", dieSrc:"Improvised weapon (PHB-2024)", type:"Varies", range:"5 ft, 20/60 ft", m:"", note:"A chair, a bottle, a tire iron."}
  ],
  inv:[
    {n:"Chain Mail", q:1, w:55, eq:true, d:"AC 16. Requires Str 13. Disadvantage on Stealth checks."},
    {n:"Dagger", q:2, w:1},{n:"Celurit (Sickle)", q:1, w:2, d:"Kept in hand from the start of a fight. Primary weapon once a target is Grappled."},{n:"Javelin", q:8, w:2},{n:"Spear", q:1, w:3},{n:"Shortbow", q:1, w:2},
    {n:"Arrows", q:20, w:0.05},{n:"Quiver", q:1, w:1},
    {n:"Healer's Kit", q:1, w:3, d:"10 uses. Ends Bleeding with no check."},
    {n:"Dice Set", q:1, w:0},{n:"Traveler's Clothes", q:1, w:4},
    {n:"Dungeoneer's Pack", q:1, w:55, d:"Backpack, Caltrops, Crowbar, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches, Waterskin."}
  ],
  gp:73,
  equipNote:"Fighter option C: 155 GP spent on Chain Mail (75), 8 Javelins (4), 2 Daggers (4), Sickle (1), and Dungeoneer's Pack (12), leaving 59 GP. Soldier option A adds 14 GP.",
  res:[
    {k:"sw", n:"Second Wind", tag:"Bonus Action", max:3, reset:"short1"},
    {k:"as", n:"Action Surge", tag:"Short Rest", max:1, reset:"short"},
    {k:"hd", n:"Hit Dice", tag:"", max:0, reset:"long", auto:"level"},
    {k:"kit", n:"Healer's Kit", tag:"Utilize", max:10, reset:"none"}
  ],
  actions:[
    {c:"Actions", n:"Attack", t:"1 attack", d:"Make one attack. With an [[Unarmed Strike]], choose **Damage** ({unarmed}), [[Grapple]] (DC {dc}), or [[Shove]] (DC {dc}, push 5 ft or knock [[Prone]]). Grappler lets you use Damage and Grapple on the same hit. Grappling needs one free hand."},
    {c:"Actions", n:"Grapple, then Celurit", t:"Main combo", d:"Hold the Celurit in one hand and keep the other free. Turn 1: [[Unarmed Strike]] with the free hand. On a hit, Grappler deals {unarmed} damage and forces a [[Grapple]] save (DC {dc}). With [[Action Surge]], follow up with the Celurit at [[Advantage]]. Later turns: Celurit attacks with Advantage while the target stays [[Grappled]], and Savage Attacker rerolls one weapon damage roll per turn. If the Grapple save succeeds, punch again next turn."},
    {c:"Actions", n:"Attack with Dagger and Celurit", t:"Nick", d:"For targets you can't Grapple, such as any Banaspati. Holding a Dagger and a Celurit, you make the extra [[Light]] attack as part of the [[Attack]] action instead of as a [[Bonus Action]] ([[Nick]]). The extra attack deals 1d8 with no ability modifier. Both hands are full, so you can't Grapple."},
    {c:"Actions", n:"Action Surge", t:"Once per rest", d:"Take one additional action this turn, except the Magic action."},
    {c:"Actions", n:"Utilize: Healer's Kit", t:"Kit", d:"Stabilize a creature at 0 Hit Points, or end [[Bleeding]] with no check."},
    {c:"Actions", n:"Dash, Disengage, Dodge, Help, Hide, Influence, Ready, Search, Study", t:"Standard", d:"Available to every creature."},
    {c:"Bonus Actions", n:"Second Wind", t:"Limited use", d:"Regain 1d10+{level} Hit Points."},
    {c:"Reactions", n:"Opportunity Attack", t:"Reaction", d:"When a creature you can see leaves your reach, make one melee attack against it, including an [[Unarmed Strike]]."},
    {c:"Other", n:"Tactical Mind", t:"Expend Second Wind", d:"When you fail an ability check, add 1d10. If it still fails, the use isn't expended."},
    {c:"Other", n:"Release a Grapple", t:"No action", d:"You can release a creature Grappled by you at any time. The creature escapes with a DC {dc} Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) check as an action. See [[Grappled]]."}
  ],
  features:[
    {g:"Species: Retron", items:[
      {n:"Limited Darkvision", s:"Retromistika Playtest, Retron", d:"You have [[Darkvision]] with a range of 30 feet."},
      {n:"Versatile", s:"Retromistika Playtest, Retron", d:"You gain an Origin feat of your choice. You chose **Tavern Brawler**."},
      {n:"Embracing Change", s:"Retromistika Playtest, Retron", d:"You have [[Advantage]] on saving throws you make to avoid or end the [[Frightened]] condition."},
      {n:"Modernist", s:"Retromistika Playtest, Retron", d:"You have [[Advantage]] on any D20 Test you make to discern the use of technology that you can see."}
    ]},
    {g:"Fighter", items:[
      {n:"Fighting Style: Defense", s:"PHB-2024, Fighter 1", d:"While you're wearing Light, Medium, or Heavy armor, you gain a +1 bonus to [[Armor Class]]."},
      {n:"Second Wind", s:"PHB-2024, Fighter 1", d:"As a [[Bonus Action]], you regain [[Hit Points]] equal to 1d10 plus your Fighter level. You have 3 uses at Fighter 4. You regain one expended use when you finish a [[Short Rest]], and all expended uses when you finish a [[Long Rest]]."},
      {n:"Weapon Mastery", s:"PHB-2024, Fighter 1", d:"You can use the mastery properties of four kinds of weapons: [[Dagger]] ([[Nick]]), [[Sickle]] ([[Nick]]), [[Javelin]] ([[Slow]]), and [[Shortbow]] ([[Vex]]). Whenever you finish a Long Rest, you can swap one of these choices for another Simple or Martial weapon."},
      {n:"Action Surge", s:"PHB-2024, Fighter 2", d:"On your turn, you can take one additional action, except the [[Magic]] action. Once you use this feature, you can't do so again until you finish a Short or Long Rest."},
      {n:"Tactical Mind", s:"PHB-2024, Fighter 2", d:"When you fail an ability check, you can expend a use of Second Wind to roll 1d10 and add the number rolled to the check. If the check still fails, the use of Second Wind isn't expended."},
      {n:"Ability Score Improvement", s:"PHB-2024, Fighter 4", d:"You gain the **Grappler** feat."}
    ]},
    {g:"Fighter Subclass: Pencak Silat", items:[
      {n:"Cunning Eye", s:"Retromistika Playtest, Pencak Silat 3", d:"You gain proficiency in the [[Medicine]] skill."},
      {n:"Unarmed Combatant", s:"Retromistika Playtest, Pencak Silat 3", d:"When you roll damage for your [[Unarmed Strike]], you can roll 1d6 instead of the normal damage. If you aren't holding a Shield, the die is a d8 instead."},
      {n:"Flowing Blades", s:"Retromistika Playtest, Pencak Silat 3", d:"When you deal damage with a [[Dagger]], [[Sickle]], or Shortsword, you can use the same damage die you use for your Unarmed Strike."}
    ], next:"Fighter level 7 unlocks Martial Stances (Offensive Stance and Defensive Stance)."},
    {g:"Feats", items:[
      {n:"Savage Attacker", s:"PHB-2024, Origin Feat (Soldier)", d:"Once per turn when you hit a target with a weapon, you can roll the weapon's damage dice twice and use either roll against the target. An Unarmed Strike isn't a weapon, so this feat doesn't apply to it."},
      {n:"Tavern Brawler", s:"PHB-2024, Origin Feat (Retron)", d:"**Enhanced Unarmed Strike.** When you hit with your Unarmed Strike and deal damage, you can deal Bludgeoning damage equal to 1d4 plus your Strength modifier instead of the normal damage. Pencak Silat's Unarmed Combatant gives a bigger die (1d8), so Yudhi uses that. **Damage Rerolls.** Whenever you roll a damage die for your [[Unarmed Strike]], you can reroll the die if it rolls a 1, and you must use the new roll. **Improvised Weaponry.** You have proficiency with improvised weapons. **Push.** When you hit a creature with an Unarmed Strike as part of the Attack action on your turn, you can deal damage to the target and also push it 5 feet away from you. You can use this benefit only once per turn."},
      {n:"Grappler", s:"PHB-2024, General Feat (Fighter 4)", d:"**Ability Score Increase.** Your Strength increases by 1. **Punch and Grab.** When you hit a creature with an [[Unarmed Strike]] as part of the [[Attack]] action on your turn, you can use both the Damage and the [[Grapple]] option. You can use this benefit only once per turn. **Attack Advantage.** You have [[Advantage]] on attack rolls against a creature [[Grappled]] by you. **Fast Wrestler.** You don't have to spend extra movement to move a creature Grappled by you if the creature is your size or smaller."}
    ]},
    {g:"Background: Soldier", items:[
      {n:"Ability Scores", s:"PHB-2024, Soldier", d:"Strength +2, Constitution +1."},
      {n:"Proficiencies", s:"PHB-2024, Soldier", d:"Skills: [[Athletics]] and [[Intimidation]]. Tool: one kind of Gaming Set ([[Dice Set]])."},
      {n:"Equipment", s:"PHB-2024, Soldier", d:"Option A: [[Spear]], [[Shortbow]], 20 [[Arrows]], Gaming Set, [[Healer's Kit]], [[Quiver]], [[Traveler's Clothes]], 14 GP."}
    ]}
  ]
};
var STD_CONDS = ["Blinded","Charmed","Deafened","Frightened","Grappled","Incapacitated","Invisible","Paralyzed","Petrified","Poisoned","Prone","Restrained","Stunned","Unconscious"];
var HB_CONDS = [
  {k:"Bleeding", d:"While you have the Bleeding condition, the following effects apply to you. **Ruptured Veins.** For every 10 feet of movement you spend, you lose 1d4 Hit Points. **Blood Loss.** At the start of each of your turns, you lose 1d4 Hit Points. **Medical Treatment.** A Utilize action taken by you or by another creature within 5 feet of you can press on the wound. The condition ends if whoever takes that action succeeds on a DC 15 Wisdom (Medicine) check. If a Healer's Kit is used, no check is needed."},
  {k:"Burning", d:"While you have the Burning condition, the following effects apply to you. This condition can stack. **Constant Damage.** When each of your turns begins, you take 1d4 Fire damage per stack of Burning on you. **Flaring Up.** Each round the condition continues, its damage die grows one size, going from d4 to d6, then d8, then d10, and stopping at d12. **Ending the Condition.** You can end the condition with any one of the following options. **Drop and Roll.** You spend your Speed to roll on the ground, which gives you the Prone condition and then ends the Burning condition. You can't use this option if you have more than 3 stacks of Burning. **Douse.** If you give yourself the Soaked condition, both the Soaked and the Burning conditions end. **Smother.** A Utilize action taken by you or by another creature within 5 feet of you puts out the flames and ends the condition.", stack:true},
  {k:"Jinxed", d:"While you have the Jinxed condition, the following effects apply to you. **Miss Fortune.** When you gain this condition, roll a d20 and note the number. The next time you roll that number on a d20, it counts as a 1 instead. **Ending the Condition.** The condition ends once you have rolled the noted number.", num:true}
];
var HB_SRC = "Retromistika Playtest, Conditions";

/* ================= GLOSSARY (paraphrased, not quoted) ================= */
var RG="PHB-2024, Rules Glossary", EQ="PHB-2024, Equipment", PG="PHB-2024, Playing the Game";
var GLOSS={
  /* abilities */
  "Strength":{c:"Ability",s:PG,d:"Measures raw physical power. It drives melee attacks with most weapons, Unarmed Strike damage, the [[Grapple]] and [[Shove]] DC, the [[Athletics]] skill, Strength saving throws, and [[Carrying Capacity]]."},
  "Dexterity":{c:"Ability",s:PG,d:"Measures agility, reflexes, and balance. It drives [[Initiative]], ranged attacks, Finesse weapons, Armor Class in light armor or no armor (medium armor caps it at +2), and the [[Acrobatics]], [[Sleight of Hand]], and [[Stealth]] skills."},
  "Constitution":{c:"Ability",s:PG,d:"Measures health and stamina. Its modifier is added to your [[Hit Points]] at every level and to each [[Hit Point Dice]] you spend. It also covers Constitution saving throws, such as holding Concentration."},
  "Intelligence":{c:"Ability",s:PG,d:"Measures reasoning and memory. It drives the [[Arcana]], [[History]], [[Investigation]], [[Nature]], and [[Religion]] skills, plus the homebrew [[Computer]] skill."},
  "Wisdom":{c:"Ability",s:PG,d:"Measures perceptiveness and mental fortitude. It drives the [[Animal Handling]], [[Insight]], [[Medicine]], [[Perception]], and [[Survival]] skills, plus the homebrew [[Automotive]] skill."},
  "Charisma":{c:"Ability",s:PG,d:"Measures confidence, poise, and charm. It drives the [[Deception]], [[Intimidation]], [[Performance]], and [[Persuasion]] skills."},
  /* skills */
  "Acrobatics":{c:"Skill, Dexterity",s:PG,d:"Stay on your feet in tricky footing, keep your balance, or pull off a flip or a roll."},
  "Animal Handling":{c:"Skill, Wisdom",s:PG,d:"Calm a frightened animal, read its mood, or get it to do what you want."},
  "Arcana":{c:"Skill, Intelligence",s:PG,d:"Recall lore about spells, magic items, magical symbols, and the planes of existence."},
  "Athletics":{c:"Skill, Strength",s:PG,d:"Jump farther than normal, climb, swim in rough water, or force something open. It's also the check a creature uses to escape your [[Grappled]] condition."},
  "Deception":{c:"Skill, Charisma",s:PG,d:"Tell a convincing lie, keep a straight face, or wear a disguise well."},
  "History":{c:"Skill, Intelligence",s:PG,d:"Recall lore about past events, famous people, nations, and cultures."},
  "Insight":{c:"Skill, Wisdom",s:PG,d:"Read someone's mood and tell whether they're hiding something or lying."},
  "Intimidation":{c:"Skill, Charisma",s:PG,d:"Push someone into doing what you want with threats, hostile body language, or a show of force."},
  "Investigation":{c:"Skill, Intelligence",s:PG,d:"Search for clues, work out how something works, or find information in documents."},
  "Medicine":{c:"Skill, Wisdom",s:PG,d:"Diagnose an illness or figure out what killed someone. A DC 10 Medicine check made with the [[Help]] action can stabilize a creature at 0 Hit Points. In Retromistika, a DC 15 Medicine check also ends [[Bleeding]]."},
  "Nature":{c:"Skill, Intelligence",s:PG,d:"Recall lore about terrain, plants, animals, and weather."},
  "Perception":{c:"Skill, Wisdom",s:PG,d:"Notice something with your senses: a hidden creature, a sound behind a door, a trap on the floor. See also [[Passive Perception]]."},
  "Performance":{c:"Skill, Charisma",s:PG,d:"Act, sing, play music, dance, or tell a story to an audience."},
  "Persuasion":{c:"Skill, Charisma",s:PG,d:"Convince someone honestly and graciously, through good arguments and good manners."},
  "Religion":{c:"Skill, Intelligence",s:PG,d:"Recall lore about gods, rites, prayers, holy symbols, and religious orders."},
  "Sleight of Hand":{c:"Skill, Dexterity",s:PG,d:"Pick a pocket, hide a small object on your body, or do a trick with your hands."},
  "Stealth":{c:"Skill, Dexterity",s:PG,d:"Move quietly and stay out of sight. It's the check behind the [[Hide]] action. Chain Mail gives Disadvantage on it."},
  "Survival":{c:"Skill, Wisdom",s:PG,d:"Follow tracks, find food and water, keep your bearings, and avoid natural hazards."},
  "Automotive":{c:"Skill, Wisdom (homebrew)",s:"Retromistika Playtest, Skills",d:"A Retromistika skill tied to Wisdom. Use it to drive, repair, and understand how vehicles work."},
  "Computer":{c:"Skill, Intelligence (homebrew)",s:"Retromistika Playtest, Skills",d:"A Retromistika skill tied to Intelligence. Use it to operate computers and understand how their hardware and software work."},
  /* core numbers */
  "Proficiency Bonus":{c:"Rule",s:RG,d:"A bonus set by your level. You add it to attack rolls with weapons you're proficient with, to ability checks with proficient skills, to proficient saving throws, and to the DCs your features create, such as the [[Grapple]] DC."},
  "Saving Throw":{c:"Rule",s:RG,d:"A d20 roll to resist or avoid an effect. Add the matching ability modifier, plus your [[Proficiency Bonus]] if you're proficient in that save. Meet or beat the DC to succeed."},
  "Armor Class":{c:"Rule",s:RG,d:"How hard you are to hit. An attack roll that equals or beats your AC hits you."},
  "Initiative":{c:"Rule",s:RG,d:"A Dexterity check everyone rolls when combat starts. Higher results act first."},
  "Speed":{c:"Rule",s:RG,d:"How many feet you can move on your turn. You can split the movement before, between, and after your actions. [[Grappled]], [[Restrained]], and [[Paralyzed]] drop it to 0."},
  "Hit Points":{c:"Rule",s:RG,d:"Your health. When damage takes you to 0 Hit Points, you fall [[Unconscious]] and start making [[Death Saving Throw]]s. If the leftover damage equals or exceeds your Hit Point maximum, you die instantly."},
  "Temporary Hit Points":{c:"Rule",s:RG,d:"A buffer that takes damage before your real Hit Points. They don't stack: if you gain more, you choose which amount to keep. Healing can't restore them, and they vanish after a [[Long Rest]]."},
  "Hit Point Dice":{c:"Rule",s:RG,d:"Dice you spend during a [[Short Rest]] to heal. Roll each die you spend and add your Constitution modifier. A [[Long Rest]] restores all of them."},
  "Death Saving Throw":{c:"Rule",s:RG,d:"At the start of each turn at 0 Hit Points, roll a d20. 10 or higher is a success, lower is a failure. Three successes make you stable, three failures kill you. A 1 counts as two failures, a 20 brings you back with 1 Hit Point. Taking damage at 0 Hit Points counts as a failure."},
  "Heroic Inspiration":{c:"Rule",s:RG,d:"When you have it, you can spend it to reroll any one die right after you roll it, and you must use the new roll. You can only hold one at a time."},
  "Passive Perception":{c:"Rule",s:RG,d:"10 plus your [[Perception]] bonus. The DM compares it against hidden creatures and traps when nobody is rolling."},
  "Darkvision":{c:"Sense",s:RG,d:"Within range, you see in Dim Light as if it were Bright Light, and in Darkness as if it were Dim Light. You can't tell colors apart in Darkness."},
  "Carrying Capacity":{c:"Rule",s:RG,d:"A Medium creature can carry its Strength score times 15 pounds. You can drag, lift, or push up to twice that, but while moving more than your capacity, your [[Speed]] is at most 5 feet."},
  "Short Rest":{c:"Rule",s:RG,d:"At least 1 hour of light activity. You can spend [[Hit Point Dice]] to heal, and some features come back, such as [[Action Surge]] and one use of [[Second Wind]]."},
  "Long Rest":{c:"Rule",s:RG,d:"At least 8 hours, with 6 or more spent sleeping. You regain all Hit Points and all [[Hit Point Dice]], and your [[Exhaustion]] level drops by 1."},
  "Advantage":{c:"Rule",s:RG,d:"Roll two d20s and use the higher. If you have both Advantage and [[Disadvantage]] on the same roll, they cancel out."},
  "Disadvantage":{c:"Rule",s:RG,d:"Roll two d20s and use the lower. If you have both [[Advantage]] and Disadvantage on the same roll, they cancel out."},
  "Size":{c:"Rule",s:RG,d:"Medium creatures take up a 5-foot square. You can [[Grapple]] or [[Shove]] creatures up to one size larger than you, so up to Large."},
  "Languages":{c:"Rule",s:"PHB-2024, Character Creation",d:"Every character knows Common plus two more languages. Udjar and Wicara appear in the Retromistika monster stat blocks, so ask the DM before picking them."},
  /* actions */
  "Unarmed Strike":{c:"Attack",s:RG,d:"A melee attack with your fists, elbows, knees, or head. Everyone is proficient. On a hit, pick one option: **Damage** (normally 1 + Strength modifier; Pencak Silat raises the die to 1d8), [[Grapple]], or [[Shove]]."},
  "Grapple":{c:"Unarmed Strike option",s:RG,d:"Target a creature no more than one size larger than you, within reach, with one hand free. It makes a Strength or Dexterity saving throw (its choice) against DC 8 + your Strength modifier + [[Proficiency Bonus]]. On a failure, it has the [[Grappled]] condition."},
  "Shove":{c:"Unarmed Strike option",s:RG,d:"Target a creature no more than one size larger than you, within reach. It makes a Strength or Dexterity saving throw against the same DC as [[Grapple]]. On a failure, you either push it 5 feet away or knock it [[Prone]]."},
  "Attack":{c:"Action",s:RG,d:"Make one attack with a weapon or an [[Unarmed Strike]]. You can draw or stow one weapon as part of each attack."},
  "Dash":{c:"Action",s:RG,d:"Gain extra movement equal to your [[Speed]] for this turn."},
  "Disengage":{c:"Action",s:RG,d:"Your movement doesn't provoke [[Opportunity Attack]]s for the rest of the turn."},
  "Dodge":{c:"Action",s:RG,d:"Until the start of your next turn, attacks against you have [[Disadvantage]] if you can see the attacker, and you have [[Advantage]] on Dexterity saving throws. You lose the benefit if you're [[Incapacitated]] or your Speed drops to 0."},
  "Help":{c:"Action",s:RG,d:"Give an ally [[Advantage]] on their next ability check with a skill or tool you're proficient with, or on their next attack against an enemy within 5 feet of you. It's also how you stabilize a dying creature with a DC 10 [[Medicine]] check."},
  "Hide":{c:"Action",s:RG,d:"While Heavily Obscured or behind Three-Quarters or Total Cover, and out of every enemy's line of sight, make a DC 15 Dexterity ([[Stealth]]) check. On a success, you have the [[Invisible]] condition until you make noise, attack, or someone finds you."},
  "Influence":{c:"Action",s:RG,d:"Try to change a creature's attitude with a Charisma or Wisdom check, such as [[Persuasion]], [[Deception]], [[Intimidation]], [[Performance]], or [[Animal Handling]]."},
  "Ready":{c:"Action",s:RG,d:"Pick a trigger and an action. When the trigger happens before your next turn, you can use your [[Reaction]] to take that action."},
  "Search":{c:"Action",s:RG,d:"Make a Wisdom check to notice or find something: [[Insight]], [[Medicine]], [[Perception]], or [[Survival]]."},
  "Study":{c:"Action",s:RG,d:"Make an Intelligence check to recall or figure something out: [[Arcana]], [[History]], [[Investigation]], [[Nature]], or [[Religion]]."},
  "Utilize":{c:"Action",s:RG,d:"Use a nonmagical object, such as a [[Healer's Kit]], a lever, or a door lock."},
  "Magic":{c:"Action",s:RG,d:"Cast a spell, use a magic item, or use a magical feature. [[Action Surge]] can't give you an extra Magic action."},
  "Bonus Action":{c:"Rule",s:RG,d:"A quick extra action you can take only when a feature or rule says so. You get one per turn."},
  "Reaction":{c:"Rule",s:RG,d:"An instant response to a trigger, such as an [[Opportunity Attack]]. You get one per round, and it comes back at the start of your turn."},
  "Opportunity Attack":{c:"Reaction",s:RG,d:"When a creature you can see leaves your reach, you can use your [[Reaction]] to make one melee attack against it, including an [[Unarmed Strike]]. A creature that took the [[Disengage]] action doesn't provoke it."},
  /* conditions */
  "Blinded":{c:"Condition",s:RG,d:"You can't see and automatically fail checks that need sight. Attacks against you have [[Advantage]], and your attacks have [[Disadvantage]]."},
  "Charmed":{c:"Condition",s:RG,d:"You can't attack the charmer or target it with harmful abilities or magic. The charmer has [[Advantage]] on ability checks to interact with you socially."},
  "Deafened":{c:"Condition",s:RG,d:"You can't hear and automatically fail checks that need hearing."},
  "Exhaustion":{c:"Condition",s:RG,d:"Stacks in levels. Each level gives \u22122 to every D20 Test and \u22125 feet of [[Speed]]. Level 6 kills you. A [[Long Rest]] removes one level."},
  "Frightened":{c:"Condition",s:RG,d:"While you can see the source of your fear, you have [[Disadvantage]] on ability checks and attack rolls, and you can't willingly move closer to it. Retron's Embracing Change gives Advantage on saves against it."},
  "Grappled":{c:"Condition",s:RG,d:"Your [[Speed]] is 0. You have [[Disadvantage]] on attacks against anyone except the grappler. The grappler can drag you along. You can try to escape with an action: Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) against the grapple DC."},
  "Incapacitated":{c:"Condition",s:RG,d:"You can't take actions, [[Bonus Action]]s, or [[Reaction]]s, you can't speak, and your Concentration breaks."},
  "Invisible":{c:"Condition",s:RG,d:"Others can't see you. Attacks against you have [[Disadvantage]] and your attacks have [[Advantage]], unless the other creature can somehow see you."},
  "Paralyzed":{c:"Condition",s:RG,d:"You're [[Incapacitated]] and your [[Speed]] is 0. You automatically fail Strength and Dexterity saves. Attacks against you have [[Advantage]], and hits from within 5 feet are critical hits."},
  "Petrified":{c:"Condition",s:RG,d:"You turn into stone or a similar substance. You're [[Incapacitated]], Speed 0, and automatically fail Strength and Dexterity saves. Attacks against you have [[Advantage]]. You resist all damage and can't be [[Poisoned]]."},
  "Poisoned":{c:"Condition",s:RG,d:"You have [[Disadvantage]] on attack rolls and ability checks."},
  "Prone":{c:"Condition",s:RG,d:"You can only crawl, or spend half your [[Speed]] to stand up. Your attacks have [[Disadvantage]]. Attacks against you have [[Advantage]] from within 5 feet and Disadvantage from farther away."},
  "Restrained":{c:"Condition",s:RG,d:"Your [[Speed]] is 0. Attacks against you have [[Advantage]], your attacks have [[Disadvantage]], and you have Disadvantage on Dexterity saves."},
  "Stunned":{c:"Condition",s:RG,d:"You're [[Incapacitated]] and automatically fail Strength and Dexterity saves. Attacks against you have [[Advantage]]."},
  "Unconscious":{c:"Condition",s:RG,d:"You're [[Incapacitated]] and [[Prone]], and you drop what you're holding. Speed 0, automatic failure on Strength and Dexterity saves, attacks against you have [[Advantage]], and hits from within 5 feet are critical hits."},
  /* weapon properties and masteries */
  "Ammunition":{c:"Weapon property",s:EQ,d:"You need ammunition to attack at range, and drawing it is part of the attack. After a fight, you can spend a minute to recover half the ammunition you used."},
  "Burst Fire":{c:"Weapon property",s:EQ,d:"As an action, spend 10 pieces of ammunition to spray a 10-foot Cube within normal range. Each creature there makes a DC 15 Dexterity save or takes the weapon's damage, rolled once for all."},
  "Reload":{c:"Weapon property",s:EQ,d:"You can fire only the number of shots listed. Then you must spend an action or a Bonus Action to reload."},
  "Finesse":{c:"Weapon property",s:EQ,d:"Use Strength or Dexterity for the attack and damage rolls. You must use the same one for both."},
  "Heavy":{c:"Weapon property",s:EQ,d:"You have [[Disadvantage]] on attacks with it if your Strength (melee) or Dexterity (ranged) is below 13."},
  "Light":{c:"Weapon property",s:EQ,d:"When you take the [[Attack]] action and attack with a Light weapon, you can make one extra attack as a [[Bonus Action]] with a different Light weapon. Don't add your ability modifier to that extra attack's damage unless it's negative. [[Nick]] moves this extra attack into the Attack action."},
  "Thrown":{c:"Weapon property",s:EQ,d:"You can throw the weapon to make a ranged attack, using the same ability modifier as its melee attack. Drawing it is part of the attack."},
  "Two-Handed":{c:"Weapon property",s:EQ,d:"You need two hands to attack with it."},
  "Versatile":{c:"Weapon property",s:EQ,d:"You can use it with one or two hands. The damage in parentheses is for two hands."},
  "Range":{c:"Weapon property",s:EQ,d:"Two numbers: normal range and long range. Attacks beyond normal range have [[Disadvantage]], and you can't attack beyond long range."},
  "Nick":{c:"Weapon mastery",s:EQ,d:"When you make the extra attack from the [[Light]] property, you make it as part of the [[Attack]] action instead of as a Bonus Action. Once per turn."},
  "Slow":{c:"Weapon mastery",s:EQ,d:"When you hit and deal damage, the target's [[Speed]] drops by 10 feet until the start of your next turn. Several hits don't reduce it by more than 10 feet."},
  "Vex":{c:"Weapon mastery",s:EQ,d:"When you hit and deal damage, you have [[Advantage]] on your next attack roll against that creature before the end of your next turn."},
  "Sap":{c:"Weapon mastery",s:EQ,d:"When you hit, the target has [[Disadvantage]] on its next attack roll before the start of your next turn."},
  "Graze":{c:"Weapon mastery",s:EQ,d:"When you miss, the target still takes damage equal to the ability modifier you used for the attack, of the weapon's damage type."},
  "Cleave":{c:"Weapon mastery",s:EQ,d:"When you hit with a melee attack, you can attack a second creature within 5 feet of the first and within your reach. That second hit deals weapon damage without your ability modifier unless it's negative. Once per turn."},
  "Push":{c:"Weapon mastery",s:EQ,d:"When you hit, you can push a Large or smaller target up to 10 feet straight away from you. Not to be confused with Tavern Brawler's 5-foot push on an Unarmed Strike."},
  "Topple":{c:"Weapon mastery",s:EQ,d:"When you hit, the target makes a Constitution saving throw (DC 8 + the attack's ability modifier + your [[Proficiency Bonus]]) or falls [[Prone]]."},
  /* gear */
  "Chain Mail":{c:"Heavy armor",s:EQ,d:"AC 16, no Dexterity bonus. Needs Strength 13, or your Speed drops by 10 feet. [[Disadvantage]] on [[Stealth]] checks. 55 lb, 75 GP. Takes 10 minutes to put on and 5 to take off."},
  "Healer's Kit":{c:"Gear",s:EQ,d:"Has 10 uses. Take the [[Utilize]] action and spend a use to stabilize a creature at 0 Hit Points with no [[Medicine]] check. In Retromistika it also ends [[Bleeding]] with no check. 3 lb, 5 GP."},
  "Dungeoneer's Pack":{c:"Equipment pack",s:EQ,d:"Backpack, Caltrops, Crowbar, 2 flasks of Oil, 10 days of Rations, Rope, Tinderbox, 10 Torches, and a Waterskin. 55 lb, 12 GP."},
  "Quiver":{c:"Gear",s:EQ,d:"Holds up to 20 arrows. 1 lb, 1 GP."},
  "Arrows":{c:"Ammunition",s:EQ,d:"Ammunition for bows, sold in bundles of 20. 1 lb, 1 GP per 20."},
  "Traveler's Clothes":{c:"Gear",s:EQ,d:"Sturdy clothes for travel. 4 lb, 2 GP."},
  "Dice Set":{c:"Gaming set",s:EQ,d:"A set of dice for games of chance. Your proficiency lets you add your Proficiency Bonus to checks you make to play. Your Soldier background chose this gaming set."},
  "Dagger":{c:"Simple melee weapon",s:EQ,d:"1d4 Piercing. [[Finesse]], [[Light]], [[Thrown]] (20/60 ft). Mastery: [[Nick]]. 1 lb, 2 GP. Pencak Silat's Flowing Blades lets Yudhi roll 1d8 instead."},
  "Sickle":{c:"Simple melee weapon",s:EQ,d:"1d4 Slashing. [[Light]]. Mastery: [[Nick]]. 2 lb, 1 GP. Pencak Silat's Flowing Blades lets Yudhi roll 1d8 instead."},
  "Javelin":{c:"Simple melee weapon",s:EQ,d:"1d6 Piercing. [[Thrown]] (30/120 ft). Mastery: [[Slow]]. 2 lb, 5 SP."},
  "Spear":{c:"Simple melee weapon",s:EQ,d:"1d6 Piercing. [[Thrown]] (20/60 ft), [[Versatile]] (1d8). Mastery: [[Sap]]. 3 lb, 1 GP."},
  "Shortbow":{c:"Simple ranged weapon",s:EQ,d:"1d6 Piercing. [[Ammunition]] (80/320 ft, Arrow), [[Two-Handed]]. Mastery: [[Vex]]. 2 lb, 25 GP."},
  "Improvised Weapon":{c:"Weapon",s:EQ,d:"Any object you swing or throw, like a chair or a bottle. It deals 1d4 damage of a type the DM picks, and thrown range is 20/60 ft. Tavern Brawler makes you proficient with it."}
};
window.__GLOSS=GLOSS;/* v93: the 2014 equipment words change a few entries */

/* v94: 2014 rules words. gl14 lays the 2014 Rules Glossary entries over GLOSS (rests, Exhaustion, grapple, actions, conditions) and puts the 2024 ones back when off. The sheet follows C.rs, the builder follows the build */
var GL14S=null,GL14ON=false;
var GL14={
 "Proficiency Bonus":{d:"A bonus set by your level. You add it to attack rolls with weapons you are proficient with, to ability checks with proficient skills, to proficient saving throws, and to the DCs of your spells and features."},
 "Hit Point Dice":{d:"Dice you spend during a [[Short Rest]] to heal. Roll each die you spend and add your Constitution modifier. A [[Long Rest]] gives back up to half of your total Hit Dice, and at least one."},
 "Heroic Inspiration":{d:"A reward the DM gives for good roleplay, clever play, or a moment that fits your character. Spend it to have [[Advantage]] on one attack roll, saving throw, or ability check, and decide before you roll. You either have it or you do not. You can give yours to another player."},
 "Passive Perception":{d:"10 plus every modifier that applies to your Wisdom ([[Perception]]) check. Advantage adds 5 and Disadvantage subtracts 5. The DM compares it against hidden creatures and traps when nobody is rolling."},
 "Short Rest":{d:"At least 1 hour with nothing more strenuous than eating, drinking, reading, or tending wounds. At the end you can spend any number of your [[Hit Point Dice]] to heal. Some features come back, such as [[Action Surge]] and [[Second Wind]]."},
 "Long Rest":{d:"At least 8 hours of sleep and light activity, with no more than 2 hours awake. One hour of fighting, casting, or walking breaks the rest and it starts over. You regain all Hit Points and up to half of your total Hit Dice, at least one. You lose 1 level of [[Exhaustion]] if you ate and drank. Only one Long Rest counts in 24 hours, and you need at least 1 Hit Point to begin."},
 "Exhaustion":{d:"Stacks in six levels, and each level adds to the ones before it. 1: Disadvantage on ability checks. 2: Speed halved. 3: Disadvantage on attack rolls and saving throws. 4: Hit Point maximum halved. 5: Speed 0. 6: death. A [[Long Rest]] with food and drink removes one level."},
 "Languages":{s:"PHB-2014, Character Creation",d:"Your race and background give you your languages. Common is almost always one of them. Ask the DM before picking a rare one."},
 "Unarmed Strike":{d:"A punch, kick, head butt, or similar blow. It is a melee attack. On a hit it deals 1 + your Strength modifier bludgeoning damage, and you are always proficient with it. [[Grapple]] and [[Shove]] replace one attack."},
 "Grapple":{c:"Special attack",d:"Replaces one attack of your [[Attack]] action. The target can be no more than one size larger than you and within reach, and you need one hand free. Your Strength ([[Athletics]]) check is contested by the target's Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) check, its choice. If you win, it has the [[Grappled]] condition. You can drag or carry it, at half Speed unless it is two or more sizes smaller."},
 "Shove":{c:"Special attack",d:"Replaces one attack of your [[Attack]] action. The target can be no more than one size larger than you and within reach. Your Strength ([[Athletics]]) check is contested by the target's Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) check, its choice. If you win, you either knock it [[Prone]] or push it 5 feet away."},
 "Attack":{d:"Make one melee or ranged attack. Features such as Extra Attack add more attacks to this action. You can also interact with one object for free as part of your move or action."},
 "Help":{d:"Aid another creature. For a task it could attempt, it gains [[Advantage]] on its next ability check for that task if it makes it before your next turn. Or distract an enemy within 5 feet of you: the next attack roll an ally makes against that enemy before your next turn has Advantage."},
 "Hide":{d:"Make a Dexterity ([[Stealth]]) check while you are out of sight, such as behind cover or in heavy obscurement. The DM compares your result with the passive Wisdom ([[Perception]]) of anyone who could notice you."},
 "Search":{d:"Look for something. Make a Wisdom ([[Perception]]) or Intelligence ([[Investigation]]) check, depending on what you are looking for."},
 "Cast a Spell":{c:"Action",s:"PHB-2014, Combat",d:"Cast a spell with a casting time of 1 action. A spell with a longer time needs that much time. If you cast a spell as a [[Bonus Action]], the only other spell you can cast that turn is a cantrip with a casting time of 1 action."},
 "Use an Object":{c:"Action",s:"PHB-2014, Combat",d:"Use a second object on your turn, or one that needs your action, such as a [[Healer's Kit]], a lever, or a door lock. You can interact with one object for free as part of your move or action."},
 "Opportunity Attack":{d:"When a hostile creature you can see leaves your reach, you can use your [[Reaction]] to make one melee attack against it. It does not provoke if the creature took the [[Disengage]] action, teleported, or was moved without using its own movement, action, or reaction."},
 "Frightened":{d:"While the source of your fear is in line of sight, you have [[Disadvantage]] on ability checks and attack rolls, and you can't willingly move closer to it."},
 "Grappled":{d:"Your [[Speed]] is 0 and you can't gain bonuses to it. The condition ends if the grappler is [[Incapacitated]], or if something moves you out of the grappler's reach. You can use your action to escape: your Strength ([[Athletics]]) or Dexterity ([[Acrobatics]]) check must beat the grappler's Strength ([[Athletics]]) check."},
 "Incapacitated":{d:"You can't take actions or reactions."}
};
function gl14(on){ if(typeof GLOSS==="undefined")return; on=!!on; if(on===GL14ON)return;
 if(on){ GL14S={}; var ks=Object.keys(GLOSS); Object.keys(GL14).forEach(function(k){ if(ks.indexOf(k)<0)ks.push(k); });
  ks.forEach(function(k){ if(k==="Heavy"||k==="Light"||k==="Special")return;/* the equipment words (v93) keep their own copy */ var o=GLOSS[k], ov=GL14[k], s0=o?String(o.s||""):"", ns=/PHB-2024/.test(s0)?(o.c==="Condition"?"PHB-2014, Appendix A":s0===RG?"PHB-2014, Rules":s0===PG?"PHB-2014, Adventuring and Combat":s0.replace("PHB-2024","PHB-2014")):null;   var nd=(o&&!ov&&o.d)?String(o.d).replace(/\s*Mastery: \[\[[^\]]+\]\]\./g,"").replace(/\[\[Utilize\]\]/g,"[[Use an Object]]").replace(/\[\[Magic\]\]/g,"[[Cast a Spell]]"):null; if(nd!=null&&nd===o.d)nd=null;
   if(!ov&&ns==null&&nd==null)return; GL14S[k]=o||null; var n=Object.assign({c:"Rule",s:"PHB-2014, Rules"},o||{},ov||{}); if(ns!=null&&!(ov&&ov.s))n.s=ns; if(nd!=null)n.d=nd; GLOSS[k]=n; }); GL14ON=true; }
 else if(GL14S){ Object.keys(GL14S).forEach(function(k){ if(GL14S[k])GLOSS[k]=GL14S[k]; else delete GLOSS[k]; }); GL14S=null; GL14ON=false; } }
window.__gl14=gl14;
var SL14={Barbarian:"Primal Path",Bard:"Bard College",Cleric:"Divine Domain",Druid:"Druid Circle",Fighter:"Martial Archetype",Monk:"Monastic Tradition",Paladin:"Sacred Oath",Ranger:"Ranger Archetype",Rogue:"Roguish Archetype",Sorcerer:"Sorcerous Origin",Warlock:"Otherworldly Patron",Wizard:"Arcane Tradition",Artificer:"Artificer Specialist"};
/* the group title: "Fighter Subclass: Champion" reads "Martial Archetype: Champion" in the 2014 rules */
function gName(g){ g=String(g==null?"":g); if(!(typeof C!=="undefined"&&C&&C.rs==="2014"))return g; var m=/^(\w+) Subclass: (.+)$/.exec(g); return m&&SL14[m[1]]?SL14[m[1]]+": "+m[2]:g; }
function athI(){ var s=C.skills||[]; for(var i=0;i<s.length;i++) if(s[i].n==="Athletics") return i; return -1; }
function x14n(n){ return n==="Magic"?"Cast a Spell":n==="Utilize"?"Use an Object":n; }
function x14(){ return typeof C!=="undefined"&&!!C&&C.rs==="2014"; }
/* Exhaustion: 2024 takes 2 from every D20 Test and 5 feet of Speed per level. 2014 has six levels with fixed effects */
function exSpd(v){ var e=(typeof D!=="undefined"&&D&&D.exh)||0; return x14()?(e>=5?0:e>=2?Math.floor(v/2):v):Math.max(0,v-5*e); }
function exTxt(n){ if(!x14())return "D20 Tests −"+(2*n)+", Speed −"+(5*n)+" ft"; var a=[]; a.push(n>=3?"Disadvantage on ability checks, attack rolls, and saves":"Disadvantage on ability checks"); if(n>=5)a.push("Speed 0"); else if(n>=2)a.push("Speed halved"); if(n>=4)a.push("Hit Point maximum halved"); if(n>=6)a=["Dead"]; return a.join(", "); }
function exHelp(){ return x14()?"Six levels, each adds to the last: 1 checks, 2 Speed halved, 3 attacks and saves, 4 Hit Points halved, 5 Speed 0, 6 death.":"Each level: −2 to D20 Tests and −5 ft Speed. Level 6 is death."; }
/* Long Rest, 2014: Hit Dice come back up to half of the total (at least 1), the biggest dice first */
function hdPlan(){ var rows=hdRows().slice().sort(function(a,b){ return num(b.die,num(C.hitDie,10))-num(a.die,num(C.hitDie,10)); }), tot=rows.reduce(function(t,r){return t+r.max},0), bud=Math.max(1,Math.floor(tot/2)), pl={}, sum=0;
 rows.forEach(function(r){ var u=used(r.k,r.max), t=Math.min(u,bud); pl[r.k]=t; bud-=t; sum+=t; }); pl._n=sum; return pl; }
/* features that resource and action names point to */
GLOSS["Celurit (Sickle)"]=GLOSS["Sickle"];
HB_CONDS.forEach(function(c){ GLOSS[c.k]={c:"Condition (homebrew)",s:HB_SRC,d:c.d}; });
var FEAT_ALIAS={"Second Wind":"Second Wind","Action Surge":"Action Surge","Tactical Mind":"Tactical Mind"};

var NOTE_FIELDS = [
  {k:"backstory", l:"Backstory", h:"Write it in your own words", rows:6},
  {k:"personality", l:"Personality", h:"Traits, habits, the way your character talks", rows:3},
  {k:"ideal", l:"Ideals", h:"What your character fights for", rows:2},
  {k:"bond", l:"Bonds", h:"A person, place, or promise", rows:2},
  {k:"flaw", l:"Flaws", h:"A weakness the DM can play with", rows:2},
  {k:"appearance", l:"Appearance", h:"Description or face claim source", rows:2},
  {k:"session", l:"Session Notes", h:"Clues, NPC names, ritual ingredients", rows:5}
];

