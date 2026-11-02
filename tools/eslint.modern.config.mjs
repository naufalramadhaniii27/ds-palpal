/* M1: the fixers that turn old syntax into ES2022. Run from the repo root:
   node tools/build/node_modules/eslint/bin/eslint.js --no-config-lookup -c tools/eslint.modern.config.mjs --fix src/tg
   no-var and prefer-const only change what is safe (no use before the declaration, no closure over a loop variable, no redeclaration).
   prefer-arrow-callback changes callbacks that use neither this nor arguments. Only module folders run through it: a top-level var in a classic script is a property of window and must stay. */
export default [{
  files: ["**/*.js"],
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
  rules: {
    "no-var": "error",
    "prefer-const": ["error", { destructuring: "all" }],
    "prefer-arrow-callback": ["error", { allowNamedFunctions: true, allowUnboundThis: true }]
  }
}];
