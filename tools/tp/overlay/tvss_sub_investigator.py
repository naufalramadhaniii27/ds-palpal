# Own-wording Investigator subclasses of Valda's Spire of Secrets (2024).
SUB = {
"Antiquarian": {"spab": "",
 "f": {
  "Artifact Hoarder": "You gain one extra use of Trinkets before a Long Rest.",
  "Trinkets": "**Hateful Arrowhead.** Cast Ray of Enfeeblement or Scorching Ray with no slot or components. **Warped Prism.** Cast Blur or Shield with no slot or components. **Razortooth Bandages.** Cast Cure Wounds or Inflict Wounds with no slot or components. When this trinket's spell heals or deals damage, add your Investigator level to the amount.",
  "Arcane Relics": "Once you use a relic, you cannot use this feature again until a Short or Long Rest. **Antediluvian Dynamo.** Cast Fireball or Lightning Bolt with no slot or components. **Lich's Deathmask.** Cast Counterspell or Dispel Magic with no slot or components. **Mortal Coil.** Cast Animate Dead or Revivify with no slot or components. A new Animate Dead cast this way turns every Undead from an earlier cast to dust.",
  "Magic Item Collection": "After a Long Rest, you can magically produce one magic item. Any item from an earlier use vanishes. If the item needs Attunement, you attune to it at once. Choose from Carpet of Flying, Cloak of the Bat, Flame Tongue, Gauntlets of Ogre Power, Daern's Instant Fortress, Ring of Regeneration, Ring of Telekinesis, Sun Blade, or Wand of Wonder.",
  "Soul Jar": "You hold a lich's emptied soul jar. It is always attuned to you and does not count against your attunement limit. It has 5 charges and regains 1d4 + 1 expended charges at dawn. While you wear it, you can spend charges. **Temporary Hit Points.** 1 charge, Bonus Action: gain Temporary Hit Points equal to your Investigator level. **Trinket Recharge.** 1 charge, Bonus Action: regain one expended use of Trinkets. **Undead Fortitude.** 2 charges, when you drop to 0 Hit Points without being killed outright: drop to 1 Hit Point instead. Once per turn. **Draining Touch.** 3 charges, Magic action: make a melee spell attack. On a hit the target takes 8d8 Necrotic damage and you regain Hit Points equal to the damage dealt. On a miss the charges are not spent."},
 "lu": [{"feature": "Arcane Relics", "n": "Arcane Relics", "lvl": 6, "max": 1, "reset": "short", "tag": "Free cast"},
        {"feature": "Soul Jar", "n": "Soul Jar charges", "lvl": 14, "max": 5, "reset": "long", "tag": "Regain 1d4 + 1 at dawn"}],
 "acts": {"Soul Jar": "other"}},

"Archivist": {"spab": "",
 "f": {
  "Thesis": "Choose a thesis subject: Corpus, Mentis, Mortis, or Oculus. The book's table for that subject lists spells by Investigator level. You add the ones for your level to your grimoire for free. They count as Investigator spells for you, and you treat them as having the Ritual tag. Each time you gain an Investigator level you can switch to another thesis. Your grimoire spells from the old thesis are replaced by the new thesis spells for your level.",
  "Trinkets": "**Aura Lenses.** Cast Detect Magic with no slot or components. **Mnemonic Script.** Cast Memorize with no slot or components. **Tongue Stone.** Cast Comprehend Languages with no slot or components.",
  "Erudite Spell": "When you cast a spell that forces a save, you can give one target Disadvantage on its save against the spell. Afterward you cannot use this again until a Short or Long Rest. You can also restore it by spending a use of Rushed Incantation (no action).",
  "Encyclopedic Expertise": "When you see or hear a spell cast, or study a magical effect, you identify the spell, the magic item, or the creature behind it with no ability check. It fails for things that are truly unique or never recorded in arcane texts.",
  "Eidetic Memory": "**Ritual Recall.** If you see or hear an Investigator spell cast, you can later copy it into your grimoire. **Spell Duplication.** When you see or hear a spell of level 5 or lower cast, you can fix it in your mind. Within 1 minute, you can spend a use of Rushed Incantation to cast it with no spell slot. After you cast a spell this way, you cannot do so again until a Long Rest."},
 "lu": [{"feature": "Erudite Spell", "n": "Erudite Spell", "lvl": 6, "max": 1, "reset": "short", "tag": "Or spend Rushed Incantation"},
        {"feature": "Eidetic Memory", "n": "Spell Duplication", "lvl": 14, "max": 1, "reset": "long", "tag": "Within 1 minute"}],
 "acts": {}},

"Conspiracy Theorist": {"spab": "",
 "f": {
  "Paranoid Instincts": "You have Advantage on Initiative rolls.",
  "Trinkets": "**Masonic Charm.** Bonus Action: attach it to a weapon you hold and choose a number from 10 to 19. For 1 minute, attacks with that weapon score a Critical Hit on that number or a 20. **Three-Headed Coin.** Give yourself Advantage on one D20 Test before you roll. **Unfathomable Metal.** Bonus Action: show it to a creature within 5 feet. At the start of each of its turns for 1 minute, it takes 2d6 Radiant damage and makes a Constitution save against your spell save DC. A failure continues the effect and a success ends it.",
  "Arcane Relics": "When you take the Ready action, you have Advantage on the D20 Test you make for the Reaction. This works only when the trigger is another creature's action or movement after the end of your turn.",
  "Connect the Dots": "After a Short or Long Rest, choose one skill. You gain proficiency in it if you lacked it, and Expertise in it. This lasts until you pick a different skill with this feature.",
  "Off the Grid": "**Escape Plan.** When you take damage, you can use your Reaction to become Invisible until the start of your next turn. **Nondetection.** You can cast Nondetection on yourself with no spell slot."},
 "fx": [[3, "Paranoid Instincts", {"notes": [["Note", "Paranoid Instincts: Advantage on Initiative rolls"]]}]],
 "acts": {"Off the Grid": "reaction"}},

"Containment Specialist": {"spab": "",
 "f": {
  "Cover Story": "When you fail a Charisma (Deception) check or a creature catches you in a lie, you can retry the check with another quick lie. On a success the listener believes you. Afterward you cannot use this again until a Short or Long Rest.",
  "Trinkets": "**Antibell.** Bonus Action: cast Silence with no slot or components. **Black Bag.** Bonus Action: activate it for 1 minute. While active, a Utilize action stores an item in the bag or retrieves one. Each stored item sits in its own extradimensional space filled by an Antimagic Field. The mouth is 2 feet wide. It holds up to 12 items of 50 pounds or less each, and weighs as much as its heaviest item. You always grab the item you intend. **Cinnabar Compass.** Bonus Action: cast Locate Object with no slot or components.",
  "Arcane Disruption": "When you use Exploit Weakness on a target with the Magic Resistance trait, that trait does not work until the start of your next turn.",
  "Nothing to See Here": "With a blinding flash you cast Modify Memory as an action on up to 3 creatures in range, with no slot or components. Each creature gets the same modified memory. Afterward you cannot use this again until a Long Rest.",
  "Containment Dimension": "Magic action: make a pocket dimension that copies your surroundings, including structures and nonmagical items. You choose its area, which must fit in a 150-foot Cube. You send chosen creatures in. Inside, you can affect and be affected only by creatures in that dimension, and you cannot see outside it. Objects taken out of it vanish. A creature that leaves the bounds appears in the matching space on its plane, or the nearest free space, and takes 4d6 Force damage if the space was occupied. It lasts 10 minutes. It ends early if you are Incapacitated, it holds no creatures, or you dismiss it (no action). When it ends, everyone and everything returns to the corresponding place on the plane it left. Afterward you cannot use this again until a Long Rest."},
 "lu": [{"feature": "Cover Story", "n": "Cover Story", "lvl": 3, "max": 1, "reset": "short", "tag": "Reattempt"},
        {"feature": "Nothing to See Here", "n": "Nothing to See Here", "lvl": 10, "max": 1, "reset": "long", "tag": "Action"},
        {"feature": "Containment Dimension", "n": "Containment Dimension", "lvl": 14, "max": 1, "reset": "long", "tag": "Magic action"}],
 "acts": {"Nothing to See Here": "action", "Containment Dimension": "action"}},

"Detective": {"spab": "",
 "f": {
  "Uncanny Hunch": "When you make an Intelligence check or a Wisdom (Insight) check, you can add your Investigator level to it. You can do this a number of times equal to your Intelligence modifier (minimum once). A Long Rest returns all uses.",
  "Trinkets": "**Fogstone Periapt.** Cast Misty Step with no slot or components. **Glass Medallion.** Bonus Action: cast Invisibility on yourself with no slot or components. **Skeleton's Key.** Bonus Action: cast Knock with no slot or components. The casting is silent.",
  "Predictive Intuition": "Bonus Action: study a creature you can see within 30 feet. Until the start of your next turn, add 1d6 to your attack rolls against it, and it subtracts 1d6 from its attack rolls against you. Once you use this on a target, you cannot use it on that target again until a Short or Long Rest.",
  "Interrogator's Instinct": "**Enchantment Detection.** You can tell if a creature is cursed, possessed, Charmed, or Frightened. **Illusion Detection.** You have Advantage on ability checks to discern an illusion. **Lie Detection.** You have Advantage on ability checks to tell whether you hear a deliberate lie.",
  "Power of Deduction": "You can use Predictive Intuition on a target any number of times."},
 "lu": [{"feature": "Uncanny Hunch", "n": "Uncanny Hunch", "lvl": 3, "max": "mod:INT", "reset": "long", "tag": "Add level to check"}],
 "acts": {"Predictive Intuition": "bonus"}},

"Exterminator": {"spab": "",
 "f": {
  "Silvered Shield": "**Armor Training.** You have training with Medium armor and Shields. **Intelligent Defense.** While you wear Medium armor, add your Intelligence modifier to your Armor Class instead of your Dexterity modifier.",
  "Trinkets": "**Consecrated Whetstone.** Bonus Action: cast Magic Weapon once with no slot or components. **Gilded Dragon Scale.** Bonus Action: choose Acid, Cold, Fire, Force, Lightning, Poison, or Thunder. You have Resistance to that type for 1 minute. **Mimic-Tooth Necklace.** When you hit with a weapon attack, take a Bonus Action to deal an extra 2d8 Acid damage to the target.",
  "Monster Slayer": "Bonus Action: make one attack with a weapon or an Unarmed Strike. You can do this a number of times equal to your Intelligence modifier (minimum once). A Short Rest returns one use. A Long Rest returns all of them.",
  "Silvered Edge": "**Flexible Mastery.** When you attack with a weapon whose mastery you can use, you can swap that property for Sap or Vex for this attack. **Supernatural Strikes.** Whenever you deal damage with a weapon, you can choose Force damage in place of its normal type.",
  "Killer Instinct": "You can use Exploit Weakness twice on your turn, but not on the same target both times."},
 "lu": [{"feature": "Monster Slayer", "n": "Monster Slayer", "lvl": 6, "max": "mod:INT", "reset": "short1", "tag": "Bonus Action"}],
 "fx": [[3, "Silvered Shield", {"notes": [["Armor", "Silvered Shield: trained with Medium armor and Shields. In Medium armor, add Intelligence instead of Dexterity to AC"]]}]],
 "acts": {"Monster Slayer": "bonus"}},

"Infernum": {"spab": "",
 "f": {
  "Fiendish Familiar": "You add Find Familiar to your grimoire for free. You can cast it with Rushed Incantation without spending a use, and you do not need to read from the grimoire. **Fiendish Options.** Your familiar can only be an Imp, Quasit, or Pseudodragon. A Pseudodragon from this spell knows Common and is a Fiend. **Spiteful Distraction.** Bonus Action: command the familiar to disrupt an enemy within 5 feet of it. The target has Disadvantage on its next attack roll before the start of your next turn.",
  "Trinkets": "**Demon's Eye.** Bonus Action: for 1 minute you see normally in Dim Light and Darkness, magical or not, within 120 feet. **Diabolical Barb.** Cast Hellish Rebuke with no slot or components. **Hexagram Pendant.** Cast Hex with no slot or components.",
  "Infernal Bargain": "After a Long Rest, you can strike one bargain with your infernal masters. You can also talk over new bargains with your GM. It lasts until your next Long Rest. **Blindsight and Blindness.** You have Blindsight with a range of 30 feet. Beyond that range you are Blinded. **Damage and Actions.** Once on each of your turns, you can take Necrotic damage equal to twice your Investigator level to gain an extra action. That action can only be Attack (one attack only), Dash, Disengage, Hide, or Utilize. **Resistance and Vulnerability.** Choose two of Acid, Cold, Fire, Lightning, Poison, Psychic, and Thunder. You have Resistance to them. The GM picks another type from the list and you have Vulnerability to it.",
  "Binding Contract": "You add Geas to your grimoire for free. When you cast it with this feature, you can write a contract in place of a spoken command. It can hold up to 10 commands and conditions. You can include clauses that end the spell early or extend it up to 90 days. The spell targets any creature that signs the contract during its duration, not a creature you can see. A creature that willingly signs with a Utilize action automatically fails its save, whether or not it understands the contract.",
  "Fiendish Transformation": "Magic action: shape-shift your Fiendish Familiar into a Barbed Devil, Incubus, Succubus, or Vrock. It stays in that form for 1 minute or until you end it (no action). While transformed it can attack. Afterward you cannot use this again until a Long Rest."},
 "lu": [{"feature": "Fiendish Transformation", "n": "Fiendish Transformation", "lvl": 14, "max": 1, "reset": "long", "tag": "Magic action"}],
 "acts": {"Fiendish Familiar": "bonus", "Fiendish Transformation": "action"}},

"Inquisitor": {"spab": "",
 "f": {
  "Exorcist's Doctrines": "**Consecrated Armor.** You add Consecrated Armor to your grimoire for free. When you cast it, your base AC becomes 13 plus your Dexterity modifier. **Dogma.** When you make an Intelligence (Religion) check, you can treat a d20 roll of 9 or lower as a 10.",
  "Trinkets": "**Alabaster Balm.** Bonus Action: cast Lesser Restoration with no slot or components. **Hallowed Chalice.** Bonus Action: touch a container such as a cup to produce a flask of Holy Water. For the next hour, a Bonus Action produces another flask, up to five flasks total. The flasks and Holy Water vanish after 1 hour. **Reliquary of Doubt.** Bonus Action: cast Detect Thoughts with no slot or components. You can only detect thoughts tied to negative emotions such as guilt, apprehension, regret, or melancholy.",
  "Divine Strike": "Once on each of your turns, when you take the Attack action and hit a creature with a weapon, it takes an extra 1d8 Necrotic or Radiant damage (your choice).",
  "Rote Piety": "You can use Holy Trinkets three times without spending a use of Trinkets. A Long Rest returns these uses.",
  "Excommunication": "Bonus Action: mark a creature you can see within 60 feet. It makes a Wisdom save against your spell save DC. On a failure it is marked for 1 minute. While marked it takes 6d6 Radiant damage at the start of each of its turns, cannot regain Hit Points, and cannot have Advantage on D20 Tests. It repeats the save at the end of each of its turns and ends the effect on a success. Afterward you cannot use this again until a Long Rest. You can also restore it by spending a use of Rushed Incantation (no action)."},
 "lu": [{"feature": "Rote Piety", "n": "Rote Piety (Holy Trinkets)", "lvl": 10, "max": 3, "reset": "long", "tag": "Free use"},
        {"feature": "Excommunication", "n": "Excommunication", "lvl": 14, "max": 1, "reset": "long", "tag": "Or spend Rushed Incantation"}],
 "acts": {"Excommunication": "bonus"}},

"Kid Sleuth": {"spab": "",
 "f": {
  "Animal Sidekick": "You add Find Familiar to your grimoire for free. You can cast it with Rushed Incantation without spending a use, and you do not need to read from the grimoire. **Expanded Options.** Choose a normal familiar form or a Goat, Mastiff, or Weasel. **Awakened.** The animal has Intelligence 10 and speaks one language you know. **Skillful.** The familiar gains proficiency in any two skills or tools of your choice. You can change them when you summon it.",
  "Trinkets": "**Bag of Traps.** Bonus Action: produce and use (with a Utilize action) Ball Bearings, Caltrops, Chain, Hunting Trap, Manacles, or Oil (only to douse a space). Any save uses your spell save DC. For the next minute, a Bonus Action produces and uses another item, up to five total. They vanish after 1 hour. **Dooby Snack.** Bonus Action: produce a treat that lasts 1 hour. A creature can eat it as a Bonus Action to gain Temporary Hit Points equal to your Intelligence modifier (minimum 1) and Advantage on the next D20 Test it makes before the start of its next turn. **Magnifying Glass.** Bonus Action: cast Clue with no slot or components. You can also tell each type of creature that left footprints or fingerprints.",
  "Split Up, Gang": "When you use Exploit Weakness, you can move up to half your Speed without provoking Opportunity Attacks. Or you can choose an ally within 30 feet who can see or hear you. That ally can use a Reaction to move up to half its Speed without provoking Opportunity Attacks.",
  "Cunning Companion": "When your familiar takes the Dash, Disengage, or Hide action, you gain the benefit of that action on your next turn. For Hide, you must be Heavily Obscured or behind Cover or Total Cover, and out of every enemy's line of sight.",
  "Meddling Kids": "When an enemy within 30 feet of you makes an attack roll against one of your allies, you can use your Reaction to impose Disadvantage on that roll."},
 "acts": {"Meddling Kids": "reaction"}},

"Occultist": {"spab": "INT",
 "f": {
  "Trinkets": "**Cold Iron Pendant.** Cast Detect Evil and Good with no slot or components. **Dead Mist Vial.** Cast Fog Cloud with no slot or components. **Engraved Lens.** Cast Identify with no slot or components.",
  "Pact Magic": "**Cantrips.** You know two Warlock cantrips. Eldritch Blast and Minor Illusion are good picks. Each Investigator level lets you swap one for another Warlock cantrip. At level 10 you learn one more. **Spell Slots.** You have Pact Magic slots for Warlock spells up to level 4, all of the same level. You have 1 slot at levels 3 and 4, and 2 slots from level 5. Slot level is 1 at levels 3 to 6, 2 at levels 7 to 12, 3 at levels 13 to 18, and 4 at levels 19 and 20. A Short or Long Rest returns all slots. **Prepared Spells.** You prepare level 1+ Warlock spells that your slot level allows. You start with three. Charm Person, Hellish Rebuke, and Hex are good picks. The count is 3 at level 3, 4 at 4, 5 at 7, 6 at 8, 7 at 10, 8 at 12, 9 at 13, 10 at 14, 11 at 16, 12 at 19, and 13 at 20. Each Investigator level lets you swap one prepared spell for another eligible Warlock spell. **Spellcasting.** Intelligence is the ability. An Arcane Focus works as a Spellcasting Focus for these spells.",
  "Eldritch Ruin": "You can cast one of your Warlock cantrips as a Bonus Action. You can do this a number of times equal to your Intelligence modifier (minimum once). A Long Rest returns all uses.",
  "Eyes of Another World": "**See Invisibility.** You see creatures and objects that are Invisible. You can also see into the Ethereal Plane, where creatures and objects look ghostly. **Sense Spellcasters.** You can sense whether a creature you can see can cast spells. **Discern Otherworldly Origins.** You can tell whether a creature you can see is an Aberration, Celestial, Elemental, Fey, or Fiend. You also learn its plane of origin if that differs from your current plane.",
  "Maleficium": "When you use Exploit Weakness, you can cast Bestow Curse on the target as a Bonus Action with no slot or components. After a creature fails its save against it, you cannot use this again until a Short or Long Rest. You can also restore it by spending a use of Rushed Incantation (no action)."},
 "lu": [{"feature": "Eldritch Ruin", "n": "Eldritch Ruin", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Bonus Action cantrip"},
        {"feature": "Maleficium", "n": "Maleficium", "lvl": 14, "max": 1, "reset": "short", "tag": "Or spend Rushed Incantation"}],
 "acts": {"Eldritch Ruin": "bonus", "Maleficium": "bonus"},
 "fx": [[10, "Eyes of Another World", {"notes": [["Sight", "Eyes of Another World: see Invisible creatures and objects, and see into the Ethereal Plane"]]}]]},

"Medium": {"spab": "",
 "f": {
  "Fortelling": "After a Long Rest, roll two d20s and record them. You can replace any D20 Test made by you or by a creature you can see with one of these foretelling rolls. Choose before the roll. You can do this only once per turn, and each foretelling roll works once. Unused rolls are lost after your next Long Rest.",
  "Trinkets": "**Dead Ringer.** Ring the bell to cast Speak with Dead with no slot or components. You can ask the corpse only one question. **Heptagonal Spectacles.** Bonus Action: cast See Invisibility once with no slot or components. **Lucent Mirror.** Bonus Action: partly phase into the Ethereal Plane for 1 minute or until you dismiss it (no action). You have a Fly Speed of 10 feet and can move through occupied spaces as Difficult Terrain. If you end your turn in such a space, you are shunted to the last unoccupied space you were in.",
  "Foretold Demise": "Once per turn, when you deal damage with a weapon, you can replace one of the damage dice with a foretelling roll.",
  "Whispers from Beyond": "Magic action: the GM gives you a one-word hint about your best course of action, a fruitful line of inquiry, or another useful direction. Afterward you cannot use this again until a Long Rest. You can also restore it by spending a use of Rushed Incantation (no action).",
  "Third Eye": "Bonus Action: cast True Seeing with no slot or components. While it lasts, you have Advantage on the first attack you make on each of your turns. Afterward you cannot use this again until a Long Rest."},
 "lu": [{"feature": "Whispers from Beyond", "n": "Whispers from Beyond", "lvl": 10, "max": 1, "reset": "long", "tag": "Or spend Rushed Incantation"},
        {"feature": "Third Eye", "n": "Third Eye", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Whispers from Beyond": "action", "Third Eye": "bonus"}},

"Spy": {"spab": "",
 "f": {
  "Bravado": "You add your Intelligence modifier (minimum +1) to your Charisma (Deception) and Charisma (Persuasion) checks.",
  "Trinkets": "**Glass Dust.** Bonus Action: throw the pouch at a point you can see within 10 feet. It fills a 5-foot-radius Sphere with glittering dust until the start of your next turn. A creature that enters the Sphere for the first time on a turn, or ends its turn there, is Invisible. This ends early for a creature that leaves the Sphere, makes an attack roll, deals damage, or casts a spell. **Horn-Rimmed Glasses.** Bonus Action: cast Disguise Self with no slot or components. **Martini Glass.** Bonus Action: cast Charm Person with no slot or components.",
  "Cloak and Dagger": "When you deal damage in the first round of combat, you deal extra Force damage equal to your Investigator level. The target must not have taken a turn yet, or you must have Advantage on the attack roll against it.",
  "Body Double": "Magic action: touch a Humanoid, or the corpse of one dead no longer than 24 hours, and take its identity. An illusion matches its look exactly, including clothing, armor, weapons, and belongings. For a corpse, you look as it did in life. The corpse, its blood, its clothing, and other physical evidence of its death become magically invisible for 8 hours. A creature must take the Study action and succeed on an Intelligence (Investigation) check against your spell save DC to see through the disguise. Afterward you cannot use this again until a Short or Long Rest. You can also restore it by spending a use of Rushed Incantation (no action).",
  "Glib": "You can cast Glibness without a Verbal component. You can also cast it once with no spell slot and regain that use after a Long Rest. While it lasts, you can take the Influence action as a Bonus Action."},
 "lu": [{"feature": "Body Double", "n": "Body Double", "lvl": 10, "max": 1, "reset": "short", "tag": "Or spend Rushed Incantation"},
        {"feature": "Glib", "n": "Glibness (free cast)", "lvl": 14, "max": 1, "reset": "long", "tag": "No slot"}],
 "acts": {"Body Double": "action"},
 "fx": [[3, "Bravado", {"notes": [["Note", "Bravado: add Intelligence modifier (min +1) to Deception and Persuasion checks"]]}]]},

"Time Operative": {"spab": "",
 "f": {
  "Borrowed Time": "Once on each of your turns, you can take an extra action. It can only be Attack (one attack only), Dash, Disengage, Hide, or Utilize. You have 2 uses. A Long Rest returns all of them.",
  "Trinkets": "**Blank Tablet.** Magic action: touch a creature and end one condition on it: Blinded, Deafened, Paralyzed, or Poisoned. You cannot remove a condition that has lasted longer than 1 minute. **Quicksilver Emblem.** Bonus Action: cast Longstrider with no slot or components. **Weightless Sphere.** Cast Feather Fall with no slot or components.",
  "Rewind": "When you fail a D20 Test, you can use a Bonus Action to rewind time to just before the attempt. You reroll and must use the new roll. You can do this a number of times equal to your Intelligence modifier (minimum once). A Long Rest returns all uses.",
  "Echo of Yesterday": "Magic action: send your senses up to 24 hours back in time at your current location. You see and hear it as if you were there, though the past looks dreamlike and shadowy. You can look in any direction but cannot move or speak. It lasts 10 minutes and ends early if you dismiss it (no action).",
  "Steal Time": "When you finish a Short Rest or reduce an enemy to 0 Hit Points, you regain a use of Borrowed Time."},
 "lu": [{"feature": "Borrowed Time", "n": "Borrowed Time", "lvl": 3, "max": 2, "reset": "long", "tag": "Extra action"},
        {"feature": "Rewind", "n": "Rewind", "lvl": 6, "max": "mod:INT", "reset": "long", "tag": "Bonus Action"}],
 "acts": {"Rewind": "bonus", "Echo of Yesterday": "action"}},
}
