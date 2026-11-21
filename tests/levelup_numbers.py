#!/usr/bin/env python3
"""Level up 1 -> 20 one level at a time, every class, 2024 and 2014 rules, one browser session.
  python3 tests/levelup_numbers.py [-v]
Per level: the choices that level adds (Ability Score Improvement or feat, Epic Boon, subclass, Fighting Style, Expertise, Metamagic,
Eldritch Invocations, Pact Boon, Weapon Mastery count), the builder marks the new choices open before they are made (choiceList done),
Quick Build fills them, earlier choices stay as they were, no choice is left open and no rule issue is left (__bldIssuesFor), and max HP is the class Hit Die at level 1 plus the
fixed average (die/2 + 1) each later level plus Con modifier per level (PHB 2014 p. 15, PHB 2024 p. 23). Rolled HP replaces the average.
Multiclass: the multiclass ability prerequisite of 13 (PHB 2014 p. 163, PHB 2024 p. 25) is flagged, and a multiclass part gets its own
Ability Score Improvement levels (2014 level 19 is an improvement, 2024 level 19 an Epic Boon). Exit 1 on any difference."""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

STD = [4, 8, 12, 16, 19]
ASI = {"Fighter": [4, 6, 8, 12, 14, 16, 19], "Rogue": [4, 8, 10, 12, 16, 19]}
SUB14 = {"Cleric": 1, "Sorcerer": 1, "Warlock": 1, "Druid": 2, "Wizard": 2}
FS = {"Fighter": 1, "Paladin": 2, "Ranger": 2}
# expected {level: count} of picks per choice kind, per edition and class
EXP = {("2014", "Rogue"): {1: 2, 6: 2}, ("2024", "Rogue"): {1: 2, 6: 2}, ("2014", "Bard"): {3: 2, 10: 2}, ("2024", "Bard"): {2: 2, 9: 2},
       ("2024", "Ranger"): {2: 1, 9: 2}, ("2024", "Wizard"): {2: 1}}
META = {"2014": {3: 2, 10: 1, 17: 1}, "2024": {2: 2, 10: 2, 17: 2}}
INV = {"2014": {2: 2, 5: 1, 7: 1, 9: 1, 12: 1, 15: 1, 18: 1}, "2024": {1: 1, 2: 2, 5: 2, 7: 1, 9: 1, 12: 1, 15: 1, 18: 1}}
WM = {"Fighter": [3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 6, 6, 6, 6, 6], "Barbarian": [2, 2, 2, 3, 3, 3, 3, 3, 3, 4] + [4] * 10,
      "Paladin": [2] * 20, "Ranger": [2] * 20, "Rogue": [2] * 20}
HD = {"Barbarian": 12, "Fighter": 10, "Paladin": 10, "Ranger": 10, "Sorcerer": 6, "Wizard": 6}
CLS = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]

JS = r"""([CLS])=>{const R={'2014':['Human (2014)','Soldier (2014)',{phb14:true,dmg14:true}],'2024':['Human','Soldier',{}]},out=[];
const kind=c=>c.t==="feat"?(/Epic Boon/.test(c.title)?"boon":"asi"):c.t==='sub'?'sub':c.t==='fs'&&!/^sfs/.test(c.key)?'fs':c.t==='exp'?'exp':c.t==='wm'?'wm':
 /^Metamagic/.test(c.title||'')?'meta':/^Eldritch Invocations/.test(c.title||'')?'inv':/^Pact Boon/.test(c.title||'')?'pact':null;
for(const rs of ['2024','2014'])for(const cls of CLS){const subs=((window.__bldLists(rs)||{}).subs||{})[cls]||[],
  boon=Object.keys(FEATS).filter(n=>FEATS[n].cat==='E'&&!FEATS[n].hp&&!FEATS[n].dt&&!FEATS[n].pick&&!FEATS[n].asi2&&Array.isArray(FEATS[n].asi))[0];
 let b=window.__bldFuzz({sp:R[rs][0],bg:R[rs][1],rs,src:R[rs][2],cls,sub:subs[0]||'',lv:1,arr:[15,14,13,12,10,8],b2:0,b1:0}).b,row={rs,cls,lv:[]};let nf=0;
 for(let lv=1;lv<=20;lv++){const L={lv};if(lv>1){b.level=lv;const cl=window.__bldChoiceList(b);
   L.open=[...new Set(cl.filter(c=>c.lvl===lv&&!c.done&&!c.mc).map(kind).filter(x=>x&&x!=='wm'))].sort();
   if(!b.sub&&cl.some(c=>c.t==='sub'))b.sub=subs[0]||'';
   cl.forEach(c=>{if(c.t!=='feat'||c.mc||b.ch[c.key]!=null)return;const a=['INT','WIS','CHA','DEX','STR','CON'][nf++%6];b.ch[c.key]=/Epic Boon/.test(c.title)?{feat:boon,a1:FEATS[boon].asi[0]}:{feat:'Ability Score Improvement',a1:a,a2:a}});/* Quick Build leaves feats to the player */const ch0=JSON.stringify(b.ch),sub0=b.sub;
   b=window.__bldFillFor(b);const prev=JSON.parse(ch0);const kept=(a,n)=>Array.isArray(a)&&Array.isArray(n)?a.every(x=>n.indexOf(x)>=0):JSON.stringify(a)===JSON.stringify(n);/* a list that grows (Weapon Mastery, Wild Shape forms) keeps the earlier picks */
   L.lost=Object.keys(prev).filter(k=>!kept(prev[k],b.ch[k]));if(sub0&&b.sub!==sub0)L.lost.push('sub')}
  const cl=window.__bldChoiceList(b);L.k={};cl.filter(c=>c.lvl===lv&&!c.mc).forEach(c=>{const k=kind(c);if(k)L.k[k]=(L.k[k]||0)+(c.t==='feat'||c.t==='sub'||c.t==='fs'?1:(c.n||1))});
  L.undone=cl.filter(c=>!c.done&&!/add a fitting spell/.test(c.title)).map(c=>c.title);L.wm=cl.filter(c=>c.t==='wm'&&!c.mc).reduce((t,c)=>t+(c.n||1),0);L.iss=window.__bldIssuesFor(b);const C=window.__bldSheetFor(b);window.__sheetApply(C,false);const D=window.__D();L.hp=D.hpmax;L.hpb=(C.hpBonus||[]).reduce((t,x)=>t+(+x.v||0),0);
  L.con=D.mod.CON;row.lv.push(L)}
 if(cls==='Fighter'){const r=JSON.parse(JSON.stringify(b));r.hpMode='roll';r.hpr={Fighter2:1,Fighter3:10};window.__sheetApply(window.__bldSheetFor(r),false);row.roll=window.__D().hpmax-window.__D().mod.CON*20}
 out.push(row)}
/* multiclass: prerequisite and the part's own improvement levels */
const mc=[];for(const rs of ['2024','2014']){const b=window.__bldFuzz({sp:R[rs][0],bg:R[rs][1],rs,src:R[rs][2],cls:'Fighter',sub:'',lv:1,arr:[15,14,13,12,10,8],b2:0,b1:0}).b;
 b.base={STR:15,DEX:12,CON:14,INT:8,WIS:10,CHA:13};b.method='manual';b.mc=[{cls:'Wizard',sub:'',lv:19}];const m=window.__bldIssuesFor(b).filter(x=>/Multiclass prerequisite/.test(x));
 b.base.INT=13;const ok=window.__bldIssuesFor(b).filter(x=>/Multiclass prerequisite/.test(x));const f=window.__bldChoiceList(b).filter(c=>c.mc===0&&c.t==='feat').map(c=>c.lvl+(/Epic Boon/.test(c.title)?"E":""));
 mc.push({rs,miss:m.length,ok:ok.length,feats:f})}
return {out,mc}}"""

rows = []
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(600000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    pg.wait_for_function("()=>typeof window.__bldFuzz==='function'&&typeof window.__bldFillFor==='function'")
    R = pg.evaluate(JS, [CLS]); br.close()
for row in R["out"]:
    rs, cls = row["rs"], row["cls"]; hd = HD.get(cls, 8); ex = EXP.get((rs, cls), {})
    al = ASI.get(cls, STD); sl = SUB14.get(cls, 3) if rs == "2014" else 3
    for L in row["lv"]:
        lv, k = L["lv"], L["k"]; lab = "%s %s %d" % (rs, cls, lv)
        want = {"asi": 1 if lv in al and not (rs == "2024" and lv == 19) else 0, "boon": 1 if rs == "2024" and lv == 19 else 0,
                "sub": 1 if lv == sl else 0, "fs": 1 if FS.get(cls) == lv else 0, "exp": ex.get(lv, 0),
                "meta": META[rs].get(lv, 0) if cls == "Sorcerer" else 0, "inv": INV[rs].get(lv, 0) if cls == "Warlock" else 0,
                "pact": 1 if cls == "Warlock" and rs == "2014" and lv == 3 else 0}
        for kk, v in want.items(): rows.append((lab + " " + kk, v, k.get(kk, 0)))
        if rs == "2024" and cls in WM: rows.append((lab + " Weapon Mastery", WM[cls][lv - 1], L["wm"]))
        rows.append((lab + " max HP", hd + (lv - 1) * (hd // 2 + 1) + L["con"] * lv + L["hpb"], L["hp"]))
        rows.append((lab + " rule issues after fill", [], L["iss"]))
        if lv > 1:
            rows.append((lab + " earlier choices kept", [], L["lost"]))
            rows.append((lab + " new choices marked open before Quick Build fills them", sorted(x for x, v in want.items() if v), L["open"]))
        rows.append((lab + " open choices after fill", [], L["undone"]))
    if "roll" in row: rows.append((rs + " Fighter 20 rolled HP 1 and 10 at levels 2 and 3", 10 + 1 + 10 + 17 * 6 + row["lv"][-1]["hpb"], row["roll"]))
for m in R["mc"]:
    rows.append((m["rs"] + " multiclass INT 8 flagged", True, m["miss"] > 0)); rows.append((m["rs"] + " multiclass INT 13 not flagged", 0, m["ok"]))
    rows.append((m["rs"] + " multiclass Wizard 19 feat levels", ["4", "8", "12", "16", "19E" if m["rs"] == "2024" else "19"], m["feats"]))
bad = 0
for lab, want, got in rows:
    ok = want == got; bad += not ok
    if not ok or "-v" in sys.argv: print("%s %s%s" % ("ok  " if ok else "FAIL", lab, "" if ok else ": expected %r got %r" % (want, got)))
print("levelup_numbers: %d classes x 2 rule sets x 20 levels, %d values, %d wrong" % (len(CLS), len(rows), bad)); sys.exit(1 if bad or not rows else 0)
