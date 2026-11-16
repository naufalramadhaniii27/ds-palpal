DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B7: fixed skill proficiencies of subclasses (own wording in the book records; effect only here). */
(function(){
var S=GX.sub,add=function(n,e){S[n]=(S[n]||[]).concat(e)};
add("Path of Heavy Metal",[{n:"Rocker (skills)",l:3,skillProf:["Performance"]}]);
add("Path of the Herald",[{n:"Oral Tradition (skills)",l:3,skillProf:["History", "Performance"]}]);
add("Prophecy Domain",[{n:"A Path Foretold (skills)",l:3,skillProf:["History", "Insight"]}]);
add("Void Domain",[{n:"Messenger of the Void (skills)",l:3,skillProf:["Arcana", "Intimidation"]}]);
add("Hunt Domain",[{n:"Blessing of the Hunter (skills)",l:3,skillProf:["Survival"]}]);
add("Courtesan",[{n:"Honeyed Words (skills)",l:3,skillProf:["Deception", "Persuasion"]}]);
add("Circle of the Blighted",[{n:"Blighted Shape (skills)",l:3,skillProf:["Intimidation"]}]);
add("Arcane Archer",[{n:"Arcane Archer Lore (skills)",l:3,skillProf:["Arcana", "Nature"]}]);
add("Couatl Herald",[{n:"One of the People (skills)",l:3,skillProf:["Insight", "Persuasion"]}]);
add("Prescient Knight",[{n:"Bonus Proficiency (skills)",l:3,skillProf:["Arcana"]}]);
add("Warrior of Mystic Brews",[{n:"Bonus Proficiencies (skills)",l:3,skillProf:["Performance"]}]);
add("Warrior of Intoxication",[{n:"Bonus Proficiencies (skills)",l:3,skillProf:["Performance"]}]);
add("Occultist Guild",[{n:"Acolyte of the Occult (skills)",l:3,skillProf:["Arcana"]}]);
add("Oath of Thunder",[{n:"Bonus Proficiency (skills)",l:3,skillProf:["Stealth"]}]);
add("Beast Trainer",[{n:"Beast Whisperer (skills)",l:3,skillProf:["Animal Handling"]}]);
add("Scout",[{n:"Survivalist (skills)",l:3,skillProf:["Nature", "Survival"]}]);
add("Farseer",[{n:"Blood of the Seer (skills)",l:3,skillProf:["History", "Insight"]}]);
})();
