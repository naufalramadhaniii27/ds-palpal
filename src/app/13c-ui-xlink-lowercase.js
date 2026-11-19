/* Responsibility: the lowercase and alias rules of the auto link (B56). Split out of 13-ui-detail-cards.js so that file stays under its size budget. The matcher itself stays in 13. */

/* Lowercase rule words of the 2014 books. Conditions, Darkvision, Advantage and Disadvantage (only in a rule-like place), Bonus Action, Hit Points and Damage Roll link like their capitalised forms. A lowercase spell name links only where the text shows it is a spell: right before "spell" or "(2 charges)", or after "cast", "casts" or "casting" (a spell of several words also after "by"). */
const XL_LC1={blinded:"Blinded",charmed:"Charmed",deafened:"Deafened",frightened:"Frightened",grappled:"Grappled",incapacitated:"Incapacitated",invisible:"Invisible",paralyzed:"Paralyzed",petrified:"Petrified",poisoned:"Poisoned",prone:"Prone",restrained:"Restrained",stunned:"Stunned",unconscious:"Unconscious",darkvision:"Darkvision",advantage:"Advantage",disadvantage:"Disadvantage"};
const XL_LC2={"bonus action":"Bonus Action","bonus actions":"Bonus Action","hit points":"Hit Points","hit point":"Hit Points","damage roll":"Damage Roll","damage rolls":"Damage Roll","bright light":"Bright Light","dim light":"Dim Light"};
const XL_LCW={of:1,the:1,and:1,to:1,in:1,on:1,from:1,with:1};
const XL_ADVN=/^(on|against)$/, XL_ADVP=/^(have|has|having|gain|gains|impose|imposes|grant|grants|give|gives|giving|with)$/;
const XL_SPELLNOTE=/^ spell\b|^ \(\d+ charges?\)/, XL_SPELLOR=/^ or [a-z' -]+ spell\b/, XL_SPELLPRE=/\blevel of the $|(^|\W)(cast|casts|casting)\s$/, XL_SPELLBY=/\bby\s$/;
/* contexts of the capitalised common words: an area shape after "in the" or "every", an attitude after "is", and "your Speed" */
const XL_SHAPEC={"Cube":1,"Sphere":1,"Cylinder":1,"Emanation":1,"Cubes":1,"Spheres":1,"Cylinders":1};
const XL_SHAPEC2=/\b(?:(?:in|within|inside|of|from|into|leaves|enters|entering|leaving) the|every|each|another|other) $/;
const XL_ATT={"Friendly":1,"Hostile":1,"Indifferent":1};
const XL_ATTP=/\b(?:is|are|be|being|becomes?|remains?|stays?|turns?) $/, XL_ATTN=/^ (?:to|toward|towards)\b/;
const XL_SPDP=/\b(?:your|its|their|his|her|the target's|creature's) $/;
const XL_ALIAS=[["Half Cover","Cover",0],["Three-Quarters Cover","Cover",0],["Total Cover","Cover",0],["Hit Point","Hit Points",0],["Cubes","Cube",2],["Spheres","Sphere",2],["Cones","Cone",2],["Cylinders","Cylinder",2]];

function xlTitle(ph){ return ph.split(" ").map((w,n) =>{ return n>0&&XL_LCW[w]===1?w:w.charAt(0).toUpperCase()+w.slice(1); }).join(" "); }
/* true when the common word is a term here: a shape, an attitude or the Speed rule */
export function xlTrig3(w, t, a, e0){
  if(XL_SHAPEC[w]) return XL_SHAPEC2.test(t.slice(Math.max(0,a-16),a));
  if(XL_ATT[w]) return XL_ATTP.test(t.slice(Math.max(0,a-12),a))||XL_ATTN.test(t.slice(e0,e0+12));
  return w==="Speed"&&XL_SPDP.test(t.slice(Math.max(0,a-10),a));
}
/* a spell name that is followed by "spell" is a spell, whatever the sentence before it says */
export function xlSpnPlain(t, e0){ return !/^: Used/.test(t.slice(e0,e0+7))&&!/^ spells?\b/.test(t.slice(e0,e0+8)); }
/* names written another way in the text that point at the same entry: Half Cover and Total Cover open Cover, Hit Point opens Hit Points, the plural shapes open their shape */
export function xlAlias(m){
  const F=m.__f;
  XL_ALIAS.forEach((a) =>{ const k=m[a[1]]; if(!k||m[a[0]]) return; m[a[0]]=[k[0],k[1],a[2]]; const ws=String(a[0]).split(" "); if(!(F[ws[0]]>=ws.length)) F[ws[0]]=ws.length; });
}
/* the words around the name at token i: the text before and the neighbours */
function xlLcCtx(t, i, a, ta, tb, m, selfK, mode){
  const w1=t.slice(a,tb[i]), ok=(j) =>{ return j>=0&&j<ta.length; };
  const put=(cn,L) =>{ if(!cn||cn===selfK) return null; let k=m[cn]; if(!k) return null; if(mode==="b"){ if(k[0]==="spn") return null; if(k[0]==="g") k=["lib","rule|"+k[1]]; } return [k,L]; };
  return {t:t, i:i, a:a, ta:ta, tb:tb, m:m, w1:w1, put:put, pre:t.slice(Math.max(0,a-22),a),
    prevW:ok(i-1)&&t.slice(tb[i-1],a)===" "?t.slice(ta[i-1],tb[i-1]):"", nextW:ok(i+1)&&t.slice(tb[i],ta[i+1])===" "?t.slice(ta[i+1],tb[i+1]):""};
}
function xlLcCond(c){
  if(!XL_LC1[c.w1]) return null;
  if((c.w1==="advantage"||c.w1==="disadvantage")&&!XL_ADVN.test(c.nextW)&&!XL_ADVP.test(c.prevW)) return [null,0];
  return c.put(XL_LC1[c.w1],1);
}
function xlLcPair(c){
  if(!c.nextW) return null;
  const c2=XL_LC2[c.w1+" "+c.nextW]; return c2?c.put(c2,2):null;
}
/* a creature named in lowercase: "statistics for a shadow", "a rat appears" */
function xlLcCreature(c){
  if(!/^[a-z]+$/.test(c.w1)) return null;
  const ck=c.m[xlTitle(c.w1)]; if(!ck||ck[0]!=="cr") return null;
  const e=c.tb[c.i];
  return /^ appears\b/.test(c.t.slice(e,e+9))||/statistics for an? $/.test(c.pre)?c.put(xlTitle(c.w1),1):null;
}
function xlSpellHere(c, e, L, ph){
  const after=c.t.slice(e,e+40);
  return XL_SPELLNOTE.test(after)||XL_SPELLOR.test(after)||XL_SPELLPRE.test(c.pre)||(L>=2&&XL_SPELLBY.test(c.pre));
}
/* a spell name of one to four words, written in lowercase */
function xlLcSpell(c){
  for(let L=Math.min(4,c.ta.length-c.i);L>=1;L--){
    let ok=true; for(let j=c.i+1;j<c.i+L;j++){ if(c.t.slice(c.tb[j-1],c.ta[j])!==" "){ ok=false; break; } }
    const e=c.tb[c.i+L-1], ph=c.t.slice(c.a,e), k=ok&&/^[a-z' \u0001-]+$/.test(ph)?c.m[xlTitle(ph)]:null;
    if(!k||k[0]!=="spn"||!xlSpellHere(c, e, L, ph)) continue;
    const r=c.put(xlTitle(ph),L); if(r) return r;
  }
  return null;
}
export function xlScanLcMore(t, i, a, ta, tb, m, selfK, mode){
  const c=xlLcCtx(t, i, a, ta, tb, m, selfK, mode);
  return xlLcCond(c)||xlLcPair(c)||xlLcCreature(c)||xlLcSpell(c)||[null,0];
}
