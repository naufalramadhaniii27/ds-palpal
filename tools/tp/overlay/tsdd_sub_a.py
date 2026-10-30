# Own-wording Ranger subclass of Dr Dhrolin's Dictionary of Dinosaurs (2024). Shape of tvss_sub_wizard.py.
SPECIAL = [0] * 6 + [3, 3, 4, 4, 8, 8, 10, 10, 10, 10, 12, 12, 12, 12]
SUB = {
"Big Game Hunter": {"spab": "",
 "f": {
  "Ranged Specialist": "You have training with all ranged weapons, including thrown weapons and firearms. Having an enemy within 5 ft of you does not give you Disadvantage on ranged attacks.",
  "Game Hunter": "After each Long Rest, pick a size category from Large, Huge or Gargantuan. Until your next Long Rest, your Ranged Attack Rolls against creatures of that size deal an extra 1d8 Piercing damage. Against creatures of the other two categories they deal an extra 1d4 Piercing damage. You can add this extra damage up to twice per turn.",
  "Bolas": "At the end of each Long Rest you make a number of bolas projectiles equal to your Wisdom modifier. A bolas deals the same damage as normal ammunition from your weapon, or no damage if you choose. When a ranged attack using a bolas hits, the bolas wrap around the creature. It makes a Strength or Dexterity save (its choice) or becomes Grappled. The save DC is 8 + your Wisdom modifier + your Proficiency Bonus. Bolas left when you finish a Long Rest, before you make new ones, break and become mundane ammunition for one of your weapons.",
  "Special Shots": "Before you roll a Ranged Attack Roll, you can apply one of these effects. Drill Shot. A sudden twist of the weapon makes the projectile spin through tough hides. The attack roll gets an extra +5 bonus. Trick Shot. You aim to ricochet the shot off one or more surfaces. Pick an unoccupied point you see within 60 ft. For this attack, treat your position as that point for line of sight and range. Power Shot. The weapon damage roll counts as the highest possible roll. Roll any extra damage normally, such as from Game Hunter or Hunter's Mark, but extra dice from a Critical Hit also count as maximum. You can use Power Shot a number of times equal to your Proficiency Bonus per Long Rest.",
  "Improved Bolas": "You now make a number of bolas equal to your Wisdom modifier + your Dexterity modifier. Double your Proficiency Bonus when you work out the Grapple save DC of your Bolas.",
  "Reliable Aim": "If you miss with an attack roll using a ranged weapon on your turn, you can reroll it. Once per turn. Uses equal your Dexterity modifier (minimum 1) per Long Rest.",
  "Improved Special Shots": "You can use Special Shots a number of times equal to twice your Proficiency Bonus instead of your Proficiency Bonus.",
  "Apex Hunter": "Your Hunter's Mark lasts 48 hours. While it is active on a living enemy creature, you do not need sleep and are immune to the effects of Malnutrition and Dehydration.",
  "Predator's Intuition": "When you hit a Large, Huge or Gargantuan creature with your Bolas or a Special Shot, you immediately learn how many Hit Points it has left.",
  "Finish the Hunt": "Action: pick a Large, Huge or Gargantuan creature you see within 60 ft that is not obscured. You make one ranged attack against it that hits automatically if you say a quip or one-liner, such as \"This one's mine!\" Signing or other nonverbal speech counts. If you give no quip, the attack misses. A creature hit by this attack dies if it has 100 Hit Points or fewer. Otherwise it takes 10d10 + 30 Piercing damage. Long Rest to use again."},
 "lu": [{"feature": "Bolas", "lvl": 3, "max": {"f": "mod:WIS", "min": 1}, "reset": "long", "tag": "Made after a Long Rest"},
        {"feature": "Special Shots", "n": "Special Shots: Power Shot", "lvl": 7, "max": SPECIAL, "reset": "long", "tag": "Proficiency Bonus, doubled from level 11"},
        {"feature": "Reliable Aim", "lvl": 11, "max": {"f": "mod:DEX", "min": 1}, "reset": "long", "tag": "Reroll a missed ranged attack"},
        {"feature": "Finish the Hunt", "lvl": 15, "max": 1, "reset": "long", "tag": "Action"}],
 "acts": {"Finish the Hunt": "action"},
 "fx": [[3, "Ranged Specialist", {"notes": [["Note", "Ranged Specialist: training with all ranged weapons including thrown weapons and firearms. No Disadvantage on ranged attacks against a creature within 5 ft"]]}]]},
}
