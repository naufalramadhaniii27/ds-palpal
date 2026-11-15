"""Actual native cfx and ability-qualified check consumer for projected FX sheets."""
from pathlib import Path
def actual_perception_consumer(root):
 r=Path(root)
 def read(path):return (r/'src'/path).read_text()
 def strip(text):return '\n'.join(line.replace('export ','') for line in text.splitlines() if not line.startswith('import '))
 def one(path,prefix):
  rows=[line for line in read(path).splitlines() if line.startswith(prefix)]
  assert len(rows)==1,(path,prefix)
  return rows[0].replace('export ','')
 def section(path,start,end):
  text=read(path);assert text.count(start)==1 and text.count(end)==1,(path,start,end)
  return strip(text[text.index(start):text.index(end,text.index(start))])
 def module(path,exports,imports=''):
  return '(()=>{'+imports+strip(read(path))+';return {'+','.join(exports)+'};})()'
 code=["const S=state||{},D=window.__deriveFor(C,S),env={};const lateGet=key=>key==='C'?C:undefined;"]
 code+=['const {canonicalTceSpellBonus}='+module('data/lib/tce-spell-bonus-profiles.js',['canonicalTceSpellBonus'])+';']
 code+=['const {perceptionItemProfile,perceptionItemDefinition,canonicalPerceptionItemDefinition}='+module('data/lib/perception-item-profiles.js',['perceptionItemProfile','perceptionItemDefinition','canonicalPerceptionItemDefinition'])+';']
 code+=[one('data/lib/attunement.js','export function itemQuantity(')]
 code+=['const {perceptionItemFlag}='+module('data/lib/perception-item-source.js',['perceptionItemFlag'],'const canonical=canonicalPerceptionItemDefinition;')+';']
 code+=['const {criticalDice,damageType,DAMAGE_TYPES}='+module('data/lib/attack-target.js',['criticalDice','damageType','DAMAGE_TYPES'])+';']
 code+=['const {divineStrikeDescriptorProblems,readTurnDamageState}='+module('data/lib/turn-damage.js',['divineStrikeDescriptorProblems','readTurnDamageState'])+';']
 code+=['const {ordersWrathProfileProblems,ordersWrathStateProblems}='+module('data/lib/orders-wrath.js',['ordersWrathProfileProblems','ordersWrathStateProblems'])+';']
 code+=[one('app/02-data-default-character.js','export var ABK ='),one('app/05-logic-helpers.js','export function num('),one('app/03-data-glossary.js','export function x14('),one('app/08b-ui-render-summaries-actions.js','export function featAll(')]
 code+=[one('app/32b-logic-play-concentration-casting.js','export function clsLvls('),one('app/32b-logic-play-concentration-casting.js','export function lvOf('),one('app/32b-logic-play-concentration-casting.js','export function hasFeat('),one('app/32b-logic-play-concentration-casting.js','export var INCAP=')]
 code+=[section('app/33-logic-play-rage-conditions.js','export var MODES=','export function modeFix('),one('app/33-logic-play-rage-conditions.js','export function rageDmg(')]
 modes=read('app/33-logic-play-rage-conditions.js');assert modes.count('export var PADV=[')==1;code+=[strip(modes[modes.index('export var PADV=['):])]
 code+=[section('app/34-ui-situations.js','const SIT=[','/* the tags on one attack row:')]
 code+=[section('app/34b-ui-combat-effects-modes.js','function cfx(){','/* one tag per kind.')]
 code+=[one('app/34b-ui-combat-effects-modes.js','function itemSkillFlag('),one('app/34b-ui-combat-effects-modes.js','function skillFlagApplies('),one('app/34b-ui-combat-effects-modes.js','export function cfSkill('),'D.cf=cfx();return skill?cfSkill(skill):D.cf;']
 return '\n'.join(code)
