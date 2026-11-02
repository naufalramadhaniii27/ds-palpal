/* M1 for classic scripts (src/fx, src/boot): the same fixers as eslint.modern.config.mjs. In a classic script a top-level var is a property of window,
   so only declarations inside functions change (no-var leaves the top level alone).
   node tools/build/node_modules/eslint/bin/eslint.js --no-config-lookup -c tools/eslint.modern-classic.config.mjs --fix src/fx src/boot */
export default [{
  files: ["**/*.js"],
  languageOptions: { ecmaVersion: 2022, sourceType: "script" },
  rules: {
    "no-var": "error",
    "prefer-const": ["error", { destructuring: "all" }],
    "prefer-arrow-callback": ["error", { allowNamedFunctions: true, allowUnboundThis: true }]
  }
}];
