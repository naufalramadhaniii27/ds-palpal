/* Responsibility: long rules text for the 2014 Player's Handbook species traits and background features. The builder stores it as `full` on the
   sheet feature, so the sheet (Show more) and the PDF export both read it. Own wording; the short text stays in `d`. Key: species name (without "(2014)") then trait name; background feature name, or "background|feature" when two backgrounds share a name. */
const LONG14_SPECIES = {
 "Hill Dwarf": {
  "Dwarven Resilience": "You have Advantage on saving throws against poison, and you have Resistance to poison damage. Dwarves are hardy, and venom and toxins that fell other folk often leave them standing.",
  "Dwarven Combat Training": "You are proficient with the battleaxe, handaxe, light hammer, and warhammer.",
  "Tool Proficiency": "Choose one set of tools: smith's tools, brewer's supplies, or mason's tools. You are proficient with the one you pick.",
  "Stonecunning": "Whenever you make an Intelligence (History) check about the origin of stonework, you count as proficient in History. You add double your Proficiency Bonus to the check instead of your normal bonus.",
  "Heavy Armor Pace": "Wearing Heavy armor never slows you down. Your Speed stays the same even if your Strength is lower than the armor asks for.",
  "Dwarven Toughness": "Your Hit Point maximum goes up by 1 when you take your first level, and by 1 more each time you gain a level."
 },
 "Mountain Dwarf": {
  "Dwarven Resilience": "You have Advantage on saving throws against poison, and you have Resistance to poison damage. Dwarves are hardy, and venom and toxins that fell other folk often leave them standing.",
  "Dwarven Combat Training": "You are proficient with the battleaxe, handaxe, light hammer, and warhammer.",
  "Tool Proficiency": "Choose one set of tools: smith's tools, brewer's supplies, or mason's tools. You are proficient with the one you pick.",
  "Stonecunning": "Whenever you make an Intelligence (History) check about the origin of stonework, you count as proficient in History. You add double your Proficiency Bonus to the check instead of your normal bonus.",
  "Heavy Armor Pace": "Wearing Heavy armor never slows you down. Your Speed stays the same even if your Strength is lower than the armor asks for.",
  "Dwarven Armor Training": "You are proficient with Light armor and Medium armor."
 },
 "High Elf": {
  "Keen Senses": "You are proficient in the Perception skill.",
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Trance": "Elves do not sleep. Instead you rest by meditating, half aware of your surroundings, for 4 hours. After that, you gain the same benefit a human gets from 8 hours of sleep, so it counts as a Long Rest.",
  "Elf Weapon Training": "You are proficient with the longsword, shortsword, shortbow, and longbow.",
  "Cantrip": "You know one cantrip of your choice from the Wizard spell list. Intelligence is your spellcasting ability for it.",
  "Extra Language": "You can speak, read, and write one extra language of your choice."
 },
 "Wood Elf": {
  "Keen Senses": "You are proficient in the Perception skill.",
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Trance": "Elves do not sleep. Instead you rest by meditating, half aware of your surroundings, for 4 hours. After that, you gain the same benefit a human gets from 8 hours of sleep, so it counts as a Long Rest.",
  "Elf Weapon Training": "You are proficient with the longsword, shortsword, shortbow, and longbow.",
  "Fleet of Foot": "Your base walking Speed is 35 feet instead of 30 feet.",
  "Mask of the Wild": "You can try to Hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, or other natural cover."
 },
 "Drow": {
  "Keen Senses": "You are proficient in the Perception skill.",
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Trance": "Elves do not sleep. Instead you rest by meditating, half aware of your surroundings, for 4 hours. After that, you gain the same benefit a human gets from 8 hours of sleep, so it counts as a Long Rest.",
  "Elf Weapon Training": "You are proficient with the longsword, shortsword, shortbow, and longbow.",
  "Superior Darkvision": "Your Darkvision reaches 120 feet instead of 60 feet. Darkvision lets you see Dim Light as if it were Bright Light and Darkness as if it were Dim Light, in shades of gray.",
  "Sunlight Sensitivity": "You have Disadvantage on attack rolls, and on Wisdom (Perception) checks that rely on sight, while you, your target, or the thing you are trying to see is in direct sunlight.",
  "Drow Magic": "You know the Dancing Lights cantrip. At level 3 you can cast Faerie Fire once per Long Rest. At level 5 you can cast Darkness once per Long Rest. Charisma is your spellcasting ability for these spells.",
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
  "Stout Resilience": "You have Advantage on saving throws against poison, and you have Resistance to poison damage."
 },
 "Forest Gnome": {
  "Gnome Cunning": "You have Advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.",
  "Natural Illusionist": "You know the Minor Illusion cantrip. Intelligence is your spellcasting ability for it.",
  "Speak with Small Beasts": "With sounds and gestures you can pass simple ideas to Small or smaller Beasts. Forest gnomes often keep small animals such as squirrels, badgers, and rabbits as friends."
 },
 "Rock Gnome": {
  "Gnome Cunning": "You have Advantage on all Intelligence, Wisdom, and Charisma saving throws against magic.",
  "Artificer's Lore": "When you make an Intelligence (History) check about magic items, alchemical objects, or technological devices, you add double your Proficiency Bonus instead of your normal bonus.",
  "Tinker": "You are proficient with tinker's tools. With them you can spend 1 hour and 10 gp of materials to build a Tiny clockwork device (AC 5, 1 HP). It stops working after 24 hours, or sooner if you take it apart with an action, which returns the materials. You can have up to three devices at a time. Pick one form when you build it. Clockwork Toy: a toy animal, monster, or person that walks 5 feet in a random direction each of your turns and makes fitting noises. Fire Starter: lights a candle, torch, or campfire with a small flame, using your action. Music Box: plays one song at moderate volume when opened, and stops at the end of the song or when closed."
 },
 "Human": {
  "Languages": "You can speak, read, and write Common and one extra language of your choice. Humans often pick up the languages of the peoples they deal with."
 },
 "Variant Human": {
  "Skills": "You gain proficiency in one skill of your choice.",
  "Languages": "You can speak, read, and write Common and one extra language of your choice."
 },
 "Half-Elf": {
  "Fey Ancestry": "You have Advantage on saving throws against being Charmed, and magic cannot put you to sleep.",
  "Skill Versatility": "You gain proficiency in two skills of your choice.",
  "Languages": "You can speak, read, and write Common, Elvish, and one extra language of your choice."
 },
 "Half-Orc": {
  "Menacing": "You are proficient in the Intimidation skill.",
  "Relentless Endurance": "When damage reduces you to 0 Hit Points without killing you outright, you drop to 1 Hit Point instead. You can use this once, then you must finish a Long Rest before using it again.",
  "Savage Attacks": "When you score a Critical Hit with a melee weapon attack, roll one of the weapon's damage dice one more time and add it to the extra damage of the hit."
 },
 "Dragonborn": {
  "Draconic Ancestry": "Choose a dragon type. It sets the damage type and shape of your Breath Weapon, and the damage type you resist. Black: Acid, 5 by 30 ft line, Dexterity save. Blue: Lightning, 5 by 30 ft line, Dexterity save. Brass: Fire, 5 by 30 ft line, Dexterity save. Bronze: Lightning, 5 by 30 ft line, Dexterity save. Copper: Acid, 5 by 30 ft line, Dexterity save. Gold: Fire, 15 ft cone, Dexterity save. Green: Poison, 15 ft cone, Constitution save. Red: Fire, 15 ft cone, Dexterity save. Silver: Cold, 15 ft cone, Constitution save. White: Cold, 15 ft cone, Constitution save.",
  "Breath Weapon": "As an action, you exhale destructive energy in the shape set by your ancestry. Each creature in the area makes the saving throw your ancestry names. The DC is 8 + your Constitution modifier + your Proficiency Bonus. A creature takes 2d6 damage on a failed save and half as much on a success. The damage becomes 3d6 at level 6, 4d6 at level 11, and 5d6 at level 16. Once you use it, finish a Short or Long Rest before using it again.",
  "Damage Resistance": "You have Resistance to the damage type that matches your draconic ancestry."
 },
 "Tiefling": {
  "Hellish Resistance": "You have Resistance to fire damage.",
  "Infernal Legacy": "You know the Thaumaturgy cantrip. At level 3 you can cast Hellish Rebuke once per Long Rest, as a 2nd-level spell. At level 5 you can cast Darkness once per Long Rest. Charisma is your spellcasting ability for these spells."
 }
};
const LONG14_BACKGROUND = {
 "Shelter of the Faithful": "People of your faith respect you. You can lead the ceremonies of your religion. You and your allies can expect free healing and care at temples and shrines of your faith, though you pay for any spell components. Believers support you at a modest lifestyle. You may also be tied to one temple, and its priests can help you if that does not put them at risk.",
 "False Identity": "You built a second identity, with papers, acquaintances, and disguises that let you pass as that person. You can also forge documents, from official papers to personal letters, as long as you have seen a sample of that kind of document or the handwriting you want to copy.",
 "Criminal Contact": "You have one reliable, trusted contact who links you to a network of criminals. You know how to get messages to and from the contact, even over long distances. You know the local messengers, corrupt caravan masters, and seedy sailors who will carry word for you.",
 "Spy Contact": "You have one reliable, trusted contact who links you to a network of spies. You know how to get messages to and from the contact, even over long distances. You know the local messengers, caravan masters, and sailors who will carry word for you.",
 "By Popular Demand": "You can always find somewhere to perform, and while you perform each night you get free modest or comfortable lodging and food, depending on the venue. Your performances make you a minor local figure, and strangers who recognize you in a town where you have played tend to like you.",
 "Variant Entertainer (Gladiator)|By Popular Demand": "You can always find a place to perform where combat is the show, such as an arena or a pit fighting club. While you perform each night you get free modest or comfortable lodging and food, depending on the venue. Strangers who recognize you in a town where you have fought tend to like you.",
 "Rustic Hospitality": "You come from common folk and fit in among them easily. Unless you have proven a danger to them, they will hide you, shelter you, and let you rest. They will shield you from the law and from anyone searching for you, though they will not risk their lives for you.",
 "Guild Membership": "Members of your guild give you food and lodging when you need them, and they pay for your funeral. If you are accused of a crime, the guild backs you when there is a good case for your innocence or the act is justifiable. Through the guild you can also reach powerful people, though that may cost a donation of money or a magic item. You must pay dues of 5 gp per month, and missed dues must be paid back to stay in good standing.",
 "Discovery": "Your long seclusion gave you a unique and powerful discovery. It might be a great truth about the cosmos, the gods, or the forces of nature, a place no one else has seen, a fact long forgotten, or a relic that could rewrite history. It could even be knowledge that harms the people who sent you into exile. Work with your DM to decide what it is and how it affects the campaign.",
 "Position of Privilege": "Your noble birth makes people think well of you. You are welcome in high society, and people assume you have the right to be wherever you are. Common folk try to accommodate you and avoid your anger, and other nobles treat you as one of their own. You can get an audience with a local noble if you need one.",
 "Variant Noble (Knight)|Retainers": "You have three loyal retainers. One is a young noble who serves as your squire in return for training toward knighthood. The others might be a groom and a servant who helps with your armor. They do everyday tasks and do not fight for you. They avoid obvious danger such as dungeons, and they leave if you abuse them or put them in danger often.",
 "Variant Noble (Retainers)|Retainers": "You have three loyal retainers, such as attendants or messengers. They do everyday tasks and do not fight for you. They avoid obvious danger such as dungeons, and they leave if you abuse them or put them in danger often.",
 "Wanderer": "You have an excellent memory for maps and geography. You can always recall the general layout of the terrain, settlements, and other features around you. Each day you can find food and fresh water for yourself and up to five other people, as long as the land offers berries, small game, water, and the like.",
 "Researcher": "When you try to learn or recall a piece of lore you do not know, you often know where and from whom to get it, such as a library, a scriptorium, a university, or a learned person. Your DM may rule that the knowledge is hidden somewhere almost unreachable, or cannot be found at all. The deepest secrets of the multiverse can take an adventure or a whole campaign to uncover.",
 "Ship's Passage": "You can get free passage on a sailing ship for yourself and your allies, on your old ship or on one run by someone you are on good terms with, such as a former shipmate. Because you are calling in a favor, you cannot count on a schedule or route that suits you. Your DM decides how long the trip takes. In return you and your allies help the crew during the voyage.",
 "Bad Reputation": "People fear you wherever you go. In a civilized settlement you can get away with minor offenses, such as skipping a tavern bill or breaking down a shop door, because most people will not report you to the authorities.",
 "Military Rank": "You hold a rank from your career as a soldier. Soldiers loyal to your old force still recognize your authority and defer to you if their rank is lower. You can use your rank to influence soldiers and to requisition simple equipment or horses for temporary use. You can usually enter friendly military camps and fortresses where your rank is known.",
 "City Secrets": "You know the hidden patterns of cities and can find routes through the sprawl that others miss. When you are not in combat, you and the companions you lead can travel between any two places in a city twice as fast as your Speed would normally allow."
};
/* long text of a feature group ("Species: Hill Dwarf", "Background: Acolyte (2014)") and a feature name; "" when there is none */
export function long14(group, name){ const m=/^(Species|Race|Background): (.+)$/.exec(String(group||"")); if(!m) return "";
  const bare=m[2].replace(/\s*\(2014\)$/,"");
  if(m[1]==="Background") return LONG14_BACKGROUND[bare+"|"+name]||LONG14_BACKGROUND[m[2]+"|"+name]||LONG14_BACKGROUND[name]||"";
  const t=LONG14_SPECIES[bare]; return t&&t[name]||""; }
/* the `full` field to merge into a sheet feature: {full:text} on the 2014 rules when there is a long text, else {} */
export function full14(rs, group, name){ const t=rs==="2014" ? long14(group,name) : ""; return t ? {full:t} : {}; }
