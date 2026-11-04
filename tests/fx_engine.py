#!/usr/bin/env python3
"""Unit tests of the generic fx engine (gfx). Small fixtures are injected as window.GX at run time, so no real data is touched.
Run: python3 tests/fx_engine.py [--root DIR] [--dump]
Each case builds a character, adds one fx entry for one source (class, sub, species, bg, feat, item) and checks the sheet data C against a baseline."""
import json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if '--root' in sys.argv:
    ROOT = os.path.abspath(sys.argv[sys.argv.index('--root') + 1])


def base_build():
    return {
        'name': 'Fx', 'species': 'Human', 'bg': 'Soldier', 'bgMode': '21', 'bg2': 'STR', 'bg1': 'CON',
        'cls': 'Fighter', 'sub': '', 'level': 5,
        'base': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 12, 'WIS': 10, 'CHA': 8},
        'ch': {}, 'src': {'core': True}, 'method': 'array',
        'arr': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 12, 'WIS': 10, 'CHA': 8},
        'hb': False, 'armor': '', 'shield': False, 'weps': [], 'eqC': 'A', 'eqB': 'B', 'size': 'Medium',
    }


def acsum(C):
    return C['ac']['base'] + sum(b['v'] for b in C['ac']['bonus'])


def has(lst, key, s):
    return any(s in (x.get(key) or '') for x in lst)


def skill(C, n):
    return [s for s in C['skills'] if s['n'] == n][0]


CASES = []
ABIL_K = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
NOARM = {'eqC': 'none', 'eqB': 'none'}


def case(name, gx, check, tweak=None):
    CASES.append((name, gx, tweak, check))


def species(e):
    return {'species': {'Human': [e]}}


def cls(e):
    return {'cls': {'Fighter': [e]}}


def ok(cond, msg):
    return '' if cond else msg


# ---- fx engine v3b: toggle states (S.fxT), passed as the second argument of __bldSheetFor
def tg(e, id='t1', default=False):
    return dict(e, toggle={'id': id, 'label': 'Test state', 'default': default})


def tgids(C):
    return [x['id'] for x in C.get('fxToggles', [])]


case('toggle off: AC unchanged, listed as off', species(tg({'n': 'T', 'acAdd': 2})), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) and tgids(C1) == ['t1'] and C1['fxToggles'][0]['on'] is False, json.dumps(C1.get('fxToggles'))))
case('toggle on: AC +2', species(tg({'n': 'T', 'acAdd': 2})), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 2 and C1['fxToggles'][0]['on'] is True, 'ac %s -> %s' % (acsum(C0), acsum(C1))), {'__fxT': {'t1': True}})
case('toggle default true, switched off', species(tg({'n': 'T', 'acAdd': 2}, default=True)), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0), 'counted'), {'__fxT': {'t1': False}})
case('toggle default true, state missing', species(tg({'n': 'T', 'acAdd': 2}, default=True)), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 2, 'not counted'))
case('toggle on: speed -10 and AC +2, cond noHeavy', species(tg({'n': 'T', 'acAdd': 2, 'speedAdd': -10, 'cond': 'noHeavy'})), lambda C0, C1, D0, D1: ok(C1['speed'] == C0['speed'] - 10 and acsum(C1) == acsum(C0) + 2, 'speed %s ac %s' % (C1['speed'], acsum(C1))), dict(NOARM, __fxT={'t1': True}))
case('toggle on, heavy armor: nothing', species(tg({'n': 'T', 'acAdd': 2, 'speedAdd': -10, 'cond': 'noHeavy'})), lambda C0, C1, D0, D1: ok(C1['speed'] == C0['speed'] and acsum(C1) == acsum(C0), 'counted with heavy armor'), {'eqC': 'A', '__fxT': {'t1': True}})
case('toggle on: resistance', species(tg({'n': 'T', 'res': ['Fire']})), lambda C0, C1, D0, D1: ok(any(x.get('t') == 'Resistance' and x.get('v') == 'Fire' for x in C1['defenses']), 'no resistance'), {'__fxT': {'t1': True}})
case('toggle off: no resistance', species(tg({'n': 'T', 'res': ['Fire']})), lambda C0, C1, D0, D1: ok(not any(x.get('v') == 'Fire' for x in C1['defenses']), 'resistance while off'))
case('toggle on: save bonus', species(tg({'n': 'T', 'saveBonus': 1})), lambda C0, C1, D0, D1: ok(D1['save']['WIS'] == D0['save']['WIS'] + 1, 'save'), {'__fxT': {'t1': True}})
case('toggle off: save bonus', species(tg({'n': 'T', 'saveBonus': 1})), lambda C0, C1, D0, D1: ok(D1['save']['WIS'] == D0['save']['WIS'], 'save counted'))
case('toggle on: skill proficiency', species(tg({'n': 'T', 'skillProf': ['Arcana']})), lambda C0, C1, D0, D1: ok(skill(C1, 'Arcana').get('p') == 1, 'no proficiency'), {'__fxT': {'t1': True}})
case('toggle off: skill proficiency', species(tg({'n': 'T', 'skillProf': ['Arcana']})), lambda C0, C1, D0, D1: ok(skill(C1, 'Arcana').get('p') != 1, 'proficiency while off'))
case('toggle on: hpFlat 7', species(tg({'n': 'T', 'hpFlat': 7})), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 7, 'hp'), {'__fxT': {'t1': True}})
case('toggle off: hpFlat 7', species(tg({'n': 'T', 'hpFlat': 7})), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'], 'hp counted'))
case('toggle bloodied model (state flag, abUp)', species(tg({'n': 'T', 'abUp': [['STR', 2, 20]]}, id='bloodied')), lambda C0, C1, D0, D1: ok(D1['score']['STR'] == D0['score']['STR'] + 2, 'STR'), {'__fxT': {'bloodied': True}})
case('toggle on: size Large', species(tg({'n': 'T', 'size': 'Large'})), lambda C0, C1, D0, D1: ok(C1['size'] == 'Large', C1['size']), {'__fxT': {'t1': True}})
case('toggle abUp "rage" value (Rage Damage)', {'cls': {'Fighter': [tg({'n': 'T', 'abUp': [['STR', 'rage', 29]]}, id='rage')]}}, lambda C0, C1, D0, D1: ok(D1['score']['STR'] == D0['score']['STR'] + 2, 'STR %s -> %s' % (D0['score']['STR'], D1['score']['STR'])), {'__fxT': {'rage': True}})
case('toggle same id in two entries is one switch', species([tg({'n': 'A', 'acAdd': 1}), tg({'n': 'B', 'speedAdd': 5})]) if False else {'species': {'Human': [tg({'n': 'A', 'acAdd': 1}), tg({'n': 'B', 'speedAdd': 5})]}}, lambda C0, C1, D0, D1: ok(len(C1['fxToggles']) == 1 and acsum(C1) == acsum(C0) + 1 and C1['speed'] == C0['speed'] + 5, json.dumps(C1['fxToggles'])), {'__fxT': {'t1': True}})

case('acAdd +2', species({'n': 'T', 'acAdd': 2}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 2 and has(C1['ac']['bonus'], 's', 'T (Human)'), 'ac %s -> %s' % (acsum(C0), acsum(C1))))
case('acAdd pb', species({'n': 'T', 'acAdd': 'pb'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 3, 'ac %s -> %s' % (acsum(C0), acsum(C1))))
case('acAdd cond noShield, Shield held', species({'n': 'T', 'acAdd': 1, 'cond': 'noShield'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0), 'bonus applied with a Shield'), {'shield': True, 'eqB': 'A'})
case('acBase 13 + Dex without armor', species({'n': 'T', 'acBase': [13, 'full']}), lambda C0, C1, D0, D1: ok(C1['ac']['base'] == 13 and C1['ac'].get('dex') == 'full', json.dumps(C1['ac'])), NOARM)
case('acDexAb CON', species({'n': 'T', 'acDexAb': 'CON'}), lambda C0, C1, D0, D1: ok(D1['ac'] == 10 + 2 + 2, 'AC %s' % D1['ac']), NOARM)
case('acBase keeps a higher current AC', species({'n': 'T', 'acBase': [9, 'full']}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0), 'lowered AC'), NOARM)
case('saveBonus ability mod', species({'n': 'T', 'saveBonus': 'CON'}), lambda C0, C1, D0, D1: ok(has(C1.get('saveBonus', []), 's', 'T (Human)') and D1['save']['STR'] == D0['save']['STR'] + D1['mod']['CON'], 'save %s -> %s' % (D0['save']['STR'], D1['save']['STR'])))
case('saveBonus halfPb', species({'n': 'T', 'saveBonus': 'halfPb'}), lambda C0, C1, D0, D1: ok(D1['save']['WIS'] == D0['save']['WIS'] + 1, 'save %s -> %s' % (D0['save']['WIS'], D1['save']['WIS'])))
case('init pb', species({'n': 'T', 'init': 'pb'}), lambda C0, C1, D0, D1: ok(D1['init'] == D0['init'] + 3, 'init %s -> %s' % (D0['init'], D1['init'])))
case('initAdv note', species({'n': 'T', 'initAdv': 1}), lambda C0, C1, D0, D1: ok(has(C1.get('defenses', []), 'v', 'Advantage on Initiative'), 'no note'))
case('hpLvl 1 (species, level 5)', species({'n': 'T', 'hpLvl': 1}), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 5, 'hp %s -> %s' % (D0['hpmax'], D1['hpmax'])))
case('hpLvl 2 per class level (class)', cls({'n': 'T', 'hpLvl': 2}), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 10, 'hp %s -> %s' % (D0['hpmax'], D1['hpmax'])))
case('hpFlat 7', species({'n': 'T', 'hpFlat': 7}), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 7, 'hp %s -> %s' % (D0['hpmax'], D1['hpmax'])))
case('speedAdd 10', species({'n': 'T', 'speedAdd': 10}), lambda C0, C1, D0, D1: ok(C1['speed'] == C0['speed'] + 10 and 'T (Human)' in C1['speedSrc'], 'speed %s -> %s' % (C0['speed'], C1['speed'])))
case('speedSet 40', species({'n': 'T', 'speedSet': 40}), lambda C0, C1, D0, D1: ok(C1['speed'] == 40, 'speed %s' % C1['speed']))
case('mv fly = Speed', species({'n': 'T', 'mv': {'fly': 'speed'}}), lambda C0, C1, D0, D1: ok('Fly Speed equal to your Speed' in C1['speedSrc'] and C1['moves'][0]['v'] == C1['speed'], C1['speedSrc']))
case('mv climb 20', species({'n': 'T', 'mv': {'climb': 20}}), lambda C0, C1, D0, D1: ok('Climb Speed 20 ft' in C1['speedSrc'], C1['speedSrc']))
case('res imm vul', species({'n': 'T', 'res': ['Fire'], 'imm': ['Poison'], 'vul': ['Cold']}), lambda C0, C1, D0, D1: ok(all(any(x.get('t') == t and x.get('v') == v for x in C1['defenses']) for t, v in [('Resistance', 'Fire'), ('Immunity', 'Poison'), ('Vulnerability', 'Cold')]), json.dumps(C1['defenses'])))
case('advOn note', species({'n': 'T', 'advOn': ['saves against being Charmed']}), lambda C0, C1, D0, D1: ok(has(C1['defenses'], 'v', 'Advantage on saves against being Charmed'), json.dumps(C1['defenses'])))
case('skillProf', species({'n': 'T', 'skillProf': ['Arcana']}), lambda C0, C1, D0, D1: ok(skill(C1, 'Arcana').get('p') == 1, 'no proficiency'))
case('skillExpert on a proficient skill', species({'n': 'T', 'skillExpert': ['Athletics']}), lambda C0, C1, D0, D1: ok(skill(C1, 'Athletics').get('p') == 2, 'no expertise'))
case('skillExpert without proficiency does nothing', species({'n': 'T', 'skillExpert': ['Arcana']}), lambda C0, C1, D0, D1: ok(not skill(C1, 'Arcana').get('p'), 'expertise without proficiency'))
case('skillBonus pb on Stealth', species({'n': 'T', 'skillBonus': [['Stealth', 'pb']]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Stealth').get('misc') == 3, 'no misc'))
case('skillBonus * (all)', species({'n': 'T', 'skillBonus': [['*', 1]]}), lambda C0, C1, D0, D1: ok(all(s.get('misc') == 1 for s in C1['skills']), 'not all'))
case('chkBonus DEX', species({'n': 'T', 'chkBonus': [['DEX', 2]]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Stealth').get('misc') == 2 and not skill(C1, 'Athletics').get('misc'), 'wrong skills'))
case('langs', species({'n': 'T', 'langs': ['Sylvan']}), lambda C0, C1, D0, D1: ok('Sylvan' in C1['lang'], str(C1['lang'])))
case('tools weapons armor', species({'n': 'T', 'tools': ["Smith's Tools"], 'weapons': ['Whip'], 'armor': ['Hide']}), lambda C0, C1, D0, D1: ok("Smith" in json.dumps(C1['profSrc']) and 'Whip' in json.dumps(C1['profSrc']) and 'Hide' in json.dumps(C1['profSrc']), json.dumps(C1['profSrc'])))
case('spells always prepared', species({'n': 'T', 'spells': [[1, 'Shield']]}), lambda C0, C1, D0, D1: ok(any(x['n'] == 'Shield' and x.get('use') == 'Always prepared' for x in C1.get('spells', [])) and not any(x['n'] == 'Shield' for x in C0.get('spells', [])), 'spell missing: %s' % [x['n'] for x in C1['spells']][:5]))
case('spAtk and spDc (Wizard)', {'cls': {'Wizard': [{'n': 'T', 'spAtk': 1, 'spDc': 2}]}}, lambda C0, C1, D0, D1: ok(json.dumps(C1).count('T (Wizard') >= 1, 'no spell bonus source'), {'cls': 'Wizard'})
case('level gate l below level', cls({'n': 'T', 'l': 9, 'hpFlat': 50}), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'], 'applied below l'))
case('when pick', cls({'n': 'T', 'hpFlat': 4, 'when': {'key': 'zz', 'val': 'x'}}), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 4, 'when pick did not match'), {'ch': {'zz': 'x'}})
case('when pick not held', cls({'n': 'T', 'hpFlat': 4, 'when': {'key': 'zz', 'val': 'x'}}), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'], 'applied without the pick'))

# batch A fields: cond mwArmor, acNoDex, acArmAb
MW = {'inv': [{'n': 'Chain Mail, Masterwork', 'q': 1, 'eq': True}]}
PL = {'inv': [{'n': 'Chain Mail', 'q': 1, 'eq': True}]}
W16 = {'base': {'STR': 10, 'DEX': 14, 'CON': 13, 'INT': 8, 'WIS': 16, 'CHA': 8}, 'arr': {'STR': 10, 'DEX': 14, 'CON': 13, 'INT': 8, 'WIS': 16, 'CHA': 8}}
case('cond mwArmor, Masterwork armor worn', cls({'n': 'T', 'ac': [[1, 2]], 'saveBonus': 3, 'cond': 'mwArmor'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 2 and has(C1.get('saveBonus') or [], 's', 'T (Fighter 5)'), 'ac %s -> %s, save %s' % (acsum(C0), acsum(C1), C1.get('saveBonus'))), MW)
case('cond mwArmor, plain armor worn', cls({'n': 'T', 'ac': [[1, 2]], 'saveBonus': 3, 'cond': 'mwArmor'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) and not C1.get('saveBonus'), 'applied to plain armor'), PL)
case('acNoDex', species({'n': 'T', 'acNoDex': True}), lambda C0, C1, D0, D1: ok(C0['ac'].get('dex') == 'full' and C1['ac'].get('dex') == '' and acsum(C1) == acsum(C0), 'dex %s -> %s' % (C0['ac'].get('dex'), C1['ac'].get('dex'))), NOARM)
case('acArmAb WIS in armor', species({'n': 'T', 'acArmAb': 'WIS', 'cond': 'armor'}), lambda C0, C1, D0, D1: ok(C1['ac'].get('dex') == '' and acsum(C1) == acsum(C0) + 3 and has(C1['ac']['bonus'], 's', 'Wisdom modifier in place of Dexterity'), json.dumps(C1['ac'])), dict(W16, inv=[{'n': 'Scale Mail', 'q': 1, 'eq': True}]))
case('acArmAb WIS, no armor does nothing', species({'n': 'T', 'acArmAb': 'WIS', 'cond': 'armor'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) and C1['ac'].get('dex') == C0['ac'].get('dex'), json.dumps(C1['ac'])), dict(W16, **NOARM))
case('bg entry', {'bg': {'Soldier': [{'n': 'T', 'hpFlat': 3}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 3 and has(C1['hpBonus'], 's', 'T (Soldier background)'), 'bg entry'))
case('feat entry', {'feat': {'Alert': [{'n': 'T', 'hpFlat': 3}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 3 and has(C1['hpBonus'], 's', 'T (Alert feat)'), 'feat entry'), {'ch': {'feat4': {'feat': 'Alert'}}})
case('sub entry', {'sub': {'Champion': [{'n': 'T', 'hpFlat': 3}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 3 and has(C1['hpBonus'], 's', 'T (Champion 5)'), 'sub entry'), {'sub': 'Champion'})
ITEM = 'Ring of Protection'
case('item not equipped gives nothing', {'item': {ITEM: [{'n': 'T', 'hpFlat': 3}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'], 'unequipped item counted'), {'inv': [{'n': ITEM, 'q': 1}]})
case('item equipped and attuned', {'item': {ITEM: [{'n': 'T', 'hpFlat': 3}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 3 and has(C1['hpBonus'], 's', 'magic item, attuned'), json.dumps(C1['hpBonus'])), {'inv': [{'n': ITEM, 'q': 1, 'eq': 1}]})
# batch D: acOver, acBase ability "cast", skillProfPlus, FXO override table, item entry on an item row without fx
case('acBase acOver beats the worn armor', species({'n': 'T', 'acBase': [17, ''], 'acOver': True}), lambda C0, C1, D0, D1: ok(acsum(C0) == 16 and D1['ac'] == 17 and 'worn armor' in C1['ac']['baseSrc'], 'AC %s -> %s %s' % (D0['ac'], D1['ac'], C1['ac']['baseSrc'])))
case('acBase acOver never lowers the AC', species({'n': 'T', 'acBase': [12, ''], 'acOver': True}), lambda C0, C1, D0, D1: ok(D1['ac'] == D0['ac'], 'AC %s -> %s' % (D0['ac'], D1['ac'])))
case('acBase without acOver is ignored in armor', species({'n': 'T', 'acBase': [17, '']}), lambda C0, C1, D0, D1: ok(D1['ac'] == D0['ac'], 'AC %s -> %s' % (D0['ac'], D1['ac'])))
case('acBase cast ability (Wizard INT 20)', species({'n': 'T', 'acBase': [10, '', 'cast']}), lambda C0, C1, D0, D1: ok(D0['ac'] == 12 and D1['ac'] == 15, 'AC %s -> %s' % (D0['ac'], D1['ac'])),
     {'cls': 'Wizard', 'eqC': 'none', 'eqB': 'none', 'base': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 20, 'WIS': 10, 'CHA': 8}, 'arr': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 20, 'WIS': 10, 'CHA': 8}})
case('acBase cast ability without a spellcasting class does nothing', species({'n': 'T', 'acBase': [10, '', 'cast']}), lambda C0, C1, D0, D1: ok(D1['ac'] == D0['ac'], 'AC %s -> %s' % (D0['ac'], D1['ac'])), NOARM)
case('skillProfPlus gives proficiency', species({'n': 'T', 'skillProfPlus': ['Arcana']}), lambda C0, C1, D0, D1: ok(skill(C1, 'Arcana').get('p') == 1 and not skill(C1, 'Arcana').get('misc'), json.dumps(skill(C1, 'Arcana'))))
case('skillProfPlus adds +1 when already proficient', species({'n': 'T', 'skillProfPlus': ['Athletics']}), lambda C0, C1, D0, D1: ok(skill(C1, 'Athletics').get('p') == 1 and skill(C1, 'Athletics').get('misc') == 1, json.dumps(skill(C1, 'Athletics'))))
case('FXO fx:null drops the row fx', {'__fxo': {ITEM: {'fx': None}}}, lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) - 1, 'AC %s -> %s' % (acsum(C0), acsum(C1))), {'inv': [{'n': ITEM, 'q': 1, 'eq': 1}]})
case('FXO fx replaces the row fx', {'__fxo': {ITEM: {'fx': {'ac': 3}}}}, lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 2, 'AC %s -> %s' % (acsum(C0), acsum(C1))), {'inv': [{'n': ITEM, 'q': 1, 'eq': 1}]})
case('GX.item entry on an item row without fx', {'item': {'Sprinting Legs': [{'n': 'T', 'speedAdd': 10}]}}, lambda C0, C1, D0, D1: ok(C1['speed'] == C0['speed'] + 10, 'speed %s -> %s' % (C0['speed'], C1['speed'])), {'inv': [{'n': 'Sprinting Legs', 'q': 1, 'eq': 1}], 'src': {'core': True, 'tvss': True}})

# fx batch C: feat entries read their own picks (when), fixed ability increases (abUp), senses, weapon picks
FEATWHEN = {'feat': {'Alert': [{'n': 'P', 'pick': [{'k': 'q', 't': 'multi', 'n': 1, 'title': 'Q', 'list': [['A', ''], ['B', '']]}]},
                              {'n': 'TA', 'when': {'key': 'q', 'val': 'A'}, 'hpFlat': 3}, {'n': 'TB', 'when': {'key': 'q', 'val': 'B'}, 'hpFlat': 50}]}}
case('feat when reads its gx pick (A held)', FEATWHEN, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 3, 'hp %s -> %s' % (D0['hpmax'], D1['hpmax'])), {'ch': {'feat4': {'feat': 'Alert'}, 'gx-q-feat-feat4': ['A']}})
case('feat when with no pick applies nothing', FEATWHEN, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'], 'applied without the pick'), {'ch': {'feat4': {'feat': 'Alert'}}})
case('feat when reads a native pick (key-slot)', {'feat': {'Alert': [{'n': 'T', 'when': {'key': 'nat', 'val': 'X'}, 'hpFlat': 4}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 4, 'native pick not read'), {'ch': {'feat4': {'feat': 'Alert'}, 'nat-feat4': ['X']}})
case('abUp +1 CON', species({'n': 'T', 'abUp': [['CON', 1, 20]]}), lambda C0, C1, D0, D1: ok(D1['score']['CON'] == D0['score']['CON'] + 1, 'CON %s -> %s' % (D0['score']['CON'], D1['score']['CON'])))
case('abUp respects its maximum', species({'n': 'T', 'abUp': [['STR', 5, 19]]}), lambda C0, C1, D0, D1: ok(D1['score']['STR'] == 19, 'STR %s' % D1['score']['STR']))
case('sense Blindsight', species({'n': 'T', 'sense': [['Blindsight', 30, 'test']]}), lambda C0, C1, D0, D1: ok(any(x['n'] == 'Blindsight' and x['v'] == 30 for x in C1.get('senses') or []), json.dumps(C1.get('senses'))))
case('speedAdd -5 reads as a penalty', species({'n': 'T', 'speedAdd': -5}), lambda C0, C1, D0, D1: ok(C1['speed'] == C0['speed'] - 5 and '+-5' not in C1['speedSrc'], C1['speedSrc']))
case('weapon pick', {'feat': {'Alert': [{'n': 'T', 'pick': [{'k': 'w', 't': 'weapon', 'n': 1, 'title': 'Weapon'}]}]}}, lambda C0, C1, D0, D1: ok('Longsword' in C1['profs']['weapons'] and 'Longsword' not in C0['profs']['weapons'] and any(x[0] == 'Longsword' for x in C1['profSrc']['weapons']), json.dumps(C1['profs'])), {'cls': 'Wizard', 'ch': {'feat4': {'feat': 'Alert'}, 'gx-w-feat-feat4': ['Longsword']}})


# fx engine v3a: resToImm, speedAddIf, atkDice, atkAb, text pick
def defs(C, t):
    return [x['v'] for x in C.get('defenses', []) if x['t'] == t]


def atk(C, n):
    return [r for r in C['attacks'] if r['n'] == n][0]


case('resToImm without earlier Resistance = Resistance', species({'n': 'T', 'resToImm': ['Necrotic']}), lambda C0, C1, D0, D1: ok('Necrotic' in defs(C1, 'Resistance') and 'Necrotic' not in defs(C1, 'Immunity'), json.dumps(C1['defenses'])))
case('resToImm with earlier Resistance = Immunity', {'species': {'Human': [{'n': 'A', 'res': ['Necrotic']}, {'n': 'T', 'resToImm': ['Necrotic']}]}}, lambda C0, C1, D0, D1: ok('Necrotic' in defs(C1, 'Immunity') and 'Necrotic' not in defs(C1, 'Resistance'), json.dumps(C1['defenses'])))
case('speedAddIf grants the base speed when absent', species({'n': 'T', 'mv': {'swim': 'speed'}, 'speedAddIf': {'swim': 10}}), lambda C0, C1, D0, D1: ok(C1['speeds']['swim']['v'] == 'walk' and any(m['m'] == 'swim' for m in C1['moves']), json.dumps(C1.get('speeds'))))
case('speedAddIf adds +10 when the speed exists', {'species': {'Human': [{'n': 'A', 'mv': {'swim': 20}}, {'n': 'T', 'mv': {'swim': 'speed'}, 'speedAddIf': {'swim': 10}}]}}, lambda C0, C1, D0, D1: ok([m['v'] for m in C1['moves'] if m['m'] == 'swim'] == [30], json.dumps(C1.get('moves'))))
case('speedAddIf adds +10 to a C.speeds entry', {'species': {'Human': [{'n': 'T', 'mv': {'swim': 'speed'}, 'speedAddIf': {'swim': 10}}]}}, lambda C0, C1, D0, D1: ok(C1['speeds']['swim']['v'] == C1['speed'] + 10, json.dumps(C1.get('speeds')) + ' speed ' + str(C1['speed'])), {'ch': {}, 'cls': 'Ranger', 'level': 6})
case('atkDice unarmed puts dice on the row', species({'n': 'T', 'atkDice': [{'when': 'unarmed', 'd': '1d6', 't': 'Fire'}]}), lambda C0, C1, D0, D1: ok(atk(C1, 'Unarmed Strike').get('xdice') == [{'d': '1d6', 't': 'Fire', 's': 'T (Human)'}] and '+1d6 Fire' in atk(C1, 'Unarmed Strike')['note'], json.dumps(atk(C1, 'Unarmed Strike'))))
case('atkDice without a matching row becomes a Note', species({'n': 'T', 'atkDice': [{'when': 'Breath Weapon', 'd': '1d10', 't': 'Fire'}]}), lambda C0, C1, D0, D1: ok('Extra damage on Breath Weapon: +1d10 Fire' in defs(C1, 'Note'), json.dumps(defs(C1, 'Note'))))
case('atkAb replaces the ability when higher', species({'n': 'T', 'atkAb': {'kind': 'unarmed', 'ab': 'INT'}}), lambda C0, C1, D0, D1: ok(atk(C1, 'Unarmed Strike')['ab'] == 'INT' and atk(C0, 'Unarmed Strike')['ab'] == 'STR', atk(C1, 'Unarmed Strike')['ab']), {'base': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 20, 'WIS': 10, 'CHA': 8}, 'arr': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 20, 'WIS': 10, 'CHA': 8}})
case('atkAb keeps the ability when lower', species({'n': 'T', 'atkAb': {'kind': 'unarmed', 'ab': 'INT'}}), lambda C0, C1, D0, D1: ok(atk(C1, 'Unarmed Strike')['ab'] == 'STR', atk(C1, 'Unarmed Strike')['ab']))
case('atkAb opt:1 only adds a note', species({'n': 'T', 'atkAb': {'kind': 'unarmed', 'ab': 'INT', 'opt': 1}}), lambda C0, C1, D0, D1: ok(atk(C1, 'Unarmed Strike')['ab'] == 'STR' and 'Intelligence' in atk(C1, 'Unarmed Strike')['note'], atk(C1, 'Unarmed Strike')['note']), {'base': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 20, 'WIS': 10, 'CHA': 8}, 'arr': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 20, 'WIS': 10, 'CHA': 8}})


# ---- fx engine v4 (reports: ledger of MISS rows). Each case: one new field, a baseline run without it
def sn(C):
    return [x['t'] for x in C.get('saveNotes') or []]


def row(C, n):
    return [r for r in C['attacks'] if r['n'] == n][0]


def res(C, n):
    return [r for r in C['res'] if r['n'] == n]


# initiative: ability with minimum, steps, cond, die and no-surprise notes
case('v4 init ability with min (CHA -1, min 1)', species({'n': 'T', 'init': 'CHA', 'min': 1}), lambda C0, C1, D0, D1: ok(D1['init'] == D0['init'] + 1, 'init %s -> %s' % (D0['init'], D1['init'])))
case('v4 init steps [[1,1],[5,2]] at level 5', species({'n': 'T', 'init': [[1, 1], [5, 2]]}), lambda C0, C1, D0, D1: ok(D1['init'] == D0['init'] + 2, 'init %s -> %s' % (D0['init'], D1['init'])))
case('v4 init cond noArmor, armor worn', species({'n': 'T', 'init': 2, 'cond': 'noArmor'}), lambda C0, C1, D0, D1: ok(D1['init'] == D0['init'], 'init counted with armor'))
case('v4 init cond noArmor, no armor', species({'n': 'T', 'init': 2, 'cond': 'noArmor'}), lambda C0, C1, D0, D1: ok(D1['init'] == D0['init'] + 2, 'init %s -> %s' % (D0['init'], D1['init'])), NOARM)
case('v4 initDie note', species({'n': 'T', 'initDie': '1d10'}), lambda C0, C1, D0, D1: ok('Add 1d10 to Initiative rolls' in defs(C1, 'Note'), json.dumps(C1['defenses'])))
case('v4 noSurprise note', species({'n': 'T', 'noSurprise': True}), lambda C0, C1, D0, D1: ok('Cannot be surprised' in defs(C1, 'Note'), json.dumps(C1['defenses'])))
case('v4 condImm row', species({'n': 'T', 'condImm': ['Charmed']}), lambda C0, C1, D0, D1: ok('Charmed (condition)' in defs(C1, 'Immunity'), json.dumps(C1['defenses'])))
# save advantage as a line under Saving Throws
case('v4 advOn about saves also lands in saveNotes', species({'n': 'T', 'advOn': ['saves against being Charmed', 'Stealth checks']}), lambda C0, C1, D0, D1: ok('Advantage on saves against being Charmed' in sn(C1) and 'Advantage on Stealth checks' not in sn(C1) and 'Advantage on Stealth checks' in defs(C1, 'Note'), json.dumps(C1.get('saveNotes'))))
case('v4 saveNote line', species({'n': 'T', 'saveNote': ['+1 bonus to death saving throws']}), lambda C0, C1, D0, D1: ok('+1 bonus to death saving throws' in sn(C1), json.dumps(C1.get('saveNotes'))))
# ability scores
case('v4 abSet raises a lower score', species({'n': 'T', 'abSet': [['INT', 22]]}), lambda C0, C1, D0, D1: ok(D1['score']['INT'] == 22 and D0['score']['INT'] < 22, 'INT %s' % D1['score']['INT']))
case('v4 abSet never lowers', species({'n': 'T', 'abSet': [['STR', 10]]}), lambda C0, C1, D0, D1: ok(D1['score']['STR'] == D0['score']['STR'], 'STR %s' % D1['score']['STR']))
case('v4 abSet after an increase (abUp then set 23)', species({'n': 'T', 'abUp': [['CON', 1, 20]], 'abSet': [['CON', 23]]}), lambda C0, C1, D0, D1: ok(D1['score']['CON'] == 23, 'CON %s' % D1['score']['CON']))
case('v4 abPick set 22 (picked Charisma)', species({'n': 'T', 'abPick': {'k': 'a', 'from': ['INT', 'CHA'], 'set': 22}}), lambda C0, C1, D0, D1: ok(D1['score']['CHA'] == 22 and D1['score']['INT'] == D0['score']['INT'], 'CHA %s INT %s' % (D1['score']['CHA'], D1['score']['INT'])), {'ch': {'gx-a-species-Human': ['Charisma']}})
case('v4 abPick set without a pick does nothing', species({'n': 'T', 'abPick': {'k': 'a', 'from': ['INT', 'CHA'], 'set': 22}}), lambda C0, C1, D0, D1: ok(D1['score']['CHA'] == D0['score']['CHA'] and D1['score']['INT'] == D0['score']['INT'], 'changed'))
case('v4 abPick up 2 (Dexterity 14 -> 16)', species({'n': 'T', 'abPick': {'k': 'a', 'from': ['DEX', 'WIS'], 'up': 2, 'max': 22}}), lambda C0, C1, D0, D1: ok(D1['score']['DEX'] == D0['score']['DEX'] + 2 and D1['score']['WIS'] == D0['score']['WIS'], 'DEX %s' % D1['score']['DEX']), {'ch': {'gx-a-species-Human': ['Dexterity']}})
case('v4 abPick up stops at max', species({'n': 'T', 'abPick': {'k': 'a', 'from': ['DEX', 'WIS'], 'up': 2, 'max': 15}}), lambda C0, C1, D0, D1: ok(D1['score']['DEX'] == 15, 'DEX %s' % D1['score']['DEX']), {'ch': {'gx-a-species-Human': ['Dexterity']}})
case('v4 abDown with minimum 7', species({'n': 'T', 'abDown': [['INT', -4, 7]]}), lambda C0, C1, D0, D1: ok(D1['score']['INT'] == D0['score']['INT'] - 4, 'INT %s' % D1['score']['INT']))
case('v4 abDown stops at its minimum', species({'n': 'T', 'abDown': [['INT', -4, 10]]}), lambda C0, C1, D0, D1: ok(D1['score']['INT'] == 10, 'INT %s' % D1['score']['INT']))
# skill bonus from an ability modifier with a floor
case('v4 skillBonus row minimum (WIS 0, min 1)', species({'n': 'T', 'skillBonus': [['Arcana', 'WIS', 1]]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Arcana').get('misc') == 1, str(skill(C1, 'Arcana'))))
case('v4 skillBonus entry min:1 (CHA -1)', species({'n': 'T', 'min': 1, 'skillBonus': [['Persuasion', 'CHA']]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Persuasion').get('misc') == 1, str(skill(C1, 'Persuasion'))))
case('v4 skillBonus ability above the floor', species({'n': 'T', 'skillBonus': [['Athletics', 'STR', 1]]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Athletics').get('misc') == 3, str(skill(C1, 'Athletics'))))
# per-ability save bonus
case('v4 saveBonusAb only on that save', species({'n': 'T', 'saveBonusAb': [['INT', 1]]}), lambda C0, C1, D0, D1: ok(D1['save']['INT'] == D0['save']['INT'] + 1 and D1['save']['WIS'] == D0['save']['WIS'] and C1['saveBonus'][0]['ab'] == 'INT', json.dumps(C1.get('saveBonus'))))
# DC bonus on a feature note
case("v4 dcAdd {Monk's Focus: 2}", {'cls': {'Monk': [{'n': 'T', 'dcAdd': {"Monk's Focus": 2}}]}}, lambda C0, C1, D0, D1: ok('save DC 14' in json.dumps(C0) and 'save DC 16' in json.dumps(C1), 'no DC change'), {'cls': 'Monk', 'eqC': 'none', 'base': {'STR': 10, 'DEX': 14, 'CON': 13, 'INT': 8, 'WIS': 16, 'CHA': 8}, 'arr': {'STR': 10, 'DEX': 14, 'CON': 13, 'INT': 8, 'WIS': 16, 'CHA': 8}, 'bg2': 'DEX', 'bg1': 'WIS'})
# spell tables
case('v4 spells table gated by level', species({'n': 'T', 'spells': [[1, 'Shield'], [9, 'Fireball']]}), lambda C0, C1, D0, D1: ok(any(x['n'] == 'Shield' for x in C1['spells']) and not any(x['n'] == 'Fireball' for x in C1['spells']), [x['n'] for x in C1['spells']]))
case('v4 spells table ignores empty placeholders', species({'n': 'T', 'spells': [[1, ''], [1, ',Shield,']]}), lambda C0, C1, D0, D1: ok(any(x['n'] == 'Shield' for x in C1['spells']) and not any(not x['n'] for x in C1['spells']), [x['n'] for x in C1['spells']]))
# level-scaled attack and damage bonus, unarmed die, extra attack
case('v4 atkBonus steps on melee rows', species({'n': 'T', 'atkBonus': [{'when': 'melee', 'atk': [[1, 1], [5, 2]], 'dmg': [[5, 3]]}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Greatsword').get('misc', 0) == row(C0, 'Greatsword').get('misc', 0) + 2 and row(C1, 'Greatsword')['dmgBonus'] == row(C0, 'Greatsword')['dmgBonus'] + 3 and row(C1, 'Javelin').get('misc', 0) == row(C0, 'Javelin').get('misc', 0) + 2, json.dumps(row(C1, 'Greatsword'))))
case('v4 atkBonus ranged leaves melee rows alone', species({'n': 'T', 'atkBonus': [{'when': 'ranged', 'atk': 1}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Greatsword').get('misc', 0) == row(C0, 'Greatsword').get('misc', 0), 'melee row changed'))
case('v4 atkBonus ability + unarmed + crit note', species({'n': 'T', 'atkBonus': [{'when': ['unarmed', 'natural'], 'atk': 'STR', 'dmg': 'STR', 'crit': 19}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Unarmed Strike')['misc'] == 3 and row(C1, 'Unarmed Strike')['dmgBonus'] == 3 and 'Critical hit on 19-20' in row(C1, 'Unarmed Strike')['note'], json.dumps(row(C1, 'Unarmed Strike'))))
case('v4 unarmed die steps', species({'n': 'T', 'unarmed': {'die': [[1, '1d6'], [5, '1d8']], 't': 'Slashing'}}), lambda C0, C1, D0, D1: ok(row(C1, 'Unarmed Strike')['die'] == '1d8' and row(C1, 'Unarmed Strike')['type'] == 'Slashing', json.dumps(row(C1, 'Unarmed Strike'))))
case('v4 unarmed die never lowers Martial Arts', {'species': {'Human': [{'n': 'T', 'unarmed': {'die': '1d4'}}]}}, lambda C0, C1, D0, D1: ok(row(C1, 'Unarmed Strike')['die'] == row(C0, 'Unarmed Strike')['die'], row(C1, 'Unarmed Strike')['die']), {'cls': 'Monk', 'eqC': 'none'})
case('v4 extraAttack 2 changes the Attack action', species({'n': 'T', 'extraAttack': 2}), lambda C0, C1, D0, D1: ok(C1['actions'][0]['d'].startswith('Make two attacks') and C0['actions'][0]['d'].startswith('Make one attack'), C1['actions'][0]['d'][:60]), {'cls': 'Wizard', 'eqC': 'none'})
# AC: Dex cap, new cond values
case('v4 acBase Dex capped at 2 (15 + Dex max 2)', species({'n': 'T', 'acBase': [15, 'full'], 'acDexMax': 2, 'cond': 'noBody'}), lambda C0, C1, D0, D1: ok(D1['ac'] == 15 + 2 and C1['ac']['dex'] == 'max2', json.dumps(C1['ac'])), dict(NOARM, base={'STR': 15, 'DEX': 18, 'CON': 13, 'INT': 12, 'WIS': 10, 'CHA': 8}, arr={'STR': 15, 'DEX': 18, 'CON': 13, 'INT': 12, 'WIS': 10, 'CHA': 8}))
case('v4 cond heavy: Chain Mail worn', species({'n': 'T', 'acAdd': 1, 'cond': 'heavy'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 1, 'ac %s -> %s' % (acsum(C0), acsum(C1))))
case('v4 cond heavy: no armor', species({'n': 'T', 'acAdd': 1, 'cond': 'heavy'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0), 'counted without armor'), NOARM)
case('v4 cond lightNone: no armor', species({'n': 'T', 'acAdd': 1, 'cond': 'lightNone'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 1, 'not counted'), NOARM)
case('v4 cond lightNone: heavy armor', species({'n': 'T', 'acAdd': 1, 'cond': 'lightNone'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0), 'counted in heavy armor'))
case('v4 cond medium: Scale Mail', species({'n': 'T', 'acAdd': 1, 'cond': 'medium'}), lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 1, 'not counted'), {'inv': [{'n': 'Scale Mail', 'q': 1, 'eq': True}]})
# carrying capacity by field
case('v4 carryBump doubles capacity, size stays', species({'n': 'T', 'carryBump': True}), lambda C0, C1, D0, D1: ok(D1['carry'] == 2 * D0['carry'] and C1['size'] == C0['size'], 'carry %s -> %s size %s' % (D0['carry'], D1['carry'], C1['size'])))
# darkvision: stacking vs set
case('v4 darkNone gives 60 when none', species({'n': 'T', 'darkNone': 60, 'darkHave': {'to': 120}}), lambda C0, C1, D0, D1: ok(C1['darkvision'] == 60, C1['darkvision']), {'species': 'Human'})
case('v4 darkHave to 120 when Darkvision exists', {'species': {'Human': [{'n': 'A', 'darkAdd': 60}, {'n': 'T', 'darkNone': 60, 'darkHave': {'to': 120}}]}}, lambda C0, C1, D0, D1: ok(C1['darkvision'] == 120, C1['darkvision']))
case('v4 darkHave add 30 when Darkvision exists', {'species': {'Human': [{'n': 'A', 'darkAdd': 60}, {'n': 'T', 'darkNone': 60, 'darkHave': {'add': 30}}]}}, lambda C0, C1, D0, D1: ok(C1['darkvision'] == 90, C1['darkvision']))
case('v4 darkAdd stacks, darkTo sets', {'species': {'Human': [{'n': 'A', 'darkAdd': 30}, {'n': 'B', 'darkAdd': 30}, {'n': 'C', 'darkTo': 40}]}}, lambda C0, C1, D0, D1: ok(C1['darkvision'] == 60, C1['darkvision']))
# movement from Speed
case('v4 mv fly speed2 (double Speed)', species({'n': 'T', 'mv': {'fly': 'speed2'}}), lambda C0, C1, D0, D1: ok(C1['moves'][0]['v'] == 2 * C1['speed'], json.dumps(C1.get('moves'))))
# limited use rows from an entry
case('v4 lu pb uses per long rest', species({'n': 'T', 'lu': {'n': 'Zap', 'max': 'pb', 'reset': 'long'}}), lambda C0, C1, D0, D1: ok(len(res(C1, 'Zap')) == 1 and res(C1, 'Zap')[0]['max'] == 3 and res(C1, 'Zap')[0]['reset'] == 'long' and not res(C0, 'Zap'), json.dumps(res(C1, 'Zap'))))
case('v4 lu mod:WIS has at least 1 use', species({'n': 'T', 'lu': {'n': 'Zap', 'max': 'mod:WIS', 'reset': 'short'}}), lambda C0, C1, D0, D1: ok(res(C1, 'Zap')[0]['max'] == 1 and res(C1, 'Zap')[0]['reset'] == 'short', json.dumps(res(C1, 'Zap'))))
case('v4 lu array by level and dusk reset', {'cls': {'Fighter': [{'n': 'T', 'lu': [{'n': 'Zap', 'max': [0, 0, 0, 0, 2], 'reset': 'dusk'}, {'n': 'Zip', 'max': 1, 'reset': 'dawn'}]}]}}, lambda C0, C1, D0, D1: ok(res(C1, 'Zap')[0]['max'] == 2 and res(C1, 'Zap')[0]['reset'] == 'long' and res(C1, 'Zip')[0]['reset'] == 'long', json.dumps(res(C1, 'Zap'))))
case('v4 lu below the entry level gives nothing', cls({'n': 'T', 'l': 9, 'lu': {'n': 'Zap', 'max': 1}}), lambda C0, C1, D0, D1: ok(not res(C1, 'Zap'), 'row below l'))
# attunement limit from an entry
case('v4 attune 5 raises the limit', species({'n': 'T', 'attune': 5}), lambda C0, C1, D0, D1: ok(C1.get('attMax') == 5 and not C0.get('attMax'), str(C1.get('attMax'))))
# custom skills outside the 18
case('v4 custom skill Technology (proficiency + CON bonus min 1)', species({'n': 'T', 'skillProf': ['Technology'], 'skillBonus': [['Technology', 'CON', 1]]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Technology').get('p') == 1 and skill(C1, 'Technology')['ab'] == 'INT' and skill(C1, 'Technology').get('misc') == 2 and not any(s['n'] == 'Technology' for s in C0['skills']), json.dumps([s for s in C1['skills'] if s['n'] == 'Technology'])))
case('v4 custom skill Data via skillPE twice = Expertise', {'species': {'Human': [{'n': 'A', 'skillProf': ['Data']}, {'n': 'T', 'skillPE': ['Data']}]}}, lambda C0, C1, D0, D1: ok(skill(C1, 'Data').get('p') == 2, json.dumps(skill(C1, 'Data'))))
# proficiency-or-expertise pick as a gx pick
case('v4 skill pick (pe) on an entry', species({'n': 'T', 'pick': [{'k': 's', 't': 'pe', 'n': 1, 'title': 'Skill', 'from': ['Athletics', 'Arcana']}]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Athletics').get('p') == 2 and skill(C1, 'Arcana').get('p') != 2, 'pe pick'), {'ch': {'gx-s-species-Human': ['Athletics']}})
# third caster and class spell list expansion
case('v4 THIRD_SUBS makes a subclass a third caster', {'__third': {'Champion': {'list': 'Cleric', 'ab': 'WIS', 'cant': 2}}}, lambda C0, C1, D0, D1: ok(C1['spellcasting'] and C1['spellcasting']['ab'] == 'WIS' and not C0.get('spellcasting'), json.dumps(C1.get('spellcasting'))), {'sub': 'Champion'})
# ---- fx engine v5 (branch claude/w-eng2): dieReplace, reach, rangeMul, acCap, toolExpert, toolPE, skillBonusNp, chkBonusNp, saveProf, attackRow, pbAdd, slotAdd, exhLock
case('v5 dieReplace dice + type on the Greatsword row', species({'n': 'T', 'dieReplace': [{'when': 'Greatsword', 'd': '3d12', 't': 'Cold'}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Greatsword')['die'] == '3d12' and row(C1, 'Greatsword')['type'] == 'Cold' and row(C1, 'Javelin')['die'] == row(C0, 'Javelin')['die'] and '2d6' in row(C1, 'Greatsword')['dieSrc'], json.dumps(row(C1, 'Greatsword'))))
case('v5 dieReplace up:1 never lowers the die', species({'n': 'T', 'dieReplace': [{'when': 'Greatsword', 'd': '1d4', 'up': 1}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Greatsword')['die'] == row(C0, 'Greatsword')['die'], json.dumps(row(C1, 'Greatsword'))))
case('v5 dieReplace from: only rows with that die', species({'n': 'T', 'dieReplace': [{'when': 'weapon', 'from': '1d6', 'd': '2d6'}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Greatsword')['die'] == row(C0, 'Greatsword')['die'] and row(C1, 'Javelin')['die'] == '2d6', json.dumps([row(C1, 'Greatsword')['die'], row(C1, 'Javelin')['die']])))
case('v5 reach +5 on melee rows only', species({'n': 'T', 'reach': [{'when': 'melee', 'add': 5}]}), lambda C0, C1, D0, D1: ok(row(C0, 'Greatsword')['range'].startswith('5 ft') and row(C1, 'Greatsword')['range'].startswith('10 ft') and row(C1, 'Javelin')['range'] == '10 ft, 30/120 ft', json.dumps([row(C0, 'Greatsword')['range'], row(C1, 'Greatsword')['range'], row(C1, 'Javelin')['range']])))
case('v5 rangeMul 2 on ranged rows', species({'n': 'T', 'rangeMul': [{'when': 'ranged', 'mul': 2}]}), lambda C0, C1, D0, D1: ok(row(C0, 'Light Crossbow')['range'] == '80/320 ft' and row(C1, 'Light Crossbow')['range'] == '160/640 ft' and row(C1, 'Greatsword')['range'] == row(C0, 'Greatsword')['range'], json.dumps([row(C0, 'Light Crossbow')['range'], row(C1, 'Light Crossbow')['range']])), {'weps': ['Greatsword', 'Light Crossbow']})
case('v5 acCap caps an ability AC bonus (CON 13 gives +1; cap 0)', species({'n': 'T', 'acAb': 'DEX', 'acCap': 1}), lambda C0, C1, D0, D1: ok(D1['ac'] == D0['ac'] + 1, 'AC %s -> %s' % (D0['ac'], D1['ac'])))
case('v5 acCap on acAdd with an ability key', species({'n': 'T', 'acAdd': 'STR', 'acCap': 2}), lambda C0, C1, D0, D1: ok(D1['ac'] == D0['ac'] + 2, 'AC %s -> %s' % (D0['ac'], D1['ac'])))
case('v5 acCap above the value changes nothing', species({'n': 'T', 'acAdd': 'DEX', 'acCap': 5}), lambda C0, C1, D0, D1: ok(D1['ac'] == D0['ac'] + 2, 'AC %s -> %s' % (D0['ac'], D1['ac'])))
case('v5 toolExpert on a tool you know', {'species': {'Human': [{'n': 'A', 'tools': ["Thieves' Tools"]}, {'n': 'T', 'toolExpert': ["Thieves' Tools"]}]}}, lambda C0, C1, D0, D1: ok(C1['toolExp'][0]['n'] == "Thieves' Tools" and C1['toolExp'][0]['v'] == 6 and 'Expertise' in json.dumps(C1['profSrc']['tools']) and 'double your Proficiency Bonus' in json.dumps(C1['defenses']), json.dumps([C1.get('toolExp'), C1['profSrc']['tools']])))
case('v5 toolExpert without the proficiency does nothing', species({'n': 'T', 'toolExpert': ["Thieves' Tools"]}), lambda C0, C1, D0, D1: ok(not C1.get('toolExp') and "Thieves" not in C1['profs']['tools'], json.dumps(C1.get('toolExp'))))
case('v5 toolPE gives the proficiency first', species({'n': 'T', 'toolPE': ["Thieves' Tools"]}), lambda C0, C1, D0, D1: ok("Thieves' Tools" in C1['profs']['tools'] and not C1.get('toolExp'), json.dumps(C1['profs'])))
case('v5 toolPE twice = Expertise', {'species': {'Human': [{'n': 'A', 'toolPE': ["Thieves' Tools"]}, {'n': 'T', 'toolPE': ["Thieves' Tools"]}]}}, lambda C0, C1, D0, D1: ok(len(C1.get('toolExp') or []) == 1, json.dumps(C1.get('toolExp'))))
case('v5 skillBonusNp skips proficient skills', species({'n': 'T', 'skillBonusNp': [['Athletics', 1], ['Arcana', 1]]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Athletics').get('p') == 1 and not skill(C1, 'Athletics').get('misc') and skill(C1, 'Arcana').get('misc') == 1, json.dumps([skill(C1, 'Athletics'), skill(C1, 'Arcana')])))
case('v5 chkBonusNp halfPbUp on Dexterity skills', species({'n': 'T', 'chkBonusNp': [['DEX', 'halfPbUp']]}), lambda C0, C1, D0, D1: ok(skill(C1, 'Stealth').get('misc') == 2 and not skill(C1, 'Athletics').get('misc'), json.dumps([skill(C1, 'Stealth'), skill(C1, 'Athletics')])))
case('v5 saveProf adds a fixed save proficiency', species({'n': 'T', 'saveProf': ['WIS']}), lambda C0, C1, D0, D1: ok('WIS' in C1['saves'] and 'WIS' not in C0['saves'] and D1['save']['WIS'] == D0['save']['WIS'] + 3, json.dumps(C1['saves'])))
case('v5 saveProf keeps an existing proficiency source', species({'n': 'T', 'saveProf': ['STR']}), lambda C0, C1, D0, D1: ok(C1['saves']['STR'] == C0['saves']['STR'], json.dumps(C1['saves'])))
case('v5 attackRow granted by a feature', species({'n': 'T', 'attackRow': [{'n': 'Spike Bash', 'ab': 'STR', 'die': '1d6', 'type': 'Piercing', 'prof': True, 'bonus': 1}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Spike Bash')['die'] == '1d6' and row(C1, 'Spike Bash')['prof'] and row(C1, 'Spike Bash')['misc'] == 1 and row(C1, 'Spike Bash')['dmgBonus'] == 1 and row(C1, 'Spike Bash')['type'] == 'Piercing', json.dumps(row(C1, 'Spike Bash'))))
case('v5 attackRow prof by weapon name (Fighter has all Simple and Martial)', species({'n': 'T', 'attackRow': [{'n': 'Wind Blade', 'ab': 'best', 'die': '1d4', 'type': 'Slashing', 'prof': 'Martial'}, {'n': 'Odd Sting', 'ab': 'DEX', 'die': '1d4', 'type': 'Piercing', 'prof': 'Whip Dancer'}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Wind Blade')['prof'] is True and row(C1, 'Odd Sting')['prof'] is False, json.dumps([row(C1, 'Wind Blade'), row(C1, 'Odd Sting')])))
case('v5 attackRow without proficiency', species({'n': 'T', 'attackRow': [{'n': 'Odd Claw', 'ab': 'DEX', 'die': '1d4', 'type': 'Slashing', 'prof': False}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Odd Claw')['prof'] is False and row(C1, 'Odd Claw')['ab'] == 'DEX', json.dumps(row(C1, 'Odd Claw'))))
case('v5 attackRow row is seen by atkBonus melee', {'species': {'Human': [{'n': 'T', 'attackRow': [{'n': 'Spike Bash', 'ab': 'STR', 'die': '1d6', 'type': 'Piercing', 'prof': True}]}, {'n': 'U', 'atkBonus': [{'when': 'melee', 'atk': 1}]}]}}, lambda C0, C1, D0, D1: ok(row(C1, 'Spike Bash').get('misc') == 1, json.dumps(row(C1, 'Spike Bash'))))
case('v5 attackRow ranged range gives a ranged row', species({'n': 'T', 'attackRow': [{'n': 'Spit', 'ab': 'DEX', 'die': '1d6', 'type': 'Acid', 'range': '30/60 ft', 'prof': True}]}), lambda C0, C1, D0, D1: ok(row(C1, 'Spit')['gk'] == 'R', json.dumps(row(C1, 'Spit'))))
case('v5 pbAdd +1 raises PB, attack and saves', species({'n': 'T', 'pbAdd': 1}), lambda C0, C1, D0, D1: ok(D1['pb'] == D0['pb'] + 1 and C1.get('pbAdd') == 1 and D1['save']['STR'] == D0['save']['STR'] + 1 and D1['hpmax'] == D0['hpmax'], 'pb %s -> %s' % (D0['pb'], D1['pb'])))
case('v5 pbAdd off with the toggle off', species(tg({'n': 'T', 'pbAdd': 1})), lambda C0, C1, D0, D1: ok(D1['pb'] == D0['pb'] and not C1.get('pbAdd'), 'pb %s' % D1['pb']))
case('v5 pbAdd on with the toggle on', species(tg({'n': 'T', 'pbAdd': 1})), lambda C0, C1, D0, D1: ok(D1['pb'] == D0['pb'] + 1, 'pb %s' % D1['pb']), {'__fxT': {'t1': True}})
case('v5 pbAdd moves a "pb" value in another entry', {'species': {'Human': [{'n': 'A', 'pbAdd': 1}, {'n': 'B', 'skillBonus': [['Stealth', 'pb']]}]}}, lambda C0, C1, D0, D1: ok(skill(C1, 'Stealth').get('misc') == 4, json.dumps(skill(C1, 'Stealth'))))
WZ = {'cls': 'Wizard', 'eqC': 'none', 'eqB': 'none'}
case('v5 slotAdd level 9 only when you have one (Wizard 5: none)', species({'n': 'T', 'slotAdd': [{'lvl': 9, 'ifHave': 1}]}), lambda C0, C1, D0, D1: ok(C1['spellcasting']['slots'] == C0['spellcasting']['slots'], json.dumps(C1['spellcasting']['slots'])), WZ)
case('v5 slotAdd level 2 adds one slot', species({'n': 'T', 'slotAdd': [{'lvl': 2, 'n': 1}]}), lambda C0, C1, D0, D1: ok(C1['spellcasting']['slots'][1] == C0['spellcasting']['slots'][1] + 1, json.dumps(C1['spellcasting']['slots'])), WZ)
case('v5 slotAdd high with max 3 (Wizard 5 has level 3)', species({'n': 'T', 'slotAdd': [{'lvl': 'high', 'max': 3}]}), lambda C0, C1, D0, D1: ok(C1['spellcasting']['slots'][2] == C0['spellcasting']['slots'][2] + 1, json.dumps(C1['spellcasting']['slots'])), WZ)
case('v5 slotAdd on a non caster does nothing', species({'n': 'T', 'slotAdd': [{'lvl': 1}]}), lambda C0, C1, D0, D1: ok(not C1.get('spellcasting'), json.dumps(C1.get('spellcasting'))))
case('v5 exhLock sets the minimum Exhaustion', species({'n': 'T', 'exhLock': 3}), lambda C0, C1, D0, D1: ok(C1.get('exhMin') == 3 and D1.get('exh') == 3 and not C0.get('exhMin') and 'cannot be removed' in json.dumps(C1['defenses']), 'exhMin %s exh %s' % (C1.get('exhMin'), D1.get('exh'))))

# ---- multiclass: entries of a second class (fixtures; the base build is Fighter 5, mc adds the second class)
MC_W = {'cls': 'Fighter', 'level': 5, 'mc': [{'cls': 'Wizard', 'sub': '', 'lv': 3}]}
MC_WI = dict(MC_W, base={'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 16, 'WIS': 10, 'CHA': 8}, arr={'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 16, 'WIS': 10, 'CHA': 8})
MC_SW = dict(MC_WI, cls='Sorcerer', level=3, mc=[{'cls': 'Wizard', 'sub': '', 'lv': 2}], bg='Sage', bg2='INT', bg1='CON',
             base={'STR': 10, 'DEX': 14, 'CON': 13, 'INT': 15, 'WIS': 10, 'CHA': 14}, arr={'STR': 10, 'DEX': 14, 'CON': 13, 'INT': 15, 'WIS': 10, 'CHA': 14})
case('mc: hpLvl of a second-class entry uses that class level (3), not the character level (8)', {'cls': {'Wizard': [{'n': 'T', 'hpLvl': 2}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 6, 'hp %s -> %s' % (D0['hpmax'], D1['hpmax'])), MC_W)
case('mc: hp con+lvl of a second-class entry', {'cls': {'Wizard': [{'n': 'T', 'hp': 'con+lvl'}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + D1['mod']['CON'] + 3, 'hp %s -> %s' % (D0['hpmax'], D1['hpmax'])), MC_W)
case('mc: species hpLvl uses the character level (8)', species({'n': 'T', 'hpLvl': 1}), lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 8, 'hp %s -> %s' % (D0['hpmax'], D1['hpmax'])), MC_W)
case('mc: ac table of a second-class entry (class level 3)', {'cls': {'Wizard': [{'n': 'T', 'ac': [[1, 1], [3, 2], [5, 3]]}]}}, lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 2, 'AC %s -> %s' % (acsum(C0), acsum(C1))), MC_W)
case('mc: speed table of a second-class entry (class level 3)', {'cls': {'Wizard': [{'n': 'T', 'speed': [[1, 5], [3, 10], [6, 15]]}]}}, lambda C0, C1, D0, D1: ok(C1['speed'] == C0['speed'] + 10, 'speed %s -> %s' % (C0['speed'], C1['speed'])), MC_W)
case('mc: level gate l uses the class level of the second class', {'cls': {'Wizard': [{'n': 'T', 'l': 4, 'hpFlat': 50}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'], 'applied at Wizard 3 with l 4 (character level 8)'), MC_W)
case('mc: init pb uses the character level (8: PB 3)', {'cls': {'Wizard': [{'n': 'T', 'init': 'pb'}]}}, lambda C0, C1, D0, D1: ok(D1['init'] == D0['init'] + 3, 'init %s -> %s' % (D0['init'], D1['init'])), MC_W)
case('mc: toggle of a second-class entry, on', {'cls': {'Wizard': [tg({'n': 'T', 'acAdd': 2})]}}, lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) + 2 and tgids(C1) == ['t1'], 'ac %s -> %s %s' % (acsum(C0), acsum(C1), tgids(C1))), dict(MC_W, __fxT={'t1': True}))
case('mc: toggle of a second-class entry, off', {'cls': {'Wizard': [tg({'n': 'T', 'acAdd': 2})]}}, lambda C0, C1, D0, D1: ok(acsum(C1) == acsum(C0) and tgids(C1) == ['t1'], 'ac %s -> %s %s' % (acsum(C0), acsum(C1), tgids(C1))), MC_W)
case('mc: when pick of a second-class entry reads m0:key', {'cls': {'Wizard': [{'n': 'T', 'when': {'key': 'zz', 'val': 'x'}, 'hpFlat': 4}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'] + 4, 'when pick m0:zz not read'), dict(MC_W, ch={'m0:zz': 'x'}))
case('mc: when pick without the prefix does not count for the second class', {'cls': {'Wizard': [{'n': 'T', 'when': {'key': 'zz', 'val': 'x'}, 'hpFlat': 4}]}}, lambda C0, C1, D0, D1: ok(D1['hpmax'] == D0['hpmax'], 'main-class key used'), dict(MC_W, ch={'zz': 'x'}))
case('mc: saveFrom pick of a second-class entry', {'cls': {'Wizard': [{'n': 'T', 'saveFrom': 'sv'}]}}, lambda C0, C1, D0, D1: ok(C1['saves'].get('WIS') and not C0['saves'].get('WIS'), json.dumps(C1['saves'])), dict(MC_W, ch={'m0:sv': ['Wisdom']}))
case('mc: spells of a second-class cls entry use that class ability (spCls default = class)', {'cls': {'Wizard': [{'n': 'T', 'spells': [[1, 'Shield']]}]}}, lambda C0, C1, D0, D1: ok([s.get('ab') for s in C1['spells'] if s['n'] == 'Shield'] == ['INT'], json.dumps([(s['n'], s.get('ab')) for s in C1['spells']])), MC_SW)
case('mc: spells of a second-class cls entry, explicit spCls wins', {'cls': {'Wizard': [{'n': 'T', 'spells': [[1, 'Shield']], 'spCls': '@sub:CHA'}]}}, lambda C0, C1, D0, D1: ok([s.get('ab') for s in C1['spells'] if s['n'] == 'Shield'] == ['CHA'], json.dumps([(s['n'], s.get('ab')) for s in C1['spells']])), MC_SW)
case('mc: spells of a main-class cls entry use that class ability', {'cls': {'Sorcerer': [{'n': 'T', 'spells': [[1, 'Shield']]}]}}, lambda C0, C1, D0, D1: ok([s.get('ab') for s in C1['spells'] if s['n'] == 'Shield'] == ['CHA'], json.dumps([(s['n'], s.get('ab')) for s in C1['spells']])), MC_SW)
case('mc: spells of a second-class sub entry use the class of the sub (Evoker is a Wizard sub)', {'sub': {'Evoker': [{'n': 'T', 'l': 3, 'spells': [[3, 'Shield']]}]}}, lambda C0, C1, D0, D1: ok([s.get('ab') for s in C1['spells'] if s['n'] == 'Shield'] == ['INT'], json.dumps([(s['n'], s.get('ab')) for s in C1['spells']])), dict(MC_SW, mc=[{'cls': 'Wizard', 'sub': 'Evoker', 'lv': 3}]))
case('mc: spDc without spCls counts for every class, with spCls only for that class', {'cls': {'Wizard': [{'n': 'T', 'spDc': 2, 'spCls': 'Wizard'}]}}, lambda C0, C1, D0, D1: ok([x['dc'] for x in C1['spellcasting']['by'] if x['n'] == 'Wizard'][0] == [x['dc'] for x in C0['spellcasting']['by'] if x['n'] == 'Wizard'][0] + 2 and [x['dc'] for x in C1['spellcasting']['by'] if x['n'] == 'Sorcerer'][0] == [x['dc'] for x in C0['spellcasting']['by'] if x['n'] == 'Sorcerer'][0], json.dumps(C1['spellcasting']['by'])), MC_SW)


def main():
    fails, n = [], 0
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 1250, 'height': 850})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed && window.__bldNeed()")
        pg.wait_for_function("typeof window.__bldSheetFor==='function'", timeout=20000)

        def run(b, gx, fxT=None):
            pg.evaluate("g=>{window.FXO=g.__fxo||{};window.THIRD_SUBS=g.__third||undefined;window.GX=g}", gx)
            C = pg.evaluate("([b,t])=>window.__bldSheetFor(b,t)", [b, fxT])
            return C, pg.evaluate("c=>window.__deriveFor(c)", C)

        for name, gx, tweak, check in CASES:
            b = base_build()
            fxT = None
            for k, v in (tweak or {}).items():
                if k == '__fxT':
                    fxT = v
                elif k == 'ch':
                    b['ch'].update(v)
                else:
                    b[k] = v
            try:
                C0, D0 = run(b, {})
                C1, D1 = run(b, gx, fxT)
                err = check(C0, C1, D0, D1)
            except Exception as ex:
                err = 'exception %s' % ex
            n += 1
            if '--dump' in sys.argv or err:
                print(('FAIL ' if err else 'ok   ') + name + (' : ' + str(err) if err else ''))
            if err:
                fails.append(name)
        # picks: skills, lang, cantrip, tool
        b = base_build()
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'T', 'pick': [
            {'k': 'a', 't': 'skills', 'n': 1, 'title': 'Skill'}, {'k': 'b', 't': 'lang', 'n': 1, 'title': 'Language'},
            {'k': 'c', 't': 'cantrip', 'n': 1, 'title': 'Cantrip', 'cls': 'Wizard'}, {'k': 'd', 't': 'tool', 'n': 1, 'title': 'Tool', 'cats': ['art']}]}]}})
        ch = pg.evaluate("b=>window.__bldChoiceList(b)", b)
        keys = [c['key'] for c in ch if str(c['key']).startswith('gx-')]
        n += 1
        if len(keys) != 4:
            fails.append('picks: expected 4 gx choices, got %s' % keys)
        else:
            b['ch'][keys[0]] = ['Arcana']
            b['ch'][keys[1]] = ['Sylvan']
            b['ch'][keys[2]] = ['Light']
            b['ch'][keys[3]] = ["Smith's Tools"]
            C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
            n += 4
            if skill(C, 'Arcana').get('p') != 1:
                fails.append('pick skills: Arcana not proficient')
            if 'Sylvan' not in C['lang']:
                fails.append('pick lang')
            if not any(x['n'] == 'Light' for x in C.get('spells', [])):
                fails.append('pick cantrip')
            if "Smith" not in json.dumps(C['profSrc']):
                fails.append('pick tool')
        # cantrip pick with school filter (B1): only cantrips of that school are offered
        b = base_build()
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'S', 'pick': [
            {'k': 's', 't': 'cantrip', 'n': 1, 'title': 'Necro', 'school': 'Necromancy'}]}]}})
        ch = pg.evaluate("b=>window.__bldChoiceList(b)", b)
        sc = [c for c in ch if str(c['key']).startswith('gx-s-')]
        n += 2
        names = [x[0] if isinstance(x, list) else x for x in (sc[0].get('list') or [])] if sc else []
        if not names or 'Chill Touch' not in names or 'Fire Bolt' in names:
            fails.append('pick cantrip school: got %s' % names[:6])
        # multi pick that switches a second pick on (when): tool or language
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [
            {'n': 'M', 'pick': [{'k': 'mode', 't': 'multi', 'n': 1, 'title': 'Mode', 'list': [['Tool', ''], ['Language', '']]}]},
            {'n': 'M', 'when': {'key': 'gx-mode-species-Human', 'val': 'Language'}, 'pick': [{'k': 'l', 't': 'lang', 'n': 1, 'title': 'Lang'}]}]}})
        b = base_build()
        k0 = [c['key'] for c in pg.evaluate("b=>window.__bldChoiceList(b)", b) if str(c['key']).startswith('gx-')]
        b['ch']['gx-mode-species-Human'] = ['Language']
        k1 = [c['key'] for c in pg.evaluate("b=>window.__bldChoiceList(b)", b) if str(c['key']).startswith('gx-')]
        if k0 != ['gx-mode-species-Human'] or 'gx-l-species-Human' not in k1:
            fails.append('pick when: before %s after %s' % (k0, k1))
        # text pick (v3a): free text stored in B.ch as a string, shown as a Defenses line
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'X', 'pick': [{'k': 'tx', 't': 'text', 'n': 1, 'title': 'Spells', 'yc': 1, 'defT': 'Immunity', 'dpre': 'Spells'}]}]}})
        b = base_build()
        ch = [c for c in pg.evaluate("b=>window.__bldChoiceList(b)", b) if c['key'] == 'gx-tx-species-Human']
        n += 3
        if not ch or ch[0]['t'] != 'text':
            fails.append('text pick: not offered as t:text: %s' % ch)
        b['ch']['gx-tx-species-Human'] = 'Shield, Fireball'
        C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
        if 'Spells: Shield, Fireball' not in [x['v'] for x in C['defenses'] if x['t'] == 'Immunity']:
            fails.append('text pick: no Immunity line: %s' % json.dumps(C['defenses'])[:200])
        b['ch']['gx-tx-species-Human'] = ''
        C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
        if any('Spells' in x['v'] for x in C['defenses']):
            fails.append('text pick: empty text still shown')

        # ---- v3b: toggle entry keeps its pick while off
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'T', 'toggle': {'id': 't1', 'label': 'x'}, 'acAdd': 1, 'pick': [{'k': 'a', 't': 'skills', 'n': 1, 'title': 'Skill'}]}]}})
        n += 1
        k = [c['key'] for c in pg.evaluate("b=>window.__bldChoiceList(b)", base_build()) if str(c['key']).startswith('gx-a-')]
        if not k:
            fails.append('toggle off hides its pick')
        # ---- v3b: pickLv (one pick per level, level gated) with abUpPick
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'Asc', 'abUpPick': {'max': 20}, 'pickLv': [
            {'lv': 2, 'k': 'u2', 't': 'multi', 'n': 1, 'title': 'L2', 'list': [['STR +2', ''], ['DEX +1, CON +1', '']]},
            {'lv': 4, 'k': 'u4', 't': 'multi', 'n': 1, 'title': 'L4', 'list': [['STR +2', ''], ['DEX +1, CON +1', '']]},
            {'lv': 9, 'k': 'u9', 't': 'multi', 'n': 1, 'title': 'L9', 'list': [['STR +2', '']]}]}]}})
        b = base_build()
        keys = [c['key'] for c in pg.evaluate("b=>window.__bldChoiceList(b)", b) if str(c['key']).startswith('gx-u')]
        n += 1
        if keys != ['gx-u2-species-Human', 'gx-u4-species-Human']:
            fails.append('pickLv: level 5 should offer u2 and u4 only, got %s' % keys)
        b['ch']['gx-u2-species-Human'] = ['STR +2']
        b['ch']['gx-u4-species-Human'] = ['DEX +1, CON +1']
        b['ch']['gx-u9-species-Human'] = ['STR +2']
        C0 = pg.evaluate("b=>window.__bldSheetFor(Object.assign({},b,{ch:{}}))", b)
        C1 = pg.evaluate("b=>window.__bldSheetFor(b)", b)
        D0 = pg.evaluate("c=>window.__deriveFor(c)", C0)
        D1 = pg.evaluate("c=>window.__deriveFor(c)", C1)
        n += 1
        d = {a: D1['score'][a] - D0['score'][a] for a in ABIL_K}
        if d != {'STR': 2, 'DEX': 1, 'CON': 1, 'INT': 0, 'WIS': 0, 'CHA': 0}:
            fails.append('pickLv abUpPick: %s (level 9 pick must not count at level 5)' % d)
        # the maximum: STR 15 + background 2 = 17, base raised to 19 here, +2 stops at 20
        b['ch'] = {'gx-u2-species-Human': ['STR +2']}
        b['base']['STR'] = 17
        C2 = pg.evaluate("b=>window.__bldSheetFor(b)", b)
        D2 = pg.evaluate("c=>window.__deriveFor(c)", C2)
        n += 1
        if D2['score']['STR'] != 20:
            fails.append('abUpPick maximum 20: STR %s' % D2['score']['STR'])
        # ---- v3b: item pick adds inventory rows, and removes them when the pick changes
        pg.evaluate("ids=>ids.forEach(k=>window.__setSrc(k,true))", ['dmg', 'tsdm'])
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'Gr', 'pick': [{'k': 'g', 't': 'item', 'n': 2, 'title': 'Grafts', 'list': [['Black Box', ''], ['Heart of Steel', ''], ['No Such Item Xyz', '']]}]}]}})
        b = base_build()
        b['src']['tsdm'] = True
        gk = 'gx-g-species-Human'
        ch = [c for c in pg.evaluate("b=>window.__bldChoiceList(b)", b) if c['key'] == gk]
        n += 1
        if not ch or ch[0]['t'] != 'multi':
            fails.append('item pick: not offered as a choice')
        b['ch'][gk] = ['Black Box', 'No Such Item Xyz']
        C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
        names = [x['n'] for x in C['inv']]
        n += 2
        if 'Black Box' not in names:
            fails.append('item pick: Black Box not in inventory %s' % names)
        if 'No Such Item Xyz' in names:
            fails.append('item pick: an unknown item was added (must stay record-only)')
        b['ch'][gk] = ['Heart of Steel']
        C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
        names = [x['n'] for x in C['inv']]
        n += 2
        if 'Black Box' in names or 'Heart of Steel' not in names:
            fails.append('item pick change: inventory %s' % names)
        # removed by the player by hand: it does not come back while the pick is unchanged; a plain item of the player is never removed
        b2 = pg.evaluate("b=>{const k=structuredClone(b);window.__bldSheetFor(k);return k}", b)
        # ---- v3b: Masterwork row flag (cond mwArmor)
        MWGX = {'species': {'Human': [{'n': 'Mw', 'cond': 'mwArmor', 'acAdd': 3}]}}
        for flag, want in ((None, 0), (1, 3)):
            b = base_build()
            b['inv'] = [{'n': 'Chain Mail', 'q': 1, 'eq': True}]
            if flag:
                b['inv'][0]['mw'] = 1
            pg.evaluate("g=>{window.GX=g}", MWGX)
            C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
            C0 = pg.evaluate("b=>{window.GX={};return window.__bldSheetFor(b)}", b)
            n += 1
            if acsum(C) - acsum(C0) != want or bool(C['inv'][[x['n'] for x in C['inv']].index('Chain Mail')].get('mw')) != bool(flag):
                fails.append('mw flag %s: ac %s vs %s' % (flag, acsum(C), acsum(C0)))
        # ---- v4: abPick offers its own pick (list = the abilities), spListAdd pseudo lists, third caster lists, SAVE_NOTES owner
        b = base_build()
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'L', 'abPick': {'k': 'a', 'from': ['INT', 'CHA'], 'set': 22}}]}})
        chs = [c for c in pg.evaluate("b=>window.__bldChoiceList(b)", b) if c['key'] == 'gx-a-species-Human']
        n += 1
        if not chs or chs[0]['t'] != 'multi' or chs[0]['list'] != ['Intelligence', 'Charisma']:
            fails.append('abPick: own pick not offered %s' % chs)
        b = base_build()
        b['cls'] = 'Wizard'
        b['eqC'] = 'none'
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'L', 'spListAdd': [{'cls': 'Wizard', 'spells': ['Foresight']}, {'cls': 'Cleric', 'spells': ['Time Stop']}, {'from': 'Cleric', 'school': 'Divination', 'lvl': 1}]}]}})
        both = pg.evaluate("b=>{window.__bldTestSet(b);try{const xl=window.__bldXl();return {xl:xl,mem:{fs:SPELLS.filter(x=>x[0]==='Foresight')[0][3],ts:SPELLS.filter(x=>x[0]==='Time Stop')[0][3],dv:SPELLS.filter(x=>x[2]==='Divination'&&x[1]===1&&x[3].indexOf('Cleric')>=0).map(x=>x[3].some(c=>c.indexOf('fx:species:Human:0:2')===0))}}}finally{window.__bldTestSet(null)}}", b)
        xl = both['xl']
        names = xl[0]['xl'] if xl else []
        n += 3
        if 'fx:species:Human:0:0' not in names or not any(x.startswith('fx:species:Human:0:2') for x in names) or any(x.startswith('fx:species:Human:0:1') for x in names):
            fails.append('spListAdd: lists of the Wizard %s' % names)
        mem = both['mem']
        if 'fx:species:Human:0:0' not in mem['fs'] or any(m.startswith('fx:species:Human:0:1') for m in mem['ts']) or not mem['dv'] or not all(mem['dv']):
            fails.append('spListAdd: spell rows %s' % mem)
        pg.evaluate("g=>{window.GX=g}", {})
        xl = pg.evaluate("b=>{window.__bldTestSet(b);try{return window.__bldXl()}finally{window.__bldTestSet(null)}}", b)
        n += 1
        if any(x.startswith('fx:') for x in xl[0]['xl']):
            fails.append('spListAdd: lists stay on without the entry %s' % xl[0]['xl'])
        b = base_build()
        b['sub'] = 'Champion'
        pg.evaluate("g=>{window.THIRD_SUBS=g;window.GX={}}", {'Champion': {'list': 'Cleric', 'ab': 'WIS', 'cant': 2}})
        xl = pg.evaluate("b=>{window.__bldTestSet(b);try{return window.__bldXl()}finally{window.__bldTestSet(null)}}", b)
        pg.evaluate("()=>{window.THIRD_SUBS=undefined}")
        n += 1
        if not xl or xl[0]['list'] != 'Cleric' or xl[0]['ab'] != 'WIS':
            fails.append('THIRD_SUBS: caster part %s' % xl)
        # no re-entry blow-up: gfx reads choices, choices read casterParts, casterParts read gfx(true) (dmXl) and attMax. A level 20 caster must build fast
        import time
        b = base_build()
        b['cls'] = 'Wizard'
        b['sub'] = 'Evoker'
        b['level'] = 20
        b['eqC'] = 'none'
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'L', 'spListAdd': {'cls': 'Wizard', 'spells': ['Foresight']}, 'attune': 4}]}})
        t0 = time.time()
        for _ in range(3):
            pg.evaluate("b=>window.__bldSheetFor(b)", b)
        n += 1
        if time.time() - t0 > 10:
            fails.append('level 20 Wizard with spListAdd + attune: %.1f s for 3 sheets (re-entry loop?)' % (time.time() - t0))
        # prepAdd / cantAdd: extra prepared spells and cantrips, limited by spCls
        b = base_build()
        b['cls'] = 'Wizard'
        b['eqC'] = 'none'
        cnt = "b=>{window.__bldTestSet(b);try{return window.__bldSpCnt()}finally{window.__bldTestSet(null)}}"
        pg.evaluate("g=>{window.GX=g}", {})
        c0 = pg.evaluate(cnt, b)
        pg.evaluate("g=>{window.GX=g}", {'species': {'Human': [{'n': 'P', 'prepAdd': 'pb', 'cantAdd': 1}, {'n': 'Q', 'prepAdd': 5, 'spCls': 'Cleric'}]}})
        c1 = pg.evaluate(cnt, b)
        n += 2
        if c1[0]['pr'] != c0[0]['pr'] + 3 or c1[0]['ct'] != c0[0]['ct'] + 1:
            fails.append('prepAdd/cantAdd: %s -> %s' % (c0, c1))
        pg.evaluate("g=>{window.GX=g}", {'cls': {'Wizard': [{'n': 'P', 'prepAdd': [[1, 1], [5, 2]]}], 'Fighter': [{'n': 'Z', 'prepAdd': 9}]}})
        c1 = pg.evaluate(cnt, b)
        if c1[0]['pr'] != c0[0]['pr'] + 2:
            fails.append('prepAdd steps (class entry): %s -> %s' % (c0, c1))
        # SAVE_NOTES with an owner (4th item): the Elf row does not count for a Human, the row without an owner keeps the old match by name
        pg.evaluate("()=>{SAVE_NOTES.push(['trait','Resourceful','Note A','Human'],['trait','Resourceful','Note B','Elf'],['trait','Skillful','Note C'])}")
        try:
            C = pg.evaluate("b=>window.__bldSheetFor(b)", base_build())
        finally:
            pg.evaluate("()=>{SAVE_NOTES.length-=3}")
        tx = [x['t'] for x in C.get('saveNotes') or []]
        n += 3
        if 'Note A' not in tx or 'Note B' in tx or 'Note C' not in tx:
            fails.append('SAVE_NOTES owner: %s' % tx)
        # ---- multiclass with the real data (a fresh page: the fixtures above replaced window.GX)
        pg2 = br.new_page(viewport={'width': 1250, 'height': 850})
        pg2.set_default_timeout(180000)
        pg2.on('pageerror', lambda e: errs.append(str(e)))
        pg2.goto('file://' + ROOT + '/index.html')
        pg2.wait_for_timeout(1500)
        pg2.evaluate("window.__bldNeed && window.__bldNeed()")
        pg2.wait_for_function("typeof window.__bldSheetFor==='function'", timeout=20000)
        pg2.evaluate("ids=>ids.forEach(k=>window.__setSrc(k,true))", ['tvss'])

        def mcb(cls, level, mc, ch=None, inv=None):
            b = base_build()
            b.update({'cls': cls, 'level': level, 'mc': mc, 'ch': ch or {}, 'eqC': 'none', 'eqB': 'none'})
            b['src'] = {'core': True, 'tvss': True}
            if inv:
                b['inv'] = inv
            return b
        CM = [{'n': 'Chain Mail', 'q': 1, 'eq': True}]
        KN = [{'cls': 'Warmage', 'sub': 'House of Knights', 'lv': 7}]
        # a class without an MC_GRANT entry (Warmage) as a second class used to throw in toSheet
        try:
            Cw = pg2.evaluate("b=>window.__bldSheetFor(b)", mcb('Fighter', 5, KN, {'m0:sfs7': 'Defense'}, CM))
            err = ''
        except Exception as ex:
            Cw, err = None, str(ex)[:160]
        n += 1
        if err:
            fails.append('Warmage as second class throws: %s' % err)
        # fsPick on the subclass of a second class: the choice m0:sfs7 exists, and not before Warmage 7
        for lv, want in ((7, True), (6, False)):
            keys = [c['key'] for c in pg2.evaluate("b=>window.__bldChoiceList(b)", mcb('Fighter', 5, [{'cls': 'Warmage', 'sub': 'House of Knights', 'lv': lv}], None, CM))]
            n += 1
            if ('m0:sfs7' in keys) != want:
                fails.append('fsPick m0:sfs7 offered=%s at Warmage %d, expected %s' % ('m0:sfs7' in keys, lv, want))
        if Cw:
            D = pg2.evaluate("c=>window.__deriveFor(c)", Cw)
            n += 1
            if D['ac'] != 17:
                fails.append('fsPick Defense in the second class: AC %s expected 17 (Chain Mail 16 + 1)' % D['ac'])
        # the same Fighting Style feat from two classes counts once
        for fs1, want in (('Defense', 17), ('Archery', 17), (None, 17)):
            C2 = pg2.evaluate("b=>window.__bldSheetFor(b)", mcb('Fighter', 5, KN, dict({'m0:sfs7': 'Defense'}, **({'fs1': fs1} if fs1 else {})), CM))
            n += 1
            if acsum(C2) != want:
                fails.append('Defense from two picks (fs1=%s): AC %s expected %s' % (fs1, acsum(C2), want))
        # Attacks per Action on the sheet: Extra Attack from several classes does not add up, Two Extra Attacks is the Fighter exception
        def apa(b):
            C = pg2.evaluate("b=>window.__bldSheetFor(b)", b)
            pg2.evaluate("c=>window.__sheetApply(c,'t')", C)
            pg2.wait_for_timeout(400)
            return pg2.evaluate("()=>{const e=[...document.querySelectorAll('.apa')].map(x=>x.textContent).filter(Boolean);return e.length?e[e.length-1]:''}")
        for nm, b, want in (('Fighter 5 + Paladin 5', mcb('Fighter', 5, [{'cls': 'Paladin', 'sub': '', 'lv': 5}]), 2),
                            ('Fighter 11 + Barbarian 5', mcb('Fighter', 11, [{'cls': 'Barbarian', 'sub': '', 'lv': 5}]), 3),
                            ('Barbarian 5 + Monk 5', mcb('Barbarian', 5, [{'cls': 'Monk', 'sub': '', 'lv': 5}]), 2),
                            ('Fighter 4 + Paladin 4', mcb('Fighter', 4, [{'cls': 'Paladin', 'sub': '', 'lv': 4}]), 1)):
            got = apa(b)
            n += 1
            if ('Attacks per Action: %d' % want) not in got:
                fails.append('Attacks per Action %s: "%s" expected %d' % (nm, got, want))
        br.close()
        if errs:
            fails.append('page errors: ' + '; '.join(errs[:3]))
    if fails:
        print('fx_engine FAIL (%d of %d)' % (len(fails), n))
        for f in fails:
            print('  -', f)
        sys.exit(1)
    print('fx_engine OK: %d checks' % n)


main()
