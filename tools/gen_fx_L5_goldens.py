#!/usr/bin/env python3
"""Writes tests/golden/builds/fx_L5_*.json (ledger fixes L5, magic items). Numbers come from the item text quoted in each why.
Run once from the repo root: python3 tools/gen_fx_L5_goldens.py"""
import json, os
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tests', 'golden', 'builds')
ABIL = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']

def build(items, cls='Cleric', sub='Life Domain', lv=10, base=None, ch=None, species='Human', armor='', shield=False, bg='Soldier'):
    b = dict(STR=15, DEX=14, CON=13, INT=12, WIS=16, CHA=8)
    b.update(base or {})
    return {'name': 'Golden', 'species': species, 'bg': bg, 'bgMode': '21', 'bg2': 'STR', 'bg1': 'CON',
            'cls': cls, 'sub': sub, 'level': lv, 'base': dict(b), 'ch': ch or {},
            'src': {'core': True, 'dmg': True, 'misc14': True}, 'method': 'array', 'arr': dict(b), 'hb': False,
            'armor': '', 'shield': False, 'weps': [], 'eqC': 'A', 'eqB': 'B', 'size': 'Medium',
            'inv': [{'n': n, 'q': 1, 'eq': True} for n in items]}

def has(path, **kw): return {'path': path, 'has': kw}
def inn(path, t): return {'path': path, 'in': t}
def eq(path, v): return {'path': path, 'eq': v}

G = []
def g(name, why, items, expect=None, expectC=None, fxT=None, **kw):
    expect = dict(expect or {})
    keep = []
    for c in (expectC or []):
        if 'eq' in c and any(x.isdigit() for x in c['path'].split('.')):
            expect['C:' + c['path']] = c['eq']
        else:
            keep.append(c)
    d = {'why': why, 'build': build(items, **kw), 'expect': expect, 'expectC': keep}
    if fxT: d['fxT'] = fxT
    G.append((name, d))

g('necronomicon', 'Necronomicon: after the reading Intelligence rises by 2 (maximum 24) and Wisdom falls by 2 (minimum 3), you speak Void Speech. INT 12 to 14 (+2), WIS 16 to 14 (+2).',
  ['Necronomicon'], {'D:mod.INT': 2, 'D:mod.WIS': 2}, [inn('lang', 'Void Speech')])
g('corvis', 'Necronomicon Ex Corvis: Intelligence rises by 2 (no stated cap) and Wisdom drops by 1. Wizard INT 12 to 14 (+2), WIS 16 to 15 (+2).',
  ['Necronomicon Ex Corvis'], {'D:mod.INT': 2, 'D:mod.WIS': 2}, [], cls='Wizard', sub='Evoker')
g('nether_scroll_cap', 'Nether Scroll of Azumar: Intelligence +2 to a maximum of 22, advantage on saves against spells and other magical effects. INT 21 gains only 1.',
  ['Nether Scroll of Azumar'], {'D:mod.INT': 6}, [has('abilities.INT.bonus', v=1), inn('saveNotes', 'against spells and other magical effects')], base={'INT': 21})
g('orb_of_the_veil', 'Orb of the Veil: Wisdom +2 and the maximum rises by 2 (22), darkvision 60 ft. WIS 21 reaches 22.',
  ['Orb of the Veil'], {'D:mod.WIS': 6}, [has('abilities.WIS.bonus', v=1), eq('darkvision', 60)], base={'WIS': 21})
g('netherese_ring', 'Netherese Ring of Protection: +1 to AC and saving throws (the +4 is only for not dropping or losing a held item). AC 10+2+1 = 13, saves +1.',
  ['Netherese Ring of Protection'], {'ac': 13}, [eq('saveBonus.0.v', 1)])
g('nightbringer_on', 'Nightbringer, evil alignment: immune to Charmed and Frightened, one chosen damage type (Fire here), darkvision 60 ft.',
  ['Nightbringer'], {}, [has('defenses', t='Immunity', v='Fire'), has('defenses', t='Immunity', v='Charmed (condition)'), eq('darkvision', 60)],
  fxT={'nightbringer-evil': True}, ch={'gx-imm-item-Nightbringer': ['Fire']})
g('nightbringer_off', 'Nightbringer, not evil: none of the evil-only benefits (switch off).',
  ['Nightbringer'], {}, [eq('darkvision', 0), eq('fxToggles.0.on', False)], fxT={'nightbringer-evil': False}, ch={'gx-imm-item-Nightbringer': ['Fire']})
g('nimbus_off', 'Nimbus Coronet: fly 60 ft and the resistances only in cloud form; no damage from falling always.',
  ['Nimbus Coronet'], {}, [eq('moves', None), inn('defenses', 'no damage from falling')], fxT={'nimbus-cloud': False})
g('nimbus_on', 'Nimbus Coronet in cloud form: Fly Speed 60 ft, resistance to bludgeoning, piercing and slashing.',
  ['Nimbus Coronet'], {}, [has('moves', m='fly', v=60), has('defenses', t='Resistance', v='Bludgeoning')], fxT={'nimbus-cloud': True})
g('gifts_uses', 'Piety gifts: uses equal to the ability modifier (minimum 1) per long rest. WIS 16 = 3 (Nylea), CHA 14 = 2 (Phenax), INT 16 = 3 (Purphoros).',
  ["Nylea's Devotee", "Phenax's Devotee", "Purphoros's Devotee", "Pharika's Disciple"], {},
  [eq("res.Hunter's Mark (Nylea's Devotee).max", 3), eq("res.Disguise Self (Phenax's Devotee).max", 2), eq("res.Shield of Faith (Purphoros's Devotee).max", 3), eq("res.Pharika's Disciple: heal or weaken.max", 3)],
  base={'CHA': 14, 'INT': 16})
g('gifts_notes', 'Gifts: Votary advantage against Poisoned and immunity to disease (Pharika), advantage against being knocked prone (Purphoros), Papazotl cannot be surprised and has advantage on Wisdom checks.',
  ["Nylea's Votary", "Pharika's Votary", "Purphoros's Votary", 'Papazotl'], {},
  [inn('saveNotes', 'against the Poisoned condition'), inn('saveNotes', 'knocked prone'), has('defenses', t='Immunity', v='Disease'), inn('defenses', 'Cannot be surprised'), inn('defenses', 'Advantage on Wisdom checks')])
g('orb_skoraeus', 'Orb of Skoraeus: +2 to Constitution saves to keep concentration, sees in darkness to 120 ft.',
  ['Orb of Skoraeus'], {}, [eq('darkvision', 120), inn('saveNotes', 'maintain concentration')])
g('pigskin', 'Pigskin Armor counts as light armor: 12 + full Dexterity (Studded Leather profile). DEX 18 = +4, AC 16 (the Hide Armor cap would give 14).',
  ['Pigskin Armor'], {'ac': 16}, [], base={'DEX': 18}, armor='Pigskin Armor')
g('second_skin', 'Second Skin: AC is 14 + Dexterity modifier. DEX 18 = AC 18 (the old row gave 12 + 2 + 2).',
  ['Second Skin'], {'ac': 18}, [], base={'DEX': 18}, armor='Second Skin')
g('serpent_scale', 'Serpent Scale Armor: full Dexterity instead of a maximum of +2. Scale Mail 14 + DEX 18 (+4) = 18.',
  ['Serpent Scale Armor'], {'ac': 18}, [], base={'DEX': 18}, armor='Serpent Scale Armor')
g('pariah_shield', 'Pariah\'s Shield: +1 AC per two allies within 5 ft (maximum +3) on top of the Shield (+2). 4 allies: 10 + 2 + 2 + 2 = 16.',
  ["Pariah's Shield"], {'ac': 16}, [], ch={"gx-al-item-Pariah's Shield": ['4 or 5 allies (+2 AC)']}, shield=True)
g('ruidium_shield', 'Ruidium Shield gives no AC bonus of its own, only the Shield +2: 10 + 2 + 2 = 14.',
  ['Ruidium Shield'], {'ac': 14}, [])
g('starmetal_shield', 'Starmetal Shield: +1 AC instead of the normal Shield bonus: 10 + 2 + 1 = 13.',
  ['Starmetal Shield'], {'ac': 13}, [], shield=True)
g('rotor_con_save', 'Rotor of Return: +1 to Constitution saving throws only.',
  ['Rotor of Return'], {}, [eq('saveBonus.0.v', 1), eq('saveBonus.0.ab', 'CON')])
g('scholars_cap', "Scholar's Cap +2: +2 to Intelligence checks and Intelligence saving throws (Arcana misc +2).",
  ["Scholar's Cap +2"], {}, [eq('saveBonus.0.v', 2), eq('saveBonus.0.ab', 'INT'), eq('skills.Arcana.misc', 2)])
g('ring_red_fury_off', 'Ring of Red Fury: swim speed always, the condition immunities only during Ruidium Rage.',
  ['Ring of Red Fury'], {}, [eq('speeds.swim.v', 'walk'), eq('fxToggles.0.on', False)], fxT={'ruidium-rage': False})
g('ring_red_fury_on', 'Ring of Red Fury in Ruidium Rage: immune to Paralyzed and Restrained.',
  ['Ring of Red Fury'], {}, [has('defenses', t='Immunity', v='Paralyzed (condition)')], fxT={'ruidium-rage': True})
g('stone_luck', 'Stone of Good Luck: +1 to ability checks (Athletics misc +1) and saves; Stone of Ill Luck would be -2.',
  ['Stone of Good Luck'], {}, [eq('skills.Athletics.misc', 1), eq('saveBonus.0.v', 1)])
g('stone_ill_luck', 'Stone of Ill Luck: -2 to ability checks and saving throws.',
  ['Stone of Ill Luck'], {}, [eq('skills.Athletics.misc', -2), eq('saveBonus.0.v', -2)])
g('septum_ring', 'Septum Ring of the Great Minotaur: Strength +2 (maximum 22), advantage on Strength checks, carrying capacity doubles. STR 18 + 2 (Soldier background) + 2 = 22 (+6).',
  ['Septum Ring of the Great Minotaur'], {'D:mod.STR': 6}, [has('abilities.STR.bonus', v=2), eq('carryBump', True), inn('defenses', 'Advantage on Strength checks')], base={'STR': 18})
g('shard_xeluan', 'Shard of Xeluan: Strength +4 but never above 22. STR 20 reaches 22 (the old cap 20 gave nothing).',
  ['Shard of Xeluan'], {'D:mod.STR': 6}, [has('abilities.STR.bonus', v=2)], base={'STR': 20})
g('raptor_robe', 'Raptor Feather Robe: Intelligence or Charisma becomes 22 (chosen). Charisma chosen: CHA 8 becomes 22 (+6).',
  ['Raptor Feather Robe'], {'D:mod.CHA': 6}, [], cls='Sorcerer', sub='Draconic Sorcery', ch={'gx-a-item-Raptor Feather Robe': ['Charisma']})
g('strig_robe', 'Strig Feather Robe: Intelligence chosen: INT 12 becomes 22 (+6).',
  ['Strig Feather Robe'], {'D:mod.INT': 6}, [], cls='Sorcerer', sub='Draconic Sorcery', ch={'gx-a-item-Strig Feather Robe': ['Intelligence']})
g('red_dragon_mask', 'Red Dragon Mask: Resistance to fire, darkvision 60 ft, Draconic, one Legendary Resistance a day.',
  ['Red Dragon Mask'], {}, [has('defenses', t='Resistance', v='Fire'), eq('darkvision', 60), inn('lang', 'Draconic'), eq('res.Legendary Resistance (Red Dragon Mask).max', 1)])
g('darkvision_add', "Rogue's Mantle: darkvision 60 ft, or 60 ft more if you already have it. An Elf (60 ft) gets 120 ft.",
  ["Rogue's Mantle"], {}, [eq('darkvision', 120)], species='Elf')
g('shadowfell_tattoo', 'Shadowfell Brand Tattoo: darkvision 60 ft and advantage on Dexterity (Stealth) checks.',
  ['Shadowfell Brand Tattoo'], {}, [eq('darkvision', 60), inn('defenses', 'Dexterity (Stealth)')])
g('robe_of_eyes', 'Robe of Eyes: Darkvision and Truesight, each 120 feet, advantage on sight-based Perception.',
  ['Robe of Eyes'], {}, [eq('darkvision', 120), has('senses', n='Truesight', v=120)])
g('sword_zariel', 'Sword of Zariel: Celestial, Fly Speed 90 ft with hover, Truesight 60 ft, Charisma 20 (+5).',
  ['Sword of Zariel'], {'D:mod.CHA': 5}, [inn('lang', 'Celestial'), has('moves', m='fly', v=90), has('senses', n='Truesight', v=60)])
g('seafarer', "Seafarer's Jacket: proficiency with Navigator's Tools.",
  ["Seafarer's Jacket"], {}, [inn('profSrc.tools', "Navigator's Tools")])
g('initiative_adv', 'Peregrine Mask, Slumbering and Stirring Dragon-Touched Focus: advantage on initiative rolls.',
  ['Peregrine Mask', 'Slumbering Dragon-Touched Focus', 'Stirring Dragon-Touched Focus'], {}, [inn('defenses', 'Advantage on Initiative rolls')])
g('sword_of_kas', 'Sword of Kas: add 1d10 to each Initiative roll.',
  ['Sword of Kas'], {}, [inn('defenses', 'Add 1d10 to Initiative rolls')])
g('ring_air_off', 'Ring of Air Elemental Command: Auran always, resistance and flight only after helping slay an air elemental.',
  ['Ring of Air Elemental Command'], {}, [inn('lang', 'Auran'), eq('moves', None)], fxT={'ring-air-slain': False})
g('ring_air_on', 'Ring of Air Elemental Command after helping slay an air elemental: resistance to lightning and a Fly Speed equal to your Speed (30).',
  ['Ring of Air Elemental Command'], {}, [has('defenses', t='Resistance', v='Lightning'), has('moves', m='fly', v=30)], fxT={'ring-air-slain': True})
g('ring_fire', 'Ring of Fire Elemental Command: resistance to fire always; immunity only after helping slay a fire elemental.',
  ['Ring of Fire Elemental Command'], {}, [has('defenses', t='Resistance', v='Fire'), inn('lang', 'Ignan')], fxT={'ring-fire-slain': False})
g('ring_elemental_air', 'Ring of Elemental Command (air): resistance to lightning, Fly Speed equal to Speed, Auran.',
  ['Ring of Elemental Command'], {}, [has('defenses', t='Resistance', v='Lightning'), has('moves', m='fly', v=30), inn('lang', 'Auran')], ch={'gx-pl-item-Ring of Elemental Command': ['Air']})
g('resist_picks', 'Resistance Plating, Resistance Suture and Ring of Resistance: resistance to the one chosen damage type.',
  ['Resistance Plating', 'Resistance Suture', 'Ring of Resistance'], {},
  [has('defenses', t='Resistance', v='Cold'), has('defenses', t='Resistance', v='Thunder'), has('defenses', t='Resistance', v='Force')],
  ch={'gx-rt-item-Resistance Plating': ['Cold'], 'gx-rt-item-Resistance Suture': ['Thunder'], 'gx-rt-item-Ring of Resistance': ['Force']})
g('ring_seething', 'Ring of Seething (Fiend): advantage on saves against being Charmed or Frightened by a Fiend.',
  ['Ring of Seething'], {}, [inn('saveNotes', 'Fiend')], ch={'gx-ct-item-Ring of Seething': ['Fiend']})
g('star_metal_ring', 'Star Metal Ring: Unarmed Strikes are magical and deal Force damage.',
  ['Star Metal Ring'], {}, [eq('attacks.Unarmed Strike.type', 'Force')])
g('charges_dawn', 'Staff of Ruling: three effects once each per dawn (3). Star Razor Awakened: Faerie Fire and See Invisibility (2). Star Razor Exalted adds Fly (3).',
  ['Staff of Ruling', 'Star Razor (Awakened)', 'Star Razor (Exalted)'], {},
  [eq('res.Staff of Ruling.max', 3), eq('res.Star Razor (Awakened).max', 2), eq('res.Star Razor (Exalted).max', 3)])
g('uses_misc', 'Ring of Djinni Summoning once per 24 hours, Shield Emitter and Shoulder Cannon once until dawn, Sorting Beast Identify once until dawn.',
  ['Ring of Djinni Summoning', 'Shield Emitter', 'Shoulder Cannon', 'Sorting Beast'], {},
  [eq('res.Call a Djinni.max', 1), eq('res.Shield Emitter.max', 1), eq('res.Shoulder Cannon.max', 1), eq('res.Identify (Sorting Beast).max', 1)])
g('stonemaker', 'Stonemaker War Pick: Meld into Stone once until dawn, 1d6 + 1 petrification charges (highest result 7).',
  ['Stonemaker War Pick'], {}, [eq('res.Petrification charges (roll 1d6 + 1 when found).max', 7), eq('res.Stonemaker War Pick.max', 1)])
g('thunder_staff', 'Staff of Thunder and Lightning: five properties, each once until dawn.',
  ['Staff of Thunder and Lightning'], {},
  [eq('res.Lightning (Staff of Thunder and Lightning).max', 1), eq('res.Thunder (Staff of Thunder and Lightning).max', 1), eq('res.Thunderclap (Staff of Thunder and Lightning).max', 1)])
g('silken_spite', 'Silken Spite (Awakened): Abyssal, Elvish, Undercommon, darkvision 60 ft, four spells once each per dawn.',
  ['Silken Spite (Awakened)'], {}, [inn('lang', 'Undercommon'), eq('darkvision', 60), eq('res.Cloudkill (Silken Spite).max', 1), eq('res.Web (Silken Spite).max', 1)])
g('squasher_druid', 'Squasher: a Druid wielding it uses Wisdom instead of Strength for attack and damage. WIS 18 (+4) beats STR 15 + 2 background = 17 (+3).',
  ['Squasher'], {}, [eq('attacks.Squasher.ab', 'WIS')], cls='Druid', sub='Circle of the Land', base={'WIS': 18})
g('snicker_snack', 'Snicker-Snack: proficiency with greatswords, Charisma for attack and damage. CHA 18 (+4) beats STR 17 (+3).',
  ['Snicker-Snack'], {}, [eq('attacks.Snicker-Snack.ab', 'CHA'), inn('profSrc.weapons', 'Greatsword')], base={'CHA': 18})
g('straitjacket', 'Straitjacket: with no armor or Shield add the Intelligence modifier to AC. INT 16 (+3): 10 + 2 + 3 = 15.',
  ['Straitjacket'], {'ac': 15}, [], base={'INT': 16})
g('splitter_off', 'Splitter: +1 AC only when split into Handaxe and Quarterstaff (switch off): AC 12.',
  ['Splitter'], {'ac': 12}, [], fxT={'splitter-split': False})
g('splitter_on', 'Splitter split: +1 AC while wielded in separate hands: AC 13.',
  ['Splitter'], {'ac': 13}, [], fxT={'splitter-split': True})
g('shaarat_on', "Shaarat'doovol when it favors you: Truesight 90 ft, immune to Charmed and Frightened, resistance to psychic.",
  ["Shaarat'doovol, the Blade of Truth"], {}, [has('senses', n='Truesight', v=90), has('defenses', t='Resistance', v='Psychic')], fxT={'shaarat-favors': True})
g('shaarat_off', "Shaarat'doovol when it does not favor you: no Truesight, no psychic resistance.",
  ["Shaarat'doovol, the Blade of Truth"], {}, [eq('senses', None)], fxT={'shaarat-favors': False})
g('dreadnought', 'Shield of the Blazing Dreadnought: immunity to fire only while the shield is active.',
  ['Shield of the Blazing Dreadnought'], {}, [has('defenses', t='Immunity', v='Fire')], fxT={'dreadnought-active': True}, shield=True)
g('piwafwi_hood', 'Piwafwi of Fire Resistance: resistance to fire always; advantage on Stealth checks to hide only with the hood up.',
  ['Piwafwi of Fire Resistance'], {}, [has('defenses', t='Resistance', v='Fire'), inn('defenses', 'made to hide')], fxT={'cloak-hood-up': True})
g('glacial_potion', 'Potion of Glacial Resistance: resistance to cold for 1 hour (switch on).',
  ['Potion of Glacial Resistance'], {}, [has('defenses', t='Resistance', v='Cold')], fxT={'glacial-potion': True})
g('spells_from_items', 'Item spells: Chill Touch (Ominous Staff of Skulls), Druidcraft (Petal Dancer Ward), Mage Hand (Spell Duelist\'s Trophy).',
  ['Ominous Staff of Skulls', 'Petal Dancer Ward', "Spell Duelist's Trophy"], {},
  [inn('spells', '"n": "Chill Touch"'), inn('spells', '"n": "Druidcraft"'), inn('spells', '"n": "Mage Hand"')])
g('spells_from_items2', "Stonky's ring: Telekinesis at will. Shield Module: Shield once per long rest.",
  ["Stonky's ring", 'Shield Module'], {}, [inn('spells', '"n": "Telekinesis"'), inn('spells', '"n": "Shield"'), eq('res.Shield (Shield Module).max', 1)])
g('adv_notes_a', 'Ring of Spell Turning, Scarab of Protection, Staff of the Magi: advantage on saves against spells.',
  ['Ring of Spell Turning', 'Scarab of Protection', 'Staff of the Magi'], {}, [inn('saveNotes', 'saving throws against spells')])
g('adv_notes_b', 'Plaguebane Mask, Sirensong Silencer: advantage against Poisoned or Charmed.',
  ['Plaguebane Mask', 'Sirensong Silencer'], {}, [inn('saveNotes', 'Poisoned condition'), inn('saveNotes', 'Charmed condition')])
g('adv_notes_c', 'Periapt of Health, Spellguard Shield, Purity Spear: advantage notes on saves.',
  ['Periapt of Health', 'Spellguard Shield', 'Purity Spear'], {}, [inn('saveNotes', 'shake it off'), inn('saveNotes', 'spells and other magical effects'), inn('saveNotes', 'Constitution and Wisdom')], shield=True)
g('death_save_adv', 'Powered Armor: advantage on death saving throws; Shroud of Ending adds the same.',
  ['Powered Armor'], {}, [inn('saveNotes', 'death saving throws')])
g('forgotten_one', 'Staff of the Forgotten One: proficiency bonus doubled for Arcana and History (the Sage background is proficient in both): Expertise.',
  ['Staff of the Forgotten One'], {}, [eq('skills.Arcana.p', 2), eq('skills.History.p', 2)], cls='Wizard', sub='Evoker', bg='Sage')
g('obolaka', "Obo'laka: the host can attune to one additional magic item (4).",
  ["Obo'laka"], {}, [eq('attMax', 4)])
g('oathbound', 'Oathbound Ring: resistance to Bludgeoning, Piercing and Slashing damage from nonmagical attacks.',
  ['Oathbound Ring'], {}, [inn('defenses', 'nonmagical attacks')])
g('obsidian_plate', 'Obsidian Flint Dragon Plate: +2 AC (Plate 18 + 2 = 20), resistance to poison.',
  ['Obsidian Flint Dragon Plate'], {'ac': 20}, [has('defenses', t='Resistance', v='Poison')], armor='Plate Armor')
g('red_claw', "Red Claw's Regalia: Constitution +2 (maximum 22), advantage on Constitution saves, resistance to fire. CON 13 to 15 (+2).",
  ["Red Claw's Regalia"], {'D:mod.CON': 3}, [has('defenses', t='Resistance', v='Fire'), inn('saveNotes', 'Constitution')])
g('pendant_fury', 'Pendant of the Tempered Fury: with no armor or Shield, damage from bludgeoning, piercing and slashing is reduced by 3.',
  ['Pendant of the Tempered Fury'], {}, [inn('defenses', 'reduced by 3')])
g('tools_weapons', "Spirit Pike (Cleric): pike proficiency. Storm Sickle: sickle proficiency.",
  ['Spirit Pike', 'Storm Sickle'], {}, [inn('profSrc.weapons', 'Pike'), inn('profSrc.weapons', 'Sickle')])
g('stonebreaker', "Stonebreaker's Breastplate: immune to being knocked prone.",
  ["Stonebreaker's Breastplate"], {}, [inn('defenses', 'Prone (condition)')], armor="Stonebreaker's Breastplate")
g('lang_pendant', "Pendant of Thieves' Sight: you know Thieves' Cant.",
  ["Pendant of Thieves' Sight"], {}, [inn('lang', "Thieves' Cant")])
g('shagambi', 'Shagambi: the host makes one extra attack with the Attack action (two attacks).',
  ['Shagambi'], {}, [inn('actions', 'Make two attacks')])
g('stonespeaker_rider', 'Stonespeaker Crystal: advantage on Investigation checks while on your person.',
  ['Stonespeaker Crystal'], {}, [inn('defenses', 'Investigation')])

if __name__ == '__main__':
    for n, d in G:
        with open(os.path.join(OUT, 'fx_L5_' + n + '.json'), 'w') as f:
            json.dump(d, f, indent=1)
    print(len(G), 'files')
