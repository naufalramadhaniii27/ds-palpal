#!/usr/bin/env python3
"""Writes tests/golden/builds/fx_M1_*.json (engine wave 2, fx engine v5). Numbers come from the rule text quoted in each why.
Run once from the repo root: python3 tools/gen_fx_M1_goldens.py"""
import json, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tests', 'golden', 'builds')
SRC = ['dmg', 'misc14', 'tvss', 'tghp', 'tshl', 'tsgs', 'tsdm', 'tsae', 'tsgeh', 'tssm', 'tsdd', 'tee24', 'tghg', 'toa', 'tftyp', 'tkdm', 'thhw']

def build(items=(), cls='Fighter', sub='', lv=5, base=None, ch=None, species='Human', eqC='A', extra=None):
    b = dict(STR=15, DEX=14, CON=13, INT=12, WIS=16, CHA=8)
    b.update(base or {})
    d = {'name': 'Golden', 'species': species, 'bg': 'Soldier', 'bgMode': '21', 'bg2': 'STR', 'bg1': 'CON',
         'cls': cls, 'sub': sub, 'level': lv, 'base': dict(b), 'ch': ch or {},
         'src': dict({'core': True}, **{k: True for k in SRC}), 'method': 'array', 'arr': dict(b), 'hb': False,
         'armor': '', 'shield': False, 'weps': [], 'eqC': eqC, 'eqB': 'B', 'size': 'Medium',
         'inv': [({'n': n, 'q': 1, 'eq': True} if isinstance(n, str) else n) for n in items]}
    d.update(extra or {})
    return d

def eq(path, v): return {'path': path, 'eq': v}
def inn(path, t): return {'path': path, 'in': t}

G = []
def g(name, why, items, expect=None, expectC=None, fxT=None, **kw):
    d = {'why': why, 'build': build(items, **kw), 'expect': expect or {}, 'expectC': expectC or []}
    if fxT: d['fxT'] = fxT
    G.append((name, d))

# Base: Soldier background +2 STR +1 CON. STR 15 -> 17 (+3), CON 13 -> 14 (+2), DEX 14 (+2), INT 12 (+1), WIS 16 (+3). Level 5: PB +3.
g('gurt_greataxe', "Gurt's Greataxe: +1 to attack and damage, 'deals 3d12 slashing damage on a hit, plus an extra 2d12 slashing damage if the target is human'. The row shows 3d12 instead of the Greataxe 1d12.",
  ["Gurt's Greataxe"], expectC=[eq("attacks.Gurt's Greataxe.die", '3d12'), eq("attacks.Gurt's Greataxe.type", 'Slashing'), eq("attacks.Gurt's Greataxe.misc", 1), eq("attacks.Gurt's Greataxe.dmgBonus", 1), inn("attacks.Gurt's Greataxe.xdice", '2d12')])
g('frozen_dagger_cold', "Frozen Dagger: its damage type is Cold instead of Piercing. The Dagger die stays 1d4.",
  ['Frozen Dagger'], expectC=[eq('attacks.Frozen Dagger.type', 'Cold'), eq('attacks.Frozen Dagger.die', '1d4')])
g('ranseur_2d10', "Ranseur of Torture: 'deals 2d10 piercing damage instead of its regular damage', +3 to attack and damage. The Pike die 1d10 becomes 2d10, the type stays Piercing.",
  ['Ranseur of Torture'], expectC=[eq('attacks.Ranseur of Torture.die', '2d10'), eq('attacks.Ranseur of Torture.type', 'Piercing'), eq('attacks.Ranseur of Torture.misc', 3)])
g('scourge_3d4', "Scourge of Shadow: 3d4 slashing damage instead of the whip's regular damage, +3 to attack and damage.",
  ['Scourge of Shadow'], expectC=[eq('attacks.Scourge of Shadow.die', '3d4'), eq('attacks.Scourge of Shadow.type', 'Slashing'), eq('attacks.Scourge of Shadow.misc', 3)])
g('sun_blade_finesse', "Sun Blade: Radiant damage instead of Slashing, and Finesse. DEX 18 (+4) beats STR 12 (+1), so the attack uses Dexterity.",
  ['Sun Blade'], expectC=[eq('attacks.Sun Blade.type', 'Radiant'), eq('attacks.Sun Blade.ab', 'DEX'), inn('attacks.Sun Blade.sub', 'Finesse')], base={'STR': 10, 'DEX': 18})
g('oversized_longbow_2d6', "Oversized Longbow: its arrows deal piercing damage equal to 2d6 + Strength modifier. The Longbow die 1d8 becomes 2d6.",
  ['Oversized Longbow'], expectC=[eq('attacks.Oversized Longbow.die', '2d6')])
g('contractor_2d4', "The Firm: Contractor, Backstabber: a Simple weapon that deals 1d4 deals 2d4. The Dagger (Simple, 1d4) shows 2d4, the Whip (Martial, 1d4) stays 1d4.",
  ['Dagger', 'Whip'], expectC=[eq('attacks.Dagger.die', '2d4'), eq('attacks.Whip.die', '1d4')], ch={'feat4': {'feat': 'The Firm: Contractor'}})
g('golem_arms_reach', "Golem Arms: reach is 5 ft greater on melee weapon attacks and Unarmed Strikes. A Greataxe at 5 ft shows 10 ft, so does the Unarmed Strike.",
  ['Greataxe', 'Golem Arms'], expectC=[eq('attacks.Greataxe.range', '10 ft'), eq('attacks.Unarmed Strike.range', '10 ft')], eqC='none')
g('bugbear_long_limbed', "Bugbear (2014), Long-Limbed: reach is 5 ft greater on your own melee attacks. A Greatsword at 5 ft shows 10 ft.",
  ['Greatsword'], expectC=[eq('attacks.Greatsword.range', '10 ft')], species='Bugbear (2014)', eqC='none')
g('wooden_chain_cap', "Wooden Chain of the Unbroken Circle: AC bonus equal to the Wisdom modifier, maximum +2. Druid WIS 20 (+5) adds +2. Chain Shirt 13 + Dex 2 (max 2) + 2 = 17.",
  ['Wooden Chain of the Unbroken Circle'], {'D:ac': 17}, [inn('ac.bonus', 'Wooden Chain')], cls='Druid', sub='Circle of the Land', base={'WIS': 20}, eqC='none')
g('wooden_chain_low', "Wooden Chain of the Unbroken Circle with WIS 12 (+1): the bonus is +1 (below the cap). 13 + 2 + 1 = 16.",
  ['Wooden Chain of the Unbroken Circle'], {'D:ac': 16}, cls='Druid', sub='Circle of the Land', base={'WIS': 12}, eqC='none')
g('manikin_sentinel_str', "Manikin, Integrated Gold Plating (Sentinel): base AC 13 + Dexterity (max +2) or Strength (max +3). STR 18 + 2 = 20 (+5) is capped at +3, so AC 16 (Dex path 15).",
  [], {'D:ac': 16}, cls='Fighter', species='Manikin', base={'STR': 18}, ch={'lin': 'Sentinel'}, eqC='none')
g('marauder_con_ac', "Jaeger, Marauder Chapter, Unbreakable: in Medium armor add the Constitution modifier (maximum +2) to AC instead of Dexterity. Breastplate 14 + CON 17 (+3, capped 2) = 16 with DEX 10 (+0).",
  ['Breastplate'], {'D:ac': 16}, cls='Jaeger', sub='Marauder Chapter', lv=3, base={'DEX': 10, 'CON': 16}, eqC='none')
g('logic_unit_halfpb', "Logic Unit: half your Proficiency Bonus (round down) on Intelligence checks with a skill you lack. PB 3 gives +1 to Arcana (not proficient) and nothing to Athletics (INT is not used).",
  ['Logic Unit'], expectC=[eq('skills.Arcana.misc', 1)], eqC='none')
g('aven_kefnet', "Aven (Ibis-Headed), Kefnet's Blessing: half Proficiency Bonus, rounded down, on Intelligence checks that do not include it. PB 3: Arcana +1.",
  [], expectC=[eq('skills.Arcana.misc', 1)], species='Aven (Ibis-Headed)', eqC='none')
g('champion_2014_athlete', "Champion (2014) level 7, Remarkable Athlete: half PB rounded up (PB 3, so 2) to Strength, Dexterity and Constitution checks without proficiency. Acrobatics (DEX) +2, Athletics (proficient from Soldier) none.",
  [], expectC=[eq('skills.Acrobatics.misc', 2)], sub='Champion (2014)', lv=7, eqC='none')
g('vermin_lord_con_save', "Ranger, Vermin Lord level 7: proficiency in Constitution saving throws. CON 14 (+2) + PB 3 = +5.",
  [], {'D:save.CON': 5}, [inn('saves.CON', 'Filth and Fortitude')], cls='Ranger', sub='Vermin Lord', lv=7, eqC='none')
g('highway_rider_con_save', "Rogue, Highway Rider level 13, True Grit: proficiency in Constitution saves. CON 14 (+2) + PB 5 = +7.",
  [], {'D:save.CON': 7}, [inn('saves.CON', 'True Grit')], cls='Rogue', sub='Highway Rider', lv=13, eqC='none')
g('battlemind_saves', "Barbarian, Path of the Battlemind level 10, Unbreakable Mind: proficiency in Intelligence and Wisdom saves. PB 4: INT 1 + 4 = 5, WIS 3 + 4 = 7.",
  [], {'D:save.INT': 5, 'D:save.WIS': 7}, cls='Barbarian', sub='Path of the Battlemind', lv=10, eqC='none')
g('spiked_shield_bash', "Spiked Shield, Shield Bash: apply PB and Strength; on a hit it deals 2d6 + Strength piercing damage. A granted row with 2d6 Piercing, Strength, proficient.",
  ['Spiked Shield'], expectC=[eq('attacks.Shield Bash (Spiked Shield).die', '2d6'), eq('attacks.Shield Bash (Spiked Shield).type', 'Piercing'), eq('attacks.Shield Bash (Spiked Shield).ab', 'STR'), eq('attacks.Shield Bash (Spiked Shield).prof', True)], eqC='none')
g('storm_sickle_wind_blade', "Storm Sickle: Wind Blade, range 20/60 ft, Strength, 1d4 slashing, proficient, plus 1d4 lightning like the sickle.",
  ['Storm Sickle'], expectC=[eq('attacks.Wind Blade (Storm Sickle).die', '1d4'), eq('attacks.Wind Blade (Storm Sickle).range', '20/60 ft'), inn('attacks.Wind Blade (Storm Sickle).xdice', 'Lightning')], eqC='none')
g('boomerang_shield_throw', "Boomerang Shield: ranged weapon attack, 20/60 ft, Strength or Dexterity, 1d6 slashing, proficient with it when proficient with shields (Fighter).",
  ['Boomerang Shield'], expectC=[eq('attacks.Boomerang Shield (thrown).die', '1d6'), eq('attacks.Boomerang Shield (thrown).range', '20/60 ft'), eq('attacks.Boomerang Shield (thrown).prof', True)], eqC='none')
g('starmetal_shooting_star', "Starmetal Shield, Shooting Star: ranged attack, proficient, Strength or Dexterity, 2d8 slashing.",
  ['Starmetal Shield'], expectC=[eq('attacks.Shooting Star (Starmetal Shield).die', '2d8'), eq('attacks.Shooting Star (Starmetal Shield).type', 'Slashing')], eqC='none')
g('staff_adder_snake', "Staff of the Adder: the snake head attack adds PB and Wisdom, 1d6 piercing plus 3d6 poison.",
  ['Staff of the Adder'], expectC=[eq('attacks.Snake Head (Staff of the Adder).ab', 'WIS'), eq('attacks.Snake Head (Staff of the Adder).die', '1d6'), inn('attacks.Snake Head (Staff of the Adder).xdice', '3d6')], cls='Cleric', sub='Life Domain', eqC='none')
g('umber_hulk_claw', "Claws of the Umber Hulk: a claw is a melee weapon, you are proficient, 1d8 slashing, Strength.",
  ['Claws of the Umber Hulk'], expectC=[eq('attacks.Claw (Claws of the Umber Hulk).die', '1d8'), eq('attacks.Claw (Claws of the Umber Hulk).prof', True)], eqC='none')
g('ioun_mastery_dmg', "Ioun Stone (mastery): your Proficiency Bonus increases by 1. Fighter 5: PB 3 becomes 4, Strength save 3 + 4 = 7 (Fighter saves Strength and Constitution), CON save 2 + 4 = 6.",
  ['Ioun Stone (mastery)'], {'D:pb': 4, 'D:save.STR': 7, 'D:save.CON': 6}, [eq('pbAdd', 1)], eqC='none')
g('ioun_mastery_2014', "Ioun Stone, Mastery (2014): your proficiency bonus increases by 1 while the stone orbits your head. PB 4.",
  ['Ioun Stone, Mastery'], {'D:pb': 4}, [eq('pbAdd', 1)], eqC='none')
g('boon_high_magic', "Boon of High Magic: one 9th-level spell slot as long as you already have one. Wizard 17 has 1 ninth-level slot, so 2.",
  ['Boon of High Magic'], {'C:spellcasting.slots.8': 2, 'C:spellcasting.slots.7': 1}, cls='Wizard', sub='Evoker', lv=17, eqC='none')
g('universalist_slot', "Universalist, Arcane Excellence: one extra slot at your highest available slot level (maximum 7). Wizard 5: 4/3/2, so the 3rd level count is 3.",
  [], {'C:spellcasting.slots.2': 3, 'C:spellcasting.slots.1': 3}, cls='Wizard', sub='Universalist', lv=5, eqC='none')
g('broken_vow_exhaustion', "Broken Vow: you gain 3 levels of Exhaustion that cannot be removed until the curse ends. The sheet starts at Exhaustion 3 (the stepper and long rest stop there).",
  ['Broken Vow'], {'D:exh': 3, 'D:exhMin': 3}, [eq('exhMin', 3)], eqC='none')
g('finger_picks_expertise', "Finger Picks: proficiency with Thieves' Tools, and double Proficiency Bonus if you already had it. Rogue has Thieves' Tools, PB 3, so Expertise +6.",
  ['Finger Picks'], expectC=[eq("toolExp.Thieves' Tools.v", 6)], cls='Rogue', sub='Thief', eqC='none')
g('finger_picks_new', "Finger Picks on a Fighter: proficiency with Thieves' Tools only, no Expertise.",
  ['Finger Picks'], expectC=[inn('profs.tools', "Thieves' Tools")], eqC='none')
g('runetagger_expertise', "Rogue, Runetagger level 3, Impressionist: Expertise with Calligrapher's Supplies and Painter's Supplies. PB 2: +4 each.",
  [], expectC=[eq("toolExp.Calligrapher's Supplies.v", 4), eq("toolExp.Painter's Supplies.v", 4)], cls='Rogue', sub='Runetagger', lv=3, eqC='none')

g('field_medic_wisdom', "Field Medic: 'Wisdom is your spellcasting ability for it'. A Fighter with no spellcasting class must show Wisdom (not the default Charisma) as the casting ability.",
  [], expectC=[eq('spellcasting.ab', 'WIS')], ch={'feat4': {'feat': 'Field Medic'}}, eqC='none')

for name, d in G:
    json.dump(d, open(os.path.join(OUT, 'fx_M1_' + name + '.json'), 'w'), indent=1)
print(len(G), 'fixtures')
