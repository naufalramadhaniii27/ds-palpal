/* PDFX template fields (the official fillable sheet). Field names are the PDF form names, so they keep the spaces the form has.
   Adding or moving a field is a change here, not in the painters */
export const PX_ABS = ["STR","DEX","CON","INT","WIS","CHA"];
export const PX_MOD_FIELD = {STR:"STRmod", DEX:"DEXmod ", CON:"CONmod", INT:"INTmod", WIS:"WISmod", CHA:"CHamod"};
export const PX_SKILLS = [["Acrobatics","Acrobatics"],["Animal Handling","Animal"],["Arcana","Arcana"],["Athletics","Athletics"],["Deception","Deception "],
  ["History","History "],["Insight","Insight"],["Intimidation","Intimidation"],["Investigation","Investigation "],["Medicine","Medicine"],["Nature","Nature"],
  ["Perception","Perception "],["Performance","Performance"],["Persuasion","Persuasion"],["Religion","Religion"],["Sleight of Hand","SleightofHand"],
  ["Stealth","Stealth "],["Survival","Survival"]];
export const PX_SKILL_DOT = (i) =>{ return "Check Box "+(23+i); };
export const PX_SAVES = ["ST Strength","ST Dexterity","ST Constitution","ST Intelligence","ST Wisdom","ST Charisma"];
export const PX_SAVE_DOT = ["Check Box 11","Check Box 18","Check Box 19","Check Box 20","Check Box 21","Check Box 22"];
export const PX_DEATH_DOT = [["Check Box 12","Check Box 13","Check Box 14"],["Check Box 15","Check Box 16","Check Box 17"]];
export const PX_WEAPON_ROWS = [["Wpn Name","Wpn1 AtkBonus","Wpn1 Damage"],["Wpn Name 2","Wpn2 AtkBonus ","Wpn2 Damage "],["Wpn Name 3","Wpn3 AtkBonus  ","Wpn3 Damage "]];
export const PX_COINS = ["CP","SP","EP","GP","PP"];
/* fields that stay editable in the PDF, for play with only the PDF in hand: hit points, hit dice, inspiration, death saves, coins, spent slots.
   The spent-slot fields come from the spell map, so they are added at render time */
export const PX_LIVE = ["HPCurrent","HPTemp","HD","Inspiration","CP","SP","EP","GP","PP"].concat([].concat.apply([],PX_DEATH_DOT));
/* single-value fields: [model key, field, style, size, align, pad, vfrac] */
export const PX_HEADER = [["classLevel","ClassLevel"],["background","Background"],["slot3","PlayerName"],["species","Race "],["alignment","Alignment"],["xp","XP"]];
export const PX_STATS = [["prof","ProfBonus","Bold",12.5,"center",0,0.5],["inspiration","Inspiration","Bold",12.5,"center",0,0.5],
  ["ac","AC","Bold",19,"center",0,0.55],["initiative","Initiative","Bold",19,"center",0,0.55],["hpMax","HPMax","SemiBold",10,"left",2,0.45],
  ["hpCurrent","HPCurrent","Bold",24,"center",2,0.5],["hpTemp","HPTemp","Bold",20,"center",2,0.5],["hitDiceTotal","HDTotal","SemiBold",8.5,"left",2,0.45],
  ["hitDice","HD","Bold",14,"center",2,0.5],["passive","Passive","Bold",12.5,"center",0,0.5]];
export const PX_LOOKS = [["age","Age"],["height","Height"],["weight","Weight"],["eyes","Eyes"],["skin","Skin"],["hair","Hair"]];
/* text boxes: [model path, field, size, pxTitle 2024, pxTitle 2014]. The pxTitle names the box on the continuation page */
export const PX_BOXES = [["boxes.topA","PersonalityTraits ",7.5,"Species Traits","Personality Traits"],["boxes.topB","Ideals",7.5,"Feats","Ideals"],
  ["boxes.topC","Bonds",7.5,"Weapon Mastery","Bonds"],["boxes.topD","Flaws",7.5,"Defenses & Conditions","Flaws"],
  ["proficiencies","ProficienciesLang",7.8,"Proficiencies & Languages","Other Proficiencies & Languages"],["equipment","Equipment",7.8,"Equipment","Equipment"],
  ["features","Features and Traits",7.8,"Class Features","Features & Traits"]];
export const PX_BOXES_P2 = [["allies","Allies",7.8,"Allies & Organizations","Allies & Organizations"],["backstory","Backstory",7.8,"Backstory & Personality","Character Backstory"],
  ["moreFeatures","Feat+Traits",7.8,"Additional Features & Traits","Additional Features & Traits"],["treasure","Treasure",7.8,"Attuned Items & Treasure","Treasure"]];
export const PX_SPELL_HEAD = [["className","Spellcasting Class 2",14,2],["ability","SpellcastingAbility 2",15,0],["dc","SpellSaveDC  2",17,0],["attack","SpellAtkBonus 2",17,0]];
