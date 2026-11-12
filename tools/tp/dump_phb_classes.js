// Dumps CLASSES (Player's Handbook 2024 classes of the app) and CF_FULL to a JSON file. Used by tools/tp_wow.py. Usage: node dump_phb_classes.js <repo dir> <out file>
var fs = require("fs"), vm = require("vm"), root = process.argv[2], out = process.argv[3];
var ctx = {}; vm.createContext(ctx);
vm.runInContext('var ALLSK=["Acrobatics","Animal Handling","Arcana","Athletics","Deception","History","Insight","Intimidation","Investigation","Medicine","Nature","Perception","Performance","Persuasion","Religion","Sleight of Hand","Stealth","Survival"]', ctx);
["db2-phb-classes-a.js", "db3-phb-classes-b.js", "cffull-class-feature-text.js"].forEach(function (f) { vm.runInContext(fs.readFileSync(root + "/src/data/" + f, "utf8"), ctx); });
fs.writeFileSync(out, JSON.stringify({ CLASSES: ctx.CLASSES, CF_FULL: ctx.CF_FULL }));
