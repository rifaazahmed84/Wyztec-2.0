const js = require('@eslint/js');
const ts = require('typescript-eslint');
const globals = require('globals');
const hooks = require('eslint-plugin-react-hooks');
module.exports = ts.config(js.configs.recommended, ...ts.configs.recommended, {
  files: ['**/*.{ts,tsx}'], languageOptions: {globals: {...globals.browser, ...globals.node}},
  plugins: {'react-hooks': hooks}, rules: {...hooks.configs.recommended.rules, '@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_'}]}
}, {ignores: ['**/dist/**', '**/node_modules/**']});
