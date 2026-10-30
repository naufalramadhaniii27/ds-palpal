# Own-wording subclasses of Dark Matter (2024): Barbarian, Bard, Cleric, Druid, Fighter, Monk, Paladin, Ranger.
SUB = {
"Path of the Dreadnought": {"spab": "",
 "f": {
  "Brutal Gunplay": "When you attack with a Ranged weapon against a target within 20 ft, you can use Strength instead of Dexterity for the attack and damage rolls. You can also use the mastery property of Ranged weapons, not only Melee ones.",
  "Glory Kill": "Once per turn while your Rage is active, when you reduce an enemy to 0 HP or score a Critical Hit against one, you regain HP equal to 1d6 plus your Rage Damage bonus. Right after, you can move up to your Speed and make one melee attack with a weapon or Unarmed Strike (no action).",
  "Shock Trooper": "Whenever you make a melee attack on your turn against a creature you can see, you can first lunge up to 15 ft toward it. The lunge costs no movement and provokes no Opportunity Attacks. It can carry you through the air, and you fall after the attack.",
  "Ultraviolence": "When you start your Rage, pick one boon. **Berserk.** Until the start of your next turn, your Unarmed Strike can deal 2d12 damage instead of its normal damage. **Invulnerability.** Until the start of your next turn, any attack that hits you deals only 1 damage. **Quad Damage.** Until the start of your next turn, your Rage Damage bonus is +8. Long Rest to use again.",
  "Vicious Rampage": "You can use Glory Kill more than once per turn. When the extra attack from Glory Kill hits, the target takes an extra 1d10 damage of the weapon or Unarmed Strike's type."},
 "lu": [{"feature": "Ultraviolence", "lvl": 10, "max": 1, "reset": "long", "tag": "On Rage"}],
 "fx": [[10, "Ultraviolence", {"notes": [["Note", "Ultraviolence: on Rage pick Berserk (Unarmed Strike 2d12), Invulnerability (hits deal only 1 damage) or Quad Damage (Rage Damage +8) until your next turn"]]}]]},

"Path of the Wrecker": {"spab": "",
 "f": {
  "Deconstructor": "**Break Constructs.** While Raging, when you hit a Construct with a melee weapon or Unarmed Strike attack, your Rage Damage bonus is doubled for that attack. **Demolish.** While Raging, any melee weapon or Unarmed Strike hit on an object is a Critical Hit.",
  "Luddite": "While your Rage is active, you have Advantage on saving throws against Magical Technology.",
  "Percussive Maintenance": "You can hack a device by smashing it, with no Interface Rig needed. Make a Strength (Athletics) check in place of an Intelligence (Data) check. On a success you perform one operation as if you had full access. The machine breaks right after the attempt, pass or fail, and cannot work again until repaired. The GM decides whether the whole machine fails or only a part, such as its controls.",
  "Disarm Foe": "When a melee attack reduces an enemy to 0 HP, you can rip off a limb and use it as a weapon. You then take a Bonus Action to move up to your Speed and make one melee attack with it. The limb is a Martial Melee weapon dealing 1d8 Bludgeoning damage, with the Versatile property (1d10) and Sap mastery. You can also use an action to tear a limb off a Bloodied Construct or Undead of Large size or smaller within 5 ft. The target makes a Strength save (DC 8 plus your Strength modifier plus Proficiency Bonus) or loses the limb. A creature cannot attack or make ability checks with a removed limb, and the GM can add other penalties such as reduced Speed. Only one limb can be removed from a creature.",
  "Steel Shredder": "While Raging, when you hit with a melee weapon or Unarmed Strike, pick one effect. **Crush Armor.** The target takes a -3 penalty to AC until the end of your next turn. Repeated uses on the same target do not stack past -3. **Smash Tech.** Pick one piece of Magical Technology the target wears or carries. It is disabled for 1 minute. A creature can use the Utilize action to reboot a piece of Magical Technology within reach."},
 "fx": [[3, "Luddite", {"notes": [["Note", "Luddite: while Raging, Advantage on saves against Magical Technology"]]}]]},

"College of Chronology": {"spab": "CHA",
 "f": {
  "Chronomantic Secrets": "**Cantrip.** You know Moment to Think, and it does not count against your cantrips known. **Charismatic History.** You gain History proficiency and add your Charisma modifier (minimum +1) to History checks. **Expanded Spell List.** Spells with the Chronomancy tag join your Bard list. Haste, Slow and Time Stop have that tag. **Prepared Spells.** Pick two Chronomancy spells you have slots for. They are always prepared, and each time you gain a Bard level you can swap one for another Chronomancy spell.",
  "Retroactive Inspiration": "When a creature within 60 ft that can see or hear you fails a D20 Test, you can use your Reaction and spend a Bardic Inspiration use to give it a die. It can roll that die right away and add the result to the d20, which may turn the failure into a success.",
  "Borrowed Time": "Action and Delay are always prepared. If you cast either with a level 2 or higher slot, you can make its casting time a Bonus Action for that casting.",
  "Reorder Events": "When an enemy starts its turn, you can use your Reaction to reorder time and take a second turn before it acts. You cannot cast a spell with a slot during that turn. Long Rest to use again. You can also regain the use by spending a level 5 or higher slot (no action), but not more than once per combat round."},
 "lu": [{"feature": "Reorder Events", "lvl": 14, "max": 1, "reset": "long", "tag": "Reaction"}],
 "acts": {"Retroactive Inspiration": "reaction", "Reorder Events": "reaction"},
 "fx": [[3, "Chronomantic Secrets", {"skills": ["History"], "notes": [["Note", "Chronomantic Secrets: add Charisma modifier (min +1) to History checks. Moment to Think is a free cantrip"]]}]]},

"College of Cyberwave": {"spab": "CHA",
 "f": {
  "Etheradio Transmissions": "Magic action: send a message of 25 words or fewer to a character you know who carries a Comm Set and is on your plane. They hear it through the static and can answer you the same way at once. Long Rest to use again.",
  "Wave Synth": "You build a Wave Synth, a blaster-instrument your fellow Cyberwave Bards call a moog. It is both a Musical Instrument and a blaster, and only you and other Cyberwave Bards are proficient with it as either. **Weapon.** Simple Ranged, Thunder damage equal to two rolls of your Bardic Inspiration die, properties DM-B (range 80/320 ft), Firearm and Two-Handed, Push mastery. You can use Push on it without it counting against the properties you can use with Weapon Mastery. **Extra damage.** Once per turn when you hit with it, you can spend one Bardic Inspiration use to deal extra damage equal to a roll of the die plus your Charisma modifier (minimum 1). If the die shows 1 or 2, the use is not spent.",
  "Modulation": "When your turn starts, you can pick one module for the Wave Synth. **Cone Resonator.** Magic action: make a ranged attack, rolled separately for each target, against any number of creatures you see in a 15-ft Cone. **Direct Amplifier.** Each time you hit with the Wave Synth, you deal one extra Bardic Inspiration die of damage without spending it. **Harmonic Reverb.** When you attack with the Wave Synth, you can swap its mastery for Sap or Vex on that attack.",
  "Polyphonic Echo": "**Echo Attack.** Once per turn when you miss with the Wave Synth, you can make another attack with it as part of the same action. **Exploding Soundwave.** When a Wave Synth damage die shows its highest number, roll another Bardic Inspiration die and add it, repeating on each highest roll. You can add at most a number of dice equal to your Charisma modifier (minimum 1)."},
 "lu": [{"feature": "Etheradio Transmissions", "lvl": 3, "max": 1, "reset": "long", "tag": "Magic action"}],
 "acts": {"Etheradio Transmissions": "action"},
 "grant": {"f": "Wave Synth"}},

"Evolution Domain": {"spab": "WIS",
 "f": {
  "Evolution Domain Spells": "Always prepared from the listed Cleric levels: 3 Darkvision, Enlarge/Reduce, Jump, Longstrider. 5 Plant Growth, Polybrachia. 7 Giant Insect, Polymorph. 9 Awaken, Contagion.",
  "Adaptation": "Bonus Action, spend a Channel Divinity use: an ally within 60 ft picks one adaptation lasting 1 hour. **Aquatic.** It gains gills and webbing, can breathe underwater and gets a Swim Speed equal to its Speed. **Arboreal.** It gets a Climb Speed equal to its Speed and a prehensile tail. It can hold and use objects and weapons with hands, feet and tail, but cannot attack with a weapon held by the tail, hold a Shield with it or lift more than 10 lb with it. **Elemental Resistance.** It gains Resistance to Acid, Cold, Fire, Lightning, Poison or Thunder damage, its choice. **Natural Armor.** While it wears no armor, its base AC is 14 plus Dexterity modifier, and it can still use a Shield. **Natural Weapon.** It grows horns, teeth or claws, its choice, for Unarmed Strikes. It can use Dexterity for those attack and damage rolls, and deal 1d6 plus Strength or Dexterity modifier of Bludgeoning, Piercing or Slashing damage to suit the weapon.",
  "Evolutionary": "You have a pool of d4 Evolution Dice equal to your Wisdom modifier (minimum 1). Bonus Action: pick yourself or an ally you see within 60 ft, pick an ability score, and spend and roll one die. That score rises by the roll, up to 24, for 1 minute. A creature can have only one score raised this way at a time. A Constitution gain gives Temporary HP instead of more HP: 1 per Hit Point Die for +1 to the modifier, or 2 per die for +2. Those Temporary HP last as long as the increase. You regain all dice on a Long Rest.",
  "Transient Awakening": "Cast Awaken or Awaken Machine once with no slot or Material components. The effect lasts 1 hour and the awakened creature is not Charmed. It picks its attitude from how you treated it before it woke. After 1 hour it returns to its normal Intelligence, loses speech and loses any other benefit of the spell. Long Rest to use again.",
  "High Evolutionary": "Each of your ability scores rises by 2, to a maximum of 22. Your Evolution Dice become d6s, and you can raise an ability score up to 26 with them."},
 "lu": [{"feature": "Evolutionary", "n": "Evolution Dice", "lvl": 3, "max": "mod:WIS", "reset": "long", "tag": "Bonus Action"},
        {"feature": "Transient Awakening", "lvl": 6, "max": 1, "reset": "long", "tag": "Free cast"}],
 "acts": {"Adaptation": "bonus", "Evolutionary": "bonus"}},

"Machine Domain": {"spab": "WIS",
 "f": {
  "Machine Domain Spells": "Always prepared from the listed Cleric levels: 3 Antivirus, Circuit Breaker, Find Familiar, Heat Metal, Technical Difficulties, Technomancy. 5 Counterspell, Polybrachia. 7 Death Ward, Electromagical Pulse. 9 Animate Objects, Simulation.",
  "Automate": "When you or a creature within 30 ft fails a D20 Test, you can spend a Channel Divinity use to treat a d20 roll of 9 or lower as a 10, which may turn the failure into a success. To help another creature you must use your Reaction.",
  "Gearpriest": "**Construct Familiar.** When you cast Find Familiar, you can pick a special form: Drone, Mechanical Spider, Single-Task Automaton, Software Bug or Wizmo. If you pick a normal form, the familiar is a Construct, unless another source gave you the spell. **Wise Technology.** You gain Technology proficiency and add your Wisdom modifier (minimum +1) to Technology checks.",
  "Anoint Technology": "Magic action: bless a number of weapons up to your Wisdom modifier (minimum 1) for 10 minutes. Each must be a magic item or a piece of Magical Technology within 30 ft. When a creature misses with a blessed weapon, it can spend the blessing to reroll and must keep the new roll. If the reroll hits, the target takes an extra 1d6 damage of the weapon's type. Short or Long Rest to use again.",
  "Sublime Automation": "When you use Automate, you can treat the d20 roll as a 20 instead of a 10. Long Rest to use again. You can also regain the use by spending a level 4 or higher slot (no action)."},
 "lu": [{"feature": "Anoint Technology", "lvl": 6, "max": 1, "reset": "short", "tag": "Magic action"},
        {"feature": "Sublime Automation", "lvl": 17, "max": 1, "reset": "long", "tag": "With Automate"}],
 "acts": {"Anoint Technology": "action"},
 "fx": [[3, "Gearpriest", {"notes": [["Note", "Gearpriest: Technology proficiency, add Wisdom modifier (min +1) to Technology checks"]]}]]},

"Circle of Configuration": {"spab": "WIS",
 "f": {
  "Circle of Configuration Spells": "Always prepared from the listed Druid levels: 3 Circuit Breaker, Technical Difficulties. 5 Greater Mending. 7 Electromagical Pulse. 9 Simulation.",
  "Construct Form": "**Construct Form.** Wild Shape can turn you into your Construct Form, using the Construct Form stat block. It does not count against your known forms. **Configuration.** When you take the form, pick Juggernaut, Mobile or Turret. You can switch as a Bonus Action. **Temporary Hit Points.** You gain Temporary HP equal to three times your Druid level. **Features.** The form improves and gains features as you reach certain Druid levels.",
  "Machine Code": "You know Machine Code, the native code-language of machines. Because of it, you know the Technomancy cantrip.",
  "Speaker of Steel": "If you fail an Intelligence (Data or Technology) check, or an ability check to interact with a Construct, you can spend one Wild Shape use to reroll it with a bonus equal to your Druid level. You must keep the new roll.",
  "Prismatic Module": "When you use Wild Shape to change form, you gain Resistance to Acid, Cold, Fire, Lightning, Poison or Thunder damage, your choice, while shape-shifted.",
  "Mecha Configuration": "When you take the Juggernaut configuration, you can instead take an empowered Mecha configuration for 10 minutes or until you dismiss it on your turn (no action). **Size.** You become Large if smaller. **Mighty.** You have Advantage on Strength checks and saves. **Mecha Slam.** Your melee hits deal an extra 1d6 Force damage. **Omni-Configuration.** You can use the traits and actions of Juggernaut, Mobile and Turret. Long Rest to use again. You can also regain the use by spending a level 5 or higher slot (no action)."},
 "lu": [{"feature": "Mecha Configuration", "lvl": 14, "max": 1, "reset": "long", "tag": "Wild Shape"}]},

"Circle of Xenobiology": {"spab": "WIS",
 "f": {
  "Circle of Xenobiology Spells": "Always prepared from the listed Druid levels: 3 Aberrate, Alter Self, Jump, Longstrider. 5 Gaseous Form, Polybrachia. 7 Polymorph, Splice. 9 Awaken, Contagion.",
  "Splicer": "Spend a Wild Shape use to cast Splice with no slot or Material components. You must be the one who receives the donor's statistics and trait, and you keep them while in Wild Shape. The spell ends early if you use this feature to cast it again.",
  "Adaptive Resilience": "Right after you fail a saving throw, you gain a bonus equal to your Wisdom modifier (minimum +1) to later saves with that same ability. The bonus lasts 10 minutes or until you use this feature for a different save.",
  "Genetic Library": "When you cast Splice, you can store the target's genetic data. You can hold samples equal to your Wisdom modifier and delete one whenever you cast the spell. When you cast Splice you can use a stored sample instead of a target. As a Bonus Action you can change which of the target's statistics you gain from the spell, from Speed, Resistance or special senses.",
  "Wild Mutation": "When you use Wild Shape to take a Beast form, you can cast Mutation on yourself with no slot as part of that Bonus Action. It needs no Concentration and lasts for the whole transformation. Long Rest to use again. You can also regain the use by spending a level 6 or higher slot (no action)."},
 "lu": [{"feature": "Wild Mutation", "lvl": 14, "max": 1, "reset": "long", "tag": "With Wild Shape"}],
 "acts": {"Splicer": "other"}},

"Cybernetic": {"spab": "",
 "f": {
  "Cybernetic Crafts": "Your body is overhauled with Construct grafts. **Two Grafts.** Gain two Common or Uncommon Construct grafts of your choice. Arm Cannon and Shield Module are recommended. **Extra Slots.** You have two Arm graft slots and two Internal graft slots, and can install one graft in each. **Painless Attachment.** You lose no HP or Hit Point Dice for the first graft installed in a given body slot. **Quick Installation.** You can use the Utilize action to install a Construct graft on your body.",
  "Graft Mastery": "You can use the mastery property of any weapon installed as a graft, such as an Arm Blade or Laser Eyes.",
  "Neural Implant": "Pick one skill you are proficient in. When you make an ability check with it, you can roll a d8 and add it. You can change the chosen skill after each Long Rest.",
  "Hyperdrive": "You gain a special Overdrive Module graft that takes no Internal graft slot. Once you activate it, you can extend its duration or restore its use by spending a use of Second Wind (no action).",
  "Nanite Plating": "When you use Second Wind, you also gain Temporary HP equal to the HP you regain.",
  "Cyborg": "Your body is fully overhauled for grafts. **Cyberstrike.** When you hit with a weapon installed as a graft, you can roll a d8 and add it to the damage. **Reconfigure Grafts.** As a Bonus Action you can install a Construct graft in each body slot."},
 "acts": {"Cyborg": "bonus"},
 "fx": [[7, "Neural Implant", {"notes": [["Note", "Neural Implant: add a d8 to checks with one chosen skill you are proficient in (change it each Long Rest)"]]}]]},

"Space Marine": {"spab": "",
 "f": {
  "Impulse Frame": "You own a suit of magically powered armor, a heavily customized Starshield Hardsuit (Splint Armor). While you wear it: **Impulse Pack.** A built-in jet booster lets you use a Bonus Action to gain a Fly Speed equal to your Speed until the end of the turn. **Life Support Systems.** You get the benefits of a Life Suit. **Replaceable.** You can turn another suit of armor into your Impulse Frame by spending materials worth 100 GP or more over 8 hours, which can be done during a Long Rest. Your old Impulse Frame stops working.",
  "Hell Jump": "You have mastered the shock trooper landing. While you fall and are not Incapacitated, subtract 60 ft from the distance when working out fall damage. When you land after falling 20 ft or more, you can burst out in a 5-ft Emanation. Each creature there makes a Dexterity save (DC 8 plus your Strength modifier plus Proficiency Bonus) or has the Prone condition.",
  "Frame Upgrade": "Pick one upgrade for your Impulse Frame. After a Short or Long Rest you can swap it for the other. **Heavy Frame.** While wearing it, +2 AC if you hold no Shield, and Advantage on Strength checks and saves. **Skirmish Frame.** Your Speed rises by 10 ft. If you move 20 ft or more on your turn, your next attack before the turn ends has Advantage. **Wraith Frame.** Heavy armor no longer gives you Disadvantage on Stealth checks. As a Bonus Action you can become Invisible for 1 minute, ending when you attack or cast a spell. Once used, you cannot do so again until you roll Initiative or finish a Short or Long Rest.",
  "Sustained Flight": "When you use your Impulse Pack, the Fly Speed lasts until you land.",
  "Dragon Frame": "Your Impulse Frame gains elemental enhancements and a pool of Temporary HP. At the start of each of your turns, the pool gains 5 Temporary HP, up to 40. Right after you hit with a weapon attack, you can use a Bonus Action and spend 10 Temporary HP from the pool to deal an extra 2d8 Acid, Cold, Fire, Lightning or Thunder damage, your choice."},
 "pick": [{"l": 10, "k": "opts", "n": 1, "key": "tsdmframe", "feature": "Frame Upgrade", "title": "Frame Upgrade", "list": [
   ["Heavy Frame", "While wearing your Impulse Frame, +2 AC if you hold no Shield, and Advantage on Strength checks and saves."],
   ["Skirmish Frame", "Your Speed rises by 10 ft. If you move 20 ft or more on your turn, your next attack before the turn ends has Advantage."],
   ["Wraith Frame", "Heavy armor gives you no Disadvantage on Stealth checks. Bonus Action: become Invisible for 1 minute, ending when you attack or cast a spell. Once used, you cannot do so again until you roll Initiative or finish a Short or Long Rest."]]}],
 "acts": {"Impulse Frame": "bonus", "Dragon Frame": "bonus"}},

"Warrior of Gravity": {"spab": "WIS",
 "f": {
  "Singularity Strike": "Once per turn when you hit with an Unarmed Strike and deal damage, you can spend 1 Focus Point to create a gravity field on the target. Its Speed is 0 until the start of your next turn unless it takes the Disengage action.",
  "Subjective Gravity": "You choose your own center of gravity. Bonus Action and 1 Focus Point: pick a solid surface such as a wall or ceiling within 30 ft to act as the ground for you for 10 minutes. You fall toward it, even upward or sideways. Your gravity follows the surface along smooth curves but stops at corners of 90 degrees or sharper. Only you and what you wear or carry are affected.",
  "Plunging Strike": "You have Advantage on any Unarmed Strike you make while falling. Once per turn when such a strike hits, it deals extra Bludgeoning damage of 1d6 per 10 ft fallen, up to 3d6.",
  "Distort Gravity": "Spend 3 Focus Points to cast Intensify Gravity or Zero Gravity with no slot. Wisdom is your spellcasting ability for them. You can choose to be unaffected by either spell.",
  "Supermassive Strike": "When you use Singularity Strike, you can spend 4 Focus Points to cast Gravity Well centered on the target. Wisdom is your spellcasting ability for it. You automatically succeed on your save against the spell and take no damage from it."},
 "acts": {"Subjective Gravity": "bonus", "Distort Gravity": "other"}},

"Warrior of the Warped": {"spab": "WIS",
 "f": {
  "Flexile Fists": "Your limbs stretch at your command. **Big Fists.** When you take the Attack action, you can spend 1 Focus Point to raise your Martial Arts die one step until the end of the turn (1d6, 1d8, 1d10, 1d12, then 2d6). **Reach.** Your Unarmed Strikes have 5 ft more reach. **Rebound Strike.** Once per turn when you miss with an Unarmed Strike, you can spend 1 Focus Point to reroll it and must keep the new roll.",
  "Rubbery Body": "When you use Deflect Attacks, you can redirect the attack's force even if you do not reduce the damage to 0. When you redirect, the target takes three rolls of your Martial Arts die plus your Dexterity modifier instead of two rolls.",
  "Spring Knees": "**Escape Artist.** Bonus Action: end the Grappled condition on yourself or escape nonmagical restraints. **Slippery Movement.** Opportunity Attacks against you have Disadvantage.",
  "Gatling Strikes": "Magic action and 3 Focus Points: unleash a barrage in a 30-ft Cone. Make two Unarmed Strikes against each creature in the area, with a separate attack roll for each."},
 "acts": {"Spring Knees": "bonus", "Gatling Strikes": "action"},
 "fx": [[11, "Spring Knees", {"notes": [["Note", "Spring Knees: Opportunity Attacks against you have Disadvantage"]]}]]},

"Oath of the Gamma Knight": {"spab": "CHA",
 "f": {
  "Gamma Knight Spells": "Always prepared from the listed Paladin levels: 3 Divine Favor, Hardlight Blaster. 5 Hardlight Trap, Hold Person. 9 Hardlight Construction, Hardlight Gauntlet. 13 Freedom of Movement, Guardian of Faith. 17 Hold Monster, Wall of Force.",
  "Gamma Blade": "Magic action, spend a Channel Divinity use: bond with one weapon, which becomes your Gamma Blade. The bond fails if another Paladin is bonded to it or if it is a magic item someone else is attuned to. It lasts until you bond a different weapon or end it (no action). **Charismatic Attacks.** You can use Charisma for its attack and damage rolls, and it can deal Force, Necrotic or Radiant damage or its normal type. **Projected Blade.** You can make ranged attacks with it at range 30/120 ft as a blast of energy leaves the blade. **Ranged Smite.** You can cast Divine Smite when you hit with a Ranged attack using it. **Gamma Strike.** Once per turn when you take the Attack action, spend a Channel Divinity use to make an extra attack with it.",
  "Aura of Attunement": "You can attune up to four magic items instead of three. Bonus Action: transfer one of your attuned items to an ally in your Aura of Protection. It teleports to them, and they become attuned to it without it counting against their limit. This lasts 1 minute. It ends early if you are Incapacitated, dismiss it (no action) or transfer a different item. When it ends, the item returns to you and you attune to it again.",
  "Intercepting Strike": "When an enemy you see hits you or an ally in your Aura of Protection with a ranged attack, you can use your Reaction to intercept the projectile. Make a ranged attack with your Gamma Blade. The projectile's AC equals the enemy's attack roll. If you hit, the enemy's attack misses.",
  "Galactic Knight": "Bonus Action: gain the following for 10 minutes or until you end it (no action). **Enhanced Gamma Strike.** Gamma Strike costs no Channel Divinity use. **Flight.** You have a Fly Speed equal to your Speed and can hover. **Swift Magic Items.** Once per turn when you take the Attack action, you can swap one attack for activating a magic item that needs the Magic action. **Mega Size.** If you start this in open space outside an atmosphere or gravitational field, you can cast Hardlight Battleframe with no slot or components as part of the same Bonus Action. Long Rest to use again. You can also regain the use by spending a level 5 slot (no action)."},
 "lu": [{"feature": "Galactic Knight", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Gamma Blade": "action", "Aura of Attunement": "bonus", "Intercepting Strike": "reaction", "Galactic Knight": "bonus"}},

"Oath of the Sun": {"spab": "CHA",
 "f": {
  "Oath of the Sun Spells": "Always prepared from the listed Paladin levels: 3 Burning Hands, Guiding Bolt. 5 Darkvision, Halo of Flame. 9 Daylight, Spirit Guardians. 13 Fire Shield, Wall of Fire. 17 Flame Strike, Hallow.",
  "Solar Flare": "Magic action, spend a Channel Divinity use: emit a blinding flash in a 20-ft Emanation. Each creature you choose there makes a Constitution save against your spell save DC or has the Blinded condition for 1 minute. A Blinded creature repeats the save at the end of each of its turns, ending the condition on a success.",
  "Aura of Warmth": "You and your allies in your Aura of Protection have Resistance to Cold and Fire damage and are protected from Extreme Temperatures. As a Bonus Action you can cast Bright Light that is sunlight in your Aura, with Dim Light for another 10 ft. You can dismiss this light as a Bonus Action.",
  "Incandescent Strikes": "The extra damage of your Radiant Strikes becomes 1d10 Radiant damage.",
  "Zenith": "Bonus Action: gain the following for 10 minutes or until you end it (no action). **Flare Damage.** When you deal Fire or Radiant damage and roll the highest number on a damage die, you can roll that die again and add it, repeating on each highest roll. You can add at most a number of dice equal to your Charisma modifier (minimum 1). **Sunbeam.** As part of the same Bonus Action, you cast Sunbeam with no slot. On later turns you can replace one of your attacks with the spell's Magic action. Long Rest to use again. You can also regain the use by spending a level 5 slot (no action)."},
 "lu": [{"feature": "Zenith", "lvl": 20, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Solar Flare": "action", "Aura of Warmth": "bonus", "Zenith": "bonus"},
 "fx": [[7, "Aura of Warmth", {"notes": [["Note", "Aura of Warmth: you and allies in your Aura of Protection have Resistance to Cold and Fire damage and are protected from Extreme Temperatures"]]}]]},

"Bounty Hunter": {"spab": "WIS",
 "f": {
  "Bounty Hunter's Mark": "You can spend 10 minutes casting Hunter's Mark to track a creature you know or have had described in detail. It then works differently. **Extended Duration.** Concentration, up to 24 hours. The spell ends if the target drops to 0 HP. **Nonlethal.** If you reduce the marked creature to 0 HP with a spell or ranged attack roll, you can knock it out as you would with a Melee weapon. **Tracking Fob.** A tracker follows the marked target while it is on your plane and beeps to show its direction and distance.",
  "Cornered Quarry": "When you hit a creature with a weapon, it takes an extra 1d8 damage if none of its allies are within 5 ft of it. You can deal this extra damage once per turn.",
  "Threat Assessment": "You have Advantage on saving throws against effects caused by the creature marked by your Hunter's Mark.",
  "Takedown Tactics": "Once per turn when you damage a creature marked by your Hunter's Mark, you can deal an extra 2d6 Force damage and pick one effect. **Dazed.** The target has Disadvantage on its next saving throw before the start of your next turn. **Prone.** The target has the Prone condition if it is Huge or smaller. **Hobbled.** Its Speed is 0 until the start of your next turn. You can use this a number of times equal to your Wisdom modifier (minimum 1) and regain all uses on a Long Rest.",
  "Perilous Dodge": "When a creature hits you with an attack roll, you can use your Reaction to give that roll a -10 penalty. Short or Long Rest to use again. You can also regain the use by spending a level 2 or higher slot (no action)."},
 "lu": [{"feature": "Takedown Tactics", "lvl": 11, "max": "mod:WIS", "reset": "long", "tag": "Extra 2d6 Force"},
        {"feature": "Perilous Dodge", "lvl": 15, "max": 1, "reset": "short", "tag": "Reaction"}],
 "acts": {"Perilous Dodge": "reaction"}},

"Freerunner": {"spab": "WIS",
 "f": {
  "Acrobatic Mobility": "You are trained to move freely over any terrain using only your body. You gain proficiency and Expertise in Acrobatics.",
  "Freerunning": "You can use the techniques below a number of times equal to your Dexterity modifier, regaining all uses on a Short or Long Rest. **Slide.** Once per turn, move up to 15 ft horizontally without provoking Opportunity Attacks (no action). You can move through another creature's space but cannot stop in it. **Vault.** Once per turn, jump up to 15 ft without spending movement (no action). The first time you fall on the current turn, reduce the fall damage by five times your Ranger level.",
  "Momentum": "You gain Momentum when you move through an enemy's space, leave an enemy's reach, or move 15 ft or more on your turn. When you hit a creature with a weapon, you can spend your Momentum to deal an extra 1d6 damage of the weapon's type. You can hold only one Momentum, and you lose it at the end of your turn if unspent.",
  "Evasive Fighter": "When you use a freerunning technique, you gain a +2 bonus to AC until the start of your next turn.",
  "Hit and Run": "The extra damage from Momentum becomes 2d6.",
  "Tumbling Escape": "When you make a Dexterity save against an effect with an area, you can use your Reaction to move up to 10 ft without provoking Opportunity Attacks, which may take you out of the area."},
 "lu": [{"feature": "Freerunning", "lvl": 3, "max": "mod:DEX", "reset": "short", "tag": "Slide or Vault"}],
 "acts": {"Tumbling Escape": "reaction"},
 "fx": [[3, "Acrobatic Mobility", {"skills": ["Acrobatics"], "exp": ["Acrobatics"]}]]},
}
