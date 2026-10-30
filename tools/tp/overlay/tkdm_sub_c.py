# Own-wording subclasses of Deep Magic (2014 rules), group C: Angelic Scribe and nine Cleric domains.
# Angelic Scribe is listed as Wizard in the source. The source says Cleric can use it too, but only the Wizard entry exists.
# The ten angelic seals are the optional features of type AG in the source and are attached as picks.

SEALS = [
 ["Amnayeth (Benevolence)", "Base: the user can reroll a failed ability check made to improve another creature's attitude. Greater: once in the next minute, as an action, the user makes a creature that can hear it save with Wisdom against your spell save DC or be Charmed for 10 minutes. After using it on a creature, this seal cannot be used on a check involving that same creature until a Short or Long Rest."],
 ["Barrateth (Fortune)", "Base: the user adds 1 to an attack roll, saving throw, or ability check, after the roll and before the GM says if it succeeded. Greater: after making an attack roll, saving throw, or ability check, the user rolls another d20 and picks which result to use, again before the GM reveals the outcome. The Greater effect cannot be used again until a Short or Long Rest."],
 ["Chamule (Judgment)", "Base: when the user hits with an opportunity attack, it can move up to half its Speed, as long as it ends no farther from the creature it hit. Greater: once in the next minute, as a Reaction when hit by an attack, the user makes the attacker take Radiant damage equal to your Intelligence modifier (minimum 1), if the attacker is within 60 ft of the user."],
 ["Iaothe (Temperance)", "Base: when the user makes a Wisdom saving throw, it can use its Reaction to add your Intelligence modifier (minimum 1) to the roll, after the die is rolled and before the result is known. Greater: the user cannot be Charmed or Frightened. Once used, the seal does not work again until the user finishes a Short or Long Rest."],
 ["Jelaal (Recovery)", "Base: the user automatically succeeds on its first death saving throw and then regains 1 Hit Point. Greater: whenever the user regains Hit Points, it regains an extra number equal to your Intelligence modifier (minimum 1). Once used, the seal does not work again until the user finishes a Short or Long Rest."],
 ["Ophanim (Humility)", "Base: the user adds half your Intelligence modifier (minimum 1) to Dexterity (Stealth) checks. This lasts until the start of its next turn after it takes a hostile action (any action that could intentionally damage a creature). Greater: if it has not taken a hostile action this turn, the user can use its action to show an aura of humility. A creature that wants to attack the user must succeed on a Wisdom saving throw against your spell save DC or pick another target. If it has no other target, it does nothing with its action."],
 ["Rikbil (Fortitude)", "Base: when the user is hit by an attack, it can use its Reaction to add 2 to its AC against that attack. It must see the attacker. Greater: the user gains resistance to nonmagical Bludgeoning, Piercing, and Slashing damage."],
 ["Simil (Clarity)", "Base: for 1 minute the user adds half your Intelligence modifier (minimum 1) to Wisdom (Insight) and Wisdom (Perception) checks. Greater: the user gains Blindsight out to 10 ft."],
 ["Vrechiel (Glory)", "Base: when the user reduces an enemy to 0 Hit Points, it gains Temporary Hit Points equal to your Intelligence modifier (minimum 1). Greater: once in the next minute, at the start of its turn, the user gains Temporary Hit Points equal to your caster level."],
 ["Xapanie (Wrath)", "Base: once on each of the user's turns when it hits with a weapon attack, that attack gains +1 damage. Greater: the user's attacks are magical, and once on each of its turns in the next minute, a weapon hit deals extra Radiant damage equal to half your caster level (minimum 1)."],
]

def _seal(l, n, key, title):
    return {"l": l, "k": "opts", "n": n, "key": key, "feature": "Seal Scribe", "title": title, "list": [list(x) for x in SEALS]}

SUB = {
"Angelic Scribe": {"spab": "INT",
 "f": {
  "Angelic Savant": "The gold and time you spend to copy an angelic spell into your spellbook are halved.",
  "Seal Scribe": "You learn Celestial if you do not know it, and you learn two angelic seals of your choice. Scribing a seal takes 10 minutes on a carryable surface such as paper, canvas, or stone tiles, or 8 hours with proper artisan tools to carve or etch a lasting version into hard material. Once scribed, you activate a seal as an action. You can keep one seal active at a time, rising to two at level 6, three at level 10, and four at level 14. A seal is suppressed while you concentrate on a spell or similar effect, but it still counts against your active limit. You can deactivate a seal as a Bonus Action before activating another. A broken or defaced seal deactivates and must be replaced. You can give an active seal to another creature, which gains its benefit while it holds or openly wears the seal, except while it is concentrating on a spell or similar effect. At levels 6, 10, and 14 you learn one more seal and may swap one known seal for another.",
  "Wizard or Cleric Specialty": "You can take this specialty in place of an arcane tradition, or alongside one. If you combine them, you gain the Savant feature of your school plus Angelic Savant. At level 2 you pick Seal Scribe or the level 2 feature of your school. At levels 6, 10, and 14 you pick between the lowest-level features still unchosen. A cleric makes the same choices against domain features at levels 2, 6, 8, and 17. Paladins can cast angelic spells and take angelic feats but cannot become angelic scribes.",
  "Warding Seal": "You can scribe warding seals the same way as angelic seals, but each must be made on the ground, a floor, or a wall, column, or ceiling. Touch the seal as an action to activate it. You must concentrate on it as if on a spell. It creates a sphere of safe space with a 30 ft radius around it, enough for a small building or about 11,000 cubic feet (a 22 ft cube). An aberration, fey, fiend, or undead cannot cross the boundary, cast spells through it, or project abilities across it unless it succeeds on a Charisma saving throw against your spell save DC. A creature that fails can try again on its next turn. A creature that succeeds and moves inside is not affected by the boundary while it stays inside, but faces the ward again if it leaves and tries to return. The boundary only blocks incoming creatures and effects.",
  "Greater Seal": "As an action, you can empower one of your active angelic seals or warding seals. An angelic seal gives its user the Greater benefit for 1 minute (unless the seal says otherwise) in place of its normal benefit. For a warding seal, for the next hour a creature that fails its saving throw against the ward takes 6d6 Radiant damage and automatically fails further saves against the ward in that time. You can do this twice and regain expended uses on a Short or Long Rest. You get this feature at level 10 (level 8 for a cleric).",
  "Angelic Wrath": "You add conjure celestial to your spellbook or spells known if you do not have it. As a Bonus Action you can infuse your seals with angelic wrath for 1 minute. You deal an extra 1d8 Radiant damage with weapon attacks, and so does any creature within 30 ft of you that holds one of your active seals. Short or Long Rest to use again. You get this feature at level 14 (level 17 for a cleric)."},
 "lu": [{"feature": "Greater Seal", "lvl": 10, "max": 2, "reset": "short", "tag": "Action"}, {"feature": "Angelic Wrath", "lvl": 14, "max": 1, "reset": "short", "tag": "Bonus Action"}],
 "acts": {"Greater Seal": "action", "Angelic Wrath": "bonus"},
 "fx": [[3, "Seal Scribe", {"langs": ["Celestial"]}]],
 "pick": [_seal(3, 2, "seal3", "Angelic seals (2)"), _seal(6, 1, "seal6", "Angelic seal (3rd)"), _seal(10, 1, "seal10", "Angelic seal (4th)"), _seal(14, 1, "seal14", "Angelic seal (5th)")]},

"Apocalypse Domain": {"spab": "WIS",
 "f": {
  "Ranting Ruin": "You learn the vicious mockery cantrip. You also gain proficiency in Arcana or Survival (your choice).",
  "Channel Divinity: Damnation": "As an action, present your holy symbol and pronounce doom on unbelievers. Each hostile creature that can see you within 30 ft takes 3d6 + your Cleric level Necrotic damage, or half on a successful Wisdom save. Creatures with total cover from you are not affected.",
  "Channel Divinity: Weight of Guilt": "As an action, choose a creature you see within 60 ft. It makes a Wisdom saving throw. On a failure, for 10 minutes you automatically know whether anything it says is true, a lie, or something between. On a success, it cannot be affected by this feature again until you finish a Long Rest.",
  "Divine Strike": "Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Necrotic damage. The extra damage becomes 2d8 at level 14.",
  "Herald of the Apocalypse": "You have resistance to Acid, Fire, and Poison damage."},
 "lu": [], "acts": {"Channel Divinity: Damnation": "action", "Channel Divinity: Weight of Guilt": "action"},
 "fx": [[17, "Herald of the Apocalypse", {"res": ["Acid", "Fire", "Poison"]}]]},

"Beer Domain": {"spab": "WIS",
 "f": {
  "Disciple of the Draught": "You learn the message cantrip. You gain proficiency in Insight or Medicine (your choice) and with brewer's supplies. Your Proficiency Bonus is doubled on any ability check that uses those supplies.",
  "Channel Divinity: Blessed Brew": "Turn a container of nonmagical liquid into blessed brew with a number of doses equal to 3 + your Wisdom modifier. Any special properties the liquid had are removed. A creature that drinks a dose picks one benefit for 1 hour: advantage on Charisma-based skill checks, +1 AC, or +1 to the DC of saves against its own enchantment spells. When it fades it leaves a warm buzz. A creature can benefit from only one dose between rests. One hour after you create it, the liquid becomes ordinary beer.",
  "Channel Divinity: Boot and Rally": "Each friendly creature within 30 ft of you that is Frightened, Paralyzed, Poisoned, or Stunned gets an immediate saving throw with advantage to end that effect. A creature that succeeds also regains 2d6 Hit Points.",
  "Divine Strike": "Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Radiant damage. The extra damage becomes 2d8 at level 14.",
  "Fire in the Belly": "You have resistance to Cold, Poison, and Psychic damage."},
 "lu": [], "acts": {"Channel Divinity: Blessed Brew": "action", "Channel Divinity: Boot and Rally": "action"},
 "fx": [[3, "Disciple of the Draught", {"notes": [["Note", "Disciple of the Draught: proficiency in Insight or Medicine (your choice) and brewer's supplies, with doubled Proficiency Bonus on checks using those supplies"]]}], [17, "Fire in the Belly", {"res": ["Cold", "Poison", "Psychic"]}]]},

"Cat Domain": {"spab": "WIS",
 "f": {
  "A Claw in the Clowder": "You learn the true strike cantrip and gain proficiency in Acrobatics and Stealth.",
  "Channel Divinity: Feline Finesse": "Add a +10 bonus to a Dexterity ability or skill check made by you or by a creature you designate within 30 ft.",
  "Eyes of the Cat": "You gain Darkvision with a range of 60 ft. If you already have Darkvision, its range becomes 90 ft.",
  "Divine Strike": "The source repeats the Eyes of the Cat benefit here (Darkvision 60 ft, or 90 ft if you already have it) and gives no extra damage. Ask your GM whether a damage rider was intended.",
  "Emissary of the Cat": "You become a natural lycanthrope of the weretiger or werelion type, whichever fits your deity. Use the rules for player characters as lycanthropes. You cannot spread lycanthropy."},
 "lu": [], "acts": {"Channel Divinity: Feline Finesse": "action"},
 "fx": [[3, "A Claw in the Clowder", {"skills": ["Acrobatics", "Stealth"]}], [6, "Eyes of the Cat", {"senses": [["Darkvision", 60, ""]], "notes": [["Note", "Eyes of the Cat: if you already have Darkvision, its range becomes 90 ft"]]}]]},

"Clockwork Domain": {"spab": "WIS",
 "f": {
  "Blessing of the Gears": "You have advantage on attack rolls against clockwork creatures and other constructs.",
  "Bonus Proficiencies": "You gain proficiency with clockmaker's tools and heavy armor.",
  "Clockwork Gods": "Two sample patrons. Volund the Smith (Neutral Good, symbol of a crossed hammer and wrench) is based on the wandering smith of Germanic and Norse legend and teaches forging, crafting, and clockwork magic. Molech Childeater (Chaotic Evil, symbol of a black furnace with a demonic grin) is based on Moloch, tied to fire and child sacrifice, and gained clockwork through his furnaces.",
  "Channel Divinity: Construct Mastery": "As an action, one construct you see within 30 ft makes a Wisdom saving throw against your cleric spell save DC. On a failure it becomes friendly and obeys your commands for 1 minute or until you or an ally damages it. If it fails by 5 or more, the duration becomes 1 hour, until you use this ability again, or until you or an ally damages it. When the effect ends, the construct knows you controlled it.",
  "Improved Mending": "Your spells that heal or repair damage to clockwork creatures, objects, or constructs restore the maximum possible Hit Points.",
  "Channel Magic": "Choose one construct you control as a channel for your divine magic. You can cast spells on it that normally target only you, and you can deliver touch spells through it. This works only while it is within 60 ft of you.",
  "Clockwork Apotheosis": "As an action, you merge with a construct you control for 1 minute. You regain Hit Points as if you had finished a Long Rest, but no other class features. While merged you gain all the immunities and qualities of the construct, and you can cast spells, use class features, and speak normally even if the construct could not. Long Rest to use again."},
 "lu": [{"feature": "Clockwork Apotheosis", "lvl": 17, "max": 1, "reset": "long", "tag": "Action"}],
 "acts": {"Channel Divinity: Construct Mastery": "action", "Clockwork Apotheosis": "action"},
 "fx": [[3, "Bonus Proficiencies", {"notes": [["Note", "Bonus Proficiencies: proficiency with clockmaker's tools and heavy armor"]]}]]},

"Darkness Domain": {"spab": "WIS",
 "f": {
  "Creature of Darkness": "You gain proficiency in Deception or Stealth (your choice). While in dim light or darkness, you can take the Hide action as a Bonus Action.",
  "Channel Divinity: Shadowsight": "You gain Darkvision 60 ft for 1 hour. If you already have Darkvision from your species, you instead see in magical darkness out to 30 ft as if it were dim light for 1 hour.",
  "Shadow Meld": "Use your Channel Divinity to merge your location with its version on the plane of shadow. This affects a 60 ft radius sphere centered on you. Inside it, bright light becomes dim, dim light becomes darkness, and darkness becomes magical darkness. The temperature plummets. Every creature other than you in the sphere at the end of its turn makes a Constitution save or takes 1d8 Cold damage. It lasts 1 minute or until you dismiss it as a Bonus Action. If the GM allows, 2d4 shadows may step through when it ends, hostile or not.",
  "Divine Strike": "Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Necrotic damage. The extra damage becomes 2d8 at level 14.",
  "Shadow Shield": "Your shadow defends you. Whenever a nonmagical attack or effect hits you and causes damage, your shadow absorbs half of it. When it has absorbed damage equal to one quarter of your maximum Hit Points, it vanishes until you finish a Long Rest."},
 "lu": [], "acts": {"Creature of Darkness": "bonus", "Channel Divinity: Shadowsight": "action", "Shadow Meld": "action"},
 "fx": [[3, "Creature of Darkness", {"notes": [["Note", "Creature of Darkness: proficiency in Deception or Stealth (your choice). Hide as a Bonus Action in dim light or darkness"]]}]]},

"Dragon Domain": {"spab": "WIS",
 "f": {
  "Bonus Proficiency": "You gain proficiency in Arcana, and your Proficiency Bonus is doubled on its checks. You also have advantage on saving throws against being Frightened.",
  "Channel Divinity: Charmer of Reptiles": "As an action, present your holy symbol and invoke your deity. Each reptilian creature within 30 ft that can see you makes a Wisdom saving throw or is Charmed for 1 minute or until it takes damage. A charmed reptile is friendly to you and to creatures you name. This is meant for nonintelligent reptiles.",
  "Dragon's Resistance": "When you fail a saving throw, you can use a Reaction and expend one use of Channel Divinity to succeed on it instead.",
  "Divine Strike": "Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Fire damage. The extra damage becomes 2d8 at level 14.",
  "Frightful Presence": "As an action, each creature of your choice within 60 ft that is aware of you must succeed on a DC 16 Wisdom saving throw or be Frightened for 1 minute. A frightened creature repeats the save at the end of each of its turns, ending the effect on a success. A creature that succeeds, or whose effect ends, is immune to your Frightful Presence for 24 hours. Short or Long Rest to use again."},
 "lu": [{"feature": "Frightful Presence", "lvl": 17, "max": 1, "reset": "short", "tag": "Action, DC 16 Wisdom"}],
 "acts": {"Channel Divinity: Charmer of Reptiles": "action", "Dragon's Resistance": "reaction", "Frightful Presence": "action"},
 "fx": [[3, "Bonus Proficiency", {"skills": ["Arcana"], "exp": ["Arcana"], "notes": [["Note", "Bonus Proficiency: advantage on saving throws against being Frightened"]]}]]},

"Hunger Domain": {"spab": "WIS",
 "f": {
  "Bonus Proficiency": "You gain proficiency with heavy armor.",
  "Unsated": "You learn the poison spray cantrip. You also gain proficiency in Survival and with cooking tools.",
  "Channel Divinity: Ferocious Feast": "You gain a bite attack for 1 minute. It deals 1d6 + your Strength modifier Piercing damage. On a critical hit, add your Wisdom modifier to the damage as well as the usual critical benefits.",
  "Revitalize": "As an action, you remove from yourself the effect of a disease, a poison, the Poisoned condition, or one level of Exhaustion. Long Rest to use again.",
  "Divine Strike": "Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Necrotic damage. The extra damage becomes 2d8 at level 14.",
  "Ravening Horde": "You drain the vitality of those around you and stir up a horrifying hunger. Living creatures within 60 ft of you make a Charisma saving throw. On a failure they take 10d8 Necrotic damage and then drop what they hold and attack the unaffected with hands, teeth, or natural weapons to devour them. This lasts 3 + your Wisdom modifier rounds. Each affected creature repeats the save at the end of its turn, ending the effect on a success. You can exclude up to ten creatures, but that does not protect them from those who succumb. Constructs and undead are not affected."},
 "lu": [{"feature": "Revitalize", "lvl": 6, "max": 1, "reset": "long", "tag": "Action"}],
 "acts": {"Channel Divinity: Ferocious Feast": "action", "Revitalize": "action", "Ravening Horde": "action"},
 "fx": [[3, "Unsated", {"skills": ["Survival"], "notes": [["Note", "Unsated: proficiency with cooking tools"]]}], [3, "Bonus Proficiency", {"notes": [["Note", "Bonus Proficiency: heavy armor"]]}]]},

"Hunting Domain": {"spab": "WIS",
 "f": {
  "Forest Master": "You gain proficiency with longbows and heavy crossbows, and in Nature and Survival.",
  "Channel Divinity: Undetected": "You blend into any environment. For a number of rounds equal to your Cleric level + your Wisdom modifier, you have advantage on Stealth checks to move quietly or hide, and you leave no scent.",
  "Resolute Hunter": "You choose a favored enemy as a ranger does and gain all benefits of the ranger Favored Enemy feature, with one change. You choose your additional favored enemies (and languages) at levels 10 and 16 instead of levels 6 and 14.",
  "Divine Strike": "Once on your turn, when you hit a creature with a weapon attack, you can deal an extra 1d8 damage of the same type the weapon deals. The extra damage becomes 2d8 at level 14.",
  "Deadly Stalker": "As an action, describe or name a creature that is familiar to you or that you see within 120 ft. For 24 hours or until the target dies, you have advantage on Wisdom (Survival) checks to track it, Wisdom (Perception) checks to detect it, and weapon attack rolls against it. Short or Long Rest to use again."},
 "lu": [{"feature": "Deadly Stalker", "lvl": 17, "max": 1, "reset": "short", "tag": "Action"}],
 "acts": {"Channel Divinity: Undetected": "action", "Deadly Stalker": "action"},
 "fx": [[3, "Forest Master", {"skills": ["Nature", "Survival"], "notes": [["Note", "Forest Master: proficiency with longbows and heavy crossbows"]]}]]},

"Justice Domain": {"spab": "WIS",
 "f": {
  "Bonus Proficiency": "You gain proficiency with heavy armor and martial weapons.",
  "Channel Divinity: No Hiding Place": "You sense the general direction of a creature that is guilty of an injustice or wanted for a serious crime. From level 7 you also learn the distance to it in miles.",
  "Hand of Justice": "You are immune to the Frightened condition.",
  "Divine Strike": "Once on each of your turns when you hit a creature with a weapon attack, you can deal an extra 1d8 Radiant damage. The extra damage becomes 2d8 at level 14.",
  "Holy Denunciation": "Use your Channel Divinity while presenting your holy symbol and invoking your deity, to convince others you hold divine authority to deliver justice. This works if your deity is openly worshipped in the land where you assert it. You have advantage on Wisdom and Charisma checks about justice, judgment, and law, up to and including execution for crimes."},
 "lu": [], "acts": {"Channel Divinity: No Hiding Place": "action", "Holy Denunciation": "action"},
 "fx": [[3, "Bonus Proficiency", {"notes": [["Note", "Bonus Proficiency: heavy armor and martial weapons"]]}], [6, "Hand of Justice", {"notes": [["Note", "Hand of Justice: Immunity to the Frightened condition"]]}]]},
}
