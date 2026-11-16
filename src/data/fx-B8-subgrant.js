/* fx data batch B8: fixed tool, armor, weapon and skill training of subclasses that had only text (SUB_GRANT feeds grantTools and the proficiency lines). A row already present is kept. */
(function(){
if(typeof SUB_GRANT==="undefined")return;
var G=function(s,f,o){if(SUB_GRANT[s])return;o.f=f;SUB_GRANT[s]=o};
G("Enforcer","Bonus Proficiencies",{"armor": [[3, "Medium"]], "weapons": [[3, "Martial"]]});
G("Way of the Bow","Bow Arts",{"weapons": [[3, "Longbow, Shortbow"]]});
G("Way of the Flagellant","Ascetic Implements",{"weapons": [[3, "Flail, Whip"]]});
G("Tunnel Watcher","Bonus Proficiencies",{"tools": [[3, "Thieves' Tools"], [3, "Mason's Tools"]]});
G("Maverick","Tool Proficiency",{"tools": [[3, "Tinker's Tools"]]});
G("Hunt Domain","Bonus Proficiency",{"weapons": [[3, "Martial"]]});
G("Mercy Domain","Bonus Proficiencies",{"skills": [[3, "Medicine"]], "tools": [[3, "Poisoner's Kit"]], "armor": [[3, "Heavy"]], "weapons": [[3, "Martial"]]});
G("Serpent Domain","Envenomed",{"skills": [[3, "Deception"]], "tools": [[3, "Poisoner's Kit"]], "weapons": [[3, "Martial with Finesse"]]});
G("Inquisition Domain (2014)","Bonus Proficiencies",{"armor": [[3, "Heavy"]], "weapons": [[3, "Martial"]]});
G("Sapper","Combat Engineer",{"tools": [[3, "Alchemist's Supplies"], [3, "Carpenter's Tools"], [3, "Mason's Tools"], [3, "Tinker's Tools"]]});
G("Warrior of Venom","Potent Arsenal",{"tools": [[3, "Poisoner's Kit"]]});
G("School of Automata","Bonus Proficiencies",{"skills": [[3, "Technology"]], "tools": [[3, "Mechanist's Tools"]]});
G("College of the Cat","Bonus Proficiencies",{"skills": [[3, "Acrobatics"], [3, "Stealth"]], "tools": [[3, "Thieves' Tools"]]});
G("Way of the Tipsy Monkey","Adaptive Fighting",{"weapons": [[3, "Improvised weapons"]]});
G("Path of the Wrecker (2014)","Disarm Foe",{"weapons": [[10, "Improvised weapons"]]});
})();
