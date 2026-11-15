"""Actual native resource balance and ordinary-cast exclusion consumers for FX snapshots."""
from pathlib import Path
def actual_instrument_consumer(root):
 r=Path(root)
 def read(p):return (r/'src'/p).read_text()
 def strip(s):return '\n'.join(line.replace('export ','') for line in s.splitlines() if not line.startswith('import'))
 def one(p,prefix):
  rows=[line for line in read(p).splitlines() if line.startswith(prefix)]
  assert len(rows)==1,(p,prefix)
  return rows[0].replace('export ','')
 def module(p,exports):return '(()=>{'+strip(read(p))+';return {'+','.join(exports)+'};})()'
 casts=read('app/32b-logic-play-concentration-casting.js');a=casts.index('export function spCastOpts(');b=casts.index('const spStepSel=',a);assert a>=0 and b>a
 return '\n'.join(["const S=state,D=window.__deriveFor(C,S);",'const {canonicalTceSpellBonus}='+module('data/lib/tce-spell-bonus-profiles.js',['canonicalTceSpellBonus'])+';','const {instrumentProfiles,instrumentGenericRow,canonicalInstrumentDefinition}='+module('data/lib/instrument-spell-profiles.js',['instrumentProfiles','instrumentGenericRow','canonicalInstrumentDefinition'])+';','const canonical=canonicalInstrumentDefinition;',one('data/lib/instrument-spells-source.js','const own='),one('data/lib/instrument-spells-source.js','export function instrumentSpellNeedsController('),one('app/05-logic-helpers.js','export function num('),one('app/05-logic-helpers.js','export function clamp('),one('app/08-ui-render-sheet-and-actions.js','export function used('),strip(casts[a:b]),"const resource=D.res.find(row=>row.k===spec.key),spell=C.spells.find(row=>row.instrumentSpell?.id===spec.id&&row.instrumentSpell?.grantId===spec.grantId);return {remaining:resource?resource.max-used(resource.k,resource.max):0,max:resource?.max??null,ordinary:spell?spCastOpts(spell):[],oldAggregate:spell?spCastOpts({n:spell.n,l:spell.l,src:spell.itc.it,itc:{...spell.itc}}):[]};"])
