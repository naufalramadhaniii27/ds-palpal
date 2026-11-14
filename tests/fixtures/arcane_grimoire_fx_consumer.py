"""Compile exact actual native rest consumer code for isolated FX-page evaluation."""
from pathlib import Path
def actual_rest_consumer(root):
 r=Path(root)
 read=lambda p:(r/'src'/p).read_text()
 def noimports(s):return '\n'.join(line.replace('export ','') for line in s.splitlines() if not line.startswith('import '))
 def line(p,n):
  found=[s for s in read(p).splitlines() if s.startswith('function '+n+'(') or s.startswith('export function '+n+'(')]
  assert len(found)==1,(p,n)
  return found[0].replace('export ','')
 tce=noimports(read('data/lib/tce-spell-bonus-profiles.js'))
 profiles=noimports(read('data/lib/arcane-grimoire-recovery-profiles.js'))
 source=noimports(read('data/lib/arcane-grimoire-recovery-source.js'))+'\n'+line('data/lib/attunement.js','itemQuantity')
 code='''const tce=(()=>{%s;return {canonicalTceSpellBonus};})();
 const canonicalTceSpellBonus=tce.canonicalTceSpellBonus;
 const profiles=(()=>{%s;return {arcaneGrimoireRecoveryProfile,canonicalArcaneGrimoireDefinition};})();
 const sourceBonus=(()=>{const arcaneGrimoireRecoveryProfile=profiles.arcaneGrimoireRecoveryProfile,canonical=profiles.canonicalArcaneGrimoireDefinition;%s;return arcaneGrimoireRecoveryBonus;})();
 const S=state||{used:{}},D=window.__deriveFor(C,S);
 %s
 return recList();'''%(tce,profiles,source,'\n'.join([line('app/05-logic-helpers.js','num'),line('app/05-logic-helpers.js','clamp'),line('app/08-ui-render-sheet-and-actions.js','used'),line('app/32b-logic-play-concentration-casting.js','clsLvls'),line('app/32b-logic-play-concentration-casting.js','lvOf'),line('app/32aa-logic-arcane-grimoire-recovery.js','arcaneGrimoireRecoveryBonus'),line('app/32d-logic-play-hp-rest-recovery.js','recList')]))
 return code
