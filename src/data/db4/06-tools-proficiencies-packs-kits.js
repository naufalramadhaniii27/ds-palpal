/* v32 RL49: tools from the Tools section of the PHB 2024 (chapter 6). Each kind needs its own proficiency.
   art: Artisan's Tools, craft: the Fast Crafting table (Crafter feat), music: Musical Instruments, game: Gaming Sets, other: the other tools */
var TOOLS={art:["Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools","Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools"],
 craft:["Carpenter's Tools","Leatherworker's Tools","Mason's Tools","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools"],
 music:["Bagpipes","Drum","Dulcimer","Flute","Horn","Lute","Lyre","Pan Flute","Shawm","Viol"],
 game:["Dice Set","Dragonchess Set","Playing Card Set","Three-Dragon Ante Set"],
 other:["Disguise Kit","Forgery Kit","Herbalism Kit","Navigator's Tools","Poisoner's Kit","Thieves' Tools"]};
var TOOL_CAT={art:"Artisan's Tools",craft:"Artisan's Tools (Fast Crafting table)",music:"Musical Instruments",game:"Gaming Sets",other:"Other tools"};
var TOOL_ONE={art:"Artisan's Tools",craft:"Artisan's Tools",music:"Musical Instrument",game:"Gaming Set",other:"tool"};

/* v32 RL49: fixed proficiencies of core subclasses, [class level, name] (PHB 2024: Implements of Mercy, Assassin's Tools) */
var SUB_GRANT={"Warrior of Mercy":{skills:[[3,"Insight"],[3,"Medicine"]],tools:[[3,"Herbalism Kit"]],f:"Implements of Mercy"},"Assassin":{tools:[[3,"Disguise Kit"],[3,"Poisoner's Kit"]],f:"Assassin's Tools"}};

/* v32: Illusionist 3, Improved Illusions: Minor Illusion is always known */
AUTO.Illusionist=(AUTO.Illusionist||[]).concat([[3,"Minor Illusion"]]);

/* v32 RU134: equipment packs (PHB 2024). [container, [[item from GEAR, quantity], ...]]. Adding a pack adds the container and these items inside it */
var PACKS={"Burglar's Pack":["Backpack",[["Ball Bearings",1],["Bell",1],["Candle",10],["Crowbar",1],["Lantern, Hooded",1],["Oil (flask)",7],["Rations (1 day)",5],["Rope",1],["Tinderbox",1],["Waterskin",1]]],
 "Diplomat's Pack":["Chest",[["Fine Clothes",1],["Ink",1],["Ink Pen",5],["Lamp",1],["Case, Map or Scroll",2],["Oil (flask)",4],["Paper",5],["Parchment",5],["Perfume",1],["Tinderbox",1]]],
 "Dungeoneer's Pack":["Backpack",[["Caltrops",1],["Crowbar",1],["Oil (flask)",2],["Rations (1 day)",10],["Rope",1],["Tinderbox",1],["Torch",10],["Waterskin",1]]],
 "Entertainer's Pack":["Backpack",[["Bedroll",1],["Bell",1],["Lantern, Bullseye",1],["Costume",3],["Mirror",1],["Oil (flask)",8],["Rations (1 day)",9],["Tinderbox",1],["Waterskin",1]]],
 "Explorer's Pack":["Backpack",[["Bedroll",1],["Oil (flask)",2],["Rations (1 day)",10],["Rope",1],["Tinderbox",1],["Torch",10],["Waterskin",1]]],
 "Priest's Pack":["Backpack",[["Blanket",1],["Holy Water",1],["Lamp",1],["Rations (1 day)",7],["Robe",1],["Tinderbox",1]]],
 "Scholar's Pack":["Backpack",[["Book",1],["Ink",1],["Ink Pen",1],["Lamp",1],["Oil (flask)",10],["Parchment",10],["Tinderbox",1]]]};
Object.keys(PACKS).forEach(function(p){var P=PACKS[p];ITEMDESC[p]="Comes as a "+P[0].toLowerCase()+" with: "+P[1].map(function(x){return (x[1]>1?x[1]+" \u00d7 ":"")+x[0]}).join(", ")+". Added to your inventory, it opens into the "+P[0].toLowerCase()+" and its items, each with its own quantity and weight."});

/* v32 p21: tools and kits, PHB 2024 p. 220-221 [name, GP, lb]. A Gaming Set has no weight */
[["Alchemist's Supplies",50,8],["Brewer's Supplies",20,9],["Calligrapher's Supplies",10,5],["Carpenter's Tools",8,6],["Cartographer's Tools",15,6],["Cobbler's Tools",5,5],["Cook's Utensils",1,8],["Glassblower's Tools",30,5],["Jeweler's Tools",25,2],["Leatherworker's Tools",5,5],["Mason's Tools",10,8],["Painter's Supplies",10,5],["Potter's Tools",10,3],["Smith's Tools",20,8],["Tinker's Tools",50,10],["Weaver's Tools",1,5],["Woodcarver's Tools",1,5],["Disguise Kit",25,3],["Forgery Kit",15,5],["Herbalism Kit",5,3],["Navigator's Tools",25,2],["Poisoner's Kit",50,2],["Dice Set",0.1,0],["Dragonchess Set",1,0],["Playing Card Set",0.5,0],["Three-Dragon Ante Set",1,0]].forEach(function(t){if(!GEAR.some(function(g){return g[0]===t[0]}))GEAR.push(t)});
