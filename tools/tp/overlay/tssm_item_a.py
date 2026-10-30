# Own-wording magic items of the Summoner (2024). Row shape as tghp_item.py.
ITEMS = []; SP = {}; WPN = {}; GEAR = []; MASTERY = {}; WDESC = {}
def add(name, typ, rar, att, text, **o):
    ITEMS.append((name, typ, rar, att, text, o))

add("Amulet of the Spirit Caller", "Wondrous Item", "Very Rare", 1,
    "Requires attunement by a spellcaster. The amulet has 5 charges and regains 1d4 + 1 expended charges at dawn. When you cast a summoning spell while wearing it, you can spend charges to boost the summoned creature. Each charge buys one benefit from this list, and you cannot pick the same benefit twice. **Extra Health.** The creature appears with 20 extra Hit Points. **Extra Damage.** It adds 1d4 to each of its damage rolls. **Tougher Hide.** It gains a +2 bonus to AC. Only a spell that needs Concentration and summons a single creature can be boosted this way.",
    by="a spellcaster", ch=[5, "1d4+1", "dawn"])
add("Bands of Synergy", "Ring", "Rare", 1,
    "Requires attunement by a Summoner. The rings come as a pair. A Summoner wears one and their Eidolon wears the other. While both are worn, the bond between you is stronger. Once per turn, when your Eidolon uses an action that costs Action Points while within 30 ft of you, it can lower the AP cost by 1.",
    by="a Summoner")
add("Bondmantle", "Wondrous Item", "Rare", 1,
    "Requires attunement by a Summoner. While you wear the mantle, you can take a Magic action to borrow one trait of your Eidolon. Choose one of its skill proficiencies, one of its Speeds, one of its Resistances or Immunities, or one of its senses. You keep the trait until you use the action again.",
    by="a Summoner")
add("Sphere of the Arcane Armament", "Wondrous Item", "Uncommon", 1,
    "Requires attunement by a Summoner's Eidolon. This smooth metal lump is soft and easy to shape, yet it slowly settles back into a perfect sphere when left alone. To attune to it, the Eidolon or its Summoner must be holding a magic weapon. Once attuned, that weapon vanishes and the sphere reshapes into a weapon that suits the Eidolon's attacks. Claws give a clawed gauntlet, and a held weapon gives a copy of that weapon. The Eidolon's Conjured Strike gains the magical properties of the absorbed weapon. If that weapon needed attunement, the Eidolon counts as attuned to it without using up one of its attunement slots, and it must still meet any prerequisites. For example, with a Flame Tongue the Eidolon could set its weapon ablaze and deal the extra damage with Conjured Strike. When the attunement ends, the weapon and the sphere reappear within 5 ft of the Eidolon.",
    by="a Summoner's Eidolon")
for _n, _r, _b in (("+1", "Uncommon", 1), ("+2", "Rare", 2), ("+3", "Very Rare", 3)):
    add(_n + " Soulbind Chains", "Wondrous Item", _r, 1,
        "Requires attunement by a Summoner. Wear these fine chains as a necklace or bracelet. They glow faintly while your Eidolon is near. While wearing them, you can use them as a Spellcasting Focus for your spells. You gain a +%d bonus to spell attack rolls and to the saving throw DCs of your Summoner spells. When you give up your action or Bonus Action to grant your Eidolon Action Points, you can raise the Action Points it gains by 2 if it is within 30 ft of you. Once you use this, you cannot use it again until the next dawn." % _b,
        by="a Summoner")
for _r in ("Rare", "Very Rare", "Legendary"):
    add("Evolution Stone (%s)" % _r, "Wondrous Item", _r, 0,
        "If a Summoner's Eidolon holds this stone for 24 hours, it permanently gains one Evolution, even if it does not meet the prerequisites. If it already knows that Evolution, it can instead swap it at once for another Evolution whose prerequisites it meets. The stone then becomes a mundane crystal worth 1d4 x 100 gp.")
