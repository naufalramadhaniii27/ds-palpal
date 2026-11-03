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
NOARM = {'eqC': 'none', 'eqB': 'none'}


def case(name, gx, check, tweak=None):
    CASES.append((name, gx, tweak, check))


def species(e):
    return {'species': {'Human': [e]}}


def cls(e):
    return {'cls': {'Fighter': [e]}}


def ok(cond, msg):
    return '' if cond else msg


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

        def run(b, gx):
            pg.evaluate("g=>{window.FXO=g.__fxo||{};window.GX=g}", gx)
            C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
            return C, pg.evaluate("c=>window.__deriveFor(c)", C)

        for name, gx, tweak, check in CASES:
            b = base_build()
            for k, v in (tweak or {}).items():
                if k == 'ch':
                    b['ch'].update(v)
                else:
                    b[k] = v
            try:
                C0, D0 = run(b, {})
                C1, D1 = run(b, gx)
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
