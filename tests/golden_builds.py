#!/usr/bin/env python3
"""Golden tests: reference builds with numbers fixed from the 2024 books.
Run: python3 tests/golden_builds.py [--root DIR]
Part 1: formula checks for the 12 core classes at levels 1/5/10/20
        (HP, proficiency bonus, saving throw proficiencies).
Part 2: fixed reference builds (tests/golden/builds/*.json) with expected values. An expect key "C:path" reads the sheet (C), "D:path" the derived numbers (D), value "~text" = contains.
Exit code 1 on any mismatch."""
import json, os, sys
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
if '--root' in sys.argv:
    ROOT = os.path.abspath(sys.argv[sys.argv.index('--root') + 1])

# class: (hit die, saves, a subclass that exists in PHB 2024)
CORE = {
    'Barbarian': (12, 'STR CON', 'Path of the Berserker'),
    'Bard': (8, 'DEX CHA', 'College of Lore'),
    'Cleric': (8, 'WIS CHA', 'Life Domain'),
    'Druid': (8, 'INT WIS', 'Circle of the Land'),
    'Fighter': (10, 'STR CON', 'Champion'),
    'Monk': (8, 'STR DEX', 'Warrior of the Open Hand'),
    'Paladin': (10, 'WIS CHA', 'Oath of Devotion'),
    'Ranger': (10, 'STR DEX', 'Hunter'),
    'Rogue': (8, 'DEX INT', 'Thief'),
    'Sorcerer': (6, 'CON CHA', 'Draconic Sorcery'),
    'Warlock': (8, 'WIS CHA', 'Fiend Patron'),
    'Wizard': (6, 'INT WIS', 'Evoker'),
}
ABIL = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']


def pb_of(lv):
    return 2 + (lv - 1) // 4


def base_build():
    return {
        'name': 'Golden', 'species': 'Human', 'bg': 'Soldier', 'bgMode': '21', 'bg2': 'STR', 'bg1': 'CON',
        'cls': 'Fighter', 'sub': '', 'level': 1,
        'base': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 12, 'WIS': 10, 'CHA': 8},
        'ch': {}, 'src': {'core': True}, 'method': 'array',
        'arr': {'STR': 15, 'DEX': 14, 'CON': 13, 'INT': 12, 'WIS': 10, 'CHA': 8},
        'hb': False, 'armor': '', 'shield': False, 'weps': [], 'eqC': 'A', 'eqB': 'B', 'size': 'Medium',
    }


def main():
    fails = []
    n = 0
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 1250, 'height': 850})
        errs = []; pg.set_default_timeout(180000)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('file://' + ROOT + '/index.html')
        pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed && window.__bldNeed()")
        pg.wait_for_function("typeof window.__bldSheetFor==='function'", timeout=20000)

        def run(b):
            C = pg.evaluate("b=>window.__bldSheetFor(b)", b)
            return C, pg.evaluate("c=>window.__deriveFor(c)", C)

        # part 1
        for cls, (hd, saves, sub) in CORE.items():
            for lv in (1, 5, 10, 20):
                b = base_build()
                b['cls'] = cls
                b['level'] = lv
                b['sub'] = sub if lv >= 3 else ''
                C, D = run(b)
                con = D['mod']['CON']
                exp_hp = hd + con + (lv - 1) * (hd // 2 + 1 + con)
                sv = saves.split()
                aura = 0
                if cls == 'Sorcerer' and lv >= 3:
                    exp_hp += lv  # Draconic Resilience: +1 HP per Sorcerer level
                if cls == 'Monk' and lv >= 14:
                    sv = ABIL  # Disciplined Survivor
                if cls == 'Rogue' and lv >= 15:
                    sv = sv + ['WIS', 'CHA']  # Slippery Mind
                if cls == 'Paladin' and lv >= 6:
                    aura = max(1, D['mod']['CHA'])  # Aura of Protection
                n += 3
                if D['hpmax'] != exp_hp:
                    fails.append(f'{cls} {lv}: HP {D["hpmax"]} expected {exp_hp}')
                if D['pb'] != pb_of(lv):
                    fails.append(f'{cls} {lv}: PB {D["pb"]} expected {pb_of(lv)}')
                for a in ABIL:
                    exp = D['mod'][a] + (pb_of(lv) if a in sv else 0) + aura
                    if D['save'][a] != exp:
                        fails.append(f'{cls} {lv}: save {a} {D["save"][a]} expected {exp}')
                        break

        # part 2
        gdir = os.path.join(HERE, 'golden', 'builds')
        for fn in sorted(os.listdir(gdir)) if os.path.isdir(gdir) else []:
            if not fn.endswith('.json'):
                continue
            g = json.load(open(os.path.join(gdir, fn)))
            pg.evaluate("ids=>ids.forEach(k=>window.__setSrc(k,true))", [k for k, v in g['build']['src'].items() if v and k != 'core'])
            C, D = run(g['build'])
            for k, v in g['expect'].items():
                n += 1
                if k[:2] in ('C:', 'D:'):
                    # path into the sheet (C:) or the derived numbers (D:), e.g. "C:speedSrc", "D:skill.14". A string value starting with "~" means: the JSON of that part contains the text
                    got = C if k[0] == 'C' else D
                    for part in k[2:].split('.'):
                        if isinstance(got, list):
                            got = got[int(part)] if part.isdigit() and int(part) < len(got) else None
                        else:
                            got = got.get(part) if isinstance(got, dict) else None
                    if isinstance(v, str) and v.startswith('~'):
                        ok = v[1:] in json.dumps(got)
                    else:
                        ok = got == v
                    if not ok:
                        fails.append(f'{fn}: {k} = {json.dumps(got)[:160]} expected {v} ({g.get("why","")})')
                    continue
                got = D.get(k)
                if got != v:
                    fails.append(f'{fn}: {k} = {got} expected {v} ({g.get("why","")})')
            # a dotted path also walks lists by their n or m key (e.g. skills.History.p, moves.climb.v). A missing value reads as null.
            # expectC: list of {"path","has"|"eq"|"in"} or dict path -> value ({"in": text} = text occurs in JSON of the value)
            ec = g.get('expectC') or []
            if isinstance(ec, dict):
                ec = [({'path': p, 'in': v['in']} if isinstance(v, dict) and 'in' in v else {'path': p, 'eq': v}) for p, v in ec.items()]
            for c in ec:
                n += 1
                cur = C
                for part in c['path'].split('.'):
                    if isinstance(cur, list):
                        cur = next((x for x in cur if isinstance(x, dict) and part in (x.get('n'), x.get('m'))), None)
                    elif isinstance(cur, dict):
                        cur = cur.get(part)
                    else:
                        cur = None
                    if cur is None:
                        break
                if 'has' in c:
                    good = isinstance(cur, list) and any(isinstance(x, dict) and all(x.get(a) == b for a, b in c['has'].items()) for x in cur)
                elif 'in' in c:
                    good = c['in'] in json.dumps(cur)
                else:
                    good = cur == c['eq']
                if not good:
                    fails.append(f'{fn}: C.{c["path"]} = {json.dumps(cur)[:160]} expected {json.dumps(c.get("has", c.get("in", c.get("eq"))))} ({g.get("why","")})')
        br.close()
        if errs:
            fails.append('page errors: ' + '; '.join(errs[:3]))
    if fails:
        print('golden FAIL (%d of %d checks)' % (len(fails), n))
        for f in fails:
            print('  -', f)
        sys.exit(1)
    print('golden OK: %d checks' % n)


main()
