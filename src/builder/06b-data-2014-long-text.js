/* Responsibility: long rules text for the 2014 Player's Handbook species traits and background features. The builder stores it as `full` on the
   sheet feature, so the sheet (Show more) and the PDF export both read it. Own wording; the short text stays in `d`. Key: species name (without "(2014)") then trait name; background feature name, or "background|feature" when two backgrounds share a name. */
const LONG14_SPECIES = {
 "Hill Dwarf": {
  "Dwarven Resilience": "Your saving throws against poison are made with Advantage, and poison damage against you is halved. Dwarves are hardy, and venom and toxins that fell other folk often leave them standing.",
  "Dwarven Combat Training": "You are proficient with the battleaxe, handaxe, light hammer, and warhammer.",
  "Tool Proficiency": "Choose one set of tools: smith's tools, brewer's supplies, or mason's tools. You are proficient with the one you pick.",
  "Stonecunning": "For Intelligence (History) checks about where stonework came from, you are proficient in History and add twice your Proficiency Bonus rather than the normal amount.",
  "Heavy Armor Pace": "Wearing Heavy armor never slows you down. Your Speed stays the same even if your Strength is lower than the armor asks for.",
  "Dwarven Toughness": "Your Hit Point maximum goes up by 1 when you take your first level, and by 1 more each time you gain a level."
 },
 "Mountain Dwarf": {
  "Dwarven Resilience": "Your saving throws against poison are made with Advantage, and poison damage against you is halved. Dwarves are hardy, and venom and toxins that fell other folk often leave them standing.",
  "Dwarven Combat Training": "You are proficient with the battleaxe, handaxe, light hammer, and warhammer.",
  "Tool Proficiency": "Choose one set of tools: smith's tools, brewer's supplies, or mason's tools. You are proficient with the one you pick.",
  "Stonecunning": "For Intelligence (History) checks about where stonework came from, you are proficient in History and add twice your Proficiency Bonus rather than the normal amount.",
  "Heavy Armor Pace": "Wearing Heavy armor never slows you down. Your Speed stays the same even if your Strength is lower than the armor asks for.",
  "Dwarven Armor Training": "You are proficient with Light armor and Medium armor."
 },
 "High Elf": {
  "Keen Senses": "You are proficient in the Perception skill.",
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Trance": "You do not sleep. Instead you spend 4 hours a day in a deep, half-conscious meditation, and afterward you are as rested as a human after 8 hours of sleep. When this is your Long Rest, it is over after 4 hours, and every other Long Rest rule stays the same.",
  "Elf Weapon Training": "You are proficient with the longsword, shortsword, shortbow, and longbow.",
  "Cantrip": "Pick one cantrip from the Wizard spell list. You know it, and Intelligence is the ability you cast it with.",
  "Extra Language": "You can speak, read, and write one extra language of your choice."
 },
 "Wood Elf": {
  "Keen Senses": "You are proficient in the Perception skill.",
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Trance": "You do not sleep. Instead you spend 4 hours a day in a deep, half-conscious meditation, and afterward you are as rested as a human after 8 hours of sleep. When this is your Long Rest, it is over after 4 hours, and every other Long Rest rule stays the same.",
  "Elf Weapon Training": "You are proficient with the longsword, shortsword, shortbow, and longbow.",
  "Fleet of Foot": "Your base walking Speed is 35 feet instead of 30 feet.",
  "Mask of the Wild": "Light natural cover is enough for you to try hiding: foliage, heavy rain, falling snow, mist, or similar effects."
 },
 "Drow": {
  "Keen Senses": "You are proficient in the Perception skill.",
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Trance": "You do not sleep. Instead you spend 4 hours a day in a deep, half-conscious meditation, and afterward you are as rested as a human after 8 hours of sleep. When this is your Long Rest, it is over after 4 hours, and every other Long Rest rule stays the same.",
  "Superior Darkvision": "Your Darkvision reaches 120 feet instead of 60 feet. Darkvision lets you see Dim Light as if it were Bright Light and Darkness as if it were Dim Light, in shades of gray.",
  "Sunlight Sensitivity": "In direct sunlight you suffer Disadvantage on attack rolls and on sight-based Wisdom (Perception) checks. This applies when you, the creature you attack, or the thing you are looking at stands in that sunlight.",
  "Drow Magic": "You know Dancing Lights. At level 3 you gain Faerie Fire, and at level 5 you gain Darkness. Each can be cast once between Long Rests, with Charisma as the casting ability.",
  "Drow Weapon Training": "You are proficient with the rapier, shortsword, and hand crossbow."
 },
 "Lightfoot Halfling": {
  "Lucky": "When you roll a natural 1 on an attack roll, an ability check, or a saving throw, you can reroll the die. You must use the new roll.",
  "Brave": "You have Advantage on saving throws against being Frightened.",
  "Halfling Nimbleness": "You can move through the space of any creature that is one size larger than you.",
  "Naturally Stealthy": "You can try to Hide when the only thing blocking sight of you is a creature at least one size larger than you."
 },
 "Stout Halfling": {
  "Lucky": "When you roll a natural 1 on an attack roll, an ability check, or a saving throw, you can reroll the die. You must use the new roll.",
  "Brave": "You have Advantage on saving throws against being Frightened.",
  "Halfling Nimbleness": "You can move through the space of any creature that is one size larger than you.",
  "Stout Resilience": "Your saving throws against poison are made with Advantage, and poison damage against you is halved."
 },
 "Forest Gnome": {
  "Gnome Cunning": "You have Advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.",
  "Natural Illusionist": "You know the Minor Illusion cantrip. Intelligence is your spellcasting ability for it.",
  "Speak with Small Beasts": "With sounds and gestures you can pass simple ideas to Small or smaller Beasts. Forest gnomes often keep small animals such as squirrels, badgers, and rabbits as friends."
 },
 "Rock Gnome": {
  "Gnome Cunning": "You have Advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.",
  "Artificer's Lore": "When you make an Intelligence (History) check about magic items, alchemical objects, or technological devices, you add double your Proficiency Bonus instead of your normal bonus.",
  "Tinker": "You are proficient with tinker's tools. With them you can spend 1 hour and 10 gp of materials to build a Tiny clockwork device (AC 5, 1 HP). It stops working after 24 hours unless you spend 1 hour repairing it, or sooner if you take it apart with an action, which returns the materials. You can have up to three devices at a time. Pick one form when you build it. Clockwork Toy: a toy animal, monster, or person that walks 5 feet in a random direction each of your turns and makes fitting noises. Fire Starter: lights a candle, torch, or campfire with a small flame, using your action. Music Box: plays one song at moderate volume when opened, and stops at the end of the song or when closed."
 },
 "Human": {
  "Languages": "Besides Common, you know one extra language of your choice, and you can speak, read, and write both. Humans often learn the speech of neighbors and trading partners."
 },
 "Variant Human": {
  "Skills": "You gain proficiency in one skill of your choice.",
  "Languages": "Besides Common, you know one extra language of your choice, and you can speak, read, and write both."
 },
 "Half-Elf": {
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Skill Versatility": "You gain proficiency in two skills of your choice.",
  "Languages": "You can speak, read, and write Common, Elvish, and one extra language of your choice."
 },
 "Half-Orc": {
  "Menacing": "You are proficient in the Intimidation skill.",
  "Relentless Endurance": "When damage reduces you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. You can use this once, then you must finish a Long Rest before using it again.",
  "Savage Attacks": "When you roll a Critical Hit with a melee weapon, you get to roll one of that weapon's damage dice an extra time and add the result to the critical hit's extra damage."
 },
 "Dragonborn": {
  "Draconic Ancestry": "Choose a dragon type. It sets the damage type and shape of your Breath Weapon, and the damage type you resist. Black: Acid, 5 by 30 ft line, Dexterity save. Blue: Lightning, 5 by 30 ft line, Dexterity save. Brass: Fire, 5 by 30 ft line, Dexterity save. Bronze: Lightning, 5 by 30 ft line, Dexterity save. Copper: Acid, 5 by 30 ft line, Dexterity save. Gold: Fire, 15 ft cone, Dexterity save. Green: Poison, 15 ft cone, Constitution save. Red: Fire, 15 ft cone, Dexterity save. Silver: Cold, 15 ft cone, Constitution save. White: Cold, 15 ft cone, Constitution save.",
  "Breath Weapon": "Use your action to breathe out a burst of energy. Its shape and damage type come from your draconic ancestry. Every creature in the burst makes a saving throw, and the type of save also comes from your ancestry. The DC is 8 + your Constitution modifier + your Proficiency Bonus. On a failed save a creature takes 2d6 damage, and on a success half of that. The damage is 3d6 at level 6, 4d6 at level 11, and 5d6 at level 16. You need a Short or Long Rest before you can breathe again.",
  "Damage Resistance": "You have Resistance to the damage type that matches your draconic ancestry."
 },
 "Tiefling": {
  "Hellish Resistance": "You have Resistance to fire damage.",
  "Infernal Legacy": "You know the Thaumaturgy cantrip. At level 3 you gain Hellish Rebuke, cast as a 2nd-level spell, and at level 5 you gain Darkness. Each can be cast once per Long Rest. Charisma is the ability you cast them with."
 }
};
const LONG14_BACKGROUND = {
 "Shelter of the Faithful": "People of your faith respect you. You can lead the ceremonies of your religion. You and your allies can expect free healing and care at temples and shrines of your faith, though you pay for any spell components. Believers support you at a modest lifestyle. You may also be tied to one temple, and its priests can help you if that does not put them at risk.",
 "False Identity": "You built a second identity, with papers, acquaintances, and disguises that let you pass as that person. You can also forge documents, from official papers to personal letters, as long as you have seen a sample of that kind of document or the handwriting you want to copy.",
 "Criminal Contact": "One trustworthy contact connects you to a wider criminal network. You know how to pass messages to this contact over long distances, using local messengers, crooked caravan masters, and shady sailors.",
 "Spy Contact": "One trustworthy contact connects you to a wider network of spies. You know how to pass messages to this contact over long distances, using local messengers, caravan masters, and sailors.",
 "By Popular Demand": "You can always find somewhere to perform, and while you perform each night you get free modest or comfortable lodging and food, depending on the venue. Your performances make you a minor local figure, and strangers who recognize you in a town where you have played tend to like you.",
 "Variant Entertainer (Gladiator)|By Popular Demand": "You can always find a place to perform where combat is the show, such as an arena or a pit fighting club. While you perform each night you get free modest or comfortable lodging and food, depending on the venue. Strangers who recognize you in a town where you have fought tend to like you.",
 "Rustic Hospitality": "You grew up among ordinary people and blend in with them easily. Commoners will let you hide, sleep, and recover in their homes, as long as you have not threatened them. They will cover for you against the law or anyone hunting you, but they will not put their lives on the line for you.",
 "Guild Membership": "Being in a respected guild brings you perks. Members will feed and house you when you need it, and they cover your funeral costs. If you are accused of a crime, the guild stands by you when your innocence is plausible or the act can be justified. It also opens doors to powerful figures, sometimes for a donation of money or a magic item. Dues are 5 gp each month, and you owe back dues to stay in good standing.",
 "Discovery": "Long years alone led you to something special and powerful. It could be a truth about the cosmos, the gods, other planes, or nature, an unseen place, a forgotten fact, or a relic that could change what people think of the past. It might also be a secret that endangers whoever exiled you. Work out the details with your DM, including how it shapes the campaign.",
 "Position of Privilege": "Your noble birth gives you a head start with people. High society welcomes you, and others assume you belong wherever you stand. Commoners go out of their way to keep you happy, and fellow nobles treat you as an equal. If you ask, a local noble will see you.",
 "Variant Noble (Knight)|Retainers": "You have three loyal retainers. One is a young noble who serves as your squire in return for training toward knighthood. The others might be a groom and a servant who helps with your armor. They do everyday tasks and do not fight for you. They avoid obvious danger such as dungeons, and they leave if you abuse them or put them in danger often.",
 "Variant Noble (Retainers)|Retainers": "You have three loyal retainers, such as attendants or messengers. They do everyday tasks and do not fight for you. They avoid obvious danger such as dungeons, and they leave if you abuse them or put them in danger often.",
 "Wanderer": "You remember maps and landscapes well, so you always know the rough layout of the terrain and settlements near you. When the area offers berries, game, or water, you can forage each day enough food and drinking water for six people: you and up to five others.",
 "Researcher": "When you try to learn or recall a piece of lore you do not know, you often know where and from whom to get it, such as a library, a scriptorium, a university, or a learned person. Your DM may rule that the knowledge is hidden somewhere almost unreachable, or cannot be found at all. The deepest secrets of the multiverse can take an adventure or a whole campaign to uncover.",
 "Ship's Passage": "You can arrange a free ride on a sailing ship for you and your allies, on your old vessel or another with a friendly crew, perhaps run by a former shipmate. Since this is a favor, the schedule and route may not suit you. The DM decides how long the voyage takes. You and your allies pitch in with the crew's work in exchange.",
 "Bad Reputation": "People fear you wherever you go. In a civilized settlement you can get away with minor offenses, such as skipping a tavern bill or breaking down a shop door, because most people will not report you to the authorities.",
 "Military Rank": "Your career as a soldier left you with a rank. Soldiers from your old force still honor it and give way to you if they rank lower. You can use it to sway soldiers, to borrow simple gear or horses for a while, and to enter friendly camps and fortresses where people know your rank.",
 "City Secrets": "You know the hidden rhythms of cities and spot routes through the crowds and streets that others miss. Outside combat, you and the companions you lead cover the distance between any two places in a city at twice your normal pace."
};
/* long text of a feature group ("Species: Hill Dwarf", "Background: Acolyte (2014)") and a feature name; "" when there is none */
export function long14(group, name){ const m=/^(Species|Race|Background): (.+)$/.exec(String(group||"")); if(!m) return "";
  const bare=m[2].replace(/\s*\(2014\)$/,"");
  if(m[1]==="Background") return LONG14_BACKGROUND[bare+"|"+name]||LONG14_BACKGROUND[m[2]+"|"+name]||LONG14_BACKGROUND[name]||"";
  const t=LONG14_SPECIES[bare]; return t&&t[name]||""; }
/* the `full` field to merge into a sheet feature: {full:text} on the 2014 rules when there is a long text, else {} */
export function full14(rs, group, name){ const t=rs==="2014" ? long14(group,name) : ""; return t ? {full:t} : {}; }
