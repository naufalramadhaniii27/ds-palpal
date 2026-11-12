# Own-wording subclasses of Grim Hollow Player's Guide, 2014 rules, batch C: Rogue, Sorcerer, Warlock, Wizard.
MISFORTUNES = [
 ["Curse of the Befuddled", "As an action spend 2 jinx points. The creature marked by your evil eye is Charmed for 10 minutes and is no longer marked. It ends early if you or your allies damage it or make it save. Afterward it knows magic swayed its mood."],
 ["Curse of the Clumsy", "When a marked creature moves 5 ft or more, use your reaction and 3 jinx points. It falls Prone and its speed is 0 until the end of the turn. It is no longer marked."],
 ["Curse of the Debilitated", "When a marked creature takes damage, use your reaction and 1 jinx point and roll 1d12. It takes that much Necrotic damage and its hit point maximum drops by the same amount."],
 ["Curse of the Doomed", "After you miss a marked creature with a weapon attack, use your reaction and 1 jinx point to make one more weapon attack against it as part of the same action."],
 ["Curse of the Fearful", "As an action spend 2 jinx points. The marked creature is Frightened for 1 minute and is no longer marked. It makes a Wisdom save at the end of each of its turns to end it."],
 ["Curse of the Inept", "After a marked creature makes an ability check or attack roll, before the DM says if it succeeds, use your reaction and 1 jinx point to make it reroll and take the lower result."],
 ["Curse of the Insensate", "As an action spend 3 jinx points. The marked creature is Blinded and Deafened for 1 minute and is no longer marked. It makes a Constitution save at the end of each of its turns to end it."],
 ["Curse of the Maimed", "When you hit a marked creature with a weapon attack and the d20 shows 18 or 19, use your reaction and 2 jinx points to turn the hit into a critical hit."],
 ["Curse of the Marked", "As a bonus action spend 2 jinx points to extend your evil eye on its marked creature to 24 hours or until you mark another. While it lasts you know the direction and distance to the creature on the same plane."],
 ["Curse of the Plagued", "When a marked creature regains hit points, use your reaction and 1 jinx point to halve the amount. It cannot regain hit points until the start of your next turn."],
 ["Curse of the Ruined", "After a marked creature makes a saving throw, before the DM says if it succeeds, use your reaction and 2 jinx points to make it reroll and take the lower result."],
 ["Curse of the Somnolent", "As an action spend 3 jinx points. Roll a number of d10 equal to your rogue level and add 15. If the marked creature's current hit points are at or below the total, it falls unconscious for 10 minutes, or until it takes damage or another creature uses an action to rouse it."],
 ["Curse of the Unlucky", "As a bonus action spend 2 jinx points to put a pox on the marked creature. Whenever it makes an attack roll or saving throw, you roll 1d4 and subtract it from its total. It ends when the creature is no longer marked."],
]
def _mis(l, n, key, title):
    return {"l": l, "k": "opts", "n": n, "key": key, "feature": "Misfortunist", "title": title, "list": MISFORTUNES}

SUB = {
"Highway Rider": {"spab": "",
 "f": {
  "Hair Trigger": "When you roll initiative, you can use your reaction at once to do one of these: make one weapon attack with Advantage; move your speed, or your mount's, without provoking opportunity attacks; take the Dodge action; or interact with an object or use an item.",
  "Ride Them Down": "You can use Sneak Attack without Advantage if you or your mount moved at least 20 ft this turn and you have no Disadvantage on the attack. All other Sneak Attack rules apply.",
  "Trusty Mount": "You can cast find steed, and its creature type stays beast. Long Rest to use again.",
  "Horse Lord": "Spend 1 minute grooming your mount to give it temporary hit points equal to twice your rogue level. While you control a mount, it can use a bonus action to take Dash, Disengage or Dodge.",
  "True Grit": "You gain proficiency in Constitution saves. When a Constitution save would let you take half damage on a success, you instead take none on a success and half on a failure.",
  "Desperado": "When you drop to 0 hit points, use your reaction to take one of the Hair Trigger actions just before you fall unconscious."},
 "lu": [{"feature": "Trusty Mount", "lvl": 3, "max": 1, "reset": "long", "tag": "Find steed"}],
 "acts": {"Hair Trigger": "reaction", "Desperado": "reaction"},
 "fx": [[13, "True Grit", {"notes": [["Note", "True Grit: proficient in Constitution saves. Evasion-style on Constitution saves for half damage"]]}]]},

"Misfortune Bringer": {"spab": "CHA",
 "f": {
  "Evil Eye": "As a bonus action, choose a creature you see within 60 ft. It makes a Charisma save against your misfortune save DC or is marked by your evil eye for 1 minute or until you mark another. You can use Sneak Attack on a marked creature without Advantage, but not with Disadvantage.",
  "Misfortunes": "The misfortunes you can learn are listed under Misfortunist.",
  "Misfortunist": "You learn two misfortunes, and one more at levels 9, 13 and 17. After a Long Rest you can swap one. You have 3 jinx points, regained on a Short or Long Rest, and 2 more at level 13. Misfortune save DC = 8 + Proficiency Bonus + Charisma modifier.",
  "Steal Luck": "When a creature you see within 30 ft makes an ability check, attack roll or saving throw with Advantage, use your reaction to remove the Advantage. You regain one spent jinx point. Short or Long Rest to use again. At level 17 you can use it three times between rests.",
  "Additional Jinx Points": "You gain two more jinx points.",
  "Curse Caster": "As an action, spend 3 jinx points to cast bestow curse, with Charisma as the spellcasting ability.",
  "Steal Luck Improvement": "You can use Steal Luck three times, regaining all uses on a Short or Long Rest."},
 "pick": [_mis(3, 2, "mf3", "Misfortunes (2)"), _mis(9, 1, "mf9", "Misfortune (1 more)"), _mis(13, 1, "mf13", "Misfortune (1 more)"), _mis(17, 1, "mf17", "Misfortune (1 more)")],
 "lu": [{"feature": "Misfortunist", "n": "Jinx Points", "lvl": 3, "max": 3, "reset": "short", "tag": "Spend on misfortunes"},
        {"feature": "Steal Luck", "lvl": 9, "max": 1, "reset": "short", "tag": "Reaction, remove Advantage"}],
 "acts": {"Evil Eye": "bonus", "Steal Luck": "reaction", "Curse Caster": "action"}},

"Haunted": {"spab": "CHA",
 "f": {
  "Haunted Spells": "You learn extra spells as sorcerer spells that do not count against spells known. Level 1: unseen servant. Level 3: see invisibility. Level 5: speak with dead. Level 7: death ward. Level 9: little death. You can cast each with a slot or by spending sorcery points equal to its level.",
  "Phantom Companion": "You learn find familiar and can cast it as a ritual, without counting against spells known. The only form you can choose is a specter, which is your phantom companion, with creature type undead. As an action, command it to turn invisible until it attacks or you cast a spell through it. While invisible it leaves no trace except to magic, and its equipment stays visible. From level 3, when you take the Attack action you can give up one attack so your familiar makes its Life Drain attack with its reaction.",
  "Sixth Sense": "Add your Charisma modifier to your Dexterity checks for initiative.",
  "Deathly Pallor": "You have Resistance to Necrotic damage. When you cast a sorcerer spell that deals damage, you can change the type to Necrotic.",
  "Strength of Spirit": "Your specter's hit point maximum rises by four times your sorcerer level. It can deliver spells of any range, not just touch, following the normal rules for spells through a familiar. When you cast a spell with your action, you can use a bonus action to command your specter to use Life Drain on a creature within range of your choice.",
  "Phantom Possession": "As an action, direct your phantom companion to try to possess a creature of your choice within 5 ft of it. The creature makes a Charisma save against your spell save DC or is possessed for 1 minute. While it is, your phantom cannot be affected, act or interact. You have a telepathic link to the target within 100 ft and can order it with no action, and it does its best to obey. Once done, it defends itself and uses Dodge if it has not used its action. Each time it takes damage it repeats the save, ending the possession on a success and returning your phantom to the nearest open space. Short Rest to use again.",
  "Become Death": "When damage would drop you to 0 hit points, drop to 1 instead and gain temporary hit points equal to half your hit point maximum. At the start of each of your turns you lose 5 of them and creatures of your choice within 30 ft take 5 Necrotic damage. While you have any, you have Resistance to all damage, a fly speed of 30 ft, and can move through creatures and objects if you end in an open space. Long Rest to use again."},
 "lu": [{"feature": "Phantom Possession", "lvl": 14, "max": 1, "reset": "short", "tag": "Action, possess a creature"},
        {"feature": "Become Death", "lvl": 18, "max": 1, "reset": "long", "tag": "Drop to 1 HP, spectral form"}],
 "acts": {"Phantom Possession": "action"},
 "fx": [[6, "Deathly Pallor", {"res": ["Necrotic"]}]]},

"Wretched Bloodline": {"spab": "CHA",
 "f": {
  "Bad Luck Charm": "As a bonus action, choose a creature you see within 30 ft. It has Disadvantage on the next ability check, attack roll or saving throw it makes. Short or Long Rest to use again, or spend 1 sorcery point to use it again.",
  "Blood Ties": "You know detect evil and good and can cast it with no slot. It counts as a sorcerer spell and not against spells known. Short or Long Rest to use that again. Choose the type that cursed your ancestor: fey, fiend or undead. While you concentrate on detect evil and good, creatures of that type have Disadvantage on attacks against you and cannot Charm, Frighten or possess you.",
  "Wretched Curse": "Choose an inherited curse. Hulking: Disadvantage on Dexterity (Stealth) checks to move quietly. Your hit point maximum rises by 1 and by 1 again each sorcerer level. You count as one size larger for carrying, pushing, dragging and lifting. Nocturnal: Disadvantage on Wisdom (Perception) checks to see in sunlight. You have darkvision 120 ft and see through magical darkness within it. Plaguebearer: Disadvantage on Charisma (Persuasion) checks against humanoids that are not blinded. You are immune to disease and have Resistance to Necrotic damage.",
  "Share the Burden": "You learn bestow curse as a sorcerer spell that does not count against spells known. You can cast it by spending 3 sorcery points instead of a slot. If you do, its range is 60 ft and damage cannot break your concentration on it.",
  "Terrifying Visage": "As a bonus action, take the terrifying face of the being that cursed your ancestor for 10 minutes. On each of your turns you can use an action to make each creature that sees you within 30 ft make a Wisdom save against your sorcerer spell save DC or be Frightened until the end of your next turn. You also gain a benefit by your Blood Ties type. Fey: bonus action to teleport up to 30 ft. Fiend: Resistance to Cold and Fire damage. Undead: when you take non-Radiant damage, use your reaction to reduce it by half your sorcerer level. Long Rest to use again.",
  "Vengeful Summons": "Choose a servant of your curse by your Blood Ties type: lamia or troll (fey), barbed devil or incubus/succubus (fiend), ghost or wraith (undead). As an action, spend 5 sorcery points to summon it in an open space you see within 60 ft. It vanishes at 0 hit points, if you summon another, or after 10 minutes. It rolls initiative and takes its own turns. On each of your turns you can verbally command it with no action. With no command, it attacks any creature in reach."},
 "lu": [{"feature": "Bad Luck Charm", "lvl": 1, "max": 1, "reset": "short", "tag": "Bonus action, Disadvantage"},
        {"feature": "Blood Ties", "lvl": 1, "max": 1, "reset": "short", "tag": "Detect evil and good"},
        {"feature": "Terrifying Visage", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus action, 10 minutes"}],
 "acts": {"Bad Luck Charm": "bonus", "Terrifying Visage": "bonus", "Vengeful Summons": "action"}},

"The First Vampire": {"spab": "CHA",
 "f": {
  "Drain Life": "When you take the Attack action or cast a spell, use a bonus action to make a melee spell attack against a creature within 5 ft. It deals 1d6 + your Charisma modifier Necrotic damage on a hit. When you hit, you can spend a warlock spell slot to add 1d8 Necrotic damage plus 1d8 per slot level, and you regain hit points equal to the total damage dealt.",
  "Expanded Spell List": "These spells are added to your warlock list. Level 1: false life, bane. Level 2: alter self, levitate. Level 3: conjure animals (bat, rat or wolf only), gaseous form. Level 4: dominate beast, greater invisibility. Level 5: dominate person, seeming.",
  "Nocturnal Predator": "You have darkvision out to 60 ft. If you already have it, its range increases by 60 ft.",
  "Creature of the Night": "As an action, cast polymorph on yourself to become a bat or wolf, keeping your Intelligence, Wisdom and Charisma. Use it a number of times equal to your Charisma modifier, regained on a Long Rest.",
  "Eldritch Appetite": "When you reduce a creature to 0 hit points with Drain Life, use your reaction to regain one spent pact slot. Long Rest to use again.",
  "Eternal Night": "You no longer age and gain Resistance to Necrotic damage. Once per Long Rest, as a bonus action, for 1 minute you regain 1d6 hit points at the start of your turn if you have at least 1 hit point and are not in direct sunlight or running water. Radiant damage or holy water stops that at the start of your next turn. Your Drain Life can count as using a 1st-level slot."},
 "lu": [{"feature": "Creature of the Night", "lvl": 6, "max": "mod:CHA", "reset": "long", "tag": "Polymorph into bat or wolf"},
        {"feature": "Eldritch Appetite", "lvl": 10, "max": 1, "reset": "long", "tag": "Reaction, regain a pact slot"},
        {"feature": "Eternal Night", "lvl": 14, "max": 1, "reset": "long", "tag": "Bonus action, regeneration"}],
 "acts": {"Drain Life": "bonus", "Creature of the Night": "action", "Eldritch Appetite": "reaction", "Eternal Night": "bonus"},
 "fx": [[14, "Eternal Night", {"res": ["Necrotic"]}]]},

"The Parasite": {"spab": "CHA",
 "f": {
  "Physical Specimen": "After a Long Rest, choose benefits up to your Charisma modifier (minimum 1) that last until your next Long Rest. Your hit point maximum rises by 1 per warlock level. You gain darkvision 60 ft, or +30 ft if you have it. Each speed rises by 5 ft. You have Advantage on saves against disease and poison. Your jumps triple and you gain a climb speed equal to your walking speed. You can use your reaction to add your Charisma modifier to a Strength (Athletics) or Dexterity (Acrobatics) check.",
  "Spell Siphon": "When a creature you see within 60 ft casts a spell of a level you can cast with pact slots, use your reaction to force a Charisma save against your warlock spell save DC. On a failure the spell works as normal and you siphon it. While siphoned it cannot cast it again, and you can cast it as a warlock spell with a pact slot. Once you cast it, it is no longer siphoned. You can hold up to 1 + your Charisma modifier (minimum 1) siphoned spells. Going over drops one of your choice. They are lost if you fall unconscious or die.",
  "Symbiotic Sentinel": "You cannot be surprised and have Advantage on Dexterity checks for initiative. You have Advantage on saves against Charmed and Frightened.",
  "Spawn Pawn": "You learn dominate person as a warlock spell that does not count against spells known, and can cast it once with no slot, regained on a Long Rest. If the creature succeeds on its save to end it, it takes Psychic damage equal to your warlock level. Damage cannot break your concentration on it.",
  "Larval Regeneration": "When you die, a Tiny larval parasite bursts from your corpse on your initiative the next turn. You control it for 24 hours. It has AC 14, half your hit point maximum, speed 30 ft, uses your other statistics, and cannot cast. As an action, a creature within 5 ft makes a Strength or Dexterity save (your choice) against your warlock spell save DC. On a failure the parasite burrows in and deals Piercing damage equal to your warlock level. Inside, it cannot act or be targeted and is immune to all but Psychic damage. On each of the host's turns it uses its action for a Constitution save against the DC. On a success the parasite is ejected into an open space within 5 ft. If it is still inside at the end of the host's turn, the host takes Necrotic damage equal to twice your warlock level. If that drops the host to 0 hit points, it dies and you take over its body as with reincarnate, using the host's race. If you are returned to life, the parasite vanishes. Long Rest to use again."},
 "lu": [{"feature": "Spawn Pawn", "lvl": 10, "max": 1, "reset": "long", "tag": "Dominate person, no slot"},
        {"feature": "Larval Regeneration", "lvl": 14, "max": 1, "reset": "long", "tag": "On death, larval parasite"}],
 "acts": {"Spell Siphon": "reaction"}},

"Plague Doctor": {"spab": "INT",
 "f": {
  "Good Medicine": "When you craft a concoction you can spend a spell slot without choosing a spell to make good medicine. When a creature drinks it, roll 1d8 per level of the slot and it regains that many hit points. With a slot of 3rd level or higher, it also ends all diseases on the creature.",
  "Potion Craft": "You gain proficiency in Medicine, alchemist's supplies and herbalism kits. With either kit and 10 minutes you can make any number of concoctions, spending a spell slot for each. For each, choose a spell from your spellbook that targets one creature and is of the slot's level or lower. When a creature drinks it, it is targeted as if you cast the spell, and concentrates on it if needed. Concoctions lose their effect at the end of your next Long Rest.",
  "Bad Medicine": "When you craft a concoction you can spend a spell slot without choosing a spell to make bad medicine, choosing one effect per slot level: the creature is Poisoned; its speeds are halved; it takes an extra 1d4 Necrotic damage the first time it takes damage each turn; it takes 1d6 Poison damage each time it takes an action, bonus action or reaction; it takes Acid damage equal to the slot level at the start of each of its turns. As an action, hurl a dose at a point you see within 30 ft. Creatures within 10 ft make a Constitution save against your wizard spell save DC, or suffer all chosen effects for 1 minute. An affected creature can use an action to save again and end effects early.",
  "Breathe It In": "After you take Necrotic or Poison damage, you gain temporary hit points equal to the damage. You are immune to disease and have Advantage on saves against being Poisoned.",
  "Medicinal Master": "When you heal with Good Medicine or deal damage with Bad Medicine, roll an extra 2d8 for the hit points regained or Necrotic damage dealt."},
 "lu": [], "acts": {"Bad Medicine": "action"}},

"School of Sangromancy": {"spab": "INT",
 "f": {
  "Full-Blooded": "You have a pool of d12s equal to 1 + your wizard level that you can spend in place of a Hit Die when you cast sangromancy spells. A Long Rest restores all dice.",
  "Sangromancy Savant": "All sangromancy spells are added to your wizard list. Copying a sangromancy spell into your spellbook costs half the gold and time.",
  "Sanguine Vigor": "Your hit point maximum rises by 6, and by 1 more each wizard level. When you cast a sangromancy spell, you regain hit points equal to its level.",
  "Blood for Blood": "When you deal damage with a spell, you can spend and roll a Hit Die, or a d12 from Full-Blooded, and add it to the damage.",
  "Red Renewal": "After a Short Rest, choose expended Hit Dice equal to half your wizard level and regain them. You regain the same number of Full-Blooded dice. Long Rest to use again."},
 "lu": [{"feature": "Full-Blooded", "n": "Full-Blooded dice", "lvl": 2, "max": [l+1 for l in range(1,21)], "reset": "long", "tag": "d12 in place of Hit Dice"},
        {"feature": "Red Renewal", "lvl": 14, "max": 1, "reset": "long", "tag": "Regain Hit Dice"}],
 "acts": {}},
}
