// Turns 5etools action text into plain objects the battle engine can run.
// Anything it cannot read becomes {kind:"manual", text} so the player rolls it by hand.
const strip = (t) => t.replace(/\{@[a-zA-Z]+ ([^}|]*)(?:\|[^}]*)?\}/g, "$1").replace(/\{@h\}/g, "");
const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 };

function damages(text) {
  const out = [];
  const re = /\{@(?:damage|dice) ([^}|]+)(?:\|[^}]*)?\}\)?\s*([A-Za-z]+)? ?damage/g;
  let m;
  while ((m = re.exec(text))) {
    const type = (m[2] || "").toLowerCase() || null;
    out.push({ dice: m[1].trim(), type });
  }
  return out;
}

export function parseAction(a) {
  const name = strip(a.name || "");
  const text = (a.entries || []).filter((x) => typeof x === "string").join(" ");
  if (/^Multiattack/i.test(name)) {
    const attacks = [];
    const re = /\b(one|two|three|four|five|six|seven|eight)\s+([A-Z][A-Za-z' ]*?)\s+attacks?\b/g;
    let m;
    while ((m = re.exec(strip(text)))) attacks.push({ name: m[2].trim(), count: NUM[m[1]] });
    const cb = strip(text).match(/makes (one|two|three|four) attacks?, using ([A-Z][A-Za-z' ]*?) (?:or|and) ([A-Z][A-Za-z' ]*?) in any combination/);
    if (cb) return { kind: "multiattack", name, pick: { count: NUM[cb[1]], from: [cb[2].trim(), cb[3].trim()] }, attacks, text: strip(text) };
    return attacks.length ? { kind: "multiattack", name, attacks, text: strip(text) } : { kind: "manual", name, text: strip(text) };
  }
  const plain = strip(text);
  const ref = plain.match(/^(?:The [a-z ]+? )?(?:(?:can )?moves? up to [A-Za-z ]+?, and it )?makes (one|two|three) ([A-Z][A-Za-z' ]*?) attacks?\.?$/);
  if (ref) return { kind: "use", name, uses: [{ name: ref[2].trim(), count: NUM[ref[1]] }], text: plain };
  const combo = plain.match(/makes (one|two|three|four) attacks?, using ([A-Z][A-Za-z' ]*?) (?:or|and) ([A-Z][A-Za-z' ]*?) in any combination/);
  if (combo) return { kind: "multiattack", name, pick: { count: NUM[combo[1]], from: [combo[2].trim(), combo[3].trim()] }, attacks: [], text: plain };
  const cast = text.match(/uses Spellcasting to cast \{@spell ([^}|]+)/i);
  if (cast) return { kind: "cast", name, spell: cast[1].trim(), text: plain };
  const atk = text.match(/\{@atkr? ?([mr,]+)\}|\{@atkr ([mr,]+)\}/);
  const hit = text.match(/\{@hit (-?\d+)\}/);
  if (atk && hit) {
    const kinds = (atk[1] || atk[2] || "").split(",");
    const reach = text.match(/reach (\d+) ft/);
    const range = text.match(/range (\d+)(?:\/(\d+))? ft/);
    const d = damages(text);
    if (!d.length) { const f = text.match(/\{@h\}(\d+) ([A-Za-z]+) damage/); if (f) d.push({ dice: f[1], type: f[2].toLowerCase() }); }
    if (d.length) {
      return {
        kind: "attack", name: strip(name).replace(/ \(.*\)$/, ""), melee: kinds.includes("m"), ranged: kinds.includes("r"),
        hit: +hit[1], reach: reach ? +reach[1] : null, range: range ? [+range[1], range[2] ? +range[2] : +range[1]] : null, damage: d,
      };
    }
  }
  const sv = text.match(/\{@actSave (str|dex|con|int|wis|cha)\}\s*\{@dc (\d+)\}/);
  if (sv) {
    const parts = text.split(/\{@actSaveFail\}/);
    const fail = parts[1] ? damages(parts[1].split(/\{@actSaveSuccess\}/)[0]) : damages(text);
    const half = /\{@actSaveSuccess\}[^.]*Half damage/i.test(text);
    return { kind: "save", name: strip(name).replace(/ \{@recharge.*$/, ""), ability: sv[1], dc: +sv[2], damage: fail, halfOnSave: half, recharge: /@recharge/.test(a.name || "") };
  }
  return { kind: "manual", name, text: strip(text) };
}

export function parseMonster(m) {
  return {
    name: m.name,
    actions: (m.action || []).map(parseAction),
    bonus: (m.bonus || []).map(parseAction),
    reactions: (m.reaction || []).map(parseAction),
    legendary: (m.legendary || []).map(parseAction),
  };
}
